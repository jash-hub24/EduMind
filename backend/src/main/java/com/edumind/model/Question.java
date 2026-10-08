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
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(nullable = false)
    private Quiz quiz;

    @NotBlank
    @Column(nullable = false, length = 1500)
    private String prompt;

    @NotBlank @Column(nullable = false, length = 500) private String optionA;
    @NotBlank @Column(nullable = false, length = 500) private String optionB;
    @NotBlank @Column(nullable = false, length = 500) private String optionC;
    @NotBlank @Column(nullable = false, length = 500) private String optionD;

    @Column(nullable = false, length = 1)
    private String correctOption;

    @Column(nullable = false, length = 120)
    private String topic;

    private Integer points = 1;
}