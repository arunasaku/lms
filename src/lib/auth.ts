import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        memberId: { label: "Member ID", type: "text", placeholder: "e.g. M001" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.memberId || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            memberId: {
              equals: credentials.memberId,
              mode: 'insensitive'
            }
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

          return {
          id: user.id,
          memberId: user.memberId,
          name: user.name,
          role: user.role,
          permCirculation: user.permCirculation,
          permCatalog: user.permCatalog,
          permMembers: user.permMembers,
          permInventory: user.permInventory,
          permDashboard: user.permDashboard,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.memberId = (user as any).memberId;
        token.role = (user as any).role;
        token.permCirculation = (user as any).permCirculation;
        token.permCatalog = (user as any).permCatalog;
        token.permMembers = (user as any).permMembers;
        token.permInventory = (user as any).permInventory;
        token.permDashboard = (user as any).permDashboard;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).memberId = token.memberId;
        (session.user as any).role = token.role;
        (session.user as any).permCirculation = token.permCirculation;
        (session.user as any).permCatalog = token.permCatalog;
        (session.user as any).permMembers = token.permMembers;
        (session.user as any).permInventory = token.permInventory;
        (session.user as any).permDashboard = token.permDashboard;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
};
