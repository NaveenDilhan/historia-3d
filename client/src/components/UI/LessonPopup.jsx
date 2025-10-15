import React from 'react'

export default function LessonPopup({ lesson, onClose, onPlay }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-4">{lesson.title}</h2>
        <p className="mb-4 text-gray-600">{lesson.description}</p>

        <div className="mb-6">
          <p className="text-gray-800 mb-2">Progress: {lesson.progress}%</p>
          <p className="text-gray-800">Achievements: {lesson.achievements}</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
          >
            Close
          </button>
          <button
            onClick={onPlay}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  )
}
