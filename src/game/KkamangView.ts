import Phaser from 'phaser';
import { customerRender } from './CharacterArt';
import type { CharacterStoryEvent, StoryLine } from '../types/CharacterStory';
import type { Quality } from '../types/Recipe';

/** Restrained local gestures; the existing visit and meal sequences move the root. */
export class KkamangView extends Phaser.GameObjects.Container {
    private bodyImage: Phaser.GameObjects.Image;
    private tailRoot: Phaser.GameObjects.Container;
    private tailTip: Phaser.GameObjects.Image;
    private ears: Phaser.GameObjects.Image[];
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private started = false;
    private cleaned = false;
    private story = false;
    private emotion = 'normal';
    readonly quietArrival: boolean;
    constructor(scene: Phaser.Scene, x: number, y: number, event?: CharacterStoryEvent, private rain = false) {
        super(scene, x, y);
        this.quietArrival = !!event?.arrival?.quiet;
        this.setName('kkamang-view');
        this.tailRoot = scene.add.container(10, 19);
        const base = scene.add.image(0, 0, 'kkamang-tail-base').setOrigin(34 / 48, 43 / 48);
        this.tailTip = scene.add.image(2, -18, 'kkamang-tail-tip').setOrigin(36 / 48, 25 / 48).setName('kkamang-tail-tip');
        this.tailRoot.add([base, this.tailTip]);
        this.ears = [scene.add.image(-10, -6, 'kkamang-ear-left').setOrigin(14 / 48, 18 / 48),
            scene.add.image(8, -6, 'kkamang-ear-right').setOrigin(32 / 48, 18 / 48)];
        this.bodyImage = scene.add.image(0, 0, 'kkamang-body');
        this.add([this.tailRoot, ...this.ears, this.bodyImage]);
        scene.add.existing(this); this.setScale(customerRender.scale).setDepth(2);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    get texture() { return this.scene.textures.get('kkamang'); }
    setTexture(key: string) { this.bodyImage.setTexture(key.endsWith('-blink') ? 'kkamang-body-blink' : 'kkamang-body'); return this; }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned) action(); });
        this.timers.add(timer);
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => this.animations.delete(tween) });
        this.animations.add(tween);
    }
    private clear(resetPose = true) {
        for (const timer of this.timers) timer.remove(false);
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        this.timers.clear(); this.animations.clear(); this.started = false;
        if (!resetPose) return;
        this.tailRoot.setAngle(0); this.tailTip.setAngle(0);
        this.ears.forEach(ear => ear.setAngle(0)); this.bodyImage.setPosition(0, 0).setAngle(0); this.setTexture('kkamang');
    }
    private get quiet() { return this.quietArrival || this.emotion === 'quiet'; }
    private tip(repeat = -1, duration = 2300) {
        this.tailTip.setAngle(-2);
        this.animate({ targets: this.tailTip, angle: 2, duration, yoyo: true, repeat, ease: 'Sine.easeInOut' });
    }
    walking() { this.clear(); if (!this.quiet) this.tip(); }
    arrivalLook() {
        if (this.rain) this.animate({ targets: this.ears[0], angle: -4, duration: 140, yoyo: true });
        this.animate({ targets: this.bodyImage, angle: -1, duration: 180, yoyo: true });
    }
    wait() {
        if (this.started || this.story || this.cleaned) return;
        this.started = true;
        if (!this.quiet) this.tip();
        const blink = () => this.later(Phaser.Math.Between(this.quiet ? 5000 : 3500, this.quiet ? 8000 : 6000), () => {
            this.setTexture('kkamang-blink'); this.later(120, () => { this.setTexture('kkamang'); blink(); });
        }); blink();
        const observe = () => this.later(Phaser.Math.Between(6000, 10000), () => {
            if (!this.quiet) {
                if (Phaser.Math.Between(0, 1)) this.animate({ targets: this.ears[0], angle: -3, duration: 180, yoyo: true });
                else this.animate({ targets: this.bodyImage, angle: -1, duration: 220, yoyo: true });
            }
            observe();
        }); observe();
    }
    pause() { this.clear(); }
    beginStory() { this.clear(); this.story = true; }
    storyLine(line: StoryLine) {
        if (line.speaker !== 'guest') return;
        this.clear(); this.emotion = line.emotion ?? 'normal';
        if (line.gaze) {
            this.bodyImage.setAngle(line.gaze === 'chair' ? 1 : -1).setY(line.gaze === 'chair' ? .5 : 0);
            this.animate({ targets: this.ears[0], angle: -2, duration: 180, yoyo: true });
        }
        if (this.quiet) this.bodyImage.setY(.5);
        else if (this.emotion === 'shy') this.tip(1, 180);
        else if (this.emotion === 'smile') this.setTexture('kkamang-blink');
    }
    endStory() { this.clear(); this.story = false; this.emotion = 'normal'; }
    beginEating() { this.clear(); }
    endEating() { this.clear(); }
    taste(quality: Quality, remembering = false) {
        if (this.story) return;
        if (remembering) { this.setTexture('kkamang-blink'); return; }
        if (this.quiet || quality === '보통') return;
        this.setTexture('kkamang-blink');
        if (quality === '맛있음') this.tip(0, 450);
        else {
            this.animate({ targets: this.ears[0], angle: -2, duration: 200, yoyo: true });
            this.animate({ targets: this.tailRoot, angle: 1, duration: 450, yoyo: true });
        }
    }
    farewell(familiar: boolean) {
        this.clear();
        if (familiar) this.animate({ targets: this.bodyImage, angle: -1, duration: 220, yoyo: true });
    }
    lookBack() { this.clear(); this.bodyImage.setAngle(-1.5); this.tip(0, 240); }
    cleanup() {
        if (this.cleaned) return;
        this.clear(false); this.cleaned = true;
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.off(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
}
