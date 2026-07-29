export const LOST_YEAR_SAVE_KEY='pxLostYearProgressV1';
export const STORY_CHAPTERS_PER_CHARACTER=6;

export const LOST_YEAR_ROUTES=Object.freeze([
  {
    id:'rrvvfo',
    lead:'RRVVFO',
    title:'RESTLESS FLAME',
    availability:'AVAILABLE',
    available:true,
    unlock:'Available from the start',
    description:'Follow one continuous Rrvvfo chapter route through the Lost Year: Sage training, the Combat Manual, a playable living road, and the local tournament that follows.',
    perspective:'Main combat route',
    color:'#e94b3c',
    missions:[
      {
        id:'rrvvfo-00',
        number:0,
        title:'NO MAXIMUMS',
        available:true,
        playable:true,
        status:'PLAYABLE',
        description:'The Sage trains Rrvvfo in an open field. Direct attacks cannot touch the Sage; Rrvvfo must develop four coordinated energy copies and catch him outside his prediction dodge.',
        objectives:['Try to hit the Sage with normal attacks','Build Shots of Agony from one clone to four','Land the complete four-clone volley'],
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
        description:'Rrvvfo leaves the Training Grounds and follows a lively road toward the tournament, learning field uses for Object Swap, Shots of Agony, Lens of Truth, and the Fight-or-Run encounter system.',
        objectives:['Explore the Training Grounds road','Cross the river with Object Swap','Open the four-target gate with Shots of Agony','Handle a roaming challenger','Reveal the final roadblock with Lens of Truth'],
        stage:'Training Grounds and Tournament Road',
        note:'The Sage still personally teaches Shots of Agony earlier. The manual only teaches new field uses after he leaves.'
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
        description:'After the Plouke reveal, Rrvvfo investigates the closing tournament, uncovers stolen fighter data, follows the Sage beneath the ring, and discovers Project Hollow.',
        objectives:['Investigate the after-hours tournament','Complete three mandatory side stories','Follow the Lens trail beneath the arena','Defeat the Runaway Training Dummy and Unfinished Echo','Use Object Swap to reach the strange teleporter','Arrive near Shadow’s Lookout'],
        stage:'After-Hours Tournament + Abandoned Resonance Facility + Remote Highlands',
        note:'The operator remains anonymous. Project Hollow is discovered but not explained.'
      }
    ]

  }
]);

export function defaultLostYearProgress(){
  return{version:1,selectedRoute:'rrvvfo',routeStarted:false,lastCheckpoint:'rrvvfo-00',completedMissions:[],viewedBriefings:[],unlocks:[],storyLevel:1,storyXp:0,storyBonusStats:{hp:0,power:0,defense:0,speed:0,focus:0},chapter1TutorialCheckpoint:'movement',chapter2State:{},chapter3Preview:{},chapter3State:{},updatedAt:Date.now()};
}

export function loadLostYearProgress(storage=localStorage){
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
      storyBonusStats:{...fallback.storyBonusStats,...(parsed.storyBonusStats||{})},
      routeStarted:Boolean(parsed.routeStarted||parsed.completedMissions?.length),
      lastCheckpoint:typeof parsed.lastCheckpoint==='string'?parsed.lastCheckpoint:'rrvvfo-00'
    };
  }catch{return fallback}
}

export function saveLostYearProgress(progress,storage=localStorage){
  const next={...progress,version:1,updatedAt:Date.now()};
  try{storage.setItem(LOST_YEAR_SAVE_KEY,JSON.stringify(next))}catch{}
  return next;
}

export function missionUnlocked(mission,progress){
  if(!mission?.available)return false;
  return !mission.unlockAfter||progress.completedMissions.includes(mission.unlockAfter);
}

export function routeProgress(route,progress){
  if(route?.id!=='rrvvfo')return 0;
  const completed=new Set(progress?.completedMissions||[]);
  const completedChapters=[
    ['rrvvfo-00','rrvvfo-01','rrvvfo-road'],
    ['rrvvfo-02'],
    ['rrvvfo-03']
  ].filter(missions=>missions.every(id=>completed.has(id))).length;
  return Math.round(completedChapters/STORY_CHAPTERS_PER_CHARACTER*100);
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
    description:'Shots of Agony training, the Sage’s Combat Manual, the fighting refresher, and the road to the tournament.',
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
  }
]);

export function rrvvfoRouteStarted(progress){
  return Boolean(progress?.routeStarted||progress?.completedMissions?.length);
}

export function rrvvfoNextMission(progress){
  const completed=new Set(progress?.completedMissions||[]);
  if(!completed.has('rrvvfo-00'))return'rrvvfo-00';
  if(!completed.has('rrvvfo-01'))return'rrvvfo-01';
  if(!completed.has('rrvvfo-road'))return'rrvvfo-road';
  if(!completed.has('rrvvfo-02'))return'rrvvfo-02';
  if(!completed.has('rrvvfo-03'))return'rrvvfo-03';
  return null;
}

export function rrvvfoChapterComplete(chapter,progress){
  const completed=new Set(progress?.completedMissions||[]);
  return Boolean(chapter?.missions?.length&&chapter.missions.every(id=>completed.has(id)));
}

const STORY_CHAPTERS_BY_ROUTE=Object.freeze({rrvvfo:RRVVFO_CHAPTERS});

export function storyModeComplete(progress=loadLostYearProgress()){
  const routes=LOST_YEAR_ROUTES.filter(route=>route.available);
  return routes.length>0&&routes.every(route=>{
    const chapters=STORY_CHAPTERS_BY_ROUTE[route.id]||[];
    return chapters.length>=STORY_CHAPTERS_PER_CHARACTER
      &&chapters.slice(0,STORY_CHAPTERS_PER_CHARACTER).every(chapter=>rrvvfoChapterComplete(chapter,progress));
  });
}
