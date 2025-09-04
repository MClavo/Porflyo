package com.porflyo.dto;

import java.util.List;

import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.portfolio.SavedSection;

public record WorkspaceDto(
        List<Portfolio> portfolios,
        List<SavedSection> savedSections
) {}