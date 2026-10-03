import type { Weather } from '../types/Weather';
import type { CustomerProgress } from '../types/Customer';

/** Small present-day conversations, independent of each character's story milestones. */
const everyday: Record<string, string[]> = {
    nabi: ['{food} 주세요. 저 빈자리를 보면 할머니가 앉아 계시던 모습이 생각나요.', '{food} 하나요. 오늘은 식당 불빛이 보이자 발걸음이 빨라졌어요.'],
    dubu: ['화단 옆에서 파란 단추를 주웠어요! {food} 먹고 까망이한테 보여 줄래요.', '오늘 주운 반짝이는 돌은 친구에게 줄 거예요. {food} 주세요!'],
    kkamang: ['{food}. 문 앞 자리는 비워 둘게. 늦게 오는 애들 있을지도 모르니까.', '{food} 하나. 골목 한 바퀴 확인하고 왔어. 다들 잘 들어갔더라.'],
    mongsil: ['{food} 주세요! 꽃집 아주머니한테 들었는데, 골목 화분에 새싹이 났대요.', '아까 가게가 문 닫는다고 했죠? 쉬는 날을 잘못 들었어요! {food} 먹으면서 정정할래요.'],
    kong: ['{food} 주세요! 별 보러 갈 때 챙길 것들을 적었어요. 담요가 첫 번째예요.', '{food} 먹고 별자리를 그릴래요. 여행에서 돌아오면 여기서 보여 드릴게요.'],
    donggu: ['{food} 주세요. 누나 보고 싶다. 멀리 일하러 가서 자주 못 만나거든요.', '{food} 먹고 누나한테 잘 지낸다고 전할래요. 누나 목소리를 들으면 꼬리가 저절로 움직여요.'],
    bori: ['{food} 부탁해요. 오늘은 편지를 기다리던 친구가 문 앞까지 마중 나왔어요.', '{food} 먹고 마지막 배달을 갈게요. 답장을 전하는 길은 발걸음이 가벼워요.'],
    dal: ['{food} 하나요. 오늘은 이 골목의 불빛을 시에 담아 봤어요.', '{food} 먹으며 한 줄 더 쓸래요. 익숙한 자리가 생긴다는 건 좋은 일이네요.'],
    hodu: ['{food} 주세요. 빵집 간판에 넣을 이름을 아직 고르고 있어요.', '{food} 먹고 반죽을 연습할래요. 처음 구운 빵보다 오늘 건 덜 탔어요!'],
};
const closeOrders: Record<string, string> = {
    nabi: '{food} 하나요. 오늘은 조금 가까이 앉아도 될까요? 여기서는 기다리는 시간도 덜 외로워요.',
    kkamang: '{food}. 다 먹고 조금 더 있다 갈게. 문 닫을 때 골목까지 같이 나가자.',
};
export function friendOrder(id: string, weather: Weather, p: CustomerProgress | undefined, food: string, random = Math.random): string | undefined {
    if (!everyday[id] || !p || p.visitCount < 2 || random() >= .3) return undefined;
    const rain: Record<string,string> = {
        donggu: '{food} 주세요. 비 오는 날엔 누나랑 우산 아래서 걷던 게 생각나요. 누나 보고 싶다.',
        kong: '{food} 주세요. 구름 뒤에도 별은 있겠죠? 오늘은 기억해 둔 별자리를 이야기할래요.',
        dubu: '{food} 주세요! 오늘 주운 단추는 처마 밑에서 찾았어요. 비에 씻겨 반짝였거든요.',
    };
    const pool = everyday[id];
    const line = weather === 'rain' && rain[id] ? rain[id] : p.intimacy >= 10 && closeOrders[id] ? closeOrders[id] : pool[Math.floor(random() * pool.length)];
    return line.replaceAll('{food}',food);
}
export const friendPairs = [['nabi','donggu'],['dubu','kkamang'],['mongsil','kong']] as const;
export function friends(a: string, b: string): boolean { return friendPairs.some(pair=>pair.some(id=>id===a)&&pair.some(id=>id===b)&&a!==b); }
export function friendConversation(a: string, b: string, weather: Weather, night: number): {name:string;text:string}[] {
    if (!friends(a,b)) return [];
    if ([a,b].includes('nabi')) return [
        {name:'나비',text:'할머니는 추운 날이면 따뜻한 자리를 먼저 내주셨지요.'},
        {name:'동구',text:'기억나요. 저도 그 옆에서 가만히 기다리곤 했어요.'},
        {name:'나비',text:'오늘은 우리 둘이 그 온기를 나눠요.'},
    ];
    if ([a,b].includes('dubu')) return night % 2 === 0 ? [
        {name:'두부',text:'화단 옆에서 찾은 단추예요! 까망이 털처럼 까만색이라 가져왔어요.'},
        {name:'까망이',text:'…작네. 잃어버리겠다. 내가 보관할게.'},
        {name:'두부',text:'주머니에 넣었네요! 마음에 들었죠?'},
    ] : [
        {name:'두부',text:'처마 밑에서 반짝이는 돌을 주웠어요. 까망이 선물이에요!'},
        {name:'까망이',text:'…고마워. 주머니에 넣어 둘게. 밥부터 먹어, 식겠다.'},
        {name:'두부',text:'다음엔 더 반짝이는 보물을 찾아올게요!'},
    ];
    return [
        {name:'몽실이',text:weather==='rain'?'오늘은 별이 안 보인다고 다들 아쉬워하더라고요.':'꽃집 아주머니가 오늘 별이 예쁠 거라고 하셨어요!'},
        {name:'콩이',text:weather==='rain'?'구름 뒤에 숨어 있을 뿐이에요. 제가 아는 별 이야기를 해 줄까요?':'그럼 다 먹고 같이 볼래요? 제가 고양이 귀처럼 생긴 별을 알려 줄게요!'},
        {name:'몽실이',text:'좋아요! 내일은 그 이야기도 친구들에게 전할래요.'},
    ];
}
