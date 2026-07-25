"use strict";

export class SpriteRenderer{
  constructor(atlas,{quality='full'}={}){this.atlas=atlas;this.quality=quality;this.debug={bounds:false,groundPivot:false,projectileAnchor:false,combatHitbox:false}}
  setQuality(quality){this.quality=quality==='reduced'?'reduced':'full'}
  drawShadow(ctx,fighter,scale){
    ctx.save();ctx.globalAlpha=.22*(fighter.spriteOpacity??1);ctx.fillStyle='#000';ctx.beginPath();
    const depthScale=1+(fighter.z||0)*(this.atlas.manifest.defaults?.depthScale||0);
    ctx.ellipse(fighter.x+fighter.w/2,fighter.y+fighter.h+3,24*scale*depthScale,7*scale*depthScale,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  draw(ctx,fighter,animator,{opacity=1,afterimages=[]}={}){
    const frame=animator.currentFrame();if(!frame||!this.atlas.ready)return false;
    const frameName=animator.currentFrameName(),defaults=this.atlas.manifest.defaults||{},scale=(defaults.scale||1)*(fighter.spriteScale||1)*(1+(fighter.z||0)*(defaults.depthScale||0));
    this.drawShadow(ctx,fighter,scale);
    if(this.quality==='full')for(const image of afterimages.slice(-(defaults.maxAfterimages||3)))this.drawFrame(ctx,image.frame,image.x,image.y,image.face,scale,image.opacity);
    this.drawFrame(ctx,frame,fighter.x+fighter.w/2,fighter.y+fighter.h,fighter.face,scale,opacity*(fighter.spriteOpacity??1),fighter);
    if(this.debug.bounds||this.debug.groundPivot||this.debug.projectileAnchor||this.debug.combatHitbox)this.drawDebug(ctx,fighter,frame,scale,frameName);
    return true;
  }
  drawFrame(ctx,frame,groundX,groundY,face,scale,opacity=1,fighter=null){
    const [sx,sy,sw,sh]=frame.source,[pivotX,pivotY]=frame.groundPivot;
    const dx=-pivotX*scale+(frame.visualOffsetX||0),dy=-pivotY*scale+(frame.visualOffsetY||0);
    ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,opacity));ctx.imageSmoothingEnabled=this.atlas.manifest.defaults?.pixelSmoothing!==false;
    ctx.translate(groundX,groundY);if(face<0)ctx.scale(-1,1);
    if(fighter?.hitFlash>0){ctx.globalCompositeOperation='screen';ctx.filter='brightness(1.8) saturate(.45)'}
    ctx.drawImage(this.atlas.image,sx,sy,sw,sh,dx,dy,sw*scale,sh*scale);
    ctx.restore();
  }
  drawEffect(ctx,name,{x,y,face=1,scale=1,opacity=1,rotation=0,composite='source-over'}={}){
    const image=this.atlas.effect(name);if(!image)return false;
    ctx.save();ctx.globalAlpha=opacity;ctx.globalCompositeOperation=composite;ctx.translate(x,y);ctx.rotate(rotation);if(face<0)ctx.scale(-1,1);
    ctx.drawImage(image,-image.width*scale/2,-image.height*scale/2,image.width*scale,image.height*scale);ctx.restore();return true;
  }
  drawDebug(ctx,fighter,frame,scale,frameName){
    const groundX=fighter.x+fighter.w/2,groundY=fighter.y+fighter.h,[pivotX,pivotY]=frame.groundPivot;
    ctx.save();ctx.lineWidth=1;
    if(this.debug.bounds){ctx.strokeStyle='#38ff8d';ctx.strokeRect(groundX-pivotX*scale,groundY-pivotY*scale,frame.source[2]*scale,frame.source[3]*scale)}
    if(this.debug.groundPivot){ctx.strokeStyle='#ffea5a';ctx.beginPath();ctx.moveTo(groundX-7,groundY);ctx.lineTo(groundX+7,groundY);ctx.moveTo(groundX,groundY-7);ctx.lineTo(groundX,groundY+7);ctx.stroke()}
    if(this.debug.projectileAnchor&&frame.projectileOrigin){const [ax,ay]=frame.projectileOrigin,flip=fighter.face<0?-1:1,x=groundX+(ax-pivotX)*scale*flip,y=groundY+(ay-pivotY)*scale;ctx.fillStyle='#4ddcff';ctx.fillRect(x-3,y-3,6,6)}
    if(this.debug.combatHitbox){ctx.strokeStyle='#ff3e66';ctx.strokeRect(fighter.x,fighter.y,fighter.w,fighter.h)}
    ctx.fillStyle='#fff';ctx.font='10px monospace';ctx.fillText(frameName||'',groundX-40,groundY+16);ctx.restore();
  }
}
