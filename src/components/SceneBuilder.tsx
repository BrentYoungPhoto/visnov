import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Plus, Trash2, Copy, Move, RotateCw, Maximize2, Minimize2, 
  Grid, Lock, Unlock, Eye, EyeOff, Settings, Layers, Filter, Image, 
  User, Music, Palette, Sliders, MousePointer, Hand, ZoomIn, ZoomOut, 
  RotateCcw, FlipHorizontal, FlipVertical, AlignLeft, AlignCenter, 
  AlignRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair, 
  Target, Maximize, Minimize, Square, Circle, Triangle, Download, 
  Upload, FolderOpen, Search, Type, Volume2, Play, Pause
} from 'lucide-react';
import AssetManager from './AssetManager';

const SceneBuilder = ({ 
  isOpen, 
  onClose, 
  scene, 
  onSave,
  backgrounds,
  characters,
  music,
  soundEffects,
  assetCategories,
  onFileUpload,
  onDeleteAsset,
  onDuplicateAsset,
  filterAssets,
  getCharacterDefaultImage,
  getCharacterImage
}) => {
  const [localScene, setLocalScene] = useState(scene);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState('select');
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [assetSelectionType, setAssetSelectionType] = useState(null);
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [showRulers, setShowRulers] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalScene(scene);
  }, [scene]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedElement) return;

      const step = e.shiftKey ? 10 : 1;
      const newPosition = { ...selectedElement.position };

      switch (e.key) {
        case 'ArrowLeft':
          newPosition.x = Math.max(0, newPosition.x - step);
          break;
        case 'ArrowRight':
          newPosition.x = Math.min(100, newPosition.x + step);
          break;
        case 'ArrowUp':
          newPosition.y = Math.max(0, newPosition.y - step);
          break;
        case 'ArrowDown':
          newPosition.y = Math.min(100, newPosition.y + step);
          break;
        case 'Delete':
          removeCharacter(selectedElement.id);
          return;
        case 'Escape':
          setSelectedElement(null);
          return;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            duplicateCharacter(selectedElement);
            e.preventDefault();
          }
          return;
        default:
          return;
      }

      updateCharacter(selectedElement.id, { position: newPosition });
      e.preventDefault();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedElement, isOpen]);

  if (!isOpen) return null;

  const updateLocalScene = (updates) => {
    setLocalScene(prev => ({ ...prev, ...updates }));
  };

  const updateCharacter = (characterId, updates) => {
    updateLocalScene({
      characters: localScene.characters?.map(char => 
        char.id === characterId ? { ...char, ...updates } : char
      ) || []
    });
  };

  const removeCharacter = (characterId) => {
    updateLocalScene({
      characters: localScene.characters?.filter(char => char.id !== characterId) || []
    });
    if (selectedElement?.id === characterId) {
      setSelectedElement(null);
    }
  };

  const duplicateCharacter = (character) => {
    const newCharacter = {
      ...character,
      id: `${character.id}_copy_${Date.now()}`,
      position: {
        ...character.position,
        x: Math.min(100, character.position.x + 5),
        y: Math.min(100, character.position.y + 5)
      }
    };
    
    updateLocalScene({
      characters: [...(localScene.characters || []), newCharacter]
    });
  };

  // Updated to use new character structure
  const addCharacterToScene = (character) => {
    const defaultOutfit = character.outfits?.[0];
    const defaultPose = defaultOutfit ? Object.keys(defaultOutfit.poses)[0] : 'neutral';
    
    const newCharacter = {
      id: `${character.id}_${Date.now()}`,
      characterId: character.id,
      name: character.name,
      selectedOutfitId: defaultOutfit?.id,
      selectedPose: defaultPose,
      position: { x: 50, y: 50, scale: 1, rotation: 0 },
      visible: true,
      opacity: 1,
      flipX: false,
      flipY: false,
      layer: localScene.characters?.length || 0
    };
    
    updateLocalScene({
      characters: [...(localScene.characters || []), newCharacter]
    });
    setShowAssetManager(false);
  };

  const handleSave = () => {
    onSave(localScene);
    onClose();
  };

  const handleMouseDown = (e, character) => {
    e.preventDefault();
    setSelectedElement(character);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - (character.position.x * rect.width / 100),
      y: e.clientY - rect.top - (character.position.y * rect.height / 100)
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    let newX = ((e.clientX - rect.left - dragStart.x) / rect.width) * 100;
    let newY = ((e.clientY - rect.top - dragStart.y) / rect.height) * 100;

    if (snapToGrid) {
      const gridStepX = (gridSize / rect.width) * 100;
      const gridStepY = (gridSize / rect.height) * 100;
      newX = Math.round(newX / gridStepX) * gridStepX;
      newY = Math.round(newY / gridStepY) * gridStepY;
    }

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    updateCharacter(selectedElement.id, {
      position: { ...selectedElement.position, x: newX, y: newY }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const openAssetSelector = (type) => {
    setAssetSelectionType(type);
    setShowAssetManager(true);
  };

  const handleAssetSelection = (asset) => {
    if (assetSelectionType === 'background') {
      updateLocalScene({ background: asset });
    } else if (assetSelectionType === 'character') {
      addCharacterToScene(asset);
    } else if (assetSelectionType === 'music') {
      updateLocalScene({ music: asset });
    }
    setShowAssetManager(false);
    setAssetSelectionType(null);
  };

  const getBackgroundStyle = () => {
    if (!localScene.background) return { backgroundColor: '#1a1a1a' };
    
    if (localScene.background.type === 'image') {
      return {
        backgroundImage: `url(${localScene.background.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (localScene.background.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${localScene.background.colors?.join(', ')})`
      };
    } else {
      return { backgroundColor: localScene.background.value || '#1a1a1a' };
    }
  };

  const ToolBar = () => (
    <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg">
      {[
        { tool: 'select', icon: MousePointer, label: 'Select' },
        { tool: 'move', icon: Hand, label: 'Pan' },
        { tool: 'rotate', icon: RotateCw, label: 'Rotate' },
        { tool: 'scale', icon: Maximize2, label: 'Scale' }
      ].map(({ tool: toolName, icon: Icon, label }) => (
        <button
          key={toolName}
          onClick={() => setTool(toolName)}
          className={`p-2 rounded transition-colors ${
            tool === toolName
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-600'
          }`}
          title={label}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );

  const ZoomControls = () => (
    <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="text-white text-sm min-w-[60px] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(Math.min(3, zoom + 0.1))}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>
      <button
        onClick={() => setZoom(1)}
        className="p-1 text-xs text-gray-400 hover:text-white transition-colors"
        title="Reset Zoom"
      >
        100%
      </button>
    </div>
  );

  const PropertiesPanel = () => {
    if (!selectedElement) {
      return (
        <div className="p-4 text-center text-gray-400">
          <Target className="mx-auto mb-2" size={24} />
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      );
    }

    const character = characters.find(c => c.id === selectedElement.characterId);
    if (!character) return null;

    return (
      <div className="p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">{selectedElement.name}</h3>
          <div className="flex gap-1">
            <button
              onClick={() => duplicateCharacter(selectedElement)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Duplicate"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => removeCharacter(selectedElement.id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Position Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Position</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">X: {selectedElement.position.x.toFixed(1)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={selectedElement.position.x}
                onChange={(e) => updateCharacter(selectedElement.id, {
                  position: { ...selectedElement.position, x: parseFloat(e.target.value) }
                })}
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ '--value': `${selectedElement.position.x}%` }}
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Y: {selectedElement.position.y.toFixed(1)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={selectedElement.position.y}
                onChange={(e) => updateCharacter(selectedElement.id, {
                  position: { ...selectedElement.position, y: parseFloat(e.target.value) }
                })}
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ '--value': `${selectedElement.position.y}%` }}
              />
            </div>
          </div>
        </div>

        {/* Outfit Selection */}
        {character.outfits && character.outfits.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Outfit</h4>
            <select
              value={selectedElement.selectedOutfitId || character.outfits[0]?.id}
              onChange={(e) => {
                const newOutfitId = e.target.value;
                const newOutfit = character.outfits.find(o => o.id === newOutfitId);
                const firstPose = newOutfit ? Object.keys(newOutfit.poses)[0] : 'neutral';
                
                updateCharacter(selectedElement.id, {
                  selectedOutfitId: newOutfitId,
                  selectedPose: firstPose
                });
              }}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
            >
              {character.outfits.map(outfit => (
                <option key={outfit.id} value={outfit.id}>
                  {outfit.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pose Selection */}
        {character.outfits && selectedElement.selectedOutfitId && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Expression</h4>
            {(() => {
              const selectedOutfit = character.outfits.find(o => o.id === selectedElement.selectedOutfitId);
              const poses = selectedOutfit?.poses || {};
              
              return (
                <select
                  value={selectedElement.selectedPose || Object.keys(poses)[0] || 'neutral'}
                  onChange={(e) => updateCharacter(selectedElement.id, {
                    selectedPose: e.target.value
                  })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                >
                  {Object.keys(poses).map(pose => (
                    <option key={pose} value={pose}>
                      {pose.charAt(0).toUpperCase() + pose.slice(1)}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>
        )}

        {/* Transform Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Transform</h4>
          <div className="space-y-2 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Scale: {(selectedElement.position.scale || 1).toFixed(2)}x</label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.01"
                value={selectedElement.position.scale || 1}
                onChange={(e) => updateCharacter(selectedElement.id, {
                  position: { ...selectedElement.position, scale: parseFloat(e.target.value) }
                })}
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ '--value': `${((selectedElement.position.scale || 1) - 0.1) / (3 - 0.1) * 100}%` }}
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Rotation: {selectedElement.position.rotation || 0}°</label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={selectedElement.position.rotation || 0}
                onChange={(e) => updateCharacter(selectedElement.id, {
                  position: { ...selectedElement.position, rotation: parseInt(e.target.value) }
                })}
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ '--value': `${(selectedElement.position.rotation || 0) / 360 * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Appearance Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Appearance</h4>
          <div className="space-y-2 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Opacity: {Math.round((selectedElement.opacity || 1) * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedElement.opacity || 1}
                onChange={(e) => updateCharacter(selectedElement.id, {
                  opacity: parseFloat(e.target.value)
                })}
                className="w-full h-3 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{ '--value': `${(selectedElement.opacity || 1) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Visible</span>
              <button
                onClick={() => updateCharacter(selectedElement.id, {
                  visible: !selectedElement.visible
                })}
                className={`p-1 rounded transition-colors ${
                  selectedElement.visible ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                {selectedElement.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Flip Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Flip</h4>
          <div className="flex gap-2">
            <button
              onClick={() => updateCharacter(selectedElement.id, {
                flipX: !selectedElement.flipX
              })}
              className={`flex-1 p-2 rounded text-sm transition-colors ${
                selectedElement.flipX 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <FlipHorizontal size={14} className="mx-auto" />
            </button>
            <button
              onClick={() => updateCharacter(selectedElement.id, {
                flipY: !selectedElement.flipY
              })}
              className={`flex-1 p-2 rounded text-sm transition-colors ${
                selectedElement.flipY 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <FlipVertical size={14} className="mx-auto" />
            </button>
          </div>
        </div>

        {/* Alignment Presets */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Position</h4>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {[
              { id: 'tl', x: 15, y: 15, label: '↖' },
              { id: 'tc', x: 50, y: 15, label: '↑' },
              { id: 'tr', x: 85, y: 15, label: '↗' },
              { id: 'ml', x: 15, y: 50, label: '←' },
              { id: 'mc', x: 50, y: 50, label: '●' },
              { id: 'mr', x: 85, y: 50, label: '→' },
              { id: 'bl', x: 15, y: 85, label: '↙' },
              { id: 'bc', x: 50, y: 85, label: '↓' },
              { id: 'br', x: 85, y: 85, label: '↘' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => updateCharacter(selectedElement.id, {
                  position: { ...selectedElement.position, x: preset.x, y: preset.y }
                })}
                className="aspect-square bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Layer Order</h4>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const currentIndex = localScene.characters?.findIndex(c => c.id === selectedElement.id) || 0;
                if (currentIndex > 0) {
                  const newCharacters = [...(localScene.characters || [])];
                  [newCharacters[currentIndex], newCharacters[currentIndex - 1]] = 
                  [newCharacters[currentIndex - 1], newCharacters[currentIndex]];
                  updateLocalScene({ characters: newCharacters });
                }
              }}
              className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
              title="Move Forward"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={() => {
                const currentIndex = localScene.characters?.findIndex(c => c.id === selectedElement.id) || 0;
                if (currentIndex < (localScene.characters?.length || 0) - 1) {
                  const newCharacters = [...(localScene.characters || [])];
                  [newCharacters[currentIndex], newCharacters[currentIndex + 1]] = 
                  [newCharacters[currentIndex + 1], newCharacters[currentIndex]];
                  updateLocalScene({ characters: newCharacters });
                }
              }}
              className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors flex items-center justify-center gap-1"
              title="Move Backward"
            >
              <ArrowDown size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LayersPanel = () => (
    <div className="p-4 overflow-y-auto">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Layers size={16} />
        Layers
      </h3>
      
      <div className="space-y-2">
        {/* Background Layer */}
        <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
          <Image size={14} className="text-blue-400" />
          <span className="flex-1 text-sm text-white">Background</span>
          <button
            onClick={() => openAssetSelector('background')}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Change Background"
          >
            <Settings size={12} />
          </button>
        </div>

        {/* Character Layers */}
        {localScene.characters?.map((sceneCharacter, index) => {
          const character = characters.find(c => c.id === sceneCharacter.characterId);
          
          return (
            <div
              key={sceneCharacter.id}
              onClick={() => setSelectedElement(sceneCharacter)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                selectedElement?.id === sceneCharacter.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <User size={14} className="text-purple-400" />
              <span className="flex-1 text-sm truncate">{character?.name || sceneCharacter.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCharacter(sceneCharacter.id, { visible: !sceneCharacter.visible });
                }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {sceneCharacter.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
          );
        })}

        {/* Add Character Button */}
        <button
          onClick={() => openAssetSelector('character')}
          className="w-full p-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Add Character
        </button>

        {/* Music Layer */}
        <div className="border-t border-gray-600 pt-2 mt-4">
          <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
            <Music size={14} className="text-green-400" />
            <span className="flex-1 text-sm text-white">
              {localScene.music ? localScene.music.name : 'No Music'}
            </span>
            <button
              onClick={() => openAssetSelector('music')}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Change Music"
            >
              <Settings size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Scene Builder: {localScene.title}</h2>
            <ToolBar />
            <ZoomControls />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Canvas Settings */}
            <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded transition-colors ${
                  showGrid ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Grid"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`p-2 rounded transition-colors ${
                  snapToGrid ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Snap to Grid"
              >
                <Crosshair size={16} />
              </button>
              <button
                onClick={() => setShowRulers(!showRulers)}
                className={`p-2 rounded transition-colors ${
                  showRulers ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Toggle Rulers"
              >
                <Square size={16} />
              </button>
            </div>

            {/* Panel Toggles */}
            <button
              onClick={() => setShowLayersPanel(!showLayersPanel)}
              className={`p-2 rounded transition-colors ${
                showLayersPanel ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Toggle Layers Panel"
            >
              <Layers size={16} />
            </button>

            <button
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
              className={`p-2 rounded transition-colors ${
                showPropertiesPanel ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Toggle Properties Panel"
            >
              <Sliders size={16} />
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              Save Scene
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Layers */}
          {showLayersPanel && (
            <div className="w-72 bg-gray-750 border-r border-gray-700 overflow-y-auto">
              <LayersPanel />
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 p-4 bg-gray-900 overflow-auto">
            <div 
              ref={containerRef}
              className="relative mx-auto bg-gray-800 rounded-lg overflow-hidden"
              style={{ 
                width: Math.min(800, (canvasSize.width * zoom)),
                height: Math.min(450, (canvasSize.height * zoom / canvasSize.width * 800)),
                transform: `scale(${zoom})`,
                transformOrigin: 'center'
              }}
            >
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative w-full h-full cursor-crosshair"
                style={getBackgroundStyle()}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelectedElement(null);
                  }
                }}
              >
                {/* Grid Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern
                          id="grid"
                          width={gridSize}
                          height={gridSize}
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="1"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                )}

                {/* Safe Area Guide */}
                {showSafeArea && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-dashed border-yellow-500 opacity-50" />
                  </div>
                )}

                {/* Characters */}
                {localScene.characters?.map((sceneCharacter, index) => {
                  const character = characters.find(c => c.id === sceneCharacter.characterId);
                  if (!character) return null;
                  
                  const imageUrl = getCharacterImage(character, sceneCharacter.selectedOutfitId, sceneCharacter.selectedPose);
                  if (!imageUrl) return null;

                  return (
                    <div
                      key={sceneCharacter.id}
                      className={`absolute cursor-pointer transition-all ${
                        selectedElement?.id === sceneCharacter.id ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        left: `${sceneCharacter.position?.x || 50}%`,
                        top: `${sceneCharacter.position?.y || 50}%`,
                        transform: `translate(-50%, -50%) 
                          scale(${(sceneCharacter.position?.scale || 1) * 1.5}) 
                          rotate(${sceneCharacter.position?.rotation || 0}deg)
                          ${sceneCharacter.flipX ? 'scaleX(-1)' : ''} 
                          ${sceneCharacter.flipY ? 'scaleY(-1)' : ''}`,
                        opacity: sceneCharacter.opacity || 1,
                        display: sceneCharacter.visible === false ? 'none' : 'block',
                        zIndex: index
                      }}
                      onMouseDown={(e) => handleMouseDown(e, sceneCharacter)}
                    >
                      <img
                        src={imageUrl}
                        alt={character.name}
                        className="h-96 object-contain pointer-events-none select-none"
                        draggable={false}
                      />
                      
                      {/* Selection Outline */}
                      {selectedElement?.id === sceneCharacter.id && (
                        <div className="absolute inset-0 border-2 border-purple-500 border-dashed rounded pointer-events-none">
                          {/* Resize Handles */}
                          <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full" />
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full" />
                          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full" />
                          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full" />
                          
                          {/* Character Name Label */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                            {character.name}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Center Guidelines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500 opacity-20" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500 opacity-20" />
                </div>

                {/* Canvas Info */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded text-xs">
                  <div>Scene: {localScene.title}</div>
                  <div>Size: {canvasSize.width}x{canvasSize.height}</div>
                  <div>Zoom: {Math.round(zoom * 100)}%</div>
                  {selectedElement && (
                    <div className="border-t border-gray-600 pt-1 mt-1">
                      <div>Selected: {selectedElement.name}</div>
                      <div>X: {selectedElement.position.x.toFixed(1)}% Y: {selectedElement.position.y.toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          {showPropertiesPanel && (
            <div className="w-80 bg-gray-750 border-l border-gray-700 overflow-y-auto">
              <PropertiesPanel />
            </div>
          )}
        </div>

        {/* Asset Manager Modal */}
        {showAssetManager && (
          <AssetManager
            isOpen={true}
            onClose={() => {
              setShowAssetManager(false);
              setAssetSelectionType(null);
            }}
            activeTab={assetSelectionType === 'background' ? 'backgrounds' : 
                      assetSelectionType === 'character' ? 'characters' : 'audio'}
            setActiveTab={() => {}}
            backgrounds={backgrounds}
            setBackgrounds={() => {}}
            characters={characters}
            setCharacters={() => {}}
            music={music}
            setMusic={() => {}}
            soundEffects={soundEffects}
            setSoundEffects={() => {}}
            assetCategories={assetCategories}
            onFileUpload={onFileUpload}
            onDeleteAsset={onDeleteAsset}
            onDuplicateAsset={onDuplicateAsset}
            filterAssets={filterAssets}
            onSelectAsset={handleAssetSelection}
            getCharacterDefaultImage={getCharacterDefaultImage}
            getCharacterImage={getCharacterImage}
          />
        )}
      </div>
    </div>
  );
};

export default SceneBuilder;