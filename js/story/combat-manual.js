const MANUAL_SAVE_KEY='pxCombatManualV1';
const MANUAL_UI_ID='pxCombatManualUI';

const PUBLIC_PAGE_IDS=Object.freeze(['welcome','movement','basic-combat','kinetic-combat','special-categories','momentum-finisher','resource-control','advanced-defense','modes','training-drills','fighter-rrvvfo','fighter-revvfo','fighter-wade','fighter-bark','fighter-sage','glossary','input-devices']);

export const COMBAT_MANUAL_PAGES=Object.freeze([
  {
    id:'welcome',category:'START HERE',title:'WELCOME, FIGHTER',kicker:'YES, YOU HAVE TO READ SOMETHING',
    summary:'Parallels X is a fast browser fighter built around movement, timed defense, grabs, energy control, and continuous first-to-three-KO battles.',
    entries:[
      ['Win the match','Score three KOs before your opponent'],
      ['Do not turtle forever','Guard expires and grabs punish predictable blocking'],
      ['Spend with a plan','Strong techniques use large chunks of energy'],
      ['Use the arena','Depth movement, ring position, and stage space matter'],
      ['Sage note','If you mash every button at once, the manual cannot save you. I tried.']
    ],
    drill:'Open Training and complete one clean light → heavy → launcher route.'
  },
  {
    id:'movement',category:'FOUNDATIONS',title:'MOVEMENT',kicker:'GET WHERE YOU ARE GOING',
    summary:'Move through battles and field spaces without fighting the camera.',
    entries:[
      ['Move','W A S D / LEFT STICK / TOUCH MOVEMENT'],
      ['Hub camera','RIGHT STICK / CLICK + DRAG MOUSE OR TRACKPAD'],
      ['Jump','SPACE / SOUTH BUTTON / JUMP'],
      ['Dash','SHIFT / SHOULDER / DASH'],
      ['Depth movement','Use forward and backward depth movement to dodge lines of fire'],
      ['Field rule','Look for landmarks, loops, and shortcuts instead of empty dead ends.']
    ],
    drill:'Cross the Training arena, jump once, then dash back without attacking.'
  },
  {
    id:'basic-combat',category:'FOUNDATIONS',title:'BASIC COMBAT',kicker:'DO NOT JUST MASH',
    summary:'Light, heavy, launcher, grab, and block form the base of every fight.',
    entries:[
      ['Light','Fast pressure and combo starts'],
      ['Heavy','Slower impact, knockback, and a pursuit window on hit'],
      ['Launcher','Starts an air route and opens a pursuit window'],
      ['Timed guard','Guard lasts only a few seconds; the opening instant is a perfect-parry window'],
      ['Grab','Beats guarding, but missing leaves you open']
    ],
    drill:'Land a light, heavy, launcher, and grab on a stationary Training dummy.'
  },
  {
    id:'kinetic-combat',category:'FOUNDATIONS',title:'KINETIC COMBAT',kicker:'LAUNCH, CHASE, FINISH',
    summary:'Movement is defense and offense. Heavy or launcher hits can open one pursuit chase before juggle protection forces recovery.',
    entries:[
      ['Pursuit','Land Heavy or Launcher, then press Dash during PURSUIT WINDOW'],
      ['Follow-up','Press Light for control or Heavy for a committed slam'],
      ['One chase','Only one pursuit and one wall bounce are allowed per combo'],
      ['Juggle limit','Six airborne hits force recovery so stunlocks cannot continue'],
      ['Depth assist','Attacks gently correct depth at close range, but movement still matters']
    ],
    drill:'Launch the dummy, press Dash to pursue, then finish with a pursuit Heavy.'
  },
  {
    id:'special-categories',category:'TECHNIQUES',title:'SHOT / POWER / TRICK',kicker:'THREE TACTICAL JOBS',
    summary:'Every special belongs to one readable category. The categories do not create hidden immunity; they explain the move’s job and counterplay.',
    entries:[
      ['Shot','Ranged pressure such as Fire Blast or Shots of Agony'],
      ['Power','High-commitment damage and guard pressure such as Solar Weave'],
      ['Trick','Mobility, prediction, traps, or defensive utility such as Object Swap and Lens'],
      ['Read the cue','Each technique announces its category before the dangerous part'],
      ['Loadout identity','Characters keep their own techniques instead of copying another fighter’s identity']
    ]
  },
  {
    id:'momentum-finisher',category:'TECHNIQUES',title:'MOMENTUM FINISHER',kicker:'TENSION WITHOUT A CHEAP INSTANT KO',
    summary:'Aggressive play, heavy hits, pursuits, and perfect parries build Momentum. At full Momentum, a Power technique becomes a stronger but defendable Finisher.',
    entries:[
      ['Build','Fight close, land attacks, take risks, and perfect parry'],
      ['Do not farm','Running away and distant charging build no Momentum'],
      ['Ready cue','The Momentum bar reads FINISHER and the fighter gains a gold aura'],
      ['Counterplay','A Finisher has obvious startup and can still be dodged or parried'],
      ['Not instant death','Finishers deal major damage and launch power, never a hidden full-health KO']
    ]
  },
  {
    id:'resource-control',category:'FOUNDATIONS',title:'ENERGY & GUARD',kicker:'STANDING STILL IS A DECISION',
    summary:'Attacking builds energy. Manual charging restores it faster, but only while standing still and exposed.',
    entries:[
      ['Charge','Hold C / CHARGE while standing still'],
      ['Attack gain','Clean hits restore energy, rewarding active combat'],
      ['Passive gain','Energy returns slowly on its own'],
      ['Guard recovery','Guard recovers faster while standing still and not blocking'],
      ['Story level','Energy Control increases charge and passive recovery during Story Mode']
    ],
    drill:'Turn Infinite Energy off, spend energy, then safely charge back to full.'
  },
  {
    id:'advanced-defense',category:'FOUNDATIONS',title:'PARRY, GRAB & CLASH',kicker:'DEFENSE CANNOT LAST FOREVER',
    summary:'Guarding has a time limit. Read the opponent, parry at the opening instant, or grab someone who refuses to stop blocking.',
    entries:[
      ['Perfect parry','Press guard just before impact to stagger the attacker'],
      ['Guard fatigue','Holding guard too long drains it and creates a lockout'],
      ['Grab','Use GRAB to beat a blocking opponent'],
      ['Clashes','Heavy attacks and compatible projectiles can collide'],
      ['Parry reward','A successful parry creates a short punish window']
    ],
    drill:'Use the Perfect Parry drill and parry three attacks without being hit.'
  },
  {
    id:'modes',category:'GAME GUIDE',title:'GAME MODES',kicker:'PICK THE RIGHT KIND OF TROUBLE',
    summary:'Each mode uses the same combat foundation but serves a different purpose.',
    entries:[
      ['Story','Continuous chapters, hubs, dialogue, progression, and scripted battles'],
      ['Arena','3D first-to-three battles in Tangai Dojo or the Global Tournament'],
      ['VS CPU','A focused match against adaptive AI'],
      ['2 Player','Local same-device multiplayer'],
      ['Training','Dummy settings, drills, move testing, and matchup practice'],
      ['Arcade','Planned for Prototype 3.x']
    ]
  },
  {
    id:'training-drills',category:'GAME GUIDE',title:'TRAINING DRILLS',kicker:'PRACTICE WITH A PURPOSE',
    summary:'The Training panel can configure focused exercises instead of leaving you in an empty room.',
    entries:[
      ['Perfect Parry','Practice the opening guard window'],
      ['Pursuit Route','Launch, press Dash to chase, then choose a Light or Heavy follow-up'],
      ['Energy Discipline','Fight with Infinite Energy disabled'],
      ['Guard Pressure','Practice grabs and guard damage against a blocking dummy'],
      ['Lens Read','Activate Lens and react to the prediction instead of admiring the effect']
    ],
    drill:'Choose one Suggested Drill in Training and complete its listed objective.'
  },
  {
    id:'input-devices',category:'GAME GUIDE',title:'INPUT DEVICES',kicker:'THE PROMPTS SHOULD FOLLOW YOU',
    summary:'Prompts update when the active device changes.',
    entries:[
      ['Keyboard','Uses the selected PC layout'],
      ['Controller','Detects Nintendo, Xbox, PlayStation, and custom mappings'],
      ['Touch','Uses the chosen joystick or D-pad layout'],
      ['Live switching','Move or press a button on a different device to update prompts'],
      ['Controller assignment','Use Options when two local players need separate devices']
    ]
  },
  {
    id:'hotbar',category:'TECHNIQUES',title:'RRVVFO HOTBAR',kicker:'SHOT / POWER / TRICK',
    summary:'Rrvvfo carries five techniques organized into the three tactical categories: Shot, Power, and Trick.',
    entries:[['1 • SHOT','Fire Blast'],['2 • SHOT','Shots of Agony'],['3 • TRICK','Object Swap'],['4 • TRICK','Lens of Truth'],['5 • POWER','Solar Weave / Momentum Finisher']],
    drill:'Use every unlocked hotbar slot once without wasting the technique into empty space.'
  },
  {
    id:'fighter-rrvvfo',category:'FIGHTER GUIDES',title:'RRVVFO',kicker:'ADAPTABLE FIRE PRESSURE',
    summary:'Rrvvfo rewards flexible decision-making. He can pressure, reposition, predict, or spend everything on one major attack.',
    entries:[
      ['Strengths','Flexible kit, strong comeback tools, unusual positioning'],
      ['Weaknesses','Expensive techniques and risky Lens health cost'],
      ['Signature','Shots of Agony surrounds the target with coordinated copies'],
      ['Beginner plan','Use Fire Blast for space, then save energy for one committed technique'],
      ['Fight against him','Pressure his charging and do not become predictable during Lens']
    ]
  },
  {
    id:'fighter-revvfo',category:'FIGHTER GUIDES',title:'REVVFO',kicker:'TELEPORT PRESSURE',
    summary:'Revvfo controls the pace with movement bursts and Astrylte power.',
    entries:[
      ['Strengths','Fast repositioning, strong ranged pressure, intimidating burst damage'],
      ['Weaknesses','Commitment and energy use can leave openings'],
      ['Signature','Teleport Strike and Astrylte Blast'],
      ['Beginner plan','Force a reaction with a projectile, then attack from a new angle'],
      ['Fight against him','Watch the destination instead of chasing the teleport trail']
    ]
  },
  {
    id:'fighter-wade',category:'FIGHTER GUIDES',title:'WADE',kicker:'LIGHTNING RUSHDOWN',
    summary:'Wade wins by making decisions faster than the opponent can comfortably answer.',
    entries:[
      ['Strengths','Speed, approach options, rapid pressure'],
      ['Weaknesses','Predictable routes and lower defensive stability'],
      ['Signature','Lightning Dash and Thunderstorm'],
      ['Beginner plan','Dash in, use a short combo, then leave before the counterattack'],
      ['Fight against him','Parry the repeated approach timing instead of chasing him']
    ]
  },
  {
    id:'fighter-bark',category:'FIGHTER GUIDES',title:'BARK',kicker:'EARTH DEFENSE',
    summary:'Bark controls space with armor, walls, guard pressure, and heavy commitment.',
    entries:[
      ['Strengths','Durability, guard damage, grounded control'],
      ['Weaknesses','Slower movement and punishable misses'],
      ['Signature','Rock Armor and Earth Wall'],
      ['Beginner plan','Take the center, block one approach, then answer with a heavy attack'],
      ['Fight against him','Use grabs, depth movement, and patience instead of attacking armor blindly']
    ]
  },
  {
    id:'fighter-sage',category:'FIGHTER GUIDES',title:'THE SAGE / PLOUKE',kicker:'PATIENT TECHNIQUE',
    summary:'The Sage path is built around timing, restraint, and suddenly overwhelming an impatient opponent.',
    entries:[
      ['Strengths','Excellent timing, defensive reads, high-impact punishment'],
      ['Weaknesses','Deliberate pace and fewer careless escape options'],
      ['Signature','Sage Palm and effortless parry timing'],
      ['Beginner plan','Wait for the opponent to commit, then punish the recovery'],
      ['Fight against him','Use feints, grabs, and irregular timing. Do not attack on a rhythm.']
    ]
  },
  {
    id:'hub-exploration',category:'FIELD',title:'LIVING HUBS',kicker:'THE WORLD IS PART OF THE GAME',
    summary:'Hubs are compact story playgrounds. Interact with people, marked objects, side paths, practice rings, and changing events.',
    entries:[['Main path','Follow landmarks, crowds, signs, and story activity'],['Optional path','Look for short fights, jokes, secrets, and side stories'],['Interaction','Use the prompt near people and highlighted objects'],['Return route','Most branches loop back or unlock a shortcut']]
  },
  {
    id:'field-object-swap',category:'FIELD',title:'OBJECT SWAP POINTS',kicker:'THE WORLD COUNTS TOO',
    summary:'Marked field objects can replace Rrvvfo’s position outside battle.',
    entries:[['Marked object','Look for the gold swap shimmer'],['Field input','Use hotbar slot 3 near the marked point'],['Destination','Rrvvfo trades places with the selected object'],['Route rule','Field swaps never consume story combat health']]
  },
  {
    id:'field-fire',category:'FIELD',title:'FIRE BLAST ROADBLOCKS',kicker:'SOMETIMES THE DIRECT ANSWER IS FIRE',
    summary:'Burnable field obstacles can be removed with Fire Blast.',
    entries:[['Burnable object','Look for dry wood, rope, or heat-reactive machinery'],['Field input','Use hotbar slot 1 inside the marked zone'],['World result','The obstacle is removed and nearby characters react'],['Safety note','Do not interpret this page as permission to burn everything']]
  },
  {
    id:'field-shots',category:'FIELD',title:'SHOTS OF AGONY SWITCHES',kicker:'ONE RRVVFO IS APPARENTLY NOT ENOUGH',
    summary:'Shots of Agony can strike several field targets at once.',
    entries:[['Target group','Find switches carrying the same glow'],['Field input','Use hotbar slot 2 inside the target zone'],['Timing','All copies fire together'],['Result','Multi-lock gates and machines activate at once']]
  },
  {
    id:'tournament-rules',category:'TOURNAMENT',title:'TOURNAMENT RULES',kicker:'READ BEFORE COMPLAINING',
    summary:'Registration, bracket order, fighter entrances, and ring rules control tournament progression.',
    entries:[['Registration','Confirm the entry before checking the bracket'],['Win condition','Score three KOs or ring-outs before the opponent'],['Ring edge','Crossing the warning boundary counts as a ring-out'],['Respawns','Only the defeated fighter respawns; the winner keeps health, energy, and position'],['Final exception','Plouke’s scripted final disables ring-outs'],['Running','Official tournament story fights cannot be abandoned']]
  },
  {
    id:'run-encounters',category:'ENCOUNTERS',title:'FIGHT OR RUN',kicker:'NON-STORY ENCOUNTERS',
    summary:'Roaming opponents can be fought or escaped. A failed escape forces the battle.',
    entries:[['Fight','Enter the encounter normally'],['Run','Complete the short escape input sequence'],['Success','Return to the hub with temporary chase protection'],['Failure','The enemy catches you and the fight begins']]
  },
  {
    id:'training-levels',category:'PROGRESSION',title:'TRAINING LEVELS',kicker:'STORY MODE ONLY',
    summary:'Small story upgrades improve options without turning the fighting system into a grind.',
    entries:[['Main source','Story chapters'],['Extra source','First-time side stories and challengers'],['Rematches','Very little progress'],['Versus modes','Story levels are ignored']]
  },
  {
    id:'lens-secrets',category:'TECHNIQUES',title:'LENS OF TRUTH',kicker:'SEE WHAT THE HUB HIDES',
    summary:'The Lens predicts danger and reveals hidden field information, but it is expensive and never replaces the player’s reaction.',
    entries:[['Hidden route','Look for visual inconsistencies'],['Fake object','The Lens exposes the real interactable'],['Disguise','Important story clues may be concealed'],['Early cost','60 energy and 25 health'],['Prediction','Shows the opponent’s most probable next action'],['Mastery','Successful predictions improve accuracy, duration, and cost'],['Full mastery','Adds a small number of automatic dodges instead of permanent invulnerability']],
    drill:'Activate Lens against an attacking dummy and successfully follow the prediction.'
  },
  {
    id:'glossary',category:'REFERENCE',title:'GLOSSARY',kicker:'WORDS PEOPLE KEEP SHOUTING',
    summary:'A compact reference for gameplay terms. Story-only lore entries unlock when they are discovered.',
    entries:[
      ['Energy','Resource spent on techniques and recovered through combat or charging'],
      ['Guard','Temporary defense meter that can break'],
      ['Perfect parry','A guard pressed during the opening timing window'],
      ['Ring-out','Leaving the tournament boundary during an enabled match'],
      ['Story XP','Progress used for small Story-only training improvements'],
      ['Hit-stop','A tiny pause on impact that makes attacks readable and heavy'],
      ['Respawn protection','Brief safety given to the fighter who just returned after a KO']
    ]
  }
]);

