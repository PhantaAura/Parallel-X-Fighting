import {BUILD_VERSION,SAVE_SCHEMA_VERSION} from '../build-info.js';
import {loadLostYearProgress} from './lost-year-data.js?v=29a55b-valley-20261123';
import {WORLD_DELIGHT_DISCOVERIES} from './world-delight.js?v=29a55b-valley-20261123';
import {CHAPTER1_ADVENTURE_VERSION,CHAPTER1_GUIDANCE,CHAPTER1_ROUTES,CHAPTER1_FIRE_BLAST_STORY_FOCUS} from './chapter1-adventure.js?v=29a55b-valley-20261123';
import {RrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a55b-valley-20261123';
import {ArenaBattle} from '../arena/arena-mode.js?v=29a55b-valley-20261123';

const DEV_SESSION_KEY='pxDeveloperUnlockedSession';
const LAST_REPORT_KEY='pxPlaytestLastReportV2';
const VERSION_TAPS=7;
const VERSION_TAP_WINDOW=4200;
const MAP_DEBUG_SESSION_KEY='pxMapDebugUnlockedSession';
const MAP_DEBUG_CODE=Object.freeze(['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']);
const ARENA_TELEMETRY_FLAG=Symbol.for('px.playtestArenaTelemetry4072r');

const state={
  root:null,output:null,unlocked:false,tapCount:0,lastTap:0,session:null,lastReport:'',
  lastArenaSample:0,settingsObserver:null,objectiveObserver:null,mapDebugUnlocked:false,mapDebugCodeIndex:0,mapDebugLastAt:0
};

function safeJson(value){try{return JSON.stringify(value)}catch{return'{}'}}
function now(){return performance?.now?.()??Date.now()}
function wallNow(){return Date.now()}
function fmtMs(ms=0){const total=Math.max(0,Math.round(ms/1000)),m=Math.floor(total/60),s=total%60;return`${m}:${String(s).padStart(2,'0')}`}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
function text(value){return value==null?'':String(value)}
function escapeHtml(value){return text(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}

function storageGet(key){try{return localStorage.getItem(key)}catch{return null}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function sessionGet(key){try{return sessionStorage.getItem(key)}catch{return null}}
function sessionSet(key,value){try{sessionStorage.setItem(key,value);return true}catch{return false}}

function injectStyle(){
  if(document.getElementById('pxPlaytestLabStyle'))return;
  const style=document.createElement('style');style.id='pxPlaytestLabStyle';style.textContent=`
#pxPlaytestLab{position:fixed;inset:0;z-index:99999;background:rgba(4,7,13,.88);backdrop-filter:blur(8px);color:#f7f8ff;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left));overflow:auto;-webkit-overflow-scrolling:touch}
#pxPlaytestLab[hidden]{display:none!important}#pxPlaytestLab *{box-sizing:border-box}
#pxPlaytestLab .pxLabCard{width:min(920px,100%);margin:0 auto;background:#111724;border:1px solid #344158;border-radius:18px;box-shadow:0 24px 80px #0008;overflow:hidden}
#pxPlaytestLab header{position:sticky;top:0;z-index:2;background:#111724eF;padding:16px 18px;display:flex;gap:12px;align-items:center;justify-content:space-between;border-bottom:1px solid #2b374d;backdrop-filter:blur(8px)}
#pxPlaytestLab header small{display:block;color:#91a1bb;font-weight:800;letter-spacing:.12em}#pxPlaytestLab header h2{margin:2px 0 0;font-size:clamp(20px,4.8vw,30px)}
#pxPlaytestLab button{min-height:48px;border-radius:12px;border:1px solid #485a78;background:#1b2638;color:#fff;padding:10px 14px;font-weight:900;letter-spacing:.025em;touch-action:manipulation}
#pxPlaytestLab button.primary{background:#cf3038;border-color:#ff6970}#pxPlaytestLab button.good{background:#173d35;border-color:#3cae8a}#pxPlaytestLab button:disabled{opacity:.45}
#pxPlaytestLab .pxLabBody{padding:14px;display:grid;gap:14px}#pxPlaytestLab section{background:#0b111d;border:1px solid #28364c;border-radius:14px;padding:14px}#pxPlaytestLab section h3{margin:0 0 5px;font-size:16px}#pxPlaytestLab section p{margin:4px 0 12px;color:#aab8ce;line-height:1.45}
#pxPlaytestLab .pxLabButtons{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:9px}#pxPlaytestLab .pxLabStatus{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.pxLabChip{border:1px solid #3a4963;border-radius:99px;padding:5px 9px;font-size:12px;font-weight:850}.pxLabChip.on{border-color:#3eb98b;color:#7de4bc}.pxLabChip.warn{border-color:#dba84e;color:#f3ca78}
#pxPlaytestLab pre{white-space:pre-wrap;word-break:break-word;background:#05080e;border:1px solid #273248;border-radius:12px;padding:12px;min-height:110px;max-height:46vh;overflow:auto;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#d8e4f5}
.pxDevBuildTap{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 0;padding:10px 12px;border:1px dashed #43526b;border-radius:10px;color:#9cabc1;font-size:12px;user-select:none;-webkit-user-select:none;touch-action:manipulation}.pxDevBuildTap strong{color:#dbe7f8}.pxDevBuildTap.unlocked{border-style:solid;border-color:#3eb98b;color:#7de4bc}
#pxDeveloperLabButton{width:100%;margin-top:8px;background:#202d43!important;border-color:#6080a9!important}
.storyPlaytestPanel .pxInjectedLabSection{margin-top:10px;padding-top:10px;border-top:1px solid #ffffff24}.storyPlaytestPanel .pxInjectedLabSection button{min-height:44px}
@media(max-width:600px){#pxPlaytestLab{padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}#pxPlaytestLab .pxLabCard{border-radius:0;min-height:100dvh;border-left:0;border-right:0}#pxPlaytestLab .pxLabBody{padding:10px}#pxPlaytestLab section{padding:12px}#pxPlaytestLab .pxLabButtons{grid-template-columns:1fr 1fr}#pxPlaytestLab button{min-height:54px;font-size:13px}}
`;
  document.head.appendChild(style);
}

function buildLab(){
  if(state.root&&document.body.contains(state.root))return state.root;
  injectStyle();const root=document.createElement('section');root.id='pxPlaytestLab';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.innerHTML=`
  <div class="pxLabCard"><header><div><small>DEVELOPER • MOBILE SAFE</small><h2>PLAYTEST LAB</h2></div><button type="button" data-px-lab-close aria-label="Close Playtest Lab">×</button></header>
  <div class="pxLabBody">
    <section><h3>ONE-CLICK QA</h3><p>Runs non-destructive runtime checks. This catches broken wiring and suspicious states; it does not pretend a bot can decide whether a chapter is fun.</p><div class="pxLabButtons"><button class="primary" type="button" data-px-full-qa>RUN FULL QA</button><button type="button" data-px-clear-output>CLEAR OUTPUT</button></div><div class="pxLabStatus" data-px-status></div></section>
    <section><h3>HUMAN PACING PLAYTEST</h3><p>Records real objective timing, dialogue, fights, ranks, background pauses, damage, and approximate arena coverage while you play.</p><div class="pxLabButtons"><button class="good" type="button" data-px-start-human>START RECORDING</button><button type="button" data-px-stop-human>STOP + REPORT</button></div></section>
    <section data-px-map-debug-section hidden><h3>MAP DEBUG MODE</h3><p>Chapter jumps run as temporary replays. Boss practice and map previews use training matches. These tools do not change story progress.</p><h4>CHAPTER WARPS</h4><div class="pxLabButtons"><button type="button" data-px-debug-chapter="1">CH1 • RRVVFO’S ARRIVAL</button><button type="button" data-px-debug-chapter="2">CH2 • TOURNAMENT</button><button type="button" data-px-debug-chapter="3">CH3 • SABOTAGE</button><button type="button" data-px-debug-chapter="4">CH4 • ECHO REGION</button><button type="button" data-px-debug-chapter="5">CH5 • THE HOLLOW</button><button type="button" data-px-debug-chapter="6">CH6 • THE RED NETWORK</button><button type="button" data-px-debug-chapter="7">CH7 • THE CLONE</button><button type="button" data-px-debug-chapter="8">CH8 • THE FINALE</button><button type="button" data-px-debug-chapter-hub="4">CH4 • VILLAGE HUB</button></div><h4>BOSS PRACTICE</h4><div class="pxLabButtons"><button type="button" data-px-debug-boss="hollow-commander">PROJECT HOLLOW COMMANDER</button><button type="button" data-px-debug-boss="hollow-watcher">HOLLOW WATCHER</button><button type="button" data-px-debug-boss="ryuzankaro">RYUZANKARO</button><button type="button" data-px-debug-boss="hollow-mimic">HOLLOW MIMIC</button><button type="button" data-px-debug-boss="red-leader">THE RED LEADER</button></div><h4>MAP PREVIEWS</h4><div class="pxLabButtons"><button type="button" data-px-map-debug="training-road">CH1 • COUNTRYSIDE</button><button type="button" data-px-map-debug="tournament-hub">CH2 • TOURNAMENT</button><button type="button" data-px-map-debug="resonance-facility">CH3 • FACTORY</button><button type="button" data-px-map-debug="echo-village">CH4 • ECHO REGION</button><button type="button" data-px-map-debug="echo-mountain">CH4 • MOUNTAIN PATH</button><button type="button" data-px-map-debug="echo-caverns">CH4 • ECHO CAVERNS</button><button type="button" data-px-map-debug="echo-sky">CH4 • UPPER ATMOSPHERE</button><button type="button" data-px-map-debug="shadow-lookout">CH4 • SHADOW’S LOOKOUT</button><button type="button" data-px-map-debug="chapter5-outpost">CH5 • RED OUTPOST</button><button type="button" data-px-map-debug="chapter6-highlands">CH6 • ECHO HIGHLANDS</button><button type="button" data-px-map-debug="chapter7-relay">CH7 • EMERALD RELAY</button><button type="button" data-px-map-debug="chapter8-core">CH8 • CENTRAL CORE</button></div><h4>COMBAT QUICK TESTS</h4><div class="pxLabButtons"><button type="button" data-px-fight="revvfo">VS REVVFO</button><button type="button" data-px-fight="wade">VS WADE</button><button type="button" data-px-fight="bark">VS BARK</button></div></section>
    <section><h3>REPORT</h3><div class="pxLabButtons"><button class="primary" type="button" data-px-copy-report>COPY LAST REPORT</button><button type="button" data-px-download-report>EXPORT JSON</button></div><pre data-px-output>Playtest Lab ready.</pre></section>
  </div></div>`;
  document.body.appendChild(root);state.root=root;state.output=root.querySelector('[data-px-output]');
  root.querySelector('[data-px-lab-close]').addEventListener('click',closeLab);
  root.querySelector('[data-px-full-qa]').addEventListener('click',runFullQa);
  root.querySelector('[data-px-clear-output]').addEventListener('click',()=>setOutput(''));
  root.querySelector('[data-px-start-human]').addEventListener('click',()=>startHumanPlaytest({source:'manual'}));
  root.querySelector('[data-px-stop-human]').addEventListener('click',()=>stopHumanPlaytest({reason:'manual'}));
  root.querySelectorAll('[data-px-debug-chapter]').forEach(button=>button.addEventListener('click',()=>startDebugChapter(Number(button.dataset.pxDebugChapter))));
  root.querySelectorAll('[data-px-debug-chapter-hub]').forEach(button=>button.addEventListener('click',()=>startDebugChapterHub(Number(button.dataset.pxDebugChapterHub))));
  root.querySelectorAll('[data-px-debug-boss]').forEach(button=>button.addEventListener('click',()=>startBossDebugPreview(button.dataset.pxDebugBoss)));
  root.querySelectorAll('[data-px-fight]').forEach(button=>button.addEventListener('click',()=>startQuickFight(button.dataset.pxFight)));
  root.querySelectorAll('[data-px-map-debug]').forEach(button=>button.addEventListener('click',()=>startMapDebugPreview(button.dataset.pxMapDebug)));
  root.querySelector('[data-px-copy-report]').addEventListener('click',copyLastReport);
  root.querySelector('[data-px-download-report]').addEventListener('click',downloadLastReport);
  root.addEventListener('pointerdown',event=>{if(event.target===root)closeLab()});
  renderStatus();return root;
}

function setOutput(value){buildLab();state.output.textContent=text(value);renderMapDebugGate()}
function openLab(){unlockDeveloper({quiet:true});buildLab();state.root.hidden=false;renderStatus();renderMapDebugGate();setOutput(state.lastReport||storageGet(LAST_REPORT_KEY)||'Playtest Lab ready.');state.root.querySelector('[data-px-lab-close]')?.focus()}
function closeLab(){if(state.root)state.root.hidden=true}

function unlockDeveloper({quiet=false}={}){
  state.unlocked=true;sessionSet(DEV_SESSION_KEY,'1');installSettingsEntry();injectIntoExistingDevRoom();renderStatus();
  if(!quiet){const message='Developer Mode enabled • Playtest Lab unlocked';setOutput(message);document.dispatchEvent(new CustomEvent('pxstoryarrival',{detail:{kicker:'DEVELOPER',title:'PLAYTEST LAB UNLOCKED',detail:'Open Settings to return here during this session.',tone:'gold',onceKey:`dev-unlock:${Date.now()}`}}))}
}

function renderStatus(){
  if(!state.root)return;const status=state.root.querySelector('[data-px-status]');if(!status)return;
  const recording=Boolean(state.session);status.innerHTML=`<span class="pxLabChip ${state.unlocked?'on':''}">DEV ${state.unlocked?'UNLOCKED':'LOCKED'}</span><span class="pxLabChip ${recording?'on':''}">${recording?'RECORDING':'NOT RECORDING'}</span><span class="pxLabChip">SCHEMA ${SAVE_SCHEMA_VERSION}</span><span class="pxLabChip">${escapeHtml(BUILD_VERSION)}</span>`;
}

function installSettingsEntry(){
  const panel=document.getElementById('settingsPanel');if(!panel)return;
  const card=panel.querySelector('.settingsQol')||panel.querySelector('.qolCard')||panel;
  let tap=card.querySelector('.pxDevBuildTap');
  if(!tap){tap=document.createElement('div');tap.className='pxDevBuildTap';tap.setAttribute('role','button');tap.setAttribute('tabindex','0');tap.innerHTML=`<span>BUILD VERSION • tap 7× for developer tools</span><strong>${escapeHtml(BUILD_VERSION)}</strong>`;tap.addEventListener('click',handleBuildTap);tap.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();handleBuildTap()}});const content=panel.querySelector('#settingsContent');content?.insertAdjacentElement('afterend',tap)}
  // Only touch the DOM when the unlock state actually changes. This function runs from a
  // MutationObserver on document.body: rewriting the label on every call is itself a DOM
  // mutation, which re-triggered the observer forever and froze the game at startup.
  const unlockKey=state.unlocked?'1':'0';
  if(tap.dataset.pxUnlock!==unlockKey){tap.dataset.pxUnlock=unlockKey;tap.classList.toggle('unlocked',state.unlocked);tap.querySelector('span').textContent=state.unlocked?'DEVELOPER MODE • SESSION UNLOCKED':'BUILD VERSION • tap 7× for developer tools'}
  let mapHint=panel.querySelector('[data-px-map-debug-hint]');
  if(!mapHint){mapHint=document.createElement('div');mapHint.className='pxDevBuildTap';mapHint.setAttribute('data-px-map-debug-hint','');mapHint.setAttribute('aria-live','polite');const content=panel.querySelector('#settingsContent');content?.insertAdjacentElement('afterend',mapHint)}
  const mapDebugState=state.mapDebugUnlocked?'1':'0';
  if(mapHint&&mapHint.dataset.state!==mapDebugState){mapHint.dataset.state=mapDebugState;mapHint.textContent=state.mapDebugUnlocked?'MAP DEBUG UNLOCKED • USE OPEN MAP DEBUG MODE BELOW':'MAP DEBUG • ENTER ↑ ↑ ↓ ↓ ← → ← → B A WHILE SETTINGS IS OPEN'}
  const actions=panel.querySelector('.settingsActions');
  if(actions&&state.unlocked&&!actions.querySelector('#pxDeveloperLabButton')){const button=document.createElement('button');button.id='pxDeveloperLabButton';button.type='button';button.textContent='DEVELOPER MENU • PLAYTEST LAB';button.addEventListener('click',openLab);actions.appendChild(button)}
  if(actions&&state.mapDebugUnlocked&&!actions.querySelector('#pxMapDebugLabButton')){const button=document.createElement('button');button.id='pxMapDebugLabButton';button.type='button';button.className='primary';button.textContent='OPEN MAP DEBUG MODE';button.addEventListener('click',openLab);actions.appendChild(button)}
}

