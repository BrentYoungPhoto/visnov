import React, { useState } from 'react';
import { 
  X, Plus, Edit, Trash2, Play, Settings, Eye, 
  Film, Clock, Type, Layers, Volume2, SkipForward
} from 'lucide-react';

const CutsceneEditor = ({ isOpen, onClose, cutscenes, setCutscenes, videos, scenes }) => {
  const [selectedCutscene, setSelectedCutscene] = useState(null);
  const [editingCutscene, setEditingCutscene] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isOpen) return null;

  const handleCreateCutscene = (cutsceneData) => {
    const newCutscene = {
      id: `cutscene${Date.now()}`,
      ...cutsceneData,
      subtitles: [],
      effects: {
        fade: true,
        letterbox: false
      }
    };
    setCutscenes([...cutscenes, newCutscene]);
    setShowCreateModal(false);
  };

  const handleUpdateCutscene = (cutsceneId, updates) => {
    setCutscenes(cutscenes.map(c => 
      c.id === cutsceneId ? { ...c, ...updates } : c
    ));
  };

  const handleDeleteCutscene = (cutsceneId) => {
    setCutscenes(cutscenes.filter(c => c.id !== cutsceneId));
    if (selectedCutscene?.id === cutsceneId) {
      setSelectedCutscene(null);
    }
  };

  const CreateCutsceneModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      video: '',
      skipable: true,
      autoAdvance: true,
      nextScene: '',
      overlayText: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.name && formData.video) {
        handleCreateCutscene(formData);
        setFormData({
          name: '',
          video: '',
          skipable: true,
          autoAdvance: true,
          nextScene: '',
          overlayText: ''
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Create Cutscene</h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                placeholder="Enter cutscene name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Video</label>
              <select
                value={formData.video}
                onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                required
              >
                <option value="">Select video</option>
                {videos.map(video => (
                  <option key={video.id} value={video.id}>{video.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Next Scene</label>
              <select
                value={formData.nextScene}
                onChange={(e) => setFormData(prev => ({ ...prev, nextScene: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
              >
                <option value="">No auto-advance</option>
                {scenes.map(scene => (
                  <option key={scene.id} value={scene.id}>{scene.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Overlay Text (Optional)</label>
              <textarea
                value={formData.overlayText}
                onChange={(e) => setFormData(prev => ({ ...prev, overlayText: e.target.value }))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white h-20 resize-none"
                placeholder="Optional text to display over the video"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="skipable"
                  checked={formData.skipable}
                  onChange={(e) => setFormData(prev => ({ ...prev, skipable: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="skipable" className="text-sm text-gray-300">Allow skipping</label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoAdvance"
                  checked={formData.autoAdvance}
                  onChange={(e) => setFormData(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoAdvance" className="text-sm text-gray-300">Auto-advance to next scene</label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Cutscene
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-5xl h-full max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Film size={24} />
              Cutscene Editor
            </h2>
            <span className="text-sm text-gray-400">{cutscenes.length} cutscenes</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Cutscene
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Cutscene List */}
          <div className="w-80 bg-gray-750 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Cutscenes</h3>
              
              {cutscenes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Film size={24} className="text-gray-500" />
                  </div>
                  <p className="text-gray-400 mb-4">No cutscenes created yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create First Cutscene
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {cutscenes.map(cutscene => {
                    const video = videos.find(v => v.id === cutscene.video);
                    return (
                      <div
                        key={cutscene.id}
                        onClick={() => setSelectedCutscene(cutscene)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedCutscene?.id === cutscene.id
                            ? 'bg-purple-600 ring-2 ring-purple-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{cutscene.name}</h4>
                          <div className="flex gap-1">
                            {cutscene.skipable && (
                              <SkipForward size={12} className="text-gray-400" />
                            )}
                            {cutscene.autoAdvance && (
                              <Play size={12} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-1">
                          Video: {video?.name || 'None'}
                        </div>
                        
                        {video && (
                          <div className="text-xs text-gray-400">
                            Duration: {video.metadata?.duration || 'Unknown'}
                          </div>
                        )}
                        
                        {cutscene.nextScene && (
                          <div className="text-xs text-gray-400 mt-1">
                            → {scenes.find(s => s.id === cutscene.nextScene)?.title || 'Unknown Scene'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cutscene Editor */}
          <div className="flex-1 flex flex-col">
            {selectedCutscene ? (
              <>
                {/* Editor Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-750">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{selectedCutscene.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingCutscene(selectedCutscene)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCutscene(selectedCutscene.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="flex-1 bg-black flex items-center justify-center">
                  {videos.find(v => v.id === selectedCutscene.video) ? (
                    <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded overflow-hidden">
                      <video
                        src={videos.find(v => v.id === selectedCutscene.video)?.url}
                        className="w-full h-full object-contain"
                        controls
                        poster=""
                      />
                      
                      {/* Overlay Text Preview */}
                      {selectedCutscene.overlayText && (
                        <div className="absolute bottom-20 left-0 right-0 text-center pointer-events-none">
                          <div className="inline-block px-6 py-3 bg-black bg-opacity-75 text-white text-lg rounded-lg">
                            {selectedCutscene.overlayText}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Film size={48} className="mx-auto mb-4" />
                      <p>No video selected for this cutscene</p>
                    </div>
                  )}
                </div>

                {/* Cutscene Properties */}
                <div className="p-4 border-t border-gray-700 bg-gray-750">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Video:</span>
                      <div className="text-white font-medium">
                        {videos.find(v => v.id === selectedCutscene.video)?.name || 'None'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <div className="text-white font-medium">
                        {videos.find(v => v.id === selectedCutscene.video)?.metadata?.duration || 'Unknown'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Skipable:</span>
                      <div className="text-white font-medium">
                        {selectedCutscene.skipable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-400">Auto-advance:</span>
                      <div className="text-white font-medium">
                        {selectedCutscene.autoAdvance ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                  
                  {selectedCutscene.overlayText && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <span className="text-gray-400 text-sm">Overlay Text:</span>
                      <div className="text-white mt-1">{selectedCutscene.overlayText}</div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4" />
                  <p>Select a cutscene to preview and edit</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Cutscene Modal */}
        {showCreateModal && <CreateCutsceneModal />}

        {/* Edit Cutscene Modal */}
        {editingCutscene && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Edit Cutscene</h3>
                <button
                  onClick={() => setEditingCutscene(null)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingCutscene.name}
                    onChange={(e) => setEditingCutscene(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Video</label>
                  <select
                    value={editingCutscene.video}
                    onChange={(e) => setEditingCutscene(prev => ({ ...prev, video: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option value="">Select video</option>
                    {videos.map(video => (
                      <option key={video.id} value={video.id}>{video.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Next Scene</label>
                  <select
                    value={editingCutscene.nextScene}
                    onChange={(e) => setEditingCutscene(prev => ({ ...prev, nextScene: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option value="">No auto-advance</option>
                    {scenes.map(scene => (
                      <option key={scene.id} value={scene.id}>{scene.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Overlay Text</label>
                  <textarea
                    value={editingCutscene.overlayText}
                    onChange={(e) => setEditingCutscene(prev => ({ ...prev, overlayText: e.target.value }))}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:border-purple-500 focus:outline-none text-white h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-skipable"
                      checked={editingCutscene.skipable}
                      onChange={(e) => setEditingCutscene(prev => ({ ...prev, skipable: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="edit-skipable" className="text-sm text-gray-300">Allow skipping</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-autoAdvance"
                      checked={editingCutscene.autoAdvance}
                      onChange={(e) => setEditingCutscene(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="edit-autoAdvance" className="text-sm text-gray-300">Auto-advance to next scene</label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleUpdateCutscene(editingCutscene.id, editingCutscene);
                      setSelectedCutscene(editingCutscene);
                      setEditingCutscene(null);
                    }}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingCutscene(null)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CutsceneEditor;