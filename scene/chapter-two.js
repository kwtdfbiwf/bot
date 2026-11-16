// Naming, physical play, watering, and the moth share the opening's clock/rig.
let chosenName='Milo',yaw=0,yawTarget=0,lastPose=null,twoLastFrame=0;
let armDrag=null,turnDrag=null,suppressArmClickUntil=-1,armDialogueAt=-100,armTouches=0;
const arms={left:{angle:0,releaseAt:-100,releaseFrom:0},right:{angle:0,releaseAt:-100,releaseFrom:0}};
let standAt=-100,happyAt=-100,nameConfirmed=false;
let moth=null,mothLeft=null,mothRight=null,mothOffered=false,mothWarmth=0,mothPinned=false,mothAt={x:145,y:85,z:75},mothFlightFrom=null;
let mothReady=false,twoReady=false,mothOfferAt=0;
try{chosenName=localStorage.getItem('milo-chosen-name')||'Milo';}catch{}
const freeArms=()=>['play','end','named-play','garden-end','collection-rest'].includes(chapter)||(chapter==='collection-end'&&collectionSettled);
const namingStates=()=>['name-intro','name-search','name-found','nickname','name-happy','named-play','water-intro','water-find','water-carry','water-aim','water-bloom','water-done','moth-arrival','moth-coax','moth-landed','moth-stay','moth-return','garden-end'].includes(chapter)||chapter.startsWith('collection-');
const bounded=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function worldPoint(p){return rotateVector(p,0,yaw,0);}
function bodyScreen(x,y,z){const p=worldPoint({x,y,z});return screenPoint(p.x,p.y,p.z);}
function projectedHand(p,side='right',orientation=yaw){
 if(side==='right'){
   const q=rotateVector({x:5,y:-57,z:7},0,p.elbowY,p.elbowZ);
   const r=rotateVector({x:8+q.x,y:-43+q.y,z:q.z},p.rightX,0,p.rightZ);
   return rotateVector({x:66+r.x,y:204+p.bodyY+r.y,z:r.z},0,orientation,0);
 }
 const r=rotateVector({x:-13,y:-100,z:7},p.leftX,0,p.leftZ);
 return rotateVector({x:-66+r.x,y:204+p.bodyY+r.y,z:r.z},0,orientation,0);
}
function handScreen(p,side){const h=projectedHand(p,side);return screenPoint(h.x,h.y,h.z);}
function refreshArmTargets(p){
 for(const side of ['left','right']){
   const el=$('arm-'+side);el.hidden=!freeArms();
   const h=handScreen(p,side),s=bodyScreen(side==='left'?-66:66,204+p.bodyY,0);
   place(el,{x:s.x+(h.x-s.x)*.7,y:s.y+(h.y-s.y)*.7});
   el.style.width=Math.max(44,Math.abs(h.x-s.x)*.55+32)+'px';
   el.style.height=Math.max(64,Math.abs(h.y-s.y)*.65+25)+'px';
 }
 if(freeArms()){
   const down=['end','collection-rest'].includes(chapter)?82:0;
   place($('pet'),bodyScreen(0,310-down,80));
 }
}
function ignoreArmClick(){return chapterTime<suppressArmClickUntil;}
function startArm(e,side){
 if(!freeArms()||e.button>0||armDrag)return;
 const p=lastPose;if(!p)return;
 const shoulder=bodyScreen(side==='right'?66:-66,204+p.bodyY,0);
 armDrag={side,id:e.pointerId,x:e.clientX,y:e.clientY,base:side==='right'?p.rightZ:p.leftZ,
   startAngle:Math.atan2(e.clientX-shoulder.x,e.clientY-shoulder.y)*180/Math.PI,moved:false,el:e.currentTarget};
 e.currentTarget.setPointerCapture?.(e.pointerId);
}
function moveArm(e){
 if(!armDrag||e.pointerId!==armDrag.id)return;
 const d=armDrag,side=d.side;
 if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<6)return;
 if(!d.moved){
   d.moved=true;reaction='';reactionAt=-100;document.body.dataset.armDragging='true';
   if(chapterTime-armDialogueAt>5){armDialogueAt=chapterTime;armTouches++;
     speak(armTouches===1?'Oh. That’s my arm.':armTouches===2?'I was wondering what that did.':'Careful. I’m still attached to that.');
   }
 }
 const shoulder=bodyScreen(side==='right'?66:-66,204+lastPose.bodyY,0);
 const a=Math.atan2(e.clientX-shoulder.x,e.clientY-shoulder.y)*180/Math.PI;
 let delta=(a-d.startAngle+540)%360-180;
 arms[side].angle=bounded(d.base+delta,side==='right'?-25:-155,side==='right'?155:25);
 arms[side].releaseAt=-100;suppressArmClickUntil=chapterTime+.3;
}
function releaseArm(e){
 if(!armDrag||(e.pointerId!==undefined&&e.pointerId!==armDrag.id))return;
 const d=armDrag;if(d.moved){arms[d.side].releaseAt=chapterTime;arms[d.side].releaseFrom=arms[d.side].angle;suppressArmClickUntil=chapterTime+.35;}
 try{d.el.releasePointerCapture?.(d.id);}catch{}
 armDrag=null;document.body.dataset.armDragging='false';
}
for(const side of ['left','right']){
 const el=$('arm-'+side);el.onpointerdown=e=>startArm(e,side);
 el.onkeydown=e=>{
   if(!freeArms()||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();
   const arm=arms[side],sign=side==='right'?1:-1;
   const current=lastPose?(side==='right'?lastPose.rightZ:lastPose.leftZ):0;
   arm.angle=bounded(current+(e.key==='ArrowUp'?20:-20)*sign,side==='right'?-25:-155,side==='right'?155:25);
   arm.releaseFrom=arm.angle;arm.releaseAt=chapterTime+.8;reaction='';
   if(chapterTime-armDialogueAt>5){armDialogueAt=chapterTime;speak('Oh. That’s my arm.');}
 };
}
$('five').onpointerdown=e=>startArm(e,'right');
window.addEventListener('pointermove',moveArm);
window.addEventListener('pointerup',releaseArm);window.addEventListener('pointercancel',releaseArm);
window.addEventListener('blur',()=>{releaseArm({});turnDrag=null;});

async function prepareChapterTwo(){
 try{
   moth=await spline.findObjectByName('Garden Moth');mothLeft=await spline.findObjectByName('Moth Wing Left');mothRight=await spline.findObjectByName('Moth Wing Right');
   if(!moth||!mothLeft||!mothRight)throw new Error('Missing moth model');
   await update(moth.id,{visible:false});mothReady=true;twoReady=true;
 }catch(error){console.error('Chapter two assets:',error);}
}
const twoBoot=prepareChapterTwo();
function answers(items){
 $('choice').hidden=true;const box=$('answers');box.replaceChildren();
 for(const [text,fn] of items){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{box.hidden=true;fn();};box.append(b);}
 box.hidden=false;
}
function beginNaming(){
 if(chapter!=='end')return;
 enter('name-intro');standAt=chapterTime;reaction='';$('pet').hidden=true;$('five').hidden=true;
 speak('You have a name, '+visitor+'.',()=>speak('Do I have one?',()=>{
   enter('name-search');objective('Find his name');
   $('turn-milo').hidden=false;
 }));
}
$('turn-milo').onpointerdown=e=>{
 if(chapter!=='name-search'||e.button>0)return;
 turnDrag={id:e.pointerId,x:e.clientX,base:yawTarget,el:e.currentTarget};
 e.currentTarget.setPointerCapture?.(e.pointerId);
};
$('turn-milo').onkeydown=e=>{
 if(chapter!=='name-search'||!['ArrowLeft','ArrowRight'].includes(e.key))return;
 e.preventDefault();yawTarget+=e.key==='ArrowRight'?45:-45;
};
window.addEventListener('pointermove',e=>{
 if(turnDrag&&e.pointerId===turnDrag.id)yawTarget=turnDrag.base+(e.clientX-turnDrag.x)*.8;
});
function releaseTurn(e){
 if(!turnDrag||(e.pointerId!==undefined&&e.pointerId!==turnDrag.id))return;
 try{turnDrag.el.releasePointerCapture?.(turnDrag.id);}catch{}turnDrag=null;
}
window.addEventListener('pointerup',releaseTurn);window.addEventListener('pointercancel',releaseTurn);
$('back-name').onclick=()=>{
 if(chapter!=='name-search'||Math.cos((yaw-25.1)*Math.PI/180)>-.6)return;
 enter('name-found');objective('');yawTarget=Math.round(yaw/360)*360;turnDrag=null;$('turn-milo').hidden=true;$('back-name').hidden=true;
 speak('Milo.',()=>speak('Does that sound like me?',()=>answers([
   ['Yes. You’re Milo.',()=>giveName('Milo')],['Choose a name',()=>{
     enter('nickname');$('dialogue').hidden=true;$('nickname-form').hidden=false;$('robot-name').value='';$('robot-name').focus({preventScroll:true});
   }]
 ])));
};
$('nickname-form').onsubmit=e=>{
 e.preventDefault();const name=$('robot-name').value.trim().replace(/\s+/g,' ').slice(0,20);
 if(!name){$('robot-name').value='';$('robot-name').focus();return;}
 $('nickname-form').hidden=true;giveName(name);
};
function giveName(name){
 if(nameConfirmed)return;nameConfirmed=true;chosenName=name;
 try{localStorage.setItem('milo-chosen-name',chosenName);}catch{}
 enter('name-happy');happyAt=chapterTime;
 speak(chosenName+'.',()=>speak(chosenName==='Milo'?'Milo. I like it.':'Milo on the outside. '+chosenName+' to you.',()=>{
   enter('named-play');$('pet').hidden=false;$('five').hidden=false;
   choice('Help with the plant',startWatering);
 }));
}

// Help him care for the plant: find, pick up, guide, water, bloom.
let wateringCan=null,waterDrops=null,gardenFlower=null,waterReady=false,waterBoot;
let canMeshes=[],dropParts=[],flowerPetals=[],canDrag=null,canCarry=false,canHeld=false;
let waterAngle=40,waterTarget=40,waterFill=0,waterPouring=false,waterAligned=false,waterGuided=false,bloomAt=-100,canHome={x:-135,y:20,z:95},canAt={...canHome};
// The original rig labels +X as right; Milo's anatomical right is the -X arm.
const wateringSide='left',waterTurn=103.3;
let waterFacing=0;
const waterProgress=angle=>clamp((40-angle)/30);
const waterYaw=angle=>waterFacing+waterTurn*waterProgress(angle);
function aimWater(angle){waterGuided=true;waterTarget=bounded(angle,-10,65);yawTarget=waterYaw(waterTarget);$('choice').hidden=true;}
const wateringStates=()=>chapter.startsWith('water-');
async function prepareWatering(){
 try{
   const find=async name=>{const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing '+name);return o;};
   wateringCan=await find('Watering Can');waterDrops=await find('Water Drops');gardenFlower=await find('Garden Flower');
   for(const name of ['Can Enamel Body','Can Dark Opening','Can Loop Handle','Can Curved Spout','Can Spout Opening'])canMeshes.push(await find(name));
   for(let i=0;i<6;i++)dropParts.push(await find('Water Drop '+i));
   for(let i=0;i<5;i++)flowerPetals.push(await find('Flower Petal '+i));
   await update(wateringCan.id,{visible:false});await update(waterDrops.id,{visible:false});await update(gardenFlower.id,{visible:false});waterReady=true;
 }catch(error){console.error('Watering assets:',error);}
}
waterBoot=prepareWatering();
function pointAtHeight(x,y,height){
 const r=cameraRay(x,y),depth=bounded((height-360)/r.y,120,1700);
 return{x:370+depth*r.x,y:360+depth*r.y,z:790+depth*r.z};
}
function overPlant(x,y){
 const soil=screenPoint(145,4,75),stem=screenPoint(145,70,75);
 const radius=bounded(innerHeight/720*60,38,90);
 // The whole plant silhouette accepts the gesture, not just the tiny soil patch.
 return Math.hypot(x-soil.x,y-bounded(y,stem.y,soil.y))<radius;
}
function guideCan(x,y,drag){
 if(overPlant(x,y)){aimWater(10);return;}
 // Match the hand's projected movement in both axes, keeping the original grab offset.
 const origin=projectedHand({...lastPose,leftX:-48,leftZ:-drag.angle},wateringSide,waterYaw(drag.angle));
 const start=screenPoint(origin.x+10,origin.y,origin.z);
 const target={x:start.x+x-drag.x,y:start.y+y-drag.y};
 let best=Infinity;
 let bestAngle=drag.angle;
 for(let angle=10;angle<=65;angle++){
   const hand=projectedHand({...lastPose,leftX:-48,leftZ:-angle},wateringSide,waterYaw(angle));
   const p=screenPoint(hand.x+10,hand.y,hand.z),distance=Math.hypot(p.x-target.x,p.y-target.y);
   if(distance<best){best=distance;bestAngle=angle;}
 }
 aimWater(bestAngle);
}
async function startWatering(){
 if(chapter!=='named-play')return;await waterBoot;
 if(!waterReady){speak('Could you help me with the plant?',()=>choice('Try again',()=>location.reload()));return;}
 enter('water-intro');reaction='';$('pet').hidden=true;$('five').hidden=true;$('choice').hidden=true;
 speak('You helped me.',()=>speak('Can I help it?',()=>{
   enter('water-find');canAt={...canHome};revealWateringCan();$('water-can').hidden=false;$('spark').hidden=false;
   objective('Give him the watering can');
 }));
}
function carryCan(){
 if(!['water-find','water-carry'].includes(chapter))return;
 restoreFoundObject(wateringCan,canMeshes);canCarry=true;enter('water-carry');$('water-hand').hidden=false;objective('Place the can in his right hand');
}
function revealWateringCan(){revealFoundObject('can',wateringCan,canMeshes,screenPoint(canAt.x+10,canAt.y,canAt.z));}
$('water-can').onfocus=()=>{if(chapter==='water-find'){revealFocus='can';revealWateringCan();}};
function giveCan(){
 if(!['water-find','water-carry'].includes(chapter)||!lastPose)return;
 restoreFoundObject(wateringCan,canMeshes);
 waterFacing=Math.round(yaw/360)*360;yawTarget=waterFacing;
 canCarry=false;canHeld=true;canDrag=null;waterAngle=40;waterTarget=40;waterGuided=false;waterPouring=false;
 $('water-hand').hidden=true;$('water-can').hidden=false;$('spark').hidden=true;enter('water-aim');
 objective('Help him water the plant');speak('Can you help me?');
 $('choice').hidden=true;
}
$('water-hand').onclick=giveCan;
$('water-can').onpointerdown=e=>{
 if(e.button>0||!['water-find','water-carry','water-aim'].includes(chapter))return;
 canDrag={id:e.pointerId,x:e.clientX,y:e.clientY,angle:waterTarget,moved:false,el:e.currentTarget};e.currentTarget.setPointerCapture?.(e.pointerId);
};
$('water-can').onclick=()=>{
 if(canDrag?.moved||chapterTime<suppressCanClickUntil)return;
 if(chapter==='water-find')carryCan();
};
let suppressCanClickUntil=-1;
$('water-can').onkeydown=e=>{
 if(chapter!=='water-aim'||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
 e.preventDefault();aimWater(waterTarget+(['ArrowUp','ArrowRight'].includes(e.key)?10:-10));
};
window.addEventListener('pointermove',e=>{
 if(!canDrag||e.pointerId!==canDrag.id)return;
 const d=canDrag;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<5)return;
 d.moved=true;document.body.dataset.armDragging='true';suppressCanClickUntil=chapterTime+.35;
 if(chapter==='water-find')carryCan();
 if(chapter==='water-carry')canAt=pointAtHeight(e.clientX,e.clientY,120);
 if(chapter==='water-aim'){
   guideCan(e.clientX,e.clientY,d);
 }
});
function releaseCan(e){
 if(!canDrag||(e.pointerId!==undefined&&e.pointerId!==canDrag.id))return;
 const d=canDrag;try{d.el.releasePointerCapture?.(d.id);}catch{}
 canDrag=null;document.body.dataset.armDragging='false';
 if(d.moved){suppressCanClickUntil=chapterTime+.35;
   if(chapter==='water-carry'){
     const h=handScreen(lastPose,wateringSide);
     if(e.type!=='pointercancel'&&Math.hypot((e.clientX??-999)-h.x,(e.clientY??-999)-h.y)<62)giveCan();
     else{canAt={...canHome};canCarry=false;enter('water-find');$('water-hand').hidden=true;objective('Give him the watering can');}
   }
 }
}
window.addEventListener('pointerup',releaseCan);window.addEventListener('pointercancel',e=>releaseCan({...e,type:'pointercancel',pointerId:e.pointerId}));
window.addEventListener('blur',()=>releaseCan({type:'pointercancel'}));
function finishWatering(){
 if(chapter!=='water-aim')return;
 yawTarget=waterFacing;
 enter('water-bloom');bloomAt=chapterTime;waterPouring=false;canDrag=null;document.body.dataset.armDragging='false';
 $('water-can').hidden=true;$('choice').hidden=true;objective('');
 update(gardenFlower.id,{visible:true});
 after(3.8,()=>{
   if(chapter!=='water-bloom')return;enter('water-done');canHeld=false;canAt={x:205,y:20,z:80};
   speak('I did something.',()=>{after(2,startMoth);});
 });
}
function wateringPose(p){
 if(!wateringStates())return p;
 p.headY=13-(yaw-waterFacing)*.5;p.headX=12;
 if(canHeld){
   p.leftX=chapter==='water-aim'?-48*ease((chapterTime-chapterAt)/.8):0;
   p.leftZ=-waterAngle;
   if(chapter==='water-bloom'){
     const g=ease((chapterTime-bloomAt)/3);p.leftZ=-waterAngle*(1-g);p.bodyY-=24*g;p.headX=24*g+10;
   }
 }else if(chapter==='water-done'){p.headX=22;p.bodyY-=24;}
 return p;
}
function wateringTick(dt){
 if(!waterReady)return;
 waterAngle+=(waterTarget-waterAngle)*(1-Math.exp(-dt*9));
 if(chapter==='water-find')revealWateringCan();
 if(wateringStates()&&lastPose){
   const h=projectedHand(lastPose,wateringSide);
   if(canHeld)canAt={...h};
   const ready=chapter==='water-aim'&&waterGuided&&Math.abs(waterAngle-10)<13;
   const tilted=ready?-35:0;
   const facing=180*(1-waterProgress(waterAngle));
   update(wateringCan.id,{position:canAt,rotation:{x:0,y:facing,z:tilted}});
   place($('water-can'),screenPoint(canAt.x+10,canAt.y,canAt.z));
   place($('water-hand'),handScreen(lastPose,wateringSide));
   const local=rotateVector({x:48,y:17,z:0},0,facing,tilted);
   const nozzle={x:canAt.x+local.x,y:canAt.y+local.y,z:canAt.z+local.z};
   waterAligned=chapter==='water-aim'&&Math.hypot((nozzle.x-145)/18,(nozzle.z-75)/13)<1;
   waterPouring=ready&&waterAligned;
   if(chapter==='water-aim'){
     if(waterPouring)waterFill=clamp(waterFill+dt/5.5);
     $('water-can').setAttribute('aria-label',waterAligned?'Keep his hand here to water the plant':'Guide his watering hand. Use arrow keys to move it.');
     if(waterFill>=1)finishWatering();
   }
   update(waterDrops.id,{visible:waterPouring});
   if(waterPouring)for(let i=0;i<dropParts.length;i++){
     const f=(chapterTime*1.15+i/6)%1,fall=f*f;
     update(dropParts[i].id,{position:{x:nozzle.x+Math.sin(i*2.1)*2*f,y:nozzle.y+(2-nozzle.y)*fall,z:nozzle.z+Math.cos(i)*1.5*f},scale:{x:1,y:1+f*.7,z:1}});
   }
   if(chapter==='water-bloom')update(waterDrops.id,{visible:false});
 }
 if(bloomAt>0){
   const t=chapterTime-bloomAt;
   for(let i=0;i<flowerPetals.length;i++){
     const g=ease((t-i*.16)/2.5);
     update(flowerPetals[i].id,{rotation:{x:75*(1-g),y:0,z:i*72},scale:{x:.2+.8*g,y:.4+.6*g,z:1}});
   }
   update(gardenFlower.id,{rotation:{y:25.1,z:Math.sin(chapterTime*1.3)*1.2},scale:{x:1,y:1,z:1}});
 }
}

async function startMoth(){
 if(chapter!=='water-done')return;await twoBoot;
 if(!mothReady){speak('Let’s sit here a little longer.');return;}
 enter('moth-arrival');mothOffered=false;mothWarmth=0;mothPinned=false;
 $('spark').hidden=false;await update(moth.id,{visible:true});
 speak('Oh! What’s that?',()=>speak('It’s so small.',()=>{
   enter('moth-coax');objective('Bring the moth closer');
   after(3,()=>{if(chapter==='moth-coax'){mothOffered=true;mothOfferAt=chapterTime;$('moth-guide').hidden=false;speak('Okay. Slowly.');objective('Keep your light near his hand');}});
 }));
}
$('moth-guide').onclick=()=>{
 if(chapter==='moth-coax'){mothPinned=!mothPinned;$('moth-guide').setAttribute('aria-pressed',String(mothPinned));}
};
function mothLands(){
 enter('moth-landed');objective('');$('moth-guide').hidden=true;$('spark').hidden=true;mothPinned=false;
 speak('I think it likes me.',()=>speak('…What do I do now?',()=>answers([
   ['Stay very still',()=>{
     enter('moth-stay');speak('I can do still. Probably.',()=>choice('Let it rest on the plant',returnMoth));
   }],['Guide it to the plant',returnMoth]
 ])));
}
function returnMoth(){
 if(!['moth-landed','moth-stay'].includes(chapter))return;
 enter('moth-return');mothFlightFrom={...mothAt};
 after(4,()=>{if(chapter==='moth-return'){enter('garden-end');speak('It knows where home is.',()=>{after(5,()=>{$('dialogue').hidden=true;offerCollection();});});$('pet').hidden=false;}});
}
function chapterTwoTick(now){
 const dt=twoLastFrame?Math.min(.05,(now-twoLastFrame)/1000):0;twoLastFrame=now;
 if(document.hidden)return;
 yaw+=(yawTarget-yaw)*(1-Math.exp(-dt*(wateringStates()?3.5:9)));
 if(Math.abs(yaw)<.001)yaw=0;
 update(parts.Robot.id,{rotation:{y:yaw}});
 wateringTick(dt);collectionTick();
 if(chapter==='name-search'){
   const rear=Math.cos((yaw-25.1)*Math.PI/180)<-.6;
   $('back-name').hidden=!rear;place($('back-name'),bodyScreen(0,318,-81));
   place($('turn-milo'),bodyScreen(0,235,0));
 }
 if(chapter==='moth-coax'&&mothOffered&&lastPose){
   const h=handScreen(lastPose,'right');place($('moth-guide'),h);
   const close=mothPinned||Math.hypot(pointerX-h.x,pointerY-h.y)<80;
   if(close)mothWarmth=clamp(mothWarmth+dt/3.2);
   if(mothPinned){document.documentElement.style.setProperty('--mx',h.x+'px');document.documentElement.style.setProperty('--my',h.y+'px');}
   if(mothWarmth===1)mothLands();
 }
 if(mothReady&&(chapter.startsWith('moth-')||chapter==='garden-end')){
   const t=chapterTime-chapterAt,size=bounded(innerWidth/600,.62,1);let flap=35,goal;
   if(['moth-arrival','moth-coax'].includes(chapter)){
     const orbit={x:145+Math.sin(chapterTime*1.2)*23,y:90+Math.sin(chapterTime*1.6)*14,z:75+Math.cos(chapterTime)*15};
     const hand=lastPose?projectedHand(lastPose,'right'):{x:140,y:220,z:20},g=ease(mothWarmth);
     goal={x:orbit.x+(hand.x-orbit.x)*g,y:orbit.y+(hand.y+14*size-orbit.y)*g,z:orbit.z+(hand.z-orbit.z)*g};
   }else if(['moth-landed','moth-stay'].includes(chapter)){
     const h=projectedHand(lastPose,'right');goal={x:h.x,y:h.y+14*size,z:h.z};flap=3;
   }else if(chapter==='moth-return'){
     const g=ease(t/3.5),a=mothFlightFrom;goal={x:a.x+(145-a.x)*g,y:a.y+(82-a.y)*g+Math.sin(g*Math.PI)*25,z:a.z+(75-a.z)*g};
   }else{goal={x:145,y:82,z:75};flap=2;}
   mothAt=goal;update(moth.id,{position:goal,scale:{x:size,y:size,z:size},rotation:{y:25,z:Math.sin(chapterTime*1.4)*(flap>5?5:1)}});
   const flutter=Math.sin(chapterTime*(flap>5?24:2))*flap;
   update(mothLeft.id,{rotation:{y:-(25+flutter)}});update(mothRight.id,{rotation:{y:25+flutter}});
 }
}
function chapterTwoPose(p){
 if(namingStates()){
   const stand=ease((chapterTime-standAt)/2.8);p.bodyY-=82*(1-stand);p.leftX-=40*(1-stand);p.rightX-=40*(1-stand);
   for(const side of [-1,1])write('Robot Leg Pivot '+side,{position:{y:20+80*stand},rotation:{x:-78*(1-stand),y:0,z:0}});
 }
 if(chapter==='name-search'||chapter==='name-found'){p.headX=0;p.headY=0;p.headZ=0;}
 const happy=chapterTime-happyAt;
 if(happy>=0&&happy<3.5){
   const envelope=pulse(happy,0,.35,2.4,3.4);p.bodyY+=Math.abs(Math.sin(happy*5))*6*envelope;
   p.headZ+=Math.sin(happy*4)*5*envelope;p.leftZ-=envelope*45;p.rightZ+=envelope*(55+Math.sin(happy*9)*12);
 }
 if(chapter==='moth-arrival'){
   const t=chapterTime-chapterAt,g=pulse(t,0,.2,.6,1.2);p.headZ-=g*8;p.rightZ+=g*18;p.leftZ-=g*18;
 }
 if(['moth-coax','moth-landed','moth-stay','moth-return'].includes(chapter)&&mothOffered){
   const offer=chapter==='moth-return'?1-ease((chapterTime-chapterAt)/3):ease((chapterTime-mothOfferAt)/1.2);
   p.rightZ=55*offer;p.elbowZ=75*offer;p.rightX=0;p.elbowY=0;p.headY=10*offer;p.headX=6*offer;
 }
 for(const side of ['left','right']){
   const a=arms[side],held=armDrag?.side===side&&armDrag.moved;
   const weight=held?1:1-ease((chapterTime-a.releaseAt)/1.15);
   if(weight>0){
     const key=side==='right'?'rightZ':'leftZ';p[key]=p[key]*(1-weight)+a.angle*weight;
     if(side==='right'){p.elbowZ*=1-weight;p.elbowY*=1-weight;}
   }
 }
 p=wateringPose(p);p=collectionPose(p);
 lastPose={...p};refreshArmTargets(p);return p;
}
