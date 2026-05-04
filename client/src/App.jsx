import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Existing Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ScenePage from './pages/ScenePage';

// New Auth & Profile Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// New Community Page
import CommunityPage from './pages/CommunityPage';

export default function App() {
  return (
    <Router>
      <div className="app-shell bg-[#2a1b12]">
        <Routes>
          {/* Main Content Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/scene/:lessonId" element={<ScenePage />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Community Route */}
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </div>
    </Router>
  );
}