import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a402-field-skills-minimal-ui-20260801';
import {loadLostYearProgress,repairChapter4Progress,saveLostYearProgress} from './lost-year-data.js?v=29a402-field-skills-minimal-ui-20260801';
import {addStoryXp,applyStoryLevelToFighter,applyStoryProgressionToFighter} from './story-progression.js?v=29a402-field-skills-minimal-ui-20260801';
import {StoryMap} from './story-map.js?v=29a402-field-skills-minimal-ui-20260801';
import {storyConfirm} from './story-ux.js?v=29a402-field-skills-minimal-ui-20260801';
import {openCombatManual} from './combat-manual.js?v=29a402-field-skills-minimal-ui-20260801';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyStatsMarkup} from './story-rpg-ui.js?v=29a402-field-skills-minimal-ui-20260801';
import {renderFieldSkillJournal} from './field-skills.js?v=29a402-field-skills-minimal-ui-20260801';
import {resetHubCameraLook,snapHubCamera,updateHubCamera} from './hub-camera.js?v=29a402-field-skills-minimal-ui-20260801';
import {
  CHAPTER4_BEACON_NODES,CHAPTER4_CAVERN_DOORS,CHAPTER4_INGREDIENTS,CHAPTER4_LIFT_PARTS,
  CHAPTER4_MISSION_ID,CHAPTER4_MOUNTAIN_SIGNALS,CHAPTER4_REQUIRED_STEPS,
  chapter4Complete,chapter4CompletionPercent,chapter4NextRequired,chapter4VillageDefenseComplete,freshChapter4State,
  markChapter4Required,normalizeChapter4State,ryuzankaroQuestAvailable,ryuzankaroQuestResolved
} from './chapter4-content.js?v=29a402-field-skills-minimal-ui-20260801';
import {completePacingOrientation,pacingOrientationProgress,recordPacingInteraction,recordPacingAftermath,rpgPacingLabel,rpgPacingQuestWave,setRpgPacingPhase} from './rpg-pacing.js?v=29a402-field-skills-minimal-ui-20260801';
import {chapter4EnemyRole} from './chapter4-enemy-roles.js?v=29a402-field-skills-minimal-ui-20260801';
import {CHAPTER4_PARTY_FIELD_ACTIONS,completePartyFieldAction} from './quest-variety.js?v=29a402-field-skills-minimal-ui-20260801';
import {masterFieldSkill} from './field-skills.js?v=29a402-field-skills-minimal-ui-20260801';
import {applyRrvvfoBuildToFighter,completeAdventureMission,discoverAdventureMission,enemyArchetype,enemyArchetypeIcon,enemyArchetypeShape,openRrvvfoBuildLab} from './core-fun.js?v=29a402-field-skills-minimal-ui-20260801';

