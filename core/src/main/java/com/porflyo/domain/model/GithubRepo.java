package com.porflyo.domain.model;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;


/**
 * Represents a GitHub repository with basic information.
 *
 * @param name        The name of the repository.
 * @param description A brief description of the repository.
 * @param html_url    The URL to the repository on GitHub.
 */
@Serdeable
@Introspected
public record GithubRepo(
    String name,
    String description,
    String html_url
) {}
