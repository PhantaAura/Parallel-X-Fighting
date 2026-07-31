import {aimVector,blockFacesAttacker,clamp,hitVolumeConnects,lerp,normalizeMovement,projectileConnects,rotateToward} from './arena-math.js';
import {clampToStage,getArenaStage,listArenaStages,outsideStageProjectileBounds,stageProfile,stageWallAvoidance} from './arena-stages.js?v=29a31-core-feel-character-fantasy-20260731';
import {drawArenaStage} from './arena-stage-renderer.js';
import {WebGLArenaRenderer} from './webgl-renderer.js';
import {ArenaControlManager} from './arena-controls.js?v=29a31-core-feel-character-fantasy-20260731';
import {ABILITY_CATEGORY,ARENA_NORMAL_PROFILES,SPECIAL_CATEGORIES,abilityCategory,abilityTiming,arenaAttackFor,fighterFeelFor} from './arena-combat-data.js?v=29a31-core-feel-character-fantasy-20260731';
import {PLAYABLE_ROSTER_IDS,ROSTER} from '../roster.js?v=29a31-core-feel-character-fantasy-20260731';
import {COMBAT_RULES,difficultyProfile,decayHabit} from '../combat-core.js?v=29a31-core-feel-character-fantasy-20260731';
import {resolveHubWorldCollision} from '../story/hub-collision.js?v=29a31-core-feel-character-fantasy-20260731';
import {loadQolSettings} from '../qol-settings.js?v=29a31-core-feel-character-fantasy-20260731';
import {createTrainingTrialState,recordTrainingTrialEvent,resetTrainingTrial,trainingTrialView} from '../training-trials.js?v=29a31-core-feel-character-fantasy-20260731';
import {PURSUIT_TUNING,canGroundBounce,canWallSplat,dashIdentityFor,pursuitDurationFor,pursuitPromptText,pursuitTechAvailable,pursuitWindowFor} from './pursuit-combat.js?v=29a31-core-feel-character-fantasy-20260731';
import {FOCUS_RECOVERY_RULES,channelFocusRecovery,endFocusRecovery,focusRecoveryAvailability,interruptFocusRecovery,recoverableHealthView,registerRecoverableDamage,resetFocusRecovery,tickFocusRecovery} from '../focus-recovery.js?v=29a31-core-feel-character-fantasy-20260731';

const ID='arenaModeScreen';
const W=960;
const H=540;
const STEP=COMBAT_RULES.step;
const PERFECT_BLOCK_WINDOW=.11;
const MAX_BLOCK_TIME=1.65;
const BLOCK_LOCKOUT=.72;
const RUN_BUILD_TIME=.12;
const DASH_CANCEL_TIME=.055;
const ACTION_BUFFER_EPSILON=.001;
const KO_TARGET=COMBAT_RULES.koTarget;
const CPU_HEALTH=COMBAT_RULES.maxHealth;
const START_ENERGY=COMBAT_RULES.startEnergy;
const RESPAWN_ENERGY=COMBAT_RULES.respawnEnergy;
const COUNTER_COST=COMBAT_RULES.counterCost;
const COUNTER_COOLDOWN=COMBAT_RULES.counterCooldown;
const COUNTER_ACTIVE=.14;
const COUNTER_RECOVERY=.62;
const BREAKER_COST=COMBAT_RULES.breakerCost;
const BREAKER_COOLDOWN=COMBAT_RULES.breakerCooldown;
const JUGGLE_LIMIT=COMBAT_RULES.juggleLimit;
const EDGE_PRESSURE_HITS=COMBAT_RULES.edgePressureHits;
const EDGE_PRESSURE_WINDOW=COMBAT_RULES.edgePressureWindow;
const LENS_MASTERY_KEY='pxLensMasteryV1';

const MOVEMENT_PROFILES=Object.freeze({
  rrvvfo:Object.freeze({walkSpeed:154,runSpeed:316,airSpeed:218,accel:1320,runAccel:1820,brake:1990,airAccel:720,airBrake:112,dashSpeed:720,pursuitSpeed:960}),
  revvfo:Object.freeze({walkSpeed:150,runSpeed:306,airSpeed:212,accel:1290,runAccel:1770,brake:1960,airAccel:700,airBrake:110,dashSpeed:710,pursuitSpeed:1040}),
  wade:Object.freeze({walkSpeed:182,runSpeed:382,airSpeed:270,accel:1580,runAccel:2180,brake:2260,airAccel:870,airBrake:126,dashSpeed:860,pursuitSpeed:1220}),
  bark:Object.freeze({walkSpeed:120,runSpeed:238,airSpeed:170,accel:1010,runAccel:1380,brake:1810,airAccel:540,airBrake:101,dashSpeed:535,pursuitSpeed:760}),
  phanta:Object.freeze({walkSpeed:164,runSpeed:332,airSpeed:236,accel:1410,runAccel:1920,brake:2100,airAccel:770,airBrake:118,dashSpeed:760,pursuitSpeed:1020}),
  creed:Object.freeze({walkSpeed:168,runSpeed:340,airSpeed:242,accel:1460,runAccel:1980,brake:2140,airAccel:790,airBrake:120,dashSpeed:780,pursuitSpeed:1060}),
  pouki:Object.freeze({walkSpeed:160,runSpeed:326,airSpeed:224,accel:1370,runAccel:1880,brake:2040,airAccel:740,airBrake:114,dashSpeed:735,pursuitSpeed:980}),
  plouke:Object.freeze({walkSpeed:154,runSpeed:315,airSpeed:220,accel:1320,runAccel:1800,brake:2010,airAccel:720,airBrake:112,dashSpeed:720,pursuitSpeed:980}),
  sage:Object.freeze({walkSpeed:154,runSpeed:315,airSpeed:220,accel:1320,runAccel:1800,brake:2010,airAccel:720,airBrake:112,dashSpeed:720,pursuitSpeed:980}),
  default:Object.freeze({walkSpeed:150,runSpeed:304,airSpeed:214,accel:1280,runAccel:1740,brake:1970,airAccel:700,airBrake:110,dashSpeed:700,pursuitSpeed:940})
});

function movementProfile(fighter){
  const base=MOVEMENT_PROFILES[fighter.id]||MOVEMENT_PROFILES.default;
  const scale=Math.max(.85,Math.min(1.25,Number(fighter?.storySpeedMultiplier)||1));
  if(scale===1)return base;
  return{...base,walkSpeed:base.walkSpeed*scale,runSpeed:base.runSpeed*scale,airSpeed:base.airSpeed*scale,accel:base.accel*scale,runAccel:base.runAccel*scale,airAccel:base.airAccel*scale,dashSpeed:base.dashSpeed*scale,pursuitSpeed:base.pursuitSpeed*scale};
}
function approach(current,target,amount){return current<target?Math.min(target,current+amount):Math.max(target,current-amount)}
function initialCameraState(stage,subjects=stage?.spawnPoints||[]){
  const camera=stage?.camera||{yawDeg:38,baseDistance:850,minDistance:850,maxDistance:850,heightBase:420,heightDistanceScale:.16,horizontalDistanceScale:.8,targetHeight:48};
  const first=subjects[0]||{x:0,z:0,y:0},second=subjects[1]||first,midX=(Number(first.x)||0)+(Number(second.x)||0),midZ=(Number(first.z)||0)+(Number(second.z)||0),separation=Math.hypot((Number(first.x)||0)-(Number(second.x)||0),(Number(first.z)||0)-(Number(second.z)||0));
  const x=clamp(midX/2,-(camera.focusClampX||Infinity),camera.focusClampX||Infinity),z=clamp(midZ/2,-(camera.focusClampZ||Infinity),camera.focusClampZ||Infinity),distance=clamp((camera.baseDistance||850)+separation*(camera.separationScale||0),camera.minDistance||850,camera.maxDistance||850),yaw=(camera.yawDeg||38)*Math.PI/180,horizontal=distance*(camera.horizontalDistanceScale||.8);
  return{x,z,distance,eye:[x+Math.sin(yaw)*horizontal,(camera.heightBase||420)+distance*(camera.heightDistanceScale||.16),z+Math.cos(yaw)*horizontal],target:[x,camera.targetHeight||48,z]};
}

function combatFeedbackPreferences(){
  const settings=loadQolSettings();
  const freeze=settings.accessibility?.impactFreeze||'full',shake=settings.accessibility?.cameraShake||'full';
  return{hitstopScale:freeze==='off'?0:freeze==='reduced'?0.55:1,shakeScale:shake==='off'?0:shake==='reduced'?0.38:1};
}
function motionIdentity(id){
  return({
    rrvvfo:{trail:'#ff6a31',secondary:'#ffd079',width:1.12,count:2,label:'FIRE'},
    revvfo:{trail:'#7c42c8',secondary:'#e26bff',width:1,count:3,label:'ASTRYLTE'},
    wade:{trail:'#72e7ff',secondary:'#ffffff',width:.72,count:4,label:'LIGHTNING'},
    bark:{trail:'#c99a58',secondary:'#ead09a',width:1.35,count:1,label:'EARTH'},
    phanta:{trail:'#8654db',secondary:'#d6b9ff',width:.9,count:3,label:'PHANTOM'},
    creed:{trail:'#32ecff',secondary:'#ffffff',width:.75,count:3,label:'SHIFT'}
  })[id]||{trail:null,secondary:null,width:1,count:1,label:'ENERGY'};
}

const ATTACKS=ARENA_NORMAL_PROFILES.default;

const ARENA_ABILITIES=Object.freeze([
  {id:'fireBlast',label:'Fire Blast',icon:'🔥',cost:28,cooldown:1.4,category:'shot'},
  {id:'shotsOfAgony',label:'Shots of Agony',icon:'✦',cost:100,cooldown:7,category:'shot'},
  {id:'objectSwap',label:'Object Swap',icon:'↔',cost:20,cooldown:2.5,category:'trick'},
  {id:'lensOfTruth',label:'Lens of Truth',icon:'◉',cost:60,cooldown:8,hp:25,category:'trick'},
  {id:'ultimate',label:'Solar Weave',icon:'☀',cost:90,cooldown:8,ultimate:true,category:'power'}
]);


const PLAYER_LOADOUTS=Object.freeze({
  rrvvfo:ARENA_ABILITIES,
  revvfo:Object.freeze([
    {id:'genericBlast',label:'Astrylte Blast',icon:'◆',cost:24,cooldown:1.75,category:'shot',character:true},
    {id:'genericBlast',label:'Warp Pressure',icon:'✧',cost:24,cooldown:1.75,category:'trick',character:true,locked:true},
    {id:'genericBlast',label:'Astrylte Guard',icon:'⬡',cost:24,cooldown:1.75,category:'trick',character:true,locked:true},
    {id:'genericBlast',label:'Perfected Beam',icon:'◈',cost:24,cooldown:1.75,category:'power',character:true,locked:true},
    {id:'genericBlast',label:'Perfection',icon:'✹',cost:24,cooldown:1.75,category:'power',character:true,locked:true}
  ]),
  wade:Object.freeze([
    {id:'lightningBlast',label:'Lightning Blast',icon:'ϟ',cost:10,cooldown:.58,category:'shot',character:true},
    {id:'lightningDash',label:'Lightning Dash',icon:'➜',cost:24,cooldown:2.7,category:'trick',character:true},
    {id:'thunderstorm',label:'Thunderstorm',icon:'☁',cost:34,cooldown:5.2,category:'trick',character:true},
    {id:'lightningBeam',label:'Lightning Beam',icon:'⚡',cost:90,cooldown:8,category:'power',character:true},
    {id:'lightningDash',label:'Flash Pursuit',icon:'✦',cost:24,cooldown:2.7,category:'power',character:true}
  ]),
  bark:Object.freeze([
    {id:'rockShot',label:'Rock Shot',icon:'●',cost:16,cooldown:1.35,category:'shot',character:true},
    {id:'groundQuake',label:'Ground Quake',icon:'⌁',cost:30,cooldown:4.6,category:'power',character:true},
    {id:'rockArmor',label:'Rock Armor',icon:'⬢',cost:24,cooldown:7,category:'trick',character:true},
    {id:'earthWall',label:'Earth Wall',icon:'▰',cost:24,cooldown:4.8,category:'trick',character:true},
    {id:'seismicCounter',label:'Seismic Counter',icon:'↶',cost:20,cooldown:3.4,category:'trick',character:true}
  ])
});

function playerLoadout(fighterId){return PLAYER_LOADOUTS[fighterId]||PLAYER_LOADOUTS.revvfo}
function fighterPreset(id,side,cpu,appearance='down'){
  const data=ROSTER[id]||{n:String(id||'Fighter'),a:side===1?'#ff493d':'#a855f7'};
  return{id,name:data.n,accent:data.a,cpu,appearance};
}

