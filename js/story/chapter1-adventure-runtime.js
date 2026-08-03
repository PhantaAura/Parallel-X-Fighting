import {RrvvfoRoadHub} from './rrvvfo-road-hub.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {recordWorldVisit} from './connected-world.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {completeAdventureMission,discoverAdventureMission} from './core-fun.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {discoverWorldDelight} from './world-delight.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {ArenaBattle} from '../arena/arena-mode.js?v=29a4072r-ch1-adventure-playtestlab-20260802';
import {
  CHAPTER1_ADVENTURE_VERSION,
  CHAPTER1_FIRE_BLAST_STORY_FOCUS,
  CHAPTER1_GUIDANCE,
  CHAPTER1_ROUTE_COMMIT,
  CHAPTER1_ROUTES,
  chapter1RouteFromPosition,
  chapter1RouteMarkers
} from './chapter1-adventure.js?v=29a4072r-ch1-adventure-playtestlab-20260802';

const PATCH_FLAG=Symbol.for('px.chapter1Adventure4072r');
const ARENA_FLAG=Symbol.for('px.storyFireBlast4072r');

function distance(a,b){return Math.hypot((a?.x||0)-(b?.x||0),(a?.z||0)-(b?.z||0))}
function now(){return performance?.now?.()??Date.now()}
function cloneMarker(marker){return{...marker,done:false}}
function unique(values){return[...new Set(values)]}

function ensureAdventure(mission){
  if(mission.__pxAdventureState)return mission.__pxAdventureState;
  mission.routeChoicePanel.hidden=true;
  const state=mission.__pxAdventureState={
    objectiveKey:'',objectiveSince:now(),softShown:false,exactShown:false,
    routeObstacleCleared:false,
    forestMarkers:chapter1RouteMarkers('forest'),
    mainMarkers:chapter1RouteMarkers('main'),
    transportFarAnchor:null,
    transportReturnAnchor:null,
    detourStarted:false,
    detourComplete:false
  };
  mission.cliffJumpMarkers=chapter1RouteMarkers('cliff');
  mission.routeChoiceShown=true;
  return state;
}

function resetGuidance(mission,key){
  const state=ensureAdventure(mission);
  if(state.objectiveKey===key)return;
  state.objectiveKey=key;state.objectiveSince=now();state.softShown=false;state.exactShown=false;
}

function guidanceText(mission,exact=false){
  const route=mission.routeChoice;
  const step=mission.step;
  if(step==='route-choice')return exact
    ?'JUNCTION • MOVE NORTH FOR FOREST, CENTER FOR MAIN ROAD, OR SOUTH FOR CLIFF — CROSS THE SIGN LINE TO COMMIT.'
    :'RRVVFO • The signs are the choice. I should actually walk into one of the roads.';
  if(step==='cart'||step==='cart-ready')return exact
    ?`MAIN ROAD • ${mission.abilityPrompt?.(1,'FIRE BLAST')||'USE FIRE BLAST'} ON THE FALLEN TRUNK.`
    :'RRVVFO • That wood is blocking the center road. Burning the right thing should open it.';
  if(step==='route-travel'&&route==='main')return exact
    ?'MAIN ROAD • WEAVE THROUGH EACH WORK-LANE MARKER, THEN REACH THE ROAD CREST.'
    :'RRVVFO • Workers left a path through this mess. I should follow the gaps, not just shove through.';
  if(step==='route-travel'&&route==='forest')return exact
    ?'FOREST TRAIL • FOLLOW PINE BELL I → II → III → FOREST EXIT.'
    :'RRVVFO • Blue bells. Guess the workers actually marked a trail through here.';
  if(step==='route-travel'&&route==='cliff')return exact
    ?'CLIFF PASS • JUMP WHILE CROSSING ALL FIVE SOUTHERN LEDGES.'
    :'RRVVFO • Those ledges keep climbing south. If I stay airborne across them, that has to be the route.';
  if(step==='transport'||step==='transport-return')return exact
    ?`TRANSPORT • ${mission.abilityPrompt?.(3,'OBJECT SWAP')||'USE OBJECT SWAP'} — FIRST THE WHEEL, THEN THE RETURN ANCHOR.`
    :'RRVVFO • Fixing their problem moved me into one. There has to be something on the road I can swap back with.';
  if(step==='lens-ready')return exact
    ?`OUTSKIRTS • USE LENS OF TRUTH FOR THE DIRECT ROUTE, OR TAKE THE OPEN SOUTHERN DETOUR.`
    :'RRVVFO • I could use the Lens... or I could just see where that southern path goes.';
  if(step==='detour-travel')return exact
    ?'SOUTH DETOUR • STAY ON THE SOUTH PATH UNTIL IT REJOINS BEYOND THE ROADBLOCK.'
    :'RRVVFO • Longer way around, but at least my eye gets a break.';
  return'';
}

