import {aimVector,blockFacesAttacker,clamp,hitVolumeConnects,lerp,normalizeMovement,projectileConnects,rotateToward} from './arena-math.js';
import {clampToStage,getArenaStage,listArenaStages,outsideStageProjectileBounds,stageWallAvoidance} from './arena-stages.js?v=25c-training-field';
import {drawArenaStage} from './arena-stage-renderer.js';
import {WebGLArenaRenderer} from './webgl-renderer.js';
import {ArenaControlManager} from './arena-controls.js?v=25b-battle-movement';

const ID='arenaModeScreen';
const W=960;
const H=540;
const STEP=1/60;
const PERFECT_BLOCK_WINDOW=.10;
const RUN_BUILD_TIME=.19;
const DASH_CANCEL_TIME=.08;
const FIGHTER_RENDER_SCALE=2;

const MOVEMENT_PROFILES=Object.freeze({
  rrvvfo:Object.freeze({walkSpeed:142,runSpeed:276,airSpeed:196,accel:1140,runAccel:1540,brake:1840,airAccel:620,airBrake:105,dashSpeed:610}),
  revvfo:Object.freeze({walkSpeed:136,runSpeed:258,airSpeed:184,accel:1080,runAccel:1460,brake:1780,airAccel:590,airBrake:100,dashSpeed:590}),
  default:Object.freeze({walkSpeed:138,runSpeed:264,airSpeed:190,accel:1110,runAccel:1500,brake:1810,airAccel:605,airBrake:102,dashSpeed:600})
});

function movementProfile(fighter){return MOVEMENT_PROFILES[fighter.id]||MOVEMENT_PROFILES.default}
function approach(current,target,amount){return current<target?Math.min(target,current+amount):Math.max(target,current-amount)}

const ATTACKS=Object.freeze({
  light1:{kind:'light1',duration:.34,activeStart:.075,activeEnd:.155,range:92,width:38,height:76,damage:5,guardDamage:7,knockback:22,stun:.20,hitstop:4,lunge:24,animation:'light1',chain:true},
  light2:{kind:'light2',duration:.36,activeStart:.080,activeEnd:.170,range:98,width:42,height:78,damage:5.5,guardDamage:8,knockback:27,stun:.22,hitstop:4,lunge:27,animation:'light2',chain:true},
  light3:{kind:'light3',duration:.43,activeStart:.095,activeEnd:.205,range:106,width:48,height:82,damage:8,guardDamage:11,knockback:62,stun:.29,hitstop:6,lunge:31,animation:'light3',finisher:true},
  heavy:{kind:'heavy',duration:.64,activeStart:.205,activeEnd:.345,range:122,width:63,height:92,damage:13,guardDamage:20,knockback:98,stun:.38,hitstop:8,lunge:38,animation:'heavy',knockdown:true},
  launcher:{kind:'launcher',duration:.57,activeStart:.175,activeEnd:.295,range:98,width:49,height:106,damage:10,guardDamage:15,knockback:28,stun:.31,hitstop:10,lunge:29,animation:'launcher',launch:430},
  airLight:{kind:'airLight',duration:.38,activeStart:.075,activeEnd:.185,range:91,width:47,height:86,damage:6,guardDamage:7,knockback:30,stun:.22,hitstop:5,lunge:16,animation:'airLight',air:true},
  airHeavy:{kind:'airHeavy',duration:.54,activeStart:.145,activeEnd:.295,range:116,width:58,height:100,damage:11,guardDamage:15,knockback:72,stun:.36,hitstop:8,lunge:22,animation:'airHeavy',air:true,knockdown:true,spike:260}
});

const ARENA_ABILITIES=Object.freeze([
  {id:'fireBlast',label:'Fire Blast',icon:'🔥',cost:28,cooldown:1.4},
  {id:'shotsOfAgony',label:'Shots of Agony',icon:'✦',cost:40,cooldown:5},
  {id:'objectSwap',label:'Object Swap',icon:'↔',cost:20,cooldown:2.5},
  {id:'lensOfTruth',label:'Lens of Truth',icon:'◉',cost:90,cooldown:5,hp:50},
  {id:'ultimate',label:'Solar Weave',icon:'☀',cost:90,cooldown:8,ultimate:true}
]);

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
#${ID} .track{height:17px;margin-top:6px;background:#080a12;border:2px solid #ffffffb8;transform:skewX(-10deg);overflow:hidden}#${ID} .fill{height:100%;background:linear-gradient(90deg,#ff3b30,#ff9f0a);transition:width .08s}#${ID} .r .fill{background:linear-gradient(90deg,#af52de,#5e5ce6)}#${ID}.sageOpponent .r .fill{background:linear-gradient(90deg,#cfd6df,#ffffff 55%,#e9edf2);box-shadow:inset 0 0 7px #ffffffcc}
#${ID} .resourceLine{display:flex;justify-content:space-between;gap:8px;margin-top:4px;color:#bfefff;font-size:9px;font-weight:900;letter-spacing:.07em}#${ID} .resourceTrack{height:7px;margin-top:1px;background:#060913;border:1px solid #ffffff7a;transform:skewX(-10deg);overflow:hidden}#${ID} .energyFill{height:100%;background:linear-gradient(90deg,#1aa7ff,#7df4ff);transition:width .08s}#${ID} .r .energyFill{background:linear-gradient(90deg,#7e5cff,#d96bff)}#${ID} .guardFill{height:100%;background:linear-gradient(90deg,#55d68b,#d7ff83);transition:width .08s}#${ID} .guardFill.low{background:linear-gradient(90deg,#ff3d54,#ffb14d)}
#${ID} .clock{text-align:center;background:#080a12d9;border:1px solid #ffffff38;border-radius:11px;padding:6px 15px}#${ID} .clock b{display:block;font-size:29px;line-height:1}#${ID} .clock small{font-weight:900;color:#d9ccff;letter-spacing:.1em}
#${ID} .badge{position:absolute;z-index:20;top:110px;right:16px;background:#080a12df;border:1px solid #ffffff30;border-radius:10px;padding:7px 11px;font-size:11px;font-weight:900;color:#e9cfff;text-align:right;line-height:1.35}#${ID} .badge strong{display:block;color:#78f3ff;letter-spacing:.08em}
#${ID} .banner{position:absolute;z-index:30;left:50%;top:45%;transform:translate(-50%,-50%);font-size:68px;font-weight:1000;font-style:italic;text-shadow:0 5px #180d25,0 0 28px #e46bff;pointer-events:none}#${ID} .banner.hidden{display:none}
#${ID} .comboCallout{position:absolute;z-index:30;left:5%;top:32%;font-size:26px;font-weight:1000;font-style:italic;text-shadow:0 3px #180d25,0 0 16px #ff7138;opacity:0;transform:translateY(10px);transition:opacity .1s,transform .1s;pointer-events:none}#${ID} .comboCallout.show{opacity:1;transform:none}#${ID} .comboCallout small{display:block;font-size:11px;color:#ffd6bd;letter-spacing:.08em}
#${ID} .lensBlindness{position:absolute;z-index:10;inset:0;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.96);opacity:0;visibility:hidden;pointer-events:none;text-align:center;transition:opacity .08s linear,visibility 0s linear .08s}#${ID} .lensBlindness.active{opacity:1;visibility:visible;transition-delay:0s}#${ID} .lensBlindness.reduced{background:rgba(0,0,0,.72)}#${ID} .lensBlindness strong{display:block;color:#f7f7ff;font-size:30px;font-weight:1000;letter-spacing:.08em;text-shadow:0 0 18px #98eaff88}#${ID} .lensBlindness span{display:block;margin-top:8px;color:#cfd6ff;font-size:16px;font-weight:900;letter-spacing:.05em}#${ID} .lensBlindness small{display:block;margin-top:10px;color:#8fefff;font-size:13px;font-weight:1000}#${ID} .lensBlindness.ending strong{animation:lensWarningPulse .34s steps(2,end) infinite}@keyframes lensWarningPulse{50%{opacity:.48}}
#${ID} .impactFlash{position:absolute;z-index:30;inset:0;pointer-events:none;background:#fff;opacity:0;mix-blend-mode:screen;transition:opacity .09s}
#${ID} .bottom{position:absolute;z-index:40;left:12px;right:12px;bottom:104px;display:flex;justify-content:space-between;align-items:end;gap:12px}
#${ID} .arenaHotbar{position:absolute;z-index:50;left:50%;bottom:10px;width:min(760px,74vw);transform:translateX(-50%);color:#fff}#${ID} .arenaSlots{display:grid;grid-template-columns:repeat(5,minmax(78px,1fr));gap:6px}
#${ID} .arenaAbility{position:relative;isolation:isolate;height:82px;min-width:0;overflow:hidden;padding:5px 5px 4px;border:2px solid #586683;border-radius:9px;background:linear-gradient(160deg,#1c2639eb,#090c16f3 72%);box-shadow:0 5px 16px #000a,inset 0 0 10px #ffffff12;color:#fff;text-align:center;touch-action:manipulation}#${ID} .arenaAbility:after{content:'';position:absolute;inset:0;z-index:-2;background:linear-gradient(130deg,#fa4a2515,#5acfff12)}#${ID} .arenaCooldown{position:absolute;z-index:-1;left:0;right:0;bottom:0;height:var(--cooldown-fill,0%);background:#05070bdc;border-top:1px solid #ffffff45;transition:height .1s linear}#${ID} .arenaNumber{position:absolute;left:4px;top:3px;min-width:20px;padding:2px 4px;border:1px solid #ffffff5c;border-radius:4px;background:#05070ce8;font-size:9px;font-weight:1000}#${ID} .arenaIcon{display:block;margin-top:3px;font-size:24px;line-height:25px;filter:drop-shadow(0 2px 4px #000)}#${ID} .arenaAbilityName{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;font-weight:900}#${ID} .arenaCost{display:block;color:#8ddfff;font-size:8px;font-weight:800}#${ID} .arenaState{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ffe5a1;font-size:8px;font-weight:1000}#${ID} .arenaAbility.unavailable{border-style:dashed;filter:saturate(.4);opacity:.72}#${ID} .arenaAbility.selected{border-color:#fff;box-shadow:0 0 0 2px #78f3ff,0 0 18px #78f3ffaa}#${ID} .arenaAbility.active{border-color:#75efff;box-shadow:0 0 17px #41dfff99,inset 0 0 12px #75efff30}#${ID} .arenaAbility.ultimate{border-color:#ffb45f;background:linear-gradient(160deg,#532d16ed,#120b08f4 72%)}
#${ID} .arenaNotice{position:absolute;z-index:60;left:50%;bottom:104px;transform:translateX(-50%);padding:7px 13px;border:1px solid #ffffff38;border-radius:9px;background:#080a12ed;color:#fff;font-size:11px;font-weight:1000;letter-spacing:.06em;opacity:0;transition:opacity .12s;pointer-events:none}#${ID} .arenaNotice.show{opacity:1}
#${ID} .help span{display:inline-block;padding:1px 4px;border:1px solid #ffffff38;border-radius:4px;background:#111a2c;color:#fff;font-size:.9em;font-weight:900}#${ID} .help{background:#080a12de;border:1px solid #ffffff2c;border-radius:9px;padding:8px 10px;font-size:11px;line-height:1.45}#${ID} .help b{color:#78f3ff}#${ID} button{border:1px solid #ffffff38;border-radius:9px;background:#252b40;color:#fff;padding:10px 14px;font-weight:900;cursor:pointer}#${ID} button.primary{background:linear-gradient(135deg,#9830ff,#e73b90)}
#${ID} .result{position:absolute;z-index:8;left:50%;top:50%;transform:translate(-50%,-50%);width:min(88vw,500px);background:#080a12f2;border:1px solid #ffffff3b;border-radius:17px;padding:25px;text-align:center;box-shadow:0 24px 80px #000}#${ID} .result.hidden{display:none}#${ID} .result h2{font-size:36px;margin:4px}#${ID} .actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:17px}#${ID}.paused:after{content:'PAUSED';position:absolute;z-index:7;inset:0;display:grid;place-items:center;background:#0008;font-size:64px;font-weight:1000}
#${ID} .desktopUtility{display:flex;gap:8px;align-items:center}
#${ID} .controlButton{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;padding:8px 12px;background:#10182bed;border-color:#78f3ff55}
#${ID} .arenaTouchControls{display:none;position:absolute;z-index:6;inset:0;pointer-events:none;opacity:var(--arena-control-opacity,.88);user-select:none;-webkit-user-select:none}
#${ID} .arenaMovePad{position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));width:132px;height:132px;border:2px solid #c8f7ff7a;border-radius:50%;background:radial-gradient(circle,#76e9ff1a 0 34%,#08101dd9 36% 68%,#32466b99 70%);box-shadow:0 10px 28px #000a,inset 0 0 18px #6be8ff24;pointer-events:auto;touch-action:none}
#${ID} .arenaMovePad:before,#${ID} .arenaMovePad:after{content:'';position:absolute;background:#d8fbff2e;pointer-events:none}#${ID} .arenaMovePad:before{left:50%;top:12%;bottom:12%;width:2px}#${ID} .arenaMovePad:after{top:50%;left:12%;right:12%;height:2px}
#${ID} .arenaMoveKnob{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e9feff,#58d8ff 36%,#3154b2 72%);border:2px solid #fff9;box-shadow:0 5px 14px #000b,0 0 16px #66e8ff88;will-change:transform;pointer-events:none}
#${ID} .arenaActionCluster{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom));width:196px;height:156px;pointer-events:none}
#${ID} .arenaTouchButton{position:absolute;width:64px;height:64px;padding:0;border-radius:50%;border:2px solid #ffffff9c;background:linear-gradient(145deg,#34476fe8,#11182aec);box-shadow:0 7px 18px #000c,inset 0 0 14px #ffffff14;color:#fff;font-size:10px;font-weight:1000;letter-spacing:.03em;pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent}
#${ID} .arenaTouchButton strong{display:block;font-size:17px;line-height:19px}#${ID} .arenaTouchButton.pressed{transform:scale(.9);filter:brightness(1.35);box-shadow:0 2px 7px #000d,inset 0 0 18px #8bf4ff66}
#${ID} .arenaTouchButton.light{right:0;bottom:46px;background:linear-gradient(145deg,#2b79e8ee,#12214aec)}#${ID} .arenaTouchButton.heavy{right:58px;bottom:88px;background:linear-gradient(145deg,#d13b62ee,#54162dec)}#${ID} .arenaTouchButton.jump{right:58px;bottom:2px;background:linear-gradient(145deg,#42b875ee,#123f2aec)}#${ID} .arenaTouchButton.dash{right:116px;bottom:46px;background:linear-gradient(145deg,#b066e8ee,#3e185aec)}
#${ID} .arenaTouchButton.launcher{right:130px;bottom:112px;width:52px;height:52px;background:linear-gradient(145deg,#e19630ee,#563310ec)}#${ID} .arenaTouchButton.block{right:130px;bottom:0;width:58px;height:58px;background:linear-gradient(145deg,#627085ee,#1a2432ec)}
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

