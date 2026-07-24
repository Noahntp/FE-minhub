import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Đã xảy ra lỗi hệ thống</h1>
          <p className="text-muted-foreground max-w-md text-center mx-auto mb-8">
            Chúng tôi đang gặp chút sự cố kỹ thuật. Đừng lo lắng, tiến độ học tập của bạn vẫn được bảo toàn.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} className="rounded-full">
              Tải lại trang
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-full">
              Về trang chủ
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
