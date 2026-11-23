// Generate a static parametric surface within WebGL 1's 16-bit index limit.
export function surface(columns,rows,point){
  if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<1||rows<1||
      (columns+1)*(rows+1)>65536){
    throw new RangeError('Surface dimensions must be positive integers with at most 65,536 vertices.');
  }
  const positions=[],normals=[],uvs=[],indices=[];
  for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
    const u=column/columns,v=row/rows,p=point(u,v);
    if(!p||p.length!==3||!p.every(Number.isFinite))throw new TypeError('Surface points must have three finite coordinates.');
    // At the final row/column, use a backward difference rather than a zero tangent.
    const du=u===1?-.001:.001,dv=v===1?-.001:.001;
    const a=point(u+du,v),b=point(u,v+dv);
    const ax=(a[0]-p[0])/du,ay=(a[1]-p[1])/du,az=(a[2]-p[2])/du;
    const bx=(b[0]-p[0])/dv,by=(b[1]-p[1])/dv,bz=(b[2]-p[2])/dv;
    let normal=[az*by-ay*bz,ax*bz-az*bx,ay*bx-ax*by];
    const length=Math.hypot(...normal);
    // Polar surfaces collapse at their center/tip; keep the shader normal defined.
    if(length<1e-10)normal=[0,1,0];
    else normal=normal.map(value=>value/length);
    if(normal[1]<0)normal=normal.map(value=>-value);
    positions.push(...p);uvs.push(u,v);normals.push(...normal);
    if(column<columns&&row<rows){
      const index=row*(columns+1)+column;
      indices.push(index,index+columns+1,index+1,index+1,index+columns+1,index+columns+2);
    }
  }
  return{positions,normals,uvs,indices};
}
