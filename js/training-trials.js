export const TRAINING_TRIALS=Object.freeze({
  free:Object.freeze({id:'free',label:'Free Practice',goal:'Practice any route. No pass condition.',target:0}),
  parry:Object.freeze({id:'parry',label:'Perfect-Parry Trial',goal:'Perfect-parry three attacks.',target:3}),
  charge:Object.freeze({id:'charge',label:'Energy Discipline',goal:'Reach 100 energy while standing still.',target:100}),
  recovery:Object.freeze({id:'recovery',label:'Focus Recovery',goal:'Recover 5 HP by holding Block + Charge while stationary.',target:5}),
  combo:Object.freeze({id:'combo',label:'Launch → Pursuit Trial',goal:'Land a launcher, pursue, then connect a follow-up.',target:3}),
  finisher:Object.freeze({id:'finisher',label:'Ideal Pursuit Combo',goal:'Launcher → Dash → Light → Heavy with clean timing.',target:4}),
  wall:Object.freeze({id:'wall',label:'Wall Splat Trial',goal:'Cause one wall splat with a strong hit.',target:1}),
  bounce:Object.freeze({id:'bounce',label:'Ground Bounce Trial',goal:'Trigger one ground bounce with an aerial finisher.',target:1}),
  escape:Object.freeze({id:'escape',label:'Pursuit Escape Trial',goal:'Dash during an incoming pursuit to tech away.',target:1}),
  pressure:Object.freeze({id:'pressure',label:'Pursuit Pressure',goal:'Escape two incoming pursuits, then punish once.',target:3}),
  guard:Object.freeze({id:'guard',label:'Guard-Break Punish',goal:'Break guard, then punish with a grab.',target:2}),
  variation:Object.freeze({id:'variation',label:'Unpredictable Route',goal:'Connect five different attack or ability types.',target:5}),
  rrvvfoIdentity:Object.freeze({id:'rrvvfoIdentity',label:'Rrvvfo • Improvised Angle',goal:'Use Object Swap and connect a close attack during the angle window.',target:1}),
  revvfoIdentity:Object.freeze({id:'revvfoIdentity',label:'Revvfo • Relentless Pressure',goal:'Connect three close actions before pressure expires.',target:1}),
  wadeIdentity:Object.freeze({id:'wadeIdentity',label:'Wade • Lightning Near-Miss',goal:'Dash through an active enemy strike without taking damage.',target:1}),
  barkIdentity:Object.freeze({id:'barkIdentity',label:'Bark • Armored Punish',goal:'Absorb a hit with armor and answer before the punish window closes.',target:1})
});

const cleanId=id=>TRAINING_TRIALS[id]?id:'free';
export function pursuitTimingGrade(score=0){return score>=3?'PERFECT':score>=2?'GREAT':'GOOD'}
export function createTrainingTrialState(id='free'){
  const trial=cleanId(id);
  return{trial,progress:0,stage:0,complete:false,distinct:[],lastEvent:'',timingScore:0,techEscapes:0,message:TRAINING_TRIALS[trial].goal,grade:''};
}

export function resetTrainingTrial(state,id=state?.trial||'free'){
  const next=createTrainingTrialState(id);
  if(state&&typeof state==='object')Object.assign(state,next);
  return state||next;
}

function finish(state,message,{grade=false}={}){
  state.complete=true;state.progress=TRAINING_TRIALS[state.trial].target;
  state.grade=grade?pursuitTimingGrade(state.timingScore):'';
  state.message=state.grade?`${state.grade} • ${message}`:message;
  return{changed:true,completed:true,grade:state.grade};
}