const UI_ID='rrvvfoChapter4UI';
const MISSION_ID=CHAPTER4_MISSION_ID;
const EMPTY_COMMAND=Object.freeze({x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,breaker:false,counter:false,interact:false,special:false});
const SPAWNS=Object.freeze({region:{x:-1363,z:100},village:{x:-820,z:60},beacon:{x:-680,z:300},cavern:{x:-980,z:0},villageReturn:{x:777,z:450},mountain:{x:-1240,z:0},lookout:{x:1120,z:-330}});
const LOOKOUT_HEIGHT=500;
const LOOKOUT_LANDING_SECONDS=2.4;
const LOOKOUT_FADE_DELAY_MS=520;
const LOOKOUT_COMPLETION_DELAY_MS=1850;
const LOOKOUT_BOUNDS=Object.freeze({minX:920,maxX:1320,minZ:-505,maxZ:-155});
const LOOKOUT_ENTRANCE=Object.freeze({x:1120,z:-205,label:'SHADOW’S ENTRANCE',yBase:LOOKOUT_HEIGHT});
const VILLAGE_POINTS=Object.freeze({
  gate:{x:-760,z:30,label:'ECHO VILLAGE'},teleporter:{x:-620,z:-430,label:'DAMAGED TELEPORTER'},beacon:{x:-350,z:540,label:'ECHO BEACON'},
  cavern:{x:1030,z:470,label:'ECHO CAVERNS'},oldMan:{x:260,z:610,label:'ABANDONED POTION BUILDING'},
  recovery:{x:160,z:150,label:'RECOVERY AREA'},partyRoute:{x:640,z:360,label:'DAMAGED CAVERN ROUTE'},cavernShortcut:{x:390,z:600,label:'OLD CAVERN SHORTCUT'},mountain:{x:1260,z:-430,label:'MOUNTAIN GATE'},chimes:{x:-40,z:520,label:'ECHO CHIMES'}
});
let activeMission=null;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function distance(a,b){return Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0))}
function unique(values){return[...new Set(Array.isArray(values)?values:[])]}
function pretty(id){return String(id||'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]/g,' ').toUpperCase()}
const WATCHER_PHASES=Object.freeze({
  1:Object.freeze({label:'PHASE 1 • ACTION SCAN',detail:'It learns the attack name. Change attacks to break the read.'}),
  2:Object.freeze({label:'PHASE 2 • RANGE SCAN',detail:'It learns attack and distance. Change move or spacing.'}),
  3:Object.freeze({label:'PHASE 3 • ROUTE SCAN',detail:'It learns attack, distance, and approach. Change one part of the route.'})
});
function watcherPhaseForHp(foe){const ratio=(Number(foe?.hp)||0)/Math.max(1,Number(foe?.maxHp)||1);return ratio>.66?1:ratio>.33?2:3}
function watcherSignature({action,spacing,approach,phase=1}){return phase===1?String(action):phase===2?`${action} • ${spacing}`:`${action} • ${spacing} • ${approach}`}
function watcherPatternName({action,spacing,approach,phase=1}){
  if(phase===1)return`${action} LOOP`;
  if(phase===2)return`${spacing} ${action}`;
  const route=approach==='ADVANCE'?'CHASE':approach==='RETREAT'?'RETREAT':'SIDE ROUTE';return`${spacing} ${route} • ${action}`;
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');root.id=UI_ID;root.hidden=true;
  root.innerHTML=`
    <div class="c4Hud">
      <div class="c4Objective"><small>RRVVFO STORY • CHAPTER 4</small><strong data-c4-objective>ECHO REGION</strong><span data-c4-detail>Find a route toward Shadow’s Lookout.</span></div>
      ${storyAttackStripMarkup({compact:true})}
      <div class="c4HudActions"><button type="button" data-c4-journal>JOURNAL</button><button type="button" data-c4-map>MAP</button><button type="button" data-c4-menu-button>STORY MENU</button></div>
    </div>
    <div class="c4Transition" data-c4-transition><article><small>RRVVFO STORY</small><h1>CHAPTER 4</h1><strong>ECHO REGION</strong><span>THE TELEPORTER WORKED. GETTING BACK IS ANOTHER PROBLEM.</span></article></div>
    <div class="c4AreaTitle" data-c4-area hidden><small data-c4-area-kicker>CHAPTER 4</small><strong data-c4-area-name>ECHO REGION</strong></div>
    <div class="c4Prompt" data-c4-prompt hidden><strong data-c4-prompt-title>INTERACT</strong><span data-c4-prompt-detail>PRESS INTERACT</span></div>
    <div class="c4Toast" data-c4-toast hidden><small data-c4-toast-kicker>QUEST UPDATED</small><strong data-c4-toast-title></strong><span data-c4-toast-detail></span></div>
    <aside class="c4Tracker" data-c4-tracker hidden>
      <header><small>CHAPTER 4 • ECHO REGION</small><h2>MISSION JOURNAL</h2></header>
      <div class="c4TrackerRows"><div><span>MAIN STORY</span><strong data-c4-required-count>0 / ${CHAPTER4_REQUIRED_STEPS.length}</strong></div><div><span>SECRET QUEST</span><strong data-c4-secret-status>LOCKED</strong></div><div><span>AREA</span><strong data-c4-area-status>ECHO REGION</strong></div><div><span>VIBRATION SENSE</span><strong data-c4-vibration-status>LOCKED</strong></div></div>
      <section data-c4-journal-list></section><button type="button" data-c4-close-journal>CLOSE</button>
    </aside>
    <div class="c4StoryMenu storyRpgPause" data-c4-menu hidden role="dialog" aria-modal="true" aria-label="Chapter 4 story menu">
      <article><header><div><small data-c4-menu-mode>RRVVFO STORY • CHAPTER 4</small><h2>STORY MENU</h2></div><button type="button" data-c4-menu-close aria-label="Close story menu">×</button></header>
      ${storyAttackStripMarkup()}${storyStatsMarkup(loadLostYearProgress())}
      <div class="storyRpgObjectiveCard"><small>CURRENT OBJECTIVE</small><strong data-c4-menu-objective>ECHO REGION</strong><span data-c4-menu-detail>Find a route toward Shadow’s Lookout.</span></div>
      <div data-c4-field-skills>${renderFieldSkillJournal({chapter:4})}</div>
      <div class="chapter2MenuActions"><button class="primary" type="button" data-c4-menu-resume>RETURN TO GAME</button><button type="button" data-c4-menu-start-fresh hidden>START CHAPTER 4 FRESH</button><button type="button" data-c4-menu-manual>SAGE MANUAL</button><button type="button" data-c4-menu-build>RRVVFO BUILD</button><button type="button" data-c4-menu-journal>MISSION JOURNAL</button><button type="button" data-c4-exit>EXIT CHAPTER</button></div>${storyControlLegendMarkup()}</article>
    </div>
    <div class="c4Choice" data-c4-choice hidden role="dialog" aria-modal="true"><article><small data-c4-choice-kicker>CHAPTER 4</small><h2 data-c4-choice-title>CHOICE</h2><p data-c4-choice-text></p><div data-c4-choice-buttons></div></article></div>
    <div class="c4Qte" data-c4-qte hidden role="dialog" aria-modal="true"><article><small data-c4-qte-kicker>SECRET BOSS</small><h2 data-c4-qte-title>PLANET-IMPACT CONTROL</h2><p data-c4-qte-text></p><div class="c4QteSequence" data-c4-qte-sequence></div><div class="c4QteMeter"><i data-c4-qte-meter></i></div><button type="button" data-c4-qte-action class="primary">BEGIN</button><small data-c4-qte-prompt></small></article></div>
    <div class="c4VibrationOverlay" data-c4-vibration-overlay hidden><div class="c4VibrationCore"></div><span>VIBRATION SENSE</span></div>
    <div class="c4WatcherScan" data-c4-watcher-scan hidden><small>HOLLOW WATCHER ANALYSIS</small><strong data-c4-watcher-state>SEARCHING FOR A PATTERN</strong><span data-c4-watcher-detail>Vary move, timing, and approach.</span><div><i data-c4-watcher-meter></i></div></div>
    <div class="c4EnemyRole" data-c4-enemy-role hidden><span class="enemyRoleIcon" data-c4-enemy-role-icon>➜</span><small>ENEMY ROLE</small><strong data-c4-enemy-role-name>SCOUT</strong><span data-c4-enemy-role-detail>Fast approach • low durability</span></div>
    <div class="c4TeamStatus" data-c4-team-status hidden><strong data-c4-squad-label>TEAM BATTLE</strong><span data-ally="bark">BARK • READY</span><span data-ally="wade">WADE • READY</span><small data-c4-squad-enemies>ENEMIES • 0</small></div>
    <div class="c4WaveBanner" data-c4-wave-banner></div>
    <div data-c4-ending-fade hidden style="position:absolute;inset:0;z-index:9998;background:#000;opacity:0;transition:opacity .85s ease;pointer-events:none"></div>
    <div class="c4Complete" data-c4-complete hidden><article><small>CHAPTER 4 COMPLETE</small><h2>CHAPTER 5 SETUP</h2><p>Rrvvfo reached Shadow’s Lookout. Chapter 5 begins when he wakes inside.</p><div data-c4-complete-secret></div><button type="button" class="primary" data-c4-continue>RETURN TO STORY</button></article></div>`;
  document.body.appendChild(root);return root;
}

export function startRrvvfoChapter4({onComplete=()=>{},onExit=()=>{},replay=false,playtestHub=false,repairFalseCompletion=false}={}){
  if(activeMission)activeMission.cleanup();
  activeMission=new RrvvfoChapter4({onComplete,onExit,replay,playtestHub,repairFalseCompletion});
  return activeMission.start();
}

class RrvvfoChapter4{
  constructor({onComplete,onExit,replay,playtestHub,repairFalseCompletion}){
    this.onComplete=onComplete;this.onExit=onExit;this.root=buildUI();
    this.progress=loadLostYearProgress();
    this.savedState=normalizeChapter4State(this.progress.chapter4State||{});this.savedCheckpoint=this.progress.lastCheckpoint;
    if(repairFalseCompletion){this.savedState=freshChapter4State();this.savedCheckpoint='rrvvfo-04'}
    this.completedBefore=Boolean(this.progress.completedMissions?.includes(MISSION_ID)||this.savedState.chapterComplete||chapter4Complete(this.savedState));
    // Replay/Restart is an explicit request for a clean temporary run. Do not depend
    // on completedMissions because older Chapter 4 saves may only carry chapterComplete.
    this.replayMode=Boolean(replay);
    this.playtestHub=Boolean(playtestHub);
    this.state=this.replayMode?freshChapter4State():this.savedState;
    if(this.playtestHub)this.state=freshChapter4State();
    this.mode='boot';this.area='region';this.dialogue=null;this.pacing=this.state.pacing;this.aftermathSeconds=0;this.aborted=false;this.completed=false;this.nearby=null;this.interactHeld=false;this.playerFlip=false;
    this.storyMenuOpen=false;this.storyMenuPaused=false;this.trackerOpen=false;this.choiceOpen=false;this.choiceCallback=null;this.toastTimer=0;this.areaTimer=0;
    this.currentFight=null;this.fightElapsed=0;this.fightLosses={};this.lastWatcherAction='';this.watcherRepeat=0;this.patternRecorded=0;this.watcherPhase=1;this.watcherMemory={action:'',signature:'',patternName:'',spacing:'',approach:'',repeat:0,confidence:0,lastHitAt:0,lastInterval:0,learned:false,exposedUntil:0,variety:[],recent:[]};
    this.vibrationPulse=0;this.vibrationCooldown=0;this.vibrationCombat=false;this.windClock=0;this.supportClock=0;this.lookoutLandingSeconds=0;this.lookoutPromptCueShown=false;this.teamAllies=[];this.squadEnemies=[];this.squadTargetIndex=0;this.squadAttackClock=0;this.targetCycleHeld=false;this.teamCommand='focus';this.waveBannerTimer=0;this.currentEnemyRole=null;
    this.qte={active:false,type:'',step:0,sequence:[],deadline:0,meter:0,onComplete:null};this.qteInputHeld=false;
    this.root.querySelector('[data-c4-journal]').addEventListener('click',()=>this.openTracker());
    this.root.querySelector('[data-c4-map]').addEventListener('click',()=>this.map?.open());
    this.root.querySelector('[data-c4-menu-button]').addEventListener('click',()=>this.openStoryMenu());
    this.root.querySelectorAll('[data-c4-menu-close],[data-c4-menu-resume]').forEach(button=>button.addEventListener('click',()=>this.closeStoryMenu()));
    this.root.querySelector('[data-c4-menu-manual]').addEventListener('click',()=>this.openManual());
    this.root.querySelector('[data-c4-menu-build]').addEventListener('click',()=>this.openBuildLab());
    this.root.querySelector('[data-c4-menu-start-fresh]').addEventListener('click',()=>this.startFreshFromReplay());
    this.root.querySelector('[data-c4-menu-journal]').addEventListener('click',()=>{this.closeStoryMenu();this.openTracker()});
    this.root.querySelector('[data-c4-close-journal]').addEventListener('click',()=>this.closeTracker());
    this.root.querySelector('[data-c4-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-c4-continue]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-c4-qte-action]').addEventListener('click',()=>this.advanceQte(this.qte.sequence[this.qte.step]||''));
    this.keyHandler=event=>this.onKey(event);document.addEventListener('keydown',this.keyHandler,true);
  }

  async startFreshFromReplay(){
    const approved=await storyConfirm({title:'START CHAPTER 4 FRESH?',message:'This ends the temporary Replay and resets only Chapter 4. Chapters 1–3, Story level, XP, stats, settings, and other progress stay saved.',confirmLabel:'START FRESH'});
    if(!approved)return;
    const progress=saveLostYearProgress(repairChapter4Progress(loadLostYearProgress()));
    if(progress.completedMissions?.includes(MISSION_ID))return;
    startRrvvfoChapter4({onComplete:this.onComplete,onExit:this.onExit,replay:false,repairFalseCompletion:true});
  }

  resetTransientPresentation(){
    for(const selector of ['[data-c4-menu]','[data-c4-tracker]','[data-c4-complete]','[data-c4-ending-fade]','[data-c4-choice]','[data-c4-qte]','[data-c4-vibration-overlay]','[data-c4-watcher-scan]','[data-c4-enemy-role]','[data-c4-team-status]']){
      const element=this.root.querySelector(selector);if(element)element.hidden=true;
    }
    this.storyMenuOpen=false;this.storyMenuPaused=false;this.trackerOpen=false;this.choiceOpen=false;this.choiceCallback=null;
  }

  start(){
    this.resetTransientPresentation();
    const menuMode=this.root.querySelector('[data-c4-menu-mode]');if(menuMode)menuMode.textContent=this.replayMode?'RRVVFO STORY • CHAPTER 4 • REPLAY (DOES NOT SAVE)':'RRVVFO STORY • CHAPTER 4';
    const freshButton=this.root.querySelector('[data-c4-menu-start-fresh]');if(freshButton)freshButton.hidden=!this.replayMode;
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'mystery'}));
    const stageId=this.stageForLocation(this.state.location);
    this.battle=createStoryBattle({stageId,opponent:{id:'hollow-grunt',name:'Project Hollow Grunt',cpu:true}});
    this.engine=attachStoryEngine(this.battle,{chapterLabel:'RRVVFO CHAPTER 4',stageName:'ECHO REGION',rootClasses:['storyChapter4','storyChapter4Hub'],getMode:()=>{
      if(this.engine?.dialogue)return'dialogue';if(['explore','cavern','mountain'].includes(this.mode))return'exploration';if(this.mode==='fight')return'combat';return this.mode;
    }});
    this.patchBattle();this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','']});
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART ACTIVE ENCOUNTER?',message:'Restart the current Chapter 4 encounter? Completed checkpoints remain saved.',confirmLabel:'RESTART'});
    this.root.hidden=false;
    if(this.playtestHub){
      this.root.querySelector('[data-c4-transition]').hidden=true;
      setTimeout(()=>{if(!this.aborted)this.enterPlaytestVillageHub()},80);
    }else{
      this.root.querySelector('[data-c4-transition]').hidden=false;
      setTimeout(()=>{if(this.aborted)return;this.root.querySelector('[data-c4-transition]').hidden=true;this.restoreOrBegin()},950);
    }
    return this;
  }

  enterPlaytestVillageHub(){
    this.state=freshChapter4State();
    for(const id of ['opening','villageReached','barkWadeArrive'])markChapter4Required(this.state,id);
    this.state.location='echo-village';
    this.state.teamRestSeen=false;
    this.enterVillage({opening:false,spawn:SPAWNS.village});
    this.toast('PLAYTEST HUB','ECHO VILLAGE','Fresh temporary Chapter 4 hub state. Your real Story save is preserved.');
  }

  syncRpgPacing(){
    const next=chapter4NextRequired(this.state);let phase='arrival',wave=0;
    if(this.area==='mountain'||this.area==='lookout'||this.area==='sky'){phase='departure';wave=4}
    else if(chapter4VillageDefenseComplete(this.state)){phase='aftermath';wave=3}
    else if(next==='villageDefended'){phase='crisis';wave=2}
    else if(this.state.requiredCompleted.includes('barkWadeArrive')){phase='development';wave=1}
    setRpgPacingPhase(this.pacing,phase,{wave});this.root.dataset.rpgPhase=this.pacing.phase;this.root.dataset.rpgWave=String(rpgPacingQuestWave(this.pacing));
    if(this.battle?.root){this.battle.root.dataset.rpgPhase=this.pacing.phase;this.battle.root.dataset.rpgChapter='chapter4'}
  }

  beginVillageAftermath(eventId,seconds=8){recordPacingAftermath(this.pacing,eventId);setRpgPacingPhase(this.pacing,'aftermath',{wave:3});this.aftermathSeconds=this.replayMode?0:Math.max(0,seconds);this.syncRpgPacing();this.saveState()}

  stageForLocation(location){if(location==='echo-caverns')return'echo-caverns';if(location==='echo-mountain'||location==='shadow-lookout')return'echo-mountain';if(location==='echo-sky')return'echo-sky';return'echo-village'}

  patchBattle(){
    const battle=this.battle;
    this.engine.useChapterProfile({
      input:next=>{
        const command=next()||EMPTY_COMMAND;
        if(this.mode==='qte'){
          const expected=this.qte.sequence[this.qte.step]||'';
          let value='';
          if(command.x<-.55)value='LEFT';else if(command.x>.55)value='RIGHT';else if(command.z<-.55)value='UP';else if(command.z>.55)value='DOWN';
          else if(command.charge)value='CHARGE';
          else if(command.interact||command.light||command.block)value=['RELEASE','LOCK','SEAL'].includes(expected)?expected:'';
          const held=Boolean(value);
          if(value&&!this.qteInputHeld)this.advanceQte(value);
          this.qteInputHeld=held;
          return this.engine.commandForMode({},'qte');
        }
        if(['explore','cavern','mountain'].includes(this.mode)){
          const interact=Boolean(command.interact);if(interact&&!this.interactHeld)this.tryInteract();this.interactHeld=interact;
          return this.engine.commandForMode(command,'exploration',{allowJump:true,allowDash:true,allowInteract:true});
        }
        if(this.mode==='fight'){if(this.currentFight?.squadMode){const targetCycle=Boolean(command.interact);if(targetCycle&&!this.targetCycleHeld)this.cycleSquadTarget();this.targetCycleHeld=targetCycle;command.interact=false}else this.targetCycleHeld=false;return this.engine.commandForMode(command,'combat')}
        this.interactHeld=Boolean(command.interact);return this.engine.commandForMode({},this.mode);
      },
      cpu:(next,fighter,foe,dt)=>{
        if(this.mode!=='fight'||!this.currentFight)return EMPTY_COMMAND;
        const t=this.fightElapsed,dx=foe.x-fighter.x,dz=foe.z-fighter.z,d=Math.max(1,Math.hypot(dx,dz));
        if(this.currentFight.kind==='watcher'){
          const phase=this.watcherPhase||1,habits=foe.combatHabits||{},projectileBias=(habits.projectiles||0)>2,blockBias=(habits.blockTime||0)>1.4,launcherBias=(habits.launchers||0)>1;
          if(phase===1)return{x:dx/d*.68,z:dz/d*.68,jump:false,light:t%1.15<.12,heavy:t%2.8<.12,launcher:t%5.1<.1,dash:d>250,block:t%3.3<.34,charge:false,grab:false,counter:false,special:false};
          if(phase===2&&projectileBias)return{x:dx/d*.2,z:dz/d*.2,jump:false,light:t%1.4<.1,heavy:false,launcher:false,dash:t%1.05<.22,block:t%2.4<.75,charge:false,grab:d<95&&t%2.7<.12,counter:t%3.1<.12,special:false};
          if(phase===2&&(blockBias||launcherBias))return{x:-dx/d*.3,z:-dz/d*.3,jump:false,light:t%1.2<.12,heavy:t%2.9<.1,launcher:false,dash:t%2.2<.14,block:t%2.7<.4,charge:false,grab:false,counter:t%2.9<.12,special:t%3.2<.12};
          return{x:dx/d*.9,z:dz/d*.9,jump:t%3.8<.08,light:t%.92<.12,heavy:t%2.25<.12,launcher:t%4.1<.1,dash:d>180||t%1.55<.13,block:t%2.8<.34,charge:false,grab:d<88&&t%3.6<.1,counter:t%3.5<.1,special:t%3.1<.1};
        }
        if(this.currentFight.kind==='ryuzankaro'){
          const phase=this.currentFight.phase||1,aggression=phase===1?1:phase===2?1.3:1.45;
          return{x:dx/d*aggression,z:dz/d*aggression,jump:t%3.7<.08,light:t%(1.25/aggression)<.12,heavy:t%(2.8/aggression)<.11,launcher:t%(4.8/aggression)<.09,dash:d>170||t%1.5<.14,block:t%3.3<.28,charge:false,grab:d<80&&t%3.9<.1,counter:t%3.1<.09,special:t%(3.4/aggression)<.12};
        }
        if(this.currentFight.squadMode){
          const archetype=String(fighter.aiArchetype||'rushdown');
          if(archetype==='ranged')return{x:-dx/d*.55,z:-dz/d*.55,jump:false,light:false,heavy:t%2.8<.1,launcher:false,dash:d<190,block:t%3.1<.25,charge:false,grab:false,counter:false,special:t%1.45<.12};
          if(archetype==='guard')return{x:dx/d*.42,z:dz/d*.42,jump:false,light:t%1.6<.11,heavy:t%3.1<.12,launcher:false,dash:false,block:t%1.45<.62,charge:false,grab:d<92&&t%2.4<.12,counter:t%2.8<.1,special:false};
          if(archetype==='heavy')return{x:dx/d*.48,z:dz/d*.48,jump:false,light:t%1.9<.1,heavy:t%2.35<.15,launcher:t%4.4<.08,dash:false,block:t%3.4<.28,charge:false,grab:d<95&&t%2.9<.12,counter:false,special:false};
          if(archetype==='trickster')return{x:dx/d*.34,z:dz/d*.62,jump:t%3.2<.08,light:t%1.2<.12,heavy:false,launcher:t%4.2<.08,dash:t%1.35<.18,block:t%2.8<.25,charge:false,grab:false,counter:t%2.7<.1,special:t%2.4<.1};
          if(archetype==='support')return{x:-dx/d*.22,z:dz/d*.22,jump:false,light:t%1.8<.1,heavy:false,launcher:false,dash:d<160,block:t%2.1<.45,charge:t%3.5<.2,grab:false,counter:false,special:t%2.2<.12};
          return{x:dx/d*.92,z:dz/d*.92,jump:false,light:t%.9<.13,heavy:t%2.4<.1,launcher:t%4.6<.08,dash:d>210,block:t%3.4<.2,charge:false,grab:d<80&&t%3.2<.1,counter:false,special:false};
        }
        return next(fighter,foe,dt);
      },
      castAbility:(next,slot)=>{
        if(this.mode==='qte'){
          const expected=this.qte.sequence[this.qte.step]||'';
          const value=slot===3?'OBJECT SWAP':slot===4?(expected==='VIBRATION'?'VIBRATION':'LENS'):'';
          if(value){this.advanceQte(value);return true}
          return false;
        }
        if(['explore','cavern','mountain'].includes(this.mode)){
          if(slot===4&&this.state.rewards.vibrationSense){this.useVibrationSense();return true}
          if(slot===3&&this.area==='mountain'){this.battle.notice('OBJECT SWAP • NO MARKED TARGET IN RANGE',1.1);return false}
          this.battle.notice(this.state.rewards.vibrationSense?'SLOT 4 • VIBRATION SENSE':'ABILITIES RESPOND TO MARKED OBJECTIVES',1.1);return false;
        }
        if(this.mode==='fight')return next(slot);
        return false;
      },
      applyDamage:(next,attacker,target,damage,meta={})=>{
        let adjusted=damage;
        if(this.mode==='fight'&&this.currentFight?.kind==='watcher'&&target===battle.fighters[1]&&attacker===battle.fighters[0]){
          const action=this.playerActionLabel(attacker,meta),now=performance.now(),memory=this.watcherMemory,phase=this.watcherPhase||1;
          const interval=memory.lastHitAt?now-memory.lastHitAt:0;
          const gap=Math.hypot((attacker.x||0)-(target.x||0),(attacker.z||0)-(target.z||0));
          const spacing=gap<125?'CLOSE':gap<285?'MID':'LONG';
          const dx=(target.x||0)-(attacker.x||0),dz=(target.z||0)-(attacker.z||0),length=Math.max(1,Math.hypot(dx,dz));
          const moveX=Number(attacker.moveX||attacker.moveVX)||0,moveZ=Number(attacker.moveZ||attacker.moveVZ)||0;
          const approachDot=(moveX*dx+moveZ*dz)/length;
          const approach=approachDot>.16?'ADVANCE':approachDot<-.16?'RETREAT':'CIRCLE';
          const signature=watcherSignature({action,spacing,approach,phase}),patternName=watcherPatternName({action,spacing,approach,phase});
          const timingChanged=Boolean(memory.lastInterval&&interval&&Math.abs(interval-memory.lastInterval)>420);
          const sameSignature=signature===memory.signature;
          const brokeLearned=memory.learned&&(!sameSignature||timingChanged);
          if(sameSignature&&!timingChanged){memory.repeat++;memory.confidence=clamp(memory.confidence+(phase===1?.26:phase===2?.22:.19),0,1)}
          else{memory.variety=unique([...memory.variety.slice(-3),signature]);memory.repeat=0;memory.confidence=clamp(memory.confidence-(timingChanged?.34:.48),0,1);memory.learned=false}
          memory.action=action;memory.signature=signature;memory.patternName=patternName;memory.spacing=spacing;memory.approach=approach;memory.recent=[...memory.recent.slice(-5),signature];memory.lastInterval=interval||memory.lastInterval;memory.lastHitAt=now;
          if(brokeLearned){memory.exposedUntil=now+1450;memory.confidence=0;adjusted*=1.35;target.stun=Math.max(target.stun,.24);battle.notice('PATTERN BROKEN • WATCHER EXPOSED',1.25);this.battle.burst(target.x,target.z,'#fff0a8',30,72)}
          else if(now<memory.exposedUntil){adjusted*=1.35;target.stun=Math.max(target.stun,.16);this.battle.burst(target.x,target.z,'#fff0a8',16,58)}
          else if(memory.confidence>=.72){adjusted*=.58;if(!memory.learned){memory.learned=true;this.patternRecorded++;this.state.hollowWatcher.patternsRecorded=Math.max(this.state.hollowWatcher.patternsRecorded,this.patternRecorded);battle.notice(`ADAPTED • ${patternName}`,1.25)}this.battle.burst(target.x,target.z,'#63dce3',14,54)}
          else if(memory.confidence>=.38){adjusted*=.84;battle.notice(`SCANNING • ${patternName}`,.72)}
          this.state.hollowWatcher.highestConfidence=Math.max(Number(this.state.hollowWatcher.highestConfidence)||0,Math.round(memory.confidence*100));
          this.updateWatcherHud();
        }
        const connected=next(attacker,target,adjusted,meta);
        if(!connected||this.mode!=='fight'||!this.currentFight)return connected;
        const player=battle.fighters[0],foe=battle.fighters[1];
        if(this.currentFight.kind==='ryuzankaro'&&target===foe){this.checkRyuzankaroPhase()}
        if(this.currentFight?.squadMode&&target===foe){const active=this.squadEnemies[this.squadTargetIndex];if(active)active.hp=Math.max(0,foe.hp)}
        if(target===foe&&foe.hp<=0){foe.hp=1;queueMicrotask(()=>this.currentFight?.squadMode?this.advanceSquadEnemy():this.advanceFightWave())}
        else if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.finishFight(false))}
        return connected;
      },
      updateCamera:()=>updateHubCamera(battle,{frameFight:this.mode==='fight'||this.lookoutLandingSeconds>0,allowLook:['explore','cavern','mountain'].includes(this.mode),hubDistance:this.area==='cavern'?980:this.area==='mountain'?1080:this.area==='lookout'?(this.lookoutLandingSeconds>0?660:820):1140,fightBaseDistance:920,fightMaxDistance:1190}),
      flipFor:(next,fighter)=>{
        if(['explore','cavern','mountain'].includes(this.mode)&&fighter===battle.fighters[0]){
          const speed=Math.hypot(fighter.moveX||0,fighter.moveZ||0);if(speed>.05){const self=battle.renderer.project(fighter.x,80+fighter.y,fighter.z),ahead=battle.renderer.project(fighter.x+(fighter.moveX||fighter.aimX||1)*120,80+fighter.y,fighter.z+(fighter.moveZ||fighter.aimZ||0)*120);this.playerFlip=ahead.x<self.x}return this.playerFlip;
        }return next(fighter);
      },
      drawFighterLayer:(next,fighters)=>next(this.mode==='fight'?fighters:[battle.fighters[0]]),
      drawFallback2D:(next,context,fighter,rect)=>{
        if(!['hollow-grunt','grunt-commander','ryuzankaro','hollow-watcher'].includes(fighter.id))return next(context,fighter,rect);
        const palette={
          'hollow-grunt':{body:'#343947',skin:'#777c87',hair:'#111821'},'grunt-commander':{body:'#462f48',skin:'#85818a',hair:'#14121c'},
          ryuzankaro:{body:'#17151e',skin:'#65525a',hair:'#09080d'},'hollow-watcher':{body:'#2b3e4a',skin:'#5cdbe3',hair:'#18252d'}
        }[fighter.id];
        const cx=rect.x+rect.width/2,s=rect.height/190;context.fillStyle='rgba(0,0,0,.35)';context.beginPath();context.ellipse(cx,rect.y+rect.height-3,36*s,10*s,0,0,Math.PI*2);context.fill();context.fillStyle=palette.body;context.fillRect(cx-25*s,rect.y+68*s,50*s,86*s);context.fillStyle=palette.skin;context.beginPath();context.arc(cx,rect.y+48*s,20*s,0,Math.PI*2);context.fill();context.fillStyle=palette.hair;context.fillRect(cx-25*s,rect.y+19*s,50*s,26*s);
      },
      draw:next=>{next();this.drawChapterWorld()},
      update:(next,dt)=>{
        next(dt);if(!battle.active||this.aborted)return;this.toastTimer=Math.max(0,this.toastTimer-dt);this.areaTimer=Math.max(0,this.areaTimer-dt);this.vibrationPulse=Math.max(0,this.vibrationPulse-dt);this.vibrationCooldown=Math.max(0,this.vibrationCooldown-dt);this.windClock+=dt;this.supportClock+=dt;
        if(!this.toastTimer)this.root.querySelector('[data-c4-toast]').hidden=true;if(!this.areaTimer)this.root.querySelector('[data-c4-area]').hidden=true;
        if(['explore','cavern','mountain'].includes(this.mode)){const player=battle.fighters[0];player.hp=Math.max(1,Math.min(player.maxHp,player.hp));player.en=Math.max(0,Math.min(100,player.en));player.guard=Math.max(0,Math.min(100,player.guard));battle.time=9999;this.updateExploration(dt)}
        else if(this.mode==='fight'){battle.time=9999;this.updateFight(dt)}
        else if(this.mode==='qte')this.updateQte();
        this.root.querySelector('[data-c4-vibration-overlay]').hidden=!(this.vibrationCombat||this.vibrationPulse>0);this.map?.draw();
      },
      exit:async next=>{const leave=await storyConfirm({title:'EXIT CHAPTER 4?',message:'Completed Echo Region checkpoints remain saved. Active fights restart.',confirmLabel:'EXIT CHAPTER'});if(!leave)return;this.saveState();next();this.cleanup();this.onExit()}
    });
  }

  playerActionLabel(fighter,meta={}){
    if(fighter.abilityState?.ability?.label)return fighter.abilityState.ability.label.toUpperCase();
    if(fighter.attackState?.def?.kind)return fighter.attackState.def.kind.toUpperCase();
    if(meta.label)return String(meta.label).toUpperCase();return'BASIC ATTACK';
  }

  restoreOrBegin(){
    if(this.state.chapterComplete){this.enterLookout({restored:true});this.showCompletion();return}
    if(this.state.ryuzankaro.started&&!ryuzankaroQuestResolved(this.state)&&['impact','aerial','village-final','seal'].includes(this.state.ryuzankaro.checkpoint)){
      this.resumeRyuzankaroCheckpoint();return;
    }
    if(this.state.location==='echo-caverns'){this.enterCaverns({restored:true});return}
    if(this.state.location==='shadow-lookout'&&this.state.requiredCompleted.includes('lookoutReached')){this.enterLookout({restored:true});return}
    if(this.state.location==='echo-mountain'||this.state.location==='shadow-lookout'){this.enterMountain({restored:true});return}
    this.enterVillage({opening:!this.state.requiredCompleted.includes('opening'),spawn:this.state.requiredCompleted.includes('villageReached')?SPAWNS.village:SPAWNS.region});
  }

  resumeRyuzankaroCheckpoint(){
    const checkpoint=this.state.ryuzankaro.checkpoint;
    if(checkpoint==='aerial'){this.startRyuzankaroAerial({restored:true});return}
    if(checkpoint==='village-final'){this.returnFromSky({restored:true});return}
    if(checkpoint==='seal'){this.enterVillage({spawn:{x:100,z:120}});setTimeout(()=>this.startSealQte(),250);return}
    this.enterVillage({spawn:VILLAGE_POINTS.oldMan});setTimeout(()=>this.startImpactQte(),250);
  }

  switchStage(stageId){if(this.battle.active)this.battle.stopMatch();this.battle.setStage(stageId);this.battle.start();this.battle.root.querySelector('[data-result]')?.classList.add('hidden')}
  preparePlayer(point){const player=this.battle.fighters[0];player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(point.x,point.z);void this.battle.ensureFighterAsset(player,'rrvvfo');applyStoryProgressionToFighter(player,loadLostYearProgress());player.en=72;player.guard=100;snapHubCamera(this.battle,player,{distance:this.area==='cavern'?980:this.area==='mountain'?1080:this.area==='lookout'?820:1140});this.hideOpponent()}
  hideOpponent(){const foe=this.battle.fighters[1];foe.y=-1400;foe.x=this.battle.fighters[0].x-140;foe.z=this.battle.fighters[0].z-140;foe.hp=100;foe.attackState=null;foe.asset=null}
  rebuildMap(){this.map?.destroy();const bounds=this.battle.stage.bounds;this.map=new StoryMap({title:this.area==='cavern'?'ECHO CAVERNS MAP':this.area==='mountain'?'MOUNTAIN PATH MAP':this.area==='lookout'?'SHADOW’S LOOKOUT':'ECHO REGION MAP',bounds,getPlayer:()=>this.battle?.fighters?.[0]||null,getObjective:()=>this.objectivePoint(),getPoints:()=>this.mapPoints()})}

  enterVillage({opening=false,spawn=SPAWNS.village}={}){
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'echoVillage'}));
    this.area='village';this.state.location=this.state.requiredCompleted.includes('villageReached')?'echo-village':'echo-region';this.switchStage('echo-village');this.mode='explore';this.currentFight=null;this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();this.battle.root.classList.add('storyChapter4Hub');this.battle.root.classList.remove('storyChapter4Combat');
    this.syncRpgPacing();this.engine.setLabels({stageName:'ECHO REGION',chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO','']});this.preparePlayer(spawn);this.engine.setHotbarAvailability(this.state.rewards.vibrationSense?[4]:[],{show:this.state.rewards.vibrationSense});this.showAreaTitle(this.state.requiredCompleted.includes('villageReached')?'ECHO VILLAGE • RESONANCE SETTLEMENT':'LOWER ECHO REGION','CHAPTER 4 • ANCIENT MOUNTAIN COUNTRY');document.dispatchEvent(new CustomEvent('pxstoryarrival',{detail:{title:this.state.requiredCompleted.includes('villageReached')?'ECHO VILLAGE':'LOWER ECHO REGION',detail:'Ancient mountain country',tone:'echo',onceKey:`c4-area:${this.state.requiredCompleted.includes('villageReached')?'village':'region'}`}}));this.rebuildMap();this.saveState();if(opening)this.showOpening();else{this.updateObjective();this.refreshTracker()}
  }

  showOpening(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Argh, damn it. I escaped, but what about that damn Sage? If he’d filled me in, he wouldn’t be trapped in there.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'He’s probably handling himself.',tail:'down'},
      {speaker:'TELEPORTER',speakerClass:'neutral',text:'ROUTE INACTIVE. RETURN SIGNAL UNAVAILABLE.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Great. Village first. Shadow’s place after that.',tail:'down'}
    ],()=>{this.completeRequired('opening');this.mode='explore';this.battle.phase='play';this.updateObjective();this.toast('MAIN OBJECTIVE','REACH ECHO VILLAGE','Follow the stone path through the lower region.')});
  }

  reachVillage(){
    this.showDialogue([
      {speaker:'ECHO VILLAGER',speakerClass:'neutral',text:'You came through the damaged teleporter? Nobody has arrived from there in years.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'It worked once. Now it’s pretending it never knew me.',tail:'down'},
      {speaker:'ECHO VILLAGER',speakerClass:'neutral',text:'The mountain lift is damaged. Armed strangers have been installing machines near our ruins.',tail:'down'}
    ],()=>{this.completeRequired('villageReached');this.state.location='echo-village';this.mode='explore';this.battle.phase='play';this.syncRpgPacing();this.updateObjective();this.toast('HUB INTRODUCTION','LEARN HOW ECHO VILLAGE LIVES','Inspect the resonance wall and the water channel before the next arrival.')});
  }

  barkWadeArrival(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Wade? Bark? You came to the village?',tail:'down'},
      {speaker:'WADE',speakerClass:'p2',text:'We found a thingy that took us here.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'You and the Sage have been gone for days, so we went to check on you. The cameras showed you getting teleported somewhere.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I’VE BEEN OUT FOR DAYS?!',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'Yes. We’ve been fighting a lot of things trying to reach you, so we’re drained.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'We’ll stay here for now. Rest for a day, then head toward that strange shadowy figure’s place. Maybe he knows something.',tail:'down'}
    ],()=>{this.completeRequired('barkWadeArrive');this.mode='explore';this.battle.phase='play';this.updateObjective();this.toast('TEAM REUNITED','RESTORE THE ECHO BEACON','Rrvvfo, Bark, and Wade each have one part of the repair.')});
  }

  enterCaverns({restored=false}={}){
    if(!restored&&!this.state.variety.fieldRouteComplete){this.toast('ROUTE BLOCKED','USE THE PARTY FIELD ACTIONS','Bark, Wade, and Rrvvfo must repair the damaged approach first.');this.updateObjective();return}
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'echoCavern'}));
    this.area='cavern';this.state.location='echo-caverns';this.switchStage('echo-caverns');this.mode='cavern';this.currentFight=null;this.battle.phase='play';this.battle.hideBanner();this.engine.setLabels({stageName:'ECHO CAVERNS',chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO','']});this.preparePlayer(restored?SPAWNS.cavern:{x:-980,z:0});this.engine.setHotbarAvailability([],{show:false});this.showAreaTitle('ECHO CAVERNS','PUZZLE ROUTE • ELEMENTAL SEALS');this.rebuildMap();this.saveState();if(!this.state.requiredCompleted.includes('cavernsEntered')){this.showDialogue([
      {speaker:'WADE',speakerClass:'p2',text:'The cave is making my footsteps sound faster.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'That is because you keep running ahead.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Three doors. Fire, earth, and lightning. At least this place knows who showed up.',tail:'down'}
    ],()=>{this.completeRequired('cavernsEntered');this.mode='cavern';this.battle.phase='play';this.updateObjective()})}else if(this.state.ryuzankaro.started&&!this.state.ryuzankaro.ingredients.includes('rootstone')){this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:'The grunts reopened a side chamber after our first trip.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'So the cave changed while we were gone. Cool. Also bad.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'At least this isn’t the exact same walk twice.',tail:'down'}],()=>{this.mode='cavern';this.battle.phase='play';this.updateObjective()})}else this.updateObjective();
  }

  returnToVillageAfterParts(){
    this.enterVillage({spawn:SPAWNS.villageReturn});
    this.showDialogue([
      {speaker:'BARK',speakerClass:'neutral',text:'The last group escaped before we could question them.',tail:'down'},
      {speaker:'WADE',speakerClass:'p2',text:'They dropped the parts. That counts as answering.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'No, it counts as being bad at stealing.',tail:'down'},
      {speaker:'ECHO VILLAGER',speakerClass:'rival',text:'THE MACHINES ARE MOVING. THEY’RE ATTACKING THE VILLAGE!',tail:'down'}
    ],()=>this.startFight({kind:'village-defense',id:'grunt-commander',name:'Project Hollow Commander',hpScale:1.25,xp:260,stage:'echo-village',teamBattle:true,squadMode:'3v3',waves:[{id:'hollow-grunt',name:'Hollow Scout',hpScale:.72,archetype:'rushdown'},{id:'hollow-grunt',name:'Hollow Striker',hpScale:.88,archetype:'guard'},{id:'grunt-commander',name:'Project Hollow Commander',hpScale:1.25,archetype:'support'}]}));
  }

  enterMountain({restored=false}={}){
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'echoMountain'}));
    this.area='mountain';this.state.location='echo-mountain';this.switchStage('echo-mountain');this.mode='mountain';this.currentFight=null;this.battle.phase='play';this.battle.hideBanner();this.engine.setLabels({stageName:'MOUNTAIN PATH',chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO','']});this.preparePlayer(restored?SPAWNS.mountain:{x:-1240,z:0});this.engine.setHotbarAvailability(this.state.rewards.vibrationSense?[4]:[],{show:this.state.rewards.vibrationSense});this.showAreaTitle('MOUNTAIN PATH','SOLO ROUTE • TRACE THE SIGNALS');this.rebuildMap();this.saveState();if(!this.state.requiredCompleted.includes('mountainEntered')){this.completeRequired('mountainEntered');const lines=this.state.ryuzankaro.bossDefeated?[
      {speaker:'BARK',speakerClass:'neutral',text:'We can’t climb that mountain right now.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'I could.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'...',tail:'down'},{speaker:'BARK',speakerClass:'neutral',text:'This place might still be a target. We should stay and protect it.',tail:'down'}
    ]:[{speaker:'BARK',speakerClass:'neutral',text:'The grunts were searching this village for a reason.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'They might come back.',tail:'down'},{speaker:'BARK',speakerClass:'neutral',text:'This place might be a target. We should stay here.',tail:'down'}];this.showDialogue(lines,()=>{this.mode='mountain';this.battle.phase='play';this.updateObjective();this.toast('SOLO OBJECTIVE','CLIMB TOWARD SHADOW’S LOOKOUT','Use echoes and Project Hollow signals to find the route.')})}else this.updateObjective();
  }

  updateExploration(dt){
    const player=this.battle.fighters[0];
    if(this.area==='lookout'){
      // The lookout is a real elevated walkable surface. Keep the fighter firmly grounded
      // at sanctuary height so a restored checkpoint cannot drift, fall, or feel floaty.
      player.y=LOOKOUT_HEIGHT;player.vy=0;player.grounded=true;player.kvy=0;
      player.x=clamp(player.x,LOOKOUT_BOUNDS.minX,LOOKOUT_BOUNDS.maxX);
      player.z=clamp(player.z,LOOKOUT_BOUNDS.minZ,LOOKOUT_BOUNDS.maxZ);
      if(this.lookoutLandingSeconds>0)this.lookoutLandingSeconds=Math.max(0,this.lookoutLandingSeconds-dt);
      if(!this.lookoutPromptCueShown&&this.lookoutLandingSeconds===0&&chapter4NextRequired(this.state)==='shadowArrival'){
        this.lookoutPromptCueShown=true;
        this.battle.notice('SHADOW’S ENTRANCE • AHEAD',1.15);
      }
    }
    if(this.aftermathSeconds>0){const before=this.aftermathSeconds;this.aftermathSeconds=Math.max(0,this.aftermathSeconds-dt);if(before>0&&this.aftermathSeconds===0){this.updateObjective();this.battle.notice('THE VILLAGE HAS SETTLED',1.2)}}
    if(this.area==='village'||this.area==='mountain'){
      const force=this.area==='mountain'?.95:.46,wind=Math.sin(this.windClock*.85)*force;player.moveVX+=(wind*18)*dt;player.moveVZ+=(Math.cos(this.windClock*.55)*wind*8)*dt;
      if(this.area==='mountain'&&Math.abs(wind)>.7&&Math.floor(this.windClock*2)%7===0)this.battle.notice('STRONG WIND • MOVE WITH THE CURRENT',.8);
    }
    this.nearby=this.availableInteractions().filter(item=>distance(player,item)<150).sort((a,b)=>distance(player,a)-distance(player,b))[0]||null;
    const prompt=this.root.querySelector('[data-c4-prompt]');prompt.hidden=!this.nearby;if(this.nearby){this.root.querySelector('[data-c4-prompt-title]').textContent=this.nearby.label;this.root.querySelector('[data-c4-prompt-detail]').textContent=this.engine.prompt('interact','E').toUpperCase()}
  }

  availableInteractions(){
    const next=chapter4NextRequired(this.state),items=[];
    if(this.area==='village'){
      if(next==='villageReached')items.push({kind:'village-gate',...VILLAGE_POINTS.gate});
      if(next==='barkWadeArrive'){
        if(!this.pacing.interactions.includes('resonance-wall'))items.push({kind:'village-intro:resonance-wall',x:-520,z:210,label:'READ THE RESONANCE WALL'});
        if(!this.pacing.interactions.includes('water-channel'))items.push({kind:'village-intro:water-channel',x:-80,z:30,label:'INSPECT THE WATER CHANNEL'});
      }
      if(next==='beaconRestored')for(const point of CHAPTER4_BEACON_NODES)if(!this.state.beaconNodes.includes(point.id))items.push({kind:`beacon:${point.id}`,...point});
      if(next==='cavernsEntered'&&!this.state.variety.fieldRouteComplete)items.push({kind:'party-route',...VILLAGE_POINTS.partyRoute,label:'REPAIR THE CAVERN ROUTE'});
      if((next==='cavernsEntered'&&this.state.variety.fieldRouteComplete)||(this.state.ryuzankaro.started&&!this.state.ryuzankaro.ingredients.includes('rootstone')))items.push({kind:'cavern-entrance',...VILLAGE_POINTS.cavern,label:this.state.ryuzankaro.started?'RETURN TO ECHO CAVERNS':'ENTER ECHO CAVERNS'});
      if(next==='villageDefended'&&this.state.liftParts.length===CHAPTER4_LIFT_PARTS.length)items.push({kind:'defense',x:360,z:50,label:'DEFEND ECHO VILLAGE'});
      if(ryuzankaroQuestAvailable(this.state)&&!ryuzankaroQuestResolved(this.state)&&this.state.ryuzankaro.ingredients.length<CHAPTER4_INGREDIENTS.length)items.push({kind:'old-man',...VILLAGE_POINTS.oldMan,label:this.state.ryuzankaro.started?'CONTINUE OLD MAN’S POTIONS':'THE OLD MAN’S POTIONS'});
      if(this.state.ryuzankaro.started&&!this.state.ryuzankaro.bossDefeated)for(const ingredient of CHAPTER4_INGREDIENTS)if(ingredient.area==='village'&&!this.state.ryuzankaro.ingredients.includes(ingredient.id))items.push({kind:`ingredient:${ingredient.id}`,...ingredient});
      if(this.state.ryuzankaro.started&&!this.state.ryuzankaro.ingredients.includes('rootstone'))items.push({kind:'cavern-shortcut',...VILLAGE_POINTS.cavernShortcut,label:'SHORTCUT TO ROOTSTONE CHAMBER'});
      if(this.state.ryuzankaro.started&&this.state.ryuzankaro.ingredients.length===CHAPTER4_INGREDIENTS.length&&!this.state.ryuzankaro.bossDefeated)items.push({kind:'mix-potion',...VILLAGE_POINTS.oldMan,label:'PREPARE THE POTION'});
      if(this.state.requiredCompleted.includes('beaconRestored')&&!this.state.charm?.echoChimesComplete)items.push({kind:'echo-chimes',...VILLAGE_POINTS.chimes,label:'PLAY THE ECHO CHIMES'});
      if(next==='mountainDecision'&&chapter4VillageDefenseComplete(this.state)&&!this.state.teamRestSeen)items.push({kind:'team-rest',...VILLAGE_POINTS.recovery,label:'REST WITH BARK & WADE'});
      if(next==='mountainDecision'&&chapter4VillageDefenseComplete(this.state))items.push({kind:'mountain-gate',...VILLAGE_POINTS.mountain,label:'LEAVE FOR THE MOUNTAIN'});
    }
    if(this.area==='cavern'){
      if(next==='liftPartsRecovered'||this.state.ryuzankaro.started){
        for(const door of CHAPTER4_CAVERN_DOORS)if(!this.state.cavernDoors.includes(door.id))items.push({kind:`door:${door.id}`,...door});
        if(this.state.cavernDoors.length===CHAPTER4_CAVERN_DOORS.length)for(const part of CHAPTER4_LIFT_PARTS)if(!this.state.liftParts.includes(part.id))items.push({kind:`part:${part.id}`,...part});
        const rootstone=CHAPTER4_INGREDIENTS.find(item=>item.id==='rootstone');if(this.state.ryuzankaro.started&&!this.state.ryuzankaro.ingredients.includes('rootstone'))items.push({kind:'ingredient:rootstone',...rootstone});
        if((this.state.liftParts.length===CHAPTER4_LIFT_PARTS.length||this.state.ryuzankaro.ingredients.includes('rootstone')))items.push({kind:'cavern-exit',x:-1040,z:0,label:'RETURN TO ECHO VILLAGE'});
      }
    }
    if(this.area==='mountain'){
      if(next==='mountainSignals')for(const point of CHAPTER4_MOUNTAIN_SIGNALS)if(!this.state.mountainSignals.includes(point.id))items.push({kind:`mountain:${point.id}`,...point});
      if(next==='hollowWatcherDefeated'&&this.state.mountainSignals.length===CHAPTER4_MOUNTAIN_SIGNALS.length)items.push({kind:'watcher',x:760,z:0,label:'HOLLOW WATCHER'});
      if(next==='lookoutReached'&&this.state.hollowWatcher.defeated)items.push({kind:'lookout',x:1010,z:-250,label:'PICK UP THE SUMMIT PEBBLE'});
    }
    if(this.area==='lookout'&&next==='shadowArrival')items.push({kind:'shadow-entrance',...LOOKOUT_ENTRANCE,label:'ENTER SHADOW’S LOOKOUT'});
    return items;
  }

  tryInteract(){if(!this.nearby||!['explore','cavern','mountain'].includes(this.mode))return;const item=this.nearby;const [kind,id]=item.kind.split(':');
    if(kind==='village-gate')this.reachVillage();
    else if(kind==='village-intro')this.inspectVillageLandmark(id);
    else if(kind==='beacon')this.repairBeacon(id);
    else if(kind==='party-route')this.beginPartyFieldRoute();
    else if(kind==='cavern-entrance'||kind==='cavern-shortcut')this.enterCaverns({restored:kind==='cavern-shortcut'});
    else if(kind==='door')this.openElementDoor(id);
    else if(kind==='part')this.collectLiftPart(id);
    else if(kind==='cavern-exit'){if(this.state.liftParts.length===CHAPTER4_LIFT_PARTS.length&&!this.state.requiredCompleted.includes('liftPartsRecovered')){this.completeRequired('liftPartsRecovered');this.returnToVillageAfterParts()}else this.enterVillage({spawn:SPAWNS.villageReturn})}
    else if(kind==='defense')this.startFight({kind:'village-defense',id:'grunt-commander',name:'Project Hollow Commander',hpScale:1.25,xp:260,stage:'echo-village',teamBattle:true,squadMode:'3v3',waves:[{id:'hollow-grunt',name:'Hollow Scout',hpScale:.72,archetype:'rushdown'},{id:'hollow-grunt',name:'Hollow Striker',hpScale:.88,archetype:'guard'},{id:'grunt-commander',name:'Project Hollow Commander',hpScale:1.25,archetype:'support'}]});
    else if(kind==='old-man')this.startOldManQuest();
    else if(kind==='echo-chimes')this.playEchoChimes();
    else if(kind==='team-rest')this.restWithTeam();
    else if(kind==='ingredient')this.collectIngredient(id);
    else if(kind==='mix-potion')this.revealRyuzankaro();
    else if(kind==='mountain-gate')this.chooseMountainDeparture();
    else if(kind==='mountain')this.inspectMountainSignal(id);
    else if(kind==='watcher')this.startFight({kind:'watcher',id:'hollow-watcher',name:'Hollow Watcher',hpScale:1.55,xp:330,stage:'echo-mountain'});
    else if(kind==='lookout')this.startLookoutObjectSwap();
    else if(kind==='shadow-entrance')this.startShadowArrival();
  }

  restWithTeam(){
    if(this.state.teamRestSeen){this.toast('PARTY RECOVERED','BARK & WADE ARE READY','The recovery mats remain here, but the Story reward is one-time.');return}
    this.showDialogue([
      {speaker:'WADE',speakerClass:'p2',text:'One minute. Bark said one minute, and I am enforcing it.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You have never enforced sitting still in your life.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'The village is secure for now. Eat, recover, then take the mountain alone.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fine. But if the Sage complains I was late, I am blaming both of you.',tail:'down'}
    ],()=>{
      this.state.teamRestSeen=true;
      const player=this.battle.fighters[0];if(player){player.hp=player.maxHp;player.en=100;player.guard=100}
      if(!this.replayMode)addStoryXp(45,{source:'ECHO VILLAGE PARTY REST'});
      this.saveState();this.mode='explore';this.battle.phase='play';this.battle.burst(VILLAGE_POINTS.recovery.x,VILLAGE_POINTS.recovery.z,'#8fe8ff',30,70);
      document.dispatchEvent(new CustomEvent('pxstorycelebration',{detail:{type:'activity',tone:'technique',kicker:'PARTY RECOVERY',title:'READY FOR THE MOUNTAIN',detail:'HP, Energy, and Guard restored. The solo route remains optional until you leave.',items:this.replayMode?['BARK + WADE CHECK-IN','REPLAY • NO XP']:['BARK + WADE CHECK-IN','+45 STORY XP'],onceKey:'c4-party-rest'}}));
      this.updateObjective();
    });
  }

  inspectVillageLandmark(id){
    const lines=id==='resonance-wall'?[{speaker:'ECHO VILLAGER',speakerClass:'neutral',text:'Each mark records a sound the mountain returned to us. We remember places by their echoes.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'So the wall is a map that argues back.',tail:'down'}]:[{speaker:'ECHO VILLAGER',speakerClass:'neutral',text:'The water channel carries vibration through every home. When the beacon weakens, the whole village hears it.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'That explains why everyone knew I arrived before I found the gate.',tail:'down'}];
    this.showDialogue(lines,()=>{recordPacingInteraction(this.pacing,id);const complete=completePacingOrientation('chapter4',this.pacing);this.saveState();this.syncRpgPacing();if(complete){document.dispatchEvent(new CustomEvent('pxstoryarrival',{detail:{kicker:'HUB UNDERSTOOD',title:'ECHO VILLAGE',detail:'The village is a living resonance network, not just a checkpoint.',tone:'echo',onceKey:'c4-village-orientation'}}));this.barkWadeArrival()}else{this.mode='explore';this.battle.phase='play';this.updateObjective()}})
  }

  beginPartyFieldRoute(){
    if(this.state.variety.fieldRouteComplete){this.toast('ROUTE REPAIRED','ECHO CAVERNS OPEN','Bark’s supports, Wade’s current, and Rrvvfo’s swapped brace remain in place.');return}
    this.showDialogue([
      {speaker:'BARK',speakerClass:'neutral',text:'The ground under this route will collapse if we move the support first.',tail:'down'},
      {speaker:'WADE',speakerClass:'p2',text:'So Bark holds the path, I power the mechanism, and Rrvvfo does the weird swapping part.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'The weird part is the part that actually fixes it.',tail:'down'}
    ],()=>this.runNextPartyFieldAction());
  }

  runNextPartyFieldAction(){
    const done=new Set(this.state.variety.fieldActions||[]);
    const action=CHAPTER4_PARTY_FIELD_ACTIONS.find(item=>!done.has(item.id));
    if(!action){this.finishPartyFieldRoute();return}
    const configs={
      'bark-support':{title:'BARK • STABILIZE THE PATH',text:'Brace the left and right fault lines, then seal the stone.',sequence:['LEFT','RIGHT','SEAL']},
      'wade-current':{title:'WADE • POWER THE ECHO MECHANISM',text:'Route the current through the upper and lower channels, then release.',sequence:['UP','DOWN','RELEASE']},
      'rrvvfo-swap':{title:'RRVVFO • PLACE THE SUPPORT',text:'Charge the throw, lock onto the prepared brace, then Object Swap it into place.',sequence:['CHARGE','LOCK','OBJECT SWAP']}
    };
    this.startTeamMechanicQte({type:`field-${action.id}`,...configs[action.id],seconds:12,onComplete:()=>{completePartyFieldAction(this.state.variety,action.id);const fieldSkillId=action.id==='bark-support'?'barkStabilize':action.id==='wade-current'?'wadeCurrent':action.id==='rrvvfo-swap'?'precisionSwap':'';if(fieldSkillId)masterFieldSkill(fieldSkillId);this.saveState();this.battle.burst(VILLAGE_POINTS.partyRoute.x,VILLAGE_POINTS.partyRoute.z,action.role==='BARK'?'#c99b5b':action.role==='WADE'?'#65caff':'#ff7957',24,72);this.toast('PARTY FIELD ACTION',action.label,`${this.state.variety.fieldActions.length} / ${CHAPTER4_PARTY_FIELD_ACTIONS.length}`);this.runNextPartyFieldAction()}});
  }

  finishPartyFieldRoute(){
    this.state.variety.fieldRouteComplete=true;this.state.variety.persistentChanges=[...new Set([...(this.state.variety.persistentChanges||[]),'echo-cavern-route-repaired'])];this.saveState();
    this.mode='explore';this.battle.phase='play';this.battle.burst(VILLAGE_POINTS.partyRoute.x,VILLAGE_POINTS.partyRoute.z,'#b8ecff',42,110);
    document.dispatchEvent(new CustomEvent('pxstorycelebration',{detail:{type:'activity',tone:'technique',kicker:'PARTY FIELD ROUTE COMPLETE',title:'ECHO CAVERN APPROACH REPAIRED',detail:'The route remains open and the team’s work is visible in Echo Village.',items:['BARK • SUPPORT','WADE • POWER','RRVVFO • OBJECT SWAP'],onceKey:'activity:party-field-route'}}));
    this.showDialogue([{speaker:'ECHO VILLAGER',speakerClass:'neutral',text:'The old route is carrying sound again. We will keep it open.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'I did the electricity part.',tail:'down'},{speaker:'BARK',speakerClass:'neutral',text:'We noticed.',tail:'down'}],()=>{this.mode='explore';this.battle.phase='play';this.updateObjective()});
  }

  playEchoChimes(){
    if(this.state.charm?.echoChimesComplete)return;
    this.showDialogue([{speaker:'WADE',speakerClass:'p2',text:'These plates make different echoes when you hit them.',tail:'down'},{speaker:'BARK',speakerClass:'neutral',text:'Do not hit all of them at once.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'He was already going to do that.',tail:'down'}],()=>this.startQte({type:'echo-chimes',title:'ECHO CHIME JAM',text:'Copy the short rhythm. No item hunt, no combat—just one party moment.',sequence:['LEFT','RIGHT','UP','DOWN','RELEASE'],seconds:10,onComplete:()=>{this.state.charm={...(this.state.charm||{}),echoChimesComplete:true};this.saveState();this.mode='explore';this.battle.phase='play';this.battle.burst(VILLAGE_POINTS.chimes.x,VILLAGE_POINTS.chimes.z,'#8fe8ff',32,90);document.dispatchEvent(new CustomEvent('pxstorybanter',{detail:{lines:[['WADE','That sounded exactly right.'],['BARK','It did not.'],['RRVVFO','The village is cheering, so we are calling it music.']],onceKey:'activity:echo-chimes-banter'}}));document.dispatchEvent(new CustomEvent('pxstorycelebration',{detail:{type:'activity',tone:'technique',kicker:'SIDE ACTIVITY COMPLETE',title:'ECHO CHIME JAM',detail:'Echo Village now repeats the team rhythm near the beacon.',items:['PARTY MEMORY','VILLAGE REACTION'],onceKey:'activity:echo-chimes'}}));this.updateObjective()}}));
  }

  startTeamMechanicQte({type,title,text,sequence,seconds=11,onComplete}){
    this.startQte({type:`team-${type}`,title,text,sequence,seconds,onComplete});
  }

  finishBeaconRepair(point){
    this.state.beaconNodes=unique([...this.state.beaconNodes,point.id]);
    this.battle.burst(point.x,point.z,point.role==='RRVVFO'?'#ff744f':point.role==='BARK'?'#d4a765':'#69c8ff',26,65);
    if(this.state.beaconNodes.length===CHAPTER4_BEACON_NODES.length){
      this.completeRequired('beaconRestored');
      this.showDialogue([
        {speaker:'ECHO BEACON',speakerClass:'neutral',text:'UNKNOWN SIGNALS DETECTED: VILLAGE SUBLEVEL. MOUNTAIN NETWORK. SHADOW LOOKOUT PROXIMITY.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'The tournament facility was only one part of this.',tail:'down'},
        {speaker:'BARK',speakerClass:'neutral',text:'The lift parts were taken into the caverns. That is our next route.',tail:'down'}
      ],()=>{this.mode='explore';this.battle.phase='play';this.updateObjective();this.toast('REGION NETWORK FOUND','ENTER ECHO CAVERNS','Recover the stolen mountain-lift parts.')});
    }else{this.mode='explore';this.battle.phase='play';this.saveState();this.updateObjective()}
  }

  finishElementDoor(door){
    this.state.cavernDoors=unique([...this.state.cavernDoors,door.id]);
    this.battle.burst(door.x,door.z,door.element==='FIRE'?'#ff7048':door.element==='EARTH'?'#d2a35d':'#65c8ff',30,70);
    this.mode='cavern';this.battle.phase='play';this.saveState();this.updateObjective();
    if(this.state.cavernDoors.length===CHAPTER4_CAVERN_DOORS.length)this.toast('ALL THREE SEALS OPEN','RECOVER THE LIFT PARTS','The stolen components are inside the grunt camp.');
  }

  repairBeacon(id){
    const point=CHAPTER4_BEACON_NODES.find(item=>item.id===id);if(!point)return;
    const lines={
      'signal-blocker':[{speaker:'RRVVFO',speakerClass:'p1',text:'Project Hollow hardware. I’ll burn the signal blocker without touching the beacon.',tail:'down'}],
      'stone-support':[{speaker:'BARK',speakerClass:'neutral',text:'The support is carrying the entire upper ring. I’ll hold it while the stone resets.',tail:'down'}],
      'energy-feed':[{speaker:'WADE',speakerClass:'p2',text:'I can reconnect it. Probably.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'That “probably” is doing a lot of work.',tail:'down'}]
    }[id];
    const qtes={
      'signal-blocker':{title:'RRVVFO • CONTROLLED HEAT',text:'Charge the flame, then release inside the safe heat band.',sequence:['CHARGE','RELEASE']},
      'stone-support':{title:'BARK • STABILIZE THE BEACON',text:'Balance the stone frame, then lock the support into place.',sequence:['LEFT','RIGHT','SEAL']},
      'energy-feed':{title:'WADE • ROUTE THE CURRENT',text:'Route the current through both sides, then release it into the beacon.',sequence:['UP','DOWN','RELEASE']}
    };
    this.showDialogue(lines,()=>{const qte=qtes[id];this.startTeamMechanicQte({type:`beacon-${id}`,...qte,onComplete:()=>this.finishBeaconRepair(point)})});
  }

  openElementDoor(id){
    const door=CHAPTER4_CAVERN_DOORS.find(item=>item.id===id);if(!door)return;
    const speaker=door.element==='FIRE'?'RRVVFO':door.element==='EARTH'?'BARK':'WADE';
    const text=door.element==='FIRE'?'Controlled heat. No explosions this time.':door.element==='EARTH'?'I’ll stabilize the frame before the seal moves.':'I only need to power the lines that are supposed to glow.';
    const qtes={FIRE:{title:'FIRE SEAL • CONTROL THE HEAT',text:'Charge and release without scorching the old mechanism.',sequence:['CHARGE','RELEASE']},EARTH:{title:'EARTH SEAL • HOLD THE FRAME',text:'Brace both sides, then seal the moving stone.',sequence:['LEFT','RIGHT','SEAL']},LIGHTNING:{title:'LIGHTNING SEAL • CONNECT THE NODES',text:'Route the current through the upper and lower channels.',sequence:['UP','DOWN','RELEASE']}};
    this.showDialogue([{speaker,speakerClass:speaker==='RRVVFO'?'p1':speaker==='WADE'?'p2':'neutral',text,tail:'down'}],()=>this.startTeamMechanicQte({type:`door-${id}`,...qtes[door.element],onComplete:()=>this.finishElementDoor(door)}));
  }

  collectLiftPart(id){const part=CHAPTER4_LIFT_PARTS.find(item=>item.id===id);if(!part)return;this.state.liftParts=unique([...this.state.liftParts,id]);this.battle.burst(part.x,part.z,'#ffd16e',20,50);this.toast('LIFT PART RECOVERED',part.label,`${this.state.liftParts.length} / ${CHAPTER4_LIFT_PARTS.length}`);this.saveState();this.updateObjective()}

  startOldManQuest(){
    if(!ryuzankaroQuestAvailable(this.state)){
      this.toast('QUEST LOCKED','DEFEND ECHO VILLAGE FIRST','The Old Man’s Potions unlocks only after the mandatory village-defense battle.');
      this.updateObjective();
      return;
    }
    if(!this.state.ryuzankaro.started){this.showDialogue([
      {speaker:'OLD MAN',speakerClass:'neutral',text:'You three look like you’ve fought your way across half the world.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'They have. I’m fine.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'You were launched through a teleporter.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I landed.',tail:'down'},
      {speaker:'OLD MAN',speakerClass:'neutral',text:'Bring me Ember Bloom, Rootstone, Thunder Dew, and the Triad Seed. Fire, earth, and lightning must collect them together.',tail:'down'}
    ],()=>{this.state.ryuzankaro.started=true;this.state.ryuzankaro.checkpoint='quest-started';this.mode='explore';this.battle.phase='play';this.saveState();this.updateObjective();this.toast('SECRET QUEST','THE OLD MAN’S POTIONS','Collect four three-element ingredients. The old man opened a shortcut beside the potion building for Rootstone.')})
    }else this.updateObjective();
  }

  completeIngredientPickup(id){
    const ingredient=CHAPTER4_INGREDIENTS.find(item=>item.id===id);if(!ingredient)return;
    this.state.ryuzankaro.ingredients=unique([...this.state.ryuzankaro.ingredients,id]);
    this.battle.burst(ingredient.x,ingredient.z,id==='emberBloom'?'#ff875a':id==='rootstone'?'#d3a55f':id==='thunderDew'?'#6fd6ff':'#c6e8b2',28,65);
    this.mode=this.area==='cavern'?'cavern':'explore';this.battle.phase='play';this.saveState();this.updateObjective();this.toast('INGREDIENT ACQUIRED',ingredient.title,`${this.state.ryuzankaro.ingredients.length} / ${CHAPTER4_INGREDIENTS.length}`);
  }

  collectIngredient(id){
    const ingredient=CHAPTER4_INGREDIENTS.find(item=>item.id===id);if(!ingredient)return;if(id==='rootstone'&&this.area!=='cavern'){this.enterCaverns();return}
    const lines={emberBloom:[{speaker:'RRVVFO',speakerClass:'p1',text:'A frozen flower that opens with heat. I have to warm it without burning it.',tail:'down'}],rootstone:[{speaker:'BARK',speakerClass:'neutral',text:'The ceiling is unstable. I’ll hold it. Get the mineral and move.',tail:'down'}],thunderDew:[{speaker:'WADE',speakerClass:'p2',text:'I’ll redirect the storm through the metal plants. Try not to stand where it shines.',tail:'down'}],triadSeed:[{speaker:'OLD MECHANISM',speakerClass:'neutral',text:'EARTH TO HOLD. FIRE TO WAKE. LIGHTNING TO CONNECT.',tail:'down'}]}[id];
    this.showDialogue(lines,()=>{
      const swarmIds=['rootstone','triadSeed'];
      if(swarmIds.includes(id)&&!this.state.ryuzankaro.swarmsCleared.includes(id)){
        this.startFight({kind:'ingredient-swarm',id:'hollow-grunt',name:'Project Hollow Swarm',hpScale:.72,xp:120,stage:this.area==='cavern'?'echo-caverns':'echo-village',teamBattle:true,squadMode:'3v2',ingredientReward:id,waves:[{id:'hollow-grunt',name:'Hollow Raider',hpScale:.72,archetype:'trickster'},{id:'grunt-commander',name:'Hollow Pack Leader',hpScale:.92,archetype:'heavy'}]});
      }else this.completeIngredientPickup(id);
    });
  }

  revealRyuzankaro(){this.state.ryuzankaro.checkpoint='impact';this.state.ryuzankaro.phase='impact';this.saveState();this.showDialogue([
    {speaker:'OLD MAN',speakerClass:'neutral',text:'Earth to hold it. Fire to wake it. Lightning to connect it.',tail:'down'},
    {speaker:'RRVVFO',speakerClass:'p1',text:'Connect what?',tail:'down'},
    {speaker:'RYUZANKARO',speakerClass:'rival',text:'Me.',tail:'down'},
    {speaker:'RYUZANKARO',speakerClass:'rival',text:'Training makes me stronger in this bodiless form, but I prefer actually having a body.',tail:'down'}
  ],()=>this.startImpactQte())}

  startImpactQte(){this.startQte({type:'impact',title:'PLANET-IMPACT CONTROL',text:'Alternate energy between both feet, then release at the safe moment.',sequence:['LEFT','RIGHT','LEFT','RIGHT','LEFT','RIGHT','CHARGE','RELEASE'],seconds:15,onComplete:()=>this.startRyuzankaroAerial()})}
  startSwapQte(){this.startQte({type:'swap',title:'OBJECT SWAP RETURN',text:'Read the pressure changes, locate Bark’s marked stone, and swap before the atmosphere.',sequence:['LEFT','UP','RIGHT','DOWN','LOCK','OBJECT SWAP'],seconds:13,onComplete:()=>this.returnFromSky()})}
  startSealQte(){this.startQte({type:'seal',title:'THREE-NINJA SEAL',text:'Layer vibration, Lens prediction, Object Swap, and the sealing technique.',sequence:['VIBRATION','LENS','OBJECT SWAP','SEAL'],seconds:12,onComplete:()=>this.completeRyuzankaroQuest()})}

  startQte(config){const{type,title,text,sequence,seconds,onComplete}=config;this.qteInputHeld=false;this.mode='qte';this.battle.phase='story';this.qte={active:true,type,step:0,sequence,deadline:performance.now()+seconds*1000,duration:seconds*1000,meter:1,onComplete,retry:()=>this.startQte(config)};const panel=this.root.querySelector('[data-c4-qte]');panel.hidden=false;this.root.querySelector('[data-c4-qte-title]').textContent=title;this.root.querySelector('[data-c4-qte-text]').textContent=text;this.root.querySelector('[data-c4-qte-sequence]').innerHTML=sequence.map((item,index)=>`<b data-qte-index="${index}">${item}</b>`).join('');this.root.querySelector('[data-c4-qte-action]').textContent=sequence[0];this.root.querySelector('[data-c4-qte-prompt]').textContent='KEYBOARD: SHOWN INPUTS • CONTROLLER: STICK / CONFIRM / ABILITY • TOUCH: SHOWN BUTTON';this.root.querySelector('[data-c4-qte-action]').focus()}
  updateQte(){if(!this.qte.active)return;const remaining=this.qte.deadline-performance.now(),ratio=clamp(remaining/this.qte.duration,0,1);this.root.querySelector('[data-c4-qte-meter]').style.width=`${ratio*100}%`;if(remaining<=0)this.failQte()}
  advanceQte(input){if(!this.qte.active)return;const expected=this.qte.sequence[this.qte.step];const normalized=String(input||'').toUpperCase();if(normalized!==expected){this.battle.notice(`WRONG INPUT • EXPECTED ${expected}`,1);this.qte.deadline-=900;return}this.root.querySelector(`[data-qte-index="${this.qte.step}"]`)?.classList.add('done');this.qte.step++;if(this.qte.step>=this.qte.sequence.length){const done=this.qte.onComplete;this.qte.active=false;this.root.querySelector('[data-c4-qte]').hidden=true;done?.();return}this.root.querySelector('[data-c4-qte-action]').textContent=this.qte.sequence[this.qte.step]}
  failQte(){const retry=this.qte.retry;this.qte.active=false;this.root.querySelector('[data-c4-qte]').hidden=true;this.battle.notice('QTE FAILED • RETRYING FROM THE SAFE MOMENT',1.6);setTimeout(()=>{if(this.aborted)return;retry?.()},650)}

  startRyuzankaroAerial({restored=false}={}){this.state.ryuzankaro.phase='aerial';this.state.ryuzankaro.checkpoint='aerial';this.state.location='echo-sky';this.saveState();document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'battle'}));this.switchStage('echo-sky');this.area='sky';this.startFight({kind:'ryuzankaro',id:'ryuzankaro',name:'Ryuzankaro',hpScale:2.05,xp:520,stage:'echo-sky',phase:1})}
  checkRyuzankaroPhase(){const fight=this.currentFight,foe=this.battle.fighters[1];if(!fight||fight.kind!=='ryuzankaro')return;const ratio=foe.hp/foe.maxHp;if(fight.phase===1&&ratio<=.70){fight.phase=2;this.mode='story';this.battle.phase='story';this.showDialogue([
      {speaker:'RYUZANKARO',speakerClass:'rival',text:'I know why you’re winning. You have my eye.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'The Lens of Truth is your thing? No wonder I feel like I’m gonna vomit every time I use it.',tail:'down'},
      {speaker:'RYUZANKARO',speakerClass:'rival',text:'Your body adapted to my eye. Let us see how you fight with the one that was originally yours.',tail:'down'}
    ],()=>{this.vibrationCombat=true;this.mode='fight';this.battle.phase='play';fight.phase=2;this.battle.notice('NEW MECHANIC • READ VIBRATION PULSES',1.8)})}
    else if(fight.phase===2&&ratio<=.36){fight.phase=3;this.mode='story';this.battle.phase='story';this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'I can read him on the ground. In the air, the pressure is weaker—but it’s still there.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'RRVVFO! OBJECT SWAP, NOW! I HAVE A PLAN!',tail:'down'}
    ],()=>{this.vibrationCombat=false;this.startSwapQte()})}
  }

  returnFromSky({restored=false}={}){this.state.ryuzankaro.phase='village-final';this.state.ryuzankaro.checkpoint='village-final';this.state.location='echo-village';this.saveState();this.switchStage('echo-village');this.area='village';this.mode='story';this.battle.phase='story';this.preparePlayer({x:100,z:120});this.showDialogue([
    {speaker:'WADE',speakerClass:'p2',text:'Hahaha. Scary man.',tail:'down'},
    {speaker:'RYUZANKARO',speakerClass:'rival',text:'You are irritating.',tail:'down'},
    {speaker:'BARK',speakerClass:'neutral',text:'RRVVFO! OBJECT SWAP, NOW! I HAVE A PLAN!',tail:'down'},
    {speaker:'BARK',speakerClass:'neutral',text:'That link Ryuzankaro put on you was supposed to keep you still and stunned. I’m reversing it.',tail:'down'},
    {speaker:'BARK',speakerClass:'neutral',text:'Rrvvfo, use the sealing technique now!',tail:'down'}
  ],()=>this.startFight({kind:'ryuzankaro',id:'ryuzankaro',name:'Ryuzankaro',hpScale:.72,xp:0,stage:'echo-village',phase:3,finale:true,teamBattle:true}))}

  completeRyuzankaroQuest(){const firstReward=!this.state.ryuzankaro.rewardsGranted;this.state.ryuzankaro.bossDefeated=true;this.state.ryuzankaro.phase='sealed';this.state.ryuzankaro.checkpoint='complete';this.state.rewards={lensMastery:1,vibrationSense:true,objectSwapRange:1,teamBadge:true,ryuzankaroCodex:true};masterFieldSkill('vibrationSense');this.vibrationCombat=false;if(firstReward&&!this.replayMode)addStoryXp(600,{source:'RYUZANKARO SECRET BOSS'});this.state.ryuzankaro.rewardsGranted=true;this.enterVillage({spawn:SPAWNS.village});this.showDialogue([
    {speaker:'BARK',speakerClass:'neutral',text:'We can’t climb that mountain right now.',tail:'down'},
    {speaker:'WADE',speakerClass:'p2',text:'I could.',tail:'down'},
    {speaker:'WADE',speakerClass:'p2',text:'...',tail:'down'},
    {speaker:'BARK',speakerClass:'neutral',text:'This place might still be a target. We should stay and protect it.',tail:'down'}
  ],()=>{this.mode='explore';this.battle.phase='play';this.saveState();this.updateObjective();this.toast('SECRET BOSS COMPLETE','VIBRATION SENSE UNLOCKED','Lens Mastery Lv. 1 • Object Swap targeting improved • Team badge earned')})}

  chooseMountainDeparture(){
    if(!chapter4VillageDefenseComplete(this.state)){
      this.toast('ROUTE LOCKED','DEFEND ECHO VILLAGE FIRST','The mountain gate and Old Man’s Potions remain locked until the village-defense battle is complete.');
      this.updateObjective();
      return;
    }
    if(!ryuzankaroQuestResolved(this.state)){
      this.showChoice({kicker:'OPTIONAL QUEST AVAILABLE',title:'LEAVE ECHO VILLAGE?',text:'The Old Man’s Potions and Ryuzankaro secret boss must be completed before leaving. Skipping remains permanent for this playthrough.',buttons:[{label:'START THE OLD MAN’S POTIONS',value:'quest',primary:true},{label:'LEAVE FOR THE MOUNTAIN',value:'skip'}],onChoose:value=>{if(value==='quest'){this.startOldManQuest()}else{this.state.ryuzankaro.skipped=true;this.state.ryuzankaro.checkpoint='skipped';this.completeRequired('mountainDecision');this.enterMountain()}}});return
    }
    this.completeRequired('mountainDecision');this.enterMountain();
  }

  inspectMountainSignal(id){const point=CHAPTER4_MOUNTAIN_SIGNALS.find(item=>item.id===id);if(!point)return;const lines={
    'bridge-echo':[{speaker:'RRVVFO',speakerClass:'p1',text:'The bridge is responding to footsteps. The safe stones echo back twice.',tail:'down'}],
    'hollow-relay':[{speaker:'PROJECT HOLLOW RELAY',speakerClass:'rival',text:'SUBJECT R MOVEMENT SAMPLE ACQUIRED.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'Stop calling me that.',tail:'down'}],
    'lookout-signal':[{speaker:'RRVVFO',speakerClass:'p1',text:'That signal is aimed at Shadow’s place. Somebody has been watching the lookout too.',tail:'down'}]
  }[id];this.showDialogue(lines,()=>{this.state.mountainSignals=unique([...this.state.mountainSignals,id]);this.mode='mountain';this.battle.phase='play';this.battle.burst(point.x,point.z,'#8fe8ff',24,70);if(this.state.mountainSignals.length===CHAPTER4_MOUNTAIN_SIGNALS.length){this.completeRequired('mountainSignals');this.toast('ALL SIGNALS TRACED','FIND THE HOLLOW WATCHER','The recording machine is waiting near the summit.')}this.saveState();this.updateObjective()})}

  startLookoutObjectSwap(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'That’s Shadow’s lookout? It’s floating. I can’t reach it from the mountain.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fine. I don’t need a bridge. That pebble is small enough to throw onto it.',tail:'down'}
    ],()=>{this.battle.notice('PEBBLE THROWN • TARGET ON LOOKOUT',1.1);setTimeout(()=>{if(!this.aborted)this.startLookoutSwapQte()},350)})
  }

  startLookoutSwapQte(){this.startQte({type:'lookout-swap',title:'FLOATING LOOKOUT OBJECT SWAP',text:'The pebble is on the lookout. Charge Object Swap, release, lock onto the pebble, then confirm the swap.',sequence:['CHARGE','RELEASE','LOCK','OBJECT SWAP'],seconds:12,onComplete:()=>this.completeLookoutSwap()})}

  completeLookoutSwap(){
    const player=this.battle.fighters[0];
    this.battle.burst(player.x,player.z,'#fff0c2',28,85);
    this.battle.notice('PEBBLE LANDED • OBJECT SWAP!',1.2);
    this.completeRequired('lookoutReached');
    this.enterLookout();
    this.toast('OBJECT SWAP COMPLETE','APPROACH SHADOW’S ENTRANCE','The lookout is floating free above the mountain. The pebble created the only route onto it.');
  }

  enterLookout({restored=false}={}){if(!restored){discoverAdventureMission('c4-solo-summit');completeAdventureMission('c4-solo-summit',{rank:'A',reward:'ARCHIVE • MOUNTAIN WIND'})}
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'mystery'}));
    document.dispatchEvent(new CustomEvent('pxcombatduck',{detail:{amount:.82,duration:1.25}}));
    this.area='lookout';this.state.location='shadow-lookout';this.switchStage('echo-mountain');this.mode='mountain';this.currentFight=null;this.battle.phase='play';this.battle.hideBanner();
    this.engine.setLabels({stageName:'SHADOW’S LOOKOUT',chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO','']});
    this.preparePlayer({x:930,z:-330});const player=this.battle.fighters[0];player.y=LOOKOUT_HEIGHT;player.vy=0;player.grounded=true;player.kvy=0;
    resetHubCameraLook(this.battle);this.lookoutLandingSeconds=restored?.85:LOOKOUT_LANDING_SECONDS;this.lookoutPromptCueShown=false;
    this.engine.setHotbarAvailability([],{show:false});this.showAreaTitle('SHADOW’S LOOKOUT','FLOATING SANCTUARY • NO GROUND CONNECTION');this.rebuildMap();this.saveState();this.updateObjective();
    this.battle.notice(restored?'CHECKPOINT RESTORED • SHADOW’S LOOKOUT':'NO BRIDGE • NO SUPPORT • YOU MADE IT',restored?1.1:1.45);
  }

  startShadowArrival(){
    if(chapter4NextRequired(this.state)!=='shadowArrival')return;
    this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'Shadow... it’s been a while.',tail:'down'}],()=>this.finishShadowArrival());
  }

  finishShadowArrival(){
    // Keep the arrival in memory until the fade commits the chapter. If the browser closes
    // during the ending beat, the saved entrance checkpoint replays this one-line scene instead
    // of skipping it or leaving Chapter 4 stuck between flags.
    markChapter4Required(this.state,'shadowArrival');
    this.refreshTracker();
    this.state.location='shadow-lookout';
    const player=this.battle.fighters[0];
    if(player){
      player.block=false;player.charging=false;player.stun=Math.max(Number(player.stun)||0,2.1);
      player.knockdown=Math.max(Number(player.knockdown)||0,2.1);player.grounded=true;player.y=LOOKOUT_HEIGHT;player.vy=0;player.kvy=0;
    }
    this.battle.cameraShake=Math.max(Number(this.battle.cameraShake)||0,2.2);
    document.dispatchEvent(new CustomEvent('pxcombatduck',{detail:{amount:.42,duration:1.7}}));
    const fade=this.root.querySelector('[data-c4-ending-fade]');
    this.mode='story';this.battle.phase='story';
    if(!fade){setTimeout(()=>{if(!this.aborted)this.commitCompletion()},LOOKOUT_FADE_DELAY_MS);return}
    fade.hidden=false;fade.style.opacity='0';
    // Give the collapse a quiet readable beat before black takes the frame.
    setTimeout(()=>{if(!this.aborted)fade.style.opacity='1'},LOOKOUT_FADE_DELAY_MS);
    setTimeout(()=>{if(this.aborted)return;fade.hidden=true;fade.style.opacity='0';this.commitCompletion()},LOOKOUT_COMPLETION_DELAY_MS);
  }

  startFight(config){
    if(config.stage&&this.battle.stage.id!==config.stage)this.switchStage(config.stage);
    const playerLevel=Math.max(1,Number(loadLostYearProgress().storyLevel)||1);
    const restartConfig={...config,waves:Array.isArray(config.waves)?config.waves.map(wave=>({...wave})):undefined};
    const waves=(Array.isArray(config.waves)&&config.waves.length?config.waves:[{id:config.id,name:config.name,hpScale:config.hpScale,levelOffset:config.levelOffset}]).map(wave=>({...wave}));
    this.currentFight={...config,restartConfig,waves,waveIndex:0,elapsed:0,phase:config.phase||1,returnArea:this.area};
    this.fightElapsed=0;this.lastWatcherAction='';this.watcherRepeat=0;this.patternRecorded=0;this.watcherPhase=1;
    this.watcherMemory={action:'',signature:'',patternName:'',spacing:'',approach:'',repeat:0,confidence:0,lastHitAt:0,lastInterval:0,learned:false,exposedUntil:0,variety:[],recent:[]};
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:config.kind==='watcher'?'hollow':'battle'}));
    this.mode='fight';this.battle.phase='play';this.battle.hideBanner();this.battle.ringOutEnabled=false;
    this.battle.root.classList.remove('storyChapter4Hub');this.battle.root.classList.add('storyChapter4Combat');
    const player=this.battle.fighters[0];
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(-380,60);
    void this.battle.ensureFighterAsset(player,'rrvvfo');applyStoryProgressionToFighter(player,loadLostYearProgress());player.en=80;player.guard=100;
    this.teamAllies=config.teamBattle?[{id:'bark',name:'BARK',accent:'#ad8655',x:-520,z:180,attackClock:0,hp:120,maxHp:120,down:false,role:'ANCHOR'},{id:'wade',name:'WADE',accent:'#4b9fe2',x:-500,z:-180,attackClock:.55,hp:96,maxHp:96,down:false,role:'INTERCEPTOR'}]:[];
    if(player.storyBuildPassives?.includes('hotStart'))player.en=Math.min(100,player.en+12);
    this.configureFightFoe(waves[0],playerLevel);if(config.squadMode)this.setupSquadFight(waves);else{this.squadEnemies=[];this.squadTargetIndex=0}this.battle.beginBattleRank({fighterId:'rrvvfo',opponentId:this.battle.fighters[1].id,stageId:this.battle.stage.id,mode:'story'});this.updateTeamCombatHud();this.showWaveBanner(1,waves.length,this.battle.fighters[1].name);
    this.battle.time=9999;this.engine.setHotbarAvailability([1,2,3,4,5],{show:true});
    const stageName=config.kind==='ryuzankaro'?'RYUZANKARO • BODILESS FORM':config.kind==='watcher'?'MOUNTAIN RECORDING PLATFORM':config.kind==='ingredient-swarm'?'PROJECT HOLLOW SWARM':'ECHO VILLAGE DEFENSE';
    this.engine.setLabels({stageName,chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO',this.battle.fighters[1].name.toUpperCase()]});
    this.setObjective(config.kind==='watcher'?'DEFEAT THE HOLLOW WATCHER':config.kind==='ryuzankaro'?'SURVIVE RYUZANKARO':config.kind==='ingredient-swarm'?'CLEAR THE PROJECT HOLLOW SWARM':'DEFEND ECHO VILLAGE',config.kind==='watcher'?'It records move, timing, spacing, and approach. Break the entire pattern.':config.kind==='ryuzankaro'?'Fight beside Bark and Wade, then follow the sealing plan.':config.squadMode?`${config.squadMode.toUpperCase()} • Bark anchors space, Wade intercepts threats, and Rrvvfo chooses the target.`:`Fight as a three-ninja team. Clear ${waves.length} enemy waves.`);
    this.updateWatcherHud();
    const intro=config.kind==='watcher'?'BOSS • HOLLOW WATCHER':config.kind==='ryuzankaro'?'SECRET BOSS • RYUZANKARO':config.kind==='ingredient-swarm'?'OPTIONAL TEAM BATTLE • ENEMY SWARM':'TEAM BATTLE • VILLAGE DEFENSE';
    this.battle.notice(`${intro}${config.squadMode?` • ${config.squadMode.toUpperCase()}`:waves.length>1?` • WAVE 1/${waves.length}`:''}`,2);
  }

  configureFightFoe(wave,playerLevel){
    const fight=this.currentFight,foe=this.battle.fighters[1];
    const levelOffset=Number(wave.levelOffset??(fight.kind==='ryuzankaro'?3:fight.kind==='watcher'?2:1));
    foe.id=wave.id||fight.id;foe.name=wave.name||fight.name;
    const role=chapter4EnemyRole(wave,fight.kind),archetype=wave.archetype?enemyArchetype(wave.archetype):{id:role.id,label:role.label,description:role.description,color:role.color,speed:1,attack:1,defense:1,rangeBias:0};this.currentEnemyRole={...role,label:archetype.label||role.label,description:archetype.description||role.description,color:archetype.color||role.color};fight.enemyRole=role.id;
    foe.aiArchetype=archetype.id;foe.accent=fight.kind==='ryuzankaro'?'#1e1726':(archetype.color||role.color);
    foe.cpu=true;foe.visualScale=fight.kind==='watcher'?1.25:fight.kind==='ryuzankaro'?1.18:role.id==='heavy'||role.id==='commander'?1.1:.96;
    foe.reset(380,-60);foe.asset=null;applyStoryLevelToFighter(foe,playerLevel+levelOffset);
    foe.storySpeedMultiplier=(foe.storySpeedMultiplier||1)*role.speed*archetype.speed;foe.storyAttackMultiplier=(foe.storyAttackMultiplier||1)*role.attack*archetype.attack;foe.storyDefenseMultiplier=(foe.storyDefenseMultiplier||1)/(role.defense*archetype.defense);
    foe.maxHp=Math.round(foe.maxHp*Math.max(.35,Number(wave.hpScale??fight.hpScale)||1)*role.defense);foe.hp=foe.maxHp;foe.en=90;foe.guard=role.id==='heavy'?125:role.id==='commander'?112:100;
    this.updateEnemyRoleHud();
    fight.name=foe.name;fight.id=foe.id;
    this.engine.setLabels({stageName:fight.kind==='ingredient-swarm'?'PROJECT HOLLOW SWARM':fight.kind==='village-defense'?'ECHO VILLAGE DEFENSE':fight.kind==='watcher'?'MOUNTAIN RECORDING PLATFORM':'RYUZANKARO • BODILESS FORM',chapterLabel:'RRVVFO CHAPTER 4',names:['RRVVFO',foe.name.toUpperCase()]});
  }

  advanceFightWave(){
    const fight=this.currentFight;if(!fight||this.mode!=='fight')return;
    if(fight.waveIndex+1>=fight.waves.length){this.finishFight(true);return}
    fight.waveIndex++;
    const player=this.battle.fighters[0],playerLevel=Math.max(1,Number(loadLostYearProgress().storyLevel)||1);
    player.hp=Math.min(player.maxHp,player.hp+Math.round(player.maxHp*.12));player.en=Math.min(100,player.en+18);player.guard=Math.min(100,player.guard+24);player.reset(-380,60);
    this.configureFightFoe(fight.waves[fight.waveIndex],playerLevel);
    this.supportClock=0;
    this.battle.notice(`WAVE ${fight.waveIndex+1}/${fight.waves.length} • ${fight.name.toUpperCase()}`,1.7);this.showWaveBanner(fight.waveIndex+1,fight.waves.length,fight.name);this.updateTeamCombatHud();
    this.battle.burst(380,-60,'#8fe8ff',24,70);
  }

  updateFight(dt){
    if(!this.currentFight)return;
    const fight=this.currentFight;this.fightElapsed+=dt;fight.elapsed=this.fightElapsed;if(this.waveBannerTimer>0){this.waveBannerTimer=Math.max(0,this.waveBannerTimer-dt);if(!this.waveBannerTimer)this.root.querySelector('[data-c4-wave-banner]')?.classList.remove('show')}
    if(fight.kind==='watcher'){
      const memory=this.watcherMemory,foe=this.battle.fighters[1],nextPhase=watcherPhaseForHp(foe);
      if(nextPhase!==this.watcherPhase){this.watcherPhase=nextPhase;memory.confidence=0;memory.learned=false;memory.signature='';memory.patternName='';memory.exposedUntil=0;this.battle.notice(WATCHER_PHASES[nextPhase].label,1.7);this.battle.burst(foe.x,foe.z,nextPhase===3?'#ff9f80':'#63dce3',32,85)}
      if(memory.lastHitAt&&performance.now()-memory.lastHitAt>2300){memory.confidence=clamp(memory.confidence-dt*.22,0,1);if(memory.confidence<.42)memory.learned=false}
      this.updateWatcherHud();
    }
    if(fight.teamBattle&&this.teamAllies.length){
      if(fight.squadMode)this.updateSquadFight(dt);
      else{
        const foe=this.battle.fighters[1],player=this.battle.fighters[0];
        for(const ally of this.teamAllies){
          ally.attackClock+=dt;
          const side=ally.id==='bark'?1:-1,targetX=player.x-90,targetZ=player.z+side*135;
          ally.x+=(targetX-ally.x)*Math.min(1,dt*3.2);ally.z+=(targetZ-ally.z)*Math.min(1,dt*3.2);
        }
        if(this.supportClock>1.9){
          this.supportClock=0;
          const bark=this.teamCommand==='protect'||(this.teamCommand==='focus'&&Math.floor(this.fightElapsed/1.9)%2===0),ally=this.teamAllies.find(item=>item.id===(bark?'bark':'wade'));
          if(ally){ally.x+=(foe.x-ally.x)*.42;ally.z+=(foe.z-ally.z)*.42}
          if(bark){this.battle.burst(foe.x,foe.z,'#d3a55e',22,58);foe.hp-=Math.max(2,foe.maxHp*.028);foe.stun=Math.max(foe.stun,.15);this.battle.notice('BARK • EARTH COMBO SUPPORT',.8)}
          else{this.battle.burst(foe.x,foe.z,'#67d4ff',22,62);foe.hp-=Math.max(2,foe.maxHp*.022);foe.stun=Math.max(foe.stun,.32);this.battle.notice('WADE • LIGHTNING INTERCEPT',.8)}
          if(foe.hp<=0&&fight.kind!=='ryuzankaro'){foe.hp=1;queueMicrotask(()=>this.advanceFightWave())}
        }
      }
    }
    if(fight.teamBattle)this.updateTeamCombatHud();
    if(fight.kind==='ryuzankaro'&&this.vibrationCombat&&this.supportClock>1.15){this.supportClock=0;const player=this.battle.fighters[0];this.battle.burst(player.x+(Math.random()-.5)*220,player.z+(Math.random()-.5)*180,'#d9f9ff',10,45)}
  }

  setupSquadFight(waves){
    const fight=this.currentFight,foe=this.battle.fighters[1];if(!fight)return;
    const positions=[{x:foe.x,z:foe.z},{x:245,z:210},{x:245,z:-220}];
    const firstScale=Math.max(.2,Number(waves[0]?.hpScale)||1);
    this.squadEnemies=waves.map((wave,index)=>{
      const arch=enemyArchetype(wave.archetype||'rushdown'),ratio=Math.max(.35,(Number(wave.hpScale)||1)/firstScale),maxHp=index===0?foe.maxHp:Math.round(foe.maxHp*ratio*Math.sqrt(arch.defense));
      return{index,wave:{...wave},id:wave.id||fight.id,name:wave.name||fight.name,archetype:arch.id,color:arch.color,x:positions[index]?.x??(260-index*70),z:positions[index]?.z??0,hp:maxHp,maxHp,down:false,attackClock:.35+index*.42,supportCooldown:1.6+index*.35,supportCast:0,supportCastHp:maxHp,supportTargetIndex:-1};
    });
    this.squadTargetIndex=0;fight.squadEnemies=this.squadEnemies;fight.activeEnemyIndex=0;discoverAdventureMission('c4-squad-control');this.showWaveBanner(1,waves.length,`${fight.squadMode.toUpperCase()} • ALL ENEMIES ACTIVE`);this.updateTeamCombatHud();
  }

  squadAliveEnemies(){return this.squadEnemies.filter(enemy=>!enemy.down&&enemy.hp>0)}

  cycleSquadTarget(){
    const fight=this.currentFight;if(!fight?.squadMode||this.squadEnemies.length<2)return false;
    const foe=this.battle.fighters[1],current=this.squadEnemies[this.squadTargetIndex];if(current&&!current.down){current.hp=Math.max(1,foe.hp);current.x=foe.x;current.z=foe.z}
    for(let step=1;step<=this.squadEnemies.length;step++){
      const index=(this.squadTargetIndex+step)%this.squadEnemies.length,target=this.squadEnemies[index];if(target.down||target.hp<=0)continue;
      this.squadTargetIndex=index;fight.activeEnemyIndex=index;const level=Math.max(1,Number(loadLostYearProgress().storyLevel)||1);this.configureFightFoe(target.wave,level);foe.hp=Math.min(foe.maxHp,target.hp);foe.x=target.x;foe.z=target.z;this.battle.notice(`TARGET • ${target.name.toUpperCase()} • ${enemyArchetype(target.archetype).label}`,1.15);this.updateTeamCombatHud();return true;
    }
    return false;
  }

  advanceSquadEnemy(){
    const fight=this.currentFight;if(!fight?.squadMode||this.mode!=='fight')return;
    const defeated=this.squadEnemies[this.squadTargetIndex];if(defeated){defeated.hp=0;defeated.down=true;this.battle.burst(this.battle.fighters[1].x,this.battle.fighters[1].z,defeated.color||'#8fe8ff',26,70)}
    const living=this.squadAliveEnemies();if(!living.length){this.finishFight(true);return}
    const next=living[0],index=this.squadEnemies.indexOf(next);this.squadTargetIndex=index;fight.activeEnemyIndex=index;const level=Math.max(1,Number(loadLostYearProgress().storyLevel)||1);this.configureFightFoe(next.wave,level);const foe=this.battle.fighters[1];foe.hp=Math.min(foe.maxHp,next.hp);foe.x=next.x;foe.z=next.z;this.battle.notice(`ENEMY DOWN • ${living.length} REMAIN • TARGET ${next.name.toUpperCase()}`,1.45);this.updateTeamCombatHud();
  }

  updateSquadFight(dt){
    const fight=this.currentFight,player=this.battle.fighters[0],foe=this.battle.fighters[1];if(!fight?.squadMode)return;
    const active=this.squadEnemies[this.squadTargetIndex];if(active){active.hp=Math.max(0,foe.hp);active.x=foe.x;active.z=foe.z}
    // Support healing is always telegraphed. The cast can be interrupted by knocking the Support down before the pulse resolves.
    for(const support of this.squadEnemies){
      if(support.down||support.hp<=0||support.archetype!=='support')continue;
      support.supportCooldown=Math.max(0,(Number(support.supportCooldown)||0)-dt);
      if(support.supportCast>0){
        if(support.hp<Number(support.supportCastHp||support.maxHp)){
          support.supportCast=0;support.supportCooldown=2.2;support.supportTargetIndex=-1;support.supportCastHp=support.hp;
          this.battle.burst(support.x,support.z,'#f7ffd0',18,58);this.battle.notice(`SUPPORT INTERRUPTED • ${support.name.toUpperCase()}`,.9);
          continue;
        }
        support.supportCast=Math.max(0,support.supportCast-dt);
        if(support.supportCast===0){
          const heal=this.squadEnemies[support.supportTargetIndex];
          if(heal&&!heal.down&&heal.hp>0&&support.hp>0){heal.hp=Math.min(heal.maxHp,heal.hp+10);if(heal.index===this.squadTargetIndex)foe.hp=Math.min(foe.maxHp,foe.hp+10);this.battle.burst(heal.x,heal.z,'#87e6a0',24,64);this.battle.notice(`SUPPORT HEAL • ${heal.name.toUpperCase()} +10 HP`,.9)}
          support.supportCooldown=4.2;support.supportTargetIndex=-1;support.supportCastHp=support.hp;
        }
      }else if(support.supportCooldown<=0){
        const heal=this.squadAliveEnemies().filter(item=>item!==support&&item.hp<item.maxHp*.88).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
        if(heal){support.supportTargetIndex=heal.index;support.supportCast=.9;support.supportCastHp=support.hp;this.battle.notice(`✚ SUPPORT CASTING • INTERRUPT ${support.name.toUpperCase()}`,1.0)}else support.supportCooldown=1.2;
      }
    }
    // Bark anchors dangerous bodies; Wade hunts ranged/support targets. Both can be knocked out.
    for(const ally of this.teamAllies){
      if(ally.down||ally.hp<=0){ally.down=true;continue}
      ally.attackClock+=dt;
      const candidates=this.squadAliveEnemies().filter(enemy=>enemy.index!==this.squadTargetIndex);
      const priority=ally.id==='bark'?['heavy','guard','support']:['ranged','support','trickster','rushdown'];
      const target=candidates.sort((a,b)=>priority.indexOf(a.archetype)-priority.indexOf(b.archetype))[0]||active;
      if(!target)continue;
      const follow=this.teamCommand==='protect'?player:this.teamCommand==='interrupt'?target:null;
      const targetX=follow?.x??(player.x+(ally.id==='bark'?-100:-70)),targetZ=follow?.z??(player.z+(ally.id==='bark'?145:-145));
      ally.x+=(targetX-ally.x)*Math.min(1,dt*(ally.id==='wade'?4.8:3.0));ally.z+=(targetZ-ally.z)*Math.min(1,dt*(ally.id==='wade'?4.8:3.0));
      const interval=ally.id==='wade'?1.05:1.55;if(ally.attackClock>=interval&&target){ally.attackClock=0;const damage=ally.id==='wade'?6:9;target.hp=Math.max(0,target.hp-damage);this.battle.burst(target.x,target.z,ally.accent,ally.id==='wade'?16:20,58);if(target.index===this.squadTargetIndex){foe.hp=Math.max(1,target.hp);foe.stun=Math.max(foe.stun,ally.id==='wade'?.18:.12)}if(target.hp<=0&&!target.down){target.down=true;if(target.index===this.squadTargetIndex){foe.hp=1;queueMicrotask(()=>this.advanceSquadEnemy())}else this.battle.notice(`${ally.name} • ${target.name.toUpperCase()} DOWN`,.85)}}
    }
    // Non-target enemy bodies stay active: they pressure Rrvvfo or his teammates instead of waiting in waves.
    for(const enemy of this.squadEnemies){
      if(enemy.down||enemy.hp<=0||enemy.index===this.squadTargetIndex)continue;enemy.attackClock+=dt;
      const arch=enemyArchetype(enemy.archetype),livingAllies=this.teamAllies.filter(ally=>!ally.down&&ally.hp>0);const preferPlayer=this.teamCommand==='protect'||!livingAllies.length||((enemy.index+Math.floor(this.fightElapsed*2))%3===0);const target=preferPlayer?player:livingAllies[enemy.index%livingAllies.length];
      const dx=(target.x||0)-enemy.x,dz=(target.z||0)-enemy.z,d=Math.max(1,Math.hypot(dx,dz)),desired=arch.rangeBias>.7?240:arch.id==='heavy'?72:105,move=(d-desired)*dt*arch.speed*.7;enemy.x+=dx/d*move;enemy.z+=dz/d*move;
      const interval=arch.id==='rushdown'?1.15:arch.id==='heavy'?1.9:arch.id==='support'?2.1:1.45;if(enemy.attackClock<interval||d>Math.max(desired+80,190))continue;enemy.attackClock=0;
      const damage=Math.max(2,Math.round((arch.id==='heavy'?9:arch.id==='rushdown'?6:5)*arch.attack));this.battle.burst(target.x,target.z,arch.color,13,54);
      if(target===player){player.hp=Math.max(0,player.hp-damage);player.stun=Math.max(player.stun,.08);if(player.hp<=0){player.hp=1;queueMicrotask(()=>this.finishFight(false));return}}
      else{target.hp=Math.max(0,target.hp-damage);if(target.hp<=0&&!target.down){target.down=true;this.battle.notice(`${target.name} IS DOWN • SQUAD PRESSURE INCREASED`,1.1)}}
    }
  }

  showWaveBanner(index,total,name){const node=this.root?.querySelector('[data-c4-wave-banner]');if(!node)return;node.textContent=`WAVE ${index}/${total} • ${String(name||'ENEMY').toUpperCase()}`;node.classList.add('show');this.waveBannerTimer=1.65}

  updateEnemyRoleHud(){const panel=this.root?.querySelector('[data-c4-enemy-role]'),role=this.currentEnemyRole,active=this.mode==='fight'&&Boolean(role);if(!panel)return;panel.hidden=!active;if(!active){const touchTarget=document.getElementById('touchInteract');if(touchTarget){touchTarget.textContent='INTERACT';touchTarget.classList.remove('target-cycle');if(!['explore','cavern','mountain'].includes(this.mode))touchTarget.classList.remove('storyVisible')}return;}panel.style.setProperty('--role-color',role.color);const icon=this.root.querySelector('[data-c4-enemy-role-icon]');if(icon)icon.textContent=enemyArchetypeIcon(role.id);this.root.querySelector('[data-c4-enemy-role-name]').textContent=role.label;this.root.querySelector('[data-c4-enemy-role-detail]').textContent=role.description}

  updateTeamCombatHud(){const panel=this.root?.querySelector('[data-c4-team-status]'),active=this.mode==='fight'&&this.teamAllies.length>0;if(!panel)return;panel.hidden=!active;if(!active)return;for(const ally of this.teamAllies){const node=panel.querySelector(`[data-ally="${ally.id}"]`);if(node)node.textContent=this.currentFight?.squadMode?`${ally.name} • ${ally.down?'DOWN':`${Math.ceil(ally.hp)}/${ally.maxHp} HP`} • ${ally.role}`:`${ally.name} • ${Math.max(0,1.9-this.supportClock).toFixed(1)}s • ${this.teamCommand.toUpperCase()}`}const label=panel.querySelector('[data-c4-squad-label]');if(label)label.textContent=this.currentFight?.squadMode?`${this.currentFight.squadMode.toUpperCase()} • ${this.teamCommand.toUpperCase()}`:'TEAM SUPPORT';const enemies=panel.querySelector('[data-c4-squad-enemies]');if(enemies)enemies.textContent=this.currentFight?.squadMode?`ENEMIES • ${this.squadAliveEnemies().length} STANDING • ${this.engine.prompt('interact','E')} / TAB • CYCLE TARGET`:'C • CHANGE TEAM COMMAND';panel.title=this.currentFight?.squadMode?'Interact/Tab cycles living enemies • C changes team command':'Press C during team battles: Focus → Protect → Interrupt';const touchTarget=document.getElementById('touchInteract');if(touchTarget){const squad=Boolean(this.currentFight?.squadMode);touchTarget.textContent=squad?'TARGET':'INTERACT';touchTarget.classList.toggle('storyVisible',squad);touchTarget.classList.toggle('target-cycle',squad)}}

  updateWatcherHud(){
    const panel=this.root?.querySelector('[data-c4-watcher-scan]');if(!panel)return;
    const active=this.mode==='fight'&&this.currentFight?.kind==='watcher';panel.hidden=!active;if(!active)return;
    const memory=this.watcherMemory,phase=this.watcherPhase||1,percent=Math.round(memory.confidence*100),exposed=performance.now()<memory.exposedUntil;
    panel.classList.toggle('adapted',memory.learned);panel.classList.toggle('exposed',exposed);panel.dataset.phase=String(phase);
    const state=exposed?'EXPOSED • PUNISH NOW':memory.learned?`ADAPTED • ${memory.patternName}`:memory.confidence>=.38?`SCANNING • ${memory.patternName}`:WATCHER_PHASES[phase].label;
    this.root.querySelector('[data-c4-watcher-state]').textContent=state;
    this.root.querySelector('[data-c4-watcher-detail]').textContent=exposed?'The learned pattern was broken. Damage is increased briefly.':memory.patternName?`${percent}% confidence • ${WATCHER_PHASES[phase].detail}`:WATCHER_PHASES[phase].detail;
    this.root.querySelector('[data-c4-watcher-meter]').style.width=`${exposed?100:percent}%`;
  }

  finishFight(won){
    const fight=this.currentFight;if(!fight||this.mode!=='fight')return;
    this.battle.finalizeBattleRank({won,scoreFor:won?1:0,scoreAgainst:won?0:1,label:fight.kind==='watcher'?'BOSS FIGHT RANK':fight.kind==='ryuzankaro'?'SECRET BOSS RANK':'FIGHT RANK',showToast:true});
    this.mode='story';this.battle.phase='story';
    if(!won){
      const losses=(this.fightLosses[fight.kind]||0)+1;this.fightLosses[fight.kind]=losses;
      this.showChoice({kicker:'ENCOUNTER LOST',title:`${fight.name.toUpperCase()} WINS`,text:losses>=2?'Retry with Story Assist for a small damage and defense advantage.':'Retry from the encounter checkpoint.',buttons:[{label:'RETRY',value:'retry',primary:true},...(losses>=2?[{label:'RETRY WITH STORY ASSIST',value:'assist'}]:[]),{label:'RETURN TO AREA',value:'leave'}],onChoose:value=>{
        if(value==='leave'){
          this.currentFight=null;this.teamAllies=[];this.squadEnemies=[];this.squadTargetIndex=0;this.currentEnemyRole=null;this.updateWatcherHud();this.updateEnemyRoleHud();this.updateTeamCombatHud();this.engine.setHotbarAvailability([],{show:false});
          if(fight.kind==='watcher')this.enterMountain({restored:true});else if(fight.returnArea==='cavern')this.enterCaverns({restored:true});else this.enterVillage({spawn:SPAWNS.village});
        }else{
          this.startFight({...fight.restartConfig});
          if(value==='assist'){this.battle.fighters[0].storyAttackMultiplier*=1.15;this.battle.fighters[0].storyDefenseMultiplier*=.88}
        }
      }});return;
    }
    this.fightLosses[fight.kind]=0;if(!this.replayMode&&fight.xp)addStoryXp(fight.xp,{source:`${fight.name.toUpperCase()} DEFEATED`});
    fight.squadPerfect=Boolean(fight.squadMode&&this.teamAllies.length&&this.teamAllies.every(ally=>!ally.down&&ally.hp>0));if(fight.kind==='village-defense'&&fight.squadPerfect&&!this.replayMode)completeAdventureMission('c4-squad-control',{rank:'A',reward:'TITLE • TEAM CAPTAIN'});
    this.currentFight=null;this.teamAllies=[];this.squadEnemies=[];this.squadTargetIndex=0;this.currentEnemyRole=null;this.updateWatcherHud();this.updateEnemyRoleHud();this.updateTeamCombatHud();this.engine.setHotbarAvailability([],{show:false});
    if(fight.kind==='ingredient-swarm'){
      this.state.ryuzankaro.swarmsCleared=unique([...this.state.ryuzankaro.swarmsCleared,fight.ingredientReward]);
      this.completeIngredientPickup(fight.ingredientReward);return;
    }
    if(fight.kind==='village-defense'){
      this.unlockRyuzankaroAfterVillageDefense();this.enterVillage({spawn:SPAWNS.village});this.beginVillageAftermath('village-defense',9);
      this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:'Those grunts were not passing through. Echo Village is one of their targets.',tail:'down'},{speaker:'WADE',speakerClass:'p2',text:'We were fighting for days to reach you. I vote we sit down for at least one minute.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'The Sage might still be trapped under that arena.',tail:'down'},{speaker:'BARK',speakerClass:'neutral',text:'Then we protect this village while you follow the mountain signal. Rushing all three of us forward leaves both places exposed.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'Fine. One minute. Then I’m moving.',tail:'down'}],()=>{this.mode='explore';this.battle.phase='play';this.updateObjective();this.toast('OPTIONAL QUEST UNLOCKED','THE OLD MAN’S POTIONS','Complete it before leaving, or continue to the mountain gate.')});return;
    }
    if(fight.kind==='ryuzankaro'){if(fight.finale){this.state.ryuzankaro.checkpoint='seal';this.saveState();this.startSealQte();return}return}
    if(fight.kind==='watcher'){
      this.state.hollowWatcher.defeated=true;this.completeRequired('hollowWatcherDefeated');this.enterMountain({restored:true});
      this.showDialogue([{speaker:'HOLLOW WATCHER',speakerClass:'rival',text:'PROJECT HOLLOW — COMBAT DATA TRANSMITTED.',tail:'down'},{speaker:'RRVVFO',speakerClass:'p1',text:'It copied my attacks. It still couldn’t copy why I changed them.',tail:'down'}],()=>{this.mode='mountain';this.battle.phase='play';this.updateObjective();this.toast('DATA TRANSMITTED','REACH THE MOUNTAIN SUMMIT','Shadow’s lookout is floating above the peak. Find a way onto it.')});return;
    }
  }

  useVibrationSense(){if(!this.state.rewards.vibrationSense)return false;if(this.vibrationCooldown>0){this.battle.notice(`VIBRATION SENSE • ${this.vibrationCooldown.toFixed(1)}s`,.9);return false}this.vibrationPulse=2.2;this.vibrationCooldown=5.5;this.battle.burst(this.battle.fighters[0].x,this.battle.fighters[0].z,'#d9f9ff',32,120);this.battle.notice('VIBRATION SENSE • HIDDEN MOVEMENT REVEALED',1.2);return true}

  drawChapterWorld(){if(!this.battle?.renderer||this.aborted)return;const r=this.battle.renderer,time=performance.now()/1000;if(this.area==='village')this.drawVillage(r,time);else if(this.area==='cavern')this.drawCaverns(r,time);else if(this.area==='mountain'||this.area==='lookout')this.drawMountain(r,time);else if(this.area==='sky')this.drawSky(r,time);if(this.mode==='fight'&&this.currentEnemyRole){const foe=this.battle.fighters[1],pulse=1+Math.sin(time*6)*.08;r.disc({x:foe.x,y:6,z:foe.z,rx:48*pulse,rz:32*pulse,color:this.currentEnemyRole.color,alpha:.16});if(this.currentFight?.kind==='watcher'){const memory=this.watcherMemory,exposed=performance.now()<memory.exposedUntil,color=exposed?'#fff0a8':memory.learned?'#63dce3':this.watcherPhase===3?'#ff9f80':'#8fe8ff';r.disc({x:foe.x,y:8,z:foe.z,rx:(72+this.watcherPhase*8)*pulse,rz:(48+this.watcherPhase*5)*pulse,color,alpha:exposed?.34:memory.learned?.28:.12});for(let i=0;i<this.watcherPhase;i++){const a=time*(.8+i*.2)+i*2.1;r.billboard({x:foe.x+Math.cos(a)*(66+i*12),y:78+i*20,z:foe.z+Math.sin(a)*(46+i*8),size:18+i*3,color,alpha:.45})}}}if(this.mode==='fight'&&this.teamAllies.length){this.drawTeamAllies(r,time);if(this.currentFight?.squadMode)this.drawSquadEnemies(r,time)}if(['explore','cavern','mountain'].includes(this.mode))for(const item of this.availableInteractions())this.drawMarker(r,item,time)}
  drawVillage(r,time){
    const pacingColor=this.pacing.phase==='aftermath'?'#8fe8ff':this.pacing.phase==='crisis'?'#ff745d':'#d9bd72';r.billboard({x:-350,y:310,z:540,size:24+Math.sin(time*2)*2,color:pacingColor,alpha:.24});
    // Ancient, low-tech settlement: hand-cut stone, timber, ropes, bells, water, and resonance craft.
    const homes=[[-520,210,0],[-280,360,1],[10,210,2],[300,380,3],[610,200,4],[-120,-330,5],[230,-410,6],[560,-300,7]];
    for(const [x,z,i] of homes){
      r.cylinder({x,y:42,z,rx:54,sy:84,color:i%2?'#8a806b':'#756f61'});
      r.box({x,y:88,z,sx:122,sy:94,sz:106,color:i%2?'#72553c':'#664b36'});
      r.gableRoof({x,y:158,z,sx:164,sy:62,sz:148,color:i%2?'#4f382d':'#3f3430'});
      r.segment({x:x-44,y:92,z:z-58},{x:x+44,y:92,z:z-58},{width:7,height:7,color:'#b89258'});
      r.billboard({x,y:113,z:z-58,size:17,color:'#ffd88a',alpha:.34+Math.sin(time*2+i)*.06});
    }
    const defended=chapter4VillageDefenseComplete(this.state),beaconOnline=this.state.requiredCompleted.includes('beaconRestored'),liftReady=this.state.liftParts.length===CHAPTER4_LIFT_PARTS.length;
    const villagers=defended?[[-620,80],[-300,40],[40,90],[380,30],[680,80]]:[[-500,140],[-120,-40],[380,110]];
    for(const [i,[x,z]] of villagers.entries()){const cheer=defended?Math.max(0,Math.sin(time*3+i)):0,bob=Math.sin(time*2+i)*2;r.cylinder({x,y:45+bob+cheer*6,z,rx:14,sy:62,color:i%2?'#65958a':'#9a7152',alpha:.88});r.cylinder({x,y:83+bob+cheer*6,z,rx:12,sy:22,color:'#9a6849',alpha:.9});if(defended)r.segment({x:x-15,y:62,z},{x:x-24,y:88+cheer*18,z},{width:5,height:5,color:'#e7c58a'})}
    if(defended)for(const x of [-650,-250,150,550]){r.segment({x,y:90,z:-170},{x,y:195,z:-170},{width:5,height:5,color:'#b99b65'});r.box({x:x+38,y:168,z:-170,sx:76,sy:30,sz:7,color:x%400?'#8fe8ff':'#ffd85d',alpha:.82})}
    if(beaconOnline)for(let i=0;i<7;i++){const a=time*.35+i/7*Math.PI*2;r.billboard({x:-350+Math.cos(a)*105,y:210+Math.sin(time*2+i)*12,z:540+Math.sin(a)*88,size:16,color:'#8fe8ff',alpha:.5})}
    if(liftReady){r.box({x:1260,y:112,z:-430,sx:184,sy:18,sz:144,color:'#9b7b4f'});r.billboard({x:1260,y:190,z:-430,size:34,color:'#ffd85d',alpha:.55+Math.sin(time*2)*.08})}
    if(defended){const rest=VILLAGE_POINTS.recovery,ready=!this.state.teamRestSeen;r.box({x:rest.x-46,y:10,z:rest.z,sx:72,sy:8,sz:112,color:'#6e7f5a'});r.box({x:rest.x+46,y:10,z:rest.z,sx:72,sy:8,sz:112,color:'#9b6f4d'});r.billboard({x:rest.x,y:92,z:rest.z,size:ready?30:20,color:'#8fe8ff',alpha:(ready?.58:.24)+Math.sin(time*2.2)*.05});r.segment({x:rest.x,y:18,z:rest.z-62},{x:rest.x,y:82,z:rest.z-62},{width:5,height:5,color:'#7a5534'});r.billboard({x:rest.x,y:92,z:rest.z-62,size:16,color:'#ffd88a',alpha:.48})}
    if(this.state.variety.fieldRouteComplete){const x=VILLAGE_POINTS.partyRoute.x,z=VILLAGE_POINTS.partyRoute.z;r.box({x,y:18,z,sx:260,sy:28,sz:150,color:'#8c795b'});for(const dx of [-90,0,90])r.cylinder({x:x+dx,y:58,z,rx:15,sy:105,color:'#b48b58'});r.segment({x:x-105,y:110,z},{x:x+105,y:110,z},{width:12,height:12,color:'#65caff'});r.billboard({x,y:150,z,size:28,color:'#b8ecff',alpha:.48+Math.sin(time*2.4)*.06})}
    if(this.state.charm?.echoChimesComplete)for(let i=0;i<5;i++){const x=-120+i*40;r.disc({x,y:145+Math.sin(time*3+i)*9,z:520,rx:17,rz:7,color:'#8fe8ff',alpha:.68})}

    // Water channels and stepping bridges.
    r.segment({x:-760,y:7,z:30},{x:760,y:7,z:30},{width:42,height:5,color:'#4f9fb0',alpha:.55});
    for(let i=0;i<9;i++)r.box({x:-650+i*165,y:12,z:30,sx:72,sy:10,sz:58,color:'#9a8f76'});
    // Rope bridge and balconies.
    for(let i=0;i<7;i++){const x=-350+i*95;r.box({x,y:66+Math.sin(i*.8)*6,z:-110,sx:76,sy:8,sz:54,color:'#7a5534'});if(i<6){r.segment({x,y:95,z:-138},{x:x+95,y:95,z:-138},{width:4,height:4,color:'#c5a76c'});r.segment({x,y:95,z:-82},{x:x+95,y:95,z:-82},{width:4,height:4,color:'#c5a76c'})}}
    // Echo beacon: carved stone circle with hanging resonance plates.
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=-350+Math.cos(a)*175,z=540+Math.sin(a)*150;r.cylinder({x,y:82,z,rx:17,sy:164,color:'#746e60'});r.segment({x,y:166,z},{x:-350,y:196,z:540},{width:4,height:4,color:'#ad9360'});r.disc({x,y:171,z,rx:22,rz:8,color:'#d9bd72',alpha:.72})}
    r.cylinder({x:-350,y:122,z:540,rx:62,sy:244,color:'#4f5d59'});r.billboard({x:-350,y:256,z:540,size:78+Math.sin(time*3)*6,color:'#8fe8ff',alpha:.25});
    // Old pulley lift, visibly non-electric.
    for(const x of [1200,1320])r.segment({x,y:40,z:-520},{x,y:360,z:-520},{width:28,height:28,color:'#62472f'});
    r.segment({x:1180,y:340,z:-520},{x:1340,y:340,z:-520},{width:24,height:24,color:'#62472f'});
    r.cylinder({x:1260,y:340,z:-520,rx:48,rz:16,sy:22,color:'#9d7b49'});
    r.segment({x:1260,y:330,z:-520},{x:1260,y:105,z:-430},{width:5,height:5,color:'#d1bb82'});
    r.box({x:1260,y:78,z:-430,sx:190,sy:20,sz:150,color:'#6c5137'});
    // Potion house, herb racks, market cloth, recovery mats.
    r.box({x:260,y:74,z:610,sx:270,sy:145,sz:205,color:'#755b42'});r.gableRoof({x:260,y:172,z:610,sx:335,sy:70,sz:268,color:'#46343a'});
    for(let i=0;i<5;i++){r.segment({x:145+i*55,y:58,z:492},{x:145+i*55,y:128,z:492},{width:5,height:5,color:'#5d472f'});r.billboard({x:145+i*55,y:105,z:487,size:18,color:i%2?'#9fd58a':'#d7b56e',alpha:.42})}
    for(let i=0;i<4;i++){r.box({x:-40+i*75,y:8,z:150,sx:58,sy:6,sz:98,color:i%2?'#9b6f4d':'#6e7f5a'});r.gableRoof({x:-40+i*75,y:105,z:150,sx:82,sy:25,sz:115,color:i%2?'#b36b55':'#5d7f71',alpha:.82})}
    // Wind chimes and bells make the village react to the region's wind.
    for(let i=0;i<10;i++){const x=-700+i*150,z=i%2?700:-650;r.segment({x,y:80,z},{x,y:160,z},{width:5,height:5,color:'#6a4d34'});r.cone({x,y:171+Math.sin(time*2+i)*4,z,rx:18,sy:28,color:'#c6a65b'});r.segment({x,y:175,z},{x,y:205,z},{width:2,height:2,color:'#e1cf9a'})}
    // Project Hollow hardware deliberately clashes with the old settlement.
    if(!this.state.villageDefenseComplete){for(const [x,z,i] of [[-620,-430,0],[720,-470,1],[920,410,2]]){r.box({x,y:48,z,sx:88,sy:96,sz:70,color:'#252d39'});r.segment({x,y:95,z},{x:x+110,y:18,z:z+70},{width:9,height:9,color:'#1c222c'});r.billboard({x,y:112,z,size:28,color:'#63dce3',alpha:.38+Math.sin(time*5+i)*.08})}}
    // Companion and old-man silhouettes.
    if(this.state.requiredCompleted.includes('barkWadeArrive')){const exhausted=this.state.ryuzankaro.bossDefeated;this.drawCompanion(r,exhausted?90:-20,exhausted?170:50,'#ad8655','B',exhausted);this.drawCompanion(r,exhausted?220:80,exhausted?180:-20,'#4b9fe2','W',exhausted)}
    if(ryuzankaroQuestAvailable(this.state)&&!ryuzankaroQuestResolved(this.state))this.drawOldMan(r,260,610);
    for(let i=0;i<16;i++){const x=((time*(18+i%4*4)+i*210)%3200)-1600,z=-820+(i%6)*290;r.billboard({x,y:72,z,size:5,color:'#ffe0a8',alpha:.10})}
  }
  drawTeamAllies(r,time){
    for(const ally of this.teamAllies){
      const down=ally.down||ally.hp<=0,bob=down?0:Math.sin(time*7+(ally.id==='bark'?0:1.8))*3,bodyY=down?22:58+bob,bodyHeight=down?34:92;
      r.disc({x:ally.x,y:5,z:ally.z,rx:34,rz:24,color:ally.accent,alpha:down?.08:.18});
      r.cylinder({x:ally.x,y:bodyY,z:ally.z,rx:18,sy:bodyHeight,color:ally.accent,alpha:down?.52:1});
      r.cylinder({x:ally.x+(down?24:0),y:down?25:121+bob,z:ally.z,rx:15,sy:28,color:ally.id==='wade'?'#e6c393':'#8a6752',alpha:down?.55:1});
      if(!down){r.segment({x:ally.x-12,y:28+bob,z:ally.z},{x:ally.x-18,y:3,z:ally.z+8},{width:7,height:7,color:'#252834'});r.segment({x:ally.x+12,y:28+bob,z:ally.z},{x:ally.x+18,y:3,z:ally.z-8},{width:7,height:7,color:'#252834'})}
      r.billboard({x:ally.x,y:down?72:168+bob,z:ally.z,size:18,color:down?'#8a8f99':ally.accent,alpha:down?.42:.72});
    }
  }

  drawSquadEnemies(r,time){
    for(const enemy of this.squadEnemies){
      if(enemy.index===this.squadTargetIndex||enemy.down||enemy.hp<=0)continue;
      const arch=enemyArchetype(enemy.archetype),shape=enemyArchetypeShape(enemy.archetype),pulse=1+Math.sin(time*5+enemy.index)*.06;
      r.disc({x:enemy.x,y:5,z:enemy.z,rx:36*shape.width*pulse,rz:25*pulse,color:arch.color,alpha:.20});
      r.cylinder({x:enemy.x,y:60,z:enemy.z,rx:20*shape.width,sy:98*shape.height,color:'#303845'});
      r.cylinder({x:enemy.x,y:125*shape.height,z:enemy.z,rx:15*shape.head,sy:28*shape.head,color:'#727987'});
      r.billboard({x:enemy.x,y:170*shape.height,z:enemy.z,size:19,color:arch.color,alpha:.82});
      if(enemy.supportCast>0){const castPulse=1+Math.sin(time*15)*.16;r.disc({x:enemy.x,y:8,z:enemy.z,rx:64*castPulse,rz:46*castPulse,color:'#87e6a0',alpha:.34});r.billboard({x:enemy.x,y:205,z:enemy.z,size:34*castPulse,color:'#b9ffc8',alpha:.82})}
      const ratio=Math.max(0,enemy.hp/enemy.maxHp);r.segment({x:enemy.x-38,y:188,z:enemy.z},{x:enemy.x-38+76*ratio,y:188,z:enemy.z},{width:5,height:5,color:arch.color,alpha:.9});
    }
  }

  drawCompanion(r,x,z,color,label,seated=false){r.cylinder({x,y:seated?34:58,z,rx:17,sy:seated?58:92,color});r.cylinder({x,y:seated?77:120,z,rx:15,sy:26,color:'#8a6752'});r.billboard({x,y:seated?112:158,z,size:22,color:'#fff',alpha:.18})}
  drawOldMan(r,x,z){r.cylinder({x,y:58,z,rx:18,sy:100,color:'#6c5d74'});r.cylinder({x,y:122,z,rx:16,sy:28,color:'#9b765f'});r.cone({x,y:153,z,rx:30,sy:36,color:'#353044'})}
  drawCaverns(r,time){for(let i=0;i<18;i++){const x=-1120+i*132,z=i%2?-610:610;r.cone({x,y:80+(i%3)*18,z,rx:70+(i%2)*18,sy:160+(i%3)*36,color:i%2?'#29383d':'#33464a'});if(i%3===0)r.billboard({x,y:150,z,size:20,color:'#83e4ef',alpha:.18+Math.sin(time*2+i)*.05})}for(const door of CHAPTER4_CAVERN_DOORS){if(this.state.cavernDoors.includes(door.id))continue;r.box({x:door.x,y:110,z:door.z,sx:70,sy:220,sz:260,color:door.element==='FIRE'?'#5a302d':door.element==='EARTH'?'#4f5146':'#2b4f68'});r.billboard({x:door.x,y:155,z:door.z,size:50,color:door.element==='FIRE'?'#ff7654':door.element==='EARTH'?'#d0a05e':'#68d2ff',alpha:.24})}}
  drawMountain(r,time){for(let i=0;i<8;i++){const x=-1200+i*340,z=i%2?-640:640;r.cone({x,y:210+(i%3)*65,z,rx:250+(i%2)*60,rz:150,sy:420+(i%3)*130,color:i%2?'#46544f':'#3d4a48',alpha:.55})}for(let i=0;i<24;i++){const x=((time*(55+i%4*9)+i*160)%3000)-1500,z=-700+(i%7)*230;r.billboard({x,y:100+(i%3)*40,z,size:8,color:'#e4f5ff',alpha:.18})}
    // Highlighted summit pebble is the physical Object Swap target after the Watcher falls.
    if(this.state.hollowWatcher.defeated&&!this.state.requiredCompleted.includes('lookoutReached')){r.disc({x:1010,y:10,z:-250,rx:52,rz:40,color:'#fff0a8',alpha:.20+Math.sin(time*4)*.06});r.box({x:1010,y:18,z:-250,sx:24,sy:18,sz:20,color:'#d8cba8'});r.billboard({x:1010,y:90,z:-250,size:24,color:'#fff5c7',alpha:.72})}
    // Shadow's lookout floats far above the summit. It has no climbable support.
    r.cone({x:1120,y:390,z:-330,rx:190,rz:150,sy:170,color:'#30383d',alpha:.94});
    r.disc({x:1120,y:470,z:-330,rx:225,rz:185,color:'#56636a',alpha:.96});
    r.box({x:1120,y:545,z:-330,sx:245,sy:130,sz:220,color:'#5b6d7c'});
    r.gableRoof({x:1120,y:635,z:-330,sx:330,sy:70,sz:300,color:'#b8dff0',alpha:.72});
    for(let i=0;i<5;i++){const a=i/5*Math.PI*2;r.billboard({x:1120+Math.cos(a)*260,y:430+Math.sin(time*1.4+i)*18,z:-330+Math.sin(a)*205,size:120,color:'#eef8ff',alpha:.10})}
    if(this.area==='lookout'){
      // Height and wind remain visible after landing so the sanctuary never reads as a flat room.
      for(let i=0;i<7;i++){
        const drift=((time*(28+i*3)+i*190)%1500)-750;
        r.billboard({x:1120+drift,y:335+(i%3)*24,z:-330+((i%4)-1.5)*170,size:150+(i%2)*55,color:'#f2fbff',alpha:.055});
      }
      for(let i=0;i<4;i++){
        const z=-470+i*92,offset=Math.sin(time*2.1+i)*18;
        r.segment({x:935+offset,y:530+i*6,z},{x:1015+offset,y:538+i*6,z:z+18},{width:3,height:3,color:'#dff7ff',alpha:.22});
      }
      r.disc({x:1120,y:LOOKOUT_HEIGHT+3,z:-330,rx:205,rz:165,color:'#d9f5ff',alpha:.045+Math.sin(time*1.7)*.012});
    }
    if(this.area==='lookout'&&!this.state.requiredCompleted.includes('shadowArrival')){
      // Shadow is visible at the entrance but remains silent; Chapter 5 owns the conversation.
      r.disc({x:LOOKOUT_ENTRANCE.x,y:507,z:LOOKOUT_ENTRANCE.z,rx:30,rz:22,color:'#8067a8',alpha:.20});
      r.cylinder({x:LOOKOUT_ENTRANCE.x,y:560,z:LOOKOUT_ENTRANCE.z,rx:17,sy:92,color:'#302b3d'});
      r.cylinder({x:LOOKOUT_ENTRANCE.x,y:620,z:LOOKOUT_ENTRANCE.z,rx:15,sy:28,color:'#8b6e64'});
      r.billboard({x:LOOKOUT_ENTRANCE.x,y:660,z:LOOKOUT_ENTRANCE.z,size:22+Math.sin(time*2.2)*2,color:'#c9a7ff',alpha:.56});r.disc({x:LOOKOUT_ENTRANCE.x,y:LOOKOUT_HEIGHT+4,z:LOOKOUT_ENTRANCE.z,rx:46,rz:30,color:'#c9a7ff',alpha:.10+Math.sin(time*2)*.025});
    }
    if(this.vibrationPulse>0)for(const point of CHAPTER4_MOUNTAIN_SIGNALS)r.disc({x:point.x,y:12,z:point.z,rx:80+(2.2-this.vibrationPulse)*120,rz:60+(2.2-this.vibrationPulse)*90,color:'#d9f9ff',alpha:.16})}
  drawSky(r,time){for(let i=0;i<12;i++){const x=((time*(36+i%3*6)+i*210)%1800)-900,z=-620+(i%4)*410;r.billboard({x,y:130+(i%3)*75,z,size:160,color:'#f1fbff',alpha:.10})}r.billboard({x:0,y:-90,z:0,size:420,color:'#6d9fc9',alpha:.12});if(this.vibrationCombat){const foe=this.battle.fighters[1];r.disc({x:foe.x,y:8,z:foe.z,rx:90+Math.sin(time*8)*20,rz:70+Math.sin(time*8)*16,color:'#d9f9ff',alpha:.24});r.billboard({x:foe.x,y:160,z:foe.z,size:34,color:'#ffffff',alpha:.48})}}
  drawMarker(r,item,time){const pulse=1+Math.sin(time*4+(item.x||0)*.01)*.09,color=item.kind.startsWith('ingredient')?'#9ee8ad':item.kind==='old-man'?'#c79ee8':item.kind==='mountain-gate'?'#fff0a0':'#ffd557',yBase=Number(item.yBase)||0;r.disc({x:item.x,y:7+yBase,z:item.z,rx:44*pulse,rz:30*pulse,color,alpha:.22});r.billboard({x:item.x,y:148+yBase,z:item.z,size:30*pulse,color,alpha:.84})}

  showChoice({kicker,title,text,buttons,onChoose}){this.choiceOpen=true;this.choiceCallback=onChoose;this.mode='choice';this.battle.phase='story';const panel=this.root.querySelector('[data-c4-choice]');panel.hidden=false;this.root.querySelector('[data-c4-choice-kicker]').textContent=kicker;this.root.querySelector('[data-c4-choice-title]').textContent=title;this.root.querySelector('[data-c4-choice-text]').textContent=text;const list=this.root.querySelector('[data-c4-choice-buttons]');list.innerHTML=buttons.map((button,index)=>`<button type="button" class="${button.primary?'primary':''}" data-c4-choice-index="${index}"><strong>${button.label}</strong></button>`).join('');[...list.querySelectorAll('button')].forEach((button,index)=>button.addEventListener('click',()=>{const value=buttons[index].value;this.closeChoice();onChoose?.(value)}));list.querySelector('button')?.focus()}
  closeChoice(){this.choiceOpen=false;this.choiceCallback=null;this.root.querySelector('[data-c4-choice]').hidden=true}

  showDialogue(lines,onComplete){this.mode='story';this.battle.phase='story';this.dialogue=this.engine.showDialogue(lines,{typeSpeed:18,onComplete:()=>{this.dialogue=null;onComplete?.()}})}
  showAreaTitle(name,kicker='CHAPTER 4'){this.root.querySelector('[data-c4-area-name]').textContent=name;this.root.querySelector('[data-c4-area-kicker]').textContent=kicker;const panel=this.root.querySelector('[data-c4-area]');panel.hidden=false;this.areaTimer=2.5}
  toast(kicker,title,detail){const panel=this.root.querySelector('[data-c4-toast]');this.root.querySelector('[data-c4-toast-kicker]').textContent=kicker;this.root.querySelector('[data-c4-toast-title]').textContent=title;this.root.querySelector('[data-c4-toast-detail]').textContent=detail;panel.hidden=false;this.toastTimer=3.6}
  setObjective(title,detail){this.objectiveTitle=title;this.objectiveDetail=detail;this.root.querySelector('[data-c4-objective]').textContent=title;this.root.querySelector('[data-c4-detail]').textContent=detail;this.root.querySelector('[data-c4-menu-objective]').textContent=title;this.root.querySelector('[data-c4-menu-detail]').textContent=detail}

  updateObjective(){const next=chapter4NextRequired(this.state);this.syncRpgPacing();if(this.aftermathSeconds>0){this.setObjective('STAY WITH THE VILLAGE FOR A MOMENT','Villagers are returning outside, Bark and Wade are recovering, and the repaired route is opening.');this.refreshTracker();this.saveState();return}const objectives={opening:['WAKE UP IN ECHO REGION','Get your bearings near the damaged teleporter.'],villageReached:['REACH ECHO VILLAGE','Follow the stone path through the lower region.'],barkWadeArrive:['LEARN HOW ECHO VILLAGE LIVES',`${pacingOrientationProgress('chapter4',this.pacing).interactions} / 2 village landmarks understood.`],beaconRestored:['RESTORE THE ECHO BEACON',`${this.state.beaconNodes.length} / ${CHAPTER4_BEACON_NODES.length} team repairs complete.`],cavernsEntered:this.state.variety.fieldRouteComplete?['ENTER ECHO CAVERNS','The repaired party route now reaches the cavern entrance.']:['REPAIR THE CAVERN APPROACH',`${this.state.variety.fieldActions.length} / ${CHAPTER4_PARTY_FIELD_ACTIONS.length} party field actions complete.`],liftPartsRecovered:['RECOVER THE MOUNTAIN-LIFT PARTS',`${this.state.liftParts.length} / ${CHAPTER4_LIFT_PARTS.length} parts recovered. Open all three elemental doors.`],villageDefended:['DEFEND ECHO VILLAGE','Project Hollow forces are attacking while the lift is repaired.'],mountainDecision:[this.state.ryuzankaro.started?'FINISH THE OLD MAN’S POTIONS':'CHOOSE YOUR NEXT ROUTE',this.state.ryuzankaro.started?`${this.state.ryuzankaro.ingredients.length} / ${CHAPTER4_INGREDIENTS.length} ingredients collected.`:'Optional: investigate the old man. Main route: leave through the repaired mountain gate.'],mountainEntered:['ENTER THE MOUNTAIN PATH','Bark and Wade will remain in Echo Village.'],mountainSignals:['TRACE THE MOUNTAIN SIGNALS',`${this.state.mountainSignals.length} / ${CHAPTER4_MOUNTAIN_SIGNALS.length} signals traced.`],hollowWatcherDefeated:['DEFEAT THE HOLLOW WATCHER','Its scan rises when move and timing repeat. Vary either one to break the prediction.'],lookoutReached:['REACH THE FLOATING LOOKOUT','The lookout cannot be climbed. Find the highlighted summit pebble and throw it onto the platform.'],shadowArrival:['ENTER SHADOW’S LOOKOUT','Approach the entrance. Rrvvfo has finally reached Shadow.'],chapterSaved:['CHAPTER COMPLETE','Chapter 5 begins when Rrvvfo wakes inside Shadow’s Lookout.']};const [title,detail]=objectives[next]||['ECHO REGION','Continue toward Shadow’s Lookout.'];this.setObjective(title,detail);this.refreshTracker();this.saveState()}

  objectivePoint(){const next=chapter4NextRequired(this.state);if(this.area==='village'){if(next==='villageReached')return{...VILLAGE_POINTS.gate};if(next==='barkWadeArrive'){if(!this.pacing.interactions.includes('resonance-wall'))return{x:-520,z:210,label:'RESONANCE WALL'};if(!this.pacing.interactions.includes('water-channel'))return{x:-80,z:30,label:'WATER CHANNEL'}}if(next==='beaconRestored'){const p=CHAPTER4_BEACON_NODES.find(item=>!this.state.beaconNodes.includes(item.id));return p||VILLAGE_POINTS.beacon}if(next==='cavernsEntered')return VILLAGE_POINTS.cavern;if(next==='villageDefended')return{x:360,z:50,label:'DEFEND THE VILLAGE'};if(next==='mountainDecision')return this.state.ryuzankaro.started&&!this.state.ryuzankaro.bossDefeated?VILLAGE_POINTS.oldMan:VILLAGE_POINTS.mountain;if(this.state.ryuzankaro.started){const p=CHAPTER4_INGREDIENTS.find(item=>item.area==='village'&&!this.state.ryuzankaro.ingredients.includes(item.id));if(p)return p}}
    if(this.area==='cavern'){const door=CHAPTER4_CAVERN_DOORS.find(item=>!this.state.cavernDoors.includes(item.id));if(door)return door;const part=CHAPTER4_LIFT_PARTS.find(item=>!this.state.liftParts.includes(item.id));if(part)return part;return{x:-1040,z:0,label:'CAVERN EXIT'}}
    if(this.area==='mountain'){if(next==='mountainSignals')return CHAPTER4_MOUNTAIN_SIGNALS.find(item=>!this.state.mountainSignals.includes(item.id));if(next==='hollowWatcherDefeated')return{x:760,z:0,label:'HOLLOW WATCHER'};return{x:1010,z:-250,label:'SUMMIT PEBBLE • OBJECT SWAP TARGET'}}if(this.area==='lookout')return{...LOOKOUT_ENTRANCE,label:'SHADOW’S ENTRANCE'};return null}
  mapPoints(){if(this.area==='village')return[{...VILLAGE_POINTS.teleporter,color:'#73d8e5'},{...VILLAGE_POINTS.beacon,color:'#82d1dd'},{...VILLAGE_POINTS.cavern,color:'#6c7c85'},{...VILLAGE_POINTS.oldMan,color:'#9c76b5'},{...VILLAGE_POINTS.mountain,color:'#f0d06d'}];if(this.area==='cavern')return[...CHAPTER4_CAVERN_DOORS.map(p=>({...p,color:'#6f8c90'})),...CHAPTER4_LIFT_PARTS.map(p=>({...p,color:'#d5b565'}))];if(this.area==='lookout')return[{x:1120,z:-330,label:'FLOATING LOOKOUT',color:'#ccefff'},{...LOOKOUT_ENTRANCE,color:'#c9a7ff'}];return[...CHAPTER4_MOUNTAIN_SIGNALS.map(p=>({...p,color:'#8edee8'})),{x:1010,z:-250,label:'SUMMIT PEBBLE',color:'#fff0b5'},{x:1120,z:-330,label:'FLOATING LOOKOUT',color:'#ccefff'}]}

  refreshTracker(){if(!this.root)return;this.root.querySelector('[data-c4-required-count]').textContent=`${this.state.requiredCompleted.length} / ${CHAPTER4_REQUIRED_STEPS.length}`;this.root.querySelector('[data-c4-secret-status]').textContent=this.state.ryuzankaro.bossDefeated?'DEFEATED':this.state.ryuzankaro.skipped?'SKIPPED':this.state.ryuzankaro.available?'AVAILABLE':'LOCKED';this.root.querySelector('[data-c4-area-status]').textContent=this.area==='cavern'?'ECHO CAVERNS':this.area==='mountain'?'MOUNTAIN PATH':this.area==='lookout'?'SHADOW’S LOOKOUT':'ECHO VILLAGE';this.root.querySelector('[data-c4-vibration-status]').textContent=this.state.rewards.vibrationSense?'UNLOCKED':'LOCKED';const next=chapter4NextRequired(this.state);this.root.querySelector('[data-c4-journal-list]').innerHTML=`<article><small>HUB PHASE</small><strong>${rpgPacingLabel('chapter4',this.pacing)}</strong><span>Objectives unlock in story waves, with room for arrival and aftermath.</span></article><article><small>CURRENT STORY STEP</small><strong>${pretty(next||'complete')}</strong><span>${chapter4CompletionPercent(this.state)}% chapter completion</span></article><article><small>WHY THIS COMES NEXT</small><strong>${next==='beaconRestored'?'RESTORE REGIONAL DETECTION':next==='cavernsEntered'||next==='liftPartsRecovered'?'RECOVER THE BLOCKED MOUNTAIN ROUTE':next==='villageDefended'?'PROTECT THE LIFT REPAIR':next==='mountainDecision'?'OPTIONAL SECRET OR SOLO DEPARTURE':next==='mountainSignals'||next==='hollowWatcherDefeated'?'TRACE WHO IS WATCHING SHADOW':next==='lookoutReached'?'REACH THE UNCLIMBABLE LOOKOUT':next==='shadowArrival'?'ENTER SHADOW’S LOOKOUT':'FOLLOW THE PROJECT HOLLOW TRAIL'}</strong><span>Every mandatory objective opens the next route instead of acting as an unrelated errand.</span></article><article><small>PARTY FIELD ROUTE</small><strong>${this.state.variety.fieldActions.length} / ${CHAPTER4_PARTY_FIELD_ACTIONS.length}</strong><span>${this.state.variety.fieldRouteComplete?'Cavern approach permanently repaired':'Bark, Wade, and Rrvvfo each have one action'}</span></article><article><small>ECHO BEACON</small><strong>${this.state.beaconNodes.length} / ${CHAPTER4_BEACON_NODES.length}</strong><span>Fire, earth, and lightning repairs</span></article><article><small>MOUNTAIN LIFT</small><strong>${this.state.liftParts.length} / ${CHAPTER4_LIFT_PARTS.length}</strong><span>Recovered components</span></article><article><small>OLD MAN’S POTIONS</small><strong>${this.state.ryuzankaro.ingredients.length} / ${CHAPTER4_INGREDIENTS.length}</strong><span>${this.state.ryuzankaro.bossDefeated?'Ryuzankaro sealed':this.state.ryuzankaro.skipped?'Quest skipped':'Optional before departure'}</span></article><article><small>PROJECT HOLLOW</small><strong>${this.state.hollowWatcher.defeated?'DATA TRANSMITTED':'WATCHER ACTIVE'}</strong><span>${this.state.hollowWatcher.patternsRecorded} repeated patterns recorded</span></article>`}

  openTracker(){if(this.trackerOpen||!['explore','cavern','mountain'].includes(this.mode))return;this.trackerOpen=true;this.refreshTracker();this.root.querySelector('[data-c4-tracker]').hidden=false;this.previousMode=this.mode;this.mode='tracker';this.battle.phase='story';this.root.querySelector('[data-c4-close-journal]').focus()}
  closeTracker(){const panel=this.root?.querySelector('[data-c4-tracker]');if(panel)panel.hidden=true;const wasOpen=this.trackerOpen;this.trackerOpen=false;if(wasOpen){this.mode=this.previousMode||'explore';this.battle.phase='play'}}
  openBuildLab(){
    const locked=this.mode==='fight'||this.qte?.active;
    openRrvvfoBuildLab({storyChapter:4,storyProgress:loadLostYearProgress(),locked,lockReason:locked?'BUILD LOCKED • FINISH THE ACTIVE ENCOUNTER':'',onChange:build=>{const player=this.battle?.fighters?.[0];if(player)applyRrvvfoBuildToFighter(player,build);this.battle?.notice?.(`BUILD EQUIPPED • ${build.label}`,1.1)},onClose:()=>this.root.querySelector('[data-c4-menu-build]')?.focus()});
  }

  openStoryMenu(){if(this.storyMenuOpen||!['explore','cavern','mountain','fight'].includes(this.mode))return;this.closeTracker();this.storyMenuOpen=true;const panel=this.root.querySelector('[data-c4-menu]');panel.hidden=false;const skillPanel=this.root.querySelector('[data-c4-field-skills]');if(skillPanel)skillPanel.innerHTML=renderFieldSkillJournal({chapter:4});const buildButton=this.root.querySelector('[data-c4-menu-build]');if(buildButton){buildButton.disabled=this.mode==='fight';buildButton.textContent=this.mode==='fight'?'BUILD LOCKED • ACTIVE FIGHT':'RRVVFO BUILD'}this.storyMenuPaused=Boolean(this.battle&&!this.battle.paused);if(this.storyMenuPaused)this.battle.togglePause();this.root.querySelector('[data-c4-menu-resume]')?.focus()}
  closeStoryMenu(){const panel=this.root?.querySelector('[data-c4-menu]');if(panel)panel.hidden=true;this.storyMenuOpen=false;if(this.storyMenuPaused&&this.battle?.paused)this.battle.togglePause();this.storyMenuPaused=false}
  openManual(){if(this.storyMenuOpen)this.closeStoryMenu();const previous=this.mode;this.mode='manual';this.battle.phase='story';const opened=openCombatManual({onClose:()=>{if(this.aborted)return;this.mode=previous;this.battle.phase='play'}});if(!opened){this.mode=previous;this.battle.phase='play'}}

  unlockRyuzankaroAfterVillageDefense(){
    this.state.villageDefenseComplete=true;
    markChapter4Required(this.state,'villageDefended');
    this.state.ryuzankaro.available=chapter4VillageDefenseComplete(this.state);
    this.state.teamRestSeen=false;
    this.saveState();this.refreshTracker();
  }
  completeRequired(id){markChapter4Required(this.state,id);this.saveState();this.refreshTracker()}
  commitCompletion(){if(this.completed)return;this.completeRequired('chapterSaved');if(!chapter4Complete(this.state)){console.warn('[Chapter 4] Completion blocked',CHAPTER4_REQUIRED_STEPS.filter(id=>!this.state.requiredCompleted.includes(id)));return}this.completed=true;this.state.chapterComplete=true;this.state.location='shadow-lookout';this.mode='complete';this.battle.phase='story';const progress=loadLostYearProgress();if(this.replayMode)saveLostYearProgress({...progress,chapter4State:this.savedState,lastCheckpoint:this.savedCheckpoint||'rrvvfo-04-complete'});else{const completedMissions=unique([...(progress.completedMissions||[]),MISSION_ID]),unlocks=unique([...(progress.unlocks||[]),'echoRegion','echoVillage','echoCaverns','shadowLookout','hollowWatcherProfile',...(this.state.ryuzankaro.bossDefeated?['vibrationSense','lensMastery1','ryuzankaroCodex','echoTeamBadge']:[])]);saveLostYearProgress({...progress,completedMissions,unlocks,chapter4State:this.state,lastCheckpoint:'rrvvfo-04-complete'})}this.onComplete();this.showCompletion()}
  showCompletion(){this.closeStoryMenu();this.closeTracker();const endingFade=this.root.querySelector('[data-c4-ending-fade]');if(endingFade){endingFade.hidden=true;endingFade.style.opacity='0'}this.mode='complete';this.battle.phase='story';this.map?.close?.();this.root.querySelector('.c4Hud').hidden=true;this.root.querySelector('[data-c4-prompt]').hidden=true;this.root.querySelector('[data-c4-toast]').hidden=true;this.root.querySelector('[data-c4-tracker]').hidden=true;const globalObjective=document.querySelector('[data-story-objective-toast]');if(globalObjective){globalObjective.classList.remove('show');globalObjective.hidden=true}const secret=this.root.querySelector('[data-c4-complete-secret]');secret.innerHTML=this.state.ryuzankaro.bossDefeated?'<strong>SECRET BOSS COMPLETE</strong><span>Vibration Sense • Lens Mastery Lv. 1 • Improved Object Swap</span>':'<strong>SECRET QUEST SKIPPED</strong><span>Chapter 4 remains fully complete.</span>';this.root.querySelector('[data-c4-complete]').hidden=false;this.root.querySelector('[data-c4-continue]').focus()}

  saveState(){const progress=loadLostYearProgress();if(this.replayMode){saveLostYearProgress({...progress,chapter4State:this.savedState,lastCheckpoint:this.savedCheckpoint||'rrvvfo-04-complete'});return}saveLostYearProgress({...progress,chapter4State:this.state,lastCheckpoint:`rrvvfo-04-${chapter4NextRequired(this.state)||'complete'}`})}
  async requestExit(){const leave=await storyConfirm({title:'EXIT CHAPTER 4?',message:'Completed Echo Region checkpoints remain saved. Active fights restart.',confirmLabel:'EXIT CHAPTER'});if(leave)this.exitToStory()}
  exitToStory(){if(this.aborted)return;this.saveState();this.cleanup();this.onExit()}

  onKey(event){if(this.root.hidden)return;if(event.code==='Tab'&&this.mode==='fight'&&this.currentFight?.squadMode){event.preventDefault();this.cycleSquadTarget();return}if(event.code==='KeyC'&&this.mode==='fight'&&this.teamAllies.length){event.preventDefault();const commands=['focus','protect','interrupt'],index=(commands.indexOf(this.teamCommand)+1)%commands.length;this.teamCommand=commands[index];this.updateTeamCombatHud();this.battle.notice(`TEAM COMMAND • ${this.teamCommand.toUpperCase()}`,1.2);return}if(this.qte.active){const expected=this.qte.sequence[this.qte.step];const map={ArrowLeft:'LEFT',KeyA:'LEFT',ArrowRight:'RIGHT',KeyD:'RIGHT',ArrowUp:'UP',KeyW:'UP',ArrowDown:'DOWN',KeyS:'DOWN',Space:'CHARGE',KeyE:'RELEASE',Digit3:'OBJECT SWAP',Digit4:'LENS',KeyV:'VIBRATION'};let value=map[event.code]||map[event.key];if((event.code==='Enter'||event.code==='NumpadEnter')&&['LOCK','SEAL'].includes(expected))value=expected;if(value){event.preventDefault();this.advanceQte(value)}return}
    if(this.storyMenuOpen){if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.closeStoryMenu()}return}
    if(this.trackerOpen){if(event.key==='Escape'||event.key.toLowerCase()==='t'){event.preventDefault();event.stopImmediatePropagation();this.closeTracker()}return}
    if(this.choiceOpen)return;
    if(event.key==='Escape'&&['explore','cavern','mountain','fight'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openStoryMenu();return}
    if(event.key.toLowerCase()==='m'&&['explore','cavern','mountain','fight'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openManual();return}
    if(event.key.toLowerCase()==='t'&&['explore','cavern','mountain'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openTracker();return}
    if(['explore','cavern','mountain'].includes(this.mode)&&(event.key==='Enter'||event.code==='KeyE')){event.preventDefault();event.stopImmediatePropagation();this.tryInteract();return}
    if(['explore','cavern','mountain'].includes(this.mode)&&(event.code==='Digit4'||event.code==='KeyV')&&this.state.rewards.vibrationSense){event.preventDefault();this.useVibrationSense()}
  }

  cleanup(){if(this.aborted)return;this.aborted=true;this.map?.destroy();this.map=null;document.removeEventListener('keydown',this.keyHandler,true);this.dialogue?.overlay?.remove();if(this.battle?.active)this.battle.stopMatch();this.battle?.root?.classList.remove('storyChapter4','storyChapter4Hub','storyChapter4Combat');this.battle?.root?.classList.add('hidden');destroyStoryBattle(this.battle);this.root.remove();activeMission=null}
}
