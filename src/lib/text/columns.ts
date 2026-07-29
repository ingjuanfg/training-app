/**
 * Divide líneas de texto en N columnas lo más equilibradas posible.
 * Ejemplo: 10 líneas → 5 y 5 (no 9 y 1).
 */
export function splitLinesIntoColumns(
  text: string,
  columnCount = 2,
): string[][] {
  const lines = text.split("\n");
  if (columnCount < 2 || lines.length === 0) {
    return [lines];
  }

  const columns: string[][] = Array.from({ length: columnCount }, () => []);
  const base = Math.floor(lines.length / columnCount);
  const remainder = lines.length % columnCount;

  let index = 0;
  for (let col = 0; col < columnCount; col += 1) {
    const size = base + (col < remainder ? 1 : 0);
    columns[col] = lines.slice(index, index + size);
    index += size;
  }

  return columns;
}

/** Usa 2 columnas solo cuando el texto es suficientemente largo. */
export function shouldUseTwoColumns(text: string, minLines = 6): boolean {
  return text.split("\n").length >= minLines;
}
