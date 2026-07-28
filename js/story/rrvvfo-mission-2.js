import {SonicBattleDialogue} from '../sonic-battle-dialogue.js?v=27b-living-training-road-20260727-232814';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=27b-living-training-road-20260727-232814';
import {discoverCombatManualPage,openCombatManual} from './combat-manual.js?v=27b-living-training-road-20260727-232814';

const MISSION_ID='rrvvfo-02';
const UI_ID='rrvvfoMission2UI';
let activeMission=null;

function hideGameScreens(){
  ['startScreen','mainMenuScreen','menuScreen','gameScreen','arenaModeScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
}

function buildUI(){
  document.getElementById(UI_ID)?.remove();
  const root=document.createElement('section');
  root.id=UI_ID;
  root.hidden=true;
  root.innerHTML=`
    <div class="tournamentShell">
      <header class="tournamentHeader">
        <div><small>RRVVFO ROUTE • CHAPTER 2</small><h1>DEFINITELY NOT THE WORLD TOURNAMENT</h1><p>Register, inspect the bracket, and reach the fighter entrance.</p></div>
        <div class="tournamentHeaderActions">
          <button class="tournamentAction" type="button" data-open-manual>COMBAT MANUAL</button>
          <button class="tournamentAction" type="button" data-exit-m2>← RRVVFO ROUTE</button>
        </div>
      </header>
      <div class="tournamentPlaza">
        <div class="venueArt" aria-label="Global Tournament exterior"><div class="crowdStrip">${Array.from({length:18},(_,i)=>`<i style="--c:${['#e52b2f','#ffd400','#2da4ff','#7ad66d','#ad63e8'][i%5]}"></i>`).join('')}</div></div>
        <aside class="hubPanel"><small>TOURNAMENT HUB • FOUNDATION VERSION</small><h2>ENTRY CHECKLIST</h2><div class="hubTasks">
          <button class="tournamentAction" type="button" data-hub-task="register"><strong>REGISTRATION BOOTH</strong><span>Show the entry Sage submitted.</span></button>
          <button class="tournamentAction" type="button" data-hub-task="bracket" disabled><strong>BRACKET BOARD</strong><span>Find Rrvvfo's first-round slot.</span></button>
          <button class="tournamentAction" type="button" data-hub-task="entrance" disabled><strong>FIGHTER ENTRANCE</strong><span>Proceed toward the waiting area.</span></button>
        </div><div class="hubStatus" data-hub-status>ARRIVE AT THE REGISTRATION BOOTH.</div></aside>
      </div>
    </div>
    <div class="routeEndOverlay" data-route-end hidden>
      <article class="routeEndCard">
        <small>RRVVFO ROUTE • CHAPTER 2 COMPLETE</small>
        <h2>TOURNAMENT ENTRY CONFIRMED</h2>
        <p>Rrvvfo has officially entered the tournament. The remaining tournament matches, roaming challengers, side stories, and the full tournament hub continue in future overhaul phases.</p>
        <div class="routeEndActions">
          <button class="tournamentAction" type="button" data-end-manual>OPEN COMBAT MANUAL</button>
          <button class="tournamentAction" type="button" data-end-route>RETURN TO RRVVFO ROUTE</button>
        </div>
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
    this.dialogue=null;
    this.completedTasks=new Set();
    this.completed=false;
    this.root.querySelector('[data-exit-m2]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelector('[data-open-manual]').addEventListener('click',()=>openCombatManual());
    this.root.querySelector('[data-end-manual]').addEventListener('click',()=>openCombatManual());
    this.root.querySelector('[data-end-route]').addEventListener('click',()=>this.exitToStory());
    this.root.querySelectorAll('[data-hub-task]').forEach(button=>button.addEventListener('click',()=>this.runTask(button.dataset.hubTask)));
    this.keyHandler=event=>{
      if(this.root.hidden||this.dialogue)return;
      if(event.key.toLowerCase()==='m'){
        event.preventDefault();
        openCombatManual();
      }
    };
    document.addEventListener('keydown',this.keyHandler);
  }

  start(){
    hideGameScreens();
    this.root.hidden=false;
    this.showDialogue([
      {speaker:'RRVVFO',speakerClass:'p1',text:'This looks like a knockoff of the World Tournament I always used to watch on TV.',tail:'down'},
      {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'It is not a knockoff.',tail:'down'},
      {speaker:'RRVVFO',speakerClass:'p1',text:'That sounds exactly like something a knockoff would say.',tail:'down'}
    ],()=>{
      discoverCombatManualPage('hub-exploration',{onClose:()=>this.root.querySelector('[data-hub-task="register"]')?.focus()});
    });
    return this;
  }

  showDialogue(lines,onComplete){
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
  }

  runTask(task){
    if(this.completed)return;
    if(task==='register'&&!this.completedTasks.has(task)){
      this.showDialogue([
        {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Rrvvfo. Registered by... “The Sage.”',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah. He signs me up for things without asking.',tail:'down'},
        {speaker:'TOURNAMENT WORKER',speakerClass:'neutral',text:'Registration confirmed. Check the bracket board before entering the waiting area.',tail:'down'}
      ],()=>this.completeTask('register','bracket','REGISTRATION COMPLETE • CHECK THE BRACKET BOARD.'));
    }else if(task==='bracket'&&!this.completedTasks.has(task)){
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'There I am. First round. Sage better not have put me against somebody boring.',tail:'down'},
        {speaker:'ANNOUNCER',speakerClass:'rival',text:'All registered fighters report to the entrance tunnel. Opening matches begin soon.',tail:'down'}
      ],()=>{
        discoverCombatManualPage('tournament-rules',{onClose:()=>this.completeTask('bracket','entrance','BRACKET FOUND • GO TO THE FIGHTER ENTRANCE.')});
      });
    }else if(task==='entrance'&&!this.completedTasks.has(task)){
      this.completeTask('entrance',null,'CHAPTER COMPLETE • FIRST MATCH COMING IN A FUTURE UPDATE.');
      this.showDialogue([
        {speaker:'RRVVFO',speakerClass:'p1',text:'All right. Let us see which “old face” Sage was talking about.',tail:'down'},
        {speaker:'UNKNOWN FIGHTER',speakerClass:'rival',text:'So Sage really brought you here.',tail:'down'}
      ],()=>this.commitCompletion());
    }
  }

  completeTask(task,next,status){
    this.completedTasks.add(task);
    const button=this.root.querySelector(`[data-hub-task="${task}"]`);
    button?.classList.add('done');
    if(button){button.disabled=true;button.querySelector('span').textContent='COMPLETE';}
    if(next){
      const nextButton=this.root.querySelector(`[data-hub-task="${next}"]`);
      if(nextButton){nextButton.disabled=false;nextButton.focus();}
    }
    this.root.querySelector('[data-hub-status]').textContent=status;
  }

  commitCompletion(){
    if(this.completed)return;
    this.completed=true;
    const progress=loadLostYearProgress();
    const completedMissions=progress.completedMissions.includes(MISSION_ID)?progress.completedMissions:[...progress.completedMissions,MISSION_ID];
    const unlocks=[...new Set([...(progress.unlocks||[]),'tournamentHub','firstTournamentMatch','chapterSelect'])];
    saveLostYearProgress({...progress,completedMissions,unlocks,lastCheckpoint:'rrvvfo-02'});
    this.onComplete();
    this.root.querySelector('[data-route-end]').hidden=false;
    this.root.querySelector('[data-end-route]').focus();
  }

  exitToStory(){
    if(this.dialogue?._onKey)document.removeEventListener('keydown',this.dialogue._onKey);
    document.removeEventListener('keydown',this.keyHandler);
    this.dialogue?.overlay?.remove();
    this.root.remove();
    activeMission=null;
    this.onExit();
  }
}

export function startRrvvfoMission2(options={}){
  if(activeMission)activeMission.exitToStory();
  activeMission=new RrvvfoMission2(options);
  return activeMission.start();
}

export {RrvvfoMission2};
