"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import InventoryPage from "@/components/Inventory/InventoryPage";

export default function InventoryRoute() {
  return (
    <AuthGuard>
      <InventoryPage />
    </AuthGuard>
  );
}
