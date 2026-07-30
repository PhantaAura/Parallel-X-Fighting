export const ARENA_STAGE_SCHEMA_VERSION=1;

function deepFreeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.freeze(value);
  for(const child of Object.values(value))deepFreeze(child);
  return value;
}


function trainingRoadScenery(){
  const boxes=[];
  const treeColors=['#315e36','#3f7440','#2b5531','#4b7f45'];
  const trunk='#60402a';
  const addTree=(x,z,scale=1,index=0)=>{
    boxes.push({x,y:46*scale,z,sx:22*scale,sy:92*scale,sz:22*scale,color:trunk});
    boxes.push({x,y:114*scale,z,sx:92*scale,sy:96*scale,sz:92*scale,color:treeColors[index%treeColors.length]});
  };
  for(let x=-1370,index=0;x<=1370;x+=135,index++){
    addTree(x,-785,.88+(index%3)*.08,index);
    addTree(x,785,.92+((index+1)%3)*.07,index+2);
  }
  for(let x=-880,index=0;x<=1120;x+=180,index++){
    addTree(x,-540,.78+(index%2)*.09,index+1);
    addTree(x,540,.8+((index+1)%2)*.08,index+3);
  }
  return boxes;
}

function expandedTrainingRegionScenery(){
  const boxes=[];
  const treeColors=['#2d5b34','#3d7240','#274f2e','#4a7b44'];
  const trunk='#5a3c28';
  const addTree=(x,z,scale=1,index=0)=>{
    boxes.push({x,y:48*scale,z,sx:23*scale,sy:96*scale,sz:23*scale,color:trunk});
    boxes.push({x,y:120*scale,z,sx:96*scale,sy:100*scale,sz:96*scale,color:treeColors[index%treeColors.length]});
  };
  for(let x=-1900,index=0;x<=1900;x+=145,index++){
    addTree(x,-1320,.9+(index%3)*.08,index);
    addTree(x,1320,.94+((index+1)%3)*.07,index+2);
  }
  for(let z=-1180,index=0;z<=1180;z+=145,index++){
    addTree(-1900,z,.9+(index%2)*.08,index+1);
    addTree(1900,z,.9+((index+1)%2)*.08,index+3);
  }
  for(let x=-1650,index=0;x<=1650;x+=220,index++){
    if(Math.abs(x)<360)continue;
    addTree(x,-980,.72+(index%2)*.08,index+1);
    addTree(x,980,.74+((index+1)%2)*.08,index+3);
  }
  return boxes;
}
function tournamentCrowd(){
  const boxes=[];
  const colors=['#e0577f','#4db5d7','#f4b85a','#7659c7','#66b979','#d76d4d'];
  for(const side of [-1,1]){
    for(let row=0;row<5;row++){
      const z=side*(605+row*42);
      for(let index=-8;index<=8;index++){
        boxes.push({
          x:index*96+(row%2?24:0),
          y:58+row*28,
          z,
          sx:42,
          sy:48,
          sz:30,
          color:colors[(index+row+24)%colors.length],
          alpha:.78,
          lit:false
        });
      }
    }
  }
  return boxes;
}

function tournamentPlazaDecor(){
  const boxes=[];
  const bannerColors=['#c63832','#287a87','#e0a52f','#643f88'];
  const addBanner=(x,z,index=0)=>{
    const color=bannerColors[index%bannerColors.length];
    boxes.push({x,y:74,z,sx:12,sy:148,sz:12,color:'#523a28'});
    boxes.push({x,y:128,z,sx:14,sy:62,sz:82,color,alpha:.95,lit:false});
    boxes.push({x,y:160,z,sx:20,sy:10,sz:96,color:'#e7c25a',lit:false});
  };
  [
    [-1320,-185,0],[-1320,330,1],[-900,-185,2],[-900,330,3],
    [-470,-185,1],[-470,330,0],[-40,-185,3],[-40,330,2],
    [390,-185,0],[390,330,1],[820,-185,2],[820,330,3]
  ].forEach(args=>addBanner(...args));

  const addFestivalPalm=(x,z,scale=1,index=0)=>{
    boxes.push({x,y:64*scale,z,sx:24*scale,sy:128*scale,sz:24*scale,color:'#7a5434'});
    boxes.push({x,y:150*scale,z,sx:122*scale,sy:54*scale,sz:80*scale,color:index%2?'#37845b':'#2f7651'});
    boxes.push({x,y:173*scale,z,sx:74*scale,sy:44*scale,sz:130*scale,color:index%2?'#2f7651':'#3b8e60'});
  };
  [
    [-1630,-700,.88,0],[-1620,800,.92,1],[-1040,-840,.82,1],
    [-610,890,.8,0],[40,900,.86,1],[760,850,.82,0],[1030,-820,.86,1]
  ].forEach(args=>addFestivalPalm(...args));
  return boxes;
}

function nightTournamentBoxes(source=[]){
  const colors={
    '#4a5f54':'#182d2b','#d6c59d':'#4b584f','#e6d6ae':'#536158',
    '#d9c79e':'#48564e','#eadbb5':'#5a675f','#f3e5c0':'#657169',
    '#f0dfb8':'#5b675f','#f5e6c1':'#68736b','#efe0bb':'#616d65',
    '#f4e5c0':'#65716a','#f7e9c7':'#6a756d','#efe1bd':'#606d65',
    '#f1e4c4':'#66726b','#f7ebcf':'#6d7771','#f3e7ca':'#66716b',
    '#f5e8ca':'#68736c','#efe3c4':'#616d67','#efe4bd':'#5f6b64',
    '#d9c8a2':'#4b5851','#d8ca9e':'#48564f','#c63832':'#6d3231',
    '#287a87':'#28545c','#e0a52f':'#7d6533','#643f88':'#433553',
    '#a54432':'#5b322e','#7e2f27':'#4a2827','#2b6f78':'#294b51',
    '#e7c25a':'#8a7845','#37845b':'#315b48','#2f7651':'#2c5142',
    '#3b8e60':'#335f4a','#7a5434':'#493b2d','#fff3c2':'#9ba9a0'
  };
  return source
    .filter(box=>!(box.sx===14&&box.sy===62&&box.sz===82)&&!(box.sx===20&&box.sy===10&&box.sz===96))
    .map(box=>({
      ...box,
      color:colors[box.color]||box.color,
      alpha:box.alpha===undefined?1:Math.min(box.alpha,.84)
    }));
}

