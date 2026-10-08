package com.edumind.controller;

import com.edumind.dto.QuizDtos.*;
import com.edumind.service.QuizService;
import com.edumind.service.StudentAccessService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    private final QuizService quizzes;
    private final StudentAccessService studentAccess;
    public QuizController(QuizService quizzes, StudentAccessService studentAccess) {
        this.quizzes = quizzes;
        this.studentAccess = studentAccess;
    }

    @GetMapping public List<QuizDto> findAll() { return quizzes.findAll(); }
    @GetMapping("/{id}") public QuizDto findById(@PathVariable Long id) { return quizzes.findById(id); }
    @GetMapping("/{id}/questions") public List<QuestionDto> findQuestions(@PathVariable Long id) { return quizzes.findQuestions(id); }
    @GetMapping("/{id}/admin-questions") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public List<QuestionAdminDto> findAdminQuestions(@PathVariable Long id) { return quizzes.findAdminQuestions(id); }
    @GetMapping("/attempts/{attemptId}") @PreAuthorize("hasRole('STUDENT')")
    public AttemptDto findAttempt(@PathVariable Long attemptId, Authentication authentication) {
        AttemptDto attempt = quizzes.findAttempt(attemptId);
        studentAccess.requireAccessForAttempt(attemptId, authentication.getName());
        return attempt;
    }
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public QuizDto create(@Valid @RequestBody QuizRequest request, Authentication authentication) {
        return quizzes.create(request, authentication.getName());
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public QuizDto update(@PathVariable Long id, @Valid @RequestBody QuizRequest request) { return quizzes.update(id, request); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public void delete(@PathVariable Long id) { quizzes.delete(id); }

    @PostMapping("/{id}/questions") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public QuestionDto createQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return quizzes.createQuestion(id, request);
    }
    @PutMapping("/{id}/questions/{questionId}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public QuestionDto updateQuestion(@PathVariable Long id, @PathVariable Long questionId,
                                      @Valid @RequestBody QuestionRequest request) {
        return quizzes.updateQuestion(id, questionId, request);
    }
    @DeleteMapping("/{id}/questions/{questionId}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public void deleteQuestion(@PathVariable Long id, @PathVariable Long questionId) { quizzes.deleteQuestion(id, questionId); }

    @PostMapping("/{id}/submit") @PreAuthorize("hasRole('STUDENT')")
    public AttemptDto submit(@PathVariable Long id, @Valid @RequestBody SubmitRequest request, Authentication authentication) {
        studentAccess.requireAccess(request.studentId(), authentication.getName());
        return quizzes.submit(id, request);
    }
}