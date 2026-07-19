"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

interface Props {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms. Default 4000 */
  duration?: number;
}

export default function InventoryToast({
  message,
  variant,
  onDismiss,
  duration = 4000,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const isSuccess = variant === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300 ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className={`ml-2 rounded p-0.5 transition-colors ${
          isSuccess ? "hover:bg-emerald-100 text-emerald-600" : "hover:bg-red-100 text-red-600"
        }`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