const TANGAI_DOJO={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'dojo',
  name:'Tangai Dojo',
  subtitle:'Closed sparring arena',
  available:true,
  performance:{tier:'light',mobileScenery:'full',particleMultiplier:1},
  bounds:{minX:-360,maxX:360,minZ:-240,maxZ:240},
  spawnPoints:[{x:-170,z:55},{x:170,z:-55}],
  projectileLimits:{padding:100,minY:0,maxY:420},
  camera:{
    yawDeg:40,
    fov:42,
    clear:'#17120e',
    fogColor:'#17120e',
    fogRange:[560,1450],
    focusClampX:110,
    focusClampZ:90,
    baseDistance:770,
    separationScale:.48,
    minDistance:800,
    maxDistance:1080,
    heightBase:360,
    heightDistanceScale:.18,
    horizontalDistanceScale:.78,
    targetHeight:38,
    jumpTargetScale:.16,
    focusSmoothing:.055,
    zoomSmoothing:.04
  },
  floor:{
    base:{x:0,y:-15,z:0,sx:760,sy:30,sz:520,color:'#3b2518'},
    surface:{x:0,y:1,z:0,sx:724,sy:4,sz:484,color:'#a46e3e'},
    grid:{stepX:52,stepZ:48,y:4,widthX:1.6,widthZ:1.4,height:1.2,color:'#e2b878',alphaX:.34,alphaZ:.24},
    centerMark:{x:0,y:5,z:0,radius:92,segments:36,width:3,height:1.5,color:'#c82928',alpha:.8,crossRadius:105,crossWidth:2,crossAlpha:.5}
  },
  boundary:{
    postSpacing:120,
    post:{y:24,sx:9,sy:48,sz:9,color:'#3a2418'},
    cap:{y:52,sx:14,sy:10,sz:14,color:'#d6a34d',lit:false},
    rail:{y:34,width:7,height:7,color:'#694226'}
  },
  scenery:{
    boxes:[
      // Rear wall, roof line, and heavy timber frame.
      {x:0,y:120,z:-318,sx:720,sy:230,sz:34,color:'#d8bd8b'},
      {x:0,y:238,z:-316,sx:780,sy:26,sz:78,color:'#4a2d1c'},
      {x:0,y:268,z:-316,sx:850,sy:24,sz:112,color:'#241812'},
      {x:0,y:221,z:-294,sx:710,sy:15,sz:15,color:'#684127'},
      {x:-350,y:122,z:-292,sx:20,sy:235,sz:20,color:'#55331f'},
      {x:-175,y:122,z:-292,sx:17,sy:235,sz:17,color:'#684127'},
      {x:0,y:122,z:-292,sx:20,sy:235,sz:20,color:'#55331f'},
      {x:175,y:122,z:-292,sx:17,sy:235,sz:17,color:'#684127'},
      {x:350,y:122,z:-292,sx:20,sy:235,sz:20,color:'#55331f'},

      // Shoji-style wall panels.
      {x:-263,y:132,z:-295,sx:145,sy:150,sz:6,color:'#f1dfb8',alpha:.92},
      {x:-88,y:132,z:-295,sx:145,sy:150,sz:6,color:'#ead6aa',alpha:.92},
      {x:88,y:132,z:-295,sx:145,sy:150,sz:6,color:'#ead6aa',alpha:.92},
      {x:263,y:132,z:-295,sx:145,sy:150,sz:6,color:'#f1dfb8',alpha:.92},
      {x:-263,y:132,z:-289,sx:5,sy:150,sz:5,color:'#6a4328'},
      {x:-88,y:132,z:-289,sx:5,sy:150,sz:5,color:'#6a4328'},
      {x:88,y:132,z:-289,sx:5,sy:150,sz:5,color:'#6a4328'},
      {x:263,y:132,z:-289,sx:5,sy:150,sz:5,color:'#6a4328'},
      {x:0,y:132,z:-288,sx:700,sy:5,sz:5,color:'#7a4a29'},
      {x:0,y:84,z:-288,sx:700,sy:5,sz:5,color:'#7a4a29'},
      {x:0,y:180,z:-288,sx:700,sy:5,sz:5,color:'#7a4a29'},

      // Tangai crest and hanging red banners.
      {x:0,y:149,z:-282,sx:92,sy:92,sz:8,color:'#c72f28'},
      {x:0,y:149,z:-276,sx:57,sy:57,sz:8,color:'#e7bd57'},
      {x:0,y:149,z:-270,sx:19,sy:82,sz:8,color:'#7f221f'},
      {x:-122,y:157,z:-278,sx:36,sy:116,sz:8,color:'#9f2824'},
      {x:122,y:157,z:-278,sx:36,sy:116,sz:8,color:'#9f2824'},
      {x:-122,y:205,z:-276,sx:52,sy:10,sz:10,color:'#d6a34d'},
      {x:122,y:205,z:-276,sx:52,sy:10,sz:10,color:'#d6a34d'},

      // Side walls, benches, weapon racks, and training equipment.
      {x:-405,y:78,z:-70,sx:26,sy:158,sz:470,color:'#3c281c'},
      {x:405,y:78,z:-70,sx:26,sy:158,sz:470,color:'#3c281c'},
      {x:-330,y:24,z:175,sx:105,sy:22,sz:32,color:'#70472b'},
      {x:330,y:24,z:175,sx:105,sy:22,sz:32,color:'#70472b'},
      {x:-330,y:70,z:-214,sx:118,sy:12,sz:14,color:'#4b2f20'},
      {x:330,y:70,z:-214,sx:118,sy:12,sz:14,color:'#4b2f20'},
      {x:-372,y:72,z:-214,sx:10,sy:105,sz:10,color:'#4b2f20'},
      {x:372,y:72,z:-214,sx:10,sy:105,sz:10,color:'#4b2f20'},
      {x:-332,y:81,z:-208,sx:8,sy:126,sz:8,color:'#c5a25b'},
      {x:-305,y:81,z:-208,sx:8,sy:126,sz:8,color:'#c5a25b'},
      {x:332,y:81,z:-208,sx:8,sy:126,sz:8,color:'#c5a25b'},
      {x:305,y:81,z:-208,sx:8,sy:126,sz:8,color:'#c5a25b'},
      {x:-420,y:56,z:155,sx:42,sy:94,sz:42,color:'#8f2c25'},
      {x:-420,y:109,z:155,sx:65,sy:24,sz:65,color:'#d6a34d'},
      {x:420,y:56,z:155,sx:42,sy:94,sz:42,color:'#8f2c25'},
      {x:420,y:109,z:155,sx:65,sy:24,sz:65,color:'#d6a34d'}
    ],
    lamps:[
      {x:-330,z:-190},{x:330,z:-190},{x:-330,z:190},{x:330,z:190}
    ],
    lamp:{post:{y:78,sx:13,sy:110,sz:13,color:'#4a2d1c'},light:{y:142,sx:34,sy:45,sz:34,color:'#ffd68a',alpha:.9,lit:false}}
  }
};

const GLOBAL_TOURNAMENT={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'tournament',
  name:'Global Tournament',
  subtitle:'Grand championship ring',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.9},
  bounds:{minX:-750,maxX:750,minZ:-450,maxZ:450},
  spawnPoints:[{x:-370,z:78},{x:370,z:-78}],
  projectileLimits:{padding:220,minY:-30,maxY:620},
  ai:{wallMargin:95},
  camera:{
    yawDeg:35,
    fov:44,
    clear:'#150c22',
    fogColor:'#1a0e28',
    fogRange:[940,2500],
    focusClampX:290,
    focusClampZ:185,
    baseDistance:1100,
    separationScale:.50,
    minDistance:1120,
    maxDistance:1760,
    heightBase:500,
    heightDistanceScale:.16,
    horizontalDistanceScale:.80,
    targetHeight:44,
    jumpTargetScale:.18,
    focusSmoothing:.047,
    zoomSmoothing:.032
  },
  floor:{
    base:{x:0,y:-24,z:0,sx:1660,sy:48,sz:1040,color:'#33213d'},
    surface:{x:0,y:1,z:0,sx:1520,sy:5,sz:920,color:'#d7c79f'},
    grid:{stepX:125,stepZ:100,y:4.5,widthX:2.6,widthZ:2.6,height:1.1,color:'#7e5d7f',alphaX:.28,alphaZ:.24},
    centerMark:{x:0,y:6,z:0,radius:170,segments:52,width:6,height:1.8,color:'#d43e8c',alpha:.9,crossRadius:205,crossWidth:3.5,crossAlpha:.6}
  },
  boundary:{
    postSpacing:300,
    post:{y:50,sx:20,sy:100,sz:20,color:'#24172e'},
    cap:{y:108,sx:34,sy:18,sz:34,color:'#f2c95c',lit:false},
    rails:[
      {y:36,width:7,height:5,color:'#f6e7c5',alpha:.95,lit:false},
      {y:64,width:7,height:5,color:'#e35a93',alpha:.95,lit:false},
      {y:92,width:7,height:5,color:'#f6e7c5',alpha:.95,lit:false}
    ]
  },
  scenery:{
    boxes:[
      {x:0,y:-46,z:0,sx:1800,sy:42,sz:1180,color:'#17101e'},
      {x:0,y:52,z:-650,sx:1840,sy:105,sz:210,color:'#25142d'},
      {x:0,y:92,z:650,sx:1840,sy:185,sz:210,color:'#25142d'},
      {x:-920,y:82,z:0,sx:220,sy:164,sz:1300,color:'#211428'},
      {x:920,y:82,z:0,sx:220,sy:164,sz:1300,color:'#211428'},
      {x:0,y:300,z:-820,sx:760,sy:210,sz:34,color:'#120b18'},
      {x:0,y:416,z:-820,sx:860,sy:28,sz:92,color:'#d43e8c'},
      {x:0,y:454,z:-820,sx:970,sy:22,sz:120,color:'#f2c95c'},
      {x:-700,y:222,z:-775,sx:28,sy:410,sz:28,color:'#4f2a58'},
      {x:700,y:222,z:-775,sx:28,sy:410,sz:28,color:'#4f2a58'},
      ...tournamentCrowd()
    ],
    lamps:[
      {x:-700,z:-405},{x:700,z:-405},{x:-700,z:405},{x:700,z:405}
    ],
    lamp:{post:{y:145,sx:18,sy:230,sz:18,color:'#3d2246'},light:{y:274,sx:66,sy:32,sz:66,color:'#fff0aa',alpha:.95,lit:false}}
  }
};



