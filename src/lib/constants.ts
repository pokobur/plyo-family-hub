export const EXTERNAL_LINKS = {
  BLOG: "https://plyo.blog",
  GAMES_PORTAL: "https://game.plyo.blog",
  GAMES: {
    AIZUKAN: "https://game.plyo.blog/AIzukan/",
    BATTLESHIP: "https://game.plyo.blog/battleship-study/",
    BRAINROT: "https://game.plyo.blog/brainrot-game/",
    HABIT: "https://game.plyo.blog/habit-diorama/",
    PIXEL: "https://game.plyo.blog/pixel-magic-adventurer/",
    ANIMAL: "https://game.plyo.blog/animal-step/",
  },
} as const;

export const FALLBACK_IMAGES = {
  GIFT: "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  ITEM: "https://images.unsplash.com/photo-1584824486516-0555a07fc511?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
} as const;

export const QA_CATEGORIES = [
  "寝かしつけ",
  "離乳食・食事",
  "イヤイヤ期",
  "知育・おもちゃ",
  "時短・家事",
  "保育園・幼稚園",
  "その他",
] as const;

export const ITEM_CATEGORIES = [
  "知育・おもちゃ",
  "時短・家事",
  "寝かしつけ",
  "お出かけ",
  "離乳食・食事",
  "マタニティ",
  "その他",
] as const;

export const GIFT_CATEGORIES = [
  "衣類",
  "おもちゃ",
  "ベビーカー・バギー",
  "ベビーベッド・寝具",
  "抱っこひも・おんぶ紐",
  "お食事用品",
  "その他",
] as const;

export const GIFT_CONDITIONS = [
  "新品同様",
  "目立った傷や汚れなし",
  "やや傷や汚れあり",
  "使用感あり",
] as const;

export const GIFT_DELIVERY_METHODS = ["手渡し", "郵送", "両方"] as const;

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

/**
 * Prevent Open Redirect vulnerabilities by ensuring redirect target is a relative internal path.
 */
export function getSafeRedirectPath(nextParam: string | null | undefined, fallback = "/"): string {
  if (!nextParam) return fallback;
  const trimmed = nextParam.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return trimmed;
  }
  return fallback;
}
