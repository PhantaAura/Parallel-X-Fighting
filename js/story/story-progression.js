import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a17-chapter123-repair-icon-20260729';

export const STORY_LEVEL_THRESHOLDS=Object.freeze([0,100,240,420,650,930,1260,1640]);

export function storyLevelFromProgress(progress=loadLostYearProgress()){
  return Math.max(1,Number(progress?.storyLevel)||1);
}

export function storyXpFromProgress(progress=loadLostYearProgress()){
  return Math.max(0,Number(progress?.storyXp)||0);
}

export function normalizeStoryBonusStats(value={}){
  return Object.freeze({
    hp:Math.max(0,Math.floor(Number(value?.hp)||0)),
    power:Math.max(0,Math.floor(Number(value?.power)||0)),
    defense:Math.max(0,Math.floor(Number(value?.defense)||0)),
    speed:Math.max(0,Math.floor(Number(value?.speed)||0)),
    focus:Math.max(0,Math.floor(Number(value?.focus)||0))
  });
}

export function storyStatsForLevel(level=1,bonusStats={}){
  const safe=Math.max(1,Math.floor(Number(level)||1)),growth=safe-1,bonus=normalizeStoryBonusStats(bonusStats);
  return Object.freeze({
    level:safe,
    hp:100+growth*6+bonus.hp,
    power:10+growth*2+bonus.power,
    defense:10+growth+bonus.defense,
    speed:10+growth+bonus.speed,
    focus:10+growth*2+bonus.focus
  });
}

export function storyStatsForProgress(progress=loadLostYearProgress()){
  return storyStatsForLevel(storyLevelFromProgress(progress),progress?.storyBonusStats||{});
}

export function storyAttackMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.power-10)*.0175;
}

export function storyDefenseMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return Math.max(.72,1-(stats.defense-10)*.018);
}

export function storySpeedMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.speed-10)*.015;
}

export function storyEnergyControlMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.focus-10)*.012;
}

export function applyStoryProgressionToFighter(fighter,progress=loadLostYearProgress(),{restoreHealth=true}={}){
  if(!fighter)return fighter;
  const level=storyLevelFromProgress(progress),bonus=progress?.storyBonusStats||{},stats=storyStatsForProgress(progress);
  const previousMax=Math.max(1,Number(fighter.maxHp)||100),ratio=Math.max(0,Math.min(1,(Number(fighter.hp)||previousMax)/previousMax));
  fighter.storyLevel=level;
  fighter.storyStats=stats;
  fighter.storyAttackMultiplier=storyAttackMultiplier(level,bonus);
  fighter.storyDefenseMultiplier=storyDefenseMultiplier(level,bonus);
  fighter.storySpeedMultiplier=storySpeedMultiplier(level,bonus);
  fighter.storyEnergyControlMultiplier=storyEnergyControlMultiplier(level,bonus);
  fighter.maxHp=stats.hp;
  fighter.hp=restoreHealth?stats.hp:Math.max(1,Math.round(stats.hp*ratio));
  return fighter;
}

export function applyStoryLevelToFighter(fighter,level,{restoreHealth=true,bossHpBonus=0}={}){
  if(!fighter)return fighter;
  const stats=storyStatsForLevel(level),effectiveHp=Math.round(stats.hp*(1+Math.max(0,Number(bossHpBonus)||0)));
  fighter.storyLevel=stats.level;
  fighter.storyStats={...stats,hp:effectiveHp};
  fighter.storyAttackMultiplier=storyAttackMultiplier(stats.level);
  fighter.storyDefenseMultiplier=storyDefenseMultiplier(stats.level);
  fighter.storySpeedMultiplier=storySpeedMultiplier(stats.level);
  fighter.storyEnergyControlMultiplier=storyEnergyControlMultiplier(stats.level);
  fighter.maxHp=effectiveHp;
  if(restoreHealth)fighter.hp=effectiveHp;
  return fighter;
}

export function addStoryXp(amount,{source='STORY PROGRESS',persist=true,replay=false}={}){
  const progress=loadLostYearProgress();
  const oldLevel=storyLevelFromProgress(progress);
  if(replay||!persist)return{progress,oldLevel,newLevel:oldLevel,xp:storyXpFromProgress(progress),gained:0,source,practiceOnly:true};
  let xp=storyXpFromProgress(progress)+Math.max(0,Number(amount)||0);
  let level=oldLevel;
  while(level<STORY_LEVEL_THRESHOLDS.length&&xp>=STORY_LEVEL_THRESHOLDS[level])level++;
  const next=saveLostYearProgress({...progress,storyLevel:level,storyXp:xp});
  return{progress:next,oldLevel,newLevel:level,xp,gained:Math.max(0,Number(amount)||0),source,practiceOnly:false};
}

export function levelHudText(level,xp){
  const next=STORY_LEVEL_THRESHOLDS[level]??STORY_LEVEL_THRESHOLDS.at(-1);
  return level>=STORY_LEVEL_THRESHOLDS.length?`${xp} / MAX`:`${xp} / ${next}`;
}
