import { dialogues } from '../data/dialogues';
import type { CustomerProgress } from '../types/Customer';
export class DialogueManager {
    static unlock(id: string, p: CustomerProgress): string[] { const thresholds = [[5, 10], [10, 25], [15, 50]]; const t = thresholds[p.storyStage]; if (t && p.visitCount >= t[0] && p.intimacy >= t[1]) {
        const lines = dialogues[id].stories[p.storyStage];
        p.storyStage++;
        if (p.storyStage === 1)
            p.preferenceFound = true;
        return lines;
    } return []; }
    static rank(n: number) { return n >= 50 ? '특별한 친구' : n >= 25 ? '친한 손님' : n >= 10 ? '단골' : '낯선 손님'; }
}
