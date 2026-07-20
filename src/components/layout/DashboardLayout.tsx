"use client";

import React, { useState } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { useBranch } from "@/lib/BranchContext";
import CreateFirstOutletModal from "../CreateFirstOutletModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { branches, loading, isDemo } = useBranch();

  const showRegisterModal = !loading && !isDemo && branches.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7F9]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          {children}
        </main>
      </div>

      {showRegisterModal && <CreateFirstOutletModal />}
    </div>
  );
}
