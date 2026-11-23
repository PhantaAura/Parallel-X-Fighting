export const STORY_EXPERIENCE_VERSION=1;

export const STORY_EXPERIENCE_PROFILES=Object.freeze({
  1:Object.freeze({
    chapter:1,label:'THE JOURNEY BEGINS',targetMinutes:Object.freeze([35,50]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['TRAIN','TRAVEL','FIELD TRICK','RESCUE','FIGHT','ARRIVE']),
    promise:'Short, energetic, and constantly teaching through play instead of menus.'
  }),
  2:Object.freeze({
    chapter:2,label:'TOURNAMENT DAY',targetMinutes:Object.freeze([65,85]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['EXPLORE','MEET PEOPLE','PREPARE','FIGHT','COOLDOWN','CROWD REACTS','FIGHT']),
    promise:'The grounds should feel like a festival that changes after every round.'
  }),
  3:Object.freeze({
    chapter:3,label:'AFTER HOURS',targetMinutes:Object.freeze([45,65]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['OBSERVE','QUESTION','RECONSTRUCT','DESCEND','DISCOVER','ESCAPE']),
    promise:'Tighter than Chapter 2; every quiet stretch should increase suspicion.'
  }),
  4:Object.freeze({
    chapter:4,label:'ECHO REGION',targetMinutes:Object.freeze([75,95]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['ARRIVE','LEARN VILLAGE','PARTY FIELDWORK','CAVERNS','DEFENSE','RECOVER','OPTIONAL SECRET','SOLO CLIMB','BOSS','LOOKOUT']),
    promise:'The longest chapter because it has the most distinct adventure phases, not because it has more empty walking.'
  }),
  5:Object.freeze({
    chapter:5,label:'NOT A BIG DEAL',targetMinutes:Object.freeze([45,55]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['ARGUE','OBSERVE','REPLICATE','CHOOSE WHAT TO SAVE','ADAPTIVE BOSS','SHADOW LEAVES','CLONE REVEAL']),
    promise:'Three bases, three different kinds of evidence, and a reveal that changes the question.'
  }),
  6:Object.freeze({
    chapter:6,label:'THE OTHER RRVVFO',targetMinutes:Object.freeze([35,45]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['MISIDENTITY','SHARED MEMORY','MIRROR DUEL','FRIENDS DOUBT','PURSUIT','EMERALD THEFT']),
    promise:'A tighter character chapter that lets the clone’s belief feel human before the theft changes the stakes.'
  }),
  7:Object.freeze({
    chapter:7,label:'WHICH ONE IS REAL?',targetMinutes:Object.freeze([45,55]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['NETWORK ATTACK','SIPHON THREAT','CHOICE','POWER LOSS','PURGE','FAILSAFE','ALLIANCE']),
    promise:'The sacrifice has room to land, with one clear turning point and a playable ally-making fight.'
  }),
  8:Object.freeze({
    chapter:8,label:'CLASH OF SOULS',targetMinutes:Object.freeze([60,75]),cadenceMinutes:Object.freeze([2,4]),
    rhythm:Object.freeze(['INFILTRATE','BARK BREACH','WADE SCRAMBLE','PREDICTION BOSS','DOUBLE SOLAR WAVE','AFTERMATH','CO-LEADER ESCAPE']),
    promise:'The biggest finale earns its length through team roles, a three-phase Leader fight, and the paired technique payoff.'
  })
});

