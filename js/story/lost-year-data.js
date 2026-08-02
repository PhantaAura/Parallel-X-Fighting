import {inspectStoryReliability} from './story-reliability.js?v=29a4071-chapter3-sabotage-investigation-20260802';
import {normalizeConnectedWorldState} from './connected-world.js?v=29a4071-chapter3-sabotage-investigation-20260802';
export const LOST_YEAR_SAVE_KEY='pxLostYearProgressV1';
export const RRVVFO_PLANNED_CHAPTER_COUNT=8;
export const STORY_CHAPTERS_PER_CHARACTER=RRVVFO_PLANNED_CHAPTER_COUNT;


export const CHAPTER4_UNLOCK_IDS=Object.freeze(['echoRegion','echoVillage','echoCaverns','shadowLookout','hollowWatcherProfile','vibrationSense','lensMastery1','ryuzankaroCodex','echoTeamBadge']);
export function chapter4CompletionConflict(progress){
  const state=progress?.chapter4State&&typeof progress.chapter4State==='object'?progress.chapter4State:{};
  const marked=Boolean(progress?.completedMissions?.includes('rrvvfo-04')||state.chapterComplete);
  if(!marked)return false;
  const required=new Set(Array.isArray(state.requiredCompleted)?state.requiredCompleted:[]);
  const fullEvidence=['hollowWatcherDefeated','lookoutReached','shadowArrival','chapterSaved'].every(id=>required.has(id));
  const previousEndingEvidence=['hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved'].every(id=>required.has(id));
  const legacyEvidence=Boolean(required.size===0&&state.chapterComplete&&progress?.completedMissions?.includes('rrvvfo-04')&&String(progress?.lastCheckpoint||'')==='rrvvfo-04-complete'&&(progress?.unlocks||[]).includes('shadowLookout'));
  return !(fullEvidence||previousEndingEvidence||legacyEvidence);
}
export function repairChapter4Progress(progress){
  const completedMissions=(progress?.completedMissions||[]).filter(id=>id!=='rrvvfo-04');
  const unlocks=(progress?.unlocks||[]).filter(id=>!CHAPTER4_UNLOCK_IDS.includes(id));
  return{...progress,completedMissions,unlocks,chapter4State:{},lastCheckpoint:'rrvvfo-04',selectedRoute:'rrvvfo',routeStarted:true};
}

