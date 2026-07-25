"use strict";

import {loadSpriteAtlas} from './sprite-atlas.js';
import {ANIMATION_PRIORITY,SpriteAnimator} from './sprite-animation.js';
import {SpriteRenderer} from './sprite-renderer.js';

export const RRVVFO_VISUAL_SAVE_KEY='pxRrvvfoVisualsV1';
export const RRVVFO_MANIFEST_URL=new URL('../assets/fighters/rrvvfo/rrvvfo-animations.json',import.meta.url).href;
const RRVVFO_VISUAL_SCHEMA_VERSION=3;
export const RRVVFO_APPEARANCE_SLOTS=Object.freeze(['player1','player2','trainingPlayer1','trainingDummy']);
export const RRVVFO_APPEARANCES=Object.freeze({
  down:Object.freeze({id:'down',label:'Hood Down',prototype:false}),
  up:Object.freeze({id:'up',label:'Hood Up — Prototype',prototype:true})
});

function defaultAppearances(){return Object.fromEntries(RRVVFO_APPEARANCE_SLOTS.map(slot=>[slot,'down']))}
export function normalizeRrvvfoAppearance(value,{allowPrototype=true}={}){return value==='up'&&allowPrototype?'up':'down'}
export function isDeveloperSpriteBuild(locationLike=globalThis.location){
  const hostname=locationLike?.hostname||'',search=locationLike?.search||'';
  return hostname==='localhost'||hostname==='127.0.0.1'||new URLSearchParams(search).get('developer')==='1';
}
export function availableRrvvfoAppearances({developerMode=false,exposePrototype=false}={}){
  return developerMode&&exposePrototype?[RRVVFO_APPEARANCES.down,RRVVFO_APPEARANCES.up]:[RRVVFO_APPEARANCES.down];
}

export function defaultRrvvfoVisualSettings(){
  return{schemaVersion:RRVVFO_VISUAL_SCHEMA_VERSION,enabled:false,quality:'full',developerViewer:false,exposePrototypeAppearances:false,appearances:defaultAppearances()};
}

export function loadRrvvfoVisualSettings(storage=globalThis.localStorage){
  const defaults=defaultRrvvfoVisualSettings();
  try{
    const saved=JSON.parse(storage?.getItem(RRVVFO_VISUAL_SAVE_KEY)||'{}');
    const enabled=typeof saved.enabled==='boolean'?saved.enabled:defaults.enabled;
    const legacyAppearance=normalizeRrvvfoAppearance(saved.appearance);
    const appearances={...defaults.appearances};
    for(const slot of RRVVFO_APPEARANCE_SLOTS)appearances[slot]=normalizeRrvvfoAppearance(saved.appearances?.[slot]??legacyAppearance);
    return{...defaults,...saved,schemaVersion:RRVVFO_VISUAL_SCHEMA_VERSION,enabled,quality:saved.quality==='reduced'?'reduced':'full',developerViewer:!!saved.developerViewer,exposePrototypeAppearances:!!saved.exposePrototypeAppearances,appearances};
  }catch{return defaults}
}

export function saveRrvvfoVisualSettings(settings,storage=globalThis.localStorage){
  try{storage?.setItem(RRVVFO_VISUAL_SAVE_KEY,JSON.stringify(settings));return true}catch{return false}
}

