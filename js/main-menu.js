import {BUILD_VERSION} from './build-info.js?v=29a-combat-depth-20260728';

const MENU_MODULE_CACHE='29a-combat-depth-20260728';

export const MAIN_MENU_MODES=Object.freeze([
  {id:'story',label:'STORY',glyph:'ST',kicker:'THE LOST YEAR',description:'Choose a character route and play it as continuous chapters. Rrvvfo Chapters 1–2 flow continuously, with a separate Chapter 3 opening preview for development testing.',players:'1',availability:'Rrvvfo route available — Chapters 1–2 plus Chapter 3 opening preview'},
  {id:'arena',label:'ARENA',glyph:'AR',kicker:'3D BATTLE',description:'Enter Tangai Dojo or the Global Tournament in first-to-3-KO battles with continuous respawns, adaptive AI, charge, parries, grabs, and projectile clashes.',players:'1',availability:'Tangai Dojo and Global Tournament available'},
  {id:'cpu',label:'VS CPU',glyph:'VS',kicker:'SINGLE BATTLE',description:'Choose a fighter and score three KOs against a computer-controlled rival with 135 health per life.',players:'1',availability:'Available'},
  {id:'local',label:'2 PLAYER',glyph:'2P',kicker:'LOCAL VS',description:'Choose two fighters and battle to three KOs on the same device. Separate assigned input devices are recommended.',players:'2',availability:'Available'},
  {id:'training',label:'TRAINING',glyph:'TR',kicker:'PRACTICE',description:'Practice movement, defense, clashes, combos, abilities, and character-specific techniques.',players:'1',availability:'Available'},
  {id:'arcade',label:'ARCADE',glyph:'AC',kicker:'BATTLE ROAD',description:'A future sequence of escalating battles and route-specific opponents.',players:'1',availability:'Coming later',disabled:true},
  {id:'settings',label:'OPTIONS',glyph:'OP',kicker:'SETTINGS',description:'Adjust gameplay, controls, audio, video, accessibility, HUD, and save-data options.',players:'—',availability:'Available'},
  {id:'extras',label:'EXTRAS',glyph:'EX',kicker:'ARCHIVES',description:'Browse move lists, character profiles, stage information, controls, credits, and build details.',players:'—',availability:'Available'},
  {id:'credits',label:'CREDITS',glyph:'CR',kicker:'PARALLELS X',description:'View project and development credits for Parallels X: Clash of Souls.',players:'—',availability:'Available'}
]);

export class MainMenu{
  constructor(root,{onSelect=()=>{},storage=localStorage,now=()=>Date.now()}={}){
    this.root=root;
    this.onSelect=onSelect;
    this.storage=storage;
    this.now=now;
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
      const index=MAIN_MENU_MODES.findIndex(mode=>mode.id===button.dataset.mainMenuId);
      if(index<0||index===this.index)return;
      this.index=index;
      this.render({focus:true});
    });

    this.list?.addEventListener('click',event=>{
      const button=event.target.closest('[data-main-menu-id]');
      if(!button)return;
      const index=MAIN_MENU_MODES.findIndex(mode=>mode.id===button.dataset.mainMenuId);
      if(index<0)return;
      this.index=index;
      this.render();
      this.confirm();
    });
  }

  render({focus=false}={}){
    if(!this.root||!this.list||!this.preview)return;
    this.list.innerHTML=MAIN_MENU_MODES.map((mode,index)=>`
      <button type="button" class="mainMode ${index===this.index?'selected':''}" data-main-menu-id="${mode.id}" aria-current="${index===this.index?'true':'false'}" ${mode.disabled?'aria-disabled="true"':''}>
        <span class="modeIndex">${index+1}</span>
        <span class="modeWords"><span>${mode.label}</span>${mode.disabled?'<small>COMING LATER</small>':`<small>${mode.kicker}</small>`}</span>
      </button>`).join('');

    const mode=MAIN_MENU_MODES[this.index];
    this.preview.innerHTML=`
      <div class="modeArt" aria-hidden="true"><span class="modeGlyph">${mode.glyph}</span></div>
      <div class="modeCopy">
        <small>${mode.kicker}</small>
        <h2>${mode.label}</h2>
        <p>${mode.description}</p>
        <dl>
          <div><dt>Players</dt><dd>${mode.players}</dd></div>
          <div><dt>Status</dt><dd>${mode.availability}</dd></div>
        </dl>
        <span class="modeConfirm">ENTER / A — CONFIRM</span>
      </div>`;

    const selected=this.list.querySelector(`[data-main-menu-id="${mode.id}"]`);
    selected?.scrollIntoView({block:'nearest',inline:'center'});
    if(focus)selected?.focus({preventScroll:true});
  }

  move(direction){
    const length=MAIN_MENU_MODES.length;
    this.index=(this.index+direction+length)%length;
    this.render({focus:true});
  }

  async confirm(){
    if(this.now()<this.lockedUntil)return false;
    this.lockedUntil=this.now()+220;
    const mode=MAIN_MENU_MODES[this.index];
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
        const {startArenaBattle}=await import(`./arena/arena-mode.js?v=29a-combat-depth-20260728`);
        startArenaBattle();
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
    const index=MAIN_MENU_MODES.findIndex(mode=>mode.id===id);
    if(index<0)return false;
    this.index=index;
    this.render();
    return true;
  }
}
