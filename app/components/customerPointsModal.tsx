"use client";

import { useState, useEffect } from "react";
import { X, Star, Plus, Minus, History, Gift, TrendingUp } from "lucide-react";
import { MEMBERSHIP_LEVELS, getMembershipLevelInfo } from "@/lib/pointsSystem";
import { CustomerPointsModalProps, PointsTransaction } from "@/lib/types";

export default function CustomerPointsModal({
  isOpen,
  onClose,
  customerId,
  customerName,
  currentPoints,
  membershipLevel,
  onPointsUpdated,
}: CustomerPointsModalProps) {
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustDescription, setAdjustDescription] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "adjust">("history");

  useEffect(() => {
    if (isOpen) {
      fetchPointsHistory();
    }
  }, [isOpen, customerId]);

  const fetchPointsHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/points`);
      if (response.ok) {
        const history = await response.json();
        setPointsHistory(history);
      }
    } catch (error) {
      console.error("Error fetching points history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async () => {
    if (!adjustPoints || !adjustDescription.trim()) {
      alert("กรุณากรอกจำนวนแต้มและคำอธิบาย");
      return;
    }

    setAdjusting(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: adjustPoints,
          description: adjustDescription,
        }),
      });

      if (response.ok) {
        setAdjustPoints(0);
        setAdjustDescription("");
        fetchPointsHistory();
        onPointsUpdated();
        alert("ปรับแต้มสำเร็จ!");
      } else {
        alert("เกิดข้อผิดพลาดในการปรับแต้ม");
      }
    } catch (error) {
      console.error("Error adjusting points:", error);
      alert("เกิดข้อผิดพลาดในการปรับแต้ม");
    } finally {
      setAdjusting(false);
    }
  };

  const membershipInfo = getMembershipLevelInfo(membershipLevel);
  const nextLevel = MEMBERSHIP_LEVELS.find(
    (level) => level.minSpending > (membershipInfo?.minSpending || 0)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              จัดการแต้มสะสม
            </h3>
            <p className="text-gray-600">{customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Points */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  แต้มคงเหลือ
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {currentPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">แต้ม</div>
            </div>

            {/* Membership Level */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Gift className="w-6 h-6 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-600">
                  ระดับสมาชิก
                </span>
              </div>
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-${membershipInfo?.color}-100 text-${membershipInfo?.color}-800`}
              >
                {membershipLevel}
              </div>
              {membershipInfo && (
                <div className="text-xs text-gray-500 mt-1">
                  ส่วนลด {membershipInfo.discountPercentage}% • แต้ม x
                  {membershipInfo.pointsMultiplier}
                </div>
              )}
            </div>

            {/* Next Level Progress */}
            {nextLevel && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-600">
                    ระดับถัดไป
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {nextLevel.name}
                </div>
                <div className="text-xs text-gray-500">
                  ใช้จ่ายอีก ฿
                  {(
                    nextLevel.minSpending - (membershipInfo?.minSpending || 0)
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            ประวัติแต้ม
          </button>
          <button
            onClick={() => setActiveTab("adjust")}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === "adjust"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            ปรับแต้ม
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-96 overflow-y-auto">
          {activeTab === "history" && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">กำลังโหลด...</p>
                </div>
              ) : pointsHistory.length > 0 ? (
                <div className="space-y-3">
                  {pointsHistory.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "earn"
                              ? "bg-green-100"
                              : transaction.type === "redeem"
                              ? "bg-red-100"
                              : transaction.type === "adjust"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {transaction.type === "earn" && (
                            <Plus className="w-5 h-5 text-green-600" />
                          )}
                          {transaction.type === "redeem" && (
                            <Minus className="w-5 h-5 text-red-600" />
                          )}
                          {transaction.type === "adjust" && (
                            <Star className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString(
                              "th-TH",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          transaction.points > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">ยังไม่มีประวัติการใช้แต้ม</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนแต้ม
                  </label>
                  <input
                    type="number"
                    value={adjustPoints}
                    onChange={(e) =>
                      setAdjustPoints(Number.parseInt(e.target.value) || 0)
                    }
                    placeholder="ใส่จำนวนแต้ม (+ เพิ่ม, - ลด)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ใส่เลขบวกเพื่อเพิ่มแต้ม หรือเลขลบเพื่อลดแต้ม
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={adjustDescription}
                    onChange={(e) => setAdjustDescription(e.target.value)}
                    placeholder="ระบุเหตุผลในการปรับแต้ม..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-yellow-600 mr-2">⚠️</div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        คำเตือน
                      </p>
                      <p className="text-sm text-yellow-700">
                        การปรับแต้มจะถูกบันทึกและไม่สามารถยกเลิกได้
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAdjustPoints}
                  disabled={
                    adjusting || !adjustPoints || !adjustDescription.trim()
                  }
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adjusting ? "กำลังปรับแต้ม..." : "ปรับแต้ม"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