const CHECKPOINT_BEATS=Object.freeze({
  'rrvvfo-road-route':Object.freeze({chapter:1,kicker:'THE ROAD OPENS',title:'PICK A ROUTE',detail:'A travel choice breaks up the tutorial before the next field problem.',tone:'rrvvfo'}),
  'rrvvfo-road-fire':Object.freeze({chapter:1,kicker:'FIELD TECHNIQUE',title:'FIRE CLEARS THE WAY',detail:'The road teaches through a problem instead of another combat tutorial.',tone:'rrvvfo'}),
  'rrvvfo-road-gate':Object.freeze({chapter:1,kicker:'TRAVEL BEAT',title:'THE TOURNAMENT IS CLOSER',detail:'A short breather before the road turns into a rescue.',tone:'gold'}),
  'rrvvfo-road-cart-saved':Object.freeze({chapter:1,kicker:'WORLD CHANGED',title:'TOURNAMENT SUPPLIES SAVED',detail:'The rescued cart remains part of the road instead of vanishing after the objective.',tone:'gold'}),

  'rrvvfo-02-opening-ceremony':Object.freeze({chapter:2,kicker:'FESTIVAL PHASE',title:'THE BRACKET IS LIVE',detail:'The crowd, workers, and side activities now react to the official tournament.',tone:'gold'}),
  'rrvvfo-02-round-1':Object.freeze({chapter:2,kicker:'BETWEEN ROUNDS',title:'THE GROUNDS HAVE CHANGED',detail:'NPC dialogue, rumors, and activities update before the next match.',tone:'gold'}),
  'rrvvfo-02-quarterfinal':Object.freeze({chapter:2,kicker:'CROWD HEAT RISING',title:'QUARTERFINAL',detail:'Take a breath in the hub or head straight back to the bracket.',tone:'gold'}),
  'rrvvfo-02-bark-pouki':Object.freeze({chapter:2,kicker:'RINGSIDE STORY',title:'BARK VS POUKI',detail:'The tournament keeps moving even when Rrvvfo is not the one fighting.',tone:'gold'}),
  'rrvvfo-02-final':Object.freeze({chapter:2,kicker:'FINAL ROUND',title:'ONE LAST WALK THROUGH THE FESTIVAL',detail:'Food, friends, and the crowd get one final reaction before Plouke.',tone:'danger'}),

  'rrvvfo-03-medicalLead':Object.freeze({chapter:3,kicker:'FIRST THREAD',title:'THE MEDICAL TENT DOES NOT ADD UP',detail:'A small inconsistency gives the investigation somewhere concrete to go.',tone:'mystery'}),
  'rrvvfo-03-bracketRecords':Object.freeze({chapter:3,kicker:'EVIDENCE CONNECTED',title:'THE BRACKET HAS A PATTERN',detail:'The mystery advances by combining observations, not by walking to another marker.',tone:'mystery'}),
  'rrvvfo-03-strangeManLead':Object.freeze({chapter:3,kicker:'NEW LEAD',title:'THE STRANGE MAN LEFT A TRAIL',detail:'The empty tournament grounds now point somewhere below the arena.',tone:'mystery'}),
  'rrvvfo-03-sageExplanation':Object.freeze({chapter:3,kicker:'THEORY FORMED',title:'THE CLUES AGREE',detail:'Investigation gives way to infiltration.',tone:'mystery'}),
  'rrvvfo-03-sageSeparated':Object.freeze({chapter:3,kicker:'PRESSURE SPIKE',title:'THE FACILITY SPLITS THE TEAM',detail:'The quiet investigation turns into a hostile escape route.',tone:'danger'}),
  'rrvvfo-03-projectHollow':Object.freeze({chapter:3,kicker:'DISCOVERY',title:'PROJECT HOLLOW',detail:'The mystery finally has a name, but not an answer.',tone:'danger'}),
  'rrvvfo-03-teleporterActivated':Object.freeze({chapter:3,kicker:'ESCAPE',title:'NO WAY BACK THROUGH THE ARENA',detail:'The chapter ends by changing the journey itself, not by returning to the same hub.',tone:'mystery'}),

  'rrvvfo-04-villageReached':Object.freeze({chapter:4,kicker:'NEW REGION',title:'ECHO VILLAGE',detail:'Slow down long enough to understand how the village works before the crisis begins.',tone:'echo'}),
  'rrvvfo-04-barkWadeArrive':Object.freeze({chapter:4,kicker:'PARTY REUNITED',title:'BARK + WADE',detail:'The middle of the chapter becomes a three-ninja field adventure.',tone:'echo'}),
  'rrvvfo-04-beaconRestored':Object.freeze({chapter:4,kicker:'WORLD CHANGED',title:'THE BEACON IS ALIVE AGAIN',detail:'Echo Village visibly reacts to the team repair.',tone:'echo'}),
  'rrvvfo-04-cavernsEntered':Object.freeze({chapter:4,kicker:'NEW LAYER',title:'ECHO CAVERNS',detail:'The chapter leaves the village hub before returning with something that changes it.',tone:'echo'}),
  'rrvvfo-04-liftPartsRecovered':Object.freeze({chapter:4,kicker:'ROUTE RESTORED',title:'THE MOUNTAIN LIFT CAN MOVE',detail:'The cavern objective directly changes what the village can do.',tone:'echo'}),
  'rrvvfo-04-villageDefended':Object.freeze({chapter:4,kicker:'AFTERMATH',title:'LET ECHO VILLAGE BREATHE',detail:'Villagers return, the party can recover, and the optional secret opens before the solo climb.',tone:'victory'}),
  'rrvvfo-04-mountainEntered':Object.freeze({chapter:4,kicker:'SOLO PHASE',title:'RRVVFO CLIMBS ALONE',detail:'The party chapter deliberately narrows into a quieter mountain route.',tone:'echo'}),
  'rrvvfo-04-mountainSignals':Object.freeze({chapter:4,kicker:'THE TRAIL CONVERGES',title:'PROJECT HOLLOW IS WATCHING THE LOOKOUT',detail:'Exploration turns into a readable boss setup.',tone:'danger'}),
  'rrvvfo-04-hollowWatcherDefeated':Object.freeze({chapter:4,kicker:'BOSS CLEARED',title:'THE SUMMIT IS OPEN',detail:'One last field problem remains: the lookout is floating.',tone:'danger'}),
  'rrvvfo-04-lookoutReached':Object.freeze({chapter:4,kicker:'DESTINATION REACHED',title:'SHADOW’S LOOKOUT',detail:'The longest chapter ends on a technique payoff instead of another hallway.',tone:'echo'}),
  'rrvvfo-05-shadow-briefing':Object.freeze({chapter:5,kicker:'THE ARGUMENT',title:'SHADOW WANTS PROOF',detail:'Rrvvfo turns suspicion into three separate field investigations.',tone:'mystery'}),
  'rrvvfo-05-observation-site':Object.freeze({chapter:5,kicker:'BASE 1',title:'THE RED IS RECORDING THE CROWD',detail:'Its models track match context as well as fighting styles.',tone:'mystery'}),
  'rrvvfo-05-replication-lab':Object.freeze({chapter:5,kicker:'BASE 2',title:'PATTERNS ARE BECOMING PEOPLE',detail:'Biological compatibility and memory transfer point to a living duplicate.',tone:'danger'}),
  'rrvvfo-05-archive-outpost':Object.freeze({chapter:5,kicker:'BASE 3',title:'HOLLOW MIMIC DEFEATED',detail:'The archive ties Project Hollow to the Organization of the Red.',tone:'danger'}),
  'rrvvfo-06-mirror-duel':Object.freeze({chapter:6,kicker:'IDENTITY',title:'THE OTHER RRVVFO',detail:'A mirrored fight ends when Rrvvfo chooses not to finish his double.',tone:'mystery'}),
  'rrvvfo-06-red-extraction':Object.freeze({chapter:6,kicker:'THE REAL OBJECTIVE',title:'VIREK’S EMERALD IS GONE',detail:'The clone encounter covered the Red’s theft and worldwide activation.',tone:'danger'}),
  'rrvvfo-07-blocker-choice':Object.freeze({chapter:7,kicker:'THE TURNING POINT',title:'RRVVFO TAKES THE DRAIN',detail:'He gives up his power to keep Bark and Wade out of the siphon.',tone:'danger'}),
  'rrvvfo-07-failsafe-and-choice':Object.freeze({chapter:7,kicker:'ONE USE',title:'THE CLONE GETS TO CHOOSE',detail:'The Sage’s planted failsafe works; Rrvvfo’s choice changes the clone’s mind.',tone:'victory'}),
  'rrvvfo-08-red-leader':Object.freeze({chapter:8,kicker:'FINAL BATTLE',title:'THE RED LEADER',detail:'Three phases peel away prediction, Emerald power, and the network.',tone:'danger'}),
  'rrvvfo-08-double-solar-wave':Object.freeze({chapter:8,kicker:'PAIRED TECHNIQUE',title:'DOUBLE SOLAR WAVE',detail:'Both Rrvvfos synchronize without canceling one another.',tone:'victory'}),
  'rrvvfo-08-co-leader-escape':Object.freeze({chapter:8,kicker:'SEASON FINALE',title:'THE EMERALD IS FREE',detail:'The takeover ends; the Co-Leader escapes with the next threat.',tone:'victory'})
});

