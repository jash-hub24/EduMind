import { defaultMaterials, defaultQuizzes, defaultStudyProgress } from '../data/mockData'
import { storage } from './storage'

const resourceTypeLabels = {
  NOTES: 'Notes',
  PDF: 'PDF',
  VIDEO: 'Video',
  QUESTION_BANK: 'Question Bank',
  PYQ: 'Previous Year Paper',
}

function matchingMaterialFallback(material) {
  return defaultMaterials.find((item) => item.title === material.title)
    || defaultMaterials.find((item) => item.subject === material.subject && item.topic.toLowerCase() === material.topic?.toLowerCase())
    || defaultMaterials.find((item) => item.subject === material.subject)
}

export function mapMaterial(material) {
  const fallback = matchingMaterialFallback(material)
  return {
    ...fallback,
    ...material,
    id: material.id,
    subject: material.subject || fallback?.subject || '',
    semester: material.semester == null ? fallback?.semester || '' : String(material.semester),
    resourceType: resourceTypeLabels[material.resourceType] || material.resourceType || fallback?.resourceType || 'Notes',
    difficulty: material.difficulty ? material.difficulty[0] + material.difficulty.slice(1).toLowerCase() : fallback?.difficulty || 'Intermediate',
    faculty: fallback?.faculty || (material.uploadedBy ? `Faculty ${material.uploadedBy}` : 'EduMind Faculty'),
    updatedAt: material.createdAt ? new Date(material.createdAt).toLocaleDateString() : fallback?.updatedAt || '',
    estimatedStudyTime: fallback?.estimatedStudyTime || 30,
    overview: fallback?.overview || material.description || '',
    keyConcepts: fallback?.keyConcepts || [material.topic].filter(Boolean),
    importantTopics: fallback?.importantTopics || [material.topic].filter(Boolean),
  }
}

export function mapQuiz(quiz) {
  const fallback = defaultQuizzes.find((item) => item.subject === quiz.subject)
  return {
    ...fallback,
    ...quiz,
    id: quiz.id,
    subject: quiz.subject,
    questionCount: quiz.questionCount,
    questions: [],
    duration: fallback?.duration || 15,
    level: fallback?.level || 'Intermediate',
    attempts: 0,
  }
}

export function mapQuestion(question) {
  return {
    id: question.id,
    topic: question.topic,
    question: question.prompt,
    options: [question.optionA, question.optionB, question.optionC, question.optionD],
    points: question.points || 1,
  }
}

export function mapFlashcard(card) {
  const masteredIds = storage.get('masteredFlashcardIds', [])
  return {
    ...card,
    id: card.id,
    question: card.question,
    answer: card.answer,
    mastered: masteredIds.includes(card.id),
  }
}

export function mapProgress(progress) {
  const average = Math.round(progress.averageScore || 0)
  return {
    ...defaultStudyProgress,
    examReadiness: average,
    studyStreak: progress.studyStreak || 0,
    studyHours: Number((progress.studyHours || 0).toFixed(1)),
    quizAverage: average,
    quizAttempts: progress.quizAttempts || 0,
    materialsCompleted: progress.completedMaterials || 0,
    weakTopics: (progress.weakTopics || []).map((topic) => ({ topic, value: Math.max(0, Math.min(100, average)) })),
    recentAttempts: progress.recentAttempts || [],
  }
}

export function mapAttempt(attempt, quiz, durationSeconds = 0) {
  const incorrect = (attempt.totalQuestions || 0) - (attempt.correctCount || 0)
  return {
    id: attempt.id,
    quizId: attempt.quizId,
    score: attempt.correctCount ?? attempt.score ?? 0,
    total: attempt.totalQuestions ?? attempt.maxScore ?? 0,
    subject: quiz.subject,
    percentage: Math.round(attempt.percentage || 0),
    timeTaken: new Date(Math.max(0, durationSeconds) * 1000).toISOString().slice(14, 19),
    correct: attempt.correctCount || 0,
    incorrect,
    weakTopics: attempt.weakTopics || [],
    answers: attempt.answers || [],
    date: attempt.submittedAt || new Date().toISOString(),
  }
}