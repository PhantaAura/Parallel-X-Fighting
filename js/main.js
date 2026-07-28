"use strict";
import {FIGHTER_META,ROSTER,ROSTER_IDS,isMirrorMatch} from './roster.js';
import {STAGES,drawStage} from './stages.js';
import {STORY_ORDER,STORY_STAGES,SAVE_KEY} from './story.js';
import {CUSTOM_CONTROLLER_ACTIONS,InputManager} from './input.js?v=2.3.5-landscape-hotbar';
import {decideCPU} from './ai.js';
import {TimerRegistry,clamp,resetCombo} from './combat.js';
import {EffectSystem} from './effects.js';
import {Fighter} from './fighter.js?v=2.3.5-landscape-hotbar';
import {moveList} from './movesets.js';
import {trainingState,recordInput,clearTraining,resetTrainingClash,resetTrainingWorld,resetTrainingPosition,swapTrainingSides,refillTraining,clearTrainingState,exitTrainingWorld,setTrainingSetting,dummyCommand} from './training.js';
import {byId as $} from './ui.js';
import {clearClash,cpuClashContribution,createClashState,tryProjectileClash,updateClash} from './clash-system.js';
import {applyCamera,createCameraState,updateCamera} from './camera-system.js';
import {clearCinematic,createCinematicState,drawCinematicOverlay,updateCinematic} from './ultimate-system.js';
import {AudioManager} from './audio-manager.js';
import {HapticsManager,MobilePlatformController,loadTouchSettings,saveTouchSettings} from './mobile-platform.js';
import {TouchControls} from './touch-controls.js?v=2.3.5-landscape-hotbar-3';
import {TouchSettingsPanel,createDefaultTouchSettings} from './touch-layout-editor.js?v=2.3.5-landscape-hotbar-x16';
import {FighterVisuals,availableRrvvfoAppearances,isDeveloperSpriteBuild,loadRrvvfoVisualSettings,normalizeRrvvfoAppearance,shouldShowRrvvfoLoadFailure} from './fighter-visuals.js?v=2.3.5b-sprite-reimport';
import {SpriteDebugViewer} from './sprite-debug-viewer.js';
import {ControllerManager} from './controller-manager.js?v=2.3.5-landscape-hotbar';
import {BUILD_VERSION} from './build-info.js?v=28b2-chapter2-replay-20260728';
import {ConfirmationDialog} from './confirmation-dialog.js';
import {MainMenu} from './main-menu.js?v=28b2-chapter2-replay-20260728';
import {MatchStatistics} from './match-statistics.js';
import {PauseMenu,simulationCanAdvance} from './pause-menu.js?v=2.3.5-landscape-hotbar';
import {ResultsScreen} from './results-screen.js';
import {loadQolSettings,saveQolSettings} from './qol-settings.js?v=2.3.5-landscape-hotbar';
import {NotificationSystem} from './notification-system.js';
import {adaptiveMoveList,renderAdaptiveMoveList} from './move-list.js';
import {SettingsPanel} from './settings-panel.js?v=2.3.5-landscape-hotbar';
import {importSaveText,resetSaveGroup,stringifySave} from './save-manager.js?v=2.3.5-landscape-hotbar';
import {LoadingManager} from './loading-manager.js';
import {applyTrainingPreset,loadTrainingPresets,saveTrainingPreset} from './training-presets.js';
import {FirstTimeHints} from './first-time-hints.js';
import {cooldownText,fighterHudModel} from './hud-model.js';
import {AbilityHotbar} from './ability-hotbar.js?v=2.3.5-landscape-hotbar';
import {loadAbilityHotbarSettings,saveAbilityHotbarSettings} from './ability-hotbar-data.js?v=2.3.5-landscape-hotbar';
import {ResponsiveGameLayout} from './responsive-game-layout.js?v=2.3.5-landscape-hotbar';
import {OrientationManager,loadMobilePresentationSettings,saveMobilePresentationSettings} from './orientation-manager.js?v=2.3.5-landscape-hotbar-2';
import {FullscreenManager} from './fullscreen-manager.js?v=2.3.5-landscape-hotbar';

