import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { SedeRow } from "@/lib/types";

export async function listSedes(): Promise<SedeRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sedes")
    .select("id, name, logo_path, slug")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SedeRow[];
}

export async function getSedeById(id: string): Promise<SedeRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sedes")
    .select("id, name, logo_path, slug")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as SedeRow | null) ?? null;
}
