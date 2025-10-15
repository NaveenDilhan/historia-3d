import { useState } from 'react'


export default function useAI() {
const [narration, setNarration] = useState('')
const [loading, setLoading] = useState(false)


async function getNarration(userAction, context = '') {
try {
setLoading(true)
const res = await fetch('http://localhost:5000/api/narration', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ userAction, context }),
})
const data = await res.json()
setNarration(data.narration || '')
} catch (err) {
console.error('AI call failed', err)
setNarration('The narrator is quiet right now...')
} finally {
setLoading(false)
}
}


return { narration, getNarration, loading }
}