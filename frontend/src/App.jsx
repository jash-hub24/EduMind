import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import { AppProvider } from './context/AppContext'
import {
  AIChatPage,
  AdminDashboardPage,
  BookmarksPage,
  DashboardPage,
  FlashcardsPage,
  LoginPage,
  ManageMaterialsPage,
  ManageQuizzesPage,
  ManageSubjectsPage,
  MaterialDetailsPage,
  MaterialsPage,
  PlannerPage,
  ProgressPage,
  ProfilePage,
  ProtectedRoute,
  PYQPage,
  QuestionBankPage,
  QuizListPage,
  QuizPage,
  QuizResultPage,
  RegisterPage,
  RevisionPage,
  ScanSolvePage,
} from './pages/Pages'

function StudentShell({ children }) {
  return <ProtectedRoute>{<AppLayout>{children}</AppLayout>}</ProtectedRoute>
}

function AdminShell({ children }) {
  return <ProtectedRoute adminOnly>{<AppLayout>{children}</AppLayout>}</ProtectedRoute>
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<StudentShell><DashboardPage /></StudentShell>} />
          <Route path="/materials" element={<StudentShell><MaterialsPage /></StudentShell>} />
          <Route path="/materials/:id" element={<StudentShell><MaterialDetailsPage /></StudentShell>} />
          <Route path="/question-bank" element={<StudentShell><QuestionBankPage /></StudentShell>} />
          <Route path="/pyq" element={<StudentShell><PYQPage /></StudentShell>} />
          <Route path="/quizzes" element={<StudentShell><QuizListPage /></StudentShell>} />
          <Route path="/quiz/:quizId" element={<StudentShell><QuizPage /></StudentShell>} />
          <Route path="/quiz-result" element={<StudentShell><QuizResultPage /></StudentShell>} />
          <Route path="/ai-chat" element={<StudentShell><AIChatPage /></StudentShell>} />
          <Route path="/scan-solve" element={<StudentShell><ScanSolvePage /></StudentShell>} />
          <Route path="/flashcards" element={<StudentShell><FlashcardsPage /></StudentShell>} />
          <Route path="/bookmarks" element={<StudentShell><BookmarksPage /></StudentShell>} />
          <Route path="/planner" element={<StudentShell><PlannerPage /></StudentShell>} />
          <Route path="/revision" element={<StudentShell><RevisionPage /></StudentShell>} />
          <Route path="/progress" element={<StudentShell><ProgressPage /></StudentShell>} />
          <Route path="/profile" element={<StudentShell><ProfilePage /></StudentShell>} />
          <Route path="/settings" element={<StudentShell><ProfilePage /></StudentShell>} />
          <Route path="/admin" element={<AdminShell><AdminDashboardPage /></AdminShell>} />
          <Route path="/admin/materials" element={<AdminShell><ManageMaterialsPage /></AdminShell>} />
          <Route path="/admin/subjects" element={<AdminShell><ManageSubjectsPage /></AdminShell>} />
          <Route path="/admin/quizzes" element={<AdminShell><ManageQuizzesPage /></AdminShell>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
