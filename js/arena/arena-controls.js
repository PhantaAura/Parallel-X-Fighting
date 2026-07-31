import {CONTROL_MAPS} from '../input.js?v=29a28-mode-route-carousel-20260730';
import {sharedInput} from '../input-runtime.js?v=29a28-mode-route-carousel-20260730';

export const ARENA_CONTROL_SETTINGS_KEY='pxArenaControlsV1';

// Kept as an export for older chapter code, but there is now only one physical
// keyboard profile.  Arena, Training, standard battles, and Story all consume
// the same semantic InputManager actions.
const SHARED_ACTIONS=Object.freeze({
  jump:CONTROL_MAPS[0].j,
  light:CONTROL_MAPS[0].a,
  heavy:CONTROL_MAPS[0].h,
  launcher:CONTROL_MAPS[0].x,
  dash:CONTROL_MAPS[0].d,
  block:CONTROL_MAPS[0].b,
  charge:CONTROL_MAPS[0].k,
  grab:CONTROL_MAPS[0].s,
  breaker:CONTROL_MAPS[0].q,
  counter:CONTROL_MAPS[0].c,
  interact:CONTROL_MAPS[0].i
});
export const PC_LAYOUTS=Object.freeze({
  shared:Object.freeze({
    id:'shared',
    label:'Chapter Controls',
    description:'Chapter 1–3 controls used in every combat mode',
    move:Object.freeze({left:CONTROL_MAPS[0].l,right:CONTROL_MAPS[0].r,up:CONTROL_MAPS[0].up,down:CONTROL_MAPS[0].down}),
    actions:SHARED_ACTIONS
  }),
  // Compatibility aliases for old saves. They intentionally resolve to the
  // unified layout instead of preserving the old split control schemes.
  classic:Object.freeze({id:'shared',label:'Chapter Controls',description:'Legacy save migrated to Chapter controls',move:Object.freeze({left:CONTROL_MAPS[0].l,right:CONTROL_MAPS[0].r,up:CONTROL_MAPS[0].up,down:CONTROL_MAPS[0].down}),actions:SHARED_ACTIONS}),
  ergonomic:Object.freeze({id:'shared',label:'Chapter Controls',description:'Legacy save migrated to Chapter controls',move:Object.freeze({left:CONTROL_MAPS[0].l,right:CONTROL_MAPS[0].r,up:CONTROL_MAPS[0].up,down:CONTROL_MAPS[0].down}),actions:SHARED_ACTIONS})
});

export const MOBILE_LAYOUTS=Object.freeze({
  standard:Object.freeze({id:'standard',label:'Standard',scale:1}),
  compact:Object.freeze({id:'compact',label:'Compact',scale:.84}),
  large:Object.freeze({id:'large',label:'Large Buttons',scale:1.16})
});

export function defaultArenaControlSettings(){
  return{version:3,pcLayout:'shared',mousePrimaryAttack:'light',touchMode:'auto',mobileLayout:'standard',handedness:'right',opacity:.88,showLabels:true};
}

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

export function sanitizeArenaControlSettings(value={}){
  const defaults=defaultArenaControlSettings();
  return{
    version:3,
    pcLayout:'shared',
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
  const labels={Space:'SPACE',ShiftLeft:'SHIFT',ShiftRight:'SHIFT'};
  return labels[code]||String(code||'').replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'NUM ');
}

const TOUCH_TO_ACTION=Object.freeze({
  jump:'j',light:'a',heavy:'h',launcher:'x',dash:'d',block:'b',charge:'k',grab:'s',breaker:'q',counter:'c',interact:'i',
  left:'l',right:'r',up:'up',down:'down'
});

