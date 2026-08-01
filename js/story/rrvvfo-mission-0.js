import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {clampToStage} from '../arena/arena-stages.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {storyConfirm} from './story-ux.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {storyPromptLabel} from './story-rpg-ui.js?v=29a363-chapter4-menu-state-recovery-20260801';

const MISSION_ID='rrvvfo-00';
const UI_ID='rrvvfoMission0UI';
let activeMission=null;

function installMissionUI(){
  document.getElementById(UI_ID)?.remove();
  document.getElementById('rrvvfoMission0Styles')?.remove();
  const style=document.createElement('style');
  style.id='rrvvfoMission0Styles';
  style.textContent=`
#arenaModeScreen.storyMission0 .arenaAbility:not([data-arena-slot="2"]){opacity:.2;filter:grayscale(1);pointer-events:none}
#arenaModeScreen.storyMission0 [data-change-arena],#arenaModeScreen.storyMission0 [data-rematch]{display:none}
#arenaModeScreen.storyMission0.storyDialogueOpen .top,#arenaModeScreen.storyMission0.storyDialogueOpen .badge,#arenaModeScreen.storyMission0.storyDialogueOpen .arenaHotbar,#arenaModeScreen.storyMission0.storyDialogueOpen .bottom,#arenaModeScreen.storyMission0.storyDialogueOpen .arenaNotice{opacity:0;pointer-events:none}
#${UI_ID}{position:fixed;inset:0;z-index:1700;pointer-events:none;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
#${UI_ID}.hidden{display:none}#${UI_ID} *{box-sizing:border-box}
#${UI_ID} .missionTag{position:absolute;left:18px;top:112px;max-width:min(440px,calc(100vw - 36px));padding:10px 14px;border:2px solid #ffffff42;border-left:6px solid #78c7ff;border-radius:8px;background:#07101be8;box-shadow:0 10px 34px #0008;transition:opacity .15s}
#${UI_ID} .missionTag.dialogueHidden{opacity:0}
#${UI_ID} .missionTag small{display:block;color:#8fd7ff;font-size:10px;font-weight:1000;letter-spacing:.14em}
#${UI_ID} .missionTag strong{display:block;margin-top:3px;font-size:16px;line-height:1.18}
#${UI_ID} .missionTag span{display:block;margin-top:5px;color:#d4e5f1;font-size:11px;font-weight:850;letter-spacing:.04em}
#${UI_ID} .dialogueWrap{position:absolute;inset:0;display:grid;align-items:end;padding:20px 20px 34px;background:linear-gradient(transparent 52%,#0000005e);pointer-events:auto}
#${UI_ID} .dialogueWrap.hidden{display:none}
#${UI_ID} .sonicDialogueBox{position:relative;display:grid;grid-template-columns:128px 1fr;gap:16px;align-items:stretch;width:min(980px,100%);min-height:138px;margin:0 auto;padding:10px 18px 10px 10px;border:5px solid #080808;border-radius:3px;background:#fff;color:#111;box-shadow:0 7px 0 #080808;text-align:left;cursor:pointer;pointer-events:auto}
#${UI_ID} .sonicDialogueBox:focus-visible{outline:4px solid #6bbcff;outline-offset:5px}
#${UI_ID} .dialoguePortrait{min-height:108px;border:4px solid #080808;background-color:#263550;background-image:url('./assets/fighters/sage/sage-atlas.webp');background-repeat:no-repeat;background-size:600% 600%;background-position:0 0;image-rendering:auto}
#${UI_ID} .dialogueWrap[data-speaker="RRVVFO"] .dialoguePortrait{background-color:#74251f;background-image:url('./assets/fighters/rrvvfo/rrvvfo-atlas.webp');background-size:900% 2000%}
#${UI_ID} .dialogueCopy{position:relative;min-width:0;padding:20px 42px 18px 2px}
#${UI_ID} .speakerTab{position:absolute;left:0;top:-30px;min-width:180px;padding:6px 13px;border:4px solid #080808;border-bottom:0;background:#20202b;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;font-weight:1000;letter-spacing:.08em;text-align:center}
#${UI_ID} .dialogueWrap[data-speaker="RRVVFO"] .speakerTab{background:#a52f27}
#${UI_ID} .dialogueText{min-height:74px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:20px;font-weight:800;line-height:1.45;white-space:pre-wrap}
#${UI_ID} .dialoguePrompt{position:absolute;right:7px;bottom:3px;color:#6c6c6c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;font-weight:900;letter-spacing:.06em}
#${UI_ID} .advanceArrow{position:absolute;right:10px;bottom:12px;width:0;height:0;border-top:12px solid transparent;border-bottom:12px solid transparent;border-left:18px solid #1689db;filter:drop-shadow(2px 2px 0 #080808);animation:m0Arrow .75s steps(2,end) infinite}
@keyframes m0Arrow{50%{transform:translateX(4px)}}
#${UI_ID} .complete{position:absolute;inset:0;display:grid;place-items:center;padding:20px;background:#02050bdc;pointer-events:auto}
#${UI_ID} .complete.hidden{display:none}
#${UI_ID} .completeCard{width:min(650px,100%);padding:25px;border:2px solid #ffffff45;border-radius:16px;background:radial-gradient(circle at 50% 0,#183c5d,#090d16 70%);box-shadow:0 25px 90px #000d;text-align:center}
#${UI_ID} .completeCard small{color:#8fd7ff;font-size:11px;font-weight:1000;letter-spacing:.16em}
#${UI_ID} .completeCard h2{margin:6px 0 3px;font-size:42px;font-style:italic}
#${UI_ID} .completeCard p{color:#d0d8e5;line-height:1.5}
#${UI_ID} .rewards{display:grid;gap:8px;margin:18px 0;text-align:left}
#${UI_ID} .reward{padding:10px 12px;border:1px solid #ffffff25;border-radius:9px;background:#ffffff09;font-weight:900}
#${UI_ID} .reward b{color:#86d8ff}
#${UI_ID} .complete button{pointer-events:auto;border:2px solid #bfe8ff;border-radius:8px;background:#1e5c8c;color:#fff;padding:11px 17px;font-weight:1000;letter-spacing:.06em;cursor:pointer}
@media(max-width:620px){#${UI_ID} .dialogueWrap{padding:12px 12px 26px}#${UI_ID} .sonicDialogueBox{grid-template-columns:84px 1fr;min-height:112px;padding:7px 10px 7px 7px;gap:10px}#${UI_ID} .dialoguePortrait{min-height:86px}#${UI_ID} .dialogueCopy{padding:17px 34px 13px 0}#${UI_ID} .speakerTab{top:-27px;min-width:130px;padding:5px 9px;font-size:11px}#${UI_ID} .dialogueText{min-height:58px;font-size:15px}#${UI_ID} .missionTag{top:128px}#${UI_ID} .completeCard h2{font-size:32px}}
`;
  document.head.appendChild(style);
  const root=document.createElement('section');
  root.id=UI_ID;
  root.className='hidden';
  root.innerHTML=`
    <div class="missionTag" data-m0-tag><small>RRVVFO STORY • CHAPTER 1 • TRAINING</small><strong data-m0-objective>TRAINING HAS NOT STARTED</strong><span data-m0-detail>Learn the technique that becomes Shots of Agony.</span></div>
    <div class="dialogueWrap hidden" data-m0-dialogue data-speaker="THE SAGE">
      <button type="button" class="sonicDialogueBox" data-m0-next aria-label="Advance dialogue">
        <span class="dialoguePortrait" aria-hidden="true"></span>
        <span class="dialogueCopy"><span class="speakerTab" data-m0-speaker>THE SAGE</span><span class="dialogueText" data-m0-text></span><span class="dialoguePrompt">${storyPromptLabel('confirm')} • CONTINUE</span><span class="advanceArrow" aria-hidden="true"></span></span>
      </button>
    </div>
    <div class="complete hidden" data-m0-complete><div class="completeCard"><small>CHECKPOINT COMPLETE</small><h2>NO MAXIMUMS</h2><p>Rrvvfo learned to coordinate four energy copies and caught the Sage outside his prediction window.</p><div class="rewards"><div class="reward"><b>UNLOCKED:</b> Shots of Agony</div><div class="reward"><b>CHAPTER:</b> Training continues with the Combat Manual</div><div class="reward"><b>STAGE:</b> Sage Training Field introduced</div></div><button type="button" data-m0-return>CONTINUE TRAINING</button></div></div>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoMission0{
  constructor({onExit=()=>{},onComplete=()=>{}}={}){
    this.onExit=onExit;
    this.onComplete=onComplete;
    this.root=installMissionUI();
    this.dialogue=this.root.querySelector('[data-m0-dialogue]');
    this.completePanel=this.root.querySelector('[data-m0-complete]');
    this.objective=this.root.querySelector('[data-m0-objective]');
    this.detail=this.root.querySelector('[data-m0-detail]');
    this.lines=[];
    this.lineIndex=0;
    this.typeTimer=null;
    this.typing=false;
    this.fullText='';
    this.normalDodges=0;
    this.mastery=1;
    this.openingSparSeconds=0;
    this.castSerial=0;
    this.handledCast=-1;
    this.activeVolleyCount=0;
    this.completed=false;
    this.aborted=false;
    this.finishDialogueMode=false;
    this.dodgeSide=1;
    this.sageAttackTimer=1.15;
    this.root.querySelector('[data-m0-next]').onclick=()=>this.advanceDialogue();
    this.root.querySelector('[data-m0-return]').onclick=()=>this.exitToStory();
    this.keyHandler=event=>{
      if(this.root.classList.contains('hidden')||this.dialogue.classList.contains('hidden'))return;
      if(event.key==='Enter'||event.key===' '){event.preventDefault();this.advanceDialogue();return}
      if(event.key==='Escape'){
        event.preventDefault();
        storyConfirm({title:'SKIP THIS CONVERSATION?',message:'Skipping advances the story to the next training phase.',confirmLabel:'SKIP'}).then(skip=>{if(skip&&!this.dialogue.classList.contains('hidden')){this.lineIndex=this.lines.length;this.advanceDialogue();}});
      }
    };
    document.addEventListener('keydown',this.keyHandler);
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
    if(badge?.lastChild)badge.lastChild.textContent=' CHAPTER 1 • SHOTS OF AGONY TRAINING';
    this.baseRestart=this.battle.restart.bind(this.battle);
    this.battle.restart=async()=>{
      const restart=await storyConfirm({title:'RESTART TRAINING?',message:'Restart Chapter 1 Part 1 from the opening dialogue?',confirmLabel:'RESTART'});
      if(!restart)return;
      this.baseRestart();this.resetMissionFlow();
    };
    this.resetMissionFlow();
    return this;
  }


  resetMissionFlow(){
    this.engine?.closeDialogue();
    this.hideDialogueLayer();
    this.normalDodges=0;
    this.mastery=1;
    this.castSerial=0;
    this.handledCast=-1;
    this.activeVolleyCount=0;
    this.completed=false;
    this.aborted=false;
    this.finishDialogueMode=false;
    this.sageAttackTimer=1.15;
    this.battle.phase='story';
    this.battle.phaseTime=0;
    this.battle.time=9999;
    this.battle.paused=false;
    this.battle.root.classList.remove('paused');
    this.battle.hideBanner();
    this.battle.projectiles=[];
    this.battle.agonyClones=[];
    this.battle.fighters[0].maxHp=100;
    this.battle.fighters[0].hp=100;
    this.battle.fighters[0].en=100;
    this.battle.fighters[1].maxHp=100;
    this.battle.fighters[1].hp=100;
    this.battle.fighters[1].en=100;
    this.configureHotbar();
    this.root.classList.remove('hidden');
    this.completePanel.classList.add('hidden');
    this.showOpeningDialogue();
  }

  patchBattle(){
    const battle=this.battle;
    battle.castRevvfoBlast=()=>false;
    this.engine.useChapterProfile({
      cpu:(_next,fighter,foe,dt)=>{
        this.sageAttackTimer-=dt;
        const dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.max(1,Math.hypot(dx,dz));
        const waitingOnVolley=battle.volleyActive(foe);
        let x=0,z=0,light=false;
        if(!waitingOnVolley&&distance>150){x=dx/distance*.42;z=dz/distance*.42}
        else if(!waitingOnVolley&&this.sageAttackTimer<=0&&distance<165){light=true;this.sageAttackTimer=1.1+Math.random()*.5}
        return{x,z,jump:false,light,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,special:false};
      },
      castAbility:(_next,slot)=>this.castTrainingAbility(slot),
      updateSpecials:(next,dt)=>{
        next(dt);
        if(!this.completed){
          const player=battle.fighters[0];
          player.en=100;
          if(player.cooldowns.shotsOfAgony>0)player.cooldowns.shotsOfAgony=Math.min(player.cooldowns.shotsOfAgony,.55);
        }
      },
      applyDamage:(next,attacker,target,damage,meta={})=>{
        if(this.completed)return false;
        if(target.id==='sage'){
          const isPlayerShot=attacker.id==='rrvvfo'&&meta.kind==='projectile';
          if(isPlayerShot&&this.activeVolleyCount>=4){
            const connected=next(attacker,target,Math.min(8,damage),meta);
            if(connected&&!this.completed){
              this.completed=true;
              setTimeout(()=>{if(!this.aborted)this.finishMission()},260);
            }
            return connected;
          }
          if(isPlayerShot){
            if(this.handledCast!==this.castSerial){
              this.handledCast=this.castSerial;
              this.sageDodge(attacker,target,true);
              setTimeout(()=>{if(!this.aborted)this.advanceMastery()},260);
            }
            return false;
          }
          this.sageDodge(attacker,target,false);
          this.normalDodges++;
          if(this.normalDodges>=1&&this.mastery===1)this.unlockShotsTraining();
          return false;
        }
        if(attacker.id==='sage'&&target.id==='rrvvfo'){
          const connected=next(attacker,target,Math.max(1,damage*.28),{...meta,knockback:Math.min(meta.knockback||28,38),stun:Math.min(meta.stun||.24,.18)});
          target.hp=Math.max(1,target.hp);
          return connected;
        }
        return next(attacker,target,damage,meta);
      },
      exit:async next=>{
        const leave=await storyConfirm({title:'RETURN TO STORY?',message:'Leave Chapter 1 training? Current mission progress will restart.',confirmLabel:'LEAVE TRAINING'});
        if(!leave)return;
        next();this.cleanup();this.onExit();
      }
    });
  }

  configureHotbar(){
    const slots=this.battle.root.querySelectorAll('[data-arena-slot]');
    slots.forEach(button=>{
      const slot=Number(button.dataset.arenaSlot);
      if(slot!==2){button.setAttribute('aria-disabled','true');button.tabIndex=-1}
    });
    const shots=this.battle.root.querySelector('[data-arena-slot="2"]');
    shots.querySelector('.arenaAbilityName').textContent='Shots Training';
    shots.querySelector('.arenaCost').textContent='NO ENERGY COST';
    this.updateShotsLabel();
  }

  updateShotsLabel(){
    const button=this.battle?.root.querySelector('[data-arena-slot="2"]');
    if(button)button.querySelector('.arenaAbilityName').textContent=`Shots Training ×${this.mastery}`;
  }

  clearTypewriter(){
    if(this.typeTimer){clearTimeout(this.typeTimer);this.typeTimer=null}
    this.typing=false;
  }

  showDialogueLayer(){
    this.dialogue.classList.remove('hidden');
    this.battle?.root.classList.add('storyDialogueOpen');
    this.root.querySelector('[data-m0-tag]')?.classList.add('dialogueHidden');
  }

  setArenaNames(left,right){
    const names=this.battle?.root?.querySelectorAll('.top .side .name span:first-child');
    if(names?.[0])names[0].textContent=left;
    if(names?.[1])names[1].textContent=right;
  }

  hideDialogueLayer(){
    this.clearTypewriter();
    this.dialogue.classList.add('hidden');
    this.battle?.root.classList.remove('storyDialogueOpen');
    this.root.querySelector('[data-m0-tag]')?.classList.remove('dialogueHidden');
  }

  setSpeaker(speaker){
    this.dialogue.dataset.speaker=speaker;
    this.root.querySelector('[data-m0-speaker]').textContent=speaker;
  }

  typeDialogue(text){
    this.clearTypewriter();
    this.fullText=text;
    const output=this.root.querySelector('[data-m0-text]');
    output.textContent='';
    this.typing=true;
    let index=0;
    const tick=()=>{
      if(this.aborted)return;
      index++;
      output.textContent=text.slice(0,index);
      if(index>=text.length){this.typing=false;this.typeTimer=null;return}
      const current=text[index-1];
      const delay=current==='.'||current==='!'||current==='?'?78:current===','?45:18;
      this.typeTimer=setTimeout(tick,delay);
    };
    this.typeTimer=setTimeout(tick,80);
  }

  revealDialogue(){
    this.clearTypewriter();
    this.root.querySelector('[data-m0-text]').textContent=this.fullText;
  }

  showOpeningDialogue(){
    this.previewClones(0);
    this.engine.showDialogue([
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Enough standing around. Move. If I can tag you before you land one clean attack, you’re starting over.',tail:'down',onShow:()=>this.previewClones(1)},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Finally. A lesson that isn’t just you vaguely pointing at my hands.',tail:'down',onShow:()=>this.previewClones(0)},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Land one direct hit. Then make an energy copy attack from somewhere I can’t predict.',tail:'down',onShow:()=>this.previewClones(1)},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Eh, focus your energy into your hands or something. I’m getting bored. I have places to be.',tail:'down',onShow:()=>this.previewClones(1)},
      {speaker:'RRVVFO',speakerClass:'p1',text:'One copy? I can do four.',tail:'down',onShow:()=>this.previewClones(4)}
    ],{onComplete:()=>{this.previewClones(0);this.beginFight()}});
  }

  renderDialogueLine(){
    const line=this.lines[this.lineIndex];
    if(!line)return;
    this.setSpeaker(line.speaker);
    this.typeDialogue(line.text);
    this.previewClones(line.clones||0);
    const button=this.root.querySelector('[data-m0-next]');
    button.setAttribute('aria-label',line.startFight?'Start spar':'Advance dialogue');
    button.focus();
  }

  advanceDialogue(){
    if(this.typing){this.revealDialogue();return}
    if(this.finishDialogueMode){this.advanceFinishDialogue();return}
    const line=this.lines[this.lineIndex];
    if(line?.startFight){
      this.hideDialogueLayer();
      this.previewClones(0);
      this.beginFight();
      return;
    }
    this.lineIndex++;
    if(this.lineIndex>=this.lines.length){this.hideDialogueLayer();this.beginFight();return}
    this.renderDialogueLine();
  }

  previewClones(count){
    if(!this.battle)return;
    const player=this.battle.fighters[0],sage=this.battle.fighters[1];
    this.battle.agonyClones=[];
    if(!count)return;
    const radius=112;
    for(let index=0;index<count;index++){
      const angle=(index/count)*Math.PI*2-Math.PI/2;
      const point=clampToStage(this.battle.stage,sage.x+Math.cos(angle)*radius,sage.z+Math.sin(angle)*radius);
      this.battle.agonyClones.push({owner:player,target:sage,x:point.x,z:point.z,life:999,fireAt:999,fired:true,index,color:'#6ebcff'});
    }
  }

  beginFight(){
    this.battle.phase='play';
    this.battle.time=9999;
    this.battle.fighters[0].hp=100;
    this.battle.fighters[0].en=100;
    this.battle.fighters[1].hp=100;
    this.normalDodges=0;
    this.openingSparSeconds=0;
    this.setObjective('ACTIVE SPAR • LAND ONE DIRECT ATTACK','Move immediately. The Sage is attacking instead of waiting for button demonstrations.');
    this.battle.notice('ACTIVE SPAR • MOVE, DEFEND, THEN ATTACK',1.8);
  }

  unlockShotsTraining(){
    this.setObjective('USE SHOTS TRAINING ×1',`${this.engine.prompt('ability2','PRESS 2')} or select the second hotbar slot. Build the technique from one coordinated clone to four.`);
    this.battle.notice(`NORMAL ATTACKS ARE TOO OBVIOUS • ${this.engine.prompt('ability2','PRESS 2')}`,2);
  }

  castTrainingAbility(slot){
    const battle=this.battle,player=battle.fighters[0],sage=battle.fighters[1];
    if(slot!==2){battle.notice('THIS CHAPTER SECTION TRAINS SHOTS OF AGONY');return false}
    if(battle.phase!=='play'||battle.paused){battle.notice(battle.paused?'MISSION PAUSED':'WAIT FOR THE SPAR');return false}
    if(this.normalDodges<1){battle.notice('MAKE THE SAGE PREDICT ONE DIRECT ATTACK FIRST');return false}
    if(player.stun||player.guardBreak||!player.grounded||player.attackState){battle.notice('ABILITY UNAVAILABLE');return false}
    if(battle.volleyActive(player)){battle.notice('SHOTS VOLLEY ACTIVE');return false}
    if(player.cooldowns.shotsOfAgony>0){battle.notice(`FOCUS • ${player.cooldowns.shotsOfAgony.toFixed(1)}s`);return false}
    player.attackState=null;
    player.en=100;
    player.visualAction='shotsSummon';
    player.visualActionTime=.72;
    this.activeVolleyCount=this.mastery;
    this.castSerial++;
    this.handledCast=-1;
    const count=this.mastery,radius=112;
    for(let index=0;index<count;index++){
      const angle=(index/count)*Math.PI*2-Math.PI/2;
      const point=clampToStage(battle.stage,sage.x+Math.cos(angle)*radius,sage.z+Math.sin(angle)*radius);
      battle.agonyClones.push({owner:player,target:sage,x:point.x,z:point.z,life:1.22,fireAt:.58,fired:false,index,color:'#6ebcff'});
    }
    battle.notice(`UNSTABLE SHOTS • ${count} CLONE${count===1?'':'S'}`,1.25);
    return true;
  }

  sageDodge(attacker,sage,fromVolley){
    const oldX=sage.x,oldZ=sage.z;
    const dx=sage.x-attacker.x,dz=sage.z-attacker.z,length=Math.max(1,Math.hypot(dx,dz));
    const nx=dx/length,nz=dz/length,side=this.dodgeSide*=-1;
    const point=clampToStage(this.battle.stage,sage.x+nx*52-nz*side*88,sage.z+nz*52+nx*side*88);
    sage.x=point.x;sage.z=point.z;sage.inv=.24;sage.visualAction='predictionDodge';sage.visualActionTime=.42;
    this.battle.burst(oldX,oldZ,'#d6ebff',16,58);
    this.battle.burst(sage.x,sage.z,'#d6ebff',13,58);
    this.battle.notice(fromVolley?'THE SAGE DODGED THE VOLLEY':'PREDICTED',.8);
  }

  advanceMastery(){
    if(this.completed||this.mastery>=4)return;
    this.mastery=4;
    this.updateShotsLabel();
    this.battle.fighters[0].cooldowns.shotsOfAgony=.35;
    const lines={4:['SURROUND THE SAGE • ×4','The first copy proved the idea. Skip the repetition and attack from all four directions.']};
    const [title,detail]=lines[this.mastery];
    this.setObjective(title,detail);
    this.battle.notice(this.mastery===4?'THE SAGE: “NOW SURROUND ME.”':`MASTERY INCREASED • ${this.mastery} CLONES`,1.6);
  }

  finishMission(){
    const battle=this.battle;
    battle.phase='storyComplete';
    battle.hideBanner();
    battle.fighters[1].visualAction='hurtLight';
    battle.fighters[1].visualActionTime=.5;
    this.setObjective('TECHNIQUE COMPLETE','The four-clone volley caught the Sage off guard.');
    this.engine.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'Caught ya.',tail:'down'},
      {speaker:'THE SAGE',speakerClass:'neutral',text:'Alright, training’s over. I’ve got important stuff to do.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'Wait—no! We just got started!',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'You damn perv.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'I’ll name this attack... Shots of Agony.',tail:'down'}
    ],{onComplete:()=>{
      this.commitCompletion();
      this.completePanel.classList.remove('hidden');
      this.root.querySelector('[data-m0-return]').focus();
    }});
  }

  renderFinishLine(){
    const line=this.lines[this.lineIndex];
    this.setSpeaker(line.speaker);
    this.typeDialogue(line.text);
    const button=this.root.querySelector('[data-m0-next]');
    button.setAttribute('aria-label',line.finish?'Show mission results':'Advance dialogue');
    button.focus();
  }

  advanceFinishDialogue(){
    const line=this.lines[this.lineIndex];
    if(line?.finish){
      this.commitCompletion();
      this.hideDialogueLayer();
      this.completePanel.classList.remove('hidden');
      this.root.querySelector('[data-m0-return]').focus();
      return;
    }
    this.lineIndex++;
    this.renderFinishLine();
  }

  commitCompletion(){
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=Array.isArray(progress.unlocks)?progress.unlocks:[];
    saveLostYearProgress({...progress,completedMissions,unlocks:unlocks.includes('shotsOfAgony')?unlocks:[...unlocks,'shotsOfAgony']});
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
    this.clearTypewriter();
    document.removeEventListener('keydown',this.keyHandler);
    this.root.classList.add('hidden');
    this.dialogue.classList.add('hidden');
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
