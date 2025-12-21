/* ===========================
   SEO（サーバーコンポーネント）
=========================== */
export const metadata = {
  title: "農園について｜山川みかん農園",
  description:
    "山川みかん農園の紹介ページ。自然豊かな山川町で、北原早生を中心に丁寧な栽培を行っています。",
};

import AboutClient from "./AboutClient";

export default function Page() {
  return <AboutClient />;
}
