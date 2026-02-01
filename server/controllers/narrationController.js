import { openai } from '../utils/openaiClient.js'

export const getNarration = async (req, res) => {
  try {
    const { userAction, context, era } = req.body || {}

    const system = `
You are an engaging and knowledgeable narrator for an interactive 3D history learning platform.
Your job is to describe scenes and actions from any historical era in a short, immersive, and educational way.
Keep it concise (1–3 sentences), vivid, and age-appropriate for general audiences.
Adjust your tone and vocabulary depending on the historical context.
`

    const userPrompt = `
User action: "${userAction || 'nothing specified'}"
Era: "${era || 'Unspecified era'}"
Context: ${context || 'The player is exploring a historical environment.'}

Generate a brief narration that fits the situation and era.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 120
    })

    const narration = response.choices?.[0]?.message?.content?.trim() || ''
    res.json({ narration })
  } catch (err) {
    console.error('OpenAI error:', err)
    res.status(500).json({ error: 'Failed to generate narration' })
  }
}
