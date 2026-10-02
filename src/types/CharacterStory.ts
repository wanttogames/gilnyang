export type StoryEmotion = 'normal' | 'shy' | 'quiet' | 'smile';
export type StoryPart = 'before' | 'after';
export interface StoryLine { speaker: 'guest' | 'chef'; text: string; emotion?: StoryEmotion; pause?: number; gaze?: 'chair' | 'pot' | 'street' }
export interface CharacterStoryEvent {
    id: string;
    title: string;
    minVisits: number;
    minIntimacy: number;
    visitsSincePrevious: number;
    before: StoryLine[];
    after: StoryLine[];
    summary: string;
    revealsPreference?: boolean;
    requiredRecipe?: string;
    preferRain?: { fallbackVisits: number };
    serving?: 'two-eggs';
    arrival?: { item?: 'button' | 'cap' | 'stone'; quiet?: boolean };
}
export interface CharacterStoryProgress {
    stage: number;
    lastEventVisit: number;
    lastEventNight: number;
    pending?: { eventId: string; visit: number; night: number; part: StoryPart; line: number };
}
