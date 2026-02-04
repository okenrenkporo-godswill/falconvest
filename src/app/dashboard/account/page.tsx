import { Card, CardBody, CardHeader, Input } from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KycUpload } from "@/components/dashboard/kyc-upload";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Personal Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label="Full Name" value={profile.full_name} isReadOnly />
          <Input label="Email" value={profile.email} isReadOnly />
          <Input label="Username" value={profile.username} isReadOnly />
          <Input
            label="Date of Birth"
            value={new Date(profile.date_of_birth).toISOString().split("T")[0]}
            isReadOnly
          />
          <Input label="Country" value={profile.country} isReadOnly />
        </CardBody>
      </Card>

      <KycUpload
        kycStatus={profile.kyc_status}
        rejectionReason={profile.kyc_rejection_reason}
      />
    </div>
  );
}
