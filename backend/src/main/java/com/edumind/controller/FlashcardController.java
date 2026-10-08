package com.edumind.controller;

import com.edumind.dto.FlashcardDto;
import com.edumind.service.FlashcardService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/flashcards")
public class FlashcardController {
    private final FlashcardService flashcards;
    public FlashcardController(FlashcardService flashcards) { this.flashcards = flashcards; }

    @GetMapping public List<FlashcardDto> findAll(@RequestParam(required = false) Long subjectId) { return flashcards.findAll(subjectId); }
    @GetMapping("/{id}") public FlashcardDto findById(@PathVariable Long id) { return flashcards.findById(id); }
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public FlashcardDto create(@Valid @RequestBody FlashcardDto request) { return flashcards.create(request); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public FlashcardDto update(@PathVariable Long id, @Valid @RequestBody FlashcardDto request) { return flashcards.update(id, request); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public void delete(@PathVariable Long id) { flashcards.delete(id); }
}