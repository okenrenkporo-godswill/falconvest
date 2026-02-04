"use client";

import { Button, Input, Card, CardBody, CardHeader, Form } from "@heroui/react";
import { Alert } from "@heroui/alert";
import { loginAction } from "@/actions/auth";
import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-default-600">Sign in to admin panel</p>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              labelPlacement="outside"
              placeholder="admin@mastersync.com"
              isRequired
              errorMessage={({validationDetails}) => {
                if (validationDetails.valueMissing) return "Please enter your email";
                if (validationDetails.typeMismatch) return "Please enter a valid email";
              }}
            />
            <Input
              name="password"
              type="password"
              label="Password"
              labelPlacement="outside"
              isRequired
              errorMessage={({validationDetails}) => {
                if (validationDetails.valueMissing) return "Please enter your password";
              }}
            />

            {error && (
              <Alert color="danger" title="Error">
                {error}
              </Alert>
            )}

            <Button type="submit" color="primary" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
