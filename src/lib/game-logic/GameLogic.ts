import { GameState } from './types';
import { TimeManager } from './TimeManager';
import { InventoryManager } from './InventoryManager';
import { EventManager } from './EventManager';
import { DialogueManager } from './DialogueManager';
import { QuestManager } from './QuestManager';
import { RelationshipManager } from './RelationshipManager';
import { StatsManager } from './StatsManager';
import { SaveManager } from './SaveManager';
import { StatTemplateManager } from './StatTemplateManager';

export class GameLogic {
    private state: GameState;
    private timeManager: TimeManager;
    private inventoryManager: InventoryManager;
    private eventManager: EventManager;
    private dialogueManager: DialogueManager;
    private questManager: QuestManager;
    private relationshipManager: RelationshipManager;
    private statsManager: StatsManager;
    private saveManager: SaveManager;
    private statTemplateManager: StatTemplateManager;

    constructor() {
        this.state = {
            currentTime: 0,
            currentDay: 1,
            currentPeriod: 'morning',
            inventory: [],
            activeQuests: [],
            completedQuests: [],
            relationships: {},
            stats: {},
            characterStats: {},
            flags: {},
            currentLocation: 'home',
            currentScene: null,
            gameProgress: 0,
            lastSaveTime: null,
            playerStatDefinitions: [],
            characterStatDefinitions: [],
            statTemplates: []
        };

        this.timeManager = new TimeManager(this.state);
        this.inventoryManager = new InventoryManager(this.state);
        this.eventManager = new EventManager(this.state);
        this.dialogueManager = new DialogueManager(this.state);
        this.questManager = new QuestManager(this.state);
        this.relationshipManager = new RelationshipManager(this.state);
        this.statsManager = new StatsManager(this.state);
        this.saveManager = new SaveManager(this.state);
        this.statTemplateManager = new StatTemplateManager(this.state);
    }

    // Time Management
    advanceTime(hours: number): void {
        this.timeManager.advanceTime(hours);
        this.checkTimeBasedEvents();
    }

    setTimePeriod(period: string): void {
        this.timeManager.setTimePeriod(period);
        this.checkTimeBasedEvents();
    }

    getTimeString(): string {
        return this.timeManager.getTimeString();
    }

    // Inventory Management
    addItem(itemId: string, quantity: number = 1): void {
        this.inventoryManager.addItem(itemId, quantity);
    }

    removeItem(itemId: string, quantity: number = 1): void {
        this.inventoryManager.removeItem(itemId, quantity);
    }

    useItem(itemId: string): void {
        this.inventoryManager.useItem(itemId);
    }

    // Event Management
    triggerEvent(eventId: string): void {
        this.eventManager.triggerEvent(eventId);
    }

    checkTimeBasedEvents(): void {
        this.eventManager.checkTimeBasedEvents();
    }

    // Dialogue Management
    startDialogue(dialogueId: string): void {
        this.dialogueManager.startDialogue(dialogueId);
    }

    makeDialogueChoice(choiceId: string): void {
        this.dialogueManager.makeChoice(choiceId);
    }

    // Quest Management
    startQuest(questId: string): void {
        this.questManager.startQuest(questId);
    }

    completeQuest(questId: string): void {
        this.questManager.completeQuest(questId);
    }

    updateQuestProgress(questId: string, progress: number): void {
        this.questManager.updateProgress(questId, progress);
    }

    // Relationship Management
    updateRelationship(characterId: string, value: number): void {
        this.relationshipManager.updateRelationship(characterId, value);
    }

    getRelationshipLevel(characterId: string): string {
        return this.relationshipManager.getRelationshipLevel(characterId);
    }

    // Stats Management
    updateStat(statId: string, value: number): void {
        this.statsManager.updateStat(statId, value);
    }

    getStat(statId: string): number {
        return this.statsManager.getStat(statId);
    }

    // Save/Load Management
    saveGame(slot: number): void {
        this.saveManager.saveGame(slot);
    }

    loadGame(slot: number): void {
        const savedState = this.saveManager.loadGame(slot);
        if (savedState) {
            this.state = savedState;
            this.updateManagers();
        }
    }

    // Stat Template Management
    getStatTemplateManager(): StatTemplateManager {
        return this.statTemplateManager;
    }

