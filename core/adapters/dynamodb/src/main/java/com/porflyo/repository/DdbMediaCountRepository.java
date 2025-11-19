package com.porflyo.repository;


import static com.porflyo.common.DdbKeys.USER_MEDIA_SK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.porflyo.Item.DdbMediaCountItem;
import com.porflyo.configuration.DdbConfig;
import com.porflyo.mapper.DdbMediaCountMapper;
import com.porflyo.model.ids.UserId;
import com.porflyo.ports.MediaCountRepository;
import com.porflyo.schema.MediaCountTableSchema;

import io.micronaut.context.annotation.Requires;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;


/**
 * The {@code DdbMediaCountRepository} class is designed to manage the media count data
 * for users in a DynamoDB table. This repository exists to provide an efficient way
 * to track and update the number of images associated with a user.
 *
 * <p>All media count data for a user is stored and retrieved in a single operation.
 * This approach is chosen to optimize the cost of read and write operations in DynamoDB,
 * which can become expensive when dealing with multiple small transactions.
 *
 * <p>There is only one instance of this repository per user, ensuring that all media count
 * operations are centralized and efficient.
 */
@Singleton
@Requires(beans = DdbConfig.class)
public class DdbMediaCountRepository implements MediaCountRepository{
    private final DdbMediaCountMapper mapper;
    private static final Logger log = LoggerFactory.getLogger(DdbMediaCountRepository.class);
    private final DynamoDbTable<DdbMediaCountItem> table;

    @Inject
    public DdbMediaCountRepository(DynamoDbEnhancedClient enhanced, DdbConfig dynamoDbConfig, DdbMediaCountMapper mapper) {
        this.mapper = mapper;
        this.table = enhanced.table(
            dynamoDbConfig.userTable(),
            MediaCountTableSchema.SCHEMA);
    }


    // ────────────────────────── Save ──────────────────────────

    public void save(UserId userId, Map<String, Integer> mediaCount) {
        log.debug("Compressing media count data for user {}: {}", userId.value(), mediaCount);
        DdbMediaCountItem item = mapper.toItem(userId, mediaCount);
        table.putItem(item);
        log.debug("Saved media count for user: {}", userId.value());
    }


    // ────────────────────────── Find ──────────────────────────

    public Map<String, Integer> find(UserId userId) {
        Key key = buildMediaKey(userId);
        DdbMediaCountItem item = table.getItem(r -> r.key(key));

        if (item == null) {
            log.debug("Media count not found for user: {}", userId.value());
            return Collections.emptyMap();
        
        } else {
            log.debug("Found media count for user: {}", userId.value());
            return mapper.fromItem(item);
        }
    }

    // ────────────────────────── Delete ──────────────────────────

    public void delete(UserId userId) {
        Key key = buildMediaKey(userId);
        table.deleteItem(r -> r.key(key));
        log.debug("Deleted media count for user: {}", userId.value());
    }


    // ────────────────────────── Increment ──────────────────────────

    @Override
    public Map<String, Integer> increment(UserId userId, List<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return Collections.emptyMap();

        // Update existing counts
        Map<String, Integer> current = new HashMap<>(find(userId));
        for (String k : mediaKeys)
            current.merge(k, 1, Integer::sum);
        
        save(userId, current);

        Map<String, Integer> updated = new HashMap<>();
        for (String k : new HashSet<>(mediaKeys)) 
            updated.put(k, current.get(k));
        
        return updated;
    }


    // ────────────────────────── Decrement ──────────────────────────

    @Override
    public List<String> decrementAndReturnDeletables(UserId userId, List<String> mediaKeys) {
        if (mediaKeys == null || mediaKeys.isEmpty()) return List.of();

        Map<String, Integer> current = find(userId);
        List<String> toDelete = new ArrayList<>();

        for (String k : mediaKeys) {
            int newVal = current.getOrDefault(k, 0) - 1;

            // Delete if zero to avoid unnecessary writes
            if (newVal <= 0) {
                // Prevent deleting SavedSection media here
                if(!k.contains("svd/")){
                    current.remove(k);
                }

                toDelete.add(k);

            } else {
                current.put(k, newVal);
            }
        }

        save(userId, current);
        return toDelete;
    }

    public List<String> deleteAndReturnSSectionZeros(UserId userId) {
        Map<String, Integer> current = find(userId);
        List<String> toDelete = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : current.entrySet()) {
            String k = entry.getKey();
            int count = entry.getValue();

            // Only consider SavedSection media keys
            if (k.contains("svd/") && count <= 0) {
                current.remove(k);
                toDelete.add(k);
            }
        }

        save(userId, current);
        return toDelete;
    }


    // ────────────────────────── Private Methods ──────────────────────────
    private Key buildMediaKey(UserId userId) {
        return Key.builder()
                .partitionValue(pk(USER_PK_PREFIX, userId.value()))
                .sortValue(USER_MEDIA_SK_PREFIX)
                .build();
    }

}
