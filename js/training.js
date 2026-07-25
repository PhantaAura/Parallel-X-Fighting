export const trainingState={enabled:false,infiniteHealth:true,infiniteEnergy:true,dummy:'never',showHitboxes:false,inputHistory:[]};
export function recordInput(label){trainingState.inputHistory.unshift(label);trainingState.inputHistory.length=10}
export function clearTraining(){trainingState.inputHistory.length=0}
export function resetTrainingFighters(fighters,ground){fighters.forEach((f,i)=>{f.x=i?762:150;f.y=ground-f.h;f.vx=f.vy=f.stun=f.knockdown=f.getup=f.windup=f.juggles=0;f.grounded=1;f.pending=null;f.hp=100;f.en=100;if(f.combo){f.combo.hits=f.combo.damage=f.combo.timer=0;f.combo.scale=1}})}
