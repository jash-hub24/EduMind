import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Bookmark,
  CheckCircle2,
  Clock3,
  CopyCheck,
  FileQuestion,
  LayoutDashboard,
  ListTodo,
  NotebookPen,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
} from 'lucide-react'
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'
import { Badge, Button, Card, EmptyState, Modal, ProgressBar, SectionHeading, StatCard, Toast } from '../components/UI'
import { useApp } from '../context/AppContext'
import { storage } from '../services/storage'

const COLORS = ['#4f46e5', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e']

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [form, setForm] = useState({ email: 'student@edumind.com', password: 'student1234' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await login(form.email, form.password)
      if (!result.success) {
        setError(result.message)
        return
      }
      navigate(result.role === 'admin' ? '/admin' : '/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const demoLogin = async (role) => {
    const user = role === 'admin' ? { email: 'admin@edumind.com', password: 'admin1234' } : { email: 'student@edumind.com', password: 'student1234' }
    setForm(user)
    setSubmitting(true)
    setError('')
    const result = await login(user.email, user.password)
    if (result.success) navigate(result.role === 'admin' ? '/admin' : '/dashboard')
    else setError(result.message)
    setSubmitting(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel__content">
        <div className="brand-block large">
          <div className="brand-mark">E</div>
          <div>
            <h2>EduMind</h2>
            <small>Your intelligent learning companion.</small>
          </div>
        </div>

        <div className="auth-copy">
          <h1>Welcome back</h1>
          <p>Build momentum with structured revision, smart AI guidance, and measurable growth.</p>
        </div>

        <div className="feature-strip">
          <span>Study materials</span>
          <span>AI support</span>
          <span>Progress tracking</span>
        </div>
      </div>

      <div className="auth-panel auth-panel__form">
        <div className="auth-header">
          <h2>Login</h2>
          <p>Access your personalized study workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            <span>Email</span>
            <input type="email" value={form.email} onChange={handleChange('email')} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={form.password} onChange={handleChange('password')} required />
          </label>
          {error && <div className="form-error">{error}</div>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Login'}</Button>
          <Link to="/register" className="btn btn-secondary width-100">Create Account</Link>
          <div className="demo-row">
            <button type="button" className="btn btn-ghost" onClick={() => demoLogin('student')}>Demo Student</button>
            <button type="button" className="btn btn-ghost" onClick={() => demoLogin('admin')}>Demo Admin</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useApp()
  const [form, setForm] = useState({ name: '', email: '', password: '', course: '', semester: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const user = await register(form)
    if (user.success) navigate('/dashboard')
    else setError(user.message)
    setSubmitting(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel__content">
        <div className="brand-block large">
          <div className="brand-mark">E</div>
          <div>
            <h2>EduMind</h2>
            <small>Your intelligent learning companion.</small>
          </div>
        </div>
        <div className="auth-copy">
          <h1>Create your account</h1>
          <p>Join a smarter academic routine built for clarity, practice, and outcomes.</p>
        </div>
      </div>
      <div className="auth-panel auth-panel__form">
        <div className="auth-header">
          <h2>Register</h2>
          <p>Set up your student profile.</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label><span>Name</span><input value={form.name} onChange={handleChange('name')} required /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={handleChange('email')} required /></label>
          <label><span>Password</span><input type="password" value={form.password} onChange={handleChange('password')} minLength={8} required /></label>
          <label><span>Course</span><input value={form.course} onChange={handleChange('course')} placeholder="B.Tech Computer Science" /></label>
          <label><span>Semester</span><input value={form.semester} onChange={handleChange('semester')} placeholder="6th Semester" /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'}</Button>
          <Link to="/login" className="btn btn-secondary width-100">Back to Login</Link>
        </form>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { authUser, studyProgress, materials, flashcards, mistakes, recommendations } = useApp()
  const { examReadiness, studyStreak, studyHours, quizAverage, materialsCompleted } = studyProgress

  const continueLearning = materials.slice(0, 3).map((item) => ({
    ...item,
    progress: item.subject === 'DBMS' ? 72 : item.subject === 'Data Structures' ? 48 : 81,
  }))

  const fallbackRecommendations = [
    { title: 'DBMS Normalization Quiz', reason: 'Recommended because you scored 52% in your last attempt.', action: 'Start Practice' },
    { title: '3NF Quick Notes', reason: 'Recommended because Normalization is currently one of your weak topics.', action: 'Review' },
  ]
  const displayedRecommendations = recommendations.length
    ? recommendations.map((item) => ({ ...item, action: 'Review' }))
    : fallbackRecommendations

  const chartData = studyProgress.weeklyHours

  return (
    <div className="stacked-page">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Good morning, {authUser?.name || 'Student'}.</p>
          <h2>Let&apos;s make today&apos;s study session count.</h2>
        </div>
        <div className="readiness-ring">
          <div className="ring-center">
            <strong>{examReadiness}%</strong>
            <span>Exam Readiness</span>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard title="Exam Readiness" value={`${examReadiness}%`} subtitle="Target 90%" accent="primary" />
        <StatCard title="Study Streak" value={`${studyStreak} days`} subtitle="Consistency" accent="green" />
        <StatCard title="Study Hours" value={`${studyHours}h`} subtitle="This week" accent="purple" />
        <StatCard title="Quiz Average" value={`${quizAverage}%`} subtitle={`Across ${studyProgress.quizAttempts || 0} attempts`} accent="orange" />
        <StatCard title="Materials Completed" value={materialsCompleted} subtitle="Resource mastery" accent="teal" />
      </div>

      <div className="two-col-grid">
        <Card className="panel-card">
          <SectionHeading icon={Clock3} title="Continue Learning" subtitle="Pick up where you left off" />
          <div className="stack-list compact">
            {continueLearning.map((item) => (
              <div key={item.id} className="learning-row">
                <div>
                  <h4>{item.subject} — {item.topic}</h4>
                  <ProgressBar value={item.progress} />
                  <small>{item.progress}% complete</small>
                </div>
                <Button variant="secondary" className="tiny-btn">Continue Learning</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <SectionHeading icon={Sparkles} title="Smart Recommendations" subtitle="Actions tailored to your weak areas" />
          <div className="stack-list">
            {displayedRecommendations.map((item) => (
              <div key={item.title} className="recommendation-card">
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.reason}{item.priority ? ` Priority: ${item.priority.toLowerCase()}.` : ''}</p>
                </div>
                {item.resourceId
                  ? <Link className="btn btn-secondary" to={`/materials/${item.resourceId}`}>{item.action}</Link>
                  : <Button variant="secondary">{item.action}</Button>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="three-col-grid">
        <Card className="panel-card">
          <SectionHeading icon={Target} title="Weak Topics" subtitle="Focus areas" />
          <div className="progress-stack">
            {studyProgress.weakTopics.map((item) => (
              <div key={item.topic} className="topic-meter">
                <div className="topic-header"><span>{item.topic}</span><strong>{item.value}%</strong></div>
                <ProgressBar value={item.value} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <SectionHeading icon={NotebookPen} title="Today&apos;s Revision" subtitle="Quick actions" />
          <div className="mini-metrics">
            <div><strong>{flashcards.filter((card) => !card.mastered).length}</strong><span>flashcards due</span></div>
            <div><strong>{mistakes.length}</strong><span>mistakes to review</span></div>
            <div><strong>{recommendations.length}</strong><span>quizzes recommended</span></div>
          </div>
          <Button variant="secondary">Review Now</Button>
        </Card>

        <Card className="panel-card chart-panel">
          <SectionHeading icon={BarChart3} title="Weekly Activity" subtitle="Study hours" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="hoursFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="hours" stroke="#7c3aed" fill="url(#hoursFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export function MaterialsPage() {
  const { materials, subjects, bookmarks, toggleBookmark } = useApp()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All')
  const [type, setType] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [semester, setSemester] = useState('All')

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const matchesQuery = `${item.title} ${item.subject} ${item.topic}`.toLowerCase().includes(query.toLowerCase())
      const matchesSubject = subject === 'All' || item.subject === subject
      const matchesType = type === 'All' || item.resourceType === type
      const matchesDifficulty = difficulty === 'All' || item.difficulty === difficulty
      const matchesSemester = semester === 'All' || item.semester === semester
      return matchesQuery && matchesSubject && matchesType && matchesDifficulty && matchesSemester
    })
  }, [materials, query, subject, type, difficulty, semester])

  return (
    <div className="stacked-page">
      <SectionHeading icon={BookOpen} title="Study Materials" subtitle="Centralized learning resources" />
      <div className="filter-bar">
        <div className="search-box small"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes, topics, PDFs..." /></div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}><option>All</option>{subjects.map((item) => <option key={item.id || item.name}>{item.name}</option>)}</select>
        <select value={semester} onChange={(e) => setSemester(e.target.value)}><option>All</option><option>3</option><option>4</option><option>5</option><option>6</option></select>
        <select value={type} onChange={(e) => setType(e.target.value)}><option>All</option><option>Notes</option><option>PDF</option><option>Video</option><option>Question Bank</option><option>Previous Year Paper</option></select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
      </div>

      <div className="material-grid">
        {filteredMaterials.map((item) => {
          const isBookmarked = bookmarks.includes(item.id)
          return (
            <Card key={item.id} className="material-card">
              <div className="material-topline">
                <Badge tone="primary">{item.subject}</Badge>
                <span>{item.resourceType}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="material-meta">
                <span>Topic: {item.topic}</span>
                <span>Difficulty: {item.difficulty}</span>
                <span>Updated: {item.updatedAt}</span>
              </div>
              <div className="card-actions">
                <Link to={`/materials/${item.id}`} className="btn btn-primary">View</Link>
                <button type="button" className="btn btn-secondary" onClick={() => toggleBookmark(item.id)}>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>
                {item.fileUrl
                  ? <a className="btn btn-ghost" href={item.fileUrl} target="_blank" rel="noreferrer">Download</a>
                  : <button type="button" className="btn btn-ghost" disabled>Download</button>}
              </div>
            </Card>
          )
        })}
      </div>
      {filteredMaterials.length === 0 && <EmptyState title="No resources found" description="Try another keyword or filter combination." />}
    </div>
  )
}

export function MaterialDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { materials, bookmarks, toggleBookmark, flashcards, setFlashcards, getSummary, generateFlashcards, completeMaterial } = useApp()
  const material = materials.find((item) => String(item.id) === id)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  if (!material) {
    return <EmptyState title="Material not found" description="This resource is unavailable in the current catalog." />
  }

  const fallbackSummary = {
    quickSummary: `A focused overview of ${material.topic} in ${material.subject}.`,
    keyConcepts: material.keyConcepts || [],
    importantDefinitions: ['Functional dependency', 'Lossless decomposition', 'Anomaly prevention'],
    examPoints: ['Know the definition and real-world scenario', 'Practice questions with examples', 'Compare normal forms in one line'],
    commonMistakes: ['Confusing 2NF with 3NF', 'Ignoring partial dependency', 'Overlooking candidate keys'],
    quickRevision: ['Revise key definitions', 'Solve 5 MCQs', 'Summarize in 3 lines'],
  }

  const aiSummary = summary ? {
    ...fallbackSummary,
    quickSummary: summary.overview,
    keyConcepts: summary.keyPoints?.length ? summary.keyPoints : fallbackSummary.keyConcepts,
  } : fallbackSummary

  const openSummary = async () => {
    setSummaryOpen(true)
    if (summary) return
    setSummaryLoading(true)
    const result = await getSummary(material.id)
    if (result) setSummary(result)
    setSummaryLoading(false)
  }

  const handleGenerateFlashcards = async () => {
    const existing = flashcards.some((card) => card.subject === material.subject && card.topic === material.topic)
    if (!existing) {
      const generated = await generateFlashcards(material.topic, material.subjectId)
      const newCards = generated?.map((card, index) => ({
        id: `ai-${material.id}-${Date.now()}-${index}`,
        subject: material.subject,
        subjectId: material.subjectId,
        topic: card.topic || material.topic,
        question: card.question,
        answer: card.answer,
        mastered: false,
      })) || []
      setFlashcards((current) => [...newCards, ...current])
    }
    navigate('/flashcards')
  }

  const handleStartLearning = async () => {
    const completed = await completeMaterial(material.id)
    setActionMessage(completed ? 'Progress updated.' : 'Progress could not be updated.')
  }

  const isBookmarked = bookmarks.includes(material.id)

  return (
    <div className="stacked-page">
      <Card className="material-detail-header">
        <div>
          <p className="eyebrow">{material.subject}</p>
          <h2>{material.title}</h2>
          <div className="material-detail-meta">
            <span>Topic: {material.topic}</span>
            <span>Difficulty: {material.difficulty}</span>
            <span>Faculty: {material.faculty}</span>
            <span>Last Updated: {material.updatedAt}</span>
            <span>Study Time: {material.estimatedStudyTime} min</span>
          </div>
        </div>
        <div className="detail-buttons">
          <Button onClick={handleStartLearning}>Start Learning</Button>
          <Button variant="secondary" onClick={() => toggleBookmark(material.id)}>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</Button>
          <Button variant="ghost" onClick={openSummary}>Generate AI Summary</Button>
          <Button variant="ghost" onClick={handleGenerateFlashcards}>Generate Flashcards</Button>
          <Button variant="ghost" onClick={() => navigate('/ai-chat')}>Ask AI</Button>
        </div>
      </Card>
      {actionMessage && <p className="api-inline-message" role="status">{actionMessage}</p>}

      <div className="content-column-grid">
        <Card className="panel-card">
          <SectionHeading icon={BookOpen} title="Overview" />
          <p>{material.overview}</p>
        </Card>
        <Card className="panel-card">
          <SectionHeading icon={Sparkles} title="Key Concepts" />
          <ul className="bullet-list">
            {material.keyConcepts.map((concept) => <li key={concept}>{concept}</li>)}
          </ul>
        </Card>
        <Card className="panel-card">
          <SectionHeading icon={Target} title="Important Topics" />
          <ul className="bullet-list">
            {material.importantTopics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </Card>
      </div>

      <Modal open={summaryOpen} title={`AI Summary: ${material.topic}`} onClose={() => setSummaryOpen(false)}>
        <div className="summary-content">
          {summaryLoading && <p role="status">Generating summary…</p>}
          <h4>Quick Summary</h4>
          <p>{aiSummary.quickSummary}</p>
          <h4>Key Concepts</h4>
          <ul>{aiSummary.keyConcepts.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>Important Definitions</h4>
          <ul>{aiSummary.importantDefinitions.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>Exam Points</h4>
          <ul>{aiSummary.examPoints.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>Common Mistakes</h4>
          <ul>{aiSummary.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>Quick Revision</h4>
          <ul>{aiSummary.quickRevision.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </Modal>
    </div>
  )
}

export function QuestionBankPage() {
  const { materials } = useApp()
  const questions = materials.filter((item) => item.resourceType === 'Question Bank')

  return (
    <div className="stacked-page">
      <SectionHeading icon={FileQuestion} title="Question Bank" subtitle="Practice with concept-driven sets" />
      <div className="material-grid">
        {questions.map((item) => (
          <Card key={item.id} className="material-card">
            <div className="material-topline"><Badge tone="purple">{item.subject}</Badge></div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="card-actions">
              <Link to={`/materials/${item.id}`} className="btn btn-primary">Open</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function PYQPage() {
  const { materials } = useApp()
  const pyqs = materials.filter((item) => item.resourceType === 'Previous Year Paper')

  return (
    <div className="stacked-page">
      <SectionHeading icon={CopyCheck} title="Previous Year Papers" subtitle="Exam pattern and forecasting" />
      <div className="material-grid">
        {pyqs.map((item) => (
          <Card key={item.id} className="material-card">
            <div className="material-topline"><Badge tone="teal">{item.subject}</Badge></div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="card-actions">
              <Link to={`/materials/${item.id}`} className="btn btn-primary">Preview</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function QuizListPage() {
  const { quizzes } = useApp()

  return (
    <div className="stacked-page">
      <SectionHeading icon={CopyCheck} title="Quiz Library" subtitle="Daily practice and assessment" />
      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="quiz-card">
            <div className="quiz-head">
              <div>
                <p>{quiz.subject}</p>
                <h3>{quiz.title}</h3>
              </div>
              <Badge tone="primary">{quiz.level}</Badge>
            </div>
            <div className="quiz-metadata">
              <span>{quiz.questionCount ?? quiz.questions.length} Questions</span>
              <span>{quiz.duration} Minutes</span>
              <span>{quiz.level}</span>
            </div>
            <Link to={`/quiz/${quiz.id}`} className="btn btn-primary width-100">Start Quiz</Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function QuizPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { quizzes, getQuizQuestions, submitQuiz, isLoading } = useApp()
  const baseQuiz = quizzes.find((item) => String(item.id) === quizId)
  const [questionSet, setQuestionSet] = useState(null)
  const [questionLoading, setQuestionLoading] = useState(true)
  const [questionError, setQuestionError] = useState('')
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submitted = useRef(false)
  const timerExpired = useRef(false)
  const quiz = baseQuiz ? { ...baseQuiz, questions: questionSet || [] } : null

  const loadQuizQuestions = useEffectEvent(async (quizToLoad, isCurrent) => {
    setQuestionSet(null)
    setQuestionLoading(true)
    setQuestionError('')
    setTimerStarted(false)
    setSubmitting(false)
    submitted.current = false
    timerExpired.current = false
    const questions = await getQuizQuestions(quizToLoad.id)
    if (!isCurrent()) return
    if (!questions) {
      setQuestionError('Quiz questions could not be loaded. Retry from the quiz list.')
      setQuestionLoading(false)
      return
    }
    setQuestionSet(questions)
    setQuestionLoading(false)
    setTimeLeft(quizToLoad.duration * 60)
    setCurrentIndex(0)
    setSelectedAnswers({})
    setMarkedForReview([])
    setTimerStarted(true)
  })

  async function handleSubmit() {
    if (submitted.current || !quiz) return
    submitted.current = true
    setSubmitting(true)
    const durationSeconds = Math.max(0, quiz.duration * 60 - timeLeft)
    const attempt = await submitQuiz(quiz, selectedAnswers, durationSeconds)
    if (!attempt) {
      submitted.current = false
      setSubmitting(false)
      return
    }
    navigate('/quiz-result', {
      state: {
        quiz,
        result: {
          ...attempt,
          correct: attempt.correct,
          incorrect: attempt.incorrect,
        },
      },
    })
  }

  const tickTimer = useEffectEvent(() => {
    setTimeLeft((current) => {
      if (current <= 1) timerExpired.current = true
      return Math.max(0, current - 1)
    })
  })

  const submitAfterTimeout = useEffectEvent(() => {
    if (timerExpired.current && timerStarted && quiz?.questions.length && !submitting) handleSubmit()
  })

  useEffect(() => {
    let active = true
    if (baseQuiz) loadQuizQuestions(baseQuiz, () => active)
    return () => { active = false }
  }, [baseQuiz?.id])

  useEffect(() => {
    if (!quiz || questionLoading || !timerStarted) return
    const timer = setInterval(tickTimer, 1000)

    return () => clearInterval(timer)
  }, [quiz?.id, questionLoading, timerStarted])

  useEffect(() => {
    if (timeLeft === 0 && timerStarted) submitAfterTimeout()
  }, [timeLeft, timerStarted])

  if (!baseQuiz && isLoading) {
    return <EmptyState title="Loading quiz" description="Connecting to the assessment library." />
  }
  if (!baseQuiz) {
    return <EmptyState title="Quiz not found" description="This assessment is not available right now." />
  }
  if (questionLoading) return <EmptyState title="Loading questions" description={`Preparing ${baseQuiz.title}.`} />
  if (questionError || !quiz.questions.length) return <EmptyState title="Questions unavailable" description={questionError || 'This quiz has no questions yet.'} />

  const current = quiz.questions[currentIndex]

  const updateAnswer = (answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [current.id]: answer }))
  }

  const nextQuestion = () => setCurrentIndex((prev) => Math.min(prev + 1, quiz.questions.length - 1))
  const prevQuestion = () => setCurrentIndex((prev) => Math.max(prev - 1, 0))

  const toggleReview = () => {
    setMarkedForReview((prev) =>
      prev.includes(currentIndex) ? prev.filter((idx) => idx !== currentIndex) : [...prev, currentIndex],
    )
  }

  return (
    <div className="quiz-shell">
      <Card className="quiz-topbar">
        <div>
          <p>{quiz.subject}</p>
          <h2>{quiz.title}</h2>
        </div>
        <div className="quiz-meta-info">
          <span>Q {currentIndex + 1}/{quiz.questions.length}</span>
          <span>{new Date(Math.max(0, timeLeft) * 1000).toISOString().slice(14, 19)}</span>
        </div>
      </Card>

      <div className="progress-shell large"><div className="progress-fill" style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }} /></div>

      <Card className="quiz-card-main">
        <div className="question-header">
          <span className="question-tag">Question {currentIndex + 1}</span>
            {markedForReview.includes(currentIndex) && <Badge tone="warning">Marked for review</Badge>}
        </div>
        <h3>{current.question}</h3>
        <div className="options-grid">
          {current.options.map((option) => (
            <button
              type="button"
              key={option}
              className={`option-button ${selectedAnswers[current.id] === option ? 'selected' : ''}`}
              onClick={() => updateAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="quiz-footer-actions">
          <Button variant="secondary" onClick={prevQuestion}>Previous</Button>
          <Button variant="secondary" onClick={toggleReview}>Mark for Review</Button>
          <Button variant="secondary" onClick={nextQuestion}>Next</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Quiz'}</Button>
        </div>
      </Card>
    </div>
  )
}

export function QuizResultPage() {
  const location = useLocation()
  const { quizzes, getQuizAttempt } = useApp()
  const [data, setData] = useState(location.state || null)
  const [loading, setLoading] = useState(!location.state)

  const loadResult = useEffectEvent(async (isCurrent) => {
    if (location.state?.result) {
      const attempt = location.state.result
      setData(location.state)
      storage.set('lastQuizAttempt', { attemptId: attempt.id, quizId: attempt.quizId })
      setLoading(false)
      return
    }
    const savedAttempt = storage.get('lastQuizAttempt', null)
    if (!savedAttempt?.attemptId) {
      setLoading(false)
      return
    }
    getQuizAttempt(savedAttempt.attemptId).then((attempt) => {
      if (!isCurrent() || !attempt) return
      const quiz = quizzes.find((item) => item.id === attempt.quizId) || { id: attempt.quizId, title: attempt.quizTitle }
      setData({ quiz, result: {
        id: attempt.id,
        quizId: attempt.quizId,
        score: attempt.correctCount,
        total: attempt.totalQuestions,
        percentage: Math.round(attempt.percentage || 0),
        correct: attempt.correctCount,
        incorrect: attempt.totalQuestions - attempt.correctCount,
        timeTaken: '—',
        weakTopics: attempt.weakTopics,
      } })
    }).finally(() => { if (isCurrent()) setLoading(false) })
  })

  useEffect(() => {
    let active = true
    loadResult(() => active)
    return () => { active = false }
  }, [location.state?.result?.id])

  if (loading) return <EmptyState title="Loading result" description="Retrieving your saved quiz attempt." />
  if (!data?.result) return <EmptyState title="No quiz result" description="Complete a quiz to see your saved result here." />

  const { quiz, result: resultInfo } = data

  const chartData = [
    { name: 'Correct', value: resultInfo.correct },
    { name: 'Incorrect', value: resultInfo.incorrect },
  ]

  return (
    <div className="stacked-page">
      <Card className="result-card">
        <div>
          <p className="eyebrow">Assessment complete</p>
          <h2>{quiz?.title || 'DBMS Fundamentals'} Result</h2>
        </div>
        <div className="result-score">
          <strong>{resultInfo.score} / {resultInfo.total}</strong>
          <span>{resultInfo.percentage}%</span>
        </div>
      </Card>

      <div className="two-col-grid">
        <Card className="panel-card">
          <SectionHeading icon={CheckCircle2} title="Summary" />
          <div className="result-stats">
            <div><strong>{resultInfo.correct}</strong><span>Correct Answers</span></div>
            <div><strong>{resultInfo.incorrect}</strong><span>Incorrect</span></div>
            <div><strong>{resultInfo.timeTaken}</strong><span>Time Taken</span></div>
          </div>
        </Card>

        <Card className="panel-card">
          <SectionHeading icon={BarChart3} title="Performance" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={60} paddingAngle={2}>
                {chartData.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? '#22c55e' : '#ef4444'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="panel-card">
        <SectionHeading icon={Star} title="Recommended Next Steps" />
        <ul className="bullet-list">
          {(resultInfo.weakTopics?.length ? resultInfo.weakTopics : ['Continue with a new practice topic']).map((topic) => <li key={topic}>Review {topic}</li>)}
        </ul>
        <div className="recommendation-row"><Link to="/revision" className="btn btn-secondary">Review weak topics</Link><Link to="/quizzes" className="btn btn-secondary">Attempt another quiz</Link></div>
      </Card>
    </div>
  )
}

export function AIChatPage() {
  const { askAi } = useApp()
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi Jash! I can help explain DBMS, DSA, Java, OS, and networking topics. Ask me anything.' },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const suggestions = ['Explain this simply', 'Give me an example', 'Generate MCQs', 'Summarize this topic', 'Give exam answer', 'What should I revise?']

  const generateResponse = (prompt) => {
    const lower = prompt.toLowerCase()
    if (lower.includes('dbms') || lower.includes('normalization')) {
      return 'Normalization removes redundancy by organizing relations. In 2NF, partial dependency is removed, while 3NF removes transitive dependency. A quick memory cue: 1NF structure, 2NF full dependency, 3NF no transitive dependency.'
    }
    if (lower.includes('tree') || lower.includes('dsa')) {
      return 'A tree is a hierarchical structure with a root and child nodes. In-order traversal of a BST produces sorted order, while DFS and BFS help in searching and path discovery.'
    }
    if (lower.includes('java') || lower.includes('oop')) {
      return 'Java OOP emphasizes encapsulation, inheritance, and polymorphism. Encapsulation hides data, inheritance promotes reuse, and polymorphism enables one interface to behave in multiple ways.'
    }
    if (lower.includes('os') || lower.includes('operating')) {
      return 'Operating systems manage processes, memory, and hardware. Scheduling algorithms like Round Robin improve fairness, while paging helps memory allocation efficiently.'
    }
    if (lower.includes('network') || lower.includes('computer')) {
      return 'Computer networks organize communication using layered models. The network layer is responsible for routing, while the transport layer ensures reliable end-to-end communication.'
    }
    return 'Here is a concise study answer: break the concept into definition, key steps, real-life example, and one exam takeaway. This approach improves recall and verbal explanation quality.'
  }

  const handleSend = async () => {
    if (!input.trim()) return
    const prompt = input.trim()
    setMessages((current) => [...current, { role: 'user', text: prompt }])
    setInput('')
    setThinking(true)
    const contextualResponse = generateResponse(prompt)
    const backendResponse = await askAi(prompt)
    const response = backendResponse?.response
      ? `${contextualResponse}\n\nEduMind backend (${backendResponse.mode.toLowerCase()}): ${backendResponse.response}`
      : contextualResponse
    setMessages((current) => [...current, { role: 'ai', text: response }])
    setThinking(false)
  }

  return (
    <div className="stacked-page">
      <SectionHeading icon={BrainCircuit} title="EduMind AI" subtitle="Your personal study copilot." />
      <Card className="ai-chat-shell">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
              <div>{message.text}</div>
            </div>
          ))}
          {thinking && <div className="chat-message ai"><div>Thinking…</div></div>}
        </div>
        <div className="suggestions-row">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" className="suggestion-pill" onClick={() => setInput(suggestion)}>{suggestion}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask EduMind AI..." />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </Card>
    </div>
  )
}

export function ScanSolvePage() {
  const { scanSolve, saveMistake } = useApp()
  const [image, setImage] = useState('')
  const sampleQuestion = 'Which normal form removes partial dependency?'
  const [question, setQuestion] = useState(sampleQuestion)
  const [backendResponse, setBackendResponse] = useState('')
  const [solving, setSolving] = useState(false)

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSolve = async () => {
    setSolving(true)
    const result = await scanSolve(question)
    if (result?.response) setBackendResponse(result.response)
    setSolving(false)
  }

  return (
    <div className="stacked-page">
      <SectionHeading icon={Upload} title="Scan & Solve" subtitle="Snap or upload your question" />
      <Card className="upload-card">
        <label className="upload-box">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <div>
            <Upload size={28} />
            <p>Upload a question image</p>
          </div>
        </label>
        {image && <img src={image} alt="Uploaded question preview" className="upload-preview" />}
      </Card>

      <Card className="panel-card">
        <SectionHeading icon={FileQuestion} title="Question" />
        <textarea className="detected-question" value={question} onChange={(event) => setQuestion(event.target.value)} />
        <div className="solution-box">
          <h4>Step-by-step solution</h4>
          {question.trim() === sampleQuestion
            ? <ol>
              <li>Identify the candidate key and non-key attributes.</li>
              <li>Check whether any non-key attribute depends only on part of the key.</li>
              <li>If yes, the relation is not in 2NF and must be decomposed.</li>
            </ol>
            : <p>Run Explain Simpler to get a response for this question.</p>}
        </div>
        {question.trim() === sampleQuestion && <>
          <div className="answer-box"><h4>Correct answer</h4><p>2NF</p></div>
          <div className="answer-meta"><span>Concept: Normalization</span><span>Difficulty: Intermediate</span></div>
        </>}
        {backendResponse && <div className="solution-box"><h4>EduMind backend demo response</h4><p>{backendResponse}</p></div>}
        <div className="recommendation-row">
          <Button variant="secondary" onClick={handleSolve} disabled={solving}>{solving ? 'Solving…' : 'Explain Simpler'}</Button>
          <Button variant="secondary" onClick={() => { setQuestion(`Generate a similar practice question about: ${question}`); setBackendResponse('') }}>Generate Similar Question</Button>
          <Button variant="ghost" onClick={() => saveMistake([{ id: `scan-${Date.now()}`, question, yourAnswer: '', correctAnswer: '2NF', topic: 'Normalization', subject: 'DBMS', date: new Date().toISOString() }])}>Save to Mistakes</Button>
        </div>
      </Card>
    </div>
  )
}

export function FlashcardsPage() {
  const { flashcards, markFlashcardKnown } = useApp()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = flashcards[index] || null

  const handleKnown = () => {
    markFlashcardKnown(card.id)
    setIndex((prev) => (prev + 1) % flashcards.length)
    setFlipped(false)
  }

  const handleNeedRevision = () => {
    setIndex((prev) => (prev + 1) % flashcards.length)
    setFlipped(false)
  }

  if (!card) {
    return <EmptyState title="No flashcards available" description="Generate or add some cards to continue." />
  }

  return (
    <div className="stacked-page">
      <SectionHeading icon={NotebookPen} title="Flashcards" subtitle="Retention through active recall" />
      <Card className="flashcard-shell">
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <div className="flashcard-face front">
            <span className="flashcard-label">Question</span>
            <h3>{card.question}</h3>
          </div>
          <div className="flashcard-face back">
            <span className="flashcard-label">Answer</span>
            <p>{card.answer}</p>
          </div>
        </div>
        <div className="flashcard-controls">
          <Button variant="secondary" onClick={() => setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)}>Previous</Button>
          <Button variant="secondary" onClick={() => setIndex((prev) => (prev + 1) % flashcards.length)}>Next</Button>
          <Button variant="secondary" onClick={() => setFlipped(!flipped)}>Flip</Button>
          <Button onClick={handleKnown}>Known</Button>
          <Button variant="secondary" onClick={handleNeedRevision}>Need Revision</Button>
        </div>
        <div className="flashcard-stats">
          <div><strong>{flashcards.filter((item) => item.mastered).length}</strong><span>Mastered</span></div>
          <div><strong>{flashcards.filter((item) => !item.mastered).length}</strong><span>Need Revision</span></div>
          <div><strong>{index + 1}</strong><span>Cards reviewed</span></div>
        </div>
      </Card>
    </div>
  )
}

export function BookmarksPage() {
  const { materials, bookmarks } = useApp()
  const [filter, setFilter] = useState('All')

  const items = materials.filter((item) => bookmarks.includes(item.id) && (filter === 'All' || item.resourceType === filter))

  return (
    <div className="stacked-page">
      <SectionHeading icon={Bookmark} title="Bookmarks" subtitle="Your saved learning resources" />
      <div className="filter-bar compact">
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option>All</option>
          <option>Notes</option>
          <option>Video</option>
          <option>Question Bank</option>
          <option>Previous Year Paper</option>
        </select>
      </div>
      <div className="material-grid">
        {items.map((item) => (
          <Card key={item.id} className="material-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="card-actions">
              <Link to={`/materials/${item.id}`} className="btn btn-primary">Open</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function PlannerPage() {
  const { plannerTasks, addPlannerTask, togglePlannerTask, deletePlannerTask } = useApp()
  const [form, setForm] = useState({ title: '', time: '', duration: 45 })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.time.trim()) return
    addPlannerTask({ title: form.title, time: form.time, duration: Number(form.duration) })
    setForm({ title: '', time: '', duration: 45 })
  }

  const completion = (plannerTasks.filter((task) => task.completed).length / Math.max(plannerTasks.length, 1)) * 100

  return (
    <div className="stacked-page">
      <SectionHeading icon={ListTodo} title="Study Planner" subtitle="Today&apos;s path and tasks" />
      <Card className="planner-summary">
        <div>
          <p>Today&apos;s Plan</p>
          <strong>{Math.round(completion)}%</strong>
        </div>
        <ProgressBar value={completion} />
      </Card>

      <div className="two-col-grid">
        <Card className="panel-card">
          <h3>Today's Plan</h3>
          <div className="task-list">
            {plannerTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
                <div>
                  <strong>{task.time}</strong>
                  <p>{task.title}</p>
                  <small>{task.duration} min</small>
                </div>
                <div className="task-controls">
                  <button type="button" className="icon-button" onClick={() => togglePlannerTask(task.id)}>{task.completed ? '↺' : '✓'}</button>
                  <button type="button" className="icon-button" onClick={() => deletePlannerTask(task.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <h3>Add Task</h3>
          <form className="planner-form" onSubmit={handleSubmit}>
            <label><span>Task</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label><span>Time</span><input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="6:30 PM" /></label>
            <label><span>Duration (min)</span><input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></label>
            <Button type="submit">Add Task</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export function RevisionPage() {
  const { mistakes, studyProgress, recommendations } = useApp()
  const fallbackTopics = [
    { title: 'DBMS Normalization', level: 'HIGH PRIORITY', reason: 'Repeated mistakes in functional dependency analysis.', action: 'Review' },
    { title: 'DSA Trees', level: 'MEDIUM', reason: 'Your traversal accuracy is below the ideal benchmark.', action: 'Review' },
    { title: 'Java Collections', level: 'LOW', reason: 'You have been gradually improving in this topic.', action: 'Review' },
  ]
  const topics = studyProgress.weakTopics.length
    ? studyProgress.weakTopics.map((item) => ({
      title: item.topic,
      level: item.value < 60 ? 'HIGH PRIORITY' : 'MEDIUM',
      reason: recommendations.find((recommendation) => recommendation.reason.toLowerCase().includes(item.topic.toLowerCase()))?.reason
        || 'Recent quiz attempts marked this topic for review.',
      action: 'Review',
    }))
    : fallbackTopics

  return (
    <div className="stacked-page">
      <SectionHeading icon={Target} title="Your Smart Revision Queue" subtitle="EduMind prioritizes topics based on mistakes, performance, and history." />
      <div className="revision-stack">
        {topics.map((topic) => (
          <Card key={topic.title} className="revision-item">
            <div>
              <span className={`priority-label ${topic.level.toLowerCase().replace(' ', '-')}`}>{topic.level}</span>
              <h3>{topic.title}</h3>
            </div>
            <p>{topic.reason}</p>
            <Button variant="secondary">{topic.action}</Button>
          </Card>
        ))}
      </div>
      <Card className="panel-card">
        <SectionHeading icon={NotebookPen} title="Mistake Notebook" subtitle={`${mistakes.length} saved mistakes`} />
        <div className="mistakes-list">
          {mistakes.slice(0, 3).map((mistake) => (
            <div key={mistake.id} className="mistake-item">
              <strong>{mistake.topic}</strong>
              <p>{mistake.question}</p>
              <small>Your answer: {mistake.yourAnswer}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function ProgressPage() {
  const { studyProgress } = useApp()

  const fallbackPerformance = [
    { name: 'DBMS', performance: 74 },
    { name: 'DSA', performance: 61 },
    { name: 'Java', performance: 82 },
    { name: 'OS', performance: 68 },
    { name: 'CN', performance: 77 },
  ]
  const quizPerformance = studyProgress.recentAttempts?.length
    ? studyProgress.recentAttempts.map((attempt) => ({ name: attempt.quizTitle, performance: attempt.percentage || 0 }))
    : fallbackPerformance

  return (
    <div className="stacked-page">
      <SectionHeading icon={TrendingUp} title="Progress Analytics" subtitle="Performance snapshot" />
      <div className="two-col-grid">
        <Card className="panel-card">
          <h3>Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studyProgress.weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="panel-card">
          <h3>Quiz Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={quizPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={48} />
              <Tooltip />
              <Bar dataKey="performance" fill="#14b8a6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="subject-grid">
        {studyProgress.subjectPerformance.map((subject) => (
          <Card key={subject.subject} className="subject-card">
            <div className="subject-card-head"><span>{subject.subject}</span><strong>{subject.value}%</strong></div>
            <ProgressBar value={subject.value} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { authUser } = useApp()

  return (
    <div className="stacked-page">
      <Card className="profile-card">
        <div className="avatar large">J</div>
        <div>
          <h2>{authUser?.name || 'Jash'}</h2>
          <p>{authUser?.email || 'student@edumind.com'}</p>
          <p>{authUser?.course || 'B.Tech Computer Science'} • {authUser?.semester || '6th Semester'}</p>
        </div>
      </Card>
      <div className="profile-stats-grid">
        <StatCard title="Sessions" value="41" subtitle="This month" />
        <StatCard title="Saved Notes" value="18" subtitle="Across subjects" />
        <StatCard title="Mistakes Fixed" value="24" subtitle="Reviewed" />
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { materials, quizzes, subjects, analytics } = useApp()

  const data = [
    { name: 'Jan', students: 100 },
    { name: 'Feb', students: 110 },
    { name: 'Mar', students: 122 },
    { name: 'Apr', students: 128 },
  ]

  const materialPopularity = [
    { name: 'DBMS', value: 38 },
    { name: 'DSA', value: 28 },
    { name: 'Java', value: 26 },
    { name: 'OS', value: 18 },
  ]

  return (
    <div className="stacked-page">
      <SectionHeading icon={LayoutDashboard} title="Admin Dashboard" subtitle="Operations overview" />
      <div className="stats-grid admin-grid">
        <StatCard title="Total Students" value={analytics.length || '—'} subtitle="Active learners" accent="primary" />
        <StatCard title="Study Materials" value={materials.length} subtitle="Across all subjects" accent="green" />
        <StatCard title="Quizzes" value={quizzes.length} subtitle="Published tests" accent="purple" />
        <StatCard title="Subjects" value={subjects.length} subtitle="Academic domains" accent="orange" />
        <StatCard title="Quiz Attempts" value={analytics.reduce((sum, student) => sum + (student.quizAttempts || 0), 0)} subtitle="Total assessments" accent="teal" />
      </div>

      <div className="two-col-grid">
        <Card className="panel-card">
          <h3>Student Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="panel-card">
          <h3>Popular Materials</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={materialPopularity} dataKey="value" nameKey="name" outerRadius={70}>
                {materialPopularity.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="panel-card">
        <h3>Recent Activity</h3>
        <table className="data-table">
          <thead>
            <tr><th>Student</th><th>Action</th><th>Time</th><th>Outcome</th></tr>
          </thead>
          <tbody>
            <tr><td>Jash</td><td>Completed DBMS Quiz</td><td>14 mins ago</td><td>82%</td></tr>
            <tr><td>Priya</td><td>Bookmarked OS notes</td><td>27 mins ago</td><td>Saved</td></tr>
            <tr><td>Arun</td><td>Reviewed Java flashcards</td><td>1 hr ago</td><td>Mastered</td></tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function ManageMaterialsPage() {
  const { materials, subjects, addMaterial, updateMaterial, deleteMaterial } = useApp()
  const [form, setForm] = useState({ title: '', description: '', subject: 'DBMS', topic: '', semester: '4', resourceType: 'Notes', difficulty: 'Intermediate', fileUrl: '' })
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(false)

  const resetForm = () => {
    setEditingId(null)
    setForm({ title: '', description: '', subject: 'DBMS', topic: '', semester: '4', resourceType: 'Notes', difficulty: 'Intermediate', fileUrl: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const saved = editingId ? await updateMaterial(editingId, form) : await addMaterial(form)
    if (!saved) return
    setToast(true)
    resetForm()
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <div className="stacked-page">
      <SectionHeading icon={BookOpen} title="Manage Materials" subtitle="Upload and track academic resources" />
      <Card className="panel-card">
        <form className="planner-form" onSubmit={handleSubmit}>
          <label><span>Title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label><span>Description</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
          <div className="two-col-row">
            <label><span>Subject</span><select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>{subjects.map((subject) => <option key={subject.id || subject.name} value={subject.name}>{subject.name}</option>)}</select></label>
            <label><span>Topic</span><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required /></label>
          </div>
          <div className="two-col-row">
            <label><span>Semester</span><input type="number" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></label>
            <label><span>Type</span><select value={form.resourceType} onChange={(e) => setForm({ ...form, resourceType: e.target.value })}><option>Notes</option><option>PDF</option><option>Video</option><option>Question Bank</option><option>Previous Year Paper</option></select></label>
            <label><span>Difficulty</span><select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          </div>
          <label><span>File URL</span><input type="url" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /></label>
          <div className="recommendation-row"><Button type="submit">{editingId ? 'Save Changes' : 'Add Material'}</Button>{editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}</div>
        </form>
      </Card>
      <Card className="panel-card">
        <h3>Study Materials</h3>
        <div className="stack-list compact">
          {materials.map((material) => <div className="learning-row" key={material.id}>
            <div><h4>{material.title}</h4><small>{material.subject} · {material.topic}</small></div>
            <div className="recommendation-row">
              <Button variant="secondary" onClick={() => { setEditingId(material.id); setForm({ ...material, subject: material.subject, semester: material.semester || '', fileUrl: material.fileUrl || '' }) }}>Edit</Button>
              <Button variant="ghost" onClick={async () => { if (window.confirm(`Delete ${material.title}?`)) await deleteMaterial(material.id) }}>Delete</Button>
            </div>
          </div>)}
        </div>
      </Card>
      <Toast message="Material added successfully." visible={toast} tone="success" />
    </div>
  )
}

export function ManageSubjectsPage() {
  const { subjects, createSubject, updateSubject, deleteSubject } = useApp()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const saved = editingId
      ? await updateSubject(editingId, { name, description })
      : await createSubject({ name, description })
    if (saved) resetForm()
    setSaving(false)
  }

  return <div className="stacked-page">
    <SectionHeading icon={BookOpen} title="Manage Subjects" subtitle="Maintain the academic catalog" />
    <Card className="panel-card"><form className="planner-form" onSubmit={handleSubmit}>
      <label><span>Subject name</span><input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} /></label>
      <label><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <div className="recommendation-row"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Subject'}</Button>{editingId && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}</div>
    </form></Card>
    <Card className="panel-card"><div className="stack-list compact">{subjects.map((subject) => <div className="learning-row" key={subject.id || subject.name}>
      <div><h4>{subject.name}</h4><small>{subject.description}</small></div>
      {subject.id && <div className="recommendation-row"><Button variant="secondary" onClick={() => { setEditingId(subject.id); setName(subject.name); setDescription(subject.description || '') }}>Edit</Button><Button variant="ghost" onClick={async () => { if (window.confirm(`Delete ${subject.name}?`)) await deleteSubject(subject.id) }}>Delete</Button></div>}
    </div>)}</div></Card>
  </div>
}

export function ManageQuizzesPage() {
  const { quizzes, subjects, addQuiz, updateQuiz, deleteQuiz, getAdminQuizQuestions } = useApp()
  const newQuestion = () => ({ prompt: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', topic: '' })
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', questions: [newQuestion()] })

  const resetForm = () => {
    setEditingId(null)
    setForm({ title: '', description: '', subjectId: subjects[0]?.id || '', questions: [newQuestion()] })
    setShowForm(false)
  }

  const editQuiz = async (quiz) => {
    const questions = await getAdminQuizQuestions(quiz.id)
    if (!questions) return
    setEditingId(quiz.id)
    setForm({
      title: quiz.title,
      description: quiz.description || '',
      subjectId: quiz.subjectId,
      questions: questions.map((question) => ({
        prompt: question.prompt,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: question.correctOption,
        topic: question.topic,
        points: question.points,
      })),
    })
    setShowForm(true)
  }

  const updateQuestion = (index, field, value) => setForm((current) => ({
    ...current,
    questions: current.questions.map((question, questionIndex) => questionIndex === index ? { ...question, [field]: value } : question),
  }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = { ...form, subjectId: Number(form.subjectId) }
    const saved = editingId ? await updateQuiz(editingId, payload) : await addQuiz(payload)
    if (saved) resetForm()
    setSaving(false)
  }

  return (
    <div className="stacked-page">
      <SectionHeading icon={CopyCheck} title="Manage Quizzes" subtitle="Create and monitor assessments" />
      {showForm && <Card className="panel-card"><form className="planner-form" onSubmit={handleSubmit}>
        <label><span>Quiz title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
        <label><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <label><span>Subject</span><select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} required>{subjects.filter((subject) => subject.id).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
        {form.questions.map((question, index) => <div className="panel-card" key={index}>
          <h4>Question {index + 1}</h4>
          <label><span>Prompt</span><textarea value={question.prompt} onChange={(event) => updateQuestion(index, 'prompt', event.target.value)} required /></label>
          <div className="two-col-row">{['A', 'B', 'C', 'D'].map((letter) => <label key={letter}><span>Option {letter}</span><input value={question[`option${letter}`]} onChange={(event) => updateQuestion(index, `option${letter}`, event.target.value)} required /></label>)}</div>
          <div className="two-col-row">
            <label><span>Correct option</span><select value={question.correctOption} onChange={(event) => updateQuestion(index, 'correctOption', event.target.value)}><option>A</option><option>B</option><option>C</option><option>D</option></select></label>
            <label><span>Topic</span><input value={question.topic} onChange={(event) => updateQuestion(index, 'topic', event.target.value)} required /></label>
          </div>
          {form.questions.length > 1 && <Button type="button" variant="ghost" onClick={() => setForm((current) => ({ ...current, questions: current.questions.filter((_, questionIndex) => questionIndex !== index) }))}>Remove question</Button>}
        </div>)}
        <div className="recommendation-row">
          <Button type="button" variant="secondary" onClick={() => setForm((current) => ({ ...current, questions: [...current.questions, newQuestion()] }))}>Add Question</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Quiz'}</Button>
          <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
        </div>
      </form></Card>}
      <Card className="panel-card">
        <table className="data-table">
          <thead><tr><th>Quiz</th><th>Subject</th><th>Questions</th><th>Duration</th><th>Attempts</th><th>Actions</th></tr></thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id}><td>{quiz.title}</td><td>{quiz.subject}</td><td>{quiz.questionCount ?? quiz.questions.length}</td><td>{quiz.duration} min</td><td>{quiz.attempts || '—'}</td><td><button type="button" className="table-button" onClick={() => editQuiz(quiz)}>Edit</button> <button type="button" className="table-button danger" onClick={async () => { if (window.confirm(`Delete ${quiz.title}?`)) await deleteQuiz(quiz.id) }}>Delete</button></td></tr>
            ))}
          </tbody>
        </table>
        <div className="margin-top"><Button onClick={() => { setEditingId(null); setForm({ title: '', description: '', subjectId: subjects.find((subject) => subject.id)?.id || '', questions: [newQuestion()] }); setShowForm(true) }}>Create</Button></div>
      </Card>
    </div>
  )
}

export function ProtectedRoute({ children, adminOnly = false }) {
  const { authUser } = useApp()

  if (!authUser) return <Navigate to="/login" replace />
  if (adminOnly && authUser.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}
