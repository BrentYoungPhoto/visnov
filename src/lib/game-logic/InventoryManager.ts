import { GameState, InventoryItem, ItemEffect } from './types';

export class InventoryManager {
    private state: GameState;
    private readonly ASSETS_PATH = '/assets/items/';

    constructor(state: GameState) {
        this.state = state;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    addItem(itemId: string, quantity: number = 1): void {
        const existingItem = this.state.inventory.find(item => item.id === itemId);
        
        if (existingItem && existingItem.stackable) {
            existingItem.quantity += quantity;
        } else {
            // In a real implementation, you would load the item data from a database or configuration
            const newItem: InventoryItem = {
                id: itemId,
                name: `Item ${itemId}`, // This would come from your item database
                description: `Description for item ${itemId}`, // This would come from your item database
                quantity: quantity,
                type: 'misc', // This would come from your item database
                imagePath: `${this.ASSETS_PATH}${itemId}.png`, // Assuming PNG format
                usable: false, // This would come from your item database
                stackable: true // This would come from your item database
            };
            this.state.inventory.push(newItem);
        }
    }

    removeItem(itemId: string, quantity: number = 1): void {
        const itemIndex = this.state.inventory.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const item = this.state.inventory[itemIndex];
            item.quantity -= quantity;
            
            if (item.quantity <= 0) {
                this.state.inventory.splice(itemIndex, 1);
            }
        }
    }

    useItem(itemId: string): void {
        const item = this.state.inventory.find(item => item.id === itemId);
        
        if (item && item.usable) {
            // Apply item effects
            if (item.effects) {
                this.applyItemEffects(item.effects);
            }
            
            // Remove one of the item if it's not stackable or if it's consumed on use
            if (!item.stackable) {
                this.removeItem(itemId, 1);
            }
        }
    }

    private applyItemEffects(effects: ItemEffect[]): void {
        effects.forEach(effect => {
            switch (effect.type) {
                case 'stat':
                    // Apply stat effect
                    if (effect.target) {
                        const currentValue = this.state.stats[effect.target] || 0;
                        this.state.stats[effect.target] = currentValue + effect.value;
                    }
                    break;
                case 'relationship':
                    // Apply relationship effect
                    if (effect.target) {
                        const currentValue = this.state.relationships[effect.target] || 0;
                        this.state.relationships[effect.target] = currentValue + effect.value;
                    }
                    break;
                // Add more effect types as needed
            }
        });
    }

    getItem(itemId: string): InventoryItem | undefined {
        return this.state.inventory.find(item => item.id === itemId);
    }

    getItemQuantity(itemId: string): number {
        const item = this.getItem(itemId);
        return item ? item.quantity : 0;
    }

    hasItem(itemId: string, quantity: number = 1): boolean {
        const item = this.getItem(itemId);
        return item ? item.quantity >= quantity : false;
    }

    getInventory(): InventoryItem[] {
        return this.state.inventory;
    }

    getItemImagePath(itemId: string): string {
        return `${this.ASSETS_PATH}${itemId}.png`;
    }

    clearInventory(): void {
        this.state.inventory = [];
    }
} 