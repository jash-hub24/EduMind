import axios from 'axios'
import { storage } from './storage'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
})

api.interceptors.request.use((config) => {
  const token = storage.get('token', null)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const isAuthRequest = error.config?.url?.startsWith('/api/auth/')
    if (status === 401 && !isAuthRequest) {
      storage.remove('token')
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('edumind:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials).then(({ data }) => data),
  register: (details) => api.post('/api/auth/register', details).then(({ data }) => data),
}

export const catalogApi = {
  subjects: () => api.get('/api/subjects').then(({ data }) => data),
  materials: (params) => api.get('/api/materials', { params }).then(({ data }) => data),
  material: (id) => api.get(`/api/materials/${id}`).then(({ data }) => data),
  createMaterial: (material) => api.post('/api/materials', material).then(({ data }) => data),
  updateMaterial: (id, material) => api.put(`/api/materials/${id}`, material).then(({ data }) => data),
  deleteMaterial: (id) => api.delete(`/api/materials/${id}`),
  createSubject: (subject) => api.post('/api/subjects', subject).then(({ data }) => data),
  updateSubject: (id, subject) => api.put(`/api/subjects/${id}`, subject).then(({ data }) => data),
  deleteSubject: (id) => api.delete(`/api/subjects/${id}`),
}

export const quizApi = {
  list: () => api.get('/api/quizzes').then(({ data }) => data),
  questions: (id) => api.get(`/api/quizzes/${id}/questions`).then(({ data }) => data),
  adminQuestions: (id) => api.get(`/api/quizzes/${id}/admin-questions`).then(({ data }) => data),
  submit: (id, payload) => api.post(`/api/quizzes/${id}/submit`, payload).then(({ data }) => data),
  attempt: (id) => api.get(`/api/quizzes/attempts/${id}`).then(({ data }) => data),
  create: (quiz) => api.post('/api/quizzes', quiz).then(({ data }) => data),
  update: (id, quiz) => api.put(`/api/quizzes/${id}`, quiz).then(({ data }) => data),
  delete: (id) => api.delete(`/api/quizzes/${id}`),
}

export const studentApi = {
  profile: () => api.get('/api/students/me').then(({ data }) => data),
  progress: (studentId) => api.get(`/api/progress/${studentId}`).then(({ data }) => data),
  addStudyHours: (studentId, hours) => api.post(`/api/progress/${studentId}/study-hours`, { hours }).then(({ data }) => data),
  completeMaterial: (studentId, materialId) => api.post(`/api/progress/${studentId}/materials/${materialId}/complete`).then(({ data }) => data),
  bookmarks: (studentId) => api.get(`/api/bookmarks/${studentId}`).then(({ data }) => data),
  addBookmark: (studentId, materialId) => api.post('/api/bookmarks', { studentId, materialId }).then(({ data }) => data),
  deleteBookmark: (id) => api.delete(`/api/bookmarks/${id}`),
  recommendations: (studentId) => api.get(`/api/recommendations/${studentId}`).then(({ data }) => data),
}

export const flashcardApi = {
  list: () => api.get('/api/flashcards').then(({ data }) => data),
  create: (flashcard) => api.post('/api/flashcards', flashcard).then(({ data }) => data),
  update: (id, flashcard) => api.put(`/api/flashcards/${id}`, flashcard).then(({ data }) => data),
  delete: (id) => api.delete(`/api/flashcards/${id}`),
}

export const aiApi = {
  ask: (prompt, studentId) => api.post('/api/ai/ask', { prompt, studentId }).then(({ data }) => data),
  summarize: (materialId) => api.post('/api/ai/summarize', { materialId }).then(({ data }) => data),
  flashcards: (topic, subjectId) => api.post('/api/ai/flashcards', { topic, subjectId }).then(({ data }) => data),
  scanSolve: (question) => api.post('/api/ai/scan-solve', { question }).then(({ data }) => data),
  recommendations: (studentId) => api.post('/api/ai/recommendations', { studentId }).then(({ data }) => data),
  summary: (materialId) => api.get(`/api/summaries/${materialId}`).then(({ data }) => data),
}

export const analyticsApi = {
  students: () => api.get('/api/analytics/students').then(({ data }) => data),
}

export function getApiErrorMessage(error, fallback = 'Could not reach EduMind. Please try again.') {
  const response = error?.response
  const fieldMessages = Object.values(response?.data?.validationErrors || {})
  return fieldMessages[0] || response?.data?.message || error?.message || fallback
}