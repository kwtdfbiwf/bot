// One-time Spline build: the little open shelf beside the computer in Aleena's
// room reference. One book, softened walnut, exposed joints and empty space.
const cozyShelf=add('Empty');rename('Cozy Shelf');position({x:0,y:0,z:0});
const walnut=generateTexture('Cozy Walnut Grain',(ctx,{size,rng})=>{
 ctx.fillStyle='#98734f';ctx.fillRect(0,0,size,size);
 for(let i=0;i<130;i++){
   const y=rng()*size,shade=80+rng()*35;
   ctx.strokeStyle=`rgba(${shade},${shade*.73},${shade*.5},${.07+rng()*.12})`;ctx.lineWidth=.6+rng()*1.4;
   ctx.beginPath();ctx.moveTo(-size*.1,y);ctx.bezierCurveTo(size*.25,y+Math.sin(i)*12,size*.7,y-Math.cos(i)*9,size*1.1,y);ctx.stroke();
 }
 for(let i=0;i<6;i++){
   const x=rng()*size,y=rng()*size;
   for(let j=0;j<3;j++){ctx.strokeStyle='rgba(89,61,38,.09)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,10+j*8,2+j*2,0,0,Math.PI*2);ctx.stroke();}
 }
},512);
const frame=[
 ['Top',0,116,0,104,7,56],['Middle',0,65,0,96,7,52],['Bottom',0,12,0,96,7,52],
 ['Front Left',-46,61,23,8,122,8],['Front Right',46,61,23,8,122,8],
 ['Back Left',-46,61,-23,8,122,8],['Back Right',46,61,-23,8,122,8],
 ['Back Rail',0,103,-24,84,9,5]
];
for(let i=0;i<frame.length;i++){
 const p=frame[i];mesh('Cube',{width:p[4],height:p[5],depth:p[6],cornerRadius:1.6,cornerSegments:6});rename('Cozy Shelf '+p[0]);
 if(i===0){createMaterial('Cozy Walnut');color('#94704e');shading({category:'physical',roughness:.83,metalness:0,reflectivity:.08});layer('texture',{image:walnut.id,projection:'triplanar',size:[110,110],alpha:.6});}
 else applyMaterial('Cozy Walnut');
 position({x:p[1],y:p[2],z:p[3]});moveInto(cozyShelf);
}
// Four inset dowel ends make the frame feel assembled, without adding clutter.
for(const x of [-46,46])for(const y of [65,116]){
 mesh('Cylinder',{width:2.8,height:.6,radialSegments:12,cornerRadius:.2});rename('Cozy Shelf Dowel '+x+' '+y);
 createMaterial('Cozy Dowel '+x+' '+y);color('#735237');shading({category:'physical',roughness:.9,metalness:0});rotation({x:90});position({x,y,z:27.5});moveInto(cozyShelf);
}
const cozyBook=add('Empty');rename('Cozy Shelf Book');position({x:-10,y:22,z:1});
const book=[['Lower Cover',0,-5.8,0,60,1.4,35],['Upper Cover',0,5.8,0,60,1.4,35],['Pages',1,0,0,55,10,31],['Spine',-28.5,0,0,3,11.6,35]];
for(let i=0;i<book.length;i++){
 const p=book[i];mesh('Cube',{width:p[4],height:p[5],depth:p[6],cornerRadius:i===2?.7:1,cornerSegments:5});rename('Cozy Book '+p[0]);
 if(i===0){createMaterial('Cozy Book Sage');color('#74836a');shading({category:'physical',roughness:.88,metalness:0,reflectivity:.05});}
 else if(i===2){createMaterial('Cozy Book Paper');color('#d5c6a4');shading({category:'physical',roughness:.94,metalness:0});}
 else applyMaterial('Cozy Book Sage');
 position({x:-10+p[1],y:22+p[2],z:1+p[3]});moveInto(cozyBook);
}
// Three fine page seams on the exposed fore-edge belong to the same book.
for(let i=0;i<3;i++){
 mesh('Cube',{width:51,height:.28,depth:.4,cornerRadius:.1});rename('Cozy Book Page Seam '+i);createMaterial('Cozy Page Seam '+i);color('#b5a783');shading({category:'lambert'});
 position({x:-9,y:19+i*3,z:16.8});moveInto(cozyBook);
}
select(cozyBook);rotation({y:-8});moveInto(cozyShelf);
select(cozyShelf);position({x:-235,y:0,z:-30});rotation({y:15});hide(cozyShelf);unselect();
