import {ROSTER} from './roster.js';
import {moveFor} from './movesets.js';
import {ATTACKS,COMBO_RESET_FRAMES,JUGGLE_LIMIT,Projectile,calculateFinalDamage,clamp,createComboState,overlaps,resetCombo} from './combat.js';
import {tint} from './effects.js';

const ZERO_COMMAND={down:()=>false,pressed:()=>false};

export class Fighter{
  constructor(id,side,cpu,world){this.id=id;this.c=ROSTER[id];this.side=side;this.cpu=cpu;this.world=world;this.w=48;this.h=86;this.combo=createComboState();this.resetRuntime()}
  resetRuntime(){
    Object.assign(this,{x:this.side===1?150:762,y:this.world.ground-this.h,vx:0,vy:0,face:this.side===1?1:-1,grounded:1,hp:100,en:100,attackCd:0,specialCd:0,ultCd:0,dashCd:0,stun:0,inv:0,freeze:0,aura:0,armor:0,trap:0,lens:0,block:0,windup:0,knockdown:0,getup:0,juggles:0,lightChain:0,lightChainTimer:0,airDashes:0,pending:null,pendingMove:null,tick:0});
    resetCombo(this.combo);
  }
  box(){return{x:this.x,y:this.y,w:this.w,h:this.h}}
  foe(){return this===this.world.fighters[0]?this.world.fighters[1]:this.world.fighters[0]}
  update(command=ZERO_COMMAND){
    if(this.freeze>0){this.freeze--;return}
    const foe=this.foe();if(!foe)return;this.tick++;this.face=foe.x>this.x?1:-1;
    if(this.combo.timer>0&&--this.combo.timer===0){resetCombo(this.combo);this.lightChain=0}
    if(this.lightChainTimer>0&&--this.lightChainTimer===0)this.lightChain=0;
    if(this.knockdown>0){this.knockdown--;this.vx*=.9;if(!this.knockdown){this.getup=28;this.inv=28}}
    else if(this.getup>0)this.getup--;
    this.block=command.down('b')&&this.grounded&&this.stun<=0&&!this.knockdown;
    if(this.windup>0){this.windup--;if(!this.windup&&this.pending)this.resolveAttack()}
    else if(this.stun>0)this.stun--;
    else if(!this.knockdown&&!this.getup){
      const speed=this.c.sp*(this.aura?1.2:1)*(this.armor?.78:1);
      if(command.down('l'))this.vx=-speed;else if(command.down('r'))this.vx=speed;else this.vx*=.65;
      if(command.pressed('j')&&this.grounded){this.vy=-this.c.j;this.grounded=0;this.world.sound(180)}
      if(command.pressed('a'))this.attack(this.grounded?'light':'air');
      if(command.pressed('h'))this.attack('heavy');
      if(command.pressed('x'))this.attack('launcher');
      if(command.pressed('s'))this.special();
      if(command.pressed('u'))this.ultimate();
      if(command.pressed('d'))this.dash();
    }
    this.x+=this.vx;this.y+=this.vy;this.vy+=.72;
    if(this.y>=this.world.ground-this.h){this.y=this.world.ground-this.h;this.vy=0;if(!this.grounded&&this.stun>0){this.knockdown=35;this.stun=0}this.grounded=1;this.juggles=0;this.airDashes=0}else this.grounded=0;
    this.x=clamp(this.x,15,this.world.width-this.w-15);
    for(const key of ['attackCd','specialCd','ultCd','dashCd','inv','aura','armor','trap','lens'])this[key]=Math.max(0,this[key]-1);
    this.en=clamp(this.en+.12+(this.aura?.16:0),0,100);
  }
  attack(kind){
    if(this.attackCd||this.windup||this.stun||this.knockdown)return false;
    const move={...ATTACKS[kind],...moveFor(this.id,kind,this.lightChain)};
    if(!move.kind||(kind!=='air'&&!this.grounded))return false;
    this.pending=kind;this.pendingMove=move;this.windup=move.startup;this.attackCd=move.startup+move.recovery;
    if(this.id==='bark'&&kind==='heavy')this.armor=Math.max(this.armor,38);
    return true;
  }
  resolveAttack(){
    const kind=this.pending,move=this.pendingMove;this.pending=this.pendingMove=null;if(!move)return false;
    const foe=this.foe();if(this.id==='revvfo'&&kind==='launcher'){this.x=clamp(foe.x-this.face*48,15,this.world.width-this.w-15);this.world.effects.burst(this.x,this.y,this.c.a,14)}
    const hitbox={x:this.face>0?this.x+this.w:this.x-move.range,y:this.y+(kind==='launcher'?30:14),w:move.range,h:kind==='launcher'?58:52};
    this.world.effects.add({t:'slash',x:hitbox.x+move.range/2,y:hitbox.y+20,c:this.c.a,l:10});this.world.sound(kind==='heavy'?110:170);
    if(!overlaps(hitbox,foe.box())){if(kind==='light')this.lightChain=0;return false}
    foe.hit(move.damage*this.c.p,this.face*move.knockback,kind,this,move);this.en=clamp(this.en+(move.energyGain||7),0,100);
    if(kind==='launcher'){foe.vy=-move.launch;foe.grounded=0}
    if(kind==='light'){this.lightChain=(this.lightChain+1)%3;this.lightChainTimer=COMBO_RESET_FRAMES}
    return true;
  }
  dash(){
    if(this.dashCd||this.en<12||(!this.grounded&&this.id!=='wade')||(!this.grounded&&this.airDashes>=1))return;
    this.en-=12;this.dashCd=this.id==='wade'?30:42;this.inv=12;if(!this.grounded)this.airDashes++;
    this.world.effects.burst(this.x+24,this.y+43,this.c.a,18);
    const distance=this.id==='creed'?190:this.id==='rrvvfo'?155:this.id==='wade'?175:125;this.x=clamp(this.x+this.face*distance,15,this.world.width-this.w-15);
    this.world.effects.burst(this.x+24,this.y+43,this.c.a,18);this.world.sound(420,.05,'sine');
  }
  shot(damage,speed,size=10,type='orb',vy=0,color=this.c.a){this.world.projectiles.push(new Projectile(this,this.x+24+this.face*30,this.y+30,this.face*speed,vy,color,damage*this.c.p,size,type))}
  later(fn,delay){this.world.timers.schedule(fn,delay)}
  special(){
    if(this.specialCd||this.en<28)return;this.en-=28;this.specialCd=55;const foe=this.foe(),fx=this.world.effects;this.world.sound(300,.08,'sawtooth');
    switch(this.id){
      case'rrvvfo':
        if(Math.abs(foe.x-this.x)>190){this.shot(15,9,15,'orb',0,'#ff6a24');break}
        [{x:foe.x-90,y:foe.y+10},{x:foe.x+foe.w+90,y:foe.y+10},{x:foe.x-45,y:foe.y-70},{x:foe.x+foe.w+45,y:foe.y-70}].forEach((spot,i)=>this.later(()=>{fx.add({t:'agonyClone',x:spot.x,y:spot.y,c:'#25d9ff',l:34,face:spot.x<foe.x?1:-1});fx.burst(spot.x,spot.y+35,'#25d9ff',10);const tx=foe.x+foe.w/2,ty=foe.y+foe.h/2;this.world.projectiles.push(new Projectile(this,spot.x,spot.y+35,(tx-spot.x)*.105,(ty-(spot.y+35))*.105,'#25d9ff',7*this.c.p,10,'orb'))},i*95));break;
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
    }
    this.world.shake=Math.max(this.world.shake,4);
  }
  ultimate(){
    if(this.ultCd||this.en<90)return;this.en-=90;this.ultCd=300;const foe=this.foe(),fx=this.world.effects;this.world.sound(90,.22,'sawtooth',.05);this.world.shake=12;
    switch(this.id){
      case'rrvvfo':this.hp=Math.max(1,this.hp-50);this.lens=240;fx.burst(this.x+24,this.y+40,'#f7f7ff',45);fx.add({t:'lens',x:this.x+24,y:this.y+22,c:'#f7f7ff',l:240});break;
      case'revvfo':this.aura=360;this.hp=clamp(this.hp+8,0,100);this.shot(25,7,28,'beam',0,'#ff4fd8');break;
      case'wade':[0,1,2,3,4,5].forEach((_,i)=>this.later(()=>{foe.hit(3.6,this.face*2,'ultimate',this,{hitstun:12});fx.burst(foe.x+Math.random()*48,foe.y+Math.random()*86,'#82e8ff',8)},i*90));break;
      case'bark':foe.hit(22,this.face*9,'ultimate',this,{hitstun:28});foe.vy=-10;this.armor=360;for(let x=50;x<this.world.width;x+=80)fx.burst(x,this.world.ground,'#c8a06a',8);break;
      case'alt':this.aura=420;foe.hit(17,this.face*12,'ultimate',this,{hitstun:26});break;
      case'robert':foe.freeze=150;foe.hit(12,0,'ultimate',this,{hitstun:20});fx.add({t:'freeze',x:foe.x,y:foe.y,c:'#b9f2ff',l:150});break;
      case'virek':this.aura=330;this.shot(24,9,24,'beam',0,'#59ffc4');this.hp=clamp(this.hp+6,0,100);break;
      case'shadow':this.aura=360;[0,1,2,3].forEach((_,i)=>this.later(()=>this.shot(7,8,14,'orb',(i-1.5)*1.8,'#fff28a'),i*80));break;
      case'phanta':fx.add({t:'terra',x:0,y:0,c:'#ff2e78',l:150});foe.hit(20,this.face*7,'ultimate',this,{hitstun:28});this.aura=300;break;
      case'creed':foe.freeze=105;this.inv=105;[0,1,2,3].forEach((_,i)=>this.later(()=>foe.hit(4,this.face*3,'ultimate',this,{hitstun:10}),i*80));break;
      case'sage':this.aura=420;this.hp=clamp(this.hp+15,0,100);foe.hit(20,this.face*15,'ultimate',this,{hitstun:30});break;
      case'raggie':this.inv=180;this.hp=clamp(this.hp+12,0,100);foe.freeze=75;fx.burst(this.x,this.y,'#fff7a8',40);break;
      case'jimmy':foe.freeze=100;foe.hit(18,0,'ultimate',this,{hitstun:25});fx.add({t:'seal',x:foe.x,y:foe.y,c:'#ff8a24',l:100});break;
      case'jonathan':[0,1,2,3,4].forEach((_,i)=>this.later(()=>{foe.hit(4.2,this.face*4,'ultimate',this,{hitstun:12});fx.burst(foe.x,foe.y+50,'#ffd18f',12)},i*90));break;
    }
  }
  hit(baseDamage,knockback=0,kind='hit',attacker=null,move={}){
    const fx=this.world.effects;
    if(this.lens>0){const foe=this.foe(),oldX=this.x;this.x=clamp(foe.x-foe.face*72,15,this.world.width-this.w-15);if(Math.abs(this.x-foe.x)<45)this.x=clamp(oldX-this.face*105,15,this.world.width-this.w-15);this.inv=8;fx.burst(oldX+24,this.y+43,'#f7f7ff',18);fx.burst(this.x+24,this.y+43,'#f7f7ff',18);fx.add({t:'dodge',x:this.x+24,y:this.y+22,c:'#f7f7ff',l:20});this.world.sound(620,.06,'sine',.035);return 0}
    if(this.inv)return 0;
    if(this.id==='bark'&&this.block&&attacker&&kind!=='ultimate'){attacker.hp=clamp(attacker.hp-6,0,100);attacker.vx=-attacker.face*10;attacker.stun=20;fx.burst(attacker.x+24,attacker.y+40,'#c8a06a',18)}
    const nextHit=attacker&&!this.block?attacker.combo.hits+1:1;
    const result=calculateFinalDamage({base:baseDamage,hit:nextHit,kind,defense:this.c.d,armor:!!this.armor,lowHealthAlt:this.id==='alt'&&this.hp<35,blocked:this.block,trapped:!!this.trap});
    const before=this.hp;this.hp=clamp(this.hp-result.final,0,100);const actual=before-this.hp;
    if(actual>0&&this.world.training.enabled&&this.side===2&&this.world.training.dummy==='after')this.world.training.afterFirstHit=true;
    if(attacker&&!this.block&&actual>0){attacker.combo.hits=nextHit;attacker.combo.damage+=actual;attacker.combo.scale=result.scale;attacker.combo.timer=COMBO_RESET_FRAMES;attacker.combo.attacker=attacker.side;if(!this.grounded&&++this.juggles>=JUGGLE_LIMIT){this.knockdown=42;this.vy=9;knockback*=.45}}
    if(this.block&&kind!=='seal'){knockback*=.25;this.en=clamp(this.en+4,0,100)}
    this.vx=knockback;this.stun=this.block?5:(move.hitstun||12);fx.burst(this.x+24,this.y+43,this.c.a,14);this.world.sound(this.block?120:70,.07);this.world.shake=Math.max(this.world.shake,this.block?3:7);return actual;
  }
  draw(ctx){
    const c=this.c,x=this.x,y=this.y,m=x+24;ctx.save();if(this.inv&&Math.floor(this.inv/2)%2===0)ctx.globalAlpha=.48;
    if(this.aura||this.armor){ctx.strokeStyle=this.armor?'#c8a06a':c.a;ctx.lineWidth=5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=16;ctx.beginPath();ctx.ellipse(m,y+45,38+Math.sin(performance.now()/90)*3,55,0,0,Math.PI*2);ctx.stroke()}
    if(this.block){ctx.fillStyle='#9fe9ff55';ctx.beginPath();ctx.arc(m+this.face*18,y+42,36,-1.2,1.2);ctx.fill()}
    ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(m,this.world.ground+5,34,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=tint(c.c,-25,clamp);ctx.fillRect(x+7,y+61,13,25);ctx.fillRect(x+28,y+61,13,25);ctx.fillStyle=c.c;ctx.fillRect(x+5,y+28,38,38);ctx.fillStyle=tint(c.c,12,clamp);ctx.fillRect(x+(this.face>0?38:-2),y+33,12,31);ctx.fillRect(x+(this.face>0?-2:38),y+35,12,27);ctx.fillStyle='#d9a77c';ctx.beginPath();ctx.arc(m,y+20,18,0,Math.PI*2);ctx.fill();ctx.fillStyle=c.h;ctx.beginPath();ctx.arc(m,y+15,19,Math.PI,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+7,y+14);ctx.lineTo(x+15,y-2);ctx.lineTo(x+22,y+13);ctx.lineTo(x+30,y-5);ctx.lineTo(x+39,y+15);ctx.fill();ctx.fillStyle=c.a;ctx.fillRect(m+this.face*6-2,y+18,5,4);
    if(this.id==='raggie'){ctx.fillStyle='#f5f5f5';ctx.fillRect(x+9,y-18,10,24);ctx.fillRect(x+29,y-18,10,24)}if(this.id==='creed'){ctx.strokeStyle='#32ecff';ctx.lineWidth=3;ctx.strokeRect(x+8,y+7,32,22)}if(this.id==='sage'){ctx.strokeStyle='#fff38a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m,y+18,24,0,Math.PI*2);ctx.stroke()}if(this.id==='robert'){ctx.fillStyle='#d8f3ff';ctx.fillRect(x+5,y+25,38,5)}ctx.restore();
  }
}
