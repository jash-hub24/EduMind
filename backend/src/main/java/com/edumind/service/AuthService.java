package com.edumind.service;

import com.edumind.dto.AuthDtos.AuthResponse;
import com.edumind.dto.AuthDtos.LoginRequest;
import com.edumind.dto.AuthDtos.RegisterRequest;
import com.edumind.exception.DuplicateResourceException;
import com.edumind.model.Student;
import com.edumind.model.User;
import com.edumind.model.UserRole;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import com.edumind.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final StudentRepository students;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository users, StudentRepository students,
                       PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users = users;
        this.students = students;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.STUDENT);
        user = users.save(user);

        Student student = new Student();
        student.setUser(user);
        if (request.department() != null && !request.department().isBlank()) student.setDepartment(request.department().trim());
        if (request.semester() != null) student.setSemester(request.semester());
        student = students.save(student);
        return response(user, student.getId());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));
        Long studentId = students.findByUserId(user.getId()).map(Student::getId).orElse(null);
        return response(user, studentId);
    }

    private AuthResponse response(User user, Long studentId) {
        return new AuthResponse(jwtService.generateToken(user), "Bearer", user.getId(), studentId,
                user.getFullName(), user.getEmail(), user.getRole());
    }
}