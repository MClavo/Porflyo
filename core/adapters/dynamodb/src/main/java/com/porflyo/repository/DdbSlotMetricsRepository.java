package com.porflyo.repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.Item.DdbSlotMetricsItem;
import com.porflyo.common.DdbKeys;
import com.porflyo.configuration.DdbConfig;
import com.porflyo.dto.DetailSlot;
import com.porflyo.mapper.DdbSlotMetricsMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.metrics.PortfolioHeatmap;
import com.porflyo.model.metrics.ProjectMetricsWithId;
import com.porflyo.ports.SlotMetricsRepository;
import com.porflyo.schema.SlotMetricsTableSchema;

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
public class DdbSlotMetricsRepository implements SlotMetricsRepository {
    private final Logger log = LoggerFactory.getLogger(SlotMetricsRepository.class);
    private final DynamoDbTable<DdbSlotMetricsItem> table;
    private final DynamoDbEnhancedClient enhancedClient;


    @Inject
    public DdbSlotMetricsRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig) {
        this.enhancedClient = enhanced;
        this.table = enhanced.table(
            dynamoDbConfig.metricsTable(),
            SlotMetricsTableSchema.SCHEMA);
    }


    @Override
    public void saveTodayMetrics(
            PortfolioId portfolioId,
            PortfolioHeatmap heatmap,
            List<ProjectMetricsWithId> projects) 
            {
        table.putItem(DdbSlotMetricsMapper.toItem(portfolioId, heatmap, projects));
        log.debug("Saved HeatMap and Project metrics for portfolio: {}", portfolioId.value());
    }

    @Override
    public List<DetailSlot> getAllMetrics(PortfolioId portfolioId) {
        String PK = DdbKeys.pk(DdbKeys.METRICS_PK_PREFIX, portfolioId.value());

        QueryEnhancedRequest req = QueryEnhancedRequest.builder()
            .queryConditional(QueryConditional.sortBeginsWith(
                k -> k.partitionValue(PK).sortValue(DdbKeys.METRICS_SLOT_SK_PREFIX)))
            .build();

        List<DetailSlot> slots = table.query(req)
            .items()
            .stream()
            .map(DdbSlotMetricsMapper::toDomain)
            .sorted(Comparator.comparing(DetailSlot::date).reversed()) // desc
            .toList();

        
        log.debug("Fetched {} detail slots for portfolio: {}", slots.size(), portfolioId.value());
        return slots;
    }

    @Override
    public Optional<DetailSlot> getTodayMetrics(PortfolioId portfolioId) {
        Key key = buildKey(portfolioId, DdbKeys.skTodaySlot());

        DdbSlotMetricsItem item = table.getItem(r -> r.key(key));

        if (item == null) {
            log.debug("No metrics item found for today for portfolio: {}", portfolioId.value());
            return Optional.empty();
        }

        DetailSlot detailSlot = DdbSlotMetricsMapper.toDomain(item);
        log.debug("Today's metrics found for portfolio: {} = {}", portfolioId.value(), detailSlot);
        return Optional.of(detailSlot);
    }

    @Override
    public void deleteAllMetrics(PortfolioId portfolioId) {
        final int BATCH_LIMIT = 25;         // DynamoDB batch write limit

        List<Key> keys = new ArrayList<>();
        
        for(int i=0; i<DdbKeys.METRICS_SLOT_COUNT; i++) {
            String sk = DdbKeys.sk(DdbKeys.METRICS_SLOT_SK_PREFIX, String.valueOf(i));
            keys.add(buildKey(portfolioId, sk));
        }

        for (int i = 0; i < keys.size(); i += BATCH_LIMIT) {
            final int end = Math.min(i + BATCH_LIMIT, keys.size());

            WriteBatch.Builder<DdbSlotMetricsItem> write =
                WriteBatch.builder(DdbSlotMetricsItem.class)
                        .mappedTableResource(table);

            keys.subList(i, end).stream()
                .map(key -> DeleteItemEnhancedRequest.builder().key(key).build())
                .forEach(write::addDeleteItem);

            BatchWriteItemEnhancedRequest batchReq = BatchWriteItemEnhancedRequest.builder()
                .writeBatches(write.build())
                .build();

            enhancedClient.batchWriteItem(batchReq);
        }

        log.debug("Deleted {} Heatmaps and Projects (slots) metrics for portfolio: {}", DdbKeys.METRICS_SLOT_COUNT, portfolioId.value());
    }
    

    private Key buildKey(PortfolioId id, String sortKey) {
        return Key.builder()
            .partitionValue(DdbKeys.pk(DdbKeys.METRICS_PK_PREFIX, id.value()))
            .sortValue(sortKey)
            .build();
    }
}
