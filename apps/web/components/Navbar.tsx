"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Navbar() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-3 text-left"
          aria-label="Better Ops home"
        >
          <Image
            src="/better-ops-icon.png"
            alt="Better Ops"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Better Ops
          </h1>
        </button>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-gray-600">Welcome, {user.name || "User"}</span>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