function handleBuildTap(){
  const t=wallNow();if(t-state.lastTap>VERSION_TAP_WINDOW)state.tapCount=0;state.lastTap=t;state.tapCount++;
  if(state.tapCount>=VERSION_TAPS){state.tapCount=0;unlockDeveloper();openLab();return}
  if(state.tapCount>=4){const remaining=VERSION_TAPS-state.tapCount;const tap=document.querySelector('.pxDevBuildTap span');if(tap)tap.textContent=`${remaining} more tap${remaining===1?'':'s'} to enable Developer Mode`}
}

function injectIntoExistingDevRoom(){
  const panel=document.querySelector('[data-story-playtest]');if(!panel||panel.querySelector('.pxInjectedLabSection'))return;
  const article=panel.querySelector('article')||panel;const section=document.createElement('section');section.className='pxInjectedLabSection';section.innerHTML='<h3>PLAYTEST LAB</h3><div class="playtestButtons"><button type="button" data-px-open-integrated-lab>OPEN MOBILE PLAYTEST LAB</button></div>';section.querySelector('button').addEventListener('click',openLab);article.appendChild(section);
}

function settingsPanelIsOpen(){
  const panel=document.getElementById('settingsPanel');
  return Boolean(panel&&!panel.classList.contains('hidden')&&panel.getClientRects().length);
}

