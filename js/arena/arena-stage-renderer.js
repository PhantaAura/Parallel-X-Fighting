const NATURAL_STAGE_IDS=new Set(['training-road','tournament-hub','tournament','resonance-facility','echo-village','echo-mountain','echo-caverns','echo-sky','shadow-lookout','chapter5-outpost','chapter6-highlands','chapter7-relay','chapter8-core']);

function drawPerimeterSegment(renderer,a,b,rail){renderer.segment(a,b,{width:rail.width,height:rail.height,color:rail.color,alpha:rail.alpha??1,lit:rail.lit??true})}

function rangedValues(min,max,step){
  const values=[];
  if(!(step>0))return values;
  for(let value=min;value<=max+.001;value+=step)values.push(value);
  return values;
}

function drawTree(renderer,tree={}){
  const{x=0,z=0,scale=1,index=0,color='#467443'}=tree;
  if(tree.dead){drawBareTree(renderer,{x,z,scale,color});return}
  renderer.cylinder({x,y:42*scale,z,rx:10*scale,rz:11*scale,sy:84*scale,color:'#65452e'});
  if(tree.shape==='broadleaf'){
    renderer.sphere({x,y:125*scale,z,sx:102*scale,sy:88*scale,sz:88*scale,color});
    renderer.sphere({x:x-34*scale,y:130*scale,z:z+8*scale,sx:70*scale,sy:66*scale,sz:67*scale,color:index%2?'#527e49':'#59854c'});
    renderer.sphere({x:x+34*scale,y:126*scale,z:z-8*scale,sx:68*scale,sy:63*scale,sz:70*scale,color:index%2?'#477641':'#4e7b45'});
    return;
  }
  renderer.cone({x,y:98*scale,z,rx:59*scale,rz:52*scale,sy:104*scale,color});
  if(index%3===0)renderer.cone({x:x+4*scale,y:148*scale,z:z-2*scale,rx:40*scale,rz:37*scale,sy:78*scale,color:'#5b8b50'});
}

function drawRock(renderer,{x=0,z=0,scale=1,color='#81796a',height=80}={}){
  renderer.cone({x,y:height*scale*.43,z,rx:64*scale,rz:52*scale,sy:height*scale*.86,color});
  renderer.cone({x:x+20*scale,y:height*scale*.62,z:z-12*scale,rx:34*scale,rz:30*scale,sy:height*scale*.68,color:'#9b907e'});
  renderer.cone({x:x-25*scale,y:height*scale*.3,z:z+15*scale,rx:30*scale,rz:26*scale,sy:height*scale*.6,color:'#69695f'});
}

function drawBareTree(renderer,{x=0,z=0,scale=1,color='#51483b'}={}){
  const top=178*scale;
  renderer.cylinder({x,y:top*.42,z,rx:9*scale,rz:9*scale,sy:top*.84,color});
  for(const [side,level] of [[-1,.36],[1,.49],[-1,.62],[1,.72]]){
    renderer.segment({x,y:top*level,z},{x:x+side*34*scale,y:top*(level+.2),z:z+side*6*scale},{width:7*scale,height:7*scale,color});
    renderer.segment({x:x+side*22*scale,y:top*(level+.13),z:z+side*4*scale},{x:x+side*45*scale,y:top*(level+.29),z:z+side*6*scale},{width:4*scale,height:4*scale,color});
  }
}

function drawRollingHills(renderer){
  // Broad, smooth 3D mounds make a rolling meadow horizon without a flat arena edge.
  for(const [x,z,rx,rz,h,color] of [
    [-1840,-1180,2440,1260,760,'#6f8e50'],[-550,-1380,2320,1400,840,'#789956'],
    [1020,-1260,2480,1320,760,'#71904f'],[2690,-1120,2180,1200,820,'#6b894d'],
    [-1780,1320,2320,1420,710,'#65864a'],[260,1470,2620,1540,840,'#71904f'],
    [2220,1310,2340,1460,770,'#668748']
  ])renderer.sphere({x,y:-h*.38,z,sx:rx,sy:h,sz:rz,color});
}

