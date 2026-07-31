export const TRAINING_TRIALS=Object.freeze({
  free:Object.freeze({id:'free',label:'Free Practice',goal:'Practice any route. No pass condition.',target:0}),
  parry:Object.freeze({id:'parry',label:'Perfect-Parry Trial',goal:'Perfect-parry three attacks.',target:3}),
  charge:Object.freeze({id:'charge',label:'Energy Discipline',goal:'Reach 100 energy while standing still.',target:100}),
  combo:Object.freeze({id:'combo',label:'Launch → Pursuit Trial',goal:'Land a launcher, pursue, then connect a follow-up.',target:3}),
  finisher:Object.freeze({id:'finisher',label:'Pursuit Finisher Trial',goal:'Launcher → pursuit → Light → Heavy finisher.',target:4}),
  wall:Object.freeze({id:'wall',label:'Wall Splat Trial',goal:'Cause one wall splat with a strong hit.',target:1}),
  bounce:Object.freeze({id:'bounce',label:'Ground Bounce Trial',goal:'Trigger one ground bounce with an aerial finisher.',target:1}),
  escape:Object.freeze({id:'escape',label:'Pursuit Escape Trial',goal:'Dash during an incoming pursuit to tech away.',target:1}),
  guard:Object.freeze({id:'guard',label:'Guard-Break Punish',goal:'Break guard, then punish with a grab.',target:2}),
  variation:Object.freeze({id:'variation',label:'Unpredictable Route',goal:'Connect five different attack or ability types.',target:5})
});

const cleanId=id=>TRAINING_TRIALS[id]?id:'free';
export function createTrainingTrialState(id='free'){
  const trial=cleanId(id);
  return{trial,progress:0,stage:0,complete:false,distinct:[],lastEvent:'',message:TRAINING_TRIALS[trial].goal};
}

export function resetTrainingTrial(state,id=state?.trial||'free'){
  const next=createTrainingTrialState(id);
  if(state&&typeof state==='object')Object.assign(state,next);
  return state||next;
}

function finish(state,message){state.complete=true;state.progress=TRAINING_TRIALS[state.trial].target;state.message=message;return{changed:true,completed:true}}

export function recordTrainingTrialEvent(state,event,detail={}){
  if(!state||state.complete||state.trial==='free')return{changed:false,completed:false};
  state.lastEvent=event;
  if(state.trial==='parry'&&event==='perfectParry'){
    state.progress=Math.min(3,state.progress+1);state.message=`Perfect parries: ${state.progress} / 3`;
    return state.progress>=3?finish(state,'Trial complete • three perfect parries'): {changed:true,completed:false};
  }
  if(state.trial==='charge'&&event==='chargeUpdate'){
    if(detail.moving){state.progress=0;state.message='Movement reset the charge trial.';return{changed:true,completed:false}}
    const value=Math.max(0,Math.min(100,Math.floor(Number(detail.energy)||0)));if(value===state.progress)return{changed:false,completed:false};
    state.progress=value;state.message=`Stationary energy: ${value} / 100`;
    return value>=100?finish(state,'Trial complete • full energy without moving'): {changed:true,completed:false};
  }
  if(state.trial==='combo'){
    if(event==='launcherHit'&&state.stage===0){state.stage=1;state.progress=1;state.message='Launcher connected • press Dash to pursue.';return{changed:true,completed:false}}
    if(event==='pursuitStart'&&state.stage===1){state.stage=2;state.progress=2;state.message='Pursuit connected • land Light or Heavy.';return{changed:true,completed:false}}
    if(event==='pursuitFollowupHit'&&state.stage===2)return finish(state,'Trial complete • launcher pursuit route');
    if(event==='whiff'&&state.stage>0){state.stage=0;state.progress=0;state.message='Route dropped • start again with a launcher.';return{changed:true,completed:false}}
  }
  if(state.trial==='finisher'){
    if(event==='launcherHit'&&state.stage===0){state.stage=1;state.progress=1;state.message='Launcher connected • Dash to pursue.';return{changed:true,completed:false}}
    if(event==='pursuitStart'&&state.stage===1){state.stage=2;state.progress=2;state.message='Pursuit started • connect Light first.';return{changed:true,completed:false}}
    if(event==='pursuitFollowupHit'&&detail.kind==='pursuitLight'&&state.stage===2){state.stage=3;state.progress=3;state.message='Light connected • press Heavy during the link window.';return{changed:true,completed:false}}
    if(event==='pursuitFinisherHit'&&state.stage===3)return finish(state,'Trial complete • linked pursuit finisher');
    if(event==='whiff'&&state.stage>0){state.stage=0;state.progress=0;state.message='Route dropped • restart with Launcher.';return{changed:true,completed:false}}
  }
  if(state.trial==='wall'&&event==='wallSplat')return finish(state,'Trial complete • wall splat');
  if(state.trial==='bounce'&&event==='groundBounce')return finish(state,'Trial complete • ground bounce');
  if(state.trial==='escape'&&event==='pursuitEscape')return finish(state,'Trial complete • pursuit escaped');
  if(state.trial==='guard'){
    if(event==='guardBreak'){state.stage=1;state.progress=1;state.message='Guard broken • land a grab before they recover.';return{changed:true,completed:false}}
    if(event==='grabHit'&&state.stage===1)return finish(state,'Trial complete • guard break into grab');
  }
  if(state.trial==='variation'&&event==='connectedAction'){
    const action=String(detail.action||'').trim();if(!action||state.distinct.includes(action))return{changed:false,completed:false};
    state.distinct.push(action);state.progress=Math.min(5,state.distinct.length);state.message=`Different connected actions: ${state.progress} / 5`;
    return state.progress>=5?finish(state,'Trial complete • five different connected actions'): {changed:true,completed:false};
  }
  return{changed:false,completed:false};
}

export function trainingTrialView(state){
  const trial=TRAINING_TRIALS[cleanId(state?.trial)],target=Math.max(1,trial.target||1),progress=Math.max(0,Number(state?.progress)||0);
  return{...trial,progress,percent:trial.id==='free'?0:Math.min(100,Math.round(progress/target*100)),complete:Boolean(state?.complete),message:state?.message||trial.goal};
}
