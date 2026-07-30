const DEG=Math.PI/180;

function compile(gl,type,source){
  const shader=gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const error=gl.getShaderInfoLog(shader)||'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(error);
  }
  return shader;
}

function program(gl,vertexSource,fragmentSource){
  const vertex=compile(gl,gl.VERTEX_SHADER,vertexSource);
  const fragment=compile(gl,gl.FRAGMENT_SHADER,fragmentSource);
  const result=gl.createProgram();
  gl.attachShader(result,vertex);
  gl.attachShader(result,fragment);
  gl.linkProgram(result);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if(!gl.getProgramParameter(result,gl.LINK_STATUS)){
    const error=gl.getProgramInfoLog(result)||'Unknown shader link error';
    gl.deleteProgram(result);
    throw new Error(error);
  }
  return result;
}

function identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}

function perspective(fov,aspect,near,far){
  const f=1/Math.tan(fov/2),nf=1/(near-far);
  return new Float32Array([
    f/aspect,0,0,0,
    0,f,0,0,
    0,0,(far+near)*nf,-1,
    0,0,2*far*near*nf,0
  ]);
}

function normalize3(x,y,z){
  const length=Math.hypot(x,y,z)||1;
  return[x/length,y/length,z/length];
}

function cross(ax,ay,az,bx,by,bz){return[ay*bz-az*by,az*bx-ax*bz,ax*by-ay*bx]}

function lookAt(eye,target,up=[0,1,0]){
  const z=normalize3(eye[0]-target[0],eye[1]-target[1],eye[2]-target[2]);
  const x=normalize3(...cross(up[0],up[1],up[2],z[0],z[1],z[2]));
  const y=cross(z[0],z[1],z[2],x[0],x[1],x[2]);
  return new Float32Array([
    x[0],y[0],z[0],0,
    x[1],y[1],z[1],0,
    x[2],y[2],z[2],0,
    -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
    -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
    -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]),1
  ]);
}

function multiply(a,b){
  const out=new Float32Array(16);
  for(let column=0;column<4;column++){
    for(let row=0;row<4;row++){
      out[column*4+row]=
        a[0*4+row]*b[column*4+0]+
        a[1*4+row]*b[column*4+1]+
        a[2*4+row]*b[column*4+2]+
        a[3*4+row]*b[column*4+3];
    }
  }
  return out;
}

function modelMatrix({x=0,y=0,z=0,sx=1,sy=1,sz=1,rotationY=0}={}){
  const c=Math.cos(rotationY),s=Math.sin(rotationY);
  return new Float32Array([
    c*sx,0,-s*sx,0,
    0,sy,0,0,
    s*sz,0,c*sz,0,
    x,y,z,1
  ]);
}

function parseColor(input,alpha=1){
  if(Array.isArray(input))return new Float32Array([input[0],input[1],input[2],input[3]??alpha]);
  const text=String(input||'#ffffff').trim();
  if(text.startsWith('#')){
    let hex=text.slice(1);
    if(hex.length===3)hex=hex.split('').map(value=>value+value).join('');
    const value=Number.parseInt(hex.slice(0,6),16);
    const embedded=hex.length>=8?Number.parseInt(hex.slice(6,8),16)/255:alpha;
    return new Float32Array([((value>>16)&255)/255,((value>>8)&255)/255,(value&255)/255,embedded]);
  }
  return new Float32Array([1,1,1,alpha]);
}

function createMesh(gl,positions,uvs,normals,indices,mode=gl.TRIANGLES){
  const position=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,position);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
  const uv=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,uv);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(uvs),gl.STATIC_DRAW);
  const normal=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,normal);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);
  const index=gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  return{position,uv,normal,index,count:indices.length,mode};
}

function cubeMesh(gl){
  const p=[
    // front
    -.5,-.5,.5, .5,-.5,.5, .5,.5,.5, -.5,.5,.5,
    // back
    .5,-.5,-.5, -.5,-.5,-.5, -.5,.5,-.5, .5,.5,-.5,
    // top
    -.5,.5,.5, .5,.5,.5, .5,.5,-.5, -.5,.5,-.5,
    // bottom
    -.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5, -.5,-.5,.5,
    // right
    .5,-.5,.5, .5,-.5,-.5, .5,.5,-.5, .5,.5,.5,
    // left
    -.5,-.5,-.5, -.5,-.5,.5, -.5,.5,.5, -.5,.5,-.5
  ];
  const uv=[];for(let face=0;face<6;face++)uv.push(0,0,1,0,1,1,0,1);
  const n=[
    0,0,1,0,0,1,0,0,1,0,0,1,
    0,0,-1,0,0,-1,0,0,-1,0,0,-1,
    0,1,0,0,1,0,0,1,0,0,1,0,
    0,-1,0,0,-1,0,0,-1,0,0,-1,0,
    1,0,0,1,0,0,1,0,0,1,0,0,
    -1,0,0,-1,0,0,-1,0,0,-1,0,0
  ];
  const i=[];for(let face=0;face<6;face++){const o=face*4;i.push(o,o+1,o+2,o,o+2,o+3)}
  return createMesh(gl,p,uv,n,i);
}

