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
  if(stage==='dojo'){
    const wall=ctx.createLinearGradient(0,92,0,ground);wall.addColorStop(0,'#f2dfb6');wall.addColorStop(1,'#c99a63');ctx.fillStyle=wall;ctx.fillRect(70,92,width-140,ground-92);
    ctx.fillStyle='#352219';ctx.fillRect(54,76,width-108,22);ctx.fillRect(70,ground-17,width-140,17);
    ctx.fillStyle='#674126';for(let x=78;x<width-70;x+=110)ctx.fillRect(x,92,11,ground-92);
    ctx.fillStyle='#744627';for(let y=155;y<ground-30;y+=72)ctx.fillRect(70,y,width-140,7);
    ctx.fillStyle='#efe0bd';for(let x=92;x<width-98;x+=110)ctx.fillRect(x,108,88,118);
    ctx.fillStyle='#8f2421';ctx.fillRect(width/2-70,105,30,125);ctx.fillRect(width/2+40,105,30,125);
    ctx.fillStyle='#d7a643';ctx.fillRect(width/2-76,103,42,8);ctx.fillRect(width/2+34,103,42,8);
    ctx.fillStyle='#bd2d28';ctx.beginPath();ctx.arc(width/2,158,49,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#e8bd58';ctx.lineWidth=8;ctx.beginPath();ctx.arc(width/2,158,31,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(width/2,129);ctx.lineTo(width/2,187);ctx.moveTo(width/2-25,145);ctx.lineTo(width/2+25,171);ctx.stroke();
    ctx.fillStyle='#5c371f';ctx.fillRect(115,304,132,15);ctx.fillRect(width-247,304,132,15);
    ctx.fillRect(126,319,12,40);ctx.fillRect(224,319,12,40);ctx.fillRect(width-236,319,12,40);ctx.fillRect(width-138,319,12,40);
    ctx.fillStyle='#452b1d';ctx.fillRect(88,245,105,9);ctx.fillRect(width-193,245,105,9);
    ctx.strokeStyle='#c7a15a';ctx.lineWidth=6;for(const x of [112,143,width-143,width-112]){ctx.beginPath();ctx.moveTo(x,247);ctx.lineTo(x+(x<width/2?16:-16),322);ctx.stroke()}
    ctx.strokeStyle='#87542e';ctx.lineWidth=2;for(let y=ground+16;y<height;y+=17){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke()}
    ctx.fillStyle='#ffffff18';for(let x=0;x<width;x+=64)ctx.fillRect(x,ground,2,height-ground);
    ctx.fillStyle='#8f2925';ctx.fillRect(38,ground-92,36,82);ctx.fillRect(width-74,ground-92,36,82);
    ctx.fillStyle='#e0ad4c';ctx.fillRect(31,ground-102,50,12);ctx.fillRect(width-81,ground-102,50,12);
    ctx.globalAlpha=.28+.08*Math.sin(now*2);ctx.fillStyle='#ffd887';ctx.fillRect(70,92,width-140,8);ctx.globalAlpha=1;
  }
  else if(stage==='tournament'){ctx.fillStyle='#11182b';for(let i=0;i<34;i++){ctx.beginPath();ctx.arc(i*31,235+(i%3)*18+Math.sin(now+i)*2,13,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffffff33';for(let y=110;y<220;y+=45)ctx.fillRect(0,y,width,24);ctx.fillStyle='#ddd';ctx.fillRect(80,370,800,18);ctx.strokeStyle='#f4c36e';ctx.lineWidth=4;ctx.strokeRect(82,330,796,56)}
  else if(stage==='asrylyte'){ctx.fillStyle='#ff4fd844';for(let i=0;i<18;i++){ctx.save();ctx.translate((i*73+now*12*(i%2?1:-1))%width,70+(i%5)*55+Math.sin(now+i)*10);ctx.rotate(now*.25+i);ctx.fillRect(-5,-5,10+(i%4)*4,10+(i%4)*4);ctx.restore()}ctx.strokeStyle='#ff79e8';for(let x=0;x<width;x+=120){ctx.beginPath();ctx.moveTo(x+Math.sin(now)*8,0);ctx.lineTo(x+80,ground);ctx.stroke()}}
  else if(stage==='clonebase'){ctx.fillStyle='#6bd4ff22';for(let x=60;x<width;x+=150){ctx.fillRect(x,80,70,220);ctx.strokeStyle='#6bd4ff';ctx.strokeRect(x,80,70,220);ctx.fillStyle='#09131d';ctx.beginPath();ctx.arc(x+35,160+Math.sin(now+x)*3,17,0,Math.PI*2);ctx.fill();ctx.fillRect(x+22,177,26,64);ctx.fillStyle='#6bd4ff22'}ctx.fillStyle=Math.sin(now*4)>0?'#e23b3b':'#6d1111';ctx.fillRect(width/2-25,125,50,50);ctx.strokeStyle='#8596aa';for(let y=40;y<350;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y+15);ctx.stroke()}}
  else{ctx.fillStyle='#ff6a0033';for(let i=0;i<14;i++){ctx.beginPath();ctx.arc(i*80,350-(i%3)*40+Math.sin(now*2+i)*8,25,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffb000';for(let x=20;x<width;x+=90){const flame=45+Math.sin(now*5+x)*12;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+18,ground-flame);ctx.lineTo(x+36,ground);ctx.fill()}ctx.globalAlpha=.12;for(let y=120;y<400;y+=35){ctx.fillStyle='#ffb04a';ctx.fillRect(Math.sin(now+y)*20,y,width,3)}ctx.globalAlpha=1}
  ctx.fillStyle=s.g;ctx.fillRect(0,ground,width,height-ground);ctx.fillStyle='#ffffff22';ctx.fillRect(0,ground,width,4);ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.font='bold 16px Segoe UI';ctx.fillText(s.n,20,height-18);ctx.globalAlpha=1;
}