function tickGuidance(mission){
  if(mission.mode!=='hub')return;
  const state=ensureAdventure(mission),elapsed=now()-state.objectiveSince;
  if(!state.softShown&&elapsed>=CHAPTER1_GUIDANCE.softHintMs){
    const text=guidanceText(mission,false);if(text){state.softShown=true;mission.battle?.notice?.(text,2.6)}
  }
  if(!state.exactShown&&elapsed>=CHAPTER1_GUIDANCE.exactHintMs){
    const text=guidanceText(mission,true);if(text){state.exactShown=true;mission.battle?.notice?.(text,3.3)}
  }
}

function nextMarker(mission){
  const state=ensureAdventure(mission);
  if(mission.routeChoice==='forest')return state.forestMarkers.find(marker=>!marker.done)||null;
  if(mission.routeChoice==='cliff')return mission.cliffJumpMarkers.find(marker=>!marker.done)||null;
  if(mission.routeChoice==='main')return state.mainMarkers.find(marker=>!marker.done)||null;
  return null;
}

function routeMarkers(mission){
  const state=ensureAdventure(mission);
  if(mission.routeChoice==='forest')return state.forestMarkers;
  if(mission.routeChoice==='cliff')return mission.cliffJumpMarkers;
  if(mission.routeChoice==='main')return state.mainMarkers;
  return[];
}

function updateMarkerRoute(mission,player){
  if(mission.step!=='route-travel')return;
  const route=mission.routeChoice,markers=routeMarkers(mission),marker=markers.find(item=>!item.done);
  if(!marker)return;
  if(distance(player,marker)<=78){
    const airborne=player.y>8||Math.abs(player.vy||0)>35;
    if(route==='cliff'&&!airborne){
      if(!mission.noticeCooldown){mission.noticeCooldown=.8;mission.battle.notice('CLIFF STEP • JUMP ACROSS IT',.75)}
      return;
    }
    marker.done=true;
    const done=markers.filter(item=>item.done).length;
    const color=route==='forest'?'#74cfff':route==='cliff'?'#ffcc72':'#ffd17a';
    mission.battle.burst(marker.x,marker.z,color,12,38);
    mission.battle.notice(`${marker.label} • ${done}/${markers.length}`,.9);
    if(route==='forest')mission.setObjective('FOREST TRAIL • READ THE BLUE BELLS',done===markers.length?'Find the trail exit and rejoin the road.':`${done} / ${markers.length} route beats found. Keep reading the blue bells through the trees.`);
    else if(route==='cliff')mission.setObjective('CLIFF PASS • KEEP THE HIGH LINE',done===markers.length?'The high road is clear. Reach the rejoin.':`${done} / ${markers.length} airborne ledges crossed.`);
    else mission.setObjective('MAIN ROAD • WORK-LANE CUT',done===markers.length?'The work lane is clear. Reach the road crest.':`${done} / ${markers.length} work-lane gaps cleared.`);
  }
  if(player.x>455&&!mission.routeGimmickReady()){
    player.x=430;player.moveVX=0;
    if(!mission.noticeCooldown){mission.noticeCooldown=1.0;mission.battle.notice(`${CHAPTER1_ROUTES[route]?.identity||'ROUTE'} • FINISH THE ROUTE BEFORE THE REJOIN`,1.0)}
  }
}

function saveRouteChoice(mission,route){
  if(mission.replayMode)return;
  const zone=route==='forest'?'forest':route==='cliff'?'cliff':'mainRoad';
  saveLostYearProgress(recordWorldVisit(loadLostYearProgress(),'training',zone,{entrance:'physical-road-junction'}));
}

