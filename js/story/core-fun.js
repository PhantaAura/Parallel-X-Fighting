import {storyTechniqueAvailable} from './field-skills.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
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
    promise:'Learn Rrvvfo by moving through the world, not by reading a tutorial.',
    playerTitle:'THE ROAD OPENS UP',playerTagline:'MOVE • JUMP • FIND YOUR OWN ROUTE',playerHint:'Traversal is the challenge here. Look for high roads, shortcuts, and Object Swap opportunities.'
  }),
  2:Object.freeze({
    id:'tournament-marathon',
    label:'TOURNAMENT MARATHON',
    primary:'Back-to-back combat + special match rules',
    secondary:['Ring-outs','Optional sparring','Festival downtime'],
    promise:'If you love fighting, this is the chapter that keeps handing you another match.',
    playerTitle:'ENTER THE BRACKET',playerTagline:'FIGHT • ADAPT • KEEP THE STREAK ALIVE',playerHint:'Opponents have different habits. Read the matchup instead of fighting everyone the same way.'
  }),
  3:Object.freeze({
    id:'investigation-infiltration',
    label:'INVESTIGATION & INFILTRATION',
    primary:'Observe + deduce + enter restricted spaces',
    secondary:['Evidence reconstruction','Alternate entries','Combat when the investigation goes wrong'],
    promise:'Progress comes from noticing what is wrong, not only from beating whoever is nearby.',
    playerTitle:'SOMETHING DOESN’T ADD UP',playerTagline:'OBSERVE • QUESTION • RECONSTRUCT',playerHint:'The fastest route is not always the right route. Pay attention to what changed after the tournament.'
  }),
  4:Object.freeze({
    id:'party-journey',
    label:'PARTY JOURNEY',
    primary:'3-person squad combat + village defense',
    secondary:['Team field actions','Vibration Sense','Solo mountain survival'],
    promise:'Bark and Wade materially change how encounters play — then the mountain takes them away.',
    playerTitle:'THREE NINJAS, ONE JOURNEY',playerTagline:'FIGHT AS A TEAM • THEN SURVIVE ALONE',playerHint:'Use Bark and Wade while you have them. The mountain will eventually take that safety away.'
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

export const ENEMY_ARCHETYPE_ICONS=Object.freeze({rushdown:'➜',guard:'◆',ranged:'◎',heavy:'■',trickster:'◇',support:'✚'});
export function enemyArchetypeIcon(id='rushdown'){return ENEMY_ARCHETYPE_ICONS[id]||ENEMY_ARCHETYPE_ICONS.rushdown}
export function enemyArchetypeShape(id='rushdown'){
  return ({
    rushdown:{width:1,height:1,head:1},guard:{width:1.18,height:.96,head:1.02},ranged:{width:.88,height:1.04,head:.96},
    heavy:{width:1.38,height:1.08,head:1.14},trickster:{width:.74,height:1.10,head:.90},support:{width:.96,height:1.02,head:1.08}
  })[id]||{width:1,height:1,head:1};
}

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
  fireFocus:Object.freeze({id:'fireFocus',label:'FIRE FOCUS',description:'Fire techniques recover 15% faster. Future fire techniques inherit the bonus.'}),
  pursuitBattery:Object.freeze({id:'pursuitBattery',label:'PURSUIT BATTERY',description:'Pursuit finisher restores 7 Energy.'}),
  swapEconomy:Object.freeze({id:'swapEconomy',label:'SWAP ECONOMY',description:'Object Swap costs 5 less Energy.'})
});

