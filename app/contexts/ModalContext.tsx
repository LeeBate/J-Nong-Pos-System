"use client"

import { ModalConfig, ModalContextType } from "@/lib/types"
import { createContext, useContext, useState, type ReactNode } from "react"

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ModalConfig | null>(null)

  const showModal = (modalConfig: ModalConfig) => {
    setConfig(modalConfig)
    setIsOpen(true)
  }

  const hideModal = () => {
    setIsOpen(false)
    if (config?.onClose) {
      config.onClose()
    }
    // Delay clearing config to allow exit animation
    setTimeout(() => setConfig(null), 300)
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    showModal({
      type: "confirm",
      title,
      message,
      primaryButton: {
        text: "ยืนยัน",
        action: () => {
          onConfirm()
          hideModal()
        },
        variant: "primary",
      },
      secondaryButton: {
        text: "ยกเลิก",
        action: () => {
          if (onCancel) onCancel()
          hideModal()
        },
        variant: "secondary",
      },
      closable: true,
    })
  }

  const showAlert = (title: string, message: string, type: "info" | "warning" | "error" | "success" = "info") => {
    showModal({
      type,
      title,
      message,
      primaryButton: {
        text: "ตกลง",
        action: hideModal,
        variant: "primary",
      },
      closable: true,
    })
  }

  const showError = (message: string, title?: string) => {
    showAlert(title ?? "พบข้อผิดพลาด", message, "error")
  }

  const showSuccess = (message: string, title?: string) => {
    showAlert(title ?? "สำเร็จ", message, "success")
  }

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        config,
        showModal,
        hideModal,
        showConfirm,
        showAlert,
        showError,
        showSuccess,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider")
  }
  return context
}
