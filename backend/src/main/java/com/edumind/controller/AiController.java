package com.edumind.controller;

import com.edumind.dto.AiDtos.*;
import com.edumind.dto.SummaryDto;
import com.edumind.service.AiService;
import com.edumind.service.StudentAccessService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;
    private final StudentAccessService studentAccess;
    public AiController(AiService aiService, StudentAccessService studentAccess) {
        this.aiService = aiService;
        this.studentAccess = studentAccess;
    }

    @PostMapping("/ask") public AskResponse ask(@Valid @RequestBody AskRequest request) { return aiService.ask(request.prompt()); }
    @PostMapping("/summarize") public SummaryDto summarize(@Valid @RequestBody SummarizeRequest request) { return aiService.summarize(request.materialId()); }
    @PostMapping("/flashcards") public List<FlashcardIdea> flashcards(@Valid @RequestBody FlashcardsRequest request) { return aiService.flashcards(request.topic()); }
    @PostMapping("/scan-solve") public AskResponse scanSolve(@Valid @RequestBody ScanSolveRequest request) { return aiService.solveScan(request.question()); }
    @PostMapping("/recommendations")
    public RecommendationsResponse recommendations(@Valid @RequestBody RecommendationRequest request, Authentication authentication) {
        if (request.studentId() == null) throw new IllegalArgumentException("studentId is required");
        studentAccess.requireAccess(request.studentId(), authentication.getName());
        return new RecommendationsResponse(aiService.recommendations(request.studentId()), "DEMO_RULE_BASED");
    }
}