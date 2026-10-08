package com.edumind.repository;

import com.edumind.model.QuizAttempt;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
}