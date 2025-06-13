import { GameState } from './types';

export class RelationshipManager {
    private state: GameState;
    private readonly RELATIONSHIP_LEVELS = {
        'hate': { min: -100, max: -50 },
        'dislike': { min: -49, max: -20 },
        'neutral': { min: -19, max: 19 },
        'like': { min: 20, max: 49 },
        'love': { min: 50, max: 100 }
    };

    constructor(state: GameState) {
        this.state = state;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    updateRelationship(characterId: string, value: number): void {
        const currentValue = this.state.relationships[characterId] || 0;
        this.state.relationships[characterId] = Math.max(-100, Math.min(100, currentValue + value));
    }

    getRelationshipValue(characterId: string): number {
        return this.state.relationships[characterId] || 0;
    }

    getRelationshipLevel(characterId: string): string {
        const value = this.getRelationshipValue(characterId);
        
        for (const [level, range] of Object.entries(this.RELATIONSHIP_LEVELS)) {
            if (value >= range.min && value <= range.max) {
                return level;
            }
        }
        
        return 'neutral';
    }

    getRelationshipDescription(characterId: string): string {
        const level = this.getRelationshipLevel(characterId);
        switch (level) {
            case 'hate':
                return 'They absolutely despise you.';
            case 'dislike':
                return 'They don\'t like you very much.';
            case 'neutral':
                return 'They are neutral towards you.';
            case 'like':
                return 'They like you.';
            case 'love':
                return 'They love you!';
            default:
                return 'Unknown relationship status.';
        }
    }

    getRelationshipProgress(characterId: string): number {
        const value = this.getRelationshipValue(characterId);
        return (value + 100) / 2; // Convert from [-100, 100] to [0, 100]
    }

    getNextLevelProgress(characterId: string): number {
        const currentLevel = this.getRelationshipLevel(characterId);
        const currentValue = this.getRelationshipValue(characterId);
        
        const levels = Object.entries(this.RELATIONSHIP_LEVELS);
        const currentIndex = levels.findIndex(([level]) => level === currentLevel);
        
        if (currentIndex === -1 || currentIndex === levels.length - 1) {
            return 0;
        }
        
        const nextLevel = levels[currentIndex + 1][1];
        const progress = ((currentValue - nextLevel.min) / (nextLevel.max - nextLevel.min)) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    getRelationshipChanges(characterId: string, value: number): {
        newValue: number;
        newLevel: string;
        levelChanged: boolean;
    } {
        const currentValue = this.getRelationshipValue(characterId);
        const currentLevel = this.getRelationshipLevel(characterId);
        
        const newValue = Math.max(-100, Math.min(100, currentValue + value));
        const newLevel = this.getRelationshipLevel(characterId);
        
        return {
            newValue,
            newLevel,
            levelChanged: currentLevel !== newLevel
        };
    }

    getAllRelationships(): Record<string, number> {
        return { ...this.state.relationships };
    }

    getCharactersByLevel(level: string): string[] {
        return Object.entries(this.state.relationships)
            .filter(([_, value]) => this.getRelationshipLevel(_) === level)
            .map(([id]) => id);
    }
} 