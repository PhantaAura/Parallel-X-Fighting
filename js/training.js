import {resetCombo} from './combat.js';

export const trainingState={enabled:false,infiniteHealth:true,infiniteEnergy:true,dummy:'never',stationaryBlock:false,inputHistory:[],afterFirstHit:false};
export function recordInput(label){trainingState.inputHistory.unshift(label);trainingState.inputHistory.length=10}
export function clearTraining(){trainingState.inputHistory.length=0;trainingState.afterFirstHit=false}
export function resetTrainingWorld(world){
  world.timers.cancelAll();world.projectiles.length=0;world.effects.clear();world.shake=0;world.hitstop=0;trainingState.afterFirstHit=false;
  for(const fighter of world.fighters){fighter.resetRuntime();resetCombo(fighter.combo)}
}
export function exitTrainingWorld(world,input){resetTrainingWorld(world);input?.clear?.();trainingState.enabled=false;clearTraining()}
export function setTrainingSetting(key,value,...controls){trainingState[key]=value;for(const control of controls){if(!control)continue;if('checked'in control&&typeof value==='boolean')control.checked=value;else control.value=value}}
export function dummyCommand(){
  const block=trainingState.dummy==='always'||(trainingState.dummy==='after'&&trainingState.afterFirstHit)||(trainingState.dummy==='stationary'&&trainingState.stationaryBlock);
  return{down:action=>action==='b'&&block,pressed:()=>false};
}
