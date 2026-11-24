// Run once after the original dust builder, prefixed with shelf-dust-layout.js.
const dustImage=generateTexture('Cozy Shelf Dust Veil',(ctx,{size,rng})=>{
 ctx.fillStyle='rgba(207,199,179,.9)';ctx.fillRect(0,0,size,size);
 for(let i=0;i<5200;i++){
   ctx.fillStyle=i%3?'rgba(240,233,215,.2)':'rgba(130,119,98,.16)';
   ctx.fillRect(rng()*size,rng()*size,.5+rng()*1.2,.5+rng()*1.2);
 }
},256);
for(let i=0;i<26;i++){
 const p=shelfDustLayout[i],top=p.h<1;
 select('Shelf Dust '+i);geometry({width:p.w,height:top?p.d:p.h,depth:3,offset:.16});layer('texture',{image:dustImage.id,alpha:1});
}
for(let i=26;i<shelfDustLayout.length;i++){
 const p=shelfDustLayout[i];
 mesh('Decal',{width:p.w,height:p.h,depth:3,offset:.16});rename('Shelf Dust '+i);
 createMaterial('Cozy Dust Patch '+i);removeLayer('color');shading({category:'physical',roughness:1,metalness:0,reflectivity:0});
 layer('texture',{image:dustImage.id,alpha:1});moveInto('Cozy Shelf Dust');
 position({x:p.x,y:p.y,z:p.z});rotation({x:0,y:0,z:0});
}
unselect();
