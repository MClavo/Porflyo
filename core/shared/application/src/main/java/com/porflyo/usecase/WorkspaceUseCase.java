package com.porflyo.usecase;

import com.porflyo.dto.WorkspaceDto;
import com.porflyo.model.ids.UserId;
import com.porflyo.ports.PortfolioRepository;
import com.porflyo.ports.SavedSectionRepository;

import jakarta.inject.Inject;

public class WorkspaceUseCase {

    private final PortfolioRepository portfolios;
    private final SavedSectionRepository sections;

    @Inject
    public WorkspaceUseCase(PortfolioRepository portfolios, SavedSectionRepository sections) {
        this.portfolios = portfolios;
        this.sections = sections;
    }

    public WorkspaceDto load(UserId userId) { 
        return new WorkspaceDto(
            portfolios.findByUserId(userId),
            sections.findByUserId(userId)
        );
    }
}
