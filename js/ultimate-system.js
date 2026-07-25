import {clamp} from './combat.js';
import {focusCamera,freezeFrame,impactShake,restoreCamera} from './camera-system.js';

export const ULTIMATE_BALANCE={cost:90,cooldown:300,minDamage:25,maxDamage:38};

export const ULTIMATES={
  rrvvfo:{name:'Fire Awakening: Solar Weave',pattern:'solar',color:'#fff8df',accent:'#45cfff',damage:34,startup:24,recovery:44,range:430,duration:210,zoom:1.34},
  revvfo:{name:'Completed Astrylte Distortion',pattern:'astrylte',color:'#ff5ad9',accent:'#9d52ff',damage:35,startup:25,recovery:48,range:390,duration:210,zoom:1.36},
  wade:{name:'Thunderstorm Rush',pattern:'lightning',color:'#d8fbff',accent:'#48bfff',damage:30,startup:16,recovery:34,range:300,duration:150,zoom:1.31},
  bark:{name:'Earth Sovereign Impact',pattern:'earth',color:'#e0bd7a',accent:'#79502b',damage:36,startup:30,recovery:52,range:175,duration:190,zoom:1.28},
  alt:{name:'Rage: Fist of Punishment',pattern:'rage',color:'#b8ff70',accent:'#ff552e',damage:35,startup:22,recovery:48,range:145,duration:175,zoom:1.38},
  robert:{name:'Ice Master Dominion',pattern:'ice',color:'#e8fbff',accent:'#73dfff',damage:29,startup:26,recovery:45,range:390,duration:195,zoom:1.28},
  virek:{name:'Emerald Rivalry Lance',pattern:'emerald',color:'#8affc8',accent:'#00a97b',damage:33,startup:23,recovery:43,range:360,duration:180,zoom:1.34},
  shadow:{name:'Disciplined Cosmic Palm',pattern:'sage',color:'#fff5b0',accent:'#c9a7ff',damage:31,startup:21,recovery:40,range:260,duration:180,zoom:1.3},
  phanta:{name:'Phantom Multiplication',pattern:'phantom',color:'#e9b5ff',accent:'#8d2cff',damage:34,startup:20,recovery:42,range:350,duration:200,zoom:1.37},
  creed:{name:'After Time Moved',pattern:'time',color:'#aefaff',accent:'#153e51',damage:30,startup:17,recovery:35,range:310,duration:155,zoom:1.4},
  sage:{name:'Effortless Serious Technique',pattern:'lazy',color:'#fff6a0',accent:'#a98cff',damage:37,startup:28,recovery:50,range:280,duration:220,zoom:1.3},
  raggie:{name:'Paper World Fold',pattern:'paper',color:'#fffdf1',accent:'#ffd53d',damage:28,startup:19,recovery:38,range:360,duration:175,zoom:1.28},
  jimmy:{name:'Guardian Sealing Array',pattern:'seal',color:'#ffca83',accent:'#2b1b12',damage:26,startup:25,recovery:40,range:320,duration:185,zoom:1.25},
  jonathan:{name:'Reckless Stick Catastrophe',pattern:'wood',color:'#ffe0ab',accent:'#9b5b2c',damage:29,startup:18,recovery:42,range:210,duration:160,zoom:1.33},
  rev:{name:'Maximum Mechanical Ovation',pattern:'mechanical',color:'#d9f3ff',accent:'#ff4e87',damage:32,startup:23,recovery:44,range:400,duration:185,zoom:1.32}
};

export const createCinematicState=()=>({active:false,attacker:null,target:null,data:null,frame:0,duration:0,impactFrame:0,hitApplied:false,mode:'full'});

export function clearCinematic(world){
  if(!world.cinematic)world.cinematic=createCinematicState();
  Object.assign(world.cinematic,createCinematicState());
  restoreCamera(world);
}

function modeDuration(data,mode='full',local=false){
  if(mode==='off')return 1;
  if(mode==='short'||local)return Math.min(84,Math.round(data.duration*.48));
  return data.duration;
}