function quadMesh(gl){
  return createMesh(gl,
    [-.5,0,0,.5,0,0,.5,1,0,-.5,1,0],
    [0,0,1,0,1,1,0,1],
    [0,0,1,0,0,1,0,0,1,0,0,1],
    [0,1,2,0,2,3]
  );
}

function discMesh(gl,segments=40){
  const p=[0,0,0],uv=[.5,.5],n=[0,1,0],indices=[];
  for(let index=0;index<=segments;index++){
    const angle=index/segments*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
    p.push(c,0,s);uv.push(c*.5+.5,s*.5+.5);n.push(0,1,0);
  }
  for(let index=1;index<=segments;index++)indices.push(0,index,index+1);
  return createMesh(gl,p,uv,n,indices);
}


function cylinderMesh(gl,segments=18){
  const p=[],uv=[],n=[],indices=[];
  for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,c=Math.cos(a),z=Math.sin(a);
    p.push(c,-.5,z,c,.5,z);uv.push(i/segments,0,i/segments,1);n.push(c,0,z,c,0,z);
  }
  for(let i=0;i<segments;i++){const o=i*2;indices.push(o,o+1,o+3,o,o+3,o+2)}
  const bottom=p.length/3;p.push(0,-.5,0);uv.push(.5,.5);n.push(0,-1,0);
  const top=p.length/3;p.push(0,.5,0);uv.push(.5,.5);n.push(0,1,0);
  for(let i=0;i<segments;i++){
    const a=i*2,b=((i+1)%segments)*2;
    indices.push(bottom,b,a);
    indices.push(top,a+1,b+1);
  }
  return createMesh(gl,p,uv,n,indices);
}

function coneMesh(gl,segments=18){
  const p=[],uv=[],n=[],indices=[];
  const slope=.62;
  for(let i=0;i<=segments;i++){
    const a=i/segments*Math.PI*2,c=Math.cos(a),z=Math.sin(a);
    p.push(c,-.5,z,0,.5,0);uv.push(i/segments,0,i/segments,1);
    const normal=normalize3(c,slope,z);n.push(...normal,...normal);
  }
  for(let i=0;i<segments;i++){const o=i*2;indices.push(o,o+1,o+3,o,o+3,o+2)}
  const center=p.length/3;p.push(0,-.5,0);uv.push(.5,.5);n.push(0,-1,0);
  for(let i=0;i<segments;i++)indices.push(center,(i+1)*2,i*2);
  return createMesh(gl,p,uv,n,indices);
}

function gableRoofMesh(gl){
  // Triangular prism: a true sloped roof without changing collision geometry.
  const p=[
    -.5,-.5,.5, .5,-.5,.5, 0,.5,.5,
    .5,-.5,-.5, -.5,-.5,-.5, 0,.5,-.5,
    -.5,-.5,-.5, -.5,-.5,.5, 0,.5,.5, 0,.5,-.5,
    .5,-.5,.5, .5,-.5,-.5, 0,.5,-.5, 0,.5,.5,
    -.5,-.5,-.5, .5,-.5,-.5, .5,-.5,.5, -.5,-.5,.5
  ];
  const uv=[0,0,1,0,.5,1, 0,0,1,0,.5,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1];
  const left=normalize3(-1,1,0),right=normalize3(1,1,0);
  const n=[
    0,0,1,0,0,1,0,0,1, 0,0,-1,0,0,-1,0,0,-1,
    ...left,...left,...left,...left, ...right,...right,...right,...right,
    0,-1,0,0,-1,0,0,-1,0,0,-1,0
  ];
  const indices=[0,1,2,3,4,5, 6,7,8,6,8,9, 10,11,12,10,12,13, 14,15,16,14,16,17];
  return createMesh(gl,p,uv,n,indices);
}