export const LOST_YEAR_ROUTES=Object.freeze([
  {
    id:'rrvvfo',
    lead:'RRVVFO',
    title:'RESTLESS FLAME',
    availability:'AVAILABLE',
    available:true,
    unlock:'Available from the start',
    description:'Follow Rrvvfo through an eight-chapter Lost Year route. Four chapters are currently playable, with Chapters 5–8 reserved for the continuing story.',
    perspective:'Main combat route',
    color:'#e94b3c',
    missions:[
      {
        id:'rrvvfo-00',
        number:0,
        title:'FIELD CONTROL',
        available:true,
        playable:true,
        status:'PLAYABLE',
        description:'The Sage starts Rrvvfo with a short field trial: ignore the obvious path and use Object Swap to move between three anchors.',
        objectives:['Read the field instead of following the path','Object Swap through three anchors','Master Object Swap as a field technique'],
        stage:'Sage Training Field',
        note:'The Sage is a story-only mentor opponent. He is not added to the standard playable roster.'
      },
      {
        id:'rrvvfo-01',
        number:1,
        title:'BACK IN FIGHTING SHAPE',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-00',
        status:'PLAYABLE',
        description:'The Sage signs Rrvvfo up for a tournament and warns that he may meet old faces there. Before he can enter, Rrvvfo must use a combat manual and relearn movement, attacks, blocking, Lens of Truth, and his other techniques.',
        objectives:['Read the combat manual','Complete the movement and attack refresher','Block the Sage and use abilities 1–4','Finish the final spar'],
        stage:'Sage Training Field',
        note:'This is the second half of Chapter 1. The Combat Manual remains available and gains new pages as later systems are discovered.'
      },
      {
        id:'rrvvfo-road',
        number:1.5,
        title:'ROAD TO THE TOURNAMENT',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-01',
        status:'PLAYABLE 3D HUB',
        description:'Rrvvfo leaves the Training Grounds and follows a lively road toward the tournament, applying Object Swap, Lens of Truth, platforming, and the Fight-or-Run encounter system in the field.',
        objectives:['Explore the Training Grounds road','Cross the river with Object Swap','Clear the three-point Object Swap relay','Handle a roaming challenger','Reveal the final roadblock with Lens of Truth'],
        stage:'Training Grounds and Tournament Road',
        note:'The road stops spelling out every Object Swap solution. A future combat-technique slot remains unknown until Rrvvfo invents it later.'
      },
      {
        id:'rrvvfo-02',
        number:2,
        title:'DEFINITELY NOT THE WORLD TOURNAMENT',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-road',
        status:'PLAYABLE OPEN HUB + TOURNAMENT',
        description:'Rrvvfo explores a living tournament hub, rebuilds the lost bracket, races Wade through multiple districts, helps Bark repair a cracked ring, follows rumors about Plouke between rounds, and fights through the tournament.',
        objectives:['Rebuild the lost tournament bracket','Tour the hub with Wade and repair Bark’s cracked ring','Complete optional side quests for permanent Story rewards','Return to the living hub between tournament rounds','Verify four rumors about Plouke','Try to beat Plouke and reveal the Sage'],
        stage:'Local Tournament Grounds + Tournament Ring',
        note:'The bracket, Wade’s hub tour, Bark’s ring repair, and the Plouke rumor thread are mandatory. Food, fan, challenger, dummy, prize-cart, fake-champion, grunt, and Bark-spar quests remain optional.'
      },
      {
        id:'rrvvfo-03',
        number:3,
        title:'SOMETHING UNDER THE RING',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-02',
        status:'PLAYABLE FULL CHAPTER',
        description:'After the Plouke reveal, Rrvvfo investigates the closing tournament, follows the warning of a disappearing Strange Man, uncovers stolen fighter data, follows the Sage beneath the ring, and discovers Project Hollow.',
        objectives:['Investigate the after-hours tournament','Complete three mandatory side stories','Investigate the Strange Man’s warning','Follow the Lens trail beneath the arena','Defeat the Runaway Training Dummy and Unfinished Echo','Use Object Swap to reach the strange teleporter','Arrive near Shadow’s Lookout'],
        stage:'After-Hours Tournament + Abandoned Resonance Facility + Remote Highlands',
        note:'The operator remains anonymous. Project Hollow is discovered but not explained.'
      },
      {
        id:'rrvvfo-04',
        number:4,
        title:'ECHO REGION',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-03',
        status:'PLAYABLE FULL CHAPTER + SECRET BOSS',
        description:'Rrvvfo wakes in Echo Region, reunites with Bark and Wade, restores Echo Village, uncovers a wider Project Hollow network, and reaches Shadow’s floating lookout through Object Swap.',
        objectives:['Reach Echo Village','Restore the Echo Beacon','Recover the mountain-lift parts','Defend Echo Village','Optionally complete The Old Man’s Potions and seal Ryuzankaro','Defeat the Hollow Watcher','Enter Shadow’s Lookout'],
        stage:'Echo Region + Echo Village + Echo Caverns + Mountain Path + Shadow’s Lookout',
        note:'The Ryuzankaro quest unlocks only after the mandatory village defense. Vibration Sense is optional and never required for chapter completion.'
      }
    ]

  }
]);

export function defaultLostYearProgress(){
  return{version:1,selectedRoute:'rrvvfo',routeStarted:false,lastCheckpoint:'rrvvfo-00',completedMissions:[],viewedBriefings:[],unlocks:[],keyItems:[],storyLevel:1,storyXp:0,storyBonusStats:{hp:0,power:0,defense:0,speed:0,focus:0},storyCharmState:{discoveries:[],activities:[],celebrations:[]},worldState:normalizeConnectedWorldState({},{}),chapter1TutorialCheckpoint:'movement',chapter2State:{},chapter3Preview:{},chapter3State:{},chapter4State:{},updatedAt:Date.now()};
}

let lastSaveFailure=null;
function availableStoryStorage(){try{return globalThis.localStorage}catch{return null}}
export function lastLostYearSaveError(){return lastSaveFailure}

