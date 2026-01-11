import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to extract JSON from the AI's response
function extractJson(text) {
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (!jsonMatch) {
        throw new Error("No JSON code block found in the AI response.");
    }
    return jsonMatch[1];
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { noteId } = body;

        if (!noteId) {
            return NextResponse.json({ message: 'noteId is required' }, { status: 400 });
        }

        const note = await prisma.note.findFirst({
            where: { id: parseInt(noteId), userId: session.user.id },
        });

        if (!note) {
            return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
        }
        
        // Check if flashcards already exist for this note to prevent duplicates
        const existingFlashcards = await prisma.flashcard.count({
            where: { noteId: parseInt(noteId) }
        });

        if (existingFlashcards > 0) {
            return NextResponse.json({ message: 'Flashcards already exist for this note.' }, { status: 409 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
            Based on the following note content, generate a set of flashcards. Each flashcard should have a "front" (a key term or question) and a "back" (the definition or answer).
            Generate between 5 and 10 flashcards.
            Return the output as a single, valid JSON array inside a JSON code block.
            Each object in the array must have two properties: "front" and "back".

            Here is the note content:
            ---
            ${note.content}
            ---
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = extractJson(responseText);
        const flashcardSet = JSON.parse(jsonString);

        if (!Array.isArray(flashcardSet) || flashcardSet.length === 0) {
            throw new Error("Generated content is not a valid array of flashcards.");
        }

        const flashcardData = flashcardSet.map(fc => ({
            noteId: parseInt(noteId),
            userId: session.user.id,
            frontText: fc.front,
            backText: fc.back,
        }));

        await prisma.flashcard.createMany({
            data: flashcardData,
        });

        return NextResponse.json(flashcardData, { status: 201 });

    } catch (error) {
        console.error('Error generating flashcards:', error);
        return NextResponse.json({ message: 'Error generating flashcards.', details: error.message }, { status: 500 });
    }
}
