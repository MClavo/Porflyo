package com.porflyo.application.dto;

import java.util.List;

import com.porflyo.domain.model.portfolio.Portfolio;
import com.porflyo.domain.model.portfolio.SavedSection;

public record WorkspaceDto(
        List<Portfolio> portfolios,
        List<SavedSection> savedSections
) {}