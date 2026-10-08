package com.edumind.service;

import com.edumind.dto.AiDtos.AskResponse;
import com.edumind.dto.AiDtos.FlashcardIdea;
import com.edumind.dto.AiDtos.RecommendationDto;
import com.edumind.dto.SummaryDto;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DemoAiService implements AiService {
    private final SummaryService summaries;
    private final RecommendationService recommendations;

    public DemoAiService(SummaryService summaries, RecommendationService recommendations) {
        this.summaries = summaries;
        this.recommendations = recommendations;
    }

    @Override
    public AskResponse ask(String prompt) {
        return new AskResponse("Demo response: break \"" + prompt.trim() + "\" into its definition, key steps, and one worked example. " +
                "This prototype does not call an external AI model.", "DEMO");
    }

    @Override
    public SummaryDto summarize(Long materialId) { return summaries.generateDemo(materialId); }

    @Override
    public List<FlashcardIdea> flashcards(String topic) {
        String cleanedTopic = topic.trim();
        return List.of(
                new FlashcardIdea("What is " + cleanedTopic + "?", cleanedTopic + " is a concept to define and relate to its core use cases.", cleanedTopic),
                new FlashcardIdea("When is " + cleanedTopic + " useful?", "Use " + cleanedTopic + " when its underlying trade-offs fit the problem requirements.", cleanedTopic),
                new FlashcardIdea("How can you review " + cleanedTopic + "?", "Explain " + cleanedTopic + " in your own words, then test it with a concrete example.", cleanedTopic));
    }

    @Override
    public AskResponse solveScan(String question) {
        return new AskResponse("Demo solution outline for \"" + question.trim() + "\": identify the known values, choose the relevant concept, " +
                "work through the steps, and verify the result. This prototype does not perform OCR or call an external AI model.", "DEMO");
    }

    @Override
    public List<RecommendationDto> recommendations(Long studentId) { return recommendations.forStudent(studentId); }
}