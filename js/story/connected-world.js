export const CONNECTED_WORLD_VERSION=2;

const freezeDeep=value=>{
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freezeDeep);Object.freeze(value);
  }
  return value;
};

export const WORLD_REGIONS=freezeDeep({
  training:{
    id:'training',name:'TRAINING COUNTRY',short:'TRAINING',chapterRange:'CHAPTER 1',tone:'road',world:{x:120,y:330},
    description:'Tangai’s training grounds and the roads leading toward the tournament.',
    zones:{
      dojo:{id:'dojo',name:'TANGAI DOJO',map:{x:110,y:330},kind:'landmark'},
      yard:{id:'yard',name:'TRAINING YARD',map:{x:190,y:315},kind:'hub'},
      junction:{id:'junction',name:'ROAD JUNCTION',map:{x:300,y:300},kind:'junction'},
      mainRoad:{id:'mainRoad',name:'MAIN ROAD',map:{x:410,y:330},kind:'route'},
      forest:{id:'forest',name:'FOREST PATH',map:{x:415,y:235},kind:'route'},
      cliff:{id:'cliff',name:'CLIFF TRAIL',map:{x:420,y:145},kind:'route',layer:'upper'},
      riverside:{id:'riverside',name:'RIVERSIDE',map:{x:535,y:260},kind:'route'},
      outskirts:{id:'outskirts',name:'TOURNAMENT OUTSKIRTS',map:{x:675,y:280},kind:'landmark'}
    },
    links:[
      ['dojo','yard'],['yard','junction'],['junction','mainRoad'],['junction','forest'],['junction','cliff'],
      ['mainRoad','riverside'],['forest','riverside'],['cliff','riverside'],['riverside','outskirts']
    ]
  },
  tournament:{
    id:'tournament',name:'TOURNAMENT REGION',short:'TOURNAMENT',chapterRange:'CHAPTERS 2–3',tone:'festival',world:{x:340,y:250},
    description:'The tournament town, public festival, fighter districts, rooftops, and after-hours service routes.',
    zones:{
      westGate:{id:'westGate',name:'WEST GATE',map:{x:115,y:315},kind:'landmark'},
      practice:{id:'practice',name:'PRACTICE GROUNDS',map:{x:205,y:165},kind:'hub'},
      market:{id:'market',name:'MARKET STREET',map:{x:350,y:145},kind:'hub'},
      central:{id:'central',name:'CENTRAL PLAZA',map:{x:420,y:300},kind:'hub'},
      registration:{id:'registration',name:'REGISTRATION',map:{x:360,y:430},kind:'building'},
      spectator:{id:'spectator',name:'SPECTATOR DISTRICT',map:{x:565,y:420},kind:'hub'},
      stadium:{id:'stadium',name:'MAIN ARENA',map:{x:700,y:290},kind:'landmark'},
      rooftops:{id:'rooftops',name:'ROOFTOP ROUTES',map:{x:405,y:78},kind:'secret',layer:'upper'},
      service:{id:'service',name:'SERVICE DISTRICT',map:{x:565,y:525},kind:'route'},
      backstage:{id:'backstage',name:'BACKSTAGE',map:{x:680,y:470},kind:'building'},
      medical:{id:'medical',name:'MEDICAL CENTER',map:{x:520,y:345},kind:'building'},
      security:{id:'security',name:'SECURITY STATION',map:{x:620,y:355},kind:'building'}
    },
    links:[
      ['westGate','practice'],['westGate','central'],['practice','market'],['market','central'],['market','rooftops'],
      ['central','registration'],['central','spectator'],['central','medical'],['central','stadium'],['spectator','service'],
      ['service','backstage'],['backstage','stadium'],['medical','security'],['security','stadium'],['rooftops','stadium']
    ]
  },
  resonance:{
    id:'resonance',name:'RESONANCE UNDERGROUND',short:'RESONANCE',chapterRange:'CHAPTER 3',tone:'facility',world:{x:555,y:340},
    description:'Maintenance infrastructure beneath the tournament and the abandoned Resonance Facility.',
    zones:{
      maintenance:{id:'maintenance',name:'MAINTENANCE ELEVATOR',map:{x:120,y:290},kind:'landmark'},
      power:{id:'power',name:'AUXILIARY POWER',map:{x:250,y:290},kind:'room'},
      corridor:{id:'corridor',name:'RECORDED-ATTACK CORRIDOR',map:{x:385,y:290},kind:'route'},
      security:{id:'security',name:'SECURITY WALL',map:{x:510,y:290},kind:'room'},
      records:{id:'records',name:'RECORDS LAB',map:{x:610,y:180},kind:'room'},
      core:{id:'core',name:'CENTRAL DEFENSE',map:{x:660,y:305},kind:'room'},
      terminal:{id:'terminal',name:'PROJECT HOLLOW TERMINAL',map:{x:690,y:415},kind:'room'},
      teleporter:{id:'teleporter',name:'STRANGE TELEPORTER',map:{x:820,y:295},kind:'landmark'}
    },
    links:[['maintenance','power'],['power','corridor'],['corridor','security'],['security','records'],['security','core'],['core','terminal'],['core','teleporter']]
  },
  echo:{
    id:'echo',name:'ECHO REGION',short:'ECHO',chapterRange:'CHAPTER 4+',tone:'echo',world:{x:785,y:205},
    description:'A mountain country of villages, resonance structures, caverns, old routes, and Shadow’s floating sanctuary.',
    zones:{
      lowerTrail:{id:'lowerTrail',name:'LOWER ECHO TRAIL',map:{x:105,y:430},kind:'route',layer:'lower'},
      villageGate:{id:'villageGate',name:'VILLAGE GATE',map:{x:195,y:365},kind:'landmark'},
      central:{id:'central',name:'CENTRAL VILLAGE',map:{x:340,y:315},kind:'hub'},
      residential:{id:'residential',name:'RESIDENTIAL PATH',map:{x:265,y:205},kind:'hub'},
      wall:{id:'wall',name:'RESONANCE WALL',map:{x:135,y:220},kind:'landmark'},
      water:{id:'water',name:'WATER CHANNEL',map:{x:420,y:430},kind:'landmark'},
      shrine:{id:'shrine',name:'OLD SHRINE',map:{x:310,y:100},kind:'secret'},
      upperRidge:{id:'upperRidge',name:'UPPER RIDGE',map:{x:500,y:155},kind:'route',layer:'upper'},
      apothecary:{id:'apothecary',name:'OLD APOTHECARY',map:{x:455,y:235},kind:'building'},
      cavernApproach:{id:'cavernApproach',name:'CAVERN APPROACH',map:{x:555,y:350},kind:'junction'},
      caverns:{id:'caverns',name:'ECHO CAVERNS',map:{x:650,y:395},kind:'dungeon',layer:'lower'},
      foothills:{id:'foothills',name:'MOUNTAIN FOOTHILLS',map:{x:635,y:215},kind:'route'},
      mountain:{id:'mountain',name:'MOUNTAIN PATH',map:{x:735,y:165},kind:'route',layer:'upper'},
      summit:{id:'summit',name:'MOUNTAIN SUMMIT',map:{x:805,y:90},kind:'landmark',layer:'upper'},
      lookout:{id:'lookout',name:'SHADOW’S LOOKOUT',map:{x:805,y:30},kind:'landmark',layer:'sky'}
    },
    links:[
      ['lowerTrail','villageGate'],['villageGate','central'],['central','residential'],['central','wall'],['central','water'],
      ['residential','shrine'],['residential','apothecary'],['water','cavernApproach'],['apothecary','upperRidge'],
      ['upperRidge','cavernApproach'],['cavernApproach','caverns'],['cavernApproach','foothills'],['foothills','mountain'],['mountain','summit'],['summit','lookout']
    ]
  }
});

