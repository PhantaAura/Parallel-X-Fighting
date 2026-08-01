const BUILD_KEY='pxRrvvfoBuildV1';
const ADVENTURE_KEY='pxAdventureProgressV1';

function storageOrFallback(storage=null){
  if(storage)return storage;
  try{return globalThis.localStorage}catch{}
  return globalThis.__PX_TEST_STORAGE__||null;
}
function readJson(key,fallback,storage=null){
  try{
    const raw=storageOrFallback(storage)?.getItem?.(key);
    if(!raw)return typeof structuredClone==='function'?structuredClone(fallback):JSON.parse(JSON.stringify(fallback));
    return JSON.parse(raw);
  }catch{return JSON.parse(JSON.stringify(fallback))}
}
function writeJson(key,value,storage=null){
  try{storageOrFallback(storage)?.setItem?.(key,JSON.stringify(value));return true}catch{return false}
}
function unique(values){return[...new Set(Array.isArray(values)?values:[])]}

export const CHAPTER_GAMEPLAY_IDENTITIES=Object.freeze({
  1:Object.freeze({
    id:'movement-adventure',
    label:'MOVEMENT ADVENTURE',
    primary:'Platforming + route choice',
    secondary:['Object Swap traversal','Optional shortcuts','Small roadside fights'],
    promise:'Learn Rrvvfo by moving through the world, not by reading a tutorial.'
  }),
  2:Object.freeze({
    id:'tournament-marathon',
    label:'TOURNAMENT MARATHON',
    primary:'Back-to-back combat + special match rules',
    secondary:['Ring-outs','Optional sparring','Festival downtime'],
    promise:'If you love fighting, this is the chapter that keeps handing you another match.'
  }),
  3:Object.freeze({
    id:'investigation-infiltration',
    label:'INVESTIGATION & INFILTRATION',
    primary:'Observe + deduce + enter restricted spaces',
    secondary:['Evidence reconstruction','Alternate entries','Combat when the investigation goes wrong'],
    promise:'Progress comes from noticing what is wrong, not only from beating whoever is nearby.'
  }),
  4:Object.freeze({
    id:'party-journey',
    label:'PARTY JOURNEY',
    primary:'3-person squad combat + village defense',
    secondary:['Team field actions','Vibration Sense','Solo mountain survival'],
    promise:'Bark and Wade materially change how encounters play — then the mountain takes them away.'
  })
});

export function chapterGameplayIdentity(chapter){
  return CHAPTER_GAMEPLAY_IDENTITIES[Math.max(1,Math.min(4,Number(chapter)||1))]||CHAPTER_GAMEPLAY_IDENTITIES[1];
}

export const ENEMY_ARCHETYPES=Object.freeze({
  rushdown:Object.freeze({id:'rushdown',label:'RUSHDOWN',color:'#ff7466',speed:1.18,attack:1.05,defense:.92,guardBias:.15,rangeBias:.15,description:'Closes space immediately. Punish over-commitment.'}),
  guard:Object.freeze({id:'guard',label:'GUARD',color:'#ffd377',speed:.88,attack:.92,defense:1.16,guardBias:.78,rangeBias:.20,description:'Blocks often. Grabs and guard breaks matter.'}),
  ranged:Object.freeze({id:'ranged',label:'RANGED',color:'#7de4ff',speed:.96,attack:.95,defense:.88,guardBias:.25,rangeBias:.88,description:'Backs away and pressures from distance.'}),
  heavy:Object.freeze({id:'heavy',label:'HEAVY',color:'#c89a65',speed:.72,attack:1.22,defense:1.32,guardBias:.38,rangeBias:.15,description:'Hard to move. Slow attacks demand respect.'}),
  trickster:Object.freeze({id:'trickster',label:'TRICKSTER',color:'#c69aff',speed:1.08,attack:.92,defense:.94,guardBias:.34,rangeBias:.52,description:'Dodges repeated approaches and changes spacing.'}),
  support:Object.freeze({id:'support',label:'SUPPORT',color:'#87e6a0',speed:.90,attack:.78,defense:.84,guardBias:.42,rangeBias:.62,description:'Keeps allies active. Prioritize it when the field gets crowded.'})
});
export function enemyArchetype(id='rushdown'){return ENEMY_ARCHETYPES[id]||ENEMY_ARCHETYPES.rushdown}

