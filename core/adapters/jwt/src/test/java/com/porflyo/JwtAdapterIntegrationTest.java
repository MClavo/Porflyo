package com.porflyo;

import java.util.Map;

import org.junit.jupiter.api.TestInstance;

import com.porflyo.ports.output.JwtPortContract;

import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.micronaut.test.support.TestPropertyProvider;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;

@MicronautTest(environments = {"jwt-integration"})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class JwtAdapterIntegrationTest
        extends JwtPortContract
        implements TestPropertyProvider {

    @Inject
    JwtAdapter injectedJwtAdapter;

    protected JwtAdapterIntegrationTest() {
        super(null);
    }

    @PostConstruct
    void init() {
        this.jwtPort = injectedJwtAdapter;
    }

    @Override
    public Map<String, String> getProperties() {
        return Map.of(
            "jwt.secret", "test-secret-key-for-jwt-signing-must-be-long-enough-for-hs256-algorithm",
            "micronaut.test.resources.enabled", "false"
        );
    }
}
