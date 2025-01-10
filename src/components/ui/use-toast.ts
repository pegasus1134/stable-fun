// src/components/ui/use-toast.ts
import { create } from 'zustand';

interface ToastState {
    toasts: Array<{
        id: string;
        title?: string;
        description?: string;
        variant?: 'default' | 'destructive';
    }>;
    addToast: (toast: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
    dismissToast: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id: Math.random().toString() }],
        })),
    dismissToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}));

export const useToast = () => {
    const addToast = useToastStore((state) => state.addToast);

    return {
        toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) =>
            addToast(props),
    };
};