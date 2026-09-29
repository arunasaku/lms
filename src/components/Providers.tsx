"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { forceLogout } from "@/app/actions/auth";

function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only enforce auto logout on tab/browser close for ADMIN role
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      const isTabActive = sessionStorage.getItem("admin_tab_active");
      if (!isTabActive) {
        sessionStorage.clear();
        forceLogout().then(() => {
          signOut({ redirect: false }).then(() => {
            window.location.href = "/login";
          });
        });
      }
    }
  }, [status, session]);

  return <>{children}</>;
}

export function Providers({ children, session }: { children: React.ReactNode, session: any }) {
  return (
    <SessionProvider session={session}>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
