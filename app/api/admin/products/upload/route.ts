import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function isAdminLoggedIn() {
  const session = cookies().get("admin_auth")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  return !!sessionSecret && session === sessionSecret;
}

function getExtension(fileName: string, mimeType: string) {
  const fromName = fileName.split(".").pop()?.toLowerCase();

  if (fromName) return fromName;
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("jpg")) return "jpg";

  return "jpg";
}

export async function POST(request: Request) {
  try {
    if (!isAdminLoggedIn()) {
      return NextResponse.json(
        { ok: false, message: "ログインが必要です。" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "画像ファイルがありません。" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, message: "画像ファイルを選択してください。" },
        { status: 400 }
      );
    }

    const ext = getExtension(file.name, file.type);
    const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return NextResponse.json({
      ok: true,
      image_url: data.publicUrl,
    });
  } catch (error) {
    console.error("PRODUCT_IMAGE_UPLOAD_ERROR", error);

    return NextResponse.json(
      { ok: false, message: "画像アップロードに失敗しました。" },
      { status: 500 }
    );
  }
}