// Run after shelf-models.js, prefixed with shelf-dust-layout.js.
// Transparent, feathered dust decals hug the wood and book; no floating pads.
const dustImage=generateTexture('Cozy Shelf Dust Veil',(ctx,{size,rng})=>{
 ctx.fillStyle='rgba(207,199,179,.9)';ctx.fillRect(0,0,size,size);
 for(let i=0;i<5200;i++){
   ctx.fillStyle=i%3?'rgba(240,233,215,.2)':'rgba(130,119,98,.16)';
   ctx.fillRect(rng()*size,rng()*size,.5+rng()*1.2,.5+rng()*1.2);
 }
},256);
const dustRoot=add('Empty');rename('Cozy Shelf Dust');position({x:-235,y:0,z:-30});
for(let i=0;i<shelfDustLayout.length;i++){
 const p=shelfDustLayout[i],top=p.h<1;
 mesh('Decal',{width:p.w,height:top?p.d:p.h,depth:3,offset:.12});rename('Shelf Dust '+i);
 createMaterial('Cozy Dust Patch '+i);removeLayer('color');shading({category:'physical',roughness:1,metalness:0,reflectivity:0});
 layer('texture',{image:dustImage.id,alpha:1});
 rotation({x:top?-90:0});position({x:-235+p.x,y:p.y-(top?.8:0),z:-30+p.z-(top?0:.7)});moveInto(dustRoot);
}
select(dustRoot);rotation({y:15});moveInto('Cozy Shelf',dustRoot);hide(dustRoot);unselect();
