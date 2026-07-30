import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a24p4-validation-sync-20260730';
import {sharedInput} from '../input-runtime.js?v=29a24p4-validation-sync-20260730';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a24p4-validation-sync-20260730';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=29a24p4-validation-sync-20260730';
import {StoryMap} from './story-map.js?v=29a24p4-validation-sync-20260730';
import {storyConfirm} from './story-ux.js?v=29a24p4-validation-sync-20260730';
import {applyStoryLevelToFighter,applyStoryProgressionToFighter,storyLevelFromProgress} from './story-progression.js?v=29a24p4-validation-sync-20260730';
import {storyAttackStripMarkup,storyControlLegendMarkup} from './story-rpg-ui.js?v=29a24p4-validation-sync-20260730';
import {snapHubCamera,updateHubCamera} from './hub-camera.js?v=29a24p4-validation-sync-20260730';
import {drawRoadLandmarks} from './hub-landmark-art.js?v=29a24p4-validation-sync-20260730';

const MISSION_ID='rrvvfo-road';
const UI_ID='rrvvfoRoadHubUI';
const SOFT_Z_LIMIT=640;
let activeMission=null;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
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
        <button type="button" data-road-menu>STORY MENU</button>
        <button type="button" data-road-manual>SAGE MANUAL</button>
        <button type="button" data-road-exit>RETURN TO STORY</button>
      </div>
    </div>
    ${storyAttackStripMarkup({compact:true})}
    <div class="roadAreaTitle" data-road-area hidden><small>THE LOST YEAR</small><strong data-road-area-name>TRAINING GROUNDS</strong></div>
    <div class="roadPrompt" data-road-prompt hidden><strong data-road-prompt-title>INTERACT</strong><span data-road-prompt-detail>PRESS INTERACT</span></div>
    <div class="roadChoice" data-road-choice hidden>
      <article>
        <small>NON-STORY ENCOUNTER</small>
        <h2>ROADSIDE CHALLENGER</h2>
        <p>This fighter is optional. Beat him for the spectator pass or leave before the fight begins.</p>
        <div><button type="button" data-road-fight>FIGHT HIM</button><button type="button" data-road-run>LEAVE</button></div>
      </article>
    </div>
    <div class="roadQte" data-road-qte hidden>
      <article>
        <small>ESCAPE SEQUENCE</small>
        <h2 data-qte-title>FOLLOW THE INPUTS</h2>
        <div class="qteSequence" data-qte-sequence></div>
        <div class="qteButtons">
          <button type="button" data-qte-input="KeyA">←</button>
          <button type="button" data-qte-input="Space">JUMP</button>
          <button type="button" data-qte-input="KeyD">→</button>
        </div>
        <div class="qteTimer"><i data-qte-timer></i></div>
      </article>
    </div>
    <div class="roadPause storyRpgPause" data-road-pause hidden>
      <article><header><small>RRVVFO • CHAPTER 1</small><h2>STORY MENU</h2></header>
        <p data-road-pause-objective>Follow the Tournament Road.</p>
        ${storyControlLegendMarkup()}
        <div><button class="primary" type="button" data-road-resume>RETURN TO GAME</button><button type="button" data-road-pause-manual>SAGE MANUAL</button><button type="button" data-road-pause-map>AREA MAP</button><button type="button" data-road-pause-exit>RETURN TO STORY MENU</button></div>
      </article>
    </div>
    <div class="roadDefeat storyRpgPause" data-road-defeat hidden>
      <article><header><small>OPTIONAL ENCOUNTER</small><h2>CHOOSE WHAT HAPPENS NEXT</h2></header><p>The roadside fight is optional. Losing does not trap you here.</p><div><button class="primary" type="button" data-road-rematch>TRY AGAIN</button><button type="button" data-road-leave-fight>LEAVE ENCOUNTER</button><button type="button" data-road-defeat-exit>RETURN TO STORY MENU</button></div></article>
    </div>
    <div class="roadComplete" data-road-complete hidden>
      <article>
        <small>CHAPTER 1 COMPLETE</small>
        <h2>ROAD TO THE TOURNAMENT</h2>
        <p>Rrvvfo completed the dojo warm-up, crossed the river by swapping with a real rock, cleared the road, and reached the tournament outskirts.</p>
        <div class="roadRewards">
          <span>3D TRAINING GROUNDS UNLOCKED</span>
          <span>PHYSICAL OBJECT SWAP ROUTE CLEARED</span>
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
    this.pausePanel=this.root.querySelector('[data-road-pause]');
    this.defeatPanel=this.root.querySelector('[data-road-defeat]');
    this.mode='opening';
    this.step='warmup';
    this.completed=false;
    this.aborted=false;
    this.dialogue=null;
    this.areaTimer=0;
    this.manualPending=false;
    this.interactHeld=false;
    this.bridgeCrossed=false;
    this.swapRock={x:230,z:0};
    this.roadCleared=false;
    this.gateOpen=false;
    this.lensRevealed=false;
    this.encounterResolved=false;
    this.lostCompetitorDecision=null;
    this.fighterVisible=true;
    this.noticeCooldown=0;
    this.playerFlip=false;
    this.finishDialogueShown=false;
    this.checkpointDialogueShown=false;
    this.warmupMarkers=[
      {x:-1260,z:250,label:'MOVE FLAG',requirement:'move',done:false},
      {x:-980,z:330,label:'JUMP FLAG',requirement:'jump',done:false},
      {x:-875,z:-240,label:'DASH FLAG',requirement:'dash',done:false}
    ];
    this.lastCommand={};this.runAttempts=0;
    this.qteSequence=[];
    this.qteIndex=0;
    this.qteDeadline=0;
    this.qteGamepadState={};
    this.roadPlayerKOs=0;this.roadFoeKOs=0;this.roadKoLocked=false;this.roadKoTimer=0;
    this.npcs=[
      {x:-900,z:300,baseX:-900,baseZ:300,color:'#4b8ee8',phase:0,label:'DOJO STUDENT'},
      {x:-520,z:-300,baseX:-520,baseZ:-300,color:'#e36b48',phase:1.7,label:'TRAVELER'},
      {x:365,z:300,baseX:365,baseZ:300,color:'#6eaa58',phase:3.1,label:'ROAD WORKER'},
      {x:730,z:-285,baseX:730,baseZ:-285,color:'#d48845',phase:4.1,label:'LOST COMPETITOR'},
      {x:940,z:285,baseX:940,baseZ:285,color:'#4fa3a8',phase:5.2,label:'TOURNAMENT FAN'},
      {x:1130,z:260,baseX:1130,baseZ:260,color:'#8a63ce',phase:4.6,label:'VENDOR'},
      {x:1225,z:-300,baseX:1225,baseZ:-300,color:'#c75f79',phase:2.4,label:'SIGN PAINTER'}
    ];
    this.root.querySelector('[data-road-menu]').addEventListener('click',()=>this.openPauseMenu());
    this.root.querySelector('[data-road-manual]').addEventListener('click',()=>this.openManualFromHub());
    this.root.querySelector('[data-road-resume]').addEventListener('click',()=>this.closePauseMenu());
    this.root.querySelector('[data-road-pause-manual]').addEventListener('click',()=>{this.closePauseMenu();this.openManualFromHub()});
    this.root.querySelector('[data-road-pause-map]').addEventListener('click',()=>{this.closePauseMenu();this.map?.open()});
    this.root.querySelector('[data-road-pause-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-road-rematch]').addEventListener('click',()=>{this.defeatPanel.hidden=true;this.restartRoadFight()});
    this.root.querySelector('[data-road-leave-fight]').addEventListener('click',()=>{this.defeatPanel.hidden=true;this.resolveEncounter('left-after-loss')});
    this.root.querySelector('[data-road-defeat-exit]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-road-exit]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-road-fight]').addEventListener('click',()=>this.startRoadFight());
    this.root.querySelector('[data-road-run]').addEventListener('click',()=>this.leaveRoadsideChallenge());
    this.root.querySelectorAll('[data-qte-input]').forEach(button=>button.addEventListener('click',()=>this.acceptQteInput(button.dataset.qteInput)));
    this.root.querySelector('[data-road-continue]').addEventListener('click',()=>this.exitToStory());
    this.keyHandler=event=>this.onKey(event);
    document.addEventListener('keydown',this.keyHandler,true);
  }

  start(){
    document.dispatchEvent(new CustomEvent('pxmusictheme',{detail:'road'}));
    this.battle=createStoryBattle({stageId:'training-road',opponent:{id:'sage',name:'The Sage',accent:'#d9e7f3',cpu:true,appearance:'down'}});
    this.engine=attachStoryEngine(this.battle,{
      chapterLabel:'RRVVFO CHAPTER 1 ROAD',
      stageName:'TRAINING GROUNDS • TOURNAMENT ROAD',
      rootClasses:['storyRoadHub'],
      getMode:()=>this.engine?.dialogue?'dialogue':this.mode
    });
    this.patchBattle();
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','THE SAGE']});
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART ROAD?',message:'Restart the current Tournament Road section? Completed checkpoints remain saved.',confirmLabel:'RESTART'});
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' CHAPTER 1 • TOURNAMENT ROAD';
    this.map=new StoryMap({
      title:'TOURNAMENT ROAD MAP',
      bounds:{minX:-1550,maxX:1450,minZ:-720,maxZ:720},
      getPlayer:()=>this.battle?.fighters?.[0]||null,
      getObjective:()=>{const point=this.objectivePoint();return point?{...point,label:this.objective?.textContent||'CURRENT OBJECTIVE'}:null},
      getPoints:()=>[
        {x:-1160,z:-240,label:'TRAINING GROUNDS',color:'#d9232f'},
        {x:80,z:0,label:'BROKEN RIVER',color:'#5ba9dc'},
        {x:590,z:0,label:'TARGET GATE',color:'#6b58be'},
        {x:1320,z:0,label:'TOURNAMENT',color:'#d9a629'}
      ]
    });
    this.battle.phase='story';
    this.battle.time=9999;
    this.battle.hideBanner();
    snapHubCamera(this.battle,this.battle.fighters[0],{distance:1010});
    this.root.hidden=false;
    this.showAreaTitle('TRAINING GROUNDS');
    this.showOpeningDialogue();
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    this.engine.useChapterProfile({
      input:next=>{
        const command=next();this.lastCommand=command;
        const interact=Boolean(command.interact);
        if(this.mode==='hub'){
          if(interact&&!this.interactHeld)this.tryInteract();
          this.interactHeld=interact;
          return this.engine.commandForMode(command,'exploration',{allowJump:true,allowDash:true,allowInteract:true});
        }
        this.interactHeld=interact;
        return this.engine.commandForMode(command,this.mode==='fight'?'combat':'cinematic');
      },
      cpu:(next,fighter,foe,dt)=>{
        if(this.mode==='fight')return{...next(fighter,foe,dt),special:false};
        return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,special:false};
      },
      castAbility:(next,slot)=>{
        if(this.mode==='fight')return next(slot);
        if(this.mode!=='hub')return false;
        return this.castFieldAbility(slot);
      },
      updateCamera:()=>this.updateCamera(),
      applyDamage:(next,attacker,target,damage,meta={})=>{
        const connected=next(attacker,target,damage,meta);
        if(!connected||this.mode!=='fight')return connected;
        if(target===battle.fighters[1]&&target.hp<=0){target.hp=1;queueMicrotask(()=>this.handleRoadFightKo(true))}
        else if(target===battle.fighters[0]&&target.hp<=0){target.hp=1;queueMicrotask(()=>this.handleRoadFightKo(false))}
        return connected;
      },
      flipFor:(next,fighter)=>{
        if(this.mode!=='fight'&&fighter===battle.fighters[0]){
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
      drawFighterLayer:(next,fighters)=>{
        const visible=this.mode==='fight'?fighters:fighters.filter(fighter=>fighter===battle.fighters[0]||this.fighterVisible);
        return next(visible);
      },
      draw:next=>{next();this.drawHubExtras()},
      update:(next,dt)=>{
        const player=battle.fighters[0],previous={x:player.x,z:player.z};
        next(dt);
        if(!battle.active||this.aborted)return;
        this.noticeCooldown=Math.max(0,this.noticeCooldown-dt);
        this.areaTimer=Math.max(0,this.areaTimer-dt);
        if(!this.areaTimer)this.area.hidden=true;
        if(this.mode==='hub'){
          player.hp=Math.max(1,Math.min(player.maxHp,player.hp));battle.time=9999;this.updateHub(dt,previous);
        }else if(this.mode==='fight'){
          battle.time=9999;battle.fighters[1].en=Math.min(battle.fighters[1].en,45);
        }else if(this.mode==='qte')this.updateQte();
        this.updateNpcMotion(dt);this.map?.draw();
      },
      exit:async next=>{
        const leave=await storyConfirm({title:'RETURN TO STORY?',message:'Leave the Tournament Road? Completed checkpoints remain saved.',confirmLabel:'RETURN TO STORY'});
        if(!leave)return;
        next();this.cleanup();this.onExit();
      }
    });
  }

  showOpeningDialogue(){
    this.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'The tournament’s that way. There are a lot of trainers around here. They might’ve left some markers.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I’ve gotta go do some important training. Don’t mind this camera or these binoculars.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Lemme guess. Your ‘important training’ is going to the spa and spying on women, perv.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I’VE HAD IT WITH YOU CALLING ME THAT!',tail:'down'}
    ],()=>{
      this.fighterVisible=false;
      this.hideSecondFighter();
      this.mode='hub';
      this.battle.phase='play';
      this.warmupMarkers.forEach(marker=>{marker.done=true});
      this.step='leave-training';
      this.setObjective('LEAVE THE TRAINING GROUNDS','Follow the tan road east. The old movement flags are optional practice now.');
      this.battle.notice('ROAD OPEN • MOVEMENT PRACTICE IS OPTIONAL',2);
    });
  }

  showDialogue(lines,onComplete){
    this.mode='dialogue';
    this.engine?.setGameplayState('dialogue',{phase:'story'});
    const dialogue=this.engine.showDialogue(lines,{typeSpeed:18,onComplete:()=>{
      this.dialogue=null;
      onComplete?.();
    }});
    this.dialogue=dialogue;
  }

  updateCamera(){
    updateHubCamera(this.battle,{frameFight:this.mode==='fight',allowLook:this.mode==='hub',hubDistance:1010});
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
    if(this.step==='warmup'){
      blockers.push({id:'training-exit-road',minX:-850,maxX:-810,minZ:-185,maxZ:185});
      blockers.push({id:'training-exit-north',minX:-850,maxX:-810,minZ:-660,maxZ:-185});
      blockers.push({id:'training-exit-south',minX:-850,maxX:-810,minZ:185,maxZ:660});
    }
    // The river is always solid. Object Swap gets Rrvvfo across; unlocking the story never turns water into floor.
    blockers.push({id:'river',minX:-25,maxX:175,minZ:-700,maxZ:700});
    if(!this.roadCleared){
      blockers.push({id:'fallen-tree',minX:285,maxX:395,minZ:-190,maxZ:190});
      blockers.push({id:'fallen-tree-north',minX:285,maxX:395,minZ:-660,maxZ:-190});
      blockers.push({id:'fallen-tree-south',minX:285,maxX:395,minZ:190,maxZ:660});
    }
    if(!this.gateOpen){
      blockers.push({id:'gate',minX:555,maxX:645,minZ:-175,maxZ:175});
      blockers.push({id:'gate-north',minX:555,maxX:645,minZ:-660,maxZ:-175});
      blockers.push({id:'gate-south',minX:555,maxX:645,minZ:175,maxZ:660});
    }
    if(!this.lensRevealed){
      blockers.push({id:'lens',minX:1045,maxX:1120,minZ:-175,maxZ:175});
      blockers.push({id:'lens-north',minX:1045,maxX:1120,minZ:-660,maxZ:-175});
      blockers.push({id:'lens-south',minX:1045,maxX:1120,minZ:175,maxZ:660});
    }
    for(const rect of blockers){
      if(player.x>rect.minX&&player.x<rect.maxX&&player.z>rect.minZ&&player.z<rect.maxZ){
        player.x=previous.x;
        player.z=previous.z;
        player.moveVX=0;
        player.moveVZ=0;
        if(rect.id==='river'&&!this.noticeCooldown){
          this.noticeCooldown=1.5;
          this.battle.notice(this.bridgeCrossed?'THE RIVER IS STILL NOT A FLOOR':'THE CURRENT IS TOO DEEP • SWAP WITH THE ROCK',1.2);
        }
      }
    }

    this.updateWarmup(player);
    this.updateStoryTriggers(player);
    this.updatePrompt(player);
  }

  updateWarmup(player){
    if(this.step!=='warmup')return;
    let changed=false;
    for(const marker of this.warmupMarkers){
      if(marker.done||distance(player,marker)>=68)continue;
      const passed=marker.requirement==='move'||(marker.requirement==='jump'&&(player.y>8||Math.abs(player.vy||0)>35))||(marker.requirement==='dash'&&(player.dashTime>0||player.visualAction==='dash'));
      if(passed){marker.done=true;changed=true;const done=this.warmupMarkers.filter(item=>item.done).length;this.battle.notice(`${marker.label} COMPLETE • ${done}/3`,1.1)}
      else if(!this.noticeCooldown){this.noticeCooldown=.9;this.battle.notice(marker.requirement==='jump'?'JUMP THROUGH THIS FLAG':'DASH THROUGH THIS FLAG',.8)}
    }
    if(changed&&this.warmupMarkers.every(marker=>marker.done)){
      this.step='leave-training';
      this.mode='hub';
      this.battle.phase='play';
      this.setObjective('LEAVE THE TRAINING GROUNDS','Follow the tan road east toward the tournament banners.');
    }
  }

  updateStoryTriggers(player){
    if(this.step==='leave-training'&&player.x>-800){
      this.step='bridge';
      this.showAreaTitle('FOREST ROAD');
      this.pauseForManual('hub-exploration',()=>{
        this.setObjective('CROSS THE BROKEN RIVER','Reach the river and swap with the marked rock on the far bank.');
      });
      return;
    }
    if(this.step==='bridge'&&player.x>-150&&!this.manualPending){
      this.step='bridge-ready';
      this.showAreaTitle('BROKEN CROSSING');
      this.pauseForManual('field-object-swap',()=>{
        this.setObjective('SWAP WITH THE FAR-BANK ROCK','Stand at the river edge and press hotbar slot 3.');
      });
      return;
    }
    if(this.step==='cart'&&player.x>235&&!this.manualPending){
      this.step='cart-dialogue';
      this.showAreaTitle('ROADSIDE DELAY');
      this.showDialogue([
        {speaker:'ROAD WORKER',speakerClass:'neutral',text:'Help! This wood is too big for me to push. Hey, you’re the hero who beat Revvfo! Please, please burn this wood for me!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'No problemo.',tail:'down'}
      ],()=>this.pauseForManual('field-fire',()=>{
        this.step='cart-ready';
        this.setObjective('CLEAR THE FALLEN LOG','Stand near the roadblock and press hotbar slot 1.');
      }));
      return;
    }
    if(this.step==='gate'&&player.x>430&&!this.manualPending){
      this.step='gate-ready';
      this.pauseForManual('field-shots',()=>{
        this.setObjective('OPEN THE MULTI-TARGET GATE','Press hotbar slot 2 to strike all four gate targets together.');
      });
      return;
    }
    if(this.step==='encounter'&&player.x>760&&!this.encounterResolved&&!this.manualPending){
      if(this.lostCompetitorDecision==='help'){
        this.step='encounter-ready';
        this.pauseForManual('run-encounters',()=>this.beginEncounter());
      }else{
        this.encounterResolved=true;
        this.step='checkpoint';
        this.setObjective('PASS THE TOURNAMENT CHECKPOINT','Continue east and speak with the checkpoint worker.');
      }
      return;
    }
    if(this.step==='checkpoint'&&player.x>895&&!this.checkpointDialogueShown){
      this.checkpointDialogueShown=true;
      this.step='checkpoint-dialogue';
      this.showDialogue([
        {speaker:'TOURNAMENT CHECKPOINT',speakerClass:'neutral',text:'Name and reason. Spectator or challenger?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'My name’s Rrvvfo. I’m a challenger—and I’m gonna win.',tail:'down'},
        {speaker:'TOURNAMENT CHECKPOINT',speakerClass:'neutral',text:'Proceed.',tail:'down'}
      ],()=>{
        this.mode='hub';
        this.battle.phase='play';
        this.step='lens';
        this.setObjective('CONTINUE TO THE OUTSKIRTS','The final manual check is near the stadium roadblock.');
      });
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
    if(this.step==='finish'&&player.x>1260&&!this.finishDialogueShown){
      this.finishDialogueShown=true;
      this.step='finish-dialogue';
      this.showDialogue([
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'Look at that—wait, don’t you look familiar? I’ve seen you on the news somewhere.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah, I beat Revvfo. No big deal.',tail:'down'},
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'WAIT, REALLY?! HOLY—BIG DEAL!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'This seems like a knockoff of the World Martial Arts Tournament.',tail:'down'},
        {speaker:'SIGN PAINTER',speakerClass:'neutral',text:'They’re owned by the same CEO.',tail:'down'}
      ],()=>this.commitCompletion());
    }
  }


  abilityPrompt(slot,label){return `${this.engine?.prompt?.(`ability${slot}`,`PRESS ${slot}`)||`PRESS ${slot}`} • ${label}`}
  interactionPrompt(){return this.engine?.prompt?.('interact','E')||'E'}

  updatePrompt(player){
    let visible=false,title='',detail='';
    if(this.step==='bridge-ready'&&player.x>-170&&player.x<5){
      visible=true;title='MARKED ROCK';detail=this.abilityPrompt(3,'OBJECT SWAP');
    }else if(this.step==='cart-ready'&&player.x>210&&player.x<300){
      visible=true;title='FALLEN PRACTICE LOG';detail=this.abilityPrompt(1,'FIRE BLAST');
    }else if(this.step==='gate-ready'&&player.x>410&&player.x<555){
      visible=true;title='FOUR TARGETS';detail=this.abilityPrompt(2,'SHOTS OF AGONY');
    }else if(this.step==='lens-ready'&&player.x>920&&player.x<1045){
      visible=true;title='SUSPICIOUS ROADBLOCK';detail=this.abilityPrompt(4,'LENS OF TRUTH');
    }else{
      const nearby=this.npcs.find(npc=>distance(player,npc)<115);
      if(nearby){visible=true;title=nearby.label;detail=this.interactionPrompt().toUpperCase();}
    }
    this.prompt.hidden=!visible;
    if(visible){this.promptTitle.textContent=title;this.promptDetail.textContent=detail;}
  }

  tryInteract(){
    if(this.mode!=='hub')return;
    const player=this.battle.fighters[0];
    const nearby=this.npcs.find(npc=>distance(player,npc)<115);
    if(!nearby)return;
    if(nearby.label==='LOST COMPETITOR'){
      if(this.lostCompetitorDecision==='help'){
        this.showDialogue([{speaker:'LOST COMPETITOR',speakerClass:'neutral',text:'The fighter with the spectator pass is up ahead. Please make sure he keeps his word.',tail:'down'}],()=>{this.mode='hub';this.battle.phase='play'});return;
      }
      if(this.lostCompetitorDecision==='decline'){
        this.showDialogue([{speaker:'LOST COMPETITOR',speakerClass:'neutral',text:'I understand. Good luck in the tournament.',tail:'down'}],()=>{this.mode='hub';this.battle.phase='play'});return;
      }
      this.showDialogue([
        {speaker:'LOST COMPETITOR',speakerClass:'neutral',text:'Ugh, I forgot to sign up. I can’t enter, and I wanted to spectate.',tail:'down'},
        {speaker:'LOST COMPETITOR',speakerClass:'neutral',text:'There’s some guy up ahead who isn’t even gonna spectate. He said he’d give me his pass only if I beat him.',tail:'down'}
      ],async()=>{
        const help=await storyConfirm({title:'HELP HIM?',message:'Fight the roadside fighter for the spectator pass?',confirmLabel:'HELP HIM',cancelLabel:'DON’T HELP'});
        this.lostCompetitorDecision=help?'help':'decline';
        this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:help?'Alright. I’ll fight him and pry it out of his hands.':'Eh, I’m in a rush. Sorry.',tail:'down'}],()=>{this.mode='hub';this.battle.phase='play'});
      });return;
    }
    const lines={
      'DOJO STUDENT':[
        {speaker:'DOJO STUDENT',speakerClass:'neutral',text:'There was a weird old man who said he had to look at some people swimming. Do you know why?',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah. You’re too young to understand.',tail:'down'}
      ],
      'TRAVELER':[
        {speaker:'TRAVELER',speakerClass:'neutral',text:'The decorations look so similar.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I heard they’re owned by the same company. I’m not sure.',tail:'down'}
      ],
      'ROAD WORKER':[
        {speaker:'WORRIED WORKER',speakerClass:'neutral',text:'Don’t go to the tournament. Something seems fishy about it, kid.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Don’t worry. I beat Revvfo. I’m capable of anything.',tail:'down'}
      ],
      'TOURNAMENT FAN':[
        {speaker:'TOURNAMENT FAN',speakerClass:'neutral',text:'I heard someone with red hair summoned a black hole, and someone with brown hair outran it!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'You’re looking at him.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Look at the news. The name’s Rrvvfo. I’m in a rush, kid.',tail:'down'}
      ],
      'SIGN PAINTER':[
        {speaker:'SIGN PAINTER',speakerClass:'neutral',text:'Don’t enter. You’re not cut out for it, kid.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'As if.',tail:'down'}
      ],
      'VENDOR':[
        {speaker:'VENDOR',speakerClass:'neutral',text:'Ugh, my boss is making me sell this horrible food.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Food is food, but I don’t got cash on me right now.',tail:'down'}
      ]
    }[nearby.label]||[];
    if(lines.length)this.showDialogue(lines,()=>{this.mode='hub';this.battle.phase='play'});
  }

  castFieldAbility(slot){
    const player=this.battle.fighters[0];
    if(slot===3&&this.step==='bridge-ready'&&player.x>-180&&player.x<15){
      const oldX=player.x,oldZ=player.z;
      const targetX=this.swapRock.x,targetZ=this.swapRock.z;
      this.bridgeCrossed=true;
      player.x=targetX;
      player.z=targetZ;
      this.swapRock.x=oldX;
      this.swapRock.z=oldZ;
      player.visualAction='objectSwapDisappear';
      player.visualActionTime=.45;
      this.battle.burst(oldX,oldZ,'#ffd079',20,55);
      this.battle.burst(targetX,targetZ,'#ffd079',20,55);
      snapHubCamera(this.battle,player,{distance:1010});
      this.battle.notice('OBJECT SWAP • ROCK TRADED PLACES',1.5);
      this.step='cart';
      this.setObjective('FOLLOW THE ROAD TO THE WORKER','A supply cart is blocking the next section.');
      saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-bridge'});
      return true;
    }
    if(slot===1&&this.step==='cart-ready'&&player.x>200&&player.x<315){
      player.visualAction='fireBlastFire';
      player.visualActionTime=.5;
      this.roadCleared=true;
      this.battle.burst(340,0,'#ff7b38',30,76);
      this.battle.notice('FALLEN LOG CLEARED',1.4);
      this.showDialogue([
        {speaker:'ROAD WORKER',speakerClass:'neutral',text:'Thank you—but you should be more careful! You almost caused a forest fire!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'My bad. I’m in a rush.',tail:'down'}
      ],()=>{
        this.mode='hub';
        this.battle.phase='play';
        this.step='gate';
        this.setObjective('REACH THE MULTI-TARGET GATE','Continue east. The next check uses Shots of Agony.');
        saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-fire'});
      });
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
    const labels={1:'NO BURNABLE ROADBLOCK HERE',2:'NO MULTI-TARGET SWITCH HERE',3:'NO SWAP POINT HERE',4:'NOTHING HIDDEN HERE',5:'ULTIMATES ARE DISABLED IN HUBS'};
    this.battle.notice(labels[slot]||'FIELD TECHNIQUE UNAVAILABLE',1.1);
    return false;
  }

  pauseForManual(pageId,onClose,reactionLines=null){
    this.manualPending=true;
    discoverCombatManualPage(pageId,{reactionLines,open:false,onClose:()=>{}});
    const pageNames={'hub-exploration':'EXPLORATION','field-object-swap':'OBJECT SWAP','field-fire':'FIRE BLAST','field-shots':'SHOTS OF AGONY','run-encounters':'FIGHT OR RUN','lens-secrets':'LENS OF TRUTH'};
    const manualHint=['controller','touch'].includes(this.engine?.activeInput?.())?'OPEN FROM PAUSE':'M TO READ';this.battle.notice(`NEW MANUAL PAGE • ${pageNames[pageId]||'COMBAT LESSON'} • ${manualHint}`,1.8);
    this.manualPending=false;
    if(!this.aborted){this.mode='hub';this.battle.phase='play';onClose?.()}
  }

  beginEncounter(){
    this.mode='choice';
    this.battle.phase='story';
    this.choice.hidden=false;
    this.choice.querySelector('[data-road-fight]').focus();
  }

  leaveRoadsideChallenge(){
    this.choice.hidden=true;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'I’m busy, and I can’t miss the tournament. Sorry.',tail:'down'}
    ],()=>this.resolveEncounter('left'));
  }

  startRunQte(){
    this.choice.hidden=true;
    this.mode='qte';
    this.battle.phase='story';
    this.qteSequence=['KeyA','Space','KeyD'];
    this.qteIndex=0;
    this.qteDeadline=performance.now()+4500;
    this.qte.hidden=false;
    this.renderQte();
  }

  renderQte(){
    const device=this.engine?.activeInput?.()||'keyboard';
    const labels={KeyA:device==='keyboard'?'A':'←',KeyD:device==='keyboard'?'D':'→',Space:this.engine?.prompt?.('jump','SPACE')||'SPACE'};
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
    const remaining=clamp((this.qteDeadline-performance.now())/4500,0,1);
    this.root.querySelector('[data-qte-timer]').style.width=`${remaining*100}%`;
    if(remaining<=0){this.finishRunQte(false);return}
    const pads=navigator.getGamepads?.()||[],assignment=sharedInput.getControllerAssignment(1);
    const activePads=assignment===null?[...pads].filter(Boolean):[pads[assignment]].filter(Boolean);
    for(const pad of activePads){
      const left=(pad.buttons[14]?.pressed||pad.axes[0]<-.55);
      const right=(pad.buttons[15]?.pressed||pad.axes[0]>.55);
      const jump=pad.buttons[sharedInput.controllerMapping(1).buttons.j]?.pressed;
      for(const [key,pressed] of [['KeyA',left],['KeyD',right],['Space',jump]]){
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
    }else if(this.runAttempts<1){
      this.runAttempts++;
      this.battle.notice('ESCAPE MISSED • ONE RETRY',1.4);
      setTimeout(()=>{if(!this.aborted)this.startRunQte()},650);
    }else{
      this.battle.notice('ESCAPE FAILED • QUICK FIGHT STARTING',1.6);
      this.startRoadFight();
    }
  }

  startRoadFight(){
    this.choice.hidden=true;
    this.qte.hidden=true;
    if(this.mode!=='fight-intro'){
      this.mode='fight-intro';
      this.showDialogue([
        {speaker:'ROADSIDE FIGHTER',speakerClass:'rival',text:'If you’re strong enough, fight me. Beat me, and I’ll give you this spectator pass.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Try me. You better keep your word, or I’ll force you to.',tail:'down'}
      ],()=>{this.mode='fight-intro';this.startRoadFight()});
      return;
    }
    const player=this.battle.fighters[0];
    const foe=this.battle.fighters[1];
    this.mode='fight';
    this.map?.setVisible(false);
    this.fighterVisible=true;
    this.battle.root.classList.add('storyRoadFight');
    this.roadPlayerKOs=0;this.roadFoeKOs=0;this.roadKoLocked=false;clearTimeout(this.roadKoTimer);
    player.reset(790,70);applyStoryProgressionToFighter(player,loadLostYearProgress());
    player.en=45;
    foe.id='road-fighter';
    foe.name='Roadside Fighter';
    foe.accent='#7f6cff';
    foe.asset=null;
    foe.reset(940,-70);applyStoryLevelToFighter(foe,storyLevelFromProgress(loadLostYearProgress()),{restoreHealth:true});
    foe.en=45;
    this.battle.koTarget=1;this.battle.scores=[0,0];this.battle.round=1;this.battle.phase='play';
    this.battle.time=Infinity;
    this.battle.hideBanner();
    this.setObjective('OPTIONAL ROAD FIGHT • FIRST TO 1 KO',`Score one KO. Both fighters are Level ${storyLevelFromProgress(loadLostYearProgress())} with matching RPG stats.`);
    this.battle.notice('ROAD FIGHT • RUN IS NO LONGER AVAILABLE',1.8);
  }

  handleRoadFightKo(playerWon){
    if(this.mode!=='fight'||this.aborted||this.roadKoLocked)return;
    this.roadKoLocked=true;if(playerWon)this.roadPlayerKOs++;else this.roadFoeKOs++;
    this.battle.scores=[this.roadPlayerKOs,this.roadFoeKOs];this.battle.phase='story';this.mode='fight-ko';
    this.battle.banner(`K.O. • ${this.roadPlayerKOs}–${this.roadFoeKOs}`);this.battle.audio.play('ko');this.battle.hud();
    const complete=(playerWon?this.roadPlayerKOs:this.roadFoeKOs)>=1;clearTimeout(this.roadKoTimer);
    this.roadKoTimer=window.setTimeout(()=>{if(this.aborted)return;if(complete){this.mode='fight';if(playerWon)this.finishRoadFight(true);else this.showRoadDefeatOptions();return}this.respawnRoadFight();},1100);
  }

  respawnRoadFight(){
    if(this.aborted)return;
    this.roadKoLocked=false;this.mode='fight';
    this.battle.koTarget=1;this.battle.scores=[this.roadPlayerKOs,this.roadFoeKOs];this.battle.round=this.roadPlayerKOs+this.roadFoeKOs+1;
    const loser=this.battle.fighters[0].hp<=1?0:1;
    this.battle.respawnAfterKo(loser);
    this.battle.phase='play';this.battle.time=Infinity;
    this.setObjective('OPTIONAL ROAD FIGHT • FIRST TO 1 KO',`Current score: ${this.roadPlayerKOs}–${this.roadFoeKOs}. Only the defeated fighter respawned.`);
  }

  showRoadDefeatOptions(){
    if(this.aborted)return;
    this.mode='choice';this.battle.phase='story';this.battle.root.classList.remove('storyRoadFight');
    this.defeatPanel.hidden=false;this.defeatPanel.querySelector('[data-road-rematch]')?.focus();
  }

  openPauseMenu(){
    if(this.mode!=='hub')return;
    this.pausePanel.querySelector('[data-road-pause-objective]').textContent=`${this.objective.textContent} — ${this.detail.textContent}`;
    this.pausePanel.hidden=false;this.mode='pause';this.battle.phase='story';this.pausePanel.querySelector('[data-road-resume]')?.focus();
  }

  closePauseMenu(){
    if(this.pausePanel.hidden)return;
    this.pausePanel.hidden=true;this.mode='hub';this.battle.phase='play';this.root.querySelector('[data-road-menu]')?.focus();
  }

  restartRoadFight(){
    if(this.aborted)return;this.mode='fight';this.roadPlayerKOs=0;this.roadFoeKOs=0;this.roadKoLocked=false;
    this.battle.koTarget=1;this.battle.scores=[0,0];this.battle.round=1;this.battle.newRound();this.battle.time=Infinity;
    this.setObjective('OPTIONAL ROAD FIGHT • FIRST TO 1 KO','Score one KO before the roadside fighter does.');
    this.battle.notice('MATCH RESTARTED',1.2);
  }

  finishRoadFight(won){
    if(this.mode!=='fight'||this.aborted)return;
    this.battle.root.classList.remove('storyRoadFight');
    saveLostYearProgress({...loadLostYearProgress(),spectatorPassWon:true});
    this.resolveEncounter(won?'won':'escaped');
  }

  resolveEncounter(result){
    this.encounterResolved=true;
    this.mode='hub';
    this.map?.setVisible(true);
    this.battle.phase='play';
    this.fighterVisible=false;
    this.hideSecondFighter();
    const player=this.battle.fighters[0];
    player.x=850;
    player.z=20;
    player.hp=player.maxHp;
    player.en=45;
    snapHubCamera(this.battle,player,{distance:1010});
    this.step='checkpoint';
    this.setObjective('PASS THE TOURNAMENT CHECKPOINT','Continue east and speak with the checkpoint worker.');
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
    const r=this.battle.renderer,time=performance.now()/1000;
    drawRoadLandmarks(r,time);
    const drawPerson=(npc,index)=>{
      const bob=Math.sin(time*2+npc.phase)*2,traveler=index%3===0,worker=index%3===1;
      r.disc({x:npc.x,y:5,z:npc.z,rx:25,rz:16,color:'#000000',alpha:.25});
      r.cylinder({x:npc.x,y:49+bob,z:npc.z,rx:15,rz:12,sy:64,color:npc.color});
      r.cylinder({x:npc.x,y:93+bob,z:npc.z,rx:14,sy:27,color:'#9b6848'});
      if(worker){
        r.cone({x:npc.x,y:113+bob,z:npc.z,rx:22,rz:18,sy:18,color:'#d5b04d'});
        r.box({x:npc.x,y:115+bob,z:npc.z-10,sx:42,sy:5,sz:14,color:'#d5b04d'});
      }else{
        r.cone({x:npc.x,y:116+bob,z:npc.z,rx:19,rz:16,sy:24,color:index%2?'#33211c':'#6e4b32'});
      }
      if(traveler){
        r.box({x:npc.x+17,y:54+bob,z:npc.z+4,sx:16,sy:42,sz:20,color:'#5b4335'});
        r.segment({x:npc.x-23,y:20+bob,z:npc.z},{x:npc.x-23,y:102+bob,z:npc.z},{width:4,height:4,color:'#7d5a36'});
      }
    };
    this.npcs.forEach(drawPerson);
    // Small moving creatures and delivery carts keep the road active even when
    // the player is not talking to an NPC.
    for(let i=0;i<5;i++){
      const birdX=-1300+((time*95+i*570)%2900),birdZ=-520+i*245+Math.sin(time*1.7+i)*55;
      r.billboard({x:birdX,y:145+Math.sin(time*4+i)*18,z:birdZ,size:13,color:'#f2f4ff',alpha:.8});
    }
    const cartX=-620+((time*42)%1900);r.box({x:cartX,y:22,z:520,sx:72,sy:38,sz:52,color:'#9a6b3f'});r.disc({x:cartX-28,y:5,z:546,rx:13,rz:8,color:'#26211e',alpha:1});r.disc({x:cartX+28,y:5,z:546,rx:13,rz:8,color:'#26211e',alpha:1});

    for(const marker of this.warmupMarkers){
      if(marker.done)continue;
      const pulse=1+Math.sin(time*4+marker.x)*.07;
      r.box({x:marker.x,y:48,z:marker.z,sx:9,sy:96,sz:9,color:'#2e241f'});
      r.box({x:marker.x+20,y:80,z:marker.z,sx:42,sy:34,sz:5,color:'#d82431'});
      r.disc({x:marker.x,y:5,z:marker.z,rx:34*pulse,rz:23*pulse,color:'#ffd557',alpha:.2});
    }

    // Draw extra current lines so the water reads as a hazard instead of a blue floor tile.
    for(let z=-620;z<=620;z+=95){
      const drift=Math.sin(time*1.8+z*.02)*18;
      r.segment({x:5,y:10,z:z+drift},{x:145,y:10,z:z+drift+24},{width:5,height:2,color:'#a9e7ff',alpha:.45,lit:false});
    }

    const rockPulse=1+Math.sin(time*4.3)*.08;
    r.box({x:this.swapRock.x,y:24,z:this.swapRock.z,sx:58,sy:42,sz:52,color:'#77766e',rotationY:.25});
    r.box({x:this.swapRock.x-10,y:47,z:this.swapRock.z+4,sx:38,sy:18,sz:34,color:'#98958a',rotationY:-.2});
    if(this.step==='bridge-ready'){
      r.disc({x:this.swapRock.x,y:6,z:this.swapRock.z,rx:42*rockPulse,rz:28*rockPulse,color:'#ffd557',alpha:.35});
      r.billboard({x:this.swapRock.x,y:105,z:this.swapRock.z,size:30*rockPulse,color:'#fff1a3',alpha:.9});
    }

    const drawThicket=(x,z)=>{
      r.box({x,y:42,z,sx:74,sy:84,sz:120,color:'#315f35'});
      r.box({x:x-18,y:93,z:z+8,sx:52,sy:58,sz:80,color:'#427a43'});
      r.box({x:x+22,y:88,z:z-14,sx:48,sy:54,sz:74,color:'#3b713e'});
    };

    if(this.step==='warmup'){
      r.segment({x:-830,y:36,z:-165},{x:-830,y:36,z:165},{width:20,height:20,color:'#8a5c35',alpha:1});
      for(const z of [-520,-350,350,520])drawThicket(-830,z);
    }

    if(!this.roadCleared){
      r.segment({x:330,y:30,z:-155},{x:350,y:30,z:155},{width:38,height:36,color:'#6b482f',alpha:1});
      for(const z of [-120,-45,35,115])r.box({x:350,y:45,z,sx:78,sy:28,sz:36,color:'#436d36',rotationY:.3});
      r.box({x:420,y:28,z:180,sx:120,sy:55,sz:78,color:'#8d6a42',rotationY:-.12});
      for(const z of [-525,-350,350,525])drawThicket(340,z);
    }

    if(!this.gateOpen)for(const z of [-520,-350,350,520])drawThicket(600,z);
    if(!this.lensRevealed)for(const z of [-520,-350,350,520])drawThicket(1080,z);

    const objective=this.objectivePoint();
    if(objective){
      const pulse=1+Math.sin(time*4)*.09;
      r.disc({x:objective.x,y:7,z:objective.z,rx:40*pulse,rz:28*pulse,color:'#ffd557',alpha:.28});
      r.billboard({x:objective.x,y:145,z:objective.z,size:34*pulse,color:'#fff1a3',alpha:.88});
    }

    // Broken bridge pieces stop at each bank; there is deliberately no walkable span.
    for(const x of [-45,195]){
      r.segment({x,y:20,z:-120},{x,y:20,z:120},{width:14,height:14,color:'#6f4e2f',alpha:.95});
      for(const z of [-90,-30,30,90])r.box({x,y:18,z,sx:60,sy:10,sz:30,color:'#7b5a37',rotationY:.03});
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
    const remainingWarmup=this.warmupMarkers.find(marker=>!marker.done);
    if(this.step==='warmup'&&remainingWarmup)return{x:remainingWarmup.x,z:remainingWarmup.z};
    const table={
      'leave-training':{x:-780,z:40},
      bridge:{x:-95,z:20},
      'bridge-ready':{x:-75,z:20},
      cart:{x:250,z:0},
      'cart-dialogue':{x:260,z:0},
      'cart-ready':{x:270,z:0},
      gate:{x:430,z:0},
      'gate-ready':{x:500,z:0},
      encounter:{x:780,z:0},
      'encounter-ready':{x:800,z:0},
      checkpoint:{x:915,z:0},
      'checkpoint-dialogue':{x:915,z:0},
      lens:{x:990,z:0},
      'lens-ready':{x:1000,z:0},
      finish:{x:1280,z:-10},
      'finish-dialogue':{x:1280,z:-10}
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
      if(['KeyA','KeyD','Space'].includes(event.code)){event.preventDefault();event.stopImmediatePropagation();this.acceptQteInput(event.code)}
      return;
    }
    if(event.key==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();
      if(this.mode==='pause')this.closePauseMenu();else if(this.mode==='hub')this.openPauseMenu();
      return;
    }
    if(event.key.toLowerCase()==='m'&&this.mode==='hub'){event.preventDefault();this.openManualFromHub();return}
    if(event.key.toLowerCase()==='t'&&this.mode==='hub'){event.preventDefault();this.map?.open();return}
    if(this.mode==='hub'&&(event.key==='Enter'||event.code==='KeyE')){event.preventDefault();this.tryInteract()}
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

  async requestExit(){
    const leave=await storyConfirm({title:'RETURN TO STORY?',message:'Leave the Tournament Road? Completed checkpoints remain saved, but the current encounter will restart.',confirmLabel:'RETURN TO STORY'});
    if(leave)this.exitToStory();
  }

  exitToStory(){
    this.battle?.stopMatch();
    this.battle?.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    if(this.aborted)return;
    this.aborted=true;clearTimeout(this.roadKoTimer);this.map?.destroy();this.map=null;
    document.removeEventListener('keydown',this.keyHandler,true);
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    destroyStoryBattle(this.battle);
    this.root.remove();
    activeMission=null;
  }
}

export function startRrvvfoRoadHub(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoRoadHub(options);
  return activeMission.start();
}

export {RrvvfoRoadHub};
