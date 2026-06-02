import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { adminId, password } = await request.json();

    const inputId = String(adminId || "").trim();
    const inputPassword = String(password || "").trim();

    const correctId = String(process.env.ADMIN_ID || "").trim();
    const correctPassword = String(process.env.ADMIN_PW || "").trim();
    const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || "").trim();

    console.log("ADMIN_LOGIN_CHECK", {
      inputId,
      correctId,
      inputPwLength: inputPassword.length,
      correctPwLength: correctPassword.length,
      hasSessionSecret: !!sessionSecret,
    });

    if (!correctId || !correctPassword || !sessionSecret) {
      return NextResponse.json(
        { ok: false, message: "管理ログイン設定が不足しています。" },
        { status: 500 }
      );
    }

    if (inputId !== correctId || inputPassword !== correctPassword) {
      return NextResponse.json(
        { ok: false, message: "IDまたはパスワードが違います。" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("admin_auth", sessionSecret, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("ADMIN_LOGIN_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "ログイン処理に失敗しました。" },
      { status: 500 }
    );
  }
}