function installRoadPatch(){
  const proto=RrvvfoRoadHub?.prototype;if(!proto||proto[PATCH_FLAG])return false;
  Object.defineProperty(proto,PATCH_FLAG,{value:true});
  Object.defineProperty(proto,'__pxAdventureRebuildInstalled',{value:true});

  const baseSetObjective=proto.setObjective;
  proto.setObjective=function(title,detail){
    resetGuidance(this,`${title||''}\n${detail||''}`);
    return baseSetObjective.call(this,title,detail);
  };

  const baseUpdateHub=proto.updateHub;
  proto.updateHub=function(dt,previous){
    ensureAdventure(this);this.routeChoicePanel.hidden=true;
    const result=baseUpdateHub.call(this,dt,previous);
    const player=this.battle?.fighters?.[0];if(!player)return result;
    const state=ensureAdventure(this);
    if(this.step==='transport-return'){
      player.x=Math.max(735,Math.min(835,player.x));player.z=Math.max(-360,Math.min(-80,player.z));player.moveVX=0;
    }
    if(this.step==='detour-travel'&&player.x<1175){player.z=Math.max(225,player.z)}
    tickGuidance(this);return result;
  };

  proto.routeGimmickReady=function(){
    if(!this.routeChoice)return false;
    return routeMarkers(this).every(marker=>marker.done);
  };

  proto.updateRouteGimmick=function(player){ensureAdventure(this);updateMarkerRoute(this,player)};

  proto.chooseRoadRoute=function(route){
    if(!['main','forest','cliff'].includes(route))return;
    const state=ensureAdventure(this);
    this.routeChoice=route;this.routeChoicePanel.hidden=true;this.mode='hub';this.battle.phase='play';
    state.routeObstacleCleared=false;
    state.mainMarkers=chapter1RouteMarkers('main');state.forestMarkers=chapter1RouteMarkers('forest');this.cliffJumpMarkers=chapter1RouteMarkers('cliff');
    saveRouteChoice(this,route);
    if(route==='cliff')discoverAdventureMission('c1-high-road');
    if(route==='main'){
      this.step='cart';this.setObjective('MAIN ROAD • CONTROL','The center road is blocked. Clear the fallen trunk, then work through the active lane.');
    }else if(route==='forest'){
      this.step='route-travel';this.setObjective('FOREST TRAIL • EXPLORE','Follow the north trail by reading its blue bells. The route bends away from the common road before returning.');
    }else{
      this.step='route-travel';this.setObjective('CLIFF PASS • PLATFORM','Take the southern high road and cross all five ledges while airborne.');
    }
    this.battle.notice(`${CHAPTER1_ROUTES[route].label} • ${CHAPTER1_ROUTES[route].identity}`,1.7);
  };

  const baseStoryTriggers=proto.updateStoryTriggers;
  proto.updateStoryTriggers=function(player){
    ensureAdventure(this);
    if(this.step==='route-choice'){
      this.routeChoicePanel.hidden=true;
      const route=chapter1RouteFromPosition(player);
      if(route){this.chooseRoadRoute(route)}
      return;
    }
    if(this.step==='lens-ready'&&player.z>255&&player.x>995){
      const state=ensureAdventure(this);state.detourStarted=true;this.lensRevealed=true;this.step='detour-travel';
      this.showAreaTitle('SOUTHERN OUTSKIRTS DETOUR');
      this.setObjective('FOLLOW THE SOUTHERN DETOUR','Stay on the open southern path until it rejoins beyond the suspicious roadblock. Lens of Truth is not required.');
      const progress=loadLostYearProgress();saveLostYearProgress({...progress,chapter1RoadDetour:true,lastCheckpoint:'rrvvfo-road-detour'});
      discoverWorldDelight('c1-road-detour');
      this.showDialogue([{speaker:'RRVVFO',speakerClass:'p1',text:'See? I can solve problems without scratching my eye. Sometimes.',tail:'down'}],()=>{this.mode='hub';this.battle.phase='play'});
      return;
    }
    if(this.step==='detour-travel'){
      if(player.x>1175){
        ensureAdventure(this).detourComplete=true;this.step='finish';
        this.setObjective('REACH THE TOURNAMENT ENTRANCE','The detour rejoins beyond the blocked road. The stadium is directly ahead.');
        saveLostYearProgress({...loadLostYearProgress(),chapter1RoadDetour:true,lastCheckpoint:'rrvvfo-road-detour-complete'});
      }
      return;
    }
    return baseStoryTriggers.call(this,player);
  };

  const baseCastField=proto.castFieldAbility;
  proto.castFieldAbility=function(slot){
    const player=this.battle?.fighters?.[0];ensureAdventure(this);
    if(slot===3&&this.step==='bridge-ready'&&player&&player.x>-180&&player.x<15){
      const oldX=player.x,oldZ=player.z,targetX=CHAPTER1_ROUTE_COMMIT.landingX,targetZ=0;
      this.bridgeCrossed=true;player.x=targetX;player.z=targetZ;this.swapRock.x=oldX;this.swapRock.z=oldZ;
      player.visualAction='objectSwapDisappear';player.visualActionTime=.45;
      this.battle.burst(oldX,oldZ,'#ffd079',20,55);this.battle.burst(targetX,targetZ,'#ffd079',20,55);
      this.step='route-choice';this.routeChoice=null;this.routeChoiceShown=true;this.routeChoicePanel.hidden=true;
      this.setObjective('READ THE THREE-WAY JUNCTION','The road itself is the choice: north Forest Trail, center Main Road, or south Cliff Pass. Cross a signed lane to commit.');
      this.battle.notice('THREE-WAY JUNCTION • CHOOSE BY MOVING',1.8);
      saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-bridge'});return true;
    }
    if(slot===1&&this.step==='cart-ready'&&player&&player.x>200&&player.x<315){
      player.visualAction='fireBlastFire';player.visualActionTime=.5;this.roadCleared=true;
      this.battle.burst(340,0,'#ff7b38',30,76);this.battle.notice('CONTROLLED BURN • ROAD OPEN',1.4);
      this.showDialogue([
        {speaker:'ROAD WORKER',speakerClass:'neutral',text:'Good. You cleared it without torching the whole tree line. The work lane ahead is still a mess.',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'I know how to control fire. Mostly.',tail:'down'}
      ],()=>{
        this.mode='hub';this.battle.phase='play';this.step='route-travel';
        this.setObjective('MAIN ROAD • WORK-LANE CUT','Weave through the marked work-lane gaps and reach the road crest.');
        saveLostYearProgress({...loadLostYearProgress(),lastCheckpoint:'rrvvfo-road-fire'});
      });return true;
    }
    if(slot===3&&this.step==='transport'&&player&&player.x>650&&player.x<850){
      const state=ensureAdventure(this),old={x:player.x,z:player.z},far={x:790,z:-235};
      state.transportReturnAnchor={x:700,z:145,label:'RETURN ANCHOR'};state.transportFarAnchor={...far};
      player.x=far.x;player.z=far.z;player.visualAction='objectSwapDisappear';player.visualActionTime=.45;
      this.battle.burst(old.x,old.z,'#ffd079',22,62);this.battle.burst(far.x,far.z,'#ffd079',22,62);
      this.step='transport-return';this.setObjective('OBJECT SWAP PUT YOU ACROSS THE BREAK','The wheel is back on the road, but Rrvvfo is stranded on the far ledge. Find the separate return anchor and swap back.');
      this.battle.notice('WHEEL RECOVERED • NOW GET BACK',1.6);
      saveLostYearProgress({...loadLostYearProgress(),chapter1TransportWheelRecovered:true,lastCheckpoint:'rrvvfo-road-transport-far'});return true;
    }
    if(slot===3&&this.step==='transport-return'&&player){
      const state=ensureAdventure(this),anchor=state.transportReturnAnchor;if(!anchor)return false;
      const old={x:player.x,z:player.z};player.x=anchor.x;player.z=anchor.z;anchor.x=old.x;anchor.z=old.z;
      player.visualAction='objectSwapDisappear';player.visualActionTime=.45;this.transportFixed=true;
      this.battle.burst(old.x,old.z,'#ffd079',22,62);this.battle.burst(player.x,player.z,'#ffd079',22,62);
      discoverAdventureMission('c1-swap-cache');completeAdventureMission('c1-swap-cache',{rank:'A',reward:'OBJECT SWAP TOKEN'});
      this.showDialogue([
        {speaker:'TRANSPORT DRIVER',speakerClass:'neutral',text:'You got the wheel back and somehow got yourself back too!',tail:'down'},
        {speaker:'RRVVFO',speakerClass:'p1',text:'Yeah. Object Swap likes making the second problem for me.',tail:'down'}
      ],()=>{
        this.mode='hub';this.battle.phase='play';this.step='runaway-cart';
        saveLostYearProgress({...loadLostYearProgress(),transportRescued:true,chapter1TransportReturnComplete:true,chapter1Variety:this.variety,lastCheckpoint:'rrvvfo-road-transport'});
        this.beginRunawayCartRescue();
      });return true;
    }
    return baseCastField.call(this,slot);
  };

  const baseUpdatePrompt=proto.updatePrompt;
  proto.updatePrompt=function(player){
    if(this.step==='route-choice'){
      this.prompt.hidden=false;this.promptTitle.textContent='THREE-WAY JUNCTION';this.promptDetail.textContent='WALK INTO A SIGNED ROAD TO CHOOSE';return;
    }
    if(this.step==='transport-return'){
      this.prompt.hidden=false;this.promptTitle.textContent='RETURN ANCHOR';this.promptDetail.textContent=this.abilityPrompt(3,'OBJECT SWAP');return;
    }
    return baseUpdatePrompt.call(this,player);
  };

  const baseObjectivePoint=proto.objectivePoint;
  proto.objectivePoint=function(){
    if(this.step==='route-choice'||this.step==='route-travel'||this.step==='detour-travel')return null;
    if(this.step==='transport-return')return ensureAdventure(this).transportReturnAnchor;
    return baseObjectivePoint.call(this);
  };

  const baseConnectedZone=proto.connectedZoneId;
  proto.connectedZoneId=function(){
    if(this.step==='transport-return')return'riverside';
    if(this.step==='detour-travel')return'outskirts';
    return baseConnectedZone.call(this);
  };

  const baseDraw=proto.drawHubExtras;
  proto.drawHubExtras=function(){
    baseDraw.call(this);ensureAdventure(this);
    const r=this.battle?.renderer;if(!r)return;const time=(performance?.now?.()||0)/1000;
    if(this.step==='route-choice'&&!this.routeChoice){
      const signs=[
        {z:-315,label:'FOREST',color:'#6bc7ff'},
        {z:0,label:'MAIN',color:'#f1cb77'},
        {z:315,label:'CLIFF',color:'#e49362'}
      ];
      for(const sign of signs){const pulse=1+Math.sin(time*3+sign.z)*.04;r.box({x:248,y:44,z:sign.z,sx:12,sy:88,sz:12,color:'#6d4c32'});r.box({x:248,y:86,z:sign.z,sx:12,sy:44,sz:112,color:sign.color});r.disc({x:258,y:5,z:sign.z,rx:28*pulse,rz:52*pulse,color:sign.color,alpha:.18})}
    }
    if(this.step==='route-travel'&&this.routeChoice==='forest'){
      for(const marker of ensureAdventure(this).forestMarkers){const pulse=1+Math.sin(time*4+marker.x)*.05;r.segment({x:marker.x,y:10,z:marker.z},{x:marker.x,y:68,z:marker.z},{width:5,height:5,color:'#6a4a2e',alpha:.95});r.billboard({x:marker.x,y:80,z:marker.z,size:18*pulse,color:marker.done?'#7a887f':'#70cfff',alpha:marker.done?.18:.72});r.disc({x:marker.x,y:5,z:marker.z,rx:26,rz:20,color:'#70cfff',alpha:marker.done?.06:.18})}
    }
    if(this.step==='route-travel'&&this.routeChoice==='main'){
      for(const marker of ensureAdventure(this).mainMarkers){r.box({x:marker.x,y:17,z:marker.z,sx:34,sy:34,sz:34,color:marker.done?'#77735e':'#d29a48',rotationY:.25});if(!marker.done)r.billboard({x:marker.x,y:62,z:marker.z,size:14,color:'#ffe1a1',alpha:.6})}
    }
    if(this.step==='transport'||this.step==='transport-return'){
      r.box({x:790,y:24,z:-235,sx:54,sy:42,sz:54,color:'#756d60',rotationY:.25});
      const anchor=ensureAdventure(this).transportReturnAnchor;if(anchor){const pulse=1+Math.sin(time*5)*.08;r.billboard({x:anchor.x,y:82,z:anchor.z,size:28*pulse,color:'#fff0a0',alpha:.82});r.disc({x:anchor.x,y:6,z:anchor.z,rx:26,rz:20,color:'#ffd45b',alpha:.25})}
    }
    if(this.step==='lens-ready'||this.step==='detour-travel'){
      for(let i=0;i<5;i++){const x=1015+i*48,z=330+Math.sin(i*.9)*60;r.disc({x,y:5,z,rx:24,rz:18,color:'#e6b965',alpha:.14});if(i===0||i===4)r.billboard({x,y:70,z,size:15,color:'#f0cf82',alpha:.55})}
    }
  };

  return true;
}

