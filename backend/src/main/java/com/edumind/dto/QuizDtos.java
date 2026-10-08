package com.edumind.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public final class QuizDtos {
    private QuizDtos() { }

    public record QuestionRequest(@NotBlank String prompt, @NotBlank String optionA,
                                  @NotBlank String optionB, @NotBlank String optionC,
                                  @NotBlank String optionD, @NotBlank String correctOption,
                                  @NotBlank String topic, Integer points) { }
    public record QuestionDto(Long id, String prompt, String optionA, String optionB,
                              String optionC, String optionD, String topic, Integer points) { }
    public record QuestionAdminDto(Long id, String prompt, String optionA, String optionB,
                                   String optionC, String optionD, String correctOption,
                                   String topic, Integer points) { }
    public record QuizRequest(@NotBlank String title, String description,
                              @NotNull Long subjectId,
                              @NotEmpty List<@Valid QuestionRequest> questions) { }
    public record QuizDto(Long id, String title, String description, Long subjectId,
                          String subject, int questionCount) { }
    public record QuizDetailDto(Long id, String title, String description, Long subjectId,
                                String subject, List<QuestionDto> questions) { }
    public record AnswerRequest(@NotNull Long questionId, String selectedOption) { }
    public record SubmitRequest(@NotNull Long studentId,
                                @NotEmpty List<@Valid AnswerRequest> answers) { }
    public record AnswerResult(Long questionId, String selectedOption, String correctOption,
                               boolean correct, String topic) { }
    public record AttemptDto(Long id, Long quizId, String quizTitle, Integer score,
                             Integer maxScore, Double percentage, Integer correctCount,
                             Integer totalQuestions, List<String> weakTopics,
                             List<AnswerResult> answers, Instant submittedAt) { }
}