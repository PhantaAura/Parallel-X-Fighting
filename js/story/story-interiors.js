export const STORY_INTERIOR_VERSION=2;

const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value)}return value};

export const STORY_BUILDINGS=freeze({
  'tournament-medical':{
    id:'tournament-medical',region:'tournament',zone:'medical',label:'TOURNAMENT MEDICAL CENTER',size:'medium',tone:'medical',chapters:[2,3],
    entry:{x:640,z:-430,spawn:{x:0,z:250},returnSpawn:{x:640,z:-390}},exterior:{x:640,z:-540,sx:300,sz:220},bounds:{minX:-430,maxX:430,minZ:-300,maxZ:300},
    palette:{floor:'#d8d3c7',wall:'#7e8c86',trim:'#e8e0c9',accent:'#7bc4c7',door:'#473b34'},
    rooms:[{id:'reception',label:'RECEPTION',x:0,z:150,w:720,d:220},{id:'recovery',label:'RECOVERY ROOM',x:-180,z:-110,w:320,d:210},{id:'storage',label:'SUPPLY ROOM',x:220,z:-100,w:260,d:200}],
    fixtures:[{type:'counter',x:0,z:70,w:330},{type:'bed',x:-240,z:-155},{type:'bed',x:-80,z:-155},{type:'shelf',x:250,z:-135},{type:'shelf',x:250,z:-55}],
    actors:[{id:'medical-worker',label:'MEDICAL WORKER',x:-30,z:-30,color:'#5e93a1'}]
  },
  'tournament-admin':{
    id:'tournament-admin',region:'tournament',zone:'registration',label:'TOURNAMENT ADMINISTRATION',size:'medium',tone:'festival',chapters:[2,3],
    entry:{x:-120,z:-490,spawn:{x:0,z:230},returnSpawn:{x:-120,z:-450}},exterior:{x:-120,z:-620,sx:370,sz:220},bounds:{minX:-430,maxX:430,minZ:-300,maxZ:300},
    palette:{floor:'#e5d3a9',wall:'#c49d63',trim:'#f1e6c4',accent:'#c44548',door:'#4b3028'},
    rooms:[{id:'lobby',label:'ADMIN LOBBY',x:0,z:100,w:740,d:260},{id:'records',label:'RECORDS DESK',x:-220,z:-130,w:280,d:190},{id:'staff',label:'STAFF OFFICE',x:220,z:-130,w:280,d:190}],
    fixtures:[{type:'counter',x:0,z:20,w:360},{type:'shelf',x:-250,z:-160},{type:'shelf',x:250,z:-160}],
    actors:[{id:'admin-clerk',label:'ADMIN CLERK',x:0,z:-40,color:'#a75f4d'}]
  },
  'tournament-backstage':{
    id:'tournament-backstage',region:'tournament',zone:'backstage',label:'FIGHTER BACKSTAGE',size:'medium',tone:'backstage',chapters:[2,3],
    entry:{x:1010,z:-360,spawn:{x:0,z:230},returnSpawn:{x:980,z:-330}},exterior:{x:1010,z:-470,sx:310,sz:210},bounds:{minX:-460,maxX:460,minZ:-320,maxZ:320},
    palette:{floor:'#b9afa1',wall:'#69645e',trim:'#d5c6af',accent:'#d2aa4f',door:'#332c28'},
    rooms:[{id:'hall',label:'FIGHTER HALL',x:0,z:80,w:820,d:280},{id:'locker-a',label:'LOCKER A',x:-250,z:-160,w:290,d:190},{id:'locker-b',label:'LOCKER B',x:250,z:-160,w:290,d:190}],
    fixtures:[{type:'bench',x:-170,z:10,w:220},{type:'bench',x:170,z:10,w:220},{type:'locker',x:-270,z:-190},{type:'locker',x:270,z:-190}],
    actors:[{id:'fighter-attendant',label:'FIGHTER ATTENDANT',x:0,z:-70,color:'#6c7280'}]
  },
  'echo-apothecary':{
    id:'echo-apothecary',region:'echo',zone:'apothecary',label:'OLD APOTHECARY',size:'small',tone:'echo',chapters:[4],
    entry:{x:260,z:500,spawn:{x:0,z:210},returnSpawn:{x:260,z:470}},exterior:{x:260,z:610,sx:270,sz:205},bounds:{minX:-350,maxX:350,minZ:-260,maxZ:270},
    palette:{floor:'#8b7354',wall:'#6c563f',trim:'#c3a574',accent:'#9fd58a',door:'#3e3028'},
    rooms:[{id:'shop',label:'HERB ROOM',x:0,z:80,w:610,d:280},{id:'store',label:'OLD STORAGE',x:0,z:-150,w:610,d:170}],
    fixtures:[{type:'counter',x:0,z:20,w:270},{type:'shelf',x:-240,z:-120},{type:'shelf',x:240,z:-120},{type:'herbs',x:-180,z:120},{type:'herbs',x:180,z:120}],
    actors:[{id:'apothecary-keeper',label:'APOTHECARY KEEPER',x:0,z:-25,color:'#6e7f5a'}]
  },
  'echo-home-west':{
    id:'echo-home-west',region:'echo',zone:'residential',label:'WEST ECHO HOME',size:'small',tone:'home',chapters:[4],
    entry:{x:-100,z:520,spawn:{x:0,z:180},returnSpawn:{x:-100,z:485}},exterior:{x:-100,z:610,sx:160,sz:155},bounds:{minX:-300,maxX:300,minZ:-220,maxZ:230},
    palette:{floor:'#82694d',wall:'#70563f',trim:'#b99b65',accent:'#8fe8ff',door:'#3d3027'},
    rooms:[{id:'home',label:'ECHO HOME',x:0,z:20,w:520,d:360}],fixtures:[{type:'table',x:0,z:0},{type:'mat',x:-150,z:-80},{type:'chime',x:170,z:-100}],
    actors:[{id:'echo-resident-west',label:'ECHO RESIDENT',x:100,z:-40,color:'#65958a'}]
  },
  'echo-home-east':{
    id:'echo-home-east',region:'echo',zone:'residential',label:'EAST ECHO HOME',size:'small',tone:'home',chapters:[4],
    entry:{x:80,z:520,spawn:{x:0,z:180},returnSpawn:{x:80,z:485}},exterior:{x:80,z:610,sx:160,sz:155},bounds:{minX:-300,maxX:300,minZ:-220,maxZ:230},
    palette:{floor:'#82694d',wall:'#70563f',trim:'#b99b65',accent:'#ffd88a',door:'#3d3027'},
    rooms:[{id:'home',label:'ECHO HOME',x:0,z:20,w:520,d:360}],fixtures:[{type:'table',x:0,z:0},{type:'mat',x:150,z:-80},{type:'chime',x:-170,z:-100}],
    actors:[{id:'echo-resident-east',label:'ECHO RESIDENT',x:-100,z:-40,color:'#9a7152'}]
  }
});

