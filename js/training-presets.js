export const TRAINING_PRESET_KEY='pxTrainingPresetsV1';
const allowed=['infiniteHealth','infiniteEnergy','infiniteGuard','guardRegen','perfectBlockPractice','infiniteClash','dummy','stationaryBlock'];
export function snapshotTraining(state){return Object.fromEntries(allowed.map(key=>[key,state[key]]))}
export function loadTrainingPresets(storage=globalThis.localStorage){try{const value=JSON.parse(storage?.getItem(TRAINING_PRESET_KEY)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{}}catch{return{}}}
export function saveTrainingPreset(name,state,storage=globalThis.localStorage){const clean=String(name||'Preset').trim().slice(0,30)||'Preset',presets=loadTrainingPresets(storage);presets[clean]=snapshotTraining(state);storage?.setItem?.(TRAINING_PRESET_KEY,JSON.stringify(presets));return clean}
export function applyTrainingPreset(name,state,storage=globalThis.localStorage){const preset=loadTrainingPresets(storage)[name];if(!preset)return false;for(const key of allowed)if(key in preset)state[key]=preset[key];return true}
export function deleteTrainingPreset(name,storage=globalThis.localStorage){const presets=loadTrainingPresets(storage);if(!(name in presets))return false;delete presets[name];storage?.setItem?.(TRAINING_PRESET_KEY,JSON.stringify(presets));return true}

