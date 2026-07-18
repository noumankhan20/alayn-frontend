"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid credentials. Please verify your email and password.");
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans">
      {/* LHS: Large Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1221] relative overflow-hidden flex-col justify-center items-center p-12">
        {/* Subtle geometric design elements using Theme Red and Theme Blue */}
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#D3232A]/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 w-full max-w-md text-center flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl mb-8 max-w-sm transition-transform duration-300 hover:scale-[1.02]">
            <Image
              src="/image.png"
              alt="ALAYN Logo"
              width={280}
              height={80}
              className="w-auto h-auto object-contain mx-auto"
              priority
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = "none";
              }}
            />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 tracking-wide font-serif">
            ALAYN <span className="text-[#D3232A]">AI</span>
          </h3>
          <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
            State-of-the-art restaurant operations, performance tracking, and machine learning insights.
          </p>
        </div>
      </div>

      {/* Mobile Header: compact brand bar (logo + wordmark inline) */}
      <div className="lg:hidden relative overflow-hidden bg-[#0B1221] px-6 pt-8 pb-10">
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[#D3232A]/20 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-lg p-2">
            <Image
              src="/image.png"
              alt="ALAYN Logo"
              width={40}
              height={40}
              className="w-auto h-auto max-h-8 object-contain"
              priority
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = "none";
              }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide font-serif leading-tight">
              ALAYN <span className="text-[#D3232A]">AI</span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">
              Restaurant operations platform
            </p>
          </div>
        </div>
      </div>

      {/* RHS: Login Form (rises over the mobile header as a rounded sheet) */}
      <div className="relative z-10 -mt-5 flex w-full flex-1 flex-col justify-center rounded-t-3xl bg-white px-6 py-8 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:mt-0 lg:w-1/2 lg:rounded-none lg:px-16 lg:py-12 lg:shadow-none xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1221] font-serif">
              Welcome back
            </h2>
            <p className="mt-2.5 text-sm text-gray-500 font-medium">
              Please enter your details to sign in and manage your operations.
            </p>
          </div>

          <div className="mt-8 sm:mt-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-[#D3232A] border border-red-100/80 font-medium">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-[#0B1221]">
                  Email Address
                </label>
                <div className="relative mt-2 rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-5 w-5 text-gray-400 focus-within:text-[#D3232A]" aria-hidden="true" />
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
                    className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm sm:leading-6 bg-gray-50/50 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold leading-6 text-[#0B1221]">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link href="#" className="font-semibold text-[#D3232A] hover:text-[#b01e23] transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="relative mt-2 rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                    className="block w-full rounded-xl border-0 py-3.5 pl-11 pr-10 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm sm:leading-6 bg-gray-50/50 focus:bg-white transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#D3232A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D3232A] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-md hover:bg-[#b01e23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3232A] disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-[1px]"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}