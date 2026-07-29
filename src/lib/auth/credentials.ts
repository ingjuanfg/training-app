import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AdminRow, SessionPayload, SedeWithPin } from "@/lib/types";

async function fetchAdminByUsername(
  username: string,
): Promise<AdminRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admins")
    .select("id, username, name, password_hash")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data as AdminRow | null;
}

async function fetchSedeByPin(pin: string): Promise<SedeWithPin | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("sedes")
    .select("id, name, logo_path, slug, pin_hash");

  if (error) throw error;
  const sedes = (data ?? []) as SedeWithPin[];

  for (const sede of sedes) {
    const ok = await bcrypt.compare(pin, sede.pin_hash);
    if (ok) return sede;
  }
  return null;
}

export async function authenticateWithPassword(
  username: string,
  password: string,
): Promise<SessionPayload | null> {
  const admin = await fetchAdminByUsername(username.trim());
  if (!admin) return null;

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) return null;

  return {
    role: "admin",
    adminId: admin.id,
    username: admin.username,
    name: admin.name,
    sedeId: null,
    sedeName: null,
    sedeLogoPath: null,
  };
}

export async function authenticateWithPin(
  pin: string,
): Promise<SessionPayload | null> {
  const trimmed = pin.trim();
  if (!/^\d{4,8}$/.test(trimmed)) return null;

  const sede = await fetchSedeByPin(trimmed);
  if (!sede) return null;

  return {
    role: "viewer",
    adminId: null,
    username: `pin:${sede.slug}`,
    name: sede.name,
    sedeId: sede.id,
    sedeName: sede.name,
    sedeLogoPath: sede.logo_path,
  };
}
