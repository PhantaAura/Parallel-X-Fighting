export const AUDIO_HOOKS={
  lightHit:{frequency:190,duration:.045,type:'square',volume:.025},
  heavyHit:{frequency:92,duration:.085,type:'square',volume:.045},
  launcher:{frequency:145,duration:.11,type:'sawtooth',volume:.04},
  block:{frequency:125,duration:.055,type:'triangle',volume:.03},
  perfectBlock:{frequency:760,duration:.085,type:'sine',volume:.045},
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
  breaker:{frequency:520,duration:.12,type:'sawtooth',volume:.045},
  menuMove:{frequency:330,duration:.035,type:'sine',volume:.018},
  menuConfirm:{frequency:520,duration:.055,type:'triangle',volume:.025},
  menuCancel:{frequency:180,duration:.05,type:'triangle',volume:.02},
  menuError:{frequency:95,duration:.08,type:'square',volume:.025},
  controllerConnected:{frequency:680,duration:.07,type:'sine',volume:.025},
  controllerDisconnected:{frequency:120,duration:.1,type:'triangle',volume:.03}
};

const MUSIC_THEMES=Object.freeze({
  menu:{tempo:92,wave:'triangle',bass:'sine',notes:[220,277.18,329.63,277.18,196,246.94,293.66,246.94],bassNotes:[110,110,98,98],accent:'#55d9ff'},
  dojo:{tempo:104,wave:'triangle',bass:'sine',notes:[220,261.63,329.63,392,329.63,261.63,246.94,293.66],bassNotes:[110,123.47,98,110],accent:'#ffd447'},
  tournament:{tempo:126,wave:'square',bass:'triangle',notes:[196,246.94,293.66,392,293.66,246.94,220,329.63],bassNotes:[98,110,123.47,110],accent:'#ef3f2e'},
  battle:{tempo:116,wave:'sawtooth',bass:'triangle',notes:[174.61,220,261.63,349.23,261.63,220,196,293.66],bassNotes:[87.31,98,110,98],accent:'#ff8a32'}
});

export class AudioManager{
  constructor(settings={}){
    this.context=null;
    this.musicTimer=null;
    this.musicTheme='';
    this.musicStep=0;
    this.musicGeneration=0;
    this.musicBus=null;
    this.configure(settings);
  }

  configure(settings={}){
    this.settings={master:80,music:65,sfx:85,ui:75,voice:80,mute:false,...settings};
    return this.settings;
  }

  async enable(){
    try{
      const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Audio)return false;
      this.context??=new Audio();
      if(this.context.state==='suspended')await this.context.resume();
      return this.context.state==='running';
    }catch{return false}
  }

  channelGain(volume,channel='sfx'){
    if(this.settings.mute)return 0;
    return volume*(this.settings.master/100)*((this.settings[channel]??this.settings.sfx)/100);
  }

  createMusicBus(){
    if(!this.context)return null;
    const bus=this.context.createGain();
    const now=this.context.currentTime;
    bus.gain.setValueAtTime(.0001,now);
    bus.gain.exponentialRampToValueAtTime(1,now+.16);
    bus.connect(this.context.destination);
    return bus;
  }

  fadeMusicBus(bus,duration=.2){
    if(!bus||!this.context)return;
    const now=this.context.currentTime;
    try{
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(Math.max(.0001,bus.gain.value||1),now);
      bus.gain.exponentialRampToValueAtTime(.0001,now+duration);
      setTimeout(()=>{try{bus.disconnect()}catch{}},Math.ceil((duration+.08)*1000));
    }catch{}
  }

  tone(frequency=220,duration=.05,type='square',volume=.03,channel='sfx',when=0){
    try{
      const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
      if(!Audio)return;
      this.context??=new Audio();
      const oscillator=this.context.createOscillator(),gain=this.context.createGain();
      const start=Math.max(this.context.currentTime,when||this.context.currentTime);
      const level=Math.max(.0001,this.channelGain(volume,channel));
      oscillator.type=type;
      oscillator.frequency.setValueAtTime(frequency,start);
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(level,start+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.025,duration));
      oscillator.connect(gain);
      gain.connect(channel==='music'&&this.musicBus?this.musicBus:this.context.destination);
      oscillator.start(start);oscillator.stop(start+Math.max(.03,duration)+.02);
    }catch{}
  }

  play(name){
    const cue=AUDIO_HOOKS[name],channel=/^(menu|controller)/.test(name)?'ui':'sfx';
    if(cue)this.tone(cue.frequency,cue.duration,cue.type,cue.volume,channel);
  }

  scheduleMusicPhrase(theme,generation){
    if(!this.context||generation!==this.musicGeneration||this.musicTheme!==theme)return;
    const data=MUSIC_THEMES[theme]||MUSIC_THEMES.menu;
    const beat=60/data.tempo;
    const start=this.context.currentTime+.06;
    const phrase=8;
    for(let i=0;i<phrase;i++){
      const index=(this.musicStep+i)%data.notes.length;
      const when=start+i*beat*.5;
      this.tone(data.notes[index],beat*.34,data.wave,.012,'music',when);
      if(i%2===0){
        const bassIndex=(Math.floor((this.musicStep+i)/2))%data.bassNotes.length;
        this.tone(data.bassNotes[bassIndex],beat*.62,data.bass,.014,'music',when);
      }
      if(i===0||i===4)this.tone(55,beat*.08,'square',.008,'music',when);
    }
    this.musicStep=(this.musicStep+phrase)%data.notes.length;
  }

  async startMusic(theme='menu'){
    const resolved=MUSIC_THEMES[theme]?theme:'menu';
    if(this.musicTheme===resolved&&this.musicTimer)return true;
    const enabled=await this.enable();
    if(!enabled)return false;

    const oldBus=this.musicBus;
    if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null}
    this.musicTheme='';
    this.musicGeneration++;
    this.fadeMusicBus(oldBus,.18);

    this.musicBus=this.createMusicBus();
    this.musicTheme=resolved;
    this.musicStep=0;
    const generation=++this.musicGeneration;
    const data=MUSIC_THEMES[resolved];
    const interval=Math.max(900,(60/data.tempo)*4*1000);
    this.scheduleMusicPhrase(resolved,generation);
    this.musicTimer=setInterval(()=>this.scheduleMusicPhrase(resolved,generation),interval);
    return true;
  }

  stopMusic({fade=.18}={}){
    if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null}
    const oldBus=this.musicBus;
    this.musicBus=null;
    this.musicTheme='';
    this.musicGeneration++;
    this.fadeMusicBus(oldBus,fade);
  }

  victoryStinger(){
    if(!this.context)return;
    const now=this.context.currentTime+.02;
    [392,523.25,659.25,783.99].forEach((note,index)=>this.tone(note,.22,'triangle',.032,'music',now+index*.11));
    this.tone(196,.52,'sine',.022,'music',now);
  }

  test(){this.play('lightHit');setTimeout(()=>this.play('perfectBlock'),120);setTimeout(()=>this.play('ultimateActivate'),250)}
}
