package com.edumind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FlashcardDto(Long id, @NotBlank String question, @NotBlank String answer,
                           @NotNull Long subjectId, String subject,
                           @NotBlank String topic, @NotBlank String difficulty) { }