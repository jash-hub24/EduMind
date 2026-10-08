package com.edumind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectDto(Long id, @NotBlank @Size(max = 120) String name,
                         @Size(max = 1000) String description) { }