import { redirect } from "next/navigation";
import { EXTERNAL_LINKS } from "@/lib/constants";

export default function GamesPage() {
  redirect(EXTERNAL_LINKS.GAMES_PORTAL);
}
