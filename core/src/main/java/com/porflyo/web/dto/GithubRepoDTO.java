package com.porflyo.web.dto;

public class GithubRepoDTO {
    private String name;
    private String description;
    private String htmlUrl;

    public GithubRepoDTO(String name, String description, String htmlUrl) {
        this.name = name;
        this.description = description;
        this.htmlUrl = htmlUrl;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getHtmlUrl() {
        return htmlUrl;
    }
}
