package com.porflyo.infrastructure.adapters.output.dynamodb.repository;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.PK_PREFIX_USER;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.SK_PREFIX_SAVED_SECTION;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.sk;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.application.ports.output.SavedSectionRepository;
import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbSavedSectionItem;
import com.porflyo.infrastructure.adapters.output.dynamodb.mapper.DdbSavedSectionMapper;
import com.porflyo.infrastructure.adapters.output.dynamodb.schema.SavedSectionTableSchema;
import com.porflyo.infrastructure.configuration.DdbConfig;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import jakarta.validation.constraints.NotNull;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

@Singleton
@Requires(beans = DdbConfig.class)
public class DbdSavedSectionRepository implements SavedSectionRepository {

    private static final Logger log = LoggerFactory.getLogger(DbdSavedSectionRepository.class);
    private final DynamoDbTable<DdbSavedSectionItem> table;

    @Inject
    DbdSavedSectionRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig) {
        this.table = enhanced.table(
            dynamoDbConfig.tableName(),
            SavedSectionTableSchema.SCHEMA);
    }


    // ────────────────────────── Save ──────────────────────────

    @Override
    public @NotNull SavedSection save(UserId userId, SavedSection section) {
        table.putItem(DdbSavedSectionMapper.toItem(userId, section));
        log.debug("Saved section: {}", section.id().value());
        return section;
    }


    // ────────────────────────── Find ──────────────────────────

    @Override
    public List<SavedSection> findByUserId(UserId userId) {
        
        String pk = pk(PK_PREFIX_USER, userId.value());

        // Query for all saved sections of the user
        QueryConditional query = QueryConditional
        .keyEqualTo(k -> k.partitionValue(pk));

        List<SavedSection> sections = table.query(r -> r.queryConditional(query))
            .items()
            .stream()
            .map(DdbSavedSectionMapper::toDomain)
            .toList();

        log.debug("Found {} sections for user: {}", sections.size(), userId.value());
        return sections;
    }


    // ────────────────────────── Delete ──────────────────────────

    @Override
    public void delete(UserId userId, SectionId sectionId) {
        String pk = pk(PK_PREFIX_USER, userId.value());
        String sk = sk(SK_PREFIX_SAVED_SECTION, sectionId.value());

        table.deleteItem(r -> r.key(Key.builder()
            .partitionValue(pk)
            .sortValue(sk)
            .build()));

        log.debug("Deleted section: {} for user: {}", sectionId.value(), userId.value());
    }
}
