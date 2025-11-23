import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChampSelectSession } from "../types/champSelect";
import type { FearlessMode } from "../types/fearless";
import { getChampionIconUrl, getChampionName, getChampionSplashUrl } from "../utils/championData";

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
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-16 border-2 border-slate-700/50 backdrop-blur-sm text-center">
        <div className="text-8xl mb-6 opacity-50">⏸️</div>
        <p className="text-2xl font-black text-gray-400 mb-3 uppercase tracking-wide">
          NOT IN CHAMPION SELECT
        </p>
        <p className="text-sm text-gray-500 font-semibold">
          Waiting for champion select phase...
        </p>
      </div>
    );
  }

  console.log("ChampSelect 세션 데이터:", session);

  // phase가 없거나 비어있으면 대기중으로 간주
  const phase = session.timer.phase?.toLowerCase() || "";
  if (!phase || phase === "" || phase === "none") {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-16 border-2 border-slate-700/50 backdrop-blur-sm text-center">
        <div className="text-8xl mb-6 opacity-50 animate-pulse">⏸️</div>
        <p className="text-2xl font-black text-gray-400 mb-3 uppercase tracking-wide">
          WAITING...
        </p>
        <p className="text-sm text-gray-500 font-semibold">
          Champion select will start soon
        </p>
      </div>
    );
  }

  // 우리 팀 밴 추출
  const getMyTeamBans = () => {
    const bans: Array<{ id: number; status: "completed" | "inProgress" }> = [];
    for (const actionGroup of session.actions) {
      for (const action of actionGroup) {
        if (action.type === "ban" && action.isAllyAction) {
          let status: "completed" | "inProgress" = "completed";
          if (action.isInProgress) {
            status = "inProgress";
          }
          if (status === "inProgress" || (action.completed && action.championId !== 0)) {
            bans.push({ id: action.championId || 0, status });
          }
        }
      }
    }
    return bans;
  };

  // 상대 팀 밴 추출
  const getTheirTeamBans = () => {
    const bans: Array<{ id: number; status: "completed" | "inProgress" }> = [];
    for (const actionGroup of session.actions) {
      for (const action of actionGroup) {
        if (action.type === "ban" && !action.isAllyAction) {
          let status: "completed" | "inProgress" = "completed";
          if (action.isInProgress) {
            status = "inProgress";
          }
          if (status === "inProgress" || (action.completed && action.championId !== 0)) {
            bans.push({ id: action.championId || 0, status });
          }
        }
      }
    }
    return bans;
  };

  const myTeamBans = getMyTeamBans();
  const theirTeamBans = getTheirTeamBans();

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
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-5 border-2 border-orange-500/50 backdrop-blur-sm glow-red">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0 animate-pulse">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg text-orange-300 mb-2 uppercase tracking-wide">
                {fearlessMode === "soft" ? "SOFT FEARLESS" : "HARD FEARLESS"} MODE ACTIVE
              </p>
              <p className="text-sm text-orange-200/80 wrap-break-word font-semibold">
                {fearlessMode === "soft" 
                  ? "Your team's previous picks are restricted"
                  : "Both teams' previous picks are restricted"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 타이머 정보 */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border-2 border-cyan-500/50 backdrop-blur-sm glow-cyan">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 uppercase tracking-wide">
          ⏱️ TIMER
        </h3>
        <div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-300 uppercase tracking-wide">PHASE:</span>
              <span className="text-cyan-300 font-black text-xl uppercase tracking-wider">
                {session.timer.phase}
              </span>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-gray-300 uppercase tracking-wide">TIME LEFT:</span>
                <span className={`font-mono text-3xl font-black ${
                  remainingSeconds <= 10 ? "text-red-400 animate-pulse glow-red" : "text-cyan-400 glow-cyan"
                }`}>
                  {remainingSeconds === Infinity ? "∞" : `${remainingSeconds}s`}
                </span>
              </div>
              
              {/* 프로그레스 바 */}
              <div className="relative w-full h-6 bg-slate-950/80 rounded-lg overflow-hidden border-2 border-slate-700">
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear ${
                    timePercentage > 50
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500"
                      : timePercentage > 20
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                  }`}
                  style={{ width: `${timePercentage}%` }}
                >
                  {/* 반짝이는 효과 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* 총 시간 표시 */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                <span>0s</span>
                <span>{Math.floor(session.timer.totalTimeInPhase / 1000)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우리 팀 */}
      <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border-2 border-cyan-500/50 backdrop-blur-sm glow-cyan">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 uppercase tracking-wide">
          👥 YOUR TEAM
        </h3>
        
        {/* 우리 팀 밴 */}
        {myTeamBans.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-black text-cyan-300 mb-3 uppercase tracking-wider">🚫 BANS</p>
            <div className="flex flex-wrap gap-3">
              {myTeamBans.map((ban, idx) => {
                const showImage = ban.id !== 0;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      ban.status === "completed"
                        ? "border-red-500"
                        : "border-red-400 animate-pulse"
                    }`}
                  >
                    {showImage ? (
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden">
                        {/* 배경 스플래시 아트 */}
                        <img
                          src={getChampionSplashUrl(ban.id)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                        {/* 초상화 (하단 중앙) */}
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
                          <img
                            src={getChampionIconUrl(ban.id)}
                            alt={getChampionName(ban.id)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                            }}
                          />
                        </div>
                        {ban.status === "inProgress" && (
                          <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">예정</span>
                          </div>
                        )}
                        {ban.status === "completed" && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">✕</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">선택중</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 우리 팀 픽 */}
        <div>
          <p className="text-sm font-black text-cyan-300 mb-3 uppercase tracking-wider">✅ PICKS</p>
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
                  className={`p-4 rounded-lg flex items-center gap-4 ${
                    isLocalPlayer
                      ? "bg-cyan-500/20 border-2 border-cyan-400 glow-cyan"
                      : "bg-slate-800/50 border border-slate-700"
                  }`}
                >
                  {isLocalPlayer && <span className="text-2xl animate-pulse">👉</span>}
                  
                  {/* 챔피언 카드 */}
                  <div className="relative">
                    {hasPicked ? (
                      <div className={`relative w-36 h-48 rounded-lg overflow-hidden border-2 ${
                        isRestricted ? "border-red-500 glow-red" : "border-cyan-400 glow-cyan"
                      } shadow-lg`}>
                        {/* 배경 스플래시 아트 */}
                        <img
                          src={getChampionSplashUrl(player.championId)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                        {/* 초상화 (하단 중앙) */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full overflow-hidden border-3 border-cyan-400 shadow-xl glow-cyan">
                          <img
                            src={getChampionIconUrl(player.championId)}
                            alt={getChampionName(player.championId)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                            }}
                          />
                        </div>
                        {isRestricted && (
                          <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-3xl font-bold drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">🚫</span>
                          </div>
                        )}
                      </div>
                    ) : hasIntent ? (
                      <div className={`relative w-36 h-48 rounded-lg overflow-hidden border-2 border-dashed ${
                        isIntentRestricted ? "border-red-400 animate-pulse" : "border-cyan-400 animate-pulse"
                      } shadow-lg`}>
                        {/* 배경 스플래시 아트 */}
                        <img
                          src={getChampionSplashUrl(player.championPickIntent)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-60"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                        {/* 초상화 (하단 중앙) */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full overflow-hidden border-3 border-cyan-400/50 shadow-xl opacity-70">
                          <img
                            src={getChampionIconUrl(player.championPickIntent)}
                            alt={getChampionName(player.championPickIntent)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                            }}
                          />
                        </div>
                        <div className={`absolute inset-0 ${
                          isIntentRestricted ? "bg-red-500/50" : "bg-cyan-500/30"
                        } flex items-center justify-center backdrop-blur-sm`}>
                          <span className="text-white text-sm font-black uppercase tracking-wider">
                            {isIntentRestricted ? "RESTRICTED" : "PENDING"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-36 h-48 rounded-lg bg-slate-900/80 border-2 border-slate-700 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold uppercase">NOT PICKED</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="font-black text-base text-cyan-400 uppercase tracking-wider mb-1">
                      {player.assignedPosition || "UNASSIGNED"}
                    </div>
                    <div className="text-sm">
                      {hasPicked ? (
                        <span className={`font-bold text-lg ${isRestricted ? "text-red-400" : "text-gray-200"}`}>
                          {getChampionName(player.championId)}
                          {isRestricted && " ⚠️"}
                        </span>
                      ) : hasIntent ? (
                        <span className={`font-semibold ${isIntentRestricted ? "text-red-400" : "text-cyan-400/70"}`}>
                          {getChampionName(player.championPickIntent)} 
                          {isIntentRestricted ? " (RESTRICTED)" : " (PENDING)"}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-semibold">NOT SELECTED</span>
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
      <div className="bg-gradient-to-br from-red-900/40 to-pink-900/40 rounded-xl p-6 border-2 border-red-500/50 backdrop-blur-sm glow-red">
        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-6 uppercase tracking-wide">
          👥 ENEMY TEAM
        </h3>
        
        {/* 상대 팀 밴 */}
        {theirTeamBans.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-black text-red-300 mb-3 uppercase tracking-wider">🚫 BANS</p>
            <div className="flex flex-wrap gap-3">
              {theirTeamBans.map((ban, idx) => {
                const showImage = ban.id !== 0;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border-2 ${
                      ban.status === "completed"
                        ? "border-red-500 glow-red"
                        : "border-red-400 animate-border-glow"
                    }`}
                  >
                    {showImage ? (
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden">
                        {/* 배경 스플래시 아트 */}
                        <img
                          src={getChampionSplashUrl(ban.id)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        {/* 초상화 (하단 중앙) */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full overflow-hidden border-2 border-red-400 shadow-lg glow-red">
                          <img
                            src={getChampionIconUrl(ban.id)}
                            alt={getChampionName(ban.id)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                            }}
                          />
                        </div>
                        {ban.status === "inProgress" && (
                          <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-xs font-black uppercase tracking-wider">PENDING</span>
                          </div>
                        )}
                        {ban.status === "completed" && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-red-400 text-4xl font-bold drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">✕</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-32 bg-slate-800/80 rounded-lg flex items-center justify-center border-2 border-slate-700">
                        <span className="text-xs text-gray-500 font-bold uppercase">PICKING</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 상대 팀 픽 */}
        <div>
          <p className="text-sm font-black text-red-300 mb-3 uppercase tracking-wider">✅ PICKS</p>
          <div className="space-y-3">
            {session.theirTeam.map((player) => {
              const hasPicked = player.championId !== 0;
              const isRestricted = hasPicked && restrictedChampions.theirTeam.includes(player.championId);

              return (
                <div
                  key={player.cellId}
                  className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-4"
                >
                  {/* 챔피언 카드 */}
                  <div className="relative">
                    {hasPicked ? (
                      <div className={`relative w-36 h-48 rounded-lg overflow-hidden border-2 ${
                        isRestricted ? "border-orange-500 glow-red" : "border-red-400 glow-red"
                      } shadow-lg`}>
                        {/* 배경 스플래시 아트 */}
                        <img
                          src={getChampionSplashUrl(player.championId)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 그라데이션 오버레이 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
                        {/* 초상화 (하단 중앙) */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full overflow-hidden border-3 border-red-400 shadow-xl glow-red">
                          <img
                            src={getChampionIconUrl(player.championId)}
                            alt={getChampionName(player.championId)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
                            }}
                          />
                        </div>
                        {isRestricted && (
                          <div className="absolute inset-0 bg-orange-500/70 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white text-3xl font-bold drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]">🚫</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-36 h-48 rounded-lg bg-slate-900/80 border-2 border-slate-700 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-bold uppercase">NOT PICKED</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="text-sm">
                      {hasPicked ? (
                        <span className={`font-bold text-lg ${isRestricted ? "text-orange-400" : "text-gray-200"}`}>
                          {getChampionName(player.championId)}
                          {isRestricted && " ⚠️"}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-semibold">NOT SELECTED</span>
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
        <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-xl p-6 border-2 border-yellow-500/50 backdrop-blur-sm animate-glow-pulse">
          <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6 uppercase tracking-wide">
            🎯 CURRENT ACTION
          </h3>
          <div>
            <div className="space-y-3">
              {currentActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-yellow-500/20 border-2 border-yellow-400/50 backdrop-blur-sm"
                >
                  <span className="font-black text-yellow-300 text-lg uppercase tracking-wide">{action.team}</span>
                  <span className="text-yellow-200 font-bold mx-2">-</span>
                  <span className="text-yellow-200 font-bold uppercase">{action.type} IN PROGRESS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

