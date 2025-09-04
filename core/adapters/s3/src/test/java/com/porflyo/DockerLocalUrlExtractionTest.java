package com.porflyo;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/**
 * Test específico para verificar que la extracción de keys funciona 
 * tanto en entorno local (Docker) como en producción (S3).
 * 
 * Resuelve el problema: "Failed to compress media count data" 
 * que ocurría porque extractKeyFromUrl devolvía null para URLs locales.
 */
class DockerLocalUrlExtractionTest {

    @Test
    void testLocalDockerUrlExtraction() {
        // Configuración como en application.yml para entorno local
        S3Config localConfig = new S3Config(
            5, 
            "us-east-1", 
            "media-test", 
            "http://host.docker.internal:8000"
        );
        
        S3UrlBuilder urlBuilder = new S3UrlBuilder(localConfig);
        
        // Simular URLs que se generan en entorno local
        String[] testUrls = {
            "http://host.docker.internal:8000/media-test/portfolio/123/image.png",
            "http://host.docker.internal:8000/media-test/uploads/file.pdf",
            "http://host.docker.internal:8000/media-test/docs/readme.txt"
        };
        
        String[] expectedKeys = {
            "portfolio/123/image.png",
            "uploads/file.pdf", 
            "docs/readme.txt"
        };
        
        for (int i = 0; i < testUrls.length; i++) {
            String extractedKey = urlBuilder.extractKeyFromUrl(testUrls[i]);
            
            assertNotNull(extractedKey, 
                "extractKeyFromUrl should not return null for local Docker URL: " + testUrls[i]);
            assertEquals(expectedKeys[i], extractedKey,
                "Extracted key should match expected value for URL: " + testUrls[i]);
        }
    }
    
    @Test 
    void testProductionS3UrlExtraction() {
        // Configuración para producción (endpoint null)
        S3Config prodConfig = new S3Config(
            5, 
            "us-east-1", 
            "my-production-bucket", 
            null
        );
        
        S3UrlBuilder urlBuilder = new S3UrlBuilder(prodConfig);
        
        String testUrl = "https://media.porflyo.com/portfolio/123/image.png";
        String extractedKey = urlBuilder.extractKeyFromUrl(testUrl);
        
        assertNotNull(extractedKey, "extractKeyFromUrl should not return null for production URL");
        assertEquals("portfolio/123/image.png", extractedKey);
    }
    
    @Test
    void testBuildAndExtractRoundTrip_Local() {
        S3Config localConfig = new S3Config(
            5, 
            "us-east-1", 
            "media-test", 
            "http://host.docker.internal:8000"
        );
        
        S3UrlBuilder urlBuilder = new S3UrlBuilder(localConfig);
        
        String originalKey = "portfolio/user123/profile.jpg";
        
        // Build URL and then extract key - should get back the original
        String builtUrl = urlBuilder.buildPublicUrl(originalKey);
        String extractedKey = urlBuilder.extractKeyFromUrl(builtUrl);
        
        assertEquals(originalKey, extractedKey, 
            "Round-trip build->extract should return original key");
    }
    
    @Test
    void testBuildAndExtractRoundTrip_Production() {
        S3Config prodConfig = new S3Config(
            5, 
            "us-east-1", 
            "my-bucket", 
            null
        );
        
        S3UrlBuilder urlBuilder = new S3UrlBuilder(prodConfig);
        
        String originalKey = "portfolio/user123/profile.jpg";
        
        // Build URL and then extract key - should get back the original
        String builtUrl = urlBuilder.buildPublicUrl(originalKey);
        String extractedKey = urlBuilder.extractKeyFromUrl(builtUrl);
        
        assertEquals(originalKey, extractedKey, 
            "Round-trip build->extract should return original key");
    }
}
