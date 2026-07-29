"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "password" | "pin";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint =
        mode === "password" ? "/api/auth/login" : "/api/auth/login-pin";
      const body =
        mode === "password" ? { username, password } : { pin };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        error?: string;
        role?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        return;
      }

      router.replace(data.role === "admin" ? "/admin" : "/display");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {mode === "password" ? (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--ink)]">
            Usuario
            <input
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--accent)]"
              required
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--ink)]">
            Clave
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--accent)]"
              required
            />
          </label>
        </>
      ) : (
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[var(--ink)]">
          PIN
          <input
            name="pin"
            inputMode="numeric"
            pattern="\d{4,8}"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-center text-2xl tracking-[0.35em] outline-none focus:border-[var(--accent)]"
            required
          />
        </label>
      )}

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[var(--ink)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--ink-soft)] disabled:opacity-60"
      >
        {loading ? "Ingresando…" : "Ingresar"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "pin" : "password");
          setError(null);
        }}
        className="text-sm font-medium text-[var(--accent-deep)] underline-offset-4 hover:underline"
      >
        {mode === "password" ? "Ingresar con PIN" : "Ingresar con usuario y clave"}
      </button>
    </form>
  );
}