export const RRVVFO_BUILDS=Object.freeze({
  balanced:Object.freeze({
    id:'balanced',label:'BALANCED',
    techniques:['fireBlast','shotsOfAgony','objectSwap','lensOfTruth'],
    passives:['hotStart','parrySpark'],
    description:'Reliable energy and defensive reward. Best first-play setup.'
  }),
  fire:Object.freeze({
    id:'fire',label:'FIRE PRESSURE',
    techniques:['fireBlast','shotsOfAgony','ultimate','lensOfTruth'],
    passives:['fireFocus','pursuitBattery'],
    description:'Faster fire pressure and energy back for finishing pursuit routes.'
  }),
  improviser:Object.freeze({
    id:'improviser',label:'IMPROVISER',
    techniques:['objectSwap','fireBlast','lensOfTruth','ultimate'],
    passives:['swapEconomy','parrySpark'],
    description:'Cheaper Object Swap and a close-range swap punish for trick-heavy play.'
  })
});

export const RRVVFO_TECHNIQUES=Object.freeze({
  fireBlast:Object.freeze({id:'fireBlast',label:'FIRE BLAST'}),
  shotsOfAgony:Object.freeze({id:'shotsOfAgony',label:'SHOTS OF AGONY'}),
  objectSwap:Object.freeze({id:'objectSwap',label:'OBJECT SWAP'}),
  lensOfTruth:Object.freeze({id:'lensOfTruth',label:'LENS OF TRUTH'}),
  ultimate:Object.freeze({id:'ultimate',label:'SOLAR WEAVE'})
});
export const RRVVFO_PASSIVES=Object.freeze({
  hotStart:Object.freeze({id:'hotStart',label:'HOT START',description:'+12 starting Energy.'}),
  parrySpark:Object.freeze({id:'parrySpark',label:'PARRY SPARK',description:'Perfect parry restores 8 Energy.'}),
  fireFocus:Object.freeze({id:'fireFocus',label:'FIRE FOCUS',description:'Fire Blast and Shots of Agony recover 15% faster.'}),
  pursuitBattery:Object.freeze({id:'pursuitBattery',label:'PURSUIT BATTERY',description:'Pursuit finisher restores 7 Energy.'}),
  swapEconomy:Object.freeze({id:'swapEconomy',label:'SWAP ECONOMY',description:'Object Swap costs 5 less Energy.'})
});

export function normalizeRrvvfoBuild(value={}){
  const id=RRVVFO_BUILDS[value?.id]?value.id:'balanced';
  return{id,changedAt:Number(value?.changedAt)||0};
}
export function loadRrvvfoBuild(storage=null){
  return normalizeRrvvfoBuild(readJson(BUILD_KEY,{id:'balanced',changedAt:0},storage));
}
export function saveRrvvfoBuild(id,storage=null){
  const normalized=normalizeRrvvfoBuild({id,changedAt:Date.now()});
  writeJson(BUILD_KEY,normalized,storage);return normalized;
}
export function currentRrvvfoBuild(storage=null){
  const state=loadRrvvfoBuild(storage);return RRVVFO_BUILDS[state.id]||RRVVFO_BUILDS.balanced;
}
export function buildHasPassive(buildOrId,passive){
  const build=typeof buildOrId==='string'?RRVVFO_BUILDS[buildOrId]:buildOrId;
  return Boolean(build?.passives?.includes(passive));
}
export function tuneRrvvfoAbility(ability,build=currentRrvvfoBuild()){
  if(!ability)return ability;
  const next={...ability};
  if(buildHasPassive(build,'swapEconomy')&&next.id==='objectSwap')next.cost=Math.max(0,(Number(next.cost)||0)-5);
  if(buildHasPassive(build,'fireFocus')&&['fireBlast','shotsOfAgony'].includes(next.id))next.cooldown=(Number(next.cooldown)||0)*.85;
  return next;
}
export function applyRrvvfoBuildToFighter(fighter,build=currentRrvvfoBuild()){
  if(!fighter||fighter.id!=='rrvvfo')return fighter;
  fighter.storyBuildId=build.id;
  fighter.storyBuildPassives=[...build.passives];
  fighter.storyBuildTechniques=[...build.techniques];
  if(buildHasPassive(build,'hotStart'))fighter.en=Math.min(100,(Number(fighter.en)||0)+12);
  return fighter;
}

