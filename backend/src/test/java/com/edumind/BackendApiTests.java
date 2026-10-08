package com.edumind;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.edumind.model.Question;
import com.edumind.model.Quiz;
import com.edumind.repository.QuestionRepository;
import com.edumind.repository.QuizAttemptRepository;
import com.edumind.repository.QuizRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BackendApiTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository users;
    @Autowired private StudentRepository students;
    @Autowired private QuizRepository quizzes;
    @Autowired private QuestionRepository questions;
    @Autowired private QuizAttemptRepository attempts;

    private String studentToken;

    @BeforeEach
    void authenticateDemoStudent() throws Exception {
        String body = """
                {"email":"student@edumind.com","password":"student1234"}
                """;
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        studentToken = objectMapper.readTree(response).get("token").asText();
    }

    @Test
    void authenticationReturnsJwtAndUsesBcrypt() throws Exception {
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student@edumind.com","password":"student1234"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.token").isNotEmpty());
        org.assertj.core.api.Assertions.assertThat(users.findByEmailIgnoreCase("student@edumind.com").orElseThrow().getPasswordHash())
                .startsWith("$2").isNotEqualTo("student1234");
    }

        @Test
        void registrationStoresOptionalStudentProfileFields() throws Exception {
                String response = mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                                                .content("""
                                                                {"fullName":"Taylor Student","email":"taylor.registration@example.com","password":"strong-password","department":"Electrical Engineering","semester":7}
                                                                """))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.role").value("STUDENT"))
                                .andReturn().getResponse().getContentAsString();
                Long userId = objectMapper.readTree(response).get("userId").asLong();
                var student = students.findByUserId(userId).orElseThrow();
                org.assertj.core.api.Assertions.assertThat(student.getDepartment()).isEqualTo("Electrical Engineering");
                org.assertj.core.api.Assertions.assertThat(student.getSemester()).isEqualTo(7);
        }

    @Test
    void retrievesSeededSubjects() throws Exception {
        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists());
        org.assertj.core.api.Assertions.assertThat(users.count()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void retrievesSeededMaterials() throws Exception {
        mockMvc.perform(get("/api/materials"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").exists());
    }

    @Test
    void quizSubmissionGradesAnswersAndPersistsAttempt() throws Exception {
        Quiz quiz = quizzes.findAll().get(0);
        List<Question> quizQuestions = questions.findByQuizIdOrderById(quiz.getId());
        Long studentId = students.findByUserId(users.findByEmailIgnoreCase("student@edumind.com").orElseThrow().getId())
                .orElseThrow().getId();
        List<Map<String, Object>> answers = new ArrayList<>();
        for (int index = 0; index < quizQuestions.size(); index++) {
            Question question = quizQuestions.get(index);
            String selected = question.getCorrectOption();
            if (index == 0) selected = selected.equals("A") ? "B" : "A";
            answers.add(Map.of("questionId", question.getId(), "selectedOption", selected));
        }
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("studentId", studentId);
        request.put("answers", answers);
        long existingAttempts = attempts.count();

        mockMvc.perform(post("/api/quizzes/{id}/submit", quiz.getId())
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuestions").value(6))
                .andExpect(jsonPath("$.correctCount").value(5))
                .andExpect(jsonPath("$.percentage").value(83.33333333333333))
                .andExpect(jsonPath("$.answers[0].correct").value(false));
        org.assertj.core.api.Assertions.assertThat(attempts.count()).isEqualTo(existingAttempts + 1);
    }
}