package com.novamart.common.dto;

import com.novamart.common.enums.Role;

/**
 * Data Transfer Object (DTO) for safely sharing user profile details
 * without ever exposing the sensitive hashed password field.
 */
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String address;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String email, Role role, String phone, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
