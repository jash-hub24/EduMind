package com.edumind.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Quiz quiz;

    private Integer score;
    private Integer maxScore;
    private Double percentage;
    private Integer correctCount;
    private Integer totalQuestions;

    @ElementCollection
    @CollectionTable(name = "quiz_attempt_answers", joinColumns = @JoinColumn(name = "attempt_id"))
    private List<AttemptAnswer> answers = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "quiz_attempt_weak_topics", joinColumns = @JoinColumn(name = "attempt_id"))
    @Column(name = "topic")
    private List<String> weakTopics = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant submittedAt = Instant.now();
}