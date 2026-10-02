import Phaser from 'phaser';
import { customers } from '../data/customers';
export class BootScene extends Phaser.Scene {
    constructor() { super('Boot'); }
    create() {
        for (const c of [{ id: 'chef', color: 0xd6c6b6, accent: 0x918275, dog: false }, ...customers]) {
            for (const layer of c.id === 'nabi' ? ['', '-body'] : ['']) {
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
                        if (layer !== '-body') {
                            rect(9, 4, 11, 15, c.color);
                            rect(28, 4, 10, 15, c.color);
                            rect(12, 7, 5, 8, 0xd38f89);
                            rect(30, 7, 5, 8, 0xd38f89);
                        }
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
                    g.generateTexture(c.id + layer + (blink ? '-blink' : ''), 48, 48);
                    g.destroy();
                }
            }
        }
        const nabi = customers.find(c => c.id === 'nabi')!;
        const ear = this.make.graphics({ x: 0, y: 0 });
        ear.fillStyle(nabi.color).fillRect(0, 0, 11, 15);
        ear.fillStyle(0xd38f89).fillRect(3, 3, 5, 8);
        ear.generateTexture('nabi-ear', 11, 15);
        ear.destroy();
        const tail = this.make.graphics({ x: 0, y: 0 });
        tail.fillStyle(nabi.accent).fillRect(2, 2, 5, 20);
        tail.fillStyle(nabi.color).fillRect(3, 0, 4, 6).fillRect(0, 5, 5, 14).fillRect(2, 17, 5, 7);
        tail.generateTexture('nabi-tail', 8, 24);
        tail.destroy();
        const heart = this.make.graphics({ x: 0, y: 0 });
        heart.fillStyle(0xce8e83).fillRect(1, 0, 3, 2).fillRect(6, 0, 3, 2).fillRect(0, 2, 10, 3).fillRect(1, 5, 8, 2).fillRect(3, 7, 4, 2).fillRect(4, 9, 2, 1);
        heart.generateTexture('nabi-heart', 10, 10);
        heart.destroy();
        const spark = this.make.graphics({ x: 0, y: 0 });
        spark.fillStyle(0xf3cf8d).fillRect(3, 0, 2, 8).fillRect(0, 3, 8, 2);
        spark.generateTexture('nabi-spark', 8, 8);
        spark.destroy();
        this.scene.start('Title');
    }
}
