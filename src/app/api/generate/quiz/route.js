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
        const { sourceType, sourceValue } = body;

        if (!sourceType || !sourceValue) {
            return NextResponse.json({ message: 'sourceType and sourceValue are required' }, { status: 400 });
        }

        let contextText = '';

        if (sourceType === 'note') {
            const noteId = parseInt(sourceValue);
            const note = await prisma.note.findFirst({
                where: { id: noteId, userId: session.user.id },
            });
            if (!note) {
                return NextResponse.json({ message: 'Note not found or access denied' }, { status: 404 });
            }
            contextText = note.content;
        } else if (sourceType === 'topic') {
            contextText = sourceValue;
        } else {
            return NextResponse.json({ message: 'Invalid sourceType' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            Based on the following text, create a multiple-choice quiz with exactly 5 questions.
            For each question, provide 4 options (A, B, C, D) and specify the correct answer.
            Return the output as a single, valid JSON array inside a JSON code block.
            The JSON array should contain 5 objects, each representing a question.
            Each object must have the following properties: "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer" (where the value is just the letter, e.g., "A").

            Here is the text:
            ---
            ${contextText}
            ---
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonString = extractJson(responseText);
        const questions = JSON.parse(jsonString);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Generated content is not a valid array of questions.");
        }

        const newQuiz = await prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.create({
                data: {
                    userId: session.user.id,
                    sourceType,
                    sourceValue: sourceType === 'note' ? sourceValue : contextText.substring(0, 255),
                }
            });

            const questionData = questions.map(q => ({
                quizId: quiz.id,
                question: q.question,
                optionA: q.optionA,
                optionB: q.optionB,
                optionC: q.optionC,
                optionD: q.optionD,
                correctAnswer: q.correctAnswer.charAt(0).toUpperCase(),
            }));

            await tx.quizQuestion.createMany({
                data: questionData,
            });

            return quiz;
        });

        return NextResponse.json({ quizId: newQuiz.id }, { status: 201 });

    } catch (error) {
        console.error('Error generating quiz:', error);
        return NextResponse.json({ message: 'Error generating quiz. The AI may have returned an unexpected format.', details: error.message }, { status: 500 });
    }
}
