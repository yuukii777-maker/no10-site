/* ===========================
   SEO（サーバーコンポーネント）
=========================== */
export const metadata = {
  title: "山川みかん農園｜北原早生・訳あり100円みかん",
  description:
    "福岡県みやま市山川町の山川みかん農園。旬の甘さをそのままに、無人販売による訳あり100円みかんや正規品などをお届けします。",
};

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}
