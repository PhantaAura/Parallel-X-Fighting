function lerp(a,b,t){return a+(b-a)*t}

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

function cameraBlockers(stage,target,eye){
  return(stage?.scenery?.boxes||[])
    .filter(box=>(box.alpha??1)>.3&&(box.sy||0)>55&&(box.sx||0)<900&&(box.sz||0)<900)
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

function renderCamera(battle,targetY,{avoidOcclusion=false}={}){
  const c=battle.stage.camera;
  const yaw=c.yawDeg*Math.PI/180;
  const horizontal=battle.camera.distance*c.horizontalDistanceScale;
  battle.camera.target=[battle.camera.x,c.targetHeight+targetY*c.jumpTargetScale,battle.camera.z];
  const desiredEye=[
    battle.camera.x+Math.sin(yaw)*horizontal,
    c.heightBase+battle.camera.distance*c.heightDistanceScale,
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
  battle.camera.x=player.x;
  battle.camera.z=player.z;
  battle.camera.distance=distance;
  renderCamera(battle,player.y||0,{avoidOcclusion:true});
}

export function updateHubCamera(battle,{
  player=battle?.fighters?.[0],
  foe=battle?.fighters?.[1],
  frameFight=false,
  hubDistance=1010,
  fightBaseDistance=930,
  fightMaxDistance=1180
}={}){
  if(!battle?.camera||!player)return;
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
  renderCamera(battle,targetY,{avoidOcclusion:!frameFight});
}
