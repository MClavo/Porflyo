package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.common.DdbKeys.USER_MEDIA_SK_PREFIX;
import static com.porflyo.common.DdbKeys.pk;

import java.util.Map;

import com.porflyo.model.ids.UserId;
import com.porflyo.Item.DdbMediaCountItem;
import com.porflyo.common.DataCompressor;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class DdbMediaCountMapper {
    private final DataCompressor dataCompressor;

    @Inject
    public DdbMediaCountMapper(DataCompressor dataCompressor) {
        this.dataCompressor = dataCompressor;
    }


    // ────────────────────────── Attributes -> Item ──────────────────────────
    public DdbMediaCountItem toItem(UserId userId, Map<String, Integer> mediaCount) {
        String PK = pk(USER_PK_PREFIX, userId.value());
        String SK = USER_MEDIA_SK_PREFIX;

        // Defensive: filter out null or empty keys before compression
        Map<String, Integer> filteredMediaCount = mediaCount.entrySet().stream()
            .filter(entry -> entry.getKey() != null && !entry.getKey().trim().isEmpty())
            .filter(entry -> entry.getValue() != null && entry.getValue() > 0)
            .collect(java.util.stream.Collectors.toMap(
                Map.Entry::getKey,
                Map.Entry::getValue
            ));

        byte[] compressedMediaList = null;
        try {
            compressedMediaList = dataCompressor.compress(filteredMediaCount);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress media count data", e);
        }

        DdbMediaCountItem item = new DdbMediaCountItem();
        item.setPK(PK);
        item.setSK(SK);
        item.setMediaCount(compressedMediaList);

        return item;
    }


    // ────────────────────────── Item -> Attributes ──────────────────────────
    public Map<String, Integer> fromItem(DdbMediaCountItem item) {
        if (item == null) {
            throw new IllegalArgumentException("DdbMediaCountItem cannot be null");
        }

        Map<String, Integer> mediaCount;
        try {
            mediaCount = dataCompressor.decompressMap(item.getMediaCount(), String.class, Integer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decompress media count data", e);
        }

        return mediaCount;
    }


}
