import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const inter = Inter({ subsets: ['latin'] })
const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "Library Management System",
  description: "Modern library management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  let libraryName = "Library";
  let instituteName = "My Institute";

  if (session) {
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
      if (config) {
        libraryName = config.libraryName || libraryName;
        instituteName = config.instituteName || instituteName;
      }
    } catch (e) {}
  }
  
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-slate-50 text-slate-900 flex flex-col md:flex-row h-screen overflow-hidden`}
      >
        <Providers>
          {session ? (
            <>
              <Navigation session={session} libraryName={libraryName} instituteName={instituteName}>
                {children}
              </Navigation>
            </>
          ) : (
            <main className="flex-1 h-full overflow-auto">
              {children}
            </main>
          )}
        </Providers>
      </body>
    </html>
  );
}
