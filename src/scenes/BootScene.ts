import Phaser from 'phaser';
import { customers } from '../data/customers';
export class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() { for (const c of [{ id: 'chef', color: 0xd6c6b6, accent: 0x918275, dog: false }, ...customers]) {
        for (const blink of [false, true]) {
            const g = this.make.graphics({ x: 0, y: 0 });
            const rect = (x: number, y: number, w: number, h: number, color: number) => { g.fillStyle(color); g.fillRect(x, y, w, h); };
            rect(9, 13, 29, 23, c.color);
            rect(12, 33, 23, 11, c.color);
            rect(6, 36, 6, 5, c.accent);
            rect(13, 43, 8, 4, c.accent);
            rect(28, 43, 8, 4, c.accent);
            if (c.dog) {
                rect(5, 10, 9, 20, c.accent);
                rect(35, 10, 9, 20, c.accent);
                rect(14, 26, 20, 11, 0xf6dfb7);
            }
            else {
                rect(9, 4, 11, 15, c.color);
                rect(28, 4, 10, 15, c.color);
                rect(12, 7, 5, 8, 0xd38f89);
                rect(30, 7, 5, 8, 0xd38f89);
                rect(11, 16, 6, 4, c.accent);
                rect(30, 16, 6, 4, c.accent);
            }
            rect(16, 23, 3, blink ? 1 : 4, 0x282534);
            rect(29, 23, 3, blink ? 1 : 4, 0x282534);
            rect(22, 29, 5, 3, 0xae776f);
            rect(14, 29, 4, 2, 0xe7a493);
            rect(31, 29, 4, 2, 0xe7a493);
            if (c.id === 'chef') {
                rect(12, 34, 24, 10, 0xb76458);
                rect(20, 34, 7, 9, 0xf4dfb9);
                rect(13, 4, 23, 6, 0xf4dfb9);
                rect(17, 0, 15, 7, 0xf4dfb9);
            }
            g.generateTexture(c.id + (blink ? '-blink' : ''), 48, 48);
            g.destroy();
        }
    } this.scene.start('Title'); }
}
