import {BUILD_VERSION} from './build-info.js?v=29a36-playful-exploration-quest-variety-20260801';
import {sharedInput} from './input-runtime.js?v=29a36-playful-exploration-quest-variety-20260801';
import {loadLostYearProgress,modeUnlockedForProgress,modeUnlockRequirement} from './story/lost-year-data.js?v=29a36-playful-exploration-quest-variety-20260801';

const MENU_MODULE_CACHE='29a36-playful-exploration-quest-variety-20260801';
export const PROGRESS_LOCKED_MODE_IDS=Object.freeze(['arena','cpu','local']);

export const MAIN_MENU_MODES=Object.freeze([
  {id:'story',label:'STORY',kicker:'THE LOST YEAR',description:'Experience what happened after Rrvvfo defeated Revvfo. Follow Rrvvfo through training, Tournament Road, the tournament, the mystery under the ring, and Echo Region.',players:'1',availability:'Rrvvfo • Chapters 1–4 of 8',accent:'story'},
  {id:'arena',label:'ARENA',kicker:'3D BATTLE',description:'Fight across Tangai Dojo, the Global Tournament, Resonance Facility, Echo Caverns, and Mountain Path with stage-specific pressure, pursuit, and edge-control rules.',players:'1',availability:'5 playable arenas',accent:'arena'},
  {id:'cpu',label:'VS CPU',kicker:'SINGLE BATTLE',description:'Choose a fighter and play a quick battle or a full first-to-3 match against a fair 100-health rival.',players:'1',availability:'Available',accent:'cpu'},
  {id:'local',label:'2 PLAYER',kicker:'LOCAL VS',description:'Choose two finished fighters on the same device. Quick and full match formats use the same unified controls.',players:'2',availability:'Available',accent:'local'},
  {id:'training',label:'TRAINING',kicker:'PRACTICE',description:'Practice the same 3D combat used by Story Mode with technique trials, defensive dummy settings, and instant resets.',players:'1',availability:'Available',accent:'training'},
  {id:'extras',label:'EXTRAS',kicker:'SAGE ARCHIVES',description:'Open the Sage’s Manual, move lists, fighter profiles, stage information, controls, records, and build details.',players:'—',availability:'Available',accent:'extras'},
  {id:'settings',label:'OPTIONS',kicker:'SETTINGS',description:'Adjust gameplay, controls, audio, video, accessibility, HUD, camera, and save-data options.',players:'—',availability:'Available',accent:'settings'},
  {id:'credits',label:'CREDITS',kicker:'PARALLELS X',description:'View project and development credits for Parallels X: Clash of Souls.',players:'—',availability:'Available',accent:'credits'},
  {id:'arcade',label:'ARCADE',kicker:'BATTLE ROAD',description:'A future mode focused on escalating combat runs using the finished roster and battle systems.',players:'1',availability:'Coming Later',disabled:true,accent:'arcade'}
]);

export function mainMenuModesForProgress(storage=globalThis.localStorage){
  const progress=loadLostYearProgress(storage);
  return MAIN_MENU_MODES.map(mode=>{
    const locked=PROGRESS_LOCKED_MODE_IDS.includes(mode.id)&&!modeUnlockedForProgress(mode.id,progress);
    return locked?{...mode,locked:true,availability:`LOCKED • ${modeUnlockRequirement(mode.id)}`}:{...mode,locked:false};
  });
}

function fighterSprite(id,extra=''){
  return`<span class="menuFighter menuFighter-${id} ${extra}" aria-hidden="true"></span>`;
}

function renderModeArt(mode){
  if(mode.id==='story')return`<div class="modeScene storyScene">${fighterSprite('rrvvfo','hero')}${fighterSprite('sage','mentor')}<span class="sceneTrail"></span><b>RRVVFO STORY</b></div>`;
  if(mode.id==='arena')return`<div class="modeScene arenaScene"><span class="stageRing"></span>${fighterSprite('rrvvfo','hero')}${fighterSprite('revvfo','rival')}<b>FIRST TO 3 KOs</b></div>`;
  if(mode.id==='cpu')return`<div class="modeScene versusScene">${fighterSprite('rrvvfo','hero')}${fighterSprite('revvfo','rival')}<span class="versusMark">VS</span></div>`;
  if(mode.id==='local')return`<div class="modeScene localScene"><span class="localSilhouette p1"></span><span class="localSilhouette p2"></span><span class="versusMark">2P</span></div>`;
  if(mode.id==='training')return`<div class="modeScene trainingScene">${fighterSprite('rrvvfo','hero')}<span class="trainingDummy"></span><span class="targetRing one"></span><span class="targetRing two"></span><b>DRILLS READY</b></div>`;
  if(mode.id==='arcade')return`<div class="modeScene arcadeScene"><span class="arcadeRoad"></span><span class="arcadeLock">LOCKED</span><b>COMING LATER</b></div>`;
  if(mode.id==='settings')return`<div class="modeScene settingsScene"><span class="gear gearA">⚙</span><span class="gear gearB">⚙</span><b>PLAY YOUR WAY</b></div>`;
  if(mode.id==='extras')return`<div class="modeScene extrasScene"><span class="manualBook">THE SAGE’S<br>MANUAL</span>${fighterSprite('sage','mentor')}<b>ARCHIVES</b></div>`;
  return`<div class="modeScene creditsScene"><span class="creditsX">X</span><b>CLASH OF SOULS</b></div>`;
}

