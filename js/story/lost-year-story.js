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
} from './lost-year-data.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoChapter3} from './rrvvfo-chapter-3.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoChapter4} from './rrvvfo-chapter-4.js?v=29a412-echo-ridge-20261122';
import {startRrvvfoChapter5,startRrvvfoChapter6,startRrvvfoChapter7,startRrvvfoChapter8} from './rrvvfo-chapters-5-8.js?v=29a412-echo-ridge-20261122';
import {PARALLEL_ROUTES,parallelMissionId,startParallelRouteChapter} from './parallel-route-story.js?v=29a413-parallel-routes-20261122';
import {combatManualOwned,grantCombatManual,openCombatManual} from './combat-manual.js?v=29a412-echo-ridge-20261122';
import {requireLandscapeForStory,showStoryStartupError,storyConfirm} from './story-ux.js?v=29a412-echo-ridge-20261122';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyPromptLabel,storyStatsMarkup} from './story-rpg-ui.js?v=29a412-echo-ridge-20261122';
import {inspectStoryReliability} from './story-reliability.js?v=29a412-echo-ridge-20261122';
import {renderTravelJournal} from './connected-world.js?v=29a412-echo-ridge-20261122';
import {fastTravelDestination,markFastTravelArrival,renderRevisitJournal,syncFastTravelNodes} from './revisit-loop.js?v=29a412-echo-ridge-20261122';

const SCREEN_ID='lostYearStoryScreen';
let instance=null;

