// Screen-relative navigation. Distances use game-world units, not real-world metres.
export function questDirection(player,target,eye=[0,0,1],focus=[0,0,0]){
  if(!player||!target||![player.x,player.z,target.x,target.z].every(Number.isFinite))return null;
  const dx=target.x-player.x,dz=target.z-player.z,yaw=Math.atan2(eye[0]-focus[0],eye[2]-focus[2]);
  const screenX=dx*Math.cos(yaw)-dz*Math.sin(yaw),screenY=dx*Math.sin(yaw)+dz*Math.cos(yaw);
  const distance=Math.hypot(dx,dz);
  return{angle:Math.atan2(screenX,-screenY)*180/Math.PI,distance,near:distance<=135};
}
export function nearestMainInteraction(items,player){
  return(items||[]).filter(item=>item&&!item.kind?.startsWith('optional')&&item.kind!=='building-enter'&&Number.isFinite(item.x)&&Number.isFinite(item.z))
    .sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0]||null;
}
