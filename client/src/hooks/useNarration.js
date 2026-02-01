import { useState } from 'react'
import axios from 'axios'

export default function useNarration() {
  const [narration, setNarration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getNarration = async ({ userAction, context, era }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post('/api/narration', {
        userAction,
        context,
        era
      })

      setNarration(response.data.narration || '')
    } catch (err) {
      console.error('Failed to fetch narration:', err)
      setError('Failed to fetch narration.')
    } finally {
      setLoading(false)
    }
  }

  return { narration, loading, error, getNarration }
}