const DISCOVERY_REACTIONS=Object.freeze([
  ['Wow. The Sage really planned ahead.'],
  ['Okay, okay. I might be a little impressed by his future-proofing.'],
  ["All right, now it's getting old."],
  ['Maybe next time I should read the entire manual thoroughly without skimming it.','Eh. I probably won’t.']
]);

function defaultState(){return{version:2,owned:false,unlocked:[],discoveryCount:0,updatedAt:Date.now()}}

export function loadCombatManualState(storage=localStorage){
  const fallback=defaultState();
  try{
    const parsed=JSON.parse(storage.getItem(MANUAL_SAVE_KEY)||'null');
    if(!parsed||![1,2].includes(parsed.version))return fallback;
    return{...fallback,...parsed,version:2,owned:Boolean(parsed.owned),unlocked:Array.isArray(parsed.unlocked)?parsed.unlocked.filter(id=>COMBAT_MANUAL_PAGES.some(page=>page.id===id)):[],discoveryCount:Number.isFinite(parsed.discoveryCount)?Math.max(0,parsed.discoveryCount):0};
  }catch{return fallback}
}

export function saveCombatManualState(state,storage=localStorage){
  const next={...state,version:2,updatedAt:Date.now()};
  try{storage.setItem(MANUAL_SAVE_KEY,JSON.stringify(next))}catch{}
  return next;
}

