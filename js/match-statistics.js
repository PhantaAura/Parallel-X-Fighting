const emptySide=()=>({damage:0,highestCombo:0,highestComboDamage:0,perfectBlocks:0,guardBreaks:0,throws:0,breakers:0,clashes:0,specials:0,ultimates:0,remainingHealth:100,remainingEnergy:0});
export class MatchStatistics{
  constructor(now=()=>performance.now()){this.now=now;this.reset()}
  reset(){this.startedAt=this.now();this.endedAt=0;this.players=[emptySide(),emptySide()]}
  player(side){return this.players[Math.max(0,Math.min(1,Number(side)-1))]}
  add(side,key,amount=1){const player=this.player(side);if(!(key in player))return;player[key]+=amount}
  recordDamage(side,damage,comboHits=0,comboDamage=0){const player=this.player(side);player.damage+=Math.max(0,Number(damage)||0);player.highestCombo=Math.max(player.highestCombo,comboHits||0);player.highestComboDamage=Math.max(player.highestComboDamage,comboDamage||0)}
  finish(fighters=[]){this.endedAt=this.now();fighters.forEach((fighter,index)=>{const player=this.players[index];if(!player)return;player.remainingHealth=Math.max(0,fighter.hp||0);player.remainingEnergy=Math.max(0,fighter.en||0)});return this.summary()}
  summary(){return{durationMs:Math.max(0,(this.endedAt||this.now())-this.startedAt),players:this.players.map(player=>({...player}))}}
}

export function formatMatchDuration(durationMs){const total=Math.max(0,Math.round(durationMs/1000)),minutes=Math.floor(total/60),seconds=total%60;return `${minutes}:${String(seconds).padStart(2,'0')}`}

