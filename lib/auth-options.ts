import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            clinic: true,
            professional: true
          }
        });

        if (!user) {
          throw new Error("Credenciais inválidas");
        }

        if (!user.active) {
          throw new Error("Usuário inativo");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciais inválidas");
        }

        const authUser: User & { role: string; clinicId: string | null; avatar: string | null } = {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          role: user.role,
          avatar: user.avatar,
          clinicId: user.clinicId,
        };
        return authUser;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const jt = token as unknown as { id?: string; role?: string; clinicId?: string | null };
        const u = user as unknown as { id?: string; role?: string; clinicId?: string | null };
        jt.id = u.id;
        jt.role = u.role;
        jt.clinicId = u.clinicId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as unknown as { id?: string; role?: string; clinicId?: string | null };
        const jt = token as unknown as { id?: string; role?: string; clinicId?: string | null };
        su.id = jt.id ?? undefined;
        su.role = jt.role ?? undefined;
        su.clinicId = jt.clinicId ?? null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
