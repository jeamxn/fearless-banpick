import { useState, useEffect, useCallback, useRef } from "react";
import Peer, { DataConnection } from "peerjs";
import type { ChampSelectSession } from "../types/champSelect";

type PeerMessage = {
  type: "champ-select-data";
  data: ChampSelectSession | null;
};

export const usePeerConnection = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [receivedData, setReceivedData] = useState<ChampSelectSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectionsRef = useRef<DataConnection[]>([]);

  // Peer 초기화
  const initializePeer = useCallback((customId?: string) => {
    try {
      setError(null);
      const peerOptions = {
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      };
      
      const newPeer = customId 
        ? new Peer(customId, peerOptions)
        : new Peer(peerOptions);

      newPeer.on("open", (id) => {
        console.log("Peer ID:", id);
        setPeerId(id);
        setIsConnecting(false);
      });

      newPeer.on("error", (err) => {
        console.error("Peer error:", err);
        setError(`연결 오류: ${err.message}`);
        setIsConnecting(false);
      });

      newPeer.on("connection", (conn) => {
        console.log("새로운 연결 수신:", conn.peer);
        setupConnection(conn);
      });

      setPeer(newPeer);
      return newPeer;
    } catch (err) {
      console.error("Peer 초기화 실패:", err);
      setError("P2P 연결 초기화에 실패했습니다.");
      setIsConnecting(false);
      return null;
    }
  }, []);

  // 연결 설정
  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on("open", () => {
      console.log("연결 열림:", conn.peer);
      connectionsRef.current = [...connectionsRef.current, conn];
      setConnections([...connectionsRef.current]);
    });

    conn.on("data", (data) => {
      const message = data as PeerMessage;
      if (message.type === "champ-select-data") {
        setReceivedData(message.data);
      }
    });

    conn.on("close", () => {
      console.log("연결 종료:", conn.peer);
      connectionsRef.current = connectionsRef.current.filter((c) => c !== conn);
      setConnections([...connectionsRef.current]);
    });

    conn.on("error", (err) => {
      console.error("연결 오류:", err);
    });
  }, []);

  // 방 만들기 (호스트)
  const createRoom = useCallback(() => {
    setIsConnecting(true);
    setIsHost(true);
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    initializePeer(roomId);
  }, [initializePeer]);

  // 방 참가하기 (게스트)
  const joinRoom = useCallback(
    (roomId: string) => {
      setIsConnecting(true);
      setIsHost(false);
      const newPeer = initializePeer();

      if (newPeer) {
        newPeer.on("open", () => {
          console.log("방에 연결 중:", roomId);
          const conn = newPeer.connect(roomId, {
            reliable: true,
          });
          setupConnection(conn);
        });
      }
    },
    [initializePeer, setupConnection]
  );

  // 데이터 브로드캐스트 (호스트만)
  const broadcastData = useCallback(
    (data: ChampSelectSession | null) => {
      if (!isHost) return;

      const message: PeerMessage = {
        type: "champ-select-data",
        data,
      };

      connectionsRef.current.forEach((conn) => {
        if (conn.open) {
          conn.send(message);
        }
      });
    },
    [isHost]
  );

  // 정리
  useEffect(() => {
    return () => {
      connectionsRef.current.forEach((conn) => conn.close());
      peer?.destroy();
    };
  }, [peer]);

  return {
    peerId,
    isHost,
    connections,
    receivedData,
    error,
    isConnecting,
    createRoom,
    joinRoom,
    broadcastData,
  };
};

