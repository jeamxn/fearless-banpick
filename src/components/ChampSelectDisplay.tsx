import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChampSelectSession } from "../types/champSelect";
import type { FearlessMode } from "../types/fearless";
import { getChampionIconUrl, getChampionName } from "../utils/championData";

interface ChampSelectDisplayProps {
  session: ChampSelectSession | null;
  fearlessMode?: FearlessMode;
  restrictedChampions?: {
    myTeam: number[];
    theirTeam: number[];
  };
}

export const ChampSelectDisplay = ({ 
  session, 
  fearlessMode = "none",
  restrictedChampions = { myTeam: [], theirTeam: [] }
}: ChampSelectDisplayProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1초마다 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100); // 100ms마다 업데이트 (더 부드러운 애니메이션)

    return () => clearInterval(interval);
  }, []);

  if (!session) {
    return (
      <Card className="w-full">
        <CardContent>
          <p className="text-center text-muted-foreground">
            챔피언 선택 단계가 아닙니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log("ChampSelect 세션 데이터:", session);

  // 실시간 남은 시간 계산
  const calculateRemainingTime = () => {
    if (session.timer.isInfinite) {
      return { seconds: Infinity, percentage: 100 };
    }

    const elapsedSinceSnapshot = currentTime - session.timer.internalNowInEpochMs;
    const remainingMs = session.timer.adjustedTimeLeftInPhase - elapsedSinceSnapshot;
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const totalSeconds = Math.floor(session.timer.totalTimeInPhase / 1000);
    const percentage = totalSeconds > 0 ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0;

    return { seconds: remainingSeconds, percentage };
  };

  const { seconds: remainingSeconds, percentage: timePercentage } = calculateRemainingTime();

  // 밴 정보 추출
  const myTeamBans: Array<{ id: number; status: "completed" | "inProgress" | "pending" }> = [];
  const theirTeamBans: Array<{ id: number; status: "completed" | "inProgress" | "pending" }> = [];

  for (const actionGroup of session.actions) {
    for (const action of actionGroup) {
      if (action.type === "ban") {
        let status: "completed" | "inProgress" | "pending" = "pending";
        
        if (action.completed && action.championId !== 0) {
          status = "completed";
        } else if (action.isInProgress) {
          status = "inProgress";
        } else if (!action.completed) {
          status = "pending";
        }

        // completed이거나 inProgress인 경우에만 표시
        if (status !== "pending" || action.championId !== 0) {
          const banData = {
            id: action.championId || 0,
            status,
          };

          if (action.isAllyAction) {
            myTeamBans.push(banData);
          } else {
            theirTeamBans.push(banData);
          }
        }
      }
    }
  }

  // 현재 진행 중인 액션
  const currentActions: Array<{ team: string; type: string }> = [];
  for (const actionGroup of session.actions) {
    for (const action of actionGroup) {
      if (action.isInProgress) {
        currentActions.push({
          team: action.isAllyAction ? "우리 팀" : "상대 팀",
          type: action.type === "ban" ? "밴" : "픽",
        });
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* 피어리스 모드 정보 */}
      {fearlessMode !== "none" && (restrictedChampions.myTeam.length > 0 || restrictedChampions.theirTeam.length > 0) && (
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-orange-900 mb-1">
                {fearlessMode === "soft" ? "소프트 피어리스" : "하드 피어리스"} 활성화
              </p>
              <p className="text-xs text-orange-800 wrap-break-word">
                {fearlessMode === "soft" 
                  ? "자기 팀 선택 챔피언 제한"
                  : "양 팀 모든 선택 챔피언 제한"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 타이머 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ 타이머</h3>
        <div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">현재 단계:</span>
              <span className="text-muted-foreground">{session.timer.phase}</span>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">남은 시간:</span>
                <span className={`font-mono text-lg font-bold ${
                  remainingSeconds <= 10 ? "text-red-600 animate-pulse" : "text-blue-600"
                }`}>
                  {remainingSeconds === Infinity ? "∞" : `${remainingSeconds}초`}
                </span>
              </div>
              
              {/* 프로그레스 바 */}
              <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear ${
                    timePercentage > 50
                      ? "bg-linear-to-r from-green-500 to-green-600"
                      : timePercentage > 20
                      ? "bg-linear-to-r from-yellow-500 to-yellow-600"
                      : "bg-linear-to-r from-red-500 to-red-600"
                  }`}
                  style={{ width: `${timePercentage}%` }}
                >
                  {/* 반짝이는 효과 */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* 총 시간 표시 */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0초</span>
                <span>{Math.floor(session.timer.totalTimeInPhase / 1000)}초</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 밴 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🚫 밴</h3>
        <div>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-blue-600 mb-2">우리 팀</p>
              <div className="flex flex-wrap gap-3">
                {myTeamBans.length > 0 ? (
                  myTeamBans.map((ban, idx) => {
                    const getBanStyle = () => {
                      if (ban.status === "completed") {
                        return "relative rounded-lg overflow-hidden border-2 border-blue-500";
                      } else if (ban.status === "inProgress") {
                        return "relative rounded-lg overflow-hidden border-2 border-blue-400 animate-pulse";
                      }
                      return "relative rounded-lg overflow-hidden border-2 border-gray-300";
                    };

                    const showImage = ban.id !== 0;

                    return (
                      <div key={idx} className={getBanStyle()}>
                        {showImage ? (
                          <div className="relative w-16 h-16">
                            <img
                              src={getChampionIconUrl(ban.id)}
                              alt={getChampionName(ban.id)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                              }}
                            />
                            {ban.status === "inProgress" && (
                              <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">예정</span>
                              </div>
                            )}
                            {ban.status === "completed" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">✕</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">선택 중</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground text-sm">없음</span>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold text-red-600 mb-2">상대 팀</p>
              <div className="flex flex-wrap gap-3">
                {theirTeamBans.length > 0 ? (
                  theirTeamBans.map((ban, idx) => {
                    const getBanStyle = () => {
                      if (ban.status === "completed") {
                        return "relative rounded-lg overflow-hidden border-2 border-red-500";
                      } else if (ban.status === "inProgress") {
                        return "relative rounded-lg overflow-hidden border-2 border-red-400 animate-pulse";
                      }
                      return "relative rounded-lg overflow-hidden border-2 border-gray-300";
                    };

                    const showImage = ban.id !== 0;

                    return (
                      <div key={idx} className={getBanStyle()}>
                        {showImage ? (
                          <div className="relative w-16 h-16">
                            <img
                              src={getChampionIconUrl(ban.id)}
                              alt={getChampionName(ban.id)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                              }}
                            />
                            {ban.status === "inProgress" && (
                              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">예정</span>
                              </div>
                            )}
                            {ban.status === "completed" && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">✕</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500">선택 중</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground text-sm">없음</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우리 팀 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-blue-600 mb-4">👥 우리 팀</h3>
        <div>
          <div className="space-y-3">
            {session.myTeam.map((player) => {
              const isLocalPlayer = player.cellId === session.localPlayerCellId;
              const hasPicked = player.championId !== 0;
              const hasIntent = player.championPickIntent !== 0;
              const isRestricted = hasPicked && restrictedChampions.myTeam.includes(player.championId);
              const isIntentRestricted = hasIntent && restrictedChampions.myTeam.includes(player.championPickIntent);

              return (
                <div
                  key={player.cellId}
                  className={`p-3 rounded-lg flex items-center gap-3 ${
                    isLocalPlayer
                      ? "bg-blue-50 border-2 border-blue-500"
                      : "bg-gray-50"
                  }`}
                >
                  {isLocalPlayer && <span className="text-lg">👉</span>}
                  
                  {/* 챔피언 초상화 */}
                  <div className="relative">
                    {hasPicked ? (
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        isRestricted ? "border-red-500" : "border-blue-500"
                      }`}>
                        <img
                          src={getChampionIconUrl(player.championId)}
                          alt={getChampionName(player.championId)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                          }}
                        />
                        {isRestricted && (
                          <div className="absolute inset-0 bg-red-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🚫</span>
                          </div>
                        )}
                      </div>
                    ) : hasIntent ? (
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        isIntentRestricted ? "border-red-300 border-dashed" : "border-blue-300 border-dashed"
                      }`}>
                        <img
                          src={getChampionIconUrl(player.championPickIntent)}
                          alt={getChampionName(player.championPickIntent)}
                          className="w-full h-full object-cover opacity-60"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                          }}
                        />
                        <div className={`absolute inset-0 ${
                          isIntentRestricted ? "bg-red-500/40" : "bg-blue-500/20"
                        } flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">
                            {isIntentRestricted ? "제한" : "의도"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">미선택</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-blue-600">
                      {player.assignedPosition || "미정"}
                    </div>
                    <div className="text-sm">
                      {hasPicked ? (
                        <span className={`font-medium ${isRestricted ? "text-red-600" : ""}`}>
                          {getChampionName(player.championId)}
                          {isRestricted && " ⚠️"}
                        </span>
                      ) : hasIntent ? (
                        <span className={`text-muted-foreground ${isIntentRestricted ? "text-red-600" : ""}`}>
                          {getChampionName(player.championPickIntent)} 
                          {isIntentRestricted ? " (제한)" : " (의도)"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">선택 안 함</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 상대 팀 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-red-600 mb-4">👥 상대 팀</h3>
        <div>
          <div className="space-y-3">
            {session.theirTeam.map((player) => {
              const hasPicked = player.championId !== 0;
              const isRestricted = hasPicked && restrictedChampions.theirTeam.includes(player.championId);

              return (
                <div
                  key={player.cellId}
                  className="p-3 rounded-lg bg-gray-50 flex items-center gap-3"
                >
                  {/* 챔피언 초상화 */}
                  <div className="relative">
                    {hasPicked ? (
                      <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        isRestricted ? "border-orange-500" : "border-red-500"
                      }`}>
                        <img
                          src={getChampionIconUrl(player.championId)}
                          alt={getChampionName(player.championId)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                          }}
                        />
                        {isRestricted && (
                          <div className="absolute inset-0 bg-orange-500/60 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🚫</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">미선택</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="text-sm">
                      {hasPicked ? (
                        <span className={`font-medium ${isRestricted ? "text-orange-600" : ""}`}>
                          {getChampionName(player.championId)}
                          {isRestricted && " ⚠️"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">선택 안 함</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 현재 액션 */}
      {currentActions.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 현재 액션</h3>
          <div>
            <div className="space-y-2">
              {currentActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                >
                  <span className="font-semibold">{action.team}</span> -{" "}
                  <span>{action.type} 진행 중</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