function installUI(){
  let root=document.getElementById(ID);
  if(root)return root;
  const style=document.createElement('style');
  style.textContent=`
#${ID}{position:fixed;inset:0;z-index:1200;background:radial-gradient(circle at 50% 30%,#2b2140,#080a12 70%);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;overflow:hidden}
#${ID}.hidden{display:none}
#${ID} canvas{position:absolute;z-index:0;inset:0;margin:auto;cursor:crosshair;width:min(100vw,calc(100vh*16/9));height:min(100vh,calc(100vw*9/16));max-width:100%;max-height:100%;touch-action:none;background:#101326}
#${ID} [data-world-layer]{z-index:0}#${ID} [data-fighter-layer]{z-index:2!important;pointer-events:none;cursor:default;background:transparent!important}
#${ID} .top{position:absolute;z-index:20;inset:14px 18px auto;display:grid;grid-template-columns:1fr auto 1fr;gap:16px;text-shadow:0 2px 8px #000;pointer-events:none}
#${ID} .side.r{text-align:right}#${ID} .name{display:flex;justify-content:space-between;font-weight:900;letter-spacing:.08em}#${ID} .r .name{flex-direction:row-reverse}
#${ID} .track{position:relative;height:17px;margin-top:6px;background:#080a12;border:2px solid #ffffffb8;transform:skewX(-10deg);overflow:hidden}#${ID} .fill,#${ID} .recoverableFill{position:absolute;inset:0 auto 0 0;height:100%;transition:width .08s,left .08s}#${ID} .recoverableFill{z-index:1;background:repeating-linear-gradient(135deg,#e9f7ff99 0 4px,#9ec8db88 4px 8px);box-shadow:inset 0 0 8px #fff6}#${ID} .fill{z-index:2;background:linear-gradient(90deg,#ff3b30,#ff9f0a)}#${ID} .r .fill{background:linear-gradient(90deg,#af52de,#5e5ce6)}#${ID} .track.focusActive{box-shadow:0 0 0 2px #a9fff2,0 0 18px #6fffd499}
#${ID} .resourceLine{display:flex;justify-content:space-between;gap:8px;margin-top:4px;color:#bfefff;font-size:9px;font-weight:900;letter-spacing:.07em}#${ID} .resourceTrack{height:7px;margin-top:1px;background:#060913;border:1px solid #ffffff7a;transform:skewX(-10deg);overflow:hidden}#${ID} .energyFill{height:100%;background:linear-gradient(90deg,#1aa7ff,#7df4ff);transition:width .08s}#${ID} .r .energyFill{background:linear-gradient(90deg,#7e5cff,#d96bff)}#${ID} .guardFill{height:100%;background:linear-gradient(90deg,#55d68b,#d7ff83);transition:width .08s}#${ID} .guardFill.low{background:linear-gradient(90deg,#ff3d54,#ffb14d)}#${ID} .momentumFill{height:100%;background:linear-gradient(90deg,#ff8a2a,#ffe66f);transition:width .08s}#${ID} .momentumFill.ready{animation:momentumPulse .55s ease-in-out infinite alternate}@keyframes momentumPulse{to{filter:brightness(1.65);box-shadow:0 0 12px #ffd45b}}
#${ID} .clock{text-align:center;background:#080a12d9;border:1px solid #ffffff38;border-radius:11px;padding:6px 15px}#${ID} .clock b{display:block;font-size:29px;line-height:1}#${ID} .clock small{font-weight:900;color:#d9ccff;letter-spacing:.1em}
#${ID} .badge{position:absolute;z-index:20;top:110px;right:16px;background:#080a12df;border:1px solid #ffffff30;border-radius:10px;padding:7px 11px;font-size:11px;font-weight:900;color:#e9cfff;text-align:right;line-height:1.35}#${ID} .badge strong{display:block;color:#78f3ff;letter-spacing:.08em}
#${ID} .banner{position:absolute;z-index:30;left:50%;top:34%;transform:translate(-50%,-50%);width:max-content;max-width:min(76vw,640px);padding:10px 18px;border:3px solid #fff8;border-radius:12px;background:#100c21d9;color:#fff;text-align:center;font-size:clamp(22px,4vw,42px);line-height:1.05;font-weight:1000;font-style:italic;letter-spacing:.04em;text-shadow:0 3px #180d25,0 0 18px #e46bff;box-shadow:0 10px 30px #0008;pointer-events:none}#${ID} .banner.hidden{display:none}
#${ID} .comboCallout{position:absolute;z-index:30;left:5%;top:32%;font-size:26px;font-weight:1000;font-style:italic;text-shadow:0 3px #180d25,0 0 16px #ff7138;opacity:0;transform:translateY(10px);transition:opacity .1s,transform .1s;pointer-events:none}#${ID} .comboCallout.show{opacity:1;transform:none}#${ID} .comboCallout small{display:block;font-size:11px;color:#ffd6bd;letter-spacing:.08em}
#${ID} .pursuitPrompt{position:absolute;z-index:62;left:50%;top:25%;transform:translate(-50%,-8px) scale(.96);min-width:min(430px,82vw);padding:9px 16px;border:2px solid #78f3ff;border-radius:999px;background:#07111bf2;color:#fff;text-align:center;font-size:13px;font-weight:1000;letter-spacing:.08em;opacity:0;transition:opacity .1s,transform .1s,background .08s,border-color .08s;pointer-events:none;box-shadow:0 0 22px #54dfff66;text-shadow:0 2px 3px #000,0 0 8px #000}#${ID} .pursuitPrompt.show{opacity:1;transform:translate(-50%,0) scale(1)}#${ID} .pursuitPrompt.danger{border-color:#ffd36f;box-shadow:0 0 22px #ffb74d66}#${ID} .pursuitPrompt.ready{border-color:#fff18a;background:#18210df2;animation:pursuitReadyPulse .28s ease-out 1}@keyframes pursuitReadyPulse{0%{transform:translate(-50%,0) scale(.94);filter:brightness(1)}55%{transform:translate(-50%,0) scale(1.06);filter:brightness(1.7)}100%{transform:translate(-50%,0) scale(1);filter:brightness(1)}}#${ID} .resourceTrack.techReady{box-shadow:0 0 0 2px #fff18a,0 0 15px #ffd85c;animation:techEnergyPulse .42s ease-in-out infinite alternate}#${ID} .resourceTrack.techSpent{animation:techSpentPulse .24s ease-out 1}@keyframes techEnergyPulse{to{filter:brightness(1.5)}}@keyframes techSpentPulse{0%{filter:brightness(2);transform:skewX(-10deg) scaleX(1.04)}100%{filter:brightness(1);transform:skewX(-10deg) scaleX(1)}}#${ID}.pursuit-active{touch-action:none;overscroll-behavior:none}#${ID}.pursuit-active .arenaTouchButton.dash{transform:scale(1.12);box-shadow:0 0 0 3px #fff18a,0 0 22px #78f3ff;z-index:8}#${ID} .pursuitCounters{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:2px}#${ID} .pursuitCounters span{padding:4px;border:1px solid #ffffff2f;border-radius:6px;background:#0d1422;color:#dff8ff;font-size:9px;font-weight:900;text-align:center}#${ID} .pursuitCounters strong{color:#fff18a}
#${ID} .lensBlindness{position:absolute;z-index:10;inset:0;display:grid;place-items:center;padding:24px;background:linear-gradient(180deg,rgba(0,0,0,.22),rgba(0,0,0,.56));opacity:0;visibility:hidden;pointer-events:none;text-align:center;transition:opacity .08s linear,visibility 0s linear .08s}#${ID} .lensBlindness.active{opacity:1;visibility:visible;transition-delay:0s}#${ID} .lensBlindness.reduced{background:rgba(0,0,0,.72)}#${ID} .lensBlindness>div{position:absolute;top:22%;left:50%;transform:translateX(-50%);min-width:min(520px,88vw);padding:16px 20px;border:2px solid #bff6ff;border-radius:14px;background:#07111be8;box-shadow:0 0 26px #72e6ff66}#${ID} .lensBlindness strong{display:block;color:#f7f7ff;font-size:30px;font-weight:1000;letter-spacing:.08em;text-shadow:0 0 18px #98eaff88}#${ID} .lensBlindness span{display:block;margin-top:8px;color:#cfd6ff;font-size:16px;font-weight:900;letter-spacing:.05em}#${ID} .lensBlindness small{display:block;margin-top:10px;color:#8fefff;font-size:13px;font-weight:1000}#${ID} .lensBlindness.ending strong{animation:lensWarningPulse .34s steps(2,end) infinite}@keyframes lensWarningPulse{50%{opacity:.48}}
#${ID} .impactFlash{position:absolute;z-index:30;inset:0;pointer-events:none;background:#fff;opacity:0;mix-blend-mode:screen;transition:opacity .09s}
#${ID} .arenaTrainingPanel{position:absolute;z-index:45;left:14px;top:118px;display:grid;gap:6px;width:min(240px,30vw);padding:10px;border:1px solid #ffffff42;border-radius:10px;background:#080a12e8;font-size:10px}#${ID} .arenaTrainingPanel.hidden{display:none}#${ID} .arenaTrainingPanel label{display:grid;gap:3px}#${ID} .arenaTrainingPanel select,#${ID} .arenaTrainingPanel button{min-height:30px;background:#151b2b;color:#fff;border:1px solid #ffffff38;border-radius:6px}#${ID} .bottom{position:absolute;z-index:40;left:12px;right:12px;bottom:104px;display:flex;justify-content:space-between;align-items:end;gap:12px}
#${ID} .arenaHotbar{position:absolute;z-index:50;left:50%;bottom:10px;width:min(760px,74vw);transform:translateX(-50%);color:#fff}#${ID} .arenaSlots{display:grid;grid-template-columns:repeat(5,minmax(78px,1fr));gap:6px}
#${ID} .arenaAbility{position:relative;isolation:isolate;height:82px;min-width:0;overflow:hidden;padding:5px 5px 4px;border:2px solid #586683;border-radius:9px;background:linear-gradient(160deg,#1c2639eb,#090c16f3 72%);box-shadow:0 5px 16px #000a,inset 0 0 10px #ffffff12;color:#fff;text-align:center;touch-action:manipulation}#${ID} .arenaAbility:after{content:'';position:absolute;inset:0;z-index:-2;background:linear-gradient(130deg,#fa4a2515,#5acfff12)}#${ID} .arenaCooldown{position:absolute;z-index:-1;left:0;right:0;bottom:0;height:var(--cooldown-fill,0%);background:#05070bdc;border-top:1px solid #ffffff45;transition:height .1s linear}#${ID} .arenaNumber{position:absolute;left:4px;top:3px;min-width:20px;padding:2px 4px;border:1px solid #ffffff5c;border-radius:4px;background:#05070ce8;font-size:9px;font-weight:1000}#${ID} .arenaIcon{display:block;margin-top:3px;font-size:24px;line-height:25px;filter:drop-shadow(0 2px 4px #000)}#${ID} .arenaAbilityName{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:900}#${ID} .arenaCategory{position:absolute;right:4px;top:3px;padding:1px 4px;border-radius:999px;background:#0b101bdd;border:1px solid #ffffff45;color:#ffe8a6;font-size:7px;font-weight:1000;letter-spacing:.06em}#${ID} .arenaCost{display:block;color:#8ddfff;font-size:8px;font-weight:800}#${ID} .arenaState{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ffe5a1;font-size:8px;font-weight:1000}#${ID} .arenaAbility.unavailable{border-style:dashed;filter:saturate(.4);opacity:.72}#${ID} .arenaAbility.selected{border-color:#fff;box-shadow:0 0 0 2px #78f3ff,0 0 18px #78f3ffaa}#${ID} .arenaAbility.active{border-color:#75efff;box-shadow:0 0 17px #41dfff99,inset 0 0 12px #75efff30}#${ID} .arenaAbility.ultimate{border-color:#ffb45f;background:linear-gradient(160deg,#532d16ed,#120b08f4 72%)}
#${ID} .arenaNotice{position:absolute;z-index:60;left:50%;bottom:104px;transform:translateX(-50%);padding:7px 13px;border:1px solid #ffffff38;border-radius:9px;background:#080a12ed;color:#fff;font-size:11px;font-weight:1000;letter-spacing:.06em;opacity:0;transition:opacity .12s;pointer-events:none}#${ID} .arenaNotice.show{opacity:1}#${ID} .edgeWarning{position:absolute;z-index:55;left:50%;top:128px;transform:translateX(-50%);padding:7px 14px;border:2px solid #ffcc72;border-radius:999px;background:#2b0d0de8;color:#fff2bc;font-size:12px;font-weight:1000;letter-spacing:.08em;opacity:0;transition:opacity .12s;pointer-events:none}#${ID} .edgeWarning.show{opacity:1}
#${ID} .help span{display:inline-block;padding:1px 4px;border:1px solid #ffffff38;border-radius:4px;background:#111a2c;color:#fff;font-size:.9em;font-weight:900}#${ID} .help{background:#080a12de;border:1px solid #ffffff2c;border-radius:9px;padding:8px 10px;font-size:11px;line-height:1.45}#${ID} .help b{color:#78f3ff}#${ID} button{border:1px solid #ffffff38;border-radius:9px;background:#252b40;color:#fff;padding:10px 14px;font-weight:900;cursor:pointer}#${ID} button.primary{background:linear-gradient(135deg,#9830ff,#e73b90)}
@media (pointer:coarse),(max-width:760px){#${ID} .focusRecoveryCue{top:max(26%,calc(env(safe-area-inset-top) + 96px));max-width:70vw;padding:6px 10px;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${ID} .pursuitPrompt{top:max(18%,calc(env(safe-area-inset-top) + 68px));min-width:0;max-width:64vw;padding:6px 10px;font-size:10px;letter-spacing:.045em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#${ID} .pursuitPrompt.danger{max-width:72vw}#${ID}.pursuit-active .arenaTouchButton.dash{min-width:64px;min-height:64px}#${ID} .arenaTrainingPanel{width:min(250px,44vw);max-height:72vh;overflow:auto}}
#${ID} .focusRecoveryCue{position:absolute;z-index:63;left:50%;top:31%;transform:translate(-50%,-8px);padding:7px 13px;border:2px solid #a4ffe2;border-radius:999px;background:#071710e8;color:#eafff7;font-size:11px;font-weight:1000;letter-spacing:.08em;opacity:0;transition:opacity .12s,transform .12s;pointer-events:none;box-shadow:0 0 20px #6fffd466}#${ID} .focusRecoveryCue.show{opacity:1;transform:translate(-50%,0)}#${ID} .result{position:absolute;z-index:8;left:50%;top:50%;transform:translate(-50%,-50%);width:min(88vw,500px);background:#080a12f2;border:1px solid #ffffff3b;border-radius:17px;padding:25px;text-align:center;box-shadow:0 24px 80px #000}#${ID} .result.hidden{display:none}#${ID} .result h2{font-size:36px;margin:4px}#${ID} .actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:17px}#${ID}.paused:after{content:'PAUSED';position:absolute;z-index:7;inset:0;display:grid;place-items:center;background:#0008;font-size:64px;font-weight:1000}
#${ID} .desktopUtility{display:flex;gap:8px;align-items:center}
#${ID} .controlButton{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:8px 12px;background:#10182bed;border-color:#78f3ff55}
#${ID} .arenaTouchControls{display:none;position:absolute;z-index:6;inset:0;pointer-events:none;opacity:var(--arena-control-opacity,.88);user-select:none;-webkit-user-select:none}
#${ID} .arenaMovePad{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:132px;height:132px;border:2px solid #c8f7ff7a;border-radius:50%;background:radial-gradient(circle,#76e9ff1a 0 34%,#08101dd9 36% 68%,#32466b99 70%);box-shadow:0 10px 28px #000a,inset 0 0 18px #6be8ff24;pointer-events:auto;touch-action:none}
#${ID} .arenaMovePad:before,#${ID} .arenaMovePad:after{content:'';position:absolute;background:#d8fbff2e;pointer-events:none}#${ID} .arenaMovePad:before{left:50%;top:12%;bottom:12%;width:2px}#${ID} .arenaMovePad:after{top:50%;left:12%;right:12%;height:2px}
#${ID} .arenaMoveKnob{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e9feff,#58d8ff 36%,#3154b2 72%);border:2px solid #fff9;box-shadow:0 5px 14px #000b,0 0 16px #66e8ff88;will-change:transform;pointer-events:none}
#${ID} .arenaActionCluster{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));width:260px;height:170px;pointer-events:none}
#${ID} .arenaTouchButton{position:absolute;width:64px;height:64px;padding:0;border-radius:50%;border:2px solid #ffffff9c;background:linear-gradient(145deg,#34476fe8,#11182aec);box-shadow:0 7px 18px #000c,inset 0 0 14px #ffffff14;color:#fff;font-size:10px;font-weight:1000;letter-spacing:.03em;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#${ID} .arenaTouchButton strong{display:block;font-size:17px;line-height:19px}#${ID} .arenaTouchButton.pressed{transform:scale(.9);filter:brightness(1.35);box-shadow:0 2px 7px #000d,inset 0 0 18px #8bf4ff66}
#${ID} .arenaTouchButton.light{right:0;bottom:46px;background:linear-gradient(145deg,#2b79e8ee,#12214aec)}#${ID} .arenaTouchButton.heavy{right:58px;bottom:88px;background:linear-gradient(145deg,#d13b62ee,#54162dec)}#${ID} .arenaTouchButton.jump{right:58px;bottom:2px;background:linear-gradient(145deg,#42b875ee,#123f2aec)}#${ID} .arenaTouchButton.dash{right:116px;bottom:46px;background:linear-gradient(145deg,#b066e8ee,#3e185aec)}
#${ID} .arenaTouchButton.launcher{right:130px;bottom:112px;width:52px;height:52px;background:linear-gradient(145deg,#e19630ee,#563310ec)}#${ID} .arenaTouchButton.block{right:130px;bottom:0;width:58px;height:58px;background:linear-gradient(145deg,#627085ee,#1a2432ec)}#${ID} .arenaTouchButton.charge{right:188px;bottom:112px;width:52px;height:52px;background:linear-gradient(145deg,#d2a54aee,#5a4215ec)}#${ID} .arenaTouchButton.grab{right:194px;bottom:42px;width:58px;height:58px;background:linear-gradient(145deg,#d95858ee,#5d1f1fec)}#${ID} .arenaTouchButton.breaker{right:244px;bottom:112px;width:46px;height:46px;background:linear-gradient(145deg,#65758fee,#1c2433ec)}#${ID} .arenaTouchButton.counter{right:252px;bottom:58px;width:46px;height:46px;background:linear-gradient(145deg,#b08335ee,#443013ec)}#${ID} .arenaTouchButton.interact{display:none;right:194px;bottom:42px;width:64px;height:64px;background:linear-gradient(145deg,#45a878ee,#153d2cec)}#${ID}.storyEngineMode-exploration .arenaTouchButton.grab{display:none}#${ID}.storyEngineMode-exploration .arenaTouchButton.interact{display:block}
#${ID} .arenaTouchUtilities{display:none;position:absolute;z-index:8;right:max(10px,env(safe-area-inset-right));top:max(78px,env(safe-area-inset-top));gap:6px}.arenaTouchUtilities button{width:42px;height:42px;padding:0;border-radius:50%;font-size:17px;background:#090e1bd9;backdrop-filter:blur(8px)}
#${ID} .arenaControlSettings{position:absolute;z-index:12;inset:0;display:grid;place-items:center;padding:max(18px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));background:#02040bd6;backdrop-filter:blur(10px)}#${ID} .arenaControlSettings.hidden{display:none}
#${ID} .arenaControlCard{width:min(92vw,620px);max-height:min(88vh,640px);overflow:auto;padding:20px;border:1px solid #91efff55;border-radius:16px;background:linear-gradient(160deg,#17243cf5,#070a13f7);box-shadow:0 22px 70px #000}#${ID} .arenaControlCard header{display:flex;justify-content:space-between;align-items:start;gap:16px}#${ID} .arenaControlCard h2{margin:2px 0 4px;font-size:27px}#${ID} .arenaControlCard header button{min-width:42px;padding:8px;font-size:19px}
#${ID} .arenaControlGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:15px}#${ID} .arenaControlGrid fieldset{min-width:0;border:1px solid #ffffff2b;border-radius:12px;padding:12px}#${ID} .arenaControlGrid legend{padding:0 6px;color:#78f3ff;font-weight:1000;letter-spacing:.07em}#${ID} .arenaControlGrid label{display:grid;gap:5px;margin:9px 0;color:#dfe9ff;font-size:12px;font-weight:800}#${ID} .arenaControlGrid select,#${ID} .arenaControlGrid input[type=range]{width:100%}#${ID} .arenaControlGrid select{padding:9px;border:1px solid #ffffff30;border-radius:8px;background:#0b1220;color:#fff}
#${ID} .arenaControlActions{display:flex;justify-content:flex-end;gap:9px;margin-top:14px}
#${ID} .rotateHint{display:none;position:absolute;z-index:11;inset:0;place-items:center;padding:30px;background:#060914ef;text-align:center}#${ID} .rotateHint strong{display:block;font-size:26px;color:#78f3ff}#${ID} .rotateHint span{display:block;margin-top:8px;color:#d5dded}
#${ID}[data-active-input=touch] .help{display:none}
#${ID}[data-active-input=touch] .arenaHotbar{width:min(48vw,430px);bottom:max(5px,env(safe-area-inset-bottom))}
#${ID}[data-active-input=touch] .arenaAbility{height:60px;padding:2px 3px}#${ID}[data-active-input=touch] .arenaIcon{font-size:17px;line-height:18px}#${ID}[data-active-input=touch] .arenaAbilityName{font-size:8px}#${ID}[data-active-input=touch] .arenaCost,#${ID}[data-active-input=touch] .arenaState{font-size:6px}#${ID}[data-active-input=touch] .arenaNumber{font-size:7px;min-width:18px}
#${ID}.arena-touch-active canvas{cursor:default}#${ID}.arena-touch-active .arenaTouchControls{display:block}#${ID}.arena-touch-active .arenaTouchUtilities{display:flex}#${ID}.arena-touch-active .desktopUtility{display:none}#${ID}.arena-touch-active .bottom{pointer-events:none}#${ID}.arena-touch-active .arenaNotice{bottom:72px}
#${ID}.arena-left-handed .arenaMovePad{left:auto;right:max(18px,env(safe-area-inset-right))}#${ID}.arena-left-handed .arenaActionCluster{right:auto;left:max(18px,env(safe-area-inset-left))}
#${ID}[data-mobile-layout=compact] .arenaMovePad{width:112px;height:112px}#${ID}[data-mobile-layout=compact] .arenaActionCluster{transform:scale(.86);transform-origin:right bottom}#${ID}.arena-left-handed[data-mobile-layout=compact] .arenaActionCluster{transform-origin:left bottom}
#${ID}[data-mobile-layout=large] .arenaMovePad{width:150px;height:150px}#${ID}[data-mobile-layout=large] .arenaActionCluster{transform:scale(1.12);transform-origin:right bottom}#${ID}.arena-left-handed[data-mobile-layout=large] .arenaActionCluster{transform-origin:left bottom}
#${ID}.arena-labels-hidden .arenaTouchButton span{display:none}

#${ID} .arenaStageSelect{position:absolute;z-index:100;inset:0;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 20%,#432451,#110b19 58%,#05070d 100%)}#${ID} .arenaStageSelect.hidden{display:none}#${ID} .arenaStageCard{width:min(920px,94vw);max-height:92vh;overflow:auto;padding:24px;border:1px solid #ffffff32;border-radius:20px;background:#0a0d17f2;box-shadow:0 30px 100px #000c}#${ID} .arenaStageCard header{text-align:center}#${ID} .arenaStageCard header small{color:#78f3ff;font-weight:1000;letter-spacing:.13em}#${ID} .arenaStageCard h2{margin:4px 0 8px;font-size:36px}#${ID} .arenaStageCard header p{margin:0 auto 20px;max-width:650px;color:#c9c5da}#${ID} .arenaStageGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}#${ID} .arenaStageOption{min-height:190px;padding:16px;text-align:left;border:2px solid #ffffff2c;background:linear-gradient(155deg,#28203d,#101321 72%);transition:transform .12s,border-color .12s,box-shadow .12s}#${ID} .arenaStageOption:hover:not(:disabled),#${ID} .arenaStageOption:focus-visible:not(:disabled){transform:translateY(-3px);border-color:#78f3ff;box-shadow:0 0 0 2px #78f3ff44,0 14px 30px #0008}#${ID} .arenaStageOption strong{display:block;font-size:20px}#${ID} .arenaStageOption span{display:block;margin-top:6px;color:#d9ccff;font-size:12px}#${ID} .arenaStageOption .stageTags{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}#${ID} .arenaStageOption .stageTags b{padding:3px 6px;border:1px solid #ffffff38;border-radius:999px;background:#080b15b8;color:#9eefff;font-size:9px;letter-spacing:.08em}#${ID} .arenaStageOption .stageDescription{min-height:34px;color:#e8e5f2;line-height:1.35}#${ID} .arenaStageOption .stageRecommend{color:#ffd98c;font-size:10px}#${ID} .arenaStageOption em{display:inline-block;margin-top:14px;padding:4px 7px;border-radius:999px;background:#1b8d6b;color:#eafff8;font-size:10px;font-style:normal;letter-spacing:.08em}#${ID} .arenaStageOption.tournament{background:linear-gradient(155deg,#53303f,#20152e 72%)}#${ID} .arenaStageOption:disabled{cursor:not-allowed;opacity:.5;filter:grayscale(.5)}#${ID} .arenaStageOption:disabled em{background:#514a5d}#${ID} .arenaStageBack{display:block;margin:18px auto 0}

@media(max-width:760px){#${ID} .arenaStageGrid{grid-template-columns:1fr}#${ID} .arenaStageOption{min-height:130px}#${ID} .arenaControlGrid{grid-template-columns:1fr}#${ID} .arenaControlCard{padding:15px}#${ID} .arenaControlCard h2{font-size:23px}}
@media(orientation:portrait) and (pointer:coarse){#${ID}.arena-touch-active .rotateHint{display:grid}}
@media(max-width:700px){#${ID} .arenaHotbar{width:min(94vw,620px);bottom:5px}#${ID} .arenaSlots{gap:3px}#${ID} .arenaAbility{height:66px;padding:3px}#${ID} .arenaIcon{font-size:18px;line-height:19px}#${ID} .arenaAbilityName{font-size:8px}#${ID} .arenaCost,#${ID} .arenaState{font-size:7px}#${ID} .bottom{bottom:77px}#${ID} .arenaNotice{bottom:77px}#${ID} .top{inset:7px 7px auto;gap:7px}#${ID} .name{font-size:10px!important}#${ID} .track{height:12px!important}#${ID} .clock{padding:4px 7px!important}#${ID} .clock b{font-size:21px!important}#${ID} .help{font-size:8px}#${ID} .badge{display:none}#${ID} .banner{top:31%;max-width:88vw;padding:8px 12px;font-size:clamp(18px,6vw,30px)}#${ID} .comboCallout{font-size:20px;top:27%}}
`;
  document.head.appendChild(style);
  root=document.createElement('section');
  root.id=ID;
  root.className='hidden';
  root.innerHTML=`
<canvas data-world-layer width="${W}" height="${H}" aria-label="WebGL perspective arena"></canvas>
<canvas data-fighter-layer width="${W}" height="${H}" aria-hidden="true"></canvas>

<div class="arenaStageSelect hidden" data-arena-stage-select role="dialog" aria-modal="true" aria-label="Arena select"><div class="arenaStageCard">
  <header><small>PROTOTYPE 2.9A.31</small><h2>SELECT ARENA</h2><p>Choose a stage by its playstyle. Size, boundaries, pursuit lanes, wall pressure, and ring-out rules shape each match.</p></header>
  <div class="arenaStageMobileNav" aria-label="Stage carousel controls"><button data-stage-prev aria-label="Previous stage">‹</button><strong data-stage-position>1 / 1</strong><button data-stage-next aria-label="Next stage">›</button></div>
  <div class="arenaStageGrid" data-arena-stage-grid></div>
  <button class="arenaStageBack" data-stage-back>BACK TO MAIN MENU</button>
</div></div>
<div class="lensBlindness" data-lens-blindness aria-hidden="true"><div><strong>LENS OF TRUTH</strong><span data-lens-status>READING OPPONENT...</span><small data-lens-time>4s</small><small data-lens-mastery>MASTERY 0%</small></div></div>
<div class="impactFlash" data-impact-flash></div><div class="comboCallout" data-combo></div>
<div class="top">
  <div class="side"><div class="name"><span>RRVVFO</span><span data-s1>0</span></div><div class="track" data-health-track="1"><div class="recoverableFill" data-rh1></div><div class="fill" data-h1></div></div><div class="resourceLine"><span>ENERGY</span><span data-energy-text>45</span></div><div class="resourceTrack"><div class="energyFill" data-e1></div></div><div class="resourceLine"><span>GUARD</span><span data-g1-text>100</span></div><div class="resourceTrack"><div class="guardFill" data-g1></div></div><div class="resourceLine"><span>MOMENTUM</span><span data-m1-text>0</span></div><div class="resourceTrack"><div class="momentumFill" data-m1></div></div></div>
  <div class="clock"><b data-time>90</b><small data-round>ROUND 1</small></div>
  <div class="side r"><div class="name"><span>REVVFO</span><span data-s2>0</span></div><div class="track" data-health-track="2"><div class="recoverableFill" data-rh2></div><div class="fill" data-h2></div></div><div class="resourceLine"><span data-e2-text>45</span><span>ENERGY</span></div><div class="resourceTrack"><div class="energyFill" data-e2></div></div><div class="resourceLine"><span data-g2-text>100</span><span>GUARD</span></div><div class="resourceTrack"><div class="guardFill" data-g2></div></div><div class="resourceLine"><span data-m2-text>0</span><span>MOMENTUM</span></div><div class="resourceTrack"><div class="momentumFill" data-m2></div></div></div>
</div>
<div class="badge"><strong>PROTOTYPE 2.9A.31 • CORE FEEL & CHARACTER FANTASY</strong><span data-stage-name>TANGAI DOJO</span><br>REUSABLE ARENA PIPELINE • DATA-DRIVEN STAGE</div><div class="banner hidden" data-banner></div>
<div class="result hidden" data-result><small>ARENA BATTLE</small><h2 data-title>MATCH COMPLETE</h2><p data-text></p><div class="actions"><button class="primary" data-rematch>INSTANT REMATCH</button><button data-random-rematch>RANDOM REMATCH</button><button data-change-arena>CHANGE ARENA</button><button data-return>MAIN MENU</button></div></div>
<div class="arenaNotice unifiedPrompt" data-arena-notice></div><div class="focusRecoveryCue unifiedPrompt" data-focus-recovery-cue>FOCUS RECOVERY • HOLD BLOCK + CHARGE</div><div class="combatEventLayer" data-combat-event-layer aria-live="polite" aria-atomic="false"></div><div class="pursuitPrompt unifiedPrompt" data-pursuit-prompt></div><div class="edgeWarning" data-edge-warning>EDGE PRESSURE • ESCAPE OR COUNTER</div>
<div class="arenaHotbar" data-arena-hotbar><div class="arenaSlots">${ARENA_ABILITIES.map((ability,index)=>`<button class="arenaAbility ${ability.ultimate?'ultimate':''}" data-arena-slot="${index+1}" aria-label="Slot ${index+1}: ${ability.label}, ${SPECIAL_CATEGORIES[ability.category].label} category"><span class="arenaCooldown"></span><span class="arenaNumber">${index+1}</span><span class="arenaCategory">${SPECIAL_CATEGORIES[ability.category].label}</span><span class="arenaIcon">${ability.icon}</span><span class="arenaAbilityName">${ability.label}</span><span class="arenaCost">${ability.cost} ENERGY${ability.hp?` • ${ability.hp} HP`:''}</span><span class="arenaState" data-arena-state>READY</span></button>`).join('')}</div></div>
<div class="arenaTouchControls" aria-label="Arena touch controls">
  <div class="arenaMovePad" data-arena-move-pad aria-label="Movement joystick"><div class="arenaMoveKnob" data-arena-move-knob></div></div>
  <div class="arenaActionCluster">
    <button class="arenaTouchButton light" data-arena-touch-action="light"><strong>✦</strong><span>LIGHT</span></button>
    <button class="arenaTouchButton heavy" data-arena-touch-action="heavy"><strong>◆</strong><span>HEAVY</span></button>
    <button class="arenaTouchButton jump" data-arena-touch-action="jump"><strong>↑</strong><span>JUMP</span></button>
    <button class="arenaTouchButton dash" data-arena-touch-action="dash"><strong>➜</strong><span>DASH</span></button>
    <button class="arenaTouchButton launcher" data-arena-touch-action="launcher"><strong>↟</strong><span>LAUNCH</span></button>
    <button class="arenaTouchButton block" data-arena-touch-action="block"><strong>⬡</strong><span>BLOCK</span></button>
    <button class="arenaTouchButton charge" data-arena-touch-action="charge"><strong>✧</strong><span>CHARGE</span></button>
    <button class="arenaTouchButton grab" data-arena-touch-action="grab"><strong>↯</strong><span>GRAB</span></button>
    <button class="arenaTouchButton breaker" data-arena-touch-action="breaker"><strong>✹</strong><span>BREAK</span></button>
    <button class="arenaTouchButton counter" data-arena-touch-action="counter"><strong>↶</strong><span>COUNTER</span></button>
    <button class="arenaTouchButton interact" data-arena-touch-action="interact"><strong>!</strong><span>INTERACT</span></button>
  </div>
</div>
<div class="arenaTouchUtilities"><button data-arena-touch-pause aria-label="Pause">Ⅱ</button><button data-arena-touch-settings aria-label="Control settings">⚙</button></div>
<div class="rotateHint"><div><strong>ROTATE TO LANDSCAPE</strong><span>Arena controls are designed for two-thumb play.</span></div></div>
<div class="arenaControlSettings hidden" data-arena-control-settings role="dialog" aria-modal="true" aria-label="Arena control settings"><div class="arenaControlCard">
  <header><div><small>PROTOTYPE 2.9A.31</small><h2>CONTROL LAYOUTS</h2><p>Desktop and mobile settings save separately from combat balance.</p></div><button data-arena-controls-close aria-label="Close">×</button></header>
  <div class="arenaControlGrid">
    <fieldset><legend>PC</legend><label>Keyboard profile<select data-control-pc-layout><option value="shared">Chapter 1–3 Controls — used in every mode</option></select></label><label>Left mouse click<select data-control-mouse-attack><option value="light">Light Attack</option><option value="heavy">Heavy Attack</option></select></label><p><strong>Movement:</strong> WASD<br><strong>Jump:</strong> Space<br><strong>Light / Heavy / Launcher:</strong> J / K / I<br><strong>Dash:</strong> Shift<br><strong>Block:</strong> L or Mouse 2<br><strong>Charge:</strong> C<br><strong>Grab:</strong> U<br><strong>Abilities:</strong> 1–5</p></fieldset>
    <fieldset><legend>MOBILE</legend><label>Touch controls<select data-control-touch-mode><option value="auto">Auto detect</option><option value="on">Always on</option><option value="off">Off</option></select></label><label>Button size<select data-control-mobile-layout><option value="compact">Compact</option><option value="standard">Standard</option><option value="large">Large Buttons</option></select></label><label>Handedness<select data-control-handedness><option value="right">Joystick left / attacks right</option><option value="left">Joystick right / attacks left</option></select></label><label>Opacity<input data-control-opacity type="range" min=".45" max="1" step=".05"></label><label><input data-control-labels type="checkbox"> Show action labels</label></fieldset>
  </div><div class="arenaControlActions"><button data-arena-controls-reset>RESTORE DEFAULTS</button><button class="primary" data-arena-controls-close>DONE</button></div>
</div></div>
<div class="arenaTrainingPanel hidden" data-arena-training-panel><button class="trainingPanelToggle" data-training-toggle aria-expanded="true">TRAINING PANEL • HIDE</button><div class="trainingPanelBody" data-training-panel-body><strong>ARENA TRAINING</strong><label>TRIAL <select data-training-drill><option value="free">Free Practice</option><option value="parry">Perfect-Parry Trial</option><option value="charge">Energy Discipline</option><option value="recovery">Focus Recovery</option><option value="combo">Launch → Pursuit Trial</option><option value="finisher">Ideal Pursuit Combo</option><option value="wall">Wall Splat Trial</option><option value="bounce">Ground Bounce Trial</option><option value="escape">Pursuit Escape Trial</option><option value="pressure">Pursuit Pressure</option><option value="guard">Guard-Break Punish</option><option value="variation">Unpredictable Route</option></select></label><label>DUMMY <select data-training-dummy><option value="stand">Stand</option><option value="block">Always Block</option><option value="perfect">Perfect-Block Attempts</option><option value="counter">Counter After Hit</option><option value="tech">Air-Tech Practice</option><option value="pursuit">Pursuit Pressure</option><option value="recovery">Focus Recovery Practice</option><option value="random">Random Defense</option><option value="cpu">Full CPU</option></select></label><label>PURSUIT DEFENSE <select data-training-pursuit-defense><option value="never">Never Tech</option><option value="occasional">Tech Occasionally</option><option value="always">Tech Every Time</option><option value="repeated">Tech After Repeated Route</option></select></label><label>FOCUS RECOVERY <select data-training-recovery><option value="never">Never Recover</option><option value="safe">Recover When Safe</option><option value="low">Recover at Low Health</option><option value="always">Always Attempt</option></select></label><button data-training-reset>RESET MATCH</button><button data-training-reset-combat>RESET COMBAT STATE</button><button data-training-moves>MOVE LIST</button><button data-training-identity>FIGHTER IDENTITY GUIDE</button><button data-training-advanced>ADVANCED 2D LAB</button><div class="pursuitCounters"><span>WALL SPLAT <strong data-training-wall-count>0/1</strong></span><span>GROUND BOUNCE <strong data-training-bounce-count>0/1</strong></span></div><div class="arenaTrialCard" data-training-trial-card><small data-training-trial-label>FREE PRACTICE</small><strong data-training-trial-goal>Practice any route.</strong><span data-training-trial-message>No pass condition.</span><div><i data-training-trial-meter></i></div></div></div></div>
<div class="identityGuide hidden" data-identity-guide role="dialog" aria-modal="false" aria-label="Fighter identity comparison"><header><div><small>TRAINING COMPARISON</small><h2>FIGHTER IDENTITY</h2><p>Each finished fighter should feel different before landing a special move.</p></div><button data-identity-close aria-label="Close identity guide">×</button></header><div class="identityCards"><article data-identity="rrvvfo"><strong>RRVVFO</strong><span>IMPROVISED PRESSURE</span><p>Flexible buffers, ember feints, Object Swap angles.</p></article><article data-identity="revvfo"><strong>REVVFO</strong><span>RELENTLESS WARP</span><p>Fast pressure, short warp recovery, aggressive pursuit.</p></article><article data-identity="wade"><strong>WADE</strong><span>LIGHTNING RUSHDOWN</span><p>Fastest acceleration, earliest dash cancel, light impacts.</p></article><article data-identity="bark"><strong>BARK</strong><span>ARMORED FORCE</span><p>Slow commitment, visible armor, heavier hitstop and knockback.</p></article></div><footer>DASH • BASIC STRING • HEAVY • PURSUIT • compare the rhythm, not only the damage.</footer></div>
<div class="bottom"><div class="help" data-arena-help></div><div class="desktopUtility"><button class="controlButton" data-arena-open-controls>⚙ CONTROLS</button><button data-restart>RESTART</button><button data-exit>EXIT</button></div></div>`;
  document.body.appendChild(root);
  return root;
}

async function loadSprite(renderer,id){
  try{
    const manifestUrl=new URL(`../../assets/fighters/${id}/${id}-animations.json`,import.meta.url);
    const response=await fetch(manifestUrl);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const manifest=await response.json();
    const image=new Image();
    image.src=new URL(manifest.image,manifestUrl).href;
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Atlas image failed to load'))});
    return{manifest,image,texture:renderer.createTexture(image)};
  }catch(error){console.warn('[Arena 2.4C] sprite fallback',id,error);return null}
}

function attackAnimationName(state){
  if(!state)return'';
  const def=state.def,progress=state.elapsed/def.duration;
  if(def.kind==='heavy')return progress<.32?'heavyStartup':progress<.62?'heavyActive':'heavyRecovery';
  if(def.kind==='launcher')return progress<.31?'launcherStartup':progress<.62?'launcherActive':'launcherRecovery';
  return def.animation;
}

function animationName(fighter){
  if(fighter.ringOutFall>0)return'fall';
  if(fighter.pursuitTime>0)return'dash';
  if(fighter.victoryPoseTime>0)return'victory';
  if(fighter.hp<=0)return'knockdown';
  if(fighter.guardBreak>0)return'guardBreak';
  if(fighter.visualActionTime>0&&fighter.visualAction)return fighter.visualAction;
  if(fighter.attackState)return attackAnimationName(fighter.attackState);
  if(fighter.stun>0)return fighter.knockdown>0?'knockdown':fighter.lastHitKind==='heavy'||fighter.lastHitKind==='launcher'||fighter.lastHitKind==='pursuitHeavy'?'hurtHeavy':'hurtLight';
  if(fighter.dashTime>0)return'dash';
  if(!fighter.grounded)return fighter.vy>0?'jumpRise':'fall';
  if(fighter.block)return fighter.blockAge<.12?'blockStart':'blockHold';
  if(fighter.moving)return'run';
  return'fightingStance';
}

function frameFor(fighter){
  const asset=fighter.asset;if(!asset)return null;
  let name=animationName(fighter),animation=asset.manifest.animations?.[name];
  if(!animation){name='idle';animation=asset.manifest.animations?.idle}
  if(!animation)return null;
  const base=animation.frames||[],frames=fighter.appearance==='up'&&animation.variants?.up?.length===base.length?animation.variants.up:base;
  if(!frames.length)return null;
  const duration=Math.max(25,animation.frameDuration||100),index=animation.loop?Math.floor(fighter.animationClock/duration)%frames.length:Math.min(frames.length-1,Math.floor(fighter.animationClock/duration));
  const frame=asset.manifest.frames?.[frames[index]];if(!frame)return null;
  return{frame,source:frame.source,atlas:asset.manifest.atlas};
}

class CombatAudio{
  constructor(){this.context=null}
  enable(){if(!this.context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext)this.context=new AudioContext()}this.context?.resume?.()}
  tone(frequency=220,duration=.06,type='square',gain=.035,slide=0,delay=0){
    const context=this.context;if(!context)return;
    const oscillator=context.createOscillator(),volume=context.createGain(),now=context.currentTime+Math.max(0,delay);
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);if(slide)oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,frequency+slide),now+duration);
    volume.gain.setValueAtTime(Math.max(.0001,gain),now);volume.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(volume).connect(context.destination);oscillator.start(now);oscillator.stop(now+duration+.02);
  }
  play(name,intensity=0,fighterId=''){
    const table={
      light:[210,.045,'square',.028,-70],heavy:[115,.09,'sawtooth',.045,-50],launcher:[155,.11,'sawtooth',.05,150],block:[520,.055,'triangle',.028,-110],perfect:[880,.08,'sine',.045,260],guardBreak:[85,.18,'sawtooth',.055,-35],projectile:[290,.08,'square',.035,180],dash:[180,.05,'triangle',.022,100],dashRrvvfo:[205,.055,'triangle',.026,135],dashRevvfo:[155,.065,'sine',.028,260],dashWade:[610,.045,'square',.025,420],dashBark:[88,.075,'triangle',.036,-20],dashPhanta:[270,.07,'sine',.026,-110],dashCreed:[350,.055,'triangle',.024,180],wallSplat:[82,.14,'square',.06,-34],groundBounce:[118,.12,'sawtooth',.054,96],pursuitStart:[430,.075,'triangle',.038,250],pursuitLight:[260,.055,'square',.034,130],pursuitHeavy:[74,.14,'sawtooth',.064,-30],pursuitTech:[720,.085,'sine',.046,-340],pursuitBuffer:[950,.035,'sine',.022,190],pursuitEnd:[220,.045,'triangle',.018,-80],focusStart:[340,.12,'sine',.026,180],focusTick:[690,.035,'sine',.014,70],crowdHit:[145,.08,'triangle',.018,90],crowdRoar:[95,.32,'sawtooth',.032,80],ko:[72,.28,'sawtooth',.06,-35]
    };
    if(name==='pursuitChase'){const amount=Math.max(0,Math.min(1,Number(intensity)||0));this.tone(300+amount*170,.045,'triangle',.014+amount*.009,110);return}
    const cue=table[name]||table.light;this.tone(...cue);
    if(name==='wallSplat'){this.tone(46,.16,'sine',.038,-8,.012);this.tone(620,.035,'square',.018,-260,.01)}
    else if(name==='groundBounce'){this.tone(58,.13,'sine',.034,-12,.008)}
    else if(name==='pursuitHeavy'){this.tone(46,.15,'sine',.036,-8,.01)}
    else if(name==='pursuitTech'){this.tone(280,.05,'triangle',.02,220,.02)}
    if(fighterId&&['light','heavy','launcher','pursuitLight','pursuitHeavy'].includes(name)){
      const strong=['heavy','launcher','pursuitHeavy'].includes(name),layers={
        rrvvfo:[strong?520:680,strong?.055:.03,'triangle',strong?.018:.011,strong?180:95],
        revvfo:[strong?135:220,strong?.075:.04,'sine',strong?.020:.012,strong?250:130],
        wade:[strong?760:980,strong?.035:.024,'square',strong?.014:.009,strong?420:260],
        bark:[strong?54:82,strong?.12:.065,'triangle',strong?.032:.018,strong?-8:-16],
        phanta:[strong?245:360,strong?.08:.045,'sine',strong?.017:.010,strong?-120:-70],
        creed:[strong?430:610,strong?.055:.03,'triangle',strong?.015:.009,strong?210:145]
      },layer=layers[fighterId];if(layer)this.tone(...layer, .008)
    }
  }
}

