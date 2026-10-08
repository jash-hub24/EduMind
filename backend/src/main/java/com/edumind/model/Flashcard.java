package com.edumind.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Column(nullable = false, length = 1200) private String question;
    @NotBlank @Column(nullable = false, length = 3000) private String answer;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Subject subject;

    @NotBlank @Column(nullable = false, length = 120) private String topic;
    @Column(nullable = false, length = 30) private String difficulty;
}