const LOCKED_LINES=Object.freeze([
  'Eh. Door’s locked.',
  'I’m not just walking into somebody’s house.',
  'Nothing in there has anything to do with me.',
  'Locked. Probably for a reason.',
  'Yeah, I am not barging in there.'
]);

export function lockedDoorLine(seed=0){return LOCKED_LINES[Math.abs(Number(seed)||0)%LOCKED_LINES.length]}
export function buildingDefinition(id){return STORY_BUILDINGS[id]||null}
export function buildingIdsForChapter(chapter){return Object.values(STORY_BUILDINGS).filter(item=>item.chapters.includes(Number(chapter))).map(item=>item.id)}
export function canEnterBuilding(id,{chapter=0,enabledIds=null,lockedIds=[]}={}){const building=buildingDefinition(id);if(!building||lockedIds.includes(id))return false;if(Array.isArray(enabledIds))return enabledIds.includes(id);return building.chapters.includes(Number(chapter))}
export function buildingMapTitle(id){const building=buildingDefinition(id);return building?`${building.label} • INTERIOR MAP`:'INTERIOR MAP'}
export function interiorTransition({buildingId,entrance='front-door',returnZone=''}){const building=buildingDefinition(buildingId);if(!building)return null;return{buildingId,entrance,returnZone:returnZone||building.zone,region:building.region,label:building.label,spawn:{...building.entry.spawn},returnSpawn:{...building.entry.returnSpawn}}}
export function interiorBounds(id){return buildingDefinition(id)?.bounds||{minX:-320,maxX:320,minZ:-240,maxZ:240}}
export function interiorExitPoint(id){const b=buildingDefinition(id);return b?{id:'exit',kind:'interior-exit',label:`EXIT • ${b.label}`,x:b.entry.spawn.x,z:b.entry.spawn.z+20}:null}
export function interiorActorPoints(id){return (buildingDefinition(id)?.actors||[]).map(actor=>({...actor,kind:'interior-actor'}))}
export function interiorMapPoints(id){const b=buildingDefinition(id);if(!b)return[];return[...b.rooms.map(room=>({id:room.id,label:room.label,x:room.x,z:room.z,kind:'room',color:b.palette.accent})),...interiorActorPoints(id).map(actor=>({...actor,color:actor.color||b.palette.accent})),interiorExitPoint(id)].filter(Boolean)}
export function clampInteriorPlayer(player,id,pad=35){if(!player)return;const b=interiorBounds(id);player.x=Math.max(b.minX+pad,Math.min(b.maxX-pad,player.x));player.z=Math.max(b.minZ+pad,Math.min(b.maxZ-pad,player.z));player.y=0;player.vy=0;player.grounded=true}

