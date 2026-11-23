import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a418-big-update-20261122';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a412-echo-ridge-20261122';
import {storyConfirm} from './story-ux.js?v=29a412-echo-ridge-20261122';

export const PARALLEL_ROUTES=Object.freeze([
  {id:'wade',lead:'WADE',title:'THE LONGEST SHORTCUT',color:'#55dfff',fighter:'wade',stage:'training-road',chapters:[
    ['THE FASTEST ROUTE','Wade leaves Tangai’s Dojo on a shortcut Bark says is longer. Wade claims the route only looks long when you walk it. Cross the unstable road and catch up with the others.','Bark','BARK: “That’s longer.”|WADE: “Only if you’re slow.”|The road keeps adding sections. Wade keeps calling each one faster.'],
    ["WADE’S TOURNAMENT",'Wade scouts the tournament grounds, spots Plouke watching the ring edge, and notices a second set of prints around the damaged practice ring. Then his own bracket demands his attention.','Plouke','WADE: “He keeps looking at the edge. Maybe he’s in love with it.”|The joke lands later than Wade expected.'],
    ['BREAK THROUGH','Bark and Wade reach the maintenance levels after Hollow has already flooded them with robots. Bark holds the line. Wade has to break through the shutters and find Rrvvfo.','Hollow Bruiser','BARK: “Find Rrvvfo.”|Wade runs into the sealed route, opening a path before the next wave closes it.'],
    ['KEEP THE LIGHTS ON','Days before Rrvvfo wakes, Wade reconnects Echo’s beacons and relay network. Carry power between the nodes before the charge runs out.','Hollow Scout','BARK: “Is the relay fixed?”|WADE: “There were six.”|BARK: “And?”|WADE: “They’re fixed now.”'],
    ['WRONG RRVVFO','A familiar Rrvvfo arrives in Echo before the real one. Wade notices that the visitor remembers old events as if they happened yesterday. Then two Rrvvfos stand in front of him.','Echo Mimic','WADE: “There’s two.”|BARK: “Yeah.”|WADE: “That didn’t help.”'],
    ['OUTRUN THE NETWORK','Hollow reroutes its power grid around Wade’s speed. The obvious route becomes a trap. Read the false signals, vary your approach, and shut down the relay feeding the Leader.','Red Network Warden','WADE: “Too predictable.”|Wade kills the final relay, then runs when the base starts collapsing.']
  ]},
  {id:'bark',lead:'BARK',title:'HOLD THE LINE',color:'#d1a36a',fighter:'bark',stage:'echo-village',chapters:[
    ['THE LONG ROAD','Bark leaves Tangai’s recovering Dojo after Rrvvfo has gone. Every damaged bridge and unstable wall becomes a reason to stop and help.','Road Raider','TANGAI: “Get there in one piece.”|BARK: “I will.”|WADE: “That’s boring.”|BARK: “That’s why I usually arrive.”'],
    ["BARK’S TOURNAMENT",'Bark reads the tournament ring through its supports and stress marks. One crack is pushing outward. That is wrong. He agrees to help Rrvvfo investigate after the matches.','Tournament Contender','BARK: “That crack shouldn’t be there.”|WADE: “Maybe the floor is tired.”|BARK: “The floor isn’t tired.”'],
    ['FIND RRVVFO','Bark and Wade trace Rrvvfo into the maintenance levels. Hollow closes in from every corridor. Bark holds a defensive position long enough for Wade to get through.','Hollow Wave Captain','BARK: “I’ll hold them.”|WADE: “There’s way too many.”|BARK: “Then stop standing here. Find Rrvvfo.”'],
    ['ECHO REGION','Bark arrives in Echo before Rrvvfo wakes. He helps villagers rebuild barriers, reinforce homes, and defend the beacon while Wade restores long-range communication.','Hollow Breaker','The village looks different because Bark rebuilt it. Its walls now give civilians a safe route through the attack.'],
    ['TWO RRVVFOS','The first Rrvvfo to reach Echo remembers the old days but misses later details. Bark waits for evidence. When the real Rrvvfo arrives, neither version can prove who they are.','Hollow Breacher','CLONE RRVVFO: “Come on. Let’s go.”|BARK: “No.”|The clash leaves Bark’s new defenses damaged. He stays to repair them.'],
    ['HOLD THE FOUNDATION','Hollow’s network shields the Leader with physical stabilizers. Bark tears down the supports one by one, bracing a collapsing chamber long enough to break the last anchor.','Red Foundation Guard','BARK: “You built too much on one foundation.”|The network falls. Bark returns to Echo and fixes the wall that is still broken.']
  ]},
  {id:'virek',lead:'VIREK',title:'THE EMERALD HUNT',color:'#51e7a4',fighter:'virek',stage:'tournament-hub',chapters:[
    ['YOU TOUCHED THE WRONG THING','Hollow’s copied attacks distract Virek while a suppression rig tears the Emerald from his island. He follows the carrier into a city full of lights, crowds, and buildings he decides not to punch through.','Emerald Carrier','VIREK: “They laid their filthy hands on MY Emerald.”|A civilian stops him from smashing a wall. Virek decides to walk around.'],
    ['I DON’T EVEN NEED MY FISTS','Hollow machines try to fight Virek with copied green attacks. He takes a stick from the ground and clears a path with improvised swings, then follows the carrier underground.','Emerald Carrier','VIREK: “Weaklings like you don’t even DESERVE my fists.”|The carrier channels the Emerald into the ground and blasts Virek back to the surface. Far away, Rrvvfo feels the Emerald’s signature flare through the shielding.'],
    ['ONE MAN ARMY','With the Emerald powering Hollow’s global network, Virek clears its fronts without revealing his survival. He reaches Bark’s defensive line, helps destroy the horde, then follows the last signal to Rrvvfo.','Hollow Horde Leader','VIREK: “That’s MY Emerald.”|RRVVFO: “You’re welcome.”|VIREK: “I never said thank you, weakling.”']
  ]},
  {id:'oddballs',lead:'THE ODDBALLS',title:'A VERY BAD HEIST',color:'#ffca52',fighter:'raggie',stage:'after-hours-tournament',chapters:[
    ["WE’RE GONNA BE RICH",'Jonathan wants a rare museum artifact. Jimmy comes along to keep anyone from getting hurt. Raggie slips through a narrow opening and finds a masked worker waiting inside.','Masked Worker','JIMMY: “I’m only coming so nobody gets hurt.”|JONATHAN: “Great. You can carry things.”|The team escapes with the artifact. Raggie’s Time Stone is gone.'],
    ['WHO STOLE THE THING WE STOLE?','The artifact is still safe, but Raggie’s Time Stone has vanished. The Oddballs follow paper-thin clues through vents and staff corridors until the masked worker returns.','Masked Worker','Clone Rrvvfo arrives, helps recover the Time Stone, then heads for Echo. The Oddballs follow because he says his friends are there.'],
    ['THE LONGEST SHORTCUT EVER','On the way to Echo, Jimmy is mistaken for an insult to a reenactment regiment. He has to protect bystanders and survive the mob without attacking while Raggie and Jonathan find a way through.','Regiment Captain','JIMMY: “Why do you guys always choose violence?”|Jonathan’s overbuilt distraction clears a path without anyone getting hurt.'],
    ['THERE’S TWO','The Oddballs reach Echo with Clone Rrvvfo, then the original arrives. They try to stop the “fake” from escaping, only to lose him and watch both versions confront each other.','Rrvvfo (escaping)','JONATHAN: “We won.”|JIMMY: “He left.”|The joke fades when the clone walks away believing his own story.'],
    ['CLASH OF SOULS, FROM BEHIND A ROCK','The Oddballs stumble onto Hollow’s backup relay while hiding near the final operation. They disable the redundant network, unknowingly helping the main team, then face the museum consequences.','Backup Relay Guardian','JONATHAN: “Can I blow that up?”|JIMMY: “No.”|RAGGIE: “Probably.”|Jonathan reveals he kept the real artifact.']
  ]}
]);

