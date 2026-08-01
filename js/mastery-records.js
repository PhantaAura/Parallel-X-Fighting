export const MASTERY_RECORDS_KEY='pxMasteryRecordsV1';
export const MASTERY_RECORDS_VERSION=1;

export const MASTERY_RANKS=Object.freeze([
  Object.freeze({id:'S',min:90,label:'MASTERED'}),
  Object.freeze({id:'A',min:75,label:'EXCELLENT'}),
  Object.freeze({id:'B',min:60,label:'STRONG'}),
  Object.freeze({id:'C',min:45,label:'SOLID'}),
  Object.freeze({id:'D',min:25,label:'ROUGH'}),
  Object.freeze({id:'E',min:0,label:'NEEDS WORK'})
]);

export const MASTERY_CHALLENGES=Object.freeze({
  parry:Object.freeze({id:'parry',label:'PARRY READER',fighter:'all',goal:'Perfect-parry three attacks in Training.',reward:'Sage Archive Badge • Parry Reader'}),
  charge:Object.freeze({id:'charge',label:'ENERGY DISCIPLINE',fighter:'all',goal:'Reach full Energy without moving.',reward:'Training Medal • Still Mind'}),
  recovery:Object.freeze({id:'recovery',label:'FOCUS RECOVERY',fighter:'all',goal:'Recover 5 HP safely with Focus Recovery.',reward:'Training Medal • Second Wind'}),
  combo:Object.freeze({id:'combo',label:'CHASE ROUTE',fighter:'all',goal:'Launcher → Pursuit → follow-up.',reward:'Training Medal • Pursuit Student'}),
  finisher:Object.freeze({id:'finisher',label:'IDEAL PURSUIT',fighter:'all',goal:'Launcher → Dash → Light → Heavy.',reward:'Victory Tag • Clean Pursuit'}),
  wall:Object.freeze({id:'wall',label:'WALL PRESSURE',fighter:'all',goal:'Cause one wall splat.',reward:'Training Medal • Wall Reader'}),
  bounce:Object.freeze({id:'bounce',label:'GROUND BOUNCE',fighter:'all',goal:'Trigger one ground bounce.',reward:'Training Medal • Bounce Route'}),
  escape:Object.freeze({id:'escape',label:'PURSUIT ESCAPE',fighter:'all',goal:'Tech an incoming pursuit.',reward:'Training Medal • Escape Artist'}),
  pressure:Object.freeze({id:'pressure',label:'PRESSURE ANSWER',fighter:'all',goal:'Escape two pursuits, then punish.',reward:'Title • Pressure Answer'}),
  guard:Object.freeze({id:'guard',label:'BREAK & PUNISH',fighter:'all',goal:'Break guard, then land a grab.',reward:'Training Medal • Guard Cracker'}),
  variation:Object.freeze({id:'variation',label:'UNPREDICTABLE ROUTE',fighter:'all',goal:'Connect five different actions.',reward:'Title • Route Improviser'}),
  rrvvfoIdentity:Object.freeze({id:'rrvvfoIdentity',label:'IMPROVISED ANGLE',fighter:'rrvvfo',goal:'Object Swap into a close-range conversion.',reward:'Rrvvfo Victory Aura • Ember Angle'}),
  revvfoIdentity:Object.freeze({id:'revvfoIdentity',label:'RELENTLESS PRESSURE',fighter:'revvfo',goal:'Connect three close actions before pressure expires.',reward:'Revvfo Victory Aura • Astrylte Pressure'}),
  wadeIdentity:Object.freeze({id:'wadeIdentity',label:'LIGHTNING NEAR-MISS',fighter:'wade',goal:'Dash through an active strike without being hit.',reward:'Wade Victory Aura • Flash Trail'}),
  barkIdentity:Object.freeze({id:'barkIdentity',label:'ARMORED PUNISH',fighter:'bark',goal:'Absorb a hit with armor, then punish.',reward:'Bark Victory Aura • Stone Pulse'})
});

const FIGHTER_IDS=Object.freeze(['rrvvfo','revvfo','wade','bark']);
const RANK_IDS=Object.freeze(['E','D','C','B','A','S']);
const numeric=value=>Math.max(0,Number(value)||0);
const rankValue=rank=>({E:1,D:2,C:3,B:4,A:5,S:6}[String(rank||'').toUpperCase()]||0);
const unique=list=>[...new Set(Array.isArray(list)?list.filter(item=>typeof item==='string'):[])];