export function mainMenuConfirmLabel(
  device=sharedInput.lastInputDevice[0]||'keyboard',
  nav=globalThis.navigator,
  view=globalThis.window
){
  const touchCapable=Number(nav?.maxTouchPoints||0)>0||!!view?.matchMedia?.('(pointer: coarse)')?.matches;
  if(device==='keyboard'&&touchCapable)device='touch';
  if(device==='touch')return'TAP TO CONFIRM';
  if(device==='controller')return`${sharedInput.controllerMapping(1).labels.a.toUpperCase()} — CONFIRM`;
  if(device==='mouse')return'M1 / ENTER — CONFIRM';
  return'ENTER — CONFIRM';
}

function modeMini(mode,index,position){
  const unavailable=mode.disabled||mode.locked;
  return `<button type="button" class="modePeek ${position} ${unavailable?'isLocked':''}" data-carousel-index="${index}" aria-label="Switch to ${mode.label}">
    <span>${String(index+1).padStart(2,'0')}</span><strong>${mode.label}</strong><small>${unavailable?'LOCKED':mode.kicker}</small>
  </button>`;
}

function renderModeCarousel(){
  const length=this.modes.length;
  const previousIndex=(this.index-1+length)%length;
  const nextIndex=(this.index+1)%length;
  const previous=this.modes[previousIndex];
  const mode=this.modes[this.index];
  const next=this.modes[nextIndex];
  const unavailable=mode.disabled||mode.locked;
  return `
    <header class="modeCarouselHeading">
      <small>PARALLELS X • CLASH OF SOULS</small>
      <h1>MODE SELECT</h1>
      <p>Choose one mode. Use the arrows, swipe, or press left and right.</p>
    </header>
    <div class="modeCarouselStage" data-mode-carousel-stage>
      <button type="button" class="modeArrow previous" data-carousel-direction="-1" aria-label="Previous mode">‹</button>
      ${modeMini(previous,previousIndex,'previous')}
      <button type="button" class="mainMode selected" data-main-menu-id="${mode.id}" aria-current="true" ${unavailable?'aria-disabled="true"':''}>
        <span class="modeIndex">${String(this.index+1).padStart(2,'0')}</span>
        <span class="modeWords"><span>${mode.label}</span><small>${unavailable?(mode.disabled?'COMING LATER':'STORY LOCKED'):mode.kicker}</small></span>
        <span class="modeSelectPrompt">${unavailable?'VIEW DETAILS':'SELECT'}</span>
      </button>
      ${modeMini(next,nextIndex,'next')}
      <button type="button" class="modeArrow next" data-carousel-direction="1" aria-label="Next mode">›</button>
    </div>
    <div class="modeCarouselDots" role="tablist" aria-label="Mode position">
      ${this.modes.map((item,index)=>`<button type="button" data-carousel-index="${index}" class="${index===this.index?'selected':''}" aria-label="${item.label}" aria-selected="${index===this.index?'true':'false'}"><span></span></button>`).join('')}
    </div>`;
}

