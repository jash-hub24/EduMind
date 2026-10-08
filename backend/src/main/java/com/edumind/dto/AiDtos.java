package com.edumind.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class AiDtos {
    private AiDtos() { }

    public record AskRequest(@NotBlank String prompt, Long studentId) { }
    public record AskResponse(String response, String mode) { }
    public record SummarizeRequest(@NotNull Long materialId) { }
    public record FlashcardsRequest(@NotBlank String topic, Long subjectId) { }
    public record FlashcardIdea(String question, String answer, String topic) { }
    public record ScanSolveRequest(@NotBlank String question) { }
    public record RecommendationRequest(Long studentId) { }
    public record RecommendationDto(String title, String reason, Long resourceId, String priority) { }
    public record RecommendationsResponse(List<RecommendationDto> recommendations, String mode) { }
}