/* Prototype 2.9A.21 — visual-only Story hub identity pass.
   New renderer primitives create genuine sloped roofs, round pillars, pine trees,
   stonework, and varied silhouettes without changing combat or collision maps. */
function lantern(r,x,y,z,color='#ffb34c',scale=1){
  r.cylinder({x,y:y-8*scale,z,rx:4*scale,sy:22*scale,color:'#443126',alpha:.96});
  r.cylinder({x,y,z,rx:10*scale,sy:18*scale,color,alpha:.95,lit:false});
  r.cone({x,y:y+13*scale,z,rx:13*scale,sy:9*scale,color:'#56382d',alpha:.96});
  r.billboard({x,y,z,size:32*scale,color,alpha:.14});
}
function pine(r,x,z,scale=1,tint='#2f6842'){
  r.cylinder({x,y:48*scale,z,rx:9*scale,sy:96*scale,color:'#58402f',alpha:.98});
  r.cone({x,y:102*scale,z,rx:48*scale,sy:78*scale,color:tint,alpha:.97});
  r.cone({x,y:137*scale,z,rx:40*scale,sy:72*scale,color:'#39784a',alpha:.96});
  r.cone({x,y:170*scale,z,rx:30*scale,sy:60*scale,color:'#4b8a55',alpha:.94});
}
function broadleaf(r,x,z,scale=1,tint='#39764a'){
  r.cylinder({x,y:48*scale,z,rx:11*scale,sy:96*scale,color:'#62442f',alpha:.97});
  r.billboard({x:x-16*scale,y:116*scale,z,size:72*scale,color:tint,alpha:.92});
  r.billboard({x:x+27*scale,y:135*scale,z:z+8*scale,size:60*scale,color:'#4b8a55',alpha:.9});
  r.billboard({x:x-30*scale,y:144*scale,z:z-7*scale,size:55*scale,color:'#5a965c',alpha:.86});
}
function banner(r,x,y,z,color,rotation=0,crest='#f3d36a'){
  r.cylinder({x,y:y-12,z,rx:4,sy:188,color:'#3b2a22',alpha:.96});
  r.box({x,y:y+38,z,sx:58,sy:92,sz:5,rotationY:rotation,color,alpha:.94,lit:false});
  r.disc({x,y:y+43,z:z-4,rx:15,rz:15,color:crest,alpha:.75});
  r.box({x,y:y+88,z,sx:70,sy:7,sz:7,rotationY:rotation,color:'#3b2a22',alpha:.95});
}
function stoneBoulder(r,x,z,scale=1,tint='#6d716b'){
  r.cylinder({x,y:18*scale,z,rx:28*scale,rz:22*scale,sy:36*scale,color:tint,rotationY:.3});
  r.cone({x:x-6*scale,y:39*scale,z:z+2*scale,rx:24*scale,rz:19*scale,sy:24*scale,color:'#85887f',rotationY:-.2});
}
function toriiTrailGate(r,x,z,scale=1){
  for(const dx of [-82,82])r.cylinder({x:x+dx*scale,y:82*scale,z,rx:10*scale,sy:164*scale,color:'#684632'});
  r.box({x,y:149*scale,z,sx:210*scale,sy:20*scale,sz:28*scale,color:'#9a343b'});
  r.gableRoof({x,y:171*scale,z,sx:250*scale,sy:30*scale,sz:46*scale,color:'#552a32'});
  r.box({x,y:118*scale,z:z-16*scale,sx:98*scale,sy:38*scale,sz:8*scale,color:'#2f2520'});
}
function tournamentPillar(r,x,z,height=190,color='#e2d3b2'){
  r.cylinder({x,y:height/2,z,rx:24,sy:height,color,alpha:.98});
  r.cylinder({x,y:12,z,rx:34,sy:22,color:'#8e6b4f'});
  r.cylinder({x,y:height-8,z,rx:32,sy:20,color:'#b9463f'});
}
function tournamentRoof(r,x,y,z,sx,sz,color='#8d2434',rotationY=0){
  r.gableRoof({x,y,z,sx,sy:54,sz,rotationY,color,alpha:.99});
  r.box({x,y:y-25,z,sx:sx*1.08,sy:10,sz:sz*1.08,rotationY,color:'#d3a84b',alpha:.92});
}
function martialStatue(r,x,z,flip=1){
  r.cylinder({x,y:18,z,rx:34,sy:36,color:'#8c8173'});
  r.cylinder({x,y:70,z,rx:19,sy:75,color:'#665f59'});
  r.cylinder({x,y:118,z,rx:15,sy:26,color:'#787169'});
  r.segment({x,y:86,z},{x:x+flip*38,y:118,z:z-4},{width:10,height:10,color:'#665f59'});
  r.segment({x,y:82,z},{x:x-flip*30,y:55,z:z+5},{width:10,height:10,color:'#665f59'});
}

