export const TOUCH_CONTROL_IDS = Object.freeze([
  'movement', 'jump', 'light', 'heavy', 'grab', 'charge', 'interact', 'block', 'dash',
  'ultimate', 'breaker', 'launcher', 'throw', 'moveList', 'trainingReset',
  'counter', 'lens', 'pause', 'settings'
]);

const BASE_POSITIONS = Object.freeze({
  movement:{x:13,y:69,size:144},
  jump:{x:88,y:39,size:62},
  light:{x:84,y:59,size:66},
  heavy:{x:94,y:57,size:66},
  grab:{x:89,y:88,size:58},
  charge:{x:78,y:87,size:52},
  interact:{x:48,y:50,size:58},
  block:{x:75,y:68,size:58},
  dash:{x:74,y:42,size:56},
  ultimate:{x:94,y:22,size:58},
  breaker:{x:66,y:64,size:48},
  launcher:{x:65,y:45,size:52},
  throw:{x:66,y:72,size:46},
  moveList:{x:52,y:18,size:46},
  trainingReset:{x:16,y:34,size:42},
  counter:{x:63,y:34,size:52},
  lens:{x:63,y:34,size:52},
  pause:{x:48,y:10,size:42},
  settings:{x:54,y:10,size:42}
});
const LANDSCAPE_COMFORT_POSITIONS = Object.freeze({
  movement:{x:11,y:70,size:132},
  jump:{x:91,y:36,size:54},
  light:{x:86,y:56,size:58},
  heavy:{x:95.5,y:56,size:56},
  grab:{x:91,y:80,size:50},
  charge:{x:82,y:86,size:48},
  interact:{x:52,y:70,size:52},
  block:{x:77.5,y:69,size:52},
  dash:{x:82,y:40,size:50},
  ultimate:{x:95,y:22,size:48},
  breaker:{x:68,y:72,size:46},
  launcher:{x:74,y:48,size:48},
  throw:{x:96,y:94,size:44},
  moveList:{x:42,y:10,size:44},
  trainingReset:{x:17.5,y:26,size:44},
  counter:{x:66,y:58,size:46},
  lens:{x:67,y:35,size:46},
  pause:{x:50,y:10,size:44},
  settings:{x:58,y:10,size:44}
});
const PORTRAIT_COMFORT_POSITIONS = Object.freeze({
  movement:{x:18,y:78,size:120},
  jump:{x:88,y:50,size:48},
  light:{x:70,y:65,size:52},
  heavy:{x:89,y:69,size:52},
  grab:{x:89,y:79,size:50},
  charge:{x:57,y:84,size:48},
  interact:{x:52,y:59,size:50},
  block:{x:70,y:75,size:50},
  dash:{x:71,y:52,size:48},
  ultimate:{x:93,y:41,size:46},
  breaker:{x:73.5,y:85,size:46},
  launcher:{x:88,y:59.5,size:48},
  throw:{x:42,y:79.5,size:44},
  moveList:{x:13,y:42,size:44},
  trainingReset:{x:18,y:55,size:44},
  counter:{x:54,y:49,size:46},
  lens:{x:76,y:43,size:46},
  pause:{x:29,y:42,size:44},
  settings:{x:53,y:38,size:44}
});
const LEGACY_HOTBAR_POSITIONS=Object.freeze({
  movement:{x:13,y:70,size:150},jump:{x:88,y:41,size:64},light:{x:83,y:68,size:68},heavy:{x:93,y:65,size:68},grab:{x:89,y:86,size:62},charge:{x:78,y:86,size:52},interact:{x:55,y:82,size:58},block:{x:70,y:76,size:62},dash:{x:69,y:52,size:58},ultimate:{x:94,y:22,size:58},breaker:{x:80,y:22,size:56},launcher:{x:59,y:66,size:60},throw:{x:57,y:86,size:54},moveList:{x:52,y:18,size:46},trainingReset:{x:47,y:86,size:46},counter:{x:63,y:34,size:52},lens:{x:63,y:34,size:52},pause:{x:48,y:10,size:42},settings:{x:54,y:10,size:42}
});

function clonePositions(source = BASE_POSITIONS) {
  return Object.fromEntries(TOUCH_CONTROL_IDS.map(id => {
    const migrated=id==='grab'?(source.grab||source.special):source[id];
    return[id,{...BASE_POSITIONS[id],...(migrated||{})}];
  }));
}

