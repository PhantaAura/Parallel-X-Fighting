import {normalizeRpgPacingState} from './rpg-pacing.js?v=29a391-chapter4-ending-continuity-20260801';
import {normalizeQuestVarietyState} from './quest-variety.js?v=29a391-chapter4-ending-continuity-20260801';
export const CHAPTER3_MISSION_ID='rrvvfo-03';
export const CHAPTER3_STATE_VERSION=2;

export const CHAPTER3_REQUIRED_STEPS=Object.freeze([
  'opening',
  'medicalLead',
  'fighterNobodyRecorded',
  'bracketRecords',
  'lockedNightShift',
  'crackedRing',
  'ploukeBag',
  'strangeManWarningSeen',
  'medicalWorkerRevisited',
  'strangeManHatCollected',
  'strangeManLead',
  'lensTrail',
  'sageExplanation',
  'facilityEntered',
  'auxiliaryPower',
  'recordedAttacks',
  'sageSeparated',
  'dummyDefeated',
  'subjectRFile',
  'echoDefeated',
  'projectHollow',
  'teleporterFound',
  'doorClosing',
  'rockThrown',
  'objectSwap',
  'teleporterActivated',
  'remoteRegion',
  'shadowObjective',
  'chapterSaved'
]);

export const CHAPTER3_MANDATORY_STORIES=Object.freeze([
  Object.freeze({id:'fighterNobodyRecorded',title:'THE FIGHTER NOBODY RECORDED'}),
  Object.freeze({id:'lockedNightShift',title:'LOCKED ON THE NIGHT SHIFT'}),
  Object.freeze({id:'ploukeBag',title:'PLOUKE’S MISSING BAG'})
]);

export const CHAPTER3_EVIDENCE=Object.freeze([
  Object.freeze({id:'medicalTestimony',label:'Medical Testimony'}),
  Object.freeze({id:'copiedRecords',label:'Copied Fighter Records'}),
  Object.freeze({id:'ringCollector',label:'Hidden Ring Collector'}),
  Object.freeze({id:'falseBadge',label:'False Maintenance Badge'}),
  Object.freeze({id:'energyDetector',label:'Sage’s Energy Detector'}),
  Object.freeze({id:'medicalBadgeMismatch',label:'Repeated Medical Badge'})
]);

export const CHAPTER3_BRACKET_ORDER=Object.freeze([
  'HAILEY → PLOUKE',
  'RRVVFO → HAMUAL',
  'RRVVFO → DANIEL',
  'RRVVFO → WADE',
  'RRVVFO → PLOUKE'
]);

export const CHAPTER3_OPTIONAL_QUESTS=Object.freeze([
  Object.freeze({id:'unpaidSnacks',title:'PLOUKE’S UNPAID SNACKS',reward:'Tournament currency + Plouke color'}),
  Object.freeze({id:'oneLastMatch',title:'ONE LAST MATCH',reward:'Experience + practice opponent'}),
  Object.freeze({id:'poukiEquipment',title:'POUKI’S MISSING EQUIPMENT',reward:'Defensive accessory + lore'}),
  Object.freeze({id:'fakePloukes',title:'FAKE PLOUKES',reward:'Comedy costume + currency'}),
  Object.freeze({id:'prizeEnvelope',title:'THE MISSING PRIZE ENVELOPE',reward:'Vendor discount'}),
  Object.freeze({id:'finalAnnouncement',title:'THE ANNOUNCER’S FINAL ANNOUNCEMENT',reward:'Gallery audio + experience'}),
  Object.freeze({id:'lateFan',title:'THE FAN WHO STAYED TOO LONG',reward:'Tournament poster'}),
  Object.freeze({id:'cleanupEchoes',title:'CLEANUP ECHOES',reward:'Echo resistance bonus'}),
  Object.freeze({id:'medicalFollowup',title:'MEDICAL TENT FOLLOW-UP',reward:'Improved healing'}),
  Object.freeze({id:'controlledFlame',title:'CONTROLLED FLAME FOLLOW-UP',reward:'Flame Focus'})
]);

function blankOptionalState(){
  return Object.fromEntries(CHAPTER3_OPTIONAL_QUESTS.map(quest=>[
    quest.id,
    {started:false,complete:false,progress:0,rewardClaimed:false}
  ]));
}

