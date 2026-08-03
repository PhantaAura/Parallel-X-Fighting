import {FIGHTER_STATUS,PLAYABLE_ROSTER_IDS,ROSTER,ROSTER_IDS,isMirrorMatch} from '../js/roster.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CONTROLLER_STYLES,INPUT_BUFFER_FRAMES,SIMULTANEOUS_WINDOW_FRAMES,InputManager,canSimplifyTouchAction,formatComboPrompt} from '../js/input.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {ATTACKS,Projectile,TimerRegistry,calculateFinalDamage,resetCombo} from '../js/combat.js';
import {EffectSystem} from '../js/effects.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {Fighter} from '../js/fighter.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHARACTER_AI,aiProfile,availableAIActions,decideCPU,selectAIAction} from '../js/ai.js';
import {MOVESETS,MOVE_DAMAGE_TOTALS,moveFor} from '../js/movesets.js';
import {trainingState,recordInput,resetTrainingClash,resetTrainingWorld,resetTrainingPosition,swapTrainingSides,refillTraining,clearTrainingState,exitTrainingWorld,setTrainingSetting,dummyCommand} from '../js/training.js';
import {CLASH_BALANCE,clearClash,compatibleMeleeClash,cpuClashContribution,createClashState,finishClash,startClash,tryProjectileClash,updateClash} from '../js/clash-system.js';
import {DEFENSE_BALANCE} from '../js/guard-system.js';
import {createCameraState} from '../js/camera-system.js';
import {ULTIMATE_BALANCE,ULTIMATES,beginCinematicUltimate,clearCinematic,createCinematicState,updateCinematic} from '../js/ultimate-system.js';
import {AUDIO_HOOKS,AudioManager} from '../js/audio-manager.js';
import {SAFE_AREA_VARIABLES,applySafeAreaVariables,isPortraitViewport,viewportMetrics} from '../js/mobile-safe-area.js';
import {HapticsManager,MobilePlatformController,TOUCH_SETTINGS_KEY,detectMobilePlatform,loadTouchSettings,saveTouchSettings} from '../js/mobile-platform.js';
import {CLASH_PULSE_FRAMES,CLASH_TAP_CAP_PER_SECOND,joystickDirections,resolveDPadDirections,touchTutorialSteps} from '../js/touch-controls.js';
import {TOUCH_CONTROL_IDS,TOUCH_PRESETS,applyTouchPreset,createDefaultTouchSettings,deleteNamedTouchLayout,displayedControlPosition,loadNamedTouchLayout,responsiveControlPosition,saveNamedTouchLayout} from '../js/touch-layout-editor.js';
import {SpriteAtlas,isRepositoryRelativePath,validateSpriteManifest} from '../js/sprite-atlas.js';
import {ANIMATION_PRIORITY,SpriteAnimator} from '../js/sprite-animation.js';
import {BARK_MANIFEST_URL,FighterVisuals,RRVVFO_APPEARANCES,RRVVFO_VISUAL_SAVE_KEY,SPRITE_FIGHTER_IDS,WADE_MANIFEST_URL,availableRrvvfoAppearances,defaultRrvvfoVisualSettings,isDeveloperSpriteBuild,loadRrvvfoVisualSettings,resolveRrvvfoAnimation,saveRrvvfoVisualSettings,shouldShowRrvvfoLoadFailure} from '../js/fighter-visuals.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CONTROLLER_COMPLETION_FEATURES,CONTROLLER_SETTINGS_KEY,ControllerManager,assignConnectedControllers,controllerMenuButtons,createDefaultControllerSettings,detectControllerStyle,loadControllerSettings,saveControllerSettings} from '../js/controller-manager.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {BUILD_VERSION,SAVE_SCHEMA_VERSION} from '../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER2_BRACKET_CARDS,CHAPTER2_OPTIONAL_QUESTS,CHAPTER2_PLOUKE_CLUES,CHAPTER2_RACE_CHECKPOINTS,CHAPTER2_RING_SUPPORTS,CHAPTER2_SHORTCUTS,chapter2MandatoryReadyForTournament,chapter2QuestSummary,createChapter2QuestState,missingChapter2BracketCards,normalizeChapter2QuestState,requiredRumorCountForStep} from '../js/story/chapter2-hub-quests.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER3_BRACKET_ORDER,CHAPTER3_EVIDENCE,CHAPTER3_MANDATORY_STORIES,CHAPTER3_MISSION_ID,CHAPTER3_OPTIONAL_QUESTS,CHAPTER3_REQUIRED_STEPS,chapter3Complete,chapter3CompletionPercent,chapter3NextRequired,freshChapter3State,markChapter3Required,normalizeChapter3State} from '../js/story/chapter3-content.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER4_BEACON_NODES,CHAPTER4_CAVERN_DOORS,CHAPTER4_INGREDIENTS,CHAPTER4_LIFT_PARTS,CHAPTER4_MISSION_ID,CHAPTER4_MOUNTAIN_SIGNALS,CHAPTER4_REQUIRED_STEPS,chapter4Complete,chapter4CompletionPercent,chapter4NextRequired,chapter4VillageDefenseComplete,freshChapter4State,markChapter4Required,normalizeChapter4State,ryuzankaroQuestAvailable} from '../js/story/chapter4-content.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {RPG_PACING_PHASES,completePacingOrientation,createRpgPacingState,normalizeRpgPacingState,pacingOrientationProgress,recordPacingConversation,recordPacingInteraction,recordPacingVisit,rpgPacingQuestWave,setRpgPacingPhase} from '../js/story/rpg-pacing.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER2_EXHIBITION_SEQUENCE,CHAPTER3_INCIDENT_ORDER,CHAPTER4_PARTY_FIELD_ACTIONS,completePartyFieldAction,createQuestVarietyState,exhibitionRank,nextIncidentStep,normalizeQuestVarietyState,recordIncidentStep,runawayCartRank} from '../js/story/quest-variety.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {STORY_AFTERGLOW,inspectStoryReliability,storyAfterglowFor,storyReliabilitySummary} from '../js/story/story-reliability.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {STORY_EXPERIENCE_PROFILES,storyChapterIsLongest,storyExperienceBeat,storyExperienceProfile,storyRankReaction,storyTargetMinutes} from '../js/story/story-experience.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {ADVENTURE_MISSIONS,CHAPTER_GAMEPLAY_IDENTITIES,ENEMY_ARCHETYPES,ENEMY_ARCHETYPE_ICONS,RRVVFO_BUILDS,RRVVFO_PASSIVES,RRVVFO_TECHNIQUES,adventureMissionResultLabel,applyRrvvfoBuildToFighter,chapterGameplayIdentity,completeAdventureMission,currentRrvvfoBuild,enemyArchetype,enemyArchetypeShape,loadAdventureProgress,loadRrvvfoBuild,renderRrvvfoBuildLab,saveRrvvfoBuild,saveRrvvfoCustomBuild,storySafeRrvvfoBuild,tuneRrvvfoAbility} from '../js/story/core-fun.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {FIELD_SKILLS,STORY_TECHNIQUE_RULES,loadFieldSkillState,masterFieldSkill,normalizeFieldSkillState,recordFieldSkillTrial,renderFieldSkillJournal,storyTechniqueAvailable} from '../js/story/field-skills.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CONNECTED_WORLD_VERSION,WORLD_REGIONS,WORLD_REGION_LINKS,WORLD_SHORTCUTS,connectedZoneNeighbors,discoverWorldLandmark,discoverWorldShortcut,freshConnectedWorldState,normalizeConnectedWorldState,recordInteriorVisit,recordWorldVisit,renderTravelJournal,setWorldDoorState,worldDoorState,worldInteriorKnown,worldMapSummary,worldShortcutKnown,worldZoneKnown} from '../js/story/connected-world.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {STORY_BUILDINGS,STORY_INTERIOR_VERSION,buildingDefinition,buildingIdsForChapter,buildingMapTitle,canEnterBuilding,interiorActorPoints,interiorMapPoints,interiorTransition,lockedDoorLine,resolveExteriorBuildingCollision} from '../js/story/story-interiors.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {FIELD_SKILL_REACTIONS,WORLD_DELIGHT_DISCOVERIES,WORLD_DELIGHT_VERSION,delightForChapter,discoverWorldDelight,loadWorldDelightState,normalizeWorldDelightState,worldDelightKnown} from '../js/story/world-delight.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {FAST_TRAVEL_NODES,REVISIT_LOOP_VERSION,REVISIT_OPPORTUNITIES,claimRevisitOpportunity,fastTravelDestination,fastTravelNodeAvailable,markFastTravelArrival,renderRevisitJournal,revisitOpportunityStatus,revisitState,syncFastTravelNodes,unlockFastTravelNode} from '../js/story/revisit-loop.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER3_REPLACEMENT_ACTIVITIES,QUEST_AUDIT,QUEST_OVERHAUL_VERSION,chapter2BracketRoute,chapter3ReplacementActivity,chapter4PotionReady,chapter4PotionRoute,chapter4SignalRoute,chapter4SignalsReady,questAuditSummary} from '../js/story/quest-overhaul.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {effectiveStoryBonusStats,storyAttackMultiplier,storyDefenseMultiplier,storySpeedMultiplier,storyStatsForLevel} from '../js/story/story-progression.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {MAIN_MENU_MODES,PROGRESS_LOCKED_MODE_IDS,MainMenu,mainMenuConfirmLabel,mainMenuModesForProgress} from '../js/main-menu.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {LOST_YEAR_SAVE_KEY,LOST_YEAR_ROUTES,RRVVFO_CHAPTERS,STORY_CHAPTERS_PER_CHARACTER,chapter4CompletionConflict,completedRrvvfoChapterCount,lastLostYearSaveError,modeUnlockedForProgress,repairChapter4Progress,routeProgress,rrvvfoChapterComplete,rrvvfoNextMission,saveLostYearProgress,storyModeComplete} from '../js/story/lost-year-data.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {applyHubCameraLook,createHubCameraLookState,resolveHubCameraOcclusion,snapHubCamera,updateHubCamera} from '../js/story/hub-camera.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {resolveHubWorldCollision,stageHubColliders} from '../js/story/hub-collision.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {getArenaStage,listArenaStages,stageProfile,validateArenaStage} from '../js/arena/arena-stages.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {PAUSE_ACTIONS,requiresRestartConfirmation,simulationCanAdvance} from '../js/pause-menu.js';
import {RESULT_ACTIONS,buildResultsModel} from '../js/results-screen.js';
import {MatchStatistics,formatMatchDuration} from '../js/match-statistics.js';
import {adaptiveMoveList} from '../js/move-list.js';
import {DEFAULT_QOL_SETTINGS,QOL_SETTINGS_KEY,loadQolSettings,saveQolSettings,sanitizeQolSettings} from '../js/qol-settings.js';
import {NotificationSystem} from '../js/notification-system.js';
import {SAVE_EXPORT_KEYS,createSaveExport,importSaveText,resetSaveGroup,stringifySave,validateSaveImport} from '../js/save-manager.js';
import {TRAINING_PRESET_KEY,applyTrainingPreset,loadTrainingPresets,saveTrainingPreset} from '../js/training-presets.js';
import {TRAINING_TRIALS,createTrainingTrialState,pursuitTimingGrade,recordTrainingTrialEvent,resetTrainingTrial,trainingTrialView} from '../js/training-trials.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {MASTERY_CHALLENGES,MASTERY_RECORDS_KEY,battleMasteryRank,createBattleMasterySession,finalizeBattleMastery,loadMasteryRecords,masterySummary,recordBattleMasteryEvent,recordMasteryChallenge,renderMasteryRecords} from '../js/mastery-records.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {CHAPTER4_ENEMY_ROLES,chapter4EnemyRole} from '../js/story/chapter4-enemy-roles.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {FirstTimeHints,HINTS_DISMISSED_KEY} from '../js/first-time-hints.js';
import {cooldownText,fighterHudModel} from '../js/hud-model.js';
import {LoadingManager} from '../js/loading-manager.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {ABILITY_HOTBAR_KEY,FIGHTER_ABILITY_HOTBARS,abilitiesForFighter,abilityStatus,createDefaultAbilityHotbarSettings,defaultAbilityOrder,loadAbilityHotbarSettings,moveAbilitySlot,orderedAbilities,restoreAbilityOrder,saveAbilityHotbarSettings} from '../js/ability-hotbar-data.js';
import {AbilityHotbar,HOTBAR_INFO_HOLD_MS,hotbarPrompt} from '../js/ability-hotbar.js';
import {LOGICAL_GAME_HEIGHT,LOGICAL_GAME_WIDTH,calculateResponsiveLayout,classifyDisplay,controlsOverlap} from '../js/responsive-game-layout.js';
import {MOBILE_PRESENTATION_KEY,OrientationManager,createMobilePresentationSettings,loadMobilePresentationSettings,saveMobilePresentationSettings,shouldRecommendPortrait} from '../js/orientation-manager.js';
import {FullscreenManager,fullscreenSupported} from '../js/fullscreen-manager.js';
import {COMBAT_MANUAL_PAGES,grantPublicCombatManual,loadCombatManualState} from '../js/story/combat-manual.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {ARENA_NORMAL_PROFILES,FIGHTER_FEEL_PROFILES,RRVVFO_TACTICAL_LOADOUT,SPECIAL_CATEGORIES,abilityCategory,arenaAttackFor,fighterFeelFor} from '../js/arena/arena-combat-data.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {PURSUIT_TUNING,canGroundBounce,canWallSplat,dashIdentityFor,pursuitDurationFor,pursuitPromptText,pursuitTechAvailable,pursuitWindowFor} from '../js/arena/pursuit-combat.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {FOCUS_RECOVERY_RULES,channelFocusRecovery,endFocusRecovery,focusRecoveryAvailability,registerRecoverableDamage,resetFocusRecovery,tickFocusRecovery} from '../js/focus-recovery.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {STAGES} from '../js/stages.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {STAGE_PERSONALITY,projectileHitsStageGeometry,resolveStageGeometry,stageGeometryFor,stagePersonalityFor} from '../js/arena/stage-personality.js?v=29a4072r-ch1-adventure-playtestlab-20260802';

const RELEASE_CACHE_ID='29a4072r-ch1-adventure-playtestlab-20260802';
const EXPECTED_BUILD='Prototype 2.9A.40.7.2R — Complete Chapter 1 Adventure Rebuild + Mobile Playtest Lab';
const TOTAL_TESTS=482;
const TEST_TIMEOUT_MS=30000;
class SmokeTimeoutError extends Error{constructor(name){super(`Timed out after ${TEST_TIMEOUT_MS/1000} seconds: ${name}`);this.name='SmokeTimeoutError';this.code='PX_SMOKE_TIMEOUT'}}
const FETCH_TIMEOUT_MS=12000;
const nativeFetch=globalThis.fetch.bind(globalThis);
const harness=globalThis.__PX_SMOKE_HARNESS__||{
  beginRun(){},testStarted(){},testFinished(){},complete(){},fatal(error){console.error(error)}
};

function cacheBustedRequest(input){
  try{
    const source=input instanceof Request?input.url:input;
    const url=new URL(source,document.baseURI);
    if(url.protocol==='http:'||url.protocol==='https:')url.searchParams.set('v',RELEASE_CACHE_ID);
    return input instanceof Request?new Request(url.href,input):url.href;
  }catch{return input}
}

function fetchFresh(input,init={}){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(new DOMException(`Request exceeded ${FETCH_TIMEOUT_MS}ms`,'TimeoutError')),FETCH_TIMEOUT_MS);
  const signal=init.signal||controller.signal;
  return nativeFetch(cacheBustedRequest(input),{...init,signal,cache:'no-store'})
    .finally(()=>clearTimeout(timeout));
}

async function fetchSource(input){
  const response=await fetchFresh(input);
  if(!response.ok)throw new Error(`Could not load ${input}: HTTP ${response.status}`);
  return response.text();
}

const results=[];
const registry=[];
let runActive=false;
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const errorMessage=error=>error?.message||String(error||'Unknown test failure');
const smokeStorageFallback=(()=>{const data=new Map();return{getItem:key=>data.has(String(key))?data.get(String(key)):null,setItem:(key,value)=>data.set(String(key),String(value)),removeItem:key=>data.delete(String(key)),clear:()=>data.clear()}})();
function smokeStorage(){try{return globalThis.localStorage}catch{globalThis.__PX_TEST_STORAGE__=smokeStorageFallback;return smokeStorageFallback}}
function withLocalStorageValue(key,value,run){
  const storage=smokeStorage(),previous=storage.getItem(key);
  try{storage.setItem(key,String(value));return run(storage)}
  finally{if(previous===null)storage.removeItem(key);else storage.setItem(key,previous)}
}

function storeResult(result){
  const existing=results.findIndex(item=>item.name===result.name);
  if(existing>=0)results[existing]=result;else results.push(result);
}

async function executeTest(entry,index,total){
  harness.testStarted({name:entry.name,index,total});
  let timer;
  try{
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new SmokeTimeoutError(entry.name)),TEST_TIMEOUT_MS)});
    await Promise.race([Promise.resolve().then(entry.fn),timeout]);
    const result={name:entry.name,pass:true};storeResult(result);harness.testFinished({result,index,total});return result;
  }catch(error){
    const result={name:entry.name,pass:false,error:errorMessage(error)};storeResult(result);harness.testFinished({result,index,total});
    if(error?.code==='PX_SMOKE_TIMEOUT')throw error;
    return result;
  }finally{clearTimeout(timer)}
}

async function test(name,fn){
  const entry={name,fn};registry.push(entry);
  return executeTest(entry,registry.length,TOTAL_TESTS);
}

async function runBatch(entries,label){
  if(runActive)return;
  runActive=true;
  harness.beginRun({label,total:entries.length,fullTotal:registry.length||TOTAL_TESTS});
  try{
    for(let index=0;index<entries.length;index++)await executeTest(entries[index],index+1,entries.length);
    const ordered=registry.map(entry=>results.find(result=>result.name===entry.name)).filter(Boolean);
    publishResults(ordered,label);
  }finally{runActive=false}
}

function publishResults(ordered=results,label='Complete'){
  const failed=ordered.filter(result=>!result.pass);
  const summary={results:ordered,passed:ordered.length-failed.length,failed:failed.length,total:ordered.length,build:EXPECTED_BUILD,cacheId:RELEASE_CACHE_ID};
  globalThis.__SMOKE_RESULTS__=summary;
  harness.complete(summary,{label});
  if(failed.length)console.error('Smoke tests failed',failed);else console.info(`Smoke tests passed: ${ordered.length}`);
  return summary;
}
function makeWorld(){
  Object.assign(trainingState,{enabled:false,infiniteHealth:false,infiniteEnergy:false,infiniteGuard:false,guardRegen:true,infiniteClash:false,forceNextClash:false,dummy:'never',stationaryBlock:false,afterFirstHit:false});
  const world={width:960,height:540,ground:430,fighters:[],projectiles:[],effects:new EffectSystem(),timers:new TimerRegistry(),clash:createClashState(),camera:createCameraState(),cinematic:createCinematicState(),cinematicMode:'off',localMode:false,reducedShake:false,shake:0,hitstop:0,training:trainingState,sound:()=>{}};
  world.tryProjectileClash=tryProjectileClash;return world;
}
function pair(a='rrvvfo',b='revvfo',world=makeWorld()){const one=new Fighter(a,1,false,world),two=new Fighter(b,2,false,world);world.fighters=[one,two];one.x=300;two.x=345;return{world,one,two}}
class ManualTimers{constructor(){this.tasks=[]}schedule(fn,delay){this.tasks.push({fn,delay})}cancelAll(){this.tasks=[]}flush(){for(const task of this.tasks.splice(0))task.fn()}get size(){return this.tasks.length}}
function makePad(){return{axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))}}
function settleChordWindow(input,options={}){for(let frame=0;frame<=SIMULTANEOUS_WINDOW_FRAMES;frame++)input.poll(options)}
function controllerTap(input,pad,button,{up=false,options={}}={}){pad.buttons[button].pressed=true;if(up)pad.buttons[12].pressed=true;input.poll(options);pad.buttons[button].pressed=false;if(up)pad.buttons[12].pressed=false;settleChordWindow(input,options)}
function keyboardTap(input,code){input.setKeyboard(code,true);input.poll();input.setKeyboard(code,false);settleChordWindow(input)}
function touchTap(input,action){input.setTouchAction(1,action,true);input.poll();input.setTouchAction(1,action,false);settleChordWindow(input)}
function resolveNormal(fighter,action){const kind=action==='a'?(fighter.grounded?'light':'air'):action==='h'?(fighter.grounded?'heavy':'airHeavy'):action==='x'?'launcher':null;fighter.attackCd=fighter.windup=0;assert(kind&&fighter.attack(kind),`${action} did not start`);fighter.windup=0;return fighter.resolveAttack()}
function controllerActions(style,actions){const pad=makePad(),input=new InputManager(()=>[pad]);input.setControllerStyle(1,style);const output=[];for(const action of actions){const mapping=CONTROLLER_STYLES[style];if(action==='x')controllerTap(input,pad,mapping.buttons.h,{up:true});else controllerTap(input,pad,mapping.buttons[action]);for(const candidate of ['a','h','x','j'])if(input.consumeAction(1,candidate))output.push(candidate)}return output}
function memoryStorage(){const data={};return{getItem:key=>data[key]??null,setItem:(key,value)=>{data[key]=String(value)},removeItem:key=>delete data[key],data}}
function fakeMobileEnvironment(width=390,height=844){
  const values={},classes=new Set(),listeners={};
  const style={setProperty:(key,value)=>{values[key]=value}};
  const doc={documentElement:{style,dataset:{}},body:{classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)}},addEventListener:(name,fn)=>{listeners[`doc:${name}`]=fn},removeEventListener:name=>delete listeners[`doc:${name}`]};
  const viewListeners={},history={state:{},pushes:0,pushState(state){this.state=state;this.pushes++},replaceState(state){this.state=state}};
  const view={innerWidth:width,innerHeight:height,location:{href:'https://example.test/game'},history,matchMedia:()=>({matches:true}),addEventListener:(name,fn)=>{viewListeners[name]=fn},removeEventListener:name=>delete viewListeners[name]};
  return{doc,view,values,classes,listeners,viewListeners,history};
}

await test('loads the complete roster',()=>assert(ROSTER_IDS.length===15,`expected 15, got ${ROSTER_IDS.length}`));
await test('casual select and Random use only the four playable fighters',()=>{assert(PLAYABLE_ROSTER_IDS.join(',')==='rrvvfo,revvfo,wade,bark','normal playable roster is not restricted to finished fighters');for(const id of PLAYABLE_ROSTER_IDS)assert(FIGHTER_STATUS[id]?.selectable!==false,`${id} is not selectable`);assert(FIGHTER_STATUS.sage.id==='mentor-only'&&!FIGHTER_STATUS.sage.selectable,'the Sage is not mentor-only');for(const id of ROSTER_IDS.filter(id=>!PLAYABLE_ROSTER_IDS.includes(id)))assert(FIGHTER_STATUS[id]?.selectable===false,`${id} should not be selectable`)});
await test('preserves mirror-match restriction',()=>{assert(isMirrorMatch('rrvvfo','rrvvfo'),'same fighters must be mirrors');assert(!isMirrorMatch('rrvvfo','bark'),'different fighters must be allowed')});
await test('combines keyboard with an idle controller',()=>{const idle={axes:[0],buttons:Array.from({length:16},()=>({pressed:false}))},input=new InputManager(()=>[idle]);input.setKeyboard('KeyA',true);input.poll();assert(input.down('KeyA'),'idle gamepad cleared keyboard input')});
await test('official Chapter controls keep one meaning everywhere',()=>{const input=new InputManager(()=>[]);for(const [code,action] of [['KeyC','k'],['KeyU','s'],['KeyR','q'],['KeyQ','c'],['KeyE','i']]){input.setKeyboard(code,true);input.poll();assert(action==='k'?input.actionIsDown(1,action):input.consumeAction(1,action),`${code} did not map to ${action}`);input.setKeyboard(code,false);input.clearBuffers()}input.setMouseAction(1,'a',true);input.poll();assert(input.consumeAction(1,'a'),'M1 did not map to Light');input.setMouseAction(1,'a',false);input.setMouseAction(1,'b',true);input.poll();assert(input.actionIsDown(1,'b'),'M2 did not map to Block')});
await test('unified WASD depth controls work on keyboard and controller',()=>{const keyboard=new InputManager(()=>[]);keyboard.setKeyboard('KeyW',true);keyboard.setKeyboard('KeyS',true);keyboard.poll();assert(keyboard.actionIsDown(1,'up')&&keyboard.actionIsDown(1,'down'),'keyboard depth actions were not shared');const pad=makePad();pad.axes[1]=.8;const controller=new InputManager(()=>[pad]);controller.poll();assert(controller.actionIsDown(1,'down'),'controller depth axis did not reach the shared runtime');pad.axes[1]=-.8;controller.poll();assert(controller.actionIsDown(1,'up'),'controller upward depth axis did not reach the shared runtime')});
await test('Chapter mouse controls are shared by every combat runtime',()=>{const input=new InputManager(()=>[]);input.setMouseAction(1,'a',true);input.poll();assert(input.consumeAction(1,'a'),'M1 did not produce the shared Light action');assert(input.inputStyleName(1)==='Mouse + Keyboard','mouse device was not detected');assert(input.actionLabel(1,'a',{device:'mouse'})==='M1','Light prompt did not show M1');input.setMouseAction(1,'a',false);input.setMouseAction(1,'b',true);input.poll();assert(input.actionIsDown(1,'b'),'M2 did not hold shared Block');assert(input.actionLabel(1,'b',{device:'mouse'})==='M2','Block prompt did not show M2');input.setMouseAction(1,'b',false);input.poll();assert(!input.actionIsDown(1,'b'),'M2 Block stayed held after release')});

await test('keeps quick keyboard taps between frames',()=>{const input=new InputManager(()=>[]);input.setKeyboard('KeyH',true);input.setKeyboard('KeyH',false);input.poll();assert(input.consume('KeyH'),'quick tap was lost before polling')});
await test('maps three-hit light chains for Nintendo Xbox and PlayStation',()=>{for(const style of ['nintendo','xbox','playstation']){const actions=controllerActions(style,['a','a','a']);assert(actions.join(',')==='a,a,a',`${style} translated ${actions.join(',')}`);const{one}=pair();for(const action of actions)assert(resolveNormal(one,action),`${style} light missed`);assert(one.combo.hits===3,`${style} produced ${one.combo.hits} hits`);assert(one.chainLockout>0,`${style} bypassed final-light lockout`)}});
await test('light-to-heavy finishers preserve the existing combo rules',()=>{for(const style of ['nintendo','xbox','playstation']){const actions=controllerActions(style,['a','a','h']);assert(actions.join(',')==='a,a,h',`${style} did not translate the finisher`);const{one}=pair();for(const action of actions)assert(resolveNormal(one,action),`${style} finisher missed`);assert(one.combo.hits===3,`${style} finisher produced ${one.combo.hits} hits`);assert(one.lightChain===0,'heavy finisher retained the light-chain index')}});
await test('Up plus Heavy maps to Launcher in every controller style',()=>{for(const style of ['nintendo','xbox','playstation']){const pad=makePad(),input=new InputManager(()=>[pad]);input.setControllerStyle(1,style);controllerTap(input,pad,CONTROLLER_STYLES[style].buttons.h,{up:true});assert(input.consumeAction(1,'x'),`${style} Up + Heavy did not launch`);assert(!input.consumeAction(1,'h')&&!input.consumeAction(1,'t'),`${style} launcher also emitted heavy or throw`)}});
await test('throws require simultaneous Light and Heavy',()=>{for(const style of ['nintendo','xbox','playstation']){const pad=makePad(),input=new InputManager(()=>[pad]),mapping=CONTROLLER_STYLES[style];input.setControllerStyle(1,style);pad.buttons[mapping.buttons.a].pressed=pad.buttons[mapping.buttons.h].pressed=true;input.poll();assert(input.consumeAction(1,'t'),`${style} simultaneous attacks did not throw`);pad.buttons[mapping.buttons.a].pressed=pad.buttons[mapping.buttons.h].pressed=false;settleChordWindow(input);assert(!input.consumeAction(1,'a')&&!input.consumeAction(1,'h'),'throw leaked normal attacks')}});
await test('sequential Light then Heavy never becomes a throw',()=>{for(const style of ['nintendo','xbox','playstation']){const pad=makePad(),input=new InputManager(()=>[pad]),mapping=CONTROLLER_STYLES[style];input.setControllerStyle(1,style);controllerTap(input,pad,mapping.buttons.a);assert(input.consumeAction(1,'a'),`${style} lost sequential light`);controllerTap(input,pad,mapping.buttons.h);assert(input.consumeAction(1,'h'),`${style} lost sequential heavy`);assert(!input.consumeAction(1,'t'),`${style} sequential inputs threw`)}});
await test('launcher routes translate on keyboard controller and touch',()=>{const keyboard=new InputManager(()=>[]),keyboardRoute=[];for(const [code,action] of [['KeyI','x'],['Space','j'],['KeyJ','a'],['KeyK','h']]){keyboardTap(keyboard,code);if(keyboard.consumeAction(1,action))keyboardRoute.push(action)}const controllerRoute=controllerActions('nintendo',['x','j','a','h']);const touch=new InputManager(()=>[]),touchRoute=[];for(const action of ['x','j','a','h']){touchTap(touch,action);if(touch.consumeAction(1,action))touchRoute.push(action)}for(const [device,route] of [['keyboard',keyboardRoute],['controller',controllerRoute],['touch',touchRoute]])assert(route.join(',')==='x,j,a,h',`${device} route translated ${route.join(',')}`);const{one,two}=pair();assert(resolveNormal(one,'x'),'launcher missed');assert(two.vy<0,'launcher did not lift');one.grounded=0;one.y=two.y-12;assert(resolveNormal(one,'a'),'air light missed');one.grounded=0;one.y=two.y-12;assert(resolveNormal(one,'h'),'air heavy missed');assert(one.combo.hits===3,`air route produced ${one.combo.hits} hits`)});
await test('damage scaling is identical across controller styles',()=>{const damages=[];for(const style of ['nintendo','xbox','playstation']){const actions=controllerActions(style,['a','a','a']),setup=pair();for(const action of actions)resolveNormal(setup.one,action);damages.push(setup.one.combo.damage)}assert(damages.every(value=>Math.abs(value-damages[0])<.0001),`style damage diverged: ${damages.join('/')}`)});
await test('hit-stop input remains buffered until a legal follow-up can begin',()=>{const input=new InputManager(()=>[]),{one}=pair(),command={down:action=>input.actionIsDown(1,action),pressed:action=>input.consumeAction(1,action)};one.attackCd=4;keyboardTap(input,'KeyJ');for(let frame=0;frame<4;frame++){input.poll();one.update(command);assert(!one.pending,'buffered light bypassed recovery')}input.poll();one.update(command);assert(one.pending==='light','buffered hit-stop follow-up was not preserved');input.clear();one.cancelStartup();one.attackCd=20;keyboardTap(input,'KeyK');for(let frame=0;frame<=INPUT_BUFFER_FRAMES;frame++){input.poll();one.update(command)}one.attackCd=0;input.poll();one.update(command);assert(!one.pending,'stale buffered input did not expire')});
await test('custom remapping changes prompts and buttons without changing rules',()=>{const pad=makePad(),input=new InputManager(()=>[pad]);input.setControllerStyle(1,'custom');input.setCustomButton(1,'a',9);controllerTap(input,pad,9);assert(input.consumeAction(1,'a'),'custom light binding did not translate');assert(input.comboPrompt(1,'controller').startsWith('Button 10, Button 10'),'custom prompt did not update');const standard=pair(),custom=pair();for(let i=0;i<3;i++){resolveNormal(standard.one,'a');resolveNormal(custom.one,'a')}assert(Math.abs(standard.one.combo.damage-custom.one.combo.damage)<.0001&&standard.one.chainLockout===custom.one.chainLockout,'remapping changed damage or chain timing')});
await test('Training combo prompts match active input styles',()=>{assert(formatComboPrompt('nintendo')==='B, B, Up + Y, A, B, Y','Nintendo prompt is wrong');assert(formatComboPrompt('xbox')==='X, X, Up + Y, A, X, Y','Xbox prompt is wrong');assert(formatComboPrompt('playstation')==='Square, Square, Up + Triangle, Cross, Square, Triangle','PlayStation prompt is wrong');assert(formatComboPrompt('touch')==='Light, Light, Launcher, Jump, Air Light, Air Heavy','Touch prompt is wrong')});
await test('Training input history records only real semantic inputs',()=>{trainingState.inputHistory.length=0;recordInput('B');assert(trainingState.inputHistory.length===1&&trainingState.inputHistory[0]==='B','input history created empty entries');for(let index=0;index<24;index++)recordInput(`Input ${index}`);assert(trainingState.inputHistory.length===20,'input history did not retain exactly twenty recent entries')});
await test('simplified touch can automate only the three-light continuation',()=>{for(const action of ['x','s','u','t','k'])assert(!canSimplifyTouchAction(action),`simplified mode permits ${action}`);const input=new InputManager(()=>[]);input.setSimplifiedTouch(1,true);input.setTouchAction(1,'a',true);let lights=0,unsafe=0;for(let frame=0;frame<60;frame++){input.poll();if(input.consumeAction(1,'a'))lights++;for(const action of ['x','s','u','t','k'])if(input.consumeAction(1,action))unsafe++}input.setTouchAction(1,'a',false);input.poll();assert(lights===3,`simplified touch emitted ${lights} lights`);assert(unsafe===0,'simplified touch emitted an unsafe action')});
await test('detects iPhone iPad Android and touch capability',()=>{const media=()=>({matches:true}),css={supports:()=>true};const iphone=detectMobilePlatform({userAgent:'Mozilla/5.0 (iPhone) AppleWebKit Safari',platform:'iPhone',maxTouchPoints:5},{matchMedia:media,CSS:css}),ipad=detectMobilePlatform({userAgent:'Mozilla/5.0 Macintosh Safari',platform:'MacIntel',maxTouchPoints:5},{matchMedia:media,CSS:css}),android=detectMobilePlatform({userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome',platform:'Linux',maxTouchPoints:5},{matchMedia:media,CSS:css});assert(iphone.ios&&iphone.safari&&iphone.touch,'iPhone detection failed');assert(ipad.ios&&ipad.tablet,'iPad desktop-UA detection failed');assert(android.android&&android.touch&&!android.ios,'Android detection failed')});
await test('applies safe-area and dynamic viewport metrics for cutouts',()=>{const env=fakeMobileEnvironment(412,915),metrics=applySafeAreaVariables(env.doc,env.view);assert(metrics.width===412&&metrics.height===915,'viewport metrics were wrong');assert(env.values['--safe-top']===SAFE_AREA_VARIABLES.top&&env.values['--safe-bottom']===SAFE_AREA_VARIABLES.bottom,'safe-area variables were not installed');assert(env.values['--mobile-vh']==='915px','dynamic browser height was not applied');assert(isPortraitViewport(env.view),'portrait device was not detected');assert(!isPortraitViewport({innerWidth:915,innerHeight:412}),'landscape device was marked portrait')});
await test('touch layout tracks browser resize and orientation changes',()=>{const env=fakeMobileEnvironment(390,844),changes=[];const platform=new MobilePlatformController({doc:env.doc,view:env.view,nav:{userAgent:'iPhone Safari',maxTouchPoints:5},onViewportChange:metrics=>changes.push(metrics)});assert(env.doc.documentElement.dataset.mobileOrientation==='portrait','initial portrait layout was missing');env.view.innerWidth=844;env.view.innerHeight=390;env.viewListeners.resize();assert(env.doc.documentElement.dataset.mobileOrientation==='landscape','landscape layout did not apply after resize');assert(env.values['--mobile-vw']==='844px'&&env.values['--mobile-vh']==='390px','resized visual viewport was stale');assert(changes.length===1,'resize did not notify the touch layout');platform.dispose()});
await test('virtual joystick filters drift and supports diagonal movement',()=>{const drift=joystickDirections(4,3,{radius:70,deadZone:.22,sensitivity:1});assert(!drift.left&&!drift.right&&!drift.up&&!drift.down,'finger drift caused movement');const diagonal=joystickDirections(55,-50,{radius:70,deadZone:.18,sensitivity:1.15});assert(diagonal.right&&diagonal.up&&!diagonal.left&&!diagonal.down,'joystick diagonal failed');const less=joystickDirections(20,0,{radius:70,deadZone:.18,sensitivity:.6}),more=joystickDirections(20,0,{radius:70,deadZone:.18,sensitivity:1.6});assert(more.x>less.x,'sensitivity did not change stick response')});
await test('virtual D-Pad supports diagonals and rejects opposites',()=>{const diagonal=resolveDPadDirections(['up','right'],'right');assert(diagonal.up&&diagonal.right,'D-Pad diagonal failed');const opposite=resolveDPadDirections(['left','right'],'right');assert(!opposite.left&&opposite.right,'opposite D-Pad directions were both active');const vertical=resolveDPadDirections(['up','down'],'up');assert(vertical.up&&!vertical.down,'latest vertical direction did not win')});
await test('touch Up plus Heavy produces Launcher without Heavy',()=>{const input=new InputManager(()=>[]);input.setTouchAction(1,'up',true);input.poll();input.setTouchAction(1,'h',true);input.poll();input.setTouchAction(1,'h',false);input.setTouchAction(1,'up',false);settleChordWindow(input);assert(input.consumeAction(1,'x'),'touch Up + Heavy did not launch');assert(!input.consumeAction(1,'h'),'touch launcher leaked Heavy')});
await test('multi-touch preserves movement and Block while attacking',()=>{const input=new InputManager(()=>[]);input.setTouchAction(1,'r',true);input.setTouchAction(1,'b',true);input.setTouchAction(1,'a',true);input.poll();input.setTouchAction(1,'a',false);settleChordWindow(input);assert(input.actionIsDown(1,'r'),'attack cleared touch movement');assert(input.actionIsDown(1,'b'),'attack cleared held Block');assert(input.consumeAction(1,'a'),'multi-touch attack was lost')});
await test('touch throw requires overlapping attack touches and dedicated Throw is identical',()=>{const chord=new InputManager(()=>[]);chord.setTouchAction(1,'a',true);chord.setTouchAction(1,'h',true);chord.setTouchAction(1,'a',false);chord.setTouchAction(1,'h',false);chord.poll();assert(chord.consumeAction(1,'t'),'overlapping quick touch chord did not throw');assert(!chord.consumeAction(1,'a')&&!chord.consumeAction(1,'h'),'throw chord leaked normals');const sequential=new InputManager(()=>[]);touchTap(sequential,'a');assert(sequential.consumeAction(1,'a'),'touch sequential light was lost');touchTap(sequential,'h');assert(sequential.consumeAction(1,'h')&&!sequential.consumeAction(1,'t'),'sequential touch attacks threw');const dedicated=new InputManager(()=>[]);touchTap(dedicated,'t');assert(dedicated.consumeAction(1,'t'),'dedicated Throw did not emit the shared throw action');const normalRoute=pair(),dedicatedRoute=pair();normalRoute.one.throw();dedicatedRoute.one.throw();assert(normalRoute.one.resolveThrow()&&dedicatedRoute.one.resolveThrow(),'one throw path failed to connect');assert(normalRoute.two.hp===dedicatedRoute.two.hp&&normalRoute.one.throwRecovery===dedicatedRoute.one.throwRecovery,'dedicated Throw changed damage or recovery')});
await test('touch clash methods have equivalent capped maximum strength',()=>{const repeatedPer64=Math.floor(64/(60/CLASH_TAP_CAP_PER_SECOND)),pulsePer64=Math.floor(64/CLASH_PULSE_FRAMES)*2;assert(repeatedPer64===pulsePer64,`clash methods diverged ${repeatedPer64}/${pulsePer64}`);const input=new InputManager(()=>[]);input.setTouchAction(1,'a',true);input.setTouchAction(1,'a',false);input.setTouchAction(1,'h',true);input.setTouchAction(1,'h',false);input.poll({clash:true});assert(input.consumeAction(1,'a')&&input.consumeAction(1,'h'),'touch pulse did not supply legal clash inputs')});
await test('touch movement choice and custom layouts persist locally',()=>{const storage=memoryStorage(),settings=createDefaultTouchSettings();settings.touchMode='on';settings.movement='dpad';settings.movementChosen=true;settings.positions.light.x=77;assert(saveNamedTouchLayout(settings,'My D-Pad'),'custom layout did not save');assert(saveTouchSettings(settings,storage),'touch preferences did not save');assert(storage.data[TOUCH_SETTINGS_KEY],'touch storage key was not used');const loaded=loadTouchSettings(storage,createDefaultTouchSettings);assert(loaded.touchMode==='on'&&loaded.movement==='dpad'&&loaded.movementChosen&&loaded.savedLayouts.length===1,'saved D-Pad preference did not load');applyTouchPreset(loaded,'standard-joystick');assert(loaded.movement==='joystick','Settings could not switch back to Virtual Joystick');loaded.positions.light.x=40;assert(loadNamedTouchLayout(loaded,'My D-Pad')&&loaded.positions.light.x===77,'saved custom layout did not restore');assert(deleteNamedTouchLayout(loaded,'My D-Pad')&&loaded.savedLayouts.length===0,'custom layout did not delete')});
await test('all touch presets and every editable control are available',()=>{for(const id of ['standard-joystick','standard-dpad','compact-joystick','compact-dpad','large-buttons','left-handed','tablet','simplified'])assert(TOUCH_PRESETS[id],`missing ${id}`);const settings=createDefaultTouchSettings();assert(TOUCH_CONTROL_IDS.every(id=>settings.positions[id]),'not every touch control has an editable position');applyTouchPreset(settings,'left-handed');const normal=createDefaultTouchSettings(),flipped=displayedControlPosition(settings,'light'),base=displayedControlPosition(normal,'light');assert(Math.abs(flipped.x-(100-base.x))<.001,'left-handed preset did not swap sides');applyTouchPreset(settings,'simplified');assert(settings.simplified,'Simplified preset did not enable safe light continuation')});
await test('touch tutorial teaches the full selected control system',()=>{const joystick=touchTutorialSteps('joystick'),dpad=touchTutorialSteps('dpad'),all=joystick.map(step=>`${step.title} ${step.text}`).join(' ');for(const term of ['Jump','Light','Heavy','Launcher','air combo','Charge','Grab','Interact','perfect block','Dash','Combo breaker','Ultimate','Clashes'])assert(all.toLowerCase().includes(term.toLowerCase()),`tutorial omitted ${term}`);assert(joystick[0].title.includes('Virtual Joystick')&&dpad[0].title.includes('D-Pad'),'tutorial did not reflect movement style')});
await test('iOS and Android prevent gameplay scrolling while Android Back pauses',()=>{for(const agent of ['iPhone Safari','Android Chrome']){const env=fakeMobileEnvironment(),pauses=[];const platform=new MobilePlatformController({doc:env.doc,view:env.view,nav:{userAgent:agent,maxTouchPoints:5},onBackPause:()=>pauses.push(true)});platform.activateMatch();assert(env.classes.has('touch-match-active'),`${agent} match class was not enabled`);let prevented=false;env.listeners['doc:touchmove']({cancelable:true,target:{closest:()=>false},preventDefault:()=>{prevented=true}});assert(prevented,`${agent} gameplay touchmove was not prevented`);let modalPrevented=false;env.listeners['doc:touchmove']({cancelable:true,target:{closest:selector=>selector==='.mobileModalCard'},preventDefault:()=>{modalPrevented=true}});assert(!modalPrevented,`${agent} settings scrolling was blocked`);if(agent.startsWith('Android')){env.viewListeners.popstate({preventDefault:()=>{}});assert(pauses.length===1&&env.history.pushes>=2,'Android Back did not pause and retain the page')}platform.deactivateMatch();assert(!env.classes.has('touch-match-active'),`${agent} normal browser behavior was not restored`)}});
await test('haptics modes are optional and rate limited',()=>{const pulses=[],nav={vibrate:pattern=>{pulses.push(pattern);return true}},times=[100,120,200],manager=new HapticsManager({nav,mode:()=> 'reduced',now:()=>times.shift()});assert(manager.trigger('heavyHit'),'supported haptic did not fire');assert(!manager.trigger('perfectBlock'),'haptic spam was not rate limited');assert(manager.trigger('guardBreak'),'later haptic did not fire');assert(pulses.every(pattern=>pattern.length===1),'Reduced Haptics used a long pattern');const off=new HapticsManager({nav,mode:()=> 'off',now:()=>500});assert(!off.trigger('clash'),'Haptics Off vibrated')});
await test('applies three-hit light combo and scaling',()=>{const{one,two}=pair();for(let i=0;i<3;i++){one.attackCd=one.windup=0;one.attack('light');one.windup=0;one.resolveAttack()}assert(one.combo.hits===3,`expected 3 hits, got ${one.combo.hits}`);assert(one.combo.scale<1,'third hit did not scale')});
await test('terminates Wade ground chain at the wall',()=>{const{one,two}=pair('wade','bark');one.x=820;two.x=897;for(let i=0;i<3;i++){one.attackCd=one.windup=0;assert(one.attack('light'),`light ${i+1} did not start`);one.windup=0;assert(one.resolveAttack(),`light ${i+1} missed`)}assert(one.chainLockout>0,'final light did not lock the chain');for(let i=0;i<12;i++){one.attackCd=one.windup=0;assert(!one.attack('light'),'1-2-3 chain restarted during lockout')}assert(one.combo.hits===3,`wall loop reached ${one.combo.hits} hits`)});
await test('cancels interrupted attack startup',()=>{const{one,two}=pair('rrvvfo','wade');assert(one.attack('heavy'),'heavy did not start');assert(one.windup>0&&one.pendingMove,'startup state missing');one.hit(5,0,'light',two,{hitstun:12});assert(one.windup===0&&one.pending===null&&one.pendingMove===null&&one.queuedAttack===null,'interrupted startup survived')});
await test('launches into an air attack',()=>{const{one,two}=pair();one.attack('launcher');one.windup=0;one.resolveAttack();assert(two.vy<0,'launcher did not lift defender');one.attackCd=0;one.grounded=0;one.y=two.y-15;one.attack('air');one.windup=0;assert(one.resolveAttack(),'air follow-up did not connect')});
await test('reports actual post-defense damage',()=>{const result=calculateFinalDamage({base:20,hit:2,defense:2,armor:true,blocked:false});assert(Math.abs(result.final-4.95)<.001,`unexpected final damage ${result.final}`)});
await test('combo total equals health actually removed',()=>{const{one,two}=pair('rrvvfo','bark');two.armor=30;const before=two.hp;two.hit(20,0,'heavy',one,{hitstun:20});assert(Math.abs(one.combo.damage-(before-two.hp))<.0001,`combo ${one.combo.damage} did not match health loss ${before-two.hp}`)});
await test('fully resets Training state delayed work and buffered inputs',()=>{const{world,one,two}=pair(),input=new InputManager(()=>[]);world.projectiles.push({});world.effects.add({t:'slash',l:20});world.effects.burst(1,1,'#fff');world.timers.schedule(()=>{},10000);Object.assign(one,{lens:20,armor:20,aura:20,trap:20,freeze:20,inv:20,stun:20,knockdown:20,getup:20,windup:20,attackCd:20,airDashes:1,juggles:3,lightChain:2});keyboardTap(input,'KeyJ');trainingState.enabled=true;resetTrainingWorld(world,input);assert(world.projectiles.length===0&&world.effects.effects.length===0&&world.effects.particles.length===0&&world.timers.size===0,'transient world state leaked');assert([one,two].every(f=>f.x===(f.side===1?150:762)&&f.lens===0&&f.attackCd===0&&f.lightChain===0),'fighter state did not reset');assert(!input.consumeAction(1,'a'),'Training reset retained buffered input')});
await test('cleans all state when exiting Training',()=>{const{world,one}=pair();let inputCleared=false;world.projectiles.push({});world.timers.schedule(()=>{},10000);one.lens=20;trainingState.enabled=true;trainingState.inputHistory.push('F');exitTrainingWorld(world,{clear:()=>{inputCleared=true}});assert(!trainingState.enabled&&trainingState.inputHistory.length===0&&inputCleared,'Training flags or input survived exit');assert(world.projectiles.length===0&&world.timers.size===0&&one.lens===0,'combat state survived Training exit')});
await test('canceled delayed attacks cannot leak rounds',async()=>{const timers=new TimerRegistry();let fired=0;timers.schedule(()=>fired++,10);timers.cancelAll();await new Promise(resolve=>setTimeout(resolve,25));assert(fired===0,'canceled delayed attack fired in a later round')});
await test('keeps non-CPU dummy modes stationary and passive',()=>{for(const mode of ['never','always','after','stationary']){trainingState.dummy=mode;trainingState.afterFirstHit=mode==='after';const command=dummyCommand();assert(!['a','h','x','s','u','d','j'].some(action=>command.pressed(action)),`${mode} dummy attacked`);assert(!command.down('l')&&!command.down('r'),`${mode} dummy moved`)}trainingState.dummy='never';assert(!dummyCommand().down('b'),'Never Block blocked');trainingState.dummy='always';assert(dummyCommand().down('b'),'Always Block did not block')});
await test('Bark counter punishes nearby melee only',()=>{const{one:bark,two:attacker}=pair('bark','wade');assert(bark.counter(),'counter did not start');bark.counterStartup=0;bark.counterActive=10;const barkHp=bark.hp,attackerHp=attacker.hp;bark.hit(8,0,'light',attacker,{hitstun:12});assert(bark.hp===barkHp,'Bark took melee damage during active counter');assert(attacker.hp<attackerHp,'nearby melee attacker was not punished')});
await test('Bark counter does not punish projectiles',()=>{const{one:bark,two:attacker}=pair('bark','rrvvfo');bark.counter();bark.counterStartup=0;bark.counterActive=10;const attackerHp=attacker.hp;bark.hit(8,0,'special',attacker,{hitstun:12});assert(bark.hp<100,'projectile did not hit Bark');assert(attacker.hp===attackerHp,'projectile user was remotely countered');assert(bark.counterRecovery>0,'failed counter did not enter recovery')});
await test('synchronizes Training settings',()=>{const pre={checked:true},live={checked:true};setTrainingSetting('infiniteHealth',false,pre,live);assert(!trainingState.infiniteHealth&&!pre.checked&&!live.checked,'health toggles diverged');const menu={value:'never'},hud={value:'never'};setTrainingSetting('dummy','cpu',menu,hud);assert(trainingState.dummy==='cpu'&&menu.value==='cpu'&&hud.value==='cpu','dummy selectors diverged')});
await test('Lens starts at a truthful 60 Energy and 25 HP cost',()=>withLocalStorageValue('pxLensMasteryV1','0',storage=>{const{one}=pair();one.hp=34;one.en=100;one.lensAbility();assert(one.hp===9,`expected 9 HP, got ${one.hp}`);assert(one.en===40&&one.lens===240,'Lens energy or duration incorrect');assert(one.aura===0,'Flow State must remain separate');assert(one.lensPrediction!=='UNKNOWN','Lens did not produce a truthful broad prediction')}));
await test('Shots of Agony creates exactly four clones and consumes full energy',()=>{const world=makeWorld();world.timers=new ManualTimers();const{one}=pair('rrvvfo','revvfo',world);one.en=100;assert(one.beginShotsOfAgony(),'volley did not start');assert(one.en===0,`expected 0 energy, got ${one.en}`);assert(world.effects.effects.filter(effect=>effect.t==='agonyClone').length===4,'volley did not create four clones');assert(one.agonyCooldown===0,'cooldown began before clones fired')});
await test('Shots active volley blocks reuse and suppresses regeneration',()=>{const world=makeWorld();world.timers=new ManualTimers();const{one}=pair('rrvvfo','revvfo',world);one.en=100;one.beginShotsOfAgony();const energy=one.en;assert(!one.beginShotsOfAgony(),'second volley started while first was active');for(let i=0;i<60;i++)one.update();assert(one.en===energy,'energy regenerated during committed volley')});
await test('Shots fires four projectiles together then starts five-second cooldown',()=>{const world=makeWorld();world.timers=new ManualTimers();const{one}=pair('rrvvfo','revvfo',world);one.en=100;one.beginShotsOfAgony();assert(world.timers.tasks.length===1&&world.timers.tasks[0].delay===240,'volley tell was not scheduled together');world.timers.flush();assert(world.projectiles.filter(projectile=>projectile.volleyOwner===one).length===4,'clones did not fire four simultaneous projectiles');assert(one.agonyCooldown===300,'cooldown did not start at 300 after firing')});
await test('Shots cooldown lasts the full 300 simulation frames',()=>{const{one}=pair('rrvvfo','revvfo');one.agonyCooldown=300;for(let frame=0;frame<299;frame++)one.update();assert(one.agonyCooldown===1,`cooldown expired early at ${one.agonyCooldown}`);one.update();assert(one.agonyCooldown===0,'cooldown did not expire after 300 frames')});
await test('Shots total damage stays between 25 and 30',()=>{const{one,two}=pair('rrvvfo','revvfo');const before=two.hp;for(let i=0;i<4;i++)two.hit(7.4*one.c.p,0,'special',one,{hitstun:20});const damage=before-two.hp;assert(damage>=25&&damage<=30,`four-clone damage was ${damage.toFixed(2)}`)});
await test('Phanta defense is balanced and survives every individual move',()=>{assert(ROSTER.phanta.d>=1.08&&ROSTER.phanta.d<=1.12,'Phanta defense is outside target range');for(const id of ROSTER_IDS){const{one:attacker,two:phanta}=pair(id,'phanta');for(const kind of ['light','heavy','launcher','air','airHeavy']){const variants=kind==='light'&&MOVESETS[id]?.light?MOVESETS[id].light:[moveFor(id,kind)||ATTACKS[kind]];for(const move of variants){phanta.hp=100;resetCombo(attacker.combo);phanta.hit(move.damage*attacker.c.p,0,kind,attacker,move);assert(phanta.hp>0,`${id} ${kind} defeated full-health Phanta`)}}for(const kind of ['special','ultimate']){phanta.hp=100;resetCombo(attacker.combo);const total=MOVE_DAMAGE_TOTALS[id][kind];if(total>0)phanta.hit(total*attacker.c.p,0,kind,attacker,{hitstun:20});assert(phanta.hp>0,`${id} ${kind} defeated full-health Phanta`)}}});
await test('every roster AI can select core offense, movement, and defense',()=>{const required=['a','h','x','s','u','d','j'];for(const id of ROSTER_IDS){const{one,two}=pair(id,id==='rrvvfo'?'bark':'rrvvfo');one.en=100;one.specialCd=one.ultCd=one.dashCd=0;one.agonyCooldown=0;one.agonyActiveVolley=false;const available=availableAIActions(one,two),profile=aiProfile(id);for(const action of required){assert(available.actions.includes(action),`${id} cannot consider ${action}`);const weighted=available.actions.map(candidate=>Math.max(.01,profile[candidate]||.01)),index=available.actions.indexOf(action),before=weighted.slice(0,index).reduce((sum,value)=>sum+value,0),roll=(before+weighted[index]/2)/weighted.reduce((sum,value)=>sum+value,0);assert(selectAIAction(available.actions,profile,roll)===action,`${id} cannot select ${action}`)}assert(available.movements.length===2,`${id} lacks movement choices`);assert(available.canBlock&&profile.block>0,`${id} lacks defensive choices`)}});
await test('all roster AI profiles are character-specific without damage modifiers',()=>{assert(Object.keys(CHARACTER_AI).length===ROSTER_IDS.length,'missing character AI profiles');for(const id of ROSTER_IDS){const profile=CHARACTER_AI[id];assert(profile?.style,`${id} lacks a documented AI style`);assert(!('damage'in profile),`${id} AI changes damage`)}});
await test('CPU Rrvvfo obeys Shots availability restrictions',()=>{const{one,two}=pair('rrvvfo','bark');one.en=100;one.agonyActiveVolley=true;assert(!availableAIActions(one,two).actions.includes('s'),'CPU considered Shots during active volley');one.agonyActiveVolley=false;one.agonyCooldown=200;assert(!availableAIActions(one,two).actions.includes('s'),'CPU considered Shots during cooldown');one.agonyCooldown=0;assert(availableAIActions(one,two).actions.includes('s'),'CPU did not consider ready Shots')});

await test('compatible heavy attacks trigger a melee clash',()=>{const{world,one,two}=pair('bark','revvfo');two.x=352;assert(two.attack('heavy')&&one.attack('heavy'),'heavy startups failed');one.windup=0;assert(one.resolveAttack(),'heavy resolution failed');assert(world.clash.active&&world.clash.type==='melee','compatible heavies did not clash')});
await test('incompatible attacks do not trigger a cinematic clash',()=>{assert(!compatibleMeleeClash('light','heavy'),'light was clash compatible');const{world,one,two}=pair();two.x=352;two.attack('heavy');one.attack('light');one.windup=0;one.resolveAttack();assert(!world.clash.active,'light versus heavy triggered a clash')});
await test('beam collisions start a beam clash',()=>{const{world,one,two}=pair('revvfo','virek');const left=new Projectile(one,470,250,2,0,'#f5f',20,16,'beam'),right=new Projectile(two,490,250,-2,0,'#5f9',20,16,'beam');world.projectiles.push(left,right);left.update(world);assert(world.clash.active&&world.clash.type==='beam','beam collision did not start a clash');assert(left.dead&&right.dead,'colliding beams remained active')});
await test('clash state clears after completion',()=>{const{world,one,two}=pair();startClash(world,'melee',one,two,{powerA:12,powerB:12});world.clash.frame=1;updateClash(world,[0,0]);assert(!world.clash.active,'completed clash stayed active');assert(one.clashCooldown===CLASH_BALANCE.cooldown,'clash cooldown was not applied')});
await test('clash state clears when a round ends',()=>{const{world,one,two}=pair();startClash(world,'ultimate',one,two,{powerA:30,powerB:30});clearClash(world);assert(!world.clash.active&&world.clash.fighters.length===0,'round cleanup retained clash state')});
await test('clash state clears during Training reset',()=>{const{world,one,two}=pair();trainingState.enabled=true;startClash(world,'melee',one,two,{powerA:12,powerB:12});resetTrainingWorld(world);assert(!world.clash.active,'Training reset retained clash state')});
await test('CPU clash input respects difficulty',()=>{const{one}=pair('bark','wade');const easy=cpuClashContribution('easy',one,0),normal=cpuClashContribution('normal',one,0),hard=cpuClashContribution('hard',one,0);assert(easy<normal&&normal<hard,`CPU clash strength did not scale: ${easy}/${normal}/${hard}`)});
await test('clash damage cannot one-shot a full-health fighter',()=>{const{world,one,two}=pair();startClash(world,'ultimate',one,two,{powerA:40,powerB:20});world.clash.meter=100;finishClash(world,1);assert(two.hp>0,`ultimate clash reduced full health to ${two.hp}`)});

await test('blocking reduces guard and applies controlled chip',()=>{const{one,two}=pair();two.block=1;const hp=two.hp,guard=two.guard;two.hit(20,5,'heavy',one,{hitstun:20});assert(two.guard<guard,'blocking did not reduce guard');assert(two.hp<hp&&two.hp>hp-5,'heavy chip was missing or excessive')});
await test('guard regenerates only when allowed',()=>{const{two}=pair();two.guard=50;two.guardRegenDelay=0;two.update();assert(two.guard>50,'idle guard did not regenerate');const after=two.guard;two.block=1;two.wasBlocking=true;two.update({down:action=>action==='b',pressed:()=>false});assert(two.guard===after,'guard regenerated while blocking')});
await test('guard break activates at zero guard',()=>{const{one,two}=pair();two.guard=1;two.block=1;two.hit(18,4,'heavy',one,{hitstun:20});assert(two.guard===0&&two.guardBreakStun>0&&!two.block,'zero guard did not cause guard break')});
await test('guard-break loops are prevented',()=>{const{one,two}=pair();two.guard=1;two.block=1;two.hit(18,4,'heavy',one,{hitstun:20});const stun=two.guardBreakStun;two.update({down:()=>true,pressed:()=>false});two.hit(5,0,'light',one,{hitstun:8});assert(!two.block&&two.guardBreakStun<=stun,'guard break immediately looped')});
await test('perfect block only works during its timing window',()=>{const command={down:action=>action==='b',pressed:()=>false};const early=pair();early.two.update(command);const earlyGuard=early.two.guard;early.two.hit(20,4,'heavy',early.one,{hitstun:20});const earlyLoss=earlyGuard-early.two.guard;const late=pair();for(let i=0;i<8;i++)late.two.update(command);const lateGuard=late.two.guard;late.two.hit(20,4,'heavy',late.one,{hitstun:20});const lateLoss=lateGuard-late.two.guard;assert(earlyLoss<lateLoss*.25,`perfect block guard loss ${earlyLoss} was not below normal ${lateLoss}`)});
await test('throws beat blocking at close range',()=>{const{one,two}=pair();two.block=1;const hp=two.hp;assert(one.throw(),'throw did not start');assert(one.resolveThrow(),'close throw did not connect');assert(two.hp<hp&&!two.block&&two.throwProtection>0,'throw did not beat block')});
await test('throws fail outside close range',()=>{const{one,two}=pair();two.x=750;const hp=two.hp;one.throw();assert(!one.resolveThrow(),'distant throw connected');assert(two.hp===hp&&one.throwRecovery>0,'distant throw was not a punishable miss')});
await test('throw protection prevents immediate repeated throws',()=>{const{one,two}=pair();one.throw();one.resolveThrow();const hp=two.hp;one.throwRecovery=one.attackCd=0;one.throw();assert(!one.resolveThrow(),'throw protection allowed an immediate rethrow');assert(two.hp===hp,'protected throw dealt damage')});
await test('combo breaker costs 60 energy and cannot be spammed',()=>{const{one}=pair();one.en=100;one.stun=24;assert(one.comboBreaker(),'breaker did not activate');assert(one.en===100-DEFENSE_BALANCE.breakerCost,'breaker energy cost was wrong');one.stun=24;assert(!one.comboBreaker(),'breaker activated twice in one round')});
await test('chip damage cannot reduce health below one',()=>{const{one,two}=pair();two.hp=1;two.block=1;two.hit(80,0,'ultimate',one,{hitstun:20});assert(two.hp===1,'blocked chip defeated the fighter')});
await test('defensive AI can retreat throw break combos and scale perfect blocks',()=>{const{one,two}=pair('creed','bark');one.guard=20;const retreat=decideCPU(one,two,'hard',()=>0);assert(retreat.move==='l','low-guard CPU did not retreat');two.block=1;assert(availableAIActions(one,two).actions.includes('t'),'CPU could not consider a throw against block');one.stun=20;one.en=100;assert(availableAIActions(one,two).actions.includes('q'),'CPU could not consider a breaker');one.stun=0;const easy=decideCPU(one,two,'easy',()=>.3),hard=decideCPU(one,two,'hard',()=>.3);assert(!easy.block&&hard.block,'perfect-block/block consistency did not scale by difficulty')});

await test('every fighter has a valid bounded cinematic ultimate',()=>{for(const id of ROSTER_IDS){const data=ULTIMATES[id];assert(data,`${id} has no ultimate`);assert(data.damage>=ULTIMATE_BALANCE.minDamage&&data.damage<=ULTIMATE_BALANCE.maxDamage,`${id} ultimate damage ${data.damage} is out of bounds`);assert(data.startup>0&&data.recovery>0&&data.duration>=120,`${id} ultimate lacks startup, recovery, or cinematic duration`)}});
await test('ultimate energy cost and cooldown are enforced',()=>{const{one}=pair();one.en=89;assert(!one.ultimate(),'ultimate activated without enough energy');one.en=100;assert(one.ultimate(),'charged ultimate did not activate');assert(one.en===10&&one.ultCd===ULTIMATE_BALANCE.cooldown,'ultimate cost or cooldown was wrong');assert(!one.ultimate(),'ultimate ignored its lockout')});
await test('missing an ultimate creates punishable recovery',()=>{const{one,two}=pair('bark','wade');one.x=80;two.x=800;one.en=100;one.ultimate();one.ultimateStartup=0;assert(!one.resolveUltimate(),'out-of-range ultimate connected');assert(one.ultimateRecovery===ULTIMATES.bark.recovery,'missed ultimate lacked recovery')});
await test('no cinematic ultimate one-shots a full-health normal fighter',()=>{for(const id of ROSTER_IDS){const opponent=id==='virek'?'bark':'virek',setup=pair(id,opponent);setup.one.x=300;setup.two.x=345;setup.one.en=100;assert(setup.one.ultimate(),`${id} ultimate did not start`);setup.one.ultimateStartup=0;setup.one.resolveUltimate();updateCinematic(setup.world);assert(setup.two.hp>0,`${id} ultimate one-shot a full-health fighter`)}});
await test('camera restores after every cinematic',()=>{for(const id of ROSTER_IDS){const setup=pair(id,id==='wade'?'bark':'wade');setup.one.x=300;setup.two.x=345;beginCinematicUltimate(setup.world,setup.one,setup.two);setup.world.cinematic.frame=1;setup.world.cinematic.impactFrame=0;updateCinematic(setup.world);assert(!setup.world.camera.active&&setup.world.camera.zoom===1,`${id} camera did not restore`)}});
await test('camera restores after cinematic interruption',()=>{const{world,one,two}=pair('revvfo','wade');world.cinematicMode='full';beginCinematicUltimate(world,one,two);assert(world.camera.active,'cinematic camera did not start');one.hit(2,0,'light',two,{hitstun:4});assert(!world.cinematic.active&&!world.camera.active,'interrupted cinematic retained camera state')});
await test('camera restores after round cleanup and Training reset',()=>{const round=pair();round.world.cinematicMode='full';beginCinematicUltimate(round.world,round.one,round.two);clearCinematic(round.world);assert(!round.world.camera.active,'round cleanup retained camera');const training=pair();training.world.cinematicMode='full';beginCinematicUltimate(training.world,training.one,training.two);trainingState.enabled=true;resetTrainingWorld(training.world);assert(!training.world.camera.active&&!training.world.cinematic.active,'Training reset retained cinematic camera')});
await test('audio hooks exist for every major combat event',()=>{for(const cue of ['lightHit','heavyHit','launcher','block','perfectBlock','guardBreak','clash','beamClash','ultimateActivate','ultimateImpact','roundStart','ko','victory'])assert(AUDIO_HOOKS[cue],`missing ${cue} audio hook`)});
await test('Rrvvfo and Revvfo ranged specials can beam clash',()=>{const{world,one,two}=pair('rrvvfo','revvfo');one.x=120;two.x=780;one.special();two.special();assert(world.projectiles.length===2&&world.projectiles.every(projectile=>projectile.type==='beam'),'rival beams were not created');for(let frame=0;frame<50&&!world.clash.active;frame++){for(const projectile of world.projectiles)projectile.update(world)}assert(world.clash.active&&world.clash.type==='beam','Rrvvfo versus Revvfo beam clash did not start')});
await test('Revvfo keeps ranged beam aerial beam and close teleport visual actions',()=>{let setup=pair('revvfo','rrvvfo');setup.one.x=120;setup.two.x=780;setup.one.special();assert(setup.one.visualAction==='astrylteBlast'&&setup.world.projectiles.length===1,'ranged Revvfo special changed');setup=pair('revvfo','rrvvfo');setup.one.grounded=0;setup.one.special();assert(setup.one.visualAction==='beamAttack'&&setup.world.projectiles.length===1,'air Revvfo beam changed');setup=pair('revvfo','rrvvfo');setup.one.x=300;setup.two.x=390;const before=setup.two.hp;setup.one.special();assert(setup.one.visualAction==='teleportRush'&&setup.two.hp<before,'close Revvfo teleport strike changed')});
await test('Rrvvfo and Phanta ultimates can clash',()=>{const{world,one,two}=pair('rrvvfo','phanta');one.en=two.en=100;assert(one.ultimate()&&two.ultimate(),'rival ultimates did not activate');assert(world.clash.active&&world.clash.type==='ultimate','Rrvvfo versus Phanta did not enter an ultimate clash')});
await test('Wade versus Bark preserves speed and armor identities',()=>{const{one:wade,two:bark}=pair('wade','bark');assert(wade.c.sp>bark.c.sp,'Wade was not faster than Bark');bark.attack('heavy');assert(bark.armor>0,'Bark heavy did not activate intentional armor')});
await test('Bark perfect block remains separate from deliberate counter',()=>{const perfect=pair('bark','wade');perfect.one.update({down:action=>action==='b',pressed:()=>false});const attackerHp=perfect.two.hp;perfect.one.hit(8,0,'light',perfect.two,{hitstun:12});assert(perfect.two.hp===attackerHp,'perfect block automatically countered');const counter=pair('bark','wade');counter.one.counter();counter.one.counterStartup=0;counter.one.counterActive=10;counter.one.hit(8,0,'light',counter.two,{hitstun:12});assert(counter.two.hp<100,'deliberate counter did not punish')});
await test('Creed can evade a cinematic ultimate with timed dash invulnerability',()=>{const{world,one:attacker,two:creed}=pair('wade','creed');world.cinematicMode='off';creed.inv=12;const hp=creed.hp;beginCinematicUltimate(world,attacker,creed);updateCinematic(world);assert(creed.hp===hp,'Creed was hit during an active evasive window')});
await test('controller attack buttons contribute independently to clashes',()=>{const pad=makePad(),input=new InputManager(()=>[pad]),mapping=CONTROLLER_STYLES.xbox;pad.buttons[mapping.buttons.a].pressed=pad.buttons[mapping.buttons.h].pressed=true;input.poll({clash:true});assert(input.consumeAction(1,'a')&&input.consumeAction(1,'h'),'controller light/heavy inputs were not both available to the clash system')});
await test('Training clash reset clears active and armed states',()=>{const{world,one,two}=pair();trainingState.forceNextClash=true;startClash(world,'melee',one,two,{powerA:12,powerB:12});trainingState.forceNextClash=true;resetTrainingClash(world);assert(!world.clash.active&&!trainingState.forceNextClash,'Training clash reset left active or armed state')});

let rrvvfoManifest;
await test('Rrvvfo atlas manifest loads with normalized anchors',async()=>{const response=await fetchFresh('../assets/fighters/rrvvfo/rrvvfo-animations.json');assert(response.ok,'manifest request failed');rrvvfoManifest=await response.json();assert(validateSpriteManifest(rrvvfoManifest),'manifest validation failed');assert(rrvvfoManifest.atlas.frameCanvas.join('x')==='192x192','frame canvas is not normalized');for(const [name,frame] of Object.entries(rrvvfoManifest.frames)){assert(frame.groundPivot[0]===96&&frame.groundPivot[1]===178,`${name} has an inconsistent ground pivot`);assert(frame.projectileOrigin.length===2,`${name} has no projectile anchor`) }});
await test('Rrvvfo sprite paths are GitHub Pages relative',()=>{assert(isRepositoryRelativePath(rrvvfoManifest.image),'atlas image path is root-relative');for(const path of Object.values(rrvvfoManifest.effects))assert(isRepositoryRelativePath(path),`${path} is unsafe for project Pages`)});
let revvfoManifest;
await test('Revvfo atlas manifest loads with normalized anchors and original moveset animations',async()=>{const response=await fetchFresh('../assets/fighters/revvfo/revvfo-animations.json');assert(response.ok,'Revvfo manifest request failed');revvfoManifest=await response.json();assert(validateSpriteManifest(revvfoManifest),'Revvfo manifest validation failed');assert(revvfoManifest.fighter==='revvfo','wrong fighter manifest');for(const name of ['astrylteBlast','teleportRush','beamAttack','ultimateAttack'])assert(revvfoManifest.animations[name],`Revvfo animation ${name} missing`);for(const frame of Object.values(revvfoManifest.frames))assert(frame.groundPivot.join(',')==='96,178','Revvfo pivot mismatch')});
await test('Rrvvfo Hood Up has complete matching animation coverage',()=>{for(const [name,animation] of Object.entries(rrvvfoManifest.animations)){assert(animation.variants?.up?.length===animation.frames.length,`${name} Hood Up frame count mismatch`);for(const frame of animation.variants.up)assert(rrvvfoManifest.frames[frame],`${name} references missing Hood Up frame ${frame}`)}assert(rrvvfoManifest.notes.fullAlternateAnimationCoverage===true,'manifest did not report complete Hood Up coverage')});
await test('Revvfo sprite paths remain GitHub Pages relative',()=>{assert(isRepositoryRelativePath(revvfoManifest.image),'Revvfo atlas image path is unsafe');for(const path of Object.values(revvfoManifest.effects))assert(isRepositoryRelativePath(path),`${path} is unsafe for project Pages`)});
await test('idle and run sprite animations loop',()=>{const atlas=new SpriteAtlas(rrvvfoManifest,{},new URL('../assets/fighters/rrvvfo/rrvvfo-animations.json',document.baseURI)),animator=new SpriteAnimator(atlas);animator.play('idle',{restart:true});animator.update(5000);assert(!animator.complete&&animator.name==='idle','idle did not loop');animator.play('run',{priority:ANIMATION_PRIORITY.movement,restart:true});animator.update(5000);assert(!animator.complete&&animator.name==='run','run did not loop')});
await test('non-looping attack animation completes and returns control',()=>{const atlas=new SpriteAtlas(rrvvfoManifest,{},new URL('../assets/fighters/rrvvfo/rrvvfo-animations.json',document.baseURI)),completed=[],animator=new SpriteAnimator(atlas,{onComplete:name=>completed.push(name)});animator.play('light1',{priority:ANIMATION_PRIORITY.attack,restart:true});animator.update(1000);assert(animator.complete&&completed[0]==='light1','attack animation never completed');assert(animator.play('idle',{priority:ANIMATION_PRIORITY.idle}),'idle could not resume after completion')});
await test('animation priority lets hurt interrupt movement but not idle interrupt attack',()=>{const atlas=new SpriteAtlas(rrvvfoManifest,{},new URL('../assets/fighters/rrvvfo/rrvvfo-animations.json',document.baseURI)),animator=new SpriteAnimator(atlas);animator.play('run',{priority:ANIMATION_PRIORITY.movement});assert(animator.play('hurtLight',{priority:ANIMATION_PRIORITY.hurt}),'hurt did not interrupt movement');animator.play('light1',{priority:ANIMATION_PRIORITY.attack,restart:true});assert(!animator.play('idle',{priority:ANIMATION_PRIORITY.idle}),'idle interrupted an unfinished attack')});
await test('Rrvvfo light chain chooses light1 light2 light3 in order',()=>{const{one}=pair();const names=[];for(let hit=0;hit<3;hit++){one.attackCd=one.windup=0;assert(one.attack('light'),'light did not start');names.push(one.visualAction);one.windup=0;one.resolveAttack()}assert(names.join(',')==='light1,light2,light3',`visual chain was ${names.join(',')}`);assert(one.chainLockout>0,'visual mapping bypassed combo termination')});
await test('heavy launcher and air attacks map to dedicated animations',()=>{const ground=pair();ground.one.attack('heavy');assert(resolveRrvvfoAnimation(ground.one,ground.world).name==='heavyStartup','heavy startup animation missing');ground.one.cancelStartup();ground.one.attackCd=0;ground.one.attack('launcher');assert(resolveRrvvfoAnimation(ground.one,ground.world).name==='launcherStartup','launcher animation missing');const air=pair();air.one.grounded=0;air.one.y-=50;air.one.attack('air');assert(resolveRrvvfoAnimation(air.one,air.world).name==='airLight','air light animation missing');air.one.cancelStartup();air.one.attackCd=0;air.one.attack('airHeavy');assert(resolveRrvvfoAnimation(air.one,air.world).name==='airHeavy','air heavy animation missing')});
await test('block perfect-block and guard-break animations are distinct',()=>{const setup=pair();setup.two.block=1;assert(resolveRrvvfoAnimation(setup.two,setup.world).name==='blockStart','block pose missing');setup.two.visualPerfectTimer=6;assert(resolveRrvvfoAnimation(setup.two,setup.world).name==='perfectBlock','perfect-block pose missing');setup.two.visualPerfectTimer=0;setup.two.guardBreakStun=20;assert(resolveRrvvfoAnimation(setup.two,setup.world).name==='guardBreak','guard-break pose missing')});
await test('Fire Blast manifest provides a hand projectile origin',()=>{for(const frameName of rrvvfoManifest.animations.fireBlastFire.frames){const anchor=rrvvfoManifest.frames[frameName].projectileOrigin;assert(anchor[0]>96&&anchor[1]<178,`${frameName} projectile anchor is not near the forward hand`) }});
await test('Shots of Agony keeps four separate clone visuals and synchronized fire',()=>{const{world,one}=pair();world.timers=new ManualTimers();one.en=100;assert(one.beginShotsOfAgony(),'Shots did not start');const clones=world.effects.effects.filter(effect=>effect.t==='agonyClone');assert(clones.length===4,'clone visuals were not four separate instances');assert(new Set(clones.map(effect=>effect.volleyId)).size===1,'clone visuals did not share one volley');world.timers.flush();const projectiles=world.projectiles.filter(projectile=>projectile.volleyId===one.agonyVolleyId);assert(projectiles.length===4&&one.agonyCooldown===300,'four projectiles did not fire together with the original cooldown')});
await test('Lens visuals preserve mastered cost and dodge state',()=>withLocalStorageValue('pxLensMasteryV1','100',storage=>{const{one,two}=pair();one.hp=40;one.en=100;assert(one.lensAbility(),'Lens did not activate');assert(one.hp===30&&one.en===55&&one.lens===330&&one.visualAction==='lensActivate','mastered Lens visual changed its HP, energy, or duration');one.hit(20,0,'heavy',two,{hitstun:20});assert(['lensDodgeLeft','lensDodgeRight'].includes(one.visualAction),'Lens dodge visual was not selected');assert(one.hp===30&&one.lensAutoDodges===1,'automatic dodge took damage or used the wrong charge')}));
await test('Object Swap selects disappearance and reappearance without changing movement rules',()=>{const{one}=pair();const start=one.x;one.en=100;one.dash();assert(one.x!==start&&one.visualAction==='objectSwapDisappear','Object Swap visual or movement did not start');one.visualActionTimer=8;assert(resolveRrvvfoAnimation(one,one.world).name==='objectSwapReappear','Object Swap did not enter reappearance')});
await test('showcase sprites default On and old saves migrate to the stable pipeline',()=>{const fresh=loadRrvvfoVisualSettings(memoryStorage());assert(fresh.enabled,'fresh sprite setting did not default On');const legacy=memoryStorage();legacy.setItem(RRVVFO_VISUAL_SAVE_KEY,JSON.stringify({enabled:false,appearance:'down',quality:'full'}));assert(loadRrvvfoVisualSettings(legacy).enabled,'legacy prototype Off value did not migrate to the stable default')});
await test('explicit Rrvvfo sprite On preference persists',()=>{const storage=memoryStorage(),settings={...defaultRrvvfoVisualSettings(),enabled:true,quality:'reduced'};assert(saveRrvvfoVisualSettings(settings,storage),'settings did not save');const loaded=loadRrvvfoVisualSettings(storage);assert(storage.data[RRVVFO_VISUAL_SAVE_KEY]&&loaded.enabled&&loaded.quality==='reduced','explicit sprite On preference did not persist')});
await test('Bark and Wade matches preload their first-class sprite atlases',async()=>{const visuals=new FighterVisuals({settings:{...defaultRrvvfoVisualSettings(),enabled:true}}),result=await visuals.preloadForMatch(['wade','bark']);assert(result.ready&&!result.failed?.length,'Bark or Wade sprite preload failed');assert(!shouldShowRrvvfoLoadFailure(result,true),'ready Bark or Wade sprites displayed a load-failure warning')});
await test('genuine missing manifests report fallback status',async()=>{const missing=new FighterVisuals({settings:{...defaultRrvvfoVisualSettings(),enabled:true},manifestUrl:new URL('../assets/fighters/rrvvfo/missing.json',document.baseURI).href}),result=await missing.preloadForMatch(['rrvvfo']);assert(!result.ready&&result.reason==='load-failed'&&missing.status==='fallback','missing asset did not enter fallback state');assert(shouldShowRrvvfoLoadFailure(result,true),'genuine load failure did not request the fallback notice')});
await test('Player 1 Player 2 and Training appearances persist separately',()=>{const storage=memoryStorage(),settings=defaultRrvvfoVisualSettings();settings.appearances={player1:'down',player2:'up',trainingPlayer1:'up',trainingDummy:'down'};saveRrvvfoVisualSettings(settings,storage);const loaded=loadRrvvfoVisualSettings(storage);assert(loaded.appearances.player1==='down'&&loaded.appearances.player2==='up'&&loaded.appearances.trainingPlayer1==='up'&&loaded.appearances.trainingDummy==='down','per-player appearance slots were merged')});
await test('Hood Down remains the default appearance',()=>{const settings=defaultRrvvfoVisualSettings();assert(Object.values(settings.appearances).every(value=>value==='down'),'a fresh appearance slot did not default Hood Down')});
await test('Hood Up is labeled as a completed cosmetic appearance',()=>assert(RRVVFO_APPEARANCES.up.label==='Hood Up'&&!RRVVFO_APPEARANCES.up.prototype,'Hood Up was still labeled unfinished'));
await test('production mode exposes both completed Rrvvfo appearances',()=>{assert(!isDeveloperSpriteBuild({hostname:'phantaaura.github.io',search:''}),'GitHub Pages was treated as a developer build');const options=availableRrvvfoAppearances({developerMode:false,exposePrototype:false});assert(options.map(option=>option.id).join(',')==='down,up','production did not expose both completed appearances')});
await test('developer mode may expose Hood Up',()=>{assert(isDeveloperSpriteBuild({hostname:'localhost',search:''}),'localhost was not a developer build');const options=availableRrvvfoAppearances({developerMode:true,exposePrototype:true});assert(options.map(option=>option.id).join(',')==='down,up','developer setting did not expose Hood Up')});
await test('appearance is stored on each Fighter instance',()=>{const world=makeWorld(),down=new Fighter('rrvvfo',1,false,world,{appearance:'down'}),up=new Fighter('rrvvfo',2,false,world,{appearance:'up'});world.fighters=[down,up];assert(down.appearance==='down'&&up.appearance==='up','fighter appearances were global or missing')});
await test('Rrvvfo appearance never alters gameplay data',()=>{const downWorld=makeWorld(),upWorld=makeWorld(),down=new Fighter('rrvvfo',1,false,downWorld,{appearance:'down'}),up=new Fighter('rrvvfo',1,false,upWorld,{appearance:'up'});assert(down.c===up.c&&down.w===up.w&&down.h===up.h&&down.hp===up.hp&&down.en===up.en,'appearance changed stats or combat dimensions')});
await test('controller completion systems remain integrated',()=>{for(const feature of ['detectionPrompt','styleChoice','savedPreferences','connectionEvents','deviceAssignment','menuNavigation','pause','testScreen'])assert(CONTROLLER_COMPLETION_FEATURES.includes(feature),`controller completion omitted ${feature}`);for(const method of ['connect','disconnect','showPrompt','renderDevices','moveMenuFocus','renderTest'])assert(typeof ControllerManager.prototype[method]==='function',`ControllerManager lacks ${method}`)});
await test('controller styles assignments and custom preferences persist',()=>{const storage=memoryStorage(),settings=createDefaultControllerSettings();settings.promptSeen=true;settings.styles=['nintendo','playstation'];settings.assignments=[2,4];settings.customMappings[0].buttons.a=9;assert(saveControllerSettings(settings,storage),'controller settings did not save');const loaded=loadControllerSettings(storage);assert(storage.data[CONTROLLER_SETTINGS_KEY]&&loaded.promptSeen&&loaded.styles.join(',')==='nintendo,playstation'&&loaded.assignments.join(',')==='2,4'&&loaded.customMappings[0].buttons.a===9,'controller preferences did not round-trip')});
await test('controller detection and disconnection assignment stay deterministic',()=>{assert(detectControllerStyle({id:'Nintendo Switch Pro Controller'})==='nintendo','Nintendo detection failed');assert(detectControllerStyle({id:'Sony DualSense Wireless Controller'})==='playstation','PlayStation detection failed');assert(detectControllerStyle({id:'Xbox Wireless Controller'})==='xbox','Xbox detection failed');const pads=[{index:2},{index:4}],assigned=assignConnectedControllers(pads,[null,null]);assert(assigned.join(',')==='2,4','connected controllers were not assigned by player');const disconnected=assignConnectedControllers([{index:4}],assigned);assert(disconnected[0]===null&&disconnected[1]===4,'disconnection did not preserve the remaining player assignment')});
await test('InputManager honors explicit player device assignment',()=>{const pads=[makePad(),null,makePad()],input=new InputManager(()=>pads);input.setControllerStyle(1,'xbox');input.setControllerAssignment(1,2);pads[2].buttons[CONTROLLER_STYLES.xbox.buttons.a].pressed=true;input.poll();pads[2].buttons[CONTROLLER_STYLES.xbox.buttons.a].pressed=false;settleChordWindow(input);assert(input.consumeAction(1,'a'),'assigned Player 1 controller input was ignored')});
await test('round and Training cleanup clear visual-only state',()=>{const setup=pair();setup.world.fighterVisuals={resetFighter:fighter=>{fighter.__visualReset=true}};setup.one.visualAction='ultimateAttack';setup.one.visualActionTimer=99;setup.one.resetRuntime();assert(setup.one.__visualReset&&!setup.one.visualAction&&!setup.one.visualActionTimer,'fighter reset retained visual state');trainingState.enabled=true;resetTrainingWorld(setup.world);assert(setup.world.projectiles.length===0&&setup.world.effects.effects.length===0,'Training cleanup retained transient visuals')});

await test('Prototype 2.9A.36 uses one centralized build label',async()=>{
  assert(BUILD_VERSION===EXPECTED_BUILD,'build label is outdated');assert(SAVE_SCHEMA_VERSION===268,'save schema version is outdated');
  const [arena,manual,manualCss]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/story/combat-manual.js').then(r=>r.text()),fetchFresh('../css/interface-unified-29a6.css').then(r=>r.text())]);
  assert(arena.includes("import {BUILD_VERSION}")&&arena.includes('${BUILD_VERSION}'),'Arena still hard-codes a visible build label');
  assert(manual.includes("import {BUILD_VERSION}")&&manual.includes('manualBuildVersion')&&manual.includes('${BUILD_VERSION}'),'Sage Manual still hard-codes a visible build label');
  assert(!manualCss.includes("content:' • PROTOTYPE 2.9A.31'"),'legacy Sage Manual build label remains in CSS');
});
await test('Bark and Wade are first-class sprite fighters with complete manifests',async()=>{
  assert(SPRITE_FIGHTER_IDS.includes('bark')&&SPRITE_FIGHTER_IDS.includes('wade'),'Bark or Wade is missing from the sprite fighter pipeline');
  for(const [name,url,specials] of [['Bark',BARK_MANIFEST_URL,['rockShot','rockArmor','earthWall','groundQuake','seismicCounter']],['Wade',WADE_MANIFEST_URL,['lightningBlast','lightningDash','thunderstorm','lightningBeam']]]){
    const response=await fetchFresh(url);assert(response.ok,`${name} manifest did not load`);const manifest=await response.json();
    for(const animation of ['idle','fightingStance','run','jumpRise','fall','dash','light1','light2','light3','heavyStartup','launcherStartup','blockHold','perfectBlock','grab','hurtLight','knockdown','getUp','defeated','victory',...specials])assert(manifest.animations?.[animation],`${name} omitted ${animation}`);
  }
});
await test('all five cleaned fighter atlases have valid manifests and reachable images',async()=>{
  for(const fighter of ['rrvvfo','revvfo','bark','wade','sage']){
    const manifestResponse=await fetchFresh(`../assets/fighters/${fighter}/${fighter}-animations.json`);
    assert(manifestResponse.ok,`${fighter} cleaned manifest did not load`);
    const manifest=await manifestResponse.json();
    assert(validateSpriteManifest(manifest),`${fighter} cleaned manifest is invalid`);
    const imageResponse=await fetchFresh(new URL(manifest.image,new URL(`../assets/fighters/${fighter}/${fighter}-animations.json`,document.baseURI)));
    assert(imageResponse.ok,`${fighter} cleaned atlas image did not load`);
  }
});
await test('Sage uses the supplied full production sheet instead of twelve reused poses',async()=>{
  const manifest=await(await fetchFresh('../assets/fighters/sage/sage-animations.json')).json();
  const used=new Set(Object.values(manifest.animations).flatMap(animation=>animation.frames));
  assert(Object.keys(manifest.frames).length===36,'Sage does not have 36 production frames');
  assert(used.size>=32,'Sage animations still reuse too few poses');
  for(const animation of ['run','jumpRise','fall','light1','heavyActive','launcherActive','airLight','airHeavy','blockHold','perfectBlock','hurtHeavy','knockdown','getUp','predictionDodge','mentorCounter','sagePalm','ultimateAttack','defeated','victory'])assert(manifest.animations[animation],`Sage omitted ${animation}`);
});
await test('Classic fighter sprites are readable and off-model turnaround cells stay inactive',async()=>{
  for(const fighter of ['rrvvfo','revvfo','bark','wade','sage']){
    const manifest=await(await fetchFresh(`../assets/fighters/${fighter}/${fighter}-animations.json`)).json();
    assert(manifest.defaults.scale>=.7,`${fighter} remains too small in Classic`);
    assert(!(manifest.animations.turn?.frames||[]).some(frame=>frame.includes('turn_')),`${fighter} still activates an off-model turnaround cell`);
  }
  const css=await(await fetchFresh('../css/interface-unified-29a6.css')).text();
  assert(/#menuScreen \.roster\{\s*display:block!important/.test(css),'Classic roster can collapse back into the outer legacy grid');
  assert(/#menuScreen \.playableRoster\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important\}/.test(css),'playable Classic roster is not a four-card row');
});
await test('main menu exposes every implemented mode and honest Coming Later state',()=>{const ids=MAIN_MENU_MODES.map(mode=>mode.id);for(const id of ['story','cpu','local','training','settings','extras','credits'])assert(ids.includes(id),`main menu omitted ${id}`);const arcade=MAIN_MENU_MODES.find(mode=>mode.id==='arcade');assert(arcade.disabled&&/Coming Later/i.test(arcade.availability),'Arcade was presented as functional')});
await test('battle modes unlock progressively after Chapters 1, 2, and 3',()=>{
  const storage=memoryStorage(),chapter1=['rrvvfo-00','rrvvfo-01','rrvvfo-road'],chapter2=[...chapter1,'rrvvfo-02'],chapter3=[...chapter2,'rrvvfo-03'];
  const fresh=mainMenuModesForProgress(storage);
  assert(PROGRESS_LOCKED_MODE_IDS.every(id=>fresh.find(mode=>mode.id===id)?.locked),'fresh save did not visibly lock progression modes');
  assert(!modeUnlockedForProgress('cpu',{completedMissions:[]})&&modeUnlockedForProgress('training',{completedMissions:[]}),'fresh mode rules are wrong');
  storage.setItem(LOST_YEAR_SAVE_KEY,JSON.stringify({version:1,completedMissions:chapter1}));
  let modes=mainMenuModesForProgress(storage);assert(!modes.find(mode=>mode.id==='cpu').locked&&modes.find(mode=>mode.id==='local').locked,'Chapter 1 did not unlock only VS CPU');
  storage.setItem(LOST_YEAR_SAVE_KEY,JSON.stringify({version:1,completedMissions:chapter2}));
  modes=mainMenuModesForProgress(storage);assert(!modes.find(mode=>mode.id==='local').locked&&modes.find(mode=>mode.id==='arena').locked,'Chapter 2 did not unlock local multiplayer');
  storage.setItem(LOST_YEAR_SAVE_KEY,JSON.stringify({version:1,completedMissions:chapter3}));
  modes=mainMenuModesForProgress(storage);assert(!modes.find(mode=>mode.id==='arena').locked&&completedRrvvfoChapterCount({completedMissions:chapter3})===3,'Chapter 3 did not unlock Arena');
  assert(STORY_CHAPTERS_PER_CHARACTER===8&&!storyModeComplete({completedMissions:chapter3}),'three released chapters incorrectly completed the full eight-chapter Story');
});
await test('Story progress counts four released chapters against the planned eight chapters',()=>{
  const route=LOST_YEAR_ROUTES[0];
  assert(routeProgress(route,{completedMissions:[]})===0,'fresh Story progress was not zero');
  assert(routeProgress(route,{completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road']})===13,'Chapter 1 did not count as one of eight');
  const chapter3=['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03'];
  assert(routeProgress(route,{completedMissions:chapter3})===38,'full Chapter 3 did not count as the third of eight chapters');
  const chapter4=[...chapter3,'rrvvfo-04'];
  const chapter4Progress={completedMissions:chapter4,lastCheckpoint:'rrvvfo-04-complete',unlocks:['shadowLookout'],chapter4State:{chapterComplete:true,requiredCompleted:['hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved']}};
  assert(routeProgress(route,chapter4Progress)===50,'full Chapter 4 did not count as the fourth of eight chapters');
});
await test('hub camera snaps after teleports and keeps Rrvvfo centered during exploration',()=>{
  const battle={
    stage:{camera:{yawDeg:40,horizontalDistanceScale:.78,heightBase:360,heightDistanceScale:.18,targetHeight:38,jumpTargetScale:.16}},
    camera:{x:0,z:0,distance:900,eye:[0,0,0],target:[0,0,0]},
    cameraShake:0,
    fighters:[{x:900,y:0,z:700},{x:-400,y:-1200,z:-300}]
  };
  updateHubCamera(battle,{hubDistance:1120});
  assert(battle.camera.x===900&&battle.camera.z===700,'the hub camera did not catch up when Rrvvfo moved far away');
  battle.fighters[0].x=960;battle.fighters[0].z=720;
  updateHubCamera(battle,{hubDistance:1120});
  assert(battle.camera.x>900&&battle.camera.x<960,'nearby movement did not use smooth follow');
  snapHubCamera(battle,battle.fighters[0],{distance:1010});
  assert(battle.camera.x===960&&battle.camera.z===720&&battle.camera.distance===1010,'teleport camera snap was inaccurate');
});
await test('hub camera lifts or pulls forward when solid scenery blocks Rrvvfo',()=>{
  const stage={scenery:{boxes:[{x:0,y:190,z:500,sx:240,sy:380,sz:180,alpha:1}]}};
  const target=[0,55,0],eye=[0,540,1000],resolved=resolveHubCameraOcclusion(stage,target,eye);
  assert(resolved!==eye&&(resolved[1]>eye[1]||resolved[2]<eye[2]),'hub camera ignored blocking scenery');
  assert(resolveHubCameraOcclusion({scenery:{boxes:[]}},target,eye)===eye,'unblocked camera position changed');
});
await test('hub camera keeps the chosen exploration angle and recenters only when disabled or fighting',()=>{
  const state=createHubCameraLookState();
  applyHubCameraLook(state,{rightX:.8,rightY:-.55,mouseX:24,mouseY:-12,now:100});
  assert(state.yawOffset>0&&state.pitchOffset>0,'manual hub camera input did not move the view');
  const movedYaw=state.yawOffset,movedPitch=state.pitchOffset;
  applyHubCameraLook(state,{now:2200});
  assert(state.yawOffset===movedYaw&&state.pitchOffset===movedPitch,'idle exploration camera unexpectedly recentered');
  applyHubCameraLook(state,{now:2250,enabled:false});
  assert(state.yawOffset<movedYaw&&state.pitchOffset<movedPitch,'disabled free camera did not return toward default framing');
  applyHubCameraLook(state,{rightX:1,rightY:1,mouseX:100,mouseY:100,now:2300,frameFight:true});
  assert(state.yawOffset<movedYaw,'arena fight framing accepted manual hub-camera input');
});
await test('mouse and trackpad camera look starts only from a left-button canvas drag',()=>{
  const listeners={},canvasClasses=new Set(),rootClasses=new Set();
  const canvas={classList:{add:value=>canvasClasses.add(value),remove:value=>canvasClasses.delete(value)},addEventListener:(name,fn)=>{listeners[name]=fn},removeEventListener:()=>{},setPointerCapture:()=>{},hasPointerCapture:()=>false,releasePointerCapture:()=>{}};
  const root={querySelector:selector=>selector==='canvas'?canvas:null,classList:{toggle:(value,on)=>on?rootClasses.add(value):rootClasses.delete(value)}};
  const battle={root,stage:{camera:{yawDeg:40,horizontalDistanceScale:.78,heightBase:360,heightDistanceScale:.18,targetHeight:38,jumpTargetScale:.16},scenery:{boxes:[]}},camera:{x:0,z:0,distance:1010,eye:[0,0,0],target:[0,0,0]},cameraShake:0,fighters:[{x:0,y:0,z:0}]};
  updateHubCamera(battle,{hubDistance:1010});
  const base=[...battle.camera.eye];
  listeners.pointermove({pointerId:7,movementX:40,movementY:-20,clientX:140,clientY:80,preventDefault:()=>{}});
  updateHubCamera(battle,{hubDistance:1010});
  assert(JSON.stringify(battle.camera.eye)===JSON.stringify(base),'hovering over the canvas rotated the camera without dragging');
  listeners.pointerdown({target:{},button:0,pointerType:'mouse',pointerId:7,clientX:100,clientY:100,defaultPrevented:false,preventDefault:()=>{}});
  listeners.pointermove({pointerId:7,movementX:40,movementY:-20,clientX:140,clientY:80,preventDefault:()=>{}});
  updateHubCamera(battle,{hubDistance:1010});
  assert(JSON.stringify(battle.camera.eye)===JSON.stringify(base),'a UI-originated pointer changed the camera');
  listeners.pointerdown({target:canvas,button:0,pointerType:'mouse',pointerId:7,clientX:100,clientY:100,defaultPrevented:false,preventDefault:()=>{}});
  listeners.pointermove({pointerId:7,movementX:40,movementY:-20,clientX:140,clientY:80,preventDefault:()=>{}});
  updateHubCamera(battle,{hubDistance:1010});
  assert(JSON.stringify(battle.camera.eye)!==JSON.stringify(base)&&canvasClasses.has('hubCameraDragging'),'canvas click-and-drag did not rotate the hub camera');
  listeners.pointerup({pointerId:7});
  assert(!canvasClasses.has('hubCameraDragging'),'camera drag remained active after pointer release');
});
await test('Chapter hubs have distinct scenery while the tournament fight arena stays separate',()=>{
  const road=getArenaStage('training-road'),hub=getArenaStage('tournament-hub'),night=getArenaStage('after-hours-tournament'),arena=getArenaStage('tournament');
  assert(road.scenery.boxes.length>=90,'Chapter 1 training sanctuary is visually underdeveloped');
  assert(hub.floor.surface.color==='#cbb98f'&&hub.floor.grid?.stepX===120&&hub.floor.grid?.stepZ===120&&hub.scenery.boxes.length>=120,'Chapter 2 does not read as a tiled tournament plaza');
  assert(night.scenery!==hub.scenery&&night.scenery.boxes.length>=120&&night.scenery.boxes.some(box=>box.color==='#74d7e4'),'Chapter 3 after-hours hub is only a palette alias');
  assert(arena.id==='tournament'&&arena.bounds.maxX===750&&arena.floor.surface.color==='#d7c79f','the arena fight map was changed with the hub');
});
await test('Story startup failure does not create false Continue progress',async()=>{
  const source=await(await fetchFresh('../js/story/lost-year-story.js')).text();
  const openRoute=source.slice(source.indexOf('openRoute(){'),source.indexOf('showRouteHome('));
  const startStep=source.slice(source.indexOf('startStep(stepId'),source.indexOf('export function openLostYearStory'));
  assert(!openRoute.includes('saveLostYearProgress'),'opening the route saves progress before the chapter exists');
  assert(startStep.indexOf('starter({...starterOptions')<startStep.indexOf('routeStarted:true'),'chapter progress is saved before successful startup');
  assert(startStep.includes('saveLostYearProgress(progressBeforeStart)'),'failed startup does not restore the previous save');
});
await test('Chapter 2 hub animation timing advances in simulation updates only',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-mission-2.js')).text();
  assert(source.includes('this.hubAnimationClock+=Math.max(0,dt)*1000'),'hub actors do not use elapsed simulation time');
  assert(!source.includes('actor.animationClock+=16.67'),'render refresh rate still advances hub animation');
});
await test('Tangai Dojo has a detailed but compact 3D stage layout',()=>{
  const dojo=getArenaStage('dojo'),tournament=getArenaStage('tournament');
  assert(dojo.scenery.boxes.length>=40,'Tangai Dojo still has placeholder scenery');
  assert(dojo.bounds.maxX-dojo.bounds.minX<tournament.bounds.maxX-tournament.bounds.minX,'Tangai Dojo became as large as the Global Tournament');
  assert(dojo.floor.centerMark.color==='#c82928','Tangai Dojo crest palette is missing');
});
await test('main menu mode descriptions include player and availability data',()=>{for(const mode of MAIN_MENU_MODES){assert(mode.label&&mode.description&&mode.players&&mode.availability,`${mode.id} preview is incomplete`)}});
await test('post-match options include every requested destination',()=>{assert(RESULT_ACTIONS.map(action=>action.id).join(',')==='rematch,character,stage,mode,main','results actions are incomplete');const model=buildResultsModel({winner:'Rrvvfo',durationMs:61500,players:[{damage:25}]});assert(model.duration==='1:02'&&model.actions.length===5,'result summary did not retain actions or duration')});
await test('match statistics track actual damage and both player summaries',()=>{let clock=1000;const stats=new MatchStatistics(()=>clock);stats.recordDamage(1,8.5,2,13);stats.add(1,'perfectBlocks');stats.add(2,'throws');clock=62500;const summary=stats.finish([{hp:72,en:40},{hp:31,en:12}]);assert(summary.players[0].damage===8.5&&summary.players[0].highestCombo===2&&summary.players[0].perfectBlocks===1,'Player 1 stats were wrong');assert(summary.players[1].throws===1&&summary.players[1].remainingHealth===31,'Player 2 stats were wrong');assert(formatMatchDuration(summary.durationMs)==='1:02','duration formatting was wrong')});
await test('pause is the single simulation gate for combat AI timers and cooldowns',()=>{assert(simulationCanAdvance('playing',false),'live match could not advance');assert(!simulationCanAdvance('playing',true),'paused match advanced');assert(!simulationCanAdvance('over',false),'completed match advanced');assert(!requiresRestartConfirmation('training')&&requiresRestartConfirmation('cpu')&&requiresRestartConfirmation('local'),'quick restart confirmation policy is wrong')});
await test('pause menu contains universal and Training-only actions',()=>{const ids=PAUSE_ACTIONS.map(action=>action.id);for(const id of ['resume','moves','controls','restart','character','stage','settings','quit'])assert(ids.includes(id),`pause omitted ${id}`);assert(PAUSE_ACTIONS.find(action=>action.id==='training')?.trainingOnly,'Training settings were not conditional');assert(PAUSE_ACTIONS.find(action=>action.id==='touch')?.touchOnly,'mobile controls were not conditional')});
await test('adaptive move list follows keyboard Nintendo Xbox PlayStation touch and custom prompts',()=>{const input=new InputManager(()=>[]);const expected={nintendo:'B',xbox:'X',playstation:'Square'};for(const [style,label] of Object.entries(expected)){input.setControllerStyle(1,style);const model=adaptiveMoveList({fighterId:'rrvvfo',input,side:1,device:'controller'});assert(model.entries[0][1].startsWith(`${label}, ${label}`),`${style} basic combo was outdated`);assert(model.entries[2][1].includes(`Up + ${input.controllerMapping(1).labels.h}`),`${style} launcher was outdated`)}const keyboard=adaptiveMoveList({fighterId:'rrvvfo',input:new InputManager(()=>[]),side:1,device:'keyboard'});assert(keyboard.entries[0][1]==='J, J, J','keyboard prompts were wrong');const touch=adaptiveMoveList({fighterId:'rrvvfo',input,side:1,device:'touch'});assert(touch.entries[0][1]==='Light, Light, Light'&&touch.entries[2][1].includes('Launcher'),'touch prompts were wrong');input.setControllerStyle(1,'custom');input.setCustomButton(1,'a',9);const custom=adaptiveMoveList({fighterId:'rrvvfo',input,side:1,device:'controller'});assert(custom.entries[0][1].startsWith('Button 10'),'custom saved binding was not shown')});
await test('Rrvvfo move list states costs restrictions and cosmetic appearance',()=>{const model=adaptiveMoveList({fighterId:'rrvvfo',input:new InputManager(()=>[]),device:'keyboard'}),notes=model.notes.join(' ');assert(/full energy/i.test(notes)&&/four clones/.test(notes)&&/5s cooldown/.test(notes)&&/25 HP/.test(notes)&&/90 energy/.test(notes),'Rrvvfo costs or restrictions are inaccurate');assert(/cosmetic only/.test(model.cosmetic),'appearance parity was omitted')});
await test('QOL settings sanitize and persist audio HUD accessibility video and hub-camera values',()=>{const storage=memoryStorage(),settings=sanitizeQolSettings({gameplay:{hubCamera:'off',hubCameraSensitivity:1.45},audio:{master:44,music:33,sfx:22,ui:11,voice:55,mute:true},hud:{mode:'compact'},video:{quality:'low'},accessibility:{cameraShake:'off',highContrastHud:true}});assert(saveQolSettings(settings,storage),'QOL settings did not save');const loaded=loadQolSettings(storage);assert(storage.data[QOL_SETTINGS_KEY]&&loaded.gameplay.hubCamera==='off'&&loaded.gameplay.hubCameraSensitivity===1.45&&loaded.audio.master===44&&loaded.audio.music===33&&loaded.audio.mute&&loaded.hud.mode==='compact'&&loaded.video.quality==='low'&&loaded.accessibility.cameraShake==='off'&&loaded.accessibility.highContrastHud,'QOL settings did not round-trip')});
await test('visual accessibility settings cannot alter combat damage or timing',()=>{const before=calculateFinalDamage({base:13,hit:3,kind:'heavy',defense:1}).final;sanitizeQolSettings({accessibility:{cameraShake:'off',screenFlash:'off',hitFlash:'off',largerHudText:true}});const after=calculateFinalDamage({base:13,hit:3,kind:'heavy',defense:1}).final;assert(before===after&&DEFAULT_QOL_SETTINGS.accessibility.cameraShake==='full','accessibility mutated combat balance')});
await test('combat notifications honor mode importance and repeat cooldown',()=>{let now=1000,mode='full';const notifications=new NotificationSystem(null,{mode:()=>mode,now:()=>now});assert(notifications.push('A',{key:'a'}),'first notice was rejected');assert(!notifications.push('A',{key:'a'}),'held action spammed notices');now+=800;assert(notifications.push('A',{key:'a'}),'notice cooldown never recovered');mode='important';assert(!notifications.push('minor',{key:'minor'}),'important-only displayed a minor notice');assert(notifications.push('major',{key:'major',important:true}),'important notice was suppressed');mode='off';assert(!notifications.push('off',{important:true}),'Off displayed a notice')});
await test('versioned save export and valid import preserve all known data',()=>{const source=memoryStorage();source.setItem('pxSave',JSON.stringify({cleared:true}));source.setItem('pxQolSettingsV1',JSON.stringify({version:1}));const exported=createSaveExport(source);assert(exported.schema===SAVE_SCHEMA_VERSION&&exported.data.pxSave,'export omitted progress');const target=memoryStorage(),result=importSaveText(JSON.stringify(exported),target);assert(result.ok&&JSON.parse(target.getItem('pxSave')).cleared,'valid save did not import');assert(JSON.parse(stringifySave(source)).data.pxQolSettingsV1,'string export was invalid')});
await test('invalid save import is rejected without changing the current save',()=>{const storage=memoryStorage();storage.setItem('pxSave','{"cleared":true}');const invalid=importSaveText('{not json',storage);assert(!invalid.ok&&storage.getItem('pxSave')==='{"cleared":true}','malformed import damaged the current save');const unknown=validateSaveImport({data:{evil:'<script>'}});assert(!unknown.valid,'unknown imported key was accepted')});
await test('save reset groups keep progress separate from settings and Training presets',()=>{const storage=memoryStorage();for(const key of SAVE_EXPORT_KEYS)storage.setItem(key,'{}');resetSaveGroup('settings',storage);assert(storage.getItem('pxSave')!==null&&storage.getItem('pxQolSettingsV1')===null,'settings reset removed progress or kept settings');resetSaveGroup('training',storage);assert(storage.getItem(TRAINING_PRESET_KEY)===null,'Training preset reset failed')});
await test('Training presets save and load isolated Training configuration',()=>{const storage=memoryStorage(),state={...trainingState,infiniteHealth:false,dummy:'random'};const name=saveTrainingPreset('Defense Lab',state,storage);assert(name==='Defense Lab'&&loadTrainingPresets(storage)['Defense Lab'].dummy==='random','Training preset did not save');const next={...trainingState,infiniteHealth:true,dummy:'never'};assert(applyTrainingPreset('Defense Lab',next,storage)&&next.infiniteHealth===false&&next.dummy==='random','Training preset did not load')});
await test('Training position resource and cleanup shortcuts reset transient state',()=>{const setup=pair();setup.one.hp=12;setup.one.en=3;setup.one.guard=4;setup.one.specialCd=50;setup.world.projectiles.push({});setup.world.effects.add({t:'x',l:5});assert(resetTrainingPosition(setup.world,'left'),'left-wall reset failed');assert(setup.one.x===35&&setup.two.x===180,'left-wall positions were wrong');const oldOne=setup.one.x;swapTrainingSides(setup.world);assert(setup.two.x===oldOne,'side swap failed');refillTraining(setup.world,'all');assert(setup.one.hp===100&&setup.one.en===100&&setup.one.guard===setup.one.guardMax,'resource refill failed');setup.one.specialCd=50;clearTrainingState(setup.world,'cooldowns');assert(setup.one.specialCd===0,'cooldowns were not cleared');clearTrainingState(setup.world,'projectiles');assert(setup.world.projectiles.length===0,'projectiles were not cleared')});
await test('saved controller dead zones filter drift without clearing keyboard',()=>{const pad=makePad(),input=new InputManager(()=>[pad]);input.setControllerDeadZone(1,.3);pad.axes[0]=.25;input.poll();assert(!input.actionIsDown(1,'r'),'stick drift crossed saved dead zone');input.setKeyboard('KeyA',true);input.poll();assert(input.actionIsDown(1,'l'),'controller polling cleared keyboard movement');pad.axes[0]=.5;input.poll();assert(input.actionIsDown(1,'r'),'intentional stick movement was filtered')});
await test('first-time hints use active prompts and can be dismissed or reset',()=>{const storage=memoryStorage(),input=new InputManager(()=>[]),hints=new FirstTimeHints({input,storage});const hint=hints.next();assert(/Keyboard/.test(hint),'hint did not detect input style');hints.dismiss();assert(storage.getItem(HINTS_DISMISSED_KEY)==='1'&&hints.next()===null,'dismissed hints continued');hints.reset();assert(storage.getItem(HINTS_DISMISSED_KEY)===null&&hints.next(),'hint reset failed')});
await test('HUD model reports Rrvvfo cooldowns active volley Lens and breaker state',()=>{const{one}=pair();one.agonyActiveVolley=true;one.lens=121;one.dashCd=61;one.ultCd=180;one.throwProtection=20;one.breakerUsed=true;const model=fighterHudModel(one),text=cooldownText(model);assert(/SHOTS VOLLEY ACTIVE/.test(text)&&/LENS 3s/.test(text)&&/SWAP 2s/.test(text)&&/ULT 3s/.test(text),'Rrvvfo cooldown HUD is incomplete');assert(/LENS COSTS 25 HP/.test(text)&&!/50 HP/.test(text),'Lens HUD cost disagrees with combat');assert(model.statuses.includes('THROW PROTECTION')&&!model.breakerReady,'HUD omitted protection or breaker state')});
await test('audio manager preserves separate volume and mute settings',()=>{const audio=new AudioManager({master:40,music:30,sfx:20,ui:10,voice:5,mute:true});assert(audio.settings.master===40&&audio.settings.music===30&&audio.settings.sfx===20&&audio.settings.ui===10&&audio.settings.voice===5&&audio.settings.mute,'audio channels did not configure independently');audio.configure({mute:false,ui:72});assert(!audio.settings.mute&&audio.settings.ui===72,'audio settings could not update without replacing the manager')});
await test('loading manager exposes progress retry return and safe no-root fallback',()=>{const loading=new LoadingManager(null);assert(typeof loading.start==='function'&&typeof loading.set==='function'&&typeof loading.finish==='function'&&typeof loading.fail==='function','loading recovery API is incomplete');loading.start();loading.set(50);loading.finish();loading.fail()});
await test('main page contains first-time start polished menu recovery and confirmation shells',async()=>{const html=await(await fetchFresh('../index.html')).text();for(const id of ['startScreen','mainMenuScreen','quickContinue','pauseMenu','resultsScreen','loadingScreen','confirmDialog'])assert(html.includes(`id="${id}"`),`index omitted ${id}`);assert(/ARCADE MODE/.test(html)===false,'static markup should source Arcade availability from menu data');assert(html.includes('viewport-fit=cover'),'safe-area viewport support was removed')});
await test('touch layout lock defaults on and survives saved settings',()=>{const settings=createDefaultTouchSettings();assert(settings.layoutLocked,'touch layout did not default locked');const storage=memoryStorage();settings.layoutLocked=false;saveTouchSettings(settings,storage);assert(loadTouchSettings(storage,createDefaultTouchSettings).layoutLocked===false,'touch layout lock did not persist')});
await test('video particle caps reduce visuals without changing effect semantics',()=>{const effects=new EffectSystem().configure({particleCap:50});effects.burst(10,10,'#fff',200);assert(effects.particles.length===50,'low quality did not cap particles');effects.update();assert(effects.particles.length<=50,'particle cap created extra runtime particles')});

await test('mobile presentation defaults ask once and persist portrait fullscreen choices',()=>{const storage=memoryStorage(),settings=createMobilePresentationSettings();assert(settings.portraitPrompt==='show'&&settings.fullscreenPrompt==='ask','fresh mobile prompts were not enabled');settings.portraitPrompt='never';settings.fullscreenPrompt='never';assert(saveMobilePresentationSettings(settings,storage),'mobile presentation settings did not save');const loaded=loadMobilePresentationSettings(storage);assert(storage.data[MOBILE_PRESENTATION_KEY]&&loaded.portraitPrompt==='never'&&loaded.fullscreenPrompt==='never','mobile presentation settings did not round-trip')});
await test('portrait recommendation respects touch orientation and Don’t Show Again',()=>{assert(shouldRecommendPortrait(true,true,'show'),'touch portrait did not recommend landscape');assert(!shouldRecommendPortrait(true,false,'show'),'landscape displayed the portrait recommendation');assert(!shouldRecommendPortrait(false,true,'show'),'desktop portrait displayed a mobile recommendation');assert(!shouldRecommendPortrait(true,true,'never'),'dismissed portrait prompt returned')});
await test('rotating into portrait pauses through the prompt hook and preserves the active manager',()=>{const classes=new Set(['hidden']),root={querySelector:()=>null,classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value)}},view={innerWidth:390,innerHeight:844},settings=createMobilePresentationSettings();let prompts=0,dismissals=0,layouts=0;const manager=new OrientationManager({root,view,settings,onPrompt:()=>prompts++,onDismiss:()=>dismissals++,onLayout:()=>layouts++});manager.start({touch:true});assert(prompts===1&&!classes.has('hidden'),'portrait prompt hook did not run');view.innerWidth=844;view.innerHeight=390;manager.handleChange({width:844,height:390});assert(classes.has('hidden')&&dismissals===1&&layouts===1,'landscape transition did not close the prompt or preserve manager state')});
await test('responsive layout preserves a 16:9 logical combat canvas',()=>{const layout=calculateResponsiveLayout({width:1920,height:1080});assert(layout.profile==='widescreen','16:9 was not classified as widescreen');assert(layout.displayWidth===1920&&layout.displayHeight===1080,'16:9 display dimensions were wrong');assert(layout.logicalWidth===LOGICAL_GAME_WIDTH&&layout.logicalHeight===LOGICAL_GAME_HEIGHT&&!layout.stretched,'logical gameplay canvas changed')});
await test('19.5:9 touch layout reserves a landscape action-control zone',()=>{const layout=calculateResponsiveLayout({width:844,height:390,touch:true,safeLeft:8,safeRight:8,safeBottom:18});assert(layout.profile==='mobile-landscape','19.5:9 phone was not mobile landscape');assert(layout.reserveBottom>0&&layout.displayHeight<=layout.availableHeight-layout.reserveBottom+.001,'bottom control zone was not reserved');assert(layout.displayWidth/layout.displayHeight===LOGICAL_GAME_WIDTH/LOGICAL_GAME_HEIGHT,'mobile stage was horizontally stretched')});
await test('tablet layout remains safe-area aware',()=>{const layout=calculateResponsiveLayout({width:1180,height:820,touch:true,tablet:true,safeLeft:20,safeRight:20,safeTop:16,safeBottom:24});assert(layout.profile==='tablet','tablet profile was not selected');assert(layout.availableWidth===1140&&layout.availableHeight===780,'tablet safe area was ignored');assert(layout.displayWidth<=layout.availableWidth&&layout.displayHeight<=layout.availableHeight,'tablet stage escaped safe bounds')});
await test('ultrawide layout uses side presentation without range advantage',()=>{const layout=calculateResponsiveLayout({width:3440,height:1440});assert(classifyDisplay(3440,1440)==='ultrawide'&&layout.profile==='ultrawide','ultrawide profile was not selected');assert(layout.letterboxX>0,'ultrawide did not reserve side artwork space');assert(layout.logicalWidth===960&&layout.logicalHeight===540&&!layout.stretched,'ultrawide changed gameplay boundaries')});
await test('desktop hotbar reserves presentation space without changing gameplay bounds',()=>{const layout=calculateResponsiveLayout({width:1280,height:720,desktopHotbar:true});assert(layout.reserveBottom===112,'desktop hotbar did not reserve its HUD strip');assert(layout.displayHeight<=608.001&&layout.logicalWidth===960&&layout.logicalHeight===540&&!layout.stretched,'desktop hotbar resized authoritative combat space')});
await test('narrow fallback keeps HUD and stage inside the available display',()=>{const layout=calculateResponsiveLayout({width:520,height:640,safeTop:30,safeBottom:24});assert(layout.profile==='portrait','narrow portrait profile was wrong');assert(layout.displayWidth<=layout.availableWidth&&layout.displayHeight<=layout.availableHeight,'narrow stage escaped the viewport');assert(layout.letterboxX>=0&&layout.scale>0,'narrow layout produced invalid geometry')});
await test('Rrvvfo hotbar uses the exact five requested default slots',()=>{const entries=abilitiesForFighter('rrvvfo');assert(entries.map(entry=>entry.action).join(',')==='fireBlast,shotsOfAgony,objectSwap,lensOfTruth,ultimate',`wrong Rrvvfo actions: ${entries.map(entry=>entry.action).join(',')}`);assert(entries.map(entry=>entry.label).join(',')==='Fire Blast,Shots of Agony,Object Swap,Lens of Truth,Solar Weave','wrong Rrvvfo labels');assert(defaultAbilityOrder('rrvvfo').length===5,'Rrvvfo hotbar did not have five slots')});
await test('every roster fighter receives a data-driven ability hotbar',()=>{for(const id of ROSTER_IDS){const entries=FIGHTER_ABILITY_HOTBARS[id];assert(Array.isArray(entries)&&entries.length>=3&&entries.length<=5,`${id} hotbar was missing or oversized`);assert(entries.every(entry=>entry.action&&entry.label&&Number.isFinite(entry.energy)),`${id} hotbar entry was incomplete`)}});
await test('Rrvvfo hotbar advertises authoritative costs and restrictions',()=>{const byId=Object.fromEntries(abilitiesForFighter('rrvvfo').map(entry=>[entry.id,entry]));assert(byId.fireBlast.energy===28,'Fire Blast energy changed');assert(byId.shotsOfAgony.energy===100&&byId.shotsOfAgony.cooldown===300,'Shots cost or five-second cooldown changed');assert(byId.lensOfTruth.energy===60&&byId.lensOfTruth.hp===25&&byId.lensOfTruth.cooldown===300,'Lens cost or cooldown changed');assert(byId.ultimate.energy===90&&byId.ultimate.ultimate,'ultimate status was missing')});
await test('Shots hotbar reports ACTIVE and its five-second cooldown',()=>{const{one}=pair(),entry=abilitiesForFighter('rrvvfo')[1];one.agonyActiveVolley=true;let status=abilityStatus(one,entry,one.world);assert(status.active&&!status.available&&status.activeText==='ACTIVE','active volley state was not shown');one.agonyActiveVolley=false;one.agonyCooldown=300;status=abilityStatus(one,entry,one.world);assert(!status.available&&status.cooldownText==='5s'&&status.fill===1,'Shots cooldown display was inaccurate')});
await test('Lens hotbar reports duration HP cost and unsafe payment warning',()=>withLocalStorageValue('pxLensMasteryV1','0',storage=>{const{one}=pair(),entry=abilitiesForFighter('rrvvfo')[3];one.hp=20;one.lens=181;const active=abilityStatus(one,entry,one.world);assert(active.active&&active.activeText.startsWith('4s')&&/HP FLOOR: 1/.test(active.hpWarning),'Lens active duration or HP floor warning was wrong');one.lens=0;one.lensCooldown=0;one.en=59;const unavailable=abilityStatus(one,entry,one.world);assert(!unavailable.available&&/60 Energy/.test(unavailable.reason),'Lens energy rejection was missing')}));
await test('Object Swap hotbar rejects a missing legal destination',()=>{const{world,one}=pair();one.face=1;one.x=world.width-one.w-15;const entry=abilitiesForFighter('rrvvfo')[2],status=abilityStatus(one,entry,world);assert(!status.available&&status.reason==='No legal swap destination','Object Swap allowed a zero-distance destination')});
await test('ultimate hotbar reflects resource and cinematic legality',()=>{const{world,one}=pair(),entry=abilitiesForFighter('rrvvfo')[4];one.en=89;assert(/90 Energy/.test(abilityStatus(one,entry,world).reason),'ultimate energy requirement was missing');one.en=100;world.cinematic.active=true;assert(!abilityStatus(one,entry,world).available,'ultimate remained available during a cinematic')});
await test('ability slot order saves independently for each fighter',()=>{const storage=memoryStorage(),settings=createDefaultAbilityHotbarSettings();moveAbilitySlot(settings,'rrvvfo','lensOfTruth',0);moveAbilitySlot(settings,'bark','barkCounter',0);assert(saveAbilityHotbarSettings(settings,storage),'hotbar settings did not save');const loaded=loadAbilityHotbarSettings(storage);assert(storage.data[ABILITY_HOTBAR_KEY]&&loaded.orders.rrvvfo[0]==='lensOfTruth'&&loaded.orders.bark[0]==='barkCounter','fighter hotbar orders were merged or lost')});
await test('hotbar reordering changes display order only and restores defaults',()=>{const settings=createDefaultAbilityHotbarSettings(),source=abilitiesForFighter('rrvvfo'),before=source.map(entry=>[entry.id,entry.energy,entry.cooldown]);assert(moveAbilitySlot(settings,'rrvvfo','ultimate',0),'ultimate could not move');assert(orderedAbilities('rrvvfo',settings)[0].id==='ultimate','moved slot did not become first');assert(JSON.stringify(source.map(entry=>[entry.id,entry.energy,entry.cooldown]))===JSON.stringify(before),'reorder mutated ability balance data');restoreAbilityOrder(settings,'rrvvfo');assert(orderedAbilities('rrvvfo',settings)[0].id==='fireBlast','restore defaults failed')});
await test('hotbar prompts adapt to keyboard touch Nintendo Xbox PlayStation and custom mappings',()=>{const input=new InputManager(()=>[]),fire=abilitiesForFighter('rrvvfo')[0],ultimate=abilitiesForFighter('rrvvfo')[4];assert(hotbarPrompt(input,1,fire,'keyboard',1)==='1'&&hotbarPrompt(input,1,fire,'mouse',1)==='1'&&hotbarPrompt(input,1,fire,'touch',1)==='TAP','desktop or touch hotbar prompt was wrong');for(const [style,activateLabel] of [['nintendo','ZR'],['xbox','RT'],['playstation','R2']]){input.setControllerStyle(1,style);assert(hotbarPrompt(input,1,fire,'controller',1)===activateLabel,`${style} selected-ability prompt was wrong`);assert(hotbarPrompt(input,1,ultimate,'controller',5)===activateLabel,`${style} ultimate-slot prompt was wrong`)}input.setControllerStyle(1,'custom');input.setCustomButton(1,'u',9);assert(hotbarPrompt(input,1,fire,'controller',1)==='Button 10','custom saved activation prompt was ignored')});
await test('holding a hotbar slot opens information without activating it',()=>{const hotbar=new AbilityHotbar({root:null});let activations=0;hotbar.activateSlot=()=>{activations++;return true};hotbar.hold={pointerId:7,shown:true,button:{dataset:{slot:'1'}}};hotbar.pointerUp({pointerId:7,preventDefault:()=>{}});assert(HOTBAR_INFO_HOLD_MS>=400&&HOTBAR_INFO_HOLD_MS<=600,'hold threshold is not a brief intentional hold');assert(activations===0,'releasing an information hold activated the ability')});
await test('unavailable hotbar warnings are throttled and never spend resources',()=>{const setup=pair(),clock={now:1000},notifier=new NotificationSystem(null,{now:()=>clock.now}),input=new InputManager(()=>[]);setup.one.en=0;let accepted=0;const hotbar=new AbilityHotbar({root:null,input,getFighter:()=>setup.one,getWorld:()=>setup.world,notify:(message,options)=>{if(notifier.push(message,options))accepted++}});hotbar.setFighter('rrvvfo');assert(!hotbar.activateSlot(1,'touch')&&!hotbar.activateSlot(1,'touch'),'unavailable Fire Blast activated');assert(accepted===1,'held or repeated unavailable input spammed its warning');assert(setup.one.en===0&&setup.world.projectiles.length===0,'rejected hotbar move spent energy or created a projectile')});
await test('desktop number-slot actions remain additive to Grab and selected-ability bindings',()=>{const input=new InputManager(()=>[]);input.queueGameplayAction(1,'fireBlast','keyboard');assert(input.consumeAction(1,'fireBlast'),'number-slot semantic action did not buffer');keyboardTap(input,'KeyU');assert(input.consumeAction(1,'s'),'U no longer produced Grab');keyboardTap(input,'KeyO');assert(input.consumeAction(1,'u'),'O no longer produced selected-ability activation')});
await test('shared hotbar selection cycles and activates the highlighted ability',()=>{const input=new InputManager(()=>[]),setup=pair();setup.one.en=100;const hotbar=new AbilityHotbar({root:null,input,getFighter:()=>setup.one,getWorld:()=>setup.world,getDevice:()=> 'controller'});hotbar.setFighter('rrvvfo');assert(hotbar.selectedSlot===1,'hotbar did not start on slot 1');hotbar.moveSelection(1);assert(hotbar.selectedSlot===2,'hotbar did not move to slot 2');assert(hotbar.activateSelected('controller'),'selected hotbar ability did not activate');assert(input.consumeAction(1,'shotsOfAgony'),'highlighted slot queued the wrong ability')});
await test('hotbar Fire Blast routes to the exact move even at close range',()=>{const input=new InputManager(()=>[]),setup=pair(),command={down:action=>input.actionIsDown(1,action),pressed:action=>input.consumeAction(1,action)};input.queueGameplayAction(1,'fireBlast','touch');setup.one.update(command);assert(setup.world.projectiles.length===1,'Fire Blast slot did not create one projectile');assert(!setup.one.agonyActiveVolley,'Fire Blast slot incorrectly became contextual Shots');assert(setup.one.specialCd>0&&setup.one.en<73,'Fire Blast cooldown or energy cost was not applied')});
await test('hotbar Shots preserves four clones simultaneous fire cost and active lock',()=>{const input=new InputManager(()=>[]),setup=pair();setup.one.en=100;setup.world.timers=new ManualTimers();const command={down:action=>input.actionIsDown(1,action),pressed:action=>input.consumeAction(1,action)};input.queueGameplayAction(1,'shotsOfAgony','touch');setup.one.update(command);const clones=setup.world.effects.effects.filter(effect=>effect.t==='agonyClone');assert(clones.length===4&&setup.one.agonyActiveVolley,'Shots slot did not summon exactly four active clones');assert(Math.abs(setup.one.en)<.001,'Shots regenerated energy during the committed volley');input.queueGameplayAction(1,'shotsOfAgony','touch');setup.one.update(command);assert(setup.world.effects.effects.filter(effect=>effect.t==='agonyClone').length===4,'active volley allowed more clones');setup.world.timers.flush();assert(setup.world.projectiles.filter(projectile=>projectile.volleyOwner===setup.one).length===4,'clones did not fire four projectiles together');assert(setup.one.agonyCooldown===300,'Shots cooldown did not begin at five seconds after firing')});
await test('hotbar Lens preserves the fair 60 Energy 25 HP cost',()=>withLocalStorageValue('pxLensMasteryV1','0',storage=>{const input=new InputManager(()=>[]),setup=pair(),command={down:action=>input.actionIsDown(1,action),pressed:action=>input.consumeAction(1,action)};setup.one.hp=42;setup.one.en=100;input.queueGameplayAction(1,'lensOfTruth','touch');setup.one.update(command);assert(setup.one.hp===17&&setup.one.en>40&&setup.one.en<41,'Lens hotbar changed its HP or Energy cost');assert(setup.one.lens===239&&setup.one.lensCooldown===300,'Lens duration or cooldown changed')}));
await test('hotbar actions remain buffered through brief hit-stop',()=>{const input=new InputManager(()=>[]),setup=pair(),command={down:action=>input.actionIsDown(1,action),pressed:action=>input.consumeAction(1,action)};input.queueGameplayAction(1,'fireBlast','touch');for(let frame=0;frame<4;frame++)input.poll();assert(setup.world.projectiles.length===0,'hit-stop advanced fighter simulation');setup.one.update(command);assert(setup.world.projectiles.length===1,'buffered hotbar ability did not activate after hit-stop')});
await test('touch movement and Block remain held while a hotbar action is buffered',()=>{const input=new InputManager(()=>[]);input.setTouchAction(1,'r',true);input.setTouchAction(1,'b',true);input.poll();input.queueGameplayAction(1,'fireBlast','touch');assert(input.actionIsDown(1,'r')&&input.actionIsDown(1,'b'),'hotbar input cleared movement or Block');assert(input.consumeAction(1,'fireBlast'),'hotbar action was not buffered alongside held touch input')});
await test('default landscape controls do not overlap the bottom hotbar',()=>{const width=844,height=390,settings=createDefaultTouchSettings(),hotbar={left:width*.255,right:width*.745,top:height-75,bottom:height-5};for(const id of ['movement','jump','light','heavy','grab','charge','interact','block','dash','breaker','launcher','throw','moveList','trainingReset','pause','settings']){const position=responsiveControlPosition(settings,id,{width,height}),size=position.size,rect={left:width*position.x/100-size/2,right:width*position.x/100+size/2,top:height*position.y/100-size/2,bottom:height*position.y/100+size/2};assert(!controlsOverlap(rect,hotbar,0),`${id} overlaps the hotbar`)}});
await test('phone touch controls remain separated inside portrait and landscape safe bounds',()=>{const ids=['movement','jump','light','heavy','grab','charge','interact','block','dash','breaker','launcher','throw','counter','lens','moveList','trainingReset','pause','settings'];for(const [width,height] of [[320,568],[375,667],[390,844],[667,375],[844,390]]){const settings=createDefaultTouchSettings(),positions=Object.fromEntries(ids.map(id=>[id,responsiveControlPosition(settings,id,{width,height})]));for(const id of ids){const position=positions[id],x=width*position.x/100,y=height*position.y/100,half=position.size/2;assert(position.size>=(id==='movement'?92:44),`${id} is too small at ${width}x${height}`);assert(x-half>=0&&x+half<=width&&y-half>=0&&y+half<=height,`${id} is clipped at ${width}x${height}`)}for(let left=0;left<ids.length;left++)for(let right=left+1;right<ids.length;right++){const a=positions[ids[left]],b=positions[ids[right]],distance=Math.hypot((a.x-b.x)*width/100,(a.y-b.y)*height/100),required=(a.size+b.size)/2+4;assert(distance>=required,`${ids[left]} overlaps ${ids[right]} at ${width}x${height}`)}}});
await test('new mobile hotbar presets preserve joystick D-Pad left-handed and tablet choices',()=>{for(const id of ['mobile-standard-hotbar','mobile-compact-hotbar','mobile-large-buttons','mobile-left-handed','tablet','desktop-hotbar','minimal-hud'])assert(TOUCH_PRESETS[id],`missing ${id} preset`);const left=applyTouchPreset(createDefaultTouchSettings(),'mobile-left-handed');assert(left.swapped&&left.movement==='joystick','left-handed hotbar preset was wrong');const dpad=applyTouchPreset(createDefaultTouchSettings(),'standard-dpad');assert(dpad.movement==='dpad','D-Pad support was lost')});
await test('legacy default touch positions migrate away from the action hotbar',()=>{const migrated=createDefaultTouchSettings({version:1,positions:{trainingReset:{x:47,y:86,size:46},throw:{x:57,y:86,size:54},light:{x:83,y:68,size:68}}});assert(migrated.version===4,'touch layout schema did not migrate');assert(migrated.positions.trainingReset.y===34&&migrated.positions.throw.y===72&&migrated.positions.light.y===59,'legacy default positions still overlap the hotbar')});
await test('Training Reset stays outside the mobile stage HUD',()=>{const width=844,height=390,settings=createDefaultTouchSettings(),layout=calculateResponsiveLayout({width,height,touch:true}),position=responsiveControlPosition(settings,'trainingReset',{width,height}),right=width*position.x/100+position.size/2,stageLeft=(width-layout.displayWidth)/2;assert(right<=stageLeft,`Training Reset reaches stage HUD at ${right.toFixed(1)} > ${stageLeft.toFixed(1)}`)});
await test('fullscreen is requested only through the explicit interaction method',async()=>{let requests=0,dismissed=0;const classes=new Set(),listeners={},doc={fullscreenElement:null,body:{classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),toggle:(value,on)=>on?classes.add(value):classes.delete(value)}},addEventListener:(name,fn)=>{listeners[name]=fn},exitFullscreen:async()=>{doc.fullscreenElement=null}},element={requestFullscreen:async()=>{requests++;doc.fullscreenElement=element}};const manager=new FullscreenManager({root:null,doc,element,settings:createMobilePresentationSettings(),onDismiss:()=>dismissed++});manager.start({touch:true});assert(requests===0,'fullscreen was requested before user interaction');assert(fullscreenSupported(doc,element),'supported fullscreen was not detected');assert(await manager.enter()&&requests===1&&dismissed===1,'explicit fullscreen interaction failed')});
await test('unsupported fullscreen falls back without failing the match',async()=>{const classes=new Set(),notices=[];const doc={fullscreenElement:null,body:{classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),toggle:(value,on)=>on?classes.add(value):classes.delete(value)}},addEventListener:()=>{}},manager=new FullscreenManager({root:null,doc,element:{},settings:createMobilePresentationSettings(),onNotice:message=>notices.push(message)});assert(!fullscreenSupported(doc,{}),'unsupported fullscreen was marked available');assert(await manager.enter()===false&&classes.has('fullscreen-fallback')&&notices.length===1,'unsupported fullscreen did not enter safe fallback')});
await test('fullscreen exit is explicit and Pause exposes it conditionally',async()=>{let exited=0;const element={requestFullscreen:async()=>{}},doc={fullscreenElement:element,body:{classList:{toggle:()=>{}}},addEventListener:()=>{},exitFullscreen:async()=>{exited++;doc.fullscreenElement=null}},manager=new FullscreenManager({root:null,doc,element,settings:createMobilePresentationSettings()});assert(await manager.exit()&&exited===1,'explicit fullscreen exit failed');assert(PAUSE_ACTIONS.some(action=>action.id==='exitFullscreen'&&action.fullscreenOnly),'Pause does not expose conditional Exit Fullscreen')});
await test('main page includes landscape fullscreen and hotbar presentation shells',async()=>{const html=await(await fetchFresh('../index.html')).text();for(const id of ['abilityHotbar','orientationPrompt','fullscreenPrompt','hotbarCustomizeModal'])assert(html.includes(`id="${id}"`),`index omitted ${id}`);assert(html.includes('css/ability-hotbar.css'),'hotbar stylesheet was not loaded');assert(/Rotate your phone for the best experience\./.test(html),'portrait recommendation copy was missing')});


await test('menu confirm and cancel follow Nintendo Xbox and PlayStation layouts',()=>{const n=controllerMenuButtons('nintendo'),x=controllerMenuButtons('xbox'),p=controllerMenuButtons('playstation');assert(n.confirm===1&&n.cancel===0,'Nintendo did not use A confirm and B cancel');assert(x.confirm===0&&x.cancel===1,'Xbox confirm/cancel changed');assert(p.confirm===0&&p.cancel===1,'PlayStation confirm/cancel changed')});
await test('controller settings track configured devices separately per player',()=>{const storage=memoryStorage(),settings=createDefaultControllerSettings();settings.configuredControllerIds=['Nintendo Pro Controller',null];saveControllerSettings(settings,storage);const loaded=loadControllerSettings(storage);assert(loaded.configuredControllerIds[0]==='Nintendo Pro Controller'&&loaded.configuredControllerIds[1]===null,'controller setup state remained global')});
await test('controller assignment panel and separate controls panel are present',async()=>{const html=await(await fetchFresh('../index.html')).text();assert(html.includes('id="controllerAssignments"'),'controller assignment panel missing');assert(html.includes('id="controlsPanel"'),'separate controls panel missing')});
await test('touch-capable menus advertise tap before the first gameplay touch',()=>{const nav={maxTouchPoints:5},view={matchMedia:()=>({matches:true})};assert(mainMenuConfirmLabel('keyboard',nav,view)==='TAP TO CONFIRM','touch-capable menu still advertised Enter');assert(mainMenuConfirmLabel('mouse',{maxTouchPoints:0},{matchMedia:()=>({matches:false})})==='M1 / ENTER — CONFIRM','mouse prompt changed')});
await test('Classic settings rail explains swiping and uses comfortable touch targets',async()=>{const [html,css]=await Promise.all([fetchFresh('../index.html').then(response=>response.text()),fetchFresh('../css/interface-unified-29a6.css').then(response=>response.text())]);assert(/Swipe left or right to see every setting/.test(html),'settings rail has no swipe cue');assert(/min-height:46px!important/.test(css),'coarse-pointer character select targets are undersized');assert(/max-height:520px/.test(css)&&/grid-template-columns:repeat\(3,minmax\(94px,1fr\)\)/.test(css),'short-phone mode layout was not defined')});
await test('portrait phone main menu separates its header choices preview and touch hint',async()=>{const css=await fetchFresh('../css/interface-unified-29a6.css').then(response=>response.text());assert(/pointer:coarse\) and \(orientation:portrait\) and \(max-width:620px\)/.test(css),'portrait phone menu rules are missing');assert(/grid-template-columns:96px minmax\(0,1fr\)/.test(css),'portrait preview was not compacted');assert(/\[data-main-menu-controls\]\{display:block!important\}/.test(css),'portrait touch hint remains hidden')});
await test('hotbar exposes an information-close callback for pause recovery',()=>{let closed=0;const hotbar=new AbilityHotbar({root:null,onInfoClose:()=>closed++});hotbar.onInfoClose();assert(closed===1,'hotbar info close callback was not retained')});


await test('fighter select clearly labels showcase and unfinished roster states',()=>{
  assert(FIGHTER_STATUS.rrvvfo.id==='showcase'&&FIGHTER_STATUS.revvfo.id==='showcase'&&FIGHTER_STATUS.sage.id==='mentor-only','showcase and mentor statuses were not marked');
  assert(FIGHTER_STATUS.wade.selectable&&FIGHTER_STATUS.bark.selectable,'Wade or Bark is not in the finished playable roster');
  assert(FIGHTER_STATUS.phanta.id==='in-development','unfinished fighters are not clearly marked');
});
await test('public Sage Manual grants onboarding guides without forcing story discoveries',()=>{
  const storage=memoryStorage();grantPublicCombatManual(storage);const state=loadCombatManualState(storage);
  for(const id of ['welcome','movement','basic-combat','modes','training-drills','fighter-rrvvfo','glossary'])assert(state.unlocked.includes(id),`public manual omitted ${id}`);
  assert(!state.unlocked.includes('tournament-rules'),'public manual spoiled a story-discovered tournament page');
  assert(COMBAT_MANUAL_PAGES.some(page=>page.id==='fighter-sage'&&page.drill===undefined),'Sage guide page missing');
});
await test('main menu renders one selected mode at a time with carousel navigation and honest locks',()=>{
  const root=document.createElement('section');root.innerHTML='<nav data-main-menu-list></nav><aside data-main-menu-preview></aside><span data-build-version></span>';document.body.appendChild(root);
  const menu=new MainMenu(root,{storage:memoryStorage()});
  assert(root.querySelector('.modeCarouselHeading h1')?.textContent==='MODE SELECT','Mode Select heading is missing');
  assert(root.querySelectorAll('[data-main-menu-id]').length===1,'more than one full mode card is visible');
  assert(root.querySelector('.menuFighter-rrvvfo'),'Story preview did not render Rrvvfo art');
  assert(root.querySelectorAll('.modeCarouselDots [data-carousel-index]').length===MAIN_MENU_MODES.length,'mode position controls are incomplete');
  for(const id of PROGRESS_LOCKED_MODE_IDS){menu.select(id);assert(root.querySelector('[data-main-menu-id]')?.getAttribute('aria-disabled')==='true',`${id} lock is not honest`)}
  menu.select('arcade');assert(/Coming Later/i.test(root.querySelector('.comingTooltip')?.textContent||''),'Arcade tooltip did not say Coming Later');
  root.remove();
});
await test('loading manager reports task-derived progress and fighter identity',()=>{
  const root=document.createElement('section');root.innerHTML='<div id="loadingProgress"></div><span id="loadingPercent"></span><span id="loadingCategory"></span><p id="loadingMessage"></p><div id="loadingActions"></div><div id="loadingTaskList"></div><div id="loadingFighterArt"></div><strong id="loadingFighterName"></strong><span id="loadingStageName"></span><span id="loadingVersus"></span><button id="loadingRetry"></button><button id="loadingReturn"></button>';document.body.appendChild(root);
  const manager=new LoadingManager(root);manager.start('TEST','Starting',{fighterId:'revvfo',fighterName:'Revvfo',opponentName:'Rrvvfo',stageName:'Tournament',tasks:[{id:'one',label:'ONE'},{id:'two',label:'TWO'}]});manager.task('one','done');
  assert(root.querySelector('#loadingPercent').textContent==='50%','task progress did not reach 50%');assert(root.querySelector('#loadingFighterArt').dataset.fighter==='revvfo','fighter loading identity did not update');root.remove();
});
await test('active page uses one release cache ID and presentation assets',async()=>{
  const html=await(await fetchFresh('../index.html')).text();
  const tags=[...html.matchAll(/\?v=([A-Za-z0-9._-]+)/g)].map(match=>match[1]);
  assert(new Set(tags).size===1,`index uses ${new Set(tags).size} cache IDs`);
  for(const asset of ['css/design-tokens.css','css/interface-unified-29a6.css','startTagline','loadingTaskList','THE SAGE’S MANUAL'])assert(html.includes(asset),`index omitted ${asset}`);
});
await test('finished Arena fighters have distinct data-driven normal attacks',()=>{
  const profiles=['rrvvfo','revvfo','wade','bark','sage'].map(id=>arenaAttackFor(id,'heavy'));
  assert(new Set(profiles.map(move=>`${move.duration}:${move.damage}:${move.range}`)).size===5,'finished fighters still share one heavy attack profile');
  assert(arenaAttackFor('wade','light1').duration<arenaAttackFor('bark','light1').duration,'Wade is not faster than Bark');
  assert(arenaAttackFor('bark','heavy').damage>arenaAttackFor('wade','heavy').damage,'Bark is not heavier than Wade');
  assert(arenaAttackFor('sage','heavy').range>arenaAttackFor('rrvvfo','heavy').range,'Sage range identity is missing');
});
await test('Shot Power and Trick categories organize Rrvvfo techniques',()=>{
  assert(Object.keys(SPECIAL_CATEGORIES).join(',')==='shot,power,trick','three tactical categories are missing');
  assert(RRVVFO_TACTICAL_LOADOUT.shot.includes('fireBlast')&&RRVVFO_TACTICAL_LOADOUT.power.includes('ultimate')&&RRVVFO_TACTICAL_LOADOUT.trick.includes('objectSwap'),'Rrvvfo category loadout is incomplete');
  assert(abilityCategory('shotsOfAgony')==='shot'&&abilityCategory('ultimate')==='power'&&abilityCategory('lensOfTruth')==='trick','ability categories are incorrect');
});
await test('Kinetic Arena balance has pursuit scaling fair defense and visible ring-outs',async()=>{
  const [source,core]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(response=>response.text()),fetchFresh('../js/combat-core.js').then(response=>response.text())]);
  for(const token of ['startEnergy:45','counterCost:18','counterCooldown:2.4','breakerCost:60','juggleLimit:6','edgePressureHits:3'])assert(core.includes(token),`shared combat balance omitted ${token}`);
  for(const token of ['startPursuit','pursuitFollowupWindow','comboScale','JUGGLE LIMIT • FORCED RECOVERY','triggerRingOutFall','ringOutComplete','kind===\'grab\''])assert(source.includes(token),`Kinetic combat omitted ${token}`);
  assert(source.includes("damage=finisher?58:44")&&source.includes("fighter.momentum=0"),'Momentum Finisher is missing or became an instant KO');
});
await test('the Sage Manual explains pursuit categories and Momentum counterplay',()=>{
  for(const id of ['kinetic-combat','special-categories','momentum-finisher'])assert(COMBAT_MANUAL_PAGES.some(page=>page.id===id),`manual omitted ${id}`);
  const finisher=COMBAT_MANUAL_PAGES.find(page=>page.id==='momentum-finisher');assert(/never a hidden full-health KO/i.test(finisher.entries.flat().join(' ')),'manual does not explain that Finishers are defendable and non-instant');
});

await test('Chapter 1 tutorial grab is close-range assisted and confirmed by a connected grab hit',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-mission-1.js')).text();
  assert(source.includes("meta.kind==='grab'&&connected&&this.phase==='basics'"),'tutorial does not confirm a connected grab');
  assert(source.includes('distance<=112')&&source.includes('Math.min(64,distance)'),'tutorial grab range assist is missing');
  assert(source.includes('CLOSE-RANGE GRAB'),'tutorial does not explain that Grab requires close range');
});

await test('Story menu exposes only Rrvvfo and chains Chapters 1–4 without route-menu swaps',async()=>{
  const source=await(await fetchFresh('../js/story/lost-year-story.js')).text();
  assert(source.includes("const route=LOST_YEAR_ROUTES[0]")&&source.includes('rrvvfoOnlyRoute'),'Rrvvfo is not the only released Story card');
  assert(source.includes("'rrvvfo-00':'rrvvfo-01'")&&source.includes("'rrvvfo-road':'rrvvfo-02'")&&source.includes("'rrvvfo-02':'rrvvfo-03'")&&source.includes("'rrvvfo-03':'rrvvfo-04'"),'automatic Story chain is incomplete');
  assert(!source.includes('routeVisible(')&&!source.includes('ALT & ROVER'),'unreleased Story routes leaked into the player screen');
});
await test('Chapter 1 uses a clear Object Swap field trial, saved checkpoints, and the correct Lens charge target',async()=>{
  const m0=await(await fetchFresh('../js/story/rrvvfo-mission-0.js')).text(),m1=await(await fetchFresh('../js/story/rrvvfo-mission-1.js')).text();
  assert(m0.includes('OBJECT SWAP RELAY • 0 / 3')&&m0.includes('Three anchors. No walking between them.'),'Object Swap field requirement is hidden');
  assert(m1.includes('CHARGE TO 60')&&!m1.includes('CHARGE TO 90'),'Lens charge instruction is contradictory');
  for(const checkpoint of ['movement','parry','abilities','lensCharge','final'])assert(m1.includes(checkpoint),`tutorial checkpoint ${checkpoint} is missing`);
});
await test('Chapter 2 has RPG stats, scaled enemies, Story Assist, and a permanent tournament Run refusal',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-mission-2.js')).text();
  for(const token of ['storyStatsForLevel','applyStoryLevelToFighter','enemyLevelFor','USE STORY ASSIST','TRY TO BEAT PLOUKE','Definitely not. I’m not forfeiting.'])assert(source.includes(token),`Chapter 2 omitted ${token}`);
  assert(source.includes("this.root.querySelector('[data-tournament-run]').hidden=false"),'Run does not stay visible in tournament fights');
  assert(!source.includes('SURVIVE THE SCRIPTED FINAL'),'developer language remains in the final objective');
});
await test('Chapter 3 contains the sabotage investigation, Project Hollow reveal, blue-clone escape, and blackout handoff',async()=>{
  const chapterModule=await import('../js/story/rrvvfo-chapter-3.js?v=29a4072r-ch1-adventure-playtestlab-20260802');
  assert(typeof chapterModule.startRrvvfoChapter3==='function','the rewritten Chapter 3 module cannot be imported');
  const source=await(await fetchFresh('../js/story/rrvvfo-chapter-3.js')).text();
  for(const token of ['SABOTAGE_EVIDENCE_POINTS','SABOTAGE_WITNESSES','investigateMaintenanceEntry','inspectHiddenInfrastructure','inspectSageTrail','findRealSage','beginLockdownFight','startDoorSequence','showBlueCloneLesson','activateTeleporter','enterRemoteRegion'])assert(source.includes(token),`rewritten Chapter 3 omitted ${token}`);
  assert(source.includes('Someone messed with that ring.')&&source.includes('Yeah. Someone definitely did this.'),'Chapter 3 no longer begins from tournament sabotage');
  assert(source.includes('sageBlueCloneCreated')&&source.includes('blueCloneTechniqueFoundationLearned'),'blue-clone escape/foundation is missing');
  assert(source.includes('THE ESCAPE IS ABOUT THE CLOSING DOOR • NOT OBJECT SWAP'),'teleporter escape does not protect the blue-clone lesson from Object Swap framing');
  assert(source.includes('RECOVERY PERIOD: ESTIMATED MULTIPLE DAYS')&&source.includes('BEGIN ECHO REGION OPERATION'),'multi-day Echo handoff is missing');
  assert(!source.includes('REACH SHADOW’S LOOKOUT'),'Chapter 3 still hands control directly into the Chapter 4 lookout objective');
  assert(!/CHAPTER 3 DEMO|PLAYABLE DEMO|DEVELOPMENT PREVIEW|NEXT BUILD/.test(source),'Chapter 3 still exposes demo language');
  assert(!/\bSOVAR\b/i.test(source),'the hidden operator identity is revealed too early');
  assert(source.includes('STRANGE MAN')&&source.includes("Strange Man’s Hat"),'the approved Strange Man investigation is missing');
});
await test('Chapter 3 stages are valid and the reused tournament hub has a true after-hours treatment',()=>{
  for(const id of ['after-hours-tournament','resonance-facility','remote-highlands']){
    const stage=getArenaStage(id),validation=validateArenaStage(stage);
    assert(validation.valid,`${id} is invalid: ${validation.errors.join(', ')}`);
  }
  const daytime=getArenaStage('tournament-hub'),night=getArenaStage('after-hours-tournament');
  assert(night.bounds.minX===daytime.bounds.minX&&night.bounds.maxX===daytime.bounds.maxX,'the after-hours hub does not reuse the tournament footprint');
  assert(night.camera.clear!==daytime.camera.clear&&night.camera.fogColor!==daytime.camera.fogColor,'the after-hours hub still uses the daytime atmosphere');
});
await test('Chapter 3 data preserves the rewritten sabotage structure and migrates duplicate save data safely',()=>{
  assert(CHAPTER3_MISSION_ID==='rrvvfo-03','Chapter 3 uses the wrong mission id');
  assert(CHAPTER3_REQUIRED_STEPS.length===33,'rewritten Chapter 3 must contain the full 33-step sabotage/escape spine');
  assert(CHAPTER3_MANDATORY_STORIES.length===3&&CHAPTER3_OPTIONAL_QUESTS.length===10&&CHAPTER3_EVIDENCE.length===9,'Chapter 3 rewritten content counts changed');
  assert(CHAPTER3_BRACKET_ORDER.join(' | ')==='HAILEY → PLOUKE | RRVVFO → HAMUAL | RRVVFO → DANIEL | RRVVFO → WADE | RRVVFO → PLOUKE','Chapter 2 bracket continuity is wrong');
  const state=normalizeChapter3State({requiredCompleted:['opening','opening'],evidence:['medicalTestimony','medicalTestimony'],optionalProgress:{speakers:['vendor','vendor']}});
  assert(state.requiredCompleted.length===2&&state.evidence.length===1&&state.optionalProgress.speakers.length===1,'Chapter 3 save migration retained duplicates or failed to seed sabotage investigation');
  assert(chapter3NextRequired(state)==='ringEvidence1Found'&&chapter3CompletionPercent(state)>0&&!chapter3Complete(state),'partial rewritten Chapter 3 state was misread');
  const completed=freshChapter3State();for(const step of CHAPTER3_REQUIRED_STEPS)markChapter3Required(completed,step);
  assert(chapter3Complete(completed)&&chapter3CompletionPercent(completed)===100,'complete Chapter 3 state was not recognized');
});


await test('Chapter 4 data preserves the revised village-first structure and optional secret boss',()=>{
  assert(CHAPTER4_MISSION_ID==='rrvvfo-04','Chapter 4 uses the wrong mission id');
  assert(CHAPTER4_REQUIRED_STEPS.join('|').includes('beaconRestored|cavernsEntered|liftPartsRecovered|villageDefended|mountainDecision'),'Chapter 4 structural order changed');
  assert(CHAPTER4_REQUIRED_STEPS.indexOf('villageDefended')<CHAPTER4_REQUIRED_STEPS.indexOf('mountainDecision'),'Ryuzankaro quest can open before village defense');
  assert(CHAPTER4_BEACON_NODES.length===3&&CHAPTER4_CAVERN_DOORS.length===3&&CHAPTER4_LIFT_PARTS.length===3&&CHAPTER4_INGREDIENTS.length===4&&CHAPTER4_MOUNTAIN_SIGNALS.length===3,'Chapter 4 content counts changed');
  const state=normalizeChapter4State({requiredCompleted:['opening','opening'],beaconNodes:['signal-blocker','signal-blocker'],ryuzankaro:{available:true,ingredients:['emberBloom','emberBloom']}});
  assert(state.requiredCompleted.length===1&&state.beaconNodes.length===1&&state.ryuzankaro.ingredients.length===1,'Chapter 4 save migration retained duplicates');
  assert(!state.villageDefenseComplete&&!state.ryuzankaro.available&&!chapter4VillageDefenseComplete(state)&&!ryuzankaroQuestAvailable(state),'Ryuzankaro became available before the village defense');
  const defended=normalizeChapter4State({requiredCompleted:['opening','villageDefended'],villageDefenseComplete:true,ryuzankaro:{available:false}});
  assert(defended.villageDefenseComplete&&defended.ryuzankaro.available&&chapter4VillageDefenseComplete(defended)&&ryuzankaroQuestAvailable(defended),'Ryuzankaro did not unlock after the village defense');
  assert(chapter4NextRequired(state)==='villageReached'&&chapter4CompletionPercent(state)>0&&!chapter4Complete(state),'partial Chapter 4 state was misread');
  const complete=freshChapter4State();for(const step of CHAPTER4_REQUIRED_STEPS)markChapter4Required(complete,step);
  assert(chapter4Complete(complete)&&chapter4CompletionPercent(complete)===100,'complete Chapter 4 state was not recognized');
});
await test('Chapter 4 implements Echo Village, Ryuzankaro, Vibration Sense, Hollow Watcher, and Shadow ending',async()=>{
  const chapterModule=await import('../js/story/rrvvfo-chapter-4.js?v=29a4072r-ch1-adventure-playtestlab-20260802');
  assert(typeof chapterModule.startRrvvfoChapter4==='function','Chapter 4 module cannot be imported');
  const source=await(await fetchFresh('../js/story/rrvvfo-chapter-4.js')).text();
  for(const token of ['reachVillage','barkWadeArrival','repairBeacon','enterCaverns','returnToVillageAfterParts','startOldManQuest','revealRyuzankaro','startImpactQte','startSwapQte','startSealQte','useVibrationSense','Hollow Watcher','enterLookout','startShadowArrival'])assert(source.includes(token),`Chapter 4 omitted ${token}`);
  const defenseUnlock=/unlockRyuzankaroAfterVillageDefense\(\)\{[\s\S]*?villageDefenseComplete=true;[\s\S]*?markChapter4Required\(this\.state,'villageDefended'\);[\s\S]*?ryuzankaro\.available=chapter4VillageDefenseComplete\(this\.state\)/;
  assert(defenseUnlock.test(source)&&source.includes("if(fight.kind==='village-defense')")&&source.includes('this.unlockRyuzankaroAfterVillageDefense()'),'Ryuzankaro quest unlock is not tied to the village defense');
  assert(source.includes('if(!ryuzankaroQuestAvailable(this.state))'),'Old Man quest lacks a strict village-defense gate');
  assert(source.includes('if(!chapter4VillageDefenseComplete(this.state))'),'Mountain departure lacks a strict village-defense gate');
  assert(source.includes('PROJECT HOLLOW — COMBAT DATA TRANSMITTED'),'Hollow Watcher does not transmit combat data');
  assert(source.includes('Ryuzankaro')&&source.includes('VIBRATION SENSE UNLOCKED'),'secret-boss reward path is incomplete');
});
await test('Chapter 4 stages and favicon assets are valid',async()=>{
  for(const id of ['echo-village','echo-caverns','echo-sky','echo-mountain']){const stage=getArenaStage(id),validation=validateArenaStage(stage);assert(validation.valid,`${id} is invalid: ${validation.errors.join(', ')}`)}
  for(const path of ['../favicon-16x16.png','../favicon-32x32.png','../favicon.ico','../apple-touch-icon.png']){const response=await fetchFresh(path);assert(response.ok,`missing favicon asset ${path}`)}
  const index=await(await fetchFresh('../index.html')).text();for(const icon of ['favicon-16x16.png','favicon-32x32.png','assets/site-icon-192.png','assets/site-icon-512.png','favicon.ico','apple-touch-icon.png','site.webmanifest'])assert(index.includes(icon),`index does not declare ${icon}`);
});


await test('Chapter 2 living hub keeps only the five story-fit questlines mandatory',()=>{
  const state=createChapter2QuestState(),summary=chapter2QuestSummary(state);
  assert(summary.mandatory.length===5,'mandatory Chapter 2 quest count changed');
  assert(summary.optional.length===Object.keys(CHAPTER2_OPTIONAL_QUESTS).length&&summary.optional.length===6,'optional Chapter 2 quest count is wrong');
  assert(!chapter2MandatoryReadyForTournament(state),'empty hub state incorrectly unlocked the tournament');
  state.mandatory.bracket.complete=true;state.mandatory.wadeRace.complete=true;state.mandatory.barkRing.complete=true;state.variety.festivalExhibition.complete=true;
  assert(chapter2MandatoryReadyForTournament(state),'the four pre-tournament story activities did not unlock registration');
  assert(CHAPTER2_RACE_CHECKPOINTS.length===5&&CHAPTER2_RING_SUPPORTS.length===3&&CHAPTER2_SHORTCUTS.length===3&&CHAPTER2_PLOUKE_CLUES.length===4,'hub quest content counts drifted');
  assert(new Set(CHAPTER2_RING_SUPPORTS.map(support=>support.clue)).size===3,'ring supports do not provide distinct evidence');
});
await test('Chapter 2 quest saves migrate safely and rumor gates advance between rounds',()=>{
  const state=normalizeChapter2QuestState({mandatory:{bracket:{cards:['fan-card','fan-card','broken-card-id']},ploukeRumors:{clues:['stillness','stillness']}}});
  assert(state.mandatory.bracket.cards.length===1&&state.mandatory.ploukeRumors.clues.length===1,'quest normalizer did not remove duplicate progress');
  assert(CHAPTER2_BRACKET_CARDS.length===3&&missingChapter2BracketCards(state).map(card=>card.id).join(',')==='vendor-card,veteran-card','the three announcer cards are not recoverable from one shared definition');
  const completed=normalizeChapter2QuestState({mandatory:{bracket:{complete:true,cards:[]}}});
  assert(completed.mandatory.bracket.started&&completed.mandatory.bracket.cards.length===3&&!missingChapter2BracketCards(completed).length,'completed legacy bracket save did not recover all cards');
  assert(requiredRumorCountForStep('quarterfinal')===1&&requiredRumorCountForStep('bark-pouki')===1&&requiredRumorCountForStep('wade')===2&&requiredRumorCountForStep('final')===3,'Plouke observation/rumor pacing order is wrong');
});
await test('permanent Chapter 2 side-quest stats affect Story calculations',()=>{
  const base=storyStatsForLevel(4),boosted=storyStatsForLevel(4,{hp:6,power:2,defense:1,speed:3,focus:4});
  assert(boosted.hp===base.hp+6&&boosted.power===base.power+2&&boosted.defense===base.defense+1&&boosted.speed===base.speed+3&&boosted.focus===base.focus+4,'persistent Story stat bonuses were not applied');
  assert(storyAttackMultiplier(4,{power:2})>storyAttackMultiplier(4)&&storyDefenseMultiplier(4,{defense:2})<storyDefenseMultiplier(4)&&storySpeedMultiplier(4,{speed:2})>storySpeedMultiplier(4),'side-quest stats do not change battle multipliers');
});
await test('Chapter 2 tournament returns to the hub and exposes mandatory and optional activities',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-mission-2.js')).text();
  for(const token of ['startWadeRace','useWadeShortcut','inspectRingSupport','returnToHubIntermission','startHaileyPrelim','startFinalPreparation','playPloukeClueActivity','recordDummyParry','beginFoodQuest','beginFakeChampionQuest','beginLostFanQuest','beginDummyQuest','beginPrizeCartQuest','beginRejectedChallengerQuest'])assert(source.includes(token),`Chapter 2 hub omitted ${token}`);
  for(const fighter of ["id:'hamual'","id:'daniel'","id='hailey'"])assert(source.includes(fighter),`Chapter 2 tournament omitted ${fighter}`);
  assert(source.includes("returnToHubIntermission('quarterfinal'")&&source.includes("returnToHubIntermission('bark-pouki'")&&source.includes("returnToHubIntermission('wade'")&&source.includes("returnToHubIntermission('final'"),'tournament rounds do not reopen the hub');
  assert(source.includes('three hub shortcuts unlocked')||source.includes('Three hub shortcuts unlocked'),'Wade route does not unlock hub shortcuts');
  assert(source.includes("HUB_SPRITE_NPC_IDS=new Set(['sage','bark','wade'])")&&source.includes("{id:'sage',name:'The Sage'"),'Sage is not an atlas-backed Chapter 2 hub actor');
  for(const token of ["!bracket.cards.includes('fan-card')","!bracket.cards.includes('vendor-card')","!bracket.cards.includes('veteran-card')"])assert(source.includes(token),`Chapter 2 does not render ${token} as a visible card target`);
});


await test('Chapter 4 reaches the floating lookout with a pebble Object Swap sequence',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  assert(source.includes("title:'FLOATING LOOKOUT OBJECT SWAP'"),'floating-lookout QTE is missing');
  assert(source.includes("sequence:['CHARGE','RELEASE','LOCK','OBJECT SWAP']"),'pebble Object Swap sequence is incomplete');
  assert(source.includes("It’s floating. I can’t reach it from the mountain."),'floating-lookout setup dialogue is missing');
});
await test('Chapter 4 new ending uses the exact one-line Shadow arrival and reserves exposition for Chapter 5',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  const start=source.indexOf('startShadowArrival(){'),end=source.indexOf('startFight(config)',start),ending=source.slice(start,end);
  assert(ending.includes("text:'Shadow... it’s been a while.'"),'exact Chapter 4 ending line is missing');
  assert(ending.includes('player.knockdown=Math.max'),'Rrvvfo does not visibly collapse before the ending fade');
  for(const forbidden of ['Where did you find that symbol?','You knew I was coming?','And you didn’t help?','Come inside. You shouldn’t have found any of it.','What happened to you?'])assert(!ending.includes(forbidden),`Chapter 5 exposition leaked into Chapter 4 ending: ${forbidden}`);
  assert(!ending.includes('ryuzankaro'),'Ryuzankaro creates a separate final Shadow scene');
});

await test('Chapter 4 gives control back on the floating lookout before Shadow entrance',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  assert(source.includes("this.completeRequired('lookoutReached');\n    this.enterLookout();"),'successful Object Swap does not land in the lookout exploration state');
  assert(source.includes("kind:'shadow-entrance'")&&source.includes("label:'ENTER SHADOW’S LOOKOUT'"),'Shadow entrance is not an explicit player interaction');
  assert(source.includes("this.area='lookout'")&&source.includes("player.y=LOOKOUT_HEIGHT"),'floating lookout walkable state is missing');
});

await test('Chapter 4 ending completion display is Chapter 4 Complete then Chapter 5 Setup',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  assert(source.includes('<small>CHAPTER 4 COMPLETE</small><h2>CHAPTER 5 SETUP</h2>'),'ending completion display does not match the new handoff');
  assert(source.includes('Chapter 5 begins when he wakes inside.'),'Chapter 5 wake-up setup is missing');
  assert(source.includes('data-c4-ending-fade'),'new ending does not fade to black before completion');
});

await test('Chapter 4 required ending evidence uses shadowArrival and migrates only fully completed old endings',()=>{
  assert(CHAPTER4_REQUIRED_STEPS.includes('shadowArrival')&&!CHAPTER4_REQUIRED_STEPS.includes('shadowBriefing'),'Chapter 4 required steps still use the old Shadow briefing');
  const oldComplete=normalizeChapter4State({chapterComplete:true,requiredCompleted:['hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved'],location:'shadow-lookout'});
  assert(oldComplete.requiredCompleted.includes('shadowArrival')&&!oldComplete.requiredCompleted.includes('shadowBriefing'),'fully completed old ending did not migrate to shadowArrival');
  const oldPartial=normalizeChapter4State({requiredCompleted:['hollowWatcherDefeated','lookoutReached','shadowBriefing'],location:'shadow-lookout'});
  assert(!oldPartial.requiredCompleted.includes('shadowArrival'),'partial old ending incorrectly skipped the new Shadow arrival');
});

await test('Chapter 4 lookout checkpoint cannot bypass the mandatory Object Swap',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  assert(source.includes("this.state.location==='shadow-lookout'&&this.state.requiredCompleted.includes('lookoutReached')"),'lookout restore is not guarded by completed Object Swap evidence');
  const corrupted=normalizeChapter4State({location:'shadow-lookout',requiredCompleted:['hollowWatcherDefeated']});
  assert(corrupted.location==='echo-mountain','corrupted lookout location can bypass the summit Object Swap');
});

await test('Chapter 4 completion reliability accepts the new ending and preserves old completed saves',()=>{
  const base={completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03','rrvvfo-04'],lastCheckpoint:'rrvvfo-04-complete',unlocks:['shadowLookout']};
  const modern={...base,chapter4State:{chapterComplete:true,requiredCompleted:['hollowWatcherDefeated','lookoutReached','shadowArrival','chapterSaved']}};
  assert(inspectStoryReliability(modern).chapters.find(chapter=>chapter.number===4)?.complete,'new shadowArrival ending is not recognized as complete');
  const old={...base,chapter4State:{chapterComplete:true,requiredCompleted:['hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved']}};
  assert(inspectStoryReliability(old).chapters.find(chapter=>chapter.number===4)?.complete,'previous completed Chapter 4 save lost compatibility');
});

await test('2.9A.39.2 lookout landing gets dedicated camera framing before free control settles',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  for(const token of ['LOOKOUT_LANDING_SECONDS=2.4','resetHubCameraLook(this.battle)','this.lookoutLandingSeconds>0?660:820','NO BRIDGE • NO SUPPORT • YOU MADE IT'])assert(source.includes(token),`lookout landing framing omitted ${token}`);
});

await test('2.9A.39.2 lookout checkpoint is grounded at sanctuary height and clamped to the platform',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  for(const token of ['const LOOKOUT_HEIGHT=500','const LOOKOUT_BOUNDS=Object.freeze','player.y=LOOKOUT_HEIGHT','player.grounded=true','player.kvy=0','LOOKOUT_BOUNDS.minX','LOOKOUT_BOUNDS.maxZ'])assert(source.includes(token),`lookout ground hardening omitted ${token}`);
});

await test('2.9A.39.2 lookout entrance guidance is subtle and delayed until the landing beat ends',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  assert(source.includes("SHADOW’S ENTRANCE • AHEAD"),'lookout does not provide a subtle entrance cue');
  assert(source.includes("chapter4NextRequired(this.state)==='shadowArrival'"),'entrance cue can appear outside the final approach');
  assert(source.includes("kind:'shadow-entrance'")&&source.includes("label:'ENTER SHADOW’S LOOKOUT'"),'existing interaction prompt was replaced instead of preserved');
});

await test('2.9A.39.2 floating lookout has visible height wind and entrance ambience',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  for(const token of ['Height and wind remain visible after landing','color:\'#f2fbff\'','LOOKOUT_HEIGHT+3','LOOKOUT_ENTRANCE.x','Math.sin(time*2.2)'])assert(source.includes(token),`lookout ambience omitted ${token}`);
});

await test('2.9A.39.2 collapse holds a readable quiet beat before the completion fade',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  for(const token of ['LOOKOUT_FADE_DELAY_MS=520','LOOKOUT_COMPLETION_DELAY_MS=1850','player.knockdown=Math.max(Number(player.knockdown)||0,2.1)',"detail:{amount:.42,duration:1.7}",'Give the collapse a quiet readable beat'])assert(source.includes(token),`collapse/fade hardening omitted ${token}`);
});

await test('2.9A.39.2 keeps Ryuzankaro branches converged and the mandatory summit swap intact',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  const ending=source.slice(source.indexOf('startShadowArrival(){'),source.indexOf('startFight(config)',source.indexOf('startShadowArrival(){')));
  assert(!ending.includes('ryuzankaro'),'ending hardening accidentally split the Ryuzankaro branches');
  assert(source.includes("sequence:['CHARGE','RELEASE','LOCK','OBJECT SWAP']"),'ending hardening weakened the mandatory pebble Object Swap');
  assert(source.includes("this.completeRequired('lookoutReached');\n    this.enterLookout();"),'Object Swap no longer lands on the lookout before the Shadow scene');
});
await test('2.9A.40 gives Chapters 1–4 distinct gameplay identities instead of reskinned objectives',()=>{
  assert(Object.keys(CHAPTER_GAMEPLAY_IDENTITIES).length===4,'chapter gameplay identity map is incomplete');
  assert(chapterGameplayIdentity(1).id==='movement-adventure','Chapter 1 is not the movement/platforming adventure');
  assert(chapterGameplayIdentity(2).id==='tournament-marathon','Chapter 2 is not the combat marathon');
  assert(chapterGameplayIdentity(3).id==='investigation-infiltration','Chapter 3 is not the investigation/infiltration chapter');
  assert(chapterGameplayIdentity(4).id==='party-journey','Chapter 4 is not the party journey');
});

await test('2.9A.40 enemy roster exposes six behavior archetypes with different tactical jobs',()=>{
  assert(Object.keys(ENEMY_ARCHETYPES).sort().join(',')==='guard,heavy,ranged,rushdown,support,trickster','enemy archetype set is incomplete');
  assert(enemyArchetype('heavy').defense>1&&enemyArchetype('ranged').rangeBias>.7,'enemy archetypes do not meaningfully alter behavior');
  assert(enemyArchetype('support').description.includes('allies'),'support archetype does not communicate target priority');
});

await test('2.9A.40 Rrvvfo Build Lab keeps each preset to four techniques and two passives',()=>{
  assert(Object.keys(RRVVFO_BUILDS).length===3,'expected three focused Rrvvfo builds');
  for(const build of Object.values(RRVVFO_BUILDS)){assert(build.techniques.length===4,`${build.id} build does not have four techniques`);assert(build.passives.length===2,`${build.id} build does not have two passives`)}
});

await test('2.9A.40 Rrvvfo builds persist and alter fighter/loadout behavior without changing save schema',async()=>{
  const storage=memoryStorage();saveRrvvfoBuild('improviser',storage);assert(loadRrvvfoBuild(storage).id==='improviser','Build Lab choice did not persist');
  const build=currentRrvvfoBuild(storage),fighter={id:'rrvvfo',en:30};applyRrvvfoBuildToFighter(fighter,build);assert(fighter.storyBuildId==='improviser'&&fighter.storyBuildTechniques.length===4&&fighter.storyBuildPassives.length===2,'saved build did not apply to Rrvvfo');
  const [arena,story]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/story/story-engine.js').then(r=>r.text())]);
  assert(arena.includes("storyHudMode!=='combat'")&&arena.includes('if(storyScripted)return ARENA_ABILITIES'),'scripted Story traversal can be broken by a combat build');
  assert(story.includes('refreshPlayerHotbar?.()'),'Story mode changes do not refresh canonical/build hotbars safely');
  assert(SAVE_SCHEMA_VERSION===268,'Core Fun Overhaul unexpectedly changed save schema');
});

await test('2.9A.40 build passives produce real combat choices instead of cosmetic labels',()=>{
  const impro=RRVVFO_BUILDS.improviser,fire=RRVVFO_BUILDS.fire;
  assert(tuneRrvvfoAbility({id:'objectSwap',cost:20,cooldown:1},impro).cost===15,'Swap Economy did not reduce Object Swap cost');
  const tuned=tuneRrvvfoAbility({id:'fireBlast',cost:15,cooldown:1.4},fire);assert(Math.abs(tuned.cooldown-1.19)<.001,'Fire Focus did not shorten Fire Blast recovery');
});

await test('2.9A.40 Adventure Missions are short optional chapter hooks with non-grind persistence',()=>{
  assert(ADVENTURE_MISSIONS.length===8,'expected two launch Adventure Missions per released chapter');
  for(let chapter=1;chapter<=4;chapter++)assert(ADVENTURE_MISSIONS.filter(mission=>mission.chapter===chapter).length===2,`Chapter ${chapter} does not have two Adventure Mission hooks`);
  const storage=memoryStorage(),first=completeAdventureMission('c1-high-road',{rank:'A',reward:'TITLE • ROAD RUNNER'},storage),again=completeAdventureMission('c1-high-road',{rank:'A',reward:'TITLE • ROAD RUNNER'},storage),progress=loadAdventureProgress(storage);
  assert(first.first&&!again.first&&progress.completed.length===1&&progress.rewards.length===1,'Adventure Mission completion can be farmed or duplicated');
});

await test('2.9A.40 save export includes build and adventure progress as gameplay data',()=>{
  assert(SAVE_EXPORT_KEYS.includes('pxRrvvfoBuildV1'),'Rrvvfo build is missing from save export');
  assert(SAVE_EXPORT_KEYS.includes('pxAdventureProgressV1'),'Adventure Mission progress is missing from save export');
});

await test('2.9A.40 Flow Cancel adds a real post-hit movement decision to Sonic Battle combat',async()=>{
  const source=await fetchFresh('../js/arena/arena-mode.js').then(response=>response.text());
  for(const token of ['flowCancelWindow','state.hit&&fighter.flowCancelWindow>0&&fighter.en>=8','fighter.en-=8','FLOW CANCEL • 8 ENERGY'])assert(source.includes(token),`Flow Cancel omitted ${token}`);
  assert(source.includes("attacker.flowCancelWindow=.30"),'connected melee hits do not open the Flow Cancel window');
});

await test('2.9A.40 Chapter 1 turns route choice and Object Swap rescue into optional adventure goals',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-road-hub.js').then(response=>response.text());
  for(const token of ["discoverAdventureMission('c1-high-road')","completeAdventureMission('c1-high-road'","completeAdventureMission('c1-swap-cache'",'cliffJumpMarkers','routeGimmickReady()','CLIFF GAP • JUMP ACROSS'])assert(source.includes(token),`Chapter 1 Core Fun hook omitted ${token}`);
});

await test('2.9A.40 Chapter 2 tournament uses varied enemy jobs plus repeat-fight Adventure goals',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-mission-2.js').then(response=>response.text());
  for(const token of ["archetype:'heavy'","archetype:'trickster'","archetype:'rushdown'","archetype:'ranged'","c2-three-in-a-row","c2-ring-master"])assert(source.includes(token),`Chapter 2 variety omitted ${token}`);
});

await test('2.9A.40 Chapter 3 rewards investigation quality instead of adding another combat gate',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-3.js').then(response=>response.text());
  for(const token of ["discoverAdventureMission('c3-no-false-leads')","completeAdventureMission('c3-no-false-leads'","discoverAdventureMission('c3-clean-entry')","completeAdventureMission('c3-clean-entry'"])assert(source.includes(token),`Chapter 3 investigation goal omitted ${token}`);
});

await test('2.9A.40 Chapter 4 has simultaneous-feeling 3v3 and 3v2 squad encounters before the solo mountain',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text());
  for(const token of ["squadMode:'3v3'","squadMode:'3v2'",'setupSquadFight(waves)','updateSquadFight(dt)','cycleSquadTarget()','squadAliveEnemies()','hp:120,maxHp:120','hp:96,maxHp:96','target.down=true','TEAM CAPTAIN'])assert(source.includes(token),`Chapter 4 squad combat omitted ${token}`);
  assert(source.includes("archetype:'support'")&&source.includes("archetype:'heavy'")&&source.includes("archetype:'trickster'"),'Chapter 4 squad enemies do not mix tactical archetypes');
});


await test('2.9A.40.1 Custom Build persists four techniques and two passives without duplicates',()=>{
  const storage=memoryStorage();
  saveRrvvfoCustomBuild({techniques:['fireBlast','fireBlast','objectSwap','ultimate'],passives:['parrySpark','parrySpark']},storage);
  const state=loadRrvvfoBuild(storage),build=currentRrvvfoBuild(storage);
  assert(state.id==='custom'&&build.id==='custom','Custom Build did not become active');
  assert(build.techniques.length===4&&new Set(build.techniques).size===4,'Custom Build did not normalize to four unique techniques');
  assert(build.passives.length===2&&new Set(build.passives).size===2,'Custom Build did not normalize to two unique passives');
  assert(build.techniques.every(id=>RRVVFO_TECHNIQUES[id])&&build.passives.every(id=>RRVVFO_PASSIVES[id]),'Custom Build saved an invalid slot');
});

await test('2.9A.40.1 Build Lab exposes presets, Custom slots, and a locked Story state',()=>{
  const storage=memoryStorage(),html=renderRrvvfoBuildLab({storage});
  assert(html.includes('CUSTOM BUILD')&&(html.match(/data-custom-tech=/g)||[]).length===4&&(html.match(/data-custom-passive=/g)||[]).length===2,'Build Lab does not expose 4+2 Custom slots');
  const locked=renderRrvvfoBuildLab({storage,locked:true,lockReason:'BUILD LOCKED • TEST'});
  assert(locked.includes('BUILD LOCKED • TEST')&&locked.includes('disabled'),'Build Lab does not communicate/obey Story lock state');
});

await test('2.9A.40.1 Chapters 1–4 expose the Build Lab from Story pause menus',async()=>{
  const files=['rrvvfo-road-hub.js','rrvvfo-mission-2.js','rrvvfo-chapter-3.js','rrvvfo-chapter-4.js'];
  for(const file of files){const source=await fetchFresh(`../js/story/${file}`).then(r=>r.text());assert(source.includes('RRVVFO BUILD')&&source.includes('openRrvvfoBuildLab'),`${file} has no in-Story Build Lab path`)}
});

await test('2.9A.40.1 active fights lock build switching in the combat-heavy Story chapters',async()=>{
  const [c2,c3,c4]=await Promise.all(['rrvvfo-mission-2.js','rrvvfo-chapter-3.js','rrvvfo-chapter-4.js'].map(file=>fetchFresh(`../js/story/${file}`).then(r=>r.text())));
  assert(c2.includes("['fight','fight-ko'].includes(this.mode)")&&c2.includes('BUILD LOCKED • FINISH THE ACTIVE FIGHT'),'Chapter 2 can change builds during combat');
  assert(c3.includes("locked=this.mode==='fight'")&&c3.includes('BUILD LOCKED • FINISH THE ACTIVE FIGHT'),'Chapter 3 can change builds during combat');
  assert(c4.includes("locked=this.mode==='fight'||this.qte?.active")&&c4.includes('BUILD LOCKED • FINISH THE ACTIVE ENCOUNTER'),'Chapter 4 can change builds during combat/QTEs');
});

await test('2.9A.40.1 chapter identity cards use player-facing hooks instead of internal design prose',async()=>{
  for(let chapter=1;chapter<=4;chapter++){const id=chapterGameplayIdentity(chapter);assert(id.playerTitle&&id.playerTagline&&id.playerHint,`Chapter ${chapter} is missing player-facing identity copy`)}
  const source=await fetchFresh('../js/story/story-polish.js').then(r=>r.text());
  assert(source.includes('identity.playerTitle')&&source.includes('identity.playerTagline')&&source.includes('identity.playerHint'),'Story presentation still exposes only internal chapter identity metadata');
});

await test('2.9A.40.1 enemy archetypes are readable by icon and fallback silhouette shape',()=>{
  assert(Object.keys(ENEMY_ARCHETYPE_ICONS).length===6,'not every archetype has a role icon');
  assert(enemyArchetypeShape('heavy').width>enemyArchetypeShape('rushdown').width,'Heavy silhouette is not visibly broader');
  assert(enemyArchetypeShape('trickster').width<enemyArchetypeShape('rushdown').width,'Trickster silhouette is not visibly leaner');
});

await test('2.9A.40.1 Chapter 2 reveals opponent role on first engagement',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-mission-2.js').then(r=>r.text());
  for(const token of ['data-c2-enemy-role','OPPONENT STYLE','enemyArchetypeIcon(arch.id)','panel.hidden=false','arch.description'])assert(source.includes(token),`Chapter 2 role readability omitted ${token}`);
});

await test('2.9A.40.1 Chapter 4 gives keyboard controller and touch deliberate squad target cycling',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ["const targetCycle=Boolean(command.interact)","targetCycle&&!this.targetCycleHeld","event.code==='Tab'","touchTarget.textContent=squad?'TARGET':'INTERACT'","CYCLE TARGET"])assert(source.includes(token),`manual target cycling omitted ${token}`);
});

await test('2.9A.40.1 Support healing is telegraphed and can actually be interrupted',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ['support.supportCast=.9','SUPPORT CASTING • INTERRUPT','support.hp<Number(support.supportCastHp','SUPPORT INTERRUPTED','support.supportCooldown=2.2'])assert(source.includes(token),`Support heal fairness omitted ${token}`);
});

await test('2.9A.40.1 Flow Cancel is taught through an optional Chapter 1 combat opening and mission results respect chapter-specific grading',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-road-hub.js').then(r=>r.text());
  assert(source.includes('OPENING! • DASH NOW TO FLOW CANCEL')&&source.includes('FLOW CANCEL LEARNED')&&source.includes("'pxflowcancel'"),'Flow Cancel still relies on patch notes to be discovered');
  const state={completed:['c2-ring-master','c3-no-false-leads','c1-swap-cache'],bestRanks:{'c2-ring-master':'S','c3-no-false-leads':'S','c1-swap-cache':'A'}};
  assert(adventureMissionResultLabel(ADVENTURE_MISSIONS.find(m=>m.id==='c2-ring-master'),state)==='S RANK','combat mission lost S–E grading');
  assert(adventureMissionResultLabel(ADVENTURE_MISSIONS.find(m=>m.id==='c3-no-false-leads'),state)==='PERFECT','investigation mission was forced into combat-style grading');
  assert(adventureMissionResultLabel(ADVENTURE_MISSIONS.find(m=>m.id==='c1-swap-cache'),state)==='COMPLETE','exploration completion was forced into an unnecessary rank');
});

await test('Prototype 2.9A.40.2 preserves current Chapter 1 and Chapter 2 dialogue while replacing the retired Shots tutorial',async()=>{
  const [mission0,mission1,road,mission2,questData]=await Promise.all([
    'rrvvfo-mission-0.js','rrvvfo-mission-1.js','rrvvfo-road-hub.js','rrvvfo-mission-2.js','chapter2-hub-quests.js'
  ].map(file=>fetchFresh(`../js/story/${file}`).then(response=>response.text())));
  for(const line of ['Before you start throwing attacks around, prove you can move without a path.','There is literally a path right there.','If an object can get somewhere, you can turn that into a route. Figure out the rest.'])assert(mission0.includes(line),`Chapter 1 field training omitted: ${line}`);
  assert(!mission0.includes("I’ll name this attack... Shots of Agony."),'retired early Shots of Agony invention still appears in Chapter 1');
  assert(mission1.includes('I signed you up for this tournament. I heard there’d be some nice ladies there.'),'Chapter 1 manual handoff dialogue is stale');
  for(const line of ['Lemme guess. Your ‘important training’ is going to the spa and spying on women, perv.','This seems like a knockoff of the World Martial Arts Tournament.'])assert(road.includes(line),`Tournament Road omitted: ${line}`);
  for(const line of ['Not my problem.','Aren’t you the announcer I used to watch in those World Tournaments on TV when I was younger? So I guess your clumsiness wasn’t a character.','After the tournament, I’ll figure out who did it. Don’t stress about it, Bark.','I beat you in the beam! Haha—','Now that explains what you were doing during your fight with Hailey.'])assert(mission2.includes(line),`Chapter 2 omitted: ${line}`);
  assert(questData.includes('Plouke always looks at the edge. Maybe he’s in love with it.'),'Plouke ring-edge clue is stale');
  assert(!mission2.includes('ring-saboteur')&&!mission2.includes('confrontRingSaboteur')&&!mission2.includes("kind:'ring-repair'"),'Chapter 2 still contains the removed saboteur encounter');
});

await test('runtime fighter atlases use compressed WebP files',async()=>{
  for(const fighter of ['rrvvfo','revvfo','bark','wade','sage']){
    const manifest=await(await fetchFresh(`../assets/fighters/${fighter}/${fighter}-animations.json`)).json();
    assert(manifest.image.endsWith('.webp'),`${fighter} manifest still loads a PNG atlas`);
    const image=await fetchFresh(`../assets/fighters/${fighter}/${manifest.image.replace('./','')}`);assert(image.ok,`${fighter} WebP atlas did not load`);
  }
});
await test('Chapter 1 road skips the repeated mandatory movement marker lesson',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-road-hub.js')).text();
  assert(source.includes("this.step='leave-training'")&&source.includes("warmupMarkers.forEach(marker=>{marker.done=true})"),'Chapter 1 road does not bypass the repeated movement gate');
});
await test('Chapter 2 mandatory preparation includes active card and repair challenges',async()=>{
  const source=await(await fetchFresh('../js/story/rrvvfo-mission-2.js')).text();
  for(const token of ['bracketFanCard','TOO FAST TO GRAB','STABILIZE','pendingSupport','THE BRACE SLIPPED'])assert(source.includes(token),`Chapter 2 interactive quest pass omitted ${token}`);
});
await test('the uploaded Parallels X icon is wired for browser tabs and installed apps',async()=>{
  const [html,manifestResponse]=await Promise.all([fetchFresh('../index.html').then(response=>response.text()),fetchFresh('../site.webmanifest')]);
  const iconLinks=[...html.matchAll(/<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*>/gi)].map(match=>match[0]);
  const appleLinks=[...html.matchAll(/<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*>/gi)].map(match=>match[0]);
  assert(iconLinks.some(link=>/favicon-16x16\.png/.test(link)),'16x16 tab icon link is missing');
  assert(iconLinks.some(link=>/favicon-32x32\.png/.test(link)),'32x32 tab icon link is missing');
  assert(iconLinks.some(link=>/site-icon-192\.png/.test(link)),'192x192 installed-app icon link is missing');
  assert(iconLinks.some(link=>/site-icon-512\.png/.test(link)),'512x512 installed-app icon link is missing');
  assert(appleLinks.some(link=>/site-icon-180\.png|apple-touch-icon\.png/.test(link)),'Apple touch icon link is missing');
  assert(/<link\s+[^>]*rel=["']manifest["'][^>]*site\.webmanifest/.test(html),'site.webmanifest link is missing from index.html');
  assert(manifestResponse.ok,'site.webmanifest did not load');
  const manifest=await manifestResponse.json();
  assert(manifest.icons?.some(icon=>icon.sizes==='192x192')&&manifest.icons?.some(icon=>icon.sizes==='512x512'),'installable icon sizes are incomplete');
});

await test('Prototype 2.9A.22 preserves the distinct Chapter 1 and Chapter 2 visual silhouettes',async()=>{
  const [renderer,art,stages]=await Promise.all([
    fetchFresh('../js/arena/webgl-renderer.js').then(r=>r.text()),
    fetchFresh('../js/story/hub-landmark-art.js').then(r=>r.text()),
    fetchFresh('../js/arena/arena-stages.js').then(r=>r.text())
  ]);
  for(const primitive of ['cylinder(options={})','cone(options={})','gableRoof(options={})'])assert(renderer.includes(primitive),`renderer omitted ${primitive}`);
  for(const roadToken of ['mountain trail','pine(','stoneBoulder(','toriiTrailGate(','distant mountain silhouette'])assert(art.includes(roadToken),`Chapter 1 identity omitted ${roadToken}`);
  for(const tournamentToken of ['tournamentPillar(','tournamentRoof(','martialStatue(','festival skyline','Arena facade'])assert(art.includes(tournamentToken),`Chapter 2 identity omitted ${tournamentToken}`);
  assert(stages.includes("clear:'#70add1'")&&stages.includes("clear:'#79c3ec'"),'Chapter 1 and Chapter 2 sky palettes are not distinct');
});

await test('Story chapters use one shared runtime controller without method monkey-patching',async()=>{
  const source=await(await fetchFresh('../js/story/story-engine.js')).text();
  for(const token of ['useChapterProfile','installUnifiedRuntime','storyUnifiedRuntime','storyCommandForMode','invokeRuntime'])assert(source.includes(token),`Story Engine omitted ${token}`);
  assert(source.includes("STORY_ENGINE_VERSION='2.9A.24'"),'Story Engine version is stale');
  const chapters=['rrvvfo-mission-0.js','rrvvfo-mission-1.js','rrvvfo-road-hub.js','rrvvfo-mission-2.js','rrvvfo-chapter-3.js','rrvvfo-chapter-4.js'];
  for(const file of chapters){const chapter=await(await fetchFresh(`../js/story/${file}`)).text();assert(chapter.includes('useChapterProfile'),`${file} did not register a Story profile`);assert(!/battle\.(?:input|cpu|update|hud|draw|drawFighterLayer|drawFallback2D|flipFor|updateCamera|castAbility|applyDamage|updateSpecials|exit)\s*=/.test(chapter),`${file} still replaces an engine method`) }
});


await test('Prototype 2.9A.24 preserves the eight-chapter route without inventing Chapters 5–8',async()=>{
  const [data,story]=await Promise.all([fetchFresh('../js/story/lost-year-data.js').then(r=>r.text()),fetchFresh('../js/story/lost-year-story.js').then(r=>r.text())]);
  assert(data.includes('RRVVFO_PLANNED_CHAPTER_COUNT=8'),'eight-chapter foundation is missing');
  assert(story.includes('4 RELEASED / 8 PLANNED')&&story.includes('PLANNED • NOT YET RELEASED'),'future chapter slots are not presented honestly');
  assert(story.includes('No plot details are being invented before the official plan.'),'future chapter cards invent unsupported story information');
});
await test('Echo Village has a low-tech resonance identity and invasive Hollow contrast',async()=>{
  const [chapter,stages]=await Promise.all([fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text()),fetchFresh('../js/arena/arena-stages.js').then(r=>r.text())]);
  for(const token of ['hand-cut stone, timber, ropes, bells, water, and resonance craft','Old pulley lift, visibly non-electric','Wind chimes and bells','Project Hollow hardware deliberately clashes'])assert(chapter.includes(token),`Echo Village identity omitted ${token}`);
  assert(stages.includes("id:'echo-village',name:'Echo Village'")&&stages.includes("clear:'#b9aa8d'")&&stages.includes("surface:{x:0,y:1,z:0,sx:3300,sy:5,sz:1880,color:'#8a7c61'}"),'Echo Village stage palette is still generic tech-gray');
});
await test('Chapter 4 secret-boss checkpoints migrate and one-time rewards cannot duplicate',async()=>{
  const state=normalizeChapter4State({version:1,ryuzankaro:{started:true,ingredients:['emberBloom']}});
  assert(state.version===5&&state.ryuzankaro.checkpoint==='none'&&!state.ryuzankaro.rewardsGranted,'Chapter 4 v1 state did not migrate into the current checkpoint model');
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ['resumeRyuzankaroCheckpoint','checkpoint=\'impact\'','checkpoint=\'aerial\'','checkpoint=\'village-final\'','checkpoint=\'seal\'','const firstReward=!this.state.ryuzankaro.rewardsGranted'])assert(source.includes(token),`Ryuzankaro reliability omitted ${token}`);
});
await test('Hollow Watcher adaptation is readable, breakable, and never full immunity',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ['PATTERN BROKEN • WATCHER EXPOSED','ADAPTED •','SCANNING •','WATCHER_PHASES','watcherPhaseForHp','adjusted*=.58','adjusted*=1.35'])assert(source.includes(token),`Hollow Watcher fairness omitted ${token}`);
  assert(!source.includes('adjusted*=.38'),'Hollow Watcher still applies the old severe resistance');
});
await test('Chapter 4 QTEs support keyboard, controller, touch abilities, and safe retries',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ["if(this.mode==='qte')","command.x<-.55","slot===3?'OBJECT SWAP'","type:'lookout-swap'","RETRYING FROM THE SAFE MOMENT"])assert(source.includes(token),`QTE compatibility omitted ${token}`);
});
await test('Echo Region uses separate procedural identities for village, cavern, mountain, and Hollow combat',async()=>{
  const [audio,chapter]=await Promise.all([fetchFresh('../js/audio-manager.js').then(r=>r.text()),fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text())]);
  for(const theme of ['echoVillage','echoCavern','echoMountain','hollow'])assert(audio.includes(`${theme}:{`),`audio manager omitted ${theme}`);
  for(const theme of ["detail:'echoVillage'","detail:'echoCavern'","detail:'echoMountain'","detail:config.kind==='watcher'?'hollow':'battle'"])assert(chapter.includes(theme),`Chapter 4 does not request ${theme}`);
});


await test('Story fights preserve and recover Rrvvfo sprite assets across Chapters 2–4',async()=>{
  const [arenaSource,chapter2Source,chapter3Source,chapter4Source]=await Promise.all([
    fetchFresh('../js/arena/arena-mode.js').then(response=>response.text()),
    fetchFresh('../js/story/rrvvfo-mission-2.js').then(response=>response.text()),
    fetchFresh('../js/story/rrvvfo-chapter-3.js').then(response=>response.text()),
    fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text())
  ]);
  assert(arenaSource.includes('ensureFighterAsset(fighter,id=fighter?.id'), 'shared asset recovery helper is missing');
  assert(arenaSource.includes('fighter.assetLoadToken!==token'), 'stale sprite-load protection is missing');
  for(const source of [chapter2Source,chapter3Source,chapter4Source]){
    assert(!source.includes("player.asset=null"), 'a story chapter still clears Rrvvfo’s atlas');
    assert(source.includes("ensureFighterAsset(player,'rrvvfo')"), 'a story chapter does not recover Rrvvfo’s atlas');
  }
});


await test('Story combat hides exploration HUD, maps, and menus without hiding combat-specific panels',async()=>{
  const [engine,css,chapter3,chapter4]=await Promise.all([
    fetchFresh('../js/story/story-engine.js').then(response=>response.text()),
    fetchFresh('../css/interface-unified-29a6.css').then(response=>response.text()),
    fetchFresh('../js/story/rrvvfo-chapter-3.js').then(response=>response.text()),
    fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text())
  ]);
  for(const token of ['storyFightUiSafe','chapter2FightMode','storyChapter3Combat','storyChapter4Combat','.storyMapOverlay'])assert(engine.includes(token),`shared combat UI controller omitted ${token}`);
  for(const selector of ['#rrvvfoMission2UI .chapter2Hud','#rrvvfoChapter3PreviewUI .c3Hud','#rrvvfoChapter4UI .c4Hud','.storyMiniMap','.storyObjectiveCompass'])assert(css.includes(selector),`combat-safe CSS omitted ${selector}`);
  assert(chapter3.includes("this.battle.root.classList.add('storyChapter3Combat')"),'Chapter 3 does not enter the shared combat context');
  assert(chapter4.includes('c4WatcherScan')&&!css.includes('body.storyFightUiSafe #rrvvfoChapter4UI .c4WatcherScan'),'Hollow Watcher analysis was hidden with exploration UI');
});


await test('All-chapter polish is initialized from the main runtime',async()=>{
  const [main,polish]=await Promise.all([fetchFresh('../js/main.js').then(r=>r.text()),fetchFresh('../js/story/story-polish.js').then(r=>r.text())]);
  assert(main.includes('initializeStoryPolish')&&main.includes('pxstoryuicue'),'main runtime does not initialize Story polish and audio cues');
  for(const token of ['StoryPolishController','storySceneTransition','storyObjectiveToast','storyChapterResults','storyPlaytestPanel'])assert(polish.includes(token),`Story polish omitted ${token}`);
});
await test('Secret playtest menu uses the exact keyboard and controller code',async()=>{
  const source=await fetchFresh('../js/story/story-polish.js').then(r=>r.text());
  assert(source.includes("['up','up','down','down','left','right','left','right','b','a']"),'secret code sequence changed');
  for(const token of ["ArrowUp:'up'","ArrowDown:'down'","KeyB:'b'","KeyA:'a'","[12,'up']","[13,'down']","[1,'b']","[0,'a']"])assert(source.includes(token),`secret-code input mapping omitted ${token}`);
});
await test('Playtest menu exposes recovery chapter jumps combat tests and bug reports',async()=>{
  const source=await fetchFresh('../js/story/story-polish.js').then(r=>r.text());
  for(const token of ['RESTART FROM SAVED CHECKPOINT','OPEN CHAPTER SELECT','RESET CURRENT CHAPTER','QUICK COMBAT TEST','COPY BUG REPORT','DOWNLOAD REPORT','pxplayteststartchapter'])assert(source.includes(token),`playtest menu omitted ${token}`);
});
await test('Story fight transitions are centralized and preserve a pre-fight save snapshot',async()=>{
  const [engine,polish]=await Promise.all([fetchFresh('../js/story/story-engine.js').then(r=>r.text()),fetchFresh('../js/story/story-polish.js').then(r=>r.text())]);
  assert(engine.includes('pxstorymodechange')&&engine.includes('opponent:this.battle?.fighters?.[1]?.name'),'Story Engine does not publish shared fight transitions');
  assert(polish.includes('pxStoryPreFightBackupV1')&&polish.includes('Checkpoint secured • exploration UI hidden'),'pre-fight recovery snapshot is missing');
});
await test('Dialogue presentation uses atlas portraits expressions and camera focus',async()=>{
  const [dialogue,css]=await Promise.all([fetchFresh('../js/sonic-battle-dialogue.js').then(r=>r.text()),fetchFresh('../css/interface-unified-29a6.css').then(r=>r.text())]);
  for(const token of ['ATLAS_FIGHTERS','inferEmotion','renderAtlasPortrait','frameForEmotion'])assert(dialogue.includes(token),`dialogue portrait system omitted ${token}`);
  for(const token of ['storyDialogueOpen [data-world-layer]','data-dialogue-speaker="rrvvfo"','emotion-angry','sbDialogueChoice:before'])assert(css.includes(token),`dialogue presentation CSS omitted ${token}`);
});
await test('Unified objectives autosave and route home shows the recovery checkpoint',async()=>{
  const [polish,story]=await Promise.all([fetchFresh('../js/story/story-polish.js').then(r=>r.text()),fetchFresh('../js/story/lost-year-story.js').then(r=>r.text())]);
  assert(polish.includes('lastStoryObjective')&&polish.includes('OBJECTIVE_PAIRS'),'objective updates do not use the shared autosave presenter');
  assert(story.includes('AUTO-SAVE RECOVERY')&&story.includes('storyCheckpointLabel'),'Story route home does not show the current checkpoint');
});
await test('Chapter completion creates a ranked Story results screen',async()=>{
  const [data,polish]=await Promise.all([fetchFresh('../js/story/lost-year-data.js').then(r=>r.text()),fetchFresh('../js/story/story-polish.js').then(r=>r.text())]);
  assert(data.includes('pxstorychaptercomplete')&&data.includes('newlyCompleted'),'save system does not publish chapter completion');
  for(const token of ['CHAPTER RESULTS','storyResultRank','chapterRank','Completion time','Total route'])assert(polish.includes(token),`chapter results omitted ${token}`);
});
await test('Combat feedback adds perfect-parry guard-break heavy-impact and low-health cues',async()=>{
  const [arena,polish,css]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/story/story-polish.js').then(r=>r.text()),fetchFresh('../css/interface-unified-29a6.css').then(r=>r.text())]);
  for(const type of ['perfectParry','guardBreak','heavyImpact'])assert(arena.includes(`type:'${type}'`),`arena omitted ${type} feedback event`);
  assert(arena.includes("classList.toggle('arenaLowHealth'")&&css.includes('arenaLowHealth:before'),'low-health warning is missing');
  assert(polish.includes('onCombatFeedback')&&css.includes('storyCombatCallout'),'shared combat callouts are missing');
});
await test('Procedural chapter audio crossfades and adds distinct ambience accents',async()=>{
  const audio=await fetchFresh('../js/audio-manager.js').then(r=>r.text());
  assert(audio.includes('scheduleThemeAccent')&&audio.includes('echoVillage')&&audio.includes('echoCavern')&&audio.includes('echoMountain'),'chapter ambience accents are incomplete');
  assert(audio.includes('fadeMusicBus(oldBus,.34)')&&audio.includes('stopMusic({fade=.34}={})'),'music crossfade timing was not polished');
});

await test('Chapter 3 Strange Man sequence preserves sabotage order, flags, hat, and legacy facility migration',()=>{
  const base=normalizeChapter3State({requiredCompleted:['opening','sabotageInvestigationStarted','ringEvidence1Found','ringEvidence2Found','ringEvidence3Found','sabotageConfirmed','workerQuestioned','securityQuestioned','medicalWorkerFirstConversationComplete']});
  assert(chapter3NextRequired(base)==='strangeManWarningSeen','Strange Man does not enter after sabotage evidence and witness questioning');
  const mid=normalizeChapter3State({strangeManWarningSeen:true,medicalWorkerRevisited:true,strangeManHatCollected:true,keyItems:['strange-mans-hat']});
  assert(mid.requiredCompleted.includes('strangeManWarningSeen')&&mid.requiredCompleted.includes('medicalWorkerRevisited')&&mid.requiredCompleted.includes('strangeManHatCollected'),'Strange Man flags did not reconcile into required checkpoints');
  const migrated=normalizeChapter3State({requiredCompleted:['opening','medicalLead','fighterNobodyRecorded','bracketRecords','lockedNightShift','crackedRing','ploukeBag','lensTrail','sageExplanation','facilityEntered'],location:'facility'});
  assert(migrated.strangeManHatCollected&&migrated.keyItems.includes('strange-mans-hat')&&migrated.projectHollowFacilityEntered&&chapter3NextRequired(migrated)==='tournamentDataDiscovered','older facility save was sent backward or lost the rewritten key-item/facility state');
});

await test('Chapter 3 Strange Man dialogue, exact medical contradiction, hat, and Lens uncertainty are packaged',async()=>{
  const source=await (await fetchFresh('../js/story/rrvvfo-chapter-3.js')).text();
  for(const token of [
    'You’re wasting your time.',
    'The people you’re talking to aren’t the real people.',
    'You said Plouke skipped the medical tent and went toward maintenance.',
    'I’ve never treated or spoken to anyone named Plouke.',
    'You literally told me that a few minutes ago.',
    'You warn me about fake people, vanish, and leave your hat?',
    'Great. Even my eye doesn’t know what happened.',
    'strangeManWarningSeen','medicalWorkerRevisited','strangeManHatCollected','strangeManHatLensInspected',
    'STRANGE_MAN_HAT','EAST_SUPPORT_CLUE','medicalContradiction'
  ])assert(source.includes(token),`Strange Man sabotage investigation omitted ${token}`);
});

await test('2.9A.25 chapter results use real optional quest state and one merged clear screen',async()=>{
  const source=await fetchFresh('../js/story/story-polish.js').then(r=>r.text());
  assert(source.includes('chapter2State?.hubQuests?.optional'),'Chapter 2 results still read the wrong quest state');
  assert(source.includes('chapter3State?.optional'),'Chapter 3 results still read the wrong quest state');
  assert(source.includes('nativeCompletionOverlay')&&source.includes('nativeContinue'),'native and global completion screens are not merged');
  assert(source.includes('XP earned this run')&&source.includes('Optional quests'),'per-run results are incomplete');
});

await test('2.9A.25 secret code is menu-only and settings only expose connected features',async()=>{
  const [polish,settings]=await Promise.all([fetchFresh('../js/story/story-polish.js').then(r=>r.text()),fetchFresh('../js/settings-panel.js').then(r=>r.text())]);
  assert(polish.includes('storyMenuContextActive')&&polish.includes('!currentStoryRoot()'),'secret code can still open during active gameplay');
  for(const removed of ['Resolution Scale','Clash Input','Hold Instead of Mash','Input Buffer Display'])assert(!settings.includes(removed),`unsupported setting still visible: ${removed}`);
  assert(settings.includes('Voice Volume (Future Voice Acting)')&&settings.includes('rangeFuture'),'future voice setting is not honestly labeled');
  assert(settings.includes('Reset Hub Camera'),'camera reset action is missing');
});

await test('2.9A.25 hub collision blocks structures and keeps Echo Village spawns clear',()=>{
  const stage=getArenaStage('echo-village'),colliders=stageHubColliders(stage);
  assert(colliders.length>=25,'Echo Village lacks enough structure colliders');
  const fighter={x:-520,z:210,y:0,collisionRadius:36,moveVX:4,moveVZ:3,kvx:0,kvz:0};
  assert(resolveHubWorldCollision(stage,fighter),'player passed through an Echo Village house');
  assert(Math.hypot(fighter.x+520,fighter.z-210)>20,'collision did not move the player outside the wall');
  for(const point of [{x:-1363,z:100},{x:-820,z:60},{x:-680,z:300},{x:777,z:450},{x:100,z:120}]){
    const probe={...point,y:0,collisionRadius:36};
    assert(!resolveHubWorldCollision(stage,probe),`Chapter 4 spawn ${point.x},${point.z} begins inside a wall`);
  }
});

await test('2.9A.25 Chapter 3 consolidates evidence instead of forcing repeated plaza laps',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-3.js').then(r=>r.text());
  for(const token of ['SABOTAGE_EVIDENCE_POINTS','inspectSabotageEvidence','sabotageEvidence','sabotageConfirmed'])assert(source.includes(token),`Chapter 3 evidence pass omitted ${token}`);
});

await test('2.9A.25 Chapter 4 makes teamwork playable with QTE roles, waves, allies, and optional swarms',async()=>{
  const [source,content]=await Promise.all([fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text()),fetchFresh('../js/story/chapter4-content.js').then(r=>r.text())]);
  for(const token of ['startTeamMechanicQte','TEAM BATTLE • VILLAGE DEFENSE','advanceFightWave','drawTeamAllies','ingredient-swarm','SHORTCUT TO ROOTSTONE CHAMBER'])assert(source.includes(token),`Chapter 4 team gameplay omitted ${token}`);
  assert(source.includes("waves:[{id:'hollow-grunt'")&&source.includes("teamBattle:true"),'mandatory team defense is not a multi-wave fight');
  assert(content.includes('swarmsCleared'),'optional swarm completion is not saved');
});

await test('2.9A.25 Hollow Watcher learns full combat routes instead of one repeated button',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text());
  for(const token of ['spacing=','approach=','watcherSignature','watcherPatternName','memory.signature','timingChanged','brokeLearned'])assert(source.includes(token),`Hollow Watcher adaptation omitted ${token}`);
});

await test('2.9A.25 optional stat rewards use diminishing returns',()=>{
  const raw={hp:60,power:12,defense:12,speed:12,focus:12},effective=effectiveStoryBonusStats(raw);
  assert(effective.hp<raw.hp&&effective.power<raw.power,'optional bonuses do not use a soft cap');
  assert(storyStatsForLevel(5,raw).hp<100+16+raw.hp,'soft-capped bonuses are not applied to Story stats');
});

await test('2.9A.25 procedural music includes quiet and ambient phrase variation',async()=>{
  const source=await fetchFresh('../js/audio-manager.js').then(r=>r.text());
  for(const token of ['%6','quietPhrase','ambientPhrase','rotation='])assert(source.includes(token),`music variation omitted ${token}`);
});

await test('2.9A.25.1 Chapter Select uses full width and exposes Chapter 4 replay or restart',async()=>{
  const [storySource,cssSource,polishSource]=await Promise.all([
    fetchFresh('../js/story/lost-year-story.js').then(response=>response.text()),
    fetchFresh('../css/interface-unified-29a6.css').then(response=>response.text()),
    fetchFresh('../js/story/story-polish.js').then(response=>response.text())
  ]);
  assert(cssSource.includes('.routeHomeView:not([hidden])')&&cssSource.includes('grid-column:1/-1'),'Chapter Select does not span the full route layout');
  assert(storySource.includes("chapter.number===4&&unlocked&&started")&&storySource.includes('data-replay-chapter')&&storySource.includes('data-reset-chapter4'),'Chapter 4 replay/restart/fresh-start actions are missing');
  assert(polishSource.includes("pxstorymenuopen")&&polishSource.includes('onStoryMenuOpen'),'Story menu does not clear stale objective UI');
});

await test('2.9A.29 training trials teach pursuit finishers, wall splats, ground bounces, and escapes',()=>{
  const parry=createTrainingTrialState('parry');for(let i=0;i<3;i++)recordTrainingTrialEvent(parry,'perfectParry');assert(parry.complete&&trainingTrialView(parry).percent===100,'parry trial did not complete');
  const combo=createTrainingTrialState('combo');recordTrainingTrialEvent(combo,'launcherHit');recordTrainingTrialEvent(combo,'pursuitStart');recordTrainingTrialEvent(combo,'pursuitFollowupHit');assert(combo.complete,'pursuit trial did not complete');
  const finisher=createTrainingTrialState('finisher');recordTrainingTrialEvent(finisher,'launcherHit');recordTrainingTrialEvent(finisher,'pursuitStart');recordTrainingTrialEvent(finisher,'pursuitFollowupHit',{kind:'pursuitLight'});recordTrainingTrialEvent(finisher,'pursuitFinisherHit');assert(finisher.complete,'linked pursuit finisher trial did not complete');
  const wall=createTrainingTrialState('wall');recordTrainingTrialEvent(wall,'wallSplat');assert(wall.complete,'wall-splat trial did not complete');
  const bounce=createTrainingTrialState('bounce');recordTrainingTrialEvent(bounce,'groundBounce');assert(bounce.complete,'ground-bounce trial did not complete');
  const escape=createTrainingTrialState('escape');recordTrainingTrialEvent(escape,'pursuitEscape');assert(escape.complete,'pursuit-escape trial did not complete');
  const guard=createTrainingTrialState('guard');recordTrainingTrialEvent(guard,'guardBreak');recordTrainingTrialEvent(guard,'grabHit');assert(guard.complete,'guard-break punish trial did not complete');
  const variation=createTrainingTrialState('variation');for(const action of ['light1','heavy','launcher','fireBlast','objectSwap'])recordTrainingTrialEvent(variation,'connectedAction',{action});assert(variation.complete&&variation.distinct.length===5,'variation trial did not require five distinct actions');
  resetTrainingTrial(variation,'charge');recordTrainingTrialEvent(variation,'chargeUpdate',{energy:84,moving:false});recordTrainingTrialEvent(variation,'chargeUpdate',{energy:20,moving:true});assert(variation.progress===0&&!variation.complete,'movement did not reset the energy discipline trial');
});

await test('2.9A.26 Arena Training exposes defensive dummy modes and live trial feedback',async()=>{
  const [arena,css]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../css/combat-feel-29a26.css').then(r=>r.text())]);
  for(const token of ['Perfect-Block Attempts','Counter After Hit','Air-Tech Practice','Random Defense','Guard-Break Punish','Unpredictable Route','recordTrainingEvent','updateTrainingTrialPanel'])assert(arena.includes(token),`Arena Training omitted ${token}`);
  assert(css.includes('.arenaTrialCard')&&css.includes('.energyFill.ready')&&css.includes('.guardFill.critical'),'training or resource feedback styles are missing');
});

await test('2.9A.26 impact freeze is adjustable without removing camera-shake accessibility',()=>{
  const full=sanitizeQolSettings({accessibility:{impactFreeze:'full',cameraShake:'full'}}),reduced=sanitizeQolSettings({accessibility:{impactFreeze:'reduced',cameraShake:'reduced'}}),off=sanitizeQolSettings({accessibility:{impactFreeze:'off',cameraShake:'off'}});
  assert(full.accessibility.impactFreeze==='full'&&reduced.accessibility.impactFreeze==='reduced'&&off.accessibility.impactFreeze==='off','impact-freeze setting did not sanitize');
});

await test('2.9A.26 Chapter 3 journal presents deductions, contradictions, and evidence as a case board',async()=>{
  const [source,css]=await Promise.all([fetchFresh('../js/story/rrvvfo-chapter-3.js').then(r=>r.text()),fetchFresh('../css/combat-feel-29a26.css').then(r=>r.text())]);
  for(const token of ['chapter3CaseBoard','CURRENT DEDUCTION','RRVVFO’S WORKING THEORY','UNRESOLVED CONTRADICTION','CASE BOARD'])assert(source.includes(token),`Chapter 3 case board omitted ${token}`);
  assert(css.includes('.c3CaseBoard')&&css.includes('.currentTheory')&&css.includes('.contradiction'),'case-board presentation styles are missing');
});

await test('2.9A.26 Chapter 4 enemy roles change stats and expose readable wave/team HUD',async()=>{
  assert(chapter4EnemyRole({name:'Hollow Scout'}).id==='scout','Scout role inference failed');
  assert(chapter4EnemyRole({name:'Project Hollow Commander'}).id==='commander','Commander role inference failed');
  assert(CHAPTER4_ENEMY_ROLES.heavy.defense>1&&CHAPTER4_ENEMY_ROLES.scout.speed>1,'enemy roles do not create distinct behavior');
  const [source,css]=await Promise.all([fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text()),fetchFresh('../css/combat-feel-29a26.css').then(r=>r.text())]);
  for(const token of ['chapter4EnemyRole','updateEnemyRoleHud','updateTeamCombatHud','showWaveBanner','storySpeedMultiplier','storyAttackMultiplier'])assert(source.includes(token),`Chapter 4 role pass omitted ${token}`);
  assert(css.includes('.c4EnemyRole')&&css.includes('.c4TeamStatus')&&css.includes('.c4WaveBanner'),'Chapter 4 combat readability HUD is missing');
});

await test('2.9A.26 character motion identity and full-energy/critical-guard cues are wired',async()=>{
  const arena=await fetchFresh('../js/arena/arena-mode.js').then(r=>r.text());
  for(const token of ["rrvvfo:{trail:'#ff6a31'","revvfo:{trail:'#7c42c8'","wade:{trail:'#72e7ff'","bark:{trail:'#c99a58'","classList.toggle('nearReady'","classList.toggle('critical'"])assert(arena.includes(token),`combat identity/readability omitted ${token}`);
});


await test('2.9A.40.2 Chapter 1 starts with active field movement and offers three road routes plus transport rescue',async()=>{
  const [training,road]=await Promise.all([fetchFresh('../js/story/rrvvfo-mission-0.js').then(r=>r.text()),fetchFresh('../js/story/rrvvfo-road-hub.js').then(r=>r.text())]);
  for(const token of ['OBJECT SWAP FIELD TRIAL','SWAP_MARKERS','FIELD TECHNIQUE MASTERED'])assert(training.includes(token),`Chapter 1 active field training omitted ${token}`);
  for(const token of ['CHOOSE A ROUTE','data-road-route="main"','data-road-route="forest"','data-road-route="cliff"','RECOVER THE TRANSPORT WHEEL','transportRescued'])assert(road.includes(token),`Tournament Road pacing omitted ${token}`);
});

await test('2.9A.27 Chapter 2 observation reduces rumor errands without removing tournament matches',async()=>{
  const [mission,quests]=await Promise.all([fetchFresh('../js/story/rrvvfo-mission-2.js').then(r=>r.text()),fetchFresh('../js/story/chapter2-hub-quests.js').then(r=>r.text())]);
  assert(mission.includes('grantObservedPloukeClue')&&mission.includes('RING SUPPORT SHIFTS'),'Chapter 2 observation or ring set piece is missing');
  assert(quests.includes("'bark-pouki':1")&&quests.includes('final:3'),'Chapter 2 still requires all four rumor errands');
});

await test('2.9A.27 Chapter 3 consolidates footage reconstruction and keeps the facility payoff',async()=>{
  const source=await fetchFresh('../js/story/rrvvfo-chapter-3.js').then(r=>r.text());
  for(const token of ['reconstructSecurityFootage','RECONSTRUCT THE INCIDENT','FACILITY LOCKDOWN','inspectTournamentData'])assert(source.includes(token),`Chapter 3 investigation pacing omitted ${token}`);
});

await test('2.9A.27 Chapter 4 adds team rest, ally commands, and changed cavern return',async()=>{
  const [source,content]=await Promise.all([fetchFresh('../js/story/rrvvfo-chapter-4.js').then(r=>r.text()),fetchFresh('../js/story/chapter4-content.js').then(r=>r.text())]);
  for(const token of ["teamCommand='focus'",'TEAM COMMAND','At least this isn’t the exact same walk twice','One minute. Then I’m moving.'])assert(source.includes(token),`Chapter 4 pacing omitted ${token}`);
  assert(content.includes('teamRestSeen:false'),'Chapter 4 team-rest state is missing');
});



await test('2.9A.27.2 roadside defeat recovery and map guidance are explicit',async()=>{
  const [road,map,css]=await Promise.all([
    fetchFresh('../js/story/rrvvfo-road-hub.js').then(r=>r.text()),
    fetchFresh('../js/story/story-map.js').then(r=>r.text()),
    fetchFresh('../css/interface-unified-29a6.css').then(r=>r.text())
  ]);
  for(const token of ['showRoadDefeatOptions','data-road-rematch','data-road-leave-fight','setRoadFightUi(true)','roadFightActive','mapPoints()'])assert(road.includes(token),`roadside recovery omitted ${token}`);
  for(const token of ['storyMapLegend',"kind==='optional'","kind==='route'"])assert(map.includes(token),`map clarity omitted ${token}`);
  assert(css.includes('.roadDefeat[hidden]')&&css.includes('.roadFightActive .roadHud'),'roadside defeat or combat-safe HUD styles are missing');
});

await test('Chapter 4 replay always starts from a fresh temporary state',async()=>{
  const [chapter4,story]=await Promise.all([
    fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text()),
    fetchFresh('../js/story/lost-year-story.js').then(response=>response.text())
  ]);
  assert(chapter4.includes('this.replayMode=Boolean(replay)'),'Chapter 4 replay still depends on a completedMissions flag');
  assert(chapter4.includes('this.state=this.replayMode?freshChapter4State():this.savedState'),'Chapter 4 replay does not create a fresh run state');
  assert(chapter4.includes('this.savedState.chapterComplete||chapter4Complete(this.savedState)'),'legacy Chapter 4 completion is not recognized');
  assert(story.includes("starterOptions.replay?(progressBeforeStart.lastCheckpoint||liveProgress.lastCheckpoint):stepId"),'Chapter Select replay overwrites the player’s saved checkpoint');
  assert(chapter4.includes("this.root.querySelector('.c4Hud').hidden=true"),'Chapter 4 completion leaves the exploration HUD visible');
});

await test('2.9A.36.1 Chapter 4 replay hides stale completion choice and QTE overlays',async()=>{
  const [chapter4,css]=await Promise.all([
    fetchFresh('../js/story/rrvvfo-chapter-4.js').then(response=>response.text()),
    fetchFresh('../css/interface-unified-29a6.css').then(response=>response.text())
  ]);
  for(const token of ['.c4Choice[hidden]','.c4Qte[hidden]','.c4Complete[hidden]','display:none!important'])assert(css.includes(token),`Chapter 4 hidden overlay rule omitted ${token}`);
  assert(chapter4.includes('resetTransientPresentation(){'),'Chapter 4 does not clear transient overlays when a run starts');
  assert(chapter4.includes('this.resetTransientPresentation();'),'Chapter 4 start does not invoke the transient-overlay reset');
});

await test('2.9A.36.3 Chapter 4 hidden state overrides every desktop overlay display rule',async()=>{
  const css=await fetchSource('../css/interface-unified-29a6.css');
  assert(css.includes('#rrvvfoChapter4UI[hidden],#rrvvfoChapter4UI [hidden]{display:none!important}'),'Chapter 4 does not enforce hidden state across its desktop UI');
  for(const token of ['.c4Hud{','.c4Transition{','.c4StoryMenu{'])assert(css.includes(token),`Expected Chapter 4 display-bearing UI omitted ${token}`);
});

await test('2.9A.36.3 Chapter 4 menu close repairs stale visible-menu state',async()=>{
  const chapter4=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  assert(chapter4.includes("closeStoryMenu(){const panel=this.root?.querySelector('[data-c4-menu]');if(panel)panel.hidden=true;this.storyMenuOpen=false"),'Chapter 4 close button still exits early when menu state is stale');
  assert(chapter4.includes("this.storyMenuOpen=false;this.storyMenuPaused=false;this.trackerOpen=false"),'Chapter 4 startup does not normalize menu state');
});

await test('2.9A.36.3 Chapter 4 completion closes menus before changing mode',async()=>{
  const chapter4=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  assert(chapter4.includes("showCompletion(){this.closeStoryMenu();this.closeTracker();")&&chapter4.includes("this.mode='complete';this.battle.phase='story'"),'Chapter 4 completion can leave Story Menu or Journal open');
});




await test('2.9A.29 pursuit rules are bounded and prevent repeated wall or ground loops',()=>{
  assert(pursuitWindowFor('launcher')>pursuitWindowFor('heavy'),'launcher pursuit window is not longer than heavy');
  assert(pursuitDurationFor(0,950,'rrvvfo')===PURSUIT_TUNING.chaseMin,'minimum pursuit duration is not clamped');
  assert(pursuitDurationFor(9999,950,'wade')===PURSUIT_TUNING.chaseMax,'maximum pursuit duration is not clamped');
  assert(canWallSplat({nearWall:true,kind:'heavy'})&&!canWallSplat({nearWall:true,kind:'heavy',used:true})&&!canWallSplat({ringOutEnabled:true,nearWall:true,kind:'heavy'}),'wall-splat one-use or ring-out protections failed');
  assert(canGroundBounce({kind:'pursuitHeavy',airborne:true})&&!canGroundBounce({kind:'pursuitHeavy',airborne:true,used:true})&&!canGroundBounce({kind:'heavy',airborne:true}),'ground-bounce one-use or move restrictions failed');
});

await test('2.9A.29 movement identities keep fighters distinct without damage modifiers',()=>{
  const wade=dashIdentityFor('wade'),bark=dashIdentityFor('bark'),rrvvfo=dashIdentityFor('rrvvfo'),revvfo=dashIdentityFor('revvfo');
  assert(wade.cooldown<bark.cooldown&&wade.speedScale>bark.speedScale,'Wade and Bark dash identities are not distinct');
  assert(bark.armorFrames>0&&rrvvfo.sideFeint>0&&revvfo.pursuitBlink>0,'fighter-specific dash traits are missing');
  for(const profile of [wade,bark,rrvvfo,revvfo])assert(!('damage' in profile),'movement identity illegally changes damage');
});

await test('2.9A.29 Arena wires buffered pursuit, defensive tech, one-use reactions, and readable prompts',async()=>{
  const [arena,manual]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/story/combat-manual.js').then(r=>r.text())]);
  for(const token of ['pursuitBuffered','tryPursuitEscape','comboWallSplatUsed','comboGroundBounceUsed','groundBouncePending','data-pursuit-prompt','Pursuit Pressure'])assert(arena.includes(token),`Arena pursuit pass omitted ${token}`);
  const manualLower=manual.toLowerCase();for(const token of ['pursuit tech','wall splat','ground bounce','ideal pursuit combo'])assert(manualLower.includes(token),`Sage Manual pursuit lesson omitted ${token}`);
});


await test('2.9A.29.1 Pursuit Tech uses a fair fixed 15-Energy threshold',()=>{
  assert(PURSUIT_TUNING.escapeCost===15,'Pursuit Tech cost is not 15 Energy');
  assert(pursuitTechAvailable(15,0)&&!pursuitTechAvailable(14.99,0),'exact Pursuit Tech threshold is incorrect');
  assert(!pursuitTechAvailable(100,.01),'Pursuit Tech ignores its cooldown');
});

await test('2.9A.29.1 pursuit prompts support Full Minimal and Off without changing combat rules',()=>{
  assert(pursuitPromptText({mode:'off',window:true})==='','Off pursuit prompts still render text');
  assert(pursuitPromptText({mode:'minimal',window:true})==='DASH','Minimal pursuit prompt is not compact');
  assert(pursuitPromptText({mode:'full',incoming:true,energy:15}).includes('15 ENERGY'),'Full defensive prompt omits the fixed cost');
  assert(pursuitPromptText({mode:'full',chasing:true,attackReady:true}).includes('ATTACK READY'),'attack-ready pursuit prompt is missing');
});

await test('2.9A.29.1 pursuit feedback and cleanup are wired for mobile and Story transitions',async()=>{
  const [arena,qol,settings,audio,main]=await Promise.all([
    fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/qol-settings.js').then(r=>r.text()),fetchFresh('../js/settings-panel.js').then(r=>r.text()),fetchFresh('../js/audio-manager.js').then(r=>r.text()),fetchFresh('../js/main.js').then(r=>r.text())
  ]);
  for(const token of ['pursuitReadyFlash','pursuitLockOn','pursuitCameraBlend','cameraZoomScale','promptMobileLinger','pursuitPromptLinger','RESET COMBAT STATE','data-training-pursuit-defense','techReady','pursuit-active','clearPursuitState'])assert(arena.includes(token),`Pursuit feel pass omitted ${token}`);
  for(const token of ["pursuitPrompts:'full'","['full','minimal','off']"])assert(qol.includes(token)||settings.includes(token),`Pursuit prompt setting omitted ${token}`);
  assert(audio.includes('duckMusic')&&main.includes('pxcombatduck'),'pursuit music ducking is not connected');
});

await test('2.9A.29.1 Training sells the full pursuit route and grades timing',()=>{
  const state=createTrainingTrialState('finisher');
  recordTrainingTrialEvent(state,'launcherHit');recordTrainingTrialEvent(state,'pursuitStart');recordTrainingTrialEvent(state,'pursuitBuffer',{timing:.4});recordTrainingTrialEvent(state,'pursuitFollowupHit',{kind:'pursuitLight'});const result=recordTrainingTrialEvent(state,'pursuitFinisherHit');
  assert(result.completed&&['GREAT','PERFECT'].includes(result.grade),'Ideal Pursuit Combo does not grade a successful route');
  assert(pursuitTimingGrade(1)==='GOOD'&&pursuitTimingGrade(2)==='GREAT'&&pursuitTimingGrade(3)==='PERFECT','pursuit timing grade thresholds are incorrect');
  assert(TRAINING_TRIALS.pressure&&TRAINING_TRIALS.finisher.label==='Ideal Pursuit Combo','new pursuit training scenarios are missing');
});

await test('2.9A.28 mode and route selectors use one-card carousels',async()=>{
  const menuSource=await fetchFresh('../js/main-menu.js').then(response=>response.text());
  const storySource=await fetchFresh('../js/story/lost-year-story.js').then(response=>response.text());
  const css=await fetchFresh('../css/mode-route-carousel-29a28.css').then(response=>response.text());
  assert(menuSource.includes('MODE SELECT')&&menuSource.includes('modeCarouselStage'),'mode carousel implementation is missing');
  assert(menuSource.includes('Experience what happened after Rrvvfo defeated Revvfo.'),'Story mode description is outdated');
  assert(storySource.includes('ROUTE SELECT')&&storySource.includes('1 / 1'),'single-character route carousel is missing');
  assert(storySource.includes('OPEN RRVVFO ROUTE'),'Rrvvfo route does not lead to Chapter Select');
  assert(css.includes('.modeCarouselStage')&&css.includes('.storyRouteCarouselStage'),'carousel presentation CSS is missing');
});

await test('2.9A.28.1 mobile Story hubs use compact HUDs and spacious sheets',async()=>{
  const [index,main,css,ui]=await Promise.all([
    fetchFresh('../index.html').then(response=>response.text()),
    fetchFresh('../js/main.js').then(response=>response.text()),
    fetchFresh('../css/mobile-story-space-29a281.css').then(response=>response.text()),
    fetchFresh('../js/story/mobile-story-ui.js').then(response=>response.text())
  ]);
  assert(index.includes('mobile-story-space-29a281.css'),'mobile Story stylesheet is not loaded');
  assert(main.includes('initializeMobileStoryUi'),'mobile Story enhancer is not initialized');
  for(const token of ['.storyMiniMap{display:none!important}','grid-template-columns:minmax(0,1fr) 48px','place-items:end center','grid-auto-flow:column','chapter2QuestJournal'])assert(css.includes(token),`spacious mobile Story UI omitted ${token}`);
  for(const token of ['mobileObjectiveToggle','mobileObjectiveExpanded','MutationObserver','orientationchange'])assert(ui.includes(token),`mobile objective disclosure omitted ${token}`);
});

await test('2.9A.29.2 unifies combat HUD feedback without changing pursuit balance',async()=>{
  const [arena,css,index]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../css/combat-hud-feedback-29a292.css').then(r=>r.text()),fetchFresh('../index.html').then(r=>r.text())]);
  for(const token of ["combatEvent('perfectParry'","combatEvent('guardBreak'","combatEvent('pursuitTech'","combatEvent('wallSplat'","combatEvent('groundBounce'",'selectedAbilitySlot','justReady','hudCriticalHealth'])assert(arena.includes(token),`Combat HUD pass omitted ${token}`);
  for(const token of ['.combatEventLayer','.guardFill.eventBreak','.arenaAbility.selected','pursuit-active .arenaHotbar'])assert(css.includes(token),`Combat feedback stylesheet omitted ${token}`);
  assert(index.includes('combat-hud-feedback-29a292.css'),'combat HUD stylesheet is not loaded');
  assert(PURSUIT_TUNING.escapeCost===15,'combat HUD polish changed Pursuit Tech balance');
});


await test('2.9A.30 Focus Recovery uses gray health, startup, and fixed energy conversion',()=>{
  const fighter={maxHp:100,hp:60,en:100};resetFocusRecovery(fighter);registerRecoverableDamage(fighter,20);
  assert(fighter.recoverableHp>0&&fighter.recoverableHp<=20,'recoverable-health cap failed');
  let result=channelFocusRecovery(fighter,.59,{eligible:true});assert(!result.active&&fighter.hp===60,'recovery started before the 0.6-second startup');
  result=channelFocusRecovery(fighter,.01,{eligible:true});assert(result.active,'recovery did not activate at 0.6 seconds');
  const hp=fighter.hp,en=fighter.en;result=channelFocusRecovery(fighter,1,{eligible:true});
  assert(Math.abs((fighter.hp-hp)-5)<.001,'healing rate is not 5 HP per second');
  assert(Math.abs((en-fighter.en)-10)<.001,'energy conversion is not 2 Energy per HP');
  assert(FOCUS_RECOVERY_RULES.maxRecoverableRatio===.20,'recoverable-health cap is not 20%');
});

await test('2.9A.30 Focus Recovery creates release recovery and clears safely',()=>{
  const fighter={maxHp:100,hp:50,en:100};resetFocusRecovery(fighter);registerRecoverableDamage(fighter,25);channelFocusRecovery(fighter,.6,{eligible:true});
  assert(endFocusRecovery(fighter),'ending an active recovery did not report the attempt');
  assert(Math.abs(fighter.focusRecoveryRelease-FOCUS_RECOVERY_RULES.releaseRecovery)<.001,'release recovery is not 0.3 seconds');
  tickFocusRecovery(fighter,FOCUS_RECOVERY_RULES.releaseRecovery);assert(fighter.focusRecoveryRelease===0,'release recovery did not clean up');
});

await test('2.9A.30 stages expose distinct playstyle profiles and clean tournament rules',()=>{
  const stages=listArenaStages(),tournament=stages.find(stage=>stage.id==='tournament');
  assert(tournament?.available&&tournament.boundary==='RING-OUT'&&tournament.archetype==='EDGE CONTROL','Tournament profile is not a clean ring-out identity');
  assert(stageProfile('dojo').archetype==='PRESSURE','Dojo pressure identity is missing');
  assert(stageProfile('echo-mountain').size==='EXTRA LARGE','Mountain pursuit identity is missing');
  assert(stages.filter(stage=>stage.available).length>=5,'expanded Arena stage catalog is incomplete');
});

await test('2.9A.30 Arena wires stage identity, tournament atmosphere, and Focus Recovery',async()=>{
  const [arena,manual,stages]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(r=>r.text()),fetchFresh('../js/story/combat-manual.js').then(r=>r.text()),fetchFresh('../js/arena/arena-stages.js').then(r=>r.text())]);
  for(const token of ['data-focus-recovery-cue','data-training-recovery','FOCUS RECOVERY • VULNERABLE','registerRecoverableDamage','drawStageIdentity','crowdExcitement','stageBoundaryPulse'])assert(arena.includes(token),`Arena identity/recovery pass omitted ${token}`);
  for(const token of ['RING-OUT','EDGE CONTROL','PRESSURE','PURSUIT'])assert(stages.includes(token),`Stage profiles omitted ${token}`);
  const lower=manual.toLowerCase();for(const token of ['block + charge','gray portion','2 energy','20%'])assert(lower.includes(token),`Sage Manual Focus Recovery lesson omitted ${token}`);
});


await test('2.9A.30.1 Focus Recovery startup cancels cleanly without accidental release lag',()=>{
  const fighter={maxHp:100,hp:60,en:100};resetFocusRecovery(fighter);registerRecoverableDamage(fighter,20);
  channelFocusRecovery(fighter,.3,{eligible:true});assert(fighter.focusRecoveryStartup>.29,'startup did not begin');
  assert(endFocusRecovery(fighter),'startup cancellation did not report an attempt');
  assert(fighter.focusRecoveryRelease===0,'startup-only cancellation incorrectly created vulnerable release recovery');
  channelFocusRecovery(fighter,.4,{eligible:true});const unsafe=channelFocusRecovery(fighter,.01,{eligible:false});
  assert(!unsafe.active&&fighter.focusRecoveryStartup===0,'unsafe startup retained progress');
});

await test('2.9A.30.1 Focus Recovery availability preserves normal Block when healing is unavailable',()=>{
  const noGray={maxHp:100,hp:70,en:100};resetFocusRecovery(noGray);assert(!focusRecoveryAvailability(noGray,{eligible:true}).available,'recovery was available without gray health');
  const lowEnergy={maxHp:100,hp:70,en:0};resetFocusRecovery(lowEnergy);lowEnergy.recoverableHp=10;assert(focusRecoveryAvailability(lowEnergy,{eligible:true}).reason==='no-energy','zero-energy failure reason is unclear');
  const ready={maxHp:100,hp:70,en:15};resetFocusRecovery(ready);ready.recoverableHp=10;assert(focusRecoveryAvailability(ready,{eligible:true}).available,'valid recovery state was rejected');
});

await test('2.9A.30.1 Focus Recovery reports the current channel instead of the round total',()=>{
  const fighter={maxHp:100,hp:50,en:100};resetFocusRecovery(fighter);registerRecoverableDamage(fighter,25);channelFocusRecovery(fighter,.6,{eligible:true});channelFocusRecovery(fighter,.4,{eligible:true});
  assert(fighter.focusRecoveryChannelHealed>0&&fighter.focusRecoveredTotal===fighter.focusRecoveryChannelHealed,'first channel totals are inconsistent');
  endFocusRecovery(fighter);tickFocusRecovery(fighter,FOCUS_RECOVERY_RULES.releaseRecovery);registerRecoverableDamage(fighter,5);channelFocusRecovery(fighter,.59,{eligible:true});
  assert(fighter.focusRecoveryChannelHealed===0,'new channel inherited the previous channel total before healing');
});

await test('2.9A.30.1 preserves Story stats, initializes stage cameras, and clears Training recovery state',async()=>{
  const arena=await fetchFresh('../js/arena/arena-mode.js').then(response=>response.text());
  assert(!arena.includes("restart(){this.scores=[0,0];this.round=1;this.fighters[0].maxHp=100"),'restart still erases Story max HP');
  assert(arena.includes('this.camera=initialCameraState(this.stage,this.fighters)'), 'rounds still start from the fixed Dojo camera');
  assert(arena.includes('fighter.hp/Math.max(1,fighter.maxHp||100)<.70'),'CPU recovery still uses a fixed 70-HP threshold');
  assert(arena.includes("resetFocusRecovery(fighter);this.notice('TRAINING HEALTH & RECOVERY STATE RESTORED'"),'Training knockout does not clear recovery state');
});

await test('2.9A.30.1 Mountain Path is open while stage size labels match their dimensions',async()=>{
  const [arena,stages]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(response=>response.text()),fetchFresh('../js/arena/arena-stages.js').then(response=>response.text())]);
  assert(stageProfile('tournament').size==='MEDIUM','Tournament size label is overstated');
  assert(stageProfile('echo-caverns').size==='LARGE','Echo Caverns size label is understated');
  assert(stageProfile('echo-mountain').boundary==='OPEN','Mountain Path lost its open identity');
  assert(arena.includes("nearWall:this.stageProfile?.boundary==='WALLED'&&this.isNearStageWall"),'open stages can still wall splat against invisible limits');
  assert(arena.includes("if(this.stageProfile?.boundary!=='OPEN')"),'open-stage boundary lines are still rendered as hard walls');
});

await test('2.9A.30.1 mobile Arena UI separates prompts and uses compact Training and Stage carousels',async()=>{
  const [arena,css,index]=await Promise.all([fetchFresh('../js/arena/arena-mode.js').then(response=>response.text()),fetchFresh('../css/stability-cleanup-29a301.css').then(response=>response.text()),fetchFresh('../index.html').then(response=>response.text())]);
  for(const token of ['data-stage-prev','data-stage-next','data-stage-position','data-training-toggle','trainingPanelBody'])assert(arena.includes(token),`mobile Arena cleanup omitted ${token}`);
  for(const token of ['.arenaStageOption.is-current','.arenaTrainingPanel.collapsed','.focusRecoveryCue{top:max(116px','.combatEventLayer{top:max(150px'])assert(css.includes(token),`mobile cleanup stylesheet omitted ${token}`);
  assert(index.includes('stability-cleanup-29a301.css'),'stability cleanup stylesheet is not loaded');
});

await test('2.9A.30.2 smoke runner exposes progress, timeouts, recovery controls, and mixed-build detection',async()=>{
  const [html,bootstrap]=await Promise.all([
    fetchFresh('./smoke.html').then(response=>response.text()),
    fetchFresh('./smoke-bootstrap.js').then(response=>response.text())
  ]);
  for(const token of ['smokeProgress','currentTest','lastCompleted','retryFailed','runAgain','copyResults'])assert(html.includes(token),`smoke runner UI omitted ${token}`);
  for(const token of ['IMPORT_TIMEOUT_MS','STALL_TIMEOUT_MS','unhandledrejection','verifyActiveBuild','rerunFailed','rerunAll'])assert(bootstrap.includes(token),`smoke runner recovery omitted ${token}`);
});


await test('2.9A.31 fighter feel profiles make finished fighters meaningfully distinct',()=>{
  const r=fighterFeelFor('rrvvfo'),v=fighterFeelFor('revvfo'),w=fighterFeelFor('wade'),b=fighterFeelFor('bark');
  assert(r.inputBuffer>=.13,'Rrvvfo flexible input buffer missing');
  assert(w.dashCancel<r.dashCancel,'Wade must cancel dash earlier than Rrvvfo');
  assert(b.hitstopScale>r.hitstopScale&&b.shakeScale>r.shakeScale,'Bark impact identity is not heavier');
  assert(v.impactCue==='warp','Revvfo warp impact identity missing');
  assert(Object.keys(FIGHTER_FEEL_PROFILES).includes('default'),'default feel profile missing');
});
await test('2.9A.31 Arena packages late input buffering, identity guide, and instant rematches',async()=>{
  const source=await fetchSource('../js/arena/arena-mode.js');
  assert(source.includes("queueAction(fighter,action"),'late action buffer helper missing');
  assert(source.includes("fighter.actionBufferTime"),'action buffer timer missing');
  assert(source.includes('FIGHTER IDENTITY GUIDE'),'Training identity guide missing');
  assert(source.includes('data-random-rematch'),'random rematch action missing');
  assert(source.includes('INSTANT REMATCH'),'instant rematch label missing');
  assert(source.includes('allowRandomRematch'),'Story-safe random-rematch gate missing');
  assert(source.includes('!this.paused&&!this.identityGuideOpen'),'identity guide does not freeze Training safely');
  assert(source.includes("if(fighter.victoryPoseTime>0)return'victory'"),'finished atlas victory animation is not used');
});
await test('2.9A.31 active page loads the character-feel presentation stylesheet',async()=>{
  const html=await fetchSource('../index.html');
  assert(html.includes('core-feel-29a31.css'),'core feel stylesheet missing');
});



await test('2.9A.31.3 save export reset and schema validation cover the complete current save set',()=>{
  const required=['pxSave','pxLostYearProgressV1','pxLensMasteryV1','pxCombatManualV1','pxArenaControlsV1','pxDialoguePrefsV1','pxControllerSettingsV1','pxTouchSettingsV1','pxRrvvfoVisualsV1','pxQolSettingsV1','pxAbilityHotbarV1','pxMobilePresentationV1','pxTrainingPresetsV1'];
  for(const key of required)assert(SAVE_EXPORT_KEYS.includes(key),`save management omitted ${key}`);
  const source=memoryStorage();for(const key of required)source.setItem(key,JSON.stringify({key}));
  const exported=createSaveExport(source);assert(Object.keys(exported.data).length>=required.length,'full export omitted current data');
  const target=memoryStorage();target.setItem('pxHintsDismissed','stale');const imported=importSaveText(JSON.stringify(exported),target);
  assert(imported.ok&&target.getItem('pxHintsDismissed')===null,'import did not replace the complete known save set');
  const mismatch=validateSaveImport({...exported,schema:SAVE_SCHEMA_VERSION-1});assert(!mismatch.valid&&/schema/i.test(mismatch.error),'incompatible schema was accepted');
  resetSaveGroup('all',source);for(const key of SAVE_EXPORT_KEYS)assert(source.getItem(key)===null,`Reset All retained ${key}`);
});

await test('2.9A.31.3 Story save failure returns the verified previous state without false progress',()=>{
  const existing=JSON.stringify({version:1,completedMissions:['rrvvfo-00'],lastCheckpoint:'rrvvfo-01'});
  const storage={getItem:key=>key===LOST_YEAR_SAVE_KEY?existing:null,setItem:()=>{throw new Error('quota blocked')},removeItem:()=>{}};
  const result=saveLostYearProgress({version:1,completedMissions:['rrvvfo-00','rrvvfo-01'],lastCheckpoint:'rrvvfo-road'},storage);
  assert(result.lastCheckpoint==='rrvvfo-01'&&!result.completedMissions.includes('rrvvfo-01'),'failed save returned unsaved Story progress');
  assert(/quota blocked/i.test(lastLostYearSaveError()?.message||''),'Story save failure was not exposed');
});

await test('2.9A.31.3 every public stage surface uses the same five playable Arena stages',async()=>{
  const expected=['dojo','tournament','resonance-facility','echo-caverns','echo-mountain'];
  assert(Object.keys(STAGES).join(',')===expected.join(','),'shared Stage list is inconsistent');
  const [html,main,menu]=await Promise.all([fetchSource('../index.html'),fetchSource('../js/main.js'),fetchSource('../js/main-menu.js')]);
  for(const id of expected)assert(html.includes(`value="${id}"`)&&main.includes(id),`public setup omitted ${id}`);
  for(const legacy of ['value="asrylyte"','value="clonebase"','value="hell"'])assert(!html.toLowerCase().includes(legacy),`legacy stage remains selectable: ${legacy}`);
  assert(menu.includes('5 playable arenas'),'main menu stage availability is stale');
  for(const token of ['resilientStorage','loadTouchSettings(resilientStorage','storage:resilientStorage','safeStorageRemove'])assert(main.includes(token),`storage-safe startup omitted ${token}`);
  assert(!main.includes('loadTouchSettings(localStorage'),'startup still reads the throwing localStorage getter directly');
});

await test('2.9A.31.3 ring-out and Story recovery rules are data-driven and functional',async()=>{
  const [arena,polish]=await Promise.all([fetchSource('../js/arena/arena-mode.js'),fetchSource('../js/story/story-polish.js')]);
  assert(arena.includes("this.stageProfile?.boundary==='RING-OUT'"),'ring-out enablement is not profile-driven');
  assert(!arena.includes("this.stage.id==='tournament'&&this.matchMode!=='training'"),'ring-out still depends on the tournament ID');
  for(const token of ['PREFIGHT_BACKUP_KEY','storePreFightBackup','restorePreFightBackup','lastLostYearSaveError','clearPreFightBackup'])assert(polish.includes(token),`pre-fight recovery omitted ${token}`);
});

await test('2.9A.31.3 asset-less enemies keep individual accents and skip missing sprite requests',async()=>{
  const arena=await fetchSource('../js/arena/arena-mode.js');
  assert(arena.includes("accent=fighter.accent||roster.a"),'fallback renderer ignores fighter accents');
  assert(arena.includes("body=fighter.id==='rrvvfo'?'#be2026':(roster.c||accent)"),'fallback body does not use the enemy accent');
  assert(arena.includes("SPRITE_MANIFEST_IDS=new Set(['rrvvfo','revvfo','wade','bark','sage'])"),'supported manifest allowlist is missing');
  assert(arena.includes('if(!SPRITE_MANIFEST_IDS.has(String(id)))return null'),'unknown Story enemies still request missing manifests');
});

await test('2.9A.31.3 Chapter 4 playtesting can enter a clean temporary Echo Village hub',async()=>{
  const [polish,story,chapter4,chapter3]=await Promise.all([fetchSource('../js/story/story-polish.js'),fetchSource('../js/story/lost-year-story.js'),fetchSource('../js/story/rrvvfo-chapter-4.js'),fetchSource('../js/story/rrvvfo-chapter-3.js')]);
  for(const token of ['data-playtest-chapter-hub="4"','entry:\'hub\''])assert(polish.includes(token),`playtest hub menu omitted ${token}`);
  assert(story.includes("event.detail?.entry==='hub'"),'Story router does not preserve the hub jump');
  for(const token of ['playtestHub','enterPlaytestVillageHub','Fresh temporary Chapter 4 hub state'])assert(chapter4.includes(token),`Chapter 4 clean hub jump omitted ${token}`);
  for(const token of ['Project Hollow Scanner','RECORD RESPONSE PATTERN','Hollow Containment Unit'])assert(chapter3.includes(token),`rewritten Chapter 3 facility combat omitted ${token}`);
});

await test('2.9A.31.3 portrait combat retains compact critical cues without Training overlap',async()=>{
  const [html,css]=await Promise.all([fetchSource('../index.html'),fetchSource('../css/reliability-29a313.css')]);
  assert(html.includes('reliability-29a313.css'),'reliability presentation sheet is not active');
  for(const token of ['.pursuitPrompt','.focusRecoveryCue','.combatEventLayer','.edgeWarning','display:flex!important','.arenaTrainingPanel:not(.collapsed)'])assert(css.includes(token),`portrait reliability CSS omitted ${token}`);
  assert(!css.includes('display:none!important;\n  #arenaModeScreen .focusRecoveryCue'),'critical portrait cues are still globally hidden');
});

await test('2.9A.31.3 a timed-out smoke test stops before contaminating later tests',async()=>{
  const [runner,bootstrap]=await Promise.all([fetchSource('./smoke.js'),fetchSource('./smoke-bootstrap.js')]);
  for(const token of ['SmokeTimeoutError','PX_SMOKE_TIMEOUT',"if(error?.code==='PX_SMOKE_TIMEOUT')throw error"])assert(runner.includes(token),`timeout isolation omitted ${token}`);
  assert(bootstrap.includes('Timed-out test stopped the suite — reload before testing again'),'timeout recovery guidance is missing');
});


await test('2.9A.32 active page loads the shared Hub Charm presentation layer',async()=>{
  const [html,main]=await Promise.all([fetchSource('../index.html'),fetchSource('../js/main.js')]);
  assert(html.includes('hub-charm-29a32.css'),'Hub Charm stylesheet is not active');
  assert(main.includes("initializeStoryCharm"),'Story Charm controller is not initialized');
  assert(html.includes(RELEASE_CACHE_ID)&&main.includes(RELEASE_CACHE_ID),'2.9A.32 cache identity is not synchronized');
});

await test('2.9A.32 Story Charm supports arrivals banter progression and future fighter reveals',async()=>{
  const source=await fetchSource('../js/story/story-charm.js');
  for(const token of ['storyCharmArrival','storyCharmBanter','storyCharmCelebration','celebrateCharacterUnlock','storyCharmArrival','storyPartyBanter','storyProgressCelebration'])assert(source.includes(token),`Story Charm omitted ${token}`);
  assert(source.includes("cue:item.type==='level'?'levelUp':'unlock'"),'progression audio cues are not differentiated');
});

await test('2.9A.32 Story saves emit precise progression deltas without changing export schema',async()=>{
  const source=await fetchSource('../js/story/lost-year-data.js');
  for(const token of ['pxstoryprogression','newUnlocks','newMissions','newKeyItems','statChanges','oldLevel','newLevel'])assert(source.includes(token),`Story progression delta omitted ${token}`);
  assert(SAVE_SCHEMA_VERSION===268,'save export schema changed during presentation work');
});

await test('2.9A.32 milestone banter and arrival reactions cover the current four-chapter route',async()=>{
  const source=await fetchSource('../js/story/story-charm.js');
  for(const token of ['rrvvfo-road-bridge','rrvvfo-02-hub','rrvvfo-03-facilityEntered','rrvvfo-04-villageReached','rrvvfo-04-villageDefended','rrvvfo-04-lookoutReached'])assert(source.includes(token),`checkpoint reaction omitted ${token}`);
  for(const speaker of ['RRVVFO','BARK','WADE'])assert(source.includes(speaker),`party banter omitted ${speaker}`);
});

await test('2.9A.32 Chapter 2 adds a playful photo activity instead of another fetch quest',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['FESTIVAL PHOTO STAND','useFestivalPhotoStand','PLAYFUL SIDE ACTIVITY','NO FETCH QUEST','festivalPhotoTaken'])assert(source.includes(token),`Festival Photo activity omitted ${token}`);
  assert(source.includes('SERIOUS TEAM POSE')&&source.includes('WADE CHOOSES')&&source.includes('RRVVFO SOLO POSE'),'photo activity does not offer distinct joke choices');
});

await test('2.9A.32 Chapter 2 ambient NPC reactions change with major tournament progress',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['afterBrawl','ringFixed','raceDone','The repaired supports are holding perfectly','That practice brawl was better than the opening ceremony'])assert(source.includes(token),`state-aware tournament reaction omitted ${token}`);
  assert(source.includes('festivalPhase'),'tournament decorations do not scale with Story progress');
});

await test('2.9A.32 Echo Chime Jam is persistent and Chapter 4 state normalizes it safely',async()=>{
  const [content,chapter4]=await Promise.all([fetchSource('../js/story/chapter4-content.js'),fetchSource('../js/story/rrvvfo-chapter-4.js')]);
  assert(content.includes('CHAPTER4_STATE_VERSION=5'),'Chapter 4 state version was not advanced');
  assert(content.includes('echoChimesComplete'),'Echo Chime completion is not normalized');
  for(const token of ['PLAY THE ECHO CHIMES','playEchoChimes','ECHO CHIME JAM','No item hunt, no combat'])assert(chapter4.includes(token),`Echo Chime activity omitted ${token}`);
});

await test('2.9A.32 Echo Village visuals react to beacon lift defense and party activity progress',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['defended=chapter4VillageDefenseComplete','beaconOnline','liftReady','echoChimesComplete','const villagers=defended?'])assert(source.includes(token),`evolving Echo Village visuals omitted ${token}`);
  assert(source.includes('VILLAGE REACTION'),'side activity does not advertise its hub reaction');
});


await test('2.9A.33 non-tournament stages use deliberate route-shaping geometry',()=>{
  assert(stageGeometryFor('tournament').length===0,'official Tournament ring gained obstacles');
  assert(stageGeometryFor('resonance-facility').length===2,'Facility conduit lanes are missing');
  assert(stageGeometryFor('echo-caverns').length===3,'Cavern crystal routes are missing');
  assert(stageGeometryFor('echo-mountain').length===2,'Mountain ridge route shapers are missing');
  assert(stagePersonalityFor('dojo').label==='PRESSURE FLOOR','Dojo pressure identity is missing');
  assert(Object.isFrozen(STAGE_PERSONALITY),'stage personality data is mutable');
});

await test('2.9A.33 stage geometry blocks fighters and projectiles without changing Story hubs',async()=>{
  const stage=getArenaStage('echo-caverns'),piece=stageGeometryFor(stage)[0],fighter={x:piece.x,z:piece.z,collisionRadius:29,moveVX:120,moveVZ:80,kvx:30,kvz:20};
  assert(resolveStageGeometry(stage,fighter),'fighter was not pushed out of a crystal route blocker');
  assert(Math.hypot(fighter.x-piece.x,fighter.z-piece.z)>=piece.radius+18,'fighter remained inside stage geometry');
  assert(projectileHitsStageGeometry(stage,{x:piece.x,z:piece.z,radius:12})===piece,'projectile did not collide with route geometry');
  const source=await fetchSource('../js/arena/arena-mode.js');
  assert(source.includes("stagePersonalityEnabled(){return !this.root?.classList.contains('storyEngineActive')"),'Story hubs are not protected from Arena-only route geometry');
});

await test('2.9A.33 Hollow Watcher teaches a three-phase readable boss dance',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['PHASE 1 • ACTION SCAN','PHASE 2 • RANGE SCAN','PHASE 3 • ROUTE SCAN','watcherPhaseForHp','watcherPatternName','PATTERN BROKEN • WATCHER EXPOSED','adjusted*=1.35','exposedUntil'])assert(source.includes(token),`Watcher clarity pass omitted ${token}`);
  assert(source.includes("ADAPTED • ${patternName}"),'Watcher learned pattern is not named clearly');
});

await test('2.9A.33 Quick Battle launches the last safe matchup as first to one',async()=>{
  const [html,main]=await Promise.all([fetchSource('../index.html'),fetchSource('../js/main.js')]);
  for(const token of ['quickBattleButton','QUICK BATTLE'])assert(html.includes(token),`Quick Battle UI omitted ${token}`);
  for(const token of ["U.mode.value='cpu'","U.rounds.value='1'","startGame()","battleModeUnlocked('cpu')"])assert(main.includes(token),`Quick Battle launch omitted ${token}`);
});

await test('2.9A.33 active page loads boss and stage personality presentation',async()=>{
  const html=await fetchSource('../index.html');
  assert(html.includes('boss-stage-personality-29a33.css'),'2.9A.33 presentation stylesheet is missing');
  assert(html.includes(RELEASE_CACHE_ID),'2.9A.33 cache identity is not synchronized');
});


await test('2.9A.34 signature profiles preserve four distinct decision identities',async()=>{
  const mod=await import('../js/arena/signature-combat.js');
  const ids=['rrvvfo','revvfo','wade','bark'],labels=ids.map(id=>mod.signatureProfileFor(id).label);
  assert(new Set(labels).size===4,'signature labels are not distinct');
  assert(mod.signatureProfileFor('rrvvfo').event==='signatureRrvvfo','Rrvvfo improvised-angle event missing');
  assert(mod.signatureProfileFor('bark').reward.guard===6,'Bark armored-punish reward missing');
  assert(Object.isFrozen(mod.SIGNATURE_COMBAT_PROFILES),'signature profiles are mutable');
});

await test('2.9A.34 Arena wires Object Swap, pressure, near-miss, and armor punish moments',async()=>{
  const source=await fetchSource('../js/arena/arena-mode.js');
  for(const token of ["swapAngleWindow=.82","pressureChain>=3","target.id==='wade'&&target.dashTime>0","armoredCounterWindow=.82","triggerSignature(attacker,'signatureRrvvfo')","triggerSignature(attacker,'signatureBark')"])assert(source.includes(token),`signature combat omitted ${token}`);
});

await test('2.9A.34 final KOs use a stronger fighter-colored finish without changing KO rules',async()=>{
  const [source,mod]=await Promise.all([fetchSource('../js/arena/arena-mode.js'),import('../js/arena/signature-combat.js')]);
  const bark=mod.finalKoImpactFor('bark','heavy'),wade=mod.finalKoImpactFor('wade','light');
  assert(bark.shake>wade.shake,'Bark final-KO weight is not heavier');
  for(const token of ['finalKoImpactFor','finalKoPulse',"this.audio.play('finalKo'",'this.scores[winner]+1>=this.koTarget'])assert(source.includes(token),`final-KO presentation omitted ${token}`);
  assert(bark.label.startsWith('FINAL K.O.'),'final-KO label is missing');
});

await test('2.9A.34 Training includes one short identity trial for each finished fighter',async()=>{
  const [trials,source]=await Promise.all([import('../js/training-trials.js'),fetchSource('../js/arena/arena-mode.js')]);
  for(const id of ['rrvvfoIdentity','revvfoIdentity','wadeIdentity','barkIdentity'])assert(trials.TRAINING_TRIALS[id],`missing ${id}`);
  let state=trials.createTrainingTrialState('wadeIdentity');const result=trials.recordTrainingTrialEvent(state,'signatureWade');assert(result.completed&&state.complete,'Wade identity trial did not complete');
  for(const token of ['Rrvvfo • Improvised Angle','Revvfo • Relentless Pressure','Wade • Lightning Near-Miss','Bark • Armored Punish'])assert(source.includes(token),`Training selector omitted ${token}`);
});

await test('2.9A.34 active page loads signature-combat presentation and synchronized cache',async()=>{
  const html=await fetchSource('../index.html');
  assert(html.includes('signature-combat-29a34.css'),'2.9A.34 stylesheet is missing');
  assert(html.includes(RELEASE_CACHE_ID),'2.9A.34 cache identity is not synchronized');
});


await test('2.9A.35 pacing state normalizes safely and keeps quest waves bounded',()=>{
  const state=normalizeRpgPacingState('chapter2',{phase:'invalid',visitedDistricts:['central','central'],conversations:['fan','fan'],wave:99});
  assert(state.phase==='arrival','invalid pacing phase did not fall back to arrival');
  assert(state.visitedDistricts.length===1&&state.conversations.length===1,'pacing state did not deduplicate progress');
  assert(state.wave===4,'pacing wave was not clamped');
  assert(RPG_PACING_PHASES.length===5,'pacing phase model changed unexpectedly');
});

await test('2.9A.35 Chapter 2 orientation requires place familiarity and people, not a timer',()=>{
  const state=createRpgPacingState('chapter2');
  for(const district of ['arrival','market','registration'])recordPacingVisit(state,district);
  for(const person of ['fan','vendor'])recordPacingConversation(state,person);
  assert(!completePacingOrientation('chapter2',state),'Chapter 2 orientation ignored Central Plaza');
  recordPacingVisit(state,'central');
  assert(completePacingOrientation('chapter2',state),'Chapter 2 orientation did not complete naturally');
  assert(rpgPacingQuestWave(state)===1,'Chapter 2 preparation wave did not open');
});

await test('2.9A.35 Chapter 3 makes players compare the closed arena with another district',()=>{
  const state=createRpgPacingState('chapter3');
  recordPacingVisit(state,'vendor');
  recordPacingVisit(state,'camp');
  assert(!completePacingOrientation('chapter3',state),'Chapter 3 investigation opened without visiting the arena');
  recordPacingVisit(state,'arena');
  assert(completePacingOrientation('chapter3',state),'Chapter 3 investigation did not open after meaningful orientation');
});

await test('2.9A.35 Chapter 4 orientation is based on understanding two village landmarks',()=>{
  const state=createRpgPacingState('chapter4');
  recordPacingInteraction(state,'resonance-wall');
  assert(!completePacingOrientation('chapter4',state),'Chapter 4 orientation completed after only one landmark');
  recordPacingInteraction(state,'water-channel');
  assert(completePacingOrientation('chapter4',state),'Chapter 4 orientation did not complete after both landmarks');
  const progress=pacingOrientationProgress('chapter4',state);
  assert(progress.interactions===2&&progress.interactionTarget===2,'Chapter 4 landmark progress is unreadable');
});

await test('2.9A.35 phase transitions support quiet aftermaths without lowering unlock waves',()=>{
  const state=createRpgPacingState('chapter2');
  setRpgPacingPhase(state,'crisis',{wave:3});
  setRpgPacingPhase(state,'aftermath',{wave:1});
  assert(state.phase==='aftermath','aftermath phase did not apply');
  assert(state.wave===3,'aftermath incorrectly relocked earlier quest waves');
  assert(state.transitions===2,'phase transitions were not recorded');
});

await test('2.9A.35 Chapter 2 reveals the festival and optional quests in story waves',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['TAKE IN THE TOURNAMENT GROUNDS','LET THE ROUND SETTLE','notePacingConversation','beginHubAftermath','rpgPacingQuestWave(this.pacing)>=3','registration opens'])assert(source.includes(token),`Chapter 2 RPG pacing omitted ${token}`);
  assert(source.includes("if(!this.pacing.orientationComplete)"),'announcer does not respect first-visit orientation');
});

await test('2.9A.35 Chapter 3 lets sabotage evidence start immediately while staging optional investigations by orientation',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['INVESTIGATE THE TOURNAMENT SABOTAGE','completePacingOrientation','beginInvestigationAftermath','optionalWave','waveOne','waveTwo','waveThree','if(optionalWave<1)continue'])assert(source.includes(token),`Chapter 3 RPG pacing omitted ${token}`);
  assert(source.includes("['ringEvidence1Found','ringEvidence2Found','ringEvidence3Found','sabotageConfirmed'].includes(next)"),'mandatory sabotage evidence is incorrectly hidden behind optional orientation');
});

await test('2.9A.35 Chapter 4 introduces Echo Village before the party mission begins',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['LEARN HOW ECHO VILLAGE LIVES','village-intro:resonance-wall','village-intro:water-channel','inspectVillageLandmark','beginVillageAftermath','STAY WITH THE VILLAGE FOR A MOMENT'])assert(source.includes(token),`Chapter 4 RPG pacing omitted ${token}`);
  const migrated=normalizeChapter4State({requiredCompleted:['opening','villageReached','barkWadeArrive']});
  assert(migrated.pacing.orientationComplete,'older Chapter 4 save was trapped behind new village orientation');
  assert(migrated.pacing.interactions.includes('resonance-wall')&&migrated.pacing.interactions.includes('water-channel'),'older Chapter 4 save lost landmark migration');
});

await test('2.9A.35 Chapter 1 stays light while still tracking an RPG journey arc',async()=>{
  const [source,html]=await Promise.all([fetchSource('../js/story/rrvvfo-road-hub.js'),fetchSource('../index.html')]);
  for(const token of ['syncRpgPacing','BEGINNING THE JOURNEY','chapter1RoadPacing','departure'])assert(source.includes(token)||await fetchSource('../js/story/rpg-pacing.js').then(text=>text.includes(token)),`Chapter 1 pacing omitted ${token}`);
  assert(html.includes('living-hubs-29a35.css'),'Living Hubs presentation stylesheet is missing');
  assert(html.includes(RELEASE_CACHE_ID),'2.9A.35 cache identity is not synchronized');
});



await test('2.9A.36 quest-variety state normalizes every released chapter safely',()=>{
  const c1=normalizeQuestVarietyState('chapter1',{runawayCart:{attempts:-2,complete:true},persistentChanges:['cart','cart']});
  const c2=normalizeQuestVarietyState('chapter2',{festivalExhibition:{attempts:2,mistakes:1}});
  const c3=normalizeQuestVarietyState('chapter3',{incidentSequence:[CHAPTER3_INCIDENT_ORDER[1],CHAPTER3_INCIDENT_ORDER[0]]});
  const c4=normalizeQuestVarietyState('chapter4',{fieldActions:['bad','bark-support','bark-support']});
  assert(c1.runawayCart.attempts===0&&c1.persistentChanges.length===1,'Chapter 1 variety state did not normalize');
  assert(c2.festivalExhibition.attempts===2&&c2.festivalExhibition.mistakes===1,'Chapter 2 variety state did not normalize');
  assert(c3.incidentSequence.length===0,'Invalid Chapter 3 order was not reset safely');
  assert(c4.fieldActions.length===1&&c4.fieldActions[0]==='bark-support','Chapter 4 field actions were not bounded');
});

await test('2.9A.36 Chapter 1 runaway cart is a mandatory playable road beat',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-road-hub.js');
  for(const token of ['beginRunawayCartRescue','startRunawayCartQte','finishRunawayCartQte','chapter1Variety','tournament-supply-cart-saved'])assert(source.includes(token),`Chapter 1 cart rescue omitted ${token}`);
  assert(runawayCartRank({attempts:1})==='PERFECT INTERCEPT','first-try cart rank is wrong');
  assert(runawayCartRank({attempts:2})==='SUPPLIES SAVED','retry cart rank is wrong');
});

await test('2.9A.36 Chapter 2 exhibition gates registration and grades performance',async()=>{
  const [source,state]=await Promise.all([fetchSource('../js/story/rrvvfo-mission-2.js'),Promise.resolve(normalizeChapter2QuestState())]);
  state.mandatory.bracket.complete=true;state.mandatory.wadeRace.complete=true;state.mandatory.barkRing.complete=true;
  assert(!chapter2MandatoryReadyForTournament(state),'registration ignored the festival exhibition');
  state.variety.festivalExhibition.complete=true;
  assert(chapter2MandatoryReadyForTournament(state),'completed exhibition did not unlock registration');
  assert(CHAPTER2_EXHIBITION_SEQUENCE.length===4,'exhibition sequence lost its four-action structure');
  assert(exhibitionRank({mistakes:0,attempts:1})==='TOURNAMENT SHOWSTOPPER','perfect exhibition rank is wrong');
  for(const token of ['beginFestivalExhibition','completeFestivalExhibition','FESTIVAL TECHNIQUE EXHIBITION','festival-exhibition-poster'])assert(source.includes(token),`Chapter 2 exhibition omitted ${token}`);
});

await test('2.9A.36 Chapter 3 reconstruction keeps confirmed evidence and teaches order',async()=>{
  const state=createQuestVarietyState('chapter3');
  assert(nextIncidentStep(state)===CHAPTER3_INCIDENT_ORDER[0],'incident did not begin with the energy event');
  const wrong=recordIncidentStep(state,CHAPTER3_INCIDENT_ORDER[2]);
  assert(!wrong.correct&&state.incidentSequence.length===0&&state.incidentMistakes===1,'wrong incident choice corrupted confirmed evidence');
  for(const step of CHAPTER3_INCIDENT_ORDER){const result=recordIncidentStep(state,step);assert(result.correct,'correct incident event was rejected')}
  assert(state.reconstructionComplete,'five-event reconstruction did not complete');
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['RECONSTRUCT THE INCIDENT','Wrong answers give a clue','security-reconstruction-visible','ORDER CLUE'])assert(source.includes(token),`Chapter 3 reconstruction omitted ${token}`);
});

await test('2.9A.36 Chapter 4 party field route requires all three characters',async()=>{
  const state=createQuestVarietyState('chapter4');
  for(const action of CHAPTER4_PARTY_FIELD_ACTIONS)completePartyFieldAction(state,action.id);
  assert(state.fieldRouteComplete,'three party field actions did not complete the route');
  assert(state.persistentChanges.includes('echo-cavern-route-repaired'),'repaired cavern route did not persist');
  assert(new Set(CHAPTER4_PARTY_FIELD_ACTIONS.map(action=>action.role)).size===3,'party field route lost a character role');
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['beginPartyFieldRoute','runNextPartyFieldAction','finishPartyFieldRoute','REPAIR THE CAVERN APPROACH','party-route'])assert(source.includes(token),`Chapter 4 party route omitted ${token}`);
});

await test('2.9A.36 older Chapter 4 saves beyond the caverns never move backward',()=>{
  const migrated=normalizeChapter4State({requiredCompleted:['opening','villageReached','barkWadeArrive','beaconRestored','cavernsEntered']});
  assert(migrated.variety.fieldRouteComplete,'older Chapter 4 save was blocked by the new party route');
  assert(migrated.variety.fieldActions.length===CHAPTER4_PARTY_FIELD_ACTIONS.length,'older Chapter 4 save did not receive completed field actions');
});

await test('2.9A.36 active build packages playful exploration without changing save schema',async()=>{
  const [html,build,manifest]=await Promise.all([fetchSource('../index.html'),import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../BUILD-MANIFEST-2.9A.36.json')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.36 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.36 changed the save schema unexpectedly');
  assert(html.includes(RELEASE_CACHE_ID),'2.9A.36 cache identity is not synchronized');
  assert(manifest.includes('Playful Exploration & Quest Variety'),'2.9A.36 manifest title is missing');
});



await test('2.9A.36.2 detects impossible Chapter 4 completion without damaging Chapters 1–3',()=>{
  const corrupted={completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03','rrvvfo-04'],unlocks:['arena','echoRegion'],storyLevel:7,storyXp:1635,storyBonusStats:{hp:4},chapter4State:{chapterComplete:true,requiredCompleted:['opening']},lastCheckpoint:'rrvvfo-04'};
  assert(chapter4CompletionConflict(corrupted),'contradictory Chapter 4 save was not detected');
  const repaired=repairChapter4Progress(corrupted);
  assert(repaired.completedMissions.includes('rrvvfo-03')&&!repaired.completedMissions.includes('rrvvfo-04'),'repair damaged earlier chapters or retained false Chapter 4 completion');
  assert(repaired.storyLevel===7&&repaired.storyXp===1635&&repaired.storyBonusStats.hp===4,'repair damaged RPG growth');
  assert(repaired.lastCheckpoint==='rrvvfo-04'&&Object.keys(repaired.chapter4State).length===0,'repair did not reset only Chapter 4');
  assert(rrvvfoNextMission(corrupted)==='rrvvfo-04','false completion still blocks Chapter 4 Continue');
  assert(!rrvvfoChapterComplete(RRVVFO_CHAPTERS[3],corrupted)&&completedRrvvfoChapterCount(corrupted)===3&&routeProgress(LOST_YEAR_ROUTES[0],corrupted)===38,'false completion still inflates Story progress');
});
await test('2.9A.36.2 route menu offers a saveable Chapter 4 recovery instead of trapping the player in Replay',async()=>{
  const story=await fetchSource('../js/story/lost-year-story.js');
  for(const token of ['SAVE REPAIR NEEDED','START FRESH','data-repair-chapter4','data-reset-chapter4','repairAndStartChapter4','repairFalseCompletion:true'])assert(story.includes(token),`Chapter 4 recovery UI omitted ${token}`);
  assert(story.includes("this.startStep('rrvvfo-04','chapter4',{replay:false"),'Chapter 4 recovery still starts temporary Replay mode');
});
await test('2.9A.36.2 Chapter 4 clearly labels temporary Replay runs',async()=>{
  const chapter4=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  assert(chapter4.includes('REPLAY (DOES NOT SAVE)'),'Chapter 4 Story Menu does not warn that Replay is temporary');
  assert(chapter4.includes('data-c4-menu-start-fresh')&&chapter4.includes('startFreshFromReplay'),'temporary Replay cannot be converted into a real Chapter 4 playthrough');
  assert(chapter4.includes('repairFalseCompletion'),'Chapter 4 starter cannot receive a false-completion repair request');
});


await test('2.9A.37 Story reliability distinguishes first play, replay, and invalid completion',()=>{
  const clean={routeStarted:true,completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03'],lastCheckpoint:'rrvvfo-04',chapter4State:{requiredCompleted:['opening']}};
  const first=inspectStoryReliability(clean,{active:true}),replay=inspectStoryReliability(clean,{active:true,replay:true});
  assert(first.health==='GOOD'&&first.runMode==='FIRST PLAY'&&first.saveable,'clean first play is not recognized as saveable');
  assert(replay.runMode==='REPLAY'&&replay.temporary&&!replay.saveable,'replay is not recognized as temporary');
  const bad={...clean,completedMissions:[...clean.completedMissions,'rrvvfo-04'],chapter4State:{chapterComplete:true,requiredCompleted:['opening']}};
  const invalid=inspectStoryReliability(bad);
  assert(invalid.health==='ATTENTION'&&invalid.issues.some(issue=>issue.includes('Chapter 4')),'false Chapter 4 completion is not exposed');
});

await test('2.9A.37 save path strips false Chapter 4 completion before persistence',()=>{
  const data=new Map(),storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
  const bad={version:1,routeStarted:true,storyLevel:7,storyXp:1635,completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03','rrvvfo-04'],unlocks:['arena','echoRegion','shadowLookout'],lastCheckpoint:'rrvvfo-04-complete',chapter4State:{chapterComplete:true,requiredCompleted:['opening']}};
  const saved=saveLostYearProgress(bad,storage);
  assert(!saved.completedMissions.includes('rrvvfo-04'),'false Chapter 4 completion marker survived save');
  assert(saved.completedMissions.includes('rrvvfo-03')&&saved.storyLevel===7&&saved.storyXp===1635,'reliability guard damaged earlier Story progress');
  assert(saved.chapter4State.chapterComplete===false&&!saved.unlocks.includes('shadowLookout'),'false final unlock state survived save guard');
});

await test('2.9A.37 Story runtime reports saveable and temporary run modes explicitly',async()=>{
  const [story,polish]=await Promise.all([fetchSource('../js/story/lost-year-story.js'),fetchSource('../js/story/story-polish.js')]);
  for(const token of ["replay:Boolean(starterOptions.replay)","playtest:chainMode==='playtest'","storyRunMode","FIRST PLAY","REPLAY","TEMPORARY — DOES NOT SAVE"])assert(story.includes(token)||polish.includes(token),`Story run-mode reporting omitted ${token}`);
});

await test('2.9A.37 secret playtest menu exposes Story save health and chapter states',async()=>{
  const polish=await fetchSource('../js/story/story-polish.js');
  for(const token of ['SAVE HEALTH','data-playtest-reliability','saveIssues','chapterStates','Chapter order, completion evidence, and checkpoint order agree.'])assert(polish.includes(token),`playtest state inspector omitted ${token}`);
});

await test('2.9A.37 chapter results include RPG afterglow instead of rushing the next objective',async()=>{
  const polish=await fetchSource('../js/story/story-polish.js');
  assert(Object.keys(STORY_AFTERGLOW).length===4,'released chapters do not all have afterglow data');
  const chapter2=storyAfterglowFor(2,{}),chapter4=storyAfterglowFor(4,{chapter4State:{ryuzankaro:{bossDefeated:true}}});
  assert(chapter2.changes.length>=3&&chapter2.next.includes('Return after closing'),'Chapter 2 afterglow does not connect the RPG journey');
  assert(chapter4.changes.some(line=>line.includes('Ryuzankaro')),'optional Chapter 4 accomplishment is absent from afterglow');
  for(const token of ['CONTINUE JOURNEY','data-story-afterglow','WHAT CHANGED','storyAfterglowFor'])assert(polish.includes(token)||token==='WHAT CHANGED'&&polish.includes('storyAfterglow'),`RPG results pacing omitted ${token}`);
});

await test('2.9A.37 active build packages reliability and RPG flow without changing save schema',async()=>{
  const [html,build,reliability]=await Promise.all([fetchSource('../index.html'),import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../js/story/story-reliability.js')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.37 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.37 changed save schema unexpectedly');
  assert(html.includes('story-rpg-flow-29a37.css')&&html.includes(RELEASE_CACHE_ID),'2.9A.37 active page is not synchronized');
  assert(reliability.includes('STORY_AFTERGLOW')&&reliability.includes('inspectStoryReliability'),'2.9A.37 reliability module is incomplete');
});


await test('2.9A.38 mastery records start clean and expose fifteen optional challenges',()=>{
  const storage=memoryStorage(),records=loadMasteryRecords(storage),summary=masterySummary(records);
  assert(Object.keys(MASTERY_CHALLENGES).length===15,'mastery challenge catalog is not 15 challenges');
  assert(summary.completed===0&&summary.total===15&&summary.rank==='E','fresh mastery summary is not clean');
  assert(records.fighters.rrvvfo&&records.fighters.revvfo&&records.fighters.wade&&records.fighters.bark,'fighter mastery records are incomplete');
});

await test('2.9A.38 battle mastery records real-time Sonic Battle mechanics',()=>{
  const session=createBattleMasterySession({fighterId:'rrvvfo',opponentId:'revvfo',stageId:'dojo'});
  recordBattleMasteryEvent(session,'hit',{damage:12,combo:1,kind:'light1'});
  recordBattleMasteryEvent(session,'hit',{damage:14,combo:2,kind:'heavy'});
  recordBattleMasteryEvent(session,'perfectParry');recordBattleMasteryEvent(session,'guardBreak');recordBattleMasteryEvent(session,'pursuitFinisher');recordBattleMasteryEvent(session,'signature');recordBattleMasteryEvent(session,'wallSplat');recordBattleMasteryEvent(session,'groundBounce');
  assert(session.damageDealt===26&&session.bestCombo===2&&session.perfectParries===1&&session.guardBreaks===1,'battle mastery did not record core mechanics');
  assert(session.pursuitFinishers===1&&session.signatures===1&&session.wallSplats===1&&session.groundBounces===1,'advanced combat mastery events were lost');
});

await test('Combat Rank Patch finished matches use the full S A B C D E ladder plus persistent mastery points',()=>{
  const storage=memoryStorage(),session=createBattleMasterySession({fighterId:'rrvvfo',opponentId:'revvfo',stageId:'dojo'});
  for(let i=1;i<=7;i++)recordBattleMasteryEvent(session,'hit',{damage:8,combo:i,kind:i%2?'light1':'heavy'});
  recordBattleMasteryEvent(session,'perfectParry');recordBattleMasteryEvent(session,'guardBreak');recordBattleMasteryEvent(session,'pursuitFinisher');recordBattleMasteryEvent(session,'signature');recordBattleMasteryEvent(session,'finalKo');
  const result=finalizeBattleMastery(session,{won:true,scoreFor:3,scoreAgainst:0,storage}),saved=loadMasteryRecords(storage);
  assert(['E','D','C','B','A','S'].includes(result.rank)&&result.points>=3,'battle result did not award a valid rank and mastery points');
  assert(saved.totalMatches===1&&saved.totalWins===1&&saved.fighters.rrvvfo.masteryPoints===result.points,'battle mastery did not persist');
  assert(saved.fighters.rrvvfo.bestCombo===7&&saved.totalPerfectParries===1,'persistent record counters are wrong');
});


await test('Combat Rank Patch exposes all six rank thresholds',()=>{
  const checks=[[100,'S'],[90,'S'],[89,'A'],[75,'A'],[74,'B'],[60,'B'],[59,'C'],[45,'C'],[44,'D'],[25,'D'],[24,'E'],[0,'E']];
  for(const [score,rank] of checks)assert(battleMasteryRank(score)===rank,`score ${score} should be ${rank}`);
});

await test('Combat Rank Patch gives rough and losing fights meaningful D and E results',()=>{
  const rough=createBattleMasterySession({fighterId:'rrvvfo',opponentId:'revvfo',stageId:'dojo'}),loss=createBattleMasterySession({fighterId:'rrvvfo',opponentId:'revvfo',stageId:'dojo'});
  const roughResult=finalizeBattleMastery(rough,{won:true,scoreFor:1,scoreAgainst:0,storage:memoryStorage()});
  const lossResult=finalizeBattleMastery(loss,{won:false,scoreFor:0,scoreAgainst:1,storage:memoryStorage()});
  assert(['D','C'].includes(roughResult.rank),'a bare win should land around D/C before mechanical bonuses');
  assert(lossResult.rank==='E','a no-technique loss should receive E rank');
});

await test('Combat Rank Patch ranks actual Story fights from Chapter 1 through Chapter 4 while field trials stay unranked',async()=>{
  const [field,road,c2,c3,c4]=await Promise.all([fetchSource('../js/story/rrvvfo-mission-0.js'),fetchSource('../js/story/rrvvfo-road-hub.js'),fetchSource('../js/story/rrvvfo-mission-2.js'),fetchSource('../js/story/rrvvfo-chapter-3.js'),fetchSource('../js/story/rrvvfo-chapter-4.js')]);
  assert(!field.includes('beginBattleRank')&&!field.includes('SAGE SPAR RANK'),'Chapter 1 Object Swap field trial is incorrectly treated as a ranked fight');
  for(const [name,source] of [['Chapter 1 road',road],['Chapter 2',c2],['Chapter 3',c3],['Chapter 4',c4]]){
    assert(source.includes('beginBattleRank'),`${name} does not begin a universal fight rank`);
    assert(source.includes('finalizeBattleRank'),`${name} does not finalize a universal fight rank`);
  }
  assert(c2.includes('FINAL FIGHT RANK'),'Chapter 2 final does not receive a fight rank');
  assert(c4.includes('BOSS FIGHT RANK')&&c4.includes('SECRET BOSS RANK'),'Chapter 4 bosses are missing fight ranks');
});

await test('Combat Rank Patch displays S A B C D E on Arena and Story result presentation',async()=>{
  const arena=await fetchSource('../js/arena/arena-mode.js');
  for(const token of ['data-battle-rank-toast','data-mastery-rank','FIGHT RANK','data-rank=\"S\"','data-rank=\"A\"','data-rank=\"B\"','data-rank=\"C\"','data-rank=\"D\"','data-rank=\"E\"'])assert(arena.includes(token),`rank presentation omitted ${token}`);
});

await test('2.9A.38 challenge medals reward mastery once instead of encouraging grinding',()=>{
  const storage=memoryStorage(),first=recordMasteryChallenge('rrvvfo','rrvvfoIdentity',{grade:'A',storage}),points=first.records.fighters.rrvvfo.masteryPoints,again=recordMasteryChallenge('rrvvfo','rrvvfoIdentity',{grade:'A',storage}),upgrade=recordMasteryChallenge('rrvvfo','rrvvfoIdentity',{grade:'S',storage});
  assert(first.first&&first.records.challenges.rrvvfoIdentity.completed,'identity mastery did not complete');
  assert(!again.changed&&loadMasteryRecords(storage).fighters.rrvvfo.masteryPoints===points,'repeating a completed challenge granted grind points');
  assert(upgrade.changed&&!upgrade.first&&upgrade.records.challenges.rrvvfoIdentity.grade==='S','better challenge grade did not replace the old rank');
});

await test('2.9A.38 mastery milestones unlock RPG-style titles and rewards',()=>{
  const storage=memoryStorage();
  for(const id of ['parry','combo','guard','rrvvfoIdentity'])recordMasteryChallenge('rrvvfo',id,{grade:'A',storage});
  const records=loadMasteryRecords(storage);
  assert(records.rewards.includes('Title • Rookie Challenger'),'first mastery milestone reward is missing');
  assert(records.rewards.includes('Title • Arena Student'),'four-medal mastery milestone reward is missing');
  assert(records.medals.length===4,'mastery medals did not persist one per challenge');
});

await test('2.9A.38 Adventure Records renders fighter ranks challenge status and rewards',()=>{
  const storage=memoryStorage();recordMasteryChallenge('wade','wadeIdentity',{grade:'S',storage});const html=renderMasteryRecords(loadMasteryRecords(storage));
  for(const token of ['ADVENTURE RECORDS','FIGHTER MASTERY','OPTIONAL MASTERY CHALLENGES','LIGHTNING NEAR-MISS','Wade Victory Aura • Flash Trail'])assert(html.includes(token),`Adventure Records omitted ${token}`);
});

await test('2.9A.38 mastery records are included in safe save export and import',()=>{
  const source=memoryStorage();recordMasteryChallenge('bark','barkIdentity',{grade:'A',storage:source});const exported=createSaveExport(source),target=memoryStorage(),result=importSaveText(JSON.stringify(exported),target);
  assert(SAVE_EXPORT_KEYS.includes(MASTERY_RECORDS_KEY),'mastery record key is absent from the save export allowlist');
  assert(exported.data[MASTERY_RECORDS_KEY]&&result.ok,'mastery records did not export or import');
  assert(loadMasteryRecords(target).challenges.barkIdentity.completed,'imported mastery challenge was lost');
});

await test('2.9A.38 active build integrates mastery results Training rewards and Extras records',async()=>{
  const [html,arena,main,save,build]=await Promise.all([fetchSource('../index.html'),fetchSource('../js/arena/arena-mode.js'),fetchSource('../js/main.js'),fetchSource('../js/save-manager.js'),import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.38 build label is not centralized');assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.38 changed save schema unexpectedly');
  assert(html.includes('mastery-records-29a38.css')&&html.includes('MASTERY & RECORDS')&&html.includes(RELEASE_CACHE_ID),'2.9A.38 page does not expose Adventure Records');
  for(const token of ['createBattleMasterySession','recordBattleMasteryEvent','finalizeBattleMastery','data-mastery-result','recordMasteryChallenge'])assert(arena.includes(token),`Arena mastery integration omitted ${token}`);
  assert(main.includes("section==='mastery'")&&main.includes('renderMasteryRecords'),'Extras does not render mastery records');
  assert(save.includes("'pxMasteryRecordsV1'"),'save manager does not preserve mastery records');
});


await test('2.9A.39 chapter length profiles keep Chapter 4 longest without padding',()=>{
  assert(storyTargetMinutes(1).join('-')==='35-50','Chapter 1 target changed from the short opening role');
  assert(storyTargetMinutes(2).join('-')==='70-100','Chapter 2 target is wrong');
  assert(storyTargetMinutes(3).join('-')==='55-80','Chapter 3 target is wrong');
  assert(storyTargetMinutes(4).join('-')==='90-120'&&storyChapterIsLongest(4),'Chapter 4 is not the longest released chapter');
  assert(storyExperienceProfile(4).promise.includes('distinct adventure phases')&&!storyExperienceProfile(4).promise.includes('walking farther'),'Chapter 4 pacing goal does not reject empty padding');
});

await test('2.9A.39 meaningful RPG beats cover travel tournament mystery and Echo Region',()=>{
  const samples=['rrvvfo-road-cart-saved','rrvvfo-02-round-1','rrvvfo-03-strangeManLead','rrvvfo-04-cavernsEntered','rrvvfo-04-lookoutReached'];
  for(const checkpoint of samples){const beat=storyExperienceBeat(checkpoint);assert(beat?.title&&beat?.detail,`missing experience beat for ${checkpoint}`)}
  assert(Object.keys(STORY_EXPERIENCE_PROFILES).length===4,'experience profiles do not cover all released chapters');
});

await test('2.9A.39 high fight ranks celebrate skill without interrupting every result',()=>{
  const s=storyRankReaction('S'),a=storyRankReaction('A');
  assert(s?.kind==='celebration'&&s.title==='CLEAN FIGHT','S-rank Story reaction is missing');
  assert(a?.kind==='arrival'&&a.duration<=2000,'A-rank reaction should stay brief');
  assert(storyRankReaction('B')===null&&storyRankReaction('E')===null,'ordinary or rough ranks should not spam Story celebration overlays');
});

await test('2.9A.39 Chapter 4 adds optional party recovery without adding a mandatory gate',async()=>{
  const [source,content]=await Promise.all([fetchSource('../js/story/rrvvfo-chapter-4.js'),fetchSource('../js/story/chapter4-content.js')]);
  for(const token of ["kind:'team-rest'",'restWithTeam()','REST WITH BARK & WADE','ECHO VILLAGE PARTY REST','player.hp=player.maxHp','player.en=100','player.guard=100'])assert(source.includes(token),`Chapter 4 party recovery omitted ${token}`);
  assert(!content.includes("'teamRestSeen'"),'party rest became a mandatory Chapter 4 required step');
  assert(CHAPTER4_REQUIRED_STEPS.length===14,'2.9A.39 padded Chapter 4 by adding a mandatory objective');
});

await test('2.9A.39.1 active build preserves RPG polish with the new Chapter 4 ending',async()=>{
  const [html,charm,arena,polish,build]=await Promise.all([fetchSource('../index.html'),fetchSource('../js/story/story-charm.js'),fetchSource('../js/arena/arena-mode.js'),fetchSource('../js/story/story-polish.js'),import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD&&build.SAVE_SCHEMA_VERSION===268,'2.9A.39.1 build identity or save schema is wrong');
  assert(html.includes('full-experience-29a39.css')&&html.includes(RELEASE_CACHE_ID),'2.9A.39.1 presentation/cache is not synchronized');
  assert(charm.includes('storyExperienceBeat')&&charm.includes('pxstoryfightrank'),'Story charm does not consume the new pacing/rank events');
  assert(arena.includes("new CustomEvent('pxstoryfightrank'"),'Story fights do not emit rank reactions');
  assert(polish.includes('pacingTarget')&&polish.includes('pacingRhythm'),'playtest diagnostics do not expose RPG pacing intent');
});


await test('2.9A.40.2 field-skill state persists trials and first mastery without duplicate unlocks',()=>{
  const storage=memoryStorage();
  recordFieldSkillTrial('objectSwapField',storage);recordFieldSkillTrial('objectSwapField',storage);
  const first=masterFieldSkill('objectSwapField',{storage,quiet:true}),again=masterFieldSkill('objectSwapField',{storage,quiet:true}),state=loadFieldSkillState(storage);
  assert(first.first&&!again.first,'field mastery did not distinguish first completion from repeat completion');
  assert(state.mastered.filter(id=>id==='objectSwapField').length===1,'field mastery duplicated the same technique');
  assert(state.trialCounts.objectSwapField===2,'field-trial count did not persist');
  assert(normalizeFieldSkillState({mastered:['bad-id','precisionSwap']}).mastered.join(',')==='precisionSwap','field-skill normalization retained an unknown skill');
});

await test('2.9A.40.2 reserves Shots of Agony for its Chapter 5 invention instead of unlocking it in Chapters 1–4',()=>{
  const rule=STORY_TECHNIQUE_RULES.shotsOfAgony;
  assert(rule.availableFromChapter===5&&rule.requiresUnlock&&rule.unlock==='shotsOfAgonyPrototype','Shots Story rule does not reserve the prototype invention');
  for(const chapter of [1,2,3,4,5])assert(!storyTechniqueAvailable('shotsOfAgony',{chapter,progress:{unlocks:[]}}),`Shots became available before its invention unlock in Chapter ${chapter}`);
  assert(storyTechniqueAvailable('shotsOfAgony',{chapter:5,progress:{unlocks:['shotsOfAgonyPrototype']}}),'Chapter 5 prototype unlock does not enable Shots');
  assert(storyTechniqueAvailable('fireBlast',{chapter:1,progress:{}}),'ordinary Story techniques were accidentally locked');
});

await test('2.9A.40.2 Story-safe Rrvvfo builds remove Shots without breaking the four-slot Story kit',()=>{
  const safe=storySafeRrvvfoBuild(RRVVFO_BUILDS.fire,{chapter:2,progress:{unlocks:[]}});
  assert(!safe.techniques.includes('shotsOfAgony'),'early Story build still equips Shots of Agony');
  assert(safe.techniques.length===4,'early Story build no longer fills four usable technique slots');
  for(const id of ['fireBlast','objectSwap','lensOfTruth','ultimate'])assert(safe.techniques.includes(id),`Story-safe build lost ${id}`);
  const invented=storySafeRrvvfoBuild(RRVVFO_BUILDS.fire,{chapter:5,progress:{unlocks:['shotsOfAgonyPrototype']}});
  assert(invented.techniques.includes('shotsOfAgony'),'invented Chapter 5 prototype cannot return to the build');
});

await test('2.9A.40.2 Chapter 1 opens with a playable three-anchor Object Swap field trial instead of Shots training',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-0.js');
  for(const token of ['SWAP_MARKERS','OBJECT SWAP RELAY • 0 / 3',"slot!==3",'recordFieldSkillTrial(\'objectSwapField\')','masterFieldSkill(\'objectSwapField\'','FIELD TECHNIQUE MASTERED'])assert(source.includes(token),`Chapter 1 Object Swap field trial omitted ${token}`);
  assert(!source.includes("I’ll name this attack... Shots of Agony."),'Chapter 1 still contains the retired Shots invention dialogue');
  assert(!source.includes("beginShotsOfAgony"),'Chapter 1 field trial still starts Shots of Agony');
});

await test('2.9A.40.2 Chapter 1 follow-up removes the old Shots phase and keeps the tutorial chain at seven steps',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-1.js');
  assert(source.includes('const TOTAL_STEPS=7'),'Chapter 1 manual/tutorial chain did not shrink to seven steps');
  assert(source.includes("['shotsCharge','shotsReady'].includes(saved)?'lensCharge':saved"),'legacy Shots checkpoints are not migrated into the current Lens step');
  assert(!source.includes("this.phase='shotsCharge'")&&!source.includes("this.phase='shotsReady'"),'retired Shots tutorial phase remains active in the current mission flow');
  assert(source.includes('masterFieldSkill(\'objectSwapField\'')||source.includes('masterFieldSkill("objectSwapField"'),'Object Swap field mastery is not reinforced by Chapter 1 training');
});

await test('2.9A.40.2 Tournament Road replaces the old Shots gate with a three-point Object Swap relay',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-road-hub.js');
  for(const token of ['REACH THE SWAP RELAY','SWAP RELAY','chapter1SwapRelayComplete','masterFieldSkill(\'precisionSwap\''])assert(source.includes(token),`Tournament Road swap relay omitted ${token}`);
  assert(!source.includes('FOUR TARGETS')&&!source.includes('SHOTS OF AGONY'),'Tournament Road still exposes the retired early Shots gate');
});

await test('2.9A.40.2 Story-facing manual and RPG HUD keep the future technique unidentified',async()=>{
  const [manual,rpg]=await Promise.all([fetchSource('../js/story/combat-manual.js'),fetchSource('../js/story/story-rpg-ui.js')]);
  assert(manual.includes('Unknown Technique')&&manual.includes('PRECISION OBJECT SWAP'),'Combat Manual does not present the current Story-safe field training');
  assert(!manual.includes('Shots of Agony')&&!manual.includes('SHOTS OF AGONY'),'Combat Manual spoils Shots before Chapter 5');
  assert(!rpg.includes('Shots of Agony')&&! rpg.includes('SHOTS OF AGONY'),'persistent Story RPG UI spoils Shots before Chapter 5');
});

await test('2.9A.40.2 Chapter 4 party route teaches Bark Wade and Rrvvfo field skills through actions',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ["action.id==='bark-support'?'barkStabilize'","action.id==='wade-current'?'wadeCurrent'","action.id==='rrvvfo-swap'?'precisionSwap'","masterFieldSkill(fieldSkillId)","masterFieldSkill('vibrationSense'"])assert(source.includes(token),`Chapter 4 field progression omitted ${token}`);
  for(const id of ['barkStabilize','wadeCurrent','vibrationSense'])assert(FIELD_SKILLS[id]?.chapter===4,`${id} is not classified as a Chapter 4 field skill`);
});

await test('2.9A.40.2 field-skill journals live inside Story menus instead of the exploration HUD',async()=>{
  const files=['rrvvfo-road-hub.js','rrvvfo-mission-2.js','rrvvfo-chapter-3.js','rrvvfo-chapter-4.js'];
  for(const file of files){const source=await fetchSource(`../js/story/${file}`);assert(source.includes('renderFieldSkillJournal'),`${file} does not expose field skills in its Story menu`)}
  const html=renderFieldSkillJournal({chapter:4,storage:memoryStorage()});
  assert(html.includes('FIELD TECHNIQUES')&&html.includes('LEARNED BY DOING'),'field-skill journal lacks the intended RPG framing');
});

await test('2.9A.40.2 minimal field HUD hides clutter until combat and exposes a tiny Flow cue',async()=>{
  const css=await fetchSource('../css/field-minimal-29a402.css');
  for(const token of ['storyEngineMode-exploration','arenaHotbar','flowCancelReady',"content:'FLOW'",'fieldSkillMasteryCard'])assert(css.includes(token),`minimal/contextual HUD CSS omitted ${token}`);
  assert(css.includes('display:none')||css.includes('opacity:0'),'minimal HUD stylesheet does not actually suppress field clutter');
});

await test('2.9A.40.2 Flow Cancel and build passives give audiovisual feedback instead of relying on patch notes',async()=>{
  const source=await fetchSource('../js/arena/arena-mode.js');
  for(const token of ['flowCancelReady','pursuitBuffer','PASSIVE • PARRY SPARK','PASSIVE • PURSUIT BATTERY','pxpassiveproc'])assert(source.includes(token),`combat feedback pass omitted ${token}`);
});

await test('2.9A.40.2 current release identity keeps save schema 268 and the new cache synchronized',async()=>{
  const [build,index]=await Promise.all([import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../index.html')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.40.2 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.40.2 changed save schema unexpectedly');
  assert(index.includes('field-minimal-29a402.css')&&index.includes(RELEASE_CACHE_ID),'2.9A.40.2 index is missing the minimal-UI release identity');
});


await test('2.9A.40.3 connected world defines four distinct regions and the released Story bridge graph',()=>{
  assert(CONNECTED_WORLD_VERSION===3,'40.6 connected-world state version is not active');
  for(const id of ['training','tournament','resonance','echo'])assert(WORLD_REGIONS[id]?.zones,`missing connected region ${id}`);
  assert(WORLD_REGION_LINKS.some(link=>link.from==='training'&&link.to==='tournament'),'Tournament Road no longer bridges Chapters 1 and 2');
  assert(WORLD_REGION_LINKS.some(link=>link.from==='tournament'&&link.to==='resonance'),'Chapter 3 maintenance descent is missing');
  assert(WORLD_REGION_LINKS.some(link=>link.from==='resonance'&&link.to==='echo'&&link.oneWay),'damaged teleporter no longer bridges Chapter 3 to Echo Region');
});

await test('2.9A.40.3 major hubs use loops and branches instead of one-direct-path graphs',()=>{
  const degree=(region,id)=>connectedZoneNeighbors(region,id).length;
  assert(degree('tournament','central')>=3,'Tournament central district is still a one-path hub');
  assert(degree('echo','central')>=3,'Echo Village central is still a one-path hub');
  assert(WORLD_REGIONS.training.links.some(([a,b])=>['mainRoad','forest','cliff'].includes(a)||['mainRoad','forest','cliff'].includes(b)),'Tournament Road lost its branch routes');
  assert(WORLD_REGIONS.echo.links.length>=14,'Echo Region graph is too linear for the Chapter 4 exploration target');
});

await test('2.9A.40.3 connected-world state migrates old Chapter 1-4 completion without a schema bump',()=>{
  const old={completedMissions:['rrvvfo-00','rrvvfo-01','rrvvfo-road','rrvvfo-02','rrvvfo-03','rrvvfo-04']};
  const state=normalizeConnectedWorldState({},old);
  for(const region of ['training','tournament','resonance','echo'])assert(state.discoveredRegions.includes(region),`legacy completion failed to reveal ${region}`);
  for(const key of ['training:outskirts','tournament:stadium','resonance:teleporter','echo:lookout'])assert(state.discoveredZones.includes(key),`legacy completion failed to infer ${key}`);
});

await test('2.9A.40.3 visits preserve exact region zone entrance and discovery history',()=>{
  let progress={worldState:freshConnectedWorldState()};
  progress=recordWorldVisit(progress,'tournament','market',{entrance:'west-market'});
  progress=recordWorldVisit(progress,'tournament','stadium',{entrance:'market-stadium'});
  const state=progress.worldState;
  assert(state.currentRegion==='tournament'&&state.currentZone==='stadium','current connected-world position is wrong');
  assert(state.lastEntrance==='market-stadium','last entrance is not remembered');
  assert(state.discoveredZones.includes('tournament:market')&&state.discoveredZones.includes('tournament:stadium'),'visits did not persist mapped areas');
  assert(state.visitCounts['tournament:stadium']===1,'visit count did not persist');
});

await test('2.9A.40.3 permanent shortcuts persist endpoints and appear in Travel Journal state',()=>{
  let progress={worldState:freshConnectedWorldState()};
  progress=discoverWorldShortcut(progress,'c4-water-lift');
  assert(worldShortcutKnown(progress.worldState,'c4-water-lift'),'opened shortcut was not remembered');
  assert(worldZoneKnown(progress.worldState,'echo','water')&&worldZoneKnown(progress.worldState,'echo','upperRidge'),'shortcut endpoints were not discovered');
  const html=renderTravelJournal(progress);
  assert(html.includes('1 permanent shortcut')&&html.includes('ECHO REGION'),'Travel Journal does not summarize the opened route');
});

await test('2.9A.40.3 Chapter 1 route choice records branches and the skilled cliff cut',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-road-hub.js');
  for(const token of ["recordWorldVisit","'training'","'forest'","'cliff'","'mainRoad'","discoverWorldShortcut","c1-cliff-cut"])assert(source.includes(token),`Chapter 1 connected route omitted ${token}`);
});

await test('2.9A.40.3 Chapter 2 festival persists district travel and Wade-made permanent cuts',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['ensureRegionMap','connectedZoneId','recordWorldVisit','c2-market-stadium','c2-practice-registration','c2-stadium-west'])assert(source.includes(token),`Chapter 2 connected hub omitted ${token}`);
  for(const id of ['c2-market-stadium','c2-practice-registration','c2-stadium-west'])assert(WORLD_SHORTCUTS[id]?.region==='tournament',`${id} is not a tournament shortcut`);
});

await test('2.9A.40.3 Chapter 3 reuses the tournament at night then crosses Resonance into Echo Region',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ["recordWorldVisit(loadLostYearProgress(),'tournament'","setRegion('resonance'","setRegion('echo'","c3-service-cut"])assert(source.includes(token),`Chapter 3 world continuity omitted ${token}`);
});

await test('2.9A.40.3 Chapter 4 adds real nonlinear village shortcuts including the skilled potion route',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['OLD WATER LIFT','OLD APOTHECARY PASSAGE','c4-water-lift','c4-apothecary-pass','wadeCurrent','precisionSwap','useWorldShortcut'])assert(source.includes(token),`Chapter 4 nonlinear route omitted ${token}`);
  assert(WORLD_SHORTCUTS['c4-apothecary-pass'].from==='apothecary'&&WORLD_SHORTCUTS['c4-apothecary-pass'].to==='cavernApproach','potion-route shortcut does not bypass the long village loop');
});

await test('2.9A.40.3 Story Map supports Local Region World discovery views without exposing hidden routes early',async()=>{
  const source=await fetchSource('../js/story/story-map.js');
  for(const token of ['LOCAL','REGION','WORLD','drawRegionCanvas','drawWorldCanvas','discoveredZones','state.shortcuts','Unvisited areas stay vague'])assert(source.includes(token),`connected Story Map omitted ${token}`);
  const summary=worldMapSummary({worldState:freshConnectedWorldState()});
  assert(summary.find(item=>item.id==='training')?.known,'starting region should be known');
  assert(!summary.find(item=>item.id==='echo')?.known,'Echo Region should not be revealed on a new save');
});

await test('2.9A.40.4 activates useful interiors while contextual locked doors stay contextual',()=>{
  assert(STORY_INTERIOR_VERSION===2,'40.4 interior architecture version is not active');
  for(const id of ['tournament-medical','tournament-admin','tournament-backstage','echo-apothecary','echo-home-west','echo-home-east']){assert(buildingDefinition(id),`active interior missing ${id}`);assert(canEnterBuilding(id,{chapter:buildingDefinition(id).chapters[0]}),`${id} is not enterable in its Story chapter`)}
  assert(buildingMapTitle('tournament-medical').includes('INTERIOR MAP'),'building map title is missing');
  assert(interiorTransition({buildingId:'echo-apothecary'})?.returnZone==='apothecary','interior transition cannot return to its exterior zone');
  assert(lockedDoorLine(1).includes('house'),'contextual locked-door dialogue is missing');
});


await test('2.9A.40.4 medical center is a real roomed interior with the Chapter 3 medical worker inside',()=>{
  const clinic=buildingDefinition('tournament-medical');
  assert(clinic.rooms.some(room=>room.id==='recovery')&&clinic.rooms.some(room=>room.id==='storage'),'medical center is missing recovery/storage rooms');
  assert(interiorActorPoints('tournament-medical').some(actor=>actor.id==='medical-worker'),'medical worker is not inside the clinic');
  assert(interiorMapPoints('tournament-medical').some(point=>point.kind==='interior-exit'),'clinic map lacks an exit marker');
});

await test('2.9A.40.4 Chapter 2 and Chapter 4 expose chapter-appropriate enterable buildings',()=>{
  const c2=buildingIdsForChapter(2),c4=buildingIdsForChapter(4);
  for(const id of ['tournament-medical','tournament-admin','tournament-backstage'])assert(c2.includes(id),`Chapter 2 building list omitted ${id}`);
  for(const id of ['echo-apothecary','echo-home-west','echo-home-east'])assert(c4.includes(id),`Chapter 4 building list omitted ${id}`);
});

await test('2.9A.40.4 dynamically drawn building shells have real runtime collision',()=>{
  const player={x:640,z:-540,moveVX:120,moveVZ:80,kvx:20,kvz:20};
  const hit=resolveExteriorBuildingCollision(player,['tournament-medical']);
  assert(hit,'medical center shell did not collide');
  assert(player.z<=-672||player.z>=-408||player.x<=468||player.x>=812,'collision failed to eject the player from the clinic shell');
  assert(Math.abs(player.moveVX)<120&&Math.abs(player.moveVZ)<80,'building impact did not damp movement');
});

await test('2.9A.40.4 connected-world state remembers interior visits and persistent door state',()=>{
  let progress={worldState:freshConnectedWorldState()};
  progress=recordInteriorVisit(progress,'tournament-medical',{regionId:'tournament',zoneId:'medical',entrance:'front-door'});
  progress=setWorldDoorState(progress,'tournament-medical','entered');
  assert(worldInteriorKnown(progress.worldState,'tournament-medical'),'interior discovery did not persist');
  assert(progress.worldState.interiorVisitCounts['tournament-medical']===1,'interior visit count did not persist');
  assert(worldDoorState(progress.worldState,'tournament-medical')==='entered','door state did not persist');
  assert(renderTravelJournal(progress).includes('1 interior entered'),'Travel Journal does not report interior discovery');
});

await test('2.9A.40.4 Story Map keeps an entered building on LOCAL view until the player exits',async()=>{
  const source=await fetchSource('../js/story/story-map.js');
  for(const token of ['localOnly=false','localOnly=true',"!this.localOnly",'INTERIOR MAP','EXIT THROUGH THE DOOR TO RETURN OUTSIDE'])assert(source.includes(token),`interior map mode omitted ${token}`);
});

await test('2.9A.40.4 Chapter 2 interiors keep keyboard controller and Story-menu exploration controls alive',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ["this.mode==='hub'||this.mode==='interior'",'ENTER MEDICAL CENTER','ENTER TOURNAMENT ADMINISTRATION','ENTER FIGHTER BACKSTAGE','resolveExteriorBuildingCollision',"['hub','interior','fight','spectator']"])assert(source.includes(token),`Chapter 2 interior integration omitted ${token}`);
});

await test('2.9A.40.4 Chapter 3 moves the medical-worker investigation into the real clinic',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['ENTER MEDICAL CENTER',"this.interiorId==='tournament-medical'",'medical-worker','tournament-medical','resolveExteriorBuildingCollision',"startOptionalQuest('medicalFollowup')","if(quest.id==='medicalFollowup')continue","['hub','dungeon','remote','interior','fight']"])assert(source.includes(token),`Chapter 3 clinic integration omitted ${token}`);
  assert(!source.includes('first reliable witness is in the recovery tent'),'retired fake recovery-tent objective is still present');
});

await test('2.9A.40.4 Chapter 4 has real Echo interiors plus locked background doors and exterior collision',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['ENTER OLD APOTHECARY','ENTER WEST ECHO HOME','ENTER EAST ECHO HOME','KNOCK ON NORTH HOME','CHECK OLD STOREHOUSE','lockedDoorLine','resolveExteriorBuildingCollision','resolveExteriorStructureCollision'])assert(source.includes(token),`Chapter 4 building pass omitted ${token}`);
  assert(source.includes("oldMan:{x:390,z:460"),'old man is still standing inside the solid apothecary shell');
});

await test('2.9A.40.4 interior actors react to chapter and world state instead of repeating one static line',async()=>{
  const source=await fetchSource('../js/story/story-interiors.js');
  for(const token of ["chapter===3",'tournamentStarted','defended','after hours','ordinary conversation'])assert(source.includes(token),`world-life dialogue omitted ${token}`);
});

await test('2.9A.40.4 tournament landmarks render solid clinic and backstage building exteriors',async()=>{
  const source=await fetchSource('../js/story/hub-landmark-art.js');
  for(const token of ['enterable medical center','backstage annex','x:640,y:82,z:-540','x:1010,y:80,z:-470'])assert(source.includes(token),`solid tournament building art omitted ${token}`);
});

await test('2.9A.40.4 interior-map tabs obey hidden state so local building maps cannot leak Region World controls',async()=>{
  const css=await fetchSource('../css/buildings-interiors-29a404.css');
  assert(css.includes('.connectedMapTabs button[hidden]')&&css.includes('display:none!important'),'interior map hidden-tab safety rule is missing');
});

await test('2.9A.40.4 current release synchronizes interiors connected maps and save schema 268',async()=>{
  const [build,index,css]=await Promise.all([import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../index.html'),fetchSource('../css/connected-world-29a403.css')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.40.4 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.40.4 changed save schema unexpectedly');
  assert(index.includes('connected-world-29a403.css')&&index.includes('buildings-interiors-29a404.css')&&index.includes(RELEASE_CACHE_ID),'2.9A.40.4 index is missing connected-world/interior presentation cache identity');
  for(const token of ['connectedTravelJournal','connectedMapTabs','mapDiscoveryHint','worldShortcutToast'])assert(css.includes(token),`connected-world CSS omitted ${token}`);
});


await test('2.9A.40.5 World Delight persists discoveries once without turning them into repeatable checklist rewards',()=>{
  const storage=memoryStorage();
  const first=discoverWorldDelight('c4-water-lift',{storage,quiet:true}),again=discoverWorldDelight('c4-water-lift',{storage,quiet:true}),state=loadWorldDelightState(storage);
  assert(WORLD_DELIGHT_VERSION===1,'World Delight state version changed unexpectedly');
  assert(first.first&&!again.first,'World Delight discovery did not distinguish first discovery from repeat use');
  assert(state.discovered.filter(id=>id==='c4-water-lift').length===1,'World Delight duplicated a discovery');
  assert(worldDelightKnown('c4-water-lift',storage),'World Delight known-state helper lost a saved discovery');
  assert(normalizeWorldDelightState({discovered:['bad','c1-cliff-overlook']}).discovered.join(',')==='c1-cliff-overlook','World Delight normalization retained an unknown discovery');
  assert(SAVE_EXPORT_KEYS.includes('pxWorldDelightV1')&&SAVE_EXPORT_KEYS.includes('pxFieldSkillsV1'),'field/world delight progression is missing from save export');
});

await test('2.9A.40.5 spreads world-delight discoveries across all four released chapters',()=>{
  for(const chapter of [1,2,3,4])assert(delightForChapter(chapter).length>=1,`Chapter ${chapter} has no World Delight discovery`);
  for(const id of ['c1-cliff-overlook','c2-rooftop-route','c3-night-service','c4-water-lift','c4-apothecary-pass','c4-echo-overlook'])assert(WORLD_DELIGHT_DISCOVERIES[id],`missing delight discovery ${id}`);
});

await test('2.9A.40.5 field techniques get theatrical learned-by-doing reactions instead of silent journal unlocks',async()=>{
  const source=await fetchSource('../js/story/field-skills.js');
  for(const token of ['pxfieldskillmastered','Okay... I can work with this.','Dead machine. Not dead anymore.','fieldSkillMasteryCard'])assert(source.includes(token),`field-technique celebration omitted ${token}`);
  for(const id of ['objectSwapField','precisionSwap','barkStabilize','wadeCurrent','vibrationSense'])assert(FIELD_SKILL_REACTIONS[id]?.line,`${id} lacks a mastery reaction`);
});

await test('2.9A.40.5 reactive party banter covers travel tournament mystery team defense and solo contrast',async()=>{
  const source=await fetchSource('../js/story/story-charm.js');
  for(const token of ['CHECKPOINT_BANTER','rrvvfo-road-cart-saved','rrvvfo-02-round-1','rrvvfo-03-projectHollow','rrvvfo-04-villageDefended','rrvvfo-04-mountainEntered'])assert(source.includes(token),`reactive banter omitted ${token}`);
  assert(source.includes('lineDuration:1650'),'banter is not kept short enough for exploration flow');
});

await test('2.9A.40.5 Flow Cancel perfect parry and pursuit finishers receive stronger audiovisual combat feedback',async()=>{
  const [arena,polish]=await Promise.all([fetchSource('../js/arena/arena-mode.js'),fetchSource('../js/story/story-polish.js')]);
  for(const token of ["type:'flowCancel'","type:'pursuitFinisher'",'(perfect?9:3)','cameraShake'])assert(arena.includes(token),`combat-juice pass omitted ${token}`);
  for(const token of ["flowCancel:'FLOW CANCEL'","pursuitFinisher:'PURSUIT FINISHER'","supportInterrupt:'SUPPORT INTERRUPTED'"])assert(polish.includes(token),`Story combat callout omitted ${token}`);
});

await test('2.9A.40.5 Chapter 4 Support interruption is a readable satisfying player action',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['SUPPORT INTERRUPTED','cameraShake','pxarenafeedback',"type:'supportInterrupt'",'support.supportCast=.9'])assert(source.includes(token),`Support-interrupt juice omitted ${token}`);
});

await test('2.9A.40.5 Hollow Watcher phase shifts react theatrically without changing its learn-the-dance rules',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['PHASE 1 • ACTION SCAN','PHASE 2 • RANGE SCAN','PHASE 3 • ROUTE SCAN','Now it cares where I attack from.','watcherPhaseForHp','PATTERN BROKEN • WATCHER EXPOSED'])assert(source.includes(token),`Watcher personality/readability pass omitted ${token}`);
});

await test('2.9A.40.5 Chapter 4 squad set piece reacts to ally danger and a clean three-ninja clear',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['allyDangerWarned','LOW HP','SQUAD PRESSURE INCREASED','All three still standing.','c4-defense-perfect-team'])assert(source.includes(token),`Chapter 4 squad personality omitted ${token}`);
});

await test('2.9A.40.5 secrets stay subtle: Echo overlook only marks itself when the player is close',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  assert(source.includes("kind:'delight:c4-echo-overlook'"),'Echo overlook discovery is missing');
  assert(source.includes("item.kind?.startsWith('delight')&&distance(this.battle.fighters[0],item)>120"),'secret discovery marker is visible from too far away');
  assert(source.includes("discoverWorldDelight(route.shortcut==='c4-water-lift'?'c4-water-lift':'c4-apothecary-pass')"),'existing skilled shortcuts do not feed World Delight');
});

await test('2.9A.40.5 current release keeps save schema 268 and synchronizes World Delight presentation',async()=>{
  const [build,index,css]=await Promise.all([import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../index.html'),fetchSource('../css/world-delight-29a405.css')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'2.9A.40.5 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'2.9A.40.5 changed save schema unexpectedly');
  assert(index.includes('world-delight-29a405.css')&&index.includes(RELEASE_CACHE_ID),'2.9A.40.5 index is missing World Delight release identity');
  for(const token of ['storyCombatCallout.flowCancel','storyCombatCallout.supportInterrupt','worldDelightPulse','fieldSkillMasteryCard em'])assert(css.includes(token),`World Delight CSS omitted ${token}`);
});

await test('2.9A.40.6 revisit loop exposes four cross-chapter opportunities with field-skill gates',()=>{
  assert(REVISIT_LOOP_VERSION===1,'revisit loop version changed unexpectedly');
  for(const id of ['c1-precision-cache','c2-rooftop-challenger','c3-service-archive','c4-shrine-resonance'])assert(REVISIT_OPPORTUNITIES[id],`missing revisit opportunity ${id}`);
  const progress={completedMissions:['rrvvfo-road'],unlocks:[],worldState:freshConnectedWorldState()};
  assert(revisitOpportunityStatus(progress,'c1-precision-cache',{fieldSkills:{mastered:[]}})==='locked','Precision cache ignored its field-skill gate');
  assert(revisitOpportunityStatus(progress,'c1-precision-cache',{fieldSkills:{mastered:['precisionSwap']}})==='ready','Precision cache did not become available after Precision Lock');
});

await test('2.9A.40.6 connected-world v3 migrates revisit and fast-travel state without save-schema change',()=>{
  const state=normalizeConnectedWorldState({version:2,revisitRewards:['c1-precision-cache'],fastTravelNodes:['tournamentPlaza']},{});
  assert(CONNECTED_WORLD_VERSION===3&&state.version===3,'connected-world state did not migrate to v3');
  assert(state.revisitRewards.includes('c1-precision-cache'),'revisit reward was lost during migration');
  assert(state.fastTravelNodes.includes('tournamentPlaza'),'fast-travel node was lost during migration');
});

await test('2.9A.40.6 revisit rewards are one-time and become permanent Story unlocks',()=>{
  const progress={completedMissions:['rrvvfo-road'],unlocks:[],worldState:freshConnectedWorldState()};
  const fieldSkills={mastered:['precisionSwap']};
  const first=claimRevisitOpportunity(progress,'c1-precision-cache',{fieldSkills});
  assert(first.claimed&&first.progress.unlocks.includes('revisitSwapBattery'),'first revisit reward did not grant its persistent unlock');
  const second=claimRevisitOpportunity(first.progress,'c1-precision-cache',{fieldSkills});
  assert(!second.claimed,'revisit reward can be farmed repeatedly');
  assert(revisitState(first.progress).claimed.filter(id=>id==='c1-precision-cache').length===1,'revisit reward duplicated in world state');
});

await test('2.9A.40.6 fast travel unlocks only after the destination chapter has been cleared',()=>{
  let progress={completedMissions:['rrvvfo-02'],worldState:freshConnectedWorldState()};
  assert(fastTravelNodeAvailable(progress,'tournamentPlaza'),'Tournament Plaza should unlock after Chapter 2');
  assert(!fastTravelNodeAvailable(progress,'echoVillage'),'Echo Village unlocked before Chapter 4 clear');
  progress=syncFastTravelNodes(progress);
  assert(revisitState(progress).fastTravel.includes('tournamentPlaza'),'Tournament Plaza did not persist as a fast-travel node');
  assert(!revisitState(progress).fastTravel.includes('echoVillage'),'Echo Village persisted too early');
});

await test('2.9A.40.6 fast travel arrival updates connected-world location without creating a chapter replay',()=>{
  let progress={completedMissions:['rrvvfo-02'],worldState:freshConnectedWorldState()};
  progress=syncFastTravelNodes(progress);
  assert(fastTravelDestination(progress,'tournamentPlaza')?.zone==='central','Tournament fast-travel destination is wrong');
  progress=markFastTravelArrival(progress,'tournamentPlaza');
  assert(progress.worldState.currentRegion==='tournament'&&progress.worldState.currentZone==='central','fast travel did not update connected-world location');
  assert(progress.worldState.lastEntrance==='fast-travel:tournamentPlaza','fast-travel entrance marker was not recorded');
});

await test('2.9A.40.6 Story route home surfaces revisit opportunities and safe region returns',async()=>{
  const source=await fetchSource('../js/story/lost-year-story.js');
  for(const token of ['renderRevisitJournal','data-fast-travel','fastTravel(id)','revisit:true','markFastTravelArrival'])assert(source.includes(token),`Story route revisit integration omitted ${token}`);
  const html=renderRevisitJournal({completedMissions:['rrvvfo-02'],worldState:freshConnectedWorldState()},{fieldSkills:{mastered:[]}});
  assert(html.includes('REVISIT LOOP')&&html.includes('TOURNAMENT PLAZA'),'revisit journal does not expose discovered fast travel');
});

await test('2.9A.40.6 Tournament revisit mode adds a real hidden post-clear Rooftop Challenger',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['this.revisitMode','FAST TRAVEL • TOURNAMENT PLAZA','SECRET • ROOFTOP CHALLENGER','revisit-rooftop','claimRevisitOpportunity'])assert(source.includes(token),`Tournament revisit content omitted ${token}`);
});

await test('2.9A.40.6 Echo revisit mode adds a Vibration Sense shrine reward without reopening Chapter 4 story',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['this.revisitMode','FAST TRAVEL • ECHO VILLAGE','OLD SHRINE RESONANCE','c4-shrine-resonance','claimRevisitOpportunity'])assert(source.includes(token),`Echo revisit content omitted ${token}`);
});

await test('2.9A.40.6 release identity keeps schema 268 and loads revisit-loop presentation',async()=>{
  const [build,index,css]=await Promise.all([import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../index.html'),fetchSource('../css/revisit-loop-29a406.css')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'40.6 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'40.6 changed save schema unexpectedly');
  assert(index.includes('revisit-loop-29a406.css')&&index.includes(RELEASE_CACHE_ID),'40.6 index omitted revisit-loop presentation/cache');
  for(const token of ['revisitJournal','revisitCard','revisitTravel'])assert(css.includes(token),`revisit-loop CSS omitted ${token}`);
});

await test('2.9A.40.7 quest audit covers Chapters 1-4 and explicitly removes marker-chain design where it was weakest',()=>{
  assert(QUEST_OVERHAUL_VERSION===1,'quest-overhaul version changed unexpectedly');
  const summary=questAuditSummary();
  for(const chapter of ['chapter1','chapter2','chapter3','chapter4'])assert(summary[chapter],`quest audit omitted ${chapter}`);
  assert(QUEST_AUDIT.chapter3.throw.length===4,'Chapter 3 marker-chain cleanup does not cover all four retired collection chains');
  assert(QUEST_AUDIT.chapter1.throw.length===0,'Chapter 1 incorrectly throws away already-varied route content');
});

await test('2.9A.40.7 Chapter 2 bracket supports physical recovery or a two-record Administration reconstruction',()=>{
  const state=createChapter2QuestState();
  state.mandatory.bracket.cards=['fan-card','vendor-card'];
  assert(!chapter2BracketRoute(state).ready,'two physical records alone completed the bracket');
  state.mandatory.bracket.adminReconstruction=true;
  assert(chapter2BracketRoute(state).ready,'Administration reconstruction did not complete a two-record route');
  state.mandatory.bracket.adminReconstruction=false;state.mandatory.bracket.cards.push('veteran-card');
  assert(chapter2BracketRoute(state).ready,'all three physical records no longer complete the bracket');
});

await test('2.9A.40.7 Chapter 2 normalization preserves skilled Administration and family-route quest state',()=>{
  const state=normalizeChapter2QuestState({mandatory:{bracket:{started:true,cards:['fan-card','vendor-card'],adminReconstruction:true,complete:true}},optional:{lostFan:{started:true,route:'family',familyFound:true,complete:true}}});
  assert(state.mandatory.bracket.cards.length===2&&state.mandatory.bracket.adminReconstruction,'Administration bracket route was flattened back into three fake recovered cards');
  assert(state.optional.lostFan.route==='family'&&state.optional.lostFan.familyFound,'lost-fan alternate route did not survive normalization');
});

await test('2.9A.40.7 Chapter 2 runtime uses the connected Administration interior and a second solution for Wade’s fan',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-mission-2.js');
  for(const token of ['chapter2BracketRoute','two recovered records + Administration archive','FAN’S FAMILY','completeLostFanFamilyRoute','Two solutions: find Wade, or search Market Street'])assert(source.includes(token),`Chapter 2 quest overhaul omitted ${token}`);
});

await test('2.9A.40.7 Chapter 3 replaces four marker chains with distinct scene-reading activities',()=>{
  for(const id of ['finalAnnouncement','cleanupEchoes','fakePloukes','lateFan'])assert(chapter3ReplacementActivity(id),`missing Chapter 3 replacement activity ${id}`);
  assert(CHAPTER3_REPLACEMENT_ACTIVITIES.finalAnnouncement.kind==='signal-routing','final announcement did not become signal routing');
  assert(CHAPTER3_REPLACEMENT_ACTIVITIES.fakePloukes.kind==='observation','fake Ploukes did not become an observation challenge');
});

await test('2.9A.40.7 Chapter 3 runtime no longer spawns the retired collection-marker chains',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['runReplacementQuest','chapter3ReplacementActivity(quest.id))continue','Solve the situation instead of following a chain of collection markers','WEST GATE SHORTCUT','SERVICE-TUNNEL ECHO'])assert(source.includes(token),`Chapter 3 replacement runtime omitted ${token}`);
});

await test('2.9A.40.7 old incomplete Chapter 3 marker-chain saves restart safely at the redesigned activity',()=>{
  const state=normalizeChapter3State({version:2,optional:{finalAnnouncement:{started:true,complete:false,progress:2},fakePloukes:{started:true,complete:false,progress:1}}});
  assert(state.version===4,'Chapter 3 state version did not migrate to the sabotage-rewrite format');
  assert(!state.optional.finalAnnouncement.started&&state.optional.finalAnnouncement.progress===0,'old final-announcement marker chain did not reset safely');
  assert(!state.optional.fakePloukes.started&&state.optional.fakePloukes.progress===0,'old fake-Plouke marker chain did not reset safely');
});

await test('2.9A.40.7 Old Man’s Potions supports either four field trials or a skilled apothecary formula route',()=>{
  const normal={ryuzankaro:{ingredients:['emberBloom','rootstone','thunderDew'],apothecaryFormula:false}};
  assert(!chapter4PotionReady(normal),'three normal catalysts completed the four-trial route');
  normal.ryuzankaro.ingredients.push('triadSeed');assert(chapter4PotionReady(normal),'four normal field trials do not complete the potion route');
  const skilled={ryuzankaro:{ingredients:['rootstone','triadSeed'],apothecaryFormula:true}};
  assert(chapter4PotionReady(skilled),'Old Apothecary Formula did not create the intended two-catalyst skilled route');
  assert(chapter4PotionRoute(skilled).required===2,'skilled potion route still reports four required catalysts');
});

await test('2.9A.40.7 Chapter 4 mountain investigation triangulates from any two signal bearings instead of requiring a three-marker sweep',()=>{
  assert(!chapter4SignalsReady({mountainSignals:['bridge-echo']}),'one signal incorrectly triangulated the Watcher');
  const route=chapter4SignalRoute({mountainSignals:['bridge-echo','hollow-relay']});
  assert(route.ready&&route.required===2,'two signal bearings did not triangulate the Watcher');
});

await test('2.9A.40.7 Chapter 4 runtime exposes skilled potion and two-bearing mountain routes while keeping Ryuzankaro optional',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-4.js');
  for(const token of ['OLD APOTHECARY FORMULA','any two stable catalysts','chapter4PotionReady','chapter4SignalsReady','Two bearings were enough','choose any two paths'])assert(source.includes(token),`Chapter 4 quest route overhaul omitted ${token}`);
  assert(source.includes("value:'skip'"),'Ryuzankaro route stopped being optional');
});


await test('2.9A.40.7.1 Chapter 3 opens on deliberate ring sabotage instead of Sage suspicion',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['Someone messed with that ring.','And if they replace everything, there goes half the evidence.','INVESTIGATE THE TOURNAMENT SABOTAGE','Yeah. Someone definitely did this.'])assert(source.includes(token),`sabotage opening omitted ${token}`);
  for(const retired of ['WHERE DID PLOUKE GO','FIND SAGE PLOUKE BAG','SAGE SABOTAGED'])assert(!source.includes(retired),`retired Sage-suspicion framing leaked back in: ${retired}`);
});

await test('2.9A.40.7.1 ring evidence and witnesses form a concrete sabotage case before Strange Man appears',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['Somebody cut the load point before the match.','no tournament serial number','LOWER ACCESS OPENED DURING FINAL TOURNAMENT WINDOW','TOURNAMENT WORKER','Nobody was officially authorized to enter the lower maintenance sections','Plouke never came to the medical tent after his fight. I saw him heading toward maintenance instead.'])assert(source.includes(token),`sabotage evidence/witness pass omitted ${token}`);
});

await test('2.9A.40.7.1 Strange Man contradiction references the medical worker’s real first statement',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['The people you’re talking to aren’t the real people.','You said Plouke skipped the medical tent and went toward maintenance.','I’ve never treated or spoken to anyone named Plouke.','I think you have me confused with someone else.'])assert(source.includes(token),`medical contradiction omitted ${token}`);
  assert(source.includes('strangeManHatLensInspected')&&source.includes('Great. Even my eye doesn’t know what happened.'),'hat/Lens mystery is not persistent');
});

await test('2.9A.40.7.1 maintenance descent reveals Project Hollow gradually instead of naming it at the entrance',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['TOURNAMENT MAINTENANCE','These cables are newer than the tournament walls.','Hidden camera. Unmarked power line. Robot parts.','HIDDEN UNDERGROUND FACILITY','TOURNAMENT COMBAT DATA • ROUND ANALYSIS • FIGHTER RESPONSE RECORDS • ENERGY OBSERVATION.','PROJECT HOLLOW.'])assert(source.includes(token),`gradual Project Hollow reveal omitted ${token}`);
});

await test('2.9A.40.7.1 Sage trail proves he independently investigated the hidden facility',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['A busted surveillance robot... and that piece of fake Plouke fabric.','So he found this place too.','Whatever this place is, Sage was moving deeper into it.'])assert(source.includes(token),`Sage investigation trail omitted ${token}`);
  const steps=CHAPTER3_REQUIRED_STEPS;
  assert(steps.indexOf('sageTrailFound')>steps.indexOf('hiddenInfrastructureFound')&&steps.indexOf('findSageObjectiveStarted')>steps.indexOf('sageTrailFound'),'Find Sage starts before sabotage/maintenance evidence establishes his trail');
});

await test('2.9A.40.7.1 real Sage remains dominant while lockdown and suppression create the escape danger',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['the real Sage tears through Project Hollow units faster than the facility can replace them','FACILITY LOCKDOWN','suppression','That room is your way out. Move.'])assert(source.includes(token),`Sage/lockdown power logic omitted ${token}`);
  assert(source.includes('Project Hollow Scanner')&&source.includes('Hollow Containment Unit'),'Chapter 3 lacks its earlier observation/containment robot progression');
});

await test('2.9A.40.7.1 blue-clone escape is mandatory story foundation and never unlocks a clone move or Shots of Agony',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['PULL THE BLUE SAGE THROUGH','You’re the clone.','Try to master this technique, kid.','The clone thing?','Something like it.','blueCloneTechniqueFoundationLearned','No technique was unlocked.'])assert(source.includes(token),`blue-clone foundation omitted ${token}`);
  assert(!source.includes('SHOTS OF AGONY — PROTOTYPE')&&!source.includes('TECHNIQUE INVENTED • SHOTS OF AGONY'),'Chapter 3 accidentally unlocks future Shots of Agony');
});

await test('2.9A.40.7.1 teleporter escape explicitly rejects Object Swap as the lesson and lets the clone disappear normally',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  assert(source.includes('THE ESCAPE IS ABOUT THE CLOSING DOOR • NOT OBJECT SWAP'),'door sequence still frames Object Swap as the Chapter 3 lesson');
  assert(source.includes('the blue clone fades normally')&&source.includes('blueCloneDisappeared'),'blue clone disappearance is missing');
  assert(!source.includes('OBJECT SWAP THROUGH THE DOOR'),'old Object Swap lesson objective remains');
});

await test('2.9A.40.7.1 Echo arrival knocks Rrvvfo out for several days before Chapter 4 can begin',async()=>{
  const source=await fetchSource('../js/story/rrvvfo-chapter-3.js');
  for(const token of ['The connection collapses behind him.','Several days pass while Rrvvfo remains unconscious.','RECOVERY PERIOD: ESTIMATED MULTIPLE DAYS.','BEGIN ECHO REGION OPERATION.','rrvvfoUnconscious','echoOperationTimeSkipStarted'])assert(source.includes(token),`Echo blackout handoff omitted ${token}`);
  assert(!source.includes('REACH SHADOW’S LOOKOUT'),'Chapter 3 still gives Chapter 4 exploration control early');
});

await test('2.9A.40.7.1 old completed and mid-facility Chapter 3 saves migrate into one coherent sabotage timeline',()=>{
  const mid=normalizeChapter3State({version:3,requiredCompleted:['opening','medicalLead','fighterNobodyRecorded','bracketRecords','lockedNightShift','crackedRing','ploukeBag','lensTrail','sageExplanation','facilityEntered'],location:'facility'});
  assert(mid.version===4&&mid.strangeManHatCollected&&mid.projectHollowFacilityEntered&&chapter3NextRequired(mid)==='tournamentDataDiscovered','mid-facility legacy save did not migrate coherently');
  const oldComplete=normalizeChapter3State({version:3,requiredCompleted:['opening','medicalLead','fighterNobodyRecorded','bracketRecords','lockedNightShift','crackedRing','ploukeBag','lensTrail','sageExplanation','facilityEntered','auxiliaryPower','recordedAttacks','sageSeparated','dummyDefeated','subjectRFile','echoDefeated','projectHollow','teleporterFound','doorClosing','rockThrown','objectSwap','teleporterActivated','remoteRegion','shadowObjective','chapterSaved']});
  assert(oldComplete.blueCloneTechniqueFoundationLearned&&oldComplete.rrvvfoUnconscious&&oldComplete.echoOperationTimeSkipStarted&&chapter3Complete(oldComplete),'old completed Chapter 3 save did not migrate through the blue-clone/blackout handoff');
});

await test('2.9A.40.7.1 current release keeps save schema 268 and centralizes the Chapter 3 sabotage rewrite',async()=>{
  const [build,index,questSource]=await Promise.all([import('../js/build-info.js?v=29a4072r-ch1-adventure-playtestlab-20260802'),fetchSource('../index.html'),fetchSource('../js/story/quest-overhaul.js')]);
  assert(build.BUILD_VERSION===EXPECTED_BUILD,'40.7.1 build label is not centralized');
  assert(build.SAVE_SCHEMA_VERSION===268,'40.7.1 changed save schema unexpectedly');
  assert(index.includes(RELEASE_CACHE_ID),'40.7.1 index omitted release cache identity');
  for(const token of ['QUEST_AUDIT','CHAPTER3_REPLACEMENT_ACTIVITIES','chapter4PotionRoute','chapter4SignalRoute'])assert(questSource.includes(token),`quest-overhaul module omitted ${token}`);
});

const finalOrdered=registry.map(entry=>results.find(result=>result.name===entry.name)).filter(Boolean);
publishResults(finalOrdered,'Initial run complete');
globalThis.__SMOKE_RUNNER__={
  rerunFailed:()=>runBatch(registry.filter(entry=>!results.find(result=>result.name===entry.name)?.pass),'Retry failed tests'),
  rerunAll:()=>runBatch(registry,'Run all tests again'),
  getResults:()=>registry.map(entry=>results.find(result=>result.name===entry.name)).filter(Boolean)
};
harness.runnerReady(globalThis.__SMOKE_RUNNER__);

