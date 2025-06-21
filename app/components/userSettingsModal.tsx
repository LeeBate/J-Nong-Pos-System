"use client";

import type React from "react";

import { useState } from "react";
import { X, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserSettingsModal({
  isOpen,
  onClose,
}: UserSettingsModalProps) {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<"pin">("pin");

  // PIN state
  const [newPIN, setNewPIN] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePINUpdate = async () => {
    if (!newPIN || newPIN.length !== 6 || !/^\d{6}$/.test(newPIN)) {
      setMessage({
        type: "error",
        text: "กรุณากรอก PIN 6 หลัก (ตัวเลขเท่านั้น)",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/update-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: newPIN,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "อัปเดต PIN สำเร็จ" });
        setNewPIN("");
        checkAuth();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "เกิดข้อผิดพลาดในการอัปเดต PIN" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">ตั้งค่าบัญชี</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-lg font-bold">
                {user?.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">{user?.fullName}</h4>
            <p className="text-sm text-gray-600">@{user?.username}</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pin")}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center ${
              activeTab === "pin"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Hash className="w-4 h-4 mr-2" />
            จัดการ PIN
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* PIN Tab */}
          {activeTab === "pin" && (
            <div className="space-y-4">
              {user?.pin && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    PIN ปัจจุบัน: <span className="font-mono">••••••</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN ใหม่ (6 หลัก)
                </label>
                <input
                  type="password"
                  value={newPIN}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 6 && /^\d*$/.test(value)) {
                      setNewPIN(value);
                    }
                  }}
                  className="input text-center text-lg tracking-widest"
                  placeholder="••••••"
                  maxLength={6}
                />
                <div className="mt-2 flex justify-center space-x-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full border-2 ${
                        i < newPIN.length
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex">
                <button
                  onClick={() => handlePINUpdate()}
                  disabled={loading || newPIN.length !== 6}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "กำลังอัปเดต..." : "อัปเดต PIN"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
