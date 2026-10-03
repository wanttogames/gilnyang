import type { SaveData } from '../types/SaveData';
import { customerById } from '../data/customers';
export interface RainNightEvent { customerId: string; status: 'wet' | 'resting' | 'complete'; shaken: boolean }
export class RainNightManager {
    static current(s: SaveData,id: string) { const v=s.activeNight?.rainEvent; return s.weather==='rain' && v?.customerId===id && v.status!=='complete' ? v : undefined; }
    static reserve(s: SaveData,id: string) {
        if(this.current(s,id))return this.current(s,id);
        if(s.weather!=='rain' || !s.activeNight || s.activeNight.rainEvent || s.customers[id]?.characterStory?.pending)return undefined;
        return s.activeNight.rainEvent={customerId:id,status:'wet',shaken:false};
    }
    static towel(s: SaveData,id: string) { const v=this.current(s,id);if(!v || v.status!=='wet')return false;v.status='resting';return true; }
    static finish(s: SaveData,id: string,recipeId: string) {
        const v=this.current(s,id);if(!v || v.status!=='resting' || s.activeNight?.queue[s.activeNight.report.served]!==id)return undefined;
        v.status='complete';const warm=['oden','ramen','milk'].includes(recipeId);
        s.activeNight.report.discoveries.push('비 오는 밤 · ' + customerById(id).name + '에게 수건과 한 끼를 건넸어요');
        return warm ? (id==='donggu' ? '누나가 비 맞고 돌아오면 이렇게 닦아 줬어요. 이제 귀 끝까지 따뜻해졌어요.' : id==='kkamang' ? '…털도 말랐고, 속도 따뜻해졌어. 비가 조금 더 와도 괜찮겠네.' : '따뜻한 한 끼를 먹으니 젖었던 귀 끝까지 녹는 것 같아요. 비를 피할 곳이 있어서 다행이에요.') : '수건으로 닦고 여기서 쉬니 한결 편해졌어요. 지붕 아래에서 함께 먹는 한 끼가 참 고마워요.';
    }
    static restore(value: unknown): RainNightEvent | undefined {
        if(!value || typeof value!=='object')return undefined;const v=value as RainNightEvent;
        if(!customerById(v.customerId) || !['wet','resting','complete'].includes(v.status))return undefined;
        return {customerId:v.customerId,status:v.status,shaken:v.shaken===true};
    }
}
