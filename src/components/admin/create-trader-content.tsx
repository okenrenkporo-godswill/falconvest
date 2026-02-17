"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Avatar,
  addToast,
  Select,
  SelectItem,
} from "@heroui/react";
import { createTrader } from "@/actions/admin-trader-details";
import { ArrowLeft, Upload, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CreateTraderContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<{ base64: string; size: number } | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    display_name: "",
    bio: "",
    risk_score: 5,
    min_copy_amount: 100,
    max_followers: 0,
    commission_rate: 10,
    total_followers: 0,
    total_profit: 0,
    win_rate: 0,
    total_trades: 0,
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({
        title: "File too large",
        description: "File size must be less than 2MB",
        color: "danger",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarPreview(base64String);
      const base64Data = base64String.split(",")[1];
      setAvatarFile({ base64: base64Data, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.email || !formData.password || !formData.username || !formData.first_name || !formData.last_name || !formData.country || !formData.display_name) {
      addToast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        color: "danger",
      });
      return;
    }

    if (formData.password.length < 8) {
      addToast({
        title: "Invalid password",
        description: "Password must be at least 8 characters",
        color: "danger",
      });
      return;
    }

    setSaving(true);
    const result = await createTrader({
      ...formData,
      avatar: avatarFile,
    });

    if (result.success) {
      addToast({
        title: "Success",
        description: "Trader created successfully",
        color: "success",
      });
      router.push("/cpanel/traders");
    } else {
      addToast({
        title: "Creation failed",
        description: result.error || "Failed to create trader",
        color: "danger",
      });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          href="/cpanel/traders"
          isIconOnly
          variant="flat"
          size="sm"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Create New Trader</h1>
          <p className="text-sm text-default-500 mt-1">
            Create a new trader account with full profile
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardHeader className="p-4 sm:p-6 border-b border-default-200 dark:border-default-100">
          <h2 className="text-lg font-bold">Account Information</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar
              src={avatarPreview || undefined}
              icon={<User size={32} />}
              className="w-20 h-20 sm:w-24 sm:h-24"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-2">Profile Picture</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                as="label"
                htmlFor="avatar-upload"
                size="sm"
                variant="flat"
                startContent={<Upload size={16} />}
              >
                Upload Picture
              </Button>
              <p className="text-xs text-default-400 mt-2">
                Recommended: Square image, at least 200x200px, max 2MB
              </p>
            </div>
          </div>

          {/* Auth Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="trader@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              isRequired
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              isRequired
              description="Minimum 8 characters"
            />
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              isRequired
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              isRequired
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              isRequired
            />
          </div>

          <Input
            label="Country"
            placeholder="United States"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            isRequired
          />
        </CardBody>
      </Card>

      {/* Trader Info */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardHeader className="p-4 sm:p-6 border-b border-default-200 dark:border-default-100">
          <h2 className="text-lg font-bold">Trader Information</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              placeholder="Trading Pro"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              isRequired
              description="Public name shown to users"
            />
            <Input
              label="Risk Score (1-10)"
              type="number"
              min="1"
              max="10"
              value={formData.risk_score.toString()}
              onChange={(e) => setFormData({ ...formData, risk_score: parseInt(e.target.value) || 5 })}
            />
          </div>

          <Textarea
            label="Bio"
            placeholder="Professional trader with 5+ years experience..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            minRows={3}
            description="Public bio shown to users"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Copy Amount"
              type="number"
              startContent={<span className="text-default-400">$</span>}
              value={formData.min_copy_amount.toString()}
              onChange={(e) => setFormData({ ...formData, min_copy_amount: parseFloat(e.target.value) || 100 })}
            />
            <Input
              label="Max Followers"
              type="number"
              value={formData.max_followers.toString()}
              onChange={(e) => setFormData({ ...formData, max_followers: parseInt(e.target.value) || 0 })}
              description="0 = unlimited"
            />
          </div>

          <Input
            label="Commission Rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            endContent={<span className="text-default-400">%</span>}
            value={formData.commission_rate.toString()}
            onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 10 })}
          />

          {/* Initial Stats */}
          <div className="border-t border-default-200 dark:border-default-100 pt-6">
            <h3 className="text-sm font-semibold mb-4">Initial Statistics (Optional)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="Followers"
                type="number"
                value={formData.total_followers.toString()}
                onChange={(e) => setFormData({ ...formData, total_followers: parseInt(e.target.value) || 0 })}
                size="sm"
              />
              <Input
                label="Total Profit"
                type="number"
                step="0.01"
                startContent={<span className="text-default-400 text-xs">$</span>}
                value={formData.total_profit.toString()}
                onChange={(e) => setFormData({ ...formData, total_profit: parseFloat(e.target.value) || 0 })}
                size="sm"
              />
              <Input
                label="Win Rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                endContent={<span className="text-default-400 text-xs">%</span>}
                value={formData.win_rate.toString()}
                onChange={(e) => setFormData({ ...formData, win_rate: parseFloat(e.target.value) || 0 })}
                size="sm"
              />
              <Input
                label="Total Trades"
                type="number"
                value={formData.total_trades.toString()}
                onChange={(e) => setFormData({ ...formData, total_trades: parseInt(e.target.value) || 0 })}
                size="sm"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="flat"
              onPress={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              startContent={<Save size={18} />}
              onPress={handleCreate}
              isLoading={saving}
            >
              Create Trader
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
