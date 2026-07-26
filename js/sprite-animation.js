"use strict";

export const ANIMATION_PRIORITY=Object.freeze({
  idle:10,
  stance:20,
  movement:30,
  jump:40,
  dash:50,
  attack:60,
  blockHit:70,
  perfectBlock:75,
  guardBreak:80,
  hurt:85,
  knockdown:90,
  clash:95,
  cinematic:100,
  defeated:110
});

export class SpriteAnimator{
  constructor(atlas,{appearance='down',onEvent=()=>{},onComplete=()=>{}}={}){
    this.atlas=atlas;this.appearance=appearance;this.onEvent=onEvent;this.onComplete=onComplete;
    this.name='idle';this.priority=ANIMATION_PRIORITY.idle;this.index=0;this.elapsed=0;this.complete=false;this.playbackRate=1;this.paused=false;this.eventFrames=new Set();
  }
  setAppearance(appearance){this.appearance=appearance==='up'?'up':'down'}
  canPlay(name,priority){
    const next=this.atlas.animation(name),current=this.atlas.animation(this.name);
    if(!next)return false;
    if(name===this.name)return true;
    if(!current||this.complete)return true;
    if(current.loop||current.cancelable!==false)return priority>=this.priority||current.loop!==false;
    return priority>this.priority;
  }
  play(name,{priority=ANIMATION_PRIORITY.idle,restart=false,appearance=this.appearance}={}){
    if(!this.atlas.animation(name))return false;
    this.setAppearance(appearance);
    if(name===this.name&&!restart){this.priority=priority;return true}
    if(!this.canPlay(name,priority))return false;
    this.name=name;this.priority=priority;this.index=0;this.elapsed=0;this.complete=false;this.eventFrames.clear();
    this.emitFrameEvents();
    return true;
  }
  frames(){return this.atlas.animationFrames(this.name,this.appearance)}
  currentFrameName(){const frames=this.frames();return frames[Math.min(this.index,Math.max(0,frames.length-1))]||null}
  currentFrame(){const name=this.currentFrameName();return name?this.atlas.frame(name):null}
  emitFrameEvents(){
    const definition=this.atlas.animation(this.name);
    for(const event of definition?.events||[]){
      const key=`${this.name}:${this.index}:${event.type}`;
      if(event.frame===this.index&&!this.eventFrames.has(key)){this.eventFrames.add(key);this.onEvent({...event,animation:this.name})}
    }
  }
  update(deltaMs){
    if(this.paused||this.complete||deltaMs<=0)return;
    const definition=this.atlas.animation(this.name);if(!definition)return;
    const durations=definition.frameDurations;
    this.elapsed+=deltaMs*this.playbackRate;
    let duration=durations?.[this.index]||definition.frameDuration||100;
    while(this.elapsed>=duration&&!this.complete){
      this.elapsed-=duration;this.index++;
      if(this.index>=this.frames().length){
        if(definition.loop){this.index=0;this.eventFrames.clear()}
        else{this.index=Math.max(0,this.frames().length-1);this.complete=true;this.onComplete(this.name);break}
      }
      this.emitFrameEvents();
      duration=durations?.[this.index]||definition.frameDuration||100;
    }
  }
  step(direction=1){
    const frames=this.frames();if(!frames.length)return;
    this.index=Math.max(0,Math.min(frames.length-1,this.index+direction));this.elapsed=0;this.complete=false;this.emitFrameEvents();
  }
  reset(){this.name='idle';this.priority=ANIMATION_PRIORITY.idle;this.index=0;this.elapsed=0;this.complete=false;this.paused=false;this.playbackRate=1;this.eventFrames.clear()}
}