const TRAINING_FIELD={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'training-field',
  name:'Sage Training Field',
  subtitle:'Open recovery-year sparring ground',
  available:true,
  performance:{tier:'light',mobileScenery:'full',particleMultiplier:1},
  bounds:{minX:-520,maxX:520,minZ:-330,maxZ:330},
  spawnPoints:[{x:-210,z:42},{x:210,z:-42}],
  projectileLimits:{padding:150,minY:-20,maxY:520},
  ai:{wallMargin:72},
  camera:{
    yawDeg:38,
    fov:43,
    clear:'#8bc9e8',
    fogColor:'#b7dce8',
    fogRange:[760,1900],
    focusClampX:190,
    focusClampZ:135,
    baseDistance:900,
    separationScale:.48,
    minDistance:930,
    maxDistance:1320,
    heightBase:410,
    heightDistanceScale:.17,
    horizontalDistanceScale:.79,
    targetHeight:42,
    jumpTargetScale:.17,
    focusSmoothing:.052,
    zoomSmoothing:.038
  },
  floor:{
    base:{x:0,y:-26,z:0,sx:1160,sy:52,sz:780,color:'#486a3f'},
    surface:{x:0,y:1,z:0,sx:1080,sy:5,sz:700,color:'#72a858'},
    grid:{stepX:135,stepZ:110,y:4.5,widthX:1.5,widthZ:1.5,height:1,color:'#d7edba',alphaX:.13,alphaZ:.11},
    centerMark:{x:0,y:5,z:0,radius:128,segments:40,width:3,height:1.4,color:'#e7f5bd',alpha:.48,crossRadius:154,crossWidth:2,crossAlpha:.24}
  },
  boundary:{
    postSpacing:260,
    post:{y:18,sx:7,sy:36,sz:7,color:'#6f5130'},
    cap:{y:39,sx:12,sy:8,sz:12,color:'#d8b676',lit:false},
    rail:{y:26,width:4,height:4,color:'#8d6a42',alpha:.62}
  },
  scenery:{
    boxes:[
      {x:0,y:-42,z:0,sx:1320,sy:28,sz:920,color:'#385a34'},
      {x:0,y:34,z:-430,sx:1280,sy:72,sz:170,color:'#4d743f'},
      {x:-470,y:72,z:-360,sx:190,sy:150,sz:150,color:'#3f6b3c'},
      {x:475,y:82,z:-355,sx:215,sy:170,sz:170,color:'#416e40'},
      {x:-430,y:36,z:285,sx:150,sy:72,sz:140,color:'#5f8247'},
      {x:430,y:40,z:280,sx:170,sy:80,sz:150,color:'#64874b'},
      {x:-315,y:52,z:-285,sx:24,sy:104,sz:24,color:'#5e3e27'},
      {x:-315,y:118,z:-285,sx:118,sy:90,sz:118,color:'#356f3b'},
      {x:330,y:56,z:-270,sx:26,sy:112,sz:26,color:'#5e3e27'},
      {x:330,y:126,z:-270,sx:126,sy:96,sz:126,color:'#397742'},
      {x:-505,y:30,z:20,sx:30,sy:60,sz:80,color:'#826f5b'},
      {x:505,y:34,z:-20,sx:34,sy:68,sz:92,color:'#7d6957'}
    ],
    lamps:[]
  }
};


const TRAINING_ROAD={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'training-road',
  name:'Training Grounds and Tournament Road',
  subtitle:'Living Chapter 1 hub and guided road',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.8},
  bounds:{minX:-1450,maxX:1450,minZ:-900,maxZ:900},
  spawnPoints:[{x:-1120,z:90},{x:-980,z:-55}],
  projectileLimits:{padding:240,minY:-30,maxY:700},
  ai:{wallMargin:120},
  camera:{
    yawDeg:38,
    fov:45,
    clear:'#70add1',
    fogColor:'#b9d6cd',
    fogRange:[1000,2900],
    focusClampX:1380,
    focusClampZ:820,
    baseDistance:980,
    separationScale:.18,
    minDistance:930,
    maxDistance:1160,
    heightBase:430,
    heightDistanceScale:.15,
    horizontalDistanceScale:.8,
    targetHeight:44,
    jumpTargetScale:.16,
    focusSmoothing:.08,
    zoomSmoothing:.06
  },
  floor:{
    base:{x:0,y:-28,z:0,sx:3100,sy:56,sz:1980,color:'#355a35'},
    surface:{x:0,y:1,z:0,sx:2980,sy:5,sz:1860,color:'#57834a'},
    grid:{stepX:240,stepZ:210,y:4,widthX:1.1,widthZ:1.1,height:.8,color:'#d5edba',alphaX:.045,alphaZ:.04},
    centerMark:{x:-1050,y:5,z:70,radius:150,segments:42,width:3,height:1.4,color:'#e9f3bc',alpha:.36,crossRadius:178,crossWidth:2,crossAlpha:.18}
  },
  scenery:{
    boxes:[
      {x:0,y:-41,z:0,sx:3280,sy:28,sz:2140,color:'#345630'},
      ...trainingRoadScenery(),
      // Sage's sanctuary makes Chapter 1 read as a training region instead of a town.
      {x:-1160,y:10,z:70,sx:610,sy:15,sz:410,color:'#b89b6c'},
      {x:-1160,y:17,z:70,sx:430,sy:8,sz:265,color:'#d8c28d'},
      {x:-1160,y:25,z:70,sx:315,sy:5,sz:190,color:'#efe0a8'},
      {x:-1380,y:72,z:70,sx:24,sy:144,sz:24,color:'#5e4430'},
      {x:-940,y:72,z:70,sx:24,sy:144,sz:24,color:'#5e4430'},
      {x:-1160,y:142,z:-110,sx:530,sy:18,sz:30,color:'#d8ae4d'},
      {x:-1160,y:168,z:-110,sx:440,sy:22,sz:44,color:'#b53d38'},
      {x:-1160,y:194,z:-110,sx:330,sy:18,sz:62,color:'#334c63'},
      // Three stone focus pillars and the hanging Sage bell.
      {x:-1320,y:66,z:230,sx:46,sy:132,sz:46,color:'#75766f'},
      {x:-1160,y:86,z:260,sx:52,sy:172,sz:52,color:'#85857b'},
      {x:-1000,y:66,z:230,sx:46,sy:132,sz:46,color:'#75766f'},
      {x:-1290,y:95,z:-62,sx:18,sy:190,sz:18,color:'#513726'},
      {x:-1030,y:95,z:-62,sx:18,sy:190,sz:18,color:'#513726'},
      {x:-1160,y:181,z:-62,sx:278,sy:18,sz:20,color:'#68472d'},
      {x:-1160,y:138,z:-62,sx:68,sy:72,sz:28,color:'#d4a94b',lit:false},
      // A broad timber bridge separates the sanctuary from the tournament road.
      {x:75,y:17,z:0,sx:270,sy:25,sz:245,color:'#765137'},
      {x:75,y:33,z:-102,sx:290,sy:10,sz:14,color:'#d5aa55'},
      {x:75,y:33,z:102,sx:290,sy:10,sz:14,color:'#d5aa55'},
      {x:-30,y:49,z:-102,sx:12,sy:44,sz:12,color:'#60432f'},
      {x:180,y:49,z:-102,sx:12,sy:44,sz:12,color:'#60432f'},
      {x:-30,y:49,z:102,sx:12,sy:44,sz:12,color:'#60432f'},
      {x:180,y:49,z:102,sx:12,sy:44,sz:12,color:'#60432f'},
      // Blue wind-ribbon markers identify training routes and ability stations.
      ...[-820,-560,-300,310,850].flatMap((x,index)=>[
        {x,y:76,z:-245,sx:11,sy:152,sz:11,color:'#4c392c'},
        {x,y:124,z:-245,sx:12,sy:64,sz:86,color:index%2?'#b43e3b':'#327ba0',alpha:.88,lit:false},
        {x,y:158,z:-245,sx:18,sy:9,sz:100,color:'#d8b858',lit:false}
      ]),
      {x:-1160,y:92,z:-265,sx:410,sy:180,sz:250,color:'#3a2637'},
      {x:-1160,y:192,z:-265,sx:475,sy:28,sz:300,color:'#a32938'},
      {x:-1160,y:226,z:-265,sx:540,sy:20,sz:345,color:'#2a1b2a'},
      {x:-1325,y:72,z:-85,sx:34,sy:144,sz:34,color:'#6c4930'},
      {x:-995,y:72,z:-85,sx:34,sy:144,sz:34,color:'#6c4930'},
      {x:-1160,y:6,z:70,sx:520,sy:8,sz:330,color:'#c6a873'},
      {x:-700,y:6,z:60,sx:420,sy:8,sz:205,color:'#c9ab73'},
      {x:-300,y:6,z:35,sx:400,sy:8,sz:190,color:'#c9ab73'},
      {x:245,y:6,z:20,sx:300,sy:8,sz:180,color:'#c9ab73'},
      {x:500,y:6,z:10,sx:300,sy:8,sz:175,color:'#c9ab73'},
      {x:820,y:6,z:0,sx:390,sy:8,sz:185,color:'#c9ab73'},
      {x:1190,y:6,z:-10,sx:360,sy:8,sz:195,color:'#c9ab73'},
      {x:75,y:4,z:0,sx:165,sy:7,sz:1680,color:'#3b8cc6',alpha:.94,lit:false},
      {x:-30,y:12,z:0,sx:46,sy:22,sz:1720,color:'#856944'},
      {x:180,y:12,z:0,sx:46,sy:22,sz:1720,color:'#856944'},
      {x:600,y:72,z:-135,sx:38,sy:145,sz:38,color:'#4a2f2e'},
      {x:600,y:72,z:135,sx:38,sy:145,sz:38,color:'#4a2f2e'},
      {x:600,y:154,z:0,sx:58,sy:24,sz:340,color:'#d24846'},
      {x:600,y:182,z:0,sx:42,sy:24,sz:300,color:'#f0c95b'},
      {x:1295,y:190,z:-260,sx:650,sy:370,sz:85,color:'#2a1a35'},
      {x:1295,y:390,z:-260,sx:760,sy:40,sz:120,color:'#d33f78'},
      {x:1295,y:445,z:-260,sx:850,sy:30,sz:145,color:'#f0c95b'},
      {x:1040,y:40,z:250,sx:170,sy:80,sz:150,color:'#b35a3d'},
      {x:1250,y:42,z:265,sx:190,sy:84,sz:165,color:'#3d78b4'},
      {x:1420,y:44,z:240,sx:155,sy:88,sz:145,color:'#6b4aa7'},
      {x:-420,y:26,z:-250,sx:100,sy:52,sz:70,color:'#8b775c'},
      {x:-260,y:22,z:255,sx:82,sy:44,sz:64,color:'#8f7959'},
      {x:845,y:25,z:-245,sx:92,sy:50,sz:74,color:'#806e54'}
    ],
    lamps:[{x:-835,z:-120},{x:-835,z:120},{x:980,z:-150},{x:980,z:150}],
    lamp:{post:{y:65,sx:12,sy:130,sz:12,color:'#463224'},light:{y:140,sx:34,sy:34,sz:34,color:'#fff0a3',alpha:.9,lit:false}}
  }
};


