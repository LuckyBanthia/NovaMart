package com.novamart.user.config;

import com.novamart.common.enums.Role;
import com.novamart.user.model.User;
import com.novamart.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Automatically runs on microservice startup to seed ready-to-test
 * default accounts (Administrator and Customer).
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed Administrator Demo Account
        if (!userRepository.existsByEmail("admin@novamart.com")) {
            User admin = new User();
            admin.setName("Aura Admin");
            admin.setEmail("admin@novamart.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ROLE_ADMIN);
            admin.setPhone("+1 (555) 019-2834");
            admin.setAddress("100 Innovation Way, Silicon Valley, CA");
            userRepository.save(admin);
        }

        // Seed Customer Demo Account
        if (!userRepository.existsByEmail("user@novamart.com")) {
            User customer = new User();
            customer.setName("Sarah Connor");
            customer.setEmail("user@novamart.com");
            customer.setPassword(passwordEncoder.encode("user123"));
            customer.setRole(Role.ROLE_CUSTOMER);
            customer.setPhone("+1 (555) 382-9102");
            customer.setAddress("742 Evergreen Terrace, Springfield, OR");
            userRepository.save(customer);
        }
    }
}
