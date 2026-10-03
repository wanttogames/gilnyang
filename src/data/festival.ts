import type { CharacterStoryEvent } from '../types/CharacterStory';
export const festivalStages = { food: '음식 준비', invite: '친구 초대', decorate: '축제 장식', ready: '축제 기다리기', celebrating: '축제의 밤', complete: '함께한 축제' };
export const festivalFinale: CharacterStoryEvent = {
    id: 'ALLEY_FESTIVAL', title: '골목에 불빛이 모인 밤', minVisits: 0, minIntimacy: 0, visitsSincePrevious: 0, before: [],
    after: [
        { speaker: 'chef', text: '각자의 밤을 보내던 친구들이, 오늘은 같은 불빛 아래 모였어요.' },
        { speaker: 'guest', text: '나비: 기다리는 자리가 이렇게 따뜻할 수도 있네요.', emotion: 'smile' },
        { speaker: 'guest', text: '두부: 보물보다 좋은 걸 찾았어요! 같이 먹는 저녁이요!', emotion: 'smile' },
        { speaker: 'guest', text: '동구: 누나 보고 싶다… 이 불빛도, 친구들도 꼭 보여 주고 싶어요.', emotion: 'quiet', pause: 350 },
        { speaker: 'chef', text: '함께 준비하고 나눈 한 끼. 골목의 첫 축제는 작은 식당에서 시작됐어요.' }
    ], summary: '음식을 준비하고 친구들을 초대해, 골목의 첫 축제를 열었어요. 각자의 기다림이 같은 불빛 아래 모인 밤이었어요.'
};

const friendLines: Record<string,string> = {
    nabi: '나비: 기다리는 자리가 이렇게 따뜻할 수도 있네요.',
    dubu: '두부: 보물보다 좋은 걸 찾았어요! 같이 먹는 저녁이요!',
    kkamang: '까망: …다 같이 있으니, 골목이 덜 조용하네. 이런 밤도 괜찮아.',
    mongsil: '몽실: 오늘 이야기는 오래오래 자랑할 거예요! 우리 골목의 첫 축제니까요!',
    kong: '콩이: 오늘은 식당 불빛도 별처럼 보여요! 친구들이랑 같이 세어 볼래요!',
    donggu: '동구: 누나 보고 싶다… 이 불빛도, 친구들도 꼭 보여 주고 싶어요.',
    bori: '보리: 오늘은 편지 대신 따뜻한 초대장을 받은 기분이에요.',
    dal: '달이: 함께한 불빛을 오늘의 마지막 시로 적어 둘게요.',
    hodu: '호두: 제 빵집이 생겨도 오늘처럼 친구들을 초대하고 싶어요.'
};
export function festivalEvent(invited: string[]): CharacterStoryEvent {
    return {...festivalFinale,after:[festivalFinale.after[0],...invited.map(id=>({speaker:'guest' as const,text:friendLines[id],emotion:id==='donggu'?'quiet' as const:'smile' as const,pause:id==='donggu'?350:0})),festivalFinale.after.at(-1)!]};
}
