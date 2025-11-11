package com.porflyo.mapper;

import static com.porflyo.common.DdbKeys.SLUG_PK_PREFIX;
import static com.porflyo.common.DdbKeys.SLUG_PORTFOLIO_SK_PREFIX;
import static com.porflyo.common.DdbKeys.idFrom;
import static com.porflyo.common.DdbKeys.pk;

import com.porflyo.Item.DdbPortfolioUrlItem;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioUrl;
import com.porflyo.model.portfolio.Slug;

import jakarta.inject.Singleton;

@Singleton
public class DdbPortfolioUrlMapper {

    public DdbPortfolioUrlItem toItem(Slug slug, UserId userId, PortfolioId portfolioId, boolean isPublic) {
        String PK = pk(SLUG_PK_PREFIX, slug.value());
        String SK = SLUG_PORTFOLIO_SK_PREFIX;

        DdbPortfolioUrlItem item = new DdbPortfolioUrlItem();
        item.setPK(PK);
        item.setSK(SK);
        item.setPortfolioId(portfolioId != null ? portfolioId.value() : null);
        item.setUserId(userId != null ? userId.value() : null);
        item.setPublic(isPublic);

        return item;
    }

    public PortfolioUrl toDomain(DdbPortfolioUrlItem item) {
        String slug = idFrom(SLUG_PK_PREFIX, item.getPK());

        return new PortfolioUrl(
                new UserId(item.getUserId()),
                new PortfolioId(item.getPortfolioId()),
                new Slug(slug),
                item.isPublic()
        );
    }
}

