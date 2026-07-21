"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { logout, setCredentials } from "@/redux/slices/authSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // If user profile is already present in Redux state, render children instantly (no loader on tab switch)
  const hasUser = !!user || isAuthenticated;

  // Execute getMe query in background to validate HTTP-Only cookie session
  const { data: meData, isLoading, isError } = useGetMeQuery(undefined);

  // Sync user state on getMe success
  useEffect(() => {
    if (meData) {
      const userData = (meData as any)?.data || meData;
      if (userData?.user || userData?.id) {
        dispatch(setCredentials(userData));
      }
    }
  }, [meData, dispatch]);

  // Handle unauthorized session -> logout Redux state and redirect to /login
  useEffect(() => {
    if (isError || (!isLoading && !isAuthenticated && !user)) {
      console.warn("AuthGuard: Session validation failed or unauthenticated. Redirecting to /login...");
      dispatch(logout());
      router.replace("/login");
    }
  }, [isError, isLoading, isAuthenticated, user, dispatch, router]);

  // If user is already loaded in Redux state, render children IMMEDIATELY without flashing any loader screen on tab switch!
  if (hasUser) {
    return <>{children}</>;
  }

  // On fresh cold load when user is not populated yet, display DashboardSkeleton layout
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // If session validation failed or unauthenticated, return null while redirecting
  if (isError || !hasUser) {
    return null;
  }

  return <>{children}</>;
}
