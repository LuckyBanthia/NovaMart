package com.novamart.common.dto;

/**
 * Outgoing payload returned after successful login/registration,
 * providing the client with the JWT Bearer token and user profile.
 */
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserDTO user;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }
}
