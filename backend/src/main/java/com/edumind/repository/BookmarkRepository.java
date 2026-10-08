package com.edumind.repository;

import com.edumind.model.Bookmark;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<Bookmark> findByStudentIdAndMaterialId(Long studentId, Long materialId);
}