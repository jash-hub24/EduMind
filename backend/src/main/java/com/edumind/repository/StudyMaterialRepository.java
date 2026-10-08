package com.edumind.repository;

import com.edumind.model.StudyMaterial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findBySubjectId(Long subjectId);
    List<StudyMaterial> findBySubjectNameContainingIgnoreCaseOrTitleContainingIgnoreCaseOrTopicContainingIgnoreCase(String subject, String title, String topic);
}