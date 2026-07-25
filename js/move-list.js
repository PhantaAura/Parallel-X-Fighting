import {moveList as characterMoveNames} from './movesets.js';
import {ROSTER} from './roster.js';

const costNotes={
  rrvvfo:['Fire Blast — 28 energy, 55f cooldown','Shots of Agony — 40 energy, four clones, one active volley, 5s cooldown after firing','Lens of Truth — 90 energy + exactly 50 HP (never below 1), 4s duration','Object Swap — 12 energy, movement cooldown','Fire Awakening — 90 energy'],
  bark:['Seismic Counter — 20 energy, melee-only stance, punishable recovery']
};

export function adaptiveMoveList({fighterId,input,side=1,device}={}){
  const label=(action,options={})=>input.actionLabel(side,action,{device,...options});
  const light=label('a'),heavy=label('h'),launcher=label('x'),jump=label('j'),special=label('s'),ultimate=label('u');
  const entries=[
    ['Basic combo',`${light}, ${light}, ${light}`],
    ['Heavy finisher',`${light}, ${light}, ${heavy}`],
    ['Launcher route',`${light}, ${light}, ${launcher}`],
    ['Air combo',`${launcher}, ${jump}, ${label('a',{air:true})}, ${label('h',{air:true})}`],
    ['Throw',label('t')],['Block',label('b')],['Perfect block',`${label('b')} just before impact`],['Combo breaker',label('k')],['Special',special],['Ultimate',ultimate]
  ];
  return{fighterId,name:ROSTER[fighterId]?.n||fighterId,inputStyle:input.inputStyleName(side,device),entries,specials:characterMoveNames(fighterId),notes:costNotes[fighterId]||['Special — 28 energy','Ultimate — 90 energy'],cosmetic:fighterId==='rrvvfo'?'Hood appearance is cosmetic only; gameplay is identical.':''};
}

export function renderAdaptiveMoveList(model){return `<p><strong>${model.name}</strong> • ${model.inputStyle}</p><div class="moveListTable">${model.entries.map(([name,input])=>`<strong>${name}</strong><span>${input}</span>`).join('')}${model.specials.map(name=>`<strong>${name}</strong><span>Character move</span>`).join('')}</div><div class="moveListNote">${model.notes.join('<br>')}${model.cosmetic?`<br>${model.cosmetic}`:''}</div>`}

