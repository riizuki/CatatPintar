import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function removeMarkdown(text) {
  text = text.replace(/###\s?/g, '');
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');  
  text = text.replace(/-\s/g, '');
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '$1')
  return text.trim();
}

export async function POST(req) {
  try {
    const { searchTerm, context } = await req.json();

    if (!searchTerm) {
      return NextResponse.json({ message: 'Search term is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    const prompt = `
      You are an intelligent assistant integrated into a note-taking application.
      A user has highlighted a term and wants to understand it better.

      Note Context: "${context || 'No additional context provided.'}"
      Term to Explain: "${searchTerm}"

      Please provide a clear, concise, and easy-to-understand explanation for the term.
      Structure your response in Bahasa Indonesia.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = removeMarkdown(text);

    return NextResponse.json({ explanation: text });

  } catch (error) {
    console.error('Error in AI chat generation:', error);
    return NextResponse.json({ message: 'Failed to get explanation from AI.' }, { status: 500 });
  }
}