export const TOUCH_PRESETS = Object.freeze({
  'mobile-standard-hotbar':{
    name:'Mobile Standard Hotbar',movement:'joystick',stickSize:144,controlScale:1,spacing:1,opacity:.84,swapped:false,simplified:false
  },
  'mobile-compact-hotbar':{
    name:'Mobile Compact Hotbar',movement:'joystick',stickSize:120,controlScale:.82,spacing:.82,opacity:.78,swapped:false,simplified:false
  },
  'mobile-large-buttons':{
    name:'Mobile Large Buttons',movement:'joystick',stickSize:174,controlScale:1.2,spacing:1.08,opacity:.92,swapped:false,simplified:false
  },
  'mobile-left-handed':{
    name:'Mobile Left-Handed',movement:'joystick',stickSize:144,controlScale:1,spacing:1,opacity:.86,swapped:true,simplified:false
  },
  'desktop-hotbar':{
    name:'Desktop Hotbar',movement:'joystick',stickSize:128,controlScale:.84,spacing:.9,opacity:.72,swapped:false,simplified:false
  },
  'minimal-hud':{
    name:'Minimal HUD',movement:'joystick',stickSize:126,controlScale:.78,spacing:.82,opacity:.62,swapped:false,simplified:false
  },
  'standard-joystick':{
    name:'Standard Joystick',movement:'joystick',stickSize:150,controlScale:1,spacing:1,opacity:.82,swapped:false,simplified:false
  },
  'standard-dpad':{
    name:'Standard D-Pad',movement:'dpad',dpadSize:68,controlScale:1,spacing:1,opacity:.82,swapped:false,simplified:false
  },
  'compact-joystick':{
    name:'Compact Joystick',movement:'joystick',stickSize:122,controlScale:.84,spacing:.84,opacity:.76,swapped:false,simplified:false
  },
  'compact-dpad':{
    name:'Compact D-Pad',movement:'dpad',dpadSize:55,controlScale:.84,spacing:.84,opacity:.76,swapped:false,simplified:false
  },
  'large-buttons':{
    name:'Large Buttons',movement:'joystick',stickSize:178,controlScale:1.22,spacing:1.12,opacity:.9,swapped:false,simplified:false
  },
  'left-handed':{
    name:'Left-Handed',movement:'joystick',stickSize:150,controlScale:1,spacing:1,opacity:.84,swapped:true,simplified:false
  },
  tablet:{
    name:'Tablet',movement:'joystick',stickSize:190,controlScale:1.18,spacing:1.2,opacity:.78,swapped:false,simplified:false
  },
  simplified:{
    name:'Simplified',movement:'joystick',stickSize:160,controlScale:1.14,spacing:1.08,opacity:.9,swapped:false,simplified:true
  }
});

export function createDefaultTouchSettings(stored = {}) {
  const defaults = {
    version:4,
    touchMode:'auto',
    movement:'joystick',
    movementChosen:false,
    chooserShown:false,
    preset:'mobile-standard-hotbar',
    joystickMode:'fixed',
    deadZone:.22,
    stickSize:150,
    sensitivity:1,
    dpadSize:68,
    dpadSpacing:8,
    opacity:.82,
    controlScale:1,
    spacing:1,
    swapped:false,
    dedicatedThrow:true,
    dedicatedLauncher:true,
    haptics:'on',
    clashMethod:'repeated',
    simplified:false,
    layoutLocked:true,
    tutorialComplete:false,
    positions:clonePositions(),
    savedLayouts:[]
  };
  const merged = { ...defaults, ...(stored || {}) };
  merged.positions = clonePositions(stored?.positions);
  if(Number(stored?.version||1)<2){for(const id of TOUCH_CONTROL_IDS){const saved=stored?.positions?.[id],legacy=LEGACY_HOTBAR_POSITIONS[id];if(saved&&legacy&&saved.x===legacy.x&&saved.y===legacy.y&&saved.size===legacy.size)merged.positions[id]={...BASE_POSITIONS[id]}}}
  if(Number(stored?.version||1)<3){const saved=stored?.positions?.interact;if(!saved||(saved.x===55&&saved.y===82&&saved.size===58))merged.positions.interact={...BASE_POSITIONS.interact}}
  merged.version=4;
  merged.savedLayouts = Array.isArray(stored?.savedLayouts) ? stored.savedLayouts.slice(0,8) : [];
  if (!['joystick','dpad'].includes(merged.movement)) merged.movement='joystick';
  if (!['auto','on','off'].includes(merged.touchMode)) merged.touchMode='auto';
  if (!['fixed','floating'].includes(merged.joystickMode)) merged.joystickMode='fixed';
  if (!['on','reduced','off'].includes(merged.haptics)) merged.haptics='on';
  if (!['repeated','timed','hold'].includes(merged.clashMethod)) merged.clashMethod='repeated';
  return merged;
}

