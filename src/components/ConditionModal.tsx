import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Save, AlertCircle, CheckCircle,
  Brain, Target, Zap
} from 'lucide-react';

const ConditionModal = ({ 
  isOpen, 
  onClose, 
  scene,
  condition,
  onSave,
  gameVariables 
}) => {
  const [localCondition, setLocalCondition] = useState(condition || {
    type: 'conditional',
    requirements: [],
    actions: []
  });

  if (!isOpen) return null;

  // Get all available variables for conditions
  const getAllVariables = () => {
    const variables = [];
    
    // Player stats
    Object.keys(gameVariables.playerStats).forEach(key => {
      variables.push({
        key: `stats.${key}`,
        label: gameVariables.playerStats[key].label,
        type: 'number',
        category: 'Player Stats'
      });
    });
    
    // Relationships
    Object.keys(gameVariables.relationships).forEach(key => {
      variables.push({
        key: `relationships.${key}`,
        label: gameVariables.relationships[key].label,
        type: 'number',
        category: 'Relationships'
      });
    });
    
    // Story flags
    Object.keys(gameVariables.storyFlags).forEach(key => {
      variables.push({
        key: `flags.${key}`,
        label: gameVariables.storyFlags[key].label,
        type: 'boolean',
        category: 'Story Flags'
      });
    });
    
    // Time system
    variables.push(
      { key: 'time.day', label: 'Day', type: 'number', category: 'Time' },
      { key: 'time.timeOfDay', label: 'Time of Day', type: 'text', category: 'Time' },
      { key: 'time.dayOfWeek', label: 'Day of Week', type: 'text', category: 'Time' },
      { key: 'time.season', label: 'Season', type: 'text', category: 'Time' }
    );
    
    // Custom variables
    gameVariables.customVariables.forEach(variable => {
      variables.push({
        key: `custom.${variable.name}`,
        label: variable.label,
        type: variable.type,
        category: 'Custom'
      });
    });
    
    return variables;
  };

  const operators = {
    number: [
      { value: '==', label: 'equals' },
      { value: '!=', label: 'not equals' },
      { value: '>', label: 'greater than' },
      { value: '>=', label: 'greater than or equal' },
      { value: '<', label: 'less than' },
      { value: '<=', label: 'less than or equal' }
    ],
    boolean: [
      { value: '==', label: 'is' },
      { value: '!=', label: 'is not' }
    ],
    text: [
      { value: '==', label: 'equals' },
      { value: '!=', label: 'not equals' },
      { value: 'contains', label: 'contains' },
      { value: 'starts_with', label: 'starts with' }
    ]
  };

  const addRequirement = () => {
    setLocalCondition(prev => ({
      ...prev,
      requirements: [...prev.requirements, {
        variable: '',
        operator: '==',
        value: '',
        id: Date.now()
      }]
    }));
  };

  const updateRequirement = (index, updates) => {
    setLocalCondition(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => 
        i === index ? { ...req, ...updates } : req
      )
    }));
  };

  const removeRequirement = (index) => {
    setLocalCondition(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addAction = () => {
    setLocalCondition(prev => ({
      ...prev,
      actions: [...prev.actions, {
        type: 'set_variable',
        target: '',
        value: '',
        id: Date.now()
      }]
    }));
  };

  const updateAction = (index, updates) => {
    setLocalCondition(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, ...updates } : action
      )
    }));
  };

  const removeAction = (index) => {
    setLocalCondition(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(scene.id, localCondition);
    onClose();
  };

  const variables = getAllVariables();
  const groupedVariables = variables.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="bg-gray-900 p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain size={24} className="text-purple-500" />
                Scene Conditions
              </h2>
              <p className="text-gray-400 mt-1">
                Configure when and how "<span className="text-purple-400">{scene?.title}</span>" should be accessible
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-8">
            {/* Scene Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Scene Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setLocalCondition(prev => ({ ...prev, type: 'conditional' }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    localCondition.type === 'conditional'
                      ? 'border-purple-500 bg-purple-900/30 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} />
                    <span className="font-medium">Conditional Scene</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Only accessible when specific conditions are met
                  </p>
                </button>
                
                <button
                  onClick={() => setLocalCondition(prev => ({ ...prev, type: 'always' }))}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    localCondition.type === 'always'
                      ? 'border-green-500 bg-green-900/30 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} />
                    <span className="font-medium">Always Available</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Always accessible regardless of game state
                  </p>
                </button>
              </div>
            </div>

            {/* Requirements */}
            {localCondition.type === 'conditional' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target size={18} />
                    Requirements
                  </h3>
                  <button
                    onClick={addRequirement}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Requirement
                  </button>
                </div>

                <div className="space-y-3">
                  {localCondition.requirements.map((requirement, index) => {
                    const selectedVariable = variables.find(v => v.key === requirement.variable);
                    const availableOperators = selectedVariable ? operators[selectedVariable.type] || [] : [];

                    return (
                      <div key={requirement.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Variable Selection */}
                          <div className="col-span-4">
                            <select
                              value={requirement.variable}
                              onChange={(e) => updateRequirement(index, { variable: e.target.value })}
                              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">Select Variable</option>
                              {Object.entries(groupedVariables).map(([category, vars]) => (
                                <optgroup key={category} label={category}>
                                  {vars.map(variable => (
                                    <option key={variable.key} value={variable.key}>
                                      {variable.label}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>

                          {/* Operator */}
                          <div className="col-span-3">
                            <select
                              value={requirement.operator}
                              onChange={(e) => updateRequirement(index, { operator: e.target.value })}
                              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              disabled={!selectedVariable}
                            >
                              {availableOperators.map(op => (
                                <option key={op.value} value={op.value}>
                                  {op.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Value */}
                          <div className="col-span-4">
                            {selectedVariable?.type === 'boolean' ? (
                              <select
                                value={requirement.value}
                                onChange={(e) => updateRequirement(index, { value: e.target.value })}
                                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="true">True</option>
                                <option value="false">False</option>
                              </select>
                            ) : selectedVariable?.type === 'text' && selectedVariable.key.includes('time.') ? (
                              <select
                                value={requirement.value}
                                onChange={(e) => updateRequirement(index, { value: e.target.value })}
                                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                {selectedVariable.key === 'time.timeOfDay' && (
                                  <>
                                    <option value="morning">🌅 Morning</option>
                                    <option value="afternoon">☀️ Afternoon</option>
                                    <option value="evening">🌇 Evening</option>
                                    <option value="night">🌙 Night</option>
                                    {/* Custom time periods */}
                                    {gameVariables.timeSystem?.customPeriods && 
                                      Object.entries(gameVariables.timeSystem.customPeriods).map(([value, period]) => (
                                        <option key={value} value={value}>
                                          {period.emoji} {period.label}
                                        </option>
                                      ))
                                    }
                                  </>
                                )}
                                {selectedVariable.key === 'time.dayOfWeek' && (
                                  <>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                  </>
                                )}
                                {selectedVariable.key === 'time.season' && (
                                  <>
                                    <option value="spring">Spring</option>
                                    <option value="summer">Summer</option>
                                    <option value="fall">Fall</option>
                                    <option value="winter">Winter</option>
                                  </>
                                )}
                              </select>
                            ) : (
                              <input
                                type={selectedVariable?.type === 'number' ? 'number' : 'text'}
                                value={requirement.value}
                                onChange={(e) => updateRequirement(index, { value: e.target.value })}
                                placeholder="Enter value"
                                className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            )}
                          </div>

                          {/* Remove Button */}
                          <div className="col-span-1">
                            <button
                              onClick={() => removeRequirement(index)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {localCondition.requirements.length === 0 && (
                    <div className="text-center text-gray-400 py-8">
                      <Target size={32} className="mx-auto mb-2" />
                      <p>No requirements set</p>
                      <p className="text-sm mt-1">Add requirements to control when this scene is accessible</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap size={18} />
                  Actions (Optional)
                </h3>
                <button
                  onClick={addAction}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Action
                </button>
              </div>

              <div className="space-y-3">
                {localCondition.actions.map((action, index) => (
                  <div key={action.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Action Type */}
                      <div className="col-span-3">
                        <select
                          value={action.type}
                          onChange={(e) => updateAction(index, { type: e.target.value })}
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="set_variable">Set Variable</option>
                          <option value="increment">Increment</option>
                          <option value="decrement">Decrement</option>
                          <option value="toggle_flag">Toggle Flag</option>
                        </select>
                      </div>

                      {/* Target Variable */}
                      <div className="col-span-4">
                        <select
                          value={action.target}
                          onChange={(e) => updateAction(index, { target: e.target.value })}
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select Target</option>
                          {Object.entries(groupedVariables).map(([category, vars]) => (
                            <optgroup key={category} label={category}>
                              {vars.map(variable => (
                                <option key={variable.key} value={variable.key}>
                                  {variable.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* Value */}
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={action.value}
                          onChange={(e) => updateAction(index, { value: e.target.value })}
                          placeholder="Value"
                          className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1">
                        <button
                          onClick={() => removeAction(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {localCondition.actions.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Zap size={32} className="mx-auto mb-2" />
                    <p>No actions set</p>
                    <p className="text-sm mt-1">Actions are executed when the scene is entered</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 p-6 border-t border-gray-700 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save Conditions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionModal; 