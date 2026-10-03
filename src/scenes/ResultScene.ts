import { KitchenNotes } from '../ui/KitchenNotes';
import { $ } from '../ui/UI';
import { weatherDefinitions } from '../data/weather';
import type { SaveData } from '../types/SaveData';
import { customerById } from '../data/customers';
import { panel, on, icon } from '../ui/UI';
export class ResultScene {
    static show(s: SaveData, next: () => void) { const r = s.activeNight!.report; panel(`<div class="eyebrow">NIGHT ${s.night} · ${weatherDefinitions[s.weather].name} · 오늘의 작은 기록</div><h2>따뜻한 밤이었어요</h2><div class="result-stats"><span>손님 <b>${r.served}<small>명</small></b></span><span>오늘 매출 <b>${r.gold}<small>G</small></b></span><span>완벽한 한 끼 <b>${r.perfect}<small>회</small></b></span></div><p class="result-friends">${Object.entries(r.intimacy).map(([id, v]) => `${customerById(id).name} <b>+${v}</b>`).join(' · ')}</p>${KitchenNotes.summary(s)}${s.festival ? '<p class="festival-result-note">골목 축제 준비 상황은 위쪽 축제 버튼에서 확인할 수 있어요.</p>' : ''}${r.discoveries.length ? `<div class="discovery">${icon('book')} ${r.discoveries.join(' / ')}</div>` : '<p class="muted">한 끼씩, 친구들과 조금 더 가까워졌어요.</p>'}<button id="next-night" class="primary">다음 밤 준비하기 →</button>`); $('panel').classList.add('night-summary-panel'); on('next-night', next); }
}