export function resolveRrvvfoAnimation(fighter,world={}){
  if(fighter.hp<=0)return{name:'defeated',priority:ANIMATION_PRIORITY.defeated};
  if(fighter.victory)return{name:'victory',priority:ANIMATION_PRIORITY.cinematic};
  const cinematic=world.cinematic;
  if(cinematic?.active&&cinematic.attacker===fighter){
    const phase=cinematic.phase||cinematic.stage||'attack';
    const name=phase==='startup'?'ultimateStartup':phase==='charge'?'ultimateCharge':phase==='recovery'?'ultimateRecovery':'ultimateAttack';
    return{name,priority:ANIMATION_PRIORITY.cinematic};
  }
  if(world.clash?.active)return{name:world.clash.type==='ultimate'?'ultimateAttack':'heavyActive',priority:ANIMATION_PRIORITY.clash};
  if(fighter.knockdown>0)return{name:fighter.grounded?'groundDown':'knockdown',priority:ANIMATION_PRIORITY.knockdown};
  if(fighter.getup>0)return{name:'getUp',priority:ANIMATION_PRIORITY.knockdown};
  if(fighter.guardBreakStun>0)return{name:'guardBreak',priority:ANIMATION_PRIORITY.guardBreak};
  if(fighter.visualPerfectTimer>0)return{name:'perfectBlock',priority:ANIMATION_PRIORITY.perfectBlock};
  if(fighter.visualBlockTimer>0)return{name:'blockHit',priority:ANIMATION_PRIORITY.blockHit};
  if(fighter.stun>0)return{name:fighter.grounded?(fighter.visualHitKind==='light'?'hurtLight':'hurtHeavy'):'airHurt',priority:ANIMATION_PRIORITY.hurt};
  if(fighter.visualActionTimer>0&&fighter.visualAction){
    let name=fighter.visualAction;
    if(name==='objectSwapDisappear'&&fighter.visualActionTimer<12)name='objectSwapReappear';
    if(name==='heavyActive'&&fighter.visualActionTimer<8)name='heavyRecovery';
    if(name==='launcherActive'&&fighter.visualActionTimer<8)name='launcherRecovery';
    return{name,priority:name.startsWith('ultimate')?ANIMATION_PRIORITY.cinematic:ANIMATION_PRIORITY.attack};
  }
  if(fighter.lens>0)return{name:fighter.lens<30?'lensEnd':'lensActive',priority:ANIMATION_PRIORITY.attack};
  if(fighter.block)return{name:fighter.wasBlocking?'blockHold':'blockStart',priority:ANIMATION_PRIORITY.movement};
  if(fighter.dashRecovery>0||fighter.visualDashTimer>0)return{name:fighter.id==='rrvvfo'?'objectSwapRecovery':'dash',priority:ANIMATION_PRIORITY.dash};
  if(!fighter.grounded)return{name:fighter.vy<0?'jumpRise':'fall',priority:ANIMATION_PRIORITY.jump};
  if(Math.abs(fighter.vx)>1)return{name:'run',priority:ANIMATION_PRIORITY.movement};
  if(fighter.attackCd>0)return{name:'fightingStance',priority:ANIMATION_PRIORITY.stance};
  return{name:'idle',priority:ANIMATION_PRIORITY.idle};
}

