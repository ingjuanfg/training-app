import { NextResponse } from "next/server";
import { authenticateWithPin } from "@/lib/auth/credentials";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { pinLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pinLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "PIN inválido" }, { status: 400 });
    }

    const session = await authenticateWithPin(parsed.data.pin);
    if (!session) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }

    const token = await createSessionToken(session);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, role: session.role });
  } catch (error) {
    console.error("login pin error", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 },
    );
  }
}
