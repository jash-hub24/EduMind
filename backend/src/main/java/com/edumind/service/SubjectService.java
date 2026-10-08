package com.edumind.service;

import com.edumind.dto.SubjectDto;
import com.edumind.exception.DuplicateResourceException;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.Subject;
import com.edumind.repository.SubjectRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SubjectService {
    private final SubjectRepository subjects;

    public SubjectService(SubjectRepository subjects) { this.subjects = subjects; }

    @Transactional(readOnly = true)
    public List<SubjectDto> findAll() { return subjects.findAll().stream().map(this::toDto).toList(); }

    @Transactional(readOnly = true)
    public SubjectDto findById(Long id) { return toDto(findEntity(id)); }

    public SubjectDto create(SubjectDto request) {
        if (subjects.existsByNameIgnoreCase(request.name().trim())) throw new DuplicateResourceException("Subject already exists");
        Subject subject = new Subject();
        apply(subject, request);
        return toDto(subjects.save(subject));
    }

    public SubjectDto update(Long id, SubjectDto request) {
        Subject subject = findEntity(id);
        subjects.findByNameIgnoreCase(request.name().trim()).filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new DuplicateResourceException("Subject already exists"); });
        apply(subject, request);
        return toDto(subjects.save(subject));
    }

    public void delete(Long id) { subjects.delete(findEntity(id)); }

    public Subject findEntity(Long id) {
        return subjects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject", id));
    }

    private void apply(Subject subject, SubjectDto request) {
        subject.setName(request.name().trim());
        subject.setDescription(request.description());
    }

    private SubjectDto toDto(Subject subject) { return new SubjectDto(subject.getId(), subject.getName(), subject.getDescription()); }
}