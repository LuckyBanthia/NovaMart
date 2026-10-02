package com.novamart.user.controller;

import com.novamart.common.dto.*;
import com.novamart.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing user authentication and profile endpoints.
 * All paths start with /api/auth and are accessible via API Gateway (port 8080).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register
     * Accepts customer details, creates an account, and returns JWT token.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.ok("Registration successful! Welcome to NovaMart.", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     * Validates credentials and returns a 24-hour Bearer token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.ok("Login successful!", response));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(ApiResponse.error(ex.getMessage()));
        }
    }

    /**
     * GET /api/auth/me
     * Returns the currently authenticated user's profile details.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Missing Authorization token"));
        }
        try {
            UserDTO profile = authService.getUserProfile(authHeader);
            return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profile));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(401).body(ApiResponse.error(ex.getMessage()));
        }
    }
}
