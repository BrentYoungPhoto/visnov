import React, { useState, useEffect } from 'react';

interface StatManagerProps {
    gameLogic: any;
    onClose: () => void;
}

interface StatFormData {
    name: string;
    description: string;
    min: number;
    max: number;
    defaultValue: number;
    color: string;
    icon: string;
}

export const StatManager: React.FC<StatManagerProps> = ({ gameLogic, onClose }) => {
    const [activeTab, setActiveTab] = useState<'player' | 'character'>('player');
    const [playerStats, setPlayerStats] = useState<any[]>([]);
    const [characterStats, setCharacterStats] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [selectedStats, setSelectedStats] = useState<string[]>([]);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    
    const [formData, setFormData] = useState<StatFormData>({
        name: '',
        description: '',
        min: 0,
        max: 100,
        defaultValue: 50,
        color: '#4169e1',
        icon: '📊'
    });

    useEffect(() => {
        refreshData();
    }, [gameLogic]);

    const refreshData = () => {
        setPlayerStats(gameLogic.getPlayerStatDefinitions());
        setCharacterStats(gameLogic.getCharacterStatDefinitions());
        setTemplates(gameLogic.getStatTemplates());
    };

    const handleAddStat = () => {
        if (!formData.name.trim()) return;

        const stat = {
            name: formData.name,
            description: formData.description,
            min: formData.min,
            max: formData.max,
            defaultValue: formData.defaultValue,
            enabled: true,
            color: formData.color,
            icon: formData.icon
        };

        if (activeTab === 'player') {
            gameLogic.addPlayerStat(stat);
        } else {
            gameLogic.addCharacterStat(stat);
        }

        setFormData({
            name: '',
            description: '',
            min: 0,
            max: 100,
            defaultValue: 50,
            color: '#4169e1',
            icon: '📊'
        });
        setShowAddForm(false);
        refreshData();
    };

    const handleToggleStat = (statId: string) => {
        if (activeTab === 'player') {
            gameLogic.togglePlayerStat(statId);
        } else {
            gameLogic.toggleCharacterStat(statId);
        }
        refreshData();
    };

    const handleRemoveStat = (statId: string) => {
        if (activeTab === 'player') {
            gameLogic.removePlayerStat(statId);
        } else {
            gameLogic.removeCharacterStat(statId);
        }
        refreshData();
    };

    const handleCreateTemplate = () => {
        if (!templateName.trim() || selectedStats.length === 0) return;

        gameLogic.createStatTemplate(templateName, templateDescription, activeTab, selectedStats);
        setTemplateName('');
        setTemplateDescription('');
        setSelectedStats([]);
        setShowTemplateForm(false);
        refreshData();
    };

    const handleApplyTemplate = (templateId: string) => {
        if (activeTab === 'player') {
            gameLogic.applyTemplateToPlayer(templateId);
        }
        refreshData();
    };

    const handleDeleteTemplate = (templateId: string) => {
        gameLogic.deleteStatTemplate(templateId);
        refreshData();
    };

    const currentStats = activeTab === 'player' ? playerStats : characterStats;
    const currentTemplates = templates.filter(t => t.category === activeTab);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Stat Manager</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => setActiveTab('player')}
                        className={`px-4 py-2 rounded ${activeTab === 'player' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'}`}
                    >
                        Player Stats
                    </button>
                    <button
                        onClick={() => setActiveTab('character')}
                        className={`px-4 py-2 rounded ${activeTab === 'character' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700'}`}
                    >
                        Character Stats
                    </button>
                </div>

                {/* Stats List */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {activeTab === 'player' ? 'Player' : 'Character'} Stats
                        </h3>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Add Stat
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {currentStats.map((stat) => (
                            <div key={stat.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl">{stat.icon}</span>
                                    <div>
                                        <h4 className="font-medium">{stat.name}</h4>
                                        <p className="text-sm text-gray-600">{stat.description}</p>
                                        <p className="text-xs text-gray-500">
                                            Range: {stat.min} - {stat.max}, Default: {stat.defaultValue}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={stat.enabled}
                                            onChange={() => handleToggleStat(stat.id)}
                                            className="mr-2"
                                        />
                                        Enabled
                                    </label>
                                    <button
                                        onClick={() => handleRemoveStat(stat.id)}
                                        className="text-red-500 hover:text-red-700 px-2 py-1"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Templates</h3>
                        <button
                            onClick={() => setShowTemplateForm(true)}
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                        >
                            Save as Template
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {currentTemplates.map((template) => (
                            <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                                <div>
                                    <h4 className="font-medium">{template.name}</h4>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                    <p className="text-xs text-gray-500">
                                        {template.stats.length} stats • Created: {new Date(template.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApplyTemplate(template.id)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="text-red-500 hover:text-red-700 px-2 py-1"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Add Stat Form */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Add New Stat</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Stat Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    rows={2}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={formData.min}
                                        onChange={(e) => setFormData({ ...formData, min: Number(e.target.value) })}
                                        className="p-2 border rounded"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={formData.max}
                                        onChange={(e) => setFormData({ ...formData, max: Number(e.target.value) })}
                                        className="p-2 border rounded"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Default"
                                        value={formData.defaultValue}
                                        onChange={(e) => setFormData({ ...formData, defaultValue: Number(e.target.value) })}
                                        className="p-2 border rounded"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="p-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Icon (emoji)"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="p-2 border rounded"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddStat}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Add Stat
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template Form */}
                {showTemplateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Template Name"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                />
                                <textarea
                                    placeholder="Description"
                                    value={templateDescription}
                                    onChange={(e) => setTemplateDescription(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows={2}
                                />
                                <div>
                                    <p className="font-medium mb-2">Select Stats to Include:</p>
                                    {currentStats.map((stat) => (
                                        <label key={stat.id} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedStats.includes(stat.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStats([...selectedStats, stat.id]);
                                                    } else {
                                                        setSelectedStats(selectedStats.filter(id => id !== stat.id));
                                                    }
                                                }}
                                                className="mr-2"
                                            />
                                            {stat.icon} {stat.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setShowTemplateForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTemplate}
                                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                                >
                                    Save Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}; 