export function drawTournamentLandmarks(r,time,{afterHours=false}={}){
  const light=afterHours?'#8fc9d2':'#ffd06c',roof=afterHours?'#4b2730':'#8d2434',stone=afterHours?'#4f5854':'#dfd2b4';
  // Stone courtyards and a circular ceremonial plaza make the ground read differently from Chapter 1.
  r.disc({x:-280,y:9,z:40,rx:360,rz:310,color:afterHours?'#55615d':'#eee0bd',alpha:.96});
  r.disc({x:-280,y:10,z:40,rx:190,rz:165,color:afterHours?'#3c4c49':'#c94a42',alpha:.24});
  for(let i=0;i<12;i++){
    const a=i/12*Math.PI*2;
    r.segment({x:-280+Math.cos(a)*205,y:12,z:40+Math.sin(a)*178},{x:-280+Math.cos(a)*315,y:12,z:40+Math.sin(a)*270},{width:7,height:2,color:afterHours?'#84928c':'#a77c55',alpha:.52,lit:false});
  }

  // Monumental west gate with round columns and a sloped tiled roof.
  tournamentPillar(r,-1585,5,225,stone);tournamentPillar(r,-1425,5,225,stone);
  r.box({x:-1505,y:205,z:5,sx:245,sy:32,sz:86,color:roof,alpha:.99});
  tournamentRoof(r,-1505,248,5,310,115,roof);
  r.box({x:-1505,y:166,z:-42,sx:112,sy:58,sz:12,color:'#31231f'});
  r.disc({x:-1505,y:168,z:-50,rx:26,rz:26,color:light,alpha:.55});
  lantern(r,-1572,158,-43,light,.85);lantern(r,-1438,158,-43,light,.85);
  martialStatue(r,-1670,170,1);martialStatue(r,-1340,170,-1);

  // Registration hall now has actual gabled architecture and a front colonnade.
  r.box({x:-120,y:78,z:-620,sx:370,sy:150,sz:220,color:stone,alpha:.99});
  tournamentRoof(r,-120,185,-620,455,290,roof);
  tournamentRoof(r,-120,226,-620,325,205,'#b9473c');
  for(let i=-2;i<=2;i++)tournamentPillar(r,-120+i*72,-500,126,'#795344');
  for(let i=-2;i<=2;i++)lantern(r,-120+i*72,126,-492,light,.58);
  r.box({x:-120,y:102,z:-501,sx:124,sy:48,sz:10,color:'#3a2922'});

  // 40.4 enterable medical center: solid clinic shell with a readable front door and recovery-window glow.
  r.box({x:640,y:82,z:-540,sx:300,sy:160,sz:220,color:afterHours?'#65716d':'#d8d4c5',alpha:.99});
  tournamentRoof(r,640,190,-540,350,270,afterHours?'#405257':'#5c9fa4');
  r.box({x:640,y:72,z:-425,sx:92,sy:136,sz:18,color:'#332f2b'});
  r.box({x:640,y:150,z:-423,sx:118,sy:18,sz:24,color:'#7bc4c7'});
  for(const x of [545,735]){r.box({x,y:102,z:-428,sx:58,sy:68,sz:10,color:afterHours?'#8ab2b3':'#b9e4df',alpha:afterHours?.24:.48});r.billboard({x,y:102,z:-438,size:22,color:'#9ce9e0',alpha:afterHours?.18:.26})}
  r.disc({x:640,y:160,z:-430,rx:18,rz:18,color:'#f4f0dc',alpha:.82});

  // 40.4 backstage annex: a practical fighter entrance rather than an invisible interaction point.
  r.box({x:1010,y:80,z:-470,sx:310,sy:155,sz:210,color:afterHours?'#55565a':'#b4a994',alpha:.99});
  tournamentRoof(r,1010,185,-470,360,260,afterHours?'#382f39':'#6c586c');
  r.box({x:1010,y:70,z:-360,sx:100,sy:132,sz:18,color:'#302a29'});
  r.box({x:1010,y:148,z:-358,sx:132,sy:18,sz:22,color:'#d2aa4f'});
  for(const x of [910,1110])r.box({x,y:100,z:-362,sx:54,sy:60,sz:10,color:afterHours?'#6f7580':'#d8c9b0',alpha:.35});

  // Arena facade: tiered roof silhouette, colonnade, dark entries, and trophy crest.
  r.box({x:1370,y:135,z:40,sx:510,sy:270,sz:430,color:stone,alpha:.99});
  tournamentRoof(r,1370,286,40,650,535,roof);
  tournamentRoof(r,1370,338,40,485,390,'#b7473c');
  for(let i=-3;i<=3;i++){
    const x=1190+i*60;
    tournamentPillar(r,x,-188,190,i%2?stone:'#eadfc8');
    r.box({x,y:106,z:-199,sx:32,sy:128,sz:15,color:'#282320',alpha:.98});
  }
  r.disc({x:1370,y:248,z:-210,rx:48,rz:48,color:'#d7b34c',alpha:.92});
  r.disc({x:1370,y:248,z:-214,rx:25,rz:25,color:'#b23c3f',alpha:.96});
  for(let i=0;i<7;i++)lantern(r,1190+i*60,196,-215,light,.55);

  // Market street becomes an open festival arcade with peaked canvas awnings.
  const stalls=[[-650,650,'#d34d53'],[-505,690,'#e1a43e'],[-360,645,'#4c8ca8'],[-215,675,'#7c5ba5']];
  for(const [x,z,color] of stalls){
    r.box({x,y:42,z,sx:110,sy:72,sz:80,color:'#76533c',alpha:.97});
    r.gableRoof({x,y:95,z,sx:145,sy:45,sz:112,color,alpha:.96});
    r.box({x,y:58,z:z-47,sx:104,sy:10,sz:18,color:'#ead7ad',alpha:.95});
    r.cylinder({x:x-47,y:48,z:z-42,rx:4,sy:96,color:'#49352a'});
    r.cylinder({x:x+47,y:48,z:z-42,rx:4,sy:96,color:'#49352a'});
    lantern(r,x-48,112,z-46,light,.46);lantern(r,x+48,112,z-46,light,.46);
  }

  // Practice grounds use martial totems and stone fencing instead of forest props.
  for(const x of [-1360,-1240,-1000,-880]){
    r.cylinder({x,y:45,z:780,rx:9,sy:90,color:'#5b3d2f'});
    r.cylinder({x,y:94,z:780,rx:25,sy:18,color:'#c34640'});
  }
  for(const [x,z] of [[-1325,480],[-905,840],[420,-740],[820,-680],[940,700]])broadleaf(r,x,z,.78,afterHours?'#304a3b':'#3b814d');
  for(const [i,x] of [-790,-570,-350,430,660,890].entries())banner(r,x,86,i%2?365:-365,i%2?'#e6b43f':'#b52f46',0,i%2?'#7b3038':'#f4dd7b');

  // Hanging lantern boulevard gives Chapter 2 a strong festival skyline.
  for(let i=0;i<10;i++){
    const x=-760+i*175,y=246+Math.sin(time*1.7+i)*3,z=-15;
    r.segment({x,y,z},{x:x+130,y:y+Math.sin(time*2+i)*3,z},{width:2,height:1,color:'#7d5f42',alpha:.72,lit:false});
    lantern(r,x+65,y-20,z,light,.42);
  }
  // Bright festival sun / cool after-hours moon.
  r.billboard({x:840,y:670,z:-1080,size:afterHours?150:190,color:afterHours?'#bde8ff':'#fff0a0',alpha:afterHours?.36:.44});
}

