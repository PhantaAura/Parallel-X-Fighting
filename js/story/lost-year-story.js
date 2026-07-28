import {
  LOST_YEAR_ROUTES,
  RRVVFO_CHAPTERS,
  loadLostYearProgress,
  routeProgress,
  rrvvfoChapterComplete,
  rrvvfoNextMission,
  rrvvfoRouteStarted,
  saveLostYearProgress
} from './lost-year-data.js?v=28b1-chapter2-compat-20260728-022318';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=28b1-chapter2-compat-20260728-022318';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=28b1-chapter2-compat-20260728-022318';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=28b3-replay-button-bluefix-20260728';
import {startRrvvfoRoadHub} from './rrvvfo-road-hub.js?v=28b1-chapter2-compat-20260728-022318';
import {startRrvvfoChapter3Preview} from './rrvvfo-chapter-3-preview.js?v=28b1-chapter2-compat-20260728-022318';
import {combatManualOwned,openCombatManual} from './combat-manual.js?v=28b1-chapter2-compat-20260728-022318';

const SCREEN_ID='lostYearStoryScreen';
let instance=null;

function routeGlyph(route){
  const map={rrvvfo:'R','alt-rover':'A+R',bark:'B',wade:'W',robert:'RB',oddballs:'OD','rev-metal':'R+M',final:'X'};
  return map[route.id]||route.lead.split(/\s|&/).filter(Boolean).map(word=>word[0]).join('').slice(0,3);
}

function buildScreen(){
  document.getElementById(SCREEN_ID)?.remove();
  const root=document.createElement('section');
  root.id=SCREEN_ID;
  root.hidden=true;
  root.setAttribute('aria-label','The Lost Year story menu');
  root.innerHTML=`
    <div class="lyShell">
      <header class="lyTop">
        <button type="button" data-ly-back>← MODE SELECT</button>
        <div class="storyModeTitle"><small>PARALLELS X • STORY</small><h1>THE LOST <span>YEAR</span></h1></div>
        <button type="button" data-story-help>HOW TO PLAY</button>
      </header>
      <div class="lyMeta">
        <span class="lyChip">CHARACTER ROUTES</span>
        <span class="lyChip">CONTINUOUS CHAPTERS</span>
        <span class="lyChip">LOCAL SAVE</span>
        <span class="lyChip">FULL CHAPTER 2 TOURNAMENT</span>
      </div>
      <div class="lyLayout" data-ly-layout>
        <main class="routeView" data-route-view><div class="routeGrid" data-route-grid></div></main>
        <aside class="routePanel" data-route-panel></aside>
        <main class="routeHomeView" data-route-home hidden></main>
      </div>
    </div>`;
  document.body.appendChild(root);
  return root;
}

