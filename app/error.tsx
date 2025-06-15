"use client"

import ErrorMessage from "@/components/errorMessage"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ErrorMessage message="เกิดข้อผิดพลาดในการโหลดหน้านี้" onRetry={reset} />
    </div>
  )
}
