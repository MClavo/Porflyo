package com.porflyo.handler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayV2HTTPResponse;
import com.porflyo.dto.PresignRequestDto;
import com.porflyo.dto.PresignedPostDto;
import com.porflyo.ports.input.MediaUseCase;

import io.micronaut.json.JsonMapper;


@ExtendWith(MockitoExtension.class)
@DisplayName("Media Lambda Handler Tests")
class MediaLambdaHandlerTest {

    @Mock
    private JsonMapper jsonMapper;

    @Mock
    private MediaUseCase mediaUseCase;

    private MediaLambdaHandler handler;

    @BeforeEach
    void setUp() {
        handler = new MediaLambdaHandler(jsonMapper, mediaUseCase);
    }

    @Test
    void should_generatePresignedUrl_when_postRequestWithValidBody() throws Exception {
        // given
        String requestBody = """
                {
                    "key": "test-image.jpg",
                    "contentType": "image/jpeg",
                    "size": 1024,
                    "md5": "abc123hash"
                }
                """;
        
        PresignRequestDto requestDto = new PresignRequestDto(
                "test-image.jpg",
                "image/jpeg", 
                1024L,
                "abc123hash"
        );
        
        PresignedPostDto presignedPost = new PresignedPostDto(
                "https://bucket.s3.amazonaws.com/",
                Map.of("key", List.of("test-image.jpg"))
        );
        
        APIGatewayV2HTTPEvent event = createEvent("POST", null, requestBody);
        
        given(jsonMapper.readValue(requestBody, PresignRequestDto.class)).willReturn(requestDto);
        given(mediaUseCase.createPresignedPut("test-image.jpg", "image/jpeg", 1024L, "abc123hash"))
                .willReturn(presignedPost);
        given(jsonMapper.writeValueAsString(presignedPost)).willReturn("{\"url\":\"https://bucket.s3.amazonaws.com/\"}");

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("{\"url\":\"https://bucket.s3.amazonaws.com/\"}");
        then(mediaUseCase).should().createPresignedPut("test-image.jpg", "image/jpeg", 1024L, "abc123hash");
    }

    @Test
    void should_deleteMediaObject_when_deleteRequestWithValidKey() {
        // given
        String key = "test-image.jpg";
        APIGatewayV2HTTPEvent event = createEvent("DELETE", key, null);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(204);
        assertThat(response.getBody()).isEqualTo("No Content");
        then(mediaUseCase).should().delete(key);
    }

    @Test
    void should_returnNotFound_when_unsupportedMethod() {
        // given
        APIGatewayV2HTTPEvent event = createEvent("GET", null, null);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(404);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Not Found\"}");
    }

    @Test
    void should_returnInternalServerError_when_jsonMapperThrowsException() throws Exception {
        // given
        String requestBody = "invalid-json";
        APIGatewayV2HTTPEvent event = createEvent("POST", null, requestBody);
        
        given(jsonMapper.readValue(requestBody, PresignRequestDto.class))
                .willThrow(new RuntimeException("JSON parsing error"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }

    @Test
    void should_returnInternalServerError_when_mediaUseCaseThrowsException() throws Exception {
        // given
        String requestBody = """
                {
                    "key": "test-image.jpg",
                    "contentType": "image/jpeg",
                    "size": 1024,
                    "md5": "abc123hash"
                }
                """;
        
        PresignRequestDto requestDto = new PresignRequestDto(
                "test-image.jpg",
                "image/jpeg", 
                1024L,
                "abc123hash"
        );
        
        APIGatewayV2HTTPEvent event = createEvent("POST", null, requestBody);
        
        given(jsonMapper.readValue(requestBody, PresignRequestDto.class)).willReturn(requestDto);
        given(mediaUseCase.createPresignedPut("test-image.jpg", "image/jpeg", 1024L, "abc123hash"))
                .willThrow(new RuntimeException("Media service error"));

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }

    @Test
    void should_returnInternalServerError_when_deleteMediaThrowsException() {
        // given
        String key = "test-image.jpg";
        APIGatewayV2HTTPEvent event = createEvent("DELETE", key, null);
        
        willThrow(new RuntimeException("Delete failed")).given(mediaUseCase).delete(key);

        // when
        APIGatewayV2HTTPResponse response = handler.handleMediaRequest(event);

        // then
        assertThat(response.getStatusCode()).isEqualTo(500);
        assertThat(response.getBody()).isEqualTo("{\"error\": \"Internal Server Error\"}");
    }

    private APIGatewayV2HTTPEvent createEvent(String method, String key, String body) {
        APIGatewayV2HTTPEvent event = new APIGatewayV2HTTPEvent();
        
        APIGatewayV2HTTPEvent.RequestContext requestContext = new APIGatewayV2HTTPEvent.RequestContext();
        APIGatewayV2HTTPEvent.RequestContext.Http http = new APIGatewayV2HTTPEvent.RequestContext.Http();
        http.setMethod(method);
        requestContext.setHttp(http);
        event.setRequestContext(requestContext);
        
        if (key != null) {
            event.setPathParameters(Map.of("key", key));
        } else {
            event.setPathParameters(Map.of()); // Empty map instead of null
        }
        
        if (body != null) {
            event.setBody(body);
        }
        
        return event;
    }
}