const EXPANDED_TRAINING_REGION={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'expanded-training-region',
  name:'Expanded Training Region',
  subtitle:'Non-linear Chapter 3 investigation hub',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.75},
  bounds:{minX:-2000,maxX:2000,minZ:-1400,maxZ:1400},
  spawnPoints:[{x:-260,z:110},{x:-420,z:-40}],
  projectileLimits:{padding:280,minY:-40,maxY:760},
  ai:{wallMargin:140},
  camera:{
    yawDeg:38,
    fov:45,
    clear:'#7fc5eb',
    fogColor:'#b5d9e8',
    fogRange:[1150,3600],
    focusClampX:1900,
    focusClampZ:1300,
    baseDistance:1080,
    separationScale:.15,
    minDistance:1040,
    maxDistance:1240,
    heightBase:470,
    heightDistanceScale:.15,
    horizontalDistanceScale:.8,
    targetHeight:45,
    jumpTargetScale:.16,
    focusSmoothing:.08,
    zoomSmoothing:.06
  },
  floor:{
    base:{x:0,y:-30,z:0,sx:4200,sy:60,sz:3000,color:'#3b6036'},
    surface:{x:0,y:1,z:0,sx:4080,sy:5,sz:2880,color:'#6da153'},
    grid:{stepX:290,stepZ:250,y:4,widthX:1,widthZ:1,height:.8,color:'#d5edba',alphaX:.035,alphaZ:.03},
    centerMark:{x:-40,y:5,z:80,radius:170,segments:44,width:3,height:1.4,color:'#e9f3bc',alpha:.32,crossRadius:200,crossWidth:2,crossAlpha:.16}
  },
  scenery:{
    boxes:[
      {x:0,y:-43,z:0,sx:4420,sy:30,sz:3220,color:'#31522e'},
      ...expandedTrainingRegionScenery(),

      // Central plaza and readable road network.
      {x:-40,y:6,z:80,sx:760,sy:8,sz:620,color:'#c7aa75'},
      {x:680,y:6,z:110,sx:1260,sy:8,sz:190,color:'#c7aa75'},
      {x:-750,y:6,z:120,sx:1320,sy:8,sz:190,color:'#c7aa75'},
      {x:210,y:6,z:-590,sx:190,sy:8,sz:1280,color:'#c7aa75'},
      {x:-360,y:6,z:650,sx:190,sy:8,sz:1220,color:'#c7aa75'},
      {x:1040,y:6,z:-470,sx:850,sy:8,sz:170,color:'#c7aa75'},
      {x:-1180,y:6,z:650,sx:760,sy:8,sz:170,color:'#c7aa75'},

      // Dojo district.
      {x:-200,y:95,z:-335,sx:640,sy:190,sz:330,color:'#3a2637'},
      {x:-200,y:202,z:-335,sx:720,sy:30,sz:390,color:'#a32938'},
      {x:-200,y:240,z:-335,sx:800,sy:22,sz:450,color:'#281a29'},
      {x:-460,y:72,z:-120,sx:36,sy:144,sz:36,color:'#6c4930'},
      {x:60,y:72,z:-120,sx:36,sy:144,sz:36,color:'#6c4930'},

      // Northern hall / training annex.
      {x:930,y:86,z:-770,sx:500,sy:172,sz:280,color:'#3c4f69'},
      {x:930,y:183,z:-770,sx:565,sy:28,sz:335,color:'#d1a64e'},
      {x:930,y:218,z:-770,sx:630,sy:20,sz:380,color:'#243044'},

      // South market buildings.
      {x:-850,y:62,z:690,sx:390,sy:124,sz:250,color:'#b45b3f'},
      {x:-850,y:135,z:690,sx:440,sy:22,sz:300,color:'#572d2d'},
      {x:-440,y:58,z:730,sx:280,sy:116,sz:220,color:'#3f78b0'},
      {x:-440,y:126,z:730,sx:320,sy:22,sz:260,color:'#243f5a'},

      // East service structures and observation tower.
      {x:1180,y:58,z:410,sx:330,sy:116,sz:240,color:'#6b4aa7'},
      {x:1180,y:128,z:410,sx:380,sy:24,sz:285,color:'#352448'},
      {x:1510,y:120,z:-520,sx:90,sy:240,sz:90,color:'#4b4f58'},
      {x:1510,y:270,z:-520,sx:180,sy:32,sz:180,color:'#c84a43'},

      // Smaller props to break up long sightlines without creating dead ends.
      {x:500,y:28,z:430,sx:120,sy:56,sz:80,color:'#8f7759'},
      {x:760,y:24,z:650,sx:95,sy:48,sz:72,color:'#806e54'},
      {x:-1210,y:24,z:120,sx:95,sy:48,sz:72,color:'#8b775c'},
      {x:-1450,y:28,z:-420,sx:120,sy:56,sz:80,color:'#806e54'},
      {x:1280,y:26,z:780,sx:108,sy:52,sz:76,color:'#8f7959'}
    ],
    lamps:[
      {x:-420,z:250},{x:360,z:250},{x:-420,z:-70},{x:360,z:-70},
      {x:720,z:90},{x:-840,z:105},{x:210,z:-640},{x:-350,z:690}
    ],
    lamp:{post:{y:68,sx:12,sy:136,sz:12,color:'#463224'},light:{y:146,sx:35,sy:35,sz:35,color:'#fff0a3',alpha:.9,lit:false}}
  }
};



