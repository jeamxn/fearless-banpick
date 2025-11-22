import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RoomControlsProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  roomId: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const RoomControls = ({
  onCreateRoom,
  onJoinRoom,
  roomId,
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
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      alert("방 코드가 복사되었습니다!");
    }
  };

  if (roomId) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-lg font-bold text-gray-900">연결됨</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4 wrap-break-word">
          방 코드를 공유하여 초대하세요
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={roomId}
              readOnly
              className="font-mono text-lg font-bold border-gray-200 bg-gray-50 focus:bg-white transition-colors min-w-0"
            />
            <Button 
              onClick={handleCopyRoomId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl font-semibold shadow-sm shrink-0"
            >
              복사
            </Button>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-900 wrap-break-word">
              💡 코드 공유 시 실시간 밴픽 공유
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-2 wrap-break-word">🎮 밴픽 공유</h2>
      <p className="text-sm text-gray-600 mb-6 wrap-break-word">
        방을 만들거나 참가하세요
      </p>
      
      <div className="space-y-4">
        {/* 방 만들기 */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold text-gray-900">방 만들기</Label>
            <p className="text-xs text-gray-500 mt-1 wrap-break-word">
              리그 실행 중인 PC에서 생성
            </p>
          </div>
          <Button
            onClick={onCreateRoom}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl font-semibold shadow-sm transition-all"
          >
            {isConnecting ? "연결 중..." : "방 만들기"}
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-500 font-medium">
              또는
            </span>
          </div>
        </div>

        {/* 방 참가하기 */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="roomId" className="text-sm font-semibold text-gray-900">
              방 참가하기
            </Label>
            <p className="text-xs text-gray-500 mt-1 wrap-break-word">
              방 코드 입력
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              id="roomId"
              placeholder="ABC123"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleJoinRoom();
                }
              }}
              className="font-mono text-base border-gray-200 bg-gray-50 focus:bg-white transition-colors rounded-xl h-12 min-w-0"
              disabled={isConnecting}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={isConnecting || !roomIdInput.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 rounded-xl font-semibold shadow-sm h-12 shrink-0"
            >
              {isConnecting ? "연결 중" : "참가"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-900 font-medium wrap-break-word">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

