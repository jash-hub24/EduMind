package com.edumind.repository;

import com.edumind.model.Flashcard;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findBySubjectId(Long subjectId);
}