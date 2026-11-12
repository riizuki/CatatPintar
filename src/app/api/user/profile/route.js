import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';

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
            const passwordError = validatePassword(password);
            if (passwordError) {
                return NextResponse.json({ message: passwordError }, { status: 400 });
            }
            // Disimpan sebagai hash bcrypt, tidak pernah sebagai teks biasa.
            dataToUpdate.password = await hashPassword(password);
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
