import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=28b1-chapter2-compat-20260728-022318';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=28b1-chapter2-compat-20260728-022318';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=28b1-chapter2-compat-20260728-022318';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=28b1-chapter2-compat-20260728-022318';

const MISSION_ID='rrvvfo-02';
const UI_ID='rrvvfoMission2UI';
const LEVEL_THRESHOLDS=[0,100,240,420,650,930,1260,1640];
let activeMission=null;

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
      <div class="chapter2Stats">
        <span><small>TRAINING LEVEL</small><strong data-c2-level>1</strong></span>
        <span><small>STORY XP</small><strong data-c2-xp>0 / 100</strong></span>
        <button type="button" data-c2-manual>MANUAL</button>
        <button type="button" data-c2-exit>EXIT</button>
      </div>
    </div>

    <div class="chapter2AreaTitle" data-c2-area hidden>
      <small>THE LOST YEAR</small><strong data-c2-area-name>LOCAL TOURNAMENT GROUNDS</strong>
    </div>

    <div class="chapter2Prompt" data-c2-prompt hidden>
      <strong data-c2-prompt-title>INTERACT</strong><span>LIGHT ATTACK / ENTER</span>
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
          <button type="button" data-c2-qte-input="ArrowLeft">←</button>
          <button type="button" data-c2-qte-input="Space">JUMP</button>
          <button type="button" data-c2-qte-input="ArrowRight">→</button>
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
        <p>Mash FIRE to push back Plouke's beam. The result is part of the story, but your resistance changes Rrvvfo's final line.</p>
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
        <p>Rrvvfo reached the final, exhausted himself against Plouke, lost the beam clash, and discovered that Plouke was the Sage in disguise.</p>
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
  constructor({onComplete=()=>{},onExit=()=>{}}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.progress=loadLostYearProgress();
    this.completedBefore=this.progress.completedMissions?.includes(MISSION_ID);
    this.replayMode=false;
    this.state={
      talked:[],sageVanished:false,firstBrawlComplete:false,metBarkWade:false,
      barkSparResult:null,gruntDefeated:[],tournamentStarted:false,
      tournamentStep:'round-1',runRefusals:0,
      ...(this.progress.chapter2State||{})
    };
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
    this.awakeningReadyAt=0;
    this.clash={active:false,power:18,endAt:0,lastButton:false};
    this.completed=false;
    this.aborted=false;
    this.hubSpawn={x:-1510,z:80};
    this.npcs=this.createNpcs();

    this.root.querySelector('[data-c2-manual]').addEventListener('click',()=>openCombatManual());
    this.root.querySelector('[data-c2-exit]').addEventListener('click',()=>this.exitToStory());
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
    resetArenaBattleInstance();
    this.battle=new ArenaBattle('tournament-hub');
    this.patchBattle();
    if(this.completedBefore){
      this.replayMode=true;
      this.state={...this.state,sageVanished:true,firstBrawlComplete:true,metBarkWade:true,tournamentStarted:false,tournamentStep:'round-1'};
      this.enterHub({opening:false,spawn:{x:-420,z:80}});
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'Back at the tournament grounds. I can revisit the hub or run through the bracket again.',tail:'down'},
        {speaker:'BARK',speakerClass:'neutral',text:'The practice ring is still open.',tail:'down'}
      ]);
    }else if(this.state.tournamentStarted){
      this.battle.fighters[0].id='rrvvfo';
      this.battle.fighters[1].id='qualifier-fighter';
      this.switchStage('tournament');
      this.mode='story';this.battle.phase='story';this.battle.hideBanner();
      this.startTournamentFromCheckpoint();
    }else{
      this.enterHub({opening:true});
    }
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    const baseInput=battle.input.bind(battle);
    const baseCpu=battle.cpu.bind(battle);
    const baseCast=battle.castAbility.bind(battle);
    const baseUpdate=battle.update.bind(battle);
    const baseApplyDamage=battle.applyDamage.bind(battle);
    const baseDraw=battle.draw.bind(battle);
    const baseDrawFighterLayer=battle.drawFighterLayer.bind(battle);
    const baseFlipFor=battle.flipFor.bind(battle);
    const baseDrawFallback2D=battle.drawFallback2D.bind(battle);
    const baseExit=battle.exit.bind(battle);

    battle.input=()=>{
      if(this.mode==='hub'){
        const command=baseInput();
        const interact=Boolean(command.light);
        if(interact&&!this.interactHeld)this.tryInteract();
        this.interactHeld=interact;
        return{...command,light:false,heavy:false,launcher:false,block:false,special:false};
      }
      if(this.mode==='fight'){
        const command=baseInput();
        if(this.currentFight?.final&&this.finalPhase==='fatigue'){
          return{...command,x:(command.x||0)*.82,z:(command.z||0)*.82,dash:false};
        }
        return command;
      }
      if(this.mode==='spectator')return baseCpu(battle.fighters[0],battle.fighters[1],1/60);
      return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false};
    };

    battle.cpu=(fighter,foe,dt)=>{
      if(this.mode!=='fight'&&this.mode!=='spectator')return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false};
      const command=baseCpu(fighter,foe,dt);
      if(this.currentFight?.id==='wade')return{...command,x:(command.x||0)*1.18,z:(command.z||0)*1.18,dash:command.dash||Math.random()<.045,special:false};
      if(this.currentFight?.id==='plouke')return{...command,block:command.block||Math.random()<.18,special:command.special||Math.random()<.035};
      if(this.mode==='spectator'&&fighter.id==='pouki')return{...command,heavy:command.heavy||Math.random()<.12,dash:command.dash||Math.random()<.06,special:false};
      return{...command,special:this.currentFight?.id==='plouke'?command.special:false};
    };

    battle.castAbility=slot=>{
      if(this.mode==='hub'){
        battle.notice('SAVE IT FOR THE RING',1.1);
        return false;
      }
      if(this.mode!=='fight')return false;
      if(this.currentFight?.final&&slot===5){
        if(this.finalPhase==='awakening-ready'){
          this.triggerAwakeningAttempt();
          return true;
        }
        battle.notice('FIRE AWAKENING WILL NOT ANSWER YET',1.2);
        return false;
      }
      return baseCast(slot);
    };

    battle.applyDamage=(attacker,target,damage,meta={})=>{
      let adjusted=damage;
      if(this.mode==='fight'&&attacker===battle.fighters[0]&&!this.currentFight?.final){
        adjusted*=1+(this.level-1)*.025;
      }
      if(this.mode==='fight'&&this.currentFight?.final){
        if(attacker===battle.fighters[1])adjusted*=this.finalPhase==='fatigue'?1.34:1.12;
        if(attacker===battle.fighters[0]&&this.finalPhase==='fatigue')adjusted*=.78;
      }
      if(this.mode==='spectator'){
        if(attacker.id==='pouki')adjusted*=2.65;
        if(attacker.id==='bark')adjusted*=.48;
      }
      const connected=baseApplyDamage(attacker,target,adjusted,meta);
      if(!connected)return connected;

      const player=battle.fighters[0];
      const foe=battle.fighters[1];
      if(this.mode==='fight'&&this.currentFight?.final){
        if(target===foe&&foe.hp<=48){
          foe.hp=48;
          if(this.finalPhase==='opening')queueMicrotask(()=>this.beginFinalFatigue());
        }
        if(target===player&&player.hp<=27){
          player.hp=27;
          if(this.finalPhase==='opening'||this.finalPhase==='fatigue')queueMicrotask(()=>this.offerAwakening());
        }
      }else if(this.mode==='fight'){
        if(target===foe&&foe.hp<=0){
          foe.hp=1;
          queueMicrotask(()=>this.finishCurrentFight(true));
        }else if(target===player&&player.hp<=0){
          player.hp=1;
          queueMicrotask(()=>this.finishCurrentFight(false));
        }
      }else if(this.mode==='spectator'){
        if(target===player&&player.hp<=0){
          player.hp=1;
          queueMicrotask(()=>this.finishPoukiExhibition());
        }else if(target===foe&&foe.hp<=58){
          foe.hp=58;
        }
      }
      return connected;
    };

    battle.update=dt=>{
      baseUpdate(dt);
      if(!battle.active||this.aborted)return;
      this.areaTimer=Math.max(0,this.areaTimer-dt);
      if(!this.areaTimer)this.root.querySelector('[data-c2-area]').hidden=true;
      if(this.mode==='hub'){
        const player=battle.fighters[0];
        player.hp=100;player.en=100;player.guard=100;
        battle.time=9999;
        this.updateHub(dt);
      }else if(this.mode==='fight'){
        battle.time=9999;
        this.updateFight(dt);
      }else if(this.mode==='spectator'){
        battle.time=9999;
        this.updateSpectator(dt);
      }else if(this.mode==='qte'){
        this.updateQte();
      }else if(this.mode==='clash'){
        this.updateBeamClash();
      }
    };

    battle.flipFor=fighter=>{
      if(this.mode==='hub'&&fighter===battle.fighters[0]){
        const speed=Math.hypot(fighter.moveX||0,fighter.moveZ||0);
        if(speed>.05){
          const self=battle.renderer.project(fighter.x,80+fighter.y,fighter.z);
          const ahead=battle.renderer.project(fighter.x+(fighter.moveX||fighter.aimX||1)*120,80+fighter.y,fighter.z+(fighter.moveZ||fighter.aimZ||0)*120);
          this.playerFlip=ahead.x<self.x;
        }
        return this.playerFlip;
      }
      return baseFlipFor(fighter);
    };

    battle.drawFighterLayer=fighters=>{
      const visible=this.mode==='hub'?fighters.filter(fighter=>fighter===battle.fighters[0]):fighters;
      baseDrawFighterLayer(visible);
    };

    battle.drawFallback2D=(context,fighter,rect)=>{
      const palettes={
        rrvvfo:{body:'#b82329',hair:'#754f35',skin:'#8f5539'},
        bark:{body:'#8a6036',hair:'#151515',skin:'#a96f4e'},
        wade:{body:'#287cc8',hair:'#f0d12c',skin:'#9a6041'},
        pouki:{body:'#45666b',hair:'#d9d3c4',skin:'#86583f'},
        plouke:{body:'#34343d',hair:'#ece6d5',skin:'#8c5b40'},
        sage:{body:'#d8e4ef',hair:'#f5f7fa',skin:'#8d5b40'},
        'practice-fighter':{body:'#506f9e',hair:'#2d2636',skin:'#986044'},
        'qualifier-fighter':{body:'#a05d3b',hair:'#25221f',skin:'#8f5a3e'},
        'bracket-fighter':{body:'#7855a5',hair:'#382746',skin:'#9b6245'},
        'grunt-a':{body:'#626a76',hair:'#292c33',skin:'#8b5b42'},
        'grunt-b':{body:'#4f5662',hair:'#17191d',skin:'#8b5b42'}
      };
      const palette=palettes[fighter.id];
      if(!palette){baseDrawFallback2D(context,fighter,rect);return}
      const cx=rect.x+rect.width/2,scale=rect.height/190;
      context.fillStyle='rgba(0,0,0,.34)';context.beginPath();context.ellipse(cx,rect.y+rect.height-3,35*scale,10*scale,0,0,Math.PI*2);context.fill();
      context.fillStyle=palette.body;context.fillRect(cx-24*scale,rect.y+70*scale,48*scale,82*scale);
      context.fillStyle=palette.skin;context.beginPath();context.arc(cx,rect.y+50*scale,20*scale,0,Math.PI*2);context.fill();
      context.fillStyle=palette.hair;context.fillRect(cx-24*scale,rect.y+20*scale,48*scale,25*scale);
      context.fillStyle='#fff';context.font=`900 ${Math.max(8,11*scale)}px Inter,Arial,sans-serif`;context.textAlign='center';context.fillText(fighter.name.toUpperCase(),cx,rect.y+8*scale);
    };

    battle.draw=()=>{
      baseDraw();
      if(this.mode==='hub')this.drawHubExtras();
      if(this.currentFight?.final&&['fatigue','awakening-ready','awakening'].includes(this.finalPhase))this.drawFinalFatigue();
    };

    battle.exit=()=>{
      baseExit();
      this.exitToStory();
    };
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
    this.battle.root.classList.add('chapter2HubMode');
    this.battle.root.querySelector('[data-stage-name]').textContent='LOCAL TOURNAMENT GROUNDS';
    this.battle.root.querySelector('.badge strong').textContent='PROTOTYPE 2.8B • CHAPTER 2';
    const player=this.battle.fighters[0];
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
    if(this.nearby)this.root.querySelector('[data-c2-prompt-title]').textContent=this.nearby.label;
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
    this.qteSequence=['ArrowLeft','Space','ArrowRight'];this.qteIndex=0;this.qteDeadline=performance.now()+3600;
    this.renderQte();
  }

  renderQte(){
    const labels={ArrowLeft:'←',ArrowRight:'→',Space:'JUMP'};
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
    const pads=navigator.getGamepads?.()||[];
    for(const pad of pads){
      if(!pad)continue;
      const values={ArrowLeft:pad.buttons[14]?.pressed||pad.axes[0]<-.55,ArrowRight:pad.buttons[15]?.pressed||pad.axes[0]>.55,Space:pad.buttons[0]?.pressed};
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
          discoverCombatManualPage('tournament-rules',{onClose:()=>{
            this.state.tournamentStarted=true;this.state.tournamentStep='round-1';this.saveChapterState();
            this.startTournamentStep('round-1');
          }});
        }else this.resumeHub();
      }
    });
  }

  startFight(config){
    this.currentFight={...config,elapsed:0};
    this.root.querySelector('[data-c2-prompt]').hidden=true;
    this.mode='transition';
    this.showTournamentCard(config.intro||'FIGHT',`${config.name} is waiting in the ring.`,()=>{
      this.battle.fighters[0].id='rrvvfo';
      this.battle.fighters[1].id=config.id;
      this.switchStage('tournament');
      this.mode='fight';
      const player=this.battle.fighters[0],foe=this.battle.fighters[1];
      player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.reset(-370,78);player.hp=100;player.en=100;player.guard=100;player.asset=null;
      foe.id=config.id;foe.name=config.name;foe.accent=this.opponentAccent(config.id);foe.cpu=true;foe.reset(370,-78);foe.hp=config.hp||70;foe.en=100;foe.guard=100;foe.asset=null;
      this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();
      this.battle.root.classList.remove('chapter2HubMode');
      this.battle.root.querySelector('[data-stage-name]').textContent=`LOCAL TOURNAMENT • ${config.name.toUpperCase()}`;
      this.setArenaNames('RRVVFO',config.name.toUpperCase());
      const run=this.root.querySelector('[data-tournament-run]');
      run.hidden=!config.story||this.state.runRefusals>=4;
      this.setObjective(config.story?'WIN THE TOURNAMENT MATCH':'WIN THE OPTIONAL FIGHT',`Defeat ${config.name}.`);
      this.updateLevelHud();
    });
  }

  opponentAccent(id){
    return({bark:'#9a6a3a',wade:'#2f91e3',pouki:'#6ca2a7',plouke:'#e6ddc7','practice-fighter':'#6f8fbe','qualifier-fighter':'#cf7446','bracket-fighter':'#9a6cc9','grunt-a':'#7d8694','grunt-b':'#5e6672'}[id]||'#8667c7');
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
      if(this.finalPhase==='awakening-ready'&&performance.now()>this.awakeningReadyAt)this.triggerAwakeningAttempt();
    }
  }

  finishCurrentFight(won){
    if(this.mode!=='fight'||!this.currentFight||this.currentFight.final)return;
    const fight=this.currentFight;
    this.mode='story';this.battle.phase='story';
    this.root.querySelector('[data-tournament-run]').hidden=true;
    if(!won){
      const lines=fight.story?[
        {speaker:'RRVVFO',speakerClass:'p1',text:'No. Reset the round. I am not leaving the bracket like that.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Tournament retry granted for story progression.',tail:'down'}
      ]:[
        {speaker:fight.name.toUpperCase(),speakerClass:'rival',text:'Need another attempt?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I needed you to stop talking.',tail:'down'}
      ];
      this.showDialogue(lines,()=>this.startFight(fight));
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
      this.showDialogue([
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'Opening round! Rrvvfo versus an entrant whose registration handwriting nobody can read!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'A random person. Perfect.',tail:'down'}
      ],()=>this.startFight({id:'qualifier-fighter',name:'Qualifier Fighter',hp:54,xp:90,kind:'tournament',story,intro:'ROUND ONE'}));
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
      this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();
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
      this.awakeningReadyAt=performance.now()+9000;
      this.setObjective('TRY FIRE AWAKENING','Press hotbar slot 5 before Rrvvfo runs out of strength.');
      this.battle.notice('FIRE AWAKENING READY • PRESS 5',2);
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
    const resisted=this.clash.power>=58;
    this.clash.active=false;
    this.root.querySelector('[data-beam-clash]').hidden=true;
    this.finalPhase='finished';this.mode='story';
    this.battle.root.querySelector('[data-impact-flash]').style.opacity='1';
    setTimeout(()=>{if(this.battle?.root)this.battle.root.querySelector('[data-impact-flash]').style.opacity='0'},140);
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:resisted?'I almost pushed it back...':'My arms will not move...',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'The match is over.',tail:'down'},
      {speaker:'ANNOUNCER',speakerClass:'rival',text:'Plouke wins the tournament!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Who are you?',tail:'down'},
      {speaker:'PLOUKE',speakerClass:'rival',text:'You really did skim the disguise section.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'...No.',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'Plouke was me.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You vanished, entered the tournament, beat Pouki, exhausted me in the final, and called it training?',tail:'down'},
      {speaker:'SAGE',speakerClass:'neutral',text:'You learned more while believing I was absent.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I hate how planned ahead you are.',tail:'down'}
    ],()=>this.commitCompletion());
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
    const oldLevel=this.level;
    this.xp+=amount;
    while(this.level<LEVEL_THRESHOLDS.length&&this.xp>=LEVEL_THRESHOLDS[this.level])this.level++;
    this.progress=saveLostYearProgress({...loadLostYearProgress(),storyLevel:this.level,storyXp:this.xp,chapter2State:this.state});
    this.updateLevelHud();
    if(this.level>oldLevel)this.showLevelUp(source,onDone);
    else onDone?.();
  }

  updateLevelHud(){
    this.root.querySelector('[data-c2-level]').textContent=String(this.level);
    const next=LEVEL_THRESHOLDS[this.level]??LEVEL_THRESHOLDS.at(-1);
    this.root.querySelector('[data-c2-xp]').textContent=this.level>=LEVEL_THRESHOLDS.length?`${this.xp} / MAX`:`${this.xp} / ${next}`;
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
    if(this.battle)this.battle.phase='story';
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    const dialogue=new SonicBattleDialogue({typeSpeed:17,onComplete:()=>{
      document.removeEventListener('keydown',dialogue._onKey);
      dialogue.overlay?.remove();this.dialogue=null;
      if(this.aborted)return;
      if(this.mode==='dialogue'){
        this.mode=previousMode==='dialogue'?'hub':previousMode;
        if(this.battle)this.battle.phase=this.mode==='hub'||this.mode==='fight'||this.mode==='spectator'?'play':'story';
      }
      onComplete?.();
    }});
    this.dialogue=dialogue;dialogue.show(lines);
  }

  onKey(event){
    if(this.aborted||this.root.hidden)return;
    if(this.mode==='hub'&&event.key==='Enter'){
      event.preventDefault();event.stopImmediatePropagation();this.tryInteract();return;
    }
    if(this.mode==='qte'&&['ArrowLeft','ArrowRight','Space'].includes(event.code==='Space'?'Space':event.key)){
      event.preventDefault();event.stopImmediatePropagation();this.acceptQteInput(event.code==='Space'?'Space':event.key);return;
    }
    if(this.mode==='clash'&&(event.code==='Space'||event.key.toLowerCase()==='j'||event.key==='1')){
      event.preventDefault();event.stopImmediatePropagation();this.clashInput();return;
    }
    if(event.key.toLowerCase()==='m'&&['hub','fight'].includes(this.mode)){
      event.preventDefault();event.stopImmediatePropagation();openCombatManual();
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
      const x=-900+((i*173+time*20*(i%2?1:-1))%1700);
      const z=(i%2?860:-870)+Math.sin(time*.5+i)*55;
      r.box({x,y:42,z,sx:25,sy:58,sz:22,color:crowdColors[i%crowdColors.length],alpha:.82});
      r.box({x,y:82,z,sx:23,sy:23,sz:22,color:'#8f5d42',alpha:.85});
    }
  }

  saveChapterState(){
    this.progress=saveLostYearProgress({...loadLostYearProgress(),chapter2State:this.state,storyLevel:this.level,storyXp:this.xp,lastCheckpoint:`rrvvfo-02-${this.state.tournamentStarted?this.state.tournamentStep:'hub'}`});
  }

  commitCompletion(){
    if(this.completed)return;
    this.completed=true;
    this.state.tournamentStep='complete';
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=unique([...(progress.unlocks||[]),'tournamentHub','trainingLevels','chapter2Tournament','chapterSelect','chapter3']);
    saveLostYearProgress({...progress,completedMissions,unlocks,chapter2State:this.state,storyLevel:this.level,storyXp:this.xp,lastCheckpoint:'rrvvfo-02-complete'});
    this.onComplete();
    this.root.querySelector('[data-route-end]').hidden=false;
    this.root.querySelector('[data-end-route]').focus();
  }

  exitToStory(){
    if(this.aborted)return;
    this.aborted=true;
    this.saveChapterState();
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    document.removeEventListener('keydown',this.keyHandler,true);
    if(this.battle?.active)this.battle.stopMatch();
    this.battle?.root?.classList.add('hidden');
    this.root.remove();activeMission=null;this.onExit();
  }
}

export function startRrvvfoMission2(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoMission2(options);
  return activeMission.start();
}

export {RrvvfoMission2};