const LOCAL_TOURNAMENT_HUB={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'tournament-hub',
  name:'Local Tournament Grounds',
  subtitle:'Open Chapter 2 story hub',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.75},
  bounds:{minX:-1800,maxX:1800,minZ:-1120,maxZ:1120},
  spawnPoints:[{x:-1510,z:80},{x:-1380,z:-80}],
  projectileLimits:{padding:280,minY:-40,maxY:760},
  ai:{wallMargin:135},
  camera:{
    yawDeg:34,fov:45,clear:'#79c3ec',fogColor:'#dcecf0',fogRange:[1100,3400],
    focusClampX:1710,focusClampZ:1030,baseDistance:1040,separationScale:.15,
    minDistance:1000,maxDistance:1240,heightBase:455,heightDistanceScale:.15,
    horizontalDistanceScale:.8,targetHeight:44,jumpTargetScale:.16,
    focusSmoothing:.08,zoomSmoothing:.06
  },
  floor:{
    base:{x:0,y:-30,z:0,sx:3820,sy:60,sz:2440,color:'#756248'},
    surface:{x:0,y:1,z:0,sx:3700,sy:5,sz:2320,color:'#cbb98f'},
    grid:{stepX:120,stepZ:120,y:4,widthX:1.4,widthZ:1.4,height:.8,color:'#8c7156',alphaX:.08,alphaZ:.07},
    centerMark:{x:-310,y:5,z:40,radius:180,segments:44,width:5,height:1.5,color:'#c63832',alpha:.68,crossRadius:215,crossWidth:4,crossAlpha:.38}
  },
  scenery:{
    boxes:[
      {x:0,y:-43,z:0,sx:4050,sy:30,sz:2700,color:'#4a5f54'},
      // Pale tournament avenues and tiled courtyards.
      {x:-640,y:6,z:40,sx:2200,sy:8,sz:230,color:'#e6d6ae'},
      {x:-310,y:6,z:40,sx:1000,sy:9,sz:780,color:'#f3e5c0'},
      {x:520,y:6,z:40,sx:800,sy:8,sz:250,color:'#eadbb5'},
      {x:1060,y:6,z:40,sx:460,sy:8,sz:280,color:'#f0dfb8'},
      {x:-850,y:6,z:-430,sx:1180,sy:8,sz:165,color:'#d9c79e'},
      {x:250,y:6,z:-430,sx:1020,sy:8,sz:165,color:'#d9c79e'},
      {x:900,y:6,z:-260,sx:170,sy:8,sz:500,color:'#d9c79e'},
      {x:-1030,y:6,z:570,sx:920,sy:8,sz:185,color:'#efe0bb'},
      {x:-150,y:6,z:570,sx:900,sy:8,sz:185,color:'#efe0bb'},
      {x:700,y:6,z:570,sx:820,sy:8,sz:185,color:'#efe0bb'},
      {x:1010,y:6,z:350,sx:170,sy:8,sz:560,color:'#efe0bb'},
      {x:-860,y:7,z:120,sx:165,sy:9,sz:940,color:'#f5e6c1'},
      {x:240,y:7,z:230,sx:165,sy:9,sz:760,color:'#f5e6c1'},
      {x:650,y:7,z:40,sx:165,sy:9,sz:980,color:'#f5e6c1'},
      // West ceremonial gate: a martial-arts homage with original colors and crest.
      {x:-1650,y:112,z:-210,sx:86,sy:224,sz:86,color:'#f1e4c4'},
      {x:-1650,y:112,z:350,sx:86,sy:224,sz:86,color:'#f1e4c4'},
      {x:-1650,y:218,z:70,sx:92,sy:34,sz:650,color:'#2b6f78'},
      {x:-1650,y:248,z:70,sx:125,sy:26,sz:720,color:'#a54432'},
      {x:-1650,y:282,z:70,sx:160,sy:18,sz:610,color:'#7e2f27'},
      {x:-1638,y:190,z:70,sx:28,sy:84,sz:280,color:'#fff3c2',lit:false},
      {x:-1620,y:190,z:70,sx:12,sy:48,sz:190,color:'#c63832',lit:false},
      // Arena hall exterior. The actual combat arena remains a separate untouched map.
      {x:1530,y:210,z:40,sx:420,sy:420,sz:1480,color:'#f0dfb8'},
      {x:1450,y:430,z:40,sx:520,sy:42,sz:1570,color:'#a54432'},
      {x:1390,y:475,z:40,sx:600,sy:30,sz:1660,color:'#7e2f27'},
      {x:1290,y:118,z:-245,sx:105,sy:236,sz:250,color:'#f7ebcf'},
      {x:1290,y:118,z:325,sx:105,sy:236,sz:250,color:'#f7ebcf'},
      {x:1288,y:236,z:40,sx:108,sy:34,sz:820,color:'#2b6f78'},
      {x:1280,y:275,z:40,sx:120,sy:54,sz:390,color:'#f5e8ca'},
      {x:1270,y:275,z:40,sx:18,sy:20,sz:250,color:'#c63832',lit:false},
      {x:1260,y:98,z:40,sx:85,sy:196,sz:260,color:'#241d1a'},
      // Registration pavilions and bracket tower.
      {x:-120,y:62,z:-560,sx:450,sy:124,sz:270,color:'#f1e4c4'},
      {x:-120,y:138,z:-560,sx:520,sy:30,sz:330,color:'#2b6f78'},
      {x:-120,y:174,z:-560,sx:590,sy:22,sz:380,color:'#a54432'},
      {x:-520,y:52,z:-610,sx:270,sy:104,sz:220,color:'#efe3c4'},
      {x:-520,y:116,z:-610,sx:320,sy:26,sz:265,color:'#c63832'},
      {x:905,y:100,z:-500,sx:70,sy:200,sz:300,color:'#3f332b'},
      {x:892,y:105,z:-500,sx:18,sy:160,sz:245,color:'#f7e9c7'},
      {x:880,y:168,z:-500,sx:20,sy:20,sz:205,color:'#c63832',lit:false},
      // Food street: small open festival stalls, not village houses.
      {x:-680,y:54,z:620,sx:340,sy:108,sz:235,color:'#f7e9c7'},
      {x:-680,y:120,z:620,sx:390,sy:26,sz:285,color:'#c63832'},
      {x:-300,y:50,z:650,sx:290,sy:100,sz:215,color:'#f3e7ca'},
      {x:-300,y:112,z:650,sx:340,sy:26,sz:260,color:'#287a87'},
      {x:130,y:46,z:610,sx:250,sy:92,sz:195,color:'#f5e8ca'},
      {x:130,y:104,z:610,sx:300,sy:24,sz:240,color:'#e0a52f'},
      // Cloth counters and hanging lantern rails.
      {x:-680,y:25,z:492,sx:280,sy:44,sz:36,color:'#7b4b2f'},
      {x:-300,y:25,z:532,sx:230,sy:44,sz:36,color:'#6d4f32'},
      {x:130,y:25,z:495,sx:200,sy:44,sz:36,color:'#755037'},
      // Practice ring west/south-west.
      {x:-1120,y:7,z:560,sx:540,sy:12,sz:430,color:'#d8ca9e'},
      {x:-1120,y:10,z:560,sx:440,sy:8,sz:330,color:'#efe4bd'},
      {x:-1385,y:42,z:560,sx:18,sy:84,sz:460,color:'#5e3b2f'},
      {x:-855,y:42,z:560,sx:18,sy:84,sz:460,color:'#5e3b2f'},
      {x:-1120,y:42,z:330,sx:540,sy:84,sz:18,color:'#5e3b2f'},
      {x:-1120,y:42,z:790,sx:540,sy:84,sz:18,color:'#5e3b2f'},
      // Fighter waiting pavilion and spectator rest court.
      {x:640,y:68,z:-520,sx:430,sy:136,sz:310,color:'#f1e4c4'},
      {x:640,y:150,z:-520,sx:500,sy:30,sz:370,color:'#a54432'},
      {x:-900,y:36,z:-420,sx:160,sy:72,sz:90,color:'#287a87'},
      {x:-900,y:84,z:-420,sx:188,sy:22,sz:120,color:'#e7c25a'},
      {x:760,y:30,z:420,sx:130,sy:60,sz:82,color:'#c63832'},
      {x:760,y:72,z:420,sx:158,sy:20,sz:106,color:'#e7c25a'},
      {x:-1450,y:22,z:300,sx:160,sy:44,sz:48,color:'#72563f'},
      {x:-1340,y:22,z:300,sx:52,sy:44,sz:48,color:'#72563f'},
      {x:420,y:22,z:-720,sx:180,sy:44,sz:52,color:'#72563f'},
      {x:560,y:22,z:-720,sx:70,sy:44,sz:52,color:'#72563f'},
      // Service lane behind the practice ring for Bark's repair quest.
      {x:-1120,y:4,z:900,sx:780,sy:8,sz:140,color:'#6e745a'},
      {x:-1490,y:34,z:900,sx:28,sy:68,sz:150,color:'#4d4b43'},
      {x:-750,y:34,z:900,sx:28,sy:68,sz:150,color:'#4d4b43'},
      // Trees and carts create readable districts without invisible walls.
      {x:-1540,y:58,z:-760,sx:28,sy:116,sz:28,color:'#5d3d29'},
      {x:-1540,y:145,z:-760,sx:130,sy:120,sz:130,color:'#397442'},
      {x:-1540,y:58,z:820,sx:28,sy:116,sz:28,color:'#5d3d29'},
      {x:-1540,y:145,z:820,sx:130,sy:120,sz:130,color:'#397442'},
      {x:-980,y:26,z:-650,sx:110,sy:52,sz:78,color:'#887258'},
      {x:260,y:24,z:670,sx:96,sy:48,sz:72,color:'#806c54'},
      {x:830,y:28,z:670,sx:118,sy:56,sz:82,color:'#90795a'},
      ...tournamentPlazaDecor()
    ],
    lamps:[
      {x:-900,z:-120},{x:-420,z:-120},{x:80,z:-120},{x:560,z:-120},
      {x:-900,z:220},{x:-420,z:220},{x:80,z:220},{x:560,z:220}
    ],
    lamp:{post:{y:70,sx:12,sy:140,sz:12,color:'#463224'},light:{y:150,sx:36,sy:36,sz:36,color:'#fff0a3',alpha:.9,lit:false}}
  }
};

