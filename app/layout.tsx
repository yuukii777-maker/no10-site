// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import NavBar from "./components/NavBar";
import LoadingOverlay from "./components/LoadingOverlay";
import BaseBoot from "./components/BaseBoot";

export const metadata: Metadata = {
  title: "VOLCE",
  description: "VOLCE Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <BaseBoot />
        <LoadingOverlay />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
