const freezeAttack=(kind,data)=>Object.freeze({kind,animation:kind,...data});
const set=(entries)=>Object.freeze(Object.fromEntries(Object.entries(entries).map(([kind,data])=>[kind,freezeAttack(kind,data)])));

const DEFAULT=set({
  light1:{duration:.27,activeStart:.06,activeEnd:.14,range:94,width:40,height:78,damage:5.1,guardDamage:7,knockback:23,stun:.28,hitstop:4,lunge:25,chain:true},
  light2:{duration:.29,activeStart:.07,activeEnd:.16,range:100,width:44,height:80,damage:5.5,guardDamage:8,knockback:28,stun:.30,hitstop:4,lunge:28,chain:true},
  light3:{duration:.39,activeStart:.085,activeEnd:.195,range:108,width:49,height:84,damage:8.1,guardDamage:12,knockback:66,stun:.34,hitstop:6,lunge:32,finisher:true},
  heavy:{duration:.62,activeStart:.19,activeEnd:.34,range:124,width:64,height:94,damage:13.5,guardDamage:21,knockback:104,stun:.40,hitstop:8,lunge:40,knockdown:true,launch:175,pursuitLaunch:true},
  launcher:{duration:.55,activeStart:.16,activeEnd:.285,range:101,width:50,height:108,damage:9.8,guardDamage:15,knockback:31,stun:.31,hitstop:10,lunge:30,launch:430,pursuitLaunch:true},
  airLight:{duration:.36,activeStart:.07,activeEnd:.18,range:94,width:48,height:88,damage:6.1,guardDamage:7,knockback:31,stun:.23,hitstop:5,lunge:18,air:true},
  airHeavy:{duration:.52,activeStart:.14,activeEnd:.29,range:118,width:60,height:102,damage:10.8,guardDamage:16,knockback:76,stun:.36,hitstop:8,lunge:24,air:true,knockdown:true,spike:285},
  pursuitLight:{animation:'airLight',duration:.32,activeStart:.07,activeEnd:.17,range:110,width:56,height:98,damage:7.4,guardDamage:9,knockback:54,stun:.28,hitstop:7,lunge:20,air:true,pursuit:true,launch:105},
  pursuitHeavy:{animation:'airHeavy',duration:.46,activeStart:.12,activeEnd:.26,range:122,width:64,height:112,damage:11.7,guardDamage:18,knockback:118,stun:.42,hitstop:10,lunge:24,air:true,pursuit:true,knockdown:true,spike:390,wallBounce:true}
});

