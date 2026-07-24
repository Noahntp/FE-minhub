import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function CourseCardSkeleton() {
  return (
    <Card className="group overflow-hidden border-border/50 shadow-sm flex flex-col h-full bg-card">
      <div className="relative aspect-video overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="flex items-center gap-4 mt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </CardFooter>
    </Card>
  );
}
