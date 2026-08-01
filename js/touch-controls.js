import {TouchLayoutEditor,responsiveControlPosition} from './touch-layout-editor.js?v=29a362-chapter4-false-completion-recovery-20260801';

const COMBAT_ACTIONS = Object.freeze({
  jump:'j',light:'a',heavy:'h',grab:'s',charge:'k',interact:'i',block:'b',dash:'d',
  ultimate:'u',breaker:'q',launcher:'x',throw:'t',counter:'c',lens:'n'
});

export const CLASH_TAP_CAP_PER_SECOND = 8;
export const CLASH_PULSE_FRAMES = 16;

export function joystickDirections(dx,dy,{
  radius=60,
  deadZone=.22,
  sensitivity=1
}={}) {
  const safeRadius=Math.max(1,radius);
  const x=Math.max(-1,Math.min(1,dx/safeRadius*sensitivity));
  const y=Math.max(-1,Math.min(1,dy/safeRadius*sensitivity));
  const magnitude=Math.hypot(x,y);
  if(magnitude<Math.max(.05,deadZone))return{left:false,right:false,up:false,down:false,x:0,y:0,magnitude};
  const threshold=Math.max(.18,deadZone*.78);
  return{
    left:x<-threshold,right:x>threshold,up:y<-threshold,down:y>threshold,
    x,y,magnitude
  };
}

export function resolveDPadDirections(activeDirections=[],latest='') {
  const active=new Set(activeDirections);
  let left=active.has('left'),right=active.has('right'),up=active.has('up'),down=active.has('down');
  if(left&&right){left=latest==='left';right=latest==='right'}
  if(up&&down){up=latest==='up';down=latest==='down'}
  return{left,right,up,down};
}

export function touchTutorialSteps(movement='joystick') {
  const style=movement==='dpad'?'D-Pad':'Virtual Joystick';
  return[
    {title:`Move with the ${style}`,text:movement==='dpad'?'Hold directions together for diagonals. Up also combines with Heavy for a launcher.':'Slide outside the dead zone to move. Diagonals are supported; Jump stays on its own button.'},
    {title:'Jump',text:'Tap Jump. After a launcher, jump and follow the opponent into the air.'},
    {title:'Light attacks',text:'Tap Light three times for the full light chain. The final hit locks the chain to prevent loops.'},
    {title:'Heavy attacks',text:'Heavy is slower and stronger. Light, Light, Heavy creates a grounded finisher.'},
    {title:'Launcher and air combo',text:'Tap Launcher—or hold Up and tap Heavy—then Jump, Air Light, and Air Heavy.'},
    {title:'Charge and abilities',text:'Hold Charge while standing still to rebuild energy. Use the numbered bottom hotbar for character abilities.'},
    {title:'Grab and interact',text:'Tap Grab to beat blocking opponents. During exploration, the separate Interact button appears near people and objects.'},
    {title:'Block and perfect block',text:'Hold Block without losing movement or other touches. Start blocking just before impact for a perfect block.'},
    {title:'Dash',text:'Tap Dash for the fighter’s movement ability. Poorly timed dashes remain punishable.'},
    {title:'Grab',text:'Tap Grab to beat guarding opponents. Missing a grab leaves you open, so use it as a read rather than a constant attack.'},
    {title:'Combo breaker',text:'While in hitstun, tap Breaker. It costs 35 energy and is limited to one use per round.'},
    {title:'Ultimate',text:'With enough energy, tap Ultimate. Missed ultimates have punishable recovery.'},
    {title:'Clashes',text:'When attacks clash, use the large Clash button. Choose Repeated Tap, Timed Tap, or Hold and Pulse in Touch Settings.'}
  ];
}

