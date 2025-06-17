"use client"
import { X, Printer, Download, Share2 } from "lucide-react"
import type { PaymentData } from "@/components/paymentModal"

interface ReceiptItem {
  name: string
  price: number
  quantity: number
}

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  receiptData: {
    receiptNumber: string
    date: Date
    items: ReceiptItem[]
    subtotal: number
    discount: number
    pointsUsed: number
    total: number
    payment: PaymentData
    customer?: {
      name: string
      phone: string
      membershipLevel: string
      pointsEarned: number
    }
  }
}

export default function ReceiptModal({ isOpen, onClose, receiptData }: ReceiptModalProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // สร้าง PDF หรือ export ข้อมูล
    alert("ฟีเจอร์ดาวน์โหลดจะพัฒนาในอนาคต")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ใบเสร็จ #${receiptData.receiptNumber}`,
        text: `ยอดรวม ฿${receiptData.total.toLocaleString()}`,
      })
    } else {
      alert("ฟีเจอร์แชร์จะพัฒนาในอนาคต")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overFlowAuto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">ใบเสร็จรับเงิน</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-6 print:p-4" id="receipt-content">
          {/* Store Header */}
          <div className="text-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">ร้านค้าของเรา</h2>
            <p className="text-sm text-gray-600">123 ถนนสุขุมวิท กรุงเทพฯ 10110</p>
            <p className="text-sm text-gray-600">โทร: 02-123-4567</p>
          </div>

          {/* Receipt Info */}
          <div className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">เลขที่ใบเสร็จ:</span>
              <span className="font-mono">{receiptData.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">วันที่:</span>
              <span>
                {receiptData.date.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {receiptData.customer && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">ลูกค้า:</span>
                  <span>{receiptData.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เบอร์โทร:</span>
                  <span>{receiptData.customer.phone}</span>
                </div>
              </>
            )}
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">รายการ</th>
                  <th className="text-center py-2">จำนวน</th>
                  <th className="text-right py-2">ราคา</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">฿{(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ยอดรวม:</span>
              <span>฿{receiptData.subtotal.toLocaleString()}</span>
            </div>

            {receiptData.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>ส่วนลด:</span>
                <span>-฿{receiptData.discount.toLocaleString()}</span>
              </div>
            )}

            {receiptData.pointsUsed > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>ใช้คะแนน:</span>
                <span>-฿{receiptData.pointsUsed.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>รวมทั้งหมด:</span>
              <span>฿{receiptData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">วิธีการชำระเงิน:</span>
              <span>{receiptData.payment.method.name}</span>
            </div>

            {receiptData.payment.receivedAmount && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">เงินที่รับ:</span>
                  <span>฿{receiptData.payment.receivedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เงินทอน:</span>
                  <span>฿{(receiptData.payment.change || 0).toLocaleString()}</span>
                </div>
              </>
            )}

            {receiptData.payment.reference && (
              <div className="flex justify-between">
                <span className="text-gray-600">หมายเลขอ้างอิง:</span>
                <span className="font-mono text-xs">{receiptData.payment.reference}</span>
              </div>
            )}
          </div>

          {/* Customer Points */}
          {receiptData.customer && (
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ระดับสมาชิก:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {receiptData.customer.membershipLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">คะแนนที่ได้รับ:</span>
                <span className="text-green-600 font-medium">+{receiptData.customer.pointsEarned} คะแนน</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>สอบถามข้อมูลเพิ่มเติม โทร 02-123-4567</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-4 border-t border-gray-200 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            ดาวน์โหลด
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            แชร์
          </button>
        </div>
      </div>
    </div>
  )
}
