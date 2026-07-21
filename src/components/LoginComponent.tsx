"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { useLoginMutation } from "@/redux/slices/authApiSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/slices/authSlice";
import AuthShowcase from "@/components/auth/AuthShowcase";
export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    try {
      const response = await login({
        email,
        password,
      }).unwrap();

      console.log("Login response:", response);

      const userPayload = response?.data?.user || response?.user || response;
      dispatch(
        setCredentials(userPayload)
      );

      router.replace("/");
    } catch (err: any) {
      setError(
        err?.data?.error?.message ||
        err?.data?.message ||
        (typeof err?.data?.error === "string" ? err?.data?.error : null) ||
        err?.message ||
        "Invalid email or password."
      );
    }
  };

  const inputClasses = "block w-full border-b border-[#1B2A4A]/20 py-3.5 pl-11 pr-3 text-[#1B2A4A] placeholder:text-[#6B7A90] bg-transparent transition-all duration-300 focus:border-[#C41E2A] focus:shadow-[0_4px_12px_rgba(196,30,42,0.08)] focus:outline-none focus:ring-0 sm:text-sm";

  return (
    <div className="relative flex flex-col lg:flex-row min-h-screen bg-white font-sans overflow-hidden">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-[#1B2A4A]/60 hover:text-[#1B2A4A] bg-[#F4F5F8] hover:bg-[#E8ECF1] px-4 py-2.5 rounded-xl border border-[#1B2A4A]/10 transition-all duration-300 group shadow-sm"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Back</span>
      </Link>

      {/* Left Pane: Form */}
      <div className="flex-1 lg:flex-initial lg:w-[45%] xl:w-[40%] flex flex-col justify-start px-6 py-16 lg:py-24 z-10 relative bg-white border-r border-[#1B2A4A]/10 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-md mx-auto relative z-10 my-auto">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start mb-12">
            <Link href="/">
              <Image
                src="/gptlogo.png"
                alt="Alayn — AI Operating System for Hospitality"
                width={1280}
                height={297}
                style={{ 
                  height: "56px", 
                  width: "auto",
                  transform: "scale(1.8)",
                  transformOrigin: "left center"
                }}
                className="w-auto object-contain"
                priority
              />
            </Link>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B2A4A] font-serif">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#6B7A90] font-medium leading-relaxed">
              Please enter your details to sign in and manage your operations.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-[#C41E2A]/10 p-4 text-sm text-[#C41E2A] border border-[#C41E2A]/20 font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7A90] mb-2">
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
                  <Mail className="h-4.5 w-4.5 text-[#1B2A4A]/40 transition-colors" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@alayn.com"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7A90] mb-2">
                  Password
                </label>
                <div className="text-sm">
                  <Link href="#" className="font-semibold text-[#C41E2A] hover:text-[#b01e23] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
                  <Lock className="h-4.5 w-4.5 text-[#1B2A4A]/40" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClasses.replace("pr-3", "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-1 text-[#1B2A4A]/40 hover:text-[#1B2A4A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E2A] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-[#b01e23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C41E2A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-[1px] cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            
            <p className="text-center lg:text-left text-sm text-[#6B7A90] font-medium mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#C41E2A] hover:text-[#b01e23] transition-colors">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Pane: Interactive Bento Grid Showcase */}
      <div className="hidden lg:block lg:flex-1 relative">
        <AuthShowcase />
      </div>
    </div>
  );
}