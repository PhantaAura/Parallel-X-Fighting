function lerp(a,b,t){return a+(b-a)*t}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

const HUB_CAMERA_LOOK=new WeakMap();
const ACTIVE_HUB_CAMERA_STATES=new Set();

export function createHubCameraLookState(){
  return{
    yawOffset:0,
    pitchOffset:0,
    pointerX:0,
    pointerY:0,
    lastPointerX:null,
    lastPointerY:null,
    lastInputAt:0,
    enabled:false,
    dragging:false,
    pointerId:null,
    canvas:null,
    pointerDown:null,
    pointerMove:null,
    pointerUp:null,
    pointerCancel:null,
    lostCapture:null
  };
}

function nowMs(){
  return typeof performance!=='undefined'&&typeof performance.now==='function'?performance.now():Date.now();
}

function cameraPreferences(){
  const body=typeof document!=='undefined'?document.body:null;
  const mode=body?.dataset?.hubCameraMode||'drag';
  const sensitivity=clamp(Number(body?.dataset?.hubCameraSensitivity)||1,.4,1.6);
  return{enabled:mode!=='off',sensitivity};
}

function pointerCanDrag(event){
  const type=event?.pointerType;
  return(!type||type==='mouse'||type==='pen')&&(event?.button===0||event?.button===undefined);
}

function stopPointerDrag(state){
  if(!state)return;
  const canvas=state.canvas,pointerId=state.pointerId;
  if(canvas&&pointerId!==null){
    try{if(canvas.hasPointerCapture?.(pointerId))canvas.releasePointerCapture(pointerId)}catch{}
  }
  state.dragging=false;
  state.pointerId=null;
  state.lastPointerX=null;
  state.lastPointerY=null;
  canvas?.classList?.remove('hubCameraDragging');
}

function detachPointerHandlers(state){
  const canvas=state?.canvas;
  if(!canvas)return;
  if(state.pointerDown)canvas.removeEventListener('pointerdown',state.pointerDown);
  if(state.pointerMove)canvas.removeEventListener('pointermove',state.pointerMove);
  if(state.pointerUp)canvas.removeEventListener('pointerup',state.pointerUp);
  if(state.pointerCancel)canvas.removeEventListener('pointercancel',state.pointerCancel);
  if(state.lostCapture)canvas.removeEventListener('lostpointercapture',state.lostCapture);
  stopPointerDrag(state);
}

function lookStateFor(battle){
  if(!battle||typeof battle!=='object')return createHubCameraLookState();
  let state=HUB_CAMERA_LOOK.get(battle);
  if(!state){
    state=createHubCameraLookState();
    HUB_CAMERA_LOOK.set(battle,state);ACTIVE_HUB_CAMERA_STATES.add(state);
  }
  const canvas=battle.root?.querySelector?.('canvas');
  if(canvas&&state.canvas!==canvas){
    detachPointerHandlers(state);
    state.canvas=canvas;
    state.pointerDown=event=>{
      if(!state.enabled||!cameraPreferences().enabled||!pointerCanDrag(event))return;
      // Camera drag can only begin on the game canvas. UI buttons, maps, dialogue,
      // menus, and overlays receive the pointer first and therefore never rotate it.
      if(event.target!==canvas||event.defaultPrevented)return;
      state.dragging=true;
      state.pointerId=event.pointerId;
      state.lastPointerX=Number(event.clientX);
      state.lastPointerY=Number(event.clientY);
      state.lastInputAt=nowMs();
      canvas.classList.add('hubCameraDragging');
      try{canvas.setPointerCapture?.(event.pointerId)}catch{}
      event.preventDefault();
    };
    state.pointerMove=event=>{
      if(!state.enabled||!state.dragging||event.pointerId!==state.pointerId)return;
      let movementX=Number(event.movementX)||0,movementY=Number(event.movementY)||0;
      if(!movementX&&!movementY&&state.lastPointerX!==null){
        movementX=Number(event.clientX)-state.lastPointerX;
        movementY=Number(event.clientY)-state.lastPointerY;
      }
      state.lastPointerX=Number(event.clientX);
      state.lastPointerY=Number(event.clientY);
      if(Math.abs(movementX)>180||Math.abs(movementY)>180)return;
      state.pointerX+=clamp(movementX,-70,70);
      state.pointerY+=clamp(movementY,-70,70);
      if(Math.abs(movementX)>.01||Math.abs(movementY)>.01)state.lastInputAt=nowMs();
      event.preventDefault();
    };
    state.pointerUp=event=>{if(event.pointerId===state.pointerId)stopPointerDrag(state)};
    state.pointerCancel=event=>{if(event.pointerId===state.pointerId)stopPointerDrag(state)};
    state.lostCapture=()=>stopPointerDrag(state);
    canvas.addEventListener('pointerdown',state.pointerDown,{passive:false});
    canvas.addEventListener('pointermove',state.pointerMove,{passive:false});
    canvas.addEventListener('pointerup',state.pointerUp,{passive:true});
    canvas.addEventListener('pointercancel',state.pointerCancel,{passive:true});
    canvas.addEventListener('lostpointercapture',state.lostCapture,{passive:true});
  }
  return state;
}

