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
    <Card>
      <CardHeader>
        <CardTitle>⚔️ 피어리스 모드</CardTitle>
        <CardDescription>
          게임 세트 간 챔피언 선택 제한 규칙을 설정하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modes.map((mode) => (
            <Button
              key={mode.value}
              variant={currentMode === mode.value ? "default" : "outline"}
              className={`h-auto flex flex-col items-start p-4 ${
                currentMode === mode.value ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => onModeChange(mode.value)}
              disabled={disabled}
            >
              <span className="font-bold text-base mb-1">{mode.label}</span>
              <span className="text-xs text-left opacity-80 font-normal">
                {mode.description}
              </span>
            </Button>
          ))}
        </div>

        {/* 모드 설명 */}
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm space-y-2">
          <p className="font-semibold">📖 모드 설명</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <span className="font-semibold">논 피어리스:</span> 제한 없이 모든 챔피언 선택 가능
            </li>
            <li>
              <span className="font-semibold">소프트 피어리스:</span> 자기 팀이 이전 세트에서 선택한 챔피언만 선택 불가
            </li>
            <li>
              <span className="font-semibold">하드 피어리스:</span> 양 팀 중 누구라도 선택했던 챔피언은 모두 선택 불가
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