class ArenaFighter{
  constructor(id,name,x,z,cpu,accent,appearance='down'){Object.assign(this,{id,name,x,z,cpu,accent,appearance});this.asset=null;this.maxHp=100;this.reset(x,z)}
  reset(x,z){
    const maxHp=Math.max(1,Number(this.maxHp)||100);
    Object.assign(this,{x,z,y:0,vy:0,kvx:0,kvz:0,moveVX:0,moveVZ:0,runTime:0,speedRatio:0,maxHp,hp:maxHp,en:START_ENERGY,guard:100,momentum:0,grounded:true,moving:false,moveX:0,moveZ:0,block:false,blockAge:0,blockLockout:0,guardDelay:0,guardBreak:0,stun:0,inv:0,knockdown:0,dashTime:0,dashElapsed:0,dashRecovery:0,dashCooldown:0,dashX:0,dashZ:0,airDashUsed:false,attackState:null,abilityState:null,characterAbilityState:null,abilityRecovery:0,flash:0,aimX:this.id==='rrvvfo'?1:-1,aimZ:0,animation:'idle',animationClock:0,visualAction:'',visualActionTime:0,lens:0,lensAutoDodges:0,lensStartHp:maxHp,lensWasHit:false,lensPrediction:'',lensPredictionTriggered:false,lensPredictionTimer:0,comboHits:0,comboDamage:0,comboTimer:0,comboTextTime:0,lightChain:0,airHitsTaken:0,juggleProtection:0,bodyCenter:68,collisionRadius:29,charging:false,chargePulse:0,stallTime:0,grabCooldown:0,grabRecovery:0,armorDurability:0,counterWindow:0,counterRecovery:0,counterCooldown:0,counterKind:'',breakerCooldown:0,breakerLocked:false,pursuitWindow:0,pursuitUsed:false,pursuitTime:0,pursuitTotalTime:0,pursuitFollowupWindow:0,pursuitFinishWindow:0,pursuitBuffered:'',pursuitBufferFlash:0,pursuitReadyFlash:0,pursuitAttackReady:false,pursuitTarget:null,pursuitEscapeCooldown:0,pursuitLockOn:0,pursuitAudioTimer:0,pursuitDefenseSeen:0,pursuitTechFlash:0,hudFullEnergy:false,hudCriticalHealth:false,comboWallSplatUsed:false,comboGroundBounceUsed:false,wallSplat:0,groundBouncePending:0,groundBounceOwner:null,dashFeint:1,dashArmor:0,edgePressureHits:0,edgePressureTimer:0,ringOutFall:0,ringOutComplete:false,ringOutVX:0,ringOutVZ:0,edgeTime:0,respawnProtection:0,actionBuffer:'',actionBufferTime:0,hurtIdentityFlash:0,lastHitKind:'',victoryPoseTime:0,identityPulse:0,landingImpact:0,cooldowns:{fireBlast:0,shotsOfAgony:0,objectSwap:0,lensOfTruth:0,ultimate:0,astrylteBlast:0,lightningBlast:0,lightningDash:0,thunderstorm:0,lightningBeam:0,groundQuake:0,rockArmor:0,earthWall:0,seismicCounter:0,rockShot:0,characterSpecial:0},aiThink:0,aiReaction:0,aiMove:{x:0,z:0},aiPulse:{},aiBlock:false,aiIntent:'idle',aiQueuedAbility:null,aiHabit:{chargePunishes:0,blocksSeen:0,edgePressure:0},combatHabits:{blockTime:0,chargeTime:0,projectiles:0,launchers:0,repeats:0,lastAction:'',actionLatch:''}});
    resetFocusRecovery(this);
  }
  setAnimation(name){if(name===this.animation)return;this.animation=name;this.animationClock=0}
  jump(){if(this.grounded&&!this.stun&&!this.guardBreak&&!this.attackState&&!this.dashRecovery){this.grounded=false;this.vy=410;this.animationClock=0;return true}return false}
}

class ArenaBattle{
  constructor(stageId='dojo'){
    this.root=installUI();this.canvas=this.root.querySelector('[data-world-layer]');this.fighterCanvas=this.root.querySelector('[data-fighter-layer]');this.fighterContext=this.fighterCanvas.getContext('2d',{alpha:true});this.renderer=new WebGLArenaRenderer(this.canvas);this.audio=new CombatAudio();this.stage=getArenaStage(stageId);
    this.active=false;this.paused=false;this.accumulator=0;this.last=0;this.raf=0;this.hitstop=0;this.cameraShake=0;this.flashTime=0;
    const [spawn1,spawn2]=this.stage.spawnPoints;this.fighters=[new ArenaFighter('rrvvfo','Rrvvfo',spawn1.x,spawn1.z,false,'#ff493d','down'),new ArenaFighter('revvfo','Revvfo',spawn2.x,spawn2.z,true,'#a855f7','down')];
    this.trainingMode=false;this.localMode=false;this.matchMode='cpu';this.allowRandomRematch=true;this.identityGuideOpen=false;this.trainingDummy='stand';this.trainingPursuitDefense='never';this.trainingRecovery='never';this.trainingDrill='free';this.trainingTrial=createTrainingTrialState('free');this.feedback=combatFeedbackPreferences();this.camera=initialCameraState(this.stage,this.fighters);this.stageSelectIndex=0;this.pursuitCameraBlend=0;this.pursuitImpactHold=0;this.pursuitPromptLinger=0;this.pursuitPromptLastText='';this.identityHintsShown=new Set();this.selectedAbilitySlot=0;this.combatEventSerial=0;this.particles=[];this.projectiles=[];this.agonyClones=[];this.thunderZones=[];this.quakes=[];this.earthWalls=[];this.breakables=[];this.noticeTime=0;this.koTarget=KO_TARGET;this.scores=[0,0];this.round=1;this.time=Infinity;this.phase='intro';this.phaseTime=1.55;this.lastLoser=-1;this.ringOutEnabled=false;this.onRingOut=null;this.stageBoundaryPulse=0;this.crowdExcitement=0;this.announcerCooldown=0;this.difficulty=this.readDifficulty();this.lensMastery=this.readLensMastery();
    this.controlSettingsPaused=false;this.controls=new ArenaControlManager(this.root,{onPause:()=>this.togglePause(),onExit:()=>this.exit(),onAbility:(slot,side=1)=>this.castAbility(slot,side),onSettings:()=>this.notice('CONTROL LAYOUT SAVED'),onOpenSettings:()=>{if(!this.paused){this.controlSettingsPaused=true;this.togglePause()}},onCloseSettings:()=>{if(this.controlSettingsPaused){this.controlSettingsPaused=false;this.togglePause()}}});
    this.root.querySelector('[data-exit]').onclick=()=>this.exit();this.root.querySelector('[data-return]').onclick=()=>this.exit();this.root.querySelector('[data-restart]').onclick=async()=>{if(this.beforeRestart&&await this.beforeRestart()===false)return;this.restart()};this.root.querySelector('[data-rematch]').onclick=async()=>{if(this.beforeRestart&&await this.beforeRestart()===false)return;this.restart()};this.root.querySelector('[data-random-rematch]').onclick=async()=>{if(this.beforeRestart&&await this.beforeRestart()===false)return;this.randomRematch()};this.root.querySelector('[data-change-arena]').onclick=()=>this.showStageSelect();this.root.querySelector('[data-stage-back]').onclick=()=>this.exit();this.renderStageSelect();this.root.querySelectorAll('[data-arena-slot]').forEach(button=>button.addEventListener('click',()=>this.castAbility(Number(button.dataset.arenaSlot))));this.root.querySelector('[data-training-reset]')?.addEventListener('click',()=>this.restart());this.root.querySelector('[data-training-reset-combat]')?.addEventListener('click',()=>this.resetCombatState());this.root.querySelector('[data-training-dummy]')?.addEventListener('change',event=>{this.trainingDummy=event.target.value;if(this.trainingDummy==='recovery'){const dummy=this.fighters[1];dummy.hp=65;dummy.en=100;dummy.recoverableHp=20}this.notice(`DUMMY • ${this.trainingDummy.toUpperCase()}`)});this.root.querySelector('[data-training-pursuit-defense]')?.addEventListener('change',event=>{this.trainingPursuitDefense=event.target.value;this.notice(`PURSUIT DEFENSE • ${this.trainingPursuitDefense.toUpperCase()}`)});this.root.querySelector('[data-training-recovery]')?.addEventListener('change',event=>{this.trainingRecovery=event.target.value;this.notice(`FOCUS RECOVERY • ${this.trainingRecovery.toUpperCase()}`)});this.root.querySelector('[data-training-drill]')?.addEventListener('change',event=>{this.trainingDrill=event.target.value;this.applyTrainingDrill()});this.root.querySelector('[data-training-identity]')?.addEventListener('click',()=>this.showIdentityGuide(true));this.root.querySelector('[data-identity-close]')?.addEventListener('click',()=>this.showIdentityGuide(false));this.root.querySelector('[data-training-moves]')?.addEventListener('click',()=>this.notice('M1/J LIGHT • K HEAVY • I LAUNCHER • DASH AFTER LAUNCH TO PURSUE • BUFFER LIGHT/HEAVY DURING CHASE • DASH TO TECH AN INCOMING PURSUIT • U GRAB • C CHARGE • BLOCK + CHARGE FOCUS RECOVERY • R BREAKER • Q COUNTER • M2/L BLOCK • 1–5 ABILITIES',3));this.root.querySelector('[data-training-advanced]')?.addEventListener('click',()=>{this.exit();window.__openClassicTraining?.()});this.root.querySelector('[data-training-toggle]')?.addEventListener('click',()=>this.setTrainingPanelCollapsed(!this.root.querySelector('[data-arena-training-panel]')?.classList.contains('collapsed')));this.root.querySelector('[data-stage-prev]')?.addEventListener('click',()=>this.shiftStageSelection(-1));this.root.querySelector('[data-stage-next]')?.addEventListener('click',()=>this.shiftStageSelection(1));
  }

  configureMatch({mode='cpu',fighters=['rrvvfo','revvfo'],appearances=['down','down'],stageId='dojo',difficulty='normal',koTarget=KO_TARGET,allowRandomRematch=true}={}){
    this.stopMatch();
    this.matchMode=['cpu','local','training'].includes(mode)?mode:'cpu';
    this.trainingMode=this.matchMode==='training';
    this.localMode=this.matchMode==='local';
    this.difficulty=['easy','normal','hard'].includes(difficulty)?difficulty:'normal';
    this.koTarget=Math.max(1,Math.min(5,Number(koTarget)||KO_TARGET));this.allowRandomRematch=allowRandomRematch!==false;
    this.setStage(stageId);
    const [spawn1,spawn2]=this.stage.spawnPoints;
    const first=fighterPreset(fighters[0]||'rrvvfo',1,false,appearances[0]||'down');
    const second=fighterPreset(fighters[1]||'revvfo',2,!this.localMode,appearances[1]||'down');
    this.fighters=[
      new ArenaFighter(first.id,first.name,spawn1.x,spawn1.z,first.cpu,first.accent,first.appearance),
      new ArenaFighter(second.id,second.name,spawn2.x,spawn2.z,second.cpu,second.accent,second.appearance)
    ];
    this.refreshPlayerHotbar();
    return this;
  }


  feel(fighter){return fighterFeelFor(fighter?.id)}
  queueAction(fighter,action,duration=this.feel(fighter).inputBuffer){if(!fighter||!['light','heavy','launcher'].includes(action))return false;fighter.actionBuffer=action;fighter.actionBufferTime=Math.max(Number(duration)||0,ACTION_BUFFER_EPSILON);return true}
  consumeAction(fighter){if(!fighter?.actionBuffer||fighter.actionBufferTime<=0)return'';const action=fighter.actionBuffer;fighter.actionBuffer='';fighter.actionBufferTime=0;return action}
  showIdentityGuide(show=true){const panel=this.root.querySelector('[data-identity-guide]');if(!panel)return;this.identityGuideOpen=Boolean(show);this.controls.releaseAll();panel.classList.toggle('hidden',!show);panel.querySelectorAll('[data-identity]').forEach(card=>card.classList.toggle('current',card.dataset.identity===this.fighters[0]?.id));if(show)this.notice(`${this.fighters[0].name.toUpperCase()} • ${this.feel(this.fighters[0]).label}`,1.4)}
  randomRematch(){
    if(!this.allowRandomRematch){this.notice('RANDOM REMATCH IS DISABLED DURING STORY',1.2);return}
    const current=this.fighters.map(f=>f.id),pool=PLAYABLE_ROSTER_IDS.filter(Boolean),pick=exclude=>{const options=pool.filter(id=>id!==exclude);return options[Math.floor(Math.random()*options.length)]||pool[0]};
    const first=pick(current[0]),second=pick(first),stages=listArenaStages().filter(stage=>stage.available),stage=stages[Math.floor(Math.random()*stages.length)]?.id||this.stage.id;
    this.configureMatch({mode:this.matchMode,fighters:[first,second],appearances:['down','down'],stageId:stage,difficulty:this.difficulty,koTarget:this.koTarget});this.start();this.notice(`RANDOM REMATCH • ${ROSTER[first]?.n||first} VS ${ROSTER[second]?.n||second}`,1.6)
  }

