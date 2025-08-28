// app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import AudioController from "./components/AudioController";

// もし以前に metadata / viewport を定義していた場合は、下の2つを戻して使ってOKです。
// export const metadata = { title: "VOLCE", description: "..." };
// export const viewport = { themeColor: "#0a101a" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        {/* 画面UIは出さず、初回タップ/クリック後に静かに再生（iOS制限回避 & プリロード0） */}
        <AudioController src="/audio/megami.mp3" volume={0.55} startOnFirstInput />
      </body>
    </html>
  );
}
