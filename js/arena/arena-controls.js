export const ARENA_CONTROL_SETTINGS_KEY='pxArenaControlsV1';

export const PC_LAYOUTS=Object.freeze({
  classic:Object.freeze({
    id:'classic',label:'Classic',description:'Original Parallels X keyboard layout',
    move:{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'},
    actions:{jump:'Space',light:'KeyF',heavy:'KeyR',launcher:'KeyT',dash:'ShiftLeft',block:'KeyQ',charge:'KeyC',grab:'KeyG'}
  }),
  ergonomic:Object.freeze({
    id:'ergonomic',label:'Two-Hand Ergonomic',description:'Movement on the left, attacks on the right',
    move:{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'},
    actions:{jump:'Space',light:'KeyJ',heavy:'KeyK',launcher:'KeyI',dash:'ShiftLeft',block:'KeyL',charge:'KeyC',grab:'KeyU'}
  })
});

export const MOBILE_LAYOUTS=Object.freeze({
  standard:Object.freeze({id:'standard',label:'Standard',scale:1}),
  compact:Object.freeze({id:'compact',label:'Compact',scale:.84}),
  large:Object.freeze({id:'large',label:'Large Buttons',scale:1.16})
});

export function defaultArenaControlSettings(){
  return{version:2,pcLayout:'ergonomic',mousePrimaryAttack:'light',touchMode:'auto',mobileLayout:'standard',handedness:'right',opacity:.88,showLabels:true};
}

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

export function sanitizeArenaControlSettings(value={}){
  const defaults=defaultArenaControlSettings();
  return{
    version:2,
    pcLayout:PC_LAYOUTS[value.pcLayout]?value.pcLayout:defaults.pcLayout,
    mousePrimaryAttack:['light','heavy'].includes(value.mousePrimaryAttack)?value.mousePrimaryAttack:defaults.mousePrimaryAttack,
    touchMode:['auto','on','off'].includes(value.touchMode)?value.touchMode:defaults.touchMode,
    mobileLayout:MOBILE_LAYOUTS[value.mobileLayout]?value.mobileLayout:defaults.mobileLayout,
    handedness:['right','left'].includes(value.handedness)?value.handedness:defaults.handedness,
    opacity:clamp(Number(value.opacity)||defaults.opacity,.45,1),
    showLabels:value.showLabels!==false
  };
}

export function loadArenaControlSettings(storage=localStorage){
  try{return sanitizeArenaControlSettings(JSON.parse(storage.getItem(ARENA_CONTROL_SETTINGS_KEY)||'null')||{})}catch{return defaultArenaControlSettings()}
}

export function saveArenaControlSettings(settings,storage=localStorage){
  try{storage.setItem(ARENA_CONTROL_SETTINGS_KEY,JSON.stringify(sanitizeArenaControlSettings(settings)));return true}catch{return false}
}

function labelForCode(code){
  const labels={Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT',KeyA:'A',KeyD:'D',KeyW:'W',KeyS:'S',KeyF:'F',KeyR:'R',KeyT:'T',KeyQ:'Q',KeyJ:'J',KeyK:'K',KeyI:'I',KeyL:'L',KeyC:'C',KeyG:'G',KeyU:'U'};
  return labels[code]||code.replace(/^Key/,'').replace(/^Digit/,'');
}

export class ArenaControlManager{
  constructor(root,{storage=localStorage,onPause=()=>{},onExit=()=>{},onAbility=()=>{},onSettings=()=>{},onOpenSettings=()=>{},onCloseSettings=()=>{}}={}){
    this.root=root;this.storage=storage;this.onPause=onPause;this.onExit=onExit;this.onAbility=onAbility;this.onSettings=onSettings;this.onOpenSettings=onOpenSettings;this.onCloseSettings=onCloseSettings;
    this.settings=loadArenaControlSettings(storage);this.keys=new Set();this.pressed=new Set();this.mouseDown=new Set();this.mousePressed=new Set();this.touchDown=new Set();this.touchPressed=new Set();this.previousButtons=[];this.previousGamepadMoveMagnitude=0;this.lastMoveTap=new Map();this.queuedDirectionalDash=null;this.joystickFlickArmed=false;this.joystickStartedAt=0;this.selectedAbility=0;this.active=false;this.joystickPointer=null;this.joystickCenter={x:0,y:0};this.joystick={x:0,z:0};this.lastInput='keyboard';
    this.boundKeyDown=event=>this.keyDown(event);this.boundKeyUp=event=>this.keyUp(event);this.boundMouseDown=event=>this.mouseDownEvent(event);this.boundMouseUp=event=>this.mouseUpEvent(event);this.boundContextMenu=event=>{if(this.active){event.preventDefault();event.stopPropagation()}};
    this.surface=root.querySelector('canvas');this.pad=root.querySelector('[data-arena-move-pad]');this.knob=root.querySelector('[data-arena-move-knob]');this.settingsPanel=root.querySelector('[data-arena-control-settings]');this.help=root.querySelector('[data-arena-help]');
    this.bindTouch();this.bindSettings();this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>button.addEventListener('pointerdown',()=>{this.selectedAbility=index;this.selectAbility(0)}));this.applySettings();this.selectAbility(0);
  }

  isTouchDevice(){return (typeof navigator!=='undefined'&&navigator.maxTouchPoints>0)||(typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches)}
  touchEnabled(){return this.settings.touchMode==='on'||(this.settings.touchMode==='auto'&&this.isTouchDevice())}
  layout(){return PC_LAYOUTS[this.settings.pcLayout]||PC_LAYOUTS.ergonomic}

  start(){if(this.active)return;this.active=true;addEventListener('keydown',this.boundKeyDown,true);addEventListener('keyup',this.boundKeyUp,true);this.surface?.addEventListener('pointerdown',this.boundMouseDown,true);addEventListener('pointerup',this.boundMouseUp,true);this.surface?.addEventListener('contextmenu',this.boundContextMenu,true);this.applySettings()}
  stop(){if(!this.active)return;this.active=false;removeEventListener('keydown',this.boundKeyDown,true);removeEventListener('keyup',this.boundKeyUp,true);this.surface?.removeEventListener('pointerdown',this.boundMouseDown,true);removeEventListener('pointerup',this.boundMouseUp,true);this.surface?.removeEventListener('contextmenu',this.boundContextMenu,true);this.releaseAll();this.closeSettings()}
  releaseAll(){this.keys.clear();this.pressed.clear();this.mouseDown.clear();this.mousePressed.clear();this.touchDown.clear();this.touchPressed.clear();this.lastMoveTap.clear();this.queuedDirectionalDash=null;this.joystickFlickArmed=false;this.previousGamepadMoveMagnitude=0;this.joystickPointer=null;this.joystick={x:0,z:0};this.moveKnob(0,0)}

  capturedCodes(){const layout=this.layout(),codes=[...Object.values(layout.move),...Object.values(layout.actions)];if(layout.actions.dash==='ShiftLeft')codes.push('ShiftRight');return new Set([...codes,'Digit1','Digit2','Digit3','Digit4','Digit5','KeyP','Escape'])}
  keyDown(event){
    if(!this.active)return;const captured=this.capturedCodes();if(captured.has(event.code)){event.preventDefault();event.stopImmediatePropagation()}
    if(event.code==='Escape'){if(!this.settingsPanel?.classList.contains('hidden'))this.closeSettings();else this.onExit();return}
    if(event.code==='KeyP'&&!event.repeat){this.onPause();return}
    const slot=/^Digit([1-5])$/.exec(event.code);if(slot&&!event.repeat){this.selectedAbility=Number(slot[1])-1;this.selectAbility(0);this.onAbility(Number(slot[1]));return}
    if(!event.repeat&&Object.values(this.layout().move).includes(event.code)){const now=performance.now(),last=this.lastMoveTap.get(event.code)||0;if(now-last<=240){this.queuedDirectionalDash=event.code;this.lastMoveTap.delete(event.code)}else this.lastMoveTap.set(event.code,now)}
    if(!event.repeat&&!this.keys.has(event.code))this.pressed.add(event.code);this.keys.add(event.code);this.lastInput='keyboard';this.applyInputPresentation();
  }
  keyUp(event){if(!this.active)return;this.keys.delete(event.code);if(this.capturedCodes().has(event.code)){event.preventDefault();event.stopImmediatePropagation()}}

  mouseDownEvent(event){
    if(!this.active||event.pointerType!=='mouse'||![0,2].includes(event.button)||!this.settingsPanel?.classList.contains('hidden'))return;
    event.preventDefault();event.stopPropagation();if(!this.mouseDown.has(event.button))this.mousePressed.add(event.button);this.mouseDown.add(event.button);this.lastInput='mouse';this.applyInputPresentation();
  }
  mouseUpEvent(event){if(event.pointerType!=='mouse'||![0,2].includes(event.button))return;this.mouseDown.delete(event.button)}

  consumeKey(code){const had=this.pressed.has(code);this.pressed.delete(code);return had}
  consumeMouse(button){const had=this.mousePressed.has(button);this.mousePressed.delete(button);return had}
  consumeTouch(action){const had=this.touchPressed.has(action);this.touchPressed.delete(action);return had}

  read(){
    const layout=this.layout(),move=layout.move,actions=layout.actions;
    let x=(this.keys.has(move.right)?1:0)-(this.keys.has(move.left)?1:0),z=(this.keys.has(move.down)?1:0)-(this.keys.has(move.up)?1:0);
    if(Math.abs(this.joystick.x)>Math.abs(x))x=this.joystick.x;if(Math.abs(this.joystick.z)>Math.abs(z))z=this.joystick.z;
    const directionalDash=this.queuedDirectionalDash;this.queuedDirectionalDash=null;if(directionalDash===move.left)x=-1;else if(directionalDash===move.right)x=1;else if(directionalDash===move.up)z=-1;else if(directionalDash===move.down)z=1;
    let jump=this.consumeKey(actions.jump)||this.consumeTouch('jump'),light=this.consumeKey(actions.light)||this.consumeTouch('light'),heavy=this.consumeKey(actions.heavy)||this.consumeTouch('heavy'),launcher=this.consumeKey(actions.launcher)||this.consumeTouch('launcher'),dash=!!directionalDash||this.consumeKey(actions.dash)||(actions.dash==='ShiftLeft'&&this.consumeKey('ShiftRight'))||this.consumeTouch('dash'),block=this.keys.has(actions.block)||this.mouseDown.has(2)||this.touchDown.has('block'),charge=this.keys.has(actions.charge)||this.touchDown.has('charge'),grab=this.consumeKey(actions.grab)||this.consumeTouch('grab');const primaryClick=this.consumeMouse(0);if(primaryClick){if(this.settings.mousePrimaryAttack==='heavy')heavy=true;else light=true;}
    const gamepad=navigator.getGamepads?.()[0];if(gamepad){const axisX=Math.abs(gamepad.axes[0]||0)>.18?gamepad.axes[0]:0,axisZ=Math.abs(gamepad.axes[1]||0)>.18?gamepad.axes[1]:0,moveMagnitude=Math.hypot(axisX,axisZ);x=Math.abs(axisX)>Math.abs(x)?axisX:x;z=Math.abs(axisZ)>Math.abs(z)?axisZ:z;const buttons=gamepad.buttons.map(value=>value.pressed);jump||=buttons[0]&&!this.previousButtons[0];light||=buttons[2]&&!this.previousButtons[2];heavy||=buttons[3]&&!this.previousButtons[3];launcher||=buttons[3]&&buttons[12]&&(!this.previousButtons[3]||!this.previousButtons[12]);dash||=buttons[5]&&!this.previousButtons[5]||(moveMagnitude>.92&&this.previousGamepadMoveMagnitude<.28);block||=buttons[4];charge||=buttons[6];grab||=buttons[1]&&!this.previousButtons[1];if(buttons[14]&&!this.previousButtons[14])this.selectAbility(-1);if(buttons[15]&&!this.previousButtons[15])this.selectAbility(1);if(buttons[7]&&!this.previousButtons[7])this.onAbility(this.selectedAbility+1);if(buttons.some(Boolean)||Math.abs(axisX)+Math.abs(axisZ)>.1){this.lastInput='controller';this.applyInputPresentation()}this.previousButtons=buttons;this.previousGamepadMoveMagnitude=moveMagnitude}else this.previousGamepadMoveMagnitude=0
    return{x,z,jump,light,heavy,launcher,dash,block,charge,grab};
  }

  selectAbility(direction){this.selectedAbility=(this.selectedAbility+direction+5)%5;this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>{button.classList.toggle('selected',index===this.selectedAbility);button.setAttribute('aria-current',index===this.selectedAbility?'true':'false')})}

  bindTouch(){
    if(this.pad){
      this.pad.addEventListener('pointerdown',event=>{if(!this.touchEnabled()||this.joystickPointer!==null)return;event.preventDefault();this.joystickPointer=event.pointerId;this.joystickStartedAt=performance.now();this.joystickFlickArmed=true;this.pad.setPointerCapture?.(event.pointerId);const rect=this.pad.getBoundingClientRect();this.joystickCenter={x:rect.left+rect.width/2,y:rect.top+rect.height/2};this.updateJoystick(event);this.lastInput='touch';this.applyInputPresentation()});
      this.pad.addEventListener('pointermove',event=>{if(event.pointerId===this.joystickPointer)this.updateJoystick(event)});
      const release=event=>{if(event.pointerId!==this.joystickPointer)return;this.joystickPointer=null;this.joystickFlickArmed=false;this.joystick={x:0,z:0};this.moveKnob(0,0)};this.pad.addEventListener('pointerup',release);this.pad.addEventListener('pointercancel',release);this.pad.addEventListener('lostpointercapture',release);
    }
    this.root.querySelectorAll('[data-arena-touch-action]').forEach(button=>{
      const action=button.dataset.arenaTouchAction;
      const press=event=>{if(!this.touchEnabled())return;event.preventDefault();button.setPointerCapture?.(event.pointerId);if(!this.touchDown.has(action))this.touchPressed.add(action);this.touchDown.add(action);button.classList.add('pressed');this.lastInput='touch';this.applyInputPresentation()};
      const release=event=>{event.preventDefault();this.touchDown.delete(action);button.classList.remove('pressed')};
      button.addEventListener('pointerdown',press);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    });
    this.root.querySelector('[data-arena-touch-pause]')?.addEventListener('click',event=>{event.preventDefault();this.onPause()});
    this.root.querySelector('[data-arena-touch-settings]')?.addEventListener('click',event=>{event.preventDefault();this.openSettings()});
  }

  updateJoystick(event){const radius=Math.max(24,this.pad.getBoundingClientRect().width*.36),dx=event.clientX-this.joystickCenter.x,dy=event.clientY-this.joystickCenter.y,length=Math.hypot(dx,dy),scale=length>radius?radius/length:1,nx=dx*scale/radius,nz=dy*scale/radius,dead=.16,magnitude=Math.hypot(nx,nz);if(this.joystickFlickArmed&&performance.now()-this.joystickStartedAt<=180&&magnitude>.9){this.touchPressed.add('dash');this.joystickFlickArmed=false}else if(performance.now()-this.joystickStartedAt>180)this.joystickFlickArmed=false;this.joystick={x:Math.abs(nx)<dead?0:nx,z:Math.abs(nz)<dead?0:nz};this.moveKnob(nx,nz)}
  moveKnob(x,z){if(!this.knob)return;this.knob.style.transform=`translate(${x*42}px,${z*42}px)`}

  bindSettings(){
    this.root.querySelector('[data-arena-open-controls]')?.addEventListener('click',()=>this.openSettings());
    this.root.querySelectorAll('[data-arena-controls-close]').forEach(button=>button.addEventListener('click',()=>this.closeSettings()));
    const fields={pcLayout:'[data-control-pc-layout]',mousePrimaryAttack:'[data-control-mouse-attack]',touchMode:'[data-control-touch-mode]',mobileLayout:'[data-control-mobile-layout]',handedness:'[data-control-handedness]',opacity:'[data-control-opacity]',showLabels:'[data-control-labels]'};
    for(const [key,selector] of Object.entries(fields)){const element=this.root.querySelector(selector);if(!element)continue;const eventName=element.type==='range'?'input':'change';element.addEventListener(eventName,()=>{this.settings={...this.settings,[key]:element.type==='checkbox'?element.checked:element.type==='range'?Number(element.value):element.value};this.settings=sanitizeArenaControlSettings(this.settings);saveArenaControlSettings(this.settings,this.storage);this.applySettings();this.onSettings(this.settings)})}
    this.root.querySelector('[data-arena-controls-reset]')?.addEventListener('click',()=>{this.settings=defaultArenaControlSettings();saveArenaControlSettings(this.settings,this.storage);this.applySettings();this.syncSettingsForm()});
  }
  syncSettingsForm(){const map={pcLayout:'[data-control-pc-layout]',mousePrimaryAttack:'[data-control-mouse-attack]',touchMode:'[data-control-touch-mode]',mobileLayout:'[data-control-mobile-layout]',handedness:'[data-control-handedness]',opacity:'[data-control-opacity]',showLabels:'[data-control-labels]'};for(const [key,selector] of Object.entries(map)){const element=this.root.querySelector(selector);if(!element)continue;if(element.type==='checkbox')element.checked=!!this.settings[key];else element.value=String(this.settings[key])}}
  openSettings(){if(!this.settingsPanel?.classList.contains('hidden'))return;this.syncSettingsForm();this.onOpenSettings();this.settingsPanel?.classList.remove('hidden');this.releaseAll()}
  closeSettings(){if(this.settingsPanel?.classList.contains('hidden'))return;this.settingsPanel?.classList.add('hidden');this.onCloseSettings()}

  applySettings(){
    const touch=this.touchEnabled();if(touch&&this.isTouchDevice()&&this.lastInput==='keyboard')this.lastInput='touch';this.root.classList.toggle('arena-touch-active',touch);this.root.classList.toggle('arena-left-handed',this.settings.handedness==='left');this.root.dataset.mobileLayout=this.settings.mobileLayout;this.root.style.setProperty('--arena-control-opacity',String(this.settings.opacity));this.root.classList.toggle('arena-labels-hidden',!this.settings.showLabels);this.applyInputPresentation();this.syncSettingsForm();
  }
  applyInputPresentation(){
    const touch=this.touchEnabled()&&this.lastInput==='touch';this.root.dataset.activeInput=touch?'touch':this.lastInput;
    const layout=this.layout(),a=layout.actions;
    if(this.help){if(this.lastInput==='controller')this.help.innerHTML='<b>CONTROLLER</b><br><span>Left Stick</span> move • <span>A</span> jump • <span>X</span> light • <span>Y</span> heavy • <span>Up + Y</span> launcher • <span>RB / stick flick</span> dash • <span>LB</span> block • <span>LT</span> charge • <span>B</span> grab • <span>D-Pad L/R + RT</span> abilities';else{const mouseAttack=this.settings.mousePrimaryAttack==='heavy'?'heavy':'light';this.help.innerHTML=`<b>${this.lastInput==='mouse'?'MOUSE + KEYBOARD':layout.label.toUpperCase()}</b><br><span class="moveKeys">WASD</span> move • <span>${labelForCode(a.jump)}</span> jump • <span>SHIFT / double-tap</span> dash • <span>M1</span> ${mouseAttack} • <span>M2</span> block • <span>${labelForCode(a.light)}</span> light • <span>${labelForCode(a.heavy)}</span> heavy • <span>${labelForCode(a.launcher)}</span> launcher • <span>${labelForCode(a.charge)}</span> charge • <span>${labelForCode(a.grab)}</span> grab • <span>1–5</span> abilities`;}}
    this.root.querySelectorAll('.arenaNumber').forEach((number,index)=>{number.textContent=touch?'TAP':String(index+1)});
  }
}