export function grantCombatManual({pages=['welcome','movement','basic-combat','hotbar'],storage=localStorage}={}){
  const state=loadCombatManualState(storage);
  return saveCombatManualState({...state,owned:true,unlocked:[...new Set([...state.unlocked,...pages])]},storage);
}

export function grantPublicCombatManual(storage=localStorage){return grantCombatManual({pages:PUBLIC_PAGE_IDS,storage})}
export function combatManualOwned(storage=localStorage){return loadCombatManualState(storage).owned}
function pageById(id){return COMBAT_MANUAL_PAGES.find(page=>page.id===id)||null}

function ensureUI(){
  let root=document.getElementById(MANUAL_UI_ID);
  if(root)return root;
  root=document.createElement('section');
  root.id=MANUAL_UI_ID;
  root.hidden=true;
  root.setAttribute('aria-label',"The Sage's Combat Manual");
  root.innerHTML=`
    <div class="manualBookShell">
      <header class="manualBookHeader"><div><small>THE SAGE'S COMBAT MANUAL</small><h1>FUTURE-PROOF EDITION</h1></div><button type="button" data-manual-close>× CLOSE</button></header>
      <p class="manualWelcome">“You opened the manual. Impressive. Most fighters just mash Light Attack and complain when they lose.” — THE SAGE</p>
      <div class="manualQuickActions" data-manual-categories aria-label="Manual categories"></div>
      <div class="manualBookLayout"><nav class="manualPageList" data-manual-page-list aria-label="Unlocked manual pages"></nav><article class="manualPage" data-manual-page></article></div>
      <aside class="manualReaction" data-manual-reaction hidden><strong>RRVVFO</strong><div data-manual-reaction-lines></div></aside>
      <footer class="manualBookFooter"><span>M / ESC — CLOSE</span><span>NEW PAGES ARE ADDED WHEN A SYSTEM IS DISCOVERED</span></footer>
    </div>`;
  document.body.appendChild(root);
  return root;
}

