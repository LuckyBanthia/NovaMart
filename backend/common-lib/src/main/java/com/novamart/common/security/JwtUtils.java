package com.novamart.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Shared JWT Utility class used across microservices to generate and validate
 * stateless JSON Web Tokens.
 * 
 * Flow:
 * 1. User logs in with email + password in user-service.
 * 2. user-service calls generateToken(email, role) and signs it with HMAC-SHA256.
 * 3. Frontend saves this token and sends it in the "Authorization: Bearer <token>" header.
 * 4. Gateway and services validate the signature with the shared secret key.
 */
public class JwtUtils {

    // Default 256-bit secure secret key
    private static final String DEFAULT_SECRET = "NovamartSuperSecretKeyForJwtSigningMustBeAtLeast256BitsLong2026";
    
    // Default expiration: 24 hours in milliseconds
    private static final long DEFAULT_EXPIRATION_MS = 86400000L;

    private final String secret;
    private final long expirationMs;

    public JwtUtils() {
        this(DEFAULT_SECRET, DEFAULT_EXPIRATION_MS);
    }

    public JwtUtils(String secret, long expirationMs) {
        this.secret = (secret != null && !secret.isBlank()) ? secret : DEFAULT_SECRET;
        this.expirationMs = expirationMs > 0 ? expirationMs : DEFAULT_EXPIRATION_MS;
    }

    /**
     * Derives a cryptographic HMAC-SHA key from the secret string.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a signed JWT token containing the user's email as subject
     * and their authorization role as a custom claim.
     *
     * @param email User's login email
     * @param role User's role (ROLE_CUSTOMER or ROLE_ADMIN)
     * @return Compact serialized JWT string
     */
    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the subject (email) from an existing JWT token.
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    /**
     * Extracts the role claim from an existing JWT token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("role", String.class);
    }

    /**
     * Validates whether a token is authentic, unexpired, and correctly signed.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Token is invalid, expired, or tampered with
            return false;
        }
    }
}
