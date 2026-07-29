import { NextResponse } from "next/server";
import { authenticateWithPassword } from "@/lib/auth/credentials";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { passwordLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = passwordLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 400 },
      );
    }

    const session = await authenticateWithPassword(
      parsed.data.username,
      parsed.data.password,
    );

    if (!session) {
      return NextResponse.json(
        { error: "Usuario o clave incorrectos" },
        { status: 401 },
      );
    }

    const token = await createSessionToken(session);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, role: session.role });
  } catch (error) {
    console.error("login password error", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 },
    );
  }
}