function renderMapDebugGate(){
  const section=state.root?.querySelector('[data-px-map-debug-section]');
  if(section)section.hidden=!state.mapDebugUnlocked;
}

function activeStoryBattleIsOpen(){
  const arena=document.getElementById('arenaModeScreen');
  return Boolean(arena&&!arena.classList.contains('hidden')&&arena.dataset.storyProfile);
}

function handleMapDebugKonami(event){
  if(!settingsPanelIsOpen()){state.mapDebugCodeIndex=0;return}
  const key=event.key.startsWith('Arrow')?event.key:event.key.toLowerCase();
  const now=wallNow();
  if(now-state.mapDebugLastAt>6500)state.mapDebugCodeIndex=0;
  const expected=MAP_DEBUG_CODE[state.mapDebugCodeIndex];
  if(key===expected){state.mapDebugCodeIndex++;event.preventDefault();event.stopPropagation()}
  else{state.mapDebugCodeIndex=key===MAP_DEBUG_CODE[0]?1:0;if(state.mapDebugCodeIndex)event.preventDefault()}
  state.mapDebugLastAt=now;
  if(state.mapDebugCodeIndex!==MAP_DEBUG_CODE.length)return;
  state.mapDebugCodeIndex=0;state.mapDebugUnlocked=true;sessionSet(MAP_DEBUG_SESSION_KEY,'1');
  installSettingsEntry();renderMapDebugGate();
}