const DEFAULT_CUSTOM_BUILD=Object.freeze({
  techniques:['fireBlast','shotsOfAgony','objectSwap','lensOfTruth'],
  passives:['hotStart','parrySpark']
});
function validUnique(values,table,count,fallback){
  const selected=unique(values).filter(id=>table[id]).slice(0,count);
  for(const id of fallback){if(selected.length>=count)break;if(table[id]&&!selected.includes(id))selected.push(id)}
  return selected.slice(0,count);
}
export function normalizeRrvvfoBuild(value={}){
  const requested=String(value?.id||'balanced');
  const id=requested==='custom'||RRVVFO_BUILDS[requested]?requested:'balanced';
  return{
    id,changedAt:Number(value?.changedAt)||0,
    custom:{
      techniques:validUnique(value?.custom?.techniques,RRVVFO_TECHNIQUES,4,DEFAULT_CUSTOM_BUILD.techniques),
      passives:validUnique(value?.custom?.passives,RRVVFO_PASSIVES,2,DEFAULT_CUSTOM_BUILD.passives)
    }
  };
}
export function loadRrvvfoBuild(storage=null){
  return normalizeRrvvfoBuild(readJson(BUILD_KEY,{id:'balanced',changedAt:0,custom:DEFAULT_CUSTOM_BUILD},storage));
}
export function saveRrvvfoBuild(id,storage=null){
  const previous=loadRrvvfoBuild(storage),normalized=normalizeRrvvfoBuild({...previous,id,changedAt:Date.now()});
  writeJson(BUILD_KEY,normalized,storage);return normalized;
}
export function saveRrvvfoCustomBuild({techniques=[],passives=[]}={},storage=null){
  const previous=loadRrvvfoBuild(storage),normalized=normalizeRrvvfoBuild({
    ...previous,id:'custom',changedAt:Date.now(),custom:{techniques,passives}
  });
  writeJson(BUILD_KEY,normalized,storage);return normalized;
}
export function currentRrvvfoBuild(storage=null){
  const state=loadRrvvfoBuild(storage);
  if(state.id==='custom')return{id:'custom',label:'CUSTOM',description:'Your own four-technique, two-passive loadout.',techniques:[...state.custom.techniques],passives:[...state.custom.passives],custom:true};
  return RRVVFO_BUILDS[state.id]||RRVVFO_BUILDS.balanced;
}
export function storySafeRrvvfoBuild(build=currentRrvvfoBuild(),{chapter=1,progress={}}={}){
  const allowed=Object.keys(RRVVFO_TECHNIQUES).filter(id=>storyTechniqueAvailable(id,{chapter,progress}));
  const selected=unique(build?.techniques).filter(id=>allowed.includes(id));
  for(const id of allowed){if(selected.length>=4)break;if(!selected.includes(id))selected.push(id)}
  return{...build,techniques:selected.slice(0,4),storySafe:true};
}

