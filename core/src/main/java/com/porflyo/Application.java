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
        // por alguna razon, busca el env dentro de /target,
        // por lo que hay que indicarle el directorio anterior
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