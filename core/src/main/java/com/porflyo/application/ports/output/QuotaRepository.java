package com.porflyo.application.ports.output;

import com.porflyo.domain.model.ids.UserId;

public interface QuotaRepository {
    public void create(UserId userId);
    public Integer getSavedSectionCount(UserId userId);
    public Integer getPortfolioCount(UserId userId);
    public int updateSavedSectionCount(UserId userId, int updateBy);
    public int updatePortfolioCount(UserId userId, int updateBy);
}
