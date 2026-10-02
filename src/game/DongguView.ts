import Phaser from 'phaser';
import { customerRender } from './CharacterArt';

/** Layers only; CustomerVisit owns the existing timers, tweens and cleanup. */
export class DongguView extends Phaser.GameObjects.Container {
    readonly tail: Phaser.GameObjects.Image;
    readonly ears: Phaser.GameObjects.Image[];
    readonly bodyImage: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.tail = scene.add.image(15, 13, 'donggu-tail')
            .setOrigin(39 / 48, 37 / 48).setName('donggu-tail');
        this.ears = [false, true].map(right => scene.add.image((right ? 33 : 13) - 24, -7, 'donggu-ear-' + (right ? 'right' : 'left'))
            .setOrigin((right ? 33 : 13) / 48, 17 / 48).setName('donggu-ear-' + (right ? 'right' : 'left')));
        this.bodyImage = scene.add.image(0, 0, 'donggu-body').setName('donggu-body');
        this.add([this.tail, ...this.ears, this.bodyImage]);
        this.setName('donggu').setScale(customerRender.scale).setDepth(2);
        scene.add.existing(this);
    }
    get texture() { return this.scene.textures.get('donggu'); }
    setTexture(key: string) {
        this.bodyImage.setTexture('donggu-body' + (key.endsWith('-blink') ? '-blink' : ''));
        return this;
    }
    resetParts() { this.tail.setAngle(0); this.ears.forEach(ear => ear.setAngle(0)); }
}
