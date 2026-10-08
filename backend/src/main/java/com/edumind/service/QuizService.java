package com.edumind.service;

import com.edumind.dto.QuizDtos.*;
import com.edumind.exception.ResourceNotFoundException;
import com.edumind.model.AttemptAnswer;
import com.edumind.model.Question;
import com.edumind.model.Quiz;
import com.edumind.model.QuizAttempt;
import com.edumind.model.Student;
import com.edumind.model.User;
import com.edumind.repository.QuestionRepository;
import com.edumind.repository.QuizAttemptRepository;
import com.edumind.repository.QuizRepository;
import com.edumind.repository.StudentRepository;
import com.edumind.repository.UserRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class QuizService {
    private final QuizRepository quizzes;
    private final QuestionRepository questions;
    private final QuizAttemptRepository attempts;
    private final StudentRepository students;
    private final UserRepository users;
    private final SubjectService subjects;
    private final StudyProgressService progressService;

    public QuizService(QuizRepository quizzes, QuestionRepository questions, QuizAttemptRepository attempts,
                       StudentRepository students, UserRepository users, SubjectService subjects,
                       StudyProgressService progressService) {
        this.quizzes = quizzes;
        this.questions = questions;
        this.attempts = attempts;
        this.students = students;
        this.users = users;
        this.subjects = subjects;
        this.progressService = progressService;
    }

    @Transactional(readOnly = true)
    public List<QuizDto> findAll() { return quizzes.findAll().stream().map(this::toDto).toList(); }

    @Transactional(readOnly = true)
    public QuizDto findById(Long id) { return toDto(findEntity(id)); }

    @Transactional(readOnly = true)
    public List<QuestionDto> findQuestions(Long quizId) {
        findEntity(quizId);
        return questions.findByQuizIdOrderById(quizId).stream().map(this::toQuestionDto).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionAdminDto> findAdminQuestions(Long quizId) {
        findEntity(quizId);
        return questions.findByQuizIdOrderById(quizId).stream().map(this::toQuestionAdminDto).toList();
    }

    public QuestionDto createQuestion(Long quizId, QuestionRequest request) {
        Quiz quiz = findEntity(quizId);
        Question question = questions.save(toQuestion(request, quiz));
        return toQuestionDto(question);
    }

    public QuestionDto updateQuestion(Long quizId, Long questionId, QuestionRequest request) {
        Quiz quiz = findEntity(quizId);
        Question question = questions.findById(questionId)
                .filter(existing -> existing.getQuiz().getId().equals(quiz.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
        Question updated = toQuestion(request, quiz);
        question.setPrompt(updated.getPrompt());
        question.setOptionA(updated.getOptionA());
        question.setOptionB(updated.getOptionB());
        question.setOptionC(updated.getOptionC());
        question.setOptionD(updated.getOptionD());
        question.setCorrectOption(updated.getCorrectOption());
        question.setTopic(updated.getTopic());
        question.setPoints(updated.getPoints());
        return toQuestionDto(question);
    }

    public void deleteQuestion(Long quizId, Long questionId) {
        Quiz quiz = findEntity(quizId);
        Question question = questions.findById(questionId)
                .filter(existing -> existing.getQuiz().getId().equals(quiz.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
        questions.delete(question);
    }

    public QuizDto create(QuizRequest request, String email) {
        Quiz quiz = new Quiz();
        quiz.setCreatedBy(findUser(email));
        quiz.setSubject(subjects.findEntity(request.subjectId()));
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        request.questions().forEach(question -> quiz.getQuestions().add(toQuestion(question, quiz)));
        return toDto(quizzes.save(quiz));
    }

    public QuizDto update(Long id, QuizRequest request) {
        Quiz quiz = findEntity(id);
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        quiz.setSubject(subjects.findEntity(request.subjectId()));
        quiz.getQuestions().clear();
        request.questions().forEach(question -> quiz.getQuestions().add(toQuestion(question, quiz)));
        return toDto(quizzes.save(quiz));
    }

    public void delete(Long id) { quizzes.delete(findEntity(id)); }

    public AttemptDto submit(Long quizId, SubmitRequest request) {
        Quiz quiz = findEntity(quizId);
        Student student = students.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", request.studentId()));
        List<Question> quizQuestions = questions.findByQuizIdOrderById(quizId);
        Map<Long, Question> byId = new HashMap<>();
        quizQuestions.forEach(question -> byId.put(question.getId(), question));
        Map<Long, String> submitted = new HashMap<>();
        for (AnswerRequest answer : request.answers()) {
            if (!byId.containsKey(answer.questionId())) throw new IllegalArgumentException("Question does not belong to this quiz: " + answer.questionId());
            if (submitted.put(answer.questionId(), answer.selectedOption()) != null) throw new IllegalArgumentException("Duplicate answer for question " + answer.questionId());
        }
        if (submitted.size() != quizQuestions.size()) throw new IllegalArgumentException("Submit one answer for every quiz question");

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        int score = 0;
        int maxScore = 0;
        int correctCount = 0;
        Set<String> weakTopics = new HashSet<>();
        List<AttemptAnswer> answers = new ArrayList<>();
        for (Question question : quizQuestions) {
            int points = question.getPoints() == null ? 1 : question.getPoints();
            maxScore += points;
            String selected = submitted.get(question.getId());
            boolean correct = question.getCorrectOption().equalsIgnoreCase(selected == null ? "" : selected.trim());
            if (correct) {
                score += points;
                correctCount++;
            } else {
                weakTopics.add(question.getTopic());
            }
            AttemptAnswer answer = new AttemptAnswer();
            answer.setQuestionId(question.getId());
            answer.setSelectedOption(selected);
            answer.setCorrectOption(question.getCorrectOption());
            answer.setCorrect(correct);
            answers.add(answer);
        }
        attempt.setScore(score);
        attempt.setMaxScore(maxScore);
        attempt.setPercentage(maxScore == 0 ? 0 : score * 100.0 / maxScore);
        attempt.setCorrectCount(correctCount);
        attempt.setTotalQuestions(quizQuestions.size());
        attempt.setAnswers(answers);
        attempt.setWeakTopics(new ArrayList<>(weakTopics));
        attempt = attempts.save(attempt);
        progressService.recordAttempt(student, attempt);
        return toAttemptDto(attempt, quiz);
    }

    @Transactional(readOnly = true)
    public AttemptDto findAttempt(Long id) {
        QuizAttempt attempt = attempts.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quiz attempt", id));
        return toAttemptDto(attempt, attempt.getQuiz());
    }

    private Quiz findEntity(Long id) { return quizzes.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quiz", id)); }
    private User findUser(String email) { return users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User", email)); }

    private Question toQuestion(QuestionRequest request, Quiz quiz) {
        String correct = request.correctOption().trim().toUpperCase(Locale.ROOT);
        if (!List.of("A", "B", "C", "D").contains(correct)) throw new IllegalArgumentException("correctOption must be A, B, C, or D");
        Question question = new Question();
        question.setQuiz(quiz);
        question.setPrompt(request.prompt().trim());
        question.setOptionA(request.optionA());
        question.setOptionB(request.optionB());
        question.setOptionC(request.optionC());
        question.setOptionD(request.optionD());
        question.setCorrectOption(correct);
        question.setTopic(request.topic().trim());
        question.setPoints(request.points() == null ? 1 : request.points());
        if (question.getPoints() < 1) throw new IllegalArgumentException("Question points must be positive");
        return question;
    }

    private QuizDto toDto(Quiz quiz) {
        return new QuizDto(quiz.getId(), quiz.getTitle(), quiz.getDescription(), quiz.getSubject().getId(),
                quiz.getSubject().getName(), questions.findByQuizIdOrderById(quiz.getId()).size());
    }

    private QuestionDto toQuestionDto(Question question) {
        return new QuestionDto(question.getId(), question.getPrompt(), question.getOptionA(), question.getOptionB(),
                question.getOptionC(), question.getOptionD(), question.getTopic(), question.getPoints());
    }

    private QuestionAdminDto toQuestionAdminDto(Question question) {
        return new QuestionAdminDto(question.getId(), question.getPrompt(), question.getOptionA(), question.getOptionB(),
                question.getOptionC(), question.getOptionD(), question.getCorrectOption(), question.getTopic(), question.getPoints());
    }

    private AttemptDto toAttemptDto(QuizAttempt attempt, Quiz quiz) {
        Map<Long, Question> byId = new HashMap<>();
        questions.findByQuizIdOrderById(quiz.getId()).forEach(question -> byId.put(question.getId(), question));
        List<AnswerResult> answerResults = attempt.getAnswers().stream().map(answer -> new AnswerResult(
                answer.getQuestionId(), answer.getSelectedOption(), answer.getCorrectOption(), answer.isCorrect(),
                byId.get(answer.getQuestionId()).getTopic())).toList();
        return new AttemptDto(attempt.getId(), quiz.getId(), quiz.getTitle(), attempt.getScore(), attempt.getMaxScore(),
                attempt.getPercentage(), attempt.getCorrectCount(), attempt.getTotalQuestions(), attempt.getWeakTopics(),
                answerResults, attempt.getSubmittedAt());
    }
}