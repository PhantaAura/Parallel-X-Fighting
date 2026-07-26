"use strict";

import {loadSpriteAtlas} from './sprite-atlas.js';
import {ANIMATION_PRIORITY,SpriteAnimator} from './sprite-animation.js';
import {SpriteRenderer} from './sprite-renderer.js';

export const RRVVFO_VISUAL_SAVE_KEY='pxRrvvfoVisualsV1';
export const RRVVFO_MANIFEST_URL=new URL('../assets/fighters/rrvvfo/rrvvfo-animations.json',import.meta.url).href;
export const REVVFO_MANIFEST_URL=new URL('../assets/fighters/revvfo/revvfo-animations.json',import.meta.url).href;
export const SPRITE_FIGHTER_IDS=Object.freeze(['rrvvfo','revvfo']);
const RRVVFO_VISUAL_SCHEMA_VERSION=4;
export const RRVVFO_APPEARANCE_SLOTS=Object.freeze(['player1','player2','trainingPlayer1','trainingDummy']);
export const RRVVFO_APPEARANCES=Object.freeze({
  down:Object.freeze({id:'down',label:'Hood Down',prototype:false}),
  up:Object.freeze({id:'up',label:'Hood Up',prototype:false})
});

function defaultAppearances(){return Object.fromEntries(RRVVFO_APPEARANCE_SLOTS.map(slot=>[slot,'down']))}
export function normalizeRrvvfoAppearance(value){return value==='up'?'up':'down'}
export function isDeveloperSpriteBuild(locationLike=globalThis.location){
  const hostname=locationLike?.hostname||'',search=locationLike?.search||'';
  return hostname==='localhost'||hostname==='127.0.0.1'||new URLSearchParams(search).get('developer')==='1';
}
export function availableRrvvfoAppearances(){return[RRVVFO_APPEARANCES.down,RRVVFO_APPEARANCES.up]}

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
    return{...defaults,...saved,schemaVersion:RRVVFO_VISUAL_SCHEMA_VERSION,enabled,quality:saved.quality==='reduced'?'reduced':'full',developerViewer:!!saved.developerViewer,exposePrototypeAppearances:false,appearances};
  }catch{return defaults}
}

export function saveRrvvfoVisualSettings(settings,storage=globalThis.localStorage){
  try{storage?.setItem(RRVVFO_VISUAL_SAVE_KEY,JSON.stringify(settings));return true}catch{return false}
}
export function shouldShowRrvvfoLoadFailure(result,enabled=true){return !!enabled&&['load-failed','partial-load-failed'].includes(result?.reason)}

