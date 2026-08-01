const GEOMETRY=Object.freeze({
  dojo:Object.freeze({label:'PRESSURE FLOOR',hint:'No cover. The close walls make every heavy commitment matter.',accent:'#e6bc7d',pieces:[]}),
  tournament:Object.freeze({label:'OFFICIAL RING',hint:'The ring stays completely clean. Win through spacing and edge control.',accent:'#ffd36f',pieces:[]}),
  'resonance-facility':Object.freeze({label:'CONDUIT LANES',hint:'Two solid relay banks split the floor into center and flank routes.',accent:'#66e6ff',pieces:Object.freeze([
    Object.freeze({id:'relay-north',type:'box',x:-250,z:-285,sx:250,sz:105,height:82,color:'#2c5268',accent:'#74e4f4'}),
    Object.freeze({id:'relay-south',type:'box',x:285,z:285,sx:250,sz:105,height:82,color:'#2c5268',accent:'#74e4f4'})
  ])}),
  'echo-caverns':Object.freeze({label:'CRYSTAL ROUTES',hint:'Three resonance pillars break the arena into tight curved approaches.',accent:'#c6a77a',pieces:Object.freeze([
    Object.freeze({id:'crystal-west',type:'circle',x:-390,z:245,radius:64,height:160,color:'#6b5144',accent:'#d0b58d'}),
    Object.freeze({id:'crystal-center',type:'circle',x:0,z:-270,radius:70,height:188,color:'#43636b',accent:'#8edce5'}),
    Object.freeze({id:'crystal-east',type:'circle',x:390,z:245,radius:64,height:160,color:'#3d5c70',accent:'#7dc5ee'})
  ])}),
  'echo-mountain':Object.freeze({label:'RIDGE CHASE',hint:'Rock outcrops bend long pursuit routes without turning the mountain into a wall box.',accent:'#d7ebff',pieces:Object.freeze([
    Object.freeze({id:'ridge-west',type:'circle',x:-330,z:-285,radius:90,height:120,color:'#465151',accent:'#a8c8ca'}),
    Object.freeze({id:'ridge-east',type:'circle',x:330,z:285,radius:90,height:120,color:'#4b5552',accent:'#b9d4d2'})
  ])})
});

export const STAGE_PERSONALITY=GEOMETRY;
export function stagePersonalityFor(id='dojo'){return GEOMETRY[id]||GEOMETRY.dojo}
export function stageGeometryFor(stageOrId){const id=typeof stageOrId==='string'?stageOrId:stageOrId?.id;return stagePersonalityFor(id).pieces||[]}

function resolveBox(x,z,radius,piece){
  const hx=piece.sx/2+radius,hz=piece.sz/2+radius,dx=x-piece.x,dz=z-piece.z;
  if(Math.abs(dx)>=hx||Math.abs(dz)>=hz)return{x,z,hit:false,piece:null};
  const px=hx-Math.abs(dx),pz=hz-Math.abs(dz);
  if(px<pz)x=piece.x+(dx<0?-hx:hx);else z=piece.z+(dz<0?-hz:hz);
  return{x,z,hit:true,piece};
}
function resolveCircle(x,z,radius,piece){
  const dx=x-piece.x,dz=z-piece.z,min=piece.radius+radius,d=Math.hypot(dx,dz);
  if(d>=min)return{x,z,hit:false,piece:null};
  const nx=d>.001?dx/d:1,nz=d>.001?dz/d:0;
  return{x:piece.x+nx*min,z:piece.z+nz*min,hit:true,piece};
}
export function resolveStageGeometry(stage,fighter,{radius}={}){
  const pieces=stageGeometryFor(stage);if(!pieces.length||!fighter)return false;
  const bodyRadius=Math.max(16,Number(radius)||Number(fighter.collisionRadius)*.64||20);let x=Number(fighter.x)||0,z=Number(fighter.z)||0,hit=false;
  for(let pass=0;pass<3;pass++){
    let changed=false;
    for(const piece of pieces){const result=piece.type==='circle'?resolveCircle(x,z,bodyRadius,piece):resolveBox(x,z,bodyRadius,piece);if(result.hit){x=result.x;z=result.z;changed=hit=true}}
    if(!changed)break;
  }
  if(hit){fighter.x=x;fighter.z=z;fighter.moveVX=(Number(fighter.moveVX)||0)*.24;fighter.moveVZ=(Number(fighter.moveVZ)||0)*.24;fighter.kvx=(Number(fighter.kvx)||0)*.42;fighter.kvz=(Number(fighter.kvz)||0)*.42;fighter.stageGeometryBump=.16}
  return hit;
}
export function projectileHitsStageGeometry(stage,projectile){
  const radius=Math.max(4,Number(projectile?.radius)||8),x=Number(projectile?.x)||0,z=Number(projectile?.z)||0;
  return stageGeometryFor(stage).find(piece=>piece.type==='circle'?Math.hypot(x-piece.x,z-piece.z)<=piece.radius+radius:Math.abs(x-piece.x)<=piece.sx/2+radius&&Math.abs(z-piece.z)<=piece.sz/2+radius)||null;
}
export function drawStagePersonality(renderer,stage,time=0){
  const personality=stagePersonalityFor(stage?.id);for(const piece of personality.pieces||[]){const pulse=.64+Math.sin(time*2.4+(piece.x||0)*.01)*.12;if(piece.type==='circle'){renderer.cylinder({x:piece.x,y:piece.height/2,z:piece.z,rx:piece.radius,sy:piece.height,color:piece.color});renderer.billboard({x:piece.x,y:piece.height+18,z:piece.z,size:piece.radius*.9,color:piece.accent,alpha:.15*pulse});renderer.disc({x:piece.x,y:6,z:piece.z,rx:piece.radius+12,rz:piece.radius+12,color:piece.accent,alpha:.10})}else{renderer.box({x:piece.x,y:piece.height/2,z:piece.z,sx:piece.sx,sy:piece.height,sz:piece.sz,color:piece.color});renderer.box({x:piece.x,y:piece.height+5,z:piece.z,sx:piece.sx*.82,sy:9,sz:piece.sz*.72,color:piece.accent,alpha:.62});renderer.disc({x:piece.x,y:6,z:piece.z,rx:piece.sx*.58,rz:piece.sz*.72,color:piece.accent,alpha:.08})}}
}
