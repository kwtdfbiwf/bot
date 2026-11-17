// Final Spline prop pass. Run after the original prop builders, once per scene.
// Edits the named meshes in place; animation pivots and interaction anchors stay intact.
const oval=(w,h,d,cx=0,cy=0,cz=0)=>{
 const vertices=[],indices=[],normals=[],n=40,m=24;
 for(let i=0;i<=m;i++)for(let j=0;j<=n;j++){
   const p=i/m*Math.PI,a=j/n*Math.PI*2,x=Math.sin(p)*Math.cos(a),y=Math.cos(p),z=Math.sin(p)*Math.sin(a);
   vertices.push(cx+x*w/2,cy+y*h/2,cz+z*d/2);
   const nx=x/w,ny=y/h,nz=z/d,len=Math.hypot(nx,ny,nz);normals.push(nx/len,ny/len,nz/len);
 }
 for(let i=0;i<m;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;indices.push(a,a+1,b,a+1,b+1,b);}
 return {vertices,indices,normals};
};
const tube=(rx,ry,thickness,cx=0,cy=0,horizontal=false)=>{
 const vertices=[],indices=[],n=64,m=12;
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){
   const a=i/n*Math.PI*2,b=j/m*Math.PI*2,x=cx+(rx+Math.cos(b)*thickness)*Math.cos(a),y=cy+(ry+Math.cos(b)*thickness)*Math.sin(a),z=Math.sin(b)*thickness;
   if(horizontal)vertices.push(x,z,y);else vertices.push(x,y,z);
 }
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,a+1,b,b+1);}
 if(horizontal)for(let i=0;i<indices.length;i+=3){const q=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=q;}
 return {vertices,indices};
};
const leaf=(length,rise,width,depth)=>{
 const vertices=[],indices=[],n=28,m=20,l=Math.hypot(length,rise),px=-rise/l,py=length/l;
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){
   const t=i/n,a=j/m*Math.PI*2,r=Math.pow(Math.sin(Math.PI*t),.72),curl=Math.sin(Math.PI*t)*2;
   vertices.push(length*t+px*width*r*Math.cos(a),rise*t+curl+py*width*r*Math.cos(a),depth*r*Math.sin(a));
 }
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,a+1,b,a+1,b+1,b);}
 return {vertices,indices};
};
// Make dedicated materials: Milo's shared porcelain and peach enamel are untouched.
select('Seed Shell');createMaterial('Clay Almond');removeLayer('outline');color('#c9a377');shading({category:'physical',roughness:.84,metalness:0,reflectivity:.12});
select('Can Enamel Body');createMaterial('Clay Sage');removeLayer('outline');color('#9cb3a2');shading({category:'physical',roughness:.72,metalness:0,reflectivity:.12});
select('Can Loop Handle');createMaterial('Clay Rose');removeLayer('outline');color('#d3a095');shading({category:'physical',roughness:.74,metalness:0,reflectivity:.12});
select('Blue Cap Enamel');createMaterial('Clay Denim');removeLayer('outline');color('#789bb5');shading({category:'physical',roughness:.76,metalness:0,reflectivity:.12});
select('Keepsake Box Base');createMaterial('Clay Biscuit');removeLayer('outline');color('#c29f7c');shading({category:'physical',roughness:.86,metalness:0,reflectivity:.08});
select('Flower Petal 0');createMaterial('Clay Petal');removeLayer('outline');color('#dca99b');shading({category:'physical',roughness:.76,metalness:0,reflectivity:.12});
select('Flower Peach Center');createMaterial('Clay Butter');removeLayer('outline');color('#e4ca92');shading({category:'physical',roughness:.8,metalness:0,reflectivity:.1});
select('Plant Leaf Left');createMaterial('Clay Leaf');removeLayer('outline');color('#9aaa79');shading({category:'physical',roughness:.83,metalness:0,reflectivity:.1});
select('Plant Soil');createMaterial('Clay Earth');color('#87684e');shading({category:'physical',roughness:.94,metalness:0,reflectivity:.05});

// A smooth, plump seed. Its long axis and existing rotation still match pickup.
const seed=oval(16,11,26);
for(let i=0;i<seed.vertices.length;i+=3){
 const z=seed.vertices[i+2]/13,taper=1+.1*z;
 seed.vertices[i]*=taper;seed.vertices[i+1]*=taper;
}
setGeometry('Seed Shell',{vertices:seed.vertices,indices:seed.indices});
select('Seed Shell');shading({flatShading:false});

// Squat pottery can, rolled lip, thick loop and soft bent spout. Nozzle stays (48,17,0).
select('Can Enamel Body');geometry({width:34,height:33,radialSegments:40,cornerRadius:8,cornerSegments:8});
select('Can Dark Opening');createMaterial('Clay Can Interior');geometry({width:20,height:1.6,radialSegments:40,cornerRadius:.7,cornerSegments:5});
position({x:10,y:16.8,z:0});color('#596c5b');shading({category:'physical',roughness:.9,metalness:0});
setGeometry('Can Loop Handle',tube(12,15.5,3.8,-9,0));
const spoutV=[],spoutI=[],rings=24,sides=24;
for(let i=0;i<=rings;i++)for(let j=0;j<=sides;j++){
 const t=i/rings,a=j/sides*Math.PI*2,x=22+26*t,y=17*Math.pow(t,1.5),r=6.2-2.5*t,dy=25.5*Math.sqrt(t),len=Math.hypot(26,dy);
 spoutV.push(x-dy/len*Math.cos(a)*r,y+26/len*Math.cos(a)*r,Math.sin(a)*r);
}
for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;spoutI.push(a,a+1,b,a+1,b+1,b);}
setGeometry('Can Curved Spout',{vertices:spoutV,indices:spoutI});select('Can Curved Spout');applyMaterial('Clay Sage');shading({flatShading:false});
select('Can Spout Opening');geometry({width:1.6,height:6,depth:6,widthSegments:24,heightSegments:16});position({x:48.5,y:17.4,z:0});rotation({z:44});applyMaterial('Clay Can Interior');
const rim=tube(11.8,11.8,1.8,0,0,true);
customMesh(rim);rename('Can Rolled Lip');applyMaterial('Clay Sage');position({x:-125,y:36,z:95});moveInto('Watering Can');

