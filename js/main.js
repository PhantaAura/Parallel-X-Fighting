"use strict";
import {FIGHTER_META,FIGHTER_STATUS,PLAYABLE_ROSTER_IDS,ROSTER,ROSTER_IDS,isMirrorMatch} from './roster.js?v=29a8-kinetic-combat-20260729';
import {STAGES,drawStage} from './stages.js';
import {CUSTOM_CONTROLLER_ACTIONS} from './input.js?v=29a8-kinetic-combat-20260729';
import {sharedInput as input} from './input-runtime.js?v=29a8-kinetic-combat-20260729';
import {decideCPU} from './ai.js';
import {TimerRegistry,clamp,resetCombo} from './combat.js';
import {EffectSystem} from './effects.js';
import {Fighter} from './fighter.js?v=29a8-kinetic-combat-20260729';
import {moveList} from './movesets.js';
import {trainingState,recordInput,clearTraining,resetTrainingClash,resetTrainingWorld,resetTrainingPosition,swapTrainingSides,refillTraining,clearTrainingState,exitTrainingWorld,setTrainingSetting,dummyCommand} from './training.js';
import {byId as $} from './ui.js';
import {clearClash,cpuClashContribution,createClashState,tryProjectileClash,updateClash} from './clash-system.js';
import {applyCamera,createCameraState,updateCamera} from './camera-system.js';
import {clearCinematic,createCinematicState,drawCinematicOverlay,updateCinematic} from './ultimate-system.js';
import {AudioManager} from './audio-manager.js';
import {HapticsManager,MobilePlatformController,loadTouchSettings,saveTouchSettings} from './mobile-platform.js';
import {TouchControls} from './touch-controls.js?v=29a8-kinetic-combat-20260729';
import {TouchSettingsPanel,createDefaultTouchSettings} from './touch-layout-editor.js?v=29a8-kinetic-combat-20260729';
import {FighterVisuals,availableRrvvfoAppearances,isDeveloperSpriteBuild,loadRrvvfoVisualSettings,normalizeRrvvfoAppearance,shouldShowRrvvfoLoadFailure} from './fighter-visuals.js?v=29a8-kinetic-combat-20260729';
import {SpriteDebugViewer} from './sprite-debug-viewer.js';
import {ControllerManager} from './controller-manager.js?v=29a8-kinetic-combat-20260729';
import {BUILD_VERSION} from './build-info.js?v=29a8-kinetic-combat-20260729';
import {ConfirmationDialog} from './confirmation-dialog.js';
import {MainMenu} from './main-menu.js?v=29a8-kinetic-combat-20260729';
import {MatchStatistics} from './match-statistics.js';
import {PauseMenu,simulationCanAdvance} from './pause-menu.js?v=29a8-kinetic-combat-20260729';
import {ResultsScreen} from './results-screen.js';
import {loadQolSettings,saveQolSettings} from './qol-settings.js?v=29a8-kinetic-combat-20260729';
import {NotificationSystem} from './notification-system.js';
import {adaptiveMoveList,renderAdaptiveMoveList} from './move-list.js';
import {SettingsPanel} from './settings-panel.js?v=29a8-kinetic-combat-20260729';
import {importSaveText,resetSaveGroup,stringifySave} from './save-manager.js?v=29a8-kinetic-combat-20260729';
import {LoadingManager} from './loading-manager.js';
import {applyTrainingPreset,loadTrainingPresets,saveTrainingPreset} from './training-presets.js';
import {FirstTimeHints} from './first-time-hints.js';
import {cooldownText,fighterHudModel} from './hud-model.js?v=29a8-kinetic-combat-20260729';
import {AbilityHotbar} from './ability-hotbar.js?v=29a8-kinetic-combat-20260729';
import {loadAbilityHotbarSettings,saveAbilityHotbarSettings} from './ability-hotbar-data.js?v=29a8-kinetic-combat-20260729';
import {ResponsiveGameLayout} from './responsive-game-layout.js?v=29a8-kinetic-combat-20260729';
import {OrientationManager,loadMobilePresentationSettings,saveMobilePresentationSettings} from './orientation-manager.js?v=29a8-kinetic-combat-20260729';
import {FullscreenManager} from './fullscreen-manager.js?v=29a8-kinetic-combat-20260729';

const canvas=$('game'),ctx=canvas.getContext('2d'),WIDTH=canvas.width,HEIGHT=canvas.height,GROUND=430;
const U={start:$('startScreen'),main:$('mainMenuScreen'),menu:$('menuScreen'),game:$('gameScreen'),mode:$('mode'),diff:$('difficulty'),stage:$('stage'),rt:$('roundTime'),rounds:$('rounds'),cine:$('cinematics'),reduced:$('reducedShake'),spriteToggle:$('rrvvfoSprites'),spriteQuality:$('rrvvfoQuality'),spriteDebug:$('rrvvfoSpriteDebug'),prototypeExpose:$('showPrototypeAppearances'),prototypeBuildNote:$('prototypeAppearanceBuildNote'),spriteLoading:$('spriteLoading'),appearancePanels:[$('rrvvfoAppearancePanel1'),$('rrvvfoAppearancePanel2')],appearanceSelects:[$('rrvvfoAppearance1'),$('rrvvfoAppearance2')],appearancePreviews:[$('rrvvfoPreview1'),$('rrvvfoPreview2')],controller1:$('controllerStyle1'),controller2:$('controllerStyle2'),controllerCustom:$('customController'),customSide:$('customSide'),customBindings:$('customBindings'),controllerGuide:$('controllerGuide'),roster:$('roster'),slot1:$('slot1'),slot2:$('slot2'),n1:$('name1'),n2:$('name2'),m1:$('moves1'),m2:$('moves2'),s2l:$('slot2label'),notice:$('notice'),p1n:$('p1name'),p2n:$('p2name'),p1h:$('p1hp'),p2h:$('p2hp'),p1e:$('p1en'),p2e:$('p2en'),p1g:$('p1guard'),p2g:$('p2guard'),p1d:$('p1defense'),p2d:$('p2defense'),p1hpText:$('p1hpText'),p2hpText:$('p2hpText'),p1enText:$('p1enText'),p2enText:$('p2enText'),p1guardText:$('p1guardText'),p2guardText:$('p2guardText'),p1status:$('p1status'),p2status:$('p2status'),timer:$('timer'),rl:$('roundLabel'),msg:$('msg'),mt:$('msgTitle'),mx:$('msgText'),mb:$('msgButton'),pause:$('pause')};
const comboHud=[document.createElement('div'),document.createElement('div')];comboHud.forEach((element,index)=>{element.className=`comboHud c${index+1}`;$('gameWrap').appendChild(element)});
const cooldownHud=[document.createElement('div'),document.createElement('div')];cooldownHud.forEach((element,index)=>{element.className='moveCooldown';(index?U.p2e:U.p1e).parentElement.parentElement.appendChild(element)});
const clashHud=document.createElement('div');clashHud.className='clashHud hidden';clashHud.innerHTML='<strong id="clashLabel">CLASH!</strong><div class="clashTrack"><div class="clashFill" id="clashFill"></div></div>';$('gameWrap').appendChild(clashHud);
const roundBanner=document.createElement('div');roundBanner.id='roundBanner';roundBanner.className='hidden';$('gameWrap').appendChild(roundBanner);
const trainingHud=document.createElement('div');trainingHud.className='trainingHud hidden';trainingHud.innerHTML='<div id="trainStats"></div><div id="trainMoves"></div><div><div id="trainComboPrompt"></div><label><input id="liveHealth" type="checkbox" checked> ∞ HP</label> <label><input id="liveEnergy" type="checkbox" checked> ∞ ENERGY</label> <label><input id="liveGuard" type="checkbox"> ∞ GUARD</label> <label><input id="liveGuardRegen" type="checkbox" checked> GUARD REGEN</label> <label><input id="livePerfectPractice" type="checkbox"> PB PRACTICE</label> <label><input id="liveClash" type="checkbox"> ∞ CLASH</label><br><select id="liveDummy"><option value="never">Stand / Never Block</option><option value="stationary">Stationary</option><option value="jump">Jump</option><option value="walk">Walk</option><option value="always">Block</option><option value="after">Block After First Hit</option><option value="perfect">Perfect Block Attempt</option><option value="counterattack">Counterattack After Hit</option><option value="throw">Throw Attempt</option><option value="breaker">Use Combo Breaker</option><option value="random">Random Defense</option><option value="cpu">CPU Dummy</option></select> <label><input id="stationaryBlock" type="checkbox"> Stationary blocks</label><br><button id="forceClash">FORCE NEXT CLASH</button><button id="resetClash">RESET CLASH</button><button id="trainResetPos">RESET CENTER (Y)</button><button id="trainLeft">NEAR LEFT</button><button id="trainRight">NEAR RIGHT</button><button id="trainSwap">SWAP SIDES</button><button id="trainRefillHealth">REFILL HP</button><button id="trainRefillEnergy">REFILL ENERGY</button><button id="trainRefillGuard">REFILL GUARD</button><button id="trainClearCooldowns">CLEAR COOLDOWNS</button><button id="trainClearProjectiles">CLEAR PROJECTILES</button><button id="trainClearShots">CLEAR SHOTS CLONES</button><button id="trainClearLens">CLEAR LENS</button><button id="trainClearSwap">CLEAR SWAP MARKERS</button><button id="trainResetCombo">CLEAR COMBO</button><button id="trainSavePreset">SAVE PRESET</button><button id="trainLoadPreset">LOAD PRESET</button><button id="trainRestart">QUICK RESTART</button><button id="exitTraining">EXIT TRAINING</button><section class="trainingDrills"><strong>SUGGESTED DRILLS</strong><select id="trainingDrill"><option value="parry">Perfect Parry Window</option><option value="launcher">Launcher Air Route</option><option value="energy">Energy Discipline</option><option value="guard">Guard Pressure & Grab</option><option value="lens">Lens Prediction Read</option></select><button id="applyTrainingDrill">APPLY DRILL</button><small id="trainingDrillStatus">Choose a focused setup.</small></section><div id="trainInputs"></div></div>';$('gameWrap').appendChild(trainingHud);

