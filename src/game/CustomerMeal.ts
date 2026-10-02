import { DongguView } from './DongguView';
import Phaser from 'phaser';
import { KkamangView } from './KkamangView';
import { DubuView } from './DubuView';
import { NabiView } from './NabiView';
import { AmbientCustomerView } from './AmbientCustomerView';
import type { Quality } from '../types/Recipe';

/** One shared eating sequence; rewards remain the scene's responsibility. */
export class CustomerMeal {
    private timers = new Set<Phaser.Time.TimerEvent>();
    private animations = new Set<Phaser.Tweens.Tween>();
    private objects = new Set<Phaser.GameObjects.GameObject>();
    private paused: Phaser.Tweens.Tween[];
    private cleaned = false;
    private x: number;
    private y: number;
    private angle: number;
    private texture?: string;
    constructor(private scene: Phaser.Scene, private guest: DongguView | Phaser.GameObjects.Image | NabiView | DubuView | KkamangView | AmbientCustomerView,
        recipeId: string, quality: Quality, quiet: boolean, taste: () => void, complete: () => void, serving?: 'two-eggs', decorated = false) {
        this.x = guest.x; this.y = guest.y; this.angle = guest.angle;
        this.texture = guest instanceof NabiView ? undefined : guest.texture.key.replace('-blink', '');
        this.paused = scene.tweens.getTweensOf(guest).filter(tween => tween.isPlaying());
        this.paused.forEach(tween => tween.pause());
        if (guest instanceof NabiView || guest instanceof DubuView || guest instanceof KkamangView) guest.beginEating();
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        const foodX = guest.x + (guest.x > 360 ? -70 : 80);
        const direction = guest.x > 360 ? -1 : 1;
        const plate = scene.add.ellipse(foodX, 778, 58, 13, decorated ? recipeId === 'bread' ? 0xe6c367 : 0x91c7c2 : 0xe7cda5).setDepth(2.5).setName('meal-plate');
        if (decorated) plate.setStrokeStyle(2, recipeId === 'bread' ? 0xa67c32 : 0x557f85);
        const food = scene.add.image(foodX, 752, 'meal-' + (recipeId === 'ramen' && serving === 'two-eggs' ? 'ramen-two-eggs' : recipeId)).setScale(2).setDepth(2.6).setName('served-food');
        food.setData('serving', serving ?? 'normal');
        this.objects.add(plate); this.objects.add(food);
        this.animate({ targets: food, y: 768, duration: 260, ease: 'Sine.easeOut' });
        // A few wisps for warm food, restrained on rice/bread.
        for (let i = 0; i < (recipeId === 'oden' || recipeId === 'ramen' ? 2 : 1); i++) {
            const steam = scene.add.rectangle(foodX - 5 + i * 9, 748, 3, 7, 0xfbe5bf, .3).setDepth(2.7).setName('meal-steam');
            this.objects.add(steam);
            this.animate({ targets: steam, y: 722, x: steam.x + 4, alpha: 0, duration: 1200, delay: i * 240 });
        }
        this.later(350, () => this.animate({ targets: guest, x: this.x + direction, angle: this.angle + 1, duration: 200 }));
        this.later(600, () => this.animate({ targets: guest, x: this.x + direction * (guest instanceof KkamangView ? 1 : 3), y: this.y + (guest instanceof KkamangView ? .5 : 1), duration: 160, yoyo: true, repeat: 1 }));
        this.later(1250, () => {
            this.animate({ targets: guest, x: this.x + direction * (guest instanceof KkamangView ? 2 : 4), y: this.y + (guest instanceof KkamangView ? 1 : 2), duration: 160, yoyo: true });
            this.animate({ targets: food, scale: 1.5, alpha: .8, duration: 200 });
        });
        this.later(quality === '완벽' ? 1800 : 1550, () => {
            this.restore();
            if (quiet && guest instanceof KkamangView && serving === 'two-eggs') taste();
            if (!quiet) {
                taste();
                if (!(guest instanceof NabiView)) {
                    if (!(guest instanceof KkamangView)) this.animate({ targets: guest, y: this.y + (this.texture === 'kkamang' ? 0 : quality === '완벽' ? -2 : 1), angle: this.angle + (quality === '보통' ? (this.texture === 'kkamang' ? .5 : 2) : 0), duration: 160, yoyo: true });
                    if (quality !== '보통') {
                        if (!(guest instanceof KkamangView)) guest.setTexture(this.texture!.replace('-blink', '') + '-blink');
                        for (let i = 0; i < (this.texture === 'kkamang' ? 1 : quality === '완벽' ? 3 : 2); i++) {
                            const star = scene.add.image(this.x - 28 + i * 25, this.y - 50, 'nabi-spark').setScale(1.5).setDepth(3).setName('meal-spark');
                            this.objects.add(star);
                            this.animate({ targets: star, y: star.y - 14, alpha: 0, duration: 600 });
                        }
                    }
                }
            }
        });
        this.later(2350, () => { this.cleanup(); complete(); });
    }
    private later(ms: number, action: () => void) {
        const timer = this.scene.time.delayedCall(ms, () => { this.timers.delete(timer); if (!this.cleaned) action(); });
        this.timers.add(timer);
    }
    private animate(config: Phaser.Types.Tweens.TweenBuilderConfig) {
        const tween = this.scene.tweens.add({ ...config, onComplete: () => this.animations.delete(tween) });
        this.animations.add(tween);
    }
    private restore() {
        if (!this.guest.active) return;
        this.guest.setPosition(this.x, this.y).setAngle(this.angle);
        if (this.guest instanceof NabiView || this.guest instanceof DubuView || this.guest instanceof KkamangView) this.guest.endEating();
        else if (this.texture) this.guest.setTexture(this.texture);
    }
    cleanup() {
        if (this.cleaned) return;
        this.cleaned = true;
        for (const timer of this.timers) timer.remove(false);
        for (const tween of this.animations) { tween.stop(); tween.remove(); }
        for (const object of this.objects) object.destroy();
        this.timers.clear(); this.animations.clear(); this.objects.clear();
        this.restore();
        this.paused.forEach(tween => tween.resume());
        this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    }
}