function installUiObserver(){
  if(state.settingsObserver)return;let queued=false;
  state.settingsObserver=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;installSettingsEntry();injectIntoExistingDevRoom()})});
  state.settingsObserver.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  installSettingsEntry();injectIntoExistingDevRoom();
}

function newSession({source='manual',chapter=0}={}){
  return{
    schema:2,build:BUILD_VERSION,saveSchema:SAVE_SCHEMA_VERSION,source,chapterRequested:Number(chapter)||0,
    startedAt:wallNow(),startedPerf:now(),endedAt:null,durationMs:0,
    chapter:0,step:'',mode:'',events:[],objectives:[],dialogueCount:0,reliabilityWarnings:[],fights:[],currentFight:null,
    longestMeaningfulGapMs:0,lastMeaningfulPerf:now(),backgroundMs:0,backgroundStarted:0,
    combat:{playerDamage:0,enemyDamage:0,playerHits:0,enemyHits:0},
    arena:{grid:new Set(),sampleCount:0,distanceTotal:0,edgeSamples:0,stageIds:new Set()},
    progressStart:snapshotProgress()
  };
}

function snapshotProgress(){
  try{const p=loadLostYearProgress();return{level:Number(p.storyLevel)||1,xp:Number(p.storyXp)||0,checkpoint:p.lastCheckpoint||'',completed:[...(p.completedMissions||[])],bonus:{...(p.storyBonusStats||{})}}}catch(error){return{error:error.message}}
}

function meaningful(type,detail={}){
  const s=state.session;if(!s)return;
  const t=now(),gap=t-s.lastMeaningfulPerf;s.longestMeaningfulGapMs=Math.max(s.longestMeaningfulGapMs,gap);s.lastMeaningfulPerf=t;
  s.events.push({t:Math.round(t-s.startedPerf),type,detail});if(s.events.length>1500)s.events.shift();
}

function startHumanPlaytest({source='manual',chapter=0}={}){
  if(state.session)stopHumanPlaytest({reason:'restarted'});
  state.session=newSession({source,chapter});renderStatus();setOutput(`Recording started${chapter?` • Chapter ${chapter}`:''}.\nPlay normally. The lab is now collecting pacing/combat telemetry.`);closeLab();
}

function finalizeCurrentFight(){
  const s=state.session;if(!s?.currentFight)return;const fight=s.currentFight;fight.durationMs=Math.max(0,now()-fight.startedPerf);delete fight.startedPerf;s.fights.push(fight);s.currentFight=null;
}

function stopHumanPlaytest({reason='manual'}={}){
  const s=state.session;if(!s){setOutput(state.lastReport||'No active recording.');return null}
  finalizeCurrentFight();if(s.backgroundStarted)s.backgroundMs+=Math.max(0,now()-s.backgroundStarted);
  s.endedAt=wallNow();s.durationMs=Math.max(0,now()-s.startedPerf);s.progressEnd=snapshotProgress();s.stopReason=reason;
  const report=buildHumanReport(s);state.lastReport=report.text;storageSet(LAST_REPORT_KEY,report.text);state.lastReportJson=report.json;state.session=null;renderStatus();openLab();setOutput(report.text);return report;
}

