export const PURSUIT_TUNING=Object.freeze({
  launcherWindow:.72,
  heavyWindow:.58,
  chaseMin:.24,
  chaseMax:.52,
  followupWindow:.58,
  finisherWindow:.34,
  escapeCost:18,
  escapeCooldown:1.2,
  escapeInvulnerability:.22,
  wallSplatStun:.58,
  groundBounceVelocity:250,
  groundBounceStun:.46
});

export const DASH_IDENTITY=Object.freeze({
  rrvvfo:Object.freeze({duration:.22,cooldown:.30,invulnerability:.11,sideFeint:22,label:'OBJECT-SWAP FEINT'}),
  revvfo:Object.freeze({duration:.22,cooldown:.28,invulnerability:.10,pursuitBlink:44,label:'WARP CHASE'}),
  wade:Object.freeze({duration:.25,cooldown:.22,invulnerability:.105,speedScale:1.08,label:'LIGHTNING STEP'}),
  bark:Object.freeze({duration:.18,cooldown:.42,invulnerability:.15,speedScale:.94,armorFrames:.18,label:'ARMORED STEP'}),
  phanta:Object.freeze({duration:.22,cooldown:.27,invulnerability:.14,sideFeint:30,label:'PHANTOM FEINT'}),
  creed:Object.freeze({duration:.24,cooldown:.34,invulnerability:.18,sideFeint:34,label:'EVASIVE SHIFT'}),
  default:Object.freeze({duration:.21,cooldown:.32,invulnerability:.10,speedScale:1,label:'DASH'})
});

export function dashIdentityFor(id){return DASH_IDENTITY[id]||DASH_IDENTITY.default}
export function pursuitWindowFor(kind){return kind==='launcher'?PURSUIT_TUNING.launcherWindow:PURSUIT_TUNING.heavyWindow}
export function pursuitDurationFor(distance,pursuitSpeed=950,id='default'){
  const identity=id==='wade'?.92:id==='revvfo'?.94:id==='bark'?1.08:1;
  return Math.max(PURSUIT_TUNING.chaseMin,Math.min(PURSUIT_TUNING.chaseMax,(Math.max(0,Number(distance)||0)/Math.max(1,Number(pursuitSpeed)||950)+.10)*identity));
}
export function canWallSplat({ringOutEnabled=false,nearWall=false,kind='',used=false}={}){
  return !ringOutEnabled&&!used&&nearWall&&['light3','heavy','launcher','airHeavy','pursuitHeavy'].includes(kind);
}
export function canGroundBounce({kind='',airborne=false,used=false,wallSplat=false}={}){
  return !used&&!wallSplat&&airborne&&['airHeavy','pursuitHeavy'].includes(kind);
}