  refreshPlayerHotbar(){
    const fighter=this.fighters[0],loadout=playerLoadout(fighter.id);
    this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>{
      const ability=loadout[index]||loadout[0];
      button.classList.toggle('ultimate',Boolean(ability?.category==='power'));
      button.classList.toggle('loadoutLocked',Boolean(ability?.locked));
      button.setAttribute('aria-disabled',ability?.locked?'true':'false');
      button.setAttribute('aria-label',`Slot ${index+1}: ${ability?.label||'Unavailable'}`);
      const category=button.querySelector('.arenaCategory');if(category)category.textContent=SPECIAL_CATEGORIES[ability?.category||'trick']?.label||'TRICK';
      const icon=button.querySelector('.arenaIcon');if(icon)icon.textContent=ability?.icon||'—';
      const name=button.querySelector('.arenaAbilityName');if(name)name.textContent=ability?.label||'Unavailable';
      const cost=button.querySelector('.arenaCost');if(cost)cost.textContent=ability?.locked?'LEARN LATER':`${ability?.cost||0} ENERGY`;
      const state=button.querySelector('[data-arena-state]');if(state)state.textContent=ability?.locked?'LOCKED':'READY';
    });
  }

  playerAbility(fighter,slot){return playerLoadout(fighter.id)[slot-1]||null}

  readDifficulty(){try{return JSON.parse(localStorage.getItem('pxQolLastActivity')||'null')?.difficulty||'normal'}catch{return'normal'}}
  readLensMastery(){try{return clamp(Number(localStorage.getItem(LENS_MASTERY_KEY)||0),0,100)}catch{return 0}}
  saveLensMastery(value){this.lensMastery=clamp(Math.round(value),0,100);try{localStorage.setItem(LENS_MASTERY_KEY,String(this.lensMastery))}catch{}return this.lensMastery}
  lensCosts(){const ratio=this.lensMastery/100;return{energy:Math.round(60-15*ratio),hp:Math.round(25-15*ratio),duration:4+ratio*1.5,autoDodges:this.lensMastery>=100?2:0}}
  predictedAction(foe){const exact=String(foe.attackState?.def?.kind||foe.aiQueuedAbility||foe.aiIntent||'approach').toLowerCase();if(this.lensMastery>=70)return exact.toUpperCase().replaceAll('_',' ');if(exact.includes('beam')||exact.includes('blast')||exact.includes('projectile'))return'RANGED PRESSURE';if(exact.includes('dash')||exact.includes('approach')||exact.includes('move'))return'MOVEMENT APPROACH';if(exact.includes('guard')||exact.includes('block'))return'DEFENSIVE ACTION';if(exact.includes('heavy')||exact.includes('launcher'))return'HEAVY PRESSURE';return'MELEE PRESSURE'}
  loadFighterAsset(id){return loadSprite(this.renderer,id)}
  ensureFighterAsset(fighter,id=fighter?.id,{force=false}={}){
    if(!fighter||!id)return Promise.resolve(null);
    const expectedId=String(id);
    if(!force&&fighter.asset&&fighter.assetId===expectedId)return Promise.resolve(fighter.asset);
    const token=(Number(fighter.assetLoadToken)||0)+1;
    fighter.assetLoadToken=token;
    return this.loadFighterAsset(expectedId).then(asset=>{
      if(!this.active||fighter.assetLoadToken!==token||fighter.id!==expectedId)return asset;
      fighter.asset=asset;
      fighter.assetId=asset?expectedId:null;
      return asset;
    });
  }
  clearCombatObjects(){this.projectiles=[];this.agonyClones=[];this.thunderZones=[];this.quakes=[];this.earthWalls=[]}
  clearPursuitState(fighter){
    if(!fighter)return;
    fighter.pursuitWindow=0;fighter.pursuitUsed=false;fighter.pursuitTime=0;fighter.pursuitTotalTime=0;fighter.pursuitFollowupWindow=0;fighter.pursuitFinishWindow=0;fighter.pursuitBuffered='';fighter.pursuitBufferFlash=0;fighter.pursuitReadyFlash=0;fighter.pursuitAttackReady=false;fighter.pursuitTarget=null;fighter.pursuitLockOn=0;fighter.pursuitAudioTimer=0;fighter.pursuitTechFlash=0;fighter.comboWallSplatUsed=false;fighter.comboGroundBounceUsed=false;fighter.wallSplat=0;fighter.groundBouncePending=0;fighter.groundBounceOwner=null;
  }
  resetCombatState({notice=true}={}){
    for(const fighter of this.fighters){this.clearPursuitState(fighter);resetFocusRecovery(fighter);fighter.attackState=null;fighter.abilityState=null;fighter.characterAbilityState=null;fighter.stun=0;fighter.knockdown=0;fighter.guardBreak=0;fighter.inv=0;fighter.kvx=0;fighter.kvz=0;fighter.vy=0;fighter.y=0;fighter.grounded=true;fighter.block=false;fighter.charging=false;fighter.dashTime=0;fighter.dashRecovery=0;fighter.dashCooldown=0;fighter.pursuitEscapeCooldown=0;fighter.abilityRecovery=0;fighter.grabRecovery=0;fighter.counterWindow=0;fighter.counterRecovery=0;fighter.visualAction='';fighter.visualActionTime=0;fighter.comboTimer=0;fighter.comboHits=0;fighter.comboDamage=0;fighter.actionBuffer='';fighter.actionBufferTime=0;fighter.hurtIdentityFlash=0;fighter.victoryPoseTime=0;fighter.airHitsTaken=0;fighter.juggleProtection=0;fighter.ringOutFall=0;fighter.ringOutComplete=false}
    this.hitstop=0;this.cameraShake=0;this.flashTime=0;this.pursuitCameraBlend=0;this.pursuitImpactHold=0;this.pursuitPromptLinger=0;this.pursuitPromptLastText='';this.clearCombatObjects();this.particles=[];this.root.classList.remove('pursuit-active');this.root.querySelector('[data-pursuit-prompt]')?.classList.remove('show','ready','danger');this.root.querySelectorAll('.resourceTrack.techReady').forEach(node=>node.classList.remove('techReady'));this.controls.releaseAll();if(notice)this.notice('COMBAT STATE RESET • PURSUIT / SPLAT / BOUNCE CLEARED',1.2);this.hud();
  }
  isNearStageWall(fighter,margin=80){const b=this.stage.bounds;return fighter.x<b.minX+margin||fighter.x>b.maxX-margin||fighter.z<b.minZ+margin||fighter.z>b.maxZ-margin}
  isNearRingEdge(fighter,margin=80){return Boolean(this.ringOutEnabled&&this.stage.id==='tournament'&&this.isNearStageWall(fighter,margin))}
  isRingOut(fighter){return Boolean(this.ringOutEnabled&&this.stage.id==='tournament'&&fighter.ringOutComplete)}

  setTrainingPanelCollapsed(collapsed=false){
    const panel=this.root.querySelector('[data-arena-training-panel]'),toggle=this.root.querySelector('[data-training-toggle]');if(!panel||!toggle)return;
    panel.classList.toggle('collapsed',Boolean(collapsed));toggle.setAttribute('aria-expanded',String(!collapsed));toggle.textContent=collapsed?'TRAINING PANEL • SHOW':'TRAINING PANEL • HIDE';
  }
  shiftStageSelection(delta=0){
    const stages=listArenaStages();if(!stages.length)return;this.stageSelectIndex=(this.stageSelectIndex+Number(delta)+stages.length)%stages.length;this.updateStageSelectFocus();
  }
  updateStageSelectFocus(){
    const cards=[...this.root.querySelectorAll('[data-stage-card]')];if(!cards.length)return;this.stageSelectIndex=Math.max(0,Math.min(cards.length-1,this.stageSelectIndex));cards.forEach((card,index)=>card.classList.toggle('is-current',index===this.stageSelectIndex));const position=this.root.querySelector('[data-stage-position]');if(position)position.textContent=`${this.stageSelectIndex+1} / ${cards.length}`;cards[this.stageSelectIndex]?.scrollIntoView?.({block:'nearest',inline:'center'});
  }

  renderStageSelect(){
    const grid=this.root.querySelector('[data-arena-stage-grid]');if(!grid)return;
    const stages=listArenaStages(),selected=Math.max(0,stages.findIndex(stage=>stage.id===this.stage.id));this.stageSelectIndex=selected;
    grid.innerHTML=stages.map((stage,index)=>`<button class="arenaStageOption ${stage.id} ${index===selected?'is-current':''}" data-stage-card="${stage.id}" ${stage.available?'':`disabled aria-disabled="true"`}><strong>${stage.name}</strong><span>${stage.size} • ${stage.boundary} • ${stage.archetype}</span><div class="stageTags">${(stage.tags||[]).map(tag=>`<b>${tag}</b>`).join('')}</div><span class="stageDescription">${stage.description}</span><span class="stageRecommend">RECOMMENDED • ${stage.recommended}</span><span>${stage.dimensions}</span><em>${stage.available?'PLAYABLE':'COMING NEXT'}</em></button>`).join('');
    grid.querySelectorAll('[data-stage-card]').forEach(button=>button.addEventListener('click',()=>this.selectStage(button.dataset.stageCard)));this.updateStageSelectFocus();
  }

  stopMatch(){
    if(this.active){this.active=false;cancelAnimationFrame(this.raf);this.controls.stop()}
    for(const fighter of this.fighters){this.clearPursuitState(fighter);endFocusRecovery(fighter,{applyRecovery:false})}this.pursuitCameraBlend=0;this.pursuitImpactHold=0;this.pursuitPromptLinger=0;this.pursuitPromptLastText='';this.hitstop=0;this.cameraShake=0;this.paused=false;this.controlSettingsPaused=false;this.identityGuideOpen=false;this.root.querySelector('[data-identity-guide]')?.classList.add('hidden');this.root.classList.remove('paused','pursuit-active');this.root.querySelector('[data-pursuit-prompt]')?.classList.remove('show','ready','danger');this.root.querySelectorAll('.resourceTrack.techReady,.resourceTrack.techSpent').forEach(node=>node.classList.remove('techReady','techSpent'));this.root.querySelector('[data-result]').classList.add('hidden');this.clearFighterLayer();this.updateLensBlindness();
  }

  showStageSelect(){
    this.stopMatch();this.renderStageSelect();this.root.classList.remove('hidden');this.root.querySelector('[data-arena-stage-select]').classList.remove('hidden');['startScreen','mainMenuScreen','menuScreen','gameScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    this.updateStageSelectFocus();this.root.querySelector(`[data-stage-card="${this.stage.id}"]`)?.focus();
  }

  selectStage(stageId){
    const entry=listArenaStages().find(stage=>stage.id===stageId);if(!entry?.available)return;
    this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.setStage(stageId);this.start();
  }

  setStage(stageId='dojo'){
    if(this.active)throw new Error('Cannot change arenas during an active match.');
    this.stage=getArenaStage(stageId);this.stageProfile=stageProfile(this.stage.id);this.ringOutEnabled=this.stage.id==='tournament'&&this.matchMode!=='training';this.stageBoundaryPulse=0;this.crowdExcitement=0;
    const [spawn1,spawn2]=this.stage.spawnPoints;
    this.fighters[0].reset(spawn1.x,spawn1.z);this.fighters[1].reset(spawn2.x,spawn2.z);this.camera=initialCameraState(this.stage,this.fighters);
    return this.stage;
  }

  start(){
    if(this.active)return;this.feedback=combatFeedbackPreferences();this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.active=true;this.root.querySelector('[data-stage-name]').textContent=`${this.stage.name.toUpperCase()} • ${this.stageProfile?.archetype||'NEUTRAL'}`;this.canvas.setAttribute('aria-label',`${this.stage.name} WebGL perspective arena`);this.audio.enable();this.root.classList.remove('hidden','paused');['startScreen','mainMenuScreen','menuScreen','gameScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));this.controls.start();this.root.classList.toggle('arenaTrainingMode',this.trainingMode);this.root.querySelector('[data-arena-training-panel]')?.classList.toggle('hidden',!this.trainingMode);this.setTrainingPanelCollapsed(this.trainingMode&&this.controls.touchEnabled());this.restart();this.last=performance.now();this.raf=requestAnimationFrame(timestamp=>this.loop(timestamp));
    this.fighters.forEach(fighter=>{void this.ensureFighterAsset(fighter,fighter.id)});
  }

  exit(){this.stopMatch();this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.root.classList.add('hidden');document.getElementById('mainMenuScreen')?.classList.remove('hidden')}
  togglePause(){this.paused=!this.paused;this.root.classList.toggle('paused',this.paused);this.controls.releaseAll();if(this.paused){this.root.classList.remove('pursuit-active');const prompt=this.root.querySelector('[data-pursuit-prompt]');prompt?.classList.remove('show','ready','danger');this.root.querySelectorAll('.resourceTrack.techReady').forEach(node=>node.classList.remove('techReady'))}else this.hud()}
  restart(){this.scores=[0,0];this.round=1;this.root.querySelector('[data-result]').classList.add('hidden');this.newRound();if(this.trainingMode){this.phase='play';this.hideBanner();if(this.trainingDummy==='recovery'){const dummy=this.fighters[1];dummy.hp=65;dummy.en=100;dummy.recoverableHp=20}resetTrainingTrial(this.trainingTrial,this.trainingDrill);this.updateTrainingTrialPanel();this.notice('ARENA TRAINING • PRACTICE FREELY',1.4)}}
  applyTrainingDrill(){
    const foe=this.fighters[1],player=this.fighters[0];this.restart();resetTrainingTrial(this.trainingTrial,this.trainingDrill);
    if(this.trainingDrill==='parry'){this.trainingDummy='cpu';this.notice('TRIAL • PERFECT-PARRY THREE ATTACKS',2)}
    else if(this.trainingDrill==='charge'){this.trainingDummy='stand';player.en=0;this.notice('TRIAL • REACH 100 ENERGY WITHOUT MOVING',2)}
    else if(this.trainingDrill==='recovery'){this.trainingDummy='stand';player.hp=70;player.en=100;player.recoverableHp=20;this.notice('TRIAL • HOLD BLOCK + CHARGE TO RECOVER 5 HP',2.2)}
    else if(this.trainingDrill==='combo'){this.trainingDummy='stand';this.trainingPursuitDefense='never';this.notice('TRIAL • LAUNCH → DASH → LIGHT OR HEAVY',2)}
    else if(this.trainingDrill==='finisher'){this.trainingDummy='stand';this.trainingPursuitDefense='never';this.notice('IDEAL PURSUIT • WATCH THE HIGHLIGHTED TIMING WINDOWS',2.4)}
    else if(this.trainingDrill==='wall'){this.trainingDummy='stand';this.trainingPursuitDefense='never';const b=this.stage.bounds;foe.x=b.maxX-42;foe.z=(b.minZ+b.maxZ)/2;player.x=foe.x-150;player.z=foe.z;this.notice('TRIAL • DRIVE THE DUMMY INTO THE WALL WITH A STRONG HIT',2)}
    else if(this.trainingDrill==='bounce'){this.trainingDummy='stand';this.trainingPursuitDefense='never';this.notice('TRIAL • LAND A PURSUIT HEAVY AND TRIGGER THE GROUND BOUNCE',2)}
    else if(this.trainingDrill==='escape'){this.trainingDummy='pursuit';this.trainingPursuitDefense='never';player.en=Math.max(player.en,PURSUIT_TUNING.escapeCost);this.notice(`TRIAL • DASH AS THE CPU PURSUIT REACHES YOU • ${PURSUIT_TUNING.escapeCost} ENERGY`,2)}
    else if(this.trainingDrill==='pressure'){this.trainingDummy='pursuit';this.trainingPursuitDefense='occasional';player.en=100;this.notice('TRIAL • ESCAPE TWO PURSUITS, THEN PUNISH',2)}
    else if(this.trainingDrill==='guard'){this.trainingDummy='block';foe.guard=36;this.notice('TRIAL • BREAK GUARD → LAND GRAB',2)}
    else if(this.trainingDrill==='variation'){this.trainingDummy='random';this.notice('TRIAL • CONNECT FIVE DIFFERENT ACTIONS',2)}
    else this.notice('FREE PRACTICE',1);
    const dummySelect=this.root.querySelector('[data-training-dummy]');if(dummySelect)dummySelect.value=this.trainingDummy;
    const defenseSelect=this.root.querySelector('[data-training-pursuit-defense]');if(defenseSelect)defenseSelect.value=this.trainingPursuitDefense;const recoverySelect=this.root.querySelector('[data-training-recovery]');if(recoverySelect)recoverySelect.value=this.trainingRecovery;
    this.updateTrainingTrialPanel();
  }
  recordTrainingEvent(event,detail={}){
    if(!this.trainingMode)return;const result=recordTrainingTrialEvent(this.trainingTrial,event,detail);if(!result.changed)return;this.updateTrainingTrialPanel();
    if(result.completed){this.audio.play('perfect');this.impactFlash('#fff2a3',.18);this.notice(result.grade?`${result.grade}! • TRAINING TRIAL COMPLETE`:'TRAINING TRIAL COMPLETE!',2.2)}
  }
  updateTrainingTrial(dt=0){if(!this.trainingMode)return;const player=this.fighters[0];if(this.trainingDrill==='charge')this.recordTrainingEvent('chargeUpdate',{energy:player.en,moving:player.moving||Math.hypot(player.moveVX||0,player.moveVZ||0)>8});if(this.trainingDrill==='recovery')this.recordTrainingEvent('focusRecovery',{total:player.focusRecoveredTotal});this.updateTrainingTrialPanel()}
  updateTrainingTrialPanel(){
    const card=this.root.querySelector('[data-training-trial-card]');if(!card)return;const view=trainingTrialView(this.trainingTrial),player=this.fighters[0];card.classList.toggle('complete',view.complete);this.root.querySelector('[data-training-trial-label]').textContent=view.complete?(view.grade?`${view.grade} • COMPLETE`:'TRIAL COMPLETE'):view.label.toUpperCase();this.root.querySelector('[data-training-trial-goal]').textContent=view.goal;this.root.querySelector('[data-training-trial-message]').textContent=view.message;this.root.querySelector('[data-training-trial-meter]').style.width=`${view.percent}%`;const wall=this.root.querySelector('[data-training-wall-count]'),bounce=this.root.querySelector('[data-training-bounce-count]');if(wall)wall.textContent=`${player?.comboWallSplatUsed?1:0}/1`;if(bounce)bounce.textContent=`${player?.comboGroundBounceUsed?1:0}/1`;
  }

  newRound(){const [spawn1,spawn2]=this.stage.spawnPoints;this.time=Infinity;this.phase='intro';this.phaseTime=1.25;this.hitstop=0;this.cameraShake=0;this.fighters[0].reset(spawn1.x,spawn1.z);this.fighters[1].reset(spawn2.x,spawn2.z);this.camera=initialCameraState(this.stage,this.fighters);this.pursuitCameraBlend=0;this.pursuitImpactHold=0;this.pursuitPromptLinger=0;this.pursuitPromptLastText='';this.particles=[];this.clearCombatObjects();this.root.classList.remove('pursuit-active');this.noticeTime=0;this.notice('');this.banner(`BATTLE ${this.round} • FIRST TO ${this.koTarget} ${this.koTarget===1?'KO':'KOs'}`);this.hud()}
  banner(text){const banner=this.root.querySelector('[data-banner]');banner.textContent=text;banner.classList.remove('hidden')}
  hideBanner(){this.root.querySelector('[data-banner]').classList.add('hidden')}

  input(side=1,options){return this.controls.read(side,options)}

  observeHabits(fighter,dt){
    const habit=fighter.combatHabits||(fighter.combatHabits={blockTime:0,chargeTime:0,projectiles:0,launchers:0,repeats:0,lastAction:'',actionLatch:''});
    habit.blockTime=fighter.block?Math.min(4,habit.blockTime+dt):decayHabit(habit.blockTime,dt,.55);
    habit.chargeTime=fighter.charging?Math.min(4,habit.chargeTime+dt):decayHabit(habit.chargeTime,dt,.7);
    habit.projectiles=decayHabit(habit.projectiles,dt,.24);
    habit.launchers=decayHabit(habit.launchers,dt,.3);
    habit.repeats=decayHabit(habit.repeats,dt,.42);
    let action='idle';
    if(fighter.abilityState)action=fighter.abilityState.ability?.id||'ability';
    else if(fighter.characterAbilityState)action=fighter.characterAbilityState.ability||'special';
    else if(fighter.attackState)action=fighter.attackState.def?.kind||'attack';
    else if(fighter.block)action='block';
    else if(fighter.charging)action='charge';
    if(action!==habit.actionLatch){
      if(action===habit.lastAction&&action!=='idle')habit.repeats=Math.min(5,habit.repeats+1);
      if(action!=='idle')habit.lastAction=action;
      habit.actionLatch=action;
    }
  }

  cpu(fighter,foe,dt){
    if(this.trainingMode&&this.trainingDummy!=='cpu'){
      const tick=Math.floor(performance.now()/16.67),afterHit=fighter.stun>0||fighter.comboTimer>0;
      const incomingPursuit=foe.pursuitTime>0&&foe.pursuitTarget===fighter,pursuitDefense=this.trainingPursuitDefense||'never';
      if(incomingPursuit&&pursuitTechAvailable(fighter.en,fighter.pursuitEscapeCooldown)){const shouldTech=pursuitDefense==='always'||(pursuitDefense==='occasional'&&tick%4===0)||(pursuitDefense==='repeated'&&fighter.pursuitDefenseSeen>=2);if(shouldTech){const toward=aimVector(fighter,foe);return{x:-toward.z,z:toward.x,jump:false,light:false,heavy:false,launcher:false,dash:true,block:false,charge:false,grab:false,breaker:false,counter:false,special:false}}}
      if(this.trainingDummy==='perfect')return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:tick%110<12,charge:false,grab:false,breaker:false,counter:false,special:false};
      if(this.trainingDummy==='counter')return{x:0,z:0,jump:false,light:afterHit&&tick%70<2,heavy:false,launcher:false,dash:false,block:false,charge:false,grab:false,breaker:false,counter:afterHit&&tick%90<2,special:false};
      if(this.trainingDummy==='tech')return{x:0,z:0,jump:!fighter.grounded&&tick%18<2,light:false,heavy:false,launcher:false,dash:!fighter.grounded&&tick%44<2,block:false,charge:false,grab:false,breaker:afterHit&&tick%80<2,counter:false,special:false};
      if(this.trainingDummy==='pursuit'){const phase=tick%210,dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.hypot(dx,dz),toward=normalizeMovement(dx,dz);return{x:distance>105?toward.x:0,z:distance>105?toward.z:0,jump:false,light:false,heavy:false,launcher:phase===70&&distance<125,dash:fighter.pursuitWindow>0&&!fighter.pursuitUsed,block:false,charge:false,grab:false,breaker:false,counter:false,special:false}}
      if(this.trainingDummy==='recovery'){const should=this.trainingRecovery==='always'||(this.trainingRecovery==='safe'&&Math.hypot(foe.x-fighter.x,foe.z-fighter.z)>290)||(this.trainingRecovery==='low'&&fighter.hp<55&&Math.hypot(foe.x-fighter.x,foe.z-fighter.z)>220);return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:should,charge:should,grab:false,breaker:false,counter:false,special:false}}
      if(this.trainingDummy==='random'){const phase=tick%180;return{x:phase<45?.45:phase<90?-.45:0,z:phase>=90&&phase<135?.4:0,jump:phase===138,light:phase===156,heavy:false,launcher:false,dash:phase===92,block:phase<34,charge:false,grab:phase===70,breaker:afterHit&&phase===120,counter:false,special:false}}
      return{x:0,z:0,jump:false,light:false,heavy:false,launcher:false,dash:false,block:this.trainingDummy==='block',charge:false,grab:false,breaker:false,counter:false,special:false};
    }
    const settings=difficultyProfile(this.difficulty);
    fighter.aiThink-=dt;fighter.aiReaction-=dt;
    if(fighter.aiReaction<=0){
      fighter.aiReaction=settings.reaction*(.85+Math.random()*.35);
      const dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.hypot(dx,dz),toward=normalizeMovement(dx,dz),side=Math.random()<.5?-1:1,wall=stageWallAvoidance(this.stage,fighter.x,fighter.z,this.stage.ai?.wallMargin??70);
      const incoming=this.projectiles.find(projectile=>projectile.owner!==fighter&&Math.hypot(projectile.x-fighter.x,projectile.z-fighter.z)<230);
      const edge=this.isNearRingEdge(fighter,125),foeCharging=!!(foe.charging||foe.focusRecovering||foe.focusRecoveryStartup>0),foeBlocking=!!foe.block,foeWhiff=!!(foe.attackState&&foe.attackState.elapsed>foe.attackState.def.activeEnd),lowGuard=fighter.guard<28,foeApproaching=!!(foe.moving&&((foe.moveX||0)*(-toward.x)+(foe.moveZ||0)*(-toward.z))>.35),safeRecoveryDistance=this.stageProfile?.size==='EXTRA LARGE'?390:this.stageProfile?.size==='LARGE'?330:285,canRecover=fighter.recoverableHp>=2&&fighter.hp/Math.max(1,fighter.maxHp||100)<.70&&fighter.en>=10&&fighter.focusRecoveryRelease<=0&&distance>safeRecoveryDistance&&!foeApproaching&&!incoming&&!edge&&!foe.pursuitWindow&&!foe.pursuitTime;
      const habits=foe.combatHabits||{},adaptiveRoll=Math.random()<settings.adaptation;
      const habitualBlock=adaptiveRoll&&(habits.blockTime||0)>.75;
      const projectilePattern=adaptiveRoll&&(habits.projectiles||0)>1.65;
      const launcherPattern=adaptiveRoll&&(habits.launchers||0)>1.45;
      let moveX=0,moveZ=0,block=false,intent='observe';const pulse={};if(canRecover&&Math.random()<({easy:.05,normal:.16,hard:.26}[this.difficulty]??.16)){block=true;pulse.charge=true;intent='focus recovery'}
      if(intent==='focus recovery'){}
      else if(foe.pursuitTime>0&&foe.pursuitTarget===fighter&&pursuitTechAvailable(fighter.en,fighter.pursuitEscapeCooldown)){const techRate={easy:.08,normal:.28,hard:.48}[this.difficulty]??.28,patternBonus=(foe.combatHabits?.repeats||0)>.9?.12:0;if(Math.random()<Math.min(.58,techRate+patternBonus)){pulse.dash=true;moveX=-toward.z*side;moveZ=toward.x*side;intent='pursuit tech'}}
      else if(fighter.pursuitFollowupWindow>0){pulse.heavy=true;intent='pursuit follow-up'}
      else if(fighter.pursuitWindow>0&&!fighter.pursuitUsed){pulse.dash=true;intent='pursuit chase'}
      else if(edge){moveX=-Math.sign(fighter.x||1)*.75;moveZ=-Math.sign(fighter.z||1)*.75;intent='recover center';fighter.aiHabit.edgePressure++}
      else if(habitualBlock&&distance<118&&fighter.grabCooldown<=0){pulse.grab=true;moveX=toward.x;moveZ=toward.z;intent='adapt: punish repeated guard'}
      else if(projectilePattern&&distance>155){
        if(fighter.id==='bark'&&fighter.en>=24&&fighter.cooldowns.earthWall<=0){pulse.special=true;fighter.aiQueuedAbility='earthWall';intent='adapt: projectile wall'}
        else{moveX=-toward.z*side;moveZ=toward.x*side;pulse.dash=true;intent='adapt: projectile flank'}
      }
      else if(launcherPattern&&distance<145){block=true;moveX=-toward.x*.2;moveZ=-toward.z*.2;intent='adapt: bait launcher'}
      else if(incoming){
        if(fighter.id==='bark'&&fighter.en>=24&&fighter.cooldowns.earthWall<=0){pulse.special=true;fighter.aiQueuedAbility='earthWall';intent='earth wall'}
        else if(Math.random()<.52){moveX=-toward.z*side;moveZ=toward.x*side;pulse.dash=true;intent='projectile dodge'}
        else{block=true;intent='projectile guard'}
      }
      else if(foeCharging){
        fighter.aiHabit.chargePunishes++;moveX=toward.x;moveZ=toward.z;intent='charge punish';
        if(fighter.id==='wade'&&fighter.en>=24&&fighter.cooldowns.lightningDash<=0){pulse.special=true;fighter.aiQueuedAbility='lightningDash'}
        else if(fighter.id==='bark'&&fighter.en>=30&&fighter.cooldowns.groundQuake<=0){pulse.special=true;fighter.aiQueuedAbility='groundQuake'}
        else pulse.dash=true;
      }
      else if(foeBlocking&&distance<78&&fighter.grabCooldown<=0){pulse.grab=true;intent='grab'}
      else if(foeWhiff&&distance<155){moveX=toward.x;moveZ=toward.z;pulse.dash=Math.random()<.44;pulse.heavy=Math.random()<.52;pulse.light=!pulse.heavy;intent='whiff punish'}
      else if(foe.attackState&&distance<150){
        if(fighter.id==='bark'&&fighter.en>=20&&fighter.cooldowns.seismicCounter<=0&&Math.random()<.5){pulse.special=true;fighter.aiQueuedAbility='seismicCounter';intent='seismic counter'}
        else if(Math.random()<settings.block){block=true;intent='guard'}
        else{moveX=-toward.z*side;moveZ=toward.x*side;pulse.dash=Math.random()<.34;intent='sidestep'}
      }
      else if(lowGuard){moveX=-toward.x;moveZ=-toward.z;intent='recover guard';if(distance>260)pulse.charge=true}
      else if(fighter.id==='wade'){
        if(distance>320){moveX=toward.x;moveZ=toward.z;if(fighter.en>=12&&fighter.cooldowns.lightningBlast<=0){pulse.special=true;fighter.aiQueuedAbility='lightningBlast';intent='lightning blast'}}
        else if(distance>165){moveX=toward.x*.58-toward.z*.72*side;moveZ=toward.z*.58+toward.x*.72*side;if(fighter.en>=34&&fighter.cooldowns.thunderstorm<=0&&Math.random()<.33){pulse.special=true;fighter.aiQueuedAbility='thunderstorm';intent='thunderstorm'}else if(Math.random()<.22)pulse.jump=true}
        else{moveX=-toward.z*.55*side;moveZ=toward.x*.55*side;if(Math.random()<.48)pulse.light=true;else if(Math.random()<.32)pulse.dash=true;else pulse.launcher=foe.grounded;intent='rushdown'}
        if(fighter.en>=90&&fighter.cooldowns.lightningBeam<=0&&foe.hp<45&&Math.random()<.18){pulse.special=true;fighter.aiQueuedAbility='lightningBeam';intent='lightning beam'}
      }
      else if(fighter.id==='bark'){
        if(!fighter.armorDurability&&fighter.en>=24&&fighter.cooldowns.rockArmor<=0&&distance>190){pulse.special=true;fighter.aiQueuedAbility='rockArmor';intent='rock armor'}
        else if(distance<190&&fighter.en>=30&&fighter.cooldowns.groundQuake<=0&&foe.grounded&&Math.random()<.30){pulse.special=true;fighter.aiQueuedAbility='groundQuake';intent='ground quake'}
        else if(distance>245&&fighter.en>=16&&fighter.cooldowns.rockShot<=0){pulse.special=true;fighter.aiQueuedAbility='rockShot';intent='rock shot'}
        else if(distance>110){moveX=toward.x*.62;moveZ=toward.z*.62;block=Math.random()<.28;intent='armored advance'}
        else{block=Math.random()<.42;if(!block){pulse.heavy=Math.random()<.55;pulse.light=!pulse.heavy}intent=block?'hold ground':'heavy punish'}
      }
      else if(fighter.id==='pouki'){
        if(distance>140){moveX=toward.x;moveZ=toward.z;pulse.dash=Math.random()<.38;intent='pressure rush'}else{pulse.heavy=Math.random()<.46;pulse.light=!pulse.heavy;intent='guard crush'}
        if(fighter.en>=26&&fighter.cooldowns.characterSpecial<=0&&Math.random()<.18){pulse.special=true;fighter.aiQueuedAbility='poukiRush'}
      }
      else if(fighter.id==='plouke'){
        if(distance>185){moveX=toward.x*.4-toward.z*.55*side;moveZ=toward.z*.4+toward.x*.55*side;if(fighter.en>=24&&fighter.cooldowns.characterSpecial<=0&&Math.random()<.24){pulse.special=true;fighter.aiQueuedAbility='sagePalm'}}
        else{block=Math.random()<.38;pulse.heavy=!block&&Math.random()<.45;pulse.light=!block&&!pulse.heavy;intent=block?'prediction guard':'palm pressure'}
      }
      else if(distance>235){moveX=toward.x;moveZ=toward.z;if(fighter.en>=24&&fighter.cooldowns.astrylteBlast<=0&&Math.random()<.18){pulse.special=true;fighter.aiQueuedAbility='genericBlast';intent='ranged pressure'}}
      else if(distance>120){moveX=toward.x*.75-toward.z*.35*side;moveZ=toward.z*.75+toward.x*.35*side;if(Math.random()<.14)pulse.jump=true;intent='spacing'}
      else{if(Math.random()<.48)pulse.light=true;else if(Math.random()<.26)pulse.heavy=true;else if(foe.grounded&&Math.random()<.18)pulse.launcher=true;else{moveX=-toward.z*side*.55;moveZ=toward.x*side*.55}intent='close combat'}
      if(Math.random()<settings.mistake){block=false;pulse.light=pulse.heavy=pulse.launcher=pulse.special=pulse.grab=false;moveX*=.35;moveZ*=.35;intent='mistake'}
      if(wall.near){moveX+=wall.x*.95;moveZ+=wall.z*.95}
      fighter.aiMove=normalizeMovement(moveX,moveZ);fighter.aiBlock=block;fighter.aiPulse=pulse;fighter.aiIntent=intent;
    }
    const pulse=fighter.aiPulse||{};fighter.aiPulse={};return{x:fighter.aiMove.x,z:fighter.aiMove.z,jump:!!pulse.jump,light:!!pulse.light,heavy:!!pulse.heavy,launcher:!!pulse.launcher,dash:!!pulse.dash,block:fighter.aiBlock,charge:!!pulse.charge,grab:!!pulse.grab,breaker:false,counter:false,special:!!pulse.special};
  }

  loop(timestamp){if(!this.active)return;const delta=Math.min(.05,Math.max(0,(timestamp-this.last)/1000));this.last=timestamp;if(!this.paused&&!this.identityGuideOpen){this.accumulator+=delta;while(this.accumulator>=STEP){this.update(STEP);this.accumulator-=STEP}}this.draw();this.updateLensBlindness();this.raf=requestAnimationFrame(next=>this.loop(next))}

  update(dt){
    this.updateParticles(dt);this.updateCamera();this.stageBoundaryPulse=Math.max(0,this.stageBoundaryPulse-dt);this.crowdExcitement=Math.max(0,this.crowdExcitement-dt*.55);this.announcerCooldown=Math.max(0,this.announcerCooldown-dt);if(this.noticeTime>0){this.noticeTime=Math.max(0,this.noticeTime-dt);if(!this.noticeTime)this.notice('')}if(this.flashTime>0){this.flashTime=Math.max(0,this.flashTime-dt);if(!this.flashTime)this.root.querySelector('[data-impact-flash]').style.opacity='0'}
    for(const fighter of this.fighters){fighter.comboTextTime=Math.max(0,fighter.comboTextTime-dt);const activeAnimation=animationName(fighter);fighter.setAnimation(activeAnimation);const animationRate=activeAnimation==='run'?clamp(.62+fighter.speedRatio*.78,.66,1.5):1;if(this.hitstop<=0)fighter.animationClock+=dt*1000*animationRate}
    if(this.phase==='intro'){this.phaseTime-=dt;if(this.phaseTime<.65)this.banner('FIGHT!');if(this.phaseTime<=0){this.phase='play';this.hideBanner()}return}
    if(this.phase==='over'){this.phaseTime-=dt;if(this.phaseTime<=0){if(Math.max(...this.scores)>=this.koTarget)this.showResult();else{this.round++;this.respawnAfterKo(this.lastLoser)}}return}
    if(this.phase!=='play')return;
    if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);this.hud();return}
    this.controls.poll();
    for(const fighter of this.fighters)this.observeHabits(fighter,dt);
    const playerCommand=this.input(1,{poll:false});
    const opponentCommand=this.localMode?this.input(2,{poll:false}):this.cpu(this.fighters[1],this.fighters[0],dt);
    this.stepFighter(this.fighters[0],this.fighters[1],playerCommand,dt);
    this.stepFighter(this.fighters[1],this.fighters[0],opponentCommand,dt);
    if(opponentCommand.special&&!this.localMode)this.castCharacterAbility(this.fighters[1],this.fighters[0],this.fighters[1].aiQueuedAbility);
    this.updateSpecials(dt);this.separateFighters();this.resolveMeleeClash();this.resolveAttackHit(this.fighters[0],this.fighters[1]);this.resolveAttackHit(this.fighters[1],this.fighters[0]);this.updateTrainingTrial(dt);if(this.trainingMode){for(const fighter of this.fighters){if(fighter.hp<=0){fighter.hp=Math.max(1,Number(fighter.maxHp)||100);fighter.stun=0;fighter.knockdown=0;fighter.inv=.5;this.clearPursuitState(fighter);resetFocusRecovery(fighter);this.notice('TRAINING HEALTH & RECOVERY STATE RESTORED',.7)}}}for(const fighter of this.fighters){if(this.isRingOut(fighter)){if(this.onRingOut)this.onRingOut(fighter);else fighter.hp=0;break}}if(!this.trainingMode&&this.fighters.some(fighter=>fighter.hp<=0))this.finishRound();this.hud();
  }

  respawnAfterKo(index){
    const loser=this.fighters[index],winner=this.fighters[1-index],spawn=this.stage.spawnPoints[index];
    const maxHp=loser.maxHp;loser.reset(spawn.x,spawn.z);loser.maxHp=maxHp;loser.hp=maxHp;loser.en=RESPAWN_ENERGY;loser.guard=100;loser.inv=1.35;loser.respawnProtection=1.35;
    winner.attackState=null;winner.stun=0;winner.block=false;winner.kvx=winner.kvz=0;winner.comboTimer=0;winner.comboHits=0;winner.comboDamage=0;this.clearPursuitState(winner);
    this.clearCombatObjects();this.phase='play';this.hideBanner();this.notice(`${loser.name.toUpperCase()} RESPAWNED`,.85);this.hud();
  }

  resolveMeleeClash(){
    const[a,b]=this.fighters,sa=a.attackState,sb=b.attackState;if(!sa||!sb||sa.hit||sb.hit)return false;
    const strong=state=>['heavy','airHeavy','launcher'].includes(state.def.kind)&&state.elapsed>=state.def.activeStart&&state.elapsed<=state.def.activeEnd;
    if(!strong(sa)||!strong(sb))return false;
    if(Math.hypot(a.x-b.x,a.z-b.z)>118||Math.abs((a.y||0)-(b.y||0))>85)return false;
    sa.hit=sb.hit=true;a.attackState=b.attackState=null;const aim=aimVector(a,b);a.kvx=-aim.x*78;a.kvz=-aim.z*78;b.kvx=aim.x*78;b.kvz=aim.z*78;a.stun=b.stun=.24;this.hitstop=Math.max(this.hitstop,8*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,9*this.feedback.shakeScale);this.burst((a.x+b.x)/2,(a.z+b.z)/2,'#fff2a1',28,72);this.notice('HEAVY CLASH!');return true;
  }


  stepFighter(fighter,foe,command,dt){
    if(fighter.ringOutFall>0){this.updateRingOutFall(fighter,dt);return}

    const lensBefore=fighter.lens;
    if(command.breaker&&fighter.stun>0&&fighter.en>=BREAKER_COST&&fighter.breakerCooldown<=0&&!fighter.breakerLocked){
      fighter.en-=BREAKER_COST;fighter.breakerLocked=true;fighter.breakerCooldown=BREAKER_COOLDOWN;fighter.stun=0;fighter.knockdown=0;fighter.inv=.28;
      const push=aimVector(fighter,foe);foe.kvx+=push.x*105;foe.kvz+=push.z*105;this.notice('COMBO BREAKER • ON COOLDOWN');this.burst(fighter.x,fighter.z,'#9feaff',24,65);
    }

    fighter.stun=Math.max(0,fighter.stun-dt);fighter.inv=Math.max(0,fighter.inv-dt);fighter.respawnProtection=Math.max(0,fighter.respawnProtection-dt);
    fighter.flash=Math.max(0,fighter.flash-dt);fighter.visualActionTime=Math.max(0,fighter.visualActionTime-dt);fighter.lens=Math.max(0,fighter.lens-dt);
    if(lensBefore>0&&fighter.lens<=0)this.completeLensUse(fighter);
    fighter.guardBreak=Math.max(0,fighter.guardBreak-dt);fighter.knockdown=Math.max(0,fighter.knockdown-dt);fighter.dashCooldown=Math.max(0,fighter.dashCooldown-dt);
    fighter.dashRecovery=Math.max(0,fighter.dashRecovery-dt);fighter.blockLockout=Math.max(0,fighter.blockLockout-dt);fighter.grabCooldown=Math.max(0,fighter.grabCooldown-dt);
    fighter.grabRecovery=Math.max(0,fighter.grabRecovery-dt);fighter.counterWindow=Math.max(0,fighter.counterWindow-dt);fighter.counterRecovery=Math.max(0,fighter.counterRecovery-dt);
    fighter.counterCooldown=Math.max(0,fighter.counterCooldown-dt);fighter.breakerCooldown=Math.max(0,fighter.breakerCooldown-dt);fighter.abilityRecovery=Math.max(0,fighter.abilityRecovery-dt);tickFocusRecovery(fighter,dt);
    const pursuitWindowBefore=fighter.pursuitWindow,pursuitFollowupBefore=fighter.pursuitFollowupWindow,pursuitFinishBefore=fighter.pursuitFinishWindow;fighter.guardDelay=Math.max(0,fighter.guardDelay-dt);fighter.comboTimer=Math.max(0,fighter.comboTimer-dt);fighter.pursuitWindow=Math.max(0,fighter.pursuitWindow-dt);
    fighter.pursuitFollowupWindow=Math.max(0,fighter.pursuitFollowupWindow-dt);fighter.pursuitFinishWindow=Math.max(0,fighter.pursuitFinishWindow-dt);fighter.pursuitEscapeCooldown=Math.max(0,fighter.pursuitEscapeCooldown-dt);fighter.pursuitBufferFlash=Math.max(0,fighter.pursuitBufferFlash-dt);fighter.pursuitReadyFlash=Math.max(0,fighter.pursuitReadyFlash-dt);fighter.pursuitLockOn=Math.max(0,fighter.pursuitLockOn-dt);fighter.pursuitAudioTimer=Math.max(0,fighter.pursuitAudioTimer-dt);fighter.pursuitTechFlash=Math.max(0,fighter.pursuitTechFlash-dt);fighter.actionBufferTime=Math.max(0,(fighter.actionBufferTime||0)-dt);if(fighter.actionBufferTime<=0)fighter.actionBuffer='';fighter.hurtIdentityFlash=Math.max(0,(fighter.hurtIdentityFlash||0)-dt);fighter.victoryPoseTime=Math.max(0,(fighter.victoryPoseTime||0)-dt);fighter.identityPulse=Math.max(0,(fighter.identityPulse||0)-dt);fighter.landingImpact=Math.max(0,(fighter.landingImpact||0)-dt);fighter.wallSplat=Math.max(0,fighter.wallSplat-dt);fighter.groundBouncePending=Math.max(0,fighter.groundBouncePending-dt);fighter.dashArmor=Math.max(0,fighter.dashArmor-dt);fighter.juggleProtection=Math.max(0,fighter.juggleProtection-dt);
    if(pursuitWindowBefore>0&&fighter.pursuitWindow<=0&&!fighter.pursuitUsed){this.audio.play('pursuitEnd');this.burst(fighter.x,fighter.z,dashIdentityFor(fighter.id).trail||fighter.accent,9,12)}if((pursuitFollowupBefore>0&&fighter.pursuitFollowupWindow<=0)||(pursuitFinishBefore>0&&fighter.pursuitFinishWindow<=0))this.audio.play('pursuitEnd');
    fighter.edgePressureTimer=Math.max(0,fighter.edgePressureTimer-dt);if(fighter.edgePressureTimer<=0)fighter.edgePressureHits=0;if(fighter===this.fighters[0])this.pursuitPromptLinger=Math.max(0,this.pursuitPromptLinger-dt);
    fighter.lensPredictionTimer=Math.max(0,(fighter.lensPredictionTimer||0)-dt);
    if(fighter.lens>0&&fighter.lensPredictionTimer<=0){fighter.lensPrediction=this.predictedAction(foe);fighter.lensPredictionTimer=.34}
    for(const key of Object.keys(fighter.cooldowns))fighter.cooldowns[key]=Math.max(0,fighter.cooldowns[key]-dt);
    if(fighter.stun<=0&&fighter.knockdown<=0)fighter.breakerLocked=false;

    if(fighter.comboTimer<=0&&!fighter.attackState){fighter.lightChain=0;fighter.comboHits=0;fighter.comboDamage=0;fighter.pursuitUsed=false;fighter.comboWallSplatUsed=false;fighter.comboGroundBounceUsed=false;fighter.pursuitFinishWindow=0;fighter.pursuitBuffered=''}
    if(!fighter.charging&&!fighter.focusRecovering&&!this.volleyActive(fighter)){
      const control=Math.max(1,Number(fighter.storyEnergyControlMultiplier)||1),passive=fighter.stallTime>2?.15:.55;
      fighter.en=clamp(fighter.en+passive*control*dt,0,100);
    }
    if(fighter.guardDelay<=0&&!fighter.block&&!fighter.guardBreak&&fighter.stun<=0){
      const still=!fighter.moving&&Math.hypot(fighter.moveVX||0,fighter.moveVZ||0)<12;fighter.guard=clamp(fighter.guard+(still?14:7.5)*dt,0,100);
    }

    const profile=movementProfile(fighter),rawX=command.x||0,rawZ=command.z||0,move=normalizeMovement(rawX,rawZ),inputMagnitude=clamp(Math.hypot(rawX,rawZ),0,1),toward=aimVector(fighter,foe);
    const distanceToFoe=Math.hypot(foe.x-fighter.x,foe.z-fighter.z),retreatDot=move.length>.08?move.x*toward.x+move.z*toward.z:0;
    if(distanceToFoe>300&&retreatDot<-.35&&!fighter.attackState)fighter.stallTime=Math.min(5,fighter.stallTime+dt);else fighter.stallTime=Math.max(0,fighter.stallTime-dt*1.8);

    const abilityLocked=this.updateAbilityState(fighter,foe,dt);
    const characterAbilityLocked=this.updateCharacterAbilityState(fighter,foe,dt);

    if(foe.pursuitTime>0&&foe.pursuitTarget===fighter&&command.dash&&this.tryPursuitEscape(fighter,foe,command)){({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));return}

    if(fighter.pursuitTime>0){
      this.updatePursuit(fighter,foe,dt,command);({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));fighter.moving=true;fighter.speedRatio=1.3;
      if(!fighter.grounded){fighter.vy-=760*dt;fighter.y=Math.max(0,fighter.y+fighter.vy*dt)}
      return;
    }

    if(!fighter.attackState){let facing=toward;if(fighter.dashTime>0)facing={x:fighter.dashX,z:fighter.dashZ};else if(move.length>.08&&!fighter.block)facing=move;const faced=rotateToward(fighter.aimX,fighter.aimZ,facing.x,facing.z,14*dt);fighter.aimX=faced.x;fighter.aimZ=faced.z}
    fighter.moving=false;fighter.moveX=0;fighter.moveZ=0;

    if(Math.abs(fighter.kvx)+Math.abs(fighter.kvz)>.1){fighter.x+=fighter.kvx*dt;fighter.z+=fighter.kvz*dt;fighter.kvx*=Math.pow(.018,dt);fighter.kvz*=Math.pow(.018,dt)}else{fighter.kvx=fighter.kvz=0}

    if(abilityLocked||characterAbilityLocked){
      fighter.block=false;fighter.charging=false;fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.5*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.5*dt);
    }
    else if(fighter.dashTime>0){
      fighter.dashElapsed+=dt;fighter.dashTime=Math.max(0,fighter.dashTime-dt);fighter.x+=fighter.dashX*profile.dashSpeed*dt;fighter.z+=fighter.dashZ*profile.dashSpeed*dt;
      if(fighter.dashElapsed<=.10)fighter.inv=Math.max(fighter.inv,.035);
      fighter.moving=true;fighter.moveX=fighter.dashX;fighter.moveZ=fighter.dashZ;fighter.speedRatio=1.25;
      const cancelReady=fighter.dashElapsed>=Math.min(DASH_CANCEL_TIME,this.feel(fighter).dashCancel);
      if(cancelReady&&command.jump&&fighter.grounded){fighter.dashTime=0;fighter.dashRecovery=0;fighter.moveVX=fighter.dashX*profile.runSpeed;fighter.moveVZ=fighter.dashZ*profile.runSpeed;fighter.jump()}
      else if(cancelReady&&(command.light||command.heavy||command.launcher)){fighter.dashTime=0;fighter.dashRecovery=0;if(command.launcher&&fighter.grounded)this.startAttack(fighter,'launcher',foe);else if(command.heavy)this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe);else this.startAttack(fighter,fighter.grounded?this.nextLight(fighter):'airLight',foe)}
      if(!fighter.dashTime&&!fighter.attackState&&fighter.grounded){fighter.dashRecovery=Math.max(fighter.dashRecovery,this.feel(fighter).dashRecovery);fighter.moveVX=fighter.dashX*profile.runSpeed*.95;fighter.moveVZ=fighter.dashZ*profile.runSpeed*.95}
    }
    else if(fighter.attackState){this.updateAttack(fighter,foe,command,dt);fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.12*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.12*dt);fighter.runTime=Math.max(0,fighter.runTime-dt*4)}
    else{
      const canAct=!fighter.stun&&!fighter.guardBreak&&!fighter.knockdown&&!fighter.dashRecovery&&!fighter.grabRecovery&&!fighter.counterRecovery&&!fighter.abilityRecovery&&!fighter.focusRecoveryRelease;
      const rawFocusIntent=Boolean(command.block&&command.charge),focusEligible=canAct&&fighter.grounded&&fighter.inv<=0&&fighter.respawnProtection<=0&&inputMagnitude<.12&&!fighter.attackState&&!fighter.abilityState&&!fighter.characterAbilityState&&!fighter.dashTime&&!fighter.pursuitTime&&!fighter.ringOutFall,focusReady=focusRecoveryAvailability(fighter,{eligible:focusEligible}).available,focusIntent=rawFocusIntent&&(focusReady||fighter.focusRecovering||fighter.focusRecoveryStartup>0);const wasBlocking=fighter.block;fighter.block=canAct&&fighter.grounded&&!!command.block&&!focusIntent&&fighter.blockLockout<=0;
      if(fighter.block){
        fighter.blockAge=wasBlocking?fighter.blockAge+dt:0;
        if(fighter.blockAge>1.25&&!fighter.guardWarned){fighter.guardWarned=true;if(!fighter.cpu)this.notice('GUARD FATIGUE WARNING • RELEASE SOON',.8)}
        if(fighter.blockAge>MAX_BLOCK_TIME){fighter.block=false;fighter.blockLockout=BLOCK_LOCKOUT;fighter.guardDelay=.55;if(!fighter.cpu)this.notice('GUARD FATIGUED • RELEASE TO RESET')}
      }else{fighter.blockAge=0;fighter.guardWarned=false}
      if(!focusIntent&&fighter.focusRecoveryStartup>0)endFocusRecovery(fighter);fighter.charging=false;

      if(canAct&&!fighter.block){
        const currentSpeed=Math.hypot(fighter.moveVX,fighter.moveVZ),currentX=currentSpeed>.1?fighter.moveVX/currentSpeed:move.x,currentZ=currentSpeed>.1?fighter.moveVZ/currentSpeed:move.z,alignment=move.length>.08?currentX*move.x+currentZ*move.z:1;
        if(move.length>.08){if(alignment<-.2)fighter.runTime=Math.max(0,fighter.runTime-dt*5);else fighter.runTime=Math.min(RUN_BUILD_TIME,fighter.runTime+dt)}else fighter.runTime=Math.max(0,fighter.runTime-dt*3.5);
        const runBlend=clamp(fighter.runTime/RUN_BUILD_TIME,0,1),analogWalk=inputMagnitude<.72,groundTopSpeed=profile.walkSpeed+(profile.runSpeed-profile.walkSpeed)*(analogWalk?0:runBlend),topSpeed=fighter.grounded?groundTopSpeed:profile.airSpeed,speedScale=analogWalk?inputMagnitude/.72:1,desiredSpeed=move.length>.08?topSpeed*speedScale:0,desiredX=move.x*desiredSpeed,desiredZ=move.z*desiredSpeed,turningHard=alignment<.15&&currentSpeed>profile.walkSpeed*.7;
        const acceleration=fighter.grounded?(turningHard?profile.brake*1.15:profile.accel+(profile.runAccel-profile.accel)*runBlend):profile.airAccel,braking=fighter.grounded?profile.brake:profile.airBrake,rate=move.length>.08?acceleration:braking;
        fighter.moveVX=approach(fighter.moveVX,desiredX,rate*dt);fighter.moveVZ=approach(fighter.moveVZ,desiredZ,rate*dt);
        const actualSpeed=Math.hypot(fighter.moveVX,fighter.moveVZ);if(actualSpeed>2){fighter.x+=fighter.moveVX*dt;fighter.z+=fighter.moveVZ*dt;fighter.moveX=fighter.moveVX/actualSpeed;fighter.moveZ=fighter.moveVZ/actualSpeed}fighter.moving=actualSpeed>18;fighter.speedRatio=clamp(actualSpeed/profile.runSpeed,0,1.35);

        const queuedAction=!command.light&&!command.heavy&&!command.launcher?this.consumeAction(fighter):'';
        const wantsLight=command.light||queuedAction==='light',wantsHeavy=command.heavy||queuedAction==='heavy',wantsLauncher=command.launcher||queuedAction==='launcher';
        if(fighter.pursuitFinishWindow>0&&wantsHeavy){
          fighter.pursuitFinishWindow=0;this.startAttack(fighter,'pursuitHeavy',foe);
        }else if(fighter.pursuitFollowupWindow>0&&(wantsLight||wantsHeavy)){
          fighter.pursuitFollowupWindow=0;this.startAttack(fighter,wantsHeavy?'pursuitHeavy':'pursuitLight',foe);
        }else if(command.counter&&fighter.grounded){
          if(fighter.counterCooldown>0)this.notice(`COUNTER • ${fighter.counterCooldown.toFixed(1)}s`);
          else if(fighter.en<COUNTER_COST)this.notice(`NEED ${COUNTER_COST} ENERGY`);
          else{fighter.en-=COUNTER_COST;fighter.counterWindow=COUNTER_ACTIVE;fighter.counterRecovery=COUNTER_RECOVERY;fighter.counterCooldown=COUNTER_COOLDOWN;fighter.counterKind='universal';fighter.visualAction='counterReady';fighter.visualActionTime=COUNTER_ACTIVE;this.notice('COUNTER READY • PUNISHABLE ON MISS',.7)}
        }else if(focusIntent){
          fighter.charging=false;fighter.moveVX=approach(fighter.moveVX,0,profile.brake*2*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*2*dt);const recovery=channelFocusRecovery(fighter,dt,{eligible:focusEligible});fighter.visualAction=recovery.active?'focusRecovery':'focusRecoveryStart';fighter.visualActionTime=.12;if(recovery.started){this.audio.play('focusStart');this.notice('FOCUS RECOVERY • VULNERABLE WHILE CHANNELING',1)}if(recovery.healed>0){if(fighter.focusRecoverySoundCooldown<=0){this.audio.play('focusTick');fighter.focusRecoverySoundCooldown=.20}if(!fighter.cpu)this.recordTrainingEvent('focusRecovery',{total:fighter.focusRecoveredTotal})}
        }else if(command.charge&&fighter.grounded&&inputMagnitude<.12){
          fighter.charging=true;fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.8*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.8*dt);
          const control=Math.max(1,Number(fighter.storyEnergyControlMultiplier)||1),chargeRate=fighter.stallTime>2?7:distanceToFoe>360?11:20;
          fighter.en=clamp(fighter.en+chargeRate*control*dt,0,100);fighter.guard=clamp(fighter.guard+7*dt,0,100);fighter.chargePulse+=dt;fighter.visualAction='chargeEnergy';fighter.visualActionTime=.12;
          if(fighter.stallTime>2&&!fighter.cpu&&Math.floor(fighter.stallTime*2)!==Math.floor((fighter.stallTime-dt)*2))this.notice('DISTANT CHARGING SLOWED • RE-ENGAGE',.65);
        }else if(command.grab)this.attemptGrab(fighter,foe);
        else if(command.dash)this.startDash(fighter,foe,move);
        else if(command.jump)fighter.jump();
        else if(wantsLauncher&&fighter.grounded)this.startAttack(fighter,'launcher',foe);
        else if(wantsHeavy)this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe);
        else if(wantsLight)this.startAttack(fighter,fighter.grounded?this.nextLight(fighter):'airLight',foe);
      }else{fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.25*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.25*dt);fighter.runTime=Math.max(0,fighter.runTime-dt*5);fighter.speedRatio=clamp(Math.hypot(fighter.moveVX,fighter.moveVZ)/profile.runSpeed,0,1)}
    }

    if(!fighter.grounded){
      fighter.vy-=920*dt;fighter.y+=fighter.vy*dt;
      if(fighter.y<=0){if(fighter.groundBouncePending>0){const owner=fighter.groundBounceOwner;fighter.y=2;fighter.vy=PURSUIT_TUNING.groundBounceVelocity;fighter.grounded=false;fighter.groundBouncePending=0;fighter.groundBounceOwner=null;fighter.stun=Math.max(fighter.stun,PURSUIT_TUNING.groundBounceStun);fighter.knockdown=Math.max(fighter.knockdown,.34);this.hitstop=Math.max(this.hitstop,PURSUIT_TUNING.groundBounceHitstopFrames*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,7*this.feedback.shakeScale);this.pursuitImpactHold=Math.max(this.pursuitImpactHold,2*STEP);this.burst(fighter.x,fighter.z,'#ffd98a',32,8);this.impactFlash('#fff2cf',.11);this.audio.play('groundBounce');this.combatEvent('groundBounce',{side:fighter===this.fighters[0]?2:1,label:'GROUND BOUNCE'});this.notice('GROUND BOUNCE • ONE PER COMBO',.9);if(owner&&!owner.cpu)this.recordTrainingEvent('groundBounce')}else{fighter.y=0;fighter.vy=0;fighter.grounded=true;fighter.airDashUsed=false;fighter.airHitsTaken=0;fighter.juggleProtection=0;fighter.animationClock=0;fighter.landingImpact=.16;if(fighter.knockdown>0)fighter.stun=Math.max(fighter.stun,.42);const landingCount=fighter.id==='bark'?18:fighter.id==='wade'?6:10;this.burst(fighter.x,fighter.z,motionIdentity(fighter.id).trail||fighter.accent,landingCount,2)}}
    }
    ({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));
    resolveHubWorldCollision(this.stage,fighter);
  }
  nextLight(fighter){if(fighter.comboTimer>0&&fighter.lightChain===1)return'light2';if(fighter.comboTimer>0&&fighter.lightChain===2)return'light3';return'light1'}


  startAttack(fighter,kind,foe){
    const def=arenaAttackFor(fighter.id,kind);if(!def||fighter.stun||fighter.guardBreak||fighter.knockdown||fighter.dashRecovery||fighter.abilityState||fighter.characterAbilityState)return false;
    if(def.pursuit&&fighter.grounded)return false;if(def.air&&fighter.grounded&&!def.pursuit)return false;if(!def.air&&!fighter.grounded)return false;
    const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;
    if(Math.hypot(foe.x-fighter.x,foe.z-fighter.z)<175&&Math.abs(fighter.y-foe.y)<95){
      const assist=Math.min(18,Math.max(0,Math.hypot(foe.x-fighter.x,foe.z-fighter.z)-55)*.12);fighter.x+=aim.x*assist;fighter.z+=aim.z*assist;
    }
    fighter.attackState={def,elapsed:0,hit:false,locked:false,aimX:aim.x,aimZ:aim.z,lungeRemaining:def.lunge,magnetRemaining:fighter.comboTimer>0?28:0,buffer:null};if(def.kind==='launcher')fighter.combatHabits.launchers=Math.min(5,(fighter.combatHabits.launchers||0)+1);
    fighter.block=false;fighter.animationClock=0;fighter.visualAction='';fighter.visualActionTime=0;if(kind.startsWith('light'))fighter.lightChain=Number(kind.slice(-1));if(!fighter.cpu)this.trainingTrial.pendingAction=kind;return true;
  }

  updateAttack(fighter,foe,command,dt){
    const state=fighter.attackState,def=state.def,feel=this.feel(fighter);if(command.light)state.buffer='light';if(command.heavy)state.buffer='heavy';if(command.launcher)state.buffer='launcher';if(state.elapsed>=Math.max(0,def.duration-feel.inputBuffer)){if(command.light)this.queueAction(fighter,'light');else if(command.heavy)this.queueAction(fighter,'heavy');else if(command.launcher)this.queueAction(fighter,'launcher')}
    state.elapsed+=dt;if(!state.locked&&state.elapsed<def.activeStart){const target=aimVector(fighter,foe),rotated=rotateToward(state.aimX,state.aimZ,target.x,target.z,12*dt);state.aimX=fighter.aimX=rotated.x;state.aimZ=fighter.aimZ=rotated.z}else if(!state.locked){state.locked=true;fighter.aimX=state.aimX;fighter.aimZ=state.aimZ}
    if(state.elapsed<=def.activeEnd&&state.lungeRemaining>0){const amount=Math.min(state.lungeRemaining,175*dt);fighter.x+=state.aimX*amount;fighter.z+=state.aimZ*amount;state.lungeRemaining-=amount}
    if(fighter.comboTimer>0&&state.elapsed<def.activeStart&&state.magnetRemaining>0){const target=aimVector(fighter,foe),distance=Math.hypot(foe.x-fighter.x,foe.z-fighter.z);if(distance<175){const amount=Math.min(state.magnetRemaining,110*dt);fighter.x+=target.x*amount;fighter.z+=target.z*amount;state.magnetRemaining-=amount}}
    if(state.elapsed>=def.duration){
      const buffered=state.buffer,connected=state.hit;fighter.attackState=null;
      if(def.pursuit){fighter.pursuitFollowupWindow=0;if(def.kind==='pursuitLight'&&connected){if(buffered==='heavy'){fighter.pursuitFinishWindow=0;this.startAttack(fighter,'pursuitHeavy',foe)}else{fighter.pursuitFinishWindow=PURSUIT_TUNING.finisherWindow;this.notice('PURSUIT LINK • PRESS HEAVY TO FINISH',.65)}}else{fighter.pursuitFinishWindow=0;if(!connected&&!fighter.cpu)this.recordTrainingEvent('whiff')}return}
      if(connected&&buffered==='light'&&def.kind==='light1'){this.consumeAction(fighter);this.startAttack(fighter,'light2',foe)}
      else if(connected&&buffered==='light'&&def.kind==='light2'){this.consumeAction(fighter);this.startAttack(fighter,'light3',foe)}
      else if(connected&&buffered==='heavy'&&['light1','light2','airLight'].includes(def.kind)){this.consumeAction(fighter);this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe)}
      else if(connected&&buffered==='launcher'&&fighter.grounded){this.consumeAction(fighter);this.startAttack(fighter,'launcher',foe)}
      else{if(!connected){fighter.comboTimer=0;fighter.lightChain=0}const queued=this.consumeAction(fighter);if(queued)this.startAttack(fighter,queued==='light'?(fighter.grounded?this.nextLight(fighter):'airLight'):queued==='heavy'?(fighter.grounded?'heavy':'airHeavy'):'launcher',foe)}
    }
  }

  startDash(fighter,foe,move){
    if(fighter.pursuitWindow>0&&!fighter.pursuitUsed)return this.startPursuit(fighter,foe);
    if(fighter.dashCooldown||fighter.dashRecovery||fighter.stun||fighter.attackState||fighter.abilityState||fighter.characterAbilityState)return false;
    if(!fighter.grounded&&fighter.airDashUsed)return false;
    let direction=move;if(direction.length<.1){const toward=aimVector(fighter,foe);direction={x:toward.x,z:toward.z,length:1}}
    const identity=dashIdentityFor(fighter.id),speedScale=identity.speedScale||1;fighter.dashX=direction.x*speedScale;fighter.dashZ=direction.z*speedScale;fighter.dashTime=identity.duration;fighter.dashElapsed=0;fighter.dashCooldown=identity.cooldown;fighter.block=false;fighter.animationClock=0;fighter.inv=Math.max(fighter.inv,identity.invulnerability);
    if(identity.sideFeint){fighter.dashFeint*=-1;fighter.x+=-direction.z*identity.sideFeint*fighter.dashFeint;fighter.z+=direction.x*identity.sideFeint*fighter.dashFeint}
    if(identity.armorFrames)fighter.dashArmor=Math.max(fighter.dashArmor,identity.armorFrames);fighter.identityPulse=.24;
    if(!fighter.grounded)fighter.airDashUsed=true;this.audio.play(identity.cue||'dash');this.burst(fighter.x,fighter.z,identity.trail||fighter.accent,fighter.id==='wade'?28:fighter.id==='bark'?22:18,12);
    if(this.trainingMode&&!this.identityHintsShown.has(fighter.id)){this.identityHintsShown.add(fighter.id);this.notice(`${fighter.name.toUpperCase()} • ${identity.label}`,1.05)}
    return true;
  }

  startPursuit(fighter,foe){
    if(fighter.pursuitUsed||fighter.pursuitWindow<=0||fighter.stun||fighter.abilityState||!foe||foe.hp<=0)return false;
    const profile=movementProfile(fighter),distance=Math.hypot(foe.x-fighter.x,foe.z-fighter.z),duration=pursuitDurationFor(distance,profile.pursuitSpeed,fighter.id);fighter.pursuitUsed=true;fighter.pursuitWindow=0;fighter.pursuitTime=duration;fighter.pursuitTotalTime=duration;fighter.pursuitTarget=foe;fighter.pursuitBuffered='';fighter.pursuitBufferFlash=0;fighter.pursuitReadyFlash=0;fighter.pursuitAttackReady=false;fighter.pursuitLockOn=PURSUIT_TUNING.lockOnDuration;fighter.pursuitAudioTimer=0;fighter.attackState=null;fighter.block=false;fighter.inv=Math.max(fighter.inv,fighter.id==='rrvvfo'?.20:.16);foe.pursuitDefenseSeen=(foe.pursuitDefenseSeen||0)+1;
    if(fighter.id==='revvfo'){const aim=aimVector(fighter,foe),identity=dashIdentityFor('revvfo');fighter.x+=aim.x*(identity.pursuitBlink||0);fighter.z+=aim.z*(identity.pursuitBlink||0);this.burst(fighter.x,fighter.z,'#c069ff',20,48)}
    fighter.grounded=false;fighter.vy=Math.max(fighter.vy,110);fighter.visualAction='dash';fighter.visualActionTime=.3;if(!fighter.cpu)this.recordTrainingEvent('pursuitStart',{duration});this.audio.play('pursuitStart');document.dispatchEvent(new CustomEvent('pxcombatduck',{detail:{amount:.72,duration:.48}}));this.notice('PURSUIT! • BUFFER LIGHT OR HEAVY DURING THE CHASE',.9);return true;
  }

  tryPursuitEscape(fighter,pursuer,command){
    if(!pursuitTechAvailable(fighter.en,fighter.pursuitEscapeCooldown)||fighter.guardBreak||fighter.knockdown)return false;
    const approachVector=aimVector(pursuer,fighter),move=normalizeMovement(command.x||0,command.z||0),side=move.length>.1?Math.sign(move.x*(-approachVector.z)+move.z*approachVector.x)||1:(fighter.dashFeint*=-1);fighter.en-=PURSUIT_TUNING.escapeCost;fighter.pursuitEscapeCooldown=PURSUIT_TUNING.escapeCooldown;fighter.inv=Math.max(fighter.inv,PURSUIT_TUNING.escapeInvulnerability);fighter.x+=-approachVector.z*side*94;fighter.z+=approachVector.x*side*94;fighter.kvx=-approachVector.z*side*72;fighter.kvz=approachVector.x*side*72;fighter.visualAction='dash';fighter.visualActionTime=.28;fighter.pursuitTechFlash=.28;fighter.pursuitDefenseSeen=0;pursuer.pursuitTime=0;pursuer.pursuitTotalTime=0;pursuer.pursuitFollowupWindow=0;pursuer.pursuitFinishWindow=0;pursuer.pursuitBuffered='';pursuer.pursuitTarget=null;pursuer.stun=Math.max(pursuer.stun,PURSUIT_TUNING.escapePunishRecovery);this.hitstop=Math.max(this.hitstop,PURSUIT_TUNING.techHitstopFrames*STEP*this.feedback.hitstopScale);this.pursuitImpactHold=Math.max(this.pursuitImpactHold,.08);this.burst(fighter.x,fighter.z,'#bdf7ff',28,55);this.audio.play('pursuitTech');this.combatEvent('pursuitTech',{side:fighter===this.fighters[0]?1:2,label:'PURSUIT TECH'});this.pulseHud(`[data-e${fighter===this.fighters[0]?1:2}]`,'eventSpend',620);document.dispatchEvent(new CustomEvent('pxcombatduck',{detail:{amount:.78,duration:.22}}));this.notice(`PURSUIT TECH! • ${PURSUIT_TUNING.escapeCost} ENERGY • PUNISH NOW`,.9);if(!fighter.cpu)this.recordTrainingEvent('pursuitEscape');return true;
  }

  updatePursuit(fighter,foe,dt,command={}){
    const target=fighter.pursuitTarget||foe;if(!target||target.hp<=0||target.ringOutFall>0){fighter.pursuitTime=0;fighter.pursuitTotalTime=0;fighter.pursuitTarget=null;this.audio.play('pursuitEnd');this.burst(fighter.x,fighter.z,dashIdentityFor(fighter.id).trail||fighter.accent,10,22+fighter.y);return}
    const progress=fighter.pursuitTotalTime>0?1-fighter.pursuitTime/fighter.pursuitTotalTime:0;
    if(!fighter.pursuitAttackReady&&progress>=.16){fighter.pursuitAttackReady=true;fighter.pursuitReadyFlash=.18;this.audio.play('pursuitBuffer')}
    let stored='';if(command.heavy&&fighter.pursuitBuffered!=='heavy'){fighter.pursuitBuffered='heavy';stored='heavy'}else if(command.light&&!fighter.pursuitBuffered){fighter.pursuitBuffered='light';stored='light'}
    if(stored){fighter.pursuitBufferFlash=.18;this.audio.play('pursuitBuffer');if(!fighter.cpu)this.recordTrainingEvent('pursuitBuffer',{kind:stored,timing:progress})}
    fighter.pursuitTime=Math.max(0,fighter.pursuitTime-dt);fighter.pursuitAudioTimer=Math.max(0,fighter.pursuitAudioTimer-dt);if(fighter.pursuitAudioTimer<=0){fighter.pursuitAudioTimer=.11;this.audio.play('pursuitChase',progress)}
    const dx=target.x-fighter.x,dz=target.z-fighter.z,distance=Math.max(.001,Math.hypot(dx,dz)),profile=movementProfile(fighter),speed=profile.pursuitSpeed||950,step=Math.min(distance,speed*dt);
    fighter.x+=dx/distance*step;fighter.z+=dz/distance*step;fighter.y=approach(fighter.y,Math.max(18,target.y+12),620*dt);fighter.aimX=dx/distance;fighter.aimZ=dz/distance;
    const identity=dashIdentityFor(fighter.id);this.burst(fighter.x,fighter.z,identity.trail||fighter.accent,fighter.id==='wade'?5:3,35+fighter.y);
    if(distance<82||fighter.pursuitTime<=0){const buffered=fighter.pursuitBuffered;fighter.pursuitTime=0;fighter.pursuitTotalTime=0;fighter.pursuitFollowupWindow=PURSUIT_TUNING.followupWindow+PURSUIT_TUNING.bufferGrace;fighter.vy=0;fighter.grounded=false;if(buffered){fighter.pursuitBuffered='';fighter.pursuitFollowupWindow=0;this.startAttack(fighter,buffered==='heavy'?'pursuitHeavy':'pursuitLight',target)}else{this.audio.play('pursuitEnd');this.burst(fighter.x,fighter.z,dashIdentityFor(fighter.id).trail||fighter.accent,10,22+fighter.y);this.notice('PURSUIT FOLLOW-UP • LIGHT FOR CONTROL • HEAVY FOR FINISHER',.85)}}
  }

  updateRingOutFall(fighter,dt){
    fighter.ringOutFall=Math.max(0,fighter.ringOutFall-dt);fighter.x+=fighter.ringOutVX*dt;fighter.z+=fighter.ringOutVZ*dt;fighter.vy-=1080*dt;fighter.y+=fighter.vy*dt;fighter.moving=true;fighter.block=false;fighter.attackState=null;
    if(fighter.ringOutFall<=0||fighter.y<-220){fighter.ringOutFall=0;fighter.ringOutComplete=true;fighter.hp=0}
  }

  triggerRingOutFall(fighter,attacker){
    if(fighter.ringOutFall>0||fighter.ringOutComplete)return false;
    const b=this.stage.bounds,distances=[
      {d:Math.abs(fighter.x-b.minX),x:-1,z:0},{d:Math.abs(b.maxX-fighter.x),x:1,z:0},
      {d:Math.abs(fighter.z-b.minZ),x:0,z:-1},{d:Math.abs(b.maxZ-fighter.z),x:0,z:1}
    ].sort((a,b)=>a.d-b.d),edge=distances[0];
    fighter.ringOutFall=1.05;fighter.ringOutComplete=false;fighter.ringOutVX=edge.x*360+(attacker?fighter.kvx*.25:0);fighter.ringOutVZ=edge.z*360+(attacker?fighter.kvz*.25:0);fighter.y=Math.max(12,fighter.y);fighter.vy=235;fighter.grounded=false;fighter.inv=99;fighter.block=false;fighter.stun=0;fighter.knockdown=0;fighter.attackState=null;fighter.visualAction='fall';fighter.visualActionTime=1.1;
    this.cameraShake=Math.max(this.cameraShake,12*this.feedback.shakeScale);this.stageBoundaryPulse=.75;this.crowdExcitement=2.2;this.burst(fighter.x,fighter.z,'#ffe7a8',34,60);this.audio.play('crowdRoar');this.notice('RING OUT! • CROWD ERUPTS',1.4);return true;
  }

  recordEdgePressure(attacker,target,{kind,knockback}={}){
    if(!this.ringOutEnabled||this.stage.id!=='tournament'||target.respawnProtection>0||kind==='grab'||target.ringOutFall>0)return false;
    const melee=['light1','light2','light3','heavy','launcher','airLight','airHeavy','pursuitLight','pursuitHeavy'];
    if(!melee.includes(kind)||!this.isNearRingEdge(target,78)){target.edgePressureHits=0;target.edgePressureTimer=0;return false}
    target.edgePressureHits=Math.min(EDGE_PRESSURE_HITS,target.edgePressureHits+1);target.edgePressureTimer=EDGE_PRESSURE_WINDOW;
    const strong=['light3','heavy','launcher','pursuitHeavy'].includes(kind)||knockback>=95;
    this.stageBoundaryPulse=Math.max(this.stageBoundaryPulse,.28);this.crowdExcitement=Math.max(this.crowdExcitement,.7+target.edgePressureHits*.25);if(strong&&this.announcerCooldown<=0){this.audio.play('crowdHit');this.announcerCooldown=.55}this.notice(`EDGE PRESSURE ${target.edgePressureHits}/${EDGE_PRESSURE_HITS}${strong?' • FINISHING HIT':''}`,.7);
    if(target.edgePressureHits>=EDGE_PRESSURE_HITS&&strong)return this.triggerRingOutFall(target,attacker);
    return false;
  }

  attemptGrab(fighter,foe){
    if(fighter.grabCooldown||fighter.grabRecovery||fighter.stun||fighter.attackState||fighter.abilityState||!fighter.grounded)return false;
    fighter.grabCooldown=.9;fighter.block=false;const distance=Math.hypot(foe.x-fighter.x,foe.z-fighter.z);
    if(distance>72||Math.abs(fighter.y-foe.y)>45||foe.inv>0||!foe.grounded){fighter.grabRecovery=.50;fighter.visualAction='grabMiss';fighter.visualActionTime=.50;return false}
    fighter.grabRecovery=.27;fighter.visualAction='grab';fighter.visualActionTime=.38;foe.block=false;foe.blockLockout=.45;
    this.applyDamage(fighter,foe,6,{guardDamage:0,knockback:66,color:'#fff0b0',hitstop:5,stun:.38,knockdown:false,kind:'grab'});fighter.en=clamp(fighter.en+4,0,100);this.notice('GRAB • BLOCK PUNISHED');return true;
  }
  separateFighters(){
    const[a,b]=this.fighters;if(a.ringOutFall>0||b.ringOutFall>0)return;const dx=b.x-a.x,dz=b.z-a.z,distance=Math.max(.001,Math.hypot(dx,dz));
    if(distance<44&&Math.abs(a.y-b.y)<=70){const push=(44-distance)/2,nx=dx/distance,nz=dz/distance;a.x-=nx*push;a.z-=nz*push;b.x+=nx*push;b.z+=nz*push}
    // Earth Walls are actual arena geometry: fighters must move around them and
    // projectiles must break through them instead of treating them as decoration.
    for(const fighter of this.fighters)for(const wall of this.earthWalls){
      const wx=fighter.x-wall.x,wz=fighter.z-wall.z,wd=Math.max(.001,Math.hypot(wx,wz)),minimum=wall.radius+fighter.collisionRadius*.72;
      if(wd<minimum){const push=minimum-wd;fighter.x+=wx/wd*push;fighter.z+=wz/wd*push;fighter.moveVX*=.3;fighter.moveVZ*=.3}
    }
  }

  resolveAttackHit(attacker,target){
    const state=attacker.attackState;if(!state||state.hit||target.inv)return;const def=state.def;if(state.elapsed<def.activeStart||state.elapsed>def.activeEnd)return;
    if(!hitVolumeConnects(attacker,target,{range:def.range,width:def.width,height:def.height,aimX:state.aimX,aimZ:state.aimZ}))return;
    state.hit=true;this.applyDamage(attacker,target,def.damage,{guardDamage:def.guardDamage,knockback:def.knockback,color:attacker.accent,hitstop:def.hitstop,stun:def.stun,launch:def.launch||0,spike:def.spike||0,knockdown:def.knockdown,kind:def.kind});
  }


  applyDamage(attacker,target,damage,{guardDamage=Math.max(1,damage*.2),knockback=28,color=attacker?.accent||'#ffffff',hitstop=5,stun=.24,launch=0,spike=0,knockdown=false,kind='light'}={}){
    if(target.inv||target.juggleProtection>0||target.ringOutFall>0)return false;interruptFocusRecovery(target);
    const counterable=!['projectile','ultimate','grab'].includes(kind);
    if(target.counterWindow>0&&counterable&&attacker&&Math.hypot(attacker.x-target.x,attacker.z-target.z)<150){
      const seismic=target.counterKind==='seismic';target.counterWindow=0;target.counterRecovery=seismic?.45:COUNTER_RECOVERY;target.counterKind='';
      if(seismic){this.spawnProjectile(target,{speed:390,damage:13,radius:31,height:70,life:1.2,color:'#c99a58',physical:true,clashPower:3,label:'SEISMIC COUNTER ROCK'});this.burst(target.x,target.z,'#d8b06a',24,65);this.notice('SEISMIC COUNTER')}
      else{const push=aimVector(target,attacker);attacker.hp=Math.max(0,attacker.hp-8);attacker.stun=Math.max(attacker.stun,.38);attacker.kvx=push.x*98;attacker.kvz=push.z*98;attacker.flash=.12;target.momentum=clamp(target.momentum+12,0,100);this.hitstop=Math.max(this.hitstop,7*STEP);this.burst(attacker.x,attacker.z,'#9feaff',20,62);this.notice('COUNTER!')}
      return false;
    }
    if(target.lens>0&&target.lensAutoDodges>0){
      const oldX=target.x,oldZ=target.z,aim=aimVector(attacker,target),side=Math.random()<.5?-1:1;({x:target.x,z:target.z}=clampToStage(this.stage,target.x-aim.x*75-aim.z*side*70,target.z-aim.z*75+aim.x*side*70));target.inv=.28;target.lensAutoDodges--;target.visualAction=side<0?'lensDodgeLeft':'lensDodgeRight';target.visualActionTime=.34;this.burst(oldX,oldZ,'#c9f6ff',14,55);this.burst(target.x,target.z,'#c9f6ff',14,55);this.notice(`LENS AUTO-DODGE • ${target.lensAutoDodges} LEFT`);return false;
    }

    const guarded=target.block&&target.grounded&&blockFacesAttacker(target,attacker),perfect=guarded&&target.blockAge<=PERFECT_BLOCK_WINDOW,aim=aimVector(attacker,target);
    if(guarded){
      const category=abilityCategory(kind),categoryScale=category==='power'?1.18:category==='shot'?.9:1;
      const spent=(perfect?guardDamage*.18:guardDamage)*categoryScale;target.guard=Math.max(0,target.guard-spent);target.guardDelay=1.25;target.stun=perfect?.04:.115;target.kvx=aim.x*knockback*(perfect?.08:.35);target.kvz=aim.z*knockback*(perfect?.08:.35);this.hitstop=Math.max(this.hitstop,(perfect?7:3)*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,(perfect?4:2)*this.feedback.shakeScale);if(perfect&&!target.cpu)this.recordTrainingEvent('perfectParry');this.burst(target.x,target.z,perfect?'#fff4a3':'#9de7ff',perfect?18:9,58);this.audio.play(perfect?'perfect':'block');if(perfect)document.dispatchEvent(new CustomEvent('pxarenafeedback',{detail:{type:'perfectParry',target:target.name,attacker:attacker.name}}));
      if(perfect){attacker.stun=Math.max(attacker.stun,.24);target.en=clamp(target.en+8,0,100);target.momentum=clamp(target.momentum+15,0,100);this.combatEvent('perfectParry',{side:target===this.fighters[0]?1:2,label:'PERFECT PARRY'});this.pulseHud(`[data-g${target===this.fighters[0]?1:2}]`,'eventParry');this.notice('PERFECT PARRY • MOMENTUM +15');this.root.classList.remove('perfectParryPulse');void this.root.offsetWidth;this.root.classList.add('perfectParryPulse');setTimeout(()=>this.root?.classList.remove('perfectParryPulse'),360);globalThis.document?.dispatchEvent?.(new CustomEvent('pxperfectparry',{detail:{side:target.side,fighterId:target.id,cpu:target.cpu,engine:'arena'}}))}
      if(target.guard<=0){target.guard=28;target.guardBreak=.88;target.stun=.88;target.block=false;target.blockLockout=1;target.hp=Math.max(0,target.hp-2);registerRecoverableDamage(target,2,{strong:true});this.hitstop=Math.max(this.hitstop,10*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,10*this.feedback.shakeScale);if(attacker&&!attacker.cpu)this.recordTrainingEvent('guardBreak');this.burst(target.x,target.z,'#ffdc75',28,60);this.audio.play('guardBreak');this.combatEvent('guardBreak',{side:target===this.fighters[0]?1:2,label:'GUARD BREAK'});this.pulseHud(`[data-g${target===this.fighters[0]?1:2}]`,'eventBreak',760);document.dispatchEvent(new CustomEvent('pxarenafeedback',{detail:{type:'guardBreak',target:target.name,attacker:attacker.name}}));this.notice('GUARD BREAK!')}
      return true;
    }

    const comboIndex=attacker&&attacker.comboTimer>0?attacker.comboHits:0,comboScale=kind==='grab'?1:Math.max(.55,1-comboIndex*.08);
    let finalDamage=damage*comboScale*Math.max(1,Number(attacker?.storyAttackMultiplier)||1)*Math.max(.65,Math.min(1,Number(target?.storyDefenseMultiplier)||1));
    const armorDef=target.attackState?.def,armored=armorDef?.armorStart!=null&&target.attackState.elapsed>=armorDef.armorStart&&target.attackState.elapsed<=armorDef.armorEnd&&!['grab','ultimate','projectile'].includes(kind);
    if(armored){finalDamage*=.72;stun*=.25;knockback*=.35;this.burst(target.x,target.z,'#d7b979',16,62);this.notice(`${target.name.toUpperCase()} • STARTUP ARMOR`,.55)}
    if(target.dashArmor>0&&counterable){finalDamage*=.82;stun*=.5;knockback*=.45;this.burst(target.x,target.z,'#d8b774',14,52);this.notice(`${target.name.toUpperCase()} • ARMORED STEP`,.5)}
    if(target.id==='bark'&&target.grounded&&!['ultimate','grab'].includes(kind))knockback*=.78;const attackerFeel=this.feel(attacker);
    if(target.armorDurability>0){const armorLoss=(kind==='heavy'||kind==='airHeavy'||kind==='ultimate'||kind==='pursuitHeavy'?34:18);target.armorDurability=Math.max(0,target.armorDurability-armorLoss);finalDamage*=kind==='ultimate'?.78:.58;knockback*=.58;if(target.armorDurability<=0){target.stun=Math.max(target.stun,.34);this.burst(target.x,target.z,'#d2ae72',30,70);this.notice('ROCK ARMOR BROKEN')}}

    target.hp=Math.max(0,target.hp-finalDamage);target.hurtIdentityFlash=.18;target.lastHitKind=kind;registerRecoverableDamage(target,finalDamage,{strong:['heavy','airHeavy','launcher','pursuitHeavy','ultimate'].includes(kind)});target.stun=Math.max(target.stun,stun);target.inv=.045;target.flash=.12;target.guardDelay=1.1;target.kvx=aim.x*knockback;target.kvz=aim.z*knockback;
    if(target.abilityState&&!target.abilityState.executed){target.abilityState=null;target.abilityRecovery=.34;target.visualActionTime=0;this.notice(`${target.name.toUpperCase()} TECHNIQUE INTERRUPTED`,.75)}
    if(target.characterAbilityState&&!target.characterAbilityState.executed){target.characterAbilityState=null;target.abilityRecovery=.34;target.visualActionTime=0;this.notice(`${target.name.toUpperCase()} TECHNIQUE INTERRUPTED`,.75)}
    if(launch){target.grounded=false;target.vy=Math.max(target.vy,launch);target.y=Math.max(2,target.y)}
    if(spike&&target.y>0)target.vy=-spike;
    if(knockdown)target.knockdown=Math.max(target.knockdown,.72);

    const airborne=!target.grounded||launch>0;
    if(airborne&&kind!=='projectile'&&kind!=='ultimate'&&kind!=='grab'){
      target.airHitsTaken++;
      if(target.airHitsTaken>=JUGGLE_LIMIT){target.juggleProtection=.7;target.inv=Math.max(target.inv,.14);target.vy=-360;target.knockdown=Math.max(target.knockdown,.72);target.stun=Math.max(target.stun,.42);this.notice('JUGGLE LIMIT • FORCED RECOVERY',.8)}
    }

    const ringOutStarted=this.recordEdgePressure(attacker,target,{kind,knockback});
    let wallSplatTriggered=false;
    if(attacker&&!ringOutStarted&&canWallSplat({ringOutEnabled:this.ringOutEnabled,nearWall:this.stageProfile?.boundary==='WALLED'&&this.isNearStageWall(target,64),kind,used:attacker.comboWallSplatUsed})){
      const centerX=(this.stage.bounds.minX+this.stage.bounds.maxX)/2,centerZ=(this.stage.bounds.minZ+this.stage.bounds.maxZ)/2,inward=normalizeMovement(centerX-target.x,centerZ-target.z);target.kvx=inward.x*54;target.kvz=inward.z*54;target.stun=Math.max(target.stun,PURSUIT_TUNING.wallSplatStun);target.wallSplat=PURSUIT_TUNING.wallSplatStun;attacker.comboWallSplatUsed=true;wallSplatTriggered=true;this.hitstop=Math.max(this.hitstop,PURSUIT_TUNING.wallSplatHitstopFrames*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,8*this.feedback.shakeScale);this.pursuitImpactHold=Math.max(this.pursuitImpactHold,3*STEP);const wallFx={dojo:['#d7a56e','#fff0c0'],tournament:['#ffe59b','#fff6cf'],'resonance-facility':['#6ce8ff','#d8fbff'],'echo-caverns':['#b89a72','#efe0c5'],'echo-mountain':['#dbeaff','#ffffff']}[this.stage.id]||['#fff0ba','#fff7dc'];this.stageBoundaryPulse=.36;this.burst(target.x,target.z,wallFx[0],34,66);this.impactFlash(wallFx[1],.12);this.audio.play('wallSplat');this.combatEvent('wallSplat',{side:target===this.fighters[0]?2:1,label:'WALL SPLAT'});this.notice('WALL SPLAT • ONE PER COMBO',.9);if(!attacker.cpu)this.recordTrainingEvent('wallSplat')
    }
    const airborneForBounce=!target.grounded||target.y>0||launch>0;
    if(attacker&&canGroundBounce({kind,airborne:airborneForBounce,used:attacker.comboGroundBounceUsed,wallSplat:wallSplatTriggered})){target.groundBouncePending=1.25;target.groundBounceOwner=attacker;attacker.comboGroundBounceUsed=true}

    if(attacker){
      const energyGain=kind==='heavy'||kind==='airHeavy'||kind==='pursuitHeavy'?8:kind==='launcher'?7:kind==='projectile'?3:kind==='grab'?4:5;
      const momentumGain=kind==='pursuitHeavy'?16:kind==='pursuitLight'?12:kind==='heavy'||kind==='launcher'?9:kind==='light3'?7:kind==='projectile'?3:kind==='grab'?2:4;
      attacker.en=clamp(attacker.en+energyGain,0,100);attacker.momentum=clamp(attacker.momentum+momentumGain,0,100);
      if(['heavy','launcher'].includes(kind)&&!attacker.pursuitUsed&&target.hp>0&&!ringOutStarted&&!wallSplatTriggered){attacker.pursuitWindow=pursuitWindowFor(kind);attacker.pursuitTarget=target;this.notice(`PURSUIT WINDOW • DASH • ${kind==='launcher'?'LONG':'SHORT'} CHASE`,.8)}
      attacker.comboHits=attacker.comboTimer>0?attacker.comboHits+1:1;attacker.comboDamage=(attacker.comboTimer>0?attacker.comboDamage:0)+finalDamage;attacker.comboTimer=.94;attacker.comboTextTime=1.05;
    }
    target.en=clamp(target.en+2,0,100);target.momentum=clamp(target.momentum+Math.min(5,finalDamage*.22),0,100);
    if(target.lens>0)target.lensWasHit=true;
    if(attacker&&!attacker.cpu){
      const action=this.trainingTrial?.pendingAction||kind;this.recordTrainingEvent('connectedAction',{action});
      if(kind==='launcher')this.recordTrainingEvent('launcherHit');
      if(['pursuitLight','pursuitHeavy'].includes(kind))this.recordTrainingEvent('pursuitFollowupHit',{kind});
      if(kind==='pursuitHeavy')this.recordTrainingEvent('pursuitFinisherHit');
      if(kind==='grab')this.recordTrainingEvent('grabHit');
    }
    const impactName=kind==='pursuitHeavy'?'pursuitHeavy':kind==='pursuitLight'?'pursuitLight':kind==='heavy'||kind==='airHeavy'?'heavy':kind==='launcher'?'launcher':'light',feel=this.feel(attacker);this.hitstop=Math.max(this.hitstop,hitstop*(feel.hitstopScale||1)*STEP*this.feedback.hitstopScale);this.cameraShake=Math.max(this.cameraShake,(kind==='heavy'||kind==='airHeavy'||kind==='pursuitHeavy'?9:kind==='launcher'?10:5)*(feel.shakeScale||1)*this.feedback.shakeScale);this.impactFlash(color,['heavy','launcher','pursuitHeavy'].includes(kind)?.18:.09);this.burst(target.x,target.z,color,['heavy','launcher','pursuitHeavy'].includes(kind)?24:17,58+target.y);this.audio.play(impactName,0,attacker?.id);if(['heavy','airHeavy','pursuitHeavy','launcher'].includes(kind))document.dispatchEvent(new CustomEvent('pxarenafeedback',{detail:{type:'heavyImpact',target:target.name,attacker:attacker.name}}));return true;
  }
  impactFlash(color,opacity){const element=this.root.querySelector('[data-impact-flash]');if(!element)return;const flash=loadQolSettings().accessibility?.screenFlash||'full',scale=flash==='off'?0:flash==='reduced'?.35:1;element.style.background=color;element.style.opacity=String(Math.max(0,Number(opacity)||0)*scale);this.flashTime=scale?Math.min(.08,.045+opacity*.12):0}
  notice(message,duration=1.15){const element=this.root.querySelector('[data-arena-notice]');element.textContent=message;element.classList.toggle('show',!!message);this.noticeTime=message?duration:0}
  pulseHud(selector,className,duration=620){const node=this.root.querySelector(selector);if(!node)return;node.classList.remove(className);void node.offsetWidth;node.classList.add(className);setTimeout(()=>node?.classList.remove(className),duration)}
  combatEvent(type,{side=1,label='',duration=720}={}){
    if(!this.active||this.paused||this.phase!=='play'||!this.root||!this.root.querySelector('[data-result]')?.classList.contains('hidden'))return false;
    const layer=this.root.querySelector('[data-combat-event-layer]');if(!layer)return false;
    const data={perfectParry:['⬡','PARRY'],guardBreak:['✹','BREAK'],pursuitTech:['↝','TECH'],wallSplat:['▰','SPLAT'],groundBounce:['↓','BOUNCE'],fullEnergy:['✦','FULL'],criticalHealth:['!','DANGER'],abilityReady:['◇','READY']}[type]||['•',String(type||'EVENT').toUpperCase()];
    const node=document.createElement('div');node.className=`combatEvent ${type} side${side}`;node.dataset.serial=String(++this.combatEventSerial);node.innerHTML=`<span aria-hidden="true">${data[0]}</span><strong>${label||data[1]}</strong>`;layer.appendChild(node);
    requestAnimationFrame(()=>node.classList.add('show'));setTimeout(()=>{node.classList.remove('show');setTimeout(()=>node.remove(),180)},duration);
    if(side===1)this.root.classList.add(`event-${type}`);setTimeout(()=>this.root?.classList.remove(`event-${type}`),Math.min(duration,520));return true;
  }
  volleyActive(fighter){return this.agonyClones.some(clone=>clone.owner===fighter)||this.projectiles.some(projectile=>projectile.owner===fighter&&projectile.volley)}

  abilityReady(fighter,ability){
    const cancel=this.canCancelAbility(fighter,ability),cost=ability.id==='lensOfTruth'?this.lensCosts().energy:ability.cost;
    return this.phase==='play'&&!this.paused&&!fighter.stun&&!fighter.guardBreak&&fighter.grounded&&!fighter.abilityState&&!fighter.characterAbilityState&&(cancel||!fighter.attackState)&&fighter.cooldowns[ability.id]<=0&&fighter.en>=cost&&(ability.id!=='shotsOfAgony'||!this.volleyActive(fighter));
  }

  canCancelAbility(fighter,ability){
    const state=fighter.attackState;if(!state?.hit||state.elapsed<state.def.activeStart)return false;
    const allowed={
      fireBlast:['light3','heavy'],shotsOfAgony:['light3','heavy'],objectSwap:['light1','light2','light3','heavy','launcher'],
      lensOfTruth:[],ultimate:['heavy','launcher']
    };
    return(allowed[ability.id]||[]).includes(state.def.kind);
  }

  castAbility(slot,side=1){
    if(Number(side)===1)this.selectedAbilitySlot=Math.max(0,Math.min(4,Number(slot)-1));
    const index=Math.max(0,Math.min(1,Number(side)-1)),fighter=this.fighters[index],foe=this.fighters[1-index],ability=this.playerAbility(fighter,slot);if(!this.active||!ability||ability.locked)return false;
    if(ability.character)return this.castCharacterAbility(fighter,foe,ability.id);
    if(this.phase!=='play'||this.paused){this.notice(this.paused?'MATCH PAUSED':'WAIT FOR FIGHT');return false}
    const cancel=this.canCancelAbility(fighter,ability),lensCosts=this.lensCosts(),energyCost=ability.id==='lensOfTruth'?lensCosts.energy:ability.cost;
    if(fighter.stun||fighter.guardBreak||!fighter.grounded||fighter.abilityState||fighter.characterAbilityState||(fighter.attackState&&!cancel)){this.notice('ABILITY UNAVAILABLE • FINISH YOUR ACTION');return false}
    if(fighter.cooldowns[ability.id]>0){this.notice(`${ability.label.toUpperCase()} • ${fighter.cooldowns[ability.id].toFixed(1)}s`);return false}
    if(ability.id==='shotsOfAgony'&&this.volleyActive(fighter)){this.notice('SHOTS VOLLEY ACTIVE');return false}
    if(fighter.en<energyCost){this.notice(`NEED ${energyCost} ENERGY`);return false}

    const timing=abilityTiming(ability.id),finisher=ability.category==='power'&&fighter.momentum>=100;
    if(['fireBlast','shotsOfAgony','ultimate'].includes(ability.id))fighter.combatHabits.projectiles=Math.min(5,(fighter.combatHabits.projectiles||0)+1);
    fighter.attackState=null;fighter.charging=false;fighter.en=ability.id==='shotsOfAgony'?0:fighter.en-energyCost;fighter.cooldowns[ability.id]=ability.id==='shotsOfAgony'?0:ability.cooldown;
    const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;
    const visual={fireBlast:'fireBlastFire',shotsOfAgony:'shotsSummon',objectSwap:'objectSwapDisappear',lensOfTruth:'lensActivate',ultimate:'ultimateAttack'}[ability.id]||'chargeEnergy';
    fighter.visualAction=visual;fighter.visualActionTime=timing.startup+timing.recovery;if(!fighter.cpu)this.trainingTrial.pendingAction=ability.id;fighter.abilityState={ability,elapsed:0,startup:timing.startup,recovery:timing.recovery,executed:false,finisher,lensCosts};
    this.notice(`${SPECIAL_CATEGORIES[ability.category].label} • ${ability.label.toUpperCase()}${finisher?' • FINISHER READY':''}`,Math.max(.7,timing.startup+.3));this.hud();return true;
  }

  updateAbilityState(fighter,foe,dt){
    const state=fighter.abilityState;if(!state)return false;
    state.elapsed+=dt;fighter.block=false;fighter.charging=false;fighter.moveVX*=.72;fighter.moveVZ*=.72;
    if(!state.executed&&state.elapsed>=state.startup){state.executed=true;this.executeAbility(fighter,foe,state)}
    if(state.elapsed>=state.startup+state.recovery){fighter.abilityState=null;fighter.abilityRecovery=.08;fighter.visualActionTime=0}
    return true;
  }

  executeAbility(fighter,foe,state){
    const ability=state.ability,aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;
    if(ability.id==='fireBlast'){
      this.spawnProjectile(fighter,{speed:450,damage:11.5,radius:24,height:72,life:2.1,color:'#ff6a31',clashPower:1.1,label:'FIRE BLAST',guardDamage:6});this.audio.play('projectile');this.notice('SHOT • FIRE BLAST');
    }else if(ability.id==='shotsOfAgony'){
      const radius=132;for(let index=0;index<4;index++){const angle=index/4*Math.PI*2,point=clampToStage(this.stage,foe.x+Math.cos(angle)*radius,foe.z+Math.sin(angle)*radius);this.agonyClones.push({owner:fighter,target:foe,x:point.x,z:point.z,life:1.35,fireAt:.58,fired:false,index,color:'#6ebcff'})}this.notice('SHOT • SHOTS OF AGONY • ALL ENERGY COMMITTED',1.4);
    }else if(ability.id==='objectSwap'){
      const oldX=fighter.x,oldZ=fighter.z,swapDistance=88+Math.max(0,Number(fighter.objectSwapRangeBonus)||0)*28,swapSide=38+Math.max(0,Number(fighter.objectSwapRangeBonus)||0)*12;({x:fighter.x,z:fighter.z}=clampToStage(this.stage,foe.x-aim.x*swapDistance-aim.z*swapSide,foe.z-aim.z*swapDistance+aim.x*swapSide));fighter.inv=.16;fighter.moveVX=fighter.moveVZ=0;this.burst(oldX,oldZ,'#ffd079',18,50);this.burst(fighter.x,fighter.z,'#ffd079',18,50);this.notice('TRICK • OBJECT SWAP • ARRIVAL RECOVERY');
    }else if(ability.id==='lensOfTruth'){
      const costs=state.lensCosts||this.lensCosts();fighter.hp=Math.max(1,fighter.hp-costs.hp);fighter.lens=costs.duration;fighter.lensAutoDodges=costs.autoDodges;fighter.lensStartHp=fighter.hp;fighter.lensWasHit=false;fighter.lensPrediction=this.predictedAction(foe);fighter.lensPredictionTriggered=false;this.burst(fighter.x,fighter.z,'#d4fbff',28,70);this.notice(`TRICK • LENS • ${costs.hp} HP • ${fighter.lensPrediction}`,1.8);
    }else if(ability.id==='ultimate'){
      const finisher=state.finisher,damage=finisher?58:44,radius=finisher?82:68,knockLabel=finisher?'MOMENTUM FINISHER: SOLAR WEAVE':'FIRE AWAKENING: SOLAR WEAVE';
      if(finisher)fighter.momentum=0;this.spawnProjectile(fighter,{speed:finisher?560:500,damage,radius,height:finisher?124:110,life:2.25,color:'#ffbd42',ultimate:true,clashPower:finisher?5:4,label:knockLabel,guardDamage:finisher?30:18,knockback:finisher?168:118,finisher});this.burst(fighter.x,fighter.z,'#ffd45b',finisher?54:38,72);this.notice(`${knockLabel}${finisher?' • DODGE OR PARRY':''}`,1.7);
    }
  }
  castRevvfoBlast(fighter,foe){if(this.phase!=='play'||fighter.cooldowns.astrylteBlast>0||fighter.en<24||fighter.stun||fighter.guardBreak||fighter.attackState||!fighter.grounded)return false;fighter.en-=24;fighter.cooldowns.astrylteBlast=1.75;fighter.visualAction='astrylteBlast';fighter.visualActionTime=.48;const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;this.spawnProjectile(fighter,{speed:455,damage:12,radius:23,height:78,life:2.1,color:'#b463ff',label:'ASTRYLTE BLAST'});this.audio.play('projectile');return true}

  characterAbilitySpec(ability){
    return{
      lightningBeam:{cost:90,key:'lightningBeam',cooldown:8,startup:.48,recovery:.56},thunderstorm:{cost:34,key:'thunderstorm',cooldown:5.2,startup:.34,recovery:.42},
      lightningDash:{cost:24,key:'lightningDash',cooldown:2.7,startup:.16,recovery:.30},lightningBlast:{cost:10,key:'lightningBlast',cooldown:.58,startup:.12,recovery:.18},
      groundQuake:{cost:30,key:'groundQuake',cooldown:4.6,startup:.42,recovery:.52},rockArmor:{cost:24,key:'rockArmor',cooldown:7,startup:.32,recovery:.38},
      earthWall:{cost:24,key:'earthWall',cooldown:4.8,startup:.35,recovery:.40},seismicCounter:{cost:20,key:'seismicCounter',cooldown:3.4,startup:.15,recovery:.34},
      rockShot:{cost:16,key:'rockShot',cooldown:1.35,startup:.24,recovery:.30},poukiRush:{cost:26,key:'characterSpecial',cooldown:2.9,startup:.18,recovery:.34},
      sagePalm:{cost:24,key:'characterSpecial',cooldown:1.9,startup:.26,recovery:.34},genericBlast:{cost:24,key:'astrylteBlast',cooldown:1.75,startup:.22,recovery:.30}
    }[ability]||{cost:24,key:'characterSpecial',cooldown:2.2,startup:.24,recovery:.34};
  }

  castCharacterAbility(fighter,foe,requested=null){
    if(this.phase!=='play'||fighter.stun||fighter.guardBreak||fighter.attackState||fighter.abilityState||fighter.characterAbilityState||!fighter.grounded)return false;
    const ability=requested||fighter.aiQueuedAbility||'genericBlast',spec=this.characterAbilitySpec(ability);
    if(['genericBlast','lightningBlast','lightningBeam','rockShot'].includes(ability))fighter.combatHabits.projectiles=Math.min(5,(fighter.combatHabits.projectiles||0)+1);
    if(fighter.en<spec.cost||fighter.cooldowns[spec.key]>0)return false;
    // Spend on startup, not on impact. Interrupting a major technique is therefore
    // a real punish instead of a free reset.
    fighter.en-=spec.cost;fighter.cooldowns[spec.key]=spec.cooldown;fighter.aiQueuedAbility=null;
    if(!fighter.cpu)this.trainingTrial.pendingAction=ability;fighter.characterAbilityState={ability,elapsed:0,startup:spec.startup,recovery:spec.recovery,executed:false,reserved:true};
    fighter.visualAction=ability==='seismicCounter'?'counterStance':'chargeEnergy';fighter.visualActionTime=spec.startup+spec.recovery;fighter.block=false;
    this.notice(`${SPECIAL_CATEGORIES[abilityCategory(ability)].label} • ${String(ability).replace(/([A-Z])/g,' $1').toUpperCase()}`,.65);return true;
  }

  updateCharacterAbilityState(fighter,foe,dt){
    const state=fighter.characterAbilityState;if(!state)return false;state.elapsed+=dt;fighter.block=false;fighter.charging=false;fighter.moveVX*=.72;fighter.moveVZ*=.72;
    if(!state.executed&&state.elapsed>=state.startup){state.executed=true;this.executeCharacterAbility(fighter,foe,state.ability,true)}
    if(state.elapsed>=state.startup+state.recovery){fighter.characterAbilityState=null;fighter.abilityRecovery=.08;fighter.visualActionTime=0}
    return true;
  }

  executeCharacterAbility(fighter,foe,requested=null,reserved=false){
    if(this.phase!=='play'||fighter.stun||fighter.guardBreak||fighter.attackState||!fighter.grounded)return false;
    const ability=requested||fighter.aiQueuedAbility||'genericBlast';fighter.aiQueuedAbility=null;
    const spend=(cost,key,cooldown)=>{if(reserved)return true;if(fighter.en<cost||fighter.cooldowns[key]>0)return false;fighter.en-=cost;fighter.cooldowns[key]=cooldown;return true};
    const face=aimVector(fighter,foe);fighter.aimX=face.x;fighter.aimZ=face.z;
    if(fighter.id==='wade'){
      if(ability==='lightningBeam'&&spend(90,'lightningBeam',8)){fighter.visualAction='beamAttack';fighter.visualActionTime=.95;this.spawnProjectile(fighter,{speed:680,damage:39,radius:58,height:96,life:1.75,color:'#82e8ff',ultimate:true,clashPower:4,label:'LIGHTNING BEAM'});this.notice('WADE • POWER • LIGHTNING BEAM');return true}
      if(ability==='thunderstorm'&&spend(34,'thunderstorm',5.2)){fighter.visualAction='thunderstorm';fighter.visualActionTime=.72;for(let index=0;index<5;index++){const angle=index/5*Math.PI*2,rad=index===0?0:70+index*16;const point=clampToStage(this.stage,foe.x+Math.cos(angle)*rad,foe.z+Math.sin(angle)*rad);this.thunderZones.push({owner:fighter,target:foe,x:point.x,z:point.z,warning:.48+index*.08,life:1.05+index*.08,struck:false,radius:56,color:'#8fefff'})}this.notice('WADE • TRICK • THUNDERSTORM');return true}
      if(ability==='lightningDash'&&spend(24,'lightningDash',2.7)){fighter.visualAction='teleportRush';fighter.visualActionTime=.42;fighter.inv=.18;const distance=Math.hypot(foe.x-fighter.x,foe.z-fighter.z),travel=Math.min(285,Math.max(120,distance-52));fighter.x+=face.x*travel;fighter.z+=face.z*travel;({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));if(Math.hypot(foe.x-fighter.x,foe.z-fighter.z)<112)this.applyDamage(fighter,foe,13,{guardDamage:17,knockback:82,color:'#82e8ff',hitstop:7,stun:.34,kind:'heavy'});this.burst(fighter.x,fighter.z,'#82e8ff',25,64);this.notice('WADE • TRICK • LIGHTNING DASH');return true}
      if(spend(10,'lightningBlast',.58)){fighter.visualAction='lightningBlast';fighter.visualActionTime=.3;this.spawnProjectile(fighter,{speed:720,damage:7.5,radius:17,height:70,life:1.55,color:'#82e8ff',clashPower:.7,label:'LIGHTNING BLAST'});return true}
      return false;
    }
    if(fighter.id==='bark'){
      if(ability==='groundQuake'&&spend(30,'groundQuake',4.6)){fighter.visualAction='groundQuake';fighter.visualActionTime=.82;this.quakes.push({owner:fighter,x:fighter.x,z:fighter.z,radius:12,maxRadius:420,life:.82,hit:new Set(),color:'#c99a58'});this.cameraShake=Math.max(this.cameraShake,9*this.feedback.shakeScale);this.notice('BARK • POWER • GROUND QUAKE');return true}
      if(ability==='rockArmor'&&spend(24,'rockArmor',7)){fighter.armorDurability=100;fighter.visualAction='rockArmor';fighter.visualActionTime=.7;this.burst(fighter.x,fighter.z,'#c8a06a',30,65);this.notice('BARK • TRICK • ROCK ARMOR');return true}
      if(ability==='earthWall'&&spend(24,'earthWall',4.8)){const point=clampToStage(this.stage,fighter.x+face.x*105,fighter.z+face.z*105);this.earthWalls.push({owner:fighter,x:point.x,z:point.z,rotation:Math.atan2(face.x,face.z),radius:62,hp:55,life:7,color:'#8c683f'});fighter.visualAction='earthWall';fighter.visualActionTime=.65;this.notice('BARK • TRICK • EARTH WALL');return true}
      if(ability==='seismicCounter'&&spend(20,'seismicCounter',3.4)){fighter.counterWindow=.72;fighter.counterKind='seismic';fighter.visualAction='counterStance';fighter.visualActionTime=.72;this.notice('BARK • TRICK • SEISMIC COUNTER');return true}
      if(spend(16,'rockShot',1.35)){fighter.visualAction='rockShot';fighter.visualActionTime=.42;this.spawnProjectile(fighter,{speed:330,damage:11,radius:31,height:72,life:2.2,color:'#b78a4c',physical:true,clashPower:2.4,guardDamage:18,label:'ROCK SHOT'});return true}
      return false;
    }
    if(fighter.id==='pouki'&&spend(26,'characterSpecial',2.9)){fighter.visualAction='pressureRush';fighter.visualActionTime=.55;fighter.inv=.12;fighter.x+=face.x*190;fighter.z+=face.z*190;({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));if(Math.hypot(foe.x-fighter.x,foe.z-fighter.z)<120)this.applyDamage(fighter,foe,15,{guardDamage:25,knockback:105,color:'#82bec4',hitstop:8,stun:.4,knockdown:true,kind:'heavy'});this.notice('POUKI • POWER • PRESSURE RUSH');return true}
    if((fighter.id==='plouke'||fighter.id==='sage')&&spend(24,'characterSpecial',1.9)){fighter.visualAction='sagePalm';fighter.visualActionTime=.48;if(Math.hypot(foe.x-fighter.x,foe.z-fighter.z)<165)this.applyDamage(fighter,foe,13,{guardDamage:17,knockback:120,color:'#eee5c8',hitstop:7,stun:.38,kind:'heavy'});else this.spawnProjectile(fighter,{speed:470,damage:12,radius:30,height:78,life:1.8,color:'#eee5c8',clashPower:1.7,label:'SAGE PALM'});return true}
    if(spend(24,'astrylteBlast',1.75)){fighter.visualAction='astrylteBlast';fighter.visualActionTime=.48;this.spawnProjectile(fighter,{speed:455,damage:12,radius:23,height:78,life:2.1,color:'#b463ff',label:'ASTRYLTE BLAST'});this.audio.play('projectile');return true}
    return false;
  }

  spawnProjectile(owner,{speed=360,damage=10,radius=22,height=76,life=2,color='#ffffff',ultimate=false,volley=false,label='',origin=null,physical=false,clashPower=1,guardDamage=null,knockback=null,finisher=false}={}){const target=this.fighters.find(fighter=>fighter!==owner),source=origin||owner,aim=aimVector(source,target),startX=source.x+aim.x*40,startZ=source.z+aim.z*40,startY=origin?.y??68+owner.y,targetY=(target.y??0)+target.bodyCenter,vy=clamp((targetY-startY)*2.2,-105,105);this.projectiles.push({owner,target,x:startX,z:startZ,y:startY,vx:aim.x*speed,vz:aim.z*speed,vy,damage,radius,height,life,maxLife:life,color,ultimate,volley,label,physical,clashPower,guardDamage,knockback,finisher,trailX:source.x,trailZ:source.z,trailY:startY})}

  updateSpecials(dt){
    for(const clone of this.agonyClones){clone.life-=dt;clone.fireAt-=dt;if(!clone.fired&&clone.fireAt<=0){clone.fired=true;clone.owner.cooldowns.shotsOfAgony=7;this.spawnProjectile(clone.owner,{speed:455,damage:7.5,radius:18,height:75,life:1.7,color:clone.color||'#6ebcff',volley:true,clashPower:.8,label:'SHOT OF AGONY',origin:{x:clone.x,z:clone.z,y:62}})}}this.agonyClones=this.agonyClones.filter(clone=>clone.life>0);
    for(const zone of this.thunderZones){zone.life-=dt;zone.warning-=dt;if(!zone.struck&&zone.warning<=0){zone.struck=true;const target=zone.target;if(target.grounded&&Math.hypot(target.x-zone.x,target.z-zone.z)<=zone.radius)this.applyDamage(zone.owner,target,9,{guardDamage:10,knockback:35,color:zone.color,hitstop:5,stun:.34,kind:'projectile'});this.burst(zone.x,zone.z,zone.color,22,90);this.cameraShake=Math.max(this.cameraShake,4*this.feedback.shakeScale)}}this.thunderZones=this.thunderZones.filter(zone=>zone.life>0);
    for(const quake of this.quakes){quake.life-=dt;quake.radius=Math.min(quake.maxRadius,quake.radius+quake.maxRadius*dt/Math.max(.01,quake.life+.15));for(const target of this.fighters){if(target===quake.owner||quake.hit.has(target)||!target.grounded)continue;const distance=Math.hypot(target.x-quake.x,target.z-quake.z);if(distance<=quake.radius&&distance>=Math.max(0,quake.radius-52)){quake.hit.add(target);this.applyDamage(quake.owner,target,7,{guardDamage:12,knockback:28,color:quake.color,hitstop:6,stun:.72,knockdown:true,kind:'projectile'})}}}this.quakes=this.quakes.filter(quake=>quake.life>0);
    for(const wall of this.earthWalls)wall.life-=dt;this.earthWalls=this.earthWalls.filter(wall=>wall.life>0&&wall.hp>0);
    for(const projectile of this.projectiles){
      projectile.life-=dt;projectile.trailX=projectile.x;projectile.trailZ=projectile.z;projectile.trailY=projectile.y;projectile.x+=projectile.vx*dt;projectile.z+=projectile.vz*dt;projectile.y+=projectile.vy*dt;
      const wall=this.earthWalls.find(item=>item.owner!==projectile.owner&&Math.hypot(projectile.x-item.x,projectile.z-item.z)<item.radius+projectile.radius*.65);
      if(wall){wall.hp-=projectile.ultimate?60:projectile.damage*2.2;projectile.life=0;this.burst(projectile.x,projectile.z,'#c8a06a',18,55);if(wall.hp<=0)this.notice('EARTH WALL SHATTERED')}
      const target=projectile.target;if(projectile.life>0&&projectileConnects(projectile,target)){this.applyDamage(projectile.owner,target,projectile.damage,{guardDamage:projectile.guardDamage??(projectile.ultimate?18:projectile.physical?15:5),knockback:projectile.knockback??(projectile.ultimate?118:projectile.physical?72:46),color:projectile.color,hitstop:projectile.ultimate?11:6,stun:projectile.ultimate?.48:projectile.physical?.34:.27,knockdown:projectile.ultimate||projectile.physical&&projectile.damage>=12,kind:projectile.ultimate?'ultimate':'projectile'});projectile.life=0}
      if(outsideStageProjectileBounds(this.stage,projectile))projectile.life=0;
    }
    for(let i=0;i<this.projectiles.length;i++)for(let j=i+1;j<this.projectiles.length;j++){const a=this.projectiles[i],b=this.projectiles[j];if(a.life<=0||b.life<=0||a.owner===b.owner)continue;if(Math.hypot(a.x-b.x,a.z-b.z)>a.radius+b.radius||Math.abs(a.y-b.y)>60)continue;const delta=(a.clashPower||1)-(b.clashPower||1);if(Math.abs(delta)<.35){a.life=b.life=0;this.notice('PROJECTILE CLASH')}else if(delta>0)b.life=0;else a.life=0;this.burst((a.x+b.x)/2,(a.z+b.z)/2,'#ffffff',18,(a.y+b.y)/2)}
    this.projectiles=this.projectiles.filter(projectile=>projectile.life>0);
  }

  finishRound(){if(this.phase!=='play')return;const[a,b]=this.fighters,winner=b.hp>a.hp?1:a.hp>b.hp?0:(Math.random()<.5?0:1);this.lastLoser=1-winner;this.scores[winner]++;this.fighters[winner].victoryPoseTime=2.4;this.fighters[1-winner].victoryPoseTime=0;this.phase='over';this.phaseTime=.72;for(const fighter of this.fighters){this.clearPursuitState(fighter);endFocusRecovery(fighter,{applyRecovery:false})}this.root.classList.remove('pursuit-active');this.banner(`K.O. • ${this.scores[0]}–${this.scores[1]}`);this.audio.play('ko');this.hud()}
  showResult(){this.phase='result';this.hideBanner();const winner=this.scores[0]>this.scores[1]?0:1,result=this.root.querySelector('[data-result]'),random=result.querySelector('[data-random-rematch]');if(random)random.classList.toggle('hidden',!this.allowRandomRematch);result.querySelector('[data-title]').textContent=`${this.fighters[winner].name.toUpperCase()} WINS`;result.querySelector('[data-text]').textContent=`First to ${this.koTarget} ${this.koTarget===1?'KO':'KOs'} complete. Final score ${this.scores[0]}–${this.scores[1]}. KOs flowed continuously without resetting the winner.`;result.classList.remove('hidden')}

  completeLensUse(fighter){
    if(fighter.id!=='rrvvfo'||fighter.cpu)return;
    const gain=fighter.lensWasHit?1:4,mastery=this.saveLensMastery(this.lensMastery+gain);this.notice(`LENS MASTERY +${gain} • ${mastery}%`,1.35);fighter.lensPrediction='';fighter.lensAutoDodges=0;
  }

  lensOverlayPreference(){
    try{const saved=JSON.parse(localStorage.getItem('pxQolSettingsV1')||'null');return saved?.accessibility?.lensOverlay==='reduced'?'reduced':'full'}catch{return 'full'}
  }
  updateLensBlindness(){
    const overlay=this.root.querySelector('[data-lens-blindness]');if(!overlay)return;
    const fighter=this.active?this.fighters.find(candidate=>candidate.id==='rrvvfo'&&!candidate.cpu&&candidate.lens>0):null;
    const active=!!fighter;overlay.classList.toggle('active',active);overlay.setAttribute('aria-hidden',String(!active));
    // Use explicit inline visibility as well as classes. This prevents Safari/WebGL
    // compositing and stale stylesheet state from leaving the blindness layer hidden.
    overlay.style.display=active?'grid':'none';
    overlay.style.visibility=active?'visible':'hidden';
    overlay.style.opacity=active?'1':'0';
    overlay.style.zIndex='10';
    if(!active){overlay.classList.remove('ending','reduced');return}
    const preference=this.lensOverlayPreference();
    overlay.style.background=preference==='reduced'?'rgba(0,0,0,.18)':'linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.48))';
    const ending=fighter.lens<=1;overlay.classList.toggle('ending',ending);overlay.classList.toggle('reduced',preference==='reduced');
    overlay.querySelector('[data-lens-status]').textContent=ending?`WARNING • ${fighter.lensPrediction}`:`MOST PROBABLE: ${fighter.lensPrediction}${fighter.lensAutoDodges?` • AUTO-DODGES ${fighter.lensAutoDodges}`:''}`;
    overlay.querySelector('[data-lens-time]').textContent=`${Math.max(1,Math.ceil(fighter.lens))}s`;overlay.querySelector('[data-lens-mastery]').textContent=`MASTERY ${this.lensMastery}%`;
  }

  hud(){
    const[player,foe]=this.fighters,playerRecovery=recoverableHealthView(player),foeRecovery=recoverableHealthView(foe);
    this.root.classList.toggle('arenaLowHealth',this.phase==='play'&&player.hp/(player.maxHp||100)<=.25);
    for(const [index,fighter] of this.fighters.entries()){
      const healthPercent=clamp((fighter.hp/(fighter.maxHp||100))*100,0,100);
      this.root.querySelector(`[data-h${index+1}]`).style.width=`${healthPercent}%`;const recoveryView=index===0?playerRecovery:foeRecovery,recoverable=this.root.querySelector(`[data-rh${index+1}]`);if(recoverable){recoverable.style.left=`${recoveryView.healthPercent}%`;recoverable.style.width=`${recoveryView.recoverablePercent}%`}this.root.querySelector(`[data-health-track="${index+1}"]`)?.classList.toggle('focusActive',fighter.focusRecovering);
      const energy=this.root.querySelector(`[data-e${index+1}]`);energy.style.width=`${fighter.en}%`;energy.classList.toggle('ready',fighter.en>=100);energy.classList.toggle('nearReady',fighter.en>=80&&fighter.en<100);
      const guard=this.root.querySelector(`[data-g${index+1}]`);guard.style.width=`${fighter.guard}%`;guard.classList.toggle('low',fighter.guard<30);guard.classList.toggle('critical',fighter.guard<15);
      const fullEnergy=fighter.en>=100,criticalHealth=healthPercent<=25&&fighter.hp>0;
      if(fullEnergy&&!fighter.hudFullEnergy){fighter.hudFullEnergy=true;this.combatEvent('fullEnergy',{side:index+1,label:'ENERGY FULL',duration:650});this.pulseHud(`[data-e${index+1}]`,'eventFull',720)}else if(!fullEnergy)fighter.hudFullEnergy=false;
      if(criticalHealth&&!fighter.hudCriticalHealth){fighter.hudCriticalHealth=true;this.combatEvent('criticalHealth',{side:index+1,label:'CRITICAL HEALTH',duration:900});this.pulseHud(`[data-h${index+1}]`,'eventCritical',900)}else if(!criticalHealth)fighter.hudCriticalHealth=false;
      const momentum=this.root.querySelector(`[data-m${index+1}]`);if(momentum){momentum.style.width=`${fighter.momentum}%`;momentum.classList.toggle('ready',fighter.momentum>=100)}
      this.root.querySelector(index?'[data-e2-text]':'[data-energy-text]').textContent=Math.floor(fighter.en);
      this.root.querySelector(`[data-g${index+1}-text]`).textContent=Math.floor(fighter.guard);
      const momentumText=this.root.querySelector(`[data-m${index+1}-text]`);if(momentumText)momentumText.textContent=fighter.momentum>=100?'FINISHER':Math.floor(fighter.momentum);
    }
    this.root.querySelector('[data-s1]').textContent=`${this.scores[0]}/${this.koTarget}`;this.root.querySelector('[data-s2]').textContent=`${this.scores[1]}/${this.koTarget}`;this.root.querySelector('[data-time]').textContent='∞';this.root.querySelector('[data-round]').textContent=`FIRST TO ${this.koTarget} • BATTLE ${this.round}`;
    const combo=this.root.querySelector('[data-combo]');combo.classList.toggle('show',player.comboTextTime>0&&player.comboHits>1);combo.innerHTML=player.comboHits>1?`${player.comboHits} HIT COMBO<small>${player.comboDamage.toFixed(1)} DAMAGE • ${Math.max(55,100-(player.comboHits-1)*8)}% SCALE</small>`:'';
    const lensCosts=this.lensCosts(),loadout=playerLoadout(player.id);this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>{
      const ability=loadout[index]||null;
      if(!ability){button.classList.add('unavailable');button.setAttribute('aria-disabled','true');return}
      const spec=ability.character?this.characterAbilitySpec(ability.id):null;
      const cooldownKey=spec?.key||ability.id,cooldown=player.cooldowns[cooldownKey]||0;
      const active=ability.character?player.characterAbilityState?.ability===ability.id:ability.id==='shotsOfAgony'?this.volleyActive(player):ability.id==='lensOfTruth'&&player.lens>0;
      const cost=ability.id==='lensOfTruth'?lensCosts.energy:(spec?.cost??ability.cost??0);
      const available=!ability.locked&&(ability.character?this.phase==='play'&&!this.paused&&!player.stun&&!player.guardBreak&&player.grounded&&!player.attackState&&!player.abilityState&&!player.characterAbilityState&&cooldown<=0&&player.en>=cost:this.abilityReady(player,ability));
      const previousCooldown=Number(button.dataset.previousCooldown||0);if(previousCooldown>0&&cooldown<=0){button.classList.remove('justReady');void button.offsetWidth;button.classList.add('justReady');setTimeout(()=>button?.classList.remove('justReady'),720);if(index===this.selectedAbilitySlot)this.combatEvent('abilityReady',{side:1,label:'ABILITY READY',duration:540})}button.dataset.previousCooldown=String(cooldown);
      button.classList.toggle('selected',index===this.selectedAbilitySlot);button.classList.toggle('active',Boolean(active));button.classList.toggle('unavailable',!available&&!active);button.classList.toggle('loadoutLocked',Boolean(ability.locked));button.setAttribute('aria-disabled',String(!available));
      const maxCooldown=spec?.cooldown??ability.cooldown??0;button.style.setProperty('--cooldown-fill',`${maxCooldown?clamp(cooldown/maxCooldown,0,1)*100:0}%`);
      let state=ability.locked?'LOCKED':'READY';
      if(player.abilityState?.ability?.id===ability.id||player.characterAbilityState?.ability===ability.id)state=(player.abilityState?.executed||player.characterAbilityState?.executed)?'RECOVERY':'STARTUP';
      else if(active)state=ability.id==='lensOfTruth'?`${Math.ceil(player.lens)}s • ${this.lensMastery}%`:'ACTIVE';else if(cooldown>0)state=`${cooldown.toFixed(1)}s`;else if(ability.ultimate&&player.momentum>=100)state='FINISHER READY';else if(player.en<cost)state=`NEED ${cost}`;
      button.querySelector('[data-arena-state]').textContent=state;
      const costNode=button.querySelector('.arenaCost');if(costNode)costNode.textContent=ability.locked?'LEARN LATER':ability.id==='lensOfTruth'?`${lensCosts.energy} ENERGY • ${lensCosts.hp} HP`:ability.id==='shotsOfAgony'?'ALL ENERGY':`${cost} ENERGY`;
    });
    const edge=this.root.querySelector('[data-edge-warning]');if(edge){const danger=this.phase==='play'&&this.isNearRingEdge(player,95);edge.classList.toggle('show',danger||player.ringOutFall>0);edge.textContent=player.ringOutFall>0?'FALLING OUT!':`EDGE PRESSURE ${player.edgePressureHits}/${EDGE_PRESSURE_HITS} • ESCAPE OR COUNTER`}
    const pursuitPrompt=this.root.querySelector('[data-pursuit-prompt]');if(pursuitPrompt){
      const foe=this.fighters[1],settings=loadQolSettings(),mode=settings.gameplay?.pursuitPrompts||'full',incoming=foe.pursuitTime>0&&foe.pursuitTarget===player&&player.hp>0&&!player.ringOutFall,danger=incoming,resultVisible=!this.root.querySelector('[data-result]')?.classList.contains('hidden'),activePlay=this.phase==='play'&&!this.paused&&!resultVisible,legalWindow=player.pursuitWindow>0&&player.pursuitTarget?.hp>0&&!player.pursuitTarget?.knockdown&&!player.pursuitTarget?.ringOutFall,activePursuit=activePlay&&(incoming||player.pursuitTime>0||legalWindow||player.pursuitFollowupWindow>0||player.pursuitFinishWindow>0);
      let text=activePlay?pursuitPromptText({mode,incoming,energy:player.en,chasing:player.pursuitTime>0,attackReady:player.pursuitAttackReady,buffered:player.pursuitBuffered,followup:player.pursuitFollowupWindow>0,finisher:player.pursuitFinishWindow>0,window:legalWindow}):'';
      const touchPrompt=this.controls.touchEnabled();if(text){this.pursuitPromptLastText=text;this.pursuitPromptLinger=touchPrompt?PURSUIT_TUNING.promptMobileLinger:0}else if(activePlay&&touchPrompt&&mode!=='off'&&this.pursuitPromptLinger>0)text=this.pursuitPromptLastText;else if(!activePlay||mode==='off'){this.pursuitPromptLinger=0;this.pursuitPromptLastText=''}
      const ready=Boolean(player.pursuitBufferFlash>0||player.pursuitReadyFlash>0||player.pursuitFollowupWindow>0||player.pursuitFinishWindow>0||(incoming&&pursuitTechAvailable(player.en,player.pursuitEscapeCooldown)));
      pursuitPrompt.textContent=text;pursuitPrompt.classList.toggle('show',Boolean(text));pursuitPrompt.classList.toggle('danger',danger);pursuitPrompt.classList.toggle('ready',Boolean(text)&&ready);pursuitPrompt.dataset.phase=incoming?'tech':player.pursuitFinishWindow>0?'finisher':ready?'ready':legalWindow?'window':player.pursuitTime>0?'chase':'';this.root.classList.toggle('pursuit-active',activePursuit);
      const energyTrack=this.root.querySelector('[data-e1]')?.parentElement;energyTrack?.classList.toggle('techReady',incoming&&pursuitTechAvailable(player.en,player.pursuitEscapeCooldown));energyTrack?.classList.toggle('techSpent',player.pursuitTechFlash>0);
    }
    const focusCue=this.root.querySelector('[data-focus-recovery-cue]');if(focusCue){const active=this.phase==='play'&&!this.paused&&(player.focusRecovering||player.focusRecoveryStartup>0);focusCue.classList.toggle('show',active);focusCue.textContent=player.focusRecovering?`FOCUS RECOVERY • +${player.focusRecoveryChannelHealed.toFixed(1)} HP • ${player.recoverableHp.toFixed(1)} GRAY LEFT`:'FOCUS RECOVERY • HOLD STILL'}
    this.updateLensBlindness();
  }

  updateCamera(){
    const[a,b]=this.fighters,c=this.stage.camera,midX=(a.x+b.x)/2,midZ=(a.z+b.z)/2,separation=Math.hypot(a.x-b.x,a.z-b.z),yaw=c.yawDeg*Math.PI/180,pursuitActive=a.pursuitTime>0||b.pursuitTime>0||a.pursuitFollowupWindow>0||b.pursuitFollowupWindow>0||a.pursuitFinishWindow>0||b.pursuitFinishWindow>0;
    const blendStep=STEP/(pursuitActive?PURSUIT_TUNING.cameraEaseIn:PURSUIT_TUNING.cameraEaseOut);this.pursuitCameraBlend=approach(this.pursuitCameraBlend,pursuitActive?1:0,blendStep);
    if(this.pursuitImpactHold>0){this.pursuitImpactHold=Math.max(0,this.pursuitImpactHold-STEP);this.cameraShake*=.86;if(this.cameraShake<.15)this.cameraShake=0;return}
    const focusSpeed=lerp(c.focusSmoothing,Math.min(.18,c.focusSmoothing*1.8),this.pursuitCameraBlend);this.camera.x=lerp(this.camera.x,clamp(midX,-c.focusClampX,c.focusClampX),focusSpeed);this.camera.z=lerp(this.camera.z,clamp(midZ,-c.focusClampZ,c.focusClampZ),focusSpeed);
    const normalDistance=c.baseDistance+separation*c.separationScale,zoomScale=lerp(1,PURSUIT_TUNING.cameraZoomScale,this.pursuitCameraBlend),targetDistance=clamp(normalDistance*zoomScale,c.minDistance,c.maxDistance),zoomSpeed=lerp(c.zoomSmoothing,Math.min(.2,c.zoomSmoothing*2),this.pursuitCameraBlend);this.camera.distance=lerp(this.camera.distance,targetDistance,zoomSpeed);
    const horizontal=this.camera.distance*c.horizontalDistanceScale;this.camera.eye=[this.camera.x+Math.sin(yaw)*horizontal,c.heightBase+this.camera.distance*c.heightDistanceScale,this.camera.z+Math.cos(yaw)*horizontal];this.camera.target=[this.camera.x,c.targetHeight+Math.max(a.y,b.y)*c.jumpTargetScale+18*this.pursuitCameraBlend,this.camera.z];this.cameraShake*=.86;if(this.cameraShake<.15)this.cameraShake=0;
  }
  burst(x,z,color,count,y){for(let index=0;index<count;index++){const angle=Math.random()*Math.PI*2,speed=60+Math.random()*155;this.particles.push({x,z,y,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,vy:20+Math.random()*110,life:.25+Math.random()*.27,maxLife:.52,size:3+Math.random()*7,color})}}
  updateParticles(dt){for(const particle of this.particles){particle.life-=dt;particle.x+=particle.vx*dt;particle.z+=particle.vz*dt;particle.y+=particle.vy*dt;particle.vy-=260*dt}this.particles=this.particles.filter(particle=>particle.life>0)}

  draw(){
    const r=this.renderer,c=this.stage.camera,shake=this.cameraShake,eye=[this.camera.eye[0]+(Math.random()-.5)*shake,this.camera.eye[1]+(Math.random()-.5)*shake*.45,this.camera.eye[2]+(Math.random()-.5)*shake];r.begin({eye,target:this.camera.target,fov:c.fov,clear:c.clear,fogColor:c.fogColor,fogRange:c.fogRange});drawArenaStage(r,this.stage);this.drawStageIdentity(r);this.drawShadows(r);this.drawCombatEffects(r);this.drawSpecials(r);for(const particle of [...this.particles].sort((a,b)=>this.cameraDistance(b)-this.cameraDistance(a)))r.billboard({x:particle.x,y:particle.y,z:particle.z,size:particle.size,color:particle.color,alpha:clamp(particle.life/particle.maxLife,0,1)});const sorted=[...this.fighters].sort((a,b)=>this.cameraDistance(b)-this.cameraDistance(a));this.drawFighterLayer(sorted);
  }
  cameraDistance(object){return Math.hypot(object.x-this.camera.eye[0],(object.y||0)-this.camera.eye[1],object.z-this.camera.eye[2])}

  drawStageIdentity(r){
    const b=this.stage.bounds,pulse=clamp(this.stageBoundaryPulse*2.4,0,1),color=this.stage.id==='tournament'?'#ffd36f':this.stage.id==='resonance-facility'?'#66e6ff':this.stage.id==='echo-caverns'?'#c6a77a':this.stage.id==='echo-mountain'?'#d7ebff':'#e6bc7d',alpha=.12+pulse*.56,y=7;
    if(this.stageProfile?.boundary!=='OPEN'){
      r.segment({x:b.minX,y,z:b.minZ},{x:b.maxX,y,z:b.minZ},{width:5+pulse*5,height:2,color,alpha,lit:false});r.segment({x:b.maxX,y,z:b.minZ},{x:b.maxX,y,z:b.maxZ},{width:5+pulse*5,height:2,color,alpha,lit:false});r.segment({x:b.maxX,y,z:b.maxZ},{x:b.minX,y,z:b.maxZ},{width:5+pulse*5,height:2,color,alpha,lit:false});r.segment({x:b.minX,y,z:b.maxZ},{x:b.minX,y,z:b.minZ},{width:5+pulse*5,height:2,color,alpha,lit:false});
    }else if(this.stage.id==='echo-mountain'){
      r.segment({x:b.minX+120,y:6,z:0},{x:b.maxX-120,y:6,z:0},{width:3,height:1,color:'#d7ebff',alpha:.08,lit:false});
    }
    if(this.stage.id==='tournament'&&this.crowdExcitement>0){const crowdPulse=.08+clamp(this.crowdExcitement/2.2,0,1)*.22;r.disc({x:0,y:5,z:0,rx:(b.maxX-b.minX)*.46,rz:(b.maxZ-b.minZ)*.43,color:'#ffe29a',alpha:crowdPulse})}
  }

  drawShadows(r){for(const fighter of this.fighters){if(fighter.ringOutFall>0)continue;const heightAlpha=clamp(.5-fighter.y/780,.14,.5);r.disc({x:fighter.x,y:5,z:fighter.z,rx:46,rz:31,color:'#000000',alpha:heightAlpha});r.disc({x:fighter.x,y:5.3,z:fighter.z,rx:20,rz:14,color:fighter.accent,alpha:.12})}for(const projectile of this.projectiles)r.disc({x:projectile.x,y:5,z:projectile.z,rx:projectile.radius*.65,rz:projectile.radius*.42,color:projectile.color,alpha:.17})}
  drawCombatEffects(r){
    const[player,foe]=this.fighters;
    if(player&&foe&&this.phase==='play'){const distance=Math.hypot(foe.x-player.x,foe.z-player.z);if(distance<330)r.segment({x:player.x,y:6,z:player.z},{x:foe.x,y:6,z:foe.z},{width:2,height:1,color:'#d8efff',alpha:clamp((330-distance)/330*.14,0,.14),lit:false})}
    for(const fighter of this.fighters){
      if(fighter.moving){
        const speed=clamp(fighter.speedRatio||0,0,1.35),identity=motionIdentity(fighter.id),dashActive=fighter.dashTime>0,length=20+speed*(dashActive?92:48),count=dashActive?Math.max(2,identity.count):speed>.92?2:1;
        if(speed>.48||dashActive)for(let index=0;index<count;index++){const side=(index-(count-1)/2)*(fighter.id==='wade'?7:10),color=index%2&&identity.secondary?identity.secondary:identity.trail||fighter.accent;r.segment({x:fighter.x-fighter.moveZ*side,y:7+fighter.y*.05,z:fighter.z+fighter.moveX*side},{x:fighter.x-fighter.moveX*length-fighter.moveZ*side,y:7+fighter.y*.05,z:fighter.z-fighter.moveZ*length+fighter.moveX*side},{width:(dashActive?7:3+speed*4)*identity.width,height:fighter.id==='bark'?4:2,color,alpha:dashActive?.46:.11+speed*.13,lit:false})}
        if(fighter.id==='rrvvfo'&&dashActive)r.billboard({x:fighter.x-fighter.moveX*36,y:20+fighter.y,z:fighter.z-fighter.moveZ*36,size:24,color:'#ff9b42',alpha:.34});
        if(fighter.id==='bark'&&(dashActive||fighter.dashArmor>0)){r.disc({x:fighter.x-fighter.moveX*18,y:6,z:fighter.z-fighter.moveZ*18,rx:29,rz:18,color:'#b88a55',alpha:.24});r.billboard({x:fighter.x,y:68+fighter.y,z:fighter.z,size:126,color:'#e1bc78',alpha:.10})}
        if(fighter.id==='wade'&&dashActive)r.billboard({x:fighter.x-fighter.moveX*52,y:64+fighter.y,z:fighter.z-fighter.moveZ*52,size:80,color:'#8fefff',alpha:.17});
      }
      if(fighter.hurtIdentityFlash>0){const identity=motionIdentity(fighter.id),alpha=clamp(fighter.hurtIdentityFlash/.18,0,1);r.billboard({x:fighter.x,y:70+fighter.y,z:fighter.z,size:128,color:identity.secondary||identity.trail||fighter.accent,alpha:.16*alpha})}
      if(fighter.landingImpact>0){const alpha=clamp(fighter.landingImpact/.16,0,1),identity=motionIdentity(fighter.id);r.disc({x:fighter.x,y:6,z:fighter.z,rx:fighter.id==='bark'?52:34,rz:fighter.id==='bark'?34:22,color:identity.trail||fighter.accent,alpha:.20*alpha})}
      if(fighter.victoryPoseTime>0){const identity=motionIdentity(fighter.id),pulse=1+Math.sin(performance.now()/90)*.08;r.disc({x:fighter.x,y:7,z:fighter.z,rx:58*pulse,rz:38*pulse,color:identity.trail||fighter.accent,alpha:.24});r.billboard({x:fighter.x,y:86+fighter.y,z:fighter.z,size:146*pulse,color:identity.secondary||fighter.accent,alpha:.13})}
      if(fighter.pursuitTime>0){
        const target=fighter.pursuitTarget,identity=motionIdentity(fighter.id),trailColor=identity.trail||fighter.accent,progress=fighter.pursuitTotalTime>0?1-fighter.pursuitTime/fighter.pursuitTotalTime:0,pulse=.70+Math.sin(performance.now()/36)*.16;
        for(let lane=-1;lane<=1;lane++){const side=lane*(fighter.id==='wade'?8:12),length=86+progress*68;r.segment({x:fighter.x-fighter.aimZ*side,y:48+fighter.y,z:fighter.z+fighter.aimX*side},{x:fighter.x-fighter.aimX*length-fighter.aimZ*side,y:45+fighter.y,z:fighter.z-fighter.aimZ*length+fighter.aimX*side},{width:(lane===0?13:6)*identity.width,height:lane===0?6:3,color:lane===0?trailColor:(identity.secondary||trailColor),alpha:(lane===0?.64:.40)*pulse,lit:false})}
        for(let echo=1;echo<=2;echo++)r.billboard({x:fighter.x-fighter.aimX*(30+echo*28),y:62+fighter.y,z:fighter.z-fighter.aimZ*(30+echo*28),size:70-echo*12,color:echo===1?trailColor:(identity.secondary||trailColor),alpha:.13});
        if(target)r.segment({x:fighter.x,y:54+fighter.y,z:fighter.z},{x:target.x,y:54+(target.y||0),z:target.z},{width:5,height:3,color:trailColor,alpha:.26,lit:false});
      }
      if(fighter.pursuitLockOn>0&&fighter.pursuitTarget){
        const target=fighter.pursuitTarget,pulse=1+Math.sin(performance.now()/42)*.12,color=dashIdentityFor(fighter.id).secondary||'#ffffff';r.disc({x:target.x,y:8,z:target.z,rx:54*pulse,rz:38*pulse,color,alpha:.20});
        r.segment({x:target.x-48,y:72+target.y,z:target.z},{x:target.x-22,y:72+target.y,z:target.z},{width:4,height:3,color,alpha:.78,lit:false});r.segment({x:target.x+22,y:72+target.y,z:target.z},{x:target.x+48,y:72+target.y,z:target.z},{width:4,height:3,color,alpha:.78,lit:false});
      }
      if(fighter.pursuitTechFlash>0){const alpha=clamp(fighter.pursuitTechFlash/.28,0,1);r.billboard({x:fighter.x,y:68+fighter.y,z:fighter.z,size:150,color:'#dffcff',alpha:.18*alpha});r.segment({x:fighter.x-70,y:62+fighter.y,z:fighter.z},{x:fighter.x+70,y:62+fighter.y,z:fighter.z},{width:7,height:4,color:'#dffcff',alpha:.55*alpha,lit:false})}
      if(fighter.attackState){const state=fighter.attackState,def=state.def,active=state.elapsed>=def.activeStart&&state.elapsed<=def.activeEnd,pulse=active?1:clamp(1-Math.abs(state.elapsed-def.activeStart)/.15,0,.5),start={x:fighter.x,y:68+fighter.y,z:fighter.z},end={x:fighter.x+state.aimX*(def.range*.78),y:68+fighter.y,z:fighter.z+state.aimZ*(def.range*.78)};r.segment(start,end,{width:8+18*pulse,height:6,color:fighter.accent,alpha:.25+.55*pulse,lit:false});if(active)r.disc({x:end.x,y:8,z:end.z,rx:def.width*.42,rz:def.width*.26,color:fighter.accent,alpha:.08})}
      if(fighter.block)r.billboard({x:fighter.x,y:52+fighter.y,z:fighter.z,size:118,color:fighter.blockAge<=PERFECT_BLOCK_WINDOW?'#fff2a3':'#8cecff',alpha:fighter.blockAge<=PERFECT_BLOCK_WINDOW?.28:.18});
      if(fighter.guardBreak>0)r.billboard({x:fighter.x,y:72+fighter.y,z:fighter.z,size:145,color:'#ffd86b',alpha:.2});
      if(fighter.wallSplat>0){r.billboard({x:fighter.x,y:74+fighter.y,z:fighter.z,size:154,color:'#fff0ba',alpha:.22});r.segment({x:fighter.x-28,y:32+fighter.y,z:fighter.z},{x:fighter.x+28,y:118+fighter.y,z:fighter.z},{width:9,height:5,color:'#fff0ba',alpha:.55,lit:false})}
      if(fighter.groundBouncePending>0)r.disc({x:fighter.x,y:7,z:fighter.z,rx:54,rz:38,color:'#ffd98a',alpha:.22});
      if(fighter.momentum>=100){const pulse=1+Math.sin(performance.now()/85)*.08;r.disc({x:fighter.x,y:7,z:fighter.z,rx:61*pulse,rz:41*pulse,color:'#ffd45b',alpha:.22});r.billboard({x:fighter.x,y:72+fighter.y,z:fighter.z,size:142*pulse,color:'#ffd45b',alpha:.11})}
      if(fighter.edgePressureHits>0&&this.isNearRingEdge(fighter,95))for(let pip=0;pip<fighter.edgePressureHits;pip++)r.billboard({x:fighter.x+(pip-1)*18,y:168+fighter.y,z:fighter.z,size:16,color:'#ffdf83',alpha:.8});
    }
  }
  drawSpecials(r){
    const owner=this.fighters[0],ownerFrame=frameFor(owner);
    for(const fighter of this.fighters){if(fighter.focusRecovering||fighter.focusRecoveryStartup>0){const ratio=clamp(fighter.focusRecoveryStartup/FOCUS_RECOVERY_RULES.startup,0,1),pulse=1+Math.sin(performance.now()/70)*.09;r.disc({x:fighter.x,y:7,z:fighter.z,rx:(36+ratio*18)*pulse,rz:(24+ratio*12)*pulse,color:fighter.accent,alpha:.2+.1*ratio});r.billboard({x:fighter.x,y:68+fighter.y,z:fighter.z,size:(95+ratio*35)*pulse,color:'#b7ffe8',alpha:.09+.09*ratio})}if(fighter.charging){const pulse=1+Math.sin(performance.now()/80)*.12;r.disc({x:fighter.x,y:7,z:fighter.z,rx:50*pulse,rz:34*pulse,color:fighter.accent,alpha:.28});r.billboard({x:fighter.x,y:65+fighter.y,z:fighter.z,size:115*pulse,color:fighter.accent,alpha:.12})}if(fighter.armorDurability>0)r.billboard({x:fighter.x,y:64+fighter.y,z:fighter.z,size:136,color:'#c8a06a',alpha:.18})}
    for(const clone of this.agonyClones){const alpha=clamp(clone.life/.45,0,.62),cloneColor=clone.color||'#6ebcff';if(ownerFrame&&owner.asset)r.sprite({x:clone.x,y:-13,z:clone.z,width:172,height:172,texture:owner.asset.texture,source:ownerFrame.source,atlasWidth:ownerFrame.atlas.width,atlasHeight:ownerFrame.atlas.height,flipX:false,color:cloneColor,alpha});else r.billboard({x:clone.x,y:62,z:clone.z,size:94,color:cloneColor,alpha:.34});r.disc({x:clone.x,y:5,z:clone.z,rx:32,rz:22,color:cloneColor,alpha:.24})}
    for(const zone of this.thunderZones){const pulse=1+Math.sin(performance.now()/70)*.12;r.disc({x:zone.x,y:5,z:zone.z,rx:zone.radius*pulse,rz:zone.radius*pulse,color:zone.struck?'#ffffff':zone.color,alpha:zone.struck?.24:.18});if(zone.struck)r.segment({x:zone.x,y:8,z:zone.z},{x:zone.x,y:220,z:zone.z},{width:16,height:10,color:zone.color,alpha:.78,lit:false})}
    for(const quake of this.quakes)r.disc({x:quake.x,y:6,z:quake.z,rx:quake.radius,rz:quake.radius,color:quake.color,alpha:.12});
    for(const wall of this.earthWalls)r.box({x:wall.x,y:56,z:wall.z,sx:118,sy:112,sz:28,rotationY:wall.rotation,color:wall.color,alpha:clamp(wall.hp/55,.35,1)});
    for(const projectile of this.projectiles){const size=projectile.ultimate?118:projectile.physical?70:projectile.volley?38:52;r.segment({x:projectile.trailX,y:projectile.trailY,z:projectile.trailZ},{x:projectile.x,y:projectile.y,z:projectile.z},{width:projectile.ultimate?28:projectile.physical?14:10,height:projectile.ultimate?18:6,color:projectile.color,alpha:projectile.ultimate?.72:.5,lit:false});r.billboard({x:projectile.x,y:projectile.y,z:projectile.z,size,color:projectile.color,alpha:.92})}
    if(owner.lens>0){const pulse=1+Math.sin(performance.now()/90)*.09;r.billboard({x:owner.x,y:72+owner.y,z:owner.z,size:150*pulse,color:'#d8fbff',alpha:.13});r.disc({x:owner.x,y:7,z:owner.z,rx:58*pulse,rz:39*pulse,color:'#8beeff',alpha:.22})}
  }

  clearFighterLayer(){
    const context=this.fighterContext;
    if(context)context.clearRect(0,0,this.fighterCanvas.width,this.fighterCanvas.height);
  }

  fighterScreenRect(fighter,frame=null){
    const source=frame?.source||[0,0,192,192],sourceWidth=source[2]||192,sourceHeight=source[3]||192;
    const ground=this.renderer.project(fighter.x,fighter.y,fighter.z);
    const top=this.renderer.project(fighter.x,fighter.y+190,fighter.z);
    const center=this.renderer.project(fighter.x,fighter.y+95,fighter.z);
    const height=clamp(Math.abs(ground.y-top.y)*(Number(fighter.visualScale)||1),72,265);
    const width=height*(sourceWidth/sourceHeight);
    const pivotY=frame?.frame?.groundPivot?.[1]??178;
    return{x:center.x-width/2,y:ground.y-height*(pivotY/sourceHeight),width,height,visible:ground.visible&&top.visible};
  }

  drawFighterLayer(fighters){
    const context=this.fighterContext;
    if(!context)return;
    context.clearRect(0,0,this.fighterCanvas.width,this.fighterCanvas.height);
    for(const fighter of fighters)this.drawFighterSprite2D(context,fighter);
  }

  drawFighterSprite2D(context,fighter){
    const frame=frameFor(fighter),rect=this.fighterScreenRect(fighter,frame);
    if(!rect.visible||rect.x>W+rect.width||rect.x+rect.width<0||rect.y>H+rect.height||rect.y+rect.height<0)return;
    const alpha=fighter.hp<=0?.72:1;
    context.save();
    context.imageSmoothingEnabled=fighter.asset?.manifest?.defaults?.pixelSmoothing!==false;
    context.globalAlpha=alpha;
    context.shadowColor=fighter.flash>0?'rgba(255,105,105,.95)':fighter.accent;
    context.shadowBlur=fighter.flash>0?18:5;
    if(frame&&fighter.asset?.image?.complete&&fighter.asset.image.naturalWidth){
      const [sx,sy,sw,sh]=frame.source;
      if(this.flipFor(fighter)){
        context.translate(rect.x+rect.width,0);
        context.scale(-1,1);
        context.drawImage(fighter.asset.image,sx,sy,sw,sh,0,rect.y,rect.width,rect.height);
      }else context.drawImage(fighter.asset.image,sx,sy,sw,sh,rect.x,rect.y,rect.width,rect.height);
    }else this.drawFallback2D(context,fighter,rect);
    context.restore();
  }

  drawFallback2D(context,fighter,rect){
    const body=fighter.id==='rrvvfo'?'#be2026':'#332044',hair=fighter.id==='rrvvfo'?'#9a6a45':'#d32f45',skin='#9a5b3d';
    const cx=rect.x+rect.width/2,scale=rect.height/190;
    context.fillStyle='rgba(0,0,0,.34)';context.beginPath();context.ellipse(cx,rect.y+rect.height-3,35*scale,10*scale,0,0,Math.PI*2);context.fill();
    context.fillStyle=body;context.fillRect(cx-24*scale,rect.y+70*scale,48*scale,82*scale);
    context.fillStyle=skin;context.beginPath();context.arc(cx,rect.y+50*scale,20*scale,0,Math.PI*2);context.fill();
    context.fillStyle=hair;context.fillRect(cx-24*scale,rect.y+21*scale,48*scale,24*scale);
    context.fillStyle='#fff';context.font=`900 ${Math.max(8,11*scale)}px Inter,Arial,sans-serif`;context.textAlign='center';context.fillText(fighter.name.toUpperCase(),cx,rect.y+8*scale);
  }

  drawFighter(r,fighter){const frame=frameFor(fighter),tint=fighter.flash>0?'#ffb3b3':'#ffffff';if(frame&&r.sprite({x:fighter.x,y:fighter.y-13,z:fighter.z,width:190,height:190,texture:fighter.asset.texture,source:frame.source,atlasWidth:frame.atlas.width,atlasHeight:frame.atlas.height,flipX:this.flipFor(fighter),color:tint,alpha:fighter.hp<=0?.72:1}))return;this.drawFallback(r,fighter)}
  flipFor(fighter){const foe=this.fighters.find(candidate=>candidate!==fighter);if(!foe)return false;const self=this.renderer.project(fighter.x,80+fighter.y,fighter.z),other=this.renderer.project(foe.x,80+foe.y,foe.z);return other.x<self.x}
  drawFallback(r,fighter){const foe=this.fighters.find(candidate=>candidate!==fighter),angle=foe?Math.atan2(foe.x-fighter.x,foe.z-fighter.z):0,skin='#9a5b3d',body=fighter.id==='rrvvfo'?'#be2026':'#21152d',hair=fighter.id==='rrvvfo'?'#9a6a45':'#d32f45';r.box({x:fighter.x,y:60+fighter.y,z:fighter.z,sx:48,sy:82,sz:30,rotationY:angle,color:body});r.box({x:fighter.x,y:122+fighter.y,z:fighter.z,sx:39,sy:39,sz:36,rotationY:angle,color:skin});r.box({x:fighter.x,y:148+fighter.y,z:fighter.z-2,sx:46,sy:24,sz:43,rotationY:angle,color:hair});const arm=10+Math.sin(fighter.animationClock/90)*7;r.box({x:fighter.x+Math.cos(angle)*arm,y:74+fighter.y,z:fighter.z-Math.sin(angle)*arm,sx:15,sy:62,sz:15,rotationY:angle,color:skin})}
}