const canvas=$('game'),ctx=canvas.getContext('2d'),WIDTH=canvas.width,HEIGHT=canvas.height,GROUND=430;
const U={start:$('startScreen'),main:$('mainMenuScreen'),menu:$('menuScreen'),game:$('gameScreen'),mode:$('mode'),diff:$('difficulty'),stage:$('stage'),rt:$('roundTime'),rounds:$('rounds'),cine:$('cinematics'),reduced:$('reducedShake'),spriteToggle:$('rrvvfoSprites'),spriteQuality:$('rrvvfoQuality'),spriteDebug:$('rrvvfoSpriteDebug'),prototypeExpose:$('showPrototypeAppearances'),prototypeBuildNote:$('prototypeAppearanceBuildNote'),spriteLoading:$('spriteLoading'),appearancePanels:[$('rrvvfoAppearancePanel1'),$('rrvvfoAppearancePanel2')],appearanceSelects:[$('rrvvfoAppearance1'),$('rrvvfoAppearance2')],appearancePreviews:[$('rrvvfoPreview1'),$('rrvvfoPreview2')],controller1:$('controllerStyle1'),controller2:$('controllerStyle2'),controllerCustom:$('customController'),customSide:$('customSide'),customBindings:$('customBindings'),controllerGuide:$('controllerGuide'),roster:$('roster'),slot1:$('slot1'),slot2:$('slot2'),n1:$('name1'),n2:$('name2'),m1:$('moves1'),m2:$('moves2'),s2l:$('slot2label'),notice:$('notice'),p1n:$('p1name'),p2n:$('p2name'),p1h:$('p1hp'),p2h:$('p2hp'),p1e:$('p1en'),p2e:$('p2en'),p1g:$('p1guard'),p2g:$('p2guard'),p1d:$('p1defense'),p2d:$('p2defense'),p1hpText:$('p1hpText'),p2hpText:$('p2hpText'),p1enText:$('p1enText'),p2enText:$('p2enText'),p1guardText:$('p1guardText'),p2guardText:$('p2guardText'),p1status:$('p1status'),p2status:$('p2status'),timer:$('timer'),rl:$('roundLabel'),msg:$('msg'),mt:$('msgTitle'),mx:$('msgText'),mb:$('msgButton'),pause:$('pause')};
const comboHud=[document.createElement('div'),document.createElement('div')];comboHud.forEach((element,index)=>{element.className=`comboHud c${index+1}`;$('gameWrap').appendChild(element)});
const cooldownHud=[document.createElement('div'),document.createElement('div')];cooldownHud.forEach((element,index)=>{element.className='moveCooldown';(index?U.p2e:U.p1e).parentElement.parentElement.appendChild(element)});
const clashHud=document.createElement('div');clashHud.className='clashHud hidden';clashHud.innerHTML='<strong id="clashLabel">CLASH!</strong><div class="clashTrack"><div class="clashFill" id="clashFill"></div></div>';$('gameWrap').appendChild(clashHud);
const roundBanner=document.createElement('div');roundBanner.id='roundBanner';roundBanner.className='hidden';$('gameWrap').appendChild(roundBanner);
const trainingHud=document.createElement('div');trainingHud.className='trainingHud hidden';trainingHud.innerHTML='<div id="trainStats"></div><div id="trainMoves"></div><div><div id="trainComboPrompt"></div><label><input id="liveHealth" type="checkbox" checked> ∞ HP</label> <label><input id="liveEnergy" type="checkbox" checked> ∞ ENERGY</label> <label><input id="liveGuard" type="checkbox"> ∞ GUARD</label> <label><input id="liveGuardRegen" type="checkbox" checked> GUARD REGEN</label> <label><input id="livePerfectPractice" type="checkbox"> PB PRACTICE</label> <label><input id="liveClash" type="checkbox"> ∞ CLASH</label><br><select id="liveDummy"><option value="never">Stand / Never Block</option><option value="stationary">Stationary</option><option value="crouch">Crouch (future-ready)</option><option value="jump">Jump</option><option value="walk">Walk</option><option value="always">Block</option><option value="after">Block After First Hit</option><option value="perfect">Perfect Block Attempt</option><option value="counterattack">Counterattack After Hit</option><option value="throw">Throw Attempt</option><option value="breaker">Use Combo Breaker</option><option value="random">Random Defense</option><option value="cpu">CPU Dummy</option></select> <label><input id="stationaryBlock" type="checkbox"> Stationary blocks</label><br><button id="forceClash">FORCE NEXT CLASH</button><button id="resetClash">RESET CLASH</button><button id="trainResetPos">RESET CENTER (Y)</button><button id="trainLeft">NEAR LEFT</button><button id="trainRight">NEAR RIGHT</button><button id="trainSwap">SWAP SIDES</button><button id="trainRefillHealth">REFILL HP</button><button id="trainRefillEnergy">REFILL ENERGY</button><button id="trainRefillGuard">REFILL GUARD</button><button id="trainClearCooldowns">CLEAR COOLDOWNS</button><button id="trainClearProjectiles">CLEAR PROJECTILES</button><button id="trainClearShots">CLEAR SHOTS CLONES</button><button id="trainClearLens">CLEAR LENS</button><button id="trainClearSwap">CLEAR SWAP MARKERS</button><button id="trainResetCombo">CLEAR COMBO</button><button id="trainSavePreset">SAVE PRESET</button><button id="trainLoadPreset">LOAD PRESET</button><button id="trainRestart">QUICK RESTART</button><button id="exitTraining">EXIT TRAINING</button><div id="trainInputs"></div></div>';$('gameWrap').appendChild(trainingHud);

