export const difficultyProfile=level=>({
  easy:{quality:.44,reaction:28,aggression:.48,block:.18,combo:.35},
  normal:{quality:.68,reaction:18,aggression:.66,block:.34,combo:.58},
  hard:{quality:.86,reaction:12,aggression:.8,block:.52,combo:.76}
}[level]||{quality:.68,reaction:18,aggression:.66,block:.34,combo:.58});

const base={preferredRange:90,advance:1,retreat:.45,block:1,a:1,h:.75,x:.65,s:.85,u:.35,d:.4,j:.25,c:0};
export const CHARACTER_AI={
  rrvvfo:{preferredRange:155,advance:.7,retreat:.9,block:.8,a:.85,h:.7,x:.65,s:1.65,u:.4,d:1.05,j:.2,c:0,style:'fireball pressure, committed clone volleys, swap repositioning'},
  revvfo:{preferredRange:105,advance:1.25,retreat:.35,block:.7,a:1.15,h:.85,x:1.4,s:1.35,u:.5,d:1.15,j:.75,c:0,style:'teleport pressure, launchers, air follow-ups, ranged beams'},
  wade:{preferredRange:65,advance:1.7,retreat:.7,block:.45,a:1.65,h:.55,x:1.05,s:1.1,u:.4,d:1.45,j:.65,c:0,style:'fast rushdown with post-combo retreats'},
  bark:{preferredRange:75,advance:.55,retreat:.2,block:1.8,a:.75,h:1.45,x:.7,s:1.25,u:.45,d:.15,j:.1,c:1.55,style:'blocking, armor, counters, slow punishes'},
  alt:{preferredRange:60,advance:1.6,retreat:.15,block:.55,a:1.55,h:1.05,x:.8,s:1.25,u:.8,d:.65,j:.3,c:0,style:'close pressure and rage usage'},
  robert:{preferredRange:175,advance:.45,retreat:1.35,block:1.25,a:.55,h:.65,x:.55,s:1.8,u:.65,d:.45,j:.2,c:0,style:'ranged ice control and defensive spacing'},
  virek:{preferredRange:115,advance:1,retreat:.75,block:1,a:1,h:.85,x:.8,s:1.1,u:.55,d:.65,j:.35,c:0,style:'balanced range-to-melee rival adaptation'},
  shadow:{preferredRange:160,advance:.55,retreat:1.15,block:1.25,a:.7,h:.65,x:.6,s:1.45,u:.65,d:.45,j:.25,c:0,style:'disciplined spacing, projectiles, healing'},
  phanta:{preferredRange:125,advance:1,retreat:1,block:.8,a:.8,h:.75,x:.7,s:1.75,u:.6,d:1.65,j:.75,c:0,style:'unpredictable movement, clone pressure, sudden punishes'},
  creed:{preferredRange:95,advance:.85,retreat:1.25,block:.9,a:.9,h:1.25,x:.8,s:1.35,u:.6,d:1.6,j:.45,c:0,style:'evasive movement and whiff punishment'},
  sage:{preferredRange:100,advance:.7,retreat:.75,block:1.15,a:.8,h:.9,x:.6,s:1.15,u:.75,d:.25,j:.15,c:0,style:'patient palm control and selective ultimate use'},
  raggie:{preferredRange:150,advance:.6,retreat:1.1,block:.9,a:.75,h:.6,x:.55,s:1.55,u:.7,d:.85,j:.55,c:0,style:'mobile paper-disc zoning and evasive time use'},
  jimmy:{preferredRange:90,advance:.85,retreat:.65,block:1.2,a:.8,h:1.15,x:.65,s:1.25,u:.65,d:.3,j:.15,c:0,style:'guardian punishment and sealing control'},
  jonathan:{preferredRange:130,advance:.7,retreat:.9,block:.85,a:.7,h:.75,x:.65,s:1.35,u:.65,d:.55,j:.3,c:0,style:'trap setup and chain-reaction pressure'}
};

