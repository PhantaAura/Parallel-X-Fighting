import {LOST_YEAR_ROUTES,loadLostYearProgress,routeProgress,saveLostYearProgress} from './lost-year-data.js?v=25c1-story-data';
import {startRrvvfoMission0} from './rrvvfo-mission-0.js?v=25c6-animated-sage';

const SCREEN_ID='lostYearStoryScreen';
const STYLE_ID='lostYearStoryStyles';
let instance=null;

function installStyles(){
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
#${SCREEN_ID}[hidden]{display:none!important}
#${SCREEN_ID}{position:fixed;inset:0;z-index:1400;overflow:auto;background:radial-gradient(circle at 18% 12%,#51223d 0,#171125 34%,#070910 76%);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
#${SCREEN_ID} *{box-sizing:border-box}
#${SCREEN_ID}:before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(118deg,transparent 0 45%,#ff4b821d 45% 46%,transparent 46% 100%),repeating-linear-gradient(90deg,transparent 0 79px,#ffffff07 80px);opacity:.72}
#${SCREEN_ID} .lyShell{position:relative;z-index:1;width:min(1280px,100%);min-height:100%;margin:auto;padding:24px clamp(16px,3vw,42px) 42px}
#${SCREEN_ID} .lyTop{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:20px}
#${SCREEN_ID} .lyBrand small,#${SCREEN_ID} .routePanel small,#${SCREEN_ID} .missionPanel small{display:block;color:#ff9bc1;font-size:11px;font-weight:1000;letter-spacing:.16em}
#${SCREEN_ID} .lyBrand h1{margin:3px 0 0;font-size:clamp(34px,5vw,64px);line-height:.92;font-style:italic;letter-spacing:-.045em;text-shadow:0 4px #2b0b1b}
#${SCREEN_ID} .lyBrand h1 span{color:#ff4b82}
#${SCREEN_ID} .lyBrand p{max-width:720px;margin:10px 0 0;color:#d8cfe3;line-height:1.45}
#${SCREEN_ID} button{border:2px solid #ffffff38;border-radius:8px;background:#171725;color:#fff;padding:11px 15px;font-weight:950;letter-spacing:.04em;cursor:pointer}
#${SCREEN_ID} button:hover,#${SCREEN_ID} button:focus-visible{border-color:#ff86b4;outline:3px solid #ff86b440;outline-offset:2px}
#${SCREEN_ID} button.primary{background:linear-gradient(135deg,#c51f64,#6e2bd2);border-color:#ffc1d9}
#${SCREEN_ID} button:disabled{cursor:not-allowed;opacity:.5;filter:saturate(.45)}
#${SCREEN_ID} .lyMeta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
#${SCREEN_ID} .lyChip{padding:7px 10px;border:1px solid #ffffff24;border-radius:999px;background:#090a12c7;color:#ded7e8;font-size:11px;font-weight:900}
#${SCREEN_ID} .lyLayout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(300px,.7fr);gap:18px;align-items:start}
#${SCREEN_ID} .routeView[hidden],#${SCREEN_ID} .routePanel[hidden],#${SCREEN_ID} .missionView[hidden]{display:none!important}
#${SCREEN_ID} .routeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#${SCREEN_ID} .routeCard{position:relative;display:block;width:100%;min-height:154px;padding:16px;text-align:left;overflow:hidden;background:linear-gradient(150deg,#26263ce8,#0c0d16f5 74%);border-color:#ffffff2c}
#${SCREEN_ID} .routeCard:before{content:'';position:absolute;inset:0 auto 0 0;width:6px;background:var(--route-color,#ff4b82)}
#${SCREEN_ID} .routeCard.selected{border-color:var(--route-color,#ff4b82);box-shadow:0 0 0 2px #ffffff16,inset 0 0 34px #ffffff08}
#${SCREEN_ID} .routeCard .status{display:inline-block;margin-bottom:10px;color:var(--route-color,#ff4b82);font-size:10px;font-weight:1000;letter-spacing:.12em}
#${SCREEN_ID} .routeCard h2{margin:0;font-size:21px;line-height:1}
#${SCREEN_ID} .routeCard h3{margin:5px 0 8px;color:#d8cee7;font-size:12px;letter-spacing:.08em}
#${SCREEN_ID} .routeCard p{margin:0;color:#aaa4b8;font-size:12px;line-height:1.35}
#${SCREEN_ID} .routeCard .percent{position:absolute;right:12px;bottom:10px;color:#fff;font-size:12px;font-weight:1000}
#${SCREEN_ID} .routePanel,#${SCREEN_ID} .missionPanel{border:2px solid #ffffff29;border-radius:14px;background:#090a12ee;padding:20px;box-shadow:0 18px 60px #0008}
#${SCREEN_ID} .routePanel{position:sticky;top:20px}
#${SCREEN_ID} .routePanel h2,#${SCREEN_ID} .missionPanel h2{margin:4px 0 2px;font-size:30px;line-height:1}
#${SCREEN_ID} .routePanel h3{margin:0 0 13px;color:#e5dced;font-size:14px;letter-spacing:.12em}
#${SCREEN_ID} .routePanel p,#${SCREEN_ID} .missionPanel p{color:#c3bbcd;line-height:1.5}
#${SCREEN_ID} dl{display:grid;gap:8px;margin:15px 0}
#${SCREEN_ID} dl div{display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid #ffffff16;padding-bottom:7px}
#${SCREEN_ID} dt{color:#91899f;font-size:11px;font-weight:900}
#${SCREEN_ID} dd{margin:0;text-align:right;font-size:11px;font-weight:950}
#${SCREEN_ID} .routeActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
#${SCREEN_ID} .missionView{grid-column:1/-1}
#${SCREEN_ID} .missionHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px}
#${SCREEN_ID} .missionList{display:grid;gap:10px}
#${SCREEN_ID} .missionCard{width:100%;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;text-align:left;background:#151625}
#${SCREEN_ID} .missionNumber{display:grid;place-items:center;width:42px;height:42px;border-radius:7px;background:#ff4b82;color:#fff;font-size:20px;font-weight:1000}
#${SCREEN_ID} .missionCard strong{display:block}
#${SCREEN_ID} .missionCard span span{display:block;margin-top:3px;color:#aaa3b8;font-size:11px}
#${SCREEN_ID} .missionCard em{color:#ff91bc;font-size:10px;font-style:normal;font-weight:1000;letter-spacing:.08em}
#${SCREEN_ID} .briefing[hidden]{display:none!important}
#${SCREEN_ID} .briefing{margin-top:14px;padding-top:14px;border-top:2px solid #ffffff1f}
#${SCREEN_ID} .objectiveList{margin:12px 0;padding-left:20px;color:#dfd7e6}
#${SCREEN_ID} .objectiveList li{margin:7px 0}
#${SCREEN_ID} .canonNote{padding:11px;border-left:4px solid #ff4b82;background:#ff4b8212;color:#dfd5e4;font-size:12px;line-height:1.45}
#${SCREEN_ID} .lockedBanner{padding:13px;border:1px dashed #ffffff32;border-radius:9px;background:#ffffff08;color:#c8c1d0;text-align:center;font-size:12px;font-weight:900}
#${SCREEN_ID} .storyError{grid-column:1/-1;padding:18px;border:2px solid #ff8ea8;border-radius:12px;background:#2b0d18;color:#fff}
#${SCREEN_ID} .storyError strong{display:block;margin-bottom:6px}
@media(max-width:850px){#${SCREEN_ID} .lyLayout{grid-template-columns:1fr}#${SCREEN_ID} .routePanel{position:static}#${SCREEN_ID} .routeGrid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){#${SCREEN_ID} .lyTop{align-items:flex-start;flex-direction:column-reverse}#${SCREEN_ID} .routeGrid{grid-template-columns:1fr}#${SCREEN_ID} .routeCard{min-height:134px}#${SCREEN_ID} .missionCard{grid-template-columns:auto 1fr}#${SCREEN_ID} .missionCard em{grid-column:2}}
`;
  document.head.appendChild(style);
}

function buildScreen(){
  document.getElementById(SCREEN_ID)?.remove();
  installStyles();
  const root=document.createElement('section');
  root.id=SCREEN_ID;
  root.hidden=true;
  root.setAttribute('aria-label','The Lost Year story select');
  root.innerHTML=`
    <div class="lyShell">
      <header class="lyTop">
        <div class="lyBrand"><small>PROTOTYPE 2.5C1 • STORY SELECT FIX</small><h1>THE LOST <span>YEAR</span></h1><p>Separate character stories unfold across the same missing year. Complete each perspective to eventually unlock the Final Story.</p></div>
        <button type="button" data-ly-back>← MAIN MENU</button>
      </header>
      <div class="lyMeta"><span class="lyChip">PARALLEL CHARACTER ROUTES</span><span class="lyChip">SHARED TIMELINE</span><span class="lyChip">LOCAL SAVE</span><span class="lyChip">STORY DIALOGUE TEST</span></div>
      <div class="lyLayout" data-ly-layout>
        <main class="routeView" data-route-view><div class="routeGrid" data-route-grid></div></main>
        <aside class="routePanel" data-route-panel></aside>
        <main class="missionView" data-mission-view hidden>
          <div class="missionPanel">
            <div class="missionHeader"><div><small data-mission-route></small><h2 data-mission-title></h2></div><button type="button" data-route-back>← STORIES</button></div>
            <p data-mission-description></p><div class="missionList" data-mission-list></div><section class="briefing" data-briefing hidden></section>
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
    this.root.querySelector('[data-route-back]').addEventListener('click',()=>this.showRoutes());
    this.root.addEventListener('keydown',event=>this.onKey(event));
  }

  open(){
    hideGameScreens();
    this.root.hidden=false;
    try{
      this.showRoutes();
      this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
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

  showRenderError(error){
    const layout=this.root.querySelector('[data-ly-layout]');
    layout.innerHTML=`<div class="storyError"><strong>THE LOST YEAR MENU COULD NOT LOAD.</strong><span>${String(error?.message||error||'Unknown story menu error')}</span></div>`;
  }

  onKey(event){
    if(event.key==='Escape'){
      event.preventDefault();
      if(!this.missionView.hidden)this.showRoutes();else this.close();
      return;
    }
    if(!this.routeView.hidden&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const columns=window.innerWidth<=560?1:2;
      const delta=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='ArrowUp'?-columns:columns;
      this.selectRoute((this.selectedIndex+delta+LOST_YEAR_ROUTES.length)%LOST_YEAR_ROUTES.length,true);
    }
  }

  renderRoutes(){
    const grid=this.root.querySelector('[data-route-grid]');
    if(!grid)throw new Error('Route grid is missing.');
    grid.innerHTML=LOST_YEAR_ROUTES.map((route,index)=>`
      <button type="button" class="routeCard ${index===this.selectedIndex?'selected':''}" style="--route-color:${route.color}" data-route-id="${route.id}" aria-pressed="${index===this.selectedIndex}">
        <span class="status">${route.availability}</span><h2>${route.lead}</h2><h3>${route.title}</h3><p>${route.perspective}</p><span class="percent">${routeProgress(route,this.progress)}%</span>
      </button>`).join('');
    grid.querySelectorAll('[data-route-id]').forEach(button=>{
      button.addEventListener('focus',()=>{
        const index=LOST_YEAR_ROUTES.findIndex(route=>route.id===button.dataset.routeId);
        if(index>=0&&index!==this.selectedIndex)this.selectRoute(index,false);
      });
      button.addEventListener('click',()=>{
        const index=LOST_YEAR_ROUTES.findIndex(route=>route.id===button.dataset.routeId);
        if(index>=0){this.selectedIndex=index;this.persistSelection();this.renderRoutes()}
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
    if(focus)this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  renderRoutePanel(){
    const route=LOST_YEAR_ROUTES[this.selectedIndex],panel=this.routePanel;
    if(!route||!panel)throw new Error('Selected route panel is missing.');
    panel.style.setProperty('--route-color',route.color);
    panel.innerHTML=`<small>${route.availability}</small><h2>${route.lead}</h2><h3>${route.title}</h3><p>${route.description}</p><dl><div><dt>Perspective</dt><dd>${route.perspective}</dd></div><div><dt>Unlock</dt><dd>${route.unlock}</dd></div><div><dt>Progress</dt><dd>${routeProgress(route,this.progress)}%</dd></div></dl>${route.available?`<div class="routeActions"><button type="button" class="primary" data-open-route>OPEN STORY</button></div>`:`<div class="lockedBanner">THIS ROUTE IS VISIBLE FOR PLANNING, BUT NOT PLAYABLE YET.</div>`}`;
    panel.querySelector('[data-open-route]')?.addEventListener('click',()=>this.openRoute(route));
  }

  showRoutes(){
    this.progress=loadLostYearProgress();
    this.routeView.hidden=false;
    this.routePanel.hidden=false;
    this.missionView.hidden=true;
    this.renderRoutes();
  }

  openRoute(route){
    if(!route?.available)return;
    this.routeView.hidden=true;
    this.routePanel.hidden=true;
    this.missionView.hidden=false;
    this.root.querySelector('[data-mission-route]').textContent=`${route.lead} STORY`;
    this.root.querySelector('[data-mission-title]').textContent=route.title;
    this.root.querySelector('[data-mission-description]').textContent=route.description;
    const list=this.root.querySelector('[data-mission-list]');
    list.innerHTML=route.missions.map(mission=>{
      const completed=this.progress.completedMissions.includes(mission.id);
      return `<button type="button" class="missionCard" data-mission-id="${mission.id}" ${mission.available?'':'disabled'}><span class="missionNumber">${mission.number}</span><span><strong>${mission.title}</strong><span>${mission.description}</span></span><em>${completed?'COMPLETED':mission.status}</em></button>`;
    }).join('');
    list.querySelectorAll('[data-mission-id]').forEach(button=>button.addEventListener('click',()=>this.openBriefing(route.missions.find(mission=>mission.id===button.dataset.missionId),route)));
    const briefing=this.root.querySelector('[data-briefing]');
    briefing.hidden=true;
    list.querySelector('button:not(:disabled)')?.focus();
  }

  openBriefing(mission,route){
    if(!mission?.available)return;
    if(!this.progress.viewedBriefings.includes(mission.id))this.progress=saveLostYearProgress({...this.progress,viewedBriefings:[...this.progress.viewedBriefings,mission.id]});
    const briefing=this.root.querySelector('[data-briefing]');
    const playable=mission.id==='rrvvfo-00';
    briefing.innerHTML=`<small>MISSION ${mission.number} BRIEFING</small><h2>${mission.title}</h2><p>${mission.description}</p><dl><div><dt>Location</dt><dd>${mission.stage}</dd></div></dl><h3>MISSION OBJECTIVES</h3><ul class="objectiveList">${mission.objectives.map(objective=>`<li>${objective}</li>`).join('')}</ul><div class="canonNote"><strong>CANON:</strong> ${mission.note}</div><div class="routeActions">${playable?'<button type="button" class="primary" data-play-mission>START MISSION 0</button>':'<button disabled>MISSION NOT BUILT YET</button>'}<button type="button" data-close-briefing>HIDE BRIEFING</button></div>`;
    briefing.hidden=false;
    briefing.querySelector('[data-close-briefing]').addEventListener('click',()=>{briefing.hidden=true;this.root.querySelector(`[data-mission-id="${mission.id}"]`)?.focus()});
    briefing.querySelector('[data-play-mission]')?.addEventListener('click',()=>{
      this.root.hidden=true;
      startRrvvfoMission0({
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
