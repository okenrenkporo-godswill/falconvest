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
      <div className="min-h-screen flex items-center justify-center py-7">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold">Verify your login</h1>
          </CardHeader>

          <CardBody className="gap-6">
            <Alert color="primary">Code sent to {email}</Alert>

            <Form onSubmit={handleOtpSubmit}>
              <InputOtp name="token" length={6} size="lg" />

              <Button type="submit" isLoading={loading} className="w-full mt-4">
                Verify
              </Button>
            </Form>

            <Divider />

            <Button onPress={handleResendOtp} isLoading={resending}>
              Resend OTP
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ================= LOGIN STEP =================
  return (
    <div className="min-h-screen flex items-center justify-center py-7">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Sign in</h1>
        </CardHeader>

        <CardBody className="gap-6">
          {error && <Alert color="danger">{error}</Alert>}

          <Form onSubmit={handleCredentialsSubmit}>
            <Input name="email" type="email" label="Email" isRequired />

            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              label="Password"
              isRequired
              endContent={
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? <EyeOff /> : <Eye />}
                </button>
              }
            />

            <Button type="submit" isLoading={loading} className="w-full mt-4">
              Continue
            </Button>
          </Form>

          <Divider />

          <Link href="/register">Create account</Link>
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