function buildScreen(){
  document.getElementById(SCREEN_ID)?.remove();
  const root=document.createElement('section');
  root.id=SCREEN_ID;root.hidden=true;root.setAttribute('aria-label','Story Routes');
  root.innerHTML=`
    <div class="lyShell">
      <header class="lyTop">
        <button type="button" data-ly-back>MODE SELECT</button>
        <div class="storyModeTitle"><small>PARALLELS X • STORY</small><h1>ROUTE <span>SELECT</span></h1></div>
        <button type="button" data-story-help>CONTROLS</button>
      </header>
      <div class="lyMeta"><span class="lyChip">5 ROUTES AVAILABLE</span><span class="lyChip">28 PLAYABLE CHAPTERS</span><span class="lyChip">AUTO-SAVE</span><span class="lyChip">RPG LEVELS</span></div>
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

function routeDescription(id){return ({wade:'Use speed to cross broken routes, read the field, and stop treating the fastest path as the right one.',bark:'Reinforce damaged places, protect people, and hold Echo together while the others push ahead.',virek:'Hunt the stolen Emerald across Hollow’s fronts with overwhelming power and a growing sense of restraint.',oddballs:'Follow Raggie, Jimmy, and Jonathan through a museum heist, a missing Time Stone, and an accidental finale.'})[id]||'Follow the Lost Year from another point of view.'}

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
  onKey(event){if(event.key==='Escape'){event.preventDefault();this.handleBack()}if(event.key==='Enter'&&!this.routeView.hidden){const routeId=event.target.closest('[data-route-id]')?.dataset.routeId||this.progress.selectedRoute||'rrvvfo';event.preventDefault();this.openRoute(routeId)}}
  openHelp(){this.help.hidden=false;this.root.querySelector('[data-close-story-help]')?.focus()}
  closeHelp(){this.help.hidden=true;this.root.querySelector('[data-story-help]')?.focus()}

  showRoutes({focus=false}={}){
    this.progress=loadLostYearProgress();this.routeView.hidden=false;this.routePanel.hidden=false;this.routeHome.hidden=true;
    const next=rrvvfoNextMission(this.progress),all=[{id:'rrvvfo',lead:'RRVVFO',title:'THE LOST YEAR',color:'#e94b3c',description:'Follow Rrvvfo from Tangai’s Dojo into Echo Region and the Organization of the Red conspiracy.',chapters:8},...PARALLEL_ROUTES.map(r=>({id:r.id,lead:r.lead,title:r.title,color:r.color,description:routeDescription(r.id),chapters:r.chapters.length}))];
    const cards=all.map(r=>{const done=r.id==='rrvvfo'?(!next?8:completedRrvvfoChapterCount(this.progress)):(this.progress.parallelRouteChapters?.[r.id]||[]).length;return `<button type="button" class="routeCard" style="--route-color:${r.color}" data-route-id="${r.id}"><span class="routePortrait" aria-hidden="true"><b>${r.lead[0]}</b></span><span class="routeCopy"><span class="status">${done<r.chapters?'CONTINUE STORY':'ROUTE COMPLETE'} • ${done}/${r.chapters} CHAPTERS</span><h2>${r.lead}</h2><h3>${r.title}</h3><p>${r.description}</p></span><span class="routeStartHint">${storyPromptLabel('confirm')} • OPEN ROUTE</span></button>`}).join('');
    const card=this.root.querySelector('[data-route-grid]');card.classList.add('routeChooser');
    card.innerHTML=`<header class="storyRouteCarouselHeading"><small>STORY MODE</small><h2>CHOOSE YOUR ROUTE</h2><p>Five perspectives. Pick any route to begin; each keeps its own chapter progress.</p></header><div class="storyRouteCarouselStage routeChooserGrid">${cards}</div><div class="storyRoutePosition"><span class="selected"></span><strong>5 ROUTES</strong><small>ALL ROUTES AVAILABLE</small></div>`;
    card.querySelectorAll('[data-route-id]').forEach(button=>button.addEventListener('click',()=>this.openRoute(button.dataset.routeId)));
    if(focus)card.querySelector(`[data-route-id="${this.progress.selectedRoute||'rrvvfo'}"]`)?.focus()||card.querySelector('[data-route-id]')?.focus();
    const preview=all.find(r=>r.id===(this.progress.selectedRoute||'rrvvfo'))||all[0];this.routePanel.style.setProperty('--route-color',preview.color);
    this.routePanel.innerHTML=`<div class="routeDetails"><small>${preview.lead} STORY • ${preview.chapters} CHAPTERS</small><h2>${preview.title}</h2><p>${preview.description}</p>${storyStatsMarkup(this.progress,{compact:true})}${storyAttackStripMarkup({compact:true})}<div class="routeActions"><button type="button" class="primary" data-open-route="${preview.id}">OPEN ${preview.lead} ROUTE</button></div></div>`;
    this.routePanel.querySelector('[data-open-route]').addEventListener('click',event=>this.openRoute(event.currentTarget.dataset.openRoute));
  }

  openRoute(routeId='rrvvfo'){if(routeId==='rrvvfo')this.showRouteHome({focus:true});else this.showParallelRouteHome(routeId,{focus:true})}

  showParallelRouteHome(routeId,{focus=false}={}){
    const route=PARALLEL_ROUTES.find(item=>item.id===routeId);if(!route)return this.showRoutes({focus:true});
    this.progress=loadLostYearProgress();this.routeView.hidden=true;this.routePanel.hidden=true;this.routeHome.hidden=false;document.dispatchEvent(new CustomEvent('pxstorymenuopen'));
    const done=this.progress.parallelRouteChapters?.[routeId]||[],found=route.chapters.findIndex((_,index)=>!done.includes(index+1)),next=found<0?0:found+1;
    const rows=route.chapters.map((entry,index)=>{const number=index+1,unlocked=number===1||done.includes(number-1),complete=done.includes(number);return `<div class="chapterRow ${complete?'isComplete':''}"><button type="button" class="chapterCard" data-parallel-chapter="${number}" ${unlocked?'':'disabled'}><span class="chapterNumber">${number}</span><span><small>${complete?'CHAPTER COMPLETE':unlocked?'PLAYABLE':'LOCKED'}</small><strong>${entry[0]}</strong><span>${entry[1]}</span></span></button>${complete?`<button type="button" class="chapterReplay" data-replay-parallel="${number}"><strong>REPLAY</strong><span>Start a temporary run of this chapter.</span></button>`:''}</div>`}).join('');
    this.routeHome.innerHTML=`<div class="routeHomeTop"><button type="button" data-route-home-back>← ALL ROUTES</button><h1>${route.lead} • ${route.title}</h1></div><section class="routeHomePanel storyRpgHome"><div class="routeHomeHero"><small>${route.lead} CHARACTER ROUTE</small><h2>${next?'CHAPTER '+next:'ROUTE CLEARED'}</h2><p>${routeDescription(routeId)}</p><div class="routeProgressStatus"><strong>${done.length} / ${route.chapters.length} CHAPTERS COMPLETE</strong><span>Progress saves separately for each route.</span></div><div class="routeHomeActions"><button type="button" class="primary" data-continue-parallel ${next?'':'disabled'}><strong>${next?'BEGIN CHAPTER '+next:'ROUTE COMPLETE'}</strong><span>${next?route.chapters[next-1][0]:'Replay any chapter from Chapter Select.'}</span></button></div></div><div class="chapterRail"><header><small>${route.lead} ROUTE</small><h2>CHAPTER SELECT</h2></header>${rows}</div></section>`;
    this.routeHome.querySelector('[data-route-home-back]').addEventListener('click',()=>this.showRoutes({focus:true}));
    this.routeHome.querySelector('[data-continue-parallel]')?.addEventListener('click',()=>next&&this.startStep(parallelMissionId(routeId,next),'parallel'));
    this.routeHome.querySelectorAll('[data-parallel-chapter]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>this.startStep(parallelMissionId(routeId,Number(button.dataset.parallelChapter)),'parallel')));
    this.routeHome.querySelectorAll('[data-replay-parallel]').forEach(button=>button.addEventListener('click',()=>this.startStep(parallelMissionId(routeId,Number(button.dataset.replayParallel)),'parallel',{replay:true})));
    if(focus)this.routeHome.querySelector('[data-continue-parallel]:not(:disabled)')?.focus();
  }

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
    const parallelMatch=/^(wade|bark|virek|oddballs)-(\d{2})$/.exec(stepId||'');
    const starters={'rrvvfo-00':startRrvvfoMission0,'rrvvfo-01':startRrvvfoMission1,'rrvvfo-road':startRrvvfoRoadHub,'rrvvfo-02':startRrvvfoMission2,'rrvvfo-03':startRrvvfoChapter3,'rrvvfo-04':startRrvvfoChapter4,'rrvvfo-05':startRrvvfoChapter5,'rrvvfo-06':startRrvvfoChapter6,'rrvvfo-07':startRrvvfoChapter7,'rrvvfo-08':startRrvvfoChapter8};
    const starter=parallelMatch?options=>startParallelRouteChapter(parallelMatch[1],Number(parallelMatch[2]),options):starters[stepId];if(!starter)return;
    const progressBeforeStart=loadLostYearProgress();
    const stepNumber=Number(/^rrvvfo-0([0-8])$/.exec(stepId||'')?.[1]||parallelMatch?.[2]||0),chapter=parallelMatch?stepNumber:stepNumber>=2?stepNumber:1;
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
      if(completedThisRun&&chainMode==='parallel'&&parallelMatch&&!starterOptions.replay){const route=PARALLEL_ROUTES.find(item=>item.id===parallelMatch[1]),nextChapter=Number(parallelMatch[2])+1;if(route&&nextChapter<=route.chapters.length){this.startStep(parallelMissionId(route.id,nextChapter),'parallel');return}}
      if(completedThisRun&&chainMode==='chapter1'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road'};if(chain[stepId]){this.startStep(chain[stepId],'chapter1');return}
      }
      this.root.hidden=false;if(parallelMatch)this.showParallelRouteHome(parallelMatch[1],{focus:true});else this.showRouteHome({focus:true});
      }});
      const liveProgress=loadLostYearProgress();
      this.progress=saveLostYearProgress({...liveProgress,routeStarted:true,lastCheckpoint:starterOptions.replay?(progressBeforeStart.lastCheckpoint||liveProgress.lastCheckpoint):stepId,selectedRoute:parallelMatch?parallelMatch[1]:'rrvvfo'});
    }catch(error){
      saveLostYearProgress(progressBeforeStart);
      console.error('[Story] Chapter failed to start',error);this.root.hidden=true;
      showStoryStartupError(error,{onRetry:()=>{this.root.hidden=false;this.startStep(stepId,chainMode,starterOptions)},onReturn:()=>{this.root.hidden=false;if(parallelMatch)this.showParallelRouteHome(parallelMatch[1],{focus:true});else this.showRouteHome({focus:true})}});
    }
  }
}

export function openLostYearStory(){if(!instance||!document.body.contains(instance.root))instance=new LostYearStoryScreen();instance.open();return instance}
export {LostYearStoryScreen};
