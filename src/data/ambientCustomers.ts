import type { Customer } from '../types/Customer';
export interface AmbientCustomer extends Customer {
    role: 'ambient';
    spawnWeight: number;
    dialogues: string[];
    thanks: string[];
    look: 'corgi' | 'white' | 'kitten' | 'beagle' | 'elder' | 'grey' | 'round';
}
const definitions = [
    ['bamtol','밤톨','웰시코기','퇴근길의 느긋한 손님',true,0xb98655,0xf3dfb7,'corgi',['oden','rice'],['오늘도 하루가 길었네요…','따뜻한 한 그릇이면 충분해요.','여기 불빛을 보면 안심돼요.']],
    ['seol','설이','흰 고양이','깔끔한 것을 좋아해요',false,0xf1eadb,0xd6cdbc,'white',['rice','milk'],['뜨거운 건 조금 식혀주세요.','오늘은 조용한 자리가 좋겠어요.','앞발은 깨끗이 씻고 왔어요.']],
    ['kkomi','꼬미','아기고양이','조심스러운 작은 손님',false,0xd8b08f,0xf1d9ba,'kitten',['milk','rice'],['…여기 앉아도 돼요?','저도 한 그릇 먹을 수 있어요?','냄새가 좋아서 따라왔어요.']],
    ['mungchi','뭉치','비글','코를 따라 골목을 다녀요',true,0xbf8c5d,0xf1dfc6,'beagle',['oden','ramen'],['저쪽에서부터 냄새 맡고 왔어요!','코가 먼저 여기로 왔네요!','오늘도 좋은 냄새예요.']],
    ['haru','하루','노견','서두르지 않는 산책가',true,0x9d9286,0xe5d9c3,'elder',['oden','milk'],['따뜻한 국물 하나 있나요?','천천히 먹고 가도 되지요?','오늘 산책은 여기까지 할까요.']],
    ['yeon','연이','회색 길고양이','골목 바람을 좋아해요',false,0x87939e,0xc6d1ce,'grey',['rice','ramen'],['바람을 따라 한 바퀴 돌았어요.','오늘 골목은 조금 조용하네요.','잠깐 쉬었다 갈게요.']],
    ['boksil','복실','통통한 갈색 고양이','밥때를 잘 기억해요',false,0xb79779,0xe7d8b8,'round',['rice','oden'],['한 입 먹으면 힘이 날 것 같아요.','밥 냄새는 놓칠 수 없죠.','오늘도 배가 먼저 찾아왔어요.']],
] as const;
export const ambientCustomers: AmbientCustomer[] = definitions.map(([key,name,species,personality,dog,color,accent,look,foods,lines]) => ({
    id: 'ambient_' + key, role: 'ambient', name, species, personality, dog, color, accent, look,
    favoriteFoodIds: [...foods], favoriteIngredients: [], unlockNight: 1, spawnWeight: 1,
    dialogues: [...lines], thanks: ['잘 먹었어요. 골목에서 또 만나요.','한 끼 먹고 나니 따뜻해졌어요.','잠깐 쉬어 갈 수 있어서 좋았어요.'],
}));
export const ambientById = (id: string) => ambientCustomers.find(c => c.id === id);
