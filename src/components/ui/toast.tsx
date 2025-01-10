// src/components/ui/toast.tsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "@/lib/utils"

export function Toast({
                          className,
                          ...props
                      }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>) {
    return (
        <ToastPrimitives.Root
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full bg-slate-800 border-slate-700",
                className
            )}
            {...props}
        />
    )
}

export function ToastViewport({
                                  className,
                                  ...props
                              }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>) {
    return (
        <ToastPrimitives.Viewport
            className={cn(
                "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
                className
            )}
            {...props}
        />
    )
}

const ToastProvider = ToastPrimitives.Provider

export interface useToastProps {
    title?: string
    description?: string
    variant?: "default" | "destructive"
}

export { ToastProvider }