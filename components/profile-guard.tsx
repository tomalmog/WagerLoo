"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user && !session.user.hasProfile) {
      router.push("/profile/create");
    }
  }, [session, status, router]);

  // Don't render children if user needs to create profile
  if (session?.user && !session.user.hasProfile) {
    return null;
  }

  return <>{children}</>;
}
