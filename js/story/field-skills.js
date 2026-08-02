const FIELD_SKILL_KEY='pxFieldSkillsV1';

function availableStorage(storage=null){
  if(storage)return storage;
  try{return globalThis.localStorage}catch{}
  return globalThis.__PX_TEST_STORAGE__||null;
}
function clone(value){return typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value))}
function read(storage=null){
  try{return JSON.parse(availableStorage(storage)?.getItem?.(FIELD_SKILL_KEY)||'{}')}catch{return{}}
}
function write(value,storage=null){try{availableStorage(storage)?.setItem?.(FIELD_SKILL_KEY,JSON.stringify(value));return true}catch{return false}}
function unique(values){return[...new Set(Array.isArray(values)?values:[])]}

export const FIELD_SKILLS=Object.freeze({
  objectSwapField:Object.freeze({id:'objectSwapField',chapter:1,owner:'RRVVFO',label:'OBJECT SWAP • FIELD CONTROL',icon:'↯',kind:'FIELD TECHNIQUE',description:'Throw, place, and trade positions with marked objects to cross gaps and alter routes.',mastery:'Learned by solving the Sage’s three-anchor field trial instead of receiving it from a menu.'}),
  precisionSwap:Object.freeze({id:'precisionSwap',chapter:1,owner:'RRVVFO',label:'OBJECT SWAP • PRECISION LOCK',icon:'◇',kind:'FIELD MASTERY',description:'Locks onto smaller environmental markers and makes hidden high-road routes easier to read.',mastery:'Earned by finishing the three-point swap relay.'}),
  barkStabilize:Object.freeze({id:'barkStabilize',chapter:4,owner:'BARK',label:'EARTH STABILIZE',icon:'■',kind:'PARTY FIELD SKILL',description:'Bark braces unstable ground, broken supports, and heavy structures long enough for the party to cross.',mastery:'Learned when Bark physically stabilizes the damaged cavern approach.'}),
  wadeCurrent:Object.freeze({id:'wadeCurrent',chapter:4,owner:'WADE',label:'LIGHTNING CURRENT',icon:'ϟ',kind:'PARTY FIELD SKILL',description:'Wade routes power through old mechanisms and dead conduits to wake them back up.',mastery:'Learned when Wade powers the Echo mechanism on the cavern route.'}),
  vibrationSense:Object.freeze({id:'vibrationSense',chapter:4,owner:'RRVVFO',label:'VIBRATION SENSE',icon:'◉',kind:'FIELD SENSE',description:'Reads disturbances through the environment to expose routes, threats, and hidden points of interest.',mastery:'Earned through Chapter 4 Story progression and used during the solo mountain stretch.'})
});

