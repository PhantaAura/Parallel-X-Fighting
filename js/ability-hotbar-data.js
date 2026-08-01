import {ROSTER,ROSTER_IDS} from './roster.js';

export const ABILITY_HOTBAR_KEY='pxAbilityHotbarV1';
export const ABILITY_HOTBAR_ACTIONS=Object.freeze({
  fireBlast:'fireBlast',shotsOfAgony:'shotsOfAgony',objectSwap:'objectSwap',lensOfTruth:'lensOfTruth',ultimate:'ultimate',
  special:'characterSpecial',dash:'d',counter:'c'
});

const ability=(id,label,action,icon,energy,description,extra={})=>Object.freeze({id,label,short:label.split(' ').map(word=>word[0]).join('').slice(0,4).toUpperCase(),action,icon,energy,description,...extra});

const RRVVFO_ABILITIES=Object.freeze([
  ability('fireBlast','Fire Blast','fireBlast','🔥',28,'Launches Rrvvfo’s fire projectile from range.',{cooldown:55}),
  ability('shotsOfAgony','Shots of Agony','shotsOfAgony','◉',100,'Consumes the full Energy meter to summon exactly four blue copies that fire together.',{cooldown:300,restriction:'All Energy • exactly four clones • one active volley'}),
  ability('objectSwap','Object Swap','objectSwap','↯',12,'Repositions using a valid nearby object or marker.',{cooldown:42,restriction:'Requires a legal destination'}),
  ability('lensOfTruth','Lens of Truth','lensOfTruth','◈',60,'Starts at 60 Energy and 25 HP. Successful use improves predictions and eventually unlocks two automatic dodges.',{hp:25,cooldown:300,restriction:'Mastery improves cost, duration, accuracy, and auto-dodges'}),
  ability('ultimate','Solar Weave','ultimate','◆',90,'Activates Rrvvfo’s cinematic Fire Awakening ultimate.',{cooldown:300,ultimate:true,restriction:'Subject to cinematic and clash rules'})
]);

const SPECIAL_NAMES=Object.freeze({
  revvfo:'Astrylte Pressure',wade:'Flash Step',bark:'Rock Armor',alt:'Fist of Punishment',robert:'Ice Master',virek:'Emerald Lance',shadow:'Sage Orb',phanta:'Clone Barrage',creed:'Time Slice',sage:'Lazy Palm',raggie:'Paper Disc',jimmy:'Dark Guardian',jonathan:'Oddball Trap',rev:'Mechanical Barrage'
});

function genericAbilities(id){
  const fighter=ROSTER[id],special=SPECIAL_NAMES[id]||fighter?.s||'Special';
  const slots=[
    ability(`${id}Special`,special,'characterSpecial','✦',28,`${fighter?.n||id}’s character-specific special attack.`,{cooldown:55}),
    ability(`${id}Movement`,'Movement Ability','d','➤',12,`${fighter?.n||id}’s dash or character movement ability.`,{cooldown:42}),
  ];
  if(id==='bark')slots.push(ability('barkCounter','Seismic Counter','c','⬡',20,'A deliberate close-range counter stance that only punishes melee attacks.',{cooldown:90,restriction:'Close melee only • punishable on miss'}));
  slots.push(ability(`${id}Ultimate`,fighter?.u||'Ultimate','ultimate','◆',90,`${fighter?.n||id}’s cinematic ultimate.`,{cooldown:300,ultimate:true}));
  return Object.freeze(slots);
}

export const FIGHTER_ABILITY_HOTBARS=Object.freeze(Object.fromEntries(ROSTER_IDS.map(id=>[id,id==='rrvvfo'?RRVVFO_ABILITIES:genericAbilities(id)])));

export function abilitiesForFighter(id){return FIGHTER_ABILITY_HOTBARS[id]||[]}
export function defaultAbilityOrder(id){return abilitiesForFighter(id).map(entry=>entry.id)}


function availableStorage(storage){if(storage)return storage;try{return globalThis.localStorage}catch{return globalThis.__PX_TEST_STORAGE__||null}}

export function createDefaultAbilityHotbarSettings(stored={}){
  const orders={};for(const id of ROSTER_IDS){const saved=Array.isArray(stored?.orders?.[id])?stored.orders[id]:[],defaults=defaultAbilityOrder(id),valid=saved.filter(item=>defaults.includes(item));orders[id]=[...new Set([...valid,...defaults])].slice(0,defaults.length)}
  return{
    version:1,orders,
    desktop:['full','compact','cooldowns','hidden'].includes(stored.desktop)?stored.desktop:'full',
    text:['full','short','icons'].includes(stored.text)?stored.text:'full',
    size:['small','medium','large','custom'].includes(stored.size)?stored.size:'medium',
    customScale:Math.max(.7,Math.min(1.45,Number(stored.customScale)||1)),
    cooldown:['number','fill','both'].includes(stored.cooldown)?stored.cooldown:'both',
    activation:['tap','double','confirm-ultimate'].includes(stored.activation)?stored.activation:'tap',
    opacity:Math.max(.35,Math.min(1,Number(stored.opacity)||.92)),
    offsetX:Math.max(-20,Math.min(20,Number(stored.offsetX)||0)),
    offsetY:Math.max(-12,Math.min(18,Number(stored.offsetY)||0)),
    locked:stored.locked!==false,
    pauseForInfo:!!stored.pauseForInfo
  };
}

