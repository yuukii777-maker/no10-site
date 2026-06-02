"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  tag: string;
  image_url: string | null;
  description: string | null;
  notice: string | null;
  price_5kg: number | null;
  price_10kg: number | null;
  unit_label: string | null;
  stock_status: string;
  is_active: boolean;
  sort_order: number | null;
};

type ProductForm = {
  id?: string;
  name: string;
  tag: string;
  image_url: string;
  description: string;
  notice: string;
  price_5kg: string;
  price_10kg: string;
  unit_label: string;
  stock_status: string;
  is_active: boolean;
  sort_order: string;
};

const emptyForm: ProductForm = {
  name: "",
  tag: "みかん",
  image_url: "",
  description: "",
  notice: "",
  price_5kg: "",
  price_10kg: "",
  unit_label: "箱",
  stock_status: "販売中",
  is_active: true,
  sort_order: "0",
};

function formatPrice(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString()}円`;
}

function toForm(product: Product): ProductForm {
  return {
    id: product.id,
    name: product.name || "",
    tag: product.tag || "みかん",
    image_url: product.image_url || "",
    description: product.description || "",
    notice: product.notice || "",
    price_5kg:
      product.price_5kg === null || product.price_5kg === undefined
        ? ""
        : String(product.price_5kg),
    price_10kg:
      product.price_10kg === null || product.price_10kg === undefined
        ? ""
        : String(product.price_10kg),
    unit_label: product.unit_label || "箱",
    stock_status: product.stock_status || "販売中",
    is_active: product.is_active,
    sort_order:
      product.sort_order === null || product.sort_order === undefined
        ? "0"
        : String(product.sort_order),
  };
}

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

function productToPayload(product: Product, override: Partial<ProductForm> = {}) {
  return {
    id: product.id,
    name: override.name ?? product.name ?? "",
    tag: override.tag ?? product.tag ?? "みかん",
    image_url: override.image_url ?? product.image_url ?? "",
    description: override.description ?? product.description ?? "",
    notice: override.notice ?? product.notice ?? "",
    price_5kg:
      override.price_5kg ??
      (product.price_5kg === null || product.price_5kg === undefined
        ? ""
        : String(product.price_5kg)),
    price_10kg:
      override.price_10kg ??
      (product.price_10kg === null || product.price_10kg === undefined
        ? ""
        : String(product.price_10kg)),
    unit_label: override.unit_label ?? product.unit_label ?? "箱",
    stock_status: override.stock_status ?? product.stock_status ?? "販売中",
    is_active:
      override.is_active === undefined ? product.is_active : override.is_active,
    sort_order:
      override.sort_order ??
      (product.sort_order === null || product.sort_order === undefined
        ? "0"
        : String(product.sort_order)),
  };
}

function SortableProductCard({
  product,
  onEdit,
  onHide,
  onRemoveImage,
  disabled,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onHide: (product: Product) => void;
  onRemoveImage: (product: Product) => void;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-black/25 hover:bg-white/[0.07] transition shadow-xl"
    >
      <div className="relative h-52 bg-gradient-to-br from-yellow-300/15 to-green-400/10 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/30">
            画像未設定
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-2 text-xs font-black text-white/80 backdrop-blur hover:bg-black/70 cursor-grab active:cursor-grabbing touch-none"
          title="長押し・ドラッグで並び替え"
        >
          並び替え
        </button>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-black text-black">
            {product.tag || "みかん"}
          </span>

          <span
            className={
              product.stock_status === "販売中"
                ? "rounded-full bg-green-400 px-3 py-1 text-xs font-black text-black"
                : "rounded-full bg-red-400 px-3 py-1 text-xs font-black text-black"
            }
          >
            {product.stock_status}
          </span>
        </div>

        <h4 className="absolute left-4 right-4 bottom-4 text-lg font-black text-white drop-shadow">
          {product.name}
        </h4>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/40">5kg</p>
            <p className="mt-1 font-black text-yellow-100">
              {formatPrice(product.price_5kg)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/40">10kg</p>
            <p className="mt-1 font-black text-yellow-100">
              {formatPrice(product.price_10kg)}
            </p>
          </div>
        </div>

        <p className="text-sm text-white/55 line-clamp-2 min-h-[42px]">
          {product.description || "説明文は未設定です。"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => onEdit(product)}
            disabled={disabled}
            className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-black hover:bg-yellow-100 disabled:opacity-50"
          >
            編集
          </button>

          <button
            onClick={() => onHide(product)}
            disabled={disabled}
            className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100 hover:bg-red-500/20 disabled:opacity-50"
          >
            削除
          </button>
        </div>

        <button
          onClick={() => onRemoveImage(product)}
          disabled={disabled || !product.image_url}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/60 hover:bg-white/10 disabled:opacity-35"
        >
          画像だけ外す
        </button>
      </div>
    </article>
  );
}

export default function AdminProductsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"create" | "edit">("create");

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    })
  );

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.is_active);
  }, [products]);

  const hiddenProducts = useMemo(() => {
    return products.filter((product) => !product.is_active);
  }, [products]);

  const totalActive = activeProducts.length;
  const totalSoldOut = products.filter(
    (product) => product.stock_status === "売り切れ" && product.is_active
  ).length;
  const totalOnSale = products.filter(
    (product) => product.stock_status === "販売中" && product.is_active
  ).length;

  const loadProducts = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/products", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "商品の取得に失敗しました。");
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      sort_order: String(totalActive + 1),
    });
    setMode("create");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const editProduct = (product: Product) => {
    setForm(toForm(product));
    setMode("edit");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveProduct = async () => {
    if (!form.name.trim()) {
      setMessage("商品名を入力してください。");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const method = mode === "edit" ? "PATCH" : "POST";
      const resolvedSortOrder =
        form.sort_order && Number(form.sort_order) > 0
          ? form.sort_order
          : String(totalActive + 1);

      const res = await fetch("/api/admin/products", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id,
          name: form.name,
          tag: form.tag,
          image_url: form.image_url,
          description: form.description,
          notice: form.notice,
          price_5kg: form.price_5kg,
          price_10kg: form.price_10kg,
          unit_label: form.unit_label,
          stock_status: form.stock_status,
          is_active: form.is_active,
          sort_order: resolvedSortOrder,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "保存に失敗しました。");
        return;
      }

      setMessage(mode === "edit" ? "商品を更新しました。" : "商品を追加しました。");
      setForm({
        ...emptyForm,
        sort_order: String(totalActive + 2),
      });
      setMode("create");
      await loadProducts();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const hideProduct = async (product: Product) => {
    const ok = window.confirm(
      `「${product.name}」を削除しますか？\nお客様ページから消えますが、非表示商品として管理画面には残ります。`
    );

    if (!ok) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "削除に失敗しました。");
        return;
      }

      setMessage("商品を削除しました。非表示商品から復活できます。");
      await loadProducts();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const restoreProduct = async (product: Product) => {
    const ok = window.confirm(`「${product.name}」を復活させますか？`);

    if (!ok) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          productToPayload(product, {
            is_active: true,
            sort_order: String(totalActive + 1),
          })
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "復活に失敗しました。");
        return;
      }

      setMessage("商品を復活しました。");
      await loadProducts();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const removeProductImageDirect = async (product: Product) => {
    const ok = window.confirm(`「${product.name}」の画像を外しますか？`);

    if (!ok) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          productToPayload(product, {
            image_url: "",
          })
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "画像の解除に失敗しました。");
        return;
      }

      if (form.id === product.id) {
        setForm((current) => ({
          ...current,
          image_url: "",
        }));
      }

      setMessage("画像を外しました。");
      await loadProducts();
    } catch (error) {
      setMessage("通信エラーが発生しました。");
    } finally {
      setSaving(false);
    }
  };

  const saveSortOrder = async (sortedProducts: Product[]) => {
    setSorting(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: sortedProducts.map((product, index) => ({
            id: product.id,
            sort_order: index + 1,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "並び替えの保存に失敗しました。");
        await loadProducts();
        return;
      }

      setProducts(data.products || []);
      setMessage("商品の並び順を保存しました。");
    } catch (error) {
      setMessage("通信エラーが発生しました。");
      await loadProducts();
    } finally {
      setSorting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = activeProducts.findIndex(
      (product) => product.id === active.id
    );
    const newIndex = activeProducts.findIndex(
      (product) => product.id === over.id
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const reorderedActive = arrayMove(activeProducts, oldIndex, newIndex).map(
      (product, index) => ({
        ...product,
        sort_order: index + 1,
      })
    );

    const hidden = products.filter((product) => !product.is_active);

    setProducts([...reorderedActive, ...hidden]);
    await saveSortOrder(reorderedActive);
  };

  const openFilePicker = () => {
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
      const file = new File([blob], `product-${Date.now()}.jpg`, {
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

      setForm((current) => ({
        ...current,
        image_url: data.image_url,
      }));

      setMessage("画像をアップロードしました。最後に商品を保存してください。");
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
    <main className="min-h-screen bg-[#090b0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,180,50,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(20,160,120,0.16),transparent_30%),linear-gradient(135deg,#07090d_0%,#10141d_45%,#050608_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(0deg,white_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute left-0 top-0 h-full w-[420px] bg-gradient-to-r from-yellow-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/35 backdrop-blur-xl">
          <div className="px-7 py-7 border-b border-white/10">
            <p className="text-xs tracking-[0.35em] text-yellow-300/80">
              MIKAN AGENT
            </p>
            <h1 className="mt-3 text-2xl font-black">山口みかん農園</h1>
            <p className="mt-2 text-xs text-white/45">
              Product Control Console
            </p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              href="/admin/orders"
              className="block rounded-2xl px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              注文管理
            </a>
            <a
              href="/admin/products"
              className="block rounded-2xl px-4 py-3 text-sm font-bold bg-gradient-to-r from-yellow-400/20 to-green-400/10 text-yellow-100 border border-yellow-300/20"
            >
              商品管理
            </a>
            <a
              href="/products"
              className="block rounded-2xl px-4 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"
            >
              お客様商品ページ
            </a>
          </nav>

          <div className="px-6 py-6 border-t border-white/10">
            <p className="text-xs text-white/40 leading-relaxed">
              商品の販売状態・価格・説明・画像・並び順をここから編集できます。
            </p>
          </div>
        </aside>

        <section className="flex-1 px-5 sm:px-8 lg:px-10 py-8">
          <header
  className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8 rounded-[2rem] border border-lime-300/30 backdrop-blur-2xl px-5 sm:px-6 py-6"
  style={{
    background:
      "linear-gradient(135deg, rgba(190,242,100,0.16), rgba(80,120,35,0.24), rgba(5,12,8,0.72))",
    boxShadow: "0 0 45px rgba(190,242,100,0.14)",
  }}
>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-4 py-2 text-xs text-yellow-100 mb-4">
                <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.9)]" />
                PRODUCT COMMAND CENTER
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                商品管理システム
              </h2>
              <p className="mt-3 text-white/55 text-sm sm:text-base">
                商品画像はトリミング可能。商品カードは長押し・ドラッグで並び替えできます。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-4 min-w-[150px]">
                <p className="text-xs text-white/45">表示中の商品</p>
                <p className="text-2xl font-black text-yellow-200 mt-1">
                  {totalActive}
                </p>
              </div>

              <div className="rounded-3xl border border-green-300/20 bg-green-400/[0.08] backdrop-blur-xl px-5 py-4 min-w-[150px]">
                <p className="text-xs text-white/45">販売中</p>
                <p className="text-2xl font-black text-green-200 mt-1">
                  {totalOnSale}
                </p>
              </div>

              <div className="rounded-3xl border border-red-300/20 bg-red-400/[0.08] backdrop-blur-xl px-5 py-4 min-w-[150px]">
                <p className="text-xs text-white/45">売り切れ</p>
                <p className="text-2xl font-black text-red-200 mt-1">
                  {totalSoldOut}
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6 items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-yellow-400/15 to-transparent">
                <p className="text-xs tracking-[0.25em] text-yellow-200/80">
                  PRODUCT FORM
                </p>
                <h3 className="mt-2 text-xl font-black">
                  {mode === "edit" ? "商品を編集" : "新しい商品を追加"}
                </h3>
              </div>

              <div className="p-6 space-y-5">
                {message && (
                  <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm font-black text-yellow-100 hover:bg-yellow-300/15"
                  >
                    新規商品を入力する
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-white/55 mb-2">
                    商品名
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="例：香りとさっぱり感を楽しむ"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      タグ
                    </label>
                    <input
                      value={form.tag}
                      onChange={(e) =>
                        setForm({ ...form, tag: e.target.value })
                      }
                      placeholder="みかん / 文旦"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      単位
                    </label>
                    <select
                      value={form.unit_label}
                      onChange={(e) =>
                        setForm({ ...form, unit_label: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    >
                      <option className="bg-[#111]" value="箱">
                        箱
                      </option>
                      <option className="bg-[#111]" value="個">
                        個
                      </option>
                      <option className="bg-[#111]" value="袋">
                        袋
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/55 mb-2">
                    商品画像
                  </label>

                  <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    {form.image_url ? (
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <img
                          src={form.image_url}
                          alt=""
                          className="h-44 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 text-sm text-white/35">
                        画像未設定
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="rounded-2xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-4 py-3 text-sm font-black text-black hover:brightness-110"
                      >
                        画像を選んでトリミング
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, image_url: "" });
                          setMessage(
                            "画像を外しました。最後に商品を保存してください。"
                          );
                        }}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70 hover:bg-white/10"
                      >
                        画像を外す
                      </button>
                    </div>

                    <input
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      placeholder="画像URLを直接貼ることもできます"
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs outline-none focus:border-yellow-300/60"
                    />

                    <p className="mt-2 text-xs leading-5 text-white/35">
                      iPhoneでは「写真を撮る」「写真ライブラリ」「ファイルを選択」から画像を選べます。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      5kg価格
                    </label>
                    <input
                      value={form.price_5kg}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price_5kg: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="2500"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      10kg価格
                    </label>
                    <input
                      value={form.price_10kg}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price_10kg: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="4000"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      販売状態
                    </label>
                    <select
                      value={form.stock_status}
                      onChange={(e) =>
                        setForm({ ...form, stock_status: e.target.value })
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    >
                      <option className="bg-[#111]" value="販売中">
                        販売中
                      </option>
                      <option className="bg-[#111]" value="売り切れ">
                        売り切れ
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-white/55 mb-2">
                      表示順
                    </label>
                    <input
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sort_order: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="1"
                      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/55 mb-2">
                    説明文
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={4}
                    placeholder="商品の特徴や味を入力"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/55 mb-2">
                    注意書き
                  </label>
                  <textarea
                    value={form.notice}
                    onChange={(e) =>
                      setForm({ ...form, notice: e.target.value })
                    }
                    rows={3}
                    placeholder="配送、重量、個数などの注意書き"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
                  />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                  <span>
                    <span className="block text-sm font-bold">サイトに表示</span>
                    <span className="block text-xs text-white/45 mt-1">
                      OFFにするとお客様ページに表示しません
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="h-5 w-5"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={saveProduct}
                    disabled={saving || uploadingImage || sorting}
                    className="rounded-2xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-5 py-4 text-sm font-black text-black shadow-[0_0_35px_rgba(250,204,21,0.25)] hover:brightness-110 disabled:opacity-50"
                  >
                    {saving
                      ? "保存中..."
                      : mode === "edit"
                      ? "更新する"
                      : "追加する"}
                  </button>

                  <button
                    onClick={resetForm}
                    disabled={saving || uploadingImage || sorting}
                    className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white/75 hover:bg-white/10 disabled:opacity-50"
                  >
                    リセット
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] backdrop-blur-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.25em] text-green-200/80">
                      PRODUCT LIST
                    </p>
                    <h3 className="mt-2 text-xl font-black">登録商品一覧</h3>
                    <p className="mt-2 text-xs text-white/40">
                      PCは「並び替え」をドラッグ。iPhoneは「並び替え」を長押しして動かします。
                    </p>
                  </div>

                  <button
                    onClick={loadProducts}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/10"
                  >
                    再読み込み
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  {loading ? (
                    <div className="rounded-3xl border border-white/10 bg-black/20 px-6 py-10 text-center text-white/50">
                      読み込み中...
                    </div>
                  ) : activeProducts.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-black/20 px-6 py-10 text-center text-white/50">
                      表示中の商品はありません。
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={activeProducts.map((product) => product.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                          {activeProducts.map((product) => (
                            <SortableProductCard
                              key={product.id}
                              product={product}
                              onEdit={editProduct}
                              onHide={hideProduct}
                              onRemoveImage={removeProductImageDirect}
                              disabled={saving || sorting}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </div>

              {hiddenProducts.length > 0 && (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6">
                  <h3 className="text-sm font-black text-white/70 mb-4">
                    削除済み・非表示の商品
                  </h3>

                  <div className="space-y-3">
                    {hiddenProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
                      >
                        <div>
                          <p className="font-bold text-white/70">
                            {product.name}
                          </p>
                          <p className="text-xs text-white/35 mt-1">
                            {product.tag} / {product.stock_status}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            disabled={saving || sorting}
                            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:bg-white/10 disabled:opacity-50"
                          >
                            再編集
                          </button>

                          <button
                            onClick={() => restoreProduct(product)}
                            disabled={saving || sorting}
                            className="rounded-xl border border-green-300/20 bg-green-400/10 px-4 py-2 text-xs font-black text-green-100 hover:bg-green-400/20 disabled:opacity-50"
                          >
                            復活
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
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
              <h2 className="text-lg font-black">商品画像をトリミング</h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setCropModalOpen(false);
                setImageSrc(null);
              }}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-white/80"
            >
              閉じる
            </button>
          </div>

          <div className="relative flex-1">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
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
                  className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 disabled:opacity-50"
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  onClick={uploadCroppedImage}
                  disabled={uploadingImage}
                  className="rounded-2xl bg-gradient-to-r from-yellow-300 to-yellow-500 px-5 py-4 text-sm font-black text-black disabled:opacity-50"
                >
                  {uploadingImage ? "アップロード中..." : "この画像で決定"}
                </button>
              </div>

              <p className="mt-3 text-xs text-white/35 leading-5">
                商品ページにきれいに表示されるよう、4:3の横長比率で切り抜きます。
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}