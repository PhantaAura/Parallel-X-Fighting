import {
  LOST_YEAR_ROUTES,
  RRVVFO_CHAPTERS,
  RRVVFO_PLANNED_CHAPTER_COUNT,
  chapter4CompletionConflict,
  completedRrvvfoChapterCount,
  loadLostYearProgress,
  rrvvfoChapterComplete,
  rrvvfoNextMission,
  rrvvfoRouteStarted,
  repairChapter4Progress,
  routeProgress,
  saveLostYearProgress
} from './lost-year-data.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoChapter3} from './rrvvfo-chapter-3.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {startRrvvfoChapter4} from './rrvvfo-chapter-4.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {combatManualOwned,grantCombatManual,openCombatManual} from './combat-manual.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {requireLandscapeForStory,showStoryStartupError,storyConfirm} from './story-ux.js?v=29a363-chapter4-menu-state-recovery-20260801';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyPromptLabel,storyStatsMarkup} from './story-rpg-ui.js?v=29a363-chapter4-menu-state-recovery-20260801';

const SCREEN_ID='lostYearStoryScreen';
let instance=null;

function buildScreen(){
  document.getElementById(SCREEN_ID)?.remove();
  const root=document.createElement('section');
  root.id=SCREEN_ID;root.hidden=true;root.setAttribute('aria-label','Rrvvfo Story');
  root.innerHTML=`
    <div class="lyShell">
      <header class="lyTop">
        <button type="button" data-ly-back>← MODE SELECT</button>
        <div class="storyModeTitle"><small>PARALLELS X • STORY</small><h1>ROUTE <span>SELECT</span></h1></div>
        <button type="button" data-story-help>CONTROLS</button>
      </header>
      <div class="lyMeta"><span class="lyChip">1 ROUTE AVAILABLE</span><span class="lyChip">MORE ROUTES UNLOCK THROUGH STORY</span><span class="lyChip">AUTO-SAVE</span><span class="lyChip">RPG LEVELS</span></div>
      <div class="lyLayout" data-ly-layout>
        <main class="routeView" data-route-view><div class="routeGrid" data-route-grid></div></main>
        <aside class="routePanel" data-route-panel></aside>
        <main class="routeHomeView" data-route-home hidden></main>
      </div>
      <div class="storyRouteDetailsOverlay" data-story-help-modal hidden role="dialog" aria-modal="true" aria-labelledby="storyHelpTitle">
        <article class="storyRouteDetailsCard">
          <header><div><small>STORY CONTROLS</small><h2 id="storyHelpTitle">ONE SET OF CONTROLS</h2></div><button type="button" data-close-story-help>CLOSE</button></header>
          ${storyControlLegendMarkup()}
          <p>Story progresses automatically after a normal chapter clear. Chapter Select is only for replays or returning to a specific released section.</p>
        </article>
      </div>
    </div>`;
  document.body.appendChild(root);return root;
}

function hideGameScreens(){['startScreen','mainMenuScreen','menuScreen','gameScreen','arenaModeScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'))}
function hideLegacyMobileOverlays(){['touchChoice','touchTutorial','touchSettingsModal','touchMoveList','hotbarCustomizeModal','orientationPrompt','fullscreenPrompt'].forEach(id=>document.getElementById(id)?.classList.add('hidden'))}
function storyCheckpointLabel(id='rrvvfo-00'){return String(id).replace(/^rrvvfo-\d+-?/,'').replace(/^rrvvfo-/,'').replaceAll('-',' ').trim().toUpperCase()||'CHAPTER START'}
function chapterMenuComplete(chapter,progress){
  if(chapter?.number===4&&chapter4CompletionConflict(progress))return false;
  if(rrvvfoChapterComplete(chapter,progress))return true;
  if(chapter?.number===4)return Boolean(progress?.chapter4State?.chapterComplete);
  return false;
}
function chapterHasStarted(chapter,progress){
  const checkpoint=String(progress?.lastCheckpoint||'');
  if(chapter?.number===4)return checkpoint.startsWith('rrvvfo-04')||Boolean(Object.keys(progress?.chapter4State||{}).length);
  return false;
}

