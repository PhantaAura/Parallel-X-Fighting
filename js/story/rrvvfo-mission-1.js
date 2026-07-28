import {ArenaBattle,resetArenaBattleInstance} from '../arena/arena-mode.js?v=262-parallels-battle-menu-20260727-202046';
import {loadArenaControlSettings,PC_LAYOUTS} from '../arena/arena-controls.js?v=262-parallels-battle-menu-20260727-202046';
import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=262-parallels-battle-menu-20260727-202046';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=262-parallels-battle-menu-20260727-202046';

const MISSION_ID='rrvvfo-01';
const UI_ID='rrvvfoMission1UI';
let activeMission=null;

function controlLabel(code){
  const labels={Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',KeyA:'A',KeyD:'D',KeyW:'W',KeyS:'S',KeyF:'F',KeyR:'R',KeyT:'T',KeyQ:'Q',KeyJ:'J',KeyK:'K',KeyI:'I',KeyL:'L'};
  return labels[code]||String(code||'').replace(/^Key/,'').replace(/^Digit/,'');
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.innerHTML=`
    <div class="storyTutorialTag" data-tutorial-tag>
      <small>RRVVFO MISSION 1 • BACK IN FIGHTING SHAPE</small>
      <strong data-tutorial-objective>WAIT FOR THE SAGE</strong>
      <span data-tutorial-detail>The refresher begins after the briefing.</span>
    </div>
    <div class="storyManualOverlay" data-combat-manual hidden>
      <article class="storyManualCard">
        <header><div><small>THE SAGE'S COMBAT MANUAL</small><h2>BACK IN FIGHTING SHAPE</h2></div><strong>TOURNAMENT PREP</strong></header>
        <div class="manualGrid" data-manual-grid></div>
        <div class="storyManualActions"><button type="button" class="primary" data-begin-tutorial>BEGIN REFRESHER</button><button type="button" data-exit-manual>RETURN TO STORY</button></div>
      </article>
    </div>
    <div class="storyCompleteOverlay" data-mission-complete hidden>
      <article class="storyCompleteCard"><small>MISSION 1 COMPLETE</small><h2>BACK IN FIGHTING SHAPE</h2><p>Combat Manual unlocked. Lens of Truth refreshed. Tournament entry unlocked.</p><button type="button" class="primary" data-return-story>RETURN TO RRVVFO STORY</button></article>
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
    this.root.querySelector('[data-exit-manual]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-return-story]').addEventListener('click',()=>this.exitToStory());
    this.phase='opening';
    this.flags={move:false,jump:false,dash:false,light:false,heavy:false,launcher:false,block:false,fire:false,shots:false,swap:false,lens:false};
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
    this.battle.root.classList.add('storyMission1','storyMissionDialogueOpen');
    this.battle.root.querySelector('[data-stage-name]').textContent='SAGE TRAINING FIELD';
    this.battle.root.querySelector('.badge strong').textContent='PROTOTYPE 2.5D • RRVVFO MISSION 1';
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
      const connected=baseApplyDamage(attacker,target,damage,meta);
      if(attacker.id==='sage'&&target.id==='rrvvfo'&&wasBlocking&&connected){this.flags.block=true;this.checkBasics()}
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
      player.en=100;
      if(player.hp<55)player.hp=55;
      battle.fighters[1].hp=Math.max(1,battle.fighters[1].hp);
      if(this.phase==='movement'&&this.flags.move&&this.flags.jump&&this.flags.dash)this.startBasics();
      if(this.phase==='abilities'){
        for(const key of ['fireBlast','shotsOfAgony','objectSwap','lensOfTruth'])player.cooldowns[key]=Math.min(player.cooldowns[key],.35);
      }
    };

    battle.exit=()=>{
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
  }

  showOpeningDialogue(){
    this.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I signed you up for a tournament.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You did what?',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You need real opponents. You might meet some old faces there.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Old faces? You could have mentioned that before signing me up.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I just did. But first, you have gotten rusty.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I beat Revvfo.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'And apparently forgot how to block afterward. Read the manual.',tail:'down'}
    ],()=>this.showManual());
  }

  renderManual(){
    const settings=loadArenaControlSettings();
    const layout=PC_LAYOUTS[settings.pcLayout]||PC_LAYOUTS.ergonomic;
    const a=layout.actions;
    this.root.querySelector('[data-manual-grid]').innerHTML=`
      <section><h3>MOVEMENT</h3><dl><div><dt>Move</dt><dd>W A S D</dd></div><div><dt>Jump</dt><dd>${controlLabel(a.jump)}</dd></div><div><dt>Dash</dt><dd>${controlLabel(a.dash)} / DOUBLE-TAP</dd></div></dl></section>
      <section><h3>BASIC COMBAT</h3><dl><div><dt>Light</dt><dd>${controlLabel(a.light)} / MOUSE 1</dd></div><div><dt>Heavy</dt><dd>${controlLabel(a.heavy)}</dd></div><div><dt>Launcher</dt><dd>${controlLabel(a.launcher)}</dd></div><div><dt>Block</dt><dd>${controlLabel(a.block)} / MOUSE 2</dd></div></dl></section>
      <section><h3>HOTBAR</h3><dl><div><dt>1</dt><dd>FIRE BLAST</dd></div><div><dt>2</dt><dd>SHOTS OF AGONY</dd></div><div><dt>3</dt><dd>OBJECT SWAP</dd></div><div><dt>4</dt><dd>LENS OF TRUTH</dd></div><div><dt>5</dt><dd>ULTIMATE</dd></div></dl></section>
      <section><h3>SAGE'S NOTE</h3><p>Lens of Truth is not just “everything gets slower.” Read the attack, move before it lands, and stop relying on raw power.</p></section>`;
  }

  showManual(){
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
      if(command.block)this.battle.notice('HOLD BLOCK WHILE THE SAGE ATTACKS',.8);
      this.checkBasics();
    }
  }

  startBasics(){
    if(this.phase!=='movement')return;
    this.phase='basics';
    this.setObjective('BASIC COMBAT','Use light, heavy, and launcher attacks. Then block one Sage attack.');
    this.battle.notice('ATTACKS FIRST • THEN BLOCK',1.8);
  }

  checkBasics(){
    if(this.phase!=='basics')return;
    if(this.flags.light&&this.flags.heavy&&this.flags.launcher&&this.flags.block)this.startAbilities();
  }

  startAbilities(){
    this.phase='abilities';
    this.setObjective('TECHNIQUE REFRESHER','Use Fire Blast, Shots of Agony, Object Swap, and Lens of Truth with slots 1–4.');
    this.battle.notice('USE HOTBAR SLOTS 1 • 2 • 3 • 4',2);
  }

  markAbility(slot){
    if(this.phase!=='abilities')return;
    if(slot===1)this.flags.fire=true;
    if(slot===2)this.flags.shots=true;
    if(slot===3)this.flags.swap=true;
    if(slot===4)this.flags.lens=true;
    const done=[this.flags.fire,this.flags.shots,this.flags.swap,this.flags.lens].filter(Boolean).length;
    this.setObjective('TECHNIQUE REFRESHER',`Abilities completed: ${done}/4 — use slots 1, 2, 3, and 4.`);
    if(done===4)setTimeout(()=>this.startFinalSpar(),500);
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
