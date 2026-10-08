package com.edumind.service;

import com.edumind.dto.StudentDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {
    private final StudentRepository students;
    private final UserRepository users;

    public StudentService(StudentRepository students, UserRepository users) {
        this.students = students;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public StudentDto findByEmail(String email) {
        var user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User", email));
        var student = students.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile", user.getId()));
        return new StudentDto(student.getId(), user.getId(), user.getFullName(), user.getEmail(),
                student.getDepartment(), student.getSemester(), user.getRole());
    }
}