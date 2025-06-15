import LoadingSpinner from "@/components/loadingSpinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  )
}
