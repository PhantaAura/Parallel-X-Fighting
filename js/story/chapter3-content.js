import {normalizeRpgPacingState} from './rpg-pacing.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {normalizeQuestVarietyState} from './quest-variety.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
export const CHAPTER3_MISSION_ID='rrvvfo-03';
export const CHAPTER3_STATE_VERSION=4;

// 2.9A.40.7.1 rewrites Chapter 3 around the tournament sabotage rather than
// Sage/Plouke suspicion. These checkpoints are intentionally explicit so
// reload/replay can resume every major investigation and escape beat safely.
export const CHAPTER3_REQUIRED_STEPS=Object.freeze([
  'opening',
  'sabotageInvestigationStarted',
  'ringEvidence1Found',
  'ringEvidence2Found',
  'ringEvidence3Found',
  'sabotageConfirmed',
  'workerQuestioned',
  'securityQuestioned',
  'medicalWorkerFirstConversationComplete',
  'strangeManWarningSeen',
  'medicalWorkerRevisited',
  'strangeManHatCollected',
  'maintenanceInvestigationStarted',
  'hiddenInfrastructureFound',
  'sageTrailFound',
  'findSageObjectiveStarted',
  'projectHollowFacilityEntered',
  'tournamentDataDiscovered',
  'projectHollowNameRevealed',
  'realSageFound',
  'facilityLockdownStarted',
  'teleporterEscapeStarted',
  'sageBlueCloneCreated',
  'rrvvfoEnteredTeleporterRoom',
  'blueCloneIdentityRevealed',
  'blueCloneLessonSeen',
  'blueCloneTechniqueFoundationLearned',
  'teleporterActivated',
  'blueCloneDisappeared',
  'rrvvfoTeleportedToEchoRegion',
  'rrvvfoUnconscious',
  'echoOperationTimeSkipStarted',
  'chapterSaved'
]);

export const CHAPTER3_MANDATORY_STORIES=Object.freeze([
  Object.freeze({id:'sabotageConfirmed',title:'WHO SABOTAGED THE TOURNAMENT?'}),
  Object.freeze({id:'strangeManHatCollected',title:'THE PEOPLE AREN’T THE REAL PEOPLE'}),
  Object.freeze({id:'projectHollowNameRevealed',title:'BENEATH THE TOURNAMENT'})
]);

export const CHAPTER3_EVIDENCE=Object.freeze([
  Object.freeze({id:'weakenedSupport',label:'Deliberately Weakened Ring Support'}),
  Object.freeze({id:'unregisteredComponent',label:'Unregistered Tournament Component'}),
  Object.freeze({id:'maintenanceAccess',label:'Unauthorized Maintenance Access'}),
  Object.freeze({id:'workerTestimony',label:'Worker Maintenance Testimony'}),
  Object.freeze({id:'securityTestimony',label:'Security Access Testimony'}),
  Object.freeze({id:'medicalTestimony',label:'Plouke / Maintenance Testimony'}),
  Object.freeze({id:'medicalContradiction',label:'Contradictory Medical Testimony'}),
  Object.freeze({id:'sageTrail',label:'Sage’s Investigation Trail'}),
  Object.freeze({id:'tournamentData',label:'Hidden Tournament Combat Data'})
]);

