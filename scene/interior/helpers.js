// Prefix each native Spline interior authoring batch with these helpers.
let interiorParent='Interior Home';
function ibox(n,x,y,z,w,h,d,m,r={}){
 const o=mesh('Cube',{width:w,height:h,depth:d,cornerRadius:Math.min(5,h*.2,w*.12,d*.12),cornerSegments:5});
 rename(n);applyMaterial(m);position({x,y,z});rotation({x:r.x||0,y:r.y||0,z:r.z||0});moveInto(interiorParent);return o;
}
function iball(n,x,y,z,w,h,d,m){
 const o=mesh('Sphere',{width:w,height:h,depth:d,widthSegments:20,heightSegments:14});rename(n);applyMaterial(m);position({x,y,z});moveInto(interiorParent);return o;
}
function icyl(n,x,y,z,w,h,m,params={}){
 const o=mesh('Cylinder',{width:w,height:h,radialSegments:24,cornerRadius:Math.min(3,h*.15),...params});rename(n);applyMaterial(m);position({x,y,z});moveInto(interiorParent);return o;
}
function itube(n,points,r,m){
 const v=[],idx=[],sides=7;
 for(let i=0;i<points.length;i++){
  const p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||1;
  const t=[dx/len,dy/len,dz/len],ref=Math.abs(t[1])>.9?[1,0,0]:[0,1,0];
  let u=[t[1]*ref[2]-t[2]*ref[1],t[2]*ref[0]-t[0]*ref[2],t[0]*ref[1]-t[1]*ref[0]],ul=Math.hypot(...u);u=u.map(a=>a/ul);
  const q=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
  for(let j=0;j<sides;j++){const c=Math.cos(j*Math.PI*2/sides)*r,s=Math.sin(j*Math.PI*2/sides)*r;v.push(p[0]+u[0]*c+q[0]*s,p[1]+u[1]*c+q[1]*s,p[2]+u[2]*c+q[2]*s);}
  if(i)for(let j=0;j<sides;j++){const a=(i-1)*sides+j,b=(i-1)*sides+(j+1)%sides,c=i*sides+j,d=i*sides+(j+1)%sides;idx.push(a,b,c,b,d,c);}
 }
 const o=customMesh({vertices:v,indices:idx});rename(n);applyMaterial(m);position({x:0,y:0,z:0});moveInto(interiorParent);return o;
}
