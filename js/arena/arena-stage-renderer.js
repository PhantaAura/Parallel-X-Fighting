function drawPerimeterSegment(renderer,a,b,rail){renderer.segment(a,b,{width:rail.width,height:rail.height,color:rail.color,alpha:rail.alpha??1,lit:rail.lit??true})}

function rangedValues(min,max,step){
  const values=[];
  if(!(step>0))return values;
  for(let value=min;value<=max+.001;value+=step)values.push(value);
  return values;
}

export function drawArenaStage(renderer,stage){
  const {bounds:b,floor,boundary,scenery}=stage;
  renderer.box(floor.base);
  renderer.box(floor.surface);

  if(floor.grid){
    const grid=floor.grid;
    for(const x of rangedValues(b.minX,b.maxX,grid.stepX))renderer.box({x,y:grid.y,z:0,sx:grid.widthX,sy:grid.height,sz:b.maxZ-b.minZ,color:grid.color,alpha:grid.alphaX,lit:false});
    for(const z of rangedValues(b.minZ,b.maxZ,grid.stepZ))renderer.box({x:0,y:grid.y,z,sx:b.maxX-b.minX,sy:grid.height,sz:grid.widthZ,color:grid.color,alpha:grid.alphaZ,lit:false});
  }

  if(floor.centerMark){
    const mark=floor.centerMark;
    for(let index=0;index<mark.segments;index++){
      const a=index/mark.segments*Math.PI*2,c=(index+1)/mark.segments*Math.PI*2;
      renderer.segment({x:mark.x+Math.cos(a)*mark.radius,y:mark.y,z:mark.z+Math.sin(a)*mark.radius},{x:mark.x+Math.cos(c)*mark.radius,y:mark.y,z:mark.z+Math.sin(c)*mark.radius},{width:mark.width,height:mark.height,color:mark.color,alpha:mark.alpha,lit:false});
    }
    const cross=mark.crossRadius;
    renderer.segment({x:mark.x-cross,y:mark.y,z:mark.z},{x:mark.x+cross,y:mark.y,z:mark.z},{width:mark.crossWidth,height:mark.height,color:mark.color,alpha:mark.crossAlpha,lit:false});
    renderer.segment({x:mark.x,y:mark.y,z:mark.z-cross},{x:mark.x,y:mark.y,z:mark.z+cross},{width:mark.crossWidth,height:mark.height,color:mark.color,alpha:mark.crossAlpha,lit:false});
  }

  for(const box of scenery?.boxes||[])renderer.box(box);

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

  if(scenery?.lamp){
    for(const point of scenery.lamps||[]){renderer.box({...scenery.lamp.post,x:point.x,z:point.z});renderer.box({...scenery.lamp.light,x:point.x,z:point.z})}
  }
}