export const ARENA_NORMAL_PROFILES=Object.freeze({
  default:DEFAULT,
  rrvvfo:DEFAULT,
  revvfo:set({
    light1:{...DEFAULT.light1,duration:.23,activeStart:.045,activeEnd:.125,range:99,width:43,damage:5.8,lunge:31},
    light2:{...DEFAULT.light2,duration:.25,activeStart:.05,activeEnd:.14,range:106,width:47,damage:6.2,lunge:34},
    light3:{...DEFAULT.light3,duration:.34,activeStart:.07,activeEnd:.175,range:116,width:53,damage:8.8,knockback:72,lunge:39},
    heavy:{...DEFAULT.heavy,duration:.54,activeStart:.145,activeEnd:.285,range:134,width:68,damage:14.4,guardDamage:22,knockback:112,lunge:48,launch:195},
    launcher:{...DEFAULT.launcher,duration:.48,activeStart:.12,activeEnd:.245,range:112,width:55,damage:10.4,lunge:42,launch:455},
    airLight:{...DEFAULT.airLight,duration:.31,activeStart:.055,activeEnd:.155,range:103,width:52,damage:6.8,lunge:25},
    airHeavy:{...DEFAULT.airHeavy,duration:.45,activeStart:.105,activeEnd:.245,range:126,width:64,damage:11.6,knockback:82,lunge:31},
    pursuitLight:{...DEFAULT.pursuitLight,duration:.25,range:120,damage:8.2,lunge:34},
    pursuitHeavy:{...DEFAULT.pursuitHeavy,duration:.38,range:134,damage:12.6,knockback:128,spike:420}
  }),
  wade:set({
    light1:{...DEFAULT.light1,duration:.18,activeStart:.03,activeEnd:.095,range:88,width:35,damage:3.7,guardDamage:5,knockback:16,stun:.20,lunge:28},
    light2:{...DEFAULT.light2,duration:.20,activeStart:.035,activeEnd:.105,range:92,width:37,damage:3.9,guardDamage:5,knockback:18,stun:.21,lunge:31},
    light3:{...DEFAULT.light3,duration:.25,activeStart:.045,activeEnd:.13,range:98,width:40,damage:4.8,guardDamage:7,knockback:46,stun:.26,lunge:35},
    heavy:{...DEFAULT.heavy,duration:.40,activeStart:.09,activeEnd:.205,range:111,width:52,damage:8.8,guardDamage:14,knockback:86,stun:.31,lunge:46,launch:170},
    launcher:{...DEFAULT.launcher,duration:.38,activeStart:.08,activeEnd:.19,range:96,width:43,damage:7.3,guardDamage:11,launch:470,lunge:38},
    airLight:{...DEFAULT.airLight,duration:.25,activeStart:.04,activeEnd:.13,range:91,width:43,damage:4.5,lunge:30},
    airHeavy:{...DEFAULT.airHeavy,duration:.37,activeStart:.085,activeEnd:.205,range:106,width:50,damage:8.2,knockback:68,spike:300,lunge:34},
    pursuitLight:{...DEFAULT.pursuitLight,duration:.20,activeStart:.03,activeEnd:.11,range:112,width:48,damage:5.4,lunge:45},
    pursuitHeavy:{...DEFAULT.pursuitHeavy,duration:.31,activeStart:.065,activeEnd:.18,range:118,width:54,damage:9.1,knockback:102,spike:360,lunge:42}
  }),
  bark:set({
    light1:{...DEFAULT.light1,duration:.35,activeStart:.10,activeEnd:.20,range:101,width:50,damage:7.2,guardDamage:11,knockback:31,stun:.33,lunge:20,armorStart:.06,armorEnd:.18},
    light2:{...DEFAULT.light2,duration:.39,activeStart:.115,activeEnd:.225,range:108,width:54,damage:8.1,guardDamage:13,knockback:39,stun:.36,lunge:22,armorStart:.07,armorEnd:.20},
    light3:{...DEFAULT.light3,duration:.49,activeStart:.15,activeEnd:.285,range:119,width:61,damage:10.7,guardDamage:18,knockback:82,stun:.43,lunge:26,armorStart:.08,armorEnd:.25},
    heavy:{...DEFAULT.heavy,duration:.76,activeStart:.25,activeEnd:.42,range:140,width:76,damage:17,guardDamage:29,knockback:132,stun:.50,lunge:30,launch:155,armorStart:.08,armorEnd:.34},
    launcher:{...DEFAULT.launcher,duration:.68,activeStart:.225,activeEnd:.385,range:112,width:62,damage:12,guardDamage:22,knockback:40,launch:400,lunge:23,armorStart:.09,armorEnd:.30},
    airLight:{...DEFAULT.airLight,duration:.46,activeStart:.12,activeEnd:.25,range:106,width:60,damage:9.4,knockback:47,lunge:14},
    airHeavy:{...DEFAULT.airHeavy,duration:.66,activeStart:.21,activeEnd:.39,range:132,width:72,damage:14.2,guardDamage:23,knockback:112,spike:430,lunge:17},
    pursuitLight:{...DEFAULT.pursuitLight,duration:.42,activeStart:.11,activeEnd:.24,range:124,width:68,damage:10.4,knockback:78,lunge:18},
    pursuitHeavy:{...DEFAULT.pursuitHeavy,duration:.62,activeStart:.20,activeEnd:.37,range:146,width:78,damage:15.5,guardDamage:27,knockback:154,spike:470,lunge:18,armorStart:.06,armorEnd:.28}
  }),
  sage:set({
    light1:{...DEFAULT.light1,duration:.29,activeStart:.05,activeEnd:.13,range:104,width:48,damage:5.8,lunge:20},
    light2:{...DEFAULT.light2,duration:.31,activeStart:.11,activeEnd:.19,range:116,width:52,damage:6.4,lunge:16},
    light3:{...DEFAULT.light3,duration:.44,activeStart:.07,activeEnd:.22,range:130,width:59,damage:8.6,knockback:74,lunge:12},
    heavy:{...DEFAULT.heavy,duration:.67,activeStart:.16,activeEnd:.35,range:151,width:73,damage:14.2,guardDamage:24,knockback:118,lunge:15,launch:180},
    launcher:{...DEFAULT.launcher,duration:.58,activeStart:.18,activeEnd:.31,range:123,width:60,damage:10.2,launch:435,lunge:14},
    airLight:{...DEFAULT.airLight,range:112,width:57,damage:6.8,lunge:12},
    airHeavy:{...DEFAULT.airHeavy,range:138,width:68,damage:12,knockback:94,lunge:10},
    pursuitLight:{...DEFAULT.pursuitLight,range:136,width:65,damage:8.7,lunge:12},
    pursuitHeavy:{...DEFAULT.pursuitHeavy,range:154,width:76,damage:13.2,knockback:136,spike:410,lunge:10}
  }),
  plouke:null
});