export function loadAbilityHotbarSettings(storage=null){try{const active=availableStorage(storage);return createDefaultAbilityHotbarSettings(JSON.parse(active?.getItem?.(ABILITY_HOTBAR_KEY)||'{}'))}catch{return createDefaultAbilityHotbarSettings()}}
export function saveAbilityHotbarSettings(settings,storage=null){try{availableStorage(storage)?.setItem?.(ABILITY_HOTBAR_KEY,JSON.stringify(createDefaultAbilityHotbarSettings(settings)));return true}catch{return false}}

export function orderedAbilities(id,settings=createDefaultAbilityHotbarSettings()){
  const all=abilitiesForFighter(id),byId=new Map(all.map(entry=>[entry.id,entry]));return(settings.orders?.[id]||defaultAbilityOrder(id)).map(entry=>byId.get(entry)).filter(Boolean);
}

export function moveAbilitySlot(settings,fighterId,abilityId,targetIndex){
  const order=[...(settings.orders?.[fighterId]||defaultAbilityOrder(fighterId))],from=order.indexOf(abilityId),to=Math.max(0,Math.min(order.length-1,Number(targetIndex)));
  if(from<0||!Number.isInteger(to))return false;order.splice(from,1);order.splice(to,0,abilityId);settings.orders={...settings.orders,[fighterId]:order};return true;
}
export function restoreAbilityOrder(settings,fighterId){settings.orders={...settings.orders,[fighterId]:defaultAbilityOrder(fighterId)};return settings.orders[fighterId]}

const seconds=frames=>Math.max(0,Math.ceil(Number(frames||0)/60));
function currentLensCosts(storage=null){let mastery=0;try{mastery=Math.max(0,Math.min(100,Number(availableStorage(storage)?.getItem?.('pxLensMasteryV1'))||0))}catch{}const ratio=mastery/100;return{mastery,energy:Math.round(60-15*ratio),hp:Math.round(25-15*ratio)}}
export function abilityStatus(fighter,entry,world=fighter?.world){
  if(!fighter||!entry)return{available:false,reason:'Fighter unavailable',cooldown:0,fill:0,active:false};
  let cooldown=0,active=false,activeText='',reason='';const lens=currentLensCosts();const requiredEnergy=entry.action==='lensOfTruth'?lens.energy:entry.energy;
  if(entry.action==='fireBlast'||entry.action==='characterSpecial')cooldown=fighter.specialCd||0;
  if(entry.action==='shotsOfAgony'){cooldown=fighter.agonyCooldown||0;active=!!fighter.agonyActiveVolley;activeText=active?'ACTIVE':''}
  if(entry.action==='objectSwap'||entry.action==='d')cooldown=fighter.dashCd||0;
  if(entry.action==='lensOfTruth'){cooldown=fighter.lensCooldown||0;active=!!fighter.lens;activeText=active?`${seconds(fighter.lens)}s`:''}
  if(entry.action==='ultimate')cooldown=fighter.ultCd||0;
  if(entry.action==='c')cooldown=fighter.counterCd||0;
  const blocked=!!(fighter.stun||fighter.knockdown||fighter.getup||fighter.guardBreakStun||world?.clash?.active||world?.cinematic?.active);
  if(blocked)reason='Unavailable in current state';
  else if(entry.action==='shotsOfAgony'&&fighter.storyShotsLocked)reason='Unknown technique • invented in Chapter 5';
  else if(active&&entry.action==='shotsOfAgony')reason='Shots of Agony already active';
  else if(cooldown>0)reason=`Cooldown ${seconds(cooldown)}s`;
  else if(fighter.en<requiredEnergy)reason=`Needs ${requiredEnergy} Energy`;
  else if(entry.action==='objectSwap'){
    const destination=Math.max(15,Math.min((world?.width||960)-fighter.w-15,fighter.x+fighter.face*155));
    if(Math.abs(destination-fighter.x)<24)reason='No legal swap destination';
  }
  if(!reason&&entry.action==='shotsOfAgony'&&fighter.foe?.()&&Math.abs(fighter.foe().x-fighter.x)>190)reason='Target must be nearby';
  if(entry.action==='ultimate'&&(fighter.ultimateStartup||fighter.ultimateRecovery))reason='Ultimate unavailable';
  const fill=entry.cooldown?Math.max(0,Math.min(1,cooldown/entry.cooldown)):0;
  return{available:!reason&&!active,reason,cooldown,cooldownText:cooldown?`${seconds(cooldown)}s`:'',fill,active,activeText:entry.action==='lensOfTruth'&&active?`${activeText} • ${lens.mastery}%`:activeText,hpWarning:entry.action==='lensOfTruth'&&fighter.hp<=lens.hp?`HP FLOOR: ${Math.max(1,fighter.hp-lens.hp)}`:entry.hp&&fighter.hp<=entry.hp?`HP FLOOR: ${Math.max(1,fighter.hp-entry.hp)}`:''};
}