export function loadLostYearProgress(storage=availableStoryStorage()){
  const fallback=defaultLostYearProgress();
  try{
    const parsed=JSON.parse(storage.getItem(LOST_YEAR_SAVE_KEY)||'null');
    if(!parsed||parsed.version!==1)return fallback;
    return{
      ...fallback,
      ...parsed,
      completedMissions:Array.isArray(parsed.completedMissions)?parsed.completedMissions:[],
      viewedBriefings:Array.isArray(parsed.viewedBriefings)?parsed.viewedBriefings:[],
      unlocks:Array.isArray(parsed.unlocks)?parsed.unlocks:[],
      keyItems:Array.isArray(parsed.keyItems)?[...new Set(parsed.keyItems.filter(item=>typeof item==='string'))]:[],
      storyBonusStats:{...fallback.storyBonusStats,...(parsed.storyBonusStats||{})},
      storyCharmState:{...fallback.storyCharmState,...(parsed.storyCharmState||{}),discoveries:[...new Set(parsed.storyCharmState?.discoveries||[])],activities:[...new Set(parsed.storyCharmState?.activities||[])],celebrations:[...new Set(parsed.storyCharmState?.celebrations||[])]},
      worldState:normalizeConnectedWorldState(parsed.worldState||{},parsed),
      routeStarted:Boolean(parsed.routeStarted||parsed.completedMissions?.length),
      lastCheckpoint:typeof parsed.lastCheckpoint==='string'?parsed.lastCheckpoint:'rrvvfo-00'
    };
  }catch{return fallback}
}

export function saveLostYearProgress(progress,storage=availableStoryStorage()){
  const previous=loadLostYearProgress(storage);
  let next={...progress,version:1,updatedAt:Date.now()};
  if(chapter4CompletionConflict(next)){
    next={...next,completedMissions:(next.completedMissions||[]).filter(id=>id!=='rrvvfo-04'),unlocks:(next.unlocks||[]).filter(id=>id!=='shadowLookout'),chapter4State:{...(next.chapter4State||{}),chapterComplete:false},lastCheckpoint:String(next.lastCheckpoint||'').startsWith('rrvvfo-04-complete')?'rrvvfo-04':next.lastCheckpoint};
  }
  const serialized=JSON.stringify(next);
  try{
    storage?.setItem?.(LOST_YEAR_SAVE_KEY,serialized);
    const verified=storage?.getItem?.(LOST_YEAR_SAVE_KEY);
    if(verified!==serialized)throw new Error('Story save verification failed');
    lastSaveFailure=null;
  }catch(error){
    lastSaveFailure=error instanceof Error?error:new Error(String(error||'Story save failed'));
    if(typeof document!=='undefined')queueMicrotask(()=>document.dispatchEvent(new CustomEvent('pxstorysavefailure',{detail:{error:lastSaveFailure.message,attempted:next,restored:previous}})));
    return previous;
  }
  if(typeof document!=='undefined'){
    const newlyCompleted=RRVVFO_CHAPTERS.find(chapter=>!rrvvfoChapterComplete(chapter,previous)&&rrvvfoChapterComplete(chapter,next));
    if(newlyCompleted)queueMicrotask(()=>document.dispatchEvent(new CustomEvent('pxstorychaptercomplete',{detail:{chapter:newlyCompleted,progress:next}})));
    if(previous.lastCheckpoint!==next.lastCheckpoint)queueMicrotask(()=>document.dispatchEvent(new CustomEvent('pxstorycheckpoint',{detail:{checkpoint:next.lastCheckpoint,progress:next}})));
    const newUnlocks=(next.unlocks||[]).filter(id=>!(previous.unlocks||[]).includes(id));
    const newMissions=(next.completedMissions||[]).filter(id=>!(previous.completedMissions||[]).includes(id));
    const newKeyItems=(next.keyItems||[]).filter(id=>!(previous.keyItems||[]).includes(id));
    const statChanges=Object.keys(next.storyBonusStats||{}).map(label=>({label:label.toUpperCase(),amount:(Number(next.storyBonusStats?.[label])||0)-(Number(previous.storyBonusStats?.[label])||0)})).filter(change=>change.amount>0);
    const oldLevel=Number(previous.storyLevel)||1,newLevel=Number(next.storyLevel)||1;
    if(newUnlocks.length||newMissions.length||newKeyItems.length||statChanges.length||newLevel>oldLevel)queueMicrotask(()=>document.dispatchEvent(new CustomEvent('pxstoryprogression',{detail:{newUnlocks,newMissions,newKeyItems,statChanges,oldLevel,newLevel,updatedAt:next.updatedAt,progress:next}})));
    const reliability=inspectStoryReliability(next);
    if(reliability.issues.length)queueMicrotask(()=>document.dispatchEvent(new CustomEvent('pxstoryreliabilitywarning',{detail:{...reliability,progress:next}})));
  }
  return next;
}

export function missionUnlocked(mission,progress){
  if(!mission?.available)return false;
  return !mission.unlockAfter||progress.completedMissions.includes(mission.unlockAfter);
}

