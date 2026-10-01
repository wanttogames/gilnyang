import Phaser from 'phaser';
export class TitleScene extends Phaser.Scene {
    constructor() { super('Title'); }
    create() { this.scene.start('Restaurant'); }
}
