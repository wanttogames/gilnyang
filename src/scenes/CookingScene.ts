import type { Recipe, Quality } from '../types/Recipe';
import { ingredients } from '../data/ingredients';
import { CookingManager } from '../systems/CookingManager';
import { audio } from '../systems/AudioManager';
import { panel, on, food, $ } from '../ui/UI';
export class CookingScene {
    private step = 0;
    private extra = '';
    private done = false;
    private started = 0;
    private frame = 0;
    private held = false;
    private progress = 0;
    constructor(private recipe: Recipe, private pot: boolean, private finish: (quality: Quality, extra: string) => void) { $('nav').classList.add('locked'); this.renderIngredients(); }
    private renderIngredients() { const r = this.recipe; panel(`<div class="eyebrow">작은 주방 · ${this.step + 1} / ${r.ingredients.length + 1}</div><h2>${r.name} 만들기</h2><p class="muted">${ingredients[r.ingredients[this.step]].name}을 선택해 주세요.</p><div class="ingredient-list">${r.ingredients.map((id, i) => `<button id="ingredient-${id}" class="ingredient ${i < this.step ? 'selected' : ''}" ${i !== this.step ? 'disabled' : ''}><span class="ingredient-art art-${ingredients[id].symbol}"></span><span>${ingredients[id].name}</span>${i < this.step ? '<small>담았어요</small>' : ''}</button>`).join('')}</div><div class="hint">순서대로 재료를 담으면 돼요. 서두르지 마세요.</div>`); on('ingredient-' + r.ingredients[this.step], () => { audio.note(392 + this.step * 65, .1); this.step++; if (this.step < r.ingredients.length)
        this.renderIngredients();
    else
        this.extras(); }); }
    private extras() { const r = this.recipe; const options = r.id === 'rice' ? ['seaweed', 'tuna'] : r.id === 'oden' ? ['broth'] : ['warm']; panel(`<div class="eyebrow">한 숟갈의 다정함</div><h2>조금 더 챙겨 줄까요?</h2><p class="muted">친구의 취향을 알고 있다면 기억해 주세요.</p><div class="extra-list">${options.map(id => `<button id="extra-${id}" class="secondary">${ingredients[id].name}${id === 'warm' ? '' : ' 넉넉하게'}</button>`).join('')}</div><button id="no-extra" class="plain">기본으로 만들기 →</button>`); for (const id of options)
        on('extra-' + id, () => { this.extra = id; this.action(); }); on('no-extra', () => this.action()); }
    private action() {
        const r = this.recipe, hold = r.action === 'hold';
        panel(`<div class="eyebrow">마지막 손길</div><div class="cook-title">${food(r.id)}<div><h2>${hold ? '꼭꼭, 주먹밥을 쥐어요' : r.action === 'timing' ? '알맞게 익으면 건져요' : '컵에 우유를 따라요'}</h2><p class="muted">${hold ? '2초 동안 꾹 누른 뒤 손을 놓아 주세요.' : r.action === 'timing' ? '초록 구간에서 버튼을 눌러 주세요.' : '꾹 눌렀다가 초록 구간에서 놓아 주세요.'}</p></div></div><div class="meter ${hold ? 'hold-meter' : ''}"><div class="target" style="left:${hold ? '82' : this.pot ? '62' : '63'}%;width:${hold ? '18' : this.pot ? '20' : '18'}%"></div><div id="fill"></div><div id="needle"></div></div><button id="action" class="primary cook-action">${hold ? '꾹 눌러 만들기' : r.action === 'timing' ? '지금 건져내기' : '꾹 눌러 따르기'}</button><div class="hint" id="cook-hint">놓쳐도 괜찮아요. 모든 음식은 따뜻한 한 끼가 돼요.</div>`);
        const b = document.getElementById('action') as HTMLButtonElement;
        const end = (e?: Event) => { e?.preventDefault(); if (this.done || !this.held)
            return; this.held = false; this.complete(CookingManager.quality(this.progress, r.action, this.pot)); };
        b.addEventListener('pointerdown', e => { e.preventDefault(); if (this.done)
            return; b.setPointerCapture(e.pointerId); audio.note(220, .15); if (r.action === 'timing') {
            this.held = true;
            return;
        } this.held = true; this.started = performance.now(); this.tick(); });
        b.addEventListener('pointerup', end);
        b.addEventListener('pointercancel', end);
        b.addEventListener('lostpointercapture', end);
        b.addEventListener('keydown', e => { if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
            e.preventDefault();
            if (r.action === 'timing')
                this.complete(CookingManager.quality(this.progress, r.action, this.pot));
            else {
                this.held = true;
                this.started = performance.now();
                this.tick();
            }
        } });
        b.addEventListener('keyup', e => { if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            end();
        } });
        if (r.action === 'timing') {
            this.started = performance.now();
            this.tick();
        }
    }
    private tick = () => { if (this.done)
        return; const elapsed = performance.now() - this.started; this.progress = this.recipe.action === 'timing' ? (elapsed % this.recipe.duration) / this.recipe.duration : Math.min(1, elapsed / this.recipe.duration); $('fill').style.width = `${this.progress * 100}%`; $('needle').style.left = `${this.progress * 100}%`; if (this.recipe.action === 'hold' && this.progress >= 1) {
        $('cook-hint').textContent = '다 만들었어요! 손을 놓아 주세요.';
        return;
    } if (this.recipe.action === 'pour' && this.progress >= 1) {
        $('cook-hint').textContent = '컵이 가득 찼어요. 손을 놓아 주세요.';
        return;
    } if (this.recipe.action !== 'timing' && !this.held)
        return; this.frame = requestAnimationFrame(this.tick); };
    private complete(q: Quality) { if (this.done)
        return; this.done = true; cancelAnimationFrame(this.frame); $('nav').classList.remove('locked'); window.setTimeout(() => this.finish(q, this.extra), 0); }
}
