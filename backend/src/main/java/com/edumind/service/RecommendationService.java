package com.edumind.service;

import com.edumind.dto.AiDtos.RecommendationDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.StudyMaterial;
import com.edumind.repository.BookmarkRepository;
import com.edumind.repository.QuizAttemptRepository;
import com.edumind.repository.StudyMaterialRepository;
import com.edumind.repository.StudyProgressRepository;
import com.edumind.repository.StudentRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecommendationService {
    private final StudyMaterialRepository materials;
    private final StudyProgressRepository progress;
    private final BookmarkRepository bookmarks;
    private final QuizAttemptRepository attempts;
    private final StudentRepository students;

    public RecommendationService(StudyMaterialRepository materials, StudyProgressRepository progress,
                                 BookmarkRepository bookmarks, QuizAttemptRepository attempts, StudentRepository students) {
        this.materials = materials;
        this.progress = progress;
        this.bookmarks = bookmarks;
        this.attempts = attempts;
        this.students = students;
    }

    public List<RecommendationDto> forStudent(Long studentId) {
        students.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        var studentProgress = progress.findByStudentId(studentId).orElse(null);
        Set<Long> completed = studentProgress == null ? Set.of() : studentProgress.getCompletedMaterials().stream()
                .map(StudyMaterial::getId).collect(java.util.stream.Collectors.toSet());
        Set<Long> bookmarked = new HashSet<>();
        bookmarks.findByStudentIdOrderByCreatedAtDesc(studentId).forEach(bookmark -> bookmarked.add(bookmark.getMaterial().getId()));
        List<String> weakTopics = studentProgress == null ? List.of() : studentProgress.getWeakTopics().stream().toList();
        double average = studentProgress == null ? 0 : studentProgress.getAverageScore();
        List<StudyMaterial> candidates = new ArrayList<>(materials.findAll());
        candidates.removeIf(material -> completed.contains(material.getId()));
        candidates.sort(Comparator
                .comparingInt((StudyMaterial material) -> weakTopics.stream().anyMatch(topic -> topic.equalsIgnoreCase(material.getTopic())) ? 0 : 1)
                .thenComparingInt(material -> bookmarked.contains(material.getId()) ? 0 : 1)
                .thenComparing(StudyMaterial::getCreatedAt, Comparator.reverseOrder()));
        List<RecommendationDto> results = new ArrayList<>();
        for (StudyMaterial material : candidates.stream().limit(5).toList()) {
            boolean weakMatch = weakTopics.stream().anyMatch(topic -> topic.equalsIgnoreCase(material.getTopic()));
            boolean bookmarkedMatch = bookmarked.contains(material.getId());
            String reason;
            String priority;
            if (weakMatch) {
                reason = "Your recent quiz answers show difficulty with " + material.getTopic() + ".";
                priority = average < 60 ? "HIGH" : "MEDIUM";
            } else if (bookmarkedMatch) {
                reason = "Revisit a saved resource to reinforce your recent study activity.";
                priority = "MEDIUM";
            } else {
                reason = attempts.findByStudentIdOrderBySubmittedAtDesc(studentId).isEmpty()
                        ? "Start building your study plan with this resource."
                        : "Continue learning with a resource you have not completed yet.";
                priority = "LOW";
            }
            results.add(new RecommendationDto(material.getTitle(), reason, material.getId(), priority));
        }
        return results;
    }
}