function fighterDefaults(){return{matches:0,wins:0,losses:0,finalKos:0,perfectParries:0,guardBreaks:0,pursuitFinishers:0,wallSplats:0,groundBounces:0,signatures:0,bestCombo:0,bestRank:'',masteryPoints:0}}
export function defaultMasteryRecords(){return{version:MASTERY_RECORDS_VERSION,totalMatches:0,totalWins:0,totalLosses:0,totalFinalKos:0,totalPerfectParries:0,totalGuardBreaks:0,totalPursuitFinishers:0,totalWallSplats:0,totalGroundBounces:0,totalSignatures:0,bestCombo:0,medals:[],rewards:[],challenges:{},fighters:Object.fromEntries(FIGHTER_IDS.map(id=>[id,fighterDefaults()])),lastBattle:null,updatedAt:Date.now()}}

function storageOrDefault(storage){try{return storage||globalThis.localStorage}catch{return null}}
export function normalizeMasteryRecords(value={}){
  const fallback=defaultMasteryRecords(),fighters={};
  for(const id of FIGHTER_IDS){const entry=value?.fighters?.[id]||{};fighters[id]={...fighterDefaults(),...entry,matches:numeric(entry.matches),wins:numeric(entry.wins),losses:numeric(entry.losses),finalKos:numeric(entry.finalKos),perfectParries:numeric(entry.perfectParries),guardBreaks:numeric(entry.guardBreaks),pursuitFinishers:numeric(entry.pursuitFinishers),wallSplats:numeric(entry.wallSplats),groundBounces:numeric(entry.groundBounces),signatures:numeric(entry.signatures),bestCombo:numeric(entry.bestCombo),masteryPoints:numeric(entry.masteryPoints),bestRank:numeric(entry.matches)>0&&RANK_IDS.includes(entry.bestRank)?entry.bestRank:''}}
  const challenges={};
  for(const [id,challenge] of Object.entries(MASTERY_CHALLENGES)){const entry=value?.challenges?.[id]||{};challenges[id]={completed:Boolean(entry.completed),grade:RANK_IDS.includes(entry.grade)?entry.grade:'',fighterId:FIGHTER_IDS.includes(entry.fighterId)?entry.fighterId:(challenge.fighter==='all'?'rrvvfo':challenge.fighter),completedAt:numeric(entry.completedAt)}}
  return{...fallback,...value,version:MASTERY_RECORDS_VERSION,totalMatches:numeric(value.totalMatches),totalWins:numeric(value.totalWins),totalLosses:numeric(value.totalLosses),totalFinalKos:numeric(value.totalFinalKos),totalPerfectParries:numeric(value.totalPerfectParries),totalGuardBreaks:numeric(value.totalGuardBreaks),totalPursuitFinishers:numeric(value.totalPursuitFinishers),totalWallSplats:numeric(value.totalWallSplats),totalGroundBounces:numeric(value.totalGroundBounces),totalSignatures:numeric(value.totalSignatures),bestCombo:numeric(value.bestCombo),medals:unique(value.medals),rewards:unique(value.rewards),challenges,fighters,updatedAt:numeric(value.updatedAt)||Date.now()}
}
export function loadMasteryRecords(storage=storageOrDefault()){try{return normalizeMasteryRecords(JSON.parse(storage?.getItem?.(MASTERY_RECORDS_KEY)||'null')||{})}catch{return defaultMasteryRecords()}}
export function saveMasteryRecords(records,storage=storageOrDefault()){const next=normalizeMasteryRecords({...records,updatedAt:Date.now()});try{storage?.setItem?.(MASTERY_RECORDS_KEY,JSON.stringify(next))}catch{}return next}

