"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar, Package } from 'lucide-react'

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  drillDownData: {
    type: string
    title: string
    data: any
  } | null
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, drillDownData }) => {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (drillDownData) {
      fetchDetails()
    }
  }, [drillDownData])

  const fetchDetails = async () => {
    if (!drillDownData) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("type", drillDownData.type)

      if (drillDownData.type === "date") {
        params.append("date", drillDownData.data.date)
      } else if (drillDownData.type === "product") {
        params.append("productName", drillDownData.data.productName)
      }

      console.log("Fetching drill-down data:", `/api/reports/drill-down?${params}`)
    
      const response = await fetch(`/api/reports/drill-down?${params}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Drill-down data received:", data)
      setDetails(data)
    } catch (error) {
      console.error("Error fetching drill-down details:", error)
      setDetails({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const renderDateDetails = () => {
    if (!details || !details.summary) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{details.summary.totalTransactions}</div>
            <div className="text-sm text-blue-700">ธุรกรรม</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">฿{details?.summary?.totalSales?.toLocaleString()}</div>
            <div className="text-sm text-green-700">ยอดขายรวม</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">฿{details?.summary?.totalCost?.toLocaleString()}</div>
            <div className="text-sm text-red-700">ต้นทุนรวม</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">฿{details?.summary?.totalProfit?.toLocaleString()}</div>
            <div className="text-sm text-purple-700">กำไรรวม</div>
          </div>
        </div>

        <div className="space-y-3 overflow-y-scroll h-[26rem]">
          <h4 className="font-semibold text-gray-900">รายละเอียดธุรกรรม</h4>
          {details.transactions && details.transactions.length > 0 ? (
            details.transactions.map((transaction, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{transaction.time}</span>
                    <span className="text-xs text-gray-500">({transaction.paymentMethod})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">฿{transaction.amount.toLocaleString()}</span>
                    <div className="text-xs text-gray-500">กำไร: ฿{transaction.profit.toLocaleString()}</div>
                  </div>
                </div>
                {/* <div className="text-sm text-gray-600 mb-1">
                  <strong>สินค้า:</strong> {transaction.items.join(", ")}
                </div> */}
                <div className="text-sm text-gray-600 mb-2">
                  <strong>ลูกค้า:</strong> {transaction.customer}
                </div>
                {transaction.itemDetails && transaction.itemDetails.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 space-y-1">
                      {transaction.itemDetails.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {item.name} ({item.category})
                          </span>
                          <span>
                            ฿{item.price} x {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">ไม่มีธุรกรรมในวันนี้</div>
          )}
        </div>
      </div>
    )
  }

  const renderProductDetails = () => {
    if (!details || !details.summary) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{details.summary.totalQuantity}</div>
            <div className="text-sm text-blue-700">จำนวนขายรวม</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">฿{details.summary.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-green-700">รายได้รวม</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">฿{details.summary.totalCost.toLocaleString()}</div>
            <div className="text-sm text-red-700">ต้นทุนรวม</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">฿{details.summary.totalProfit.toLocaleString()}</div>
            <div className="text-sm text-purple-700">กำไรรวม</div>
          </div>
        </div>

        {details.productInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">ข้อมูลสินค้า</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">หมวดหมู่:</span>
                <span className="ml-2 font-medium">{details.productInfo.category}</span>
              </div>
              <div>
                <span className="text-gray-600">ต้นทุน/หน่วย:</span>
                <span className="ml-2 font-medium">฿{details.productInfo.cost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">ราคาขายเฉลี่ย:</span>
                <span className="ml-2 font-medium">฿{details.summary.avgPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">ยอดขายรายวัน</h4>
          {details.dailyData && details.dailyData.length > 0 ? (
            details.dailyData.map((day, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{new Date(day.date).toLocaleDateString("th-TH")}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">฿{day.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{day.quantity} ชิ้น</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span>ต้นทุน: </span>
                    <span className="font-medium text-red-600">฿{day.cost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span>กำไร: </span>
                    <span className={`font-medium ${day.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ฿{day.profit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span>ธุรกรรม: </span>
                    <span className="font-medium">{day.transactions}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">ไม่มีข้อมูลการขายสำหรับสินค้านี้</div>
          )}
        </div>
      </div>
    )
  }

  if (!isOpen || !drillDownData) return null

  return (
    <div className="fixed inset-0 z-50 overflow-auto  backdrop-blur-md flex items-center justify-center">
      <div className="relative w-auto mx-auto max-w-3xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-[50rem] h-[40rem]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">รายละเอียด</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
            </div>
          ) : details?.error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">เกิดข้อผิดพลาด: {details.error}</div>
              <button onClick={fetchDetails} className="btn btn-primary">
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              {drillDownData.type === "date" && renderDateDetails()}
              {drillDownData.type === "product" && renderProductDetails()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DrillDownModal
