import { getGiftItem } from "@/app/actions/gifts";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import GiftDetailClient from "./GiftDetailClient";

interface GiftDetailPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Dynamic rendering for real-time status shifts

export default async function GiftDetailPage({ params }: GiftDetailPageProps) {
  const { id } = await params;
  const item = await getGiftItem(id);

  if (!item) {
    notFound();
  }

  // Get current logged in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || null;

  // Fetch applications using authenticated client dynamically (to bypass RLS/caching issues)
  let applications: any[] = [];
  if (currentUserId) {
    const { data: appData } = await supabase
      .from('gift_applications')
      .select('*')
      .eq('gift_item_id', id);
    applications = appData || [];
  }

  const itemWithApplications = {
    ...item,
    applications,
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12">
      {/* Breadcrumbs / Back link */}
      <Link href="/gifts" className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors w-fit font-bold">
        <ArrowLeft size={16} /> お譲り一覧に戻る
      </Link>

      {/* Main Details Wrapper */}
      <GiftDetailClient item={itemWithApplications} currentUserId={currentUserId} />
    </div>
  );
}
