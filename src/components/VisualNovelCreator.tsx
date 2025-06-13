import React, { useState } from 'react';
import { 
  Play, Edit, Trash2, Copy,
  FileText, Image, User, Music, Film,
  BookOpen, Monitor, Smartphone, Tablet,
  GitBranch, PenTool, Brain
} from 'lucide-react';
import AssetManager from './AssetManager';
import CutsceneEditor from './CutsceneEditor';
import SceneBuilder from './SceneBuilder';
import FlowBuilder from './FlowBuilder';
import StoryEditor from './StoryEditor';
import GamePlayer from './GamePlayer';
import LogicBuilder from './LogicBuilder';
import ConditionModal from './ConditionModal';

const VisualNovelCreator = () => {
  // Main project state
  const [project, setProject] = useState({
    title: 'My Visual Novel',
    description: 'A new interactive story',
    author: 'Author Name',
    version: '1.0.0',
    created: new Date().toISOString(),
    modified: new Date().toISOString()
  });

  // ✨ NEW: Game Variables and Logic System
  const [gameVariables, setGameVariables] = useState({
    playerStats: {
      strength: { value: 10, min: 0, max: 100, label: 'Strength' },
      intelligence: { value: 10, min: 0, max: 100, label: 'Intelligence' },
      charisma: { value: 10, min: 0, max: 100, label: 'Charisma' },
      health: { value: 100, min: 0, max: 100, label: 'Health' },
      energy: { value: 100, min: 0, max: 100, label: 'Energy' },
      money: { value: 50, min: 0, max: 9999, label: 'Money' }
    },
    relationships: {
      emma_friendship: { value: 0, min: 0, max: 100, label: 'Emma Friendship' },
      alex_trust: { value: 0, min: 0, max: 100, label: 'Alex Trust' },
      teacher_respect: { value: 50, min: 0, max: 100, label: 'Teacher Respect' }
    },
    storyFlags: {
      prologue_completed: { value: false, label: 'Prologue Completed' },
      first_day_school: { value: false, label: 'First Day at School' },
      met_alex: { value: false, label: 'Met Alex' },
      discovered_secret: { value: false, label: 'Discovered Secret' },
      magic_revealed: { value: false, label: 'Magic Revealed' }
    },
    inventory: {
      items: [],
      maxSlots: 20
    },
    timeSystem: {
      day: 1,
      timeOfDay: 'morning', // morning, afternoon, evening, night
      dayOfWeek: 'monday',
      season: 'spring',
      customPeriods: {} // For user-defined time periods like "early_morning"
    },
    customVariables: []
  });

  // Main interface state
  const [activeMainTab, setActiveMainTab] = useState('story'); // 'story', 'flow', or 'editor'

  // Scene management
  const [scenes, setScenes] = useState([
    {
      id: 'scene1',
      title: 'Opening Scene',
      description: 'The story begins...',
      background: null,
      characters: [],
      dialogue: [
        {
          id: 'line1',
          character: null,
          text: 'Welcome to your visual novel!',
          choices: []
        }
      ],
      choices: [
        {
          id: 'choice1',
          text: 'Continue to Scene 2',
          targetSceneId: 'scene2'
        }
      ],
      music: null,
      effects: {
        transition: 'fade',
        duration: 1000
      },
      position: { x: 200, y: 100 }
    },
    {
      id: 'scene2',
      title: 'Second Scene',
      description: 'The adventure continues...',
      background: null,
      characters: [],
      dialogue: [
        {
          id: 'line2',
          character: null,
          text: 'This is the second scene of your story.',
          choices: []
        }
      ],
      choices: [],
      music: null,
      effects: {
        transition: 'fade',
        duration: 1000
      },
      position: { x: 500, y: 100 }
    }
  ]);

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);

  // Asset management
  const [backgrounds, setBackgrounds] = useState([
    {
      id: 'bg1',
      name: 'Classroom',
      type: 'image',
      category: 'indoor',
      url: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg',
      description: 'A bright classroom scene',
      tags: ['school', 'indoor', 'daytime'],
      metadata: {
        size: '2.1 MB',
        dimensions: '1920x1080',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    },
    {
      id: 'bg2',
      name: 'Park',
      type: 'image',
      category: 'outdoor',
      url: 'https://images.pexels.com/photos/33109/fall-autumn-red-season.jpg',
      description: 'A peaceful park in autumn',
      tags: ['nature', 'outdoor', 'autumn'],
      metadata: {
        size: '1.8 MB',
        dimensions: '1920x1080',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    },
    {
      id: 'bg3',
      name: 'Sunset Gradient',
      type: 'gradient',
      category: 'abstract',
      colors: ['#ff7e5f', '#feb47b'],
      description: 'Warm sunset gradient background',
      tags: ['gradient', 'warm', 'sunset'],
      metadata: {
        size: '< 1 KB',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }
  ]);

  // Updated character structure with outfits
  const [characters, setCharacters] = useState([
    {
      id: 'char1',
      name: 'Emma',
      description: 'The main protagonist',
      category: 'protagonist',
      color: '#FF6B6B',
      outfits: [
        {
          id: 'outfit1',
          name: 'School Uniform',
          poses: {
            neutral: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
            happy: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            sad: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        },
        {
          id: 'outfit2',
          name: 'Casual Clothes',
          poses: {
            neutral: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            happy: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        }
      ],
      tags: ['main', 'student', 'friendly'],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    },
    {
      id: 'char2',
      name: 'Alex',
      description: 'The mysterious transfer student',
      category: 'supporting',
      color: '#4ECDC4',
      outfits: [
        {
          id: 'outfit3',
          name: 'Default',
          poses: {
            neutral: 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=400',
            serious: 'https://images.pexels.com/photos/3823495/pexels-photo-3823495.jpeg?auto=compress&cs=tinysrgb&w=400'
          }
        }
      ],
      tags: ['mysterious', 'student', 'transfer'],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }
  ]);

  const [music, setMusic] = useState([
    {
      id: 'music1',
      name: 'Peaceful Morning',
      category: 'ambient',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      description: 'Calm background music for peaceful scenes',
      tags: ['calm', 'morning', 'ambient'],
      metadata: {
        duration: '3:24',
        size: '4.2 MB',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }
  ]);

  const [soundEffects, setSoundEffects] = useState([
    {
      id: 'sfx1',
      name: 'Page Turn',
      category: 'ui',
      url: 'https://www.soundjay.com/misc/sounds/page-flip-01a.wav',
      description: 'Sound for page turning',
      tags: ['ui', 'page', 'turn'],
      metadata: {
        duration: '0:02',
        size: '48 KB',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }
  ]);

  const [videos, setVideos] = useState([
    {
      id: 'video1',
      name: 'Opening Sequence',
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      description: 'Opening cutscene video',
      tags: ['opening', 'intro'],
      metadata: {
        duration: '30s',
        size: '1 MB',
        dimensions: '1280x720',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    }
  ]);

  const [cutscenes, setCutscenes] = useState([]);

  // Items for inventory system
  const [items, setItems] = useState([]);

  // UI state
  const [activeModal, setActiveModal] = useState(null);
  const [activeAssetTab, setActiveAssetTab] = useState('backgrounds');
  const [editingScene, setEditingScene] = useState(null);
  const [isAssetSelectionMode, setIsAssetSelectionMode] = useState(false);
  const [showLogicBuilder, setShowLogicBuilder] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [editingSceneCondition, setEditingSceneCondition] = useState(null);
  const [assetSelectionType, setAssetSelectionType] = useState(null);

  // Game Player state
  const [showGamePlayer, setShowGamePlayer] = useState(false);
  const [gamePlayerStartSceneId, setGamePlayerStartSceneId] = useState(null);

  // Preview state
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreviewControls, setShowPreviewControls] = useState(true);

  // Scene conditions and logic
  const [sceneConditions, setSceneConditions] = useState(new Map());
  const [locationScenes, setLocationScenes] = useState(new Map());

  const assetCategories = {
    backgrounds: ['all', 'indoor', 'outdoor', 'abstract', 'fantasy'],
    characters: ['all', 'protagonist', 'supporting', 'antagonist', 'npc'],
    audio: ['all', 'ambient', 'dramatic', 'ui', 'voice'],
    items: ['all', 'consumable', 'equipment', 'key', 'quest', 'material', 'general']
  };

  const currentScene = scenes[currentSceneIndex] || scenes[0];

  // Helper function to get character's default image URL
  const getCharacterDefaultImage = (character) => {
    if (!character.outfits || character.outfits.length === 0) return null;
    const defaultOutfit = character.outfits[0];
    return defaultOutfit.poses?.neutral || Object.values(defaultOutfit.poses)[0] || null;
  };

  // Helper function to get character image by outfit and pose
  const getCharacterImage = (character, outfitId, poseId) => {
    if (!character.outfits) return null;
    const outfit = character.outfits.find(o => o.id === outfitId);
    if (!outfit) return getCharacterDefaultImage(character);
    return outfit.poses?.[poseId] || outfit.poses?.neutral || Object.values(outfit.poses)[0] || null;
  };

  // Auto-layout algorithm for scenes
  const autoLayoutScenes = (scenes) => {
    if (!scenes || scenes.length === 0) return scenes;

    // Configuration
    const LAYER_HEIGHT = 220;
    const NODE_WIDTH = 300;
    const HORIZONTAL_SPACING = 350;
    const START_X = 200;
    const START_Y = 100;

    // Build dependency graph
    const sceneMap = new Map();
    const incomingConnections = new Map();
    const outgoingConnections = new Map();

    scenes.forEach(scene => {
      sceneMap.set(scene.id, scene);
      incomingConnections.set(scene.id, new Set());
      outgoingConnections.set(scene.id, new Set());
    });

    // Analyze connections
    scenes.forEach(scene => {
      scene.choices?.forEach(choice => {
        if (choice.targetSceneId && sceneMap.has(choice.targetSceneId)) {
          outgoingConnections.get(scene.id).add(choice.targetSceneId);
          incomingConnections.get(choice.targetSceneId).add(scene.id);
        }
      });
    });

    // Find root nodes (scenes with no incoming connections)
    const roots = scenes.filter(scene => 
      incomingConnections.get(scene.id).size === 0
    ).map(scene => scene.id);

    // If no roots found (circular dependencies), use the first scene
    if (roots.length === 0 && scenes.length > 0) {
      roots.push(scenes[0].id);
    }

    // Assign layers using BFS
    const layers = [];
    const visited = new Set();
    const sceneToLayer = new Map();

    const queue = roots.map(rootId => ({ id: rootId, layer: 0 }));

    while (queue.length > 0) {
      const { id, layer } = queue.shift();

      if (visited.has(id)) continue;
      visited.add(id);

      // Ensure layer array exists
      while (layers.length <= layer) {
        layers.push([]);
      }

      layers[layer].push(id);
      sceneToLayer.set(id, layer);

      // Add children to queue
      outgoingConnections.get(id).forEach(targetId => {
        if (!visited.has(targetId)) {
          queue.push({ id: targetId, layer: layer + 1 });
        }
      });
    }

    // Handle unvisited nodes (isolated or in cycles)
    scenes.forEach(scene => {
      if (!visited.has(scene.id)) {
        const lastLayer = layers.length;
        while (layers.length <= lastLayer) {
          layers.push([]);
        }
        layers[lastLayer].push(scene.id);
        sceneToLayer.set(scene.id, lastLayer);
      }
    });

    // Calculate positions
    const updatedScenes = scenes.map(scene => {
      const layer = sceneToLayer.get(scene.id);
      const layerScenes = layers[layer];
      const indexInLayer = layerScenes.indexOf(scene.id);

      // Center the layer horizontally
      const layerWidth = (layerScenes.length - 1) * HORIZONTAL_SPACING;
      const layerStartX = START_X - layerWidth / 2;

      const x = Math.max(50, layerStartX + indexInLayer * HORIZONTAL_SPACING);
      const y = START_Y + layer * LAYER_HEIGHT;

      return {
        ...scene,
        position: {
          ...scene.position,
          x,
          y
        }
      };
    });

    return updatedScenes;
  };

  // Asset management functions
  const filterAssets = (assets, searchQuery, category) => {
    return assets.filter(asset => {
      const matchesSearch = !searchQuery || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = category === 'all' || asset.category === category;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Updated file upload handler for new character structure
  const handleFileUpload = (files, assetType) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAsset = {
          id: `${assetType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video',
          category: 'custom',
          url: e.target.result,
          description: `Uploaded ${file.type}`,
          tags: ['custom', 'uploaded'],
          metadata: {
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
            dimensions: file.type.startsWith('image/') ? 'Unknown' : undefined,
            duration: file.type.startsWith('audio/') || file.type.startsWith('video/') ? 'Unknown' : undefined,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
          }
        };

        if (assetType === 'backgrounds') {
          setBackgrounds(prev => [...prev, newAsset]);
        } else if (assetType === 'characters') {
          // Create character with default outfit structure
          const newCharacter = {
            ...newAsset,
            color: '#8B5CF6', // Default purple color
            outfits: [
              {
                id: `outfit_${Date.now()}`,
                name: 'Default',
                poses: {
                  neutral: newAsset.url
                }
              }
            ]
          };
          delete newCharacter.url; // Remove top-level url since it's now in outfits
          setCharacters(prev => [...prev, newCharacter]);
        } else if (assetType === 'audio') {
          if (file.type.includes('music') || file.name.includes('music')) {
            setMusic(prev => [...prev, newAsset]);
          } else {
            setSoundEffects(prev => [...prev, newAsset]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Updated delete handler for new character structure
  const handleDeleteAsset = (assetId, assetType) => {
    if (assetType === 'backgrounds') {
      setBackgrounds(prev => prev.filter(asset => asset.id !== assetId));
    } else if (assetType === 'characters') {
      setCharacters(prev => prev.filter(asset => asset.id !== assetId));
      // Also remove character from any scenes
      setScenes(prev => prev.map(scene => ({
        ...scene,
        characters: scene.characters?.filter(char => char.characterId !== assetId) || []
      })));
    } else if (assetType === 'audio') {
      setMusic(prev => prev.filter(asset => asset.id !== assetId));
      setSoundEffects(prev => prev.filter(asset => asset.id !== assetId));
    }
  };

  // Updated duplicate handler for new character structure
  const handleDuplicateAsset = (asset, assetType) => {
    const newAsset = {
      ...asset,
      id: `${assetType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${asset.name} (Copy)`,
      metadata: {
        ...asset.metadata,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    };

    if (assetType === 'backgrounds') {
      setBackgrounds(prev => [...prev, newAsset]);
    } else if (assetType === 'characters') {
      // Duplicate outfits with new IDs
      if (newAsset.outfits) {
        newAsset.outfits = newAsset.outfits.map(outfit => ({
          ...outfit,
          id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        }));
      }
      setCharacters(prev => [...prev, newAsset]);
    } else if (assetType === 'audio') {
      if (music.find(m => m.id === asset.id)) {
        setMusic(prev => [...prev, newAsset]);
      } else {
        setSoundEffects(prev => [...prev, newAsset]);
      }
    }
  };

  // Character management functions
  const handleUpdateCharacter = (characterId, updates) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId ? { ...char, ...updates } : char
    ));
  };

  const handleAddOutfit = (characterId, outfitData) => {
    const newOutfit = {
      id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: outfitData.name || 'New Outfit',
      poses: {
        neutral: outfitData.neutralPose || null
      }
    };

    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? { ...char, outfits: [...(char.outfits || []), newOutfit] }
        : char
    ));

    return newOutfit.id;
  };

  const handleUpdateOutfit = (characterId, outfitId, updates) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? {
            ...char,
            outfits: char.outfits?.map(outfit => 
              outfit.id === outfitId ? { ...outfit, ...updates } : outfit
            ) || []
          }
        : char
    ));
  };

  const handleDeleteOutfit = (characterId, outfitId) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? {
            ...char,
            outfits: char.outfits?.filter(outfit => outfit.id !== outfitId) || []
          }
        : char
    ));
  };

  const handleAddPose = (characterId, outfitId, poseName, imageUrl) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? {
            ...char,
            outfits: char.outfits?.map(outfit => 
              outfit.id === outfitId 
                ? {
                    ...outfit,
                    poses: {
                      ...outfit.poses,
                      [poseName]: imageUrl
                    }
                  }
                : outfit
            ) || []
          }
        : char
    ));
  };

  const handleDeletePose = (characterId, outfitId, poseName) => {
    setCharacters(prev => prev.map(char => 
      char.id === characterId 
        ? {
            ...char,
            outfits: char.outfits?.map(outfit => 
              outfit.id === outfitId 
                ? {
                    ...outfit,
                    poses: Object.fromEntries(
                      Object.entries(outfit.poses).filter(([key]) => key !== poseName)
                    )
                  }
                : outfit
            ) || []
          }
        : char
    ));
  };

  // Story editor functions
  const handleAddCharacters = (newCharacters) => {
    setCharacters(prev => [...prev, ...newCharacters]);
  };

  const handleOpenAssetManager = () => {
    setActiveAssetTab('characters');
    setActiveModal('assetManager');
  };

  // Scene management functions
  const handleSceneUpdate = (sceneId, updates) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  };

  // Apply auto-layout to scenes
  const handleAutoLayoutScenes = () => {
    const layoutedScenes = autoLayoutScenes(scenes);
    setScenes(layoutedScenes);
  };

  // Updated to use new character structure with enhanced animations
  const handleAddCharacterToScene = (character) => {
    const defaultOutfit = character.outfits?.[0];
    const defaultPose = defaultOutfit ? Object.keys(defaultOutfit.poses)[0] : 'neutral';
    
    const newCharacterInScene = {
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
      // ✨ NEW: Enhanced Animation Properties
      animation: {
        // Entrance Animation
        entrance: {
          type: 'slideFromRight', // slideFromLeft, slideFromRight, fadeIn, slideUp, slideDown, none
          duration: 800, // milliseconds
          delay: 0, // milliseconds
          easing: 'ease-out'
        },
        
        // Exit Animation  
        exit: {
          type: 'slideToLeft', // slideToLeft, slideToRight, fadeOut, slideUp, slideDown, none
          duration: 600,
          delay: 0,
          easing: 'ease-in'
        },
        
        // Animation Timing
        timing: {
          enterOn: 'sceneStart', // 'sceneStart', 'firstDialogue', 'specificDialogue', 'characterDialogue'
          exitOn: 'sceneEnd', // 'sceneEnd', 'lastDialogue', 'specificDialogue', 'characterDialogue', 'manual'
          triggerDialogueIndex: null, // specific dialogue index to trigger entrance/exit
          triggerCharacterName: null, // character name whose dialogue triggers this animation
          triggerCharacterDialogueIndex: null // which dialogue of that character (1st, 2nd, etc.)
        },
        
        // Animation State (runtime)
        hasEntered: false,
        hasExited: false,
        isAnimating: false
      }
    };
    
    const updatedScene = {
      ...currentScene,
      characters: [...(currentScene.characters || []), newCharacterInScene]
    };
    handleSceneUpdate(currentScene.id, updatedScene);
    setActiveModal(null);
    setIsAssetSelectionMode(false);
  };

  const handleAssetSelection = (asset) => {
    if (assetSelectionType === 'background') {
      handleSceneUpdate(currentScene.id, { background: asset });
    } else if (assetSelectionType === 'character') {
      handleAddCharacterToScene(asset);
    } else if (assetSelectionType === 'music') {
      handleSceneUpdate(currentScene.id, { music: asset });
    }
    
    setActiveModal(null);
    setIsAssetSelectionMode(false);
    setAssetSelectionType(null);
  };

  const openAssetSelector = (type) => {
    setAssetSelectionType(type);
    setIsAssetSelectionMode(true);
    
    if (type === 'background') {
      setActiveAssetTab('backgrounds');
    } else if (type === 'character') {
      setActiveAssetTab('characters');
    } else if (type === 'music') {
      setActiveAssetTab('audio');
    }
    
    setActiveModal('assetManager');
  };

  const openSceneBuilder = (scene) => {
    setEditingScene(scene);
    setActiveModal('sceneBuilder');
  };

  const handleSaveScene = (updatedScene) => {
    handleSceneUpdate(updatedScene.id, updatedScene);
    setEditingScene(null);
    setActiveModal(null);
  };

  const removeCharacterFromScene = (characterId) => {
    const updatedScene = {
      ...currentScene,
      characters: (currentScene.characters || []).filter(char => char.id !== characterId)
    };
    handleSceneUpdate(currentScene.id, updatedScene);
  };

  // Switch to flow view
  const handleSwitchToFlow = () => {
    setActiveMainTab('flow');
  };

  // Auto-layout scenes when new scenes are generated
  const handleScenesUpdate = (newScenes) => {
    const layoutedScenes = autoLayoutScenes(newScenes);
    setScenes(layoutedScenes);
  };

  // Game Player functions
  const handlePlayGame = (startSceneId = null) => {
    setGamePlayerStartSceneId(startSceneId);
    setShowGamePlayer(true);
  };

  const handleCloseGamePlayer = () => {
    setShowGamePlayer(false);
    setGamePlayerStartSceneId(null);
  };

  // Logic Builder functions
  const handleOpenConditionModal = (scene) => {
    setEditingSceneCondition(scene);
    setShowConditionModal(true);
  };

  const handleSaveSceneCondition = (sceneId, condition) => {
    if (condition.type === 'always' || (condition.requirements && condition.requirements.length === 0)) {
      // Remove condition if set to always or no requirements
      setSceneConditions(prev => {
        const newMap = new Map(prev);
        newMap.delete(sceneId);
        return newMap;
      });
    } else {
      // Save condition
      setSceneConditions(prev => {
        const newMap = new Map(prev);
        newMap.set(sceneId, condition);
        return newMap;
      });
    }
  };

  // Preview functions
  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      default: return { width: '100%', height: '100%' };
    }
  };

  // Updated ScenePreview to use new character structure
  const ScenePreview = () => {
    if (!currentScene) return null;
    
    const backgroundStyle = currentScene.background 
      ? currentScene.background.type === 'image'
        ? { 
            backgroundImage: `url(${currentScene.background.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : currentScene.background.type === 'gradient'
          ? {
              background: `linear-gradient(135deg, ${currentScene.background.colors?.join(', ')})`
            }
          : { backgroundColor: currentScene.background.value || '#1a1a1a' }
      : { backgroundColor: '#1a1a1a' };

    return (
      <div 
        className="relative w-full h-full rounded-lg overflow-hidden cursor-pointer"
        style={backgroundStyle}
        onDoubleClick={() => openSceneBuilder(currentScene)}
      >
        {/* Characters */}
        {currentScene.characters?.map((sceneCharacter, index) => {
          const character = characters.find(c => c.id === sceneCharacter.characterId);
          if (!character) return null;
          
          const imageUrl = getCharacterImage(character, sceneCharacter.selectedOutfitId, sceneCharacter.selectedPose);
          if (!imageUrl) return null;

          return (
            <div
              key={sceneCharacter.id}
              className="absolute"
              style={{
                left: `${sceneCharacter.position?.x || 50}%`,
                top: `${sceneCharacter.position?.y || 50}%`,
                transform: `translate(-50%, -50%) scale(${sceneCharacter.position?.scale || 1}) rotate(${sceneCharacter.position?.rotation || 0}deg)`,
                opacity: sceneCharacter.opacity || 1,
                display: sceneCharacter.visible === false ? 'none' : 'block',
                zIndex: index
              }}
            >
              <img
                src={imageUrl}
                alt={character.name}
                className="h-32 object-contain"
                style={{
                  transform: `${sceneCharacter.flipX ? 'scaleX(-1)' : ''} ${sceneCharacter.flipY ? 'scaleY(-1)' : ''}`
                }}
              />
            </div>
          );
        })}

        {/* Scene info overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
          <div className="font-semibold">{currentScene.title}</div>
          <div className="text-xs opacity-75">{currentScene.description}</div>
        </div>

        {/* Edit scene hint */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Edit size={16} />
            Double-click to edit scene
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen size={24} className="text-purple-500" />
              {project.title}
            </h1>
            
            {/* Main Tab Navigation */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveMainTab('story')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeMainTab === 'story'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={16} />
                Story
              </button>
              <button
                onClick={() => setActiveMainTab('flow')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeMainTab === 'flow'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <GitBranch size={16} />
                Flow
              </button>
              <button
                onClick={() => setActiveMainTab('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeMainTab === 'editor'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <PenTool size={16} />
                Editor
              </button>
            </div>
            
            {activeMainTab === 'editor' && (
              <div className="text-sm text-gray-400">
                Scene {currentSceneIndex + 1} of {scenes.length}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Play Button - Always visible */}
            <button
              onClick={() => handlePlayGame()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Play from beginning"
            >
              <Play size={16} />
              Play
            </button>

            {/* Preview mode selector - only show in editor mode */}
            {activeMainTab === 'editor' && (
              <div className="flex bg-gray-700 rounded-lg p-1">
                {[
                  { mode: 'desktop', icon: Monitor },
                  { mode: 'tablet', icon: Tablet },
                  { mode: 'mobile', icon: Smartphone }
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`p-2 rounded transition-colors ${
                      previewMode === mode
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title={mode}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveModal('assetManager')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Image size={16} />
              Assets
            </button>
            
            <button
              onClick={() => setActiveModal('cutsceneEditor')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Film size={16} />
              Cutscenes
            </button>

            <button
              onClick={() => setShowLogicBuilder(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Brain size={16} />
              Logic
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-5rem)]">
        {activeMainTab === 'story' ? (
          /* Story Editor View */
          <StoryEditor
            scenes={scenes}
            setScenes={handleScenesUpdate}
            characters={characters}
            onSwitchToFlow={handleSwitchToFlow}
            onAddCharacters={handleAddCharacters}
            onOpenAssetManager={handleOpenAssetManager}
          />
        ) : activeMainTab === 'flow' ? (
          /* Flow Builder View */
          <FlowBuilder
            scenes={scenes}
            setScenes={setScenes}
            onOpenSceneBuilder={openSceneBuilder}
            currentSceneIndex={currentSceneIndex}
            setCurrentSceneIndex={setCurrentSceneIndex}
            characters={characters}
            backgrounds={backgrounds}
            videos={videos}
            cutscenes={cutscenes}
            getCharacterDefaultImage={getCharacterDefaultImage}
            onAutoLayoutScenes={handleAutoLayoutScenes}
            onPlayFromScene={handlePlayGame}
          />
        ) : (
          /* Editor View */
          <div className="flex h-full">
            {/* Scene List Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto logic-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Scenes</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowLogicBuilder(true)}
                    className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                    title="Logic Builder"
                  >
                    <Brain size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveMainTab('flow')}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Open Flow Builder"
                  >
                    <GitBranch size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Logic Panel */}
              <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                    <Brain size={12} />
                    Logic Overview
                  </h3>
                  <button
                    onClick={() => setShowLogicBuilder(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Day:</span>
                    <span className="text-blue-300">{gameVariables.timeSystem.day}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="text-blue-300 capitalize">{gameVariables.timeSystem.timeOfDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Flags:</span>
                    <span className="text-green-300">
                      {Object.values(gameVariables.storyFlags).filter(f => f.value).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conditions:</span>
                    <span className="text-purple-300">{sceneConditions.size} scenes</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      index === currentSceneIndex
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div 
                      onClick={() => setCurrentSceneIndex(index)}
                      className="flex-1"
                    >
                      <div className="font-medium">{scene.title}</div>
                      <div className="text-xs opacity-75 truncate">{scene.description}</div>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {scene.background && <Image size={12} />}
                        {scene.characters && scene.characters.length > 0 && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {scene.characters.length}
                          </span>
                        )}
                        {scene.music && <Music size={12} />}
                        {scene.choices && scene.choices.length > 0 && (
                          <span className="flex items-center gap-1">
                            <GitBranch size={12} />
                            {scene.choices.length}
                          </span>
                        )}
                        {sceneConditions.has(scene.id) && (
                          <span className="flex items-center gap-1 text-purple-400" title="Has conditions">
                            <Brain size={12} />
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Scene Actions */}
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayGame(scene.id);
                        }}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        title="Play from here"
                      >
                        <Play size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openSceneBuilder(scene);
                        }}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Edit Scene"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenConditionModal(scene);
                        }}
                        className={`p-1 transition-colors ${
                          sceneConditions.has(scene.id)
                            ? 'text-purple-400 hover:text-purple-300'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title="Scene Logic"
                      >
                        <Brain size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle scene duplication
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Duplicate Scene"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle scene deletion
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Scene"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
              {/* Scene Editor Toolbar */}
              <div className="bg-gray-750 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentScene?.title || ''}
                      onChange={(e) => handleSceneUpdate(currentScene.id, { title: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-none outline-none text-white"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayGame(currentScene.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                      title="Play from this scene"
                    >
                      <Play size={14} />
                      Play Here
                    </button>

                    <button
                      onClick={() => openSceneBuilder(currentScene)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Scene
                    </button>
                    
                    <button
                      onClick={() => openAssetSelector('background')}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <Image size={14} />
                      Background
                    </button>
                    
                    <button
                      onClick={() => openAssetSelector('music')}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <Music size={14} />
                      Music
                    </button>

                    <button
                      onClick={() => setShowLogicBuilder(true)}
                      className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                        sceneConditions.has(currentScene?.id) 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                      title="Scene Logic & Variables"
                    >
                      <Brain size={14} />
                      Logic
                    </button>
                  </div>
                </div>
              </div>

              {/* Scene Preview */}
              <div className="flex-1 p-4 bg-gray-900">
                <div 
                  className="mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden"
                  style={getPreviewDimensions()}
                >
                  <div className="w-full h-full">
                    <ScenePreview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Player */}
      {showGamePlayer && (
        <GamePlayer
          isOpen={showGamePlayer}
          onClose={handleCloseGamePlayer}
          scenes={scenes}
          characters={characters}
          backgrounds={backgrounds}
          music={music}
          soundEffects={soundEffects}
          videos={videos}
          cutscenes={cutscenes}
          startSceneId={gamePlayerStartSceneId}
          getCharacterImage={getCharacterImage}
          getCharacterDefaultImage={getCharacterDefaultImage}
        />
      )}

      {/* Modals */}
      {activeModal === 'assetManager' && (
        <AssetManager
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setIsAssetSelectionMode(false);
            setAssetSelectionType(null);
          }}
          activeTab={activeAssetTab}
          setActiveTab={setActiveAssetTab}
          backgrounds={backgrounds}
          setBackgrounds={setBackgrounds}
          characters={characters}
          setCharacters={setCharacters}
          music={music}
          setMusic={setMusic}
          soundEffects={soundEffects}
          setSoundEffects={setSoundEffects}
          assetCategories={assetCategories}
          onFileUpload={handleFileUpload}
          onDeleteAsset={handleDeleteAsset}
          onDuplicateAsset={handleDuplicateAsset}
          filterAssets={filterAssets}
          onSelectAsset={isAssetSelectionMode ? handleAssetSelection : null}
          // Character management props
          getCharacterDefaultImage={getCharacterDefaultImage}
          getCharacterImage={getCharacterImage}
          onUpdateCharacter={handleUpdateCharacter}
          onAddOutfit={handleAddOutfit}
          onUpdateOutfit={handleUpdateOutfit}
          onDeleteOutfit={handleDeleteOutfit}
          onAddPose={handleAddPose}
          onDeletePose={handleDeletePose}
        />
      )}

      {activeModal === 'cutsceneEditor' && (
        <CutsceneEditor
          isOpen={true}
          onClose={() => setActiveModal(null)}
          cutscenes={cutscenes}
          setCutscenes={setCutscenes}
          videos={videos}
          scenes={scenes}
        />
      )}

      {activeModal === 'sceneBuilder' && editingScene && (
        <SceneBuilder
          isOpen={true}
          onClose={() => {
            setActiveModal(null);
            setEditingScene(null);
          }}
          scene={editingScene}
          onSave={handleSaveScene}
          backgrounds={backgrounds}
          characters={characters}
          music={music}
          soundEffects={soundEffects}
          assetCategories={assetCategories}
          onFileUpload={handleFileUpload}
          onDeleteAsset={handleDeleteAsset}
          onDuplicateAsset={handleDuplicateAsset}
          filterAssets={filterAssets}
          getCharacterDefaultImage={getCharacterDefaultImage}
          getCharacterImage={getCharacterImage}
        />
      )}

      {/* Logic Builder Modal */}
      <LogicBuilder
        isOpen={showLogicBuilder}
        onClose={() => setShowLogicBuilder(false)}
        gameVariables={gameVariables}
        setGameVariables={setGameVariables}
        sceneConditions={sceneConditions}
        setSceneConditions={setSceneConditions}
        scenes={scenes}
        characters={characters}
        onOpenAssetManager={(assetType) => {
          if (assetType === 'items') {
            setActiveAssetTab('items');
            setActiveModal('assetManager');
          }
        }}
      />

      {/* Condition Modal */}
      <ConditionModal
        isOpen={showConditionModal}
        onClose={() => {
          setShowConditionModal(false);
          setEditingSceneCondition(null);
        }}
        scene={editingSceneCondition}
        condition={editingSceneCondition ? sceneConditions.get(editingSceneCondition.id) : null}
        onSave={handleSaveSceneCondition}
        gameVariables={gameVariables}
      />
    </div>
  );
};

export default VisualNovelCreator;