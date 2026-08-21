import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
  matcher: [
    "/((?!login|opac|api|_next/static|_next/image|favicon.ico).*)",
  ],
}
