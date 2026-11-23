import {surface} from './chapter1-landscape.js?v=29a56c-worlds';

// Explicit scenery for each chapter. Collision and quest coordinates remain owned by the story.
const rebuilt=new Set(['tournament-hub','after-hours-tournament','resonance-facility','remote-highlands','echo-village','echo-mountain','echo-caverns','echo-sky','shadow-lookout','chapter5-outpost','chapter6-highlands','chapter7-relay','chapter8-core']);
export const hasChapterWorld=id=>rebuilt.has(id);
const meshes=new Map();
const noise=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function mesh(r,key,build,options){if(!meshes.has(key))meshes.set(key,build());r.landscapeMesh(key,meshes.get(key),options)}
function material(r,kind){
  r.worldMaterials??={};if(r.worldMaterials[kind])return r.worldMaterials[kind];
  const colors={limestone:'#d6c9ac',sand:'#b8a68a',rock:'#a89b88',grass:'#728269',metal:'#354754',slate:'#3d515a',roof:'#934b39',plaster:'#e0d5bb',water:'#488d9b'};
  const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=colors[kind]||colors.rock;ctx.fillRect(0,0,512,512);
  for(let i=0;i<13000;i++){ctx.fillStyle=i%2?'rgba(20,30,20,.035)':'rgba(255,243,204,.045)';ctx.fillRect(noise(i)*512,noise(i+77)*512,1+noise(i+3)*2,1+noise(i+9)*2)}
  if(['limestone','metal','slate'].includes(kind)){
    const size=kind==='limestone'?32:64;ctx.strokeStyle=kind==='metal'?'#1c2d39':'#736f6259';ctx.lineWidth=2;
    for(let y=0;y<512;y+=size)for(let x=0;x<512;x+=size){ctx.strokeRect(x+2,y+2,size-4,size-4);if(kind==='metal'){ctx.fillStyle='#829096';ctx.fillRect(x+7,y+7,3,3);ctx.fillRect(x+size-10,y+size-10,3,3)}}
  }
  if(kind==='roof'){ctx.strokeStyle='#482f2766';for(let x=0;x<512;x+=16){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke()}for(let y=0;y<512;y+=48){ctx.fillStyle='#deb38544';ctx.fillRect(0,y,512,2)}}
  return r.worldMaterials[kind]=r.createTexture(c);
}
function ground(r,key,w,d,kind,height=()=>0){mesh(r,key,()=>surface(72,54,(u,v)=>{const x=(u-.5)*w,z=(v-.5)*d;return[x,height(x,z),z]}),{texture:material(r,kind)})}
function path(r,key,a,b,width,kind='sand'){
  mesh(r,key,()=>surface(45,4,(u,v)=>{const x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u,dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),offset=(v-.5)*(width+Math.sin(u*21)*8);return[x-dz/l*(offset+Math.sin(u*Math.PI*2)*32),3,z+dx/l*(offset+Math.sin(u*Math.PI*2)*32)]}),{texture:material(r,kind)});
}
function rock(r,x,z,w,h,seed=0,y=0){
  mesh(r,`crag:${x}:${z}:${w}:${h}:${seed}:${y}`,()=>surface(9,8,(u,v)=>{
    const a=u*Math.PI*2,radius=Math.pow(1-v,.48)*(1+Math.sin(a*5+seed)*.13+Math.cos(a*3+seed)*.1),ledge=1+Math.sin(a*3+v*5+seed)*.06;
    return[x+Math.cos(a)*w*.5*radius*ledge,y+v*h+Math.sin(a*4+seed)*h*.07*v,z+Math.sin(a)*w*.39*radius*ledge];
  }),{texture:material(r,'rock'),color:seed%2?'#e0d1bc':'#c4b49e'});
}
function pine(r,x,z,s=1,y=0){
  r.disc({x:x+10,y:y+1,z:z+8,rx:36*s,rz:25*s,color:'#172f27',alpha:.18});
  r.cylinder({x,y:y+64*s,z,rx:7*s,sy:128*s,color:'#675443'});
  for(let i=0;i<4;i++)r.cone({x:x+Math.sin(i)*5*s,y:y+(83+i*30)*s,z,rx:(53-i*9)*s,rz:(48-i*8)*s,sy:(100-i*13)*s,color:['#334d3c','#3a5942','#47664a','#577553'][i]});
}
function roof(r,x,y,z,w,d,h=65,color='#ffffff'){
  mesh(r,`roof:${x}:${y}:${z}:${w}:${d}:${h}`,()=>surface(24,18,(u,v)=>{
    const q=Math.abs(v*2-1),eave=Math.max(0,(q-.8)/.2);
    return[x+(u-.5)*w,y+h*(1-q)+eave*eave*18+Math.abs(u-.5)**6*140,z+(v-.5)*d];
  }),{texture:material(r,'roof'),color});
  r.box({x,y:y+h+2,z,sx:w*.94,sy:7,sz:10,color:'#c2a075'});
}
function hall(r,x,z,w=370,d=230,h=150,color='#e0d5bb',elevation=0,face=1){
  const previousHeight=r.groundHeight;if(elevation)r.groundHeight=()=>elevation;
  r.box({x,y:9,z,sx:w+28,sy:18,sz:d+24,color:'#8b816d',texture:material(r,'limestone')});
  r.box({x,y:h/2+17,z,sx:w,sy:h,sz:d,color,texture:material(r,'plaster')});
  roof(r,x,h+26,z,w+72,d+76,75);
  const front=z+face*(d/2+4);
  for(let i=-2;i<=2;i++){
    const px=x+i*w*.19;r.cylinder({x:px,y:h*.49+18,z:front,rx:6,sy:h,color:'#71533c'});
    if(i!==0){r.box({x:px,y:h*.59+18,z:front+2,sx:w*.13,sy:h*.33,sz:5,color:'#627569'});for(const off of [-1,0,1])r.box({x:px+off*w*.035,y:h*.59+18,z:front+7,sx:3,sy:h*.33,sz:4,color:'#d7c39c'})}
  }
  r.box({x,y:65,z:front+4,sx:57,sy:94,sz:8,color:'#383b32'});r.box({x,y:9,z:front+face*28,sx:95,sy:18,sz:56,color:'#baae94'});
  r.groundHeight=previousHeight;
}
function lantern(r,x,z,y=122){r.cylinder({x,y,z,rx:13,sy:25,color:'#e8b85c',lit:false});r.cylinder({x,y:y+15,z,rx:16,sy:5,color:'#60483a'});r.billboard({x,y,z,size:60,color:'#ffc76d',alpha:.1})}
function courtyard(r,night){
  ground(r,'campus-floor',4000,2700,night?'slate':'limestone');
  // Grass courts, stone garden walls and mature trees break up the tiled expanse.
  for(const [x,z,w,d] of [[-1030,-770,720,250],[-1050,950,1000,200],[400,920,1300,210],[1200,-900,750,220]]){
    r.box({x,y:3,z,sx:w,sy:4,sz:d,color:night?'#30463b':'#638451',texture:material(r,'grass')});
    for(let i=0;i<4;i++)pine(r,x-w*.38+i*w*.24,z,.85);
    r.box({x,y:26,z:z-d/2,sx:w,sy:44,sz:18,color:'#b4a58a',texture:material(r,'limestone')});
  }
  hall(r,-120,-620,370,220,150);hall(r,640,-540,300,220,160,'#c4d2c2');hall(r,1010,-470,310,210,155);
  // Main arena hall faces the broad central avenue, with a deep portico.
  hall(r,1530,40,400,1240,270);roof(r,1530,346,40,325,900,80);
  for(const z of [-410,-200,10,220,430]){r.cylinder({x:1270,y:126,z,rx:13,sy:248,color:'#ded1b4'});r.box({x:1318,y:108,z,sx:10,sy:170,sz:92,color:'#3b3d34'})}
  for(const z of [-210,350])r.cylinder({x:-1650,y:105,z,rx:21,sy:210,color:'#bc7659'});
  roof(r,-1650,220,70,160,760,65);
  // Practice square is clearly a ring, rather than another dark ground disc.
  r.box({x:-1120,y:8,z:560,sx:480,sy:16,sz:350,color:'#d9c9a9',texture:material(r,'limestone')});
  for(const z of [330,790])for(const x of [-1385,-1120,-855])r.cylinder({x,y:40,z,rx:6,sy:80,color:'#75513d'});
  for(const [x,z,c] of [[-680,620,'#c08a6a'],[-300,650,'#6c9494'],[130,610,'#baa062']]){
    for(const side of [-1,1])r.cylinder({x:x+side*90,y:48,z,rx:5,sy:96,color:'#694c36'});
    r.gableRoof({x,y:104,z,sx:235,sy:36,sz:180,color:c});r.box({x,y:30,z,sx:190,sy:55,sz:100,color:'#7c6043'});
    for(let i=0;i<5;i++)r.sphere({x:x-60+i*30,y:62,z:z+20,sx:17,sy:14,sz:17,color:i%2?'#b8ab6b':'#927950'});
  }
  // A broad ceremonial court anchors the campus between the entrances.
  r.box({x:-280,y:6,z:40,sx:650,sy:12,sz:480,color:'#b7a78b'});
  r.box({x:-280,y:14,z:40,sx:610,sy:6,sz:440,color:'#e2d8bd',texture:material(r,'limestone')});
  for(const z of [-166,246])r.box({x:-280,y:18,z,sx:592,sy:2,sz:8,color:'#9b5240'});
  for(const x of [-574,14])r.box({x,y:18,z:40,sx:8,sy:2,sz:412,color:'#9b5240'});
  r.disc({x:-280,y:18,z:40,rx:76,rz:76,color:'#ad6349',alpha:.8});
  r.disc({x:-280,y:18.5,z:40,rx:58,rz:58,color:'#e7d7ad'});
  // Lanterns sit along the avenue edges, leaving quest and race lanes open.
  for(let i=0;i<9;i++)for(const z of [-160,220]){const x=-1350+i*290;r.cylinder({x,y:65,z,rx:5,sy:130,color:'#68513a'});lantern(r,x,z,139)}
  if(night)for(const x of [-700,-100,500])r.disc({x,y:2,z:80,rx:120,rz:80,color:'#d1b377',alpha:.06});
}
function machinery(r,x,z,seed){
  r.box({x,y:24,z,sx:134,sy:48,sz:118,color:'#2c424f',texture:material(r,'metal')});
  r.cylinder({x,y:69,z,rx:35,sy:45,color:'#8c9e9e'});
  const sign=seed%2?-1:1,arm=[{x,y:90,z},{x:x+sign*36,y:189,z:z-25},{x:x+sign*104,y:218,z:z-74},{x:x+sign*139,y:144,z:z-115}];
  for(let i=0;i<3;i++){r.segment(arm[i],arm[i+1],{width:23-i*4,height:25-i*4,color:i%2?'#b5b6a4':'#5e7a83'});r.sphere({...arm[i],sx:38-i*5,sy:38-i*5,sz:38-i*5,color:'#263d4a'})}
  const tool=arm[3];r.cylinder({...tool,rx:14,sy:26,color:'#5fd3d8',lit:false});
  for(const side of [-1,1])r.segment({...tool,y:tool.y-10},{x:tool.x+side*13,y:tool.y-40,z:tool.z},{width:5,height:5,color:'#b9c5bd'});
}
function factory(r,core){
  ground(r,'metal-floor',2800,1800,'metal');
  // Cutaway factory shell: tall rear glazing, layered columns, roof trusses.
  for(let i=0;i<8;i++){
    const x=-1100+i*315;r.box({x,y:150,z:-760,sx:12,sy:300,sz:23,color:'#738b94'});
    r.box({x:x+150,y:165,z:-765,sx:280,sy:180,sz:7,color:'#386473',alpha:.75});
    r.box({x:x+150,y:95,z:-758,sx:280,sy:6,sz:8,color:'#6f8589'});
    r.box({x,y:312,z:-520,sx:18,sy:18,sz:510,color:'#536f7e'});
    r.segment({x,y:310,z:-760},{x:x+155,y:360,z:-760},{width:8,height:9,color:'#71858c'});
    r.segment({x:x+155,y:360,z:-760},{x:x+315,y:310,z:-760},{width:8,height:9,color:'#71858c'});
  }
  if(!core){
    for(const z of [-420,420]){
      r.box({x:0,y:30,z,sx:1910,sy:50,sz:160,color:'#1d313c'});
      for(let i=0;i<35;i++){const x=-920+i*54;r.box({x,y:58,z,sx:45,sy:5,sz:133,color:i%2?'#4d6570':'#617982'})}
      for(const side of [-1,1])r.segment({x:-950,y:70,z:z+side*78},{x:950,y:70,z:z+side*78},{width:4,height:5,color:'#70d7dd',lit:false});
      for(let i=0;i<5;i++)machinery(r,-800+i*390,z+(z<0?-155:155),i);
    }
    for(const x of [-970,940]){
      r.cylinder({x,y:110,z:-500,rx:65,sy:220,color:'#536f79'});for(const y of [18,198])r.cylinder({x,y,z:-500,rx:73,sy:11,color:'#9aacaf'});
    }
  }else{
    // A reactor chamber with radial services and a suspended Emerald cage.
    const x=390,z=-480;r.cylinder({x,y:20,z,rx:217,rz:190,sy:40,color:'#667a82'});
    r.cylinder({x,y:182,z,rx:104,rz:104,sy:310,color:'#1b3b4b'});
    r.cylinder({x,y:182,z,rx:73,rz:73,sy:286,color:'#5eb6bb',alpha:.85,lit:false});
    for(const y of [44,95,270,335])r.cylinder({x,y,z,rx:133,sy:15,color:'#a8b6ae'});
    for(let i=0;i<8;i++){const a=i*Math.PI/4,px=x+Math.cos(a)*171,pz=z+Math.sin(a)*150;r.cylinder({x:px,y:197,z:pz,rx:8,sy:350,color:'#79949b'});r.segment({x:px,y:24,z:pz},{x:px+Math.cos(a)*160,y:24,z:pz+Math.sin(a)*160},{width:20,height:14,color:'#367280'})}
    r.cone({x,y:388,z,rx:32,sy:82,color:'#89dfba',lit:false});r.cone({x,y:350,z,rx:32,sy:54,color:'#57bfa5',lit:false});
    for(const [cx,cz] of [[-540,-390],[-540,390],[780,380]]){r.box({x:cx,y:55,z:cz,sx:210,sy:110,sz:90,color:'#304f5b',texture:material(r,'metal')});r.box({x:cx,y:87,z:cz+48,sx:157,sy:30,sz:4,color:'#70d4c8',lit:false})}
  }
  for(const z of [-300,300]){r.segment({x:-1100,y:6,z},{x:1100,y:6,z},{width:5,height:1,color:'#bbaa6b',alpha:.7});for(let i=0;i<12;i++)r.box({x:-1000+i*180,y:7,z:z+12,sx:26,sy:1,sz:4,color:'#bbaa6b',rotationY:.7})}
  for(const x of [-800,-300,200,700]){r.box({x,y:324,z:-250,sx:160,sy:7,sz:17,color:'#a3d5d4',lit:false});r.disc({x,y:3,z:-250,rx:120,rz:170,color:'#68c0d3',alpha:.045})}
}
const highland=(x,z)=>Math.max(0,(Math.abs(z)-230)/650)*(35+48*(1+Math.sin(x/400)));
function wilderness(r,id){
  const mountain=id==='echo-mountain',village=id==='echo-village',cave=id==='echo-caverns';
  ground(r,'land-'+id,mountain?3900:4000,2700,cave?'slate':village?'sand':'grass',cave?()=>0:highland);
  if(cave){
    for(let i=0;i<22;i++){const x=-1300+i*123,z=i%2?-650:650;rock(r,x,z,220+noise(i)*130,300+noise(i+4)*210,i)}
    for(const [x,z] of [[-950,380],[-620,-430],[-30,440],[470,-460],[1030,360]]){
      r.disc({x,y:2,z,rx:110,rz:70,color:'#4c9aa4',alpha:.19});r.cone({x,y:108,z,rx:34,sy:215,color:'#689e9d'});r.cone({x:x+24,y:69,z:z+10,rx:20,sy:138,color:'#96bcb1'});
    }
    for(let i=0;i<6;i++)r.cylinder({x:-960+i*370,y:8,z:Math.sin(i*2)*100,rx:56,rz:38,sy:15,color:'#778b85',texture:material(r,'slate')});
    return;
  }
  for(let i=0;i<22;i++){
    const x=-1800+i*170,z=(i%2?-1:1)*(750+noise(i)*260),h=mountain?340+noise(i+3)*270:220+noise(i+2)*220;
    rock(r,x,z,260+noise(i+7)*160,h,i,highland(x,z)-15);
    if(i%2===0)pine(r,x+100,z-80,1.1,highland(x+100,z-80));
  }
  for(let i=0;i<40;i++){
    const x=-1450+noise(i+124)*2900,z=(i%2?-1:1)*(240+noise(i+89)*360),y=highland(x,z);
    if(village&&z>450&&x>-400&&x<500)continue;
    r.sphere({x,y:y+7,z,sx:18+noise(i)*22,sy:16,sz:25,color:i%2?'#858b6b':'#9b9d7b'});
    if(i%3===0)for(let j=0;j<3;j++)r.cone({x:x+j*5,y:y+14,z:z+j*4,rx:3,sy:28+j*3,color:'#727f54'});
  }
  if(village){
    path(r,'village-lane',[-1480,90],[1350,120],145);
    for(const [x,z,w,d,h] of [[260,610,270,205,135],[-100,610,160,155,112],[80,610,160,155,115],[-820,-400,250,180,130],[710,-510,230,180,140],[-1210,-460,180,170,110],[-300,610,160,155,140],[470,610,160,155,140],[-520,210,150,135,110],[-280,360,150,135,115],[10,210,150,135,110],[300,380,150,135,114],[610,200,150,135,112],[-120,-330,150,135,110],[230,-410,150,135,115],[560,-300,150,135,112]]){
      hall(r,x,z,w,d,h,'#bcac8b',highland(x,z),z>0?-1:1);
      for(const side of [-1,1])r.cylinder({x:x+side*w*.4,y:16,z:z+d*.6,rx:15,sy:30,color:'#857d5a'});
    }
    // Low dry-stone retaining terraces, open stairways and village well.
    for(const z of [-640,790])for(let i=0;i<25;i++)r.sphere({x:-1370+i*110,y:18,z,sx:113,sy:38,sz:44,color:i%2?'#938771':'#b3a48a'});
    r.cylinder({x:-460,y:25,z:390,rx:61,sy:50,color:'#968c75',texture:material(r,'limestone')});r.cylinder({x:-460,y:52,z:390,rx:44,sy:4,color:'#344d4c'});
    for(const x of [-510,-410])r.cylinder({x,y:92,z:390,rx:5,sy:140,color:'#6d543c'});roof(r,-460,165,390,165,120,35);
  }else{
    path(r,'trail-'+id,[-1400,0],[1300,0],165,'sand');
    for(const [x,z,w,h] of [[-720,240,300,190],[-180,-280,260,220],[430,250,300,270]])rock(r,x,z,w,h,Math.abs(x));
    for(let i=0;i<13;i++){const x=-1200+i*190,z=(i%2?-1:1)*(370+noise(i)*110);pine(r,x,z,.7+noise(i+50)*.7,highland(x,z))}
  }
}
function floating(r,lookout){
  const x=lookout?450:0,z=lookout?-80:0;
  // One continuous stone island large enough for the existing playable bounds.
  mesh(r,'floating-top-'+lookout,()=>surface(64,40,(u,v)=>{const a=u*Math.PI*2,rad=v;return[x+Math.cos(a)*rad*(lookout?2000:1020),0,z+Math.sin(a)*rad*(lookout?1250:780)]}),{texture:material(r,'limestone')});
  for(let i=0;i<30;i++){const a=i/30*Math.PI*2,px=x+Math.cos(a)*(lookout?1950:980),pz=z+Math.sin(a)*(lookout?1190:740);rock(r,px,pz,240,130,i,-130)}
  r.sphere({x,y:-150,z,sx:lookout?3500:1800,sy:290,sz:lookout?2100:1300,color:'#798b88'});
  for(let i=0;i<9;i++){const a=i*2.4,px=x+Math.cos(a)*(1500+i*75),pz=z+Math.sin(a)*(1100+i*45);r.sphere({x:px,y:-160-i*15,z:pz,sx:330,sy:90,sz:160,color:'#e0eeee',alpha:.28,lit:false})}
  if(lookout){
    const cx=930,cz=-310;r.cylinder({x:cx,y:16,z:cz,rx:310,rz:255,sy:32,color:'#a59279'});
    r.cylinder({x:cx,y:34,z:cz,rx:285,rz:230,sy:8,color:'#eee1bd',texture:material(r,'limestone')});
    r.cylinder({x:cx,y:115,z:cz-65,rx:100,rz:90,sy:166,color:'#e4dbc2'});r.sphere({x:cx,y:207,z:cz-65,sx:216,sy:124,sz:193,color:'#83a7a4'});
    for(let i=0;i<8;i++){const a=i*Math.PI/4,px=cx+Math.cos(a)*230,pz=cz+Math.sin(a)*180;r.cylinder({x:px,y:107,z:pz,rx:10,sy:150,color:'#ece2ca'});r.cylinder({x:px,y:183,z:pz,rx:19,sy:9,color:'#ba9b6a'})}
    for(const px of [520,1340]){pine(r,px,-310,.9);r.cylinder({x:px,y:12,z:-310,rx:62,sy:24,color:'#b7bba0'})}
  }else{
    r.cylinder({x:0,y:8,z:0,rx:430,rz:330,sy:16,color:'#c9cbb8',texture:material(r,'limestone')});
    for(let i=0;i<10;i++){const a=i*Math.PI/5;r.cylinder({x:Math.cos(a)*570,y:24,z:Math.sin(a)*420,rx:16,sy:48,color:'#b9ad92'})}
  }
}
function redSites(r,id){
  const relay=id==='chapter7-relay',outpost=id==='chapter5-outpost';
  ground(r,'red-land-'+id,3600,2600,relay?'rock':'grass',highland);
  path(r,'red-access-'+id,[-1400,80],[1400,80],outpost?185:140,'sand');
  for(let i=0;i<19;i++){const x=-1570+i*185,z=(i%2?-1:1)*(690+noise(i)*170);rock(r,x,z,220+noise(i)*180,180+noise(i+5)*220,i,highland(x,z));if(i%3===0)pine(r,x-100,z,.9,highland(x-100,z))}
  if(outpost){
    // Observation compound: stone bunker, separate workshop and tracking dish.
    r.box({x:515,y:74,z:-465,sx:520,sy:148,sz:350,color:'#939888',texture:material(r,'metal')});
    r.box({x:515,y:151,z:-465,sx:550,sy:14,sz:380,color:'#c2bda1'});
    for(const x of [335,695]){r.box({x,y:90,z:-287,sx:95,sy:42,sz:5,color:'#2c5358'});r.box({x,y:90,z:-283,sx:4,sy:44,sz:6,color:'#b8b89e'})}
    r.box({x:515,y:48,z:-284,sx:75,sy:96,sz:12,color:'#344348'});
    r.cylinder({x:560,y:219,z:-490,rx:11,sy:120,color:'#697c7c'});r.sphere({x:560,y:286,z:-490,sx:185,sy:45,sz:148,color:'#b1bdb0'});
    for(let i=0;i<3;i++)r.box({x:330+i*135,y:171,z:-410,sx:95,sy:18,sz:90,color:'#375b6d',rotationY:.1});
    hall(r,-520,470,290,185,105,'#929e8b');
    for(const x of [200,830]){r.cylinder({x,y:112,z:-660,rx:9,sy:224,color:'#66746b'});r.cylinder({x,y:230,z:-660,rx:27,sy:16,color:'#dbb575',lit:false})}
  }else{
    // Relay 7 is a stone plateau with lattice towers; Chapter 6 uses lower beacon pylons.
    // The plateau is the terrain mesh itself; an overlapping slab causes depth flicker.
    for(const [x,z,h] of [[-760,-470,330],[-260,480,290],[290,-470,390],[780,460,330]]){
      for(const side of [-1,1])r.cylinder({x:x+side*28,y:h/2,z,rx:7,sy:h,color:'#6e8584'});
      for(let j=0;j<4;j++){const y=28+j*h/4;r.segment({x:x-28,y,z},{x:x+28,y:y+h/4,z},{width:5,height:5,color:'#8f9b90'});r.box({x,y,z,sx:70,sy:6,sz:52,color:'#6d7c79'})}
      r.cylinder({x,y:h,z,rx:relay?62:41,rz:30,sy:20,color:relay?'#7ba9a6':'#bc715b'});r.cylinder({x,y:h+13,z,rx:16,sy:10,color:'#82ddc8',lit:false});
    }
    hall(r,relay?420:250,relay?245:145,relay?190:330,145,82,'#9aab9c');
    if(relay)for(let i=0;i<3;i++)r.segment({x:-760+i*510,y:240,z:i%2?480:-470},{x:-250+i*510,y:240,z:i%2?-470:480},{width:3,height:3,color:'#456573'});
  }
}
export function drawChapterWorld(r,stage){
  const id=stage.id;if(!hasChapterWorld(id))return false;
  r.chapterWorldRebuilt=true;
  if(id==='tournament-hub'||id==='after-hours-tournament')courtyard(r,id.startsWith('after'));
  else if(id==='resonance-facility'||id==='chapter8-core')factory(r,id==='chapter8-core');
  else if(id==='echo-sky'||id==='shadow-lookout')floating(r,id==='shadow-lookout');
  else if(id.startsWith('chapter'))redSites(r,id);
  else wilderness(r,id);
  // Natural slopes are rendered under actors using the same height function.
  if(['echo-village','echo-mountain','remote-highlands','chapter5-outpost','chapter6-highlands','chapter7-relay'].includes(id))r.groundHeight=highland;
  return true;
}