const SONIC_KO_TARGET=3,CPU_MAX_HEALTH=100;
let selectSlot=1,p1id='rrvvfo',p2id='revvfo',mode='cpu',difficulty='normal',stage='dojo',limit=Infinity,roundsToWin=SONIC_KO_TARGET,currentRound=1,wins1=0,wins2=0,state='menu',paused=false,pauseOwner=1,time=90,last=0,acc=0,roundIntro=0,clashInputActive=false,cinematicInputActive=false,hotbarInfoPausedMatch=false;
let controllerHotbarButtons={left:false,right:false};
const controllerManager=new ControllerManager({input,getState:()=>paused?'menu':state,onPause:({side}={side:1})=>togglePause(side),onDisconnect:({side})=>{setPaused(true,side||1);notifications?.push(`PLAYER ${side||'?'} CONTROLLER DISCONNECTED`,{important:true,key:'controller-disconnected'})},onReconnect:({side})=>{setPaused(true,side);confirmation.open({title:'Controller Reconnected',message:`Controller restored to Player ${side}. Confirm when ready to resume.`,accept:'RESUME'}).then(ok=>{if(ok)setPaused(false)})},onStatus:({type,side})=>updateControllerStatus(type,side),onStyleChange:(side,style)=>syncControllerStyleUi(side,style),onAssignmentClose:()=>{if(paused)showPauseOverlay()}});
U.controller1.value=controllerManager.settings.styles[0];U.controller2.value=controllerManager.settings.styles[1];
let qolSettings=loadQolSettings();
let abilityHotbarSettings=loadAbilityHotbarSettings();
const mobilePresentationSettings=loadMobilePresentationSettings();
const audio=new AudioManager(qolSettings.audio);
const touchSettings=loadTouchSettings(localStorage,createDefaultTouchSettings);
saveTouchSettings(touchSettings);
const haptics=new HapticsManager({mode:()=>touchSettings.haptics});
let orientationManager=null,fullscreenManager=null,abilityHotbar=null;
const mobilePlatform=new MobilePlatformController({onBackPause:()=>setPaused(true),onViewportChange:metrics=>handleViewportChange(metrics)});
const touchControls=new TouchControls({
  root:$('touchLayer'),input,settings:touchSettings,
  onSettingsChange:persistTouchSettings,
  onOpenSettings:openTouchSettings,onPause:()=>togglePause(),
  onMoveList:openTouchMoveList,
  onTrainingReset:()=>{if(trainingState.enabled)resetTrainingWorld(world,input)}
});
const touchSettingsPanel=new TouchSettingsPanel({
  settings:touchSettings,touchControls,platform:mobilePlatform,
  onChange:persistTouchSettings
});
const responsiveLayout=new ResponsiveGameLayout({doc:document,view:window,gameScreen:U.game,gameWrap:$('gameWrap'),canvas,touchRoot:$('touchLayer'),platform:()=>({...mobilePlatform.info,touch:wantsTouchControls(),desktopHotbar:!wantsTouchControls()&&qolSettings.hotbar.desktop!=='hidden'})});
const world={width:WIDTH,height:HEIGHT,ground:GROUND,fighters:[],projectiles:[],effects:new EffectSystem(),timers:new TimerRegistry(),clash:createClashState(),camera:createCameraState(),cinematic:createCinematicState(),cinematicMode:'full',localMode:false,reducedShake:false,shake:0,hitstop:0,training:trainingState,sound,tryProjectileClash};
const developerSpriteBuild=isDeveloperSpriteBuild();
const savedVisuals=loadRrvvfoVisualSettings();
U.spriteToggle.value=savedVisuals.enabled?'on':'off';U.spriteQuality.value=savedVisuals.quality;U.spriteDebug.checked=savedVisuals.developerViewer;U.prototypeExpose.checked=savedVisuals.exposePrototypeAppearances;U.prototypeExpose.disabled=!developerSpriteBuild;U.prototypeBuildNote.textContent='Hood Up has dedicated animation coverage.';
const fighterVisuals=new FighterVisuals({settings:savedVisuals,onStatus:({status})=>{U.spriteLoading.classList.toggle('hidden',status!=='loading')}});
const spriteDebugViewer=new SpriteDebugViewer(fighterVisuals);world.fighterVisuals=fighterVisuals;world.effects.spriteVisuals=fighterVisuals;
const statistics=new MatchStatistics();world.statistics=statistics;
const confirmation=new ConfirmationDialog($('confirmDialog'));
const pauseMenu=new PauseMenu($('pauseMenu'),{onAction:handlePauseAction});
const resultsScreen=new ResultsScreen($('resultsScreen'),{onAction:handleResultAction});
const mainMenu=new MainMenu(U.main,{onSelect:handleMainMenuSelection});
U.main.addEventListener('menumove',()=>sound('menuMove'));U.main.addEventListener('menuselect',event=>{sound('menuConfirm');if(event.detail?.id==='story')audio.startMusic('dojo');else if(event.detail?.id==='arena')audio.startMusic('tournament')});U.main.addEventListener('menuerror',event=>{sound('menuError');notifications?.push(event.detail?.id==='arcade'?'ARCADE MODE • COMING IN PROTOTYPE 3.x':'COMING LATER',{important:true,key:'coming-later'})});
const notifications=new NotificationSystem($('combatNotifications'),{mode:()=>qolSettings.gameplay.combatMessages});world.notifications=notifications;
document.addEventListener('pxperfectparry',event=>{if(event.detail?.engine!=='2d')return;const wrap=$('gameWrap');wrap.classList.remove('perfectParryPulse');void wrap.offsetWidth;wrap.classList.add('perfectParryPulse');setTimeout(()=>wrap.classList.remove('perfectParryPulse'),360)});
orientationManager=new OrientationManager({root:$('orientationPrompt'),settings:mobilePresentationSettings,onChange:saveMobilePresentationSettings,onLayout:metrics=>responsiveLayout.apply(metrics),onNotice:message=>notifications.push(message,{important:true,key:'orientation'}),onPrompt:()=>{if(state==='playing'){setPaused(true);pauseMenu.hide()}},onDismiss:()=>{if(state==='playing'&&wantsTouchControls()){fullscreenManager?.start({touch:true});if(!$('fullscreenPrompt').classList.contains('hidden')){setPaused(true);pauseMenu.hide()}else setPaused(false)}}});
fullscreenManager=new FullscreenManager({root:$('fullscreenPrompt'),element:U.game,settings:mobilePresentationSettings,onChange:saveMobilePresentationSettings,onLayout:()=>responsiveLayout.apply(),onUnexpectedExit:()=>{if(state==='playing')setPaused(true)},onNotice:message=>notifications.push(message,{important:true,key:'fullscreen'}),onDismiss:()=>{if(state==='playing')setPaused(false)}});
abilityHotbar=new AbilityHotbar({root:$('abilityHotbar'),input,settings:{...abilityHotbarSettings,...qolSettings.hotbar},getFighter:()=>world.fighters[0],getWorld:()=>world,getDevice:()=>input.lastInputDevice[0],notify:(message,options)=>notifications.push(message,options),onChange:settings=>{abilityHotbarSettings=settings;saveAbilityHotbarSettings(settings);syncHotbarCustomize()},onInfo:()=>{if(qolSettings.hotbar.pauseForInfo&&mode!=='local'&&state==='playing'){hotbarInfoPausedMatch=!paused;if(hotbarInfoPausedMatch)setPaused(true);pauseMenu.hide()}},onInfoClose:()=>{if(hotbarInfoPausedMatch){hotbarInfoPausedMatch=false;setPaused(false)}else if(paused)showPauseOverlay()}});
const loadingManager=new LoadingManager($('loadingScreen'),{onRetry:()=>startGame(),onReturn:()=>showMainMenu()});
const settingsPanel=new SettingsPanel($('settingsPanel'),{settings:qolSettings,onApply:applyQolSettings,onAction:handleSettingsAction});
const firstTimeHints=new FirstTimeHints({input,enabled:()=>qolSettings.gameplay.firstTimeHints});let hintTimer=360;

function sound(cue=220,duration=.05,type='square',volume=.03){if(typeof cue==='string'){audio.play(cue);haptics.trigger(cue)}else audio.tone(cue,duration,type,volume)}
function updateControllerStatus(type,side){const connected=type==='connected';$('inputStatus').textContent=connected?`Controller connected${side?` • Player ${side}`:''}`:'Controller disconnected';audio.play(connected?'controllerConnected':'controllerDisconnected');if(typeof notifications!=='undefined')notifications.push(connected?'CONTROLLER CONNECTED':'CONTROLLER DISCONNECTED',{important:true,key:`controller-${type}`})}
function different(id){const choices=PLAYABLE_ROSTER_IDS.filter(candidate=>candidate!==id);return choices[Math.floor(Math.random()*choices.length)]}
function clearTransient(){world.timers.cancelAll();world.projectiles.length=0;world.effects.clear();clearClash(world);clearCinematic(world);world.fighterVisuals.resetAll();world.shake=0;world.hitstop=0;clashInputActive=false;cinematicInputActive=false;touchControls.setClashState(false);input.clearBuffers()}
function wantsTouchControls(){return touchSettings.touchMode==='on'||(touchSettings.touchMode!=='off'&&mobilePlatform.shouldUseTouch())}
function handleViewportChange(metrics){touchControls?.applySettings?.();responsiveLayout?.apply?.(metrics);orientationManager?.handleChange?.(metrics);abilityHotbar?.render?.(true)}
function pauseOptions(){return{training:trainingState.enabled,touch:wantsTouchControls(),fullscreen:!!fullscreenManager?.isFullscreen?.(),owner:pauseOwner,local:mode==='local'}}
function showPauseOverlay(){pauseMenu.show(pauseOptions())}
function applyTouchAvailability(){
  if(state!=='playing')return;
  const wanted=wantsTouchControls();
  if(wanted){
    if(!touchControls.enabled)touchControls.startMatch({training:trainingState.enabled,show:true});
    touchControls.setCombatControlsHidden(false);touchControls.applySettings();$('touchLayer').classList.add('hotbar-enabled');abilityHotbar.setVisible(true,true);mobilePlatform.activateMatch();responsiveLayout.apply();
  }else if(touchControls.enabled){
    // Keep Settings and Pause reachable if touch is disabled in the middle of a match.
    touchControls.setCombatControlsHidden(true);$('touchLayer').classList.remove('hotbar-enabled');abilityHotbar.setVisible(true,false);mobilePlatform.deactivateMatch();responsiveLayout.apply();
  }
}
function mobileOnboardingVisible(){return['touchChoice','touchTutorial'].some(id=>!$(id)?.classList.contains('hidden'))}
function beginMobilePresentation(){
  if(state!=='playing'||!wantsTouchControls()||mobileOnboardingVisible())return;
  orientationManager.start({touch:true});
  if($('orientationPrompt').classList.contains('hidden'))fullscreenManager.start({touch:true});
  if(!$('orientationPrompt').classList.contains('hidden')||!$('fullscreenPrompt').classList.contains('hidden')){setPaused(true);pauseMenu.hide()}else setPaused(false);
}
function persistTouchSettings(settings,meta={}){saveTouchSettings(settings);applyTouchAvailability();if(meta.choice||meta.tutorial)setTimeout(beginMobilePresentation,0)}

