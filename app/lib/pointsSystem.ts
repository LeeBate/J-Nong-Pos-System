// ระบบจัดการแต้มสะสม
export interface PointsConfig {
  earnRate: number // แต้มที่ได้รับต่อการใช้จ่าย 1 บาท
  redeemRate: number // อัตราแลกแต้ม (1 แต้ม = ? บาท)
  minRedeemPoints: number // แต้มขั้นต่ำที่สามารถใช้ได้
  maxRedeemPercentage: number // เปอร์เซ็นต์สูงสุดที่สามารถใช้แต้มได้จากยอดรวม
}

export interface MembershipLevel {
  name: string
  minSpending: number
  discountPercentage: number
  pointsMultiplier: number
  color: string
  benefits: string[]
}

// การตั้งค่าระบบแต้ม
export const POINTS_CONFIG: PointsConfig = {
  earnRate: 0.1, // ได้ 1 แต้มต่อการใช้จ่าย 10 บาท
  redeemRate: 1, // 1 แต้ม = 1 บาท
  minRedeemPoints: 10, // ใช้แต้มขั้นต่ำ 10 แต้ม
  maxRedeemPercentage: 50, // ใช้แต้มได้สูงสุด 50% ของยอดรวม
}

// ระดับสมาชิก
export const MEMBERSHIP_LEVELS: MembershipLevel[] = [
  {
    name: "Bronze",
    minSpending: 0,
    discountPercentage: 0,
    pointsMultiplier: 1,
    color: "orange",
    benefits: ["สะสมแต้ม", "โปรโมชั่นพิเศษ"],
  },
  {
    name: "Silver",
    minSpending: 5000,
    discountPercentage: 5,
    pointsMultiplier: 1.2,
    color: "gray",
    benefits: ["ส่วนลด 5%", "สะสมแต้ม 1.2 เท่า", "โปรโมชั่นพิเศษ"],
  },
  {
    name: "Gold",
    minSpending: 20000,
    discountPercentage: 10,
    pointsMultiplier: 1.5,
    color: "yellow",
    benefits: ["ส่วนลด 10%", "สะสมแต้ม 1.5 เท่า", "โปรโมชั่นพิเศษ", "ของขวัญวันเกิด"],
  },
  {
    name: "Platinum",
    minSpending: 50000,
    discountPercentage: 15,
    pointsMultiplier: 2,
    color: "purple",
    benefits: ["ส่วนลด 15%", "สะสมแต้ม 2 เท่า", "โปรโมชั่นพิเศษ", "ของขวัญวันเกิด", "บริการพิเศษ"],
  },
]

// คำนวณแต้มที่ได้รับ
export function calculateEarnedPoints(amount: number, membershipLevel: string): number {
  const level = MEMBERSHIP_LEVELS.find((l) => l.name === membershipLevel) || MEMBERSHIP_LEVELS[0]
  const basePoints = Math.floor(amount * POINTS_CONFIG.earnRate)
  return Math.floor(basePoints * level.pointsMultiplier)
}

// คำนวณส่วนลดจากระดับสมาชิก
export function calculateMembershipDiscount(amount: number, membershipLevel: string): number {
  const level = MEMBERSHIP_LEVELS.find((l) => l.name === membershipLevel) || MEMBERSHIP_LEVELS[0]
  return amount * (level.discountPercentage / 100)
}

// คำนวณระดับสมาชิกจากยอดซื้อรวม
export function calculateMembershipLevel(totalSpending: number): string {
  for (let i = MEMBERSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (totalSpending >= MEMBERSHIP_LEVELS[i].minSpending) {
      return MEMBERSHIP_LEVELS[i].name
    }
  }
  return MEMBERSHIP_LEVELS[0].name
}

// ตรวจสอบว่าสามารถใช้แต้มได้หรือไม่
export function canRedeemPoints(points: number, amount: number): boolean {
  return (
    points >= POINTS_CONFIG.minRedeemPoints &&
    points * POINTS_CONFIG.redeemRate <= amount * (POINTS_CONFIG.maxRedeemPercentage / 100)
  )
}

// คำนวณแต้มสูงสุดที่สามารถใช้ได้
export function getMaxRedeemablePoints(points: number, amount: number): number {
  const maxByPercentage = Math.floor((amount * (POINTS_CONFIG.maxRedeemPercentage / 100)) / POINTS_CONFIG.redeemRate)
  return Math.min(points, maxByPercentage)
}

// คำนวณส่วนลดจากแต้ม
export function calculatePointsDiscount(pointsUsed: number): number {
  return pointsUsed * POINTS_CONFIG.redeemRate
}

// ได้รับข้อมูลระดับสมาชิก
export function getMembershipLevelInfo(levelName: string): MembershipLevel | null {
  return MEMBERSHIP_LEVELS.find((l) => l.name === levelName) || null
}
