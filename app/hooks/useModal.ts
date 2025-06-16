"use client"

import { useModal as useModalContext } from "@/contexts/ModalContext"

// Re-export for convenience
export const useModal = useModalContext

// Additional helper hooks
export function useConfirm() {
  const { showConfirm } = useModalContext()

  return (title: string, message: string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      showConfirm(
        title,
        message,
        () => resolve(true),  // onConfirm callback
        () => resolve(false)  // onCancel callback
      )
    })
  }
}

export function useAlert() {
  const { showAlert, showError, showSuccess } = useModalContext()

  return {
    info: (message: string, title?: string) => showAlert(title || "ข้อมูล", message, "info"),
    warning: (message: string, title?: string) => showAlert(title || "คำเตือน", message, "warning"),
    error: (message: string, title?: string) => showError(message, title),
    success: (message: string, title?: string) => showSuccess(message, title),
  }
}
