import {BUILD_VERSION} from './build-info.js?v=29a17-chapter123-repair-icon-20260729';
import {sharedInput} from './input-runtime.js?v=29a17-chapter123-repair-icon-20260729';
import {loadLostYearProgress,storyModeComplete} from './story/lost-year-data.js?v=29a17-chapter123-repair-icon-20260729';

const MENU_MODULE_CACHE='29a17-chapter123-repair-icon-20260729';
export const STORY_CLEAR_MODE_IDS=Object.freeze(['arena','cpu','local']);

export const MAIN_MENU_MODES=Object.freeze([
  {id:'story',label:'STORY',kicker:'THE LOST YEAR',description:'Follow Rrvvfo through training, the Tournament Road, RPG growth, a living tournament hub, and the full local bracket. Complete all six Rrvvfo chapters to reveal Classic battles and Arena Mode.',players:'1',availability:'Rrvvfo • Chapters 1–3 of 6'},
  {id:'arena',label:'ARENA',kicker:'3D BATTLE',description:'Enter Tangai Dojo or the Global Tournament in continuous first-to-3-KO battles with adaptive AI, charging, parries, grabs, and projectile clashes.',players:'1',availability:'Tangai Dojo and Global Tournament'},
  {id:'cpu',label:'VS CPU',kicker:'SINGLE BATTLE',description:'Choose a fighter and choose Quick Battle or a full first-to-3 match against a fair 100-health rival.',players:'1',availability:'Available'},
  {id:'local',label:'2 PLAYER',kicker:'LOCAL VS',description:'Choose two finished fighters on the same device. Quick and full match formats use the same unified controls; separate assigned devices are recommended.',players:'2',availability:'Available'},
  {id:'training',label:'TRAINING',kicker:'PRACTICE',description:'Practice the same 3D combat used by Story Mode with focused drills, a configurable dummy, and instant resets.',players:'1',availability:'Available'},
  {id:'arcade',label:'ARCADE',kicker:'BATTLE ROAD',description:'A locked sequence of escalating battles built around the finished combat roster.',players:'1',availability:'Coming Later',disabled:true},
  {id:'settings',label:'OPTIONS',kicker:'SETTINGS',description:'Adjust gameplay, controls, audio, video, accessibility, HUD, and save-data options.',players:'—',availability:'Available'},
  {id:'extras',label:'EXTRAS',kicker:'SAGE ARCHIVES',description:'Open the Sage’s Manual, move lists, fighter profiles, stage information, controls, and build details.',players:'—',availability:'Available'},
  {id:'credits',label:'CREDITS',kicker:'PARALLELS X',description:'View project and development credits for Parallels X: Clash of Souls.',players:'—',availability:'Available'}
]);

export function mainMenuModesForProgress(storage=globalThis.localStorage){
  const storyCleared=storyModeComplete(loadLostYearProgress(storage));
  return MAIN_MENU_MODES.filter(mode=>storyCleared||!STORY_CLEAR_MODE_IDS.includes(mode.id));
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

function renderModeButtons(){
  const modes=this.modes;
  const groups=[
    {label:'PLAY',ids:['story','arena','cpu','local','training','arcade']},
    {label:'SYSTEM',ids:['settings','extras','credits']}
  ];
  return groups.map(group=>{
    const groupModes=group.ids.map(id=>modes.find(mode=>mode.id===id)).filter(Boolean);
    if(!groupModes.length)return'';
    return`<div class="mainMenuGroupLabel" role="presentation"><span>${group.label}</span></div>${groupModes.map(mode=>{
    const index=modes.findIndex(candidate=>candidate.id===mode.id);
    return `<button type="button" class="mainMode ${index===this.index?'selected':''}" data-main-menu-id="${mode.id}" aria-current="${index===this.index?'true':'false'}" ${mode.disabled?'aria-disabled="true" aria-describedby="arcade-coming-tooltip"':''}>
      <span class="modeIndex">${index+1}</span><span class="modeWords"><span>${mode.label}</span>${mode.disabled?'<small>COMING LATER</small>':`<small>${mode.kicker}</small>`}</span>
    </button>`;
  }).join('')}`;
  }).join('');
}

export class MainMenu{
  constructor(root,{onSelect=()=>{},storage=localStorage,now=()=>Date.now()}={}){
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
    if(this.version)this.version.textContent=BUILD_VERSION;
    this.render();

    this.list?.addEventListener('focusin',event=>{
      const button=event.target.closest('[data-main-menu-id]');
      if(!button)return;
      const index=this.modes.findIndex(mode=>mode.id===button.dataset.mainMenuId);
      if(index<0||index===this.index)return;
      this.index=index;
      this.root.dispatchEvent(new CustomEvent('menumove',{detail:this.modes[index]}));
      this.render({focus:true});
    });

    this.list?.addEventListener('pointerover',event=>{
      const button=event.target.closest('[data-main-menu-id]');
      if(!button||button.dataset.hovered==='true')return;
      this.list.querySelectorAll('[data-main-menu-id]').forEach(item=>delete item.dataset.hovered);
      button.dataset.hovered='true';
      const index=this.modes.findIndex(mode=>mode.id===button.dataset.mainMenuId);
      if(index<0||index===this.index)return;
      this.index=index;
      this.root.dispatchEvent(new CustomEvent('menumove',{detail:this.modes[index]}));
      this.render();
    });

    this.list?.addEventListener('click',event=>{
      const button=event.target.closest('[data-main-menu-id]');
      if(!button)return;
      const index=this.modes.findIndex(mode=>mode.id===button.dataset.mainMenuId);
      if(index<0)return;
      this.index=index;
      this.render();
      this.confirm();
    });
  }

  render({focus=false}={}){
    if(!this.root||!this.list||!this.preview)return;
    const selectedId=this.modes[this.index]?.id;
    this.modes=mainMenuModesForProgress(this.storage);
    const refreshedIndex=this.modes.findIndex(mode=>mode.id===selectedId);
    this.index=refreshedIndex>=0?refreshedIndex:Math.min(this.index,Math.max(0,this.modes.length-1));
    this.list.innerHTML=renderModeButtons.call(this);

    const mode=this.modes[this.index];
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
        ${mode.disabled?'<span id="arcade-coming-tooltip" class="comingTooltip" role="tooltip">ARCADE MODE IS COMING LATER</span>':''}
        <span class="modeConfirm">${mode.disabled?'LOCKED — SELECT FOR DETAILS':mainMenuConfirmLabel()}</span>
      </div>`;

    const selected=this.list.querySelector(`[data-main-menu-id="${mode.id}"]`);
    selected?.scrollIntoView({block:'nearest',inline:'center'});
    if(focus)selected?.focus({preventScroll:true});
  }

  move(direction){
    const length=this.modes.length;
    this.index=(this.index+direction+length)%length;
    this.root?.dispatchEvent(new CustomEvent('menumove',{detail:this.modes[this.index]}));
    this.render({focus:true});
  }

  async confirm(){
    if(this.now()<this.lockedUntil)return false;
    this.lockedUntil=this.now()+220;
    const mode=this.modes[this.index];
    if(mode.disabled){
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
