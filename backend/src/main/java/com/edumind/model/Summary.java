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
public class Summary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(nullable = false, unique = true)
    private StudyMaterial material;

    @Column(nullable = false, length = 5000)
    private String overview;

    @ElementCollection
    @CollectionTable(name = "summary_key_points", joinColumns = @JoinColumn(name = "summary_id"))
    @Column(name = "key_point", length = 500)
    private List<String> keyPoints = new ArrayList<>();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();
}