"use strict";

import {CONTROLLER_STYLE_IDS,createCustomControllerMapping} from './input.js?v=2.3-controller-stabilization';

export const CONTROLLER_SETTINGS_KEY='pxControllerSettingsV1';
export const CONTROLLER_COMPLETION_FEATURES=Object.freeze([
  'detectionPrompt','styleChoice','savedPreferences','connectionEvents','deviceAssignment','menuNavigation','pause','testScreen'
]);

export function createDefaultControllerSettings(){
  return{version:1,promptSeen:false,styles:['xbox','xbox'],assignments:[null,null],deadZones:[.24,.24],customMappings:[createCustomControllerMapping(),createCustomControllerMapping()]};
}

function validStyle(value){return CONTROLLER_STYLE_IDS.includes(value)?value:'xbox'}
function validAssignment(value){const number=Number(value);return value===null||value==='auto'?null:Number.isInteger(number)&&number>=0?number:null}
function sanitizeCustom(mapping){
  const fallback=createCustomControllerMapping(),buttons={...fallback.buttons,...mapping?.buttons};
  for(const [action,value] of Object.entries(buttons))buttons[action]=Number.isInteger(Number(value))?Number(value):fallback.buttons[action];
  return{name:'Custom',buttons,labels:Object.fromEntries(Object.entries(buttons).map(([action,index])=>[action,`Button ${index+1}`]))};
}

export function loadControllerSettings(storage=globalThis.localStorage){
  const defaults=createDefaultControllerSettings();
  try{
    const saved=JSON.parse(storage?.getItem(CONTROLLER_SETTINGS_KEY)||'{}');
    return{version:1,promptSeen:!!saved.promptSeen,styles:[validStyle(saved.styles?.[0]),validStyle(saved.styles?.[1])],assignments:[validAssignment(saved.assignments?.[0]),validAssignment(saved.assignments?.[1])],deadZones:[Math.max(.1,Math.min(.6,Number(saved.deadZones?.[0])||.24)),Math.max(.1,Math.min(.6,Number(saved.deadZones?.[1])||.24))],customMappings:[sanitizeCustom(saved.customMappings?.[0]),sanitizeCustom(saved.customMappings?.[1])]};
  }catch{return defaults}
}

export function saveControllerSettings(settings,storage=globalThis.localStorage){
  try{storage?.setItem(CONTROLLER_SETTINGS_KEY,JSON.stringify(settings));return true}catch{return false}
}

export function detectControllerStyle(gamepad={}){
  const id=String(gamepad.id||'').toLowerCase();
  if(/nintendo|switch|joy-con|pro controller/.test(id))return'nintendo';
  if(/playstation|dualshock|dualsense|sony/.test(id))return'playstation';
  if(/xbox|xinput|microsoft/.test(id))return'xbox';
  return gamepad.mapping==='standard'?'xbox':'custom';
}

export function assignConnectedControllers(gamepads=[],current=[null,null]){
  const available=gamepads.filter(Boolean).map(pad=>pad.index),next=current.map(value=>available.includes(value)?value:null),used=new Set(next.filter(value=>value!==null));
  for(let side=0;side<2;side++)if(next[side]===null){const candidate=available.find(index=>!used.has(index));if(candidate!==undefined){next[side]=candidate;used.add(candidate)}}
  return next;
}