function assignedGamepad(battle){
  if(typeof navigator==='undefined'||typeof navigator.getGamepads!=='function')return null;
  const pads=Array.from(navigator.getGamepads()||[]);
  const assignment=battle?.controls?.input?.getControllerAssignment?.(1);
  return pads[assignment===null||assignment===undefined?0:assignment]||pads.find(Boolean)||null;
}

function deadZoneAxis(value,deadZone=.18){
  const amount=Number(value)||0,absolute=Math.abs(amount);
  if(absolute<=deadZone)return 0;
  return Math.sign(amount)*(absolute-deadZone)/(1-deadZone);
}

export function applyHubCameraLook(state,{
  rightX=0,
  rightY=0,
  mouseX=0,
  mouseY=0,
  now=nowMs(),
  frameFight=false,
  enabled=true,
  sensitivity=1
}={}){
  const controllerX=deadZoneAxis(rightX),controllerY=deadZoneAxis(rightY);
  const safeSensitivity=clamp(Number(sensitivity)||1,.4,1.6);
  const moved=Math.abs(controllerX)>.001||Math.abs(controllerY)>.001||Math.abs(mouseX)>.001||Math.abs(mouseY)>.001;
  if(enabled&&!frameFight&&moved){
    state.yawOffset=clamp(state.yawOffset+(controllerX*1.65+mouseX*.14)*safeSensitivity,-165,165);
    state.pitchOffset=clamp(state.pitchOffset-(controllerY*.9+mouseY*.075)*safeSensitivity,-18,24);
    state.lastInputAt=now;
  }
  // Exploration look now stays where the player leaves it. It only recenters when
  // free camera is disabled or combat takes control of the framing.
  if(frameFight||!enabled){
    const amount=frameFight?.24:.18;
    state.yawOffset=lerp(state.yawOffset,0,amount);
    state.pitchOffset=lerp(state.pitchOffset,0,amount);
    if(Math.abs(state.yawOffset)<.03)state.yawOffset=0;
    if(Math.abs(state.pitchOffset)<.03)state.pitchOffset=0;
  }
  return state;
}

function hubCameraUiBlocked(battle){
  if(battle?.paused)return true;
  if(typeof document==='undefined')return false;
  return Boolean(document.querySelector('[aria-modal="true"]:not([hidden]), .storyRpgPause:not([hidden]), .dialogueOverlay:not([hidden]), .fullMap:not([hidden])'));
}

function updateHubCameraLook(battle,frameFight){
  const state=lookStateFor(battle),preferences=cameraPreferences();
  const enabled=!frameFight&&!hubCameraUiBlocked(battle)&&preferences.enabled;
  state.enabled=enabled;
  if(!enabled&&state.dragging)stopPointerDrag(state);
  const pad=enabled?assignedGamepad(battle):null;
  const mouseX=enabled?state.pointerX:0,mouseY=enabled?state.pointerY:0;
  state.pointerX=0;state.pointerY=0;
  applyHubCameraLook(state,{
    rightX:Number(pad?.axes?.[2])||0,
    rightY:Number(pad?.axes?.[3])||0,
    mouseX,mouseY,frameFight,enabled,sensitivity:preferences.sensitivity
  });
  battle.root?.classList?.toggle('hubCameraLookEnabled',enabled);
  battle.root?.classList?.toggle('hubCameraLookDisabled',!enabled&&!frameFight);
  return state;
}

export function resetAllHubCameras(){for(const state of ACTIVE_HUB_CAMERA_STATES){stopPointerDrag(state);state.yawOffset=0;state.pitchOffset=0;state.pointerX=0;state.pointerY=0;state.lastInputAt=0}}

export function resetHubCameraLook(battle){
  const state=lookStateFor(battle);
  stopPointerDrag(state);
  state.yawOffset=0;state.pitchOffset=0;state.pointerX=0;state.pointerY=0;state.lastInputAt=0;
}

function cameraFollowRate(camera,targetX,targetZ){
  const gap=Math.hypot((camera.x||0)-targetX,(camera.z||0)-targetZ);
  if(gap>620)return 1;
  if(gap>320)return .34;
  if(gap>170)return .2;
  return .11;
}

function segmentAabbEntry(start,end,box,padding=12){
  const halfX=Math.max(0,(box.sx||0)/2+padding),halfY=Math.max(0,(box.sy||0)/2+padding),halfZ=Math.max(0,(box.sz||0)/2+padding);
  const min=[(box.x||0)-halfX,(box.y||0)-halfY,(box.z||0)-halfZ];
  const max=[(box.x||0)+halfX,(box.y||0)+halfY,(box.z||0)+halfZ];
  let near=0,far=1;
  for(let axis=0;axis<3;axis++){
    const delta=end[axis]-start[axis];
    if(Math.abs(delta)<1e-6){
      if(start[axis]<min[axis]||start[axis]>max[axis])return null;
      continue;
    }
    let a=(min[axis]-start[axis])/delta,b=(max[axis]-start[axis])/delta;
    if(a>b)[a,b]=[b,a];
    near=Math.max(near,a);far=Math.min(far,b);
    if(near>far)return null;
  }
  return near;
}

