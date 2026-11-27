// One-time native story props. Prefix with interior/helpers.js.
const storyProps=add('Empty');rename('Home Story Props');position({x:0,y:0,z:0});
function homeGroup(name,p={x:0,y:0,z:0}){const o=add('Empty');rename(name);position(p);moveInto(storyProps);interiorParent=o;return o;}
homeGroup('Home Rolled Rug',{x:0,y:32,z:75});
icyl('Home Rug Roll Cloth',0,32,75,62,470,'Interior Sage');rotation({z:90});
for(const x of [-235,235]){icyl('Home Rug Roll End '+x,x,32,75,54,3,'Interior Cream');rotation({z:90});}
homeGroup('Home Loose Thread');itube('Home Thread Loop',[[0,3,38],[10,4,55],[35,3,65],[48,5,80],[30,3,87]],1.4,'Interior Cream');
homeGroup('Home Lamp Cable');
itube('Home Cable Floor',[[65,2,55],[95,2,-80],[85,2,-240],[25,2,-370],[-77,2,-450],[-77,190,-545]],2.4,'Interior Cord');
homeGroup('Home Daybed Cover');
const coverVertices=[],coverIndices=[],xs=[-595,-580,-555,-445,-335,-310,-295],rows=[[-80,127],[-40,202],[20,184],[100,118],[200,116],[375,103]];
for(const [z,y] of rows)for(let i=0;i<xs.length;i++)coverVertices.push(xs[i],y-([0,6].includes(i)?65:[1,5].includes(i)?12:0)+Math.sin(i*1.8+z*.03)*2,z);
for(let row=0;row<rows.length-1;row++)for(let col=0;col<xs.length-1;col++){const a=row*xs.length+col,b=a+1,c=a+xs.length,d=c+1;coverIndices.push(a,c,b,b,c,d);}
customMesh({vertices:coverVertices,indices:coverIndices});rename('Home Cover Fabric');position({x:0,y:0,z:0});createMaterial('Home Dusty Cover');color('#827b6d');shading({category:'physical',roughness:1,metalness:0,side:'double'});moveInto(interiorParent);
homeGroup('Home Folded Blanket',{x:-210,y:17,z:-431});
ibox('Home Blanket Folded Cloth',-210,17,-431,140,34,90,'Interior Rust');geometry({cornerRadius:12,cornerSegments:7});
for(let i=0;i<3;i++)ibox('Home Blanket Fold '+i,-210,6+i*9,-385,126,2,2,'Interior Paper');
homeGroup('Home Connector',{x:-235,y:150,z:-770});
ibox('Home Connector Socket',-235,150,-770,23,15,17,'Interior Charcoal');geometry({cornerRadius:4});
for(const x of [-239,-231])icyl('Home Connector Contact '+x,x,152,-760,3,6,'Interior Brass');
homeGroup('Home Loose Plug',{x:-280,y:185,z:-770});
ibox('Home Plug Body',-280,185,-770,21,14,16,'Interior Cream');geometry({cornerRadius:4});
homeGroup('Home Garland Pull',{x:-230,y:250,z:-770});
itube('Home Pull Cord',[[-230,250,-770],[-230,130,-770]],1.4,'Interior Cord');
icyl('Home Pull Handle',-230,125,-770,9,17,'Interior Brass');
const seatDustImage=generateTexture('Home Seat Dust Film',(ctx,{size,rng})=>{
 ctx.fillStyle='rgba(194,184,162,.85)';ctx.fillRect(0,0,size,size);
 for(let i=0;i<2600;i++){ctx.fillStyle=i%2?'rgba(240,233,215,.16)':'rgba(117,103,82,.12)';ctx.fillRect(rng()*size,rng()*size,1,1);}
},256);
homeGroup('Home Seat Dust');let seatDustIndex=0;
for(const x of [-510,-445,-380])for(const z of [90,260]){
 mesh('Decal',{width:76,height:174,depth:4,offset:.16});rename('Home Seat Dust '+seatDustIndex++);createMaterial('Home Seat Dust Material '+seatDustIndex);removeLayer('color');shading({category:'physical',roughness:1,metalness:0});layer('texture',{image:seatDustImage.id,alpha:1});rotation({x:-90});position({x,y:108.8,z});moveInto(interiorParent);
}
const shadowTexture=generateTexture('Home Soft Contact Shadow',(ctx,{size})=>{
 const g=ctx.createRadialGradient(size*.5,size*.5,0,size*.5,size*.5,size*.49);g.addColorStop(0,'rgba(0,0,0,.44)');g.addColorStop(.45,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
},128);
mesh('Rectangle',{width:145,height:95});rename('Home Actor Shadow');createMaterial('Home Contact Shadow');removeLayer('color');layer('light',{alpha:0});layer('texture',{image:shadowTexture.id,alpha:1});position({x:0,y:.35,z:13});rotation({x:-90});moveInto(storyProps);
hide(storyProps);unselect();
