import { useEffect, useState } from "react";
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

  // 호스트인 경우: 서버로부터 받은 리그 클라이언트 데이터를 P2P로 브로드캐스트
  useEffect(() => {
    if (isHost && champSelectData !== undefined) {
      broadcastData(champSelectData);
    }
  }, [isHost, champSelectData, broadcastData]);

  // 세션 완료 감지 및 기록
  useEffect(() => {
    const displayData = isHost ? champSelectData : receivedData;

    if (displayData) {
      const isComplete = isSessionComplete(displayData);
      const phase = displayData.timer.phase?.toLowerCase() || "";
      
      console.log("현재 phase:", phase, "완료 여부:", isComplete);
      
      // Finalization 단계 = 게임 시작 확정
      if (phase === "finalization" && lastSessionState !== "finalized") {
        console.log("🎮 게임 시작 확정 (Finalization) - 기록 추가");
        addGameSet(displayData);
        setLastSessionState("finalized");
        setCompletedSessionData(null);
      } else if (isComplete && lastSessionState !== "completed" && lastSessionState !== "finalized") {
        // 세션이 완료됨 (모든 픽 완료)
        console.log("✅ 챔피언 선택 완료 - 데이터 저장");
        setCompletedSessionData(displayData);
        setLastSessionState("completed");
      } else if (!isComplete && (lastSessionState === "completed" || lastSessionState === "finalized")) {
        // 새로운 세션 시작
        console.log("🔄 새 세션 시작");
        setLastSessionState("active");
        setCompletedSessionData(null);
      } else if (!isComplete && lastSessionState === null) {
        // 첫 세션 시작
        setLastSessionState("active");
      }
    } else if (lastSessionState !== null && lastSessionState !== "finalized") {
      // 세션이 사라짐 (Finalization 전에)
      console.log("❌ 세션 종료됨");
      setLastSessionState(null);
      setCompletedSessionData(null);
    }
  }, [isHost, champSelectData, receivedData, isSessionComplete, addGameSet, lastSessionState, completedSessionData]);

  // 방 만들기 핸들러 (호스트)
  const handleCreateRoom = async () => {
    createRoom();
    // 방을 만들면 자동으로 서버의 리그 클라이언트 연결 시도
    await connectToLeague();
  };

  // 표시할 데이터 결정 (호스트면 자신의 데이터, 게스트면 받은 데이터)
  const displayData = isHost ? champSelectData : receivedData;

  // 피어리스 규칙에 따른 제한 챔피언 계산
  const restrictedChampions = {
    myTeam: getRestrictedChampions(fearlessMode, gameSets, true),
    theirTeam: getRestrictedChampions(fearlessMode, gameSets, false),
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* 토스 스타일 헤더 */}
      <header className="border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-8 w-8" />
              <h1 className="text-xl font-bold text-gray-900">밴픽 공유</h1>
            </div>
            {roomId && (
              <div className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${isHost ? 'bg-blue-500' : 'bg-green-500'}`} />
                <span className="text-gray-600 font-medium">{isHost ? '호스트' : '게스트'}</span>
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

          {/* 연결 상태 표시 - 토스 스타일 */}
          {roomId && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isHost ? 'bg-blue-50' : 'bg-green-50'
                }`}>
                  <span className="text-lg">
                    {isHost ? "🏠" : "👥"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {isHost ? "호스트 모드" : "게스트 모드"}
                  </p>
                  <p className="text-xs text-gray-500">
                    연결된 사용자: {isHost ? connections.length : 1}명
                  </p>
                </div>
              </div>
            </div>
            
            {isHost && (
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  isLeagueConnected ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      isLeagueConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`} />
                    <span className="text-sm font-medium text-gray-900">
                      리그 클라이언트
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    isLeagueConnected ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {isLeagueConnected ? "연결됨" : "연결 안 됨"}
                  </span>
                </div>
                
                {!isLeagueConnected && (
                  <Button 
                    onClick={connectToLeague} 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-10 font-semibold"
                  >
                    리그 클라이언트 연결
                  </Button>
                )}
                
                {leagueError && (
                  <div className="p-3 rounded-xl bg-red-50">
                    <p className="text-sm text-red-900">{leagueError}</p>
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

          {/* 사용 안내 - 토스 스타일 */}
          {!roomId && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">💡 사용 방법</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">호스트</p>
                    <p className="text-sm text-gray-600">
                      방 만들기 후 코드 공유
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">게스트</p>
                    <p className="text-sm text-gray-600">
                      방 코드 입력 후 참가
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">실시간 공유</p>
                    <p className="text-sm text-gray-600">
                      자동으로 밴픽 공유
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
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                게임이 시작되었습니다
              </p>
              <p className="text-sm text-gray-600">
                다음 세트를 기다리는 중...
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
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                리그오브레전드 밴픽 공유에 오신 것을 환영합니다
              </h2>
              <p className="text-gray-600 mb-6">
                왼쪽에서 방을 만들거나 참가하여 시작하세요
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                <span className="text-blue-600 text-sm font-medium">
                  💡 실시간 P2P 밴픽 공유 서비스
                </span>
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
