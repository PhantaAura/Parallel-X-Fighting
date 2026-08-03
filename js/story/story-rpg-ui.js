import {sharedInput} from '../input-runtime.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {storyStatsForProgress,storyLevelFromProgress,storyXpFromProgress,levelHudText} from './story-progression.js?v=29a4072r-ch1-adventure-playtestlab-20260802';

export const RRVVFO_ATTACK_SIGNS=Object.freeze([
  {type:'SHOT',icon:'✦',name:'Fire Blast'},
  {type:'POWER',icon:'☀',name:'Solar Weave'},
  {type:'TRICK',icon:'◉',name:'Object Swap / Lens of Truth'}
]);

export function storyAttackStripMarkup({compact=false}={}){
  return `<div class="storyAttackSigns ${compact?'compact':''}" aria-label="Equipped technique categories">${RRVVFO_ATTACK_SIGNS.map(item=>`<span data-type="${item.type.toLowerCase()}"><b>${item.icon}</b><small>${item.type}</small><strong>${item.name}</strong></span>`).join('')}</div>`;
}

export function storyStatsMarkup(progress,{showXp=true,compact=false}={}){
  const level=storyLevelFromProgress(progress),xp=storyXpFromProgress(progress),stats=storyStatsForProgress(progress);
  return `<section class="storyRpgStats ${compact?'compact':''}">
    <header><span><small>LEVEL</small><strong>${level}</strong></span>${showXp?`<span class="storyXp"><small>STORY XP</small><strong>${levelHudText(level,xp)}</strong></span>`:''}</header>
    <div class="storyStatGrid">
      <span><small>HP</small><b>${stats.hp}</b></span><span><small>POWER</small><b>${stats.power}</b></span><span><small>DEFENSE</small><b>${stats.defense}</b></span><span><small>SPEED</small><b>${stats.speed}</b></span><span><small>FOCUS</small><b>${stats.focus}</b></span>
    </div>
  </section>`;
}

export function storyPromptLabel(action,{fallback=''}={}){
  const device=sharedInput.lastInputDevice[0]||'keyboard';
  const semantic={confirm:'a',back:'b',interact:'i',manual:'',tracker:'',pause:''}[action];
  if(action==='confirm')return device==='touch'?'TAP':sharedInput.actionLabel(1,semantic,{device}).toUpperCase();
  if(action==='back')return device==='touch'?'BACK':device==='controller'?sharedInput.controllerMapping(1).labels.b.toUpperCase():'ESC';
  if(action==='interact')return sharedInput.actionLabel(1,'i',{device}).toUpperCase();
  if(action==='manual')return device==='touch'?'MANUAL':device==='controller'?'PAUSE → MANUAL':'M';
  if(action==='tracker')return device==='touch'?'TRACKER':device==='controller'?'PAUSE → TRACKER':'T';
  if(action==='pause')return device==='touch'?'MENU':device==='controller'?'MENU':'ESC';
  return fallback||String(action).toUpperCase();
}

export function storyControlLegendMarkup(){
  return `<div class="storyControlLegend"><span><b>${storyPromptLabel('pause')}</b> Pause</span><span><b>${storyPromptLabel('manual')}</b> Sage Manual</span><span><b>${storyPromptLabel('tracker')}</b> Objective Tracker</span><span><b>${storyPromptLabel('interact')}</b> Interact</span><span><b>RIGHT STICK / MOUSE</b> Move Hub Camera</span></div>`;
}
