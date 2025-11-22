import { authenticate, createWebSocketConnection } from "league-connect";
import type { ChampSelectSession } from "../types/champSelect";

export class LeagueClientService {
  private ws: any = null;
  private isConnected = false;
  private callbacks: Set<(data: ChampSelectSession | null) => void> = new Set();

  async connect() {
    try {
      console.log("리그오브레전드 클라이언트에 연결 중...");
      const credentials = await authenticate();
      console.log("✅ 연결 성공!");

      // WebSocket 연결로 실시간 업데이트 수신
      this.ws = await createWebSocketConnection({
        authenticationOptions: credentials,
        pollInterval: 1000,
      });

      // 챔피언 선택 세션 업데이트 구독
      this.ws.subscribe("/lol-champ-select/v1/session", (data: any) => {
        const sessionData = data as ChampSelectSession | null;
        this.callbacks.forEach((callback) => callback(sessionData));
      });

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("❌ 리그오브레전드 클라이언트를 찾을 수 없습니다.", error);
      this.isConnected = false;
      return false;
    }
  }

  subscribe(callback: (data: ChampSelectSession | null) => void) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.callbacks.clear();
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

