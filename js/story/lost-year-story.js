import {
  LOST_YEAR_ROUTES,
  RRVVFO_CHAPTERS,
  loadLostYearProgress,
  rrvvfoChapterComplete,
  rrvvfoNextMission,
  rrvvfoRouteStarted,
  saveLostYearProgress
} from './lost-year-data.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {startRrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {startRrvvfoChapter3Preview} from './rrvvfo-chapter-3-preview.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {combatManualOwned,grantCombatManual,openCombatManual} from './combat-manual.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {requireLandscapeForStory,showStoryStartupError} from './story-ux.js?v=29a11-bark-wade-tournament-pacing-20260729';
import {storyAttackStripMarkup,storyControlLegendMarkup,storyPromptLabel,storyStatsMarkup} from './story-rpg-ui.js?v=29a11-bark-wade-tournament-pacing-20260729';

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
        <div class="storyModeTitle"><small>PARALLELS X • STORY</small><h1>THE LOST <span>YEAR</span></h1></div>
        <button type="button" data-story-help>CONTROLS</button>
      </header>
      <div class="lyMeta"><span class="lyChip">RRVVFO STORY</span><span class="lyChip">CHAPTERS 1–3</span><span class="lyChip">AUTO-SAVE</span><span class="lyChip">RPG LEVELS</span></div>
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
    this.releaseLandscapeLock=null;
  }

  open(){
    hideGameScreens();hideLegacyMobileOverlays();this.root.hidden=false;this.releaseLandscapeLock?.();
    this.releaseLandscapeLock=requireLandscapeForStory({message:'Story Mode uses a horizontal layout for exploration, dialogue, combat, and RPG menus.'});
    this.showRoutes({focus:true});
  }
  close(){this.releaseLandscapeLock?.();this.releaseLandscapeLock=null;this.root.hidden=true;document.getElementById('mainMenuScreen')?.classList.remove('hidden');document.querySelector('[data-main-menu-id="story"]')?.focus()}
  handleBack(){if(!this.help.hidden){this.closeHelp();return}if(!this.routeHome.hidden)this.showRoutes({focus:true});else this.close()}
  onKey(event){if(event.key==='Escape'){event.preventDefault();this.handleBack()}if(event.key==='Enter'&&!this.routeView.hidden){event.preventDefault();this.openRoute()}}
  openHelp(){this.help.hidden=false;this.root.querySelector('[data-close-story-help]')?.focus()}
  closeHelp(){this.help.hidden=true;this.root.querySelector('[data-story-help]')?.focus()}

  showRoutes({focus=false}={}){
    this.progress=loadLostYearProgress();this.routeView.hidden=false;this.routePanel.hidden=false;this.routeHome.hidden=true;
    const route=LOST_YEAR_ROUTES[0],next=rrvvfoNextMission(this.progress),started=rrvvfoRouteStarted(this.progress);
    const card=this.root.querySelector('[data-route-grid]');
    card.innerHTML=`<button type="button" class="routeCard selected rrvvfoOnlyRoute" style="--route-color:${route.color}" data-route-id="rrvvfo">
      <span class="routePortrait routePortraitRrvvfo" aria-hidden="true"><b>R</b></span>
      <span class="routeCopy"><span class="status">${next?started?'CONTINUE AVAILABLE':'NEW STORY':'CURRENT DEMO COMPLETE'}</span><h2>RRVVFO</h2><h3>RESTLESS FLAME</h3><p>Training, exploration, RPG growth, and tournament combat across Chapters 1–3.</p></span>
      <span class="routeStartHint">${next?`${storyPromptLabel('confirm')} • ${started?'CONTINUE':'BEGIN'}`:'OPEN CHAPTER SELECT'}</span>
    </button>`;
    card.querySelector('button').addEventListener('click',()=>this.openRoute());
    this.routePanel.style.setProperty('--route-color',route.color);
    this.routePanel.innerHTML=`<div class="routeFeature routeFeatureRrvvfo"><b>R</b></div><div class="routeDetails">
      <small>RRVVFO STORY • CHAPTERS 1–3</small><h2>RESTLESS FLAME</h2>
      <p>Click Rrvvfo to ${next?(started?'continue from the next unfinished checkpoint':'begin Chapter 1'):'open the RPG route menu and replay released chapters'}.</p>
      ${storyStatsMarkup(this.progress,{compact:true})}${storyAttackStripMarkup({compact:true})}
      <div class="routeActions"><button type="button" class="primary" data-open-route>${next?(started?'CONTINUE STORY':'BEGIN STORY'):'OPEN STORY MENU'}</button></div>
    </div>`;
    this.routePanel.querySelector('[data-open-route]').addEventListener('click',()=>this.openRoute());
    if(focus)card.querySelector('button')?.focus();
  }

  openRoute(){
    this.progress=loadLostYearProgress();const next=rrvvfoNextMission(this.progress);
    if(next){
      if(!rrvvfoRouteStarted(this.progress))this.progress=saveLostYearProgress({...this.progress,routeStarted:true,lastCheckpoint:'rrvvfo-00',selectedRoute:'rrvvfo'});
      this.startStep(next,'route');return;
    }
    this.showRouteHome({focus:true});
  }

  showRouteHome({focus=false}={}){
    this.progress=loadLostYearProgress();this.routeView.hidden=true;this.routePanel.hidden=true;this.routeHome.hidden=false;
    if(this.progress.completedMissions.includes('rrvvfo-01')&&!combatManualOwned())grantCombatManual({pages:['movement','basic-combat','resource-control','advanced-defense','hotbar','lens-secrets']});
    const next=rrvvfoNextMission(this.progress),manualReady=combatManualOwned(),c1=rrvvfoChapterComplete(RRVVFO_CHAPTERS[0],this.progress),c2=rrvvfoChapterComplete(RRVVFO_CHAPTERS[1],this.progress),c3=rrvvfoChapterComplete(RRVVFO_CHAPTERS[2],this.progress);
    const primary=next?next==='rrvvfo-03-preview'?'BEGIN CHAPTER 3 DEMO':'CONTINUE STORY':'CHAPTER 3 DEMO COMPLETE';
    this.routeHome.innerHTML=`
      <div class="routeHomeTop"><button type="button" data-route-home-back>← RRVVFO STORY</button><h1>RRVVFO • RESTLESS FLAME</h1></div>
      <section class="routeHomePanel storyRpgHome">
        <div class="routeHomeHero">
          <div class="routeHeroPortrait" aria-hidden="true"></div>
          <small>RPG / FIGHTING STORY</small><h2>${next?'CURRENT ADVENTURE':'RELEASED STORY CLEARED'}</h2>
          <p>${next?'Continue automatically through the next unfinished section. The route menu appears only when you choose to leave, replay, or check Rrvvfo’s growth.':'Chapters 1 and 2 are complete, and the current Chapter 3 investigation demo has been cleared.'}</p>
          ${storyStatsMarkup(this.progress)}${storyAttackStripMarkup()}
          <div class="routeHomeActions">
            <button type="button" class="primary" data-continue-route ${next?'':'disabled'}><strong>${primary}</strong><span>${next?'Loads the next unfinished section.':'Use Chapter Select to replay released content.'}</span></button>
            <button type="button" data-open-manual ${manualReady?'':'disabled'}><strong>SAGE MANUAL</strong><span>${manualReady?'Review controls and techniques.':'Unlocks during Chapter 1.'}</span></button>
            <button type="button" data-free-explore ${this.progress.completedMissions.includes('rrvvfo-road')?'':'disabled'}><strong>FREE EXPLORE</strong><span>Return to the Tournament Road.</span></button>
          </div>
        </div>
        <div class="chapterRail"><header><small>CHAPTER SELECT</small><h2>RELEASED STORY</h2></header>
          ${RRVVFO_CHAPTERS.map(chapter=>{
            const complete=rrvvfoChapterComplete(chapter,this.progress),unlocked=chapter.number===1||(chapter.number===2&&c1)||(chapter.number===3&&c2);
            const status=complete?(chapter.demo?'DEMO COMPLETE':'CHAPTER COMPLETE'):chapter.demo&&unlocked?'DEMO AVAILABLE':unlocked?'PLAYABLE':'LOCKED';
            return `<div class="chapterRow ${complete?'isComplete':''} ${chapter.demo?'isPreview':''}"><button type="button" class="chapterCard" data-chapter-number="${chapter.number}" ${unlocked?'':'disabled'}><span class="chapterNumber">${chapter.number}</span><span><small>${status}</small><strong>${chapter.title}</strong><span>${chapter.description}</span></span></button>${complete?`<button type="button" class="chapterReplay" data-replay-chapter="${chapter.number}"><strong>REPLAY</strong><span>Start from the beginning.</span></button>`:''}</div>`;
          }).join('')}
          ${storyControlLegendMarkup()}
        </div>
      </section>`;
    this.routeHome.querySelector('[data-route-home-back]').addEventListener('click',()=>this.showRoutes({focus:true}));
    this.routeHome.querySelector('[data-continue-route]')?.addEventListener('click',()=>this.continueRoute());
    this.routeHome.querySelector('[data-open-manual]')?.addEventListener('click',()=>openCombatManual());
    this.routeHome.querySelector('[data-free-explore]:not(:disabled)')?.addEventListener('click',()=>this.startStep('rrvvfo-road','freeExplore'));
    this.routeHome.querySelectorAll('[data-chapter-number]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.chapterNumber))));
    this.routeHome.querySelectorAll('[data-replay-chapter]').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.replayChapter),{replay:true})));
    if(focus)(this.routeHome.querySelector('[data-continue-route]:not(:disabled)')||this.routeHome.querySelector('[data-chapter-number]:not(:disabled)'))?.focus();
  }

  continueRoute(){const next=rrvvfoNextMission(loadLostYearProgress());if(next)this.startStep(next,'route')}
  startChapter(number,{replay=false}={}){
    this.progress=loadLostYearProgress();
    if(number===1){const first=RRVVFO_CHAPTERS[0].missions.find(id=>!this.progress.completedMissions.includes(id));this.startStep(replay?'rrvvfo-00':(first||'rrvvfo-00'),'chapter1')}
    else if(number===2&&this.progress.completedMissions.includes('rrvvfo-road'))this.startStep('rrvvfo-02',replay?'chapter2-replay':'chapter2',{replay});
    else if(number===3&&this.progress.completedMissions.includes('rrvvfo-02'))this.startStep('rrvvfo-03-preview','chapter3-demo');
  }

  startStep(stepId,chainMode='route',starterOptions={}){
    const starters={'rrvvfo-00':startRrvvfoMission0,'rrvvfo-01':startRrvvfoMission1,'rrvvfo-road':startRrvvfoRoadHub,'rrvvfo-02':startRrvvfoMission2,'rrvvfo-03-preview':startRrvvfoChapter3Preview};
    const starter=starters[stepId];if(!starter)return;
    this.progress=saveLostYearProgress({...loadLostYearProgress(),routeStarted:true,lastCheckpoint:stepId,selectedRoute:'rrvvfo'});this.root.hidden=true;let completedThisRun=false;
    try{starter({...starterOptions,onComplete:()=>{completedThisRun=true;this.progress=loadLostYearProgress()},onExit:()=>{
      this.progress=loadLostYearProgress();
      if(completedThisRun&&chainMode==='route'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road','rrvvfo-road':'rrvvfo-02','rrvvfo-02':'rrvvfo-03-preview'};
        if(chain[stepId]){this.startStep(chain[stepId],'route');return}
      }
      if(completedThisRun&&chainMode==='chapter1'){
        const chain={'rrvvfo-00':'rrvvfo-01','rrvvfo-01':'rrvvfo-road'};if(chain[stepId]){this.startStep(chain[stepId],'chapter1');return}
      }
      this.root.hidden=false;this.showRouteHome({focus:true});
    }});}catch(error){console.error('[Story] Chapter failed to start',error);this.root.hidden=true;showStoryStartupError(error,{onRetry:()=>{this.root.hidden=false;this.startStep(stepId,chainMode,starterOptions)},onReturn:()=>{this.root.hidden=false;this.showRouteHome({focus:true})}})}
  }
}

export function openLostYearStory(){if(!instance||!document.body.contains(instance.root))instance=new LostYearStoryScreen();instance.open();return instance}
export {LostYearStoryScreen};
