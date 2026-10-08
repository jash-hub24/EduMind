package com.edumind.service;

import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.UserRole;
import com.edumind.repository.QuizAttemptRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class StudentAccessService {
    private final StudentRepository students;
    private final UserRepository users;
    private final QuizAttemptRepository attempts;

    public StudentAccessService(StudentRepository students, UserRepository users, QuizAttemptRepository attempts) {
        this.students = students;
        this.users = users;
        this.attempts = attempts;
    }

    public void requireAccess(Long studentId, String email) {
        var user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User", email));
        if (user.getRole() == UserRole.FACULTY_ADMIN) return;
        Long ownStudentId = students.findByUserId(user.getId()).map(student -> student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile", user.getId()));
        if (!ownStudentId.equals(studentId)) throw new AccessDeniedException("You may only access your own student data");
    }

    public void requireAccessForAttempt(Long attemptId, String email) {
        var attempt = attempts.findById(attemptId).orElseThrow(() -> new ResourceNotFoundException("Quiz attempt", attemptId));
        requireAccess(attempt.getStudent().getId(), email);
    }
}