function applyQolSettings(settings,{persist=true}={}){
  qolSettings=settings;audio.configure(settings.audio);if(persist)saveQolSettings(settings);
  document.body.classList.toggle('skipMenuAnimations',settings.menu.skipAnimations);document.body.classList.toggle('reducedMotion',settings.menu.reducedMotion);document.body.classList.toggle('backgroundMotionOff',settings.accessibility.backgroundMotion==='off'||settings.video.backgroundMotion==='off');document.body.classList.toggle('highContrastHud',settings.accessibility.highContrastHud);document.body.classList.toggle('largeHudText',settings.accessibility.largerHudText);document.body.classList.toggle('smoothSprites',settings.video.spriteSmoothing);document.body.classList.toggle('desktop-hotbar-hidden',settings.hotbar.desktop==='hidden');$('hud').dataset.hudMode=settings.hud.mode==='auto'&&mobilePlatform.info.touch?'compact':settings.hud.mode;world.reducedShake=settings.accessibility.cameraShake!=='full'||U.reduced.checked;world.shakeScale=settings.accessibility.cameraShake==='off'?0:settings.accessibility.cameraShake==='reduced'?0.35:1;world.flashScale=settings.accessibility.screenFlash==='off'?0:settings.accessibility.screenFlash==='reduced'?0.45:1;world.hitFlashScale=settings.accessibility.hitFlash==='off'?0:settings.accessibility.hitFlash==='reduced'?0.45:1;world.strongOutlines=settings.accessibility.strongOutlines;const particleCaps={low:100,medium:220,high:420,automatic:mobilePlatform.info.touch?160:320};world.effects.configure({particleCap:particleCaps[settings.video.quality]});$('fpsDisplay').classList.toggle('hidden',!settings.developer.fps);abilityHotbarSettings={...abilityHotbarSettings,...settings.hotbar};saveAbilityHotbarSettings(abilityHotbarSettings);abilityHotbar?.configure(abilityHotbarSettings);responsiveLayout?.apply();renderQuickContinue();
}
function openSettingsPanel(category='Gameplay'){settingsPanel.open(category)}
function closeSettingsPanel(){settingsPanel.close();$('settingsPanel').classList.add('hidden');if(paused)showPauseOverlay()}
async function requestCloseSettings(){if(settingsPanel.dirty&&!await confirmation.open({title:'Discard Unsaved Changes?',message:'Changes not applied will be lost.',accept:'DISCARD'}))return;closeSettingsPanel()}
function handleSettingsAction(action){
  if(action==='audioTest'){audio.test();return}
  if(action==='resetHints'){firstTimeHints.reset();notifications.push('FIRST-TIME HINTS RESET',{important:true,key:'hints-reset'});return}
  if(action==='touchPanel'){openTouchSettings();return}
  if(action==='controllerTest'){$('controllerTestButton').click();return}
  if(action==='controllerStyle'){closeSettingsPanel();openCharacterSelect(U.mode.value);U.controller1.focus();return}
  if(action==='controllerReconnect'){closeSettingsPanel();pauseMenu.hide();controllerManager.openAssignments();return}
  if(action==='restoreHotbar'){abilityHotbar.restoreDefaults();notifications.push('HOTBAR DEFAULTS RESTORED',{important:true,key:'hotbar-restore'});return}
  if(action==='exportSave'){const blob=new Blob([stringifySave()],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='parallels-x-save.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),500);return}
  if(action==='importSave'){const text=prompt('Paste exported Parallels X save JSON. Your current save is preserved if validation fails.');if(text===null)return;confirmation.open({title:'Import Save?',message:'Validated settings and progress will replace matching saved data.',accept:'IMPORT'}).then(ok=>{if(!ok)return;const result=importSaveText(text);notifications.push(result.ok?'Save imported. Reload to apply all settings.':result.error,{important:true,key:'save-import'});if(result.ok)location.reload()});return}
  const group=action==='resetSettings'?'settings':action==='resetTraining'?'training':action==='resetAll'?'all':null;if(group)confirmation.open({title:group==='all'?'Reset All Save Data?':'Reset Saved Data?',message:'This action cannot be undone after confirmation.',accept:'RESET'}).then(ok=>{if(!ok)return;resetSaveGroup(group);if(group==='all'||group==='settings')location.reload();else notifications.push('Training presets reset.',{important:true})});
}
function openAdaptiveMoveList(fighterId=p1id,side=1,device){const model=adaptiveMoveList({fighterId,input,side,device});$('moveListHeading').textContent=`${model.name.toUpperCase()} MOVE LIST`;$('adaptiveMoveList').innerHTML=renderAdaptiveMoveList(model);$('moveListPanel').classList.remove('hidden');$('closeMoveList').focus()}
function closeAdaptiveMoveList(){$('moveListPanel').classList.add('hidden');if(paused)showPauseOverlay()}
function controlsModel(side){const device=input.lastInputDevice[side-1],style=input.inputStyleName(side,device),movement=device==='controller'?(side===1?'Left Stick • D-Pad L/R selects abilities':'Left Stick / D-Pad'):device==='touch'?(touchSettings.movement==='dpad'?'Virtual D-Pad':'Virtual Joystick'):(side===1?'W / A / S / D':'Arrow Keys');const rows=[['Movement',movement],['Interact',input.actionLabel(side,'i',{device})],['Jump',input.actionLabel(side,'j',{device})],['Block',input.actionLabel(side,'b',{device})],['Light',input.actionLabel(side,'a',{device})],['Heavy',input.actionLabel(side,'h',{device})],['Launcher',input.actionLabel(side,'x',{device})],['Grab',input.actionLabel(side,'s',{device})],['Charge',input.actionLabel(side,'k',{device})],['Dash',input.actionLabel(side,'d',{device})],['Combo Breaker',input.actionLabel(side,'q',{device})],['Counter',input.actionLabel(side,'c',{device})],['Selected Ability',input.actionLabel(side,'u',{device})],['Lens',input.actionLabel(side,'n',{device})]];return{side,style,rows}}
function openControlsPanel(){const sides=mode==='local'?[1,2]:[1],models=sides.map(controlsModel);$('controlsPanelBody').innerHTML=`<div class="controlsSummary">${models.map(model=>`<section><h3>PLAYER ${model.side} — ${model.style.toUpperCase()}</h3><dl>${model.rows.map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`).join('')}</div><p class="moveListNote">Controller assignments: Player 1 — ${controllerManager.settings.assignments[0]===null?'Keyboard / Auto':`Controller ${controllerManager.settings.assignments[0]+1}`} • Player 2 — ${controllerManager.settings.assignments[1]===null?'Keyboard / Auto':`Controller ${controllerManager.settings.assignments[1]+1}`}</p>`;$('controlsPanel').classList.remove('hidden');$('closeControlsPanel').focus()}
function closeControlsPanel(){$('controlsPanel').classList.add('hidden');if(paused)showPauseOverlay()}
function openExtrasPanel(section='version'){$('extrasPanel').classList.remove('hidden');showExtra(section)}
function showExtra(section){const content=$('extrasContent');if(section==='manual'){import('./story/combat-manual.js?v=29a8-kinetic-combat-20260729').then(({openCombatManual})=>{openCombatManual({grantPublic:true,onClose:()=>{$('extrasPanel').classList.remove('hidden')}});$('extrasPanel').classList.add('hidden')});return}if(section==='moves'){openAdaptiveMoveList(p1id,1);return}if(section==='profiles')content.innerHTML=Object.entries(ROSTER).map(([id,fighter])=>`<p><strong>${fighter.n}</strong> — ${FIGHTER_META[id].style} <small>• ${FIGHTER_STATUS[id]?.label||'PROTOTYPE'}</small></p>`).join('');else if(section==='stages')content.innerHTML=Object.entries(STAGES).map(([id,data])=>`<p><strong>${data.n}</strong> — ${STAGE_DETAILS[id].description}</p>`).join('');else if(section==='controls'){openControlsPanel();return}else if(section==='credits')content.innerHTML='<strong>Parallels X: Clash of Souls</strong><p>Original characters and game direction by the Parallels X creator. Browser prototype engineering developed collaboratively with Codex.</p>';else content.innerHTML=`<strong>${BUILD_VERSION}</strong><p>Combat 2.9A.8 • Kinetic movement • Pursuit combos • Unique normals • Shot/Power/Trick techniques • Momentum Finishers • Fair ring-outs</p>`}

const STARTED_KEY='pxQolStartSeen';
const LAST_ACTIVITY_KEY='pxQolLastActivity';
const STAGE_DETAILS={
  dojo:{description:'Warm dojo lighting and focused sparring space.',boundary:'Closed arena',performance:'Light'},
  tournament:{description:'A tournament ring surrounded by a lively crowd.',boundary:'Closed tournament ring',performance:'Light'},
  asrylyte:{description:'Unstable pink and purple cosmic distortion.',boundary:'Closed dimensional field',performance:'Effects-heavy'},
  clonebase:{description:'Machinery, clone tanks, and mechanical lighting.',boundary:'Closed laboratory',performance:'Medium'},
  hell:{description:'Dark heat distortion and supernatural atmosphere.',boundary:'Closed arena',performance:'Effects-heavy'}
};
let stageReturnTarget='character';

function hideMenuLayers(){U.start.classList.add('hidden');U.main.classList.add('hidden');U.menu.classList.add('hidden')}
function showMainMenu(){
  if(state==='playing'||state==='over')cleanupMatchForNavigation();
  state='menu';paused=false;hideMenuLayers();U.main.classList.remove('hidden');resultsScreen.hide();pauseMenu.hide();confirmation.close();renderQuickContinue();audio.startMusic('menu');
}
function openCharacterSelect(modeValue=U.mode.value){
  hideMenuLayers();U.menu.classList.remove('hidden');U.mode.value=modeValue;U.mode.dispatchEvent(new Event('change'));state='menu';refreshSelection();
}
function handleMainMenuSelection(id){
  if(['cpu','local','training'].includes(id)){openCharacterSelect(id);return}
  if(id==='settings'){openSettingsPanel();return}
  if(id==='extras'){openExtrasPanel();return}
  if(id==='credits'){openExtrasPanel('credits')}
}
let startActivationPromise=null;
let startActivated=false;
function activateStartOnce(){
  if(startActivated||U.start.classList.contains('hidden'))return startActivationPromise||Promise.resolve(false);
  startActivated=true;
  startActivationPromise=(async()=>{
    localStorage.setItem(STARTED_KEY,'1');
    U.start.classList.add('hidden');
    U.main.classList.remove('hidden');
    state='menu';
    mainMenu.render();
    controllerManager.promptAfterStart();
    const enabled=await audio.enable();
    $('audioEnableNotice')?.classList.toggle('hidden',enabled);
    if(enabled)await audio.startMusic('menu');
    return true;
  })().catch(error=>{
    console.warn('[Start Screen] Audio initialization failed',error);
    return false;
  });
  return startActivationPromise;
}
function saveLastActivity(){
  const data={mode:U.mode.value,p1id,p2id,stage:U.stage.value,difficulty:U.diff.value,at:Date.now()};localStorage.setItem(LAST_ACTIVITY_KEY,JSON.stringify(data));
}
function renderQuickContinue(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(LAST_ACTIVITY_KEY)||'null')}catch{}
  const legacyStory=saved?.mode==='story';
  const enabled=qolSettings.menu.showQuickContinue&&saved&&saved.mode&&(legacyStory||(saved.p1id&&saved.stage));$('quickContinue').classList.toggle('hidden',!enabled);if(!enabled)return;
  $('quickContinueTitle').textContent=legacyStory?'RETURN TO STORY':saved.mode==='training'?'RETURN TO TRAINING':`CONTINUE ${String(saved.mode).toUpperCase()}`;
  $('quickContinueDetails').textContent=legacyStory?'Open the current Rrvvfo chapter route.':`Last Fighter: ${ROSTER[saved.p1id]?.n||saved.p1id} • Last Stage: ${STAGES[saved.stage]?.n||saved.stage}`;
  $('quickContinueButton').onclick=()=>{
    if(legacyStory){mainMenu.select('story');mainMenu.confirm();return}
    p1id=PLAYABLE_ROSTER_IDS.includes(saved.p1id)?saved.p1id:p1id;p2id=PLAYABLE_ROSTER_IDS.includes(saved.p2id)?saved.p2id:p2id;U.stage.value=STAGES[saved.stage]?saved.stage:'dojo';U.diff.value=saved.difficulty||'normal';openCharacterSelect(saved.mode)
  };
}
function cleanupMatchForNavigation(){
  if(trainingState.enabled)exitTrainingWorld(world,input);else{clearTransient();input.clear()}
  touchControls.stopMatch();mobilePlatform.deactivateMatch();orientationManager.stop();fullscreenManager.stop();fullscreenManager.exit();abilityHotbar.setVisible(false);document.body.classList.remove('gameplay-active');spriteDebugViewer.hide();trainingHud.classList.add('hidden');trainingState.enabled=false;paused=false;hotbarInfoPausedMatch=false;U.game.classList.add('hidden');U.msg.classList.add('hidden');pauseMenu.hide();resultsScreen.hide();
}
function openStageSelect(returnTarget='character'){
  stageReturnTarget=returnTarget;const cards=$('stageCards');cards.innerHTML=`<button class="stageCard" data-stage-card="random"><strong>RANDOM STAGE</strong><small>Choose any current stage</small></button>`+Object.entries(STAGES).map(([id,data])=>`<button class="stageCard ${id===stage?'selected':''}" data-stage-card="${id}"><strong>${data.n}</strong><small>${STAGE_DETAILS[id].description}</small><small>${STAGE_DETAILS[id].boundary} • Ring-out disabled</small><small>Performance: ${STAGE_DETAILS[id].performance}</small></button>`).join('');
  cards.querySelectorAll('[data-stage-card]').forEach(button=>button.onclick=()=>{cards.querySelectorAll('.stageCard').forEach(card=>{card.classList.remove('selected');delete card.dataset.selected});button.classList.add('selected');button.dataset.selected='true'});$('stageSelectPanel').classList.remove('hidden');cards.querySelector('.selected,.stageCard')?.focus();
}
function closeStageSelect(confirm=false){
  if(confirm){const selected=$('stageCards').querySelector('[data-selected=true]')||$('stageCards').querySelector('.selected');let chosen=selected?.dataset.stageCard||stage;if(chosen==='random')chosen=Object.keys(STAGES)[Math.floor(Math.random()*Object.keys(STAGES).length)];stage=chosen;U.stage.value=chosen}
  $('stageSelectPanel').classList.add('hidden');
  if(confirm&&['results','pause'].includes(stageReturnTarget)){resultsScreen.hide();currentRound=1;wins1=wins2=0;statistics.reset();setup()}else if(!confirm&&stageReturnTarget==='pause')showPauseOverlay();
}

async function handlePauseAction(action){
  if(action==='resume'){setPaused(false);return}
  if(action==='moves'){openAdaptiveMoveList(p1id,1);return}
  if(action==='controls'){openControlsPanel();return}
  if(action==='training'){trainingHud.classList.remove('hidden');pauseMenu.hide();return}
  if(action==='touch'){pauseMenu.hide();openTouchSettings();return}
  if(action==='exitFullscreen'){await fullscreenManager.exit();showPauseOverlay();return}
  if(action==='settings'){pauseMenu.hide();openSettingsPanel();return}
  if(action==='restart'){
    if(trainingState.enabled){resetTrainingWorld(world,input);setPaused(false);return}
    if(await confirmation.open({title:'Restart Match?',message:'Restart with the same fighters, stage, rules, and devices?',accept:'RESTART'})){currentRound=1;wins1=wins2=0;statistics.reset();setup()}return;
  }
  if(action==='character'){
    if(await confirmation.open({title:'Return to Character Select?',message:'The current match will end. Match rules and device assignments will be preserved.',accept:'CHANGE CHARACTER'}))returnToCharacterSelect();return;
  }
  if(action==='stage'){
    if(await confirmation.open({title:'Change Stage?',message:'The current match will restart after a new stage is selected.',accept:'CHOOSE STAGE'})){pauseMenu.hide();openStageSelect('pause')}return;
  }
  if(action==='quit'&&await confirmation.open({title:'Quit Match?',message:'Return to Mode Select and end this match?',accept:'QUIT'}))showMainMenu();
}
function handleResultAction(action){
  if(action==='rematch'){resultsScreen.hide();currentRound=1;wins1=wins2=0;statistics.reset();setup();return}
  if(action==='character'){returnToCharacterSelect();return}
  if(action==='stage'){openStageSelect('results');return}
  if(action==='mode'||action==='main')showMainMenu();
}

function setPaused(next,owner=pauseOwner){
  if(state!=='playing')return;
  paused=!!next;if(paused){pauseOwner=owner||1;releaseStandardMouse()}input.clearBuffers();touchControls.releaseAll();touchControls.setPaused(paused);abilityHotbar.root?.classList.toggle('hotbar-paused',paused);U.pause.classList.add('hidden');$('touchPause').textContent=paused?'▶':'Ⅱ';if(paused)showPauseOverlay();else pauseMenu.hide();
}
function togglePause(owner=1){setPaused(!paused,owner)}
function openTouchSettings(){if(state==='playing')setPaused(true);touchSettingsPanel.open()}
function openTouchMoveList(){
  if(state==='playing')setPaused(true);openAdaptiveMoveList(p1id,1,'touch');
}
function syncHotbarCustomize(){
  const select=$('hotbarAbilitySelect');if(!select||!abilityHotbar)return;const selected=select.value,entries=abilityHotbar.entries();select.innerHTML=entries.map((entry,index)=>`<option value="${entry.id}">Slot ${index+1} — ${entry.label}</option>`).join('');if(entries.some(entry=>entry.id===selected))select.value=selected;$('hotbarLayoutLocked').checked=abilityHotbar.settings.locked;
}
function openHotbarCustomize(){if(state==='playing'&&!paused)setPaused(true);pauseMenu.hide();syncHotbarCustomize();$('hotbarCustomizeModal').classList.remove('hidden');$('hotbarAbilitySelect').focus()}
function closeHotbarCustomize(){$('hotbarCustomizeModal').classList.add('hidden');if(paused)showPauseOverlay()}
function persistHotbarUi(){abilityHotbarSettings={...abilityHotbar.settings};qolSettings.hotbar={...qolSettings.hotbar,desktop:abilityHotbarSettings.desktop,text:abilityHotbarSettings.text,size:abilityHotbarSettings.size,customScale:abilityHotbarSettings.customScale,cooldown:abilityHotbarSettings.cooldown,activation:abilityHotbarSettings.activation,opacity:abilityHotbarSettings.opacity,locked:abilityHotbarSettings.locked,pauseForInfo:abilityHotbarSettings.pauseForInfo};saveAbilityHotbarSettings(abilityHotbarSettings);saveQolSettings(qolSettings);settingsPanel.settings=qolSettings;abilityHotbar.configure(abilityHotbarSettings);syncHotbarCustomize()}

function buildRoster(){
  U.roster.innerHTML='';
  const playableGroup=document.createElement('div');playableGroup.className='rosterGroup playableRoster';playableGroup.setAttribute('aria-label','Playable fighters');
  const coming=document.createElement('details');coming.className='comingSoonRoster';
  const summary=document.createElement('summary');summary.textContent=`COMING SOON FIGHTERS • ${ROSTER_IDS.length-PLAYABLE_ROSTER_IDS.length}`;coming.appendChild(summary);
  const lockedGroup=document.createElement('div');lockedGroup.className='rosterGroup lockedRoster';coming.appendChild(lockedGroup);
  for(const id of ROSTER_IDS){
    const c=ROSTER[id],meta=FIGHTER_META[id],status=FIGHTER_STATUS[id]||{id:'in-development',label:'COMING SOON',selectable:false},playable=PLAYABLE_ROSTER_IDS.includes(id)&&status.selectable!==false;
    const button=document.createElement('button');button.className=`card ${playable?'':'lockedFighter'}`;button.dataset.id=id;button.dataset.status=status.id;button.disabled=!playable;button.setAttribute('aria-disabled',String(!playable));button.title=playable?`${c.s} • ${c.u} • ${status.label}`:`${c.n} is still in development`;
    button.innerHTML=`<span class="fighterStatus">${playable?status.label:'COMING SOON'}</span><div class="portrait"><div class="head" style="background:${c.h}"></div><div class="body" style="background:${c.c};box-shadow:0 0 12px ${c.a}66"></div></div><b>${c.n.toUpperCase()}</b><div class="origin">${c.o}</div><div class="style">${playable?meta.style:'MOVESET AND VISUALS IN DEVELOPMENT'}</div><div class="rating">${playable?'◆'.repeat(meta.difficulty)+'◇'.repeat(5-meta.difficulty):'LOCKED'}</div>`;
    if(playable)button.onclick=()=>choose(id);
    (playable?playableGroup:lockedGroup).appendChild(button);
  }
  U.roster.append(playableGroup,coming);
  refreshSelection()
}
function choose(id){if(selectSlot===1){if(isMirrorMatch(id,p2id)){p2id=different(id);U.notice.textContent='Mirror matches are disabled, so Player 2 changed.'}p1id=id}else{if(isMirrorMatch(id,p1id)){U.notice.textContent='You cannot use the same character on both sides.';return}p2id=id}refreshSelection()}
function appearanceSlot(side,modeValue=U.mode.value){if(modeValue==='training')return side===1?'trainingPlayer1':'trainingDummy';return side===1?'player1':'player2'}
function prototypeAppearanceAllowed(){return true}
function selectedAppearance(side){
  const saved=fighterVisuals.settings.appearances?.[appearanceSlot(side)]||'down';
  return normalizeRrvvfoAppearance(saved,{allowPrototype:prototypeAppearanceAllowed()});
}
async function refreshAppearancePreview(side){
  const index=side-1,canvas=U.appearancePreviews[index];
  if(!(await fighterVisuals.preloadPreview()).ready){canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);return}
  fighterVisuals.drawPreview(canvas,U.appearanceSelects[index].value);
}
function refreshAppearancePanels(){
  const ids=[p1id,p2id],options=availableRrvvfoAppearances({developerMode:developerSpriteBuild,exposePrototype:fighterVisuals.settings.exposePrototypeAppearances});
  for(let side=1;side<=2;side++){
    const index=side-1,panel=U.appearancePanels[index],select=U.appearanceSelects[index],visible=ids[index]==='rrvvfo';
    panel.classList.toggle('hidden',!visible);if(!visible)continue;
    const wanted=selectedAppearance(side);select.innerHTML='';
    for(const appearance of options){const option=document.createElement('option');option.value=appearance.id;option.textContent=appearance.label;select.appendChild(option)}
    select.value=options.some(option=>option.id===wanted)?wanted:'down';
    panel.querySelector('.appearanceWarning').classList.add('hidden');
    refreshAppearancePreview(side);
  }
}
function setAppearance(side,value){
  const appearances={...fighterVisuals.settings.appearances,[appearanceSlot(side)]:normalizeRrvvfoAppearance(value,{allowPrototype:prototypeAppearanceAllowed()})};
  fighterVisuals.configure({appearances});refreshAppearancePanels();
}
function refreshSelection(){const a=ROSTER[p1id],b=ROSTER[p2id];U.n1.textContent=a.n.toUpperCase();U.n2.textContent=b.n.toUpperCase();U.m1.textContent=`${FIGHTER_META[p1id].style} • ${a.s} • ${a.u}`;U.m2.textContent=`${FIGHTER_META[p2id].style} • ${b.s} • ${b.u}`;U.slot1.classList.toggle('active',selectSlot===1);U.slot2.classList.toggle('active',selectSlot===2);document.querySelectorAll('.card').forEach(card=>{card.classList.toggle('p1',card.dataset.id===p1id);card.classList.toggle('p2',card.dataset.id===p2id)});refreshAppearancePanels()}

