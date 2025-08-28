package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;

import java.io.IOException;
import java.util.List;
import java.util.Map;
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
import com.porflyo.dto.PortfolioCreateDto;
import com.porflyo.dto.PortfolioPatchDto;
import com.porflyo.dto.PortfolioPublishDto;
import com.porflyo.dto.PublicPortfolioDto;
import com.porflyo.mapper.PortfolioCreateDtoMapper;
import com.porflyo.mapper.PortfolioPatchDtoMapper;
import com.porflyo.mapper.PublicPortfolioDtoMapper;
import com.porflyo.model.ids.PortfolioId;
import com.porflyo.model.ids.UserId;
import com.porflyo.model.portfolio.Portfolio;
import com.porflyo.model.user.UserClaims;
import com.porflyo.ports.input.AuthUseCase;
import com.porflyo.ports.input.PortfolioUseCase;

import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;

@ExtendWith(MockitoExtension.class)
@DisplayName("Portfolio Lambda Handler Tests")
class PortfolioLambdaHandlerTest {

    @Mock JsonMapper jsonMapper;
    @Mock PublicPortfolioDtoMapper publicPortfolioDtoMapper;
    @Mock PortfolioCreateDtoMapper portfolioCreateDtoMapper;
    @Mock PortfolioPatchDtoMapper portfolioPatchDtoMapper;
    @Mock PortfolioUseCase portfolioService;
    @Mock AuthUseCase authService;

    @InjectMocks PortfolioLambdaHandler handler;

    private final UserId userId = new UserId("user123");
    private final PortfolioId portfolioId = new PortfolioId("portfolio123");
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

    // ────────────────────────── Create Portfolio ──────────────────────────

