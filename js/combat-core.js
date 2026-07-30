/* Shared combat rules used by Story, Arena, VS CPU, and local battles. */
export const COMBAT_RULES=Object.freeze({
  step:1/60,
  koTarget:3,
  maxHealth:100,
  startEnergy:45,
  respawnEnergy:50,
  counterCost:18,
  counterCooldown:2.4,
  breakerCost:60,
  breakerCooldown:6.5,
  juggleLimit:6,
  edgePressureHits:3,
  edgePressureWindow:2.35
});

export function difficultyProfile(level='normal'){
  return Object.freeze({
    easy:{reaction:.24,mistake:.30,block:.22,combo:.36,adaptation:.35},
    normal:{reaction:.15,mistake:.14,block:.40,combo:.62,adaptation:.68},
    hard:{reaction:.095,mistake:.06,block:.58,combo:.82,adaptation:1}
  }[level]||{reaction:.15,mistake:.14,block:.40,combo:.62,adaptation:.68});
}

export function decayHabit(value,dt,rate=.35){
  return Math.max(0,(Number(value)||0)-dt*rate);
}
