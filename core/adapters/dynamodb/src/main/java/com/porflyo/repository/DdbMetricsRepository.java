package com.porflyo.repository;

import static com.porflyo.common.DdbKeys.METRICS_PK_PREFIX;
import static com.porflyo.common.DdbKeys.METRICS_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.Item.DdbPortfolioMetricsItem;
import com.porflyo.common.DdbKeys;
import com.porflyo.configuration.DdbConfig;
import com.porflyo.mapper.DdbPortfolioMetricsMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioMetrics;
import com.porflyo.ports.PortfolioMetricsRepository;
import com.porflyo.schema.PortfolioMetricsTableSchema;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.BatchWriteItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.DeleteItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.WriteBatch;

@Singleton
@Requires(beans = DdbConfig.class)
public class DdbMetricsRepository implements PortfolioMetricsRepository {

    private final Logger log = LoggerFactory.getLogger(DdbMetricsRepository.class);
    private final DynamoDbTable<DdbPortfolioMetricsItem> table;
    private final DynamoDbEnhancedClient enhancedClient;

    @Inject
    public DdbMetricsRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig) {
        this.enhancedClient = enhanced;
        this.table = enhanced.table(
            dynamoDbConfig.metricsTable(),
            PortfolioMetricsTableSchema.SCHEMA);
    }


    // ────────────────────────── Save ──────────────────────────

    @Override
    public void saveTodayMetrics(PortfolioMetrics metrics) {
        table.putItem(DdbPortfolioMetricsMapper.toItem(List.of(metrics)));
        log.debug("Saved metrics for portfolio: {}", metrics.portfolioId().value());    
    }


    // ────────────────────────── get ──────────────────────────

    @Override
    public List<PortfolioMetrics> findPortfolioMetrics(PortfolioId portfolioId, int monthsBack) {
        if (monthsBack < 1) monthsBack = 1;

        String pk = pk(METRICS_PK_PREFIX, portfolioId.value());
        
        // Calculate oldest month we need
        YearMonth oldestMonth = YearMonth.now().minusMonths(monthsBack - 1);
        String oldestSkPrefix = METRICS_SK_PREFIX + oldestMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        // Use range query: SK >= "M#oldest-yyyy-MM" to get all months from oldest to current
        QueryEnhancedRequest req = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.sortGreaterThanOrEqualTo(k -> k.partitionValue(pk).sortValue(oldestSkPrefix)))
            .build();

        List<PortfolioMetrics> out = table.query(req)
            .items()
            .stream()
            .map(DdbPortfolioMetricsMapper::fromItem)
            .flatMap(List::stream)
            .sorted(Comparator.comparing(PortfolioMetrics::date).reversed())
            .toList();

        log.debug("Found {} metrics for portfolio: {} (monthsBack={})", out.size(), portfolioId.value(), monthsBack);
        return out;
    }

    @Override
    public List<PortfolioMetrics> findPortfolioMetricsOneMonth(PortfolioId portfolioId, int monthsBack) {
        if (monthsBack < 0) monthsBack = 0;

        String pk = pk(METRICS_PK_PREFIX, portfolioId.value());
        
        YearMonth targetMonth = YearMonth.now().minusMonths(monthsBack);
        String targetSkPrefix = METRICS_SK_PREFIX + targetMonth.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        
        // Use sortBeginsWith to get all shards for the specific month
        QueryEnhancedRequest req = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.sortBeginsWith(k -> k.partitionValue(pk).sortValue(targetSkPrefix)))
            .build();

        List<PortfolioMetrics> out = table.query(req)
            .items()
            .stream()
            .map(DdbPortfolioMetricsMapper::fromItem)
            .flatMap(List::stream)
            .sorted(Comparator.comparing(PortfolioMetrics::date, Comparator.reverseOrder()))
            .toList();

        log.debug("Found {} metrics for portfolio: {} for month {}", out.size(), portfolioId.value(), targetMonth);
        return out;
    }

    @Override
    public Optional<PortfolioMetrics> getTodayMetrics(PortfolioId portfolioId) {
        Key key = buildTodayMetricsKey(portfolioId);
        DdbPortfolioMetricsItem item = table.getItem(r -> r.key(key));

        if (item == null) {
            log.debug("No metrics item found for today for portfolio: {}", portfolioId.value());
            return Optional.empty();
        }

        List<PortfolioMetrics> list = DdbPortfolioMetricsMapper.fromItem(item);
        LocalDate today = LocalDate.now();

        Optional<PortfolioMetrics> result = list.stream()
            .filter(pm -> pm.date().equals(today))
            .findFirst();
            
        log.debug("Today's metrics found for portfolio: {} = {}", portfolioId.value(), result.isPresent());
        return result;
    }

    
    // ────────────────────────── Delete ──────────────────────────

    @Override
    public void deleteAllMetrics(PortfolioId portfolioId) {
        String pk = pk(METRICS_PK_PREFIX, portfolioId.value());

        // Only delete items with SK starting with "M#" (month-based metrics)
        // Leave "S#" (slot-based metrics) for SlotMetricsRepository to handle
        QueryEnhancedRequest req = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.sortBeginsWith(k -> k.partitionValue(pk).sortValue(METRICS_SK_PREFIX)))
            .build();

        // DynamoDB does not support conditional deletes; collect the SKs to delete and use batchWrite
        var items = table.query(req).items();

        final int BATCH_LIMIT = 25;         // DynamoDB batch write limit
        int deleted = 0;

        List<Key> keys = items.stream()
            .map(it -> Key.builder()
                    .partitionValue(pk)
                    .sortValue(it.getSK())
                    .build())
            .toList();

        for (int i = 0; i < keys.size(); i += BATCH_LIMIT) {
            final int end = Math.min(i + BATCH_LIMIT, keys.size());

            WriteBatch.Builder<DdbPortfolioMetricsItem> write =
                WriteBatch.builder(DdbPortfolioMetricsItem.class)
                        .mappedTableResource(table);

            keys.subList(i, end).stream()
                .map(key -> DeleteItemEnhancedRequest.builder().key(key).build())
                .forEach(write::addDeleteItem);

            BatchWriteItemEnhancedRequest batchReq = BatchWriteItemEnhancedRequest.builder()
                .writeBatches(write.build())
                .build();

            enhancedClient.batchWriteItem(batchReq);
            deleted += (end - i);
        }


        log.debug("Deleted {} month-based metrics items for portfolio: {}", deleted, portfolioId.value());
    }


    // ────────────────────────── Private Methods ──────────────────────────

    private Key buildTodayMetricsKey(PortfolioId id) {
        String pk = pk(METRICS_PK_PREFIX, id.value());
        String sk = DdbKeys.skTodayMonthShard();

        return Key.builder()
                .partitionValue(pk)
                .sortValue(sk)
                .build();
    }
    
}
