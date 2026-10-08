import { createContext, useContext, useEffect, useEffectEvent, useState } from 'react'
import {
  defaultFlashcards,
  defaultMaterials,
  defaultMistakes,
  defaultNotifications,
  defaultPlannerTasks,
  defaultQuizzes,
  defaultQuizAttempts,
  defaultStudyProgress,
  subjects as defaultSubjects,
} from '../data/mockData'
import {
  aiApi,
  analyticsApi,
  authApi,
  catalogApi,
  flashcardApi,
  getApiErrorMessage,
  quizApi,
  studentApi,
} from '../services/api'
import { mapAttempt, mapFlashcard, mapMaterial, mapProgress, mapQuestion, mapQuiz } from '../services/apiAdapters'
import { storage } from '../services/storage'

const AppContext = createContext()

function toResourceType(value = '') {
  const normalized = value.toUpperCase().replaceAll(' ', '_')
  return normalized === 'PREVIOUS_YEAR_PAPER' ? 'PYQ' : normalized
}

function toMaterialRequest(material, subjects) {
  return {
    title: material.title,
    description: material.description || '',
    subjectId: material.subjectId || subjects.find((subject) => subject.name === material.subject)?.id,
    topic: material.topic,
    semester: material.semester ? Number(material.semester) : null,
    resourceType: toResourceType(material.resourceType),
    difficulty: material.difficulty?.toUpperCase(),
    fileUrl: material.fileUrl || null,
  }
}

function toQuizRequest(quiz, subjects) {
  return {
    title: quiz.title,
    description: quiz.description || '',
    subjectId: quiz.subjectId || subjects.find((subject) => subject.name === quiz.subject)?.id,
    questions: (quiz.questions || []).map((question) => {
      const options = question.options || [question.optionA, question.optionB, question.optionC, question.optionD]
      const correctIndex = Number.isInteger(question.correctIndex)
        ? question.correctIndex
        : options.indexOf(question.answer)
      return {
        prompt: question.question || question.prompt,
        optionA: options[0],
        optionB: options[1],
        optionC: options[2],
        optionD: options[3],
        correctOption: question.correctOption || String.fromCharCode(65 + Math.max(0, correctIndex)),
        topic: question.topic || quiz.subject,
        points: question.points || 1,
      }
    }),
  }
}