function buildHumanReport(s){
  const arenaCoverage=Math.round((s.arena.grid.size/64)*100),avgDistance=s.arena.sampleCount?Math.round(s.arena.distanceTotal/s.arena.sampleCount):0;
  const fightLines=s.fights.length?s.fights.map((fight,index)=>`  ${index+1}. ${fight.opponent||'Unknown'} • ${fmtMs(fight.durationMs)} • ${fight.rank||'unranked'} • ${fight.won===undefined?'result n/a':fight.won?'WIN':'LOSS'}`).join('\n'):'  none recorded';
  const objectiveLines=s.objectives.length?s.objectives.slice(-20).map(item=>`  ${fmtMs(item.atMs)} • ${item.title}${item.detail?` — ${item.detail}`:''}`).join('\n'):'  none recorded';
  const warnings=[];
  if(s.longestMeaningfulGapMs>180000)warnings.push(`LONG PACING GAP • ${fmtMs(s.longestMeaningfulGapMs)}`);
  if(s.fights.some(f=>f.durationMs<20000))warnings.push('VERY SHORT STORY FIGHT • one or more fights ended under 20s');
  if(s.fights.some(f=>f.durationMs>300000))warnings.push('VERY LONG STORY FIGHT • one or more fights exceeded 5m');
  if(s.fights.length>=2&&s.fights.filter(f=>f.rank==='S'||f.rank==='E').length>=Math.ceil(s.fights.length*.6))warnings.push('EXTREME FIGHT RESULTS • most recorded ranks sit at an extreme');
  const bonus=s.progressStart?.bonus||{},bonusTotal=Object.values(bonus).reduce((sum,value)=>sum+(Number(value)||0),0);if(bonusTotal>=20)warnings.push(`HIGH OPTIONAL STAT TOTAL • ${bonusTotal} raw bonus points may affect balance`);
  if(arenaCoverage&&arenaCoverage<22&&s.arena.sampleCount>40)warnings.push(`LOW ARENA COVERAGE • about ${arenaCoverage}% of sampled grid used`);
  warnings.push(...s.reliabilityWarnings.map(item=>`RELIABILITY • ${item}`));
  const lines=[
    'PARALLELS X • PLAYTEST LAB REPORT',
    `Build: ${s.build}`,
    `Requested chapter: ${s.chapterRequested||'manual/free'}`,
    `Observed chapter: ${s.chapter||'unknown'} • Step: ${s.step||'unknown'}`,
    `Duration: ${fmtMs(s.durationMs)} • Backgrounded: ${fmtMs(s.backgroundMs)}`,
    `Longest gap between meaningful events: ${fmtMs(s.longestMeaningfulGapMs)}`,
    `Dialogue lines: ${s.dialogueCount} • Objective changes: ${s.objectives.length} • Fights: ${s.fights.length}`,
    `Damage telemetry: player ${Math.round(s.combat.playerDamage)} (${s.combat.playerHits} hits) • enemies ${Math.round(s.combat.enemyDamage)} (${s.combat.enemyHits} hits)`,
    `Arena sampling: ${arenaCoverage}% grid coverage • avg fighter distance ${avgDistance} • edge samples ${s.arena.edgeSamples}/${s.arena.sampleCount}`,
    `Stages sampled: ${[...s.arena.stageIds].join(', ')||'none'}`,
    '',
    'WARNINGS',
    ...(warnings.length?warnings.map(item=>`  ⚠ ${item}`):['  none from automatic thresholds']),
    '',
    'FIGHTS',fightLines,'','OBJECTIVE TIMELINE (latest 20)',objectiveLines,'',
    'START PROGRESS',`  ${safeJson(s.progressStart)}`,'END PROGRESS',`  ${safeJson(s.progressEnd)}`,
    '',
    'NOTE: This report measures what happened. It cannot decide whether a route, joke, quest, or fight was fun.'
  ];
  const json={...s,arena:{...s.arena,grid:[...s.arena.grid],stageIds:[...s.arena.stageIds]},warnings};delete json.currentFight;return{text:lines.join('\n'),json};
}