export const WORLD_REGION_LINKS=freezeDeep([
  {from:'training',to:'tournament',label:'TOURNAMENT ROAD',type:'road'},
  {from:'tournament',to:'resonance',label:'MAINTENANCE DESCENT',type:'underground'},
  {from:'resonance',to:'echo',label:'DAMAGED TELEPORTER',type:'teleporter',oneWay:true}
]);

export const WORLD_SHORTCUTS=freezeDeep({
  'c1-cliff-cut':{id:'c1-cliff-cut',region:'training',from:'junction',to:'riverside',label:'CLIFF DROP SHORTCUT',skill:'PLATFORMING'},
  'c2-market-stadium':{id:'c2-market-stadium',region:'tournament',from:'market',to:'stadium',label:'WADE STADIUM CUT',skill:'WADE ROUTE'},
  'c2-practice-registration':{id:'c2-practice-registration',region:'tournament',from:'practice',to:'registration',label:'WADE REGISTRATION CUT',skill:'WADE ROUTE'},
  'c2-stadium-west':{id:'c2-stadium-west',region:'tournament',from:'stadium',to:'westGate',label:'WADE WEST GATE CUT',skill:'WADE ROUTE'},
  'c3-service-cut':{id:'c3-service-cut',region:'tournament',from:'service',to:'security',label:'AFTER-HOURS SERVICE CUT',skill:'INVESTIGATION'},
  'c4-water-lift':{id:'c4-water-lift',region:'echo',from:'water',to:'upperRidge',label:'OLD WATER LIFT',skill:'WADE • LIGHTNING CURRENT'},
  'c4-apothecary-pass':{id:'c4-apothecary-pass',region:'echo',from:'apothecary',to:'cavernApproach',label:'OLD APOTHECARY PASSAGE',skill:'RRVVFO • PRECISION LOCK'},
  'c4-cavern-return':{id:'c4-cavern-return',region:'echo',from:'caverns',to:'central',label:'ECHO CAVERN RETURN',skill:'PARTY FIELD ROUTE'}
});

