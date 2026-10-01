class AudioManager {
    private ctx?: AudioContext;
    private loop?: number;
    enabled = true;
    unlock() { if (!this.ctx)
        this.ctx = new AudioContext(); void this.ctx.resume(); if (!this.loop)
        this.loop = window.setInterval(() => { if (this.enabled && document.visibilityState === 'visible')
            this.note([196, 220, 261.6, 293.7, 329.6][Math.floor(Math.random() * 5)], 1.5, 0.013); }, 2400); }
    note(freq = 440, duration = 0.15, volume = 0.04) { if (!this.enabled || !this.ctx)
        return; const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(volume, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration); o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + duration); }
    success() { this.note(523); setTimeout(() => this.note(659), 100); setTimeout(() => this.note(784, 0.3), 200); }
    toggle() { this.enabled = !this.enabled; return this.enabled; }
}
export const audio = new AudioManager();
