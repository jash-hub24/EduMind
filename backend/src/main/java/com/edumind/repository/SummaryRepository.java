package com.edumind.repository;

import com.edumind.model.Summary;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SummaryRepository extends JpaRepository<Summary, Long> {
    Optional<Summary> findByMaterialId(Long materialId);
}