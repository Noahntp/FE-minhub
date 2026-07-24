import React from "react";
import { Telescope } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { PageTransition } from "@/shared/components/ui/PageTransition";

export function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-muted/50 text-muted-foreground rounded-full flex items-center justify-center mb-8">
          <Telescope className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">404</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2 text-center">Không tìm thấy tri thức</h2>
        <p className="text-muted-foreground max-w-md text-center mx-auto mb-8">
          Có vẻ như bài học hoặc lộ trình bạn đang tìm kiếm chưa tồn tại trong vũ trụ MindHub, hoặc đã được chuyển đi nơi khác.
        </p>
        <Button asChild className="rounded-full px-8">
          <Link to="/">Quay về Trung tâm điều khiển</Link>
        </Button>
      </div>
    </PageTransition>
  );
}