let selectSlot=1,p1id='rrvvfo',p2id='revvfo',mode='story',difficulty='normal',stage='dojo',limit=90,roundsToWin=2,currentRound=1,wins1=0,wins2=0,state='menu',paused=false,pauseOwner=1,story=0,time=90,last=0,acc=0,roundIntro=0,clashInputActive=false,cinematicInputActive=false,hotbarInfoPausedMatch=false;
const input=new InputManager();
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
U.main.addEventListener('menuselect',()=>sound('menuConfirm'));U.main.addEventListener('menuerror',()=>{sound('menuError');notifications?.push('COMING LATER',{important:true,key:'coming-later'})});
const notifications=new NotificationSystem($('combatNotifications'),{mode:()=>qolSettings.gameplay.combatMessages});world.notifications=notifications;
orientationManager=new OrientationManager({root:$('orientationPrompt'),settings:mobilePresentationSettings,onChange:saveMobilePresentationSettings,onLayout:metrics=>responsiveLayout.apply(metrics),onNotice:message=>notifications.push(message,{important:true,key:'orientation'}),onPrompt:()=>{if(state==='playing'){setPaused(true);pauseMenu.hide()}},onDismiss:()=>{if(state==='playing'&&wantsTouchControls()){fullscreenManager?.start({touch:true});if(!$('fullscreenPrompt').classList.contains('hidden')){setPaused(true);pauseMenu.hide()}else setPaused(false)}}});
fullscreenManager=new FullscreenManager({root:$('fullscreenPrompt'),element:U.game,settings:mobilePresentationSettings,onChange:saveMobilePresentationSettings,onLayout:()=>responsiveLayout.apply(),onUnexpectedExit:()=>{if(state==='playing')setPaused(true)},onNotice:message=>notifications.push(message,{important:true,key:'fullscreen'}),onDismiss:()=>{if(state==='playing')setPaused(false)}});
abilityHotbar=new AbilityHotbar({root:$('abilityHotbar'),input,settings:{...abilityHotbarSettings,...qolSettings.hotbar},getFighter:()=>world.fighters[0],getWorld:()=>world,getDevice:()=>input.lastInputDevice[0],notify:(message,options)=>notifications.push(message,options),onChange:settings=>{abilityHotbarSettings=settings;saveAbilityHotbarSettings(settings);syncHotbarCustomize()},onInfo:()=>{if(qolSettings.hotbar.pauseForInfo&&mode!=='local'&&state==='playing'){hotbarInfoPausedMatch=!paused;if(hotbarInfoPausedMatch)setPaused(true);pauseMenu.hide()}},onInfoClose:()=>{if(hotbarInfoPausedMatch){hotbarInfoPausedMatch=false;setPaused(false)}else if(paused)showPauseOverlay()}});
const loadingManager=new LoadingManager($('loadingScreen'),{onRetry:()=>startGame(),onReturn:()=>showMainMenu()});
const settingsPanel=new SettingsPanel($('settingsPanel'),{settings:qolSettings,onApply:applyQolSettings,onAction:handleSettingsAction});
const firstTimeHints=new FirstTimeHints({input,enabled:()=>qolSettings.gameplay.firstTimeHints});let hintTimer=360;

function sound(cue=220,duration=.05,type='square',volume=.03){if(typeof cue==='string'){audio.play(cue);haptics.trigger(cue)}else audio.tone(cue,duration,type,volume)}
function updateControllerStatus(type,side){const connected=type==='connected';$('inputStatus').textContent=connected?`Controller connected${side?` • Player ${side}`:''}`:'Controller disconnected';audio.play(connected?'controllerConnected':'controllerDisconnected');if(typeof notifications!=='undefined')notifications.push(connected?'CONTROLLER CONNECTED':'CONTROLLER DISCONNECTED',{important:true,key:`controller-${type}`})}
function different(id){const choices=ROSTER_IDS.filter(candidate=>candidate!==id);return choices[Math.floor(Math.random()*choices.length)]}
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
function controlsModel(side){const device=input.lastInputDevice[side-1],style=input.inputStyleName(side,device),movement=device==='controller'?'Left Stick / D-Pad':device==='touch'?(touchSettings.movement==='dpad'?'Virtual D-Pad':'Virtual Joystick'):(side===1?'A / D':'Left / Right');const rows=[['Movement',movement],['Jump',input.actionLabel(side,'j',{device})],['Block',input.actionLabel(side,'b',{device})],['Light',input.actionLabel(side,'a',{device})],['Heavy',input.actionLabel(side,'h',{device})],['Launcher',input.actionLabel(side,'x',{device})],['Special',input.actionLabel(side,'s',{device})],['Dash',input.actionLabel(side,'d',{device})],['Throw',input.actionLabel(side,'t',{device})],['Combo Breaker',input.actionLabel(side,'k',{device})],['Ultimate',input.actionLabel(side,'u',{device})],['Counter',input.actionLabel(side,'c',{device})],['Lens',input.actionLabel(side,'n',{device})]];return{side,style,rows}}
function openControlsPanel(){const sides=mode==='local'?[1,2]:[1],models=sides.map(controlsModel);$('controlsPanelBody').innerHTML=`<div class="controlsSummary">${models.map(model=>`<section><h3>PLAYER ${model.side} — ${model.style.toUpperCase()}</h3><dl>${model.rows.map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl></section>`).join('')}</div><p class="moveListNote">Controller assignments: Player 1 — ${controllerManager.settings.assignments[0]===null?'Keyboard / Auto':`Controller ${controllerManager.settings.assignments[0]+1}`} • Player 2 — ${controllerManager.settings.assignments[1]===null?'Keyboard / Auto':`Controller ${controllerManager.settings.assignments[1]+1}`}</p>`;$('controlsPanel').classList.remove('hidden');$('closeControlsPanel').focus()}
function closeControlsPanel(){$('controlsPanel').classList.add('hidden');if(paused)showPauseOverlay()}
function openExtrasPanel(section='version'){$('extrasPanel').classList.remove('hidden');showExtra(section)}
function showExtra(section){const content=$('extrasContent');if(section==='moves'){openAdaptiveMoveList(p1id,1);return}if(section==='profiles')content.innerHTML=Object.entries(ROSTER).map(([id,fighter])=>`<p><strong>${fighter.n}</strong> — ${FIGHTER_META[id].style}</p>`).join('');else if(section==='stages')content.innerHTML=Object.entries(STAGES).map(([id,data])=>`<p><strong>${data.n}</strong> — ${STAGE_DETAILS[id].description}</p>`).join('');else if(section==='controls'){openControlsPanel();return}else if(section==='credits')content.innerHTML='<strong>Parallels X: Clash of Souls</strong><p>Original characters and game direction by the Parallels X creator. Browser prototype engineering developed collaboratively with Codex.</p>';else content.innerHTML=`<strong>${BUILD_VERSION}</strong><p>Combat 2.3 • Controller/mobile completion • Optional Rrvvfo + Revvfo sprite pipeline • QOL polish</p>`}

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
  state='menu';paused=false;hideMenuLayers();U.main.classList.remove('hidden');resultsScreen.hide();pauseMenu.hide();confirmation.close();renderQuickContinue();
}
function openCharacterSelect(modeValue=U.mode.value){
  hideMenuLayers();U.menu.classList.remove('hidden');U.mode.value=modeValue;U.mode.dispatchEvent(new Event('change'));state='menu';refreshSelection();
}
function handleMainMenuSelection(id){
  if(['story','cpu','local','training'].includes(id)){openCharacterSelect(id);return}
  if(id==='settings'){openSettingsPanel();return}
  if(id==='extras'){openExtrasPanel();return}
  if(id==='credits'){openExtrasPanel('credits')}
}
function activateStart(){
  localStorage.setItem(STARTED_KEY,'1');U.start.classList.add('hidden');U.main.classList.remove('hidden');state='menu';mainMenu.render();controllerManager.promptAfterStart();
}
function saveLastActivity(){
  const data={mode:U.mode.value,p1id,p2id,stage:U.stage.value,difficulty:U.diff.value,at:Date.now()};localStorage.setItem(LAST_ACTIVITY_KEY,JSON.stringify(data));
}
function renderQuickContinue(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(LAST_ACTIVITY_KEY)||'null')}catch{}
  const enabled=qolSettings.menu.showQuickContinue&&saved&&saved.mode&&saved.p1id&&saved.stage;$('quickContinue').classList.toggle('hidden',!enabled);if(!enabled)return;
  $('quickContinueTitle').textContent=saved.mode==='training'?'RETURN TO TRAINING':`CONTINUE ${String(saved.mode).toUpperCase()}`;$('quickContinueDetails').textContent=`Last Fighter: ${ROSTER[saved.p1id]?.n||saved.p1id} • Last Stage: ${STAGES[saved.stage]?.n||saved.stage}`;
  $('quickContinueButton').onclick=()=>{p1id=ROSTER[saved.p1id]?saved.p1id:p1id;p2id=ROSTER[saved.p2id]?saved.p2id:p2id;U.stage.value=STAGES[saved.stage]?saved.stage:'dojo';U.diff.value=saved.difficulty||'normal';openCharacterSelect(saved.mode)};
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
  paused=!!next;if(paused)pauseOwner=owner||1;input.clearBuffers();touchControls.releaseAll();touchControls.setPaused(paused);abilityHotbar.root?.classList.toggle('hotbar-paused',paused);U.pause.classList.add('hidden');$('touchPause').textContent=paused?'▶':'Ⅱ';if(paused)showPauseOverlay();else pauseMenu.hide();
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