const routeById=id=>PARALLEL_ROUTES.find(route=>route.id===id);
const missionId=(routeId,chapter)=>`${routeId}-${String(chapter).padStart(2,'0')}`;
export const parallelMissionId=missionId;
export function parallelRouteChapterComplete(routeId,chapter,progress=loadLostYearProgress()){
  return Boolean(progress.completedMissions?.includes(missionId(routeId,chapter)));
}
export function startParallelRouteChapter(routeId,chapter,{onExit=()=>{},onComplete=()=>{},replay=false}={}){
  const route=routeById(routeId),entry=route?.chapters?.[chapter-1];
  if(!entry)throw new Error(`Unknown story chapter: ${routeId} ${chapter}`);
  return new ParallelRouteChapter(route,chapter,entry,{onExit,onComplete,replay}).start();
}

class ParallelRouteChapter{
  constructor(route,chapter,entry,{onExit,onComplete,replay=false}){Object.assign(this,{route,chapter,entry,onExit,onComplete,replay});this.resolved=false;this.lines=[]}
  start(){
    const opponent=this.entry[2],enemyId=this.route.id==='virek'?'sage':this.route.id==='oddballs'?'sage':this.route.id==='bark'?'revvfo':'sage';
    this.playerId=this.route.id==='oddballs'?['raggie','raggie','jimmy','jonathan','raggie'][this.chapter-1]:this.route.fighter;
    this.survivalLeft=this.route.id==='oddballs'&&this.chapter===3?35:0;
    this.battle=createStoryBattle({stageId:this.route.stage,opponent:{id:enemyId,name:opponent,accent:this.route.color,cpu:true}});
    this.battle.configureMatch({mode:'cpu',fighters:[this.playerId,enemyId],stageId:this.route.stage,difficulty:'normal',koTarget:1,allowRandomRematch:false});
    this.battle.allowRandomRematch=false;
    this.engine=attachStoryEngine(this.battle,{chapterLabel:`${this.route.lead} CHAPTER ${this.chapter}`,stageName:this.route.title,rootClasses:['parallelRouteChapter'],getMode:()=>this.engine?.dialogue?'dialogue':'combat'});
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:[this.route.lead,this.entry[2]]});
    this.battle.fighters[0].storySpeedMultiplier=this.route.id==='wade'?1.12:1;
    this.battle.fighters[0].maxHp=this.route.id==='bark'?145:this.playerId==='jimmy'?190:110;this.battle.fighters[0].hp=this.battle.fighters[0].maxHp;
    this.battle.fighters[1].maxHp=this.route.id==='virek'?150:this.playerId==='jimmy'?9999:105;this.battle.fighters[1].hp=this.battle.fighters[1].maxHp;
    if(this.survivalLeft>0)this.battle.notice('JIMMY • PACIFIST SURVIVAL • NO ATTACKS',3);
    this.engine.useChapterProfile({input:next=>{const command=next();if(this.survivalLeft<=0)return command;return{...command,light:false,heavy:false,launcher:false,grab:false,special:false}},castAbility:(next,slot)=>this.survivalLeft>0?false:next(slot),update:(next,dt)=>{next(dt);if(this.survivalLeft>0&&this.battle.phase==='play'){this.survivalLeft=Math.max(0,this.survivalLeft-dt);if(Math.ceil(this.survivalLeft)!==Math.ceil(this.survivalLeft+dt))this.battle.notice(`HOLD OUT • ${Math.ceil(this.survivalLeft)} SECONDS`,.75);if(this.survivalLeft<=0){this.battle.scores=[1,0];this.battle.phase='result';this.battle.showResult()}}if(this.battle.phase==='result'&&!this.resolved)this.finish()},exit:async next=>{const leave=await storyConfirm({title:'LEAVE CHAPTER?',message:'Your route progress remains saved. Leave this chapter and return to its route menu?',confirmLabel:'LEAVE'});if(leave){next();this.exit()}}});
    this.showOpening();return this;
  }
  showOpening(){
    const [title,setup]=this.entry;
    const lines=[{speaker:this.route.lead,speakerClass:'p1',text:`${title}. ${setup}`,tail:'down'}];
    this.engine.showDialogue(lines,{onComplete:()=>this.beginFight(this.entry[2])});
  }
  beginFight(opponent){this.battle.root.querySelector('[data-result]')?.classList.add('hidden');this.battle.phase='play';this.battle.time=9999;this.battle.banner(`${this.entry[0]} • ${opponent}`);this.battle.notice(`${this.route.lead} ROUTE • WIN THE ENCOUNTER`,2.5)}
  finish(){
    if(this.battle.scores[0]<=this.battle.scores[1]){
      this.resolved=true;this.battle.phase='story';
      this.engine.showDialogue([{speaker:this.route.lead,speakerClass:'p1',text:'That did not work. Take a breath, then try the encounter again.',tail:'down'}],{onComplete:()=>{this.battle.restart();this.battle.time=9999;this.resolved=false;this.beginFight(this.entry[2])}});
      return;
    }
    this.resolved=true;this.battle.phase='story';
    const progress=loadLostYearProgress(),id=missionId(this.route.id,this.chapter);
    if(!this.replay){const completedMissions=progress.completedMissions.includes(id)?progress.completedMissions:[...progress.completedMissions,id],completed=(progress.parallelRouteChapters||{}),routeDone=[...new Set([...(completed[this.route.id]||[]),this.chapter])].sort((a,b)=>a-b);saveLostYearProgress({...progress,completedMissions,parallelRouteChapters:{...completed,[this.route.id]:routeDone},selectedRoute:this.route.id,lastCheckpoint:id,routeStarted:true})}
    this.onComplete();
    const outcome=this.entry[3].split('|').map(line=>{const colon=line.indexOf(':');return colon>0?{speaker:line.slice(0,colon).toUpperCase(),speakerClass:'neutral',text:line.slice(colon+1).trim(),tail:'down'}:{speaker:this.route.lead,speakerClass:'p1',text:line,tail:'down'}});
    outcome.unshift({speaker:this.route.lead,speakerClass:'p1',text:`${this.entry[0]} complete.`,tail:'down'});
    this.engine.showDialogue(outcome,{onComplete:()=>this.exit()});
  }
  exit(){this.battle.stopMatch();this.battle.root.classList.add('hidden');destroyStoryBattle(this.battle);this.onExit()}
}