export function applyTouchPreset(settings, presetId) {
  const preset = TOUCH_PRESETS[presetId] || TOUCH_PRESETS['mobile-standard-hotbar'];
  Object.assign(settings, preset, { preset:presetId });
  settings.positions = clonePositions();
  if (presetId==='compact-joystick'||presetId==='compact-dpad'||presetId==='mobile-compact-hotbar') {
    settings.positions.movement.y=73;
  }
  if (presetId==='large-buttons'||presetId==='mobile-large-buttons') {
    settings.positions.light.x=81;settings.positions.heavy.x=92;settings.positions.launcher.x=57;
  }
  if (presetId==='tablet') {
    settings.positions.movement.x=15;settings.positions.movement.y=72;
    for(const id of ['jump','light','heavy','grab','charge','block','dash','ultimate','breaker'])settings.positions[id].x=Math.min(95,settings.positions[id].x+1);
  }
  if(presetId==='mobile-left-handed')settings.swapped=true;
  return settings;
}

export function displayedControlPosition(settings, id) {
  const position = { ...(settings.positions?.[id] || BASE_POSITIONS[id] || {x:50,y:50,size:60}) };
  if(id!=='movement'){
    const factor=Number(settings.spacing||1),centerX=76,centerY=58;
    position.x=centerX+(position.x-centerX)*factor;
    position.y=centerY+(position.y-centerY)*factor;
  }
  if (settings.swapped) position.x = 100-position.x;
  const isMovement=id==='movement';
  if (!isMovement) position.size=Math.round(position.size*(settings.controlScale||1));
  return position;
}

export function responsiveControlPosition(settings, id, {
  width=globalThis.window?.visualViewport?.width||globalThis.window?.innerWidth||844,
  height=globalThis.window?.visualViewport?.height||globalThis.window?.innerHeight||390
}={}) {
  const safeWidth=Math.max(1,Number(width)||1),safeHeight=Math.max(1,Number(height)||1);
  const portrait=safeHeight>safeWidth;
  const custom=settings?.preset==='custom';
  let position;
  if(custom){
    position=displayedControlPosition(settings,id);
  }else{
    const template=(portrait?PORTRAIT_COMFORT_POSITIONS:LANDSCAPE_COMFORT_POSITIONS)[id]||BASE_POSITIONS[id]||{x:50,y:50,size:60};
    const scale=id==='movement'?1:Number(settings?.controlScale||1);
    position={...template,size:id==='movement'?template.size:Math.max(44,Math.min(64,Math.round(template.size*scale)))};
    if(settings?.swapped)position.x=100-position.x;
  }
  if(id==='movement'){
    const requested=Math.min(Number(settings?.stickSize||position.size),position.size);
    const widthLimit=portrait?safeWidth*.32:safeWidth*.2;
    const heightLimit=portrait?safeHeight*.25:safeHeight*.42;
    position.size=Math.max(92,Math.min(requested,widthLimit,heightLimit));
  }else{
    position.size=Math.max(44,Math.min(position.size,Math.min(safeWidth,safeHeight)*.18));
  }
  const margin=id==='movement'?6:4,half=position.size/2;
  const xPx=Math.max(half+margin,Math.min(safeWidth-half-margin,safeWidth*position.x/100));
  const yPx=Math.max(half+margin,Math.min(safeHeight-half-margin,safeHeight*position.y/100));
  position.x=xPx/safeWidth*100;
  position.y=yPx/safeHeight*100;
  return position;
}

