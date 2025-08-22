﻿// app/api/health/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    app: "No.10 Family Office",
  })
}
