import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FearlessMode } from "../types/fearless";

interface FearlessModeSelectorProps {
  currentMode: FearlessMode;
  onModeChange: (mode: FearlessMode) => void;
  disabled?: boolean;
}

export const FearlessModeSelector = ({
  currentMode,
  onModeChange,
  disabled = false,
}: FearlessModeSelectorProps) => {
  const modes: Array<{ value: FearlessMode; label: string; description: string }> = [
    {
      value: "none",
      label: "논 피어리스",
      description: "일반 모드 - 제한 없음",
    },
    {
      value: "soft",
      label: "소프트 피어리스",
      description: "자기 팀이 선택했던 챔피언만 제한",
    },
    {
      value: "hard",
      label: "하드 피어리스",
      description: "양 팀 모두 선택했던 챔피언 제한",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-2">⚔️ 피어리스 모드</h2>
      <p className="text-sm text-gray-600 mb-4">
        게임 세트 간 챔피언 선택 제한 규칙
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            disabled={disabled}
            className={`p-4 rounded-xl text-left transition-all border-2 ${
              currentMode === mode.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="font-bold text-sm text-gray-900 mb-1">
              {mode.label}
            </div>
            <div className="text-xs text-gray-600 wrap-break-word">
              {mode.description}
            </div>
          </button>
        ))}
      </div>

      {/* 모드 설명 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
        <p className="font-semibold text-sm text-gray-900 mb-2">📖 상세 설명</p>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="wrap-break-word">
            <span className="font-semibold text-gray-900">논 피어리스:</span> 제한 없음
          </li>
          <li className="wrap-break-word">
            <span className="font-semibold text-gray-900">소프트:</span> 자기 팀 선택 챔피언만 제한
          </li>
          <li className="wrap-break-word">
            <span className="font-semibold text-gray-900">하드:</span> 양 팀 모든 챔피언 제한
          </li>
        </ul>
      </div>
    </div>
  );
};

