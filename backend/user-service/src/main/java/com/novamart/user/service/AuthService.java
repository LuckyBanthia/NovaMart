package com.novamart.user.service;

import com.novamart.common.dto.*;
import com.novamart.common.enums.Role;
import com.novamart.common.security.JwtUtils;
import com.novamart.user.model.User;
import com.novamart.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Core business service handling authentication, account creation,
 * and JWT token issuance.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Registers a new customer account.
     * Validates that the email is unique, hashes password with BCrypt, and saves.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with email " + request.getEmail() + " already exists.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail().toLowerCase().trim());
        // Securely hash password before storing in database
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_CUSTOMER);
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        User savedUser = userRepository.save(user);

        // Generate JWT token so the user is immediately logged in after registration
        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return new AuthResponse(token, mapToDTO(savedUser));
    }

    /**
     * Authenticates existing user credentials and returns a fresh JWT token.
     */
    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify plain-text input password against stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, mapToDTO(user));
    }

    /**
     * Retrieves the profile of a user based on their JWT token subject.
     */
    public UserDTO getUserProfile(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (!jwtUtils.validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired session token");
        }

        String email = jwtUtils.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return mapToDTO(user);
    }

    /**
     * Helper method to map User JPA Entity to safe UserDTO.
     */
    public UserDTO mapToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getAddress()
        );
    }
}
