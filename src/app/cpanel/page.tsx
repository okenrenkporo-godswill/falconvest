"use client";

import { Button, Input, Card, CardBody, CardHeader, Form } from "@heroui/react";
import { Alert } from "@heroui/alert";
import { InputOtp } from "@heroui/input-otp";
import { loginAction, loginVerifyOtpAction } from "@/actions/auth";
import { useState } from "react";

export default function CpanelLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);

    const result = await loginAction(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setStep("otp");
      startCountdown();
    }
  }

  async function handleOtpVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.append("email", email);

    const result = await loginVerifyOtpAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError("");
    setCanResend(false);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", "temp"); // Will use stored password from first attempt

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
    }

    setLoading(false);
    startCountdown();
  }

  function startCountdown() {
    setCountdown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card shadow="none" isBlurred className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 items-center">
          <img src="/images/logo.png" alt="MasterSync" className="w-16 h-16" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">cPanel Login</h1>
            <p className="text-sm text-default-600">
              {step === "credentials"
                ? "Sign in to control panel"
                : "Enter verification code"}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          {step === "credentials" ? (
            <Form onSubmit={handleCredentials} className="space-y-4">
              <Input
                name="email"
                type="email"
                label="Email"
                placeholder="admin@mastersync.com"
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
                isRequired
                errorMessage={({ validationDetails }) => {
                  if (validationDetails.valueMissing)
                    return "Please enter your password";
                }}
              />
              {error && (
                <Alert color="danger" title="Error">
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading}
              >
                Continue
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleOtpVerify} className="space-y-4">
              <Alert color="primary" variant="flat">
                We've sent a 6-digit code to <strong>{email}</strong>
              </Alert>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Verification Code
                </label>
                <div>
                  <InputOtp name="token" length={6} size="lg" isRequired />
                </div>
              </div>
              {error && (
                <Alert color="danger" title="Error">
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={loading}
              >
                Verify & Login
              </Button>
              <div className="text-center">
                {canResend ? (
                  <Button
                    variant="light"
                    size="sm"
                    onPress={handleResendOtp}
                    isLoading={loading}
                  >
                    Resend Code
                  </Button>
                ) : (
                  <p className="text-sm text-default-500">
                    Resend code in {countdown}s
                  </p>
                )}
              </div>
              <Button
                variant="light"
                size="sm"
                onPress={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            </Form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
