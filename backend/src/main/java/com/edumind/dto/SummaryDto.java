package com.edumind.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public record SummaryDto(Long id, @NotNull Long materialId, String overview,
                         @NotEmpty List<String> keyPoints, Instant updatedAt) { }