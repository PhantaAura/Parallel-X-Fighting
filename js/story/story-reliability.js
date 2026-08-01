export const STORY_RELIABILITY_VERSION=1;

export const STORY_CHAPTER_MISSIONS=Object.freeze({
  1:Object.freeze(['rrvvfo-00','rrvvfo-01','rrvvfo-road']),
  2:Object.freeze(['rrvvfo-02']),
  3:Object.freeze(['rrvvfo-03']),
  4:Object.freeze(['rrvvfo-04'])
});

export const STORY_CHAPTER_STARTS=Object.freeze({1:'rrvvfo-00',2:'rrvvfo-02',3:'rrvvfo-03',4:'rrvvfo-04'});
const CHAPTER4_ENDING_EVIDENCE=Object.freeze(['hollowWatcherDefeated','lookoutReached','shadowArrival','chapterSaved']);
const CHAPTER4_OLD_ENDING_EVIDENCE=Object.freeze(['hollowWatcherDefeated','lookoutReached','shadowBriefing','chapterSaved']);

function completedSet(progress){return new Set(Array.isArray(progress?.completedMissions)?progress.completedMissions:[])}
function hasAll(set,values){return values.every(value=>set.has(value))}
function chapter4EndingEvidence(progress){
  const state=progress?.chapter4State&&typeof progress.chapter4State==='object'?progress.chapter4State:{};
  const required=new Set(Array.isArray(state.requiredCompleted)?state.requiredCompleted:[]);
  const modern=CHAPTER4_ENDING_EVIDENCE.every(id=>required.has(id));
  const oldModern=CHAPTER4_OLD_ENDING_EVIDENCE.every(id=>required.has(id));
  const legacy=Boolean(
    required.size===0&&
    state.chapterComplete&&
    completedSet(progress).has('rrvvfo-04')&&
    String(progress?.lastCheckpoint||'')==='rrvvfo-04-complete'&&
    (progress?.unlocks||[]).includes('shadowLookout')
  );
  return modern||oldModern||legacy;
}

function checkpointChapter(checkpoint=''){
  const value=String(checkpoint||'');
  if(value.startsWith('rrvvfo-04'))return 4;
  if(value.startsWith('rrvvfo-03'))return 3;
  if(value.startsWith('rrvvfo-02'))return 2;
  if(value.startsWith('rrvvfo-road')||value.startsWith('rrvvfo-01')||value.startsWith('rrvvfo-00'))return 1;
  return 0;
}

function chapterStarted(progress,number){
  const completed=completedSet(progress),missions=STORY_CHAPTER_MISSIONS[number]||[];
  if(missions.some(id=>completed.has(id)))return true;
  const cp=checkpointChapter(progress?.lastCheckpoint);
  if(cp===number)return true;
  if(number===2)return Boolean(Object.keys(progress?.chapter2State||{}).length);
  if(number===3)return Boolean(Object.keys(progress?.chapter3State||{}).length);
  if(number===4)return Boolean(Object.keys(progress?.chapter4State||{}).length);
  return Boolean(progress?.routeStarted&&number===1);
}

function chapterComplete(progress,number){
  const completed=completedSet(progress),missions=STORY_CHAPTER_MISSIONS[number]||[];
  if(!missions.length||!hasAll(completed,missions))return false;
  if(number===4&&!chapter4EndingEvidence(progress))return false;
  return true;
}

function nextMission(progress){
  const completed=completedSet(progress);
  if((completed.has('rrvvfo-04')||progress?.chapter4State?.chapterComplete)&&!chapter4EndingEvidence(progress))return'rrvvfo-04';
  for(const number of [1,2,3,4])for(const mission of STORY_CHAPTER_MISSIONS[number])if(!completed.has(mission))return mission;
  return null;
}