    @Test
    @DisplayName("should create portfolio when valid request")
    void should_create_portfolio_when_valid_request() throws IOException {
        // given
        String requestBody = """
            {
                "template": "modern",
                "title": "My Portfolio",
                "description": "Test description",
                "sections": []
            }
            """;
        PortfolioCreateDto createDto = new PortfolioCreateDto("modern", "My Portfolio", "Test description", List.of());
        Portfolio portfolio = mock(Portfolio.class);
        PortfolioId portfolioIdMock = mock(PortfolioId.class);
        given(portfolio.id()).willReturn(portfolioIdMock);
        given(portfolioIdMock.value()).willReturn("portfolio123");
        PublicPortfolioDto responseDto = new PublicPortfolioDto("portfolio123", "modern", "My Portfolio", "Test description", List.of(), List.of(), 1, null, false);
        
        given(event.getRawPath()).willReturn("/api/portfolio/create");
        given(event.getBody()).willReturn(requestBody);
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(jsonMapper.readValue(requestBody, PortfolioCreateDto.class)).willReturn(createDto);
        given(portfolioCreateDtoMapper.toDomain(createDto, userId)).willReturn(portfolio);
        given(publicPortfolioDtoMapper.toDto(portfolio)).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"id\":\"portfolio123\"}");
        // Stub the void method
        willDoNothing().given(portfolioService).createDraft(portfolio);

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(201);
        assertThat(response.getBody()).isEqualTo("{\"id\":\"portfolio123\"}");
        then(portfolioService).should().createDraft(portfolio);
    }

    @Test
    @DisplayName("should return 400 when invalid request body for create")
    void should_return_400_when_invalid_request_body_for_create() throws IOException {
        // given
        String invalidJson = "invalid json";
        
        given(event.getRawPath()).willReturn("/api/portfolio/create");
        given(event.getBody()).willReturn(invalidJson);
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(jsonMapper.readValue(invalidJson, PortfolioCreateDto.class)).willThrow(new IOException("Invalid JSON"));

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Invalid request body");
        then(portfolioService).should(never()).createDraft(any());
    }

    // ────────────────────────── List Portfolios ──────────────────────────

    @Test
    @DisplayName("should list portfolios when valid request")
    void should_list_portfolios_when_valid_request() throws IOException {
        // given
        Portfolio portfolio1 = mock(Portfolio.class);
        Portfolio portfolio2 = mock(Portfolio.class);
        List<Portfolio> portfolios = List.of(portfolio1, portfolio2);
        PublicPortfolioDto dto1 = mock(PublicPortfolioDto.class);
        PublicPortfolioDto dto2 = mock(PublicPortfolioDto.class);
        
        given(event.getRawPath()).willReturn("/api/portfolio/list");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(portfolioService.listByOwner(userId)).willReturn(portfolios);
        given(publicPortfolioDtoMapper.toDto(portfolio1)).willReturn(dto1);
        given(publicPortfolioDtoMapper.toDto(portfolio2)).willReturn(dto2);
        given(jsonMapper.writeValueAsString(List.of(dto1, dto2))).willReturn("[{},{}}]");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("[{},{}}]");
        then(portfolioService).should().listByOwner(userId);
    }

    // ────────────────────────── Get Portfolio ──────────────────────────

    @Test
    @DisplayName("should get portfolio when valid portfolio id")
    void should_get_portfolio_when_valid_portfolio_id() throws IOException {
        // given
        Portfolio portfolio = mock(Portfolio.class);
        PublicPortfolioDto responseDto = mock(PublicPortfolioDto.class);
        
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("GET");
        given(portfolioService.findById(userId, portfolioId)).willReturn(Optional.of(portfolio));
        given(publicPortfolioDtoMapper.toDto(portfolio)).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"id\":\"portfolio123\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"id\":\"portfolio123\"}");
        then(portfolioService).should().findById(userId, portfolioId);
    }

    @Test
    @DisplayName("should return 404 when portfolio not found")
    void should_return_404_when_portfolio_not_found() {
        // given
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("GET");
        given(portfolioService.findById(userId, portfolioId)).willReturn(Optional.empty());

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).contains("Portfolio not found");
    }

    // ────────────────────────── Patch Portfolio ──────────────────────────

    @Test
    @DisplayName("should patch portfolio when valid request")
    void should_patch_portfolio_when_valid_request() throws IOException {
        // given
        String requestBody = "{\"title\":\"Updated Title\"}";
        Map<String, Object> attributes = Map.of("title", "Updated Title");
        PortfolioPatchDto patchDto = mock(PortfolioPatchDto.class);
        Portfolio updatedPortfolio = mock(Portfolio.class);
        PublicPortfolioDto responseDto = mock(PublicPortfolioDto.class);
        
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getBody()).willReturn(requestBody);
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("PATCH");
        Argument<Map<String, Object>> mapArgument = Argument.mapOf(String.class, Object.class);
        given(jsonMapper.readValue(eq(requestBody), eq(mapArgument))).willReturn(attributes);
        given(portfolioPatchDtoMapper.toPatch(attributes)).willReturn(patchDto);
        given(portfolioService.patchPortfolio(eq(userId), eq(portfolioId), eq(patchDto))).willReturn(updatedPortfolio);
        given(publicPortfolioDtoMapper.toDto(updatedPortfolio)).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"id\":\"portfolio123\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"id\":\"portfolio123\"}");
        
        then(portfolioPatchDtoMapper).should().toPatch(attributes);
        then(portfolioService).should().patchPortfolio(eq(userId), eq(portfolioId), eq(patchDto));
    }

    // ────────────────────────── Publish Portfolio ──────────────────────────

    @Test
    @DisplayName("should publish portfolio when valid request")
    void should_publish_portfolio_when_valid_request() throws IOException {
        // given
        String requestBody = "{\"url\":\"my-portfolio\",\"published\":true}";
        PortfolioPublishDto publishDto = new PortfolioPublishDto("my-portfolio", true);
        Portfolio publishedPortfolio = mock(Portfolio.class);
        PublicPortfolioDto responseDto = mock(PublicPortfolioDto.class);
        
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getBody()).willReturn(requestBody);
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("POST");
        given(jsonMapper.readValue(requestBody, PortfolioPublishDto.class)).willReturn(publishDto);
        given(portfolioService.setUrlAndVisibility(userId, portfolioId, "my-portfolio", true)).willReturn(publishedPortfolio);
        given(publicPortfolioDtoMapper.toDto(publishedPortfolio)).willReturn(responseDto);
        given(jsonMapper.writeValueAsString(responseDto)).willReturn("{\"id\":\"portfolio123\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"id\":\"portfolio123\"}");
        then(portfolioService).should().setUrlAndVisibility(userId, portfolioId, "my-portfolio", true);
    }

    // ────────────────────────── Delete Portfolio ──────────────────────────

    @Test
    @DisplayName("should delete portfolio when valid request")
    void should_delete_portfolio_when_valid_request() {
        // given
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("DELETE");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        assertThat(response.getBody()).isNull();
        then(portfolioService).should().delete(userId, portfolioId);
    }

    // ────────────────────────── Error Handling ──────────────────────────

    @Test
    @DisplayName("should return 400 when invalid portfolio id")
    void should_return_400_when_invalid_portfolio_id() {
        // given - use a whitespace-only portfolio ID that will fail validation
        given(event.getRawPath()).willReturn("/api/portfolio/ ");  // Space-only ID should be considered blank
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("GET");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(400);
        assertThat(response.getBody()).contains("Invalid portfolio ID");
    }

    @Test
    @DisplayName("should return 405 when unsupported http method")
    void should_return_405_when_unsupported_http_method() {
        // given
        given(event.getRawPath()).willReturn("/api/portfolio/portfolio123");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        given(http.getMethod()).willReturn("PUT");

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(405);
        assertThat(response.getBody()).contains("Method Not Allowed");
    }

    @Test
    @DisplayName("should return 500 when service throws exception")
    void should_return_500_when_service_throws_exception() {
        // given
        given(event.getRawPath()).willReturn("/api/portfolio/list");
        given(event.getHeaders()).willReturn(Map.of("Cookie", "session=session-token"));
        willThrow(new RuntimeException("Database error")).given(portfolioService).listByOwner(userId);

        // when
        APIGatewayV2HTTPResponse response = handler.handlePortfolioRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).contains("Internal Server Error");
    }
}
