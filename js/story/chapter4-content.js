import {normalizeRpgPacingState} from './rpg-pacing.js?v=29a36-playful-exploration-quest-variety-20260801';
import {CHAPTER4_PARTY_FIELD_ACTIONS,normalizeQuestVarietyState} from './quest-variety.js?v=29a36-playful-exploration-quest-variety-20260801';
export const CHAPTER4_MISSION_ID='rrvvfo-04';
export const CHAPTER4_STATE_VERSION=4;

export const CHAPTER4_REQUIRED_STEPS=Object.freeze([
  'opening','villageReached','barkWadeArrive','beaconRestored','cavernsEntered',
  'liftPartsRecovered','villageDefended','mountainDecision','mountainEntered',
  'mountainSignals','hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved'
]);

export const CHAPTER4_BEACON_NODES=Object.freeze([
  Object.freeze({id:'signal-blocker',label:'DESTROY SIGNAL BLOCKER',x:-520,z:520,role:'RRVVFO'}),
  Object.freeze({id:'stone-support',label:'STABILIZE STONE SUPPORT',x:-350,z:610,role:'BARK'}),
  Object.freeze({id:'energy-feed',label:'RECONNECT ENERGY FEED',x:-180,z:520,role:'WADE'})
]);

export const CHAPTER4_CAVERN_DOORS=Object.freeze([
  Object.freeze({id:'fire-door',label:'FIRE-SEAL DOOR',x:-720,z:-260,element:'FIRE'}),
  Object.freeze({id:'earth-door',label:'EARTH-SEAL DOOR',x:-120,z:280,element:'EARTH'}),
  Object.freeze({id:'lightning-door',label:'LIGHTNING-SEAL DOOR',x:470,z:-250,element:'LIGHTNING'})
]);

export const CHAPTER4_LIFT_PARTS=Object.freeze([
  Object.freeze({id:'drive-gear',label:'LIFT DRIVE GEAR',x:720,z:280}),
  Object.freeze({id:'resonance-coil',label:'RESONANCE COIL',x:890,z:-40}),
  Object.freeze({id:'brake-core',label:'MOUNTAIN BRAKE CORE',x:720,z:-330})
]);

export const CHAPTER4_INGREDIENTS=Object.freeze([
  Object.freeze({id:'emberBloom',title:'EMBER BLOOM',label:'CONTROL THE EMBER BLOOM',area:'village',x:460,z:600}),
  Object.freeze({id:'rootstone',title:'ROOTSTONE',label:'RETRIEVE THE ROOTSTONE',area:'cavern',x:180,z:520}),
  Object.freeze({id:'thunderDew',title:'THUNDER DEW',label:'REDIRECT THE STORM',area:'village',x:-980,z:-520}),
  Object.freeze({id:'triadSeed',title:'TRIAD SEED',label:'OPEN THE TRIAD MECHANISM',area:'village',x:760,z:-620})
]);

export const CHAPTER4_MOUNTAIN_SIGNALS=Object.freeze([
  Object.freeze({id:'bridge-echo',label:'ANCIENT BRIDGE ECHO',x:-720,z:240}),
  Object.freeze({id:'hollow-relay',label:'PROJECT HOLLOW RELAY',x:-180,z:-280}),
  Object.freeze({id:'lookout-signal',label:'LOOKOUT SIGNAL',x:430,z:250})
]);

function unique(values){return[...new Set(Array.isArray(values)?values:[])]}

export function freshChapter4State(){
  return{
    version:CHAPTER4_STATE_VERSION,
    location:'echo-region',
    requiredCompleted:[],
    beaconNodes:[],cavernDoors:[],liftParts:[],mountainSignals:[],
    pacing:normalizeRpgPacingState('chapter4'),
    variety:normalizeQuestVarietyState('chapter4'),
    villageDefenseComplete:false,teamRestSeen:false,charm:{echoChimesComplete:false},
    ryuzankaro:{available:false,started:false,ingredients:[],swarmsCleared:[],bossDefeated:false,skipped:false,phase:'idle',checkpoint:'none',rewardsGranted:false},
    rewards:{lensMastery:0,vibrationSense:false,objectSwapRange:0,teamBadge:false,ryuzankaroCodex:false},
    hollowWatcher:{defeated:false,patternsRecorded:0,highestConfidence:0},
    chapterComplete:false
  };
}