function unique(values){return[...new Set(Array.isArray(values)?values.filter(Boolean):[])];}
export function freshConnectedWorldState(){return{version:CONNECTED_WORLD_VERSION,currentRegion:'training',currentZone:'dojo',discoveredRegions:['training'],discoveredZones:['training:dojo'],landmarks:[],shortcuts:[],interiors:[],interiorVisitCounts:{},doorStates:{},visitCounts:{},lastEntrance:'start'};}

function completed(progress,id){return Boolean(progress?.completedMissions?.includes(id));}
function inferDiscoveries(progress,state){
  const zones=[...state.discoveredZones],regions=[...state.discoveredRegions];
  const visit=(region,...ids)=>{regions.push(region);ids.forEach(id=>zones.push(`${region}:${id}`));};
  if(completed(progress,'rrvvfo-00'))visit('training','dojo','yard');
  if(completed(progress,'rrvvfo-01'))visit('training','junction');
  if(completed(progress,'rrvvfo-road'))visit('training','mainRoad','forest','cliff','riverside','outskirts'),visit('tournament','westGate');
  if(completed(progress,'rrvvfo-02'))visit('tournament','practice','market','central','registration','spectator','stadium','medical','security','service','backstage');
  if(completed(progress,'rrvvfo-03'))visit('resonance','maintenance','power','corridor','security','records','core','terminal','teleporter'),visit('echo','lowerTrail');
  if(completed(progress,'rrvvfo-04'))visit('echo','villageGate','central','residential','wall','water','apothecary','cavernApproach','caverns','foothills','mountain','summit','lookout');
  return{regions:unique(regions),zones:unique(zones)};
}

export function normalizeConnectedWorldState(value={},progress={}){
  const base=freshConnectedWorldState(),source=value&&typeof value==='object'?value:{};
  const merged={...base,...source,version:CONNECTED_WORLD_VERSION,discoveredRegions:unique(source.discoveredRegions||base.discoveredRegions),discoveredZones:unique(source.discoveredZones||base.discoveredZones),landmarks:unique(source.landmarks),shortcuts:unique(source.shortcuts),interiors:unique(source.interiors),interiorVisitCounts:{...(source.interiorVisitCounts||{})},doorStates:{...(source.doorStates||{})},visitCounts:{...(source.visitCounts||{})}};
  const inferred=inferDiscoveries(progress,merged);merged.discoveredRegions=inferred.regions;merged.discoveredZones=inferred.zones;
  if(!WORLD_REGIONS[merged.currentRegion])merged.currentRegion='training';
  if(!WORLD_REGIONS[merged.currentRegion]?.zones?.[merged.currentZone])merged.currentZone=Object.keys(WORLD_REGIONS[merged.currentRegion].zones)[0];
  return merged;
}

export function recordWorldVisit(progress,regionId,zoneId,{entrance='',landmark=''}={}){
  const state=normalizeConnectedWorldState(progress?.worldState,progress);const region=WORLD_REGIONS[regionId];if(!region||!region.zones[zoneId])return progress;
  const key=`${regionId}:${zoneId}`;state.currentRegion=regionId;state.currentZone=zoneId;state.lastEntrance=entrance||state.lastEntrance;state.discoveredRegions=unique([...state.discoveredRegions,regionId]);state.discoveredZones=unique([...state.discoveredZones,key]);state.visitCounts[key]=(Number(state.visitCounts[key])||0)+1;if(landmark)state.landmarks=unique([...state.landmarks,landmark]);
  return{...progress,worldState:state};
}


