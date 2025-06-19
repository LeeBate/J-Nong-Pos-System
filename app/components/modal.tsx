"use client"

import type React from "react"
import { useEffect } from "react"
import { X, AlertTriangle, CheckCircle, XCircle, Info, HelpCircle } from "lucide-react"
import { useModal } from "@/contexts/ModalContext"

const iconMap = {
  info: { icon: Info, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
  warning: { icon: AlertTriangle, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
  error: { icon: XCircle, bgColor: "bg-red-100", iconColor: "text-red-600" },
  success: { icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-600" },
  confirm: { icon: HelpCircle, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
}

const buttonVariants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
}

export default function Modal() {
  const { isOpen, config, hideModal } = useModal()

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && config?.closable !== false) {
        hideModal()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
      // Prevent body scroll
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, config?.closable, hideModal])

  if (!isOpen || !config) return null

  const { icon: IconComponent, bgColor, iconColor } = iconMap[config.type]

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && config.closable !== false) {
      hideModal()
    }
  }

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className=" bg-white rounded-lg shadow-2xl w-full max-w-xl xl:h-[20rem] transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95  border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-10 xl:pb-15">
          {/* {config.closable !== false && (
            <button
              onClick={hideModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )} */}

          <div className="flex flex-col justify-center items-center space-x-4">
            {/* Icon */}
            <div className={`absolute top-[-2.5rem] flex-shrink-0 w-20 h-20 rounded-full ${bgColor} flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center items-center min-w-0 mt-10">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2 xl:mb-8">{config.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{config.message}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-center space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
            {config.secondaryButton && (
              <button
                onClick={config.secondaryButton.action}
                className={`
                  w-full sm:w-auto px-4 py-2 xl:px-8 xl:py-4 text-sm font-medium rounded-lg
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${buttonVariants[config.secondaryButton.variant || "secondary"]}
                `}
              >
                {config.secondaryButton.text}
              </button>
            )}

            {config.primaryButton && (
              <button
                onClick={config.primaryButton.action}
                className={`
                  w-full sm:w-auto px-4 py-2 xl:px-6 xl:py-3 text-sm xl:text-lg font-medium rounded-lg
                  transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${buttonVariants[config.primaryButton.variant || "primary"]}
                `}
              >
                {config.primaryButton.text}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
