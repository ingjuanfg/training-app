"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className,
  label = "Cerrar sesión",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={
        className ??
        "rounded-lg border border-[var(--line)] bg-white/80 px-3 py-2 text-sm font-medium text-[var(--ink)] hover:bg-white disabled:opacity-60"
      }
    >
      {loading ? "Saliendo…" : label}
    </button>
  );
}