let instance=null;
export function resetArenaBattleInstance(){if(instance)instance.stopMatch();instance=null}
export function startArenaTraining(){try{if(!instance)instance=new ArenaBattle('dojo');instance.configureMatch({mode:'training',fighters:['rrvvfo','revvfo'],stageId:'dojo',koTarget:3});instance.trainingDummy='stand';instance.start()}catch(error){console.error('[Arena Training]',error);alert(`Arena Training could not start: ${error.message}`)}}

export function startConfiguredArenaBattle(config={}){try{if(!instance)instance=new ArenaBattle(config.stageId||'dojo');instance.configureMatch(config);instance.start();return instance}catch(error){console.error('[Arena Configured Battle]',error);alert(`Arena Battle could not start: ${error.message}`);return null}}

export function startArenaBattle(stageId=null){try{if(!instance)instance=new ArenaBattle(stageId||'dojo');instance.configureMatch({mode:'cpu',fighters:['rrvvfo','revvfo'],stageId:stageId||'dojo',difficulty:instance.readDifficulty(),koTarget:KO_TARGET});if(stageId)instance.start();else instance.showStageSelect()}catch(error){console.error('[Arena 2.9A.31]',error);alert(`Arena Battle could not start: ${error.message}`)}}
export{ArenaBattle,ArenaFighter,ATTACKS,animationName,frameFor};
