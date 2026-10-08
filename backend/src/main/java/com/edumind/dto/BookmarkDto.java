package com.edumind.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record BookmarkDto(Long id, Long studentId, @NotNull Long materialId,
                          String title, String resourceType, String subject, Instant createdAt) { }