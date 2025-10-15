import React from 'react'
import useAI from '../../hooks/useAI'


export default function DialogueBox() {
const { narration, loading } = useAI()


return (
<div className="dialogue-box">
<div style={{ fontWeight: 700, marginBottom: 6 }}>Narrator</div>
<div style={{ minHeight: 48 }}>{loading ? '...' : narration || 'Explore the world to hear the narrator.'}</div>
</div>
)
}