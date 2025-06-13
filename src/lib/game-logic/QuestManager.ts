import { GameState, Quest, QuestObjective, QuestReward } from './types';

export class QuestManager {
    private state: GameState;
    private quests: Map<string, Quest>;

    constructor(state: GameState) {
        this.state = state;
        this.quests = new Map();
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    registerQuest(quest: Quest): void {
        this.quests.set(quest.id, quest);
    }

    startQuest(questId: string): void {
        const quest = this.quests.get(questId);
        if (quest && this.checkQuestPrerequisites(quest)) {
            const newQuest: Quest = {
                ...quest,
                status: 'active',
                progress: 0
            };
            this.state.activeQuests.push(newQuest);
        }
    }

    private checkQuestPrerequisites(quest: Quest): boolean {
        if (!quest.prerequisites) return true;
        
        return quest.prerequisites.every(prereqId => {
            const completedQuest = this.state.completedQuests.find(q => q.id === prereqId);
            return completedQuest !== undefined;
        });
    }

    updateProgress(questId: string, progress: number): void {
        const quest = this.state.activeQuests.find(q => q.id === questId);
        if (quest) {
            quest.progress = Math.min(progress, 100);
            this.checkQuestCompletion(quest);
        }
    }

    updateObjective(questId: string, objectiveId: string, progress: number): void {
        const quest = this.state.activeQuests.find(q => q.id === questId);
        if (quest) {
            const objective = quest.objectives.find(o => o.id === objectiveId);
            if (objective) {
                objective.current = progress;
                objective.completed = progress >= (objective.target as number);
                this.updateQuestProgress(quest);
            }
        }
    }

    private updateQuestProgress(quest: Quest): void {
        const totalObjectives = quest.objectives.length;
        const completedObjectives = quest.objectives.filter(o => o.completed).length;
        const progress = (completedObjectives / totalObjectives) * 100;
        this.updateProgress(quest.id, progress);
    }

    private checkQuestCompletion(quest: Quest): void {
        if (quest.progress >= 100) {
            this.completeQuest(quest.id);
        }
    }

    completeQuest(questId: string): void {
        const questIndex = this.state.activeQuests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            const quest = this.state.activeQuests[questIndex];
            quest.status = 'completed';
            this.state.activeQuests.splice(questIndex, 1);
            this.state.completedQuests.push(quest);
            this.applyQuestRewards(quest);
        }
    }

    private applyQuestRewards(quest: Quest): void {
        quest.rewards.forEach(reward => {
            switch (reward.type) {
                case 'item':
                    if (typeof reward.value === 'string') {
                        this.state.inventory.push({
                            id: reward.value,
                            name: `Item ${reward.value}`,
                            description: `Description for item ${reward.value}`,
                            quantity: 1,
                            type: 'misc',
                            imagePath: `/assets/items/${reward.value}.png`,
                            usable: false,
                            stackable: true
                        });
                    }
                    break;
                case 'stat':
                    if (typeof reward.value === 'number') {
                        this.state.stats[quest.id] = (this.state.stats[quest.id] || 0) + reward.value;
                    }
                    break;
                case 'relationship':
                    if (typeof reward.value === 'number') {
                        this.state.relationships[quest.id] = (this.state.relationships[quest.id] || 0) + reward.value;
                    }
                    break;
            }
        });
    }

    getActiveQuests(): Quest[] {
        return this.state.activeQuests;
    }

    getCompletedQuests(): Quest[] {
        return this.state.completedQuests;
    }

    getQuest(questId: string): Quest | undefined {
        return this.quests.get(questId);
    }

    isQuestActive(questId: string): boolean {
        return this.state.activeQuests.some(q => q.id === questId);
    }

    isQuestCompleted(questId: string): boolean {
        return this.state.completedQuests.some(q => q.id === questId);
    }
} 