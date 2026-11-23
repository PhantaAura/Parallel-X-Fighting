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
} from './lost-year-data.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoChapter3} from './rrvvfo-chapter-3.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoChapter4} from './rrvvfo-chapter-4.js?v=29a411-orgred-chapters-20261122';
import {startRrvvfoChapter5,startRrvvfoChapter6,startRrvvfoChapter7,startRrvvfoChapter8} from './rrvvfo-chapters-5-8.js?v=29a411-orgred-chapters-20261122';
import {combatManualOwned,grantCombatManual,openCombatManual} from './combat-manual.js?v=29a411-orgred-chapters-20261122';
import {requireLandscapeForStory,showStoryStartupError,storyConfirm} from './story-ux.js?v=29a411-orgred-chapters-20261122';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyPromptLabel,storyStatsMarkup} from './story-rpg-ui.js?v=29a411-orgred-chapters-20261122';
import {inspectStoryReliability} from './story-reliability.js?v=29a411-orgred-chapters-20261122';
import {renderTravelJournal} from './connected-world.js?v=29a411-orgred-chapters-20261122';
import {fastTravelDestination,markFastTravelArrival,renderRevisitJournal,syncFastTravelNodes} from './revisit-loop.js?v=29a411-orgred-chapters-20261122';

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
      <div class="lyMeta"><span class="lyChip">1 ROUTE AVAILABLE</span><span class="lyChip">8 PLAYABLE CHAPTERS</span><span class="lyChip">AUTO-SAVE</span><span class="lyChip">RPG LEVELS</span></div>
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
  if(chapter?.number>=5)return checkpoint.startsWith('rrvvfo-0'+chapter.number)||Boolean(Object.keys(progress?.['chapter'+chapter.number+'State']||{}).length);
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
      <header class="storyRouteCarouselHeading"><small>STORY MODE</small><h2>ROUTE SELECT</h2><p>Select the complete Rrvvfo route. New routes will appear as the larger story introduces them.</p></header>
      <div class="storyRouteCarouselStage">
        <button type="button" class="storyRouteArrow previous" disabled aria-label="Previous route">‹</button>
        <button type="button" class="routeCard selected rrvvfoOnlyRoute" style="--route-color:${route.color}" data-route-id="rrvvfo" aria-current="true">
          <span class="routePortrait routePortraitRrvvfo" aria-hidden="true"><b>R</b></span>
          <span class="routeCopy"><span class="status">${next?started?'CONTINUE AVAILABLE':'NEW STORY':'SEASON ONE COMPLETE'}</span><h2>RRVVFO</h2><h3>THE LOST YEAR</h3><p>Follow Rrvvfo from training and Tournament Road through Echo Region, the Organization of the Red conspiracy, and the clash with his clone.</p></span>
          <span class="routeStartHint">${storyPromptLabel('confirm')} • OPEN ROUTE</span>
        </button>
        <button type="button" class="storyRouteArrow next" disabled aria-label="Next route">›</button>
      </div>
      <div class="storyRoutePosition"><span class="selected"></span><strong>1 / 1</strong><small>RRVVFO</small></div>`;
    card.querySelector('[data-route-id="rrvvfo"]').addEventListener('click',()=>this.openRoute());
    this.routePanel.style.setProperty('--route-color',route.color);
    this.routePanel.innerHTML=`<div class="routeFeature routeFeatureRrvvfo"><b>R</b></div><div class="routeDetails">
      <small>RRVVFO STORY • 8 CHAPTERS PLAYABLE</small><h2>THE LOST YEAR</h2>
      <p>Follow Rrvvfo from the tournament and Echo Region into the Organization of the Red conspiracy, the clone’s identity crisis, and the Season 1 finale.</p>
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
    const chapter4Conflict=chapter4CompletionConflict(this.progress),reliability=inspectStoryReliability(this.progress);
    const next=chapter4Conflict?'rrvvfo-04':rrvvfoNextMission(this.progress),manualReady=combatManualOwned(),complete=RRVVFO_CHAPTERS.map(chapter=>chapterMenuComplete(chapter,this.progress));
    const progressForDisplay=chapter4Conflict?repairChapter4Progress(this.progress):this.progress;
    const progressPercent=routeProgress(LOST_YEAR_ROUTES[0],progressForDisplay),completedFullChapters=completedRrvvfoChapterCount(progressForDisplay);
    const nextChapter=Number(/^rrvvfo-0([4-8])$/.exec(next||'')?.[1]||0);
    const primary=next?nextChapter?'BEGIN CHAPTER '+nextChapter:next==='rrvvfo-03'?'BEGIN CHAPTER 3':'CONTINUE STORY':'SEASON 1 COMPLETE';
    this.routeHome.innerHTML=`
      <div class="routeHomeTop"><button type="button" data-route-home-back>← RRVVFO STORY</button><h1>RRVVFO • RESTLESS FLAME</h1></div>
      <section class="routeHomePanel storyRpgHome">
        <div class="routeHomeHero">
          <div class="routeHeroPortrait" aria-hidden="true"></div>
          <small>RPG / FIGHTING STORY</small><h2>${next?'CURRENT ADVENTURE':'RELEASED STORY CLEARED'}</h2>
          <p>${next?'Continue automatically through the next unfinished section. The route menu appears only when you choose to leave, replay, or check Rrvvfo’s growth.':'The complete eight-chapter route is finished. The Co-Leader’s escape leaves the next conflict open.'}</p>
          <div class="routeProgressStatus"><strong>${progressPercent}% STORY COMPLETE</strong><span>${completedFullChapters} / ${RRVVFO_PLANNED_CHAPTER_COUNT} chapters complete${complete[3]?' • Chapter 4 complete':complete[2]?' • Chapter 3 complete':''}</span></div>
          <div class="routeProgressTrack" style="--route-progress:${progressPercent}%"><i></i></div>
          <div class="storyRecoveryCard"><small>AUTO-SAVE RECOVERY • SAVE HEALTH ${reliability.health}</small><strong>${chapter4Conflict?'CHAPTER 4 SAVE REPAIR':storyCheckpointLabel(this.progress.lastCheckpoint)}</strong><span>${chapter4Conflict?'The save marks Chapter 4 complete without the ending checkpoints. Start Chapter 4 to repair only this chapter; Chapters 1–3 and RPG growth stay untouched.':reliability.issues.length?reliability.issues[0]:'Continue resumes from this checkpoint. Major fights and QTEs use safe retries instead of restarting the full chapter.'}</span></div>
          ${storyStatsMarkup(this.progress)}${storyAttackStripMarkup()}${renderTravelJournal(this.progress)}${renderRevisitJournal(this.progress)}
          <div class="routeHomeActions">
            <button type="button" class="primary" data-continue-route ${next?'':'disabled'}><strong>${primary}</strong><span>${next?'Loads the next unfinished section.':'Use Chapter Select to replay released content.'}</span></button>
            <button type="button" data-open-manual ${manualReady?'':'disabled'}><strong>SAGE MANUAL</strong><span>${manualReady?'Review controls and techniques.':'Unlocks during Chapter 1.'}</span></button>
            <button type="button" data-free-explore ${this.progress.completedMissions.includes('rrvvfo-road')?'':'disabled'}><strong>FREE EXPLORE</strong><span>Return to the Tournament Road.</span></button>
          </div>
        </div>
        <div class="chapterRail"><header><small>CHAPTER SELECT</small><h2>SEASON 1</h2></header>
          ${RRVVFO_CHAPTERS.map(chapter=>{
            const isComplete=complete[chapter.number-1],unlocked=chapter.number===1||complete.slice(0,chapter.number-1).every(Boolean);
            const started=chapterHasStarted(chapter,this.progress);
            const conflict=chapter.number===4&&chapter4Conflict;
            const status=conflict?'SAVE REPAIR NEEDED':isComplete?'CHAPTER COMPLETE':started?'IN PROGRESS':unlocked?'PLAYABLE':'LOCKED';
            const replayAvailable=conflict||isComplete||(chapter.number===4&&unlocked&&started);
            const replayLabel=conflict?'START FRESH':isComplete?'REPLAY':'RESTART';
            const replayDetail=conflict?'Repair the false completion and save your real playthrough.':isComplete?'Start a temporary run without changing your save.':chapter.number>=5?'Restart this chapter from its opening. Saved objective checkpoints remain intact.':'Restart Chapter 4 safely.';
            const replayButton=replayAvailable?`<button type="button" class="chapterReplay" ${conflict?'data-repair-chapter4':'data-replay-chapter="'+chapter.number+'"'}><strong>${replayLabel}</strong><span>${replayDetail}</span></button>`:'';
            const freshButton=chapter.number===4&&isComplete&&!conflict?`<button type="button" class="chapterReplay chapterReset" data-reset-chapter4><strong>START FRESH</strong><span>Reset only Chapter 4 and begin a saveable run.</span></button>`:'';
            const restartButton=chapter.number>=5&&unlocked&&started&&!isComplete?`<button type="button" class="chapterReplay chapterReset" data-restart-chapter="${chapter.number}"><strong>RESTART</strong><span>Restart this chapter and clear later chapter progress.</span></button>`:'';
            const actions=replayButton||freshButton||restartButton?`<div class="chapterReplayActions">${replayButton}${freshButton}${restartButton}</div>`:'';
            return `<div class="chapterRow ${isComplete?'isComplete':''} ${started&&!isComplete?'isInProgress':''} ${conflict?'hasSaveConflict':''}"><button type="button" class="chapterCard" data-chapter-number="${chapter.number}" ${unlocked?'':'disabled'}><span class="chapterNumber">${chapter.number}</span><span><small>${status}</small><strong>${chapter.title}</strong><span>${chapter.description}</span></span></button>${actions}</div>`;
          }).join('')}
          ${storyControlLegendMarkup()}
        </div>
      </section>`;
    this.routeHome.querySelector('[data-route-home-back]').addEventListener('click',()=>this.showRoutes({focus:true}));
    this.routeHome.querySelector('[data-continue-route]')?.addEventListener('click',()=>chapter4Conflict?this.repairAndStartChapter4():this.continueRoute());
    this.routeHome.querySelector('[data-open-manual]')?.addEventListener('click',()=>openCombatManual());
    this.routeHome.querySelector('[data-free-explore]:not(:disabled)')?.addEventListener('click',()=>this.startStep('rrvvfo-road','freeExplore'));
    this.routeHome.querySelectorAll('[data-fast-travel]').forEach(button=>button.addEventListener('click',()=>this.fastTravel(button.dataset.fastTravel)));
    this.routeHome.querySelectorAll('[data-chapter-number]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.chapterNumber))));
    this.routeHome.querySelectorAll('[data-replay-chapter]').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.replayChapter),{replay:true})));
    this.routeHome.querySelector('[data-repair-chapter4]')?.addEventListener('click',()=>this.repairAndStartChapter4({confirmed:true}));
    this.routeHome.querySelector('[data-reset-chapter4]')?.addEventListener('click',()=>this.repairAndStartChapter4());
    this.routeHome.querySelectorAll('[data-restart-chapter]').forEach(button=>button.addEventListener('click',()=>this.restartChapter(Number(button.dataset.restartChapter))));
    if(focus)(this.routeHome.querySelector('[data-continue-route]:not(:disabled)')||this.routeHome.querySelector('[data-chapter-number]:not(:disabled)'))?.focus();
  }


  fastTravel(id){
    let progress=syncFastTravelNodes(loadLostYearProgress()),destination=fastTravelDestination(progress,id);if(!destination)return;
    progress=markFastTravelArrival(progress,id);this.progress=saveLostYearProgress(progress);
    if(id==='tournamentPlaza'){this.startStep('rrvvfo-02','fastTravel',{revisit:true});return}
    if(id==='echoVillage'){this.startStep('rrvvfo-04','fastTravel',{revisit:true});return}
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

  async restartChapter(number){
    if(number<5||number>8)return;
    const confirmed=await storyConfirm({title:'RESTART CHAPTER '+number+'?',message:'This resets Chapter '+number+' and later chapters. Earlier chapters and Story XP stay saved.',confirmLabel:'RESTART CHAPTER '+number});
    if(!confirmed)return;
    const progress=loadLostYearProgress(),remove=new Set(),keys=['redArchiveCipher','mirrorMemoryTruth','redCloneAlliance','doubleSolarWaveMastery'].slice(number-5);
    for(let chapter=number;chapter<=8;chapter++)for(const id of RRVVFO_CHAPTERS[chapter-1]?.missions||[])remove.add(id);
    const next={...progress,completedMissions:(progress.completedMissions||[]).filter(id=>!remove.has(id)),keyItems:(progress.keyItems||[]).filter(id=>!keys.includes(id)),lastCheckpoint:'rrvvfo-0'+number,routeStarted:true,selectedRoute:'rrvvfo'};
    for(let chapter=number;chapter<=8;chapter++){
      const state=progress['chapter'+chapter+'State']||{};
      next['chapter'+chapter+'State']={version:1,checkpointIndex:0,decisions:{},quests:{},completed:false,failures:{},awardedFights:Array.isArray(state.awardedFights)?[...state.awardedFights]:[]};
    }
    this.progress=saveLostYearProgress(next);this.startStep('rrvvfo-0'+number,'chapter'+number);
  }

  continueRoute(){const next=rrvvfoNextMission(loadLostYearProgress());if(next)this.startStep(next,'route')}
  startChapter(number,{replay=false}={}){
    this.progress=loadLostYearProgress();
    if(number===1){const first=RRVVFO_CHAPTERS[0].missions.find(id=>!this.progress.completedMissions.includes(id));this.startStep(replay?'rrvvfo-00':(first||'rrvvfo-00'),'chapter1')}
    else if(number===2&&this.progress.completedMissions.includes('rrvvfo-road'))this.startStep('rrvvfo-02',replay?'chapter2-replay':'chapter2',{replay});
    else if(number===3&&this.progress.completedMissions.includes('rrvvfo-02'))this.startStep('rrvvfo-03',replay?'chapter3-replay':'chapter3',{replay});
    else if(number===4&&this.progress.completedMissions.includes('rrvvfo-03'))this.startStep('rrvvfo-04',replay?'chapter4-replay':'chapter4',{replay});
    else if(number>=5&&number<=8&&this.progress.completedMissions.includes('rrvvfo-0'+(number-1)))this.startStep('rrvvfo-0'+number,replay?'chapter'+number+'-replay':'chapter'+number,{replay});
  }

  startStep(stepId,chainMode='route',starterOptions={}){
    const starters={'rrvvfo-00':startRrvvfoMission0,'rrvvfo-01':startRrvvfoMission1,'rrvvfo-road':startRrvvfoRoadHub,'rrvvfo-02':startRrvvfoMission2,'rrvvfo-03':startRrvvfoChapter3,'rrvvfo-04':startRrvvfoChapter4,'rrvvfo-05':startRrvvfoChapter5,'rrvvfo-06':startRrvvfoChapter6,'rrvvfo-07':startRrvvfoChapter7,'rrvvfo-08':startRrvvfoChapter8};
    const starter=starters[stepId];if(!starter)return;
    const progressBeforeStart=loadLostYearProgress();
    const stepNumber=Number(/^rrvvfo-0([0-8])$/.exec(stepId||'')?.[1]||0),chapter=stepNumber>=2?stepNumber:1;
    document.dispatchEvent(new CustomEvent('pxstorystepstart',{detail:{stepId,chapter,chainMode,replay:Boolean(starterOptions.replay),playtest:chainMode==='playtest'}}));
    this.root.hidden=true;let completedThisRun=false;
    try{
      starter({...starterOptions,chainMode,onComplete:()=>{completedThisRun=true;this.progress=loadLostYearProgress()},onExit:options=>{
      document.body.dataset.storyRunMode='';
      this.progress=loadLostYearProgress();
      if(completedThisRun&&options?.continueRoute!==false&&chainMode==='route'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road','rrvvfo-road':'rrvvfo-02','rrvvfo-02':'rrvvfo-03','rrvvfo-03':'rrvvfo-04','rrvvfo-04':'rrvvfo-05','rrvvfo-05':'rrvvfo-06','rrvvfo-06':'rrvvfo-07','rrvvfo-07':'rrvvfo-08'};
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
