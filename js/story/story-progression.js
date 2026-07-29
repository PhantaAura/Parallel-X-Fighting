import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a8-kinetic-combat-20260729';

export const STORY_LEVEL_THRESHOLDS=Object.freeze([0,100,240,420,650,930,1260,1640]);

export function storyLevelFromProgress(progress=loadLostYearProgress()){
  return Math.max(1,Number(progress?.storyLevel)||1);
}

export function storyXpFromProgress(progress=loadLostYearProgress()){
  return Math.max(0,Number(progress?.storyXp)||0);
}

export function storyAttackMultiplier(level=1){
  return 1+(Math.max(1,Number(level)||1)-1)*.025;
}

export function storyEnergyControlMultiplier(level=1){
  return 1+(Math.max(1,Number(level)||1)-1)*.02;
}

export function applyStoryProgressionToFighter(fighter,progress=loadLostYearProgress()){
  if(!fighter)return fighter;
  const level=storyLevelFromProgress(progress);
  fighter.storyLevel=level;
  fighter.storyAttackMultiplier=storyAttackMultiplier(level);
  fighter.storyEnergyControlMultiplier=storyEnergyControlMultiplier(level);
  return fighter;
}

export function addStoryXp(amount,{source='STORY PROGRESS',persist=true,replay=false}={}){
  const progress=loadLostYearProgress();
  const oldLevel=storyLevelFromProgress(progress);
  // Replays provide practice feedback, but do not permanently farm Story XP.
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
