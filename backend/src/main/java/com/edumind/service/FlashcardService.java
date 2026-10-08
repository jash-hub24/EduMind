package com.edumind.service;

import com.edumind.dto.FlashcardDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.Flashcard;
import com.edumind.repository.FlashcardRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FlashcardService {
    private final FlashcardRepository flashcards;
    private final SubjectService subjects;

    public FlashcardService(FlashcardRepository flashcards, SubjectService subjects) {
        this.flashcards = flashcards;
        this.subjects = subjects;
    }

    @Transactional(readOnly = true)
    public List<FlashcardDto> findAll(Long subjectId) {
        List<Flashcard> found = subjectId == null ? flashcards.findAll() : flashcards.findBySubjectId(subjectId);
        return found.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public FlashcardDto findById(Long id) { return toDto(findEntity(id)); }

    public FlashcardDto create(FlashcardDto request) {
        Flashcard card = new Flashcard();
        apply(card, request);
        return toDto(flashcards.save(card));
    }

    public FlashcardDto update(Long id, FlashcardDto request) {
        Flashcard card = findEntity(id);
        apply(card, request);
        return toDto(flashcards.save(card));
    }

    public void delete(Long id) { flashcards.delete(findEntity(id)); }

    private Flashcard findEntity(Long id) {
        return flashcards.findById(id).orElseThrow(() -> new ResourceNotFoundException("Flashcard", id));
    }

    private void apply(Flashcard card, FlashcardDto request) {
        card.setQuestion(request.question().trim());
        card.setAnswer(request.answer().trim());
        card.setSubject(subjects.findEntity(request.subjectId()));
        card.setTopic(request.topic().trim());
        card.setDifficulty(request.difficulty().trim().toUpperCase());
    }

    private FlashcardDto toDto(Flashcard card) {
        return new FlashcardDto(card.getId(), card.getQuestion(), card.getAnswer(), card.getSubject().getId(),
                card.getSubject().getName(), card.getTopic(), card.getDifficulty());
    }
}