export function chapter4VillageDefenseComplete(state){
  return Boolean(state?.villageDefenseComplete&&Array.isArray(state?.requiredCompleted)&&state.requiredCompleted.includes('villageDefended'));
}

export function ryuzankaroQuestAvailable(state){
  return Boolean(chapter4VillageDefenseComplete(state)&&state?.ryuzankaro?.available);
}

export function normalizeChapter4State(value={}){
  const base=freshChapter4State(),source=value&&typeof value==='object'?value:{};
  let requiredCompleted=unique(source.requiredCompleted);
  const villageDefenseIndex=CHAPTER4_REQUIRED_STEPS.indexOf('villageDefended');
  const inferredVillageDefense=Boolean(source.villageDefenseComplete||requiredCompleted.some(id=>CHAPTER4_REQUIRED_STEPS.indexOf(id)>=villageDefenseIndex));
  if(inferredVillageDefense&&!requiredCompleted.includes('villageDefended'))requiredCompleted=unique([...requiredCompleted,'villageDefended']);
  const villageDefenseComplete=requiredCompleted.includes('villageDefended');
  const sourceRyuzankaro=source.ryuzankaro||{};
  const pacing=normalizeRpgPacingState('chapter4',source.pacing);
  const variety=normalizeQuestVarietyState('chapter4',source.variety);
  if(requiredCompleted.includes('cavernsEntered')){variety.fieldActions=CHAPTER4_PARTY_FIELD_ACTIONS.map(action=>action.id);variety.fieldRouteComplete=true;variety.persistentChanges=[...new Set([...(variety.persistentChanges||[]),'echo-cavern-route-repaired'])]}
  if(requiredCompleted.includes('barkWadeArrive')){pacing.interactions=[...new Set([...pacing.interactions,'resonance-wall','water-channel'])];pacing.orientationComplete=true;pacing.wave=Math.max(1,pacing.wave)}
  return{
    ...base,...source,version:CHAPTER4_STATE_VERSION,
    requiredCompleted,
    pacing,
    variety,
    beaconNodes:unique(source.beaconNodes),cavernDoors:unique(source.cavernDoors),liftParts:unique(source.liftParts),mountainSignals:unique(source.mountainSignals),
    villageDefenseComplete,
    ryuzankaro:{...base.ryuzankaro,...sourceRyuzankaro,available:villageDefenseComplete,ingredients:unique(sourceRyuzankaro.ingredients),swarmsCleared:unique(sourceRyuzankaro.swarmsCleared)},
    rewards:{...base.rewards,...(source.rewards||{})},
    charm:{...base.charm,...(source.charm||{})},
    hollowWatcher:{...base.hollowWatcher,...(source.hollowWatcher||{})},
    chapterComplete:Boolean(source.chapterComplete)
  };
}

export function markChapter4Required(state,id){
  if(CHAPTER4_REQUIRED_STEPS.includes(id))state.requiredCompleted=unique([...state.requiredCompleted,id]);
  return state;
}

export function chapter4StepComplete(state,id){return Boolean(state?.requiredCompleted?.includes(id))}
export function chapter4Complete(state){return CHAPTER4_REQUIRED_STEPS.every(id=>chapter4StepComplete(state,id))}
export function chapter4RequiredCount(state){return CHAPTER4_REQUIRED_STEPS.filter(id=>chapter4StepComplete(state,id)).length}
export function chapter4CompletionPercent(state){return Math.round(chapter4RequiredCount(state)/CHAPTER4_REQUIRED_STEPS.length*100)}
export function chapter4NextRequired(state){return CHAPTER4_REQUIRED_STEPS.find(id=>!chapter4StepComplete(state,id))||null}
export function ryuzankaroQuestResolved(state){return Boolean(state?.ryuzankaro?.bossDefeated||state?.ryuzankaro?.skipped)}
