// Prototype 2.9A.40.8 — Final Legacy QoL Update
// Colorblind modes, autosave backups with a save indicator, and the keyboard
// binding panel. Every feature degrades safely when storage or SVG filters are
// unavailable: the game keeps working with the defaults.
import {createSaveExport,importSaveText,AUTOSAVE_KEY} from './save-manager.js?v=29a523-3d-worlds-20261123';
import {REMAPPABLE_ACTIONS,setKeyBinding,resetKeyBindings,defaultKeyBinding,keyDisplayName,CONTROL_MAPS} from './input.js?v=29a523-3d-worlds-20261123';

/* ---------------------------------------------------------------- colorblind */
// Machado et al. (2009) full-severity simulation matrices. We use them to find
// the color information a viewer loses, then shift that error into channels
// they can still tell apart (classic "daltonization").
const SIMULATION=Object.freeze({
  protanopia:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],
  deuteranopia:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.011820,.042940,.968881]],
  tritanopia:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.303900]]
});
const SHIFT=Object.freeze({
  protanopia:[[0,0,0],[.7,1,0],[.7,0,1]],
  deuteranopia:[[0,0,0],[.7,1,0],[.7,0,1]],
  tritanopia:[[1,0,.7],[0,1,.7],[0,0,0]]
});
const multiply=(a,b)=>a.map((row,i)=>b[0].map((_,j)=>row.reduce((sum,_v,k)=>sum+a[i][k]*b[k][j],0)));
const identity=[[1,0,0],[0,1,0],[0,0,1]];

export function daltonizeMatrix(mode){
  const simulation=SIMULATION[mode],shift=SHIFT[mode];
  if(!simulation||!shift)return identity.map(row=>[...row]);
  const error=identity.map((row,i)=>row.map((value,j)=>value-simulation[i][j]));
  const correction=multiply(shift,error);
  return identity.map((row,i)=>row.map((value,j)=>value+correction[i][j]));
}

function filterMarkup(){
  return Object.keys(SIMULATION).map(mode=>{
    const m=daltonizeMatrix(mode),values=[...m[0],0,0,...m[1],0,0,...m[2],0,0,0,0,0,1,0].map(v=>Number(v.toFixed(5))).join(' ');
    return`<filter id="pxColor-${mode}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${values}"/></filter>`;
  }).join('');
}

let filtersInstalled=false;
function installColorFilters(){
  if(filtersInstalled||typeof document==='undefined')return;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.id='pxColorFilters';
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  svg.innerHTML=`<defs>${filterMarkup()}</defs>`;
  document.body.appendChild(svg);filtersInstalled=true;
}

export function applyColorMode(mode='off'){
  if(typeof document==='undefined')return;
  const root=document.documentElement;
  if(!SIMULATION[mode]){delete root.dataset.colorMode;return}
  installColorFilters();root.dataset.colorMode=mode;
}

/* ------------------------------------------------------------------ autosave */
const PROGRESS_KEYS=Object.freeze(['pxSave','pxLostYearProgressV1','pxLensMasteryV1','pxCombatManualV1','pxMasteryRecordsV1','pxRrvvfoBuildV1','pxAdventureProgressV1','pxFieldSkillsV1','pxWorldDelightV1','pxSeenDialoguesV1']);
const POLL_MS=4000,MIN_GAP_MS=15000;

function hashString(text){let h=5381;for(let i=0;i<text.length;i++)h=((h<<5)+h+text.charCodeAt(i))|0;return h>>>0}
export function progressSignature(storage){
  let signature='';
  for(const key of PROGRESS_KEYS){let value=null;try{value=storage?.getItem?.(key)}catch{}signature+=value==null?'-':`${value.length}:${hashString(value)}`;signature+='|'}
  return signature;
}
const hasProgress=signature=>/[0-9]/.test(signature);

