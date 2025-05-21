import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secretKey);
}

export async function decrypt(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function login(email: string, password: string) {
    try {
        // In a real app, you would hash the password and compare with the stored hash
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                agency: true,
            },
        });

        if (!user || user.password !== password) {
            return null;
        }

        // Create a JWT token
        const token = await encrypt({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            agencyId: user.agencyId,
        });

        // Set the token in cookies
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400, // 1 day
            path: "/",
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId,
            agency: user.agency,
        };
    } catch (error) {
        console.error("Login error:", error);
        return null;
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const payload = await decrypt(token);
        if (!payload) return null;

        // Fetch the latest user data
        const user = await prisma.user.findUnique({
            where: { id: payload.id as string },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                agencyId: true,
                agency: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!user) return null;

        return user;
    } catch (error) {
        console.error("Session error:", error);
        return null;
    }
}

export async function requireAuth(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const payload = await decrypt(token);
        if (!payload) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return null;
    } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export async function requireAdmin(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const payload = await decrypt(token);
        if (!payload || payload.role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return null;
    } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export async function register(
    name: string,
    email: string,
    password: string,
    agencyId?: string
) {
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return null;
        }

        // Create new user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // In a real app, you would hash this password
                agencyId,
                role: agencyId ? "AGENCY_USER" : "SUPER_ADMIN",
            },
            include: {
                agency: true,
            },
        });

        // Create a JWT token
        const token = await encrypt({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            agencyId: user.agencyId,
        });

        // Set the token in cookies
        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 86400, // 1 day
            path: "/",
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            agencyId: user.agencyId,
            agency: user.agency,
        };
    } catch (error) {
        console.error("Registration error:", error);
        return null;
    }
}

export async function getUser(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
        return null;
    }

    try {
        const payload = await decrypt(token);
        if (!payload) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

interface Credentials {
    email: string;
    password: string;
}

interface Session {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        agencyId: string | null;
    };
}

interface Token {
    id: string;
    role: string;
    agencyId: string | null;
}

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
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Credentials | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        agency: true,
                    },
                });

                if (!user) {
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
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: Session; token: Token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.agencyId = token.agencyId;
            }
            return session;
        },
        async jwt({ token, user }: { token: Token; user: User | null }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.agencyId = user.agencyId;
            }
            return token;
        },
    },
};
