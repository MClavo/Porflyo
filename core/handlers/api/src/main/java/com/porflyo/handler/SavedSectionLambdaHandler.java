package com.porflyo.handler;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.LambdaHttpUtils;
import com.porflyo.dto.PublicSavedSectionDto;
import com.porflyo.dto.SavedSectionCreateDto;
import com.porflyo.mapper.PublicSavedSectionDtoMapper;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.SavedSectionUseCase;

import io.micronaut.json.JsonMapper;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

/**
 * Lambda handler for saved section operations.
 * <p>
 * This class handles incoming API Gateway events for saved section management, including creating,
 * retrieving, and deleting saved sections. It uses the {@link SavedSectionUseCase} to perform
 * business logic and the {@link AuthUseCase} for authentication operations.
 * </p>
 *
 * This handler is always invoked after the user has been authenticated.
 */
@Singleton
public class SavedSectionLambdaHandler {
    private static final Logger log = LoggerFactory.getLogger(SavedSectionLambdaHandler.class);
    
    private final JsonMapper jsonMapper;
    private final PublicSavedSectionDtoMapper publicSavedSectionDtoMapper;
    private final SavedSectionUseCase savedSectionService;
    private final AuthUseCase authService;

    @Inject
    public SavedSectionLambdaHandler(
            JsonMapper jsonMapper,
            PublicSavedSectionDtoMapper publicSavedSectionDtoMapper,
            SavedSectionUseCase savedSectionService,
            AuthUseCase authService) {
                
        this.jsonMapper = jsonMapper;
        this.publicSavedSectionDtoMapper = publicSavedSectionDtoMapper;
        this.savedSectionService = savedSectionService;
        this.authService = authService;
    }

    /**
     * Handles incoming API Gateway events for saved section requests.
     *
     * @param input The API Gateway event containing the request data.
     * @return An {@link APIGatewayV2HTTPResponse} with the result of the operation.
     */
    public APIGatewayV2HTTPResponse handleSavedSectionRequest(APIGatewayV2HTTPEvent input) {
        try {
            // /api/sections/{sectionId}
            String sectionId = LambdaHttpUtils.extractPathSegment(input, 2);
            
            UserId userId = getUserIdFromCookie(input);
            String body = input.getBody();
            String httpMethod = LambdaHttpUtils.getMethod(input);

            return processSavedSectionRequest(userId, body, sectionId, httpMethod);

        } catch (Exception e) {
            log.error("Error processing saved section request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    // ────────────────────────── Gateway ──────────────────────────

    private APIGatewayV2HTTPResponse processSavedSectionRequest(UserId userId, String body, String sectionId, String httpMethod) {
        log.debug("Handling saved section request for section: {}, method: {}", sectionId, httpMethod);
        try {
            

            switch (httpMethod) {
                case "post":
                    return createSavedSection(userId, body);

                case "get":
                    return listSavedSections(userId);

                case "delete":
                    SectionId id = new SectionId(sectionId);
                    return deleteSavedSection(userId, id);
                    
                default:
                    log.warn("Unsupported HTTP method: {}", httpMethod);
                    return LambdaHttpUtils.createErrorResponse(405, "Method Not Allowed");
            }
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid section ID: {}", sectionId);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid section ID");
        }
    }

    // ────────────────────────── Saved Section Management ────────────────────────── 

    /**
     * Creates a new saved section.
     *
     * @param userId the ID of the user creating the saved section
     * @param body   the JSON body containing the saved section data
     * @return an {@link APIGatewayV2HTTPResponse} with the created saved section data or an error message
     */
    private APIGatewayV2HTTPResponse createSavedSection(UserId userId, String body) {
        try {
            SavedSectionCreateDto createDto = jsonMapper.readValue(body, SavedSectionCreateDto.class);
            
            SavedSection savedSection = savedSectionService.create(userId, createDto.name(), createDto.section());
            
            PublicSavedSectionDto dto = publicSavedSectionDtoMapper.toDto(savedSection);
            log.debug("Created saved section: {} for user: {}", savedSection.id().value(), userId.value());
            
            return LambdaHttpUtils.createResponse(201, jsonMapper.writeValueAsString(dto));

        } catch (java.io.IOException e) {
            log.error("Error deserializing saved section create request: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(400, "Invalid request body");
        } catch (Exception e) {
            log.error("Error creating saved section: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Lists all saved sections owned by a user.
     *
     * @param userId the ID of the user
     * @return an {@link APIGatewayV2HTTPResponse} containing the list of saved sections
     */
    private APIGatewayV2HTTPResponse listSavedSections(UserId userId) {
        try {
            List<SavedSection> savedSections = savedSectionService.listByOwner(userId);
            List<PublicSavedSectionDto> dtos = savedSections.stream()
                .map(publicSavedSectionDtoMapper::toDto)
                .toList();
            
            log.debug("Listed {} saved sections for user: {}", dtos.size(), userId.value());
            return LambdaHttpUtils.createResponse(200, jsonMapper.writeValueAsString(dtos));

        } catch (java.io.IOException e) {
            log.error("Error serializing saved section list: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        } catch (Exception e) {
            log.error("Error listing saved sections: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    /**
     * Deletes a saved section by its ID.
     *
     * @param userId    the ID of the user
     * @param sectionId the ID of the saved section to delete
     * @return an {@link APIGatewayV2HTTPResponse} indicating success or failure
     */
    private APIGatewayV2HTTPResponse deleteSavedSection(UserId userId, SectionId sectionId) {
        try {
            savedSectionService.delete(userId, sectionId);
            log.debug("Deleted saved section: {} for user: {}", sectionId.value(), userId.value());
            return LambdaHttpUtils.createResponse(204, null); // No content

        } catch (Exception e) {
            log.error("Error deleting saved section: {}", e.getMessage(), e);
            return LambdaHttpUtils.createErrorResponse(500, "Internal Server Error");
        }
    }

    // ────────────────────────── Helpers ──────────────────────────

    private UserId getUserIdFromCookie(APIGatewayV2HTTPEvent input) {
        String cookie = LambdaHttpUtils.extractCookieValue(input, "session");
        UserClaims claims = authService.extractClaims(cookie);
        return new UserId(claims.getSub());
    }
}
