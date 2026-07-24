import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/layouts/Navbar";
import Footer from "@/layouts/Footer";
import FooterLegal from "@/layouts/FooterLegal";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-800 selection:bg-[#8b5e3c] selection:text-white relative">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
