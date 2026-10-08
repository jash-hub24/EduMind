package com.edumind.controller;

import com.edumind.dto.ProgressDto;
import com.edumind.service.StudentAccessService;
import com.edumind.service.StudyProgressService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@Validated
public class ProgressController {
    private final StudyProgressService progress;
    private final StudentAccessService studentAccess;
    public ProgressController(StudyProgressService progress, StudentAccessService studentAccess) {
        this.progress = progress;
        this.studentAccess = studentAccess;
    }

    @GetMapping("/{studentId}")
    public ProgressDto get(@PathVariable Long studentId, Authentication authentication) {
        studentAccess.requireAccess(studentId, authentication.getName());
        return progress.getProgress(studentId);
    }

    @PostMapping("/{studentId}/study-hours")
    public ProgressDto addStudyHours(@PathVariable Long studentId, @RequestBody StudyHoursRequest request,
                                     Authentication authentication) {
        studentAccess.requireAccess(studentId, authentication.getName());
        return progress.recordStudyHours(studentId, request.hours());
    }

    @PostMapping("/{studentId}/materials/{materialId}/complete")
    public ProgressDto completeMaterial(@PathVariable Long studentId, @PathVariable Long materialId,
                                        Authentication authentication) {
        studentAccess.requireAccess(studentId, authentication.getName());
        return progress.completeMaterial(studentId, materialId);
    }

    public record StudyHoursRequest(@NotNull @DecimalMin("0.01") @DecimalMax("24.0") Double hours) { }
}