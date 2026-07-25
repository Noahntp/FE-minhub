import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-12 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-4 w-16 bg-slate-800" />
              <Skeleton className="h-4 w-4 bg-slate-800" />
              <Skeleton className="h-4 w-20 bg-slate-800" />
              <Skeleton className="h-4 w-4 bg-slate-800" />
              <Skeleton className="h-4 w-32 bg-slate-800" />
            </div>
            
            <Skeleton className="h-12 md:h-16 w-3/4 bg-slate-800 rounded-lg" />
            <Skeleton className="h-6 w-full max-w-2xl bg-slate-800" />
            
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="w-24 h-6 bg-slate-800" />
              <Skeleton className="w-32 h-6 bg-slate-800" />
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <Skeleton className="w-10 h-10 rounded-full bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="w-48 h-4 bg-slate-800" />
                <Skeleton className="w-32 h-3 bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Mobile Image (hidden on desktop) */}
          <div className="block lg:hidden rounded-xl overflow-hidden bg-card border border-border">
            <Skeleton className="w-full aspect-video rounded-none" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>

          {/* What you'll learn */}
          <div className="bg-card border border-border rounded-xl p-6 md:p-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                  <Skeleton className="h-5 w-full max-w-[200px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="border border-border rounded-xl overflow-hidden bg-card space-y-px">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-muted/30 border-b border-border last:border-0 flex items-center justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

        </div>

        {/* Right Sidebar (Sticky) */}
        <div className="hidden lg:block relative">
          <div className="sticky top-24 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <Skeleton className="w-full aspect-video rounded-none" />
            
            <div className="p-6 space-y-6">
              <Skeleton className="h-10 w-1/2" />
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <div className="pt-4 border-t border-border space-y-3">
                <Skeleton className="h-5 w-32 mb-4" />
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
