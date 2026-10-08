package com.edumind.controller;

import com.edumind.dto.StudentDto;
import com.edumind.service.StudentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService students;
    public StudentController(StudentService students) { this.students = students; }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentDto me(Authentication authentication) { return students.findByEmail(authentication.getName()); }
}