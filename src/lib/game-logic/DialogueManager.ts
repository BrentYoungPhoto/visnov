import { GameState, Dialogue, DialogueChoice, ChoiceEffect } from './types';

export class DialogueManager {
    private state: GameState;
    private dialogues: Map<string, Dialogue>;
    private currentDialogue: Dialogue | null;

    constructor(state: GameState) {
        this.state = state;
        this.dialogues = new Map();
        this.currentDialogue = null;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    registerDialogue(dialogue: Dialogue): void {
        this.dialogues.set(dialogue.id, dialogue);
    }

    startDialogue(dialogueId: string): void {
        const dialogue = this.dialogues.get(dialogueId);
        if (dialogue) {
            this.currentDialogue = dialogue;
        }
    }

    makeChoice(choiceId: string): void {
        if (!this.currentDialogue) return;

        const choice = this.currentDialogue.choices?.find(c => c.id === choiceId);
        if (choice) {
            this.applyChoiceEffects(choice.effects || []);
            if (choice.nextDialogue) {
                this.startDialogue(choice.nextDialogue);
            } else {
                this.currentDialogue = null;
            }
        }
    }

    private applyChoiceEffects(effects: ChoiceEffect[]): void {
        effects.forEach(effect => {
            switch (effect.type) {
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
            }
        });
    }

    getCurrentDialogue(): Dialogue | null {
        return this.currentDialogue;
    }

    getDialogueChoices(): DialogueChoice[] {
        return this.currentDialogue?.choices || [];
    }

    endDialogue(): void {
        this.currentDialogue = null;
    }

    isDialogueActive(): boolean {
        return this.currentDialogue !== null;
    }
} 