#${ID} .arenaStageSelect{position:absolute;z-index:100;inset:0;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 20%,#432451,#110b19 58%,#05070d 100%)}#${ID} .arenaStageSelect.hidden{display:none}#${ID} .arenaStageCard{width:min(920px,94vw);max-height:92vh;overflow:auto;padding:24px;border:1px solid #ffffff32;border-radius:20px;background:#0a0d17f2;box-shadow:0 30px 100px #000c}#${ID} .arenaStageCard header{text-align:center}#${ID} .arenaStageCard header small{color:#78f3ff;font-weight:1000;letter-spacing:.13em}#${ID} .arenaStageCard h2{margin:4px 0 8px;font-size:36px}#${ID} .arenaStageCard header p{margin:0 auto 20px;max-width:650px;color:#c9c5da}#${ID} .arenaStageGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}#${ID} .arenaStageOption{min-height:190px;padding:16px;text-align:left;border:2px solid #ffffff2c;background:linear-gradient(155deg,#28203d,#101321 72%);transition:transform .12s,border-color .12s,box-shadow .12s}#${ID} .arenaStageOption:hover:not(:disabled),#${ID} .arenaStageOption:focus-visible:not(:disabled){transform:translateY(-3px);border-color:#78f3ff;box-shadow:0 0 0 2px #78f3ff44,0 14px 30px #0008}#${ID} .arenaStageOption strong{display:block;font-size:20px}#${ID} .arenaStageOption span{display:block;margin-top:6px;color:#d9ccff;font-size:12px}#${ID} .arenaStageOption em{display:inline-block;margin-top:28px;padding:4px 7px;border-radius:999px;background:#1b8d6b;color:#eafff8;font-size:10px;font-style:normal;letter-spacing:.08em}#${ID} .arenaStageOption.tournament{background:linear-gradient(155deg,#53303f,#20152e 72%)}#${ID} .arenaStageOption:disabled{cursor:not-allowed;opacity:.5;filter:grayscale(.5)}#${ID} .arenaStageOption:disabled em{background:#514a5d}#${ID} .arenaStageBack{display:block;margin:18px auto 0}

