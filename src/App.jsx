import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import CreatePostPage from './pages/CreatePostPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import MyPostsPage from './pages/MyPostsPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(0,0,255,0.3)',
              fontFamily: 'Space Mono, monospace',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#0000ff', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ff3333', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="post/:id" element={<PostDetailPage />} />
            <Route path="user/:username" element={<ProfilePage />} />
            <Route
              path="create"
              element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>}
            />
            <Route
              path="profile/edit"
              element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>}
            />
            <Route
              path="my-posts"
              element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>}
            />
            <Route
              path="my-applications"
              element={<ProtectedRoute><MyApplicationsPage /></ProtectedRoute>}
            />
          </Route>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