const AFTER_HOURS_TOURNAMENT={
  ...LOCAL_TOURNAMENT_HUB,
  id:'after-hours-tournament',
  name:'After-Hours Tournament',
  subtitle:'Chapter 3 nighttime investigation hub',
  performance:{...LOCAL_TOURNAMENT_HUB.performance,particleMultiplier:.66},
  camera:{
    ...LOCAL_TOURNAMENT_HUB.camera,
    clear:'#071329',
    fogColor:'#16263c',
    fogRange:[760,2850]
  },
  floor:{
    ...LOCAL_TOURNAMENT_HUB.floor,
    base:{...LOCAL_TOURNAMENT_HUB.floor.base,color:'#172622'},
    surface:{...LOCAL_TOURNAMENT_HUB.floor.surface,color:'#48564f'},
    grid:{...LOCAL_TOURNAMENT_HUB.floor.grid,color:'#99aaa1',alphaX:.07,alphaZ:.055},
    centerMark:{...LOCAL_TOURNAMENT_HUB.floor.centerMark,color:'#7b8d85',alpha:.28,crossAlpha:.14}
  },
  scenery:{
    boxes:[
      ...nightTournamentBoxes(LOCAL_TOURNAMENT_HUB.scenery.boxes),
      // Closed shutters and stripped counters show that the festival has ended.
      {x:-680,y:65,z:486,sx:290,sy:104,sz:18,color:'#273632'},
      {x:-300,y:63,z:526,sx:240,sy:100,sz:18,color:'#283833'},
      {x:130,y:61,z:489,sx:210,sy:96,sz:18,color:'#293a35'},
      {x:-520,y:60,z:-495,sx:230,sy:92,sz:18,color:'#2a3938'},
      // Cleanup carts, folded banners, medical tents, and security barriers.
      {x:-1120,y:30,z:900,sx:180,sy:58,sz:92,color:'#596466'},
      {x:-1010,y:18,z:900,sx:62,sy:36,sz:62,color:'#252a2d'},
      {x:-1230,y:18,z:900,sx:62,sy:36,sz:62,color:'#252a2d'},
      {x:-260,y:28,z:520,sx:150,sy:56,sz:78,color:'#5d665f'},
      {x:420,y:24,z:-690,sx:180,sy:48,sz:58,color:'#4d5552'},
      {x:580,y:24,z:-690,sx:70,sy:48,sz:58,color:'#4d5552'},
      {x:650,y:74,z:-520,sx:460,sy:14,sz:340,color:'#d7ddd6',alpha:.72},
      {x:650,y:117,z:-520,sx:400,sy:72,sz:290,color:'#38565b',alpha:.78},
      {x:1010,y:46,z:350,sx:18,sy:92,sz:350,color:'#9aa59d'},
      {x:1010,y:96,z:180,sx:40,sy:20,sz:28,color:'#d8b858',lit:false},
      {x:1010,y:96,z:350,sx:40,sy:20,sz:28,color:'#d8b858',lit:false},
      {x:1010,y:96,z:520,sx:40,sy:20,sz:28,color:'#d8b858',lit:false},
      // Faint energy seams lead the eye toward the underground investigation.
      {x:1080,y:9,z:40,sx:470,sy:4,sz:12,color:'#74d7e4',alpha:.52,lit:false},
      {x:890,y:9,z:-120,sx:12,sy:4,sz:330,color:'#74d7e4',alpha:.38,lit:false}
    ],
    lamps:[
      {x:-1450,z:80},{x:-900,z:-120},{x:-420,z:-120},{x:80,z:-120},
      {x:560,z:-120},{x:-900,z:220},{x:-420,z:220},{x:80,z:220},
      {x:560,z:220},{x:1030,z:-250},{x:1030,z:350}
    ],
    lamp:{post:{y:72,sx:12,sy:144,sz:12,color:'#253332'},light:{y:154,sx:38,sy:38,sz:38,color:'#a9efff',alpha:.92,lit:false}}
  }
};

const RESONANCE_FACILITY={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'resonance-facility',
  name:'Abandoned Resonance Facility',
  subtitle:'Chapter 3 underground investigation and combat',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.72},
  bounds:{minX:-1180,maxX:1180,minZ:-720,maxZ:720},
  spawnPoints:[{x:-880,z:0},{x:430,z:0}],
  projectileLimits:{padding:220,minY:-45,maxY:680},
  ai:{wallMargin:120},
  camera:{
    yawDeg:34,fov:46,clear:'#101526',fogColor:'#18253a',fogRange:[760,2200],
    focusClampX:1100,focusClampZ:650,baseDistance:940,separationScale:.18,
    minDistance:880,maxDistance:1120,heightBase:390,heightDistanceScale:.14,
    horizontalDistanceScale:.8,targetHeight:42,jumpTargetScale:.16,
    focusSmoothing:.1,zoomSmoothing:.08
  },
  floor:{
    base:{x:0,y:-30,z:0,sx:2520,sy:60,sz:1660,color:'#111827'},
    surface:{x:0,y:1,z:0,sx:2420,sy:5,sz:1560,color:'#28364a'},
    grid:{stepX:180,stepZ:160,y:4,widthX:1.2,widthZ:1.2,height:.8,color:'#85d9ff',alphaX:.08,alphaZ:.06},
    centerMark:{x:310,y:5,z:0,radius:180,segments:36,width:4,height:1.4,color:'#74e4f4',alpha:.32,crossRadius:215,crossWidth:2,crossAlpha:.18}
  },
  scenery:{
    boxes:[
      {x:0,y:-43,z:0,sx:2740,sy:30,sz:1860,color:'#0b111d'},
      {x:-1060,y:130,z:0,sx:90,sy:260,sz:1500,color:'#172234'},
      {x:1060,y:130,z:0,sx:90,sy:260,sz:1500,color:'#172234'},
      {x:0,y:130,z:-650,sx:2200,sy:260,sz:90,color:'#172234'},
      {x:0,y:130,z:650,sx:2200,sy:260,sz:90,color:'#172234'},
      {x:-720,y:74,z:-420,sx:260,sy:148,sz:160,color:'#243b50'},
      {x:-720,y:74,z:420,sx:260,sy:148,sz:160,color:'#243b50'},
      {x:-340,y:62,z:-430,sx:210,sy:124,sz:180,color:'#3b263b'},
      {x:-340,y:62,z:430,sx:210,sy:124,sz:180,color:'#253e47'},
      {x:40,y:86,z:-470,sx:280,sy:172,sz:130,color:'#1e3348'},
      {x:40,y:86,z:470,sx:280,sy:172,sz:130,color:'#1e3348'},
      {x:420,y:70,z:-440,sx:240,sy:140,sz:160,color:'#3b2d48'},
      {x:420,y:70,z:440,sx:240,sy:140,sz:160,color:'#3b2d48'},
      {x:790,y:105,z:-410,sx:250,sy:210,sz:190,color:'#222a3d'},
      {x:790,y:105,z:410,sx:250,sy:210,sz:190,color:'#222a3d'},
      {x:-845,y:170,z:0,sx:28,sy:320,sz:1030,color:'#516476',alpha:.55},
      {x:-480,y:170,z:0,sx:24,sy:320,sz:1030,color:'#516476',alpha:.48},
      {x:650,y:170,z:0,sx:24,sy:320,sz:1030,color:'#516476',alpha:.48},
      {x:890,y:130,z:0,sx:90,sy:260,sz:500,color:'#191c2d'},
      {x:900,y:95,z:0,sx:48,sy:190,sz:180,color:'#6c4d8a',alpha:.82}
    ],
    lamps:[
      {x:-850,z:-300},{x:-850,z:300},{x:-430,z:-300},{x:-430,z:300},
      {x:0,z:-300},{x:0,z:300},{x:440,z:-300},{x:440,z:300},{x:820,z:0}
    ],
    lamp:{post:{y:80,sx:10,sy:160,sz:10,color:'#243345'},light:{y:164,sx:30,sy:30,sz:30,color:'#8fe8ff',alpha:.86,lit:false}}
  }
};

