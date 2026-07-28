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
    clear:'#101326',
    fogColor:'#0e0f1c',
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
    base:{x:0,y:-15,z:0,sx:760,sy:30,sz:520,color:'#4b3044'},
    surface:{x:0,y:1,z:0,sx:724,sy:4,sz:484,color:'#815f72'},
    grid:{stepX:60,stepZ:48,y:4,widthX:1.8,widthZ:1.8,height:1.2,color:'#e5b5ce',alphaX:.42,alphaZ:.35},
    centerMark:{x:0,y:5,z:0,radius:92,segments:36,width:3,height:1.5,color:'#ff91d4',alpha:.74,crossRadius:105,crossWidth:2,crossAlpha:.55}
  },
  boundary:{
    postSpacing:120,
    post:{y:24,sx:9,sy:48,sz:9,color:'#2b1d32'},
    cap:{y:52,sx:14,sy:10,sz:14,color:'#ff55b6',lit:false},
    rail:{y:34,width:7,height:7,color:'#553149'}
  },
  scenery:{
    boxes:[
      {x:-70,y:120,z:-318,sx:560,sy:230,sz:34,color:'#211827'},
      {x:-70,y:238,z:-316,sx:620,sy:24,sz:78,color:'#512b4b'},
      {x:-70,y:260,z:-316,sx:700,sy:18,sz:104,color:'#2a1b31'},
      {x:-70,y:124,z:-296,sx:250,sy:170,sz:7,color:'#0e0d15'},
      {x:-300,y:118,z:-292,sx:18,sy:230,sz:18,color:'#71405e'},
      {x:-190,y:118,z:-292,sx:18,sy:230,sz:18,color:'#71405e'},
      {x:50,y:118,z:-292,sx:18,sy:230,sz:18,color:'#71405e'},
      {x:160,y:118,z:-292,sx:18,sy:230,sz:18,color:'#71405e'},
      {x:-405,y:74,z:-70,sx:26,sy:150,sz:470,color:'#1b1625'},
      {x:405,y:74,z:-70,sx:26,sy:150,sz:470,color:'#1b1625'}
    ],
    lamps:[
      {x:-330,z:-190},{x:330,z:-190},{x:-330,z:190},{x:330,z:190}
    ],
    lamp:{post:{y:78,sx:13,sy:110,sz:13,color:'#32203a'},light:{y:142,sx:34,sy:45,sz:34,color:'#ff6fc8',alpha:.82,lit:false}}
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
    clear:'#82c8ef',
    fogColor:'#b9dceb',
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
    base:{x:0,y:-28,z:0,sx:3100,sy:56,sz:1980,color:'#3f6338'},
    surface:{x:0,y:1,z:0,sx:2980,sy:5,sz:1860,color:'#6fa455'},
    grid:{stepX:240,stepZ:210,y:4,widthX:1.1,widthZ:1.1,height:.8,color:'#d5edba',alphaX:.045,alphaZ:.04},
    centerMark:{x:-1050,y:5,z:70,radius:150,segments:42,width:3,height:1.4,color:'#e9f3bc',alpha:.36,crossRadius:178,crossWidth:2,crossAlpha:.18}
  },
  scenery:{
    boxes:[
      {x:0,y:-41,z:0,sx:3280,sy:28,sz:2140,color:'#345630'},
      ...trainingRoadScenery(),
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
    yawDeg:37,fov:45,clear:'#8cccf1',fogColor:'#c5dfec',fogRange:[1100,3400],
    focusClampX:1710,focusClampZ:1030,baseDistance:1040,separationScale:.15,
    minDistance:1000,maxDistance:1240,heightBase:455,heightDistanceScale:.15,
    horizontalDistanceScale:.8,targetHeight:44,jumpTargetScale:.16,
    focusSmoothing:.08,zoomSmoothing:.06
  },
  floor:{
    base:{x:0,y:-30,z:0,sx:3820,sy:60,sz:2440,color:'#415f39'},
    surface:{x:0,y:1,z:0,sx:3700,sy:5,sz:2320,color:'#75a95b'},
    grid:{stepX:280,stepZ:240,y:4,widthX:1,widthZ:1,height:.8,color:'#e2f1c9',alphaX:.035,alphaZ:.03},
    centerMark:{x:-310,y:5,z:40,radius:180,segments:44,width:4,height:1.5,color:'#f4d25b',alpha:.48,crossRadius:215,crossWidth:2,crossAlpha:.22}
  },
  scenery:{
    boxes:[
      {x:0,y:-43,z:0,sx:4050,sy:30,sz:2700,color:'#34522f'},
      // Main road and plaza.
      {x:-640,y:6,z:40,sx:2200,sy:8,sz:210,color:'#c8aa76'},
      {x:-310,y:6,z:40,sx:980,sy:9,sz:760,color:'#d7bb85'},
      {x:520,y:6,z:40,sx:800,sy:8,sz:230,color:'#c8aa76'},
      {x:1060,y:6,z:40,sx:460,sy:8,sz:260,color:'#c8aa76'},
      // Stadium and fighter gate at the east landmark.
      {x:1490,y:205,z:40,sx:470,sy:410,sz:1420,color:'#2c1c38'},
      {x:1410,y:430,z:40,sx:520,sy:42,sz:1530,color:'#d54682'},
      {x:1350,y:490,z:40,sx:575,sy:32,sz:1640,color:'#f1c85a'},
      {x:1250,y:104,z:40,sx:90,sy:208,sz:480,color:'#1a1023'},
      {x:1200,y:235,z:-300,sx:38,sy:450,sz:38,color:'#5c3267'},
      {x:1200,y:235,z:380,sx:38,sy:450,sz:38,color:'#5c3267'},
      // Registration district north of plaza.
      {x:-120,y:58,z:-560,sx:430,sy:116,sz:250,color:'#3f78b2'},
      {x:-120,y:130,z:-560,sx:490,sy:28,sz:310,color:'#263e5a'},
      {x:-520,y:48,z:-610,sx:260,sy:96,sz:210,color:'#b45c42'},
      {x:-520,y:108,z:-610,sx:300,sy:24,sz:250,color:'#5a2d2b'},
      // Food street and rest area south of plaza.
      {x:-680,y:52,z:620,sx:330,sy:104,sz:230,color:'#c45e3f'},
      {x:-680,y:116,z:620,sx:380,sy:24,sz:275,color:'#602e29'},
      {x:-300,y:48,z:650,sx:280,sy:96,sz:210,color:'#5d4aa8'},
      {x:-300,y:108,z:650,sx:330,sy:24,sz:250,color:'#30264e'},
      // Practice ring west/south-west.
      {x:-1120,y:7,z:560,sx:540,sy:12,sz:430,color:'#d8ca9e'},
      {x:-1120,y:10,z:560,sx:440,sy:8,sz:330,color:'#efe4bd'},
      {x:-1385,y:42,z:560,sx:18,sy:84,sz:460,color:'#5e3b2f'},
      {x:-855,y:42,z:560,sx:18,sy:84,sz:460,color:'#5e3b2f'},
      {x:-1120,y:42,z:330,sx:540,sy:84,sz:18,color:'#5e3b2f'},
      {x:-1120,y:42,z:790,sx:540,sy:84,sz:18,color:'#5e3b2f'},
      // Waiting tent and bracket board.
      {x:640,y:66,z:-520,sx:420,sy:132,sz:300,color:'#9e3457'},
      {x:640,y:146,z:-520,sx:490,sy:28,sz:360,color:'#f0c85d'},
      {x:930,y:94,z:-540,sx:38,sy:188,sz:260,color:'#2e2338'},
      // Trees and carts create readable districts without invisible walls.
      {x:-1540,y:58,z:-760,sx:28,sy:116,sz:28,color:'#5d3d29'},
      {x:-1540,y:145,z:-760,sx:130,sy:120,sz:130,color:'#397442'},
      {x:-1540,y:58,z:820,sx:28,sy:116,sz:28,color:'#5d3d29'},
      {x:-1540,y:145,z:820,sx:130,sy:120,sz:130,color:'#397442'},
      {x:-980,y:26,z:-650,sx:110,sy:52,sz:78,color:'#887258'},
      {x:260,y:24,z:670,sx:96,sy:48,sz:72,color:'#806c54'},
      {x:830,y:28,z:670,sx:118,sy:56,sz:82,color:'#90795a'}
    ],
    lamps:[
      {x:-900,z:-120},{x:-420,z:-120},{x:80,z:-120},{x:560,z:-120},
      {x:-900,z:220},{x:-420,z:220},{x:80,z:220},{x:560,z:220}
    ],
    lamp:{post:{y:70,sx:12,sy:140,sz:12,color:'#463224'},light:{y:150,sx:36,sy:36,sz:36,color:'#fff0a3',alpha:.9,lit:false}}
  }
};

export const ARENA_STAGE_CATALOG=deepFreeze([
  {id:'dojo',name:'Tangai Dojo',status:'Playable',available:true,role:'Medium closed arena'},
  {id:'tournament',name:'Global Tournament',status:'Playable',available:true,role:'Large long-range arena • 1500 × 900'},
  {id:'asrylyte',name:'Asrylyte Zone',status:'Next effects checkpoint',available:false,role:'Small effects-heavy arena'}
]);

export const ARENA_STAGES=deepFreeze({dojo:TANGAI_DOJO,tournament:GLOBAL_TOURNAMENT,'training-field':TRAINING_FIELD,'training-road':TRAINING_ROAD,'expanded-training-region':EXPANDED_TRAINING_REGION,'tournament-hub':LOCAL_TOURNAMENT_HUB});

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
