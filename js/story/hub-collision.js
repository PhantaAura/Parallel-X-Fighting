const COLLIDER_CACHE=new WeakMap();

const HUB_STAGE_IDS=new Set([
  'training-field','training-road','expanded-training-region','tournament-hub',
  'after-hours-tournament','resonance-facility','remote-highlands',
  'echo-village','echo-caverns','echo-mountain'
]);

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

function isSolidBox(box){
  if(!box||box.solid===false)return false;
  if((box.alpha??1)<.28)return false;
  const sx=Math.abs(Number(box.sx)||0),sy=Math.abs(Number(box.sy)||0),sz=Math.abs(Number(box.sz)||0);
  if(sy<42||sx<18||sz<18)return false;
  if(sx>1300||sz>1300)return false; // floors, sky plates, and distant backdrops
  return true;
}

export function stageHubColliders(stage){
  if(!stage||!HUB_STAGE_IDS.has(stage.id))return[];
  if(COLLIDER_CACHE.has(stage))return COLLIDER_CACHE.get(stage);
  const boxes=(stage.scenery?.boxes||[]).filter(isSolidBox).map(box=>({
    type:'box',x:Number(box.x)||0,z:Number(box.z)||0,
    halfX:Math.abs(Number(box.sx)||0)/2,
    halfZ:Math.abs(Number(box.sz)||0)/2,
    minY:(Number(box.y)||0)-Math.abs(Number(box.sy)||0)/2,
    maxY:(Number(box.y)||0)+Math.abs(Number(box.sy)||0)/2,
    source:box
  }));
  const cylinders=(stage.scenery?.cylinders||[]).filter(item=>(item.solid??true)&&(item.alpha??1)>.28).map(item=>({
    type:'circle',x:Number(item.x)||0,z:Number(item.z)||0,radius:Math.max(Math.abs(Number(item.rx)||0),Math.abs(Number(item.rz)||0),18),
    minY:(Number(item.y)||0)-Math.abs(Number(item.sy)||80)/2,maxY:(Number(item.y)||0)+Math.abs(Number(item.sy)||80)/2,source:item
  }));
  const cones=(stage.scenery?.cones||[]).filter(item=>(item.solid??true)&&(item.alpha??1)>.28).map(item=>({
    type:'circle',x:Number(item.x)||0,z:Number(item.z)||0,radius:Math.max(Math.abs(Number(item.rx)||0),18),
    minY:(Number(item.y)||0)-Math.abs(Number(item.sy)||80)/2,maxY:(Number(item.y)||0)+Math.abs(Number(item.sy)||80)/2,source:item
  }));
  const explicit=(stage.scenery?.colliders||[]).map(item=>item.type==='circle'?{
    type:'circle',x:Number(item.x)||0,z:Number(item.z)||0,radius:Math.max(12,Number(item.radius)||20),
    minY:Number.isFinite(item.minY)?item.minY:-20,maxY:Number.isFinite(item.maxY)?item.maxY:220,source:item
  }:{
    type:'box',x:Number(item.x)||0,z:Number(item.z)||0,halfX:Math.max(8,Math.abs(Number(item.sx)||0)/2),halfZ:Math.max(8,Math.abs(Number(item.sz)||0)/2),
    minY:Number.isFinite(item.minY)?item.minY:-20,maxY:Number.isFinite(item.maxY)?item.maxY:220,source:item
  });
  const colliders=[...boxes,...cylinders,...cones,...explicit];
  COLLIDER_CACHE.set(stage,colliders);
  return colliders;
}

function resolveBox(x,z,radius,box){
  const minX=box.x-box.halfX-radius,maxX=box.x+box.halfX+radius;
  const minZ=box.z-box.halfZ-radius,maxZ=box.z+box.halfZ+radius;
  if(x<=minX||x>=maxX||z<=minZ||z>=maxZ)return{x,z,hit:false};
  const left=Math.abs(x-minX),right=Math.abs(maxX-x),top=Math.abs(z-minZ),bottom=Math.abs(maxZ-z);
  const smallest=Math.min(left,right,top,bottom);
  if(smallest===left)x=minX;else if(smallest===right)x=maxX;else if(smallest===top)z=minZ;else z=maxZ;
  return{x,z,hit:true};
}

function resolveCircle(x,z,radius,circle){
  const dx=x-circle.x,dz=z-circle.z,minimum=circle.radius+radius,distance=Math.hypot(dx,dz);
  if(distance>=minimum)return{x,z,hit:false};
  const safe=distance>.001?distance:1,nx=distance>.001?dx/safe:1,nz=distance>.001?dz/safe:0;
  return{x:circle.x+nx*minimum,z:circle.z+nz*minimum,hit:true};
}

export function resolveHubWorldCollision(stage,fighter,{radius}={}){
  if(!stage||!fighter||!HUB_STAGE_IDS.has(stage.id))return false;
  const bodyRadius=Math.max(16,Number(radius)||Number(fighter.collisionRadius)*.62||20);
  let x=Number(fighter.x)||0,z=Number(fighter.z)||0,hit=false;
  for(let pass=0;pass<3;pass++){
    let changed=false;
    for(const collider of stageHubColliders(stage)){
      const feetY=Number(fighter.y)||0,headY=feetY+150;
      if(headY<(collider.minY??-Infinity)||feetY>(collider.maxY??Infinity))continue;
      const result=collider.type==='circle'?resolveCircle(x,z,bodyRadius,collider):resolveBox(x,z,bodyRadius,collider);
      if(result.hit){x=result.x;z=result.z;changed=hit=true}
    }
    if(!changed)break;
  }
  if(hit){
    fighter.x=x;fighter.z=z;
    fighter.moveVX=(Number(fighter.moveVX)||0)*.18;fighter.moveVZ=(Number(fighter.moveVZ)||0)*.18;
    fighter.kvx=(Number(fighter.kvx)||0)*.35;fighter.kvz=(Number(fighter.kvz)||0)*.35;
  }
  return hit;
}

export function hubStageUsesCollision(stage){return Boolean(stage&&HUB_STAGE_IDS.has(stage.id))}
