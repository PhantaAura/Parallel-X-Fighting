export const STAGES = {
  dojo:{n:'Tangai Dojo',a:'#7bc6ff',b:'#e1f6ff',g:'#95663a',boundary:'WALLED'},
  tournament:{n:'Global Tournament',a:'#4c75d6',b:'#f4c36e',g:'#d7c499',boundary:'RING-OUT'},
  'resonance-facility':{n:'Resonance Facility',a:'#101827',b:'#273852',g:'#202532',boundary:'WALLED'},
  'echo-caverns':{n:'Echo Caverns',a:'#14212b',b:'#34505a',g:'#36454a',boundary:'WALLED'},
  'echo-mountain':{n:'Mountain Path',a:'#6b8298',b:'#c1ced8',g:'#69756c',boundary:'OPEN'}
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
  else if(stage==='echo-caverns'){
    ctx.fillStyle='#0b151a';ctx.fillRect(0,0,width,ground);
    ctx.fillStyle='#26393d';for(let x=-40,i=0;x<width+80;x+=86,i++){const h=90+(i%4)*34;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+32,ground-h);ctx.lineTo(x+74,ground);ctx.fill()}
    ctx.strokeStyle='#77d5d966';ctx.lineWidth=3;for(let x=35,i=0;x<width;x+=126,i++){ctx.beginPath();ctx.moveTo(x,ground-18);ctx.lineTo(x+18,ground-74-(i%3)*16);ctx.lineTo(x+42,ground-20);ctx.stroke()}
    ctx.globalAlpha=.18+.05*Math.sin(now*2);ctx.fillStyle='#8ee9ec';for(let x=56;x<width;x+=144)ctx.fillRect(x,ground-62,5,42);ctx.globalAlpha=1;
  }
  else if(stage==='resonance-facility'){ctx.fillStyle='#6bd4ff22';for(let x=60;x<width;x+=150){ctx.fillRect(x,80,70,220);ctx.strokeStyle='#6bd4ff';ctx.strokeRect(x,80,70,220);ctx.fillStyle='#09131d';ctx.beginPath();ctx.arc(x+35,160+Math.sin(now+x)*3,17,0,Math.PI*2);ctx.fill();ctx.fillRect(x+22,177,26,64);ctx.fillStyle='#6bd4ff22'}ctx.fillStyle=Math.sin(now*4)>0?'#e23b3b':'#6d1111';ctx.fillRect(width/2-25,125,50,50);ctx.strokeStyle='#8596aa';for(let y=40;y<350;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y+15);ctx.stroke()}}
  else{
    const sky=ctx.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#90a9bc');sky.addColorStop(1,'#d7e0e4');ctx.fillStyle=sky;ctx.fillRect(0,0,width,ground);
    ctx.fillStyle='#4c5b5b';for(let x=-90,i=0;x<width+100;x+=145,i++){const peak=145+(i%3)*42;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+72,ground-peak);ctx.lineTo(x+155,ground);ctx.fill()}
    ctx.globalAlpha=.22;ctx.fillStyle='#f4fbff';for(let y=70;y<ground-55;y+=70)ctx.fillRect((Math.sin(now*.45+y)*46)-55,y,width+110,3);ctx.globalAlpha=1;
    ctx.fillStyle='#66756e';for(let x=20,i=0;x<width;x+=112,i++){ctx.beginPath();ctx.ellipse(x,ground-12,34+(i%3)*7,13,0,0,Math.PI*2);ctx.fill()}
  }
  ctx.fillStyle=s.g;ctx.fillRect(0,ground,width,height-ground);ctx.fillStyle='#ffffff22';ctx.fillRect(0,ground,width,4);ctx.fillStyle='#fff';ctx.globalAlpha=.8;ctx.font='bold 16px Segoe UI';ctx.fillText(s.n,20,height-18);ctx.globalAlpha=1;
}
