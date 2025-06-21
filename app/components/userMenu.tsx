"use client";

import { useState } from "react";
import {
  User,
  Settings,
  LogOut,
  Users,
  Key,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserSettingsModal from "./userSettingsModal";
import Link from "next/link";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {user.fullName}
            </div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">
                {user.fullName}
              </div>
              <div className="text-xs text-gray-500">@{user.username}</div>
              <div className="text-xs text-blue-600 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettings(true);
                setShowMenu(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="w-4 h-4 mr-3" />
              ตั้งค่าบัญชี
            </button>

            {user.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setShowMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Key className="w-4 h-4 mr-3" />
                จัดการผู้ใช้
              </Link>
            )}

            {user.role === "admin" && (
              <Link
                href="/admin/logs"
                onClick={() => setShowMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Clock className="w-4 h-4 mr-3" />
                ดู Log
              </Link>
            )}

            <div className="border-t border-gray-100 mt-1 pt-1">
              <Link
                href="/login"
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                ออกจากระบบ
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User Settings Modal */}
      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}
