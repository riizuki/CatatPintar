import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import prisma from '@/lib/prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const { valid, needsRehash } = await verifyPassword(credentials.password, user.password);

        if (!valid) {
          return null;
        }

        // Akun lama yang sandinya masih teks biasa: ganti dengan hash begitu
        // pemiliknya berhasil masuk. Kegagalan di sini tidak boleh menggagalkan
        // login — skrip migrasi akan menangkap sisanya.
        if (needsRehash) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { password: await hashPassword(credentials.password) },
            });
          } catch (error) {
            console.error(`Gagal meng-hash ulang kata sandi user ${user.id}:`, error);
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
