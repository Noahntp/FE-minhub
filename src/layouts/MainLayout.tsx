import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/layouts/Navbar";
import Footer from "@/layouts/Footer";
import { TrialPreviewModal } from "@/components/common/TrialPreviewModal";
import { AiRoadmapModal } from "@/components/common/AiRoadmapModal";

export default function MainLayout() {
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
