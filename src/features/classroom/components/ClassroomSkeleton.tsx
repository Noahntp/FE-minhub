import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ClassroomSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans animate-fade-in">
      {/* Header Skeleton */}
      <header className="h-14 shrink-0 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-md bg-slate-800" />
          <Skeleton className="w-48 h-5 bg-slate-800 hidden sm:block" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 mr-4">
            <Skeleton className="w-20 h-4 bg-slate-800" />
            <Skeleton className="w-32 h-1.5 rounded-full bg-slate-800" />
          </div>
          <Skeleton className="w-24 h-9 rounded-md bg-slate-800" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video & Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="w-full bg-[#000000] border-b border-border/40 shadow-sm flex justify-center">
            <div className="w-full max-w-[1400px] aspect-video">
              <Skeleton className="w-full h-full rounded-none bg-slate-900" />
            </div>
          </div>
          
          <div className="flex-1 w-full bg-background/50 p-4 md:p-8 overflow-hidden">
            <div className="max-w-[1400px] mx-auto w-full space-y-6">
              <div className="flex gap-4 border-b border-border pb-2">
                <Skeleton className="w-20 h-8" />
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-32 h-8" />
              </div>
              <Skeleton className="w-3/4 h-6" />
              <div className="space-y-3">
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-5/6 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar (Visible on large screens) */}
        <div className="hidden lg:flex w-80 shrink-0 bg-card border-l border-border flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <Skeleton className="w-1/2 h-6" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full h-12 rounded-lg" />
                <div className="pl-4 space-y-2">
                  <Skeleton className="w-full h-10 rounded-lg" />
                  <Skeleton className="w-11/12 h-10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