let activeSession=null;

function renderCategories(root,state){
  const categories=['ALL',...new Set(COMBAT_MANUAL_PAGES.filter(page=>state.unlocked.includes(page.id)).map(page=>page.category))];
  const holder=root.querySelector('[data-manual-categories]');
  holder.innerHTML=categories.map(category=>`<button type="button" class="${activeSession.category===category?'active':''}" data-manual-category="${category}">${category}</button>`).join('');
  holder.querySelectorAll('[data-manual-category]').forEach(button=>button.addEventListener('click',()=>{activeSession.category=button.dataset.manualCategory;renderPage(root,activeSession.pageId,state)}));
}

function renderPage(root,pageId,state){
  renderCategories(root,state);
  const allUnlocked=COMBAT_MANUAL_PAGES.filter(page=>state.unlocked.includes(page.id));
  const unlockedPages=activeSession.category==='ALL'?allUnlocked:allUnlocked.filter(page=>page.category===activeSession.category);
  const page=(unlockedPages.find(item=>item.id===pageId)||unlockedPages[0]||allUnlocked[0]||COMBAT_MANUAL_PAGES[0]);
  activeSession.pageId=page.id;
  const list=root.querySelector('[data-manual-page-list]');
  list.innerHTML=unlockedPages.map(item=>`<button type="button" class="manualPageTab ${item.id===page.id?'selected':''}" data-manual-page-id="${item.id}"><small>${item.category}</small><strong>${item.title}</strong></button>`).join('');
  list.querySelectorAll('[data-manual-page-id]').forEach(button=>button.addEventListener('click',()=>{activeSession.pageId=button.dataset.manualPageId;renderPage(root,activeSession.pageId,state)}));
  root.querySelector('[data-manual-page]').innerHTML=`<small>${page.category} • ${page.kicker}</small><h2>${page.title}</h2><p>${page.summary}</p><dl>${page.entries.map(([term,description])=>`<div><dt>${term}</dt><dd>${description}</dd></div>`).join('')}</dl>${page.drill?`<section class="manualDrill"><strong>TRY THIS IN TRAINING</strong><span>${page.drill}</span><small class="manualStatus">OPTIONAL DRILL</small></section>`:''}`;
}

