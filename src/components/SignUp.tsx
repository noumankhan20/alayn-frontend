"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    User,
    Mail,
    Phone,
    Lock,
    Store,
    MapPin,
    Landmark,
    Map,
    Globe,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Check,
} from "lucide-react";
import { useRegisterMutation } from "@/redux/slices/authApiSlice"; // adjust this import path to match your project structure

interface SignupFormState {
    // Step 1 — Account
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    // Step 2 — Business
    businessName: string;
    locationsCount: string;
    businessType: string;
    contactDetail: string;
}

type FormErrors = Partial<Record<keyof SignupFormState, string>>;

const INITIAL_FORM_STATE: SignupFormState = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    locationsCount: "",
    businessType: "",
    contactDetail: "",
};

const STEPS = [
    { id: 1, label: "Account" },
    { id: 2, label: "Business" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// Defined outside the component so it keeps a stable identity across renders.
// (Declaring this inside SignupComponent would recreate the component type on
// every render, causing React to remount the input — and drop focus — on
// every keystroke.)
function Field({
    id,
    label,
    icon,
    error,
    children,
}: {
    id: string;
    label: string;
    icon: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold leading-6 text-[#0B1221]">
                {label}
            </label>
            <div className="relative mt-2 rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    {icon}
                </div>
                {children}
            </div>
            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-[#D3232A]">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function SignupComponent() {
    const [step, setStep] = useState<StepId>(1);
    const [formData, setFormData] = useState<SignupFormState>(INITIAL_FORM_STATE);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [register, { isLoading }] = useRegisterMutation();

    const handleChange = (field: keyof SignupFormState) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateStep1 = (): boolean => {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

        if (!formData.fullName.trim()) errors.fullName = "Full name is required.";

        if (!formData.email.trim()) {
            errors.email = "Email address is required.";
        } else if (!emailRegex.test(formData.email)) {
            errors.email = "Enter a valid email address.";
        }

        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(formData.phone)) {
            errors.phone = "Enter a valid phone number.";
        }

        if (!formData.password) {
            errors.password = "Password is required.";
        } else if (formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters.";
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = "Please confirm your password.";
        } else if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = "Passwords do not match.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.businessName.trim()) errors.businessName = "Business name is required.";
        if (!formData.locationsCount.trim()) errors.locationsCount = "Number of locations is required.";
        if (!formData.businessType.trim()) errors.businessType = "Business type is required.";
        if (!formData.contactDetail.trim()) {
            errors.contactDetail = "Contact detail is required.";
        } else if (formData.contactDetail.length < 10) {
            errors.contactDetail = "Contact detail must be at least 10 characters.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const goNext = () => {
        setSubmitError("");
        if (step === 1 && validateStep1()) setStep(2);
    };

    const goBack = () => {
        setSubmitError("");
        setFieldErrors({});
        if (step === 2) setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitSuccess(false);

        if (!validateStep2()) return;

        try {
            await register({
                user: {
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phoneNo: formData.phone,
                },
                tenant: {
                    name: formData.businessName,
                    locationsCount: formData.locationsCount,
                    businessType: formData.businessType,
                    contactDetail: formData.contactDetail,
                },
            }).unwrap();

            setSubmitSuccess(true);
            setTimeout(() => {
                window.location.href = "/login";
            }, 1200);
        } catch (err: any) {
            setSubmitError(
                err?.data?.error?.message ||
                err?.data?.message ||
                (typeof err?.data?.error === "string" ? err?.data?.error : null) ||
                err?.message ||
                "Something went wrong. Please try again."
            );
        }
    };

    const inputClasses =
        "block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm sm:leading-6 bg-gray-50/50 focus:bg-white transition-all duration-200";

    const errorInputClasses =
        "block w-full rounded-xl border-0 py-3.5 pl-11 pr-3 text-gray-900 ring-1 ring-inset ring-red-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#D3232A] sm:text-sm sm:leading-6 bg-red-50/30 focus:bg-white transition-all duration-200";

    const iconClasses = "h-5 w-5 text-gray-400";

    return (
        <div className="flex min-h-screen flex-col lg:flex-row bg-white font-sans">
            {/* LHS: Large Brand Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0B1221] relative overflow-hidden flex-col justify-center items-center p-12">
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

            {/* Mobile Header: compact brand bar, replaces the boxy logo-only block */}
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

            {/* RHS: Signup Form (rises over the mobile header as a rounded sheet) */}
            <div className="relative z-10 -mt-5 flex w-full flex-1 flex-col justify-center rounded-t-3xl bg-white px-6 py-8 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:mt-0 lg:w-1/2 lg:rounded-none lg:px-16 lg:py-12 lg:shadow-none xl:px-24">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1221] font-serif">
                            Create your restaurant
                        </h2>
                        <p className="mt-2.5 text-sm text-gray-500 font-medium">
                            {step === 1 && "Let's start with your admin account details."}
                            {step === 2 && "Now, set up your first outlet."}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="mt-8 flex items-center" aria-label="Signup progress">
                        {STEPS.map((s, idx) => {
                            const isComplete = step > s.id;
                            const isActive = step === s.id;
                            return (
                                <React.Fragment key={s.id}>
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${isComplete
                                                ? "bg-[#D3232A] text-white"
                                                : isActive
                                                    ? "bg-[#0B1221] text-white ring-4 ring-[#0B1221]/10"
                                                    : "bg-gray-100 text-gray-400"
                                                }`}
                                            aria-current={isActive ? "step" : undefined}
                                        >
                                            {isComplete ? <Check className="h-4 w-4" /> : s.id}
                                        </div>
                                        <span
                                            className={`hidden sm:inline text-xs font-semibold uppercase tracking-wider ${isActive || isComplete ? "text-[#0B1221]" : "text-gray-400"
                                                }`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div
                                            className={`mx-3 h-0.5 flex-1 rounded-full transition-colors duration-300 ${step > s.id ? "bg-[#D3232A]" : "bg-gray-100"
                                                }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div className="mt-8">
                        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                            {submitError && (
                                <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-[#D3232A] border border-red-100/80 font-medium">
                                    {submitError}
                                </div>
                            )}

                            {submitSuccess && (
                                <div role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-100/80 font-medium">
                                    Restaurant created successfully. Redirecting to sign in...
                                </div>
                            )}

                            {/* STEP 1 — Account */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <Field id="fullName" label="Full Name" icon={<User className={iconClasses} />} error={fieldErrors.fullName}>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange("fullName")}
                                            placeholder="Jordan Rivera"
                                            aria-invalid={!!fieldErrors.fullName}
                                            aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                                            className={fieldErrors.fullName ? errorInputClasses : inputClasses}
                                        />
                                    </Field>

                                    <Field id="email" label="Email Address" icon={<Mail className={iconClasses} />} error={fieldErrors.email}>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange("email")}
                                            placeholder="name@alayn.com"
                                            aria-invalid={!!fieldErrors.email}
                                            aria-describedby={fieldErrors.email ? "email-error" : undefined}
                                            className={fieldErrors.email ? errorInputClasses : inputClasses}
                                        />
                                    </Field>

                                    <Field id="phone" label="Phone Number" icon={<Phone className={iconClasses} />} error={fieldErrors.phone}>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange("phone")}
                                            placeholder="+91 98765 43210"
                                            aria-invalid={!!fieldErrors.phone}
                                            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                                            className={fieldErrors.phone ? errorInputClasses : inputClasses}
                                        />
                                    </Field>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold leading-6 text-[#0B1221]">
                                            Password
                                        </label>
                                        <div className="relative mt-2 rounded-xl shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Lock className={iconClasses} />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                value={formData.password}
                                                onChange={handleChange("password")}
                                                placeholder="••••••••"
                                                aria-invalid={!!fieldErrors.password}
                                                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                                className={(fieldErrors.password ? errorInputClasses : inputClasses).replace("pr-3", "pr-10")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#D3232A] transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {fieldErrors.password && (
                                            <p id="password-error" className="mt-1.5 text-xs font-medium text-[#D3232A]">
                                                {fieldErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-semibold leading-6 text-[#0B1221]">
                                            Confirm Password
                                        </label>
                                        <div className="relative mt-2 rounded-xl shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                                <Lock className={iconClasses} />
                                            </div>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                autoComplete="new-password"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleChange("confirmPassword")}
                                                placeholder="••••••••"
                                                aria-invalid={!!fieldErrors.confirmPassword}
                                                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                                                className={(fieldErrors.confirmPassword ? errorInputClasses : inputClasses).replace("pr-3", "pr-10")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-[#D3232A] transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirmPassword && (
                                            <p id="confirmPassword-error" className="mt-1.5 text-xs font-medium text-[#D3232A]">
                                                {fieldErrors.confirmPassword}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D3232A] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-md hover:bg-[#b01e23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3232A] transition-all duration-200 hover:-translate-y-[1px]"
                                    >
                                        Continue
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            {/* STEP 2 — First Outlet */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <Field id="businessName" label="Business / Restaurant Name" icon={<Store className={iconClasses} />} error={fieldErrors.businessName}>
                                        <input
                                            id="businessName"
                                            name="businessName"
                                            type="text"
                                            autoComplete="off"
                                            required
                                            value={formData.businessName}
                                            onChange={handleChange("businessName")}
                                            placeholder="Microsoft Cafe"
                                            aria-invalid={!!fieldErrors.businessName}
                                            aria-describedby={fieldErrors.businessName ? "businessName-error" : undefined}
                                            className={fieldErrors.businessName ? errorInputClasses : inputClasses}
                                        />
                                    </Field>

                                    <Field id="locationsCount" label="Number of Locations" icon={<Store className={iconClasses} />} error={fieldErrors.locationsCount}>
                                        <select
                                            id="locationsCount"
                                            name="locationsCount"
                                            required
                                            value={formData.locationsCount}
                                            onChange={handleChange("locationsCount")}
                                            className={fieldErrors.locationsCount ? errorInputClasses.replace("pl-11", "pl-4") : inputClasses.replace("pl-11", "pl-4")}
                                        >
                                            <option value="">Select location range</option>
                                            <option value="1">1 Location</option>
                                            <option value="2-5">2-5 Locations</option>
                                            <option value="6-10">6-10 Locations</option>
                                            <option value="10+">10+ Locations</option>
                                        </select>
                                    </Field>

                                    <Field id="businessType" label="Business Type" icon={<Store className={iconClasses} />} error={fieldErrors.businessType}>
                                        <select
                                            id="businessType"
                                            name="businessType"
                                            required
                                            value={formData.businessType}
                                            onChange={handleChange("businessType")}
                                            className={fieldErrors.businessType ? errorInputClasses.replace("pl-11", "pl-4") : inputClasses.replace("pl-11", "pl-4")}
                                        >
                                            <option value="">Select business type</option>
                                            <option value="restaurant">Restaurant</option>
                                            <option value="cafe">Café</option>
                                            <option value="bar">Bar</option>
                                            <option value="qsr">QSR (Quick Service Restaurant)</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </Field>

                                    <Field id="contactDetail" label="Company Contact Detail (Email / Phone)" icon={<Phone className={iconClasses} />} error={fieldErrors.contactDetail}>
                                        <input
                                            id="contactDetail"
                                            name="contactDetail"
                                            type="text"
                                            required
                                            value={formData.contactDetail}
                                            onChange={handleChange("contactDetail")}
                                            placeholder="contact@company.com or +91 98765 43210"
                                            aria-invalid={!!fieldErrors.contactDetail}
                                            aria-describedby={fieldErrors.contactDetail ? "contactDetail-error" : undefined}
                                            className={fieldErrors.contactDetail ? errorInputClasses : inputClasses}
                                        />
                                    </Field>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={goBack}
                                            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold leading-6 text-[#0B1221] ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1221] transition-all duration-200"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D3232A] px-4 py-3.5 text-sm font-bold leading-6 text-white shadow-md hover:bg-[#b01e23] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3232A] disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-[1px]"
                                        >
                                            {isLoading ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <>
                                                    Create Business
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-sm text-gray-500 font-medium">
                                Already have an account?{" "}
                                <Link href="/login" className="font-semibold text-[#D3232A] hover:text-[#b01e23] transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}