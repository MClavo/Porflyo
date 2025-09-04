package com.porflyo.ports;

import com.porflyo.model.ids.UserId;

public interface QuotaRepository {
    public void create(UserId userId);
    public Integer getSavedSectionCount(UserId userId);
    public Integer getPortfolioCount(UserId userId);
    public int updateSavedSectionCount(UserId userId, int updateBy);
    public int updatePortfolioCount(UserId userId, int updateBy);
    public void delete(UserId userId);
}
