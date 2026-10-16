'use client'

import { useState } from "react";
import { Award } from "lucide-react";
import { selectBestAnswer } from "@/app/actions/qa";
import { useRouter } from "next/navigation";

interface BestAnswerButtonProps {
  questionId: string;
  answerId: string;
  isBest: boolean;
}

export default function BestAnswerButton({
  questionId,
  answerId,
  isBest,
}: BestAnswerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectBest = async () => {
    if (isBest || isLoading) return;
    if (!confirm("この回答をベストアンサーに選びますか？")) return;

    setIsLoading(true);
    try {
      await selectBestAnswer(questionId, answerId);
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "ベストアンサーの選択に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  if (isBest) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleSelectBest}
      disabled={isLoading}
      className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
    >
      <Award size={13} className="text-amber-600" />
      {isLoading ? "設定中..." : "ベストアンサーに選ぶ"}
    </button>
  );
}
