import {BUILD_VERSION,SAVE_SCHEMA_VERSION} from '../build-info.js?v=29a391-chapter4-ending-continuity-20260801';
import {inspectStoryReliability,storyAfterglowFor,storyReliabilitySummary} from './story-reliability.js?v=29a391-chapter4-ending-continuity-20260801';
import {storyExperienceProfile} from './story-experience.js?v=29a391-chapter4-ending-continuity-20260801';
import {
  LOST_YEAR_SAVE_KEY,
  RRVVFO_CHAPTERS,
  RRVVFO_PLANNED_CHAPTER_COUNT,
  completedRrvvfoChapterCount,
  loadLostYearProgress,
  lastLostYearSaveError,
  routeProgress,
  LOST_YEAR_ROUTES,
  saveLostYearProgress
} from './lost-year-data.js?v=29a391-chapter4-ending-continuity-20260801';

const CODE=Object.freeze(['up','up','down','down','left','right','left','right','b','a']);
const KEY_TO_CODE=Object.freeze({ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyB:'b',KeyA:'a'});
const OBJECTIVE_PAIRS=Object.freeze([
  ['[data-c4-objective]','[data-c4-detail]'],
  ['[data-c3-objective]','[data-c3-detail]'],
  ['[data-c2-objective]','[data-c2-detail]'],
  ['[data-road-objective]','[data-road-detail]'],
  ['[data-tutorial-objective]','[data-tutorial-detail]'],
  ['[data-m0-objective]','[data-m0-detail]']
]);
const CHAPTER_START_STEP=Object.freeze({1:'rrvvfo-00',2:'rrvvfo-02',3:'rrvvfo-03',4:'rrvvfo-04'});
const CHAPTER_MISSIONS=Object.freeze({
  1:['rrvvfo-00','rrvvfo-01','rrvvfo-road'],
  2:['rrvvfo-02'],
  3:['rrvvfo-03'],
  4:['rrvvfo-04']
});

const PREFIGHT_BACKUP_KEY='pxStoryPreFightBackupV1';
function storePreFightBackup(chapter=0){
  try{sessionStorage.setItem(PREFIGHT_BACKUP_KEY,JSON.stringify({version:1,createdAt:Date.now(),chapter:Number(chapter)||0,progress:loadLostYearProgress()}));return true}catch{return false}
}
function clearPreFightBackup(){try{sessionStorage.removeItem(PREFIGHT_BACKUP_KEY)}catch{}}
function restorePreFightBackup(){
  try{
    const raw=sessionStorage.getItem(PREFIGHT_BACKUP_KEY);if(!raw)return false;
    const parsed=JSON.parse(raw),progress=parsed?.progress&&typeof parsed.progress==='object'?parsed.progress:parsed;
    if(!progress||typeof progress!=='object')return false;
    const restored=saveLostYearProgress(progress);
    if(lastLostYearSaveError())return false;
    const verified=loadLostYearProgress();
    const restoredOk=verified?.lastCheckpoint===progress.lastCheckpoint
      &&JSON.stringify(verified?.completedMissions||[])===JSON.stringify(progress.completedMissions||[]);
    if(restoredOk)clearPreFightBackup();
    return restoredOk;
  }catch{return false}
}

let singleton=null;