export function aiProfile(id){return{...base,...(CHARACTER_AI[id]||{})}}
export function availableAIActions(fighter,foe){
  const distance=Math.abs(foe.x-fighter.x),toward=foe.x<fighter.x?'l':'r',away=toward==='l'?'r':'l',actions=[];
  if(distance<105){actions.push('a','h');if(foe.grounded)actions.push('x')}
  const closeAgony=fighter.id==='rrvvfo'&&distance<=190,agonyReady=!fighter.agonyCooldown&&!fighter.agonyActiveVolley;
  const specialCost=closeAgony?40:28,specialReady=!fighter.specialCd&&!fighter.agonyActiveVolley&&(!closeAgony||agonyReady);
  if(fighter.en>=specialCost&&specialReady)actions.push('s');
  if(fighter.en>=90&&!fighter.ultCd)actions.push('u');
  if(!fighter.dashCd)actions.push('d');
  if(fighter.grounded)actions.push('j');
  if(fighter.id==='bark'&&fighter.en>=20&&!fighter.counterCd)actions.push('c');
  return{actions:[...new Set(actions)],movements:[toward,away],canBlock:distance<130,distance,toward,away};
}

export function selectAIAction(candidates,weights,roll=Math.random()){
  const weighted=candidates.map(action=>({action,weight:Math.max(.01,weights[action]||.01)})),total=weighted.reduce((sum,item)=>sum+item.weight,0);let cursor=roll*total;
  for(const item of weighted){cursor-=item.weight;if(cursor<=0)return item.action}
  return weighted.at(-1)?.action||null;
}

export function decideCPU(fighter,foe,difficulty,rng=Math.random){
  const settings=difficultyProfile(difficulty),profile=aiProfile(fighter.id),available=availableAIActions(fighter,foe),decision={move:null,block:false,actions:[]};
  if(fighter.knockdown||fighter.getup||fighter.stun)return decision;
  const shouldRetreat=fighter.id==='wade'&&fighter.combo.hits>=3||fighter.id==='shadow'&&fighter.hp<45||fighter.id==='robert'&&available.distance<110;
  if(shouldRetreat)decision.move=available.away;
  else if(fighter.id==='phanta')decision.move=rng()<.5?available.toward:available.away;
  else if(available.distance>profile.preferredRange)decision.move=available.toward;
  else if(available.distance<profile.preferredRange*.65&&profile.retreat>.5)decision.move=available.away;
  decision.block=available.canBlock&&rng()<settings.block*Math.min(1.6,profile.block);
  if(fighter.tick%settings.reaction!==0)return decision;
  const weights={...profile};
  if(available.distance>130)weights.s*=2.2;
  if(foe.stun){weights.x*=1+settings.combo;weights.h*=1.35}
  if(!foe.grounded)weights.a*=1+settings.combo;
  if(fighter.id==='rrvvfo'){if(available.distance>190)weights.s*=2;else if(!fighter.agonyCooldown&&!fighter.agonyActiveVolley)weights.s*=1.7;weights.d*=available.distance<75?1.8:1}
  if(fighter.id==='revvfo'){weights.x*=foe.grounded?1.8:.5;weights.a*=foe.grounded?.8:1.8}
  if(fighter.id==='bark'){weights.c*=available.distance<90?2.1:.2;weights.h*=foe.attackCd?1.7:1}
  if(fighter.id==='alt'&&fighter.en>=90)weights.u*=1.8;
  if(fighter.id==='shadow'&&fighter.hp<70)weights.s*=1.8;
  if(fighter.id==='phanta'){weights.s*=1.5;weights.d*=1.4}
  if(fighter.id==='creed'&&foe.attackCd>0&&!foe.stun){weights.h*=1.8;weights.s*=1.6}
  const selected=selectAIAction(available.actions,weights,rng());if(selected)decision.actions.push(selected);
  return decision;
}
