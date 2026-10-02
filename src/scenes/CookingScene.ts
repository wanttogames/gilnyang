import { OdenCooking } from './OdenCooking';
import type { CookingResult } from '../types/Cooking';
import type { RamenCustomer } from '../systems/RamenManager';
import { RiceballCooking } from './RiceballCooking';
import { RamenCooking } from './RamenCooking';
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
    private round = 0;
    private firstQuality: Quality = '보통';
    private transitioning = false;
    private pressProgress?: number;
    constructor(private recipe: Recipe, private pot: boolean, private finish: (quality: Quality, extra: string, result?: CookingResult) => void, private customer?: RamenCustomer) {
        $('nav').classList.add('locked');
        if (recipe.id === 'oden' || recipe.id === 'ramen') this.extras();
        else this.renderIngredients();
    }
    private get timed() { return this.recipe.action === 'timing' || this.recipe.action === 'flip'; }
    private renderIngredients() {
        const r = this.recipe;
        panel(`<div class="eyebrow">작은 주방 · ${this.step + 1} / ${r.ingredients.length + 1}</div><h2>${r.name} 만들기</h2><p class="muted">${ingredients[r.ingredients[this.step]].name}을 선택해 주세요.</p><div class="ingredient-list">${r.ingredients.map((id, i) => `<button id="ingredient-${id}" class="ingredient ${i < this.step ? 'selected' : ''}" ${i !== this.step ? 'disabled' : ''}><span class="ingredient-art art-${ingredients[id].symbol}"></span><span>${ingredients[id].name}</span>${i < this.step ? '<small>담았어요</small>' : ''}</button>`).join('')}</div><div class="hint">순서대로 재료를 담으면 돼요. 서두르지 마세요.</div>`);
        on('ingredient-' + r.ingredients[this.step], () => {
            audio.note(392 + this.step * 65, .1);
            if (++this.step < r.ingredients.length)
                this.renderIngredients();
            else
                this.extras();
        });
    }
    private extras() {
        panel(`<div class="eyebrow">한 숟갈의 다정함</div><h2>조금 더 챙겨 줄까요?</h2><p class="muted">친구의 취향을 알고 있다면 기억해 주세요.</p><div class="extra-list">${this.recipe.extraIngredientIds.map(id => `<button id="extra-${id}" class="secondary">${ingredients[id].name}${id === 'warm' ? '' : ' 넉넉하게'}</button>`).join('')}</div><button id="no-extra" class="plain">기본으로 만들기 →</button>`);
        for (const id of this.recipe.extraIngredientIds)
            on('extra-' + id, () => { this.extra = id; this.action(); });
        on('no-extra', () => this.action());
    }
    private action() {
        if (this.recipe.id === 'rice') {
            new RiceballCooking(this.recipe, this.pot, this.extra, this.finish);
            return;
        }
        if (this.recipe.id === 'oden') {
            new OdenCooking(this.recipe, this.pot, this.extra, this.finish, this.customer);
            return;
        }
        if (this.recipe.id === 'ramen') {
            new RamenCooking(this.recipe, this.pot, this.extra, this.finish, this.customer);
            return;
        }
        const r = this.recipe, hold = r.action === 'hold';
        const instruction = hold ? '2초 동안 꾹 누른 뒤 손을 놓아 주세요.' : this.timed ? (r.action === 'flip' ? '초록 구간에서 뒤집고, 다시 초록 구간에서 꺼내요.' : '초록 구간에서 버튼을 눌러 주세요.') : '꾹 눌렀다가 초록 구간에서 놓아 주세요.';
        panel(`<div class="eyebrow">마지막 손길${r.action === 'flip' ? ' · 1/2' : ''}</div><div class="cook-title">${food(r.id)}<div><h2 id="action-title">${r.actionTitle}</h2><p class="muted">${instruction}</p></div></div><div class="meter ${hold ? 'hold-meter' : ''}"><div class="target" style="left:${hold ? '82' : this.pot ? '62' : '63'}%;width:${hold ? '18' : this.pot ? '20' : '18'}%"></div><div id="fill"></div><div id="needle"></div></div><button id="action" class="primary cook-action">${r.actionButton}</button><div class="hint" id="cook-hint">놓쳐도 괜찮아요. 모든 음식은 따뜻한 한 끼가 돼요.</div>`);
        const button = document.getElementById('action') as HTMLButtonElement;
        const end = (event?: Event) => {
            event?.preventDefault();
            if (this.done || !this.held || this.transitioning)
                return;
            this.held = false;
            this.complete(CookingManager.quality(this.pressProgress ?? this.progress, r.action, this.pot));
        };
        button.addEventListener('pointerdown', event => {
            event.preventDefault();
            if (this.done || this.transitioning)
                return;
            button.setPointerCapture(event.pointerId);
            audio.note(220, .15);
            this.held = true;
            if (this.timed) {
                this.pressProgress = this.progress;
                return;
            }
            this.started = performance.now();
            this.tick();
        });
        button.addEventListener('pointerup', end);
        button.addEventListener('pointercancel', end);
        button.addEventListener('lostpointercapture', end);
        button.addEventListener('keydown', event => {
            if (!['Space', 'Enter'].includes(event.code) || event.repeat || this.done || this.transitioning)
                return;
            event.preventDefault();
            this.held = true;
            if (this.timed)
                this.pressProgress = this.progress;
            else {
                this.started = performance.now();
                this.tick();
            }
        });
        button.addEventListener('keyup', event => { if (['Space', 'Enter'].includes(event.code))
            end(event); });
        if (this.timed) {
            this.started = performance.now();
            this.tick();
        }
    }
    private tick = () => {
        if (this.done || this.transitioning)
            return;
        const elapsed = performance.now() - this.started;
        this.progress = this.timed ? (elapsed % this.recipe.duration) / this.recipe.duration : Math.min(1, elapsed / this.recipe.duration);
        $('fill').style.width = `${this.progress * 100}%`;
        $('needle').style.left = `${this.progress * 100}%`;
        if (!this.timed && this.progress >= 1) {
            $('cook-hint').textContent = this.recipe.action === 'hold' ? '다 만들었어요! 손을 놓아 주세요.' : '컵이 가득 찼어요. 손을 놓아 주세요.';
            return;
        }
        if (!this.timed && !this.held)
            return;
        this.frame = requestAnimationFrame(this.tick);
    };
    private complete(quality: Quality) {
        if (this.done || this.transitioning)
            return;
        cancelAnimationFrame(this.frame);
        if (this.recipe.action === 'flip' && this.round === 0) {
            this.firstQuality = quality;
            this.round = 1;
            this.transitioning = true;
            audio.note(523, .1);
            $('action-title').textContent = '뒤집었어요! 반대쪽도 구워 꺼내요';
            $('action').textContent = '지금 꺼내기';
            $('cook-hint').textContent = '한 번 더 초록 구간을 기다려 주세요. · 2/2';
            document.querySelector('#panel .food')?.classList.add('flipping');
            window.setTimeout(() => { this.transitioning = false; this.pressProgress = undefined; this.started = performance.now(); this.tick(); }, 180);
            return;
        }
        this.done = true;
        if (this.recipe.action === 'flip') {
            const value = (['보통', '맛있음', '완벽'].indexOf(this.firstQuality) + ['보통', '맛있음', '완벽'].indexOf(quality)) / 2;
            quality = value >= 1.5 ? '완벽' : value >= .5 ? '맛있음' : '보통';
        }
        $('nav').classList.remove('locked');
        window.setTimeout(() => this.finish(quality, this.extra), 0);
    }
}
