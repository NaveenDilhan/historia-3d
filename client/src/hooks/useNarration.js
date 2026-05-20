import { useState, useRef } from 'react'
import axios from 'axios'

export default function useNarration() {
  const [narration, setNarration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Use a ref to keep track of the currently playing audio instance
  const audioRef = useRef(null)

  const getNarration = async ({ userAction, context, era }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post('/api/narration', {
        userAction,
        context,
        era
      })

      // Extract text and our new audio data
      const { narration: textContent, audioData } = response.data;
      
      setNarration(textContent || '')

      // If there is audio currently playing, stop it so voices don't overlap
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // If we received ElevenLabs audio, play it
      if (audioData) {
        // Construct a data URI for the audio
        const audioSrc = `data:audio/mpeg;base64,${audioData}`
        const audio = new Audio(audioSrc)
        
        audioRef.current = audio
        audio.play().catch(e => console.error("Audio playback prevented by browser:", e))
      }

    } catch (err) {
      console.error('Failed to fetch narration:', err)
      setError('Failed to fetch narration.')
    } finally {
      setLoading(false)
    }
  }

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  return { narration, loading, error, getNarration, stopNarration }
}