function readSlots(storage){
  try{const parsed=JSON.parse(storage?.getItem?.(AUTOSAVE_KEY)||'null');return Array.isArray(parsed?.slots)?parsed.slots.filter(slot=>slot&&typeof slot.text==='string'):[]}catch{return[]}
}
export function describeAutosave(storage=globalThis.localStorage){
  const slot=readSlots(storage)[0];
  return slot?{savedAt:slot.savedAt,count:readSlots(storage).length}:null;
}
// Restore the newest slot that validates; falls back to the older slot if the newest is damaged.
export function restoreAutosave(storage=globalThis.localStorage){
  const slots=readSlots(storage);
  if(!slots.length)return{ok:false,error:'No autosave backup found yet.'};
  let lastError='Autosave backup could not be read.';
  for(const slot of slots){
    const result=importSaveText(slot.text,storage);
    if(result.ok)return{ok:true,savedAt:slot.savedAt};
    lastError=result.error||lastError;
  }
  return{ok:false,error:lastError};
}

function ensureIndicator(){
  let el=document.getElementById('pxAutosaveIndicator');
  if(el)return el;
  el=document.createElement('div');el.id='pxAutosaveIndicator';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  document.body.appendChild(el);return el;
}
let indicatorTimer=0;
export function showSaveIndicator(text='AUTOSAVED',tone='ok'){
  if(typeof document==='undefined')return;
  // A cosmetic indicator must never be able to fail a save.
  try{
    const el=ensureIndicator();el.textContent=text;el.dataset.tone=tone;el.classList.add('show');
    clearTimeout(indicatorTimer);indicatorTimer=setTimeout(()=>el.classList.remove('show'),tone==='ok'?1800:3500);
  }catch{}
}

export class Autosave{
  constructor({storage=globalThis.localStorage,isEnabled=()=>true,now=()=>Date.now()}={}){
    this.storage=storage;this.isEnabled=isEnabled;this.now=now;this.lastSignature=progressSignature(storage);this.lastWrite=0;this.timer=0;this.failedOnce=false;
    this.onVisibility=()=>{if(document.visibilityState==='hidden')this.tick({force:true,quiet:true})};
    this.onPageHide=()=>this.tick({force:true,quiet:true});
  }
  start(){
    if(this.timer)return;
    this.timer=setInterval(()=>this.tick(),POLL_MS);
    document.addEventListener('visibilitychange',this.onVisibility);addEventListener('pagehide',this.onPageHide);
  }
  stop(){clearInterval(this.timer);this.timer=0;document.removeEventListener('visibilitychange',this.onVisibility);removeEventListener('pagehide',this.onPageHide)}
  // Returns true when a backup was written.
  tick({force=false,quiet=false}={}){
    if(!this.isEnabled())return false;
    const signature=progressSignature(this.storage);
    if(signature===this.lastSignature||!hasProgress(signature))return false;
    if(!force&&this.now()-this.lastWrite<MIN_GAP_MS)return false;
    return this.write(signature,{quiet});
  }
  write(signature=progressSignature(this.storage),{quiet=false}={}){
    try{
      const text=JSON.stringify(createSaveExport(this.storage)),previous=readSlots(this.storage),slots=[{savedAt:new Date(this.now()).toISOString(),text}];
      // Keep the previous good backup so one damaged write can never be the only copy.
      if(previous[0])slots.push(previous[0]);
      this.storage.setItem(AUTOSAVE_KEY,JSON.stringify({version:1,slots}));
      this.lastSignature=signature;this.lastWrite=this.now();this.failedOnce=false;
      if(!quiet)showSaveIndicator('AUTOSAVED');
      return true;
    }catch{
      if(!this.failedOnce&&!quiet)showSaveIndicator('AUTOSAVE FAILED • STORAGE FULL','warn');
      this.failedOnce=true;return false;
    }
  }
}

