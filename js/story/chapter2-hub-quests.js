import {normalizeQuestVarietyState} from './quest-variety.js?v=29a40-core-fun-overhaul-20260801';
export const CHAPTER2_HUB_QUEST_VERSION='2.9A.21';

export const CHAPTER2_DISTRICTS=Object.freeze([
  {id:'arrival',name:'WEST GATE',x:-1510,z:80,radius:300},
  {id:'practice',name:'PRACTICE GROUNDS',x:-1120,z:560,radius:380},
  {id:'market',name:'MARKET STREET',x:-500,z:620,radius:360},
  {id:'registration',name:'REGISTRATION PLAZA',x:-120,z:-560,radius:360},
  {id:'central',name:'CENTRAL PLAZA',x:-280,z:40,radius:420},
  {id:'spectator',name:'SPECTATOR DISTRICT',x:640,z:-520,radius:390},
  {id:'stadium',name:'MAIN ARENA GATE',x:1280,z:40,radius:420}
]);

export const CHAPTER2_RACE_CHECKPOINTS=Object.freeze([
  {id:'market',label:'MARKET STREET',x:-640,z:620},
  {id:'practice',label:'PRACTICE RING',x:-1120,z:560},
  {id:'registration',label:'REGISTRATION ROOF WALK',x:-120,z:-690},
  {id:'spectator',label:'SPECTATOR DISTRICT',x:650,z:-520},
  {id:'stadium',label:'MAIN ARENA GATE',x:1125,z:40}
]);

export const CHAPTER2_SHORTCUTS=Object.freeze([
  {id:'market-to-stadium',label:'WADE SHORTCUT • STADIUM',x:-500,z:420,to:{x:1030,z:150},arrival:'MAIN ARENA GATE'},
  {id:'practice-to-registration',label:'WADE SHORTCUT • REGISTRATION',x:-1000,z:390,to:{x:-140,z:-360},arrival:'REGISTRATION PLAZA'},
  {id:'stadium-to-west',label:'WADE SHORTCUT • WEST GATE',x:1010,z:150,to:{x:-1420,z:80},arrival:'WEST GATE'}
]);

export const CHAPTER2_BRACKET_CARDS=Object.freeze([
  {id:'fan-card',label:"WADE'S CARD",source:'TOURNAMENT FAN',hint:'Ask the marked fan between Market Street and Central Plaza.'},
  {id:'vendor-card',label:"BARK'S CARD",source:'MARKET ROOF',hint:'Check the glowing card above the Market Street stalls.'},
  {id:'veteran-card',label:'QUALIFIER CARD',source:'MAINTENANCE CART',hint:'Catch the marked cart moving along the west path.'}
]);

export const CHAPTER2_RING_SUPPORTS=Object.freeze([
  {id:'west',label:'WEST SUPPORT',x:-1370,z:760,clue:'The impact direction points outward, so the damage came from inside the ring.'},
  {id:'south',label:'SOUTH SUPPORT',x:-1120,z:825,clue:'Deep boot prints repeat beside the crack in the same three-step pattern.'},
  {id:'east',label:'EAST SUPPORT',x:-870,z:760,clue:'A discarded contestant wristband is wedged behind the broken brace.'}
]);

export const CHAPTER2_PLOUKE_CLUES=Object.freeze([
  {id:'stillness',requiredFor:'quarterfinal',source:'OLD COMPETITOR',text:'Plouke barely moves until the other fighter commits first.'},
  {id:'positioning',requiredFor:'bark-pouki',source:'TOURNAMENT WORKER',text:'Every fighter who faces Plouke ends up standing exactly where he wants.'},
  {id:'timing',requiredFor:'wade',source:'BARK',text:'Plouke doesn’t overpower people immediately. He waits until their strongest option becomes predictable.'},
  {id:'edge',requiredFor:'final',source:'WADE',text:'Plouke always looks at the edge. Maybe he’s in love with it.'}
]);

export const CHAPTER2_OPTIONAL_QUESTS=Object.freeze({
  food:{id:'food',title:'CONTROLLED FLAME',giver:'FOOD VENDOR',reward:'Choose one tournament meal buff'},
  fakeChampion:{id:'fakeChampion',title:'THE FAKE CHAMPION',giver:'LOUD CHAMPION',reward:'+1 permanent Story Focus'},
  lostFan:{id:'lostFan',title:'WADE\'S BIGGEST FAN',giver:'LOST FAN',reward:'+6 permanent Story HP'},
  dummy:{id:'dummy',title:'DUMMY ON THE LOOSE',giver:'ARENA MECHANIC',reward:'+1 permanent Story Defense'},
  prizeCart:{id:'prizeCart',title:'THE MISSING PRIZE ENVELOPE',giver:'TOURNAMENT CASHIER',reward:'80 coins + discounted tournament meals'},
  challenger:{id:'challenger',title:'ONE MATCH ANYWAY',giver:'REJECTED CHALLENGER',reward:'Choose +1 Power or +1 Speed'}
});

