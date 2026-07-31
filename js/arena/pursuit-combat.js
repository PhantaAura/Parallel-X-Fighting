export const PURSUIT_TUNING=Object.freeze({
  launcherWindow:.72,
  heavyWindow:.58,
  chaseMin:.24,
  chaseMax:.52,
  followupWindow:.62,
  finisherWindow:.36,
  bufferGrace:.08,
  escapeCost:15,
  escapeCooldown:1.35,
  escapeInvulnerability:.24,
  escapePunishRecovery:.22,
  wallSplatStun:.58,
  groundBounceVelocity:250,
  groundBounceStun:.46,
  pursuitLightHitstopFrames:2,
  pursuitHeavyHitstopFrames:4,
  wallSplatHitstopFrames:5,
  groundBounceHitstopFrames:4,
  techHitstopFrames:2,
  cameraZoomScale:.94,
  cameraEaseIn:.10,
  cameraEaseOut:.18,
  lockOnDuration:.25,
  promptMobileLinger:.30
});

export const DASH_IDENTITY=Object.freeze({
  rrvvfo:Object.freeze({duration:.22,cooldown:.30,invulnerability:.11,sideFeint:22,label:'OBJECT-SWAP FEINT',cue:'dashRrvvfo',trail:'#ff8a32',secondary:'#ffd079'}),
  revvfo:Object.freeze({duration:.22,cooldown:.28,invulnerability:.10,pursuitBlink:44,label:'WARP CHASE',cue:'dashRevvfo',trail:'#9e53ff',secondary:'#e26bff'}),
  wade:Object.freeze({duration:.25,cooldown:.20,invulnerability:.105,speedScale:1.10,label:'LIGHTNING STEP',cue:'dashWade',trail:'#72e7ff',secondary:'#ffffff'}),
  bark:Object.freeze({duration:.18,cooldown:.42,invulnerability:.15,speedScale:.94,armorFrames:.18,label:'ARMORED STEP',cue:'dashBark',trail:'#c99a58',secondary:'#ead09a'}),
  phanta:Object.freeze({duration:.22,cooldown:.27,invulnerability:.14,sideFeint:30,label:'PHANTOM FEINT',cue:'dashPhanta',trail:'#8654db',secondary:'#d6b9ff'}),
  creed:Object.freeze({duration:.24,cooldown:.34,invulnerability:.18,sideFeint:34,label:'EVASIVE SHIFT',cue:'dashCreed',trail:'#dcecff',secondary:'#ffffff'}),
  default:Object.freeze({duration:.21,cooldown:.32,invulnerability:.10,speedScale:1,label:'DASH',cue:'dash',trail:'#8cecff',secondary:'#ffffff'})
});

export function dashIdentityFor(id){return DASH_IDENTITY[id]||DASH_IDENTITY.default}
export function pursuitWindowFor(kind){return kind==='launcher'?PURSUIT_TUNING.launcherWindow:PURSUIT_TUNING.heavyWindow}
export function pursuitDurationFor(distance,pursuitSpeed=950,id='default'){
  const identity=id==='wade'?.90:id==='revvfo'?.94:id==='bark'?1.08:1;
  return Math.max(PURSUIT_TUNING.chaseMin,Math.min(PURSUIT_TUNING.chaseMax,(Math.max(0,Number(distance)||0)/Math.max(1,Number(pursuitSpeed)||950)+.10)*identity));
}
export function canWallSplat({ringOutEnabled=false,nearWall=false,kind='',used=false}={}){
  return !ringOutEnabled&&!used&&nearWall&&['light3','heavy','launcher','airHeavy','pursuitHeavy'].includes(kind);
}
export function canGroundBounce({kind='',airborne=false,used=false,wallSplat=false}={}){
  return !used&&!wallSplat&&airborne&&['airHeavy','pursuitHeavy'].includes(kind);
}
export function pursuitTechAvailable(energy,cooldown=0){return Number(energy)>=PURSUIT_TUNING.escapeCost&&Number(cooldown)<=0}
export function pursuitPromptText({mode='full',incoming=false,energy=0,chasing=false,attackReady=false,buffered='',followup=false,finisher=false,window=false}={}){
  if(mode==='off')return'';
  const techReady=pursuitTechAvailable(energy);
  if(incoming)return mode==='minimal'?(techReady?'TECH READY':'TECH'):`DASH • PURSUIT TECH • ${PURSUIT_TUNING.escapeCost} ENERGY${techReady?' • READY':' • NEED ENERGY'}`;
  if(chasing)return mode==='minimal'?(buffered||attackReady?'ATTACK READY':'LOCKED ON'):`PURSUIT • ${buffered?`${String(buffered).toUpperCase()} BUFFERED`:attackReady?'ATTACK READY • BUFFER LIGHT OR HEAVY':'LOCKED ON'}`;
  if(finisher)return mode==='minimal'?'HEAVY READY':'HEAVY • LINK PURSUIT FINISHER';
  if(followup)return mode==='minimal'?'ATTACK READY':'LIGHT • CONTROL FOLLOW-UP   |   HEAVY • FINISHER';
  if(window)return mode==='minimal'?'DASH':'DASH • START PURSUIT';
  return'';
}
