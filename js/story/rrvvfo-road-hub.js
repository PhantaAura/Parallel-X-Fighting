import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=27b-living-training-road-20260727-232814';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=27b-living-training-road-20260727-232814';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=27b-living-training-road-20260727-232814';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=27b-living-training-road-20260727-232814';

const MISSION_ID='rrvvfo-road';
const UI_ID='rrvvfoRoadHubUI';
const SOFT_Z_LIMIT=640;
let activeMission=null;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function lerp(a,b,t){return a+(b-a)*t}
function distance(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.z||0)-(b.z||0))}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.hidden=true;
  root.innerHTML=`
    <div class="roadHud">
      <div class="roadObjective">
        <small>RRVVFO ROUTE • CHAPTER 1 • LIVING HUB</small>
        <strong data-road-objective>LEAVE THE TRAINING GROUNDS</strong>
        <span data-road-detail>Follow the tournament road east.</span>
      </div>
      <div class="roadHudActions">
        <button type="button" data-road-manual>COMBAT MANUAL</button>
        <button type="button" data-road-exit>RETURN TO ROUTE</button>
      </div>
    </div>
    <div class="roadAreaTitle" data-road-area hidden><small>THE LOST YEAR</small><strong data-road-area-name>TRAINING GROUNDS</strong></div>
    <div class="roadPrompt" data-road-prompt hidden><strong data-road-prompt-title>INTERACT</strong><span data-road-prompt-detail>PRESS LIGHT / ENTER</span></div>
    <div class="roadChoice" data-road-choice hidden>
      <article>
        <small>NON-STORY ENCOUNTER</small>
        <h2>ROADSIDE CHALLENGER</h2>
        <p>This fighter is optional. Fight normally or attempt the escape sequence.</p>
        <div><button type="button" data-road-fight>FIGHT</button><button type="button" data-road-run>RUN</button></div>
      </article>
    </div>
    <div class="roadQte" data-road-qte hidden>
      <article>
        <small>ESCAPE SEQUENCE</small>
        <h2 data-qte-title>FOLLOW THE INPUTS</h2>
        <div class="qteSequence" data-qte-sequence></div>
        <div class="qteButtons">
          <button type="button" data-qte-input="ArrowLeft">←</button>
          <button type="button" data-qte-input="Space">JUMP</button>
          <button type="button" data-qte-input="ArrowRight">→</button>
        </div>
        <div class="qteTimer"><i data-qte-timer></i></div>
      </article>
    </div>
    <div class="roadComplete" data-road-complete hidden>
      <article>
        <small>CHAPTER 1 COMPLETE</small>
        <h2>ROAD TO THE TOURNAMENT</h2>
        <p>Rrvvfo crossed the living Training Grounds, tested the manual's field pages, and reached the tournament outskirts.</p>
        <div class="roadRewards">
          <span>3D TRAINING GROUNDS UNLOCKED</span>
          <span>FIELD TECHNIQUES UNLOCKED</span>
          <span>FIGHT OR RUN ENCOUNTERS INTRODUCED</span>
        </div>
        <button type="button" data-road-continue>ENTER THE TOURNAMENT GROUNDS</button>
      </article>
    </div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoRoadHub{
  constructor({onComplete=()=>{},onExit=()=>{}}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.objective=this.root.querySelector('[data-road-objective]');
    this.detail=this.root.querySelector('[data-road-detail]');
    this.area=this.root.querySelector('[data-road-area]');
    this.areaName=this.root.querySelector('[data-road-area-name]');
    this.prompt=this.root.querySelector('[data-road-prompt]');
    this.promptTitle=this.root.querySelector('[data-road-prompt-title]');
    this.promptDetail=this.root.querySelector('[data-road-prompt-detail]');
    this.choice=this.root.querySelector('[data-road-choice]');
    this.qte=this.root.querySelector('[data-road-qte]');
    this.completePanel=this.root.querySelector('[data-road-complete]');
    this.mode='opening';
    this.step='leave-training';
    this.completed=false;
    this.aborted=false;
    this.dialogue=null;
    this.areaTimer=0;
    this.manualPending=false;
    this.interactHeld=false;
    this.bridgeCrossed=false;
    this.gateOpen=false;
    this.lensRevealed=false;
    this.encounterResolved=false;
    this.fighterVisible=true;
    this.noticeCooldown=0;
    this.qteSequence=[];
    this.qteIndex=0;
    this.qteDeadline=0;
    this.qteGamepadState={};
    this.npcs=[
      {x:-900,z:300,baseX:-900,baseZ:300,color:'#4b8ee8',phase:0,label:'DOJO STUDENT'},
      {x:-520,z:-300,baseX:-520,baseZ:-300,color:'#e36b48',phase:1.7,label:'TRAVELER'},
      {x:410,z:310,baseX:410,baseZ:310,color:'#6eaa58',phase:3.1,label:'WORKER'},
      {x:1130,z:260,baseX:1130,baseZ:260,color:'#8a63ce',phase:4.6,label:'VENDOR'}
    ];
    this.root.querySelector('[data-road-manual]').addEventListener('click',()=>this.openManualFromHub());
    this.root.querySelector('[data-road-exit]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-road-fight]').addEventListener('click',()=>this.startRoadFight());
    this.root.querySelector('[data-road-run]').addEventListener('click',()=>this.startRunQte());
    this.root.querySelectorAll('[data-qte-input]').forEach(button=>button.addEventListener('click',()=>this.acceptQteInput(button.dataset.qteInput)));
    this.root.querySelector('[data-road-continue]').addEventListener('click',()=>this.exitToStory());
    this.keyHandler=event=>this.onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  start(){
    resetArenaBattleInstance();
    this.battle=new ArenaBattle('training-road');
    const sage=this.battle.fighters[1];
    sage.id='sage';
    sage.name='The Sage';
    sage.accent='#d9e7f3';
    sage.cpu=true;
    sage.appearance='down';
    this.patchBattle();
    this.battle.start();
    this.battle.root.classList.add('storyRoadHub');
    this.battle.root.querySelector('[data-stage-name]').textContent='TRAINING GROUNDS • TOURNAMENT ROAD';
    this.battle.root.querySelector('.badge strong').textContent='PROTOTYPE 2.7B • LIVING CHAPTER ROAD';
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' MARIO & LUIGI-STYLE FIELD PROGRESSION';
    this.battle.phase='story';
    this.battle.time=9999;
    this.battle.hideBanner();
    this.root.hidden=false;
    this.showAreaTitle('TRAINING GROUNDS');
    this.showOpeningDialogue();
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
    const defaultExit=battle.exit.bind(battle);

    battle.input=()=>{
      const command=baseInput();
      const interact=Boolean(command.light);
      if(this.mode==='hub'){
        if(interact&&!this.interactHeld)this.tryInteract();
        this.interactHeld=interact;
        return{...command,light:false,heavy:false,launcher:false,block:false,special:false};
      }
      this.interactHeld=interact;
      if(this.mode==='fight')return command;
      return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false};
    };

    battle.cpu=(fighter,foe,dt)=>{
      if(this.mode==='fight'){
        const command=baseCpu(fighter,foe,dt);
        return{...command,special:false};
      }
      return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,special:false};
    };

    battle.castAbility=slot=>{
      if(this.mode==='fight')return baseCast(slot);
      if(this.mode!=='hub')return false;
      return this.castFieldAbility(slot);
    };

    battle.updateCamera=()=>this.updateCamera();

    battle.applyDamage=(attacker,target,damage,meta={})=>{
      const connected=baseApplyDamage(attacker,target,damage,meta);
      if(!connected||this.mode!=='fight')return connected;
      if(target===battle.fighters[1]&&target.hp<=0){
        target.hp=1;
        queueMicrotask(()=>this.finishRoadFight(true));
      }else if(target===battle.fighters[0]&&target.hp<=0){
        target.hp=1;
        queueMicrotask(()=>this.restartRoadFight());
      }
      return connected;
    };

    battle.drawFighterLayer=fighters=>{
      const visible=this.mode==='fight'?fighters:fighters.filter(fighter=>fighter===battle.fighters[0]||this.fighterVisible);
      baseDrawFighterLayer(visible);
    };

    battle.draw=()=>{
      baseDraw();
      this.drawHubExtras();
    };

    battle.update=dt=>{
      const player=battle.fighters[0];
      const previous={x:player.x,z:player.z};
      baseUpdate(dt);
      if(!battle.active||this.aborted)return;
      this.noticeCooldown=Math.max(0,this.noticeCooldown-dt);
      this.areaTimer=Math.max(0,this.areaTimer-dt);
      if(!this.areaTimer)this.area.hidden=true;
      if(this.mode==='hub'){
        player.hp=100;
        player.en=100;
        battle.time=9999;
        this.updateHub(dt,previous);
      }else if(this.mode==='fight'){
        battle.time=9999;
        battle.fighters[1].en=Math.min(battle.fighters[1].en,45);
      }else if(this.mode==='qte'){
        this.updateQte();
      }
      this.updateNpcMotion(dt);
    };

    battle.exit=()=>{
      defaultExit();
      this.cleanup();
      this.onExit();
    };
  }

  showOpeningDialogue(){
    this.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'The tournament is east. I marked the road, placed a few training checks, and wrote the useful parts into the manual.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You are not coming with me?',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I have important training.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You mean sleeping somewhere closer to the tournament than I am.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Excellent. Your deductive reasoning survived the year.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'And you still personally taught me Shots of Agony, so I guess you did one useful thing.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'One? Read the manual this time.',tail:'down'}
    ],()=>{
      this.fighterVisible=false;
      this.hideSecondFighter();
      this.mode='hub';
      this.battle.phase='play';
      this.setObjective('LEAVE THE TRAINING GROUNDS','Follow the tan road east toward the tournament banners.');
      this.battle.notice('MOVE EAST • LIGHT / ENTER TO INTERACT',2);
    });
  }

  showDialogue(lines,onComplete){
    this.mode='dialogue';
    this.battle.phase='story';
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    const dialogue=new SonicBattleDialogue({typeSpeed:18,onComplete:()=>{
      document.removeEventListener('keydown',dialogue._onKey);
      dialogue.overlay?.remove();
      this.dialogue=null;
      onComplete?.();
    }});
    this.dialogue=dialogue;
    dialogue.show(lines);
    if(dialogue.overlay)dialogue.overlay.style.zIndex='2300';
  }

  updateCamera(){
    const player=this.battle.fighters[0];
    const foe=this.battle.fighters[1];
    const c=this.battle.stage.camera;
    let focusX=player.x,focusZ=player.z,distanceTarget=1010;
    if(this.mode==='fight'){
      focusX=(player.x+foe.x)/2;
      focusZ=(player.z+foe.z)/2;
      distanceTarget=clamp(930+Math.hypot(player.x-foe.x,player.z-foe.z)*.36,930,1180);
    }
    this.battle.camera.x=lerp(this.battle.camera.x,focusX,.085);
    this.battle.camera.z=lerp(this.battle.camera.z,focusZ,.085);
    this.battle.camera.distance=lerp(this.battle.camera.distance,distanceTarget,.065);
    const yaw=c.yawDeg*Math.PI/180;
    const horizontal=this.battle.camera.distance*c.horizontalDistanceScale;
    this.battle.camera.eye=[
      this.battle.camera.x+Math.sin(yaw)*horizontal,
      c.heightBase+this.battle.camera.distance*c.heightDistanceScale,
      this.battle.camera.z+Math.cos(yaw)*horizontal
    ];
    this.battle.camera.target=[this.battle.camera.x,c.targetHeight+player.y*c.jumpTargetScale,this.battle.camera.z];
    this.battle.cameraShake*=.86;
    if(this.battle.cameraShake<.15)this.battle.cameraShake=0;
  }

  updateHub(dt,previous){
    const player=this.battle.fighters[0];
    if(Math.abs(player.z)>SOFT_Z_LIMIT){
      player.z=clamp(player.z,-SOFT_Z_LIMIT,SOFT_Z_LIMIT);
      player.moveVZ=0;
      if(!this.noticeCooldown){
        this.noticeCooldown=1.5;
        this.battle.notice('THE ROAD IS THROUGH THE TREES, NOT INTO THEM',1.2);
      }
    }

    const blockers=[];
    blockers.push({id:'dojo',minX:-1395,maxX:-940,minZ:-405,maxZ:-125});
    if(!this.bridgeCrossed)blockers.push({id:'river',minX:-15,maxX:165,minZ:-700,maxZ:700});
    if(!this.gateOpen)blockers.push({id:'gate',minX:555,maxX:645,minZ:-660,maxZ:660});
    if(!this.lensRevealed)blockers.push({id:'lens',minX:1045,maxX:1120,minZ:-660,maxZ:660});
    for(const rect of blockers){
      if(player.x>rect.minX&&player.x<rect.maxX&&player.z>rect.minZ&&player.z<rect.maxZ){
        player.x=previous.x;
        player.z=previous.z;
        player.moveVX=0;
        player.moveVZ=0;
      }
    }

    this.updateStoryTriggers(player);
    this.updatePrompt(player);
  }

  updateStoryTriggers(player){
    if(this.step==='leave-training'&&player.x>-850){
      this.step='bridge';
      this.showAreaTitle('FOREST ROAD');
      this.pauseForManual('hub-exploration',()=>{
        this.setObjective('CROSS THE BROKEN RIVER','Reach the river and use Object Swap when the manual opens.');
      });
      return;
    }
    if(this.step==='bridge'&&player.x>-150&&!this.manualPending){
      this.step='bridge-ready';
      this.showAreaTitle('BROKEN CROSSING');
      this.pauseForManual('field-object-swap',()=>{
        this.setObjective('OBJECT SWAP ACROSS','Stand near the river and press hotbar slot 3.');
      });
      return;
    }
    if(this.step==='gate'&&player.x>405&&!this.manualPending){
      this.step='gate-ready';
      this.pauseForManual('field-shots',()=>{
        this.setObjective('OPEN THE MULTI-TARGET GATE','Press hotbar slot 2 to strike all four gate targets together.');
      });
      return;
    }
    if(this.step==='encounter'&&player.x>760&&!this.encounterResolved&&!this.manualPending){
      this.step='encounter-ready';
      this.pauseForManual('run-encounters',()=>this.beginEncounter());
      return;
    }
    if(this.step==='lens'&&player.x>980&&!this.manualPending){
      this.step='lens-ready';
      this.showAreaTitle('TOURNAMENT OUTSKIRTS');
      this.pauseForManual('lens-secrets',()=>{
        this.setObjective('CHECK THE SUSPICIOUS ROADBLOCK','Press hotbar slot 4 to reveal the real route.');
      },['Why would he hide the page explaining how to find hidden things?']);
      return;
    }
    if(this.step==='finish'&&player.x>1280){
      this.commitCompletion();
    }
  }

  updatePrompt(player){
    let visible=false,title='',detail='';
    if(this.step==='bridge-ready'&&player.x>-150&&player.x<10){
      visible=true;title='BROKEN CROSSING';detail='PRESS 3 • OBJECT SWAP';
    }else if(this.step==='gate-ready'&&player.x>410&&player.x<555){
      visible=true;title='FOUR TARGETS';detail='PRESS 2 • SHOTS OF AGONY';
    }else if(this.step==='lens-ready'&&player.x>920&&player.x<1045){
      visible=true;title='SUSPICIOUS ROADBLOCK';detail='PRESS 4 • LENS OF TRUTH';
    }else{
      const nearby=this.npcs.find(npc=>distance(player,npc)<115);
      if(nearby){visible=true;title=nearby.label;detail='PRESS LIGHT / ENTER';}
    }
    this.prompt.hidden=!visible;
    if(visible){this.promptTitle.textContent=title;this.promptDetail.textContent=detail;}
  }

  tryInteract(){
    if(this.mode!=='hub')return;
    const player=this.battle.fighters[0];
    const nearby=this.npcs.find(npc=>distance(player,npc)<115);
    if(!nearby)return;
    const lines={
      'DOJO STUDENT':[
        {speaker:'DOJO STUDENT',speakerClass:'neutral',text:'The Sage said this entire road is a lesson.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That sounds like something he made up after building it badly.',tail:'down'}
      ],
      'TRAVELER':[
        {speaker:'TRAVELER',speakerClass:'neutral',text:'Everybody is heading to the tournament. The decorations look suspiciously familiar.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Good. I was worried I was the only one seeing it.',tail:'down'}
      ],
      'WORKER':[
        {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Please do not destroy the gate. It is mostly paint and confidence.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'That is not reassuring.',tail:'down'}
      ],
      'VENDOR':[
        {speaker:'VENDOR',speakerClass:'neutral',text:'Tournament snacks. Twice the price, half the ingredients.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'At least the business model is honest.',tail:'down'}
      ]
    }[nearby.label]||[];
    if(lines.length)this.showDialogue(lines,()=>{this.mode='hub';this.battle.phase='play'});
  }

  castFieldAbility(slot){
    const player=this.battle.fighters[0];
    if(slot===3&&this.step==='bridge-ready'&&player.x>-180&&player.x<25){
      this.bridgeCrossed=true;
      player.x=225;
      player.z=clamp(player.z,-220,220);
      player.visualAction='objectSwapDisappear';
      player.visualActionTime=.45;
      this.battle.burst(-20,player.z,'#ffd079',20,55);
      this.battle.burst(player.x,player.z,'#ffd079',20,55);
      this.battle.notice('FIELD OBJECT SWAP',1.4);
      this.step='gate';
      this.setObjective('REACH THE TOURNAMENT GATE','Continue east. The next check uses Shots of Agony.');
      saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-bridge'});
      return true;
    }
    if(slot===2&&this.step==='gate-ready'&&player.x>380&&player.x<570){
      player.visualAction='shotsSummon';
      player.visualActionTime=.75;
      this.battle.notice('FOUR FIELD TARGETS LOCKED',1.4);
      this.mode='transition';
      this.battle.phase='story';
      setTimeout(()=>{
        if(this.aborted)return;
        this.gateOpen=true;
        this.mode='hub';
        this.battle.phase='play';
        this.step='encounter';
        this.setObjective('FOLLOW THE ROAD EAST','A roaming fighter is practicing near the next clearing.');
        saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-gate'});
      },700);
      return true;
    }
    if(slot===4&&this.step==='lens-ready'&&player.x>900&&player.x<1060){
      player.hp=Math.max(1,player.hp-1);
      player.visualAction='lensActivate';
      player.visualActionTime=.55;
      this.lensRevealed=true;
      this.step='finish';
      this.battle.burst(1080,0,'#d4fbff',30,72);
      this.battle.notice('LENS OF TRUTH • REAL PATH REVEALED',1.8);
      this.setObjective('REACH THE TOURNAMENT ENTRANCE','The stadium is directly ahead.');
      saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-lens'});
      return true;
    }
    const labels={1:'NO FIELD TARGET FOR FIRE BLAST',2:'NO MULTI-TARGET SWITCH HERE',3:'NO SWAP POINT HERE',4:'NOTHING HIDDEN HERE',5:'ULTIMATES ARE DISABLED IN HUBS'};
    this.battle.notice(labels[slot]||'FIELD TECHNIQUE UNAVAILABLE',1.1);
    return false;
  }

  pauseForManual(pageId,onClose,reactionLines=null){
    this.manualPending=true;
    this.mode='manual';
    this.battle.phase='story';
    discoverCombatManualPage(pageId,{reactionLines,onClose:()=>{
      this.manualPending=false;
      if(this.aborted)return;
      this.mode='hub';
      this.battle.phase='play';
      onClose?.();
    }});
  }

  beginEncounter(){
    this.mode='choice';
    this.battle.phase='story';
    this.choice.hidden=false;
    this.choice.querySelector('[data-road-fight]').focus();
  }

  startRunQte(){
    this.choice.hidden=true;
    this.mode='qte';
    this.battle.phase='story';
    this.qteSequence=['ArrowLeft','Space','ArrowRight'];
    this.qteIndex=0;
    this.qteDeadline=performance.now()+3600;
    this.qte.hidden=false;
    this.renderQte();
  }

  renderQte(){
    const labels={ArrowLeft:'←',ArrowRight:'→',Space:'JUMP'};
    this.root.querySelector('[data-qte-sequence]').innerHTML=this.qteSequence.map((key,index)=>`<span class="${index<this.qteIndex?'done':index===this.qteIndex?'current':''}">${labels[key]}</span>`).join('');
  }

  acceptQteInput(key){
    if(this.mode!=='qte')return;
    if(key===this.qteSequence[this.qteIndex]){
      this.qteIndex++;
      this.renderQte();
      if(this.qteIndex>=this.qteSequence.length)this.finishRunQte(true);
    }else this.finishRunQte(false);
  }

  updateQte(){
    const remaining=clamp((this.qteDeadline-performance.now())/3600,0,1);
    this.root.querySelector('[data-qte-timer]').style.width=`${remaining*100}%`;
    if(remaining<=0){this.finishRunQte(false);return}
    const pads=navigator.getGamepads?.()||[];
    for(const pad of pads){
      if(!pad)continue;
      const left=(pad.buttons[14]?.pressed||pad.axes[0]<-.55);
      const right=(pad.buttons[15]?.pressed||pad.axes[0]>.55);
      const jump=pad.buttons[0]?.pressed;
      for(const [key,pressed] of [['ArrowLeft',left],['ArrowRight',right],['Space',jump]]){
        const previous=this.qteGamepadState[key];
        this.qteGamepadState[key]=pressed;
        if(pressed&&!previous){this.acceptQteInput(key);return}
      }
    }
  }

  finishRunQte(success){
    if(this.mode!=='qte')return;
    this.qte.hidden=true;
    this.qteGamepadState={};
    if(success){
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'I am not running away. I am refusing to waste time.',tail:'down'},
        {speaker:'ROADSIDE FIGHTER',speakerClass:'rival',text:'That was definitely running.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You saw nothing.',tail:'down'}
      ],()=>this.resolveEncounter('escaped'));
    }else{
      this.battle.notice('ESCAPE FAILED • FIGHT FORCED',1.6);
      this.startRoadFight();
    }
  }

  startRoadFight(){
    this.choice.hidden=true;
    this.qte.hidden=true;
    const player=this.battle.fighters[0];
    const foe=this.battle.fighters[1];
    this.mode='fight';
    this.fighterVisible=true;
    this.battle.root.classList.add('storyRoadFight');
    player.reset(790,70);
    player.hp=100;
    player.en=100;
    foe.id='road-fighter';
    foe.name='Roadside Fighter';
    foe.accent='#7f6cff';
    foe.asset=null;
    foe.reset(940,-70);
    foe.hp=38;
    foe.en=45;
    this.battle.phase='play';
    this.battle.time=9999;
    this.battle.hideBanner();
    this.setObjective('OPTIONAL ROAD FIGHT','Defeat the roadside fighter to continue.');
    this.battle.notice('ROAD FIGHT • RUN IS NO LONGER AVAILABLE',1.8);
  }

  restartRoadFight(){
    if(this.mode!=='fight'||this.aborted)return;
    const player=this.battle.fighters[0];
    const foe=this.battle.fighters[1];
    player.reset(790,70);
    player.hp=100;
    player.en=100;
    foe.reset(940,-70);
    foe.hp=38;
    foe.en=45;
    this.battle.phase='play';
    this.battle.notice('TRY AGAIN',1.2);
  }

  finishRoadFight(won){
    if(this.mode!=='fight'||this.aborted)return;
    this.battle.root.classList.remove('storyRoadFight');
    this.showDialogue([
      {speaker:'ROADSIDE FIGHTER',speakerClass:'rival',text:'Fine. You are tournament-ready.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I knew that before you delayed me.',tail:'down'}
    ],()=>this.resolveEncounter(won?'won':'escaped'));
  }

  resolveEncounter(result){
    this.encounterResolved=true;
    this.mode='hub';
    this.battle.phase='play';
    this.fighterVisible=false;
    this.hideSecondFighter();
    const player=this.battle.fighters[0];
    player.x=850;
    player.z=20;
    player.hp=100;
    player.en=100;
    this.step='lens';
    this.setObjective('CONTINUE TO THE OUTSKIRTS','The final manual check is near the stadium roadblock.');
    saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-encounter',roadEncounterResult:result});
  }

  hideSecondFighter(){
    const foe=this.battle.fighters[1];
    foe.y=-1200;
    foe.x=this.battle.fighters[0].x-120;
    foe.z=this.battle.fighters[0].z-120;
    foe.hp=100;
    foe.attackState=null;
  }

  updateNpcMotion(){
    const time=performance.now()/1000;
    for(const npc of this.npcs){
      npc.x=npc.baseX+Math.sin(time*.55+npc.phase)*45;
      npc.z=npc.baseZ+Math.cos(time*.48+npc.phase)*24;
    }
  }

  drawHubExtras(){
    if(!this.battle?.renderer||this.aborted)return;
    const r=this.battle.renderer;
    const time=performance.now()/1000;
    const drawPerson=(npc,index)=>{
      const bob=Math.sin(time*2+npc.phase)*2;
      r.disc({x:npc.x,y:5,z:npc.z,rx:25,rz:16,color:'#000000',alpha:.25});
      r.box({x:npc.x,y:48+bob,z:npc.z,sx:30,sy:62,sz:24,color:npc.color});
      r.box({x:npc.x,y:92+bob,z:npc.z,sx:28,sy:28,sz:26,color:'#9b6848'});
      r.box({x:npc.x,y:111+bob,z:npc.z,sx:33,sy:15,sz:30,color:index%2?'#33211c':'#d5b04d'});
    };
    this.npcs.forEach(drawPerson);

    const objective=this.objectivePoint();
    if(objective){
      const pulse=1+Math.sin(time*4)*.09;
      r.disc({x:objective.x,y:7,z:objective.z,rx:40*pulse,rz:28*pulse,color:'#ffd557',alpha:.28});
      r.billboard({x:objective.x,y:145,z:objective.z,size:34*pulse,color:'#fff1a3',alpha:.88});
    }

    if(!this.bridgeCrossed){
      r.segment({x:-5,y:19,z:-135},{x:155,y:19,z:-135},{width:14,height:14,color:'#6f4e2f',alpha:.95});
      r.segment({x:-5,y:19,z:135},{x:155,y:19,z:135},{width:14,height:14,color:'#6f4e2f',alpha:.95});
      for(const z of [-105,-55,-5,45,95])r.box({x:20,y:18,z,sx:80,sy:10,sz:34,color:'#7b5a37',rotationY:.03});
    }

    if(!this.gateOpen){
      for(const z of [-96,-32,32,96]){
        const glow=.65+Math.sin(time*5+z)*.2;
        r.billboard({x:548,y:82,z,size:38,color:'#73e9ff',alpha:glow});
        r.disc({x:548,y:6,z,rx:22,rz:15,color:'#73e9ff',alpha:.2});
      }
      r.segment({x:598,y:70,z:-125},{x:598,y:70,z:125},{width:18,height:18,color:'#d84c56',alpha:.95});
    }

    if(!this.lensRevealed){
      r.segment({x:1075,y:28,z:-125},{x:1075,y:28,z:125},{width:42,height:38,color:'#4d713e',alpha:.98});
      r.box({x:1018,y:68,z:0,sx:18,sy:95,sz:18,color:'#6a492f'});
      r.box({x:1018,y:120,z:0,sx:15,sy:55,sz:120,color:'#c84a43'});
    }
  }

  objectivePoint(){
    const table={
      'leave-training':{x:-780,z:40},
      bridge:{x:-95,z:20},
      'bridge-ready':{x:-75,z:20},
      gate:{x:430,z:0},
      'gate-ready':{x:500,z:0},
      encounter:{x:780,z:0},
      'encounter-ready':{x:800,z:0},
      lens:{x:990,z:0},
      'lens-ready':{x:1000,z:0},
      finish:{x:1320,z:-10}
    };
    return table[this.step]||null;
  }

  showAreaTitle(name){
    this.areaName.textContent=name;
    this.area.hidden=false;
    this.areaTimer=2.4;
  }

  setObjective(title,detail){
    this.objective.textContent=title;
    this.detail.textContent=detail;
  }

  onKey(event){
    if(this.root.hidden)return;
    if(this.mode==='qte'){
      const key=event.code==='Space'?'Space':event.key;
      if(['ArrowLeft','ArrowRight','Space'].includes(key)){
        event.preventDefault();
        event.stopImmediatePropagation();
        this.acceptQteInput(key);
      }
      return;
    }
    if(this.mode==='hub'&&(event.key==='Enter'||event.key.toLowerCase()==='e')){
      event.preventDefault();
      this.tryInteract();
    }
    if(event.key.toLowerCase()==='m'&&this.mode==='hub'){
      event.preventDefault();
      this.openManualFromHub();
    }
  }


  openManualFromHub(){
    if(this.mode!=='hub')return;
    this.mode='manual';
    this.battle.phase='story';
    const opened=openCombatManual({onClose:()=>{
      if(this.aborted)return;
      this.mode='hub';
      this.battle.phase='play';
    }});
    if(!opened){
      this.mode='hub';
      this.battle.phase='play';
    }
  }

  commitCompletion(){
    if(this.completed||this.aborted)return;
    this.completed=true;
    this.mode='complete';
    this.battle.phase='story';
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=[...new Set([...(progress.unlocks||[]),'trainingGroundsHub','tournamentRoad','fieldObjectSwap','fieldShotsOfAgony','runEncounters','fieldLensOfTruth'])];
    saveLostYearProgress({...progress,completedMissions,unlocks,lastCheckpoint:MISSION_ID});
    this.onComplete();
    this.completePanel.hidden=false;
    this.completePanel.querySelector('[data-road-continue]').focus();
  }

  exitToStory(){
    this.battle?.stopMatch();
    this.battle?.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    if(this.aborted)return;
    this.aborted=true;
    document.removeEventListener('keydown',this.keyHandler,true);
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    resetArenaBattleInstance();
    this.root.remove();
    this.battle?.root.classList.remove('storyRoadHub','storyRoadFight');
    activeMission=null;
  }
}

export function startRrvvfoRoadHub(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoRoadHub(options);
  return activeMission.start();
}

export {RrvvfoRoadHub};
