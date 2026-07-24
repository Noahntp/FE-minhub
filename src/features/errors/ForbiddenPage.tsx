import React from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { PageTransition } from "@/shared/components/ui/PageTransition";

export function ForbiddenPage() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-8">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">403</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2 text-center">Khu vực hạn chế</h2>
        <p className="text-muted-foreground max-w-md text-center mx-auto mb-8">
          Bạn không có quyền truy cập vào nội dung này. Vui lòng kiểm tra lại quyền hạn hoặc đăng nhập với tài khoản phù hợp.
        </p>
        <Button asChild className="rounded-full px-8">
          <Link to="/">Quay về Trang chủ</Link>
        </Button>
      </div>
    </PageTransition>
  );
}