export class WebGLArenaRenderer{
  constructor(canvas){
    this.canvas=canvas;
    const gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false});
    if(!gl)throw new Error('WebGL is not available in this browser.');
    this.gl=gl;
    this.program=program(gl,`
attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec3 aNormal;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform vec4 uUvRect;
uniform float uFlipX;
uniform float uLit;
varying vec2 vUv;
varying float vLight;
varying float vDepth;
void main(){
  vec2 uv=aTexCoord;
  if(uFlipX>.5)uv.x=1.0-uv.x;
  vUv=mix(uUvRect.xy,uUvRect.zw,uv);
  vec4 world=uModel*vec4(aPosition,1.0);
  vec4 view=uView*world;
  gl_Position=uProjection*view;
  vec3 normal=normalize(mat3(uModel)*aNormal);
  vec3 lightDir=normalize(vec3(-.35,.82,.42));
  vLight=mix(1.0,.48+.52*max(dot(normal,lightDir),0.0),uLit);
  vDepth=-view.z;
}`,
`
precision mediump float;
uniform vec4 uColor;
uniform sampler2D uTexture;
uniform float uUseTexture;
uniform vec3 uFogColor;
uniform vec2 uFogRange;
varying vec2 vUv;
varying float vLight;
varying float vDepth;
void main(){
  vec4 base=uColor;
  if(uUseTexture>.5)base*=texture2D(uTexture,vUv);
  if(base.a<.035)discard;
  base.rgb*=vLight;
  float fog=clamp((vDepth-uFogRange.x)/(uFogRange.y-uFogRange.x),0.0,1.0);
  base.rgb=mix(base.rgb,uFogColor,fog*.58);
  gl_FragColor=base;
}`);
    this.locations={
      position:gl.getAttribLocation(this.program,'aPosition'),
      uv:gl.getAttribLocation(this.program,'aTexCoord'),
      normal:gl.getAttribLocation(this.program,'aNormal'),
      projection:gl.getUniformLocation(this.program,'uProjection'),
      view:gl.getUniformLocation(this.program,'uView'),
      model:gl.getUniformLocation(this.program,'uModel'),
      uvRect:gl.getUniformLocation(this.program,'uUvRect'),
      flipX:gl.getUniformLocation(this.program,'uFlipX'),
      lit:gl.getUniformLocation(this.program,'uLit'),
      color:gl.getUniformLocation(this.program,'uColor'),
      texture:gl.getUniformLocation(this.program,'uTexture'),
      useTexture:gl.getUniformLocation(this.program,'uUseTexture'),
      fogColor:gl.getUniformLocation(this.program,'uFogColor'),
      fogRange:gl.getUniformLocation(this.program,'uFogRange')
    };
    this.meshes={cube:cubeMesh(gl),quad:quadMesh(gl),disc:discMesh(gl),cylinder:cylinderMesh(gl),cone:coneMesh(gl),gable:gableRoofMesh(gl)};
    this.whiteTexture=this.makeWhiteTexture();
    this.eye=[520,390,650];
    this.target=[0,35,0];
    this.projection=identity();
    this.view=identity();
    this.viewProjection=identity();
    this.colorCache=new Map();
    gl.useProgram(this.program);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.uniform1i(this.locations.texture,0);
  }

  makeWhiteTexture(){
    const gl=this.gl,texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    return texture;
  }

  createTexture(image){
    const gl=this.gl,texture=gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    return texture;
  }

  begin({eye=this.eye,target=this.target,fov=42,clear='#101326',fogColor='#0e0f1c',fogRange=[560,1450]}={}){
    const gl=this.gl;
    this.eye=[...eye];this.target=[...target];
    this.projection=perspective(fov*DEG,this.canvas.width/this.canvas.height,1,3200);
    this.view=lookAt(this.eye,this.target);
    this.viewProjection=multiply(this.projection,this.view);
    const color=this.color(clear);
    gl.viewport(0,0,this.canvas.width,this.canvas.height);
    gl.clearColor(color[0],color[1],color[2],1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.locations.projection,false,this.projection);
    gl.uniformMatrix4fv(this.locations.view,false,this.view);
    const fog=this.color(fogColor);
    gl.uniform3f(this.locations.fogColor,fog[0],fog[1],fog[2]);
    gl.uniform2f(this.locations.fogRange,fogRange[0],fogRange[1]);
  }

  color(value,alpha=1){
    const key=`${value}|${alpha}`;
    if(!this.colorCache.has(key))this.colorCache.set(key,parseColor(value,alpha));
    return this.colorCache.get(key);
  }

  bind(mesh){
    const gl=this.gl,l=this.locations;
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.position);gl.enableVertexAttribArray(l.position);gl.vertexAttribPointer(l.position,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.uv);gl.enableVertexAttribArray(l.uv);gl.vertexAttribPointer(l.uv,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,mesh.normal);gl.enableVertexAttribArray(l.normal);gl.vertexAttribPointer(l.normal,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.index);
  }

  draw(mesh,model,{color='#ffffff',alpha=1,texture=null,uvRect=[0,0,1,1],flipX=false,lit=true,depthWrite=true,cull=true}={}){
    const gl=this.gl,l=this.locations;
    this.bind(mesh);
    gl.uniformMatrix4fv(l.model,false,model);
    gl.uniform4fv(l.color,this.color(color,alpha));
    gl.uniform4f(l.uvRect,uvRect[0],uvRect[1],uvRect[2],uvRect[3]);
    gl.uniform1f(l.flipX,flipX?1:0);
    gl.uniform1f(l.lit,lit?1:0);
    gl.uniform1f(l.useTexture,texture?1:0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture||this.whiteTexture);
    gl.depthMask(depthWrite);
    if(cull)gl.enable(gl.CULL_FACE);else gl.disable(gl.CULL_FACE);
    gl.drawElements(mesh.mode,mesh.count,gl.UNSIGNED_SHORT,0);
    gl.depthMask(true);
  }

  box(options={}){
    const{x=0,y=0,z=0,sx=1,sy=1,sz=1,rotationY=0}=options;
    this.draw(this.meshes.cube,modelMatrix({x,y,z,sx,sy,sz,rotationY}),options);
  }

  disc(options={}){
    const{x=0,y=.3,z=0,rx=1,rz=1}=options;
    this.draw(this.meshes.disc,modelMatrix({x,y,z,sx:rx,sy:1,sz:rz}),{...options,lit:false,cull:false,depthWrite:false});
  }


  cylinder(options={}){
    const{x=0,y=0,z=0,rx=1,rz=rx,sy=1,rotationY=0}=options;
    this.draw(this.meshes.cylinder,modelMatrix({x,y,z,sx:rx,sy,sz:rz,rotationY}),options);
  }

  cone(options={}){
    const{x=0,y=0,z=0,rx=1,rz=rx,sy=1,rotationY=0}=options;
    this.draw(this.meshes.cone,modelMatrix({x,y,z,sx:rx,sy,sz:rz,rotationY}),options);
  }

  gableRoof(options={}){
    const{x=0,y=0,z=0,sx=1,sy=1,sz=1,rotationY=0}=options;
    this.draw(this.meshes.gable,modelMatrix({x,y,z,sx,sy,sz,rotationY}),options);
  }

  segment(a,b,{width=4,height=4,color='#ffffff',alpha=1,y=null,lit=true}={}){
    const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz)||.001;
    const rotationY=Math.atan2(dx,dz);
    const centerY=y??((a.y??0)+(b.y??0))/2;
    this.box({x:(a.x+b.x)/2,y:centerY,z:(a.z+b.z)/2,sx:width,sy:height,sz:length,rotationY,color,alpha,lit});
  }

  sprite({x=0,y=0,z=0,width=110,height=170,texture,source,atlasWidth,atlasHeight,flipX=false,color='#ffffff',alpha=1}={}){
    if(!texture||!source||!atlasWidth||!atlasHeight)return false;
    const rotationY=Math.atan2(this.eye[0]-x,this.eye[2]-z);
    const [sx,sy,sw,sh]=source;
    const uvRect=[sx/atlasWidth,1-(sy+sh)/atlasHeight,(sx+sw)/atlasWidth,1-sy/atlasHeight];
    this.draw(this.meshes.quad,modelMatrix({x,y,z,sx:width,sy:height,sz:1,rotationY}),{
      color,alpha,texture,uvRect,flipX,lit:false,cull:false,depthWrite:true
    });
    return true;
  }

  billboard({x=0,y=0,z=0,size=8,color='#ffffff',alpha=1}={}){
    const rotationY=Math.atan2(this.eye[0]-x,this.eye[2]-z);
    this.draw(this.meshes.quad,modelMatrix({x,y,z,sx:size,sy:size,sz:1,rotationY}),{color,alpha,lit:false,cull:false,depthWrite:false});
  }

  project(x,y,z){
    const m=this.viewProjection;
    const cx=m[0]*x+m[4]*y+m[8]*z+m[12];
    const cy=m[1]*x+m[5]*y+m[9]*z+m[13];
    const cw=m[3]*x+m[7]*y+m[11]*z+m[15]||1;
    const nx=cx/cw,ny=cy/cw;
    return{x:(nx*.5+.5)*this.canvas.width,y:(1-(ny*.5+.5))*this.canvas.height,visible:cw>0};
  }
}
