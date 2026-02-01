import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Existing Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ScenePage from './pages/ScenePage';

// New Auth & Profile Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <Router>
      <div className="app-shell bg-[#2a1b12]"> {/* Matches your ancient-wall-bg base color */}
        <Routes>
          {/* Main Content Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/scene" element={<ScenePage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Routes */}
          <Route path="/profile" element={<div className="text-amber-50 p-20">Profile Page (Coming Soon)</div>} />
          
          {/* Optional: Community Route mentioned in your Nav */}
          <Route path="/community" element={<div className="text-amber-50 p-20">Community Forum (Coming Soon)</div>} />
        </Routes>
      </div>
    </Router>
  );
}