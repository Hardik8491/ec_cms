import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { User as PrismaUser } from "@prisma/client";
import type { JWT } from "next-auth/jwt";

// -------------------- Type Extensions --------------------
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string;
            role: string;
            agencyId?: string;
            agency?: any;
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string;
        role: string;
        agencyId?: string;
        agency?: any;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email?: string;
        name?: string;
        role: string;
        agencyId?: string;
        agency?: any;
    }
}

// -------------------- NextAuth Options --------------------
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { agency: true },
                });

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                );
                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    agencyId: user.agencyId,
                    agency: user.agency,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.agencyId = user.agencyId;
                token.agency = user.agency;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.email = token.email!;
                session.user.name = token.name;
                session.user.role = token.role;
                session.user.agencyId = token.agencyId;
                session.user.agency = token.agency;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
