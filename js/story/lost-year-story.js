import {LOST_YEAR_ROUTES,loadLostYearProgress,routeProgress,saveLostYearProgress} from './lost-year-data.js?v=25a-story-data';

const SCREEN_ID='lostYearStoryScreen';
let instance=null;

function installStyles(){
  if(document.getElementById('lostYearStoryStyles'))return;
  const style=document.createElement('style');
  style.id='lostYearStoryStyles';
  style.textContent=`
#${SCREEN_ID}{position:fixed;inset:0;z-index:1400;overflow:auto;background:radial-gradient(circle at 20% 12%,#54213b 0,#171125 34%,#080a12 75%);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif}
#${SCREEN_ID}.hidden{display:none}#${SCREEN_ID} *{box-sizing:border-box}
#${SCREEN_ID}:before{content:'';position:fixed;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 0 46%,#ff4b8220 46% 47%,transparent 47% 100%),repeating-linear-gradient(90deg,transparent 0 79px,#ffffff08 80px);opacity:.65}
#${SCREEN_ID} .lyShell{position:relative;z-index:1;width:min(1240px,100%);min-height:100%;margin:auto;padding:24px clamp(16px,3vw,40px) 40px}
#${SCREEN_ID} .lyTop{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}
#${SCREEN_ID} .lyBrand small,#${SCREEN_ID} .routePanel small,#${SCREEN_ID} .missionPanel small{display:block;color:#ff91bc;font-size:11px;font-weight:1000;letter-spacing:.16em}
#${SCREEN_ID} .lyBrand h1{margin:3px 0 0;font-size:clamp(31px,5vw,62px);line-height:.92;font-style:italic;letter-spacing:-.045em;text-shadow:0 4px #2b0b1b}
#${SCREEN_ID} .lyBrand h1 span{color:#ff4b82}#${SCREEN_ID} .lyBrand p{max-width:680px;margin:10px 0 0;color:#d6cde2;line-height:1.45}
#${SCREEN_ID} button{border:1px solid #ffffff2f;border-radius:10px;background:#1c1a2a;color:#fff;padding:11px 15px;font-weight:950;letter-spacing:.04em;cursor:pointer}
#${SCREEN_ID} button:hover,#${SCREEN_ID} button:focus-visible{border-color:#ff79ad;outline:2px solid #ff79ad55;outline-offset:2px}
#${SCREEN_ID} button.primary{background:linear-gradient(135deg,#c51f64,#6e2bd2);border-color:#ff9dc5}
#${SCREEN_ID} button:disabled{cursor:not-allowed;opacity:.48;filter:saturate(.45)}
#${SCREEN_ID} .lyMeta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}.lyChip{padding:7px 10px;border:1px solid #ffffff25;border-radius:999px;background:#0b0c14b8;color:#dcd6ea;font-size:11px;font-weight:900}
#${SCREEN_ID} .lyLayout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(310px,.75fr);gap:18px;align-items:start}
#${SCREEN_ID} .routeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#${SCREEN_ID} .routeCard{position:relative;min-height:154px;padding:16px;text-align:left;overflow:hidden;background:linear-gradient(150deg,#232338e8,#0d0e17f2 74%);border-color:#ffffff28}
#${SCREEN_ID} .routeCard:before{content:'';position:absolute;inset:0 auto 0 0;width:5px;background:var(--route-color,#ff4b82)}
#${SCREEN_ID} .routeCard.selected{border-color:var(--route-color,#ff4b82);box-shadow:0 0 0 2px color-mix(in srgb,var(--route-color,#ff4b82) 45%,transparent),inset 0 0 34px #ffffff08}
#${SCREEN_ID} .routeCard .status{display:inline-block;margin-bottom:10px;color:var(--route-color,#ff4b82);font-size:10px;font-weight:1000;letter-spacing:.12em}
#${SCREEN_ID} .routeCard h2{margin:0;font-size:21px;line-height:1}.routeCard h3{margin:5px 0 8px;color:#d8cee7;font-size:12px;letter-spacing:.08em}
#${SCREEN_ID} .routeCard p{margin:0;color:#aca5bb;font-size:12px;line-height:1.35}.routeCard .percent{position:absolute;right:12px;bottom:10px;color:#fff;font-size:12px;font-weight:1000}
#${SCREEN_ID} .routePanel,#${SCREEN_ID} .missionPanel{border:1px solid #ffffff25;border-radius:16px;background:#0b0c14e6;padding:20px;box-shadow:0 18px 60px #0007}
#${SCREEN_ID} .routePanel{position:sticky;top:20px}.routePanel h2,.missionPanel h2{margin:4px 0 2px;font-size:30px;line-height:1}.routePanel h3{margin:0 0 13px;color:#e5dced;font-size:14px;letter-spacing:.12em}
#${SCREEN_ID} .routePanel p,.missionPanel p{color:#c3bbcd;line-height:1.5}.routePanel dl{display:grid;gap:8px;margin:15px 0}.routePanel dl div{display:flex;justify-content:space-between;gap:15px;border-bottom:1px solid #ffffff16;padding-bottom:7px}.routePanel dt{color:#91899f;font-size:11px;font-weight:900}.routePanel dd{margin:0;text-align:right;font-size:11px;font-weight:950}
#${SCREEN_ID} .routeActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
#${SCREEN_ID} .missionView{display:none}.missionView.active{display:block;grid-column:1/-1}.routeView.hidden{display:none}
#${SCREEN_ID} .missionHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px}.missionList{display:grid;gap:10px}.missionCard{width:100%;display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;text-align:left;background:#151625}.missionNumber{display:grid;place-items:center;width:42px;height:42px;border-radius:9px;background:#ff4b82;color:#fff;font-size:20px;font-weight:1000}.missionCard strong{display:block}.missionCard span{display:block;margin-top:3px;color:#aaa3b8;font-size:11px}.missionCard em{color:#ff91bc;font-size:10px;font-style:normal;font-weight:1000;letter-spacing:.08em}
#${SCREEN_ID} .briefing{display:none;margin-top:14px}.briefing.active{display:block}.objectiveList{margin:12px 0;padding-left:20px;color:#dfd7e6}.objectiveList li{margin:7px 0}.canonNote{padding:11px;border-left:4px solid #ff4b82;background:#ff4b8212;color:#dfd5e4;font-size:12px;line-height:1.45}
#${SCREEN_ID} .lockedBanner{padding:13px;border:1px dashed #ffffff32;border-radius:10px;background:#ffffff08;color:#c8c1d0;text-align:center;font-size:12px;font-weight:900}
@media(max-width:850px){#${SCREEN_ID} .lyLayout{grid-template-columns:1fr}#${SCREEN_ID} .routePanel{position:static}.routeGrid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){#${SCREEN_ID} .lyTop{align-items:flex-start;flex-direction:column-reverse}#${SCREEN_ID} .routeGrid{grid-template-columns:1fr}#${SCREEN_ID} .routeCard{min-height:134px}#${SCREEN_ID} .missionCard{grid-template-columns:auto 1fr}.missionCard em{grid-column:2}}
`;
  document.head.appendChild(style);
}

