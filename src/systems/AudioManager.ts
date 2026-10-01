import type { Weather } from '../types/Weather';
class AudioManager {
    private ctx?: AudioContext;
    private loop?: number;
    private rain?: AudioBufferSourceNode;
    private rainGain?: GainNode;
    private soundEnabled = true;
    private weather: Weather = 'clear';
    constructor() {
        document.addEventListener('visibilitychange', () => this.updateRain());
        document.addEventListener('pointerdown', () => this.unlock(), { once: true });
        document.addEventListener('keydown', () => this.unlock(), { once: true });
    }
    get enabled() { return this.soundEnabled; }
    set enabled(value: boolean) { this.soundEnabled = value; this.updateRain(); }
    setWeather(weather: Weather) { this.weather = weather; this.updateRain(); }
    unlock() {
        if (!this.ctx)
            this.ctx = new AudioContext();
        void this.ctx.resume();
        this.updateRain();
        if (!this.loop)
            this.loop = window.setInterval(() => { if (this.enabled && document.visibilityState === 'visible')
                this.note([196, 220, 261.6, 293.7, 329.6][Math.floor(Math.random() * 5)], 1.5, 0.013); }, 2400);
    }
    private updateRain() {
        if (!this.ctx)
            return;
        if (!this.rain && this.weather === 'rain') {
            const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate), samples = buffer.getChannelData(0);
            for (let i = 0; i < samples.length; i++)
                samples[i] = Math.random() * 2 - 1;
            this.rain = this.ctx.createBufferSource();
            this.rain.buffer = buffer;
            this.rain.loop = true;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1800;
            this.rainGain = this.ctx.createGain();
            this.rainGain.gain.value = 0;
            this.rain.connect(filter);
            filter.connect(this.rainGain);
            this.rainGain.connect(this.ctx.destination);
            this.rain.start();
        }
        this.rainGain?.gain.setTargetAtTime(this.enabled && this.weather === 'rain' && document.visibilityState === 'visible' ? 0.035 : 0, this.ctx.currentTime, 0.2);
    }
    note(freq = 440, duration = 0.15, volume = 0.04) {
        if (!this.enabled || !this.ctx)
            return;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(volume, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start();
        o.stop(this.ctx.currentTime + duration);
    }
    success() { this.note(523); setTimeout(() => this.note(659), 100); setTimeout(() => this.note(784, 0.3), 200); }
    toggle() { this.enabled = !this.enabled; return this.enabled; }
}
export const audio = new AudioManager();
