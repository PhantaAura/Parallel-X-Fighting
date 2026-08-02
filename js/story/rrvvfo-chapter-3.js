import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {addStoryXp,applyStoryLevelToFighter,applyStoryProgressionToFighter} from './story-progression.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {StoryMap} from './story-map.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {recordWorldVisit,discoverWorldShortcut,recordInteriorVisit} from './connected-world.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {buildingDefinition,buildingMapTitle,clampInteriorPlayer,drawStoryInterior,interiorActorPoints,interiorBounds,interiorExitPoint,interiorLifeLine,interiorMapPoints,resolveExteriorBuildingCollision} from './story-interiors.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {storyConfirm} from './story-ux.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {openCombatManual} from './combat-manual.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {applyRrvvfoBuildToFighter,openRrvvfoBuildLab} from './core-fun.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyStatsMarkup} from './story-rpg-ui.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {renderFieldSkillJournal} from './field-skills.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {discoverWorldDelight} from './world-delight.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {snapHubCamera,updateHubCamera} from './hub-camera.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {
  CHAPTER3_BRACKET_ORDER,
  CHAPTER3_EVIDENCE,
  CHAPTER3_MANDATORY_STORIES,
  CHAPTER3_MISSION_ID,
  CHAPTER3_OPTIONAL_QUESTS,
  CHAPTER3_REQUIRED_STEPS,
  chapter3Complete,
  chapter3CompletionPercent,
  chapter3EvidenceSummary,
  chapter3MandatorySummary,
  chapter3NextRequired,
  chapter3OptionalSummary,
  freshChapter3State,
  markChapter3Required,
  normalizeChapter3State
} from './chapter3-content.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {completePacingOrientation,pacingOrientationProgress,recordPacingVisit,recordPacingAftermath,rpgPacingLabel,rpgPacingQuestWave,setRpgPacingPhase} from './rpg-pacing.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {CHAPTER3_INCIDENT_ORDER,nextIncidentStep,recordIncidentStep} from './quest-variety.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {completeAdventureMission,discoverAdventureMission} from './core-fun.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {chapter3ReplacementActivity} from './quest-overhaul.js?v=29a4071-chapter3-sabotage-investigation-20260802';

const UI_ID='rrvvfoChapter3PreviewUI';
const MISSION_ID=CHAPTER3_MISSION_ID;
const EMPTY_COMMAND=Object.freeze({x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,breaker:false,counter:false,interact:false,special:false});
const HUB_SPAWN=Object.freeze({x:1040,z:110});
const FACILITY_SPAWN=Object.freeze({x:-900,z:0});
const REMOTE_SPAWN=Object.freeze({x:-820,z:130});
const STRANGE_MAN_POINT=Object.freeze({x:-1510,z:-760});
const EAST_SUPPORT_CLUE=Object.freeze({x:1260,z:330});
const STRANGE_MAN_HAT=Object.freeze({
  id:'strange-mans-hat',
  name:'Strange Man’s Hat',
  description:'The only thing left behind after its owner disappeared. Nobody at the tournament remembers seeing him.'
});

const SABOTAGE_EVIDENCE_POINTS=Object.freeze([
  Object.freeze({id:'support',step:'ringEvidence1Found',evidence:'weakenedSupport',label:'DAMAGED RING SUPPORT',x:1280,z:120}),
  Object.freeze({id:'component',step:'ringEvidence2Found',evidence:'unregisteredComponent',label:'UNREGISTERED COMPONENT',x:1450,z:280}),
  Object.freeze({id:'access',step:'ringEvidence3Found',evidence:'maintenanceAccess',label:'OPEN MAINTENANCE PANEL',x:1160,z:-140})
]);
const SABOTAGE_WITNESSES=Object.freeze([
  Object.freeze({id:'worker',step:'workerQuestioned',evidence:'workerTestimony',label:'QUESTION TOURNAMENT WORKER',x:760,z:560}),
  Object.freeze({id:'security',step:'securityQuestioned',evidence:'securityTestimony',label:'QUESTION SECURITY',x:960,z:-240})
]);
const MAINTENANCE_ENTRY_POINT=Object.freeze({x:1190,z:40});
let activeMission=null;

const HUB_DISTRICTS=Object.freeze([
  {id:'arena',name:'MAIN ARENA',x:1360,z:40},
  {id:'vendor',name:'CLOSED VENDOR ROW',x:-620,z:620},
  {id:'camp',name:'FIGHTER CAMP',x:-900,z:-420},
  {id:'medical',name:'MEDICAL AREA',x:640,z:-520},
  {id:'office',name:'TOURNAMENT OFFICES',x:-120,z:-560},
  {id:'bracket',name:'BRACKET ROOM',x:930,z:-540},
  {id:'media',name:'MEDIA BOOTH',x:260,z:-690},
  {id:'storage',name:'STORAGE DISTRICT',x:760,z:560},
  {id:'security',name:'SECURITY STATION',x:960,z:-240},
  {id:'staff',name:'STAFF CORRIDOR',x:1020,z:350},
  {id:'elevator',name:'MAINTENANCE ELEVATOR',x:1190,z:40}
]);

const NIGHT_ROUTE=Object.freeze([
  {id:'vendor-roof',label:'VENDOR ROOFTOPS',x:-680,z:720},
  {id:'banners',label:'TOURNAMENT BANNERS',x:-180,z:590},
  {id:'storage-balcony',label:'STORAGE BALCONY',x:520,z:650},
  {id:'vent',label:'VENTILATION PASSAGE',x:810,z:440},
  {id:'walkway',label:'MAINTENANCE WALKWAY',x:990,z:210},
  {id:'control-room',label:'STAFF CONTROL ROOM',x:1040,z:-150}
]);

const RING_COLLECTORS=Object.freeze([
  {id:'north-support',label:'NORTH SUPPORT',x:-1120,z:350},
  {id:'west-support',label:'WEST SUPPORT',x:-1380,z:560},
  {id:'clash-support',label:'CLASH-SIDE SUPPORT',x:-860,z:760}
]);

const BAG_SEARCH=Object.freeze([
  {id:'costume',label:'COSTUME STORAGE',x:760,z:560},
  {id:'lost-found',label:'LOST-AND-FOUND',x:430,z:-690},
  {id:'vendor',label:'VENDOR ROW',x:-650,z:620},
  {id:'cart',label:'CLEANUP CART',x:-80,z:500},
  {id:'impersonators',label:'PLOUKE IMPERSONATORS',x:-880,z:-350}
]);

const LENS_TRAIL=Object.freeze([
  Object.freeze({x:-240,z:-80,label:'EAST SUPPORT RESIDUE'}),
  Object.freeze({x:180,z:-360,label:'STAFF CORRIDOR ECHO'}),
  Object.freeze({x:520,z:-610,label:'SECURITY BLIND SPOT'}),
  Object.freeze({x:780,z:-700,label:'HIDDEN ELEVATOR SEAM'})
]);

const OPTIONAL_POINTS=Object.freeze({
  unpaidSnacks:{label:'UNPAID SNACKS',x:-670,z:620},
  oneLastMatch:{label:'FORGOTTEN CONTESTANT',x:-1040,z:-400},
  poukiEquipment:{label:'POUKI’S EQUIPMENT',x:-930,z:760},
  fakePloukes:{label:'FAKE PLOUKES',x:-880,z:-330},
  prizeEnvelope:{label:'PRIZE ENVELOPE',x:240,z:610},
  finalAnnouncement:{label:'ANNOUNCER',x:-250,z:-500},
  lateFan:{label:'LATE TOURNAMENT FAN',x:-720,z:250},
  cleanupEchoes:{label:'CLEANUP ECHOES',x:-1150,z:720},
  medicalFollowup:{label:'MEDICAL FOLLOW-UP',x:640,z:-520},
  controlledFlame:{label:'CONTROLLED FLAME',x:-1120,z:560}
});

