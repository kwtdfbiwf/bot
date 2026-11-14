// Chapter one runs inside the opening's async function, using its cached rig.
let chapter='waiting',chapterTime=0,chapterAt=0,lastFrame=0,playCount=0;
let pointerX=innerWidth/2,pointerY=innerHeight/2,lastPointerAt=0,reactionAt=-100,reaction='';
let growth=0,lightPinned=false,plant=null,leafLeft=null,leafRight=null,newLeaf=null,stem=null,seedModel=null,seedShell=null;
let pointerNearPlant=false,petCount=0,plantReady=false,chapterFailed=false,seatedAt=0;
const tasks=[];
const after=(seconds,fn)=>tasks.push({at:chapterTime+seconds,fn});
const enter=next=>{chapter=next;chapterAt=chapterTime;document.body.dataset.chapter=next;};
function objective(text){$('objective').hidden=!text;$('objective').replaceChildren();if(text){const s=document.createElement('span');s.textContent='OBJECTIVE';$('objective').append(s,document.createTextNode(text));}}
function hint(text){$('hint').hidden=!text;$('hint').textContent=text||'';}
function choice(text,fn){hint('');const b=$('choice');b.textContent=text;b.hidden=false;b.onclick=()=>{b.hidden=true;fn();};}
// Project world positions through the existing portrait camera. UI follows the
// same fixed framing at every aspect ratio, including narrow touch screens.
function screenPoint(x,y,z){
 const a=25.1*Math.PI/180,b=-10.4*Math.PI/180,dx=x-370,dy=y-360,dz=z-790;
 const yy=Math.cos(b)*dy+Math.sin(b)*dz,zz=-Math.sin(b)*dy+Math.cos(b)*dz;
 const xx=Math.cos(a)*dx-Math.sin(a)*zz,depth=-(Math.sin(a)*dx+Math.cos(a)*zz);
 const f=innerHeight/(2*Math.tan(45*Math.PI/360));
 return {x:innerWidth/2+xx*f/depth,y:innerHeight/2-yy*f/depth};
}
function place(el,p){el.style.left=p.x+'px';el.style.top=p.y+'px';}
function layoutChapter(){
 const down=['resting','end'].includes(chapter)?82:0;
 place($('pet'),screenPoint(0,310-down,80));place($('five'),screenPoint(88,110-down,45));
 const p=screenPoint(145,4,75);place($('soil'),p);place($('growth'),{x:p.x,y:p.y+45});placeSeed();
}
window.addEventListener('resize',layoutChapter);
// The assets are authored meshes in the Spline file, not runtime primitives.
function positionSeed(x,y,carrying=false){
 if(!seedModel)return;
 const a=25.1*Math.PI/180,b=-10.4*Math.PI/180,tan=Math.tan(45*Math.PI/360);
 const cx=(x/innerWidth*2-1)*tan*innerWidth/innerHeight,cy=(1-y/innerHeight*2)*tan;
 const zz=-Math.sin(a)*cx-Math.cos(a),rx=Math.cos(a)*cx-Math.sin(a);
 const ry=Math.cos(b)*cy-Math.sin(b)*zz,rz=Math.sin(b)*cy+Math.cos(b)*zz;
 const depth=carrying?420:(7-360)/ry,f=innerHeight/(2*tan),size=18*depth/(f*26);
 spline.updateObject(seedModel.id,{position:{x:370+depth*rx,y:360+depth*ry,z:790+depth*rz},scale:{x:size,y:size,z:size}});
}
function seedBrightness(amount){if(seedShell)spline.updateObject(seedShell.id,{material:{alpha:Math.max(8,amount*100)}});}
function placeSeed(){
 if(chapter==='finding'){
   const r=$('seed').getBoundingClientRect();positionSeed(r.left+r.width/2,r.top+r.height/2);
 }else if(chapter==='carrying')positionSeed(pointerX+14,pointerY-12,true);
}
async function preparePlant(){
 try{
 const find=async name=>{const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing '+name);return o;};
 plant=await find('Chapter One Plant');await spline.updateObject(plant.id,{visible:false});
 seedModel=await find('Chapter One Seed');await spline.updateObject(seedModel.id,{visible:false});
 seedShell=await find('Seed Shell');stem=await find('Plant Stem');
 leafLeft=await find('Plant Leaf Left');leafRight=await find('Plant Leaf Right');newLeaf=await find('Plant New Leaf');
 plantReady=true;
 }catch(error){chapterFailed=true;console.error('Plant assets:',error);}
}
const plantBoot=preparePlant();
function startChapter(){
 enter('intro');
 after(14,()=>speak('Oh. You’re still here.',()=>speak('Is that little light yours?',()=>{
   enter('play');$('spark').hidden=false;$('pet').hidden=false;$('five').hidden=false;
   hint(coarse?'Move your light around him.':'Move your light. He’s curious.');
   choice('Look around together',lookAround);
   // Keep play available until the visitor chooses to look around.
 })));
}
function react(kind){
 if(chapter!=='play'&&chapter!=='end')return;
 const elapsed=chapterTime-reactionAt;
 if(reaction==='five'&&elapsed<2.8)return;
 if(kind!=='five'&&elapsed<2.2)return;
 reaction=kind;reactionAt=chapterTime;playCount++;
 if(kind==='pet'){petCount++;speak(petCount>2?'My head is not a button.':'Oh. That’s… nice.');}
 if(kind==='five')after(.8,()=>{if(reaction==='five'&&chapter==='play')speak('Did I do that right?');});
 if(kind==='startle')speak('Whoa. Where are you going?');
}
$('pet').onclick=()=>react('pet');$('five').onclick=()=>react('five');
function lookAround(){
 if(chapter!=='play')return;enter('looking');$('choice').hidden=true;hint('');
 $('pet').hidden=true;$('five').hidden=true;
 speak('Oh. There really isn’t much here, is there?',()=>speak('Can you help me find something?',()=>{
   enter('finding');objective('Find the little glimmer');hint(coarse?'Sweep your light through the dark.':'Move your light beyond the glow.');
   $('seed').hidden=false;$('seed').style.opacity='.12';if(seedModel)spline.updateObject(seedModel.id,{visible:true});seedBrightness(.12);placeSeed();
   after(25,()=>{if(chapter==='finding'){speak('I think I saw something over there.');$('seed').style.opacity='.65';seedBrightness(.65);}});
 }));
}
function pickSeed(){
 if(chapter!=='finding')return;
 enter('carrying');document.body.dataset.carrying='true';$('seed').setAttribute('aria-label','Seed collected');$('seed').tabIndex=-1;
 place($('seed'),{x:pointerX+14,y:pointerY-12});seedBrightness(1);placeSeed();
 objective('Plant it beside Milo');hint('Choose the little patch of ground.');$('soil').hidden=false;layoutChapter();
 speak('A seed? What does it do?');
}
$('seed').onclick=pickSeed;
$('seed').onfocus=()=>{if(chapter==='finding'){$('seed').style.opacity='1';seedBrightness(1);}};
async function plantSeed(){
 if(chapter!=='carrying')return;
 enter('planting');if(seedModel)spline.updateObject(seedModel.id,{visible:false});$('seed').hidden=true;document.body.dataset.carrying='false';$('soil').disabled=true;objective('');hint('');
 await plantBoot;
 if(!plantReady){$('soil').disabled=false;enter('carrying');speak('Something went wrong. Let’s try again.');choice('Try again',()=>location.reload());return;}
 await spline.updateObject(plant.id,{visible:true,scale:{x:.18,y:.015,z:.18}});
 speak('Maybe it needs your light.',()=>{
   enter('growing');objective('Help it grow');hint(coarse?'Tap the seed to keep your light on it.':'Keep your light over the seed.');
   $('soil').disabled=false;$('soil').setAttribute('aria-label','Shine light on the planted seed');$('soil').setAttribute('aria-pressed','false');
   $('growth').hidden=false;$('soil').blur();
 });
}
$('soil').onclick=()=>{
 if(chapter==='carrying'){plantSeed();return;}
 if(chapter==='growing'){
   lightPinned=!lightPinned;$('soil').setAttribute('aria-pressed',String(lightPinned));
   if(lightPinned){const p=screenPoint(145,4,75);pointerX=p.x;pointerY=p.y;pointer(p.x,p.y);}
 }
};
function finishGrowing(){
 enter('grown');objective('');hint('');$('growth').hidden=true;$('soil').classList.add('grown');$('soil').disabled=true;$('soil').hidden=true;lightPinned=false;
 after(1.5,()=>speak('It’s… alive.',()=>speak('We did that. Together.',()=>{
   choice('Sit with Milo',restTogether);
 })));
}
function restTogether(){
 if(chapter!=='grown')return;enter('resting');seatedAt=chapterTime;$('spark').hidden=true;$('soil').hidden=true;hint('');
 after(4,()=>speak('I don’t remember what I was made for.',()=>speak('But I think I like this.',()=>{
   after(3,()=>speak('Could we leave the light on?',()=>choice('Leave the light on',()=>{
     enter('end');speak('Okay. We can stay a little longer.',()=>{after(6,()=>{$('dialogue').hidden=true;});});
     $('pet').hidden=false;layoutChapter();
   })));
 })));
}
function chapterPointer(x,y){
 const now=performance.now(),distance=Math.hypot(x-pointerX,y-pointerY),speed=distance/Math.max(16,now-lastPointerAt);
 pointerX=x;pointerY=y;lastPointerAt=now;
 const hand=$('five').getBoundingClientRect(),atHand=Math.hypot(x-hand.left-hand.width/2,y-hand.top-hand.height/2)<65;
 if(chapter==='play'&&!atHand&&speed>2.2&&distance>100&&chapterTime-chapterAt>3)react('startle');
 if(chapter==='finding'){
   const r=$('seed').getBoundingClientRect(),d=Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2);
   const brightness=Math.max(chapterTime-chapterAt>25?.4:.12,1-d/160);$('seed').style.opacity=String(brightness);seedBrightness(brightness);
 }
 if(chapter==='carrying'){place($('seed'),{x:x+14,y:y-12});placeSeed();}
 if(lightPinned&&chapter==='growing'&&!coarse){const p=screenPoint(145,4,75);if(Math.hypot(x-p.x,y-p.y)>90){lightPinned=false;$('soil').setAttribute('aria-pressed','false');}}
}
window.addEventListener('pointermove',e=>chapterPointer(e.clientX,e.clientY));
window.addEventListener('pointerdown',e=>chapterPointer(e.clientX,e.clientY));
function chapterTick(now){
 const dt=lastFrame?Math.min(.05,(now-lastFrame)/1000):0;lastFrame=now;
 if(document.hidden)return;chapterTime+=dt;
 for(let i=tasks.length-1;i>=0;i--)if(tasks[i].at<=chapterTime){const task=tasks.splice(i,1)[0];task.fn();}
 if(chapter==='growing'){
   const p=screenPoint(145,4,75);pointerNearPlant=lightPinned||Math.hypot(pointerX-p.x,pointerY-p.y)<64;
   if(pointerNearPlant)growth=Math.min(1,growth+dt/14);
   $('soil').classList.toggle('warming',pointerNearPlant);
   if(lightPinned){document.documentElement.style.setProperty('--mx',p.x+'px');document.documentElement.style.setProperty('--my',p.y+'px');}
   $('growth').firstElementChild.style.width=(growth*100)+'%';
   $('growth').setAttribute('aria-valuenow',String(Math.round(growth*100)));
   spline.updateObject(plant.id,{scale:{x:.18+.82*ease(growth),y:.015+.985*ease(growth),z:.18+.82*ease(growth)}});
   if(growth===1)finishGrowing();
 }
 if(plantReady&&growth>0){
   const sway=reduced?0:Math.sin(chapterTime*1.3)*2.3*growth;
   spline.updateObject(plant.id,{rotation:{z:sway}});
   const l=ease((growth-.15)/.55),r=ease((growth-.4)/.5),n=ease((growth-.72)/.28);
   spline.updateObject(leafLeft.id,{rotation:{z:sway*1.3},scale:{x:l,y:l,z:l}});
   spline.updateObject(leafRight.id,{rotation:{z:-sway*.9},scale:{x:r,y:r,z:r}});
   spline.updateObject(newLeaf.id,{rotation:{z:sway*.8},scale:{x:n,y:n,z:n}});
 }
}
// Follow the actual hand through the shoulder and elbow transforms, so its
// pointer target follows the gesture instead of remaining down by his hip.
function rotateVector(v,x,y,z){
 const k=Math.PI/180,a=z*k,b=y*k,c=x*k;
 const xx=v.x*Math.cos(a)-v.y*Math.sin(a),yy=v.x*Math.sin(a)+v.y*Math.cos(a);
 const xxx=xx*Math.cos(b)+v.z*Math.sin(b),zz=-xx*Math.sin(b)+v.z*Math.cos(b);
 return{x:xxx,y:yy*Math.cos(c)-zz*Math.sin(c),z:yy*Math.sin(c)+zz*Math.cos(c)};
}
function placeHighFive(p){
 const lower=rotateVector({x:5,y:-57,z:7},0,p.elbowY,p.elbowZ);
 const arm=rotateVector({x:8+lower.x,y:-43+lower.y,z:lower.z},p.rightX,0,p.rightZ);
 place($('five'),screenPoint(66+arm.x,204+p.bodyY+arm.y,arm.z));
}
function chapterPose(p){
 const elapsed=chapterTime-reactionAt,r=pulse(elapsed,0,.3,1.2,2);
 if(chapter==='play'&&!(reaction==='five'&&elapsed<2.8)){
   const h=screenPoint(0,310,80),near=clamp(1-Math.hypot(pointerX-h.x,pointerY-h.y)/130);
   p.headZ+=near*7;p.rightZ+=near*28;
 }
 if(reaction==='pet'){p.headX+=r*8;p.headZ+=r*9;}
 let open=0;
 if(reaction==='five'&&elapsed<2.8){
   const reach=pulse(elapsed,0,.55,2,2.65),contact=pulse(elapsed,.55,.7,.85,1.05);
   p.rightZ=122*reach-4*contact;p.rightX=0;p.elbowZ=20*reach;p.elbowY=0;
   p.headZ-=3*reach;open=reach;
 }
 for(const index of [0,1,2]){
   const name='Arm 1 Finger '+index,base=parts[name].position;
   write(name,{position:{y:base.y-11*open,z:base.z-7*open},scale:{y:1+.8*open}});
 }
 if(reaction==='startle'){p.headZ-=r*9;p.leftZ-=r*24;p.rightZ+=r*24;}
 if(['finding','looking'].includes(chapter))p.headY-=Math.sin((chapterTime-chapterAt)*.7)*12;
 if(['planting','growing','grown'].includes(chapter)){p.headX+=14;p.headY+=13;}
 if(['resting','end'].includes(chapter)){
   const s=ease((chapterTime-seatedAt)/3);p.bodyY-=82*s;p.headX+=12*s;p.headY+=13*s;p.rightX-=40*s;p.leftX-=40*s;
   write('Robot Leg Pivot -1',{position:{y:100-80*s},rotation:{x:-78*s,y:0,z:0}});
   write('Robot Leg Pivot 1',{position:{y:100-80*s},rotation:{x:-78*s,y:0,z:0}});
   if(chapter==='resting'&&chapterTime-chapterAt<3)layoutChapter();
 }
 placeHighFive(p);
 return p;
}
layoutChapter();
