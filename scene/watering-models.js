// One-time Spline authoring. Small enamel can, six reusable drops, folded flower.
const can=add('Empty');rename('Watering Can');position({x:-135,y:20,z:95});
mesh('Cylinder',{width:31,height:31,radialSegments:20,cornerRadius:2});rename('Can Enamel Body');
color('#8faaa4');shading({category:'toon',shininess:8});layer('outline',{outlineColor:'#354541',outlineWidth:.5,contourWidth:0});
createMaterial('Watering Can Enamel');position({x:-125,y:20,z:95});moveInto(can);
mesh('Cylinder',{width:25,height:2,radialSegments:20,cornerRadius:0});rename('Can Dark Opening');
color('#344d49');shading({category:'toon',shininess:1});createMaterial('Can Dark Interior');position({x:-125,y:36.5,z:95});moveInto(can);
// Ring-shaped handle, formed as one swept tube in the can's upright frame.
const hv=[],hi=[],n=24,m=7;
for(let i=0;i<=n;i++){
 const a=i/n*Math.PI*2,x=-8+Math.cos(a)*13,y=Math.sin(a)*17;
 for(let j=0;j<m;j++){const b=j/m*Math.PI*2;hv.push(x+Math.cos(a)*Math.cos(b)*2.4,y+Math.sin(a)*Math.cos(b)*2.4,Math.sin(b)*2.4);}
}
for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*m+j,b=i*m+(j+1)%m;hi.push(a,a+m,b,b,a+m,b+m);}
customMesh({vertices:hv,indices:hi});rename('Can Loop Handle');applyMaterial('Peach Enamel');createMaterial('Watering Can Handle');
position({x:-135,y:20,z:95});moveInto(can);
// A tapered bent spout; open dark mouth is a separate recessed surface.
const sv=[],si=[],rings=8,sides=12;
for(let i=0;i<=rings;i++){
 const t=i/rings,x=21+27*t,y=1+16*t*t,r=5.3-2.3*t;
 for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;sv.push(x,y+Math.cos(a)*r,Math.sin(a)*r);}
}
for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides;si.push(a,b,a+sides,b,b+sides,a+sides);}
customMesh({vertices:sv,indices:si});rename('Can Curved Spout');
applyMaterial('Watering Can Enamel');
position({x:-135,y:20,z:95});moveInto(can);
mesh('Sphere',{width:2,height:5,depth:5,widthSegments:8,heightSegments:6});rename('Can Spout Opening');
applyMaterial('Can Dark Interior');position({x:-86.5,y:37,z:95});moveInto(can);
hide(can);
const drops=add('Empty');rename('Water Drops');position({x:0,y:0,z:0});
for(let i=0;i<6;i++){
 mesh('Sphere',{width:2.5,height:5,depth:2.5,widthSegments:8,heightSegments:6});rename('Water Drop '+i);
 if(i===0){color('#a6d9df');shading({category:'toon',shininess:12});createMaterial('Water Drops Enamel');}else applyMaterial('Water Drops Enamel');
 position({x:0,y:0,z:0});moveInto(drops);
}
hide(drops);
const flower=add('Empty');rename('Garden Flower');position({x:145,y:64,z:75});
for(let i=0;i<5;i++){
 const v=[0,0,0,-5,9,0,-4,16,0,0,20,0,5,15,0,6,8,0,0,10,2.2,0,10,-.8];
 const ix=[];for(let j=0;j<6;j++)ix.push(6,(j+1)%6,j,7,j,(j+1)%6);
 customMesh({vertices:v,indices:ix});rename('Flower Petal '+i);
 if(i===0){color('#e7d8ba');shading({category:'toon',shininess:1,side:'double',flatShading:true});layer('outline',{outlineColor:'#847960',outlineWidth:.25,contourWidth:0});createMaterial('Flower Paper Petals');}else applyMaterial('Flower Paper Petals');
 position({x:145,y:64,z:75});rotation({z:i*72});moveInto(flower);
}
mesh('Sphere',{width:7,height:7,depth:5,widthSegments:10,heightSegments:8});rename('Flower Peach Center');applyMaterial('Peach Enamel');
position({x:145,y:64,z:78});moveInto(flower);
hide(flower);unselect();
