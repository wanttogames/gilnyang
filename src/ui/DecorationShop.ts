import { decorations, decorSlots, decorById, cssColor, type DecorSlot } from '../data/decorations';
import { DecorationManager as M } from '../systems/DecorationManager';
import type { SaveData } from '../types/SaveData';
import { modal, on, closeModal } from './UI';
export class DecorationShop {
    private slot: DecorSlot = 'lamp';
    private previewId?: string;
    constructor(private save: SaveData, private changed: () => void, private upgradeHTML: () => string, private bindUpgrades: () => void) { this.render(); }
    private preview() {
        const style = (slot: DecorSlot) => { const d=this.previewId ? decorById(this.previewId) : undefined; return d?.slot===slot ? d : M.style(this.save,slot); };
        const a=style('awning'), l=style('lamp'), c=style('seat'), s=style('sign');
        return `<div class="decor-preview" aria-label="선택한 장식의 색상 미리보기" style="--awning-a:${cssColor(a.colors[0])};--awning-b:${cssColor(a.colors[1])};--lamp:${cssColor(l.id==='lamp-basic' && this.save.upgrades.lamp ? 0xffd69a : l.colors[0])};--seat:${cssColor(c.id==='seat-basic' && this.save.upgrades.chair ? 0xb16f66 : c.colors[0])};--sign:${cssColor(s.colors[0])};--ink:${cssColor(s.colors[1])}"><div class="decor-mini-sign">${s.id==='sign-basic' && this.save.upgrades.sign ? '길냥이 식당 · 夜' : '길냥이 식당'}</div><div class="decor-mini-awning"></div><i class="decor-mini-lamp left"></i><i class="decor-mini-lamp right"></i><div class="decor-mini-counter">따뜻한 한 끼, 쉬어 가는 밤</div><i class="decor-mini-seat left"></i><i class="decor-mini-seat right"></i></div>`;
    }
    private render() {
        const s=this.save;
        modal(`<div class="sheet-head"><div><span class="eyebrow">MY LITTLE DINER · ${M.count(s)}/8</span><h2>나만의 식당 꾸미기</h2></div><button id="decor-close" class="close" aria-label="닫기">×</button></div><p class="muted">보유 골드 <b>${s.gold} G</b> · 외형은 자유롭게 바꿀 수 있어요.</p>${this.preview()}<p class="decor-preview-label">${this.previewId ? decorById(this.previewId)!.name + ' · 미리보기' : '지금의 식당'} · 색상과 조합 미리보기</p><div class="decor-tabs">${decorSlots.map(slot=>`<button id="decor-tab-${slot.id}" class="secondary ${slot.id===this.slot?'active':''}" aria-pressed="${slot.id===this.slot}">${slot.name}</button>`).join('')}</div>${decorations.filter(d=>d.slot===this.slot).map(d=>{const owned=M.owns(s,d.id),equipped=M.state(s).equipped[d.slot]===d.id;return `<div class="decor-option"><div><h3>${d.name}${equipped?' · 사용 중':''}</h3><p>${d.description}</p><span class="decor-swatches">${d.colors.map(c=>`<i style="background:${cssColor(c)}"></i>`).join('')}</span></div><div class="decor-actions"><button id="decor-preview-${d.id}" class="secondary">미리보기</button><button id="decor-select-${d.id}" class="secondary" ${equipped || (!owned && s.gold<d.cost) ? 'disabled':''}>${equipped?'사용 중':owned?'적용하기':d.cost+' G · 구매'}</button></div></div>`}).join('')}<p class="hint">구매하면 바로 적용돼요. 해금한 외형은 다시 골드를 쓰지 않고 바꿀 수 있어요.<br>외형 선택과 아래 시설의 효과는 각각 유지돼요.</p><h2 class="decor-upgrade-title">식당 시설 업그레이드</h2>${this.upgradeHTML()}`);
        on('decor-close',closeModal);
        for(const slot of decorSlots)on('decor-tab-'+slot.id,()=>{this.slot=slot.id;this.previewId=undefined;this.render();});
        for(const d of decorations.filter(d=>d.slot===this.slot)) {
            on('decor-preview-'+d.id,()=>{this.previewId=d.id;this.render();});
            on('decor-select-'+d.id,()=>{const ok=M.owns(s,d.id)?M.equip(s,d.id):M.buy(s,d.id);if(!ok)return;this.previewId=undefined;this.changed();this.render();});
        }
        this.bindUpgrades();
    }
}
