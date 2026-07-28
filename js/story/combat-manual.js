const MANUAL_SAVE_KEY='pxCombatManualV1';
const MANUAL_UI_ID='pxCombatManualUI';

export const COMBAT_MANUAL_PAGES=Object.freeze([
  {
    id:'movement',category:'FOUNDATIONS',title:'MOVEMENT',kicker:'GET WHERE YOU ARE GOING',
    summary:'Move through battles and field spaces without fighting the camera.',
    entries:[
      ['Move','W A S D / LEFT STICK'],
      ['Jump','SPACE / SOUTH BUTTON'],
      ['Dash','SHIFT / DOUBLE-TAP'],
      ['Field rule','Look for landmarks, loops, and shortcuts instead of empty dead ends.']
    ]
  },
  {
    id:'basic-combat',category:'FOUNDATIONS',title:'BASIC COMBAT',kicker:'DO NOT JUST MASH',
    summary:'Light, heavy, launcher, and block form the base of every fight.',
    entries:[
      ['Light','Fast pressure and combo starts'],
      ['Heavy','Slower impact and knockback'],
      ['Launcher','Start an air follow-up'],
      ['Block','Hold before the attack connects']
    ]
  },
  {
    id:'hotbar',category:'TECHNIQUES',title:'RRVVFO HOTBAR',kicker:'SLOTS 1–5',
    summary:'Rrvvfo carries his main techniques on the combat hotbar.',
    entries:[
      ['1','Fire Blast'],
      ['2','Shots of Agony'],
      ['3','Object Swap'],
      ['4','Lens of Truth'],
      ['5','Ultimate']
    ]
  },
  {
    id:'hub-exploration',category:'FIELD',title:'LIVING HUBS',kicker:'THE WORLD IS PART OF THE GAME',
    summary:'Hubs are compact story playgrounds. Interact with people, marked objects, side paths, practice rings, and changing events.',
    entries:[
      ['Main path','Follow the landmark, crowds, signs, and story activity'],
      ['Optional path','Look for short fights, jokes, secrets, and side stories'],
      ['Interaction','Use the prompt near people and highlighted objects'],
      ['Return route','Most branches loop back or unlock a shortcut']
    ]
  },
  {
    id:'field-object-swap',category:'FIELD',title:'OBJECT SWAP POINTS',kicker:'THE WORLD COUNTS TOO',
    summary:'Marked field objects can replace Rrvvfo’s position outside battle. Use them to cross gaps and open routes without turning the hub into a walking detour.',
    entries:[
      ['Marked object','Look for the gold swap shimmer'],
      ['Field input','Use hotbar slot 3 near the marked point'],
      ['Destination','Rrvvfo trades places with the selected object'],
      ['Route rule','Field swaps never consume story combat health']
    ]
  },
  {
    id:'field-fire',category:'FIELD',title:'FIRE BLAST ROADBLOCKS',kicker:'SOMETIMES THE DIRECT ANSWER IS FIRE',
    summary:'Burnable field obstacles can be removed with Fire Blast. The route stays blocked until the obstacle is actually cleared.',
    entries:[
      ['Burnable object','Look for dry wood, rope, or heat-reactive machinery'],
      ['Field input','Use hotbar slot 1 inside the marked zone'],
      ['World result','The obstacle is removed and nearby characters react'],
      ['Safety note','Do not interpret this page as permission to burn everything']
    ]
  },
  {
    id:'field-shots',category:'FIELD',title:'SHOTS OF AGONY SWITCHES',kicker:'ONE RRVVFO IS APPARENTLY NOT ENOUGH',
    summary:'The technique Sage personally taught Rrvvfo can strike several field targets at once. The manual only explains the overworld use; it does not replace the training scene.',
    entries:[
      ['Target group','Find switches carrying the same glow'],
      ['Field input','Use hotbar slot 2 inside the target zone'],
      ['Timing','All copies fire together'],
      ['Result','Multi-lock gates and machines activate at once']
    ]
  },
  {
    id:'tournament-rules',category:'TOURNAMENT',title:'TOURNAMENT RULES',kicker:'READ BEFORE COMPLAINING',
    summary:'Registration, bracket order, fighter entrances, and ring rules control tournament progression.',
    entries:[
      ['Registration','Confirm the entry before checking the bracket'],
      ['Bracket','Shows the next opponent and match order'],
      ['Fighter gate','Story progression begins beyond the entrance'],
      ['Running','Official tournament story fights cannot be abandoned']
    ]
  },
  {
    id:'run-encounters',category:'ENCOUNTERS',title:'FIGHT OR RUN',kicker:'NON-STORY ENCOUNTERS',
    summary:'Roaming opponents can be fought or escaped. A failed escape forces the battle.',
    entries:[
      ['Fight','Enter the encounter normally'],
      ['Run','Complete the short escape input sequence'],
      ['Success','Return to the hub with temporary chase protection'],
      ['Failure','The enemy catches you and the fight begins']
    ]
  },
  {
    id:'training-levels',category:'PROGRESSION',title:'TRAINING LEVELS',kicker:'STORY MODE ONLY',
    summary:'Small story upgrades improve options without turning the fighting system into a grind.',
    entries:[
      ['Main source','Story chapters'],
      ['Extra source','First-time side stories and challengers'],
      ['Rematches','Very little progress'],
      ['Versus modes','Story levels are ignored']
    ]
  },
  {
    id:'lens-secrets',category:'FIELD',title:'LENS OF TRUTH',kicker:'SEE WHAT THE HUB HIDES',
    summary:'Some field objects, routes, disguises, and traps only reveal their real state through the Lens of Truth.',
    entries:[
      ['Hidden route','Look for visual inconsistencies'],
      ['Fake object','The Lens exposes the real interactable'],
      ['Disguise','Important story clues may be concealed'],
      ['Cost','Use it deliberately instead of leaving it active']
    ]
  }
]);

