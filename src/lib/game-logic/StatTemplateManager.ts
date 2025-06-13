import { GameState, StatDefinition, StatTemplate, CharacterStatSet } from './types';

export class StatTemplateManager {
    private state: GameState;
    private readonly TEMPLATE_STORAGE_KEY = 'stat_templates';

    constructor(state: GameState) {
        this.state = state;
        this.initializeDefaultStats();
        this.loadTemplatesFromStorage();
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    private initializeDefaultStats(): void {
        if (!this.state.playerStatDefinitions) {
            this.state.playerStatDefinitions = [
                {
                    id: 'health',
                    name: 'Health',
                    description: 'Player physical health',
                    min: 0,
                    max: 100,
                    defaultValue: 100,
                    category: 'player',
                    enabled: true,
                    color: '#ff4444',
                    icon: '❤️'
                },
                {
                    id: 'energy',
                    name: 'Energy',
                    description: 'Player energy level',
                    min: 0,
                    max: 100,
                    defaultValue: 100,
                    category: 'player',
                    enabled: true,
                    color: '#44ff44',
                    icon: '⚡'
                },
                {
                    id: 'happiness',
                    name: 'Happiness',
                    description: 'Player mood and happiness',
                    min: 0,
                    max: 100,
                    defaultValue: 50,
                    category: 'player',
                    enabled: true,
                    color: '#ffff44',
                    icon: '😊'
                }
            ];
        }

        if (!this.state.characterStatDefinitions) {
            this.state.characterStatDefinitions = [
                {
                    id: 'relationship',
                    name: 'Relationship',
                    description: 'Relationship level with character',
                    min: -100,
                    max: 100,
                    defaultValue: 0,
                    category: 'character',
                    enabled: true,
                    color: '#ff69b4',
                    icon: '💕'
                },
                {
                    id: 'trust',
                    name: 'Trust',
                    description: 'How much the character trusts the player',
                    min: 0,
                    max: 100,
                    defaultValue: 50,
                    category: 'character',
                    enabled: true,
                    color: '#4169e1',
                    icon: '🤝'
                }
            ];
        }

        if (!this.state.characterStats) {
            this.state.characterStats = {};
        }

        if (!this.state.statTemplates) {
            this.state.statTemplates = [];
        }
    }

    // Player Stat Management
    addPlayerStat(stat: Omit<StatDefinition, 'category'>): void {
        const newStat: StatDefinition = {
            ...stat,
            category: 'player',
            id: stat.id || this.generateStatId(stat.name)
        };
        
        this.state.playerStatDefinitions.push(newStat);
        
        // Initialize the stat value if enabled
        if (newStat.enabled) {
            this.state.stats[newStat.id] = newStat.defaultValue;
        }
    }

    updatePlayerStat(statId: string, updates: Partial<StatDefinition>): void {
        const statIndex = this.state.playerStatDefinitions.findIndex(s => s.id === statId);
        if (statIndex !== -1) {
            const oldStat = this.state.playerStatDefinitions[statIndex];
            this.state.playerStatDefinitions[statIndex] = { ...oldStat, ...updates };
            
            // Handle enable/disable
            if (updates.enabled !== undefined) {
                if (updates.enabled && !(statId in this.state.stats)) {
                    this.state.stats[statId] = this.state.playerStatDefinitions[statIndex].defaultValue;
                } else if (!updates.enabled && statId in this.state.stats) {
                    delete this.state.stats[statId];
                }
            }
        }
    }

    removePlayerStat(statId: string): void {
        this.state.playerStatDefinitions = this.state.playerStatDefinitions.filter(s => s.id !== statId);
        delete this.state.stats[statId];
    }

    togglePlayerStat(statId: string): void {
        const stat = this.state.playerStatDefinitions.find(s => s.id === statId);
        if (stat) {
            stat.enabled = !stat.enabled;
            
            if (stat.enabled) {
                this.state.stats[statId] = stat.defaultValue;
            } else {
                delete this.state.stats[statId];
            }
        }
    }

    // Character Stat Management
    addCharacterStat(stat: Omit<StatDefinition, 'category'>): void {
        const newStat: StatDefinition = {
            ...stat,
            category: 'character',
            id: stat.id || this.generateStatId(stat.name)
        };
        
        this.state.characterStatDefinitions.push(newStat);
        
        // Initialize for existing characters if enabled
        if (newStat.enabled) {
            Object.values(this.state.characterStats).forEach(charStats => {
                charStats.stats[newStat.id] = newStat.defaultValue;
            });
        }
    }

    updateCharacterStat(statId: string, updates: Partial<StatDefinition>): void {
        const statIndex = this.state.characterStatDefinitions.findIndex(s => s.id === statId);
        if (statIndex !== -1) {
            const oldStat = this.state.characterStatDefinitions[statIndex];
            this.state.characterStatDefinitions[statIndex] = { ...oldStat, ...updates };
            
            // Handle enable/disable for all characters
            if (updates.enabled !== undefined) {
                Object.values(this.state.characterStats).forEach(charStats => {
                    if (updates.enabled && !(statId in charStats.stats)) {
                        charStats.stats[statId] = this.state.characterStatDefinitions[statIndex].defaultValue;
                    } else if (!updates.enabled && statId in charStats.stats) {
                        delete charStats.stats[statId];
                    }
                });
            }
        }
    }

    removeCharacterStat(statId: string): void {
        this.state.characterStatDefinitions = this.state.characterStatDefinitions.filter(s => s.id !== statId);
        
        // Remove from all characters
        Object.values(this.state.characterStats).forEach(charStats => {
            delete charStats.stats[statId];
        });
    }

    toggleCharacterStat(statId: string): void {
        const stat = this.state.characterStatDefinitions.find(s => s.id === statId);
        if (stat) {
            stat.enabled = !stat.enabled;
            
            Object.values(this.state.characterStats).forEach(charStats => {
                if (stat.enabled) {
                    charStats.stats[statId] = stat.defaultValue;
                } else {
                    delete charStats.stats[statId];
                }
            });
        }
    }

    // Character Management
    addCharacter(characterId: string, characterName: string, templateId?: string): void {
        const characterStats: CharacterStatSet = {
            characterId,
            characterName,
            stats: {},
            templateId
        };

        if (templateId) {
            this.applyTemplateToCharacter(characterId, templateId);
        } else {
            // Initialize with default values for enabled stats
            this.state.characterStatDefinitions
                .filter(stat => stat.enabled)
                .forEach(stat => {
                    characterStats.stats[stat.id] = stat.defaultValue;
                });
        }

        this.state.characterStats[characterId] = characterStats;
    }

    removeCharacter(characterId: string): void {
        delete this.state.characterStats[characterId];
    }

    // Template Management
    createTemplate(name: string, description: string, category: 'player' | 'character', statIds: string[]): string {
        const templateId = this.generateTemplateId(name);
        const sourceStats = category === 'player' ? this.state.playerStatDefinitions : this.state.characterStatDefinitions;
        
        const template: StatTemplate = {
            id: templateId,
            name,
            description,
            category,
            stats: sourceStats.filter(stat => statIds.includes(stat.id)).map(stat => ({ ...stat })),
            createdAt: new Date().toISOString()
        };

        this.state.statTemplates.push(template);
        this.saveTemplatesToStorage();
        return templateId;
    }

    applyTemplateToCharacter(characterId: string, templateId: string): void {
        const template = this.state.statTemplates.find(t => t.id === templateId && t.category === 'character');
        if (!template) return;

        const characterStats = this.state.characterStats[characterId];
        if (!characterStats) return;

        characterStats.templateId = templateId;
        characterStats.stats = {};

        template.stats.forEach(stat => {
            if (stat.enabled) {
                characterStats.stats[stat.id] = stat.defaultValue;
            }
        });
    }

    applyTemplateToPlayer(templateId: string): void {
        const template = this.state.statTemplates.find(t => t.id === templateId && t.category === 'player');
        if (!template) return;

        // Clear current player stats
        this.state.playerStatDefinitions.forEach(stat => {
            delete this.state.stats[stat.id];
        });

        // Replace player stat definitions
        this.state.playerStatDefinitions = template.stats.map(stat => ({ ...stat }));

        // Initialize enabled stats
        this.state.playerStatDefinitions
            .filter(stat => stat.enabled)
            .forEach(stat => {
                this.state.stats[stat.id] = stat.defaultValue;
            });
    }

    deleteTemplate(templateId: string): void {
        this.state.statTemplates = this.state.statTemplates.filter(t => t.id !== templateId);
        this.saveTemplatesToStorage();
    }

    duplicateTemplate(templateId: string, newName: string): string {
        const template = this.state.statTemplates.find(t => t.id === templateId);
        if (!template) return '';

        const newTemplateId = this.generateTemplateId(newName);
        const newTemplate: StatTemplate = {
            ...template,
            id: newTemplateId,
            name: newName,
            createdAt: new Date().toISOString()
        };

        this.state.statTemplates.push(newTemplate);
        this.saveTemplatesToStorage();
        return newTemplateId;
    }

    // Getters
    getPlayerStats(): StatDefinition[] {
        return this.state.playerStatDefinitions;
    }

    getCharacterStats(): StatDefinition[] {
        return this.state.characterStatDefinitions;
    }

    getEnabledPlayerStats(): StatDefinition[] {
        return this.state.playerStatDefinitions.filter(stat => stat.enabled);
    }

    getEnabledCharacterStats(): StatDefinition[] {
        return this.state.characterStatDefinitions.filter(stat => stat.enabled);
    }

    getTemplates(category?: 'player' | 'character'): StatTemplate[] {
        if (category) {
            return this.state.statTemplates.filter(t => t.category === category);
        }
        return this.state.statTemplates;
    }

    getTemplate(templateId: string): StatTemplate | undefined {
        return this.state.statTemplates.find(t => t.id === templateId);
    }

    getCharacterStatSet(characterId: string): CharacterStatSet | undefined {
        return this.state.characterStats[characterId];
    }

    getAllCharacters(): CharacterStatSet[] {
        return Object.values(this.state.characterStats);
    }

    // Utility methods
    private generateStatId(name: string): string {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    }

    private generateTemplateId(name: string): string {
        return 'template_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    }

    private saveTemplatesToStorage(): void {
        try {
            localStorage.setItem(this.TEMPLATE_STORAGE_KEY, JSON.stringify(this.state.statTemplates));
        } catch (error) {
            console.error('Failed to save templates to storage:', error);
        }
    }

    private loadTemplatesFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.TEMPLATE_STORAGE_KEY);
            if (stored) {
                const templates = JSON.parse(stored);
                this.state.statTemplates = [...this.state.statTemplates, ...templates];
            }
        } catch (error) {
            console.error('Failed to load templates from storage:', error);
        }
    }
} 