export function battleMasteryRank(score=0){const value=Math.max(0,Math.min(100,Math.round(Number(score)||0)));return MASTERY_RANKS.find(rank=>value>=rank.min)?.id||'E'}
export function masteryRankLabel(rank='E'){return MASTERY_RANKS.find(entry=>entry.id===rank)?.label||'COMPLETED'}
export function createBattleMasterySession({fighterId='rrvvfo',opponentId='revvfo',stageId='dojo',mode='cpu'}={}){return{fighterId:FIGHTER_IDS.includes(fighterId)?fighterId:'rrvvfo',opponentId,stageId,mode,startedAt:Date.now(),damageDealt:0,damageTaken:0,hits:0,bestCombo:0,perfectParries:0,guardBreaks:0,pursuitFinishers:0,wallSplats:0,groundBounces:0,signatures:0,finalKos:0,projectileHits:0,uniqueActions:[],finalized:false,result:null}}
export function recordBattleMasteryEvent(session,event,detail={}){
  if(!session||session.finalized)return session;
  if(event==='hit'){session.hits++;session.damageDealt+=numeric(detail.damage);session.bestCombo=Math.max(session.bestCombo,numeric(detail.combo));if(detail.kind==='projectile'||detail.kind==='ultimate')session.projectileHits++;const kind=String(detail.kind||'').trim();if(kind&&!session.uniqueActions.includes(kind))session.uniqueActions.push(kind)}
  else if(event==='damageTaken')session.damageTaken+=numeric(detail.damage);
  else if(event==='perfectParry')session.perfectParries++;
  else if(event==='guardBreak')session.guardBreaks++;
  else if(event==='pursuitFinisher')session.pursuitFinishers++;
  else if(event==='wallSplat')session.wallSplats++;
  else if(event==='groundBounce')session.groundBounces++;
  else if(event==='signature')session.signatures++;
  else if(event==='finalKo')session.finalKos++;
  return session;
}
function scoreBattle(session,{won=false,scoreFor=0,scoreAgainst=0}={}){
  let score=won?42:20;
  score+=Math.min(16,session.bestCombo*2);
  score+=Math.min(10,session.perfectParries*5);
  score+=Math.min(8,session.guardBreaks*4);
  score+=Math.min(8,session.pursuitFinishers*4);
  score+=Math.min(6,session.signatures*3);
  score+=Math.min(5,session.wallSplats*2+session.groundBounces*2);
  score+=Math.min(5,session.uniqueActions.length);
  if(won&&session.damageTaken<=25)score+=8;
  if(won&&scoreAgainst===0)score+=5;
  if(session.damageTaken>85)score-=8;
  return Math.max(0,Math.min(100,Math.round(score)));
}
function masteryPointAward(rank,won){return({S:12,A:9,B:6,C:3,D:2,E:1}[rank]||1)+(won?2:0)}
function milestoneRewards(records){
  const count=Object.values(records.challenges).filter(entry=>entry.completed).length;
  const milestones=[[1,'Title • Rookie Challenger'],[4,'Title • Arena Student'],[8,'Title • Technique Hunter'],[12,'Title • Battle Scholar'],[15,'Sage’s Mastery Crest']];
  for(const [need,reward] of milestones)if(count>=need&&!records.rewards.includes(reward))records.rewards.push(reward);
}
export function finalizeBattleMastery(session,{won=false,scoreFor=0,scoreAgainst=0,storage=storageOrDefault()}={}){
  if(!session)return null;if(session.finalized)return session.result;
  const score=scoreBattle(session,{won,scoreFor,scoreAgainst}),rank=battleMasteryRank(score),points=masteryPointAward(rank,won),records=loadMasteryRecords(storage),fighter=records.fighters[session.fighterId]||fighterDefaults();
  records.totalMatches++;fighter.matches++;if(won){records.totalWins++;fighter.wins++}else{records.totalLosses++;fighter.losses++}
  records.totalFinalKos+=session.finalKos;records.totalPerfectParries+=session.perfectParries;records.totalGuardBreaks+=session.guardBreaks;records.totalPursuitFinishers+=session.pursuitFinishers;records.totalWallSplats+=session.wallSplats;records.totalGroundBounces+=session.groundBounces;records.totalSignatures+=session.signatures;records.bestCombo=Math.max(records.bestCombo,session.bestCombo);
  fighter.finalKos+=session.finalKos;fighter.perfectParries+=session.perfectParries;fighter.guardBreaks+=session.guardBreaks;fighter.pursuitFinishers+=session.pursuitFinishers;fighter.wallSplats+=session.wallSplats;fighter.groundBounces+=session.groundBounces;fighter.signatures+=session.signatures;fighter.bestCombo=Math.max(fighter.bestCombo,session.bestCombo);fighter.masteryPoints+=points;if(rankValue(rank)>rankValue(fighter.bestRank))fighter.bestRank=rank;
  records.fighters[session.fighterId]=fighter;records.lastBattle={fighterId:session.fighterId,opponentId:session.opponentId,stageId:session.stageId,won:Boolean(won),rank,score,points,at:Date.now(),stats:{bestCombo:session.bestCombo,perfectParries:session.perfectParries,guardBreaks:session.guardBreaks,pursuitFinishers:session.pursuitFinishers,signatures:session.signatures,damageTaken:Math.round(session.damageTaken)}};milestoneRewards(records);saveMasteryRecords(records,storage);
  session.finalized=true;session.result={rank,score,points,won,records:normalizeMasteryRecords(records),stats:{...records.lastBattle.stats}};return session.result;
}

