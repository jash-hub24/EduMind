package com.edumind.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StudyMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 3000)
    private String description;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Subject subject;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String topic;

    private Integer semester;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String resourceType;

    @Column(length = 30)
    private String difficulty;

    @Column(length = 1000)
    private String fileUrl;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private User uploadedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}