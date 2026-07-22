"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/slices/authApiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store/hooks";
import { setCredentials } from "@/redux/slices/authSlice";

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const hasUser = !!user || isAuthenticated;

  // Execute getMe in background to check if cookie session is active
  const { data: meData } = useGetMeQuery(undefined);

  useEffect(() => {
    if (meData) {
      const userData = (meData as any)?.data || meData;
      if (userData?.user || userData?.id) {
        dispatch(setCredentials(userData));
        router.replace("/dashboard");
      }
    }
  }, [meData, dispatch, router]);

  useEffect(() => {
    if (hasUser) {
      router.replace("/dashboard");
    }
  }, [hasUser, router]);

  // If user is already authenticated, return null while redirecting to /dashboard
  if (hasUser) {
    return null;
  }

  // Render auth page children (login / signup) instantly without any dashboard skeleton flash
  return <>{children}</>;
}
