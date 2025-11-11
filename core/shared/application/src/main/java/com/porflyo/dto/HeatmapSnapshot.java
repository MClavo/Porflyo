package com.porflyo.dto;

import java.util.List;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
@Introspected
public record HeatmapSnapshot(
    String version,
    Integer columns,
    List<Integer> Indexes,
    List<Integer> Values
) {}