export class TouchControls {
  constructor({
    root,
    input,
    settings,
    onSettingsChange=()=>{},
    onOpenSettings=()=>{},
    onPause=()=>{},
    onMoveList=()=>{},
    onTrainingReset=()=>{},
    now=()=>globalThis.performance?.now?.()||Date.now()
  }={}) {
    this.root=root;
    this.input=input;
    this.settings=settings;
    this.onSettingsChange=onSettingsChange;
    this.onOpenSettings=onOpenSettings;
    this.onPause=onPause;
    this.onMoveList=onMoveList;
    this.onTrainingReset=onTrainingReset;
    this.now=now;
    this.enabled=false;
    this.training=false;
    this.actionPointers=new Map();
    this.actionCounts=new Map();
    this.dpadPointers=new Map();
    this.dpadOrder=[];
    this.joystickPointer=null;
    this.joystickCenter={x:0,y:0};
    this.clashActive=false;
    this.clashHeld=false;
    this.clashFrame=0;
    this.lastClashTap=-Infinity;
    this.lastClashPulse=-Infinity;
    this.acceptedClashInputs=0;
    this.tutorialIndex=0;
    this.layoutEditor=new TouchLayoutEditor({root,settings,onChange:(next,meta)=>this._changed(next,meta)});
    this._bind();
    this.applySettings();
  }

