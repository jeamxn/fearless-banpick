import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomControls } from "@/components/RoomControls";
import { ChampSelectDisplay } from "@/components/ChampSelectDisplay";
import { FearlessModeSelector } from "@/components/FearlessModeSelector";
import { GameSetHistory } from "@/components/GameSetHistory";
import { useLeagueClient } from "@/hooks/useLeagueClient";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useFearless } from "@/hooks/useFearless";
import { getRestrictedChampions } from "@/types/fearless";
import { initializeChampionData } from "@/utils/championData";
import logo from "./logo.svg";
import "./index.css";

export function App() {
  const [isChampionDataLoaded, setIsChampionDataLoaded] = useState(false);
  const [lastSessionState, setLastSessionState] = useState<"active" | "completed" | "finalized" | null>(null);
  const [completedSessionData, setCompletedSessionData] = useState<any>(null);

  // 챔피언 데이터 초기화
  useEffect(() => {
    initializeChampionData().then(() => {
      setIsChampionDataLoaded(true);
      console.log("✅ 챔피언 데이터 로드 완료");
    });
  }, []);
  const {
    isConnected: isLeagueConnected,
    champSelectData,
    error: leagueError,
    connect: connectToLeague,
  } = useLeagueClient();

  const {
    peerId,
    roomId,
    isHost,
    connections,
    receivedData,
    error: peerError,
    isConnecting,
    createRoom,
    joinRoom,
    broadcastData,
  } = usePeerConnection();

  const {
    mode: fearlessMode,
    gameSets,
    setMode: setFearlessMode,
    addGameSet,
    isSessionComplete,
    reset: resetFearless,
    removeGameSet,
  } = useFearless(roomId); // roomId를 사용 (호스트와 게스트 모두 동일)

  // 호스트인 경우: 서버로부터 받은 리그오브레전드 클라이언트 데이터를 P2P로 브로드캐스트
  useEffect(() => {
    if (isHost && champSelectData !== undefined) {
      broadcastData(champSelectData);
    }
  }, [isHost, champSelectData, broadcastData]);

  // 세션 완료 감지 및 기록
  useEffect(() => {
    const displayData = isHost ? champSelectData : receivedData;

    // finalized 상태에서는 더 이상 처리하지 않음 (깜빡임 방지)
    // 단, 새로운 세션이 시작되면 (displayData가 없어지면) 리셋
    if (lastSessionState === "finalized") {
      if (!displayData) {
        console.log("🔄 새 세션 시작 (finalized 상태에서)");
        setLastSessionState("active");
        setCompletedSessionData(null);
      }
      return;
    }

    if (displayData) {
      const isComplete = isSessionComplete(displayData);
      const phase = displayData.timer.phase?.toLowerCase() || "";
      
      console.log("현재 phase:", phase, "완료 여부:", isComplete);
      
      // Finalization 단계 = 게임 시작 확정
      if (phase === "finalization") {
        console.log("🎮 게임 시작 확정 (Finalization) - 기록 추가");
        addGameSet(displayData);
        setLastSessionState("finalized");
        setCompletedSessionData(null);
      } else if (isComplete && lastSessionState !== "completed") {
        // 세션이 완료됨 (모든 픽 완료)
        console.log("✅ 챔피언 선택 완료 - 데이터 저장");
        setCompletedSessionData(displayData);
        setLastSessionState("completed");
      } else if (!isComplete && lastSessionState === "completed") {
        // 새로운 세션 시작
        console.log("🔄 새 세션 시작");
        setLastSessionState("active");
        setCompletedSessionData(null);
      } else if (!isComplete && lastSessionState === null) {
        // 첫 세션 시작
        setLastSessionState("active");
      }
    } else if (lastSessionState !== null) {
      // 세션이 사라짐 (Finalization 전에)
      console.log("❌ 세션 종료됨");
      setLastSessionState(null);
      setCompletedSessionData(null);
    }
  }, [isHost, champSelectData, receivedData, isSessionComplete, addGameSet, lastSessionState]);

  // 방 만들기 핸들러 (호스트)
  const handleCreateRoom = async () => {
    createRoom();
    // 방을 만들면 자동으로 서버의 리그오브레전드 클라이언트 연결 시도
    await connectToLeague();
  };

  // 표시할 데이터 결정 (호스트면 자신의 데이터, 게스트면 받은 데이터)
  const displayData = useMemo(() => {
    return isHost ? champSelectData : receivedData;
  }, [isHost, champSelectData, receivedData]);

  // 피어리스 규칙에 따른 제한 챔피언 계산
  const restrictedChampions = {
    myTeam: getRestrictedChampions(fearlessMode, gameSets, true),
    theirTeam: getRestrictedChampions(fearlessMode, gameSets, false),
  };

  return (
    <div className="min-h-screen w-full">
      {/* 게임 스타일 헤더 */}
      <header className="border-b border-cyan-500/30 sticky top-0 z-50 backdrop-blur-md bg-slate-900/90">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={logo} alt="Logo" className="h-10 w-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 tracking-wide">
                  FEARLESS DRAFT
                </h1>
                <p className="text-xs text-cyan-400/70 font-semibold tracking-widest">REAL-TIME BAN/PICK SHARING</p>
              </div>
            </div>
            {roomId && (
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-lg border border-cyan-500/30">
                <span className={`w-3 h-3 rounded-full ${isHost ? 'bg-cyan-400 animate-pulse glow-cyan' : 'bg-purple-400 animate-pulse glow-purple'}`} />
                <span className="text-gray-200 font-bold text-sm uppercase tracking-wider">{isHost ? 'HOST' : 'GUEST'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 왼쪽 사이드바 (방 컨트롤 & 상태) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 방 컨트롤 */}
          <RoomControls
            onCreateRoom={handleCreateRoom}
            onJoinRoom={joinRoom}
            roomId={roomId}
            isConnecting={isConnecting}
            error={peerError}
          />

          {/* 연결 상태 표시 - 게임 스타일 */}
          {roomId && (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-5 border border-cyan-500/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${
                  isHost ? 'bg-cyan-500/20 border-cyan-400 glow-cyan' : 'bg-purple-500/20 border-purple-400 glow-purple'
                }`}>
                  <span className="text-2xl">
                    {isHost ? "🏠" : "👥"}
                  </span>
                </div>
                <div>
                  <p className="font-black text-gray-100 text-lg uppercase tracking-wide">
                    {isHost ? "HOST MODE" : "GUEST MODE"}
                  </p>
                  <p className="text-xs text-cyan-400 font-semibold">
                    CONNECTED: {isHost ? connections.length : 1} USERS
                  </p>
                </div>
              </div>
            </div>
            
            {isHost && (
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  isLeagueConnected 
                    ? 'bg-emerald-500/10 border-emerald-400/50 glow-cyan' 
                    : 'bg-slate-700/50 border-slate-600'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      isLeagueConnected ? "bg-emerald-400 animate-pulse glow-cyan" : "bg-slate-500"
                    }`} />
                    <span className="text-sm font-bold text-gray-200 uppercase tracking-wide">
                      LEAGUE CLIENT
                    </span>
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded ${
                    isLeagueConnected 
                      ? 'text-emerald-400 bg-emerald-500/20' 
                      : 'text-slate-400 bg-slate-700'
                  }`}>
                    {isLeagueConnected ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                
                {!isLeagueConnected && (
                  <Button 
                    onClick={connectToLeague} 
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg h-12 font-black uppercase tracking-wider shadow-lg glow-cyan"
                  >
                    CONNECT TO CLIENT
                  </Button>
                )}
                
                {leagueError && (
                  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50 glow-red">
                    <p className="text-sm text-red-300 font-semibold">{leagueError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {/* 피어리스 모드 선택 */}
          {roomId && isHost && (
            <FearlessModeSelector
              currentMode={fearlessMode}
              onModeChange={setFearlessMode}
              disabled={false}
            />
          )}

          {/* 사용 안내 - 게임 스타일 */}
          {!roomId && (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border border-cyan-500/30 backdrop-blur-sm">
              <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-6 uppercase tracking-wide">
                💡 HOW TO USE
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center glow-cyan border border-cyan-400/50">
                    <span className="text-white font-black text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-100 mb-1 uppercase tracking-wide">HOST</p>
                    <p className="text-sm text-cyan-300/80">
                      Create room & share code
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center glow-purple border border-purple-400/50">
                    <span className="text-white font-black text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-100 mb-1 uppercase tracking-wide">GUEST</p>
                    <p className="text-sm text-purple-300/80">
                      Enter code & join room
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center glow-cyan border border-emerald-400/50">
                    <span className="text-white font-black text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-100 mb-1 uppercase tracking-wide">LIVE SHARE</p>
                    <p className="text-sm text-emerald-300/80">
                      Auto ban/pick sharing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="lg:col-span-8 space-y-4">
          {/* 챔피언 선택 데이터 표시 */}
          {roomId && lastSessionState !== "finalized" && (
            <ChampSelectDisplay 
              session={displayData}
              fearlessMode={fearlessMode}
              restrictedChampions={restrictedChampions}
            />
          )}

          {/* Finalization 후 대기 메시지 */}
          {roomId && lastSessionState === "finalized" && (
            <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-16 border-2 border-emerald-500/50 backdrop-blur-sm text-center animate-glow-pulse">
              <div className="text-8xl mb-6 animate-pulse">🎮</div>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4 uppercase tracking-wide">
                GAME STARTED
              </p>
              <p className="text-sm text-emerald-300/80 font-semibold uppercase tracking-wider">
                Waiting for next set...
              </p>
            </div>
          )}

          {/* 게임 세트 기록 */}
          {roomId && gameSets.length > 0 && (
            <GameSetHistory
              gameSets={gameSets}
              onReset={resetFearless}
              onRemoveSet={removeGameSet}
            />
          )}

          {/* 환영 메시지 (방이 없을 때) */}
          {!roomId && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-16 border-2 border-cyan-500/30 backdrop-blur-sm text-center relative overflow-hidden">
              {/* 배경 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer"></div>
              
              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-pulse">🎮</div>
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 uppercase tracking-wide">
                  WELCOME TO FEARLESS DRAFT
                </h2>
                <p className="text-cyan-300/80 mb-8 text-lg font-semibold">
                  Create or join a room to get started
                </p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/50 glow-cyan">
                  <span className="text-cyan-400 text-sm font-black uppercase tracking-wider">
                    ⚡ REAL-TIME P2P BAN/PICK SHARING
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
