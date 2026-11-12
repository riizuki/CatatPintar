import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth/password';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: 'Salah satu Input Masih Kosong' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User dengan email ini sudah ada' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        // Disimpan sebagai hash bcrypt, tidak pernah sebagai teks biasa.
        password: await hashPassword(password),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
