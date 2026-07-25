export const AUDIO_HOOKS={
  lightHit:{frequency:190,duration:.045,type:'square',volume:.025},
  heavyHit:{frequency:92,duration:.085,type:'square',volume:.045},
  launcher:{frequency:145,duration:.11,type:'sawtooth',volume:.04},
  block:{frequency:125,duration:.055,type:'triangle',volume:.03},
  perfectBlock:{frequency:760,duration:.07,type:'sine',volume:.035},
  guardBreak:{frequency:105,duration:.14,type:'square',volume:.05},
  clash:{frequency:72,duration:.16,type:'sawtooth',volume:.045},
  beamClash:{frequency:105,duration:.18,type:'sawtooth',volume:.05},
  ultimateActivate:{frequency:82,duration:.22,type:'sawtooth',volume:.05},
  ultimateImpact:{frequency:58,duration:.18,type:'square',volume:.06},
  roundStart:{frequency:330,duration:.1,type:'triangle',volume:.035},
  fight:{frequency:520,duration:.12,type:'square',volume:.04},
  ko:{frequency:68,duration:.25,type:'sawtooth',volume:.055},
  victory:{frequency:660,duration:.18,type:'triangle',volume:.04},
  counter:{frequency:410,duration:.08,type:'triangle',volume:.04},
  throw:{frequency:130,duration:.09,type:'triangle',volume:.04},
  breaker:{frequency:520,duration:.12,type:'sawtooth',volume:.045}
};

export class AudioManager{
  constructor(){this.context=null}
  tone(frequency=220,duration=.05,type='square',volume=.03){
    try{
      const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
      this.context??=new Audio();const oscillator=this.context.createOscillator(),gain=this.context.createGain();
      oscillator.type=type;oscillator.frequency.value=frequency;gain.gain.value=volume;
      oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start();
      gain.gain.exponentialRampToValueAtTime(.0001,this.context.currentTime+duration);oscillator.stop(this.context.currentTime+duration);
    }catch{}
  }
  play(name){const cue=AUDIO_HOOKS[name];if(cue)this.tone(cue.frequency,cue.duration,cue.type,cue.volume)}
}