function installScreen(){
  let root=document.getElementById(SCREEN_ID);
  if(root)return root;
  installStyles();
  root=document.createElement('section');
  root.id=SCREEN_ID;
  root.className='hidden';
  root.setAttribute('aria-label','The Lost Year story select');
  root.innerHTML=`
    <div class="lyShell">
      <header class="lyTop">
        <div class="lyBrand"><small>PROTOTYPE 2.5A • STORY FOUNDATION</small><h1>THE LOST <span>YEAR</span></h1><p>Separate character stories unfold across the same missing year. Completing each perspective will eventually unlock the Final Story.</p></div>
        <button data-ly-back>← MAIN MENU</button>
      </header>
      <div class="lyMeta"><span class="lyChip">PARALLEL CHARACTER ROUTES</span><span class="lyChip">SHARED TIMELINE</span><span class="lyChip">LOCAL SAVE FOUNDATION</span><span class="lyChip">REV & METAL SEPARATE FROM ALT & ROVER</span></div>
      <div class="lyLayout">
        <main class="routeView" data-route-view><div class="routeGrid" data-route-grid></div></main>
        <aside class="routePanel" data-route-panel></aside>
        <main class="missionView" data-mission-view>
          <div class="missionPanel">
            <div class="missionHeader"><div><small data-mission-route></small><h2 data-mission-title></h2></div><button data-route-back>← STORIES</button></div>
            <p data-mission-description></p><div class="missionList" data-mission-list></div><section class="briefing" data-briefing></section>
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
    this.root=installScreen();
    this.progress=loadLostYearProgress();
    this.selectedIndex=Math.max(0,LOST_YEAR_ROUTES.findIndex(route=>route.id===this.progress.selectedRoute));
    this.routeView=this.root.querySelector('[data-route-view]');
    this.missionView=this.root.querySelector('[data-mission-view]');
    this.root.querySelector('[data-ly-back]').addEventListener('click',()=>this.close());
    this.root.querySelector('[data-route-back]').addEventListener('click',()=>this.showRoutes());
    this.root.addEventListener('keydown',event=>this.onKey(event));
  }

  open(){
    hideGameScreens();
    this.root.classList.remove('hidden');
    this.showRoutes();
    this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  close(){
    this.root.classList.add('hidden');
    document.getElementById('mainMenuScreen')?.classList.remove('hidden');
    document.querySelector('[data-main-menu-id="story"]')?.focus();
  }

  onKey(event){
    if(event.key==='Escape'){event.preventDefault();if(this.missionView.classList.contains('active'))this.showRoutes();else this.close();return}
    if(!this.routeView.classList.contains('hidden')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
      event.preventDefault();
      const columns=window.innerWidth<=560?1:2;
      const delta=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='ArrowUp'?-columns:columns;
      this.selectRoute((this.selectedIndex+delta+LOST_YEAR_ROUTES.length)%LOST_YEAR_ROUTES.length,true);
    }
  }

  renderRoutes(){
    const grid=this.root.querySelector('[data-route-grid]');
    grid.innerHTML=LOST_YEAR_ROUTES.map((route,index)=>`
      <button class="routeCard ${index===this.selectedIndex?'selected':''}" style="--route-color:${route.color}" data-route-id="${route.id}" aria-pressed="${index===this.selectedIndex}">
        <span class="status">${route.availability}</span><h2>${route.lead}</h2><h3>${route.title}</h3><p>${route.perspective}</p><span class="percent">${routeProgress(route,this.progress)}%</span>
      </button>`).join('');
    grid.querySelectorAll('[data-route-id]').forEach(button=>{
      const index=LOST_YEAR_ROUTES.findIndex(route=>route.id===button.dataset.routeId);
      button.addEventListener('focus',()=>{if(index!==this.selectedIndex)this.selectRoute(index,true)});
      button.addEventListener('click',()=>{if(index!==this.selectedIndex)this.selectRoute(index,true)});
    });
    this.renderRoutePanel();
  }

  selectRoute(index,focus=false){
    this.selectedIndex=Math.max(0,Math.min(LOST_YEAR_ROUTES.length-1,index));
    this.progress=saveLostYearProgress({...this.progress,selectedRoute:LOST_YEAR_ROUTES[this.selectedIndex].id});
    this.renderRoutes();
    if(focus)this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  renderRoutePanel(){
    const route=LOST_YEAR_ROUTES[this.selectedIndex],panel=this.root.querySelector('[data-route-panel]');
    panel.style.setProperty('--route-color',route.color);
    panel.innerHTML=`<small>${route.availability}</small><h2>${route.lead}</h2><h3>${route.title}</h3><p>${route.description}</p><dl><div><dt>Perspective</dt><dd>${route.perspective}</dd></div><div><dt>Unlock</dt><dd>${route.unlock}</dd></div><div><dt>Progress</dt><dd>${routeProgress(route,this.progress)}%</dd></div></dl>${route.available?`<div class="routeActions"><button class="primary" data-open-route>OPEN STORY</button></div>`:`<div class="lockedBanner">THIS ROUTE IS VISIBLE FOR PLANNING, BUT NOT PLAYABLE YET.</div>`}`;
    panel.querySelector('[data-open-route]')?.addEventListener('click',()=>this.openRoute(route));
  }

  showRoutes(){
    this.missionView.classList.remove('active');this.routeView.classList.remove('hidden');this.root.querySelector('[data-route-panel]').style.display='block';this.renderRoutes();
    this.root.querySelector(`[data-route-id="${LOST_YEAR_ROUTES[this.selectedIndex].id}"]`)?.focus();
  }

  openRoute(route){
    if(!route.available)return;
    this.routeView.classList.add('hidden');this.root.querySelector('[data-route-panel]').style.display='none';this.missionView.classList.add('active');
    this.root.querySelector('[data-mission-route]').textContent=`${route.lead} STORY`;
    this.root.querySelector('[data-mission-title]').textContent=route.title;
    this.root.querySelector('[data-mission-description]').textContent=route.description;
    const list=this.root.querySelector('[data-mission-list]');
    list.innerHTML=route.missions.map(mission=>`<button class="missionCard" data-mission-id="${mission.id}" ${mission.available?'':'disabled'}><span class="missionNumber">${mission.number}</span><span><strong>${mission.title}</strong><span>${mission.description}</span></span><em>${mission.status}</em></button>`).join('');
    list.querySelectorAll('[data-mission-id]').forEach(button=>button.addEventListener('click',()=>this.openBriefing(route.missions.find(mission=>mission.id===button.dataset.missionId),route)));
    this.root.querySelector('[data-briefing]').classList.remove('active');
    list.querySelector('button:not(:disabled)')?.focus();
  }

  openBriefing(mission,route){
    if(!mission?.available)return;
    if(!this.progress.viewedBriefings.includes(mission.id))this.progress=saveLostYearProgress({...this.progress,viewedBriefings:[...this.progress.viewedBriefings,mission.id]});
    const briefing=this.root.querySelector('[data-briefing]');
    briefing.innerHTML=`<small>MISSION ${mission.number} BRIEFING</small><h2>${mission.title}</h2><p>${mission.description}</p><dl><div><dt>Planned location</dt><dd>${mission.stage}</dd></div></dl><h3>FOUNDATION OBJECTIVES</h3><ul class="objectiveList">${mission.objectives.map(objective=>`<li>${objective}</li>`).join('')}</ul><div class="canonNote"><strong>CANON SAFETY:</strong> ${mission.note}</div><div class="routeActions"><button disabled>PLAYABLE MISSION — NEXT CHECKPOINT</button><button data-close-briefing>HIDE BRIEFING</button></div>`;
    briefing.classList.add('active');
    briefing.querySelector('[data-close-briefing]').addEventListener('click',()=>{briefing.classList.remove('active');this.root.querySelector(`[data-mission-id="${mission.id}"]`)?.focus()});
    briefing.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

export function openLostYearStory(){
  if(!instance)instance=new LostYearStoryScreen();
  instance.open();
  return instance;
}

export {LostYearStoryScreen};
