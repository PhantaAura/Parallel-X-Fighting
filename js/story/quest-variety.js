export const QUEST_VARIETY_VERSION=1;

export const CHAPTER2_EXHIBITION_SEQUENCE=Object.freeze(['KeyA','Space','KeyD','Space']);
export const CHAPTER3_INCIDENT_ORDER=Object.freeze([
  'STRANGE ENERGY APPEARED BENEATH THE ARENA',
  'SECURITY WAS REDIRECTED',
  'A FALSE WORKER ENTERED THE EAST SUPPORT',
  'THE RING-SUPPORT SYSTEM FAILED',
  'THE UNDERGROUND ROUTE OPENED'
]);
export const CHAPTER4_PARTY_FIELD_ACTIONS=Object.freeze([
  Object.freeze({id:'bark-support',role:'BARK',label:'STABILIZE THE DAMAGED PATH'}),
  Object.freeze({id:'wade-current',role:'WADE',label:'POWER THE OLD ECHO MECHANISM'}),
  Object.freeze({id:'rrvvfo-swap',role:'RRVVFO',label:'SWAP THE SUPPORT INTO PLACE'})
]);

function unique(values){return[...new Set(Array.isArray(values)?values.filter(Boolean):[])]}

export function createQuestVarietyState(chapter){
  if(chapter==='chapter1')return{version:QUEST_VARIETY_VERSION,runawayCart:{started:false,complete:false,attempts:0,rank:null},persistentChanges:[]};
  if(chapter==='chapter2')return{version:QUEST_VARIETY_VERSION,festivalExhibition:{started:false,complete:false,attempts:0,mistakes:0,rank:null},persistentChanges:[]};
  if(chapter==='chapter3')return{version:QUEST_VARIETY_VERSION,incidentSequence:[],incidentMistakes:0,reconstructionComplete:false,persistentChanges:[]};
  if(chapter==='chapter4')return{version:QUEST_VARIETY_VERSION,fieldActions:[],fieldRouteComplete:false,persistentChanges:[]};
  return{version:QUEST_VARIETY_VERSION,persistentChanges:[]};
}

export function normalizeQuestVarietyState(chapter,value={}){
  const base=createQuestVarietyState(chapter),source=value&&typeof value==='object'?value:{};
  const state={...base,...source,version:QUEST_VARIETY_VERSION,persistentChanges:unique(source.persistentChanges)};
  if(chapter==='chapter1')state.runawayCart={...base.runawayCart,...(source.runawayCart||{}),attempts:Math.max(0,Number(source.runawayCart?.attempts)||0),complete:Boolean(source.runawayCart?.complete)};
  if(chapter==='chapter2')state.festivalExhibition={...base.festivalExhibition,...(source.festivalExhibition||{}),attempts:Math.max(0,Number(source.festivalExhibition?.attempts)||0),mistakes:Math.max(0,Number(source.festivalExhibition?.mistakes)||0),complete:Boolean(source.festivalExhibition?.complete)};
  if(chapter==='chapter3'){
    const sequence=unique(source.incidentSequence).filter(item=>CHAPTER3_INCIDENT_ORDER.includes(item));
    let valid=true;for(let index=0;index<sequence.length;index++)if(sequence[index]!==CHAPTER3_INCIDENT_ORDER[index])valid=false;
    state.incidentSequence=valid?sequence:[];state.incidentMistakes=Math.max(0,Number(source.incidentMistakes)||0);state.reconstructionComplete=Boolean(source.reconstructionComplete||sequence.length===CHAPTER3_INCIDENT_ORDER.length);
  }
  if(chapter==='chapter4'){
    const known=new Set(CHAPTER4_PARTY_FIELD_ACTIONS.map(action=>action.id));
    state.fieldActions=unique(source.fieldActions).filter(id=>known.has(id));state.fieldRouteComplete=Boolean(source.fieldRouteComplete||state.fieldActions.length===CHAPTER4_PARTY_FIELD_ACTIONS.length);
  }
  return state;
}

export function exhibitionRank({mistakes=0,attempts=1}={}){
  if(mistakes<=0&&attempts<=1)return'TOURNAMENT SHOWSTOPPER';
  if(mistakes<=1)return'CROWD FAVORITE';
  return'ROUGH DEBUT';
}

export function runawayCartRank({attempts=1}={}){return attempts<=1?'PERFECT INTERCEPT':'SUPPLIES SAVED'}

export function nextIncidentStep(state){return CHAPTER3_INCIDENT_ORDER[state?.incidentSequence?.length||0]||null}
export function recordIncidentStep(state,value){
  const next=nextIncidentStep(state);
  if(!next)return{correct:true,complete:true,next:null};
  if(value!==next){state.incidentMistakes=Math.max(0,Number(state.incidentMistakes)||0)+1;return{correct:false,complete:false,next}};
  state.incidentSequence=[...(state.incidentSequence||[]),value];
  state.reconstructionComplete=state.incidentSequence.length===CHAPTER3_INCIDENT_ORDER.length;
  return{correct:true,complete:state.reconstructionComplete,next:nextIncidentStep(state)};
}

export function completePartyFieldAction(state,id){
  const known=new Set(CHAPTER4_PARTY_FIELD_ACTIONS.map(action=>action.id));
  if(known.has(id))state.fieldActions=unique([...(state.fieldActions||[]),id]);
  state.fieldRouteComplete=state.fieldActions.length===CHAPTER4_PARTY_FIELD_ACTIONS.length;
  if(state.fieldRouteComplete)state.persistentChanges=unique([...(state.persistentChanges||[]),'echo-cavern-route-repaired']);
  return state;
}