export function recordInteriorVisit(progress,buildingId,{regionId='',zoneId='',entrance='front-door'}={}){
  const state=normalizeConnectedWorldState(progress?.worldState,progress);if(!buildingId)return progress;
  state.interiors=unique([...state.interiors,buildingId]);state.interiorVisitCounts[buildingId]=(Number(state.interiorVisitCounts[buildingId])||0)+1;state.lastEntrance=`interior:${buildingId}:${entrance}`;
  if(regionId&&zoneId){state.currentRegion=regionId;state.currentZone=zoneId;state.discoveredRegions=unique([...state.discoveredRegions,regionId]);state.discoveredZones=unique([...state.discoveredZones,`${regionId}:${zoneId}`])}
  return{...progress,worldState:state};
}
export function setWorldDoorState(progress,doorId,value='open'){const state=normalizeConnectedWorldState(progress?.worldState,progress);if(!doorId)return progress;state.doorStates[doorId]=value;return{...progress,worldState:state}}
export function worldInteriorKnown(state,id){return normalizeConnectedWorldState(state).interiors.includes(id)}
export function worldDoorState(state,id){return normalizeConnectedWorldState(state).doorStates[id]||'unknown'}
export function discoverWorldShortcut(progress,shortcutId){const shortcut=WORLD_SHORTCUTS[shortcutId];if(!shortcut)return progress;const state=normalizeConnectedWorldState(progress?.worldState,progress);state.shortcuts=unique([...state.shortcuts,shortcutId]);state.discoveredRegions=unique([...state.discoveredRegions,shortcut.region]);state.discoveredZones=unique([...state.discoveredZones,`${shortcut.region}:${shortcut.from}`,`${shortcut.region}:${shortcut.to}`]);return{...progress,worldState:state};}
export function discoverWorldLandmark(progress,landmarkId){const state=normalizeConnectedWorldState(progress?.worldState,progress);state.landmarks=unique([...state.landmarks,landmarkId]);return{...progress,worldState:state};}
export function worldZoneKnown(state,regionId,zoneId){return normalizeConnectedWorldState(state).discoveredZones.includes(`${regionId}:${zoneId}`);}
export function worldShortcutKnown(state,id){return normalizeConnectedWorldState(state).shortcuts.includes(id);}
export function regionForZone(regionId){return WORLD_REGIONS[regionId]||WORLD_REGIONS.training;}
export function connectedZoneNeighbors(regionId,zoneId){const region=WORLD_REGIONS[regionId];if(!region)return[];return region.links.flatMap(([a,b])=>a===zoneId?[b]:b===zoneId?[a]:[]);}

export function worldMapSummary(progress={}){
  const state=normalizeConnectedWorldState(progress.worldState,progress);
  return Object.values(WORLD_REGIONS).map(region=>({id:region.id,name:region.name,known:state.discoveredRegions.includes(region.id),zonesKnown:state.discoveredZones.filter(key=>key.startsWith(`${region.id}:`)).length,zonesTotal:Object.keys(region.zones).length,current:state.currentRegion===region.id}));
}

export function renderTravelJournal(progress={}){
  const state=normalizeConnectedWorldState(progress.worldState,progress);const regions=worldMapSummary(progress);
  return `<section class="connectedTravelJournal"><header><small>WORLD TRAVEL JOURNAL</small><strong>${WORLD_REGIONS[state.currentRegion]?.name||'UNKNOWN REGION'}</strong><span>${WORLD_REGIONS[state.currentRegion]?.zones?.[state.currentZone]?.name||'UNKNOWN AREA'}</span></header><div>${regions.filter(region=>region.known).map(region=>`<article class="${region.current?'isCurrent':''}"><small>${region.current?'CURRENT REGION':'DISCOVERED REGION'}</small><strong>${region.name}</strong><span>${region.zonesKnown} / ${region.zonesTotal} areas mapped</span></article>`).join('')}</div><footer>${state.shortcuts.length} permanent shortcut${state.shortcuts.length===1?'':'s'} • ${state.interiors.length} interior${state.interiors.length===1?'':'s'} entered • Hidden routes appear only after you find them.</footer></section>`;
}
