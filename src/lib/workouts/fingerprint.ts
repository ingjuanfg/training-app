import { SECTION_LABELS, type WorkoutSection } from "@/lib/types";

/** Huella estable del contenido para detectar WODs iguales entre sedes. */
export function sectionsFingerprint(
  sections: Pick<WorkoutSection, "section_type" | "content" | "sort_order">[],
): string {
  return [...sections]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => `${s.section_type}:${s.content.trim()}`)
    .join("\n---\n");
}

export function sectionLabels(
  sections: Pick<WorkoutSection, "section_type" | "sort_order">[],
): string[] {
  return [...sections]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((s) => SECTION_LABELS[s.section_type]);
}