const DEFAULT_STATE=Object.freeze({version:1,mastered:[],seenCards:[],trialCounts:{},lastMastered:''});
export function normalizeFieldSkillState(value={}){
  const valid=new Set(Object.keys(FIELD_SKILLS));
  return{
    version:1,
    mastered:unique(value?.mastered).filter(id=>valid.has(id)),
    seenCards:unique(value?.seenCards).filter(id=>valid.has(id)),
    trialCounts:Object.fromEntries(Object.entries(value?.trialCounts||{}).filter(([id])=>valid.has(id)).map(([id,count])=>[id,Math.max(0,Number(count)||0)])),
    lastMastered:valid.has(value?.lastMastered)?value.lastMastered:''
  };
}
export function loadFieldSkillState(storage=null){return normalizeFieldSkillState({...clone(DEFAULT_STATE),...read(storage)})}
export function saveFieldSkillState(value,storage=null){const next=normalizeFieldSkillState(value);write(next,storage);return next}
export function hasFieldSkill(id,storage=null){return loadFieldSkillState(storage).mastered.includes(id)}
export function recordFieldSkillTrial(id,storage=null){
  const state=loadFieldSkillState(storage);if(!FIELD_SKILLS[id])return state;
  state.trialCounts[id]=(state.trialCounts[id]||0)+1;return saveFieldSkillState(state,storage);
}
export function masterFieldSkill(id,{storage=null,quiet=false}={}){
  const skill=FIELD_SKILLS[id];if(!skill)return{state:loadFieldSkillState(storage),first:false,skill:null};
  const state=loadFieldSkillState(storage),first=!state.mastered.includes(id);
  if(first)state.mastered.push(id);state.lastMastered=id;saveFieldSkillState(state,storage);
  if(first&&!quiet&&typeof document!=='undefined')showFieldSkillMastery(id,{storage});
  return{state,first,skill};
}
export function fieldSkillsForChapter(chapter,storage=null){
  const state=loadFieldSkillState(storage);return Object.values(FIELD_SKILLS).filter(skill=>skill.chapter<=Number(chapter||1)).map(skill=>({...skill,mastered:state.mastered.includes(skill.id)}));
}
export function renderFieldSkillJournal({chapter=4,storage=null}={}){
  const skills=fieldSkillsForChapter(chapter,storage);
  return `<section class="fieldSkillJournal"><header><small>FIELD TECHNIQUES</small><strong>LEARNED BY DOING</strong></header><div>${skills.map(skill=>`<article class="${skill.mastered?'mastered':'locked'}"><b>${skill.mastered?skill.icon:'?'}</b><span><small>${skill.owner} • ${skill.kind}</small><strong>${skill.mastered?skill.label:'UNLEARNED FIELD SKILL'}</strong><p>${skill.mastered?skill.description:'Solve field challenges to discover this technique.'}</p></span></article>`).join('')}</div></section>`;
}
export function showFieldSkillMastery(id,{storage=null,duration=2600}={}){
  const skill=FIELD_SKILLS[id];if(!skill||typeof document==='undefined')return null;
  document.querySelector('[data-field-skill-card]')?.remove();
  const reactions={objectSwapField:'RRVVFO • Okay... I can work with this.',precisionSwap:'RRVVFO • Smaller target. Same trick. Better aim.',barkStabilize:'BARK • If the ground moves, I move it back.',wadeCurrent:'WADE • Dead machine. Not dead anymore.',vibrationSense:'RRVVFO • ...I can feel something moving under there.'};
  const card=document.createElement('aside');card.className='fieldSkillMasteryCard';card.dataset.fieldSkillCard='';card.innerHTML=`<small>${skill.kind} MASTERED</small><strong><b>${skill.icon}</b>${skill.label}</strong><span>${skill.mastery}</span><em>${reactions[id]||''}</em>`;
  document.body.appendChild(card);requestAnimationFrame(()=>card.classList.add('show'));document.dispatchEvent(new CustomEvent('pxfieldskillmastered',{detail:{id,skill}}));document.dispatchEvent(new CustomEvent('pxstoryuicue',{detail:{cue:'unlock'}}));
  const state=loadFieldSkillState(storage);state.seenCards=[...new Set([...state.seenCards,id])];saveFieldSkillState(state,storage);
  setTimeout(()=>{card.classList.remove('show');setTimeout(()=>card.remove(),240)},Math.max(900,Number(duration)||2600));
  return card;
}

export const STORY_TECHNIQUE_RULES=Object.freeze({
  shotsOfAgony:Object.freeze({id:'shotsOfAgony',label:'UNKNOWN TECHNIQUE',availableFromChapter:5,requiresUnlock:true,unlock:'shotsOfAgonyPrototype',reason:'Rrvvfo has not invented this technique yet.'})
});
export function storyTechniqueAvailable(id,{chapter=1,progress={}}={}){
  const rule=STORY_TECHNIQUE_RULES[id];if(!rule)return true;
  if(Array.isArray(progress?.unlocks)&&progress.unlocks.includes(rule.unlock))return true;
  if(rule.requiresUnlock)return false;
  return Number(chapter||1)>=rule.availableFromChapter;
}
export function storyTechniqueLabel(id,{chapter=1,progress={}}={}){
  if(storyTechniqueAvailable(id,{chapter,progress}))return null;
  return STORY_TECHNIQUE_RULES[id]?.label||'UNKNOWN TECHNIQUE';
}
