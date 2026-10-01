import type { SaveData } from '../types/SaveData';
import type { Quality } from '../types/Recipe';
import { CookingManager } from './CookingManager';
import { DialogueManager } from './DialogueManager';
import { SaveManager } from './SaveManager';
import { customerById } from '../data/customers';
export class ProgressionManager {
    static serve(s: SaveData, id: string, q: Quality, extra: string) { const c = customerById(id), p = s.customers[id], r = s.activeNight!.report; const reward = CookingManager.reward(q); const favorite = p.preferenceFound && extra === c.favoriteIngredients[0]; const gain = reward.intimacy + (favorite ? 2 : 0) + (s.upgrades.chair ? 1 : 0); p.unlocked = true; p.visitCount++; p.intimacy += gain; s.gold += reward.gold; r.gold += reward.gold; r.perfect += q === '완벽' ? 1 : 0; r.intimacy[id] = (r.intimacy[id] || 0) + gain; r.served++; const stories = DialogueManager.unlock(id, p); if (stories.length)
        r.discoveries.push(c.name + (p.storyStage === 1 ? '의 취향 발견' : '의 이야기 ' + p.storyStage)); s.level = 1 + Math.floor(Object.values(s.customers).reduce((n, p) => n + p.visitCount, 0) / 10); SaveManager.save(s); return { gold: reward.gold, intimacy: gain, favorite, stories }; }
}