class LostYearStoryScreen{
  constructor(){
    this.root=buildScreen();this.progress=loadLostYearProgress();
    this.routeView=this.root.querySelector('[data-route-view]');this.routePanel=this.root.querySelector('[data-route-panel]');this.routeHome=this.root.querySelector('[data-route-home]');
    this.help=this.root.querySelector('[data-story-help-modal]');
    this.root.querySelector('[data-ly-back]').addEventListener('click',()=>this.handleBack());
    this.root.querySelector('[data-story-help]').addEventListener('click',()=>this.openHelp());
    this.root.querySelector('[data-close-story-help]').addEventListener('click',()=>this.closeHelp());
    this.help.addEventListener('pointerdown',event=>{if(event.target===this.help)this.closeHelp()});
    this.root.addEventListener('keydown',event=>this.onKey(event));
    this.playtestStartHandler=event=>{const number=Number(event.detail?.number)||0,stepId=event.detail?.stepId,playtestHub=event.detail?.entry==='hub';if(stepId)this.startStep(stepId,'playtest',{replay:true,playtestHub});else if(number)this.startChapter(number,{replay:true})};
    this.playtestOpenHandler=()=>{this.open();this.showRouteHome({focus:true})};
    document.addEventListener('pxplayteststartchapter',this.playtestStartHandler);
    document.addEventListener('pxplaytestopenstory',this.playtestOpenHandler);
    this.releaseLandscapeLock=null;
  }

  open(){
    hideGameScreens();hideLegacyMobileOverlays();this.root.hidden=false;this.releaseLandscapeLock?.();
    this.releaseLandscapeLock=requireLandscapeForStory({message:'Story Mode uses a horizontal layout for exploration, dialogue, combat, and RPG menus.'});
    this.showRoutes({focus:true});document.dispatchEvent(new CustomEvent('pxstorymenuopen'));
  }
  close(){
    this.releaseLandscapeLock?.();this.releaseLandscapeLock=null;this.root.hidden=true;
    const mainMenu=document.getElementById('mainMenuScreen');
    mainMenu?.classList.remove('hidden');
    mainMenu?.dispatchEvent(new CustomEvent('storyprogressrefresh'));
    document.querySelector('[data-main-menu-id="story"]')?.focus();
  }
  handleBack(){if(!this.help.hidden){this.closeHelp();return}if(!this.routeHome.hidden)this.showRoutes({focus:true});else this.close()}
  onKey(event){if(event.key==='Escape'){event.preventDefault();this.handleBack()}if(event.key==='Enter'&&!this.routeView.hidden){event.preventDefault();this.openRoute()}}
  openHelp(){this.help.hidden=false;this.root.querySelector('[data-close-story-help]')?.focus()}
  closeHelp(){this.help.hidden=true;this.root.querySelector('[data-story-help]')?.focus()}

  showRoutes({focus=false}={}){
    this.progress=loadLostYearProgress();this.routeView.hidden=false;this.routePanel.hidden=false;this.routeHome.hidden=true;
    const route=LOST_YEAR_ROUTES[0],next=rrvvfoNextMission(this.progress),started=rrvvfoRouteStarted(this.progress);
    const card=this.root.querySelector('[data-route-grid]');
    card.innerHTML=`
      <header class="storyRouteCarouselHeading"><small>STORY MODE</small><h2>ROUTE SELECT</h2><p>Select one character story at a time. More routes will appear as the larger story introduces them.</p></header>
      <div class="storyRouteCarouselStage">
        <button type="button" class="storyRouteArrow previous" disabled aria-label="Previous route">‹</button>
        <button type="button" class="routeCard selected rrvvfoOnlyRoute" style="--route-color:${route.color}" data-route-id="rrvvfo" aria-current="true">
          <span class="routePortrait routePortraitRrvvfo" aria-hidden="true"><b>R</b></span>
          <span class="routeCopy"><span class="status">${next?started?'CONTINUE AVAILABLE':'NEW STORY':'RELEASED CHAPTERS COMPLETE'}</span><h2>RRVVFO</h2><h3>THE LOST YEAR</h3><p>Experience what happened after Rrvvfo defeated Revvfo. Follow Rrvvfo through training, Tournament Road, the tournament, the mystery under the ring, and Echo Region.</p></span>
          <span class="routeStartHint">${storyPromptLabel('confirm')} • OPEN ROUTE</span>
        </button>
        <button type="button" class="storyRouteArrow next" disabled aria-label="Next route">›</button>
      </div>
      <div class="storyRoutePosition"><span class="selected"></span><strong>1 / 1</strong><small>RRVVFO</small></div>`;
    card.querySelector('[data-route-id="rrvvfo"]').addEventListener('click',()=>this.openRoute());
    this.routePanel.style.setProperty('--route-color',route.color);
    this.routePanel.innerHTML=`<div class="routeFeature routeFeatureRrvvfo"><b>R</b></div><div class="routeDetails">
      <small>RRVVFO STORY • 4 RELEASED / 8 PLANNED</small><h2>THE LOST YEAR</h2>
      <p>Experience what happened after Rrvvfo defeated Revvfo. Follow Rrvvfo through training, Tournament Road, the tournament, the mystery under the ring, and Echo Region.</p>
      ${storyStatsMarkup(this.progress,{compact:true})}${storyAttackStripMarkup({compact:true})}
      <div class="routeActions"><button type="button" class="primary" data-open-route>OPEN RRVVFO ROUTE</button></div>
    </div>`;
    this.routePanel.querySelector('[data-open-route]').addEventListener('click',()=>this.openRoute());
    if(focus)card.querySelector('[data-route-id="rrvvfo"]')?.focus();
  }

