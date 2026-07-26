"use strict";

const CACHE=new Map();

export function isRepositoryRelativePath(path){
  return typeof path==='string'&&!path.startsWith('/')&&!path.startsWith('http:')&&!path.startsWith('https:')&&!path.startsWith('data:');
}

function loadImage(url){
  return new Promise((resolve,reject)=>{
    if(typeof Image==='undefined'){reject(new Error('Image loading is unavailable'));return}
    const image=new Image();
    image.decoding='async';
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(new Error(`Unable to load sprite image: ${url}`));
    image.src=url;
  });
}

export function validateSpriteManifest(manifest){
  if(!manifest||typeof manifest!=='object')throw new Error('Sprite manifest must be an object');
  if(!manifest.frames||!manifest.animations)throw new Error('Sprite manifest is missing frames or animations');
  if(!isRepositoryRelativePath(manifest.image))throw new Error('Sprite atlas image must use a repository-relative path');
  const atlasWidth=manifest.atlas?.width||0,atlasHeight=manifest.atlas?.height||0,frameCanvas=manifest.atlas?.frameCanvas||[];
  if(!atlasWidth||!atlasHeight||atlasWidth>4096||atlasHeight>4096||atlasWidth*atlasHeight>16000000)throw new Error('Sprite atlas exceeds safe dimensions');
  if(frameCanvas.some(value=>value>512))throw new Error('Sprite frame canvas exceeds the safe limit');
  for(const [name,frame] of Object.entries(manifest.frames)){
    if(!Array.isArray(frame.source)||frame.source.length!==4)throw new Error(`Frame ${name} has no valid source rectangle`);
    if(!Array.isArray(frame.groundPivot)||frame.groundPivot.length!==2)throw new Error(`Frame ${name} has no ground pivot`);
  }
  for(const [name,animation] of Object.entries(manifest.animations)){
    if(!Array.isArray(animation.frames)||!animation.frames.length)throw new Error(`Animation ${name} has no frames`);
    if(animation.frames.some(frame=>!manifest.frames[frame]))throw new Error(`Animation ${name} references an unknown frame`);
  }
  return true;
}

export class SpriteAtlas{
  constructor(manifest,image,baseUrl,effectImages=new Map()){
    validateSpriteManifest(manifest);
    this.manifest=manifest;
    this.image=image;
    this.baseUrl=baseUrl;
    this.effectImages=effectImages;
  }
  get ready(){return !!this.image}
  frame(name){return this.manifest.frames[name]||null}
  animation(name){return this.manifest.animations[name]||null}
  animationFrames(name,appearance='down'){
    const animation=this.animation(name);
    if(!animation)return [];
    const forced=animation.hoodState==='up'?'up':appearance;
    return forced==='up'&&animation.variants?.up?.length?animation.variants.up:animation.frames;
  }
  effect(name){return this.effectImages.get(name)||null}
  async loadEffects(imageLoader=loadImage){
    const entries=Object.entries(this.manifest.effects||{});
    const settled=await Promise.allSettled(entries.map(async([name,path])=>{
      if(!isRepositoryRelativePath(path))throw new Error(`Effect ${name} has a non-relative path`);
      const image=await imageLoader(new URL(path,this.baseUrl).href);
      this.effectImages.set(name,image);
    }));
    return settled.filter(result=>result.status==='rejected').length===0;
  }
}

export async function loadSpriteAtlas(manifestUrl,{fetchImpl=globalThis.fetch,imageLoader=loadImage,preloadEffects=true}={}){
  if(CACHE.has(manifestUrl))return CACHE.get(manifestUrl);
  const loading=(async()=>{
    if(typeof fetchImpl!=='function')throw new Error('Sprite manifest fetch is unavailable');
    const response=await fetchImpl(manifestUrl);
    if(!response?.ok)throw new Error(`Unable to load sprite manifest (${response?.status||'network error'})`);
    let manifest;
    try{manifest=await response.json()}catch(error){throw new Error(`Invalid sprite manifest JSON: ${error.message}`)}
    validateSpriteManifest(manifest);
    const baseUrl=new URL(manifestUrl,globalThis.location?.href||'http://localhost/');
    const imageUrl=new URL(manifest.image,baseUrl).href;
    const image=await imageLoader(imageUrl);
    const atlas=new SpriteAtlas(manifest,image,baseUrl);
    if(preloadEffects)await atlas.loadEffects(imageLoader);
    return atlas;
  })();
  CACHE.set(manifestUrl,loading);
  try{return await loading}catch(error){CACHE.delete(manifestUrl);throw error}
}

export function clearSpriteAtlasCache(){CACHE.clear()}
export function spriteAtlasCacheSize(){return CACHE.size}
