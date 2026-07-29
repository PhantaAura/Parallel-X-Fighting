import {resetCombo} from './combat.js';
import {clearClash} from './clash-system.js';
import {clearCinematic} from './ultimate-system.js';

export const trainingState={enabled:false,infiniteHealth:true,infiniteEnergy:true,infiniteGuard:false,guardRegen:true,perfectBlockPractice:false,infiniteClash:false,forceNextClash:false,dummy:'never',stationaryBlock:false,inputHistory:[],afterFirstHit:false};
// Keep the history dense: trim only after the requested 20-action window fills.
export function recordInput(label){trainingState.inputHistory.unshift(label);if(trainingState.inputHistory.length>20)trainingState.inputHistory.length=20}
export function clearTraining(){trainingState.inputHistory.length=0;trainingState.afterFirstHit=false;trainingState.forceNextClash=false}
export function resetTrainingClash(world){clearClash(world);trainingState.forceNextClash=false}
export function resetTrainingWorld(world,input){
  world.timers.cancelAll();world.projectiles.length=0;world.effects.clear();resetTrainingClash(world);clearCinematic(world);world.shake=0;world.hitstop=0;trainingState.afterFirstHit=false;
  for(const fighter of world.fighters){fighter.resetRuntime();resetCombo(fighter.combo)}
  input?.clearBuffers?.();
}
export function resetTrainingPosition(world,preset='center'){
  const [one,two]=world.fighters;if(!one||!two)return false;const positions={center:[world.width*.34,world.width*.61],left:[35,180],right:[world.width-230,world.width-85]},chosen=positions[preset]||positions.center;
  world.timers.cancelAll();world.projectiles.length=0;world.effects.clear();resetTrainingClash(world);clearCinematic(world);world.shake=world.hitstop=0;
  for(const [index,fighter] of world.fighters.entries()){fighter.resetRuntime();fighter.x=chosen[index];fighter.y=world.ground-fighter.h;resetCombo(fighter.combo)}trainingState.afterFirstHit=false;return true;
}
export function swapTrainingSides(world){const [one,two]=world.fighters;if(!one||!two)return false;[one.x,two.x]=[two.x,one.x];one.face=two.x>one.x?1:-1;two.face=one.x>two.x?1:-1;return true}
export function refillTraining(world,resource='all'){for(const fighter of world.fighters){if(resource==='all'||resource==='health')fighter.hp=100;if(resource==='all'||resource==='energy')fighter.en=100;if(resource==='all'||resource==='guard')fighter.guard=fighter.guardMax}return true}
export function clearTrainingState(world,type='all'){
  if(type==='all'||type==='cooldowns')for(const fighter of world.fighters)for(const key of ['attackCd','specialCd','ultCd','dashCd','clashCooldown','lensCooldown','agonyCooldown','breakerCooldown','counterCd'])fighter[key]=0;
  if(type==='all'||type==='projectiles'){world.timers.cancelAll();world.projectiles.length=0}
  if(type==='all'||type==='effects')world.effects.clear();
  if(type==='all'||type==='lens'){for(const fighter of world.fighters)fighter.lens=0;world.effects.effects=world.effects.effects.filter(effect=>!['lens','dodge'].includes(effect.t))}
  if(type==='all'||type==='agony'){world.timers.cancelAll();world.projectiles=world.projectiles.filter(projectile=>!projectile.volleyId);world.effects.effects=world.effects.effects.filter(effect=>effect.t!=='agonyClone');for(const fighter of world.fighters){fighter.agonyActiveVolley=false;fighter.agonyVolleyFired=false}}
  if(type==='all'||type==='swap'){for(const fighter of world.fighters)if(String(fighter.visualAction||'').startsWith('objectSwap')){fighter.visualAction=null;fighter.visualActionTimer=0}world.effects.effects=world.effects.effects.filter(effect=>!String(effect.t).toLowerCase().includes('swap'))}
  if(type==='all'||type==='combo')for(const fighter of world.fighters){resetCombo(fighter.combo);fighter.lightChain=0;fighter.lightChainTimer=0;fighter.chainLockout=0}
  trainingState.afterFirstHit=false;return true;
}
export function exitTrainingWorld(world,input){resetTrainingWorld(world);input?.clear?.();trainingState.enabled=false;clearTraining()}
export function setTrainingSetting(key,value,...controls){trainingState[key]=value;for(const control of controls){if(!control)continue;if('checked'in control&&typeof value==='boolean')control.checked=value;else control.value=value}}
export function dummyCommand(fighter){
  const mode=trainingState.dummy,block=['always','perfect'].includes(mode)||(mode==='after'&&trainingState.afterFirstHit)||(mode==='stationary'&&trainingState.stationaryBlock)||(mode==='random'&&fighter?.tick%180<55);
  return{
    down:action=>action==='b'&&block||action==='l'&&mode==='walk'&&fighter?.tick%160<80||action==='r'&&mode==='walk'&&fighter?.tick%160>=80,
    pressed:action=>{if(action==='q'&&(mode==='breaker'||mode==='random')&&fighter?.stun>0)return true;if(action==='h'&&trainingState.perfectBlockPractice&&fighter?.tick%120===0)return true;if(action==='j'&&mode==='jump'&&fighter?.grounded&&fighter?.tick%120===0)return true;if(action==='a'&&mode==='counterattack'&&trainingState.afterFirstHit){trainingState.afterFirstHit=false;return true}return action==='t'&&mode==='throw'&&fighter?.tick%90===0}
  };
}
