package com.porflyo.domain.model;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class GithubUser {

    private final String login;
    private final String name;
    private final String email;
    private final String avatar_url;

    public GithubUser(String login, String name, String email, String avatar_url) {
        this.login = login;
        this.name = name;
        this.email = email;
        this.avatar_url = avatar_url;
    }

    public String getLogin() {
        return login;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatar_url() {
        return avatar_url;
    }
    
}
