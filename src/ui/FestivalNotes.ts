import { FestivalManager as M } from '../systems/FestivalManager';
import { festivalStages } from '../data/festival';
import { customers } from '../data/customers';
import type { SaveData } from '../types/SaveData';
import { modal,on,closeModal } from './UI';
export class FestivalNotes {
    static summary(s: SaveData) {
        const f=M.ensure(s);if(!f)return '';
        const progress=f.stage==='food' ? `${f.foodMeals}/4접시 · ${Math.min(2,f.recipes.length)}/2종` : f.stage==='invite' ? `${f.invited.length}/3명` : f.stage==='decorate' ? f.decorated?'장식 완성':'축제등 만들기 40 G' : f.stage==='ready' ? `${f.celebrationNight}번째 밤 개최` : f.stage==='complete' ? '기념 깃발과 추억을 남겼어요' : '친구들과 한 끼를 나눠요';
        return `<button id="festival-open" class="festival-status"><span>골목 축제 · ${festivalStages[f.stage]}</span><b>${progress} →</b></button>`;
    }
    static open(s: SaveData,changed:()=>void) {
        const f=M.ensure(s);if(!f)return;
        modal(`<div class="sheet-head"><div><div class="eyebrow">OUR FIRST ALLEY FESTIVAL</div><h2>골목 축제 준비</h2></div><button id="festival-close" class="close" aria-label="닫기">×</button></div><p class="muted">작은 식당에서 함께 준비하는 축제예요. 준비를 마친 단계는 그날 영업을 끝내면 다음 단계로 이어져요.</p><div class="festival-steps">${['food','invite','decorate','celebrating'].map((key,i)=>`<span class="${f.stage===key?'active':''}">${i+1}. ${festivalStages[key as keyof typeof festivalStages]}</span>`).join('')}</div><div class="festival-task"><h3>${festivalStages[f.stage]}</h3>${f.stage==='food' ? `<p>75점 이상 음식 4접시를 준비해요.<br>서로 다른 메뉴 2종 이상을 만들어 주세요.</p><p>준비 ${f.foodMeals}/4접시 · 메뉴 ${Math.min(2,f.recipes.length)}/2종</p>` : f.stage==='invite' ? `<p>만나 본 친구 중 친밀도 4 이상인 3명을 초대해요.</p>${customers.map(c=>{const p=s.customers[c.id],invited=f.invited.includes(c.id);return `<button id="festival-invite-${c.id}" class="secondary" ${invited || !p.unlocked || p.intimacy<4 || f.invited.length>=3?'disabled':''}>${p.unlocked?c.name:'아직 만나지 못한 친구'} · ${invited?'초대 완료':p.intimacy>=4?'초대하기':'친밀도 4 필요'}</button>`}).join('')}` : f.stage==='decorate' ? `<p>작은 등불과 깃발로 식당을 장식해요.<br>보유 골드 ${s.gold} G</p><button id="festival-craft" class="primary" ${f.decorated || s.gold<40?'disabled':''}>${f.decorated?'축제 장식 완성':'축제등 만들기 · 40 G'}</button>` : f.stage==='ready' ? `<p>${f.celebrationNight}번째 밤, 식당에 축제의 불빛이 켜져요.<br>초대한 세 친구가 꼭 찾아옵니다.</p>` : f.stage==='celebrating' ? '<p>초대한 친구들을 맞이하고 오늘 밤의 한 끼를 끝까지 나눠 주세요.</p>' : `<p>${f.completedNight}번째 밤에 첫 축제를 열었어요.<br>완료 선물 · 100 G, 식당 기념 깃발, 추억 앨범</p>`}</div>`);
        on('festival-close',closeModal);
        for(const c of customers)on('festival-invite-'+c.id,()=>{if(!M.invite(s,c.id))return;changed();this.open(s,changed);});
        on('festival-craft',()=>{if(!M.decorate(s))return;changed();this.open(s,changed);});
    }
}
