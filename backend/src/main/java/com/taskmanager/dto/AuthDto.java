package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDto {

    @Data
    public static class SignupRequest {
        @NotBlank
        private String name;
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
        private String role; // "ADMIN" or "MEMBER"
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private String name;
        private String role;
        private Long id;

        public AuthResponse(String token, String email, String name, String role, Long id) {
            this.token = token;
            this.email = email;
            this.name = name;
            this.role = role;
            this.id = id;
        }
    }
}