export class MainMenu{
  constructor(root,{onSelect=()=>{},storage=globalThis.localStorage,now=()=>Date.now()}={}){
    this.root=root;
    this.onSelect=onSelect;
    this.storage=storage;
    this.now=now;
    this.modes=mainMenuModesForProgress(this.storage);
    this.index=0;
    this.lockedUntil=0;
    this.list=root?.querySelector('[data-main-menu-list]');
    this.preview=root?.querySelector('[data-main-menu-preview]');
    this.version=root?.querySelector('[data-build-version]');
    this.swipeStart=null;
    if(this.version)this.version.textContent=BUILD_VERSION;
    this.render();

    this.list?.addEventListener('click',event=>{
      const directionButton=event.target.closest('[data-carousel-direction]');
      if(directionButton){this.move(Number(directionButton.dataset.carouselDirection)||0);return}
      const indexButton=event.target.closest('[data-carousel-index]');
      if(indexButton){this.setIndex(Number(indexButton.dataset.carouselIndex),{focus:true});return}
      if(event.target.closest('[data-main-menu-id]'))this.confirm();
    });

    this.preview?.addEventListener('click',event=>{
      if(event.target.closest('[data-main-menu-confirm]'))this.confirm();
    });

    this.list?.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse')return;
      this.swipeStart={x:event.clientX,y:event.clientY,id:event.pointerId};
    });
    this.list?.addEventListener('pointerup',event=>{
      const start=this.swipeStart;this.swipeStart=null;
      if(!start||start.id!==event.pointerId)return;
      const dx=event.clientX-start.x,dy=event.clientY-start.y;
      if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.25)this.move(dx<0?1:-1);
    });
    this.list?.addEventListener('pointercancel',()=>{this.swipeStart=null});
  }

  setIndex(index,{focus=false}={}){
    const length=this.modes.length;
    if(!length)return;
    const next=((Number(index)||0)%length+length)%length;
    if(next!==this.index){this.index=next;this.root?.dispatchEvent(new CustomEvent('menumove',{detail:this.modes[next]}))}
    this.render({focus});
  }

  render({focus=false}={}){
    if(!this.root||!this.list||!this.preview)return;
    const selectedId=this.modes[this.index]?.id;
    this.modes=mainMenuModesForProgress(this.storage);
    const refreshedIndex=this.modes.findIndex(mode=>mode.id===selectedId);
    this.index=refreshedIndex>=0?refreshedIndex:Math.min(this.index,Math.max(0,this.modes.length-1));
    this.list.innerHTML=renderModeCarousel.call(this);

    const mode=this.modes[this.index];
    const unavailable=mode.disabled||mode.locked;
    this.root.dataset.selectedMode=mode.accent||mode.id;
    this.preview.dataset.mode=mode.id;
    this.preview.innerHTML=`
      <div class="modeArt" aria-hidden="true">${renderModeArt(mode)}</div>
      <div class="modeCopy">
        <small>${mode.kicker}</small>
        <h2>${mode.label}</h2>
        <p>${mode.description}</p>
        <dl>
          <div><dt>Players</dt><dd>${mode.players}</dd></div>
          <div><dt>Status</dt><dd>${mode.availability}</dd></div>
        </dl>
        ${mode.disabled?'<span id="arcade-coming-tooltip" class="comingTooltip" role="tooltip">ARCADE MODE IS COMING LATER</span>':mode.locked?`<span class="comingTooltip" role="status">${mode.availability}</span>`:''}
        <div class="modePanelActions"><button type="button" class="modeConfirm" data-main-menu-confirm>${unavailable?'LOCKED — VIEW REQUIREMENT':mainMenuConfirmLabel()}</button></div>
      </div>`;

    if(focus)this.list.querySelector('[data-main-menu-id]')?.focus({preventScroll:true});
  }

  move(direction){this.setIndex(this.index+(direction<0?-1:1),{focus:true})}

  async confirm(){
    if(this.now()<this.lockedUntil)return false;
    this.lockedUntil=this.now()+220;
    const mode=this.modes[this.index];
    if(mode.disabled||mode.locked){
      this.root.dispatchEvent(new CustomEvent('menuerror',{detail:mode}));
      return false;
    }

    this.root.dispatchEvent(new CustomEvent('menuselect',{detail:mode}));
    try{
      if(mode.id==='story'){
        const {openLostYearStory}=await import(`./story/lost-year-story.js?v=${MENU_MODULE_CACHE}`);
        openLostYearStory();
      }else if(mode.id==='arena'){
        const {startArenaBattle}=await import(`./arena/arena-mode.js?v=${MENU_MODULE_CACHE}`);
        startArenaBattle();
      }else if(mode.id==='training'){
        const {startArenaTraining}=await import(`./arena/arena-mode.js?v=${MENU_MODULE_CACHE}`);
        startArenaTraining();
      }else{
        this.onSelect(mode.id);
      }
      return true;
    }catch(error){
      console.error(`[Main Menu] ${mode.label} could not load`,error);
      this.lockedUntil=0;
      this.root.dispatchEvent(new CustomEvent('menuloaderror',{detail:{mode,error}}));
      const message=`${mode.label} could not load. Reload the page and try again.`;
      if(typeof window!=='undefined'&&typeof window.alert==='function')window.alert(message);
      return false;
    }
  }

  select(id){
    this.modes=mainMenuModesForProgress(this.storage);
    const index=this.modes.findIndex(mode=>mode.id===id);
    if(index<0)return false;
    this.index=index;
    this.render();
    return true;
  }
}
