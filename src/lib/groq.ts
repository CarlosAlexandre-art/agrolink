import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
const NIM_URL   = 'https://integrate.api.nvidia.com/v1/chat/completions'
const NIM_MODEL = 'meta/llama-3.3-70b-instruct'

type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string }

export async function chatGroq(
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  maxTokens = 800
): Promise<string> {
  const allMessages: ChatMsg[] = [{ role: 'system', content: system }, ...messages]

  if (process.env.NVIDIA_API_KEY) {
    const res = await fetch(NIM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({ model: NIM_MODEL, messages: allMessages, temperature: 0.7, max_tokens: maxTokens }),
    })
    if (!res.ok) throw new Error(`NIM ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.choices[0].message.content as string
  }

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    messages: allMessages,
  })
  return completion.choices[0].message.content ?? ''
}