export function buildHasPassive(buildOrId,passive){
  const build=typeof buildOrId==='string'?(buildOrId==='custom'?currentRrvvfoBuild():RRVVFO_BUILDS[buildOrId]):buildOrId;
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

export function rrvvfoBuildSummary(storage=null){
  const build=currentRrvvfoBuild(storage);
  return `${build.label} • ${build.techniques.map(id=>RRVVFO_TECHNIQUES[id]?.label||id).join(' / ')} • ${build.passives.map(id=>RRVVFO_PASSIVES[id]?.label||id).join(' + ')}`;
}
function customSlotOptions(table,selected,{allowedIds=null}={}){
  const allowed=allowedIds?new Set(allowedIds):null;
  return Object.values(table).filter(item=>!allowed||allowed.has(item.id)).map(item=>`<option value="${item.id}" ${item.id===selected?'selected':''}>${item.label}</option>`).join('');
}
export function renderRrvvfoBuildLab({storage=null,locked=false,lockReason='BUILD LOCKED DURING THIS SEQUENCE',storyChapter=0,storyProgress={}}={}){
  const state=loadRrvvfoBuild(storage),rawActive=currentRrvvfoBuild(storage),storyMode=Number(storyChapter)>0;
  const resolve=item=>storyMode?storySafeRrvvfoBuild(item,{chapter:storyChapter,progress:storyProgress}):item;
  const active=resolve(rawActive),allowedIds=storyMode?Object.keys(RRVVFO_TECHNIQUES).filter(id=>storyTechniqueAvailable(id,{chapter:storyChapter,progress:storyProgress})):Object.keys(RRVVFO_TECHNIQUES);
  const customResolved=resolve({id:'custom',label:'CUSTOM',description:'Your own four-technique, two-passive loadout.',techniques:state.custom.techniques,passives:state.custom.passives,custom:true});
  const cards=[...Object.values(RRVVFO_BUILDS),{id:'custom',label:'CUSTOM',description:'Pick four available techniques and two passives.',techniques:state.custom.techniques,passives:state.custom.passives}]
    .map(raw=>{const item=resolve(raw);return`<button type="button" class="coreFunBuild ${raw.id===state.id?'active':''}" data-core-build="${raw.id}" ${locked?'disabled':''}><strong>${raw.label}</strong><span>${raw.description}</span><small>${item.techniques.map(id=>RRVVFO_TECHNIQUES[id]?.label||id).join(' • ')}<br>${raw.passives.map(id=>RRVVFO_PASSIVES[id]?.label||id).join(' + ')}</small></button>`}).join('');
  const tech=customResolved.techniques,passive=state.custom.passives;
  const future=storyMode&&!storyTechniqueAvailable('shotsOfAgony',{chapter:storyChapter,progress:storyProgress})?`<aside class="futureTechnique"><b>?</b><span><small>FUTURE COMBAT TECHNIQUE</small><strong>UNKNOWN TECHNIQUE</strong><p>Rrvvfo has not invented this yet. Stronger enemies may eventually force a new answer.</p></span></aside>`:'';
  return `<section class="rrvvfoBuildLab ${locked?'locked':''}" data-build-lab>
    <header><small>RRVVFO LOADOUT</small><h3>BUILD LAB</h3><p>${locked?lockReason:'Change builds while exploring. Story-required field techniques temporarily override your slots when needed.'}</p></header>
    <div class="coreFunBuilds">${cards}</div>
    ${future}
    <section class="customBuildEditor ${state.id==='custom'?'active':''}" data-custom-build-editor>
      <header><small>CUSTOM BUILD</small><strong>4 TECHNIQUES + 2 PASSIVES</strong></header>
      <div class="customBuildSlots">
        ${tech.map((id,index)=>`<label>TECHNIQUE ${index+1}<select data-custom-tech="${index}" ${locked?'disabled':''}>${customSlotOptions(RRVVFO_TECHNIQUES,id,{allowedIds})}</select></label>`).join('')}
        ${passive.map((id,index)=>`<label>PASSIVE ${index+1}<select data-custom-passive="${index}" ${locked?'disabled':''}>${customSlotOptions(RRVVFO_PASSIVES,id)}</select></label>`).join('')}
      </div>
      <button type="button" class="primary" data-save-custom-build ${locked?'disabled':''}>EQUIP CUSTOM BUILD</button>
      <p class="coreFunHint">Duplicate picks are automatically replaced. Story-locked techniques cannot be equipped early.</p>
    </section>
    <footer><small>CURRENT</small><strong data-build-summary>${active.label}</strong><span>${active.techniques.map(id=>RRVVFO_TECHNIQUES[id]?.label||id).join(' • ')}</span></footer>
  </section>`;
}
export function bindRrvvfoBuildLab(root,{storage=null,locked=false,onChange=()=>{},storyChapter=0,storyProgress={}}={}){
  if(!root)return()=>{};
  const rerender=()=>{root.innerHTML=renderRrvvfoBuildLab({storage,locked,storyChapter,storyProgress});bindRrvvfoBuildLab(root,{storage,locked,onChange,storyChapter,storyProgress})};
  const changed=()=>{const build=currentRrvvfoBuild(storage),resolved=storyChapter?storySafeRrvvfoBuild(build,{chapter:storyChapter,progress:storyProgress}):build;onChange(resolved);rerender()};
  root.querySelectorAll('[data-core-build]').forEach(button=>button.addEventListener('click',()=>{
    if(locked)return;saveRrvvfoBuild(button.dataset.coreBuild,storage);changed();
  }));
  root.querySelector('[data-save-custom-build]')?.addEventListener('click',()=>{
    if(locked)return;
    const techniques=[...root.querySelectorAll('[data-custom-tech]')].sort((a,b)=>Number(a.dataset.customTech)-Number(b.dataset.customTech)).map(select=>select.value);
    const passives=[...root.querySelectorAll('[data-custom-passive]')].sort((a,b)=>Number(a.dataset.customPassive)-Number(b.dataset.customPassive)).map(select=>select.value);
    saveRrvvfoCustomBuild({techniques,passives},storage);changed();
  });
  return rerender;
}
export function openRrvvfoBuildLab({storage=null,locked=false,lockReason='',onChange=()=>{},onClose=()=>{},storyChapter=0,storyProgress={}}={}){
  if(typeof document==='undefined')return null;
  document.querySelector('[data-story-build-modal]')?.remove();
  const modal=document.createElement('div');modal.className='storyBuildModal';modal.dataset.storyBuildModal='';modal.innerHTML=`<article><button type="button" class="storyBuildClose" data-story-build-close aria-label="Close Build Lab">×</button><div data-story-build-body>${renderRrvvfoBuildLab({storage,locked,lockReason,storyChapter,storyProgress})}</div></article>`;
  document.body.appendChild(modal);const body=modal.querySelector('[data-story-build-body]');bindRrvvfoBuildLab(body,{storage,locked,onChange,storyChapter,storyProgress});
  const close=()=>{modal.remove();onClose()};modal.querySelector('[data-story-build-close]')?.addEventListener('click',close);return{modal,close};
}

export const ADVENTURE_MISSIONS=Object.freeze([
  Object.freeze({id:'c1-high-road',chapter:1,label:'HIGH ROAD RUN',type:'platform',grading:'rank',minutes:'4–7',reward:'TITLE • ROAD RUNNER',description:'Take the harder upper route and finish without falling back to the main road.'}),
  Object.freeze({id:'c1-swap-cache',chapter:1,label:'SWAP RESCUE',type:'explore',grading:'complete',minutes:'3–5',reward:'OBJECT SWAP TOKEN',description:'Recover the stranded tournament transport with Object Swap before continuing down the road.'}),
  Object.freeze({id:'c2-three-in-a-row',chapter:2,label:'THREE IN A ROW',type:'combat',grading:'streak',minutes:'6–10',reward:'TITLE • CROWD FAVORITE',description:'Win three short tournament bouts without leaving the combat flow.'}),
  Object.freeze({id:'c2-ring-master',chapter:2,label:'RING MASTER',type:'combat',grading:'rank',minutes:'4–7',reward:'VICTORY EFFECT • GOLD RING',description:'Win a ring-out rules exhibition with an A rank or better.'}),
  Object.freeze({id:'c3-clean-entry',chapter:3,label:'CLEAN ENTRY',type:'investigation',grading:'quality',minutes:'5–8',reward:'ARCHIVE • EAST SUPPORT',description:'Enter the underground facility after finding the complete evidence set above ground.'}),
  Object.freeze({id:'c3-no-false-leads',chapter:3,label:'NO FALSE LEADS',type:'investigation',grading:'perfect',minutes:'4–6',reward:'TITLE • CASE CLOSED',description:'Complete the incident reconstruction without a wrong ordering choice.'}),
  Object.freeze({id:'c4-squad-control',chapter:4,label:'SQUAD CONTROL',type:'party',grading:'quality',minutes:'6–9',reward:'TITLE • TEAM CAPTAIN',description:'Win a three-ninja squad fight while Bark and Wade both remain standing.'}),
  Object.freeze({id:'c4-solo-summit',chapter:4,label:'SOLO SUMMIT',type:'survival',grading:'complete',minutes:'6–10',reward:'ARCHIVE • MOUNTAIN WIND',description:'Finish the solo mountain stretch after the party splits.'})
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
export function adventureMissionResultLabel(mission,state){
  if(!mission||!state?.completed?.includes?.(mission.id))return'';
  const rank=String(state.bestRanks?.[mission.id]||'C').toUpperCase();
  if(mission.grading==='rank')return`${rank} RANK`;
  if(mission.grading==='streak')return'STREAK CLEAR';
  if(mission.grading==='perfect')return rank==='S'?'PERFECT':'COMPLETE';
  if(mission.grading==='quality')return rank==='S'?'PERFECT':rank==='A'?'CLEAN':'COMPLETE';
  return'COMPLETE';
}
export function renderCoreFunExtras({storage=null}={}){
  const progress=loadAdventureProgress(storage);
  const missions=ADVENTURE_MISSIONS.map(mission=>`<article class="coreFunMission ${progress.completed.includes(mission.id)?'complete':''}"><small>CHAPTER ${mission.chapter} • ${mission.type.toUpperCase()} • ${mission.minutes} MIN</small><strong>${mission.label}</strong><p>${mission.description}</p><span>${progress.completed.includes(mission.id)?`COMPLETE • ${adventureMissionResultLabel(mission,progress)}`:`REWARD • ${mission.reward}`}</span></article>`).join('');
  return`<section class="coreFunExtras"><div data-extras-build-lab>${renderRrvvfoBuildLab({storage})}</div><h4>ADVENTURE MISSIONS</h4><p class="coreFunHint">Short optional missions exist to make you stay because you want to — never because Story progress requires them.</p><div class="coreFunMissions">${missions}</div></section>`;
}
