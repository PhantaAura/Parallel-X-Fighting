export const RPG_PACING_STATE_VERSION=1;

export const RPG_PACING_PHASES=Object.freeze(['arrival','development','crisis','aftermath','departure']);

export const RPG_PACING_PROFILES=Object.freeze({
  road:Object.freeze({
    label:'BEGINNING THE JOURNEY',
    orientation:Object.freeze({districts:1,conversations:0,requiredDistricts:[]}),
    phaseLabels:Object.freeze({arrival:'TRAINING GROUNDS',development:'TOURNAMENT ROAD',crisis:'ROADSIDE TROUBLE',aftermath:'ROAD CLEARED',departure:'TOURNAMENT OUTSKIRTS'})
  }),
  chapter2:Object.freeze({
    label:'TOURNAMENT DAY',
    orientation:Object.freeze({districts:3,conversations:2,requiredDistricts:['central']}),
    phaseLabels:Object.freeze({arrival:'FESTIVAL ARRIVAL',development:'TOURNAMENT PREPARATION',crisis:'OFFICIAL BRACKET',aftermath:'BETWEEN ROUNDS',departure:'TOURNAMENT AFTERMATH'})
  }),
  chapter3:Object.freeze({
    label:'SOMETHING UNDER THE RING',
    orientation:Object.freeze({districts:2,conversations:0,requiredDistricts:['arena']}),
    phaseLabels:Object.freeze({arrival:'AFTER-HOURS RETURN',development:'INVESTIGATION',crisis:'FACILITY LOCKDOWN',aftermath:'PROJECT HOLLOW DISCOVERED',departure:'REMOTE REGION'})
  }),
  chapter4:Object.freeze({
    label:'ECHO REGION',
    orientation:Object.freeze({districts:0,conversations:0,interactions:2,requiredInteractions:['resonance-wall','water-channel']}),
    phaseLabels:Object.freeze({arrival:'LOWER ECHO REGION',development:'ECHO VILLAGE',crisis:'VILLAGE UNDER ATTACK',aftermath:'VILLAGE RECOVERY',departure:'SOLO MOUNTAIN ROUTE'})
  })
});

function unique(values){return[...new Set(Array.isArray(values)?values.filter(Boolean):[])]}
function profileFor(chapterId){return RPG_PACING_PROFILES[chapterId]||RPG_PACING_PROFILES.road}

export function createRpgPacingState(chapterId){
  return{
    version:RPG_PACING_STATE_VERSION,
    chapterId,
    phase:'arrival',
    visitedDistricts:[],
    conversations:[],
    interactions:[],
    aftermaths:[],
    orientationComplete:false,
    wave:0,
    transitions:0
  };
}

export function normalizeRpgPacingState(chapterId,value={}){
  const base=createRpgPacingState(chapterId),source=value&&typeof value==='object'?value:{};
  const state={
    ...base,
    ...source,
    version:RPG_PACING_STATE_VERSION,
    chapterId,
    phase:RPG_PACING_PHASES.includes(source.phase)?source.phase:'arrival',
    visitedDistricts:unique(source.visitedDistricts),
    conversations:unique(source.conversations),
    interactions:unique(source.interactions),
    aftermaths:unique(source.aftermaths),
    wave:Math.max(0,Math.min(4,Number(source.wave)||0)),
    transitions:Math.max(0,Number(source.transitions)||0)
  };
  state.orientationComplete=Boolean(source.orientationComplete||pacingOrientationComplete(chapterId,state));
  if(state.orientationComplete)state.wave=Math.max(1,state.wave);
  return state;
}

export function recordPacingVisit(state,id){if(id&&!state.visitedDistricts.includes(id))state.visitedDistricts.push(id);return state}
export function recordPacingConversation(state,id){if(id&&!state.conversations.includes(id))state.conversations.push(id);return state}
export function recordPacingInteraction(state,id){if(id&&!state.interactions.includes(id))state.interactions.push(id);return state}
export function recordPacingAftermath(state,id){if(id&&!state.aftermaths.includes(id))state.aftermaths.push(id);return state}

export function pacingOrientationProgress(chapterId,state){
  const requirements=profileFor(chapterId).orientation||{},visited=new Set(state?.visitedDistricts||[]),talked=new Set(state?.conversations||[]),interacted=new Set(state?.interactions||[]);
  const requiredDistricts=requirements.requiredDistricts||[],requiredInteractions=requirements.requiredInteractions||[];
  const districts=Math.min(requirements.districts||0,visited.size),conversations=Math.min(requirements.conversations||0,talked.size),interactions=Math.min(requirements.interactions||0,interacted.size);
  const requiredDistrictsMet=requiredDistricts.every(id=>visited.has(id));
  const requiredInteractionsMet=requiredInteractions.every(id=>interacted.has(id));
  return{
    districts,
    conversations,
    interactions,
    districtTarget:requirements.districts||0,
    conversationTarget:requirements.conversations||0,
    interactionTarget:requirements.interactions||0,
    requiredDistrictsMet,
    requiredInteractionsMet,
    complete:districts>=(requirements.districts||0)&&conversations>=(requirements.conversations||0)&&interactions>=(requirements.interactions||0)&&requiredDistrictsMet&&requiredInteractionsMet
  };
}

export function pacingOrientationComplete(chapterId,state){return pacingOrientationProgress(chapterId,state).complete}

export function completePacingOrientation(chapterId,state){
  if(!pacingOrientationComplete(chapterId,state))return false;
  state.orientationComplete=true;state.wave=Math.max(1,state.wave);return true;
}

export function setRpgPacingPhase(state,phase,{wave=null}={}){
  if(!RPG_PACING_PHASES.includes(phase))return state;
  if(state.phase!==phase){state.phase=phase;state.transitions=(Number(state.transitions)||0)+1}
  if(Number.isFinite(wave))state.wave=Math.max(state.wave,Math.max(0,Math.min(4,wave)));
  return state;
}

export function rpgPacingLabel(chapterId,state){
  const profile=profileFor(chapterId),phase=RPG_PACING_PHASES.includes(state?.phase)?state.phase:'arrival';
  return profile.phaseLabels?.[phase]||profile.label;
}

export function rpgPacingQuestWave(state){return Math.max(0,Math.min(4,Number(state?.wave)||0))}

export function rpgPacingStatusText(chapterId,state){
  const progress=pacingOrientationProgress(chapterId,state),parts=[];
  if(progress.districtTarget)parts.push(`${progress.districts} / ${progress.districtTarget} areas visited`);
  if(progress.conversationTarget)parts.push(`${progress.conversations} / ${progress.conversationTarget} people met`);
  if(progress.interactionTarget)parts.push(`${progress.interactions} / ${progress.interactionTarget} landmarks understood`);
  return parts.join(' • ');
}
