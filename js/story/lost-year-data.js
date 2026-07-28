export const LOST_YEAR_SAVE_KEY='pxLostYearProgressV1';

export const LOST_YEAR_ROUTES=Object.freeze([
  {
    id:'rrvvfo',
    lead:'RRVVFO',
    title:'RESTLESS FLAME',
    availability:'AVAILABLE',
    available:true,
    unlock:'Available from the start',
    description:'Follow one continuous Rrvvfo chapter route through the Lost Year: Sage training, the Combat Manual, and the local tournament that follows.',
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
        id:'rrvvfo-02',
        number:2,
        title:'DEFINITELY NOT THE WORLD TOURNAMENT',
        available:true,
        playable:true,
        unlockAfter:'rrvvfo-01',
        status:'PLAYABLE STORY SCENE',
        description:'Rrvvfo enters the tournament grounds, insults the arena design, completes registration, checks the bracket, and heads toward his first match.',
        objectives:['Enter the tournament grounds','Complete registration','Inspect the bracket board','Reach the fighter entrance'],
        stage:'Global Tournament — Entrance Hub',
        note:'This is Chapter 2. The tournament matches and living 3D hub expansion continue in later updates.'
      }
    ]
  },
  {
    id:'alt-rover',lead:'ALT & ROVER',title:'FOR THE FIRSTBORN',availability:'LOCKED',available:false,unlock:'Complete Rrvvfo Mission 1',description:'Alt wants revenge for Revvfo’s defeat. Rover plans the operations and protects what remains of their family. Rev and Metal are not on their side after Season 1.',perspective:'Villain route',color:'#ff9b3d',missions:[]
  },
  {
    id:'bark',lead:'BARK',title:'KEEPER OF PEACE',availability:'LOCKED',available:false,unlock:'Progress the shared Lost Year timeline',description:'Bark handles reconstruction problems and investigates the damage caused by several unrelated groups operating during the same year.',perspective:'Defense and investigation',color:'#b38a52',missions:[]
  },
  {
    id:'wade',lead:'WADE',title:'WIDE HORIZON',availability:'LOCKED',available:false,unlock:'Progress the shared Lost Year timeline',description:'Wade’s speed gives him a wider view of the world than the others. His route shows distant incidents and overlapping events the other stories never witness.',perspective:'Speed and traversal',color:'#4f9ef8',missions:[]
  },
  {
    id:'robert',lead:'ROBERT',title:'WHITE SURVIVOR',availability:'LOCKED',available:false,unlock:'Discover Robert during another route',description:'Robert investigates every side without trusting any of them, following clues connected to the destroyed mountain village and the Ninja weapons.',perspective:'Mystery route',color:'#d9ecff',missions:[]
  },
  {
    id:'oddballs',lead:'THE ODDBALLS',title:'THREE TINY PROBLEMS',availability:'LOCKED',available:false,unlock:'Encounter their havoc in another route',description:'Raggie, Jimmy, and Jonathan cause havoc and mayhem because it is fun. Their accidents collide with the serious conflict and ruin everyone else’s plans.',perspective:'Chaos route',color:'#ffe36b',missions:[]
  },
  {
    id:'rev-metal',lead:'REV & METAL',title:'THE HIDDEN SIDE',availability:'HIDDEN ROUTE',available:false,unlock:'Complete the main character routes',description:'A separate perspective following Rev and Metal after they were stranded with the Hidden Man. This route is not connected to Alt and Rover’s revenge campaign.',perspective:'Behind-the-scenes route',color:'#b763ff',missions:[]
  },
  {
    id:'final',lead:'FINAL STORY',title:'THE LOST YEAR',availability:'LOCKED',available:false,unlock:'Complete every required route',description:'The overlapping stories finally meet, revealing which events were connected, which were misunderstandings, and what truly happened during the missing year.',perspective:'Shared finale',color:'#ff65bd',missions:[]
  }
]);

export function defaultLostYearProgress(){
  return{version:1,selectedRoute:'rrvvfo',routeStarted:false,lastCheckpoint:'rrvvfo-00',completedMissions:[],viewedBriefings:[],unlocks:[],updatedAt:Date.now()};
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
  const total=Math.max(1,route.missions.length);
  const completed=route.missions.filter(mission=>progress.completedMissions.includes(mission.id)).length;
  return route.missions.length?Math.round(completed/total*100):0;
}


export const RRVVFO_CHAPTERS=Object.freeze([
  {
    id:'rrvvfo-chapter-1',number:1,title:'NO MAXIMUMS',
    description:'Shots of Agony training, the Sage’s Combat Manual, and the full fighting refresher.',
    missions:['rrvvfo-00','rrvvfo-01']
  },
  {
    id:'rrvvfo-chapter-2',number:2,title:'DEFINITELY NOT THE WORLD TOURNAMENT',
    description:'Arrival, registration, bracket inspection, and the fighter entrance.',
    missions:['rrvvfo-02']
  }
]);

export function rrvvfoRouteStarted(progress){
  return Boolean(progress?.routeStarted||progress?.completedMissions?.length);
}

export function rrvvfoNextMission(progress){
  const completed=new Set(progress?.completedMissions||[]);
  if(!completed.has('rrvvfo-00'))return'rrvvfo-00';
  if(!completed.has('rrvvfo-01'))return'rrvvfo-01';
  if(!completed.has('rrvvfo-02'))return'rrvvfo-02';
  return null;
}

export function rrvvfoChapterComplete(chapter,progress){
  const completed=new Set(progress?.completedMissions||[]);
  return Boolean(chapter?.missions?.length&&chapter.missions.every(id=>completed.has(id)));
}
