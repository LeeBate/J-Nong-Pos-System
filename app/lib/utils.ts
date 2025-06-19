import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentThaiTime(): Date {
  const now = new Date()
  // เพิ่ม 7 ชั่วโมงสำหรับเวลาไทย (UTC+7)
  const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
  return thaiTime
}

export function convertToThaiTime(utcDate: Date): Date {
  // เพิ่ม 7 ชั่วโมงสำหรับเวลาไทย (UTC+7)
  return new Date(utcDate.getTime() + (7 * 60 * 60 * 1000))
}

export function formatThaiDateTime(date: Date): string {
  // แปลงเป็นเวลาไทยก่อน
  const thaiTime = convertToThaiTime(date)

  // ใช้ getUTC* methods เพราะ thaiTime เป็น Date object ที่ปรับเวลาแล้ว
  const day = thaiTime.getUTCDate().toString().padStart(2, "0")
  const month = (thaiTime.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = (thaiTime.getUTCFullYear() + 543).toString() // แปลงเป็นปี พ.ศ.
  const hours = thaiTime.getUTCHours().toString().padStart(2, "0")
  const minutes = thaiTime.getUTCMinutes().toString().padStart(2, "0")

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function getThaiDateOnly(date: Date): string {
  const thaiDate = convertToThaiTime(date)
  // ใช้ toISOString แล้วตัดเอาแค่ส่วนวันที่
  return thaiDate.toISOString().split("T")[0]
}

export const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone.startsWith("0")) {
      return false;
    }
    return phoneRegex.test(phone);
  }