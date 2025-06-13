import React, { useState, useEffect } from 'react';

interface CharacterManagerProps {
    gameLogic: any;
    onClose: () => void;
}

export const CharacterManager: React.FC<CharacterManagerProps> = ({ gameLogic, onClose }) => {
    const [characters, setCharacters] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCharacterName, setNewCharacterName] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    useEffect(() => {
        refreshData();
    }, [gameLogic]);

    const refreshData = () => {
        setCharacters(gameLogic.getAllCharacters());
        setTemplates(gameLogic.getStatTemplates('character'));
    };

    const handleAddCharacter = () => {
        if (!newCharacterName.trim()) return;

        const characterId = `char_${Date.now()}`;
        gameLogic.addCharacter(
            characterId, 
            newCharacterName, 
            selectedTemplate || undefined
        );

        setNewCharacterName('');
        setSelectedTemplate('');
        setShowAddForm(false);
        refreshData();
    };

    const handleRemoveCharacter = (characterId: string) => {
        gameLogic.removeCharacter(characterId);
        refreshData();
    };

    const handleApplyTemplate = (characterId: string, templateId: string) => {
        gameLogic.applyTemplateToCharacter(characterId, templateId);
        refreshData();
    };

    const getStatValue = (character: any, statId: string): number => {
        return character.stats[statId] || 0;
    };

    const updateCharacterStat = (characterId: string, statId: string, value: number) => {
        const character = characters.find(c => c.characterId === characterId);
        if (character) {
            character.stats[statId] = value;
            // In a real implementation, you might want to trigger a save or update
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Character Manager</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Characters</h3>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add Character
                    </button>
                </div>

                {/* Characters List */}
                <div className="grid gap-4">
                    {characters.map((character) => (
                        <div key={character.characterId} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-medium">{character.characterName}</h4>
                                    <p className="text-sm text-gray-600">
                                        ID: {character.characterId}
                                        {character.templateId && (
                                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                Template: {templates.find(t => t.id === character.templateId)?.name || 'Unknown'}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleApplyTemplate(character.characterId, e.target.value);
                                            }
                                        }}
                                        className="px-3 py-1 border rounded text-sm"
                                        defaultValue=""
                                    >
                                        <option value="">Apply Template</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleRemoveCharacter(character.characterId)}
                                        className="text-red-500 hover:text-red-700 px-2 py-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Character Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(character.stats).map(([statId, value]) => {
                                    const statDef = gameLogic.getCharacterStatDefinitions().find((s: any) => s.id === statId);
                                    if (!statDef) return null;

                                    return (
                                        <div key={statId} className="border rounded p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium flex items-center">
                                                    <span className="mr-2">{statDef.icon}</span>
                                                    {statDef.name}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {value as number} / {statDef.max}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${((value as number - statDef.min) / (statDef.max - statDef.min)) * 100}%`,
                                                        backgroundColor: statDef.color
                                                    }}
                                                />
                                            </div>
                                            <input
                                                type="range"
                                                min={statDef.min}
                                                max={statDef.max}
                                                value={value as number}
                                                onChange={(e) => updateCharacterStat(character.characterId, statId, Number(e.target.value))}
                                                className="w-full mt-2"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {characters.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No characters created yet. Add your first character to get started!
                    </div>
                )}

                {/* Add Character Form */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Add New Character</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Character Name"
                                    value={newCharacterName}
                                    onChange={(e) => setNewCharacterName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Apply Template (Optional)
                                    </label>
                                    <select
                                        value={selectedTemplate}
                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">No Template</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name} ({template.stats.length} stats)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedTemplate && (
                                    <div className="text-xs text-gray-600">
                                        <p className="font-medium">Template includes:</p>
                                        {templates.find(t => t.id === selectedTemplate)?.stats.map((stat: any) => (
                                            <span key={stat.id} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-100 rounded">
                                                {stat.icon} {stat.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCharacter}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Add Character
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 