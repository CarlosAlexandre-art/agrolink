import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function chatGroq(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 800
) {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'system', content: system }, ...messages],
  })
  return completion.choices[0].message.content ?? ''
}
