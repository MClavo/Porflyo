package com.porflyo.application.services;

import com.porflyo.application.dto.WorkspaceDto;
import com.porflyo.application.ports.input.WorkspaceUseCase;
import com.porflyo.application.ports.output.PortfolioRepository;
import com.porflyo.application.ports.output.SavedSectionRepository;
import com.porflyo.domain.model.ids.UserId;

import jakarta.inject.Inject;

public class WorkspaceService implements WorkspaceUseCase {

    private final PortfolioRepository portfolios;
    private final SavedSectionRepository sections;

    @Inject
    public WorkspaceService(PortfolioRepository portfolios, SavedSectionRepository sections) {
        this.portfolios = portfolios;
        this.sections = sections;
    }

    @Override
    public WorkspaceDto load(UserId userId) { 
        return new WorkspaceDto(
            portfolios.findByUserId(userId),
            sections.findByUserId(userId)
        );
    }
}