const DISCOVERY_REACTIONS=Object.freeze([
  ['Wow. The Sage really planned ahead.'],
  ['Okay, okay. I might be a little impressed by his future-proofing.'],
  ["All right, now it's getting old."],
  ['Maybe next time I should read the entire manual thoroughly without skimming it.','Eh. I probably won’t.']
]);

function defaultState(){
  return{version:1,owned:false,unlocked:[],discoveryCount:0,updatedAt:Date.now()};
}

export function loadCombatManualState(storage=localStorage){
  const fallback=defaultState();
  try{
    const parsed=JSON.parse(storage.getItem(MANUAL_SAVE_KEY)||'null');
    if(!parsed||parsed.version!==1)return fallback;
    return{
      ...fallback,
      ...parsed,
      owned:Boolean(parsed.owned),
      unlocked:Array.isArray(parsed.unlocked)?parsed.unlocked.filter(id=>COMBAT_MANUAL_PAGES.some(page=>page.id===id)):[],
      discoveryCount:Number.isFinite(parsed.discoveryCount)?Math.max(0,parsed.discoveryCount):0
    };
  }catch{return fallback}
}

export function saveCombatManualState(state,storage=localStorage){
  const next={...state,version:1,updatedAt:Date.now()};
  try{storage.setItem(MANUAL_SAVE_KEY,JSON.stringify(next))}catch{}
  return next;
}

export function grantCombatManual({pages=['movement','basic-combat','hotbar'],storage=localStorage}={}){
  const state=loadCombatManualState(storage);
  return saveCombatManualState({
    ...state,
    owned:true,
    unlocked:[...new Set([...state.unlocked,...pages])]
  },storage);
}

export function combatManualOwned(storage=localStorage){
  return loadCombatManualState(storage).owned;
}

function pageById(id){
  return COMBAT_MANUAL_PAGES.find(page=>page.id===id)||null;
}

function ensureUI(){
  let root=document.getElementById(MANUAL_UI_ID);
  if(root)return root;
  root=document.createElement('section');
  root.id=MANUAL_UI_ID;
  root.hidden=true;
  root.setAttribute('aria-label',"The Sage's Combat Manual");
  root.innerHTML=`
    <div class="manualBookShell">
      <header class="manualBookHeader">
        <div><small>THE SAGE'S COMBAT MANUAL</small><h1>FUTURE-PROOF EDITION</h1></div>
        <button type="button" data-manual-close>× CLOSE</button>
      </header>
      <div class="manualBookLayout">
        <nav class="manualPageList" data-manual-page-list aria-label="Unlocked manual pages"></nav>
        <article class="manualPage" data-manual-page></article>
      </div>
      <aside class="manualReaction" data-manual-reaction hidden><strong>RRVVFO</strong><div data-manual-reaction-lines></div></aside>
      <footer class="manualBookFooter"><span>M / ESC — CLOSE</span><span>NEW PAGES ARE ADDED WHEN A SYSTEM IS DISCOVERED</span></footer>
    </div>`;
  document.body.appendChild(root);
  return root;
}

