import { parseWorkoutLine } from "@/lib/text/highlight";

type Props = {
  text: string;
  className?: string;
};

export function HighlightedWorkoutText({ text, className }: Props) {
  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((line, index) => {
        const parts = parseWorkoutLine(line);
        return (
          <div key={index} className="min-h-[1.2em]">
            {line.length === 0
              ? "\u00a0"
              : parts.map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className={
                      part.role === "modality"
                        ? "font-semibold text-cyan-300"
                        : part.role === "reps"
                          ? "font-semibold text-amber-300"
                          : undefined
                    }
                  >
                    {part.text}
                  </span>
                ))}
          </div>
        );
      })}
    </div>
  );
}
