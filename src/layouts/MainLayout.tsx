import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CategoryFilterBar from "@/components/CategoryFilterBar";
import FooterLegal from "@/components/FooterLegal";
import { useState } from "react";

export default function MainLayout() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-800 selection:bg-[#8b5e3c] selection:text-white">
      <Navbar />
      <CategoryFilterBar 
        categories={["All", "Development", "Design", "Marketing", "Business"]} 
        activeCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <FooterLegal onClose={() => {}} />
    </div>
  );
}
