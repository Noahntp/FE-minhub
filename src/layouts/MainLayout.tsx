import React, { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/layouts/Navbar";
import Footer from "@/layouts/Footer";
import { TrialPreviewModal } from "@/components/common/TrialPreviewModal";
import { AiRoadmapModal } from "@/components/common/AiRoadmapModal";

export default function MainLayout() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname, search]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800 selection:bg-emerald-500 selection:text-white relative">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <TrialPreviewModal />
      <AiRoadmapModal />
    </div>
  );
}
