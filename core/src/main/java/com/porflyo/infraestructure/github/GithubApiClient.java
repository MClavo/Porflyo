package com.porflyo.infraestructure.github;

import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.http.client.annotation.Client;
import org.reactivestreams.Publisher;

import com.porflyo.domain.model.GithubRepo;
import com.porflyo.domain.model.GithubUser;

import jakarta.validation.constraints.Pattern;
import java.util.List;

@Header(name = "User-Agent", value = "https://micronautguides.com")
@Header(name = "Accept", value = "application/vnd.github.v3+json, application/json") 
@Client(id = "githubv3") 
public interface GithubApiClient {

    @Get("/user") 
    Publisher<GithubUser> getUser(
            @Header(HttpHeaders.AUTHORIZATION) String authorization);

    @Get("/user/repos{?sort,direction}")
    List<GithubRepo> repos(
            @Pattern(regexp = "created|updated|pushed|full_name") @Nullable @QueryValue String sort,
            @Pattern(regexp = "asc|desc") @Nullable @QueryValue String direction, 
            @Header(HttpHeaders.AUTHORIZATION) String authorization);

}