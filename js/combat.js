export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const COMBO_RESET_FRAMES=48;
export const JUGGLE_LIMIT=6;

export const ATTACKS={
  light:{kind:'light',damage:6.5,startup:4,recovery:13,hitstun:16,range:44,knockback:5,energyGain:7},
  heavy:{kind:'heavy',damage:12,startup:12,recovery:28,hitstun:24,range:58,knockback:11,energyGain:10},
  launcher:{kind:'launcher',damage:9,startup:15,recovery:30,hitstun:30,range:50,knockback:4,launch:12,energyGain:9},
  air:{kind:'air',damage:6,startup:5,recovery:14,hitstun:18,range:48,knockback:5,launch:3,energyGain:6}
};

export const createComboState=()=>({hits:0,damage:0,scale:1,timer:0,attacker:null,juggles:0});
export function resetCombo(combo){Object.assign(combo,createComboState())}
export function scaledDamage(base,hit,kind='light'){
  const floor=kind==='ultimate'?.55:kind==='special'?.35:.22;
  return Math.max(1,base*Math.max(floor,1-Math.max(0,hit-1)*.1));
}

export function calculateFinalDamage({base,hit=1,kind='light',defense=1,armor=false,lowHealthAlt=false,blocked=false,trapped=false}){
  const scaled=scaledDamage(base,hit,kind);
  let final=scaled/(defense||1);
  if(armor)final*=.55;
  if(lowHealthAlt)final*=.86;
  if(blocked&&kind!=='seal')final*=.28;
  if(trapped)final*=1.35;
  return {scaled,final:Math.max(0,final),scale:scaled/base};
}

export class TimerRegistry{
  constructor(){this.ids=new Set();this.epoch=0}
  schedule(fn,delay){const epoch=this.epoch;const id=setTimeout(()=>{this.ids.delete(id);if(epoch===this.epoch)fn()},delay);this.ids.add(id);return id}
  cancelAll(){this.epoch++;for(const id of this.ids)clearTimeout(id);this.ids.clear()}
  get size(){return this.ids.size}
}

export class Projectile{
  constructor(owner,x,y,vx,vy,color,damage,size=10,type='orb',metadata={}){Object.assign(this,{owner,x,y,vx,vy,color,damage,size,type,life:180,dead:false},metadata)}
  update(world){
    if(this.dead||world.clash?.active)return;
    this.x+=this.vx;this.y+=this.vy;this.life--;
    if(world.tryProjectileClash?.(world,this))return;
    const target=this.owner===world.fighters[0]?world.fighters[1]:world.fighters[0];
    if(target&&overlaps({x:this.x-this.size,y:this.y-this.size,w:this.size*2,h:this.size*2},target.box())){
      target.hit(this.damage,this.owner.face*5,'special',this.owner,{hitstun:20});
      this.dead=true;world.effects.burst(this.x,this.y,this.color,16);world.shake=Math.max(world.shake,6);world.hitstop=4;
    }
    if(this.life<1||this.x<-60||this.x>world.width+60||this.y<-80||this.y>world.height+80)this.dead=true;
  }
  draw(ctx){
    ctx.save();ctx.fillStyle=this.color;ctx.shadowColor=this.color;ctx.shadowBlur=18;
    if(this.type==='beam')ctx.fillRect(this.x-this.size*1.6,this.y-this.size/2,this.size*3.2,this.size);
    else if(this.type==='disc'){ctx.translate(this.x,this.y);ctx.rotate(performance.now()/120);ctx.fillRect(-this.size,-3,this.size*2,6)}
    else{ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }
}
