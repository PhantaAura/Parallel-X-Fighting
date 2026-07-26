import {clamp,overlaps} from './combat.js';

export const CLASH_BALANCE={
  inputLock:4,
  cooldown:120,
  meterMax:100,
  durations:{melee:105,beam:150,projectile:120,ultimate:180},
  damage:{melee:10,beam:18,projectile:15,ultimate:30}
};

export const createClashState=()=>({
  active:false,type:null,fighters:[],meter:0,frame:0,duration:0,
  point:{x:480,y:230},power:[0,0],inputLocks:[0,0],winner:0
});

export function clearClash(world){
  if(!world.clash)world.clash=createClashState();
  Object.assign(world.clash,createClashState());
}

export function compatibleMeleeClash(first,second){
  return first==='heavy'&&second==='heavy';
}

export function compatibleProjectileClash(first,second){
  if(!first||!second||first.owner===second.owner)return false;
  if(first.type==='beam'&&second.type==='beam')return true;
  return (first.clashPower||first.damage)>=18&&(second.clashPower||second.damage)>=18;
}

function fighterPower(fighter,attackPower=10){
  const buff=fighter.aura?1.12:1;
  return attackPower*(fighter.c?.p||1)*buff+(fighter.en||0)*.045;
}

export function startClash(world,type,first,second,options={}){
  const forced=!!world.training?.forceNextClash;
  if(!first||!second||first.hp<=0||second.hp<=0||(!forced&&(first.clashCooldown||second.clashCooldown))||world.clash?.active)return false;
  if(forced)world.training.forceNextClash=false;
  const duration=CLASH_BALANCE.durations[type]||CLASH_BALANCE.durations.melee;
  world.clash=Object.assign(createClashState(),{
    active:true,type,fighters:[first,second],duration,frame:duration,
    point:options.point||{x:(first.x+second.x+second.w)/2,y:(first.y+second.y)/2},
    power:[fighterPower(first,options.powerA),fighterPower(second,options.powerB)]
  });
  world.clash.meter=clamp((world.clash.power[0]-world.clash.power[1])*.7,-18,18);
  first.cancelStartup?.();second.cancelStartup?.();
  first.pendingUltimate=second.pendingUltimate=false;
  first.ultimateStartup=second.ultimateStartup=0;
  first.vx=-first.face*3;second.vx=-second.face*3;
  world.effects?.add({t:type==='beam'?'beamClash':'clash',x:world.clash.point.x,y:world.clash.point.y,c:'#ffffff',l:duration});
  world.effects?.burst(world.clash.point.x,world.clash.point.y,'#ffffff',type==='ultimate'?48:28);
  world.shake=Math.max(world.shake,world.reducedShake?(type==='ultimate'?4:3):type==='ultimate'?12:8);
  world.hitstop=type==='ultimate'?10:6;
  world.sound?.(type==='beam'?'beamClash':'clash');
  return true;
}

export function tryMeleeClash(world,attacker,defender,kind,hitbox){
  if(!compatibleMeleeClash(kind,defender.pending)||attacker.clashCooldown||defender.clashCooldown)return false;
  const move=defender.pendingMove;if(!move)return false;
  const other={x:defender.face>0?defender.x+defender.w:defender.x-move.range,y:defender.y+14,w:move.range,h:52};
  if(!overlaps(hitbox,other))return false;
  return startClash(world,'melee',attacker,defender,{powerA:attacker.pendingMove?.damage||12,powerB:move.damage||12});
}

export function tryUltimateClash(world,attacker,defender,power=30){
  if(!defender.pendingUltimate||!defender.ultimateStartup)return false;
  return startClash(world,'ultimate',attacker,defender,{powerA:power,powerB:30});
}