const REMOTE_HIGHLANDS={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'remote-highlands',
  name:'Remote Highlands',
  subtitle:'Chapter 3 destination near Shadow’s Lookout',
  available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.7},
  bounds:{minX:-1250,maxX:1250,minZ:-820,maxZ:820},
  spawnPoints:[{x:-820,z:130},{x:-900,z:40}],
  projectileLimits:{padding:220,minY:-45,maxY:820},
  ai:{wallMargin:120},
  camera:{
    yawDeg:39,fov:44,clear:'#6589ad',fogColor:'#a9bfd0',fogRange:[1000,3100],
    focusClampX:1180,focusClampZ:750,baseDistance:1040,separationScale:.15,
    minDistance:980,maxDistance:1210,heightBase:475,heightDistanceScale:.16,
    horizontalDistanceScale:.8,targetHeight:48,jumpTargetScale:.17,
    focusSmoothing:.09,zoomSmoothing:.07
  },
  floor:{
    base:{x:0,y:-38,z:0,sx:2720,sy:76,sz:1800,color:'#30483a'},
    surface:{x:0,y:1,z:0,sx:2600,sy:5,sz:1680,color:'#55765a'},
    grid:{stepX:260,stepZ:220,y:4,widthX:1,widthZ:1,height:.8,color:'#d9e6d4',alphaX:.03,alphaZ:.025},
    centerMark:{x:-820,y:5,z:130,radius:120,segments:36,width:3,height:1.4,color:'#acc7d6',alpha:.24,crossRadius:145,crossWidth:2,crossAlpha:.12}
  },
  scenery:{
    boxes:[
      {x:0,y:-52,z:0,sx:2920,sy:32,sz:2020,color:'#25392e'},
      {x:-260,y:8,z:100,sx:1850,sy:10,sz:190,color:'#7a735d'},
      {x:700,y:72,z:-420,sx:380,sy:144,sz:300,color:'#4a5260'},
      {x:790,y:182,z:-440,sx:180,sy:220,sz:150,color:'#343945'},
      {x:1020,y:310,z:-560,sx:100,sy:620,sz:100,color:'#242a38'},
      {x:1020,y:640,z:-560,sx:180,sy:80,sz:180,color:'#bcdcff',alpha:.58},
      {x:300,y:46,z:470,sx:360,sy:92,sz:220,color:'#4e554d'},
      {x:360,y:112,z:470,sx:210,sy:70,sz:160,color:'#60635a'},
      {x:-300,y:38,z:-430,sx:210,sy:76,sz:150,color:'#4b504a'},
      {x:-80,y:54,z:-520,sx:260,sy:108,sz:190,color:'#444b47'},
      {x:590,y:42,z:290,sx:240,sy:84,sz:170,color:'#4b514d'},
      ...Array.from({length:14},(_,index)=>{
        const x=-1120+index*170;
        return{x,y:70+(index%3)*10,z:index%2?-690:690,sx:28,sy:140,sz:28,color:'#4d3d2b'};
      }),
      ...Array.from({length:14},(_,index)=>{
        const x=-1120+index*170;
        return{x,y:162+(index%3)*14,z:index%2?-690:690,sx:118,sy:110,sz:118,color:index%2?'#315c3f':'#3e6948'};
      })
    ],
    lamps:[]
  }
};



const ECHO_VILLAGE={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'echo-village',name:'Echo Region',subtitle:'Ancient village beneath Shadow’s Lookout',available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.72},
  bounds:{minX:-1600,maxX:1600,minZ:-920,maxZ:920},
  spawnPoints:[{x:-1320,z:80},{x:120,z:-40}],projectileLimits:{padding:240,minY:-70,maxY:980},ai:{wallMargin:140},
  camera:{yawDeg:38,fov:44,clear:'#7897b1',fogColor:'#b7cad5',fogRange:[1100,3600],focusClampX:1500,focusClampZ:850,baseDistance:1120,separationScale:.17,minDistance:1030,maxDistance:1300,heightBase:490,heightDistanceScale:.16,horizontalDistanceScale:.82,targetHeight:48,jumpTargetScale:.17,focusSmoothing:.09,zoomSmoothing:.065},
  floor:{
    base:{x:0,y:-42,z:0,sx:3440,sy:84,sz:2020,color:'#293c35'},
    surface:{x:0,y:1,z:0,sx:3300,sy:5,sz:1880,color:'#607c63'},
    grid:{stepX:330,stepZ:260,y:4,widthX:1,widthZ:1,height:.8,color:'#d9eadf',alphaX:.018,alphaZ:.015},
    centerMark:{x:-1250,y:5,z:80,radius:120,segments:36,width:3,height:1.4,color:'#9dd7df',alpha:.26,crossRadius:145,crossWidth:2,crossAlpha:.12}
  },
  scenery:{boxes:[
    {x:0,y:-56,z:0,sx:3660,sy:36,sz:2240,color:'#203129'},
    {x:-1260,y:22,z:80,sx:310,sy:34,sz:230,color:'#52645d'},
    {x:-1260,y:78,z:80,sx:160,sy:110,sz:130,color:'#293c44',alpha:.86},
    {x:-420,y:18,z:520,sx:500,sy:30,sz:340,color:'#7f806d'},
    {x:220,y:14,z:120,sx:780,sy:22,sz:510,color:'#7f735f'},
    {x:1010,y:34,z:460,sx:390,sy:68,sz:300,color:'#52645d'},
    {x:1260,y:110,z:-440,sx:150,sy:220,sz:330,color:'#3f514a'},
    {x:1320,y:260,z:-470,sx:90,sy:520,sz:90,color:'#2b3338'},
    {x:1320,y:555,z:-470,sx:150,sy:70,sz:150,color:'#b5d8e9',alpha:.54},
    ...Array.from({length:12},(_,i)=>({x:-760+i*130,y:44,z:720-(i%3)*45,sx:82,sy:88,sz:70,color:i%2?'#5b6760':'#6b6f63'})),
    ...Array.from({length:10},(_,i)=>({x:-660+i*150,y:38,z:-690+(i%2)*80,sx:70,sy:76,sz:64,color:i%2?'#5b6760':'#6b6f63'}))
  ],lamps:[]}
};

const ECHO_CAVERNS={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'echo-caverns',name:'Echo Caverns',subtitle:'Resonant ruins beneath Echo Village',available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.68},
  bounds:{minX:-1200,maxX:1200,minZ:-700,maxZ:700},
  spawnPoints:[{x:-980,z:0},{x:860,z:0}],projectileLimits:{padding:180,minY:-90,maxY:760},ai:{wallMargin:120},
  camera:{yawDeg:42,fov:43,clear:'#121b24',fogColor:'#263947',fogRange:[700,2300],focusClampX:1120,focusClampZ:640,baseDistance:980,separationScale:.2,minDistance:900,maxDistance:1160,heightBase:430,heightDistanceScale:.17,horizontalDistanceScale:.8,targetHeight:48,jumpTargetScale:.17,focusSmoothing:.08,zoomSmoothing:.06},
  floor:{base:{x:0,y:-46,z:0,sx:2620,sy:92,sz:1580,color:'#171f24'},surface:{x:0,y:1,z:0,sx:2480,sy:5,sz:1440,color:'#36454a'},grid:{stepX:240,stepZ:200,y:4,widthX:1,widthZ:1,height:.8,color:'#8fd7dc',alphaX:.025,alphaZ:.02},centerMark:{x:-980,y:5,z:0,radius:95,segments:32,width:3,height:1.3,color:'#71d1dd',alpha:.2,crossRadius:118,crossWidth:2,crossAlpha:.1}},
  scenery:{boxes:[
    {x:0,y:-60,z:0,sx:2820,sy:40,sz:1780,color:'#10171c'},
    {x:-1180,y:180,z:0,sx:100,sy:360,sz:1500,color:'#202b31'},{x:1180,y:180,z:0,sx:100,sy:360,sz:1500,color:'#202b31'},
    {x:0,y:180,z:-680,sx:2500,sy:360,sz:90,color:'#202b31'},{x:0,y:180,z:680,sx:2500,sy:360,sz:90,color:'#202b31'},
    ...Array.from({length:11},(_,i)=>({x:-980+i*196,y:80+(i%3)*22,z:i%2?-520:520,sx:80+(i%2)*22,sy:160+(i%3)*44,sz:92,color:i%2?'#2c3a40':'#33464a'})),
    {x:-720,y:100,z:-260,sx:70,sy:200,sz:260,color:'#54302e',alpha:.88},{x:-120,y:100,z:280,sx:70,sy:200,sz:260,color:'#4f5247',alpha:.88},{x:470,y:100,z:-250,sx:70,sy:200,sz:260,color:'#2c4f69',alpha:.88},
    {x:830,y:90,z:0,sx:330,sy:180,sz:520,color:'#263238',alpha:.92}
  ],lamps:[]}
};