export class ArenaControlManager{
  constructor(root,{storage=localStorage,onPause=()=>{},onExit=()=>{},onAbility=()=>{},onSettings=()=>{},onOpenSettings=()=>{},onCloseSettings=()=>{}}={}){
    this.root=root;this.storage=storage;this.onPause=onPause;this.onExit=onExit;this.onAbility=onAbility;this.onSettings=onSettings;this.onOpenSettings=onOpenSettings;this.onCloseSettings=onCloseSettings;
    this.input=sharedInput;
    this.settings=loadArenaControlSettings(storage);
    this.mouseBindings=new Map();
    this.previousButtons=[[],[]];this.selectedAbility=[0,0];this.active=false;
    this.joystickPointer=null;this.joystickCenter={x:0,y:0};this.joystick={x:0,z:0};
    this.lastInput=this.input.lastInputDevice[0]||'keyboard';

    this.boundKeyDown=event=>this.keyDown(event);
    this.boundKeyUp=event=>this.keyUp(event);
    this.boundMouseDown=event=>this.mouseDownEvent(event);
    this.boundMouseUp=event=>this.mouseUpEvent(event);
    this.boundContextMenu=event=>{if(this.active){event.preventDefault();event.stopPropagation()}};

    this.surface=root.querySelector('canvas');
    this.pad=root.querySelector('[data-arena-move-pad]');
    this.knob=root.querySelector('[data-arena-move-knob]');
    this.settingsPanel=root.querySelector('[data-arena-control-settings]');
    this.help=root.querySelector('[data-arena-help]');

    this.bindTouch();
    this.bindSettings();
    this.root.querySelectorAll('[data-arena-slot]').forEach((button,index)=>button.addEventListener('pointerdown',()=>{
      this.selectedAbility[0]=index;this.selectAbility(0,1);
    }));
    this.applySettings();
    this.selectAbility(0);
  }

  isTouchDevice(){return (typeof navigator!=='undefined'&&navigator.maxTouchPoints>0)||(typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches)}
  touchEnabled(){return this.settings.touchMode==='on'||(this.settings.touchMode==='auto'&&this.isTouchDevice())}
  layout(){return PC_LAYOUTS.shared}

  start(){
    if(this.active)return;
    this.active=true;
    addEventListener('keydown',this.boundKeyDown,true);
    addEventListener('keyup',this.boundKeyUp,true);
    this.surface?.addEventListener('pointerdown',this.boundMouseDown,true);
    addEventListener('pointerup',this.boundMouseUp,true);
    this.surface?.addEventListener('contextmenu',this.boundContextMenu,true);
    this.applySettings();
  }

  stop(){
    if(!this.active)return;
    this.active=false;
    removeEventListener('keydown',this.boundKeyDown,true);
    removeEventListener('keyup',this.boundKeyUp,true);
    this.surface?.removeEventListener('pointerdown',this.boundMouseDown,true);
    removeEventListener('pointerup',this.boundMouseUp,true);
    this.surface?.removeEventListener('contextmenu',this.boundContextMenu,true);
    this.releaseAll();
    this.closeSettings();
  }

  releaseAll(){
    this.input.clear();
    for(const action of this.mouseBindings.values())this.input.setMouseAction(1,action,false);
    this.mouseBindings.clear();
    this.previousButtons=[[],[]];
    this.joystickPointer=null;this.joystick={x:0,z:0};
    this.setJoystickActions(0,0);
    this.moveKnob(0,0);
  }

  capturedCodes(){
    return new Set([...Object.values(CONTROL_MAPS[0]),...Object.values(CONTROL_MAPS[1]),'Digit1','Digit2','Digit3','Digit4','Digit5','NumpadSubtract','NumpadMultiply','KeyP','Escape']);
  }

  keyDown(event){
    if(!this.active)return;
    if(event.code==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();
      if(!this.settingsPanel?.classList.contains('hidden'))this.closeSettings();else this.onExit();
      return;
    }
    if(event.code==='KeyP'&&!event.repeat){
      event.preventDefault();event.stopImmediatePropagation();this.onPause();return;
    }
    const slot=/^Digit([1-5])$/.exec(event.code);
    if(slot&&!event.repeat){
      event.preventDefault();event.stopImmediatePropagation();
      this.selectedAbility[0]=Number(slot[1])-1;this.selectAbility(0,1);this.onAbility(Number(slot[1]),1);
      return;
    }
    if(!event.repeat&&(event.code==='NumpadSubtract'||event.code==='NumpadMultiply')){
      event.preventDefault();event.stopImmediatePropagation();
      this.selectAbility(event.code==='NumpadSubtract'?-1:1,2);
      return;
    }
    if(this.capturedCodes().has(event.code))event.preventDefault();
    this.input.setKeyboard(event.code,true);
    this.lastInput='keyboard';
    this.applyInputPresentation();
  }

