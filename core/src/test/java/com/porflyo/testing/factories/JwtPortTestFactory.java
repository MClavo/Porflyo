package com.porflyo.testing.factories;

import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.infrastructure.adapters.output.security.JwtAdapter;
import com.porflyo.testing.mocks.ports.MockJwtConfig;

import io.micronaut.context.annotation.Factory;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

@Factory
public class JwtPortTestFactory {
    @Singleton
    @Named("jwt-adapter")
    JwtPort jwtAdapter() {
        return new JwtAdapter(MockJwtConfig.withDefaults());
    }

    @Singleton
    @Named("jwt-different-adapter")
    JwtPort jwtDifferentAdapter() {
        return new JwtAdapter(MockJwtConfig.builder()
                .secret("different-secret-key-that-is-long-enough-for-hs256-algorithm")
                .build());
    }
}