export function saveNamedTouchLayout(settings, name) {
  const cleanName=String(name||'').trim().slice(0,30);
  if (!cleanName) return false;
  const snapshot={
    name:cleanName,
    savedAt:Date.now(),
    data:{
      movement:settings.movement,joystickMode:settings.joystickMode,deadZone:settings.deadZone,
      stickSize:settings.stickSize,sensitivity:settings.sensitivity,dpadSize:settings.dpadSize,
      dpadSpacing:settings.dpadSpacing,opacity:settings.opacity,controlScale:settings.controlScale,
      spacing:settings.spacing,swapped:settings.swapped,dedicatedThrow:settings.dedicatedThrow,
      dedicatedLauncher:settings.dedicatedLauncher,simplified:settings.simplified,
      positions:clonePositions(settings.positions)
    }
  };
  settings.savedLayouts=settings.savedLayouts.filter(layout=>layout.name!==cleanName);
  settings.savedLayouts.unshift(snapshot);
  settings.savedLayouts.length=Math.min(settings.savedLayouts.length,8);
  return true;
}

export function loadNamedTouchLayout(settings, name) {
  const layout=settings.savedLayouts.find(candidate=>candidate.name===name);
  if(!layout)return false;
  const savedLayouts=settings.savedLayouts;
  Object.assign(settings,layout.data,{savedLayouts,preset:'custom'});
  settings.positions=clonePositions(layout.data.positions);
  return true;
}

export function deleteNamedTouchLayout(settings, name) {
  const before=settings.savedLayouts.length;
  settings.savedLayouts=settings.savedLayouts.filter(layout=>layout.name!==name);
  return settings.savedLayouts.length!==before;
}

export class TouchLayoutEditor {
  constructor({root,settings,onChange=()=>{}}={}) {
    this.root=root;
    this.settings=settings;
    this.onChange=onChange;
    this.editing=false;
    this.drag=null;
    this.bound=[];
    for(const control of root?.querySelectorAll?.('[data-control-id]')||[])this._bindControl(control);
  }

  _bindControl(control) {
    const down=event=>{
      if(!this.editing)return;
      event.preventDefault();event.stopPropagation();
      const id=control.dataset.controlId,position=this.settings.positions[id];
      if(!position)return;
      control.setPointerCapture?.(event.pointerId);
      this.drag={id,pointerId:event.pointerId};
      this.root.dataset.selectedControl=id;
    };
    const move=event=>{
      if(!this.editing||!this.drag||this.drag.pointerId!==event.pointerId)return;
      event.preventDefault();event.stopPropagation();
      const rect=this.root.getBoundingClientRect();
      const visualX=Math.max(2,Math.min(98,(event.clientX-rect.left)/rect.width*100));
      const x=this.settings.swapped?100-visualX:visualX;
      const y=Math.max(4,Math.min(96,(event.clientY-rect.top)/rect.height*100));
      Object.assign(this.settings.positions[this.drag.id],{x:+x.toFixed(2),y:+y.toFixed(2)});
      this.apply();
      this.onChange(this.settings,{drag:true,selected:this.drag.id});
    };
    const up=event=>{
      if(!this.drag||this.drag.pointerId!==event.pointerId)return;
      event.preventDefault();event.stopPropagation();
      this.drag=null;
      this.onChange(this.settings,{drag:false});
    };
    control.addEventListener('pointerdown',down);
    control.addEventListener('pointermove',move);
    control.addEventListener('pointerup',up);
    control.addEventListener('pointercancel',up);
    this.bound.push({control,down,move,up});
  }

  setEditing(enabled) {
    this.editing=!!enabled;
    this.root?.classList?.toggle('layout-editing',this.editing);
    if(!this.editing)this.drag=null;
  }

  updateControl(id,changes) {
    if(!this.settings.positions[id])return false;
    Object.assign(this.settings.positions[id],changes);
    this.apply();this.onChange(this.settings,{selected:id});
    return true;
  }

  apply() {
    if(!this.root)return;
    this.root.style.setProperty('--touch-opacity',String(this.settings.opacity));
    this.root.style.setProperty('--touch-spacing',String(this.settings.spacing));
    const rect=this.root.getBoundingClientRect?.()||{};
    const width=rect.width||globalThis.window?.visualViewport?.width||globalThis.window?.innerWidth||844;
    const height=rect.height||globalThis.window?.visualViewport?.height||globalThis.window?.innerHeight||390;
    for(const control of this.root.querySelectorAll('[data-control-id]')){
      const position=responsiveControlPosition(this.settings,control.dataset.controlId,{width,height});
      control.style.setProperty('--control-x',`${position.x}%`);
      control.style.setProperty('--control-y',`${position.y}%`);
      control.style.setProperty('--control-size',`${position.size}px`);
    }
  }