function authUserFromResponse(response) {
  return {
    id: response.userId,
    studentId: response.studentId,
    name: response.fullName,
    email: response.email,
    role: response.role === 'FACULTY_ADMIN' ? 'admin' : 'student',
    course: 'Computer Science',
    semester: '4th Semester',
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => storage.get('theme', 'light'))
  const [authUser, setAuthUser] = useState(() => storage.get('token', null) ? storage.get('authUser', null) : null)
  const [subjects, setSubjects] = useState(defaultSubjects.map((name) => ({ id: null, name })))
  const [bookmarks, setBookmarks] = useState(() => storage.get('bookmarks', []))
  const [bookmarkRecords, setBookmarkRecords] = useState([])
  const [quizAttempts, setQuizAttempts] = useState(() => storage.get('quizAttempts', defaultQuizAttempts))
  const [mistakes, setMistakes] = useState(() => storage.get('mistakes', defaultMistakes))
  const [plannerTasks, setPlannerTasks] = useState(() => storage.get('plannerTasks', defaultPlannerTasks))
  const [flashcards, setFlashcards] = useState(defaultFlashcards)
  const [materials, setMaterials] = useState(defaultMaterials)
  const [quizzes, setQuizzes] = useState(defaultQuizzes)
  const [studyProgress, setStudyProgress] = useState(defaultStudyProgress)
  const [recommendations, setRecommendations] = useState([])
  const [analytics, setAnalytics] = useState([])
  const [notifications, setNotifications] = useState(() => storage.get('notifications', defaultNotifications))
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => storage.set('theme', theme), [theme])
  useEffect(() => storage.set('authUser', authUser), [authUser])
  useEffect(() => storage.set('mistakes', mistakes), [mistakes])
  useEffect(() => storage.set('plannerTasks', plannerTasks), [plannerTasks])
  useEffect(() => storage.set('notifications', notifications), [notifications])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const refreshCatalog = async () => {
    const results = await Promise.allSettled([
      catalogApi.subjects(),
      catalogApi.materials(),
      quizApi.list(),
      flashcardApi.list(),
    ])
    const [subjectResult, materialResult, quizResult, flashcardResult] = results
    if (subjectResult.status === 'fulfilled') setSubjects(subjectResult.value)
    if (materialResult.status === 'fulfilled') setMaterials(materialResult.value.map(mapMaterial))
    if (quizResult.status === 'fulfilled') setQuizzes(quizResult.value.map(mapQuiz))
    if (flashcardResult.status === 'fulfilled') setFlashcards(flashcardResult.value.map(mapFlashcard))
    const failed = results.find((result) => result.status === 'rejected')
    if (failed) setApiError(`${getApiErrorMessage(failed.reason)} Demo data remains available for offline use.`)
    else setApiError('')
    return results
  }

  const refreshStudentData = async (studentId = authUser?.studentId) => {
    if (!studentId) return
    const results = await Promise.allSettled([
      studentApi.profile(),
      studentApi.progress(studentId),
      studentApi.bookmarks(studentId),
      studentApi.recommendations(studentId),
    ])
    const [profileResult, progressResult, bookmarksResult, recommendationsResult] = results
    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value
      setAuthUser((current) => current ? {
        ...current,
        name: profile.fullName,
        course: profile.department,
        semester: `${profile.semester}th Semester`,
      } : current)
    }
    if (progressResult.status === 'fulfilled') {
      const progress = progressResult.value
      setStudyProgress(mapProgress(progress))
      setQuizAttempts((progress.recentAttempts || []).map((attempt) => ({
        id: attempt.attemptId,
        score: Math.round(attempt.percentage || 0),
        total: 100,
        subject: attempt.quizTitle,
        percentage: attempt.percentage,
        date: attempt.submittedAt,
      })))
    }
    if (bookmarksResult.status === 'fulfilled') {
      setBookmarkRecords(bookmarksResult.value)
      setBookmarks(bookmarksResult.value.map((bookmark) => bookmark.materialId))
    }
    if (recommendationsResult.status === 'fulfilled') setRecommendations(recommendationsResult.value)
    const failed = results.find((result) => result.status === 'rejected')
    if (failed) setApiError(getApiErrorMessage(failed.reason))
    return results
  }

  const refreshAdminData = async () => {
    try {
      setAnalytics(await analyticsApi.students())
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      await refreshCatalog()
      if (authUser?.role === 'admin') await refreshAdminData()
      else if (authUser?.studentId) await refreshStudentData(authUser.studentId)
    } finally {
      setIsLoading(false)
    }
  }

  const initializeData = useEffectEvent(async () => {
    try {
      await refreshCatalog()
      if (!authUser) return
      if (authUser.role === 'admin') await refreshAdminData()
      else if (authUser.studentId) await refreshStudentData(authUser.studentId)
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => { initializeData() }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthUser(null)
      setApiError('Your session expired. Please sign in again.')
      setBookmarkRecords([])
      setBookmarks([])
    }
    window.addEventListener('edumind:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('edumind:unauthorized', handleUnauthorized)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email: email.trim(), password })
      storage.set('token', response.token)
      const user = authUserFromResponse(response)
      setAuthUser(user)
      setApiError('')
      if (user.role === 'admin') await refreshAdminData()
      else await refreshStudentData(user.studentId)
      return { success: true, role: user.role }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in. Check your details and try again.')
      setApiError(message)
      return { success: false, message }
    }
  }

  const register = async (form) => {
    try {
      const parsedSemester = Number.parseInt(form.semester, 10)
      const response = await authApi.register({
        fullName: form.name,
        email: form.email,
        password: form.password,
        department: form.course || null,
        semester: Number.isInteger(parsedSemester) ? parsedSemester : null,
      })
      storage.set('token', response.token)
      const user = authUserFromResponse(response)
      setAuthUser(user)
      setApiError('')
      await refreshStudentData(user.studentId)
      return { success: true, role: user.role }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create your account. Please try again.')
      setApiError(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    storage.remove('token')
    storage.remove('authUser')
    setAuthUser(null)
    setBookmarkRecords([])
    setBookmarks([])
    setRecommendations([])
    setAnalytics([])
    setApiError('')
  }

  const toggleBookmark = async (materialId) => {
    if (!authUser?.studentId) return null
    const record = bookmarkRecords.find((bookmark) => bookmark.materialId === materialId)
    try {
      if (record) {
        await studentApi.deleteBookmark(record.id)
        setBookmarkRecords((current) => current.filter((bookmark) => bookmark.id !== record.id))
        setBookmarks((current) => current.filter((id) => id !== materialId))
      } else {
        const created = await studentApi.addBookmark(authUser.studentId, materialId)
        setBookmarkRecords((current) => [created, ...current])
        setBookmarks((current) => [...current, materialId])
      }
      setApiError('')
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not update this bookmark.'))
      return false
    }
  }

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'))

  const saveQuizAttempt = (payload) => setQuizAttempts((current) => [payload, ...current])

  const saveMistake = (mistakeList) => {
    if (!mistakeList?.length) return
    setMistakes((current) => [...mistakeList, ...current])
  }

  const addPlannerTask = (task) => {
    setPlannerTasks((current) => [{ id: crypto.randomUUID(), ...task, completed: false }, ...current])
  }

  const togglePlannerTask = (taskId) => {
    setPlannerTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    )
  }

  const deletePlannerTask = (taskId) => {
    setPlannerTasks((current) => current.filter((task) => task.id !== taskId))
  }

  const submitQuiz = async (quiz, answers, durationSeconds) => {
    try {
      const response = await quizApi.submit(quiz.id, {
        studentId: authUser.studentId,
        answers: quiz.questions.map((question) => {
          const selected = answers[question.id]
          return { questionId: question.id, selectedOption: selected == null ? '' : String.fromCharCode(65 + question.options.indexOf(selected)) }
        }),
      })
      const attempt = mapAttempt(response, quiz, durationSeconds)
      saveQuizAttempt(attempt)
      saveMistake(response.answers.filter((answer) => !answer.correct).map((answer) => {
        const question = quiz.questions.find((item) => item.id === answer.questionId)
        return {
          id: `${response.id}-${answer.questionId}`,
          question: question?.question || answer.topic,
          yourAnswer: question?.options[answer.selectedOption?.charCodeAt(0) - 65] || 'No answer',
          correctAnswer: question?.options[answer.correctOption?.charCodeAt(0) - 65] || answer.correctOption,
          explanation: `Review the ${answer.topic} concept and try a related practice question.`,
          subject: quiz.subject,
          topic: answer.topic,
          date: response.submittedAt,
        }
      }))
      await refreshStudentData(authUser.studentId)
      return attempt
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not submit this quiz. Please try again.'))
      return null
    }
  }

  const addStudyMaterial = async (material) => {
    try {
      const created = await catalogApi.createMaterial(toMaterialRequest(material, subjects))
      setMaterials((current) => [mapMaterial(created), ...current])
      setApiError('')
      return created
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not save this material.'))
      return null
    }
  }

  const updateStudyMaterial = async (id, material) => {
    try {
      const updated = await catalogApi.updateMaterial(id, toMaterialRequest(material, subjects))
      setMaterials((current) => current.map((item) => item.id === id ? mapMaterial(updated) : item))
      setApiError('')
      return updated
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not update this material.'))
      return null
    }
  }

  const deleteStudyMaterial = async (id) => {
    try {
      await catalogApi.deleteMaterial(id)
      setMaterials((current) => current.filter((item) => item.id !== id))
      setApiError('')
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not delete this material.'))
      return false
    }
  }

  const createQuiz = async (quiz) => {
    try {
      const created = await quizApi.create(toQuizRequest(quiz, subjects))
      setQuizzes((current) => [mapQuiz(created), ...current])
      setApiError('')
      return created
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not save this quiz.'))
      return null
    }
  }

  const updateQuiz = async (id, quiz) => {
    try {
      const updated = await quizApi.update(id, toQuizRequest(quiz, subjects))
      setQuizzes((current) => current.map((item) => item.id === id ? mapQuiz(updated) : item))
      setApiError('')
      return updated
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not update this quiz.'))
      return null
    }
  }

  const deleteQuiz = async (id) => {
    try {
      await quizApi.delete(id)
      setQuizzes((current) => current.filter((item) => item.id !== id))
      setApiError('')
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not delete this quiz.'))
      return false
    }
  }

  const createSubject = async (subject) => {
    try {
      const created = await catalogApi.createSubject(subject)
      setSubjects((current) => [...current, created])
      setApiError('')
      return created
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not save this subject.'))
      return null
    }
  }

  const updateSubject = async (id, subject) => {
    try {
      const updated = await catalogApi.updateSubject(id, subject)
      setSubjects((current) => current.map((item) => item.id === id ? updated : item))
      return updated
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not update this subject.'))
      return null
    }
  }

  const deleteSubject = async (id) => {
    try {
      await catalogApi.deleteSubject(id)
      setSubjects((current) => current.filter((item) => item.id !== id))
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not delete this subject.'))
      return false
    }
  }

  const getQuizQuestions = async (id) => {
    try {
      return (await quizApi.questions(id)).map(mapQuestion)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not load quiz questions.'))
      return null
    }
  }

  const getAdminQuizQuestions = async (id) => {
    try {
      return await quizApi.adminQuestions(id)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not load the quiz answer key.'))
      return null
    }
  }

  const getQuizAttempt = async (id) => {
    try {
      return await quizApi.attempt(id)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not load this quiz result.'))
      return null
    }
  }

  const completeMaterial = async (materialId) => {
    if (!authUser?.studentId) return false
    try {
      setStudyProgress(mapProgress(await studentApi.completeMaterial(authUser.studentId, materialId)))
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not update your study progress.'))
      return false
    }
  }

  const addStudyHours = async (hours) => {
    if (!authUser?.studentId) return false
    try {
      setStudyProgress(mapProgress(await studentApi.addStudyHours(authUser.studentId, hours)))
      return true
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not record your study session.'))
      return false
    }
  }

  const getSummary = async (materialId) => {
    try {
      return await aiApi.summary(materialId)
    } catch (error) {
      if (error.response?.status !== 404) {
        setApiError(getApiErrorMessage(error, 'Could not load the summary.'))
        return null
      }
      try {
        return await aiApi.summarize(materialId)
      } catch (generationError) {
        setApiError(getApiErrorMessage(generationError, 'Could not generate a summary.'))
        return null
      }
    }
  }

  const generateFlashcards = async (topic, subjectId) => {
    try {
      return await aiApi.flashcards(topic, subjectId)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Could not generate flashcards.'))
      return null
    }
  }

  const askAi = async (prompt) => {
    try {
      if (authUser?.studentId && /recommend|revise|what should i study/i.test(prompt)) {
        const result = await aiApi.recommendations(authUser.studentId)
        return {
          mode: result.mode,
          response: result.recommendations.map((item) => `${item.title}: ${item.reason}`).join('\n'),
        }
      }
      return await aiApi.ask(prompt, authUser?.studentId)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'AI Study Copilot is unavailable right now.'))
      return null
    }
  }

  const scanSolve = async (question) => {
    try {
      return await aiApi.scanSolve(question)
    } catch (error) {
      setApiError(getApiErrorMessage(error, 'Scan & Solve is unavailable right now.'))
      return null
    }
  }

  const markFlashcardKnown = (cardId) => {
    const masteredIds = storage.get('masteredFlashcardIds', [])
    if (!masteredIds.includes(cardId)) storage.set('masteredFlashcardIds', [...masteredIds, cardId])
    setFlashcards((current) => current.map((card) => card.id === cardId ? { ...card, mastered: true } : card))
  }

  const setLocalFlashcards = (updater) => {
    setFlashcards((current) => typeof updater === 'function' ? updater(current) : updater)
  }

  const value = {
      theme,
      authUser,
      subjects,
      bookmarks,
      bookmarkRecords,
      quizAttempts,
      mistakes,
      plannerTasks,
      flashcards,
      materials,
      quizzes,
      studyProgress,
      recommendations,
      analytics,
      notifications,
      isLoading,
      apiError,
      clearApiError: () => setApiError(''),
      refreshData,
      refreshStudentData,
      setStudyProgress,
      setNotifications,
      setFlashcards: setLocalFlashcards,
      login,
      register,
      logout,
      toggleBookmark,
      toggleTheme,
      saveQuizAttempt,
      submitQuiz,
      saveMistake,
      addPlannerTask,
      togglePlannerTask,
      deletePlannerTask,
      addMaterial: addStudyMaterial,
      updateMaterial: updateStudyMaterial,
      deleteMaterial: deleteStudyMaterial,
      addQuiz: createQuiz,
      updateQuiz,
      deleteQuiz,
      createSubject,
      updateSubject,
      deleteSubject,
      getQuizQuestions,
      getAdminQuizQuestions,
      getQuizAttempt,
      completeMaterial,
      addStudyHours,
      getSummary,
      generateFlashcards,
      askAi,
      scanSolve,
      markFlashcardKnown,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
