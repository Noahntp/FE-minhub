import React from 'react';
import { Skeleton } from './skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm flex flex-col">
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-4 flex flex-col flex-grow space-y-3">
        <Skeleton className="h-6 w-3/4 rounded-sm" />
        <Skeleton className="h-4 w-1/2 rounded-sm" />
        <div className="flex items-center gap-2 pt-2 mt-auto">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-4 w-4 rounded-full ml-2" />
          <Skeleton className="h-4 w-12 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function InstructorCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-auto mb-4">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="bg-card p-5 rounded-2xl border border-border/50 shadow-sm mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoadmapSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden mb-8 space-y-6">
      <Skeleton className="absolute top-0 left-0 w-full h-32 opacity-20" />
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10 pt-16">
        <Skeleton className="w-32 h-32 rounded-2xl ring-4 ring-background" />
        <div className="flex-1 text-center md:text-left space-y-3">
          <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
          <Skeleton className="h-5 w-32 mx-auto md:mx-0" />
        </div>
      </div>
    </div>
  );
}