const ECHO_SKY={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'echo-sky',name:'Upper Atmosphere',subtitle:'Ryuzankaro secret encounter',available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.82},
  bounds:{minX:-720,maxX:720,minZ:-480,maxZ:480},spawnPoints:[{x:-260,z:0},{x:260,z:0}],projectileLimits:{padding:180,minY:-80,maxY:980},ai:{wallMargin:90},
  camera:{yawDeg:35,fov:45,clear:'#223b69',fogColor:'#8fb8e7',fogRange:[850,2600],focusClampX:650,focusClampZ:430,baseDistance:890,separationScale:.42,minDistance:860,maxDistance:1100,heightBase:420,heightDistanceScale:.18,horizontalDistanceScale:.8,targetHeight:55,jumpTargetScale:.18,focusSmoothing:.07,zoomSmoothing:.05},
  floor:{base:{x:0,y:-44,z:0,sx:1600,sy:80,sz:1100,color:'#476f93',alpha:.2},surface:{x:0,y:1,z:0,sx:1480,sy:4,sz:980,color:'#a8d6f2',alpha:.14},grid:{stepX:190,stepZ:170,y:4,widthX:1,widthZ:1,height:.7,color:'#e9f7ff',alphaX:.035,alphaZ:.03},centerMark:{x:0,y:5,z:0,radius:110,segments:36,width:3,height:1.3,color:'#d8f6ff',alpha:.22,crossRadius:135,crossWidth:2,crossAlpha:.1}},
  scenery:{boxes:[
    {x:0,y:-70,z:0,sx:1800,sy:30,sz:1300,color:'#6ea0c2',alpha:.12},
    ...Array.from({length:10},(_,i)=>({x:-800+i*175,y:80+(i%3)*70,z:i%2?-600:600,sx:260,sy:45,sz:130,color:'#eaf8ff',alpha:.15,lit:false}))
  ],lamps:[]}
};

const ECHO_MOUNTAIN={
  schema:ARENA_STAGE_SCHEMA_VERSION,
  id:'echo-mountain',name:'Mountain Path',subtitle:'The ascent to Shadow’s Lookout',available:true,
  performance:{tier:'medium',mobileScenery:'reduced',particleMultiplier:.72},
  bounds:{minX:-1450,maxX:1450,minZ:-760,maxZ:760},spawnPoints:[{x:-1240,z:0},{x:760,z:0}],projectileLimits:{padding:220,minY:-120,maxY:980},ai:{wallMargin:120},
  camera:{yawDeg:40,fov:44,clear:'#6b8298',fogColor:'#c1ced8',fogRange:[1000,3400],focusClampX:1360,focusClampZ:700,baseDistance:1060,separationScale:.2,minDistance:980,maxDistance:1250,heightBase:500,heightDistanceScale:.17,horizontalDistanceScale:.82,targetHeight:52,jumpTargetScale:.18,focusSmoothing:.085,zoomSmoothing:.06},
  floor:{base:{x:0,y:-58,z:0,sx:3140,sy:116,sz:1720,color:'#2c3939'},surface:{x:0,y:1,z:0,sx:3000,sy:5,sz:1580,color:'#69756c'},grid:{stepX:290,stepZ:230,y:4,widthX:1,widthZ:1,height:.8,color:'#dce5e1',alphaX:.018,alphaZ:.015},centerMark:{x:-1240,y:5,z:0,radius:110,segments:36,width:3,height:1.3,color:'#b4dce1',alpha:.22,crossRadius:135,crossWidth:2,crossAlpha:.1}},
  scenery:{boxes:[
    {x:0,y:-76,z:0,sx:3360,sy:40,sz:1940,color:'#222d2e'},
    {x:-300,y:28,z:0,sx:2100,sy:38,sz:280,color:'#887e69'},
    {x:-720,y:95,z:240,sx:300,sy:190,sz:170,color:'#4e5755'},{x:-180,y:110,z:-280,sx:260,sy:220,sz:190,color:'#454e4e'},{x:430,y:135,z:250,sx:300,sy:270,sz:220,color:'#41494b'},
    {x:1120,y:445,z:-330,sx:420,sy:42,sz:340,color:'#2b3138',alpha:.94},{x:1120,y:525,z:-330,sx:240,sy:120,sz:220,color:'#566979',alpha:.92},{x:1120,y:610,z:-330,sx:300,sy:52,sz:280,color:'#b8dff0',alpha:.55},
    ...Array.from({length:15},(_,i)=>({x:-1320+i*185,y:85+(i%4)*26,z:i%2?-650:650,sx:150+(i%3)*35,sy:170+(i%4)*52,sz:170,color:i%2?'#3f4a48':'#48524f'}))
  ],lamps:[]}
};

export const ARENA_STAGE_CATALOG=deepFreeze([
  {id:'dojo',name:'Tangai Dojo',status:'Playable',available:true,role:'Medium closed arena'},
  {id:'tournament',name:'Global Tournament',status:'Playable',available:true,role:'Large long-range arena • 1500 × 900'},
  {id:'asrylyte',name:'Asrylyte Zone',status:'Next effects checkpoint',available:false,role:'Small effects-heavy arena'}
]);

export const ARENA_STAGES=deepFreeze({
  dojo:TANGAI_DOJO,
  tournament:GLOBAL_TOURNAMENT,
  'training-field':TRAINING_FIELD,
  'training-road':TRAINING_ROAD,
  'expanded-training-region':EXPANDED_TRAINING_REGION,
  'tournament-hub':LOCAL_TOURNAMENT_HUB,
  'after-hours-tournament':AFTER_HOURS_TOURNAMENT,
  'resonance-facility':RESONANCE_FACILITY,
  'remote-highlands':REMOTE_HIGHLANDS,
  'echo-village':ECHO_VILLAGE,
  'echo-caverns':ECHO_CAVERNS,
  'echo-sky':ECHO_SKY,
  'echo-mountain':ECHO_MOUNTAIN
});

export function validateArenaStage(stage){
  const errors=[];
  if(!stage||typeof stage!=='object')return{valid:false,errors:['Stage must be an object.']};
  if(stage.schema!==ARENA_STAGE_SCHEMA_VERSION)errors.push(`Unsupported schema ${stage.schema}.`);
  if(!stage.id||!stage.name)errors.push('Stage id and name are required.');
  const b=stage.bounds;
  if(!b||![b.minX,b.maxX,b.minZ,b.maxZ].every(Number.isFinite))errors.push('Finite rectangular bounds are required.');
  else if(!(b.minX<b.maxX&&b.minZ<b.maxZ))errors.push('Stage bounds must have positive size.');
  if(!Array.isArray(stage.spawnPoints)||stage.spawnPoints.length<2)errors.push('At least two spawn points are required.');
  else for(const [index,spawn] of stage.spawnPoints.entries()){
    if(!Number.isFinite(spawn.x)||!Number.isFinite(spawn.z))errors.push(`Spawn ${index+1} must use finite x/z coordinates.`);
    else if(b&&(spawn.x<b.minX||spawn.x>b.maxX||spawn.z<b.minZ||spawn.z>b.maxZ))errors.push(`Spawn ${index+1} is outside the arena bounds.`);
  }
  const camera=stage.camera;
  if(!camera||![camera.yawDeg,camera.fov,camera.minDistance,camera.maxDistance].every(Number.isFinite))errors.push('Camera yaw, FOV, and distance limits are required.');
  else if(camera.minDistance>camera.maxDistance)errors.push('Camera minimum distance exceeds maximum distance.');
  const limits=stage.projectileLimits;
  if(!limits||![limits.padding,limits.minY,limits.maxY].every(Number.isFinite))errors.push('Projectile cleanup limits are required.');
  if(stage.boundary&&!stage.boundary.rail&&!Array.isArray(stage.boundary.rails))errors.push('Boundary requires a rail or rails array.');
  return{valid:errors.length===0,errors};
}

export function getArenaStage(id='dojo'){
  const stage=ARENA_STAGES[id]||ARENA_STAGES.dojo;
  const result=validateArenaStage(stage);
  if(!result.valid)throw new Error(`Invalid arena stage “${id}”: ${result.errors.join(' ')}`);
  return stage;
}

export function listArenaStages(){
  return ARENA_STAGE_CATALOG.map(entry=>{
    const loaded=ARENA_STAGES[entry.id];
    const available=!!loaded&&loaded.available!==false;
    return{...entry,available,status:available?'Playable':entry.status};
  });
}

export function clampToStage(stage,x,z){
  const b=stage.bounds;
  return{x:Math.max(b.minX,Math.min(b.maxX,x)),z:Math.max(b.minZ,Math.min(b.maxZ,z))};
}

export function outsideStageProjectileBounds(stage,projectile){
  const b=stage.bounds,p=stage.projectileLimits.padding;
  return projectile.x<b.minX-p||projectile.x>b.maxX+p||projectile.z<b.minZ-p||projectile.z>b.maxZ+p||projectile.y<stage.projectileLimits.minY||projectile.y>stage.projectileLimits.maxY;
}

export function stageWallAvoidance(stage,x,z,margin=55){
  const b=stage.bounds;let pushX=0,pushZ=0;
  if(x-b.minX<margin)pushX+=(margin-(x-b.minX))/margin;
  if(b.maxX-x<margin)pushX-=(margin-(b.maxX-x))/margin;
  if(z-b.minZ<margin)pushZ+=(margin-(z-b.minZ))/margin;
  if(b.maxZ-z<margin)pushZ-=(margin-(b.maxZ-z))/margin;
  return{x:pushX,z:pushZ,near:Math.abs(pushX)+Math.abs(pushZ)>0};
}

export function nearStageWall(stage,x,z,margin=45){return stageWallAvoidance(stage,x,z,margin).near}
