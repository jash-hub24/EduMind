package com.edumind.controller;

import com.edumind.dto.ProgressDto;
import com.edumind.repository.StudentRepository;
import com.edumind.service.StudyProgressService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('FACULTY_ADMIN')")
public class AnalyticsController {
    private final StudentRepository students;
    private final StudyProgressService progress;
    public AnalyticsController(StudentRepository students, StudyProgressService progress) {
        this.students = students;
        this.progress = progress;
    }

    @GetMapping("/students")
    public List<ProgressDto> students() { return students.findAll().stream().map(student -> progress.getProgress(student.getId())).toList(); }
}