export function recordTrainingTrialEvent(state,event,detail={}){
  if(!state||state.complete||state.trial==='free')return{changed:false,completed:false};
  state.lastEvent=event;
  if(event==='pursuitBuffer'){
    const timing=Math.max(0,Math.min(1,Number(detail.timing)||0));
    state.timingScore=Math.max(state.timingScore,timing>=.22&&timing<=.72?2:1);
    return{changed:false,completed:false};
  }
  if(state.trial==='parry'&&event==='perfectParry'){
    state.progress=Math.min(3,state.progress+1);state.message=`Perfect parries: ${state.progress} / 3`;
    return state.progress>=3?finish(state,'three perfect parries'): {changed:true,completed:false};
  }
  if(state.trial==='charge'&&event==='chargeUpdate'){
    if(detail.moving){state.progress=0;state.message='Movement reset the charge trial.';return{changed:true,completed:false}}
    const value=Math.max(0,Math.min(100,Math.floor(Number(detail.energy)||0)));if(value===state.progress)return{changed:false,completed:false};
    state.progress=value;state.message=`Stationary energy: ${value} / 100`;
    return value>=100?finish(state,'full energy without moving'): {changed:true,completed:false};
  }
  if(state.trial==='recovery'&&event==='focusRecovery'){
    const value=Math.max(0,Math.min(5,Number(detail.total)||0));if(Math.abs(value-state.progress)<.01)return{changed:false,completed:false};state.progress=value;state.message=`Health recovered: ${value.toFixed(1)} / 5`;
    return value>=5?finish(state,'five health recovered safely'):{changed:true,completed:false};
  }
  if(state.trial==='combo'){
    if(event==='launcherHit'&&state.stage===0){state.stage=1;state.progress=1;state.message='Launcher connected • press Dash during the highlighted window.';return{changed:true,completed:false}}
    if(event==='pursuitStart'&&state.stage===1){state.stage=2;state.progress=2;state.message='Locked on • buffer Light or Heavy during the chase.';return{changed:true,completed:false}}
    if(event==='pursuitFollowupHit'&&state.stage===2)return finish(state,'launcher pursuit route');
    if(event==='whiff'&&state.stage>0){state.stage=0;state.progress=0;state.message='Route dropped • start again with a launcher.';return{changed:true,completed:false}}
  }
  if(state.trial==='finisher'){
    if(event==='launcherHit'&&state.stage===0){state.stage=1;state.progress=1;state.message='1/4 • Launcher connected. Dash now.';return{changed:true,completed:false}}
    if(event==='pursuitStart'&&state.stage===1){state.stage=2;state.progress=2;state.message='2/4 • Pursuit active. Buffer Light when ATTACK READY pulses.';return{changed:true,completed:false}}
    if(event==='pursuitFollowupHit'&&detail.kind==='pursuitLight'&&state.stage===2){state.stage=3;state.progress=3;state.timingScore+=1;state.message='3/4 • Light connected. Press Heavy during the link window.';return{changed:true,completed:false}}
    if(event==='pursuitFinisherHit'&&state.stage===3){state.timingScore+=1;return finish(state,'ideal pursuit combo', {grade:true})}
    if(event==='whiff'&&state.stage>0){state.stage=0;state.progress=0;state.timingScore=0;state.message='Route dropped • restart with Launcher.';return{changed:true,completed:false}}
  }
  if(state.trial==='wall'&&event==='wallSplat')return finish(state,'wall splat');
  if(state.trial==='bounce'&&event==='groundBounce')return finish(state,'ground bounce');
  if(state.trial==='escape'&&event==='pursuitEscape')return finish(state,'pursuit escaped');
  if(state.trial==='pressure'){
    if(event==='pursuitEscape'){
      state.techEscapes=Math.min(2,state.techEscapes+1);state.progress=state.techEscapes;state.stage=state.techEscapes>=2?1:0;state.message=state.techEscapes>=2?'Two escapes complete • punish the pursuer with any clean hit.':`Pursuit escapes: ${state.techEscapes} / 2`;return{changed:true,completed:false};
    }
    if(event==='connectedAction'&&state.stage===1)return finish(state,'escaped pressure and punished');
  }
  if(state.trial==='guard'){
    if(event==='guardBreak'){state.stage=1;state.progress=1;state.message='Guard broken • land a grab before they recover.';return{changed:true,completed:false}}
    if(event==='grabHit'&&state.stage===1)return finish(state,'guard break into grab');
  }
  if(state.trial==='variation'&&event==='connectedAction'){
    const action=String(detail.action||'').trim();if(!action||state.distinct.includes(action))return{changed:false,completed:false};
    state.distinct.push(action);state.progress=Math.min(5,state.distinct.length);state.message=`Different connected actions: ${state.progress} / 5`;
    return state.progress>=5?finish(state,'five different connected actions'): {changed:true,completed:false};
  }
  const signatureEvents={rrvvfoIdentity:'signatureRrvvfo',revvfoIdentity:'signatureRevvfo',wadeIdentity:'signatureWade',barkIdentity:'signatureBark'};
  if(signatureEvents[state.trial]===event)return finish(state,TRAINING_TRIALS[state.trial].label);
  return{changed:false,completed:false};
}

export function trainingTrialView(state){
  const trial=TRAINING_TRIALS[cleanId(state?.trial)],target=Math.max(1,trial.target||1),progress=Math.max(0,Number(state?.progress)||0);
  return{...trial,progress,percent:trial.id==='free'?0:Math.min(100,Math.round(progress/target*100)),complete:Boolean(state?.complete),message:state?.message||trial.goal,grade:state?.grade||''};
}
