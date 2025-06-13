# Enhanced Game Logic System

A comprehensive game logic system for visual novel builders with custom stats, character management, and template functionality.

## Features

### 🎯 Custom Stats System
- **Player Stats**: Add unlimited custom stats for the player character
- **Character Stats**: Create custom stats for individual characters
- **Enable/Disable**: Turn stats on/off without losing their definitions
- **Visual Customization**: Set custom colors and emoji icons for each stat
- **Range Control**: Define min/max values and default starting values

### 📋 Template System
- **Save as Template**: Create reusable stat configurations
- **Apply Templates**: Instantly apply stat sets to new characters
- **Template Categories**: Separate templates for player and character stats
- **Template Management**: Edit, duplicate, and delete templates

### 👥 Character Management
- **Character Creation**: Add characters with custom names and IDs
- **Template Application**: Apply stat templates when creating characters
- **Individual Stat Control**: Adjust each character's stats independently
- **Visual Stat Display**: Progress bars with custom colors

### 🎮 Game Systems
- **Time Management**: Customizable time periods and advancement
- **Inventory System**: Item management with asset integration
- **Quest System**: Track objectives and rewards
- **Event System**: Time-based and conditional events
- **Save/Load**: Complete game state persistence

## Usage Examples

### Adding Custom Player Stats

```typescript
// Create a new GameLogic instance
const gameLogic = new GameLogic();

// Add a custom player stat
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
```

### Creating Character Stat Templates

```typescript
// Add custom character stats
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

// Create a template with selected stats
const templateId = gameLogic.createStatTemplate(
    'Emma Template',
    'Custom stats for Emma character',
    'character',
    ['relationship', 'energy', 'corruption'] // stat IDs to include
);
```

### Creating Characters with Templates

```typescript
// Create a character and apply a template
gameLogic.addCharacter('emma', 'Emma', templateId);

// Or create without a template (uses default enabled stats)
gameLogic.addCharacter('sarah', 'Sarah');
```

### Managing Stats

```typescript
// Toggle a stat on/off
gameLogic.togglePlayerStat('charisma');

// Update a stat value
gameLogic.updateStat('charisma', 10); // Add 10 to charisma

// Get current stat value
const charisma = gameLogic.getStat('charisma');
```

## Components

### StatManager Component
A React component for managing custom stats and templates:

```jsx
import { StatManager } from './components/StatManager';

<StatManager 
    gameLogic={gameLogic} 
    onClose={() => setShowStatManager(false)} 
/>
```

Features:
- Add/remove custom stats
- Toggle stats enabled/disabled
- Create templates from current stats
- Apply templates to player
- Visual stat configuration (colors, icons, ranges)

### CharacterManager Component
A React component for managing characters:

```jsx
import { CharacterManager } from './components/CharacterManager';

<CharacterManager 
    gameLogic={gameLogic} 
    onClose={() => setShowCharacterManager(false)} 
/>
```

Features:
- Create new characters
- Apply templates during character creation
- View and edit character stats
- Remove characters
- Visual stat displays with progress bars

## File Structure

```
src/
├── lib/game-logic/
│   ├── GameLogic.ts              # Main game logic class
│   ├── types.ts                  # TypeScript interfaces
│   ├── StatTemplateManager.ts    # Custom stats and templates
│   ├── TimeManager.ts            # Time system
│   ├── InventoryManager.ts       # Item management
│   ├── EventManager.ts           # Game events
│   ├── DialogueManager.ts        # Dialogue system
│   ├── QuestManager.ts           # Quest tracking
│   ├── RelationshipManager.ts    # Character relationships
│   ├── StatsManager.ts           # Basic stat management
│   └── SaveManager.ts            # Save/load functionality
├── components/
│   ├── StatManager.tsx           # Stats and templates UI
│   ├── CharacterManager.tsx      # Character management UI
│   └── ...
└── demo/
    └── GameLogicDemo.tsx         # Complete demo implementation
```

## Asset Integration

The system automatically integrates with your asset folder:

```
public/
└── assets/
    ├── items/          # Item images (sword.png, potion.png, etc.)
    ├── characters/     # Character portraits
    └── backgrounds/    # Scene backgrounds
```

Items automatically link to images based on their ID:
- Item ID: `sword` → Image: `/assets/items/sword.png`

## Demo

See `src/demo/GameLogicDemo.tsx` for a complete working example that demonstrates:
- Creating custom stats
- Building templates
- Character management
- Real-time stat visualization
- Template application

## Example Use Cases

### Visual Novel Game
```typescript
// Create romance stats for different characters
gameLogic.addCharacterStat({
    name: 'Romance Level',
    description: 'How romantic the relationship is',
    min: 0,
    max: 100,
    defaultValue: 0,
    enabled: true,
    color: '#ff1493',
    icon: '💕'
});

// Create a romance template
const romanceTemplate = gameLogic.createStatTemplate(
    'Romance Character',
    'Standard stats for romanceable characters',
    'character',
    ['relationship', 'trust', 'romance_level']
);
```

### RPG Elements
```typescript
// Add combat stats
gameLogic.addPlayerStat({
    name: 'Strength',
    description: 'Physical power and combat ability',
    min: 1,
    max: 20,
    defaultValue: 10,
    enabled: true,
    color: '#ff4444',
    icon: '💪'
});
```

### School/Life Simulation
```typescript
// Academic stats
gameLogic.addPlayerStat({
    name: 'Academic Performance',
    description: 'How well you perform in school',
    min: 0,
    max: 100,
    defaultValue: 75,
    enabled: true,
    color: '#4169e1',
    icon: '📚'
});
```

## Benefits

1. **Flexibility**: Add any number of custom stats with full control
2. **Reusability**: Templates allow quick character setup
3. **Visual Appeal**: Custom colors and icons make stats engaging
4. **User-Friendly**: Easy toggle system for enabling/disabling features
5. **Persistence**: All custom stats and templates are saved
6. **Type Safety**: Full TypeScript support for development
7. **Asset Integration**: Automatic linking to game assets
8. **Scalability**: Supports complex game mechanics and multiple characters

## Getting Started

1. Import the GameLogic class
2. Create custom stats using the StatManager component
3. Build templates for different character types
4. Create characters and apply templates
5. Use in your visual novel logic and UI

The system is designed to be intuitive for content creators while providing powerful functionality for complex game mechanics. 