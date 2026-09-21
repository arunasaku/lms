import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    cookies: {
      sessionToken: {
        name: process.env.COOKIE_PREFIX
          ? (process.env.NODE_ENV === "production"
              ? `__Secure-${process.env.COOKIE_PREFIX.replace(/[^a-zA-Z0-9]/g, "_")}-session-token`
              : `${process.env.COOKIE_PREFIX.replace(/[^a-zA-Z0-9]/g, "_")}-session-token`)
          : (process.env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token"),
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production"
        }
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.jpg (logo)
     */
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico|logo.jpg).*)"
  ],
};
