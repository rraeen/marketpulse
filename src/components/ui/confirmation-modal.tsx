"use client";

import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {variant === "destructive" && (
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "outline" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
                : ""
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
