import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/lib/types";

export const SESSION_COOKIE = "training_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin" && payload.role !== "viewer") return null;
    if (typeof payload.username !== "string" || typeof payload.name !== "string") {
      return null;
    }

    const adminId =
      payload.adminId === null || typeof payload.adminId === "string"
        ? (payload.adminId as string | null)
        : null;
    const sedeId =
      payload.sedeId === null || typeof payload.sedeId === "string"
        ? (payload.sedeId as string | null)
        : null;
    const sedeName =
      payload.sedeName === null || typeof payload.sedeName === "string"
        ? (payload.sedeName as string | null)
        : null;
    const sedeLogoPath =
      payload.sedeLogoPath === null || typeof payload.sedeLogoPath === "string"
        ? (payload.sedeLogoPath as string | null)
        : null;

    if (payload.role === "admin" && !adminId) return null;
    if (payload.role === "viewer" && (!sedeId || !sedeName || !sedeLogoPath)) {
      return null;
    }

    return {
      role: payload.role,
      adminId,
      username: payload.username,
      name: payload.name,
      sedeId,
      sedeName,
      sedeLogoPath,
    };
  } catch {
    return null;
  }
}