function visible(element){
  if(!element||element.hidden)return false;
  const style=getComputedStyle(element);
  return style.display!=='none'&&style.visibility!=='hidden';
}
function safe(value){return value==null?'':String(value)}
function unique(values){return[...new Set(values)]}
function chapterNumberFromLabel(label=''){
  const match=String(label).match(/CHAPTER\s*(\d+)/i);
  return match?Number(match[1]):0;
}
function formatTime(ms=0){
  const seconds=Math.max(0,Math.round(Number(ms)||0)/1000),minutes=Math.floor(seconds/60),remainder=Math.floor(seconds%60);
  return`${String(minutes).padStart(2,'0')}:${String(remainder).padStart(2,'0')}`;
}
function countTruthy(value,depth=0){
  if(depth>4||value==null)return 0;
  if(typeof value==='boolean')return value?1:0;
  if(Array.isArray(value))return value.length;
  if(typeof value==='object')return Object.values(value).reduce((sum,item)=>sum+countTruthy(item,depth+1),0);
  return 0;
}
function completedQuestCount(group){return Object.values(group||{}).filter(entry=>entry===true||entry?.complete===true).length}
function chapterOptionalScore(chapter,progress){
  if(chapter===1)return Number(Boolean(progress.roadEncounterResult))+Number(Boolean(progress.unlocks?.includes('combatManual')));
  if(chapter===2)return completedQuestCount(progress.chapter2State?.hubQuests?.optional);
  if(chapter===3)return completedQuestCount(progress.chapter3State?.optional);
  if(chapter===4)return Number(Boolean(progress.chapter4State?.ryuzankaro?.bossDefeated))*4+Number(Boolean(progress.unlocks?.includes('vibrationSense')));
  return 0;
}
function chapterRank(chapter,progress){
  const score=chapterOptionalScore(chapter,progress);
  if(chapter===4&&progress.chapter4State?.ryuzankaro?.bossDefeated)return'S';
  if(score>=4)return'S';
  if(score>=2)return'A';
  return'B';
}
function currentStoryRoot(){return document.querySelector('.storyEngineActive')}
function currentChapterNumber(){
  const root=currentStoryRoot();
  return chapterNumberFromLabel(root?.dataset?.storyChapter||document.body.dataset.storyChapter||'');
}
function checkpointLabel(progress=loadLostYearProgress()){
  return safe(progress.lastCheckpoint||'rrvvfo-00').replace(/^rrvvfo-\d+-?/,'').replace(/^rrvvfo-/,'').replaceAll('-',' ').trim().toUpperCase()||'CHAPTER START';
}
function setHidden(element,hidden){if(element)element.hidden=Boolean(hidden)}

class StoryPolishController{
  constructor(){
    this.root=null;this.transition=null;this.objective=null;this.results=null;this.playtest=null;this.combatCallout=null;
    this.objectiveTimer=0;this.transitionTimer=0;this.lastObjective='';this.codeBuffer=[];this.controllerFrame=0;this.controllerButtons=[];
    this.observer=null;this.initialized=false;this.currentMode='';this.currentChapter=0;this.nativeContinue=null;this.nativeCompletionOverlay=null;this.recoveredPreFight=false;this.currentReplay=false;this.currentPlaytest=false;this.currentStepId='';
    this.onKey=this.onKey.bind(this);this.pollController=this.pollController.bind(this);this.scanObjectives=this.scanObjectives.bind(this);
  }