    // Player Stat Management
    addPlayerStat(stat: { id?: string; name: string; description: string; min: number; max: number; defaultValue: number; enabled: boolean; color?: string; icon?: string }): void {
        this.statTemplateManager.addPlayerStat(stat);
    }

    togglePlayerStat(statId: string): void {
        this.statTemplateManager.togglePlayerStat(statId);
    }

    removePlayerStat(statId: string): void {
        this.statTemplateManager.removePlayerStat(statId);
    }

    // Character Stat Management
    addCharacterStat(stat: { id?: string; name: string; description: string; min: number; max: number; defaultValue: number; enabled: boolean; color?: string; icon?: string }): void {
        this.statTemplateManager.addCharacterStat(stat);
    }

    toggleCharacterStat(statId: string): void {
        this.statTemplateManager.toggleCharacterStat(statId);
    }

    removeCharacterStat(statId: string): void {
        this.statTemplateManager.removeCharacterStat(statId);
    }

    // Character Management
    addCharacter(characterId: string, characterName: string, templateId?: string): void {
        this.statTemplateManager.addCharacter(characterId, characterName, templateId);
    }

    removeCharacter(characterId: string): void {
        this.statTemplateManager.removeCharacter(characterId);
    }

    // Template Management
    createStatTemplate(name: string, description: string, category: 'player' | 'character', statIds: string[]): string {
        return this.statTemplateManager.createTemplate(name, description, category, statIds);
    }

    applyTemplateToCharacter(characterId: string, templateId: string): void {
        this.statTemplateManager.applyTemplateToCharacter(characterId, templateId);
    }

    applyTemplateToPlayer(templateId: string): void {
        this.statTemplateManager.applyTemplateToPlayer(templateId);
    }

    deleteStatTemplate(templateId: string): void {
        this.statTemplateManager.deleteTemplate(templateId);
    }

    duplicateStatTemplate(templateId: string, newName: string): string {
        return this.statTemplateManager.duplicateTemplate(templateId, newName);
    }

    // State Management
    private updateManagers(): void {
        this.timeManager.updateState(this.state);
        this.inventoryManager.updateState(this.state);
        this.eventManager.updateState(this.state);
        this.dialogueManager.updateState(this.state);
        this.questManager.updateState(this.state);
        this.relationshipManager.updateState(this.state);
        this.statsManager.updateState(this.state);
        this.statTemplateManager.updateState(this.state);
    }

    // Getters
    getCurrentTime(): number {
        return this.state.currentTime;
    }

    getCurrentDay(): number {
        return this.state.currentDay;
    }

    getCurrentPeriod(): string {
        return this.state.currentPeriod;
    }

    getInventory(): any[] {
        return this.state.inventory;
    }

    getActiveQuests(): any[] {
        return this.state.activeQuests;
    }

    getCompletedQuests(): any[] {
        return this.state.completedQuests;
    }

    getRelationships(): Record<string, number> {
        return this.state.relationships;
    }

    getStats(): Record<string, number> {
        return this.state.stats;
    }

    getFlags(): Record<string, boolean> {
        return this.state.flags;
    }

    getCurrentLocation(): string {
        return this.state.currentLocation;
    }

    getCurrentScene(): any {
        return this.state.currentScene;
    }

    getGameProgress(): number {
        return this.state.gameProgress;
    }

    // New Getters for Custom Stats
    getPlayerStatDefinitions(): any[] {
        return this.statTemplateManager.getPlayerStats();
    }

    getCharacterStatDefinitions(): any[] {
        return this.statTemplateManager.getCharacterStats();
    }

    getEnabledPlayerStats(): any[] {
        return this.statTemplateManager.getEnabledPlayerStats();
    }

    getEnabledCharacterStats(): any[] {
        return this.statTemplateManager.getEnabledCharacterStats();
    }

    getStatTemplates(category?: 'player' | 'character'): any[] {
        return this.statTemplateManager.getTemplates(category);
    }

    getCharacterStatSet(characterId: string): any {
        return this.statTemplateManager.getCharacterStatSet(characterId);
    }

    getAllCharacters(): any[] {
        return this.statTemplateManager.getAllCharacters();
    }
} 