export function inspectStoryReliability(progress={},runtime={}){
  const completed=completedSet(progress),issues=[],chapters=[];
  const rawChapter4Marked=Boolean(completed.has('rrvvfo-04')||progress?.chapter4State?.chapterComplete);
  if(rawChapter4Marked&&!chapter4EndingEvidence(progress))issues.push('Chapter 4 is marked complete without its ending evidence.');

  for(const number of [1,2,3,4]){
    const complete=chapterComplete(progress,number),started=chapterStarted(progress,number);
    if(complete&&number>1){
      for(let prior=1;prior<number;prior++)if(!chapterComplete(progress,prior))issues.push(`Chapter ${number} is complete before Chapter ${prior}.`);
    }
    chapters.push({
      number,
      started,
      complete,
      status:complete?'COMPLETE':started?'IN PROGRESS':'NOT STARTED',
      start:STORY_CHAPTER_STARTS[number],
      missions:[...(STORY_CHAPTER_MISSIONS[number]||[])]
    });
  }

  const checkpoint=String(progress?.lastCheckpoint||'rrvvfo-00'),checkpointChapterNumber=checkpointChapter(checkpoint);
  if(checkpointChapterNumber>1){
    for(let prior=1;prior<checkpointChapterNumber;prior++)if(!chapterComplete(progress,prior))issues.push(`Checkpoint is in Chapter ${checkpointChapterNumber} before Chapter ${prior} is complete.`);
  }

  const uniqueIssues=[...new Set(issues)];
  const runMode=runtime?.playtest?'PLAYTEST':runtime?.replay?'REPLAY':runtime?.active?'FIRST PLAY':'MENU';
  return{
    version:STORY_RELIABILITY_VERSION,
    health:uniqueIssues.length?'ATTENTION':'GOOD',
    issues:uniqueIssues,
    chapters,
    checkpoint,
    checkpointChapter:checkpointChapterNumber,
    nextMission:nextMission(progress),
    runMode,
    temporary:Boolean(runtime?.replay||runtime?.playtest),
    saveable:Boolean(runtime?.active&&!runtime?.replay&&!runtime?.playtest)
  };
}

export function storyReliabilitySummary(progress={},runtime={}){
  const data=inspectStoryReliability(progress,runtime);
  return `${data.health} • ${data.runMode} • ${data.saveable?'SAVEABLE':data.temporary?'TEMPORARY':'NO ACTIVE RUN'}`;
}

export const STORY_AFTERGLOW=Object.freeze({
  1:Object.freeze({
    kicker:'THE JOURNEY OPENS UP',
    title:'THE TOURNAMENT IS AHEAD',
    recap:'Rrvvfo leaves training behind with his techniques working in the field, not just inside a lesson.',
    changes:Object.freeze(['Tournament Road is behind you','VS CPU is now available','The festival becomes the next destination']),
    next:'Enter the tournament grounds when you are ready.'
  }),
  2:Object.freeze({
    kicker:'THE FESTIVAL FEELS DIFFERENT NOW',
    title:'THE RING LEFT QUESTIONS BEHIND',
    recap:'The crowd got its tournament, but Plouke, the Sage, and the damaged support system turned a fun day into something Rrvvfo cannot ignore.',
    changes:Object.freeze(['Local 2 Player is now available','Tournament NPCs remember the bracket','After-hours investigation becomes the next lead']),
    next:'Return after closing and find out what was happening under the ring.'
  }),
  3:Object.freeze({
    kicker:'THE TRAIL LEAVES THE TOURNAMENT',
    title:'PROJECT HOLLOW IS REAL',
    recap:'The empty grounds led underground, and the teleporter pushed the mystery far beyond one damaged arena.',
    changes:Object.freeze(['Arena mode is now available','Facility evidence stays in the case board','Echo Region becomes the next destination']),
    next:'Follow the remote route and learn why Shadow is connected to it.'
  }),
  4:Object.freeze({
    kicker:'ECHO REGION REMEMBERS WHAT HAPPENED',
    title:'SHADOW’S LOOKOUT REACHED',
    recap:'Rrvvfo helped Echo Village recover, crossed the mountain alone, broke the Hollow Watcher’s pattern, and reached the floating lookout.',
    changes:Object.freeze(['Echo Village remains restored','Chapter 4 records its optional discoveries','Rrvvfo’s released route now stands at 4 / 8 chapters']),
    next:'The released story pauses here until Chapter 5 is officially built.'
  })
});

export function storyAfterglowFor(number,progress={}){
  const base=STORY_AFTERGLOW[Number(number)]||STORY_AFTERGLOW[1];
  const changes=[...base.changes];
  if(Number(number)===4&&progress?.chapter4State?.ryuzankaro?.bossDefeated)changes.splice(1,0,'Ryuzankaro’s secret route is recorded');
  return{...base,changes};
}
