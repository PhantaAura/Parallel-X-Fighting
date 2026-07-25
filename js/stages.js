export const STAGES = {
  dojo:{n:'Tangai Dojo',a:'#7bc6ff',b:'#e1f6ff',g:'#95663a'},
  tournament:{n:'Global Tournament',a:'#4c75d6',b:'#f4c36e',g:'#d7c499'},
  asrylyte:{n:'Asrylyte Zone',a:'#260532',b:'#8d1c83',g:'#311343'},
  clonebase:{n:'Clone Organization Base',a:'#101827',b:'#273852',g:'#202532'},
  hell:{n:'Hell Arena',a:'#3c0508',b:'#c32611',g:'#26090b'}
};

export function drawStage(ctx,stage,width,height,ground){
  const s=STAGES[stage],g=ctx.createLinearGradient(0,0,0,ground);g.addColorStop(0,s.a);g.addColorStop(1,s.b);ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
  if(stage==='dojo'){ctx.fillStyle='#f5e5c8';ctx.fillRect(90,110,780,260);ctx.fillStyle='#5a3426';for(let x=110;x<860;x+=95)ctx.fillRect(x,110,8,260);ctx.fillStyle='#df3b2f';ctx.beginPath();ctx.arc(width/2,185,45,0,Math.PI*2);ctx.fill()}
  else if(stage==='tournament'){ctx.fillStyle='#ffffff33';for(let y=110;y<300;y+=45)ctx.fillRect(0,y,width,24);ctx.fillStyle='#ddd';ctx.fillRect(80,370,800,18)}
  else if(stage==='asrylyte'){ctx.fillStyle='#ff4fd844';for(let i=0;i<18;i++){ctx.beginPath();ctx.arc((i*73)%width,70+(i%5)*55,3+(i%4),0,Math.PI*2);ctx.fill()}ctx.strokeStyle='#ff79e8';for(let x=0;x<width;x+=120){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+80,ground);ctx.stroke()}}
  else if(stage==='clonebase'){ctx.fillStyle='#6bd4ff22';for(let x=60;x<width;x+=150){ctx.fillRect(x,80,70,220);ctx.strokeStyle='#6bd4ff';ctx.strokeRect(x,80,70,220)}ctx.fillStyle='#e23b3b';ctx.fillRect(width/2-25,125,50,50)}
  else{ctx.fillStyle='#ff6a0033';for(let i=0;i<14;i++){ctx.beginPath();ctx.arc(i*80,350-(i%3)*40,25,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffb000';for(let x=20;x<width;x+=90){ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+18,ground-45);ctx.lineTo(x+36,ground);ctx.fill()}}
  ctx.fillStyle=s.g;ctx.fillRect(0,ground,width,height-ground);ctx.fillStyle='#ffffff22';ctx.fillRect(0,ground,width,4);ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.font='bold 16px Segoe UI';ctx.fillText(s.n,20,height-18);ctx.globalAlpha=1;
}
