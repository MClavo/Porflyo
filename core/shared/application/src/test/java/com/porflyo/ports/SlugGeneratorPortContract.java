package com.porflyo.ports;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.porflyo.model.portfolio.Slug;

public abstract class SlugGeneratorPortContract {
    
    protected SlugGeneratorPort slugGeneratorPort;

    protected SlugGeneratorPortContract(SlugGeneratorPort slugGeneratorPort) {
        this.slugGeneratorPort = slugGeneratorPort;
    }

    @Test
    @DisplayName("should normalize simple text when given basic string")
    protected void shouldNormalizeSimpleText_whenGivenBasicString() {
        // Given
        String text = "Hello World";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertEquals("hello-world", result.value(), "Should convert to lowercase with dashes");
    }

    @Test
    @DisplayName("should handle special characters when text contains symbols")
    protected void shouldHandleSpecialCharacters_whenTextContainsSymbols() {
        // Given
        String text = "My Awesome Project!@#$%^&*()";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertTrue(result.value().matches("^[a-z0-9-]+$"), "Should only contain lowercase letters, numbers and dashes");
    }

    @Test
    @DisplayName("should handle accented characters when text contains accents")
    protected void shouldHandleAccentedCharacters_whenTextContainsAccents() {
        // Given
        String text = "Café con Leche ñoño";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertTrue(result.value().matches("^[a-z0-9-]+$"), "Should transliterate accented characters");
        // Note: The exact transliteration depends on the Slugify library implementation
        // We verify that it contains transliterated characters without exact match
    }

    @Test
    @DisplayName("should truncate long text when input exceeds maximum length")
    protected void shouldTruncateLongText_whenInputExceedsMaximumLength() {
        // Given
        String longText = "This is a very very very long text that exceeds the maximum allowed length for a slug";

        // When
        Slug result = slugGeneratorPort.normalize(longText);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertTrue(result.value().length() <= Slug.MAX_LEN, "Should not exceed maximum length of " + Slug.MAX_LEN);
        assertTrue(result.value().length() >= Slug.MIN_LEN, "Should be at least minimum length of " + Slug.MIN_LEN);
    }

    @Test
    @DisplayName("should handle empty spaces when text has multiple spaces")
    protected void shouldHandleEmptySpaces_whenTextHasMultipleSpaces() {
        // Given
        String text = "  Multiple   Spaces   Between   Words  ";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertTrue(result.value().matches("^[a-z0-9-]+$"), "Should only contain valid slug characters");
        assertEquals("multiple-spaces-between-words", result.value(), "Should normalize multiple spaces to single dashes");
    }

    @Test
    @DisplayName("should handle numeric text when input contains numbers")
    protected void shouldHandleNumericText_whenInputContainsNumbers() {
        // Given
        String text = "Project 2024 Version 1.0";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertTrue(result.value().matches("^[a-z0-9-]+$"), "Should preserve numbers in slug");
        assertTrue(result.value().contains("2024"), "Should keep numbers in the slug");
    }

    @Test
    @DisplayName("should handle dash characters when text already contains dashes")
    protected void shouldHandleDashCharacters_whenTextAlreadyContainsDashes() {
        // Given
        String text = "pre-existing-dashes";

        // When
        Slug result = slugGeneratorPort.normalize(text);

        // Then
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.value(), "Slug value should not be null");
        assertEquals("pre-existing-dashes", result.value(), "Should preserve existing dashes");
        assertTrue(result.value().matches("^[a-z0-9-]+$"), "Should be valid slug format");
    }
}
