import {BUILD_VERSION} from './build-info.js';
import {openLostYearStory} from './story/lost-year-story.js?v=lost-year-github-3';

export const MAIN_MENU_MODES=Object.freeze([
  {id:'story',label:'STORY MODE — THE LOST YEAR',description:'Choose character stories unfolding across the missing year between Seasons 1 and 2.',players:'1',availability:'Lost Year story-select available'},
  {id:'cpu',label:'VS CPU',description:'Choose a fighter and battle a computer-controlled opponent.',players:'1',availability:'Available'},
  {id:'local',label:'LOCAL 2 PLAYER',description:'Battle a friend on the same device.',players:'2',availability:'Two assigned input devices recommended'},
  {id:'training',label:'TRAINING MODE',description:'Practice combos, defense, clashes, and character abilities.',players:'1',availability:'Available'},
  {id:'arcade',label:'ARCADE MODE',description:'A future sequence of escalating battles.',players:'1',availability:'Coming Later',disabled:true},
  {id:'settings',label:'SETTINGS',description:'Gameplay, controls, audio, video, accessibility, HUD, and save data.',players:'—',availability:'Available'},
  {id:'extras',label:'EXTRAS',description:'Move lists, profiles, stage gallery, controls, credits, and build information.',players:'—',availability:'Available'},
  {id:'credits',label:'CREDITS',description:'Parallels X: Clash of Souls project credits.',players:'—',availability:'Available'}
]);

export class MainMenu{
  constructor(root,{onSelect=()=>{},storage=localStorage,now=()=>Date.now()}={}){this.root=root;this.onSelect=onSelect;this.storage=storage;this.now=now;this.index=0;this.lockedUntil=0;this.list=root?.querySelector('[data-main-menu-list]');this.preview=root?.querySelector('[data-main-menu-preview]');this.version=root?.querySelector('[data-build-version]');if(this.version)this.version.textContent=BUILD_VERSION;this.render();this.list?.addEventListener('focusin',event=>{const button=event.target.closest('[data-main-menu-id]');if(!button)return;const index=MAIN_MENU_MODES.findIndex(mode=>mode.id===button.dataset.mainMenuId);if(index===this.index)return;this.index=index;this.render();this.list.querySelector(`[data-main-menu-id="${button.dataset.mainMenuId}"]`)?.focus()});this.list?.addEventListener('click',event=>{const button=event.target.closest('[data-main-menu-id]');if(!button)return;this.index=MAIN_MENU_MODES.findIndex(mode=>mode.id===button.dataset.mainMenuId);this.render();this.confirm()})}
  render(){if(!this.root)return;this.list.innerHTML=MAIN_MENU_MODES.map((mode,index)=>`<button class="mainMode ${index===this.index?'selected':''}" data-main-menu-id="${mode.id}" ${mode.disabled?'aria-disabled="true"':''}><span>${mode.label}</span>${mode.disabled?'<small>COMING LATER</small>':''}</button>`).join('');const mode=MAIN_MENU_MODES[this.index];this.preview.innerHTML=`<small>SELECTED MODE</small><h2>${mode.label}</h2><p>${mode.description}</p><dl><div><dt>Players</dt><dd>${mode.players}</dd></div><div><dt>Status</dt><dd>${mode.availability}</dd></div></dl>`}
  move(direction){const length=MAIN_MENU_MODES.length;this.index=(this.index+direction+length)%length;this.render()}
  confirm(){if(this.now()<this.lockedUntil)return false;this.lockedUntil=this.now()+220;const mode=MAIN_MENU_MODES[this.index];if(mode.disabled){this.root.dispatchEvent(new CustomEvent('menuerror',{detail:mode}));return false}this.root.dispatchEvent(new CustomEvent('menuselect',{detail:mode}));if(mode.id==='story')openLostYearStory();else this.onSelect(mode.id);return true}
  select(id){const index=MAIN_MENU_MODES.findIndex(mode=>mode.id===id);if(index<0)return false;this.index=index;this.render();return true}
}
