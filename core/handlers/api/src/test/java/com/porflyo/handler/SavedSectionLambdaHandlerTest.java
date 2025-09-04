package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.PublicSavedSectionDto;
import com.porflyo.dto.SavedSectionCreateDto;
import com.porflyo.mapper.PublicSavedSectionDtoMapper;
import com.porflyo.model.ids.SectionId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.SavedSection;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.SavedSectionUseCase;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Saved Section Lambda Handler Tests")
class SavedSectionLambdaHandlerTest {

    @Mock JsonMapper jsonMapper;
    @Mock PublicSavedSectionDtoMapper publicSavedSectionDtoMapper;
    @Mock SavedSectionUseCase savedSectionService;
    @Mock AuthUseCase authService;

    @InjectMocks SavedSectionLambdaHandler handler;

    private final UserId userId = new UserId("user123");
    private final SectionId sectionId = new SectionId("section123");
    private APIGatewayV2HTTPEvent event;
    private APIGatewayV2HTTPEvent.RequestContext requestContext;
    private APIGatewayV2HTTPEvent.RequestContext.Http http;

    @BeforeEach
    void setup() {
        event = mock(APIGatewayV2HTTPEvent.class);
        requestContext = mock(APIGatewayV2HTTPEvent.RequestContext.class);
        http = mock(APIGatewayV2HTTPEvent.RequestContext.Http.class);
        
        given(event.getRequestContext()).willReturn(requestContext);
        given(requestContext.getHttp()).willReturn(http);
        
        // Setup JWT extraction
        UserClaims claims = mock(UserClaims.class);
        given(claims.getSub()).willReturn(userId.value());
        given(authService.extractClaims("session-token")).willReturn(claims);
        
        // Setup cookie extraction from headers
        Map<String, String> headers = Map.of("Cookie", "session=session-token");
        given(event.getHeaders()).willReturn(headers);
    }

    // ────────────────────────── Create Saved Section ──────────────────────────

    @Test
    @DisplayName("should create saved section when valid request")
    void should_create_saved_section_when_valid_request() throws IOException {
        // given
        String requestBody = """
            {
                "name": "My About Section",
                "section": {
                    "sectionType": "about",
                    "title": "About Me",
                    "content": "I am a developer",
                    "media": []
                }
            }
            """;
        PortfolioSection section = new PortfolioSection("about", "About Me", "I am a developer", List.of());
        SavedSectionCreateDto createDto = new SavedSectionCreateDto("My About Section", section);
        SavedSection savedSection = mock(SavedSection.class);
        SectionId sectionId = mock(SectionId.class);
        given(savedSection.id()).willReturn(sectionId);
        given(sectionId.value()).willReturn("section123");
        PublicSavedSectionDto responseDto = new PublicSavedSectionDto("section123", "My About Section", section, 1);
        
        given(event.getRawPath()).willReturn("/api/sections");
        given(http.getMethod()).willReturn("POST");
        given(event.getBody()).willReturn(requestBody);
        given(jsonMapper.readValue(requestBody, SavedSectionCreateDto.class)).willReturn(createDto);
        given(savedSectionService.create(userId, "My About Section", section)).willReturn(savedSection);
        given(publicSavedSectionDtoMapper.toDto(savedSection)).willReturn(responseDto);
        // Stub for debug log serialization
        given(jsonMapper.writeValueAsString(createDto)).willReturn("{\"debug\":\"serialized\"}");
        // Stub for response serialization  
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"id\":\"section123\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(201);
        assertThat(response.getBody()).isEqualTo("{\"id\":\"section123\"}");
        then(savedSectionService).should().create(userId, "My About Section", section);
    }

    @Test
    @DisplayName("should return 400 when invalid request body for create")
    void should_return_400_when_invalid_request_body_for_create() throws IOException {
        // given
        String invalidJson = "invalid json";
        
        given(event.getRawPath()).willReturn("/api/sections");
        given(http.getMethod()).willReturn("POST");
        given(event.getBody()).willReturn(invalidJson);
        given(jsonMapper.readValue(invalidJson, SavedSectionCreateDto.class)).willThrow(new IOException("Invalid JSON"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Invalid request body");
        then(savedSectionService).should(never()).create(any(), any(), any());
    }

    // ────────────────────────── List Saved Sections ──────────────────────────

    @Test
    @DisplayName("should list saved sections when valid request")
    void should_list_saved_sections_when_valid_request() throws IOException {
        // given
        SavedSection section1 = mock(SavedSection.class);
        SavedSection section2 = mock(SavedSection.class);
        List<SavedSection> savedSections = List.of(section1, section2);
        PublicSavedSectionDto dto1 = mock(PublicSavedSectionDto.class);
        PublicSavedSectionDto dto2 = mock(PublicSavedSectionDto.class);
        
        given(event.getRawPath()).willReturn("/api/sections");
        given(http.getMethod()).willReturn("GET");
        given(savedSectionService.listByOwner(userId)).willReturn(savedSections);
        given(publicSavedSectionDtoMapper.toDto(section1)).willReturn(dto1);
        given(publicSavedSectionDtoMapper.toDto(section2)).willReturn(dto2);
        given(jsonMapper.writeValueAsString(List.of(dto1, dto2))).willReturn("[{},{}}]");

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("[{},{}}]");
        then(savedSectionService).should().listByOwner(userId);
    }

    // ────────────────────────── Delete Saved Section ──────────────────────────

    @Test
    @DisplayName("should delete saved section when valid request")
    void should_delete_saved_section_when_valid_request() {
        // given
        given(event.getRawPath()).willReturn("/api/sections/section123");
        given(http.getMethod()).willReturn("DELETE");

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        then(savedSectionService).should().delete(userId, sectionId);
    }

    // ────────────────────────── Error Handling ──────────────────────────

    @Test
    @DisplayName("should return 400 when invalid section id")
    void should_return_400_when_invalid_section_id() {
        // given - use a whitespace-only section ID that will fail validation
        given(event.getRawPath()).willReturn("/api/sections/ ");  // Space-only ID should be considered blank
        given(http.getMethod()).willReturn("DELETE");

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Invalid section ID");
    }

    @Test
    @DisplayName("should return 405 when unsupported http method")
    void should_return_405_when_unsupported_http_method() {
        // given
        given(event.getRawPath()).willReturn("/api/sections/section123");
        given(http.getMethod()).willReturn("PUT");

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(405);
        assertThat(response.getBody()).contains("Method Not Allowed");
    }

    @Test
    @DisplayName("should return 500 when service throws exception")
    void should_return_500_when_service_throws_exception() {
        // given
        given(event.getRawPath()).willReturn("/api/sections");
        given(http.getMethod()).willReturn("GET");
        willThrow(new RuntimeException("Database error")).given(savedSectionService).listByOwner(userId);

        // when
        APIGatewayV2HTTPResponse response = handler.handleSavedSectionRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }
}