export function freshChapter3State(){
  return{
    version:CHAPTER3_STATE_VERSION,
    requiredCompleted:[],
    evidence:[],
    hubState:1,
    location:'after-hours-hub',
    pacing:normalizeRpgPacingState('chapter3'),
    variety:normalizeQuestVarietyState('chapter3'),
    medicalSort:[],
    recordingStep:0,
    mediaTerminals:[],
    bracketSequence:[],
    nightRouteIndex:0,
    staffShortcut:false,
    ringCollectors:[],
    bagLocations:[],
    lensTrailIndex:0,
    detector:false,
    strangeManWarningSeen:false,
    medicalWorkerRevisited:false,
    strangeManHatCollected:false,
    strangeManHatLensInspected:false,
    strangeManLeadFound:false,
    keyItems:[],
    optional:blankOptionalState(),
    optionalProgress:{
      speakers:[],
      autographs:[],
      cleanupFragments:[],
      fakePloukes:[],
      flameStability:0
    },
    underground:{
      conduits:[],
      recordedPatterns:[],
      separated:false,
      dummyPattern:'hamual',
      dummyDefeated:false,
      subjectRRead:false,
      echoDefeated:false,
      projectHollowRead:false,
      teleporterFound:false,
      doorAttempts:0,
      rockThrown:false,
      objectSwapComplete:false,
      teleporterActivated:false
    },
    rewards:{
      echoResistance:false,
      healingUpgrade:false,
      flameFocus:false,
      galleryRecording:false,
      staffShortcut:false
    },
    chapterComplete:false
  };
}

function uniqueKnown(values,known){
  const allowed=new Set(known);
  return[...new Set(Array.isArray(values)?values:[])].filter(value=>allowed.has(value));
}

