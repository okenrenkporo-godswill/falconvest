"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
} from "@heroui/react";
import { Lock, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { updatePasswordAction } from "@/actions/account";
import { addToast } from "@heroui/react";

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword.length < 8)
      newErrors.newPassword = "Password must be at least 8 characters";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);

    const result = await updatePasswordAction(formData);
    setLoading(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Password updated successfully",
        color: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    }
  };

  return (
    <Card className="border-none shadow-md dark:bg-zinc-900">
      <CardHeader className="flex gap-3 pb-0">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Shield size={20} />
        </div>
        <div className="flex flex-col">
          <p className="text-md font-bold">Security Settings</p>
          <p className="text-small text-default-500">Manage your password</p>
        </div>
      </CardHeader>
      <CardBody className="gap-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Lock size={16} className="text-default-400" />
            Update Password
          </p>

          <Input
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            variant="bordered"
            value={currentPassword}
            onValueChange={setCurrentPassword}
            isInvalid={!!errors.currentPassword}
            errorMessage={errors.currentPassword}
            endContent={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="focus:outline-none"
              >
                {showCurrent ? (
                  <EyeOff className="text-default-400" size={20} />
                ) : (
                  <Eye className="text-default-400" size={20} />
                )}
              </button>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type={showNew ? "text" : "password"}
              variant="bordered"
              value={newPassword}
              onValueChange={setNewPassword}
              isInvalid={!!errors.newPassword}
              errorMessage={errors.newPassword}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="focus:outline-none"
                >
                  {showNew ? (
                    <EyeOff className="text-default-400" size={20} />
                  ) : (
                    <Eye className="text-default-400" size={20} />
                  )}
                </button>
              }
            />
            <Input
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              variant="bordered"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="focus:outline-none"
                >
                  {showConfirm ? (
                    <EyeOff className="text-default-400" size={20} />
                  ) : (
                    <Eye className="text-default-400" size={20} />
                  )}
                </button>
              }
            />
          </div>

          <Button type="submit" color="primary" isLoading={loading}>
            Update Password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
