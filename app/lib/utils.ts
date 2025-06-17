import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Utility functions for handling Thai timezone (UTC+7)
 */

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

export function formatThaiTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
    hour12: false,
  }).format(date)
}

export function formatThaiDate(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(date)
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

export function createThaiDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  // ตั้งเวลาให้ครอบคลุมทั้งวันตามเวลาไทย
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    start: convertToThaiTime(start),
    end: convertToThaiTime(end),
  }
}

// ฟังก์ชันสำหรับ debug เวลา
export function debugTime(label = "Current Time") {
  const utc = new Date()
  const thai = getCurrentThaiTime()

  console.log(`${label}:`, {
    utc: utc.toISOString(),
    utcTime: utc.getTime(),
    thai: thai.toISOString(),
    thaiTime: thai.getTime(),
    difference: thai.getTime() - utc.getTime(),
    thaiFormatted: formatThaiDateTime(utc), // ส่ง UTC date เข้าไปให้ฟังก์ชันแปลงเอง
    thaiTimeOnly: formatThaiTime(utc),
    thaiDateOnly: getThaiDateOnly(utc),
  })
}

// ฟังก์ชันสำหรับสร้างเวลาไทยจากส่วนประกอบ
export function createThaiDateTime(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
  // สร้าง Date object ในเวลาไทย
  const thaiTime = new Date()
  thaiTime.setFullYear(year)
  thaiTime.setMonth(month - 1) // เดือนใน JavaScript เริ่มจาก 0
  thaiTime.setDate(day)
  thaiTime.setHours(hour, minute, second, 0)
  
  // แปลงกลับเป็น UTC โดยลบ 7 ชั่วโมง
  return new Date(thaiTime.getTime() - (7 * 60 * 60 * 1000))
}
