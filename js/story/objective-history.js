export const STORY_OBJECTIVE_HISTORY_KEY='pxStoryObjectiveHistoryV1';
const HISTORY_LIMIT=60;

function storageFor(){try{return globalThis.localStorage}catch{return null}}
function safeText(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function readHistory(storage=storageFor()){
  try{const entries=JSON.parse(storage?.getItem(STORY_OBJECTIVE_HISTORY_KEY)||'[]');return Array.isArray(entries)?entries.filter(item=>item&&typeof item.title==='string'):[]}catch{return[]}
}

export function recordStoryObjective(chapter,title,detail='',storage=storageFor()){
  const label=String(title||'').trim(),chapterNumber=Number(chapter)||0;
  if(!label||!chapterNumber)return readHistory(storage);
  const entries=readHistory(storage),last=entries.at(-1),now=Date.now();
  if(last?.chapter===chapterNumber&&last.title===label){last.detail=String(detail||'');last.updatedAt=now}
  else entries.push({chapter:chapterNumber,title:label,detail:String(detail||''),updatedAt:now});
  const next=entries.slice(-HISTORY_LIMIT);
  try{storage?.setItem(STORY_OBJECTIVE_HISTORY_KEY,JSON.stringify(next))}catch{}
  return next;
}

export function getStoryObjectiveHistory(chapter=null,{limit=18,storage=storageFor()}={}){
  const entries=readHistory(storage),selected=chapter===null?entries:entries.filter(item=>Number(item.chapter)===Number(chapter));
  return selected.slice(-Math.max(1,Number(limit)||18)).reverse();
}

function historyMarkup(chapter){
  const entries=getStoryObjectiveHistory(chapter,{limit:24});
  if(!entries.length)return'<p class="objectiveHistoryEmpty">New objectives appear here as the chapter progresses.</p>';
  return entries.map((item,index)=>`<article class="${index===0?'isCurrent':''}"><small>${index===0?'NOW':'DONE'} • CHAPTER ${item.chapter}</small><strong>${safeText(item.title)}</strong><span>${safeText(item.detail)}</span></article>`).join('');
}

export function attachStoryObjectiveHistory({root,chapter,battle,getMode=()=>'',setMode=()=>{},isActive=()=>true}={}){
  if(!root||!battle)return{open(){},close(){},destroy(){}};
  const button=document.createElement('button');button.type='button';button.className='storyObjectiveHistoryButton';button.textContent='OBJECTIVES';button.setAttribute('aria-label','Open recent objective history');
  const host=root.querySelector('.chapter2HudButtons,.c3HudActions,.c4HudActions,[data-chapter-actions]')||root;
  host.appendChild(button);
  const panel=document.createElement('aside');panel.className='storyObjectiveHistoryPanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Objective history');
  panel.innerHTML=`<header><div><small>RRVVFO STORY • CHAPTER ${chapter}</small><h2>OBJECTIVE HISTORY</h2></div><button type="button" data-objective-history-close aria-label="Close objective history">×</button></header><p>Recent goals stay here when you need a reminder.</p><section data-objective-history-list></section><footer><kbd>J</kbd> OPEN / <kbd>ESC</kbd> CLOSE</footer>`;
  root.appendChild(panel);
  let previousMode='',previousPhase='play',pausedByPanel=false;
  const refresh=()=>{panel.querySelector('[data-objective-history-list]').innerHTML=historyMarkup(chapter)};
  const open=()=>{
    if(panel.hidden===false||root.hidden||!isActive())return;
    const mode=String(getMode()||'');if(['dialogue','story','choice','complete','transition','manual','objective-history'].includes(mode))return;
    previousMode=mode;previousPhase=battle.phase||'play';pausedByPanel=!battle.paused;
    setMode('objective-history');battle.phase='story';if(pausedByPanel)battle.togglePause();
    refresh();panel.hidden=false;panel.querySelector('[data-objective-history-close]')?.focus();
  };
  const close=()=>{
    if(panel.hidden)return;panel.hidden=true;setMode(previousMode||'exploration');battle.phase=previousPhase;
    if(pausedByPanel&&battle.paused)battle.togglePause();pausedByPanel=false;button.focus();
  };
  const onKey=event=>{
    if(root.hidden||!isActive())return;
    if(!panel.hidden){if(event.code==='Escape'||event.code==='KeyJ'){event.preventDefault();event.stopImmediatePropagation();close()}return}
    const mode=String(getMode()||'');
    if(event.code==='KeyJ'&&!event.repeat&&['hub','interior','dungeon','remote','explore','cavern','mountain'].includes(mode)){event.preventDefault();event.stopImmediatePropagation();open()}
  };
  button.addEventListener('click',open);panel.querySelector('[data-objective-history-close]').addEventListener('click',close);document.addEventListener('keydown',onKey,true);
  return{open,close,refresh,destroy(){close();document.removeEventListener('keydown',onKey,true);button.remove();panel.remove()}};
}