export function normalizeChapter3State(value={}){
  const fallback=freshChapter3State();
  const optional={...fallback.optional};
  for(const quest of CHAPTER3_OPTIONAL_QUESTS){
    optional[quest.id]={
      ...fallback.optional[quest.id],
      ...(value?.optional?.[quest.id]||{})
    };
  }
  const requiredCompleted=uniqueKnown(value.requiredCompleted,CHAPTER3_REQUIRED_STEPS);
  const afterStrangeManIndex=CHAPTER3_REQUIRED_STEPS.indexOf('lensTrail');
  const passedInsertionPoint=requiredCompleted.some(id=>CHAPTER3_REQUIRED_STEPS.indexOf(id)>=afterStrangeManIndex);
  let strangeManWarningSeen=Boolean(value.strangeManWarningSeen||requiredCompleted.includes('strangeManWarningSeen'));
  let medicalWorkerRevisited=Boolean(value.medicalWorkerRevisited||requiredCompleted.includes('medicalWorkerRevisited'));
  let strangeManHatCollected=Boolean(value.strangeManHatCollected||requiredCompleted.includes('strangeManHatCollected'));
  let strangeManHatLensInspected=Boolean(value.strangeManHatLensInspected);
  let strangeManLeadFound=Boolean(value.strangeManLeadFound||requiredCompleted.includes('strangeManLead'));
  let keyItems=uniqueKnown(value.keyItems,['strange-mans-hat']);

  // Migration safety: saves already beyond this insertion point cannot be sent
  // backward into the tournament hub or they would lose their facility route.
  if(passedInsertionPoint){
    strangeManWarningSeen=true;
    medicalWorkerRevisited=true;
    strangeManHatCollected=true;
    strangeManLeadFound=true;
    keyItems=[...new Set([...keyItems,'strange-mans-hat'])];
  }
  if(strangeManHatLensInspected)strangeManHatCollected=true;
  if(strangeManLeadFound)strangeManHatCollected=true;
  if(strangeManHatCollected)medicalWorkerRevisited=true;
  if(medicalWorkerRevisited)strangeManWarningSeen=true;
  for(const [flag,step] of [
    [strangeManWarningSeen,'strangeManWarningSeen'],
    [medicalWorkerRevisited,'medicalWorkerRevisited'],
    [strangeManHatCollected,'strangeManHatCollected'],
    [strangeManLeadFound,'strangeManLead']
  ])if(flag&&!requiredCompleted.includes(step))requiredCompleted.push(step);
  requiredCompleted.sort((a,b)=>CHAPTER3_REQUIRED_STEPS.indexOf(a)-CHAPTER3_REQUIRED_STEPS.indexOf(b));
  if(strangeManHatCollected&&!keyItems.includes('strange-mans-hat'))keyItems.push('strange-mans-hat');

  return{
    ...fallback,
    ...value,
    version:CHAPTER3_STATE_VERSION,
    requiredCompleted,
    pacing:normalizeRpgPacingState('chapter3',value.pacing),
    variety:normalizeQuestVarietyState('chapter3',value.variety),
    evidence:uniqueKnown(value.evidence,CHAPTER3_EVIDENCE.map(entry=>entry.id)),
    medicalSort:uniqueKnown(value.medicalSort,['hamual-belt','daniel-wrap','glove']),
    mediaTerminals:uniqueKnown(value.mediaTerminals,['public','damaged-a','damaged-b','private','restored']),
    bracketSequence:Array.isArray(value.bracketSequence)?value.bracketSequence.filter(entry=>CHAPTER3_BRACKET_ORDER.includes(entry)):[],
    ringCollectors:uniqueKnown(value.ringCollectors,['north-support','west-support','clash-support']),
    bagLocations:uniqueKnown(value.bagLocations,['costume','lost-found','vendor','cart','impersonators']),
    strangeManWarningSeen,
    medicalWorkerRevisited,
    strangeManHatCollected,
    strangeManHatLensInspected,
    strangeManLeadFound,
    keyItems,
    optional,
    optionalProgress:{
      ...fallback.optionalProgress,
      ...(value.optionalProgress||{}),
      speakers:uniqueKnown(value?.optionalProgress?.speakers,['registration','vendor','arena']),
      autographs:uniqueKnown(value?.optionalProgress?.autographs,['wade','bark','pouki','plouke']),
      cleanupFragments:uniqueKnown(value?.optionalProgress?.cleanupFragments,['fragment-a','fragment-b','fragment-c']),
      fakePloukes:uniqueKnown(value?.optionalProgress?.fakePloukes,['fan','debtor','confused'])
    },
    underground:{
      ...fallback.underground,
      ...(value.underground||{}),
      conduits:uniqueKnown(value?.underground?.conduits,['heat','security','records']),
      recordedPatterns:uniqueKnown(value?.underground?.recordedPatterns,['wade','bark','pouki','rrvvfo','plouke'])
    },
    rewards:{...fallback.rewards,...(value.rewards||{})}
  };
}

export function markChapter3Required(state,id){
  if(!CHAPTER3_REQUIRED_STEPS.includes(id))return state;
  if(!state.requiredCompleted.includes(id))state.requiredCompleted.push(id);
  return state;
}

export function chapter3StepComplete(state,id){
  return Boolean(state?.requiredCompleted?.includes(id));
}

export function chapter3RequiredCount(state){
  const completed=new Set(state?.requiredCompleted||[]);
  return CHAPTER3_REQUIRED_STEPS.filter(id=>completed.has(id)).length;
}

export function chapter3Complete(state){
  const completed=new Set(state?.requiredCompleted||[]);
  return CHAPTER3_REQUIRED_STEPS.every(id=>completed.has(id));
}

export function chapter3NextRequired(state){
  const completed=new Set(state?.requiredCompleted||[]);
  return CHAPTER3_REQUIRED_STEPS.find(id=>!completed.has(id))||null;
}

export function chapter3MandatorySummary(state){
  return CHAPTER3_MANDATORY_STORIES.map(story=>({
    ...story,
    complete:chapter3StepComplete(state,story.id)
  }));
}

export function chapter3OptionalSummary(state){
  return CHAPTER3_OPTIONAL_QUESTS.map(quest=>({
    ...quest,
    ...state?.optional?.[quest.id]
  }));
}

export function chapter3EvidenceSummary(state){
  const found=new Set(state?.evidence||[]);
  return CHAPTER3_EVIDENCE.map(entry=>({...entry,found:found.has(entry.id)}));
}

export function chapter3CompletionPercent(state){
  return Math.round(chapter3RequiredCount(state)/CHAPTER3_REQUIRED_STEPS.length*100);
}
