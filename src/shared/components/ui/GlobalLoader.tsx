import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Đang chuẩn bị không gian học tập...",
  "Tải dữ liệu bài giảng...",
  "Kết nối hệ thống AI...",
  "Sắp hoàn tất..."
];

export function GlobalLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        {/* MindHub SVG Animation (Puzzle/Blocks assembling) */}
        <div className="relative w-24 h-24 mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Top Right Block */}
            <motion.path
              d="M55 20 H80 V45 H67.5 V32.5 H55 V20 Z"
              fill="currentColor"
              className="text-primary"
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0], 
                x: [20, 0, 0, 20, 20], 
                y: [-20, 0, 0, -20, -20]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.8, 1, 1] }}
            />
            {/* Bottom Right Block */}
            <motion.path
              d="M55 55 H80 V80 H55 V55 Z"
              fill="currentColor"
              className="text-primary/70"
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0], 
                x: [20, 0, 0, 20, 20], 
                y: [20, 0, 0, 20, 20]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0.1, 0.3, 0.7, 0.9, 1] }}
            />
            {/* Bottom Left Block */}
            <motion.path
              d="M20 55 H45 V80 H32.5 V67.5 H20 V55 Z"
              fill="currentColor"
              className="text-primary"
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0], 
                x: [-20, 0, 0, -20, -20], 
                y: [20, 0, 0, 20, 20]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0.2, 0.4, 0.6, 0.8, 1] }}
            />
            {/* Top Left Block */}
            <motion.path
              d="M20 20 H45 V45 H20 V20 Z"
              fill="currentColor"
              className="text-amber-500"
              initial={{ opacity: 0, x: -20, y: -20 }}
              animate={{ 
                opacity: [0, 1, 1, 0, 0], 
                x: [-20, 0, 0, -20, -20], 
                y: [-20, 0, 0, -20, -20]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0.3, 0.5, 0.5, 0.7, 1] }}
            />
            {/* Center Connect */}
            <motion.rect
              x="45" y="45" width="10" height="10"
              fill="currentColor"
              className="text-amber-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 0, 1, 1, 0], opacity: [0, 0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.5, 0.5, 1] }}
            />
          </svg>
        </div>

        {/* Text Animation */}
        <div className="h-8 relative w-64 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-sm font-medium text-muted-foreground text-center absolute w-full"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
