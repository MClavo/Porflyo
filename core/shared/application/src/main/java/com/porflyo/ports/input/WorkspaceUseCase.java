package com.porflyo.ports.input;

import com.porflyo.dto.WorkspaceDto;
import com.porflyo.model.ids.UserId;

import jakarta.annotation.Nullable;

public interface WorkspaceUseCase {

    @Nullable WorkspaceDto load(UserId userId);
}