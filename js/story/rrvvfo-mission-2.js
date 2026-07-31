import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a27p2-roadside-map-smoke-20260730';
import {sharedInput} from '../input-runtime.js?v=29a27p2-roadside-map-smoke-20260730';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a27p2-roadside-map-smoke-20260730';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=29a27p2-roadside-map-smoke-20260730';
import {applyStoryProgressionToFighter,applyStoryLevelToFighter,storyStatsForLevel,addStoryXp,levelHudText,STORY_LEVEL_THRESHOLDS} from './story-progression.js?v=29a27p2-roadside-map-smoke-20260730';
import {storyConfirm} from './story-ux.js?v=29a27p2-roadside-map-smoke-20260730';
import {storyAttackStripMarkup,storyStatsMarkup,storyControlLegendMarkup} from './story-rpg-ui.js?v=29a27p2-roadside-map-smoke-20260730';
import {CHAPTER2_DISTRICTS,CHAPTER2_OPTIONAL_QUESTS,CHAPTER2_PLOUKE_CLUES,CHAPTER2_RACE_CHECKPOINTS,CHAPTER2_RING_SUPPORTS,CHAPTER2_SHORTCUTS,chapter2MandatoryReadyForTournament,chapter2QuestSummary,markQuestComplete,missingChapter2BracketCards,nearestDistrict,normalizeChapter2QuestState,requiredRumorCountForStep} from './chapter2-hub-quests.js?v=29a27p2-roadside-map-smoke-20260730';
import {snapHubCamera,updateHubCamera} from './hub-camera.js?v=29a27p2-roadside-map-smoke-20260730';
import {drawTournamentLandmarks} from './hub-landmark-art.js?v=29a27p2-roadside-map-smoke-20260730';

const MISSION_ID='rrvvfo-02';
const UI_ID='rrvvfoMission2UI';
const LEVEL_THRESHOLDS=STORY_LEVEL_THRESHOLDS;
const HUB_SPRITE_NPC_IDS=new Set(['sage','bark','wade']);
let activeMission=null;

function freshChapter2State(){
  return{
    talked:[],sageVanished:false,firstBrawlComplete:false,metBarkWade:false,
    barkSparResult:null,gruntDefeated:[],tournamentStarted:false,
    tournamentStep:'opening-ceremony',ceremonyComplete:false,prelimComplete:false,
    finalPrepSeen:false,ploukePerformanceBadge:null,runRefusals:0,intermission:null,
    hubQuests:normalizeChapter2QuestState()
  };
}