export function routeProgress(route,progress){
  if(route?.id!=='rrvvfo')return 0;
  const completed=RRVVFO_CHAPTERS.reduce((count,chapter)=>count+(rrvvfoChapterComplete(chapter,progress)?1:0),0);
  return Math.round(completed/RRVVFO_PLANNED_CHAPTER_COUNT*100);
}

export function routeVisible(route){
  return Boolean(route?.id==='rrvvfo');
}

export function routePlayable(route){
  return Boolean(route?.id==='rrvvfo'&&route.available);
}


export const RRVVFO_CHAPTERS=Object.freeze([
  {
    id:'rrvvfo-chapter-1',number:1,title:'NO MAXIMUMS',
    description:'Object Swap field control, the Sage’s Combat Manual, the fighting refresher, and the road to the tournament.',
    missions:['rrvvfo-00','rrvvfo-01','rrvvfo-road']
  },
  {
    id:'rrvvfo-chapter-2',number:2,title:'DEFINITELY NOT THE WORLD TOURNAMENT',
    description:'Explore a living tournament town, complete character-driven hub quests, grow through Training Levels, and return between bracket rounds before facing Plouke.',
    missions:['rrvvfo-02']
  },
  {
    id:'rrvvfo-chapter-3',number:3,title:'SOMETHING UNDER THE RING',
    description:'Investigate the after-hours tournament, follow stolen fighter energy underground, defeat the Unfinished Echo, and reach the Remote Highlands.',
    missions:['rrvvfo-03']
  },
  {
    id:'rrvvfo-chapter-4',number:4,title:'ECHO REGION',
    description:'Restore Echo Village with Bark and Wade, optionally confront Ryuzankaro, defeat the adaptive Hollow Watcher, and reach Shadow’s Lookout.',
    missions:['rrvvfo-04']
  }
]);

export function rrvvfoRouteStarted(progress){
  return Boolean(progress?.routeStarted||progress?.completedMissions?.length);
}

export function rrvvfoNextMission(progress){
  if(chapter4CompletionConflict(progress))return'rrvvfo-04';
  const completed=new Set(progress?.completedMissions||[]);
  if(!completed.has('rrvvfo-00'))return'rrvvfo-00';
  if(!completed.has('rrvvfo-01'))return'rrvvfo-01';
  if(!completed.has('rrvvfo-road'))return'rrvvfo-road';
  if(!completed.has('rrvvfo-02'))return'rrvvfo-02';
  if(!completed.has('rrvvfo-03'))return'rrvvfo-03';
  if(!completed.has('rrvvfo-04'))return'rrvvfo-04';
  return null;
}

export function rrvvfoChapterComplete(chapter,progress){
  if(chapter?.number===4&&chapter4CompletionConflict(progress))return false;
  const completed=new Set(progress?.completedMissions||[]);
  return Boolean(chapter?.missions?.length&&chapter.missions.every(id=>completed.has(id)));
}

const STORY_CHAPTERS_BY_ROUTE=Object.freeze({rrvvfo:RRVVFO_CHAPTERS});


export const MODE_UNLOCK_RULES=Object.freeze({
  training:Object.freeze({chapter:0,label:'AVAILABLE FROM THE START'}),
  cpu:Object.freeze({chapter:1,label:'COMPLETE CHAPTER 1'}),
  local:Object.freeze({chapter:2,label:'COMPLETE CHAPTER 2'}),
  arena:Object.freeze({chapter:3,label:'COMPLETE CHAPTER 3'})
});

export function completedRrvvfoChapterCount(progress=loadLostYearProgress()){
  return RRVVFO_CHAPTERS.reduce((count,chapter)=>count+(rrvvfoChapterComplete(chapter,progress)?1:0),0);
}

export function modeUnlockedForProgress(modeId,progress=loadLostYearProgress()){
  const rule=MODE_UNLOCK_RULES[modeId];
  if(!rule)return true;
  return completedRrvvfoChapterCount(progress)>=rule.chapter;
}

export function modeUnlockRequirement(modeId){
  return MODE_UNLOCK_RULES[modeId]?.label||'AVAILABLE';
}

export function storyModeComplete(progress=loadLostYearProgress()){
  const routes=LOST_YEAR_ROUTES.filter(route=>route.available);
  return routes.length>0&&routes.every(route=>{
    const chapters=STORY_CHAPTERS_BY_ROUTE[route.id]||[];
    return chapters.length>=STORY_CHAPTERS_PER_CHARACTER
      &&chapters.slice(0,STORY_CHAPTERS_PER_CHARACTER).every(chapter=>rrvvfoChapterComplete(chapter,progress));
  });
}
