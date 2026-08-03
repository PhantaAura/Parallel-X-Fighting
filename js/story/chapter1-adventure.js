export const CHAPTER1_ADVENTURE_VERSION='2.9A.40.7.2R';

export const CHAPTER1_GUIDANCE=Object.freeze({
  softHintMs:18000,
  exactHintMs:36000
});

export const CHAPTER1_ROUTES=Object.freeze({
  main:Object.freeze({
    id:'main',label:'MAIN ROAD',identity:'CONTROL',lane:'center',
    markers:Object.freeze([
      Object.freeze({x:338,z:-118,label:'WORK LANE I'}),
      Object.freeze({x:372,z:122,label:'WORK LANE II'}),
      Object.freeze({x:408,z:-96,label:'WORK LANE III'}),
      Object.freeze({x:438,z:72,label:'ROAD CREST'})
    ])
  }),
  forest:Object.freeze({
    id:'forest',label:'FOREST TRAIL',identity:'EXPLORE',lane:'north',
    markers:Object.freeze([
      Object.freeze({x:292,z:-315,label:'PINE BELL I'}),
      Object.freeze({x:338,z:-478,label:'PINE BELL II'}),
      Object.freeze({x:386,z:-402,label:'PINE BELL III'}),
      Object.freeze({x:432,z:-305,label:'FOREST EXIT'})
    ])
  }),
  cliff:Object.freeze({
    id:'cliff',label:'CLIFF PASS',identity:'PLATFORM',lane:'south',
    markers:Object.freeze([
      Object.freeze({x:292,z:318,label:'CLIFF STEP I'}),
      Object.freeze({x:330,z:424,label:'CLIFF STEP II'}),
      Object.freeze({x:366,z:342,label:'CLIFF STEP III'}),
      Object.freeze({x:401,z:458,label:'CLIFF STEP IV'}),
      Object.freeze({x:436,z:334,label:'CLIFF STEP V'})
    ])
  })
});

export const CHAPTER1_FIRE_BLAST_STORY_FOCUS=Object.freeze({
  energy:22,
  cooldown:1.05,
  damage:15,
  projectileSpeed:500,
  radius:25,
  guardDamage:9,
  clashPower:1.3
});

export const CHAPTER1_ROUTE_COMMIT=Object.freeze({x:270,northZ:-145,southZ:145,landingX:195});

export function chapter1RouteFromPosition({x=0,z=0}={}){
  if(Number(x)<CHAPTER1_ROUTE_COMMIT.x)return'';
  if(Number(z)<=CHAPTER1_ROUTE_COMMIT.northZ)return'forest';
  if(Number(z)>=CHAPTER1_ROUTE_COMMIT.southZ)return'cliff';
  return'main';
}

export function chapter1RouteMarkers(route='main'){
  return (CHAPTER1_ROUTES[route]?.markers||[]).map(marker=>({...marker,done:false}));
}