function installArenaFireBlastPatch(){
  const proto=ArenaBattle?.prototype;if(!proto||proto[ARENA_FLAG])return false;
  Object.defineProperty(proto,ARENA_FLAG,{value:true});Object.defineProperty(proto,'__pxStoryFireBlastTuned',{value:true});
  const baseLoadout=proto.loadoutForFighter;
  proto.loadoutForFighter=function(fighter){
    const loadout=baseLoadout.call(this,fighter);
    const storyFocus=fighter?.id==='rrvvfo'&&fighter?.storyShotsLocked&&this.root?.classList.contains('storyEngineActive');
    if(!storyFocus)return loadout;
    return loadout.map(ability=>ability?.id==='fireBlast'?{...ability,cost:CHAPTER1_FIRE_BLAST_STORY_FOCUS.energy,cooldown:CHAPTER1_FIRE_BLAST_STORY_FOCUS.cooldown}:ability);
  };
  const baseExecute=proto.executeAbility;
  proto.executeAbility=function(fighter,foe,state){
    const storyFocus=fighter?.id==='rrvvfo'&&fighter?.storyShotsLocked&&this.root?.classList.contains('storyEngineActive');
    if(storyFocus&&state?.ability?.id==='fireBlast'){
      const tune=CHAPTER1_FIRE_BLAST_STORY_FOCUS,aimX=foe.x-fighter.x,aimZ=foe.z-fighter.z,len=Math.hypot(aimX,aimZ)||1;fighter.aimX=aimX/len;fighter.aimZ=aimZ/len;
      this.spawnProjectile(fighter,{speed:tune.projectileSpeed,damage:tune.damage,radius:tune.radius,height:72,life:2.1,color:'#ff6a31',clashPower:tune.clashPower,label:'FIRE BLAST',guardDamage:tune.guardDamage});
      this.audio.play('projectile');this.notice('SHOT • FIRE BLAST • STORY FOCUS');return;
    }
    return baseExecute.call(this,fighter,foe,state);
  };
  return true;
}

const installedRoad=installRoadPatch();
const installedArena=installArenaFireBlastPatch();

globalThis.__PX_CHAPTER1_ADVENTURE_REBUILD__=Object.freeze({
  installed:Boolean(installedRoad||RrvvfoRoadHub?.prototype?.__pxAdventureRebuildInstalled),
  arenaTuning:Boolean(installedArena||ArenaBattle?.prototype?.__pxStoryFireBlastTuned),
  version:CHAPTER1_ADVENTURE_VERSION,
  guidance:CHAPTER1_GUIDANCE,
  routes:CHAPTER1_ROUTES,
  fireBlast:CHAPTER1_FIRE_BLAST_STORY_FOCUS
});

document?.dispatchEvent?.(new CustomEvent('pxchapter1adventurerebuildready',{detail:globalThis.__PX_CHAPTER1_ADVENTURE_REBUILD__}));
