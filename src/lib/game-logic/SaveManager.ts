import { GameState } from './types';

export class SaveManager {
    private state: GameState;
    private readonly SAVE_KEY_PREFIX = 'game_save_';
    private readonly MAX_SAVE_SLOTS = 10;

    constructor(state: GameState) {
        this.state = state;
    }

    updateState(newState: GameState): void {
        this.state = newState;
    }

    saveGame(slot: number): void {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        const saveData = {
            state: this.state,
            timestamp: new Date().toISOString(),
            version: '1.0.0' // Add version for future compatibility
        };

        try {
            localStorage.setItem(
                `${this.SAVE_KEY_PREFIX}${slot}`,
                JSON.stringify(saveData)
            );
            this.state.lastSaveTime = saveData.timestamp;
        } catch (error) {
            console.error('Failed to save game:', error);
            throw new Error('Failed to save game. Please check your browser\'s storage settings.');
        }
    }

    loadGame(slot: number): GameState | null {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        try {
            const saveData = localStorage.getItem(`${this.SAVE_KEY_PREFIX}${slot}`);
            if (!saveData) {
                return null;
            }

            const parsedData = JSON.parse(saveData);
            
            // Version check for future compatibility
            if (parsedData.version !== '1.0.0') {
                console.warn('Save file version mismatch. Some features may not work correctly.');
            }

            return parsedData.state;
        } catch (error) {
            console.error('Failed to load game:', error);
            throw new Error('Failed to load game. The save file may be corrupted.');
        }
    }

    deleteSave(slot: number): void {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        try {
            localStorage.removeItem(`${this.SAVE_KEY_PREFIX}${slot}`);
        } catch (error) {
            console.error('Failed to delete save:', error);
            throw new Error('Failed to delete save file.');
        }
    }

    getSaveInfo(slot: number): {
        exists: boolean;
        timestamp: string | null;
        gameProgress: number;
    } {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        try {
            const saveData = localStorage.getItem(`${this.SAVE_KEY_PREFIX}${slot}`);
            if (!saveData) {
                return {
                    exists: false,
                    timestamp: null,
                    gameProgress: 0
                };
            }

            const parsedData = JSON.parse(saveData);
            return {
                exists: true,
                timestamp: parsedData.timestamp,
                gameProgress: parsedData.state.gameProgress
            };
        } catch (error) {
            console.error('Failed to get save info:', error);
            return {
                exists: false,
                timestamp: null,
                gameProgress: 0
            };
        }
    }

    getAllSaveInfo(): Array<{
        slot: number;
        exists: boolean;
        timestamp: string | null;
        gameProgress: number;
    }> {
        const saveInfo = [];
        for (let slot = 0; slot < this.MAX_SAVE_SLOTS; slot++) {
            saveInfo.push({
                slot,
                ...this.getSaveInfo(slot)
            });
        }
        return saveInfo;
    }

    clearAllSaves(): void {
        try {
            for (let slot = 0; slot < this.MAX_SAVE_SLOTS; slot++) {
                localStorage.removeItem(`${this.SAVE_KEY_PREFIX}${slot}`);
            }
        } catch (error) {
            console.error('Failed to clear saves:', error);
            throw new Error('Failed to clear save files.');
        }
    }

    exportSave(slot: number): string {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        try {
            const saveData = localStorage.getItem(`${this.SAVE_KEY_PREFIX}${slot}`);
            if (!saveData) {
                throw new Error('No save data found in the specified slot.');
            }
            return saveData;
        } catch (error) {
            console.error('Failed to export save:', error);
            throw new Error('Failed to export save file.');
        }
    }

    importSave(slot: number, saveData: string): void {
        if (slot < 0 || slot >= this.MAX_SAVE_SLOTS) {
            throw new Error(`Invalid save slot. Must be between 0 and ${this.MAX_SAVE_SLOTS - 1}`);
        }

        try {
            const parsedData = JSON.parse(saveData);
            if (!parsedData.state || !parsedData.timestamp || !parsedData.version) {
                throw new Error('Invalid save data format.');
            }

            localStorage.setItem(`${this.SAVE_KEY_PREFIX}${slot}`, saveData);
        } catch (error) {
            console.error('Failed to import save:', error);
            throw new Error('Failed to import save file. The data may be corrupted or in an invalid format.');
        }
    }
} 