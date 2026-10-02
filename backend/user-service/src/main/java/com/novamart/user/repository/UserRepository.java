package com.novamart.user.repository;

import com.novamart.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA Repository for database queries on the 'users' table.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Looks up an existing user by their unique email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if an email is already registered to prevent duplicate sign-ups.
     */
    Boolean existsByEmail(String email);
}
