package com.porflyo.domain.model.portfolio;

import java.util.List;

import com.porflyo.domain.model.ids.ContentBlockId;
import com.porflyo.domain.model.ids.UserId;

public record ContentBlock(
    ContentBlockId id,
    UserId userId,
    String blockType,           // PROJECT, EXPERIENCE, EDUCATION, SKILL, CUSTOM...
    Object contentJson,         // Keep compact; Micronaut serde can handle Map/String
    List<String> mediaKeys,     // Media keys
    Integer version,            // block versioning
    String createdAt,
    String updatedAt
) {}

