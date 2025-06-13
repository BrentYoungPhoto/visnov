import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Edit, Trash2, Copy, Play, Settings, User, Image, 
  Music, MessageSquare, GitBranch, X, Video, Volume2,
  ChevronDown, Type, Palette, Film, Square, Eye, EyeOff,
  MousePointer2, Maximize2, Link, Layout, ChevronUp
} from 'lucide-react';

export default function FlowBuilder({ 
  scenes, 
  setScenes, 
  onOpenSceneBuilder,
  currentSceneIndex,
  setCurrentSceneIndex,
  characters,
  backgrounds,
  videos,
  cutscenes,
  getCharacterDefaultImage,
  onAutoLayoutScenes,
  onPlayFromScene
}) {
  const [selectedSceneId, setSelectedSceneId] = useState(null);
  const [editingChoice, setEditingChoice] = useState(null);
  const [showScenePreviews, setShowScenePreviews] = useState(true);
  const [showListPreviews, setShowListPreviews] = useState(true);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Node connection state
  const [potentialTargetId, setPotentialTargetId] = useState(null);
  
  // Mouse interaction refs
  const isMouseDownRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const mouseDownNodeRef = useRef(null);
  
  const canvasRef = useRef(null);
  const initializedScenesRef = useRef(new Set());

  const DRAG_THRESHOLD = 5; // pixels

  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[currentSceneIndex];

  // Helper function to get bounding box of a scene node
  const getBoundingBox = (scene) => {
    const nodeHeight = showScenePreviews ? 160 : 70;
    const nodeWidth = 300;
    
    return {
      x: scene.position?.x || 0,
      y: scene.position?.y || 0,
      width: nodeWidth,
      height: nodeHeight
    };
  };

  // Helper function to check if two bounding boxes overlap with tolerance
  const checkOverlap = (box1, box2, tolerance = 20) => {
    return !(
      box1.x + box1.width + tolerance < box2.x ||
      box2.x + box2.width + tolerance < box1.x ||
      box1.y + box1.height + tolerance < box2.y ||
      box2.y + box2.height + tolerance < box1.y
    );
  };

  // Initialize positions for scenes that don't have them
  useEffect(() => {
    const scenesNeedingPositions = scenes.filter(scene => 
      !scene.position && !initializedScenesRef.current.has(scene.id)
    );
    
    if (scenesNeedingPositions.length > 0) {
      const updatedScenes = scenes.map(scene => {
        if (!scene.position && !initializedScenesRef.current.has(scene.id)) {
          // Mark this scene as initialized
          initializedScenesRef.current.add(scene.id);
          
          // Calculate position based on existing scenes
          const existingScenes = scenes.filter(s => s.position || initializedScenesRef.current.has(s.id));
          const sceneIndex = existingScenes.length;
          
          return {
            ...scene,
            position: {
              x: 200 + (sceneIndex % 3) * 350,
              y: 100 + Math.floor(sceneIndex / 3) * 220
            },
            choices: scene.choices || []
          };
        }
        return scene;
      });
      
      setScenes(updatedScenes);
    }
  }, [scenes, setScenes]);

  // Enhanced double-click handler
  const handleDoubleClick = useCallback((e, scene) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Double-clicking scene:', scene.title);
    onOpenSceneBuilder(scene);
  }, [onOpenSceneBuilder]);

  // Mouse down handler - immediately selects and prepares for potential drag
  const handleMouseDown = useCallback((e, scene) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Immediately select the scene
    setSelectedSceneId(scene.id);
    
    // Track mouse down state
    isMouseDownRef.current = true;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    mouseDownNodeRef.current = scene;
    
    // Reset drag state
    setIsDragging(false);
    setDraggedNodeId(null);
    setPotentialTargetId(null);
  }, []);

  // Mouse move handler with drag threshold detection
  const handleMouseMove = useCallback((e) => {
    // Only proceed if mouse is down
    if (!isMouseDownRef.current || !mouseDownNodeRef.current) return;

    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPosRef.current.x, 2) + 
      Math.pow(e.clientY - dragStartPosRef.current.y, 2)
    );

    // Start dragging if we haven't started yet and moved beyond threshold
    if (!isDragging && moveDistance > DRAG_THRESHOLD) {
      setIsDragging(true);
      setDraggedNodeId(mouseDownNodeRef.current.id);
      
      // Calculate initial drag offset
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      setDragOffset({
        x: dragStartPosRef.current.x - rect.left + scrollLeft - (mouseDownNodeRef.current.position?.x || 0),
        y: dragStartPosRef.current.y - rect.top + scrollTop - (mouseDownNodeRef.current.position?.y || 0)
      });
    }

    // Continue with drag if already dragging
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;
    
    const newX = Math.max(0, e.clientX - rect.left + scrollLeft - dragOffset.x);
    const newY = Math.max(0, e.clientY - rect.top + scrollTop - dragOffset.y);

    // Update the dragged scene position
    const updatedScenes = scenes.map(scene => 
      scene.id === draggedNodeId 
        ? { ...scene, position: { x: newX, y: newY } }
        : scene
    );
    
    setScenes(updatedScenes);

    // Check for potential target (proximity detection)
    const draggedScene = updatedScenes.find(s => s.id === draggedNodeId);
    const draggedBounds = getBoundingBox(draggedScene);
    
    let newPotentialTarget = null;
    
    for (const scene of updatedScenes) {
      if (scene.id !== draggedNodeId) {
        const sceneBounds = getBoundingBox(scene);
        
        if (checkOverlap(draggedBounds, sceneBounds, 30)) {
          // Check if connection doesn't already exist
          const existingChoice = draggedScene.choices?.find(choice => 
            choice.targetSceneId === scene.id
          );
          
          if (!existingChoice) {
            newPotentialTarget = scene.id;
            break;
          }
        }
      }
    }
    
    setPotentialTargetId(newPotentialTarget);
  }, [isDragging, draggedNodeId, dragOffset, scenes, setScenes, getBoundingBox]);

  // Mouse up handler with connection creation
  const handleMouseUp = useCallback(() => {
    // Reset mouse down state
    isMouseDownRef.current = false;
    mouseDownNodeRef.current = null;

    // Create connection if we have a potential target
    if (isDragging && draggedNodeId && potentialTargetId) {
      const draggedScene = scenes.find(s => s.id === draggedNodeId);
      const targetScene = scenes.find(s => s.id === potentialTargetId);
      
      if (draggedScene && targetScene) {
        // Check if connection doesn't already exist
        const existingChoice = draggedScene.choices?.find(choice => 
          choice.targetSceneId === potentialTargetId
        );
        
        if (!existingChoice) {
          // Create new choice automatically
          const newChoice = {
            id: `choice_${Date.now()}`,
            text: `Go to ${targetScene.title}`,
            targetSceneId: potentialTargetId
          };
          
          setScenes(prev => prev.map(scene => 
            scene.id === draggedNodeId 
              ? { 
                  ...scene, 
                  choices: [...(scene.choices || []), newChoice]
                }
              : scene
          ));
          
          console.log('Auto-created connection:', draggedScene.title, '→', targetScene.title);
        }
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDraggedNodeId(null);
    setPotentialTargetId(null);
  }, [isDragging, draggedNodeId, potentialTargetId, scenes, setScenes]);

  // Global mouse event listeners - always active
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const updateScene = (sceneId, updates) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  };

  const addChoice = () => {
    if (!selectedScene) return;
    
    const newChoice = {
      id: `choice_${Date.now()}`,
      text: 'New choice',
      targetSceneId: ''
    };
    
    updateScene(selectedScene.id, {
      choices: [...(selectedScene.choices || []), newChoice]
    });
  };

  const updateChoice = (choiceId, updates) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      choices: selectedScene.choices.map(choice =>
        choice.id === choiceId ? { ...choice, ...updates } : choice
      )
    });
  };

  const deleteChoice = (choiceId) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      choices: selectedScene.choices.filter(choice => choice.id !== choiceId)
    });
  };

  // New dialogue management functions
  const addDialogue = () => {
    if (!selectedScene) return;
    
    const newDialogue = {
      id: `line_${Date.now()}`,
      character: null,
      text: 'New dialogue line...',
      choices: []
    };
    
    updateScene(selectedScene.id, {
      dialogue: [...(selectedScene.dialogue || []), newDialogue]
    });
  };

  const updateDialogue = (dialogueId, updates) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      dialogue: selectedScene.dialogue?.map(line =>
        line.id === dialogueId ? { ...line, ...updates } : line
      ) || []
    });
  };

  const deleteDialogue = (dialogueId) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      dialogue: selectedScene.dialogue?.filter(line => line.id !== dialogueId) || []
    });
  };

  // New character in scene management functions
  const addCharacterToScene = () => {
    if (!selectedScene || !characters.length) return;
    
    const availableCharacter = characters[0]; // Default to first character
    const defaultOutfit = availableCharacter.outfits?.[0];
    const defaultPose = defaultOutfit ? Object.keys(defaultOutfit.poses)[0] : 'neutral';
    
    const newSceneCharacter = {
      id: `scenechar_${Date.now()}`,
      characterId: availableCharacter.id,
      name: availableCharacter.name,
      selectedOutfitId: defaultOutfit?.id,
      selectedPose: defaultPose,
      position: { x: 50, y: 50, scale: 1, rotation: 0 },
      visible: true,
      opacity: 1,
      flipX: false,
      flipY: false
    };
    
    updateScene(selectedScene.id, {
      characters: [...(selectedScene.characters || []), newSceneCharacter]
    });
  };

  const updateSceneCharacter = (sceneCharacterId, updates) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      characters: selectedScene.characters?.map(char =>
        char.id === sceneCharacterId ? { ...char, ...updates } : char
      ) || []
    });
  };

  const removeSceneCharacter = (sceneCharacterId) => {
    if (!selectedScene) return;
    
    updateScene(selectedScene.id, {
      characters: selectedScene.characters?.filter(char => char.id !== sceneCharacterId) || []
    });
  };

  const addNewScene = () => {
    // Calculate position for new scene (temporary position - will be auto-layouted)
    const existingPositions = scenes.filter(s => s.position).map(s => s.position);
    const maxX = existingPositions.length > 0 ? Math.max(...existingPositions.map(p => p.x)) : 0;
    const maxY = existingPositions.length > 0 ? Math.max(...existingPositions.map(p => p.y)) : 0;
    
    // Position new scene to the right of existing scenes, or start a new row
    const newX = existingPositions.length % 4 === 0 ? 200 : maxX + 350;
    const newY = existingPositions.length % 4 === 0 ? maxY + 220 : maxY;
    
    const newScene = {
      id: `scene_${Date.now()}`,
      title: `Scene ${scenes.length + 1}`,
      description: 'New scene description',
      background: null,
      characters: [],
      dialogue: [
        {
          id: `line_${Date.now()}`,
          character: null,
          text: 'Enter dialogue here...',
          choices: []
        }
      ],
      choices: [],
      music: null,
      effects: {
        transition: 'fade',
        duration: 1000
      },
      position: {
        x: newX,
        y: newY
      }
    };
    
    // Mark this scene as initialized
    initializedScenesRef.current.add(newScene.id);
    
    console.log('Adding new scene:', newScene.title, 'at position:', newScene.position);
    setScenes(prev => {
      const updated = [...prev, newScene];
      console.log('Updated scenes count:', updated.length);
      return updated;
    });
    setSelectedSceneId(newScene.id);
  };

  const deleteScene = (sceneId) => {
    // Remove scene from initialized set
    initializedScenesRef.current.delete(sceneId);
    
    const updatedScenes = scenes.map(scene => ({
      ...scene,
      choices: scene.choices?.filter(choice => choice.targetSceneId !== sceneId) || []
    })).filter(scene => scene.id !== sceneId);
    
    setScenes(updatedScenes);
    
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(null);
    }
  };

  const duplicateScene = (scene) => {
    const newScene = {
      ...scene,
      id: `scene_${Date.now()}`,
      title: `${scene.title} (Copy)`,
      position: {
        x: scene.position.x + 50,
        y: scene.position.y + 50
      },
      choices: scene.choices?.map(choice => ({
        ...choice,
        id: `choice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      })) || []
    };
    
    // Mark this scene as initialized
    initializedScenesRef.current.add(newScene.id);
    
    setScenes(prev => [...prev, newScene]);
  };

  const getConnectionPath = (fromScene, toScene) => {
    const nodeHeight = showScenePreviews ? 160 : 70;
    const fromX = fromScene.position.x + 150;
    const fromY = fromScene.position.y + nodeHeight / 2;
    const toX = toScene.position.x;
    const toY = toScene.position.y + nodeHeight / 2;
    
    const midX = fromX + (toX - fromX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  const renderConnections = () => {
    const connections = [];
    
    scenes.forEach(scene => {
      scene.choices?.forEach((choice, index) => {
        const targetScene = scenes.find(s => s.id === choice.targetSceneId);
        if (targetScene) {
          const path = getConnectionPath(scene, targetScene);
          
          connections.push(
            <g key={`${scene.id}-${choice.id}`}>
              <path
                d={path}
                stroke="#8B5CF6"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="transition-opacity hover:opacity-80"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(139, 92, 246, 0.3))'
                }}
              />
              <text
                x={scene.position.x + 150 + (targetScene.position.x - scene.position.x - 150) / 2}
                y={scene.position.y + (showScenePreviews ? 80 : 35) + (targetScene.position.y - scene.position.y) / 2 - 5}
                fill="#8B5CF6"
                fontSize="10"
                textAnchor="middle"
                className="pointer-events-none opacity-60"
              >
                {choice.text.length > 15 ? `${choice.text.substring(0, 15)}...` : choice.text}
              </text>
            </g>
          );
        }
      });
    });
    
    return connections;
  };

  const getBackgroundStyle = (background) => {
    if (!background) return { backgroundColor: '#374151' };
    
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (background.type === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${background.colors?.join(', ')})`
      };
    } else {
      return { backgroundColor: background.value || '#374151' };
    }
  };

  // Scene List Preview Component
  const SceneListPreview = ({ scene }) => {
    const backgroundStyle = getBackgroundStyle(scene.background);
    
    return (
      <div 
        className="relative w-full h-16 rounded overflow-hidden mb-2"
        style={backgroundStyle}
      >
        {/* Characters */}
        {scene.characters?.slice(0, 2).map((sceneCharacter, charIndex) => {
          const character = characters.find(c => c.id === sceneCharacter.characterId);
          if (!character) return null;
          
          const imageUrl = getCharacterDefaultImage ? getCharacterDefaultImage(character) : null;
          if (!imageUrl) return null;
          
          return (
            <div
              key={sceneCharacter.id || charIndex}
              className="absolute"
              style={{
                left: `${30 + charIndex * 25}%`,
                bottom: '0px',
                transform: 'scale(0.15)',
                transformOrigin: 'bottom center'
              }}
            >
              <img
                src={imageUrl}
                alt={character.name}
                className="h-16 object-contain"
              />
            </div>
          );
        })}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Scene indicators */}
        <div className="absolute top-1 right-1 flex gap-1">
          {scene.background && <Image size={8} className="text-blue-400" />}
          {scene.characters && scene.characters.length > 0 && <User size={8} className="text-purple-400" />}
          {scene.music && <Music size={8} className="text-green-400" />}
          {scene.choices && scene.choices.length > 0 && <GitBranch size={8} className="text-orange-400" />}
        </div>
        
        {/* Current scene indicator */}
        {scenes.findIndex(s => s.id === scene.id) === currentSceneIndex && (
          <div className="absolute bottom-1 left-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    );
  };

  const SceneNode = ({ scene, index }) => {
    const isSelected = selectedSceneId === scene.id;
    const isCurrent = index === currentSceneIndex;
    const isDraggingThis = draggedNodeId === scene.id;
    const isPotentialTarget = potentialTargetId === scene.id;
    const hasBackground = !!scene.background;
    const hasCharacters = scene.characters && scene.characters.length > 0;
    const hasMusic = !!scene.music;
    const choiceCount = scene.choices?.length || 0;
    
    const nodeHeight = showScenePreviews ? 160 : 70;
    
    return (
      <div
        className={`absolute bg-gray-800 rounded-lg border-2 transition-all select-none overflow-hidden group ${
          isSelected 
            ? 'border-purple-500 shadow-lg shadow-purple-500/25' 
            : isCurrent
              ? 'border-blue-500'
              : isPotentialTarget
                ? 'border-green-500 shadow-lg shadow-green-500/50 ring-2 ring-green-400'
                : 'border-gray-600 hover:border-gray-500'
        } ${isDraggingThis ? 'z-50 scale-105 shadow-2xl opacity-90' : 'z-10'}
        ${isDragging && !isDraggingThis ? 'pointer-events-none' : 'cursor-pointer hover:shadow-lg'}`}
        style={{
          left: scene.position?.x || 0,
          top: scene.position?.y || 0,
          width: '300px',
          height: `${nodeHeight}px`,
          transform: isDraggingThis ? 'rotate(1deg)' : 'rotate(0deg)',
          transition: isDraggingThis ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out' : 'all 0.2s ease-out'
        }}
        onMouseDown={(e) => handleMouseDown(e, scene)}
        onDoubleClick={(e) => handleDoubleClick(e, scene)}
      >
        {/* Potential Target Highlight */}
        {isPotentialTarget && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-lg border border-green-400 border-dashed pointer-events-none animate-pulse" />
        )}

        {/* Double-click hint overlay - only show on hover and not while dragging */}
        {isSelected && !isDragging && (
          <div className="absolute inset-0 bg-purple-500 bg-opacity-5 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MousePointer2 size={12} />
              Double-click to edit
            </div>
          </div>
        )}

        {/* Scene Preview Area */}
        {showScenePreviews && (
          <div className="relative h-24 overflow-hidden pointer-events-none">
            <div 
              className="absolute inset-0"
              style={getBackgroundStyle(scene.background)}
            />
            
            {scene.characters?.slice(0, 3).map((sceneCharacter, charIndex) => {
              const character = characters.find(c => c.id === sceneCharacter.characterId);
              if (!character) return null;
              
              const imageUrl = getCharacterDefaultImage ? getCharacterDefaultImage(character) : null;
              if (!imageUrl) return null;
              
              return (
                <div
                  key={sceneCharacter.id || charIndex}
                  className="absolute"
                  style={{
                    left: `${20 + charIndex * 15}%`,
                    bottom: '0px',
                    transform: 'scale(0.3)',
                    transformOrigin: 'bottom center'
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={character.name}
                    className="h-16 object-contain"
                  />
                </div>
              );
            })}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="font-semibold text-white text-sm truncate drop-shadow-lg">
                {scene.title}
              </h3>
            </div>
            
            {isCurrent && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" />
              </div>
            )}
          </div>
        )}
        
        {/* Scene Info Area */}
        <div className={`p-3 ${showScenePreviews ? '' : 'h-full'} flex flex-col justify-between pointer-events-none`}>
          {!showScenePreviews && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate text-sm">{scene.title}</h3>
                <div className="flex items-center gap-1">
                  {isCurrent && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate mb-2">{scene.description}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <GitBranch size={10} />
                {choiceCount}
              </span>
              {hasBackground && <Image size={10} className="text-blue-400" />}
              {hasCharacters && (
                <span className="text-purple-400 flex items-center gap-1">
                  <User size={10} />
                  {scene.characters.length}
                </span>
              )}
              {hasMusic && <Music size={10} className="text-green-400" />}
            </div>
            
            {isDraggingThis && (
              <div className="text-xs text-purple-400 font-medium animate-pulse">Moving...</div>
            )}
            
            {isPotentialTarget && (
              <div className="text-xs text-green-400 font-medium animate-pulse">Target</div>
            )}
          </div>
        </div>

        {/* Action buttons - only show when selected and not dragging */}
        {isSelected && !isDragging && (
          <div className="absolute -top-2 -right-2 flex gap-1 pointer-events-auto">
            {onPlayFromScene && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayFromScene(scene.id);
                }}
                className="w-6 h-6 bg-green-600 hover:bg-green-500 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
                title="Play from this scene"
              >
                <Play size={10} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSceneBuilder(scene);
              }}
              className="w-6 h-6 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              title="Edit Scene (Advanced)"
            >
              <Maximize2 size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateScene(scene);
              }}
              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-colors shadow-lg"
              title="Duplicate Scene"
            >
              <Copy size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (scenes.length > 1) {
                  deleteScene(scene.id);
                }
              }}
              className="w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
              title="Delete Scene"
              disabled={scenes.length <= 1}
            >
              <Trash2 size={10} />
            </button>
          </div>
        )}

        {/* Drag indicator */}
        {isDraggingThis && (
          <div className="absolute inset-0 bg-purple-500 bg-opacity-10 rounded-lg border border-purple-400 border-dashed pointer-events-none" />
        )}
      </div>
    );
  };

  // Render the "Join Nodes" visual feedback
  const renderJoinNodesUI = () => {
    if (!isDragging || !draggedNodeId || !potentialTargetId) return null;
    
    const draggedScene = scenes.find(s => s.id === draggedNodeId);
    const targetScene = scenes.find(s => s.id === potentialTargetId);
    
    if (!draggedScene || !targetScene) return null;
    
    const nodeHeight = showScenePreviews ? 160 : 70;
    const midX = (draggedScene.position.x + targetScene.position.x + 300) / 2;
    const midY = (draggedScene.position.y + targetScene.position.y + nodeHeight) / 2;
    
    return (
      <div
        className="absolute z-50 pointer-events-none"
        style={{
          left: midX - 50,
          top: midY - 15
        }}
      >
        <div className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Link size={14} />
          <span className="text-sm font-medium">Join Nodes</span>
        </div>
      </div>
    );
  };

  console.log('FlowBuilder rendering with', scenes.length, 'scenes:', scenes.map(s => s.title));

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left Sidebar - Scene List */}
      <div className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Scene List</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowListPreviews(!showListPreviews)}
                className={`p-2 rounded transition-colors ${
                  showListPreviews 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
                title={showListPreviews ? 'Hide List Previews' : 'Show List Previews'}
              >
                {showListPreviews ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => setShowScenePreviews(!showScenePreviews)}
                className={`p-2 rounded transition-colors ${
                  showScenePreviews 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
                title={showScenePreviews ? 'Hide Canvas Previews' : 'Show Canvas Previews'}
              >
                {showScenePreviews ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <span className="text-sm text-gray-400">{scenes.length}</span>
            </div>
          </div>
          <button
            onClick={addNewScene}
            className="w-full p-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Scene
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {scenes.map((scene, index) => (
              <div
                key={scene.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedSceneId === scene.id
                    ? 'bg-purple-600 text-white'
                    : index === currentSceneIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setSelectedSceneId(scene.id)}
                onDoubleClick={() => onOpenSceneBuilder(scene)}
              >
                {/* Visual Preview */}
                {showListPreviews && (
                  <SceneListPreview scene={scene} />
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{scene.title}</div>
                    <div className="text-xs opacity-75 flex items-center gap-2">
                      <span>□ {scene.choices?.length || 0} choices</span>
                      {!showListPreviews && (
                        <>
                          {scene.background && <Image size={10} />}
                          {scene.characters?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <User size={10} />
                              {scene.characters.length}
                            </span>
                          )}
                          {scene.music && <Music size={10} />}
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onPlayFromScene && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayFromScene(scene.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Play from here"
                      >
                        <Play size={12} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenSceneBuilder(scene);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                      title="Edit Scene"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSceneIndex(index);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                      title="Set as Current"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScene(scene);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (scenes.length > 1) {
                          deleteScene(scene.id);
                        }
                      }}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400"
                      title="Delete"
                      disabled={scenes.length <= 1}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative overflow-auto bg-gray-900" style={{ userSelect: isDragging ? 'none' : 'auto' }}>
        {/* Canvas Header */}
        <div className="absolute top-4 left-4 z-20 bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center gap-2">
          <button
            onClick={() => setShowScenePreviews(!showScenePreviews)}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              showScenePreviews 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
            }`}
            title={showScenePreviews ? 'Hide Canvas' : 'Show Canvas'}
          >
            {showScenePreviews ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-sm font-medium">
              {showScenePreviews ? 'Hide Canvas' : 'Show Canvas'}
            </span>
          </button>
          
          {/* Auto-Layout Button */}
          <button
            onClick={onAutoLayoutScenes}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            title="Auto-arrange scenes in a tree layout"
          >
            <Layout size={16} />
            <span className="text-sm font-medium">Auto-Layout</span>
          </button>
          
          {/* Debug Info */}
          <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            Scenes: {scenes.length}
          </div>
        </div>

        {/* Instructions Panel */}
        <div className="absolute top-4 right-4 z-20 bg-gray-800 border border-gray-700 rounded-lg p-3 max-w-xs">
          <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
            <MousePointer2 size={14} />
            Flow Builder Controls
          </h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• <strong>Single-click</strong> a scene to select and edit properties</li>
            <li>• <strong>Double-click</strong> a scene to open advanced editor</li>
            <li>• <strong>Click & drag</strong> to move scenes around</li>
            <li>• <strong>Touch scenes</strong> while dragging to auto-connect them</li>
            <li>• Use right panel to quickly add choices and connections</li>
          </ul>
        </div>
        
        <div
          ref={canvasRef}
          className="relative min-w-full min-h-full"
          style={{ width: '2500px', height: '1500px' }}
          onClick={() => !isDragging && setSelectedSceneId(null)}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          />
          
          {/* Connections SVG */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '2500px', height: '1500px' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#8B5CF6" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {renderConnections()}
          </svg>
          
          {/* Scene Nodes */}
          {scenes.map((scene, index) => (
            <SceneNode key={scene.id} scene={scene} index={index} />
          ))}

          {/* Join Nodes UI */}
          {renderJoinNodesUI()}
        </div>
      </div>

      {/* Right Sidebar - Quick Edit Panel */}
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {selectedScene ? (
          <>
            {/* Scene Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Quick Edit</h3>
                <div className="flex items-center gap-2">
                  {onPlayFromScene && (
                    <button
                      onClick={() => onPlayFromScene(selectedScene.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      title="Play from this scene"
                    >
                      <Play size={14} />
                      Play
                    </button>
                  )}
                  <button
                    onClick={() => onOpenSceneBuilder(selectedScene)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="Open Advanced Editor"
                  >
                    <Maximize2 size={14} />
                    Advanced
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Scene Title</label>
                <input
                  type="text"
                  value={selectedScene.title}
                  onChange={(e) => updateScene(selectedScene.id, { title: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
            </div>

            {/* Quick Settings */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={selectedScene.description}
                  onChange={(e) => updateScene(selectedScene.id, { description: e.target.value })}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white h-16 resize-none"
                  placeholder="Enter scene description..."
                />
              </div>

              {/* Characters in Scene */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User size={14} />
                    Characters in Scene
                  </label>
                  <button
                    onClick={addCharacterToScene}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                    disabled={!characters.length}
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedScene.characters?.map(sceneCharacter => {
                    const character = characters.find(c => c.id === sceneCharacter.characterId);
                    if (!character) return null;
                    
                    return (
                      <div key={sceneCharacter.id} className="bg-gray-700 rounded p-2 flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{ backgroundColor: character.color }}
                        >
                          <User size={12} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{character.name}</div>
                          {character.outfits && character.outfits.length > 0 && (
                            <div className="flex gap-2 text-xs">
                              <select
                                value={sceneCharacter.selectedOutfitId || ''}
                                onChange={(e) => {
                                  const newOutfitId = e.target.value;
                                  const newOutfit = character.outfits.find(o => o.id === newOutfitId);
                                  const firstPose = newOutfit ? Object.keys(newOutfit.poses)[0] : 'neutral';
                                  
                                  updateSceneCharacter(sceneCharacter.id, {
                                    selectedOutfitId: newOutfitId,
                                    selectedPose: firstPose
                                  });
                                }}
                                className="px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                              >
                                {character.outfits.map(outfit => (
                                  <option key={outfit.id} value={outfit.id}>
                                    {outfit.name}
                                  </option>
                                ))}
                              </select>
                              
                              {(() => {
                                const selectedOutfit = character.outfits.find(o => o.id === sceneCharacter.selectedOutfitId);
                                const poses = selectedOutfit?.poses || {};
                                
                                return Object.keys(poses).length > 0 && (
                                  <select
                                    value={sceneCharacter.selectedPose || Object.keys(poses)[0] || ''}
                                    onChange={(e) => updateSceneCharacter(sceneCharacter.id, {
                                      selectedPose: e.target.value
                                    })}
                                    className="px-1 py-0.5 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                                  >
                                    {Object.keys(poses).map(pose => (
                                      <option key={pose} value={pose}>
                                        {pose}
                                      </option>
                                    ))}
                                  </select>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeSceneCharacter(sceneCharacter.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                  
                  {(!selectedScene.characters || selectedScene.characters.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No characters in this scene yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Dialogue */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <MessageSquare size={14} />
                    Dialogue
                  </label>
                  <button
                    onClick={addDialogue}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedScene.dialogue?.map((line, index) => (
                    <div key={line.id} className="bg-gray-700 rounded p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                          <select
                            value={line.character || ''}
                            onChange={(e) => updateDialogue(line.id, { character: e.target.value || null })}
                            className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white"
                          >
                            <option value="">Narrator</option>
                            {characters.map(character => (
                              <option key={character.id} value={character.name}>
                                {character.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => deleteDialogue(line.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      
                      <textarea
                        value={line.text}
                        onChange={(e) => updateDialogue(line.id, { text: e.target.value })}
                        placeholder="Enter dialogue text..."
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:border-purple-500 focus:outline-none text-white text-sm h-16 resize-none"
                      />
                    </div>
                  ))}
                  
                  {(!selectedScene.dialogue || selectedScene.dialogue.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No dialogue in this scene yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Choices */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <GitBranch size={14} />
                    Choices
                    {isDragging && (
                      <span className="text-xs text-purple-400 bg-purple-600/20 px-2 py-1 rounded">
                        Drag scenes together to auto-connect
                      </span>
                    )}
                  </label>
                  <button
                    onClick={addChoice}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {selectedScene.choices?.map(choice => (
                    <div key={choice.id} className="bg-gray-700 rounded p-3 space-y-2">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(choice.id, { text: e.target.value })}
                        placeholder="Choice text"
                        className="w-full p-2 bg-gray-600 border border-gray-500 rounded focus:border-purple-500 focus:outline-none text-white text-sm"
                      />
                      
                      <div className="flex gap-2">
                        <select
                          value={choice.targetSceneId}
                          onChange={(e) => updateChoice(choice.id, { targetSceneId: e.target.value })}
                          className="flex-1 p-1 bg-gray-600 border border-gray-500 rounded focus:border-purple-500 focus:outline-none text-white text-sm"
                        >
                          <option value="">Select target scene</option>
                          {scenes.filter(s => s.id !== selectedScene.id).map(scene => (
                            <option key={scene.id} value={scene.id}>{scene.title}</option>
                          ))}
                        </select>
                        
                        <button
                          onClick={() => deleteChoice(choice.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(!selectedScene.choices || selectedScene.choices.length === 0) && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No choices yet. Add a choice to connect to other scenes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <Square size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Select a Scene</h3>
              <p className="text-gray-500 mb-4">Choose a scene from the canvas to edit its properties</p>
              <div className="text-xs text-gray-400 bg-gray-700 rounded p-2 space-y-1">
                <div><strong>Tip:</strong> Single-click any scene to select it instantly</div>
                <div><strong>Edit:</strong> Double-click any scene to open the advanced editor</div>
                <div><strong>Connect:</strong> Drag scenes close together to auto-connect them!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}