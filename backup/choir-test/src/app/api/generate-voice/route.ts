import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Call GPT-4 to generate brand voice
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

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