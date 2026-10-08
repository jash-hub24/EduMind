package com.edumind.dto;

import com.edumind.model.UserRole;

public record StudentDto(Long id, Long userId, String fullName, String email,
                         String department, Integer semester, UserRole role) { }