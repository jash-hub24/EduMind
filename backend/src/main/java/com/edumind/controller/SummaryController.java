package com.edumind.controller;

import com.edumind.dto.SummaryDto;
import com.edumind.service.SummaryService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/summaries")
public class SummaryController {
    private final SummaryService summaries;
    public SummaryController(SummaryService summaries) { this.summaries = summaries; }

    @GetMapping("/{materialId}") public SummaryDto findByMaterial(@PathVariable Long materialId) { return summaries.findByMaterial(materialId); }
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public SummaryDto save(@Valid @RequestBody SummaryDto request) { return summaries.save(request); }
}