package com.porflyo;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

class S3UrlBuilderTest {

    private S3UrlBuilder s3UrlBuilder;
    private S3Config localConfig;
    private S3Config prodConfig;

    @BeforeEach
    void setup() {
        // Local development config
        localConfig = new S3Config(
            "test", 
            "test", 
            5, 
            "us-east-1", 
            "media-test", 
            "http://host.docker.internal:8000"
        );
        
        // Production config
        prodConfig = new S3Config(
            "access", 
            "secret", 
            5, 
            "us-east-1", 
            "my-bucket", 
            ""
        );
    }

    @Test
    void extractKeyFromUrl_localEnvironment() {
        s3UrlBuilder = new S3UrlBuilder(localConfig);
        
        String url = "http://host.docker.internal:8000/media-test/portfolio/image.png";
        String key = s3UrlBuilder.extractKeyFromUrl(url);
        
        assertEquals("portfolio/image.png", key);
    }
    
    @Test
    void extractKeyFromUrl_productionEnvironment() {
        s3UrlBuilder = new S3UrlBuilder(prodConfig);
        
        String url = "https://my-bucket.s3.amazonaws.com/portfolio/image.png";
        String key = s3UrlBuilder.extractKeyFromUrl(url);
        
        assertEquals("portfolio/image.png", key);
    }
    
    @Test
    void extractKeyFromUrl_invalidUrl_returnsNull() {
        s3UrlBuilder = new S3UrlBuilder(localConfig);
        
        String url = "https://other-domain.com/file.png";
        String key = s3UrlBuilder.extractKeyFromUrl(url);
        
        assertNull(key);
    }
    
    @Test
    void extractKeyFromUrl_nullUrl_returnsNull() {
        s3UrlBuilder = new S3UrlBuilder(localConfig);
        
        String key = s3UrlBuilder.extractKeyFromUrl(null);
        
        assertNull(key);
    }

    @Test
    void buildPublicUrl_localEnvironment() {
        s3UrlBuilder = new S3UrlBuilder(localConfig);
        
        String url = s3UrlBuilder.buildPublicUrl("portfolio/image.png");
        
        assertEquals("http://host.docker.internal:8000/media-test/portfolio/image.png", url);
    }

    @Test
    void buildPublicUrl_productionEnvironment() {
        s3UrlBuilder = new S3UrlBuilder(prodConfig);
        
        String url = s3UrlBuilder.buildPublicUrl("portfolio/image.png");
        
        assertEquals("https://my-bucket.s3.amazonaws.com/portfolio/image.png", url);
    }
}
