package com.edumind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record StudyMaterialDto(Long id,
                               @NotBlank @Size(max = 180) String title,
                               @Size(max = 3000) String description,
                               @NotNull Long subjectId, String subject,
                               @NotBlank @Size(max = 120) String topic,
                               Integer semester,
                               @NotBlank String resourceType, String difficulty,
                               String fileUrl, Long uploadedBy, Instant createdAt) { }