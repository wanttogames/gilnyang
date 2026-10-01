import type { Weather } from '../types/Weather';
export class WeatherManager {
    static roll(night: number, random = Math.random): Weather {
        if (night === 1)
            return 'clear';
        if (night === 2)
            return 'rain';
        if (night === 3)
            return 'snow';
        const value = random();
        return value < 0.5 ? 'clear' : value < 0.85 ? 'rain' : 'snow';
    }
    static valid(value: unknown): value is Weather { return value === 'clear' || value === 'rain' || value === 'snow'; }
}