// Kept for optional after-hours content and 40.7 quest-replacement activities.
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
    chapter3Started:false,
    sabotageInvestigationStarted:false,
    sabotageEvidence:[],
    sabotageConfirmed:false,
    witnesses:{worker:false,security:false,medical:false},
    strangeManWarningSeen:false,
    medicalWorkerRevisited:false,
    strangeManHatCollected:false,
    strangeManHatLensInspected:false,
    maintenanceInvestigationStarted:false,
    hiddenInfrastructureFound:false,
    sageTrailFound:false,
    findSageObjectiveStarted:false,
    projectHollowFacilityEntered:false,
    tournamentDataDiscovered:false,
    projectHollowNameRevealed:false,
    realSageFound:false,
    facilityLockdownStarted:false,
    teleporterEscapeStarted:false,
    sageBlueCloneCreated:false,
    rrvvfoEnteredTeleporterRoom:false,
    blueCloneIdentityRevealed:false,
    blueCloneLessonSeen:false,
    blueCloneTechniqueFoundationLearned:false,
    teleporterActivated:false,
    blueCloneDisappeared:false,
    rrvvfoTeleportedToEchoRegion:false,
    rrvvfoUnconscious:false,
    echoOperationTimeSkipStarted:false,
    keyItems:[],
    optional:blankOptionalState(),
    optionalProgress:{speakers:[],autographs:[],cleanupFragments:[],fakePloukes:[],flameStability:0},
    // Legacy puzzle state remains readable so older saves can migrate without
    // losing optional rewards or throwing on old fields.
    medicalSort:[],recordingStep:0,mediaTerminals:[],bracketSequence:[],nightRouteIndex:0,
    staffShortcut:false,ringCollectors:[],bagLocations:[],lensTrailIndex:0,detector:false,
    underground:{
      conduits:[],recordedPatterns:[],separated:false,dummyPattern:'hamual',dummyDefeated:false,
      subjectRRead:false,echoDefeated:false,projectHollowRead:false,teleporterFound:false,
      doorAttempts:0,rockThrown:false,objectSwapComplete:false,teleporterActivated:false
    },
    rewards:{echoResistance:false,healingUpgrade:false,flameFocus:false,galleryRecording:false,staffShortcut:false},
    chapterComplete:false
  };
}

function uniqueKnown(values,known){
  const allowed=new Set(known);
  return[...new Set(Array.isArray(values)?values:[])].filter(value=>allowed.has(value));
}
function addSteps(set,steps){for(const step of steps)set.add(step)}

function migrateLegacyRequired(value){
  const old=new Set(Array.isArray(value?.requiredCompleted)?value.requiredCompleted:[]);
  const migrated=new Set(uniqueKnown(value?.requiredCompleted,CHAPTER3_REQUIRED_STEPS));
  const preWitness=['opening','sabotageInvestigationStarted','ringEvidence1Found','ringEvidence2Found','ringEvidence3Found','sabotageConfirmed'];
  const witnesses=['workerQuestioned','securityQuestioned','medicalWorkerFirstConversationComplete'];
  const strange=['strangeManWarningSeen','medicalWorkerRevisited','strangeManHatCollected'];
  const maintenance=['maintenanceInvestigationStarted','hiddenInfrastructureFound','sageTrailFound','findSageObjectiveStarted'];
  const facility=['projectHollowFacilityEntered','tournamentDataDiscovered','projectHollowNameRevealed','realSageFound'];
  const lockdown=['facilityLockdownStarted','teleporterEscapeStarted'];
  const clone=['sageBlueCloneCreated','rrvvfoEnteredTeleporterRoom','blueCloneIdentityRevealed','blueCloneLessonSeen','blueCloneTechniqueFoundationLearned'];
  const ending=['teleporterActivated','blueCloneDisappeared','rrvvfoTeleportedToEchoRegion','rrvvfoUnconscious','echoOperationTimeSkipStarted'];

  if(old.has('opening'))addSteps(migrated,['opening','sabotageInvestigationStarted']);
  if(['crackedRing','ploukeBag','lensTrail','sageExplanation','facilityEntered','auxiliaryPower','recordedAttacks','sageSeparated','dummyDefeated','subjectRFile','echoDefeated','projectHollow','teleporterFound','doorClosing','rockThrown','objectSwap','teleporterActivated','remoteRegion','shadowObjective','chapterSaved'].some(id=>old.has(id)))addSteps(migrated,preWitness);
  if(['medicalLead','fighterNobodyRecorded','bracketRecords','lockedNightShift','crackedRing','ploukeBag','lensTrail','sageExplanation','facilityEntered','auxiliaryPower','recordedAttacks','sageSeparated','dummyDefeated','subjectRFile','echoDefeated','projectHollow','teleporterFound','doorClosing','rockThrown','objectSwap','teleporterActivated','remoteRegion','shadowObjective','chapterSaved'].some(id=>old.has(id)))addSteps(migrated,witnesses);
  if(old.has('strangeManWarningSeen'))migrated.add('strangeManWarningSeen');
  if(old.has('medicalWorkerRevisited'))addSteps(migrated,['strangeManWarningSeen','medicalWorkerRevisited']);
  if(old.has('strangeManHatCollected')||old.has('strangeManLead')||old.has('lensTrail')||old.has('sageExplanation')||old.has('facilityEntered')||old.has('auxiliaryPower')||old.has('recordedAttacks')||old.has('sageSeparated')||old.has('dummyDefeated')||old.has('subjectRFile')||old.has('echoDefeated')||old.has('projectHollow')||old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,[...strange]);
  if(old.has('lensTrail')||old.has('sageExplanation')||old.has('facilityEntered')||old.has('auxiliaryPower')||old.has('recordedAttacks')||old.has('sageSeparated')||old.has('dummyDefeated')||old.has('subjectRFile')||old.has('echoDefeated')||old.has('projectHollow')||old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,maintenance);
  if(old.has('facilityEntered')||old.has('auxiliaryPower')||old.has('recordedAttacks')||old.has('sageSeparated')||old.has('dummyDefeated')||old.has('subjectRFile')||old.has('echoDefeated')||old.has('projectHollow')||old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))migrated.add('projectHollowFacilityEntered');
  if(old.has('recordedAttacks')||old.has('subjectRFile')||old.has('echoDefeated')||old.has('projectHollow')||old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))migrated.add('tournamentDataDiscovered');
  if(old.has('projectHollow')||old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,['projectHollowNameRevealed','realSageFound']);
  if(old.has('teleporterFound')||old.has('doorClosing')||old.has('rockThrown')||old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,lockdown);
  // Old saves that already passed the door are advanced through the new mandatory
  // blue-clone lesson so they cannot load into a hybrid old/new ending.
  if(old.has('objectSwap')||old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,clone);
  if(old.has('teleporterActivated')||old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))migrated.add('teleporterActivated');
  if(old.has('remoteRegion')||old.has('shadowObjective')||old.has('chapterSaved'))addSteps(migrated,ending);
  if(old.has('chapterSaved'))migrated.add('chapterSaved');
  return migrated;
}

