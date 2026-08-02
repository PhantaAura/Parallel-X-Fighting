export const QUEST_OVERHAUL_VERSION=1;

export const QUEST_AUDIT=Object.freeze({
  chapter1:Object.freeze({
    keep:['route-choice','transport-rescue','runaway-cart','roadside-fight'],
    tweak:['cliff-route-reward'],throw:[]
  }),
  chapter2:Object.freeze({
    keep:['wade-race','festival-exhibition','controlled-flame','dummy-challenge','fake-champion','challenger','prize-cart'],
    tweak:['lost-bracket','cracked-ring','lost-fan','plouke-study'],throw:[]
  }),
  chapter3:Object.freeze({
    keep:['one-last-match','controlled-flame','incident-reconstruction'],
    tweak:['unpaid-snacks','pouki-equipment','medical-followup'],
    throw:['marker-chain:finalAnnouncement','marker-chain:cleanupEchoes','marker-chain:fakePloukes','marker-chain:lateFan']
  }),
  chapter4:Object.freeze({
    keep:['beacon-team-repair','party-field-route','village-defense','ryuzankaro-boss','hollow-watcher','lookout-swap'],
    tweak:['old-man-potions','mountain-signals','lift-parts'],throw:[]
  })
});

export const CHAPTER3_REPLACEMENT_ACTIVITIES=Object.freeze({
  finalAnnouncement:Object.freeze({
    id:'finalAnnouncement',title:'THE ANNOUNCER’S FINAL ANNOUNCEMENT',kind:'signal-routing',
    prompt:'The PA system is half-disconnected. Route the final message through the only live speaker chain.',
    correct:'north-center-gate',rewardLabel:'GALLERY AUDIO'
  }),
  cleanupEchoes:Object.freeze({
    id:'cleanupEchoes',title:'CLEANUP ECHOES',kind:'echo-triangulation',
    prompt:'Three leftover energy echoes overlap around the arena. Identify the one that does not match the tournament rhythm.',
    correct:'service',rewardLabel:'ECHO RESISTANCE'
  }),
  fakePloukes:Object.freeze({
    id:'fakePloukes',title:'FAKE PLOUKES',kind:'observation',
    prompt:'The costume copies look right. Their behavior does not. Which one gives itself away?',
    correct:'edge',rewardLabel:'COMEDY COSTUME'
  }),
  lateFan:Object.freeze({
    id:'lateFan',title:'THE FAN WHO STAYED TOO LONG',kind:'route-choice',
    prompt:'The gates are closing. Pick the safest route back out without dragging the fan through the entire empty festival.',
    correct:'west',rewardLabel:'TOURNAMENT POSTER'
  })
});

export function chapter3ReplacementActivity(id){return CHAPTER3_REPLACEMENT_ACTIVITIES[id]||null}

export function chapter4PotionRoute(state={}){
  const r=state?.ryuzankaro||state||{},count=Array.isArray(r.ingredients)?r.ingredients.length:0,formula=Boolean(r.apothecaryFormula);
  return{formula,count,required:formula?2:4,ready:formula?count>=2:count>=4,label:formula?`${count} / 2 catalysts + Old Apothecary Formula`:`${count} / 4 field trials`};
}

export function chapter4PotionReady(state={}){return chapter4PotionRoute(state).ready}

export function chapter4SignalRoute(state={}){
  const count=Array.isArray(state?.mountainSignals)?state.mountainSignals.length:0;
  return{count,required:2,ready:count>=2,label:`${Math.min(count,2)} / 2 signal bearings`};
}

export function chapter4SignalsReady(state={}){return chapter4SignalRoute(state).ready}

export function chapter2BracketRoute(state={}){
  const cards=state?.mandatory?.bracket?.cards||state?.cards||[],admin=Boolean(state?.mandatory?.bracket?.adminReconstruction||state?.adminReconstruction);
  const unique=[...new Set(cards.filter(Boolean))];
  return{cards:unique.length,admin,ready:unique.length>=3||(admin&&unique.length>=2),label:admin&&unique.length>=2?`${unique.length} cards + admin reconstruction`:`${unique.length} / 3 physical records`};
}

export function questAuditSummary(){
  return Object.fromEntries(Object.entries(QUEST_AUDIT).map(([chapter,audit])=>[chapter,{keep:audit.keep.length,tweak:audit.tweak.length,throw:audit.throw.length}]));
}
