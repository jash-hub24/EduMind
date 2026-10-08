package com.edumind.service;

import com.edumind.dto.ProgressDto;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.QuizAttempt;
import com.edumind.model.Student;
import com.edumind.model.StudyMaterial;
import com.edumind.model.StudyProgress;
import com.edumind.repository.QuizAttemptRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.StudyProgressRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StudyProgressService {
    private final StudyProgressRepository progressRepository;
    private final StudentRepository students;
    private final QuizAttemptRepository attempts;
    private final StudyMaterialService materials;

    public StudyProgressService(StudyProgressRepository progressRepository, StudentRepository students,
                                QuizAttemptRepository attempts, StudyMaterialService materials) {
        this.progressRepository = progressRepository;
        this.students = students;
        this.attempts = attempts;
        this.materials = materials;
    }

    @Transactional(readOnly = true)
    public ProgressDto getProgress(Long studentId) {
        Student student = students.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        StudyProgress progress = progressRepository.findByStudentId(studentId).orElseGet(() -> emptyProgress(student));
        var recent = attempts.findByStudentIdOrderBySubmittedAtDesc(studentId).stream().limit(5)
                .map(attempt -> new ProgressDto.RecentAttemptDto(attempt.getId(), attempt.getQuiz().getTitle(),
                        attempt.getPercentage(), attempt.getSubmittedAt().toString())).toList();
        return new ProgressDto(studentId, progress.getStudyHours(), progress.getQuizAttempts(), progress.getAverageScore(),
                progress.getCompletedMaterials().size(), progress.getWeakTopics().stream().sorted().toList(),
                progress.getStudyStreak(), recent);
    }

    public void recordAttempt(Student student, QuizAttempt attempt) {
        StudyProgress progress = progressRepository.findByStudentId(student.getId()).orElseGet(() -> emptyProgress(student));
        int previousCount = progress.getQuizAttempts();
        progress.setAverageScore(((progress.getAverageScore() * previousCount) + attempt.getPercentage()) / (previousCount + 1));
        progress.setQuizAttempts(previousCount + 1);
        progress.getWeakTopics().addAll(attempt.getWeakTopics());
        LocalDate today = LocalDate.now();
        if (progress.getLastActivityDate() == null || progress.getLastActivityDate().isBefore(today.minusDays(1))) {
            progress.setStudyStreak(1);
        } else if (progress.getLastActivityDate().equals(today.minusDays(1))) {
            progress.setStudyStreak(progress.getStudyStreak() + 1);
        }
        progress.setLastActivityDate(today);
        progressRepository.save(progress);
    }

    public ProgressDto recordStudyHours(Long studentId, double hours) {
        if (!Double.isFinite(hours) || hours <= 0 || hours > 24) throw new IllegalArgumentException("hours must be greater than 0 and at most 24");
        Student student = students.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        StudyProgress progress = progressRepository.findByStudentId(studentId).orElseGet(() -> emptyProgress(student));
        progress.setStudyHours(progress.getStudyHours() + hours);
        updateActivity(progress);
        progressRepository.save(progress);
        return getProgress(studentId);
    }

    public ProgressDto completeMaterial(Long studentId, Long materialId) {
        Student student = students.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        StudyMaterial material = materials.findEntity(materialId);
        StudyProgress progress = progressRepository.findByStudentId(studentId).orElseGet(() -> emptyProgress(student));
        progress.getCompletedMaterials().add(material);
        updateActivity(progress);
        progressRepository.save(progress);
        return getProgress(studentId);
    }

    private void updateActivity(StudyProgress progress) {
        LocalDate today = LocalDate.now();
        if (progress.getLastActivityDate() == null || progress.getLastActivityDate().isBefore(today.minusDays(1))) {
            progress.setStudyStreak(1);
        } else if (progress.getLastActivityDate().equals(today.minusDays(1))) {
            progress.setStudyStreak(progress.getStudyStreak() + 1);
        }
        progress.setLastActivityDate(today);
    }

    private StudyProgress emptyProgress(Student student) {
        StudyProgress progress = new StudyProgress();
        progress.setStudent(student);
        return progress;
    }
}