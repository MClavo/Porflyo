package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_PK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.USER_SAVED_SECTION_SK_PREFIX;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.idFrom;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.sk;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbSavedSectionItem;
import com.porflyo.infrastructure.adapters.output.dynamodb.common.DataCompressor;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public final class DdbSavedSectionMapper {

    private final DataCompressor dataCompressor;

    @Inject
    public DdbSavedSectionMapper(DataCompressor dataCompressor) {
        this.dataCompressor = dataCompressor;
    }

    // ────────────────────────── Domain -> Item ──────────────────────────
    public DdbSavedSectionItem toItem(SavedSection savedSection) {
        PortfolioSection section = savedSection.section();
        
        DdbSavedSectionItem item = new DdbSavedSectionItem();
        item.setPK(pk(USER_PK_PREFIX, savedSection.userId().value()));
        item.setSK(sk(USER_SAVED_SECTION_SK_PREFIX, savedSection.id().value()));

        item.setName(savedSection.name());
        item.setVersion(savedSection.version());
        
        try{
            byte[] compressedSection = dataCompressor.compress(section);
            item.setSection(compressedSection);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compress section data", e);
        }

        return item;
    }

    // ────────────────────────── Item -> Domain ──────────────────────────
    public SavedSection toDomain(DdbSavedSectionItem item) {
        try{

            PortfolioSection section = dataCompressor
            .decompress(item.getSection(), PortfolioSection.class);
            
            return new SavedSection(
                new SectionId(idFrom(USER_SAVED_SECTION_SK_PREFIX, item.getSK())),
                new UserId(idFrom(USER_PK_PREFIX, item.getPK())),
                item.getName(),
                section,
                item.getVersion()
                );
        } catch (Exception e) {
            throw new RuntimeException("Failed to decompress section data", e);
        }
    }

}