function buildRoster(){U.roster.innerHTML='';for(const id of ROSTER_IDS){const c=ROSTER[id],meta=FIGHTER_META[id],button=document.createElement('button');button.className='card';button.dataset.id=id;button.title=`${c.s} • ${c.u}`;button.innerHTML=`<div class="portrait"><div class="head" style="background:${c.h}"></div><div class="body" style="background:${c.c};box-shadow:0 0 12px ${c.a}66"></div></div><b>${c.n.toUpperCase()}</b><div class="origin">${c.o}</div><div class="style">${meta.style}</div><div class="rating">${'◆'.repeat(meta.difficulty)}${'◇'.repeat(5-meta.difficulty)}</div>`;button.onclick=()=>choose(id);U.roster.appendChild(button)}refreshSelection()}
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

function humanCommand(fighter){
  const side=fighter.side;
  return{
    down:action=>input.actionIsDown(side,action),
    pressed:action=>{
      const label=input.actionLabel(side,action,{air:!fighter.grounded});
      const activated=input.consumeAction(side,action);
      if(activated&&trainingState.enabled)recordInput(label);
      return activated;
    }
  };
}
function aiCommand(fighter,foe){
  const decision=decideCPU(fighter,foe,difficulty),down=new Set(),pressed=new Set(decision.actions);if(decision.move)down.add(decision.move);if(decision.block)down.add('b');
  return{down:action=>down.has(action),pressed:action=>pressed.has(action)};
}
function commandFor(fighter){
  if(trainingState.enabled&&fighter.side===2)return trainingState.dummy==='cpu'?aiCommand(fighter,fighter.foe()):dummyCommand(fighter);
  return fighter.cpu?aiCommand(fighter,fighter.foe()):humanCommand(fighter);
}

