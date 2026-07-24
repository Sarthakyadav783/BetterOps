"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => {
      const storedToken = localStorage.getItem("authorization");
      const storeToken = useAuthStore.getState().token;

      if (!storedToken && !storeToken) {
        router.replace("/signin");
        return;
      }
      setReady(true);
    };

    if (useAuthStore.persist.hasHydrated()) {
      finish();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(finish);
    return unsub;
  }, [router, token]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Checking authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}
