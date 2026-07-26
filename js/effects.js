export function tint(hex,amount,clamp){const c=parseInt(hex.slice(1),16);return`rgb(${clamp((c>>16)+amount,0,255)},${clamp(((c>>8)&255)+amount,0,255)},${clamp((c&255)+amount,0,255)})`}

export class Particle{
  constructor(x,y,color){this.x=x;this.y=y;this.vx=(Math.random()-.5)*7;this.vy=(Math.random()-.5)*7;this.color=color;this.life=20+Math.random()*25;this.max=this.life}
  update(){this.x+=this.vx;this.y+=this.vy;this.vx*=.94;this.vy*=.94;this.life--}
  draw(ctx){ctx.globalAlpha=this.life/this.max;ctx.fillStyle=this.color;ctx.fillRect(this.x,this.y,4,4);ctx.globalAlpha=1}
}

export class EffectSystem{
  constructor(){this.effects=[];this.particles=[];this.spriteVisuals=null;this.particleCap=420}
  configure({particleCap}={}){if(Number.isFinite(Number(particleCap)))this.particleCap=Math.max(40,Math.min(600,Number(particleCap)));return this}
  add(effect){this.effects.push(effect);return effect}
  burst(x,y,color,count=14){const cap=Math.min(this.particleCap,this.spriteVisuals?.settings?.quality==='reduced'?160:420),available=Math.max(0,cap-this.particles.length);for(let i=0;i<Math.min(count,available);i++)this.particles.push(new Particle(x,y,color))}
  update(){for(const p of this.particles)p.update();this.particles=this.particles.filter(p=>p.life>0)}
  clear(){this.effects.length=0;this.particles.length=0}
  draw(ctx){
    for(const e of this.effects){
      ctx.save();ctx.globalAlpha=Math.max(0,e.l/120);
      if(this.spriteVisuals?.drawEffect(ctx,e)){ctx.restore();e.l--;continue}
      if(e.t==='slash'){ctx.strokeStyle=e.c;ctx.lineWidth=8;ctx.beginPath();ctx.arc(e.x,e.y,30,-1,1);ctx.stroke()}
      if(e.t==='trap'){ctx.strokeStyle=e.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,35,0,Math.PI*2);ctx.stroke()}
      if(e.t==='freeze'){ctx.fillStyle=e.c+'66';ctx.fillRect(e.x-8,e.y-8,64,102)}
      if(e.t==='seal'){ctx.strokeStyle=e.c;ctx.lineWidth=5;ctx.strokeRect(e.x-10,e.y-10,70,110)}
      if(e.t==='terra'){ctx.fillStyle=e.c+'33';ctx.fillRect(0,0,960,540)}
      if(e.t==='lens'){ctx.strokeStyle=e.c;ctx.lineWidth=3;ctx.shadowColor=e.c;ctx.shadowBlur=14;ctx.beginPath();ctx.ellipse(e.x,e.y,28,13,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(e.x,e.y,6,0,Math.PI*2);ctx.fillStyle=e.c;ctx.fill()}
      if(e.t==='dodge'){ctx.strokeStyle=e.c;ctx.lineWidth=4;ctx.beginPath();ctx.arc(e.x,e.y,26,0,Math.PI*2);ctx.stroke()}
      if(e.t==='counter'){ctx.strokeStyle=e.c;ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,34,0,Math.PI*2);ctx.stroke()}
      if(e.t==='agonyClone'){ctx.globalAlpha=Math.min(.75,e.l/20);ctx.fillStyle=e.c+'55';ctx.shadowColor=e.c;ctx.shadowBlur=16;ctx.fillRect(e.x-14,e.y+20,28,48);ctx.beginPath();ctx.arc(e.x,e.y+10,14,0,Math.PI*2);ctx.fill();ctx.fillStyle=e.c;ctx.fillRect(e.x+(e.face>0?8:-12),e.y+30,18,7)}
      if(e.t==='clash'||e.t==='beamClash'){const pulse=22+Math.sin(performance.now()/55)*8;ctx.globalAlpha=.88;ctx.strokeStyle=e.t==='beamClash'?'#7de9ff':'#fff6ae';ctx.lineWidth=e.t==='beamClash'?9:6;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=24;ctx.beginPath();ctx.arc(e.x,e.y,pulse,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(e.x-pulse*2,e.y);ctx.lineTo(e.x+pulse*2,e.y);ctx.stroke()}
      if(e.t==='perfectBlock'||e.t==='guardBreak'||e.t==='breaker'){ctx.strokeStyle=e.c;ctx.lineWidth=e.t==='guardBreak'?7:4;ctx.shadowColor=e.c;ctx.shadowBlur=20;ctx.beginPath();ctx.arc(e.x,e.y,18+(30-e.l)*1.2,0,Math.PI*2);ctx.stroke()}
      if(e.t==='throw'){ctx.strokeStyle=e.c;ctx.lineWidth=5;ctx.beginPath();ctx.arc(e.x,e.y,28,Math.PI*.2,Math.PI*1.5);ctx.stroke()}
      if(e.t==='ultimateAura'||e.t==='ultimateImpact'){const phase=(performance.now()/80)%6,p=e.pattern;ctx.strokeStyle=e.c;ctx.fillStyle=e.a||e.c;ctx.shadowColor=e.a||e.c;ctx.shadowBlur=26;ctx.lineWidth=e.t==='ultimateImpact'?9:5;
        if(['solar','sage','lazy'].includes(p)){for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(e.x,e.y,24+i*17+Math.sin(phase+i)*6,0,Math.PI*2);ctx.stroke()}}
        else if(['astrylte','time'].includes(p)){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(phase*.25);for(let i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.fillRect(18,-3,58,6)}ctx.restore()}
        else if(p==='lightning'){for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(e.x-80,e.y+i*13);ctx.lineTo(e.x-25,e.y+i*9-12);ctx.lineTo(e.x+55,e.y+i*7);ctx.stroke()}}
        else if(p==='earth'){for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(e.x+i*22,e.y+35);ctx.lineTo(e.x+i*18-10,e.y-5-Math.abs(i)*4);ctx.lineTo(e.x+i*18+10,e.y+35);ctx.fill()}}
        else if(p==='ice'||p==='emerald'){for(let i=0;i<7;i++){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(i*Math.PI/3.5);ctx.fillRect(20,-4,65,8);ctx.restore()}}
        else if(p==='phantom'){for(let i=-2;i<=2;i++){ctx.globalAlpha=.18+Math.abs(i)*.08;ctx.fillRect(e.x+i*34-14,e.y-28,28,70)}}
        else if(p==='paper'){for(let i=-3;i<=3;i++){ctx.save();ctx.translate(e.x+i*25,e.y+Math.sin(phase+i)*22);ctx.rotate(i*.18);ctx.fillRect(-15,-10,30,20);ctx.restore()}}
        else if(p==='seal'){ctx.strokeRect(e.x-48,e.y-48,96,96);ctx.beginPath();ctx.arc(e.x,e.y,34,0,Math.PI*2);ctx.stroke()}
        else if(p==='wood'){for(let i=-2;i<=2;i++){ctx.save();ctx.translate(e.x+i*20,e.y);ctx.rotate(i*.28);ctx.fillRect(-3,-55,6,110);ctx.restore()}}
        else if(p==='mechanical'){for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(e.x-70+i*20,e.y+Math.sin(phase+i)*15,7,0,Math.PI*2);ctx.fill()}}
        else{ctx.beginPath();ctx.arc(e.x,e.y,52,0,Math.PI*2);ctx.stroke()}
      }
      if(e.t==='ultimateMiss'){ctx.strokeStyle=e.c;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.x-20,e.y-20);ctx.lineTo(e.x+20,e.y+20);ctx.moveTo(e.x+20,e.y-20);ctx.lineTo(e.x-20,e.y+20);ctx.stroke()}
      if(e.t==='hitSpark'){const radius=e.kind==='ultimate'?34:e.kind==='heavy'||e.kind==='launcher'?25:e.kind==='special'?21:14;ctx.strokeStyle=e.c;ctx.fillStyle=e.c;ctx.shadowColor=e.c;ctx.shadowBlur=e.kind==='ultimate'?28:14;ctx.lineWidth=e.kind==='light'?3:6;for(let i=0;i<(e.kind==='light'?4:8);i++){ctx.save();ctx.translate(e.x,e.y);ctx.rotate(i*Math.PI/4);ctx.fillRect(radius*.25,-2,radius,4);ctx.restore()}if(e.kind==='launcher'){ctx.beginPath();ctx.moveTo(e.x-18,e.y+25);ctx.lineTo(e.x,e.y-35);ctx.lineTo(e.x+18,e.y+25);ctx.stroke()}}
      ctx.restore();e.l--;
    }
    this.effects=this.effects.filter(e=>e.l>0);
    for(const p of this.particles)p.draw(ctx);
  }
}
