import React, { useState, useRef } from 'react';
import { 
  X, Plus, Trash2, Edit, Save, RotateCcw, Play, Settings,
  BarChart3, Users, Flag, Clock, Package, Brain, Eye,
  ChevronDown, ChevronRight, AlertCircle, CheckCircle, 
  Copy, Zap, Target, Filter, Info, Image, Upload, Move,
  Sparkles, Heart, Gamepad2, Timer, ShoppingBag
} from 'lucide-react';
import { GameLogic } from '../lib/game-logic/GameLogic';
import { StatTemplateManager } from '../lib/game-logic/StatTemplateManager';
import { GameState, StatDefinition, StatTemplate } from '../lib/game-logic/types';

const LogicBuilder = ({ 
  isOpen, 
  onClose, 
  gameVariables, 
  setGameVariables,
  sceneConditions,
  setSceneConditions,
  scenes = [],
  characters = [],
  onOpenAssetManager = null
}: {
  isOpen: boolean;
  onClose: () => void;
  gameVariables: any;
  setGameVariables: (variables: any) => void;
  sceneConditions: Map<string, any>;
  setSceneConditions: (conditions: Map<string, any>) => void;
  scenes?: any[];
  characters?: any[];
  onOpenAssetManager?: ((assetType: string) => void) | null;
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [quickActionModal, setQuickActionModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState(null);
  
  // Initialize GameLogic
  const [gameLogic] = useState(() => {
    const logic = new GameLogic();
    
    // Initialize with existing player stats if they exist
    if (gameVariables.playerStats) {
      Object.entries(gameVariables.playerStats).forEach(([key, stat]: [string, any]) => {
        logic.addPlayerStat({
          id: key,
          name: stat.label || key,
          description: `${stat.label || key} stat`,
          min: stat.min || 0,
          max: stat.max || 100,
          defaultValue: stat.value || 50,
          enabled: true,
          color: '#3b82f6',
          icon: key === 'health' ? '❤️' : key === 'energy' ? '⚡' : key === 'strength' ? '💪' : 
                key === 'intelligence' ? '🧠' : key === 'charisma' ? '💬' : key === 'money' ? '💰' : '📊'
        });
      });
    }
    
    return logic;
  });

  if (!isOpen) return null;

  // Main sections with better organization
  const sections = [
    { 
      id: 'overview', 
      title: 'Game Overview', 
      icon: Eye, 
      description: 'Current game state and quick actions',
      color: 'purple'
    },
    { 
      id: 'characters', 
      title: 'Characters & Stats', 
      icon: Users, 
      description: 'Manage player and character statistics',
      color: 'blue'
    },
    { 
      id: 'story', 
      title: 'Story Elements', 
      icon: Flag, 
      description: 'Story flags, conditions, and progression',
      color: 'green'
    },
    { 
      id: 'systems', 
      title: 'Game Systems', 
      icon: Settings, 
      description: 'Time, inventory, and other game mechanics',
      color: 'orange'
    }
  ];

  // Quick actions that users commonly need
  const quickActions = [
    { 
      id: 'addStat', 
      title: 'Add Player Stat', 
      icon: BarChart3, 
      description: 'Create a new stat for the player',
      color: 'blue'
    },
    { 
      id: 'addFlag', 
      title: 'Add Story Flag', 
      icon: Flag, 
      description: 'Create a story progression flag',
      color: 'green'
    },
    { 
      id: 'addItem', 
      title: 'Add Inventory Item', 
      icon: Package, 
      description: 'Add an item to the inventory',
      color: 'yellow'
    },
    { 
      id: 'setCondition', 
      title: 'Set Scene Condition', 
      icon: Brain, 
      description: 'Add logic to control scene access',
      color: 'red'
    }
  ];

  const QuickStatCreator = ({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) => {
    const [statData, setStatData] = useState({
      name: '',
      description: '',
      min: 0,
      max: 100,
      defaultValue: 50,
      color: '#3b82f6',
      icon: '📊'
    });

    const commonStats = [
      { name: 'Health', icon: '❤️', color: '#ef4444' },
      { name: 'Energy', icon: '⚡', color: '#f59e0b' },
      { name: 'Strength', icon: '💪', color: '#dc2626' },
      { name: 'Intelligence', icon: '🧠', color: '#3b82f6' },
      { name: 'Charisma', icon: '💬', color: '#8b5cf6' },
      { name: 'Money', icon: '💰', color: '#059669' },
      { name: 'Luck', icon: '🍀', color: '#10b981' },
      { name: 'Mana', icon: '🔮', color: '#6366f1' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Create Player Stat</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Quick Templates</label>
          <div className="grid grid-cols-4 gap-2">
            {commonStats.map(stat => (
              <button
                key={stat.name}
                onClick={() => setStatData(prev => ({ 
                  ...prev, 
                  name: stat.name, 
                  icon: stat.icon, 
                  color: stat.color,
                  description: `Player's ${stat.name.toLowerCase()} level`
                }))}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
              >
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-xs text-gray-300">{stat.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stat Name</label>
            <input
              type="text"
              value={statData.name}
              onChange={(e) => setStatData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Health, Energy, Charisma"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
            <input
              type="text"
              value={statData.icon}
              onChange={(e) => setStatData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="📊"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={statData.description}
            onChange={(e) => setStatData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this stat represents..."
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Min</label>
            <input
              type="number"
              value={statData.min}
              onChange={(e) => setStatData(prev => ({ ...prev, min: Number(e.target.value) }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max</label>
            <input
              type="number"
              value={statData.max}
              onChange={(e) => setStatData(prev => ({ ...prev, max: Number(e.target.value) }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Value</label>
            <input
              type="number"
              value={statData.defaultValue}
              onChange={(e) => setStatData(prev => ({ ...prev, defaultValue: Number(e.target.value) }))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
            <input
              type="color"
              value={statData.color}
              onChange={(e) => setStatData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(statData)}
            disabled={!statData.name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Create Stat
          </button>
        </div>
      </div>
    );
  };

  const QuickFlagCreator = ({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) => {
    const [flagData, setFlagData] = useState({
      name: '',
      description: '',
      value: false,
      category: 'story'
    });

    const categories = [
      { id: 'story', name: 'Story Progress', icon: '📖' },
      { id: 'romance', name: 'Romance', icon: '💕' },
      { id: 'achievement', name: 'Achievement', icon: '🏆' },
      { id: 'secret', name: 'Secret/Easter Egg', icon: '🔒' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Create Story Flag</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Flag Name</label>
          <input
            type="text"
            value={flagData.name}
            onChange={(e) => setFlagData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., met_emma, finished_chapter_1, unlocked_secret"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFlagData(prev => ({ ...prev, category: cat.id }))}
                className={`p-3 rounded-lg border transition-colors ${
                  flagData.category === cat.id
                    ? 'border-green-500 bg-green-500/20 text-white'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="text-lg mb-1">{cat.icon}</div>
                <div className="text-sm">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={flagData.description}
            onChange={(e) => setFlagData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-20 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="What does this flag represent? When is it triggered?"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(flagData)}
            disabled={!flagData.name.trim()}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Create Flag
          </button>
        </div>
      </div>
    );
  };

  const QuickActionModal = ({ action, onClose }: { action: string; onClose: () => void }) => {
    const handleSave = (data: any) => {
      if (action === 'addStat') {
        // Add to gameVariables
        const statId = data.name.toLowerCase().replace(/\s+/g, '_');
        setGameVariables(prev => ({
          ...prev,
          playerStats: {
            ...prev.playerStats,
            [statId]: {
              value: data.defaultValue,
              min: data.min,
              max: data.max,
              label: data.name
            }
          }
        }));
        
        // Add to game logic
        gameLogic.addPlayerStat({
          id: statId,
          name: data.name,
          description: data.description,
          min: data.min,
          max: data.max,
          defaultValue: data.defaultValue,
          enabled: true,
          color: data.color,
          icon: data.icon
        });
      } else if (action === 'addFlag') {
        const flagId = data.name.toLowerCase().replace(/\s+/g, '_');
        setGameVariables(prev => ({
          ...prev,
          storyFlags: {
            ...prev.storyFlags,
            [flagId]: {
              value: data.value,
              label: data.name,
              description: data.description,
              category: data.category
            }
          }
        }));
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 p-6">
          {action === 'addStat' && <QuickStatCreator onClose={onClose} onSave={handleSave} />}
          {action === 'addFlag' && <QuickFlagCreator onClose={onClose} onSave={handleSave} />}
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Game State Summary */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gamepad2 size={24} />
          Game State Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-2xl font-bold text-blue-400">
              {Object.keys(gameVariables.playerStats || {}).length}
            </div>
            <div className="text-sm text-gray-300">Player Stats</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl mb-1">🚩</div>
            <div className="text-2xl font-bold text-green-400">
              {Object.values(gameVariables.storyFlags || {}).filter(f => f.value).length}
            </div>
            <div className="text-sm text-gray-300">Active Flags</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl mb-1">📦</div>
            <div className="text-2xl font-bold text-yellow-400">
              {gameVariables.inventory?.items?.length || 0}
            </div>
            <div className="text-sm text-gray-300">Inventory Items</div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl mb-1">🕐</div>
            <div className="text-2xl font-bold text-orange-400">
              Day {gameVariables.timeSystem?.day || 1}
            </div>
            <div className="text-sm text-gray-300">Current Day</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap size={20} />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => setQuickActionModal(action.id)}
              className={`p-4 rounded-xl border border-gray-600 hover:border-${action.color}-500 bg-gray-800/50 hover:bg-${action.color}-900/20 transition-all text-left group`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${action.color}-600/20 text-${action.color}-400 group-hover:bg-${action.color}-600/30`}>
                  <action.icon size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-white group-hover:text-white">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={20} />
          Current Game State
        </h3>
        
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Time:</span>
              <span className="text-white ml-2">
                Day {gameVariables.timeSystem?.day}, {gameVariables.timeSystem?.timeOfDay}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total Scenes:</span>
              <span className="text-white ml-2">{scenes.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Scenes with Conditions:</span>
              <span className="text-white ml-2">{sceneConditions.size}</span>
            </div>
            <div>
              <span className="text-gray-400">Characters:</span>
              <span className="text-white ml-2">{characters.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCharacters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={24} />
          Characters & Statistics
        </h3>
        <button
          onClick={() => setQuickActionModal('addStat')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Player Stat
        </button>
      </div>

      {/* Player Stats */}
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Player Statistics
        </h4>
        
        {Object.keys(gameVariables.playerStats || {}).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">No player stats created yet</p>
            <p className="text-sm mb-4">Add stats like Health, Energy, or Charisma to track player progress</p>
            <button
              onClick={() => setQuickActionModal('addStat')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Stat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(gameVariables.playerStats).map(([key, stat]: [string, any]) => (
              <div key={key} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {key === 'health' ? '❤️' : key === 'energy' ? '⚡' : key === 'strength' ? '💪' : 
                       key === 'intelligence' ? '🧠' : key === 'charisma' ? '💬' : key === 'money' ? '💰' : '📊'}
                    </span>
                    <div>
                      <h5 className="font-medium text-white">{stat.label}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.min}-{stat.max}</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((stat.value - stat.min) / (stat.max - stat.min)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Stats */}
      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Heart size={20} />
          Character Relationships
        </h4>
        
        {characters.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">No characters found</p>
            <p className="text-sm">Characters will appear here once you add them to your game</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map(character => (
              <div key={character.id} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {character.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{character.name}</h5>
                    <p className="text-sm text-gray-400">Character</p>
                  </div>
                </div>
                
                {/* Character-specific stats would go here */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Relationship</span>
                    <span className="text-purple-400">50/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Flag size={24} />
          Story Elements
        </h3>
        <button
          onClick={() => setQuickActionModal('addFlag')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Story Flag
        </button>
      </div>

      {/* Story Flags */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Flag size={20} />
          Story Progression Flags
        </h4>
        
        {Object.keys(gameVariables.storyFlags || {}).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Flag size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">No story flags created yet</p>
            <p className="text-sm mb-4">Create flags to track story progress, character interactions, and unlocks</p>
            <button
              onClick={() => setQuickActionModal('addFlag')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Create Your First Flag
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(gameVariables.storyFlags).map(([key, flag]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${flag.value ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <div>
                    <h5 className="font-medium text-white">{flag.label}</h5>
                    {flag.description && (
                      <p className="text-sm text-gray-400">{flag.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    flag.value ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {flag.value ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => setGameVariables(prev => ({
                      ...prev,
                      storyFlags: {
                        ...prev.storyFlags,
                        [key]: { ...flag, value: !flag.value }
                      }
                    }))}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scene Conditions */}
      <div className="bg-gradient-to-br from-red-900/30 to-rose-900/30 rounded-xl p-6 border border-red-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Brain size={20} />
          Scene Logic & Conditions
        </h4>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{scenes.length}</div>
            <div className="text-sm text-gray-400">Total Scenes</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{sceneConditions.size}</div>
            <div className="text-sm text-gray-400">With Conditions</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{scenes.length - sceneConditions.size}</div>
            <div className="text-sm text-gray-400">Open Access</div>
          </div>
        </div>

        {sceneConditions.size === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Brain size={40} className="mx-auto mb-3 opacity-50" />
            <p>No scene conditions set up yet</p>
            <p className="text-sm mt-1">Add conditions to control when scenes become available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from(sceneConditions.entries()).map(([sceneId, condition]) => {
              const scene = scenes.find(s => s.id === sceneId);
              return (
                <div key={sceneId} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                  <div>
                    <h6 className="font-medium text-white">{scene?.title || sceneId}</h6>
                    <p className="text-sm text-gray-400">Has access conditions</p>
                  </div>
                  <button
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    Edit Conditions
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderSystems = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Settings size={24} />
        Game Systems
      </h3>

      {/* Time System */}
      <div className="bg-gradient-to-br from-orange-900/30 to-yellow-900/30 rounded-xl p-6 border border-orange-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Timer size={20} />
          Time Management
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Day</label>
            <input
              type="number"
              value={gameVariables.timeSystem?.day || 1}
              onChange={(e) => setGameVariables(prev => ({
                ...prev,
                timeSystem: { ...prev.timeSystem, day: Number(e.target.value) }
              }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time of Day</label>
            <select
              value={gameVariables.timeSystem?.timeOfDay || 'morning'}
              onChange={(e) => setGameVariables(prev => ({
                ...prev,
                timeSystem: { ...prev.timeSystem, timeOfDay: e.target.value }
              }))}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="morning">🌅 Morning</option>
              <option value="afternoon">☀️ Afternoon</option>
              <option value="evening">🌇 Evening</option>
              <option value="night">🌙 Night</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory System */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShoppingBag size={20} />
            Inventory System
          </h4>
          <button
            onClick={() => setQuickActionModal('addItem')}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
        
        {(gameVariables.inventory?.items?.length || 0) === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">Inventory is empty</p>
            <p className="text-sm mb-4">Add items that players can collect and use</p>
            <button
              onClick={() => setQuickActionModal('addItem')}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gameVariables.inventory.items.map(item => (
              <div key={item.id} className="bg-black/30 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <h6 className="font-medium text-white text-sm">{item.name}</h6>
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Variables */}
      <div className="bg-gradient-to-br from-gray-900/50 to-slate-900/50 rounded-xl p-6 border border-gray-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings size={20} />
          Custom Variables
        </h4>
        
        <p className="text-gray-400 text-sm mb-4">
          Create custom variables for special game mechanics, counters, or unique story elements.
        </p>
        
        {(gameVariables.customVariables?.length || 0) === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Settings size={40} className="mx-auto mb-3 opacity-50" />
            <p>No custom variables created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gameVariables.customVariables.map(variable => (
              <div key={variable.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div>
                  <h6 className="font-medium text-white">{variable.label}</h6>
                  <p className="text-sm text-gray-400">Type: {variable.type}</p>
                </div>
                <div className="text-right">
                  <div className="text-white">{String(variable.value)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'characters': return renderCharacters();
      case 'story': return renderStory();
      case 'systems': return renderSystems();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-700 flex shadow-2xl">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-gray-900 border-r border-gray-700 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={24} className="text-purple-500" />
              Game Logic
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex flex-col gap-2 ${
                    isActive
                      ? `bg-${section.color}-600 text-white shadow-lg shadow-${section.color}-600/30`
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <p className="text-sm opacity-80 text-left">
                    {section.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderSectionContent()}
        </div>
      </div>

      {/* Quick Action Modals */}
      {quickActionModal && (
        <QuickActionModal
          action={quickActionModal}
          onClose={() => setQuickActionModal(null)}
        />
      )}
    </div>
  );
};

export default LogicBuilder;