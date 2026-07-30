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
  menu:{tempo:92,wave:'triangle',bass:'sine',notes:[220,277.18,329.63,277.18,196,246.94,293.66,246.94],bassNotes:[110,110,98,98],chords:[[220,261.63,329.63],[196,246.94,293.66]],drums:'soft',accent:'#55d9ff'},
  dojo:{tempo:104,wave:'triangle',bass:'sine',notes:[220,261.63,329.63,392,329.63,261.63,246.94,293.66],bassNotes:[110,123.47,98,110],chords:[[220,261.63,329.63],[196,246.94,293.66]],drums:'wood',accent:'#ffd447'},
  road:{tempo:110,wave:'triangle',bass:'sine',notes:[246.94,293.66,369.99,329.63,277.18,329.63,415.3,369.99],bassNotes:[123.47,110,138.59,123.47],chords:[[246.94,293.66,369.99],[220,277.18,329.63]],drums:'light',accent:'#75d77b'},
  tournament:{tempo:126,wave:'square',bass:'triangle',notes:[196,246.94,293.66,392,293.66,246.94,220,329.63],bassNotes:[98,110,123.47,110],chords:[[196,246.94,293.66],[220,261.63,329.63]],drums:'festival',accent:'#ef3f2e'},
  mystery:{tempo:82,wave:'sine',bass:'triangle',notes:[174.61,207.65,233.08,207.65,164.81,196,220,196],bassNotes:[82.41,77.78,73.42,77.78],chords:[[174.61,207.65,261.63],[164.81,196,246.94]],drums:'pulse',accent:'#8bd5ff'},
  facility:{tempo:108,wave:'sawtooth',bass:'sine',notes:[146.83,174.61,220,233.08,174.61,146.83,138.59,207.65],bassNotes:[73.42,69.3,65.41,69.3],chords:[[146.83,174.61,220],[138.59,164.81,207.65]],drums:'industrial',accent:'#a46cff'},
  echoVillage:{tempo:78,wave:'sine',bass:'triangle',notes:[196,246.94,293.66,329.63,293.66,246.94,220,261.63],bassNotes:[98,110,92.5,98],chords:[[196,246.94,293.66],[174.61,220,261.63]],drums:'wood',accent:'#e2ba70'},
  echoCavern:{tempo:70,wave:'sine',bass:'sine',notes:[146.83,174.61,220,174.61,138.59,164.81,207.65,164.81],bassNotes:[73.42,69.3,65.41,69.3],chords:[[146.83,174.61,220],[138.59,164.81,207.65]],drums:'pulse',accent:'#87e7ee'},
  echoMountain:{tempo:88,wave:'triangle',bass:'sine',notes:[174.61,220,261.63,293.66,261.63,220,196,246.94],bassNotes:[87.31,98,82.41,92.5],chords:[[174.61,220,261.63],[196,246.94,293.66]],drums:'light',accent:'#dcecff'},
  hollow:{tempo:112,wave:'sawtooth',bass:'triangle',notes:[146.83,184.99,220,277.18,233.08,174.61,207.65,261.63],bassNotes:[73.42,69.3,77.78,65.41],chords:[[146.83,184.99,220],[138.59,174.61,207.65]],drums:'industrial',accent:'#63dce3'},
  battle:{tempo:116,wave:'sawtooth',bass:'triangle',notes:[174.61,220,261.63,349.23,261.63,220,196,293.66],bassNotes:[87.31,98,110,98],chords:[[174.61,220,261.63],[196,246.94,293.66]],drums:'battle',accent:'#ff8a32'}
});

