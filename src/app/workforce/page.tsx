"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import WorkforcePage from "@/components/Workforce/WorkforcePage";

export default function WorkforceRoute() {
  return (
    <AuthGuard>
      <WorkforcePage />
    </AuthGuard>
  );
}