export class ControllerManager{
  constructor({input,doc=globalThis.document,win=globalThis.window,storage=globalThis.localStorage,getState=()=> 'menu',onPause=()=>{},onDisconnect=()=>{},onReconnect=()=>{},onStatus=()=>{},onStyleChange=()=>{}}={}){
    this.input=input;this.doc=doc;this.win=win;this.storage=storage;this.getState=getState;this.onPause=onPause;this.onDisconnect=onDisconnect;this.onReconnect=onReconnect;this.onStatus=onStatus;this.onStyleChange=onStyleChange;
    this.settings=loadControllerSettings(storage);this.connected=new Map();this.previous=new Map();this.disconnectedAssignments=new Map();this.frameHandle=0;this.active=true;
    this.refs={
      prompt:doc?.querySelector?.('#controllerDetected'),promptName:doc?.querySelector?.('#controllerDetectedName'),promptStyle:doc?.querySelector?.('#controllerDetectedStyle'),promptPlayer:doc?.querySelector?.('#controllerDetectedPlayer'),
      use:doc?.querySelector?.('#useDetectedController'),later:doc?.querySelector?.('#controllerDecideLater'),devices:[doc?.querySelector?.('#controllerDevice1'),doc?.querySelector?.('#controllerDevice2')],
      test:doc?.querySelector?.('#controllerTest'),testBody:doc?.querySelector?.('#controllerTestBody'),openTest:doc?.querySelector?.('#controllerTestButton'),closeTest:doc?.querySelector?.('#closeControllerTest')
    };
    this.applySettings();this.bind();this.scan();this.loop();
  }
  applySettings(){
    for(let side=1;side<=2;side++){
      this.input?.setControllerStyle(side,this.settings.styles[side-1]);
      this.input?.setControllerAssignment(side,this.settings.assignments[side-1]);
      this.input?.setControllerDeadZone(side,this.settings.deadZones[side-1]);
      const mapping=this.settings.customMappings[side-1];for(const [action,index] of Object.entries(mapping.buttons))this.input?.setCustomButton(side,action,index);
    }
  }
  bind(){
    this.win?.addEventListener?.('gamepadconnected',event=>this.connect(event.gamepad));
    this.win?.addEventListener?.('gamepaddisconnected',event=>this.disconnect(event.gamepad));
    this.refs.use?.addEventListener('click',()=>this.acceptPrompt());
    this.refs.later?.addEventListener('click',()=>{this.settings.promptSeen=true;this.persist();this.refs.prompt?.classList.add('hidden')});
    this.refs.openTest?.addEventListener('click',()=>{this.renderTest();this.refs.test?.classList.remove('hidden')});
    this.refs.closeTest?.addEventListener('click',()=>this.refs.test?.classList.add('hidden'));
    this.refs.devices.forEach((select,index)=>select?.addEventListener('change',()=>{this.settings.assignments[index]=validAssignment(select.value);this.input.setControllerAssignment(index+1,this.settings.assignments[index]);this.persist()}));
  }
  persist(){saveControllerSettings(this.settings,this.storage)}
  setStyle(side,style){this.settings.styles[side-1]=validStyle(style);this.input.setControllerStyle(side,this.settings.styles[side-1]);this.persist()}
  saveCustomMapping(side,mapping){this.settings.customMappings[side-1]=sanitizeCustom(mapping);this.persist()}
  scan(){
    const pads=[...(this.win?.navigator?.getGamepads?.()||[])].filter(Boolean);for(const pad of pads)this.connected.set(pad.index,pad);
    this.settings.assignments=assignConnectedControllers(pads,this.settings.assignments);this.applyAssignments();this.renderDevices();
    if(!this.settings.promptSeen&&pads[0])this.showPrompt(pads[0]);
  }
  connect(pad){
    if(!pad)return;this.connected.set(pad.index,pad);const remembered=this.disconnectedAssignments.get(pad.id);if(remembered&&!this.settings.assignments.includes(pad.index)&&this.settings.assignments[remembered.side-1]===null)this.settings.assignments[remembered.side-1]=pad.index;else this.settings.assignments=assignConnectedControllers([...this.connected.values()],this.settings.assignments);this.applyAssignments();this.input?.clear?.();this.renderDevices();this.persist();this.onStatus({type:'connected',pad,side:this.settings.assignments.indexOf(pad.index)+1});if(remembered){this.disconnectedAssignments.delete(pad.id);this.onReconnect({pad,side:remembered.side})}
    if(!this.settings.promptSeen)this.showPrompt(pad);
  }
  disconnect(pad){if(!pad)return;const side=this.settings.assignments.indexOf(pad.index)+1;if(side)this.disconnectedAssignments.set(pad.id,{side,index:pad.index});this.connected.delete(pad.index);this.previous.delete(pad.index);this.settings.assignments=this.settings.assignments.map(value=>value===pad.index?null:value);this.input?.clear?.();this.applyAssignments();this.renderDevices();this.persist();this.onStatus({type:'disconnected',pad,side});if(this.getState()==='playing')this.onDisconnect({pad,side})}
  applyAssignments(){for(let side=1;side<=2;side++)this.input.setControllerAssignment(side,this.settings.assignments[side-1])}
  showPrompt(pad){
    if(!this.refs.prompt)return;if(!this.doc?.querySelector?.('#startScreen')?.classList.contains('hidden')){this.pendingPrompt=pad;return}this.refs.prompt.dataset.gamepadIndex=String(pad.index);this.refs.promptName.textContent=pad.id||`Gamepad ${pad.index+1}`;this.refs.promptStyle.value=detectControllerStyle(pad);
    this.refs.promptPlayer.value=String(this.settings.assignments[0]===pad.index?1:2);this.refs.prompt.classList.remove('hidden');
  }
  promptAfterStart(){if(this.pendingPrompt&&!this.settings.promptSeen){const pad=this.pendingPrompt;this.pendingPrompt=null;this.showPrompt(pad)}}
  acceptPrompt(){
    const index=Number(this.refs.prompt?.dataset.gamepadIndex),side=Number(this.refs.promptPlayer?.value)||1,style=validStyle(this.refs.promptStyle?.value);
    this.settings.promptSeen=true;this.settings.assignments[side-1]=index;this.settings.styles[side-1]=style;this.input.setControllerAssignment(side,index);this.input.setControllerStyle(side,style);this.persist();this.renderDevices();this.refs.prompt?.classList.add('hidden');this.onStyleChange(side,style);
  }
  renderDevices(){
    const pads=[...this.connected.values()].sort((a,b)=>a.index-b.index);
    this.refs.devices.forEach((select,side)=>{
      if(!select)return;select.innerHTML='<option value="auto">Auto assignment</option>';
      for(const pad of pads){const option=this.doc.createElement('option');option.value=String(pad.index);option.textContent=`${pad.index+1}: ${pad.id||'Gamepad'}`;select.appendChild(option)}
      select.value=this.settings.assignments[side]===null?'auto':String(this.settings.assignments[side]);
    });
  }
  renderTest(){
    if(!this.refs.testBody)return;const pads=[...(this.win?.navigator?.getGamepads?.()||[])].filter(Boolean);
    this.refs.testBody.innerHTML=pads.length?pads.map(pad=>`<section><strong>${pad.index+1}: ${pad.id}</strong><div>Axes: ${pad.axes.map(value=>Number(value).toFixed(2)).join(', ')}</div><div>Pressed: ${pad.buttons.map((button,index)=>button.pressed?index+1:null).filter(Boolean).join(', ')||'none'}</div></section>`).join(''):'<p>No controller currently detected.</p>';
  }
  menuFocusables(){
    const selectors=['#controllerDetected','#controllerTest','#confirmDialog','#settingsPanel','#extrasPanel','#moveListPanel','#stageSelectPanel','#resultsScreen','#pauseMenu','#menuScreen','#mainMenuScreen','#startScreen'],scope=selectors.map(selector=>this.doc?.querySelector?.(selector)).find(element=>element&&!element.classList.contains('hidden'));
    return[...(scope?.querySelectorAll?.('button:not([disabled]),select:not([disabled]),input:not([disabled])')||[])].filter(element=>element.offsetParent!==null&&!element.closest('.hidden'));
  }
  moveMenuFocus(direction){
    const elements=this.menuFocusables();if(!elements.length)return;const active=this.doc.activeElement,index=elements.indexOf(active),next=index<0?0:(index+direction+elements.length)%elements.length;elements[next].focus();
  }
  adjustMenuSelect(direction){
    const active=this.doc.activeElement;if(active?.tagName!=='SELECT')return false;const next=Math.max(0,Math.min(active.options.length-1,active.selectedIndex+direction));if(next===active.selectedIndex)return true;active.selectedIndex=next;active.dispatchEvent(new Event('change',{bubbles:true}));return true;
  }
  pollPad(pad){
    const previous=this.previous.get(pad.index)||{},pressed=index=>!!pad.buttons[index]?.pressed,edge=index=>pressed(index)&&!previous[index],axis=Number(pad.axes[1]||0);
    const state={up:pressed(12)||axis<-.6,down:pressed(13)||axis>.6,left:pressed(14)||Number(pad.axes[0]||0)<-.6,right:pressed(15)||Number(pad.axes[0]||0)>.6};
    const directional=name=>state[name]&&!previous[name];
    const anyEdge=pad.buttons.some((button,index)=>!!button.pressed&&!previous[index])||directional('up')||directional('down')||directional('left')||directional('right');if(anyEdge)this.doc?.dispatchEvent?.(new CustomEvent('controllerinput',{detail:{pad}}));
    if(edge(9)&&this.getState()==='playing')this.onPause({pad,side:this.settings.assignments.indexOf(pad.index)+1||1});
    if(this.getState()==='menu'){
      if(directional('up'))this.moveMenuFocus(-1);if(directional('down'))this.moveMenuFocus(1);
      if(directional('left')&&!this.adjustMenuSelect(-1))this.moveMenuFocus(-1);
      if(directional('right')&&!this.adjustMenuSelect(1))this.moveMenuFocus(1);
      if(edge(0)){const active=this.doc.activeElement;if(active?.tagName==='BUTTON')active.click();else if(!active||active===this.doc.body)this.moveMenuFocus(1)}
      if(edge(1))this.doc?.dispatchEvent?.(new CustomEvent('controllercancel'));
    }
    this.previous.set(pad.index,{...state,...Object.fromEntries(pad.buttons.map((button,index)=>[index,!!button.pressed]))});
  }
  loop(){
    if(!this.active)return;const pads=[...(this.win?.navigator?.getGamepads?.()||[])].filter(Boolean);for(const pad of pads)this.pollPad(pad);if(!this.refs.test?.classList.contains('hidden'))this.renderTest();
    this.frameHandle=this.win?.requestAnimationFrame?.(()=>this.loop())||0;
  }
  destroy(){this.active=false;this.win?.cancelAnimationFrame?.(this.frameHandle)}
}
