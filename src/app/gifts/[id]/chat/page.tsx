import { getGiftItem } from "@/app/actions/gifts";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import GiftChatClient from "./GiftChatClient";

interface GiftChatPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0; // Dynamic rendering to fetch real-time messages on load

export default async function GiftChatPage({ params }: GiftChatPageProps) {
  const { id } = await params;
  const item = await getGiftItem(id);

  if (!item) {
    notFound();
  }

  // Get current logged in user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect(`/login?next=/gifts/${id}/chat`);
  }

  // Security check: Only the Giver (owner) or the matched Receiver can access this chat room
  const isOwner = user.id === item.user_id;
  const isMatchedReceiver = user.id === item.selected_receiver_id;

  if (!isOwner && !isMatchedReceiver) {
    // Unauthorized access: Redirect back to item page or gifts home
    redirect(`/gifts/${id}`);
  }

  return (
    <div className="py-2">
      <GiftChatClient item={item} currentUserId={user.id} />
    </div>
  );
}