function resolveExteriorRect(player,rect,radius=22){if(!player||!rect)return false;const halfX=Math.abs(Number(rect.sx)||0)/2,halfZ=Math.abs(Number(rect.sz)||0)/2;if(!halfX||!halfZ)return false;const minX=(Number(rect.x)||0)-halfX-radius,maxX=(Number(rect.x)||0)+halfX+radius,minZ=(Number(rect.z)||0)-halfZ-radius,maxZ=(Number(rect.z)||0)+halfZ+radius,x=Number(player.x)||0,z=Number(player.z)||0;if(x<=minX||x>=maxX||z<=minZ||z>=maxZ)return false;const edges=[['x',minX,Math.abs(x-minX)],['x',maxX,Math.abs(maxX-x)],['z',minZ,Math.abs(z-minZ)],['z',maxZ,Math.abs(maxZ-z)]].sort((a,b)=>a[2]-b[2]);const [axis,value]=edges[0];player[axis]=value;player.moveVX=(Number(player.moveVX)||0)*.15;player.moveVZ=(Number(player.moveVZ)||0)*.15;player.kvx=(Number(player.kvx)||0)*.25;player.kvz=(Number(player.kvz)||0)*.25;return true}
export function resolveExteriorStructureCollision(player,structures=[],radius=22){let hit=false;for(const rect of structures||[])if(resolveExteriorRect(player,rect,radius))hit=true;return hit}
export function resolveExteriorBuildingCollision(player,buildingIds=[],radius=22){return resolveExteriorStructureCollision(player,(buildingIds||[]).map(id=>buildingDefinition(id)?.exterior).filter(Boolean),radius)}

export function drawBuildingDoor(r,{x,z,label='',open=true,tone='#d9bd72'}={}){r.box({x,y:62,z,sx:92,sy:124,sz:18,color:open?'#3f322b':'#292726'});r.box({x,y:129,z,sx:112,sy:12,sz:28,color:tone});if(open)r.billboard({x,y:104,z:z-14,size:20,color:tone,alpha:.34});if(label)r.billboard({x,y:155,z,size:10,color:'#fff3c0',alpha:.16})}

