"use client";

export default function Loading() {
  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-white/75 backdrop-blur-sm
      "
    >
      <div className="flex flex-col items-center gap-4">
        {/* スピナー */}
        <div
          className="
            w-10 h-10
            border-[3px] border-orange-200
            border-t-orange-500
            rounded-full
            animate-spin
          "
        />

        {/* テキスト */}
        <p className="text-sm text-gray-600 tracking-wide">
          読み込み中…
        </p>
      </div>
    </div>
  );
}
