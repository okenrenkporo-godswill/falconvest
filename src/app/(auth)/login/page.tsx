"use client";

import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Form,
  Divider,
  Alert,
  addToast,
} from "@heroui/react";

import Image from "next/image";
import dynamic from "next/dynamic";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { loginAction, loginVerifyOtpAction } from "@/actions/auth";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 🚀 Fix: prevent SSR crash for OTP input
const InputOtp = dynamic(
  () => import("@heroui/react").then((m) => m.InputOtp),
  { ssr: false }
);

function LoginContent() {
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // ✅ Safe param extraction
  const errorParam = searchParams?.get("error");
  const reasonParam = searchParams?.get("reason");

  useEffect(() => {
    if (errorParam === "account_suspended") {
      setError(
        reasonParam ||
        "Your account has been suspended. Please contact support."
      );
    }
  }, [errorParam, reasonParam]);

  async function handleResendOtp() {
    setResending(true);
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        addToast({
          title: "Success",
          description: "New OTP sent to your email",
          color: "success",
        });
      }
    } catch {
      setError("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;

    setEmail(emailValue);
    setPassword(passwordValue);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({ title: "Error", description: result.error, color: "danger" });
      } else {
        addToast({
          title: "Success",
          description: "OTP sent to your email",
          color: "success",
        });
        setStep("otp");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("email", email);

    try {
      const result = await loginVerifyOtpAction(formData);

      if (result?.error) {
        setError(result.error);
        addToast({ title: "Error", description: result.error, color: "danger" });
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // ================= OTP STEP =================
  if (step === "otp") {
    return (
      <div className="w-full">
        <Card shadow="none" className="bg-transparent dark:bg-transparent border-none px-0">
          <CardHeader className="flex flex-col items-center px-0 pt-0 pb-8 space-y-6 text-center">
            <Link href="/" className="transition-transform hover:scale-105 flex flex-col items-center gap-2">
              {/* New Dynamic Logo */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
                <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                  <path 
                      d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                      fill="url(#login-otp-grad-1)" 
                  />
                  <path 
                      d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                      fill="url(#login-otp-grad-2)" 
                  />
                  <defs>
                      <linearGradient id="login-otp-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7eb2bd" />
                          <stop offset="100%" stopColor="#33525c" />
                      </linearGradient>
                      <linearGradient id="login-otp-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#a9ccd3" />
                          <stop offset="100%" stopColor="#5399a7" />
                      </linearGradient>
                  </defs>
                </svg>
              </div>
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Verify Identity
              </h1>
              <p className="text-sm text-default-500 font-medium tracking-wide">
                Please enter the code sent to your email
              </p>
            </div>
          </CardHeader>

          <CardBody className="gap-8 p-0">
            <Alert 
              color="primary" 
              variant="flat"
              className="bg-[#33525c]/10 text-[#33525c] border-none font-semibold text-xs"
            >
              Verification code sent to {email}
            </Alert>

            <Form onSubmit={handleOtpSubmit} className="space-y-6">
              <div key="otp-container" className="flex justify-center py-4">
                <InputOtp 
                  name="token" 
                  length={6} 
                  size="lg"
                  variant="flat"
                  classNames={{
                    input: "bg-black/5 dark:bg-white/5 border-none focus:ring-2 ring-[#33525c]/50"
                  }}
                />
              </div>

              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20"
              >
                Verify & Login
              </Button>
            </Form>

            <Divider className="bg-black/5 dark:bg-white/5" />

            <div className="flex flex-col gap-3">
              <Button 
                onPress={handleResendOtp} 
                isLoading={resending}
                variant="light"
                className="text-sm font-semibold text-default-500 hover:text-[#33525c]"
              >
                Resend code
              </Button>
              <Button 
                onPress={() => setStep("credentials")}
                variant="light"
                className="text-sm font-semibold text-default-400"
              >
                ← Back to sign in
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ================= LOGIN STEP =================
  return (
    <div className="w-full">
      <Card shadow="none" className="bg-transparent dark:bg-transparent border-none px-0">
        <CardHeader className="flex flex-col items-center px-0 pt-0 pb-8 space-y-6 text-center">
          <Link href="/" className="transition-transform hover:scale-105 flex flex-col items-center gap-2">
            {/* New Dynamic Logo */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 bg-[#7eb2bd]/20 dark:bg-[#33525c]/20 blur-md rounded-full scale-110" />
              <svg viewBox="0 0 100 100" className="w-12 h-12 relative z-10 drop-shadow-[0_2px_8px_rgba(51,82,92,0.3)]">
                <path 
                    d="M 50 10 L 85 45 L 70 50 L 50 25 L 30 50 L 15 45 Z" 
                    fill="url(#login-cred-grad-1)" 
                />
                <path 
                    d="M 50 30 L 90 70 L 65 75 L 50 55 L 35 75 L 10 70 Z" 
                    fill="url(#login-cred-grad-2)" 
                />
                <defs>
                    <linearGradient id="login-cred-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7eb2bd" />
                        <stop offset="100%" stopColor="#33525c" />
                    </linearGradient>
                    <linearGradient id="login-cred-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a9ccd3" />
                        <stop offset="100%" stopColor="#5399a7" />
                    </linearGradient>
                </defs>
              </svg>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Sign In
            </h1>
            <p className="text-sm text-default-500 font-medium tracking-wide">
              Enter your details to access your account
            </p>
          </div>
        </CardHeader>

        <CardBody className="gap-8 p-0">
          {error && (
            <Alert 
              color="danger" 
              variant="flat" 
              className="font-semibold text-xs"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <Input 
              name="email" 
              type="email" 
              label="Email" 
              variant="flat"
              isRequired 
              labelPlacement="outside"
              placeholder="name@example.com"
              classNames={{
                label: "text-xs font-bold text-default-600 ml-1",
                inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
              }}
            />

            <div className="space-y-2">
              <Input
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                label="Password"
                variant="flat"
                isRequired
                labelPlacement="outside"
                placeholder="••••••••"
                classNames={{
                  label: "text-xs font-bold text-default-600 ml-1",
                  inputWrapper: "h-14 bg-black/5 dark:bg-white/5 group-data-[focus=true]:bg-black/10 dark:group-data-[focus=true]:bg-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl border-none",
                  input: "font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 placeholder:opacity-100"
                }}
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="text-neutral-400 hover:text-[#33525c] transition-colors p-1"
                  >
                    {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
              <div className="flex justify-end pr-1">
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-bold text-[#33525c] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button 
              type="submit" 
              isLoading={loading} 
              className="w-full bg-[#33525c] text-white font-bold h-14 rounded-xl hover:scale-[1.01] transition-transform shadow-xl shadow-[#33525c]/20 mt-4"
            >
              Sign In
            </Button>
          </Form>

          <Divider className="bg-black/5 dark:bg-white/5" />

          <div className="text-center pb-4">
            <span className="text-sm font-medium text-default-500 mr-2">
              Don&apos;t have an account?
            </span>
            <Link 
              href="/register" 
              className="text-sm font-bold text-[#33525c] hover:underline transition-colors"
            >
              Register now
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ✅ Suspense wrapper (important)
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
