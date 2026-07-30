import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a25-feel-team-collision-20260730';

export const STORY_LEVEL_THRESHOLDS=Object.freeze([0,100,250,450,700,1000,1360,1780,2260,2810]);
export const STORY_RECOMMENDED_LEVELS=Object.freeze({1:1,2:2,3:4,4:5,5:6,6:7,7:8,8:9});

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


export function effectiveStoryBonusStats(value={}){
  const raw=normalizeStoryBonusStats(value);
  const soften=(amount,fullCap)=>Math.round(Math.min(amount,fullCap)+Math.max(0,amount-fullCap)*.25);
  return Object.freeze({
    hp:soften(raw.hp,20),
    power:soften(raw.power,4),
    defense:soften(raw.defense,4),
    speed:soften(raw.speed,4),
    focus:soften(raw.focus,4)
  });
}

export function storyStatsForLevel(level=1,bonusStats={}){
  const safe=Math.max(1,Math.floor(Number(level)||1)),growth=safe-1,bonus=effectiveStoryBonusStats(bonusStats);
  return Object.freeze({
    level:safe,
    hp:100+growth*4+bonus.hp,
    power:10+Math.round(growth*1.25)+bonus.power,
    defense:10+Math.round(growth*.75)+bonus.defense,
    speed:10+Math.round(growth*.75)+bonus.speed,
    focus:10+growth+bonus.focus
  });
}

export function storyStatsForProgress(progress=loadLostYearProgress()){
  return storyStatsForLevel(storyLevelFromProgress(progress),progress?.storyBonusStats||{});
}

export function storyAttackMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.power-10)*.014;
}

export function storyDefenseMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return Math.max(.80,1-(stats.defense-10)*.014);
}

export function storySpeedMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.speed-10)*.011;
}

export function storyEnergyControlMultiplier(level=1,bonusStats={}){
  const stats=storyStatsForLevel(level,bonusStats);
  return 1+(stats.focus-10)*.01;
}

export function recommendedStoryLevel(chapter=1){
  return STORY_RECOMMENDED_LEVELS[Math.max(1,Math.min(8,Number(chapter)||1))]||1;
}

export function catchUpXpForChapter(chapter=1,progress=loadLostYearProgress()){
  const target=recommendedStoryLevel(chapter),current=storyLevelFromProgress(progress);
  if(current>=target)return 0;
  return Math.max(0,(STORY_LEVEL_THRESHOLDS[target-1]||0)-storyXpFromProgress(progress));
}

export function storyBalanceBand(chapter=1,progress=loadLostYearProgress()){
  const current=storyLevelFromProgress(progress),recommended=recommendedStoryLevel(chapter);
  return current<recommended?'UNDER-LEVELED':current>recommended+2?'OVER-LEVELED':'ON TRACK';
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
  fighter.objectSwapRangeBonus=Math.max(0,Number(progress?.chapter4State?.rewards?.objectSwapRange)||0);
  fighter.lensMastery=Math.max(0,Number(progress?.chapter4State?.rewards?.lensMastery)||0);
  fighter.vibrationSense=Boolean(progress?.chapter4State?.rewards?.vibrationSense);
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