function playerOneGamepad(){
  if(typeof navigator==='undefined'||typeof navigator.getGamepads!=='function')return null;
  const pads=navigator.getGamepads()||[],assignment=input.getControllerAssignment(1);
  return pads[assignment===null?0:assignment]||null;
}
function controllerHotbarDirectionHeld(action){
  const pad=playerOneGamepad();
  if(!pad)return false;
  return action==='l'?Boolean(pad.buttons?.[14]?.pressed):action==='r'?Boolean(pad.buttons?.[15]?.pressed):false;
}
function updateControllerHotbarSelection(){
  const pad=playerOneGamepad();
  const left=Boolean(pad?.buttons?.[14]?.pressed),right=Boolean(pad?.buttons?.[15]?.pressed);
  if(state==='playing'&&!paused){
    if(left&&!controllerHotbarButtons.left)abilityHotbar.moveSelection(-1);
    if(right&&!controllerHotbarButtons.right)abilityHotbar.moveSelection(1);
  }
  controllerHotbarButtons={left,right};
}
function humanCommand(fighter){
  const side=fighter.side;
  return{
    down:action=>{
      // Player 1's controller D-pad changes the selected ability. Movement stays
      // on the left stick so selecting a move never walks the fighter sideways.
      if(side===1&&(action==='l'||action==='r')&&controllerHotbarDirectionHeld(action))return false;
      return input.actionIsDown(side,action);
    },
    pressed:action=>{
      // O / RT / R2 / ZR activates the highlighted hotbar ability in every mode.
      if(side===1&&action==='u'){
        const activated=input.consumeAction(side,'u');
        if(activated){
          const device=input.lastInputDevice[0]||'keyboard';
          abilityHotbar.activateSelected(device);
          if(trainingState.enabled)recordInput(`${input.actionLabel(1,'u',{device})} • Selected Ability`);
        }
        return false;
      }
      const label=input.actionLabel(side,action,{air:!fighter.grounded});
      const activated=input.consumeAction(side,action);
      if(activated&&trainingState.enabled)recordInput(label);
      return activated;
    }
  };
}
function aiCommand(fighter,foe){
  const decision=decideCPU(fighter,foe,difficulty),down=new Set(),pressed=new Set(decision.actions.map(action=>action==='s'?'characterSpecial':action));if(decision.move)down.add(decision.move);if(decision.block)down.add('b');
  return{down:action=>down.has(action),pressed:action=>pressed.has(action)};
}
function commandFor(fighter){
  if(trainingState.enabled&&fighter.side===2)return trainingState.dummy==='cpu'?aiCommand(fighter,fighter.foe()):dummyCommand(fighter);
  return fighter.cpu?aiCommand(fighter,fighter.foe()):humanCommand(fighter);
}