  _bind() {
    for(const button of this.root?.querySelectorAll?.('[data-touch-action]')||[]){
      const action=COMBAT_ACTIONS[button.dataset.touchAction];
      if(!action)continue;
      const down=event=>this._buttonDown(event,button,action);
      const up=event=>this._buttonUp(event);
      button.addEventListener('pointerdown',down);
      button.addEventListener('pointerup',up);
      button.addEventListener('pointercancel',up);
      this.actionPointers.set(`binding-${button.dataset.touchAction}`,{button,down,up});
    }
    const movement=this.root?.querySelector?.('#movementControl');
    movement?.addEventListener('pointerdown',event=>this._joystickDown(event));
    movement?.addEventListener('pointermove',event=>this._joystickMove(event));
    movement?.addEventListener('pointerup',event=>this._joystickUp(event));
    movement?.addEventListener('pointercancel',event=>this._joystickUp(event));
    for(const button of this.root?.querySelectorAll?.('[data-dpad-direction]')||[]){
      button.addEventListener('pointerdown',event=>this._dpadDown(event,button.dataset.dpadDirection));
      const up=event=>this._dpadUp(event);
      button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);
    }
    this.root?.querySelector?.('#touchSettingsGame')?.addEventListener('pointerdown',event=>{event.preventDefault();this.onOpenSettings()});
    this.root?.querySelector?.('#touchPause')?.addEventListener('pointerdown',event=>{event.preventDefault();this.onPause()});
    this.root?.querySelector?.('#touchMoveListButton')?.addEventListener('pointerdown',event=>{event.preventDefault();this.onMoveList()});
    this.root?.querySelector?.('#touchTrainingReset')?.addEventListener('pointerdown',event=>{event.preventDefault();this.onTrainingReset()});
    const clash=this.root?.querySelector?.('#touchClashButton');
    clash?.addEventListener('pointerdown',event=>this._clashDown(event));
    clash?.addEventListener('pointerup',event=>this._clashUp(event));
    clash?.addEventListener('pointercancel',event=>this._clashUp(event));
    for(const button of document.querySelectorAll('[data-touch-choice]'))button.addEventListener('click',()=>this.chooseMovement(button.dataset.touchChoice));
    document.querySelector('#touchTutorialNext')?.addEventListener('click',()=>this.nextTutorial());
    document.querySelector('#touchTutorialBack')?.addEventListener('click',()=>this.previousTutorial());
    document.querySelector('#touchTutorialClose')?.addEventListener('click',()=>this.closeTutorial(true));
  }

  _changed(settings,meta={}) {
    this.applySettings();
    this.onSettingsChange(settings,meta);
  }

  chooseMovement(choice) {
    if(choice==='joystick'||choice==='dpad'){
      this.settings.movement=choice;this.settings.movementChosen=true;
      this.settings.preset=choice==='dpad'?'standard-dpad':'mobile-standard-hotbar';
    }else{
      this.settings.movement=this.settings.movement||'joystick';
      this.settings.movementChosen=false;
    }
    this.settings.chooserShown=true;
    document.querySelector('#touchChoice')?.classList.add('hidden');
    this._changed(this.settings,{choice:true});
    if(this.enabled&&!this.settings.tutorialComplete)this.showTutorial();
  }

  showChooser(force=false) {
    if(!force&&this.settings.chooserShown)return false;
    document.querySelector('#touchChoice')?.classList.remove('hidden');
    return true;
  }

  showTutorial() {
    this.tutorialIndex=0;
    document.querySelector('#touchTutorial')?.classList.remove('hidden');
    this._renderTutorial();
  }

  _renderTutorial() {
    const steps=touchTutorialSteps(this.settings.movement),step=steps[this.tutorialIndex];
    const count=document.querySelector('#touchTutorialCount'),title=document.querySelector('#touchTutorialTitle'),text=document.querySelector('#touchTutorialText');
    if(count)count.textContent=`${this.tutorialIndex+1} / ${steps.length}`;
    if(title)title.textContent=step.title;
    if(text)text.textContent=step.text;
    const back=document.querySelector('#touchTutorialBack'),next=document.querySelector('#touchTutorialNext');
    if(back)back.disabled=this.tutorialIndex===0;
    if(next)next.textContent=this.tutorialIndex===steps.length-1?'FINISH':'NEXT';
  }

  nextTutorial() {
    const last=touchTutorialSteps(this.settings.movement).length-1;
    if(this.tutorialIndex>=last){this.closeTutorial(true);return}
    this.tutorialIndex++;this._renderTutorial();
  }
  previousTutorial(){if(this.tutorialIndex>0){this.tutorialIndex--;this._renderTutorial()}}
  closeTutorial(complete=false){
    document.querySelector('#touchTutorial')?.classList.add('hidden');
    if(complete)this.settings.tutorialComplete=true;
    this._changed(this.settings,{tutorial:true,dismissed:!complete});
  }

  _setAction(action,down) {
    const count=this.actionCounts.get(action)||0;
    if(down){
      this.actionCounts.set(action,count+1);
      if(count===0)this.input.setTouchAction(1,action,true);
    }else if(count>0){
      const next=count-1;this.actionCounts.set(action,next);
      if(next===0)this.input.setTouchAction(1,action,false);
    }
  }

  _buttonDown(event,button,action) {
    if(!this.enabled||this.layoutEditor.editing||this.clashActive)return;
    event.preventDefault();event.stopPropagation();
    button.setPointerCapture?.(event.pointerId);
    this.actionPointers.set(event.pointerId,{button,action});
    button.classList.add('pressed');
    this._setAction(action,true);
  }
  _buttonUp(event) {
    const pointer=this.actionPointers.get(event.pointerId);
    if(!pointer?.action)return;
    event.preventDefault();event.stopPropagation();
    pointer.button.classList.remove('pressed');
    this._setAction(pointer.action,false);
    this.actionPointers.delete(event.pointerId);
  }

  _joystickDown(event) {
    if(!this.enabled||this.layoutEditor.editing||this.settings.movement!=='joystick'||this.joystickPointer!==null)return;
    event.preventDefault();event.stopPropagation();
    const movement=this.root.querySelector('#movementControl'),base=this.root.querySelector('#joystickBase');
    movement.setPointerCapture?.(event.pointerId);this.joystickPointer=event.pointerId;
    if(this.settings.joystickMode==='floating'){
      const rect=movement.getBoundingClientRect();
      this.joystickCenter={x:event.clientX,y:event.clientY};
      base.style.left=`${event.clientX-rect.left}px`;base.style.top=`${event.clientY-rect.top}px`;
      base.classList.add('floating-active');
    }else{
      const rect=base.getBoundingClientRect();this.joystickCenter={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
    }
    this._joystickMove(event);
  }
  _joystickMove(event) {
    if(this.joystickPointer!==event.pointerId||this.settings.movement!=='joystick')return;
    event.preventDefault();event.stopPropagation();
    const radius=this.settings.stickSize*.38;
    const vector=joystickDirections(event.clientX-this.joystickCenter.x,event.clientY-this.joystickCenter.y,{radius,deadZone:this.settings.deadZone,sensitivity:this.settings.sensitivity});
    this._applyDirections(vector);
    const distance=Math.min(radius,Math.hypot(event.clientX-this.joystickCenter.x,event.clientY-this.joystickCenter.y));
    const angle=Math.atan2(event.clientY-this.joystickCenter.y,event.clientX-this.joystickCenter.x);
    const knob=this.root.querySelector('#joystickKnob');
    knob.style.transform=`translate(calc(-50% + ${Math.cos(angle)*distance}px),calc(-50% + ${Math.sin(angle)*distance}px))`;
  }
  _joystickUp(event) {
    if(this.joystickPointer!==event.pointerId)return;
    event.preventDefault();event.stopPropagation();this.joystickPointer=null;
    this._applyDirections({left:false,right:false,up:false,down:false});
    const knob=this.root.querySelector('#joystickKnob'),base=this.root.querySelector('#joystickBase');
    knob.style.transform='translate(-50%,-50%)';base.classList.remove('floating-active');
  }

  _dpadDown(event,direction) {
    if(!this.enabled||this.layoutEditor.editing||this.settings.movement!=='dpad')return;
    event.preventDefault();event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    this.dpadPointers.set(event.pointerId,direction);
    this.dpadOrder=this.dpadOrder.filter(item=>item!==direction);this.dpadOrder.push(direction);
    event.currentTarget.classList.add('pressed');this._updateDpad();
  }
  _dpadUp(event) {
    const direction=this.dpadPointers.get(event.pointerId);if(!direction)return;
    event.preventDefault();event.stopPropagation();event.currentTarget.classList.remove('pressed');
    this.dpadPointers.delete(event.pointerId);this._updateDpad();
  }
  _updateDpad() {
    const active=[...this.dpadPointers.values()],latest=this.dpadOrder.findLast?.(item=>active.includes(item))||this.dpadOrder.filter(item=>active.includes(item)).slice(-1)[0]||'';
    this._applyDirections(resolveDPadDirections(active,latest));
  }
  _applyDirections(directions) {
    this.input.setTouchAction(1,'l',!!directions.left);
    this.input.setTouchAction(1,'r',!!directions.right);
    this.input.setTouchAction(1,'up',!!directions.up);
    this.input.setTouchAction(1,'down',!!directions.down);
    this.root.dataset.touchDirection=[directions.up?'up':'',directions.down?'down':'',directions.left?'left':'',directions.right?'right':''].filter(Boolean).join('-')||'neutral';
  }

  _emitClash(actions) {
    for(const action of actions){this.input.setTouchAction(1,action,true);this.input.setTouchAction(1,action,false)}
    this.acceptedClashInputs+=actions.length;
    this.root.querySelector('#touchClashButton')?.classList.add('accepted');
  }
  _clashDown(event) {
    if(!this.clashActive)return;
    event.preventDefault();event.stopPropagation();this.clashHeld=true;
    const method=this.settings.clashMethod,current=this.now(),minimum=1000/CLASH_TAP_CAP_PER_SECOND;
    if(method==='repeated'&&current-this.lastClashTap>=minimum){this.lastClashTap=current;this._emitClash(['a'])}
    if(method==='timed'&&Math.abs(this.clashFrame%CLASH_PULSE_FRAMES)<=4&&current-this.lastClashTap>=minimum*1.8){this.lastClashTap=current;this._emitClash(['a','h'])}
  }
  _clashUp(event){event.preventDefault();this.clashHeld=false}

  tick({clashActive=false,clashFrame=0}={}) {
    this.setClashState(clashActive,clashFrame);
    if(clashActive&&this.settings.clashMethod==='hold'&&this.clashHeld&&clashFrame%CLASH_PULSE_FRAMES===0&&Math.abs(clashFrame-this.lastClashPulse)>=CLASH_PULSE_FRAMES){
      this.lastClashPulse=clashFrame;this._emitClash(['a','h']);
    }
    if(clashFrame%CLASH_PULSE_FRAMES>4)this.root.querySelector('#touchClashButton')?.classList.remove('accepted');
  }

  setClashState(active,frame=0) {
    this.clashActive=!!active;this.clashFrame=frame;
    this.root?.classList?.toggle('clash-active',this.clashActive);
    const button=this.root?.querySelector?.('#touchClashButton');
    button?.classList?.toggle('hidden',!this.clashActive);
    if(button)button.dataset.method=this.settings.clashMethod;
    if(!active)this.clashHeld=false;
  }

  startMatch({training=false,show=true}={}) {
    this.enabled=!!show;this.training=!!training;
    this.root?.classList?.toggle('hidden',!this.enabled);
    this.root?.classList?.remove('touch-controls-disabled');
    this.root?.classList?.toggle('training-touch',this.training);
    this.applySettings();
    if(this.enabled&&!this.settings.chooserShown)this.showChooser();
    if(this.enabled&&this.settings.chooserShown&&!this.settings.tutorialComplete)this.showTutorial();
  }
  stopMatch(){
    this.releaseAll();this.enabled=false;this.root?.classList?.add('hidden');this.root?.classList?.remove('touch-controls-disabled');
    this.layoutEditor.setEditing(false);this.setClashState(false);
    const doc=this.root?.ownerDocument||globalThis.document;
    for(const id of ['touchChoice','touchSettingsModal','touchTutorial','touchMoveList','hotbarCustomizeModal'])doc?.querySelector?.(`#${id}`)?.classList?.add('hidden');
  }
  setMatchUiVisible(visible){this.root?.classList?.toggle('hidden',!this.enabled||!visible)}
  setCombatControlsHidden(hidden){if(hidden)this.releaseAll();this.root?.classList?.toggle('touch-controls-disabled',!!hidden)}
  setPaused(paused){this.root?.classList?.toggle('touch-paused',!!paused);if(paused)this.releaseAll()}
  setFighter(id){if(this.root)this.root.dataset.fighter=id||''}

  releaseAll() {
    for(const pointer of this.actionPointers.values())if(pointer?.action)this.input.setTouchAction(1,pointer.action,false);
    this.actionPointers=new Map([...this.actionPointers].filter(([key])=>typeof key==='string'));
    this.actionCounts.clear();this.dpadPointers.clear();this.dpadOrder.length=0;this.joystickPointer=null;this.clashHeld=false;
    for(const action of ['l','r','up','down','j','a','h','s','b','d','u','k','x','t','c','n'])this.input.setTouchAction(1,action,false);
    this.root?.querySelectorAll?.('.pressed')?.forEach(element=>element.classList.remove('pressed'));
    const knob=this.root?.querySelector?.('#joystickKnob');if(knob)knob.style.transform='translate(-50%,-50%)';
  }

  applySettings() {
    if(!this.root)return;
    this.root.dataset.movement=this.settings.movement;
    this.root.dataset.joystickMode=this.settings.joystickMode;
    this.root.style.setProperty('--stick-size',`${this.settings.stickSize}px`);
    this.root.style.setProperty('--dpad-size',`${this.settings.dpadSize}px`);
    this.root.style.setProperty('--dpad-spacing',`${this.settings.dpadSpacing}px`);
    this.root.style.setProperty('--touch-opacity',String(this.settings.opacity));
    this.root.querySelector('#touchThrow')?.classList.toggle('control-disabled',!this.settings.dedicatedThrow);
    this.root.querySelector('#touchLauncher')?.classList.toggle('control-disabled',!this.settings.dedicatedLauncher);
    this.input.setSimplifiedTouch(1,!!this.settings.simplified);
    const movement=this.settings.positions.movement;
    movement.size=this.settings.movement==='joystick'?this.settings.stickSize:this.settings.dpadSize*3+this.settings.dpadSpacing*2;
    this.layoutEditor.apply();
    const rect=this.root.getBoundingClientRect?.()||{};
    const width=rect.width||globalThis.window?.visualViewport?.width||globalThis.window?.innerWidth||844;
    const height=rect.height||globalThis.window?.visualViewport?.height||globalThis.window?.innerHeight||390;
    for(const control of this.root.querySelectorAll('[data-control-id]')){
      const position=responsiveControlPosition(this.settings,control.dataset.controlId,{width,height});
      control.setAttribute('aria-label',control.getAttribute('aria-label')||control.dataset.controlId);
      control.style.setProperty('--control-size',`${position.size}px`);
    }
  }
}
