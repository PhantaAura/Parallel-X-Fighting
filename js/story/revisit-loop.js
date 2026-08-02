import {normalizeConnectedWorldState,recordWorldVisit} from './connected-world.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {loadFieldSkillState} from './field-skills.js?v=29a4071-chapter3-sabotage-investigation-20260802';

export const REVISIT_LOOP_VERSION=1;
const unique=values=>[...new Set((Array.isArray(values)?values:[]).filter(Boolean))];

export const FAST_TRAVEL_NODES=Object.freeze({
  tournamentPlaza:Object.freeze({id:'tournamentPlaza',label:'TOURNAMENT PLAZA',region:'tournament',zone:'central',requires:'rrvvfo-02',entry:'rrvvfo-02'}),
  echoVillage:Object.freeze({id:'echoVillage',label:'ECHO VILLAGE',region:'echo',zone:'central',requires:'rrvvfo-04',entry:'rrvvfo-04'})
});

export const REVISIT_OPPORTUNITIES=Object.freeze({
  'c1-precision-cache':Object.freeze({id:'c1-precision-cache',chapter:1,label:'CLIFF PRECISION CACHE',region:'training',zone:'cliff',skill:'precisionSwap',requires:'rrvvfo-road',reward:'SWAP BATTERY TOKEN',unlock:'revisitSwapBattery',hint:'A tiny anchor on the old Cliff Trail was impossible to use before Precision Lock.'}),
  'c2-rooftop-challenger':Object.freeze({id:'c2-rooftop-challenger',chapter:2,label:'ROOFTOP CHALLENGER',region:'tournament',zone:'rooftops',requires:'rrvvfo-02',unlockRequirement:'flowCancelLearned',reward:'TITLE • ROOFTOP SCRAPPER',unlock:'revisitRooftopScrapper',hint:'Someone keeps training above Market Street after the tournament.'}),
  'c3-service-archive':Object.freeze({id:'c3-service-archive',chapter:3,label:'SEALED SERVICE ARCHIVE',region:'tournament',zone:'service',skill:'precisionSwap',requires:'rrvvfo-03',reward:'ARCHIVE • HOLLOW ROUTE NOTE',unlock:'revisitServiceArchive',hint:'The after-hours service route still has one sealed maintenance compartment.'}),
  'c4-shrine-resonance':Object.freeze({id:'c4-shrine-resonance',chapter:4,label:'OLD SHRINE RESONANCE',region:'echo',zone:'shrine',skill:'vibrationSense',requires:'rrvvfo-04',reward:'ECHO RESERVE TOKEN',unlock:'revisitEchoReserve',hint:'Vibration Sense reacts to something beneath the Old Shrine.'})
});

function completed(progress,id){return Boolean(progress?.completedMissions?.includes(id));}
function skillsFrom(value){return value?.mastered?value:loadFieldSkillState();}
export function revisitState(progress={}){const world=normalizeConnectedWorldState(progress.worldState,progress);return{claimed:unique(world.revisitRewards),fastTravel:unique(world.fastTravelNodes)};}
export function revisitOpportunityStatus(progress={},id,{fieldSkills=null}={}){
  const item=REVISIT_OPPORTUNITIES[id];if(!item)return'unknown';const state=revisitState(progress);if(state.claimed.includes(id))return'claimed';
  if(!completed(progress,item.requires))return'locked';const skills=skillsFrom(fieldSkills);if(item.skill&&!skills.mastered.includes(item.skill))return'locked';if(item.unlockRequirement&&!progress?.unlocks?.includes(item.unlockRequirement))return'locked';return'ready';
}
export function claimRevisitOpportunity(progress={},id,{fieldSkills=null}={}){
  const item=REVISIT_OPPORTUNITIES[id];if(!item||revisitOpportunityStatus(progress,id,{fieldSkills})!=='ready')return{progress,claimed:false,reward:item?.reward||''};
  const world=normalizeConnectedWorldState(progress.worldState,progress);world.revisitRewards=unique([...world.revisitRewards,id]);world.discoveredZones=unique([...world.discoveredZones,`${item.region}:${item.zone}`]);
  const unlocks=unique([...(progress.unlocks||[]),item.unlock]);return{progress:{...progress,unlocks,worldState:world},claimed:true,reward:item.reward};
}
export function fastTravelNodeAvailable(progress={},id){const node=FAST_TRAVEL_NODES[id];return Boolean(node&&completed(progress,node.requires));}
export function unlockFastTravelNode(progress={},id){const node=FAST_TRAVEL_NODES[id];if(!node||!fastTravelNodeAvailable(progress,id))return progress;const world=normalizeConnectedWorldState(progress.worldState,progress);world.fastTravelNodes=unique([...world.fastTravelNodes,id]);return{...progress,worldState:world};}
export function syncFastTravelNodes(progress={}){let next=progress;for(const id of Object.keys(FAST_TRAVEL_NODES))if(fastTravelNodeAvailable(next,id))next=unlockFastTravelNode(next,id);return next;}
export function fastTravelDestination(progress={},id){const node=FAST_TRAVEL_NODES[id],state=revisitState(syncFastTravelNodes(progress));if(!node||!state.fastTravel.includes(id))return null;return{...node};}
export function markFastTravelArrival(progress={},id){const node=fastTravelDestination(progress,id);return node?recordWorldVisit(syncFastTravelNodes(progress),node.region,node.zone,{entrance:`fast-travel:${id}`}):progress;}
export function renderRevisitJournal(progress={},options={}){
  const synced=syncFastTravelNodes(progress),state=revisitState(synced),skills=options.fieldSkills||loadFieldSkillState();
  const opportunities=Object.values(REVISIT_OPPORTUNITIES).filter(item=>completed(synced,item.requires));
  const cards=opportunities.map(item=>{const status=revisitOpportunityStatus(synced,item.id,{fieldSkills:skills});return`<article class="revisitCard ${status}"><small>${status==='claimed'?'DISCOVERED':status==='ready'?'NEW ROUTE AVAILABLE':'COME BACK LATER'}</small><strong>${item.label}</strong><span>${status==='claimed'?item.reward:item.hint}</span></article>`}).join('');
  const travel=Object.values(FAST_TRAVEL_NODES).filter(node=>state.fastTravel.includes(node.id)).map(node=>`<button type="button" data-fast-travel="${node.id}"><strong>${node.label}</strong><span>Return without starting a Chapter Replay.</span></button>`).join('');
  return `<section class="revisitJournal"><header><small>REVISIT LOOP</small><strong>OLD PLACES • NEW OPTIONS</strong><span>Later field skills can reopen routes you already know.</span></header><div class="revisitCards">${cards||'<p>Keep exploring. Revisit opportunities appear as Rrvvfo learns more.</p>'}</div>${travel?`<div class="revisitTravel"><small>FAST TRAVEL • DISCOVERED REGIONS</small>${travel}</div>`:''}</section>`;
}
