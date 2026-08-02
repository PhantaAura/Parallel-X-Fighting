import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {storyConfirm} from './story-ux.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {storyPromptLabel} from './story-rpg-ui.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {masterFieldSkill,recordFieldSkillTrial} from './field-skills.js?v=29a4071-chapter3-sabotage-investigation-20260802';

const MISSION_ID='rrvvfo-00';
const UI_ID='rrvvfoMission0UI';
const SWAP_MARKERS=Object.freeze([
  Object.freeze({x:-230,z:-120,label:'LOW ANCHOR'}),
  Object.freeze({x:245,z:135,label:'HIGH ANCHOR'}),
  Object.freeze({x:35,z:-235,label:'FINAL ANCHOR'})
]);
let activeMission=null;

function installMissionUI(){
  document.getElementById(UI_ID)?.remove();
  document.getElementById('rrvvfoMission0Styles')?.remove();
  const style=document.createElement('style');
  style.id='rrvvfoMission0Styles';
  style.textContent=`
#arenaModeScreen.storyMission0 .arenaAbility:not([data-arena-slot="3"]){opacity:.2;filter:grayscale(1);pointer-events:none}
#arenaModeScreen.storyMission0 [data-change-arena],#arenaModeScreen.storyMission0 [data-rematch]{display:none}
#arenaModeScreen.storyMission0.storyDialogueOpen .top,#arenaModeScreen.storyMission0.storyDialogueOpen .badge,#arenaModeScreen.storyMission0.storyDialogueOpen .arenaHotbar,#arenaModeScreen.storyMission0.storyDialogueOpen .bottom,#arenaModeScreen.storyMission0.storyDialogueOpen .arenaNotice{opacity:0;pointer-events:none}
#${UI_ID}{position:fixed;inset:0;z-index:1700;pointer-events:none;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
#${UI_ID}.hidden{display:none}#${UI_ID} *{box-sizing:border-box}
#${UI_ID} .missionTag{position:absolute;left:18px;top:112px;max-width:min(440px,calc(100vw - 36px));padding:10px 14px;border:2px solid #ffffff42;border-left:6px solid #ffd079;border-radius:8px;background:#07101be8;box-shadow:0 10px 34px #0008;transition:opacity .15s}
#${UI_ID} .missionTag.dialogueHidden{opacity:0}
#${UI_ID} .missionTag small{display:block;color:#ffd98e;font-size:10px;font-weight:1000;letter-spacing:.14em}
#${UI_ID} .missionTag strong{display:block;margin-top:3px;font-size:16px;line-height:1.18}
#${UI_ID} .missionTag span{display:block;margin-top:5px;color:#d4e5f1;font-size:11px;font-weight:850;letter-spacing:.04em}
#${UI_ID} .complete{position:absolute;inset:0;display:grid;place-items:center;padding:20px;background:#02050bdc;pointer-events:auto}
#${UI_ID} .complete.hidden{display:none}
#${UI_ID} .completeCard{width:min(650px,100%);padding:25px;border:2px solid #ffffff45;border-radius:16px;background:radial-gradient(circle at 50% 0,#563f17,#090d16 72%);box-shadow:0 25px 90px #000d;text-align:center}
#${UI_ID} .completeCard small{color:#ffd98e;font-size:11px;font-weight:1000;letter-spacing:.16em}
#${UI_ID} .completeCard h2{margin:6px 0 3px;font-size:42px;font-style:italic}
#${UI_ID} .completeCard p{color:#d0d8e5;line-height:1.5}
#${UI_ID} .rewards{display:grid;gap:8px;margin:18px 0;text-align:left}
#${UI_ID} .reward{padding:10px 12px;border:1px solid #ffffff25;border-radius:9px;background:#ffffff09;font-weight:900}
#${UI_ID} .reward b{color:#ffd98e}
#${UI_ID} .complete button{pointer-events:auto;border:2px solid #ffe2a6;border-radius:8px;background:#76521c;color:#fff;padding:11px 17px;font-weight:1000;letter-spacing:.06em;cursor:pointer}
@media(max-width:620px){#${UI_ID} .missionTag{top:128px}#${UI_ID} .completeCard h2{font-size:32px}}
`;
  document.head.appendChild(style);
  const root=document.createElement('section');
  root.id=UI_ID;
  root.className='hidden';
  root.innerHTML=`
    <div class="missionTag" data-m0-tag><small>RRVVFO STORY • CHAPTER 1 • FIELD TRIAL</small><strong data-m0-objective>TRAINING HAS NOT STARTED</strong><span data-m0-detail>Learn to treat Object Swap as movement, not just a combat trick.</span></div>
    <div class="complete hidden" data-m0-complete><div class="completeCard"><small>FIELD TECHNIQUE MASTERED</small><h2>OBJECT SWAP • FIELD CONTROL</h2><p>Rrvvfo can turn placed objects into routes. The road ahead will stop spelling out every swap.</p><div class="rewards"><div class="reward"><b>MASTERED:</b> Object Swap • Field Control</div><div class="reward"><b>CHAPTER:</b> Training continues with the Combat Manual</div><div class="reward"><b>FIELD RULE:</b> If an object can reach it, Rrvvfo may be able to reach it too.</div></div><button type="button" data-m0-return>CONTINUE TRAINING</button></div></div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoMission0{
  constructor({onExit=()=>{},onComplete=()=>{}}={}){
    this.onExit=onExit;
    this.onComplete=onComplete;
    this.root=installMissionUI();
    this.completePanel=this.root.querySelector('[data-m0-complete]');
    this.objective=this.root.querySelector('[data-m0-objective]');
    this.detail=this.root.querySelector('[data-m0-detail]');
    this.markerIndex=0;
    this.completed=false;
    this.aborted=false;
    this.root.querySelector('[data-m0-return]').onclick=()=>this.exitToStory();
  }

  start(){
    this.battle=createStoryBattle({stageId:'training-field',opponent:{id:'sage',name:'The Sage',accent:'#d9e7f3',cpu:true,appearance:'down'}});
    this.engine=attachStoryEngine(this.battle,{
      chapterLabel:'RRVVFO CHAPTER 1',
      stageName:'SAGE TRAINING FIELD',
      rootClasses:['storyMission0'],
      getMode:()=>this.engine?.dialogue?'dialogue':this.completed?'complete':this.battle?.phase==='play'?'tutorial':'story'
    });
    this.patchBattle();
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','THE SAGE']});
    const badge=this.battle.root.querySelector('.badge');
    if(badge?.lastChild)badge.lastChild.textContent=' CHAPTER 1 • OBJECT SWAP FIELD TRIAL';
    this.baseRestart=this.battle.restart.bind(this.battle);
    this.battle.restart=async()=>{
      const restart=await storyConfirm({title:'RESTART FIELD TRIAL?',message:'Restart the Object Swap field trial from the opening?',confirmLabel:'RESTART'});
      if(!restart)return;
      this.baseRestart();this.resetMissionFlow();
    };
    this.resetMissionFlow();
    return this;
  }

  resetMissionFlow(){
    this.engine?.closeDialogue();
    this.markerIndex=0;
    this.completed=false;
    this.aborted=false;
    this.battle.phase='story';
    this.battle.phaseTime=0;
    this.battle.time=9999;
    this.battle.paused=false;
    this.battle.root.classList.remove('paused');
    this.battle.hideBanner();
    this.battle.clearCombatObjects?.();
    const[player,sage]=this.battle.fighters;
    player.maxHp=100;player.hp=100;player.en=100;player.x=-45;player.z=120;
    sage.maxHp=100;sage.hp=100;sage.en=100;sage.x=70;sage.z=20;
    this.configureHotbar();
    this.root.classList.remove('hidden');
    this.completePanel.classList.add('hidden');
    this.showOpeningDialogue();
  }

  patchBattle(){
    const battle=this.battle;
    const baseDrawStageIdentity=battle.drawStageIdentity.bind(battle);
    battle.drawStageIdentity=renderer=>{
      baseDrawStageIdentity(renderer);
      if(this.completed||battle.phase!=='play')return;
      const marker=SWAP_MARKERS[this.markerIndex];
      if(!marker)return;
      const pulse=1+Math.sin(performance.now()/115)*.12;
      renderer.disc({x:marker.x,y:7,z:marker.z,rx:46*pulse,rz:31*pulse,color:'#ffd079',alpha:.35});
      renderer.billboard({x:marker.x,y:76,z:marker.z,size:100*pulse,color:'#ffd079',alpha:.18});
      renderer.segment({x:marker.x,y:15,z:marker.z},{x:marker.x,y:125,z:marker.z},{width:5,height:3,color:'#fff0b8',alpha:.42,lit:false});
    };
    this.engine.useChapterProfile({
      cpu:()=>({x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,special:false}),
      castAbility:(_next,slot)=>this.castFieldSwap(slot),
      updateSpecials:(next,dt)=>{next(dt);const player=battle.fighters[0];player.en=100;player.cooldowns.objectSwap=0},
      applyDamage:()=>false,
      exit:async next=>{
        const leave=await storyConfirm({title:'RETURN TO STORY?',message:'Leave Chapter 1 field training? This trial will restart.',confirmLabel:'LEAVE TRAINING'});
        if(!leave)return;
        next();this.cleanup();this.onExit();
      }
    });
  }

  configureHotbar(){
    this.battle.root.querySelectorAll('[data-arena-slot]').forEach(button=>{
      const slot=Number(button.dataset.arenaSlot);
      if(slot!==3){button.setAttribute('aria-disabled','true');button.tabIndex=-1}
    });
    const swap=this.battle.root.querySelector('[data-arena-slot="3"]');
    if(swap){
      swap.removeAttribute('aria-disabled');swap.tabIndex=0;
      swap.querySelector('.arenaAbilityName').textContent='Object Swap • Field';
      swap.querySelector('.arenaCost').textContent='FIELD TRIAL';
    }
  }

  showOpeningDialogue(){
    this.engine.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Before you start throwing attacks around, prove you can move without a path.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'There is literally a path right there.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Then ignore it. See the glowing anchor? Swap to it. Three anchors. No walking between them.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'If an object can get somewhere, you can turn that into a route. Figure out the rest.',tail:'down'}
    ],{onComplete:()=>this.beginFieldTrial()});
  }

  beginFieldTrial(){
    this.battle.phase='play';
    this.battle.time=9999;
    this.battle.fighters[0].en=100;
    this.setObjective('OBJECT SWAP RELAY • 0 / 3',`${this.engine.prompt('ability3','PRESS 3')} • Swap to the glowing anchor. Walking into it does not count.`);
    this.battle.notice('FIELD TRIAL • OBJECT SWAP TO THE GLOWING ANCHOR',1.8);
  }

  castFieldSwap(slot){
    const battle=this.battle,player=battle.fighters[0],marker=SWAP_MARKERS[this.markerIndex];
    if(slot!==3){battle.notice('FIELD TRIAL • USE OBJECT SWAP');return false}
    if(battle.phase!=='play'||battle.paused||this.completed){battle.notice(battle.paused?'MISSION PAUSED':'WAIT FOR THE FIELD TRIAL');return false}
    if(!marker)return false;
    const oldX=player.x,oldZ=player.z;
    player.x=marker.x;player.z=marker.z;player.inv=.18;player.moveVX=player.moveVZ=0;player.visualAction='objectSwapDisappear';player.visualActionTime=.48;
    battle.burst(oldX,oldZ,'#ffd079',18,50);battle.burst(player.x,player.z,'#fff0b8',22,56);battle.audio?.play?.('signature',0,'rrvvfo');
    recordFieldSkillTrial('objectSwapField');
    this.markerIndex++;
    if(this.markerIndex>=SWAP_MARKERS.length){
      masterFieldSkill('objectSwapField',{chapter:1,source:'rrvvfo-00-field-trial'});
      this.completed=true;
      this.setObjective('FIELD CONTROL MASTERED','You used Object Swap as a route instead of an attack.');
      battle.notice('FIELD TECHNIQUE MASTERED • OBJECT SWAP',1.5);
      setTimeout(()=>{if(!this.aborted)this.finishMission()},450);
      return true;
    }
    this.setObjective(`OBJECT SWAP RELAY • ${this.markerIndex} / ${SWAP_MARKERS.length}`,'The next anchor moved the problem. Read the field and swap again.');
    battle.notice(`SWAP ${this.markerIndex} / ${SWAP_MARKERS.length} • NEXT ANCHOR`,.9);
    return true;
  }

  finishMission(){
    this.battle.phase='storyComplete';
    this.battle.hideBanner();
    this.engine.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'So if I can get something over there, I don’t need the path.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Exactly. Try remembering that when the road stops being convenient.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You could’ve just said that.',tail:'down'}
    ],{onComplete:()=>{
      this.commitCompletion();
      this.completePanel.classList.remove('hidden');
      this.root.querySelector('[data-m0-return]').focus();
    }});
  }

  commitCompletion(){
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=(Array.isArray(progress.unlocks)?progress.unlocks:[]).filter(id=>id!=='shotsOfAgony'&&id!=='shotsOfAgonyPrototype');
    saveLostYearProgress({...progress,completedMissions,unlocks});
    this.onComplete();
  }

  setObjective(title,detail){this.objective.textContent=title;this.detail.textContent=detail}

  exitToStory(){
    this.battle.stopMatch();
    this.battle.root.classList.add('hidden');
    this.cleanup();
    this.onExit();
  }

  cleanup(){
    this.aborted=true;
    destroyStoryBattle(this.battle);
    this.root.classList.add('hidden');
    this.completePanel.classList.add('hidden');
    this.battle?.root.querySelectorAll('[data-arena-slot]').forEach(button=>{button.tabIndex=0;button.removeAttribute('aria-disabled')});
    activeMission=null;
  }
}

export function startRrvvfoMission0(options={}){
  if(activeMission){activeMission.exitToStory()}
  activeMission=new RrvvfoMission0(options);
  return activeMission.start();
}

export {RrvvfoMission0};