function setup(){
  if(p1id===p2id)p2id=different(p1id);clearTransient();touchControls.releaseAll();touchControls.setFighter(p1id);touchControls.setMatchUiVisible(true);input.clear();paused=false;touchControls.setPaused(false);time=limit;
  world.fighters=[new Fighter(p1id,1,false,world,{appearance:selectedAppearance(1)}),new Fighter(p2id,2,mode!=='local'&&mode!=='training',world,{appearance:selectedAppearance(2)})];
  abilityHotbar.setFighter(p1id);abilityHotbar.setVisible(true,touchControls.enabled);abilityHotbar.root?.classList.remove('hotbar-paused');$('touchLayer').classList.toggle('hotbar-enabled',touchControls.enabled);responsiveLayout.apply();
  U.p1n.textContent=`${ROSTER[p1id].n.toUpperCase()}  ${wins1}`;U.p2n.textContent=`${wins2}  ${ROSTER[p2id].n.toUpperCase()}`;
  U.rl.textContent=mode==='story'?`STORY ${story+1}/${STORY_ORDER.length} • ROUND ${currentRound}`:mode==='training'?'TRAINING':`ROUND ${currentRound}`;
  const finalRound=wins1===roundsToWin-1&&wins2===roundsToWin-1;roundIntro=120;roundBanner.textContent=finalRound?'FINAL ROUND':`ROUND ${currentRound}`;roundBanner.classList.remove('hidden');sound('roundStart');
  U.msg.classList.add('hidden');U.pause.classList.add('hidden');pauseMenu.hide();resultsScreen.hide();state='playing';hintTimer=360;last=performance.now();
}
async function startGame(){
  fighterVisuals.configure({enabled:U.spriteToggle.value==='on',quality:U.spriteQuality.value,developerViewer:U.spriteDebug.checked,exposePrototypeAppearances:developerSpriteBuild&&U.prototypeExpose.checked});
  const fightButton=$('fight'),originalLabel=fightButton.textContent;fightButton.disabled=true;fightButton.textContent='LOADING…';loadingManager.start('FIGHTER ASSETS','Preparing fighters and sprite fallbacks…');loadingManager.set(40);
  let spriteResult;try{spriteResult=await fighterVisuals.preloadForMatch([p1id,p2id])}catch(error){spriteResult={ready:false,reason:'load-failed',error};fighterVisuals.configure({enabled:false})}fightButton.disabled=false;fightButton.textContent=originalLabel;
  loadingManager.set(80,'STAGE & MATCH','Initializing stage, audio hooks, and match state…');loadingManager.finish();
  if(shouldShowRrvvfoLoadFailure(spriteResult,fighterVisuals.settings.enabled))U.notice.textContent='One or more character sprite atlases could not load. Legacy visuals are active for the affected fighter.';
  mode=U.mode.value;trainingState.enabled=mode==='training';trainingHud.classList.toggle('hidden',!trainingState.enabled);if(trainingState.enabled)clearTraining();
  difficulty=U.diff.value;world.cinematicMode=U.cine.value;world.localMode=mode==='local';world.reducedShake=U.reduced.checked;limit=+U.rt.value;roundsToWin=mode==='story'?1:+U.rounds.value;currentRound=1;wins1=wins2=story=0;
  if(mode==='story'){p2id=STORY_ORDER[0];if(p2id===p1id){story++;p2id=STORY_ORDER[story]}stage=STORY_STAGES[story]}else stage=U.stage.value;
  hideMenuLayers();U.game.classList.remove('hidden');document.body.classList.add('gameplay-active');window.scrollTo(0,0);statistics.reset();saveLastActivity();
  const touchEnabled=wantsTouchControls();
  touchControls.startMatch({training:trainingState.enabled,show:touchEnabled});
  if(touchEnabled){input.lastInputDevice[0]='touch';mobilePlatform.activateMatch()}else mobilePlatform.deactivateMatch();
  setup();
  if(touchEnabled)beginMobilePresentation();else fullscreenManager.start({touch:false});
  if(fighterVisuals.settings.developerViewer)spriteDebugViewer.show();else spriteDebugViewer.hide();
  if(touchEnabled&&(!touchSettings.chooserShown||!touchSettings.tutorialComplete)){setPaused(true);pauseMenu.hide()}
}
function over(winner){
  state='over';touchControls.releaseAll();touchControls.setMatchUiVisible(false);abilityHotbar.setVisible(false);clearTransient();winner.victory=1;roundBanner.textContent='K.O.';roundBanner.classList.remove('hidden');sound('ko');const p1win=winner===world.fighters[0];if(p1win)wins1++;else wins2++;const matchWon=wins1>=roundsToWin||wins2>=roundsToWin;
  if(!matchWon){currentRound++;show(p1win?`${ROSTER[p1id].n} TAKES ROUND ${currentRound-1}`:`${ROSTER[p2id].n} TAKES ROUND ${currentRound-1}`,`Score: ${wins1}–${wins2}`,'NEXT ROUND',setup);return}
  if(mode==='story'&&p1win){story++;currentRound=1;wins1=wins2=0;if(story>=STORY_ORDER.length){localStorage.setItem(SAVE_KEY,JSON.stringify({cleared:true,date:Date.now()}));show('STORY CLEARED!','You defeated the full Clash of Souls roster. Your victory is saved in this browser.','PLAY AGAIN',()=>{story=0;p2id=STORY_ORDER[0];stage=STORY_STAGES[0];setup()});return}p2id=STORY_ORDER[story];if(p2id===p1id){story++;if(story>=STORY_ORDER.length){localStorage.setItem(SAVE_KEY,JSON.stringify({cleared:true,date:Date.now()}));show('STORY CLEARED!','You defeated the full Clash of Souls roster.','PLAY AGAIN',startGame);return}p2id=STORY_ORDER[story]}stage=STORY_STAGES[story];show('NEXT FIGHT',`${ROSTER[p2id].n} enters ${STAGES[stage].n}.`,'CONTINUE',setup)}
  else{sound('victory');const summary=statistics.finish(world.fighters);resultsScreen.show({winner:p1win?`${ROSTER[p1id].n} WINS THE MATCH!`:`${ROSTER[p2id].n} WINS THE MATCH!`,durationMs:summary.durationMs,players:summary.players,local:mode==='local'})}
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
  if(!trainingState.enabled)time=Math.max(0,time-dt);
  for(const fighter of world.fighters)fighter.update(commandFor(fighter));
  if(--hintTimer<=0){const hint=firstTimeHints.next({combo:world.fighters.some(fighter=>fighter.combo.hits>0),cinematic:world.cinematic.active,clash:world.clash.active});if(hint)notifications.push(hint,{key:`hint-${firstTimeHints.index}`,cooldown:0});hintTimer=900}
  if(trainingState.enabled){if(trainingState.infiniteHealth)for(const fighter of world.fighters)fighter.hp=100;if(trainingState.infiniteEnergy)for(const fighter of world.fighters)fighter.en=100;if(trainingState.infiniteGuard)for(const fighter of world.fighters)fighter.guard=fighter.guardMax}
  for(const projectile of world.projectiles)projectile.update(world);world.projectiles=world.projectiles.filter(projectile=>!projectile.dead);world.effects.update();
  if(!trainingState.enabled&&(world.fighters[0].hp<=0||world.fighters[1].hp<=0||time<=0)){const [a,b]=world.fighters,winner=a.hp===b.hp?world.fighters[Math.random()<.5?0:1]:a.hp>b.hp?a:b;over(winner)}
}
function render(){
  ctx.save();if(world.shake>0){const visibleShake=world.shake*(world.shakeScale??1);ctx.translate((Math.random()-.5)*visibleShake,(Math.random()-.5)*visibleShake);world.shake*=.86;if(world.shake<.5)world.shake=0}
  applyCamera(ctx,world.camera,WIDTH,HEIGHT);
  drawStage(ctx,stage,WIDTH,HEIGHT,GROUND);world.effects.draw(ctx);for(const fighter of world.fighters)fighter.draw(ctx);for(const projectile of world.projectiles)projectile.draw(ctx);ctx.restore();
  drawCinematicOverlay(ctx,world.cinematic,WIDTH,HEIGHT,{flashScale:world.flashScale,effects:qolSettings.accessibility.ultimateEffects});
  if(!world.fighters.length)return;const blinded=world.fighters.find(fighter=>fighter.lens>0&&!fighter.cpu);
  if(blinded){ctx.save();ctx.fillStyle=qolSettings.accessibility.lensOverlay==='reduced'?'rgba(0,0,0,.72)':'rgba(0,0,0,.96)';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.textAlign='center';ctx.fillStyle='#f7f7ff';ctx.font='900 30px Segoe UI';ctx.fillText('LENS OF TRUTH',WIDTH/2,HEIGHT/2-8);ctx.font='bold 16px Segoe UI';ctx.fillStyle='#cfd6ff';ctx.fillText(blinded.lens<60?'WARNING • LENS ENDING':'VISION LOST • AUTO-DODGE ACTIVE',WIDTH/2,HEIGHT/2+24);ctx.restore()}
  world.fighters.forEach((fighter,index)=>comboHud[index].innerHTML=fighter.combo.hits>1?`${fighter.combo.hits} HIT COMBO<small>${fighter.combo.damage.toFixed(1)} DAMAGE • ${Math.round(fighter.combo.scale*100)}% SCALE</small>`:'');
  const hudModels=world.fighters.map(fighterHudModel);hudModels.forEach((model,index)=>{cooldownHud[index].textContent=cooldownText(model)});
  abilityHotbar.update();
  clashHud.classList.toggle('hidden',!world.clash.active);
  if(world.clash.active){$('clashLabel').textContent=world.clash.type==='beam'?'BEAM CLASH!':world.clash.type==='ultimate'?'ULTIMATE CLASH!':'CLASH!';const amount=(world.clash.meter+100)/2;$('clashFill').style.left=`${Math.min(50,amount)}%`;$('clashFill').style.width=`${Math.abs(amount-50)}%`}
  if(trainingState.enabled){$('trainStats').innerHTML=`COMBO ${world.fighters[0].combo.hits}<br>DAMAGE ${world.fighters[0].combo.damage.toFixed(1)}<br>SCALING ${Math.round(world.fighters[0].combo.scale*100)}%<br>GUARD DMG ${world.fighters[1].guardDamageLast.toFixed(1)}<br>PB WINDOW ${world.fighters[0].perfectBlockWindow}<br>DUMMY ${trainingState.dummy.toUpperCase()}<br>CLASH ${world.clash.active?`${world.clash.type.toUpperCase()} ${world.clash.meter.toFixed(1)}`:trainingState.forceNextClash?'ARMED':'READY'}`;$('trainMoves').innerHTML=`<b>${ROSTER[p1id].n} MOVE LIST</b><br>${moveList(p1id).join('<br>')||'Legacy light • heavy • launcher • air • special • ultimate'}`;$('trainComboPrompt').textContent=`${input.inputStyleName(1)} ROUTE: ${input.comboPrompt(1)}`;$('trainInputs').textContent=`INPUTS: ${trainingState.inputHistory.join(' › ')}`}
  const [a,b]=world.fighters,[ha,hb]=hudModels;U.p1h.style.width=a.hp+'%';U.p2h.style.width=b.hp+'%';U.p1e.style.width=a.en+'%';U.p2e.style.width=b.en+'%';U.p1g.style.width=a.guard+'%';U.p2g.style.width=b.guard+'%';U.p1hpText.textContent=ha.health;U.p2hpText.textContent=hb.health;U.p1enText.textContent=ha.energy;U.p2enText.textContent=hb.energy;U.p1guardText.textContent=ha.guard;U.p2guardText.textContent=hb.guard;U.p1d.textContent=`${ha.ultimateReady?'◆ ULT READY':'◇ ULT CHARGING'} • ${ha.breakerReady?'◇ BREAKER READY':'× BREAKER SPENT'}`;U.p2d.textContent=`${hb.ultimateReady?'◆ ULT READY':'◇ ULT CHARGING'} • ${hb.breakerReady?'◇ BREAKER READY':'× BREAKER SPENT'}`;U.p1status.textContent=ha.statuses.join(' • ');U.p2status.textContent=hb.statuses.join(' • ');U.timer.textContent=Math.ceil(time);
}
let fpsFrames=0,fpsStamp=performance.now();function loop(timestamp){const delta=Math.min(.034,(timestamp-last)/1000||0);last=timestamp;acc+=delta;while(acc>=1/60){update(1/60);acc-=1/60}if(state!=='menu')render();fpsFrames++;if(timestamp-fpsStamp>=500){$('fpsDisplay').textContent=`${Math.round(fpsFrames*1000/(timestamp-fpsStamp))} FPS`;fpsFrames=0;fpsStamp=timestamp}requestAnimationFrame(loop)}

