import Phaser from 'phaser';
import { $, on, panel } from '../ui/UI';

type FadableProp = Phaser.GameObjects.GameObject & {
    alpha: number;
    visible: boolean;
    setAlpha(alpha: number): unknown;
    setVisible(visible: boolean): unknown;
};
type StoryPart = { line: string; duration: number; animate: () => void };
const canFade = (object: Phaser.GameObjects.GameObject | null | undefined): object is FadableProp =>
    !!object && 'alpha' in object && 'visible' in object && 'setAlpha' in object && 'setVisible' in object;

/** A short, skippable moving scene introducing the cat who reopened the diner. */
export class OwnerPrologue {
    private timers = new Set<Phaser.Time.TimerEvent>();
    private tweens = new Set<Phaser.Tweens.Tween>();
    private pausedLampTweens: Phaser.Tweens.Tween[] = [];
    private objects = new Set<Phaser.GameObjects.GameObject>();
    private actor?: Phaser.GameObjects.Image;
    private shade?: Phaser.GameObjects.Rectangle;
    private finished = false;
    private originalVisible: boolean[] = [];
    private originalAlphas: number[] = [];
    private readonly streetProps: FadableProp[];

    constructor(
        private scene: Phaser.Scene,
        private interfaceRoot: HTMLElement,
        private chef: Phaser.GameObjects.Image,
        sign?: Phaser.GameObjects.GameObject | null,
        awning?: Phaser.GameObjects.GameObject | null,
        lamps: Phaser.GameObjects.GameObject[] = []
    ) {
        this.streetProps = [sign, awning, ...lamps].filter(canFade);
    }

    start(onComplete: () => void) {
        this.finished = false;
        this.onComplete = onComplete;
        this.interfaceRoot.classList.add('prologue-active');
        this.originalVisible = [this.chef.visible, ...this.streetProps.map(x => x.visible)];
        this.originalAlphas = [this.chef.alpha, ...this.streetProps.map(x => x.alpha)];
        this.chef.setVisible(false);
        for (const lamp of this.streetProps.slice(2)) {
            const running = this.scene.tweens.getTweensOf(lamp).filter(tween => tween.isPlaying());
            this.pausedLampTweens.push(...running);
            running.forEach(tween => tween.pause());
        }
        for (const prop of this.streetProps) prop.setVisible(false);

        this.shade = this.track(this.scene.add.rectangle(360, 480, 720, 960, 0x10172a, .78)
            .setOrigin(.5).setDepth(8).setName('prologue-night-shade')) as Phaser.GameObjects.Rectangle;
        this.addFireflies();
        this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
        this.play(0);
    }

    private onComplete = () => {};
    private readonly parts: StoryPart[] = [
        { line: '밤이 되면, 골목 끝 작은 식당도 조용해졌어요.', duration: 2100, animate: () => this.pauseLights() },
        { line: '주인은 닫힌 문 앞에서 잠시 발길을 멈췄습니다.', duration: 2200, animate: () => this.ownerArrives() },
        { line: '다시 불을 켜고, 냄비를 걸었습니다.', duration: 2200, animate: () => this.openTheDiner() },
        { line: '배고픈 친구들이 쉬어 갈 곳을 만들고 싶었으니까요.', duration: 2100, animate: () => this.firstFootsteps() }
    ];

    private play(index: number) {
        if (this.finished) return;
        const part = this.parts[index];
        $('panel').classList.add('prologue-panel');
        panel(`<div class="prologue-card"><span class="eyebrow">길냥이 식당 · 첫 번째 밤</span><p class="prologue-line">${part.line}</p><button id="prologue-skip" class="prologue-skip">건너뛰기 <span aria-hidden="true">→</span></button></div>`);
        on('prologue-skip', () => this.finish());
        part.animate();
        this.later(part.duration, () => index + 1 < this.parts.length ? this.play(index + 1) : this.finish());
    }

    private pauseLights() {
        // The dim street stays visible behind the animation, like an opening shot.
        for (const [index, prop] of this.streetProps.entries()) {
            if (index === 0 || index === 1) prop.setVisible(false);
            else prop.setAlpha(0);
        }
    }

    private ownerArrives() {
        this.actor = this.track(this.scene.add.image(645, 543, 'chef').setScale(2.5).setFlipX(true)
            .setDepth(12).setAlpha(0).setName('prologue-owner')) as Phaser.GameObjects.Image;
        this.actor.setVisible(true);
        this.tween({ targets: this.actor, x: 355, alpha: 1, duration: 1450, ease: 'Sine.easeOut' }, () => {
            if (!this.actor?.active || this.finished) return;
            this.tween({ targets: this.actor, y: 539, duration: 200, yoyo: true, ease: 'Sine.easeInOut' });
        });
    }

