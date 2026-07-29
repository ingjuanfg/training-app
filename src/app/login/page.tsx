import { LoginForm } from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white/90 p-8 shadow-lg backdrop-blur">
        <p className="font-display text-4xl text-[var(--ink)]">Training Board</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Panel administrativo o vista TV con PIN de sede.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
