package com.edumind.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class AttemptAnswer {
    private Long questionId;
    private String selectedOption;
    private String correctOption;
    private boolean correct;
}