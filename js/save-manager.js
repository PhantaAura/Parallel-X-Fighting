import {SAVE_SCHEMA_VERSION,BUILD_VERSION} from './build-info.js?v=29a391-chapter4-ending-continuity-20260801';

export const SAVE_EXPORT_KEYS=Object.freeze([
  'pxSave',
  'pxLostYearProgressV1',
  'pxLensMasteryV1',
  'pxCombatManualV1',
  'pxMasteryRecordsV1',
  'pxArenaControlsV1',
  'pxDialoguePrefsV1',
  'pxControllerSettingsV1',
  'pxTouchSettingsV1',
  'pxRrvvfoVisualsV1',
  'pxQolSettingsV1',
  'pxAbilityHotbarV1',
  'pxMobilePresentationV1',
  'pxTrainingPresetsV1',
  'pxQolLastActivity',
  'pxQolStartSeen',
  'pxHintsDismissed'
]);

const SETTINGS_KEYS=Object.freeze([
  'pxControllerSettingsV1','pxTouchSettingsV1','pxRrvvfoVisualsV1','pxQolSettingsV1',
  'pxAbilityHotbarV1','pxMobilePresentationV1','pxArenaControlsV1','pxDialoguePrefsV1','pxHintsDismissed'
]);
const TRAINING_KEYS=Object.freeze(['pxTrainingPresetsV1']);
function availableStorage(){try{return globalThis.localStorage}catch{return null}}

function storageRead(storage,key){try{return storage?.getItem?.(key)??null}catch{return null}}
function storageWrite(storage,key,value){storage?.setItem?.(key,value)}
function storageRemove(storage,key){storage?.removeItem?.(key)}

export function createSaveExport(storage=availableStorage()){
  const data={};
  for(const key of SAVE_EXPORT_KEYS){
    const value=storageRead(storage,key);
    if(value!==null&&value!==undefined)data[key]=String(value);
  }
  return{schema:SAVE_SCHEMA_VERSION,build:BUILD_VERSION,exportedAt:new Date().toISOString(),data};
}

export function stringifySave(storage=availableStorage()){return JSON.stringify(createSaveExport(storage),null,2)}

export function validateSaveImport(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||!value.data||typeof value.data!=='object'||Array.isArray(value.data))return{valid:false,error:'Invalid save structure'};
  if(!Number.isInteger(value.schema))return{valid:false,error:'Save schema is missing'};
  if(value.schema!==SAVE_SCHEMA_VERSION)return{valid:false,error:`Incompatible save schema ${value.schema}. This build requires schema ${SAVE_SCHEMA_VERSION}.`};
  for(const [key,item] of Object.entries(value.data)){
    if(!SAVE_EXPORT_KEYS.includes(key)||typeof item!=='string'||item.length>500000)return{valid:false,error:`Invalid save entry: ${key}`};
    if(item.trim().startsWith('{')||item.trim().startsWith('[')){
      try{JSON.parse(item)}catch{return{valid:false,error:`Malformed JSON in ${key}`}}
    }
  }
  return{valid:true,data:value.data,schema:value.schema,build:value.build||''};
}

export function importSaveText(text,storage=availableStorage()){
  let parsed;
  try{parsed=JSON.parse(String(text))}catch{return{ok:false,error:'Save text is not valid JSON'}}
  const checked=validateSaveImport(parsed);
  if(!checked.valid)return{ok:false,error:checked.error};
  const previous=Object.fromEntries(SAVE_EXPORT_KEYS.map(key=>[key,storageRead(storage,key)]));
  try{
    for(const key of SAVE_EXPORT_KEYS)storageRemove(storage,key);
    for(const [key,value] of Object.entries(checked.data))storageWrite(storage,key,value);
    return{ok:true,build:checked.build,schema:checked.schema};
  }catch(error){
    try{
      for(const [key,value] of Object.entries(previous)){
        if(value===null)storageRemove(storage,key);else storageWrite(storage,key,value);
      }
    }catch{}
    return{ok:false,error:error?.message||'Import failed'};
  }
}

export function resetSaveGroup(group,storage=availableStorage()){
  const keys=group==='settings'?SETTINGS_KEYS:group==='training'?TRAINING_KEYS:SAVE_EXPORT_KEYS;
  let removed=0;
  for(const key of keys){
    try{storageRemove(storage,key);removed++}catch{}
  }
  return removed;
}
