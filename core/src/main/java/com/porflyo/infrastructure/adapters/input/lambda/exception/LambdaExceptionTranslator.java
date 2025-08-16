package com.porflyo.infrastructure.adapters.input.lambda.exception;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.domain.exceptions.shared.DomainException;

import io.micronaut.serde.ObjectMapper;
import jakarta.inject.Inject;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.services.dynamodb.model.ProvisionedThroughputExceededException;
import software.amazon.awssdk.services.dynamodb.model.TransactionCanceledException;

public final class LambdaExceptionTranslator {

    @Inject
    private static ObjectMapper mapper;

    @Inject
    private LambdaExceptionTranslator() {}

    public static APIGatewayV2HTTPResponse toResponse(Throwable ex, APIGatewayV2HTTPEvent input) {
        int status;
        String code = "internal_error";
        String title = ex.getClass().getSimpleName();
        String detail = Optional.ofNullable(ex.getMessage()).orElse(title);

        // Map known exception families
        if (ex instanceof DomainException de) {
            status = de.httpStatus();
            code   = de.code();
        } else if (ex instanceof ConstraintViolationException cve) {
            status = 400;
            code   = "validation_error";
            detail = "Invalid request payload";
            Map<String, Object> body = baseProblem(status, code, title, detail, input)
                    .with("violations", violations(cve))
                    .build();
            return json(status, body);
        } else if (ex instanceof IllegalArgumentException) {
            status = 400; code = "bad_request";
        } else if (ex instanceof ProvisionedThroughputExceededException
                || ex instanceof TransactionCanceledException
                || (ex instanceof AwsServiceException ase
                && "ThrottlingException".equalsIgnoreCase(
                   Optional.ofNullable(ase.awsErrorDetails())
                           .map(d -> d.errorCode())
                           .orElse("")))) {
            status = 429;
            code = "throttled";
        } else {
            status = 500;
        }

        Map<String, Object> body = baseProblem(status, code, title, detail, input).build();
        return json(status, body);
    }

    // ---------- helpers ----------

    private static ProblemBuilder baseProblem(int status, String code, String title,
                                              String detail, APIGatewayV2HTTPEvent input) {
        String path = Optional.ofNullable(input).map(APIGatewayV2HTTPEvent::getRawPath).orElse("/");
        String requestId = Optional.ofNullable(input)
                .map(APIGatewayV2HTTPEvent::getRequestContext)
                .map(APIGatewayV2HTTPEvent.RequestContext::getRequestId)
                .orElse(UUID.randomUUID().toString());

        return new ProblemBuilder()
                .with("type", "about:blank")
                .with("title", title)
                .with("status", status)
                .with("code", code)
                .with("detail", detail)
                .with("path", path)
                .with("requestId", requestId);
    }

    private static List<Map<String, Object>> violations(ConstraintViolationException cve) {
        return cve.getConstraintViolations().stream()
                .map(LambdaExceptionTranslator::toViolation)
                .collect(Collectors.toList());
    }

    private static Map<String, Object> toViolation(ConstraintViolation<?> v) {
        return Map.of(
                "field", Optional.ofNullable(v.getPropertyPath()).map(Object::toString).orElse(""),
                "message", Optional.ofNullable(v.getMessage()).orElse(""),
                "invalidValue", String.valueOf(v.getInvalidValue())
        );
    }

    private static APIGatewayV2HTTPResponse json(int status, Map<String, Object> body) {
        try {
            String json = mapper.writeValueAsString(body);
            return APIGatewayV2HTTPResponse.builder()
                    .withStatusCode(status)
                    .withHeaders(defaultHeaders())
                    .withBody(json)
                    .build();
        } catch (Exception e) {
            // Simple fallback if JSON serialization fails
            return APIGatewayV2HTTPResponse.builder()
                    .withStatusCode(500)
                    .withHeaders(defaultHeaders())
                    .withBody("{\"status\":500,\"code\":\"internal_error\",\"detail\":\"Serialization error\"}")
                    .build();
        }
    }

    private static Map<String, String> defaultHeaders() {
        Map<String, String> h = new HashMap<>();
        h.put("Content-Type", "application/json; charset=utf-8");
        // CORS básicos (ajusta si usas otro dominio)
        h.put("Access-Control-Allow-Origin", "*");
        h.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
        h.put("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        return h;
    }

    // Mini builder to compose the problem JSON easily and without dependencies
    private static final class ProblemBuilder {
        private final Map<String, Object> map = new LinkedHashMap<>();
        ProblemBuilder with(String k, Object v) { map.put(k, v); return this; }
        ProblemBuilder with(String k, List<?> v) { map.put(k, v); return this; }
        Map<String, Object> build() { return map; }
    }
}
