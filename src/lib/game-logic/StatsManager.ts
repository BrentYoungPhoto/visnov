import { GameState } from './types';

export class StatsManager {
    private state: GameState;
    private readonly STAT_LIMITS: Record<string, { min: number; max: number }> = {
        'health': { min: 0, max: 100 },
        'energy': { min: 0, max: 100 },
        'happiness': { min: 0, max: 100 },
        'intelligence': { min: 0, max: 100 },
        'strength': { min: 0, max: 100 },
        'charisma': { min: 0, max: 100 }
    };

    constructor(state: GameState) {
        this.state = state;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    updateStat(statId: string, value: number): void {
        const limits = this.STAT_LIMITS[statId] || { min: -Infinity, max: Infinity };
        const currentValue = this.state.stats[statId] || 0;
        this.state.stats[statId] = Math.max(limits.min, Math.min(limits.max, currentValue + value));
    }

    setStat(statId: string, value: number): void {
        const limits = this.STAT_LIMITS[statId] || { min: -Infinity, max: Infinity };
        this.state.stats[statId] = Math.max(limits.min, Math.min(limits.max, value));
    }

    getStat(statId: string): number {
        return this.state.stats[statId] || 0;
    }

    getStatPercentage(statId: string): number {
        const value = this.getStat(statId);
        const limits = this.STAT_LIMITS[statId];
        if (!limits) return 0;
        return ((value - limits.min) / (limits.max - limits.min)) * 100;
    }

    getStatDescription(statId: string): string {
        const value = this.getStat(statId);
        const percentage = this.getStatPercentage(statId);
        
        if (percentage >= 90) return 'Excellent';
        if (percentage >= 75) return 'Very Good';
        if (percentage >= 60) return 'Good';
        if (percentage >= 40) return 'Average';
        if (percentage >= 25) return 'Below Average';
        if (percentage >= 10) return 'Poor';
        return 'Critical';
    }

    getStatChanges(statId: string, value: number): {
        newValue: number;
        newPercentage: number;
        description: string;
    } {
        const currentValue = this.getStat(statId);
        const limits = this.STAT_LIMITS[statId] || { min: -Infinity, max: Infinity };
        const newValue = Math.max(limits.min, Math.min(limits.max, currentValue + value));
        const newPercentage = ((newValue - limits.min) / (limits.max - limits.min)) * 100;
        
        return {
            newValue,
            newPercentage,
            description: this.getStatDescription(statId)
        };
    }

    getAllStats(): Record<string, number> {
        return { ...this.state.stats };
    }

    getStatsByRange(min: number, max: number): Record<string, number> {
        return Object.entries(this.state.stats)
            .filter(([_, value]) => value >= min && value <= max)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }

    getStatsByDescription(description: string): Record<string, number> {
        return Object.entries(this.state.stats)
            .filter(([key, _]) => this.getStatDescription(key) === description)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }

    resetStat(statId: string): void {
        const limits = this.STAT_LIMITS[statId];
        if (limits) {
            this.state.stats[statId] = limits.min;
        }
    }

    resetAllStats(): void {
        Object.keys(this.STAT_LIMITS).forEach(statId => {
            this.resetStat(statId);
        });
    }
} 