function cameraPrimitiveBoxes(stage){
  const scenery=stage?.scenery||{},boxes=[...(scenery.boxes||[])];
  for(const item of scenery.cylinders||[])boxes.push({...item,sx:(item.rx||20)*2,sy:item.sy||80,sz:(item.rz||item.rx||20)*2});
  for(const item of scenery.cones||[])boxes.push({...item,sx:(item.rx||20)*2,sy:item.sy||80,sz:(item.rz||item.rx||20)*2});
  for(const item of scenery.roofs||[])boxes.push({...item,sx:item.sx||120,sy:item.sy||50,sz:item.sz||120});
  return boxes;
}
function cameraBlockers(stage,target,eye){
  return cameraPrimitiveBoxes(stage)
    .filter(box=>(box.alpha??1)>.3&&(box.sy||0)>45&&(box.sx||0)<1100&&(box.sz||0)<1100)
    .map(box=>({box,entry:segmentAabbEntry(target,eye,box)}))
    .filter(hit=>hit.entry!==null&&hit.entry>.04&&hit.entry<.96)
    .sort((a,b)=>a.entry-b.entry);
}

export function resolveHubCameraOcclusion(stage,target,desiredEye){
  const blockers=cameraBlockers(stage,target,desiredEye);
  if(!blockers.length)return desiredEye;
  const highest=Math.max(...blockers.map(({box})=>(box.y||0)+(box.sy||0)/2));
  const raised=[desiredEye[0],Math.max(desiredEye[1],highest+80),desiredEye[2]];
  if(!cameraBlockers(stage,target,raised).length)return raised;
  const first=blockers[0];
  const safeT=Math.max(.2,first.entry-.08);
  return[
    target[0]+(desiredEye[0]-target[0])*safeT,
    Math.max(target[1]+150,target[1]+(desiredEye[1]-target[1])*safeT),
    target[2]+(desiredEye[2]-target[2])*safeT
  ];
}

function renderCamera(battle,targetY,{avoidOcclusion=false,look=null}={}){
  const c=battle.stage.camera;
  const yaw=(c.yawDeg+(look?.yawOffset||0))*Math.PI/180;
  const horizontal=battle.camera.distance*c.horizontalDistanceScale;
  battle.camera.target=[battle.camera.x,c.targetHeight+targetY*c.jumpTargetScale,battle.camera.z];
  const desiredEye=[
    battle.camera.x+Math.sin(yaw)*horizontal,
    c.heightBase+battle.camera.distance*c.heightDistanceScale+(look?.pitchOffset||0)*8,
    battle.camera.z+Math.cos(yaw)*horizontal
  ];
  battle.camera.eye=avoidOcclusion
    ?resolveHubCameraOcclusion(battle.stage,battle.camera.target,desiredEye)
    :desiredEye;
  battle.cameraShake*=.86;
  if(battle.cameraShake<.15)battle.cameraShake=0;
}

export function snapHubCamera(battle,player,{distance=1010}={}){
  if(!battle?.camera||!player)return;
  resetHubCameraLook(battle);
  battle.camera.x=player.x;
  battle.camera.z=player.z;
  battle.camera.distance=distance;
  renderCamera(battle,player.y||0,{avoidOcclusion:true});
}

export function updateHubCamera(battle,{
  player=battle?.fighters?.[0],
  foe=battle?.fighters?.[1],
  frameFight=false,
  allowLook=!frameFight,
  hubDistance=1010,
  fightBaseDistance=930,
  fightMaxDistance=1180
}={}){
  if(!battle?.camera||!player)return;
  const lookState=updateHubCameraLook(battle,frameFight||!allowLook);
  const look=frameFight||!allowLook?null:lookState;
  let focusX=player.x,focusZ=player.z,distanceTarget=hubDistance,targetY=player.y||0;
  if(frameFight&&foe){
    const separation=Math.hypot(player.x-foe.x,player.z-foe.z);
    focusX=(player.x+foe.x)/2;
    focusZ=(player.z+foe.z)/2;
    distanceTarget=Math.max(fightBaseDistance,Math.min(fightMaxDistance,fightBaseDistance+separation*.36));
    targetY=Math.max(player.y||0,foe.y||0);
  }
  const follow=frameFight?.085:cameraFollowRate(battle.camera,focusX,focusZ);
  battle.camera.x=lerp(battle.camera.x,focusX,follow);
  battle.camera.z=lerp(battle.camera.z,focusZ,follow);
  battle.camera.distance=lerp(battle.camera.distance,distanceTarget,frameFight?.065:.085);
  renderCamera(battle,targetY,{avoidOcclusion:!frameFight,look});
}
