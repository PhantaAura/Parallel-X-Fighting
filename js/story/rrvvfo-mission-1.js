import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=29a2-story-hud-20260728';
import {loadArenaControlSettings,PC_LAYOUTS} from '../arena/arena-controls.js?v=29a2-story-hud-20260728';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=29a2-story-hud-20260728';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a2-story-hud-20260728';
import {grantCombatManual} from './combat-manual.js?v=29a2-story-hud-20260728';
import {applyStoryProgressionToFighter} from './story-progression.js?v=29a2-story-hud-20260728';
import {storyConfirm} from './story-ux.js?v=29a2-story-hud-20260728';

const MISSION_ID='rrvvfo-01';
const UI_ID='rrvvfoMission1UI';
let activeMission=null;

function controlLabel(code){
  const labels={Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',KeyA:'A',KeyD:'D',KeyW:'W',KeyS:'S',KeyF:'F',KeyR:'R',KeyT:'T',KeyQ:'Q',KeyJ:'J',KeyK:'K',KeyI:'I',KeyL:'L',KeyC:'C',KeyU:'U',KeyG:'G'};
  return labels[code]||String(code||'').replace(/^Key/,'').replace(/^Digit/,'');
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.innerHTML=`
    <div class="storyTutorialTag" data-tutorial-tag>
      <small>RRVVFO ROUTE • CHAPTER 1 • PART 2</small>
      <strong data-tutorial-objective>WAIT FOR THE SAGE</strong>
      <span data-tutorial-detail>The refresher begins after the briefing.</span>
    </div>
    <div class="storyManualOverlay" data-combat-manual hidden>
      <article class="storyManualCard">
        <header><div><small>THE SAGE'S COMBAT MANUAL</small><h2>BACK IN FIGHTING SHAPE</h2></div><strong>TOURNAMENT PREP</strong></header>
        <div class="manualGrid" data-manual-grid></div>
        <div class="storyManualActions"><button type="button" class="primary" data-begin-tutorial>BEGIN REFRESHER</button><button type="button" data-exit-manual>RETURN TO RRVVFO ROUTE</button></div>
      </article>
    </div>
    <div class="storyCompleteOverlay" data-mission-complete hidden>
      <article class="storyCompleteCard"><small>CHAPTER 1 COMPLETE</small><h2>NO MAXIMUMS</h2><p>Combat Manual unlocked. Lens of Truth refreshed. Tournament entry unlocked.</p><button type="button" class="primary" data-return-story>TAKE THE TOURNAMENT ROAD</button></article>
    </div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoMission1{
  constructor({onComplete=()=>{},onExit=()=>{}}={}){
    this.onComplete=onComplete;
    this.onExit=onExit;
    this.root=buildUI();
    this.objective=this.root.querySelector('[data-tutorial-objective]');
    this.detail=this.root.querySelector('[data-tutorial-detail]');
    this.manual=this.root.querySelector('[data-combat-manual]');
    this.completePanel=this.root.querySelector('[data-mission-complete]');
    this.root.querySelector('[data-begin-tutorial]').addEventListener('click',()=>this.beginTutorial());
    this.root.querySelector('[data-exit-manual]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-return-story]').addEventListener('click',()=>this.exitToStory());
    this.phase='opening';
    this.flags={move:false,jump:false,dash:false,light:false,heavy:false,launcher:false,block:false,parry:false,grab:false,charge:false,fire:false,shots:false,swap:false,lens:false};
    this.finalHits=0;
    this.sageAttackTimer=.8;
    this.aborted=false;
    this.dialogue=null;
  }

  start(){
    resetArenaBattleInstance();
    this.battle=new ArenaBattle('training-field');
    const sage=this.battle.fighters[1];
    sage.id='sage';sage.name='The Sage';sage.accent='#d9e7f3';sage.cpu=true;sage.appearance='down';
    this.patchBattle();
    this.battle.start();
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART REFRESHER?',message:'Restart the Combat Manual tutorial from the beginning?',confirmLabel:'RESTART'});
    this.battle.root.classList.add('storyMission1','storyMissionDialogueOpen');
    this.battle.root.querySelector('[data-stage-name]').textContent='SAGE TRAINING FIELD';
    this.battle.root.querySelector('.badge strong').textContent='PROTOTYPE 2.9A.2 • RRVVFO CHAPTER 1';
    this.battle.fighters[0].maxHp=100;this.battle.fighters[0].hp=100;this.battle.fighters[1].maxHp=100;this.battle.fighters[1].hp=100;
    applyStoryProgressionToFighter(this.battle.fighters[0]);
    this.setArenaNames('RRVVFO','THE SAGE');
    this.battle.phase='story';
    this.battle.time=9999;
    this.battle.hideBanner();
    this.renderManual();
    this.showOpeningDialogue();
    return this;
  }

  patchBattle(){
    const battle=this.battle;
    const baseInput=battle.input.bind(battle);
    const baseCast=battle.castAbility.bind(battle);
    const baseApplyDamage=battle.applyDamage.bind(battle);
    const baseUpdate=battle.update.bind(battle);
    const defaultExit=battle.exit.bind(battle);

    battle.input=()=>{
      const command=baseInput();
      this.observeCommand(command);
      return command;
    };

    battle.cpu=(fighter,foe,dt)=>{
      this.sageAttackTimer-=dt;
      const dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.max(1,Math.hypot(dx,dz));
      let x=0,z=0,light=false,block=false;
      if(this.phase==='movement'||this.phase==='abilities'){x=0;z=0}
      else if(distance>145){x=dx/distance*.35;z=dz/distance*.35}
      else if(this.sageAttackTimer<=0){light=true;this.sageAttackTimer=this.phase==='basics'?.9:1.15}
      if(this.phase==='final'&&foe.attackState&&distance<150)block=Math.random()<.35;
      return{x,z,jump:false,light,heavy:false,launcher:false,dash:false,block,special:false};
    };

    battle.castAbility=slot=>{
      if(slot===5){battle.notice('THE ULTIMATE IS NOT PART OF THIS REFRESHER');return false}
      const worked=baseCast(slot);
      if(worked)this.markAbility(slot);
      return worked;
    };

    battle.applyDamage=(attacker,target,damage,meta={})=>{
      const wasBlocking=target.block;
      const wasPerfect=wasBlocking&&target.blockAge<=.12;
      const connected=baseApplyDamage(attacker,target,damage,meta);
      if(attacker.id==='sage'&&target.id==='rrvvfo'&&wasBlocking&&connected){
        this.flags.block=true;
        if(wasPerfect)this.flags.parry=true;
        this.checkBasics();
      }
      if(attacker.id==='rrvvfo'&&target.id==='sage'&&connected&&this.phase==='final'){
        this.finalHits++;
        if(this.finalHits>=3)this.finishTutorial();
      }
      target.hp=Math.max(1,target.hp);
      return connected;
    };

    battle.update=dt=>{
      baseUpdate(dt);
      if(!battle.active||this.aborted)return;
      const player=battle.fighters[0];
      if(player.hp<1)player.hp=1;
      battle.fighters[1].hp=Math.max(1,battle.fighters[1].hp);
      if(this.phase==='movement'&&this.flags.move&&this.flags.jump&&this.flags.dash)this.startBasics();
      if(this.phase==='resource'&&this.flags.charge&&player.en>=75)this.startAbilities();
      if(this.phase==='shotsCharge'&&player.en>=100){
        this.phase='shotsReady';
        this.setObjective('FULL-ENERGY TECHNIQUE','Energy is full. Use slot 2: Shots of Agony. It will consume the entire meter.');
        battle.notice('USE SLOT 2 • ALL ENERGY',1.8);
      }
      if(this.phase==='lensCharge'&&player.en>=90){
        this.phase='lensReady';
        this.setObjective('RISKY PREDICTION','Energy is at 90. Use slot 4: Lens of Truth. It costs 70 HP and still requires you to react.');
        battle.notice('USE SLOT 4 • 90 ENERGY • 70 HP',2);
      }
      if(['abilities','shotsReady','lensReady'].includes(this.phase)){
        for(const key of ['fireBlast','shotsOfAgony','objectSwap','lensOfTruth'])player.cooldowns[key]=Math.min(player.cooldowns[key],.2);
      }
    };

    battle.exit=async()=>{
      const leave=await storyConfirm({title:'RETURN TO ROUTE?',message:'Leave the training refresher? Current tutorial progress will restart.',confirmLabel:'LEAVE TRAINING'});
      if(!leave)return;
      defaultExit();
      this.cleanup();
      this.onExit();
    };
  }

  showDialogue(lines,onComplete){
    this.battle.root.classList.add('storyMissionDialogueOpen');
    this.battle.phase='story';
    this.dialogue?.overlay?.remove();
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    const dialogue=new SonicBattleDialogue({
      typeSpeed:18,
      onComplete:()=>{
        document.removeEventListener('keydown',dialogue._onKey);
        dialogue.overlay?.remove();
        this.dialogue=null;
        this.battle.root.classList.remove('storyMissionDialogueOpen');
        onComplete?.();
      }
    });
    this.dialogue=dialogue;
    dialogue.show(lines);
    if(dialogue.overlay)dialogue.overlay.style.zIndex='2200';
  }

  showOpeningDialogue(){
    this.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I signed you up for a tournament.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You did what?',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You need real opponents. You might meet some old faces there.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Old faces? You could have mentioned that before signing me up.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I just did. But first, you have gotten rusty.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I beat Revvfo.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'And apparently forgot how to block afterward. Here. Take the manual.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'It updates itself whenever you find a mechanic I knew you would ignore. I taught you Shots of Agony myself; the manual handles the field uses after I leave.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'That sentence somehow made it less trustworthy.',tail:'down'}
    ],()=>this.showManual());
  }

  renderManual(){
    const settings=loadArenaControlSettings();
    const layout=PC_LAYOUTS[settings.pcLayout]||PC_LAYOUTS.ergonomic;
    const a=layout.actions;
    this.root.querySelector('[data-manual-grid]').innerHTML=`
      <section><h3>MOVEMENT</h3><dl><div><dt>Move</dt><dd>W A S D</dd></div><div><dt>Jump</dt><dd>${controlLabel(a.jump)}</dd></div><div><dt>Dash</dt><dd>${controlLabel(a.dash)} / DOUBLE-TAP</dd></div></dl></section>
      <section><h3>BASIC COMBAT</h3><dl><div><dt>Light</dt><dd>${controlLabel(a.light)} / MOUSE 1</dd></div><div><dt>Heavy</dt><dd>${controlLabel(a.heavy)}</dd></div><div><dt>Launcher</dt><dd>${controlLabel(a.launcher)}</dd></div><div><dt>Timed Guard</dt><dd>${controlLabel(a.block)} / MOUSE 2</dd></div><div><dt>Grab</dt><dd>U / G</dd></div></dl></section>
      <section><h3>RESOURCE CONTROL</h3><dl><div><dt>Charge</dt><dd>C • STAND STILL</dd></div><div><dt>Attack gain</dt><dd>CLEAN HITS RESTORE ENERGY</dd></div><div><dt>Guard recovery</dt><dd>FASTER WHILE STANDING STILL</dd></div></dl></section>
      <section><h3>HOTBAR</h3><dl><div><dt>1</dt><dd>FIRE BLAST</dd></div><div><dt>2</dt><dd>SHOTS OF AGONY • ALL ENERGY</dd></div><div><dt>3</dt><dd>OBJECT SWAP</dd></div><div><dt>4</dt><dd>LENS • 90 ENERGY / 70 HP EARLY</dd></div><div><dt>5</dt><dd>ULTIMATE</dd></div></dl></section>
      <section><h3>SAGE'S NOTE</h3><p>Lens predicts the most probable attack. Successful reads build mastery. At full mastery it can auto-dodge only a few times—not forever.</p></section>`;
  }

  showManual(){
    grantCombatManual({pages:['movement','basic-combat','resource-control','advanced-defense','hotbar','lens-secrets']});
    this.manual.hidden=false;
    this.setObjective('READ THE COMBAT MANUAL','Review movement, attacks, blocking, and hotbar slots 1–5.');
    this.root.querySelector('[data-begin-tutorial]').focus();
  }

  beginTutorial(){
    this.manual.hidden=true;
    this.phase='movement';
    this.battle.phase='play';
    this.battle.time=9999;
    this.battle.hideBanner();
    this.setObjective('MOVEMENT REFRESHER','Move with WASD, jump once, and dash once.');
    this.battle.notice('MOVE • JUMP • DASH',1.8);
  }

  observeCommand(command){
    if(this.phase==='movement'){
      if(Math.hypot(command.x||0,command.z||0)>.35)this.flags.move=true;
      if(command.jump)this.flags.jump=true;
      if(command.dash)this.flags.dash=true;
    }else if(this.phase==='basics'){
      if(command.light)this.flags.light=true;
      if(command.heavy)this.flags.heavy=true;
      if(command.launcher)this.flags.launcher=true;
      if(command.grab)this.flags.grab=true;
      if(command.block)this.battle.notice('TIME BLOCK WITH THE SAGE ATTACK • PERFECT PARRY',.8);
      this.checkBasics();
    }else if(['resource','shotsCharge','lensCharge'].includes(this.phase)){
      if(command.charge)this.flags.charge=true;
    }
  }

  startBasics(){
    if(this.phase!=='movement')return;
    this.phase='basics';
    this.setObjective('BASIC COMBAT','Use light, heavy, launcher, and grab. Then time a perfect parry against one Sage attack.');
    this.battle.notice('ATTACKS • GRAB • PERFECT PARRY',1.8);
  }

  checkBasics(){
    if(this.phase!=='basics')return;
    if(this.flags.light&&this.flags.heavy&&this.flags.launcher&&this.flags.grab&&this.flags.parry)this.startResourceLesson();
  }

  startResourceLesson(){
    this.phase='resource';
    const player=this.battle.fighters[0];
    player.en=20;
    this.flags.charge=false;
    this.setObjective('ENERGY CONTROL','Stand still and hold C / CHARGE until your energy reaches 75. Moving or blocking stops the charge.');
    this.battle.notice('STAND STILL • HOLD CHARGE',1.8);
  }

  startAbilities(){
    this.phase='abilities';
    this.setObjective('TECHNIQUE REFRESHER','Use Fire Blast (1) and Object Swap (3). Clean attacks and charging restore energy.');
    this.battle.notice('USE SLOT 1 AND SLOT 3',2);
  }

  markAbility(slot){
    if(slot===1&&this.phase==='abilities')this.flags.fire=true;
    if(slot===3&&this.phase==='abilities')this.flags.swap=true;
    if(this.phase==='abilities'){
      const done=[this.flags.fire,this.flags.swap].filter(Boolean).length;
      this.setObjective('TECHNIQUE REFRESHER',`Basic techniques completed: ${done}/2 — use slots 1 and 3.`);
      if(done===2){
        this.phase='shotsCharge';
        this.battle.fighters[0].en=Math.min(this.battle.fighters[0].en,35);
        this.setObjective('CHARGE FOR SHOTS OF AGONY','Stand still and charge to a completely full energy meter.');
        this.battle.notice('CHARGE TO 100',1.5);
      }
      return;
    }
    if(slot===2&&this.phase==='shotsReady'){
      this.flags.shots=true;
      this.phase='lensCharge';
      const player=this.battle.fighters[0];
      player.en=35;player.hp=100;
      this.setObjective('CHARGE FOR LENS OF TRUTH','Shots consumed everything. Charge back to 90 energy for Lens of Truth.');
      this.battle.notice('SHOTS USED ALL ENERGY • CHARGE TO 90',2);
      return;
    }
    if(slot===4&&this.phase==='lensReady'){
      this.flags.lens=true;
      this.setObjective('READ THE SAGE','Lens shows the Sage’s probable attack. Dodge or parry it yourself; mastery grows from successful reads.');
      setTimeout(()=>this.startFinalSpar(),1300);
    }
  }

  startFinalSpar(){
    if(this.phase!=='abilities')return;
    this.phase='final';
    this.finalHits=0;
    this.setObjective('FINAL SPAR','Land three clean hits on the Sage using anything you relearned.');
    this.battle.notice('SHOW THE SAGE YOU ARE READY',1.8);
  }

  finishTutorial(){
    if(this.phase==='complete')return;
    this.phase='complete';
    this.battle.phase='story';
    this.setObjective('TRAINING COMPLETE','The tournament entry is ready.');
    this.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You are still reckless, impatient, and far too proud.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'So I am ready?',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Unfortunately, yes.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Do not underestimate anyone there. Especially the familiar ones.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You keep saying that like I am supposed to be worried.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You should be.',tail:'down'}
    ],()=>this.commitCompletion());
  }

  commitCompletion(){
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=[...new Set([...(progress.unlocks||[]),'combatManual','lensOfTruthRefreshed','tournamentEntry'])];
    saveLostYearProgress({...progress,completedMissions,unlocks});
    this.onComplete();
    this.completePanel.hidden=false;
    this.root.querySelector('[data-return-story]').focus();
  }

  setObjective(title,detail){this.objective.textContent=title;this.detail.textContent=detail}

  setArenaNames(left,right){
    const names=this.battle?.root?.querySelectorAll('.top .side .name span:first-child');
    if(names?.[0])names[0].textContent=left;
    if(names?.[1])names[1].textContent=right;
  }

  async requestExit(){
    if(await storyConfirm({title:'RETURN TO ROUTE?',message:'Leave the training refresher? Current tutorial progress will restart.',confirmLabel:'LEAVE TRAINING'}))this.exitToStory();
  }

  exitToStory(){
    this.battle?.stopMatch();
    this.battle?.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    this.aborted=true;
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    this.dialogue?.overlay?.remove();
    resetArenaBattleInstance();
    this.root.remove();
    this.battle?.root.classList.remove('storyMission1','storyMissionDialogueOpen');
    activeMission=null;
  }
}

export function startRrvvfoMission1(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoMission1(options);
  return activeMission.start();
}

export {RrvvfoMission1};
