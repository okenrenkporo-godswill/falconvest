"use client";

import { Button, Input, Card, CardBody, CardHeader, Form, Alert } from "@heroui/react";
import { adminLoginAction } from "@/actions/auth";
import { useState } from "react";

export default function CpanelLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await adminLoginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card shadow="none" isBlurred className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 items-center">
          <img src="/images/logo.png" alt="MasterSync" className="w-16 h-16" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">cPanel Login</h1>
            <p className="text-sm text-default-600">Sign in to control panel</p>
          </div>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="admin@mastersync.com"
              isRequired
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) return "Please enter your email";
                if (validationDetails.typeMismatch) return "Please enter a valid email";
              }}
            />
            <Input
              name="password"
              type="password"
              label="Password"
              isRequired
              errorMessage={({ validationDetails }) => {
                if (validationDetails.valueMissing) return "Please enter your password";
              }}
            />
            {error && (
              <Alert color="danger" title="Error">
                {error}
              </Alert>
            )}
            <Button type="submit" color="primary" className="w-full" isLoading={loading}>
              Login
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
