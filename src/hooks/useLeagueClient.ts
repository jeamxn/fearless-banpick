import { useState, useEffect, useCallback, useRef } from "react";
import type { ChampSelectSession } from "../types/champSelect";

export const useLeagueClient = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [champSelectData, setChampSelectData] = useState<ChampSelectSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      console.log("서버에 연결 중...");

      // 서버의 WebSocket에 연결
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        console.log("✅ 서버 연결 성공!");
        // 리그 클라이언트 연결 요청
        ws.send(
          JSON.stringify({
            type: "connect-league",
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "league-connection-status") {
            if (message.success) {
              setIsConnected(true);
              setError(null);
            } else {
              setError(message.message);
              setIsConnected(false);
            }
          } else if (message.type === "champ-select-data") {
            setChampSelectData(message.data);
          }
        } catch (err) {
          console.error("메시지 파싱 오류:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket 오류:", err);
        setError("서버 연결에 실패했습니다.");
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("서버 연결 종료");
        setIsConnected(false);
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error("❌ 연결 실패:", err);
      setError("서버 연결에 실패했습니다.");
      setIsConnected(false);
    }
  }, []);

  // 컴포넌트 언마운트 시 WebSocket 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    champSelectData,
    error,
    connect,
  };
};