  dispose() {
    for(const {control,down,move,up} of this.bound){
      control.removeEventListener('pointerdown',down);
      control.removeEventListener('pointermove',move);
      control.removeEventListener('pointerup',up);
      control.removeEventListener('pointercancel',up);
    }
    this.bound.length=0;
  }
}

export class TouchSettingsPanel {
  constructor({
    settings,
    touchControls,
    platform,
    onChange=()=>{},
    doc=globalThis.document
  }={}) {
    this.settings=settings;this.touchControls=touchControls;this.platform=platform;this.onChange=onChange;this.doc=doc;
    this.modal=doc?.querySelector?.('#touchSettingsModal');
    this.fields={
      touchMode:doc?.querySelector?.('#touchEnabledMode'),movement:doc?.querySelector?.('#touchMovementStyle'),preset:doc?.querySelector?.('#touchPreset'),
      joystickMode:doc?.querySelector?.('#touchJoystickMode'),deadZone:doc?.querySelector?.('#touchDeadZone'),
      stickSize:doc?.querySelector?.('#touchStickSize'),sensitivity:doc?.querySelector?.('#touchSensitivity'),
      dpadSize:doc?.querySelector?.('#touchDpadSize'),spacing:doc?.querySelector?.('#touchSpacing'),
      opacity:doc?.querySelector?.('#touchOpacity'),controlScale:doc?.querySelector?.('#touchScale'),
      haptics:doc?.querySelector?.('#touchHaptics'),clashMethod:doc?.querySelector?.('#touchClashMethod'),
      swapped:doc?.querySelector?.('#touchSwapSides'),dedicatedThrow:doc?.querySelector?.('#touchDedicatedThrow'),
      dedicatedLauncher:doc?.querySelector?.('#touchDedicatedLauncher'),simplified:doc?.querySelector?.('#touchSimplified'),layoutLocked:doc?.querySelector?.('#touchLayoutLocked')
    };
    this.selected=doc?.querySelector?.('#touchSelectedControl');
    this.saved=doc?.querySelector?.('#savedTouchLayouts');
    this._buildOptions();this._bind();this.sync();
  }

  _buildOptions() {
    if(this.fields.preset){
      this.fields.preset.innerHTML='';
      for(const [id,preset] of Object.entries(TOUCH_PRESETS)){const option=this.doc.createElement('option');option.value=id;option.textContent=preset.name;this.fields.preset.appendChild(option)}
      const custom=this.doc.createElement('option');custom.value='custom';custom.textContent='Custom';this.fields.preset.appendChild(custom);
    }
    if(this.selected){
      this.selected.innerHTML='';
      for(const id of TOUCH_CONTROL_IDS){const option=this.doc.createElement('option');option.value=id;option.textContent=id.replace(/[A-Z]/g,letter=>` ${letter}`).replace(/^./,letter=>letter.toUpperCase());this.selected.appendChild(option)}
    }
  }

