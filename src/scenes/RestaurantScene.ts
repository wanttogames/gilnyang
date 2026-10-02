import { customerRender } from '../game/CharacterArt';
import { CustomerVisit } from '../game/CustomerVisit';
import { RestaurantEnvironment } from '../game/RestaurantEnvironment';
import { CustomerMeal } from '../game/CustomerMeal';
import { NabiView } from '../game/NabiView';
import { customerById } from '../data/customers';
import { CharacterStoryManager } from '../systems/CharacterStoryManager';
import { StoryDialogue } from '../ui/StoryDialogue';
import type { StoryPart, StoryLine } from '../types/CharacterStory';
import { WeatherView } from '../game/WeatherView';
import { WeatherManager } from '../systems/WeatherManager';
import { weatherDefinitions } from '../data/weather';
import { DialogueManager } from '../systems/DialogueManager';
import { recipeById } from '../data/recipes';
import type { Recipe } from '../types/Recipe';
import Phaser from 'phaser';
import { SaveManager, emptyReport } from '../systems/SaveManager';
import { CustomerManager } from '../systems/CustomerManager';
import { RecipeManager } from '../systems/RecipeManager';
import { ProgressionManager } from '../systems/ProgressionManager';
import { audio } from '../systems/AudioManager';
import { CookingScene } from './CookingScene';
import { CustomerBookScene } from './CustomerBookScene';
import { ResultScene } from './ResultScene';
import { upgrades } from '../data/upgrades';
import { ingredients } from '../data/ingredients';
import { $, panel, on, toast, icon, modal, closeModal, food } from '../ui/UI';
import type { SaveData } from '../types/SaveData';
import type { Customer } from '../types/Customer';
import type { Quality } from '../types/Recipe';
export class RestaurantScene extends Phaser.Scene {
    save!: SaveData;
    guest?: Phaser.GameObjects.Image | NabiView;
    chef!: Phaser.GameObjects.Image;
    phase: 'closed' | 'arriving' | 'seating' | 'waiting' | 'order' | 'cooking' | 'ready' | 'eating' | 'reaction' | 'transition' | 'character-story' | 'standing' | 'farewell' | 'leaving' | 'gap' | 'result' = 'closed';
    current?: Customer;
    private currentRecipe?: Recipe;
    private environment!: RestaurantEnvironment;
    private customerMeal?: CustomerMeal;
    private guestVisit?: CustomerVisit;
    private guestGap?: Phaser.Time.TimerEvent;
    private quietDeparture = false;
    private saveOnHide = () => SaveManager.save(this.save);
    private weatherView!: WeatherView;
    private lanterns: Phaser.GameObjects.Rectangle[] = [];
    private stallSign!: Phaser.GameObjects.Text;
    constructor() { super('Restaurant'); }
    create() {
        this.lanterns = [];
        this.customerMeal = undefined;
        this.guestVisit = undefined;
        this.guestGap = undefined;
        this.save = SaveManager.load();
        audio.enabled = this.save.settings.sound;
        this.drawStreet();
        this.weatherView = new WeatherView(this);
        this.refreshWeather();
        SaveManager.save(this.save);
        this.hud();
        this.nav();
        this.time.addEvent({ delay: 3500, loop: true, callback: () => {
            const chef = this.chef;
            if (!chef.active) return;
            chef.setTexture('chef-blink');
            this.time.delayedCall(140, () => { if (chef.active) chef.setTexture('chef'); });
        } });
        this.welcome();
        this.showPendingRecipes(() => { if (this.save.activeNight)
            this.resumeNight(); });
        window.addEventListener('pagehide', this.saveOnHide);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.customerMeal?.cleanup();
            this.guestVisit?.cleanup();
            this.guestGap?.remove(false);
            this.environment.cleanup();
            this.guest instanceof NabiView && this.guest.cleanup();
            window.removeEventListener('pagehide', this.saveOnHide);
            this.lockGuestInput(false);
        });
    }
    update(_time: number, delta: number) { this.weatherView?.update(delta); }
    refreshWeather() {
        this.weatherView.set(this.save.weather);
        this.environment.setWeather(this.save.weather);
        audio.setWeather(this.save.weather);
        $('caption').textContent = weatherDefinitions[this.save.weather].caption;
        document.getElementById('weather-badge')?.remove();
        const badge = document.createElement('div');
        badge.id = 'weather-badge';
        badge.className = 'weather-badge';
        badge.innerHTML = `${icon(this.save.weather)}<span>${weatherDefinitions[this.save.weather].name}</span>${this.save.weather === 'rain' ? '<small>까망이 찾아올지도 몰라요</small>' : '<small>오늘 밤의 골목</small>'}`;
        $('interface').appendChild(badge);
    }
    showPendingRecipes(next: () => void) {
        const id = this.save.pendingRecipeUnlocks[0];
        if (!id) {
            next();
            return;
        }
        const r = recipeById(id);
        audio.success();
        modal(`<div class="recipe-discovery"><div class="eyebrow">A GIFT FROM A FRIEND</div><h2>새로운 레시피 발견!</h2>${food(id)}<h1>${r.name}</h1><p class="muted">${r.unlock!.reason}</p><p class="quote">${r.subtitle}</p><div class="recipe-ingredients">${r.ingredients.map(i => ingredients[i].name).join(' + ')}</div><button id="recipe-confirm" class="primary">메뉴판에 담아 두기 →</button></div>`);
        on('recipe-confirm', () => { this.save.pendingRecipeUnlocks.shift(); SaveManager.save(this.save); closeModal(); this.showPendingRecipes(next); });
    }
    drawStreet() {
        const g = this.add.graphics();
        const r = (x: number, y: number, w: number, h: number, c: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
        r(0, 0, 720, 1280, 0x1c253e);
        r(0, 165, 720, 650, 0x252c43);
        r(0, 470, 720, 405, 0x3a394a);
        r(0, 745, 720, 135, 0x48404a);
        // skyline, windows, brick and street depth
        r(0, 105, 142, 410, 0x242d44);
        r(578, 95, 142, 430, 0x222b40);
        r(22, 190, 94, 129, 0x171f34);
        r(610, 200, 70, 160, 0x161f33);
        for (let i = 0; i < 5; i++) {
            r(30 + (i % 2) * 48, 202 + Math.floor(i / 2) * 42, 30, 26, i % 3 === 0 ? 0x987054 : 0x394154);
            r(620, 214 + i * 32, 44, 20, i === 2 ? 0xa9865b : 0x354053);
        }
        r(146, 150, 432, 338, 0x303249);
        r(175, 202, 110, 128, 0x1e273d);
        r(315, 191, 178, 140, 0x232b3f);
        r(183, 209, 42, 106, 0x484c58);
        r(232, 209, 42, 106, 0x605b5c);
        r(326, 202, 77, 116, 0x615957);
        r(411, 202, 69, 116, 0x444958);
        for (let y = 365; y < 700; y += 36) {
            for (let x = (y % 72 === 5 ? 0 : 30); x < 720; x += 94) {
                r(x, y, 80, 2, 0x444252);
                r(x, y, 2, 27, 0x444252);
            }
        }
        r(85, 125, 5, 420, 0x565565);
        r(84, 128, 330, 4, 0x565565);
        r(605, 122, 6, 454, 0x454958);
        // moon / stars
        r(531, 132, 24, 8, 0xead7a3);
        r(523, 140, 32, 24, 0xead7a3);
        r(531, 164, 20, 6, 0xead7a3);
        r(540, 132, 19, 24, 0x1c253e);
        for (const [x, y] of [[175, 132], [465, 112], [565, 200], [304, 142], [638, 154]])
            r(x, y, 3, 3, 0xe1c797);
        // hanging wires and foliage
        g.lineStyle(2, 0x141c2e);
        g.beginPath();
        g.moveTo(0, 338);
        g.lineTo(220, 380);
        g.lineTo(510, 358);
        g.lineTo(720, 325);
        g.strokePath();
        r(35, 657, 56, 73, 0x9d6f59);
        r(29, 654, 68, 12, 0xbd8b68);
        for (const [x, y] of [[46, 598], [25, 625], [65, 616], [78, 590], [46, 639]]) {
            r(x, y, 21, 33, 0x556c58);
            r(x + 5, y - 9, 11, 20, 0x798467);
        }
        // warm pool of light
        this.add.ellipse(365, 736, 598, 244, 0xeaa767, 0.07);
        this.add.ellipse(358, 668, 490, 260, 0xf5bc76, 0.08);
        // cart roof, striped awning
        r(119, 391, 481, 15, 0x492f36);
        r(133, 363, 451, 28, 0x824d46);
        r(150, 348, 417, 15, 0xac6354);
        r(173, 333, 372, 15, 0x824d46);
        const awning = this.add.graphics({ x: 360, y: 406 }).setName('restaurant-awning');
        for (let i = 0; i < 10; i++) {
            awning.fillStyle(i % 2 === 0 ? 0xc78267 : 0xe4b389).fillRect(-235 + i * 47, 0, 47, 44);
            awning.fillStyle(i % 2 === 0 ? 0xae695b : 0xd3a178).fillRect(-235 + i * 47, 44, 47, 10);
        }
        r(137, 460, 13, 237, 0x714e42);
        r(571, 460, 13, 237, 0x714e42);
        r(131, 460, 7, 237, 0xb48764);
        r(565, 460, 6, 237, 0xb48764);
        const sign = this.add.container(362, 402).setName('restaurant-sign');
        const signBoard = this.add.graphics();
        signBoard.fillStyle(0x503b38).fillRect(-92, -28, 184, 59);
        signBoard.fillStyle(0xe7cda5).fillRect(-86, -22, 172, 47);
        this.stallSign = this.add.text(0, 0, '길냥이 식당', { fontFamily: 'Alley Sans, sans-serif', fontSize: '25px', color: '#654439', fontStyle: 'bold' }).setOrigin(0.5);
        sign.add([signBoard, this.stallSign]);
        // rear shelving and ingredients
        r(154, 539, 406, 9, 0x916548);
        r(167, 546, 7, 65, 0x735041);
        r(536, 546, 7, 65, 0x735041);
        for (let i = 0; i < 4; i++) {
            r(170 + i * 32, 507, 22, 29, [0xbba57a, 0xab795f, 0xbca88a, 0x6b7d69][i]);
            r(173 + i * 32, 502, 16, 5, 0xdcc49a);
            r(175 + i * 32, 516, 12, 10, 0xe7cda5);
        }
        r(485, 517, 55, 22, 0xb19f8b);
        r(489, 511, 47, 6, 0xe6d6b3);
        // chef idle
        this.chef = this.add.image(355, 543, 'chef').setScale(2.5);
        this.tweens.add({ targets: this.chef, y: 540, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        // counter and pot foreground
        r(142, 601, 444, 19, 0xd4a373);
        r(145, 620, 439, 92, 0x956747);
        r(152, 626, 422, 8, 0xad7c54);
        r(153, 653, 420, 3, 0x78503f);
        r(153, 686, 420, 3, 0x78503f);
        r(485, 580, 64, 19, 0x596674);
        r(478, 580, 7, 9, 0xc3bbab);
        r(549, 580, 7, 9, 0xc3bbab);
        r(480, 575, 75, 5, 0x969a99);
        r(490, 572, 54, 3, 0xe6c48a);
        r(505, 600, 25, 3, 0xc47750);
        r(179, 587, 52, 10, 0xdfcda8);
        r(186, 580, 38, 7, 0xf2dfb5);
        r(199, 574, 15, 8, 0x56725a);
        r(249, 582, 34, 16, 0xa85e4d);
        r(252, 580, 28, 4, 0xddad83);
        this.add.text(363, 657, '따뜻한 한 끼, 쉬어 가는 밤', { fontFamily: 'Alley Sans, sans-serif', fontSize: '18px', color: '#f4d6a5' }).setOrigin(.5);
        // stool / table
        for (const x of [210, 490]) {
            r(x, 754, 9, 63, 0x6d4b3f);
            r(x + 52, 754, 9, 63, 0x6d4b3f);
            r(x - 6, 745, 73, 13, 0xae7a54);
            r(x, 758, 61, 4, 0x543c37);
        }
        r(342, 791, 13, 69, 0x785141);
        r(379, 791, 13, 69, 0x785141);
        r(308, 778, 117, 14, 0xb9825d);
        r(316, 792, 101, 5, 0x563b37);
        for (let y = 792; y < 901; y += 28)
            for (let x = 0; x < 720; x += 95)
                r(x + (y % 56 === 8 ? 15 : 45), y, 69, 3, 0x59505a);
        // lanterns
        for (const x of [183, 538]) {
            r(x, 452, 3, 24, 0x483335);
            this.add.ellipse(x + 2, 497, 112, 139, 0xfbd395, .055);
            const l = this.add.rectangle(x + 2, 494, 34, 46, 0xeabb7e);
            this.lanterns.push(l);
            r(x - 18, 472, 40, 5, 0x8c5145);
            r(x - 18, 514, 40, 6, 0x8c5145);
            r(x - 1, 478, 4, 30, 0xf7d69a);
        }
        this.environment = new RestaurantEnvironment(this, awning, sign, this.lanterns);
        this.decorations();
    }
    decorations() {
        if (this.save.upgrades.lamp)
            this.lanterns.forEach(l => l.setFillStyle(0xffd69a));
        if (this.save.upgrades.sign)
            this.stallSign.setText('길냥이 식당 · 夜');
        if (this.save.upgrades.chair) {
            this.add.rectangle(240, 742, 58, 8, 0xb16f66);
            this.add.rectangle(520, 742, 58, 8, 0xb16f66);
        }
    }
    hud() { $('hud').innerHTML = `<div class="topline"><span class="mini-brand">골목의 작은 불빛</span><button id="sound" class="sound" aria-label="소리 ${this.save.settings.sound ? '끄기' : '켜기'}">${icon('sound')}<span>${this.save.settings.sound ? 'ON' : 'OFF'}</span></button></div><div class="stats"><div>${icon('moon')}<span><small>오늘의 밤</small><b>${this.save.night}<em>번째 밤</em></b></span></div><div>${icon('coin')}<span><small>보유 골드</small><b>${this.save.gold}<em>G</em></b></span></div><div>${icon('star')}<span><small>식당 레벨</small><b>${this.save.level}<em>LV</em></b></span></div></div>`; on('sound', () => { audio.unlock(); this.save.settings.sound = audio.toggle(); SaveManager.save(this.save); this.hud(); }); }
    nav() { $('nav').innerHTML = `<button id="menu-nav">${icon('menu')}<span>메뉴</span></button><button id="guests-nav">${icon('heart')}<span>손님</span></button><button id="shop-nav">${icon('shop')}<span>가게</span></button><button id="book-nav">${icon('book')}<span>도감</span></button>`; on('menu-nav', () => { if (!this.guestInputLocked) this.menu(); }); on('guests-nav', () => { if (!this.guestInputLocked) CustomerBookScene.open(this.save); }); on('book-nav', () => { if (!this.guestInputLocked) CustomerBookScene.open(this.save); }); on('shop-nav', () => { if (!this.guestInputLocked) this.shop(); }); }
    welcome() { this.phase = 'closed'; $('caption').textContent = weatherDefinitions[this.save.weather].caption; panel(`<div class="eyebrow">A LITTLE RESTAURANT, A WARM NIGHT</div><h1>길냥이 식당</h1><p class="muted">${weatherDefinitions[this.save.weather].greeting}</p><button class="primary" id="start">${this.save.night === 1 ? '첫 밤의 문 열기' : '오늘 밤 영업 시작'} <span>→</span></button><div class="panel-foot">${icon('save')} 자동 저장 · 느긋하게 즐겨도 괜찮아요</div>`); on('start', () => { if (this.phase !== 'closed') return; audio.unlock(); audio.note(392, .25); this.save.activeNight = { queue: CustomerManager.queue(this.save), report: emptyReport() }; SaveManager.save(this.save); this.nextGuest(); }); }
    resumeNight() {
        const night = this.save.activeNight!;
        const previousId = night.queue[night.report.served - 1];
        const previous = previousId ? this.save.customers[previousId] : undefined;
        const pending = previous?.characterStory?.pending;
        if (pending?.part === 'after' && previous && previous.visitCount >= pending.visit) {
            // Serving was already saved. Resume the dialogue without paying again.
            this.current = customerById(previousId);
            this.guest = this.createGuest(previousId, CustomerVisit.seat.x, CustomerVisit.seat.y);
            this.guestVisit = this.createVisit();
            this.guestVisit.restoreSeat();
            this.quietDeparture = CharacterStoryManager.pendingEvent(previousId, previous)?.after.some(line => line.emotion === 'quiet') ?? false;
            if (this.guest instanceof NabiView) this.guest.settle(previous.intimacy, previous.characterStory?.stage ?? 0);
            this.playCharacterStory('after', () => this.depart());
            return;
        }
        if (this.save.activeNight!.report.served >= this.save.activeNight!.queue.length)
            this.result();
        else
            this.nextGuest();
    }
    nextGuest() {
        if (!['closed', 'gap'].includes(this.phase) || this.guest?.active) return;
        if (this.save.activeNight!.report.served >= this.save.activeNight!.queue.length) {
            this.result(); return;
        }
        this.phase = 'arriving';
        this.lockGuestInput(true);
        const c = CustomerManager.current(this.save);
        this.current = c; this.quietDeparture = false;
        this.guestVisit?.cleanup(); this.guest?.destroy();
        panel(`<div class="eyebrow">${this.save.activeNight!.report.served + 1} / 5 · 오늘의 손님</div><h2>작은 발걸음이 들려요</h2><p class="muted">누가 찾아왔을까요?</p><div class="waiting"><i></i><i></i><i></i></div>`);
        $('caption').textContent = this.save.weather === 'rain' ? '젖은 발걸음이 작은 지붕 아래로 들어와요.' : weatherDefinitions[this.save.weather].caption;
        this.guest = this.createGuest(c.id, CustomerVisit.entrance.x, CustomerVisit.entrance.y);
        this.guestVisit = this.createVisit();
        this.guestVisit.enter(() => { this.phase = 'seating'; }, () => {
            this.phase = 'waiting';
            const p = this.save.customers[c.id];
            if (this.guest instanceof NabiView) this.guest.settle(p.intimacy, p.characterStory?.stage ?? 0);
            this.guestVisit!.wait();
            p.unlocked = true; audio.note(330, .2);
            CharacterStoryManager.reserve(c.id, p, this.save.night);
            SaveManager.save(this.save);
        }, () => {
            if (this.phase !== 'waiting' || !this.guest?.active) return;
            this.lockGuestInput(false);
            this.playCharacterStory('before', () => this.order());
        });
    }
    order() { if (!['waiting', 'character-story'].includes(this.phase)) return; this.phase = 'order'; this.guestVisit?.wait(); this.lockGuestInput(false); const c = this.current!, r = this.currentRecipe = RecipeManager.order(c, this.save), p = this.save.customers[c.id]; panel(`<div class="eyebrow">${this.save.activeNight!.report.served + 1} / 5 · 손님이 기다려요</div><div class="order-row"><div><h2>${c.name} <small>${c.species}</small></h2><p class="quote">“${DialogueManager.order(c.id, this.save.weather, r, p)}”</p></div>${food(r.id)}</div><div class="order-bottom"><div><small>오늘의 주문</small><strong>${r.name}</strong></div><button class="primary" id="cook">요리 시작 ${icon('arrow')}</button></div>${p.preferenceFound ? `<p class="preference">기억해 주세요 · ${ingredients[c.favoriteIngredients[0]].name}${c.favoriteIngredients[0] === 'warm' ? '' : ' 넉넉하게'}</p>` : ''}`); on('cook', () => { if (this.phase !== 'order') return; this.phase = 'cooking'; audio.note(440); new CookingScene(r, !!this.save.upgrades.pot, (quality, extra) => this.ready(quality, extra)); }); }
    ready(q: Quality, extra: string) { this.phase = 'ready'; audio.success(); this.tweens.add({ targets: this.chef, angle: 5, duration: 140, yoyo: true, repeat: 3 }); panel(`<div class="eyebrow">정성을 담은 한 접시</div><div class="ready-row">${food(this.currentRecipe!.id)}<div><span class="quality q-${q === '완벽' ? 'perfect' : 'good'}">${q === '완벽' ? 'PERFECT · ' : ''}${q}</span><h2>${this.currentRecipe!.name}</h2><p class="muted">${extra ? ingredients[extra].name + '도 마음을 담아' : '따뜻할 때 전해 주세요.'}</p></div></div><button id="serve" class="primary">${this.current!.name}에게 음식 건네기 →</button>`); on('serve', () => this.serve(q, extra)); }
    private get guestInputLocked() { return ['arriving', 'seating', 'waiting', 'eating', 'standing', 'farewell', 'leaving', 'gap', 'transition'].includes(this.phase); }
    private lockGuestInput(locked: boolean) {
        $('nav').querySelectorAll<HTMLButtonElement>('button').forEach(button => button.disabled = locked);
    }
    serve(q: Quality, extra: string) {
        if (this.phase !== 'ready' || !this.guest?.active) return;
        this.guestVisit?.pauseWaiting();
        this.phase = 'eating';
        this.lockGuestInput(true);
        const c = this.current!, p = this.save.customers[c.id];
        const quiet = CharacterStoryManager.pendingEvent(c.id, p)?.after.some(line => line.emotion === 'quiet') ?? false;
        this.quietDeparture = quiet;
        const favorite = p.preferenceFound && extra === c.favoriteIngredients[0];
        panel(`<div class="eyebrow">따뜻할 때, 천천히</div><h2>${c.name}의 한입</h2><p class="muted">${this.currentRecipe!.name} · 잠깐 쉬어 가요.</p><div class="waiting"><i></i><i></i><i></i></div>`);
        this.customerMeal = new CustomerMeal(this, this.guest, this.currentRecipe!.id, q, quiet,
            () => { if (this.guest instanceof NabiView) this.guest.taste(q, favorite, p.intimacy, p.characterStory?.stage ?? 0); },
            () => { this.customerMeal = undefined; if (this.phase === 'eating') this.finishServing(q, extra, quiet); });
    }
    private finishServing(q: Quality, extra: string, quiet: boolean) {
        this.phase = 'reaction';
        this.guestVisit?.wait();
        this.lockGuestInput(false);
        const c = this.current!, reward = ProgressionManager.serve(this.save, c.id, q, extra);
        this.hud();
        audio.success();
        $('caption').textContent = '배부른 한 끼가, 다정한 기억이 됩니다.';
        if (this.guest instanceof NabiView && !quiet) {
            const p = this.save.customers[c.id];
            this.guest.affinity(reward.intimacy, p.intimacy, p.characterStory?.stage ?? 0);
        }
        panel(`<div class="eyebrow">잘 먹었습니다</div><h2>${c.name}의 작은 인사</h2><p class="quote">“${DialogueManager.reaction(c.id, this.save.weather, reward.favorite)}”</p><div class="rewards"><span>${icon('coin')} +${reward.gold} G</span><span>${icon('heart')} 친밀도 +${reward.intimacy}${reward.favorite ? ' · 취향 보너스' : ''}</span></div><button id="next" class="primary">${reward.stories.length || this.save.customers[c.id].characterStory?.pending?.part === 'after' ? '이야기 들어 주기' : this.save.activeNight!.report.served === 5 ? '오늘 밤 마무리' : '다음 손님 맞이하기'} →</button>`);
        on('next', () => {
            if (this.phase !== 'reaction') return;
            this.phase = 'transition';
            this.guestVisit?.pauseWaiting();
            this.showPendingRecipes(() => {
                if (reward.stories.length)
                    this.story(reward.stories);
                else
                    this.playCharacterStory('after', () => this.depart());
            });
        });
    }
    playCharacterStory(part: StoryPart, next: () => void) {
        const c = this.current!, p = this.save.customers[c.id];
        const pending = p.characterStory?.pending, event = CharacterStoryManager.pendingEvent(c.id, p);
        if (!pending || pending.part !== part || !event || !event[part].length) { next(); return; }
        this.guestVisit?.pauseWaiting();
        this.phase = 'character-story';
        if (this.guest instanceof NabiView) this.guest.beginStory();
        else this.tweens.getTweensOf(this.guest!).forEach(tween => tween.pause());
        $('caption').textContent = this.save.weather === 'rain' ? '빗소리 사이로, 작은 이야기를 들어요.' : '작은 지붕 아래, 잠깐의 이야기.';
        new StoryDialogue(event, part, () => p.characterStory!.pending!.line, () => {
            const finishedPart = CharacterStoryManager.advance(c.id, p);
            if (!p.characterStory?.pending) {
                const report = this.save.activeNight!.report;
                const discovery = `${c.name}의 이야기 · ${event.title}`;
                if (!report.discoveries.includes(discovery)) report.discoveries.push(discovery);
            }
            SaveManager.save(this.save);
            return finishedPart;
        }, c.name, line => this.storyExpression(line), () => {
            if (this.guest instanceof NabiView) this.guest.endStory(p.intimacy, p.characterStory?.stage ?? 0);
            else if (this.guest) {
                this.guest.setTexture(c.id).setAngle(0).setScale(customerRender.scale).setY(CustomerVisit.seat.y);
                this.tweens.getTweensOf(this.guest).forEach(tween => tween.resume());
            }
            next();
        });
    }
    private storyExpression(line: StoryLine) {
        if (line.speaker === 'guest') this.quietDeparture = line.emotion === 'quiet';
        if (this.guest instanceof NabiView) { this.guest.storyLine(line); return; }
        if (!this.guest || line.speaker !== 'guest') return;
        const emotion = line.emotion ?? 'normal';
        this.guest.setTexture(this.current!.id + (emotion === 'smile' ? '-blink' : ''));
        this.guest.setAngle(emotion === 'quiet' ? -5 : emotion === 'shy' ? -3 : emotion === 'smile' ? 3 : 0);
        this.guest.setScale(emotion === 'quiet' ? customerRender.scale - .06 : emotion === 'smile' ? customerRender.scale + .1 : customerRender.scale);
        this.guest.setY(CustomerVisit.seat.y + (emotion === 'quiet' ? 4 : 0));
    }
    story(lines: string[]) {
        const c = this.current!;
        let i = 0;
        const show = () => {
            panel(`<div class="eyebrow">조금 더 가까워진 마음 · 이야기 ${this.save.customers[c.id].storyStage}/3</div><h2>${c.name}의 이야기</h2><p class="quote">“${lines[i]}”</p><button id="story-next" class="primary">${i === lines.length - 1 ? '마음에 담아 두기' : '계속 듣기'} →</button>`);
            on('story-next', () => {
                if (++i < lines.length)
                    show();
                else {
                    toast('도감에 새로운 이야기를 남겼어요.');
                    this.depart();
                }
            });
        };
        show();
    }
    private createGuest(id: string, x: number, y: number) { return id === 'nabi' ? new NabiView(this, x, y) : this.add.image(x, y, id).setOrigin(.5, .5).setScale(customerRender.scale).setDepth(2); }
    private createVisit() { return new CustomerVisit(this, this.guest!, !!this.current!.dog, () => ['waiting', 'order', 'cooking', 'ready', 'reaction'].includes(this.phase)); }
    depart() {
        if (!this.guest?.active || ['standing', 'farewell', 'leaving', 'gap'].includes(this.phase)) return;
        const guest = this.guest, visit = this.guestVisit!, p = this.save.customers[this.current!.id];
        if (p.characterStory?.pending) return;
        const complete = this.current!.id === 'nabi' && CharacterStoryManager.complete('nabi', p);
        this.lockGuestInput(true);
        panel('<div class="eyebrow">또 만나요</div><h2>다음 밤에도 기다릴게요.</h2><p class="muted">골목에 따뜻한 기억 하나가 남았어요.</p>');
        visit.leave(p.intimacy, complete, this.quietDeparture,
            () => { this.phase = 'standing'; }, () => { this.phase = 'farewell'; }, () => { this.phase = 'leaving'; }, () => {
                if (guest instanceof NabiView) guest.cleanup();
                guest.destroy(); this.guest = undefined; this.guestVisit = undefined;
                this.phase = 'gap';
                this.guestGap = this.time.delayedCall(400, () => {
                    this.guestGap = undefined;
                    if (this.phase === 'gap') this.nextGuest();
                });
            });
    }
    result() { this.phase = 'result'; this.lockGuestInput(false); this.guest?.destroy(); $('caption').textContent = '불을 끄기 전, 오늘의 따뜻함을 세어 보아요.'; ResultScene.show(this.save, () => { this.save.night++; this.save.weather = WeatherManager.roll(this.save.night); this.save.activeNight = null; this.refreshWeather(); SaveManager.save(this.save); this.hud(); this.welcome(); }); }
    menu() {
        modal(`<div class="sheet-head"><div><span class="eyebrow">KITCHEN NOTES · ${this.save.unlockedRecipes.length}/5</span><h2>오늘의 메뉴</h2></div><button id="close" class="close" aria-label="닫기">×</button></div><p class="muted">재료는 늘 충분해요. 단골의 마음에서 새 메뉴를 배워요.</p>${RecipeManager.all().map(r => {
            const unlocked = this.save.unlockedRecipes.includes(r.id), u = r.unlock;
            const progress = u ? this.save.customers[u.customerId] : null;
            return `<div class="recipe-card ${unlocked ? '' : 'recipe-locked'}">${food(r.id)}<div><h3>${r.name}${unlocked ? '' : ' · 미발견'}</h3><p>${r.subtitle}</p><small>${unlocked ? r.ingredients.map(i => ingredients[i].name).join(' + ') : `${u!.customerId === 'kkamang' ? '까망' : '몽실'} 방문 ${Math.min(progress!.visitCount, u!.visits)}/${u!.visits}회 · 친밀도 ${Math.min(progress!.intimacy, u!.intimacy)}/${u!.intimacy}`}</small></div></div>`;
        }).join('')}<div class="hint">붕어빵은 한 번 뒤집은 뒤 꺼내요.<br>새 메뉴를 배우면 좋아하는 친구가 다음 방문에 주문해요.</div>`);
        on('close', closeModal);
    }
    shop() {
        modal(`<div class="sheet-head"><div><span class="eyebrow">A COZIER PLACE</span><h2>식당을 조금 더 포근하게</h2></div><button id="close" class="close" aria-label="닫기">×</button></div><p class="muted">보유 골드 <b>${this.save.gold} G</b></p>${upgrades.map(u => `<div class="upgrade"><div><h3>${u.name}</h3><p>${u.description}</p></div><button id="buy-${u.id}" ${this.save.upgrades[u.id] || this.save.gold < u.cost ? 'disabled' : ''}>${this.save.upgrades[u.id] ? '꾸밈 완료' : u.cost + ' G'}</button></div>`).join('')}<div class="hint">다음 친구들의 방문 · 보리 4번째 밤 / 달이 7번째 밤 / 호두 10번째 밤</div>`);
        on('close', closeModal);
        for (const u of upgrades)
            on('buy-' + u.id, () => {
                if (this.save.gold < u.cost || this.save.upgrades[u.id])
                    return;
                this.save.gold -= u.cost;
                this.save.upgrades[u.id] = 1;
                SaveManager.save(this.save);
                this.decorations();
                this.hud();
                audio.success();
                this.shop();
                toast('식당이 조금 더 포근해졌어요.');
            });
    }
}
