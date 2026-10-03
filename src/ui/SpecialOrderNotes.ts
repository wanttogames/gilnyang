import { SpecialOrderManager as M } from '../systems/SpecialOrderManager';
import { ingredients } from '../data/ingredients';
import type { SaveData } from '../types/SaveData';
export class SpecialOrderNotes {
    static card(s: SaveData, id: string) {
        const o = M.current(s, id); if (!o) return '';
        return `<div class="special-order-note"><strong>단골의 특별 주문</strong><p>${ingredients[o.extra].name}${o.extra === 'warm' ? ' 추가' : ' 넉넉하게'} · 요리 점수 ${M.minScore}점 이상</p><small>성공 보너스 +${M.bonusGold} G · 친밀도 +${M.bonusIntimacy}</small></div>`;
    }
}
