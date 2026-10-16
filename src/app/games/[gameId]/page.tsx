import { redirect } from "next/navigation";
import { EXTERNAL_LINKS } from "@/lib/constants";

const GAME_REDIRECT_MAP: Record<string, string> = {
  aizukan: EXTERNAL_LINKS.GAMES.AIZUKAN,
  battleship: EXTERNAL_LINKS.GAMES.BATTLESHIP,
  brainrot: EXTERNAL_LINKS.GAMES.BRAINROT,
  habit: EXTERNAL_LINKS.GAMES.HABIT,
  pixel: EXTERNAL_LINKS.GAMES.PIXEL,
  animal: EXTERNAL_LINKS.GAMES.ANIMAL,
};

export default async function GameEmbedPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const targetUrl = GAME_REDIRECT_MAP[gameId] || EXTERNAL_LINKS.GAMES_PORTAL;
  redirect(targetUrl);
}