  _bind() {
    const numeric=['deadZone','stickSize','sensitivity','dpadSize','spacing','opacity','controlScale'];
    for(const [key,field] of Object.entries(this.fields)){
      field?.addEventListener?.('input',()=>{
        const value=numeric.includes(key)?Number(field.value):field.type==='checkbox'?field.checked:field.value;
        this.settings[key]=value;this.settings.preset='custom';
        if(key==='movement'){this.settings.movementChosen=true;this.settings.chooserShown=true}
        this._changed();
      });
    }
    this.fields.preset?.addEventListener('change',()=>{if(this.fields.preset.value!=='custom'){applyTouchPreset(this.settings,this.fields.preset.value);this._changed();this.sync()}});
    this.selected?.addEventListener('change',()=>this._syncSelected());
    for(const [id,key] of [['touchControlX','x'],['touchControlY','y'],['touchControlSize','size']]){
      this.doc.querySelector(`#${id}`)?.addEventListener('input',event=>{
        this.settings.preset='custom';this.touchControls.layoutEditor.updateControl(this.selected.value,{[key]:Number(event.target.value)});this.sync(false);
      });
    }
    this.doc.querySelector('#touchEditLayout')?.addEventListener('change',event=>{
      if(event.target.checked&&this.settings.layoutLocked){event.target.checked=false;return}
      if(event.target.checked&&this.touchControls.enabled){this.touchControls.layoutEditor.setEditing(true);this.modal?.classList.add('hidden')}
      else{event.target.checked=false;this.touchControls.layoutEditor.setEditing(false)}
    });
    this.doc.querySelector('#saveTouchLayout')?.addEventListener('click',()=>{
      if(saveNamedTouchLayout(this.settings,this.doc.querySelector('#touchLayoutName')?.value)){this._changed();this._syncSaved()}
    });
    this.doc.querySelector('#loadTouchLayout')?.addEventListener('click',()=>{if(loadNamedTouchLayout(this.settings,this.saved?.value)){this._changed();this.sync()}});
    this.doc.querySelector('#deleteTouchLayout')?.addEventListener('click',()=>{if(deleteNamedTouchLayout(this.settings,this.saved?.value)){this._changed();this._syncSaved()}});
    this.doc.querySelector('#resetTouchLayout')?.addEventListener('click',()=>{
      const savedLayouts=this.settings.savedLayouts,reset=createDefaultTouchSettings({savedLayouts,movementChosen:true,chooserShown:true});
      Object.keys(this.settings).forEach(key=>delete this.settings[key]);Object.assign(this.settings,reset);
      this._changed();this.sync();
    });
    this.doc.querySelector('#touchTutorialButton')?.addEventListener('click',()=>{this.close();this.touchControls.showTutorial()});
    this.doc.querySelector('#touchFullscreenButton')?.addEventListener('click',()=>this.platform?.requestFullscreen?.());
    this.doc.querySelector('#closeTouchSettings')?.addEventListener('click',()=>this.close());
    this.doc.querySelector('#doneTouchSettings')?.addEventListener('click',()=>this.close());
  }

  _changed() {
    this.touchControls.applySettings();this.onChange(this.settings);this.sync(false);
  }

  _syncSaved() {
    if(!this.saved)return;
    const selected=this.saved.value;this.saved.innerHTML='';
    if(!this.settings.savedLayouts.length){const option=this.doc.createElement('option');option.value='';option.textContent='No saved layouts';this.saved.appendChild(option);return}
    for(const layout of this.settings.savedLayouts){const option=this.doc.createElement('option');option.value=layout.name;option.textContent=layout.name;option.selected=layout.name===selected;this.saved.appendChild(option)}
  }

  _syncSelected() {
    const id=this.selected?.value||'movement',position=this.settings.positions[id];
    if(!position)return;
    const x=this.doc.querySelector('#touchControlX'),y=this.doc.querySelector('#touchControlY'),size=this.doc.querySelector('#touchControlSize');
    if(x)x.value=position.x;if(y)y.value=position.y;if(size)size.value=position.size;
  }

  sync(includeSaved=true) {
    for(const [key,field] of Object.entries(this.fields)){
      if(!field)continue;
      if(field.type==='checkbox')field.checked=!!this.settings[key];else field.value=String(this.settings[key]);
    }
    const labels={
      touchDeadZoneValue:`${Math.round(this.settings.deadZone*100)}%`,
      touchStickSizeValue:`${this.settings.stickSize}px`,
      touchSensitivityValue:`${Number(this.settings.sensitivity).toFixed(2)}×`,
      touchDpadSizeValue:`${this.settings.dpadSize}px`,
      touchSpacingValue:`${Number(this.settings.spacing).toFixed(2)}×`,
      touchOpacityValue:`${Math.round(this.settings.opacity*100)}%`,
      touchScaleValue:`${Number(this.settings.controlScale).toFixed(2)}×`
    };
    for(const [id,value] of Object.entries(labels)){const output=this.doc.querySelector(`#${id}`);if(output)output.textContent=value}
    if(includeSaved)this._syncSaved();this._syncSelected();
  }

  open() {this.sync();this.modal?.classList.remove('hidden')}
  close() {this.modal?.classList.add('hidden');this.touchControls.layoutEditor.setEditing(false);const edit=this.doc.querySelector('#touchEditLayout');if(edit)edit.checked=false}
}
