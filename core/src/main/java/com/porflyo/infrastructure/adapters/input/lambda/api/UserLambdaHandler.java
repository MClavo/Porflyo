package com.porflyo.infrastructure.adapters.input.lambda.api;

import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.application.ports.input.UserUseCase;
import com.porflyo.application.ports.output.JwtPort;
import com.porflyo.domain.model.UserClaims;
import com.porflyo.domain.model.shared.EntityId;
import com.porflyo.domain.model.user.User;
import com.porflyo.infrastructure.adapters.input.lambda.api.dto.PublicUserDto;
import com.porflyo.infrastructure.adapters.input.lambda.utils.LambdaHttpUtils;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Lambda handler for user-related operations.
 * <p>
 * This class handles incoming API Gateway events for user management, including creating,
 * retrieving, updating, and deleting users. It uses the {@link UserUseCase} to perform
 * business logic and the {@link JwtPort} for JWT operations.
 * </p>
 *
 * This handler is always invoked after the user has been authenticated.
 */
@Singleton
public class UserLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(UserLambdaHandler.class);
    private final JsonMapper jsonMapper;
    private final UserUseCase userService;
    private final JwtPort jwtService;

    @Inject
    public UserLambdaHandler(JsonMapper jsonMapper, UserUseCase userService, JwtPort jwtService) {
        this.jsonMapper = jsonMapper;
        this.userService = userService;
        this.jwtService = jwtService;
    }

    /**
     * Handles incoming API Gateway events for user-related requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the result of the operation.
     */
    public APIGatewayV2HTTPResponse handleUserRequest(APIGatewayV2HTTPEvent input) {
        try {
            // /api/user/{request}
            String pathRequest = LambdaHttpUtils.extractPathSegment(input, 2); 

            EntityId id = getUserIdFromCookie(input);
            String body = input.getBody();

            return processUserRequest(id, body, pathRequest);

        } catch (Exception e) {
            log.error("Error extracting path from input: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }


    // ────────────────────────── Gateway ──────────────────────────

	private APIGatewayV2HTTPResponse processUserRequest(EntityId userId, String body, String pathRequest) {
        log.debug("Handling user request for path: {}", pathRequest);
        
        // User only gets saved in the OAuth flow, so we can assume it exists
        switch (pathRequest) {
            case "get":
                return findUser(userId);    

            case "patch":
                return patchUser(userId, body);

            case "delete":
                return deleteUser(userId);

            default:
                log.warn("Invalid path request: {}", pathRequest);
                return LambdaHttpUtils.createErrorResponse(404, "Not Found");
        }

	}

    
    // ────────────────────────── User Management ────────────────────────── 
    
    /**
     * Finds a user by their ID and returns a response with the user's public data.
     *
     * @param userId the ID of the user to find
     * @return an {@link APIGatewayV2HTTPResponse} containing the user's public data or an error message
     */
    private APIGatewayV2HTTPResponse findUser(EntityId userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);

            if (userOpt.isEmpty()) {
                return LambdaHttpUtils.createErrorResponse(404, "User not found");
            }

            // User has sensitive data, so we return a PublicUserDto
            PublicUserDto dto = PublicUserDto.from(userOpt.get());
            log.debug("User search: {}", userId.value());
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error serializing PublicUserDto: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Patches a user's data with the provided body and returns the updated user data.
     *
     * @param userId the ID of the user to patch
     * @param body   the JSON body containing the fields to update
     * @return an {@link APIGatewayV2HTTPResponse} containing the updated user's public data or an error message
     */
    private APIGatewayV2HTTPResponse patchUser(EntityId userId, String body) {
        try {
            Map<String, Object> attributes = extractAttributesFromBody(body);

            User user = userService.patch(userId, attributes);
            PublicUserDto dto = PublicUserDto.from(user);

            log.debug("Patched user: {}, Attributes: {}", userId.value(), attributes);
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error serializing updated user data: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        } catch (Exception e) {
            log.error("Error patching user: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Bad Request");
        }

    }

    /**
     * Deletes a user by their ID and returns a success response.
     *
     * @param userId the ID of the user to delete
     * @return an {@link APIGatewayV2HTTPResponse} indicating success or failure
     */
    private APIGatewayV2HTTPResponse deleteUser(EntityId userId) {
        try {
            userService.delete(userId);
            log.debug("Deleted user: {}", userId.value());
            return LambdaHttpUtils.createResponse(204, null); // No content

        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }


    // ────────────────────────── Helpers ──────────────────────────

    private EntityId getUserIdFromCookie(APIGatewayV2HTTPEvent input) {
        String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
        UserClaims claims = jwtService.extractClaims(cookie);
        return new EntityId(claims.getSub());
    }

    /* Extracts attributes from the request body */
    private Map<String, Object> extractAttributesFromBody(String body) throws java.io.IOException {
        if (body == null || body.isEmpty()) 
            throw new IllegalArgumentException("Request body cannot be null or empty");
            
        return jsonMapper.readValue(body, Argument.mapOf(String.class, Object.class));
    }

}