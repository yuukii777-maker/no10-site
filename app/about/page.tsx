/* ===========================
   SEO（サーバーコンポーネント）
=========================== */
export const metadata = {
  title: "山川みかん農園｜農園について",
  description:
    "福岡県みやま市山川町で育つ山川みかん。自然環境と丁寧な栽培により、甘味・香りの強い高品質なみかんを育てています。農園のこだわりと様子をご紹介します。",
};

import AboutClient from "./AboutClient";

export default function Page() {
  return <AboutClient />;
}
