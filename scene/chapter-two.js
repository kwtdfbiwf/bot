// Naming, physical play, copying, and the moth share the opening's clock/rig.
let chosenName='Milo',yaw=0,yawTarget=0,lastPose=null,twoLastFrame=0;
let armDrag=null,turnDrag=null,suppressArmClickUntil=-1,armDialogueAt=-100,armTouches=0;
const arms={left:{angle:0,releaseAt:-100,releaseFrom:0},right:{angle:0,releaseAt:-100,releaseFrom:0}};
let standAt=-100,happyAt=-100,nameConfirmed=false,drawPath=null,copyGesture='',copyAt=-100,copyStep=0,copyPoints=[];
let moth=null,mothLeft=null,mothRight=null,mothOffered=false,mothWarmth=0,mothPinned=false,mothAt={x:145,y:85,z:75},mothFlightFrom=null;
let mothReady=false,twoReady=false,mothOfferAt=0;
try{chosenName=localStorage.getItem('milo-chosen-name')||'Milo';}catch{}
const freeArms=()=>['play','end','named-play','garden-end'].includes(chapter);
const namingStates=()=>['name-intro','name-search','name-found','nickname','name-happy','named-play','copy-you','copy-demo','copy-milo','copy-done','moth-arrival','moth-coax','moth-landed','moth-stay','moth-return','garden-end'].includes(chapter);
const bounded=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function worldPoint(p){return rotateVector(p,0,yaw,0);}
function bodyScreen(x,y,z){const p=worldPoint({x,y,z});return screenPoint(p.x,p.y,p.z);}
function projectedHand(p,side='right'){
 if(side==='right'){
   const q=rotateVector({x:5,y:-57,z:7},0,p.elbowY,p.elbowZ);
   const r=rotateVector({x:8+q.x,y:-43+q.y,z:q.z},p.rightX,0,p.rightZ);
   return worldPoint({x:66+r.x,y:204+p.bodyY+r.y,z:r.z});
 }
 const r=rotateVector({x:-13,y:-100,z:7},p.leftX,0,p.leftZ);
 return worldPoint({x:-66+r.x,y:204+p.bodyY+r.y,z:r.z});
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
   const down=['end','garden-end'].includes(chapter)?82:0;
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
window.addEventListener('blur',()=>{releaseArm({});turnDrag=null;drawPath=null;});

async function prepareChapterTwo(){
 try{
   moth=await spline.findObjectByName('Garden Moth');mothLeft=await spline.findObjectByName('Moth Wing Left');mothRight=await spline.findObjectByName('Moth Wing Right');
   if(!moth||!mothLeft||!mothRight)throw new Error('Missing moth model');
   await update(moth.id,{visible:false});mothReady=true;twoReady=true;
 }catch(error){console.error('Chapter two assets:',error);}
}
const twoBoot=prepareChapterTwo();
function answers(items){
 $('choice').hidden=true;hint('');const box=$('answers');box.replaceChildren();
 for(const [text,fn] of items){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{box.hidden=true;fn();};box.append(b);}
 box.hidden=false;
}
function beginNaming(){
 if(chapter!=='end')return;
 enter('name-intro');standAt=chapterTime;reaction='';$('pet').hidden=true;$('five').hidden=true;
 speak('You have a name, '+visitor+'.',()=>speak('Do I have one?',()=>{
   enter('name-search');objective('Find his name');hint('Drag him sideways to look around.');
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
window.addEventListener('resize',()=>{
 if(chapter==='copy-milo'){
   const cx=innerWidth*.5,cy=innerHeight*.32,r=Math.min(90,innerWidth*.22);
   copyPoints=[{x:cx-r,y:cy+30},{x:cx+r,y:cy+30},{x:cx,y:cy-65}];
   place($('copy-target'),copyPoints[Math.min(copyStep,2)]);
 }
});
$('back-name').onclick=()=>{
 if(chapter!=='name-search'||Math.cos((yaw-25.1)*Math.PI/180)>-.6)return;
 enter('name-found');objective('');hint('');yawTarget=Math.round(yaw/360)*360;turnDrag=null;$('turn-milo').hidden=true;$('back-name').hidden=true;
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
   choice('Play together',startCopyGame);
 }));
}

function showTrace(points){$('trail').hidden=false;$('trail-line').setAttribute('points',points.map(p=>Math.round(p.x)+','+Math.round(p.y)).join(' '));}
function clearTrace(){drawPath=null;$('trail').hidden=true;$('trail-line').setAttribute('points','');}
function startCopyGame(){
 if(chapter!=='named-play')return;enter('copy-you');reaction='';$('pet').hidden=true;$('five').hidden=true;
 speak('Show me something. I’ll try.',()=>{
   objective('Draw a circle with your light');choice('Show him a circle',()=>acceptGesture('circle'));
   hint('Click and draw in the empty space.');
 });
 $('spark').hidden=false;
}
window.addEventListener('pointerdown',e=>{
 if(chapter!=='copy-you'||e.target.id!=='air')return;
 drawPath=[{x:e.clientX,y:e.clientY}];showTrace(drawPath);e.target.setPointerCapture?.(e.pointerId);
});
window.addEventListener('pointermove',e=>{
 if(!drawPath||chapter!=='copy-you')return;const p=drawPath[drawPath.length-1];
 if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>5&&drawPath.length<240){drawPath.push({x:e.clientX,y:e.clientY});showTrace(drawPath);}
});
window.addEventListener('pointerup',()=>{
 if(!drawPath||chapter!=='copy-you')return;
 const points=drawPath;drawPath=null;
 if(points.length<10){clearTrace();return;}
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);
 let length=0,turns=0,lastSign=0;
 for(let i=1;i<points.length;i++){
   const dx=points[i].x-points[i-1].x,dy=points[i].y-points[i-1].y;length+=Math.hypot(dx,dy);
   if(Math.abs(dx)>5){const sign=Math.sign(dx);if(lastSign&&lastSign!==sign)turns++;lastSign=sign;}
 }
 const closed=Math.hypot(points[0].x-points.at(-1).x,points[0].y-points.at(-1).y)<Math.hypot(w,h)*.4;
 if(w>45&&h>45&&length>160&&closed)acceptGesture('circle');
 else if(turns>=3&&w>50&&h>30&&length>140)acceptGesture('zigzag');
 else{ speak('Was that… a potato? Let me try again.');after(3,clearTrace); }
});
function acceptGesture(kind){
 if(chapter!=='copy-you')return;clearTrace();copyGesture=kind;copyAt=chapterTime;enter('copy-demo');objective('');hint('Watch him try.');$('choice').hidden=true;
 if(kind==='circle'){
   const center={x:innerWidth*.28,y:innerHeight*.35},points=[];
   for(let i=0;i<=36;i++){const a=i/36*Math.PI*2;points.push({x:center.x+Math.cos(a)*45,y:center.y+Math.sin(a)*45});}showTrace(points);
 }else showTrace([{x:innerWidth*.2,y:innerHeight*.25},{x:innerWidth*.35,y:innerHeight*.35},{x:innerWidth*.2,y:innerHeight*.45},{x:innerWidth*.35,y:innerHeight*.55}]);
 speak(kind==='circle'?'Round. I can do round.':'That one made my neck go funny.');
 after(3.5,()=>{
   if(chapter!=='copy-demo')return;clearTrace();enter('copy-you');
   objective(kind==='circle'?'Try a zigzag, or let him lead':'Let him show you a pattern');
   choice('Your turn, '+chosenName,startMiloPattern);
 });
}
function startMiloPattern(){
 if(chapter!=='copy-you')return;enter('copy-milo');objective('Follow his little pattern');clearTrace();copyStep=0;
 const cx=innerWidth*.5,cy=innerHeight*.32,r=Math.min(90,innerWidth*.22);
 copyPoints=[{x:cx-r,y:cy+30},{x:cx+r,y:cy+30},{x:cx,y:cy-65}];
 speak('My turn. Follow me.');$('copy-target').hidden=false;place($('copy-target'),copyPoints[0]);
}
$('copy-target').onclick=()=>{
 if(chapter!=='copy-milo')return;copyStep++;
 if(copyStep<copyPoints.length){place($('copy-target'),copyPoints[copyStep]);showTrace(copyPoints.slice(0,copyStep+1));return;}
 $('copy-target').hidden=true;clearTrace();objective('');enter('copy-done');
 speak('You did it. We’re good at this.',()=>choice('Stay with him',startMoth));
};

