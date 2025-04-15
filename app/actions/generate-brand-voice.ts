"use server"

import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

type BrandVoiceData = {
  businessName: string
  yearFounded: string
  businessDescription: string
  selectedDemographics?: string[]
  businessValues: string[]
  additionalInfo?: string
}

export async function generateBrandVoice(
  data: BrandVoiceData,
): Promise<{ success: boolean; data?: any; error?: string; warning?: string }> {
  try {
    const demographics = Array.isArray(data.selectedDemographics)
      ? data.selectedDemographics.join(", ")
      : "Not specified"
    const businessValues = Array.isArray(data.businessValues)
      ? data.businessValues.join(", ")
      : data.businessValues || "Not specified"

    const prompt = `
Generate a brand voice for ${data.businessName}.

Business Context:
- Description: ${data.businessDescription}
- Target Demographics: ${demographics}
- Core Values: ${businessValues}
- Year Founded: ${data.yearFounded}
- Additional Info: ${data.additionalInfo || "None provided"}

Create a brand voice with:
1. An executive summary (1-2 sentences)
2. Three brand voice pillars, each with:
  - A SINGLE WORD adjective title
  - 3 "What it means" guidelines
  - 3 "What it doesn't mean" guidelines
  - A brand inspiration example

Format as JSON:
{
 "executiveSummary": "Summary text",
 "pillars": [
   {
     "id": "pillar-1",
     "title": "PillarName",
     "means": ["What it means 1", "What it means 2", "What it means 3"],
     "doesntMean": ["What it doesn't mean 1", "What it doesn't mean 2", "What it doesn't mean 3"],
     "inspiration": "Brand Example – Brief explanation"
   }
 ]
}

Return ONLY the JSON object without any markdown formatting or additional text.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 1500,
      temperature: 0.7,
    })

    // Clean the response to remove any markdown formatting
    const cleanedText = cleanJsonResponse(text)

    try {
      const brandVoice = JSON.parse(cleanedText)
      return { success: true, data: brandVoice }
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      console.error("Raw text:", text)
      console.error("Cleaned text:", cleanedText)
      return { success: false, error: "Failed to parse generated content. Please try again." }
    }
  } catch (error) {
    console.error("Error generating brand voice:", error)
    return { success: false, error: "Failed to generate brand voice. Please try again." }
  }
}

export async function regeneratePillar(
  data: any,
  pillarIndex: number,
  existingPillars: any[],
): Promise<{ success: boolean; data?: any; error?: string; warning?: string }> {
  try {
    const demographics = Array.isArray(data.selectedDemographics)
      ? data.selectedDemographics.join(", ")
      : "Not specified"
    const businessValues = Array.isArray(data.businessValues)
      ? data.businessValues.join(", ")
      : data.businessValues || "Not specified"

    const otherPillars = existingPillars
      .filter((_: any, index: number) => index !== pillarIndex)
      .map((pillar: any) => pillar.title)
      .join(", ")

    const prompt = `
Generate a new brand voice pillar for ${data.businessName}, founded in ${data.yearFounded}.

Context:
Business Description: ${data.businessDescription}
Target Demographics: ${demographics}
Core Values: ${businessValues}
Additional Info: ${data.additionalInfo || "None provided"}
Existing Pillars: ${otherPillars}

First, analyze what would complement the existing voice pillars:
1. What communication style would work well with the existing pillars?
2. What emotional response or perception would enhance the overall brand voice?

IMPORTANT GUIDELINES FOR THE NEW PILLAR:
- The pillar MUST be a SINGLE WORD adjective
- Choose a pillar that complements the existing pillars: ${otherPillars}
- The pillar should be practical and immediately applicable to content creation
- The new pillar MUST be different from the one being replaced: ${existingPillars[pillarIndex].title}
- Avoid generic, overused terms like: Consistent, Innovative, Professional, Empathetic, Authentic, Friendly, Informative, Ethical, Sustainable, Engaging, Dynamic, Trustworthy, Customer-centric, Reliable, Effective, Insightful, Quality-driven, Strategic, Visionary

For the pillar:
1. Use a SINGLE WORD adjective as the title
2. Provide 3 specific "What it means" guidelines that show exactly how to implement this pillar in content
3. List 3 "What it doesn't mean" pitfalls to avoid when applying this pillar
4. Give 1 relevant brand inspiration example with a brief explanation of how they excel at this aspect and how it relates to ${data.businessName}'s context

Format the response as a structured JSON object with this structure:
{
"id": "pillar-id",
"title": "SingleWordAdjective",
"means": ["Specific guideline 1", "Specific guideline 2", "Specific guideline 3"],
"doesntMean": ["Specific pitfall 1", "Specific pitfall 2", "Specific pitfall 3"],
"inspiration": "Brand Example – With brief explanation of how they excel at this aspect and how it relates to ${data.businessName}"
}

IMPORTANT: 
- The pillar MUST be a SINGLE WORD adjective
- The pillar should complement the existing pillars
- The pillar must be immediately useful and easy to apply to content creation
- Return ONLY the JSON object without any markdown formatting or additional text`

    console.log("Sending prompt for pillar regeneration:", prompt)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    })

    console.log("Raw response from API:", text)

    // Clean the response to remove any markdown formatting
    const cleanedText = cleanJsonResponse(text)
    console.log("Cleaned response:", cleanedText)

    try {
      const pillarData = JSON.parse(cleanedText)
      return { success: true, data: pillarData }
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      console.error("Raw text:", text)
      console.error("Cleaned text:", cleanedText)
      return {
        success: false,
        error: "Failed to parse generated content. Please try again.",
        warning: "The AI returned an invalid format. Please try regenerating the pillar.",
      }
    }
  } catch (error) {
    console.error("Error generating brand voice:", error)
    return { success: false, error: "Failed to generate brand voice. Please try again." }
  }
}

// Helper function to clean JSON response from markdown formatting
function cleanJsonResponse(text: string): string {
  // Remove markdown code block formatting if present
  let cleaned = text.trim()

  // Remove ```json or ``` at the beginning
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7).trim()
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3).trim()
  }

  // Remove ``` at the end
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3).trim()
  }

  return cleaned
}

