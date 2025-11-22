import { useState, useEffect, useCallback } from "react";
import type { ChampSelectSession } from "../types/champSelect";
import type { FearlessMode, GameSet, FearlessState } from "../types/fearless";

const STORAGE_KEY_PREFIX = "fearless-banpick-state";

const getStorageKey = (roomId: string | null) => {
  if (!roomId) return null;
  return `${STORAGE_KEY_PREFIX}-${roomId}`;
};

export const useFearless = (roomId: string | null = null) => {
  const [fearlessState, setFearlessState] = useState<FearlessState>(() => {
    // 방 ID가 없으면 기본 상태 반환
    if (!roomId) {
      return {
        mode: "none" as FearlessMode,
        gameSets: [],
      };
    }

    // 로컬 스토리지에서 방별로 불러오기
    try {
      const storageKey = getStorageKey(roomId);
      if (storageKey) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (error) {
      console.error("피어리스 상태 로드 실패:", error);
    }
    return {
      mode: "none" as FearlessMode,
      gameSets: [],
    };
  });

  const [lastSessionId, setLastSessionId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomId);

  // 방 ID가 변경되면 상태 초기화 및 로드
  useEffect(() => {
    if (roomId !== currentRoomId) {
      setCurrentRoomId(roomId);
      setLastSessionId(null);

      if (!roomId) {
        setFearlessState({
          mode: "none" as FearlessMode,
          gameSets: [],
        });
        return;
      }

      // 새 방의 데이터 로드
      try {
        const storageKey = getStorageKey(roomId);
        if (storageKey) {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            setFearlessState(JSON.parse(saved));
            console.log(`📂 방 ${roomId}의 데이터 로드 완료`);
          } else {
            setFearlessState({
              mode: "none" as FearlessMode,
              gameSets: [],
            });
            console.log(`📂 방 ${roomId}의 새 데이터 생성`);
          }
        }
      } catch (error) {
        console.error("피어리스 상태 로드 실패:", error);
        setFearlessState({
          mode: "none" as FearlessMode,
          gameSets: [],
        });
      }
    }
  }, [roomId, currentRoomId]);

  // 상태가 변경될 때마다 로컬 스토리지에 방별로 저장
  useEffect(() => {
    if (!currentRoomId) return;

    try {
      const storageKey = getStorageKey(currentRoomId);
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(fearlessState));
      }
    } catch (error) {
      console.error("피어리스 상태 저장 실패:", error);
    }
  }, [fearlessState, currentRoomId]);

  // 피어리스 모드 변경
  const setMode = useCallback((mode: FearlessMode) => {
    setFearlessState((prev) => ({ ...prev, mode }));
  }, []);

  // 세션 데이터에서 픽/밴 추출
  const extractPicksAndBans = useCallback((session: ChampSelectSession) => {
    const myTeamPicks: number[] = [];
    const theirTeamPicks: number[] = [];
    const myTeamBans: number[] = [];
    const theirTeamBans: number[] = [];

    // 픽 추출
    session.myTeam.forEach((player) => {
      if (player.championId !== 0) {
        myTeamPicks.push(player.championId);
      }
    });

    session.theirTeam.forEach((player) => {
      if (player.championId !== 0) {
        theirTeamPicks.push(player.championId);
      }
    });

    // 밴 추출
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

    return { myTeamPicks, theirTeamPicks, myTeamBans, theirTeamBans };
  }, []);

  // 게임 세트 추가
  const addGameSet = useCallback(
    (session: ChampSelectSession) => {
      const { myTeamPicks, theirTeamPicks, myTeamBans, theirTeamBans } =
        extractPicksAndBans(session);

      // 픽이 완료되지 않았으면 추가하지 않음
      if (myTeamPicks.length === 0 && theirTeamPicks.length === 0) {
        return;
      }

      const sessionId = `${session.timer.internalNowInEpochMs}`;
      
      // 같은 세션이면 추가하지 않음
      if (sessionId === lastSessionId) {
        return;
      }

      setLastSessionId(sessionId);

      const newGameSet: GameSet = {
        id: sessionId,
        setNumber: fearlessState.gameSets.length + 1,
        timestamp: Date.now(),
        session,
        myTeamPicks,
        theirTeamPicks,
        myTeamBans,
        theirTeamBans,
      };

      setFearlessState((prev) => ({
        ...prev,
        gameSets: [...prev.gameSets, newGameSet],
      }));

      console.log(`✅ 세트 ${newGameSet.setNumber} 기록 완료`);
    },
    [fearlessState.gameSets.length, lastSessionId, extractPicksAndBans]
  );

  // 챔피언 선택 세션이 종료되었는지 확인
  const isSessionComplete = useCallback((session: ChampSelectSession | null) => {
    if (!session) return false;

    // 모든 플레이어가 픽을 완료했는지 확인
    const allMyTeamPicked = session.myTeam.every((p) => p.championId !== 0);
    const allTheirTeamPicked = session.theirTeam.every((p) => p.championId !== 0);

    return allMyTeamPicked && allTheirTeamPicked;
  }, []);

  // 초기화
  const reset = useCallback(() => {
    setFearlessState({
      mode: fearlessState.mode,
      gameSets: [],
    });
    setLastSessionId(null);
    console.log("🔄 피어리스 기록 초기화");
  }, [fearlessState.mode]);

  // 특정 세트 삭제
  const removeGameSet = useCallback((setId: string) => {
    setFearlessState((prev) => {
      const filteredSets = prev.gameSets.filter((set) => set.id !== setId);
      // 세트 번호 재정렬
      const reorderedSets = filteredSets.map((set, index) => ({
        ...set,
        setNumber: index + 1,
      }));
      return {
        ...prev,
        gameSets: reorderedSets,
      };
    });
    console.log("🗑️ 세트 삭제 완료");
  }, []);

  return {
    mode: fearlessState.mode,
    gameSets: fearlessState.gameSets,
    setMode,
    addGameSet,
    isSessionComplete,
    reset,
    removeGameSet,
  };
};

