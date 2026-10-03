import { festivalStages } from '../data/festival';
import { customers, customerById } from '../data/customers';
import { recipes } from '../data/recipes';
import type { SaveData } from '../types/SaveData';
export interface FestivalState {
    stage: keyof typeof festivalStages;
    foodMeals: number; recipes: string[]; invited: string[]; decorated: boolean;
    stageNight: number; celebrationNight: number; lastClosedNight: number;
    lastMeal?: { night: number; ticket: number };
    finaleLine: number; completedNight: number;
}
export class FestivalManager {
    static ensure(s: SaveData) {
        if(!s.festival && s.night>=5)s.festival={stage:'food',foodMeals:0,recipes:[],invited:[],decorated:false,stageNight:s.night,celebrationNight:0,lastClosedNight:0,finaleLine:0,completedNight:0};
        return s.festival;
    }
    static restore(value: unknown): FestivalState | undefined {
        if(!value || typeof value!=='object')return undefined;const v=value as Partial<FestivalState>;
        if(!v.stage || !Object.hasOwn(festivalStages,v.stage))return undefined;
        const n=(x: unknown)=>typeof x==='number' && Number.isSafeInteger(x) && x>=0 ? x : 0;
        const f:FestivalState={stage:v.stage,foodMeals:Math.min(4,n(v.foodMeals)),recipes:[...new Set(Array.isArray(v.recipes)?v.recipes.filter(id=>recipes.some(r=>r.id===id)):[])],invited:[...new Set(Array.isArray(v.invited)?v.invited.filter(id=>customers.some(c=>c.id===id)):[])].slice(0,3),decorated:v.decorated===true,stageNight:n(v.stageNight),celebrationNight:n(v.celebrationNight),lastClosedNight:n(v.lastClosedNight),finaleLine:Math.min(4,n(v.finaleLine)),completedNight:n(v.completedNight)};
        if(v.lastMeal && n(v.lastMeal.night)>0 && Number.isSafeInteger(v.lastMeal.ticket) && v.lastMeal.ticket>=0)f.lastMeal={night:v.lastMeal.night,ticket:v.lastMeal.ticket};
        if(['ready','celebrating','complete'].includes(f.stage) && (f.invited.length<3 || !f.decorated))return undefined;
        if(f.stage==='complete' && f.completedNight<1)return undefined;
        return f;
    }
    static record(s: SaveData,id: string,meal?: { recipeId: string; score: number }) {
        const f=this.ensure(s), n=s.activeNight;if(!f || f.stage!=='food' || !n || n.queue[n.report.served]!==id || !meal || !s.unlockedRecipes.includes(meal.recipeId) || !recipes.some(r=>r.id===meal.recipeId) || !Number.isFinite(meal.score) || meal.score<75 || meal.score>100)return;
        if(f.lastMeal?.night===s.night && f.lastMeal.ticket===n.report.served)return;
        f.lastMeal={night:s.night,ticket:n.report.served};f.foodMeals=Math.min(4,f.foodMeals+1);
        if(!f.recipes.includes(meal.recipeId))f.recipes.push(meal.recipeId);
    }
    static invite(s: SaveData,id: string) {
        const f=this.ensure(s),p=s.customers[id];
        if(!f || f.stage!=='invite' || !p?.unlocked || p.intimacy<4 || f.invited.includes(id) || f.invited.length>=3)return false;
        f.invited.push(id);return true;
    }
    static decorate(s: SaveData) {
        const f=this.ensure(s);if(!f || f.stage!=='decorate' || f.decorated || s.gold<40)return false;
        s.gold-=40;f.decorated=true;return true;
    }
    static openNight(s: SaveData,queue: string[]) {
        const f=this.ensure(s);if(!f || f.stage!=='ready' || s.night<f.celebrationNight)return false;
        for(const id of f.invited)if(!queue.includes(id)) { const index=queue.map(id=>customerById(id)?.role==='ambient').lastIndexOf(true);if(index<0)queue.push(id);else queue[index]=id; }
        f.stage='celebrating';return true;
    }
    static closeNight(s: SaveData) {
        const f=this.ensure(s),n=s.activeNight;
        if(!f || !n || n.report.served!==n.queue.length || f.lastClosedNight>=s.night)return;
        f.lastClosedNight=s.night;
        if(f.stage==='food' && f.foodMeals>=4 && f.recipes.length>=2)f.stage='invite';
        else if(f.stage==='invite' && f.invited.length===3)f.stage='decorate';
        else if(f.stage==='decorate' && f.decorated){f.stage='ready';f.celebrationNight=s.night+1;}
        else return;
        f.stageNight=s.night+1;n.report.discoveries.push('골목 축제 준비 · ' + festivalStages[f.stage]);
    }
    static complete(s: SaveData) {
        const f=s.festival,n=s.activeNight;if(!f || f.stage!=='celebrating' || !n?.festivalNight || n.report.served!==n.queue.length)return false;
        f.stage='complete';f.completedNight=s.night;s.gold+=100;n.report.gold+=100;n.report.discoveries.push('골목 축제 완료 · +100 G · 기념 깃발 · 추억 앨범');return true;
    }
}
