import { openai } from '../utils/openaiClient.js'


export const getNarration = async (req, res) => {
try {
const { userAction, context } = req.body || {}


const system = `You are an immersive narrator for a prehistoric 3D experience. Keep the text short (1-3 sentences), vivid, and accessible.`
const userPrompt = `User action: "${userAction || 'nothing specified'}"\nContext: ${context || 'The player is exploring a prehistoric forest.'}`


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
console.error('OpenAI error', err)
res.status(500).json({ error: 'Failed to generate narration' })
}
}