import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import ScenePage from './pages/ScenePage'

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/scene" element={<ScenePage />} />
        </Routes>
      </div>
    </Router>
  )
}
