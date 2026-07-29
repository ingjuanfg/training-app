"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  maxDate: string;
  selectedDate?: string;
};

export function HistoryDatePicker({ maxDate, selectedDate }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(selectedDate ?? "");

  function apply(date: string) {
    if (!date) return;
    router.push(`/admin/history?date=${encodeURIComponent(date)}`);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl border border-[var(--line)] bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
    >
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1.5 text-sm font-medium">
        Selecciona un día
        <input
          type="date"
          max={maxDate}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value) apply(e.target.value);
          }}
          className="rounded-lg border border-[var(--line)] bg-white px-3 py-2.5"
          required
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--ink-soft)]"
      >
        Ver
      </button>
    </form>
  );
}
