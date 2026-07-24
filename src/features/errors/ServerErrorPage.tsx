import React from "react";
import { ServerCrash } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PageTransition } from "@/shared/components/ui/PageTransition";

export function ServerErrorPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-8">
          <ServerCrash className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">500</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2 text-center">Lỗi hệ thống</h2>
        <p className="text-muted-foreground max-w-md text-center mx-auto mb-8">
          Hệ thống đang gặp sự cố. Chúng tôi đã ghi nhận và đang tiến hành khắc phục. Vui lòng thử lại sau ít phút.
        </p>
        <Button onClick={() => window.location.reload()} className="rounded-full px-8">
          Tải lại trang
        </Button>
      </div>
    </PageTransition>
  );
}