async function runFullQa(){
  openLab();setOutput('Running non-destructive QA…');
  const checks=[];const add=(name,status,detail='')=>checks.push({name,status,detail});
  const rebuild=globalThis.__PX_CHAPTER1_ADVENTURE_REBUILD__;
  add('Recovery base/build identity',CHAPTER1_ADVENTURE_VERSION==='2.9A.40.7.2R'?'PASS':'WARN',`${BUILD_VERSION} • recovery layer ${CHAPTER1_ADVENTURE_VERSION}`);
  add('Save schema preserved',SAVE_SCHEMA_VERSION===268?'PASS':'FAIL',`schema ${SAVE_SCHEMA_VERSION}`);
  add('Chapter 1 rebuild runtime',rebuild?.installed?'PASS':'FAIL',rebuild?.version||'not installed');
  add('Story Fire Blast runtime tuning',rebuild?.arenaTuning?'PASS':'FAIL',rebuild?.fireBlast?`${rebuild.fireBlast.energy} EN • ${rebuild.fireBlast.cooldown}s • ${rebuild.fireBlast.damage} dmg`:'missing');
  add('Physical route contract',Object.keys(CHAPTER1_ROUTES).length===3&&CHAPTER1_ROUTES.forest.markers.length===4&&CHAPTER1_ROUTES.cliff.markers.length===5?'PASS':'FAIL','Main / Forest / Cliff');
  add('Guidance ladder',CHAPTER1_GUIDANCE.softHintMs===18000&&CHAPTER1_GUIDANCE.exactHintMs===36000?'PASS':'FAIL','18s contextual • 36s explicit');
  add('Outskirts detour World Delight',WORLD_DELIGHT_DISCOVERIES['c1-road-detour']?'PASS':'FAIL',WORLD_DELIGHT_DISCOVERIES['c1-road-detour']?.label||'missing');
  add('Road prototype patched',Boolean(RrvvfoRoadHub?.prototype?.__pxAdventureRebuildInstalled)?'PASS':'FAIL','runtime prototype layer');
  add('Arena prototype patched',Boolean(ArenaBattle?.prototype?.__pxStoryFireBlastTuned)?'PASS':'FAIL','Story-only Fire Blast layer');
  const ids=[...document.querySelectorAll('[id]')].map(node=>node.id),duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);add('Live DOM duplicate IDs',duplicates.length?'WARN':'PASS',duplicates.length?`${new Set(duplicates).size} duplicates currently mounted`:'none');
  try{const progress=loadLostYearProgress();add('Story save readable',progress&&typeof progress==='object'?'PASS':'FAIL',`checkpoint ${progress?.lastCheckpoint||'none'}`)}catch(error){add('Story save readable','FAIL',error.message)}
  add('Mobile developer entry',document.querySelector('.pxDevBuildTap')?'PASS':'WARN','Settings → Build Version ×7');
  add('Existing Konami developer room',document.querySelector('[data-story-playtest]')?'PASS':'WARN','↑ ↑ ↓ ↓ ← → ← → B A');
  try{
    const modules=await Promise.allSettled([
      import('./rrvvfo-mission-2.js?v=29a55b-valley-20261123'),
      import('./rrvvfo-chapter-3.js?v=29a55b-valley-20261123'),
      import('./rrvvfo-chapter-4.js?v=29a55b-valley-20261123')
    ]);const failed=modules.filter(item=>item.status==='rejected');add('Released Chapter 2–4 modules import',failed.length?'FAIL':'PASS',failed.length?failed.map(item=>item.reason?.message||'import failed').join(' | '):'3 / 3 loaded');
  }catch(error){add('Released Chapter 2–4 modules import','FAIL',error.message)}
  const pass=checks.filter(c=>c.status==='PASS').length,fail=checks.filter(c=>c.status==='FAIL').length,warn=checks.filter(c=>c.status==='WARN').length;
  const output=['PARALLELS X • ONE-CLICK QA',`Build: ${BUILD_VERSION}`,`Result: ${pass} PASS • ${warn} WARN • ${fail} FAIL`,'',...checks.map(c=>`${c.status.padEnd(4)}  ${c.name}${c.detail?` — ${c.detail}`:''}`),'','Human pacing/fun is intentionally not claimed by this automated check.'].join('\n');
  state.lastReport=output;storageSet(LAST_REPORT_KEY,output);setOutput(output);renderStatus();return{checks,pass,fail,warn};
}

function startChapterPlaytest(chapter,{entry=''}={}){
  if(!state.mapDebugUnlocked){setOutput('DEBUG MODE LOCKED • Enter ↑ ↑ ↓ ↓ ← → ← → B A while Settings is open.');return}
  if(!Number.isInteger(chapter)||chapter<1||chapter>8)return;
  if(activeStoryBattleIsOpen()){setOutput('Close the active chapter before jumping to another one. Your story save stays untouched.');return}
  if(!state.session)startHumanPlaytest({source:'chapter-jump',chapter});else state.session.chapterRequested=chapter;
  const selector=entry==='hub'?`[data-story-playtest] [data-playtest-chapter-hub="${chapter}"]`:`[data-story-playtest] [data-playtest-chapter="${chapter}"]`;
  const existing=document.querySelector(selector);
  if(existing){closeLab();existing.click();return}
  closeLab();
  document.dispatchEvent(new CustomEvent('pxplaytestopenstory'));
  const stepId=chapter===1?'rrvvfo-00':chapter===2?'rrvvfo-02':'rrvvfo-0'+chapter;
  setTimeout(()=>document.dispatchEvent(new CustomEvent('pxplayteststartchapter',{detail:{number:chapter,stepId,entry}})),120);
}

function startDebugChapter(chapter){startChapterPlaytest(chapter)}
function startDebugChapterHub(chapter){if(chapter===4)startChapterPlaytest(4,{entry:'hub'})}

const DEBUG_BOSS_PRESETS=Object.freeze({
  'hollow-commander':{fighterId:'grunt-commander',name:'Project Hollow Commander',stage:'echo-village',accent:'#9b7de4',archetype:'support',hp:135,speed:.94,attack:1.08,defense:.92},
  'hollow-watcher':{fighterId:'hollow-watcher',name:'Hollow Watcher',stage:'echo-mountain',accent:'#68d7e3',archetype:'ranged',hp:155,speed:1.02,attack:.98,defense:.9},
  ryuzankaro:{fighterId:'ryuzankaro',name:'Ryuzankaro',stage:'echo-sky',accent:'#55408b',archetype:'heavy',hp:185,speed:.82,attack:1.18,defense:.84},
  'hollow-mimic':{fighterId:'hollow-grunt',name:'Hollow Mimic',stage:'chapter5-outpost',accent:'#bb6bf0',archetype:'trickster',hp:170,speed:1.06,attack:1.08,defense:.88},
  'red-leader':{fighterId:'red-commander',name:'Organization of the Red Leader',stage:'chapter8-core',accent:'#de4a52',archetype:'heavy',hp:195,speed:.88,attack:1.2,defense:.82}
});

