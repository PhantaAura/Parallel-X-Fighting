export const FOCUS_RECOVERY_RULES=Object.freeze({
  startup:.60,
  healPerSecond:5,
  energyPerHp:2,
  maxRecoverableRatio:.20,
  releaseRecovery:.30,
  minimumRecoverable:.05
});

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function initializeFocusRecovery(fighter){
  if(!fighter)return fighter;
  fighter.recoverableHp=Number.isFinite(fighter.recoverableHp)?Math.max(0,fighter.recoverableHp):0;
  fighter.focusRecoveryStartup=Number.isFinite(fighter.focusRecoveryStartup)?Math.max(0,fighter.focusRecoveryStartup):0;
  fighter.focusRecoveryRelease=Number.isFinite(fighter.focusRecoveryRelease)?Math.max(0,fighter.focusRecoveryRelease):0;
  fighter.focusRecovering=Boolean(fighter.focusRecovering);
  fighter.focusRecoveryPulse=Number.isFinite(fighter.focusRecoveryPulse)?Math.max(0,fighter.focusRecoveryPulse):0;
  fighter.focusRecoveredTotal=Number.isFinite(fighter.focusRecoveredTotal)?Math.max(0,fighter.focusRecoveredTotal):0;
  fighter.focusRecoveryChannelHealed=Number.isFinite(fighter.focusRecoveryChannelHealed)?Math.max(0,fighter.focusRecoveryChannelHealed):0;
  fighter.focusRecoverySoundCooldown=Number.isFinite(fighter.focusRecoverySoundCooldown)?Math.max(0,fighter.focusRecoverySoundCooldown):0;
  return fighter;
}

export function resetFocusRecovery(fighter){
  if(!fighter)return fighter;
  fighter.recoverableHp=0;
  fighter.focusRecoveryStartup=0;
  fighter.focusRecoveryRelease=0;
  fighter.focusRecovering=false;
  fighter.focusRecoveryPulse=0;
  fighter.focusRecoveredTotal=0;
  fighter.focusRecoveryChannelHealed=0;
  fighter.focusRecoverySoundCooldown=0;
  return fighter;
}

export function tickFocusRecovery(fighter,dt=0){
  initializeFocusRecovery(fighter);
  fighter.focusRecoveryRelease=Math.max(0,fighter.focusRecoveryRelease-Math.max(0,dt));
  fighter.focusRecoveryPulse=Math.max(0,fighter.focusRecoveryPulse-Math.max(0,dt));
  fighter.focusRecoverySoundCooldown=Math.max(0,fighter.focusRecoverySoundCooldown-Math.max(0,dt));
  return fighter;
}

export function registerRecoverableDamage(fighter,damage,{strong=false}={}){
  initializeFocusRecovery(fighter);
  const maxHp=Math.max(1,Number(fighter.maxHp)||100),actual=Math.max(0,Number(damage)||0),cap=maxHp*FOCUS_RECOVERY_RULES.maxRecoverableRatio;
  if(!actual)return fighter.recoverableHp;
  const retained=strong?fighter.recoverableHp*.72:fighter.recoverableHp;
  fighter.recoverableHp=clamp(retained+actual*.75,0,Math.min(cap,Math.max(0,maxHp-(Number(fighter.hp)||0))));
  return fighter.recoverableHp;
}

export function focusRecoveryAvailability(fighter,{eligible=true}={}){
  initializeFocusRecovery(fighter);
  const maxHp=Math.max(1,Number(fighter.maxHp)||100),hp=Math.max(0,Number(fighter.hp)||0),energy=Math.max(0,Number(fighter.en)||0),minimumEnergy=FOCUS_RECOVERY_RULES.energyPerHp*FOCUS_RECOVERY_RULES.minimumRecoverable;
  if(!eligible)return{available:false,reason:'unsafe'};
  if(fighter.focusRecoveryRelease>0)return{available:false,reason:'release-recovery'};
  if(fighter.recoverableHp<FOCUS_RECOVERY_RULES.minimumRecoverable)return{available:false,reason:'no-recoverable-health'};
  if(hp>=maxHp)return{available:false,reason:'full-health'};
  if(energy<minimumEnergy)return{available:false,reason:'no-energy'};
  return{available:true,reason:'ready'};
}

export function endFocusRecovery(fighter,{applyRecovery=true}={}){
  initializeFocusRecovery(fighter);
  const wasActive=Boolean(fighter.focusRecovering);
  const attempted=wasActive||fighter.focusRecoveryStartup>0;
  fighter.focusRecovering=false;
  fighter.focusRecoveryStartup=0;
  fighter.focusRecoveryChannelHealed=0;
  if(wasActive&&applyRecovery)fighter.focusRecoveryRelease=Math.max(fighter.focusRecoveryRelease,FOCUS_RECOVERY_RULES.releaseRecovery);
  return attempted;
}

export function interruptFocusRecovery(fighter){
  return endFocusRecovery(fighter,{applyRecovery:true});
}

export function channelFocusRecovery(fighter,dt,{eligible=true}={}){
  initializeFocusRecovery(fighter);
  const status=focusRecoveryAvailability(fighter,{eligible});
  if(!status.available){
    const wasActive=Boolean(fighter.focusRecovering);
    fighter.focusRecovering=false;
    fighter.focusRecoveryStartup=0;
    fighter.focusRecoveryChannelHealed=0;
    if(wasActive)fighter.focusRecoveryRelease=Math.max(fighter.focusRecoveryRelease,FOCUS_RECOVERY_RULES.releaseRecovery);
    return{active:false,started:false,healed:0,reason:status.reason,interrupted:wasActive};
  }
  const maxHp=Math.max(1,Number(fighter.maxHp)||100),hp=Math.max(0,Number(fighter.hp)||0),energy=Math.max(0,Number(fighter.en)||0),wasActive=fighter.focusRecovering;
  fighter.focusRecoveryStartup=Math.min(FOCUS_RECOVERY_RULES.startup,fighter.focusRecoveryStartup+Math.max(0,dt));
  if(fighter.focusRecoveryStartup<FOCUS_RECOVERY_RULES.startup)return{active:false,started:false,healed:0,reason:'startup',interrupted:false};
  fighter.focusRecovering=true;
  if(!wasActive)fighter.focusRecoveryChannelHealed=0;
  const heal=Math.max(0,Math.min(FOCUS_RECOVERY_RULES.healPerSecond*Math.max(0,dt),fighter.recoverableHp,maxHp-hp,energy/FOCUS_RECOVERY_RULES.energyPerHp));
  if(heal>0){
    fighter.hp=clamp(hp+heal,0,maxHp);
    fighter.en=clamp(energy-heal*FOCUS_RECOVERY_RULES.energyPerHp,0,100);
    fighter.recoverableHp=Math.max(0,fighter.recoverableHp-heal);
    fighter.focusRecoveredTotal+=heal;
    fighter.focusRecoveryChannelHealed+=heal;
    fighter.focusRecoveryPulse=.16;
  }
  return{active:true,started:!wasActive,healed:heal,reason:heal>0?'healing':'empty',interrupted:false};
}

export function recoverableHealthView(fighter){
  initializeFocusRecovery(fighter);
  const maxHp=Math.max(1,Number(fighter.maxHp)||100),hp=clamp(Number(fighter.hp)||0,0,maxHp),recoverable=clamp(Number(fighter.recoverableHp)||0,0,maxHp-hp);
  return{healthPercent:hp/maxHp*100,recoverablePercent:recoverable/maxHp*100,recoverableHp:recoverable};
}