export class FighterVisuals{
  constructor({settings=loadRrvvfoVisualSettings(),manifestUrl=RRVVFO_MANIFEST_URL,onStatus=()=>{}}={}){
    this.settings={...defaultRrvvfoVisualSettings(),...settings};this.manifestUrl=manifestUrl;this.onStatus=onStatus;
    this.status='idle';this.error=null;this.atlas=null;this.renderer=null;this.animators=new WeakMap();this.afterimages=new WeakMap();
  }
  configure(next,{persist=true}={}){
    Object.assign(this.settings,next);
    this.settings.appearances={...defaultAppearances(),...(this.settings.appearances||{})};
    for(const slot of RRVVFO_APPEARANCE_SLOTS)this.settings.appearances[slot]=normalizeRrvvfoAppearance(this.settings.appearances[slot]);
    this.settings.quality=this.settings.quality==='reduced'?'reduced':'full';
    if(this.renderer)this.renderer.setQuality(this.settings.quality);
    if(persist)saveRrvvfoVisualSettings(this.settings);
  }
  async preloadPreview(){
    if(this.atlas)return{ready:true,cached:true};
    try{
      this.atlas=await loadSpriteAtlas(this.manifestUrl);
      this.renderer=new SpriteRenderer(this.atlas,{quality:this.settings.quality});
      return{ready:true,cached:false};
    }catch(error){this.error=error;return{ready:false,reason:'load-failed',error}}
  }
  drawPreview(canvas,appearance='down'){
    if(!canvas||!this.atlas||!this.renderer)return false;
    const ctx=canvas.getContext('2d'),resolved=normalizeRrvvfoAppearance(appearance),frameName=this.atlas.animationFrames('fightingStance',resolved)[0]||this.atlas.animationFrames('idle',resolved)[0],frame=this.atlas.frame(frameName);
    if(!ctx||!frame)return false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,'#252b43');gradient.addColorStop(1,'#090c15');ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
    this.renderer.drawFrame(ctx,frame,canvas.width/2,canvas.height-7,1,.48,1);
    return true;
  }
  async preloadForMatch(fighterIds=[]){
    if(!this.settings.enabled||!fighterIds.includes('rrvvfo'))return{ready:false,reason:'disabled-or-unused'};
    if(this.atlas)return{ready:true,cached:true};
    this.status='loading';this.error=null;this.onStatus({status:this.status});
    try{
      this.atlas=await loadSpriteAtlas(this.manifestUrl);
      this.renderer=new SpriteRenderer(this.atlas,{quality:this.settings.quality});
      this.status='ready';this.onStatus({status:this.status});return{ready:true,cached:false};
    }catch(error){
      this.status='fallback';this.error=error;this.onStatus({status:this.status,error});
      console.warn('Experimental Rrvvfo sprites unavailable; using legacy visuals.',error);
      return{ready:false,reason:'load-failed',error};
    }
  }
  animatorFor(fighter){
    let animator=this.animators.get(fighter);
    if(!animator&&this.atlas){animator=new SpriteAnimator(this.atlas,{appearance:fighter.appearance});this.animators.set(fighter,animator)}
    return animator;
  }
  update(deltaMs,world){
    if(!this.settings.enabled||!this.renderer)return;
    for(const fighter of world.fighters||[]){
      if(fighter.id!=='rrvvfo')continue;
      const animator=this.animatorFor(fighter),state=resolveRrvvfoAnimation(fighter,world);
      animator.setAppearance(fighter.appearance);
      fighter.spriteVisualFallback=!this.atlas.animation(state.name);
      if(!fighter.spriteVisualFallback)animator.play(state.name,{priority:state.priority,appearance:fighter.appearance});
      animator.update(deltaMs);
      if(['lensDodgeLeft','lensDodgeRight','objectSwapDisappear','dash'].includes(state.name)){
        const history=this.afterimages.get(fighter)||[];
        history.push({frame:animator.currentFrame(),x:fighter.x+fighter.w/2,y:fighter.y+fighter.h,face:fighter.face,opacity:.28});
        this.afterimages.set(fighter,history.slice(-3));
      }else this.afterimages.set(fighter,(this.afterimages.get(fighter)||[]).map(item=>({...item,opacity:item.opacity*.75})).filter(item=>item.opacity>.04));
    }
  }
  draw(ctx,fighter){
    if(!this.settings.enabled||fighter.id!=='rrvvfo'||!this.renderer||fighter.spriteVisualFallback)return false;
    const animator=this.animatorFor(fighter);if(!animator)return false;
    const state=resolveRrvvfoAnimation(fighter,fighter.world);
    animator.setAppearance(fighter.appearance);
    if(this.atlas.animation(state.name))animator.play(state.name,{priority:state.priority,appearance:fighter.appearance});
    if(!animator.currentFrame())return false;
    try{
      const centerX=fighter.x+fighter.w/2,centerY=fighter.y+fighter.h/2;
      const reduced=this.settings.quality==='reduced';
      if(fighter.lens>0)this.renderer.drawEffect(ctx,'lens-aura',{x:centerX,y:centerY,scale:reduced ? .5 : .7,opacity:reduced ? .4 : .58,composite:'screen'});
      if(fighter.visualAction?.startsWith('ultimate'))this.renderer.drawEffect(ctx,'ultimate-aura',{x:centerX,y:fighter.y+fighter.h-52,scale:reduced ? .42 : .58,opacity:reduced ? .42 : .62,composite:'screen'});
      const rendered=this.renderer.draw(ctx,fighter,animator,{opacity:fighter.inv&&Math.floor(fighter.inv/2)%2===0?.52:1,afterimages:this.afterimages.get(fighter)||[]});
      if(!rendered)return false;
      if(fighter.lens>0)this.renderer.drawEffect(ctx,'lens-eye',{x:centerX,y:fighter.y-8,scale:.28,opacity:.9,composite:'screen'});
      if(fighter.visualAction?.startsWith('objectSwap'))this.renderer.drawEffect(ctx,'object-swap-flash',{x:centerX,y:centerY,scale:.45,opacity:.7,composite:'screen'});
      return true;
    }catch(error){this.error=error;return false}
  }
  drawEffect(ctx,effect){
    if(!this.settings.enabled||!this.renderer||effect.t!=='agonyClone'||effect.volleyOwner?.id!=='rrvvfo')return false;
    const fade=Math.min(1,effect.l/12);return this.renderer.drawEffect(ctx,'shots-clone',{x:effect.x,y:effect.y+35,face:effect.face||1,scale:.48,opacity:.78*fade,composite:'screen'});
  }
  drawProjectile(ctx,projectile){
    if(!this.settings.enabled||!this.renderer||projectile.owner?.id!=='rrvvfo')return false;
    const effect=projectile.volleyId?'shots-projectile':projectile.type==='beam'?'fire-projectile':null;if(!effect)return false;
    return this.renderer.drawEffect(ctx,effect,{x:projectile.x,y:projectile.y,face:projectile.vx>=0?1:-1,scale:projectile.volleyId?.22:.32,rotation:Math.atan2(projectile.vy,Math.abs(projectile.vx)),composite:'screen'});
  }
  resetFighter(fighter){this.animators.delete(fighter);this.afterimages.delete(fighter)}
  resetAll(){this.animators=new WeakMap();this.afterimages=new WeakMap()}
}
