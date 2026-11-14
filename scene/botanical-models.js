// Authored Spline meshes. Run once in the editor; HTML drives their visibility.
const plant = add('Empty');
rename('Chapter One Plant');
position({x:145,y:0,z:75});
const soilV=[0,1.8,0],soilI=[];
const edges=11;
for(let i=0;i<edges;i++){
 const a=i/edges*Math.PI*2,r=1+Math.sin(i*2.3)*.12;
 soilV.push(Math.cos(a)*19*r,.5+Math.sin(i*1.7)*.3,Math.sin(a)*13*r);
}
for(let i=0;i<edges;i++)soilI.push(0,1+(i+1)%edges,1+i);
customMesh({vertices:soilV,indices:soilI});rename('Plant Soil');
color('#41392e');shading({category:'toon',shininess:1});
moveInto(plant);position({x:0,y:0,z:0});

const sv=[],si=[],rings=15,sides=7;
for(let i=0;i<=rings;i++){
 const t=i/rings,x=Math.sin(t*Math.PI*1.6)*2.8,y=61*t,z=Math.sin(t*Math.PI)*1.5,r=1.65-t*.9;
 for(let j=0;j<sides;j++){const a=j/sides*Math.PI*2;sv.push(x+Math.cos(a)*r,y,z+Math.sin(a)*r);}
}
for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){
 const a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,d=b+sides;
 si.push(a,c,b,b,c,d);
}
customMesh({vertices:sv,indices:si});rename('Plant Stem');
color('#59644a');shading({category:'toon',shininess:1});
layer('outline',{outlineColor:'#303a2d',outlineWidth:.4,contourWidth:0});
createMaterial('Botanical Stem');moveInto(plant);position({x:0,y:0,z:0});

const leaves=[
 {name:'Plant Leaf Left',length:-29,rise:14,width:8.5,x:2.2,y:24,z:1.4,color:'#819078'},
 {name:'Plant Leaf Right',length:33,rise:22,width:9.5,x:.4,y:41,z:1.2,color:'#a3ad87'},
 {name:'Plant New Leaf',length:-12,rise:12,width:4.2,x:-2.2,y:57,z:.1,color:'#b7bc96'}
];
for(const leaf of leaves){
 const v=[],ix=[],n=8;
 for(let i=0;i<=n;i++){
  const t=i/n,s=Math.pow(Math.sin(Math.PI*t),.9),x=leaf.length*t,y=leaf.rise*t+Math.sin(Math.PI*t)*2,w=leaf.width*s;
  // An angular central fold, tapered tip and uneven margins form one leaf.
  v.push(x,y+w*(1-.18*t),-.6*s,x,y,2.5*s,x,y-w*(.74+.08*Math.sin(i)),0,x,y,-1.1*s);
 }
 for(let i=0;i<n;i++){
  const a=i*4,b=(i+1)*4;
  ix.push(a,b,a+1,a+1,b,b+1,a+1,b+1,a+2,a+2,b+1,b+2);
  ix.push(a+2,b+2,a+3,a+3,b+2,b+3,a+3,b+3,a,a,b+3,b);
 }
 customMesh({vertices:v,indices:ix});rename(leaf.name);
 color(leaf.color);shading({category:'toon',shininess:1,flatShading:true});
 layer('outline',{outlineColor:'#374131',outlineWidth:.45,contourWidth:0});
 position({x:145+leaf.x,y:leaf.y,z:75+leaf.z});moveInto(plant);
}

const seed=add('Empty');rename('Chapter One Seed');position({x:-240,y:7,z:75});
const seedV=[],seedI=[],bands=14,segments=20;
for(let i=0;i<=bands;i++){
 const p=i/bands*Math.PI,r=Math.sin(p)*(1+.22*Math.cos(p));
 for(let j=0;j<=segments;j++){
  const a=j/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
  const groove=s>0?Math.exp(-Math.pow(c/.15,2))*.22:0;
  seedV.push(7.5*r*c,5*r*s*(1-groove),13*Math.cos(p)+1.2*r*c);
 }
}
for(let i=0;i<bands;i++)for(let j=0;j<segments;j++){
 const a=i*(segments+1)+j,b=a+segments+1;
 seedI.push(a,b,a+1,a+1,b,b+1);
}
customMesh({vertices:seedV,indices:seedI});rename('Seed Shell');
color('#b48e64');shading({category:'toon',shininess:1,roughness:1,flatShading:true});
layer('outline',{outlineColor:'#4d3f30',outlineWidth:.5,contourWidth:.2});
position({x:-240,y:7,z:75});rotation({y:80,z:7});moveInto(seed);
unselect();
