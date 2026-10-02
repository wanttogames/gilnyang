import type { AlleyEvent } from '../types/AlleyEvent';
export const alleyEvents: AlleyEvent[] = [
    { id:'fallen_tin', type:'DISCOVERY', title:'쿵, 데굴데굴', description:'식당 밖에서 무언가 떨어지는 소리가 났다.', visual:'tin', weight:1.1,
      choices:[{id:'look',label:'나가본다',resultText:'낡은 양철통이 굴러다닌다.\n옆에는 작은 병뚜껑 하나.\n별건 아니었나 보다.'},{id:'stay',label:'영업을 계속한다',resultText:'데굴데굴 소리가 멀어진다.\n잠시 뒤 골목은 다시 조용해졌다.'}] },
    { id:'rain_kitten', type:'AMBIENT', title:'처마 밖의 작은 울음', description:'골목 구석에서 작은 울음소리가 들린다.', visual:'kitten', preferredWeather:'rain', weight:1.5,
      choices:[{id:'towel',label:'수건을 가져다준다',resultText:'아기고양이가 수건 냄새를 맡는다.\n조심스럽게 몸을 닦더니 작게 하품한다.'},{id:'shelter',label:'처마 아래로 부른다',resultText:'아기고양이가 멀찍이 앉아 쉰다.\n작은 지붕 아래 바람이 한결 잦아들었다.'}] },
    { id:'dubu_dig', type:'CHARACTER', title:'사각사각, 두부', description:'골목 구석에서 두부가 열심히 땅을 긁고 있다.', visual:'dig', characterId:'dubu', requiredCustomers:['dubu'], weight:.45,
      choices:[{id:'help',label:'같이 확인한다',resultText:'“뭐 해?”\n“뭔가 냄새나요!”\n낡은 병뚜껑을 보자 두부가 웃는다.\n“보물이에요!”'},{id:'call',label:'식당 쪽으로 부른다',resultText:'“조금만 더…”\n두부는 흙 묻은 코를 턴다.\n좋은 냄새 쪽으로 천천히 따라온다.'}] },
    { id:'kkamang_alley_watch', type:'CHARACTER', title:'골목 끝의 까망', description:'검은 그림자가 건너편 건물 앞에 멈춰 섰다.', visual:'watch', characterId:'kkamang', requiredCustomers:['kkamang'], preferredWeather:'rain', once:true, weight:.35,
      choices:[{id:'look',label:'밖을 본다',resultText:'까망은 오래된 건물을 바라본다.\n“까망?”\n“…들어가.”\n그리고 골목 뒤로 천천히 사라진다.'},{id:'stay',label:'조용히 기다린다',resultText:'불빛 아래를 지나던 그림자가 멈춘다.\n잠깐 식당을 보더니 골목 뒤로 사라진다.'}] },
    { id:'nabi_alley_wait', type:'CHARACTER', title:'나비의 잠깐', description:'골목 입구에 앉은 나비가 길 건너편을 보고 있다.', visual:'wait', characterId:'nabi', requiredCustomers:['nabi'], storyRange:{customerId:'nabi',min:3,max:5}, once:true, weight:.35,
      choices:[{id:'ask',label:'곁에 잠깐 선다',resultText:'“안 들어와?”\n“…조금 있다가요.”\n나비는 길을 한 번 더 바라본다.\n서두르지 않기로 했다.'},{id:'leave',label:'식당 불을 밝혀 둔다',resultText:'나비가 작은 불빛을 돌아본다.\n꼬리 끝이 천천히 움직인다.\n조금 뒤, 골목 쪽으로 걸어간다.'}] },
    { id:'swaying_sign', type:'TROUBLE', title:'끼익, 작은 간판', description:'바람에 간판이 평소보다 크게 흔들린다.', visual:'sign', preferredWeather:'rain', weight:1,
      choices:[{id:'fix',label:'지금 고친다',resultText:'매듭을 다시 묶자 간판이 잦아든다.\n이제 괜찮아 보인다.'},{id:'later',label:'영업 끝나고 고친다',resultText:'간판이 한 번 더 삐걱거린다.\n그래도 단단히 버틴다.\n문 닫기 전에 살펴보기로 했다.'}] },
    { id:'flying_menu', type:'TROUBLE', title:'날아간 메뉴판', description:'종이 메뉴판이 바람을 따라 골목 쪽으로 날아갔다.', visual:'menu', weight:1,
      choices:[{id:'catch',label:'잡으러 간다',resultText:'메뉴판은 담벼락 아래에 걸려 있었다.\n“오늘의 메뉴”는 그대로다.'},{id:'stay',label:'돌아오길 기다린다',resultText:'잠시 뒤 뭉치가 메뉴판을 물고 온다.\n“이 종이도 좋은 냄새 나요!”\n메뉴판을 다시 세워 둔다.'}] },
    { id:'brief_blackout', type:'TROUBLE', title:'탁, 불빛이 쉬는 밤', description:'갑자기 골목의 불이 꺼졌다. 작은 등불 하나만 남았다.', visual:'blackout', weight:.25,
      resultText:'멀리서 불이 하나씩 다시 켜진다.\n냄비는 여전히 따뜻하다.\n골목이 다시 제 모습을 찾았다.' },
    { id:'cats_standoff', type:'AMBIENT', title:'누가 먼저 움직일까', description:'지붕 위 고양이 두 마리가 서로 노려보고 있다.', visual:'cats', weight:1.8,
      resultText:'한참 가만히 있던 고양이가 하품한다.\n다른 고양이도 등을 돌린다.\n아무 일도 없었다는 듯 밤은 이어진다.' },
    { id:'lost_parcel', type:'DISCOVERY', title:'작은 포장 꾸러미', description:'골목 한쪽에 깨끗하게 포장된 재료가 놓여 있다.', visual:'parcel', once:true, weight:.8,
      choices:[{id:'wait',label:'주인을 기다려본다',resultText:'서둘러 돌아온 이웃이 꾸러미를 챙긴다.\n고맙다며 작은 동전 몇 개를 놓고 간다.',gold:3},{id:'keep',label:'안쪽에 잠시 보관한다',resultText:'꾸러미는 열지 않고 잘 보이는 곳에 둔다.\n찾으러 온 이웃이 고맙다며 동전을 놓고 간다.',gold:3}] },
];
export const alleyEventById = (id: string) => alleyEvents.find(e => e.id === id);