const OPTIONAL_MULTI_POINTS=Object.freeze({
  finalAnnouncement:[
    {id:'registration',label:'REGISTRATION SPEAKER',x:-160,z:-610},
    {id:'vendor',label:'VENDOR SPEAKER',x:-500,z:650},
    {id:'arena',label:'ARENA SPEAKER',x:1120,z:180}
  ],
  cleanupEchoes:[
    {id:'fragment-a',label:'CONTAMINATED FRAGMENT',x:-1260,z:660},
    {id:'fragment-b',label:'CONTAMINATED FRAGMENT',x:-980,z:780},
    {id:'fragment-c',label:'CONTAMINATED FRAGMENT',x:-820,z:520}
  ],
  fakePloukes:[
    {id:'fan',label:'PLOUKE FAN',x:-960,z:-390},
    {id:'debtor',label:'SUSPICIOUS PLOUKE',x:-840,z:-330},
    {id:'confused',label:'CONFUSED PLOUKE',x:-760,z:-420}
  ],
  lateFan:[
    {id:'wade',label:'WADE AUTOGRAPH',x:100,z:140},
    {id:'bark',label:'BARK AUTOGRAPH',x:220,z:80},
    {id:'pouki',label:'POUKI AUTOGRAPH',x:-360,z:610},
    {id:'plouke',label:'PLOUKE AUTOGRAPH',x:1120,z:40}
  ]
});

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function distance(a,b){return Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0))}
function unique(values){return[...new Set(values)]}
function chapter3CaseBoard(state){
  const found=new Set(state?.evidence||[]),has=(...ids)=>ids.every(id=>found.has(id));
  const cards=[
    {kicker:'ARENA DAMAGE',title:'THE RING WAS SABOTAGED',detail:'The weakened support, unregistered component, and lower-maintenance access all point to deliberate interference.',open:has('weakenedSupport','unregisteredComponent','maintenanceAccess')},
    {kicker:'WITNESSES',title:'SOMEONE USED MAINTENANCE DURING THE TOURNAMENT',detail:'Workers saw equipment moving while security says nobody was authorized below the arena.',open:has('workerTestimony','securityTestimony')},
    {kicker:'PLOUKE LEAD',title:'SAGE MAY HAVE FOLLOWED THE SAME TRAIL',detail:'The medical worker originally saw Plouke heading toward maintenance after the fight.',open:found.has('medicalTestimony')},
    {kicker:'UNRESOLVED CONTRADICTION',title:'THE MEDICAL STORY CHANGED',detail:'The same worker later denied ever knowing Plouke. Nothing confirms replacement, altered memory, disguise, or illusion.',open:found.has('medicalContradiction')},
    {kicker:'UNDERGROUND',title:'THE TOURNAMENT WAS BEING OBSERVED',detail:'Hidden infrastructure records fighter behavior and energy from beneath the arena.',open:found.has('tournamentData')}
  ];
  let theory='Inspect the damaged arena before repairs erase the evidence.';
  if(has('weakenedSupport','unregisteredComponent','maintenanceAccess'))theory='The tournament was deliberately sabotaged from below the ring.';
  if(has('workerTestimony','securityTestimony','medicalTestimony'))theory='The saboteur used maintenance access, and Sage may have noticed the same route.';
  if(found.has('medicalContradiction'))theory='The witness problem is real. Follow physical evidence instead of trusting identities.';
  if(found.has('sageTrail'))theory='Sage independently entered the same hidden route and was investigating it before Rrvvfo arrived.';
  if(found.has('tournamentData'))theory='An organized group used the tournament to observe fighters. Their complete purpose is still unknown.';
  return{cards,theory,contradiction:found.has('medicalContradiction')};
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.hidden=true;
  root.innerHTML=`
    <div class="c3Hud">
      <div class="c3Objective">
        <small>RRVVFO STORY • CHAPTER 3</small>
        <strong data-c3-objective>WHO SABOTAGED THE TOURNAMENT?</strong>
        <span data-c3-detail>Inspect the damaged arena before the repair crews erase the evidence.</span>
      </div>
      ${storyAttackStripMarkup({compact:true})}
      <div class="c3HudActions">
        <button type="button" data-c3-status>EVIDENCE</button>
        <button type="button" data-c3-map>MAP</button>
        <button type="button" data-c3-menu-button>STORY MENU</button>
      </div>
    </div>
    <div class="c3Transition" data-c3-transition>
      <article><small>RRVVFO STORY</small><h1>CHAPTER 3</h1><strong>THE SABOTAGE INVESTIGATION</strong><span>THE TOURNAMENT IS OVER. SOMEBODY STILL HAS QUESTIONS TO ANSWER.</span></article>
    </div>
    <div class="c3AreaTitle" data-c3-area hidden>
      <small data-c3-area-kicker>THE LOST YEAR • AFTER THE TOURNAMENT</small>
      <strong data-c3-area-name>AFTER-HOURS TOURNAMENT</strong>
    </div>
    <div class="c3Prompt" data-c3-prompt hidden>
      <strong data-c3-prompt-title>INTERACT</strong>
      <span data-c3-prompt-detail>PRESS INTERACT</span>
    </div>
    <div class="c3QuestToast" data-c3-toast hidden><small data-c3-toast-kicker>QUEST UPDATED</small><strong data-c3-toast-title></strong><span data-c3-toast-detail></span></div>
    <aside class="c3Tracker" data-c3-tracker hidden>
      <header><small>CHAPTER 3 • INVESTIGATION</small><h2>CASE BOARD</h2></header>
      <div class="c3TrackerRows">
        <div><span>REQUIRED STORY</span><strong data-c3-required-count>0 / 29</strong></div>
        <div><span>MANDATORY SIDE STORIES</span><strong data-c3-mandatory-count>0 / 3</strong></div>
        <div><span>EVIDENCE</span><strong data-c3-evidence-count>0 / 6</strong></div>
        <div><span>OPTIONAL QUESTS</span><strong data-c3-optional-count>0 / 10</strong></div>
        <div><span>AREA</span><strong data-c3-area-status>TOURNAMENT</strong></div>
      </div>
      <section class="c3Journal" data-c3-journal></section>
      <button type="button" data-c3-close-status>CLOSE</button>
    </aside>
    <div class="c3StoryMenu storyRpgPause" data-c3-menu hidden role="dialog" aria-modal="true" aria-label="Chapter 3 story menu">
      <article>
        <header><div><small>RRVVFO STORY • CHAPTER 3</small><h2>STORY MENU</h2></div><button type="button" data-c3-menu-close aria-label="Close story menu">×</button></header>
        ${storyAttackStripMarkup()}
        ${storyStatsMarkup(loadLostYearProgress())}
        <div class="storyRpgObjectiveCard"><small>CURRENT OBJECTIVE</small><strong data-c3-menu-objective>SOMETHING UNDER THE RING</strong><span data-c3-menu-detail>Find out where the Sage went after the tournament.</span></div>
        <div data-c3-field-skills>${renderFieldSkillJournal({chapter:3})}</div>
        <div class="chapter2MenuActions"><button class="primary" type="button" data-c3-menu-resume>RETURN TO GAME</button><button type="button" data-c3-menu-manual>SAGE MANUAL</button><button type="button" data-c3-menu-build>RRVVFO BUILD</button><button type="button" data-c3-menu-tracker>QUEST JOURNAL</button><button type="button" data-c3-exit>EXIT CHAPTER</button></div>
        ${storyControlLegendMarkup()}
      </article>
    </div>
    <div class="c3TaskOverlay" data-c3-task hidden role="dialog" aria-modal="true" aria-labelledby="c3TaskTitle">
      <article>
        <small data-c3-task-kicker>CHAPTER 3</small>
        <h2 id="c3TaskTitle" data-c3-task-title>INVESTIGATION</h2>
        <p data-c3-task-text></p>
        <div class="c3TaskProgress" data-c3-task-progress></div>
        <div class="c3TaskButtons" data-c3-task-buttons></div>
      </article>
    </div>

    <div class="c3LensContradiction" data-c3-lens-contradiction hidden aria-live="assertive">
      <article>
        <small>LENS OF TRUTH • CONTRADICTORY PREDICTION</small>
        <strong data-c3-lens-possibility>THE STRANGE MAN WALKS TO THE LEFT.</strong>
        <span>NO SINGLE FUTURE CAN BE CONFIRMED</span>
      </article>
    </div>
    <div class="c3DoorOverlay" data-c3-door hidden>
      <article>
        <small>FINAL FACILITY SEQUENCE</small>
        <h2 data-c3-door-title>THE TELEPORTER DOOR IS CLOSING</h2>
        <p data-c3-door-text>Get through before Project Hollow seals the room.</p>
        <div class="c3DoorVisual"><i data-c3-door-gap></i><b data-c3-rock>BLUE CLONE</b><span>TELEPORTER CHAMBER</span></div>
        <div class="c3DoorTimer"><i data-c3-door-meter></i></div>
        <button type="button" class="primary" data-c3-door-action>GET THROUGH</button>
        <small data-c3-door-prompt></small>
      </article>
    </div>
    <div class="c3Complete" data-c3-complete hidden>
      <article>
        <small>RRVVFO STORY • CHAPTER 3 COMPLETE</small>
        <h2>THE SABOTAGE GOES DEEPER</h2>
        <p>Rrvvfo proved the tournament was deliberately sabotaged, uncovered Project Hollow beneath the arena, escaped with one of Sage’s blue clones, and vanished into Echo Region for several days.</p>
        <div class="c3Rewards">
          <span>AFTER-HOURS TOURNAMENT STAGE</span>
          <span>ABANDONED RESONANCE FACILITY STAGE</span>
          <span>BLUE CLONE TECHNIQUE FOUNDATION</span>
          <span>PROJECT HOLLOW LORE ENTRY</span>
          <span>STORY PROGRESS • 3 / 8 CHAPTERS</span>
        </div>
        <button type="button" data-c3-continue>SAVE AND RETURN TO STORY</button>
      </article>
    </div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoChapter3{
  constructor({onComplete=()=>{},onExit=()=>{},replay=false}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.progress=loadLostYearProgress();
    this.completedBefore=this.progress.completedMissions?.includes(MISSION_ID);
    this.replayMode=Boolean(replay&&this.completedBefore);
    this.savedState=normalizeChapter3State(this.progress.chapter3State||{});
    this.savedCheckpoint=this.progress.lastCheckpoint;
    this.state=this.replayMode?freshChapter3State():normalizeChapter3State(this.progress.chapter3State||{});
    this.mode='boot';
    this.area='hub';
    this.dialogue=null;
    this.aborted=false;
    this.completed=false;
    this.interactHeld=false;
    this.nearby=null;
    this.playerFlip=false;
    this.areaTimer=0;
    this.toastTimer=0;
    this.currentDistrict='';
    this.interiorId='';
    this.interiorReturn=null;
    this.pacing=this.state.pacing;
    this.aftermathSeconds=0;
    this.storyMenuOpen=false;
    this.storyMenuPaused=false;
    this.trackerOpen=false;
    this.trackerPreviousMode='hub';
    this.taskOpen=false;
    this.taskButtons=[];
    this.taskIndex=0;
    this.taskChoose=null;
    this.currentFight=null;
    this.fightLosses={};
    this.fightElapsed=0;
    this.lastFightPattern='';
    this.door={active:false,stage:'idle',deadline:0,swapStarted:false,retryCount:0};
    this.lensContradictionTimers=[];
    this.root.querySelector('[data-c3-status]').addEventListener('click',()=>this.openTracker());
    this.root.querySelector('[data-c3-map]').addEventListener('click',()=>this.map?.open());
    this.root.querySelector('[data-c3-menu-button]').addEventListener('click',()=>this.openStoryMenu());
    this.root.querySelectorAll('[data-c3-menu-close],[data-c3-menu-resume]').forEach(button=>button.addEventListener('click',()=>this.closeStoryMenu()));
    this.root.querySelector('[data-c3-menu-manual]').addEventListener('click',()=>this.openManual());
    this.root.querySelector('[data-c3-menu-build]').addEventListener('click',()=>this.openBuildLab());
    this.root.querySelector('[data-c3-menu-tracker]').addEventListener('click',()=>{this.closeStoryMenu();this.openTracker()});
    this.root.querySelector('[data-c3-close-status]').addEventListener('click',()=>this.closeTracker());
    this.root.querySelector('[data-c3-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-c3-continue]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-c3-door-action]').addEventListener('click',()=>this.advanceDoorSequence());
    this.keyHandler=event=>this.onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  start(){
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:this.state.location==='facility'?'facility':'mystery'}));
    const stageId=this.state.location==='remote-region'?'remote-highlands':this.state.location==='facility'?'resonance-facility':'after-hours-tournament';
    this.battle=createStoryBattle({stageId,opponent:{id:'sage',name:'The Sage',cpu:true}});
    this.engine=attachStoryEngine(this.battle,{
      chapterLabel:'RRVVFO CHAPTER 3',
      stageName:'THE SABOTAGE INVESTIGATION',
      rootClasses:['storyChapter3Hub','storyChapter3Full'],
      getMode:()=>{
        if(this.engine?.dialogue)return'dialogue';
        if(['hub','dungeon','remote','interior'].includes(this.mode))return'exploration';
        if(this.mode==='fight')return'combat';
        return this.mode;
      }
    });
    this.patchBattle();
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','THE SAGE']});
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART ACTIVE ENCOUNTER?',message:'Restart the current Chapter 3 encounter? Completed investigation checkpoints remain saved.',confirmLabel:'RESTART'});
    this.root.hidden=false;
    this.map=new StoryMap({
      title:'CHAPTER 3 INVESTIGATION MAP',regionId:this.connectedRegionId(),zoneId:this.connectedZoneId(),
      bounds:{minX:-1800,maxX:1800,minZ:-1120,maxZ:1120},
      getPlayer:()=>this.battle?.fighters?.[0]||null,
      getObjective:()=>this.objectivePoint(),
      getPoints:()=>this.mapPoints(),getZoneId:()=>this.connectedZoneId(),getProgress:()=>loadLostYearProgress(),getWorldState:()=>loadLostYearProgress().worldState
    });
    this.root.querySelector('[data-c3-transition]').hidden=false;
    this.openingTimer=setTimeout(()=>{
      if(this.aborted)return;
      this.root.querySelector('[data-c3-transition]').hidden=true;
      this.restoreOrBegin();
    },900);
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    this.engine.useChapterProfile({
      input:next=>{
        const command=next()||EMPTY_COMMAND;
        if(['hub','dungeon','remote','interior'].includes(this.mode)){
          const interact=Boolean(command.interact);
          if(interact&&!this.interactHeld)this.tryInteract();
          this.interactHeld=interact;
          return this.engine.commandForMode(command,'exploration',{allowJump:true,allowDash:true,allowInteract:true});
        }
        if(this.mode==='fight')return this.engine.commandForMode(command,'combat');
        this.interactHeld=Boolean(command.interact);
        return this.engine.commandForMode({},this.mode);
      },
      cpu:(next,fighter,foe,dt)=>{
        if(this.mode!=='fight'||!this.currentFight)return EMPTY_COMMAND;
        const fight=this.currentFight;
        const t=this.fightElapsed;
        if(fight.kind==='dummy'){
          const phase=Math.floor(t/7)%3;
          const dx=foe.x-fighter.x,dz=foe.z-fighter.z,d=Math.max(1,Math.hypot(dx,dz));
          if(phase===0)return{x:dx/d,z:dz/d,jump:false,light:t%1.8<.12,heavy:t%4.1<.12,launcher:false,dash:d>260,block:t%3.2<.48,charge:false,grab:d<90&&t%5<.1,special:false};
          if(phase===1)return{x:dx/d,z:dz/d,jump:false,light:t%1.05<.14,heavy:t%2.5<.12,launcher:t%4.4<.1,dash:d>150,block:false,charge:false,grab:d<80&&t%3.8<.1,special:false};
          return{x:dx/d,z:dz/d,jump:false,light:t%1.5<.1,heavy:false,launcher:false,dash:t%1.25<.18,block:false,charge:false,grab:false,special:t%3.4<.12};
        }
        if(fight.kind==='echo'){
          const dx=foe.x-fighter.x,dz=foe.z-fighter.z,d=Math.max(1,Math.hypot(dx,dz));
          const pattern=this.echoPattern();
          if(pattern==='hamual')return{x:dx/d,z:dz/d,jump:false,light:t%1.8<.12,heavy:t%4.2<.12,launcher:false,dash:d>260,block:t%3<.65,charge:false,grab:false,special:false};
          if(pattern==='daniel')return{x:dx/d,z:dz/d,jump:false,light:t%1<.14,heavy:t%2.35<.12,launcher:t%4.1<.1,dash:d>150,block:false,charge:false,grab:d<80&&t%3.5<.1,special:false};
          if(pattern==='wade')return{x:dx/d,z:dz/d,jump:false,light:t%1.5<.1,heavy:false,launcher:false,dash:t%1.1<.19,block:false,charge:false,grab:false,special:t%3.2<.12};
          if(pattern==='bark')return{x:dx/d*.55,z:dz/d*.55,jump:false,light:t%2<.11,heavy:t%3.2<.15,launcher:false,dash:false,block:t%2.2<.75,charge:false,grab:false,special:t%4<.12};
          if(pattern==='pouki')return{x:dx/d*.7,z:dz/d*.7,jump:false,light:false,heavy:t%2.6<.2,launcher:t%5<.15,dash:d>310,block:false,charge:t%4.5<.6,grab:false,special:t%3.8<.12};
          if(pattern==='plouke')return{x:-dx/d*.35,z:-dz/d*.35,jump:false,light:t%1.7<.1,heavy:t%3.7<.12,launcher:false,dash:t%2.2<.15,block:t%2.9<.35,charge:false,grab:false,special:t%3.1<.1};
          return{x:dx/d,z:dz/d,jump:t%4<.1,light:t%1.2<.12,heavy:t%2.8<.12,launcher:t%5<.1,dash:d>220,block:t%3.4<.3,charge:false,grab:false,special:t%2.9<.12};
        }
        return next(fighter,foe,dt);
      },
      castAbility:(next,slot)=>{
        if(this.mode==='hub'&&this.state.strangeManHatCollected&&!this.state.strangeManHatLensInspected&&slot===4){this.inspectStrangeManHatWithLens();return true}
        if(this.mode==='fight'){
          if(slot===5){battle.notice('FIRE AWAKENING HAS NOT STABILIZED',1.2);return false}
          return next(slot);
        }
        if(this.mode==='door-qte'){
          battle.notice('THE ESCAPE IS ABOUT THE CLOSING DOOR • NOT OBJECT SWAP',1.1);return false;
        }
        battle.notice(this.mode==='dungeon'?'SAVE YOUR ENERGY FOR THE LOCKDOWN':'ABILITIES ARE NOT NEEDED HERE',1.1);
        return false;
      },
      applyDamage:(next,attacker,target,damage,meta={})=>{
        let adjusted=damage;
        if(this.mode==='fight'&&this.currentFight?.kind==='echo'&&target===battle.fighters[1]){
          const pattern=this.echoPattern();
          if(pattern==='bark'&&!this.echoWeakWindow())adjusted*=.42;
        }
        const connected=next(attacker,target,adjusted,meta);
        if(!connected||this.mode!=='fight'||!this.currentFight)return connected;
        const player=battle.fighters[0],foe=battle.fighters[1];
        if(target===foe&&foe.hp<=0){foe.hp=1;queueMicrotask(()=>this.finishFight(true))}
        else if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.finishFight(false))}
        return connected;
      },
      updateCamera:()=>updateHubCamera(battle,{
        frameFight:this.mode==='fight',
        allowLook:['hub','dungeon','remote','interior'].includes(this.mode),
        hubDistance:this.area==='facility'?960:this.area==='remote'?1080:1120,
        fightBaseDistance:920,
        fightMaxDistance:1160
      }),
      flipFor:(next,fighter)=>{
        if(['hub','dungeon','remote','interior'].includes(this.mode)&&fighter===battle.fighters[0]){
          const speed=Math.hypot(fighter.moveX||0,fighter.moveZ||0);
          if(speed>.05){
            const self=battle.renderer.project(fighter.x,80+fighter.y,fighter.z);
            const ahead=battle.renderer.project(fighter.x+(fighter.moveX||fighter.aimX||1)*120,80+fighter.y,fighter.z+(fighter.moveZ||fighter.aimZ||0)*120);
            this.playerFlip=ahead.x<self.x;
          }
          return this.playerFlip;
        }
        return next(fighter);
      },
      drawFighterLayer:(next,fighters)=>next(this.mode==='fight'?fighters:[battle.fighters[0]]),
      drawFallback2D:(next,context,fighter,rect)=>{
        if(!['practice-dummy','unfinished-echo','swap-rock','forgotten-fighter'].includes(fighter.id))return next(context,fighter,rect);
        const palette=fighter.id==='unfinished-echo'?{body:'#31455b',skin:'#6e7d89',hair:'#8af0ff'}:fighter.id==='swap-rock'?{body:'#77766e',skin:'#98958a',hair:'#77766e'}:{body:'#796b58',skin:'#a48a62',hair:'#d2b878'};
        const cx=rect.x+rect.width/2,scale=rect.height/190;
        context.fillStyle='rgba(0,0,0,.34)';context.beginPath();context.ellipse(cx,rect.y+rect.height-3,35*scale,10*scale,0,0,Math.PI*2);context.fill();
        context.fillStyle=palette.body;context.fillRect(cx-24*scale,rect.y+70*scale,48*scale,82*scale);
        context.fillStyle=palette.skin;context.beginPath();context.arc(cx,rect.y+50*scale,20*scale,0,Math.PI*2);context.fill();
        context.fillStyle=palette.hair;context.fillRect(cx-24*scale,rect.y+20*scale,48*scale,25*scale);
      },
      draw:next=>{next();this.drawChapterWorld()},
      update:(next,dt)=>{
        next(dt);
        if(!battle.active||this.aborted)return;
        this.areaTimer=Math.max(0,this.areaTimer-dt);
        this.toastTimer=Math.max(0,this.toastTimer-dt);
        if(!this.areaTimer)this.root.querySelector('[data-c3-area]').hidden=true;
        if(!this.toastTimer)this.root.querySelector('[data-c3-toast]').hidden=true;
        if(['hub','dungeon','remote','interior'].includes(this.mode)){
          const player=battle.fighters[0];
          player.hp=Math.max(1,Math.min(player.maxHp,player.hp));
          player.en=Math.max(0,Math.min(100,player.en));
          player.guard=Math.max(0,Math.min(100,player.guard));
          battle.time=9999;
          this.updateExploration(dt);
        }else if(this.mode==='fight'){
          battle.time=9999;
          this.updateFight(dt);
        }else if(this.mode==='door-qte')this.updateDoorSequence();
        this.map?.draw();
      },
      exit:async next=>{
        const leave=await storyConfirm({title:'EXIT CHAPTER 3?',message:'Leave Chapter 3? Completed investigations and dungeon checkpoints remain saved.',confirmLabel:'EXIT CHAPTER'});
        if(!leave)return;
        this.saveState();next();this.cleanup();this.onExit();
      }
    });
  }

  restoreOrBegin(){
    if(this.state.chapterComplete||this.state.rrvvfoUnconscious||this.state.location==='remote-region'){
      this.enterRemoteRegion({restored:true});
      return;
    }
    if(this.state.location==='facility'){
      this.enterFacility({restored:true});
      return;
    }
    this.enterAfterHoursHub({opening:!this.state.requiredCompleted.includes('opening')});
  }
  switchStage(stageId){
    if(this.battle.active)this.battle.stopMatch();
    this.battle.setStage(stageId);
    this.battle.start();
    this.battle.root.querySelector('[data-result]')?.classList.add('hidden');
  }

  preparePlayer(point){
    const player=this.battle.fighters[0];
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(point.x,point.z);void this.battle.ensureFighterAsset(player,'rrvvfo');
    applyStoryProgressionToFighter(player,loadLostYearProgress());
    player.en=65;player.guard=100;
    snapHubCamera(this.battle,player,{distance:this.area==='facility'?960:this.area==='remote'?1080:1120});
    this.hideSecondFighter();
  }

  hideSecondFighter(){
    const foe=this.battle.fighters[1];
    foe.y=-1400;foe.x=this.battle.fighters[0].x-120;foe.z=this.battle.fighters[0].z-120;foe.hp=100;foe.attackState=null;foe.asset=null;
  }

  syncRpgPacing(){
    const phase=this.area==='remote'?'departure':this.area==='facility'?(this.state.projectHollowNameRevealed?'crisis':'development'):(this.state.hubState>=2?'development':'arrival');
    const wave=this.area==='facility'?3:this.state.hubState>=4?3:this.state.hubState>=2?2:this.pacing.orientationComplete?1:0;
    setRpgPacingPhase(this.pacing,phase,{wave});
    this.root.dataset.rpgPhase=this.pacing.phase;this.root.dataset.rpgWave=String(rpgPacingQuestWave(this.pacing));
    if(this.battle?.root){this.battle.root.dataset.rpgPhase=this.pacing.phase;this.battle.root.dataset.rpgChapter='chapter3'}
  }

  beginInvestigationAftermath(eventId,seconds=7){
    recordPacingAftermath(this.pacing,eventId);setRpgPacingPhase(this.pacing,'aftermath',{wave:3});
    this.aftermathSeconds=this.replayMode?0:Math.max(0,seconds);this.syncRpgPacing();this.saveState();
  }

  enterAfterHoursHub({opening=false,spawn=HUB_SPAWN}={}){
    this.area='hub';
    this.state.location='after-hours-hub';
    if(!this.replayMode)saveLostYearProgress(recordWorldVisit(loadLostYearProgress(),'tournament','stadium',{entrance:'chapter2-aftermath'}));
    this.map?.setRegion('tournament',this.connectedZoneId());
    this.switchStage('after-hours-tournament');
    this.mode='hub';this.currentFight=null;this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();
    this.battle.root.classList.add('storyChapter3Hub');this.battle.root.classList.remove('storyChapter3Combat');
    this.engine.setLabels({stageName:'AFTER-HOURS TOURNAMENT',chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO','']});
    this.preparePlayer(spawn);
    this.syncRpgPacing();
    this.updateLensAvailability();
    this.showAreaTitle('AFTER-HOURS TOURNAMENT','CHAPTER 3 • SABOTAGE INVESTIGATION');
    this.saveState();
    if(opening)this.showOpeningScene();
    else{this.updateObjective();this.refreshTracker()}
  }

  showOpeningScene(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Someone messed with that ring.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And if they replace everything, there goes half the evidence.',tail:'down'}
    ],()=>{
      this.state.chapter3Started=true;
      this.state.sabotageInvestigationStarted=true;
      this.completeRequired('opening');
      this.completeRequired('sabotageInvestigationStarted');
      this.mode='hub';this.battle.phase='play';
      this.updateObjective();
      this.toast('MAIN OBJECTIVE','INVESTIGATE THE TOURNAMENT SABOTAGE','Inspect the damaged arena before the repair crews replace the evidence.');
    });
  }
  updateExploration(){
    const player=this.battle.fighters[0];
    if(this.mode==='interior')clampInteriorPlayer(player,this.interiorId);
    if(this.area==='hub'&&this.mode!=='interior'){
      resolveExteriorBuildingCollision(player,['tournament-admin','tournament-medical','tournament-backstage']);
      const district=[...HUB_DISTRICTS].sort((a,b)=>distance(player,a)-distance(player,b))[0];
      if(district&&district.id!==this.currentDistrict&&distance(player,district)<420){
        this.currentDistrict=district.id;if(!this.replayMode)saveLostYearProgress(recordWorldVisit(loadLostYearProgress(),'tournament',this.connectedZoneId(),{entrance:'after-hours-walk'}));recordPacingVisit(this.pacing,district.id);
        const wasReady=this.pacing.orientationComplete;
        if(!wasReady&&completePacingOrientation('chapter3',this.pacing)){
          setRpgPacingPhase(this.pacing,'development',{wave:1});
          this.toast('INVESTIGATION CONTEXT','THE CLOSED GROUNDS ARE DIFFERENT NOW','Repair crews are replacing evidence. Inspect the damaged arena while it is still readable.');
          document.dispatchEvent(new CustomEvent('pxstorybanter',{detail:{onceKey:'c3-orientation-complete',lines:[['RRVVFO','The tournament feels different when nobody is cheering.'],['RRVVFO','And somebody used that noise to hide what they did.']]}}));
        }
        this.syncRpgPacing();this.saveState();this.updateObjective();this.showAreaTitle(district.name,'AFTER-HOURS TOURNAMENT');
      }
      if(this.aftermathSeconds>0){const before=this.aftermathSeconds;this.aftermathSeconds=Math.max(0,this.aftermathSeconds-1/60);if(before>0&&this.aftermathSeconds===0)this.updateObjective()}
    }
    const candidates=this.availableInteractions().filter(item=>distance(player,item)<145);
    this.nearby=candidates.sort((a,b)=>distance(player,a)-distance(player,b))[0]||null;
    const prompt=this.root.querySelector('[data-c3-prompt]');
    prompt.hidden=!this.nearby;
    if(this.nearby){
      this.root.querySelector('[data-c3-prompt-title]').textContent=this.nearby.label;
      this.root.querySelector('[data-c3-prompt-detail]').textContent=this.engine.prompt('interact','E').toUpperCase();
    }
  }

  availableInteractions(){
    if(this.mode==='interior')return this.interiorInteractions();
    if(this.area==='remote')return[];
    if(this.area==='facility')return this.facilityInteractions();
    const next=chapter3NextRequired(this.state);
    const items=[];
    items.push({kind:'building-enter',buildingId:'tournament-admin',label:'ENTER TOURNAMENT ADMINISTRATION',x:-120,z:-490});
    items.push({kind:'building-enter',buildingId:'tournament-backstage',label:'ENTER FIGHTER BACKSTAGE',x:1010,z:-360});
    items.push({kind:'building-enter',buildingId:'tournament-medical',label:'ENTER MEDICAL CENTER',x:640,z:-430});

    if(['ringEvidence1Found','ringEvidence2Found','ringEvidence3Found','sabotageConfirmed'].includes(next)){
      for(const point of SABOTAGE_EVIDENCE_POINTS)if(!this.state.sabotageEvidence.includes(point.id))items.push({kind:'sabotage-evidence',label:`INSPECT • ${point.label}`,x:point.x,z:point.z,point});
    }
    if(['workerQuestioned','securityQuestioned','medicalWorkerFirstConversationComplete'].includes(next)){
      for(const witness of SABOTAGE_WITNESSES)if(!this.state.witnesses[witness.id])items.push({kind:'sabotage-witness',label:witness.label,x:witness.x,z:witness.z,witness});
    }
    if(next==='strangeManWarningSeen')items.push({kind:'strange-man',label:'QUESTION THE STRANGE MAN',x:STRANGE_MAN_POINT.x,z:STRANGE_MAN_POINT.z});
    if(next==='strangeManHatCollected')items.push({kind:'strange-man-hat',label:'PICK UP THE STRANGE MAN’S HAT',x:STRANGE_MAN_POINT.x,z:STRANGE_MAN_POINT.z});
    if(next==='maintenanceInvestigationStarted')items.push({kind:'maintenance-entry',label:'INVESTIGATE TOURNAMENT MAINTENANCE',x:EAST_SUPPORT_CLUE.x,z:EAST_SUPPORT_CLUE.z});
    if(next==='hiddenInfrastructureFound')items.push({kind:'enter-facility',label:'DESCEND INTO TOURNAMENT MAINTENANCE',x:MAINTENANCE_ENTRY_POINT.x,z:MAINTENANCE_ENTRY_POINT.z});

    const optionalWave=rpgPacingQuestWave(this.pacing),waveOne=new Set(['oneLastMatch','finalAnnouncement','lateFan','medicalFollowup']),waveTwo=new Set(['unpaidSnacks','poukiEquipment','fakePloukes']),waveThree=new Set(['prizeEnvelope','cleanupEchoes','controlledFlame']);
    for(const quest of CHAPTER3_OPTIONAL_QUESTS){
      if(optionalWave<1)continue;
      if(optionalWave===1&&!waveOne.has(quest.id))continue;
      if(optionalWave===2&&!waveOne.has(quest.id)&&!waveTwo.has(quest.id))continue;
      const saved=this.state.optional[quest.id];
      if(saved.complete)continue;
      if(quest.id==='medicalFollowup')continue;
      if(chapter3ReplacementActivity(quest.id))continue;
      if(['finalAnnouncement','cleanupEchoes','fakePloukes','lateFan'].includes(quest.id)&&saved.started){
        const source=OPTIONAL_MULTI_POINTS[quest.id]||[];
        const completed=quest.id==='finalAnnouncement'?this.state.optionalProgress.speakers:quest.id==='cleanupEchoes'?this.state.optionalProgress.cleanupFragments:quest.id==='fakePloukes'?this.state.optionalProgress.fakePloukes:this.state.optionalProgress.autographs;
        for(const point of source)if(!completed.includes(point.id))items.push({kind:'optional-multi',questId:quest.id,label:point.label,x:point.x,z:point.z,point});
      }else{
        const point=OPTIONAL_POINTS[quest.id];if(point)items.push({kind:'optional',questId:quest.id,label:`OPTIONAL • ${point.label}`,x:point.x,z:point.z});
      }
    }
    return items;
  }
  facilityInteractions(){
    const next=chapter3NextRequired(this.state);
    const map={
      hiddenInfrastructureFound:{kind:'maintenance-sweep',label:'INSPECT THE UNAUTHORIZED INFRASTRUCTURE',x:-720,z:0},
      sageTrailFound:{kind:'sage-trail',label:'FOLLOW THE DAMAGE THROUGH MAINTENANCE',x:-360,z:0},
      findSageObjectiveStarted:{kind:'sage-trail-confirm',label:'FOLLOW SAGE’S TRAIL DEEPER',x:-120,z:0},
      projectHollowFacilityEntered:{kind:'facility-threshold',label:'OPEN THE HIDDEN SECURITY DOOR',x:100,z:0},
      tournamentDataDiscovered:{kind:'tournament-data',label:'ACCESS THE TOURNAMENT DATA STATION',x:360,z:-120},
      projectHollowNameRevealed:{kind:'hollow-reveal',label:'OPEN THE CENTRAL IDENTITY FILE',x:560,z:160},
      realSageFound:{kind:'real-sage',label:'REACH THE FIGHTING AHEAD',x:760,z:0},
      facilityLockdownStarted:{kind:'lockdown',label:'SURVIVE THE FACILITY LOCKDOWN',x:820,z:180},
      teleporterEscapeStarted:{kind:'teleporter-escape',label:'REACH THE TELEPORTER ROOM',x:930,z:0},
      sageBlueCloneCreated:{kind:'teleporter-door',label:'GET THROUGH THE CLOSING DOOR',x:980,z:0},
      teleporterActivated:{kind:'teleporter',label:'LET THE BLUE CLONE START THE TELEPORTER',x:1035,z:0}
    };
    return map[next]?[map[next]]:[];
  }
  tryInteract(){
    if(!['hub','dungeon','interior'].includes(this.mode)||!this.nearby)return;
    const item=this.nearby;
    if(item.kind==='building-enter'){this.enterStoryInterior(item.buildingId);return}
    if(item.kind==='interior-exit'){this.exitStoryInterior();return}
    if(item.kind==='interior-actor'){this.useInteriorActor(item);return}
    const handlers={
      'sabotage-evidence':()=>this.inspectSabotageEvidence(item.point),
      'sabotage-witness':()=>this.questionSabotageWitness(item.witness),
      'strange-man':()=>this.beginStrangeManWarning(),
      'strange-man-hat':()=>this.collectStrangeManHat(),
      'maintenance-entry':()=>this.investigateMaintenanceEntry(),
      'enter-facility':()=>this.confirmFacilityEntry(),
      optional:()=>this.startOptionalQuest(item.questId),
      'optional-multi':()=>this.advanceOptionalMulti(item.questId,item.point),
      'maintenance-sweep':()=>this.inspectHiddenInfrastructure(),
      'sage-trail':()=>this.inspectSageTrail(),
      'sage-trail-confirm':()=>this.commitFindSageObjective(),
      'facility-threshold':()=>this.enterHiddenFacilityThreshold(),
      'tournament-data':()=>this.inspectTournamentData(),
      'hollow-reveal':()=>this.revealProjectHollow(),
      'real-sage':()=>this.findRealSage(),
      lockdown:()=>this.beginLockdownFight(),
      'teleporter-escape':()=>this.beginTeleporterEscape(),
      'teleporter-door':()=>this.startDoorSequence(),
      teleporter:()=>this.activateTeleporter()
    };
    handlers[item.kind]?.();
  }
  beginMedicalLead(){this.beginMedicalWitness()}

  beginMedicalWitness(){
    if(!this.state.sabotageConfirmed||this.state.witnesses.medical)return;
    this.showDialogue([
      {speaker:'MEDICAL WORKER',speakerClass:'neutral',text:'Plouke never came to the medical tent after his fight. I saw him heading toward maintenance instead.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Why the hell was he going down there?',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...He probably noticed something too.',tail:'down'}
    ],()=>{
      this.state.witnesses.medical=true;
      this.addEvidence('medicalTestimony');
      this.completeRequired('medicalWorkerFirstConversationComplete');
      this.mode=this.interiorId?'interior':'hub';this.battle.phase='play';
      this.updateObjective();this.saveState();
    });
  }
  showMedicalSort(){
    // Legacy 40.6/40.7 saves may still call this helper. The old equipment-fetch
    // gate was removed by the sabotage rewrite; redirect directly to the witness.
    this.beginMedicalWitness();
  }

  inspectSabotageEvidence(point){
    if(!point||this.state.sabotageEvidence.includes(point.id))return;
    const lines={
      support:[
        {speaker:'RRVVFO',speakerClass:'p1',text:'This support didn’t just crack. Somebody cut the load point before the match.',tail:'down'},
        {speaker:'REPAIR NOTE',speakerClass:'neutral',text:'FAILURE DIRECTION: FROM BELOW THE FIGHTING FLOOR.',tail:'down'}
      ],
      component:[
        {speaker:'RRVVFO',speakerClass:'p1',text:'This piece is wired into the ring, but it has no tournament serial number.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'So somebody added their own hardware.',tail:'down'}
      ],
      access:[
        {speaker:'MAINTENANCE PANEL',speakerClass:'neutral',text:'LOWER ACCESS OPENED DURING FINAL TOURNAMENT WINDOW.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Nobody was supposed to be under there during the fights.',tail:'down'}
      ]
    };
    this.showDialogue(lines[point.id]||[],()=>{
      this.state.sabotageEvidence=unique([...this.state.sabotageEvidence,point.id]);
      this.addEvidence(point.evidence);this.completeRequired(point.step);
      if(this.state.sabotageEvidence.length>=3&&!this.state.sabotageConfirmed){
        this.state.sabotageConfirmed=true;this.completeRequired('sabotageConfirmed');
        this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'Yeah. Someone definitely did this.',tail:'down'}],()=>{this.mode='hub';this.battle.phase='play';this.updateObjective();this.saveState()});
        return;
      }
      this.mode='hub';this.battle.phase='play';this.updateObjective();this.saveState();
    });
  }

  questionSabotageWitness(witness){
    if(!witness||this.state.witnesses[witness.id])return;
    const lines=witness.id==='worker'?
      [
        {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'I saw somebody moving equipment around the maintenance areas during the tournament. Didn’t recognize them.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'So somebody was working down there while we were fighting.',tail:'down'}
      ]:[
        {speaker:'SECURITY',speakerClass:'neutral',text:'Nobody was officially authorized to enter the lower maintenance sections during the tournament.',tail:'down'},
        {speaker:'SECURITY',speakerClass:'neutral',text:'The access log still says someone opened them.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That’s useful and also terrible.',tail:'down'}
      ];
    this.showDialogue(lines,()=>{
      this.state.witnesses[witness.id]=true;this.addEvidence(witness.evidence);this.completeRequired(witness.step);
      this.mode='hub';this.battle.phase='play';this.updateObjective();this.saveState();
    });
  }
  beginStrangeManWarning(){
    if(chapter3NextRequired(this.state)!=='strangeManWarningSeen')return;
    this.showDialogue([
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'You’re wasting your time.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Who are you?',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'The people you’re talking to aren’t the real people.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'What’s that supposed to mean?',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'Speak to the medical worker again.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I already did.',tail:'down'},
      {speaker:'STRANGE MAN',speakerClass:'rival',text:'Then you should notice.',tail:'down'}
    ],()=>{
      this.state.strangeManWarningSeen=true;
      this.completeRequired('strangeManWarningSeen');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
    });
  }

  revisitMedicalWorker(){
    if(!this.state.strangeManWarningSeen||this.state.medicalWorkerRevisited)return;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'You said Plouke skipped the medical tent and went toward maintenance.',tail:'down'},
      {speaker:'MEDICAL WORKER',speakerClass:'neutral',text:'Plouke?',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...Yeah.',tail:'down'},
      {speaker:'MEDICAL WORKER',speakerClass:'neutral',text:'I’ve never treated or spoken to anyone named Plouke.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You literally told me that a few minutes ago.',tail:'down'},
      {speaker:'MEDICAL WORKER',speakerClass:'neutral',text:'I think you have me confused with someone else.',tail:'down'}
    ],()=>{
      this.state.medicalWorkerRevisited=true;this.addEvidence('medicalContradiction');
      this.completeRequired('medicalWorkerRevisited');
      this.mode=this.interiorId?'interior':'hub';this.battle.phase='play';this.updateObjective();this.saveState();
    });
  }
  collectStrangeManHat(){
    if(chapter3NextRequired(this.state)!=='strangeManHatCollected')return;
    this.state.strangeManHatCollected=true;
    this.state.keyItems=unique([...(this.state.keyItems||[]),STRANGE_MAN_HAT.id]);
    this.completeRequired('strangeManHatCollected');
    this.showDialogue([
      {speaker:'NARRATION',speakerClass:'neutral',text:'The Strange Man is gone. No footprints lead away, no route is obvious, and nearby workers insist they never saw anyone standing here.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You warn me about fake people, vanish, and leave your hat?',tail:'down'}
    ],()=>this.showTask({
      kicker:'KEY ITEM ACQUIRED',
      title:STRANGE_MAN_HAT.name.toUpperCase(),
      text:STRANGE_MAN_HAT.description,
      buttons:[
        {label:'USE LENS OF TRUTH',value:'lens',detail:'Scratch Rrvvfo’s eye and inspect the contradictory possibilities.'},
        {label:'CONTINUE INVESTIGATION',value:'continue',detail:'Keep the hat and follow the changed medical-worker clue.'}
      ],
      onChoose:value=>{
        this.mode='hub';this.battle.phase='play';
        if(value==='lens')this.inspectStrangeManHatWithLens();
        else this.updateObjective();
      }
    }));
  }

  inspectStrangeManHatWithLens(){
    if(!this.state.strangeManHatCollected||this.state.strangeManHatLensInspected||this.area!=='hub')return;
    const player=this.battle.fighters[0];
    player.visualAction='lensActivate';player.visualActionTime=.6;
    this.battle.burst(player.x,player.z,'#d4fbff',32,75);
    this.showDialogue([
      {speaker:'NARRATION',speakerClass:'neutral',text:'Rrvvfo scratches his right eye three times and activates the unstable Lens of Truth over the Strange Man’s hat.',tail:'down'}
    ],()=>this.runHatLensContradictions());
  }

  runHatLensContradictions(){
    this.clearLensContradictionTimers();
    this.mode='lens-hat';this.battle.phase='story';
    const panel=this.root.querySelector('[data-c3-lens-contradiction]');
    const text=this.root.querySelector('[data-c3-lens-possibility]');
    const possibilities=[
      'THE STRANGE MAN WALKS TO THE LEFT.',
      'THE STRANGE MAN WALKS TO THE RIGHT.',
      'THE STRANGE MAN SUDDENLY DISAPPEARS.',
      'THE HAT WAS ALREADY THERE BEFORE RRVVFO SPOKE TO HIM.',
      'THE STRANGE MAN WAS NEVER STANDING THERE.'
    ];
    panel.hidden=false;this.root.classList.add('c3LensDistorting');
    possibilities.forEach((possibility,index)=>{
      const timer=setTimeout(()=>{
        if(this.aborted)return;
        text.textContent=possibility;
        panel.dataset.phase=String(index%3);
      },index*540);
      this.lensContradictionTimers.push(timer);
    });
    this.lensContradictionTimers.push(setTimeout(()=>{
      if(this.aborted)return;
      panel.hidden=true;delete panel.dataset.phase;this.root.classList.remove('c3LensDistorting');
      this.state.strangeManHatLensInspected=true;this.saveState();
      this.mode='hub';this.battle.phase='play';this.updateLensAvailability();
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'Great. Even my eye doesn’t know what happened.',tail:'down'}
      ],()=>{this.mode='hub';this.battle.phase='play';this.updateObjective()});
    },possibilities.length*540+420));
  }

  clearLensContradictionTimers(){
    for(const timer of this.lensContradictionTimers||[])clearTimeout(timer);
    this.lensContradictionTimers=[];
  }

  investigateMaintenanceEntry(){
    if(chapter3NextRequired(this.state)!=='maintenanceInvestigationStarted')return;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Okay.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Someone rigged the tournament.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'People keep changing their stories.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And the Sage went toward maintenance.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah. I’m checking maintenance.',tail:'down'}
    ],()=>{
      this.state.maintenanceInvestigationStarted=true;this.completeRequired('maintenanceInvestigationStarted');
      this.mode='hub';this.battle.phase='play';this.updateObjective();this.saveState();
    });
  }

  // Compatibility alias for any stale interaction restored from an older build.
  investigateEastSupportClue(){this.investigateMaintenanceEntry()}
  connectedRegionId(){return this.area==='facility'?'resonance':this.area==='remote'?'echo':'tournament'}
  interiorInteractions(){
    const exit=interiorExitPoint(this.interiorId),actors=interiorActorPoints(this.interiorId);return[exit,...actors].filter(Boolean);
  }

  enterStoryInterior(buildingId){
    const building=buildingDefinition(buildingId);if(!building)return;
    const player=this.battle.fighters[0];this.interiorReturn={area:this.area,spawn:{x:player.x,z:player.z},district:this.currentDistrict};this.interiorId=buildingId;this.mode='interior';this.battle.phase='play';this.currentFight=null;
    player.reset(building.entry.spawn.x,building.entry.spawn.z);player.en=Math.max(45,player.en);player.guard=Math.max(70,player.guard);this.hideSecondFighter();snapHubCamera(this.battle,player,{distance:760});
    if(!this.replayMode){let progress=loadLostYearProgress();progress=recordInteriorVisit(progress,buildingId,{regionId:building.region,zoneId:building.zone,entrance:'front-door'});saveLostYearProgress(progress)}
    this.map?.setLocalArea({title:buildingMapTitle(buildingId),bounds:interiorBounds(buildingId)});this.engine.setLabels({stageName:building.label,chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO','']});this.showAreaTitle(building.label,'ENTERABLE INTERIOR');this.battle.notice('INTERIOR • EXPLORE OR RETURN THROUGH THE DOOR',1.2);this.updateObjective();
  }

  exitStoryInterior(){
    if(!this.interiorId)return;const building=buildingDefinition(this.interiorId),back=this.interiorReturn||{},spawn=building?.entry?.returnSpawn||back.spawn||HUB_SPAWN;this.interiorId='';this.mode='hub';this.area=back.area||'hub';this.currentDistrict=back.district||this.currentDistrict;this.preparePlayer(spawn);this.map?.setRegion('tournament',this.connectedZoneId());this.engine.setLabels({stageName:'AFTER-HOURS TOURNAMENT',chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO','']});this.battle.notice('BACK OUTSIDE',.8);this.updateObjective();
  }

  useInteriorActor(actor){
    if(this.interiorId==='tournament-medical'&&actor.id==='medical-worker'){
      if(this.state.sabotageConfirmed&&!this.state.witnesses.medical){this.beginMedicalWitness();return}
      if(this.state.strangeManWarningSeen&&!this.state.medicalWorkerRevisited){this.revisitMedicalWorker();return}
      const followup=this.state.optional?.medicalFollowup;
      const followupAvailable=(rpgPacingQuestWave(this.pacing)>=1)&&this.state.witnesses.medical&&!followup?.complete;
      if(followupAvailable){this.startOptionalQuest('medicalFollowup');return}
    }
    const line=interiorLifeLine(this.interiorId,actor.id,{chapter:3,phase:this.pacing?.phase||''});this.showDialogue([{speaker:actor.label||'TOURNAMENT STAFF',speakerClass:'neutral',text:line,tail:'down'}],()=>{this.mode='interior';this.battle.phase='play'});
  }
  connectedZoneId(){
    if(this.mode==='interior'&&this.interiorId)return buildingDefinition(this.interiorId)?.zone||'central';
    if(this.area==='remote')return'lowerTrail';
    if(this.area==='facility'){
      const next=chapter3NextRequired(this.state);
      if(['hiddenInfrastructureFound','sageTrailFound','findSageObjectiveStarted'].includes(next))return'maintenance';
      if(['projectHollowFacilityEntered','tournamentDataDiscovered'].includes(next))return'corridor';
      if(['projectHollowNameRevealed','realSageFound'].includes(next))return'records';
      if(['facilityLockdownStarted','teleporterEscapeStarted'].includes(next))return'core';
      return'teleporter';
    }
    const map={arena:'stadium',vendor:'market',camp:'practice',medical:'medical',office:'registration',bracket:'backstage',media:'service',storage:'service',security:'security',staff:'backstage',elevator:'stadium'};return map[this.currentDistrict]||'central';
  }
  updateLensAvailability(){
    const canInspectHat=this.area==='hub'&&this.state.strangeManHatCollected&&!this.state.strangeManHatLensInspected;
    this.engine?.setHotbarAvailability(canInspectHat?[4]:[],{show:canInspectHat});
  }
  beginForgottenFighter(){
    this.showDialogue([
      {speaker:'EARLY CONTESTANT',speakerClass:'neutral',text:'My match is missing from the replay booth. It was my first real tournament, and nobody I know could attend.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'One missing recording does not explain a secret maintenance route.',tail:'down'},
      {speaker:'EARLY CONTESTANT',speakerClass:'neutral',text:'Thousands of people will remember your fights. For someone like me, one recording matters.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...Fine. Show me the booth.',tail:'down'}
    ],()=>{
      this.state.recordingStep=1;this.state.optional.oneLastMatch.started=true;this.saveState();
      this.mode='hub';this.battle.phase='play';this.updateObjective();
    });
  }

  usePublicBooth(){
    this.showDialogue([
      {speaker:'PUBLIC REPLAY BOOTH',speakerClass:'neutral',text:'MATCH FILE NOT FOUND.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Every other match is here. This one was moved, not erased.',tail:'down'}
    ],()=>{
      this.state.recordingStep=2;this.state.mediaTerminals=unique([...this.state.mediaTerminals,'public']);this.saveState();
      this.mode='hub';this.battle.phase='play';this.updateObjective();
    });
  }

  reconstructSecurityFootage(){
    if((this.state.recordingStep||0)!==2)return;
    const variety=this.state.variety;discoverAdventureMission('c3-no-false-leads');
    if(variety.reconstructionComplete){this.restorePublicRecording();return}
    const index=variety.incidentSequence.length;
    const expected=nextIncidentStep(variety);
    const remaining=CHAPTER3_INCIDENT_ORDER.filter(step=>!variety.incidentSequence.includes(step));
    const offset=index%Math.max(1,remaining.length);
    const ordered=[...remaining.slice(offset),...remaining.slice(0,offset)].slice(0,3);
    if(!ordered.includes(expected))ordered[ordered.length-1]=expected;
    this.showTask({
      kicker:'MAIN INVESTIGATION • SECURITY OFFICE',
      title:'RECONSTRUCT THE INCIDENT',
      text:`Place event ${index+1} of ${CHAPTER3_INCIDENT_ORDER.length}. Wrong answers give a clue and keep your confirmed evidence.`,
      progress:variety.incidentSequence.join('  →  '),
      buttons:ordered.map(value=>({label:value,value,detail:value===expected?'Supported by the current evidence.':'Possible, but check what had to happen first.'})),
      onChoose:value=>{
        const result=recordIncidentStep(variety,value);this.saveState();
        if(!result.correct){
          const clues=['The energy reading exists before any staff movement.','Security had to be redirected before the false worker could enter.','The east support was entered before the ring system failed.','The failed support exposed the underground route.'];
          this.battle.notice(`ORDER CLUE • ${clues[index]||'FOLLOW THE EVIDENCE CHAIN'}`,2);
          this.mode='hub';this.battle.phase='play';setTimeout(()=>{if(!this.aborted)this.reconstructSecurityFootage()},250);return;
        }
        if(!result.complete){this.mode='hub';this.battle.phase='play';setTimeout(()=>{if(!this.aborted)this.reconstructSecurityFootage()},180);return}
        variety.persistentChanges=[...new Set([...(variety.persistentChanges||[]),'security-reconstruction-visible'])];
        this.state.mediaTerminals=unique([...this.state.mediaTerminals,'damaged-a','damaged-b','private']);
        this.state.recordingStep=4;this.saveState();if((variety.incidentMistakes||0)===0)completeAdventureMission('c3-no-false-leads',{rank:'S',reward:'TITLE • CASE CLOSED'});
        this.toast('DEDUCTION COMPLETE','THE INCIDENT HAS AN ORDER','The security terminal now displays the full five-event reconstruction.');
        this.restorePublicRecording();
      }
    });
  }

  restoreMediaTerminal(id){
    this.state.mediaTerminals=unique([...this.state.mediaTerminals,id]);
    this.battle.burst(this.nearby.x,this.nearby.z,'#79d7ff',18,60);
    this.toast('REPLAY SYSTEM',id==='damaged-a'?'TIMING INDEX RESTORED':'VIDEO ROUTE RESTORED',`${this.state.mediaTerminals.filter(entry=>entry.startsWith('damaged')).length} / 2 terminals repaired.`);
    if(this.state.mediaTerminals.includes('damaged-a')&&this.state.mediaTerminals.includes('damaged-b'))this.state.recordingStep=3;
    this.saveState();this.updateObjective();
  }

  enterPrivateBooth(){
    this.showDialogue([
      {speaker:'PRIVATE DATA BOOTH',speakerClass:'neutral',text:'Attack timing. Energy output. Injuries. Recovery time. Reactions under pressure. Movement patterns.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Whoever moved this recording did not care who the fighter was. They cared how the fighter failed.',tail:'down'},
      {speaker:'PRIVATE DATA BOOTH',speakerClass:'neutral',text:'PARTIAL PROFILES: RRVVFO. WADE. BARK. POUKI. PLOUKE.',tail:'down'}
    ],()=>{
      this.state.recordingStep=4;this.state.mediaTerminals=unique([...this.state.mediaTerminals,'private']);this.saveState();
      this.mode='hub';this.battle.phase='play';this.updateObjective();
    });
  }

  restorePublicRecording(){
    this.showDialogue([
      {speaker:'EARLY CONTESTANT',speakerClass:'neutral',text:'There. That is enough. Now the match actually happened somewhere besides my memory.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'It also happened inside a hidden combat database. I am going to deal with that part.',tail:'down'}
    ],()=>{
      this.state.mediaTerminals=unique([...this.state.mediaTerminals,'restored']);
      this.addEvidence('copiedRecords');
      this.completeRequired('fighterNobodyRecorded');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('REQUIRED STORY COMPLETE','THE FIGHTER NOBODY RECORDED','Public recording restored. Private data booth unlocked.');
    });
  }

  beginBracketPuzzle(){
    const index=this.state.bracketSequence.length;
    if(index>=CHAPTER3_BRACKET_ORDER.length){
      this.finishBracketPuzzle();return;
    }
    const remaining=CHAPTER3_BRACKET_ORDER.filter(match=>!this.state.bracketSequence.includes(match));
    this.showTask({
      kicker:'MAIN INVESTIGATION • BRACKET ROOM',
      title:'RESTORE THE REAL MATCH ORDER',
      text:`Place match ${index+1} of ${CHAPTER3_BRACKET_ORDER.length}. A wrong entry resets only this puzzle.`,
      progress:this.state.bracketSequence.join('  →  '),
      buttons:remaining.map(match=>({label:match,value:match})),
      onChoose:value=>{
        if(value!==CHAPTER3_BRACKET_ORDER[index]){
          this.state.bracketSequence=[];
          this.saveState();
          this.battle.notice('BRACKET ORDER INCORRECT • TRY AGAIN',1.4);
        }else this.state.bracketSequence.push(value);
        this.saveState();this.beginBracketPuzzle();
      }
    });
  }

  finishBracketPuzzle(){
    this.showDialogue([
      {speaker:'BRACKET TERMINAL',speakerClass:'neutral',text:'TEMPORARY MAINTENANCE CREDENTIALS ACCESSED MATCH ORDER, ABILITIES, INJURY DATA, AND ENERGY READINGS.',tail:'down'},
      {speaker:'BRACKET WORKER',speakerClass:'neutral',text:'No employee photograph. The name changes between screens. Nobody hired this person.',tail:'down'},
      {speaker:'SECURITY SYSTEM',speakerClass:'rival',text:'UNAUTHORIZED BADGE DETECTED. STAFF DISTRICT LOCKDOWN ACTIVE.',tail:'down'}
    ],()=>{
      this.completeRequired('bracketRecords');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('MAIN OBJECTIVE','LOCKED ON THE NIGHT SHIFT','Reach the trapped workers through the alternate staff route.');
    });
  }

  advanceNightRoute(point){
    const expected=NIGHT_ROUTE[this.state.nightRouteIndex];
    if(!expected||point.id!==expected.id)return;
    this.battle.burst(point.x,point.z,'#ffd557',18,65);
    this.state.nightRouteIndex++;
    this.saveState();
    if(this.state.nightRouteIndex<NIGHT_ROUTE.length){
      this.toast('TRAVERSAL ROUTE',point.label,`${this.state.nightRouteIndex} / ${NIGHT_ROUTE.length} checkpoints reached.`);
      this.updateObjective();return;
    }
    this.showDialogue([
      {speaker:'CLEANUP WORKER',speakerClass:'neutral',text:'That unfamiliar employee changed the locks, asked about underground generators, and only worked when everyone else left.',tail:'down'},
      {speaker:'SECURITY WORKER',speakerClass:'neutral',text:'The camera is gone. The terminal is wiped. This badge has no stable name or photograph.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'But it has a map leading under the arena.',tail:'down'}
    ],()=>{
      this.state.staffShortcut=true;this.state.rewards.staffShortcut=true;
      if(!this.replayMode)saveLostYearProgress(discoverWorldShortcut(loadLostYearProgress(),'c3-service-cut'));
      discoverWorldDelight('c3-night-service');
      this.addEvidence('falseBadge');
      this.completeRequired('lockedNightShift');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('REQUIRED STORY COMPLETE','LOCKED ON THE NIGHT SHIFT','Workers freed. Staff shortcut permanently opened.');
    });
  }

  beginRingEvidenceSweep(){
    const remaining=RING_COLLECTORS.filter(point=>!this.state.ringCollectors.includes(point.id));
    if(!remaining.length){this.finishRingEvidenceSweep();return}
    this.showTask({
      kicker:'INVESTIGATION BOARD • CRACKED RING',
      title:'COMPARE THE THREE ENERGY COLLECTORS',
      text:`Use the recovered ring scan instead of running between supports. ${this.state.ringCollectors.length} / ${RING_COLLECTORS.length} compared.`,
      progress:this.state.ringCollectors.map(id=>RING_COLLECTORS.find(point=>point.id===id)?.label).filter(Boolean).join('  •  '),
      buttons:remaining.map(point=>({label:point.label,value:point.id,detail:'Compare residue, timing, and mounting marks.'})),
      onChoose:id=>{
        const point=RING_COLLECTORS.find(entry=>entry.id===id);if(!point)return;
        this.state.ringCollectors=unique([...this.state.ringCollectors,id]);this.battle.burst(point.x,point.z,'#8fe8ff',20,55);this.saveState();
        if(this.state.ringCollectors.length<RING_COLLECTORS.length)this.beginRingEvidenceSweep();else this.finishRingEvidenceSweep();
      }
    });
  }

  finishRingEvidenceSweep(){
    this.showDialogue([
      {speaker:'RING MECHANIC',speakerClass:'neutral',text:'Bark and Pouki did not cause all of this. These devices were attached to the supports before their match.',tail:'down'},
      {speaker:'RING MECHANIC',speakerClass:'neutral',text:'Every major attack fed energy into them. The largest overload came from your beam clash with Plouke.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Great. Now the eye decides when we are working.',tail:'down'}
    ],()=>{
      this.battle.burst(this.battle.fighters[0].x,this.battle.fighters[0].z,'#d4fbff',34,75);this.addEvidence('ringCollector');this.completeRequired('crackedRing');
      this.mode='hub';this.battle.phase='play';this.updateObjective();this.toast('EVIDENCE BOARD UPDATED','HIDDEN RING COLLECTORS','All three support scans were compared without another lap around the stadium.');
    });
  }

  beginBagEvidenceBoard(){
    const remaining=BAG_SEARCH.filter(point=>!this.state.bagLocations.includes(point.id));
    if(!remaining.length){this.finishBagEvidenceBoard();return}
    const notes={costume:'Heavy bag collected by costume staff.','lost-found':'Fake moustache and mislabeled costume parts.',vendor:'Food debt and a rushed departure.',cart:'Capes and cleanup inventory were mixed together.',impersonators:'The fake Ploukes copied the costume, not the equipment.'};
    this.showTask({
      kicker:'INVESTIGATION BOARD • PLOUKE’S BAG',
      title:'CROSS-CHECK THE REMAINING LEADS',
      text:`Review witness notes from one evidence board instead of crossing the plaza five times. ${this.state.bagLocations.length} / ${BAG_SEARCH.length} checked.`,
      progress:this.state.bagLocations.map(id=>BAG_SEARCH.find(point=>point.id===id)?.label).filter(Boolean).join('  •  '),
      buttons:remaining.map(point=>({label:point.label,value:point.id,detail:notes[point.id]})),
      onChoose:id=>{this.state.bagLocations=unique([...this.state.bagLocations,id]);this.saveState();if(this.state.bagLocations.length<BAG_SEARCH.length)this.beginBagEvidenceBoard();else this.finishBagEvidenceBoard()}
    });
  }

  finishBagEvidenceBoard(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Food. Cheap facial hair. Costume pieces. False credentials. Magazines. Tangai’s credit card.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'This is your advanced investigation equipment?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'The food maintained my energy.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And Tangai’s credit card?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Maintained the food.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'The detector is the part currently pointing at the elevator.',tail:'down'}
    ],()=>{
      this.state.detector=true;this.addEvidence('energyDetector');this.completeRequired('ploukeBag');this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('EVIDENCE BOARD UPDATED','PLOUKE’S BAG LOCATED','The witness notes now point directly to the Strange Man encounter.');
    });
  }

  inspectRingCollector(point){
    this.state.ringCollectors=unique([...this.state.ringCollectors,point.id]);
    this.battle.burst(point.x,point.z,'#8fe8ff',20,55);
    this.saveState();
    if(this.state.ringCollectors.length<3){
      this.toast('HIDDEN COLLECTOR FOUND',point.label,`${this.state.ringCollectors.length} / 3 collector locations identified.`);
      this.updateObjective();return;
    }
    this.showDialogue([
      {speaker:'RING MECHANIC',speakerClass:'neutral',text:'Bark and Pouki did not cause all of this. These devices were attached to the supports before their match.',tail:'down'},
      {speaker:'RING MECHANIC',speakerClass:'neutral',text:'Every major attack fed energy into them. The largest overload came from your beam clash with Plouke.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Great. Now the eye decides when we are working.',tail:'down'}
    ],()=>{
      this.battle.burst(this.battle.fighters[0].x,this.battle.fighters[0].z,'#d4fbff',34,75);
      this.addEvidence('ringCollector');
      this.completeRequired('crackedRing');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('LENS OF TRUTH','INVOLUNTARY ENERGY TRAIL','The trail points toward the maintenance elevator, but it is incomplete.');
    });
  }

  searchBagLocation(point){
    this.state.bagLocations=unique([...this.state.bagLocations,point.id]);
    const lines={
      costume:'Costume staff collected a heavy bag because they thought Plouke’s entire identity was tournament property.',
      'lost-found':'Only one fake moustache. Somehow not the correct fake moustache.',
      vendor:'The vendor remembers Plouke leaving with food and without paying.',
      cart:'The cleanup cart contains three capes and absolutely no explanation.',
      impersonators:'The impersonators have better costume stitching than the Sage.'
    };
    this.toast('BAG SEARCH',point.label,lines[point.id]);
    this.saveState();
    if(this.state.bagLocations.length<5){this.updateObjective();return}
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Food. Cheap facial hair. Costume pieces. False credentials. Magazines. Tangai’s credit card.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'This is your advanced investigation equipment?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'The food maintained my energy.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And Tangai’s credit card?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Maintained the food.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'The detector is the part currently pointing at the elevator.',tail:'down'}
    ],()=>{
      this.state.detector=true;
      this.addEvidence('energyDetector');
      this.completeRequired('ploukeBag');
      this.mode='hub';this.battle.phase='play';this.updateObjective();
      this.toast('MAIN INVESTIGATION','A STRANGE WARNING','A lone man is waiting away from the remaining tournament workers.');
    });
  }

  useInvestigationLens(){
    // The old mandatory detector trail was removed. Lens remains optional on
    // the Strange Man’s hat so it deepens the mystery without gating progress.
    if(this.state.strangeManHatCollected&&!this.state.strangeManHatLensInspected)this.inspectStrangeManHatWithLens();
  }
  sageExplanation(){
    // Compatibility alias: Sage is no longer confronted before maintenance.
    // Rrvvfo follows sabotage evidence first and finds the real Sage underground.
    this.investigateMaintenanceEntry();
  }
  async confirmFacilityEntry(){
    const enter=await storyConfirm({
      title:'DESCEND INTO TOURNAMENT MAINTENANCE?',
      message:'This advances the sabotage investigation beneath the arena. Unfinished tournament side content remains available through Chapter Replay.',
      confirmLabel:'DESCEND',
      cancelLabel:'KEEP EXPLORING'
    });
    if(enter)this.enterFacility();
    else{this.mode='hub';this.battle.phase='play'}
  }

  startOptionalQuest(id){
    const quest=CHAPTER3_OPTIONAL_QUESTS.find(entry=>entry.id===id);
    const saved=this.state.optional[id];if(!quest||saved.complete)return;
    saved.started=true;this.saveState();
    if(id==='oneLastMatch'){
      this.showDialogue([
        {speaker:'EARLY CONTESTANT',speakerClass:'neutral',text:'One unofficial match before the practice area closes. I do not need a trophy. I need one fight people might remember.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Then make me remember it.',tail:'down'}
      ],()=>this.startFight({kind:'optional',id:'forgotten-fighter',name:'Early Contestant',hpScale:.88,xp:85,optionalQuest:id}));
      return;
    }
    if(chapter3ReplacementActivity(id)){this.runReplacementQuest(id);return}
    if(id==='controlledFlame'){this.showFlameTask();return}
    const scenes={
      unpaidSnacks:[
        {speaker:'FOOD VENDOR',speakerClass:'neutral',text:'Plouke ordered enough food for a team and paid for none of it.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Of course he did. Put it on the list of things I’m yelling at him about when I find him.',tail:'down'}
      ],
      poukiEquipment:[
        {speaker:'POUKI',speakerClass:'neutral',text:'Part of my equipment disappeared after the Bark match.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'There is a miniature collector attached to it.',tail:'down'},
        {speaker:'DISTORTED RECORDING',speakerClass:'rival',text:'Record the recovery period. Power means nothing without the weakness after it.',tail:'down'}
      ],
      prizeEnvelope:[
        {speaker:'TOURNAMENT CASHIER',speakerClass:'neutral',text:'The prize envelope vanished during cleanup.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'The cleaning machine collected it with the flyers. For once, not a conspiracy.',tail:'down'}
      ],
      medicalFollowup:[
        {speaker:'MEDICAL WORKER',speakerClass:'neutral',text:'The repair crews found another unregistered component near the clinic wall. I logged it before anyone could move it.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Good. At least one thing around here remembers the same story twice.',tail:'down'}
      ]
    };
    this.showDialogue(scenes[id]||[{speaker:'RRVVFO',speakerClass:'p1',text:'One more tournament problem solved.',tail:'down'}],()=>this.finishOptionalQuest(id));
  }


  runReplacementQuest(id){
    const activity=chapter3ReplacementActivity(id);if(!activity)return;
    const configs={
      finalAnnouncement:{
        text:'The announcement desk has one live chain left. Which routing reaches the West Gate without sending the message through a dead speaker?',
        progress:'READ THE WIRES • One route keeps the message inside the public speaker loop.',
        buttons:[{label:'NORTH → CENTER → WEST GATE',value:'north-center-gate',primary:true},{label:'BACKSTAGE → MEDICAL → MARKET',value:'backstage'},{label:'SERVICE → LOCKER → EAST',value:'service'}]
      },
      cleanupEchoes:{
        text:'Three residual energy echoes remain. Two match the tournament ring rhythm. Which one belongs to the hidden service system instead?',
        progress:'COMPARE • Timing matters more than brightness.',
        buttons:[{label:'MAIN ARENA ECHO',value:'arena'},{label:'MARKET ECHO',value:'market'},{label:'SERVICE-TUNNEL ECHO',value:'service',primary:true}]
      },
      fakePloukes:{
        text:'All three costumes look convincing. Which behavior proves one of them is copying Plouke from crowd rumors instead of actually understanding him?',
        progress:'OBSERVE • Plouke controls position; he does not pose for attention.',
        buttons:[{label:'THE ONE WATCHING THE RING EDGE',value:'edge',primary:true},{label:'THE ONE STANDING STILL',value:'still'},{label:'THE ONE CHECKING HIS SHOES',value:'shoes'}]
      },
      lateFan:{
        text:'The public gates are closing. Which route gets the fan out without dragging them through the whole empty festival?',
        progress:this.state.staffShortcut?'STAFF SHORTCUT DISCOVERED • Use what you already learned.':'REMEMBER THE HUB • The West Gate route is still public.',
        buttons:[{label:'WEST GATE SHORTCUT',value:'west',primary:true},{label:'BACKSTAGE LOCKERS',value:'backstage'},{label:'UNDERGROUND SERVICE DOOR',value:'underground'}]
      }
    };
    const config=configs[id];if(!config)return;
    this.toast('OPTIONAL ACTIVITY',activity.title,'Solve the situation instead of following a chain of collection markers.');
    this.showTask({kicker:`OPTIONAL • ${activity.kind.toUpperCase()}`,title:activity.title,text:config.text,progress:config.progress,buttons:config.buttons,onChoose:value=>{
      if(value!==activity.correct){this.toast('NOT QUITE',activity.title,'That route creates more work. Read the scene and try another approach.');this.mode='hub';this.battle.phase='play';setTimeout(()=>{if(!this.aborted&&!this.state.optional[id]?.complete)this.runReplacementQuest(id)},220);return}
      this.state.optional[id].progress=1;this.saveState();this.finishOptionalQuest(id);
    }});
  }

  advanceOptionalMulti(id,point){
    const lists={
      finalAnnouncement:'speakers',
      cleanupEchoes:'cleanupFragments',
      fakePloukes:'fakePloukes',
      lateFan:'autographs'
    };
    const key=lists[id],collection=this.state.optionalProgress[key];
    if(!key||collection.includes(point.id))return;
    collection.push(point.id);this.state.optional[id].progress=collection.length;this.saveState();
    this.battle.burst(point.x,point.z,id==='cleanupEchoes'?'#8fe8ff':'#ffd557',18,60);
    const needed=(OPTIONAL_MULTI_POINTS[id]||[]).length;
    if(collection.length<needed){
      this.toast('OPTIONAL QUEST',CHAPTER3_OPTIONAL_QUESTS.find(quest=>quest.id===id)?.title||id,`${collection.length} / ${needed} objectives complete.`);
      return;
    }
    this.finishOptionalQuest(id);
  }

  showFlameTask(){
    const heat=this.state.optionalProgress.flameStability||0;
    if(heat>=3){this.finishOptionalQuest('controlledFlame');return}
    this.showTask({
      kicker:'OPTIONAL QUEST • CONTROLLED FLAME',
      title:'KEEP THE FLAME STABLE',
      text:`Hold the energy inside the safe range. ${heat} / 3 stable cycles.`,
      progress:'SAFE RANGE: MEDIUM • Too little collapses. Too much flares.',
      buttons:[
        {label:'LOWER OUTPUT',value:'low'},
        {label:'HOLD STEADY',value:'steady',primary:true},
        {label:'PUSH HARDER',value:'high'}
      ],
      onChoose:value=>{
        if(value==='steady')this.state.optionalProgress.flameStability++;
        else this.state.optionalProgress.flameStability=Math.max(0,this.state.optionalProgress.flameStability-1);
        this.saveState();this.showFlameTask();
      }
    });
  }

  finishOptionalQuest(id){
    const quest=CHAPTER3_OPTIONAL_QUESTS.find(entry=>entry.id===id);
    const saved=this.state.optional[id];if(!quest||saved.complete)return;
    saved.complete=true;saved.started=true;saved.rewardClaimed=true;
    if(id==='cleanupEchoes')this.state.rewards.echoResistance=true;
    if(id==='medicalFollowup')this.state.rewards.healingUpgrade=true;
    if(id==='controlledFlame')this.state.rewards.flameFocus=true;
    if(id==='finalAnnouncement')this.state.rewards.galleryRecording=true;
    if(!this.replayMode)addStoryXp(id==='oneLastMatch'?85:45,{source:quest.title});
    this.saveState();
    this.closeTask();
    // Clinic follow-up finishes where it started instead of teleporting the player back outside.
    this.mode=(id==='medicalFollowup'&&this.interiorId==='tournament-medical')?'interior':'hub';this.battle.phase='play';
    this.toast('OPTIONAL QUEST COMPLETE',quest.title,quest.reward);
    this.updateObjective();
  }

  enterFacility({restored=false}={}){
    if(!restored)discoverAdventureMission('c3-clean-entry');
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'facility'}));
    this.area='facility';this.state.location='facility';
    if(!this.replayMode)saveLostYearProgress(recordWorldVisit(loadLostYearProgress(),'resonance','maintenance',{entrance:'tournament-maintenance-elevator'}));
    this.map?.setRegion('resonance',this.connectedZoneId());
    this.switchStage('resonance-facility');
    this.mode='dungeon';this.currentFight=null;this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();
    this.battle.root.classList.add('storyChapter3Hub');this.battle.root.classList.remove('storyChapter3Combat');
    const hidden=this.state.projectHollowFacilityEntered;
    this.engine.setLabels({stageName:hidden?'HIDDEN UNDERGROUND FACILITY':'TOURNAMENT MAINTENANCE',chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO',hidden?'FACILITY':'']});
    const spawn=restored?this.facilityCheckpointSpawn():FACILITY_SPAWN;
    this.preparePlayer(spawn);this.syncRpgPacing();this.engine.setHotbarAvailability([],{show:false});
    this.showAreaTitle(hidden?'HIDDEN UNDERGROUND FACILITY':'TOURNAMENT MAINTENANCE',hidden?'UNAUTHORIZED INFRASTRUCTURE':'BENEATH THE ARENA');
    this.saveState();this.updateObjective();this.refreshTracker();
    if(restored){
      const resumeStep=chapter3NextRequired(this.state);
      if(resumeStep==='rrvvfoEnteredTeleporterRoom'){
        this.state.rrvvfoEnteredTeleporterRoom=true;this.completeRequired('rrvvfoEnteredTeleporterRoom');
        setTimeout(()=>{if(!this.aborted)this.resumeBlueCloneSequence()},180);
      }else if(['blueCloneIdentityRevealed','blueCloneLessonSeen','blueCloneTechniqueFoundationLearned'].includes(resumeStep)){
        setTimeout(()=>{if(!this.aborted)this.resumeBlueCloneSequence()},180);
      }
    }
    if(!restored)this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Repair rooms. Storage. Utility lines. This part actually looks like tournament maintenance.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Which means whatever doesn’t belong should stand out.',tail:'down'}
    ],()=>{this.mode='dungeon';this.battle.phase='play'});
  }
  facilityCheckpointSpawn(){
    const next=chapter3NextRequired(this.state);
    if(['sageBlueCloneCreated','rrvvfoEnteredTeleporterRoom','blueCloneIdentityRevealed','blueCloneLessonSeen','blueCloneTechniqueFoundationLearned','teleporterActivated','blueCloneDisappeared'].includes(next))return{x:900,z:0};
    if(['facilityLockdownStarted','teleporterEscapeStarted'].includes(next))return{x:760,z:100};
    if(['projectHollowNameRevealed','realSageFound'].includes(next))return{x:520,z:120};
    if(['projectHollowFacilityEntered','tournamentDataDiscovered'].includes(next))return{x:100,z:0};
    if(['sageTrailFound','findSageObjectiveStarted'].includes(next))return{x:-380,z:0};
    return FACILITY_SPAWN;
  }

  inspectHiddenInfrastructure(){
    if(chapter3NextRequired(this.state)!=='hiddenInfrastructureFound')return;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'These cables are newer than the tournament walls.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Hidden camera. Unmarked power line. Robot parts.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Somebody built into the tournament without the tournament knowing.',tail:'down'}
    ],()=>{this.state.hiddenInfrastructureFound=true;this.completeRequired('hiddenInfrastructureFound');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }

  inspectSageTrail(){
    if(chapter3NextRequired(this.state)!=='sageTrailFound')return;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'A busted surveillance robot... and that piece of fake Plouke fabric.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...Sage.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'So he found this place too.',tail:'down'}
    ],()=>{this.state.sageTrailFound=true;this.addEvidence('sageTrail');this.completeRequired('sageTrailFound');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }

  commitFindSageObjective(){
    if(chapter3NextRequired(this.state)!=='findSageObjectiveStarted')return;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Whatever this place is, Sage was moving deeper into it.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fine. I’ll follow the mess he left behind.',tail:'down'}
    ],()=>{this.state.findSageObjectiveStarted=true;this.completeRequired('findSageObjectiveStarted');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }

  enterHiddenFacilityThreshold(){
    if(chapter3NextRequired(this.state)!=='projectHollowFacilityEntered')return;
    this.showDialogue([
      {speaker:'SECURITY DOOR',speakerClass:'neutral',text:'TOURNAMENT CREDENTIALS NOT RECOGNIZED.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Because this isn’t tournament security.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Someone hid an entire second facility behind maintenance.',tail:'down'}
    ],()=>{
      this.state.projectHollowFacilityEntered=true;this.completeRequired('projectHollowFacilityEntered');
      completeAdventureMission('c3-clean-entry',{rank:'S',reward:'TITLE • CLEAN ENTRY'});
      this.engine.setLabels({stageName:'HIDDEN UNDERGROUND FACILITY',chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO','FACILITY']});
      this.showAreaTitle('HIDDEN UNDERGROUND FACILITY','SURVEILLANCE • ROBOT MAINTENANCE • FIGHTER DATA');
      this.mode='dungeon';this.battle.phase='play';this.map?.setRegion('resonance',this.connectedZoneId());this.updateObjective();this.saveState();
    });
  }

  inspectTournamentData(){
    if(chapter3NextRequired(this.state)!=='tournamentDataDiscovered')return;
    this.showDialogue([
      {speaker:'DATA TERMINAL',speakerClass:'neutral',text:'TOURNAMENT COMBAT DATA • ROUND ANALYSIS • FIGHTER RESPONSE RECORDS • ENERGY OBSERVATION.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'They were watching the fights...',tail:'down'},
      {speaker:'SECURITY UNIT',speakerClass:'rival',text:'UNAUTHORIZED OBSERVER DETECTED. RECORD RESPONSE PATTERN.',tail:'down'}
    ],()=>this.startFight({kind:'scanner',id:'hollow-scanner',name:'Project Hollow Scanner',hpScale:1.08,xp:150}));
  }

  revealProjectHollow(){
    if(chapter3NextRequired(this.state)!=='projectHollowNameRevealed')return;
    this.showDialogue([
      {speaker:'CENTRAL TERMINAL',speakerClass:'neutral',text:'ARENA SABOTAGE: COMPLETE. FIGHTER OBSERVATION: COMPLETE. HIGH-OUTPUT SUBJECTS: FLAGGED.',tail:'down'},
      {speaker:'CENTRAL TERMINAL',speakerClass:'rival',text:'PROJECT HOLLOW.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Project Hollow...',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'So this wasn’t just somebody cheating at a tournament.',tail:'down'}
    ],()=>{this.state.projectHollowNameRevealed=true;this.completeRequired('projectHollowNameRevealed');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }

  findRealSage(){
    if(chapter3NextRequired(this.state)!=='realSageFound')return;
    this.showDialogue([
      {speaker:'NARRATION',speakerClass:'neutral',text:'Ahead, the real Sage tears through Project Hollow units faster than the facility can replace them.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'SAGE!',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Took you long enough.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'YOU KNEW ABOUT THIS PLACE?!',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'For a little while.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'AND YOU DIDN’T TELL ME?!',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'You were busy.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I WAS LOOKING FOR WHO SABOTAGED THE TOURNAMENT!',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Then congratulations.',tail:'down'}
    ],()=>{this.state.realSageFound=true;this.completeRequired('realSageFound');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }

  beginLockdownFight(){
    if(chapter3NextRequired(this.state)!=='facilityLockdownStarted')return;
    this.showDialogue([
      {speaker:'FACILITY',speakerClass:'rival',text:'COMPROMISE CONFIRMED. LOCKDOWN. DATA EVACUATION. RESONANCE SUPPRESSION ACTIVE.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'They’re trying to trap you.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'They’re trying. Keep moving.',tail:'down'},
      {speaker:'NARRATION',speakerClass:'neutral',text:'Sage destroys the nearest units, but new shutters and suppression fields keep sealing routes around Rrvvfo.',tail:'down'}
    ],()=>this.startFight({kind:'lockdown-unit',id:'hollow-containment',name:'Hollow Containment Unit',hpScale:1.22,xp:190}));
  }

  beginTeleporterEscape(){
    if(chapter3NextRequired(this.state)!=='teleporterEscapeStarted')return;
    this.showDialogue([
      {speaker:'FACILITY',speakerClass:'rival',text:'TELEPORTER WING: FINAL EVACUATION ROUTE. SECURITY DOORS CLOSING.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'That room is your way out. Move.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You’re coming too.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Move first. Argue later.',tail:'down'}
    ],()=>{this.state.teleporterEscapeStarted=true;this.completeRequired('teleporterEscapeStarted');this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState()});
  }
  beginPowerPuzzle(){
    const order=['heat','security','records'];
    const index=this.state.underground.conduits.length;
    if(index>=order.length){
      this.completeRequired('auxiliaryPower');this.closeTask();this.mode='dungeon';this.battle.phase='play';this.updateObjective();return;
    }
    const buttons=[
      {label:'RED • HEAT ICON • TRIANGLE CONDUIT',value:'heat'},
      {label:'BLUE • SHIELD ICON • SQUARE CONDUIT',value:'security'},
      {label:'WHITE • FILE ICON • ROUND CONDUIT',value:'records'}
    ].filter(button=>!this.state.underground.conduits.includes(button.value));
    this.showTask({
      kicker:'UNDERGROUND MISSION • AUXILIARY POWER',
      title:'ROUTE ENERGY BY SYSTEM',
      text:`Connect heat, then security, then records. ${index} / 3 routed. Color, icon, and shape identify every line.`,
      buttons,
      onChoose:value=>{
        if(value!==order[index]){
          this.state.underground.conduits=[];
          this.battle.notice('POWER ROUTE RESET • FOLLOW SYSTEM ORDER',1.3);
        }else this.state.underground.conduits.push(value);
        this.saveState();
        if(this.state.underground.conduits.length===3){
          this.completeRequired('auxiliaryPower');this.closeTask();this.mode='dungeon';this.battle.phase='play';
          this.toast('UNDERGROUND MISSION COMPLETE','AUXILIARY POWER RESTORED','Laboratory corridor opened.');
          this.updateObjective();
        }else this.beginPowerPuzzle();
      }
    });
  }

  beginRecordedAttackPuzzle(){
    const patterns=[
      {id:'wade',label:'WADE • RAPID PROJECTILE',correct:'DODGE SIDEWAYS'},
      {id:'bark',label:'BARK • GROUND STRIKE',correct:'JUMP'},
      {id:'pouki',label:'POUKI • DELAYED BLAST',correct:'WAIT, THEN DASH'},
      {id:'rrvvfo',label:'RRVVFO • FIRE BLAST',correct:'BLOCK'},
      {id:'plouke',label:'PLOUKE • FALSE WARNING',correct:'DO NOT REACT'}
    ];
    const current=patterns.find(pattern=>!this.state.underground.recordedPatterns.includes(pattern.id));
    if(!current){
      this.completeRequired('recordedAttacks');this.closeTask();this.mode='dungeon';this.battle.phase='play';this.updateObjective();return;
    }
    const choices=unique([current.correct,'BLOCK','DODGE SIDEWAYS','JUMP','WAIT, THEN DASH','DO NOT REACT']).slice(0,4);
    if(!choices.includes(current.correct))choices[choices.length-1]=current.correct;
    this.showTask({
      kicker:'UNDERGROUND MISSION • RECORDED ATTACKS',
      title:current.label,
      text:'Choose the response that exploits the copied attack’s weakness. A mistake repeats only this pattern.',
      progress:`${this.state.underground.recordedPatterns.length} / ${patterns.length} patterns passed`,
      buttons:choices.map(choice=>({label:choice,value:choice})),
      onChoose:value=>{
        if(value!==current.correct){this.battle.notice('RECORDED ATTACK CONNECTED • RETRY',1.2);this.beginRecordedAttackPuzzle();return}
        this.state.underground.recordedPatterns.push(current.id);this.saveState();
        this.beginRecordedAttackPuzzle();
      }
    });
  }

  separateSage(){
    this.showDialogue([
      {speaker:'SECURITY SYSTEM',speakerClass:'rival',text:'DELETION PROTOCOL ACTIVE.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'The wall is routing me toward the deletion controls. Keep moving.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Useful advice this time?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'No promises.',tail:'down'}
    ],()=>{
      this.state.underground.separated=true;
      this.completeRequired('sageSeparated');
      this.mode='dungeon';this.battle.phase='play';this.updateObjective();
    });
  }

  startFight(config){
    const playerLevel=Math.max(1,Number(loadLostYearProgress().storyLevel)||1);
    this.currentFight={...config,elapsed:0,patternIndex:0,optionalQuest:config.optionalQuest||null};
    this.fightElapsed=0;this.lastFightPattern='';
    this.mode='fight';this.battle.phase='play';this.battle.hideBanner();this.battle.ringOutEnabled=false;this.battle.onRingOut=null;
    this.battle.root.classList.remove('storyChapter3Hub');this.battle.root.classList.add('storyChapter3Combat');
    const player=this.battle.fighters[0],foe=this.battle.fighters[1];
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(-420,70);void this.battle.ensureFighterAsset(player,'rrvvfo');
    applyStoryProgressionToFighter(player,loadLostYearProgress());player.en=75;player.guard=100;
    const hollow=['scanner','lockdown-unit'].includes(config.kind);
    foe.id=config.id;foe.name=config.name;foe.accent=hollow?'#74d7e4':config.kind==='echo'?'#72d9e7':'#a98c5e';foe.cpu=true;foe.visualScale=config.kind==='echo'?1.18:hollow?1.08:1;foe.reset(420,-70);foe.asset=null;
    applyStoryLevelToFighter(foe,playerLevel+(config.kind==='echo'?2:hollow?1:0));
    foe.maxHp=Math.round(foe.maxHp*(config.hpScale||1));foe.hp=foe.maxHp;foe.en=80;foe.guard=100;
    this.battle.beginBattleRank({fighterId:'rrvvfo',opponentId:foe.id,stageId:this.battle.stage.id,mode:'story'});
    if(config.kind==='echo'&&this.state.rewards.echoResistance)player.storyDefenseMultiplier*=.92;
    this.battle.time=9999;this.engine.setHotbarAvailability([1,2,3,4,5],{show:true});
    const labels={
      scanner:['SURVEILLANCE CHAMBER','BREAK THE SCANNER','It records repeated responses. Vary your approach before it settles into a defense.','PROJECT HOLLOW • OBSERVATION UNIT'],
      'lockdown-unit':['LOCKDOWN CORRIDOR','BREAK THROUGH THE CONTAINMENT UNIT','Sage is clearing the swarm outside. Defeat the unit sealing Rrvvfo’s route.','PROJECT HOLLOW • CONTAINMENT UNIT'],
      echo:['CENTRAL DEFENSE CHAMBER','DEFEAT THE UNFINISHED ECHO','Copied abilities preserve copied weaknesses. Force rapid pattern changes.','BOSS • THE UNFINISHED ECHO'],
      dummy:['FACILITY TRAINING CHAMBER','DEFEAT THE RUNAWAY TRAINING DUMMY','The dummy cycles through tournament patterns.','MINIBOSS • RUNAWAY TRAINING DUMMY'],
      optional:['AFTER-HOURS PRACTICE','WIN THE OPTIONAL MATCH','This fight is optional.','OPTIONAL MATCH']
    };
    const [stage,title,detail,notice]=labels[config.kind]||labels.dummy;
    this.engine.setLabels({stageName:stage,chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO',config.name.toUpperCase()]});
    this.setObjective(title,detail);this.battle.notice(notice,2);
  }
  updateFight(dt){
    if(!this.currentFight)return;
    this.fightElapsed+=dt;this.currentFight.elapsed=this.fightElapsed;
    const foe=this.battle.fighters[1];
    if(this.currentFight.kind==='scanner'){
      const phase=Math.floor(this.fightElapsed/5)%3;
      const label=['RECORDING MOVEMENT','RECORDING GUARD HABITS','RECORDING ATTACK TIMING'][phase];
      if(label!==this.lastFightPattern){this.lastFightPattern=label;this.battle.notice(`SCANNER • ${label}`,1.05)}
      return;
    }
    if(this.currentFight.kind==='lockdown-unit'){
      const label=Math.floor(this.fightElapsed/6)%2?'SUPPRESSION PULSE':'DOOR ANCHOR';
      if(label!==this.lastFightPattern){this.lastFightPattern=label;this.battle.notice(`CONTAINMENT • ${label}`,1.05)}
      return;
    }
    if(this.currentFight.kind==='dummy'){
      const pattern=['HAMUAL • BALANCED','DANIEL • PRESSURE','WADE • OVERSHOOT'][Math.floor(this.fightElapsed/7)%3];
      if(pattern!==this.lastFightPattern){this.lastFightPattern=pattern;this.battle.notice(`DUMMY PATTERN • ${pattern}`,1.15)}
      return;
    }
    if(this.currentFight.kind==='echo'){
      const pattern=this.echoPattern().toUpperCase();
      if(pattern!==this.lastFightPattern){
        this.lastFightPattern=pattern;this.currentFight.patternIndex++;
        if(this.currentFight.patternIndex>1&&pattern==='RRVVFO'){
          foe.hp=Math.max(1,foe.hp-4);this.battle.burst(foe.x,foe.z,'#ff7a63',18,70);this.battle.notice('COMPOSITE SWITCH FAILED • ECHO SELF-DAMAGE',1.25);
        }else this.battle.notice(`ECHO PATTERN • ${pattern}`,1.05);
      }
    }
  }
  echoPattern(){
    const foe=this.battle.fighters[1];
    const ratio=foe?.maxHp?foe.hp/foe.maxHp:1;
    if(ratio>.72)return['hamual','daniel','wade'][Math.floor(this.fightElapsed/5)%3];
    if(ratio>.43)return['bark','pouki'][Math.floor(this.fightElapsed/6)%2];
    if(ratio>.2)return'plouke';
    return'rrvvfo';
  }

  echoWeakWindow(){
    return this.fightElapsed%3.4>2.15;
  }

  finishFight(won){
    const fight=this.currentFight;
    if(!fight||this.mode!=='fight')return;
    this.battle.finalizeBattleRank({won,scoreFor:won?1:0,scoreAgainst:won?0:1,label:fight.kind==='echo'?'BOSS FIGHT RANK':'FIGHT RANK',showToast:true});
    this.mode='story';this.battle.phase='story';
    if(!won){
      const losses=(this.fightLosses[fight.kind]||0)+1;this.fightLosses[fight.kind]=losses;
      this.showTask({
        kicker:'ENCOUNTER LOST',title:`${fight.name.toUpperCase()} WINS`,
        text:losses>=2?'Retry with Story Assist: Rrvvfo gains a small advantage without changing the story.':'Retry from the nearby checkpoint. No investigation progress is lost.',
        buttons:[{label:'RETRY',value:'retry',primary:true},...(losses>=2?[{label:'RETRY WITH STORY ASSIST',value:'assist'}]:[]),{label:fight.kind==='optional'?'RETURN TO TOURNAMENT':'RETURN TO FACILITY',value:'leave'}],
        onChoose:value=>{
          if(value==='leave'){this.closeTask();this.currentFight=null;this.engine.setHotbarAvailability([],{show:false});if(fight.kind==='optional')this.enterAfterHoursHub({spawn:{x:-1040,z:-400}});else this.enterFacility({restored:true});return}
          this.closeTask();this.startFight({...fight});if(value==='assist'){this.battle.fighters[0].storyAttackMultiplier*=1.15;this.battle.fighters[0].storyDefenseMultiplier*=.88}
        }
      });return;
    }
    this.fightLosses[fight.kind]=0;if(!this.replayMode)addStoryXp(fight.xp||0,{source:`${fight.name.toUpperCase()} DEFEATED`});
    this.currentFight=null;this.engine.setHotbarAvailability([],{show:false});
    if(fight.kind==='optional'){this.finishOptionalQuest(fight.optionalQuest);this.enterAfterHoursHub({spawn:{x:-1040,z:-400}});return}
    if(fight.kind==='scanner'){
      this.state.tournamentDataDiscovered=true;this.addEvidence('tournamentData');this.completeRequired('tournamentDataDiscovered');
      this.showDialogue([
        {speaker:'PROJECT HOLLOW SCANNER',speakerClass:'rival',text:'REPEATED RESPONSE MODEL INCOMPLETE.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You can record what I do. That doesn’t mean you understand why I do it.',tail:'down'}
      ],()=>this.enterFacility({restored:true}));return;
    }
    if(fight.kind==='lockdown-unit'){
      this.state.facilityLockdownStarted=true;this.completeRequired('facilityLockdownStarted');
      this.showDialogue([
        {speaker:'SAGE',speakerClass:'neutral',text:'The robots aren’t the problem. The building keeps trying to close around you.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Then let’s stop standing in it.',tail:'down'}
      ],()=>this.enterFacility({restored:true}));return;
    }
    if(fight.kind==='dummy'){
      this.state.underground.dummyDefeated=true;
      this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'Old training unit. Not part of the main route anymore.',tail:'down'}],()=>this.enterFacility({restored:true}));return;
    }
    this.state.underground.echoDefeated=true;
    this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'That thing copied patterns, not people.',tail:'down'}],()=>this.enterFacility({restored:true}));
  }
  readRecordsLab(){
    this.showDialogue([
      {speaker:'RECORDS TERMINAL',speakerClass:'neutral',text:'WADE: High movement speed. Low stopping stability. Useful for mobility testing.',tail:'down'},
      {speaker:'RECORDS TERMINAL',speakerClass:'neutral',text:'BARK: High durability. Strong defensive pattern. Limited adaptability.',tail:'down'},
      {speaker:'RECORDS TERMINAL',speakerClass:'neutral',text:'POUKI: Strong output. Predictable recovery period.',tail:'down'},
      {speaker:'RECORDS TERMINAL',speakerClass:'neutral',text:'PLOUKE: Unknown energy source. Data conflicts with registered identity.',tail:'down'},
      {speaker:'RECORDS TERMINAL',speakerClass:'rival',text:'SUBJECT R — COMPOSITE RESONANCE. Fire. Universal energy. Foreign mental residue. Unknown ocular response. Pattern should collapse. Subject remains functional.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I hate being called Subject R.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'They were studying what keeps your powers from destroying each other.',tail:'down'}
    ],()=>{
      this.state.underground.subjectRRead=true;this.completeRequired('subjectRFile');
      this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState();
    });
  }

  readProjectHollow(){
    this.showDialogue([
      {speaker:'CENTRAL TERMINAL',speakerClass:'neutral',text:'STRONGEST SAMPLE: REMOVED. CONTAINER DESIGNED FOR CONFLICTING ENERGY SIGNATURES.',tail:'down'},
      {speaker:'CENTRAL TERMINAL',speakerClass:'neutral',text:'OPERATOR CREDENTIALS: PHOTOGRAPH MISSING. NAME INCONSISTENT. HIRING RECORD CREATED SHORTLY BEFORE TOURNAMENT.',tail:'down'},
      {speaker:'CENTRAL TERMINAL',speakerClass:'rival',text:'PROJECT HOLLOW — PHASE ONE COMPLETE.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Hollow could mean the machine, the sample, the operator, or something worse.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'And the rest of the files are gone.',tail:'down'}
    ],()=>{
      this.state.underground.projectHollowRead=true;this.completeRequired('projectHollow');
      this.mode='dungeon';this.battle.phase='play';this.beginInvestigationAftermath('project-hollow',8);this.updateObjective();this.saveState();
      this.toast('FACILITY LOCKDOWN','PROJECT HOLLOW DATA ERASED','Alarms seal the quiet investigation route. Fight toward the teleporter before the evidence disappears.');
      this.battle.notice('LOCKDOWN • SECURITY UNITS DEPLOYED',2.2);
    });
  }

  findTeleporter(){
    // Compatibility alias for saves made before the blue-clone escape rewrite.
    if(chapter3NextRequired(this.state)==='teleporterEscapeStarted')this.beginTeleporterEscape();
    else if(chapter3NextRequired(this.state)==='sageBlueCloneCreated')this.startDoorSequence();
  }
  startDoorSequence(){
    if(chapter3NextRequired(this.state)!=='sageBlueCloneCreated')return;
    this.mode='door-qte';this.battle.phase='story';this.door={active:true,stage:'reach',deadline:performance.now()+9000,swapStarted:false,retryCount:this.door.retryCount||0};
    const player=this.battle.fighters[0];player.reset(850,0);player.en=100;player.guard=100;
    this.hideSecondFighter();snapHubCamera(this.battle,player,{distance:930});
    const panel=this.root.querySelector('[data-c3-door]');panel.hidden=false;
    this.root.querySelector('[data-c3-door-title]').textContent='THE TELEPORTER DOOR IS CLOSING';
    this.root.querySelector('[data-c3-door-text]').textContent='The real Sage shoves Rrvvfo toward the doorway while Project Hollow closes in.';
    this.root.querySelector('[data-c3-door-action]').textContent='GET THROUGH';
    this.root.querySelector('[data-c3-door-prompt]').textContent=`${this.engine.prompt('interact','E')} • MOVE`;
    this.root.querySelector('[data-c3-door-action]').disabled=false;this.root.querySelector('[data-c3-door-action]').focus();
    this.showDialogue([
      {speaker:'SAGE',speakerClass:'neutral',text:'Get in!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'HEY—!',tail:'down'},
      {speaker:'NARRATION',speakerClass:'neutral',text:'Rrvvfo reaches back instead of abandoning him. Sage splits off a blue duplicate as the opening shrinks.',tail:'down'}
    ],()=>{this.mode='door-qte';this.battle.phase='story';panel.hidden=false;this.saveState()});
  }
  advanceDoorSequence(){
    if(!this.door.active)return;
    if(this.door.stage==='reach'){
      this.state.sageBlueCloneCreated=true;this.completeRequired('sageBlueCloneCreated');
      this.state.rrvvfoEnteredTeleporterRoom=true;this.completeRequired('rrvvfoEnteredTeleporterRoom');
      this.door.stage='clone';this.door.deadline=performance.now()+7000;
      this.battle.burst(955,0,'#64cfff',28,80);
      this.root.querySelector('[data-c3-door-title]').textContent='PULL THE BLUE SAGE THROUGH';
      this.root.querySelector('[data-c3-door-text]').textContent='Rrvvfo is inside. The real Sage remains outside fighting while the blue duplicate reaches the shrinking opening.';
      this.root.querySelector('[data-c3-door-action]').textContent='PULL CLONE THROUGH';
      this.root.querySelector('[data-c3-door-prompt]').textContent=`${this.engine.prompt('interact','E')} • GRAB`;
      this.saveState();return;
    }
    if(this.door.stage==='clone'){
      this.door.active=false;this.door.stage='complete';
      this.root.querySelector('[data-c3-door]').hidden=true;this.root.querySelector('[data-c3-door-action]').disabled=false;
      this.finishBlueCloneDoorSequence();
    }
  }

  finishBlueCloneDoorSequence(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Sage—',tail:'down'},
      {speaker:'NARRATION',speakerClass:'neutral',text:'The Sage beside him begins glowing blue. Beyond the sealed door, the real Sage is still fighting.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...Wait.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You’re the clone.',tail:'down'}
    ],()=>{
      this.state.blueCloneIdentityRevealed=true;this.completeRequired('blueCloneIdentityRevealed');
      this.showBlueCloneLesson();
    });
  }

  resumeBlueCloneSequence(){
    const next=chapter3NextRequired(this.state);
    if(next==='blueCloneIdentityRevealed'){this.finishBlueCloneDoorSequence();return}
    if(['blueCloneLessonSeen','blueCloneTechniqueFoundationLearned'].includes(next)){this.showBlueCloneLesson();return}
    this.mode='dungeon';this.battle.phase='play';this.updateObjective();
  }

  showBlueCloneLesson(){
    this.showDialogue([
      {speaker:'SAGE CLONE',speakerClass:'neutral',text:'Try to master this technique, kid.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'The clone thing?',tail:'down'},
      {speaker:'SAGE CLONE',speakerClass:'neutral',text:'Something like it.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'What about the real you?!',tail:'down'},
      {speaker:'SAGE CLONE',speakerClass:'neutral',text:'He’ll be fine.',tail:'down'},
      {speaker:'SAGE CLONE',speakerClass:'neutral',text:'I’m gonna be gone for a while.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'What does THAT mean?!',tail:'down'}
    ],()=>{
      this.state.blueCloneLessonSeen=true;this.state.blueCloneTechniqueFoundationLearned=true;
      this.completeRequired('blueCloneLessonSeen');this.completeRequired('blueCloneTechniqueFoundationLearned');
      this.mode='dungeon';this.battle.phase='play';this.updateObjective();this.saveState();
      this.toast('STORY FOUNDATION','BLUE CLONE PRINCIPLE','Rrvvfo saw one source divide into an independently acting manifestation. No technique was unlocked.');
    });
  }
  updateDoorSequence(){
    if(!this.door.active)return;
    const remaining=Math.max(0,this.door.deadline-performance.now());
    const duration=this.door.stage==='reach'?9000:7000;
    const ratio=remaining/duration;
    this.root.querySelector('[data-c3-door-meter]').style.width=`${clamp(ratio*100,0,100)}%`;
    this.root.querySelector('[data-c3-door-gap]').style.width=`${clamp(18+ratio*72,18,90)}%`;
    if(remaining<=0)this.retryDoorSequence();
  }
  retryDoorSequence(){
    this.door.retryCount++;this.state.underground.doorAttempts++;
    this.root.querySelector('[data-c3-door]').hidden=true;this.root.querySelector('[data-c3-door-action]').disabled=false;
    this.battle.notice('DOOR SEALED • RETRYING THE ESCAPE BEAT',1.6);
    this.mode='dungeon';this.battle.phase='play';
    // Roll back only the two QTE-local checkpoints; all investigation progress remains.
    this.state.sageBlueCloneCreated=false;this.state.rrvvfoEnteredTeleporterRoom=false;
    this.state.requiredCompleted=this.state.requiredCompleted.filter(id=>!['sageBlueCloneCreated','rrvvfoEnteredTeleporterRoom'].includes(id));
    this.saveState();setTimeout(()=>{if(!this.aborted)this.startDoorSequence()},650);
  }
  activateTeleporter(){
    if(chapter3NextRequired(this.state)!=='teleporterActivated')return;
    this.showDialogue([
      {speaker:'SAGE CLONE',speakerClass:'neutral',text:'Destination is unstable. That’s the available option.',tail:'down'},
      {speaker:'PROJECT HOLLOW',speakerClass:'rival',text:'TELEPORTER DOOR BREACH IN PROGRESS.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'WAIT—WHERE’S THIS EVEN GOING?!',tail:'down'},
      {speaker:'NARRATION',speakerClass:'neutral',text:'As Project Hollow breaks through, the blue clone fades normally. The real Sage is no longer visible from Rrvvfo’s side.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Oh, come on—',tail:'down'}
    ],()=>{
      this.state.teleporterActivated=true;this.state.blueCloneDisappeared=true;
      this.completeRequired('teleporterActivated');this.completeRequired('blueCloneDisappeared');this.saveState();
      this.enterRemoteRegion();
    });
  }
  enterRemoteRegion({restored=false}={}){
    this.area='remote';this.state.location='remote-region';
    if(!this.replayMode)saveLostYearProgress(recordWorldVisit(loadLostYearProgress(),'echo','lowerTrail',{entrance:'unstable-resonance-teleport'}));
    this.map?.setRegion('echo','lowerTrail');this.switchStage('remote-highlands');
    this.mode='remote';this.currentFight=null;this.battle.phase='story';this.battle.time=9999;this.battle.hideBanner();
    this.battle.root.classList.add('storyChapter3Hub');this.battle.root.classList.remove('storyChapter3Combat');
    this.engine.setLabels({stageName:'REMOTE ECHO REGION',chapterLabel:'RRVVFO CHAPTER 3',names:['RRVVFO','']});
    this.preparePlayer(REMOTE_SPAWN);this.showAreaTitle('REMOTE ECHO REGION','UNSTABLE TELEPORT • UNKNOWN LANDING');this.saveState();
    if(restored&&this.state.chapterComplete){this.showCompletionPanel();return}
    if(restored&&this.state.rrvvfoUnconscious){
      if(!this.state.echoOperationTimeSkipStarted){this.state.echoOperationTimeSkipStarted=true;this.completeRequired('echoOperationTimeSkipStarted')}
      this.commitCompletion();return;
    }
    this.showDialogue([
      {speaker:'NARRATION',speakerClass:'neutral',text:'The unstable long-distance teleport throws Rrvvfo into an unfamiliar mountain region. The connection collapses behind him.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Where...?',tail:'down'},
      {speaker:'NARRATION',speakerClass:'neutral',text:'He catches only a glimpse of distant mountains and the floating lookout before the teleport shock overwhelms him.',tail:'down'}
    ],()=>{
      this.state.rrvvfoTeleportedToEchoRegion=true;this.state.rrvvfoUnconscious=true;
      this.completeRequired('rrvvfoTeleportedToEchoRegion');this.completeRequired('rrvvfoUnconscious');
      const player=this.battle.fighters[0];player.visualAction='knockdown';player.visualActionTime=2.4;this.saveState();
      this.showDialogue([
        {speaker:'NARRATION',speakerClass:'neutral',text:'Several days pass while Rrvvfo remains unconscious.',tail:'down'},
        {speaker:'PROJECT HOLLOW SYSTEM',speakerClass:'rival',text:'TARGET ARRIVED. RECOVERY PERIOD: ESTIMATED MULTIPLE DAYS.',tail:'down'},
        {speaker:'PROJECT HOLLOW SYSTEM',speakerClass:'rival',text:'BEGIN ECHO REGION OPERATION.',tail:'down'}
      ],()=>{
        this.state.echoOperationTimeSkipStarted=true;this.completeRequired('echoOperationTimeSkipStarted');this.saveState();
        this.commitCompletion();
      });
    });
  }
  commitCompletion(){
    if(this.completed)return;
    this.completeRequired('chapterSaved');
    if(!chapter3Complete(this.state)){
      console.warn('[Chapter 3] Completion blocked by missing steps',CHAPTER3_REQUIRED_STEPS.filter(step=>!this.state.requiredCompleted.includes(step)));
      return;
    }
    this.completed=true;this.state.chapterComplete=true;this.mode='complete';this.battle.phase='story';
    const progress=loadLostYearProgress();
    if(this.replayMode){
      saveLostYearProgress({...progress,chapter3State:this.savedState,lastCheckpoint:this.savedCheckpoint||'rrvvfo-03-complete'});
    }else{
      const completedMissions=unique([...(progress.completedMissions||[]),MISSION_ID]);
      const unlocks=unique([...(progress.unlocks||[]),'afterHoursTournament','resonanceFacility','projectHollowLore','remoteRegionPreview','blueCloneTechniqueFoundation']);
      saveLostYearProgress({...progress,completedMissions,unlocks,chapter3State:this.state,lastCheckpoint:'rrvvfo-03-complete'});
    }
    this.onComplete();
    this.showCompletionPanel();
  }

  showCompletionPanel(){
    this.mode='complete';this.battle.phase='story';
    this.root.querySelector('[data-c3-complete]').hidden=false;
    this.root.querySelector('[data-c3-continue]').focus();
  }

  completeRequired(id){
    markChapter3Required(this.state,id);
    this.state.hubState=this.calculateHubState();
    this.saveState();this.refreshTracker();
  }

  calculateHubState(){
    if(this.area==='remote')return 6;
    if(this.area==='facility')return 5;
    if(this.state.maintenanceInvestigationStarted)return 4;
    if(this.state.medicalWorkerRevisited||this.state.strangeManWarningSeen)return 3;
    if(this.state.sabotageConfirmed)return 2;
    return 1;
  }
  addEvidence(id){
    if(CHAPTER3_EVIDENCE.some(entry=>entry.id===id))this.state.evidence=unique([...this.state.evidence,id]);
  }

  updateObjective(){
    const next=chapter3NextRequired(this.state);this.syncRpgPacing();
    const evidenceCount=this.state.sabotageEvidence.length,witnessCount=Object.values(this.state.witnesses||{}).filter(Boolean).length;
    const objectives={
      opening:['RETURN TO THE DAMAGED ARENA','The tournament is over, but the sabotage was never solved.'],
      sabotageInvestigationStarted:['INVESTIGATE THE TOURNAMENT SABOTAGE','Inspect the arena before repair crews replace the evidence.'],
      ringEvidence1Found:['INSPECT THE DAMAGED ARENA',`${evidenceCount} / 3 sabotage clues found.`],
      ringEvidence2Found:['INSPECT THE DAMAGED ARENA',`${evidenceCount} / 3 sabotage clues found.`],
      ringEvidence3Found:['INSPECT THE DAMAGED ARENA',`${evidenceCount} / 3 sabotage clues found.`],
      sabotageConfirmed:['CONFIRM THE SABOTAGE','Compare the three physical clues.'],
      workerQuestioned:['QUESTION TOURNAMENT WORKERS',`${witnessCount} / 3 witness accounts collected.`],
      securityQuestioned:['QUESTION TOURNAMENT WORKERS',`${witnessCount} / 3 witness accounts collected.`],
      medicalWorkerFirstConversationComplete:['QUESTION TOURNAMENT WORKERS',`${witnessCount} / 3 witness accounts collected • Medical Center is enterable.`],
      strangeManWarningSeen:['QUESTION THE STRANGE MAN','A lone man is waiting near the outer edge of the repaired grounds.'],
      medicalWorkerRevisited:['SPEAK TO THE MEDICAL WORKER AGAIN','The Strange Man said the second conversation would not match the first.'],
      strangeManHatCollected:['RETURN TO THE STRANGE MAN','He vanished. Something remains where he was standing.'],
      maintenanceInvestigationStarted:['INVESTIGATE THE STRANGE MAN’S WARNING','The physical evidence and Plouke sighting both point toward tournament maintenance.'],
      hiddenInfrastructureFound:['DESCEND INTO TOURNAMENT MAINTENANCE','Follow the east-support access beneath the arena.'],
      sageTrailFound:['INSPECT THE UNAUTHORIZED INFRASTRUCTURE','Find what does not belong in ordinary tournament maintenance.'],
      findSageObjectiveStarted:['FOLLOW SAGE’S TRAIL','A damaged robot and Plouke-disguise fragment prove Sage was investigating this route too.'],
      projectHollowFacilityEntered:['OPEN THE HIDDEN SECURITY DOOR','The unauthorized infrastructure continues beyond normal tournament maintenance.'],
      tournamentDataDiscovered:['SEARCH THE HIDDEN FACILITY','Find out what the underground systems were recording.'],
      projectHollowNameRevealed:['IDENTIFY WHO BUILT THIS PLACE','The fighter data belongs to an organized operation.'],
      realSageFound:['FIND THE REAL SAGE','Fighting can be heard deeper in the facility.'],
      facilityLockdownStarted:['SURVIVE THE LOCKDOWN','Project Hollow is sealing routes and deploying containment units.'],
      teleporterEscapeStarted:['REACH THE TELEPORTER ROOM','The facility is evacuating data. Sage is clearing a route for Rrvvfo.'],
      sageBlueCloneCreated:['GET THROUGH THE CLOSING DOOR','The real Sage stays outside. Get Rrvvfo and the blue clone through.'],
      rrvvfoEnteredTeleporterRoom:['GET THE BLUE CLONE INSIDE','Rrvvfo is through. The duplicate is still at the shrinking opening.'],
      blueCloneIdentityRevealed:['LOOK AT THE SAGE BESIDE YOU','Something about him is visibly wrong.'],
      blueCloneLessonSeen:['LISTEN TO THE BLUE CLONE','Sage left Rrvvfo with a technique principle, not a finished move.'],
      blueCloneTechniqueFoundationLearned:['REMEMBER THE PRINCIPLE','One source can divide into independently acting manifestations.'],
      teleporterActivated:['LET THE BLUE CLONE START THE TELEPORTER','Project Hollow is breaking through the door.'],
      blueCloneDisappeared:['SURVIVE THE UNSTABLE TELEPORT','The clone is gone and the destination is unknown.'],
      rrvvfoTeleportedToEchoRegion:['SURVIVE THE UNSTABLE TELEPORT','The route throws Rrvvfo far from the tournament.'],
      rrvvfoUnconscious:['RRVVFO IS DOWN','The unstable teleport has left him unconscious in the remote region.'],
      echoOperationTimeSkipStarted:['SEVERAL DAYS PASS','Project Hollow begins an operation in Echo Region while Rrvvfo cannot interfere.'],
      chapterSaved:['CHAPTER 3 COMPLETE','Saving the Echo Region handoff for Chapter 4.']
    };
    const [title,detail]=objectives[next]||['CHAPTER 3 COMPLETE','Rrvvfo wakes in Echo Region at the start of Chapter 4.'];
    this.setObjective(title,detail);this.updateLensAvailability();this.refreshTracker();
  }
  recordingObjectiveDetail(){
    const step=this.state.recordingStep;
    if(step===0)return'Speak to the early contestant in Fighter Camp.';
    if(step===1)return'Check the public replay booth.';
    if(step===2)return`Restore damaged media terminals. ${this.state.mediaTerminals.filter(entry=>entry.startsWith('damaged')).length} / 2`;
    if(step===3)return'Enter the private data booth.';
    return'Restore the missing match to the public archive.';
  }

  objectivePoint(){
    const next=chapter3NextRequired(this.state);
    if(this.mode==='interior'&&this.interiorId){
      const actor=interiorActorPoints(this.interiorId)[0];
      if(this.interiorId==='tournament-medical'&&['medicalWorkerFirstConversationComplete','medicalWorkerRevisited'].includes(next))return actor;
      return interiorExitPoint(this.interiorId);
    }
    if(this.area==='remote')return null;
    if(['medicalWorkerFirstConversationComplete','medicalWorkerRevisited'].includes(next))return{x:640,z:-430,label:'TOURNAMENT MEDICAL CENTER'};
    const interactions=this.availableInteractions();const player=this.battle?.fighters?.[0]||{x:0,z:0};
    return[...interactions].sort((a,b)=>distance(player,a)-distance(player,b))[0]||null;
  }
  mapPoints(){
    if(this.mode==='interior'&&this.interiorId)return interiorMapPoints(this.interiorId);
    if(this.area!=='hub')return[];
    return[
      ...HUB_DISTRICTS.map(district=>({x:district.x,z:district.z,label:district.name,color:'#78d7ff'})),
      ...this.availableInteractions().filter(item=>!item.kind.startsWith('optional')).map(item=>({x:item.x,z:item.z,label:item.label,color:'#ffd557'}))
    ];
  }

  setObjective(title,detail){
    for(const selector of ['[data-c3-objective]','[data-c3-menu-objective]']){
      const node=this.root.querySelector(selector);if(node)node.textContent=title;
    }
    for(const selector of ['[data-c3-detail]','[data-c3-menu-detail]']){
      const node=this.root.querySelector(selector);if(node)node.textContent=detail;
    }
  }

  refreshTracker(){
    this.syncRpgPacing();
    const mandatory=chapter3MandatorySummary(this.state),optional=chapter3OptionalSummary(this.state),evidence=chapter3EvidenceSummary(this.state),caseBoard=chapter3CaseBoard(this.state);
    this.root.querySelector('[data-c3-required-count]').textContent=`${this.state.requiredCompleted.length} / ${CHAPTER3_REQUIRED_STEPS.length}`;
    this.root.querySelector('[data-c3-mandatory-count]').textContent=`${mandatory.filter(entry=>entry.complete).length} / ${mandatory.length}`;
    this.root.querySelector('[data-c3-evidence-count]').textContent=`${evidence.filter(entry=>entry.found).length} / ${evidence.length}`;
    this.root.querySelector('[data-c3-optional-count]').textContent=`${optional.filter(entry=>entry.complete).length} / ${optional.length}`;
    this.root.querySelector('[data-c3-area-status]').textContent=this.area==='facility'?'FACILITY':this.area==='remote'?'REMOTE REGION':'TOURNAMENT';
    this.root.querySelector('[data-c3-journal]').innerHTML=`
      <h3>CURRENT DEDUCTION</h3>
      <section class="c3CaseBoard">
        <article class="currentTheory"><small>RRVVFO’S WORKING THEORY</small><strong>${caseBoard.theory}</strong><span>This is not a confirmed explanation. New evidence can still contradict it.</span></article>
        ${caseBoard.cards.map(card=>`<article class="${card.open?'':'locked'}"><small>${card.open?card.kicker:'UNRESOLVED LEAD'}</small><strong>${card.open?card.title:'EVIDENCE INCOMPLETE'}</strong><span>${card.open?card.detail:'Keep investigating the tournament grounds.'}</span></article>`).join('')}
        ${caseBoard.contradiction?'<article class="contradiction"><small>UNRESOLVED CONTRADICTION</small><strong>THE MEDICAL WORKER DOESN’T MATCH THE FIRST INTERVIEW.</strong><span>No evidence confirms whether this is a replacement, disguise, projection, altered memory, or something else.</span></article>':''}
      </section>
      <h3>MAIN INVESTIGATION THREADS</h3>
      ${mandatory.map(entry=>`<p class="${entry.complete?'done':''}"><b>${entry.complete?'✓':'•'}</b>${entry.title}</p>`).join('')}
      <h3>COLLECTED EVIDENCE</h3>
      ${evidence.map(entry=>`<p class="${entry.found?'done':''}"><b>${entry.found?'✓':'?'}</b>${entry.label}</p>`).join('')}
      <h3>OPTIONAL QUESTS</h3>
      ${optional.map(entry=>`<p class="${entry.complete?'done':''}"><b>${entry.complete?'✓':entry.started?'→':'○'}</b>${entry.title}</p>`).join('')}
      <h3>KEY ITEMS</h3>
      ${(this.state.keyItems||[]).includes(STRANGE_MAN_HAT.id)?`<p class="done"><b>◆</b><span><strong>${STRANGE_MAN_HAT.name}</strong><br>${STRANGE_MAN_HAT.description}</span></p>`:'<p><b>—</b>No key items collected.</p>'}
      <h3>CHAPTER COMPLETION</h3>
      <p><b>${chapter3CompletionPercent(this.state)}%</b>${this.state.requiredCompleted.length} of ${CHAPTER3_REQUIRED_STEPS.length} required checkpoints</p>`;
  }

  showDialogue(lines,onComplete){
    this.mode='dialogue';this.battle.phase='story';
    this.dialogue=this.engine.showDialogue(lines,{typeSpeed:18,onComplete:()=>{
      this.dialogue=null;onComplete?.();
    }});
  }

  showTask({kicker='CHAPTER 3',title='INVESTIGATION',text='',progress='',buttons=[],onChoose=()=>{}}={}){
    this.taskOpen=true;this.mode='task';this.battle.phase='story';this.taskIndex=0;this.taskChoose=onChoose;
    this.currentTaskValues=buttons.map(button=>button.value??button.label);
    const panel=this.root.querySelector('[data-c3-task]');
    this.root.querySelector('[data-c3-task-kicker]').textContent=kicker;
    this.root.querySelector('[data-c3-task-title]').textContent=title;
    this.root.querySelector('[data-c3-task-text]').textContent=text;
    const progressNode=this.root.querySelector('[data-c3-task-progress]');
    progressNode.textContent=progress;progressNode.hidden=!progress;
    const list=this.root.querySelector('[data-c3-task-buttons]');
    list.innerHTML=buttons.map((button,index)=>`<button type="button" class="${button.primary?'primary':''}" data-c3-task-choice="${index}"><strong>${button.label}</strong>${button.detail?`<span>${button.detail}</span>`:''}</button>`).join('');
    this.taskButtons=[...list.querySelectorAll('button')];
    this.taskButtons.forEach((button,index)=>button.addEventListener('click',()=>this.chooseTask(index)));
    panel.hidden=false;this.taskButtons[0]?.focus();
  }

  chooseTask(index){
    if(!this.taskOpen)return;
    const button=this.taskButtons[index];if(!button)return;
    const label=button.querySelector('strong')?.textContent||button.textContent;
    const source=[...this.root.querySelectorAll('[data-c3-task-buttons] button')];
    const originalIndex=source.indexOf(button);
    const callback=this.taskChoose;
    const values=this.currentTaskValues||[];
    const value=values[originalIndex]??label;
    this.closeTask();
    callback?.(value);
  }

  closeTask(){
    this.taskOpen=false;this.taskChoose=null;this.taskButtons=[];this.currentTaskValues=null;
    this.root.querySelector('[data-c3-task]').hidden=true;
  }

  showAreaTitle(name,kicker='CHAPTER 3'){
    document.dispatchEvent(new CustomEvent('pxstoryarrival',{detail:{title:name,detail:kicker,tone:name.includes('FACILITY')||name.includes('HOLLOW')?'mystery':'gold',onceKey:`c3-area:${name}`}}));
    this.root.querySelector('[data-c3-area-name]').textContent=name;
    this.root.querySelector('[data-c3-area-kicker]').textContent=kicker;
    const panel=this.root.querySelector('[data-c3-area]');panel.hidden=false;this.areaTimer=2.4;
  }

  toast(kicker,title,detail){
    const panel=this.root.querySelector('[data-c3-toast]');
    this.root.querySelector('[data-c3-toast-kicker]').textContent=kicker;
    this.root.querySelector('[data-c3-toast-title]').textContent=title;
    this.root.querySelector('[data-c3-toast-detail]').textContent=detail;
    panel.hidden=false;this.toastTimer=3.4;
  }

  openTracker(){
    if(this.trackerOpen||!['hub','dungeon','remote','interior'].includes(this.mode))return;
    this.trackerPreviousMode=this.mode;this.trackerOpen=true;this.refreshTracker();this.root.querySelector('[data-c3-tracker]').hidden=false;
    this.mode='tracker';this.battle.phase='story';this.root.querySelector('[data-c3-close-status]').focus();
  }

  closeTracker(){
    if(!this.trackerOpen)return;
    this.trackerOpen=false;this.root.querySelector('[data-c3-tracker]').hidden=true;
    const fallback=this.area==='facility'?'dungeon':this.area==='remote'?'remote':'hub';this.mode=['hub','dungeon','remote','interior'].includes(this.trackerPreviousMode)?this.trackerPreviousMode:fallback;this.battle.phase='play';
  }

  openBuildLab(){
    const locked=this.mode==='fight';
    openRrvvfoBuildLab({storyChapter:3,storyProgress:loadLostYearProgress(),locked,lockReason:locked?'BUILD LOCKED • FINISH THE ACTIVE FIGHT':'',onChange:build=>{const player=this.battle?.fighters?.[0];if(player)applyRrvvfoBuildToFighter(player,build);this.battle?.notice?.(`BUILD EQUIPPED • ${build.label}`,1.1)},onClose:()=>this.root.querySelector('[data-c3-menu-build]')?.focus()});
  }

  openStoryMenu(){
    if(this.storyMenuOpen||!['hub','dungeon','remote','interior','fight'].includes(this.mode))return;
    this.storyMenuOpen=true;this.root.querySelector('[data-c3-menu]').hidden=false;const skillPanel=this.root.querySelector('[data-c3-field-skills]');if(skillPanel)skillPanel.innerHTML=renderFieldSkillJournal({chapter:3});const buildButton=this.root.querySelector('[data-c3-menu-build]');if(buildButton){buildButton.disabled=this.mode==='fight';buildButton.textContent=this.mode==='fight'?'BUILD LOCKED • ACTIVE FIGHT':'RRVVFO BUILD'}
    this.storyMenuPaused=Boolean(this.battle&&!this.battle.paused);if(this.storyMenuPaused)this.battle.togglePause();
    this.root.querySelector('[data-c3-menu-resume]')?.focus();
  }

  closeStoryMenu(){
    if(!this.storyMenuOpen)return;
    this.storyMenuOpen=false;this.root.querySelector('[data-c3-menu]').hidden=true;
    if(this.storyMenuPaused&&this.battle?.paused)this.battle.togglePause();
    this.storyMenuPaused=false;
  }

  openManual(){
    if(this.storyMenuOpen)this.closeStoryMenu();
    const previous=this.mode;if(!['hub','dungeon','remote','interior','fight'].includes(previous))return;
    this.mode='manual';this.battle.phase='story';
    const opened=openCombatManual({onClose:()=>{if(this.aborted)return;this.mode=previous;this.battle.phase='play'}});
    if(!opened){this.mode=previous;this.battle.phase='play'}
  }

  onKey(event){
    if(this.root.hidden)return;
    if(this.taskOpen){
      if(['ArrowDown','ArrowRight'].includes(event.key)){event.preventDefault();this.taskIndex=(this.taskIndex+1)%Math.max(1,this.taskButtons.length);this.taskButtons[this.taskIndex]?.focus()}
      else if(['ArrowUp','ArrowLeft'].includes(event.key)){event.preventDefault();this.taskIndex=(this.taskIndex-1+Math.max(1,this.taskButtons.length))%Math.max(1,this.taskButtons.length);this.taskButtons[this.taskIndex]?.focus()}
      else if(event.key==='Enter'){event.preventDefault();this.chooseTask(this.taskIndex)}
      return;
    }
    if(this.door.active){
      if(event.key==='Enter'||event.code==='KeyE'){event.preventDefault();this.advanceDoorSequence()}
      return;
    }
    if(this.storyMenuOpen){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.closeStoryMenu()}
      return;
    }
    if(this.trackerOpen){
      if(event.key==='Escape'||event.key.toLowerCase()==='t'){event.preventDefault();event.stopImmediatePropagation();this.closeTracker()}
      return;
    }
    if(event.key==='Escape'&&['hub','dungeon','remote','interior','fight'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openStoryMenu();return}
    if(event.key.toLowerCase()==='m'&&['hub','dungeon','remote','interior','fight'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openManual();return}
    if(event.key.toLowerCase()==='t'&&['hub','dungeon','remote','interior'].includes(this.mode)){event.preventDefault();event.stopImmediatePropagation();this.openTracker();return}
    if(['hub','dungeon','interior'].includes(this.mode)&&(event.key==='Enter'||event.code==='KeyE')){event.preventDefault();event.stopImmediatePropagation();this.tryInteract()}
    if(this.mode==='hub'&&event.code==='Digit4'&&this.state.strangeManHatCollected&&!this.state.strangeManHatLensInspected){event.preventDefault();this.inspectStrangeManHatWithLens()}
  }

  drawChapterWorld(){
  }

  drawChapterWorld(){
    if(!this.battle?.renderer||this.aborted)return;
    const r=this.battle.renderer,time=performance.now()/1000;
    if(this.mode==='interior'&&this.interiorId)drawStoryInterior(r,this.interiorId,time);
    else if(this.area==='hub')this.drawAfterHoursHub(r,time);
    else if(this.area==='facility')this.drawFacility(r,time);
    else this.drawRemote(r,time);
    if(['hub','dungeon','interior'].includes(this.mode)){
      for(const item of this.availableInteractions())this.drawMarker(r,item,time,item.kind.startsWith('optional'));
    }
  }

  drawAfterHoursHub(r,time){
    const night=Math.min(.72,.22+this.state.hubState*.08),phase=rpgPacingLabel('chapter3',this.pacing);
    const phaseColor=this.pacing.phase==='development'?'#79dfff':this.pacing.phase==='crisis'?'#ff6f62':'#8e90a5';
    r.billboard({x:1120,y:235,z:40,size:24+Math.sin(time*2)*2,color:phaseColor,alpha:.28});
    for(let index=0;index<7;index++){
      const x=-820+index*250,z=index%2?760:-760;
      r.box({x,y:58,z,sx:150,sy:110,sz:90,color:'#222a35',alpha:.76});
      r.box({x,y:122,z,sx:175,sy:18,sz:110,color:index%2?'#5d3653':'#354e63',alpha:.8});
    }
    for(let index=0;index<10;index++){
      const x=-1450+((time*(18+index%3*4)+index*330)%2900),z=-780+(index%5)*360;
      r.box({x,y:38,z,sx:24,sy:54,sz:20,color:index%2?'#5b7182':'#80664f',alpha:.7});
      r.box({x,y:74,z,sx:22,sy:22,sz:20,color:'#8e6047',alpha:.72});
    }
    const cartX=((time*28+500)%3000)-1500;
    r.box({x:cartX,y:30,z:500,sx:140,sy:50,sz:78,color:'#765c43'});
    r.disc({x:cartX-50,y:6,z:530,rx:18,rz:12,color:'#171a20',alpha:.9});
    r.disc({x:cartX+50,y:6,z:530,rx:18,rz:12,color:'#171a20',alpha:.9});
    for(let index=0;index<5+this.state.hubState;index++){
      const point=RING_COLLECTORS[index%RING_COLLECTORS.length],pulse=1+Math.sin(time*5+index)*.12;
      r.billboard({x:point.x+(index-2)*35,y:45+index*8,z:point.z-30,size:20*pulse,color:'#79dfff',alpha:.16+night*.18});
    }
    const next=chapter3NextRequired(this.state);
    if(this.state.variety.reconstructionComplete){const x=330,z=-650;r.box({x,y:72,z,sx:150,sy:120,sz:24,color:'#19374b'});for(let i=0;i<5;i++)r.segment({x:x-55,y:42+i*15,z:z-14},{x:x+55,y:42+i*15,z:z-14},{width:4,height:2,color:i%2?'#79d7ff':'#ffd557',alpha:.75})}
    if(next==='strangeManWarningSeen'){
      const p=STRANGE_MAN_POINT;
      r.box({x:p.x,y:70,z:p.z,sx:54,sy:118,sz:42,color:'#24222c'});
      r.box({x:p.x,y:146,z:p.z,sx:38,sy:34,sz:34,color:'#8b654f'});
      r.box({x:p.x,y:173,z:p.z,sx:92,sy:8,sz:66,color:'#15131a'});
      r.box({x:p.x,y:188,z:p.z,sx:50,sy:28,sz:44,color:'#1e1b24'});
    }else if(this.state.strangeManWarningSeen&&!this.state.strangeManHatCollected){
      const p=STRANGE_MAN_POINT;
      r.box({x:p.x,y:13,z:p.z,sx:100,sy:7,sz:72,color:'#15131a'});
      r.box({x:p.x,y:29,z:p.z,sx:52,sy:30,sz:45,color:'#1e1b24'});
    }
    if(next==='maintenanceInvestigationStarted'){
      r.box({x:EAST_SUPPORT_CLUE.x,y:18,z:EAST_SUPPORT_CLUE.z,sx:42,sy:5,sz:30,color:'#d8edf4'});
      r.billboard({x:EAST_SUPPORT_CLUE.x,y:42,z:EAST_SUPPORT_CLUE.z,size:18+Math.sin(time*5)*2,color:'#7eeaff',alpha:.68});
    }
  }

  drawFacility(r,time){
    const colors=['#ff5c4b','#4ba8ff','#edf7ff'];
    for(let index=0;index<9;index++){
      const x=-880+index*210,pulse=1+Math.sin(time*4+index)*.08;
      r.box({x,y:65,z:index%2?-500:500,sx:74,sy:130,sz:74,color:'#162233'});
      r.box({x,y:82,z:index%2?-500:500,sx:42,sy:96,sz:42,color:colors[index%3],alpha:.34});
      r.billboard({x,y:115,z:index%2?-500:500,size:32*pulse,color:colors[index%3],alpha:.2});
    }
    if(this.state.sageBlueCloneCreated&&!this.state.blueCloneDisappeared){
      r.box({x:970,y:70,z:-75,sx:48,sy:112,sz:40,color:'#3d9cff',alpha:.62});
      r.billboard({x:970,y:125,z:-75,size:68+Math.sin(time*5)*5,color:'#73d7ff',alpha:.28});
    }
    r.box({x:1035,y:105,z:0,sx:38,sy:210,sz:190,color:'#7b55a4',alpha:.64});
    r.billboard({x:1035,y:140,z:0,size:105+Math.sin(time*4)*8,color:'#a98cff',alpha:.22});
  }

  drawRemote(r,time){
    for(let index=0;index<6;index++){
      const travel=((time*(22+index*3)+index*360)%2300)-1150;
      const z=-300+index*120+Math.sin(time+index)*45;
      r.box({x:travel,y:24,z,sx:42,sy:30,sz:26,color:index%2?'#8d7551':'#6f7250',alpha:.8});
    }
    const pulse=1+Math.sin(time*2.8)*.08;
    r.billboard({x:1020,y:690,z:-560,size:150*pulse,color:'#c8e7ff',alpha:.28});
  }

  drawMarker(r,item,time,optional=false){
    const pulse=1+Math.sin(time*4+(item.x||0)*.01)*.08;
    const color=optional?'#79d6ff':'#ffd557';
    r.disc({x:item.x,y:7,z:item.z,rx:42*pulse,rz:28*pulse,color,alpha:.22});
    r.billboard({x:item.x,y:145,z:item.z,size:30*pulse,color,alpha:.84});
  }

  saveState(){
    const progress=loadLostYearProgress();
    const keyItems=unique([...(progress.keyItems||[]),...(this.state.keyItems||[])]);
    if(this.replayMode){
      saveLostYearProgress({...progress,keyItems,chapter3State:this.savedState,lastCheckpoint:this.savedCheckpoint||'rrvvfo-03-complete'});
      return;
    }
    saveLostYearProgress({...progress,keyItems,chapter3State:this.state,lastCheckpoint:`rrvvfo-03-${chapter3NextRequired(this.state)||'complete'}`});
  }

  async requestExit(){
    const leave=await storyConfirm({title:'EXIT CHAPTER 3?',message:'Completed investigations and dungeon checkpoints remain saved. Active fights restart.',confirmLabel:'EXIT CHAPTER'});
    if(leave)this.exitToStory();
  }

  exitToStory(){
    if(this.aborted)return;
    this.saveState();this.cleanup();this.onExit();
  }

  cleanup(){
    if(this.aborted)return;
    this.aborted=true;
    clearTimeout(this.openingTimer);
    this.clearLensContradictionTimers();
    this.map?.destroy();this.map=null;
    document.removeEventListener('keydown',this.keyHandler,true);
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    if(this.battle?.active)this.battle.stopMatch();
    this.battle?.root?.classList.remove('storyChapter3Hub','storyChapter3Combat','storyChapter3Full');
    this.battle?.root?.classList.add('hidden');
    destroyStoryBattle(this.battle);
    this.root.remove();activeMission=null;
  }
}

export function startRrvvfoChapter3(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoChapter3(options);
  return activeMission.start();
}

export {RrvvfoChapter3};
