import OpenAI from "openai"

// Create a single instance of the OpenAI client to be used throughout the application
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export { openai }