export function tryProjectileClash(world,projectile){
  if(world.clash?.active||projectile.dead)return false;
  const rival=world.projectiles.find(other=>other!==projectile&&!other.dead&&compatibleProjectileClash(projectile,other)&&overlaps(
    {x:projectile.x-projectile.size,y:projectile.y-projectile.size,w:projectile.size*2,h:projectile.size*2},
    {x:other.x-other.size,y:other.y-other.size,w:other.size*2,h:other.size*2}
  ));
  if(!rival)return false;
  projectile.dead=rival.dead=true;
  const type=projectile.type==='beam'&&rival.type==='beam'?'beam':'projectile';
  return startClash(world,type,projectile.owner,rival.owner,{
    point:{x:(projectile.x+rival.x)/2,y:(projectile.y+rival.y)/2},
    powerA:projectile.clashPower||projectile.damage,
    powerB:rival.clashPower||rival.damage
  });
}

export function cpuClashContribution(difficulty='normal',fighter,frame=0){
  const profile={
    easy:{interval:18,press:2},
    normal:{interval:12,press:3},
    hard:{interval:8,press:3.8}
  }[difficulty]||{interval:12,press:3};
  if(frame%profile.interval)return 0;
  const personality=fighter?.id==='bark'?1.12:fighter?.id==='wade'?0.94:fighter?.id==='phanta'?1.06:1;
  return profile.press*personality;
}

function safeClashDamage(fighter,amount){
  const actual=Math.min(Math.max(0,fighter.hp-1),amount/(fighter.c?.d||1));
  fighter.hp-=actual;return actual;
}

export function finishClash(world,winner=0){
  const clash=world.clash;if(!clash?.active)return;
  const [first,second]=clash.fighters,force=clash.type==='ultimate'?17:clash.type==='beam'?13:10;
  if(!winner){
    first.vx=-first.face*force*.65;second.vx=-second.face*force*.65;
    first.stun=second.stun=18;
  }else{
    const victor=winner===1?first:second,loser=winner===1?second:first;
    loser.vx=victor.face*force;loser.stun=clash.type==='ultimate'?42:30;
    const damage=safeClashDamage(loser,CLASH_BALANCE.damage[clash.type]||10);world.statistics?.add(victor.side,'clashes');world.statistics?.recordDamage(victor.side,damage);world.notifications?.push(`${clash.type.toUpperCase()} CLASH WON`,{important:true,key:`clash-${victor.side}`});
  }
  first.clashCooldown=second.clashCooldown=CLASH_BALANCE.cooldown;
  world.effects?.burst(clash.point.x,clash.point.y,winner===1?first.c.a:winner===2?second.c.a:'#ffffff',36);
  world.shake=Math.max(world.shake,world.reducedShake?(clash.type==='ultimate'?5:3):clash.type==='ultimate'?14:9);
  clash.winner=winner;
  clash.active=false;
}

export function updateClash(world,contributions=[0,0]){
  const clash=world.clash;if(!clash?.active)return false;
  const [first,second]=clash.fighters;
  if(!first||!second||first.hp<=0||second.hp<=0){clearClash(world);return false}
  clash.inputLocks=clash.inputLocks.map(value=>Math.max(0,value-1));
  contributions.forEach((amount,index)=>{
    if(amount>0&&!clash.inputLocks[index]){
      clash.meter=clamp(clash.meter+(index===0?1:-1)*Math.min(6,amount),-CLASH_BALANCE.meterMax,CLASH_BALANCE.meterMax);
      clash.inputLocks[index]=CLASH_BALANCE.inputLock;
    }
  });
  const statDrift=clamp((clash.power[0]-clash.power[1])*.006,-.12,.12);
  clash.meter=clamp(clash.meter+statDrift,-CLASH_BALANCE.meterMax,CLASH_BALANCE.meterMax);
  if(!world.training?.infiniteClash)clash.frame--;
  if(Math.abs(clash.meter)>=CLASH_BALANCE.meterMax||clash.frame<=0){
    finishClash(world,clash.meter>8?1:clash.meter<-8?2:0);
  }
  return clash.active;
}
