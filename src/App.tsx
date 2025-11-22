import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoomControls } from "@/components/RoomControls";
import { ChampSelectDisplay } from "@/components/ChampSelectDisplay";
import { useLeagueClient } from "@/hooks/useLeagueClient";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { initializeChampionData } from "@/utils/championData";
import "./index.css";

export function App() {
  const [isChampionDataLoaded, setIsChampionDataLoaded] = useState(false);

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
    isHost,
    connections,
    receivedData,
    error: peerError,
    isConnecting,
    createRoom,
    joinRoom,
    broadcastData,
  } = usePeerConnection();

  // 호스트인 경우: 서버로부터 받은 리그 클라이언트 데이터를 P2P로 브로드캐스트
  useEffect(() => {
    if (isHost && champSelectData !== undefined) {
      broadcastData(champSelectData);
    }
  }, [isHost, champSelectData, broadcastData]);

  // 방 만들기 핸들러 (호스트)
  const handleCreateRoom = async () => {
    createRoom();
    // 방을 만들면 자동으로 서버의 리그 클라이언트 연결 시도
    await connectToLeague();
  };

  // 표시할 데이터 결정 (호스트면 자신의 데이터, 게스트면 받은 데이터)
  const displayData = isHost ? champSelectData : receivedData;

  return (
    <div className="container mx-auto p-4 md:p-8 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl font-bold text-center">
              🎮 리그오브레전드 밴픽 공유
            </CardTitle>
            <CardDescription className="text-center text-white/90 text-base">
              실시간으로 밴픽을 공유하고 함께 확인하세요
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 방 컨트롤 */}
        <RoomControls
          onCreateRoom={handleCreateRoom}
          onJoinRoom={joinRoom}
          peerId={peerId}
          isConnecting={isConnecting}
          error={peerError}
        />

        {/* 연결 상태 표시 */}
        {peerId && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {isHost ? "🏠" : "👥"}
                  </span>
                  <span className="font-semibold">
                    {isHost ? "호스트 모드" : "게스트 모드"}
                  </span>
                </div>
                
                {isHost && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isLeagueConnected ? "bg-green-500" : "bg-red-500"}`} />
                      <span className="text-sm">
                        리그 클라이언트: {isLeagueConnected ? "연결됨" : "연결 안 됨"}
                      </span>
                    </div>
                    {!isLeagueConnected && (
                      <Button onClick={connectToLeague} size="sm" variant="outline">
                        리그 클라이언트 연결
                      </Button>
                    )}
                    {leagueError && (
                      <p className="text-sm text-red-600">{leagueError}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    연결된 사용자: {isHost ? connections.length : 1}명
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 챔피언 선택 데이터 표시 */}
        {peerId && (
          <ChampSelectDisplay session={displayData} />
        )}

        {/* 사용 안내 */}
        {!peerId && (
          <Card>
            <CardHeader>
              <CardTitle>💡 사용 방법</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold mb-1">1. 호스트 (리그 실행 중인 사람)</p>
                  <p className="text-muted-foreground">
                    "방 만들기" 버튼을 클릭하고 생성된 방 코드를 친구들에게 공유하세요.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">2. 게스트 (관전하는 사람)</p>
                  <p className="text-muted-foreground">
                    공유받은 방 코드를 입력하고 "참가" 버튼을 클릭하세요.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">3. 실시간 공유</p>
                  <p className="text-muted-foreground">
                    챔피언 선택 단계에 진입하면 자동으로 모든 참가자에게 실시간으로 공유됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
