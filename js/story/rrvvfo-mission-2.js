import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a8-kinetic-combat-20260729';
import {sharedInput} from '../input-runtime.js?v=29a8-kinetic-combat-20260729';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a8-kinetic-combat-20260729';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=29a8-kinetic-combat-20260729';
import {applyStoryProgressionToFighter,addStoryXp,levelHudText,STORY_LEVEL_THRESHOLDS} from './story-progression.js?v=29a8-kinetic-combat-20260729';
import {storyConfirm} from './story-ux.js?v=29a8-kinetic-combat-20260729';

const MISSION_ID='rrvvfo-02';
const UI_ID='rrvvfoMission2UI';
const LEVEL_THRESHOLDS=STORY_LEVEL_THRESHOLDS;
let activeMission=null;

function freshChapter2State(){
  return{
    talked:[],sageVanished:false,firstBrawlComplete:false,metBarkWade:false,
    barkSparResult:null,gruntDefeated:[],tournamentStarted:false,
    tournamentStep:'round-1',runRefusals:0
  };
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
        <small>RRVVFO ROUTE • CHAPTER 2</small>
        <strong data-c2-objective>EXPLORE THE TOURNAMENT GROUNDS</strong>
        <span data-c2-detail>Talk to the people arriving for the tournament.</span>
      </div>
      <button class="chapter2MenuButton" type="button" data-c2-menu aria-haspopup="dialog" aria-controls="chapter2StoryMenu">☰ STORY MENU</button>
    </div>

    <div class="chapter2StoryMenu" id="chapter2StoryMenu" data-c2-menu-panel hidden role="dialog" aria-modal="true" aria-label="Chapter 2 story menu">
      <article>
        <header>
          <div><small>RRVVFO ROUTE • CHAPTER 2</small><h2>STORY MENU</h2></div>
          <button type="button" data-c2-menu-close aria-label="Close story menu">×</button>
        </header>
        <div class="chapter2MenuProgress">
          <section><small>TRAINING LEVEL</small><strong data-c2-level>1</strong><span>Attack and Energy Control rise through Story Mode.</span></section>
          <section><small>STORY XP</small><strong data-c2-xp>0 / 100</strong><div class="chapter2XpTrack"><i data-c2-xp-fill></i></div><span data-c2-xp-next>100 XP TO NEXT LEVEL</span></section>
        </div>
        <div class="chapter2MenuActions">
          <button class="primary" type="button" data-c2-menu-resume>RETURN TO GAME</button>
          <button type="button" data-c2-manual>COMBAT MANUAL</button>
          <button type="button" data-c2-menu-restart>RESTART ACTIVE FIGHT</button>
          <button type="button" data-c2-exit>EXIT CHAPTER</button>
        </div>
        <p class="chapter2MenuHint">Open this menu with <b>TAB</b> or <b>ESC</b>. Level and XP stay here so the battle HUD remains clear.</p>
      </article>
    </div>

    <div class="chapter2AreaTitle" data-c2-area hidden>
      <small>THE LOST YEAR</small><strong data-c2-area-name>LOCAL TOURNAMENT GROUNDS</strong>
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
        <div class="levelRewards">
          <span>ATTACK POWER <b data-level-attack>+2.5%</b></span>
          <span>ENERGY CONTROL <b data-level-energy>+2%</b></span>
          <span>VERSUS MODES <b>UNAFFECTED</b></span>
        </div>
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
        <p>Mash FIRE to push back Plouke's beam. Win the clash to force Plouke into a ring-out counter. Losing still continues the scripted final.</p>
        <div class="beamClashVisual"><i class="rrBeam"></i><i class="ploukeBeam"></i><b data-clash-center></b></div>
        <div class="clashMeter"><i data-clash-meter></i></div>
        <button type="button" data-clash-input>FIRE!</button>
        <small data-clash-time>4.0s</small>
      </article>
    </div>

    <div class="routeEndOverlay" data-route-end hidden>
      <article class="routeEndCard">
        <small>RRVVFO ROUTE • CHAPTER 2 COMPLETE</small>
        <h2>THE TOURNAMENT IS OVER</h2>
        <p>Rrvvfo reached the final, exhausted himself against Plouke, survived the final clash, and discovered that Plouke was the Sage in disguise.</p>
        <div class="routeEndRewards">
          <span>FULL TOURNAMENT HUB CLEARED</span>
          <span>TRAINING LEVELS UNLOCKED</span>
          <span>CHAPTER 3 NOW FOLLOWS THE FINISHED TOURNAMENT</span>
        </div>
        <button type="button" data-end-route>RETURN TO RRVVFO ROUTE</button>
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
      :{...freshChapter2State(),...(this.progress.chapter2State||{})};
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
    this.gruntCooldown={};
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
    this.root.querySelector('[data-c2-manual]').addEventListener('click',()=>openCombatManual());
    this.root.querySelector('[data-c2-menu-restart]').addEventListener('click',()=>this.restartFightFromMenu());
    this.root.querySelector('[data-c2-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelectorAll('[data-c2-qte-input]').forEach(button=>button.addEventListener('click',()=>this.acceptQteInput(button.dataset.c2QteInput)));
    this.root.querySelector('[data-level-continue]').addEventListener('click',()=>this.closeLevelUp());
    this.root.querySelector('[data-tournament-continue]').addEventListener('click',()=>this.continueTournamentCard());
    this.root.querySelector('[data-tournament-run]').addEventListener('click',()=>this.attemptTournamentRun());
    this.root.querySelector('[data-clash-input]').addEventListener('click',()=>this.clashInput());
    this.root.querySelector('[data-end-route]').addEventListener('click',()=>this.exitToStory());
    this.keyHandler=event=>this.onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  createNpcs(){
    return[
      {id:'sage',label:'THE SAGE',x:-1340,z:-20,color:'#dbe5ee',hair:'#eff5fb',kind:'sage'},
      {id:'fan',label:'TOURNAMENT FAN',x:-720,z:250,color:'#e35d82',hair:'#442a32',kind:'talk'},
      {id:'vendor',label:'FOOD VENDOR',x:-520,z:570,color:'#df7a42',hair:'#2d211b',kind:'talk'},
      {id:'worker',label:'TOURNAMENT WORKER',x:-170,z:-390,color:'#3e7db9',hair:'#243247',kind:'registration'},
      {id:'veteran',label:'OLD COMPETITOR',x:-860,z:-280,color:'#7c65b7',hair:'#d9d9dc',kind:'talk'},
      {id:'practice',label:'PRACTICE RING FIGHTER',x:-1120,z:560,color:'#506f9e',hair:'#2d2636',kind:'practice'},
      {id:'bark',label:'BARK',x:120,z:130,color:'#8b5f35',hair:'#161514',kind:'bark'},
      {id:'wade',label:'WADE',x:250,z:20,color:'#3181cd',hair:'#f5d72e',kind:'wade'},
      {id:'grunt-a',label:'LOUD GRUNT',x:520,z:610,color:'#646a76',hair:'#292c33',kind:'grunt'},
      {id:'grunt-b',label:'MASKED GRUNT',x:820,z:-660,color:'#4f5561',hair:'#17191d',kind:'grunt'},
      {id:'bracket',label:'BRACKET BOARD',x:910,z:-430,color:'#2f2238',hair:'#f0c85d',kind:'bracket'}
    ];
  }

  start(){
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
      applyDamage:(next,attacker,target,damage,meta={})=>{
        let adjusted=damage;
        if(this.mode==='fight'&&this.currentFight?.final){
          if(attacker===battle.fighters[1])adjusted*=this.finalPhase==='fatigue'?1.34:1.12;
          if(attacker===battle.fighters[0]&&this.finalPhase==='fatigue')adjusted*=.78;
        }
        if(this.mode==='spectator'){
          if(attacker.id==='pouki')adjusted*=2.65;
          if(attacker.id==='bark')adjusted*=.48;
        }
        const connected=next(attacker,target,adjusted,meta);
        if(!connected)return connected;
        const player=battle.fighters[0],foe=battle.fighters[1];
        if(this.mode==='fight'&&this.currentFight?.final){
          if(target===foe&&foe.hp<=48){foe.hp=48;if(this.finalPhase==='opening')queueMicrotask(()=>this.beginFinalFatigue())}
          if(target===player&&player.hp<=27){player.hp=27;if(this.finalPhase==='opening'||this.finalPhase==='fatigue')queueMicrotask(()=>this.offerAwakening())}
        }else if(this.mode==='fight'){
          if(target===foe&&foe.hp<=0){foe.hp=1;queueMicrotask(()=>this.handleFightKo(true))}
          else if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.handleFightKo(false))}
        }else if(this.mode==='spectator'){
          if(target===player&&player.hp<=0){player.hp=1;queueMicrotask(()=>this.finishPoukiExhibition())}
          else if(target===foe&&foe.hp<=58)foe.hp=58;
        }
        return connected;
      },
      update:(next,dt)=>{
        next(dt);
        if(!battle.active||this.aborted)return;
        this.areaTimer=Math.max(0,this.areaTimer-dt);
        if(!this.areaTimer)this.root.querySelector('[data-c2-area]').hidden=true;
        if(this.mode==='hub'){
          const player=battle.fighters[0];player.hp=100;player.en=100;player.guard=100;battle.time=9999;this.updateHub(dt);
        }else if(this.mode==='fight'){battle.time=9999;this.updateFight(dt)}
        else if(this.mode==='spectator'){battle.time=9999;this.updateSpectator(dt)}
        else if(this.mode==='qte')this.updateQte();
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
      drawFighterLayer:(next,fighters)=>next(this.mode==='hub'?fighters.filter(fighter=>fighter===battle.fighters[0]):fighters),
      drawFallback2D:(next,context,fighter,rect)=>{
        const palettes={
          rrvvfo:{body:'#b82329',hair:'#754f35',skin:'#8f5539'},bark:{body:'#8a6036',hair:'#151515',skin:'#a96f4e'},
          wade:{body:'#287cc8',hair:'#f0d12c',skin:'#9a6041'},pouki:{body:'#45666b',hair:'#d9d3c4',skin:'#86583f'},
          plouke:{body:'#34343d',hair:'#ece6d5',skin:'#8c5b40'},sage:{body:'#d8e4ef',hair:'#f5f7fa',skin:'#8d5b40'},
          'practice-fighter':{body:'#506f9e',hair:'#2d2636',skin:'#986044'},'qualifier-fighter':{body:'#a05d3b',hair:'#25221f',skin:'#8f5a3e'},
          'bracket-fighter':{body:'#7855a5',hair:'#382746',skin:'#9b6245'},'grunt-a':{body:'#626a76',hair:'#292c33',skin:'#8b5b42'},
          'grunt-b':{body:'#4f5662',hair:'#17191d',skin:'#8b5b42'}
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
      draw:next=>{next();if(this.mode==='hub')this.drawHubExtras();if(this.currentFight?.final&&['fatigue','awakening-ready','awakening'].includes(this.finalPhase))this.drawFinalFatigue()},
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
    this.battle.root.querySelector('.badge strong').textContent='PROTOTYPE 2.9A.8 • RRVVFO CHAPTER 2';
    const player=this.battle.fighters[0];
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' SHARED STORY ENGINE • OFFICIAL RING-OUT RULES';
    applyStoryProgressionToFighter(player,{...this.progress,storyLevel:this.level,storyXp:this.xp});
    const point=spawn||this.hubSpawn;
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.reset(point.x,point.z);
    this.hideSecondFighter();
    this.updateLevelHud();
    this.updateHubObjective();
    this.showAreaTitle('LOCAL TOURNAMENT GROUNDS');
    if(opening&&!this.state.tournamentStarted){
      this.showDialogue([
        {speaker:'SAGE',speakerClass:'neutral',text:'The tournament starts when they finish pretending this registration line is organized.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You brought me to a tournament held together by banners and hope.',tail:'down'},
        {speaker:'SAGE',speakerClass:'neutral',text:'Walk around. Talk to people. Try not to insult the building until after you register.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'No promises.',tail:'down'}
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

  showAreaTitle(name){
    const panel=this.root.querySelector('[data-c2-area]');
    this.root.querySelector('[data-c2-area-name]').textContent=name;
    panel.hidden=false;this.areaTimer=2.2;
  }

  setObjective(title,detail){
    this.root.querySelector('[data-c2-objective]').textContent=title;
    this.root.querySelector('[data-c2-detail]').textContent=detail;
  }

  updateHubObjective(){
    if(!this.state.sageVanished){
      this.setObjective('EXPLORE THE TOURNAMENT GROUNDS',`Talk to arriving competitors and workers. ${Math.min(this.state.talked.length,2)} / 2`);
    }else if(!this.state.firstBrawlComplete){
      this.setObjective('FIND OUT WHERE SAGE WENT','The practice-ring fighter saw him leave. Speak to the fighter.');
    }else if(!this.state.metBarkWade){
      this.setObjective('MEET THE OLD FACES','Bark and Wade just arrived in the central plaza.');
    }else{
      this.setObjective('REGISTER FOR THE TOURNAMENT','Talk to the registration worker when you are ready. Optional fights remain available.');
    }
  }

  activeNpcs(){
    return this.npcs.filter(npc=>{
      if(npc.id==='sage')return!this.state.sageVanished;
      if(npc.id==='practice')return this.state.sageVanished&&!this.state.firstBrawlComplete;
      if(npc.id==='bark'||npc.id==='wade')return this.state.firstBrawlComplete;
      if(npc.kind==='grunt')return this.state.firstBrawlComplete&&!this.state.gruntDefeated.includes(npc.id);
      if(npc.id==='bracket')return this.state.metBarkWade;
      return true;
    });
  }

  updateHub(dt){
    const player=this.battle.fighters[0];
    for(const key of Object.keys(this.gruntCooldown))this.gruntCooldown[key]=Math.max(0,this.gruntCooldown[key]-dt);
    const candidates=this.activeNpcs().filter(npc=>distance(player,npc)<135&&!(this.gruntCooldown[npc.id]>0));
    this.nearby=candidates.sort((a,b)=>distance(player,a)-distance(player,b))[0]||null;
    const prompt=this.root.querySelector('[data-c2-prompt]');
    prompt.hidden=!this.nearby;
    if(this.nearby){this.root.querySelector('[data-c2-prompt-title]').textContent=this.nearby.label;const detail=this.root.querySelector('[data-c2-prompt-detail]');if(detail)detail.textContent=this.engine.prompt('interact','E').toUpperCase();}
  }

  tryInteract(){
    if(this.mode!=='hub'||!this.nearby)return;
    const npc=this.nearby;
    if(npc.kind==='talk')this.talkToLocal(npc);
    else if(npc.kind==='registration')this.useRegistration(npc);
    else if(npc.kind==='practice')this.beginPracticeBrawl();
    else if(npc.kind==='bark')this.talkToBark();
    else if(npc.kind==='wade')this.talkToWade();
    else if(npc.kind==='grunt')this.beginGruntEncounter(npc);
    else if(npc.kind==='bracket')this.inspectBracket();
    else if(npc.kind==='sage')this.showDialogue([{speaker:'SAGE',speakerClass:'neutral',text:'I am standing right here. Go learn something from somebody less prepared.',tail:'down'}]);
  }

  talkToLocal(npc){
    const lines={
      fan:[
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'People say the winner gets a trophy, prize money, and free food.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'The free food sounds more believable than the prize money.',tail:'down'}
      ],
      vendor:[
        {speaker:'FOOD VENDOR',speakerClass:'neutral',text:'Buy something now. Prices double after the first round.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That is the most professional thing here so far.',tail:'down'}
      ],
      veteran:[
        {speaker:'OLD COMPETITOR',speakerClass:'neutral',text:'Never spend all your energy early. The final round punishes people who think exhaustion is optional.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Good advice for somebody else.',tail:'down'}
      ]
    }[npc.id]||[{speaker:npc.label,speakerClass:'neutral',text:'The tournament starts soon.',tail:'down'}];
    this.showDialogue(lines,()=>{
      if(!this.state.talked.includes(npc.id)){
        this.state.talked.push(npc.id);this.saveChapterState();
      }
      if(this.state.talked.length>=2&&!this.state.sageVanished)this.triggerSageDisappearance();
      else this.updateHubObjective();
    });
  }

  triggerSageDisappearance(){
    this.showDialogue([
      {speaker:'SAGE',speakerClass:'neutral',text:'Stay near the practice ring. I need to check something before your first brawl.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Check what?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Whether I planned far enough ahead.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'That answer made this more suspicious.',tail:'down'}
    ],()=>{
      this.state.sageVanished=true;
      this.saveChapterState();
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'He disappeared behind one tent. There is nowhere behind that tent to go.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Odd. Even for him.',tail:'down'}
      ],()=>this.updateHubObjective());
    });
  }

  beginPracticeBrawl(){
    this.showDialogue([
      {speaker:'PRACTICE RING FIGHTER',speakerClass:'rival',text:'Your old man vanished right before he told me to test you.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'He is not my old man. Also, you are doing a terrible job making this less suspicious.',tail:'down'}
    ],()=>{
      discoverCombatManualPage('training-levels',{
        reactionLines:['He wrote a level system into the manual?',"I cannot tell whether that's useful or insulting."],
        onClose:()=>this.startFight({
          id:'practice-fighter',name:'Practice Fighter',hp:52,xp:120,kind:'practice',story:false,
          intro:'FIRST BRAWL • TRAINING LEVELS ACTIVE'
        })
      });
    });
  }

  talkToBark(){
    if(!this.state.metBarkWade){this.meetBarkAndWade();return}
    if(this.state.barkSparResult==='won'){
      this.showDialogue([{speaker:'BARK',speakerClass:'neutral',text:'You already won the spar. Save the rest for the bracket.',tail:'down'}]);
      return;
    }
    this.showChoice({
      kicker:'OPTIONAL SIDE FIGHT',title:'SPAR WITH BARK?',
      text:'Bark wants one fight before the tournament starts. This is optional and can be skipped.',
      buttons:[
        {label:'SPAR',value:'fight',primary:true},
        {label:'NOT NOW',value:'leave'}
      ],
      onChoose:value=>{
        if(value==='fight')this.startFight({id:'bark',name:'Bark',hp:78,xp:85,kind:'bark-spar',story:false,intro:'OPTIONAL SPAR • BARK'});
        else this.resumeHub();
      }
    });
  }

  talkToWade(){
    if(!this.state.metBarkWade){this.meetBarkAndWade();return}
    this.showDialogue([
      {speaker:'WADE',speakerClass:'neutral',text:'You should probably warm up. I saw your name on my side of the bracket.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Then you should probably warm up more.',tail:'down'}
    ]);
  }

  meetBarkAndWade(){
    this.showDialogue([
      {speaker:'WADE',speakerClass:'neutral',text:'There you are. Where did Sage go?',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'He disappeared before my first brawl. Literally disappeared.',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'That sounds like him. Want a spar before the tournament?',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You ask that like I would say no.',tail:'down'}
    ],()=>{
      this.state.metBarkWade=true;
      this.saveChapterState();
      this.updateHubObjective();
      this.talkToBark();
    });
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
    this.pendingGrunt=npc;
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
    const npc=this.pendingGrunt;
    if(success){
      this.gruntCooldown[npc.id]=8;
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'I am choosing not to waste tournament energy on you.',tail:'down'},
        {speaker:npc.label,speakerClass:'rival',text:'You ran away.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I chose quickly in another direction.',tail:'down'}
      ],()=>this.resumeHub());
    }else{
      this.battle.notice('ESCAPE FAILED • FIGHT FORCED',1.4);
      this.startFight({id:npc.id,name:npc.label,hp:44,xp:40,kind:'grunt',story:false,intro:'ESCAPE FAILED'});
    }
  }

  inspectBracket(){
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Wade is on my side. Bark is fighting somebody named Pouki.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'And the last name on the board is Plouke. Nobody remembers seeing him register.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Good. A mysterious final opponent. Very original.',tail:'down'}
    ]);
  }

  useRegistration(){
    if(!this.state.firstBrawlComplete){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'No entry until your practice-ring check is complete.',tail:'down'}]);return;
    }
    if(!this.state.metBarkWade){
      this.showDialogue([{speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Your group is still gathering in the plaza. Talk to them first.',tail:'down'}]);return;
    }
    this.showChoice({
      kicker:'STORY PROGRESSION',title:'START THE TOURNAMENT?',
      text:'Starting the tournament begins the full bracket: two random entrants, Wade, Bark versus Pouki, and the final against Plouke. Optional hub fights can be revisited after Chapter 2.',
      buttons:[{label:'START TOURNAMENT',value:'start',primary:true},{label:'KEEP EXPLORING',value:'leave'}],
      onChoose:value=>{
        if(value==='start'){
          this.state.tournamentStarted=true;this.state.tournamentStep='round-1';this.saveChapterState();
          this.startTournamentStep('round-1');
        }else this.resumeHub();
      }
    });
  }

  startFight(config){
    const opponentMaxHp=this.chapter2OpponentHealth(config);
    const official=Boolean(config.kind==='tournament');
    const optional=Boolean(['practice','bark-spar','grunt'].includes(config.kind));
    this.currentFight={...config,official,optional,elapsed:0,koTarget:config.final?1:official?3:1,playerKOs:0,foeKOs:0,koLocked:false,opponentMaxHp,playerMaxHp:100};
    this.root.querySelector('[data-c2-prompt]').hidden=true;
    this.mode='transition';
    const beginFight=()=>{
      this.battle.fighters[0].id='rrvvfo';
      this.battle.fighters[1].id=config.id;
      this.switchStage('tournament');
      this.mode='fight';
      const player=this.battle.fighters[0],foe=this.battle.fighters[1];
      player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.maxHp=this.currentFight.playerMaxHp;player.reset(-370,78);player.en=config.final?80:45;player.guard=100;player.asset=null;
      applyStoryProgressionToFighter(player,{...this.progress,storyLevel:this.level,storyXp:this.xp});
      foe.id=config.id;foe.name=config.name;foe.accent=this.opponentAccent(config.id);foe.cpu=true;foe.maxHp=this.currentFight.opponentMaxHp;foe.reset(370,-78);foe.en=config.final?80:45;foe.guard=100;foe.asset=null;
      this.battle.koTarget=this.currentFight.koTarget;this.battle.scores=[0,0];this.battle.round=1;this.battle.phase='play';this.battle.time=Infinity;this.battle.hideBanner();
      // Official Chapter 2 tournament combat uses ring-outs. The scripted final
      // remains KO-only so its Fire Awakening and beam-clash sequence cannot skip.
      this.battle.ringOutEnabled=Boolean(this.currentFight.official&&!config.final);
      this.battle.onRingOut=fighter=>{
        if(this.mode!=='fight'||!this.currentFight?.official||this.currentFight?.final||this.currentFight?.koLocked)return;
        this.handleFightKo(fighter===this.battle.fighters[1],'RING OUT');
      };
      this.battle.root.classList.remove('chapter2HubMode');
      this.battle.root.classList.add('chapter2StoryActive','chapter2FightMode');
      this.root.classList.add('isFight');
      this.battle.root.querySelector('[data-stage-name]').textContent=`LOCAL TOURNAMENT • ${config.name.toUpperCase()}`;
      this.setArenaNames('RRVVFO',config.name.toUpperCase());
      const run=this.root.querySelector('[data-tournament-run]');
      run.hidden=!config.story||this.state.runRefusals>=4;
      this.setObjective(
        config.final?'SURVIVE THE SCRIPTED FINAL':this.currentFight.official?'SCORE 3 KOs OR RING-OUTS TO ADVANCE':'SCORE 1 KO TO WIN',
        config.final
          ?'Survive Plouke long enough to reach the Fire Awakening attempt.'
          :this.currentFight.official
            ?`Defeat ${config.name} three times. KOs and ring-outs both count. Opponent health: ${this.currentFight.opponentMaxHp}.`
            :`This optional or practice fight ends after one KO. Ring-outs are disabled. Opponent health: ${this.currentFight.opponentMaxHp}.`
      );
      this.updateLevelHud();
    };
    if(config.skipCard)beginFight();else this.showTournamentCard(config.intro||'FIGHT',`${config.name} is waiting in the ring.`,beginFight);
  }

  opponentAccent(id){
    return({bark:'#9a6a3a',wade:'#2f91e3',pouki:'#6ca2a7',plouke:'#e6ddc7','practice-fighter':'#6f8fbe','qualifier-fighter':'#cf7446','bracket-fighter':'#9a6cc9','grunt-a':'#7d8694','grunt-b':'#5e6672'}[id]||'#8667c7');
  }

  chapter2OpponentHealth(config={}){
    if(config.final)return 150;
    const base=Math.max(1,Number(config.hp)||70);
    if(config.kind==='tournament')return Math.max(120,Math.round(base*1.55));
    return Math.max(70,Math.round(base*1.25));
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
      // Story rematches always restart at 0–0, but skip extra dialogue so a
      // close 2–3 loss gets the player back into the ring immediately.
      this.battle.banner('REMATCH • 0–0');this.koTimer=window.setTimeout(()=>this.startFight({...fight,playerKOs:0,foeKOs:0,koLocked:false,skipCard:true}),650);
      return;
    }

    this.grantXp(fight.xp||0,`${fight.name.toUpperCase()} DEFEATED`,()=>{
      if(fight.kind==='practice'){
        this.state.firstBrawlComplete=true;this.saveChapterState();
        this.showDialogue([
          {speaker:'PRACTICE RING FIGHTER',speakerClass:'rival',text:'Sage said winning would introduce your level system.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'He vanished and still managed to tutorialize me.',tail:'down'},
          {speaker:'WADE',speakerClass:'neutral',text:'Rrvvfo!',tail:'down'}
        ],()=>this.enterHub({spawn:{x:-420,z:80}}));
      }else if(fight.kind==='bark-spar'){
        this.state.barkSparResult='won';this.saveChapterState();
        this.showDialogue([
          {speaker:'BARK',speakerClass:'neutral',text:'You are faster than you were after Season 1.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'That sounded almost like praise.',tail:'down'},
          {speaker:'BARK',speakerClass:'neutral',text:'Do not get used to it.',tail:'down'}
        ],()=>this.enterHub({spawn:{x:40,z:170}}));
      }else if(fight.kind==='grunt'){
        this.state.gruntDefeated=unique([...this.state.gruntDefeated,fight.id]);this.saveChapterState();
        this.showDialogue([
          {speaker:fight.name.toUpperCase(),speakerClass:'rival',text:'Fine. Go win your tournament.',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'That was already the plan.',tail:'down'}
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
    if(step==='round-1'){
      discoverCombatManualPage('tournament-rules',{
        reactionLines:[
          'Wait. Crossing the edge counts as losing a stock?',
          'So camping near the boundary is somehow an even worse idea than usual.',
          'Fine. Three KOs or ring-outs. I only need one of those rules.'
        ],
        onClose:()=>this.showDialogue([
          {speaker:'ANNOUNCER',speakerClass:'rival',text:'Official matches are first to three! A knockout or crossing the ring boundary removes one stock!',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'So the edge is an attack now. Great. At least anyone camping there is volunteering.',tail:'down'},
          {speaker:'ANNOUNCER',speakerClass:'rival',text:'Opening round! Rrvvfo versus an entrant whose registration handwriting nobody can read!',tail:'down'},
          {speaker:'RRVVFO',speakerClass:'p1',text:'A random person. Perfect.',tail:'down'}
        ],()=>this.startFight({id:'qualifier-fighter',name:'Qualifier Fighter',hp:54,xp:90,kind:'tournament',story,intro:'ROUND ONE'}))
      });
    }else if(step==='quarterfinal'){
      this.startFight({id:'bracket-fighter',name:'Bracket Fighter',hp:68,xp:105,kind:'tournament',story,intro:'QUARTERFINAL'});
    }else if(step==='bark-pouki'){
      this.startPoukiExhibition();
    }else if(step==='wade'){
      this.showDialogue([
        {speaker:'WADE',speakerClass:'neutral',text:'Guess the bracket really wanted this.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Try not to be predictable this time.',tail:'down'},
        {speaker:'WADE',speakerClass:'neutral',text:'Try to keep up.',tail:'down'}
      ],()=>this.startFight({id:'wade',name:'Wade',hp:90,xp:140,kind:'tournament',story,intro:'SEMIFINAL • RRVVFO VS WADE'}));
    }else if(step==='final'){
      this.startFinal();
    }
  }

  afterTournamentFight(fight){
    if(fight.id==='qualifier-fighter'){
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'One random down.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Rrvvfo advances to the quarterfinal!',tail:'down'}
      ],()=>this.startTournamentStep('quarterfinal'));
    }else if(fight.id==='bracket-fighter'){
      this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Rrvvfo advances! Next on the other ring: Bark versus Pouki!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Bark has this.',tail:'down'}
      ],()=>this.startTournamentStep('bark-pouki'));
    }else if(fight.id==='wade'){
      this.showDialogue([
        {speaker:'WADE',speakerClass:'neutral',text:'You win. Do not waste it in the final.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I am not planning to waste anything.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Plouke has defeated Pouki in the opposite semifinal. The final is set!',tail:'down'}
      ],()=>this.startTournamentStep('final'));
    }
  }

  startPoukiExhibition(){
    this.showTournamentCard('BARK VS POUKI','Watch Bark’s quarterfinal from ringside.',()=>{
      this.battle.fighters[0].id='bark';
      this.battle.fighters[1].id='pouki';
      this.switchStage('tournament');
      this.mode='spectator';this.currentFight={id:'pouki-exhibition',elapsed:0};
      const bark=this.battle.fighters[0],pouki=this.battle.fighters[1];
      bark.id='bark';bark.name='Bark';bark.accent='#9a6a3a';bark.cpu=true;bark.reset(-370,78);bark.hp=100;bark.en=70;bark.asset=null;
      pouki.id='pouki';pouki.name='Pouki';pouki.accent='#6ca2a7';pouki.cpu=true;pouki.reset(370,-78);pouki.hp=100;pouki.en=80;pouki.asset=null;
      this.battle.phase='play';this.battle.time=9999;this.battle.ringOutEnabled=false;this.battle.onRingOut=null;this.battle.hideBanner();
      this.setArenaNames('BARK','POUKI');
      this.setObjective('WATCH BARK VS POUKI','Pouki is overwhelming Bark.');
    });
  }

  updateSpectator(dt){
    if(!this.currentFight)return;
    this.currentFight.elapsed+=dt;
    if(this.currentFight.elapsed>12)this.finishPoukiExhibition();
  }

  finishPoukiExhibition(){
    if(this.mode!=='spectator')return;
    this.mode='story';this.battle.phase='story';
    this.showDialogue([
      {speaker:'ANNOUNCER',speakerClass:'rival',text:'Pouki wins! Bark was eliminated before he could establish his defense!',tail:'down'},
      {speaker:'BARK',speakerClass:'neutral',text:'He broke through everything too quickly.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Then I will hit him before he can do that to me.',tail:'down'},
      {speaker:'WADE',speakerClass:'neutral',text:'You still have to beat me first.',tail:'down'}
    ],()=>this.startTournamentStep('wade'));
  }

  startFinal(){
    this.finalElapsed=0;this.finalPhase='opening';
    this.showDialogue([
      {speaker:'PLOUKE',speakerClass:'rival',text:'You used too much energy reaching this round.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I could win this tired.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'That confidence is exactly why you are tired.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Keep talking. It will make losing more embarrassing.',tail:'down'}
    ],()=>this.startFight({id:'plouke',name:'Plouke',hp:100,xp:0,kind:'final',story:true,final:true,intro:'FINAL • RRVVFO VS PLOUKE'}));
  }

  beginFinalFatigue(){
    if(!this.currentFight?.final||this.finalPhase!=='opening')return;
    this.finalPhase='fatigue';this.mode='story';this.battle.phase='story';
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Why am I already this tired?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'You fought every round as if your energy could not end.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'It usually waits longer before proving me wrong.',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Then keep fighting.',tail:'down'}
    ],()=>{
      this.mode='fight';this.battle.phase='play';
      this.setObjective('SURVIVE THE FINAL','Rrvvfo is slowing down. Conserve energy and keep fighting Plouke.');
    });
  }

  offerAwakening(){
    if(this.finalPhase==='opening'){this.beginFinalFatigue();return}
    if(!this.currentFight?.final||['awakening-ready','awakening','clash','finished'].includes(this.finalPhase))return;
    this.finalPhase='awakening-ready';this.mode='story';this.battle.phase='story';
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Fine. I will end this with Fire Awakening.',tail:'down'},
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
      {speaker:'RRVVFO',speakerClass:'p1',text:'Why is it not holding?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'Because power does not erase exhaustion.',tail:'down'},
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
      {speaker:'RRVVFO',speakerClass:'p1',text:clashWon?'I pushed it back—wait, where is the floor?':'My arms will not move...',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:clashWon?'You won the clash. I won the ring.':'The match is over.',tail:'down'},
      {speaker:'ANNOUNCER',speakerClass:'rival',text:clashWon?'Rrvvfo wins the beam clash—but Plouke wins by ring-out!':'Plouke wins the tournament!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Who are you?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'You really did skim the disguise section.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...No.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Plouke was me.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You vanished, entered the tournament, beat Pouki, exhausted me in the final, and called it training?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:clashWon?'And you won the clash. That earns a level. It does not earn awareness of the ring edge.':'You learned more while believing I was absent.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I hate how planned ahead you are.',tail:'down'}
    ],()=>this.commitCompletion());
    if(clashWon){
      const needed=Math.max(120,(LEVEL_THRESHOLDS[this.level]??this.xp+120)-this.xp+20);
      this.grantXp(needed,'BEAM CLASH VICTORY • BONUS LEVEL',reveal);
    }else reveal();
  }

  drawFinalFatigue(){
    const r=this.battle.renderer,player=this.battle.fighters[0];
    const pulse=1+Math.sin(performance.now()/95)*.08;
    r.disc({x:player.x,y:6,z:player.z,rx:62*pulse,rz:40*pulse,color:'#ff713f',alpha:.18});
    if(this.finalPhase==='awakening'||this.finalPhase==='awakening-ready')r.billboard({x:player.x,y:78+player.y,z:player.z,size:155*pulse,color:'#ff9d3f',alpha:.18});
  }

  attemptTournamentRun(){
    if(this.mode!=='fight'||!this.currentFight?.story||this.currentFight?.final&&this.finalPhase==='clash')return;
    const lines=[
      ['Definitely not.'],
      ['Who do you think I am?'],
      ['I said I refuse. Stop it already.'],
      ['Why do I keep subconsciously trying to run?','I am winning this tournament whether I like it or not.']
    ];
    const index=Math.min(this.state.runRefusals,3);
    this.state.runRefusals=Math.min(4,this.state.runRefusals+1);this.saveChapterState();
    const wasMode=this.mode;this.mode='story';this.battle.phase='story';
    this.showDialogue(lines[index].map(text=>({speaker:'RRVVFO',speakerClass:'p1',text,tail:'down'})),()=>{
      this.mode=wasMode;this.battle.phase='play';
      if(this.state.runRefusals>=4)this.root.querySelector('[data-tournament-run]').hidden=true;
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
    this.level=result.newLevel;this.xp=result.xp;this.progress=result.progress;
    applyStoryProgressionToFighter(this.battle.fighters[0],this.progress);
    this.updateLevelHud();
    if(result.newLevel>result.oldLevel)this.showLevelUp(source,onDone);
    else onDone?.();
  }

  updateLevelHud(){
    this.root.querySelector('[data-c2-level]').textContent=String(this.level);
    this.root.querySelector('[data-c2-xp]').textContent=levelHudText(this.level,this.xp);
    const floor=LEVEL_THRESHOLDS[Math.max(0,this.level-1)]||0;
    const ceiling=LEVEL_THRESHOLDS[this.level]??floor;
    const span=Math.max(1,ceiling-floor);
    const progress=this.level>=LEVEL_THRESHOLDS.length?1:clamp((this.xp-floor)/span,0,1);
    const fill=this.root.querySelector('[data-c2-xp-fill]');
    if(fill)fill.style.width=`${Math.round(progress*100)}%`;
    const next=this.root.querySelector('[data-c2-xp-next]');
    if(next)next.textContent=this.level>=LEVEL_THRESHOLDS.length?'MAXIMUM TRAINING LEVEL':`${Math.max(0,ceiling-this.xp)} XP TO NEXT LEVEL`;
  }

  canOpenStoryMenu(){
    return !this.aborted&&!this.storyMenuOpen&&!['dialogue','choice','qte','clash','level','transition'].includes(this.mode);
  }

  openStoryMenu(){
    if(!this.canOpenStoryMenu())return;
    this.storyMenuOpen=true;
    this.updateLevelHud();
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
    this.root.querySelector('[data-level-attack]').textContent=`+${((this.level-1)*2.5).toFixed(1)}%`;
    this.root.querySelector('[data-level-energy]').textContent=`+${(this.level-1)*2}%`;
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
    if(this.storyMenuOpen){
      if(event.key==='Escape'||event.key==='Tab'){
        event.preventDefault();event.stopImmediatePropagation();this.closeStoryMenu();
      }
      return;
    }
    if((event.key==='Escape'||event.key==='Tab')&&this.canOpenStoryMenu()){
      event.preventDefault();event.stopImmediatePropagation();this.openStoryMenu();return;
    }
    if(this.mode==='hub'&&(event.key==='Enter'||event.code==='KeyE')){
      event.preventDefault();event.stopImmediatePropagation();this.tryInteract();return;
    }
    if(this.mode==='qte'&&['KeyA','KeyD','Space'].includes(event.code)){
      event.preventDefault();event.stopImmediatePropagation();this.acceptQteInput(event.code);return;
    }
    if(this.mode==='clash'&&(event.code==='Space'||event.key.toLowerCase()==='j'||event.key==='1')){
      event.preventDefault();event.stopImmediatePropagation();this.clashInput();return;
    }
    if(event.key.toLowerCase()==='m'&&['hub','fight'].includes(this.mode)){
      event.preventDefault();event.stopImmediatePropagation();this.openStoryMenu();
    }
  }

  drawHubExtras(){
    if(!this.battle?.renderer)return;
    const r=this.battle.renderer,time=performance.now()/1000;
    for(const [index,npc] of this.activeNpcs().entries()){
      const bob=Math.sin(time*2+npc.x*.01)*2;
      r.disc({x:npc.x,y:5,z:npc.z,rx:27,rz:18,color:'#000',alpha:.24});
      if(npc.kind==='bracket'){
        r.box({x:npc.x,y:80,z:npc.z,sx:120,sy:150,sz:18,color:npc.color});
        r.box({x:npc.x,y:155,z:npc.z,sx:135,sy:18,sz:28,color:npc.hair});
        continue;
      }
      r.box({x:npc.x,y:48+bob,z:npc.z,sx:32,sy:64,sz:25,color:npc.color});
      r.box({x:npc.x,y:92+bob,z:npc.z,sx:29,sy:29,sz:27,color:'#946044'});
      r.box({x:npc.x,y:112+bob,z:npc.z,sx:35,sy:16,sz:31,color:npc.hair});
      if(npc.id==='sage')r.billboard({x:npc.x,y:145,z:npc.z,size:48,color:'#dff5ff',alpha:.22});
      if(npc.kind==='grunt')r.disc({x:npc.x,y:7,z:npc.z,rx:42,rz:28,color:'#ffcf4d',alpha:.18});
      if(npc.id==='bark'||npc.id==='wade')r.disc({x:npc.x,y:7,z:npc.z,rx:40,rz:26,color:npc.id==='bark'?'#b88750':'#59b7ff',alpha:.18});
    }
    // Crowd movement makes the hub feel active without turning every NPC into an interaction.
    const crowdColors=['#d45172','#4ea4d1','#d99c45','#6e58ad','#5aa36d'];
    for(let i=0;i<18;i++){
      const drift=((i*173+time*20*(i%2?1:-1))%1500+1500)%1500;
      const x=-760+drift;
      const z=(i%2?680:-680)+Math.sin(time*.5+i)*36;
      r.box({x,y:42,z,sx:25,sy:58,sz:22,color:crowdColors[i%crowdColors.length],alpha:.82});
      r.box({x,y:82,z,sx:23,sy:23,sz:22,color:'#8f5d42',alpha:.85});
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
    this.state.tournamentStep='complete';
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
