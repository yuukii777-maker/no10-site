// app/components/BaseBoot.tsx
'use client';

import { useEffect } from 'react';

export default function BaseBoot() {
  // iOS 100vh 対策
  useEffect(() => {
    const setVH = () => {
      const vh = Math.max(1, window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH, { passive: true });
    window.addEventListener('orientationchange', setVH, { passive: true });
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return null;
}
