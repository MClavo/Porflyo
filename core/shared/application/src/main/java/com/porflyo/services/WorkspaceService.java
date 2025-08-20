package com.porflyo.services;

import com.porflyo.dto.WorkspaceDto;
import com.porflyo.ports.input.WorkspaceUseCase;
import com.porflyo.ports.output.PortfolioRepository;
import com.porflyo.ports.output.SavedSectionRepository;
import com.porflyo.model.ids.UserId;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
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
