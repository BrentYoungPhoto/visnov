import React, { useState, useRef } from 'react';
import { 
  X, Search, Filter, Grid, List, Upload, Plus, Trash2, Copy, 
  Edit, Eye, Download, Star, Tag, Folder, FolderOpen, 
  Image, User, Music, Volume2, Play, Pause, RotateCw, 
  Crop, Move, Maximize2, Info, ExternalLink, Settings,
  ChevronDown, ChevronRight, Heart, AlertTriangle, Check,
  Palette, Type, Save
} from 'lucide-react';

const AssetManager = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  backgrounds,
  setBackgrounds,
  characters,
  setCharacters,
  music,
  setMusic,
  soundEffects,
  setSoundEffects,
  assetCategories,
  onFileUpload,
  onDeleteAsset,
  onDuplicateAsset,
  filterAssets,
  onSelectAsset = null,
  getCharacterDefaultImage,
  getCharacterImage,
  onUpdateCharacter,
  onAddOutfit,
  onUpdateOutfit,
  onDeleteOutfit,
  onAddPose,
  onDeletePose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(null);
  const [bulkActions, setBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Character management state
  const [showCharacterDetails, setShowCharacterDetails] = useState(null);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [editingCharacter, setEditingCharacter] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 'backgrounds', label: 'Backgrounds', icon: Image, color: 'blue' },
    { id: 'characters', label: 'Characters', icon: User, color: 'purple' },
    { id: 'audio', label: 'Audio', icon: Music, color: 'green' }
  ];

  const getCurrentAssets = () => {
    switch (activeTab) {
      case 'backgrounds':
        return backgrounds;
      case 'characters':
        return characters;
      case 'audio':
        return [...music, ...soundEffects];
      default:
        return [];
    }
  };

  const filteredAssets = filterAssets(getCurrentAssets(), searchQuery, filterCategory);

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'created' || sortBy === 'modified') {
      aValue = new Date(a.metadata?.[sortBy] || 0);
      bValue = new Date(b.metadata?.[sortBy] || 0);
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleAssetSelect = (assetId) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleBulkDelete = () => {
    selectedAssets.forEach(assetId => {
      onDeleteAsset(assetId, activeTab);
    });
    setSelectedAssets([]);
    setBulkActions(false);
  };

  const handleBulkDuplicate = () => {
    selectedAssets.forEach(assetId => {
      const asset = getCurrentAssets().find(a => a.id === assetId);
      if (asset) {
        onDuplicateAsset(asset, activeTab);
      }
    });
    setSelectedAssets([]);
    setBulkActions(false);
  };

  // Handle asset selection for scene editing
  const handleAssetClick = (asset) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
    } else if (activeTab === 'characters') {
      setShowCharacterDetails(asset);
    } else {
      setShowAssetDetails(asset);
    }
  };

  // Character Details Modal Component
  const CharacterDetailsModal = ({ character, onClose }) => {
    const [editingCharacterData, setEditingCharacterData] = useState(character);

    const handleSaveCharacter = () => {
      if (onUpdateCharacter) {
        onUpdateCharacter(character.id, editingCharacterData);
      }
      onClose();
    };

    const handleAddNewOutfit = () => {
      if (onAddOutfit) {
        const outfitId = onAddOutfit(character.id, {
          name: 'New Outfit',
          neutralPose: null
        });
        // Refresh character data
        const updatedCharacter = characters.find(c => c.id === character.id);
        if (updatedCharacter) {
          setEditingCharacterData(updatedCharacter);
        }
      }
    };

    const handleDeleteOutfit = (outfitId) => {
      if (onDeleteOutfit) {
        onDeleteOutfit(character.id, outfitId);
        // Refresh character data
        const updatedCharacter = characters.find(c => c.id === character.id);
        if (updatedCharacter) {
          setEditingCharacterData(updatedCharacter);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
        <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <User size={20} />
                {character.name}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Character Preview */}
              <div>
                <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {getCharacterDefaultImage ? (
                    <img 
                      src={getCharacterDefaultImage(character)} 
                      alt={character.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div 
                      className="w-24 h-32 rounded flex items-center justify-center"
                      style={{ backgroundColor: character.color }}
                    >
                      <User size={32} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Character Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingCharacterData.name}
                      onChange={(e) => setEditingCharacterData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={editingCharacterData.description}
                      onChange={(e) => setEditingCharacterData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                      value={editingCharacterData.category}
                      onChange={(e) => setEditingCharacterData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                    >
                      <option value="protagonist">Protagonist</option>
                      <option value="supporting">Supporting</option>
                      <option value="antagonist">Antagonist</option>
                      <option value="npc">NPC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                    <input
                      type="color"
                      value={editingCharacterData.color}
                      onChange={(e) => setEditingCharacterData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full p-1 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Outfits Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Outfits</h4>
                  <button
                    onClick={handleAddNewOutfit}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Outfit
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {editingCharacterData.outfits?.map(outfit => (
                    <div key={outfit.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-white">{outfit.name}</h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingOutfit({ character: editingCharacterData, outfit })}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Outfit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteOutfit(outfit.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Outfit"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(outfit.poses).map(([poseName, poseUrl]) => (
                          <div key={poseName} className="relative">
                            <img
                              src={poseUrl}
                              alt={`${poseName} pose`}
                              className="w-full h-16 object-cover rounded"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b text-center">
                              {poseName}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        {Object.keys(outfit.poses).length} expression{Object.keys(outfit.poses).length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}

                  {(!editingCharacterData.outfits || editingCharacterData.outfits.length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <Palette size={32} className="mx-auto mb-2" />
                      <p>No outfits created yet</p>
                      <button
                        onClick={handleAddNewOutfit}
                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Create First Outfit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-600 mt-6">
              <button
                onClick={handleSaveCharacter}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Character
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Outfit Modal Component
  const EditOutfitModal = ({ character, outfit, onClose }) => {
    const [outfitData, setOutfitData] = useState({
      name: outfit.name,
      poses: { ...outfit.poses }
    });
    const [newPoseName, setNewPoseName] = useState('');

    const handleSaveOutfit = () => {
      console.log('Saving outfit:', character.id, outfit.id, outfitData);
      if (onUpdateOutfit) {
        onUpdateOutfit(character.id, outfit.id, outfitData);
        console.log('onUpdateOutfit called successfully');
      } else {
        console.error('onUpdateOutfit callback not available');
      }
      onClose();
    };

    const handleAddPose = () => {
      if (newPoseName.trim()) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const poseName = newPoseName.trim();
              const imageUrl = event.target.result;
              
              // Update local state for immediate UI feedback
              setOutfitData(prev => ({
                ...prev,
                poses: {
                  ...prev.poses,
                  [poseName]: imageUrl
                }
              }));
              
              // Clear input
              setNewPoseName('');
              
              // Show success feedback
              console.log(`Added pose "${poseName}" to outfit "${outfit.name}"`);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } else {
        alert('Please enter a name for the expression before adding an image.');
      }
    };

    const handleDeletePose = (poseName) => {
      setOutfitData(prev => ({
        ...prev,
        poses: Object.fromEntries(
          Object.entries(prev.poses).filter(([key]) => key !== poseName)
        )
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80] p-4">
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                Edit Outfit: {outfit.name}
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Outfit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Outfit Name</label>
                <input
                  type="text"
                  value={outfitData.name}
                  onChange={(e) => setOutfitData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                />
              </div>

              {/* Poses */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Expressions</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {Object.entries(outfitData.poses).map(([poseName, poseUrl]) => (
                    <div key={poseName} className="relative bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={poseUrl}
                        alt={`${poseName} pose`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{poseName}</span>
                          <button
                            onClick={() => handleDeletePose(poseName)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Pose */}
                <div className="bg-gray-600 rounded-lg p-4 border border-gray-500">
                  <h5 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Plus size={16} />
                    Add New Expression
                  </h5>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Expression name (e.g., happy, sad, angry, surprised)"
                      value={newPoseName}
                      onChange={(e) => setNewPoseName(e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newPoseName.trim()) {
                          handleAddPose();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddPose}
                      disabled={!newPoseName.trim()}
                      className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Upload size={16} />
                      {newPoseName.trim() ? `Add "${newPoseName.trim()}" Expression` : 'Choose Image for Expression'}
                    </button>
                    <p className="text-xs text-gray-400">
                      Enter a name and click the button to select an image file for this expression.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-600 mt-6">
              <button
                onClick={handleSaveOutfit}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssetCard = ({ asset }) => (
    <div className={`bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-all group ${
      selectedAssets.includes(asset.id) ? 'ring-2 ring-purple-500' : ''
    } ${onSelectAsset ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}`}>
      {/* Asset Preview */}
      <div 
        className="relative aspect-video bg-gray-600 overflow-hidden"
        onClick={() => handleAssetClick(asset)}
      >
        {activeTab === 'backgrounds' ? (
          asset.type === 'image' ? (
            <img 
              src={asset.url} 
              alt={asset.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div 
              className="w-full h-full"
              style={{ 
                background: asset.type === 'gradient' 
                  ? `linear-gradient(135deg, ${asset.colors?.join(', ')})` 
                  : asset.value
              }}
            />
          )
        ) : activeTab === 'characters' ? (
          <div className="w-full h-full flex items-center justify-center">
            {getCharacterDefaultImage && getCharacterDefaultImage(asset) ? (
              <img 
                src={getCharacterDefaultImage(asset)} 
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-16 h-20 rounded flex items-center justify-center"
                style={{ backgroundColor: asset.color }}
              >
                <User size={24} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
            <Music size={32} className="text-white" />
          </div>
        )}
        
        {/* Overlay Actions */}
        {!onSelectAsset && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTab === 'characters') {
                    setShowCharacterDetails(asset);
                  } else {
                    setShowAssetDetails(asset);
                  }
                }}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <Eye size={16} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateAsset(asset, activeTab);
                }}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <Copy size={16} className="text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAsset(asset.id, activeTab);
                }}
                className="p-2 bg-red-500 bg-opacity-70 rounded-full hover:bg-opacity-90 transition-colors"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Selection Indicator for asset selection mode */}
        {onSelectAsset && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </div>
        )}

        {/* Selection Checkbox for bulk actions */}
        {bulkActions && (
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={selectedAssets.includes(asset.id)}
              onChange={() => handleAssetSelect(asset.id)}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Asset Type Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            activeTab === 'backgrounds' ? 'bg-blue-600 text-white' :
            activeTab === 'characters' ? 'bg-purple-600 text-white' :
            'bg-green-600 text-white'
          }`}>
            {asset.category}
          </span>
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-3">
        <h4 className="font-medium text-white mb-1 truncate">{asset.name}</h4>
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{asset.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {asset.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="px-1 py-0.5 bg-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
          {asset.tags?.length > 3 && (
            <span className="px-1 py-0.5 bg-gray-600 text-xs rounded">
              +{asset.tags.length - 3}
            </span>
          )}
        </div>

        {/* Special info for characters */}
        {activeTab === 'characters' && (
          <div className="text-xs text-gray-400 mb-2">
            {asset.outfits?.length || 0} outfit{(asset.outfits?.length || 0) !== 1 ? 's' : ''}
          </div>
        )}

        {/* Metadata */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{asset.metadata?.size}</span>
          <span>{new Date(asset.metadata?.created).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const AssetListItem = ({ asset }) => (
    <div className={`bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors flex items-center gap-4 ${
      selectedAssets.includes(asset.id) ? 'ring-2 ring-purple-500' : ''
    } ${onSelectAsset ? 'cursor-pointer hover:ring-2 hover:ring-blue-500' : ''}`}
      onClick={() => handleAssetClick(asset)}
    >
      {/* Selection Checkbox */}
      {bulkActions && (
        <input
          type="checkbox"
          checked={selectedAssets.includes(asset.id)}
          onChange={() => handleAssetSelect(asset.id)}
          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Asset Thumbnail */}
      <div className="w-16 h-16 bg-gray-600 rounded overflow-hidden flex-shrink-0">
        {activeTab === 'backgrounds' ? (
          asset.type === 'image' ? (
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div 
              className="w-full h-full"
              style={{ 
                background: asset.type === 'gradient' 
                  ? `linear-gradient(135deg, ${asset.colors?.join(', ')})` 
                  : asset.value
              }}
            />
          )
        ) : activeTab === 'characters' ? (
          getCharacterDefaultImage && getCharacterDefaultImage(asset) ? (
            <img src={getCharacterDefaultImage(asset)} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: asset.color }}>
              <User size={20} className="text-white" />
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
            <Music size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Asset Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-white truncate">{asset.name}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            activeTab === 'backgrounds' ? 'bg-blue-600 text-white' :
            activeTab === 'characters' ? 'bg-purple-600 text-white' :
            'bg-green-600 text-white'
          }`}>
            {asset.category}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-2">{asset.description}</p>
        <div className="flex flex-wrap gap-1">
          {asset.tags?.slice(0, 5).map(tag => (
            <span key={tag} className="px-1 py-0.5 bg-gray-600 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Asset Metadata */}
      <div className="text-right text-sm text-gray-400 flex-shrink-0">
        <div>{asset.metadata?.size}</div>
        <div>{asset.metadata?.dimensions || 'N/A'}</div>
        <div>{new Date(asset.metadata?.created).toLocaleDateString()}</div>
      </div>

      {/* Actions */}
      {!onSelectAsset && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeTab === 'characters') {
                setShowCharacterDetails(asset);
              } else {
                setShowAssetDetails(asset);
              }
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateAsset(asset, activeTab);
            }}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAsset(asset.id, activeTab);
            }}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Selection indicator */}
      {onSelectAsset && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">
              {onSelectAsset ? 'Select Asset' : 'Asset Manager'}
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>{sortedAssets.length} assets</span>
              {selectedAssets.length > 0 && (
                <span className="text-purple-400">• {selectedAssets.length} selected</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? `text-${tab.color}-400 border-b-2 border-${tab.color}-400 bg-gray-750`
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-700 bg-gray-750">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              />
            </div>

            {/* Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
            >
              {assetCategories[activeTab]?.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
              <option value="size-desc">Largest First</option>
              <option value="size-asc">Smallest First</option>
            </select>

            {/* View Mode */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              {[
                { mode: 'grid', icon: Grid },
                { mode: 'list', icon: List }
              ].map(({ mode, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded transition-colors ${
                    viewMode === mode
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            {/* Bulk Actions Toggle (hidden in selection mode) */}
            {!onSelectAsset && (
              <button
                onClick={() => {
                  setBulkActions(!bulkActions);
                  setSelectedAssets([]);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  bulkActions
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Bulk Actions
              </button>
            )}

            {/* Upload Button (hidden in selection mode) */}
            {!onSelectAsset && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Upload
              </button>
            )}
          </div>

          {/* Bulk Action Bar */}
          {bulkActions && selectedAssets.length > 0 && (
            <div className="mt-4 p-3 bg-purple-600 bg-opacity-20 border border-purple-500 rounded-lg flex items-center justify-between">
              <span className="text-purple-400 font-medium">
                {selectedAssets.length} asset{selectedAssets.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDuplicate}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors text-sm flex items-center gap-1"
                >
                  <Copy size={14} />
                  Duplicate
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedAssets([])}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Selection Mode Instructions */}
          {onSelectAsset && (
            <div className="mt-4 p-3 bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg">
              <p className="text-blue-400 text-sm">
                Click on an asset to select it for your scene
              </p>
            </div>
          )}
        </div>

        {/* Asset Grid/List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Image size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No assets found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload some assets to get started.'
                }
              </p>
              {!onSelectAsset && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Upload Assets
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedAssets.map(asset => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAssets.map(asset => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Assets</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <h4 className="text-lg font-medium text-white mb-2">Drop files here</h4>
                <p className="text-gray-400 mb-4">or click to browse</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={
                    activeTab === 'backgrounds' ? 'image/*' :
                    activeTab === 'characters' ? 'image/*' :
                    'audio/*'
                  }
                  onChange={(e) => {
                    onFileUpload(e.target.files, activeTab);
                    setShowUploadModal(false);
                  }}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Choose Files
                </button>
              </div>

              <div className="text-sm text-gray-400">
                <p className="mb-2">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1">
                  {activeTab === 'backgrounds' && (
                    <>
                      <li>Images: JPG, PNG, GIF, WebP</li>
                      <li>Max size: 10MB per file</li>
                    </>
                  )}
                  {activeTab === 'characters' && (
                    <>
                      <li>Images: JPG, PNG, GIF, WebP</li>
                      <li>Max size: 5MB per file</li>
                    </>
                  )}
                  {activeTab === 'audio' && (
                    <>
                      <li>Audio: MP3, WAV, OGG</li>
                      <li>Max size: 20MB per file</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showAssetDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Asset Details</h3>
                <button
                  onClick={() => setShowAssetDetails(null)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Asset Preview */}
                <div>
                  <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-4">
                    {activeTab === 'backgrounds' ? (
                      showAssetDetails.type === 'image' ? (
                        <img 
                          src={showAssetDetails.url} 
                          alt={showAssetDetails.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{ 
                            background: showAssetDetails.type === 'gradient' 
                              ? `linear-gradient(135deg, ${showAssetDetails.colors?.join(', ')})` 
                              : showAssetDetails.value
                          }}
                        />
                      )
                    ) : activeTab === 'characters' ? (
                      getCharacterDefaultImage && getCharacterDefaultImage(showAssetDetails) ? (
                        <img 
                          src={getCharacterDefaultImage(showAssetDetails)} 
                          alt={showAssetDetails.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: showAssetDetails.color }}
                        >
                          <User size={48} className="text-white" />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
                        <Music size={48} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onDuplicateAsset(showAssetDetails, activeTab)}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        onDeleteAsset(showAssetDetails.id, activeTab);
                        setShowAssetDetails(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Asset Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <div className="p-2 bg-gray-700 rounded border text-white">
                      {showAssetDetails.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <div className="p-2 bg-gray-700 rounded border text-white min-h-[60px]">
                      {showAssetDetails.description || 'No description'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <div className="p-2 bg-gray-700 rounded border text-white">
                      {showAssetDetails.category}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {showAssetDetails.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-600 text-sm rounded">
                          {tag}
                        </span>
                      )) || <span className="text-gray-400">No tags</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Metadata</label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span className="text-white">{showAssetDetails.metadata?.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions:</span>
                        <span className="text-white">{showAssetDetails.metadata?.dimensions || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">
                          {new Date(showAssetDetails.metadata?.created).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Modified:</span>
                        <span className="text-white">
                          {new Date(showAssetDetails.metadata?.modified).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Character Details Modal */}
      {showCharacterDetails && (
        <CharacterDetailsModal 
          character={showCharacterDetails} 
          onClose={() => setShowCharacterDetails(null)} 
        />
      )}

      {/* Edit Outfit Modal */}
      {editingOutfit && (
        <EditOutfitModal 
          character={editingOutfit.character}
          outfit={editingOutfit.outfit}
          onClose={() => setEditingOutfit(null)}
        />
      )}
    </div>
  );
};

export default AssetManager;