U.slot1.onclick=()=>{selectSlot=1;refreshSelection()};U.slot2.onclick=()=>{selectSlot=2;refreshSelection()};
U.mode.onchange=()=>{U.s2l.textContent=U.mode.value==='local'?'PLAYER 2 — CLICK TO SELECT':'CPU/DUMMY — CLICK TO SELECT';$('trainingOptions').classList.toggle('hidden',U.mode.value!=='training');refreshAppearancePanels()};
U.appearanceSelects.forEach((select,index)=>select.onchange=()=>setAppearance(index+1,select.value));
U.spriteToggle.onchange=()=>fighterVisuals.configure({enabled:U.spriteToggle.value==='on'});
U.spriteQuality.onchange=()=>fighterVisuals.configure({quality:U.spriteQuality.value});
U.spriteDebug.onchange=()=>fighterVisuals.configure({developerViewer:U.spriteDebug.checked});
U.prototypeExpose.onchange=()=>{fighterVisuals.configure({exposePrototypeAppearances:developerSpriteBuild&&U.prototypeExpose.checked});refreshAppearancePanels()};
$('random').onclick=()=>{p1id=ROSTER_IDS[Math.floor(Math.random()*ROSTER_IDS.length)];p2id=different(p1id);refreshSelection()};$('reset').onclick=()=>confirmation.open({title:'Reset All Save Data?',message:'Story progress, settings, controls, appearances, and Training presets will be removed.',accept:'RESET ALL'}).then(ok=>{if(ok){resetSaveGroup('all');location.reload()}});$('fight').onclick=startGame;
$('chooseStage').onclick=()=>openStageSelect('character');
$('backMenu').onclick=returnToCharacterSelect;
let quickRestartHeldAt=0;
// start-screen-pointer-hotfix-263
const activateStartFromPointer=event=>{
  if(!U.start||U.start.classList.contains('hidden'))return;
  event?.preventDefault?.();
  activateStart();
  audio.enable()
    .then(enabled=>$('audioEnableNotice')?.classList.toggle('hidden',enabled))
    .catch(()=>{});
};
U.start.addEventListener('pointerdown',activateStartFromPointer);
$('startPrompt')?.addEventListener('click',activateStartFromPointer);

