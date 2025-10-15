import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LessonPopup from '../components/UI/LessonPopup'

export default function ExplorePage() {
  const [selectedLesson, setSelectedLesson] = useState(null)
  const navigate = useNavigate()

  const lessons = [
    {
      id: 1,
      title: 'Prehistoric Lessons',
      description: 'Travel back to the ancient world and witness life among dinosaurs.',
      progress: 65,
      achievements: 4,
    },
    // Add more lessons here later
  ]

  return (
    <div className="explore-page min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center mb-10">Explore Lessons</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            onClick={() => setSelectedLesson(lesson)}
            className="cursor-pointer bg-white shadow-lg rounded-2xl p-6 hover:shadow-2xl transition"
          >
            <h2 className="text-2xl font-semibold mb-3">{lesson.title}</h2>
            <p className="text-gray-600 mb-4">{lesson.description}</p>
            <div className="bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${lesson.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">Progress: {lesson.progress}%</p>
          </div>
        ))}
      </div>

      {selectedLesson && (
        <LessonPopup
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onPlay={() => {
            setSelectedLesson(null)
            navigate('/scene')
          }}
        />
      )}
    </div>
  )
}
