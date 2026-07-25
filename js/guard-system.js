import {clamp} from './combat.js';

export const DEFENSE_BALANCE={
  maxGuard:100,
  perfectBlockFrames:6,
  guardBreakStun:45,
  guardBreakRecovery:38,
  guardRegenDelay:75,
  guardRegenPerFrame:.22,
  throwRange:62,
  throwStartup:7,
  throwRecovery:24,
  throwProtection:90,
  breakerCost:85,
  breakerCooldown:600
};

const GUARD_DAMAGE={light:6,heavy:16,launcher:19,air:8,special:21,ultimate:32,counter:12,punishment:18};
const CHIP={light:0,air:.01,heavy:.07,launcher:.08,special:.13,ultimate:.18,punishment:.1,counter:.04};

export function resetDefenseState(fighter){
  Object.assign(fighter,{
    guard:DEFENSE_BALANCE.maxGuard,guardMax:DEFENSE_BALANCE.maxGuard,guardRegenDelay:0,
    guardBreakStun:0,guardBreakRecovery:0,perfectBlockWindow:0,wasBlocking:false,
    guardDamageLast:0,throwStartup:0,throwRecovery:0,throwProtection:0,grabbed:0,
    pendingThrow:false,breakerUsed:false,breakerCooldown:0,dashRecovery:0
  });
}

export function guardDamageFor(kind,baseDamage=10){
  return (GUARD_DAMAGE[kind]||10)*clamp(baseDamage/10,.7,1.65);
}

export function chipFactorFor(kind){return CHIP[kind]??.08}

export function updateDefenseState(fighter,command){
  for(const key of ['guardBreakRecovery','throwRecovery','throwProtection','grabbed','breakerCooldown','dashRecovery'])if(fighter[key]>0)fighter[key]--;
  if(fighter.guardBreakStun>0){
    fighter.guardBreakStun--;fighter.block=0;fighter.wasBlocking=false;fighter.perfectBlockWindow=0;
    if(!fighter.guardBreakStun){fighter.guard=Math.max(fighter.guard,32);fighter.guardBreakRecovery=DEFENSE_BALANCE.guardBreakRecovery}
    return;
  }
  const canBlock=fighter.grounded&&fighter.stun<=0&&!fighter.knockdown&&!fighter.getup&&!fighter.windup&&!fighter.throwStartup&&!fighter.counterStartup&&!fighter.counterActive&&!fighter.counterRecovery&&!fighter.guardBreakRecovery;
  const wantsBlock=!!command.down('b')&&canBlock;
  if(wantsBlock&&!fighter.wasBlocking)fighter.perfectBlockWindow=DEFENSE_BALANCE.perfectBlockFrames;
  else if(fighter.perfectBlockWindow>0)fighter.perfectBlockWindow--;
  fighter.block=wantsBlock;fighter.wasBlocking=wantsBlock;
  const regenAllowed=fighter.world.training?.guardRegen!==false&&!fighter.block&&!fighter.attackCd&&!fighter.windup&&!fighter.stun&&!fighter.knockdown&&!fighter.getup&&!fighter.grabbed;
  if(fighter.guardRegenDelay>0)fighter.guardRegenDelay--;
  else if(regenAllowed)fighter.guard=clamp(fighter.guard+DEFENSE_BALANCE.guardRegenPerFrame,0,fighter.guardMax);
  if(fighter.world.training?.infiniteGuard)fighter.guard=fighter.guardMax;
}

export function resolveBlockedHit(defender,attacker,kind,baseDamage){
  const forcedPerfect=defender.world.training?.enabled&&defender.side===2&&defender.world.training?.dummy==='perfect';
  const perfect=forcedPerfect||defender.perfectBlockWindow>0;
  const guardDamage=guardDamageFor(kind,baseDamage)*(perfect?.12:1);
  defender.guard=clamp(defender.guard-guardDamage,0,defender.guardMax);
  defender.guardDamageLast=guardDamage;
  defender.guardRegenDelay=DEFENSE_BALANCE.guardRegenDelay;
  defender.perfectBlockWindow=0;
  if(perfect){
    defender.en=clamp(defender.en+9,0,100);
    if(attacker)attacker.vx=-attacker.face*5;
    defender.world.effects?.add({t:'perfectBlock',x:defender.x+defender.w/2,y:defender.y+38,c:'#bdfbff',l:18});
    defender.world.effects?.burst(defender.x+defender.w/2,defender.y+38,'#bdfbff',24);
    defender.world.sound?.('perfectBlock');
  }
  let broken=false;
  if(defender.guard<=0){
    broken=true;defender.block=0;defender.wasBlocking=false;defender.guardBreakStun=DEFENSE_BALANCE.guardBreakStun;
    defender.guardRegenDelay=DEFENSE_BALANCE.guardBreakStun+DEFENSE_BALANCE.guardRegenDelay;
    defender.world.effects?.add({t:'guardBreak',x:defender.x+defender.w/2,y:defender.y+38,c:'#ffdd75',l:30});
    defender.world.effects?.burst(defender.x+defender.w/2,defender.y+38,'#ffdd75',38);
    defender.world.shake=Math.max(defender.world.shake,defender.world.reducedShake?3:9);defender.world.sound?.('guardBreak');
  }
  return{perfect,broken,guardDamage,chipFactor:perfect?.01:chipFactorFor(kind)};
}

export function defensiveDashFrames(id){
  return id==='creed'?14:id==='phanta'?12:id==='rrvvfo'?7:id==='wade'?6:3;
}
