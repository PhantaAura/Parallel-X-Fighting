export const difficultyProfile=level=>({
  easy:{quality:.44,reaction:28,aggression:.48,block:.012,combo:.35},
  normal:{quality:.68,reaction:18,aggression:.66,block:.02,combo:.58},
  hard:{quality:.86,reaction:12,aggression:.8,block:.032,combo:.76}
}[level]||{quality:.68,reaction:18,aggression:.66,block:.02,combo:.58});

export function decideCPU(fighter,foe,difficulty){
  const p=difficultyProfile(difficulty),distance=Math.abs(foe.x-fighter.x),toward=foe.x<fighter.x?'l':'r',away=toward==='l'?'r':'l';
  const decision={move:null,block:false,actions:[]};
  if(fighter.knockdown||fighter.getup||fighter.stun)return decision;
  if(distance>105)decision.move=toward;else if(Math.random()<.16)decision.move=away;
  decision.block=distance<125&&Math.random()<p.block;
  if(fighter.tick%p.reaction!==0)return decision;
  if(distance<85&&foe.stun&&Math.random()<p.combo)decision.actions.push(foe.grounded?'x':'a');
  else if(distance<82&&Math.random()<p.aggression)decision.actions.push('a');
  else if(distance<98&&Math.random()<p.quality*.34)decision.actions.push('h');
  else if(fighter.en>=28&&Math.random()<p.quality*.5)decision.actions.push('s');
  if(fighter.en>=90&&Math.random()<p.quality*.12)decision.actions.push('u');
  if(Math.random()<p.quality*.12)decision.actions.push('d');
  if(Math.random()<p.quality*.08)decision.actions.push('j');
  return decision;
}
