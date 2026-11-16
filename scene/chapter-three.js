// His first keepsake. One clock, cached scene objects, no inventory screen.
let blueCap=null,capEnamel=null,keepsakeBox=null,collectionHatch=null,collectionLid=null,collectionReady=false;
let capAt={x:-235,y:5,z:100},capFrom=null,boxAt={x:-230,y:0,z:70},boxFrom=null;
let collectionSettled=false,capInBox=false,capHeld=false,collectionDrag=null,collectionClickAfter=-100,collectionHappyAt=-100,collectionRestAt=-100;
const collectionStates=()=>chapter.startsWith('collection-');
async function prepareCollection(){
 try{
   const find=async name=>{const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing '+name);return o;};
   blueCap=await find('Blue Bottle Cap');capEnamel=await find('Blue Cap Enamel');keepsakeBox=await find('Keepsake Box');
   collectionHatch=await find('Collection Hatch');collectionLid=await find('Collection Hatch Lid Pivot');
   for(const o of [blueCap,keepsakeBox,collectionHatch])await update(o.id,{visible:false});
   collectionReady=true;
 }catch(error){console.error('Collection assets:',error);}
}
const collectionBoot=prepareCollection();
function offerCollection(){choice('Look a little further',beginCollection);}
async function beginCollection(){
 if(chapter!=='garden-end')return;await collectionBoot;
 if(!collectionReady){speak('I thought I saw something.',()=>choice('Try again',()=>location.reload()));return;}
 enter('collection-find');reaction='';$('pet').hidden=true;$('five').hidden=true;$('choice').hidden=true;
 $('spark').hidden=false;$('collect-cap').hidden=false;capAt={x:-235,y:5,z:100};
 update(blueCap.id,{visible:true});update(capEnamel.id,{material:{alpha:22}});
 objective('Find the blue glimmer');
 speak('Something over there.');
}
function carryKeepsake(){
 if(chapter!=='collection-find')return;enter('collection-carry');
 update(capEnamel.id,{material:{alpha:100}});$('collect-hand').hidden=false;
 objective('Bring it to his hand');
}
function giveKeepsake(){
 if(!['collection-find','collection-carry'].includes(chapter)||!lastPose)return;
 enter('collection-reflex');capHeld=true;collectionDrag=null;
 $('collect-cap').hidden=true;$('collect-hand').hidden=true;$('spark').hidden=true;objective('');
 update(capEnamel.id,{material:{alpha:100}});update(collectionHatch.id,{visible:true});
 speak('Item collected.');
 after(2.3,()=>{
   if(chapter!=='collection-reflex')return;
   enter('collection-notice');speak('It’s blue.',()=>{after(.8,()=>speak('Can I keep it?',()=>answers([
     ['Of course.',keepKeepsake],['You can choose.',keepKeepsake]
   ])));});
 });
}
function keepKeepsake(){
 if(chapter!=='collection-notice')return;
 enter('collection-box-find');collectionHappyAt=chapterTime;$('spark').hidden=false;$('collect-box').hidden=false;
 update(keepsakeBox.id,{visible:true});objective('Find somewhere to keep it safe');
 speak('I’d like to keep this one.');
}
function carryKeepsakeBox(){
 if(chapter!=='collection-box-find')return;
 enter('collection-box-carry');$('collect-place').hidden=false;
 objective('Put his box beside the garden');
}
function placeKeepsakeBox(){
 if(!['collection-box-find','collection-box-carry'].includes(chapter))return;
 enter('collection-box-settle');collectionDrag=null;boxFrom={...boxAt};
 $('collect-box').hidden=true;$('collect-place').hidden=true;$('spark').hidden=true;objective('');
 after(1.1,()=>{
   if(chapter!=='collection-box-settle')return;
   enter('collection-store');capFrom={...capAt};capHeld=false;
   speak('This can be its place.');
   after(2.6,()=>{
     if(chapter!=='collection-store')return;capInBox=true;enter('collection-end');$('collect-cap').setAttribute('aria-label','Look at his first keepsake');
     speak('One thing.',()=>speak('I’d like to find another.',()=>{collectionSettled=true;$('collect-cap').hidden=false;$('pet').hidden=false;choice('Sit with him',restWithCollection);}));
   });
 });
}
function restWithCollection(){
 if(chapter!=='collection-end')return;
 enter('collection-rest');collectionRestAt=chapterTime;$('choice').hidden=true;
 speak('I’ll look after it.',()=>{after(4,()=>{$('dialogue').hidden=true;});});
}
$('collect-cap').onclick=()=>{
 if(chapterTime<collectionClickAfter)return;
 if(chapter==='collection-find')carryKeepsake();
 else if(collectionSettled&&capInBox&&['collection-end','collection-rest'].includes(chapter))speak('The blue one. My first one.');
};
$('collect-cap').onfocus=()=>{if(chapter==='collection-find')update(capEnamel.id,{material:{alpha:100}});};
$('collect-hand').onclick=giveKeepsake;
$('collect-box').onclick=()=>{if(chapterTime>=collectionClickAfter)carryKeepsakeBox();};
$('collect-place').onclick=placeKeepsakeBox;
function startCollectionDrag(e,kind){
 const available=kind==='cap'?['collection-find','collection-carry']:['collection-box-find','collection-box-carry'];
 if(e.button>0||!available.includes(chapter))return;
 collectionDrag={kind,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,el:e.currentTarget};e.currentTarget.setPointerCapture?.(e.pointerId);
}
$('collect-cap').onpointerdown=e=>startCollectionDrag(e,'cap');
$('collect-box').onpointerdown=e=>startCollectionDrag(e,'box');
window.addEventListener('pointermove',e=>{
 if(chapter==='collection-find'&&collectionReady){
   const p=screenPoint(capAt.x,capAt.y,capAt.z),distance=Math.hypot(e.clientX-p.x,e.clientY-p.y);
   update(capEnamel.id,{material:{alpha:Math.max(22,100-distance*.65)}});
 }
 const d=collectionDrag;
 if(d&&e.pointerId===d.id){
   if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<5)return;
   d.moved=true;collectionClickAfter=chapterTime+.35;
   if(d.kind==='cap')carryKeepsake();else carryKeepsakeBox();
 }
 if(chapter==='collection-carry')capAt=pointAtHeight(e.clientX+18,e.clientY-18,160);
 if(chapter==='collection-box-carry'&&d?.kind==='box')boxAt=pointAtHeight(e.clientX,e.clientY,30);
});
function releaseCollectionDrag(e,cancelled=false){
 const d=collectionDrag;if(!d||(e.pointerId!==undefined&&e.pointerId!==d.id))return;
 try{d.el.releasePointerCapture?.(d.id);}catch{}collectionDrag=null;
 if(!d.moved)return;collectionClickAfter=chapterTime+.35;
 const target=d.kind==='cap'?handScreen(lastPose,'right'):screenPoint(-135,4,80);
 const close=Math.hypot((e.clientX??-999)-target.x,(e.clientY??-999)-target.y)<85;
 if(!cancelled&&close){if(d.kind==='cap')giveKeepsake();else placeKeepsakeBox();}
 else if(d.kind==='cap'){
   enter('collection-find');capAt={x:-235,y:5,z:100};$('collect-hand').hidden=true;objective('Find the blue glimmer');
 }else{
   enter('collection-box-find');boxAt={x:-230,y:0,z:70};$('collect-place').hidden=true;objective('Find somewhere to keep it safe');
 }
}
window.addEventListener('pointerup',e=>releaseCollectionDrag(e));
window.addEventListener('pointercancel',e=>releaseCollectionDrag(e,true));
window.addEventListener('blur',()=>releaseCollectionDrag({},true));
function collectionPose(p){
 if(!collectionStates())return p;
 const elapsed=chapterTime-chapterAt;
 p.headX=8;p.headY=-10;
 if(chapter==='collection-reflex'){
   const g=pulse(elapsed,0,.8,1.2,2.2);
   p.rightZ=55-45*g;p.elbowZ=75-185*g;p.rightX=-30*g;p.elbowY=0;
   p.headX=14;p.headY=8;
 }else if(capHeld){p.rightZ=55;p.elbowZ=75;p.rightX=0;p.elbowY=0;p.headY=12;p.headZ=5;}
 if(chapter==='collection-store'){
   const g=ease(elapsed/2.3);p.rightZ=55*(1-g);p.elbowZ=75*(1-g);p.headX=18;p.headY=-12;
 }
 const happy=chapterTime-collectionHappyAt;
 if(happy>=0&&happy<2.8){const g=pulse(happy,0,.3,1.8,2.7);p.headZ+=Math.sin(happy*4)*4*g;p.leftZ-=18*g;}
 if(chapter==='collection-rest'){
   const g=ease((chapterTime-collectionRestAt)/3);p.bodyY-=82*g;p.headX=12;p.leftX-=40*g;p.rightX-=40*g;
   for(const side of [-1,1])write('Robot Leg Pivot '+side,{position:{y:100-80*g},rotation:{x:-78*g,y:0,z:0}});
 }
 return p;
}
function collectionTick(){
 if(!collectionReady||!collectionStates()||!lastPose)return;
 const elapsed=chapterTime-chapterAt;
 if(capHeld){
   const h=projectedHand(lastPose,'right');capAt={x:h.x,y:h.y+10,z:h.z+7};
 }
 if(chapter==='collection-box-settle'){
   const g=ease(elapsed/1);boxAt={x:boxFrom.x+(-135-boxFrom.x)*g,y:boxFrom.y*(1-g),z:boxFrom.z+(80-boxFrom.z)*g};
 }
 if(chapter==='collection-store'){
   const g=ease(elapsed/2.3);capAt={x:capFrom.x+(-135-capFrom.x)*g,y:capFrom.y+(7-capFrom.y)*g+Math.sin(g*Math.PI)*20,z:capFrom.z+(80-capFrom.z)*g};
 }
 if(capInBox)capAt={x:-135,y:7,z:80};
 update(blueCap.id,{position:capAt,rotation:{x:capHeld?25:0,y:capHeld?chapterTime*18:0,z:capHeld?8:0}});
 update(keepsakeBox.id,{position:boxAt});
 const open=chapter==='collection-reflex'?pulse(elapsed,0,.5,1.2,2.2):0;
 update(collectionLid.id,{rotation:{x:open?-95*open:0}});
 place($('collect-cap'),screenPoint(capAt.x,capAt.y,capAt.z));
 place($('collect-hand'),handScreen(lastPose,'right'));
 place($('collect-box'),screenPoint(boxAt.x,boxAt.y+14,boxAt.z));
 place($('collect-place'),screenPoint(-135,4,80));
}
