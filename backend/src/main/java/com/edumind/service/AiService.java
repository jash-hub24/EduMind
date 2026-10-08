package com.edumind.service;

import com.edumind.dto.AiDtos.AskResponse;
import com.edumind.dto.AiDtos.FlashcardIdea;
import com.edumind.dto.AiDtos.RecommendationDto;
import com.edumind.dto.SummaryDto;
import java.util.List;

public interface AiService {
    AskResponse ask(String prompt);
    SummaryDto summarize(Long materialId);
    List<FlashcardIdea> flashcards(String topic);
    AskResponse solveScan(String question);
    List<RecommendationDto> recommendations(Long studentId);
}