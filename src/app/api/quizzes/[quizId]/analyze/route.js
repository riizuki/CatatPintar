import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    const { quizId } = params;

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userAnswers } = body;

        if (!userAnswers || !Array.isArray(userAnswers)) {
            return NextResponse.json({ message: 'Invalid user answers format.' }, { status: 400 });
        }

        const quiz = await prisma.quiz.findFirst({
            where: { id: parseInt(quizId), userId: session.user.id },
            include: { questions: true },
        });

        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found or access denied' }, { status: 404 });
        }

        const incorrectQuestions = [];
        const correctAnswersMap = new Map(quiz.questions.map(q => [q.id, q.correctAnswer]));
        const questionTextMap = new Map(quiz.questions.map(q => [q.id, q.question]));

        userAnswers.forEach(answer => {
            const correctAnswer = correctAnswersMap.get(answer.questionId);
            const questionText = questionTextMap.get(answer.questionId);

            if (correctAnswer && answer.selectedAnswer && correctAnswer.toUpperCase() !== answer.selectedAnswer.toUpperCase()) {
                incorrectQuestions.push({
                    question: questionText,
                    userAnswer: answer.selectedAnswer,
                    correctAnswer: correctAnswer,
                });
            }
        });

        if (incorrectQuestions.length === 0) {
            return NextResponse.json({ analysis: "Excellent! You answered all questions correctly. No specific weaknesses found for this quiz." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
            Analyze the user's performance in a quiz based on the following incorrect answers.
            For each incorrect question, identify the core concept the user might be struggling with.
            Then, provide constructive feedback and suggest specific topics or areas for improvement.
            The analysis should be presented in a friendly, encouraging, elegant, and modern tone, in Bahasa Indonesia.
            Focus on helping the user understand their weaknesses without demotivating them.

            Incorrect Questions:
            ${incorrectQuestions.map((item, index) =>
                `${index + 1}. Question: "${item.question}"
   Your Answer: "${item.userAnswer}"
   Correct Answer: "${item.correctAnswer}"`
            ).join('\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();

        return NextResponse.json({ analysis: analysisText });

    } catch (error) {
        console.error(`Error analyzing quiz ${quizId}:`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
