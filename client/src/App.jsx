import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ScenePage from './pages/ScenePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CommunityPage from './pages/CommunityPage';
import CreditsPage from './pages/CreditsPage';
import StorePage from './pages/StorePage';

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
          
          {/* Credits Route */}
          <Route path="/credits" element={<CreditsPage />} />

          {/* Store Route */}
          <Route path="/store" element={<StorePage />} />

        </Routes>
      </div>
    </Router>
  );
}