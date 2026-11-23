// The leaning mirror catches the warm garland above it. Its authored
// reflection is fixed for the fixed room camera, with a silvered edge.
const reflectedLight=generateTexture('Interior Warm Mirror Reflection',(ctx,{size,rng})=>{
 const g=ctx.createLinearGradient(0,0,size,size);g.addColorStop(0,'#302923');g.addColorStop(.5,'#73513b');g.addColorStop(1,'#c28c4f');ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
 ctx.fillStyle='rgba(45,31,25,.55)';ctx.beginPath();ctx.moveTo(size*.72,0);ctx.lineTo(size*.89,0);ctx.lineTo(size*.38,size);ctx.lineTo(size*.24,size);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#493927';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(size*.8,0);ctx.bezierCurveTo(size*.7,size*.25,size*.28,size*.47,size*.42,size*.83);ctx.stroke();
 for(const [x,y] of [[.68,.21],[.43,.39],[.38,.61]]){
  ctx.save();ctx.translate(x*size,y*size);ctx.scale(1,.34);
  const glow=ctx.createRadialGradient(0,0,2,0,0,size*.26);glow.addColorStop(0,'rgba(255,232,143,.95)');glow.addColorStop(.18,'rgba(255,196,82,.8)');glow.addColorStop(1,'rgba(255,170,60,0)');ctx.fillStyle=glow;ctx.fillRect(-size*.3,-size*.3,size*.6,size*.6);
  ctx.fillStyle='#ffe9aa';ctx.beginPath();ctx.ellipse(0,0,size*.043,size*.064,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 for(let i=0;i<90;i++){ctx.strokeStyle='rgba(226,197,148,.045)';ctx.lineWidth=.4;const y=rng()*size;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y+3);ctx.stroke();}
},512);
select('Interior Mirror Glass');layer('texture',{image:reflectedLight.id,projection:'uv',alpha:.9});shading({category:'physical',roughness:.17,metalness:.3,reflectivity:.65});
hide('Interior Mirror Amber Reflection');unselect();

// Publish with the room hidden so the opening remains completely black.
hide('Interior Home');show('Studio Ground');
