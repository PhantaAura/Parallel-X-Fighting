export const STAGES = {
  dojo:{n:'Tangai Dojo',a:'#7bc6ff',b:'#e1f6ff',g:'#95663a'},
  tournament:{n:'Global Tournament',a:'#4c75d6',b:'#f4c36e',g:'#d7c499'},
  asrylyte:{n:'Asrylyte Zone',a:'#260532',b:'#8d1c83',g:'#311343'},
  clonebase:{n:'Clone Organization Base',a:'#101827',b:'#273852',g:'#202532'},
  hell:{n:'Hell Arena',a:'#3c0508',b:'#c32611',g:'#26090b'}
};

export function drawStage(ctx,stage,width,height,ground){
  const now=performance.now()/1000;
  const s=STAGES[stage],g=ctx.createLinearGradient(0,0,0,ground);g.addColorStop(0,s.a);g.addColorStop(1,s.b);ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
  if(stage==='dojo'){ctx.fillStyle='#f5e5c8';ctx.fillRect(90,110,780,260);ctx.fillStyle='#5a3426';for(let x=110;x<860;x+=95)ctx.fillRect(x,110,8,260);ctx.fillStyle='#df3b2f';ctx.beginPath();ctx.arc(width/2,185,45,0,Math.PI*2);ctx.fill();ctx.fillStyle='#6f4028';ctx.fillRect(150,300,110,16);ctx.fillRect(700,270,18,92);ctx.strokeStyle='#e6c27d';ctx.lineWidth=5;ctx.beginPath();ctx.arc(718,275+Math.sin(now)*5,32,0,Math.PI*2);ctx.stroke()}
  else if(stage==='tournament'){ctx.fillStyle='#11182b';for(let i=0;i<34;i++){ctx.beginPath();ctx.arc(i*31,235+(i%3)*18+Math.sin(now+i)*2,13,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffffff33';for(let y=110;y<220;y+=45)ctx.fillRect(0,y,width,24);ctx.fillStyle='#ddd';ctx.fillRect(80,370,800,18);ctx.strokeStyle='#f4c36e';ctx.lineWidth=4;ctx.strokeRect(82,330,796,56)}
  else if(stage==='asrylyte'){ctx.fillStyle='#ff4fd844';for(let i=0;i<18;i++){ctx.save();ctx.translate((i*73+now*12*(i%2?1:-1))%width,70+(i%5)*55+Math.sin(now+i)*10);ctx.rotate(now*.25+i);ctx.fillRect(-5,-5,10+(i%4)*4,10+(i%4)*4);ctx.restore()}ctx.strokeStyle='#ff79e8';for(let x=0;x<width;x+=120){ctx.beginPath();ctx.moveTo(x+Math.sin(now)*8,0);ctx.lineTo(x+80,ground);ctx.stroke()}}
  else if(stage==='clonebase'){ctx.fillStyle='#6bd4ff22';for(let x=60;x<width;x+=150){ctx.fillRect(x,80,70,220);ctx.strokeStyle='#6bd4ff';ctx.strokeRect(x,80,70,220);ctx.fillStyle='#09131d';ctx.beginPath();ctx.arc(x+35,160+Math.sin(now+x)*3,17,0,Math.PI*2);ctx.fill();ctx.fillRect(x+22,177,26,64);ctx.fillStyle='#6bd4ff22'}ctx.fillStyle=Math.sin(now*4)>0?'#e23b3b':'#6d1111';ctx.fillRect(width/2-25,125,50,50);ctx.strokeStyle='#8596aa';for(let y=40;y<350;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y+15);ctx.stroke()}}
  else{ctx.fillStyle='#ff6a0033';for(let i=0;i<14;i++){ctx.beginPath();ctx.arc(i*80,350-(i%3)*40+Math.sin(now*2+i)*8,25,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffb000';for(let x=20;x<width;x+=90){const flame=45+Math.sin(now*5+x)*12;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+18,ground-flame);ctx.lineTo(x+36,ground);ctx.fill()}ctx.globalAlpha=.12;for(let y=120;y<400;y+=35){ctx.fillStyle='#ffb04a';ctx.fillRect(Math.sin(now+y)*20,y,width,3)}ctx.globalAlpha=1}
  ctx.fillStyle=s.g;ctx.fillRect(0,ground,width,height-ground);ctx.fillStyle='#ffffff22';ctx.fillRect(0,ground,width,4);ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.font='bold 16px Segoe UI';ctx.fillText(s.n,20,height-18);ctx.globalAlpha=1;
}
