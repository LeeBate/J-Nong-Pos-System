import { PaymentData } from "./paymentType";

export interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  drillDownData: {
    type: string;
    title: string;
    data: any;
  } | null;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    receiptNumber: string;
    date: Date;
    items: ReceiptItem[];
    subtotal: number;
    discount: number;
    pointsUsed: number;
    total: number;
    payment: PaymentData;
    customer?: {
      name: string;
      phone: string;
      membershipLevel: string;
      pointsEarned: number;
    };
  };
}
