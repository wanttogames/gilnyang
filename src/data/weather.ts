import type { Weather } from '../types/Weather';
export const weatherDefinitions: Record<Weather, {
    name: string;
    caption: string;
    greeting: string;
}> = {
    clear: { name: '맑음', caption: '별빛 아래, 작은 등불이 골목을 밝혀요.', greeting: '맑은 밤, 따뜻한 한 끼를 준비해요.' },
    rain: { name: '비', caption: '빗소리 사이로, 따뜻한 냄비 소리가 들려요.', greeting: '비 오는 밤, 잠시 쉬어 갈 자리를 내어 주세요.' },
    snow: { name: '눈', caption: '사뿐히 내리는 눈이 골목의 발걸음을 감싸요.', greeting: '눈 오는 밤, 손끝까지 데워 줄 음식을 만들어요.' }
};