function setup(){
  if(p1id===p2id)p2id=different(p1id);clearTransient();controllerHotbarButtons={left:false,right:false};touchControls.releaseAll();touchControls.setFighter(p1id);touchControls.setMatchUiVisible(true);input.clear();paused=false;touchControls.setPaused(false);time=limit;
  world.fighters=[new Fighter(p1id,1,false,world,{appearance:selectedAppearance(1)}),new Fighter(p2id,2,mode!=='local'&&mode!=='training',world,{appearance:selectedAppearance(2)})];
  world.fighters[0].maxHp=100;world.fighters[0].hp=100;const opponentMaxHp=mode==='local'||mode==='training'?100:CPU_MAX_HEALTH;world.fighters[1].maxHp=opponentMaxHp;world.fighters[1].hp=opponentMaxHp;
  abilityHotbar.setFighter(p1id);abilityHotbar.setVisible(true,touchControls.enabled);abilityHotbar.root?.classList.remove('hotbar-paused');$('touchLayer').classList.toggle('hotbar-enabled',touchControls.enabled);responsiveLayout.apply();
  U.p1n.textContent=`${ROSTER[p1id].n.toUpperCase()}  ${wins1}`;U.p2n.textContent=`${wins2}  ${ROSTER[p2id].n.toUpperCase()}`;
  U.rl.textContent=mode==='training'?'TRAINING':`FIRST TO ${roundsToWin} ${roundsToWin===1?'KO':'KOs'} • BATTLE ${currentRound}`;
  roundIntro=100;roundBanner.textContent=`BATTLE ${currentRound} • FIRST TO ${roundsToWin} ${roundsToWin===1?'KO':'KOs'}`;roundBanner.classList.remove('hidden');sound('roundStart');
  U.msg.classList.add('hidden');U.pause.classList.add('hidden');pauseMenu.hide();resultsScreen.hide();state='playing';hintTimer=360;last=performance.now();
}
let matchStartPromise=null;
async function startGame(){
  if(matchStartPromise)return matchStartPromise;
  matchStartPromise=startGameInternal();
  try{return await matchStartPromise}finally{matchStartPromise=null}
}

async function startGameInternal(){
  fighterVisuals.configure({enabled:U.spriteToggle.value==='on',quality:U.spriteQuality.value,developerViewer:Boolean(U.spriteDebug?.checked),exposePrototypeAppearances:developerSpriteBuild&&U.prototypeExpose.checked});
  const fightButton=$('fight'),originalLabel=fightButton.textContent;
  const requestedMode=U.mode.value==='story'?'cpu':U.mode.value,requestedStage=U.stage.value;
  const fighter=ROSTER[p1id],opponent=ROSTER[p2id];
  fightButton.disabled=true;fightButton.textContent='LOADING…';
  loadingManager.start('MATCH INITIALIZATION','Reading fighter manifests…',{
    fighterId:['rrvvfo','revvfo','sage'].includes(p1id)?p1id:'rrvvfo',
    fighterName:fighter?.n||p1id,
    opponentName:opponent?.n||p2id,
    stageName:STAGES[requestedStage]?.n||'Story Arena',
    accent:fighter?.a||'#55d9ff'
  });
  try{
    loadingManager.task('manifest','active','Validating fighter definitions, movesets, and selected rules…');
    const manifestChecks=[p1id,p2id].map(id=>({
      id,
      roster:ROSTER[id],
      meta:FIGHTER_META[id],
      moves:moveList(id)
    }));
    for(const check of manifestChecks){
      if(!check.roster||!check.meta)throw new Error(`Missing fighter definition: ${check.id}`);
      if(!Array.isArray(check.moves))throw new Error(`Invalid moveset: ${check.id}`);
    }
    loadingManager.task('manifest','done');
    loadingManager.task('sprites','active','Loading available character atlases and visual fallbacks…');
    let spriteResult;
    try{
      spriteResult=await fighterVisuals.preloadForMatch([p1id,p2id]);
      loadingManager.task('sprites','done');
    }catch(error){
      spriteResult={ready:false,reason:'load-failed',error};
      loadingManager.task('sprites','done','A sprite atlas failed; safe legacy visuals are ready.');
    }

    mode=requestedMode;trainingState.enabled=mode==='training';trainingHud.classList.toggle('hidden',!trainingState.enabled);if(trainingState.enabled)clearTraining();
    difficulty=U.diff.value;world.cinematicMode=U.cine.value;world.localMode=mode==='local';world.reducedShake=U.reduced.checked;limit=Infinity;roundsToWin=mode==='cpu'?Math.max(1,Number(U.rounds.value)||1):SONIC_KO_TARGET;currentRound=1;wins1=wins2=0;
    stage=requestedStage;

    loadingManager.task('stage','active',`Preparing ${STAGES[stage]?.n||stage} and the shared camera rules…`);
    if(!STAGES[stage])throw new Error(`Missing stage definition: ${stage}`);
    await new Promise(resolve=>requestAnimationFrame(()=>resolve()));
    loadingManager.identity({fighterId:['rrvvfo','revvfo','sage'].includes(p1id)?p1id:'rrvvfo',fighterName:ROSTER[p1id]?.n||p1id,opponentName:ROSTER[p2id]?.n||p2id,stageName:STAGES[stage]?.n||stage,accent:ROSTER[p1id]?.a||'#55d9ff'});
    loadingManager.task('stage','done');
    loadingManager.task('audio','active','Enabling input prompts, menu tones, and the match music bed…');
    await audio.enable();
    loadingManager.task('audio','done');
    loadingManager.task('match','active',`Applying ${roundsToWin===1?'Quick Battle':'first-to-three'} rules, HUD state, and respawn settings…`);

    hideMenuLayers();U.game.classList.remove('hidden');document.body.classList.add('gameplay-active');window.scrollTo(0,0);statistics.reset();saveLastActivity();
    const touchEnabled=wantsTouchControls();
    touchControls.startMatch({training:trainingState.enabled,show:touchEnabled});
    if(touchEnabled){input.lastInputDevice[0]='touch';mobilePlatform.activateMatch()}else mobilePlatform.deactivateMatch();
    setup();
    const musicTheme=mode==='training'?'dojo':stage==='tournament'?'tournament':'battle';
    audio.startMusic(musicTheme);
    if(touchEnabled)beginMobilePresentation();else fullscreenManager.start({touch:false});
    if(fighterVisuals.settings.developerViewer)spriteDebugViewer.show();else spriteDebugViewer.hide();
    if(touchEnabled&&(!touchSettings.chooserShown||!touchSettings.tutorialComplete)){setPaused(true);pauseMenu.hide()}
    loadingManager.task('match','done');
    loadingManager.finish('FIGHTERS READY');
    if(shouldShowRrvvfoLoadFailure(spriteResult,fighterVisuals.settings.enabled))U.notice.textContent='One or more character sprite atlases could not load. Legacy visuals are active for the affected fighter.';
  }catch(error){
    console.error('[Match Loading] Could not start the match',error);
    loadingManager.fail('The match could not finish loading. Retry or return to the mode menu.');
    U.notice.textContent='Match loading failed. No save data was changed.';
  }finally{
    fightButton.disabled=false;
    fightButton.textContent=originalLabel;
  }
}