export function drawStoryInterior(r,id,time=0){const b=buildingDefinition(id);if(!b)return;const p=b.palette;
  r.box({x:0,y:2,z:0,sx:b.bounds.maxX-b.bounds.minX,sy:4,sz:b.bounds.maxZ-b.bounds.minZ,color:p.floor});
  const w=b.bounds.maxX-b.bounds.minX,d=b.bounds.maxZ-b.bounds.minZ,cx=(b.bounds.maxX+b.bounds.minX)/2,cz=(b.bounds.maxZ+b.bounds.minZ)/2;
  r.box({x:cx,y:90,z:b.bounds.minZ,sx:w,sy:180,sz:18,color:p.wall});r.box({x:b.bounds.minX,y:90,z:cz,sx:18,sy:180,sz:d,color:p.wall});r.box({x:b.bounds.maxX,y:90,z:cz,sx:18,sy:180,sz:d,color:p.wall});
  // Front wall leaves a real doorway instead of cutting a fake hole through an exterior shell.
  r.box({x:cx-w*.31,y:90,z:b.bounds.maxZ,sx:w*.38,sy:180,sz:18,color:p.wall});r.box({x:cx+w*.31,y:90,z:b.bounds.maxZ,sx:w*.38,sy:180,sz:18,color:p.wall});r.box({x:cx,y:164,z:b.bounds.maxZ,sx:w*.24,sy:32,sz:18,color:p.trim});
  for(const fixture of b.fixtures||[]){const x=fixture.x||0,z=fixture.z||0;
    if(fixture.type==='counter')r.box({x,y:45,z,sx:fixture.w||300,sy:78,sz:55,color:p.trim});
    else if(fixture.type==='bed'){r.box({x,y:18,z,sx:120,sy:24,sz:72,color:'#e9e2d5'});r.box({x:x-40,y:35,z,sx:38,sy:28,sz:68,color:p.accent})}
    else if(fixture.type==='shelf'){r.box({x,y:70,z,sx:105,sy:135,sz:26,color:'#514236'});for(let i=0;i<4;i++)r.box({x,y:24+i*30,z:z-16,sx:92,sy:6,sz:8,color:p.trim})}
    else if(fixture.type==='bench')r.box({x,y:22,z,sx:fixture.w||200,sy:20,sz:56,color:'#73543d'});
    else if(fixture.type==='locker')r.box({x,y:80,z,sx:150,sy:160,sz:48,color:'#535960'});
    else if(fixture.type==='herbs'){for(let i=0;i<4;i++)r.billboard({x:x+(i-1.5)*22,y:42+(i%2)*14,z,size:18,color:i%2?'#9fd58a':'#d7b56e',alpha:.72})}
    else if(fixture.type==='table')r.box({x,y:30,z,sx:150,sy:28,sz:95,color:'#6d5139'});
    else if(fixture.type==='mat')r.box({x,y:5,z,sx:130,sy:5,sz:90,color:'#758763'});
    else if(fixture.type==='chime'){r.segment({x,y:55,z},{x,y:135,z},{width:5,height:5,color:'#6a4d34'});r.cone({x,y:150+Math.sin(time*2)*4,z,rx:20,sy:30,color:p.accent})}
  }
  for(const actor of b.actors||[]){const bob=Math.sin(time*2+actor.x*.01)*2;r.cylinder({x:actor.x,y:52+bob,z:actor.z,rx:16,sy:82,color:actor.color||p.accent});r.cylinder({x:actor.x,y:105+bob,z:actor.z,rx:14,sy:25,color:'#9b6849'});r.billboard({x:actor.x,y:146+bob,z:actor.z,size:16,color:p.accent,alpha:.35})}
  const exit=interiorExitPoint(id);if(exit)r.billboard({x:exit.x,y:105,z:exit.z,size:20,color:p.accent,alpha:.35+Math.sin(time*3)*.06});
}

export function interiorLifeLine(buildingId,actorId,{chapter=0,phase='',defended=false,tournamentStarted=false}={}){
  if(buildingId==='tournament-medical'&&actorId==='medical-worker')return chapter===3?'The recovery room is quieter at night. That makes every changed story easier to notice.':tournamentStarted?'We keep the beds open between rounds. Fighters pretend they do not need them.':'We are ready for the first injuries. Hopefully the ring is too.';
  if(buildingId==='tournament-admin')return chapter===3?'Most staff records were signed out before closing. That is not normal.':'Registration, brackets, fighter records. Everything boring enough to be important.';
  if(buildingId==='tournament-backstage')return chapter===3?'Nobody should still be using these lockers after hours.':'Keep the hallway clear. Fighters need somewhere to complain privately.';
  if(buildingId==='echo-apothecary')return defended?'The village is safe enough to reopen the herb room. Take a look around.':'The shelves shake whenever the mountain does. We tie down the expensive bottles.';
  if(buildingId.startsWith('echo-home'))return defended?'It is strange hearing ordinary conversation again after that attack.':'We keep the chimes close. If the mountain changes, the houses hear it first.';
  return 'Nothing unusual in here.';
}
