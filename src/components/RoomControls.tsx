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
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border border-emerald-500/50 backdrop-blur-sm glow-cyan">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse glow-cyan" />
          <h2 className="text-xl font-black text-emerald-400 uppercase tracking-wider">CONNECTED</h2>
        </div>
        <p className="text-sm text-cyan-300/70 mb-4 wrap-break-word font-semibold">
          Share room code to invite others
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={roomId}
              readOnly
              className="font-mono text-xl font-black border-2 border-cyan-500/50 bg-slate-900/80 text-cyan-300 focus:bg-slate-800 transition-colors min-w-0 rounded-lg glow-cyan"
            />
            <Button 
              onClick={handleCopyRoomId}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 rounded-lg font-black shadow-lg glow-cyan shrink-0 uppercase tracking-wide"
            >
              COPY
            </Button>
          </div>
          <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
            <p className="text-xs text-cyan-300 wrap-break-word font-bold uppercase tracking-wide">
              ⚡ REAL-TIME BAN/PICK SHARING ACTIVE
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-6 border border-cyan-500/30 backdrop-blur-sm">
      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 wrap-break-word uppercase tracking-wide">
        🎮 ROOM CONTROL
      </h2>
      <p className="text-sm text-cyan-300/70 mb-6 wrap-break-word font-semibold">
        Create or join a room
      </p>
      
      <div className="space-y-4">
        {/* 방 만들기 */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-black text-gray-200 uppercase tracking-wider">CREATE ROOM</Label>
            <p className="text-xs text-cyan-400/70 mt-1 wrap-break-word font-semibold">
              Must have League Client running
            </p>
          </div>
          <Button
            onClick={onCreateRoom}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white h-14 rounded-lg font-black uppercase tracking-wider shadow-lg glow-cyan transition-all"
          >
            {isConnecting ? "CONNECTING..." : "CREATE ROOM"}
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-cyan-500/30" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900 px-3 text-xs text-cyan-400 font-black uppercase tracking-wider">
              OR
            </span>
          </div>
        </div>

        {/* 방 참가하기 */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="roomId" className="text-sm font-black text-gray-200 uppercase tracking-wider">
              JOIN ROOM
            </Label>
            <p className="text-xs text-purple-400/70 mt-1 wrap-break-word font-semibold">
              Enter room code
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
              className="font-mono text-lg font-black border-2 border-purple-500/50 bg-slate-900/80 text-purple-300 focus:bg-slate-800 transition-colors rounded-lg h-14 min-w-0 placeholder:text-purple-500/30"
              disabled={isConnecting}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={isConnecting || !roomIdInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 rounded-lg font-black shadow-lg glow-purple h-14 shrink-0 uppercase tracking-wide"
            >
              {isConnecting ? "..." : "JOIN"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500/50 glow-red">
            <p className="text-sm text-red-300 font-bold wrap-break-word uppercase tracking-wide">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