function hideGameScreens(){
  ['startScreen','mainMenuScreen','menuScreen','gameScreen','arenaModeScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
}

class LostYearStoryScreen{
  constructor(){
    this.root=buildScreen();
    this.progress=loadLostYearProgress();
    this.selectedIndex=Math.max(0,LOST_YEAR_ROUTES.findIndex(route=>route.id===this.progress.selectedRoute));
    this.routeView=this.root.querySelector('[data-route-view]');
    this.routePanel=this.root.querySelector('[data-route-panel]');
    this.routeHome=this.root.querySelector('[data-route-home]');
    this.root.querySelector('[data-ly-back]').addEventListener('click',()=>this.handleBack());
    this.root.querySelector('[data-story-help]').addEventListener('click',()=>this.showHelp());
    this.root.addEventListener('keydown',event=>this.onKey(event));
  }

  open(){
    hideGameScreens();
    this.root.hidden=false;
    try{
      this.showRoutes({focus:true});
    }catch(error){
      console.error('[Lost Year] Story screen failed to render',error);
      this.showRenderError(error);
    }
  }

  close(){
    this.root.hidden=true;
    document.getElementById('mainMenuScreen')?.classList.remove('hidden');
    document.querySelector('[data-main-menu-id="story"]')?.focus();
  }

  handleBack(){
    if(!this.routeHome.hidden)this.showRoutes({focus:true});
    else this.close();
  }

  showHelp(){
    this.routeView.hidden=false;
    this.routePanel.hidden=false;
    this.routeHome.hidden=true;
    const panel=this.routePanel;
    panel.style.setProperty('--route-color','#1599ed');
    panel.innerHTML=`
      <div class="routeFeature"><b>?</b></div>
      <div class="routeDetails">
        <small>CONTINUOUS STORY FLOW</small>
        <h2>HOW TO PLAY</h2>
        <h3>MODE → CHARACTER ROUTE → CHAPTERS</h3>
        <p>Choose Rrvvfo to begin one uninterrupted route. The old short missions now act as hidden checkpoints inside larger chapters. Continue Story always loads the next unfinished checkpoint.</p>
        <dl><div><dt>Navigate</dt><dd>Arrow keys / D-Pad</dd></div><div><dt>Confirm</dt><dd>Enter / A</dd></div><div><dt>Back</dt><dd>Escape / B</dd></div></dl>
        <div class="routeActions"><button type="button" class="primary" data-close-help>GOT IT</button></div>
      </div>`;
    panel.querySelector('[data-close-help]')?.addEventListener('click',()=>this.renderRoutePanel());
    panel.querySelector('[data-close-help]')?.focus();
  }

  showRenderError(error){
    const layout=this.root.querySelector('[data-ly-layout]');
    layout.innerHTML=`<div class="storyError"><strong>THE LOST YEAR MENU COULD NOT LOAD.</strong><span>${String(error?.message||error||'Unknown story menu error')}</span></div>`;
  }

  onKey(event){
    if(event.key==='Escape'){
      event.preventDefault();
      this.handleBack();
      return;
    }
    if(!this.routeView.hidden&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const delta=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;
      this.selectRoute((this.selectedIndex+delta+LOST_YEAR_ROUTES.length)%LOST_YEAR_ROUTES.length,true);
    }
  }

  renderRoutes(){
    const grid=this.root.querySelector('[data-route-grid]');
    if(!grid)throw new Error('Route grid is missing.');
    grid.innerHTML=LOST_YEAR_ROUTES.map((route,index)=>`
      <button type="button" class="routeCard ${index===this.selectedIndex?'selected':''}" style="--route-color:${route.color}" data-route-id="${route.id}" aria-pressed="${index===this.selectedIndex}">
        <span class="routePortrait"><b>${routeGlyph(route)}</b></span>
        <span class="routeCopy"><span class="status">${route.availability}</span><h2>${route.lead}</h2><h3>${route.title}</h3></span>
        <span class="percent">${routeProgress(route,this.progress)}%</span>
      </button>`).join('');

    grid.querySelectorAll('[data-route-id]').forEach(button=>{
      button.addEventListener('focus',()=>{
        const index=LOST_YEAR_ROUTES.findIndex(route=>route.id===button.dataset.routeId);
        if(index>=0&&index!==this.selectedIndex)this.selectRoute(index,false);
      });
      button.addEventListener('click',()=>{
        const index=LOST_YEAR_ROUTES.findIndex(route=>route.id===button.dataset.routeId);
        if(index<0)return;
        this.selectedIndex=index;
        this.persistSelection();
        this.renderRoutes();
      });
    });
    this.renderRoutePanel();
  }

  persistSelection(){
    this.progress=saveLostYearProgress({...this.progress,selectedRoute:LOST_YEAR_ROUTES[this.selectedIndex].id});
  }

  selectRoute(index,focus=false){
    this.selectedIndex=Math.max(0,Math.min(LOST_YEAR_ROUTES.length-1,index));
    this.persistSelection();
    this.renderRoutes();
    const selected=this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`);
    selected?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
    if(focus)selected?.focus({preventScroll:true});
  }

  renderRoutePanel(){
    const route=LOST_YEAR_ROUTES[this.selectedIndex];
    const panel=this.routePanel;
    if(!route||!panel)throw new Error('Selected route panel is missing.');
    panel.style.setProperty('--route-color',route.color);
    const started=route.id==='rrvvfo'&&rrvvfoRouteStarted(this.progress);
    panel.innerHTML=`
      <div class="routeFeature"><b>${routeGlyph(route)}</b></div>
      <div class="routeDetails">
        <small>${route.availability}</small>
        <h2>${route.lead}</h2>
        <h3>${route.title}</h3>
        <p>${route.description}</p>
        <dl>
          <div><dt>Perspective</dt><dd>${route.perspective}</dd></div>
          <div><dt>Unlock</dt><dd>${route.unlock}</dd></div>
          <div><dt>Current build</dt><dd>${routeProgress(route,this.progress)}%</dd></div>
        </dl>
        ${route.available?`<div class="routeActions"><button type="button" class="primary" data-open-route>${started?'OPEN RRVVFO ROUTE':'BEGIN RRVVFO ROUTE'}</button></div>`:`<div class="lockedBanner">THIS CHARACTER ROUTE IS VISIBLE, BUT NOT PLAYABLE YET.</div>`}
      </div>`;
    panel.querySelector('[data-open-route]')?.addEventListener('click',()=>this.openRoute(route));
  }

  showRoutes({focus=false}={}){
    this.progress=loadLostYearProgress();
    this.routeView.hidden=false;
    this.routePanel.hidden=false;
    this.routeHome.hidden=true;
    this.renderRoutes();
    if(focus)this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  openRoute(route){
    if(!route?.available||route.id!=='rrvvfo')return;
    this.progress=loadLostYearProgress();
    if(!rrvvfoRouteStarted(this.progress)){
      this.progress=saveLostYearProgress({...this.progress,routeStarted:true,lastCheckpoint:'rrvvfo-00',selectedRoute:'rrvvfo'});
      this.startStep('rrvvfo-00','route');
      return;
    }
    this.showRouteHome({focus:true});
  }

  showRouteHome({focus=false}={}){
    this.progress=loadLostYearProgress();
    this.routeView.hidden=true;
    this.routePanel.hidden=true;
    this.routeHome.hidden=false;
    const next=rrvvfoNextMission(this.progress);
    const percent=routeProgress(LOST_YEAR_ROUTES[0],this.progress);
    const manualReady=combatManualOwned();
    const complete=!next;
    this.routeHome.innerHTML=`
      <div class="routeHomeTop"><button type="button" data-route-home-back>← CHARACTER ROUTES</button><h1>RRVVFO • RESTLESS FLAME</h1></div>
      <section class="routeHomePanel">
        <div class="routeHomeHero">
          <small>THE LOST YEAR • CONTINUOUS ROUTE</small>
          <h2>${complete?'CURRENT STORY COMPLETE':'CONTINUE THE ROUTE'}</h2>
          <p>${complete?'Rrvvfo completed the local tournament and exposed Plouke as the Sage in disguise. Chapter 3 now follows the finished tournament as a separate development preview.':'Sage training, the manual refresher, the living road, the open tournament hub, and the complete bracket now run as one connected story without returning to Mission Select.'}</p>
          <div class="routeProgressTrack" style="--route-progress:${percent}%"><i></i></div>
          <strong>${percent}% OF CURRENT RRVVFO CONTENT COMPLETE</strong>
          ${complete?'<div class="routeCompleteNote">CHAPTER 2 TOURNAMENT COMPLETE • CHAPTER 3 OPENING PREVIEW AVAILABLE FOR TESTING.</div>':''}
          <div class="routeHomeActions">
            <button type="button" class="primary" data-continue-route ${complete?'disabled':''}><strong>${complete?'CURRENT CONTENT COMPLETE':'CONTINUE STORY'}</strong><span>${complete?'Use Chapter Select to replay.':'Loads the next unfinished checkpoint.'}</span></button>
            <button type="button" data-open-manual ${manualReady?'':'disabled'}><strong>COMBAT MANUAL</strong><span>${manualReady?'Review every unlocked page.':'Sage has not given it to Rrvvfo yet.'}</span></button>
            <button type="button" data-free-explore ${this.progress.completedMissions.includes('rrvvfo-road')?'':'disabled'}><strong>FREE EXPLORE</strong><span>${this.progress.completedMissions.includes('rrvvfo-road')?'Replay the Training Grounds road.':'Complete the living road first.'}</span></button>
            <button type="button" data-route-home-back-2><strong>CHARACTER ROUTES</strong><span>Return to the shared Lost Year timeline.</span></button>
          </div>
        </div>
        <div class="chapterRail">
          ${RRVVFO_CHAPTERS.map(chapter=>{
            const chapterComplete=rrvvfoChapterComplete(chapter,this.progress);
            const unlocked=chapter.number===1||this.progress.completedMissions.includes('rrvvfo-road')||this.progress.completedMissions.includes('rrvvfo-02');
            const status=chapterComplete?'COMPLETE':chapter.preview&&unlocked?'DEVELOPMENT PREVIEW':unlocked?'PLAYABLE':'LOCKED';
            return `<div class="chapterRow ${chapterComplete?'isComplete':''}">
              <button type="button" class="chapterCard" data-chapter-number="${chapter.number}" ${(unlocked&&!chapterComplete)?'':'disabled'}>
                <span class="chapterNumber">${chapter.number}</span>
                <span><small>${status}</small><strong>${chapter.title}</strong><span>${chapter.description}</span></span>
              </button>
              ${chapterComplete?`<button type="button" class="chapterReplay" data-replay-chapter="${chapter.number}"><strong>REPLAY</strong><span>Restart this chapter from its first scene.</span></button>`:''}
            </div>`;
          }).join('')}
        </div>
      </section>`;
    this.routeHome.querySelectorAll('[data-route-home-back],[data-route-home-back-2]').forEach(button=>button.addEventListener('click',()=>this.showRoutes({focus:true})));
    this.routeHome.querySelector('[data-continue-route]')?.addEventListener('click',()=>this.continueRoute());
    this.routeHome.querySelector('[data-open-manual]')?.addEventListener('click',()=>openCombatManual());
    this.routeHome.querySelector('[data-free-explore]:not(:disabled)')?.addEventListener('click',()=>this.startStep('rrvvfo-road','freeExplore'));
    this.routeHome.querySelectorAll('[data-chapter-number]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.chapterNumber))));
    this.routeHome.querySelectorAll('[data-replay-chapter]').forEach(button=>button.addEventListener('click',()=>this.startChapter(Number(button.dataset.replayChapter),{replay:true})));
    if(focus)(this.routeHome.querySelector('[data-continue-route]:not(:disabled)')||this.routeHome.querySelector('[data-chapter-number]:not(:disabled)')||this.routeHome.querySelector('[data-replay-chapter]'))?.focus();
  }

  continueRoute(){
    this.progress=loadLostYearProgress();
    const next=rrvvfoNextMission(this.progress);
    if(next)this.startStep(next,'route');
  }

  startChapter(number,{replay=false}={}){
    this.progress=loadLostYearProgress();
    if(number===1){
      const chapter=RRVVFO_CHAPTERS[0];
      const firstIncomplete=chapter.missions.find(id=>!this.progress.completedMissions.includes(id));
      this.startStep(replay?'rrvvfo-00':(firstIncomplete||'rrvvfo-00'),'chapter1');
    }else if(number===2&&(this.progress.completedMissions.includes('rrvvfo-road')||this.progress.completedMissions.includes('rrvvfo-02'))){
      this.startStep('rrvvfo-02',replay?'chapter2-replay':'chapter2',{replay});
    }else if(number===3&&this.progress.completedMissions.includes('rrvvfo-02')){
      this.startStep('rrvvfo-03-preview','chapter3-preview');
    }
  }

  startStep(stepId,chainMode='route',starterOptions={}){
    const starters={
      'rrvvfo-00':startRrvvfoMission0,
      'rrvvfo-01':startRrvvfoMission1,
      'rrvvfo-road':startRrvvfoRoadHub,
      'rrvvfo-02':startRrvvfoMission2,
      'rrvvfo-03-preview':startRrvvfoChapter3Preview
    };
    const starter=starters[stepId];
    if(!starter)return;
    this.progress=saveLostYearProgress({...loadLostYearProgress(),routeStarted:true,lastCheckpoint:stepId,selectedRoute:'rrvvfo'});
    this.root.hidden=true;
    let completedThisRun=false;
    starter({
      ...starterOptions,
      onComplete:()=>{
        completedThisRun=true;
        this.progress=loadLostYearProgress();
      },
      onExit:()=>{
        this.progress=loadLostYearProgress();
        if(completedThisRun){
          if(stepId==='rrvvfo-00'&&(chainMode==='route'||chainMode==='chapter1')){
            this.startStep('rrvvfo-01',chainMode);
            return;
          }
          if(stepId==='rrvvfo-01'&&(chainMode==='route'||chainMode==='chapter1')){
            this.startStep('rrvvfo-road',chainMode);
            return;
          }
          if(stepId==='rrvvfo-road'&&chainMode==='route'){
            this.startStep('rrvvfo-02',chainMode);
            return;
          }
        }
        this.root.hidden=false;
        this.showRouteHome({focus:true});
      }
    });
  }
}

export function openLostYearStory(){
  if(!instance||!document.body.contains(instance.root))instance=new LostYearStoryScreen();
  instance.open();
  return instance;
}

export {LostYearStoryScreen};
