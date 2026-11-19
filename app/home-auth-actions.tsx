"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn, LogOut, UserRound } from "lucide-react";

export default function HomeAuthActions() {
  const router = useRouter();
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function logout() {
    if (!supabase || loggingOut) return;
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    setLoggingOut(false);

    if (error) {
      window.alert("Tidak dapat keluar. Silakan coba lagi.");
      return;
    }

    setSignedIn(false);
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-100" aria-label="Memeriksa sesi akun" />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/masuk"
        className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 sm:inline-flex"
      >
        <LogIn size={16} /> Masuk
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/akun"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
      >
        <UserRound size={16} /> Akun saya
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={loggingOut}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
      >
        <LogOut size={16} /> {loggingOut ? "Keluar..." : "Keluar"}
      </button>
    </div>
  );
}
