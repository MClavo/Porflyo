package com.porflyo.repository;

import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_SAVED_SECTION_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;
import static com.porflyo.common.DdbKeys.sk;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.ports.output.SavedSectionRepository;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.Item.DdbSavedSectionItem;
import com.porflyo.mapper.DdbSavedSectionMapper;
import  com.porflyo.schema.SavedSectionTableSchema;
import com.porflyo.configuration.DdbConfig;

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

    private final DdbSavedSectionMapper mapper;
    private static final Logger log = LoggerFactory.getLogger(DbdSavedSectionRepository.class);
    private final DynamoDbTable<DdbSavedSectionItem> table;

    @Inject
    DbdSavedSectionRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig, DdbSavedSectionMapper mapper) {
        this.table = enhanced.table(
            dynamoDbConfig.tableName(),
            SavedSectionTableSchema.SCHEMA);
        this.mapper = mapper;
    }


    // ────────────────────────── Save ──────────────────────────

    @Override
    public @NotNull SavedSection save(SavedSection section) {
        table.putItem(mapper.toItem(section));
        log.debug("Saved section: {}", section.id().value());
        return section;
    }


    // ────────────────────────── Find ──────────────────────────

    @Override
    public List<SavedSection> findByUserId(UserId userId) {
        
        String pk = pk(USER_PK_PREFIX, userId.value());

        // Query for all saved sections of the user
        QueryConditional query = QueryConditional
        .keyEqualTo(k -> k.partitionValue(pk));

        List<SavedSection> sections = table.query(r -> r.queryConditional(query))
            .items()
            .stream()
            .map(mapper::toDomain)
            .toList();

        log.debug("Found {} sections for user: {}", sections.size(), userId.value());
        return sections;
    }


    // ────────────────────────── Delete ──────────────────────────

    @Override
    public void delete(UserId userId, SectionId sectionId) {
        String pk = pk(USER_PK_PREFIX, userId.value());
        String sk = sk(USER_SAVED_SECTION_SK_PREFIX, sectionId.value());

        table.deleteItem(r -> r.key(Key.builder()
            .partitionValue(pk)
            .sortValue(sk)
            .build()));

        log.debug("Deleted section: {} for user: {}", sectionId.value(), userId.value());
    }
}
