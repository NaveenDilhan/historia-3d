import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="homepage min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-200 to-blue-500 text-center p-6">
      <h1 className="text-5xl font-bold mb-6">Welcome to Historia</h1>
      <p className="text-lg mb-10 max-w-xl">
        Explore interactive lessons through immersive storytelling. Travel back to the Prehistoric Age and beyond.
      </p>
      <button
        onClick={() => navigate('/explore')}
        className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-100 transition"
      >
        Explore Lessons
      </button>
    </div>
  )
}
