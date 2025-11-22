import type { ChampSelectSession } from "./champSelect";

export type FearlessMode = "none" | "soft" | "hard";

export interface GameSet {
  id: string;
  setNumber: number;
  timestamp: number;
  session: ChampSelectSession;
  myTeamPicks: number[]; // 우리 팀이 픽한 챔피언 ID들
  theirTeamPicks: number[]; // 상대 팀이 픽한 챔피언 ID들
  myTeamBans: number[]; // 우리 팀이 밴한 챔피언 ID들
  theirTeamBans: number[]; // 상대 팀이 밴한 챔피언 ID들
}

export interface FearlessState {
  mode: FearlessMode;
  gameSets: GameSet[];
}

// 피어리스 규칙에 따라 선택 불가능한 챔피언 목록 반환
export function getRestrictedChampions(
  mode: FearlessMode,
  gameSets: GameSet[],
  isMyTeam: boolean
): number[] {
  if (mode === "none" || gameSets.length === 0) {
    return [];
  }

  const restricted = new Set<number>();

  for (const gameSet of gameSets) {
    if (mode === "soft") {
      // 소프트 피어리스: 자기 팀이 선택했던 챔피언만 제한
      const teamPicks = isMyTeam ? gameSet.myTeamPicks : gameSet.theirTeamPicks;
      teamPicks.forEach((id) => restricted.add(id));
    } else if (mode === "hard") {
      // 하드 피어리스: 양 팀 모두가 선택했던 모든 챔피언 제한
      gameSet.myTeamPicks.forEach((id) => restricted.add(id));
      gameSet.theirTeamPicks.forEach((id) => restricted.add(id));
    }
  }

  return Array.from(restricted);
}