export function resolveFighterAnimation(fighter,world={}){
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
export const resolveRrvvfoAnimation=resolveFighterAnimation;

export class FighterVisuals{
  constructor({settings=loadRrvvfoVisualSettings(),manifestUrl=null,manifestUrls={},onStatus=()=>{}}={}){
    this.settings={...defaultRrvvfoVisualSettings(),...settings};
    this.manifestUrls={rrvvfo:manifestUrl||RRVVFO_MANIFEST_URL,revvfo:REVVFO_MANIFEST_URL,...manifestUrls};
    this.onStatus=onStatus;this.status='idle';this.error=null;
    this.atlases=new Map();this.renderers=new Map();this.animators=new WeakMap();this.afterimages=new WeakMap();
    // Compatibility aliases used by the Rrvvfo debug viewer.
    this.atlas=null;this.renderer=null;
  }
  configure(next,{persist=true}={}){
    Object.assign(this.settings,next);
    this.settings.appearances={...defaultAppearances(),...(this.settings.appearances||{})};
    for(const slot of RRVVFO_APPEARANCE_SLOTS)this.settings.appearances[slot]=normalizeRrvvfoAppearance(this.settings.appearances[slot]);
    this.settings.quality=this.settings.quality==='reduced'?'reduced':'full';
    for(const renderer of this.renderers.values())renderer.setQuality(this.settings.quality);
    if(persist)saveRrvvfoVisualSettings(this.settings);
  }
  supports(id){return SPRITE_FIGHTER_IDS.includes(id)}
  atlasFor(id){return this.atlases.get(id)||null}
  rendererFor(id){return this.renderers.get(id)||null}
  async loadFighter(id){
    if(!this.supports(id))return null;
    if(this.atlases.has(id))return this.atlases.get(id);
    const url=this.manifestUrls[id];
    if(!url)throw new Error(`No sprite manifest configured for ${id}`);
    const atlas=await loadSpriteAtlas(url);
    const renderer=new SpriteRenderer(atlas,{quality:this.settings.quality});
    this.atlases.set(id,atlas);this.renderers.set(id,renderer);
    if(id==='rrvvfo'){this.atlas=atlas;this.renderer=renderer}
    return atlas;
  }
  async preloadPreview(){
    try{const cached=this.atlases.has('rrvvfo');await this.loadFighter('rrvvfo');return{ready:true,cached}}
    catch(error){this.error=error;return{ready:false,reason:'load-failed',error}}
  }
  drawPreview(canvas,appearance='down'){
    const atlas=this.atlasFor('rrvvfo'),renderer=this.rendererFor('rrvvfo');
    if(!canvas||!atlas||!renderer)return false;
    const ctx=canvas.getContext('2d'),resolved=normalizeRrvvfoAppearance(appearance),frameName=atlas.animationFrames('fightingStance',resolved)[0]||atlas.animationFrames('idle',resolved)[0],frame=atlas.frame(frameName);
    if(!ctx||!frame)return false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const gradient=ctx.createLinearGradient(0,0,0,canvas.height);gradient.addColorStop(0,'#252b43');gradient.addColorStop(1,'#090c15');ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
    renderer.drawFrame(ctx,frame,canvas.width/2,canvas.height-7,1,.48,1);return true;
  }
  async preloadForMatch(fighterIds=[]){
    const requested=[...new Set(fighterIds.filter(id=>this.supports(id)))];
    if(!this.settings.enabled||!requested.length)return{ready:false,reason:'disabled-or-unused'};
    this.status='loading';this.error=null;this.onStatus({status:this.status,fighters:requested});
    const settled=await Promise.allSettled(requested.map(id=>this.loadFighter(id)));
    const failed=settled.map((result,index)=>result.status==='rejected'?{id:requested[index],error:result.reason}:null).filter(Boolean);
    if(failed.length===requested.length){
      this.status='fallback';this.error=failed[0]?.error||new Error('Character sprite atlases failed to load');this.onStatus({status:this.status,error:this.error,failed});
      console.warn('Character sprites unavailable; using legacy visuals.',failed);return{ready:false,reason:'load-failed',error:this.error,failed};
    }
    this.status=failed.length?'partial':'ready';this.onStatus({status:this.status,failed});
    return{ready:true,cached:false,reason:failed.length?'partial-load-failed':undefined,failed};
  }
  animatorFor(fighter){
    let animator=this.animators.get(fighter);const atlas=this.atlasFor(fighter.id);
    if(!animator&&atlas){animator=new SpriteAnimator(atlas,{appearance:fighter.id==='rrvvfo'?fighter.appearance:'down'});this.animators.set(fighter,animator)}
    return animator;
  }
  update(deltaMs,world){
    if(!this.settings.enabled)return;
    for(const fighter of world.fighters||[]){
      const atlas=this.atlasFor(fighter.id),renderer=this.rendererFor(fighter.id);if(!atlas||!renderer)continue;
      const animator=this.animatorFor(fighter),state=resolveFighterAnimation(fighter,world),appearance=fighter.id==='rrvvfo'?fighter.appearance:'down';
      animator.setAppearance(appearance);fighter.spriteVisualFallback=!atlas.animation(state.name);
      if(!fighter.spriteVisualFallback)animator.play(state.name,{priority:state.priority,appearance});
      animator.update(deltaMs);
      if(['lensDodgeLeft','lensDodgeRight','objectSwapDisappear','dash','teleportRush'].includes(state.name)){
        const history=this.afterimages.get(fighter)||[];history.push({frame:animator.currentFrame(),x:fighter.x+fighter.w/2,y:fighter.y+fighter.h,face:fighter.face,opacity:.28});this.afterimages.set(fighter,history.slice(-3));
      }else this.afterimages.set(fighter,(this.afterimages.get(fighter)||[]).map(item=>({...item,opacity:item.opacity*.75})).filter(item=>item.opacity>.04));
    }
  }
  draw(ctx,fighter){
    if(!this.settings.enabled||!this.supports(fighter.id)||fighter.spriteVisualFallback)return false;
    const atlas=this.atlasFor(fighter.id),renderer=this.rendererFor(fighter.id),animator=this.animatorFor(fighter);if(!atlas||!renderer||!animator)return false;
    const state=resolveFighterAnimation(fighter,fighter.world),appearance=fighter.id==='rrvvfo'?fighter.appearance:'down';
    animator.setAppearance(appearance);if(atlas.animation(state.name))animator.play(state.name,{priority:state.priority,appearance});if(!animator.currentFrame())return false;
    try{
      const centerX=fighter.x+fighter.w/2,centerY=fighter.y+fighter.h/2,reduced=this.settings.quality==='reduced';
      if(fighter.id==='rrvvfo'&&fighter.lens>0)renderer.drawEffect(ctx,'lens-aura',{x:centerX,y:centerY,scale:reduced?.5:.7,opacity:reduced?.4:.58,composite:'screen'});
      if(fighter.visualAction?.startsWith('ultimate'))renderer.drawEffect(ctx,'ultimate-aura',{x:centerX,y:fighter.y+fighter.h-52,scale:reduced?.42:.58,opacity:reduced?.42:.62,composite:'screen'});
      const rendered=renderer.draw(ctx,fighter,animator,{opacity:fighter.inv&&Math.floor(fighter.inv/2)%2===0?.52:1,afterimages:this.afterimages.get(fighter)||[]});if(!rendered)return false;
      if(fighter.id==='rrvvfo'&&fighter.lens>0)renderer.drawEffect(ctx,'lens-eye',{x:centerX,y:fighter.y-8,scale:.28,opacity:.9,composite:'screen'});
      if(fighter.id==='rrvvfo'&&fighter.visualAction?.startsWith('objectSwap'))renderer.drawEffect(ctx,'object-swap-flash',{x:centerX,y:centerY,scale:.45,opacity:.7,composite:'screen'});
      return true;
    }catch(error){this.error=error;return false}
  }
  drawEffect(ctx,effect){
    if(!this.settings.enabled||effect.t!=='agonyClone'||effect.volleyOwner?.id!=='rrvvfo')return false;
    const renderer=this.rendererFor('rrvvfo');if(!renderer)return false;
    const fade=Math.min(1,effect.l/12);return renderer.drawEffect(ctx,'shots-clone',{x:effect.x,y:effect.y+35,face:effect.face||1,scale:.48,opacity:.78*fade,composite:'screen'});
  }
  drawProjectile(ctx,projectile){
    const id=projectile.owner?.id;if(!this.settings.enabled||!this.supports(id))return false;
    const renderer=this.rendererFor(id);if(!renderer)return false;
    const effect=id==='rrvvfo'&&projectile.volleyId?'shots-projectile':projectile.type==='beam'?'energy-projectile':null;if(!effect)return false;
    return renderer.drawEffect(ctx,effect,{x:projectile.x,y:projectile.y,face:projectile.vx>=0?1:-1,scale:projectile.volleyId?.22:.32,rotation:Math.atan2(projectile.vy,Math.abs(projectile.vx)),composite:'screen'});
  }
  resetFighter(fighter){this.animators.delete(fighter);this.afterimages.delete(fighter)}
  resetAll(){this.animators=new WeakMap();this.afterimages=new WeakMap()}
}
