function clamp(v,min,max){return Math.max(min,Math.min(max,v))}

export class StoryMap{
  constructor({title='AREA MAP',bounds={minX:-1600,maxX:1600,minZ:-1100,maxZ:1100},getPlayer=()=>null,getObjective=()=>null,getPoints=()=>[]}={}){
    this.title=title;this.bounds=bounds;this.getPlayer=getPlayer;this.getObjective=getObjective;this.getPoints=getPoints;this.lastUpdate=0;
    this.button=document.createElement('button');this.button.type='button';this.button.className='storyExplorationMapButton';this.button.textContent='MAP';this.button.setAttribute('aria-label','Open area map');
    this.mini=document.createElement('aside');this.mini.className='storyMiniMap';this.mini.innerHTML='<canvas width="320" height="320" aria-label="Mini map"></canvas><strong>OBJECTIVE</strong><span data-map-objective>Explore the area</span><div class="storyMapLegend" aria-label="Map legend"><span><i data-map-symbol="player">▲</i>YOU</span><span><i data-map-symbol="objective">◆</i>GOAL</span><span><i data-map-symbol="landmark">●</i>PLACE</span><span><i data-map-symbol="optional">■</i>OPTIONAL</span></div>';
    this.overlay=document.createElement('section');this.overlay.className='storyMapOverlay';this.overlay.hidden=true;this.overlay.innerHTML=`<article role="dialog" aria-modal="true" aria-label="${title}"><header><h2>${title}</h2><button type="button" data-map-close>CLOSE</button></header><canvas width="960" height="600"></canvas></article>`;
    this.compass=document.createElement('div');this.compass.className='storyObjectiveCompass';this.compass.innerHTML='<i data-objective-arrow>↑</i><span data-objective-copy>CURRENT OBJECTIVE</span>';
    document.body.append(this.button,this.mini,this.overlay,this.compass);
    this.button.addEventListener('click',()=>this.open());
    this.mini.addEventListener('click',()=>this.open());
    this.overlay.querySelector('[data-map-close]').addEventListener('click',()=>this.close());
    this.keyHandler=e=>{if(!this.overlay.hidden&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.close()}};
    document.addEventListener('keydown',this.keyHandler,true);
    this.draw(true);
  }
  worldToMap(point,canvas){
    const b=this.bounds,pad=28;
    const width=Math.max(1,b.maxX-b.minX),height=Math.max(1,b.maxZ-b.minZ);return{x:clamp(pad+(Number(point.x||0)-b.minX)/width*(canvas.width-pad*2),pad,canvas.width-pad),y:clamp(pad+(Number(point.z||0)-b.minZ)/height*(canvas.height-pad*2),pad,canvas.height-pad)};
  }
  draw(force=false){
    const now=performance.now();if(!force&&now-this.lastUpdate<100)return;this.lastUpdate=now;
    this.drawCanvas(this.mini.querySelector('canvas'),false);if(!this.overlay.hidden)this.drawCanvas(this.overlay.querySelector('canvas'),true);
    const player=this.getPlayer(),objective=this.getObjective();
    const label=objective?.label||objective?.name||'Explore the marked area';
    this.mini.querySelector('[data-map-objective]').textContent=label;
    this.compass.querySelector('[data-objective-copy]').textContent=label;
    if(player&&objective){const angle=Math.atan2(objective.x-player.x,-(objective.z-player.z))*180/Math.PI;this.compass.querySelector('[data-objective-arrow]').style.transform=`rotate(${angle}deg)`}
  }
  drawCanvas(canvas,large){
    const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#dff1ff';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#080808';ctx.lineWidth=large?7:5;ctx.strokeRect(15,15,w-30,h-30);
    ctx.strokeStyle='rgba(8,8,8,.18)';ctx.lineWidth=2;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(15+(w-30)*i/5,15);ctx.lineTo(15+(w-30)*i/5,h-15);ctx.stroke();ctx.beginPath();ctx.moveTo(15,15+(h-30)*i/5);ctx.lineTo(w-15,15+(h-30)*i/5);ctx.stroke()}
    const points=(this.getPoints()||[]).filter(point=>point&&!point.hidden);for(const point of points){const p=this.worldToMap(point,canvas),size=large?10:6,kind=point.kind||'landmark';ctx.save();ctx.translate(p.x,p.y);ctx.beginPath();ctx.fillStyle=point.color||(kind==='optional'?'#8a63ce':kind==='route'?'#3f9f78':'#61758a');ctx.strokeStyle='#080808';ctx.lineWidth=large?3:2;if(kind==='optional'){ctx.rect(-size,-size,size*2,size*2)}else if(kind==='route'){ctx.moveTo(0,-size-2);ctx.lineTo(size+2,0);ctx.lineTo(0,size+2);ctx.lineTo(-size-2,0);ctx.closePath()}else ctx.arc(0,0,size,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();if(large&&point.label){ctx.fillStyle='#080808';ctx.font='bold 16px Arial';ctx.fillText(point.label,p.x+14,p.y+5)}}
    const objective=this.getObjective();if(objective){const p=this.worldToMap(objective,canvas),size=large?17:10;ctx.save();ctx.translate(p.x,p.y);ctx.beginPath();ctx.fillStyle='#ffd557';ctx.strokeStyle='#080808';ctx.lineWidth=3;ctx.moveTo(0,-size);ctx.lineTo(size,0);ctx.lineTo(0,size);ctx.lineTo(-size,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();if(large){ctx.fillStyle='#080808';ctx.font='900 18px Arial';ctx.fillText(objective.label||objective.name||'OBJECTIVE',p.x+22,p.y+6)}}
    const player=this.getPlayer();if(player){const p=this.worldToMap(player,canvas);ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#d9232f';ctx.strokeStyle='#080808';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-(large?17:11));ctx.lineTo(large?12:8,large?12:8);ctx.lineTo(-(large?12:8),large?12:8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  }
  setVisible(visible=true){
    this.button.hidden=!visible;this.mini.hidden=!visible;this.compass.hidden=!visible;
    if(!visible)this.overlay.hidden=true;
  }
  open(){this.overlay.hidden=false;this.draw(true);this.overlay.querySelector('[data-map-close]').focus()}
  close(){this.overlay.hidden=true;this.button.focus()}
  destroy(){document.removeEventListener('keydown',this.keyHandler,true);this.button.remove();this.mini.remove();this.overlay.remove();this.compass.remove()}
}
