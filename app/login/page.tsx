"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  User,
  Hash,
  Eye,
  EyeOff,
  LogIn,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginHistory, UserOption } from "@/types/loginType";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPIN] = useState("");
  const [showPIN, setShowPIN] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  const { user, loginWithUsernamePIN } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitch = searchParams.get("switch") === "true";
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, router, loading]);

  useEffect(() => {
    loadUsers();
    loadLoginHistory();
  }, []);

  useEffect(() => {
    if (username) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(username.toLowerCase()) ||
          user.fullName.toLowerCase().includes(username.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [username, users]);

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadLoginHistory = () => {
    try {
      const history = localStorage.getItem("loginHistory");
      if (history) {
        const parsed = JSON.parse(history);
        setLoginHistory(parsed.slice(0, 6)); // แสดงแค่ 6 คนล่าสุด
      }
    } catch (error) {
      console.error("Error loading login history:", error);
    }
  };

  const saveToLoginHistory = (user: UserOption) => {
    try {
      const history = [...loginHistory];
      const existingIndex = history.findIndex(
        (h) => h.username === user.username
      );

      const newEntry: LoginHistory = {
        ...user,
        lastLogin: new Date(),
      };

      if (existingIndex >= 0) {
        history.splice(existingIndex, 1);
      }

      history.unshift(newEntry);
      const updatedHistory = history.slice(0, 6);

      localStorage.setItem("loginHistory", JSON.stringify(updatedHistory));
      setLoginHistory(updatedHistory);
    } catch (error) {
      console.error("Error saving login history:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || pin.length !== 6) {
      setError("กรุณากรอกชื่อผู้ใช้และ PIN 6 หลัก");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const success = await loginWithUsernamePIN(username, pin);
      if (success) {
        // Save to login history
        const userInfo = users.find((u) => u.username === username);
        if (userInfo) {
          saveToLoginHistory(userInfo);
        }
      } else {
        setError("ชื่อผู้ใช้หรือ PIN ไม่ถูกต้อง");
        setPIN("");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: UserOption) => {
    setUsername(user.username);
    setSelectedUser(user);
    setShowUserDropdown(false);
    setError("");
    // Focus on PIN input
    setTimeout(() => {
      const pinInput = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;
      pinInput?.focus();
    }, 100);
  };

  const handleQuickLogin = (user: LoginHistory) => {
    setUsername(user.username);
    setSelectedUser(user);
    setPIN("");
    setError("");
    // Focus on PIN input
    setTimeout(() => {
      const pinInput = document.querySelector(
        'input[type="password"]'
      ) as HTMLInputElement;
      pinInput?.focus();
    }, 100);
  };

  const handlePINInput = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setPIN(value);
      setError("");
    }
  };

  const clearSelection = () => {
    setUsername("");
    setSelectedUser(null);
    setPIN("");
    setError("");
    usernameRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSwitch ? "สลับผู้ใช้งาน" : "เข้าสู่ระบบ"}
          </h1>
          <p className="text-gray-600">ระบบ POS - JNong</p>
        </div>

        <div className=" grid grid-cols-2 [grid-template-columns:repeat(auto-fit,_minmax(200px, _1fr))] space-x-4">
          {/* Quick Login History */}
          <div className="bg-white rounded-lg shadow-lg p-4 ">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              เข้าสู่ระบบล่าสุด
            </h3>
            {loginHistory.length > 0 && (
              <div className="space-y-2">
                {loginHistory.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => handleQuickLogin(user)}
                    className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.username} • {user.role}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(user.lastLogin).toLocaleDateString("th-TH")}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            {/* Login Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Username Input with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้ใช้
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={usernameRef}
                      type="text"
                      placeholder="กรอกชื่อผู้ใช้"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setShowUserDropdown(true)}
                      className="input pl-10 pr-10"
                      required
                      autoComplete="off"
                    />
                    {selectedUser && (
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    {!selectedUser && (
                      <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {/* User Dropdown */}
                  {showUserDropdown && filteredUsers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.username}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="w-full flex items-center p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{user.username} • {user.role}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* PIN Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIN (6 หลัก)
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type={showPIN ? "text" : "password"}
                      placeholder="กรอก PIN 6 หลัก"
                      value={pin}
                      onChange={(e) => handlePINInput(e.target.value)}
                      className="input pl-10 pr-10 text-center text-2xl tracking-widest"
                      maxLength={6}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPIN(!showPIN)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPIN ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 flex justify-center space-x-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border-2 ${
                          i < pin.length
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || pin.length !== 6}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      กำลังเข้าสู่ระบบ...
                    </div>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </button>
              </form>
            </div>

            {/* Quick PIN Pad for Mobile */}
            <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
              <div className="grid grid-cols-3  gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePINInput(pin + num.toString())}
                    disabled={pin.length >= 6}
                    className="btn btn-secondary h-12 text-lg font-semibold disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPIN(pin.slice(0, -1))}
                  className="btn btn-secondary h-12 text-sm"
                >
                  ลบ
                </button>
                <button
                  onClick={() => handlePINInput(pin + "0")}
                  disabled={pin.length >= 6}
                  className="btn btn-secondary h-12 text-lg font-semibold disabled:opacity-50"
                >
                  0
                </button>
                <button
                  onClick={() => setPIN("")}
                  className="btn btn-secondary h-12 text-sm"
                >
                  ล้าง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>© 2024 POS System - JNong</p>
          {!isSwitch && (
            <p className="mt-2">ติดต่อผู้ดูแลระบบหากมีปัญหาการเข้าสู่ระบบ</p>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </div>
  );
}
