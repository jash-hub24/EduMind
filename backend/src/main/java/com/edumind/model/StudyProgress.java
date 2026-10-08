package com.edumind.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StudyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(nullable = false, unique = true)
    private Student student;

    private Double studyHours = 0.0;
    private Integer quizAttempts = 0;
    private Double averageScore = 0.0;
    private Integer studyStreak = 0;
    private LocalDate lastActivityDate;

    @ManyToMany
    @JoinTable(name = "student_completed_materials", joinColumns = @JoinColumn(name = "progress_id"), inverseJoinColumns = @JoinColumn(name = "material_id"))
    private Set<StudyMaterial> completedMaterials = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "student_weak_topics", joinColumns = @JoinColumn(name = "progress_id"))
    @Column(name = "topic")
    private Set<String> weakTopics = new HashSet<>();
}