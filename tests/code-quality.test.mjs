import test from 'node:test';
import assert from 'node:assert/strict';
import {surface} from '../js/arena/surface-mesh.js';
import {WebGLArenaRenderer} from '../js/arena/webgl-renderer.js';
import {importSaveText,createSaveExport} from '../js/save-manager.js';

function memoryStorage(initial={}){
  const values=new Map(Object.entries(initial));
  return{values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
}
const saveText=()=>JSON.stringify(createSaveExport(memoryStorage({pxSave:'{"coins":42}'})));

test('terrain normals stay normalized at all corners and edges',()=>{
  const mesh=surface(4,3,(u,v)=>[u*10,u*2+v*3,v*10]);
  assert.equal(mesh.positions.length,20*3);
  assert.equal(mesh.indices.length,4*3*6);
  for(let i=0;i<mesh.normals.length;i+=3){
    assert.ok(Math.abs(Math.hypot(...mesh.normals.slice(i,i+3))-1)<1e-10);
    assert.ok(mesh.normals[i+1]>0);
  }
  assert.ok(mesh.indices.every(index=>index>=0&&index<20));
});
test('collapsed polar tips retain a finite nonzero normal',()=>{
  const mesh=surface(12,8,(u,v)=>[Math.cos(u*Math.PI*2)*v,0,Math.sin(u*Math.PI*2)*v]);
  assert.ok(mesh.normals.every(Number.isFinite));
  assert.deepEqual(mesh.normals.slice(0,3),[0,1,0]);
});
test('invalid dimensions and oversized WebGL 1 meshes fail before allocation',()=>{
  for(const dims of [[0,2],[-1,3],[2.5,3],[256,256]])assert.throws(()=>surface(...dims,()=>[0,0,0]),RangeError);
  assert.throws(()=>surface(1,1,()=>[NaN,0,0]),TypeError);
});
test('renderer teardown releases every buffer and texture exactly once',()=>{
  const buffers=[],textures=[],programs=[];
  const mesh=id=>Object.fromEntries(['position','uv','normal','index'].map(key=>[key,id+key]));
  const renderer=Object.assign(Object.create(WebGLArenaRenderer.prototype),{
    gl:{deleteBuffer:value=>buffers.push(value),deleteTexture:value=>textures.push(value),deleteProgram:value=>programs.push(value)},
    disposed:false,meshes:{cube:mesh('cube')},landscapeMeshes:new Map([['terrain',mesh('terrain')]]),
    textures:new Set(['white','atlas','grass']),program:'shader',colorCache:new Map([['color',[]]]),
    worldMaterials:{stone:'stone'},valleyMaterials:{grass:'grass'},groundHeight:()=>10
  });
  renderer.dispose();renderer.dispose();
  assert.equal(new Set(buffers).size,8);assert.equal(buffers.length,8);
  assert.deepEqual(textures,['white','atlas','grass']);assert.deepEqual(programs,['shader']);
  assert.equal(renderer.landscapeMeshes.size,0);assert.equal(renderer.textures.size,0);
  assert.equal(renderer.createTexture({}),null);
  assert.equal(renderer.groundHeight,null);
});
test('save import refuses unavailable storage',()=>{
  for(const storage of [null,{}, {getItem:()=>null}])assert.equal(importSaveText(saveText(),storage).ok,false);
});
test('save import never clears a save it cannot first read',()=>{
  let writes=0;
  const storage={getItem:()=>{throw Error('Denied')},setItem:()=>writes++,removeItem:()=>writes++};
  assert.equal(importSaveText(saveText(),storage).ok,false);assert.equal(writes,0);
});
test('save import rolls back a partial quota failure',()=>{
  const storage=memoryStorage({pxSave:'{"coins":10}',pxLostYearProgressV1:'{"chapter":3}'});
  const original=new Map(storage.values),write=storage.setItem;let fail=true;
  storage.setItem=(key,value)=>{if(fail){fail=false;throw Error('Quota exceeded')}write(key,value)};
  assert.equal(importSaveText(saveText(),storage).ok,false);
  assert.deepEqual(storage.values,original);
});
test('valid import replaces exported save keys and preserves unrelated storage',()=>{
  const storage=memoryStorage({pxSave:'{}',pxLostYearProgressV1:'{}',unrelated:'keep'});
  assert.equal(importSaveText(saveText(),storage).ok,true);
  assert.equal(storage.getItem('pxSave'),'{"coins":42}');
  assert.equal(storage.getItem('pxLostYearProgressV1'),null);
  assert.equal(storage.getItem('unrelated'),'keep');
});
test('invalid save never changes storage',()=>{
  const storage=memoryStorage({pxSave:'{"coins":99}'}),before=new Map(storage.values);
  assert.equal(importSaveText('{broken',storage).ok,false);
  const bad=createSaveExport(storage);bad.data.notAllowed='{}';
  assert.equal(importSaveText(JSON.stringify(bad),storage).ok,false);
  assert.deepEqual(storage.values,before);
});

test('every game module parses, including dynamically opened debug tools',async()=>{
  const {readdir}=await import('node:fs/promises');
  const {execFileSync}=await import('node:child_process');
  const root=new URL('../js/',import.meta.url);
  const files=await readdir(root,{recursive:true});
  for(const file of files.filter(name=>name.endsWith('.js'))){
    execFileSync(process.execPath,['--check',new URL(file,root).pathname],{stdio:'pipe'});
  }
});