@media(max-width:760px){#${ID} .arenaStageGrid{grid-template-columns:1fr}#${ID} .arenaStageOption{min-height:130px}#${ID} .arenaControlGrid{grid-template-columns:1fr}#${ID} .arenaControlCard{padding:15px}#${ID} .arenaControlCard h2{font-size:23px}}
@media(orientation:portrait) and (pointer:coarse){#${ID}.arena-touch-active .rotateHint{display:grid}}
@media(max-width:700px){#${ID} .arenaHotbar{width:min(94vw,620px);bottom:5px}#${ID} .arenaSlots{gap:3px}#${ID} .arenaAbility{height:66px;padding:3px}#${ID} .arenaIcon{font-size:18px;line-height:19px}#${ID} .arenaAbilityName{font-size:8px}#${ID} .arenaCost,#${ID} .arenaState{font-size:7px}#${ID} .bottom{bottom:77px}#${ID} .arenaNotice{bottom:77px}#${ID} .top{inset:7px 7px auto;gap:7px}#${ID} .name{font-size:10px!important}#${ID} .track{height:12px!important}#${ID} .clock{padding:4px 7px!important}#${ID} .clock b{font-size:21px!important}#${ID} .help{font-size:8px}#${ID} .badge{display:none}#${ID} .banner{font-size:45px}#${ID} .comboCallout{font-size:20px;top:27%}}
`;
  document.head.appendChild(style);
  root=document.createElement('section');
  root.id=ID;
  root.className='hidden';
  root.innerHTML=`
<canvas data-world-layer width="${W}" height="${H}" aria-label="WebGL perspective arena"></canvas>
<canvas data-fighter-layer width="${W*FIGHTER_RENDER_SCALE}" height="${H*FIGHTER_RENDER_SCALE}" aria-hidden="true"></canvas>

<div class="arenaStageSelect hidden" data-arena-stage-select role="dialog" aria-modal="true" aria-label="Arena select"><div class="arenaStageCard">
  <header><small>PROTOTYPE 2.5C</small><h2>SELECT ARENA</h2><p>Choose a stage built through the reusable WebGL arena pipeline. Combat rules remain identical between stages.</p></header>
  <div class="arenaStageGrid" data-arena-stage-grid></div>
  <button class="arenaStageBack" data-stage-back>BACK TO MAIN MENU</button>
</div></div>
<div class="lensBlindness" data-lens-blindness aria-hidden="true"><div><strong>LENS OF TRUTH</strong><span data-lens-status>VISION LOST • AUTO-DODGE ACTIVE</span><small data-lens-time>4s</small></div></div>
<div class="impactFlash" data-impact-flash></div><div class="comboCallout" data-combo></div>
<div class="top">
  <div class="side"><div class="name"><span data-fighter-name1>RRVVFO</span><span data-s1>0</span></div><div class="track"><div class="fill" data-h1></div></div><div class="resourceLine"><span>ENERGY</span><span data-energy-text>100</span></div><div class="resourceTrack"><div class="energyFill" data-e1></div></div><div class="resourceLine"><span>GUARD</span><span data-g1-text>100</span></div><div class="resourceTrack"><div class="guardFill" data-g1></div></div></div>
  <div class="clock"><b data-time>90</b><small data-round>ROUND 1</small></div>
  <div class="side r"><div class="name"><span data-fighter-name2>REVVFO</span><span data-s2>0</span></div><div class="track"><div class="fill" data-h2></div></div><div class="resourceLine"><span data-e2-text>100</span><span>ENERGY</span></div><div class="resourceTrack"><div class="energyFill" data-e2></div></div><div class="resourceLine"><span data-g2-text>100</span><span>GUARD</span></div><div class="resourceTrack"><div class="guardFill" data-g2></div></div></div>
</div>
<div class="badge"><strong>PROTOTYPE 2.5C6 • ANIMATED SAGE FIX</strong><span data-stage-name>TANGAI DOJO</span><br>REUSABLE ARENA PIPELINE • DATA-DRIVEN STAGE</div><div class="banner hidden" data-banner></div>
<div class="result hidden" data-result><small>ARENA BATTLE</small><h2 data-title>MATCH COMPLETE</h2><p data-text></p><div class="actions"><button class="primary" data-rematch>REMATCH</button><button data-change-arena>CHANGE ARENA</button><button data-return>MAIN MENU</button></div></div>
<div class="arenaNotice" data-arena-notice></div>
<div class="arenaHotbar" data-arena-hotbar><div class="arenaSlots">${ARENA_ABILITIES.map((ability,index)=>`<button class="arenaAbility ${ability.ultimate?'ultimate':''}" data-arena-slot="${index+1}" aria-label="Slot ${index+1}: ${ability.label}"><span class="arenaCooldown"></span><span class="arenaNumber">${index+1}</span><span class="arenaIcon">${ability.icon}</span><span class="arenaAbilityName">${ability.label}</span><span class="arenaCost">${ability.cost} ENERGY${ability.hp?` • ${ability.hp} HP`:''}</span><span class="arenaState" data-arena-state>READY</span></button>`).join('')}</div></div>
<div class="arenaTouchControls" aria-label="Arena touch controls">
  <div class="arenaMovePad" data-arena-move-pad aria-label="Movement joystick"><div class="arenaMoveKnob" data-arena-move-knob></div></div>
  <div class="arenaActionCluster">
    <button class="arenaTouchButton light" data-arena-touch-action="light"><strong>✦</strong><span>LIGHT</span></button>
    <button class="arenaTouchButton heavy" data-arena-touch-action="heavy"><strong>◆</strong><span>HEAVY</span></button>
    <button class="arenaTouchButton jump" data-arena-touch-action="jump"><strong>↑</strong><span>JUMP</span></button>
    <button class="arenaTouchButton dash" data-arena-touch-action="dash"><strong>➜</strong><span>DASH</span></button>
    <button class="arenaTouchButton launcher" data-arena-touch-action="launcher"><strong>↟</strong><span>LAUNCH</span></button>
    <button class="arenaTouchButton block" data-arena-touch-action="block"><strong>⬡</strong><span>BLOCK</span></button>
  </div>
</div>
<div class="arenaTouchUtilities"><button data-arena-touch-pause aria-label="Pause">Ⅱ</button><button data-arena-touch-settings aria-label="Control settings">⚙</button></div>
<div class="rotateHint"><div><strong>ROTATE TO LANDSCAPE</strong><span>Arena controls are designed for two-thumb play.</span></div></div>
<div class="arenaControlSettings hidden" data-arena-control-settings role="dialog" aria-modal="true" aria-label="Arena control settings"><div class="arenaControlCard">
  <header><div><small>PROTOTYPE 2.5C</small><h2>CONTROL LAYOUTS</h2><p>Desktop and mobile settings save separately from combat balance.</p></div><button data-arena-controls-close aria-label="Close">×</button></header>
  <div class="arenaControlGrid">
    <fieldset><legend>PC</legend><label>Keyboard preset<select data-control-pc-layout><option value="ergonomic">Two-Hand — J/K/I attacks, L block</option><option value="classic">Classic attacks — F/R/T, Q block</option></select></label><label>Left mouse click<select data-control-mouse-attack><option value="light">Light Attack</option><option value="heavy">Heavy Attack</option></select></label><p><strong>Movement:</strong> WASD with walk-to-run momentum<br><strong>Jump:</strong> Space<br><strong>Dash:</strong> Shift or double-tap a direction<br><strong>Mouse 1:</strong> Selected attack<br><strong>Mouse 2:</strong> Hold Block<br><strong>Abilities:</strong> 1–5</p></fieldset>
    <fieldset><legend>MOBILE</legend><label>Touch controls<select data-control-touch-mode><option value="auto">Auto detect</option><option value="on">Always on</option><option value="off">Off</option></select></label><label>Button size<select data-control-mobile-layout><option value="compact">Compact</option><option value="standard">Standard</option><option value="large">Large Buttons</option></select></label><label>Handedness<select data-control-handedness><option value="right">Joystick left / attacks right</option><option value="left">Joystick right / attacks left</option></select></label><label>Opacity<input data-control-opacity type="range" min=".45" max="1" step=".05"></label><label><input data-control-labels type="checkbox"> Show action labels</label></fieldset>
  </div><div class="arenaControlActions"><button data-arena-controls-reset>RESTORE DEFAULTS</button><button class="primary" data-arena-controls-close>DONE</button></div>
</div></div>
<div class="bottom"><div class="help" data-arena-help></div><div class="desktopUtility"><button class="controlButton" data-arena-open-controls>⚙ CONTROLS</button><button data-restart>RESTART</button><button data-exit>EXIT</button></div></div>`;
  document.body.appendChild(root);
  return root;
}

async function loadSprite(renderer,id){
  try{
    const manifestUrl=new URL(`../../assets/fighters/${id}/${id}-animations.json`,import.meta.url);manifestUrl.searchParams.set('v','25c6-animated-sage');
    const response=await fetch(manifestUrl);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const manifest=await response.json();
    const image=new Image();
    image.decoding='async';
    const imageUrl=new URL(manifest.image,manifestUrl);
    imageUrl.searchParams.set('runtime','25c6');
    image.src=imageUrl.href;
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Atlas image failed to load'))});
    return{manifest,image,texture:renderer.createTexture(image)};
  }catch(error){console.warn('[Arena 2.5C6] sprite fallback',id,error);return null}
}

function attackAnimationName(state){
  if(!state)return'';
  const def=state.def,progress=state.elapsed/def.duration;
  if(def.kind==='heavy')return progress<.32?'heavyStartup':progress<.62?'heavyActive':'heavyRecovery';
  if(def.kind==='launcher')return progress<.31?'launcherStartup':progress<.62?'launcherActive':'launcherRecovery';
  return def.animation;
}

function animationName(fighter){
  if(fighter.hp<=0)return'knockdown';
  if(fighter.guardBreak>0)return'guardBreak';
  if(fighter.visualActionTime>0&&fighter.visualAction)return fighter.visualAction;
  if(fighter.attackState)return attackAnimationName(fighter.attackState);
  if(fighter.stun>0)return fighter.knockdown>0?'knockdown':'hurtLight';
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
  const duration=Math.max(25,animation.frameDuration||100),raw=fighter.animationClock/duration;
  const index=animation.loop?Math.floor(raw)%frames.length:Math.min(frames.length-1,Math.floor(raw));
  const frame=asset.manifest.frames?.[frames[index]];if(!frame)return null;
  let nextFrame=null,blend=0;
  if(fighter.id==='sage'&&frames.length>1){
    const nextIndex=animation.loop?(index+1)%frames.length:Math.min(frames.length-1,index+1);
    nextFrame=asset.manifest.frames?.[frames[nextIndex]]||null;
    const phase=raw-Math.floor(raw),blendStart=.72;
    if(nextIndex!==index&&nextFrame)blend=clamp((phase-blendStart)/(1-blendStart),0,1);
  }
  return{frame,source:frame.source,nextFrame,nextSource:nextFrame?.source||null,blend,atlas:asset.manifest.atlas};
}

class CombatAudio{
  constructor(){this.context=null}
  enable(){if(!this.context){const AudioContext=window.AudioContext||window.webkitAudioContext;if(AudioContext)this.context=new AudioContext()}this.context?.resume?.()}
  tone(frequency=220,duration=.06,type='square',gain=.035,slide=0){
    const context=this.context;if(!context)return;
    const oscillator=context.createOscillator(),volume=context.createGain(),now=context.currentTime;
    oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);if(slide)oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,frequency+slide),now+duration);
    volume.gain.setValueAtTime(gain,now);volume.gain.exponentialRampToValueAtTime(.0001,now+duration);
    oscillator.connect(volume).connect(context.destination);oscillator.start(now);oscillator.stop(now+duration);
  }
  play(name){const table={light:[210,.045,'square',.028,-70],heavy:[115,.09,'sawtooth',.045,-50],launcher:[155,.11,'sawtooth',.05,150],block:[520,.055,'triangle',.028,-110],perfect:[880,.08,'sine',.045,260],guardBreak:[85,.18,'sawtooth',.055,-35],projectile:[290,.08,'square',.035,180],dash:[180,.05,'triangle',.022,100],ko:[72,.28,'sawtooth',.06,-35]};this.tone(...(table[name]||table.light))}
}

class ArenaFighter{
  constructor(id,name,x,z,cpu,accent,appearance='down'){Object.assign(this,{id,name,x,z,cpu,accent,appearance});this.asset=null;this.reset(x,z)}
  reset(x,z){
    Object.assign(this,{x,z,y:0,vy:0,kvx:0,kvz:0,moveVX:0,moveVZ:0,runTime:0,speedRatio:0,hp:100,en:100,guard:100,grounded:true,moving:false,moveX:0,moveZ:0,block:false,blockAge:0,guardDelay:0,guardBreak:0,stun:0,inv:0,knockdown:0,dashTime:0,dashElapsed:0,dashRecovery:0,dashCooldown:0,dashX:0,dashZ:0,attackState:null,flash:0,aimX:this.id==='rrvvfo'?1:-1,aimZ:0,animation:'idle',animationClock:0,visualAction:'',visualActionTime:0,lens:0,comboHits:0,comboDamage:0,comboTimer:0,comboTextTime:0,lightChain:0,bodyCenter:68,collisionRadius:29,cooldowns:{fireBlast:0,shotsOfAgony:0,objectSwap:0,lensOfTruth:0,ultimate:0,astrylteBlast:0},aiThink:0,aiMove:{x:0,z:0},aiPulse:{},aiBlock:false});
  }
  setAnimation(name){if(name===this.animation)return;this.animation=name;this.animationClock=0}
  jump(){if(this.grounded&&!this.stun&&!this.guardBreak&&!this.attackState&&!this.dashRecovery){this.grounded=false;this.vy=410;this.animationClock=0;return true}return false}
}

class ArenaBattle{
  constructor(stageId='dojo'){
    this.root=installUI();this.canvas=this.root.querySelector('[data-world-layer]');this.fighterCanvas=this.root.querySelector('[data-fighter-layer]');this.fighterCanvas.width=W*FIGHTER_RENDER_SCALE;this.fighterCanvas.height=H*FIGHTER_RENDER_SCALE;this.fighterContext=this.fighterCanvas.getContext('2d',{alpha:true});this.renderer=new WebGLArenaRenderer(this.canvas);this.audio=new CombatAudio();this.stage=getArenaStage(stageId);
    this.active=false;this.paused=false;this.accumulator=0;this.last=0;this.raf=0;this.hitstop=0;this.cameraShake=0;this.flashTime=0;
    const [spawn1,spawn2]=this.stage.spawnPoints;this.fighters=[new ArenaFighter('rrvvfo','Rrvvfo',spawn1.x,spawn1.z,false,'#ff493d','down'),new ArenaFighter('revvfo','Revvfo',spawn2.x,spawn2.z,true,'#a855f7','down')];
    this.camera={x:0,z:0,distance:850,eye:[520,420,650],target:[0,35,0]};this.particles=[];this.projectiles=[];this.agonyClones=[];this.noticeTime=0;this.scores=[0,0];this.round=1;this.time=90;this.phase='intro';this.phaseTime=1.55;
    this.controlSettingsPaused=false;this.controls=new ArenaControlManager(this.root,{onPause:()=>this.togglePause(),onExit:()=>this.exit(),onAbility:slot=>this.castAbility(slot),onSettings:()=>this.notice('CONTROL LAYOUT SAVED'),onOpenSettings:()=>{if(!this.paused){this.controlSettingsPaused=true;this.togglePause()}},onCloseSettings:()=>{if(this.controlSettingsPaused){this.controlSettingsPaused=false;this.togglePause()}}});
    this.root.querySelector('[data-exit]').onclick=()=>this.exit();this.root.querySelector('[data-return]').onclick=()=>this.exit();this.root.querySelector('[data-restart]').onclick=()=>this.restart();this.root.querySelector('[data-rematch]').onclick=()=>this.restart();this.root.querySelector('[data-change-arena]').onclick=()=>this.showStageSelect();this.root.querySelector('[data-stage-back]').onclick=()=>this.exit();this.renderStageSelect();this.root.querySelectorAll('[data-arena-slot]').forEach(button=>button.addEventListener('click',()=>this.castAbility(Number(button.dataset.arenaSlot))));
  }


  renderStageSelect(){
    const grid=this.root.querySelector('[data-arena-stage-grid]');if(!grid)return;
    const stages=listArenaStages();
    grid.innerHTML=stages.map(stage=>`<button class="arenaStageOption ${stage.id}" data-stage-card="${stage.id}" ${stage.available?'':`disabled aria-disabled="true"`}><strong>${stage.name}</strong><span>${stage.role}</span><span>${stage.status}</span><em>${stage.available?'PLAYABLE':'COMING NEXT'}</em></button>`).join('');
    grid.querySelectorAll('[data-stage-card]').forEach(button=>button.addEventListener('click',()=>this.selectStage(button.dataset.stageCard)));
  }

  stopMatch(){
    if(this.active){this.active=false;cancelAnimationFrame(this.raf);this.controls.stop()}
    this.paused=false;this.controlSettingsPaused=false;this.root.classList.remove('paused');this.root.querySelector('[data-result]').classList.add('hidden');this.clearFighterLayer();this.updateLensBlindness();
  }

  showStageSelect(){
    this.stopMatch();this.renderStageSelect();this.root.classList.remove('hidden');this.root.querySelector('[data-arena-stage-select]').classList.remove('hidden');['startScreen','mainMenuScreen','menuScreen','gameScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));
    this.root.querySelector(`[data-stage-card="${this.stage.id}"]`)?.focus();
  }

  selectStage(stageId){
    const entry=listArenaStages().find(stage=>stage.id===stageId);if(!entry?.available)return;
    this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.setStage(stageId);this.start();
  }

  setStage(stageId='dojo'){
    if(this.active)throw new Error('Cannot change arenas during an active match.');
    this.stage=getArenaStage(stageId);
    const [spawn1,spawn2]=this.stage.spawnPoints;
    this.fighters[0].reset(spawn1.x,spawn1.z);this.fighters[1].reset(spawn2.x,spawn2.z);
    return this.stage;
  }

  start(){
    if(this.active)return;this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.active=true;this.root.querySelector('[data-stage-name]').textContent=this.stage.name.toUpperCase();this.canvas.setAttribute('aria-label',`${this.stage.name} WebGL perspective arena`);this.audio.enable();this.root.classList.remove('hidden','paused');['startScreen','mainMenuScreen','menuScreen','gameScreen'].forEach(id=>document.getElementById(id)?.classList.add('hidden'));this.controls.start();this.restart();this.last=performance.now();this.raf=requestAnimationFrame(timestamp=>this.loop(timestamp));
    Promise.all(this.fighters.map(fighter=>loadSprite(this.renderer,fighter.id))).then(assets=>{if(!this.active)return;this.fighters.forEach((fighter,index)=>{fighter.asset=assets[index]})});
  }

  exit(){this.stopMatch();this.root.querySelector('[data-arena-stage-select]').classList.add('hidden');this.root.classList.add('hidden');document.getElementById('mainMenuScreen')?.classList.remove('hidden')}
  togglePause(){this.paused=!this.paused;this.root.classList.toggle('paused',this.paused);this.controls.releaseAll()}
  restart(){this.scores=[0,0];this.round=1;this.root.querySelector('[data-result]').classList.add('hidden');this.newRound()}
  newRound(){const [spawn1,spawn2]=this.stage.spawnPoints;this.time=90;this.phase='intro';this.phaseTime=1.55;this.hitstop=0;this.cameraShake=0;this.fighters[0].reset(spawn1.x,spawn1.z);this.fighters[1].reset(spawn2.x,spawn2.z);this.camera={x:0,z:0,distance:850,eye:[520,420,650],target:[0,35,0]};this.particles=[];this.projectiles=[];this.agonyClones=[];this.noticeTime=0;this.notice('');this.banner(`ROUND ${this.round}`);this.hud()}
  banner(text){const banner=this.root.querySelector('[data-banner]');banner.textContent=text;banner.classList.remove('hidden')}
  hideBanner(){this.root.querySelector('[data-banner]').classList.add('hidden')}

  input(){return this.controls.read()}

  cpu(fighter,foe,dt){
    fighter.aiThink-=dt;if(fighter.aiThink<=0){fighter.aiThink=.07+Math.random()*.08;fighter.aiPulse={};const dx=foe.x-fighter.x,dz=foe.z-fighter.z,distance=Math.hypot(dx,dz),toward=normalizeMovement(dx,dz),wall=stageWallAvoidance(this.stage,fighter.x,fighter.z,this.stage.ai?.wallMargin??55);let moveX=0,moveZ=0,block=false;
      const incoming=this.projectiles.find(projectile=>projectile.target===fighter&&Math.hypot(projectile.x-fighter.x,projectile.z-fighter.z)<180);
      if(incoming){const side=Math.random()<.5?-1:1;moveX=-toward.z*side;moveZ=toward.x*side;if(Math.random()<.25)fighter.aiPulse.dash=true}
      else if(foe.attackState&&distance<145){if(Math.random()<.62)block=true;else{moveX=-toward.z*(Math.random()<.5?-1:1);moveZ=toward.x*(Math.random()<.5?-1:1);if(Math.random()<.28)fighter.aiPulse.dash=true}}
      else if(distance>235){moveX=toward.x;moveZ=toward.z;if(fighter.cooldowns.astrylteBlast<=0&&fighter.en>=24&&Math.random()<.22)fighter.aiPulse.special=true}
      else if(distance>120){moveX=toward.x*.75-toward.z*.35;moveZ=toward.z*.75+toward.x*.35;if(fighter.cooldowns.astrylteBlast<=0&&fighter.en>=24&&Math.random()<.12)fighter.aiPulse.special=true}
      else{if(Math.random()<.48)fighter.aiPulse.light=true;else if(Math.random()<.26)fighter.aiPulse.heavy=true;else if(foe.grounded&&Math.random()<.18)fighter.aiPulse.launcher=true;else{moveX=-toward.z*(Math.random()<.5?-1:1)*.55;moveZ=toward.x*(Math.random()<.5?-1:1)*.55}}
      if(wall.near){moveX+=wall.x*.75;moveZ+=wall.z*.75}fighter.aiMove=normalizeMovement(moveX,moveZ);fighter.aiBlock=block;
    }
    const pulse=fighter.aiPulse;fighter.aiPulse={};return{x:fighter.aiMove.x,z:fighter.aiMove.z,jump:!!pulse.jump,light:!!pulse.light,heavy:!!pulse.heavy,launcher:!!pulse.launcher,dash:!!pulse.dash,block:fighter.aiBlock,special:!!pulse.special};
  }

  loop(timestamp){if(!this.active)return;const delta=Math.min(.05,Math.max(0,(timestamp-this.last)/1000));this.last=timestamp;if(!this.paused){this.accumulator+=delta;while(this.accumulator>=STEP){this.update(STEP);this.accumulator-=STEP}}this.draw();this.updateLensBlindness();this.raf=requestAnimationFrame(next=>this.loop(next))}

  update(dt){
    this.updateParticles(dt);this.updateCamera();if(this.noticeTime>0){this.noticeTime=Math.max(0,this.noticeTime-dt);if(!this.noticeTime)this.notice('')}if(this.flashTime>0){this.flashTime=Math.max(0,this.flashTime-dt);if(!this.flashTime)this.root.querySelector('[data-impact-flash]').style.opacity='0'}
    for(const fighter of this.fighters){fighter.comboTextTime=Math.max(0,fighter.comboTextTime-dt);const activeAnimation=animationName(fighter);fighter.setAnimation(activeAnimation);const animationRate=activeAnimation==='run'?clamp(.62+fighter.speedRatio*.78,.66,1.5):1;if(this.hitstop<=0)fighter.animationClock+=dt*1000*animationRate}
    if(this.phase==='intro'){this.phaseTime-=dt;if(this.phaseTime<.65)this.banner('FIGHT!');if(this.phaseTime<=0){this.phase='play';this.hideBanner()}return}
    if(this.phase==='over'){this.phaseTime-=dt;if(this.phaseTime<=0){if(Math.max(...this.scores)>=2)this.showResult();else{this.round++;this.newRound()}}return}
    if(this.phase!=='play')return;
    if(this.hitstop>0){this.hitstop=Math.max(0,this.hitstop-dt);this.hud();return}
    this.time=Math.max(0,this.time-dt);const playerCommand=this.input(),cpuCommand=this.cpu(this.fighters[1],this.fighters[0],dt);this.stepFighter(this.fighters[0],this.fighters[1],playerCommand,dt);this.stepFighter(this.fighters[1],this.fighters[0],cpuCommand,dt);if(cpuCommand.special)this.castRevvfoBlast(this.fighters[1],this.fighters[0]);this.updateSpecials(dt);this.separateFighters();this.resolveAttackHit(this.fighters[0],this.fighters[1]);this.resolveAttackHit(this.fighters[1],this.fighters[0]);if(this.time<=0||this.fighters.some(fighter=>fighter.hp<=0))this.finishRound();this.hud();
  }

  stepFighter(fighter,foe,command,dt){
    fighter.stun=Math.max(0,fighter.stun-dt);fighter.inv=Math.max(0,fighter.inv-dt);fighter.flash=Math.max(0,fighter.flash-dt);fighter.visualActionTime=Math.max(0,fighter.visualActionTime-dt);fighter.lens=Math.max(0,fighter.lens-dt);fighter.guardBreak=Math.max(0,fighter.guardBreak-dt);fighter.knockdown=Math.max(0,fighter.knockdown-dt);fighter.dashCooldown=Math.max(0,fighter.dashCooldown-dt);fighter.dashRecovery=Math.max(0,fighter.dashRecovery-dt);fighter.guardDelay=Math.max(0,fighter.guardDelay-dt);fighter.comboTimer=Math.max(0,fighter.comboTimer-dt);for(const key of Object.keys(fighter.cooldowns))fighter.cooldowns[key]=Math.max(0,fighter.cooldowns[key]-dt);
    if(fighter.comboTimer<=0&&!fighter.attackState){fighter.lightChain=0;fighter.comboHits=0;fighter.comboDamage=0}if(fighter.id==='rrvvfo'&&!this.volleyActive(fighter))fighter.en=clamp(fighter.en+7*dt,0,100);if(fighter.id==='revvfo')fighter.en=clamp(fighter.en+8.5*dt,0,100);
    if(fighter.guardDelay<=0&&!fighter.block&&!fighter.guardBreak&&fighter.stun<=0)fighter.guard=clamp(fighter.guard+18*dt,0,100);

    const profile=movementProfile(fighter),rawX=command.x||0,rawZ=command.z||0,move=normalizeMovement(rawX,rawZ),inputMagnitude=clamp(Math.hypot(rawX,rawZ),0,1),toward=aimVector(fighter,foe);
    if(!fighter.attackState){let facing=toward;if(fighter.dashTime>0)facing={x:fighter.dashX,z:fighter.dashZ};else if(move.length>.08&&!fighter.block)facing=move;const faced=rotateToward(fighter.aimX,fighter.aimZ,facing.x,facing.z,12*dt);fighter.aimX=faced.x;fighter.aimZ=faced.z}
    fighter.moving=false;fighter.moveX=0;fighter.moveZ=0;

    if(Math.abs(fighter.kvx)+Math.abs(fighter.kvz)>.1){fighter.x+=fighter.kvx*dt;fighter.z+=fighter.kvz*dt;fighter.kvx*=Math.pow(.018,dt);fighter.kvz*=Math.pow(.018,dt)}else{fighter.kvx=fighter.kvz=0}

    if(fighter.dashTime>0){
      fighter.dashElapsed+=dt;fighter.dashTime=Math.max(0,fighter.dashTime-dt);fighter.x+=fighter.dashX*profile.dashSpeed*dt;fighter.z+=fighter.dashZ*profile.dashSpeed*dt;fighter.inv=Math.max(fighter.inv,fighter.dashTime>.075?.025:0);fighter.moving=true;fighter.moveX=fighter.dashX;fighter.moveZ=fighter.dashZ;fighter.speedRatio=1.18;
      const cancelReady=fighter.dashElapsed>=DASH_CANCEL_TIME;
      if(cancelReady&&command.jump&&fighter.grounded){fighter.dashTime=0;fighter.dashRecovery=0;fighter.moveVX=fighter.dashX*profile.runSpeed*.92;fighter.moveVZ=fighter.dashZ*profile.runSpeed*.92;fighter.jump()}
      else if(cancelReady&&(command.light||command.heavy||command.launcher)){fighter.dashTime=0;fighter.dashRecovery=0;if(command.launcher&&fighter.grounded)this.startAttack(fighter,'launcher',foe);else if(command.heavy)this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe);else this.startAttack(fighter,fighter.grounded?this.nextLight(fighter):'airLight',foe)}
      if(!fighter.dashTime&&!fighter.attackState&&fighter.grounded){fighter.dashRecovery=Math.max(fighter.dashRecovery,.07);fighter.moveVX=fighter.dashX*profile.runSpeed*.9;fighter.moveVZ=fighter.dashZ*profile.runSpeed*.9}
    }
    else if(fighter.attackState){this.updateAttack(fighter,foe,command,dt);fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.15*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.15*dt);fighter.runTime=Math.max(0,fighter.runTime-dt*4)}
    else{
      const canAct=!fighter.stun&&!fighter.guardBreak&&!fighter.knockdown&&!fighter.dashRecovery;
      const wasBlocking=fighter.block;fighter.block=canAct&&fighter.grounded&&!!command.block;if(fighter.block){fighter.blockAge=wasBlocking?fighter.blockAge+dt:0}else fighter.blockAge=0;
      if(canAct&&!fighter.block){
        const currentSpeed=Math.hypot(fighter.moveVX,fighter.moveVZ),currentX=currentSpeed>.1?fighter.moveVX/currentSpeed:move.x,currentZ=currentSpeed>.1?fighter.moveVZ/currentSpeed:move.z,alignment=move.length>.08?currentX*move.x+currentZ*move.z:1;
        if(move.length>.08){if(alignment<-.2)fighter.runTime=Math.max(0,fighter.runTime-dt*5);else fighter.runTime=Math.min(RUN_BUILD_TIME,fighter.runTime+dt)}else fighter.runTime=Math.max(0,fighter.runTime-dt*3.5);
        const runBlend=clamp(fighter.runTime/RUN_BUILD_TIME,0,1),analogWalk=inputMagnitude<.72,groundTopSpeed=profile.walkSpeed+(profile.runSpeed-profile.walkSpeed)*(analogWalk?0:runBlend),topSpeed=fighter.grounded?groundTopSpeed:profile.airSpeed,speedScale=analogWalk?inputMagnitude/.72:1,desiredSpeed=move.length>.08?topSpeed*speedScale:0,desiredX=move.x*desiredSpeed,desiredZ=move.z*desiredSpeed,turningHard=alignment<.15&&currentSpeed>profile.walkSpeed*.7;
        const acceleration=fighter.grounded?(turningHard?profile.brake*1.15:profile.accel+(profile.runAccel-profile.accel)*runBlend):profile.airAccel,braking=fighter.grounded?profile.brake:profile.airBrake,rate=move.length>.08?acceleration:braking;
        fighter.moveVX=approach(fighter.moveVX,desiredX,rate*dt);fighter.moveVZ=approach(fighter.moveVZ,desiredZ,rate*dt);
        const actualSpeed=Math.hypot(fighter.moveVX,fighter.moveVZ);if(actualSpeed>2){fighter.x+=fighter.moveVX*dt;fighter.z+=fighter.moveVZ*dt;fighter.moveX=fighter.moveVX/actualSpeed;fighter.moveZ=fighter.moveVZ/actualSpeed}fighter.moving=actualSpeed>18;fighter.speedRatio=clamp(actualSpeed/profile.runSpeed,0,1.25);
        if(command.dash)this.startDash(fighter,foe,move);else if(command.jump)fighter.jump();else if(command.launcher&&fighter.grounded)this.startAttack(fighter,'launcher',foe);else if(command.heavy)this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe);else if(command.light)this.startAttack(fighter,fighter.grounded?this.nextLight(fighter):'airLight',foe)
      }else{fighter.moveVX=approach(fighter.moveVX,0,profile.brake*1.25*dt);fighter.moveVZ=approach(fighter.moveVZ,0,profile.brake*1.25*dt);fighter.runTime=Math.max(0,fighter.runTime-dt*5);fighter.speedRatio=clamp(Math.hypot(fighter.moveVX,fighter.moveVZ)/profile.runSpeed,0,1)}
    }
    if(!fighter.grounded){fighter.vy-=920*dt;fighter.y+=fighter.vy*dt;if(fighter.y<=0){fighter.y=0;fighter.vy=0;fighter.grounded=true;fighter.animationClock=0;if(fighter.knockdown>0)fighter.stun=Math.max(fighter.stun,.42);this.burst(fighter.x,fighter.z,fighter.accent,8,2)}}
    ({x:fighter.x,z:fighter.z}=clampToStage(this.stage,fighter.x,fighter.z));
  }

  nextLight(fighter){if(fighter.comboTimer>0&&fighter.lightChain===1)return'light2';if(fighter.comboTimer>0&&fighter.lightChain===2)return'light3';return'light1'}

  startAttack(fighter,kind,foe){
    const def=ATTACKS[kind];if(!def||fighter.stun||fighter.guardBreak||fighter.knockdown||fighter.dashRecovery)return false;if(def.air&&fighter.grounded)return false;if(!def.air&&!fighter.grounded)return false;
    const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;fighter.attackState={def,elapsed:0,hit:false,locked:false,aimX:aim.x,aimZ:aim.z,lungeRemaining:def.lunge,magnetRemaining:fighter.comboTimer>0?42:0,buffer:null};fighter.block=false;fighter.animationClock=0;fighter.visualAction='';fighter.visualActionTime=0;if(kind.startsWith('light'))fighter.lightChain=Number(kind.slice(-1));return true;
  }

  updateAttack(fighter,foe,command,dt){
    const state=fighter.attackState,def=state.def;if(command.light)state.buffer='light';if(command.heavy)state.buffer='heavy';if(command.launcher)state.buffer='launcher';
    state.elapsed+=dt;if(!state.locked&&state.elapsed<def.activeStart){const target=aimVector(fighter,foe),rotated=rotateToward(state.aimX,state.aimZ,target.x,target.z,10*dt);state.aimX=fighter.aimX=rotated.x;state.aimZ=fighter.aimZ=rotated.z}else if(!state.locked){state.locked=true;fighter.aimX=state.aimX;fighter.aimZ=state.aimZ}
    if(state.elapsed<=def.activeEnd&&state.lungeRemaining>0){const amount=Math.min(state.lungeRemaining,155*dt);fighter.x+=state.aimX*amount;fighter.z+=state.aimZ*amount;state.lungeRemaining-=amount}
    if(fighter.comboTimer>0&&state.elapsed<def.activeStart&&state.magnetRemaining>0){const target=aimVector(fighter,foe),distance=Math.hypot(foe.x-fighter.x,foe.z-fighter.z);if(distance<155){const amount=Math.min(state.magnetRemaining,95*dt);fighter.x+=target.x*amount;fighter.z+=target.z*amount;state.magnetRemaining-=amount}}
    if(state.elapsed>=def.duration){const buffered=state.buffer,connected=state.hit;fighter.attackState=null;if(connected&&buffered==='light'&&def.kind==='light1')this.startAttack(fighter,'light2',foe);else if(connected&&buffered==='light'&&def.kind==='light2')this.startAttack(fighter,'light3',foe);else if(connected&&buffered==='heavy'&&['light1','light2','airLight'].includes(def.kind))this.startAttack(fighter,fighter.grounded?'heavy':'airHeavy',foe);else if(connected&&buffered==='launcher'&&fighter.grounded)this.startAttack(fighter,'launcher',foe);else if(!connected){fighter.comboTimer=0;fighter.lightChain=0}}
  }

  startDash(fighter,foe,move){if(fighter.dashCooldown||fighter.dashRecovery||fighter.stun||fighter.attackState)return false;let direction=move;if(direction.length<.1){const toward=aimVector(fighter,foe),side=Math.random()<.5?-1:1;direction={x:-toward.z*side,z:toward.x*side,length:1}}fighter.dashX=direction.x;fighter.dashZ=direction.z;fighter.dashTime=.18;fighter.dashElapsed=0;fighter.dashCooldown=.36;fighter.block=false;fighter.animationClock=0;this.audio.play('dash');this.burst(fighter.x,fighter.z,fighter.accent,12,8);return true}

  separateFighters(){const[a,b]=this.fighters,dx=b.x-a.x,dz=b.z-a.z,distance=Math.max(.001,Math.hypot(dx,dz));if(distance>=44||Math.abs(a.y-b.y)>70)return;const push=(44-distance)/2,nx=dx/distance,nz=dz/distance;a.x-=nx*push;a.z-=nz*push;b.x+=nx*push;b.z+=nz*push}

  resolveAttackHit(attacker,target){
    const state=attacker.attackState;if(!state||state.hit||target.inv)return;const def=state.def;if(state.elapsed<def.activeStart||state.elapsed>def.activeEnd)return;
    if(!hitVolumeConnects(attacker,target,{range:def.range,width:def.width,height:def.height,aimX:state.aimX,aimZ:state.aimZ}))return;
    state.hit=true;this.applyDamage(attacker,target,def.damage,{guardDamage:def.guardDamage,knockback:def.knockback,color:attacker.accent,hitstop:def.hitstop,stun:def.stun,launch:def.launch||0,spike:def.spike||0,knockdown:def.knockdown,kind:def.kind});
  }

  applyDamage(attacker,target,damage,{guardDamage=Math.max(1,damage*.2),knockback=28,color=attacker.accent,hitstop=5,stun=.24,launch=0,spike=0,knockdown=false,kind='light'}={}){
    if(target.inv)return false;
    if(target.lens>0){const oldX=target.x,oldZ=target.z,aim=aimVector(attacker,target),side=Math.random()<.5?-1:1;({x:target.x,z:target.z}=clampToStage(this.stage,target.x-aim.x*75-aim.z*side*70,target.z-aim.z*75+aim.x*side*70));target.inv=.28;target.visualAction=side<0?'lensDodgeLeft':'lensDodgeRight';target.visualActionTime=.34;this.burst(oldX,oldZ,'#c9f6ff',14,55);this.burst(target.x,target.z,'#c9f6ff',14,55);this.notice('LENS DODGE');return false}
    const guarded=target.block&&target.grounded&&blockFacesAttacker(target,attacker),perfect=guarded&&target.blockAge<=PERFECT_BLOCK_WINDOW,aim=aimVector(attacker,target);
    if(guarded){const spent=perfect?guardDamage*.22:guardDamage;target.guard=Math.max(0,target.guard-spent);target.guardDelay=1.25;target.stun=perfect?.055:.115;target.kvx=aim.x*knockback*(perfect?.12:.35);target.kvz=aim.z*knockback*(perfect?.12:.35);this.hitstop=Math.max(this.hitstop,(perfect?6:3)*STEP);this.cameraShake=Math.max(this.cameraShake,perfect?3:2);this.burst(target.x,target.z,perfect?'#fff4a3':'#9de7ff',perfect?15:9,58);this.audio.play(perfect?'perfect':'block');if(perfect){attacker.stun=Math.max(attacker.stun,.13);this.notice('PERFECT BLOCK')}
      if(target.guard<=0){target.guard=35;target.guardBreak=.88;target.stun=.88;target.block=false;target.hp=Math.max(0,target.hp-2);this.hitstop=Math.max(this.hitstop,10*STEP);this.cameraShake=Math.max(this.cameraShake,10);this.burst(target.x,target.z,'#ffdc75',28,60);this.audio.play('guardBreak');this.notice('GUARD BREAK!')}
      return true;
    }
    target.hp=Math.max(0,target.hp-damage);target.stun=Math.max(target.stun,stun);target.inv=.055;target.flash=.12;target.guardDelay=1.1;target.kvx=aim.x*knockback;target.kvz=aim.z*knockback;if(launch){target.grounded=false;target.vy=launch;target.y=Math.max(2,target.y)}if(spike&&target.y>0)target.vy=-spike;if(knockdown)target.knockdown=Math.max(target.knockdown,.72);
    attacker.comboHits=attacker.comboTimer>0?attacker.comboHits+1:1;attacker.comboDamage=(attacker.comboTimer>0?attacker.comboDamage:0)+damage;attacker.comboTimer=.92;attacker.comboTextTime=1.05;this.hitstop=Math.max(this.hitstop,hitstop*STEP);this.cameraShake=Math.max(this.cameraShake,kind==='heavy'||kind==='airHeavy'?9:kind==='launcher'?10:5);this.impactFlash(color,kind==='heavy'||kind==='launcher'?.18:.09);this.burst(target.x,target.z,color,kind==='heavy'||kind==='launcher'?24:17,58+target.y);this.audio.play(kind==='heavy'||kind==='airHeavy'?'heavy':kind==='launcher'?'launcher':'light');return true;
  }

  impactFlash(color,opacity){const element=this.root.querySelector('[data-impact-flash]');element.style.background=color;element.style.opacity=String(opacity);this.flashTime=.07}
  notice(message,duration=1.15){const element=this.root.querySelector('[data-arena-notice]');element.textContent=message;element.classList.toggle('show',!!message);this.noticeTime=message?duration:0}
  volleyActive(fighter){return this.agonyClones.some(clone=>clone.owner===fighter)||this.projectiles.some(projectile=>projectile.owner===fighter&&projectile.volley)}
  abilityReady(fighter,ability){const cancel=fighter.attackState?.hit&&fighter.attackState.elapsed>=fighter.attackState.def.activeStart;return this.phase==='play'&&!this.paused&&!fighter.stun&&!fighter.guardBreak&&fighter.grounded&&(cancel||!fighter.attackState)&&fighter.cooldowns[ability.id]<=0&&fighter.en>=ability.cost&&(ability.id!=='shotsOfAgony'||!this.volleyActive(fighter))}

  castAbility(slot){
    const fighter=this.fighters[0],foe=this.fighters[1],ability=ARENA_ABILITIES[slot-1];if(!this.active||!ability)return false;if(this.phase!=='play'||this.paused){this.notice(this.paused?'MATCH PAUSED':'WAIT FOR FIGHT');return false}const cancel=fighter.attackState?.hit&&fighter.attackState.elapsed>=fighter.attackState.def.activeStart;if(fighter.stun||fighter.guardBreak||!fighter.grounded||(fighter.attackState&&!cancel)){this.notice('ABILITY UNAVAILABLE');return false}if(fighter.cooldowns[ability.id]>0){this.notice(`${ability.label.toUpperCase()} • ${fighter.cooldowns[ability.id].toFixed(1)}s`);return false}if(ability.id==='shotsOfAgony'&&this.volleyActive(fighter)){this.notice('SHOTS VOLLEY ACTIVE');return false}if(fighter.en<ability.cost){this.notice(`NEED ${ability.cost} ENERGY`);return false}
    fighter.attackState=null;fighter.en-=ability.cost;fighter.cooldowns[ability.id]=ability.id==='shotsOfAgony'?0:ability.cooldown;const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;
    if(ability.id==='fireBlast'){fighter.visualAction='fireBlastFire';fighter.visualActionTime=.45;this.spawnProjectile(fighter,{speed:410,damage:11,radius:24,height:72,life:2.2,color:'#ff6a31',label:'FIRE BLAST'});this.audio.play('projectile');this.notice('FIRE BLAST')}
    else if(ability.id==='shotsOfAgony'){fighter.visualAction='shotsSummon';fighter.visualActionTime=.72;const radius=112;for(let index=0;index<4;index++){const angle=index/4*Math.PI*2;{const point=clampToStage(this.stage,foe.x+Math.cos(angle)*radius,foe.z+Math.sin(angle)*radius);this.agonyClones.push({owner:fighter,target:foe,x:point.x,z:point.z,life:1.2,fireAt:.58,fired:false,index,color:'#6ebcff'})}}this.notice('SHOTS OF AGONY • 4 CLONES')}
    else if(ability.id==='objectSwap'){const oldX=fighter.x,oldZ=fighter.z;fighter.visualAction='objectSwapDisappear';fighter.visualActionTime=.36;({x:fighter.x,z:fighter.z}=clampToStage(this.stage,foe.x-aim.x*82-aim.z*35,foe.z-aim.z*82+aim.x*35));fighter.inv=.24;this.burst(oldX,oldZ,'#ffd079',18,50);this.burst(fighter.x,fighter.z,'#ffd079',18,50);this.notice('OBJECT SWAP')}
    else if(ability.id==='lensOfTruth'){fighter.hp=Math.max(1,fighter.hp-50);fighter.lens=4;fighter.visualAction='lensActivate';fighter.visualActionTime=.55;this.burst(fighter.x,fighter.z,'#d4fbff',28,70);this.notice('LENS OF TRUTH • 4s')}
    else if(ability.id==='ultimate'){fighter.visualAction='ultimateAttack';fighter.visualActionTime=.9;this.spawnProjectile(fighter,{speed:520,damage:28,radius:62,height:105,life:2.1,color:'#ffbd42',ultimate:true,label:'SOLAR WEAVE'});this.burst(fighter.x,fighter.z,'#ffd45b',34,72);this.notice('FIRE AWAKENING: SOLAR WEAVE',1.6)}this.hud();return true;
  }

  castRevvfoBlast(fighter,foe){if(this.phase!=='play'||fighter.cooldowns.astrylteBlast>0||fighter.en<24||fighter.stun||fighter.guardBreak||fighter.attackState||!fighter.grounded)return false;fighter.en-=24;fighter.cooldowns.astrylteBlast=1.75;fighter.visualAction='astrylteBlast';fighter.visualActionTime=.48;const aim=aimVector(fighter,foe);fighter.aimX=aim.x;fighter.aimZ=aim.z;this.spawnProjectile(fighter,{speed:455,damage:12,radius:23,height:78,life:2.1,color:'#b463ff',label:'ASTRYLTE BLAST'});this.audio.play('projectile');return true}

  spawnProjectile(owner,{speed=360,damage=10,radius=22,height=76,life=2,color='#ffffff',ultimate=false,volley=false,label='',origin=null}={}){const target=this.fighters.find(fighter=>fighter!==owner),source=origin||owner,aim=aimVector(source,target),startX=source.x+aim.x*40,startZ=source.z+aim.z*40,startY=origin?.y??68+owner.y,targetY=(target.y??0)+target.bodyCenter,vy=clamp((targetY-startY)*2.2,-105,105);this.projectiles.push({owner,target,x:startX,z:startZ,y:startY,vx:aim.x*speed,vz:aim.z*speed,vy,damage,radius,height,life,maxLife:life,color,ultimate,volley,label,trailX:source.x,trailZ:source.z,trailY:startY})}

  updateSpecials(dt){
    for(const clone of this.agonyClones){clone.life-=dt;clone.fireAt-=dt;if(!clone.fired&&clone.fireAt<=0){clone.fired=true;clone.owner.cooldowns.shotsOfAgony=5;this.spawnProjectile(clone.owner,{speed:430,damage:7,radius:19,height:75,life:1.7,color:clone.color||'#6ebcff',volley:true,label:'SHOT OF AGONY',origin:{x:clone.x,z:clone.z,y:62}})}}this.agonyClones=this.agonyClones.filter(clone=>clone.life>0);
    for(const projectile of this.projectiles){projectile.life-=dt;projectile.trailX=projectile.x;projectile.trailZ=projectile.z;projectile.trailY=projectile.y;projectile.x+=projectile.vx*dt;projectile.z+=projectile.vz*dt;projectile.y+=projectile.vy*dt;const target=projectile.target;if(projectile.life>0&&projectileConnects(projectile,target)){this.applyDamage(projectile.owner,target,projectile.damage,{guardDamage:projectile.ultimate?7:4,knockback:projectile.ultimate?96:46,color:projectile.color,hitstop:projectile.ultimate?10:6,stun:projectile.ultimate?.45:.27,knockdown:projectile.ultimate,kind:projectile.ultimate?'heavy':'projectile'});projectile.life=0}if(outsideStageProjectileBounds(this.stage,projectile))projectile.life=0}this.projectiles=this.projectiles.filter(projectile=>projectile.life>0);
  }

  finishRound(){if(this.phase!=='play')return;const[a,b]=this.fighters,winner=b.hp>a.hp?1:a.hp>b.hp?0:(Math.random()<.5?0:1);this.scores[winner]++;this.phase='over';this.phaseTime=2;this.banner(this.fighters.some(fighter=>fighter.hp<=0)?'K.O.':'TIME!');if(this.fighters.some(fighter=>fighter.hp<=0))this.audio.play('ko');this.hud()}
  showResult(){this.phase='result';this.hideBanner();const winner=this.scores[0]>this.scores[1]?0:1,result=this.root.querySelector('[data-result]');result.querySelector('[data-title]').textContent=`${this.fighters[winner].name.toUpperCase()} WINS`;result.querySelector('[data-text]').textContent=`Final score ${this.scores[0]}–${this.scores[1]}. ${this.stage.name} loaded its boundaries, spawns, camera, fog, floor, scenery, AI wall awareness, and projectile cleanup from the shared arena pipeline.`;result.classList.remove('hidden')}

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
    overlay.style.background=preference==='reduced'?'rgba(0,0,0,.72)':'rgba(0,0,0,.96)';
    const ending=fighter.lens<=1;overlay.classList.toggle('ending',ending);overlay.classList.toggle('reduced',preference==='reduced');
    overlay.querySelector('[data-lens-status]').textContent=ending?'WARNING • LENS ENDING':'VISION LOST • AUTO-DODGE ACTIVE';
    overlay.querySelector('[data-lens-time]').textContent=`${Math.max(1,Math.ceil(fighter.lens))}s`;
  }

  hud(){
    this.root.classList.toggle('sageOpponent',this.fighters[1]?.id==='sage');
    const[player,cpu]=this.fighters;for(const [index,fighter] of this.fighters.entries()){this.root.querySelector(`[data-h${index+1}]`).style.width=`${fighter.hp}%`;this.root.querySelector(`[data-e${index+1}]`).style.width=`${fighter.en}%`;const guard=this.root.querySelector(`[data-g${index+1}]`);guard.style.width=`${fighter.guard}%`;guard.classList.toggle('low',fighter.guard<30);this.root.querySelector(index?'[data-e2-text]':'[data-energy-text]').textContent=Math.floor(fighter.en);this.root.querySelector(`[data-g${index+1}-text]`).textContent=Math.floor(fighter.guard)}this.root.querySelector('[data-fighter-name1]').textContent=this.fighters[0].name.toUpperCase();this.root.querySelector('[data-fighter-name2]').textContent=this.fighters[1].name.toUpperCase();this.root.querySelector('[data-s1]').textContent=this.scores[0];this.root.querySelector('[data-s2]').textContent=this.scores[1];this.root.querySelector('[data-time]').textContent=Math.ceil(this.time);this.root.querySelector('[data-round]').textContent=`ROUND ${this.round}`;
    const combo=this.root.querySelector('[data-combo]');combo.classList.toggle('show',player.comboTextTime>0&&player.comboHits>1);combo.innerHTML=player.comboHits>1?`${player.comboHits} HIT COMBO<small>${player.comboDamage.toFixed(1)} DAMAGE</small>`:'';
    this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>{const ability=ARENA_ABILITIES[index],cooldown=player.cooldowns[ability.id]||0,active=ability.id==='shotsOfAgony'?this.volleyActive(player):ability.id==='lensOfTruth'&&player.lens>0,available=this.abilityReady(player,ability);button.classList.toggle('active',active);button.classList.toggle('unavailable',!available&&!active);button.setAttribute('aria-disabled',String(!available));button.style.setProperty('--cooldown-fill',`${ability.cooldown?clamp(cooldown/ability.cooldown,0,1)*100:0}%`);let state='READY';if(active)state=ability.id==='lensOfTruth'?`${Math.ceil(player.lens)}s ACTIVE`:'ACTIVE';else if(cooldown>0)state=`${cooldown.toFixed(1)}s`;else if(player.en<ability.cost)state=`NEED ${ability.cost}`;button.querySelector('[data-arena-state]').textContent=state});
    this.updateLensBlindness();
  }

  updateCamera(){const[a,b]=this.fighters,c=this.stage.camera,midX=(a.x+b.x)/2,midZ=(a.z+b.z)/2,separation=Math.hypot(a.x-b.x,a.z-b.z),yaw=c.yawDeg*Math.PI/180;this.camera.x=lerp(this.camera.x,clamp(midX,-c.focusClampX,c.focusClampX),c.focusSmoothing);this.camera.z=lerp(this.camera.z,clamp(midZ,-c.focusClampZ,c.focusClampZ),c.focusSmoothing);this.camera.distance=lerp(this.camera.distance,clamp(c.baseDistance+separation*c.separationScale,c.minDistance,c.maxDistance),c.zoomSmoothing);const horizontal=this.camera.distance*c.horizontalDistanceScale;this.camera.eye=[this.camera.x+Math.sin(yaw)*horizontal,c.heightBase+this.camera.distance*c.heightDistanceScale,this.camera.z+Math.cos(yaw)*horizontal];this.camera.target=[this.camera.x,c.targetHeight+Math.max(a.y,b.y)*c.jumpTargetScale,this.camera.z];this.cameraShake*=.86;if(this.cameraShake<.15)this.cameraShake=0}
  burst(x,z,color,count,y){for(let index=0;index<count;index++){const angle=Math.random()*Math.PI*2,speed=60+Math.random()*155;this.particles.push({x,z,y,vx:Math.cos(angle)*speed,vz:Math.sin(angle)*speed,vy:20+Math.random()*110,life:.25+Math.random()*.27,maxLife:.52,size:3+Math.random()*7,color})}}
  updateParticles(dt){for(const particle of this.particles){particle.life-=dt;particle.x+=particle.vx*dt;particle.z+=particle.vz*dt;particle.y+=particle.vy*dt;particle.vy-=260*dt}this.particles=this.particles.filter(particle=>particle.life>0)}

  draw(){
    const r=this.renderer,c=this.stage.camera,shake=this.cameraShake,eye=[this.camera.eye[0]+(Math.random()-.5)*shake,this.camera.eye[1]+(Math.random()-.5)*shake*.45,this.camera.eye[2]+(Math.random()-.5)*shake];r.begin({eye,target:this.camera.target,fov:c.fov,clear:c.clear,fogColor:c.fogColor,fogRange:c.fogRange});drawArenaStage(r,this.stage);this.drawShadows(r);this.drawCombatEffects(r);this.drawSpecials(r);for(const particle of [...this.particles].sort((a,b)=>this.cameraDistance(b)-this.cameraDistance(a)))r.billboard({x:particle.x,y:particle.y,z:particle.z,size:particle.size,color:particle.color,alpha:clamp(particle.life/particle.maxLife,0,1)});const sorted=[...this.fighters].sort((a,b)=>this.cameraDistance(b)-this.cameraDistance(a));this.drawFighterLayer(sorted);
  }
  cameraDistance(object){return Math.hypot(object.x-this.camera.eye[0],(object.y||0)-this.camera.eye[1],object.z-this.camera.eye[2])}

  drawShadows(r){for(const fighter of this.fighters)r.disc({x:fighter.x,y:5,z:fighter.z,rx:40,rz:27,color:'#000000',alpha:clamp(.42-fighter.y/900,.16,.42)});for(const projectile of this.projectiles)r.disc({x:projectile.x,y:5,z:projectile.z,rx:projectile.radius*.65,rz:projectile.radius*.42,color:projectile.color,alpha:.17})}
  drawCombatEffects(r){for(const fighter of this.fighters){if(fighter.moving&&fighter.grounded){const length=28;r.segment({x:fighter.x,y:7,z:fighter.z},{x:fighter.x+fighter.moveX*length,y:7,z:fighter.z+fighter.moveZ*length},{width:7,height:2,color:fighter.accent,alpha:.42,lit:false})}if(fighter.attackState){const state=fighter.attackState,def=state.def,active=state.elapsed>=def.activeStart&&state.elapsed<=def.activeEnd,pulse=active?1:clamp(1-Math.abs(state.elapsed-def.activeStart)/.15,0,.5),start={x:fighter.x,y:68+fighter.y,z:fighter.z},end={x:fighter.x+state.aimX*(def.range*.78),y:68+fighter.y,z:fighter.z+state.aimZ*(def.range*.78)};r.segment(start,end,{width:8+18*pulse,height:6,color:fighter.accent,alpha:.25+.55*pulse,lit:false})}if(fighter.block)r.billboard({x:fighter.x,y:52+fighter.y,z:fighter.z,size:118,color:fighter.blockAge<=PERFECT_BLOCK_WINDOW?'#fff2a3':'#8cecff',alpha:fighter.blockAge<=PERFECT_BLOCK_WINDOW?.28:.18});if(fighter.guardBreak>0)r.billboard({x:fighter.x,y:72+fighter.y,z:fighter.z,size:145,color:'#ffd86b',alpha:.2})}}
  drawSpecials(r){const owner=this.fighters[0],ownerFrame=frameFor(owner);for(const clone of this.agonyClones){const alpha=clamp(clone.life/.45,0,.62),cloneColor=clone.color||'#6ebcff';if(ownerFrame&&owner.asset)r.sprite({x:clone.x,y:-13,z:clone.z,width:172,height:172,texture:owner.asset.texture,source:ownerFrame.source,atlasWidth:ownerFrame.atlas.width,atlasHeight:ownerFrame.atlas.height,flipX:false,color:cloneColor,alpha});else r.billboard({x:clone.x,y:62,z:clone.z,size:94,color:cloneColor,alpha:.34});r.disc({x:clone.x,y:5,z:clone.z,rx:32,rz:22,color:cloneColor,alpha:.24})}for(const projectile of this.projectiles){const size=projectile.ultimate?118:projectile.volley?38:52;r.segment({x:projectile.trailX,y:projectile.trailY,z:projectile.trailZ},{x:projectile.x,y:projectile.y,z:projectile.z},{width:projectile.ultimate?28:10,height:projectile.ultimate?18:6,color:projectile.color,alpha:projectile.ultimate?.72:.5,lit:false});r.billboard({x:projectile.x,y:projectile.y,z:projectile.z,size,color:projectile.color,alpha:.92})}if(owner.lens>0){const pulse=1+Math.sin(performance.now()/90)*.09;r.billboard({x:owner.x,y:72+owner.y,z:owner.z,size:150*pulse,color:'#d8fbff',alpha:.13});r.disc({x:owner.x,y:7,z:owner.z,rx:58*pulse,rz:39*pulse,color:'#8beeff',alpha:.22})}}
  clearFighterLayer(){
    const context=this.fighterContext;
    if(!context)return;
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.clearRect(0,0,this.fighterCanvas.width,this.fighterCanvas.height);
    context.restore();
  }

  fighterScreenRect(fighter,frame=null){
    const source=frame?.source||[0,0,192,192],sourceWidth=source[2]||192,sourceHeight=source[3]||192;
    const ground=this.renderer.project(fighter.x,fighter.y,fighter.z);
    const top=this.renderer.project(fighter.x,fighter.y+190,fighter.z);
    const center=this.renderer.project(fighter.x,fighter.y+95,fighter.z);
    const height=clamp(Math.abs(ground.y-top.y),72,188);
    const width=height*(sourceWidth/sourceHeight);
    const pivotY=frame?.frame?.groundPivot?.[1]??178;
    return{x:center.x-width/2,y:ground.y-height*(pivotY/sourceHeight),width,height,visible:ground.visible&&top.visible};
  }

  drawFighterLayer(fighters){
    const context=this.fighterContext;
    if(!context)return;
    context.save();
    context.setTransform(1,0,0,1,0,0);
    context.clearRect(0,0,this.fighterCanvas.width,this.fighterCanvas.height);
    context.restore();
    context.save();
    context.setTransform(FIGHTER_RENDER_SCALE,0,0,FIGHTER_RENDER_SCALE,0,0);
    context.imageSmoothingEnabled=true;
    context.imageSmoothingQuality='high';
    for(const fighter of fighters)this.drawFighterSprite2D(context,fighter);
    context.restore();
  }

  drawFighterSprite2D(context,fighter){
    const frame=frameFor(fighter),rect=this.fighterScreenRect(fighter,frame);
    if(!rect.visible||rect.x>W+rect.width||rect.x+rect.width<0||rect.y>H+rect.height||rect.y+rect.height<0)return;
    const alpha=fighter.hp<=0?.72:1;
    context.save();
    context.globalAlpha=alpha;
    context.shadowColor=fighter.flash>0?'rgba(255,105,105,.95)':fighter.accent;
    context.shadowBlur=fighter.flash>0?18:5;
    if(frame&&fighter.asset?.image?.complete&&fighter.asset.image.naturalWidth){
      const [sx,sy,sw,sh]=frame.source;
      const flip=this.flipFor(fighter);

      const drawSource=(source,opacity=1)=>{
        const [drawX,drawY,drawW,drawH]=source;
        context.save();
        context.globalAlpha*=opacity;
        if(flip){
          context.translate(rect.x+rect.width,0);
          context.scale(-1,1);
          context.drawImage(fighter.asset.image,drawX,drawY,drawW,drawH,0,rect.y,rect.width,rect.height);
        }else context.drawImage(fighter.asset.image,drawX,drawY,drawW,drawH,rect.x,rect.y,rect.width,rect.height);
        context.restore();
      };
      drawSource(frame.source,frame.blend?1-frame.blend:1);
      if(frame.nextSource&&frame.blend>0)drawSource(frame.nextSource,frame.blend);
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
export function startArenaBattle(stageId=null){try{if(!instance)instance=new ArenaBattle(stageId||'dojo');if(stageId){instance.setStage(stageId);instance.start()}else instance.showStageSelect()}catch(error){console.error('[Arena 2.5C6]',error);alert(`Arena Battle could not start: ${error.message}`)}}
export{ArenaBattle,ArenaFighter,ATTACKS,animationName,frameFor};
