import Phaser from 'phaser';
import type { AmbientCustomer } from '../data/ambientCustomers';

const tailPivot: Record<AmbientCustomer['look'], { x: number; y: number }> = {
    kitten: { x: 37, y: 39 },
    white: { x: 37, y: 38 },
    grey: { x: 39, y: 41 },
    round: { x: 41, y: 34 },
    corgi: { x: 9, y: 32 },
    beagle: { x: 39, y: 26 },
    elder: { x: 40, y: 34 },
};

/** A walk-in guest with a separate tail layer so small breed-specific wags stay readable. */
export class AmbientCustomerView extends Phaser.GameObjects.Container {
    readonly bodyImage: Phaser.GameObjects.Image;
    readonly tail: Phaser.GameObjects.Image;
    private readonly baseKey: string;

    constructor(scene: Phaser.Scene, customer: AmbientCustomer, x: number, y: number) {
        super(scene, x, y);
        this.baseKey = customer.id;
        const pivot = tailPivot[customer.look];
        this.tail = scene.add.image(pivot.x - 24, pivot.y - 24, customer.id + '-tail')
            .setOrigin(pivot.x / 48, pivot.y / 48).setName(customer.id + '-tail');
        this.bodyImage = scene.add.image(0, 0, customer.id + '-body').setOrigin(.5).setName(customer.id + '-body');
        this.add([this.tail, this.bodyImage]);
        this.setName(customer.id).setScale(2.5).setDepth(2);
        scene.add.existing(this);
    }

    get texture() { return this.scene.textures.get(this.baseKey); }

    setTexture(key: string) {
        const blink = key.endsWith('-blink');
        this.bodyImage.setTexture(this.baseKey + '-body' + (blink ? '-blink' : ''));
        return this;
    }
}
