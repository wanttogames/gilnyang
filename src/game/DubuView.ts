import Phaser from 'phaser';
import { customerRender } from './CharacterArt';
import type { CharacterStoryEvent, StoryLine } from '../types/CharacterStory';
import type { Quality } from '../types/Recipe';

/** Dubu's existing pixels, split into local parts. Visit/meal still own world motion. */
export class DubuView extends Phaser.GameObjects.Container {
    readonly bodyImage: Phaser.GameObjects.Image;
    readonly tail: Phaser.GameObjects.Image;
    readonly ears: Phaser.GameObjects.Image;
    private pose: Phaser.GameObjects.Container;
    private item?: Phaser.GameObjects.Image;
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private started = false;
    private cleaned = false;
    private story = false;
    private emotion = 'normal';
    readonly quietArrival: boolean;
    readonly itemKind?: 'button' | 'cap' | 'stone';
    constructor(scene: Phaser.Scene, x: number, y: number, event?: CharacterStoryEvent) {
        super(scene, x, y);
        this.quietArrival = !!event?.arrival?.quiet;
        this.itemKind = event?.arrival?.item;
        this.setName('dubu-view');
        this.pose = scene.add.container(0, 0);
        // Full-canvas textures retain the original pixels; pivots sit at hip/ear base.
        this.tail = scene.add.image(12, 15, 'dubu-tail').setOrigin(36 / 48, 39 / 48).setName('dubu-tail');
        this.bodyImage = scene.add.image(0, 0, 'dubu-body');
        this.ears = scene.add.image(0, -6, 'dubu-ears').setOrigin(.5, 18 / 48).setName('dubu-ears');
        this.pose.add([this.tail, this.ears, this.bodyImage]); this.add(this.pose);
        if (this.itemKind) {
            this.item = scene.add.image(0, 11, 'dubu-item-' + this.itemKind).setScale(.8).setName('dubu-held-item');
            this.pose.add(this.item);
        }
        scene.add.existing(this); this.setScale(customerRender.scale).setDepth(2);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.once(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
    get texture() { return this.scene.textures.get('dubu'); }
    setTexture(key: string) { this.bodyImage.setTexture(key.endsWith('-blink') ? 'dubu-body-blink' : 'dubu-body'); return this; }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned) action(); });
        this.timers.add(timer); return timer;
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => this.animations.delete(tween) });
        this.animations.add(tween); return tween;
    }
    private clear(resetPose = true) {
        for (const timer of this.timers) timer.remove(false);
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        this.timers.clear(); this.animations.clear(); this.started = false;
        if (!resetPose) return;
        if (this.item?.name === 'dubu-table-item') this.item.setPosition(27, 15).setScale(1);
        this.pose.setPosition(0, 0).setAngle(0); this.ears.setAngle(0); this.setTexture('dubu');
    }
    private tailMotion(range: number, duration: number) {
        for (const tween of [...this.animations]) if (tween.hasTarget(this.tail)) { tween.stop(); tween.remove(); this.animations.delete(tween); }
        this.tail.setAngle(-range);
        this.animate({ targets: this.tail, angle: range, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    private get quiet() { return this.quietArrival || this.emotion === 'quiet'; }
    walking() { this.clear(); if (this.item?.name === 'dubu-table-item' && this.itemKind !== 'stone') this.item.setName('dubu-held-item').setPosition(0, 11).setScale(.8); this.tailMotion(this.quiet ? .4 : 5, this.quiet ? 1600 : 280); }
    seated() {
        if (!this.item || this.item.name !== 'dubu-held-item') return;
        this.item.setName('dubu-table-item');
        // Remains a child throughout: travel, reload and destruction cannot orphan it.
        this.animate({ targets: this.item, x: 27, y: 15, scale: 1, duration: 300, ease: 'Sine.easeOut' });
    }
    wait() {
        if (this.started || this.cleaned || this.story) return;
        this.started = true;
        this.tailMotion(this.quiet ? .4 : 4, this.quiet ? 2000 : 440);
        this.animate({ targets: this.pose, y: this.quiet ? .3 : -.8, duration: this.quiet ? 2000 : 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        const blink = () => this.later(Phaser.Math.Between(2500, 5000), () => {
            this.setTexture('dubu-blink'); this.later(110, () => { this.setTexture('dubu'); blink(); });
        }); blink();
        const action = () => this.later(Phaser.Math.Between(3000, 6000), () => {
            if (!this.quiet) {
                const choice = Phaser.Math.Between(0, 2);
                this.animate(choice === 0 ? { targets: this.pose, angle: -3, duration: 230, yoyo: true }
                    : choice === 1 ? { targets: this.pose, x: 1, duration: 180, yoyo: true, repeat: 1 }
                    : { targets: this.ears, angle: 3, duration: 170, yoyo: true });
            }
            action();
        }); action();
    }
    pause() { this.clear(); this.tail.setAngle(0); }
    beginStory() { this.clear(); this.story = true; }
    storyLine(line: StoryLine) {
        if (line.speaker !== 'guest') return;
        this.clear(); this.emotion = line.emotion ?? 'normal';
        this.tailMotion(this.quiet ? .3 : this.emotion === 'smile' ? 7 : 4, this.quiet ? 2400 : 300);
        this.pose.setY(this.quiet ? 1 : 0).setAngle(this.quiet ? -2 : 0);
        this.ears.setAngle(this.quiet ? -4 : 0);
        if (this.emotion === 'smile') this.setTexture('dubu-blink');
    }
    endStory() { this.clear(); this.story = false; this.emotion = 'normal'; }
    beginEating() { this.clear(); this.tailMotion(this.quiet ? .3 : 2, 800); }
    endEating() { this.clear(); }
    taste(quality: Quality) {
        if (this.story || this.quiet) return;
        this.tailMotion(quality === '완벽' ? 9 : quality === '맛있음' ? 7 : 3, quality === '완벽' ? 190 : 300);
        if (quality !== '보통') {
            this.setTexture('dubu-blink');
            this.animate({ targets: this.ears, angle: -3, duration: 130, yoyo: true });
            this.animate({ targets: this.pose, y: quality === '완벽' ? -1.2 : -.4, duration: 150, yoyo: true, repeat: quality === '완벽' ? 1 : 0 });
        }
    }
    farewell(quiet: boolean) { this.clear(); this.emotion = quiet ? 'quiet' : 'smile'; this.tailMotion(quiet ? .3 : 8, quiet ? 2000 : 230); }
    leaveStone() { if (this.itemKind === 'stone') this.item?.setVisible(false); }
    cleanup() {
        if (this.cleaned) return;
        this.clear(false); this.cleaned = true;
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.off(Phaser.GameObjects.Events.DESTROY, this.cleanup, this);
    }
}
