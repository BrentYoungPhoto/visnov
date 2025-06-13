import React, { useState, useEffect } from 'react';
import { GameLogic } from '../lib/game-logic/GameLogic';
import { StatManager } from '../components/StatManager';
import { CharacterManager } from '../components/CharacterManager';

export const GameLogicDemo: React.FC = () => {
    const [gameLogic] = useState(() => new GameLogic());
    const [showStatManager, setShowStatManager] = useState(false);
    const [showCharacterManager, setShowCharacterManager] = useState(false);
    const [playerStats, setPlayerStats] = useState<any[]>([]);
    const [characters, setCharacters] = useState<any[]>([]);

    useEffect(() => {
        // Create some example templates
        createExampleTemplates();
        refreshData();
    }, []);

    const createExampleTemplates = () => {
        // Add some custom player stats
        gameLogic.addPlayerStat({
            name: 'Charisma',
            description: 'Your ability to charm and persuade others',
            min: 0,
            max: 100,
            defaultValue: 50,
            enabled: true,
            color: '#ff69b4',
            icon: '✨'
        });

        gameLogic.addPlayerStat({
            name: 'Intelligence',
            description: 'Your mental capacity and problem-solving ability',
            min: 0,
            max: 100,
            defaultValue: 50,
            enabled: true,
            color: '#4169e1',
            icon: '🧠'
        });

        // Add some custom character stats
        gameLogic.addCharacterStat({
            name: 'Corruption',
            description: 'How corrupted this character has become',
            min: 0,
            max: 100,
            defaultValue: 0,
            enabled: true,
            color: '#8b0000',
            icon: '😈'
        });

        gameLogic.addCharacterStat({
            name: 'Affection',
            description: 'How much this character likes the player',
            min: 0,
            max: 100,
            defaultValue: 10,
            enabled: true,
            color: '#ff1493',
            icon: '💖'
        });

        // Create example templates
        const characterStatIds = gameLogic.getCharacterStatDefinitions().map((s: any) => s.id);
        gameLogic.createStatTemplate(
            'Emma Template',
            'Custom stats for Emma character with Relationship, Energy, and Corruption',
            'character',
            characterStatIds.slice(0, 3) // Take first 3 stats
        );

        gameLogic.createStatTemplate(
            'Main Character Template',
            'Default template for main characters',
            'character',
            characterStatIds
        );
    };

    const refreshData = () => {
        setPlayerStats(gameLogic.getEnabledPlayerStats());
        setCharacters(gameLogic.getAllCharacters());
    };

    const handleTimeAdvance = () => {
        gameLogic.advanceTime(1);
        refreshData();
    };

    const handleStatUpdate = (statId: string, value: number) => {
        gameLogic.updateStat(statId, value);
        refreshData();
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Game Logic System Demo</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Game Info */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4">Game Status</h2>
                    <div className="space-y-2">
                        <p><strong>Time:</strong> {gameLogic.getTimeString()}</p>
                        <p><strong>Day:</strong> {gameLogic.getCurrentDay()}</p>
                        <p><strong>Period:</strong> {gameLogic.getCurrentPeriod()}</p>
                        <p><strong>Location:</strong> {gameLogic.getCurrentLocation()}</p>
                    </div>
                    <button
                        onClick={handleTimeAdvance}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Advance Time (+1 hour)
                    </button>
                </div>

                {/* Player Stats */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4">Player Stats</h2>
                    <div className="space-y-3">
                        {playerStats.map((stat) => (
                            <div key={stat.id} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium flex items-center">
                                        <span className="mr-2">{stat.icon}</span>
                                        {stat.name}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {gameLogic.getStat(stat.id)} / {stat.max}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((gameLogic.getStat(stat.id) - stat.min) / (stat.max - stat.min)) * 100}%`,
                                            backgroundColor: stat.color
                                        }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min={stat.min}
                                    max={stat.max}
                                    value={gameLogic.getStat(stat.id)}
                                    onChange={(e) => handleStatUpdate(stat.id, Number(e.target.value) - gameLogic.getStat(stat.id))}
                                    className="w-full mt-2"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Management Buttons */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setShowStatManager(true)}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
                >
                    Manage Stats & Templates
                </button>
                <button
                    onClick={() => setShowCharacterManager(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                >
                    Manage Characters
                </button>
            </div>

            {/* Characters Display */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-4">Characters ({characters.length})</h2>
                {characters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {characters.map((character) => (
                            <div key={character.characterId} className="border rounded p-3">
                                <h3 className="font-medium mb-2">{character.characterName}</h3>
                                <div className="space-y-2">
                                    {Object.entries(character.stats).map(([statId, value]) => {
                                        const statDef = gameLogic.getCharacterStatDefinitions().find((s: any) => s.id === statId);
                                        if (!statDef) return null;
                                        
                                        return (
                                            <div key={statId} className="text-sm">
                                                <div className="flex justify-between">
                                                    <span>{statDef.icon} {statDef.name}</span>
                                                    <span>{value as number}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1">
                                                    <div
                                                        className="h-1 rounded-full"
                                                        style={{
                                                            width: `${((value as number - statDef.min) / (statDef.max - statDef.min)) * 100}%`,
                                                            backgroundColor: statDef.color
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No characters created yet. Use the Character Manager to add some!</p>
                )}
            </div>

            {/* Demo Features */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Demo Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Custom Stats:</strong> Add unlimited player and character stats with custom names, ranges, colors, and icons</li>
                    <li><strong>Templates:</strong> Save stat configurations as templates for reuse across multiple characters</li>
                    <li><strong>Character Management:</strong> Create characters and apply templates instantly</li>
                    <li><strong>Enable/Disable:</strong> Turn stats on/off individually without losing their definitions</li>
                    <li><strong>Asset Integration:</strong> Inventory items automatically link to images in /assets/items/</li>
                    <li><strong>Time System:</strong> Customizable time periods and advancement</li>
                    <li><strong>Save/Load:</strong> Complete game state persistence with version management</li>
                </ul>
            </div>

            {/* Modals */}
            {showStatManager && (
                <StatManager
                    gameLogic={gameLogic}
                    onClose={() => {
                        setShowStatManager(false);
                        refreshData();
                    }}
                />
            )}

            {showCharacterManager && (
                <CharacterManager
                    gameLogic={gameLogic}
                    onClose={() => {
                        setShowCharacterManager(false);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}; 