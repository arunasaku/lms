"use server";
import { cookies } from "next/headers";

export async function forceLogout() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  for (const cookie of allCookies) {
    if (cookie.name.includes("session-token") || cookie.name.includes("next-auth") || cookie.name.includes("csrf-token")) {
      cookieStore.delete(cookie.name);
    }
  }
}