function respawnAfterKo2D(loserIndex){
  const loser=world.fighters[loserIndex],winner=world.fighters[1-loserIndex],maxHp=loser.maxHp||100;
  const replacement=new Fighter(loser.id,loser.side,loser.cpu,world,{appearance:loser.appearance});
  replacement.maxHp=maxHp;replacement.hp=maxHp;replacement.en=50;replacement.inv=80;replacement.guard=replacement.guardMax||100;
  world.fighters[loserIndex]=replacement;
  winner.victory=0;winner.attackCd=0;winner.windup=0;winner.pending=null;winner.pendingMove=null;winner.stun=0;winner.block=0;winner.vx=0;winner.combo&&resetCombo(winner.combo);
  clearTransient();state='playing';roundIntro=0;roundBanner.classList.add('hidden');touchControls.setMatchUiVisible(true);abilityHotbar.setVisible(true,touchControls.enabled);abilityHotbar.setFighter(p1id);input.clear();
  U.p1n.textContent=`${ROSTER[p1id].n.toUpperCase()}  ${wins1}`;U.p2n.textContent=`${wins2}  ${ROSTER[p2id].n.toUpperCase()}`;U.rl.textContent=`FIRST TO ${roundsToWin} ${roundsToWin===1?'KO':'KOs'} • BATTLE ${currentRound}`;
  notifications.push(`${replacement.c.n.toUpperCase()} RESPAWNED`,{important:true,key:`respawn-${replacement.side}`});
}
function over(winner){
  state='over';touchControls.releaseAll();abilityHotbar.setVisible(false);clearTransient();winner.victory=1;roundBanner.textContent='K.O.';roundBanner.classList.remove('hidden');sound('ko');const p1win=winner===world.fighters[0];if(p1win)wins1++;else wins2++;const matchWon=wins1>=roundsToWin||wins2>=roundsToWin;
  if(!matchWon){currentRound++;roundBanner.textContent=`K.O. • ${wins1}–${wins2}`;roundBanner.classList.remove('hidden');const loserIndex=p1win?1:0;world.timers.schedule(()=>respawnAfterKo2D(loserIndex),700);return}
  touchControls.setMatchUiVisible(false);
  sound('victory');audio.victoryStinger();const summary=statistics.finish(world.fighters);resultsScreen.show({winner:p1win?`${ROSTER[p1id].n} WINS THE MATCH!`:`${ROSTER[p2id].n} WINS THE MATCH!`,durationMs:summary.durationMs,players:summary.players,local:mode==='local'})
}

function show(title,text,button,callback){U.mt.textContent=title;U.mx.textContent=text;U.mb.textContent=button;U.msg.classList.remove('hidden');U.mb.onclick=callback}
function returnToCharacterSelect(){
  cleanupMatchForNavigation();openCharacterSelect(mode);
}

function update(dt){
  if(!simulationCanAdvance(state,paused))return;
  const clashNow=!!world.clash.active,cinematicNow=!!world.cinematic.active;
  if(clashNow&&!clashInputActive){input.clearBuffers();clashInputActive=true}
  if(cinematicNow&&!cinematicInputActive){input.clearBuffers();cinematicInputActive=true}
  touchControls.tick({clashActive:clashNow,clashFrame:world.clash.frame});input.poll({clash:clashNow});
  updateControllerHotbarSelection();
  abilityHotbar.update();
  if(world.hitstop>0){world.hitstop--;return}
  world.fighterVisuals.update(1000/60,world);
  if(roundIntro>0){roundIntro--;if(roundIntro===48){roundBanner.textContent='FIGHT!';sound('fight')}if(!roundIntro){roundBanner.classList.add('hidden');touchControls.releaseAll();input.clear()}return}
  updateCamera(world);
  if(world.cinematic.active){input.clearBuffers();updateCinematic(world);world.effects.update();if(!world.cinematic.active){cinematicInputActive=false;input.clearBuffers()}return}
  if(world.clash.active){
    const contributions=world.fighters.map((fighter,index)=>{
      const cpu=fighter.cpu||(trainingState.enabled&&fighter.side===2&&trainingState.dummy==='cpu');
      if(cpu)return cpuClashContribution(difficulty,fighter,world.clash.frame);
      const pressed=(input.consumeAction(index+1,'a')?1:0)+(input.consumeAction(index+1,'h')?1:0);
      return pressed*4;
    });
    updateClash(world,contributions);world.effects.update();if(!world.clash.active){clashInputActive=false;input.clearBuffers()}return;
  }
  if(!trainingState.enabled)time=Infinity;
  for(const fighter of world.fighters)fighter.update(commandFor(fighter));
  if(--hintTimer<=0){const hint=firstTimeHints.next({combo:world.fighters.some(fighter=>fighter.combo.hits>0),cinematic:world.cinematic.active,clash:world.clash.active});if(hint)notifications.push(hint,{key:`hint-${firstTimeHints.index}`,cooldown:0});hintTimer=900}
  if(trainingState.enabled){if(trainingState.infiniteHealth)for(const fighter of world.fighters)fighter.hp=100;if(trainingState.infiniteEnergy)for(const fighter of world.fighters)fighter.en=100;if(trainingState.infiniteGuard)for(const fighter of world.fighters)fighter.guard=fighter.guardMax}
  for(const projectile of world.projectiles)projectile.update(world);world.projectiles=world.projectiles.filter(projectile=>!projectile.dead);world.effects.update();
  if(!trainingState.enabled&&(world.fighters[0].hp<=0||world.fighters[1].hp<=0)){const [a,b]=world.fighters,winner=a.hp===b.hp?world.fighters[Math.random()<.5?0:1]:a.hp>b.hp?a:b;over(winner)}
}
function render(){
  ctx.save();if(world.shake>0){const visibleShake=world.shake*(world.shakeScale??1);ctx.translate((Math.random()-.5)*visibleShake,(Math.random()-.5)*visibleShake);world.shake*=.86;if(world.shake<.5)world.shake=0}
  applyCamera(ctx,world.camera,WIDTH,HEIGHT);
  drawStage(ctx,stage,WIDTH,HEIGHT,GROUND);world.effects.draw(ctx);for(const fighter of world.fighters)fighter.draw(ctx);for(const projectile of world.projectiles)projectile.draw(ctx);ctx.restore();
  drawCinematicOverlay(ctx,world.cinematic,WIDTH,HEIGHT,{flashScale:world.flashScale,effects:qolSettings.accessibility.ultimateEffects});
  if(!world.fighters.length)return;const blinded=world.fighters.find(fighter=>fighter.lens>0&&!fighter.cpu);
  if(blinded){ctx.save();ctx.fillStyle=qolSettings.accessibility.lensOverlay==='reduced'?'rgba(7,18,28,.15)':'rgba(7,18,28,.34)';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.textAlign='center';ctx.fillStyle='#f7f7ff';ctx.font='900 30px Segoe UI';ctx.fillText('LENS OF TRUTH',WIDTH/2,HEIGHT/2-18);ctx.font='bold 17px Segoe UI';ctx.fillStyle='#bdefff';ctx.fillText(`MOST PROBABLE: ${blinded.lensPrediction||'UNKNOWN'}`,WIDTH/2,HEIGHT/2+16);ctx.font='bold 14px Segoe UI';ctx.fillStyle='#d8e3ff';ctx.fillText(`MASTERY ${blinded.lensMastery||0}%${blinded.lensAutoDodges?` • AUTO-DODGES ${blinded.lensAutoDodges}`:''}`,WIDTH/2,HEIGHT/2+43);ctx.restore()}
  world.fighters.forEach((fighter,index)=>comboHud[index].innerHTML=fighter.combo.hits>1?`${fighter.combo.hits} HIT COMBO<small>${fighter.combo.damage.toFixed(1)} DAMAGE • ${Math.round(fighter.combo.scale*100)}% SCALE</small>`:'');
  const hudModels=world.fighters.map(fighterHudModel);hudModels.forEach((model,index)=>{cooldownHud[index].textContent=cooldownText(model)});
  abilityHotbar.update();
  clashHud.classList.toggle('hidden',!world.clash.active);
  if(world.clash.active){$('clashLabel').textContent=world.clash.type==='beam'?'BEAM CLASH!':world.clash.type==='ultimate'?'ULTIMATE CLASH!':'CLASH!';const amount=(world.clash.meter+100)/2;$('clashFill').style.left=`${Math.min(50,amount)}%`;$('clashFill').style.width=`${Math.abs(amount-50)}%`}
  if(trainingState.enabled){$('trainStats').innerHTML=`COMBO ${world.fighters[0].combo.hits}<br>DAMAGE ${world.fighters[0].combo.damage.toFixed(1)}<br>SCALING ${Math.round(world.fighters[0].combo.scale*100)}%<br>GUARD DMG ${world.fighters[1].guardDamageLast.toFixed(1)}<br>PB WINDOW ${world.fighters[0].perfectBlockWindow}<br>DUMMY ${trainingState.dummy.toUpperCase()}<br>CLASH ${world.clash.active?`${world.clash.type.toUpperCase()} ${world.clash.meter.toFixed(1)}`:trainingState.forceNextClash?'ARMED':'READY'}`;$('trainMoves').innerHTML=`<b>${ROSTER[p1id].n} MOVE LIST</b><br>${moveList(p1id).join('<br>')||'Legacy light • heavy • launcher • air • special • ultimate'}`;$('trainComboPrompt').textContent=`${input.inputStyleName(1)} ROUTE: ${input.comboPrompt(1)}`;$('trainInputs').textContent=`INPUTS: ${trainingState.inputHistory.join(' › ')}`}
  const [a,b]=world.fighters,[ha,hb]=hudModels;U.p1h.style.width=(Math.max(0,Math.min(100,a.hp/(a.maxHp||100)*100)))+'%';U.p2h.style.width=(Math.max(0,Math.min(100,b.hp/(b.maxHp||100)*100)))+'%';U.p1e.style.width=a.en+'%';U.p2e.style.width=b.en+'%';U.p1g.style.width=a.guard+'%';U.p2g.style.width=b.guard+'%';U.p1hpText.textContent=`${ha.health}/${ha.maxHealth}`;U.p2hpText.textContent=`${hb.health}/${hb.maxHealth}`;U.p1enText.textContent=ha.energy;U.p2enText.textContent=hb.energy;U.p1guardText.textContent=ha.guard;U.p2guardText.textContent=hb.guard;U.p1d.textContent=`${ha.ultimateReady?'◆ ULT READY':'◇ ULT CHARGING'} • ${ha.breakerReady?'◇ BREAKER READY':'× BREAKER SPENT'}`;U.p2d.textContent=`${hb.ultimateReady?'◆ ULT READY':'◇ ULT CHARGING'} • ${hb.breakerReady?'◇ BREAKER READY':'× BREAKER SPENT'}`;U.p1status.textContent=ha.statuses.join(' • ');U.p2status.textContent=hb.statuses.join(' • ');U.timer.textContent=Number.isFinite(time)?Math.ceil(time):'∞';
}
let fpsFrames=0,fpsStamp=performance.now();function loop(timestamp){const delta=Math.min(.034,(timestamp-last)/1000||0);last=timestamp;acc+=delta;while(acc>=1/60){update(1/60);acc-=1/60}if(state!=='menu')render();fpsFrames++;if(timestamp-fpsStamp>=500){$('fpsDisplay').textContent=`${Math.round(fpsFrames*1000/(timestamp-fpsStamp))} FPS`;fpsFrames=0;fpsStamp=timestamp}requestAnimationFrame(loop)}

