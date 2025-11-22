import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RoomControlsProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  peerId: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const RoomControls = ({
  onCreateRoom,
  onJoinRoom,
  peerId,
  isConnecting,
  error,
}: RoomControlsProps) => {
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleJoinRoom = () => {
    if (roomIdInput.trim()) {
      onJoinRoom(roomIdInput.trim().toUpperCase());
    }
  };

  const handleCopyRoomId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      alert("방 코드가 복사되었습니다!");
    }
  };

  if (peerId) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>✅ 연결됨</CardTitle>
          <CardDescription>방 코드를 공유하여 다른 사람들을 초대하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={peerId}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button onClick={handleCopyRoomId}>복사</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              이 코드를 다른 사람들에게 공유하면 실시간으로 밴픽을 함께 볼 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🎮 밴픽 공유 시작하기</CardTitle>
        <CardDescription>
          방을 만들거나 기존 방에 참가하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 방 만들기 */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">방 만들기</Label>
            <p className="text-sm text-muted-foreground mb-2">
              리그 클라이언트가 실행 중인 컴퓨터에서 방을 만드세요
            </p>
            <Button
              onClick={onCreateRoom}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? "연결 중..." : "방 만들기"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                또는
              </span>
            </div>
          </div>

          {/* 방 참가하기 */}
          <div className="space-y-2">
            <Label htmlFor="roomId" className="text-base font-semibold">
              방 참가하기
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              공유받은 방 코드를 입력하세요
            </p>
            <div className="flex gap-2">
              <Input
                id="roomId"
                placeholder="방 코드 입력 (예: ABC123)"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleJoinRoom();
                  }
                }}
                className="font-mono"
                disabled={isConnecting}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={isConnecting || !roomIdInput.trim()}
                size="lg"
              >
                {isConnecting ? "연결 중..." : "참가"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