export function recordMasteryChallenge(fighterId,challengeId,{grade='A',storage=storageOrDefault()}={}){
  const challenge=MASTERY_CHALLENGES[challengeId];if(!challenge)return{changed:false,records:loadMasteryRecords(storage)};
  const id=FIGHTER_IDS.includes(fighterId)?fighterId:(challenge.fighter==='all'?'rrvvfo':challenge.fighter),records=loadMasteryRecords(storage),current=records.challenges[challengeId]||{completed:false,grade:''},nextGrade=RANK_IDS.includes(grade)?grade:'A';
  const first=!current.completed,better=rankValue(nextGrade)>rankValue(current.grade);if(!first&&!better)return{changed:false,first:false,records};
  records.challenges[challengeId]={completed:true,grade:better||first?nextGrade:current.grade,fighterId:id,completedAt:current.completedAt||Date.now()};
  if(first){records.medals.push(`Mastery Medal • ${challenge.label}`);records.rewards.push(challenge.reward);const fighter=records.fighters[id]||fighterDefaults();fighter.masteryPoints+=8;records.fighters[id]=fighter}
  milestoneRewards(records);return{changed:true,first,challenge,records:saveMasteryRecords(records,storage)};
}

export function masterySummary(records=loadMasteryRecords()){
  const normalized=normalizeMasteryRecords(records),completed=Object.values(normalized.challenges).filter(entry=>entry.completed).length,total=Object.keys(MASTERY_CHALLENGES).length;
  const best=FIGHTER_IDS.map(id=>({id,...normalized.fighters[id]})).sort((a,b)=>b.masteryPoints-a.masteryPoints)[0];
  const overallScore=Math.min(100,Math.round(completed/Math.max(1,total)*70+Math.min(30,(normalized.totalWins||0)*2))),rank=battleMasteryRank(overallScore);
  return{completed,total,percent:Math.round(completed/Math.max(1,total)*100),rank,rankLabel:masteryRankLabel(rank),bestFighter:best?.id||'rrvvfo',totalMatches:normalized.totalMatches,totalWins:normalized.totalWins,bestCombo:normalized.bestCombo,rewards:normalized.rewards.length};
}

export function renderMasteryRecords(records=loadMasteryRecords()){
  const normalized=normalizeMasteryRecords(records),summary=masterySummary(normalized),fighterNames={rrvvfo:'Rrvvfo',revvfo:'Revvfo',wade:'Wade',bark:'Bark'};
  const challengeCards=Object.values(MASTERY_CHALLENGES).map(challenge=>{const state=normalized.challenges[challenge.id]||{},fighter=challenge.fighter==='all'?'ANY FIGHTER':fighterNames[challenge.fighter]?.toUpperCase();return`<article class="masteryChallenge ${state.completed?'complete':''}"><div><small>${fighter}</small><strong>${challenge.label}</strong></div><b>${state.completed?(state.grade||'A'):'—'}</b><p>${challenge.goal}</p><span>${state.completed?'UNLOCKED • ':''}${challenge.reward}</span></article>`}).join('');
  const fighterCards=FIGHTER_IDS.map(id=>{const f=normalized.fighters[id];return`<article class="masteryFighter"><small>${fighterNames[id]}</small><strong>${f.matches?f.bestRank:'—'}</strong><span>${f.masteryPoints} MASTERY PTS</span><p>${f.wins} wins • ${f.bestCombo} best combo • ${f.signatures} signature moments</p></article>`}).join('');
  const rewards=normalized.rewards.length?normalized.rewards.map(item=>`<li>${item}</li>`).join(''):'<li>No mastery rewards yet. Complete a Training trial to earn the first one.</li>';
  return`<section class="masteryArchive"><header><div><small>COMBAT MASTERY</small><h3>ADVENTURE RECORDS</h3></div><b class="masteryOverallRank">${summary.rank}</b></header><div class="masteryStats"><span><b>${summary.completed}/${summary.total}</b> challenges</span><span><b>${normalized.totalWins}</b> wins</span><span><b>${normalized.bestCombo}</b> best combo</span><span><b>${normalized.totalPerfectParries}</b> perfect parries</span><span><b>${normalized.totalPursuitFinishers}</b> pursuit finishers</span></div><p class="masteryHint"><b>FIGHT RANKS:</b> S 90–100 • A 75–89 • B 60–74 • C 45–59 • D 25–44 • E 0–24</p><h4>FIGHTER MASTERY</h4><div class="masteryFighters">${fighterCards}</div><h4>OPTIONAL MASTERY CHALLENGES</h4><p class="masteryHint">These are never required for Story progress. Complete them from Arena Training because the fight itself is fun to master — not because the game makes you grind.</p><div class="masteryChallenges">${challengeCards}</div><h4>REWARDS</h4><ul class="masteryRewards">${rewards}</ul></section>`;
}
