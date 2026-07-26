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
  ,menuMove:{frequency:330,duration:.035,type:'sine',volume:.018}
  ,menuConfirm:{frequency:520,duration:.055,type:'triangle',volume:.025}
  ,menuCancel:{frequency:180,duration:.05,type:'triangle',volume:.02}
  ,menuError:{frequency:95,duration:.08,type:'square',volume:.025}
  ,controllerConnected:{frequency:680,duration:.07,type:'sine',volume:.025}
  ,controllerDisconnected:{frequency:120,duration:.1,type:'triangle',volume:.03}
};

export class AudioManager{
  constructor(settings={}){this.context=null;this.configure(settings)}
  configure(settings={}){this.settings={master:80,music:65,sfx:85,ui:75,voice:80,mute:false,...settings};return this.settings}
  async enable(){try{const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return false;this.context??=new Audio();if(this.context.state==='suspended')await this.context.resume();return this.context.state==='running'}catch{return false}}
  tone(frequency=220,duration=.05,type='square',volume=.03,channel='sfx'){
    try{
      const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)return;
      this.context??=new Audio();const oscillator=this.context.createOscillator(),gain=this.context.createGain();
      oscillator.type=type;oscillator.frequency.value=frequency;gain.gain.value=this.settings.mute?0:volume*(this.settings.master/100)*((this.settings[channel]??this.settings.sfx)/100);
      oscillator.connect(gain);gain.connect(this.context.destination);oscillator.start();
      gain.gain.exponentialRampToValueAtTime(.0001,this.context.currentTime+duration);oscillator.stop(this.context.currentTime+duration);
    }catch{}
  }
  play(name){const cue=AUDIO_HOOKS[name],channel=/^(menu|controller)/.test(name)?'ui':'sfx';if(cue)this.tone(cue.frequency,cue.duration,cue.type,cue.volume,channel)}
  test(){this.play('lightHit');setTimeout(()=>this.play('perfectBlock'),120);setTimeout(()=>this.play('ultimateActivate'),250)}
}