export function normalizeChapter3State(value={}){
  const fallback=freshChapter3State();
  const optional={...fallback.optional};
  for(const quest of CHAPTER3_OPTIONAL_QUESTS)optional[quest.id]={...fallback.optional[quest.id],...(value?.optional?.[quest.id]||{})};
  if(Number(value?.version||0)<3){
    for(const id of ['finalAnnouncement','cleanupEchoes','fakePloukes','lateFan'])if(optional[id]?.started&&!optional[id]?.complete){optional[id].started=false;optional[id].progress=0}
  }
  const requiredSet=migrateLegacyRequired(value);
  // Boolean mirrors are written before/alongside required steps in several cinematic
  // transitions. If a browser closes between those writes, recovery promotes the
  // matching checkpoint instead of leaving the player between two states.
  for(const step of [
    'sabotageInvestigationStarted','sabotageConfirmed','strangeManWarningSeen','medicalWorkerRevisited','strangeManHatCollected',
    'maintenanceInvestigationStarted','hiddenInfrastructureFound','sageTrailFound','findSageObjectiveStarted','projectHollowFacilityEntered',
    'tournamentDataDiscovered','projectHollowNameRevealed','realSageFound','facilityLockdownStarted','teleporterEscapeStarted',
    'sageBlueCloneCreated','rrvvfoEnteredTeleporterRoom','blueCloneIdentityRevealed','blueCloneLessonSeen','blueCloneTechniqueFoundationLearned',
    'teleporterActivated','blueCloneDisappeared','rrvvfoTeleportedToEchoRegion','rrvvfoUnconscious','echoOperationTimeSkipStarted'
  ])if(value?.[step])requiredSet.add(step);
  const requiredCompleted=CHAPTER3_REQUIRED_STEPS.filter(step=>requiredSet.has(step));
  const oldEvidence=Array.isArray(value.evidence)?value.evidence:[];
  const evidenceMap={
    ringCollector:['weakenedSupport','unregisteredComponent','maintenanceAccess'],
    medicalTestimony:['medicalTestimony'],medicalBadgeMismatch:['medicalContradiction'],
    copiedRecords:['tournamentData'],energyDetector:['sageTrail'],falseBadge:['maintenanceAccess']
  };
  const evidence=new Set(uniqueKnown(oldEvidence,CHAPTER3_EVIDENCE.map(entry=>entry.id)));
  for(const oldId of oldEvidence)for(const mapped of evidenceMap[oldId]||[])evidence.add(mapped);
  const sabotageEvidence=uniqueKnown(value.sabotageEvidence,['support','component','access']);
  if(requiredSet.has('ringEvidence1Found')&&!sabotageEvidence.includes('support'))sabotageEvidence.push('support');
  if(requiredSet.has('ringEvidence2Found')&&!sabotageEvidence.includes('component'))sabotageEvidence.push('component');
  if(requiredSet.has('ringEvidence3Found')&&!sabotageEvidence.includes('access'))sabotageEvidence.push('access');
  const witnesses={
    worker:Boolean(value?.witnesses?.worker||requiredSet.has('workerQuestioned')),
    security:Boolean(value?.witnesses?.security||requiredSet.has('securityQuestioned')),
    medical:Boolean(value?.witnesses?.medical||requiredSet.has('medicalWorkerFirstConversationComplete'))
  };
  let keyItems=uniqueKnown(value.keyItems,['strange-mans-hat']);
  const strangeManHatCollected=Boolean(value.strangeManHatCollected||requiredSet.has('strangeManHatCollected'));
  if(strangeManHatCollected&&!keyItems.includes('strange-mans-hat'))keyItems.push('strange-mans-hat');
  return{
    ...fallback,...value,
    version:CHAPTER3_STATE_VERSION,
    requiredCompleted,
    pacing:normalizeRpgPacingState('chapter3',value.pacing),
    variety:normalizeQuestVarietyState('chapter3',value.variety),
    evidence:[...evidence],sabotageEvidence,witnesses,keyItems,optional,
    chapter3Started:Boolean(value.chapter3Started||requiredSet.has('opening')),
    sabotageInvestigationStarted:Boolean(value.sabotageInvestigationStarted||requiredSet.has('sabotageInvestigationStarted')),
    sabotageConfirmed:Boolean(value.sabotageConfirmed||requiredSet.has('sabotageConfirmed')),
    strangeManWarningSeen:Boolean(value.strangeManWarningSeen||requiredSet.has('strangeManWarningSeen')),
    medicalWorkerRevisited:Boolean(value.medicalWorkerRevisited||requiredSet.has('medicalWorkerRevisited')),
    strangeManHatCollected,
    strangeManHatLensInspected:Boolean(value.strangeManHatLensInspected),
    maintenanceInvestigationStarted:Boolean(value.maintenanceInvestigationStarted||requiredSet.has('maintenanceInvestigationStarted')),
    hiddenInfrastructureFound:Boolean(value.hiddenInfrastructureFound||requiredSet.has('hiddenInfrastructureFound')),
    sageTrailFound:Boolean(value.sageTrailFound||requiredSet.has('sageTrailFound')),
    findSageObjectiveStarted:Boolean(value.findSageObjectiveStarted||requiredSet.has('findSageObjectiveStarted')),
    projectHollowFacilityEntered:Boolean(value.projectHollowFacilityEntered||requiredSet.has('projectHollowFacilityEntered')),
    tournamentDataDiscovered:Boolean(value.tournamentDataDiscovered||requiredSet.has('tournamentDataDiscovered')),
    projectHollowNameRevealed:Boolean(value.projectHollowNameRevealed||requiredSet.has('projectHollowNameRevealed')),
    realSageFound:Boolean(value.realSageFound||requiredSet.has('realSageFound')),
    facilityLockdownStarted:Boolean(value.facilityLockdownStarted||requiredSet.has('facilityLockdownStarted')),
    teleporterEscapeStarted:Boolean(value.teleporterEscapeStarted||requiredSet.has('teleporterEscapeStarted')),
    sageBlueCloneCreated:Boolean(value.sageBlueCloneCreated||requiredSet.has('sageBlueCloneCreated')),
    rrvvfoEnteredTeleporterRoom:Boolean(value.rrvvfoEnteredTeleporterRoom||requiredSet.has('rrvvfoEnteredTeleporterRoom')),
    blueCloneIdentityRevealed:Boolean(value.blueCloneIdentityRevealed||requiredSet.has('blueCloneIdentityRevealed')),
    blueCloneLessonSeen:Boolean(value.blueCloneLessonSeen||requiredSet.has('blueCloneLessonSeen')),
    blueCloneTechniqueFoundationLearned:Boolean(value.blueCloneTechniqueFoundationLearned||requiredSet.has('blueCloneTechniqueFoundationLearned')),
    teleporterActivated:Boolean(value.teleporterActivated||requiredSet.has('teleporterActivated')),
    blueCloneDisappeared:Boolean(value.blueCloneDisappeared||requiredSet.has('blueCloneDisappeared')),
    rrvvfoTeleportedToEchoRegion:Boolean(value.rrvvfoTeleportedToEchoRegion||requiredSet.has('rrvvfoTeleportedToEchoRegion')),
    rrvvfoUnconscious:Boolean(value.rrvvfoUnconscious||requiredSet.has('rrvvfoUnconscious')),
    echoOperationTimeSkipStarted:Boolean(value.echoOperationTimeSkipStarted||requiredSet.has('echoOperationTimeSkipStarted')),
    optionalProgress:{...fallback.optionalProgress,...(value.optionalProgress||{}),speakers:uniqueKnown(value?.optionalProgress?.speakers,['registration','vendor','arena']),autographs:uniqueKnown(value?.optionalProgress?.autographs,['wade','bark','pouki','plouke']),cleanupFragments:uniqueKnown(value?.optionalProgress?.cleanupFragments,['fragment-a','fragment-b','fragment-c']),fakePloukes:uniqueKnown(value?.optionalProgress?.fakePloukes,['fan','debtor','confused'])},
    underground:{...fallback.underground,...(value.underground||{}),conduits:uniqueKnown(value?.underground?.conduits,['heat','security','records']),recordedPatterns:uniqueKnown(value?.underground?.recordedPatterns,['wade','bark','pouki','rrvvfo','plouke'])},
    rewards:{...fallback.rewards,...(value.rewards||{})}
  };
}

