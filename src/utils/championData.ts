// Data Dragon 버전 및 챔피언 데이터 관리

let championData: Record<string, any> = {};
let currentVersion = "14.1.1"; // 기본 버전

// 최신 버전 가져오기
export async function fetchLatestVersion(): Promise<string> {
  try {
    const response = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    const versions = await response.json();
    currentVersion = versions[0];
    return currentVersion;
  } catch (error) {
    console.error("버전 정보를 가져오는데 실패했습니다:", error);
    return currentVersion;
  }
}

// 챔피언 데이터 가져오기
export async function fetchChampionData(): Promise<void> {
  try {
    console.log("챔피언 데이터 가져오는 중...", currentVersion);
    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/data/ko_KR/champion.json`
    );
    const data = await response.json();
    championData = data.data;
    console.log("챔피언 데이터 로드 완료:", Object.keys(championData).length, "개");
  } catch (error) {
    console.error("챔피언 데이터를 가져오는데 실패했습니다:", error);
  }
}

// 챔피언 ID로 챔피언 정보 찾기
export function getChampionById(championId: number): any {
  if (championId === 0 || championId === -1) return null;
  
  console.log("챔피언 찾기:", championId, "데이터 개수:", Object.keys(championData).length);
  
  for (const key in championData) {
    if (parseInt(championData[key].key) === championId) {
      console.log("찾음:", championData[key].name);
      return championData[key];
    }
  }
  console.log("못 찾음:", championId);
  return null;
}

// 챔피언 초상화 URL 가져오기
export function getChampionIconUrl(championId: number): string {
  if (championId === 0 || championId === -1) {
    return "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
  }
  
  const champion = getChampionById(championId);
  if (!champion) {
    console.warn("챔피언을 찾을 수 없음:", championId);
    return "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/29.png";
  }
  
  const url = `https://ddragon.leagueoflegends.com/cdn/${currentVersion}/img/champion/${champion.id}.png`;
  console.log("챔피언 이미지 URL:", url);
  return url;
}

// 챔피언 이름 가져오기
export function getChampionName(championId: number): string {
  if (championId === 0 || championId === -1) {
    return "미선택";
  }
  
  const champion = getChampionById(championId);
  return champion ? champion.name : `챔피언 ID ${championId}`;
}

// 챔피언 스플래시 아트 URL 가져오기
export function getChampionSplashUrl(championId: number): string {
  const champion = getChampionById(championId);
  if (!champion) {
    return "";
  }
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_0.jpg`;
}

// 초기화
export async function initializeChampionData(): Promise<void> {
  await fetchLatestVersion();
  await fetchChampionData();
}

