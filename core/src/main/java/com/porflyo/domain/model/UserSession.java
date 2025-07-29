package com.porflyo.domain.model;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

/**
 * Represents a user session with authentication details and associated GitHub user information.
 *
 * @param jwtToken          The JWT token for the session.
 * @param githubAccessToken  The access token for GitHub API.
 * @param githubUser        The GitHub user associated with this session.
 * @param expirationTime    The time in milliseconds when the session expires.
 */
@Serdeable
@Introspected
public record UserSession(
    String jwtToken,
    String githubAccessToken,
    GithubUser githubUser
) { }