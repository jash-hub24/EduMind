package com.edumind.controller;

import com.edumind.dto.SubjectDto;
import com.edumind.service.SubjectService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectService subjects;
    public SubjectController(SubjectService subjects) { this.subjects = subjects; }

    @GetMapping public List<SubjectDto> findAll() { return subjects.findAll(); }
    @GetMapping("/{id}") public SubjectDto findById(@PathVariable Long id) { return subjects.findById(id); }
    @PostMapping @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public SubjectDto create(@Valid @RequestBody SubjectDto request) { return subjects.create(request); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public SubjectDto update(@PathVariable Long id, @Valid @RequestBody SubjectDto request) { return subjects.update(id, request); }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('FACULTY_ADMIN')")
    public void delete(@PathVariable Long id) { subjects.delete(id); }
}