export async function startBrandVoiceGeneration(
  data: any,
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // Simulate starting a background job
    const jobId = `job_${Date.now()}`
    // In a real implementation, you would enqueue a job to a queue
    // and return the job ID.
    return { success: true, jobId }
  } catch (error) {
    console.error("Error starting brand voice generation:", error)
    return { success: false, error: "Failed to start brand voice generation." }
  }
}

export async function checkJobStatus(
  jobId: string,
): Promise<{ success: boolean; status?: string; result?: any; error?: string }> {
  try {
    // Simulate checking the status of a background job
    // In a real implementation, you would query a database or queue
    // to get the job status and result.
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate processing time

    // Simulate a successful job completion
    if (Math.random() > 0.2) {
      const mockBrandVoice = {
        executiveSummary: "Our brand voice is confident, innovative, and user-friendly.",
        pillars: [
          {
            id: "1",
            title: "Confidence",
            means: ["Assertive", "Knowledgeable", "Authoritative"],
            doesntMean: ["Arrogant", "Boastful", "Dismissive"],
            inspiration: "We speak with the assurance of an industry leader.",
          },
          {
            id: "2",
            title: "Innovation",
            means: ["Forward-thinking", "Creative", "Cutting-edge"],
            doesntMean: ["Reckless", "Untested", "Gimmicky"],
            inspiration: "We showcase our commitment to pushing boundaries and creating new solutions.",
          },
          {
            id: "3",
            title: "User-friendly",
            means: ["Approachable", "Clear", "Helpful"],
            doesntMean: ["Oversimplified", "Patronizing", "Vague"],
            inspiration: "We make complex concepts accessible and easy to understand for all users.",
          },
        ],
      }
      return { success: true, status: "completed", result: mockBrandVoice }
    } else {
      // Simulate a failed job
      return { success: true, status: "failed", error: "Failed to generate brand voice." }
    }
  } catch (error) {
    console.error("Error checking job status:", error)
    return { success: false, error: "Failed to check job status." }
  }
}