U.slot1.onclick=()=>{selectSlot=1;refreshSelection()};U.slot2.onclick=()=>{selectSlot=2;refreshSelection()};
U.mode.onchange=()=>{U.s2l.textContent=U.mode.value==='local'?'PLAYER 2 — CLICK TO SELECT':'CPU/DUMMY — CLICK TO SELECT';$('trainingOptions').classList.toggle('hidden',U.mode.value!=='training');refreshAppearancePanels()};
U.appearanceSelects.forEach((select,index)=>select.onchange=()=>setAppearance(index+1,select.value));
U.spriteToggle.onchange=()=>fighterVisuals.configure({enabled:U.spriteToggle.value==='on'});
U.spriteQuality.onchange=()=>fighterVisuals.configure({quality:U.spriteQuality.value});
U.spriteDebug.onchange=()=>fighterVisuals.configure({developerViewer:U.spriteDebug.checked});
U.prototypeExpose.onchange=()=>{fighterVisuals.configure({exposePrototypeAppearances:developerSpriteBuild&&U.prototypeExpose.checked});refreshAppearancePanels()};
$('random').onclick=()=>{p1id=PLAYABLE_ROSTER_IDS[Math.floor(Math.random()*PLAYABLE_ROSTER_IDS.length)];p2id=different(p1id);refreshSelection()};$('reset').onclick=()=>confirmation.open({title:'Reset All Save Data?',message:'Story progress, settings, controls, appearances, and Training presets will be removed.',accept:'RESET ALL'}).then(ok=>{if(ok){resetSaveGroup('all');location.reload()}});$('fight').onclick=startGame;
$('chooseStage').onclick=()=>openStageSelect('character');
$('backMenu').onclick=returnToCharacterSelect;
let quickRestartHeldAt=0;
const SHARED_MOUSE_SETTINGS_KEY='pxArenaControlsV1';
const standardMouseBindings=new Map();
function sharedPrimaryMouseAction(){
  try{return JSON.parse(localStorage.getItem(SHARED_MOUSE_SETTINGS_KEY)||'{}')?.mousePrimaryAttack==='heavy'?'h':'a'}catch{return'a'}
}
input.setMousePrimaryAction(sharedPrimaryMouseAction());
function standardMouseGameplayActive(){
  return state==='playing'&&!paused&&!U.game.classList.contains('hidden')&&!canvas.closest('.hidden');
}
function releaseStandardMouse(){
  for(const action of standardMouseBindings.values())input.setMouseAction(1,action,false);
  standardMouseBindings.clear();
}
function standardMouseDown(event){
  if(event.pointerType!=='mouse'||![0,2].includes(event.button)||!standardMouseGameplayActive())return;
  event.preventDefault();event.stopPropagation();
  const primary=sharedPrimaryMouseAction();input.setMousePrimaryAction(primary);
  const action=event.button===2?'b':primary;
  const previous=standardMouseBindings.get(event.button);
  if(previous&&previous!==action)input.setMouseAction(1,previous,false);
  standardMouseBindings.set(event.button,action);
  input.setMouseAction(1,action,true);
}
function standardMouseUp(event){
  if(event.pointerType!=='mouse'||![0,2].includes(event.button))return;
  const action=standardMouseBindings.get(event.button)|| (event.button===2?'b':sharedPrimaryMouseAction());
  input.setMouseAction(1,action,false);
  standardMouseBindings.delete(event.button);
}
canvas.addEventListener('pointerdown',standardMouseDown,true);
addEventListener('pointerup',standardMouseUp,true);
canvas.addEventListener('contextmenu',event=>{if(standardMouseGameplayActive()){event.preventDefault();event.stopPropagation()}},true);
// start-screen-pointer-hotfix-263
const activateStartFromPointer=event=>{
  if(!U.start||U.start.classList.contains('hidden'))return;
  event?.preventDefault?.();
  activateStartOnce();
};
U.start.addEventListener('pointerdown',activateStartFromPointer);
$('startPrompt')?.addEventListener('click',activateStartFromPointer);

addEventListener('keydown',event=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();
  if(!U.start.classList.contains('hidden')){event.preventDefault();activateStartOnce();return}
  if(!U.main.classList.contains('hidden')){if(['ArrowUp','ArrowLeft'].includes(event.code)){mainMenu.move(-1);event.preventDefault();return}if(['ArrowDown','ArrowRight'].includes(event.code)){mainMenu.move(1);event.preventDefault();return}if(['Enter','Space'].includes(event.code)){mainMenu.confirm();event.preventDefault();return}}
  if(event.code==='Escape'){event.preventDefault();if(!$('confirmDialog').classList.contains('hidden')){confirmation.close();return}if(!$('hotbarCustomizeModal').classList.contains('hidden')){closeHotbarCustomize();return}if(!$('fullscreenPrompt').classList.contains('hidden')){fullscreenManager.finish();return}if(!$('orientationPrompt').classList.contains('hidden')){orientationManager.finish();return}if(!$('moveListPanel').classList.contains('hidden')){closeAdaptiveMoveList();return}if(!$('settingsPanel').classList.contains('hidden')){requestCloseSettings();return}if(!$('extrasPanel').classList.contains('hidden')){$('extrasPanel').classList.add('hidden');return}if(!$('stageSelectPanel').classList.contains('hidden')){closeStageSelect(false);return}if(state==='playing'){togglePause();return}if(!U.menu.classList.contains('hidden')){showMainMenu();return}}
  const abilitySlot=/^Digit([1-5])$/.exec(event.code);if(abilitySlot&&state==='playing'&&!paused&&!event.repeat){event.preventDefault();abilityHotbar.activateSlot(Number(abilitySlot[1]),'keyboard');return}
  input.setKeyboard(event.code,true);if(event.code==='KeyY'&&trainingState.enabled)resetTrainingWorld(world,input);if(event.code==='KeyP'&&state==='playing')togglePause();if(event.code===qolSettings.gameplay.quickRestartKey&&state==='playing'&&!quickRestartHeldAt)quickRestartHeldAt=performance.now();
});
addEventListener('keyup',event=>{input.setKeyboard(event.code,false);if(event.code===qolSettings.gameplay.quickRestartKey&&quickRestartHeldAt){const held=performance.now()-quickRestartHeldAt;quickRestartHeldAt=0;if(trainingState.enabled){resetTrainingWorld(world,input);notifications.push('TRAINING RESET',{important:true,key:'quick-reset'})}else if(held>=600)confirmation.open({title:'Restart Match?',message:'Keep fighters, stage, rules, appearances, and devices?',accept:'RESTART'}).then(ok=>{if(ok){currentRound=1;wins1=wins2=0;statistics.reset();setup()}});else notifications.push('HOLD QUICK RESTART',{key:'hold-restart'})}});
document.addEventListener('controllercancel',()=>{if(!$('confirmDialog').classList.contains('hidden'))confirmation.close();else if(!$('hotbarCustomizeModal').classList.contains('hidden'))closeHotbarCustomize();else if(!$('fullscreenPrompt').classList.contains('hidden'))fullscreenManager.finish();else if(!$('orientationPrompt').classList.contains('hidden'))orientationManager.finish();else if(!$('controlsPanel').classList.contains('hidden'))closeControlsPanel();else if(!$('controllerAssignments').classList.contains('hidden'))controllerManager.closeAssignments();else if(!$('moveListPanel').classList.contains('hidden'))closeAdaptiveMoveList();else if(!$('settingsPanel').classList.contains('hidden'))requestCloseSettings();else if(state==='playing')togglePause();else if(!U.menu.classList.contains('hidden'))showMainMenu()});
document.addEventListener('controllerinput',()=>{if(!U.start.classList.contains('hidden'))activateStartOnce()});
$('touchSettingsButton').onclick=openTouchSettings;
$('closeTouchMoveList').onclick=()=>$('touchMoveList').classList.add('hidden');
$('finishLayoutEdit').onclick=()=>{touchControls.layoutEditor.setEditing(false);const selected=$('touchLayer').dataset.selectedControl;if(selected)$('touchSelectedControl').value=selected;touchSettingsPanel.open()};
$('abilityHotbar').addEventListener('hotbarcustomize',openHotbarCustomize);$('closeHotbarCustomize').onclick=closeHotbarCustomize;$('doneHotbarCustomize').onclick=closeHotbarCustomize;$('hotbarMoveLeft').onclick=()=>{abilityHotbar.moveSelected($('hotbarAbilitySelect').value,-1);syncHotbarCustomize()};$('hotbarMoveRight').onclick=()=>{abilityHotbar.moveSelected($('hotbarAbilitySelect').value,1);syncHotbarCustomize()};$('hotbarRestoreDefaults').onclick=()=>{abilityHotbar.restoreDefaults();syncHotbarCustomize()};$('hotbarLayoutLocked').onchange=()=>{abilityHotbar.settings.locked=$('hotbarLayoutLocked').checked;persistHotbarUi()};
$('characterSelectBack').onclick=showMainMenu;$('characterMoveList').onclick=()=>openAdaptiveMoveList(p1id,1);$('closeMoveList').onclick=closeAdaptiveMoveList;$('closeControlsPanel').onclick=closeControlsPanel;$('stageSelectConfirm').onclick=()=>closeStageSelect(true);$('stageSelectCancel').onclick=()=>closeStageSelect(false);$('closeSettings').onclick=requestCloseSettings;$('cancelSettings').onclick=requestCloseSettings;$('applySettings').onclick=()=>{settingsPanel.apply();settingsPanel.close({discard:false})};$('restoreCategory').onclick=()=>settingsPanel.resetCategory();$('restoreAllSettings').onclick=()=>confirmation.open({title:'Restore All Settings?',message:'All QOL categories will return to defaults after Apply.',accept:'RESTORE'}).then(ok=>{if(ok)settingsPanel.resetAll()});$('closeExtras').onclick=()=>$('extrasPanel').classList.add('hidden');document.querySelectorAll('[data-extra]').forEach(button=>button.onclick=()=>showExtra(button.dataset.extra));

