package com.edumind.repository;

import com.edumind.model.Subject;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}