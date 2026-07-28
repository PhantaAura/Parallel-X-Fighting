import {LOST_YEAR_ROUTES,loadLostYearProgress,missionUnlocked,routeProgress,saveLostYearProgress} from './lost-year-data.js?v=263-start-screen-boot-fix-20260727-205100';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=263-start-screen-boot-fix-20260727-205100';
import {startRrvvfoMission1} from './rrvvfo-mission-1.js?v=265-compatible-dialogue-20260727-214243';
import {startRrvvfoMission2} from './rrvvfo-mission-2.js?v=263-start-screen-boot-fix-20260727-205100';

const SCREEN_ID='lostYearStoryScreen';
let instance=null;

function routeGlyph(route){
  const map={rrvvfo:'R','alt-rover':'A+R',bark:'B',wade:'W',robert:'RB',oddballs:'OD',
    'rev-metal':'R+M',final:'X'};
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
        <span class="lyChip">CHARACTER EPISODES</span>
        <span class="lyChip">SHARED TIMELINE</span>
        <span class="lyChip">LOCAL SAVE</span>
        <span class="lyChip">MISSIONS 0–2 PLAYABLE</span>
      </div>
      <div class="lyLayout" data-ly-layout>
        <main class="routeView" data-route-view><div class="routeGrid" data-route-grid></div></main>
        <aside class="routePanel" data-route-panel></aside>
        <main class="missionView" data-mission-view hidden>
          <div class="missionPanel">
            <div class="missionHeader">
              <div><small data-mission-route></small><h2 data-mission-title></h2></div>
              <button type="button" data-route-back>← CHARACTER / EPISODE SELECT</button>
            </div>
            <p data-mission-description></p>
            <div class="missionList" data-mission-list></div>
            <section class="briefing" data-briefing hidden></section>
          </div>
        </main>
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
    this.missionView=this.root.querySelector('[data-mission-view]');
    this.root.querySelector('[data-ly-back]').addEventListener('click',()=>this.close());
    this.root.querySelector('[data-route-back]').addEventListener('click',()=>this.showRoutes({focus:true}));
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

  showHelp(){
    const panel=this.routePanel;
    panel.style.setProperty('--route-color','#1599ed');
    panel.innerHTML=`
      <div class="routeFeature"><b>?</b></div>
      <div class="routeDetails">
        <small>STORY MENU FLOW</small>
        <h2>HOW TO PLAY</h2>
        <h3>MODE → CHARACTER / EPISODE → MISSION</h3>
        <p>Choose a character episode from the row above. Open that story, choose an unlocked mission, review the briefing, and then begin.</p>
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
      if(!this.missionView.hidden)this.showRoutes({focus:true});
      else this.close();
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
          <div><dt>Progress</dt><dd>${routeProgress(route,this.progress)}%</dd></div>
        </dl>
        ${route.available?`<div class="routeActions"><button type="button" class="primary" data-open-route>CHOOSE THIS EPISODE</button></div>`:`<div class="lockedBanner">THIS CHARACTER EPISODE IS VISIBLE, BUT NOT PLAYABLE YET.</div>`}
      </div>`;
    panel.querySelector('[data-open-route]')?.addEventListener('click',()=>this.openRoute(route));
  }

  showRoutes({focus=false}={}){
    this.progress=loadLostYearProgress();
    this.routeView.hidden=false;
    this.routePanel.hidden=false;
    this.missionView.hidden=true;
    this.renderRoutes();
    if(focus)this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  openRoute(route){
    if(!route?.available)return;
    this.routeView.hidden=true;
    this.routePanel.hidden=true;
    this.missionView.hidden=false;
    this.root.querySelector('[data-mission-route]').textContent=`${route.lead} • MISSION SELECT`;
    this.root.querySelector('[data-mission-title]').textContent=route.title;
    this.root.querySelector('[data-mission-description]').textContent=route.description;
    const list=this.root.querySelector('[data-mission-list]');
    list.innerHTML=route.missions.map(mission=>{
      const completed=this.progress.completedMissions.includes(mission.id);
      const unlocked=missionUnlocked(mission,this.progress);
      const status=completed?'COMPLETED':unlocked?mission.status:`LOCKED • COMPLETE MISSION ${Math.max(0,mission.number-1)}`;
      return `<button type="button" class="missionCard" data-mission-id="${mission.id}" ${unlocked?'':'disabled'}><span class="missionNumber">${mission.number}</span><span><strong>${mission.title}</strong><span>${mission.description}</span></span><em>${status}</em></button>`;
    }).join('');
    list.querySelectorAll('[data-mission-id]').forEach(button=>button.addEventListener('click',()=>this.openBriefing(route.missions.find(mission=>mission.id===button.dataset.missionId),route)));
    const briefing=this.root.querySelector('[data-briefing]');
    briefing.hidden=true;
    list.querySelector('button:not(:disabled)')?.focus();
  }

  openBriefing(mission,route){
    if(!missionUnlocked(mission,this.progress))return;
    if(!this.progress.viewedBriefings.includes(mission.id)){
      this.progress=saveLostYearProgress({...this.progress,viewedBriefings:[...this.progress.viewedBriefings,mission.id]});
    }
    const briefing=this.root.querySelector('[data-briefing]');
    const starters={'rrvvfo-00':startRrvvfoMission0,'rrvvfo-01':startRrvvfoMission1,'rrvvfo-02':startRrvvfoMission2};
    const playable=Boolean(starters[mission.id]);
    briefing.innerHTML=`
      <small>MISSION ${mission.number} BRIEFING</small>
      <h2>${mission.title}</h2>
      <p>${mission.description}</p>
      <dl><div><dt>Location</dt><dd>${mission.stage}</dd></div></dl>
      <h3>MISSION OBJECTIVES</h3>
      <ul class="objectiveList">${mission.objectives.map(objective=>`<li>${objective}</li>`).join('')}</ul>
      <div class="canonNote"><strong>CANON:</strong> ${mission.note}</div>
      <div class="routeActions">${playable?`<button type="button" class="primary" data-play-mission>START MISSION ${mission.number}</button>`:'<button disabled>MISSION NOT BUILT YET</button>'}<button type="button" data-close-briefing>BACK TO MISSION LIST</button></div>`;
    briefing.hidden=false;
    briefing.querySelector('[data-close-briefing]').addEventListener('click',()=>{
      briefing.hidden=true;
      this.root.querySelector(`[data-mission-id="${mission.id}"]`)?.focus();
    });
    briefing.querySelector('[data-play-mission]')?.addEventListener('click',()=>{
      this.root.hidden=true;
      starters[mission.id]?.({
        onComplete:()=>{this.progress=loadLostYearProgress()},
        onExit:()=>{this.progress=loadLostYearProgress();this.root.hidden=false;this.openRoute(route)}
      });
    });
    briefing.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

export function openLostYearStory(){
  if(!instance||!document.body.contains(instance.root))instance=new LostYearStoryScreen();
  instance.open();
  return instance;
}

export {LostYearStoryScreen};