    private openTheDiner() {
        // The street warms up as the sign and lamps come back to life.
        if (this.shade?.active) this.tween({ targets: this.shade, alpha: .27, duration: 900, ease: 'Sine.easeOut' });
        this.streetProps.forEach((prop, index) => {
            prop.setVisible(true); prop.setAlpha(0);
            this.tween({ targets: prop, alpha: 1, duration: index < 2 ? 700 : 480, delay: index < 2 ? 0 : (index - 2) * 180, ease: 'Sine.easeOut' });
        });
        for (const x of [183, 538]) {
            const glow = this.track(this.scene.add.ellipse(x + 2, 497, 130, 155, 0xffd491, 0)
                .setDepth(9).setName('prologue-lantern-glow')) as Phaser.GameObjects.Ellipse;
            this.tween({ targets: glow, alpha: .18, scale: 1.08, duration: 850, yoyo: true, ease: 'Sine.easeInOut' });
        }
        this.actor?.setFlipX(false);
        if (this.actor?.active) this.tween({ targets: this.actor, y: 540, duration: 450, yoyo: true, ease: 'Sine.easeInOut' });
        for (let i = 0; i < 5; i++) {
            const spark = this.track(this.scene.add.rectangle(355 + (i - 2) * 13, 420, 4, 4, 0xffdf9c, 0)
                .setDepth(13).setName('prologue-warm-spark')) as Phaser.GameObjects.Rectangle;
            this.tween({ targets: spark, y: 385 - (i % 2) * 11, alpha: .85, duration: 500,
                delay: i * 95, yoyo: true, hold: 240, onYoyo: () => spark.setAlpha(.85), ease: 'Sine.easeOut' });
        }
    }

    private firstFootsteps() {
        for (let i = 0; i < 4; i++) {
            const x = 634 - i * 38, y = 768 + (i % 2) * 13;
            const print = this.track(this.scene.add.container(x, y).setDepth(11).setAlpha(0).setName('prologue-pawprint')) as Phaser.GameObjects.Container;
            const color = 0xf2cf99;
            print.add([
                this.scene.add.ellipse(-7, 2, 8, 10, color), this.scene.add.ellipse(7, 2, 8, 10, color),
                this.scene.add.ellipse(-7, -8, 5, 6, color), this.scene.add.ellipse(0, -11, 5, 6, color),
                this.scene.add.ellipse(7, -8, 5, 6, color)
            ]);
            this.tween({ targets: print, x: x - 13, alpha: .5, duration: 380, delay: i * 180,
                onComplete: () => this.tween({ targets: print, alpha: 0, duration: 300 }) });
        }
        if (this.actor?.active) this.tween({ targets: this.actor, y: 537, duration: 230, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
    }

    private addFireflies() {
        for (let i = 0; i < 6; i++) {
            const x = 140 + i * 83, y = 375 + (i % 3) * 60;
            const light = this.track(this.scene.add.rectangle(x, y, 4, 4, 0xffdb9e, .08)
                .setDepth(10).setName('prologue-firefly'));
            this.tween({ targets: light, y: y - 13, alpha: .6, duration: 800 + i * 110,
                delay: i * 170, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
    }

    private track<T extends Phaser.GameObjects.GameObject>(object: T): T { this.objects.add(object); return object; }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.finished) action(); });
        this.timers.add(timer);
    }
    private tween(config: Phaser.Types.Tweens.TweenBuilderConfig, done?: () => void) {
        let tween!: Phaser.Tweens.Tween;
        const configuredComplete = config.onComplete;
        tween = this.scene.tweens.add({ ...config, onComplete: (active, targets, ...rest) => {
            this.tweens.delete(tween);
            if (this.finished) return;
            configuredComplete?.call(this.scene, active, targets, ...rest);
            done?.();
        } });
        this.tweens.add(tween); return tween;
    }

    finish() {
        if (this.finished) return;
        this.finished = true;
        this.stopEffects();
        this.restoreStreet();
        this.pausedLampTweens.forEach(tween => tween.resume()); this.pausedLampTweens = [];
        this.interfaceRoot.classList.remove('prologue-active');
        $('panel').classList.remove('prologue-panel');
        panel('');
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
        this.onComplete();
    }

    private restoreStreet() {
        this.chef.setVisible(this.originalVisible[0]).setAlpha(this.originalAlphas[0]).setTexture('chef');
        this.streetProps.forEach((prop, i) => { prop.setVisible(this.originalVisible[i + 1]); prop.setAlpha(this.originalAlphas[i + 1]); });
    }
    private stopEffects() {
        for (const timer of this.timers) timer.remove(false);
        this.timers.clear();
        for (const tween of this.tweens) { tween.stop(); tween.remove(); }
        this.tweens.clear();
        for (const object of this.objects) object.destroy();
        this.objects.clear();
    }
    dispose() {
        if (this.finished) return;
        this.finished = true;
        this.stopEffects(); this.restoreStreet();
        this.interfaceRoot.classList.remove('prologue-active');
        $('panel').classList.remove('prologue-panel');
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.dispose, this);
    }
}
