package com.edumind.dto;

import java.util.List;

public record ProgressDto(Long studentId, Double studyHours, Integer quizAttempts,
                          Double averageScore, Integer completedMaterials,
                          List<String> weakTopics, Integer studyStreak,
                          List<RecentAttemptDto> recentAttempts) {
    public record RecentAttemptDto(Long attemptId, String quizTitle, Double percentage, String submittedAt) { }
}