function drawPavilion(renderer,{x,z,sx=380,sz=250,wall='#e4d8bd',roof='#9d4434',y=110}={}){
  renderer.box({x,y,z,sx:sx*.72,sy:y*1.2,sz:sz*.7,color:wall});
  for(const side of [-1,1])for(const end of [-1,1])renderer.cylinder({x:x+side*sx*.44,y:y*.57,z:z+end*sz*.42,rx:11,rz:11,sy:y*1.08,color:'#73543a'});
  renderer.gableRoof({x,y:y*1.65,z,sx,sy:Math.max(50,sx*.3),sz,color:roof});
  renderer.box({x,y:y*2.02,z,sx:sx*.95,sy:12,sz:sz*1.08,color:'#d8b878'});
}

function drawPipe(renderer,a,b,{radius=12,color='#627887'}={}){
  renderer.segment(a,b,{width:radius,height:radius,color,lit:true});
  renderer.cylinder({x:a.x,y:a.y,z:a.z,rx:radius*1.25,rz:radius*1.25,sy:radius*1.3,color:'#b0c0c4'});
  renderer.cylinder({x:b.x,y:b.y,z:b.z,rx:radius*1.25,rz:radius*1.25,sy:radius*1.3,color:'#b0c0c4'});
}

function drawChapterLandmarks(renderer,stage){
  const id=stage.id;
  if(id==='training-road'){
    // Open, flowerless countryside forms frame the path without turning it into a tournament field.
    drawRollingHills(renderer);
    // A real roadside obstruction, creek stones, and a timber bridge read clearly from the 3D camera.
    renderer.segment({x:337,y:34,z:-82},{x:337,y:34,z:82},{width:48,height:48,color:'#79502f'});
    renderer.segment({x:337,y:61,z:-42},{x:360,y:94,z:-20},{width:14,height:14,color:'#65432b'});
    renderer.segment({x:337,y:60,z:36},{x:310,y:86,z:61},{width:12,height:12,color:'#65432b'});
    for(const [x,z,s] of [[-80,-195,.7],[178,-202,.58],[232,194,.72],[-72,205,.62],[535,-150,.7],[535,155,.63]])drawRock(renderer,{x,z,scale:s,height:40,color:'#817765'});
    for(const z of [-102,102])for(const x of [-30,180])renderer.cylinder({x,y:48,z,rx:7,rz:7,sy:38,color:'#67482d'});
    renderer.segment({x:-30,y:67,z:-102},{x:180,y:67,z:-102},{width:8,height:8,color:'#d5aa55'});
    renderer.segment({x:-30,y:67,z:102},{x:180,y:67,z:102},{width:8,height:8,color:'#d5aa55'});
  }
  if(id==='training-field'){
    drawRollingHills(renderer);
    for(const [x,z] of [[-450,-250],[460,-250],[-440,240],[450,250]])drawRock(renderer,{x,z,scale:.9,height:54,color:'#887e6d'});
  }
  if(id==='tournament-hub'||id==='tournament'){
    // Original martial-arts campus architecture: tile roofs, round posts, and a readable central gate.
    drawPavilion(renderer,{x:-120,z:-560,sx:560,sz:360,wall:'#eee2c7',roof:'#9f3f32',y:112});
    drawPavilion(renderer,{x:640,z:-520,sx:460,sz:330,wall:'#e6d7b8',roof:'#a94a36',y:90});
    renderer.gableRoof({x:-1650,y:238,z:70,sx:700,sy:175,sz:510,color:'#77503a'});
    for(const x of [-1710,-1590])renderer.cylinder({x,y:116,z:70,rx:17,rz:17,sy:230,color:'#9c4435'});
    for(const x of [-1610,-1190,430,850])renderer.cylinder({x,y:62,z:145,rx:15,rz:15,sy:120,color:'#796044'});
    renderer.cylinder({x:0,y:10,z:40,rx:182,rz:150,sy:9,color:'#d5c5a2'});
    renderer.cylinder({x:0,y:17,z:40,rx:146,rz:118,sy:5,color:'#b93831'});
  }
  if(id==='after-hours-tournament'){
    for(const x of [-120,350,820]){
      renderer.gableRoof({x,y:150,z:-560,sx:260,sy:90,sz:220,color:'#344449'});
      renderer.cylinder({x:x-112,y:65,z:-560,rx:7,rz:7,sy:130,color:'#5e6258'});
      renderer.cylinder({x:x+112,y:65,z:-560,rx:7,rz:7,sy:130,color:'#5e6258'});
    }
  }
  if(id==='resonance-facility'||id==='chapter8-core'){
    // Rounded pressure tanks and connected conduits replace a flat wall of cuboids.
    for(const [x,z,h] of [[-850,-410,210],[-850,410,185],[820,-410,230],[820,410,190]]){
      renderer.cylinder({x,y:h/2,z,rx:68,rz:68,sy:h,color:'#30485b'});
      renderer.cylinder({x,y:h+9,z,rx:75,rz:75,sy:18,color:'#778995'});
      renderer.cylinder({x,y:35,z,rx:80,rz:80,sy:16,color:'#182532'});
    }
    for(const z of [-500,500]){
      drawPipe(renderer,{x:-780,y:216,z},{x:760,y:216,z},{radius:12,color:'#537889'});
      drawPipe(renderer,{x:-780,y:256,z},{x:760,y:256,z},{radius:8,color:'#55b8cf'});
    }
    if(id==='resonance-facility'){
      for(const x of [-630,-180,310,720]){
        renderer.box({x,y:158,z:-548,sx:210,sy:310,sz:42,color:'#263c50'});
        renderer.box({x,y:321,z:-548,sx:225,sy:18,sz:58,color:'#587487'});
        renderer.cylinder({x:x-54,y:210,z:-510,rx:25,rz:25,sy:82,color:'#44b6cd',alpha:.78,lit:false});
        renderer.cylinder({x:x+55,y:210,z:-510,rx:25,rz:25,sy:82,color:'#a3c3cf',alpha:.58});
        renderer.segment({x:x-74,y:64,z:-480},{x:x+74,y:64,z:-480},{width:18,height:15,color:'#34495a'});
      }
      // Repeated assembly lanes give the room the dense, working factory floor
      // in the reference: belts below, articulated arms, and a busy overhead rig.
      for(const z of [-610,-250,110,470]){
        renderer.box({x:0,y:26,z,sx:1700,sy:40,sz:210,color:'#263645'});
        renderer.box({x:0,y:48,z,sx:1630,sy:7,sz:140,color:'#111d2a'});
        for(const side of [-1,1]){
          renderer.segment({x:-790,y:60,z:z+side*72},{x:790,y:60,z:z+side*72},{width:8,height:8,color:'#3cd1e7',lit:false});
          for(const x of [-720,-480,-240,0,240,480,720])renderer.cylinder({x,y:54,z:z+side*54,rx:15,rz:15,sy:13,color:'#647887'});
        }
      }
      for(const z of [-480,-120,240,600])for(const x of [-610,-205,205,610]){
        const side=(x+z)%2===0?1:-1;
        const elbow={x:x+side*76,y:258,z:z-42};
        const tool={x:x+side*28,y:202,z:z-126};
        renderer.box({x,y:82,z,sx:110,sy:44,sz:104,color:'#344758'});
        renderer.cylinder({x,y:125,z,rx:39,rz:39,sy:46,color:'#738692'});
        renderer.segment({x,y:150,z},{x:x+side*34,y:240,z:z-24},{width:30,height:26,color:'#718590'});
        renderer.cylinder({x:elbow.x,y:247,z:elbow.z,rx:28,rz:28,sy:34,color:'#b5c2c4'});
        renderer.segment(elbow,tool,{width:22,height:20,color:'#617985'});
        renderer.cylinder({x:tool.x,y:tool.y,z:tool.z,rx:20,rz:20,sy:32,color:'#34c4d8',lit:false});
        renderer.segment({x:tool.x,y:188,z:tool.z},{x:tool.x+side*34,y:153,z:tool.z-18},{width:9,height:8,color:'#a6c5cb'});
        renderer.segment({x:tool.x,y:188,z:tool.z},{x:tool.x-side*24,y:158,z:tool.z+20},{width:9,height:8,color:'#a6c5cb'});
      }
      for(const y of [350,390]){
        renderer.segment({x:-920,y,z:-620},{x:920,y,z:-620},{width:17,height:15,color:'#536979'});
        renderer.segment({x:-920,y,z:500},{x:920,y,z:500},{width:13,height:13,color:'#40596b'});
        for(const x of [-760,-380,0,380,760]){
          renderer.segment({x,y:y-4,z:-620},{x,y:y-4,z:500},{width:10,height:10,color:'#597181'});
          if(y===350){
            renderer.segment({x,y:y-18,z:-380},{x,y:288,z:-380},{width:8,height:8,color:'#9fb0b3'});
            renderer.cylinder({x,y:274,z:-380,rx:19,rz:19,sy:18,color:'#36bad0',lit:false});
          }
        }
      }
    }
    if(id==='chapter8-core'){
      renderer.cylinder({x:390,y:235,z:-480,rx:132,rz:132,sy:420,color:'#25384a'});
      renderer.cylinder({x:390,y:235,z:-480,rx:93,rz:93,sy:460,color:'#46a9b4',alpha:.82,lit:false});
      for(const y of [75,145,325,400])renderer.cylinder({x:390,y,z:-480,rx:168,rz:168,sy:14,color:y===145?'#54d5da':'#879ca7'});
      for(const x of [170,610]){
        renderer.box({x,y:225,z:-480,sx:28,sy:450,sz:32,color:'#8498a1'});
        renderer.box({x,y:445,z:-480,sx:190,sy:18,sz:52,color:'#9b3e42'});
      }
      renderer.gableRoof({x:930,y:175,z:0,sx:320,sy:150,sz:250,color:'#4c5661'});
    }
  }
  if(id==='chapter5-outpost'){
    renderer.box({x:515,y:86,z:-465,sx:520,sy:172,sz:350,color:'#737b7c'});
    renderer.box({x:515,y:177,z:-465,sx:548,sy:10,sz:375,color:'#a8a392'});
    renderer.box({x:515,y:54,z:-286,sx:260,sy:110,sz:10,color:'#404d53'});
    renderer.gableRoof({x:515,y:187,z:-465,sx:590,sy:76,sz:410,color:'#555f62'});
    for(const x of [280,750]){
      renderer.cylinder({x,y:165,z:-600,rx:8,rz:8,sy:330,color:'#626c70'});
      renderer.segment({x:x-30,y:260,z:-600},{x:x+30,y:260,z:-600},{width:7,height:7,color:'#a2a9a5'});
      renderer.cylinder({x,y:337,z:-600,rx:18,rz:18,sy:26,color:'#737d7b'});
    }
    for(const [x,z] of [[210,-210],[820,-210],[210,-720],[820,-720]])renderer.cylinder({x,y:34,z,rx:6,rz:6,sy:68,color:'#6c7473'});
    renderer.segment({x:210,y:58,z:-210},{x:820,y:58,z:-210},{width:5,height:5,color:'#707b78'});
    renderer.segment({x:210,y:58,z:-720},{x:820,y:58,z:-720},{width:5,height:5,color:'#707b78'});
  }
  if(id==='chapter6-highlands'){
    // The Red Network field station is a line of directional beacons, not another village.
    for(const [x,z,h] of [[-650,-420,230],[-120,430,315],[430,-360,270],[820,400,205]]){
      renderer.cylinder({x,y:h*.42,z,rx:24,rz:24,sy:h*.84,color:'#4a5459'});
      renderer.cylinder({x,y:h*.88,z,rx:58,rz:50,sy:38,color:'#9f3e43'});
      renderer.cylinder({x,y:h*.88,z,rx:32,rz:27,sy:43,color:'#f18d67',lit:false});
      for(const side of [-1,1])renderer.segment({x:x+side*10,y:h*.7,z},{x:x+side*110,y:h*.42,z:z+65},{width:8,height:7,color:'#586367'});
    }
    renderer.box({x:250,y:42,z:145,sx:330,sy:84,sz:200,color:'#4e5759'});
    renderer.gableRoof({x:250,y:100,z:145,sx:360,sy:66,sz:228,color:'#903f42'});
  }
  if(id==='chapter7-relay'){
    for(const [x,z,h] of [[-760,-470,360],[-260,480,290],[290,-470,390],[780,460,330]]){
      renderer.cylinder({x,y:h/2,z,rx:13,rz:13,sy:h,color:'#68757a'});
      renderer.segment({x:x-92,y:h*.76,z},{x:x+92,y:h*.76,z},{width:9,height:9,color:'#8c9898'});
      renderer.segment({x:x-65,y:h*.84,z},{x:x+65,y:h*.84,z},{width:7,height:7,color:'#8c9898'});
      renderer.cylinder({x,y:h*.93,z,rx:16,rz:16,sy:20,color:'#63d5ce',lit:false});
    }
    for(let index=0;index<3;index++){
      const a={x:-760+index*510,y:285,z:index%2?-470:480},b={x:-250+index*510,y:285,z:index%2?480:-470};
      drawPipe(renderer,a,b,{radius:5,color:'#435961'});
    }
    renderer.box({x:420,y:43,z:245,sx:190,sy:86,sz:145,color:'#646f70'});
    renderer.box({x:420,y:91,z:245,sx:205,sy:10,sz:158,color:'#a34a42'});
    renderer.cylinder({x:420,y:108,z:245,rx:44,rz:44,sy:22,color:'#75d8c8',lit:false});
  }
  if(id==='remote-highlands'||id==='chapter6-highlands'){
    for(let index=0;index<8;index++){
      const x=-1320+index*365,z=index%2?-690:690;
      drawRock(renderer,{x,z,scale:.9+(index%3)*.15,height:180+(index%3)*42,color:index%2?'#777d77':'#8a8172'});
    }
    for(const x of [-1070,-730,-390,-50,290,630,970]){
      renderer.cone({x,y:27,z:-315,rx:13,rz:12,sy:54,color:'#756349'});
      renderer.box({x,y:55,z:-315,sx:36,sy:11,sz:21,color:'#ddc18a'});
    }
  }
  if(id==='echo-village'){
    // Pale, weather-cut ridges frame the settlement like the high desert reference.
    for(const [x,z,rx,rz,h,color] of [
      [-1540,-980,520,300,620,'#b5a68e'],[-930,-1080,560,310,710,'#c2b39a'],
      [-210,-1100,590,330,630,'#a99b83'],[570,-1030,610,290,690,'#c0b197'],
      [1380,-970,540,330,610,'#ad9d83'],[-1370,980,590,310,580,'#a89b82'],
      [-500,1080,610,330,720,'#c0b39b'],[460,1040,630,340,630,'#afa187'],[1390,980,570,320,690,'#b9aa90']
    ])renderer.sphere({x,y:-h*.38,z,sx:rx,sy:h,sz:rz,color});
    for(const [x,z,h] of [[-1450,-790,310],[-760,-890,370],[-80,-870,280],[720,-830,360],[1450,-760,300],[-1180,870,280],[240,890,330],[1210,830,340]])
      drawRock(renderer,{x,z,scale:.82,height:h,color:'#958a78'});
    // A worn pale-stone lane threads between the homes; its bends stay open for story play.
    for(const [a,b] of [[{x:-1370,y:8,z:60},{x:-690,y:8,z:190}],[{x:-690,y:8,z:190},{x:-80,y:8,z:110}],[{x:-80,y:8,z:110},{x:520,y:8,z:260}],[{x:520,y:8,z:260},{x:1130,y:8,z:125}]])
      renderer.segment(a,b,{width:110,height:5,color:'#c5b99f'});
    for(const [x,z] of [[-820,-280],[-340,360],[210,-260],[680,420],[1050,-140]])drawRock(renderer,{x,z,scale:.82,height:70,color:'#978a75'});
    const huts=[[-1200,-760],[-880,760],[-560,-760],[-240,760],[80,-760],[400,760],[720,-760],[1040,760]];
    huts.forEach(([x,z],index)=>{
      renderer.gableRoof({x,y:118+(index%2)*12,z,sx:132,sy:70,sz:110,color:index%2?'#76503a':'#8b5140'});
      renderer.box({x,y:53,z,sx:84,sy:104,sz:72,color:index%2?'#66533d':'#78654a'});
      renderer.cylinder({x:x-25,y:28,z:z+38,rx:4,rz:4,sy:50,color:'#4d3929'});
      renderer.cylinder({x:x+25,y:28,z:z+38,rx:4,rz:4,sy:50,color:'#4d3929'});
    });
    for(const x of [-540,180,820]){
      renderer.cylinder({x,y:112,z:120,rx:20,rz:20,sy:220,color:'#76664c'});
      renderer.cone({x,y:231,z:120,rx:31,rz:31,sy:48,color:'#c1a45e'});
    }
  }
  if(id==='echo-caverns'){
    for(const [x,z,h,color] of [[-940,-520,310,'#424b4c'],[-670,460,255,'#4e5a5c'],[-270,-500,290,'#39464c'],[90,500,270,'#48565b'],[450,-500,330,'#3f4c53'],[880,470,285,'#465154']]){
      renderer.cone({x,y:h/2,z,rx:82,rz:74,sy:h,color});
      renderer.cone({x:x+6,y:h*.65,z:z-5,rx:36,rz:32,sy:h*.3,color:'#81b9c1',alpha:.8,lit:false});
    }
    for(const [x,z] of [[-680,0],[-120,0],[470,0]]){
      renderer.cylinder({x,y:135,z,rx:50,rz:50,sy:270,color:'#514f48'});
      renderer.cone({x,y:300,z,rx:62,rz:62,sy:78,color:'#84bdc3',alpha:.82,lit:false});
    }
  }
  if(id==='echo-mountain'){
    for(const [x,z,h] of [[-1330,-610,390],[-970,620,330],[-610,-630,430],[-160,650,360],[360,-620,410],[760,640,340]]){
      renderer.cone({x,y:h/2,z,rx:125,rz:105,sy:h,color:'#777d77'});
      renderer.cone({x:x+8,y:h*.83,z:z-4,rx:66,rz:56,sy:h*.23,color:'#c9c6b6'});
    }
    renderer.gableRoof({x:1120,y:612,z:-330,sx:330,sy:165,sz:290,color:'#e4e0d1'});
  }
  if(id==='shadow-lookout'){
    // A distinct floating sanctuary: circular stone plinth, four open columns, and a compact dome.
    renderer.cylinder({x:1120,y:412,z:-330,rx:430,rz:340,sy:84,color:'#755947'});
    renderer.cylinder({x:1120,y:460,z:-330,rx:414,rz:324,sy:18,color:'#d5d0bd'});
    renderer.cylinder({x:1120,y:474,z:-330,rx:365,rz:284,sy:10,color:'#a34e42'});
    for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
      const x=1120+Math.cos(angle)*245,z=-330+Math.sin(angle)*190;
      renderer.cylinder({x,y:548,z,rx:14,rz:14,sy:142,color:'#efe7d2'});
      renderer.cylinder({x,y:620,z,rx:20,rz:20,sy:12,color:'#b78c56'});
    }
    renderer.cylinder({x:1120,y:562,z:-330,rx:128,rz:118,sy:186,color:'#eee8d9'});
    renderer.cylinder({x:1120,y:668,z:-330,rx:96,rz:90,sy:28,color:'#6da8b6'});
    renderer.cone({x:1120,y:718,z:-330,rx:94,rz:88,sy:84,color:'#ded7c4'});
  }
  if(id==='echo-sky'){
    // The encounter takes place on an actual floating stone isle with broken satellites.
    renderer.cylinder({x:0,y:-34,z:0,rx:390,rz:310,sy:82,color:'#72899b'});
    renderer.cone({x:-54,y:-128,z:16,rx:252,rz:198,sy:138,color:'#495f72'});
    renderer.cylinder({x:0,y:12,z:0,rx:360,rz:282,sy:18,color:'#d1d3c9'});
    renderer.cylinder({x:0,y:23,z:0,rx:282,rz:218,sy:7,color:'#5c9bb0'});
    for(const [x,z,r] of [[-485,-265,108],[492,-240,120],[-470,260,88],[470,270,100]]){
      renderer.cylinder({x,y:-15,z,rx:r,rz:r*.78,sy:28,color:'#8e9eaa'});
      renderer.cone({x:x+18,y:-57,z:z-8,rx:r*.58,rz:r*.48,sy:74,color:'#566f80'});
    }
    for(const [x,z,s] of [[-620,-360,1],[260,-390,.8],[650,330,.9],[-120,380,.72]]){
      renderer.cylinder({x,y:98,z,rx:120*s,rz:50*s,sy:52*s,color:'#eaf7ff',alpha:.18,lit:false});
      renderer.cylinder({x:x-70*s,y:116,z:z+12*s,rx:65*s,rz:46*s,sy:54*s,color:'#f6fbff',alpha:.16,lit:false});
    }
  }
}

