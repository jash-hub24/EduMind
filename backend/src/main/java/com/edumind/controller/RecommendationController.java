package com.edumind.controller;

import com.edumind.dto.AiDtos.RecommendationDto;
import com.edumind.service.RecommendationService;
import com.edumind.service.StudentAccessService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService recommendations;
    private final StudentAccessService studentAccess;
    public RecommendationController(RecommendationService recommendations, StudentAccessService studentAccess) {
        this.recommendations = recommendations;
        this.studentAccess = studentAccess;
    }

    @GetMapping("/{studentId}")
    public List<RecommendationDto> get(@PathVariable Long studentId, Authentication authentication) {
        studentAccess.requireAccess(studentId, authentication.getName());
        return recommendations.forStudent(studentId);
    }
}