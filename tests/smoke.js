import {ROSTER_IDS,isMirrorMatch} from '../js/roster.js';
import {InputManager} from '../js/input.js';
import {TimerRegistry,calculateFinalDamage} from '../js/combat.js';
import {EffectSystem} from '../js/effects.js';
import {Fighter} from '../js/fighter.js';
import {trainingState,resetTrainingWorld,dummyCommand} from '../js/training.js';

const results=[],assert=(condition,message)=>{if(!condition)throw new Error(message)};
async function test(name,fn){try{await fn();results.push({name,pass:true})}catch(error){results.push({name,pass:false,error:error.message})}}
function makeWorld(){
  return{width:960,height:540,ground:430,fighters:[],projectiles:[],effects:new EffectSystem(),timers:new TimerRegistry(),shake:0,hitstop:0,training:trainingState,sound:()=>{}};
}
function pair(a='rrvvfo',b='revvfo'){const world=makeWorld(),one=new Fighter(a,1,false,world),two=new Fighter(b,2,false,world);world.fighters=[one,two];one.x=300;two.x=345;return{world,one,two}}

await test('loads the complete roster',()=>assert(ROSTER_IDS.length===14,`expected 14, got ${ROSTER_IDS.length}`));
await test('preserves mirror-match restriction',()=>{assert(isMirrorMatch('rrvvfo','rrvvfo'),'same fighters must be mirrors');assert(!isMirrorMatch('rrvvfo','bark'),'different fighters must be allowed')});
await test('combines keyboard with an idle controller',()=>{const idle={axes:[0],buttons:Array.from({length:16},()=>({pressed:false}))},input=new InputManager(()=>[idle]);input.setKeyboard('KeyA',true);input.poll();assert(input.down('KeyA'),'idle gamepad cleared keyboard input')});
await test('keeps quick keyboard taps between frames',()=>{const input=new InputManager(()=>[]);input.setKeyboard('KeyH',true);input.setKeyboard('KeyH',false);input.poll();assert(input.consume('KeyH'),'quick tap was lost before polling')});
await test('applies three-hit light combo and scaling',()=>{const{one,two}=pair();for(let i=0;i<3;i++){one.attackCd=one.windup=0;one.attack('light');one.windup=0;one.resolveAttack()}assert(one.combo.hits===3,`expected 3 hits, got ${one.combo.hits}`);assert(one.combo.scale<1,'third hit did not scale')});
await test('launches into an air attack',()=>{const{one,two}=pair();one.attack('launcher');one.windup=0;one.resolveAttack();assert(two.vy<0,'launcher did not lift defender');one.attackCd=0;one.grounded=0;one.y=two.y-15;one.attack('air');one.windup=0;assert(one.resolveAttack(),'air follow-up did not connect')});
await test('reports actual post-defense damage',()=>{const result=calculateFinalDamage({base:20,hit:2,defense:2,armor:true,blocked:false});assert(Math.abs(result.final-4.95)<.001,`unexpected final damage ${result.final}`)});
await test('fully resets Training state and delayed work',()=>{const{world,one,two}=pair();world.projectiles.push({});world.effects.add({t:'slash',l:20});world.effects.burst(1,1,'#fff');world.timers.schedule(()=>{},10000);Object.assign(one,{lens:20,armor:20,aura:20,trap:20,freeze:20,inv:20,stun:20,knockdown:20,getup:20,windup:20,attackCd:20,airDashes:1,juggles:3,lightChain:2});trainingState.enabled=true;resetTrainingWorld(world);assert(world.projectiles.length===0&&world.effects.effects.length===0&&world.effects.particles.length===0&&world.timers.size===0,'transient world state leaked');assert([one,two].every(f=>f.x===(f.side===1?150:762)&&f.lens===0&&f.attackCd===0&&f.lightChain===0),'fighter state did not reset')});
await test('keeps non-CPU dummy modes stationary and passive',()=>{for(const mode of ['never','always','after','stationary']){trainingState.dummy=mode;trainingState.afterFirstHit=mode==='after';const command=dummyCommand();assert(!['a','h','x','s','u','d','j'].some(action=>command.pressed(action)),`${mode} dummy attacked`);assert(!command.down('l')&&!command.down('r'),`${mode} dummy moved`)}trainingState.dummy='never';assert(!dummyCommand().down('b'),'Never Block blocked');trainingState.dummy='always';assert(dummyCommand().down('b'),'Always Block did not block')});
await test('Lens sacrifices 50 HP and floors at one',()=>{const{one}=pair();one.hp=34;one.en=100;one.ultimate();assert(one.hp===1,`expected 1 HP, got ${one.hp}`);assert(one.en===10&&one.lens===240,'Lens energy or duration incorrect');assert(one.aura===0,'Flow State must remain separate')});

const failed=results.filter(result=>!result.pass),output=results.map(result=>`${result.pass?'PASS':'FAIL'}  ${result.name}${result.error?` — ${result.error}`:''}`).join('\n');
document.getElementById('results').textContent=`${output}\n\n${results.length-failed.length}/${results.length} passing`;document.getElementById('results').className=failed.length?'fail':'pass';
window.__SMOKE_RESULTS__={results,passed:results.length-failed.length,failed:failed.length};
if(failed.length)console.error('Smoke tests failed',failed);else console.info(`Smoke tests passed: ${results.length}`);