export class AudioManager{
  constructor(settings={}){
    this.context=null;
    this.musicTimer=null;
    this.musicTheme='';
    this.musicStep=0;
    this.musicVariation=0;
    this.musicGeneration=0;
    this.musicBus=null;
    this.noiseBuffer=null;
    this.musicVariation=0;
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
    bus.gain.exponentialRampToValueAtTime(1,now+.28);
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

  createNoiseBuffer(){
    if(!this.context)return null;
    if(this.noiseBuffer&&this.noiseBuffer.sampleRate===this.context.sampleRate)return this.noiseBuffer;
    const length=Math.max(1,Math.floor(this.context.sampleRate*.35)),buffer=this.context.createBuffer(1,length,this.context.sampleRate),data=buffer.getChannelData(0);
    for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
    this.noiseBuffer=buffer;return buffer;
  }

  noise(duration=.06,volume=.012,filterFrequency=2200,when=0){
    if(!this.context)return;
    try{
      const source=this.context.createBufferSource(),filter=this.context.createBiquadFilter(),gain=this.context.createGain(),start=Math.max(this.context.currentTime,when||this.context.currentTime);
      source.buffer=this.createNoiseBuffer();filter.type='bandpass';filter.frequency.setValueAtTime(filterFrequency,start);filter.Q.value=.8;
      const level=Math.max(.0001,this.channelGain(volume,'music'));gain.gain.setValueAtTime(level,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      source.connect(filter).connect(gain).connect(this.musicBus||this.context.destination);source.start(start);source.stop(start+duration+.02);
    }catch{}
  }

  chord(notes,duration,when,volume=.005){
    (notes||[]).forEach((note,index)=>this.tone(note,duration,index===0?'sine':'triangle',volume/(1+index*.18),'music',when));
  }

  scheduleDrums(style,beat,start){
    const kick=(when,strong=false)=>{this.tone(strong?52:58,beat*.12,'sine',strong?.017:.012,'music',when);this.noise(beat*.05,strong?.009:.006,180,when)};
    const snare=when=>this.noise(beat*.12,.012,1450,when);
    const hat=when=>this.noise(beat*.035,.0045,5200,when);
    for(let step=0;step<8;step++){
      const when=start+step*beat*.5;
      if(['battle','festival','industrial'].includes(style)&&step%2===0)kick(when,step===0||step===4);
      else if(['soft','wood','light','pulse'].includes(style)&&(step===0||step===4))kick(when,step===0);
      if(['battle','festival','industrial'].includes(style)&&(step===2||step===6))snare(when);
      if(style==='wood'&&(step===2||step===6))this.tone(310,beat*.045,'triangle',.006,'music',when);
      if(style==='industrial'&&(step===1||step===5))this.tone(92,beat*.07,'square',.006,'music',when);
      if(style!=='soft'&&step%2===1)hat(when);
    }
  }

  play(name){
    const cue=AUDIO_HOOKS[name],channel=/^(menu|controller)/.test(name)?'ui':'sfx';
    if(cue)this.tone(cue.frequency,cue.duration,cue.type,cue.volume,channel);
  }

  scheduleThemeAccent(theme,start,beat,variation=0){
    if(theme==='dojo'){this.tone(880,beat*.18,'sine',.0048,'music',start+beat*1.35);this.tone(1046.5,beat*.12,'sine',.0038,'music',start+beat*1.62)}
    else if(theme==='road'){this.noise(beat*.55,.0032,950,start+beat*.25);this.tone(1174.66,beat*.12,'sine',.0038,'music',start+beat*2.7)}
    else if(theme==='tournament'){this.noise(beat*.32,.0065,720,start+beat*1.8);this.noise(beat*.25,.0055,980,start+beat*3.7)}
    else if(theme==='mystery'){this.tone(87.31,beat*3.5,'sine',.0048,'music',start);this.tone(523.25,beat*.18,'sine',.0035,'music',start+beat*3.45)}
    else if(theme==='facility'){this.tone(58.27,beat*3.7,'sawtooth',.0044,'music',start);this.noise(beat*.14,.005,2200,start+beat*(variation%2?2.5:3.5))}
    else if(theme==='echoVillage'){this.tone(783.99,beat*.7,'sine',.0065,'music',start+beat*.35);this.tone(1174.66,beat*.95,'sine',.0045,'music',start+beat*.46)}
    else if(theme==='echoCavern'){this.tone(293.66,beat*.38,'sine',.005,'music',start+beat*.5);this.tone(293.66,beat*.65,'sine',.0028,'music',start+beat*1.1)}
    else if(theme==='echoMountain'){this.noise(beat*2.8,.0038,1250,start+beat*.15);this.tone(659.25,beat*.14,'sine',.0032,'music',start+beat*3.2)}
    else if(theme==='hollow'){this.tone(73.42,beat*3.7,'square',.0045,'music',start);this.noise(beat*.08,.006,3100,start+beat*1.25)}
  }

  scheduleMusicPhrase(theme,generation){
    if(!this.context||generation!==this.musicGeneration||this.musicTheme!==theme)return;
    const data=MUSIC_THEMES[theme]||MUSIC_THEMES.menu,beat=60/data.tempo,start=this.context.currentTime+.08,phrase=8;
    const variation=this.musicVariation++%4;
    this.scheduleDrums(data.drums,beat,start);
    this.scheduleThemeAccent(theme,start,beat,variation);
    for(let i=0;i<phrase;i++){
      const index=(this.musicStep+i)%data.notes.length,when=start+i*beat*.5;
      const octave=variation===3&&i>=6?2:1;
      this.tone(data.notes[index]*octave,beat*(i%2?.25:.34),data.wave,.0105,'music',when);
      if(i%2===0){const bassIndex=Math.floor((this.musicStep+i)/2)%data.bassNotes.length;this.tone(data.bassNotes[bassIndex],beat*.68,data.bass,.014,'music',when)}
      if(i===0||i===4){const chord=data.chords[(Math.floor((this.musicStep+i)/4)+variation)%data.chords.length];this.chord(chord,beat*1.75,when,.0048)}
      if((theme==='mystery'||theme==='facility')&&i===7)this.tone(data.notes[index]/2,beat*.55,'sine',.006,'music',when);
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
    this.fadeMusicBus(oldBus,.34);

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

  stopMusic({fade=.34}={}){
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