  build(){
    if(this.root&&document.body.contains(this.root))return;
    this.root=document.createElement('div');
    this.root.id='storyPolishLayer';
    this.root.innerHTML=`
      <section class="storySceneTransition" data-story-transition hidden aria-live="polite">
        <div><small data-story-transition-kicker>STORY BATTLE</small><h2 data-story-transition-title>FIGHT</h2><p data-story-transition-detail></p></div>
      </section>
      <div class="storyCombatCallout" data-story-combat-callout hidden aria-live="polite"></div>
      <aside class="storyObjectiveToast" data-story-objective-toast hidden aria-live="polite">
        <small data-story-objective-kicker>NEW OBJECTIVE</small><strong data-story-objective-title></strong><span data-story-objective-detail></span><i></i>
      </aside>
      <section class="storyChapterResults" data-story-results hidden role="dialog" aria-modal="true" aria-labelledby="storyResultsTitle">
        <article><header><small>CHAPTER RESULTS</small><h2 id="storyResultsTitle" data-story-results-title></h2></header>
          <div class="storyResultRank" data-story-result-rank>B</div>
          <dl data-story-result-stats></dl>
          <div class="storyResultRewards" data-story-result-rewards></div>
          <div class="storyAfterglow" data-story-afterglow><small data-story-afterglow-kicker>ADVENTURE BEAT</small><strong data-story-afterglow-title></strong><p data-story-afterglow-recap></p><ul data-story-afterglow-changes></ul><div class="storyNextLeg" data-story-afterglow-next></div></div>
          <div class="storyResultActions"><button type="button" class="primary" data-story-results-close>CONTINUE JOURNEY</button><button type="button" data-story-results-menu>CHAPTER SELECT</button></div>
        </article>
      </section>
      <section class="storyPlaytestPanel" data-story-playtest hidden role="dialog" aria-modal="true" aria-labelledby="storyPlaytestTitle">
        <article>
          <header><div><small>SECRET PLAYTEST MENU</small><h2 id="storyPlaytestTitle">PARALLELS X DEBUG ROOM</h2></div><button type="button" data-playtest-close>×</button></header>
          <p class="playtestCode">UNLOCKED WITH ↑ ↑ ↓ ↓ ← → ← → B A</p>
          <div class="playtestSnapshot" data-playtest-snapshot></div>
          <div class="playtestReliability" data-playtest-reliability><strong data-playtest-reliability-title>SAVE HEALTH</strong><span data-playtest-reliability-mode></span><span data-playtest-reliability-issues></span></div>
          <section><h3>RECOVERY</h3><div class="playtestButtons"><button type="button" data-playtest-action="checkpoint">RESTART FROM SAVED CHECKPOINT</button><button type="button" data-playtest-action="chapterSelect">OPEN CHAPTER SELECT</button><button type="button" data-playtest-action="resetChapter">RESET CURRENT CHAPTER</button></div></section>
          <section><h3>JUMP TO RELEASED CHAPTER</h3><div class="playtestButtons">${[1,2,3,4].map(number=>`<button type="button" data-playtest-chapter="${number}">CHAPTER ${number}</button>`).join('')}<button type="button" data-playtest-chapter-hub="4">CHAPTER 4 • ECHO VILLAGE HUB</button></div></section>
          <section><h3>QUICK COMBAT TEST</h3><div class="playtestButtons"><button type="button" data-playtest-fight="revvfo">RRVVFO VS REVVFO</button><button type="button" data-playtest-fight="wade">RRVVFO VS WADE</button><button type="button" data-playtest-fight="bark">RRVVFO VS BARK</button></div></section>
          <section><h3>BUG REPORT</h3><div class="playtestButtons"><button type="button" class="primary" data-playtest-action="copyReport">COPY BUG REPORT</button><button type="button" data-playtest-action="downloadReport">DOWNLOAD REPORT</button><button type="button" data-playtest-action="refreshFlags">REFRESH FLAGS</button></div></section>
          <pre data-playtest-flags></pre>
        </article>
      </section>`;
    document.body.appendChild(this.root);
    this.transition=this.root.querySelector('[data-story-transition]');
    this.objective=this.root.querySelector('[data-story-objective-toast]');
    this.combatCallout=this.root.querySelector('[data-story-combat-callout]');
    this.results=this.root.querySelector('[data-story-results]');
    this.playtest=this.root.querySelector('[data-story-playtest]');
    this.root.querySelector('[data-story-results-close]').addEventListener('click',()=>this.continueFromResults());
    this.root.querySelector('[data-story-results-menu]').addEventListener('click',()=>{this.closeResults();this.nativeContinue?.click();document.dispatchEvent(new CustomEvent('pxplaytestopenstory'))});
    this.root.querySelector('[data-playtest-close]').addEventListener('click',()=>this.closePlaytest());
    this.root.querySelectorAll('[data-playtest-action]').forEach(button=>button.addEventListener('click',()=>this.handlePlaytestAction(button.dataset.playtestAction)));
    this.root.querySelectorAll('[data-playtest-chapter]').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.playtestChapter))));
    this.root.querySelectorAll('[data-playtest-chapter-hub]').forEach(button=>button.addEventListener('click',()=>this.startChapterHub(Number(button.dataset.playtestChapterHub))));
    this.root.querySelectorAll('[data-playtest-fight]').forEach(button=>button.addEventListener('click',()=>this.startCombatTest(button.dataset.playtestFight)));
  }

  init(){
    if(this.initialized)return this;this.initialized=true;this.recoveredPreFight=restorePreFightBackup();this.build();
    if(this.recoveredPreFight)queueMicrotask(()=>this.showObjective('STORY FIGHT RECOVERED','The pre-fight checkpoint was restored after an interrupted battle.','AUTO-SAVE RECOVERY'));
    document.addEventListener('keydown',this.onKey,true);
    document.addEventListener('pxstorymodechange',event=>this.onModeChange(event.detail||{}));
    document.addEventListener('pxdialogueline',event=>this.onDialogueLine(event.detail||{}));
    document.addEventListener('pxstorychaptercomplete',event=>this.onChapterComplete(event.detail||{}));
    document.addEventListener('pxarenafeedback',event=>this.onCombatFeedback(event.detail||{}));
    document.addEventListener('pxstorystepstart',event=>this.onStoryStepStart(event.detail||{}));
    document.addEventListener('pxstorymenuopen',()=>this.onStoryMenuOpen());
    document.addEventListener('pxstoryreliabilitywarning',event=>this.onReliabilityWarning(event.detail||{}));
    this.observer=new MutationObserver(()=>{clearTimeout(this.objectiveTimer);this.objectiveTimer=setTimeout(this.scanObjectives,80)});
    this.observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});
    this.controllerFrame=requestAnimationFrame(this.pollController);
    return this;
  }

  onStoryMenuOpen(){
    clearTimeout(this.objectiveTimer);clearTimeout(this.transitionTimer);clearTimeout(this.combatCalloutTimer);
    this.currentReplay=false;this.currentPlaytest=false;this.currentStepId='';document.body.dataset.storyRunMode='';
    this.lastObjective='';
    if(this.objective){this.objective.classList.remove('show');this.objective.hidden=true}
    if(this.transition){this.transition.classList.remove('show');this.transition.hidden=true}
    if(this.combatCallout){this.combatCallout.classList.remove('show');this.combatCallout.hidden=true}
  }

  onStoryStepStart({chapter=0,stepId='',replay=false,playtest=false}={}){
    this.currentChapter=Number(chapter)||chapterNumberFromLabel(stepId)||0;
    this.currentReplay=Boolean(replay);this.currentPlaytest=Boolean(playtest);this.currentStepId=stepId||'';
    document.body.dataset.storyRunMode=this.currentPlaytest?'playtest':this.currentReplay?'replay':'first-play';
    const number=this.currentChapter||stepId,key=`pxStoryChapterRun:${number}`;
    try{
      if(!sessionStorage.getItem(key)){
        const progress=loadLostYearProgress();
        sessionStorage.setItem(key,JSON.stringify({startedAt:Date.now(),fights:0,retries:0,replay:this.currentReplay,playtest:this.currentPlaytest,startXp:Number(progress.storyXp)||0,startLevel:Number(progress.storyLevel)||1,startUnlocks:[...(progress.unlocks||[])],startOptional:chapterOptionalScore(Number(this.currentChapter)||0,progress)}));
      }
    }catch{}
    document.body.dataset.storyChapter=String(this.currentChapter||'');
  }

  onModeChange({from='',to='',chapter='',opponent=''}){
    this.currentMode=to;this.currentChapter=chapterNumberFromLabel(chapter)||this.currentChapter;
    document.body.dataset.storyMode=to||'';
    if(this.currentChapter)document.body.dataset.storyChapter=String(this.currentChapter);
    if(from===to)return;
    if(to==='combat'){
      try{const key=`pxStoryChapterRun:${this.currentChapter}`,run=JSON.parse(sessionStorage.getItem(key)||'{}');run.fights=(Number(run.fights)||0)+1;sessionStorage.setItem(key,JSON.stringify(run))}catch{}
    }
    if(to==='combat'||to==='tutorial'){
      storePreFightBackup(this.currentChapter)
      this.showTransition({kicker:to==='tutorial'?'TRAINING ENGAGED':'STORY BATTLE',title:opponent?`VS ${safe(opponent).toUpperCase()}`:'FIGHT',detail:'Checkpoint secured • exploration UI hidden • combat controls active'});
      document.body.classList.add('storyCombatFeedback');
      setTimeout(()=>document.body.classList.remove('storyCombatFeedback'),720);
    }else if(from==='combat'&&['exploration','story','cinematic','complete'].includes(to)){
      clearPreFightBackup();
      this.showTransition({kicker:'BATTLE COMPLETE',title:'RETURNING TO STORY',detail:'Checkpoint secured • exploration controls restored'});
    }
  }

  onDialogueLine({speaker='narrator',emotion='neutral'}={}){
    document.body.dataset.dialogueSpeaker=safe(speaker);
    document.body.dataset.dialogueEmotion=safe(emotion);
    const root=currentStoryRoot();
    if(root){root.dataset.dialogueSpeaker=safe(speaker);root.dataset.dialogueEmotion=safe(emotion)}
  }

  onCombatFeedback({type='hit'}={}){
    if(!currentStoryRoot()||!this.combatCallout)return;
    const labels={perfectParry:'PERFECT PARRY',guardBreak:'GUARD BREAK',heavyImpact:'HEAVY IMPACT',ringDanger:'RING-OUT DANGER'};
    const label=labels[type];if(!label)return;
    this.combatCallout.textContent=label;this.combatCallout.hidden=false;this.combatCallout.className=`storyCombatCallout show ${type}`;
    clearTimeout(this.combatCalloutTimer);this.combatCalloutTimer=setTimeout(()=>{this.combatCallout.classList.remove('show');setTimeout(()=>setHidden(this.combatCallout,true),150)},560);
    document.body.classList.remove(`storyFeedback-${type}`);void document.body.offsetWidth;document.body.classList.add(`storyFeedback-${type}`);
    setTimeout(()=>document.body.classList.remove(`storyFeedback-${type}`),420);
  }

  showTransition({kicker='STORY',title='TRANSITION',detail=''}){
    this.build();clearTimeout(this.transitionTimer);
    this.transition.querySelector('[data-story-transition-kicker]').textContent=kicker;
    this.transition.querySelector('[data-story-transition-title]').textContent=title;
    this.transition.querySelector('[data-story-transition-detail]').textContent=detail;
    this.transition.hidden=false;this.transition.classList.remove('show');void this.transition.offsetWidth;this.transition.classList.add('show');
    this.transitionTimer=setTimeout(()=>{this.transition.classList.remove('show');setTimeout(()=>setHidden(this.transition,true),220)},760);
  }

  scanObjectives(){
    if(document.body.classList.contains('storyFightUiSafe')||document.querySelector('.px-dialogue-overlay'))return;
    let title='',detail='';
    for(const [titleSelector,detailSelector] of OBJECTIVE_PAIRS){
      const titleElement=[...document.querySelectorAll(titleSelector)].find(visible);
      if(!titleElement)continue;
      title=titleElement.textContent.trim();detail=document.querySelector(detailSelector)?.textContent?.trim()||'';break;
    }
    if(!title)return;
    const key=`${title}|${detail}`;
    if(key===this.lastObjective)return;
    const previous=this.lastObjective;this.lastObjective=key;
    this.showObjective(title,detail,previous?'OBJECTIVE UPDATED':'MAIN OBJECTIVE');
  }

  onReliabilityWarning(detail={}){
    const issue=(detail.issues||[])[0];if(!issue)return;
    this.showObjective('STORY SAVE NEEDS ATTENTION',issue,'AUTO-SAVE CHECK');
  }

  showObjective(title,detail,kicker='NEW OBJECTIVE'){
    this.build();clearTimeout(this.objectiveTimer);
    try{const progress=loadLostYearProgress();saveLostYearProgress({...progress,lastStoryObjective:{title,detail,kicker,updatedAt:Date.now()}})}catch{}
    document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:'objective'}}));
    this.objective.querySelector('[data-story-objective-kicker]').textContent=kicker;
    this.objective.querySelector('[data-story-objective-title]').textContent=title;
    this.objective.querySelector('[data-story-objective-detail]').textContent=detail;
    this.objective.hidden=false;this.objective.classList.remove('show');void this.objective.offsetWidth;this.objective.classList.add('show');
    this.objectiveTimer=setTimeout(()=>{this.objective.classList.remove('show');setTimeout(()=>setHidden(this.objective,true),220)},3200);
  }

  onChapterComplete({chapter,progress}={}){
    clearPreFightBackup();
    const number=Number(chapter?.number)||0;if(!number)return;
    queueMicrotask(()=>{
      const selectors=['[data-road-complete]','[data-route-end]','[data-c3-complete]','[data-c4-complete]'];
      this.nativeCompletionOverlay=selectors.map(selector=>document.querySelector(selector)).find(element=>element&&!element.hidden)||null;
      this.nativeContinue=this.nativeCompletionOverlay?.querySelector('[data-road-continue],[data-end-route],[data-c3-continue],[data-c4-continue]')||null;
      if(this.nativeCompletionOverlay)this.nativeCompletionOverlay.hidden=true;
      this.showResults(number,chapter,progress||loadLostYearProgress());
    });
  }

  showResults(number,chapter,progress){
    this.build();const key=`pxStoryChapterRun:${number}`;let run={};
    try{run=JSON.parse(sessionStorage.getItem(key)||'{}');sessionStorage.removeItem(key)}catch{}
    const duration=Math.max(0,Date.now()-(Number(run.startedAt)||Date.now()));
    const optionalTotal=chapterOptionalScore(number,progress),optionalThisRun=Math.max(0,optionalTotal-(Number(run.startOptional)||0));
    const rank=chapterRank(number,progress),completed=completedRrvvfoChapterCount(progress),percent=routeProgress(LOST_YEAR_ROUTES[0],progress);
    const newUnlocks=(progress.unlocks||[]).filter(value=>!(run.startUnlocks||[]).includes(value));
    const xpGained=Math.max(0,(Number(progress.storyXp)||0)-(Number(run.startXp)||0));
    this.results.querySelector('[data-story-results-title]').textContent=`CHAPTER ${number} • ${safe(chapter?.title||'COMPLETE')}`;
    this.results.querySelector('[data-story-result-rank]').textContent=rank;
    this.results.querySelector('[data-story-result-rank]').dataset.rank=rank;
    this.results.querySelector('[data-story-result-stats]').innerHTML=`
      <div><dt>Completion time</dt><dd>${formatTime(duration)}</dd></div>
      <div><dt>Story fights</dt><dd>${Number(run.fights)||0}</dd></div>
      <div><dt>XP earned this run</dt><dd>${xpGained}</dd></div>
      <div><dt>Optional quests</dt><dd>${optionalThisRun?`${optionalThisRun} completed this run`:`${optionalTotal} total completed`}</dd></div>
      <div><dt>Story level</dt><dd>${Number(progress.storyLevel)||1}</dd></div>
      <div><dt>Total route</dt><dd>${completed}/${RRVVFO_PLANNED_CHAPTER_COUNT} • ${percent}%</dd></div>`;
    this.results.querySelector('[data-story-result-rewards]').innerHTML=`<small>CHAPTER REWARDS</small><p>${newUnlocks.length?newUnlocks.map(value=>safe(value).replaceAll(/([A-Z])/g,' $1').toUpperCase()).join(' • '):xpGained?`${xpGained} STORY XP`:'STORY CHECKPOINT SECURED'}</p><span class="storyRunBadge">${run.replay?'REPLAY • PRACTICE':run.playtest?'PLAYTEST • TEMPORARY':'FIRST PLAY • SAVED'}</span>`;
    const afterglow=storyAfterglowFor(number,progress);
    this.results.querySelector('[data-story-afterglow-kicker]').textContent=afterglow.kicker;
    this.results.querySelector('[data-story-afterglow-title]').textContent=afterglow.title;
    this.results.querySelector('[data-story-afterglow-recap]').textContent=afterglow.recap;
    this.results.querySelector('[data-story-afterglow-changes]').innerHTML=afterglow.changes.map(value=>`<li>${safe(value)}</li>`).join('');
    this.results.querySelector('[data-story-afterglow-next]').textContent=afterglow.next;
    this.results.hidden=false;this.results.classList.add('show');this.results.querySelector('[data-story-results-close]').focus();
    document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:'chapterComplete'}}));
  }
  closeResults(){this.results?.classList.remove('show');setHidden(this.results,true)}
  continueFromResults(){const button=this.nativeContinue;this.closeResults();this.nativeContinue=null;this.nativeCompletionOverlay=null;if(button)button.click()}

  storyMenuContextActive(){const screen=document.getElementById('lostYearStoryScreen');return Boolean(screen&&!screen.hidden&&!currentStoryRoot())}
  onKey(event){
    if(event.key==='Escape'&&!this.playtest?.hidden){event.preventDefault();this.closePlaytest();return}
    const token=KEY_TO_CODE[event.code]||KEY_TO_CODE[event.key];if(!token||!this.storyMenuContextActive())return;
    this.acceptCodeToken(token);
  }
  acceptCodeToken(token){
    const expected=CODE[this.codeBuffer.length];
    if(token===expected)this.codeBuffer.push(token);else this.codeBuffer=token===CODE[0]?[token]:[];
    if(this.codeBuffer.length===CODE.length){this.codeBuffer=[];this.openPlaytest()}
  }
  pollController(){
    if(this.storyMenuContextActive()){
      const pad=navigator.getGamepads?.()?.find(Boolean);
      if(pad){
        const pressed=pad.buttons.map(button=>Boolean(button?.pressed));
        const map=[[12,'up'],[13,'down'],[14,'left'],[15,'right'],[1,'b'],[0,'a']];
        for(const [index,token] of map)if(pressed[index]&&!this.controllerButtons[index])this.acceptCodeToken(token);
        this.controllerButtons=pressed;
      }
    }
    this.controllerFrame=requestAnimationFrame(this.pollController);
  }

  snapshot(){
    const progress=loadLostYearProgress(),root=currentStoryRoot(),chapter=currentChapterNumber()||this.currentChapter;
    const reliability=inspectStoryReliability(progress,{active:Boolean(root),replay:this.currentReplay,playtest:this.currentPlaytest});
    const experience=Number(chapter)>=1&&Number(chapter)<=4?storyExperienceProfile(Number(chapter)):null;
    return{
      build:BUILD_VERSION,saveSchema:SAVE_SCHEMA_VERSION,
      chapter:chapter||'Story menu',mode:root?.dataset?.storyEngineMode||this.currentMode||'menu',runMode:reliability.runMode,temporary:reliability.temporary,saveable:reliability.saveable,saveHealth:reliability.health,saveIssues:reliability.issues,chapterStates:reliability.chapters,checkpoint:progress.lastCheckpoint,
      checkpointLabel:checkpointLabel(progress),storyLevel:progress.storyLevel,storyXp:progress.storyXp,
      pacingTarget:experience?`${experience.targetMinutes[0]}–${experience.targetMinutes[1]} min`:null,pacingCadence:experience?`${experience.cadenceMinutes[0]}–${experience.cadenceMinutes[1]} min between meaningful beats`:null,pacingRhythm:experience?.rhythm||[],
      completedMissions:progress.completedMissions,unlocks:progress.unlocks,
      chapter2State:progress.chapter2State,chapter3State:progress.chapter3State,chapter4State:progress.chapter4State,
      url:location.href,userAgent:navigator.userAgent,viewport:`${innerWidth}×${innerHeight}`,time:new Date().toISOString()
    };
  }
  refreshPlaytest(){
    const data=this.snapshot(),panel=this.playtest.querySelector('[data-playtest-reliability]');
    this.playtest.querySelector('[data-playtest-snapshot]').innerHTML=`<strong>${safe(data.build)}</strong><span>Chapter: ${data.chapter} • Mode: ${safe(data.mode).toUpperCase()}</span><span>Checkpoint: ${safe(data.checkpointLabel)}</span><span>Level ${data.storyLevel} • ${data.storyXp} XP</span>${data.pacingTarget?`<span>RPG pacing target: ${safe(data.pacingTarget)} • ${safe(data.pacingCadence)}</span>`:''}`;
    panel.dataset.health=data.saveHealth;
    panel.querySelector('[data-playtest-reliability-title]').textContent=`SAVE HEALTH • ${data.saveHealth}`;
    panel.querySelector('[data-playtest-reliability-mode]').textContent=`RUN: ${data.runMode} • ${data.saveable?'SAVEABLE':data.temporary?'TEMPORARY — DOES NOT SAVE':'NO ACTIVE RUN'}`;
    panel.querySelector('[data-playtest-reliability-issues]').textContent=data.saveIssues.length?data.saveIssues.join(' • '):'Chapter order, completion evidence, and checkpoint order agree.';
    this.playtest.querySelector('[data-playtest-flags]').textContent=JSON.stringify(data,null,2);
  }
  openPlaytest(){this.build();this.refreshPlaytest();this.playtest.hidden=false;this.playtest.classList.add('show');this.playtest.querySelector('[data-playtest-close]').focus()}
  closePlaytest(){this.playtest?.classList.remove('show');setHidden(this.playtest,true)}

  async handlePlaytestAction(action){
    if(action==='refreshFlags'){this.refreshPlaytest();return}
    if(action==='chapterSelect'){
      if(currentStoryRoot()){this.showObjective('EXIT THE ACTIVE CHAPTER FIRST','Use the chapter’s Story Menu exit before opening Chapter Select.','PLAYTEST TOOL');return}
      this.closePlaytest();document.dispatchEvent(new CustomEvent('pxplaytestopenstory'));return
    }
    if(action==='checkpoint'){this.closePlaytest();location.reload();return}
    if(action==='resetChapter'){
      if(currentStoryRoot()){this.showObjective('EXIT THE ACTIVE CHAPTER FIRST','Reset is blocked during live gameplay so the current session cannot overwrite the reset save.','PLAYTEST TOOL');return}
      this.resetCurrentChapter();return
    }
    if(action==='copyReport'){await this.copyReport();return}
    if(action==='downloadReport'){this.downloadReport();return}
  }
  reportText(){return`PARALLELS X PLAYTEST REPORT\n${'='.repeat(34)}\n${JSON.stringify(this.snapshot(),null,2)}\n\nPLAYER NOTES:\n- What happened?\n- What did you expect?\n- Can you repeat it?\n`}
  async copyReport(){
    const text=this.reportText();
    try{await navigator.clipboard.writeText(text);this.showObjective('BUG REPORT COPIED','Paste it into the chat with a screenshot or recording.','PLAYTEST TOOL')}catch{this.downloadReport()}
  }
  downloadReport(){
    const blob=new Blob([this.reportText()],{type:'text/plain'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`parallels-x-bug-report-${Date.now()}.txt`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  startChapter(number){
    const stepId=CHAPTER_START_STEP[number];if(!stepId)return;
    if(currentStoryRoot()){this.showObjective('RETURN TO THE STORY MENU FIRST','Use the chapter’s Story Menu exit, then enter the secret code again.','PLAYTEST TOOL');return}
    this.closePlaytest();document.dispatchEvent(new CustomEvent('pxplayteststartchapter',{detail:{number,stepId}}));
  }
  startChapterHub(number){
    if(number!==4)return;
    if(currentStoryRoot()){this.showObjective('RETURN TO THE STORY MENU FIRST','Use the chapter’s Story Menu exit, then enter the secret code again.','PLAYTEST TOOL');return}
    this.closePlaytest();document.dispatchEvent(new CustomEvent('pxplayteststartchapter',{detail:{number:4,stepId:'rrvvfo-04',entry:'hub'}}));
  }
  async startCombatTest(opponent){
    if(currentStoryRoot()){this.showObjective('RETURN TO THE STORY MENU FIRST','Quick combat tests are isolated so they cannot corrupt an active chapter.','PLAYTEST TOOL');return}
    this.closePlaytest();
    try{
      const {startConfiguredArenaBattle}=await import(`../arena/arena-mode.js?v=29a391-chapter4-ending-continuity-20260801`);
      startConfiguredArenaBattle({mode:'cpu',fighters:['rrvvfo',opponent],stageId:opponent==='wade'?'tournament':opponent==='bark'?'echo-mountain':'dojo',difficulty:'normal',koTarget:1});
    }catch(error){console.error('[Playtest combat]',error);this.showObjective('COMBAT TEST FAILED',safe(error.message||error),'PLAYTEST TOOL')}
  }
  resetCurrentChapter(){
    const number=currentChapterNumber()||this.currentChapter;
    if(!number){this.showObjective('NO ACTIVE CHAPTER','Open a released chapter first.','PLAYTEST TOOL');return}
    if(!confirm(`Reset Chapter ${number} and all later released chapters? This is a debug action.`))return;
    const progress=loadLostYearProgress(),remove=new Set();
    for(let chapter=number;chapter<=4;chapter++)for(const id of CHAPTER_MISSIONS[chapter]||[])remove.add(id);
    const next={...progress,completedMissions:(progress.completedMissions||[]).filter(id=>!remove.has(id)),lastCheckpoint:CHAPTER_START_STEP[number]};
    if(number<=2)next.chapter2State={};if(number<=3)next.chapter3State={};if(number<=4)next.chapter4State={};
    saveLostYearProgress(next);this.refreshPlaytest();this.showObjective(`CHAPTER ${number} RESET`,'Use Jump to Chapter or return to Chapter Select.','PLAYTEST TOOL');
  }
}

export function initializeStoryPolish(){
  if(!singleton)singleton=new StoryPolishController();
  return singleton.init();
}

export function storyPolishController(){return singleton||initializeStoryPolish()}
