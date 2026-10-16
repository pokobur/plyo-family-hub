export interface Question {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  category: string;
  author: string;
  likes: number;
  views: number;
  created_at: string;
  answers?: { count: number }[];
  question_likes?: { count: number }[];
}

export interface Answer {
  id: string;
  user_id: string | null;
  question_id: string;
  body: string;
  author: string;
  likes: number;
  is_best: boolean;
  created_at: string;
}

export interface RecommendedItem {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  image_url: string | null;
  platform: "Amazon" | "楽天" | "plyo.blog" | "その他" | string;
  original_url: string;
  affiliate_url: string | null;
  rating: number;
  category: string;
  author: string;
  likes: number;
  created_at: string;
  item_likes?: { count: number }[];
}

export type GiftStatus = "open" | "matched" | "completed";

export interface GiftApplication {
  id: string;
  gift_item_id: string;
  applicant_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface GiftMessage {
  id: string;
  gift_item_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export interface GiftItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  delivery_method: string;
  prefecture: string;
  city: string;
  location_hint?: string | null;
  status: GiftStatus;
  selected_receiver_id?: string | null;
  created_at: string;
  applications?: GiftApplication[];
  messages?: GiftMessage[];
}
