"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { validateEmail, validatePassword } from "@/lib/utils/validation";
import { Loader2, CheckCircle2, Mail, Lock, ArrowLeft } from "lucide-react";

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmailStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (otp.length !== 6) {
      newErrors.otp = "Please enter the complete 6-digit OTP";
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error!;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateEmailStep()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to send reset code. Please try again.");
        return;
      }

      // Move to reset password step
      setStep("reset");
      setResendCooldown(60);
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateResetStep()) return;

    setIsResetting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error.includes("OTP") || data.error.includes("expired") || data.error.includes("Invalid")) {
          setErrors({ otp: data.error });
        } else {
          setServerError(data.error || "Failed to reset password. Please try again.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setServerError("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "PasswordReset" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Failed to resend code. Please try again.");
        return;
      }

      setResendCooldown(60);
      setOtp("");
      setErrors({});
    } catch (error) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              {step === "request" ? "Forgot Password?" : "Reset Password"}
            </h1>
            <p className="text-muted-foreground">
              {step === "request"
                ? "Enter your email address and we'll send you a reset code"
                : `Enter the code sent to ${email} and your new password`}
            </p>
          </div>

          <div className="bg-background border border-border rounded-lg p-6 md:p-8">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Password reset successful!</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Your password has been updated successfully.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Redirecting to login...
                  </p>
                </motion.div>
              ) : step === "request" ? (
                <motion.form
                  key="request"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRequestOTP}
                  className="space-y-4"
                >
                  {serverError && (
                    <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      {serverError}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                        setServerError("");
                      }}
                      error={errors.email}
                      placeholder="john@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                    Send Reset Code
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-4"
                >
                  {serverError && (
                    <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      {serverError}
                    </div>
                  )}

                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 text-center">
                      Enter the 6-digit verification code
                    </label>
                    <OTPInput
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        if (errors.otp) setErrors({ ...errors, otp: "" });
                      }}
                      disabled={isResetting}
                      error={errors.otp}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                      New Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      error={errors.password}
                      placeholder="••••••••"
                      disabled={isResetting}
                      autoComplete="new-password"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                      Confirm Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      error={errors.confirmPassword}
                      placeholder="••••••••"
                      disabled={isResetting}
                      autoComplete="new-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isResetting}
                    disabled={otp.length !== 6 || !password || !confirmPassword || isResetting}
                  >
                    Reset Password
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Didn&apos;t receive the code?
                    </p>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0 || isResending}
                      className="text-sm font-medium text-yellow-400 hover:text-yellow-500 disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                    >
                      {isResending ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </span>
                      ) : resendCooldown > 0 ? (
                        `Resend code in ${resendCooldown}s`
                      ) : (
                        "Resend code"
                      )}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("request");
                        setOtp("");
                        setPassword("");
                        setConfirmPassword("");
                        setErrors({});
                        setServerError("");
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to email entry
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
