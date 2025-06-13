import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, X, SkipForward, Volume2, VolumeX, 
  ArrowRight, RotateCcw, Settings, Home, FastForward,
  Maximize2, ChevronDown, Clock, BookOpen, Eye
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

const GamePlayer = ({ 
  isOpen, 
  onClose, 
  scenes, 
  characters, 
  backgrounds, 
  music: musicAssets, 
  soundEffects, 
  videos, 
  cutscenes,
  startSceneId = null,
  getCharacterImage,
  getCharacterDefaultImage 
}) => {
  // Game state
  const [currentSceneId, setCurrentSceneId] = useState(startSceneId || scenes[0]?.id);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(3000); // 3 seconds
  const [textSpeed, setTextSpeed] = useState(50); // Characters per second
  const [showingText, setShowingText] = useState('');
  const [isTextComplete, setIsTextComplete] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // ✨ NEW: Character Animation State
  const [characterAnimationStates, setCharacterAnimationStates] = useState(new Map());
  const [sceneCharacters, setSceneCharacters] = useState([]);
  const [characterDialogueCounts, setCharacterDialogueCounts] = useState(new Map());
  
  // Video/Cutscene state
  const [currentCutscene, setCurrentCutscene] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Audio state
  const [currentMusic, setCurrentMusic] = useState(null);
  const audioRef = useRef(null);
  const autoPlayTimeoutRef = useRef(null);
  const textAnimationRef = useRef(null);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const currentDialogue = currentScene?.dialogue?.[currentDialogueIndex];

  // ✨ Enhanced scene initialization with character animations
  useEffect(() => {
    if (isOpen && currentScene) {
      console.log('Initializing scene:', currentScene.title);
      
      // Reset animation states for new scene
      const newAnimationStates = new Map();
      const newDialogueCounts = new Map();
      
      // Initialize character animation states
      currentScene.characters?.forEach(character => {
        newAnimationStates.set(character.id, {
          hasEntered: false,
          hasExited: false,
          isAnimating: false
        });
      });
      
      setCharacterAnimationStates(newAnimationStates);
      setSceneCharacters(currentScene.characters || []);
      setCharacterDialogueCounts(newDialogueCounts);
      
      // Reset dialogue state
      setCurrentDialogueIndex(0);
      setGameHistory([]);
      setShowingText('');
      setIsTextComplete(false);
      
      // Trigger scene start character entrances
      currentScene.characters?.forEach(character => {
        if (character.animation?.timing?.enterOn === 'sceneStart') {
          console.log(`Scheduling entrance for ${character.name} at scene start`);
          setTimeout(() => {
            triggerCharacterEntrance(character);
          }, character.animation?.entrance?.delay || 100);
        }
      });
      
      // Start background music if scene has music
      if (currentScene.music) {
        setCurrentMusic(currentScene.music);
      }

      // Check for opening cutscene
      const openingCutscene = cutscenes.find(c => c.triggersOnSceneStart === currentSceneId);
      if (openingCutscene) {
        const video = videos.find(v => v.id === openingCutscene.video);
        if (video) {
          setCurrentCutscene(openingCutscene);
          setCurrentVideo(video);
        }
      }
    }
  }, [isOpen, currentSceneId, currentScene, cutscenes, videos]);

  // ✨ Enhanced dialogue progression with character animation triggers
  useEffect(() => {
    if (currentDialogue?.text) {
      // Update character dialogue counts
      if (currentDialogue.character) {
        setCharacterDialogueCounts(prev => {
          const newCounts = new Map(prev);
          const currentCount = newCounts.get(currentDialogue.character) || 0;
          newCounts.set(currentDialogue.character, currentCount + 1);
          return newCounts;
        });
      }

      // Check for character entrances based on dialogue triggers
      sceneCharacters.forEach(character => {
        const animationState = characterAnimationStates.get(character.id);
        
        if (!animationState?.hasEntered && shouldCharacterEnter(character, currentDialogueIndex, currentDialogue)) {
          console.log(`Triggering entrance for ${character.name} on dialogue ${currentDialogueIndex}`);
          triggerCharacterEntrance(character);
        }
        
        // Check for character exits
        const isLastDialogue = currentDialogueIndex >= (currentScene?.dialogue?.length || 0) - 1;
        if (animationState?.hasEntered && !animationState?.hasExited && 
            shouldCharacterExit(character, currentDialogueIndex, isLastDialogue)) {
          console.log(`Triggering exit for ${character.name} on dialogue ${currentDialogueIndex}`);
          triggerCharacterExit(character);
        }
      });
      
      setShowingText('');
      setIsTextComplete(false);
      
      const fullText = currentDialogue.text;
      let charIndex = 0;
      
      const animateText = () => {
        if (charIndex < fullText.length) {
          setShowingText(fullText.substring(0, charIndex + 1));
          charIndex++;
          textAnimationRef.current = setTimeout(animateText, 1000 / textSpeed);
        } else {
          setIsTextComplete(true);
          // Start auto-play timer if enabled
          if (isAutoPlay && isPlaying) {
            autoPlayTimeoutRef.current = setTimeout(handleNext, autoPlaySpeed);
          }
        }
      };
      
      animateText();
    }

    return () => {
      if (textAnimationRef.current) {
        clearTimeout(textAnimationRef.current);
      }
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [currentDialogue, textSpeed, isAutoPlay, autoPlaySpeed, isPlaying, currentDialogueIndex, sceneCharacters, characterAnimationStates, characterDialogueCounts]);

  // Handle background music
  useEffect(() => {
    if (audioRef.current && currentMusic) {
      const musicAsset = musicAssets.find(m => m.id === currentMusic.id);
      if (musicAsset) {
        audioRef.current.src = musicAsset.url;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.loop = true;
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentMusic, musicAssets, volume, isMuted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (textAnimationRef.current) clearTimeout(textAnimationRef.current);
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleNext = () => {
    // Clear auto-play timer
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }

    // If text is still animating, complete it immediately
    if (!isTextComplete && currentDialogue?.text) {
      setShowingText(currentDialogue.text);
      setIsTextComplete(true);
      if (isAutoPlay && isPlaying) {
        autoPlayTimeoutRef.current = setTimeout(handleNext, autoPlaySpeed);
      }
      return;
    }

    // Add current state to history for back navigation
    if (currentScene && currentDialogue) {
      setGameHistory(prev => [...prev, {
        sceneId: currentSceneId,
        dialogueIndex: currentDialogueIndex,
        timestamp: Date.now()
      }]);
    }

    // Check if there's more dialogue in current scene
    if (currentDialogueIndex < (currentScene?.dialogue?.length || 0) - 1) {
      setCurrentDialogueIndex(prev => prev + 1);
    } else {
      // Scene dialogue is complete, check for auto-advance or show choices
      if (currentScene?.choices?.length === 1) {
        // Auto-advance if only one choice
        handleChoice(currentScene.choices[0]);
      }
      // If multiple choices or no choices, stop here and show choices panel
    }
  };

  const handleChoice = (choice) => {
    if (choice.targetSceneId) {
      const targetScene = scenes.find(s => s.id === choice.targetSceneId);
      if (targetScene) {
        // Add to history
        setGameHistory(prev => [...prev, {
          sceneId: currentSceneId,
          dialogueIndex: currentDialogueIndex,
          timestamp: Date.now(),
          choice: choice.text
        }]);

        // Change scene
        setCurrentSceneId(choice.targetSceneId);
        setCurrentDialogueIndex(0);

        // Update music if new scene has different music
        if (targetScene.music?.id !== currentMusic?.id) {
          setCurrentMusic(targetScene.music);
        }

        // Check for cutscene
        const sceneCutscene = cutscenes.find(c => c.triggersOnSceneStart === choice.targetSceneId);
        if (sceneCutscene) {
          const video = videos.find(v => v.id === sceneCutscene.video);
          if (video) {
            setCurrentCutscene(sceneCutscene);
            setCurrentVideo(video);
          }
        }
      }
    }
  };

  const handleBack = () => {
    if (gameHistory.length > 0) {
      const lastState = gameHistory[gameHistory.length - 1];
      setCurrentSceneId(lastState.sceneId);
      setCurrentDialogueIndex(lastState.dialogueIndex);
      setGameHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSkipText = () => {
    if (currentDialogue?.text) {
      setShowingText(currentDialogue.text);
      setIsTextComplete(true);
      if (textAnimationRef.current) {
        clearTimeout(textAnimationRef.current);
      }
    }
  };

  const togglePause = () => {
    setIsPlaying(!isPlaying);
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    if (!isPlaying && isAutoPlay && isTextComplete) {
      autoPlayTimeoutRef.current = setTimeout(handleNext, autoPlaySpeed);
    }
  };

  const handleCutsceneEnd = () => {
    setCurrentCutscene(null);
    setCurrentVideo(null);
    // Continue with normal scene flow
  };

  const handleCutsceneSkip = () => {
    handleCutsceneEnd();
  };

  const getBackgroundStyle = (background) => {
    if (!background) return { backgroundColor: '#1a1a1a' };
    
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
      return { backgroundColor: background.value || '#1a1a1a' };
    }
  };

  // Settings Panel
  const SettingsPanel = () => (
    <div className="absolute top-16 right-4 bg-gray-800 border border-gray-600 rounded-lg p-4 min-w-64 z-20">
      <h3 className="text-white font-semibold mb-4">Game Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Text Speed</label>
          <input
            type="range"
            min="10"
            max="100"
            value={textSpeed}
            onChange={(e) => setTextSpeed(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="text-xs text-gray-400 mt-1">{textSpeed} chars/sec</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Auto-Play Speed</label>
          <input
            type="range"
            min="1000"
            max="8000"
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="text-xs text-gray-400 mt-1">{(autoPlaySpeed / 1000).toFixed(1)}s delay</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Music Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              if (newVolume > 0) setIsMuted(false);
            }}
            className="w-full accent-purple-600"
          />
          <div className="text-xs text-gray-400 mt-1">{Math.round((isMuted ? 0 : volume) * 100)}%</div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoplay"
            checked={isAutoPlay}
            onChange={(e) => setIsAutoPlay(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="autoplay" className="text-sm text-gray-300">Auto-advance dialogue</label>
        </div>
      </div>
    </div>
  );

  // If cutscene is playing, show video player
  if (currentCutscene && currentVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <VideoPlayer
          video={currentVideo}
          cutscene={currentCutscene}
          onEnd={handleCutsceneEnd}
          onSkip={handleCutsceneSkip}
        />
      </div>
    );
  }

  const showChoices = currentDialogueIndex >= (currentScene?.dialogue?.length || 0) - 1 && 
                     currentScene?.choices?.length > 0 && 
                     isTextComplete;

  // ✨ NEW: Character Animation Functions
  const getAnimationClasses = (character, animationType, animationState) => {
    const baseClasses = 'absolute transition-all';
    
    if (!animationState?.isAnimating && !animationState?.hasEntered) {
      return `${baseClasses} opacity-0`;
    }

    if (animationState?.hasExited) {
      return `${baseClasses} opacity-0`;
    }

    const duration = character.animation?.entrance?.duration || 800;
    const easing = character.animation?.entrance?.easing || 'ease-out';
    
    switch (animationType) {
      case 'slideFromLeft':
        return `${baseClasses} ${animationState?.hasEntered ? 'translate-x-0' : '-translate-x-full'} opacity-100 duration-${Math.min(1000, duration)}`;
      case 'slideFromRight':
        return `${baseClasses} ${animationState?.hasEntered ? 'translate-x-0' : 'translate-x-full'} opacity-100 duration-${Math.min(1000, duration)}`;
      case 'slideUp':
        return `${baseClasses} ${animationState?.hasEntered ? 'translate-y-0' : 'translate-y-full'} opacity-100 duration-${Math.min(1000, duration)}`;
      case 'slideDown':
        return `${baseClasses} ${animationState?.hasEntered ? 'translate-y-0' : '-translate-y-full'} opacity-100 duration-${Math.min(1000, duration)}`;
      case 'fadeIn':
        return `${baseClasses} ${animationState?.hasEntered ? 'opacity-100' : 'opacity-0'} duration-${Math.min(1000, duration)}`;
      default:
        return `${baseClasses} opacity-100 duration-500`;
    }
  };

  const getAnimationStyle = (character) => {
    const animationState = characterAnimationStates.get(character.id);
    const animation = character.animation || {};
    
    const baseStyle = {
      left: `${character.position?.x || 50}%`,
      top: `${character.position?.y || 50}%`,
      transform: `translate(-50%, -50%) 
        scale(${(character.position?.scale || 1) * 1.5}) 
        rotate(${character.position?.rotation || 0}deg)
        ${character.flipX ? 'scaleX(-1)' : ''} 
        ${character.flipY ? 'scaleY(-1)' : ''}`,
      opacity: character.opacity || 1,
      display: character.visible === false ? 'none' : 'block',
      zIndex: 10
    };

    if (animationState?.isAnimating && animation.entrance) {
      return {
        ...baseStyle,
        transitionDuration: `${animation.entrance.duration || 800}ms`,
        transitionTimingFunction: animation.entrance.easing || 'ease-out',
        transitionDelay: `${animation.entrance.delay || 0}ms`
      };
    }

    return baseStyle;
  };

  const triggerCharacterEntrance = (character) => {
    console.log(`Triggering entrance for ${character.name}`);
    
    setCharacterAnimationStates(prev => {
      const newState = new Map(prev);
      newState.set(character.id, {
        ...newState.get(character.id),
        isAnimating: true,
        hasEntered: false
      });
      return newState;
    });

    // Trigger entrance animation after delay
    setTimeout(() => {
      setCharacterAnimationStates(prev => {
        const newState = new Map(prev);
        newState.set(character.id, {
          ...newState.get(character.id),
          hasEntered: true
        });
        return newState;
      });

      // End animation state
      setTimeout(() => {
        setCharacterAnimationStates(prev => {
          const newState = new Map(prev);
          newState.set(character.id, {
            ...newState.get(character.id),
            isAnimating: false
          });
          return newState;
        });
      }, character.animation?.entrance?.duration || 800);
    }, character.animation?.entrance?.delay || 50);
  };

  const triggerCharacterExit = (character) => {
    console.log(`Triggering exit for ${character.name}`);
    
    setCharacterAnimationStates(prev => {
      const newState = new Map(prev);
      newState.set(character.id, {
        ...newState.get(character.id),
        isAnimating: true,
        hasExited: false
      });
      return newState;
    });

    setTimeout(() => {
      setCharacterAnimationStates(prev => {
        const newState = new Map(prev);
        newState.set(character.id, {
          ...newState.get(character.id),
          hasExited: true,
          isAnimating: false
        });
        return newState;
      });
    }, character.animation?.exit?.duration || 600);
  };

  const shouldCharacterEnter = (character, dialogueIndex, currentDialogue) => {
    const timing = character.animation?.timing;
    if (!timing) return false;

    switch (timing.enterOn) {
      case 'sceneStart':
        return dialogueIndex === 0; // Will be handled in scene initialization
      case 'firstDialogue':
        return dialogueIndex === 0;
      case 'specificDialogue':
        return dialogueIndex === timing.triggerDialogueIndex;
      case 'characterDialogue':
        if (currentDialogue?.character === timing.triggerCharacterName) {
          // Count how many times this character has spoken
          const speakerCount = characterDialogueCounts.get(timing.triggerCharacterName) || 0;
          return speakerCount === (timing.triggerCharacterDialogueIndex || 1) - 1;
        }
        return false;
      default:
        return false;
    }
  };

  const shouldCharacterExit = (character, dialogueIndex, isLastDialogue) => {
    const timing = character.animation?.timing;
    if (!timing) return false;

    switch (timing.exitOn) {
      case 'sceneEnd':
        return isLastDialogue;
      case 'lastDialogue':
        return isLastDialogue;
      case 'specificDialogue':
        return dialogueIndex === timing.triggerDialogueIndex;
      case 'characterDialogue':
        // Implementation would be similar to entrance logic
        return false;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top UI Bar */}
      <div className="bg-black bg-opacity-50 p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded-lg transition-colors"
            title="Exit Game"
          >
            <X size={20} />
          </button>

          <div className="text-white">
            <h2 className="font-semibold">{currentScene?.title || 'Unknown Scene'}</h2>
            <div className="text-sm text-gray-300">
              Scene {scenes.findIndex(s => s.id === currentSceneId) + 1} of {scenes.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History/Back button */}
          <button
            onClick={handleBack}
            disabled={gameHistory.length === 0}
            className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Go Back"
          >
            <RotateCcw size={16} />
          </button>

          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`p-2 rounded-lg transition-colors ${
              isAutoPlay 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white'
            }`}
            title="Auto-Play"
          >
            <FastForward size={16} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePause}
            className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded-lg transition-colors"
            title={isPlaying ? "Pause" : "Resume"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          {/* Volume */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded-lg transition-colors"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-100 text-white rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && <SettingsPanel />}
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={getBackgroundStyle(currentScene?.background)}
        />

        {/* ✨ Enhanced Characters with Animations */}
        {sceneCharacters.map((sceneCharacter, index) => {
          const character = characters.find(c => c.id === sceneCharacter.characterId);
          if (!character) return null;
          
          const imageUrl = getCharacterImage(character, sceneCharacter.selectedOutfitId, sceneCharacter.selectedPose);
          if (!imageUrl) return null;

          const animationState = characterAnimationStates.get(sceneCharacter.id);
          
          // Don't render if character hasn't entered yet (unless sceneStart)
          if (!animationState?.hasEntered && sceneCharacter.animation?.timing?.enterOn !== 'sceneStart') {
            return null;
          }
          
          // Don't render if character has exited
          if (animationState?.hasExited) {
            return null;
          }

          // Highlight speaking character
          const isSpeaking = currentDialogue?.character === character.name;
          const entranceType = sceneCharacter.animation?.entrance?.type || 'fadeIn';

          return (
            <div
              key={sceneCharacter.id}
              className={`${getAnimationClasses(sceneCharacter, entranceType, animationState)} ${
                isSpeaking ? 'z-10 brightness-100' : 'z-5 brightness-100'
              }`}
              style={getAnimationStyle(sceneCharacter)}
            >
              <img
                src={imageUrl}
                alt={character.name}
                className="h-96 object-contain pointer-events-none select-none"
                style={{
                  filter: isSpeaking ? 'brightness(1.1) contrast(1.1)' : 'brightness(0.95)'
                }}
              />
              
              {/* Animation Debug Info (development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute -top-8 left-0 text-xs bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                  {character.name} | {animationState?.hasEntered ? 'Entered' : 'Waiting'} | {entranceType}
                </div>
              )}
            </div>
          );
        })}

        {/* Click to continue overlay */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={showChoices ? undefined : handleNext}
        />
      </div>

      {/* Dialogue UI */}
      <div className="bg-black bg-opacity-80 p-6 relative z-10">
        {currentDialogue ? (
          <div className="max-w-4xl mx-auto">
            {/* Character Name */}
            {currentDialogue.character && (
              <div className="mb-2">
                <span className="text-lg font-semibold text-white bg-purple-600 px-3 py-1 rounded-lg">
                  {currentDialogue.character}
                </span>
              </div>
            )}

            {/* Dialogue Text */}
            <div className="bg-black bg-opacity-50 rounded-lg p-4 mb-4">
              <p className="text-white text-lg leading-relaxed">
                {showingText}
                {!isTextComplete && (
                  <span className="inline-block w-2 h-6 bg-white ml-1 animate-pulse" />
                )}
              </p>
              
              {/* Quick actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {!isTextComplete ? (
                    <button
                      onClick={handleSkipText}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <SkipForward size={14} />
                      Skip text
                    </button>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ArrowRight size={14} />
                      Click to continue
                    </span>
                  )}
                </div>

                {isAutoPlay && isTextComplete && (
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <Clock size={14} />
                    Auto-advancing...
                  </div>
                )}
              </div>
            </div>

            {/* Choices */}
            {showChoices && (
              <div className="space-y-2">
                <div className="text-white text-sm mb-3">Choose your response:</div>
                {currentScene.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left p-4 bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white rounded-lg transition-all hover:scale-105 border border-gray-600 hover:border-purple-500"
                  >
                    <span className="text-purple-400 mr-2">{index + 1}.</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black bg-opacity-50 rounded-lg p-8">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Scene Complete</h3>
              <p className="text-gray-300">
                {currentScene?.choices?.length > 0 
                  ? "Choose your next action above" 
                  : "This scene has no dialogue or choices configured."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Background Audio */}
      <audio ref={audioRef} loop />
    </div>
  );
};

export default GamePlayer;