export function markChapter3Required(state,id){if(!CHAPTER3_REQUIRED_STEPS.includes(id))return state;if(!state.requiredCompleted.includes(id))state.requiredCompleted.push(id);return state}
export function chapter3StepComplete(state,id){return Boolean(state?.requiredCompleted?.includes(id))}
export function chapter3RequiredCount(state){const completed=new Set(state?.requiredCompleted||[]);return CHAPTER3_REQUIRED_STEPS.filter(id=>completed.has(id)).length}
export function chapter3Complete(state){const completed=new Set(state?.requiredCompleted||[]);return CHAPTER3_REQUIRED_STEPS.every(id=>completed.has(id))}
export function chapter3NextRequired(state){const completed=new Set(state?.requiredCompleted||[]);return CHAPTER3_REQUIRED_STEPS.find(id=>!completed.has(id))||null}
export function chapter3MandatorySummary(state){return CHAPTER3_MANDATORY_STORIES.map(story=>({...story,complete:chapter3StepComplete(state,story.id)}))}
export function chapter3OptionalSummary(state){return CHAPTER3_OPTIONAL_QUESTS.map(quest=>({...quest,...state?.optional?.[quest.id]}))}
export function chapter3EvidenceSummary(state){const found=new Set(state?.evidence||[]);return CHAPTER3_EVIDENCE.map(entry=>({...entry,found:found.has(entry.id)}))}
export function chapter3CompletionPercent(state){return Math.round(chapter3RequiredCount(state)/CHAPTER3_REQUIRED_STEPS.length*100)}
