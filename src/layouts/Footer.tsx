import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#8b5e3c] p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#8b5e3c]">
            MindHub
          </span>
        </div>
        <div className="text-sm text-stone-500 text-center md:text-right">
          &copy; {new Date().getFullYear()} MindHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
