import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TraderDetailsContent } from "@/components/admin/trader-details-content";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TraderDetailPage({ params }: Props) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cpanel");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <TraderDetailsContent traderId={id} />;
}