async function startMoth(){
 if(chapter!=='copy-done')return;await twoBoot;
 if(!mothReady){speak('Let’s sit here a little longer.');return;}
 enter('moth-arrival');mothOffered=false;mothWarmth=0;mothPinned=false;
 $('spark').hidden=false;await update(moth.id,{visible:true});
 speak('Oh! What’s that?',()=>speak('It’s so small.',()=>{
   enter('moth-coax');objective('Bring the moth closer');hint('Move your light slowly toward his hand.');
   after(3,()=>{if(chapter==='moth-coax'){mothOffered=true;mothOfferAt=chapterTime;$('moth-guide').hidden=false;speak('Okay. Slowly.');objective('Keep your light near his hand');}});
 }));
}
$('moth-guide').onclick=()=>{
 if(chapter==='moth-coax'){mothPinned=!mothPinned;$('moth-guide').setAttribute('aria-pressed',String(mothPinned));}
};
function mothLands(){
 enter('moth-landed');objective('');hint('');$('moth-guide').hidden=true;$('spark').hidden=true;mothPinned=false;
 speak('I think it likes me.',()=>speak('…What do I do now?',()=>answers([
   ['Stay very still',()=>{
     enter('moth-stay');speak('I can do still. Probably.',()=>choice('Let it rest on the plant',returnMoth));
   }],['Guide it to the plant',returnMoth]
 ])));
}
function returnMoth(){
 if(!['moth-landed','moth-stay'].includes(chapter))return;
 enter('moth-return');mothFlightFrom={...mothAt};
 after(4,()=>{if(chapter==='moth-return'){enter('garden-end');speak('It knows where home is.',()=>{after(5,()=>{$('dialogue').hidden=true;});});$('pet').hidden=false;}});
}
function chapterTwoTick(now){
 const dt=twoLastFrame?Math.min(.05,(now-twoLastFrame)/1000):0;twoLastFrame=now;
 if(document.hidden)return;
 yaw+=(yawTarget-yaw)*(1-Math.exp(-dt*9));
 if(Math.abs(yaw)<.001)yaw=0;
 update(parts.Robot.id,{rotation:{y:yaw}});
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
     const g=ease(t/3.5),a=mothFlightFrom;goal={x:a.x+(145-a.x)*g,y:a.y+(64-a.y)*g+Math.sin(g*Math.PI)*25,z:a.z+(75-a.z)*g};
   }else{goal={x:145,y:64,z:75};flap=2;}
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
 if(chapter==='copy-demo'){
   const t=chapterTime-copyAt,g=pulse(t,0,.3,2.7,3.4);
   p.headX=(copyGesture==='circle'?Math.sin(t*3)*9:Math.sin(t*7)*5)*g;
   p.headY=(copyGesture==='circle'?Math.cos(t*3)*13:Math.sin(t*4)*18)*g;
 }
 if(chapter==='copy-milo'){
   const point=copyPoints[Math.min(copyStep,2)];p.headY=(point.x/innerWidth-.5)*40;p.headX=(point.y/innerHeight-.5)*20;
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
 lastPose={...p};refreshArmTargets(p);return p;
}
