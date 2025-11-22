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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-center text-gray-500 text-sm">
          아직 기록된 게임 세트가 없습니다.
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">📊 게임 세트 기록</h3>
        <div>
          {showResetConfirm ? (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-8 px-3 text-xs"
              >
                확인
              </Button>
              <Button
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg h-8 px-3 text-xs"
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg h-8 px-3 text-xs shrink-0"
            >
              초기화
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4 mt-4">
          {gameSets.map((gameSet) => (
            <div
              key={gameSet.id}
              className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50"
            >
              {/* 세트 헤더 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <h3 className="font-bold text-base text-gray-900 shrink-0">세트 {gameSet.setNumber}</h3>
                  <span className="text-xs text-gray-500 truncate">
                    {new Date(gameSet.timestamp).toLocaleString("ko-KR", {
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
                      className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-8 px-3 text-xs"
                    >
                      확인
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDeleteConfirmId(null)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg h-8 px-3 text-xs"
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setDeleteConfirmId(gameSet.id)}
                    className="text-red-600 hover:bg-red-50 rounded-lg h-8 px-3 text-xs shrink-0"
                    variant="ghost"
                  >
                    삭제
                  </Button>
                )}
              </div>

              {/* 밴 */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">밴</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* 우리 팀 밴 */}
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-2">우리 팀</p>
                    <div className="flex flex-wrap gap-1">
                      {gameSet.myTeamBans.length > 0 ? (
                        gameSet.myTeamBans.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-10 h-10 rounded overflow-hidden border border-blue-500"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✕</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">없음</span>
                      )}
                    </div>
                  </div>

                  {/* 상대 팀 밴 */}
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-2">상대 팀</p>
                    <div className="flex flex-wrap gap-1">
                      {gameSet.theirTeamBans.length > 0 ? (
                        gameSet.theirTeamBans.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-10 h-10 rounded overflow-hidden border border-red-500"
                            title={getChampionName(championId)}
                          >
                            <img
                              src={getChampionIconUrl(championId)}
                              alt={getChampionName(championId)}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">✕</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">없음</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 픽 */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">픽</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* 우리 팀 픽 */}
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-2">우리 팀</p>
                    <div className="flex flex-wrap gap-1">
                      {gameSet.myTeamPicks.length > 0 ? (
                        gameSet.myTeamPicks.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-10 h-10 rounded overflow-hidden border-2 border-blue-500"
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
                        <span className="text-xs text-muted-foreground">없음</span>
                      )}
                    </div>
                  </div>

                  {/* 상대 팀 픽 */}
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-2">상대 팀</p>
                    <div className="flex flex-wrap gap-1">
                      {gameSet.theirTeamPicks.length > 0 ? (
                        gameSet.theirTeamPicks.map((championId, idx) => (
                          <div
                            key={idx}
                            className="relative w-10 h-10 rounded overflow-hidden border-2 border-red-500"
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
                        <span className="text-xs text-muted-foreground">없음</span>
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

