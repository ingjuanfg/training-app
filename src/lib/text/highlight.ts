export type TextRole = "body" | "reps" | "modality";

export type TextPart = {
  text: string;
  role: TextRole;
};

/**
 * Líneas de modalidad: "2 Rondas", "2 - 3 Rounds", "EMON 8 Min",
 * "EMOM", "FOR TIME 12 Min", "AMRAP 10 Min".
 */
const MODALITY_LINE =
  /^(?:\d+(?:\s*[-–]\s*\d+)?\s+(?:rondas?|rounds?)\b|(?:emon|emom|e\d+mom|amrap|for\s+time)\b)/i;

/** Prefijo "10", "8/lado", "20\"". */
const REP_PREFIX =
  /^(\d+(?:["″'])?(?:\s*\/\s*(?:lado|side|c\/u|c\/l))?)(?=\s|$)/i;

/** "5 x 5" o "5x5". */
const SETS = /(\d+)(\s*[xX×]\s*)(\d+)/;

/** "15/10". */
const NUMBER_PAIR = /(\d+)(\s*\/\s*)(\d+)/;

export function isModalityLine(line: string): boolean {
  return MODALITY_LINE.test(line.trim());
}

export function parseWorkoutLine(line: string): TextPart[] {
  const trimmedStart = line.trimStart();
  const indent = line.slice(0, line.length - trimmedStart.length);

  if (!trimmedStart) {
    return [{ text: line, role: "body" }];
  }

  if (isModalityLine(trimmedStart)) {
    return indent
      ? [
          { text: indent, role: "body" },
          { text: trimmedStart, role: "modality" },
        ]
      : [{ text: line, role: "modality" }];
  }

  const parts: TextPart[] = [];
  if (indent) parts.push({ text: indent, role: "body" });
  parts.push(...parseExerciseLine(trimmedStart));
  return parts;
}

function parseExerciseLine(text: string, atLineStart = true): TextPart[] {
  if (!text) return [];

  if (atLineStart) {
    const sets = SETS.exec(text);
    if (sets && sets.index === 0) return splitAround(text, sets);

    const pair = NUMBER_PAIR.exec(text);
    if (pair && pair.index === 0) return splitAround(text, pair);

    if (REP_PREFIX.test(text)) {
      const match = REP_PREFIX.exec(text)!;
      const rest = text.slice(match[0].length);
      return [{ text: match[1], role: "reps" }, ...continueAfterPrefix(rest)];
    }
  }

  const sets = SETS.exec(text);
  if (sets) return splitAround(text, sets);

  return [{ text, role: "body" }];
}

function continueAfterPrefix(rest: string): TextPart[] {
  if (!rest) return [];
  if (rest.startsWith(" ")) {
    const parsed = parseExerciseLine(rest.slice(1), false);
    if (parsed.length === 0) return [{ text: " ", role: "body" }];
    return parsed.map((part, index) =>
      index === 0 ? { ...part, text: ` ${part.text}` } : part,
    );
  }
  return parseExerciseLine(rest, false);
}

function splitAround(text: string, match: RegExpExecArray): TextPart[] {
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);
  const parts: TextPart[] = [];
  if (before) parts.push({ text: before, role: "body" });
  parts.push({ text: match[1], role: "reps" });
  parts.push({ text: match[2], role: "body" });
  parts.push({ text: match[3], role: "reps" });
  if (after) parts.push(...parseExerciseLine(after, false));
  return parts;
}

/** Separa subtítulos de modalidad del resto, ignorando líneas vacías. */
export function splitSectionContent(text: string): {
  banners: string[];
  body: string[];
} {
  const banners: string[] = [];
  const body: string[] = [];

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (isModalityLine(line)) banners.push(line.trim());
    else body.push(line.trimEnd());
  }

  return { banners, body };
}