export const ADVENTURE_MISSIONS=Object.freeze([
  Object.freeze({id:'c1-high-road',chapter:1,label:'HIGH ROAD RUN',type:'platform',minutes:'4–7',reward:'TITLE • ROAD RUNNER',description:'Take the harder upper route and finish without falling back to the main road.'}),
  Object.freeze({id:'c1-swap-cache',chapter:1,label:'SWAP RESCUE',type:'explore',minutes:'3–5',reward:'OBJECT SWAP TOKEN',description:'Recover the stranded tournament transport with Object Swap before continuing down the road.'}),
  Object.freeze({id:'c2-three-in-a-row',chapter:2,label:'THREE IN A ROW',type:'combat',minutes:'6–10',reward:'TITLE • CROWD FAVORITE',description:'Win three short tournament bouts without leaving the combat flow.'}),
  Object.freeze({id:'c2-ring-master',chapter:2,label:'RING MASTER',type:'combat',minutes:'4–7',reward:'VICTORY EFFECT • GOLD RING',description:'Win a ring-out rules exhibition with an A rank or better.'}),
  Object.freeze({id:'c3-clean-entry',chapter:3,label:'CLEAN ENTRY',type:'investigation',minutes:'5–8',reward:'ARCHIVE • EAST SUPPORT',description:'Enter the underground facility after finding the complete evidence set above ground.'}),
  Object.freeze({id:'c3-no-false-leads',chapter:3,label:'NO FALSE LEADS',type:'investigation',minutes:'4–6',reward:'TITLE • CASE CLOSED',description:'Complete the incident reconstruction without a wrong ordering choice.'}),
  Object.freeze({id:'c4-squad-control',chapter:4,label:'SQUAD CONTROL',type:'party',minutes:'6–9',reward:'TITLE • TEAM CAPTAIN',description:'Win a three-ninja squad fight while Bark and Wade both remain standing.'}),
  Object.freeze({id:'c4-solo-summit',chapter:4,label:'SOLO SUMMIT',type:'survival',minutes:'6–10',reward:'ARCHIVE • MOUNTAIN WIND',description:'Finish the solo mountain stretch after the party splits.'})
]);

const DEFAULT_ADVENTURE=Object.freeze({version:1,completed:[],discovered:[],bestRanks:{},rewards:[]});
export function normalizeAdventureProgress(value={}){
  return{
    version:1,
    completed:unique(value?.completed).filter(id=>ADVENTURE_MISSIONS.some(m=>m.id===id)),
    discovered:unique(value?.discovered).filter(id=>ADVENTURE_MISSIONS.some(m=>m.id===id)),
    bestRanks:{...(value?.bestRanks||{})},
    rewards:unique(value?.rewards)
  };
}
export function loadAdventureProgress(storage=null){
  return normalizeAdventureProgress(readJson(ADVENTURE_KEY,DEFAULT_ADVENTURE,storage));
}
export function saveAdventureProgress(value,storage=null){
  const normalized=normalizeAdventureProgress(value);writeJson(ADVENTURE_KEY,normalized,storage);return normalized;
}
export function discoverAdventureMission(id,storage=null){
  const state=loadAdventureProgress(storage);state.discovered=unique([...state.discovered,id]);return saveAdventureProgress(state,storage);
}
export function completeAdventureMission(id,{rank='C',reward=''}={},storage=null){
  const state=loadAdventureProgress(storage),first=!state.completed.includes(id);
  state.discovered=unique([...state.discovered,id]);state.completed=unique([...state.completed,id]);
  const order={E:0,D:1,C:2,B:3,A:4,S:5},current=String(state.bestRanks[id]||'E').toUpperCase(),next=String(rank||'C').toUpperCase();
  if((order[next]??0)>(order[current]??0))state.bestRanks[id]=next;
  if(reward)state.rewards=unique([...state.rewards,reward]);
  saveAdventureProgress(state,storage);return{state,first,rank:state.bestRanks[id]||next};
}
export function adventureMissionsForChapter(chapter){
  return ADVENTURE_MISSIONS.filter(mission=>mission.chapter===Number(chapter));
}
export function renderCoreFunExtras({storage=null}={}){
  const build=currentRrvvfoBuild(storage),progress=loadAdventureProgress(storage);
  const buildCards=Object.values(RRVVFO_BUILDS).map(item=>`<button class="coreFunBuild ${item.id===build.id?'active':''}" data-core-build="${item.id}"><strong>${item.label}</strong><span>${item.description}</span><small>4 TECHNIQUES • ${item.passives.map(id=>RRVVFO_PASSIVES[id]?.label||id).join(' + ')}</small></button>`).join('');
  const missions=ADVENTURE_MISSIONS.map(mission=>`<article class="coreFunMission ${progress.completed.includes(mission.id)?'complete':''}"><small>CHAPTER ${mission.chapter} • ${mission.type.toUpperCase()} • ${mission.minutes} MIN</small><strong>${mission.label}</strong><p>${mission.description}</p><span>${progress.completed.includes(mission.id)?`COMPLETE • ${progress.bestRanks[mission.id]||'C'} RANK`:`REWARD • ${mission.reward}`}</span></article>`).join('');
  return`<section class="coreFunExtras"><header><small>CORE FUN OVERHAUL</small><h3>RRVVFO BUILD LAB</h3><p>Choose a playstyle. Story and Arena use the same saved build.</p></header><div class="coreFunBuilds">${buildCards}</div><h4>ADVENTURE MISSIONS</h4><p class="coreFunHint">Short optional missions exist to make you stay because you want to — never because Story progress requires them.</p><div class="coreFunMissions">${missions}</div></section>`;
}
