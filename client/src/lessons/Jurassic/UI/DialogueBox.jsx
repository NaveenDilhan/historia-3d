import React from 'react'
import useAI from '../../../hooks/useAI'

export default function DialogueBox() {
  const { narration, loading } = useAI()

  return (
    <div className="dialogue-box">
      <div className="speaker">Narrator</div>
      <div className="text">
        {loading ? '...' : narration || 'Explore the world to hear the narrator.'}
      </div>
    </div>
  )
}
