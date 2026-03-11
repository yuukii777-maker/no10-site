"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import SubFlash from "../../components/SubFlash"; // ★修正：正しい相対パス（二階層上）

function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShow(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "will-change-transform transition-[opacity,transform,filter] duration-700 ease-out",
        show ? "translate-y-0 opacity-100 blur-0" : "opacity-0 blur-[4px]",
        className,
      ].join(" ")}
      style={
        {
          transitionDelay: `${delay}ms`,
          transform: show ? "translateY(0px)" : `translateY(${y}px)`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

function ParallaxImage({
  src,
  alt,
  speed = 0.08,
  scrollY,
  className = "",
  overlayClassName = "",
  priority = false,
  objectPosition = "50% 50%",
}: {
  src: string;
  alt: string;
  speed?: number;
  scrollY: number;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  const shift = Math.min(scrollY * speed, 80);

  return (
    <div className={["absolute inset-0", className].join(" ")}>
      <div
        className="absolute inset-0 scale-[1.08] will-change-transform"
        style={{ transform: `translateY(${shift}px) scale(1.08)` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          style={{ objectPosition }}
        />
      </div>
      {overlayClassName ? <div className={overlayClassName} /> : null}
    </div>
  );
}

function InfoCard({
  title,
  text,
  delay = 0,
}: {
  title: string;
  text: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-[26px] border border-[#ecd9bf] bg-white/92 p-5 shadow-[0_12px_34px_rgba(106,72,20,0.07)] backdrop-blur-sm">
        <h3 className="text-[17px] font-bold text-[#2f2a24]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#62584f]">{text}</p>
      </div>
    </Reveal>
  );
}

export default function AboutClient() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroShift = Math.min(scrollY * 0.16, 60);

  return (
    <main className="overflow-x-hidden bg-[#fffaf4] text-[#2f2a24]">
      {/* ============================= */}
      {/* ヒーロー */}
      {/* ============================= */}
      <section className="relative isolate min-h-[80svh] overflow-hidden">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${heroShift}px)` }}
        >
          <Image
            src="/mikan/farm.png"
            alt="農園の風景"
            fill
            priority
            className="object-cover object-center brightness-[0.76]"
          />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(255,184,84,0.20),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(255,235,196,0.10),transparent_26%),linear-gradient(to_bottom,rgba(24,15,8,0.18),rgba(24,15,8,0.62))]" />
        <div className="absolute inset-0 bg-black/10" />

        <div className="pointer-events-none absolute -left-10 top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl animate-[floatY_8s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute right-[-2rem] top-[28%] h-52 w-52 rounded-full bg-[#ffb54a]/15 blur-3xl animate-[floatY_10s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute left-[16%] top-[22%] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.9)] animate-pulse" />
        <div className="pointer-events-none absolute left-[44%] top-[16%] h-2 w-2 rounded-full bg-[#ffe5b9]/70 shadow-[0_0_20px_rgba(255,229,185,0.9)] animate-pulse" />
        <div className="pointer-events-none absolute right-[18%] top-[20%] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_18px_rgba(255,255,255,0.9)] animate-pulse" />

        <div className="relative z-10 mx-auto flex min-h-[80svh] max-w-6xl flex-col justify-center px-6 py-20 text-white">
          <Reveal className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] text-white/95 backdrop-blur-sm md:text-xs">
              山口農園
            </span>
          </Reveal>

          <Reveal delay={80} className="mt-5 max-w-5xl">
            <h1 className="text-[38px] font-bold leading-[1.05] drop-shadow-[0_12px_30px_rgba(0,0,0,0.26)] sm:text-5xl md:text-7xl">
              自然と手間を重ねて、
              <br className="hidden sm:block" />
              “毎年おいしい”を育てる農園です。
            </h1>
          </Reveal>

          <Reveal delay={150} className="mt-6 max-w-2xl">
            <p className="text-sm leading-7 text-white/92 sm:text-base md:text-lg md:leading-8">
              山川の気候と土、そして夫婦ふたりの地道な手作業。
              贈答用の正規品から、ご家庭でたっぷり楽しめる訳あり品まで、
              その時期にいちばん良い状態でお届けしています。
            </p>
          </Reveal>

          <Reveal
            delay={230}
            className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/95"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              脱サラ就農：2023年4月
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              贈答品・訳あり品を販売
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
              旬のお知らせはメルマガで配信
            </div>
          </Reveal>

          <Reveal delay={310} className="mt-12">
            <div className="flex items-center gap-3 text-white/80">
              <span className="h-px w-12 bg-white/50" />
              <span className="text-xs tracking-[0.2em]">SCROLL</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= */}
      {/* ごあいさつ */}
      {/* ============================= */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fff2df] to-transparent" />
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
            <Reveal>
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
                  ごあいさつ
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                  毎年あたりまえに、
                  <br className="hidden sm:block" />
                  おいしいと言ってもらうために。
                </h2>

                <div className="mt-7 space-y-5 text-[15px] leading-8 text-[#5f554d] sm:text-base">
                  <p>お問い合わせありがとうございます。</p>
                  <p>
                    私たち夫婦は2023年3月で脱サラし、同年4月よりみかん農家として新規就農しました。
                    現在の第1次産業において最大の課題は
                    <strong className="font-semibold text-[#2f2a24]">地球温暖化</strong>
                    です。わがみかん農園でも、樹の仕立て・樹勢強化・土づくりを中心に、
                    気候の振れ幅に負けない畑づくりに取り組んでいます。
                  </p>
                  <p>
                    「毎年あたりまえに“おいしい”と言っていただけるみかんを届ける」—
                    そのあたりまえを守るために、夫婦で力を合わせて小さな改善を積み重ねています。
                    当サイトでは、
                    <strong className="font-semibold text-[#2f2a24]">贈答品（正規品）</strong>
                    と
                    <strong className="font-semibold text-[#2f2a24]">訳あり品（小玉・キズあり）</strong>
                    を中心に販売しています。
                  </p>
                  <p>
                    畑の様子や収穫期のお知らせは、
                    <strong className="font-semibold text-[#2f2a24]">メルマガ</strong>
                    でもお届けします。ぜひ季節の便りをお受け取りください。
                  </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-[#ead7bc] bg-white/90 p-5 shadow-[0_12px_34px_rgba(106,72,20,0.07)]">
                    <div className="text-xs font-semibold tracking-[0.18em] text-[#b66a18]">
                      START
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#62584f]">
                      2023年4月から新規就農
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ead7bc] bg-white/90 p-5 shadow-[0_12px_34px_rgba(106,72,20,0.07)]">
                    <div className="text-xs font-semibold tracking-[0.18em] text-[#b66a18]">
                      POLICY
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#62584f]">
                      土づくり・樹勢強化を重視
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ead7bc] bg-white/90 p-5 shadow-[0_12px_34px_rgba(106,72,20,0.07)]">
                    <div className="text-xs font-semibold tracking-[0.18em] text-[#b66a18]">
                      PRODUCT
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#62584f]">
                      贈答品から訳あり品まで対応
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="grid grid-cols-12 gap-4">
                <div className="relative col-span-12 overflow-hidden rounded-[30px] border border-[#ecd8bf] bg-white shadow-[0_18px_48px_rgba(106,72,20,0.10)]">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src="/mikan/mikan_tree_fruit.png"
                      alt="木になっているみかん"
                      fill
                      className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#7f4f1a] shadow-sm">
                      農園の風景
                    </div>
                  </div>
                </div>

                <div className="relative col-span-6 overflow-hidden rounded-[26px] border border-[#ecd8bf] bg-white shadow-[0_16px_42px_rgba(106,72,20,0.08)]">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/mikan/mikan_hand_harvest.png"
                      alt="手に持ったみかん"
                      fill
                      className="object-cover object-center transition-transform duration-700 hover:scale-[1.04]"
                    />
                  </div>
                </div>

                <div className="relative col-span-6 overflow-hidden rounded-[26px] border border-[#ecd8bf] bg-white shadow-[0_16px_42px_rgba(106,72,20,0.08)]">
                  <div className="relative aspect-[4/5]">
                    <Image
                      src="/mikan/mikan_cross_section.png"
                      alt="みかんの断面"
                      fill
                      className="object-cover object-center transition-transform duration-700 hover:scale-[1.04]"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* メルマガ登録フォーム */}
          <Reveal delay={120} className="mt-12">
            <div className="overflow-hidden rounded-[34px] border border-[#f0ddc7] bg-[linear-gradient(135deg,#fff8ef_0%,#ffffff_44%,#fff1d8_100%)] shadow-[0_18px_56px_rgba(106,72,20,0.10)]">
              <div className="grid gap-8 px-6 py-7 md:grid-cols-[0.98fr_1.02fr] md:px-8 md:py-8">
                <div>
                  <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
                    メルマガ登録
                  </p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight md:text-3xl">
                    旬の時期や販売開始を、
                    <br className="hidden sm:block" />
                    いち早くお届けします。
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#63584f] sm:text-[15px]">
                    出荷開始のお知らせ、直売所の最新情報、畑の様子などをやさしく配信しています。
                    みかんの時期を逃したくない方は、ぜひご登録ください。
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-[#7a6b5d]">
                    <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                      販売開始のお知らせ
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                      直売所の最新情報
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">
                      畑の近況
                    </span>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/90 bg-white/92 p-4 shadow-[0_12px_34px_rgba(106,72,20,0.08)] sm:p-5">
                  <form
                    action="/api/subscribe"
                    method="POST"
                    className="flex flex-col gap-3"
                  >
                    <label className="text-sm font-semibold text-[#473f38]">
                      メールアドレス
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      className="h-12 w-full rounded-2xl border border-[#ead8c1] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#d98d2a] focus:ring-4 focus:ring-[#ffcc87]/30"
                    />
                    <input type="hidden" name="source" value="about_page" />
                    <button className="mt-1 h-12 rounded-2xl bg-[#d97c1f] px-5 font-semibold text-white shadow-[0_12px_24px_rgba(217,124,31,0.30)] transition hover:-translate-y-0.5 hover:bg-[#c96f15]">
                      メルマガ登録
                    </button>
                  </form>
                  <p className="mt-3 text-xs leading-6 text-[#7a6b5d]">
                    登録は無料・いつでも解除できます（配信メール末尾のリンクから1クリック停止）。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= */}
      {/* 土づくり */}
      {/* ============================= */}
      <section className="relative overflow-hidden bg-[#fff6ea]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fff8f0] to-transparent" />
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <div className="relative overflow-hidden rounded-[34px] border border-[#ebd7bb] bg-white shadow-[0_18px_50px_rgba(106,72,20,0.10)]">
                <div className="grid gap-4 p-4 sm:grid-cols-[1.08fr_0.92fr]">
                  <div className="relative overflow-hidden rounded-[26px]">
                    <div className="relative h-[380px] sm:h-[420px]">
                      <Image
                        src="/mikan/fertilizing_work.png"
                        alt="肥料やりの作業風景"
                        fill
                        className="object-cover object-[52%_32%] transition-transform duration-700 hover:scale-[1.04]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="relative overflow-hidden rounded-[22px]">
                      <div className="relative aspect-[1/1]">
                        <Image
                          src="/mikan/fertilizer_mix.png"
                          alt="肥料の準備"
                          fill
                          className="object-cover object-[50%_56%] transition-transform duration-700 hover:scale-[1.05]"
                        />
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-[#f0e3d1] bg-[#fffaf4] p-5">
                      <div className="text-xs font-semibold tracking-[0.18em] text-[#b66a18]">
                        土づくり
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[#62584f]">
                        樹の状態や季節の変化を見ながら、必要な栄養を丁寧に与えています。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal delay={70}>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
                  土づくり
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                  おいしさの土台は、
                  <br className="hidden sm:block" />
                  毎日の畑づくりから。
                </h2>
              </Reveal>

              <Reveal delay={120} className="mt-6">
                <p className="text-[15px] leading-8 text-[#5f554d] sm:text-base">
                  みかんの味は、実がつく時期だけで決まるわけではありません。
                  樹をどう育てるか、土の状態をどう整えるかが、翌年以降の味にもつながります。
                  私たちは土づくり・樹勢強化・畑の管理を大切にし、
                  気候の振れ幅に負けない木を育てることを目指しています。
                </p>
              </Reveal>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <InfoCard
                  delay={160}
                  title="土壌環境を整える"
                  text="木がしっかり力を出せるよう、畑の土壌環境を丁寧に整えています。"
                />
                <InfoCard
                  delay={220}
                  title="樹勢を守る"
                  text="その年だけでなく、先の収穫も見据えて樹の元気を保つことを大切にしています。"
                />
                <InfoCard
                  delay={280}
                  title="気候の変化に備える"
                  text="暑さや雨量の変化に負けない畑づくりを意識し、日々改善を重ねています。"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 山川の環境 */}
      {/* ============================= */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Reveal className="text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
              山川の環境
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">
              山川がみかんに向く理由
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#5f554d] sm:text-base">
              山川町は日当たり・水はけの良い傾斜がそろった、
              みかん栽培に適した地域です。自然条件の良さが、
              香りと甘さのある実を育てます。
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <InfoCard
              delay={0}
              title="自然が運ぶ恵み"
              text="自然の空気や環境が、みかんの香りと味わいを引き立てます。"
            />
            <InfoCard
              delay={70}
              title="日当たりの良い畑"
              text="しっかり光を浴びることで、果肉の甘さとコクが育まれます。"
            />
            <InfoCard
              delay={140}
              title="水はけの良い傾斜地"
              text="余分な水分が残りにくく、味の濃いみかんが育ちやすい環境です。"
            />
          </div>

          <Reveal delay={120} className="mt-8">
            <div className="relative overflow-hidden rounded-[34px] border border-[#ecd8bf] bg-white shadow-[0_18px_52px_rgba(106,72,20,0.10)]">
              <div className="relative h-[300px] sm:h-[360px] md:h-[420px]">
                <ParallaxImage
                  src="/mikan/mikan_tree_fruit.png"
                  alt="山川の畑のみかん"
                  scrollY={scrollY}
                  speed={0.05}
                  objectPosition="50% 50%"
                  overlayClassName="absolute inset-0 bg-gradient-to-t from-black/22 via-black/0 to-transparent"
                />
                <div className="absolute left-4 bottom-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#8a561b] shadow-sm">
                  自然の中で育つみかん
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================= */}
      {/* 手作業 */}
      {/* ============================= */}
      <section className="relative overflow-hidden bg-[#fff6ea]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <Reveal className="order-2 lg:order-1">
              <div className="rounded-[34px] border border-[#ebd7bb] bg-white/92 p-6 shadow-[0_18px_50px_rgba(106,72,20,0.09)] sm:p-7">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
                  手作業
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                  ひとつひとつ、
                  <br className="hidden sm:block" />
                  丁寧な手作業で。
                </h2>
                <p className="mt-6 text-[15px] leading-8 text-[#5f554d] sm:text-base">
                  みかんは生き物。木の状態・日差し・熟度を見ながら、
                  その時の最適なタイミングを見極めています。
                  手をかける部分を省かず、ひとつずつ丁寧に向き合うことが、
                  安定したおいしさにつながると考えています。
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-[#ecd8bf] bg-[#fffaf4] p-5">
                    <h3 className="text-lg font-bold text-[#2f2a24]">熟度の見極め</h3>
                    <p className="mt-2 text-sm leading-7 text-[#62584f]">
                      熟しすぎる前に、甘味が最も乗ったタイミングで収穫します。
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-[#ecd8bf] bg-[#fffaf4] p-5">
                    <h3 className="text-lg font-bold text-[#2f2a24]">実を傷つけない収穫</h3>
                    <p className="mt-2 text-sm leading-7 text-[#62584f]">
                      実を傷つけないよう、手作業で一つひとつ丁寧に扱っています。
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100} className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-[34px] border border-[#ebd7bb] bg-white shadow-[0_18px_50px_rgba(106,72,20,0.10)]">
                <div className="relative h-[380px] sm:h-[480px]">
                  <Image
                    src="/mikan/hand.png"
                    alt="実際に手作業をしている様子"
                    fill
                    className="object-cover object-[52%_38%] transition-transform duration-700 hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/28 via-black/0 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#87531a] shadow-sm">
                    実際の作業風景
                  </div>
                  <div className="absolute right-4 bottom-4 max-w-[240px] rounded-2xl border border-white/40 bg-white/12 px-4 py-3 text-sm leading-6 text-white backdrop-blur-sm">
                    日々の積み重ねが、最終的な味と品質につながります。
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* お届け */}
      {/* ============================= */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
                  お届けについて
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
                  ご注文後は、
                  <br className="hidden sm:block" />
                  丁寧に箱詰めしてお届け。
                </h2>
                <p className="mt-6 text-[15px] leading-8 text-[#5f554d] sm:text-base">
                  ご家庭で開けた瞬間に安心していただけるよう、
                  一箱ずつ状態を見ながら箱詰めしています。
                  農家直送ならではの距離感で、できるだけ良い状態のままお届けできるよう心がけています。
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <InfoCard
                    delay={140}
                    title="農家直送"
                    text="畑からお客様へ、できるだけ新鮮な状態でお届けします。"
                  />
                  <InfoCard
                    delay={210}
                    title="状態を確認"
                    text="箱詰めの際も、見た目や状態をひとつずつ確認しています。"
                  />
                  <InfoCard
                    delay={280}
                    title="季節の便り"
                    text="箱を開けたときに、農園の温度感も伝わるよう心がけています。"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="grid gap-4">
                <div className="relative overflow-hidden rounded-[34px] border border-[#ecd8bf] bg-white shadow-[0_18px_52px_rgba(106,72,20,0.10)]">
                  <div className="relative h-[320px] sm:h-[360px]">
                    <Image
                      src="/mikan/mikan_shipping_box.png"
                      alt="発送するみかんの箱詰め例"
                      fill
                      className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                  <div className="relative overflow-hidden rounded-[26px] border border-[#ecd8bf] bg-white shadow-[0_16px_42px_rgba(106,72,20,0.08)]">
                    <div className="relative h-[200px] sm:h-full sm:min-h-[210px]">
                      <Image
                        src="/mikan/mikan_cross_section.png"
                        alt="みかんの断面"
                        fill
                        className="object-cover object-center transition-transform duration-700 hover:scale-[1.04]"
                      />
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-[#ecd8bf] bg-[linear-gradient(135deg,#fff6ea_0%,#ffffff_100%)] p-5 shadow-[0_16px_42px_rgba(106,72,20,0.08)]">
                    <div className="text-xs font-semibold tracking-[0.18em] text-[#b66a18]">
                      品質への想い
                    </div>
                    <h3 className="mt-3 text-xl font-bold leading-tight text-[#2f2a24]">
                      見た目だけでなく、
                      <br />
                      中身の満足感も大切に。
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#62584f]">
                      開けた瞬間の安心感だけでなく、食べた時に
                      「ちゃんとおいしい」と感じていただけることを大切にしています。
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 訳ありみかん */}
      {/* ============================= */}
      <section className="relative overflow-hidden bg-[#fff6ea]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <Reveal className="text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#b66a18]">
              訳ありみかん
            </p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl">
              訳あり100円みかんについて
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-8 text-[#5f554d] sm:text-base">
              傷があっても味はそのまま。
              「山川みかんを気軽に楽しんでほしい」という想いから生まれた取り組みです。
              ご自宅用として、量とおいしさを重視される方におすすめしています。
            </p>
          </Reveal>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr]">
            <Reveal>
              <div className="relative overflow-hidden rounded-[34px] border border-[#ebd7bb] bg-white shadow-[0_18px_52px_rgba(106,72,20,0.10)]">
                <div className="relative h-[300px] sm:h-[380px]">
                  <Image
                    src="/mikan/defect.png"
                    alt="訳ありみかん"
                    fill
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/0 to-transparent" />
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4">
              <InfoCard
                delay={80}
                title="見た目に個性あり"
                text="小玉・キズあり・色むらなど、見た目に個体差があるものを含みます。"
              />
              <InfoCard
                delay={150}
                title="味はご家庭用に十分"
                text="贈答向けの見た目基準から外れても、ご家庭で楽しむ分には十分おいしく食べていただけます。"
              />
              <InfoCard
                delay={220}
                title="気軽に楽しめる価格"
                text="山川みかんをもっと身近に味わっていただくために、手に取りやすい価格でご案内しています。"
              />
            </div>
          </div>
        </div>
      </section>

      <SubFlash /> {/* ★追加：?sub=ok/err/unsub に反応して中央表示 */}

      <style jsx>{`
        @keyframes floatY {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-18px);
          }
        }
      `}</style>
    </main>
  );
}