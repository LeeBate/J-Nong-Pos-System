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

export interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  totalAmount: number
  onPaymentComplete: (paymentData: PaymentData) => void
}

export const paymentMethods: PaymentMethod[] = [
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