export function createChapter2QuestState(){
  return{
    mandatory:{
      bracket:{started:false,cards:[],fanClue:false,complete:false},
      wadeRace:{started:false,complete:false,won:false,bestTime:null},
      barkRing:{started:false,supports:[],saboteurDefeated:false,complete:false},
      ploukeRumors:{clues:[],complete:false}
    },
    optional:{
      food:{started:false,orders:0,complete:false,rewardClaimed:false},
      fakeChampion:{started:false,complete:false,rewardClaimed:false},
      lostFan:{started:false,complete:false,rewardClaimed:false},
      dummy:{started:false,parries:0,pursuit:false,grab:false,complete:false,rewardClaimed:false},
      prizeCart:{started:false,complete:false,rewardClaimed:false},
      challenger:{started:false,complete:false,rewardClaimed:false,choice:null}
    },
    bonuses:{hp:0,power:0,defense:0,speed:0,focus:0,coins:0,vendorDiscount:false,meal:null},
    shortcuts:[],
    discoveredDistricts:['arrival'],
    activeQuest:null,
    variety:normalizeQuestVarietyState('chapter2'),
    completedQuestIds:[]
  };
}

function mergeObject(base,saved){
  const result={...base};
  for(const [key,value] of Object.entries(saved||{})){
    if(value&&typeof value==='object'&&!Array.isArray(value)&&base[key]&&typeof base[key]==='object'&&!Array.isArray(base[key]))result[key]=mergeObject(base[key],value);
    else result[key]=value;
  }
  return result;
}

export function normalizeChapter2QuestState(saved){
  const state=mergeObject(createChapter2QuestState(),saved||{});
  state.variety=normalizeQuestVarietyState('chapter2',saved?.variety);
  if(!Array.isArray(state.mandatory.bracket.cards))state.mandatory.bracket.cards=[];
  const arrays=[
    state.mandatory.bracket.cards,
    state.mandatory.barkRing.supports,
    state.mandatory.ploukeRumors.clues,
    state.shortcuts,
    state.discoveredDistricts,
    state.completedQuestIds
  ];
  for(const list of arrays){
    if(!Array.isArray(list))continue;
    const unique=[...new Set(list.filter(Boolean))];
    list.splice(0,list.length,...unique);
  }
  const bracket=state.mandatory.bracket;
  const validCardIds=new Set(CHAPTER2_BRACKET_CARDS.map(card=>card.id));
  if(bracket.complete){
    bracket.started=true;
    bracket.cards.splice(0,bracket.cards.length,...validCardIds);
  }else{
    const validCards=bracket.cards.filter(cardId=>validCardIds.has(cardId));
    bracket.cards.splice(0,bracket.cards.length,...validCards);
  }
  return state;
}

export function missingChapter2BracketCards(state){
  const recovered=new Set(state?.mandatory?.bracket?.cards||[]);
  return CHAPTER2_BRACKET_CARDS.filter(card=>!recovered.has(card.id));
}

export function questCompleted(state,id){
  return Boolean(state?.completedQuestIds?.includes(id));
}

export function markQuestComplete(state,id){
  if(!state.completedQuestIds.includes(id))state.completedQuestIds.push(id);
  state.activeQuest=null;
  return state;
}

export function requiredRumorCountForStep(step){
  return({quarterfinal:1,'bark-pouki':1,wade:2,final:3}[step]||0);
}

export function chapter2MandatoryReadyForTournament(state){
  const mandatory=state?.mandatory||{};
  return Boolean(mandatory.bracket?.complete&&mandatory.wadeRace?.complete&&mandatory.barkRing?.complete&&state?.variety?.festivalExhibition?.complete);
}

export function chapter2QuestSummary(state){
  const mandatory=state?.mandatory||{};
  const optional=state?.optional||{};
  return{
    mandatory:[
      {id:'bracket',title:'THE LOST BRACKET',done:Boolean(mandatory.bracket?.complete),detail:mandatory.bracket?.complete?'Bracket reconstructed':`${mandatory.bracket?.cards?.length||0} / 3 cards recovered`},
      {id:'wadeRace',title:'WADE\'S SHORTCUT',done:Boolean(mandatory.wadeRace?.complete),detail:mandatory.wadeRace?.complete?(mandatory.wadeRace.won?'Beat Wade\'s route':'Completed Wade\'s route'):'Tour the grounds with Wade'},
      {id:'barkRing',title:'THE CRACKED RING',done:Boolean(mandatory.barkRing?.complete),detail:mandatory.barkRing?.complete?'Practice ring stabilized; culprit unresolved':`${mandatory.barkRing?.supports?.length||0} / 3 supports inspected`},
      {id:'exhibition',title:'FESTIVAL TECHNIQUE EXHIBITION',done:Boolean(state?.variety?.festivalExhibition?.complete),detail:state?.variety?.festivalExhibition?.complete?(state.variety.festivalExhibition.rank||'Exhibition cleared'):'Complete the public movement-and-technique course'},
      {id:'ploukeRumors',title:'RUMORS ABOUT PLOUKE',done:Boolean(mandatory.ploukeRumors?.complete),detail:`${mandatory.ploukeRumors?.clues?.length||0} / 4 reliable clues`}
    ],
    optional:Object.entries(CHAPTER2_OPTIONAL_QUESTS).map(([key,quest])=>({id:key,title:quest.title,started:Boolean(optional[key]?.started),done:Boolean(optional[key]?.complete),detail:quest.reward}))
  };
}

export function nearestDistrict(x,z){
  const inside=CHAPTER2_DISTRICTS
    .map(district=>({district,distance:Math.hypot(x-district.x,z-district.z)}))
    .filter(entry=>entry.distance<=entry.district.radius)
    .sort((a,b)=>(a.distance/a.district.radius)-(b.distance/b.district.radius));
  if(inside.length)return inside[0].district;
  let best=CHAPTER2_DISTRICTS[0],bestDistance=Infinity;
  for(const district of CHAPTER2_DISTRICTS){
    const d=Math.hypot(x-district.x,z-district.z);
    if(d<bestDistance){best=district;bestDistance=d}
  }
  return best;
}