addEventListener('keydown',event=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code))event.preventDefault();
  if(!U.start.classList.contains('hidden')){event.preventDefault();activateStart();audio.enable().then(enabled=>$('audioEnableNotice').classList.toggle('hidden',enabled));return}
  if(!U.main.classList.contains('hidden')){if(['ArrowUp','ArrowLeft'].includes(event.code)){mainMenu.move(-1);sound('menuMove');event.preventDefault();return}if(['ArrowDown','ArrowRight'].includes(event.code)){mainMenu.move(1);sound('menuMove');event.preventDefault();return}if(['Enter','Space'].includes(event.code)){mainMenu.confirm();event.preventDefault();return}}
  if(event.code==='Escape'){event.preventDefault();if(!$('confirmDialog').classList.contains('hidden')){confirmation.close();return}if(!$('hotbarCustomizeModal').classList.contains('hidden')){closeHotbarCustomize();return}if(!$('fullscreenPrompt').classList.contains('hidden')){fullscreenManager.finish();return}if(!$('orientationPrompt').classList.contains('hidden')){orientationManager.finish();return}if(!$('moveListPanel').classList.contains('hidden')){closeAdaptiveMoveList();return}if(!$('settingsPanel').classList.contains('hidden')){requestCloseSettings();return}if(!$('extrasPanel').classList.contains('hidden')){$('extrasPanel').classList.add('hidden');return}if(!$('stageSelectPanel').classList.contains('hidden')){closeStageSelect(false);return}if(state==='playing'){togglePause();return}if(!U.menu.classList.contains('hidden')){showMainMenu();return}}
  const abilitySlot=/^Digit([1-5])$/.exec(event.code);if(abilitySlot&&state==='playing'&&!paused&&!event.repeat){event.preventDefault();abilityHotbar.activateSlot(Number(abilitySlot[1]),'keyboard');return}
  input.setKeyboard(event.code,true);if(event.code==='KeyY'&&trainingState.enabled)resetTrainingWorld(world,input);if(event.code==='KeyP'&&state==='playing')togglePause();if(event.code===qolSettings.gameplay.quickRestartKey&&state==='playing'&&!quickRestartHeldAt)quickRestartHeldAt=performance.now();
});
addEventListener('keyup',event=>{input.setKeyboard(event.code,false);if(event.code===qolSettings.gameplay.quickRestartKey&&quickRestartHeldAt){const held=performance.now()-quickRestartHeldAt;quickRestartHeldAt=0;if(trainingState.enabled){resetTrainingWorld(world,input);notifications.push('TRAINING RESET',{important:true,key:'quick-reset'})}else if(held>=600)confirmation.open({title:'Restart Match?',message:'Keep fighters, stage, rules, appearances, and devices?',accept:'RESTART'}).then(ok=>{if(ok){currentRound=1;wins1=wins2=0;statistics.reset();setup()}});else notifications.push('HOLD QUICK RESTART',{key:'hold-restart'})}});
document.addEventListener('controllercancel',()=>{if(!$('confirmDialog').classList.contains('hidden'))confirmation.close();else if(!$('hotbarCustomizeModal').classList.contains('hidden'))closeHotbarCustomize();else if(!$('fullscreenPrompt').classList.contains('hidden'))fullscreenManager.finish();else if(!$('orientationPrompt').classList.contains('hidden'))orientationManager.finish();else if(!$('controlsPanel').classList.contains('hidden'))closeControlsPanel();else if(!$('controllerAssignments').classList.contains('hidden'))controllerManager.closeAssignments();else if(!$('moveListPanel').classList.contains('hidden'))closeAdaptiveMoveList();else if(!$('settingsPanel').classList.contains('hidden'))requestCloseSettings();else if(state==='playing')togglePause();else if(!U.menu.classList.contains('hidden'))showMainMenu()});
document.addEventListener('controllerinput',()=>{if(!U.start.classList.contains('hidden')){activateStart();audio.enable().then(enabled=>$('audioEnableNotice').classList.toggle('hidden',enabled))}});
$('touchSettingsButton').onclick=openTouchSettings;
$('closeTouchMoveList').onclick=()=>$('touchMoveList').classList.add('hidden');
$('finishLayoutEdit').onclick=()=>{touchControls.layoutEditor.setEditing(false);const selected=$('touchLayer').dataset.selectedControl;if(selected)$('touchSelectedControl').value=selected;touchSettingsPanel.open()};
$('abilityHotbar').addEventListener('hotbarcustomize',openHotbarCustomize);$('closeHotbarCustomize').onclick=closeHotbarCustomize;$('doneHotbarCustomize').onclick=closeHotbarCustomize;$('hotbarMoveLeft').onclick=()=>{abilityHotbar.moveSelected($('hotbarAbilitySelect').value,-1);syncHotbarCustomize()};$('hotbarMoveRight').onclick=()=>{abilityHotbar.moveSelected($('hotbarAbilitySelect').value,1);syncHotbarCustomize()};$('hotbarRestoreDefaults').onclick=()=>{abilityHotbar.restoreDefaults();syncHotbarCustomize()};$('hotbarLayoutLocked').onchange=()=>{abilityHotbar.settings.locked=$('hotbarLayoutLocked').checked;persistHotbarUi()};
$('characterSelectBack').onclick=showMainMenu;$('characterMoveList').onclick=()=>openAdaptiveMoveList(p1id,1);$('closeMoveList').onclick=closeAdaptiveMoveList;$('closeControlsPanel').onclick=closeControlsPanel;$('stageSelectConfirm').onclick=()=>closeStageSelect(true);$('stageSelectCancel').onclick=()=>closeStageSelect(false);$('closeSettings').onclick=requestCloseSettings;$('cancelSettings').onclick=requestCloseSettings;$('applySettings').onclick=()=>{settingsPanel.apply();settingsPanel.close({discard:false})};$('restoreCategory').onclick=()=>settingsPanel.resetCategory();$('restoreAllSettings').onclick=()=>confirmation.open({title:'Restore All Settings?',message:'All QOL categories will return to defaults after Apply.',accept:'RESTORE'}).then(ok=>{if(ok)settingsPanel.resetAll()});$('closeExtras').onclick=()=>$('extrasPanel').classList.add('hidden');document.querySelectorAll('[data-extra]').forEach(button=>button.onclick=()=>showExtra(button.dataset.extra));$('loadingRetry').onclick=()=>startGame();$('loadingReturn').onclick=showMainMenu;

