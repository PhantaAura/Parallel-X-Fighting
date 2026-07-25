import {clamp} from './combat.js';

export const CAMERA_BALANCE={maxZoom:1.42,restoreSpeed:.16,maxShake:14};
export const createCameraState=()=>({active:false,zoom:1,targetZoom:1,x:480,y:270,targetX:480,targetY:270,slowMotion:1});

export function focusCamera(world,attacker,target,zoom=1.25){
  if(!world.camera)world.camera=createCameraState();
  const x=((attacker?.x||0)+(target?.x||0)+(target?.w||48))/2,y=((attacker?.y||0)+(target?.y||0))/2+45;
  Object.assign(world.camera,{active:true,targetZoom:clamp(zoom,1,CAMERA_BALANCE.maxZoom),targetX:x,targetY:y,slowMotion:.55});
}

export function updateCamera(world){
  const camera=world.camera;if(!camera)return;
  camera.zoom+=(camera.targetZoom-camera.zoom)*.12;
  camera.x+=(camera.targetX-camera.x)*.14;camera.y+=(camera.targetY-camera.y)*.14;
}

export function restoreCamera(world){
  if(!world.camera)world.camera=createCameraState();
  Object.assign(world.camera,createCameraState());
}

export function applyCamera(ctx,camera,width,height){
  if(!camera?.active)return;
  ctx.translate(width/2,height/2);
  ctx.scale(camera.zoom,camera.zoom);
  ctx.translate(-camera.x,-camera.y);
}

export function freezeFrame(world,frames=6){world.hitstop=Math.max(world.hitstop,frames)}
export function impactShake(world,amount=8,reduced=false){world.shake=Math.max(world.shake,reduced?amount*.35:Math.min(CAMERA_BALANCE.maxShake,amount))}
