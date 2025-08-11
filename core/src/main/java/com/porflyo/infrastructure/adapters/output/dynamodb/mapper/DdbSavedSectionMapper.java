package com.porflyo.infrastructure.adapters.output.dynamodb.mapper;

import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.PK_PREFIX_USER;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.SK_PREFIX_SAVED_SECTION;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.pk;
import static com.porflyo.infrastructure.adapters.output.dynamodb.common.DdbKeys.sk;

import com.porflyo.domain.model.ids.SectionId;
import com.porflyo.domain.model.ids.UserId;
import com.porflyo.domain.model.portfolio.PortfolioSection;
import com.porflyo.domain.model.portfolio.SavedSection;
import com.porflyo.infrastructure.adapters.output.dynamodb.Item.DdbSavedSectionItem;

public final class DdbSavedSectionMapper {

    // ────────────────────────── Domain -> Item ──────────────────────────
    public static DdbSavedSectionItem toItem(UserId userId, SavedSection savedSection) {
        PortfolioSection section = savedSection.section();
        
        DdbSavedSectionItem item = new DdbSavedSectionItem();
        item.setPK(pk(PK_PREFIX_USER, userId.value()));
        item.setSK(sk(SK_PREFIX_SAVED_SECTION, savedSection.id().value()));

        item.setSectionId(savedSection.id().value());
        item.setUserId(userId.value());
        
        item.setName(savedSection.name());
        item.setVersion(savedSection.version());

        item.setSectionType(section.sectionType());
        item.setTitle(section.title());
        item.setContentJson(section.content().toString());
        item.setMedia(section.media());

        return item;
    }

    // ────────────────────────── Item -> Domain ──────────────────────────
    public static SavedSection toDomain(DdbSavedSectionItem item) {
        PortfolioSection section = new PortfolioSection(
            item.getSectionType(),
            item.getTitle(),
            item.getContentJson(),
            item.getMedia()
        );
        
        return new SavedSection(
            new SectionId(item.getSectionId()),
            new UserId(item.getUserId()),
            item.getName(),
            section,
            item.getVersion()
        );
    }

}
