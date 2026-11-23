// Warm, fully enclosed camera setting. The front entrance is BEHIND the
// play camera, so no miniature base edge or exterior silhouette enters play.
hide('Home Room');
const home=add('Empty');interiorParent=home;rename('Interior Home');position({x:0,y:0,z:0});
mesh('Cube',{width:100,height:10,depth:100,cornerRadius:1});rename('Interior Floor Starter');position({x:0,y:-6,z:0});moveInto(home);
const grain=generateTexture('Interior Oak Grain',(ctx,{size,rng})=>{
 ctx.fillStyle='#ad7c4f';ctx.fillRect(0,0,size,size);
 for(let i=0;i<95;i++){
  const y=i*size/95;ctx.strokeStyle=i%3?'rgba(69,32,14,.20)':'rgba(238,189,125,.22)';ctx.lineWidth=.6+rng()*2.7;
  ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(size*.3,y+Math.sin(i*.4)*14,size*.7,y-Math.sin(i*.23)*12,size,y);ctx.stroke();
 }
 for(const k of [[.22,.34],[.72,.8]])for(let r=0;r<5;r++){
  ctx.strokeStyle='rgba(75,35,18,.17)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(k[0]*size,k[1]*size,6+r*8,2+r*2.8,.05,0,Math.PI*2);ctx.stroke();
 }
 for(let i=0;i<1800;i++){ctx.fillStyle=i%2?'rgba(255,225,181,.04)':'rgba(40,18,8,.04)';ctx.fillRect(rng()*size,rng()*size,1+rng()*4,.6);}
},512);
const cloth=generateTexture('Interior Linen Weave',(ctx,{size,rng})=>{
 ctx.fillStyle='#d2bda1';ctx.fillRect(0,0,size,size);
 for(let i=0;i<128;i++){ctx.fillStyle=i%2?'rgba(255,250,230,.12)':'rgba(51,29,14,.10)';ctx.fillRect(i*4,0,1,size);ctx.fillRect(0,i*4,size,1);}
},512);
const mats=[['Interior Oak','#a97c50',.88],['Interior Cedar','#704037',.78],['Interior Walnut','#51392b',.85],['Interior Cream','#c6b49c',.95],['Interior Rust','#9e4933',.95],['Interior Sage','#929078',.98],['Interior Leather','#6e4331',.8],['Interior Brass','#ad7840',.36],['Interior Charcoal','#282a28',.85],['Interior Book Red','#873e31',.87],['Interior Book Olive','#5b604d',.87],['Interior Paper','#cebb96',.95],['Interior Amber','#f6b44e',.5],['Interior Cord','#50402b',.9],['Interior Mirror','#bd9068',.18]];
for(const p of mats){createMaterial(p[0]);removeLayer('texture');color(p[1]);shading({category:'physical',roughness:p[2],metalness:p[0]==='Interior Brass'?.65:0,reflectivity:.12});if(['Interior Oak','Interior Cedar','Interior Walnut'].includes(p[0]))layer('texture',{image:grain.id,projection:'triplanar',size:[180,180],alpha:.4});if(['Interior Cream','Interior Rust','Interior Sage'].includes(p[0]))layer('texture',{image:cloth.id,projection:'triplanar',size:[100,100],alpha:.15});}
applyMaterial('Interior Oak');hide();
// Staggered real planks, extending behind the camera.
for(let row=0;row<7;row++)for(let col=0;col<10;col++){
 const x=-675+col*150,z=-650+row*310;
 ibox('Interior Floor Plank '+row+' '+col,x,-8,z,148,16,308,'Interior Oak');
}
// Closed rear gable made of vertical cedar boards, each clipped to the roof.
for(let i=0;i<19;i++){
 const x=-675+i*75,h=1040*(1-Math.abs(x)/760);
 ibox('Interior Back Wall Plank '+i,x,h/2-2,-817,73,h,20,'Interior Oak');
}
const angle=Math.atan2(760,1040)*180/Math.PI,len=Math.hypot(760,1040);
for(const side of [-1,1]){
 for(let i=0;i<13;i++){
  const t=(i+.5)/13;
  ibox('Interior Sloped Ceiling '+side+' '+i,side*(760-760*t),1040*t+13,220,len/13-1.5,22,2100,'Interior Oak',{z:-side*(90-angle)});
 }
 for(const z of [-795,-230,410,1250])ibox('Interior Roof Rafter '+side+' '+z,side*380,520,z,34,len+20,42,'Interior Cedar',{z:side*angle});
}
ibox('Interior Ridge Timber',0,1035,220,55,42,2120,'Interior Cedar');
ibox('Interior Back Cross Beam',0,440,-790,866,30,36,'Interior Cedar');
ibox('Interior Back Skirting',0,20,-790,1480,40,34,'Interior Walnut');
select(home);hide(home);unselect();
