import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Eagerly load the landing page (first paint)
import Landing from './pages/Landing';

// Lazy-load all other pages to reduce initial bundle size
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const KnowYourKanoon = lazy(() => import('./pages/KnowYourKanoon'));
const UploadChat = lazy(() => import('./pages/UploadChat'));
const DocHub = lazy(() => import('./pages/DocHub'));
const LegalReasoning = lazy(() => import('./pages/LegalReasoning'));
const CivicNavigator = lazy(() => import('./pages/CivicNavigator'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#1A1814', fontFamily: 'sans-serif' }}>Loading…</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/know-your-kanoon"
              element={
                <ProtectedRoute>
                  <KnowYourKanoon />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-chat"
              element={
                <ProtectedRoute>
                  <UploadChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dochub"
              element={
                <ProtectedRoute>
                  <DocHub />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reasoning"
              element={
                <ProtectedRoute>
                  <LegalReasoning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/civic"
              element={
                <ProtectedRoute>
                  <CivicNavigator />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;