  keyUp(event){
    if(!this.active)return;
    this.input.setKeyboard(event.code,false);
    if(this.capturedCodes().has(event.code))event.preventDefault();
  }

  mouseDownEvent(event){
    if(!this.active||event.pointerType!=='mouse'||![0,2].includes(event.button)||!this.settingsPanel?.classList.contains('hidden'))return;
    event.preventDefault();event.stopPropagation();
    const action=event.button===2?'b':(this.settings.mousePrimaryAttack==='heavy'?'h':'a');
    const previous=this.mouseBindings.get(event.button);
    if(previous&&previous!==action)this.input.setMouseAction(1,previous,false);
    this.mouseBindings.set(event.button,action);
    this.input.setMouseAction(1,action,true);
    this.lastInput='mouse';
    this.applyInputPresentation();
  }
  mouseUpEvent(event){
    if(event.pointerType!=='mouse'||![0,2].includes(event.button))return;
    const action=this.mouseBindings.get(event.button)|| (event.button===2?'b':(this.settings.mousePrimaryAttack==='heavy'?'h':'a'));
    this.input.setMouseAction(1,action,false);
    this.mouseBindings.delete(event.button);
  }

  poll(){this.input.poll()}

  read(side=1,{poll=true}={}){
    if(poll)this.poll();
    const index=side-1;
    let x=(this.input.actionIsDown(side,'r')?1:0)-(this.input.actionIsDown(side,'l')?1:0);
    let z=(this.input.actionIsDown(side,'down')?1:0)-(this.input.actionIsDown(side,'up')?1:0);

    const jump=this.input.consumeAction(side,'j');
    const light=this.input.consumeAction(side,'a');
    const heavy=this.input.consumeAction(side,'h');
    const launcher=this.input.consumeAction(side,'x');
    const dash=this.input.consumeAction(side,'d');
    const block=this.input.actionIsDown(side,'b');
    const charge=this.input.actionIsDown(side,'k');
    const grab=this.input.consumeAction(side,'s')||this.input.consumeAction(side,'t');
    const breaker=this.input.consumeAction(side,'q');
    const counter=this.input.consumeAction(side,'c');
    const interact=this.input.consumeAction(side,'i');

    const assignment=this.input.getControllerAssignment(side);
    const pads=navigator.getGamepads?.()||[];
    const fallbackIndex=side===1?0:1;
    const gamepad=pads[assignment===null?fallbackIndex:assignment];
    const activateSelected=this.input.consumeAction(side,'u');
    const directLens=this.input.consumeAction(side,'n');
    if(gamepad){
      const buttons=gamepad.buttons.map(value=>Boolean(value?.pressed));
      const previous=this.previousButtons[index]||[];
      if(buttons[14]&&!previous[14])this.selectAbility(-1,side);
      if(buttons[15]&&!previous[15])this.selectAbility(1,side);
      if(buttons[14]||buttons[15])x=0;
      this.previousButtons[index]=buttons;
    }
    if(activateSelected)this.onAbility(this.selectedAbility[index]+1,side);
    if(directLens)this.onAbility(4,side);

    this.lastInput=this.input.lastInputDevice[0]||this.lastInput;
    this.applyInputPresentation();
    return{x,z,jump,light,heavy,launcher,dash,block,charge,grab,breaker,counter,interact};
  }

  selectAbility(direction,side=1){
    const index=side-1;
    this.selectedAbility[index]=(this.selectedAbility[index]+direction+5)%5;
    if(side!==1)return;
    this.root.querySelectorAll('[data-arena-slot]').forEach((button,slotIndex)=>{
      button.classList.toggle('selected',slotIndex===this.selectedAbility[0]);
      button.setAttribute('aria-current',slotIndex===this.selectedAbility[0]?'true':'false');
    });
  }

