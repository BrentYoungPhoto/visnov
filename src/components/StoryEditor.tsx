import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Play, FileText, AlertCircle, CheckCircle, 
  Edit, Save, RotateCw, Eye, HelpCircle, Copy, Download,
  ChevronRight, User, Image, Music, GitBranch, X,
  Settings, Plus, AlertTriangle
} from 'lucide-react';

const StoryEditor = ({ scenes, setScenes, characters, onSwitchToFlow, onAddCharacters, onOpenAssetManager }) => {
  const [storyText, setStoryText] = useState(getStoryTextFromScenes(scenes));
  const [isGenerating, setIsGenerating] = useState(false);
  const [parseErrors, setParseErrors] = useState([]);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [missingCharacters, setMissingCharacters] = useState([]);
  const [showMissingCharactersModal, setShowMissingCharactersModal] = useState(false);
  const [showExamplesDropdown, setShowExamplesDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowExamplesDropdown(false);
      }
    };

    if (showExamplesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExamplesDropdown]);

  // Convert existing scenes back to story text format
  function getStoryTextFromScenes(scenes) {
    if (!scenes || scenes.length === 0) return getExampleStory();
    
    let text = '';
    scenes.forEach((scene, index) => {
      text += `# ${scene.title}\n`;
      if (scene.description) {
        text += `Description: ${scene.description}\n`;
      }
      text += '\n';
      
      // Add dialogue
      if (scene.dialogue && scene.dialogue.length > 0) {
        scene.dialogue.forEach(line => {
          if (line.character) {
            const character = characters.find(c => c.name === line.character);
            if (character) {
              text += `Character: ${character.name}\n`;
            }
          }
          text += `Dialogue: ${line.text}\n`;
        });
      }
      
      // Add choices
      if (scene.choices && scene.choices.length > 0) {
        scene.choices.forEach(choice => {
          const targetScene = scenes.find(s => s.id === choice.targetSceneId);
          if (targetScene) {
            text += `Choice: ${choice.text} → ${targetScene.title}\n`;
          }
        });
      }
      
      text += '\n';
    });
    
    return text;
  }

  // Get example story text
  function getExampleStory() {
    return `# Welcome Scene
Description: The story begins in a peaceful town square.

Character: Emma - Enters Right - Beginning of Scene - Delay 500ms
Dialogue: Welcome to our visual novel adventure! 

Character: Ben - Enters Left - 1st Dialogue of @Emma - Delay 300ms
Dialogue: This is an example of how character animations work.

Dialogue: Characters can enter from different directions and at different times.

Choice: Continue the story → Meeting Scene
Choice: Learn more about animations → Animation Demo

# Animation Demo
Description: A demonstration of different character animation types.

Character: Alice - Fade In - Beginning of Scene - Delay 1000ms
Dialogue: I fade in slowly at the beginning of the scene.

Character: Bob - Enters Up - 2nd Dialogue - Exit Fade Out - Scene End
Dialogue: I slide up from the bottom on the second dialogue!

Character: Carol - Enters Down - 3rd Dialogue - Delay 800ms
Dialogue: And I slide down from the top with a delay.

Dialogue: You can see how different animations create dynamic scenes.

Choice: Go back → Welcome Scene
Choice: Continue to meeting → Meeting Scene

# Meeting Scene  
Description: The characters meet in the town center.

Character: Emma - Enters Left - Beginning of Scene
Character: Ben - Enters Right - 1st Dialogue of @Emma

Dialogue: Now we're both here in the scene.
Dialogue: The animation system supports complex timing logic.

Choice: End the demo → Welcome Scene`;
  }

  // Create a placeholder character with default outfit structure
  function createPlaceholderCharacter(name) {
    const placeholderColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const colorIndex = Math.abs(name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % placeholderColors.length;
    
    // Create a simple colored rectangle as placeholder image
    const createPlaceholderImage = (color, label) => {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      // Fill background
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 200, 300);
      
      // Add character name text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, 100, 150);
      ctx.font = '12px Arial';
      ctx.fillText(label, 100, 170);
      
      return canvas.toDataURL();
    };

    return {
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      description: `Auto-generated character placeholder for ${name}`,
      category: 'protagonist',
      color: placeholderColors[colorIndex],
      outfits: [
        {
          id: `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: 'Default',
          poses: {
            neutral: createPlaceholderImage(placeholderColors[colorIndex], 'Neutral'),
            happy: createPlaceholderImage(placeholderColors[colorIndex], 'Happy'),
            sad: createPlaceholderImage(placeholderColors[colorIndex], 'Sad')
          }
        }
      ],
      tags: ['auto-generated', 'placeholder'],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      isPlaceholder: true // Flag to identify auto-generated characters
    };
  }

  // Parse story text into scene objects with automatic character creation
  function parseStoryText(text) {
    const lines = text.split('\n').map(line => line.trim());
    const scenes = [];
    const errors = [];
    const newlyCreatedCharacters = [];
    const existingCharacterNames = new Set(characters.map(c => c.name));
    const createdCharacterNames = new Set();
    
    let currentScene = null;
    let currentCharacter = null;
    let lineNumber = 0;
    
    for (const line of lines) {
      lineNumber++;
      
      // Skip empty lines and comments
      if (!line || line.startsWith('//')) continue;
      
      try {
        // Scene title
        if (line.startsWith('# ')) {
          // Save previous scene if exists
          if (currentScene) {
            scenes.push(currentScene);
          }
          
          // Create new scene
          currentScene = {
            id: `scene_${Date.now()}_${scenes.length}`,
            title: line.substring(2).trim(),
            description: '',
            background: null,
            characters: [],
            dialogue: [],
            choices: [],
            music: null,
            effects: {
              transition: 'fade',
              duration: 1000
            },
            // Remove position assignment - will be handled by auto-layout
            position: null
          };
          currentCharacter = null;
        }
        // Description
        else if (line.startsWith('Description: ')) {
          if (!currentScene) {
            errors.push(`Line ${lineNumber}: Description found without a scene`);
            continue;
          }
          currentScene.description = line.substring(13).trim();
        }
        // ✨ Enhanced Character with Animation Support
        else if (line.startsWith('Character: ')) {
          const characterLine = line.substring(11).trim();
          
          // Parse character animation syntax
          // Format: "CharacterName - EnterDirection - Timing - Delay"
          // Examples:
          // "Emma - Enters Right - Beginning of Scene - Delay 1000ms"
          // "Ben - Enters Left - 1st Dialogue of @Emma - Delay 500ms"
          // "Alice - Fade In - 3rd Dialogue - Exit Fade Out - Scene End"
          
          const parseCharacterAnimation = (line) => {
            const parts = line.split(' - ').map(p => p.trim());
            const characterName = parts[0];
            
            const animation = {
              entrance: {
                type: 'fadeIn',
                duration: 800,
                delay: 0,
                easing: 'ease-out'
              },
              exit: {
                type: 'fadeOut',
                duration: 600,
                delay: 0,
                easing: 'ease-in'
              },
              timing: {
                enterOn: 'sceneStart',
                exitOn: 'sceneEnd',
                triggerDialogueIndex: null,
                triggerCharacterName: null,
                triggerCharacterDialogueIndex: null
              }
            };
            
            for (let i = 1; i < parts.length; i++) {
              const part = parts[i].toLowerCase();
              
              // Parse entrance animations
              if (part.includes('enters left') || part.includes('enter left')) {
                animation.entrance.type = 'slideFromLeft';
              } else if (part.includes('enters right') || part.includes('enter right')) {
                animation.entrance.type = 'slideFromRight';
              } else if (part.includes('enters up') || part.includes('enter up')) {
                animation.entrance.type = 'slideUp';
              } else if (part.includes('enters down') || part.includes('enter down')) {
                animation.entrance.type = 'slideDown';
              } else if (part.includes('fade in') || part.includes('enters fade')) {
                animation.entrance.type = 'fadeIn';
              }
              
              // Parse exit animations
              else if (part.includes('exit left') || part.includes('exits left')) {
                animation.exit.type = 'slideToLeft';
              } else if (part.includes('exit right') || part.includes('exits right')) {
                animation.exit.type = 'slideToRight';
              } else if (part.includes('exit up') || part.includes('exits up')) {
                animation.exit.type = 'slideUp';
              } else if (part.includes('exit down') || part.includes('exits down')) {
                animation.exit.type = 'slideDown';
              } else if (part.includes('exit fade') || part.includes('fade out')) {
                animation.exit.type = 'fadeOut';
              }
              
              // Parse timing - entrance
              else if (part.includes('beginning of scene') || part.includes('scene start')) {
                animation.timing.enterOn = 'sceneStart';
              } else if (part.includes('first dialogue') || part.includes('1st dialogue')) {
                animation.timing.enterOn = 'firstDialogue';
              } else if (part.match(/(\d+)(st|nd|rd|th)\s+dialogue/)) {
                const match = part.match(/(\d+)(st|nd|rd|th)\s+dialogue/);
                animation.timing.enterOn = 'specificDialogue';
                animation.timing.triggerDialogueIndex = parseInt(match[1]) - 1; // Convert to 0-based index
              } else if (part.includes('dialogue of @')) {
                // Parse "1st Dialogue of @Emma" format
                const dialogueMatch = part.match(/(\d+)(st|nd|rd|th)\s+dialogue\s+of\s+@(\w+)/);
                if (dialogueMatch) {
                  animation.timing.enterOn = 'characterDialogue';
                  animation.timing.triggerCharacterName = dialogueMatch[3];
                  animation.timing.triggerCharacterDialogueIndex = parseInt(dialogueMatch[1]);
                }
              }
              
              // Parse timing - exit
              else if (part.includes('scene end') || part.includes('end of scene')) {
                animation.timing.exitOn = 'sceneEnd';
              } else if (part.includes('last dialogue')) {
                animation.timing.exitOn = 'lastDialogue';
              }
              
              // Parse delay
              else if (part.includes('delay') && part.includes('ms')) {
                const delayMatch = part.match(/delay\s+(\d+)ms/);
                if (delayMatch) {
                  animation.entrance.delay = parseInt(delayMatch[1]);
                }
              }
            }
            
            return { characterName, animation };
          };
          
          const { characterName, animation } = parseCharacterAnimation(characterLine);
          
          // Check if character exists in assets or was already created
          if (!existingCharacterNames.has(characterName) && !createdCharacterNames.has(characterName)) {
            // Create placeholder character
            const newCharacter = createPlaceholderCharacter(characterName);
            newlyCreatedCharacters.push(newCharacter);
            createdCharacterNames.add(characterName);
          }
          
          // Add character to current scene with animation
          if (currentScene) {
            const defaultOutfit = characters.find(c => c.name === characterName)?.outfits?.[0];
            const defaultPose = defaultOutfit ? Object.keys(defaultOutfit.poses)[0] : 'neutral';
            
            const characterInScene = {
              id: `${characterName.toLowerCase()}_${Date.now()}`,
              characterId: characterName.toLowerCase(),
              name: characterName,
              selectedOutfitId: defaultOutfit?.id,
              selectedPose: defaultPose,
              position: { x: 50, y: 50, scale: 1, rotation: 0 },
              visible: true,
              opacity: 1,
              flipX: false,
              flipY: false,
              animation: animation
            };
            
            currentScene.characters = currentScene.characters || [];
            currentScene.characters.push(characterInScene);
          }
          
          currentCharacter = characterName;
        }
        // Dialogue
        else if (line.startsWith('Dialogue: ')) {
          if (!currentScene) {
            errors.push(`Line ${lineNumber}: Dialogue found without a scene`);
            continue;
          }
          
          const dialogueText = line.substring(10).trim();
          const dialogueId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          
          currentScene.dialogue.push({
            id: dialogueId,
            character: currentCharacter,
            text: dialogueText,
            choices: []
          });
        }
        // Choice
        else if (line.startsWith('Choice: ')) {
          if (!currentScene) {
            errors.push(`Line ${lineNumber}: Choice found without a scene`);
            continue;
          }
          
          const choiceText = line.substring(8).trim();
          const arrowIndex = choiceText.indexOf(' → ') !== -1 ? choiceText.indexOf(' → ') : choiceText.indexOf(' -> ');
          const arrowLength = choiceText.indexOf(' → ') !== -1 ? 3 : 4;
          
          if (arrowIndex === -1) {
            errors.push(`Line ${lineNumber}: Choice must use format "Choice text → Target Scene" or "Choice text -> Target Scene"`);
            continue;
          }
          
          const text = choiceText.substring(0, arrowIndex).trim();
          const targetTitle = choiceText.substring(arrowIndex + arrowLength).trim();
          
          const choiceId = `choice_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          
          currentScene.choices.push({
            id: choiceId,
            text: text,
            targetSceneId: targetTitle // Will be resolved in second pass
          });
        }
        // Unknown line format
        else {
          if (line.length > 0) {
            errors.push(`Line ${lineNumber}: Unknown format "${line}"`);
          }
        }
      } catch (error) {
        errors.push(`Line ${lineNumber}: Error parsing line - ${error.message}`);
      }
    }
    
    // Add final scene
    if (currentScene) {
      scenes.push(currentScene);
    }
    
    // Second pass: resolve choice target scene IDs
    const sceneMap = new Map();
    scenes.forEach(scene => {
      sceneMap.set(scene.title, scene.id);
    });
    
    scenes.forEach(scene => {
      scene.choices.forEach(choice => {
        const targetSceneId = sceneMap.get(choice.targetSceneId);
        if (targetSceneId) {
          choice.targetSceneId = targetSceneId;
        } else {
          errors.push(`Choice "${choice.text}" targets unknown scene "${choice.targetSceneId}"`);
          choice.targetSceneId = ''; // Clear invalid reference
        }
      });
    });
    
    return { scenes, errors, newlyCreatedCharacters };
  }

  const handleGenerateFlow = async () => {
    setIsGenerating(true);
    setParseErrors([]);
    setGenerationSuccess(false);
    setMissingCharacters([]);
    
    try {
      const { scenes: newScenes, errors, newlyCreatedCharacters } = parseStoryText(storyText);
      
      if (errors.length > 0) {
        setParseErrors(errors);
      } else {
        // Pass scenes to parent component which will apply auto-layout
        setScenes(newScenes);
        setGenerationSuccess(true);
        
        // Handle newly created characters
        if (newlyCreatedCharacters.length > 0 && onAddCharacters) {
          onAddCharacters(newlyCreatedCharacters);
          setMissingCharacters(newlyCreatedCharacters);
          setShowMissingCharactersModal(true);
        }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setGenerationSuccess(false);
        }, 3000);
      }
    } catch (error) {
      setParseErrors([`Critical error: ${error.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadExample = () => {
    setStoryText(getExampleStory());
    setParseErrors([]);
    setGenerationSuccess(false);
    setMissingCharacters([]);
  };

  // ✨ NEW: Load workflow examples
  const handleLoadWorkflow = (workflowType) => {
    if (exampleWorkflows[workflowType]) {
      setStoryText(exampleWorkflows[workflowType]);
      setParseErrors([]);
      setGenerationSuccess(false);
      setMissingCharacters([]);
    }
  };

  const handleExportStory = () => {
    const blob = new Blob([storyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_visual_novel_story.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate preview statistics
  const getPreviewStats = () => {
    try {
      const { scenes: previewScenes, errors, newlyCreatedCharacters } = parseStoryText(storyText);
      const sceneCount = previewScenes.length;
      const choiceCount = previewScenes.reduce((total, scene) => total + (scene.choices?.length || 0), 0);
      const dialogueCount = previewScenes.reduce((total, scene) => total + (scene.dialogue?.length || 0), 0);
      const charactersUsed = new Set();
      
      previewScenes.forEach(scene => {
        scene.dialogue?.forEach(line => {
          if (line.character) charactersUsed.add(line.character);
        });
      });
      
      return {
        scenes: sceneCount,
        choices: choiceCount,
        dialogue: dialogueCount,
        characters: charactersUsed.size,
        newCharacters: newlyCreatedCharacters.length,
        errors: errors.length,
        valid: errors.length === 0
      };
    } catch {
      return {
        scenes: 0,
        choices: 0,
        dialogue: 0,
        characters: 0,
        newCharacters: 0,
        errors: 1,
        valid: false
      };
    }
  };

  const stats = getPreviewStats();

  // Missing Characters Modal
  const MissingCharactersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-400" />
              Placeholder Characters Created
            </h3>
            <button
              onClick={() => setShowMissingCharactersModal(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
              <p className="text-yellow-200 mb-2">
                <strong>Great!</strong> Your story flow has been generated successfully. However, we automatically created placeholder characters for characters that weren't found in your assets.
              </p>
              <p className="text-yellow-300 text-sm">
                These characters have basic placeholder images. You can customize them with proper artwork, outfits, and expressions in the Asset Manager.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Placeholder Characters Created:</h4>
              <div className="space-y-2">
                {missingCharacters.map(character => (
                  <div key={character.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: character.color }}
                    >
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{character.name}</div>
                      <div className="text-xs text-gray-400">Created with default placeholder images</div>
                    </div>
                    <div className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-50 px-2 py-1 rounded">
                      Placeholder
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4">
              <h5 className="font-medium text-blue-200 mb-2">Next Steps:</h5>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Review your generated flow in the Flow Builder</li>
                <li>• Customize placeholder characters in the Asset Manager</li>
                <li>• Add proper character artwork and expressions</li>
                <li>• Set up character outfits and poses</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-600 mt-6">
            <button
              onClick={() => {
                if (onOpenAssetManager) {
                  onOpenAssetManager();
                }
                setShowMissingCharactersModal(false);
              }}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Settings size={16} />
              Open Asset Manager
            </button>
            <button
              onClick={() => {
                onSwitchToFlow();
                setShowMissingCharactersModal(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              View Flow
            </button>
            <button
              onClick={() => setShowMissingCharactersModal(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HelpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <HelpCircle size={20} />
              Story Builder Help & Animation Guide
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 text-gray-300">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">📝 Basic Story Format</h4>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-blue-400"># Scene Title</div>
                <div className="text-green-400">Description: Your scene description here</div>
                <div className="text-purple-400">Character: Character Name</div>
                <div className="text-yellow-400">Dialogue: What the character says</div>
                <div className="text-pink-400">Choice: Option text {'->'} Target Scene</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">🎬 Character Animations (NEW!)</h4>
              <p className="mb-3">Enhance your visual novel with dynamic character animations! Use this format:</p>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm mb-4">
                <div className="text-purple-400">Character: Name - Animation - Timing - Options</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-white mb-2">🚪 Entrance Animations</h5>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Enters Left</code> - Slides in from left</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Enters Right</code> - Slides in from right</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Enters Up</code> - Slides in from top</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Enters Down</code> - Slides in from bottom</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Fade In</code> - Gradually appears</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-white mb-2">🚶 Exit Animations</h5>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Exit Left</code> - Slides out to left</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Exit Right</code> - Slides out to right</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Exit Up</code> - Slides out to top</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Exit Down</code> - Slides out to bottom</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Fade Out</code> - Gradually disappears</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">⏰ Animation Timing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-white mb-2">📥 Entrance Timing</h5>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Beginning of Scene</code> - Appears when scene starts</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">First Dialogue</code> - Appears on first dialogue</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">3rd Dialogue</code> - Appears on specific dialogue</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">1st Dialogue of @Emma</code> - When Emma first speaks</li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-white mb-2">📤 Exit Timing</h5>
                  <ul className="space-y-1 text-sm">
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Scene End</code> - Exits when scene ends</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">Last Dialogue</code> - Exits on last dialogue</li>
                    <li><code className="bg-gray-700 px-2 py-1 rounded">5th Dialogue</code> - Exits on specific dialogue</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">✨ Animation Examples</h4>
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-white font-semibold mb-2">Example 1: Basic entrance from right</p>
                  <div className="font-mono text-sm">
                    <div className="text-purple-400">Character: Emma - Enters Right - Beginning of Scene - Delay 500ms</div>
                    <div className="text-yellow-400">Dialogue: Hello! I just arrived.</div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-white font-semibold mb-2">Example 2: Character triggered by another's dialogue</p>
                  <div className="font-mono text-sm">
                    <div className="text-purple-400">Character: Ben - Enters Left - 1st Dialogue of @Emma - Delay 300ms</div>
                    <div className="text-yellow-400">Dialogue: I heard you calling my name!</div>
                  </div>
                </div>
                
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-white font-semibold mb-2">Example 3: Fade in with exit animation</p>
                  <div className="font-mono text-sm">
                    <div className="text-purple-400">Character: Alice - Fade In - 3rd Dialogue - Exit Fade Out - Scene End</div>
                    <div className="text-yellow-400">Dialogue: I'll be here temporarily.</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">📋 Complete Example Story</h4>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-blue-400"># Welcome Scene</div>
                <div className="text-green-400">Description: A peaceful town square at sunset</div>
                <div></div>
                <div className="text-purple-400">Character: Emma - Enters Right - Beginning of Scene - Delay 500ms</div>
                <div className="text-yellow-400">Dialogue: What a beautiful evening!</div>
                <div></div>
                <div className="text-purple-400">Character: Ben - Enters Left - 1st Dialogue of @Emma - Delay 300ms</div>
                <div className="text-yellow-400">Dialogue: Emma! I've been looking for you.</div>
                <div></div>
                <div className="text-yellow-400">Dialogue: Should we head to the festival?</div>
                <div></div>
                <div className="text-pink-400">Choice: Go to the festival {'->'} Festival Scene</div>
                <div className="text-pink-400">Choice: Stay and talk {'->'} Conversation Scene</div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">💡 Tips & Best Practices</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use delays (e.g., "Delay 500ms") to create natural timing between character entrances</li>
                <li>• Combine entrance and exit animations for dynamic scenes</li>
                <li>• Use "@CharacterName" to reference specific characters in timing rules</li>
                <li>• Characters without animation syntax will use default fade-in at scene start</li>
                <li>• Test your animations in the game preview to fine-tune timing</li>
                <li>• Keep animation descriptions clear and consistent</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">🔧 Legacy Format (Still Supported)</h4>
              <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm">
                <div className="text-purple-400">Character: Emma</div>
                <div className="text-yellow-400">Dialogue: This still works for simple scenes</div>
              </div>
              <p className="mt-2 text-sm">Characters defined without animation syntax will fade in at scene start.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✨ Example workflows for different story types
  const exampleWorkflows = {
    simple: `# Opening Scene
Description: Emma stands alone in the school courtyard
Character: Emma
Dialogue: Emma: It's my first day at this new school. I hope I can make some friends.
Choice: Look around for other students → Meeting Alex
Choice: Head to the main building → School Building

# School Building  
Description: Emma enters the main school building
Character: Emma - Enters Left - Beginning of Scene
Dialogue: Emma: This place is impressive! I wonder where I should go first.
Choice: Find the office → Office Scene
Choice: Look for other students → Meeting Alex

# Office Scene
Description: Emma visits the school office
Character: Emma - Fade In - Beginning of Scene
Dialogue: Emma: Excuse me, I'm the new student. Could you help me find my classroom?
Dialogue: Emma: Thank you! I think I'm going to like it here.
Choice: Head to class → Meeting Alex
Choice: Explore more → School Building

# Meeting Alex
Description: A mysterious student approaches
Character: Alex - Enters Right - Beginning of Scene - Delay 500ms
Character: Emma
Dialogue: Emma: Who is that person? They look interesting.
Dialogue: Alex: You must be the new student. Welcome to Sakura High.
Choice: Introduce yourself enthusiastically → Friendship Path
Choice: Respond cautiously → Mystery Path

# Friendship Path
Description: Emma and Alex start to bond
Character: Emma
Character: Alex
Dialogue: Emma: Thanks! I'm Emma. What's your favorite subject?
Dialogue: Alex: I enjoy literature. There's something magical about stories.
Choice: Ask about favorite books → Book Discussion
Choice: Suggest studying together → Study Group

# Book Discussion
Description: Emma and Alex discover shared interests
Character: Emma
Character: Alex
Dialogue: Alex: I love fantasy novels. Stories where magic feels real.
Dialogue: Emma: Me too! There's something enchanting about those worlds.
Dialogue: Alex: Sometimes I wonder if magic is closer than we think.
Choice: Ask what they mean → Mysterious Revelation
Choice: Suggest finding books together → Library Scene

# Study Group
Description: Emma suggests they study together
Character: Emma
Character: Alex
Dialogue: Emma: We could form a study group! I'd love to have a friend to learn with.
Dialogue: Alex: That sounds wonderful. I know some quiet places to study.
Dialogue: Emma: Perfect! This is going to be a great semester.
Choice: Plan study sessions → Academic Route
Choice: Get to know Alex better → Personal Route

# Mystery Path
Description: Emma senses something unusual about Alex
Character: Emma
Character: Alex
Dialogue: Emma: Thank you... I'm Emma.
Dialogue: Alex: There are many secrets in this school, Emma. Be careful.
Dialogue: Emma: What kind of secrets?
Choice: Press for more information → Secret Investigation
Choice: Change the subject → Normal Conversation

# Secret Investigation
Description: Emma investigates the mysterious hints
Character: Emma
Character: Alex
Dialogue: Emma: You're being really cryptic. What should I be careful of?
Dialogue: Alex: Some things are better discovered than explained.
Dialogue: Emma: Now I'm really curious. Will you show me?
Choice: Follow Alex → Hidden Discovery
Choice: Insist on explanations → Cautious Route`,

    complex: `# School Entrance
Description: Emma nervously approaches the main school building
Character: Emma - Enters Left - Beginning of Scene - Delay 1000ms
Dialogue: Emma: This place is huge! I really hope I don't get lost on my first day.
Choice: Go inside confidently → Classroom Introduction
Choice: Take a moment to compose yourself → Nervous Preparation

# Nervous Preparation
Description: Emma takes a deep breath before entering
Character: Emma
Dialogue: Emma: Okay, you can do this. Just be yourself and everything will be fine.
Dialogue: Emma: Here goes nothing...
Choice: Enter the building → Classroom Introduction
Choice: Look around for other students → Student Watching

# Student Watching
Description: Emma notices other students and feels more at ease
Character: Emma
Character: Alex - Enters Right - 2nd Dialogue - Delay 1000ms
Dialogue: Emma: Everyone seems pretty normal. Maybe this won't be so scary.
Dialogue: Alex: First day nerves are completely natural.
Dialogue: Emma: Oh! I didn't see you there. Are you a student here?
Choice: Ask for directions → Helpful Encounter
Choice: Introduce yourself → Mysterious Encounter

# Helpful Encounter
Description: Alex offers to help Emma find her way
Character: Emma
Character: Alex
Dialogue: Alex: I'd be happy to show you around. I'm Alex.
Dialogue: Emma: Thank you so much! I'm Emma. This place is overwhelming.
Dialogue: Alex: You'll get used to it quickly. Let me show you to your classroom.
Choice: Follow Alex → Classroom Introduction
Choice: Ask about school life → School Tour

# School Tour
Description: Alex shows Emma around the school
Character: Emma
Character: Alex - Enters Left - Beginning of Scene
Dialogue: Alex: This is the main hallway. Your classroom should be down here.
Dialogue: Emma: How long have you been at this school?
Dialogue: Alex: Long enough to know all its secrets.
Choice: Ask about the secrets → Mystery Discovery
Choice: Focus on finding class → Classroom Introduction

# Classroom Introduction
Description: Emma enters her new classroom full of students
Character: Emma - Fade In - Beginning of Scene
Dialogue: Emma: Everyone's staring at me. I should find a seat quickly.
Character: Alex - Enters Right - First Dialogue - Delay 1500ms
Dialogue: Alex: You can sit next to me if you'd like.
Dialogue: Emma: Thanks! I wasn't sure where to go.
Choice: Accept the offer → Friendly Seating
Choice: Sit somewhere else → Independent Choice

# Friendly Seating
Description: Emma sits with Alex and feels welcomed
Character: Emma
Character: Alex
Dialogue: Emma: Thanks for being so helpful. I was really nervous.
Dialogue: Alex: Everyone deserves a friendly face on their first day.
Dialogue: Emma: You seem to know a lot about helping new students.
Choice: Ask if they help others → Helpful Nature
Choice: Focus on the lesson → Academic Focus

# Independent Choice
Description: Emma chooses to sit alone to observe
Character: Emma
Character: Alex
Dialogue: Emma: Thanks for the offer, but I think I'll sit over here for now.
Dialogue: Alex: Of course. Let me know if you need anything.
Dialogue: Emma: I appreciate your understanding.
Choice: Observe the class → Classroom Observation
Choice: Reconsider and join Alex → Second Thoughts

# Mysterious Encounter
Description: Emma's first meeting with Alex feels unusual
Character: Emma
Character: Alex - Enters Right - First Dialogue - Delay 2000ms
Dialogue: Emma: I feel like someone's been watching me all morning.
Dialogue: Alex: You have good instincts, Emma.
Dialogue: Emma: How do you know my name? I haven't introduced myself yet.
Choice: Demand answers → Confrontation Scene
Choice: Play it cool → Subtle Investigation

# Confrontation Scene
Description: Emma directly confronts Alex about knowing her name
Character: Emma
Character: Alex
Dialogue: Emma: Seriously, how did you know my name? That's really creepy.
Dialogue: Alex: I heard the teacher call your name during roll call.
Dialogue: Emma: But you weren't in my class this morning...
Dialogue: Alex - Exit Fade Out - Scene End: Some mysteries are better left unsolved.
Choice: Follow Alex → Mystery Pursuit
Choice: Let it go → Normal Day

# Subtle Investigation
Description: Emma decides to investigate Alex more carefully
Character: Emma
Character: Alex
Dialogue: Emma: Lucky guess? Or do you just pay attention to new students?
Dialogue: Alex: I notice things that others miss. It's a useful skill.
Dialogue: Emma: What kind of things?
Choice: Ask about their abilities → Supernatural Reveal
Choice: Change the subject → Normal Route

# Supernatural Reveal
Description: Alex hints at having special abilities
Character: Emma
Character: Alex - Exit Right - 3rd Dialogue - Delay 1500ms
Dialogue: Emma: You're being really vague. What aren't you telling me?
Dialogue: Alex: Some people can see things... feel things that others can't.
Dialogue: Emma: Are you saying you're psychic or something?
Dialogue: Alex: Meet me after school if you want to know the truth.
Choice: Agree to meet → After School Meeting
Choice: Think it over → Contemplation

# Normal Route
Description: The conversation takes a more ordinary turn
Character: Emma
Character: Alex
Dialogue: Emma: Well, thanks for the warm welcome. Want to sit together at lunch?
Dialogue: Alex: I usually eat alone, but... sure. Why not?
Dialogue: Emma: Great! I was worried I'd have to sit by myself.
Choice: Head to lunch together → Lunch Scene
Choice: Meet up later → Free Period`,

    animationShowcase: `# Animation Demo Scene
Description: A showcase of various character animation features
Character: Emma - Enters Left - Beginning of Scene - Delay 0ms
Dialogue: Emma: Welcome to the animation showcase! Let me show you around.
Choice: See entrance animations → Entrance Animations
Choice: Learn about timing → Animation Timing Demo

# Entrance Animations
Description: Demonstrating different entrance animations
Character: Emma
Character: Alex - Enters Right - First Dialogue - Delay 1000ms
Dialogue: Emma: First, let's see some entrance animations.
Dialogue: Alex: I'll demonstrate entering from the right with a delay.
Dialogue: Emma: Notice how Alex slid in from the right side!
Choice: See fade animations → Fade Animations
Choice: Learn about exits → Exit Animations

# Fade Animations
Description: Showing fade in and out effects
Character: Emma
Character: Alex - Exit Fade Out - First Dialogue
Dialogue: Emma: Now watch Alex demonstrate a fade out effect.
Character: Alex - Fade In - 2nd Dialogue - Delay 1500ms
Dialogue: Emma: And now they'll fade back in with a delay!
Dialogue: Alex: Fade animations create smooth, subtle transitions.
Choice: See dialogue triggers → Dialogue-Triggered Animations
Choice: See exit animations → Exit Animations

# Dialogue-Triggered Animations
Description: Characters appearing based on dialogue timing
Character: Emma
Dialogue: Emma: Characters can also appear when specific people start talking.
Character: Alex - Enters Down - 1st Dialogue of @Emma - Delay 500ms
Dialogue: Alex: Like me appearing when Emma mentions dialogue triggers!
Dialogue: Emma: This is perfect for dramatic reveals and surprise entrances.
Choice: See exit animations → Exit Animations
Choice: Try complex timing → Animation Timing Demo

# Exit Animations
Description: Demonstrating various exit animations
Character: Emma
Character: Alex
Dialogue: Emma: Finally, let's show some exit animations.
Dialogue: Alex: I'll exit to the left now. Watch this!
Character: Alex - Exit Left - Scene End - Delay 0ms
Dialogue: Emma: Perfect! That's how you create dynamic character movements.
Choice: Try complex timing → Animation Timing Demo
Choice: Start over → Animation Demo Scene

# Animation Timing Demo
Description: Complex timing and multiple character coordination
Character: Emma - Enters Right - Beginning of Scene
Character: Alex - Enters Left - 2nd Dialogue - Delay 1000ms
Dialogue: Emma: This scene shows multiple characters with different timings.
Dialogue: Alex: I entered after Emma's second line with a one-second delay.
Dialogue: Emma: You can create complex choreography this way!
Choice: Practice more → Creation Mode
Choice: Learn timing rules → Timing Tutorial

# Creation Mode
Description: A sandbox for testing your own animations
Character: Emma - Fade In - Beginning of Scene
Dialogue: Emma: This is your creative space! Try writing your own animation commands.
Dialogue: Emma: Remember the format: Character: Name - Animation - Timing - Options
Choice: Learn more examples → Animation Demo Scene
Choice: See timing help → Timing Tutorial

# Timing Tutorial
Description: Detailed explanation of animation timing
Character: Emma
Character: Alex - Enters Up - First Dialogue - Delay 800ms
Dialogue: Emma: Timing is crucial for good animations.
Dialogue: Alex: I appeared after Emma's first line with an 800ms delay.
Dialogue: Emma: You can use Beginning of Scene, First Dialogue, or specific dialogue numbers.
Choice: See more examples → Animation Demo Scene
Choice: Practice creating → Creation Mode`
  };

  return (
    <div className="h-full bg-gray-900 text-white flex">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={20} />
                Story Editor
              </h2>
              <div className="text-sm text-gray-400">
                Write your story in plain text and generate a visual flow
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(true)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center gap-1"
              >
                <HelpCircle size={14} />
                Help
              </button>
              
              {/* Examples Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowExamplesDropdown(!showExamplesDropdown)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center gap-1"
                >
                  <FileText size={14} />
                  Examples
                  <ChevronRight size={12} className={`transition-transform ${showExamplesDropdown ? 'rotate-90' : ''}`} />
                </button>
                
                {showExamplesDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-48">
                    <div className="p-2">
                      <div className="text-xs text-gray-400 px-2 py-1 font-medium">Emma & Alex Workflows</div>
                      
                      <button
                        onClick={() => {
                          handleLoadWorkflow('simple');
                          setShowExamplesDropdown(false);
                        }}
                        className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded text-sm transition-colors text-white"
                      >
                        <div className="font-medium">Simple Story</div>
                        <div className="text-xs text-gray-400">Basic character introduction & choices</div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleLoadWorkflow('complex');
                          setShowExamplesDropdown(false);
                        }}
                        className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded text-sm transition-colors text-white"
                      >
                        <div className="font-medium">Complex Story</div>
                        <div className="text-xs text-gray-400">Branching narrative with mystery elements</div>
                      </button>
                      
                      <button
                        onClick={() => {
                          handleLoadWorkflow('animationShowcase');
                          setShowExamplesDropdown(false);
                        }}
                        className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded text-sm transition-colors text-white"
                      >
                        <div className="font-medium">Animation Showcase</div>
                        <div className="text-xs text-gray-400">Demonstrates all animation features</div>
                      </button>
                      
                      <div className="border-t border-gray-600 mt-2 pt-2">
                        <div className="text-xs text-gray-400 px-2 py-1 font-medium">Legacy Example</div>
                        <button
                          onClick={() => {
                            handleLoadExample();
                            setShowExamplesDropdown(false);
                          }}
                          className="w-full text-left px-2 py-2 hover:bg-gray-700 rounded text-sm transition-colors text-white"
                        >
                          <div className="font-medium">Original Example</div>
                          <div className="text-xs text-gray-400">Basic story format (creates new characters)</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleExportStory}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors flex items-center gap-1"
              >
                <Download size={14} />
                Export
              </button>
              
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-3 py-1 rounded text-sm transition-colors flex items-center gap-1 ${
                  showPreview
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex">
          {/* Text Editor */}
          <div className="flex-1 p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Write Your Story</h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{storyText.split('\n').length} lines</span>
                  <span>{storyText.length} characters</span>
                </div>
              </div>
              
              <textarea
                value={storyText}
                onChange={(e) => {
                  setStoryText(e.target.value);
                  setParseErrors([]);
                  setGenerationSuccess(false);
                  setMissingCharacters([]);
                }}
                className="flex-1 w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white font-mono text-sm resize-none"
                placeholder="Start writing your story here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye size={16} />
                Story Preview
              </h3>
              
              {/* Statistics */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3 text-white">Statistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-400" />
                    <span>{stats.scenes} scenes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-orange-400" />
                    <span>{stats.choices} choices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-400" />
                    <span>{stats.characters} characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {stats.valid ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <AlertCircle size={14} className="text-red-400" />
                    )}
                    <span className={stats.valid ? 'text-green-400' : 'text-red-400'}>
                      {stats.valid ? 'Valid' : `${stats.errors} errors`}
                    </span>
                  </div>
                </div>
                
                {stats.newCharacters > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center gap-2 text-sm text-yellow-400">
                      <Plus size={14} />
                      <span>{stats.newCharacters} characters will be auto-created</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Character Assets Check */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-3 text-white">Available Characters</h4>
                <div className="space-y-2">
                  {characters.map(character => (
                    <div key={character.id} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: character.color }}
                      />
                      <span>{character.name}</span>
                      {character.isPlaceholder && (
                        <span className="text-xs text-yellow-400 bg-yellow-900 bg-opacity-50 px-1 rounded">
                          Placeholder
                        </span>
                      )}
                    </div>
                  ))}
                  {characters.length === 0 && (
                    <p className="text-gray-400 text-sm">No characters available. Characters will be auto-created from your story.</p>
                  )}
                </div>
              </div>

              {/* Quick Scene Overview */}
              {stats.scenes > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-white">Scene Overview</h4>
                  <div className="space-y-2 text-sm">
                    {parseStoryText(storyText).scenes.slice(0, 10).map((scene, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-400">{index + 1}.</span>
                        <span className="truncate">{scene.title}</span>
                        {scene.choices.length > 0 && (
                          <GitBranch size={12} className="text-orange-400" />
                        )}
                      </div>
                    ))}
                    {parseStoryText(storyText).scenes.length > 10 && (
                      <div className="text-gray-400 text-xs">
                        ...and {parseStoryText(storyText).scenes.length - 10} more scenes
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              {parseErrors.length > 0 && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">{parseErrors.length} error{parseErrors.length !== 1 ? 's' : ''} found</span>
                </div>
              )}
              
              {generationSuccess && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Flow generated successfully!</span>
                </div>
              )}
              
              {parseErrors.length === 0 && !generationSuccess && stats.scenes > 0 && (
                <div className="flex items-center gap-2 text-blue-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Story ready to generate</span>
                </div>
              )}

              {stats.newCharacters > 0 && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Plus size={16} />
                  <span className="text-sm">{stats.newCharacters} characters will be auto-created</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateFlow}
                disabled={isGenerating || storyText.trim() === ''}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isGenerating || storyText.trim() === ''
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RotateCw size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Generate Flow
                  </>
                )}
              </button>
              
              {scenes.length > 0 && (
                <button
                  onClick={onSwitchToFlow}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  View Flow
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Panel */}
      {parseErrors.length > 0 && (
        <div className="w-80 bg-red-900 bg-opacity-20 border-l border-red-500 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
            <AlertCircle size={16} />
            Parsing Errors
          </h3>
          
          <div className="space-y-2">
            {parseErrors.map((error, index) => (
              <div key={index} className="bg-red-800 bg-opacity-30 border border-red-600 rounded p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-xs text-red-300">
            Fix these errors to generate your visual novel flow.
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && <HelpModal />}

      {/* Missing Characters Modal */}
      {showMissingCharactersModal && <MissingCharactersModal />}
    </div>
  );
};

export default StoryEditor;