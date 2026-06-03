"use client";

import { useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

type HomeBanner = {
  id: string;
  slot: number;
  image_url: string;
  caption: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type BannerForm = {
  slot: number;
  image_url: string;
  caption: string;
  is_active: boolean;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("画像処理に失敗しました。");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("画像の切り抜きに失敗しました。"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

function defaultBanner(slot: number): BannerForm {
  if (slot === 1) {
    return {
      slot: 1,
      image_url: "/mikan/bnr_shipping_campaign.png?v=20260120a",
      caption: "山川の100円みかんを箱に詰めました。",
      is_active: true,
    };
  }

  if (slot === 2) {
    return {
      slot: 2,
      image_url: "/mikan/bnr_open_special.png?v=20260120a",
      caption: "みかん購入で豪華なおまけ付き!!",
      is_active: true,
    };
  }

  return {
    slot: 3,
    image_url: "/mikan/bnr_oseibo.png?v=20260120a",
    caption: "二種の支払い方法",
    is_active: true,
  };
}

function slotTitle(slot: number) {
  if (slot === 1) return "イベントバナー 1";
  if (slot === 2) return "イベントバナー 2";
  return "イベントバナー 3";
}

export default function AdminBannersPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [banners, setBanners] = useState<BannerForm[]>([
    defaultBanner(1),
    defaultBanner(2),
    defaultBanner(3),
  ]);

  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/home-banners", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "ホームバナーの取得に失敗しました。");
        return;
      }

      const received: HomeBanner[] = data.banners || [];

      const nextForms = [1, 2, 3].map((slot) => {
        const found = received.find((banner) => Number(banner.slot) === slot);

        if (!found) return defaultBanner(slot);

        return {
          slot,
          image_url: found.image_url || defaultBanner(slot).image_url,
          caption: found.caption || defaultBanner(slot).caption,
          is_active:
            typeof found.is_active === "boolean" ? found.is_active : true,
        };
      });

      setBanners(nextForms);
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const updateBannerForm = (
    slot: number,
    field: keyof BannerForm,
    value: string | boolean | number
  ) => {
    setBanners((current) =>
      current.map((banner) =>
        banner.slot === slot
          ? {
              ...banner,
              [field]: value,
            }
          : banner
      )
    );
  };

  const saveBanner = async (banner: BannerForm) => {
    if (!banner.image_url.trim()) {
      setMessage("画像を設定してください。");
      return;
    }

    if (!banner.caption.trim()) {
      setMessage("バナー下の文章を入力してください。");
      return;
    }

    const ok = window.confirm(
      `${slotTitle(banner.slot)}を更新します。\n\n間違いありませんか？`
    );

    if (!ok) return;

    setSavingSlot(banner.slot);
    setMessage("");

    try {
      const res = await fetch("/api/admin/home-banners", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slot: banner.slot,
          image_url: banner.image_url,
          caption: banner.caption,
          is_active: banner.is_active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "更新に失敗しました。");
        return;
      }

      setMessage(`${slotTitle(banner.slot)}を更新しました。`);
      await loadBanners();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSavingSlot(null);
    }
  };

  const openFilePicker = (slot: number) => {
    setSelectedSlot(slot);
    fileInputRef.current?.click();
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("画像ファイルを選択してください。");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        setMessage("画像の読み込みに失敗しました。");
        return;
      }

      setImageSrc(result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setCropModalOpen(true);
    };

    reader.readAsDataURL(file);
  };

  const uploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setMessage("画像の切り抜き範囲が取得できませんでした。");
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], `home-banner-${selectedSlot}-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "画像アップロードに失敗しました。");
        return;
      }

      updateBannerForm(selectedSlot, "image_url", data.image_url);
      setMessage(
        `${slotTitle(selectedSlot)}の画像をアップロードしました。最後に更新ボタンを押してください。`
      );

      setCropModalOpen(false);
      setImageSrc(null);
    } catch (error) {
      console.error(error);
      setMessage("画像アップロードに失敗しました。");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06090d] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(250,204,21,0.20),transparent_32%),radial-gradient(circle_at_84%_18%,rgba(34,197,94,0.13),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.10),transparent_32%),linear-gradient(135deg,#05070a_0%,#111827_48%,#030405_100%)]" />
        <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] bg-[size:38px_38px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/45 backdrop-blur-xl shadow-[8px_0_30px_rgba(0,0,0,0.25)]">
          <div className="px-7 py-7 border-b border-white/10">
            <p className="text-xs tracking-[0.35em] text-yellow-300/80">
              MIKAN AGENT
            </p>
            <h1 className="mt-3 text-2xl font-black">山口みかん農園</h1>
            <p className="mt-2 text-xs text-white/45">
              Home Banner Console
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              href="/admin/orders"
              className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              注文管理
            </a>

            <a
              href="/admin/products"
              className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              商品管理
            </a>

            <a
              href="/admin/banners"
              className="block rounded-lg px-4 py-3 text-sm font-bold bg-gradient-to-r from-yellow-400/20 to-green-400/10 text-yellow-100 border border-yellow-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_22px_rgba(0,0,0,0.22)]"
            >
              ホームバナー管理
            </a>

            <a
              href="/"
              className="block rounded-lg px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              ホームを見る
            </a>
          </nav>

          <div className="px-6 py-6 border-t border-white/10">
            <p className="text-xs leading-6 text-white/45">
              ホーム画面のスライダー3枚を管理します。
              画像と下に表示される文章だけをここから変更できます。
            </p>

            <a
              href="/admin/login"
              className="mt-5 block w-full rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-center text-sm font-black text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.18)] transition hover:bg-red-500/20 active:translate-y-[2px]"
            >
              ログイン画面へ
            </a>
          </div>
        </aside>

        <section className="flex-1 px-3 sm:px-8 lg:px-10 py-4 sm:py-8">
          <div className="lg:hidden mb-3 flex items-center justify-between gap-3">
            <div className="rounded-lg border border-yellow-300/20 bg-black/45 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.22)]">
              <p className="text-[10px] tracking-[0.18em] text-yellow-200/70">
                BANNER
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                ホーム3枚スライダー
              </p>
            </div>

            <a
              href="/admin/login"
              className="rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-[11px] font-black text-red-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] active:translate-y-[2px]"
            >
              ログイン画面
            </a>
          </div>

          <header
            className="relative mb-5 sm:mb-8 overflow-hidden rounded-xl border border-yellow-300/25 backdrop-blur-2xl px-4 sm:px-6 py-5 sm:py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.65),0_22px_55px_rgba(0,0,0,0.36)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(250,204,21,0.16), rgba(60,48,12,0.30), rgba(5,8,8,0.82))",
            }}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-yellow-300/80 via-green-300/40 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-white/20" />

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-md border border-yellow-300/20 bg-yellow-400/10 px-3 py-2 text-[11px] sm:text-xs text-yellow-100 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.9)]" />
                  HOME BANNER CONTROL
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                  ホームバナー管理
                </h2>

                <p className="mt-3 text-white/55 text-xs sm:text-base leading-6">
                  ホーム画面の3枚スライダー画像と、下に表示される文章を変更できます。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <a
                  href="/admin/orders"
                  className="rounded-lg border border-white/10 bg-black/35 px-4 sm:px-5 py-3 text-center text-sm font-bold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] transition hover:bg-white/10 active:translate-y-[2px]"
                >
                  注文管理
                </a>

                <a
                  href="/admin/products"
                  className="rounded-lg border border-white/10 bg-black/35 px-4 sm:px-5 py-3 text-center text-sm font-bold text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(0,0,0,0.20)] transition hover:bg-white/10 active:translate-y-[2px]"
                >
                  商品管理
                </a>
              </div>
            </div>
          </header>

          {message && (
            <div className="mb-5 rounded-lg border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_26px_rgba(0,0,0,0.22)]">
              {message}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleImageSelect(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-[#0b1114]/90 backdrop-blur-2xl px-6 py-14 text-center text-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_42px_rgba(0,0,0,0.34)]">
              ホームバナーを読み込み中...
            </div>
          ) : (
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <article
                  key={banner.slot}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0b1114]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.65),0_18px_42px_rgba(0,0,0,0.34)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/20"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-yellow-300/70 via-green-300/35 to-transparent" />

                  <div className="pl-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] tracking-[0.22em] text-yellow-200/70">
                          SLOT {banner.slot}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-white">
                          {slotTitle(banner.slot)}
                        </h3>
                      </div>

                      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/60">
                        <input
                          type="checkbox"
                          checked={banner.is_active}
                          onChange={(e) =>
                            updateBannerForm(
                              banner.slot,
                              "is_active",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />
                        表示
                      </label>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_rgba(0,0,0,0.18)]">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.caption}
                          className="h-48 w-full object-contain bg-black/25"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-white/35">
                          画像未設定
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => openFilePicker(banner.slot)}
                        className="rounded-lg border border-yellow-300/25 bg-yellow-400/15 px-4 py-3 text-sm font-black text-yellow-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition hover:bg-yellow-400/25 active:translate-y-[2px]"
                      >
                        画像を選んでトリミング
                      </button>

                      <input
                        value={banner.image_url}
                        onChange={(e) =>
                          updateBannerForm(
                            banner.slot,
                            "image_url",
                            e.target.value
                          )
                        }
                        placeholder="画像URL"
                        className="rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-xs font-bold text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs text-white/45 mb-2">
                        バナー下の文章
                      </label>

                      <textarea
                        value={banner.caption}
                        onChange={(e) =>
                          updateBannerForm(
                            banner.slot,
                            "caption",
                            e.target.value
                          )
                        }
                        rows={3}
                        placeholder="例：山川の100円みかんを箱に詰めました。"
                        className="w-full rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.55)]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => saveBanner(banner)}
                      disabled={savingSlot === banner.slot || uploadingImage}
                      className="mt-4 w-full rounded-lg border border-green-300/25 bg-green-500/15 px-4 py-3 text-sm font-black text-green-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_20px_rgba(0,0,0,0.22)] transition hover:bg-green-500/25 active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {savingSlot === banner.slot
                        ? "更新中..."
                        : `${slotTitle(banner.slot)}を更新`}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 text-xs leading-6 text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_28px_rgba(0,0,0,0.22)]">
            <p className="font-black text-yellow-100/80">
              注意
            </p>
            <p className="mt-2">
              この画面で更新した内容は、次の手順でホーム側をAPI読み込みに変更したあとに反映されます。
              今は管理側の編集ページを作っている段階です。
            </p>
          </div>
        </section>
      </div>

      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
            <div>
              <p className="text-xs tracking-[0.25em] text-yellow-200/80">
                IMAGE CROP
              </p>
              <h2 className="text-lg font-black">
                {slotTitle(selectedSlot)}の画像をトリミング
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setCropModalOpen(false);
                setImageSrc(null);
              }}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80"
            >
              閉じる
            </button>
          </div>

          <div className="relative flex-1">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) =>
                setCroppedAreaPixels(croppedPixels)
              }
              showGrid={true}
            />
          </div>

          <div className="border-t border-white/10 bg-[#090b0f] px-5 py-5">
            <div className="max-w-3xl mx-auto">
              <label className="block text-xs text-white/50 mb-2">
                拡大・縮小
              </label>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-yellow-400"
              />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCropModalOpen(false);
                    setImageSrc(null);
                  }}
                  disabled={uploadingImage}
                  className="rounded-lg border border-white/10 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 disabled:opacity-50"
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={uploadingImage}
                  className="rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-500 px-5 py-4 text-sm font-black text-black disabled:opacity-50"
                >
                  {uploadingImage ? "アップロード中..." : "この画像で決定"}
                </button>
              </div>

              <p className="mt-3 text-xs text-white/35 leading-5">
                ホームのスライダーに合わせて、16:9で切り抜きます。
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}