async function startBossDebugPreview(bossId){
  const boss=DEBUG_BOSS_PRESETS[bossId];if(!state.mapDebugUnlocked||!boss)return;
  if(activeStoryBattleIsOpen()){setOutput('Close the active chapter before opening boss practice. Your story save stays untouched.');return}
  closeLab();
  try{
    const {startConfiguredArenaBattle}=await import('../arena/arena-mode.js?v=29a55b-valley-20261123');
    const battle=startConfiguredArenaBattle({mode:'training',fighters:['rrvvfo',boss.fighterId],stageId:boss.stage,difficulty:'normal',koTarget:1,allowRandomRematch:false});
    if(!battle)throw new Error('The boss practice fight could not open.');
    const foe=battle.fighters[1];foe.name=boss.name;foe.accent=boss.accent;foe.aiArchetype=boss.archetype;foe.visualScale=1.12;foe.maxHp=boss.hp;foe.hp=boss.hp;foe.storySpeedMultiplier=boss.speed;foe.storyAttackMultiplier=boss.attack;foe.storyDefenseMultiplier=boss.defense;foe.en=55;foe.asset=null;
    battle.trainingDummy='cpu';battle.trainingPursuitDefense='occasional';battle.trainingRecovery='never';battle.hud();battle.notice(`${boss.name.toUpperCase()} • DEBUG PRACTICE`,2);
  }catch(error){console.error('[Boss debug practice]',error);openLab();setOutput('BOSS PRACTICE FAILED\n'+text(error.message||error))}
}

async function startMapDebugPreview(stageId){
  const allowed=new Set(['training-road','tournament-hub','resonance-facility','echo-village','echo-mountain','echo-caverns','echo-sky','shadow-lookout','chapter5-outpost','chapter6-highlands','chapter7-relay','chapter8-core']);
  if(!state.mapDebugUnlocked||!allowed.has(stageId))return;
  if(activeStoryBattleIsOpen()){setOutput('Close the active chapter before opening a map preview. Your story save stays untouched.');return}
  closeLab();
  try{
    const {startConfiguredArenaBattle}=await import('../arena/arena-mode.js?v=29a55b-valley-20261123');
    const battle=startConfiguredArenaBattle({mode:'training',fighters:['rrvvfo','revvfo'],stageId,koTarget:1});
    if(!battle)throw new Error('The arena could not open this map.');
    battle.trainingDummy='stand';battle.trainingPursuitDefense='never';
    const previewCenters={
      'training-road':{x:260,z:0},'tournament-hub':{x:0,z:0},'resonance-facility':{x:0,z:-340},
      'echo-village':{x:0,z:0},'echo-mountain':{x:0,z:0},'echo-caverns':{x:0,z:0},'echo-sky':{x:0,z:0},
      'shadow-lookout':{x:920,z:-310},'chapter5-outpost':{x:515,z:-465},'chapter6-highlands':{x:0,z:0},
      'chapter7-relay':{x:0,z:0},'chapter8-core':{x:390,z:-480}
    };
    const center=previewCenters[stageId]||{x:0,z:0};
    battle.fighters[0].x=center.x-70;battle.fighters[0].z=center.z;
    battle.fighters[1].x=center.x+70;battle.fighters[1].z=center.z+25;
    battle.camera.x=center.x;battle.camera.z=center.z;
    battle.root.classList.add('mapPreviewOnly');
    // Arena instances are reused between previews; remove the prior preview header
    // before adding the new one so old map names and exit buttons cannot stack up.
    battle.root.querySelectorAll('.arenaMapPreviewNav').forEach(node=>node.remove());
    const nav=document.createElement('div');nav.className='arenaMapPreviewNav';
    const title=document.createElement('span');title.textContent=battle.stage?.name||'MAP PREVIEW';
    const exit=document.createElement('button');exit.type='button';exit.textContent='EXIT PREVIEW';exit.addEventListener('click',()=>battle.exit());
    nav.append(title,exit);battle.root.append(nav);
  }catch(error){console.error('[Map debug preview]',error);openLab();setOutput('MAP PREVIEW FAILED\n'+text(error.message||error))}
}

function startQuickFight(opponent){
  if(!state.mapDebugUnlocked){setOutput('DEBUG MODE LOCKED • Enter ↑ ↑ ↓ ↓ ← → ← → B A while Settings is open.');return}
  if(activeStoryBattleIsOpen()){setOutput('Close the active chapter before opening a combat test. Your story save stays untouched.');return}
  if(!state.session)startHumanPlaytest({source:'combat-quick-test'});
  const existing=document.querySelector(`[data-story-playtest] [data-playtest-fight="${CSS.escape(opponent)}"]`);
  if(existing){closeLab();existing.click();return}
  setOutput(`Could not find the existing ${opponent} developer fight button in this runtime.`);openLab();
}

async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true}catch{}
  try{const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();const ok=document.execCommand('copy');area.remove();return ok}catch{return false}
}

async function copyLastReport(){const value=state.lastReport||storageGet(LAST_REPORT_KEY)||'No Playtest Lab report yet.';const ok=await copyText(value);setOutput(`${value}\n\n[${ok?'COPIED TO CLIPBOARD':'COPY FAILED — SELECT THE REPORT MANUALLY'}]`)}

