"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef(null);
  const barRef = useRef(null);
  const pegRef = useRef(null);
  const timerRef = useRef(null);
  const finishTimeoutRef = useRef(null);
  const isFirstMount = useRef(true);
  const currentProgress = useRef(0);

  const setBarWidth = (percent) => {
    currentProgress.current = percent;
    if (barRef.current) {
      barRef.current.style.width = `${percent}%`;
    }
    if (pegRef.current) {
      pegRef.current.style.right = `${100 - percent}%`;
      pegRef.current.style.opacity = percent < 100 ? "0.9" : "0";
    }
  };

  const start = () => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (containerRef.current) {
      containerRef.current.style.opacity = "1";
    }
    setBarWidth(15);

    timerRef.current = setInterval(() => {
      const cur = currentProgress.current;
      if (cur < 60) {
        setBarWidth(cur + Math.random() * 10 + 4);
      } else if (cur < 85) {
        setBarWidth(cur + Math.random() * 4 + 1);
      } else if (cur < 96) {
        setBarWidth(cur + 0.3);
      }
    }, 150);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setBarWidth(100);

    finishTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0";
      }
      setTimeout(() => {
        setBarWidth(0);
      }, 300);
    }, 200);
  };

  // Route change completion listener (runs asynchronously after route has mounted/rendered)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    finish();
  }, [pathname, searchParams]);

  // Intercept all link clicks and history pushState/replaceState
  useEffect(() => {
    const handleAnchorClick = (e) => {
      try {
        const target = e.target.closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (
          !href ||
          href.startsWith("#") ||
          href.startsWith("javascript:") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        )
          return;
        if (target.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        const currentUrl = new URL(window.location.href);
        const nextUrl = new URL(href, window.location.href);

        if (currentUrl.pathname !== nextUrl.pathname || currentUrl.search !== nextUrl.search) {
          start();
        }
      } catch (err) {
        // Ignore invalid URLs
      }
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      start();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      start();
      return originalReplaceState.apply(this, args);
    };

    const handlePopState = () => {
      start();
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "3px",
        zIndex: 99999999,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.25s ease-out",
      }}
    >
      {/* Active Glowing Progress Line */}
      <div
        ref={barRef}
        style={{
          height: "100%",
          width: "0%",
          background: "linear-gradient(90deg, #f3a833 0%, #ffd700 60%, #f59e0b 100%)",
          boxShadow: "0 0 14px rgba(243, 168, 51, 0.9), 0 0 6px #f3a833",
          transition: "width 0.25s cubic-bezier(0.1, 0.05, 0.25, 1)",
          borderRadius: "0 2px 2px 0",
        }}
      />
      {/* Trailing Glow Peg */}
      <div
        ref={pegRef}
        style={{
          position: "absolute",
          top: 0,
          right: "100%",
          width: "100px",
          height: "100%",
          boxShadow: "0 0 16px #f3a833, 0 0 8px #ffd700",
          opacity: 0,
          transform: "rotate(3deg) translate(0px, -4px)",
          pointerEvents: "none",
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}

export default function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
