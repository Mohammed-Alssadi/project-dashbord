import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * LocalErrorBoundary - مكون لمنع انهيار الصفحة بالكامل عند حدوث خطأ في جزء صغير
 * مثل فشل عرض صف في جدول، أو عطل في بطاقة إحصائيات معينة.
 */
export class LocalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by LocalErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 border border-destructive/20 bg-destructive/5 rounded-xl text-center gap-3 w-full my-4 font-sans" dir="rtl">
          <AlertTriangle className="size-8 text-destructive animate-bounce" />
          <h3 className="text-sm font-bold text-foreground">حدث خطأ في عرض هذا الجزء</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {this.state.error?.message || "خطأ داخلي في المكون"}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={this.handleReset}
            className="mt-1 h-8 text-xs font-semibold"
          >
            إعادة المحاولة
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
