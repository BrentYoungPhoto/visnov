import { GameState, Event, EventTrigger, EventEffect } from './types';

export class EventManager {
    private state: GameState;
    private events: Map<string, Event>;
    private activeEvents: Set<string>;

    constructor(state: GameState) {
        this.state = state;
        this.events = new Map();
        this.activeEvents = new Set();
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    registerEvent(event: Event): void {
        this.events.set(event.id, event);
    }

    triggerEvent(eventId: string): void {
        const event = this.events.get(eventId);
        if (event && this.checkEventConditions(event)) {
            this.applyEventEffects(event);
            this.activeEvents.add(eventId);
        }
    }

    checkTimeBasedEvents(): void {
        this.events.forEach(event => {
            if (event.timeBased && event.timeRange) {
                const currentTime = this.state.currentTime;
                if (currentTime >= event.timeRange.start && currentTime <= event.timeRange.end) {
                    this.triggerEvent(event.id);
                }
            }
        });
    }

    private checkEventConditions(event: Event): boolean {
        return event.triggerConditions.every(condition => {
            switch (condition.type) {
                case 'time':
                    return this.checkTimeCondition(condition);
                case 'item':
                    return this.checkItemCondition(condition);
                case 'quest':
                    return this.checkQuestCondition(condition);
                case 'relationship':
                    return this.checkRelationshipCondition(condition);
                case 'stat':
                    return this.checkStatCondition(condition);
                case 'flag':
                    return this.checkFlagCondition(condition);
                default:
                    return false;
            }
        });
    }

    private checkTimeCondition(condition: EventTrigger): boolean {
        const currentTime = this.state.currentTime;
        const value = Number(condition.value);
        switch (condition.operator) {
            case 'equals':
                return currentTime === value;
            case 'greater':
                return currentTime > value;
            case 'less':
                return currentTime < value;
            default:
                return false;
        }
    }

    private checkItemCondition(condition: EventTrigger): boolean {
        const item = this.state.inventory.find(item => item.id === condition.value);
        switch (condition.operator) {
            case 'has':
                return item !== undefined;
            case 'notHas':
                return item === undefined;
            default:
                return false;
        }
    }

    private checkQuestCondition(condition: EventTrigger): boolean {
        const quest = this.state.activeQuests.find(q => q.id === condition.value) ||
                     this.state.completedQuests.find(q => q.id === condition.value);
        switch (condition.operator) {
            case 'has':
                return quest !== undefined;
            case 'notHas':
                return quest === undefined;
            default:
                return false;
        }
    }

    private checkRelationshipCondition(condition: EventTrigger): boolean {
        const relationship = this.state.relationships[condition.value as string] || 0;
        const value = Number(condition.value);
        switch (condition.operator) {
            case 'equals':
                return relationship === value;
            case 'greater':
                return relationship > value;
            case 'less':
                return relationship < value;
            default:
                return false;
        }
    }

    private checkStatCondition(condition: EventTrigger): boolean {
        const stat = this.state.stats[condition.value as string] || 0;
        const value = Number(condition.value);
        switch (condition.operator) {
            case 'equals':
                return stat === value;
            case 'greater':
                return stat > value;
            case 'less':
                return stat < value;
            default:
                return false;
        }
    }

    private checkFlagCondition(condition: EventTrigger): boolean {
        const flag = this.state.flags[condition.value as string] || false;
        const value = Boolean(condition.value);
        switch (condition.operator) {
            case 'equals':
                return flag === value;
            default:
                return false;
        }
    }

    private applyEventEffects(event: Event): void {
        event.effects.forEach(effect => {
            switch (effect.type) {
                case 'addItem':
                    if (typeof effect.value === 'string') {
                        this.state.inventory.push({
                            id: effect.value,
                            name: `Item ${effect.value}`,
                            description: `Description for item ${effect.value}`,
                            quantity: 1,
                            type: 'misc',
                            imagePath: `/assets/items/${effect.value}.png`,
                            usable: false,
                            stackable: true
                        });
                    }
                    break;
                case 'updateStat':
                    if (effect.target && typeof effect.value === 'number') {
                        this.state.stats[effect.target] = (this.state.stats[effect.target] || 0) + effect.value;
                    }
                    break;
                case 'updateRelationship':
                    if (effect.target && typeof effect.value === 'number') {
                        this.state.relationships[effect.target] = (this.state.relationships[effect.target] || 0) + effect.value;
                    }
                    break;
                case 'setFlag':
                    if (typeof effect.value === 'string') {
                        this.state.flags[effect.value] = true;
                    }
                    break;
                case 'clearFlag':
                    if (typeof effect.value === 'string') {
                        this.state.flags[effect.value] = false;
                    }
                    break;
            }
        });
    }

    isEventActive(eventId: string): boolean {
        return this.activeEvents.has(eventId);
    }

    clearActiveEvents(): void {
        this.activeEvents.clear();
    }
} 