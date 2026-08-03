const WORLD_DELIGHT_KEY='pxWorldDelightV1';
export const WORLD_DELIGHT_VERSION=1;

function storageFor(storage=null){if(storage)return storage;try{return globalThis.localStorage}catch{}return globalThis.__PX_TEST_STORAGE__||null}
function unique(values){return[...new Set(Array.isArray(values)?values:[])]}
function read(storage=null){try{return JSON.parse(storageFor(storage)?.getItem?.(WORLD_DELIGHT_KEY)||'{}')}catch{return{}}}
function write(value,storage=null){try{storageFor(storage)?.setItem?.(WORLD_DELIGHT_KEY,JSON.stringify(value));return true}catch{return false}}

export const WORLD_DELIGHT_DISCOVERIES=Object.freeze({
  'c1-cliff-overlook':Object.freeze({id:'c1-cliff-overlook',chapter:1,label:'CLIFFSIDE VIEW',kind:'SCENIC DISCOVERY',description:'The risky high road finally reveals how close the tournament really is.',banter:[['RRVVFO','Okay. The view almost makes the cliff route worth it.']]}),
  'c1-road-detour':Object.freeze({id:'c1-road-detour',chapter:1,label:'OUTSKIRTS DETOUR',kind:'ROUTE DISCOVERY',description:'A longer southern path bypasses the suspicious outskirts roadblock without using Lens of Truth.',banter:[['RRVVFO','See? I can solve problems without scratching my eye. Sometimes.']]}),
  'c2-rooftop-route':Object.freeze({id:'c2-rooftop-route',chapter:2,label:'FESTIVAL ROOFTOPS',kind:'ROUTE DISCOVERY',description:'A hidden high route links the loud public festival to quieter backstage space.',banter:[['WADE','You know there are stairs, right?'],['RRVVFO','Those are for people without Object Swap.'],['BARK','Those are for people with survival instincts.']]}),
  'c3-night-service':Object.freeze({id:'c3-night-service',chapter:3,label:'AFTER-HOURS SERVICE ROUTE',kind:'INVESTIGATION DISCOVERY',description:'A familiar tournament shortcut feels completely different when the crowd is gone.',banter:[['RRVVFO','This place was way less creepy when people were selling food here.'],['SAGE','Then stop looking at the food stalls and look at who is using the service route.']]}),
  'c4-water-lift':Object.freeze({id:'c4-water-lift',chapter:4,label:'OLD WATER LIFT',kind:'WORLD REACTION',description:'Wade permanently reconnects the Water Channel and Upper Ridge.',banter:[['WADE','See? Electricity solves infrastructure.'],['BARK','You nearly overloaded it.'],['RRVVFO','Still counts as infrastructure.']]}),
  'c4-apothecary-pass':Object.freeze({id:'c4-apothecary-pass',chapter:4,label:'OLD APOTHECARY PASSAGE',kind:'SECRET ROUTE',description:'Precision Lock reveals a skilled-player path that cuts across the potion route.',banter:[['RRVVFO','That would have saved a lot of walking five minutes ago.'],['BARK','You found it now.'],['WADE','Which means we never admit how long the normal route took.']]}),
  'c4-echo-overlook':Object.freeze({id:'c4-echo-overlook',chapter:4,label:'ECHO OVERLOOK',kind:'SCENIC DISCOVERY',description:'A quiet ledge above the village lets the party see the repaired beacon, channel, and mountain in one view.',banter:[['WADE','From up here the village looks tiny.'],['BARK','It is still full of people relying on us.'],['RRVVFO','Yeah. Tiny suddenly feels heavier.']]})
});

export const FIELD_SKILL_REACTIONS=Object.freeze({
  objectSwapField:Object.freeze({speaker:'RRVVFO',line:'Okay... I can work with this.'}),
  precisionSwap:Object.freeze({speaker:'RRVVFO',line:'Smaller target. Same trick. Better aim.'}),
  barkStabilize:Object.freeze({speaker:'BARK',line:'If the ground moves, I move it back.'}),
  wadeCurrent:Object.freeze({speaker:'WADE',line:'Dead machine. Not dead anymore.'}),
  vibrationSense:Object.freeze({speaker:'RRVVFO',line:'...I can feel something moving under there.'})
});

export function normalizeWorldDelightState(value={}){
  const valid=new Set(Object.keys(WORLD_DELIGHT_DISCOVERIES));
  return{version:1,discovered:unique(value?.discovered).filter(id=>valid.has(id)),seenBanter:unique(value?.seenBanter),lastDiscovery:valid.has(value?.lastDiscovery)?value.lastDiscovery:''};
}
export function loadWorldDelightState(storage=null){return normalizeWorldDelightState(read(storage))}
export function saveWorldDelightState(value,storage=null){const state=normalizeWorldDelightState(value);write(state,storage);return state}
export function delightForChapter(chapter){return Object.values(WORLD_DELIGHT_DISCOVERIES).filter(item=>item.chapter===Number(chapter))}
export function worldDelightKnown(id,storage=null){return loadWorldDelightState(storage).discovered.includes(id)}
export function discoverWorldDelight(id,{storage=null,quiet=false}={}){
  const discovery=WORLD_DELIGHT_DISCOVERIES[id];if(!discovery)return{first:false,state:loadWorldDelightState(storage),discovery:null};
  const state=loadWorldDelightState(storage),first=!state.discovered.includes(id);state.discovered=unique([...state.discovered,id]);state.lastDiscovery=id;saveWorldDelightState(state,storage);
  if(first&&!quiet&&typeof document!=='undefined'){
    document.body.classList.remove('worldDelightPulse');void document.body.offsetWidth;document.body.classList.add('worldDelightPulse');setTimeout(()=>document.body.classList.remove('worldDelightPulse'),460);
    document.dispatchEvent(new CustomEvent('pxstoryarrival',{detail:{kicker:discovery.kind,title:discovery.label,detail:discovery.description,tone:discovery.chapter===4?'echo':'gold',onceKey:`world-delight:${id}`}}));
    if(discovery.banter?.length)setTimeout(()=>document.dispatchEvent(new CustomEvent('pxstorybanter',{detail:{lines:discovery.banter,onceKey:`world-delight-banter:${id}`,lineDuration:1650}})),950);
  }
  return{first,state,discovery};
}
export function fieldSkillReaction(id){return FIELD_SKILL_REACTIONS[id]||null}

let initialized=false;
export function initializeWorldDelight(){
  if(initialized||typeof document==='undefined')return;initialized=true;
  document.addEventListener('pxfieldskillmastered',event=>{
    const id=event.detail?.id,reaction=fieldSkillReaction(id);if(!reaction)return;
    setTimeout(()=>document.dispatchEvent(new CustomEvent('pxstorybanter',{detail:{lines:[[reaction.speaker,reaction.line]],onceKey:`field-reaction:${id}`,lineDuration:1650}})),1050);
  });
}