// A softly crimped cap, with a rounded crown rather than thin stamped facets.
const capV=[],capI=[],profile=[[0,3.5],[5,4],[9,3.6],[10.7,2.6],[11.5,1],[11.5,-1.5],[10.7,-2.8],[9,-2.2],[8.6,-.4],[0,.4]],segs=96;
for(let i=0;i<profile.length;i++)for(let j=0;j<=segs;j++){
 const a=j/segs*Math.PI*2,crimp=i>=3&&i<=6?Math.cos(a*20)*.28:0,r=profile[i][0]+crimp;
 capV.push(r*Math.cos(a),profile[i][1],r*Math.sin(a));
}
for(let i=0;i<profile.length-1;i++)for(let j=0;j<segs;j++){const a=i*(segs+1)+j,b=a+segs+1;capI.push(a,a+1,b,a+1,b+1,b);}
setGeometry('Blue Cap Enamel',{vertices:capV,indices:capI});select('Blue Cap Enamel');shading({flatShading:false});

// Chunky rounded storage-box walls, a low front lip and a soft peach tape patch.
for(const name of ['Keepsake Box Base','Keepsake Box Back','Keepsake Box Front','Keepsake Box Left','Keepsake Box Right']){
 select(name);applyMaterial('Clay Biscuit');geometry({cornerRadius:1.9,cornerSegments:8});
}
for(const name of ['Keepsake Box Back','Keepsake Box Front']){select(name);geometry({width:64,depth:6,cornerRadius:2.8,cornerSegments:8});}
for(const name of ['Keepsake Box Left','Keepsake Box Right']){select(name);geometry({width:6,depth:33,cornerRadius:2.8,cornerSegments:8});}
select('Keepsake Box Base');geometry({width:60,height:6,depth:42,cornerRadius:2.8,cornerSegments:8});position({x:0,y:3,z:0});
select('Box Folded Tape');geometry({width:16,height:10,depth:1.8,cornerRadius:.85,cornerSegments:6});position({x:0,y:12,z:22.8});applyMaterial('Clay Rose');createMaterial('Clay Tape');

// Fleshy leaves and a clay daisy, still using the existing growth/bloom pivots.
setGeometry('Plant Soil',oval(41,5,29,0,1,0));
const stemV=[],stemI=[],sn=32,sm=14;
for(let i=0;i<=sn;i++)for(let j=0;j<=sm;j++){
 const t=i/sn,a=j/sm*Math.PI*2,r=2.3-1.2*t;
 stemV.push(Math.sin(t*Math.PI*1.6)*2.8+Math.cos(a)*r,61*t,Math.sin(t*Math.PI)*1.5+Math.sin(a)*r);
}
for(let i=0;i<sn;i++)for(let j=0;j<sm;j++){const a=i*(sm+1)+j,b=a+sm+1;stemI.push(a,b,a+1,a+1,b,b+1);}
setGeometry('Plant Stem',{vertices:stemV,indices:stemI});select('Plant Stem');applyMaterial('Clay Leaf');shading({flatShading:false});
setGeometry('Plant Leaf Left',leaf(-29,14,8.8,3.6));select('Plant Leaf Left');shading({flatShading:false});
setGeometry('Plant Leaf Right',leaf(33,22,9.4,4));select('Plant Leaf Right');applyMaterial('Clay Leaf');createMaterial('Clay New Green');color('#b4be8c');shading({flatShading:false});
setGeometry('Plant New Leaf',leaf(-12,12,4.8,2.3));select('Plant New Leaf');applyMaterial('Clay New Green');shading({flatShading:false});
for(let i=0;i<5;i++){setGeometry('Flower Petal '+i,oval(12.5,22,6.4,0,9,0));select('Flower Petal '+i);applyMaterial('Clay Petal');shading({flatShading:false});}
select('Flower Peach Center');geometry({width:9,height:9,depth:6,widthSegments:32,heightSegments:20});

// Pillow-like moth wings replace the folded paper silhouette.
for(const side of [-1,1]){
 const a=oval(21,23,5,side*10,7,0),b=oval(17,18,4.5,side*8,-6,0),offset=a.vertices.length/3;
 const vertices=[...a.vertices,...b.vertices],indices=[...a.indices,...b.indices.map(i=>i+offset)],normals=[...a.normals,...b.normals];
 const name=side<0?'Moth Wing Left':'Moth Wing Right';setGeometry(name,{vertices,indices,normals});
 select(name);applyMaterial(side<0?'Clay Butter':'Clay Petal');shading({flatShading:false});
}
select('Moth Body');geometry({width:6,height:15,depth:6,widthSegments:24,heightSegments:18});applyMaterial('Clay Biscuit');createMaterial('Clay Moth Body');
for(const side of [-1,1]){select('Moth Antenna '+side);geometry({width:1.1,height:7,radialSegments:12,cornerRadius:.5,cornerSegments:4});applyMaterial('Clay Moth Body');}
unselect();
