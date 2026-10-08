package com.edumind.controller;

import com.edumind.dto.StudyMaterialDto;
import com.edumind.service.StudyMaterialService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/materials")
public class StudyMaterialController {
    private final StudyMaterialService materials;
    public StudyMaterialController(StudyMaterialService materials) { this.materials = materials; }

    @GetMapping public List<StudyMaterialDto> findAll(@RequestParam(required = false) String q,
                                                       @RequestParam(required = false) Long subjectId) {
        return materials.findAll(q, subjectId);
    }
    @GetMapping("/{id}") public StudyMaterialDto findById(@PathVariable Long id) { return materials.findById(id); }
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public StudyMaterialDto create(@Valid @RequestBody StudyMaterialDto request, Authentication authentication) {
        return materials.create(request, authentication.getName());
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public StudyMaterialDto update(@PathVariable Long id, @Valid @RequestBody StudyMaterialDto request) {
        return materials.update(id, request);
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public void delete(@PathVariable Long id) { materials.delete(id); }
}