export function drawRoadLandmarks(r,time){
  // Chapter 1 is a natural mountain trail: pines, rocks, fences, cliff silhouettes, and small training shrines.
  const pinePositions=[];
  for(let i=0;i<18;i++)pinePositions.push([-1420+i*165,(i%2?590:-590)+Math.sin(i*1.9)*80,.72+(i%3)*.09]);
  for(const [x,z,scale] of pinePositions)pine(r,x,z,scale,iColor(x));
  function iColor(x){return Math.abs(Math.round(x/165))%3===0?'#285d3b':'#336d43'}

  // Rocky ridges frame the road without becoming collision objects.
  for(let i=0;i<11;i++){
    const x=-1380+i*270;
    stoneBoulder(r,x,(i%2?735:-735)+Math.sin(i)*45,.75+(i%3)*.14,i%2?'#666c66':'#74786f');
  }
  // Dirt trail patches are deliberately irregular rather than a tiled plaza.
  for(let i=0;i<13;i++){
    const x=-1280+i*215,z=Math.sin(i*.85)*45;
    r.disc({x,y:9,z,rx:150+(i%3)*24,rz:82+(i%2)*18,color:i%2?'#b69362':'#c2a06c',alpha:.76});
  }
  // Split-log fences and training posts.
  for(const z of [-360,360]){
    for(let i=0;i<6;i++){
      const x=-1180+i*210;
      r.cylinder({x,y:34,z,rx:6,sy:68,color:'#65442f'});
      r.segment({x:x-75,y:42,z},{x:x+75,y:52,z},{width:8,height:8,color:'#765138'});
    }
  }
  for(const [x,z] of [[-1110,250],[-930,-250],[-720,250]]){
    r.cylinder({x,y:54,z,rx:12,sy:108,color:'#694531'});
    r.cylinder({x,y:90,z,rx:28,sy:30,color:'#a74a3f'});
    r.segment({x,y:108,z},{x:x+34,y:140,z:z-10},{width:7,height:7,color:'#d6b84f'});
  }
  // Small creek-side stepping stones and reeds reinforce wilderness.
  for(let i=0;i<7;i++)stoneBoulder(r,-10+i*28,-115+i*38,.42,i%2?'#6c716b':'#7d8178');
  for(const z of [-500,-390,390,500]){
    for(let i=0;i<5;i++)r.segment({x:45+i*12,y:20,z},{x:40+i*14,y:58+(i%2)*8,z:z+8},{width:2,height:2,color:'#5c8b46',alpha:.9});
  }

  // A single distant trail gate foreshadows the tournament but does not turn the road into a festival.
  toriiTrailGate(r,865,0,.95);
  for(let i=0;i<4;i++)banner(r,1110+i*125,76,i%2?330:-330,i%2?'#d5a838':'#b83243',0,'#f4df82');
  // Warm sun, birds, and a distant mountain silhouette.
  r.billboard({x:-900,y:700,z:-1200,size:210,color:'#fff0a0',alpha:.34});
  for(const [x,z,h] of [[-1300,-930,360],[-700,-1020,450],[0,-1050,390],[650,-1000,510],[1250,-930,420]]){
    r.cone({x,y:h/2-10,z,rx:260,rz:150,sy:h,color:'#4a665a',alpha:.46});
    r.cone({x,y:h-30,z,rx:75,rz:45,sy:80,color:'#d8e0d5',alpha:.36});
  }
}
