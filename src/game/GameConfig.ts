import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { TitleScene } from '../scenes/TitleScene';
import { RestaurantScene } from '../scenes/RestaurantScene';
export const gameConfig: Phaser.Types.Core.GameConfig = { type: Phaser.AUTO, parent: 'game', width: 720, height: 1280, backgroundColor: '#1b233a', pixelArt: true, roundPixels: true, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [BootScene, TitleScene, RestaurantScene], input: { activePointers: 2 }, audio: { noAudio: true } };
