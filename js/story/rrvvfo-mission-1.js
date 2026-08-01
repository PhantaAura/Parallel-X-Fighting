import {CONTROL_MAPS} from '../input.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {grantCombatManual} from './combat-manual.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {storyConfirm} from './story-ux.js?v=29a363-chapter4-menu-state-recovery-20260801';

const MISSION_ID='rrvvfo-01';
const UI_ID='rrvvfoMission1UI';
const TOTAL_STEPS=8;
let activeMission=null;

function controlLabel(code){
  const labels={Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',KeyA:'A',KeyD:'D',KeyW:'W',KeyS:'S',KeyJ:'J',KeyK:'K',KeyI:'I',KeyL:'L',KeyC:'C',KeyU:'U'};
  return labels[code]||String(code||'').replace(/^Key/,'').replace(/^Digit/,'');
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.innerHTML=`
    <div class="storyTutorialTag" data-tutorial-tag>
      <small>RRVVFO ROUTE • CHAPTER 1 • COMBAT MANUAL</small>
      <strong data-tutorial-objective>WAIT FOR THE SAGE</strong>
      <span data-tutorial-detail>The refresher begins after the briefing.</span>
    </div>
    <aside class="storyTutorialCoach" data-tutorial-coach hidden aria-live="polite">
      <header><small>STEP <b data-tutorial-step>1</b> OF ${TOTAL_STEPS}</small><span data-tutorial-state>DO THIS NOW</span></header>
      <h2 data-tutorial-action>MOVE AROUND</h2>
      <div class="storyTutorialKeys" data-tutorial-keys></div>
      <p data-tutorial-instruction></p>
      <div class="storyTutorialChecklist" data-tutorial-checklist></div>
      <div class="storyTutorialProgress"><i data-tutorial-progress></i></div>
      <small class="storyTutorialHint" data-tutorial-hint>Complete every item to continue automatically.</small>
    </aside>
    <div class="storyManualOverlay" data-combat-manual hidden>
      <article class="storyManualCard">
        <header><div><small>THE SAGE'S COMBAT MANUAL</small><h2>BACK IN FIGHTING SHAPE</h2></div><strong>TOURNAMENT PREP</strong></header>
        <div class="manualGrid" data-manual-grid></div>
        <div class="storyManualActions"><button type="button" class="primary" data-begin-tutorial>BEGIN GUIDED REFRESHER</button><button type="button" data-resume-tutorial hidden>RESUME CHECKPOINT</button><button type="button" data-quick-tutorial>QUICK REFRESHER</button><button type="button" data-exit-manual>RETURN TO RRVVFO ROUTE</button></div>
      </article>
    </div>
    <div class="storyCompleteOverlay" data-mission-complete hidden>
      <article class="storyCompleteCard"><small>CHECKPOINT COMPLETE</small><h2>NO MAXIMUMS</h2><p>Combat Manual unlocked. Lens of Truth refreshed. Tournament entry unlocked.</p><button type="button" class="primary" data-return-story>TAKE THE TOURNAMENT ROAD</button></article>
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
    this.coach=this.root.querySelector('[data-tutorial-coach]');
    this.coachStep=this.root.querySelector('[data-tutorial-step]');
    this.coachState=this.root.querySelector('[data-tutorial-state]');
    this.coachAction=this.root.querySelector('[data-tutorial-action]');
    this.coachKeys=this.root.querySelector('[data-tutorial-keys]');
    this.coachInstruction=this.root.querySelector('[data-tutorial-instruction]');
    this.coachChecklist=this.root.querySelector('[data-tutorial-checklist]');
    this.coachProgress=this.root.querySelector('[data-tutorial-progress]');
    this.coachHint=this.root.querySelector('[data-tutorial-hint]');
    this.root.querySelector('[data-begin-tutorial]').addEventListener('click',()=>this.beginTutorial('movement'));
    this.root.querySelector('[data-resume-tutorial]').addEventListener('click',()=>this.beginTutorial(this.savedTutorialCheckpoint()));
    this.root.querySelector('[data-quick-tutorial]').addEventListener('click',()=>this.beginQuickRefresher());
    this.root.querySelector('[data-exit-manual]').addEventListener('click',()=>this.requestExit());
    this.root.querySelector('[data-return-story]').addEventListener('click',()=>this.exitToStory());
    this.phase='opening';
    this.progress=loadLostYearProgress();
    this.flags={move:false,jump:false,dash:false,light:false,heavy:false,launcher:false,parry:false,grab:false,charge:false,fire:false,shots:false,swap:false,lens:false,lensRead:false};
    this.finalHits=0;
    this.sageAttackTimer=.8;
    this.parryAttempts=0;
    this.lensTrialActive=false;
    this.lensTrialTimer=0;
    this.lensTrialHp=100;
    this.lastProgressAt=performance.now();
    this.lastHintAt=0;
    this.movementDistance=0;
    this.previousPlayerPos=null;
    this.lastObservedAttack='';
    this.lastInputDevice='';
    this.grabHintUntil=0;
    this.aborted=false;
  }

  start(){
    this.battle=createStoryBattle({stageId:'training-field',opponent:{id:'sage',name:'The Sage',accent:'#d9e7f3',cpu:true,appearance:'down'}});
    this.engine=attachStoryEngine(this.battle,{
      chapterLabel:'RRVVFO CHAPTER 1',
      stageName:'SAGE TRAINING FIELD',
      rootClasses:['storyMission1'],
      getMode:()=>this.engine?.dialogue?'dialogue':this.phase==='complete'?'complete':'tutorial'
    });
    this.patchBattle();
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','THE SAGE']});
    this.baseRestart=this.battle.restart.bind(this.battle);
    this.battle.restart=()=>{this.baseRestart();this.resetTutorialFlow()};
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART REFRESHER?',message:'Restart from the most recent saved tutorial checkpoint?',confirmLabel:'RESTART'});
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' CHAPTER 1 • GUIDED COMBAT REFRESHER';
    this.battle.fighters[0].maxHp=100;this.battle.fighters[0].hp=100;
    this.battle.fighters[1].maxHp=100;this.battle.fighters[1].hp=100;
    this.renderManual();
    this.showOpeningDialogue();
    return this;
  }

  resetTutorialFlow(){
    this.engine?.closeDialogue();
    this.phase='opening';
    for(const key of Object.keys(this.flags))this.flags[key]=false;
    this.finalHits=0;
    this.sageAttackTimer=.8;
    this.parryAttempts=0;
    this.lensTrialActive=false;
    this.lensTrialTimer=0;
    this.lastProgressAt=performance.now();
    this.lastHintAt=0;
    this.movementDistance=0;
    this.previousPlayerPos=null;
    this.lastObservedAttack='';
    this.lastInputDevice='';
    this.grabHintUntil=0;
    this.root.classList.remove('tutorialActive');
    this.battle?.root?.classList.remove('tutorialHudActive','tutorialShowEnergy','tutorialShowGuard','tutorialShowHotbar','tutorialShowOpponent');
    this.engine?.clearHotbarAvailability();
    this.manual.hidden=true;
    this.completePanel.hidden=true;
    this.coach.hidden=true;
    this.coach.classList.remove('urgent','needsAttention','isComplete');
    const player=this.battle.fighters[0],sage=this.battle.fighters[1];
    player.maxHp=100;player.hp=100;player.en=100;player.guard=100;
    sage.maxHp=100;sage.hp=100;sage.en=100;sage.guard=100;
    this.battle.phase='story';this.battle.time=9999;this.battle.hideBanner();
    this.setObjective('WAIT FOR THE SAGE','The refresher begins after the briefing.');
    this.showOpeningDialogue();
  }

  controls(){
    const map=CONTROL_MAPS[0];
    return{jump:map.j,light:map.a,heavy:map.h,launcher:map.x,dash:map.d,block:map.b,charge:map.k,grab:map.s};
  }

  patchBattle(){
    const battle=this.battle;
    this.engine.useChapterProfile({
      hud:next=>{
        next();
        const show=['abilities','shotsCharge','shotsReady','lensCharge','lensReady','lensPractice','final'].includes(this.phase);
        this.engine.setHotbarAvailability(this.allowedAbilitySlots(),{show});
      },
      input:next=>{
        const command=next();
        this.observeInputDevice();
        if(this.phase==='basics'&&command.grab&&!this.flags.grab){
          const player=battle.fighters[0],sage=battle.fighters[1];
          const dx=sage.x-player.x,dz=sage.z-player.z,distance=Math.max(.001,Math.hypot(dx,dz));
          if(distance<=112){
            // The refresher is intentionally forgiving: once the player is close,
            // stabilize the training dummy and place it inside the real 74-unit
            // grab range before ArenaBattle resolves the shared Grab action.
            const nx=dx/distance,nz=dz/distance;
            sage.x=player.x+nx*Math.min(64,distance);
            sage.z=player.z+nz*Math.min(64,distance);
            sage.y=0;sage.vy=0;sage.grounded=true;sage.inv=0;
            sage.stun=0;sage.knockdown=0;sage.kvx=0;sage.kvz=0;
          }else{
            this.grabHintUntil=performance.now()+1500;
            battle.notice('MOVE CLOSER • GRAB ONLY WORKS AT CLOSE RANGE',1.35);
          }
        }
        return command;
      },
      cpu:(_next,fighter,foe,dt)=>{
        this.sageAttackTimer-=dt;
        const dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.max(1,Math.hypot(dx,dz));
        let x=0,z=0,light=false,block=false;
        const attackLesson=this.phase==='parry'||this.phase==='lensPractice';
        if(attackLesson){
          if(distance>118){x=dx/distance*.55;z=dz/distance*.55}
          else if(this.sageAttackTimer<=0){
            light=true;
            this.sageAttackTimer=this.phase==='parry'?1.45:1.1;
            if(this.phase==='parry')this.parryAttempts++;
            if(this.phase==='lensPractice'){
              this.lensTrialActive=true;
              this.lensTrialTimer=1.05;
              this.lensTrialHp=foe.hp;
            }
          }
        }else if(this.phase==='final'){
          if(distance>145){x=dx/distance*.42;z=dz/distance*.42}
          else if(this.sageAttackTimer<=0){light=true;this.sageAttackTimer=1.05}
          if(foe.attackState&&distance<150)block=Math.random()<.35;
        }else if(this.phase==='basics'){
          const desired=this.flags.grab?96:62;
          if(distance>desired+5){
            const speed=this.flags.grab?.2:.42;
            x=dx/distance*speed;z=dz/distance*speed;
          }
        }
        return{x,z,jump:false,light,heavy:false,launcher:false,dash:false,block,charge:false,grab:false,special:false};
      },
      castAbility:(next,slot)=>{
        const allowed=this.allowedAbilitySlots();
        if(!allowed.includes(Number(slot))){
          battle.notice(slot===5?'SOLAR WEAVE IS NOT PART OF THIS REFRESHER':'LEARN THIS TECHNIQUE IN A LATER STEP',1.5);
          return false;
        }
        const worked=next(slot);
        if(worked)this.markAbility(slot);
        return worked;
      },
      applyDamage:(next,attacker,target,damage,meta={})=>{
        const wasBlocking=target.block;
        const wasPerfect=wasBlocking&&target.blockAge<=.12;
        const connected=next(attacker,target,damage,meta);
        if(attacker.id==='rrvvfo'&&target.id==='sage'&&meta.kind==='grab'&&connected&&this.phase==='basics'&&!this.flags.grab){
          this.flags.grab=true;this.markProgress();this.updateCoach();
        }
        if(attacker.id==='sage'&&target.id==='rrvvfo'&&wasPerfect&&connected){
          if(this.phase==='parry'){
            this.flags.parry=true;this.markProgress();this.updateCoach();
            setTimeout(()=>{if(!this.aborted&&this.phase==='parry')this.startResourceLesson()},420);
          }else if(this.phase==='lensPractice'){
            this.flags.lensRead=true;this.markProgress();this.updateCoach();
            setTimeout(()=>{if(!this.aborted&&this.phase==='lensPractice')this.startFinalSpar()},420);
          }
        }
        if(attacker.id==='rrvvfo'&&target.id==='sage'&&connected&&!wasBlocking&&this.phase==='final'){
          this.finalHits++;this.markProgress();this.updateCoach();
          if(this.finalHits>=3)this.finishTutorial();
        }
        target.hp=Math.max(1,target.hp);
        return connected;
      },
      update:(next,dt)=>{
        const playerBefore=battle.fighters[0];
        const before={x:playerBefore.x,z:playerBefore.z,en:playerBefore.en};
        next(dt);
        if(!battle.active||this.aborted)return;
        const player=battle.fighters[0],sage=battle.fighters[1];
        player.hp=Math.max(1,player.hp);sage.hp=Math.max(1,sage.hp);
        this.observeGameplayState(player,before);
        if(this.phase==='movement'&&this.flags.move&&this.flags.jump&&this.flags.dash)this.startBasics();
        if(this.phase==='basics'&&this.flags.light&&this.flags.heavy&&this.flags.launcher&&this.flags.grab)this.startParryLesson();
        if(this.phase==='resource'&&this.flags.charge&&player.en>=75)this.startAbilities();
        if(this.phase==='shotsCharge'&&player.en>=100){
          this.phase='shotsReady';
          this.setObjective('FULL-ENERGY TECHNIQUE','Energy is full. Use slot 2: Shots of Agony. It consumes the entire meter.');
          this.updateCoach();this.syncTutorialHud();
          battle.notice(`${this.engine.prompt('ability2','PRESS 2')} • SHOTS OF AGONY • ALL ENERGY`,2);
        }
        if(this.phase==='lensCharge'&&player.en>=60){
          this.phase='lensReady';
          this.setObjective('RISKY PREDICTION','Energy is at 60. Use slot 4: Lens of Truth. It costs 25 HP.');
          this.updateCoach();this.syncTutorialHud();
          battle.notice(`${this.engine.prompt('ability4','PRESS 4')} • LENS OF TRUTH • 60 ENERGY / 25 HP`,2.2);
        }
        if(this.phase==='lensPractice'&&this.lensTrialActive){
          this.lensTrialTimer-=dt;
          if(this.lensTrialTimer<=0){
            this.lensTrialActive=false;
            if(player.hp>=this.lensTrialHp&&!player.lensWasHit){
              this.flags.lensRead=true;this.markProgress();this.updateCoach();
              setTimeout(()=>{if(!this.aborted&&this.phase==='lensPractice')this.startFinalSpar()},350);
            }else{
              battle.notice('THE READ FAILED • FOLLOW THE PREDICTION AND DODGE OR PARRY',1.8);
              this.coachState.textContent='TRY AGAIN';
            }
          }
        }
        if(['abilities','shotsReady','lensReady'].includes(this.phase)){
          for(const key of ['fireBlast','shotsOfAgony','objectSwap','lensOfTruth'])player.cooldowns[key]=Math.min(player.cooldowns[key],.2);
        }
        this.updateLiveCoach();this.showInactivityHint();
      },
      exit:async next=>{
        const leave=await storyConfirm({title:'RETURN TO STORY?',message:'Leave the refresher? Your latest tutorial checkpoint will remain saved.',confirmLabel:'LEAVE TRAINING'});
        if(!leave)return;
        next();this.cleanup();this.onExit();
      }
    });
  }

  showOpeningDialogue(){
    this.engine.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I signed you up for this tournament. I heard there’d be some nice ladies there.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Oh, I was about to praise you for once. Now I know your motive, perv.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'HEY! DON’T CALL ME THAT!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I’ll be winning. I’m the one who defeated Perfected Revvfo.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You’ve gotten cocky. You’ll lose for sure if you keep that up.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'So what?',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I’d rather not teach you with words. It’d go in one ear and out the other. So here’s a manual.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'As if I’d need it.',tail:'down'}
    ],{onComplete:()=>this.showManual()});
  }

  renderManual(){
    const a=this.controls();
    const prompt=(action,keyboard)=>this.engine?.prompt(action,keyboard)||keyboard;
    const ability=slot=>prompt(`ability${slot}`,`SLOT ${slot}`);
    this.root.querySelector('[data-manual-grid]').innerHTML=`
      <section><h3>MOVEMENT</h3><dl><div><dt>Move</dt><dd>${prompt('move','W A S D')}</dd></div><div><dt>Jump</dt><dd>${prompt('jump',controlLabel(a.jump))}</dd></div><div><dt>Dash</dt><dd>${prompt('dash',`${controlLabel(a.dash)} / DOUBLE-TAP`)}</dd></div></dl></section>
      <section><h3>BASIC COMBAT</h3><dl><div><dt>Light</dt><dd>${prompt('light',`${controlLabel(a.light)} / MOUSE 1`)}</dd></div><div><dt>Heavy</dt><dd>${prompt('heavy',controlLabel(a.heavy))}</dd></div><div><dt>Launcher</dt><dd>${prompt('launcher',controlLabel(a.launcher))}</dd></div><div><dt>Timed Guard</dt><dd>${prompt('block',`${controlLabel(a.block)} / MOUSE 2`)}</dd></div><div><dt>Grab</dt><dd>${prompt('grab',controlLabel(a.grab))}</dd></div></dl></section>
      <section><h3>KINETIC COMBAT</h3><dl><div><dt>Pursuit route</dt><dd>LAUNCHER → ${prompt('dash',controlLabel(a.dash))} → LIGHT → HEAVY</dd></div><div><dt>Attack ready</dt><dd>BUFFER LIGHT OR HEAVY WHEN THE PURSUIT PROMPT PULSES</dd></div><div><dt>Pursuit Tech</dt><dd>SPEND 15 ENERGY AND DASH WHILE BEING CHASED</dd></div></dl></section>
      <section><h3>RESOURCE CONTROL</h3><dl><div><dt>Charge</dt><dd>${prompt('charge',controlLabel(a.charge))} • STAND STILL</dd></div><div><dt>Attack gain</dt><dd>CLEAN HITS RESTORE ENERGY</dd></div><div><dt>Guard recovery</dt><dd>FASTER WHILE STANDING STILL</dd></div></dl></section>
      <section><h3>HOTBAR</h3><dl><div><dt>${ability(1)}</dt><dd>FIRE BLAST</dd></div><div><dt>${ability(2)}</dt><dd>SHOTS OF AGONY • ALL ENERGY</dd></div><div><dt>${ability(3)}</dt><dd>OBJECT SWAP</dd></div><div><dt>${ability(4)}</dt><dd>LENS • 60 ENERGY / 25 HP EARLY</dd></div><div><dt>${ability(5)}</dt><dd>SOLAR WEAVE • NOT USED HERE</dd></div></dl></section>
      <section><h3>HOW THE REFRESHER WORKS</h3><p>The large instruction card shows one task at a time. An action checks off only after the game confirms that it actually happened—not merely when a button is pressed.</p></section>
      <section><h3>SAGE'S NOTE</h3><p>Lens predicts the most probable attack. Successful reads build mastery. At full mastery it can auto-dodge only a few times—not forever.</p></section>`;
  }

  showManual(){
    grantCombatManual({pages:['movement','basic-combat','kinetic-combat','resource-control','advanced-defense','hotbar','lens-secrets']});
    this.manual.hidden=false;
    this.setObjective('READ THE COMBAT MANUAL','Choose Guided, Resume, or Quick Refresher.');
    const resume=this.root.querySelector('[data-resume-tutorial]'),checkpoint=this.savedTutorialCheckpoint();
    resume.hidden=checkpoint==='movement';
    if(!resume.hidden)resume.textContent=`RESUME • ${checkpoint.replace(/([A-Z])/g,' $1').toUpperCase()}`;
    (resume.hidden?this.root.querySelector('[data-begin-tutorial]'):resume).focus();
  }

  savedTutorialCheckpoint(){
    return loadLostYearProgress().chapter1TutorialCheckpoint||'movement';
  }

  saveTutorialCheckpoint(phase){
    const progress=loadLostYearProgress();
    saveLostYearProgress({...progress,chapter1TutorialCheckpoint:phase,lastCheckpoint:`rrvvfo-01-${phase}`});
  }

  beginQuickRefresher(){
    this.beginTutorial('abilities');
    this.battle.notice('QUICK REFRESHER • CORE TECHNIQUES AND FINAL SPAR',2.1);
  }

  beginTutorial(startPhase='movement'){
    this.manual.hidden=true;this.coach.hidden=false;this.root.classList.add('tutorialActive');
    for(const key of Object.keys(this.flags))this.flags[key]=false;
    this.finalHits=0;this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();
    const player=this.battle.fighters[0];player.hp=player.maxHp;player.en=45;player.guard=100;
    if(startPhase==='parry'){
      Object.assign(this.flags,{move:true,jump:true,dash:true,light:true,heavy:true,launcher:true,grab:true});
      this.phase='basics';this.startParryLesson();
    }else if(startPhase==='abilities'){
      Object.assign(this.flags,{move:true,jump:true,dash:true,light:true,heavy:true,launcher:true,grab:true,parry:true,charge:true});
      this.phase='resource';player.en=75;this.startAbilities();
    }else if(startPhase==='lensCharge'){
      Object.assign(this.flags,{move:true,jump:true,dash:true,light:true,heavy:true,launcher:true,grab:true,parry:true,charge:true,fire:true,swap:true,shots:true});
      this.phase='lensCharge';player.en=35;player.hp=player.maxHp;
      this.setObjective('STEP 7 • LENS OF TRUTH','Charge to 60 energy, press slot 4, then follow its prediction.');
      this.markProgress();this.updateCoach();this.syncTutorialHud();
    }else if(startPhase==='final'){
      Object.assign(this.flags,{move:true,jump:true,dash:true,light:true,heavy:true,launcher:true,grab:true,parry:true,charge:true,fire:true,swap:true,shots:true,lens:true,lensRead:true});
      this.phase='lensPractice';this.startFinalSpar();
    }else{
      this.phase='movement';this.movementDistance=0;this.previousPlayerPos={x:player.x,z:player.z};
      this.setObjective('STEP 1 • MOVEMENT','Move, jump, and dash. The checklist updates instantly.');
      this.markProgress();this.updateCoach();this.syncTutorialHud();this.saveTutorialCheckpoint('movement');
    }
    this.battle.notice('FOLLOW THE CURRENT STEP CARD',2.0);
  }

  observeInputDevice(){
    const input=this.engine?.activeInput()||'keyboard';
    if(input===this.lastInputDevice)return;
    this.lastInputDevice=input;
    if(!this.manual.hidden)this.renderManual();
    if(!this.coach.hidden)this.updateCoach();
  }

  observeGameplayState(player,before){
    let changed=false;
    this.observeInputDevice();
    if(this.phase==='movement'){
      this.movementDistance+=Math.hypot(player.x-before.x,player.z-before.z);
      if(this.movementDistance>=72&&!this.flags.move){this.flags.move=true;changed=true}
      if((player.y>5||Math.abs(player.vy||0)>80)&&!this.flags.jump){this.flags.jump=true;changed=true}
      if((player.dashTime>0||player.visualAction==='dash')&&!this.flags.dash){this.flags.dash=true;changed=true}
    }else if(this.phase==='basics'){
      const kind=player.attackState?.def?.kind||'';
      const signature=kind?`${kind}:${player.attackState?.elapsed?.toFixed?.(2)||''}`:'';
      if(kind&&signature!==this.lastObservedAttack){
        this.lastObservedAttack=signature;
        const key=kind.startsWith('light')||kind==='airLight'?'light':kind==='heavy'||kind==='airHeavy'?'heavy':kind==='launcher'?'launcher':'';
        if(key&&!this.flags[key]){this.flags[key]=true;changed=true}
      }
          }else if(['resource','shotsCharge','lensCharge'].includes(this.phase)){
      const stationary=Math.hypot(player.moveVX||0,player.moveVZ||0)<20;
      if(player.charging&&stationary&&player.en>before.en+.01&&!this.flags.charge){this.flags.charge=true;changed=true}
    }
    if(changed){this.markProgress();this.updateCoach()}
  }

  allowedAbilitySlots(){
    if(this.phase==='abilities')return[1,3];
    if(this.phase==='shotsReady')return[2];
    if(this.phase==='lensReady')return[4];
    if(this.phase==='final')return[1,2,3,4];
    return[];
  }

  syncTutorialHud(){
    const root=this.battle?.root;
    if(!root)return;
    const energyPhases=['resource','abilities','shotsCharge','shotsReady','lensCharge','lensReady','lensPractice','final'];
    const guardPhases=['parry','lensPractice','final'];
    const hotbarPhases=['abilities','shotsCharge','shotsReady','lensCharge','lensReady','lensPractice','final'];
    root.classList.add('tutorialHudActive');
    root.classList.toggle('tutorialShowEnergy',energyPhases.includes(this.phase));
    root.classList.toggle('tutorialShowGuard',guardPhases.includes(this.phase));
    root.classList.toggle('tutorialShowHotbar',hotbarPhases.includes(this.phase));
    root.classList.toggle('tutorialShowOpponent',['basics','parry','lensPractice','final'].includes(this.phase));
    this.engine?.setHotbarAvailability(this.allowedAbilitySlots(),{show:hotbarPhases.includes(this.phase)});
  }

  startBasics(){
    if(this.phase!=='movement')return;
    this.phase='basics';
    const player=this.battle.fighters[0],sage=this.battle.fighters[1];
    const facingX=Math.abs(player.aimX||0)>.01?player.aimX:1;
    const facingZ=Math.abs(player.aimZ||0)>.01?player.aimZ:0;
    sage.x=player.x+facingX*62;sage.z=player.z+facingZ*62;
    sage.y=0;sage.vy=0;sage.grounded=true;sage.inv=0;sage.stun=0;sage.knockdown=0;sage.kvx=0;sage.kvz=0;
    this.setObjective('STEP 2 • BASIC ATTACKS','Use one light, heavy, launcher, and close-range grab. Any order works.');
    this.markProgress();
    this.updateCoach();
    this.syncTutorialHud();
    this.battle.notice('PERFORM EACH ATTACK • THE ANIMATION MUST START',2);
  }

  startParryLesson(){
    if(this.phase!=='basics')return;
    this.phase='parry';
    this.saveTutorialCheckpoint('parry');
    this.sageAttackTimer=1.35;
    this.setObjective('STEP 3 • PERFECT PARRY','Wait for the red BLOCK NOW prompt, then tap guard as the Sage strikes.');
    this.markProgress();
    this.updateCoach();
    this.syncTutorialHud();
    this.battle.notice('DO NOT HOLD BLOCK • TAP IT AS THE HIT ARRIVES',2.3);
  }

  startResourceLesson(){
    this.phase='resource';
    const player=this.battle.fighters[0];
    player.en=20;
    this.flags.charge=false;
    this.setObjective('STEP 4 • ENERGY CONTROL','Stand still and hold CHARGE until the energy meter reaches 75.');
    this.markProgress();
    this.updateCoach();
    this.syncTutorialHud();
    this.battle.notice(`${this.engine.prompt('charge','HOLD CHARGE')} • STAND STILL`,2);
  }

  startAbilities(){
    if(this.phase!=='resource')return;
    this.phase='abilities';
    this.saveTutorialCheckpoint('abilities');
    this.setObjective('STEP 5 • CORE TECHNIQUES','Use Fire Blast in slot 1 and Object Swap in slot 3.');
    this.markProgress();
    this.updateCoach();
    this.syncTutorialHud();
    this.battle.notice(`${this.engine.prompt('ability1','SLOT 1')} • THEN ${this.engine.prompt('ability3','SLOT 3')}`,2);
  }

  markAbility(slot){
    if(slot===1&&this.phase==='abilities')this.flags.fire=true;
    if(slot===3&&this.phase==='abilities')this.flags.swap=true;
    if(this.phase==='abilities'){
      this.markProgress();
      this.updateCoach();
      if(this.flags.fire&&this.flags.swap){
        this.phase='shotsCharge';
        this.flags.charge=false;
        this.battle.fighters[0].en=Math.min(this.battle.fighters[0].en,35);
        this.setObjective('STEP 6 • SHOTS OF AGONY','Charge to 100 energy, then use slot 2. It consumes everything.');
        this.markProgress();
        this.updateCoach();
        this.syncTutorialHud();
        this.battle.notice(`CHARGE TO 100 • THEN ${this.engine.prompt('ability2','USE SLOT 2')}`,2);
      }
      return;
    }
    if(slot===2&&this.phase==='shotsReady'){
      this.flags.shots=true;
      this.phase='lensCharge';
      this.saveTutorialCheckpoint('lensCharge');
      const player=this.battle.fighters[0];
      player.en=35;player.hp=100;
      this.flags.charge=false;
      this.setObjective('STEP 7 • LENS OF TRUTH','Charge to 60 energy, press slot 4, then follow its prediction.');
      this.markProgress();
      this.updateCoach();
      this.syncTutorialHud();
      this.battle.notice('SHOTS USED ALL ENERGY • CHARGE TO 60',2.2);
      return;
    }
    if(slot===4&&this.phase==='lensReady'){
      this.flags.lens=true;
      this.phase='lensPractice';
      this.sageAttackTimer=.9;
      this.lensTrialActive=false;
      this.setObjective('STEP 7 • READ THE SAGE','Watch the Lens prediction. Dodge or perfect-parry the next strike.');
      this.markProgress();
      this.updateCoach();
      this.syncTutorialHud();
      this.battle.notice('READ THE PREDICTION • MOVE OR PARRY',2.2);
    }
  }

  startFinalSpar(){
    if(this.phase!=='lensPractice')return;
    this.phase='final';
    this.saveTutorialCheckpoint('final');
    this.finalHits=0;
    const player=this.battle.fighters[0];
    player.hp=100;player.en=Math.max(player.en,50);
    this.setObjective('STEP 8 • FINAL SPAR','Land three clean hits on the Sage using anything you relearned.');
    this.markProgress();
    this.updateCoach();
    this.syncTutorialHud();
    this.battle.notice('LAND 3 CLEAN HITS',2);
  }

  tutorialModel(){
    const a=this.controls(),player=this.battle?.fighters?.[0];
    const prompt=(action,keyboard)=>this.engine?.prompt(action,keyboard)||keyboard;
    const ability=slot=>prompt(`ability${slot}`,`SLOT ${slot}`);
    switch(this.phase){
      case'movement':return{step:1,title:'MOVE, JUMP, AND DASH',keys:[prompt('move','WASD'),prompt('jump',controlLabel(a.jump)),prompt('dash',controlLabel(a.dash))],instruction:`Travel around the field, leave the ground, and complete a real dash. Distance: ${Math.min(72,Math.round(this.movementDistance))} / 72.`,items:[['MOVE 72 UNITS',this.flags.move],['LEAVE THE GROUND',this.flags.jump],['COMPLETE A DASH',this.flags.dash]]};
      case'basics':{
        const sage=this.battle?.fighters?.[1];
        const distance=player&&sage?Math.round(Math.hypot(sage.x-player.x,sage.z-player.z)):0;
        const needsCloser=!this.flags.grab&&distance>82;
        return{step:2,title:'PERFORM EVERY BASIC ATTACK',keys:[prompt('light',controlLabel(a.light)),prompt('heavy',controlLabel(a.heavy)),prompt('launcher',controlLabel(a.launcher)),prompt('grab',controlLabel(a.grab))],instruction:needsCloser?`Move closer to the Sage, then press Grab. Distance: ${distance} — grab range is close.`:'Light, Heavy, and Launcher count when their animation begins. Grab counts only when it connects at close range.',items:[['LIGHT ATTACK',this.flags.light],['HEAVY ATTACK',this.flags.heavy],['LAUNCHER',this.flags.launcher],['CLOSE-RANGE GRAB',this.flags.grab]]};
      }
      case'parry':return{step:3,title:'PERFECT-PARRY THE SAGE',keys:[prompt('block',`${controlLabel(a.block)} / MOUSE 2`)],instruction:'Tap block only when BLOCK NOW appears. Holding too early will not count.',items:[['PERFECT PARRY',this.flags.parry]]};
      case'resource':return{step:4,title:'CHARGE ENERGY TO 75',keys:[prompt('charge',controlLabel(a.charge)),'STAND STILL'],instruction:`Hold charge without moving. Current energy: ${Math.round(player?.en||0)} / 75.`,items:[['ENERGY IS RISING',this.flags.charge],['75 ENERGY',(player?.en||0)>=75]]};
      case'abilities':return{step:5,title:'USE YOUR CORE TECHNIQUES',keys:[`${ability(1)} • FIRE BLAST`,`${ability(3)} • OBJECT SWAP`],instruction:'Only slots 1 and 3 are unlocked for this lesson.',items:[['FIRE BLAST',this.flags.fire],['OBJECT SWAP',this.flags.swap]]};
      case'shotsCharge':return{step:6,title:'CHARGE TO FULL ENERGY',keys:[prompt('charge',controlLabel(a.charge)),'100 ENERGY'],instruction:`Shots of Agony needs the full meter. Current energy: ${Math.round(player?.en||0)} / 100.`,items:[['100 ENERGY',(player?.en||0)>=100],['USE SHOTS',false]]};
      case'shotsReady':return{step:6,title:'USE SHOTS OF AGONY',keys:[`${ability(2)} • SHOTS OF AGONY`,'ALL ENERGY'],instruction:'Use the highlighted slot. The move consumes the full energy meter.',items:[['100 ENERGY',true],['SHOTS ACTIVATED',this.flags.shots]]};
      case'lensCharge':return{step:7,title:'PREPARE LENS OF TRUTH',keys:[prompt('charge',controlLabel(a.charge)),'60 ENERGY'],instruction:`Charge back to 60. Current energy: ${Math.round(player?.en||0)} / 60.`,items:[['60 ENERGY',(player?.en||0)>=60],['ACTIVATE LENS',false],['FOLLOW PREDICTION',false]]};
      case'lensReady':return{step:7,title:'ACTIVATE LENS OF TRUTH',keys:[`${ability(4)} • LENS`,'60 ENERGY','25 HP'],instruction:'Use the highlighted slot, then react to the predicted Sage attack.',items:[['60 ENERGY',true],['LENS ACTIVATED',this.flags.lens],['FOLLOW PREDICTION',this.flags.lensRead]]};
      case'lensPractice':return{step:7,title:'FOLLOW THE PREDICTION',keys:[prompt('block',controlLabel(a.block)),'DODGE'],instruction:'The Lens names the probable attack. Avoid or perfect-parry the next strike.',items:[['LENS ACTIVE',this.flags.lens],['SUCCESSFUL READ',this.flags.lensRead]]};
      case'final':return{step:8,title:'LAND THREE CLEAN HITS',keys:['ANY UNLOCKED ATTACK'],instruction:`Blocked attacks do not count. Clean hits: ${this.finalHits} / 3.`,items:[['HIT 1',this.finalHits>=1],['HIT 2',this.finalHits>=2],['HIT 3',this.finalHits>=3]]};
      default:return{step:1,title:'WAIT FOR THE REFRESHER',keys:[],instruction:'The Sage is still explaining the lesson.',items:[]};
    }
  }

  updateCoach(){
    if(this.coach.hidden||this.phase==='complete')return;
    const model=this.tutorialModel();
    this.coachStep.textContent=String(model.step);
    this.coachAction.textContent=model.title;
    this.coachInstruction.textContent=model.instruction;
    this.coachKeys.innerHTML=model.keys.map(key=>`<kbd>${key}</kbd>`).join('');
    const complete=model.items.filter(([,done])=>done).length,total=Math.max(1,model.items.length);
    const visible=model.items.filter(([,done])=>!done);
    this.coachChecklist.innerHTML=`${complete?`<span class="done summary"><b>✓</b>${complete} COMPLETE</span>`:''}${visible.slice(0,3).map(([label])=>`<span><b>○</b>${label}</span>`).join('')}`;
    this.coachProgress.style.width=`${Math.round(complete/total*100)}%`;
    this.coachState.textContent=complete===total&&model.items.length?'COMPLETE':'DO THIS NOW';
    this.coach.classList.toggle('isComplete',complete===total&&model.items.length>0);
    this.syncTutorialHud();
    this.highlightTargets();
  }

  updateLiveCoach(){
    if(['basics','resource','shotsCharge','lensCharge','final','parry','lensPractice'].includes(this.phase))this.updateCoach();
    if(this.phase==='basics'&&!this.flags.grab){
      const player=this.battle?.fighters?.[0],sage=this.battle?.fighters?.[1];
      const distance=player&&sage?Math.hypot(sage.x-player.x,sage.z-player.z):0;
      if(distance>82||performance.now()<this.grabHintUntil){
        this.coachState.textContent='MOVE CLOSER';
        this.coach.classList.toggle('urgent',distance>112);
      }else this.coach.classList.remove('urgent');
    }else if(this.phase==='parry'){
      const ready=this.sageAttackTimer<=.32;
      this.coachState.textContent=ready?'BLOCK NOW':'WAIT FOR ATTACK';
      this.coach.classList.toggle('urgent',ready);
    }else if(this.phase==='lensPractice'){
      const ready=this.sageAttackTimer<=.32;
      this.coachState.textContent=ready?'REACT NOW':'READ PREDICTION';
      this.coach.classList.toggle('urgent',ready);
    }else this.coach.classList.remove('urgent');
  }

  highlightTargets(){
    this.battle.root.querySelectorAll('[data-arena-slot]').forEach(button=>button.classList.remove('tutorialTarget'));
    let slot=0;
    if(this.phase==='abilities')slot=this.flags.fire?3:1;
    else if(this.phase==='shotsReady')slot=2;
    else if(this.phase==='lensReady')slot=4;
    if(slot)this.battle.root.querySelector(`[data-arena-slot="${slot}"]`)?.classList.add('tutorialTarget');
  }

  markProgress(){this.lastProgressAt=performance.now();this.coach.classList.remove('needsAttention')}

  showInactivityHint(){
    if(this.coach.hidden||this.phase==='complete'||this.engine?.dialogue)return;
    const now=performance.now();
    if(now-this.lastProgressAt<4500||now-this.lastHintAt<4300)return;
    this.lastHintAt=now;
    this.coach.classList.add('needsAttention');
    const model=this.tutorialModel();
    this.battle.notice(`DO THIS NOW: ${model.title}`,2.2);
    this.coachHint.textContent='Still stuck? Follow the large control labels above. The step advances automatically.';
  }

  finishTutorial(){
    if(this.phase==='complete')return;
    this.phase='complete';
    this.coach.hidden=true;
    this.root.classList.remove('tutorialActive');
    this.battle.root.classList.remove('tutorialHudActive','tutorialShowEnergy','tutorialShowGuard','tutorialShowHotbar','tutorialShowOpponent');
    this.engine?.clearHotbarAvailability();
    this.battle.phase='story';
    this.setObjective('TRAINING COMPLETE','The tournament entry is ready.');
    this.engine.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'You’re too prideful. You’ll probably lose. Maybe it’ll be a reality check.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'As if. You’re just trying to put me down.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'I’d be on my guard if I were you.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I defeated Revvfo. No one has a feat anywhere near that.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Heh. I have—many times. If only you’d care to listen to my stories.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah, no.',tail:'down'}
    ],{onComplete:()=>this.commitCompletion()});
  }

  commitCompletion(){
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=[...new Set([...(progress.unlocks||[]),'combatManual','lensOfTruthRefreshed','tournamentEntry'])];
    saveLostYearProgress({...progress,completedMissions,unlocks,chapter1TutorialCheckpoint:'complete'});
    this.onComplete();
    this.completePanel.hidden=false;
    this.root.querySelector('[data-return-story]').focus();
  }

  setObjective(title,detail){this.objective.textContent=title;this.detail.textContent=detail}

  async requestExit(){
    if(await storyConfirm({title:'RETURN TO STORY?',message:'Leave the refresher? Your latest tutorial checkpoint will remain saved.',confirmLabel:'LEAVE TRAINING'}))this.exitToStory();
  }

  exitToStory(){
    this.battle?.stopMatch();
    this.battle?.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    this.aborted=true;
    this.root.classList.remove('tutorialActive');
    this.battle?.root?.classList.remove('tutorialHudActive','tutorialShowEnergy','tutorialShowGuard','tutorialShowHotbar','tutorialShowOpponent');
    this.engine?.clearHotbarAvailability();
    destroyStoryBattle(this.battle);
    this.root.remove();
    activeMission=null;
  }
}

export function startRrvvfoMission1(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoMission1(options);
  return activeMission.start();
}

export {RrvvfoMission1};