let activeSession=null;

function renderPage(root,pageId,state){
  const unlockedPages=COMBAT_MANUAL_PAGES.filter(page=>state.unlocked.includes(page.id));
  const page=pageById(pageId)||unlockedPages[0]||COMBAT_MANUAL_PAGES[0];
  const list=root.querySelector('[data-manual-page-list]');
  list.innerHTML=unlockedPages.map(item=>`
    <button type="button" class="manualPageTab ${item.id===page.id?'selected':''}" data-manual-page-id="${item.id}">
      <small>${item.category}</small><strong>${item.title}</strong>
    </button>`).join('');
  list.querySelectorAll('[data-manual-page-id]').forEach(button=>button.addEventListener('click',()=>{
    activeSession.pageId=button.dataset.manualPageId;
    renderPage(root,activeSession.pageId,state);
  }));
  root.querySelector('[data-manual-page]').innerHTML=`
    <small>${page.category} • ${page.kicker}</small>
    <h2>${page.title}</h2>
    <p>${page.summary}</p>
    <dl>${page.entries.map(([term,description])=>`<div><dt>${term}</dt><dd>${description}</dd></div>`).join('')}</dl>`;
}

function closeManual(){
  if(!activeSession)return;
  const session=activeSession;
  activeSession=null;
  session.root.hidden=true;
  document.removeEventListener('keydown',session.keyHandler,true);
  session.onClose?.();
}

export function openCombatManual({pageId=null,reactionLines=null,onClose=()=>{},storage=localStorage}={}){
  const state=loadCombatManualState(storage);
  if(!state.owned)return false;
  const root=ensureUI();
  const firstUnlocked=state.unlocked[0]||'movement';
  const selected=state.unlocked.includes(pageId)?pageId:firstUnlocked;
  if(activeSession)closeManual();
  const keyHandler=event=>{
    if(event.key==='Escape'||event.key.toLowerCase()==='m'){
      event.preventDefault();
      event.stopImmediatePropagation();
      closeManual();
    }
  };
  activeSession={root,pageId:selected,onClose,keyHandler};
  root.hidden=false;
  const reaction=root.querySelector('[data-manual-reaction]');
  if(Array.isArray(reactionLines)&&reactionLines.length){
    reaction.hidden=false;
    root.querySelector('[data-manual-reaction-lines]').innerHTML=reactionLines.map(line=>`<p>${line}</p>`).join('');
  }else{
    reaction.hidden=true;
    root.querySelector('[data-manual-reaction-lines]').textContent='';
  }
  renderPage(root,selected,state);
  root.querySelector('[data-manual-close]').onclick=()=>closeManual();
  document.addEventListener('keydown',keyHandler,true);
  root.querySelector(`[data-manual-page-id="${selected}"]`)?.focus();
  return true;
}

export function discoverCombatManualPage(pageId,{onClose=()=>{},storage=localStorage,reactionLines=null}={}){
  const page=pageById(pageId);
  if(!page){onClose();return false}
  let state=loadCombatManualState(storage);
  if(!state.owned)state=grantCombatManual({storage});
  if(state.unlocked.includes(pageId)){
    onClose();
    return false;
  }
  const reaction=Array.isArray(reactionLines)&&reactionLines.length?reactionLines:(DISCOVERY_REACTIONS[Math.min(state.discoveryCount,DISCOVERY_REACTIONS.length-1)]||null);
  state=saveCombatManualState({
    ...state,
    unlocked:[...state.unlocked,pageId],
    discoveryCount:state.discoveryCount+1
  },storage);
  openCombatManual({pageId,reactionLines:reaction,onClose,storage});
  return true;
}

export function resetCombatManual(storage=localStorage){
  try{storage.removeItem(MANUAL_SAVE_KEY)}catch{}
}