  openRoute(){this.showRouteHome({focus:true})}

  showRouteHome({focus=false}={}){
    this.progress=loadLostYearProgress();this.routeView.hidden=true;this.routePanel.hidden=true;this.routeHome.hidden=false;document.dispatchEvent(new CustomEvent('pxstorymenuopen'));
    if(this.progress.completedMissions.includes('rrvvfo-01')&&!combatManualOwned())grantCombatManual({pages:['movement','basic-combat','resource-control','advanced-defense','hotbar','lens-secrets']});
    const chapter4Conflict=chapter4CompletionConflict(this.progress);
    const next=chapter4Conflict?'rrvvfo-04':rrvvfoNextMission(this.progress),manualReady=combatManualOwned(),c1=chapterMenuComplete(RRVVFO_CHAPTERS[0],this.progress),c2=chapterMenuComplete(RRVVFO_CHAPTERS[1],this.progress),c3=chapterMenuComplete(RRVVFO_CHAPTERS[2],this.progress),c4=chapterMenuComplete(RRVVFO_CHAPTERS[3],this.progress);
    const progressForDisplay=chapter4Conflict?repairChapter4Progress(this.progress):this.progress;
    const progressPercent=routeProgress(LOST_YEAR_ROUTES[0],progressForDisplay),completedFullChapters=completedRrvvfoChapterCount(progressForDisplay);
    const primary=next?next==='rrvvfo-04'?'BEGIN CHAPTER 4':next==='rrvvfo-03'?'BEGIN CHAPTER 3':'CONTINUE STORY':'RELEASED STORY COMPLETE';
    this.routeHome.innerHTML=`
      <div class="routeHomeTop"><button type="button" data-route-home-back>← RRVVFO STORY</button><h1>RRVVFO • RESTLESS FLAME</h1></div>
      <section class="routeHomePanel storyRpgHome">
        <div class="routeHomeHero">
          <div class="routeHeroPortrait" aria-hidden="true"></div>
          <small>RPG / FIGHTING STORY</small><h2>${next?'CURRENT ADVENTURE':'RELEASED STORY CLEARED'}</h2>
          <p>${next?'Continue automatically through the next unfinished section. The route menu appears only when you choose to leave, replay, or check Rrvvfo’s growth.':'The four released chapters are complete. Rrvvfo’s eight-chapter route continues with Chapter 5.'}</p>
          <div class="routeProgressStatus"><strong>${progressPercent}% STORY COMPLETE</strong><span>${completedFullChapters} / ${RRVVFO_PLANNED_CHAPTER_COUNT} full chapters complete${c4?' • Chapter 4 complete':c3?' • Chapter 3 complete':''}</span></div>
          <div class="routeProgressTrack" style="--route-progress:${progressPercent}%"><i></i></div>
          <div class="storyRecoveryCard"><small>AUTO-SAVE RECOVERY</small><strong>${chapter4Conflict?'CHAPTER 4 SAVE REPAIR':storyCheckpointLabel(this.progress.lastCheckpoint)}</strong><span>${chapter4Conflict?'The save marks Chapter 4 complete without the ending checkpoints. Start Chapter 4 to repair only this chapter; Chapters 1–3 and RPG growth stay untouched.':'Continue resumes from this checkpoint. Major fights and QTEs use safe retries instead of restarting the full chapter.'}</span></div>
          ${storyStatsMarkup(this.progress)}${storyAttackStripMarkup()}
          <div class="routeHomeActions">
            <button type="button" class="primary" data-continue-route ${next?'':'disabled'}><strong>${primary}</strong><span>${next?'Loads the next unfinished section.':'Use Chapter Select to replay released content.'}</span></button>
            <button type="button" data-open-manual ${manualReady?'':'disabled'}><strong>SAGE MANUAL</strong><span>${manualReady?'Review controls and techniques.':'Unlocks during Chapter 1.'}</span></button>
            <button type="button" data-free-explore ${this.progress.completedMissions.includes('rrvvfo-road')?'':'disabled'}><strong>FREE EXPLORE</strong><span>Return to the Tournament Road.</span></button>
          </div>
        </div>
        <div class="chapterRail"><header><small>CHAPTER SELECT</small><h2>RELEASED STORY</h2></header>
          ${RRVVFO_CHAPTERS.map(chapter=>{
            const complete=chapterMenuComplete(chapter,this.progress),unlocked=chapter.number===1||(chapter.number===2&&c1)||(chapter.number===3&&c2)||(chapter.number===4&&c3);
            const started=chapterHasStarted(chapter,this.progress);
            const conflict=chapter.number===4&&chapter4Conflict;
            const status=conflict?'SAVE REPAIR NEEDED':complete?'CHAPTER COMPLETE':started?'IN PROGRESS':unlocked?'PLAYABLE':'LOCKED';
            const replayAvailable=conflict||complete||(chapter.number===4&&unlocked&&started);
            const replayLabel=conflict?'START FRESH':complete?'REPLAY':'RESTART';
            const replayDetail=conflict?'Repair the false completion and save your real playthrough.':complete?'Start a temporary run without changing your save.':'Restart Chapter 4 safely.';
            const replayButton=replayAvailable?`<button type="button" class="chapterReplay" ${conflict?'data-repair-chapter4':'data-replay-chapter="'+chapter.number+'"'}><strong>${replayLabel}</strong><span>${replayDetail}</span></button>`:'';
            const freshButton=chapter.number===4&&complete&&!conflict?`<button type="button" class="chapterReplay chapterReset" data-reset-chapter4><strong>START FRESH</strong><span>Reset only Chapter 4 and begin a saveable run.</span></button>`:'';
            const actions=replayButton||freshButton?`<div class="chapterReplayActions">${replayButton}${freshButton}</div>`:'';
            return `<div class="chapterRow ${complete?'isComplete':''} ${started&&!complete?'isInProgress':''} ${conflict?'hasSaveConflict':''}"><button type="button" class="chapterCard" data-chapter-number="${chapter.number}" ${unlocked?'':'disabled'}><span class="chapterNumber">${chapter.number}</span><span><small>${status}</small><strong>${chapter.title}</strong><span>${chapter.description}</span></span></button>${actions}</div>`;
          }).join('')}
          ${Array.from({length:Math.max(0,RRVVFO_PLANNED_CHAPTER_COUNT-RRVVFO_CHAPTERS.length)},(_,index)=>{
            const number=RRVVFO_CHAPTERS.length+index+1;
            return `<div class="chapterRow chapterFuture"><button type="button" class="chapterCard" disabled><span class="chapterNumber">${number}</span><span><small>PLANNED • NOT YET RELEASED</small><strong>CHAPTER ${number}</strong><span>Reserved for the continuing Rrvvfo story. No plot details are being invented before the official plan.</span></span></button></div>`;
          }).join('')}
          ${storyControlLegendMarkup()}
        </div>
      </section>`;
    this.routeHome.querySelector('[data-route-home-back]').addEventListener('click',()=>this.showRoutes({focus:true}));
    this.routeHome.querySelector('[data-continue-route]')?.addEventListener('click',()=>chapter4Conflict?this.repairAndStartChapter4():this.continueRoute());
    this.routeHome.querySelector('[data-open-manual]')?.addEventListener('click',()=>openCombatManual());
    this.routeHome.querySelector('[data-free-explore]:not(:disabled)')?.addEventListener('click',()=>this.startStep('rrvvfo-road','freeExplore'));
    this.routeHome.querySelectorAll('[data-chapter-number]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.chapterNumber))));
    this.routeHome.querySelectorAll('[data-replay-chapter]').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.replayChapter),{replay:true})));
    this.routeHome.querySelector('[data-repair-chapter4]')?.addEventListener('click',()=>this.repairAndStartChapter4({confirmed:true}));
    this.routeHome.querySelector('[data-reset-chapter4]')?.addEventListener('click',()=>this.repairAndStartChapter4());
    if(focus)(this.routeHome.querySelector('[data-continue-route]:not(:disabled)')||this.routeHome.querySelector('[data-chapter-number]:not(:disabled)'))?.focus();
  }

  async repairAndStartChapter4({confirmed=false}={}){
    if(!confirmed){
      const approved=await storyConfirm({title:'START CHAPTER 4 FRESH?',message:'This resets only Chapter 4. Chapters 1–3, Story level, XP, stats, settings, and other progress stay saved.',confirmLabel:'RESET CHAPTER 4'});
      if(!approved)return;
    }
    const current=loadLostYearProgress();
    this.progress=saveLostYearProgress(repairChapter4Progress(current));
    this.startStep('rrvvfo-04','chapter4',{replay:false,repairFalseCompletion:true});
  }

  continueRoute(){const next=rrvvfoNextMission(loadLostYearProgress());if(next)this.startStep(next,'route')}
  startChapter(number,{replay=false}={}){
    this.progress=loadLostYearProgress();
    if(number===1){const first=RRVVFO_CHAPTERS[0].missions.find(id=>!this.progress.completedMissions.includes(id));this.startStep(replay?'rrvvfo-00':(first||'rrvvfo-00'),'chapter1')}
    else if(number===2&&this.progress.completedMissions.includes('rrvvfo-road'))this.startStep('rrvvfo-02',replay?'chapter2-replay':'chapter2',{replay});
    else if(number===3&&this.progress.completedMissions.includes('rrvvfo-02'))this.startStep('rrvvfo-03',replay?'chapter3-replay':'chapter3',{replay});
    else if(number===4&&this.progress.completedMissions.includes('rrvvfo-03'))this.startStep('rrvvfo-04',replay?'chapter4-replay':'chapter4',{replay});
  }

  startStep(stepId,chainMode='route',starterOptions={}){
    const starters={'rrvvfo-00':startRrvvfoMission0,'rrvvfo-01':startRrvvfoMission1,'rrvvfo-road':startRrvvfoRoadHub,'rrvvfo-02':startRrvvfoMission2,'rrvvfo-03':startRrvvfoChapter3,'rrvvfo-04':startRrvvfoChapter4};
    const starter=starters[stepId];if(!starter)return;
    const progressBeforeStart=loadLostYearProgress();
    const chapter=stepId==='rrvvfo-02'?2:stepId==='rrvvfo-03'?3:stepId==='rrvvfo-04'?4:1;
    document.dispatchEvent(new CustomEvent('pxstorystepstart',{detail:{stepId,chapter,chainMode}}));
    this.root.hidden=true;let completedThisRun=false;
    try{
      starter({...starterOptions,onComplete:()=>{completedThisRun=true;this.progress=loadLostYearProgress()},onExit:()=>{
      this.progress=loadLostYearProgress();
      if(completedThisRun&&chainMode==='route'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road','rrvvfo-road':'rrvvfo-02','rrvvfo-02':'rrvvfo-03','rrvvfo-03':'rrvvfo-04'};
        if(chain[stepId]){this.startStep(chain[stepId],'route');return}
      }
      if(completedThisRun&&chainMode==='chapter1'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road'};if(chain[stepId]){this.startStep(chain[stepId],'chapter1');return}
      }
      this.root.hidden=false;this.showRouteHome({focus:true});
      }});
      const liveProgress=loadLostYearProgress();
      this.progress=saveLostYearProgress({...liveProgress,routeStarted:true,lastCheckpoint:starterOptions.replay?(progressBeforeStart.lastCheckpoint||liveProgress.lastCheckpoint):stepId,selectedRoute:'rrvvfo'});
    }catch(error){
      saveLostYearProgress(progressBeforeStart);
      console.error('[Story] Chapter failed to start',error);this.root.hidden=true;
      showStoryStartupError(error,{onRetry:()=>{this.root.hidden=false;this.startStep(stepId,chainMode,starterOptions)},onReturn:()=>{this.root.hidden=false;this.showRouteHome({focus:true})}});
    }
  }
}

export function openLostYearStory(){if(!instance||!document.body.contains(instance.root))instance=new LostYearStoryScreen();instance.open();return instance}
export {LostYearStoryScreen};
