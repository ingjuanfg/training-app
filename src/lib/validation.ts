import { z } from "zod";
import { SECTION_TYPES } from "@/lib/types";

export const passwordLoginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9._]+$/),
  password: z.string().min(1),
});

export const pinLoginSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/),
});

export const workoutFormSchema = z.object({
  workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sedeIds: z
    .array(z.string().min(1))
    .min(1, "Selecciona al menos una sede"),
  sections: z
    .array(
      z.object({
        section_type: z.enum(SECTION_TYPES),
        content: z.string().trim().min(1, "El contenido no puede estar vacío"),
      }),
    )
    .min(1, "Selecciona al menos una sección"),
});

export const deleteWorkoutSchema = z.object({
  workoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sedeIds: z
    .array(z.string().min(1))
    .min(1, "Selecciona al menos una sede"),
});
