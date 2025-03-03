import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { initFirebaseAdmin } from '@/firebase/admin';
import { adminAuth, firestore } from '@/firebase/admin';
import { OpenAIError } from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { contentPrompt, contentType, wordCount, userId } = await req.json();
    
    // Check required parameters
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Fetch brand information from Firestore using admin SDK
    const brandInfoDoc = await firestore.collection('brandInformation').doc(userId).get();
    
    if (!brandInfoDoc.exists) {
      return NextResponse.json({ error: "Brand information not found. Please complete onboarding first." }, { status: 404 });
    }
    
    const brandInfo = brandInfoDoc.data();
    
    // Construct the system prompt for content generation
    const systemPrompt = `You are an expert content creator specializing in ${contentType} content. You'll be generating content that matches the brand voice of ${brandInfo.businessName}.

Here's the brand voice guide to follow:
- Target audience: ${brandInfo.targetAudience}
- Brand personality: ${brandInfo.brandVoice}
- Business values: ${brandInfo.businessValues}
- Business description: ${brandInfo.businessDescription}

Keep your content around ${wordCount} words. Create engaging, high-quality content that's relevant to the prompt.`;

    // Construct the user prompt based on content type
    let userPrompt = `Create a ${contentType} about: ${contentPrompt}. The content should be approximately ${wordCount} words.`;
    
    // Prepare for API call to OpenAI
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Make API call to OpenAI
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 2000
    });

    // Extract the generated content from the API response
    const generatedContent = completion.choices[0].message.content;

    // Return the generated content to the client
    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof OpenAIError) {
      return NextResponse.json({ error: `OpenAI API error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 