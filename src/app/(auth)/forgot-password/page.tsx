"use client";

import { Button, Input, Card, CardBody, CardHeader, Form } from "@heroui/react";
import { Alert } from "@heroui/alert";
import { forgotPasswordAction } from "@/actions/auth";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className=" flex items-center justify-center p-4">
        <Card shadow="none" isBlurred className="w-full max-w-md ">
          <CardHeader>
            <h1 className="text-2xl font-bold">Check your email</h1>
          </CardHeader>
          <CardBody>
            <p className="text-default-600">
              If an account exists with that email, we've sent password reset
              instructions.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center p-4">
      <Card shadow="none" isBlurred className="w-full max-w-md shadow-none">
        <CardHeader className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="text-sm text-default-600">
            Enter your email to reset your password
          </p>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit} className="space-y-4">
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
              Send Reset Link
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
