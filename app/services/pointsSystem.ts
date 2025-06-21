import { MEMBERSHIP_LEVELS, MembershipLevel, POINTS_CONFIG } from "@/types/pointsType"

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
