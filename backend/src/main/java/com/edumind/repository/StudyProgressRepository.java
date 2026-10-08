package com.edumind.repository;

import com.edumind.model.StudyProgress;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyProgressRepository extends JpaRepository<StudyProgress, Long> {
    Optional<StudyProgress> findByStudentId(Long studentId);
}