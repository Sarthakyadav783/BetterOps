"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, Globe2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const statusRows = [
  { url: "api.acme.com", region: "India", status: "Up" as const, ms: 142 },
  { url: "store.acme.com", region: "Usa", status: "Up" as const, ms: 218 },
  { url: "cdn.acme.com", region: "India", status: "Down" as const, ms: 3204 },
];

export default function Hero() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(!!token || !!localStorage.getItem("authorization"));
  }, [token]);

  const goAuthOrDashboard = (fallback: "/signin" | "/signup") => {
    router.push(signedIn ? "/dashboard" : fallback);
  };

  return (
    <div className="landing min-h-screen text-[#0c1f17]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-3 text-left"
            aria-label="Better Ops home"
          >
            <Image
              src="/better-ops-icon.png"
              alt="Better Ops"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg shadow-sm"
              priority
            />
            <span className="font-[family-name:var(--font-landing-display)] text-3xl tracking-tight text-[#0c1f17]">
              Better Ops: Monitor. Detect. Resolve.
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            {signedIn ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg bg-[#0c1f17] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#143528]"
              >
                Go to dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/signin")}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#0c1f17]/80 transition hover:bg-white/40 hover:text-[#0c1f17]"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="rounded-lg bg-[#0c1f17] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#143528]"
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_10%_-10%,#86efac_0%,transparent_55%),radial-gradient(900px_500px_at_90%_10%,#5eead4_0%,transparent_50%),linear-gradient(180deg,#ecfdf5_0%,#f0fdf4_42%,#ffffff_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(rgba(12,31,23,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(12,31,23,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pb-16 pt-28 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="landing-fade-up max-w-xl">
              <p className="font-[family-name:var(--font-landing-display)] text-5xl leading-[0.95] tracking-tight text-[#0c1f17] sm:text-6xl lg:text-7xl">
                Better Ops
              </p>

              <h1 className="mt-6 max-w-lg text-2xl font-medium leading-snug text-[#0c1f17]/90 sm:text-3xl">
                Uptime monitoring and incident management, simplified.
              </h1>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => goAuthOrDashboard("/signup")}
                  className="group inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(5,150,105,0.8)] transition hover:bg-emerald-500"
                >
                  {signedIn ? "Go to dashboard" : "Start monitoring"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                {!signedIn && (
                  <button
                    onClick={() => goAuthOrDashboard("/signin")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#0c1f17]/15 bg-white/50 px-5 py-3 text-sm font-semibold text-[#0c1f17] backdrop-blur transition hover:bg-white/80"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>

            <div className="landing-fade-up-delayed relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-300/40 via-teal-200/20 to-transparent blur-2xl" />

              <div className="landing-float overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#0c1f17] text-emerald-50 shadow-[0_30px_80px_-30px_rgba(6,78,59,0.65)]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium tracking-wide">
                      Live checks
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-100/60">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Multi-region
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  {statusRows.map((row) => (
                    <div
                      key={`${row.url}-${row.region}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">
                          {row.url}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-100/55">
                          <Globe2 className="h-3 w-3" />
                          {row.region}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            row.status === "Up"
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-red-400/15 text-red-300"
                          }`}
                        >
                          {row.status}
                        </span>
                        <div className="mt-1 text-xs text-emerald-100/50">
                          {row.ms}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
