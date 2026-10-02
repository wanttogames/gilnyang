import { KitchenManager, kitchenDecorations } from '../systems/KitchenManager';
import { recipeById } from '../data/recipes';
import type { SaveData } from '../types/SaveData';
import { food } from './UI';

export class KitchenNotes {
    static food(s: SaveData, id: string) { return `<span class="${KitchenManager.style(s, id).dish ? 'kitchen-dish' : ''}">${food(id)}</span>`; }
    static summary(s: SaveData) {
        const k = s.activeNight?.kitchen;
        return k ? `<div class="kitchen-summary"><strong>오늘의 특별 메뉴 · ${recipeById(k.specialRecipeId).name} <small>한 끼마다 +5 G</small></strong><span>${KitchenManager.goalText(k)} · ${Math.min(KitchenManager.goalProgress(k), k.goalTarget)} / ${k.goalTarget} ${k.claimed ? '✓ 완료' : '· 달성 +20 G'}</span></div>` : '<p class="hint">영업을 시작하면 오늘의 특별 메뉴와 작은 목표가 정해져요.</p>';
    }
    static mastery(s: SaveData, id: string) {
        const m = KitchenManager.mastery(s, id), rank = KitchenManager.rank(m.xp);
        const floor = [0, 30, 90, 180][rank.level];
        const fill = rank.next ? (m.xp - floor) / (rank.next - floor) * 100 : 100;
        return `<div class="mastery-note"><strong>${rank.name}</strong><span>${m.cooked}번 요리 · 최고 ${m.bestScore === null ? '기록 없음' : m.bestScore + '점'}</span><div class="mastery-meter" role="progressbar" aria-label="요리 숙련도" aria-valuemin="0" aria-valuemax="${rank.next ?? 180}" aria-valuenow="${Math.min(m.xp, rank.next ?? 180)}"><i style="width:${fill}%"></i></div><small>${m.xp} XP${rank.next ? ` · 다음 등급까지 ${rank.next - m.xp} XP` : ' · 장인 등급 달성'}</small><p>${m.xp < 30 ? `30 XP · ${kitchenDecorations[id]} 해금` : `${kitchenDecorations[id]} 해금 ✓`}${m.xp < 90 ? ' / 90 XP · 장인 조리도구' : ' / 장인 조리도구 해금 ✓'}</p>${m.xp >= 30 ? `<button id="kitchen-style-${id}" class="secondary kitchen-style">${m.decorated ? '기본 외형으로 바꾸기' : '해금 외형 사용하기'}</button>` : ''}</div>`;
    }
}
