// Run after shelf-models.js and before shelf-dust-models.js. Resets the
// existing frame before sculpting so re-running never accumulates warps.
const frame=[
 ['Top',0,90,0,110,12,60],['Middle',0,54,0,96,9,52],['Bottom',0,12,0,96,7,52],
 ['Front Left',-44,46,22,12,92,12],['Front Right',44,46,22,12,92,12],
 ['Back Left',-44,46,-22,12,92,12],['Back Right',44,46,-22,12,92,12],
 ['Back Rail',0,80,-24,78,10,6]
];
for(const p of frame){
 select('Cozy Shelf '+p[0]);
 geometry({width:p[4],height:p[5],depth:p[6],cornerRadius:p[0]==='Top'?3.5:2.5,cornerSegments:8});
 position({x:p[1],y:p[2],z:p[3]});
}
for(const x of [-46,46])for(const y of [65,116]){
 select('Cozy Shelf Dowel '+x+' '+y);geometry({width:3.6,height:.8});
 position({x:x<0?-44:44,y:y===65?54:90,z:28.5});
}
const drawWood=(ctx,{size,rng})=>{
 ctx.fillStyle='#936945';ctx.fillRect(0,0,size,size);
 const knots=[{x:size*.28,y:size*.34},{x:size*.76,y:size*.78}];
 for(let i=0;i<78;i++){
  const y=i*size/78,light=i%4===0;
  ctx.strokeStyle=light?'rgba(221,177,120,.22)':'rgba(65,37,20,.25)';
  ctx.lineWidth=light?1.8:.7+rng()*1.6;ctx.beginPath();
  for(let j=0;j<=80;j++){
   const x=j*size/80;
   let bend=Math.sin(x/size*12+i*.15)*3+Math.sin(x/size*5+i*.38)*4;
   for(const k of knots){
    const dx=(x-k.x)/(size*.18),dy=y-k.y;
    bend+=Math.sign(dy)*Math.exp(-dx*dx)*Math.exp(-Math.abs(dy)/(size*.12))*size*.065;
   }
   if(j===0)ctx.moveTo(x,y+bend);else ctx.lineTo(x,y+bend);
  }ctx.stroke();
 }
 for(const k of knots){
  for(let r=4;r>=0;r--){
   ctx.strokeStyle='rgba(61,34,19,'+(.2+r*.018)+')';ctx.lineWidth=1.4;
   ctx.beginPath();ctx.ellipse(k.x,k.y,7+r*8,2+r*2.8,-.08,0,Math.PI*2);ctx.stroke();
  }
  ctx.fillStyle='rgba(60,32,17,.48)';ctx.beginPath();ctx.ellipse(k.x,k.y,5,1.7,-.08,0,Math.PI*2);ctx.fill();
 }
 for(let i=0;i<900;i++){
  ctx.fillStyle=i%2?'rgba(239,205,155,.06)':'rgba(45,24,12,.055)';
  ctx.fillRect(rng()*size,rng()*size,1+rng()*3,.6);
 }
};
const walnut=generateTexture('Cozy Walnut Grain',drawWood,512);
const upright=generateTexture('Cozy Walnut Upright',(ctx,h)=>{
 ctx.save();ctx.translate(h.size,0);ctx.rotate(Math.PI/2);drawWood(ctx,h);ctx.restore();
},512);
select('Cozy Shelf Top');color('#936945');layer('texture',{image:walnut.id,projection:'triplanar',size:[100,100],alpha:.88});shading({category:'physical',roughness:.88,metalness:0,reflectivity:.06});
select('Cozy Shelf Front Left');createMaterial('Cozy Walnut Upright');layer('texture',{image:upright.id,projection:'triplanar',size:[100,100],alpha:.88});
for(const name of ['Front Right','Back Left','Back Right']){select('Cozy Shelf '+name);applyMaterial('Cozy Walnut Upright');}
for(const name of ['Top','Middle','Bottom','Front Left','Front Right','Back Left','Back Right','Back Rail']){
 const target='Cozy Shelf '+name,g=getGeometry(target),v=g.vertices;
 for(let i=0;i<v.length;i+=3){
  const x=v[i],y=v[i+1],z=v[i+2];
  if(name.includes('Left')||name.includes('Right')){
   const side=name.includes('Left')?-1:1;
   v[i]+=side*(.5-y/92)*1.8+Math.sin(y*.065)*.3;
   v[i+2]+=(name.includes('Front')?1:-1)*(.5-y/92)*1.1;
  }else{
   v[i+1]+=.3*Math.sin(x*.075)+.2*Math.cos(z*.11);
   v[i+2]+=.45*Math.sin(x*.064);
  }
 }
 setGeometry(target,{vertices:v});
}
