"use strict";

import {SpriteAnimator} from './sprite-animation.js';

export class SpriteDebugViewer{
  constructor(visuals){this.visuals=visuals;this.root=null;this.animator=null;this.frameHandle=0;this.last=0;this.flip=false;this.mobileScale=1}
  mount(){
    if(this.root)return;
    const root=document.createElement('aside');root.id='spriteDebugViewer';root.className='spriteDebugViewer hidden';
    root.innerHTML=`<header><strong>RRVVFO SPRITE VIEWER</strong><button data-debug="close">×</button></header>
      <canvas width="384" height="260"></canvas>
      <div class="spriteDebugControls">
        <label>Animation <select data-debug="animation"></select></label>
        <button data-debug="play">PLAY/PAUSE</button><button data-debug="previous">◀ FRAME</button><button data-debug="next">FRAME ▶</button>
        <label>Speed <input data-debug="speed" type="range" min=".2" max="2" step=".1" value="1"></label>
        <label><input data-debug="flip" type="checkbox"> Flip</label>
        <label><input data-debug="pivot" type="checkbox" checked> Ground pivot</label>
        <label><input data-debug="anchor" type="checkbox"> Projectile anchor</label>
        <label><input data-debug="bounds" type="checkbox"> Visual bounds</label>
        <label><input data-debug="hitbox" type="checkbox"> Combat hitbox</label>
        <label>Background <input data-debug="background" type="color" value="#25283d"></label>
        <label>Mobile scale <input data-debug="mobile" type="range" min=".55" max="1.3" step=".05" value="1"></label>
        <output data-debug="readout"></output>
      </div>`;
    document.body.appendChild(root);this.root=root;this.bind();
  }
  bind(){
    const get=name=>this.root.querySelector(`[data-debug="${name}"]`);
    get('close').onclick=()=>this.hide();
    get('play').onclick=()=>{if(this.animator)this.animator.paused=!this.animator.paused};
    get('previous').onclick=()=>this.animator?.step(-1);get('next').onclick=()=>this.animator?.step(1);
    get('speed').oninput=event=>{if(this.animator)this.animator.playbackRate=+event.target.value};
    get('flip').onchange=event=>{this.flip=event.target.checked};
    get('mobile').oninput=event=>{this.mobileScale=+event.target.value};
    for(const name of ['pivot','anchor','bounds','hitbox'])get(name).onchange=event=>{const key={pivot:'groundPivot',anchor:'projectileAnchor',bounds:'bounds',hitbox:'combatHitbox'}[name];if(this.visuals.renderer)this.visuals.renderer.debug[key]=event.target.checked};
    get('animation').onchange=event=>this.animator?.play(event.target.value,{priority:999,restart:true});
  }
  refresh(){
    if(!this.visuals.atlas||!this.visuals.renderer)return false;
    if(!this.animator)this.animator=new SpriteAnimator(this.visuals.atlas,{appearance:this.visuals.settings.appearance});
    const select=this.root.querySelector('[data-debug="animation"]');
    if(!select.options.length)for(const name of Object.keys(this.visuals.atlas.manifest.animations)){const option=document.createElement('option');option.value=option.textContent=name;select.appendChild(option)}
    return true;
  }
  show(){this.mount();this.root.classList.remove('hidden');if(this.refresh())this.loop(performance.now())}
  hide(){this.root?.classList.add('hidden');cancelAnimationFrame(this.frameHandle);this.frameHandle=0}
  loop(now){
    if(!this.root||this.root.classList.contains('hidden'))return;
    this.refresh();const canvas=this.root.querySelector('canvas'),ctx=canvas.getContext('2d'),background=this.root.querySelector('[data-debug="background"]').value;
    ctx.fillStyle=background;ctx.fillRect(0,0,canvas.width,canvas.height);
    if(this.animator&&this.visuals.renderer){
      this.animator.setAppearance(this.visuals.settings.appearance);this.animator.update(Math.min(50,now-(this.last||now)));this.last=now;
      const dummy={x:168,y:145,w:48,h:86,face:this.flip?-1:1,z:0,spriteScale:this.mobileScale,spriteOpacity:1,hitFlash:0};
      this.visuals.renderer.draw(ctx,dummy,this.animator);
      this.root.querySelector('[data-debug="readout"]').textContent=`${this.animator.name} • ${this.animator.currentFrameName()} • frame ${this.animator.index+1}/${this.animator.frames().length}`;
    }else{ctx.fillStyle='#fff';ctx.fillText('Load Rrvvfo sprites by starting a match.',20,30)}
    this.frameHandle=requestAnimationFrame(timestamp=>this.loop(timestamp));
  }
}
