export const CHAPTER4_ENEMY_ROLES=Object.freeze({
  scout:Object.freeze({id:'scout',label:'SCOUT',color:'#72e7ff',description:'Fast approach • low durability • interrupts charging',speed:1.16,attack:.9,defense:.9}),
  striker:Object.freeze({id:'striker',label:'STRIKER',color:'#ff786f',description:'Aggressive pressure • stronger close-range damage',speed:1.06,attack:1.12,defense:.96}),
  raider:Object.freeze({id:'raider',label:'RAIDER',color:'#d88cff',description:'Balanced pressure • changes approach often',speed:1.02,attack:1.02,defense:1}),
  heavy:Object.freeze({id:'heavy',label:'HEAVY',color:'#d9b56f',description:'Slow armor • high guard damage • punish recovery',speed:.84,attack:1.14,defense:1.18}),
  commander:Object.freeze({id:'commander',label:'COMMANDER',color:'#ffb15e',description:'Adaptive leader • mixes pressure and defense',speed:1.02,attack:1.12,defense:1.1}),
  watcher:Object.freeze({id:'watcher',label:'ADAPTIVE WATCHER',color:'#63dce3',description:'Records move, timing, spacing, and approach',speed:1.04,attack:1.08,defense:1.1}),
  boss:Object.freeze({id:'boss',label:'SECRET BOSS',color:'#c395ff',description:'Bodiless possession pressure • teamwork required',speed:1.08,attack:1.16,defense:1.08})
});

export function chapter4EnemyRole(wave={},fightKind=''){
  const explicit=String(wave.role||'').toLowerCase();if(CHAPTER4_ENEMY_ROLES[explicit])return CHAPTER4_ENEMY_ROLES[explicit];
  if(fightKind==='watcher')return CHAPTER4_ENEMY_ROLES.watcher;
  if(fightKind==='ryuzankaro')return CHAPTER4_ENEMY_ROLES.boss;
  const name=String(wave.name||wave.id||'').toLowerCase();
  if(name.includes('commander')||name.includes('leader'))return CHAPTER4_ENEMY_ROLES.commander;
  if(name.includes('heavy')||name.includes('brute'))return CHAPTER4_ENEMY_ROLES.heavy;
  if(name.includes('striker'))return CHAPTER4_ENEMY_ROLES.striker;
  if(name.includes('raider')||name.includes('pack'))return CHAPTER4_ENEMY_ROLES.raider;
  return CHAPTER4_ENEMY_ROLES.scout;
}
