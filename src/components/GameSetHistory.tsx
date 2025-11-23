import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GameSet } from "../types/fearless";
import { getChampionIconUrl, getChampionName } from "../utils/championData";
import { useState } from "react";

interface GameSetHistoryProps {
  gameSets: GameSet[];
  onReset: () => void;
  onRemoveSet: (setId: string) => void;
}

export const GameSetHistory = ({ gameSets, onReset, onRemoveSet }: GameSetHistoryProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (gameSets.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-8 border border-slate-700 backdrop-blur-sm">
        <p className="text-center text-gray-500 text-sm font-semibold uppercase tracking-wide">
          No game sets recorded yet
        </p>
      </div>
    );
  }

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  const handleRemoveSet = (setId: string) => {
    onRemoveSet(setId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border-2 border-purple-500/50 backdrop-blur-sm glow-purple">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wide">
          📊 MATCH HISTORY
        </h3>
        <div>
          {showResetConfirm ? (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleReset}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg h-9 px-4 text-xs font-black uppercase tracking-wider glow-red"
              >
                CONFIRM
              </Button>
              <Button
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg h-9 px-4 text-xs font-black uppercase tracking-wider"
              >
                CANCEL
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg h-9 px-4 text-xs font-black uppercase tracking-wider shrink-0"
            >
              RESET
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
          {gameSets.map((gameSet) => (
            <div
              key={gameSet.id}
              className="border-2 border-purple-500/30 rounded-lg p-6 space-y-5 bg-slate-900/60 backdrop-blur-sm"
            >
              {/* 세트 헤더 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <h3 className="font-black text-xl text-purple-300 shrink-0 uppercase tracking-wide">SET {gameSet.setNumber}</h3>
                  <span className="text-xs text-gray-500 truncate font-semibold uppercase tracking-wider">
                    {new Date(gameSet.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {/* 삭제 버튼 */}
                {deleteConfirmId === gameSet.id ? (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleRemoveSet(gameSet.id)}
                      className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg h-8 px-3 text-xs font-black uppercase tracking-wider glow-red"
                    >
                      YES
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                      className="bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-lg h-8 px-3 text-xs font-black uppercase tracking-wider"
                    >
                      NO
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setDeleteConfirmId(gameSet.id)}
                    className="text-red-400 hover:bg-red-500/20 rounded-lg h-8 px-3 text-xs shrink-0 font-black uppercase tracking-wider"
                    variant="ghost"
                  >
                    DELETE
                  </Button>
                )}
              </div>

              {/* 밴 */}
              <div className="space-y-3">
                <p className="text-sm font-black text-gray-400 uppercase tracking-wider">BANS</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* 우리 팀 밴 */}
                  <div>
                    <p className="text-xs font-black text-cyan-400 mb-3 uppercase tracking-wider">YOUR TEAM</p>
                    <div className="flex flex-wrap gap-2">
                      {gameSet.myTeamBans.length > 0 ? (
                        gameSet.myTeamBans.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-cyan-500/50 glow-cyan"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-cyan-400 text-sm font-bold drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">✕</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 font-semibold uppercase">NONE</span>
                      )}
                    </div>
                  </div>

                  {/* 상대 팀 밴 */}
                  <div>
                    <p className="text-xs font-black text-red-400 mb-3 uppercase tracking-wider">ENEMY TEAM</p>
                    <div className="flex flex-wrap gap-2">
                      {gameSet.theirTeamBans.length > 0 ? (
                        gameSet.theirTeamBans.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-red-500/50 glow-red"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-red-400 text-sm font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">✕</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 font-semibold uppercase">NONE</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 픽 */}
              <div className="space-y-3">
                <p className="text-sm font-black text-gray-400 uppercase tracking-wider">PICKS</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* 우리 팀 픽 */}
                  <div>
                    <p className="text-xs font-black text-cyan-400 mb-3 uppercase tracking-wider">YOUR TEAM</p>
                    <div className="flex flex-wrap gap-2">
                      {gameSet.myTeamPicks.length > 0 ? (
                        gameSet.myTeamPicks.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-cyan-400 glow-cyan"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 font-semibold uppercase">NONE</span>
                      )}
                    </div>
                  </div>

                  {/* 상대 팀 픽 */}
                  <div>
                    <p className="text-xs font-black text-red-400 mb-3 uppercase tracking-wider">ENEMY TEAM</p>
                    <div className="flex flex-wrap gap-2">
                      {gameSet.theirTeamPicks.length > 0 ? (
                        gameSet.theirTeamPicks.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-red-400 glow-red"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-600 font-semibold uppercase">NONE</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