export function storyExperienceProfile(chapter=1){return STORY_EXPERIENCE_PROFILES[Math.max(1,Math.min(8,Number(chapter)||1))]}
export function storyTargetMinutes(chapter=1){return[...storyExperienceProfile(chapter).targetMinutes]}
export function storyChapterIsLongest(chapter=1){const own=storyExperienceProfile(chapter).targetMinutes[1];return Object.values(STORY_EXPERIENCE_PROFILES).every(profile=>own>=profile.targetMinutes[1])}
export function storyExperienceBeat(checkpoint=''){return CHECKPOINT_BEATS[String(checkpoint)]||null}
export function storyExperienceRhythm(chapter=1){return[...storyExperienceProfile(chapter).rhythm]}

export function storyRankReaction(rank='E'){
  const safe=String(rank||'E').toUpperCase();
  if(safe==='S')return Object.freeze({kind:'celebration',type:'rank',tone:'level',kicker:'S RANK!',title:'CLEAN FIGHT',detail:'Strong execution without stopping the Story flow.',items:['MASTERY RECORDED']});
  if(safe==='A')return Object.freeze({kind:'arrival',kicker:'A RANK',title:'SHARP FIGHT',detail:'The adventure keeps moving.',tone:'gold',duration:1800});
  return null;
}
