import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Set a longer timeout for this API route
export const maxDuration = 60; // 60 seconds timeout instead of default 10s

// Add retry logic for OpenAI API calls
async function callOpenAIWithRetry(openai: OpenAI, messages: any[], maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use gpt-3.5-turbo instead of gpt-4 for faster response
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      });
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { businessName, businessDescription, targetAudience, businessValues } = await req.json();

    // Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create system prompt using the specific format requested
    const systemPrompt = `You are an expert brand consultant who creates brand voice guides for businesses.

Company overview:
When generating the company overview:
- use only the business information provided
- keep to 1 paragraph, max 30 words
- bold keywords and important parts using markdown (**keyword**)

Brand Voice:
Generate 3 brand voice elements.
Each element must:
- be a distinct personality type
- be 1-2 words
- include one sentence on how this relates to the business details
- use bullet points
- include what it means and doesn't mean
- include an example of a brand that does this well and brief explanation of how they do it
- NOT BE generic

Avoid brand voice pillars with these generic names:
- consistent
- innovative
- professional
- empathetic
- authentic
- friendly
- informative
- ethical
- sustainable
- engaging
- dynamic

End with a 'Summary' of how these 3 elements relate to the business details.

Format the output using markdown with clear headings and structure to enhance readability.`;

    // Create user prompt with business information
    const userPrompt = `Please create a brand voice guide for ${businessName}.

Business Description:
${businessDescription}

Target Audience:
${targetAudience}

Business Values:
${businessValues}

Follow the format exactly as described in the system instructions.`;

    // Call GPT-3.5-turbo with retry mechanism
    const completion = await callOpenAIWithRetry(
      openai,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    );

    // Extract generated brand voice
    const brandVoice = completion.choices[0].message.content;

    return NextResponse.json({ brandVoice });
  } catch (error) {
    console.error('Error generating brand voice:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 