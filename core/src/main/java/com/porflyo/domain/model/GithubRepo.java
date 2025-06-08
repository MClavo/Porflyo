package com.porflyo.domain.model;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public class GithubRepo {

    private final String name;
    private final String description;
    private final String html_url;

    public GithubRepo(String name, String description, String html_url) {
        this.name = name;
        this.description = description;
        this.html_url = html_url;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getHtml_url() {
        return html_url;
    }
}
