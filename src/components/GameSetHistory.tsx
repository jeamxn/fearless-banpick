import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GameSet } from "../types/fearless";
import { getChampionIconUrl, getChampionName } from "../utils/championData";
import { useState } from "react";

interface GameSetHistoryProps {
  gameSets: GameSet[];
  onReset: () => void;
}

export const GameSetHistory = ({ gameSets, onReset }: GameSetHistoryProps) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (gameSets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            아직 기록된 게임 세트가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>📊 게임 세트 기록</CardTitle>
        <div>
          {showResetConfirm ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
              >
                확인
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
            >
              초기화
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gameSets.map((gameSet) => (
            <div
              key={gameSet.id}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* 세트 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">세트 {gameSet.setNumber}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(gameSet.timestamp).toLocaleString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
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
      </CardContent>
    </Card>
  );
};

