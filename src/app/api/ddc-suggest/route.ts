import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { title, author, publisher } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in .env' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a professional librarian expert in the Dewey Decimal Classification (DDC) system.
Please provide the most likely 3-digit Dewey Decimal Classification (DDC) number for the following book.
Only return the DDC number itself (e.g., 800, 500, 954), with no other text, punctuation, or explanation.
If you are unsure, provide your best guess based on the title.

Book Details:
Title: ${title}
Author: ${author || 'Unknown'}
Publisher: ${publisher || 'Unknown'}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean up response to ensure only numbers (and possibly decimal like 891.4)
    const match = text.match(/^[0-9]+(\.[0-9]+)?/);
    const ddc = match ? match[0] : text;

    return NextResponse.json({ ddc });
  } catch (error: any) {
    console.error('Error fetching DDC suggestion:', error);
    
    // If it's a 404 model not found, let's fetch available models
    let availableModels = "";
    if (error.message && error.message.includes('404')) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        if (data && data.models) {
          const names = data.models
            .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m: any) => m.name.replace('models/', ''));
          availableModels = " Available models: " + names.join(", ");
        }
      } catch (e) {
        console.error("Could not fetch models list", e);
      }
    }

    return NextResponse.json({ error: (error.message || 'Internal Server Error') + availableModels }, { status: 500 });
  }
}