const controllerActionNames={j:'Jump',a:'Light',h:'Heavy',s:'Grab',d:'Dash',b:'Block',u:'Ultimate / Selected Ability',k:'Charge',q:'Combo Breaker',c:'Counter',i:'Interact'};
function controllerSummary(side){
  const mapping=input.controllerMapping(side),label=`P${side} ${mapping.name}`;
  return `${label}: ${mapping.labels.j} jump • ${mapping.labels.a} light • ${mapping.labels.h} heavy • ${mapping.labels.s} grab • Up+${mapping.labels.h} launcher • ${mapping.labels.k} charge • ${mapping.labels.q} breaker • ${mapping.labels.c} counter • ${mapping.labels.i} interact • ${mapping.labels.d} dash • ${mapping.labels.b} block • ${mapping.labels.u} ${side===1?'activate selected ability':'ultimate'}`;
}
function updateControllerGuide(){
  U.controllerGuide.textContent=`${controllerSummary(1)} | ${controllerSummary(2)}`;
  U.controllerCustom.classList.toggle('hidden',U.controller1.value!=='custom'&&U.controller2.value!=='custom');
}
function renderCustomBindings(){
  const side=Number(U.customSide.value),mapping=input.getCustomMapping(side);
  U.customBindings.innerHTML='';
  for(const action of CUSTOM_CONTROLLER_ACTIONS){
    const label=document.createElement('label'),select=document.createElement('select');
    label.className='customBinding';
    label.append(`${controllerActionNames[action]} `);
    for(let index=0;index<16;index++){const option=document.createElement('option');option.value=String(index);option.textContent=`Button ${index+1}`;option.selected=mapping.buttons[action]===index;select.appendChild(option)}
    select.onchange=()=>{input.setCustomButton(side,action,Number(select.value));controllerManager.saveCustomMapping(side,input.getCustomMapping(side));updateControllerGuide()};
    label.appendChild(select);U.customBindings.appendChild(label);
  }
}
function syncControllerStyleUi(side,value){const select=side===1?U.controller1:U.controller2;select.value=value;updateControllerGuide();renderCustomBindings()}
function setControllerStyle(side,value){controllerManager.setStyle(side,value);syncControllerStyleUi(side,value)}
U.controller1.onchange=()=>setControllerStyle(1,U.controller1.value);
U.controller2.onchange=()=>setControllerStyle(2,U.controller2.value);
U.customSide.onchange=renderCustomBindings;
function bindSyncedCheckbox(preId,liveId,key){const pre=$(preId),live=$(liveId),apply=event=>setTrainingSetting(key,event.target.checked,pre,live);pre.onchange=apply;live.onchange=apply}
bindSyncedCheckbox('trainHealth','liveHealth','infiniteHealth');bindSyncedCheckbox('trainEnergy','liveEnergy','infiniteEnergy');bindSyncedCheckbox('preStationaryBlock','stationaryBlock','stationaryBlock');
bindSyncedCheckbox('trainGuard','liveGuard','infiniteGuard');bindSyncedCheckbox('trainGuardRegen','liveGuardRegen','guardRegen');bindSyncedCheckbox('trainPerfectPractice','livePerfectPractice','perfectBlockPractice');
bindSyncedCheckbox('trainClash','liveClash','infiniteClash');
function syncDummy(event){setTrainingSetting('dummy',event.target.value,$('dummyMode'),$('liveDummy'));trainingState.afterFirstHit=false}$('dummyMode').onchange=syncDummy;$('liveDummy').onchange=syncDummy;
$('forceClash').onclick=()=>{trainingState.forceNextClash=true};$('resetClash').onclick=()=>{resetTrainingClash(world);input.clearBuffers()};$('trainResetPos').onclick=()=>{resetTrainingPosition(world,'center');input.clearBuffers()};$('trainLeft').onclick=()=>resetTrainingPosition(world,'left');$('trainRight').onclick=()=>resetTrainingPosition(world,'right');$('trainSwap').onclick=()=>swapTrainingSides(world);$('trainRefillHealth').onclick=()=>refillTraining(world,'health');$('trainRefillEnergy').onclick=()=>refillTraining(world,'energy');$('trainRefillGuard').onclick=()=>refillTraining(world,'guard');$('trainClearCooldowns').onclick=()=>clearTrainingState(world,'cooldowns');$('trainClearProjectiles').onclick=()=>clearTrainingState(world,'projectiles');$('trainClearShots').onclick=()=>clearTrainingState(world,'agony');$('trainClearLens').onclick=()=>clearTrainingState(world,'lens');$('trainClearSwap').onclick=()=>clearTrainingState(world,'swap');$('trainResetCombo').onclick=()=>{clearTrainingState(world,'combo');input.clearBuffers()};$('trainSavePreset').onclick=()=>{const name=prompt('Training preset name','My Training Setup');if(name)notifications.push(`Saved ${saveTrainingPreset(name,trainingState)}`,{important:true,key:'preset-save'})};$('trainLoadPreset').onclick=()=>{const presets=loadTrainingPresets(),names=Object.keys(presets);if(!names.length){notifications.push('No Training presets saved.',{important:true,key:'preset-empty'});return}const name=prompt(`Training preset to load:\n${names.join('\n')}`,names[0]);if(name&&applyTrainingPreset(name,trainingState)){for(const [pre,live,key] of [['trainHealth','liveHealth','infiniteHealth'],['trainEnergy','liveEnergy','infiniteEnergy'],['trainGuard','liveGuard','infiniteGuard'],['trainGuardRegen','liveGuardRegen','guardRegen'],['trainPerfectPractice','livePerfectPractice','perfectBlockPractice'],['trainClash','liveClash','infiniteClash']])setTrainingSetting(key,trainingState[key],$(pre),$(live));setTrainingSetting('dummy',trainingState.dummy,$('dummyMode'),$('liveDummy'));notifications.push(`Loaded ${name}`,{important:true,key:'preset-load'})}};$('trainRestart').onclick=()=>{resetTrainingWorld(world,input);setup()};$('exitTraining').onclick=returnToCharacterSelect;

const TRAINING_DRILL_PRESETS=Object.freeze({
  parry:{label:'PERFECT PARRY WINDOW',dummy:'cpu',infiniteHealth:true,infiniteEnergy:true,infiniteGuard:false,perfectBlockPractice:true,description:'Let the CPU attack. Press Guard at the opening instant and land three perfect parries.'},
  launcher:{label:'LAUNCHER AIR ROUTE',dummy:'stationary',infiniteHealth:true,infiniteEnergy:true,infiniteGuard:false,perfectBlockPractice:false,description:'Land a launcher, jump after the target, and finish with an air attack.'},
  energy:{label:'ENERGY DISCIPLINE',dummy:'cpu',infiniteHealth:true,infiniteEnergy:false,infiniteGuard:false,perfectBlockPractice:false,description:'Spend energy, create space, then stand still long enough to charge safely.'},
  guard:{label:'GUARD PRESSURE & GRAB',dummy:'always',infiniteHealth:true,infiniteEnergy:true,infiniteGuard:false,perfectBlockPractice:false,description:'Break predictable defense with guard damage and a clean grab.'},
  lens:{label:'LENS PREDICTION READ',dummy:'cpu',infiniteHealth:true,infiniteEnergy:false,infiniteGuard:false,perfectBlockPractice:false,description:'Build 60 energy, activate Lens, and react to the displayed prediction.'}
});
function applySuggestedTrainingDrill(){
  const id=$('trainingDrill')?.value||'parry',preset=TRAINING_DRILL_PRESETS[id];if(!preset)return;
  setTrainingSetting('dummy',preset.dummy,$('dummyMode'),$('liveDummy'));
  for(const [key,pre,live] of [['infiniteHealth','trainHealth','liveHealth'],['infiniteEnergy','trainEnergy','liveEnergy'],['infiniteGuard','trainGuard','liveGuard'],['perfectBlockPractice','trainPerfectPractice','livePerfectPractice']])setTrainingSetting(key,preset[key],$(pre),$(live));
  $('trainingDrillStatus').textContent=preset.description;
  if(trainingState.enabled&&world.fighters.length){resetTrainingWorld(world,input);refillTraining(world,'health');if(preset.infiniteEnergy)refillTraining(world,'energy')}
  notifications.push(`DRILL LOADED • ${preset.label}`,{important:true,key:'training-drill'});
}
$('applyTrainingDrill').onclick=applySuggestedTrainingDrill;$('trainingDrill').onchange=()=>{$('trainingDrillStatus').textContent=TRAINING_DRILL_PRESETS[$('trainingDrill').value]?.description||'Choose a focused setup.'};

buildRoster();
U.mode.dispatchEvent(new Event('change'));
input.setControllerStyle(1,U.controller1.value);
input.setControllerStyle(2,U.controller2.value);
renderCustomBindings();
updateControllerGuide();
applyQolSettings(qolSettings,{persist:false});
document.querySelectorAll('[data-build-version]').forEach(element=>element.textContent=BUILD_VERSION);
$('touchStatus').textContent=mobilePlatform.info.touch?`Touch Controls Ready • ${touchSettings.movement==='dpad'?'Virtual D-Pad':'Virtual Joystick'}`:'Touch controls available when detected';
if(localStorage.getItem(STARTED_KEY)){
  startActivated=true;
  U.start.classList.add('hidden');
  U.main.classList.remove('hidden');
  renderQuickContinue();
  controllerManager.promptAfterStart();
}else{
  U.start.classList.remove('hidden');
  U.main.classList.add('hidden');
  $('startPrompt').textContent=mobilePlatform.info.touch?'TAP TO START':'PRESS ANY BUTTON';
}
requestAnimationFrame(loop);

window.__openClassicTraining=()=>openCharacterSelect('training');
