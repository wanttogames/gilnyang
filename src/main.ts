import Phaser from 'phaser';
import { gameConfig } from './game/GameConfig';
import './style.css';
Promise.all([document.fonts.load("24px 'Alley Sans'"), document.fonts.load("700 26px 'Alley Sans'")]).then(() => new Phaser.Game(gameConfig));
const resize = () => { const shell = document.getElementById("shell")!; document.getElementById("interface")!.style.transform = `scale(${shell.clientWidth / 720})`; };
new ResizeObserver(resize).observe(document.getElementById("shell")!);
resize();
