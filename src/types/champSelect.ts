export interface ChampSelectSession {
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

