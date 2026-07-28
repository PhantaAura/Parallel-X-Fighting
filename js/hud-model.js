const seconds=frames=>Math.max(0,Math.ceil((frames||0)/60));
export function fighterHudModel(fighter){
  const cooldowns=[];
  if(fighter.id==='rrvvfo'){
    if(fighter.agonyActiveVolley)cooldowns.push({id:'shots',icon:'◉',text:'SHOTS VOLLEY ACTIVE',active:true});else if(fighter.agonyCooldown>0)cooldowns.push({id:'shots',icon:'◷',text:`SHOTS ${seconds(fighter.agonyCooldown)}s`});
    if(fighter.lens>0)cooldowns.push({id:'lens',icon:'◉',text:`LENS ${seconds(fighter.lens)}s`,active:true});else if(fighter.lensCooldown>0)cooldowns.push({id:'lens',icon:'◷',text:`LENS ${seconds(fighter.lensCooldown)}s`});
    if(fighter.dashCd>0)cooldowns.push({id:'swap',icon:'◷',text:`SWAP ${seconds(fighter.dashCd)}s`});
    cooldowns.push({id:'lens-cost',icon:'⚠',text:fighter.hp>50?'LENS COSTS 50 HP':'LENS STOPS AT 1 HP',warning:true});
  }
  if(fighter.ultCd>0)cooldowns.push({id:'ultimate',icon:'◷',text:`ULT ${seconds(fighter.ultCd)}s`});
  const statuses=[fighter.armor?'ARMOR':null,fighter.aura?'AURA':null,fighter.freeze?'FROZEN':null,fighter.stun?'STUN':null,fighter.knockdown?'KNOCKDOWN':null,fighter.guardBreakStun?'GUARD BROKEN':null,fighter.throwProtection?'THROW PROTECTION':null].filter(Boolean);
  return{health:Math.ceil(fighter.hp),maxHealth:Math.ceil(fighter.maxHp||100),energy:Math.floor(fighter.en),guard:Math.ceil(fighter.guard),ultimateReady:fighter.en>=90&&!fighter.ultCd,breakerReady:!fighter.breakerUsed&&!fighter.breakerCooldown,cooldowns,statuses};
}
export function cooldownText(model){return model.cooldowns.map(item=>`${item.icon} ${item.text}`).join(' • ')}

