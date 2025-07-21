package com.porflyo.domain.model;

import io.micronaut.serde.annotation.Serdeable;



/**
 * Represents a GitHub user with basic profile information.
 *
 * @param login      The username of the GitHub user.
 * @param id         The unique identifier of the GitHub user.
 * @param name       The display name of the GitHub user.
 * @param email      The email address of the GitHub user.
 * @param avatar_url The URL to the user's avatar image.
 */
@Serdeable
public record GithubUser(
    String login,
    String id,
    String name,
    String email,
    String avatar_url
) {}
