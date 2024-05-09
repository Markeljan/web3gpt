import OpenAI from "openai"

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID as string
