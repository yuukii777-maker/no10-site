/* eslint-disable @next/next/no-img-element */
"use client";

export default function Stage3DFrozen() {
  return (
    <>
      <div className="stage" aria-hidden="true">
        {/* 背景：自然な白〜ごく淡いグレー */}
        <div className="bg" />
        {/* 左右の霧（/portal の fog/smoke を使用） */}
        <img className="fog fog-l" src="/portal/fog_soft.png" alt="" />
        <img className="fog fog-r" src="/portal/fog_soft.png" alt="" />
        <img className="smoke smoke-l" src="/portal/smoke_light.png" alt="" />
        <img className="smoke smoke-r" src="/portal/smoke_light.png" alt="" />
      </div>

      <style jsx>{`
        .stage{ position:fixed; inset:0; z-index:7; pointer-events:none; overflow:hidden; }
        .bg{
          position:absolute; inset:0;
          background:
            radial-gradient(140% 90% at 50% 30%, #ffffff, #f4f6f9 60%, #e9eef5 100%);
        }
        .fog, .smoke{
          position:absolute; top:50%; transform:translateY(-50%);
          filter: blur(0.6px) saturate(1.02);
          opacity:.55; mix-blend-mode:screen; animation: float 16s ease-in-out infinite;
        }
        .fog-l{ left:-8%; width:46vw; animation-delay: -2s; }
        .fog-r{ right:-8%; width:46vw; animation-delay: -6s; }
        .smoke{ opacity:.38; }
        .smoke-l{ left:2%; width:38vw; animation-delay: -9s; }
        .smoke-r{ right:2%; width:38vw; animation-delay: -12s; }
        @keyframes float{ 0%{ transform:translateY(-52%) } 50%{ transform:translateY(-48%) } 100%{ transform:translateY(-52%) } }
        @media (max-width: 960px){
          .fog-l,.fog-r{ width:60vw }
          .smoke-l,.smoke-r{ width:52vw }
        }
      `}</style>
    </>
  );
}
