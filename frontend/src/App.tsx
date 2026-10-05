import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { ProtectedRoute } from './components/layout/ProtectedRoute.js';

import { Home } from './pages/Home.js';
import { Explore } from './pages/Explore.js';
import { SkillDetail } from './pages/SkillDetail.js';
import { ShareSkill } from './pages/ShareSkill.js';
import { EditSkill } from './pages/EditSkill.js';
import { MySkills } from './pages/MySkills.js';
import { SkillMatchPage } from './pages/SkillMatch.js';
import { MessagesPage } from './pages/Messages.js';
import { ProfilePage } from './pages/Profile.js';
import { CommunityGuidelines } from './pages/CommunityGuidelines.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col justify-between bg-[#faf8f5]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/skills/:id" element={<SkillDetail />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/guidelines" element={<CommunityGuidelines />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/share"
                  element={
                    <ProtectedRoute>
                      <ShareSkill />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skills/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditSkill />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-skills"
                  element={
                    <ProtectedRoute>
                      <MySkills />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/match"
                  element={
                    <ProtectedRoute>
                      <SkillMatchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
