package com.porflyo.application.ports.input;

import com.porflyo.application.dto.WorkspaceDto;
import com.porflyo.domain.model.ids.UserId;

import jakarta.annotation.Nullable;

public interface WorkspaceUseCase {

    @Nullable WorkspaceDto load(UserId userId);
}