function applyIdentityBuff(attacker,target){
  switch(attacker.id){
    case'revvfo':attacker.aura=Math.max(attacker.aura,240);break;
    case'bark':attacker.armor=Math.max(attacker.armor,210);break;
    case'alt':attacker.aura=Math.max(attacker.aura,240);break;
    case'robert':target.freeze=Math.max(target.freeze,70);break;
    case'virek':attacker.aura=Math.max(attacker.aura,210);break;
    case'shadow':attacker.hp=clamp(attacker.hp+8,0,100);attacker.aura=Math.max(attacker.aura,180);break;
    case'phanta':attacker.aura=Math.max(attacker.aura,220);break;
    case'creed':attacker.inv=Math.max(attacker.inv,36);break;
    case'sage':attacker.hp=clamp(attacker.hp+10,0,100);attacker.aura=Math.max(attacker.aura,220);break;
    case'raggie':attacker.inv=Math.max(attacker.inv,60);break;
    case'jimmy':target.freeze=Math.max(target.freeze,45);break;
  }
}

export function beginCinematicUltimate(world,attacker,target){
  const data=ULTIMATES[attacker.id];if(!data||!target)return false;
  const distance=Math.abs(target.x-attacker.x),inRange=distance<=data.range;
  if(!inRange){
    attacker.ultimateRecovery=data.recovery;
    world.effects?.add({t:'ultimateMiss',x:attacker.x+24,y:attacker.y+35,c:data.color,l:24});
    return false;
  }
  const duration=modeDuration(data,world.cinematicMode,world.localMode),impactFrame=Math.max(1,Math.round(duration*.42));
  world.cinematic=Object.assign(createCinematicState(),{active:true,attacker,target,data,frame:duration,duration,impactFrame,mode:world.cinematicMode||'full'});
  focusCamera(world,attacker,target,data.zoom);
  world.effects?.add({t:'ultimateAura',pattern:data.pattern,x:attacker.x+24,y:attacker.y+40,c:data.color,a:data.accent,l:duration});
  world.effects?.burst(attacker.x+24,attacker.y+40,data.color,42);
  world.sound?.(82,.22,'sawtooth',.05);freezeFrame(world,8);
  return true;
}

function applyImpact(world,cinematic){
  const {attacker,target,data}=cinematic;
  const before=target.hp,actual=target.hit(data.damage*attacker.c.p,attacker.face*(data.damage>33?14:10),'ultimate',attacker,{hitstun:34});
  if(before-target.hp>ULTIMATE_BALANCE.maxDamage)target.hp=before-ULTIMATE_BALANCE.maxDamage;
  applyIdentityBuff(attacker,target);
  world.effects?.add({t:'ultimateImpact',pattern:data.pattern,x:target.x+24,y:target.y+40,c:data.color,a:data.accent,l:48});
  world.effects?.burst(target.x+24,target.y+40,data.accent,54);
  impactShake(world,data.damage>34?14:11,world.reducedShake);freezeFrame(world,10);
  world.sound?.(58,.18,'square',.06);
  return actual;
}

export function updateCinematic(world){
  const cinematic=world.cinematic;if(!cinematic?.active)return false;
  if(!cinematic.attacker||!cinematic.target||cinematic.attacker.hp<=0||cinematic.target.hp<=0){clearCinematic(world);return false}
  const elapsed=cinematic.duration-cinematic.frame;
  if(!cinematic.hitApplied&&elapsed>=cinematic.impactFrame){cinematic.hitApplied=true;applyImpact(world,cinematic)}
  cinematic.frame--;
  if(cinematic.frame<=0){
    cinematic.attacker.ultimateRecovery=cinematic.data.recovery;
    clearCinematic(world);return false;
  }
  return true;
}

export function drawCinematicOverlay(ctx,cinematic,width,height){
  if(!cinematic?.active||cinematic.mode==='off')return;
  const {data,attacker,frame,duration}=cinematic,progress=1-frame/duration;
  ctx.save();ctx.fillStyle=`rgba(2,3,10,${.2+Math.sin(progress*Math.PI)*.38})`;ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#02040d';ctx.fillRect(0,0,width,34);ctx.fillRect(0,height-34,width,34);
  ctx.textAlign='center';ctx.shadowColor=data.accent;ctx.shadowBlur=18;ctx.fillStyle=data.color;ctx.font='1000 27px Segoe UI';ctx.fillText(attacker.c.n.toUpperCase(),width/2,68);
  ctx.font='900 15px Segoe UI';ctx.fillStyle='#fff';ctx.fillText(data.name.toUpperCase(),width/2,91);
  ctx.restore();
}
