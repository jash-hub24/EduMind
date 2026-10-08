package com.edumind.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "material_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private StudyMaterial material;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}