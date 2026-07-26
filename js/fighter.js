import {ROSTER} from './roster.js';
import {moveFor} from './movesets.js';
import {ATTACKS,COMBO_RESET_FRAMES,JUGGLE_LIMIT,Projectile,calculateFinalDamage,clamp,createComboState,overlaps,resetCombo} from './combat.js';
import {tint} from './effects.js';
import {tryMeleeClash,tryUltimateClash} from './clash-system.js';
import {DEFENSE_BALANCE,defensiveDashFrames,resetDefenseState,resolveBlockedHit,updateDefenseState} from './guard-system.js';
import {beginCinematicUltimate,clearCinematic,ULTIMATES} from './ultimate-system.js';

const ZERO_COMMAND={down:()=>false,pressed:()=>false};

export class Fighter{
  constructor(id,side,cpu,world,{appearance='down'}={}){this.id=id;this.c=ROSTER[id];this.side=side;this.cpu=cpu;this.world=world;this.appearance=appearance==='up'?'up':'down';this.w=48;this.h=86;this.combo=createComboState();this.resetRuntime()}
  resetRuntime(){
    Object.assign(this,{x:this.side===1?150:762,y:this.world.ground-this.h,vx:0,vy:0,face:this.side===1?1:-1,grounded:1,hp:100,en:100,attackCd:0,specialCd:0,ultCd:0,ultimateRecovery:0,dashCd:0,clashCooldown:0,ultimateStartup:0,pendingUltimate:false,lensCooldown:0,agonyCooldown:0,agonyActiveVolley:false,agonyVolleyFired:false,agonyVolleyId:0,stun:0,inv:0,freeze:0,aura:0,armor:0,trap:0,lens:0,block:0,windup:0,knockdown:0,getup:0,juggles:0,lightChain:0,lightChainTimer:0,chainLockout:0,airDashes:0,pending:null,pendingMove:null,queuedAttack:null,counterStartup:0,counterActive:0,counterRecovery:0,counterCd:0,tick:0,visualAction:null,visualActionTimer:0,visualHitKind:null,visualPerfectTimer:0,visualBlockTimer:0,visualDashTimer:0,hitFlash:0});
    resetDefenseState(this);
    resetCombo(this.combo);
    this.world.fighterVisuals?.resetFighter(this);
  }
  box(){return{x:this.x,y:this.y,w:this.w,h:this.h}}
  foe(){return this===this.world.fighters[0]?this.world.fighters[1]:this.world.fighters[0]}
  update(command=ZERO_COMMAND){
    for(const key of ['visualActionTimer','visualPerfectTimer','visualBlockTimer','visualDashTimer','hitFlash'])this[key]=Math.max(0,(this[key]||0)-1);
    if(!this.visualActionTimer)this.visualAction=null;
    if(this.world.clash?.active)return;
    if(this.freeze>0){this.freeze--;return}
    const foe=this.foe();if(!foe)return;this.tick++;this.face=foe.x>this.x?1:-1;
    updateDefenseState(this,command);
    if(command.pressed('k'))this.comboBreaker();
    if(this.combo.timer>0&&--this.combo.timer===0){resetCombo(this.combo);this.lightChain=0}
    if(this.lightChainTimer>0&&--this.lightChainTimer===0)this.lightChain=0;
    if(this.chainLockout>0)this.chainLockout--;if(this.counterCd>0)this.counterCd--;if(this.clashCooldown>0)this.clashCooldown--;if(this.lensCooldown>0)this.lensCooldown--;if(this.ultimateRecovery>0)this.ultimateRecovery--;
    if(this.agonyCooldown>0)this.agonyCooldown--;
    if(this.agonyActiveVolley&&this.agonyVolleyFired){const projectilesRemain=this.world.projectiles.some(projectile=>projectile.volleyOwner===this&&projectile.volleyId===this.agonyVolleyId),clonesRemain=this.world.effects.effects.some(effect=>effect.volleyOwner===this&&effect.volleyId===this.agonyVolleyId);if(!projectilesRemain&&!clonesRemain)this.agonyActiveVolley=false}
    if(this.knockdown>0){this.knockdown--;this.vx*=.9;if(!this.knockdown){this.getup=28;this.inv=28}}
    else if(this.getup>0)this.getup--;
    if(this.guardBreakStun>0||this.grabbed>0){this.vx*=.7}
    else if(this.throwStartup>0){this.vx*=.45;if(!--this.throwStartup)this.resolveThrow()}
    else if(this.dashRecovery>0||this.ultimateRecovery>0){this.vx*=.75}
    else if(this.ultimateStartup>0){this.vx*=.4;if(!--this.ultimateStartup&&this.pendingUltimate)this.resolveUltimate()}
    else if(this.counterStartup>0){this.vx*=.5;if(!--this.counterStartup)this.counterActive=12}
    else if(this.counterActive>0){this.vx*=.5;if(!--this.counterActive)this.counterRecovery=30}
    else if(this.counterRecovery>0){this.vx*=.65;this.counterRecovery--}
    else if(this.windup>0){this.windup--;if(!this.windup&&this.pending)this.resolveAttack()}
    else if(this.stun>0)this.stun--;
    else if(!this.knockdown&&!this.getup){
      const speed=this.c.sp*(this.aura?1.2:1)*(this.armor?.78:1);
      if(command.down('l'))this.vx=-speed;else if(command.down('r'))this.vx=speed;else this.vx*=.65;
      if(command.pressed('j')&&this.grounded){this.vy=-this.c.j;this.grounded=0;this.world.sound(180)}
      // Normal/throw buffers must survive hit-stop and the remaining recovery.
      // Only consume them once a normal could legally begin.
      if(!this.attackCd){
        if(command.pressed('t'))this.throw();
        else if(command.pressed('x'))this.attack('launcher');
        else if(command.pressed('a'))this.attack(this.grounded?'light':'air');
        else if(command.pressed('h'))this.attack(this.grounded?'heavy':'airHeavy');
      }
      if(command.pressed('fireBlast'))this.fireBlast();
      if(command.pressed('shotsOfAgony'))this.beginShotsOfAgony();
      if(command.pressed('objectSwap'))this.dash();
      if(command.pressed('lensOfTruth'))this.lensAbility();
      if(command.pressed('ultimate'))this.ultimate();
      if(command.pressed('s'))this.special();
      if(command.pressed('u'))this.ultimate();
      if(command.pressed('n'))this.lensAbility();
      if(command.pressed('d'))this.dash();
      if(command.pressed('c'))this.counter();
    }
    this.x+=this.vx;this.y+=this.vy;this.vy+=.72;
    if(this.y>=this.world.ground-this.h){this.y=this.world.ground-this.h;this.vy=0;if(!this.grounded&&this.stun>0){this.knockdown=35;this.stun=0}this.grounded=1;this.juggles=0;this.airDashes=0}else this.grounded=0;
    this.x=clamp(this.x,15,this.world.width-this.w-15);
    for(const key of ['attackCd','specialCd','ultCd','dashCd','inv','aura','armor','trap','lens'])this[key]=Math.max(0,this[key]-1);
    if(!this.agonyActiveVolley)this.en=clamp(this.en+.12+(this.aura?.16:0),0,100);
  }
  attack(kind){
    if(this.attackCd||this.windup||this.stun||this.knockdown||(kind==='light'&&this.chainLockout))return false;
    const move={...ATTACKS[kind],...moveFor(this.id,kind,this.lightChain)};
    const airAttack=kind==='air'||kind==='airHeavy';
    if(!move.kind||(!airAttack&&!this.grounded)||(airAttack&&this.grounded))return false;
    this.pending=kind;this.pendingMove=move;this.windup=move.startup;this.attackCd=move.startup+move.recovery;
    this.visualAction=kind==='light'?`light${Math.min(3,this.lightChain+1)}`:kind==='heavy'?'heavyStartup':kind==='launcher'?'launcherStartup':kind==='air'?'airLight':'airHeavy';
    this.visualActionTimer=this.attackCd;
    if(this.id==='bark'&&kind==='heavy')this.armor=Math.max(this.armor,38);
    return true;
  }
  resolveAttack(){
    const kind=this.pending,move=this.pendingMove;this.pending=this.pendingMove=null;if(!move)return false;
    if(kind==='heavy')this.visualAction='heavyActive';else if(kind==='launcher')this.visualAction='launcherActive';
    this.visualActionTimer=Math.max(this.visualActionTimer,move.recovery||12);
    const foe=this.foe();if(this.id==='revvfo'&&kind==='launcher'){this.x=clamp(foe.x-this.face*48,15,this.world.width-this.w-15);this.world.effects.burst(this.x,this.y,this.c.a,14)}
    const hitbox={x:this.face>0?this.x+this.w:this.x-move.range,y:this.y+(kind==='launcher'?30:14),w:move.range,h:kind==='launcher'?58:52};
    if(tryMeleeClash(this.world,this,foe,kind,hitbox))return true;
    this.world.effects.add({t:'slash',x:hitbox.x+move.range/2,y:hitbox.y+20,c:this.c.a,l:10});
    if(!overlaps(hitbox,foe.box())){if(['light','heavy','launcher'].includes(kind)){this.lightChain=0;this.lightChainTimer=0}return false}
    const finalLight=kind==='light'&&this.lightChain===2,appliedKnockback=move.knockback*(finalLight?1.65:1);
    foe.hit(move.damage*this.c.p,this.face*appliedKnockback,kind,this,move);this.en=clamp(this.en+(move.energyGain||7),0,100);
    this.world.sound(kind==='heavy'||kind==='airHeavy'?'heavyHit':kind==='launcher'?'launcher':'lightHit');
    if(kind==='launcher'){foe.vy=-move.launch;foe.grounded=0}
    if(kind==='light'){if(finalLight){this.lightChain=0;this.lightChainTimer=0;this.chainLockout=40;this.attackCd=Math.max(this.attackCd,40)}else{this.lightChain++;this.lightChainTimer=COMBO_RESET_FRAMES}}
    if(kind==='heavy'||kind==='launcher'){this.lightChain=0;this.lightChainTimer=0}
    return true;
  }
  cancelStartup(){this.windup=0;this.pending=null;this.pendingMove=null;this.queuedAttack=null;this.visualAction=null;this.visualActionTimer=0;if(this.ultimateStartup){this.ultimateStartup=0;this.pendingUltimate=false;this.ultimateRecovery=Math.max(this.ultimateRecovery,32)}if(this.throwStartup){this.throwStartup=0;this.pendingThrow=false;this.throwRecovery=Math.max(this.throwRecovery,18)}}
  throw(){
    if(this.throwStartup||this.throwRecovery||this.attackCd||this.windup||this.stun||this.knockdown||this.guardBreakStun||this.world.clash?.active)return false;
    this.throwStartup=DEFENSE_BALANCE.throwStartup;this.pendingThrow=true;this.attackCd=DEFENSE_BALANCE.throwStartup+DEFENSE_BALANCE.throwRecovery;return true;
  }
  resolveThrow(){
    const foe=this.foe();this.pendingThrow=false;
    if(!foe||Math.abs(foe.x-this.x)>DEFENSE_BALANCE.throwRange||foe.throwProtection||foe.inv||foe.grabbed){this.throwRecovery=DEFENSE_BALANCE.throwRecovery;return false}
    foe.block=0;foe.wasBlocking=false;foe.grabbed=24;foe.stun=24;foe.throwProtection=DEFENSE_BALANCE.throwProtection;foe.vx=this.face*11;
    const before=foe.hp;foe.hp=Math.max(1,foe.hp-6/(foe.c.d||1));this.throwRecovery=16;this.world.statistics?.add(this.side,'throws');this.world.statistics?.recordDamage(this.side,before-foe.hp);this.world.notifications?.push('THROW',{key:`throw-${this.side}`});
    this.world.effects.add({t:'throw',x:foe.x+24,y:foe.y+40,c:this.c.a,l:22});this.world.effects.burst(foe.x+24,foe.y+40,this.c.a,22);this.world.sound('throw');return true;
  }
  comboBreaker(){
    if(this.en<DEFENSE_BALANCE.breakerCost||this.stun<=0||this.guardBreakStun||this.grabbed||this.breakerUsed||this.breakerCooldown||this.world.clash?.active||this.world.cinematic?.active)return false;
    const foe=this.foe();this.en-=DEFENSE_BALANCE.breakerCost;this.breakerUsed=true;this.breakerCooldown=DEFENSE_BALANCE.breakerCooldown;this.stun=0;this.knockdown=0;this.inv=14;this.visualAction='breaker';this.visualActionTimer=18;
    if(foe){foe.vx=-foe.face*13;foe.stun=Math.max(foe.stun,18);resetCombo(foe.combo)}
    this.world.effects.add({t:'breaker',x:this.x+24,y:this.y+40,c:'#ffffff',l:30});this.world.effects.burst(this.x+24,this.y+40,'#ffffff',38);this.world.shake=Math.max(this.world.shake,this.world.reducedShake?2.5:7);this.world.sound('breaker');this.world.statistics?.add(this.side,'breakers');this.world.notifications?.push('COMBO BREAKER',{important:true,key:`breaker-${this.side}`});return true;
  }
  counter(){
    if(this.id!=='bark'||this.counterCd||this.counterStartup||this.counterActive||this.counterRecovery||this.attackCd||this.windup||this.en<20||this.stun||this.knockdown)return false;
    this.en-=20;this.counterStartup=6;this.counterCd=90;this.attackCd=Math.max(this.attackCd,48);this.world.effects.add({t:'counter',x:this.x+24,y:this.y+42,c:'#d9bb78',l:18});return true;
  }
  dash(){
    if(this.dashCd||this.dashRecovery||this.en<12||(!this.grounded&&this.id!=='wade')||(!this.grounded&&this.airDashes>=1))return;
    this.en-=12;this.dashCd=this.id==='wade'?30:42;this.inv=defensiveDashFrames(this.id);this.dashRecovery=this.id==='creed'||this.id==='phanta'?5:this.id==='wade'?7:10;if(!this.grounded)this.airDashes++;
    if(this.id==='rrvvfo'){this.visualAction='objectSwapDisappear';this.visualActionTimer=22}else{this.visualAction='dash';this.visualActionTimer=18}this.visualDashTimer=this.visualActionTimer;
    this.world.effects.burst(this.x+24,this.y+43,this.c.a,18);
    const distance=this.id==='creed'?190:this.id==='rrvvfo'?155:this.id==='wade'?175:125;this.x=clamp(this.x+this.face*distance,15,this.world.width-this.w-15);
    this.world.effects.burst(this.x+24,this.y+43,this.c.a,18);this.world.sound(420,.05,'sine');
  }
  shot(damage,speed,size=10,type='orb',vy=0,color=this.c.a){this.world.projectiles.push(new Projectile(this,this.x+24+this.face*30,this.y+30,this.face*speed,vy,color,damage*this.c.p,size,type))}
  later(fn,delay){this.world.timers.schedule(fn,delay)}
  beginShotsOfAgony(){
    if(this.agonyActiveVolley){this.world.notifications?.push('SHOTS OF AGONY ALREADY ACTIVE',{important:true,key:`agony-active-${this.side}`});return false}if(this.agonyCooldown){this.world.notifications?.push('COOLDOWN ACTIVE',{key:`agony-cooldown-${this.side}`});return false}if(this.en<40){this.world.notifications?.push('NOT ENOUGH ENERGY',{key:`energy-${this.side}`});return false}
    const foe=this.foe(),fx=this.world.effects,volleyId=++this.agonyVolleyId;
    this.en-=40;this.agonyActiveVolley=true;this.agonyVolleyFired=false;this.lightChain=0;this.lightChainTimer=0;this.visualAction='shotsSummon';this.visualActionTimer=52;
    this.world.sound(260,.12,'sawtooth');this.world.shake=Math.max(this.world.shake,4);
    const spots=[{x:foe.x-90,y:foe.y+10},{x:foe.x+foe.w+90,y:foe.y+10},{x:foe.x-45,y:foe.y-70},{x:foe.x+foe.w+45,y:foe.y-70}];
    for(const spot of spots){fx.add({t:'agonyClone',x:spot.x,y:spot.y,c:'#25d9ff',l:70,face:spot.x<foe.x?1:-1,volleyOwner:this,volleyId});fx.burst(spot.x,spot.y+35,'#25d9ff',10)}
    this.later(()=>{
      const target=this.foe(),tx=target.x+target.w/2,ty=target.y+target.h/2;
      for(const spot of spots)this.world.projectiles.push(new Projectile(this,spot.x,spot.y+35,(tx-spot.x)*.105,(ty-(spot.y+35))*.105,'#25d9ff',7.4*this.c.p,10,'orb',{volleyOwner:this,volleyId}));
      this.agonyVolleyFired=true;this.agonyCooldown=300;this.visualAction='shotsFire';this.visualActionTimer=24;
    },240);
    this.world.statistics?.add(this.side,'specials');return true;
  }
  fireBlast(){
    if(this.id!=='rrvvfo')return false;
    if(this.specialCd){this.world.notifications?.push('COOLDOWN ACTIVE',{key:`special-cooldown-${this.side}`});return false}
    if(this.en<28){this.world.notifications?.push('NOT ENOUGH ENERGY',{key:`energy-${this.side}`});return false}
    this.en-=28;this.specialCd=55;this.visualAction='fireBlastFire';this.visualActionTimer=36;this.shot(15,9,15,'beam',0,'#ff6a24');this.lightChain=0;this.lightChainTimer=0;this.world.shake=Math.max(this.world.shake,4);this.world.sound(300,.08,'sawtooth');this.world.statistics?.add(this.side,'specials');return true;
  }
  special(){
    const foe=this.foe(),fx=this.world.effects;if(this.id==='rrvvfo'&&this.agonyActiveVolley){this.world.notifications?.push('SHOTS OF AGONY ALREADY ACTIVE',{important:true,key:`agony-active-${this.side}`});return false}if(this.id==='rrvvfo'&&Math.abs(foe.x-this.x)<=190)return this.beginShotsOfAgony();
    if(this.id==='rrvvfo')return this.fireBlast();
    if(this.specialCd){this.world.notifications?.push('COOLDOWN ACTIVE',{key:`special-cooldown-${this.side}`});return false}if(this.en<28){this.world.notifications?.push('NOT ENOUGH ENERGY',{key:`energy-${this.side}`});return false}this.en-=28;this.specialCd=55;this.world.sound(300,.08,'sawtooth');
    switch(this.id){
      case'revvfo':if(!this.grounded)this.shot(19,9,22,'beam',1,'#ff55c8');else if(Math.abs(foe.x-this.x)<150){this.inv=16;this.x=clamp(foe.x-this.face*50,15,this.world.width-this.w-15);foe.hit(13,this.face*9,'special',this,{hitstun:24})}else this.shot(16,8,18,'beam',0,'#d445ff');break;
      case'wade':if(!this.grounded)[0,1,2].forEach((_,i)=>this.later(()=>this.shot(4.5,10+i,9,'orb',(i-1)*1.2,'#82e8ff'),i*65));else{this.inv=18;this.x=clamp(foe.x-this.face*55,15,this.world.width-this.w-15);foe.hit(10,this.face*8,'special',this,{hitstun:21});fx.burst(foe.x,foe.y+30,'#82e8ff',22)}break;
      case'bark':if(this.armor){this.shot(12,5,24,'beam',0,'#c8a06a');this.armor=Math.max(this.armor,60)}else{this.armor=180;fx.burst(this.x+20,this.y+60,'#c8a06a',25)}break;
      case'alt':Math.abs(foe.x-this.x)<115?foe.hit(14,this.face*10,'punishment',this,{hitstun:20}):this.shot(10,7,13);break;
      case'robert':this.shot(11,7.5,13,'ice',-.7,'#b9f2ff');break;case'virek':this.shot(14,10,11,'beam',0,'#59ffc4');break;
      case'shadow':this.shot(13,7,16,'orb',0,'#fff28a');this.hp=clamp(this.hp+3,0,100);break;
      case'phanta':[0,1,2].forEach((_,i)=>this.later(()=>this.shot(6.5,8+i,10,'orb',(i-1)*1.5,'#ff2e78'),i*80));break;
      case'creed':this.inv=22;this.x=clamp(foe.x+(Math.random()>.5?70:-70),15,this.world.width-this.w-15);foe.hit(12,this.face*9,'special',this,{hitstun:22});fx.burst(foe.x,foe.y+30,'#32ecff',20);break;
      case'sage':Math.abs(foe.x-this.x)<180?foe.hit(13,this.face*13,'special',this,{hitstun:22}):this.shot(11,6,18,'orb',0,'#fff38a');break;
      case'raggie':this.shot(10,11,14,'disc',0,'#fff7a8');this.inv=8;break;
      case'jimmy':Math.abs(foe.x-this.x)<150?(foe.hit(15,this.face*12,'special',this,{hitstun:24}),fx.burst(foe.x,foe.y+30,'#22130c',26)):this.shot(9,7,16,'orb',0,'#2b1b12');break;
      case'jonathan':foe.trap=120;fx.add({t:'trap',x:foe.x+24,y:this.world.ground-8,c:'#ffd18f',l:120});break;
      case'rev':[0,1,2].forEach((_,i)=>this.later(()=>this.shot(6,8+i,9,'orb',(i-1)*.8,'#ff4e87'),i*70));break;
    }
    this.lightChain=0;this.lightChainTimer=0;this.world.shake=Math.max(this.world.shake,4);
    this.world.statistics?.add(this.side,'specials');return true;
  }
  ultimate(){
    const data=ULTIMATES[this.id];if(!data||this.ultCd||this.en<90||this.ultimateStartup||this.ultimateRecovery||this.world.clash?.active||this.world.cinematic?.active){this.world.notifications?.push(this.en<90?'NOT ENOUGH ENERGY':'ULTIMATE UNAVAILABLE',{important:true,key:`ultimate-${this.side}`});return false}
    this.en-=90;this.ultCd=300;this.lightChain=0;this.lightChainTimer=0;
    this.pendingUltimate=true;this.ultimateStartup=data.startup;this.attackCd=Math.max(this.attackCd,data.startup+data.recovery);this.visualAction='ultimateStartup';this.visualActionTimer=data.startup+data.recovery;
    this.world.effects.burst(this.x+24,this.y+40,this.c.a,26);this.world.sound(90,.12,'sawtooth',.04);
    this.world.statistics?.add(this.side,'ultimates');if(tryUltimateClash(this.world,this,this.foe(),data.damage))return true;
    return true;
  }
  resolveUltimate(){
    this.pendingUltimate=false;return beginCinematicUltimate(this.world,this,this.foe());
  }
  lensAbility(){
    if(this.id!=='rrvvfo')return false;if(this.lens||this.lensCooldown){this.world.notifications?.push('LENS COOLDOWN ACTIVE',{key:`lens-cooldown-${this.side}`});return false}if(this.en<90){this.world.notifications?.push('LENS NEEDS 90 ENERGY • SACRIFICES 50 HP',{important:true,key:`lens-energy-${this.side}`});return false}if(this.stun||this.knockdown||this.world.cinematic?.active)return false;
    this.en-=90;this.hp=Math.max(1,this.hp-50);this.lens=240;this.lensCooldown=300;this.visualAction='lensActivate';this.visualActionTimer=28;
    const fx=this.world.effects;fx.burst(this.x+24,this.y+40,'#f7f7ff',45);fx.add({t:'lens',x:this.x+24,y:this.y+22,c:'#f7f7ff',l:240});this.world.sound(620,.1,'sine',.04);this.world.notifications?.push('LENS OF TRUTH • 50 HP SACRIFICED',{important:true,key:`lens-active-${this.side}`});return true;
  }
  hit(baseDamage,knockback=0,kind='hit',attacker=null,move={}){
    const fx=this.world.effects;
    if(this.world.cinematic?.active&&this.world.cinematic.attacker===this)clearCinematic(this.world);
    if(this.lens>0){const foe=this.foe(),oldX=this.x;this.x=clamp(foe.x-foe.face*72,15,this.world.width-this.w-15);if(Math.abs(this.x-foe.x)<45)this.x=clamp(oldX-this.face*105,15,this.world.width-this.w-15);this.visualAction=this.x<oldX?'lensDodgeLeft':'lensDodgeRight';this.visualActionTimer=18;this.inv=8;fx.burst(oldX+24,this.y+43,'#f7f7ff',18);fx.burst(this.x+24,this.y+43,'#f7f7ff',18);fx.add({t:'dodge',x:this.x+24,y:this.y+22,c:'#f7f7ff',l:20});this.world.sound(620,.06,'sine',.035);return 0}
    if(this.inv)return 0;
    const meleeCounterKinds=new Set(['light','heavy','launcher','air','airHeavy']);
    if(this.id==='bark'&&this.counterActive>0&&attacker&&meleeCounterKinds.has(kind)&&Math.abs(attacker.x-this.x)<95){this.counterActive=0;this.counterRecovery=18;attacker.hit(13,-attacker.face*12,'counter',this,{hitstun:26});fx.burst(attacker.x+24,attacker.y+40,'#d9bb78',24);return 0}
    if(this.counterStartup||this.counterActive){this.counterStartup=this.counterActive=0;this.counterRecovery=Math.max(this.counterRecovery,30)}
    const intentionalStartupArmor=this.id==='bark'&&this.pending==='heavy'&&this.armor>0;
    if((this.windup>0||this.ultimateStartup>0||this.throwStartup>0)&&!intentionalStartupArmor)this.cancelStartup();
    const nextHit=attacker&&!this.block?attacker.combo.hits+1:1;
    const result=calculateFinalDamage({base:baseDamage,hit:nextHit,kind,defense:this.c.d,armor:!!this.armor,lowHealthAlt:this.id==='alt'&&this.hp<35,blocked:false,trapped:!!this.trap});
    const defense=this.block?resolveBlockedHit(this,attacker,kind,baseDamage):null;
    if(defense?.perfect)this.visualPerfectTimer=14;else if(this.block)this.visualBlockTimer=10;
    if(defense?.broken)this.visualAction='guardBreak',this.visualActionTimer=Math.max(this.visualActionTimer,this.guardBreakStun||45);
    const damage=defense?result.final*defense.chipFactor:result.final,before=this.hp,minimum=defense?1:0;
    this.hp=clamp(Math.max(minimum,this.hp-damage),0,100);const actual=before-this.hp;
    if(actual>0&&this.world.training.enabled&&this.side===2&&['after','counterattack'].includes(this.world.training.dummy))this.world.training.afterFirstHit=true;
    if(attacker&&!this.block&&actual>0){attacker.combo.hits=nextHit;attacker.combo.damage+=actual;attacker.combo.scale=result.scale;attacker.combo.timer=COMBO_RESET_FRAMES;attacker.combo.attacker=attacker.side;if(!this.grounded&&++this.juggles>=JUGGLE_LIMIT){this.knockdown=42;this.vy=9;knockback*=.45}}
    if(attacker&&actual>0)this.world.statistics?.recordDamage(attacker.side,actual,attacker.combo.hits,attacker.combo.damage);
    if(defense?.perfect){this.world.statistics?.add(this.side,'perfectBlocks');this.world.notifications?.push('PERFECT BLOCK',{important:true,key:`perfect-${this.side}`})}
    if(defense?.broken){if(attacker)this.world.statistics?.add(attacker.side,'guardBreaks');this.world.notifications?.push('GUARD BREAK',{important:true,key:`guard-break-${this.side}`})}
    if(this.block&&kind!=='seal'){knockback*=defense?.perfect?.08:.25;if(!defense?.perfect)this.en=clamp(this.en+4,0,100)}
    this.vx=knockback;this.stun=defense?.broken?Math.max(this.stun,this.guardBreakStun):this.block?(defense?.perfect?1:5):(move.hitstun||12);this.visualHitKind=kind;this.hitFlash=4;
    const sparkKind=defense?.perfect?'perfectBlock':kind;fx.add({t:'hitSpark',kind:sparkKind,x:this.x+24,y:this.y+43,c:defense?.perfect?'#bdfbff':kind==='ultimate'?'#fff7ba':kind==='special'?'#7de9ff':this.c.a,l:18});fx.burst(this.x+24,this.y+43,this.c.a,kind==='ultimate'?28:14);
    this.world.sound(this.block?(defense?.perfect?'perfectBlock':'block'):kind==='heavy'||kind==='airHeavy'?'heavyHit':kind==='launcher'?'launcher':kind==='ultimate'?'ultimateImpact':'lightHit');
    const strongNormal=kind==='heavy'||kind==='airHeavy'||kind==='launcher';
    const shake=this.block?2:kind==='ultimate'?12:strongNormal?7:kind==='special'?5:3;this.world.shake=Math.max(this.world.shake,this.world.reducedShake?shake*.35:shake);this.world.hitstop=Math.max(this.world.hitstop,defense?.perfect?5:kind==='ultimate'?9:strongNormal?5:kind==='special'?4:2);return actual;
  }
  draw(ctx){
    if(this.world.fighterVisuals?.draw(ctx,this))return;
    this.drawLegacy(ctx);
  }
  drawLegacy(ctx){
    const c=this.c,x=this.x,y=this.y,m=x+24;ctx.save();if(this.inv&&Math.floor(this.inv/2)%2===0)ctx.globalAlpha=.48;
    if(this.aura||this.armor||this.counterActive){ctx.strokeStyle=this.counterActive?'#ffe082':this.armor?'#c8a06a':c.a;ctx.lineWidth=5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=16;ctx.beginPath();ctx.ellipse(m,y+45,38+Math.sin(performance.now()/90)*3,55,0,0,Math.PI*2);ctx.stroke()}
    if(this.block){ctx.fillStyle='#9fe9ff55';ctx.beginPath();ctx.arc(m+this.face*18,y+42,36,-1.2,1.2);ctx.fill()}
    if(this.victory){ctx.strokeStyle=c.a;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(m,y+40);ctx.lineTo(m+this.face*20,y-8);ctx.stroke()}
    ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(m,this.world.ground+5,34,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=tint(c.c,-25,clamp);ctx.fillRect(x+7,y+61,13,25);ctx.fillRect(x+28,y+61,13,25);ctx.fillStyle=c.c;ctx.fillRect(x+5,y+28,38,38);ctx.fillStyle=tint(c.c,12,clamp);ctx.fillRect(x+(this.face>0?38:-2),y+33,12,31);ctx.fillRect(x+(this.face>0?-2:38),y+35,12,27);ctx.fillStyle='#d9a77c';ctx.beginPath();ctx.arc(m,y+20,18,0,Math.PI*2);ctx.fill();ctx.fillStyle=c.h;ctx.beginPath();ctx.arc(m,y+15,19,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+7,y+14);ctx.lineTo(x+15,y-2);ctx.lineTo(x+22,y+13);ctx.lineTo(x+30,y-5);ctx.lineTo(x+39,y+15);ctx.fill();ctx.fillStyle=c.a;ctx.fillRect(m+this.face*6-2,y+18,5,4);
    if(this.id==='raggie'){ctx.fillStyle='#f5f5f5';ctx.fillRect(x+9,y-18,10,24);ctx.fillRect(x+29,y-18,10,24)}if(this.id==='creed'){ctx.strokeStyle='#32ecff';ctx.lineWidth=3;ctx.strokeRect(x+8,y+7,32,22)}if(this.id==='sage'){ctx.strokeStyle='#fff38a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m,y+18,24,0,Math.PI*2);ctx.stroke()}if(this.id==='robert'){ctx.fillStyle='#d8f3ff';ctx.fillRect(x+5,y+25,38,5)}ctx.restore();
  }
}