function normalizeChapter2State(saved={}){
  const base=freshChapter2State();
  const state={
    ...base,
    ...saved,
    talked:Array.isArray(saved.talked)?[...new Set(saved.talked)]:[],
    gruntDefeated:Array.isArray(saved.gruntDefeated)?[...new Set(saved.gruntDefeated)]:[],
    hubQuests:normalizeChapter2QuestState(saved.hubQuests)
  };
  // Saves created before the living-hub patch may already be inside the bracket.
  // Treat the three pre-tournament quests as completed so those saves never lock.
  if(saved.tournamentStarted){
    state.hubQuests.mandatory.bracket={...state.hubQuests.mandatory.bracket,started:true,cards:['fan-card','vendor-card','veteran-card'],complete:true};
    state.hubQuests.mandatory.wadeRace={...state.hubQuests.mandatory.wadeRace,started:true,complete:true};
    state.hubQuests.mandatory.barkRing={...state.hubQuests.mandatory.barkRing,started:true,supports:['west','south','east'],saboteurDefeated:false,complete:true};
  }
  return state;
}

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function distance(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0))}
function unique(values){return[...new Set(values)]}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.hidden=true;
  root.innerHTML=`
    <div class="chapter2Hud">
      <div class="chapter2Objective">
        <small>RRVVFO STORY • CHAPTER 2</small>
        <strong data-c2-objective>EXPLORE THE TOURNAMENT GROUNDS</strong>
        <span data-c2-detail>Talk to the people arriving for the tournament.</span>
      </div>
      ${storyAttackStripMarkup({compact:true})}
      <button class="chapter2MenuButton" type="button" data-c2-menu aria-haspopup="dialog" aria-controls="chapter2StoryMenu">☰ STORY MENU</button>
    </div>

    <div class="chapter2StoryMenu" id="chapter2StoryMenu" data-c2-menu-panel hidden role="dialog" aria-modal="true" aria-label="Chapter 2 story menu">
      <article>
        <header>
          <div><small>RRVVFO STORY • CHAPTER 2</small><h2>STORY MENU</h2></div>
          <button type="button" data-c2-menu-close aria-label="Close story menu">×</button>
        </header>
        ${storyAttackStripMarkup()}
        <div class="chapter2MenuProgress storyRpgMenuProgress">
          ${storyStatsMarkup(loadLostYearProgress())}
          <section class="storyXpPanel"><small>STORY XP</small><strong data-c2-xp>0 / 100</strong><div class="chapter2XpTrack"><i data-c2-xp-fill></i></div><span data-c2-xp-next>100 XP TO NEXT LEVEL</span></section>
        </div>
        <div class="storyRpgObjectiveCard"><small>CURRENT OBJECTIVE</small><strong data-c2-menu-objective>EXPLORE THE TOURNAMENT GROUNDS</strong><span data-c2-menu-detail>Talk to the people arriving for the tournament.</span></div>
        <div class="chapter2QuestJournal" data-c2-quest-journal>
          <section><header><small>MAIN QUESTS</small><strong>TOURNAMENT DAY</strong></header><div data-c2-main-quests></div></section>
          <section><header><small>SIDE QUESTS</small><strong>OPTIONAL</strong></header><div data-c2-side-quests></div></section>
        </div>
        <div class="chapter2MenuActions">
          <button class="primary" type="button" data-c2-menu-resume>RETURN TO GAME</button>
          <button type="button" data-c2-manual>COMBAT MANUAL</button>
          <button type="button" data-c2-menu-restart>RESTART ACTIVE FIGHT</button>
          <button type="button" data-c2-exit>EXIT CHAPTER</button>
        </div>
        ${storyControlLegendMarkup()}
        <p class="chapter2MenuHint">Your level and stats affect Story battles. Versus modes remain unchanged.</p>
      </article>
    </div>

    <div class="chapter2Tracker storyObjectiveTracker" data-c2-tracker hidden role="dialog" aria-modal="false" aria-label="Chapter 2 objective tracker">
      <article>
        <header><small>CHAPTER 2</small><h2>OBJECTIVE TRACKER</h2><button type="button" data-c2-tracker-close aria-label="Close objective tracker">×</button></header>
        <strong data-c2-tracker-objective>EXPLORE THE TOURNAMENT GROUNDS</strong>
        <p data-c2-tracker-detail>Talk to the people arriving for the tournament.</p>
        <div class="trackerStatus"><span>LEVEL <b data-c2-tracker-level>1</b></span><span>AREA <b data-c2-tracker-area>TOURNAMENT GROUNDS</b></span></div>
      </article>
    </div>

    <div class="chapter2AreaTitle" data-c2-area hidden>
      <small>THE LOST YEAR</small><strong data-c2-area-name>LOCAL TOURNAMENT GROUNDS</strong>
    </div>

    <div class="chapter2QuestToast" data-c2-quest-toast hidden aria-live="polite">
      <small data-c2-quest-kicker>QUEST UPDATED</small><strong data-c2-quest-title>THE LOST BRACKET</strong><span data-c2-quest-detail></span>
    </div>

    <div class="chapter2RaceHud" data-c2-race hidden>
      <small>WADE'S SHORTCUT • TARGET 24.0s</small>
      <strong data-c2-race-countdown>READY</strong>
      <span data-c2-race-checkpoint>CHECKPOINT 1 / 5</span>
      <span data-c2-race-time>0.0s</span>
      <span data-c2-race-lead>EVEN WITH WADE</span>
      <span data-c2-race-best>BEST —</span>
    </div>

    <div class="chapter2AmbientBubble" data-c2-chatter hidden aria-live="polite">
      <strong data-c2-chatter-speaker>TOURNAMENT FAN</strong><span data-c2-chatter-text></span>
    </div>

    <div class="chapter2FlameGame" data-c2-flame-game hidden role="dialog" aria-modal="true" aria-label="Controlled Flame challenge">
      <article>
        <small>OPTIONAL SIDE QUEST</small><h2>CONTROLLED FLAME</h2>
        <p data-c2-flame-order>Heat the meal into the green serving zone.</p>
        <div class="flameHeatTrack"><i data-c2-flame-heat></i><b data-c2-flame-target></b></div>
        <div class="flameGameActions"><button type="button" data-c2-flame-add>ADD HEAT</button><button class="primary" type="button" data-c2-flame-serve>SERVE</button><button type="button" data-c2-flame-leave>LEAVE</button></div>
        <span data-c2-flame-status>ORDERS COMPLETE: 0 / 3</span>
      </article>
    </div>

    <div class="chapter2Prompt" data-c2-prompt hidden>
      <strong data-c2-prompt-title>INTERACT</strong><span data-c2-prompt-detail>PRESS INTERACT</span>
    </div>

    <button class="tournamentRunButton" type="button" data-tournament-run hidden>RUN</button>

    <div class="chapter2Choice" data-c2-choice hidden>
      <article>
        <small data-c2-choice-kicker>OPTIONAL</small>
        <h2 data-c2-choice-title>MAKE A CHOICE</h2>
        <p data-c2-choice-text></p>
        <div data-c2-choice-buttons></div>
      </article>
    </div>

    <div class="chapter2Qte" data-c2-qte hidden>
      <article>
        <small>NON-STORY ENCOUNTER</small><h2>ESCAPE SEQUENCE</h2>
        <div class="qteSequence" data-c2-qte-sequence></div>
        <div class="qteButtons">
          <button type="button" data-c2-qte-input="KeyA">←</button>
          <button type="button" data-c2-qte-input="Space">JUMP</button>
          <button type="button" data-c2-qte-input="KeyD">→</button>
        </div>
        <div class="qteTimer"><i data-c2-qte-timer></i></div>
      </article>
    </div>

    <div class="levelUpOverlay" data-level-up hidden>
      <article>
        <small>STORY MODE PROGRESSION</small>
        <h2>TRAINING LEVEL <span data-level-up-number>2</span></h2>
        <p data-level-up-source>FIRST BRAWL COMPLETE</p>
        <div class="levelRewards storyLevelRewards" data-level-stats></div>
        <small class="levelModeNote">STORY STATS ONLY • VERSUS MODES UNAFFECTED</small>
        <button type="button" data-level-continue>CONTINUE</button>
      </article>
    </div>

    <div class="tournamentCard" data-tournament-card hidden>
      <article>
        <small data-tournament-kicker>LOCAL TOURNAMENT</small>
        <h2 data-tournament-title>ROUND ONE</h2>
        <p data-tournament-text></p>
        <button type="button" data-tournament-continue>ENTER THE RING</button>
      </article>
    </div>

    <div class="beamClashOverlay" data-beam-clash hidden>
      <article>
        <small>FINAL MATCH • BEAM CLASH</small>
        <h2>DO NOT LET GO</h2>
        <p>Mash FIRE to push back Plouke's beam. Winning the clash changes the final moment and earns a bonus reward.</p>
        <div class="beamClashVisual"><i class="rrBeam"></i><i class="ploukeBeam"></i><b data-clash-center></b></div>
        <div class="clashMeter"><i data-clash-meter></i></div>
        <button type="button" data-clash-input>FIRE!</button>
        <small data-clash-time>4.0s</small>
      </article>
    </div>

    <div class="routeEndOverlay" data-route-end hidden>
      <article class="routeEndCard">
        <small>RRVVFO STORY • CHAPTER 2 COMPLETE</small>
        <h2>THE TOURNAMENT IS OVER</h2>
        <p>Rrvvfo reached the final, exhausted himself against Plouke, survived the final clash, and discovered that Plouke was the Sage in disguise.</p>
        <div class="routeEndRewards">
          <span>FULL TOURNAMENT HUB CLEARED</span>
          <span>TRAINING LEVELS UNLOCKED</span>
          <span>CHAPTER 3 • SOMETHING UNDER THE RING UNLOCKED</span>
        </div>
        <button type="button" data-end-route>CONTINUE TO CHAPTER 3</button>
      </article>
    </div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoMission2{
  constructor({onComplete=()=>{},onExit=()=>{},replay=false}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.progress=loadLostYearProgress();
    this.completedBefore=this.progress.completedMissions?.includes(MISSION_ID);
    this.replayMode=Boolean(replay&&this.completedBefore);
    this.savedChapter2State={...(this.progress.chapter2State||{})};
    this.savedCheckpoint=this.progress.lastCheckpoint;
    this.state=this.replayMode
      ?freshChapter2State()
      :normalizeChapter2State(this.progress.chapter2State||{});
    this.level=Math.max(1,Number(this.progress.storyLevel)||1);
    this.xp=Math.max(0,Number(this.progress.storyXp)||0);
    this.root.hidden=false;
    this.mode='boot';
    this.dialogue=null;
    this.currentFight=null;
    this.pendingChoice=null;
    this.interactHeld=false;
    this.nearby=null;
    this.playerFlip=false;
    this.areaTimer=0;
    this.qteSequence=[];
    this.qteIndex=0;
    this.qteDeadline=0;
    this.qteGamepadState={};
    this.qtePurpose='run';
    this.pendingSupport=null;
    this.gruntCooldown={};
    this.fightLosses={};
    this.storyAssistFights=new Set();
    this.trackerOpen=false;
    this.trackerPausedBattle=false;
    this.hubAmbientTimer=5;
    this.currentDistrict='arrival';
    this.questToastTimer=0;
    this.race={active:false,index:0,startedAt:0,countdownUntil:0,elapsed:0,wadeX:250,wadeZ:20,splits:[]};
    this.ambientSpeech={npc:null,until:0};
    this.hubActors=[];
    this.hubAnimationClock=0;
    this.flameGame={active:false,heat:0,target:52,order:0,decay:0,lastPad:{add:false,serve:false}};
    this.lastLevelUpFrom=this.level;
    this.finalElapsed=0;
    this.finalPhase='opening';
    this.awakeningReadyAt=0;this.lastAwakeningSecond=null;
    this.clash={active:false,power:18,endAt:0,lastButton:false};
    this.koTimer=0;
    this.completed=false;
    this.aborted=false;
    this.storyMenuOpen=false;
    this.storyMenuPausedBattle=false;
    this.hubSpawn={x:-1510,z:80};
    this.npcs=this.createNpcs();

    this.root.querySelector('[data-c2-menu]').addEventListener('click',()=>this.openStoryMenu());
    this.root.querySelectorAll('[data-c2-menu-close],[data-c2-menu-resume]').forEach(button=>button.addEventListener('click',()=>this.closeStoryMenu()));
    this.root.querySelector('[data-c2-manual]').addEventListener('click',()=>this.openManual());
    this.root.querySelector('[data-c2-tracker-close]').addEventListener('click',()=>this.toggleTracker(false));
    this.root.querySelector('[data-c2-menu-restart]').addEventListener('click',()=>this.restartFightFromMenu());
    this.root.querySelector('[data-c2-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelectorAll('[data-c2-qte-input]').forEach(button=>button.addEventListener('click',()=>this.acceptQteInput(button.dataset.c2QteInput)));
    this.root.querySelector('[data-level-continue]').addEventListener('click',()=>this.closeLevelUp());
    this.root.querySelector('[data-tournament-continue]').addEventListener('click',()=>this.continueTournamentCard());
    this.root.querySelector('[data-tournament-run]').addEventListener('click',()=>this.attemptTournamentRun());
    this.root.querySelector('[data-clash-input]').addEventListener('click',()=>this.clashInput());
    this.root.querySelector('[data-end-route]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-c2-flame-add]').addEventListener('click',()=>this.addFlameHeat());
    this.root.querySelector('[data-c2-flame-serve]').addEventListener('click',()=>this.serveFlameOrder());
    this.root.querySelector('[data-c2-flame-leave]').addEventListener('click',()=>this.closeFlameGame());
    this.keyHandler=event=>this.onKey(event);
    this.perfectParryHandler=event=>this.recordDummyParry(event);
    document.addEventListener('keydown',this.keyHandler,true);
    document.addEventListener('pxperfectparry',this.perfectParryHandler);
  }

  createNpcs(){
    return[
      {id:'sage',label:'THE SAGE',x:-1340,z:-20,color:'#dbe5ee',hair:'#eff5fb',kind:'sage'},
      {id:'announcer',label:'TOURNAMENT ANNOUNCER',x:-250,z:-500,color:'#d8396c',hair:'#f1c85a',kind:'announcer'},
      {id:'fan',label:'TOURNAMENT FAN',x:-720,z:250,color:'#e35d82',hair:'#442a32',kind:'talk'},
      {id:'vendor',label:'FOOD VENDOR',x:-520,z:570,color:'#df7a42',hair:'#2d211b',kind:'vendor'},
      {id:'worker',label:'TOURNAMENT WORKER',x:-80,z:-390,color:'#3e7db9',hair:'#243247',kind:'registration'},
      {id:'veteran',label:'OLD COMPETITOR',x:-860,z:-280,color:'#7c65b7',hair:'#d9d9dc',kind:'veteran'},
      {id:'practice',label:'PRACTICE RING FIGHTER',x:-1120,z:560,color:'#506f9e',hair:'#2d2636',kind:'practice'},
      {id:'bark',label:'BARK',x:120,z:130,color:'#8b5f35',hair:'#161514',kind:'bark'},
      {id:'wade',label:'WADE',x:250,z:20,color:'#3181cd',hair:'#f5d72e',kind:'wade'},
      {id:'fake-champion',label:'LOUD CHAMPION',x:420,z:600,color:'#b74d45',hair:'#f2c84f',kind:'fakeChampion'},
      {id:'lost-fan',label:'LOST WADE FAN',x:520,z:-690,color:'#f2bf56',hair:'#315f9a',kind:'lostFan'},
      {id:'mechanic',label:'ARENA MECHANIC',x:-980,z:760,color:'#3f7f73',hair:'#253a37',kind:'mechanic'},
      {id:'cashier',label:'TOURNAMENT CASHIER',x:600,z:-380,color:'#8b62b2',hair:'#2b2432',kind:'cashier'},
      {id:'challenger',label:'REJECTED CHALLENGER',x:-1450,z:520,color:'#5f73a5',hair:'#242b3b',kind:'challenger'},
      {id:'grunt-a',label:'LOUD GRUNT',x:520,z:610,color:'#646a76',hair:'#292c33',kind:'grunt'},
      {id:'grunt-b',label:'MASKED GRUNT',x:820,z:-660,color:'#4f5561',hair:'#17191d',kind:'grunt'},
      {id:'bracket',label:'BRACKET BOARD',x:910,z:-430,color:'#2f2238',hair:'#f0c85d',kind:'bracket'}
    ];
  }

  start(){
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'tournament'}));
    this.battle=createStoryBattle({stageId:'tournament-hub'});
    this.engine=attachStoryEngine(this.battle,{
      chapterLabel:'RRVVFO CHAPTER 2',
      stageName:'LOCAL TOURNAMENT GROUNDS',
      rootClasses:['chapter2StoryActive'],
      getMode:()=>this.engine?.dialogue?'dialogue':this.mode
    });
    this.patchBattle();
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART MATCH?',message:'Restart the active tournament fight at 0–0?',confirmLabel:'RESTART'});
    if(this.replayMode){
      // A replay is opt-in from the dedicated REPLAY button. The replay gets a clean
      // Chapter 2 state, while the completed route save remains untouched underneath.
      this.enterHub({opening:true});
    }else if(this.state.tournamentStarted&&this.state.intermission){
      this.enterHub({opening:false,spawn:{x:1050,z:90}});
      this.showIntermissionArrival();
    }else if(this.state.tournamentStarted){
      this.battle.fighters[0].id='rrvvfo';
      this.battle.fighters[1].id='qualifier-fighter';
      this.switchStage('tournament');
      this.mode='story';this.battle.phase='story';this.battle.hideBanner();
      this.startTournamentFromCheckpoint();
    }else{
      this.enterHub({opening:true});
    }
    this.engine.sync(true);
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    this.engine.useChapterProfile({
      input:next=>{
        if(this.mode==='hub'){
          const command=next(),interact=Boolean(command.interact);
          if(interact&&!this.interactHeld)this.tryInteract();
          this.interactHeld=interact;
          if(this.race.active&&performance.now()<this.race.countdownUntil){
            return this.engine.commandForMode({},'exploration',{allowJump:false,allowDash:false,allowInteract:false});
          }
          return this.engine.commandForMode(command,'exploration',{allowJump:true,allowDash:true,allowInteract:true});
        }
        if(this.mode==='fight'){
          const command=this.engine.commandForMode(next(),'combat');
          if(this.currentFight?.final&&this.finalPhase==='fatigue')return{...command,x:(command.x||0)*.82,z:(command.z||0)*.82,dash:false};
          return command;
        }
        if(this.mode==='spectator')return this.engine.invokeRuntime('cpu',[battle.fighters[0],battle.fighters[1],1/60]);
        return this.engine.commandForMode({},this.mode);
      },
      cpu:(next,fighter,foe,dt)=>{
        if(this.mode!=='fight'&&this.mode!=='spectator')return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,special:false};
        if(this.mode==='fight'&&this.currentFight?.kind==='dummy'){
          const quest=this.state.hubQuests.optional.dummy;
          if(quest.pursuit&&!quest.grab)return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:true,charge:false,grab:false,special:false};
        }
        return next(fighter,foe,dt);
      },
      castAbility:(next,slot)=>{
        if(this.mode==='hub'){battle.notice('SAVE IT FOR THE RING',1.1);return false}
        if(this.mode!=='fight')return false;
        if(this.currentFight?.final&&slot===5){
          if(this.finalPhase==='awakening-ready'){this.triggerAwakeningAttempt();return true}
          battle.notice('FIRE AWAKENING WILL NOT ANSWER YET',1.2);return false;
        }
        return next(slot);
      },
      updateCamera:()=>this.updateCamera(),
      applyDamage:(next,attacker,target,damage,meta={})=>{
        let adjusted=damage;
        if(this.mode==='fight'&&this.currentFight?.final){
          if(attacker===battle.fighters[1])adjusted*=this.finalPhase==='fatigue'?1.34:1.12;
          if(attacker===battle.fighters[0]&&this.finalPhase==='fatigue')adjusted*=.78;
        }
        if(this.mode==='spectator'&&this.currentFight?.id==='pouki-exhibition'){
          const phase=this.currentFight.phase||1;
          if(attacker.id==='pouki')adjusted*=phase===1?.45:phase===2?1.35:2.1;
          if(attacker.id==='bark')adjusted*=phase===1?1.15:phase===2?.72:.5;
        }
        const connected=next(attacker,target,adjusted,meta);
        if(!connected)return connected;
        const player=battle.fighters[0],foe=battle.fighters[1];
        if(this.mode==='fight'&&this.currentFight?.kind==='dummy'&&attacker===player){
          const quest=this.state.hubQuests.optional.dummy;
          if(String(meta.kind||'').startsWith('pursuit'))quest.pursuit=true;
          if(meta.kind==='grab')quest.grab=true;
          this.updateDummyObjective();
          this.saveChapterState();
          if(target===foe&&foe.hp<=0&&!(quest.parries&&quest.pursuit&&quest.grab)){
            foe.hp=18;
            this.battle.notice('COMPLETE EVERY TRAINING STEP FIRST',1.2);
          }
        }
        if(this.mode==='fight'&&this.currentFight?.final){
          if(target===foe){
            this.currentFight.lowestEnemyHp=Math.min(this.currentFight.lowestEnemyHp,foe.hp);
            const ratio=foe.hp/Math.max(1,foe.maxHp);
            if(ratio<=.7&&this.currentFight.crowdTier<1){this.currentFight.crowdTier=1;this.battle.notice('THE CROWD STARTS BACKING RRVVFO',1.3)}
            if(ratio<=.52&&this.currentFight.crowdTier<2){this.currentFight.crowdTier=2;this.battle.notice('PLOUKE REVEALS HIS EDGE TRAP EARLY',1.5)}
          }
          if(target===foe&&foe.hp<=48){foe.hp=48;if(this.finalPhase==='opening')queueMicrotask(()=>this.beginFinalFatigue())}
          if(target===player&&player.hp<=27){player.hp=27;if(this.finalPhase==='opening'||this.finalPhase==='fatigue')queueMicrotask(()=>this.offerAwakening())}
        }else if(this.mode==='fight'){
          if(target===foe&&foe.hp<=0){foe.hp=1;queueMicrotask(()=>this.handleFightKo(true))}
          else if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.handleFightKo(false))}
        }else if(this.mode==='spectator'&&this.currentFight?.id==='pouki-exhibition'){
          if(target===player&&player.hp<=18&&this.currentFight.elapsed<34)player.hp=18;
          else if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.finishPoukiExhibition())}
          else if(target===foe&&foe.hp<=52)foe.hp=52;
        }else if(this.mode==='spectator'&&this.currentFight?.id==='hailey-plouke-prelim'){
          if(target===foe&&foe.hp<=55)foe.hp=55;
          if(target===player&&player.hp<=22)player.hp=22;
        }
        return connected;
      },
      update:(next,dt)=>{
        next(dt);
        if(!battle.active||this.aborted)return;
        this.areaTimer=Math.max(0,this.areaTimer-dt);
        if(!this.areaTimer)this.root.querySelector('[data-c2-area]').hidden=true;
        if(this.mode==='hub'){
          const player=battle.fighters[0];player.hp=Math.min(player.maxHp,Math.max(1,player.hp));player.en=Math.min(100,Math.max(0,player.en));player.guard=Math.min(100,Math.max(0,player.guard));battle.time=9999;this.updateHub(dt);
        }else if(this.mode==='fight'){battle.time=9999;this.updateFight(dt)}
        else if(this.mode==='spectator'){battle.time=9999;this.updateSpectator(dt)}
        else if(this.mode==='qte')this.updateQte();
        else if(this.mode==='flame')this.updateFlameGame(dt);
        else if(this.mode==='clash')this.updateBeamClash();
      },
      flipFor:(next,fighter)=>{
        if(this.mode==='hub'&&fighter===battle.fighters[0]){
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
      drawFighterLayer:(next,fighters)=>next(this.mode==='hub'?[battle.fighters[0],...this.visibleHubActors()]:fighters),
      drawFallback2D:(next,context,fighter,rect)=>{
        const palettes={
          rrvvfo:{body:'#b82329',hair:'#754f35',skin:'#8f5539'},bark:{body:'#8a6036',hair:'#151515',skin:'#a96f4e'},
          wade:{body:'#287cc8',hair:'#f0d12c',skin:'#9a6041'},pouki:{body:'#45666b',hair:'#d9d3c4',skin:'#86583f'},
          plouke:{body:'#34343d',hair:'#ece6d5',skin:'#8c5b40'},sage:{body:'#d8e4ef',hair:'#f5f7fa',skin:'#8d5b40'},
          hailey:{body:'#d95789',hair:'#372742',skin:'#9b6448'},hamual:{body:'#8e3f2d',hair:'#241b18',skin:'#985f42'},daniel:{body:'#405f91',hair:'#2c2725',skin:'#936047'},
          'practice-fighter':{body:'#506f9e',hair:'#2d2636',skin:'#986044'},'qualifier-fighter':{body:'#a05d3b',hair:'#25221f',skin:'#8f5a3e'},
          'bracket-fighter':{body:'#7855a5',hair:'#382746',skin:'#9b6245'},'grunt-a':{body:'#626a76',hair:'#292c33',skin:'#8b5b42'},
          'grunt-b':{body:'#4f5662',hair:'#17191d',skin:'#8b5b42'},
          'fake-champion':{body:'#b74d45',hair:'#f2c84f',skin:'#956044'},'practice-dummy':{body:'#7c6a51',hair:'#d8b56a',skin:'#9a7b55'},
          'rejected-challenger':{body:'#5f73a5',hair:'#242b3b',skin:'#906047'}
        };
        const palette=palettes[fighter.id];
        if(!palette)return next(context,fighter,rect);
        const cx=rect.x+rect.width/2,scale=rect.height/190;
        context.fillStyle='rgba(0,0,0,.34)';context.beginPath();context.ellipse(cx,rect.y+rect.height-3,35*scale,10*scale,0,0,Math.PI*2);context.fill();
        context.fillStyle=palette.body;context.fillRect(cx-24*scale,rect.y+70*scale,48*scale,82*scale);
        context.fillStyle=palette.skin;context.beginPath();context.arc(cx,rect.y+50*scale,20*scale,0,0,Math.PI*2);context.fill();
        context.fillStyle=palette.hair;context.fillRect(cx-24*scale,rect.y+20*scale,48*scale,25*scale);
        context.fillStyle='#fff';context.font=`900 ${Math.max(8,11*scale)}px Inter,Arial,sans-serif`;context.textAlign='center';context.fillText(fighter.name.toUpperCase(),cx,rect.y+8*scale);
      },
      draw:next=>{next();if(this.mode==='hub'){this.drawHubExtras();this.positionAmbientSpeech()}if(this.currentFight?.final&&['fatigue','awakening-ready','awakening'].includes(this.finalPhase))this.drawFinalFatigue()},
      exit:async next=>{
        const leave=await storyConfirm({title:'EXIT CHAPTER 2?',message:'Leave the tournament? Official fights restart from 0–0, while completed story checkpoints remain saved.',confirmLabel:'EXIT CHAPTER'});
        if(!leave)return;
        next();this.exitToStory();
      }
    });
  }

  enterHub({opening=false,spawn=null}={}){
    this.battle.fighters[0].id='rrvvfo';
    this.battle.fighters[1].id='revvfo';
    this.switchStage('tournament-hub');
    this.mode='hub';
    this.currentFight=null;
    this.battle.phase='play';
    this.battle.time=9999;
    this.battle.hideBanner();
    this.battle.root.classList.add('chapter2HubMode','chapter2StoryActive');
    this.battle.root.classList.remove('chapter2FightMode');
    this.root.classList.remove('isFight');
    this.battle.root.querySelector('[data-stage-name]').textContent='LOCAL TOURNAMENT GROUNDS';
    this.battle.root.querySelector('.badge strong').textContent='RRVVFO STORY • CHAPTER 2';
    const player=this.battle.fighters[0];
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' LOCAL TOURNAMENT • TRAINING LEVELS ACTIVE';
    const point=spawn||this.hubSpawn;
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.reset(point.x,point.z);
    applyStoryProgressionToFighter(player,{...this.progress,storyLevel:this.level,storyXp:this.xp});
    player.en=45;player.guard=100;
    this.hideSecondFighter();
    snapHubCamera(this.battle,player,{distance:1120});
    this.prepareHubActors();
    this.updateLevelHud();
    this.updateHubObjective();
    this.showAreaTitle('LOCAL TOURNAMENT GROUNDS');
    if(opening&&!this.state.tournamentStarted){
      this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Registration delay! Nobody panic unless you’re holding part of the bracket!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Not my problem.',tail:'down'},
        {speaker:'SAGE',speakerClass:'neutral',text:'You’re bored, right? Go do that.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Whatever. I’ve got nothing better to be doing.',tail:'down'}
      ]);
    }
  }

  switchStage(stageId){
    if(this.battle.active)this.battle.stopMatch();
    this.battle.setStage(stageId);
    this.battle.start();
    this.battle.root.querySelector('[data-result]')?.classList.add('hidden');
  }

  hideSecondFighter(){
    const foe=this.battle.fighters[1];
    foe.y=-1400;foe.x=this.battle.fighters[0].x-120;foe.z=this.battle.fighters[0].z-120;foe.hp=100;foe.attackState=null;foe.asset=null;
  }

  updateCamera(){
    const foe=this.battle.fighters[1];
    updateHubCamera(this.battle,{
      frameFight:this.mode!=='hub'&&foe.y>-500,
      allowLook:this.mode==='hub',
      hubDistance:1120,
      fightBaseDistance:930,
      fightMaxDistance:1180
    });
  }

  prepareHubActors(){
    const specs=[
      {id:'sage',name:'The Sage',accent:'#d9e7f3',x:-1340,z:-20},
      {id:'bark',name:'Bark',accent:'#9a6a3a',x:120,z:130},
      {id:'wade',name:'Wade',accent:'#2f91e3',x:250,z:20}
    ];
    for(const spec of specs){
      let actor=this.hubActors.find(candidate=>candidate.id===spec.id);
      if(!actor){
        actor={...spec,y:0,hp:100,maxHp:100,en:0,guard:100,cpu:true,appearance:'down',grounded:true,moving:false,moveX:0,moveZ:0,vy:0,stun:0,inv:0,flash:0,knockdown:0,dashTime:0,pursuitTime:0,ringOutFall:0,guardBreak:0,visualAction:'',visualActionTime:0,attackState:null,block:false,blockAge:0,animationClock:0,asset:null};
        this.hubActors.push(actor);
        this.battle.loadFighterAsset(spec.id).then(asset=>{if(!this.aborted)actor.asset=asset}).catch(()=>{});
      }
    }
  }

  visibleHubActors(){
    const activeIds=new Set(this.activeNpcs().map(npc=>npc.id));
    for(const actor of this.hubActors){
      const npc=this.npcs.find(candidate=>candidate.id===actor.id);
      actor.x=npc?.x??actor.x;actor.z=npc?.z??actor.z;actor.moving=false;actor.animationClock=this.hubAnimationClock;
      if(actor.id==='wade'&&this.race.active){
        actor.x=this.race.wadeX;actor.z=this.race.wadeZ;actor.moving=performance.now()>=this.race.countdownUntil;
        actor.moveX=1;actor.moveZ=0;
      }
    }
    return this.hubActors.filter(actor=>actor.asset&&(activeIds.has(actor.id)||(actor.id==='wade'&&this.race.active)));
  }

  showAreaTitle(name){
    const panel=this.root.querySelector('[data-c2-area]');
    this.root.querySelector('[data-c2-area-name]').textContent=name;
    panel.hidden=false;this.areaTimer=2.2;
  }

  setObjective(title,detail){
    for(const selector of ['[data-c2-objective]','[data-c2-menu-objective]','[data-c2-tracker-objective]']){
      const node=this.root.querySelector(selector);if(node)node.textContent=title;
    }
    for(const selector of ['[data-c2-detail]','[data-c2-menu-detail]','[data-c2-tracker-detail]']){
      const node=this.root.querySelector(selector);if(node)node.textContent=detail;
    }
  }

  updateHubObjective(){
    const q=this.state.hubQuests.mandatory;
    if(this.state.tournamentStarted&&this.state.tournamentStep!=='complete'){
      const step=this.state.tournamentStep||'round-1';
      const required=requiredRumorCountForStep(step);
      const found=q.ploukeRumors.clues.length;
      if(this.state.intermission&&found<required){
        const clue=CHAPTER2_PLOUKE_CLUES[found];
        this.setObjective('FOLLOW THE PLOUKE RUMOR',`${clue?.source||'Someone nearby'} may know something useful. Reliable clues: ${found} / 4.`);
      }else if(this.state.intermission){
        this.setObjective('RETURN TO THE BRACKET',`Explore, prepare, or begin ${String(step).replaceAll('-',' ')} at the bracket board.`);
      }else{
        this.setObjective('RETURN TO THE TOURNAMENT',`The tournament is waiting at ${String(step).replaceAll('-',' ')}.`);
      }
      this.renderQuestJournal();
      return;
    }
    if(!q.bracket.started){
      this.setObjective('FIND THE TOURNAMENT ANNOUNCER','Registration is stalled. Speak to the announcer in Registration Plaza.');
    }else if(!q.bracket.complete){
      const missing=missingChapter2BracketCards(this.state.hubQuests);
      this.setObjective(
        'REBUILD THE LOST BRACKET',
        `${q.bracket.cards.length} / 3 recovered • ${missing.map(card=>card.source).join(' • ')||'Return to the announcer'}`
      );
    }else if(!this.state.sageVanished){
      this.setObjective('RETURN TO THE ANNOUNCER','The missing cards are recovered. Bring them back to Registration Plaza.');
    }else if(!this.state.firstBrawlComplete){
      this.setObjective('FIND OUT WHERE SAGE WENT','The practice-ring fighter saw him leave. Speak to the fighter.');
    }else if(!this.state.metBarkWade){
      this.setObjective('MEET THE OLD FACES','Bark and Wade just arrived in the central plaza.');
    }else if(!q.wadeRace.complete){
      this.setObjective(q.wadeRace.started?'FOLLOW WADE’S SHORTCUT':'TALK TO WADE',q.wadeRace.started?'Reach every glowing checkpoint. Winning is optional.':'Wade wants to show off the fastest route through the grounds.');
    }else if(!q.barkRing.started){
      this.setObjective('TALK TO BARK','Bark noticed something wrong with the practice ring.');
    }else if(!q.barkRing.complete){
      if(q.barkRing.supports.length<CHAPTER2_RING_SUPPORTS.length)this.setObjective('INSPECT THE CRACKED RING',`Check the glowing supports around the practice ring. ${q.barkRing.supports.length} / 3`);
      else this.setObjective('REPORT THE CRACKED RING','The evidence is incomplete. Return to Bark without alarming the guests.');
    }else{
      this.setObjective('REGISTER FOR THE TOURNAMENT','Main preparations are complete. Explore side quests or register when ready.');
    }
    this.renderQuestJournal();
  }

  activeNpcs(){
    const q=this.state.hubQuests;
    return this.npcs.filter(npc=>{
      if(npc.id==='sage')return!this.state.sageVanished;
      if(npc.id==='announcer')return true;
      if(npc.id==='practice')return this.state.sageVanished&&!this.state.firstBrawlComplete;
      if(npc.id==='bark'||npc.id==='wade')return this.state.firstBrawlComplete;
      if(npc.id==='fake-champion')return this.state.tournamentStarted&&!q.optional.fakeChampion.complete;
      if(npc.id==='lost-fan')return this.state.metBarkWade&&!q.optional.lostFan.complete;
      if(npc.id==='mechanic')return q.mandatory.barkRing.complete&&!q.optional.dummy.complete;
      if(npc.id==='cashier')return this.state.tournamentStarted&&!q.optional.prizeCart.complete;
      if(npc.id==='challenger')return q.mandatory.bracket.complete&&!q.optional.challenger.complete;
      if(npc.kind==='grunt')return this.state.firstBrawlComplete&&!this.state.gruntDefeated.includes(npc.id);
      if(npc.id==='bracket')return q.mandatory.bracket.complete;
      return true;
    });
  }

  updateHub(dt){
    const player=this.battle.fighters[0],quests=this.state.hubQuests;
    this.hubAnimationClock+=Math.max(0,dt)*1000;
    this.bracketCartX=-1080+Math.sin(performance.now()/1300)*430;
    this.fanCardX=-760+Math.sin(performance.now()/430)*185;
    this.fanCardZ=150+Math.cos(performance.now()/520)*115;
    this.questToastTimer=Math.max(0,this.questToastTimer-dt);
    if(!this.questToastTimer)this.root.querySelector('[data-c2-quest-toast]').hidden=true;
    const district=nearestDistrict(player.x,player.z);
    if(district.id!==this.currentDistrict){
      this.currentDistrict=district.id;
      if(!quests.discoveredDistricts.includes(district.id)){quests.discoveredDistricts.push(district.id);this.saveChapterState()}
      this.showAreaTitle(district.name);
      this.root.querySelector('[data-c2-tracker-area]').textContent=district.name;
    }
    if(this.race.active)this.updateWadeRace(dt);
    this.hubAmbientTimer-=dt;
    if(this.hubAmbientTimer<=0&&!this.dialogue&&!this.race.active){
      this.hubAmbientTimer=8+Math.random()*5;
      this.beginAmbientSpeech(player);
    }
    if(performance.now()>this.ambientSpeech.until)this.hideAmbientSpeech();
    for(const key of Object.keys(this.gruntCooldown))this.gruntCooldown[key]=Math.max(0,this.gruntCooldown[key]-dt);
    const candidates=this.activeNpcs().filter(npc=>distance(player,npc)<135&&!(this.gruntCooldown[npc.id]>0));
    if(quests.mandatory.barkRing.started&&!quests.mandatory.barkRing.complete){
      for(const support of CHAPTER2_RING_SUPPORTS){
        if(!quests.mandatory.barkRing.supports.includes(support.id)&&distance(player,support)<125)candidates.push({...support,kind:'ringSupport'});
      }
    }
    const bracket=quests.mandatory.bracket;
    if(bracket.started&&!bracket.complete){
      if(bracket.fanClue&&!bracket.cards.includes('fan-card')){
        const fanCard={id:'bracket-fan-card',label:'FAST-MOVING WADE CARD',x:this.fanCardX,z:this.fanCardZ,kind:'bracketFanCard'};
        if(distance(player,fanCard)<145)candidates.push(fanCard);
      }
      const roofCard={id:'bracket-roof-card',label:'BLOWN CONTESTANT CARD',x:-430,z:760,kind:'bracketRoof'};
      if(!bracket.cards.includes('vendor-card')&&distance(player,roofCard)<125)candidates.push(roofCard);
      const cartCard={id:'bracket-cart-card',label:'MAINTENANCE CART CARD',x:this.bracketCartX,z:-300,kind:'bracketCart'};
      if(!bracket.cards.includes('veteran-card')&&distance(player,cartCard)<145)candidates.push(cartCard);
    }
    if(quests.optional.prizeCart.started&&!quests.optional.prizeCart.complete&&Number.isFinite(this.prizeCartX)){
      const cart={id:'prize-cart',label:'MOVING PRIZE CART',x:this.prizeCartX,z:470,kind:'prizeCart'};
      if(distance(player,cart)<150)candidates.push(cart);
    }
    if(quests.mandatory.wadeRace.complete){
      for(const shortcut of CHAPTER2_SHORTCUTS){
        if(quests.shortcuts.includes(shortcut.id)&&distance(player,shortcut)<125)candidates.push({...shortcut,kind:'shortcut'});
      }
    }
    this.nearby=candidates.sort((a,b)=>distance(player,a)-distance(player,b))[0]||null;
    const prompt=this.root.querySelector('[data-c2-prompt]');
    prompt.hidden=!this.nearby||this.race.active;
    if(this.nearby&&!this.race.active){
      this.root.querySelector('[data-c2-prompt-title]').textContent=this.nearby.label;
      const detail=this.root.querySelector('[data-c2-prompt-detail]');if(detail)detail.textContent=this.engine.prompt('interact','E').toUpperCase();
    }
  }

  beginAmbientSpeech(player){
    const lines={
      announcer:this.state.tournamentStarted?'Fighters, check the updated bracket!':'Registration opens after the bracket is repaired!',
      vendor:'Hot meals before the next round!',
      fan:this.state.tournamentStarted?'That last pursuit changed the whole match!':'Wade just sprinted through here again!',
      worker:this.state.tournamentStarted?'Arena repairs are almost finished!':'Keep the central path clear!'
    };
    const nearby=this.activeNpcs().filter(npc=>lines[npc.id]&&distance(player,npc)<650);
    if(!nearby.length)return;
    const npc=nearby[Math.floor(Math.random()*nearby.length)];
    this.ambientSpeech={npc,until:performance.now()+2400};
    const bubble=this.root.querySelector('[data-c2-chatter]');
    bubble.hidden=false;
    this.root.querySelector('[data-c2-chatter-speaker]').textContent=npc.label;
    this.root.querySelector('[data-c2-chatter-text]').textContent=lines[npc.id];
  }

  positionAmbientSpeech(){
    const bubble=this.root.querySelector('[data-c2-chatter]'),npc=this.ambientSpeech.npc;
    if(!bubble||bubble.hidden||!npc)return;
    const point=this.battle.renderer.project(npc.x,155,npc.z);
    if(!point.visible){bubble.hidden=true;return}
    bubble.style.left=`${clamp(point.x,110,innerWidth-110)}px`;
    bubble.style.top=`${clamp(point.y,90,innerHeight-150)}px`;
  }

  hideAmbientSpeech(){
    this.ambientSpeech={npc:null,until:0};
    const bubble=this.root.querySelector('[data-c2-chatter]');if(bubble)bubble.hidden=true;
  }

  tryInteract(){
    if(this.mode!=='hub'||!this.nearby||this.race.active)return;
    const npc=this.nearby;
    if(npc.kind==='talk')this.talkToLocal(npc);
    else if(npc.kind==='announcer')this.talkToAnnouncer();
    else if(npc.kind==='vendor')this.talkToVendor();
    else if(npc.kind==='veteran')this.talkToVeteran();
    else if(npc.kind==='registration')this.useRegistration(npc);
    else if(npc.kind==='practice')this.beginPracticeBrawl();
    else if(npc.kind==='bark')this.talkToBark();
    else if(npc.kind==='wade')this.talkToWade();
    else if(npc.kind==='ringSupport')this.inspectRingSupport(npc);
    else if(npc.kind==='fakeChampion')this.beginFakeChampionQuest();
    else if(npc.kind==='lostFan')this.beginLostFanQuest();
    else if(npc.kind==='mechanic')this.beginDummyQuest();
    else if(npc.kind==='cashier')this.beginPrizeCartQuest();
    else if(npc.kind==='challenger')this.beginRejectedChallengerQuest();
    else if(npc.kind==='prizeCart')this.catchPrizeCart();
    else if(npc.kind==='shortcut')this.useWadeShortcut(npc);
    else if(npc.kind==='grunt')this.beginGruntEncounter(npc);
    else if(npc.kind==='bracket')this.inspectBracket();
    else if(npc.kind==='bracketFanCard')this.catchWadeCard();
    else if(npc.kind==='bracketRoof')this.collectBracketCard('vendor-card',[
      {speaker:'RRVVFO',speakerClass:'p1',text:'Bark’s card landed on the upper market walkway.',tail:'down'},
      {speaker:'FOOD VENDOR',speakerClass:'neutral',text:'I said it went up. I did not say the wind respected stairs.',tail:'down'}
    ]);
    else if(npc.kind==='bracketCart')this.collectBracketCard('veteran-card',[
      {speaker:'OLD COMPETITOR',speakerClass:'neutral',text:'There it is—caught on the maintenance cart!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'The bracket paperwork is officially faster than the staff.',tail:'down'}
    ]);
    else if(npc.kind==='sage')this.showDialogue([{speaker:'SAGE',speakerClass:'neutral',text:'I am standing right here. Go learn something from somebody less prepared.',tail:'down'}]);
  }

  talkToLocal(npc){
    const bracket=this.state.hubQuests.mandatory.bracket;
    if(bracket.started&&!bracket.complete&&['fan'].includes(npc.id)&&!bracket.cards.includes('fan-card')){
      if(!bracket.fanClue){
        this.showDialogue([
          {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'A contestant card blew into my souvenir bag. It says Wade—wait, it just flew back out!',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'Of course his card is faster than everybody else’s.',tail:'down'}
        ],()=>{bracket.fanClue=true;this.saveChapterState();this.questToast('QUEST UPDATED','THE LOST BRACKET','Dash into Wade’s moving card, then interact to catch it.');this.updateHubObjective();this.resumeHub()});
      }else this.showDialogue([{speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'It keeps circling the plaza. You may have to dash into it before it escapes again.',tail:'down'}]);
      return;
    }
    const lines={
      fan:this.state.tournamentStarted?[
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'Everyone’s favorite fighter is Plouke, but mine is Bark. You had a good match, though.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Really? Bark over me?',tail:'down'}
      ]:[
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'People say the winner gets great rewards.',tail:'down'}
      ]
    }[npc.id]||[{speaker:npc.label,speakerClass:'neutral',text:'The tournament starts soon.',tail:'down'}];
    this.showDialogue(lines);
  }

  talkToAnnouncer(){
    const bracket=this.state.hubQuests.mandatory.bracket;
    if(!bracket.started){
      this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Disaster! Three contestant cards escaped the bracket board!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Aren’t you the announcer I used to watch in those World Tournaments on TV when I was younger? So I guess your clumsiness wasn’t a character.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'HEY! HURTFUL!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I’m helping you. I can be as rude as I want.',tail:'down'}
      ],()=>{bracket.started=true;this.state.hubQuests.activeQuest='bracket';this.saveChapterState();this.questToast('MAIN QUEST STARTED','THE LOST BRACKET','Recover 3 contestant cards.');this.updateHubObjective()});
      return;
    }
    if(!bracket.complete&&bracket.cards.length<3){this.showDialogue([{speaker:'ANNOUNCER',speakerClass:'rival',text:`Still missing ${3-bracket.cards.length} card${3-bracket.cards.length===1?'':'s'}! The entire bracket is becoming a circle!`,tail:'down'}]);return}
    if(!bracket.complete&&bracket.cards.length>=3){
      this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Wade, Bark, and the unreadable qualifier! The bracket lives!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I’m about to win.',tail:'down'},
        {speaker:'SAGE',speakerClass:'neutral',text:'Stay near the practice ring. I need to check something before your first brawl.',tail:'down'}
      ],()=>{bracket.complete=true;markQuestComplete(this.state.hubQuests,'bracket');this.questToast('MAIN QUEST COMPLETE','THE LOST BRACKET','Bracket page added to the Story menu.');this.saveChapterState();this.triggerSageDisappearance()});
      return;
    }
    this.showDialogue([{speaker:'ANNOUNCER',speakerClass:'rival',text:this.state.tournamentStarted?'The bracket is holding together! Mostly!':'Registration can continue now. Try not to lose your own name.',tail:'down'}]);
  }

  catchWadeCard(){
    const player=this.battle.fighters[0];
    if(!(player.dashTime>0||player.visualAction==='dash'||Math.hypot(player.moveVX||0,player.moveVZ||0)>250)){
      this.battle.notice('TOO FAST TO GRAB • DASH INTO THE CARD',1.2);return;
    }
    this.collectBracketCard('fan-card',[
      {speaker:'RRVVFO',speakerClass:'p1',text:'Got it. Even Wade’s paperwork needs to be chased down.',tail:'down'}
    ]);
  }

  collectBracketCard(cardId,lines){
    const bracket=this.state.hubQuests.mandatory.bracket;
    if(bracket.cards.includes(cardId)){this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'I already got the card from here.',tail:'down'}]);return}
    this.showDialogue(lines,()=>{bracket.cards.push(cardId);this.saveChapterState();this.questToast('QUEST UPDATED','THE LOST BRACKET',`${bracket.cards.length} / 3 cards recovered.`);this.updateHubObjective()});
  }

  talkToVendor(){
    const bracket=this.state.hubQuests.mandatory.bracket;
    if(!bracket.started){
      this.showDialogue([{speaker:'FOOD VENDOR',speakerClass:'neutral',text:'The announcer is looking for anybody willing to save the bracket. Handle that first and I may have work for a Fire Ninja.',tail:'down'}]);
      return;
    }
    if(!bracket.complete&&!bracket.cards.includes('vendor-card')){
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'Bark’s card landed on the upper market walkway.',tail:'down'},
        {speaker:'FOOD VENDOR',speakerClass:'neutral',text:'I said it went up. I did not say the wind respected stairs.',tail:'down'}
      ]);return;
    }
    const food=this.state.hubQuests.optional.food;
    if(!bracket.complete){
      this.showDialogue([{speaker:'FOOD VENDOR',speakerClass:'neutral',text:'Finish rebuilding the bracket first. I do not want the tournament cancelled after I prepared all this food.',tail:'down'}]);
      return;
    }
    if(!food.complete)this.beginFoodQuest();
    else if(this.state.hubQuests.bonuses.meal)this.showDialogue([{speaker:'FOOD VENDOR',speakerClass:'neutral',text:`Your ${this.state.hubQuests.bonuses.meal} meal is ready for the next official fight.`,tail:'down'}]);
    else if(this.state.hubQuests.bonuses.vendorDiscount&&this.state.hubQuests.bonuses.coins>=20)this.offerDiscountMeal();
    else this.showDialogue([{speaker:'FOOD VENDOR',speakerClass:'neutral',text:'Your controlled-fire meal is still the only thing here that did not explode.',tail:'down'}]);
  }

  offerDiscountMeal(){
    const bonuses=this.state.hubQuests.bonuses;
    this.showChoice({
      kicker:'TOURNAMENT STAFF DISCOUNT',title:'PREPARE ANOTHER MEAL?',
      text:`Discounted meals cost 20 coins. You have ${bonuses.coins} coins. The chosen meal buffs the next official fight.`,
      buttons:[{label:'POWER • 20',value:'power',primary:true},{label:'DEFENSE • 20',value:'defense'},{label:'SPEED • 20',value:'speed'},{label:'LEAVE',value:'leave'}],
      onChoose:value=>{
        if(value==='leave'){this.resumeHub();return}
        if(bonuses.coins<20){this.battle.notice('NOT ENOUGH COINS',1);this.resumeHub();return}
        bonuses.coins-=20;bonuses.meal=value;this.saveChapterState();
        this.questToast('MEAL PREPARED',`${value.toUpperCase()} MEAL`,`${bonuses.coins} coins remain.`);this.resumeHub();
      }
    });
  }

  talkToVeteran(){
    const bracket=this.state.hubQuests.mandatory.bracket;
    if(bracket.started&&!bracket.complete&&!bracket.cards.includes('veteran-card')){
      this.showDialogue([
        {speaker:'OLD COMPETITOR',speakerClass:'neutral',text:'The unreadable qualifier card snagged on a maintenance cart. It keeps circling the west path.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'So I might fight a person named Scribble if I can catch their paperwork.',tail:'down'}
      ]);return;
    }
    if(this.offerCurrentPloukeClue('veteran'))return;
    this.showDialogue([
      {speaker:'OLD COMPETITOR',speakerClass:'neutral',text:'Never spend all your energy early. The final round punishes people who think exhaustion is optional.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Hey, thanks for the tip. See ya around.',tail:'down'}
    ]);
  }

  triggerSageDisappearance(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Sage?',tail:'down'},
      {speaker:'ANNOUNCER',speakerClass:'rival',text:'Was that pale man with you? He walked behind the waiting tent.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'He probably disappeared again. Typical.',tail:'down'}
    ],()=>{
      this.state.sageVanished=true;
      this.saveChapterState();
      this.updateHubObjective();
    });
  }

  beginPracticeBrawl(){
    this.showDialogue([
      {speaker:'PRACTICE RING FIGHTER',speakerClass:'rival',text:'Alright, let’s fight. A little training’s good for ya, boy.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Alright. Let’s do it.',tail:'down'}
    ],()=>{
      discoverCombatManualPage('training-levels',{
        reactionLines:['He really wrote a level system?','It seems like I can choose what stuff I power up when I level up. It gets harder the more I level up, though. Whatever.'],
        onClose:()=>this.startFight({
          id:'practice-fighter',name:'Practice Fighter',hp:52,xp:120,kind:'practice',story:false,
          intro:'FIRST BRAWL • TRAINING LEVELS ACTIVE'
        })
      });
    });
  }

  meetBarkAndWade(){
    this.showDialogue([
      {speaker:'WADE',speakerClass:'neutral',text:'There you are! We’ve been looking all over—',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'We just got here, Wade. We didn’t even start looking yet.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Wade, you really are dense, huh?',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'Looks like a big ninja reunion. The three of us.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'But only one of us can win.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'It’s me.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'It’s me. I’m the most tactical.',tail:'down'},
      {speaker:'BARK AND RRVVFO',speakerClass:'neutral',text:'In what world?',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'Then follow me. I found the fastest route through this whole place.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You found a route and turned it into a competition. Of course.',tail:'down'}
    ],()=>{
      this.state.metBarkWade=true;
      this.saveChapterState();
      this.questToast('MAIN QUEST AVAILABLE','WADE’S SHORTCUT','Talk to Wade for a fast tour of the hub.');
      this.updateHubObjective();
    });
  }

  talkToWade(){
    if(!this.state.metBarkWade){this.meetBarkAndWade();return}
    const lostFan=this.state.hubQuests.optional.lostFan;
    if(lostFan.started&&!lostFan.complete){
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'When did the ninjas get merch?',tail:'down'},
        {speaker:'WADE',speakerClass:'neutral',text:'Uh, I think Tangai started it after you beat Revvfo. He needed more funding since someone keeps spending money on his card.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'A fan’s looking for you.',tail:'down'},
        {speaker:'WADE',speakerClass:'neutral',text:'Like the blowing ones?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Just follow me.',tail:'down'}
      ],()=>this.completeLostFanQuest());return;
    }
    const race=this.state.hubQuests.mandatory.wadeRace;
    if(!race.complete){
      this.showChoice({
        kicker:'MAIN QUEST',title:'WADE’S SHORTCUT',
        text:'Follow Wade through five checkpoints around the tournament grounds. Winning is optional; finishing unlocks hub shortcuts.',
        buttons:[{label:race.started?'RESTART TOUR':'START TOUR',value:'start',primary:true},{label:'NOT YET',value:'leave'}],
        onChoose:value=>value==='start'?this.startWadeRace():this.resumeHub()
      });return;
    }
    if(this.offerCurrentPloukeClue('wade'))return;
    this.showChoice({
      kicker:'WADE’S BEST-TIME BOARD',title:race.bestTime==null?'NO RECORDED TIME':`BEST ${race.bestTime.toFixed(1)}s`,
      text:race.won?'You beat the 24-second target. Wade still accepts rematches.':'Finish within 24 seconds to take the top spot from Wade.',
      buttons:[{label:'RACE AGAIN',value:'start',primary:true},{label:'LEAVE',value:'leave'}],
      onChoose:value=>value==='start'?this.startWadeRace():this.resumeHub()
    });
  }

  startWadeRace(){
    const raceState=this.state.hubQuests.mandatory.wadeRace;
    raceState.started=true;this.state.hubQuests.activeQuest='wadeRace';
    const now=performance.now();
    this.race={active:true,index:0,startedAt:now+3000,countdownUntil:now+3000,elapsed:0,wadeX:250,wadeZ:20,splits:[]};
    this.root.querySelector('[data-c2-race]').hidden=false;
    this.root.querySelector('[data-c2-prompt]').hidden=true;
    this.mode='hub';this.battle.phase='play';
    const player=this.battle.fighters[0];player.x=180;player.z=40;
    snapHubCamera(this.battle,player,{distance:1120});
    this.questToast('MAIN QUEST','WADE’S SHORTCUT','Run through every glowing checkpoint.');
    this.updateWadeRaceHud();
    this.saveChapterState();
  }

  updateWadeRace(dt){
    const player=this.battle.fighters[0],raceState=this.state.hubQuests.mandatory.wadeRace;
    const countdown=this.race.countdownUntil-performance.now();
    if(countdown>0){
      const count=Math.max(1,Math.ceil(countdown/1000));
      this.root.querySelector('[data-c2-race-countdown]').textContent=String(count);
      this.root.querySelector('[data-c2-race-time]').textContent='0.0s';
      return;
    }
    this.root.querySelector('[data-c2-race-countdown]').textContent='GO!';
    this.race.elapsed=(performance.now()-this.race.startedAt)/1000;
    const checkpoint=CHAPTER2_RACE_CHECKPOINTS[this.race.index];
    if(checkpoint&&distance(player,checkpoint)<115){
      this.battle.burst(checkpoint.x,checkpoint.z,'#63c9ff',24,70);
      this.race.splits.push(this.race.elapsed);
      this.race.index++;
      this.battle.notice(`${checkpoint.label} • ${this.race.elapsed.toFixed(1)}s`,.9);
      if(this.race.index>=CHAPTER2_RACE_CHECKPOINTS.length){this.finishWadeRace();return}
      this.updateWadeRaceHud();
    }
    // Wade follows the same route as a visible pace ghost. He is fast, but the
    // player can win by using the unlocked movement kit cleanly.
    const target=CHAPTER2_RACE_CHECKPOINTS[Math.min(this.race.index,CHAPTER2_RACE_CHECKPOINTS.length-1)];
    const dx=target.x-this.race.wadeX,dz=target.z-this.race.wadeZ,d=Math.max(1,Math.hypot(dx,dz));
    const speed=285;
    this.race.wadeX+=dx/d*Math.min(d,speed*dt);this.race.wadeZ+=dz/d*Math.min(d,speed*dt);
    this.root.querySelector('[data-c2-race-time]').textContent=`${this.race.elapsed.toFixed(1)}s`;
    const playerDistance=checkpoint?distance(player,checkpoint):0,wadeDistance=target?distance(this.race,target):0;
    const lead=playerDistance-wadeDistance;
    this.root.querySelector('[data-c2-race-lead]').textContent=Math.abs(lead)<35?'EVEN WITH WADE':lead<0?'AHEAD OF WADE':'WADE IS AHEAD';
    raceState.bestTime=raceState.bestTime==null?null:raceState.bestTime;
  }

  updateWadeRaceHud(){
    const current=Math.min(this.race.index+1,CHAPTER2_RACE_CHECKPOINTS.length);
    this.root.querySelector('[data-c2-race-checkpoint]').textContent=`CHECKPOINT ${current} / ${CHAPTER2_RACE_CHECKPOINTS.length}`;
    const best=this.state.hubQuests.mandatory.wadeRace.bestTime;
    this.root.querySelector('[data-c2-race-best]').textContent=best==null?'BEST —':`BEST ${best.toFixed(1)}s`;
  }

  finishWadeRace(){
    const raceState=this.state.hubQuests.mandatory.wadeRace,time=this.race.elapsed,won=time<=24;
    raceState.complete=true;raceState.won=won;raceState.bestTime=raceState.bestTime==null?time:Math.min(raceState.bestTime,time);
    this.race.active=false;this.root.querySelector('[data-c2-race]').hidden=true;
    this.state.hubQuests.shortcuts=CHAPTER2_SHORTCUTS.map(shortcut=>shortcut.id);
    markQuestComplete(this.state.hubQuests,'wadeRace');this.saveChapterState();
    this.showDialogue([
      {speaker:'WADE',speakerClass:'neutral',text:won?'You beat that time? I was showing you the route, not racing at full speed.':'You made it. The route is faster when you stop arguing with every corner.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:won?'A shortcut only matters if I reach the end first.':'Uh, well—I WAS HOLDING BACK! YOU’LL SEE IN THE TOURNAMENT!',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'When you two are done, the practice ring is cracking underneath the east support.',tail:'down'}
    ],()=>{this.questToast('MAIN QUEST COMPLETE','WADE’S SHORTCUT','Three hub shortcuts unlocked. Talk to Bark about the cracked practice ring.');this.updateHubObjective()});
  }

  talkToBark(){
    if(!this.state.metBarkWade){this.meetBarkAndWade();return}
    const ring=this.state.hubQuests.mandatory.barkRing;
    if(!this.state.hubQuests.mandatory.wadeRace.complete){
      this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:'Finish Wade’s tour. I need to check whether the ring damage reaches the service path.',tail:'down'}]);return;
    }
    if(!ring.started){
      this.showDialogue([
        {speaker:'BARK',speakerClass:'neutral',text:'Look. You see those cracks on the ring? It’s like someone’s trying to damage it. You’re the sneakiest, Rrvvfo. Could you go in and try to fix them?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Sure. You and Wade guard me, though. I don’t wanna get banned.',tail:'down'},
        {speaker:'BARK',speakerClass:'neutral',text:'There are three damaged spots. I put markers on your map.',tail:'down'}
      ],()=>{ring.started=true;this.state.hubQuests.activeQuest='barkRing';this.saveChapterState();this.questToast('MAIN QUEST STARTED','THE CRACKED RING','Inspect 3 supports around the practice ring.');this.updateHubObjective()});return;
    }
    if(!ring.complete){
      this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:ring.supports.length<3?`Inspect the supports around the ring. ${ring.supports.length} of 3 checked.`:'After the tournament, you can keep investigating. For now, the ring is stable.',tail:'down'}]);return;
    }
    if(this.offerCurrentPloukeClue('bark'))return;
    if(this.state.barkSparResult==='won'){
      this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:'You already won the spar. Save the rest for the bracket.',tail:'down'}]);return;
    }
    this.showChoice({
      kicker:'OPTIONAL SIDE FIGHT',title:'SPAR WITH BARK?',
      text:'The ring is repaired. Bark wants one clean first-to-one spar before the tournament.',
      buttons:[{label:'SPAR',value:'fight',primary:true},{label:'NOT NOW',value:'leave'}],
      onChoose:value=>value==='fight'?this.startFight({id:'bark',name:'Bark',hp:78,xp:85,kind:'bark-spar',story:false,intro:'OPTIONAL SPAR • BARK'}):this.resumeHub()
    });
  }

  inspectRingSupport(support){
    const ring=this.state.hubQuests.mandatory.barkRing;if(ring.supports.includes(support.id))return;
    this.pendingSupport=support;this.qtePurpose='repair';this.mode='qte';this.battle.phase='story';
    this.root.querySelector('[data-c2-qte] h2').textContent=`STABILIZE ${support.label}`;
    const sequences={west:['KeyA','KeyD','Space'],south:['Space','KeyA','KeyD'],east:['KeyD','Space','KeyA']};
    this.qteSequence=sequences[support.id]||['KeyA','Space','KeyD'];this.qteIndex=0;this.qteDeadline=performance.now()+4600;this.qteGamepadState={};
    this.root.querySelector('[data-c2-qte]').hidden=false;this.renderQte();
  }

  completeRingSupport(support){
    const ring=this.state.hubQuests.mandatory.barkRing;
    if(ring.supports.includes(support.id))return;
    const lines={
      west:[
        {speaker:'BARK',speakerClass:'neutral',text:'Look. It seems like the damage is pushing outward.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Simple. Someone attacked the ring from the inside.',tail:'down'},
        {speaker:'BARK',speakerClass:'neutral',text:'But why would they?',tail:'down'}
      ],
      south:[
        {speaker:'BARK',speakerClass:'neutral',text:'Look. Footprints—but they stop halfway. Why?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That’s weird. Maybe I should take this more seriously.',tail:'down'}
      ],
      east:[
        {speaker:'WADE',speakerClass:'neutral',text:'Look! Different shoe marks.',tail:'down'}
      ]
    }[support.id]||[];
    this.showDialogue(lines,()=>{
      ring.supports.push(support.id);this.saveChapterState();
      this.questToast('QUEST UPDATED','THE CRACKED RING',`${ring.supports.length} / 3 supports inspected.`);
      if(ring.supports.length>=3){
        ring.complete=true;ring.saboteurDefeated=false;markQuestComplete(this.state.hubQuests,'barkRing');this.saveChapterState();
        this.showDialogue([
          {speaker:'RRVVFO',speakerClass:'p1',text:'We fixed them, but it has to be a fighter. All the spectators are kept away from the rings until the tournament starts.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'We shouldn’t make a big deal out of it yet and worry the guests.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'After the tournament, I’ll figure out who did it. Don’t stress about it, Bark.',tail:'down'},
          {speaker:'BARK',speakerClass:'neutral',text:'Alright. You find the culprit. I’m gonna practice.',tail:'down'}
        ],()=>{
          this.questToast('MAIN QUEST COMPLETE','THE CRACKED RING','Practice ring stabilized. The sabotage remains unresolved.');
          this.updateHubObjective();
        });
      }else this.updateHubObjective();
    });
  }

  useWadeShortcut(shortcut){
    const player=this.battle.fighters[0];
    this.battle.burst(player.x,player.z,'#63c9ff',20,65);
    player.x=shortcut.to.x;player.z=shortcut.to.z;player.vx=0;player.vz=0;
    snapHubCamera(this.battle,player,{distance:1120});
    this.battle.burst(player.x,player.z,'#d9f7ff',24,75);
    this.showAreaTitle(shortcut.arrival);
    this.battle.notice(shortcut.label,1.1);
    this.nearby=null;this.root.querySelector('[data-c2-prompt]').hidden=true;
  }

  beginFoodQuest(){
    const quest=this.state.hubQuests.optional.food;
    quest.started=true;this.state.hubQuests.activeQuest='food';
    this.mode='flame';this.battle.phase='story';
    this.flameGame={active:true,heat:22,target:48+Math.random()*24,order:quest.orders||0,decay:7.5,lastPad:{add:false,serve:false}};
    this.root.querySelector('[data-c2-flame-game]').hidden=false;
    this.renderFlameGame();
    this.saveChapterState();
  }

  addFlameHeat(){
    if(this.mode!=='flame'||!this.flameGame.active)return;
    this.flameGame.heat=clamp(this.flameGame.heat+16,0,100);this.renderFlameGame();
  }

  updateFlameGame(dt){
    if(!this.flameGame.active)return;
    this.flameGame.heat=clamp(this.flameGame.heat-this.flameGame.decay*dt,0,100);
    const pads=navigator.getGamepads?.()||[],assignment=sharedInput.getControllerAssignment(1),mapping=sharedInput.controllerMapping(1);
    const pad=assignment===null?[...pads].find(Boolean):pads[assignment];
    if(pad){
      const add=Boolean(pad.buttons?.[mapping.buttons.a]?.pressed),serve=Boolean(pad.buttons?.[mapping.buttons.h]?.pressed);
      if(add&&!this.flameGame.lastPad.add)this.addFlameHeat();
      if(serve&&!this.flameGame.lastPad.serve)this.serveFlameOrder();
      this.flameGame.lastPad={add,serve};
    }
    this.renderFlameGame();
  }

  renderFlameGame(){
    const target=this.flameGame.target,heat=this.flameGame.heat;
    this.root.querySelector('[data-c2-flame-heat]').style.width=`${heat}%`;
    const zone=this.root.querySelector('[data-c2-flame-target]');zone.style.left=`${clamp(target-9,0,82)}%`;zone.style.width='18%';
    this.root.querySelector('[data-c2-flame-order]').textContent=`Order ${Math.min(3,this.flameGame.order+1)}: serve inside the glowing zone.`;
    this.root.querySelector('[data-c2-flame-status]').textContent=`ORDERS COMPLETE: ${this.flameGame.order} / 3`;
  }

  serveFlameOrder(){
    if(this.mode!=='flame'||!this.flameGame.active)return;
    const servedHeat=this.flameGame.heat,good=Math.abs(servedHeat-this.flameGame.target)<=9;
    if(!good){const result=servedHeat>this.flameGame.target?'TOO HOT':'NOT READY';this.flameGame.heat=18;this.flameGame.target=45+Math.random()*32;this.battle.notice(result,1);this.renderFlameGame();return}
    this.flameGame.order++;this.state.hubQuests.optional.food.orders=this.flameGame.order;
    this.battle.notice('PERFECT HEAT',1);
    if(this.flameGame.order>=3){this.closeFlameGame({resume:false});this.completeFoodQuest();return}
    this.flameGame.heat=20;this.flameGame.target=45+Math.random()*32;this.renderFlameGame();this.saveChapterState();
  }

  closeFlameGame({resume=true}={}){
    this.flameGame.active=false;this.root.querySelector('[data-c2-flame-game]').hidden=true;
    if(resume)this.resumeHub();
  }

  completeFoodQuest(){
    this.showChoice({
      kicker:'SIDE QUEST COMPLETE',title:'CHOOSE A TOURNAMENT MEAL',
      text:'The meal gives one 15% bonus in the next official tournament fight.',
      buttons:[{label:'POWER MEAL',value:'power',primary:true},{label:'DEFENSE MEAL',value:'defense'},{label:'SPEED MEAL',value:'speed'}],
      onChoose:value=>{
        const quest=this.state.hubQuests.optional.food;quest.complete=true;quest.rewardClaimed=true;
        this.state.hubQuests.bonuses.meal=value;markQuestComplete(this.state.hubQuests,'food');this.saveChapterState();
        this.questToast('SIDE QUEST COMPLETE','CONTROLLED FLAME',`${value.toUpperCase()} meal prepared for the next official fight.`);this.resumeHub();
      }
    });
  }

  beginFakeChampionQuest(){
    const quest=this.state.hubQuests.optional.fakeChampion;
    this.showDialogue([
      {speaker:'LOUD CHAMPION',speakerClass:'rival',text:'PAY ME 20 COINS, AND I’LL TEACH YOU MY SECRET TECHNIQUES!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Let’s spar in the practice ring. You can showcase those techniques.',tail:'down'},
      {speaker:'LOUD CHAMPION',speakerClass:'rival',text:'No. The technique isn’t meant for demonstrations.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I knew that guy was shady.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fight me, or I’ll expose your sham.',tail:'down'}
    ],()=>{
      quest.started=true;this.saveChapterState();
      this.startFight({id:'fake-champion',name:'Loud Champion',hp:100,xp:55,kind:'fake-champion',story:false,intro:'OPTIONAL • THE FAKE CHAMPION'});
    });
  }

  beginLostFanQuest(){
    const quest=this.state.hubQuests.optional.lostFan;
    if(!quest.started){
      this.showDialogue([
        {speaker:'LOST WADE FAN',speakerClass:'neutral',text:'I lost my family while looking for Wade. Do you know him?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Wade? Uh, me and him used to train together. Why?',tail:'down'},
        {speaker:'LOST WADE FAN',speakerClass:'neutral',text:'Please help me find him.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Wade’s gonna be hard to find since he rarely stays still.',tail:'down'}
      ],()=>{quest.started=true;this.state.hubQuests.activeQuest='lostFan';this.saveChapterState();this.questToast('SIDE QUEST STARTED','WADE’S BIGGEST FAN','Bring Wade to the lost fan.');this.resumeHub()});
    }else this.showDialogue([{speaker:'LOST WADE FAN',speakerClass:'neutral',text:'Did you find Wade?',tail:'down'}]);
  }

  completeLostFanQuest(){
    this.showDialogue([
      {speaker:'WADE',speakerClass:'neutral',text:'Hey, bud! It’s me, Wade. Here, have this pin on me.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Hey, isn’t that your father at the food court?',tail:'down'},
      {speaker:'LOST WADE FAN',speakerClass:'neutral',text:'Oh, yeah! Thank you!',tail:'down'}
    ],()=>this.finishOptionalQuest('lostFan',{hp:6},'+6 permanent Story HP'));
  }

  beginDummyQuest(){
    const quest=this.state.hubQuests.optional.dummy;
    this.showChoice({
      kicker:'OPTIONAL COMBAT QUEST',title:'DUMMY ON THE LOOSE',
      text:'Complete all three mechanics: Perfect Parry once, launch and Pursue once, then Grab the blocking dummy. Only then can you finish it.',
      buttons:[{label:'START CHALLENGE',value:'fight',primary:true},{label:'LEAVE',value:'leave'}],
      onChoose:value=>{
        if(value==='fight'){
          quest.started=true;quest.parries=0;quest.pursuit=false;quest.grab=false;
          this.startFight({id:'practice-dummy',name:'Runaway Dummy',hp:100,xp:65,kind:'dummy',story:false,intro:'OPTIONAL • PARRY, PURSUIT, GRAB'});
        }
        else this.resumeHub();
      }
    });
  }

  recordDummyParry(event){
    if(this.mode!=='fight'||this.currentFight?.kind!=='dummy'||event?.detail?.cpu!==false)return;
    const quest=this.state.hubQuests.optional.dummy;
    if(quest.parries)return;
    quest.parries=1;this.saveChapterState();this.battle.notice('STEP 1 COMPLETE • PERFECT PARRY',1.3);this.updateDummyObjective();
  }

  updateDummyObjective(){
    if(this.currentFight?.kind!=='dummy')return;
    const quest=this.state.hubQuests.optional.dummy;
    const marks=[`PARRY ${quest.parries?'✓':'○'}`,`PURSUIT ${quest.pursuit?'✓':'○'}`,`GRAB ${quest.grab?'✓':'○'}`];
    const complete=Boolean(quest.parries&&quest.pursuit&&quest.grab);
    this.setObjective(complete?'FINISH THE RUNAWAY DUMMY':'COMPLETE THE MECHANICS DRILL',marks.join(' • '));
  }

  beginPrizeCartQuest(){
    const quest=this.state.hubQuests.optional.prizeCart;
    if(!quest.started){
      this.showDialogue([
        {speaker:'TOURNAMENT CASHIER',speakerClass:'neutral',text:'The final prize envelope stuck to the delivery cart. It’s circling the grounds.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Wow. This place really is held together with duct tape.',tail:'down'},
        {speaker:'TOURNAMENT CASHIER',speakerClass:'neutral',text:'Please stop the cart before the announcer notices.',tail:'down'}
      ],()=>{quest.started=true;this.state.hubQuests.activeQuest='prizeCart';this.saveChapterState();this.questToast('SIDE QUEST STARTED','THE MISSING PRIZE ENVELOPE','Catch the moving delivery cart.');this.resumeHub()});
    }else this.showDialogue([{speaker:'TOURNAMENT CASHIER',speakerClass:'neutral',text:'The cart keeps circling Market Street. Interact when you catch it.',tail:'down'}]);
  }

  catchPrizeCart(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'I only saved the prize money since it’s going to be mine.',tail:'down'},
      {speaker:'TOURNAMENT CASHIER',speakerClass:'neutral',text:'You can keep the delivery fee. The food vendor will also give you the staff meal discount.',tail:'down'}
    ],()=>{
      const quest=this.state.hubQuests.optional.prizeCart;quest.complete=true;quest.rewardClaimed=true;
      this.state.hubQuests.bonuses.coins+=80;this.state.hubQuests.bonuses.vendorDiscount=true;markQuestComplete(this.state.hubQuests,'prizeCart');this.saveChapterState();
      this.questToast('SIDE QUEST COMPLETE','THE MISSING PRIZE ENVELOPE','80 coins earned. Discounted tournament meals now cost 20.');this.resumeHub();
    });
  }

  beginRejectedChallengerQuest(){
    const quest=this.state.hubQuests.optional.challenger;
    this.showDialogue([
      {speaker:'REJECTED CHALLENGER',speakerClass:'neutral',text:'My registration was ruined before I reached the desk. I trained for months.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You trained that much? Fight me. I’m a competitor, so your training doesn’t go to waste.',tail:'down'}
    ],()=>this.showChoice({
      kicker:'OPTIONAL SIDE QUEST',title:'ONE MATCH ANYWAY',
      text:'Give the rejected challenger one meaningful first-to-one match.',
      buttons:[{label:'SPAR',value:'fight',primary:true},{label:'NOT NOW',value:'leave'}],
      onChoose:value=>{
        if(value==='fight'){quest.started=true;this.startFight({id:'rejected-challenger',name:'Rejected Challenger',hp:100,xp:70,kind:'challenger',story:false,intro:'OPTIONAL • ONE MATCH ANYWAY'})}
        else this.resumeHub();
      }
    }));
  }

  chooseChallengerReward(){
    this.showChoice({
      kicker:'SIDE QUEST COMPLETE',title:'TRAINING TOKEN',
      text:'Choose which part of the spar Rrvvfo keeps working on.',
      buttons:[{label:'+1 POWER',value:'power',primary:true},{label:'+1 SPEED',value:'speed'}],
      onChoose:value=>this.finishOptionalQuest('challenger',{[value]:1},`+1 permanent Story ${value.toUpperCase()}`)
    });
  }

  finishOptionalQuest(key,bonus={},detail='Reward earned'){
    const quest=this.state.hubQuests.optional[key];if(!quest||quest.complete){this.resumeHub();return}
    quest.complete=true;quest.rewardClaimed=true;markQuestComplete(this.state.hubQuests,key);
    if(!this.replayMode){
      const progress=loadLostYearProgress(),current={hp:0,power:0,defense:0,speed:0,focus:0,...(progress.storyBonusStats||{})};
      for(const stat of ['hp','power','defense','speed','focus'])current[stat]=Math.max(0,Number(current[stat])||0)+Math.max(0,Number(bonus[stat])||0);
      this.progress=saveLostYearProgress({...progress,storyBonusStats:current});
    }
    for(const stat of ['hp','power','defense','speed','focus'])this.state.hubQuests.bonuses[stat]+=Math.max(0,Number(bonus[stat])||0);
    this.saveChapterState();this.updateLevelHud();this.questToast('SIDE QUEST COMPLETE',CHAPTER2_OPTIONAL_QUESTS[key]?.title||key.toUpperCase(),detail);this.resumeHub();
  }

  offerCurrentPloukeClue(sourceId){
    if(!this.state.tournamentStarted||!this.state.intermission)return false;
    const rumors=this.state.hubQuests.mandatory.ploukeRumors,clue=CHAPTER2_PLOUKE_CLUES[rumors.clues.length];
    if(!clue)return false;
    const sourceMap={veteran:'OLD COMPETITOR',worker:'TOURNAMENT WORKER',bark:'BARK',wade:'WADE'};
    if(sourceMap[sourceId]!==clue.source)return false;
    this.showDialogue([
      {speaker:clue.source,speakerClass:sourceId==='bark'||sourceId==='wade'?'neutral':'neutral',text:clue.text,tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:this.ploukeReactionForClue(clue.id),tail:'down'}
    ],()=>this.playPloukeClueActivity(clue));
    return true;
  }

  playPloukeClueActivity(clue){
    const activities={
      stillness:{title:'READ THE REPLAY',text:'The replay pauses before Plouke’s first move. What is he waiting for?',correct:'commit',buttons:[['THE FIRST COMMITMENT','commit'],['THE CROWD TO CHEER','crowd']]},
      positioning:{title:'INSPECT THE FLOOR MARKS',text:'Every scuff line curves toward the boundary. What is Plouke controlling?',correct:'edge',buttons:[['THE PATH TO THE EDGE','edge'],['THE CENTER LOGO','logo']]},
      timing:{title:'BARK’S RHYTHM DRILL',text:'Bark repeats Plouke’s two-beat defense. Which response breaks the prediction?',correct:'delay',buttons:[['DELAY THE SECOND OPTION','delay'],['REPEAT THE SAME COMBO','repeat']]},
      edge:{title:'WADE’S RING ROUTE',text:'Wade recreates Plouke’s retreat. What stops Rrvvfo from being led out?',correct:'center',buttons:[['CUT THROUGH CENTER','center'],['CHASE THE OUTSIDE LINE','chase']]}
    };
    const activity=activities[clue.id];if(!activity)return this.completePloukeClue(clue);
    this.showChoice({
      kicker:'PLAYABLE PLOUKE STUDY',title:activity.title,text:activity.text,
      buttons:activity.buttons.map(([label,value],index)=>({label,value,primary:index===0})),
      onChoose:value=>{
        if(value!==activity.correct){
          this.battle.notice('THAT IS THE TRAP PLOUKE WANTS',1.4);
          this.playPloukeClueActivity(clue);return;
        }
        this.battle.notice('PLOUKE PATTERN VERIFIED',1.2);this.completePloukeClue(clue);
      }
    });
  }

  completePloukeClue(clue){
    const rumors=this.state.hubQuests.mandatory.ploukeRumors;
    if(!rumors.clues.includes(clue.id))rumors.clues.push(clue.id);
    rumors.complete=rumors.clues.length>=CHAPTER2_PLOUKE_CLUES.length;
    if(rumors.complete)markQuestComplete(this.state.hubQuests,'ploukeRumors');
    this.saveChapterState();this.questToast('RUMOR VERIFIED','RUMORS ABOUT PLOUKE',`${rumors.clues.length} / 4 reliable clues.`);this.updateHubObjective();this.resumeHub();
  }

  ploukeReactionForClue(id){
    return({stillness:'So he waits for people to slip up.',positioning:'So I have to be a little more cautious.',timing:'If he has Bark on edge, I should take him a little more seriously.',edge:'Maybe that gave me some clues. He probably rings people out a lot. I should observe the matches.'}[id]||'I will remember that.');
  }

  questToast(kicker,title,detail){
    const panel=this.root.querySelector('[data-c2-quest-toast]');
    this.root.querySelector('[data-c2-quest-kicker]').textContent=kicker;
    this.root.querySelector('[data-c2-quest-title]').textContent=title;
    this.root.querySelector('[data-c2-quest-detail]').textContent=detail||'';
    panel.hidden=false;this.questToastTimer=3.4;
    this.renderQuestJournal();
  }

  renderQuestJournal(){
    const summary=chapter2QuestSummary(this.state.hubQuests);
    const render=items=>items.map(item=>`<span class="${item.done?'done':''}"><b>${item.done?'✓':'◇'}</b><strong>${item.title}</strong><small>${item.detail}</small></span>`).join('');
    const discoveredOptional=summary.optional.filter(item=>item.started||item.done);
    const main=this.root.querySelector('[data-c2-main-quests]'),side=this.root.querySelector('[data-c2-side-quests]');
    if(main)main.innerHTML=render(summary.mandatory);
    if(side)side.innerHTML=discoveredOptional.length?render(discoveredOptional):'<span class="questDiscoveryHint"><b>?</b><strong>EXPLORE THE GROUNDS</strong><small>Blue markers reveal optional character quests. They are never required to advance.</small></span>';
  }

  showIntermissionArrival(){
    const step=this.state.tournamentStep||'quarterfinal',required=requiredRumorCountForStep(step),found=this.state.hubQuests.mandatory.ploukeRumors.clues.length;
    const intermissionText={
      'after-round-1':'Hamual is recovering in the medical tent. Workers are repairing the edge Rrvvfo damaged, and Daniel is studying the new bracket.',
      'after-quarterfinal':'Daniel is reviewing the match in the medical tent. The crowd has moved toward Bark and Pouki’s ring.',
      'after-bark-pouki':'Bark is resting near the medical tent. Arena crews are rebuilding the section Pouki damaged.',
      'before-final':'The food stand has its final-round menu ready. Bark and Wade are waiting beside the preparation bench.'
    }[this.state.intermission];
    const lines=[
      {speaker:'ANNOUNCER',speakerClass:'rival',text:`The next bracket call is ${String(step).replaceAll('-',' ')}! Fighters may return to the grounds before reporting!`,tail:'down'},
      {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:intermissionText||'The bracket board, food stand, medical tent, and arena state have all been updated.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Good. I can prepare without pretending the last match never happened.',tail:'down'}
    ];
    if(found<required)lines.push({speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Someone around the grounds saw Plouke’s last match. It might be useful.',tail:'down'});
    this.showDialogue(lines,()=>this.updateHubObjective());
  }

  beginGruntEncounter(npc){
    this.pendingGrunt=npc;
    this.showChoice({
      kicker:'NON-STORY ENCOUNTER',title:npc.label,
      text:'This grunt is optional. Fight or attempt the escape sequence. Failing the escape forces the battle.',
      buttons:[
        {label:'FIGHT',value:'fight',primary:true},
        {label:'RUN',value:'run'}
      ],
      onChoose:value=>{
        if(value==='fight')this.startFight({id:npc.id,name:npc.label,hp:44,xp:40,kind:'grunt',story:false,intro:'OPTIONAL GRUNT FIGHT'});
        else this.startRunQte(npc);
      }
    });
  }

  startRunQte(npc){
    this.pendingGrunt=npc;this.qtePurpose='run';
    this.root.querySelector('[data-c2-qte] h2').textContent='ESCAPE SEQUENCE';
    this.mode='qte';this.battle.phase='story';
    this.root.querySelector('[data-c2-qte]').hidden=false;
    this.qteSequence=['KeyA','Space','KeyD'];this.qteIndex=0;this.qteDeadline=performance.now()+3600;
    this.renderQte();
  }

  renderQte(){
    const device=this.engine?.activeInput?.()||'keyboard';
    const labels={KeyA:device==='keyboard'?'A':'←',KeyD:device==='keyboard'?'D':'→',Space:this.engine?.prompt?.('jump','SPACE')||'SPACE'};
    this.root.querySelector('[data-c2-qte-sequence]').innerHTML=this.qteSequence.map((key,index)=>`<span class="${index<this.qteIndex?'done':index===this.qteIndex?'current':''}">${labels[key]}</span>`).join('');
  }

  acceptQteInput(key){
    if(this.mode!=='qte')return;
    if(key===this.qteSequence[this.qteIndex]){
      this.qteIndex++;this.renderQte();
      if(this.qteIndex>=this.qteSequence.length)this.finishRunQte(true);
    }else this.finishRunQte(false);
  }

  updateQte(){
    const remaining=clamp((this.qteDeadline-performance.now())/3600,0,1);
    this.root.querySelector('[data-c2-qte-timer]').style.width=`${remaining*100}%`;
    if(remaining<=0){this.finishRunQte(false);return}
    const pads=navigator.getGamepads?.()||[],assignment=sharedInput.getControllerAssignment(1);
    const activePads=assignment===null?[...pads].filter(Boolean):[pads[assignment]].filter(Boolean);
    for(const pad of activePads){
      const values={KeyA:pad.buttons[14]?.pressed||pad.axes[0]<-.55,KeyD:pad.buttons[15]?.pressed||pad.axes[0]>.55,Space:pad.buttons[sharedInput.controllerMapping(1).buttons.j]?.pressed};
      for(const [key,pressed] of Object.entries(values)){
        const before=this.qteGamepadState[key];this.qteGamepadState[key]=pressed;
        if(pressed&&!before){this.acceptQteInput(key);return}
      }
    }
  }

  finishRunQte(success){
    if(this.mode!=='qte')return;
    this.root.querySelector('[data-c2-qte]').hidden=true;this.qteGamepadState={};
    if(this.qtePurpose==='repair'){
      const support=this.pendingSupport;this.pendingSupport=null;this.qtePurpose='run';
      if(success){this.completeRingSupport(support)}
      else{this.battle.notice('THE BRACE SLIPPED • TRY THE INPUT AGAIN',1.3);this.resumeHub()}
      return;
    }
    const npc=this.pendingGrunt;
    if(success){
      this.gruntCooldown[npc.id]=8;
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'I’m not in the mood for this.',tail:'down'},
        {speaker:npc.label,speakerClass:'rival',text:'You ran away.',tail:'down'}
      ],()=>this.resumeHub());
    }else{
      this.battle.notice('ESCAPE FAILED • FIGHT FORCED',1.4);
      this.startFight({id:npc.id,name:npc.label,hp:44,xp:40,kind:'grunt',story:false,intro:'ESCAPE FAILED'});
    }
  }

  inspectBracket(){
    const rumors=this.state.hubQuests.mandatory.ploukeRumors;
    if(this.state.tournamentStarted&&this.state.tournamentStep!=='complete'){
      const step=this.state.tournamentStep||'round-1',required=requiredRumorCountForStep(step);
      if(this.state.intermission&&rumors.clues.length<required){
        const clue=CHAPTER2_PLOUKE_CLUES[rumors.clues.length];
        this.showDialogue([
          {speaker:'BRACKET BOARD',speakerClass:'neutral',text:`NEXT: ${String(step).replaceAll('-',' ').toUpperCase()}.`,tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:`Before that, ${clue?.source||'somebody nearby'} knows something about Plouke.`,tail:'down'}
        ]);return;
      }
      this.showChoice({
        kicker:'TOURNAMENT BRACKET',title:`NEXT: ${String(step).replaceAll('-',' ').toUpperCase()}`,
        text:'The next official event is ready. Optional quests and shops remain available before entering the ring.',
        buttons:[{label:'ENTER THE ARENA',value:'resume',primary:true},{label:'KEEP EXPLORING',value:'leave'}],
        onChoose:value=>{
          if(value==='resume'){this.state.intermission=null;this.saveChapterState();this.startTournamentStep(step)}
          else this.resumeHub();
        }
      });return;
    }
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Looks like I’m fighting unknown fighters in the prelims.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'What’s an unknown?',tail:'down'}
    ]);
  }

  useRegistration(){
    if(this.offerCurrentPloukeClue('worker'))return;
    const quests=this.state.hubQuests;
    if(this.state.tournamentStarted&&this.state.tournamentStep!=='complete'){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Use the bracket board by the waiting tent when you are ready for the next event.',tail:'down'}]);return;
    }
    if(!quests.mandatory.bracket.complete){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'The announcer is still rebuilding the bracket. Help recover the missing cards first.',tail:'down'}]);return;
    }
    if(!this.state.firstBrawlComplete){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'No entry until your practice-ring check is complete.',tail:'down'}]);return;
    }
    if(!this.state.metBarkWade){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Your group is still gathering in the plaza. Talk to them first.',tail:'down'}]);return;
    }
    if(!chapter2MandatoryReadyForTournament(quests)){
      const missing=[];
      if(!quests.mandatory.wadeRace.complete)missing.push('finish Wade’s route');
      if(!quests.mandatory.barkRing.complete)missing.push('repair Bark’s practice ring');
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:`Registration is ready after you ${missing.join(' and ')}.`,tail:'down'}]);return;
    }
    this.showChoice({
      kicker:'STORY PROGRESSION',title:'START THE TOURNAMENT?',
      text:'The bracket begins with two official matches. The tournament grounds reopen between rounds for rumors, preparation, and optional quests.',
      buttons:[{label:'START TOURNAMENT',value:'start',primary:true},{label:'KEEP EXPLORING',value:'leave'}],
      onChoose:value=>{
        if(value==='start'){
          this.state.tournamentStarted=true;this.state.tournamentStep='opening-ceremony';this.state.intermission=null;this.saveChapterState();
          this.startTournamentStep('opening-ceremony');
        }else this.resumeHub();
      }
    });
  }

  startFight(config){
    const official=Boolean(config.kind==='tournament'||config.kind==='final');
    const optional=Boolean(['practice','bark-spar','grunt','fake-champion','dummy','challenger'].includes(config.kind));
    const enemyLevel=this.enemyLevelFor(config);
    const playerStats=storyStatsForLevel(this.level,this.progress.storyBonusStats||{});
    const bossHpBonus=config.final?.10:0;
    const enemyStats=storyStatsForLevel(enemyLevel);
    const baseEnemyHp=Math.round(enemyStats.hp*(1+bossHpBonus)*(Number(config.hpScale)||1));
    const assisted=Boolean(config.storyAssist||this.storyAssistFights.has(config.id));
    const opponentMaxHp=Math.max(1,Math.round(baseEnemyHp*(assisted?.90:1)));
    const selectedMeal=config.mealBuff??(official?this.state.hubQuests.bonuses.meal:null);
    const consumeMeal=Boolean(official&&!config.mealBuff&&selectedMeal);
    this.currentFight={...config,official,optional,storyAssist:assisted,enemyLevel,elapsed:0,koTarget:config.final?1:official?3:1,playerKOs:0,foeKOs:0,koLocked:false,opponentMaxHp,playerMaxHp:playerStats.hp,lowestEnemyHp:opponentMaxHp,crowdTier:0,mealBuff:selectedMeal};
    this.root.querySelector('[data-c2-prompt]').hidden=true;
    this.mode='transition';
    const beginFight=()=>{
      this.battle.fighters[0].id='rrvvfo';
      this.battle.fighters[1].id=config.id;
      this.switchStage('tournament');
      this.mode='fight';
      const player=this.battle.fighters[0],foe=this.battle.fighters[1];
      player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(-370,78);void this.battle.ensureFighterAsset(player,'rrvvfo');
      applyStoryProgressionToFighter(player,{...this.progress,storyLevel:this.level,storyXp:this.xp});
      player.en=config.final?80:45;player.guard=100;
      if(this.currentFight.mealBuff==='power')player.storyAttackMultiplier*=1.15;
      else if(this.currentFight.mealBuff==='defense')player.storyDefenseMultiplier*=.85;
      else if(this.currentFight.mealBuff==='speed')player.storySpeedMultiplier*=1.15;
      if(this.currentFight.mealBuff){if(consumeMeal){this.state.hubQuests.bonuses.meal=null;this.saveChapterState()}this.battle.notice(`${this.currentFight.mealBuff.toUpperCase()} MEAL ACTIVE`,1.6)}
      if(assisted){player.storyAttackMultiplier*=1.12;player.storyDefenseMultiplier*=.90}
      foe.id=config.id;foe.name=config.name;foe.accent=this.opponentAccent(config.id);foe.cpu=true;foe.visualScale=Number(config.visualScale)||1;foe.reset(370,-78);foe.asset=null;
      applyStoryLevelToFighter(foe,enemyLevel,{bossHpBonus});
      foe.bodyCenter*=foe.visualScale;foe.collisionRadius*=Math.min(1.45,foe.visualScale);
      foe.maxHp=opponentMaxHp;foe.hp=opponentMaxHp;foe.en=config.final?80:45;foe.guard=100;
      if(assisted){foe.storyAttackMultiplier*=.92;foe.storySpeedMultiplier*=.96}
      this.battle.koTarget=this.currentFight.koTarget;this.battle.scores=[0,0];this.battle.round=1;this.battle.phase='play';this.battle.time=Infinity;this.battle.hideBanner();
      this.battle.ringOutEnabled=Boolean((this.currentFight.official&&!config.final)||config.ringOutTutorial);
      this.battle.onRingOut=fighter=>{
        if(this.mode!=='fight'||(!this.currentFight?.official&&!this.currentFight?.ringOutTutorial)||this.currentFight?.final||this.currentFight?.koLocked)return;
        this.handleFightKo(fighter===this.battle.fighters[1],'RING OUT');
      };
      this.battle.root.classList.remove('chapter2HubMode');
      this.battle.root.classList.add('chapter2StoryActive','chapter2FightMode');
      this.root.classList.add('isFight');
      this.battle.root.querySelector('[data-stage-name]').textContent=`LOCAL TOURNAMENT • ${config.name.toUpperCase()}`;
      this.setArenaNames('RRVVFO',config.name.toUpperCase());
      this.root.querySelector('[data-tournament-run]').hidden=false;
      const assistText=assisted?' • STORY ASSIST ACTIVE':'';
      this.setObjective(
        config.final?'TRY TO BEAT PLOUKE':this.currentFight.official?'SCORE 3 KOs OR RING-OUTS TO ADVANCE':'SCORE 1 KO TO WIN',
        config.final
          ?`Plouke is Level ${enemyLevel} with a visible boss HP bonus. Fight as long as you can.${assistText}`
          :this.currentFight.official
            ?`${config.name} is Level ${enemyLevel}. KOs and ring-outs both count.${assistText}`
            :`${config.name} is Level ${enemyLevel}. This fight ends after one KO and ring-outs are disabled.${assistText}`
      );
      if(config.kind==='dummy')this.updateDummyObjective();
      this.updateLevelHud();
    };
    if(config.skipCard)beginFight();else this.showTournamentCard(config.intro||'FIGHT',`${config.name} is waiting in the ring. Level ${enemyLevel}${assisted?' • Story Assist':''}.`,beginFight);
  }

  enemyLevelFor(config={}){
    const expected={hamual:2,daniel:3,wade:4,plouke:5}[config.id];
    if(!expected)return this.level;
    return this.level>expected+2?expected+1:expected;
  }

  opponentAccent(id){
    return({bark:'#9a6a3a',wade:'#2f91e3',pouki:'#6ca2a7',plouke:'#e6ddc7',hailey:'#e16b9a',hamual:'#c86f3d',daniel:'#5b76a9','practice-fighter':'#6f8fbe','qualifier-fighter':'#cf7446','bracket-fighter':'#9a6cc9','grunt-a':'#7d8694','grunt-b':'#5e6672','fake-champion':'#d36a58','practice-dummy':'#a98c5e','rejected-challenger':'#6f84bc'}[id]||'#8667c7');
  }


  handleFightKo(playerWon,finishLabel='K.O.'){
    const fight=this.currentFight;
    if(this.mode!=='fight'||!fight||fight.final||fight.koLocked)return;
    fight.koLocked=true;
    fight.lastLoser=playerWon?1:0;
    if(playerWon)fight.playerKOs++;else fight.foeKOs++;
    this.battle.scores=[fight.playerKOs,fight.foeKOs];
    this.battle.phase='story';this.mode='fight-ko';
    this.battle.banner(`${finishLabel} • ${fight.playerKOs}–${fight.foeKOs}`);
    this.battle.audio.play('ko');this.battle.hud();
    this.setObjective(`FIRST TO ${fight.koTarget} KOs`,`${fight.name}: ${fight.playerKOs}–${fight.foeKOs}. ${playerWon?'Opponent':'Rrvvfo'} will respawn.`);
    clearTimeout(this.koTimer);
    const matchOver=(playerWon?fight.playerKOs:fight.foeKOs)>=fight.koTarget;
    this.koTimer=window.setTimeout(()=>{
      if(this.aborted||this.currentFight!==fight)return;
      if(matchOver){this.mode='fight';this.finishCurrentFight(playerWon);return}
      this.resetFightAfterKo();
    },700);
  }

  resetFightAfterKo(){
    const fight=this.currentFight;if(!fight||fight.final)return;
    const loserIndex=Number.isInteger(fight.lastLoser)?fight.lastLoser:1;
    fight.koLocked=false;this.mode='fight';
    this.battle.koTarget=fight.koTarget;this.battle.scores=[fight.playerKOs,fight.foeKOs];
    this.battle.round=fight.playerKOs+fight.foeKOs+1;
    // Continuous stock combat: only the defeated fighter respawns. The winner
    // keeps health, energy, position, and pressure just like one uninterrupted battle.
    this.battle.respawnAfterKo(loserIndex);this.battle.time=Infinity;
    const foe=this.battle.fighters[1],scale=Number(fight.visualScale)||1;
    foe.visualScale=scale;foe.bodyCenter=68*scale;foe.collisionRadius=29*Math.min(1.45,scale);
    this.setArenaNames('RRVVFO',fight.name.toUpperCase());
    this.setObjective(`FIRST TO ${fight.koTarget} KOs`,`Score ${fight.koTarget} KOs to win. KOs and ring-outs count. Current score: ${fight.playerKOs}–${fight.foeKOs}.`);
  }

  setArenaNames(left,right){
    const leftName=this.battle.root.querySelector('.side:not(.r) .name span:first-child');
    const rightName=this.battle.root.querySelector('.side.r .name span:first-child');
    if(leftName)leftName.textContent=left;
    if(rightName)rightName.textContent=right;
  }

  updateFight(dt){
    if(!this.currentFight)return;
    this.currentFight.elapsed+=dt;
    if(this.currentFight.id==='daniel'&&!this.currentFight.ringShifted&&this.currentFight.elapsed>9){
      this.currentFight.ringShifted=true;
      this.battle.cameraShake=Math.max(this.battle.cameraShake||0,8);
      this.battle.notice('RING SUPPORT SHIFTS • EDGE DANGER INCREASED',2);
      this.setObjective('QUARTERFINAL • ADAPT TO THE MOVING RING','The east edge buckled for a moment. Keep the fight centered while the floor settles.');
    }
    const player=this.battle.fighters[0];
    if(this.currentFight.final){
      this.finalElapsed+=dt;
      if(this.finalPhase==='opening'&&this.finalElapsed>38)this.beginFinalFatigue();
      if(this.finalPhase==='fatigue'){
        player.en=Math.max(0,player.en-dt*5.5);
        if(this.finalElapsed>68)this.offerAwakening();
      }
      if(this.finalPhase==='awakening-ready'){
        const remaining=Math.max(0,this.awakeningReadyAt-performance.now());
        const seconds=Math.ceil(remaining/1000);
        if(seconds!==this.lastAwakeningSecond){
          this.lastAwakeningSecond=seconds;
          this.setObjective('TRY FIRE AWAKENING',seconds>0?`Press hotbar slot 5. Automatic fallback in ${seconds}...`:'Fire Awakening is triggering...');
          this.battle.notice(seconds>0?`${this.engine.prompt('ability5','PRESS 5')} • ${seconds}`:'AUTO ACTIVATING',.9);
        }
        if(remaining<=0)this.triggerAwakeningAttempt();
      }
    }
  }

  finishCurrentFight(won){
    if(this.mode!=='fight'||!this.currentFight||this.currentFight.final)return;
    const fight=this.currentFight;
    this.mode='story';this.battle.phase='story';
    this.root.querySelector('[data-tournament-run]').hidden=true;
    if(!won){
      const losses=(this.fightLosses[fight.id]||0)+1;
      this.fightLosses[fight.id]=losses;
      const buttons=[{label:'RETRY NORMALLY',value:'retry',primary:true}];
      if(losses>=2)buttons.push({label:'USE STORY ASSIST',value:'assist'});
      buttons.push({label:fight.official?'TOURNAMENT MENU':'LEAVE ENCOUNTER',value:'leave'});
      this.showChoice({
        kicker:fight.official?'TOURNAMENT DEFEAT':'ENCOUNTER LOST',
        title:`${fight.name.toUpperCase()} WINS ${fight.playerKOs}–${fight.foeKOs}`,
        text:losses>=2?'Story Assist slightly strengthens Rrvvfo and lowers this opponent without changing the story.':'Retry at 0–0 or step away and return later.',
        buttons,
        onChoose:value=>{
          if(value==='assist'){
            this.storyAssistFights.add(fight.id);
            this.startFight({...fight,storyAssist:true,skipCard:true});
          }else if(value==='retry')this.startFight({...fight,storyAssist:false,skipCard:true});
          else this.enterHub({spawn:{x:-220,z:-330}});
        }
      });
      return;
    }

    this.fightLosses[fight.id]=0;
    this.grantXp(fight.xp||0,`${fight.name.toUpperCase()} DEFEATED`,()=>{
      if(fight.kind==='practice'){
        this.state.firstBrawlComplete=true;this.saveChapterState();
        this.showDialogue([
          {speaker:'PRACTICE RING FIGHTER',speakerClass:'rival',text:'Hey, have you heard of a level system? Look in your pocket. That book that says Fighting 101 must mention it.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah, it does. Why?',tail:'down'},
          {speaker:'WADE',speakerClass:'neutral',text:'Rrvvfo!',tail:'down'}
        ],()=>this.enterHub({spawn:{x:-420,z:80}}));
      }else if(fight.kind==='bark-spar'){
        this.state.barkSparResult='won';this.saveChapterState();
        this.showDialogue([
          {speaker:'BARK',speakerClass:'neutral',text:'You’ve gotten faster, but save your power for the tournament.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'I won’t need to if I’m gonna be fighting weaklings like you.',tail:'down'},
          {speaker:'BARK',speakerClass:'neutral',text:'We’ll see when I win.',tail:'down'}
        ],()=>this.enterHub({spawn:{x:40,z:170}}));
      }else if(fight.kind==='fake-champion'){
        this.showDialogue([
          {speaker:'RRVVFO',speakerClass:'p1',text:'Pay back everyone you scammed.',tail:'down'}
        ],()=>this.finishOptionalQuest('fakeChampion',{focus:1},'+1 permanent Story Focus'));
      }else if(fight.kind==='dummy'){
        this.showDialogue([
          {speaker:'ARENA MECHANIC',speakerClass:'neutral',text:'It stopped moving. More importantly, it stopped challenging the food carts.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'What a weird machine.',tail:'down'}
        ],()=>this.finishOptionalQuest('dummy',{defense:1},'+1 permanent Story Defense'));
      }else if(fight.kind==='challenger'){
        this.showDialogue([
          {speaker:'REJECTED CHALLENGER',speakerClass:'neutral',text:'I have to leave early, but I’ll be rooting for you.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'Good luck on your travels.',tail:'down'}
        ],()=>this.chooseChallengerReward());
      }else if(fight.kind==='grunt'){
        this.state.gruntDefeated=unique([...this.state.gruntDefeated,fight.id]);this.saveChapterState();
        this.showDialogue([
          {speaker:fight.name.toUpperCase(),speakerClass:'rival',text:'Fine. Go win your tournament.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'Of course I am. Thanks for the warm-up.',tail:'down'}
        ],()=>this.enterHub({spawn:{x:550,z:300}}));
      }else if(fight.story){
        this.afterTournamentFight(fight);
      }
    });
  }

  showTournamentCard(title,text,onContinue){
    this.root.querySelector('[data-c2-prompt]').hidden=true;
    const panel=this.root.querySelector('[data-tournament-card]');
    this.root.querySelector('[data-tournament-title]').textContent=title;
    this.root.querySelector('[data-tournament-text]').textContent=text;
    panel.hidden=false;this.mode='card';this.battle.phase='story';
    this.cardContinue=onContinue;
    panel.querySelector('[data-tournament-continue]').focus();
  }

  continueTournamentCard(){
    const panel=this.root.querySelector('[data-tournament-card]');
    if(panel.hidden)return;
    panel.hidden=true;
    const callback=this.cardContinue;this.cardContinue=null;callback?.();
  }

  startTournamentFromCheckpoint(){
    const step=this.state.tournamentStep||'round-1';
    this.startTournamentStep(step);
  }

  startTournamentStep(step){
    this.state.tournamentStep=step;this.saveChapterState();
    const story=true;
    if(step==='opening-ceremony'){
      this.showTournamentCard('OPENING CEREMONY','Every major contestant enters the main arena before the preliminaries.',()=>this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Welcome to the local tournament! Hamual, Daniel, Hailey, Bark, Wade, Pouki, Plouke—and first-time entrant Rrvvfo!',tail:'down'},
        {speaker:'CROWD',speakerClass:'neutral',text:'The former champion Hamual towers over the entrance line. Daniel looks ordinary enough to be tournament staff.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Of course the Sage isn’t here. He always disappears when I’m supposed to need him.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'First preliminary: Hailey versus Plouke!',tail:'down'}
      ],()=>{this.state.ceremonyComplete=true;this.saveChapterState();this.startHaileyPrelim()}));
    }else if(step==='round-1'){
      discoverCombatManualPage('tournament-rules',{
        reactionLines:[
          'Ring-outs are dangerous. They could push me off, so I shouldn’t camp near the edge.'
        ],
        onClose:()=>this.showDialogue([
          {speaker:'ANNOUNCER',speakerClass:'rival',text:'Official matches are first to three! A knockout or crossing the ring boundary removes one stock!',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'I should stay away from the edge.',tail:'down'},
          {speaker:'ANNOUNCER',speakerClass:'rival',text:'Opening round! Rrvvfo versus Hamual—the enormous former champion!',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'He looks like he’d eat me for breakfast.',tail:'down'},
          {speaker:'HAMUAL',speakerClass:'rival',text:'Don’t confuse size with slowness. I won this bracket before you entered one.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'You couldn’t win even if you were ten times bigger.',tail:'down'}
        ],()=>this.startFight({id:'hamual',name:'Hamual',xp:110,kind:'tournament',story,intro:'ROUND ONE • POWER TEST',visualScale:1.48,hpScale:1.18}))
      });
    }else if(step==='quarterfinal'){
      this.showDialogue([
        {speaker:'DANIEL',speakerClass:'neutral',text:'You expected another giant. That’s useful.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You look a little casual for a tournament.',tail:'down'},
        {speaker:'DANIEL',speakerClass:'neutral',text:'Watch my feet, not my clothes.',tail:'down'}
      ],()=>this.startFight({id:'daniel',name:'Daniel',xp:125,kind:'tournament',story,intro:'QUARTERFINAL • SKILL TEST',hpScale:1.04}));
    }else if(step==='bark-pouki'){
      this.startPoukiExhibition();
    }else if(step==='wade'){
      this.showDialogue([
        {speaker:'WADE',speakerClass:'neutral',text:'Guess the bracket really wanted this.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You may be fast, but you’re slow in the brain.',tail:'down'},
        {speaker:'WADE',speakerClass:'neutral',text:'I’m fast, not slow.',tail:'down'}
      ],()=>this.startFight({id:'wade',name:'Wade',hp:90,xp:140,kind:'tournament',story,intro:'SEMIFINAL • RRVVFO VS WADE'}));
    }else if(step==='final'){
      this.startFinalPreparation();
    }
  }

  grantObservedPloukeClue(id,source){
    const rumor=this.state.hubQuests.mandatory.ploukeRumors;
    if(!rumor.clues.includes(id))rumor.clues.push(id);
    if(rumor.clues.length>=4)rumor.complete=true;
    this.saveChapterState();this.toast?.('MATCH ANALYSIS',source,`${rumor.clues.length} / 4 Plouke patterns understood.`);
  }

  afterTournamentFight(fight){
    if(fight.id==='hamual'){
      this.showDialogue([
        {speaker:'HAMUAL',speakerClass:'rival',text:'You stayed inside my reach and still found a path through. Good.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Rrvvfo advances! The grounds remain open before the quarterfinal!',tail:'down'}
      ],()=>this.returnToHubIntermission('quarterfinal','after-round-1',{x:1030,z:100}));
    }else if(fight.id==='daniel'){
      this.showDialogue([
        {speaker:'DANIEL',speakerClass:'neutral',text:'You adjusted before the third exchange. That decided it.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Rrvvfo advances! Next on the other ring: Bark versus Pouki!',tail:'down'}
      ],()=>this.returnToHubIntermission('bark-pouki','after-quarterfinal',{x:1030,z:100}));
    }else if(fight.id==='wade'){
      this.showDialogue([
        {speaker:'WADE',speakerClass:'neutral',text:'You won! Yay!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I don’t think that’s supposed to be your reaction.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Plouke has defeated Pouki in the opposite semifinal. The final is set!',tail:'down'}
      ],()=>this.returnToHubIntermission('final','before-final',{x:1030,z:100}));
    }
  }

  returnToHubIntermission(nextStep,intermission,spawn={x:1030,z:100}){
    this.state.tournamentStep=nextStep;this.state.intermission=intermission;this.saveChapterState();
    this.enterHub({opening:false,spawn});
    this.showIntermissionArrival();
  }

  startHaileyPrelim(){
    this.showTournamentCard('PRELIMINARY • HAILEY VS PLOUKE','Watch Plouke fight before Rrvvfo’s side of the bracket begins.',()=>{
      this.battle.fighters[0].id='hailey';this.battle.fighters[1].id='plouke';
      this.switchStage('tournament');
      this.mode='spectator';this.currentFight={id:'hailey-plouke-prelim',elapsed:0,phase:1};
      const hailey=this.battle.fighters[0],plouke=this.battle.fighters[1];
      hailey.id='hailey';hailey.name='Hailey';hailey.accent='#e16b9a';hailey.cpu=true;hailey.visualScale=1;hailey.reset(-370,78);hailey.hp=100;hailey.en=70;hailey.asset=null;
      plouke.id='plouke';plouke.name='Plouke';plouke.accent='#e6ddc7';plouke.cpu=true;plouke.visualScale=1;plouke.reset(370,-78);plouke.hp=100;plouke.en=80;plouke.asset=null;
      this.battle.phase='play';this.battle.time=9999;this.battle.ringOutEnabled=false;this.battle.onRingOut=null;this.battle.hideBanner();
      this.setArenaNames('HAILEY','PLOUKE');
      this.setObjective('WATCH HAILEY VS PLOUKE','Plouke keeps wasting time posing for the arena cameras instead of committing to the fight.');
    });
  }

  startPoukiExhibition(){
    this.showTournamentCard('BARK VS POUKI','Watch Bark’s quarterfinal from ringside.',()=>{
      this.battle.fighters[0].id='bark';
      this.battle.fighters[1].id='pouki';
      this.switchStage('tournament');
      this.mode='spectator';this.currentFight={id:'pouki-exhibition',elapsed:0,phase:1};
      const bark=this.battle.fighters[0],pouki=this.battle.fighters[1];
      bark.id='bark';bark.name='Bark';bark.accent='#9a6a3a';bark.cpu=true;bark.reset(-370,78);bark.hp=100;bark.en=70;bark.asset=null;
      pouki.id='pouki';pouki.name='Pouki';pouki.accent='#6ca2a7';pouki.cpu=true;pouki.reset(370,-78);pouki.hp=100;pouki.en=80;pouki.asset=null;
      this.battle.phase='play';this.battle.time=9999;this.battle.ringOutEnabled=false;this.battle.onRingOut=null;this.battle.hideBanner();
      this.setArenaNames('BARK','POUKI');
      this.setObjective('WATCH BARK VS POUKI','Phase 1 • Bark controls the center behind a patient defense.');
    });
  }

  updateSpectator(dt){
    if(!this.currentFight)return;
    this.currentFight.elapsed+=dt;
    if(this.currentFight.id==='hailey-plouke-prelim'){
      if(this.currentFight.phase===1&&this.currentFight.elapsed>7){
        this.currentFight.phase=2;this.battle.notice('HAILEY: STOP POSING AND DEFEND YOURSELF!',2);
        this.setObjective('WATCH HAILEY VS PLOUKE','Hailey punishes Plouke for showing off. He finally starts reading her timing.');
      }
      if(this.currentFight.elapsed>21)this.finishHaileyPrelim();
      return;
    }
    if(this.currentFight.id==='pouki-exhibition'){
      if(this.currentFight.phase===1&&this.currentFight.elapsed>12){
        this.currentFight.phase=2;this.battle.notice('PHASE 2 • POUKI BREAKS THE GUARD',1.8);
        this.setObjective('WATCH BARK VS POUKI','Phase 2 • Pouki changes rhythm and starts breaking through Bark’s defense.');
      }else if(this.currentFight.phase===2&&this.currentFight.elapsed>27){
        this.currentFight.phase=3;this.battle.notice('PHASE 3 • BARK’S LAST COUNTER',1.8);
        this.setObjective('WATCH BARK VS POUKI','Phase 3 • Bark commits to one final Seismic Counter.');
      }
      if(this.currentFight.elapsed>39)this.finishPoukiExhibition();
    }
  }

  finishHaileyPrelim(){
    if(this.mode!=='spectator'||this.currentFight?.id!=='hailey-plouke-prelim')return;
    this.mode='story';this.battle.phase='story';this.state.prelimComplete=true;this.state.tournamentStep='round-1';this.grantObservedPloukeClue('positioning','Watched Plouke control the ring edge');this.saveChapterState();
    this.showDialogue([
      {speaker:'HAILEY',speakerClass:'neutral',text:'Stop staring and defend yourself!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'This guy reminds me of the Sage. I hope they never meet.',tail:'down'},
      {speaker:'ANNOUNCER',speakerClass:'rival',text:'Plouke wins by ring-out!',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'I might not have won if it weren’t for that pebble I placed in front of me, just in case I got distracted.',tail:'down'}
    ],()=>this.startTournamentStep('round-1'));
  }

  finishPoukiExhibition(){
    if(this.mode!=='spectator')return;
    this.mode='story';this.battle.phase='story';
    this.grantObservedPloukeClue('timing','Bark explained how changing rhythm creates openings');
    this.showDialogue([
      {speaker:'ANNOUNCER',speakerClass:'rival',text:'Pouki wins! Bark held the center, survived the guard break, and nearly landed one final counter!',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'He changed rhythm every time I settled. My last counter was the first opening he gave me.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'If he got Bark that easily, he must be really strong.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'You still have to beat me first.',tail:'down'}
    ],()=>this.returnToHubIntermission('wade','after-bark-pouki',{x:930,z:120}));
  }

  startFinalPreparation(){
    const rumors=this.state.hubQuests.mandatory.ploukeRumors.clues;
    const stats=storyStatsForLevel(this.level,this.progress.storyBonusStats||{});
    const meal=this.state.hubQuests.bonuses.meal;
    this.showDialogue([
      {speaker:'BARK',speakerClass:'neutral',text:'Stillness, positioning, timing, and the ring edge. We verified every pattern Plouke uses.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'Don’t chase his retreat. Cut through the center and make him choose first.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'The Sage still hasn’t shown up. He’d better have a good excuse.',tail:'down'}
    ],()=>this.showChoice({
      kicker:'FINAL PREPARATION BENCH',title:'READY FOR PLOUKE?',
      text:`Level ${this.level} • HP ${stats.hp} • ${rumors.length}/4 patterns verified • ${meal?`${meal.toUpperCase()} meal prepared`:'no meal prepared'}. This checkpoint is saved.`,
      buttons:[{label:'ENTER THE FINAL',value:'fight',primary:true},{label:'KEEP PREPARING',value:'leave'}],
      onChoose:value=>{
        if(value==='fight'){this.state.finalPrepSeen=true;this.saveChapterState();this.startFinal()}
        else{this.state.intermission='before-final';this.saveChapterState();this.resumeHub()}
      }
    }));
  }

  startFinal(){
    this.finalElapsed=0;this.finalPhase='opening';
    this.showDialogue([
      {speaker:'PLOUKE',speakerClass:'rival',text:'You used too much energy reaching this round.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I can win this with my hands tied up.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'That confidence is exactly why you’re tired.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Keep talking. It’ll make losing more embarrassing.',tail:'down'}
    ],()=>this.startFight({id:'plouke',name:'Plouke',hp:100,xp:0,kind:'final',story:true,final:true,intro:'FINAL • RRVVFO VS PLOUKE'}));
  }

  beginFinalFatigue(){
    if(!this.currentFight?.final||this.finalPhase!=='opening')return;
    this.finalPhase='fatigue';this.mode='story';this.battle.phase='story';
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'My tank’s depleting fast—but why?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'You fought every round like your energy couldn’t run out.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I can still win.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Then keep fighting.',tail:'down'}
    ],()=>{
      this.mode='fight';this.battle.phase='play';
      this.setObjective('TRY TO BEAT PLOUKE','Rrvvfo is slowing down. Conserve energy and keep pressuring Plouke.');
    });
  }

  offerAwakening(){
    if(this.finalPhase==='opening'){this.beginFinalFatigue();return}
    if(!this.currentFight?.final||['awakening-ready','awakening','clash','finished'].includes(this.finalPhase))return;
    this.finalPhase='awakening-ready';this.mode='story';this.battle.phase='story';
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fine. I’ll end this with Fire Awakening.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Try it.',tail:'down'}
    ],()=>{
      this.mode='fight';this.battle.phase='play';
      this.awakeningReadyAt=performance.now()+9000;this.lastAwakeningSecond=null;
      this.setObjective('TRY FIRE AWAKENING','Press hotbar slot 5 before Rrvvfo runs out of strength.');
      this.battle.notice(`FIRE AWAKENING READY • ${this.engine.prompt('ability5','PRESS 5')}`,2);
    });
  }

  triggerAwakeningAttempt(){
    if(this.finalPhase!=='awakening-ready')return;
    this.finalPhase='awakening';this.mode='story';this.battle.phase='story';
    const player=this.battle.fighters[0];
    this.battle.burst(player.x,player.z,'#ff8c32',38,85);
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Come on... ignite!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Why isn’t it holding?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Because power doesn’t erase exhaustion.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Show me what you have left.',tail:'down'}
    ],()=>this.beginBeamClash());
  }

  beginBeamClash(){
    this.finalPhase='clash';this.mode='clash';this.battle.phase='story';
    this.root.querySelector('[data-tournament-run]').hidden=true;
    this.clash={active:true,power:18,endAt:performance.now()+4200,lastButton:false};
    this.root.querySelector('[data-beam-clash]').hidden=false;
    this.root.querySelector('[data-clash-input]').focus();
    this.updateClashVisual();
  }

  clashInput(){
    if(this.mode!=='clash'||!this.clash.active)return;
    this.clash.power=clamp(this.clash.power+5.5,0,86);
    this.updateClashVisual();
  }

  updateBeamClash(){
    if(!this.clash.active)return;
    const remaining=Math.max(0,this.clash.endAt-performance.now());
    this.clash.power=Math.max(8,this.clash.power-.12);
    this.root.querySelector('[data-clash-time]').textContent=`${(remaining/1000).toFixed(1)}s`;
    this.updateClashVisual();
    const pads=navigator.getGamepads?.()||[];
    const pressed=[...pads].some(pad=>pad?.buttons?.[0]?.pressed);
    if(pressed&&!this.clash.lastButton)this.clashInput();
    this.clash.lastButton=pressed;
    if(remaining<=0)this.finishBeamClash();
  }

  updateClashVisual(){
    this.root.querySelector('[data-clash-meter]').style.width=`${this.clash.power}%`;
    this.root.querySelector('[data-clash-center]').style.left=`${clamp(this.clash.power,12,82)}%`;
  }

  finishBeamClash(){
    if(!this.clash.active)return;
    const clashWon=this.clash.power>=58;
    const nearlyWon=Boolean(this.currentFight&&this.currentFight.lowestEnemyHp/Math.max(1,this.currentFight.opponentMaxHp)<=.52);
    if(nearlyWon)this.state.ploukePerformanceBadge='PLOUKE PUSHED TO THE LIMIT';
    this.clash.active=false;
    this.root.querySelector('[data-beam-clash]').hidden=true;
    this.finalPhase='finished';this.mode='story';
    this.battle.root.querySelector('[data-impact-flash]').style.opacity='1';
    setTimeout(()=>{if(this.battle?.root)this.battle.root.querySelector('[data-impact-flash]').style.opacity='0'},140);
    if(clashWon){
      const player=this.battle.fighters[0],bounds=this.battle.stage.bounds;
      player.x=bounds.minX-90;
      this.battle.banner('RRVVFO WINS THE CLASH • PLOUKE RING-OUT!');
    }
    const reveal=()=>this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:clashWon?'I beat you in the beam! Haha—':'No! I lost the clash... I’m out of energy.',tail:'down'},
      ...(clashWon?[
        {speaker:'RRVVFO',speakerClass:'p1',text:'WAIT, I’M ON THE GRASS! AHH!',tail:'down'},
        {speaker:'PLOUKE',speakerClass:'rival',text:'I beat you.',tail:'down'}
      ]:[{speaker:'PLOUKE',speakerClass:'rival',text:'The match is over.',tail:'down'}]),
      {speaker:'ANNOUNCER',speakerClass:'rival',text:clashWon?'Rrvvfo wins the beam clash—but Plouke wins by ring-out!':'Plouke wins the tournament!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Who are you?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'You really did skim the disguise section.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...No.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Plouke was me.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Now that explains what you were doing during your fight with Hailey.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:clashWon?'And you won the clash. That earns a level. It doesn’t earn awareness of the ring edge.':nearlyWon?'You forced every strategy into the open. Keep the badge; the result still stands.':'You learned more while believing I was absent.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I hate how planned ahead you are.',tail:'down'}
    ],()=>this.commitCompletion());
    if(clashWon){
      const needed=Math.max(120,(LEVEL_THRESHOLDS[this.level]??this.xp+120)-this.xp+20);
      this.grantXp(needed,'BEAM CLASH VICTORY • BONUS LEVEL',reveal);
    }else if(nearlyWon)this.grantXp(80,'PLOUKE PUSHED TO THE LIMIT • PERFORMANCE BONUS',reveal);
    else reveal();
  }

  drawFinalFatigue(){
    const r=this.battle.renderer,player=this.battle.fighters[0];
    const pulse=1+Math.sin(performance.now()/95)*.08;
    r.disc({x:player.x,y:6,z:player.z,rx:62*pulse,rz:40*pulse,color:'#ff713f',alpha:.18});
    if(this.finalPhase==='awakening'||this.finalPhase==='awakening-ready')r.billboard({x:player.x,y:78+player.y,z:player.z,size:155*pulse,color:'#ff9d3f',alpha:.18});
  }

  attemptTournamentRun(){
    if(this.mode!=='fight'||!this.currentFight||(this.currentFight.final&&this.finalPhase==='clash'))return;
    const fight=this.currentFight;
    if(!fight.official){
      this.mode='story';this.battle.phase='story';
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'This one isn’t part of the bracket. I’m saving my energy.',tail:'down'},
        {speaker:fight.name.toUpperCase(),speakerClass:'rival',text:'You’re running away.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I’m leaving a fight I never needed to finish.',tail:'down'}
      ],()=>this.enterHub({spawn:{x:-220,z:-330}}));
      return;
    }
    const lines=[
      ['Definitely not. I’m not forfeiting.'],
      ['Who do you think I am? I came here to win.'],
      ['I said I refuse. Stop asking me to forfeit.'],
      ['Why do I keep looking at that button?','I’m winning this tournament whether I like it or not.']
    ];
    const index=this.state.runRefusals%lines.length;
    this.state.runRefusals+=1;this.saveChapterState();
    const wasMode=this.mode;this.mode='story';this.battle.phase='story';
    this.showDialogue(lines[index].map(text=>({speaker:'RRVVFO',speakerClass:'p1',text,tail:'down'})),()=>{
      this.mode=wasMode;this.battle.phase='play';
      this.root.querySelector('[data-tournament-run]').hidden=false;
    });
  }

  grantXp(amount,source,onDone){
    if(!amount){onDone?.();return}
    if(this.replayMode){
      this.battle.notice('REPLAY PRACTICE • NO PERMANENT XP',1.6);
      onDone?.();
      return;
    }
    const result=addStoryXp(amount,{source,persist:true,replay:false});
    this.lastLevelUpFrom=result.oldLevel;
    this.level=result.newLevel;this.xp=result.xp;this.progress=result.progress;
    applyStoryProgressionToFighter(this.battle.fighters[0],this.progress);
    this.updateLevelHud();
    if(result.newLevel>result.oldLevel)this.showLevelUp(source,onDone);
    else onDone?.();
  }

  updateLevelHud(){
    const stats=storyStatsForLevel(this.level,this.progress.storyBonusStats||{});
    this.root.querySelectorAll('.storyRpgStats').forEach(panel=>{
      const levelValue=panel.querySelector('header span:first-child strong');if(levelValue)levelValue.textContent=String(this.level);
      const xpValue=panel.querySelector('header .storyXp strong');if(xpValue)xpValue.textContent=levelHudText(this.level,this.xp);
      const values=[stats.hp,stats.power,stats.defense,stats.speed,stats.focus];
      panel.querySelectorAll('.storyStatGrid span b').forEach((node,index)=>{if(values[index]!==undefined)node.textContent=String(values[index])});
    });
    const xpNode=this.root.querySelector('[data-c2-xp]');if(xpNode)xpNode.textContent=levelHudText(this.level,this.xp);
    const trackerLevel=this.root.querySelector('[data-c2-tracker-level]');if(trackerLevel)trackerLevel.textContent=String(this.level);
    const floor=LEVEL_THRESHOLDS[Math.max(0,this.level-1)]||0;
    const ceiling=LEVEL_THRESHOLDS[this.level]??floor;
    const span=Math.max(1,ceiling-floor);
    const progress=this.level>=LEVEL_THRESHOLDS.length?1:clamp((this.xp-floor)/span,0,1);
    const fill=this.root.querySelector('[data-c2-xp-fill]');if(fill)fill.style.width=`${Math.round(progress*100)}%`;
    const next=this.root.querySelector('[data-c2-xp-next]');if(next)next.textContent=this.level>=LEVEL_THRESHOLDS.length?'MAXIMUM TRAINING LEVEL':`${Math.max(0,ceiling-this.xp)} XP TO NEXT LEVEL`;
  }

  openManual(){
    if(this.storyMenuOpen)this.closeStoryMenu();
    if(!['hub','fight','spectator'].includes(this.mode))return;
    const previous=this.mode;
    this.mode='manual';this.battle.phase='story';
    const opened=openCombatManual({onClose:()=>{
      if(this.aborted)return;
      this.mode=previous;
      this.battle.phase=['hub','fight','spectator'].includes(previous)?'play':'story';
    }});
    if(!opened){this.mode=previous;this.battle.phase=['hub','fight','spectator'].includes(previous)?'play':'story'}
  }

  canOpenTracker(){
    return !this.aborted&&!this.storyMenuOpen&&!['dialogue','choice','qte','flame','clash','level','transition','card'].includes(this.mode);
  }

  toggleTracker(force){
    const next=typeof force==='boolean'?force:!this.trackerOpen;
    if(next&&!this.canOpenTracker())return;
    this.trackerOpen=next;
    const panel=this.root.querySelector('[data-c2-tracker]');
    panel.hidden=!next;
    if(next){
      this.updateLevelHud();
      this.trackerPausedBattle=Boolean(this.battle&&!this.battle.paused);
      if(this.trackerPausedBattle)this.battle.togglePause();
      panel.querySelector('[data-c2-tracker-close]')?.focus();
    }else{
      if(this.trackerPausedBattle&&this.battle?.paused)this.battle.togglePause();
      this.trackerPausedBattle=false;
    }
  }

  canOpenStoryMenu(){
    return !this.aborted&&!this.storyMenuOpen&&!['dialogue','choice','qte','flame','clash','level','transition'].includes(this.mode);
  }

  openStoryMenu(){
    if(!this.canOpenStoryMenu())return;
    this.storyMenuOpen=true;
    this.updateLevelHud();
    this.renderQuestJournal();
    const panel=this.root.querySelector('[data-c2-menu-panel]');
    const restart=this.root.querySelector('[data-c2-menu-restart]');
    const activeFight=Boolean(this.currentFight&&['fight','fight-ko'].includes(this.mode));
    restart.disabled=!activeFight;
    restart.textContent=activeFight?'RESTART ACTIVE FIGHT':'NO ACTIVE FIGHT';
    panel.hidden=false;
    this.storyMenuPausedBattle=Boolean(this.battle&&!this.battle.paused);
    if(this.storyMenuPausedBattle)this.battle.togglePause();
    panel.querySelector('[data-c2-menu-resume]')?.focus();
  }

  closeStoryMenu(){
    if(!this.storyMenuOpen)return;
    this.storyMenuOpen=false;
    this.root.querySelector('[data-c2-menu-panel]').hidden=true;
    if(this.storyMenuPausedBattle&&this.battle?.paused)this.battle.togglePause();
    this.storyMenuPausedBattle=false;
    this.root.querySelector('[data-c2-menu]')?.focus();
  }

  async restartFightFromMenu(){
    const fight=this.currentFight;
    if(!fight||!['fight','fight-ko'].includes(this.mode))return;
    const restart=await storyConfirm({title:'RESTART ACTIVE FIGHT?',message:'Restart this fight at 0–0? Chapter progress before the fight remains saved.',confirmLabel:'RESTART FIGHT'});
    if(!restart)return;
    this.closeStoryMenu();
    clearTimeout(this.koTimer);
    this.startFight({...fight,playerKOs:0,foeKOs:0,koLocked:false,skipCard:true});
  }

  showLevelUp(source,onDone){
    this.levelContinue=onDone;
    const panel=this.root.querySelector('[data-level-up]');
    panel.hidden=false;this.mode='level';this.battle.phase='story';
    this.root.querySelector('[data-level-up-number]').textContent=String(this.level);
    this.root.querySelector('[data-level-up-source]').textContent=source;
    const before=storyStatsForLevel(this.lastLevelUpFrom||Math.max(1,this.level-1));
    const after=storyStatsForLevel(this.level);
    const rows=[['HP',before.hp,after.hp],['POWER',before.power,after.power],['DEFENSE',before.defense,after.defense],['SPEED',before.speed,after.speed],['FOCUS',before.focus,after.focus]];
    this.root.querySelector('[data-level-stats]').innerHTML=rows.map(([label,oldValue,newValue])=>`<span><small>${label}</small><b>${oldValue}</b><i>→</i><strong>${newValue}</strong><em>+${newValue-oldValue}</em></span>`).join('');
    panel.querySelector('[data-level-continue]').focus();
  }

  closeLevelUp(){
    const panel=this.root.querySelector('[data-level-up]');
    if(panel.hidden)return;
    panel.hidden=true;
    const callback=this.levelContinue;this.levelContinue=null;callback?.();
  }

  showChoice({kicker,title,text,buttons,onChoose}){
    const panel=this.root.querySelector('[data-c2-choice]');
    this.root.querySelector('[data-c2-choice-kicker]').textContent=kicker;
    this.root.querySelector('[data-c2-choice-title]').textContent=title;
    this.root.querySelector('[data-c2-choice-text]').textContent=text;
    const holder=this.root.querySelector('[data-c2-choice-buttons]');
    holder.innerHTML=buttons.map(button=>`<button type="button" data-choice-value="${button.value}" class="${button.primary?'primary':''}">${button.label}</button>`).join('');
    holder.querySelectorAll('[data-choice-value]').forEach(button=>button.addEventListener('click',()=>{
      panel.hidden=true;this.pendingChoice=null;onChoose?.(button.dataset.choiceValue);
    }));
    this.pendingChoice=onChoose;this.mode='choice';this.battle.phase='story';panel.hidden=false;
    holder.querySelector('button')?.focus();
  }

  resumeHub(){
    this.mode='hub';this.battle.phase='play';this.updateHubObjective();
  }

  showDialogue(lines,onComplete){
    const previousMode=this.mode;
    this.mode='dialogue';
    this.engine?.setGameplayState('dialogue',{phase:'story'});
    const dialogue=this.engine.showDialogue(lines,{typeSpeed:17,onComplete:()=>{
      this.dialogue=null;
      if(this.aborted)return;
      if(this.mode==='dialogue'){
        this.mode=previousMode==='dialogue'?'hub':previousMode;
        if(this.battle)this.battle.phase=this.mode==='hub'||this.mode==='fight'||this.mode==='spectator'?'play':'story';
      }
      onComplete?.();
    }});
    this.dialogue=dialogue;
  }

  onKey(event){
    if(this.aborted||this.root.hidden)return;
    const manual=document.getElementById('pxCombatManualUI');
    if(manual&&!manual.hidden)return;
    if(this.trackerOpen){
      if(event.key==='Escape'||event.key.toLowerCase()==='t'){
        event.preventDefault();event.stopImmediatePropagation();this.toggleTracker(false);
      }
      return;
    }
    if(this.storyMenuOpen){
      if(event.key==='Escape'){
        event.preventDefault();event.stopImmediatePropagation();this.closeStoryMenu();
      }
      return;
    }
    if(event.key==='Escape'&&this.canOpenStoryMenu()){
      event.preventDefault();event.stopImmediatePropagation();this.openStoryMenu();return;
    }
    if(event.key.toLowerCase()==='m'&&['hub','fight','spectator'].includes(this.mode)){
      event.preventDefault();event.stopImmediatePropagation();this.openManual();return;
    }
    if(event.key.toLowerCase()==='t'&&this.canOpenTracker()){
      event.preventDefault();event.stopImmediatePropagation();this.toggleTracker(true);return;
    }
    if(this.mode==='hub'&&(event.key==='Enter'||event.code==='KeyE')){
      event.preventDefault();event.stopImmediatePropagation();this.tryInteract();return;
    }
    if(this.mode==='flame'){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.closeFlameGame();return}
      if(event.code==='Space'||event.code==='KeyJ'){event.preventDefault();event.stopImmediatePropagation();this.addFlameHeat();return}
      if(event.key==='Enter'||event.code==='KeyK'){event.preventDefault();event.stopImmediatePropagation();this.serveFlameOrder();return}
    }
    if(this.mode==='qte'&&['KeyA','KeyD','Space'].includes(event.code)){
      event.preventDefault();event.stopImmediatePropagation();this.acceptQteInput(event.code);return;
    }
    if(this.mode==='clash'&&(event.code==='Space'||event.key.toLowerCase()==='j'||event.key==='1')){
      event.preventDefault();event.stopImmediatePropagation();this.clashInput();return;
    }
  }

  drawHubExtras(){
    if(!this.battle?.renderer)return;
    const r=this.battle.renderer,time=performance.now()/1000,quests=this.state.hubQuests;
    drawTournamentLandmarks(r,time,{afterHours:false});
    const missingCards=missingChapter2BracketCards(quests);
    for(const npc of this.activeNpcs()){
      const bob=Math.sin(time*2+npc.x*.01)*2;
      r.disc({x:npc.x,y:5,z:npc.z,rx:27,rz:18,color:'#000',alpha:.24});
      const usesSprite=HUB_SPRITE_NPC_IDS.has(npc.id);
      const hasSprite=usesSprite&&this.hubActors.some(actor=>actor.id===npc.id&&actor.asset);
      if(npc.kind==='bracket'){
        r.box({x:npc.x,y:80,z:npc.z,sx:120,sy:150,sz:18,color:npc.color});
        r.box({x:npc.x,y:155,z:npc.z,sx:135,sy:18,sz:28,color:npc.hair});
      }else if(!usesSprite){
        const vendorLike=['vendor','cashier','announcer'].includes(npc.id),fighterLike=['fake-champion','challenger','old-competitor'].includes(npc.id);
        r.cylinder({x:npc.x,y:49+bob,z:npc.z,rx:fighterLike?18:15,rz:fighterLike?14:12,sy:65,color:npc.color});
        r.cylinder({x:npc.x,y:94+bob,z:npc.z,rx:14,sy:28,color:'#946044'});
        if(vendorLike){
          r.cone({x:npc.x,y:116+bob,z:npc.z,rx:22,rz:19,sy:19,color:npc.hair});
          r.box({x:npc.x,y:118+bob,z:npc.z-11,sx:42,sy:5,sz:15,color:npc.hair});
        }else if(fighterLike){
          r.cone({x:npc.x,y:119+bob,z:npc.z,rx:19,rz:16,sy:26,color:npc.hair});
          r.segment({x:npc.x-18,y:65+bob,z:npc.z},{x:npc.x+20,y:76+bob,z:npc.z-4},{width:7,height:7,color:npc.color});
        }else r.cone({x:npc.x,y:117+bob,z:npc.z,rx:18,rz:15,sy:23,color:npc.hair});
      }else if(!hasSprite){
        r.billboard({x:npc.x,y:86+bob,z:npc.z,size:42,color:npc.id==='sage'?'#dff5ff':npc.id==='bark'?'#c69258':'#6ed6ff',alpha:.28});
      }
      if(npc.id==='sage')r.billboard({x:npc.x,y:145,z:npc.z,size:48,color:'#dff5ff',alpha:.22});
      if(npc.kind==='grunt')r.disc({x:npc.x,y:7,z:npc.z,rx:42,rz:28,color:'#ffcf4d',alpha:.18});
      if(npc.id==='bark'||npc.id==='wade')r.disc({x:npc.x,y:7,z:npc.z,rx:40,rz:26,color:npc.id==='bark'?'#b88750':'#59b7ff',alpha:.18});
      const announcerTarget=npc.id==='announcer'&&(!quests.mandatory.bracket.started||(!quests.mandatory.bracket.complete&&!missingCards.length));
      const fanCardTarget=npc.id==='fan'&&missingCards.some(card=>card.id==='fan-card');
      const mainTarget=announcerTarget||fanCardTarget||(npc.id==='wade'&&this.state.metBarkWade&&!quests.mandatory.wadeRace.complete)||(npc.id==='bark'&&quests.mandatory.wadeRace.complete&&!quests.mandatory.barkRing.complete)||(npc.id==='bracket'&&this.state.intermission);
      const sideTarget=['vendor','fake-champion','lost-fan','mechanic','cashier','challenger'].includes(npc.id);
      if(mainTarget)r.billboard({x:npc.x,y:165+bob,z:npc.z,size:34,color:'#ffd34f',alpha:.88});
      else if(sideTarget)r.billboard({x:npc.x,y:155+bob,z:npc.z,size:24,color:'#6ed6ff',alpha:.72});
    }

    if(this.race.active){
      const checkpoint=CHAPTER2_RACE_CHECKPOINTS[this.race.index];
      if(checkpoint){
        const pulse=1+Math.sin(time*5)*.12;
        r.disc({x:checkpoint.x,y:8,z:checkpoint.z,rx:62*pulse,rz:42*pulse,color:'#63c9ff',alpha:.42});
        r.billboard({x:checkpoint.x,y:115,z:checkpoint.z,size:58*pulse,color:'#d9f7ff',alpha:.86});
      }
      if(!this.hubActors.some(actor=>actor.id==='wade'&&actor.asset)){
        r.disc({x:this.race.wadeX,y:5,z:this.race.wadeZ,rx:30,rz:19,color:'#1677ca',alpha:.28});
        r.box({x:this.race.wadeX,y:50,z:this.race.wadeZ,sx:32,sy:66,sz:25,color:'#3181cd',alpha:.82});
        r.box({x:this.race.wadeX,y:96,z:this.race.wadeZ,sx:31,sy:30,sz:28,color:'#f5d72e',alpha:.86});
      }
    }

    const bracket=quests.mandatory.bracket;
    if(bracket.started&&!bracket.complete&&!bracket.cards.includes('fan-card')){
      const fan=this.npcs.find(npc=>npc.id==='fan'),pulse=1+Math.sin(time*5+.8)*.1;
      if(bracket.fanClue){
        r.box({x:this.fanCardX,y:74,z:this.fanCardZ,sx:27,sy:3,sz:35,color:'#fff3b0',alpha:.98});
        r.segment({x:this.fanCardX-55,y:74,z:this.fanCardZ},{x:this.fanCardX-8,y:74,z:this.fanCardZ},{width:5,height:2,color:'#78dcff',alpha:.55,lit:false});
        r.billboard({x:this.fanCardX,y:117,z:this.fanCardZ,size:36*pulse,color:'#ffd34f',alpha:.94});
      }else{
        r.box({x:fan.x+24,y:112,z:fan.z,sx:24,sy:3,sz:32,color:'#fff3b0',alpha:.96});
        r.billboard({x:fan.x,y:158,z:fan.z,size:38*pulse,color:'#ffd34f',alpha:.92});
        r.disc({x:fan.x,y:7,z:fan.z,rx:44*pulse,rz:30*pulse,color:'#ffd34f',alpha:.34});
      }
    }
    if(bracket.started&&!bracket.complete&&!bracket.cards.includes('vendor-card')){
      const pulse=1+Math.sin(time*5)*.1;
      r.box({x:-430,y:82,z:760,sx:26,sy:3,sz:34,color:'#fff3b0',alpha:.96});
      r.billboard({x:-430,y:125,z:760,size:44*pulse,color:'#ffd34f',alpha:.92});
      r.disc({x:-430,y:7,z:760,rx:42*pulse,rz:28*pulse,color:'#ffd34f',alpha:.34});
    }
    if(bracket.started&&!bracket.complete&&!bracket.cards.includes('veteran-card')){
      r.box({x:this.bracketCartX,y:28,z:-300,sx:105,sy:48,sz:68,color:'#527288',alpha:.9});
      r.box({x:this.bracketCartX,y:58,z:-300,sx:26,sy:3,sz:34,color:'#fff3b0',alpha:.96});
      r.billboard({x:this.bracketCartX,y:100,z:-300,size:38,color:'#ffd34f',alpha:.9});
    }

    if(quests.mandatory.barkRing.started&&!quests.mandatory.barkRing.complete){
      for(const support of CHAPTER2_RING_SUPPORTS){
        const checked=quests.mandatory.barkRing.supports.includes(support.id),pulse=1+Math.sin(time*4+support.x)*.09;
        r.box({x:support.x,y:24,z:support.z,sx:46,sy:48,sz:46,color:checked?'#5f8f5c':'#b84e43',alpha:.9});
        if(!checked)r.disc({x:support.x,y:5,z:support.z,rx:48*pulse,rz:32*pulse,color:'#ffdf62',alpha:.35});
      }
    }

    if(quests.mandatory.wadeRace.complete){
      for(const shortcut of CHAPTER2_SHORTCUTS){
        const unlocked=quests.shortcuts.includes(shortcut.id),pulse=1+Math.sin(time*4+shortcut.x*.01)*.08;
        r.box({x:shortcut.x,y:52,z:shortcut.z,sx:18,sy:104,sz:18,color:'#173b66',alpha:.9});
        r.box({x:shortcut.x,y:104,z:shortcut.z,sx:74,sy:34,sz:12,color:'#63c9ff',alpha:.9});
        if(unlocked)r.disc({x:shortcut.x,y:6,z:shortcut.z,rx:42*pulse,rz:28*pulse,color:'#63c9ff',alpha:.28});
      }
    }

    // Crowd movement makes the hub feel active without turning every person into a quest giver.
    const crowdColors=['#d45172','#4ea4d1','#d99c45','#6e58ad','#5aa36d'];
    for(let i=0;i<26;i++){
      const drift=((i*151+time*(17+i%4*4)*(i%2?1:-1))%2050+2050)%2050;
      const x=-1020+drift,z=(i%2?720:-720)+Math.sin(time*.5+i)*48,bob=Math.sin(time*2.1+i)*1.8;
      r.cylinder({x,y:42+bob,z,rx:12+(i%3),rz:10+(i%2),sy:58+(i%4)*3,color:crowdColors[i%crowdColors.length],alpha:.84});
      r.cylinder({x,y:80+bob+(i%4)*1.5,z,rx:11,sy:22,color:i%5===0?'#b77958':'#8f5d42',alpha:.88});
      if(i%4===0)r.cone({x,y:97+bob,z,rx:16,rz:14,sy:16,color:i%2?'#e0b843':'#3d2c28',alpha:.9});
      else r.cone({x,y:99+bob,z,rx:14,rz:12,sy:20,color:i%3?'#3b2c27':'#7b4d35',alpha:.9});
      if(i%6===0)r.box({x:x+14,y:50+bob,z:z+2,sx:12,sy:28,sz:14,color:'#b68a4f',alpha:.85});
    }

    // A visible practice spar loops in the west ring so the grounds never look idle.
    const sparPulse=Math.sin(time*2.4),sparX=-1120+sparPulse*72;
    r.box({x:sparX-70,y:48,z:550,sx:28,sy:62,sz:24,color:'#586da5',alpha:.78});
    r.box({x:sparX+70,y:48,z:570,sx:28,sy:62,sz:24,color:'#ad5d43',alpha:.78});
    if(Math.sin(time*4)>.7)r.segment({x:sparX-44,y:62,z:550},{x:sparX+42,y:62,z:570},{width:8,height:5,color:'#ffe184',alpha:.55,lit:false});

    this.prizeCartX=((time*42+1200)%3200)-1600;
    const cartX=this.prizeCartX,cartActive=quests.optional.prizeCart.started&&!quests.optional.prizeCart.complete;
    r.box({x:cartX,y:34,z:470,sx:145,sy:58,sz:82,color:cartActive?'#b66b32':'#8d5c32',alpha:.92});
    r.box({x:cartX,y:76,z:470,sx:118,sy:30,sz:72,color:cartActive?'#ffd059':'#e09a42',alpha:.92});
    r.disc({x:cartX-52,y:8,z:510,rx:19,rz:13,color:'#1e2026',alpha:.95});
    r.disc({x:cartX+52,y:8,z:510,rx:19,rz:13,color:'#1e2026',alpha:.95});
    if(cartActive)r.billboard({x:cartX,y:130,z:470,size:34,color:'#6ed6ff',alpha:.82});

    // Birds, rotating banners, and district signs add motion and help navigation.
    for(let i=0;i<6;i++){
      const bx=-1100+i*430+Math.sin(time*.42+i)*130,bz=-790+Math.cos(time*.35+i)*125;
      r.billboard({x:bx,y:245+i*11,z:bz,size:15,color:'#e7edf3',alpha:.55});
    }
    for(const [index,district] of CHAPTER2_DISTRICTS.entries()){
      if(index===0)continue;
      const wave=Math.sin(time*2+index)*8;
      r.box({x:district.x-120,y:72,z:district.z-80,sx:10,sy:140,sz:10,color:'#40322b',alpha:.8});
      r.box({x:district.x-92+wave*.15,y:120,z:district.z-80,sx:70+Math.abs(wave),sy:38,sz:8,color:index%2?'#d83d75':'#f0c857',alpha:.72});
    }
  }

  saveChapterState(){
    const progress=loadLostYearProgress();
    if(this.replayMode){
      this.progress=saveLostYearProgress({
        ...progress,
        chapter2State:this.savedChapter2State,
        storyLevel:Number(progress.storyLevel)||1,
        storyXp:Number(progress.storyXp)||0,
        lastCheckpoint:this.savedCheckpoint||'rrvvfo-02-complete'
      });
      return;
    }
    this.progress=saveLostYearProgress({...progress,chapter2State:this.state,storyLevel:this.level,storyXp:this.xp,lastCheckpoint:`rrvvfo-02-${this.state.tournamentStarted?this.state.tournamentStep:'hub'}`});
  }

  commitCompletion(){
    if(this.completed)return;
    this.completed=true;
    this.state.tournamentStep='complete';this.state.intermission=null;
    const progress=loadLostYearProgress();
    if(this.replayMode){
      saveLostYearProgress({
        ...progress,
        chapter2State:this.savedChapter2State,
        storyLevel:Number(progress.storyLevel)||1,
        storyXp:Number(progress.storyXp)||0,
        lastCheckpoint:this.savedCheckpoint||'rrvvfo-02-complete'
      });
      this.onComplete();
      this.root.querySelector('[data-route-end]').hidden=false;
      this.root.querySelector('[data-end-route]').focus();
      return;
    }
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=unique([...(progress.unlocks||[]),'tournamentHub','trainingLevels','chapter2Tournament','chapterSelect','chapter3']);
    saveLostYearProgress({...progress,completedMissions,unlocks,chapter2State:this.state,storyLevel:this.level,storyXp:this.xp,lastCheckpoint:'rrvvfo-02-complete'});
    this.onComplete();
    this.root.querySelector('[data-route-end]').hidden=false;
    this.root.querySelector('[data-end-route]').focus();
  }

  async requestExit(){
    const leave=await storyConfirm({title:'EXIT CHAPTER 2?',message:'Leave the tournament? Completed checkpoints remain saved. Any active fight restarts at 0–0.',confirmLabel:'EXIT CHAPTER'});
    if(!leave)return;
    if(this.storyMenuOpen)this.closeStoryMenu();
    this.exitToStory();
  }

  exitToStory(){
    if(this.aborted)return;
    this.aborted=true;
    clearTimeout(this.koTimer);
    this.saveChapterState();
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    document.removeEventListener('keydown',this.keyHandler,true);
    document.removeEventListener('pxperfectparry',this.perfectParryHandler);
    if(this.battle?.active)this.battle.stopMatch();
    this.battle?.root?.classList.remove('chapter2HubMode','chapter2FightMode','chapter2StoryActive');
    this.battle?.root?.classList.add('hidden');
    destroyStoryBattle(this.battle);
    this.root.remove();activeMission=null;this.onExit();
  }
}

export function startRrvvfoMission2(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoMission2(options);
  return activeMission.start();
}

export {RrvvfoMission2};
