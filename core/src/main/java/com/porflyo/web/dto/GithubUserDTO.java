package com.porflyo.web.dto;

public class GithubUserDTO {
    private String name;
    private String email;
    private final String avatar_url;

    public GithubUserDTO(String name, String email, String avatar_url) {
        this.name = name;
        this.email = email;
        this.avatar_url = avatar_url;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatarUrl() {
        return avatar_url;
    }
}
