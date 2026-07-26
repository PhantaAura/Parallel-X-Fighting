export const LOST_YEAR_SAVE_KEY='pxLostYearProgressV1';

export const LOST_YEAR_ROUTES=Object.freeze([
  {
    id:'rrvvfo',
    lead:'RRVVFO',
    title:'RESTLESS FLAME',
    availability:'AVAILABLE',
    available:true,
    unlock:'Available from the start',
    description:'Rrvvfo recovers, trains, and grows restless during the year Revvfo remains petrified. Alt and Rover begin targeting him from a completely separate side of the conflict.',
    perspective:'Main combat route',
    color:'#e94b3c',
    missions:[
      {
        id:'rrvvfo-00',
        number:0,
        title:'NO MAXIMUMS',
        available:true,
        status:'PLAYABLE',
        description:'The Sage trains Rrvvfo in an open field. Direct attacks cannot touch the Sage; Rrvvfo must develop four coordinated energy copies and catch him outside his prediction dodge.',
        objectives:['Try to hit the Sage with normal attacks','Build Shots of Agony from one clone to four','Land the complete four-clone volley'],
        stage:'Sage Training Field',
        note:'The Sage is a story-only mentor opponent. He is not added to the standard playable roster.'
      },
      {id:'rrvvfo-01',number:1,title:'NO PEACE',available:false,status:'NEXT MISSION',description:'The first post-training disturbance in Rrvvfo’s Lost Year route.'}
    ]
  },
  {
    id:'alt-rover',
    lead:'ALT & ROVER',
    title:'FOR THE FIRSTBORN',
    availability:'LOCKED',
    available:false,
    unlock:'Complete Rrvvfo Mission 1',
    description:'Alt wants revenge for Revvfo’s defeat. Rover plans the operations and protects what remains of their family. Rev and Metal are not on their side after Season 1.',
    perspective:'Villain route',
    color:'#ff9b3d',
    missions:[]
  },
  {
    id:'bark',
    lead:'BARK',
    title:'KEEPER OF PEACE',
    availability:'LOCKED',
    available:false,
    unlock:'Progress the shared Lost Year timeline',
    description:'Bark handles reconstruction problems and investigates the damage caused by several unrelated groups operating during the same year.',
    perspective:'Defense and investigation',
    color:'#b38a52',
    missions:[]
  },
  {
    id:'wade',
    lead:'WADE',
    title:'WIDE HORIZON',
    availability:'LOCKED',
    available:false,
    unlock:'Progress the shared Lost Year timeline',
    description:'Wade’s speed gives him a wider view of the world than the others. His route shows distant incidents and overlapping events the other stories never witness.',
    perspective:'Speed and traversal',
    color:'#4f9ef8',
    missions:[]
  },
  {
    id:'robert',
    lead:'ROBERT',
    title:'WHITE SURVIVOR',
    availability:'LOCKED',
    available:false,
    unlock:'Discover Robert during another route',
    description:'Robert investigates every side without trusting any of them, following clues connected to the destroyed mountain village and the Ninja weapons.',
    perspective:'Mystery route',
    color:'#d9ecff',
    missions:[]
  },
  {
    id:'oddballs',
    lead:'THE ODDBALLS',
    title:'THREE TINY PROBLEMS',
    availability:'LOCKED',
    available:false,
    unlock:'Encounter their havoc in another route',
    description:'Raggie, Jimmy, and Jonathan cause havoc and mayhem because it is fun. Their accidents collide with the serious conflict and ruin everyone else’s plans.',
    perspective:'Chaos route',
    color:'#ffe36b',
    missions:[]
  },
  {
    id:'rev-metal',
    lead:'REV & METAL',
    title:'THE HIDDEN SIDE',
    availability:'HIDDEN ROUTE',
    available:false,
    unlock:'Complete the main character routes',
    description:'A separate perspective following Rev and Metal after they were stranded with the Hidden Man. This route is not connected to Alt and Rover’s revenge campaign.',
    perspective:'Behind-the-scenes route',
    color:'#b763ff',
    missions:[]
  },
  {
    id:'final',
    lead:'FINAL STORY',
    title:'THE LOST YEAR',
    availability:'LOCKED',
    available:false,
    unlock:'Complete every required route',
    description:'The overlapping stories finally meet, revealing which events were connected, which were misunderstandings, and what truly happened during the missing year.',
    perspective:'Shared finale',
    color:'#ff65bd',
    missions:[]
  }
]);

export function defaultLostYearProgress(){
  return{
    version:1,
    selectedRoute:'rrvvfo',
    completedMissions:[],
    viewedBriefings:[],
    updatedAt:Date.now()
  };
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
      viewedBriefings:Array.isArray(parsed.viewedBriefings)?parsed.viewedBriefings:[]
    };
  }catch{return fallback}
}

export function saveLostYearProgress(progress,storage=localStorage){
  const next={...progress,version:1,updatedAt:Date.now()};
  try{storage.setItem(LOST_YEAR_SAVE_KEY,JSON.stringify(next))}catch{}
  return next;
}

export function routeProgress(route,progress){
  const total=Math.max(1,route.missions.length);
  const completed=route.missions.filter(mission=>progress.completedMissions.includes(mission.id)).length;
  return route.missions.length?Math.round(completed/total*100):0;
}
