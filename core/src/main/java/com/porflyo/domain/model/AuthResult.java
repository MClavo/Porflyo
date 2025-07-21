package com.porflyo.domain.model;


/**
 * Represents the result of an authentication operation.
 *
 * @param success Indicates whether the authentication was successful.
 * @param message A message providing additional information about the authentication result.
 */
public record AuthResult(
    boolean success,
    String message
) {

    /**
     * Creates a successful AuthResult.
     *
     * @param message A message indicating success.
     * @return An AuthResult indicating success.
     */
    public static AuthResult success(String message) {
        return new AuthResult(true, message);
    }

    /**
     * Creates a failed AuthResult.
     *
     * @param message A message indicating the reason for failure.
     * @return An AuthResult indicating failure.
     */
    public static AuthResult failure(String message) {
        return new AuthResult(false, message);
    }

    /**
     * Checks if the authentication was successful.
     *
     * @return true if the authentication was successful, false otherwise.
     */
    public boolean isSuccess() {
        return success;
    }
}
