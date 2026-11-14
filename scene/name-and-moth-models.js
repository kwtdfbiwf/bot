// One-time Spline authoring: a stamped name on Milo's back and a paper-like moth.
const stamp=generateTexture('Milo Back Name',(ctx,{size})=>{
 ctx.fillStyle='#d4cebf';ctx.fillRect(0,0,size,size);
 ctx.strokeStyle='#8e897d';ctx.lineWidth=size*.012;
 ctx.strokeRect(size*.04,size*.17,size*.92,size*.66);
 ctx.fillStyle='#3a4350';ctx.font='bold '+(size*.42)+'px monospace';
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MILO',size*.5,size*.51);
},512);
mesh('Decal',{width:83,height:31,depth:12});rename('Milo Back Name');
position({x:0,y:318,z:-79});rotation({y:180});
layer('texture',{image:stamp.id,projection:'uv'});
moveInto('Robot Head Pivot');

const moth=add('Empty');rename('Garden Moth');position({x:145,y:85,z:75});
mesh('Sphere',{width:5,height:15,depth:5,widthSegments:12,heightSegments:8});
rename('Moth Body');color('#635f54');shading({category:'toon',shininess:1});
position({x:145,y:85,z:75});moveInto(moth);
const outline=[[0,4],[7,15],[18,18],[24,9],[18,1],[21,-8],[12,-15],[0,-6]];
for(const side of [-1,1]){
 const v=[0,0,1.6],ix=[];
 for(const p of outline)v.push(p[0]*side,p[1],0);
 const back=v.length/3;v.push(0,0,-.8);
 for(let i=0;i<outline.length;i++){
  const a=i+1,b=(i+1)%outline.length+1;
  ix.push(0,a,b,back,b,a);
 }
 customMesh({vertices:v,indices:ix});rename(side<0?'Moth Wing Left':'Moth Wing Right');
 color(side<0?'#bcb9a4':'#d7d0b6');shading({category:'toon',shininess:1,flatShading:true});
 layer('outline',{outlineColor:'#625f51',outlineWidth:.4,contourWidth:0});
 position({x:145,y:85,z:75});moveInto(moth);
}
for(const side of [-1,1]){
 mesh('Cylinder',{width:.65,height:7,radialSegments:5,cornerRadius:0});
 rename('Moth Antenna '+side);color('#635f54');shading({category:'toon',shininess:1});
 position({x:145+side*2,y:95,z:75});rotation({z:-side*22});moveInto(moth);
}
hide(moth);
unselect();
