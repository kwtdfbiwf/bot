// Run after shelf-models.js, prefixed with shelf-dust-layout.js.
// Transparent, feathered dust decals hug the wood and book; no floating pads.
const dustImage=generateTexture('Cozy Shelf Dust Veil',(ctx,{size,rng})=>{
 const g=ctx.createRadialGradient(size*.5,size*.5,0,size*.5,size*.5,size*.47);
 g.addColorStop(0,'rgba(185,175,155,.45)');g.addColorStop(.5,'rgba(185,175,155,.28)');g.addColorStop(1,'rgba(185,175,155,0)');
 ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
 for(let i=0;i<2200;i++){
   const x=rng()*size,y=rng()*size,r=Math.hypot(x/size-.5,y/size-.5)*2;
   if(r>.94)continue;
   ctx.fillStyle=`rgba(199,188,167,${(1-r*r)*(.06+rng()*.22)})`;
   ctx.beginPath();ctx.arc(x,y,.4+rng()*1.5,0,Math.PI*2);ctx.fill();
 }
},256);
const dustRoot=add('Empty');rename('Cozy Shelf Dust');position({x:-235,y:0,z:-30});
for(let i=0;i<shelfDustLayout.length;i++){
 const p=shelfDustLayout[i],top=p.h<1;
 mesh('Decal',{width:p.w,height:top?p.d:p.h,depth:3,offset:.12});rename('Shelf Dust '+i);
 createMaterial('Cozy Dust Patch '+i);removeLayer('color');shading({category:'physical',roughness:1,metalness:0,reflectivity:0});
 layer('texture',{image:dustImage.id,alpha:.85});
 rotation({x:top?-90:0});position({x:-235+p.x,y:p.y-(top?.8:0),z:-30+p.z-(top?0:.7)});moveInto(dustRoot);
}
select(dustRoot);rotation({y:15});moveInto('Cozy Shelf',dustRoot);hide(dustRoot);unselect();