/* ----------------------------------------------------------- keyboard panel */
let panel=null,capturing=null,opener=null;
function rowsMarkup(){
  return REMAPPABLE_ACTIONS.map(([action,name])=>{
    const code=CONTROL_MAPS[0][action],changed=code!==defaultKeyBinding(action);
    return`<div class="kbRow${changed?' changed':''}"><span>${name}</span><button type="button" data-kb-action="${action}" aria-label="${name}: ${keyDisplayName(code)}. Press to change">${keyDisplayName(code)}</button></div>`;
  }).join('');
}
function say(text,tone=''){const el=panel?.querySelector('[data-kb-message]');if(el){el.textContent=text;el.dataset.tone=tone}}
function renderRows(){const list=panel?.querySelector('[data-kb-list]');if(list)list.innerHTML=rowsMarkup()}
function endCapture(){capturing=null;panel?.classList.remove('capturing')}
function onKeyCapture(event){
  if(!panel||panel.classList.contains('hidden'))return;
  if(capturing){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(event.repeat)return;
    if(event.code==='Escape'){endCapture();renderRows();say('Cancelled.');return}
    const action=capturing;endCapture();
    const result=setKeyBinding(action,event.code);
    renderRows();
    if(!result.ok)say(result.error,'warn');
    else say(result.swapped?`Bound. The key was swapped with ${REMAPPABLE_ACTIONS.find(([id])=>id===result.swapped)?.[1]}.`:'Bound.','ok');
    panel.querySelector(`[data-kb-action="${action}"]`)?.focus();
    return;
  }
  if(event.code==='Escape'){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();closeKeyBindingsPanel()}
}
function buildPanel(){
  panel=document.createElement('div');panel.id='keyBindingsPanel';panel.className='qolModal hidden';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','kbTitle');
  panel.innerHTML=`<div class="qolCard kbCard"><header><div><small>CONTROLS</small><h2 id="kbTitle">KEYBOARD BINDINGS</h2></div><button type="button" data-kb-close aria-label="Close keyboard bindings">×</button></header>
    <p class="kbHint">Player 1 keyboard. Select an action, then press the key you want. Binding a key that is already used swaps the two actions. Esc, Tab, Enter, P, Y, H, Backspace and 1–5 stay reserved. Space always jumps as well.</p>
    <div class="kbList" data-kb-list></div><p class="kbMessage" data-kb-message role="status" aria-live="polite"></p>
    <div class="settingsActions"><button type="button" class="secondary" data-kb-reset>RESET TO DEFAULTS</button><button type="button" class="primary" data-kb-close>DONE</button></div></div>`;
  panel.addEventListener('click',event=>{
    if(event.target.closest('[data-kb-close]')){closeKeyBindingsPanel();return}
    if(event.target.closest('[data-kb-reset]')){resetKeyBindings();endCapture();renderRows();say('Defaults restored.','ok');return}
    const button=event.target.closest('[data-kb-action]');
    if(button){capturing=button.dataset.kbAction;panel.classList.add('capturing');button.textContent='PRESS A KEY…';say('Press the new key. Esc cancels.')}
  });
  document.body.appendChild(panel);
  // Capture phase so the game's own key handlers never see keys meant for the panel.
  addEventListener('keydown',onKeyCapture,true);
}
export function openKeyBindingsPanel(){
  if(typeof document==='undefined')return;
  if(!panel)buildPanel();
  opener=document.activeElement;renderRows();say('');endCapture();panel.classList.remove('hidden');
  panel.querySelector('[data-kb-action]')?.focus();
}
export function closeKeyBindingsPanel(){
  if(!panel)return;
  endCapture();panel.classList.add('hidden');
  try{opener?.focus?.()}catch{}
}

/* -------------------------------------------------------------------- setup */
export function initFinalQol({storage=globalThis.localStorage,getSettings=()=>({})}={}){
  const autosave=new Autosave({storage,isEnabled:()=>getSettings()?.gameplay?.autosave!==false});
  autosave.start();
  return autosave;
}
