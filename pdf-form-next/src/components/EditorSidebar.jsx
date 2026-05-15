"use client";
import React, { useEffect, useState } from "react";
import { Switch, Typography, Box } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

export default function EditorSidebar({
  pages = [],
  visiblePages = [],
  activePageId = "Cover Page-0",
  pageCounts = {},
  scrollToSlide,
  pageSettings = [],
  dispatch,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarScrollRef = React.useRef(null);

  useEffect(() => {
    if (activePageId) {
      const activeName = activePageId.replace(/\s+/g, '-');
      const activeElement = document.getElementById(`sidebar-item-${activeName}`);
      if (activeElement && sidebarScrollRef.current) {
        // Calculate offset to center the item in the sidebar
        const sidebarHalfHeight = sidebarScrollRef.current.clientHeight / 2;
        const itemHalfHeight = activeElement.clientHeight / 2;
        const offsetTop = activeElement.offsetTop;

        sidebarScrollRef.current.scrollTo({
          top: offsetTop - sidebarHalfHeight + itemHalfHeight,
          behavior: "smooth"
        });
      }
    }
  }, [activePageId]);

  useEffect(() => {
    const saved = localStorage.getItem("editorSidebarCollapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("editorSidebarCollapsed", newState);
      return newState;
    });
  };

  return (
    <div
      className={`bg-[#0a0a0a] border-r border-[#f3a833]/20 flex flex-col h-full transition-all duration-300 relative group/sidebar shrink-0 ${isCollapsed ? "w-[80px]" : "w-[300px]"
        }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-[#141414] border border-[#f3a833]/50 text-[#f3a833] hover:bg-[#1f1f1f] shadow-sm rounded-full p-1 z-50 transition-transform hidden md:flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Header */}
      <div
        className={`p-4 border-b border-[#f3a833]/20 flex flex-col gap-4 transition-all ${isCollapsed ? "items-center" : ""
          }`}
      >
        {!isCollapsed ? (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight leading-none">
              Report Slides
            </span>
            <span className="text-xs text-slate-400 mt-1">Click to jump to a page</span>
          </div>
        ) : (
          <div className="w-8 h-8 p-0.5 bg-[#f3a833]/10 border border-[#f3a833]/20 rounded-xl shadow-sm shrink-0 flex items-center justify-center">
            <span className="text-[#f3a833] font-bold text-sm">HT</span>
          </div>
        )}
      </div>

      {/* Inline style to absolutely force scrollbar without caching issues */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar-scroll-forced::-webkit-scrollbar {
          width: 14px !important;
          display: block !important;
        }
        .sidebar-scroll-forced::-webkit-scrollbar-track {
          background: #0a0a0a !important;
          border-left: 1px solid rgba(243, 168, 51, 0.1) !important;
        }
        .sidebar-scroll-forced::-webkit-scrollbar-thumb {
          background-color: #f3a833 !important;
          border-radius: 7px !important;
          border: 3px solid #0a0a0a !important;
        }
        .sidebar-scroll-forced {
          scrollbar-width: thin !important;
          scrollbar-color: #f3a833 #0a0a0a !important;
        }
        `
      }} />

      {/* Navigation (Thumbnails) */}
      <div ref={sidebarScrollRef} className="flex-1 overflow-y-scroll overflow-x-hidden py-6 pl-4 pr-2 space-y-8 sidebar-scroll-forced">
        {pages.map((page) => {
          const isVisible = visiblePages.some((vp) => vp.name === page.name);
          const pageSetting = pageSettings.find((ps) => ps.name === page.name);
          const count = pageCounts[page.name] || 1;

          const elements = [];
          for (let i = 0; i < count; i++) {
            const uniqueId = `${page.name}-${i}`;
            const isActive = activePageId === uniqueId;
            const displayName = count > 1 ? `${page.name} (${i + 1})` : page.name;
            const isCloned = count > 1;

            // For A4, width is 800px, height is 1131px.
            const thumbnailWidth = isCollapsed ? 48 : 240;
            const scale = thumbnailWidth / 800;
            const thumbnailHeight = 1131 * scale;

            const getGapForPage = (name) => {
              if (name === "Payment Terms") return 1151;
              return 1171;
            };

            elements.push(
              <div key={uniqueId} id={`sidebar-item-${uniqueId.replace(/\s+/g, '-')}`} className={`relative group/navitem flex flex-col items-center transition-all duration-300 ${isActive ? "scale-[1.05] z-10" : "scale-100"}`}>

                {/* Thumbnail Container */}
                <button
                  onClick={() => isVisible && scrollToSlide(uniqueId)}
                  style={{ width: `${thumbnailWidth}px`, height: `${thumbnailHeight}px` }}
                  className={`relative rounded-xl overflow-hidden transition-all duration-300 border-[3px] cursor-pointer ${!isVisible
                    ? "opacity-40 border-slate-800 bg-[#141414]/50"
                    : isActive
                      ? "border-[#f3a833] shadow-[0_0_25px_rgba(243,168,51,0.4)] ring-4 ring-[#f3a833]/20"
                      : "border-slate-700 bg-[#141414] hover:border-slate-500 opacity-60 hover:opacity-100"
                    }`}
                >
                  {/* Inner scaler box */}
                  <div
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{
                      width: "800px",
                      transform: `scale(${scale}) translateY(-${i * getGapForPage(page.name)}px)`,
                      transformOrigin: "top left",
                      textAlign: "left",
                    }}
                  >
                    {page.editor && page.editor(true, false)}
                  </div>

                  {/* Status Indicator when collapsed */}
                  {isCollapsed && isVisible && (
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#f3a833] rounded-full border-2 border-[#0a0a0a] z-10" />
                  )}
                </button>

                {/* Text Label Below Thumbnail */}
                {!isCollapsed && (
                  <div className="w-full flex flex-col mt-3 px-1 gap-1">
                    <div className="flex items-center justify-between min-w-0">
                      <span className={`font-bold text-sm truncate transition-colors ${isActive ? 'text-[#f3a833]' : 'text-slate-400'}`}>
                        {displayName}
                      </span>
                    </div>

                    {/* Inclusion Toggle - right aligned below thumbnail (only on first cloned page) */}
                    {pageSetting && i === 0 && (
                      <div className="flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Include</span>
                        <Switch
                          size="small"
                          checked={pageSetting.state ?? true}
                          onChange={(e) => {
                            e.stopPropagation();
                            dispatch(pageSetting.action());
                          }}
                          sx={{
                            "& .MuiSwitch-switchBase": { color: "#cbd5e1" },
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#f3a833",
                              "& + .MuiSwitch-track": { backgroundColor: "#f3a833", opacity: 0.5 },
                            },
                            "& .MuiSwitch-track": { backgroundColor: "#e2e8f0" }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1.5 bg-[#141414] border border-[#f3a833]/20 text-white text-xs font-semibold rounded-md shadow-md opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all z-50 whitespace-nowrap pointer-events-none flex items-center gap-2">
                    {displayName}
                    {!isVisible && <span className="text-slate-400 text-[10px] uppercase">(Hidden)</span>}
                  </div>
                )}
              </div>
            );
          }
          return elements;
        })}
      </div>
    </div>
  );
}
