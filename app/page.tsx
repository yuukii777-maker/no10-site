/* ===========================
   SEO（サーバーコンポーネント）
=========================== */
export const metadata = {
  title: "山川みかん農園｜北原早生・訳あり100円みかん",
  description:
    "福岡県みやま市山川町の山川みかん農園。北原早生を中心に、自然の恵みを生かした丁寧な栽培で、甘味・香りの強いみかんを育てています。無人販売で訳あり100円みかんも提供。",
};

import HomeClient from "./HomeClient";

export default function Page() {
  return <HomeClient />;
}
