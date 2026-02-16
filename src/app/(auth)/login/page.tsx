"use client";

import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Form,
  Divider,
} from "@heroui/react";
import { Alert, addToast, InputOtp } from "@heroui/react";

import Link from "next/link";
import { loginAction, loginVerifyOtpAction } from "@/actions/auth";
import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

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
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
      } else {
        addToast({
          title: "Success",
          description: "New OTP sent to your email",
          color: "success",
        });
      }
    } catch (error) {
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
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
        setLoading(false);
      } else {
        addToast({
          title: "Success",
          description: "OTP sent to your email",
          color: "success",
        });
        setStep("otp");
        setLoading(false);
      }
    } catch (error) {
      setError("An error occurred");
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
        addToast({
          title: "Error",
          description: result.error,
          color: "danger",
        });
        setLoading(false);
      }
      // Success redirects automatically
    } catch (error) {
      setError("An error occurred");
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <div className="min-h-full flex items-center justify-center py-7 relative">
        <Card isBlurred shadow="none" className="w-full max-w-md">
          <CardHeader className="flex flex-col gap-2 items-start pb-6">
            <h1 className="text-2xl font-bold">Verify your login</h1>
            <p className="text-sm text-default-600">
              Enter the code sent to {email}
            </p>
          </CardHeader>
          <CardBody className="gap-6">
            <Alert
              color="primary"
              variant="faded"
              className="text-xs"
              title="Check your email"
            >
              We sent a 6-digit verification code to {email}
            </Alert>

            <Form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Verification Code</label>
                <div key="otp-input">
                  <InputOtp name="token" length={6} size="lg" isRequired />
                </div>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading}
              >
                Verify & Sign In
              </Button>
            </Form>

            <Divider />

            <div className="text-center  space-y-2">
              <Button
                variant="light"
                size="sm"
                onPress={handleResendOtp}
                isLoading={resending}
                isDisabled={loading}
              >
                Resend OTP
              </Button>
              <Button
                variant="light"
                size="sm"
                onPress={() => setStep("credentials")}
                isDisabled={loading || resending}
              >
                ← Back to login
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center py-7 relative">
      <Card isBlurred shadow="none" className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 items-start pb-6">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-default-600">
            Sign in to your MasterSync account
          </p>
        </CardHeader>
        <CardBody className="gap-6">
          <Form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              isRequired
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing)
                  return "Please enter your email";
                if (validationDetails.typeMismatch)
                  return "Please enter a valid email";
              }}
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              isRequired
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing)
                  return "Please enter your password";
              }}
            />

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
            >
              Continue
            </Button>
          </Form>

          <Divider />

          <div className="text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline block"
            >
              Forgot password?
            </Link>
            <p className="text-sm text-default-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
