export const ARENA_STAGE_SCHEMA_VERSION=1;

function deepFreeze(value){
  if(!value||typeof value!=='object'||Object.isFrozen(value))return value;
  Object.freeze(value);
  for(const child of Object.values(value))deepFreeze(child);
  return value;
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

export const ARENA_STAGE_CATALOG=deepFreeze([
  {id:'dojo',name:'Tangai Dojo',status:'Playable',available:true,role:'Medium closed arena'},
  {id:'tournament',name:'Global Tournament',status:'Playable',available:true,role:'Large long-range arena • 1500 × 900'},
  {id:'asrylyte',name:'Asrylyte Zone',status:'Next effects checkpoint',available:false,role:'Small effects-heavy arena'}
]);

export const ARENA_STAGES=deepFreeze({dojo:TANGAI_DOJO,tournament:GLOBAL_TOURNAMENT,'training-field':TRAINING_FIELD});

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