function downloadLastReport(){
  const json=state.lastReportJson||{build:BUILD_VERSION,report:state.lastReport||storageGet(LAST_REPORT_KEY)||'No report yet.'};const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`ParallelsX-QA-${new Date().toISOString().replaceAll(':','-')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
}

function recordObjectiveFromDom(){
  if(!state.session)return;
  const selectors=[['[data-road-objective]','[data-road-detail]'],['[data-c2-objective]','[data-c2-detail]'],['[data-c3-objective]','[data-c3-detail]'],['[data-c4-objective]','[data-c4-detail]'],['[data-tutorial-objective]','[data-tutorial-detail]']];
  for(const [titleSel,detailSel] of selectors){const titleNode=document.querySelector(titleSel);if(!titleNode||titleNode.offsetParent===null)continue;const title=text(titleNode.textContent).trim(),detail=text(document.querySelector(detailSel)?.textContent).trim();if(!title)continue;const last=state.session.objectives.at(-1);if(last?.title===title&&last?.detail===detail)return;const item={atMs:Math.round(now()-state.session.startedPerf),title,detail};state.session.objectives.push(item);meaningful('objective',{title,detail});return}
}

function installTelemetryListeners(){
  const on=(name,handler)=>document.addEventListener(name,handler);
  on('pxstorystepstart',event=>{const s=state.session;if(!s)return;s.chapter=Number(event.detail?.chapter)||s.chapter;s.step=event.detail?.stepId||s.step;meaningful('step',{chapter:s.chapter,step:s.step})});
  on('pxstorymodechange',event=>{const s=state.session;if(!s)return;const d=event.detail||{};s.mode=d.to||s.mode;if(d.to==='combat'&&d.from!=='combat'){finalizeCurrentFight();s.currentFight={chapter:s.chapter,opponent:d.opponent||'',startedPerf:now(),rank:'',won:undefined}}else if(d.from==='combat'&&d.to!=='combat'){finalizeCurrentFight()}meaningful('mode',{from:d.from||'',to:d.to||'',opponent:d.opponent||''})});
  on('pxdialogueline',event=>{if(!state.session)return;state.session.dialogueCount++;meaningful('dialogue',{speaker:event.detail?.speaker||''})});
  on('pxstoryfightrank',event=>{const s=state.session;if(!s)return;const d=event.detail||{},fight=s.currentFight||s.fights.at(-1);if(fight){fight.rank=d.rank||fight.rank;fight.won=Boolean(d.won);fight.score=d.score}meaningful('fight-rank',{rank:d.rank,won:d.won,opponent:d.opponentId})});
  on('pxstoryreliabilitywarning',event=>{if(!state.session)return;const message=text(event.detail?.message||event.detail?.issue||safeJson(event.detail));state.session.reliabilityWarnings.push(message);meaningful('reliability-warning',{message})});
  on('pxstorychaptercomplete',event=>{if(!state.session)return;meaningful('chapter-complete',{chapter:event.detail?.chapter||state.session.chapter})});
  on('pxarenafeedback',event=>{if(!state.session)return;const type=event.detail?.type||'feedback';if(['perfectParry','guardBreak','wallSplat','groundBounce','pursuitTech'].includes(type))meaningful(`combat-${type}`,{})});
  document.addEventListener('visibilitychange',()=>{const s=state.session;if(!s)return;if(document.hidden){s.backgroundStarted=now()}else if(s.backgroundStarted){s.backgroundMs+=Math.max(0,now()-s.backgroundStarted);s.backgroundStarted=0;meaningful('resume-from-background',{})}});
  state.objectiveObserver=new MutationObserver(()=>recordObjectiveFromDom());state.objectiveObserver.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});
}

function installArenaTelemetry(){
  const proto=ArenaBattle?.prototype;if(!proto||proto[ARENA_TELEMETRY_FLAG])return;Object.defineProperty(proto,ARENA_TELEMETRY_FLAG,{value:true});
  const baseUpdate=proto.update;
  proto.update=function(dt){const result=baseUpdate.call(this,dt);sampleArena(this);return result};
  const baseDamage=proto.applyDamage;
  proto.applyDamage=function(attacker,target,damage,meta={}){const before=Number(target?.hp)||0,result=baseDamage.call(this,attacker,target,damage,meta),after=Number(target?.hp)||0;if(state.session&&result&&this.root?.classList.contains('storyEngineActive')){const dealt=Math.max(0,before-after);if(attacker?.id==='rrvvfo'){state.session.combat.playerDamage+=dealt;state.session.combat.playerHits++}else if(target?.id==='rrvvfo'){state.session.combat.enemyDamage+=dealt;state.session.combat.enemyHits++}}return result};
}

function sampleArena(arena){
  const s=state.session;if(!s||!arena?.root?.classList.contains('storyEngineActive')||arena.phase!=='play')return;const t=now();if(t-state.lastArenaSample<250)return;state.lastArenaSample=t;
  const fighters=arena.fighters||[],bounds=arena.stage?.bounds;if(fighters.length<2||!bounds)return;const width=Math.max(1,bounds.maxX-bounds.minX),depth=Math.max(1,bounds.maxZ-bounds.minZ);s.arena.stageIds.add(arena.stage?.id||'unknown');
  for(const fighter of fighters){const gx=clamp(Math.floor(((fighter.x-bounds.minX)/width)*8),0,7),gz=clamp(Math.floor(((fighter.z-bounds.minZ)/depth)*8),0,7);s.arena.grid.add(`${gx}:${gz}`);const edge=Math.min(fighter.x-bounds.minX,bounds.maxX-fighter.x,fighter.z-bounds.minZ,bounds.maxZ-fighter.z);if(edge<Math.min(width,depth)*.12)s.arena.edgeSamples++}
  s.arena.sampleCount++;s.arena.distanceTotal+=Math.hypot((fighters[0].x||0)-(fighters[1].x||0),(fighters[0].z||0)-(fighters[1].z||0));
}

function boot(){
  state.unlocked=sessionGet(DEV_SESSION_KEY)==='1';state.mapDebugUnlocked=sessionGet(MAP_DEBUG_SESSION_KEY)==='1';state.lastReport=storageGet(LAST_REPORT_KEY)||'';buildLab();installUiObserver();installTelemetryListeners();installArenaTelemetry();document.addEventListener('keydown',handleMapDebugKonami,true);renderMapDebugGate();if(state.unlocked)installSettingsEntry();
  globalThis.__PX_PLAYTEST_LAB__={open:openLab,close:closeLab,runFullQa,startHumanPlaytest,stopHumanPlaytest,startChapterPlaytest,get active(){return Boolean(state.session)},get lastReport(){return state.lastReport}};
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
