// One-time Spline authoring. Four separable, keyed parts of a small enamel fan.
// Roots stay independent so the story can hide, carry, rotate, and fit each part.
const stand=add('Empty');rename('Fan Stand');position({x:0,y:0,z:0});
mesh('Cube',{width:66,height:8,depth:43,cornerRadius:6});rename('Fan Weighted Base');
color('#718c88');shading({category:'toon',shininess:7});layer('outline',{outlineColor:'#344744',outlineWidth:.45,contourWidth:0});
createMaterial('Fan Sage Enamel');position({x:0,y:4,z:0});moveInto(stand);
mesh('Cube',{width:12,height:57,depth:12,cornerRadius:3});rename('Fan Upright');applyMaterial('Fan Sage Enamel');position({x:0,y:35,z:-4});moveInto(stand);
mesh('Cube',{width:23,height:12,depth:17,cornerRadius:3});rename('Fan Motor Socket');applyMaterial('Graphite');position({x:0,y:66,z:0});moveInto(stand);
mesh('Cube',{width:11,height:4,depth:9,cornerRadius:1.5});rename('Fan Power Switch');applyMaterial('Peach Enamel');position({x:17,y:10,z:10});moveInto(stand);
hide(stand);
const motor=add('Empty');rename('Fan Motor');position({x:0,y:0,z:0});
mesh('Cylinder',{width:46,height:29,radialSegments:24,cornerRadius:3});rename('Fan Motor Housing');applyMaterial('Fan Sage Enamel');rotation({x:90});position({x:0,y:0,z:0});moveInto(motor);
mesh('Cylinder',{width:38,height:3,radialSegments:24,cornerRadius:1});rename('Fan Motor Back');applyMaterial('Warm Porcelain');rotation({x:90});position({x:0,y:0,z:-16});moveInto(motor);
for(let i=0;i<5;i++){
 mesh('Cube',{width:2,height:14-Math.abs(i-2)*2,depth:1,cornerRadius:.6});rename('Fan Vent '+i);applyMaterial('Graphite');position({x:(i-2)*5,y:0,z:-18});moveInto(motor);
}
mesh('Cylinder',{width:7,height:18,radialSegments:10,cornerRadius:.5});rename('Fan Keyed Axle');applyMaterial('Graphite');rotation({x:90});position({x:0,y:0,z:18});moveInto(motor);
mesh('Cube',{width:4,height:7,depth:4,cornerRadius:.5});rename('Fan Axle Key');applyMaterial('Peach Enamel');position({x:0,y:5,z:21});moveInto(motor);
hide(motor);
const blades=add('Empty');rename('Fan Blades');position({x:0,y:0,z:0});
const bv=[-3,4,0,-8,12,0,-13,24,0,-9,30,0,1,31,0,9,25,0,10,18,0,4,9,0,0,15,2,0,15,-1],bi=[];
for(let i=0;i<8;i++)bi.push(8,i,(i+1)%8,9,(i+1)%8,i);
for(let i=0;i<3;i++){
 customMesh({vertices:bv,indices:bi});rename('Fan Blade '+i);
 if(i===0){color('#9aaeb5');shading({category:'toon',shininess:8,side:'double'});layer('outline',{outlineColor:'#43535e',outlineWidth:.3,contourWidth:0});createMaterial('Fan Blue Blades');}else applyMaterial('Fan Blue Blades');
 rotation({z:i*120});position({x:0,y:0,z:0});moveInto(blades);
}
mesh('Cylinder',{width:14,height:7,radialSegments:16,cornerRadius:1.5});rename('Fan Blade Hub');applyMaterial('Warm Porcelain');rotation({x:90});position({x:0,y:0,z:2});moveInto(blades);
mesh('Cube',{width:3,height:5,depth:1,cornerRadius:.4});rename('Fan Blade Key');applyMaterial('Peach Enamel');position({x:0,y:4,z:6});moveInto(blades);
hide(blades);
const grille=add('Empty');rename('Fan Grille');position({x:0,y:0,z:0});
const guard=add('Empty');rename('Fan Grille Face');position({x:0,y:0,z:0});moveInto(grille);
for(let ring=0;ring<3;ring++){
 const v=[],ix=[],n=48,m=6,r=[12,23,35][ring],tube=ring===2?1.8:.8;
 for(let i=0;i<=n;i++)for(let j=0;j<m;j++){
   const a=i/n*Math.PI*2,b=j/m*Math.PI*2;v.push(Math.cos(a)*(r+Math.cos(b)*tube),Math.sin(a)*(r+Math.cos(b)*tube),Math.sin(b)*tube);
 }
 for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*m+j,b=i*m+(j+1)%m;ix.push(a,b,a+m,b,b+m,a+m);}
 customMesh({vertices:v,indices:ix});rename('Fan Guard Ring '+ring);
 if(ring===0){color('#c5c4b5');shading({category:'toon',shininess:10});createMaterial('Fan Guard Metal');}else applyMaterial('Fan Guard Metal');
 position({x:0,y:0,z:0});moveInto(guard);
}
for(let i=0;i<8;i++){
 mesh('Cube',{width:1.4,height:68,depth:1.4,cornerRadius:.5});rename('Fan Guard Rib '+i);applyMaterial('Fan Guard Metal');rotation({z:i*22.5});position({x:0,y:0,z:i*.12});moveInto(guard);
}
mesh('Cylinder',{width:11,height:3,radialSegments:16,cornerRadius:.5});rename('Fan Guard Badge');applyMaterial('Peach Enamel');rotation({x:90});position({x:0,y:0,z:2});moveInto(guard);
mesh('Cube',{width:7,height:5,depth:5,cornerRadius:1});rename('Fan Grille Key');applyMaterial('Peach Enamel');position({x:0,y:35,z:0});moveInto(guard);
hide(grille);unselect();
