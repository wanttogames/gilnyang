import Phaser from 'phaser';
import type { Weather } from '../types/Weather';
export class WeatherView {
    private layer?: Phaser.GameObjects.Container;
    private particles: {
        shape: Phaser.GameObjects.Rectangle;
        speed: number;
        drift: number;
    }[] = [];
    constructor(private scene: Phaser.Scene) { }
    set(weather: Weather) {
        this.layer?.destroy();
        this.particles = [];
        const layer = this.scene.add.container(0, 0).setDepth(1);
        this.layer = layer;
        if (weather === 'clear')
            return;
        layer.add(this.scene.add.rectangle(360, 495, 720, 650, weather === 'rain' ? 0x14233f : 0x9db8c5, weather === 'rain' ? 0.12 : 0.06));
        if (weather === 'rain') {
            for (const x of [80, 360, 650]) {
                layer.add(this.scene.add.rectangle(x, 803, 77, 4, 0x9d9fa8, 0.22));
                layer.add(this.scene.add.rectangle(x + 16, 810, 41, 3, 0xefc088, 0.19));
            }
        }
        else {
            for (const [x, y, width] of [[165, 334, 380], [26, 652, 68], [304, 776, 124]])
                layer.add(this.scene.add.rectangle(x + width / 2, y, width, 4, 0xe5eaf0, 0.7));
        }
        for (let i = 0; i < (weather === 'rain' ? 58 : 34); i++) {
            const shape = this.scene.add.rectangle(Math.random() * 760 - 20, 180 + Math.random() * 655, weather === 'rain' ? 2 : 5, weather === 'rain' ? 13 : 5, weather === 'rain' ? 0xb2c9de : 0xf6f0de, weather === 'rain' ? 0.3 : 0.65);
            layer.add(shape);
            this.particles.push({ shape, speed: weather === 'rain' ? 460 + Math.random() * 150 : 30 + Math.random() * 28, drift: weather === 'rain' ? -85 : -12 + Math.random() * 24 });
        }
    }
    update(delta: number) {
        const seconds = Math.min(delta, 60) / 1000;
        for (const p of this.particles) {
            p.shape.y += p.speed * seconds;
            p.shape.x += p.drift * seconds;
            if (p.shape.y > 835 || p.shape.x < -30 || p.shape.x > 750) {
                p.shape.y = 180;
                p.shape.x = Math.random() * 720;
            }
            const sheltered = p.shape.x > 120 && p.shape.x < 595 && p.shape.y > 330 && p.shape.y < 715;
            p.shape.setVisible(!sheltered);
        }
    }
}
