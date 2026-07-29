"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  trigger: ReactNode;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  trigger,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="text-lg font-semibold text-[var(--ink)]">
              {title}
            </h2>
            <p id={descId} className="mt-2 text-sm text-[var(--muted)]">
              {description}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Procesando…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
