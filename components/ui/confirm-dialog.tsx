"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    variant = "danger",
}: ConfirmDialogProps) {
    if (!open) return null;

    const variantStyles = {
        danger: {
            icon: "bg-red-100 text-red-600",
            button: "bg-red-600 hover:bg-red-700",
        },
        warning: {
            icon: "bg-yellow-100 text-yellow-600",
            button: "bg-yellow-600 hover:bg-yellow-700",
        },
        info: {
            icon: "bg-blue-100 text-blue-600",
            button: "bg-blue-600 hover:bg-blue-700",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b">
                    <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.icon}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            <p className="text-gray-600 mt-1">{message}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-white rounded-lg transition ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
