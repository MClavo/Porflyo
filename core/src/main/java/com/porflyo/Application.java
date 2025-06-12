package com.porflyo;
import io.micronaut.core.annotation.NonNull;

import java.nio.file.Paths;

import io.github.cdimascio.dotenv.Dotenv;
import io.micronaut.context.ApplicationContextBuilder;
import io.micronaut.context.ApplicationContextConfigurer;
import io.micronaut.context.annotation.ContextConfigurer;
import io.micronaut.runtime.Micronaut;

public class Application {

    @ContextConfigurer
    public static class Configurer implements ApplicationContextConfigurer {
        @Override
        public void configure(@NonNull ApplicationContextBuilder builder) {
            builder.defaultEnvironments("dev");
        }
    }
    public static void main(String[] args) {
        // for some reason, it looks for the env inside /target,
        // so we need to specify the parent directory
        Dotenv dotenv = Dotenv.configure()
        .directory(Paths.get("").toAbsolutePath().toString()+"/../")
        .ignoreIfMalformed()
        .ignoreIfMissing()
        .load();

        // Set environment variables from .env
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));


        Micronaut.run(Application.class, args);
    }
}