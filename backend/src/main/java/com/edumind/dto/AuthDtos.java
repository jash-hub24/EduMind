package com.edumind.dto;

import com.edumind.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(@NotBlank @Size(max = 120) String fullName,
                                  @NotBlank @Email @Size(max = 190) String email,
                                  @NotBlank @Size(min = 8, max = 72) String password,
                                  @Size(max = 120) String department,
                                  @Min(1) @Max(12) Integer semester,
                                  UserRole role) { }
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }
    public record AuthResponse(String token, String tokenType, Long userId, Long studentId,
                               String fullName, String email, UserRole role) { }
    public record UserDto(Long id, String fullName, String email, UserRole role) { }
}