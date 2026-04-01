import { PromptTemplate } from "@langchain/core/prompts";
import * as dotenv from "dotenv";

// @ts-ignore - Forcing TS to ignore the module resolution warning
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

dotenv.config();

// Initialize the Gemini LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", // Fast and great for text rewriting
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY as string, // "as string" fixes the strict type error
});

const rewritePrompt = PromptTemplate.fromTemplate(`
You are an expert cold email copywriter. Your goal is to rewrite a base email template so that it is highly personalized for the recipient, while keeping the core marketing offer exactly the same. 

This is crucial: The rewritten email MUST sound completely natural and human. Do not use overly formal or robotic language.

Recipient Name: {recipientName}
Recipient Company/Context: {companyContext}
Sender Name: {senderName}

Base Marketing Pitch to convey:
"{basePitch}"

Instructions:
1. Write a unique, personalized opening line referencing their company or context.
2. Weave the core marketing pitch naturally into the email.
3. Change the sentence structures and swap synonyms so the text is unique compared to the base pitch.
4. Keep it concise (under 4-5 sentences).
5. Sign off professionally using the Sender Name.

Output ONLY the final email text. No pleasantries, no markdown blocks.
`);

export const personalizeEmail = async (
  recipientName: string,
  companyContext: string,
  basePitch: string,
  senderName: string = "Ravi Kumar Keshari"
): Promise<string> => {
  try {
    const chain = rewritePrompt.pipe(llm);
    
    const response = await chain.invoke({
      recipientName,
      companyContext,
      basePitch,
      senderName
    });

    return response.content as string;
  } catch (error) {
    console.error(`[Researcher] Failed to personalize email for ${recipientName}:`, error);
    throw error;
  }
};