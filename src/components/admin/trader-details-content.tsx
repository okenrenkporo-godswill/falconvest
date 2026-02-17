"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Avatar,
  Skeleton,
  Chip,
  addToast,
} from "@heroui/react";
import { getTraderDetails, updateTraderInfo, uploadTraderAvatar } from "@/actions/admin-trader-details";
import { ArrowLeft, Upload, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TraderDetailsContentProps = {
  traderId: string;
};

export function TraderDetailsContent({ traderId }: TraderDetailsContentProps) {
  const router = useRouter();
  const [trader, setTrader] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    loadTrader();
  }, [traderId]);

  const loadTrader = async () => {
    setLoading(true);
    const result = await getTraderDetails(traderId);
    if (result.trader) {
      setTrader(result.trader);
      setFormData({
        display_name: result.trader.display_name || "",
        bio: result.trader.bio || "",
        risk_score: result.trader.risk_score || 5,
        min_copy_amount: result.trader.min_copy_amount || 100,
        max_followers: result.trader.max_followers || 0,
        commission_rate: result.trader.commission_rate || 10,
        total_followers: result.trader.total_followers || 0,
        total_profit: result.trader.total_profit || 0,
        win_rate: result.trader.win_rate || 0,
        total_trades: result.trader.total_trades || 0,
      });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast({
        title: "File too large",
        description: "File size must be less than 2MB",
        color: "danger",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1]; // Remove data:image/jpeg;base64, prefix
      
      setUploading(true);
      const result = await uploadTraderAvatar(traderId, {
        base64: base64Data,
        size: file.size,
      });
      
      if (result.success) {
        setTrader({ ...trader, avatar_url: result.avatar_url });
        addToast({
          title: "Success",
          description: "Avatar uploaded successfully",
          color: "success",
        });
      } else {
        addToast({
          title: "Upload failed",
          description: result.error || "Failed to upload avatar",
          color: "danger",
        });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateTraderInfo(traderId, formData);
    if (result.success) {
      addToast({
        title: "Success",
        description: "Trader updated successfully",
        color: "success",
      });
      loadTrader();
    } else {
      addToast({
        title: "Update failed",
        description: result.error || "Failed to update trader",
        color: "danger",
      });
    }
    setSaving(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-6 space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">Trader not found</p>
      </div>
    );
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold">Trader Details</h1>
          <p className="text-sm text-default-500 mt-1">
            Update trader information and settings
          </p>
        </div>
        <Chip
          color={
            trader.status === "active"
              ? "success"
              : trader.status === "pending"
              ? "warning"
              : "default"
          }
        >
          {trader.status}
        </Chip>
      </div>

      {/* Stats Cards - Mobile Stacked, Desktop Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-default-500 mb-2">Followers</p>
            <Input
              type="number"
              value={formData.total_followers.toString()}
              onChange={(e) => setFormData({ ...formData, total_followers: parseInt(e.target.value) || 0 })}
              size="sm"
              classNames={{ input: "text-xl sm:text-2xl font-bold" }}
            />
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-default-500 mb-2">Total Profit</p>
            <Input
              type="number"
              step="0.01"
              value={formData.total_profit.toString()}
              onChange={(e) => setFormData({ ...formData, total_profit: parseFloat(e.target.value) || 0 })}
              size="sm"
              startContent={<span className="text-success">$</span>}
              classNames={{ input: "text-xl sm:text-2xl font-bold text-success" }}
            />
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-default-500 mb-2">Win Rate</p>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.win_rate.toString()}
              onChange={(e) => setFormData({ ...formData, win_rate: parseFloat(e.target.value) || 0 })}
              size="sm"
              endContent={<span>%</span>}
              classNames={{ input: "text-xl sm:text-2xl font-bold" }}
            />
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-3 sm:p-4">
            <p className="text-xs text-default-500 mb-2">Total Trades</p>
            <Input
              type="number"
              value={formData.total_trades.toString()}
              onChange={(e) => setFormData({ ...formData, total_trades: parseInt(e.target.value) || 0 })}
              size="sm"
              classNames={{ input: "text-xl sm:text-2xl font-bold" }}
            />
          </CardBody>
        </Card>
      </div>

      {/* Edit Form */}
      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardHeader className="p-4 sm:p-6 border-b border-default-200 dark:border-default-100">
          <h2 className="text-lg font-bold">Trader Information</h2>
        </CardHeader>
        <CardBody className="p-4 sm:p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar
              src={trader.avatar_url || undefined}
              name={trader.display_name}
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
                isLoading={uploading}
              >
                {uploading ? "Uploading..." : "Upload New Picture"}
              </Button>
              <p className="text-xs text-default-400 mt-2">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              placeholder="Enter trader name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              isRequired
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
            placeholder="Enter trader bio/description"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            minRows={3}
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
              label="Max Followers (0 = unlimited)"
              type="number"
              value={formData.max_followers.toString()}
              onChange={(e) => setFormData({ ...formData, max_followers: parseInt(e.target.value) || 0 })}
            />
          </div>

          <Input
            label="Commission Rate (%)"
            type="number"
            min="0"
            max="100"
            endContent={<span className="text-default-400">%</span>}
            value={formData.commission_rate.toString()}
            onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 10 })}
          />

          {/* Save Button */}
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
              onPress={handleSave}
              isLoading={saving}
            >
              Save Changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
