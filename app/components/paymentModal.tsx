"use client"

import type React from "react"
import { useState } from "react"
import { CreditCard, Banknote, Smartphone, QrCode, Wallet, X, CheckCircle, Clock } from "lucide-react"

export interface PaymentMethod {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  enabled: boolean
}

export interface PaymentData {
  method: PaymentMethod
  amount: number
  receivedAmount?: number
  change?: number
  reference?: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onPaymentComplete: (paymentData: PaymentData) => void
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "cash",
    name: "เงินสด",
    icon: Banknote,
    description: "ชำระด้วยเงินสด",
    enabled: true,
  },
  {
    id: "credit_card",
    name: "บัตรเครดิต/เดบิต",
    icon: CreditCard,
    description: "Visa, MasterCard, JCB",
    enabled: true,
  },
  {
    id: "qr_code",
    name: "QR Code",
    icon: QrCode,
    description: "PromptPay, TrueMoney Wallet",
    enabled: true,
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    icon: Smartphone,
    description: "K PLUS, SCB Easy, KMA",
    enabled: true,
  },
  {
    id: "e_wallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "Rabbit LINE Pay, ShopeePay",
    enabled: true,
  },
]

export default function PaymentModal({ isOpen, onClose, totalAmount, onPaymentComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [step, setStep] = useState<"select" | "process" | "success">("select")
  const [receivedAmount, setReceivedAmount] = useState("")
  const [processing, setProcessing] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")

  if (!isOpen) return null

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    if (method.id === "cash") {
      setStep("process")
    } else {
      processElectronicPayment(method)
    }
  }

  const processElectronicPayment = async (method: PaymentMethod) => {
    setStep("process")
    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      const reference = `${method.id.toUpperCase()}-${Date.now().toString().slice(-6)}`
      setPaymentReference(reference)
      setProcessing(false)
      setStep("success")
    }, 2000)
  }

  const handleCashPayment = () => {
    const received = Number.parseFloat(receivedAmount)
    if (received < totalAmount) {
      alert("จำนวนเงินที่รับไม่เพียงพอ")
      return
    }

    const change = received - totalAmount
    const paymentData: PaymentData = {
      method: selectedMethod!,
      amount: totalAmount,
      receivedAmount: received,
      change: change,
      reference: `CASH-${Date.now().toString().slice(-6)}`,
    }

    onPaymentComplete(paymentData)
    resetModal()
  }

  const handleElectronicPaymentComplete = () => {
    const paymentData: PaymentData = {
      method: selectedMethod!,
      amount: totalAmount,
      reference: paymentReference,
    }

    onPaymentComplete(paymentData)
    resetModal()
  }

  const resetModal = () => {
    setSelectedMethod(null)
    setStep("select")
    setReceivedAmount("")
    setProcessing(false)
    setPaymentReference("")
    onClose()
  }

  const renderSelectMethod = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">เลือกวิธีการชำระเงิน</h3>
        <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-2xl font-bold text-blue-600">฿{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method)}
              disabled={!method.enabled}
              className={`
                w-full p-4 rounded-lg border-2 transition-all duration-200
                ${
                  method.enabled
                    ? "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                }
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                {!method.enabled && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">ไม่พร้อมใช้งาน</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderCashPayment = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">ชำระด้วยเงินสด</h3>
        <button onClick={() => setStep("select")} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-700">ยอดที่ต้องชำระ</span>
            <span className="text-2xl font-bold text-gray-900">฿{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนเงินที่รับจากลูกค้า</label>
          <input
            type="number"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={totalAmount}
            step="0.01"
          />
        </div>

        {receivedAmount && Number.parseFloat(receivedAmount) >= totalAmount && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-green-700">เงินทอน</span>
              <span className="text-2xl font-bold text-green-600">
                ฿{(Number.parseFloat(receivedAmount) - totalAmount).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => setStep("select")}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ย้อนกลับ
          </button>
          <button
            onClick={handleCashPayment}
            disabled={!receivedAmount || Number.parseFloat(receivedAmount) < totalAmount}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ยืนยันการชำระเงิน
          </button>
        </div>
      </div>
    </div>
  )

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{processing ? "กำลังดำเนินการ..." : "ชำระเงินสำเร็จ"}</h3>
        {!processing && (
          <button onClick={resetModal} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-6">
        {processing ? (
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        ) : (
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">วิธีการชำระเงิน</div>
          <div className="font-semibold text-gray-900">{selectedMethod?.name}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">จำนวนเงิน</div>
          <div className="text-xl font-bold text-gray-900">฿{totalAmount.toLocaleString()}</div>
        </div>

        {paymentReference && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">หมายเลขอ้างอิง</div>
            <div className="font-mono text-gray-900">{paymentReference}</div>
          </div>
        )}
      </div>

      {processing ? (
        <div className="mt-6 text-gray-600">
          <Clock className="w-5 h-5 inline mr-2" />
          กรุณารอสักครู่...
        </div>
      ) : (
        <button
          onClick={handleElectronicPaymentComplete}
          className="mt-6 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          เสร็จสิ้น
        </button>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overFlowAuto">
        <div className="p-6">
          {step === "select" && renderSelectMethod()}
          {step === "process" && selectedMethod?.id === "cash" && renderCashPayment()}
          {step === "process" && selectedMethod?.id !== "cash" && renderProcessing()}
          {step === "success" && renderProcessing()}
        </div>
      </div>
    </div>
  )
}
