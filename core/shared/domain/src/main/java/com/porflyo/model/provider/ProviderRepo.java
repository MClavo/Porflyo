package com.porflyo.model.provider;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import java.util.List;


/**
 * Represents a GitHub repository with basic information.
 *
 * Fixed field types to match GitHub API responses:
 * - stargazers_count and forks_count are numeric
 * - topics is an array (List<String>)
 */
@Serdeable
@Introspected
public record ProviderRepo(
    Long id,
    String name,
    String description,
    String html_url,
    String homepage,
    String languages_url,
    Integer stargazers_count,
    Integer forks_count,
    List<String> topics
) {}
