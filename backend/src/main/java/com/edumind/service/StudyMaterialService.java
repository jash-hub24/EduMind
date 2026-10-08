package com.edumind.service;

import com.edumind.dto.StudyMaterialDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.StudyMaterial;
import com.edumind.repository.StudyMaterialRepository;
import com.edumind.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudyMaterialService {
    private static final List<String> RESOURCE_TYPES = List.of("NOTES", "PDF", "VIDEO", "QUESTION_BANK", "PYQ");
    private final StudyMaterialRepository materials;
    private final SubjectService subjects;
    private final UserRepository users;

    public StudyMaterialService(StudyMaterialRepository materials, SubjectService subjects, UserRepository users) {
        this.materials = materials;
        this.subjects = subjects;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<StudyMaterialDto> findAll(String search, Long subjectId) {
        List<StudyMaterial> found;
        if (subjectId != null) found = materials.findBySubjectId(subjectId);
        else if (search != null && !search.isBlank()) found = materials.findBySubjectNameContainingIgnoreCaseOrTitleContainingIgnoreCaseOrTopicContainingIgnoreCase(search, search, search);
        else found = materials.findAll();
        return found.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public StudyMaterialDto findById(Long id) { return toDto(findEntity(id)); }

    public StudyMaterialDto create(StudyMaterialDto request, String email) {
        StudyMaterial material = new StudyMaterial();
        material.setUploadedBy(users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User", email)));
        apply(material, request);
        return toDto(materials.save(material));
    }

    public StudyMaterialDto update(Long id, StudyMaterialDto request) {
        StudyMaterial material = findEntity(id);
        apply(material, request);
        return toDto(materials.save(material));
    }

    public void delete(Long id) { materials.delete(findEntity(id)); }

    public StudyMaterial findEntity(Long id) {
        return materials.findById(id).orElseThrow(() -> new ResourceNotFoundException("Study material", id));
    }

    private void apply(StudyMaterial material, StudyMaterialDto request) {
        String resourceType = request.resourceType().trim().toUpperCase();
        if (!RESOURCE_TYPES.contains(resourceType)) throw new IllegalArgumentException("resourceType must be one of " + RESOURCE_TYPES);
        material.setTitle(request.title().trim());
        material.setDescription(request.description());
        material.setSubject(subjects.findEntity(request.subjectId()));
        material.setTopic(request.topic().trim());
        material.setSemester(request.semester());
        material.setResourceType(resourceType);
        material.setDifficulty(request.difficulty());
        material.setFileUrl(request.fileUrl());
    }

    private StudyMaterialDto toDto(StudyMaterial material) {
        return new StudyMaterialDto(material.getId(), material.getTitle(), material.getDescription(),
                material.getSubject().getId(), material.getSubject().getName(), material.getTopic(),
                material.getSemester(), material.getResourceType(), material.getDifficulty(), material.getFileUrl(),
                material.getUploadedBy().getId(), material.getCreatedAt());
    }
}