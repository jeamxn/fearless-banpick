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
  const modes: Array<{ value: FearlessMode; label: string; description: string; color: string }> = [
    {
      value: "none",
      label: "NONE",
      description: "Normal mode - No restrictions",
      color: "from-gray-600 to-slate-600",
    },
    {
      value: "soft",
      label: "SOFT FEARLESS",
      description: "Your team's picks restricted",
      color: "from-orange-600 to-yellow-600",
    },
    {
      value: "hard",
      label: "HARD FEARLESS",
      description: "Both teams' picks restricted",
      color: "from-red-600 to-pink-600",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border border-orange-500/30 backdrop-blur-sm">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2 uppercase tracking-wide">
        ⚔️ FEARLESS MODE
      </h2>
      <p className="text-sm text-orange-300/70 mb-6 font-semibold">
        Champion restriction rules between sets
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onModeChange(mode.value)}
            disabled={disabled}
            className={`p-5 rounded-lg text-left transition-all border-2 ${
              currentMode === mode.value
                ? `border-orange-400 bg-gradient-to-r ${mode.color} glow-red`
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            }`}
          >
            <div className="font-black text-base text-gray-100 mb-2 uppercase tracking-wider">
              {mode.label}
            </div>
            <div className="text-xs text-gray-400 wrap-break-word font-semibold">
              {mode.description}
            </div>
          </button>
        ))}
      </div>

      {/* 모드 설명 */}
      <div className="mt-5 p-4 bg-slate-900/60 rounded-lg border border-slate-700">
        <p className="font-black text-sm text-gray-300 mb-3 uppercase tracking-wider">📖 DETAILS</p>
        <ul className="space-y-2 text-xs text-gray-400">
          <li className="wrap-break-word font-semibold">
            <span className="font-black text-gray-300">NONE:</span> No restrictions
          </li>
          <li className="wrap-break-word font-semibold">
            <span className="font-black text-gray-300">SOFT:</span> Your team's picks only
          </li>
          <li className="wrap-break-word font-semibold">
            <span className="font-black text-gray-300">HARD:</span> Both teams' picks
          </li>
        </ul>
      </div>
    </div>
  );
};

