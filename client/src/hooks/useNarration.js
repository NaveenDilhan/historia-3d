import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

export default function useNarration() {
  const [narration, setNarration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const audioRef = useRef(null)

  useEffect(() => {
    const handlePauseToggle = (e) => {
      const shouldPause = e.detail;
      if (audioRef.current) {
        if (shouldPause) {
          audioRef.current.pause();
        } else {
          if (audioRef.current.currentTime > 0 && !audioRef.current.ended) {
            audioRef.current.play().catch(err => console.error(err));
          }
        }
      }
    };

    const handleStop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    // Ensure mute happens instantly
    const handleMuteToggle = (e) => {
      const isMuted = e.detail;
      if (audioRef.current) {
        audioRef.current.muted = isMuted;
      }
    };

    window.addEventListener('narration-pause', handlePauseToggle);
    window.addEventListener('narration-stop', handleStop);
    window.addEventListener('sound-mute-toggled', handleMuteToggle);

    return () => {
      window.removeEventListener('narration-pause', handlePauseToggle);
      window.removeEventListener('narration-stop', handleStop);
      window.removeEventListener('sound-mute-toggled', handleMuteToggle);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const getNarration = async ({ userAction, context, era }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post('/api/narration', { userAction, context, era })
      const { narration: textContent, audioData } = response.data;
      setNarration(textContent || '')

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      if (audioData) {
        const audioSrc = `data:audio/mpeg;base64,${audioData}`
        const audio = new Audio(audioSrc)
        
        // Grab current global mute state immediately
        audio.muted = !!window.__soundMuted;
        
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