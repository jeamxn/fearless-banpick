import { serve } from "bun";
import index from "./index.html";
import { LeagueClientService } from "./server/leagueClient";
import type { ChampSelectSession } from "./types/champSelect";

// 자체 서명된 인증서 허용
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 리그 클라이언트 서비스 인스턴스
const leagueService = new LeagueClientService();

// WebSocket과 구독 해제 함수를 매핑
const wsUnsubscribeMap = new Map<any, () => void>();

const server = serve({
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket 업그레이드 요청 처리
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req);
      if (upgraded) {
        return undefined;
      }
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // 일반 라우트는 routes로 처리
    return undefined;
  },

  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/league/connect": {
      async POST(req) {
        const success = await leagueService.connect();
        return Response.json({
          success,
          message: success
            ? "리그 클라이언트에 연결되었습니다."
            : "리그 클라이언트를 찾을 수 없습니다.",
        });
      },
    },

    "/api/league/status": {
      async GET(req) {
        return Response.json({
          connected: leagueService.getConnectionStatus(),
        });
      },
    },
  },

  websocket: {
    open(ws) {
      console.log("WebSocket 클라이언트 연결됨");

      // 리그 클라이언트 데이터 구독
      const unsubscribe = leagueService.subscribe((data: ChampSelectSession | null) => {
        try {
          ws.send(
            JSON.stringify({
              type: "champ-select-data",
              data,
            })
          );
        } catch (error) {
          console.error("WebSocket 전송 오류:", error);
        }
      });

      // 구독 해제 함수 저장
      wsUnsubscribeMap.set(ws, unsubscribe);
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message as string);

        if (data.type === "connect-league") {
          // 클라이언트가 리그 연결 요청
          leagueService.connect().then((success) => {
            ws.send(
              JSON.stringify({
                type: "league-connection-status",
                success,
                message: success
                  ? "리그 클라이언트에 연결되었습니다."
                  : "리그 클라이언트를 찾을 수 없습니다.",
              })
            );
          });
        }
      } catch (error) {
        console.error("WebSocket 메시지 처리 오류:", error);
      }
    },

    close(ws) {
      console.log("WebSocket 클라이언트 연결 종료");

      // 구독 해제
      const unsubscribe = wsUnsubscribeMap.get(ws);
      if (unsubscribe) {
        unsubscribe();
        wsUnsubscribeMap.delete(ws);
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

// 프로세스 종료 시 정리
process.on("SIGINT", () => {
  console.log("\n\n👋 서버를 종료합니다...");
  leagueService.disconnect();
  process.exit(0);
});
