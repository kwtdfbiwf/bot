// One-time Spline authoring: a crimped blue cap, open keepsake box, hinged hatch.
const cap=add('Empty');rename('Blue Bottle Cap');position({x:-235,y:5,z:100});
const v=[0,2,0],ix=[],n=40;
for(let ring=0;ring<3;ring++)for(let j=0;j<n;j++){
 const a=j/n*Math.PI*2,r=ring===0?9:ring===1?10.5+(j%2)*.8:10.5+(j%2)*.8,y=ring===2?-2:2;
 v.push(Math.cos(a)*r,y,Math.sin(a)*r);
}
for(let j=0;j<n;j++){
 const a=1+j,b=1+(j+1)%n;ix.push(0,b,a);
 for(let k=0;k<2;k++)ix.push(a+k*n,b+k*n,a+(k+1)*n,b+k*n,b+(k+1)*n,a+(k+1)*n);
}
customMesh({vertices:v,indices:ix});rename('Blue Cap Enamel');color('#426d9e');
shading({category:'toon',shininess:18,side:'double'});layer('outline',{outlineColor:'#263c56',outlineWidth:.35,contourWidth:0});
position({x:-235,y:5,z:100});moveInto(cap);hide(cap);
const box=add('Empty');rename('Keepsake Box');position({x:-230,y:0,z:70});
const pieces=[['Base',0,2,0,62,4,44],['Back',0,16,-20,62,28,4],['Front',0,8,20,62,12,4],['Left',-29,16,0,4,28,36],['Right',29,16,0,4,28,36]];
for(let i=0;i<pieces.length;i++){
 const p=pieces[i];mesh('Cube',{width:p[4],height:p[5],depth:p[6],cornerRadius:1});rename('Keepsake Box '+p[0]);
 if(i===0){color('#a99375');shading({category:'toon',shininess:1});layer('outline',{outlineColor:'#514b40',outlineWidth:.45,contourWidth:0});createMaterial('Keepsake Cardboard');}else applyMaterial('Keepsake Cardboard');
 position({x:-230+p[1],y:p[2],z:70+p[3]});moveInto(box);
}
mesh('Cube',{width:16,height:12,depth:1,cornerRadius:.4});rename('Box Folded Tape');
color('#c8bc9f');shading({category:'toon',shininess:1});position({x:-230,y:12,z:92.6});moveInto(box);hide(box);
const hatch=add('Empty');rename('Collection Hatch');position({x:0,y:145,z:37});moveInto('Robot Body Pivot');
mesh('Cube',{width:42,height:25,depth:3,cornerRadius:2});rename('Collection Hatch Interior');applyMaterial('Graphite');
position({x:0,y:132.5,z:37});moveInto(hatch);
const lid=add('Empty');rename('Collection Hatch Lid Pivot');position({x:0,y:145,z:40});moveInto(hatch);
mesh('Cube',{width:44,height:26,depth:3,cornerRadius:2});rename('Collection Hatch Lid');applyMaterial('Warm Porcelain');
position({x:0,y:132,z:40});moveInto(lid);
mesh('Cylinder',{width:5,height:36,radialSegments:12,cornerRadius:0});rename('Collection Hatch Hinge');applyMaterial('Graphite');
position({x:0,y:145,z:40});rotation({z:90});moveInto(hatch);
hide(hatch);unselect();
