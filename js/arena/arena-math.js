export const ARENA_BOUNDS=Object.freeze({minX:-360,maxX:360,minZ:-240,maxZ:240});

export function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
export function lerp(a,b,t){return a+(b-a)*t}
export function approach(value,target,amount){return value<target?Math.min(target,value+amount):Math.max(target,value-amount)}

export function normalizeMovement(x=0,z=0){
  const length=Math.hypot(x,z);
  if(length<=1)return{x,z,length};
  return{x:x/length,z:z/length,length:1};
}

export function aimVector(from,to){
  const dx=to.x-from.x,dz=to.z-from.z,length=Math.hypot(dx,dz)||1;
  return{x:dx/length,z:dz/length};
}

export function rotateToward(currentX,currentZ,targetX,targetZ,maxRadians){
  const current=Math.atan2(currentZ,currentX),target=Math.atan2(targetZ,targetX);
  let delta=((target-current+Math.PI*3)%(Math.PI*2))-Math.PI;
  delta=clamp(delta,-maxRadians,maxRadians);
  const next=current+delta;
  return{x:Math.cos(next),z:Math.sin(next)};
}

export function attackSpace(attacker,target,aimX=attacker.aimX??1,aimZ=attacker.aimZ??0){
  const dx=target.x-attacker.x,dz=target.z-attacker.z;
  return{
    forward:dx*aimX+dz*aimZ,
    lateral:Math.abs(dx*(-aimZ)+dz*aimX),
    horizontal:Math.hypot(dx,dz),
    vertical:Math.abs(((target.y??0)+(target.bodyCenter??68))-((attacker.y??0)+(attacker.bodyCenter??68)))
  };
}

export function hitVolumeConnects(attacker,target,volume={}){
  const space=attackSpace(attacker,target,volume.aimX??attacker.aimX,volume.aimZ??attacker.aimZ);
  const range=volume.range??96,width=volume.width??42,height=volume.height??72,behind=volume.behind??8;
  return space.forward>=-behind&&space.forward<=range&&space.lateral<=width&&space.vertical<=height;
}

export function projectileConnects(projectile,target){
  const dx=target.x-projectile.x,dz=target.z-projectile.z;
  const targetCenter=(target.y??0)+(target.bodyCenter??68);
  return Math.hypot(dx,dz)<=projectile.radius+(target.collisionRadius??28)&&Math.abs(targetCenter-projectile.y)<=projectile.height;
}

export function blockFacesAttacker(defender,attacker,threshold=.05){
  const toward=aimVector(defender,attacker);
  return (defender.aimX??toward.x)*toward.x+(defender.aimZ??toward.z)*toward.z>=threshold;
}

export function distance3D(a,b){
  return Math.hypot((b.x??0)-(a.x??0),(b.z??0)-(a.z??0),((b.y??0)-(a.y??0))*.75);
}
