package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.AvailabilityResponseDto;
import com.porflyo.dto.PublicPortfolioView;
import com.porflyo.model.portfolio.PortfolioSection;
import com.porflyo.model.portfolio.Slug;
import com.porflyo.ports.input.PublicPortfolioQueryUseCase;
import com.porflyo.ports.output.SlugGeneratorPort;

import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Public Portfolio Lambda Handler Tests")
class PublicPortfolioLambdaHandlerTest {

    @Mock JsonMapper jsonMapper;
    @Mock PublicPortfolioQueryUseCase publicPortfolioQueryService;
    @Mock SlugGeneratorPort slugGenerator;

    @InjectMocks PublicPortfolioLambdaHandler handler;

    private APIGatewayV2HTTPEvent event;
    private final Slug slug = new Slug("my-awesome-portfolio");
    private final String slugString = "my-awesome-portfolio";

    @BeforeEach
    void setup() {
        event = mock(APIGatewayV2HTTPEvent.class);
    }

    // ────────────────────────── Get Public Portfolio ──────────────────────────

    @Test
    @DisplayName("should return public portfolio when valid slug")
    void should_return_public_portfolio_when_valid_slug() throws IOException {
        // given
        PublicPortfolioView portfolioView = new PublicPortfolioView(
            "portfolio123", 
            "modern", 
            "My Portfolio", 
            "Test description", 
            List.of(new PortfolioSection("about", "About Me", "I am a developer", List.of()))
        );
        
        given(event.getRawPath()).willReturn("/public/portfolio/my-awesome-portfolio");
        given(slugGenerator.normalize(slugString)).willReturn(slug);
        given(publicPortfolioQueryService.getPublishedByUrl(slug)).willReturn(Optional.of(portfolioView));
        given(jsonMapper.writeValueAsString(portfolioView)).willReturn("{\"portfolioId\":\"portfolio123\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"portfolioId\":\"portfolio123\"}");
        then(publicPortfolioQueryService).should().getPublishedByUrl(slug);
    }

    @Test
    @DisplayName("should return 404 when portfolio not found")
    void should_return_404_when_portfolio_not_found() {
        // given
        given(event.getRawPath()).willReturn("/public/portfolio/non-existent-portfolio");
        given(slugGenerator.normalize("non-existent-portfolio")).willReturn(new Slug("non-existent-portfolio"));
        given(publicPortfolioQueryService.getPublishedByUrl(new Slug("non-existent-portfolio"))).willReturn(Optional.empty());

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).contains("Portfolio not found");
    }

    @Test
    @DisplayName("should return 400 when slug is missing")
    void should_return_400_when_slug_is_missing() {
        // given
        given(event.getRawPath()).willReturn("/public/portfolio/");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Portfolio URL is required");
    }

    @Test
    @DisplayName("should return 400 when slug is empty")
    void should_return_400_when_slug_is_empty() {
        // given
        given(event.getRawPath()).willReturn("/public/portfolio/");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Portfolio URL is required");
    }

    // ────────────────────────── Check URL Availability ──────────────────────────

    @Test
    @DisplayName("should return true when URL is available")
    void should_return_true_when_url_is_available() throws IOException {
        // given
        Slug normalizedSlug = new Slug("available-slug");
        AvailabilityResponseDto responseDto = new AvailabilityResponseDto(true, "available-slug");
        
        given(event.getRawPath()).willReturn("/public/isurlavailable/available-slug");
        given(slugGenerator.normalize("available-slug")).willReturn(normalizedSlug);
        given(publicPortfolioQueryService.isUrlAvailable(normalizedSlug)).willReturn(true);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"available\":true,\"normalizedSlug\":\"available-slug\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).contains("\"available\":true");
        assertThat(response.getBody()).contains("\"normalizedSlug\":\"available-slug\"");
        then(publicPortfolioQueryService).should().isUrlAvailable(normalizedSlug);
    }

    @Test
    @DisplayName("should return false when URL is not available")
    void should_return_false_when_url_is_not_available() throws IOException {
        // given
        Slug normalizedSlug = new Slug("taken-slug");
        AvailabilityResponseDto responseDto = new AvailabilityResponseDto(false, "taken-slug");
        
        given(event.getRawPath()).willReturn("/public/isurlavailable/taken-slug");
        given(slugGenerator.normalize("taken-slug")).willReturn(normalizedSlug);
        given(publicPortfolioQueryService.isUrlAvailable(normalizedSlug)).willReturn(false);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"available\":false,\"normalizedSlug\":\"taken-slug\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).contains("\"available\":false");
        assertThat(response.getBody()).contains("\"normalizedSlug\":\"taken-slug\"");
        then(publicPortfolioQueryService).should().isUrlAvailable(normalizedSlug);
    }

    @Test
    @DisplayName("should return 400 when slug is missing for URL availability check")
    void should_return_400_when_slug_is_missing_for_url_availability_check() {
        // given
        given(event.getRawPath()).willReturn("/public/isurlavailable/");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Portfolio URL is required");
    }

    
    // ────────────────────────── Error Handling ──────────────────────────
    
    @Test
    @DisplayName("should return 500 when URL availability check fails")
    void should_return_500_when_url_availability_check_fails() {
        // given
        given(event.getRawPath()).willReturn("/public/isurlavailable/error-slug");
        given(slugGenerator.normalize("error-slug")).willReturn(new Slug("error-slug"));
        willThrow(new RuntimeException("Database error")).given(publicPortfolioQueryService).isUrlAvailable(new Slug("error-slug"));

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }

    @Test
    @DisplayName("should return 500 when json serialization fails for URL availability")
    void should_return_500_when_json_serialization_fails_for_url_availability() throws IOException {
        // given
        Slug normalizedSlug = new Slug("test-slug");
        AvailabilityResponseDto responseDto = new AvailabilityResponseDto(true, "test-slug");
        
        given(event.getRawPath()).willReturn("/public/isurlavailable/test-slug");
        given(slugGenerator.normalize("test-slug")).willReturn(normalizedSlug);
        given(publicPortfolioQueryService.isUrlAvailable(normalizedSlug)).willReturn(true);
        willThrow(new IOException("Serialization error")).given(jsonMapper).writeValueAsString(responseDto);

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }

    @Test
    @DisplayName("should return 500 when json serialization fails")
    void should_return_500_when_json_serialization_fails() throws IOException {
        // given
        PublicPortfolioView portfolioView = mock(PublicPortfolioView.class);
        
        given(event.getRawPath()).willReturn("/public/portfolio/my-awesome-portfolio");
        given(slugGenerator.normalize(slugString)).willReturn(slug);
        given(publicPortfolioQueryService.getPublishedByUrl(slug)).willReturn(Optional.of(portfolioView));
        willThrow(new IOException("Serialization error")).given(jsonMapper).writeValueAsString(portfolioView);

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }

    @Test
    @DisplayName("should return 500 when service throws exception")
    void should_return_500_when_service_throws_exception() {
        // given
        given(event.getRawPath()).willReturn("/public/portfolio/my-awesome-portfolio");
        given(slugGenerator.normalize(slugString)).willReturn(slug);
        willThrow(new RuntimeException("Database error")).given(publicPortfolioQueryService).getPublishedByUrl(slug);

        // when
        APIGatewayV2HTTPResponse response = handler.handlePublicPortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }
}
