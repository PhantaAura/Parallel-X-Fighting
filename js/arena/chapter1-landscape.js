import {surface} from './surface-mesh.js?v=29a59-route';

// Chapter 1 uses a sculpted valley mesh; the central story lanes stay level.
const roadZ=x=>Math.sin((x-75)/470)*44;
const riverX=z=>75+Math.sin(z/290)*48*(1-Math.exp(-z*z/50000));
export function valleyHeight(x,z){
  const lane=Math.abs(z-roadZ(x));
  const river=Math.abs(x-riverX(z));
  const rise=Math.min(1,Math.max(0,(lane-160)/390));
  return (32+84*(.5+.5*Math.sin(x/430+z/630))+50*Math.sin(z/460)**2)*rise*rise*Math.min(1,Math.max(0,(river-105)/130));
}
const noise=n=>{const t=Math.sin(n*78.233)*43758.5453;return t-Math.floor(t)};

const terrain=surface(100,80,(u,v)=>{const x=-3500+u*7000,z=-2600+v*5200;return[x,valleyHeight(x,z),z]});
const road=surface(100,8,(u,v)=>{const x=-1480+u*3100,edge=86+Math.sin(x/103)*6+Math.sin(x/37)*3,z=roadZ(x)+(v-.5)*edge*2;return[x,3+Math.sin(v*Math.PI)*1.5,z]});
const creek=surface(10,90,(u,v)=>{const z=-2400+v*4800,x=riverX(z)+(u-.5)*(113+Math.sin(z/120)*10);return[x,5,z]});
const banks=[-1,1].map(side=>surface(5,90,(u,v)=>{const z=-2400+v*4800,offset=side*(57+u*45),x=riverX(z)+offset;return[x,6+Math.sin(u*Math.PI)*9,z]}));
function material(r,kind){
  r.valleyMaterials??={};if(r.valleyMaterials[kind])return r.valleyMaterials[kind];
  const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d');
  ctx.fillStyle=kind==='grass'?'#759655':kind==='road'?'#b99a6a':'#737c58';ctx.fillRect(0,0,512,512);
  for(let i=0;i<15000;i++){
    const x=noise(i+11)*512,y=noise(i+29)*512;
    ctx.fillStyle=kind==='grass'?(i%2?'rgba(29,65,33,.12)':'rgba(204,208,120,.16)'):(i%2?'rgba(67,54,35,.12)':'rgba(240,223,166,.17)');
    ctx.fillRect(x,y,1+noise(i+39)*5,1+noise(i+77)*3);
  }
  for(let i=0;i<80;i++){ctx.fillStyle=kind==='grass'?'rgba(49,85,42,.055)':'rgba(92,71,45,.045)';ctx.beginPath();ctx.ellipse(noise(i+888)*512,noise(i+999)*512,12+noise(i)*40,8+noise(i+2)*20,0,0,7);ctx.fill()}
  return r.valleyMaterials[kind]=r.createTexture(c);
}
function tree(r,x,z,size,seed){
  const y=valleyHeight(x,z),green=['#385d39','#466c3b','#557940','#628548'];
  r.disc({x:x+14,y:y+1,z:z+12,rx:58*size,rz:36*size,color:'#203d29',alpha:.18});
  r.cylinder({x,y:y+52*size,z,rx:9*size,sy:104*size,color:'#705239'});
  for(const side of [-1,1])r.segment({x,y:y+65*size,z},{x:x+side*34*size,y:y+113*size,z:z+side*13*size},{width:8*size,height:8*size,color:'#705239'});
  for(let j=0;j<5;j++){const a=j*2.4+seed;r.sphere({x:x+Math.cos(a)*31*size,y:y+(124+Math.sin(a)*14)*size,z:z+Math.sin(a)*25*size,sx:(79+j%2*14)*size,sy:(65+j%3*10)*size,sz:74*size,color:green[(seed+j)%4]})}
}
export function drawChapterOneLandscape(r){
  r.landscapeMesh('valley-terrain-v1',terrain,{texture:material(r,'grass')});
  r.landscapeMesh('valley-road-v1',road,{texture:material(r,'road')});
  banks.forEach((bank,i)=>r.landscapeMesh('valley-bank-'+i,bank,{texture:material(r,'bank')}));
  r.landscapeMesh('valley-creek-v1',creek,{color:'#468f9d',lit:false});
  for(let i=0;i<45;i++){
    const x=-1780+noise(i+20)*3550,z=(i%2?-1:1)*(270+noise(i+40)*900);
    if(Math.abs(x-riverX(z))<150)continue;
    tree(r,x,z,.95+noise(i+80)*.85,i);
  }
  for(let x=-52;x<207;x+=18)r.box({x,y:30.1,z:0,sx:2,sy:1,sz:205,color:'#382c22',alpha:.55});
  // Soft reed clusters and broken stones follow the water, away from the bridge.
  for(let i=0;i<38;i++){
    const z=-1600+i*87;if(Math.abs(z)<150)continue;const x=riverX(z)+(i%2?-1:1)*86;
    r.sphere({x,y:12,z,sx:27+noise(i)*22,sy:20,sz:39,color:i%2?'#92917b':'#6d7969'});
    for(let j=0;j<3;j++)r.cone({x:x+12+j*5,y:23,z:z+j*7,rx:2,rz:3,sy:45+j*5,color:'#697e4d'});
    r.disc({x:riverX(z)+Math.sin(i)*23,y:5.3,z,rx:17+noise(i)*13,rz:1.4,color:'#c3ded1',alpha:.35});
  }
  // Original dojo on the west slope: deep eaves, timber frame and plaster walls.
  r.box({x:-1160,y:70,z:-285,sx:360,sy:140,sz:230,color:'#e3d6b4'});
  r.gableRoof({x:-1160,y:170,z:-285,sx:450,sy:110,sz:320,color:'#735247'});
  for(const x of [-1320,-1240,-1080,-1000])r.cylinder({x,y:70,z:-163,rx:7,sy:140,color:'#68513b'});
  r.box({x:-1160,y:48,z:-166,sx:67,sy:96,sz:7,color:'#3f483a'});
  for(const x of [-1260,-1060]){r.box({x,y:82,z:-167,sx:58,sy:52,sz:5,color:'#8eaa99'});r.box({x,y:82,z:-171,sx:4,sy:57,sz:8,color:'#68513b'})}
  // Nearby hillside stone clusters give the road a strong foreground silhouette.
  for(const [x,z,s] of [[430,290,1.3],[720,-290,1],[-350,350,.85],[1050,310,1.2]]){
    const y=valleyHeight(x,z);r.sphere({x,y:y+23*s,z,sx:100*s,sy:58*s,sz:73*s,color:'#8d927a'});r.sphere({x:x+34*s,y:y+13*s,z:z+28*s,sx:56*s,sy:35*s,sz:46*s,color:'#757f65'});
  }
}
