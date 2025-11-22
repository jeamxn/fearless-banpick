import { authenticate, createWebSocketConnection } from "league-connect";

// 자체 서명된 인증서 허용
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface ChampSelectSession {
  actions: Array<
    Array<{
      actorCellId: number;
      championId: number;
      completed: boolean;
      id: number;
      isAllyAction: boolean;
      isInProgress: boolean;
      pickTurn: number;
      type: "pick" | "ban";
    }>
  >;
  bans: {
    myTeamBans: number[];
    theirTeamBans: number[];
    numBans: number;
  };
  localPlayerCellId: number;
  timer: {
    adjustedTimeLeftInPhase: number;
    internalNowInEpochMs: number;
    isInfinite: boolean;
    phase: string;
    totalTimeInPhase: number;
  };
  myTeam: Array<{
    cellId: number;
    championId: number;
    championPickIntent: number;
    summonerId: number;
    assignedPosition: string;
  }>;
  theirTeam: Array<{
    cellId: number;
    championId: number;
    summonerId: number;
  }>;
}

const connectToLeagueClient = async () => {
  try {
    console.log("리그오브레전드 클라이언트에 연결 중...");
    const credentials = await authenticate();
    console.log("✅ 연결 성공!");
    console.log(`포트: ${credentials.port}`);
    return credentials;
  } catch (error) {
    console.error("❌ 리그오브레전드 클라이언트를 찾을 수 없습니다.");
    console.error("클라이언트가 실행 중인지 확인해주세요.");
    throw error;
  }
};

const displayChampSelectData = (session: ChampSelectSession) => {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 챔피언 선택 단계 정보");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 타이머 정보
  console.log(`⏱️  현재 단계: ${session.timer.phase}`);
  console.log(`⏱️  남은 시간: ${Math.floor(session.timer.adjustedTimeLeftInPhase / 1000)}초\n`);

  // 밴 정보 (actions에서 추출)
  const myTeamBans: number[] = [];
  const theirTeamBans: number[] = [];

  for (const actionGroup of session.actions) {
    for (const action of actionGroup) {
      if (action.type === "ban" && action.completed && action.championId !== 0) {
        if (action.isAllyAction) {
          myTeamBans.push(action.championId);
        } else {
          theirTeamBans.push(action.championId);
        }
      }
    }
  }

  console.log("🚫 밴 정보:");
  console.log(`   우리 팀: ${myTeamBans.length > 0 ? myTeamBans.map((id) => `챔피언 ID ${id}`).join(", ") : "없음"}`);
  console.log(
    `   상대 팀: ${theirTeamBans.length > 0 ? theirTeamBans.map((id) => `챔피언 ID ${id}`).join(", ") : "없음"}\n`,
  );

  // 우리 팀 정보
  console.log("👥 우리 팀:");
  for (const player of session.myTeam) {
    const isLocalPlayer = player.cellId === session.localPlayerCellId;
    const prefix = isLocalPlayer ? "👉" : "  ";
    const pickIntent = player.championPickIntent !== 0 ? ` (의도: ${player.championPickIntent})` : "";
    const picked = player.championId !== 0 ? `챔피언 ID ${player.championId}` : "선택 안 함";
    console.log(`${prefix} [${player.assignedPosition || "미정"}] ${picked}${pickIntent}`);
  }

  // 상대 팀 정보
  console.log("\n👥 상대 팀:");
  for (const player of session.theirTeam) {
    const picked = player.championId !== 0 ? `챔피언 ID ${player.championId}` : "선택 안 함";
    console.log(`   ${picked}`);
  }

  // 현재 진행 중인 액션
  console.log("\n🎯 현재 액션:");
  for (const actionGroup of session.actions) {
    for (const action of actionGroup) {
      if (action.isInProgress) {
        const actionType = action.type === "ban" ? "밴" : "픽";
        const team = action.isAllyAction ? "우리 팀" : "상대 팀";
        console.log(`   ${team} - ${actionType} 진행 중`);
      }
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};

const startRealtimeMonitoring = async () => {
  try {
    const credentials = await connectToLeagueClient();

    console.log("\n🔄 실시간 모니터링 시작...\n");

    // WebSocket 연결로 실시간 업데이트 수신
    const ws = await createWebSocketConnection({
      authenticationOptions: credentials,
      // 자체 서명된 인증서 허용
      pollInterval: 1000,
    });

    // 챔피언 선택 세션 업데이트 구독
    ws.subscribe("/lol-champ-select/v1/session", (data) => {
      if (data) {
        displayChampSelectData(data as ChampSelectSession);
      } else {
        console.log("⏸️  챔피언 선택 단계가 아닙니다.\n");
      }
    });

    console.log("✅ 실시간 모니터링이 활성화되었습니다.");
    console.log("💡 챔피언 선택 단계에 진입하면 자동으로 데이터가 표시됩니다.\n");

    // 프로세스 종료 처리
    process.on("SIGINT", () => {
      console.log("\n\n👋 모니터링을 종료합니다...");
      ws.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
};

// 프로그램 시작
startRealtimeMonitoring();