export function arenaAttackFor(fighterId,kind){
  const id=fighterId==='plouke'?'sage':fighterId;
  const profile=ARENA_NORMAL_PROFILES[id]||ARENA_NORMAL_PROFILES.default;
  return profile?.[kind]||ARENA_NORMAL_PROFILES.default[kind]||null;
}

export const SPECIAL_CATEGORIES=Object.freeze({
  shot:Object.freeze({id:'shot',label:'SHOT',description:'Fast ranged pressure. Sidestep or close the gap.'}),
  power:Object.freeze({id:'power',label:'POWER',description:'High commitment and guard damage. Punish the recovery.'}),
  trick:Object.freeze({id:'trick',label:'TRICK',description:'Movement, prediction, traps, or defensive utility.'})
});

export const RRVVFO_TACTICAL_LOADOUT=Object.freeze({
  shot:Object.freeze(['fireBlast','shotsOfAgony']),
  power:Object.freeze(['ultimate']),
  trick:Object.freeze(['objectSwap','lensOfTruth'])
});

export const ABILITY_CATEGORY=Object.freeze({
  fireBlast:'shot',shotsOfAgony:'shot',ultimate:'power',objectSwap:'trick',lensOfTruth:'trick',
  astrylteBlast:'shot',lightningBlast:'shot',lightningBeam:'power',lightningDash:'trick',thunderstorm:'trick',
  groundQuake:'power',rockArmor:'trick',earthWall:'trick',seismicCounter:'trick',rockShot:'shot',characterSpecial:'power'
});

export const ABILITY_TIMING=Object.freeze({
  fireBlast:Object.freeze({startup:.18,recovery:.24}),
  shotsOfAgony:Object.freeze({startup:.42,recovery:.52}),
  objectSwap:Object.freeze({startup:.20,recovery:.24}),
  lensOfTruth:Object.freeze({startup:.30,recovery:.34}),
  ultimate:Object.freeze({startup:.58,recovery:.62})
});

export function abilityCategory(id){return ABILITY_CATEGORY[id]||'trick'}
export function abilityTiming(id){return ABILITY_TIMING[id]||{startup:.24,recovery:.34}}