  setJoystickActions(x,z){
    this.input.setTouchAction(1,'l',x<-.16);
    this.input.setTouchAction(1,'r',x>.16);
    this.input.setTouchAction(1,'up',z<-.16);
    this.input.setTouchAction(1,'down',z>.16);
  }

  bindTouch(){
    if(this.pad){
      this.pad.addEventListener('pointerdown',event=>{
        if(!this.touchEnabled()||this.joystickPointer!==null)return;
        event.preventDefault();this.joystickPointer=event.pointerId;
        this.pad.setPointerCapture?.(event.pointerId);
        const rect=this.pad.getBoundingClientRect();
        this.joystickCenter={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
        this.updateJoystick(event);this.lastInput='touch';this.input.lastInputDevice[0]='touch';this.applyInputPresentation();
      });
      this.pad.addEventListener('pointermove',event=>{if(event.pointerId===this.joystickPointer)this.updateJoystick(event)});
      const release=event=>{
        if(event.pointerId!==this.joystickPointer)return;
        this.joystickPointer=null;this.joystick={x:0,z:0};this.setJoystickActions(0,0);this.moveKnob(0,0);
      };
      this.pad.addEventListener('pointerup',release);this.pad.addEventListener('pointercancel',release);this.pad.addEventListener('lostpointercapture',release);
    }

    this.root.querySelectorAll('[data-arena-touch-action]').forEach(button=>{
      const action=button.dataset.arenaTouchAction;
      const semantic=TOUCH_TO_ACTION[action];
      const press=event=>{
        if(!this.touchEnabled()||!semantic)return;
        event.preventDefault();button.setPointerCapture?.(event.pointerId);
        this.input.setTouchAction(1,semantic,true);
        button.classList.add('pressed');this.lastInput='touch';this.input.lastInputDevice[0]='touch';this.applyInputPresentation();
      };
      const release=event=>{
        event.preventDefault();
        if(semantic)this.input.setTouchAction(1,semantic,false);
        button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown',press);button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
    });
    this.root.querySelector('[data-arena-touch-pause]')?.addEventListener('click',event=>{event.preventDefault();this.onPause()});
    this.root.querySelector('[data-arena-touch-settings]')?.addEventListener('click',event=>{event.preventDefault();this.openSettings()});
  }

  updateJoystick(event){
    const radius=Math.max(24,this.pad.getBoundingClientRect().width*.36);
    const dx=event.clientX-this.joystickCenter.x,dy=event.clientY-this.joystickCenter.y;
    const length=Math.hypot(dx,dy),scale=length>radius?radius/length:1;
    const nx=dx*scale/radius,nz=dy*scale/radius;
    this.joystick={x:nx,z:nz};this.setJoystickActions(nx,nz);this.moveKnob(nx,nz);
  }
  moveKnob(x,z){if(this.knob)this.knob.style.transform=`translate(${x*42}px,${z*42}px)`}

  bindSettings(){
    this.root.querySelector('[data-arena-open-controls]')?.addEventListener('click',()=>this.openSettings());
    this.root.querySelectorAll('[data-arena-controls-close]').forEach(button=>button.addEventListener('click',()=>this.closeSettings()));
    const fields={mousePrimaryAttack:'[data-control-mouse-attack]',touchMode:'[data-control-touch-mode]',mobileLayout:'[data-control-mobile-layout]',handedness:'[data-control-handedness]',opacity:'[data-control-opacity]',showLabels:'[data-control-labels]'};
    for(const [key,selector] of Object.entries(fields)){
      const element=this.root.querySelector(selector);if(!element)continue;
      const eventName=element.type==='range'?'input':'change';
      element.addEventListener(eventName,()=>{
        this.settings={...this.settings,[key]:element.type==='checkbox'?element.checked:element.type==='range'?Number(element.value):element.value};
        this.settings=sanitizeArenaControlSettings(this.settings);
        saveArenaControlSettings(this.settings,this.storage);
        this.applySettings();this.onSettings(this.settings);
      });
    }
    this.root.querySelector('[data-arena-controls-reset]')?.addEventListener('click',()=>{
      this.settings=defaultArenaControlSettings();saveArenaControlSettings(this.settings,this.storage);this.applySettings();this.syncSettingsForm();
    });
  }

  syncSettingsForm(){
    const map={pcLayout:'[data-control-pc-layout]',mousePrimaryAttack:'[data-control-mouse-attack]',touchMode:'[data-control-touch-mode]',mobileLayout:'[data-control-mobile-layout]',handedness:'[data-control-handedness]',opacity:'[data-control-opacity]',showLabels:'[data-control-labels]'};
    for(const [key,selector] of Object.entries(map)){
      const element=this.root.querySelector(selector);if(!element)continue;
      if(element.type==='checkbox')element.checked=Boolean(this.settings[key]);
      else element.value=String(this.settings[key]);
      if(key==='pcLayout')element.disabled=true;
    }
  }

  openSettings(){
    if(!this.settingsPanel?.classList.contains('hidden'))return;
    this.syncSettingsForm();this.onOpenSettings();this.settingsPanel?.classList.remove('hidden');this.releaseAll();
  }
  closeSettings(){
    if(this.settingsPanel?.classList.contains('hidden'))return;
    this.settingsPanel?.classList.add('hidden');this.onCloseSettings();
  }

  applySettings(){
    const touch=this.touchEnabled();
    if(touch&&this.isTouchDevice()&&this.lastInput==='keyboard')this.lastInput='touch';
    this.root.classList.toggle('arena-touch-active',touch);
    this.root.classList.toggle('arena-left-handed',this.settings.handedness==='left');
    this.root.dataset.mobileLayout=this.settings.mobileLayout;
    this.root.style.setProperty('--arena-control-opacity',String(this.settings.opacity));
    this.root.classList.toggle('arena-labels-hidden',!this.settings.showLabels);
    this.input.setMousePrimaryAction(this.settings.mousePrimaryAttack==='heavy'?'h':'a');
    this.applyInputPresentation();this.syncSettingsForm();
  }

  applyInputPresentation(){
    const device=this.lastInput==='mouse'?'mouse':this.input.lastInputDevice[0]||this.lastInput;
    const touch=this.touchEnabled()&&device==='touch';
    this.root.dataset.activeInput=touch?'touch':device;
    const a=PC_LAYOUTS.shared.actions;

    if(this.help){
      if(device==='controller'){
        const m=this.input.controllerMapping(1);
        this.help.innerHTML=`<b>${m.name.toUpperCase()} • SHARED CONTROLS</b><br><span>Left Stick</span> move • <span>${m.labels.j}</span> jump • <span>${m.labels.a}</span> light • <span>${m.labels.h}</span> heavy • <span>Up + ${m.labels.h}</span> launcher • <span>${m.labels.d}</span> dash • <span>${m.labels.b}</span> block • <span>${m.labels.k}</span> charge • <span>${m.labels.s}</span> grab • <span>${m.labels.q}</span> breaker • <span>${m.labels.c}</span> counter • <span>D-Pad L/R</span> select ability • <span>${m.labels.u}</span> activate • <span>Right Stick</span> hub camera`;
      }else{
        const mouseAttack=this.settings.mousePrimaryAttack==='heavy'?'heavy':'light';
        this.help.innerHTML=`<b>${device==='mouse'?'MOUSE + KEYBOARD':'CHAPTER CONTROLS'}</b><br><span>WASD</span> move • <span>${labelForCode(a.jump)}</span> jump • <span>${labelForCode(a.dash)}</span> dash • <span>M1</span> ${mouseAttack} • <span>M2</span> block • <span>${labelForCode(a.light)}</span> light • <span>${labelForCode(a.heavy)}</span> heavy • <span>${labelForCode(a.launcher)}</span> launcher • <span>${labelForCode(a.charge)}</span> charge • <span>${labelForCode(a.grab)}</span> grab • <span>${labelForCode(a.breaker)}</span> breaker • <span>${labelForCode(a.counter)}</span> counter • <span>1–5</span> abilities • <span>Click + drag mouse / trackpad</span> hub camera`;
      }
    }
    this.root.querySelectorAll('.arenaNumber').forEach((number,index)=>{number.textContent=touch?'TAP':String(index+1)});
  }
}
