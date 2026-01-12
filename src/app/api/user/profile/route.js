import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ message: 'Error fetching user profile', details: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { fullName, email, password } = body;

        if (!fullName || !email) {
            return NextResponse.json({ message: 'Full name and email are required' }, { status: 400 });
        }

        // Check if email already exists for another user
        const existingUserWithEmail = await prisma.user.findFirst({
            where: {
                email: email,
                NOT: { id: session.user.id } // Exclude current user
            }
        });

        if (existingUserWithEmail) {
            return NextResponse.json({ message: 'Email already in use by another account' }, { status: 409 });
        }

        const dataToUpdate = {
            fullName,
            email,
        };

        if (password) {
            if (password.length < 6) { // Example: password minimum length
                return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
            }
            dataToUpdate.password = password; // Store plain text password for now
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: dataToUpdate,
            select: {
                id: true,
                fullName: true,
                email: true,
            }
        });

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser }, { status: 200 });

    } catch (error) {
        console.error('Error updating user profile:', error);
        return NextResponse.json({ message: 'Error updating user profile', details: error.message }, { status: 500 });
    }
}
