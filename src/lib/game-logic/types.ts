export interface GameState {
    currentTime: number;
    currentDay: number;
    currentPeriod: string;
    inventory: InventoryItem[];
    activeQuests: Quest[];
    completedQuests: Quest[];
    relationships: Record<string, number>;
    stats: Record<string, number>;
    characterStats: Record<string, CharacterStatSet>;
    flags: Record<string, boolean>;
    currentLocation: string;
    currentScene: Scene | null;
    gameProgress: number;
    lastSaveTime: string | null;
    playerStatDefinitions: StatDefinition[];
    characterStatDefinitions: StatDefinition[];
    statTemplates: StatTemplate[];
}

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    quantity: number;
    type: string;
    imagePath: string;
    effects?: ItemEffect[];
    usable: boolean;
    stackable: boolean;
}

export interface ItemEffect {
    type: string;
    value: number;
    duration?: number;
    target?: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    objectives: QuestObjective[];
    rewards: QuestReward[];
    status: 'active' | 'completed' | 'failed';
    progress: number;
    timeLimit?: number;
    prerequisites?: string[];
}

export interface QuestObjective {
    id: string;
    description: string;
    type: string;
    target: string | number;
    current: number;
    completed: boolean;
}

export interface QuestReward {
    type: string;
    value: number | string;
}

export interface Scene {
    id: string;
    title: string;
    description: string;
    background: string;
    characters: SceneCharacter[];
    choices: SceneChoice[];
    requirements?: SceneRequirement[];
}

export interface SceneCharacter {
    id: string;
    name: string;
    image: string;
    position: string;
    expression: string;
}

export interface SceneChoice {
    id: string;
    text: string;
    nextScene: string;
    requirements?: SceneRequirement[];
    effects?: ChoiceEffect[];
}

export interface SceneRequirement {
    type: string;
    value: string | number;
    operator: 'equals' | 'greater' | 'less' | 'has' | 'notHas';
}

export interface ChoiceEffect {
    type: string;
    value: number | string;
    target?: string;
}

export interface Dialogue {
    id: string;
    characterId: string;
    text: string;
    choices?: DialogueChoice[];
    nextDialogue?: string;
}

export interface DialogueChoice {
    id: string;
    text: string;
    nextDialogue: string;
    effects?: ChoiceEffect[];
}

export interface Event {
    id: string;
    title: string;
    description: string;
    triggerConditions: EventTrigger[];
    effects: EventEffect[];
    timeBased?: boolean;
    timeRange?: {
        start: number;
        end: number;
    };
}

export interface EventTrigger {
    type: string;
    value: string | number;
    operator: 'equals' | 'greater' | 'less' | 'has' | 'notHas';
}

export interface EventEffect {
    type: string;
    value: number | string;
    target?: string;
}

export interface StatDefinition {
    id: string;
    name: string;
    description: string;
    min: number;
    max: number;
    defaultValue: number;
    category: 'player' | 'character';
    enabled: boolean;
    color?: string;
    icon?: string;
}

export interface StatTemplate {
    id: string;
    name: string;
    description: string;
    category: 'player' | 'character';
    stats: StatDefinition[];
    createdAt: string;
    isDefault?: boolean;
}

export interface CharacterStatSet {
    characterId: string;
    characterName: string;
    stats: Record<string, number>;
    templateId?: string;
} 