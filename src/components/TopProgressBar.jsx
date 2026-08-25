"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const isFirstMount = useRef(true);

  const startProgress = () => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + Math.random() * 12 + 4;
        if (prev < 85) return prev + Math.random() * 5 + 1;
        if (prev < 95) return prev + 0.5;
        return prev;
      });
    }, 150);
  };

  const finishProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 300);
    }, 250);
  };

  // Expose global controller for manual triggers (e.g. from axios or custom actions)
  useEffect(() => {
    window.__startTopLoader = startProgress;
    window.__finishTopLoader = finishProgress;
    return () => {
      delete window.__startTopLoader;
      delete window.__finishTopLoader;
    };
  }, []);

  // Finish progress when route finishes rendering
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    finishProgress();
  }, [pathname, searchParams]);

  // Intercept all link clicks and history pushState/replaceState
  useEffect(() => {
    const handleAnchorClick = (e) => {
      try {
        const target = e.target.closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
        if (target.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        const currentUrl = new URL(window.location.href);
        const nextUrl = new URL(href, window.location.href);

        // If navigating to a different pathname/search
        if (currentUrl.pathname !== nextUrl.pathname || currentUrl.search !== nextUrl.search) {
          startProgress();
        }
      } catch (err) {
        // Ignore invalid URLs
      }
    };

    // Monkey-patch pushState & replaceState so router.push() triggers the loader instantly
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      startProgress();
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      startProgress();
      return originalReplaceState.apply(this, args);
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "3px",
        zIndex: 99999999,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    >
      {/* Active Glowing Progress Bar */}
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #f3a833 0%, #ffd700 60%, #f59e0b 100%)",
          boxShadow: "0 0 14px rgba(243, 168, 51, 0.9), 0 0 6px #f3a833",
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s ease-out" : "width 0.3s cubic-bezier(0.1, 0.05, 0.25, 1)",
          opacity: visible ? 1 : 0,
          borderRadius: "0 2px 2px 0",
        }}
      />
      {/* Trailing Glow Peg */}
      {visible && progress < 100 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: `${100 - progress}%`,
            width: "100px",
            height: "100%",
            boxShadow: "0 0 16px #f3a833, 0 0 8px #ffd700",
            opacity: 0.8,
            transform: "rotate(3deg) translate(0px, -4px)",
            pointerEvents: "none",
          }}
        />
      )}
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