export function drawArenaStage(renderer,stage){
  const {bounds:b,floor,boundary,scenery}=stage;
  renderer.box(floor.base);
  renderer.box(floor.surface);

  if(floor.grid&&!NATURAL_STAGE_IDS.has(stage.id)){
    const grid=floor.grid;
    for(const x of rangedValues(b.minX,b.maxX,grid.stepX))renderer.box({x,y:grid.y,z:0,sx:grid.widthX,sy:grid.height,sz:b.maxZ-b.minZ,color:grid.color,alpha:grid.alphaX,lit:false});
    for(const z of rangedValues(b.minZ,b.maxZ,grid.stepZ))renderer.box({x:0,y:grid.y,z,sx:b.maxX-b.minX,sy:grid.height,sz:grid.widthZ,color:grid.color,alpha:grid.alphaZ,lit:false});
  }

  if(floor.centerMark&&!NATURAL_STAGE_IDS.has(stage.id)){
    const mark=floor.centerMark;
    for(let index=0;index<mark.segments;index++){
      const a=index/mark.segments*Math.PI*2,c=(index+1)/mark.segments*Math.PI*2;
      renderer.segment({x:mark.x+Math.cos(a)*mark.radius,y:mark.y,z:mark.z+Math.sin(a)*mark.radius},{x:mark.x+Math.cos(c)*mark.radius,y:mark.y,z:mark.z+Math.sin(c)*mark.radius},{width:mark.width,height:mark.height,color:mark.color,alpha:mark.alpha,lit:false});
    }
    const cross=mark.crossRadius;
    renderer.segment({x:mark.x-cross,y:mark.y,z:mark.z},{x:mark.x+cross,y:mark.y,z:mark.z},{width:mark.crossWidth,height:mark.height,color:mark.color,alpha:mark.crossAlpha,lit:false});
    renderer.segment({x:mark.x,y:mark.y,z:mark.z-cross},{x:mark.x,y:mark.y,z:mark.z+cross},{width:mark.crossWidth,height:mark.height,color:mark.color,alpha:mark.crossAlpha,lit:false});
  }

  for(const box of scenery?.boxes||[]){
    if((stage.id==='remote-highlands'||stage.id==='chapter5-outpost'||stage.id==='chapter6-highlands'||stage.id==='chapter7-relay')&&Math.abs(box.z||0)===690&&((box.sx===28&&box.sy===140)||(box.sx===118&&box.sy===110)))continue;
    if(stage.id==='shadow-lookout'&&box.x===1120&&box.z===-330&&[420,240,300].includes(box.sx))continue;
    if(stage.id==='training-road'&&((box.z===-245&&box.sy>=64&&box.sy<=152)||box.x===600&&(Math.abs(box.z||0)===135||box.z===0)||box.x===1295&&box.z===-260||[1040,1250,1420].includes(box.x)&&box.z===250||[1250,1420].includes(box.x)&&box.z===265||(box.x===-1160&&box.z===-265)||([-1325,-995].includes(box.x)&&box.z===-85)))continue;
    renderer.box(box);
  }
  for(const tree of scenery?.trees||[])drawTree(renderer,tree);
  drawChapterLandmarks(renderer,stage);

  if(boundary){
    const posts=[];
    for(const x of rangedValues(b.minX,b.maxX,boundary.postSpacing)){posts.push({x,z:b.minZ},{x,z:b.maxZ})}
    for(const z of rangedValues(b.minZ+boundary.postSpacing,b.maxZ-boundary.postSpacing,boundary.postSpacing)){posts.push({x:b.minX,z},{x:b.maxX,z})}
    for(const point of posts){renderer.box({...boundary.post,x:point.x,z:point.z});renderer.box({...boundary.cap,x:point.x,z:point.z})}
    const rails=Array.isArray(boundary.rails)?boundary.rails:[boundary.rail];
    for(const rail of rails.filter(Boolean)){
      drawPerimeterSegment(renderer,{x:b.minX,y:rail.y,z:b.minZ},{x:b.maxX,y:rail.y,z:b.minZ},rail);
      drawPerimeterSegment(renderer,{x:b.minX,y:rail.y,z:b.maxZ},{x:b.maxX,y:rail.y,z:b.maxZ},rail);
      drawPerimeterSegment(renderer,{x:b.minX,y:rail.y,z:b.minZ},{x:b.minX,y:rail.y,z:b.maxZ},rail);
      drawPerimeterSegment(renderer,{x:b.maxX,y:rail.y,z:b.minZ},{x:b.maxX,y:rail.y,z:b.maxZ},rail);
    }
  }

  if(scenery?.lamp&&!NATURAL_STAGE_IDS.has(stage.id)){
    for(const point of scenery.lamps||[]){renderer.box({...scenery.lamp.post,x:point.x,z:point.z});renderer.box({...scenery.lamp.light,x:point.x,z:point.z})}
  }
}