const controllerActionNames={j:'Jump',a:'Light',h:'Heavy',s:'Special',d:'Dash',b:'Block',u:'Ultimate',k:'Breaker'};
function controllerSummary(side){
  const mapping=input.controllerMapping(side),label=`P${side} ${mapping.name}`;
  return `${label}: ${mapping.labels.j} jump • ${mapping.labels.a} light • ${mapping.labels.h} heavy • ${mapping.labels.s} special • Up+${mapping.labels.h} launcher • ${mapping.labels.a}+${mapping.labels.h} throw • ${mapping.labels.d} dash • ${mapping.labels.b} block • ${mapping.labels.u} ultimate • ${mapping.labels.k} breaker`;
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

buildRoster();U.mode.dispatchEvent(new Event('change'));input.setControllerStyle(1,U.controller1.value);input.setControllerStyle(2,U.controller2.value);renderCustomBindings();updateControllerGuide();applyQolSettings(qolSettings,{persist:false});document.querySelectorAll('[data-build-version]').forEach(element=>element.textContent=BUILD_VERSION);if(localStorage.getItem(SAVE_KEY))U.notice.textContent='Story clear detected on this browser.';$('touchStatus').textContent=mobilePlatform.info.touch?`Touch Controls Ready • ${touchSettings.movement==='dpad'?'Virtual D-Pad':'Virtual Joystick'}`:'Touch controls available when detected';if(localStorage.getItem(STARTED_KEY)){U.start.classList.add('hidden');U.main.classList.remove('hidden');renderQuickContinue();controllerManager.promptAfterStart()}else{U.start.classList.remove('hidden');U.main.classList.add('hidden');$('startPrompt').textContent=mobilePlatform.info.touch?'TAP TO START':'PRESS ANY BUTTON'}if(mobilePlatform.info.touch&&!touchSettings.chooserShown)touchControls.showChooser();addEventListener('pointerdown',()=>{if(!U.start.classList.contains('hidden'))activateStart();audio.enable().then(enabled=>$('audioEnableNotice').classList.toggle('hidden',enabled))},{once:true});requestAnimationFrame(loop);