function closeManual(){
  if(!activeSession)return;
  const session=activeSession;activeSession=null;session.root.hidden=true;document.removeEventListener('keydown',session.keyHandler,true);session.onClose?.();
}

export function openCombatManual({pageId=null,reactionLines=null,onClose=()=>{},storage=localStorage,grantPublic=false}={}){
  if(grantPublic)grantPublicCombatManual(storage);
  const state=loadCombatManualState(storage);
  if(!state.owned)return false;
  const root=ensureUI();
  const firstUnlocked=state.unlocked[0]||'welcome';
  const selected=state.unlocked.includes(pageId)?pageId:firstUnlocked;
  if(activeSession)closeManual();
  const keyHandler=event=>{if(event.key==='Escape'||event.key.toLowerCase()==='m'){event.preventDefault();event.stopImmediatePropagation();closeManual()}};
  activeSession={root,pageId:selected,category:'ALL',onClose,keyHandler};
  root.hidden=false;
  const reaction=root.querySelector('[data-manual-reaction]');
  if(Array.isArray(reactionLines)&&reactionLines.length){reaction.hidden=false;root.querySelector('[data-manual-reaction-lines]').innerHTML=reactionLines.map(line=>`<p>${line}</p>`).join('')}else{reaction.hidden=true;root.querySelector('[data-manual-reaction-lines]').textContent=''}
  renderPage(root,selected,state);
  root.querySelector('[data-manual-close]').onclick=()=>closeManual();
  document.addEventListener('keydown',keyHandler,true);
  root.querySelector(`[data-manual-page-id="${selected}"]`)?.focus();
  return true;
}

export function discoverCombatManualPage(pageId,{onClose=()=>{},storage=localStorage,reactionLines=null,open=true}={}){
  const page=pageById(pageId);if(!page){onClose();return false}
  let state=loadCombatManualState(storage);if(!state.owned)state=grantCombatManual({storage});
  if(state.unlocked.includes(pageId)){onClose();return false}
  const reaction=Array.isArray(reactionLines)&&reactionLines.length?reactionLines:(DISCOVERY_REACTIONS[Math.min(state.discoveryCount,DISCOVERY_REACTIONS.length-1)]||null);
  state=saveCombatManualState({...state,unlocked:[...state.unlocked,pageId],discoveryCount:state.discoveryCount+1},storage);
  if(open)openCombatManual({pageId,reactionLines:reaction,onClose,storage});else onClose();return true;
}

export function resetCombatManual(storage=localStorage){try{storage.removeItem(MANUAL_SAVE_KEY)}catch{}}
