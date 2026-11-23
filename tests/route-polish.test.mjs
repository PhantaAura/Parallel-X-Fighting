import test from 'node:test';
import assert from 'node:assert/strict';
import {bindFighterAsset} from '../js/arena/fighter-assets.js';
import {questDirection,nearestMainInteraction} from '../js/story/main-quest-guidance.js';
import {chapter2MainTarget,createChapter2QuestState} from '../js/story/chapter2-hub-quests.js';
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return{promise,resolve}};

test('repeated sprite requests share one in-flight binding',async()=>{
  const pending=deferred();let calls=0;
  const battle={disposed:false,active:false,loadFighterAsset:()=>{calls++;return pending.promise}},fighter={id:'bark'};
  const first=bindFighterAsset(battle,fighter),second=bindFighterAsset(battle,fighter);
  assert.equal(first,second);await Promise.resolve();assert.equal(calls,1);
  const atlas={manifest:{}};pending.resolve(atlas);await first;
  assert.equal(fighter.asset,atlas);assert.equal(fighter.assetId,'bark');
  assert.equal(fighter.assetPendingPromise,null);
});
test('late sprite response cannot overwrite a fighter changed for the next fight',async()=>{
  const bark=deferred(),wade=deferred(),battle={loadFighterAsset:id=>id==='bark'?bark.promise:wade.promise};
  const fighter={id:'bark'},old=bindFighterAsset(battle,fighter);
  fighter.id='wade';const next=bindFighterAsset(battle,fighter);
  bark.resolve({id:'old'});await old;assert.equal(fighter.asset,null);
  const atlas={id:'new'};wade.resolve(atlas);await next;
  assert.equal(fighter.asset,atlas);assert.equal(fighter.assetId,'wade');
});
test('sprite cleared between fights is restored from the existing asset cache',async()=>{
  const atlas={id:'rrvvfo'},battle={loadFighterAsset:()=>Promise.resolve(atlas)},fighter={id:'rrvvfo'};
  await bindFighterAsset(battle,fighter);fighter.asset=null;
  await bindFighterAsset(battle,fighter);assert.equal(fighter.asset,atlas);
});
test('disposed battles reject late asset bindings',async()=>{
  const pending=deferred(),battle={disposed:false,loadFighterAsset:()=>pending.promise},fighter={id:'wade'};
  const result=bindFighterAsset(battle,fighter);battle.disposed=true;pending.resolve({});
  assert.equal(await result,null);assert.equal(fighter.asset,null);
});
test('failed loads allow retry without a request on every frame',async()=>{
  const battle={loadFighterAsset:()=>Promise.resolve(null)},fighter={id:'bark'};
  await bindFighterAsset(battle,fighter);assert.ok(fighter.assetRetryAt>Date.now());
  assert.equal(fighter.assetPendingPromise,null);
});
test('compass directions rotate with the camera',()=>{
  const player={x:0,z:0},target={x:400,z:0};
  assert.equal(questDirection(player,target,[0,10,10],[0,0,0]).angle,90);
  assert.ok(Math.abs(Math.abs(questDirection(player,target,[10,10,0],[0,0,0]).angle)-180)<1e-8);
  assert.equal(questDirection(player,{x:NaN,z:0}),null);
  assert.equal(questDirection(player,{x:20,z:20}).near,true);
});
test('optional NPCs and unrelated building doors do not hijack main investigation guidance',()=>{
  const result=nearestMainInteraction([{kind:'optional',x:0,z:1},{kind:'building-enter',x:1,z:1},{kind:'sabotage-evidence',x:500,z:50}],{x:0,z:0});
  assert.equal(result.kind,'sabotage-evidence');
});
const npcs=['announcer','fan','practice','wade','bark','bracket','exhibition','veteran','worker'].map((id,i)=>({id,label:id,x:i*100,z:0}));
const context=()=>({state:{hubQuests:createChapter2QuestState()},pacing:{orientationComplete:true},npcs});
test('tournament guidance tracks bracket recovery even beside an optional NPC',()=>{
  const c=context();assert.equal(chapter2MainTarget(c).id,'announcer');
  c.state.hubQuests.mandatory.bracket.started=true;
  assert.equal(chapter2MainTarget(c).id,'fan');
  c.state.hubQuests.mandatory.bracket.cards=['fan-card'];
  assert.equal(chapter2MainTarget(c).label,'MARKET ROOF • BRACKET CARD');
});
test('Wade tour guidance advances through the actual active race checkpoints',()=>{
  const c=context();c.state.hubQuests.mandatory.bracket.complete=true;
  Object.assign(c.state,{sageVanished:true,firstBrawlComplete:true,metBarkWade:true});
  c.race={active:true,index:2};assert.equal(chapter2MainTarget(c).id,'registration');
  c.race.active=false;assert.equal(chapter2MainTarget(c).id,'wade');
});
test('orientation shows a concrete central-plaza destination',()=>{
  const c=context();c.pacing={orientationComplete:false,visitedDistricts:[]};
  assert.equal(chapter2MainTarget(c).label,'CENTRAL PLAZA');
});
