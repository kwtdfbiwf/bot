// The first piece of furniture. Discover, wipe local dust, make a place for it.
let cozyShelf=null,shelfDustRoot=null,shelfBook=null,shelfReady=false;
let shelfMeshes=[],shelfDust=[],shelfAt={x:-235,y:0,z:-30},shelfFrom=null,shelfGoal=null,shelfScale=1,shelfFromScale=1;
let shelfDrag=null,shelfWipe=null,shelfClickAfter=-100,shelfFirstWipe=false,shelfKeyboardRow=0;
const shelfHome={x:-235,y:0,z:-30},shelfYaw=15;
const shelfStates=()=>chapter.startsWith('shelf-');
function shelfHomePosition(){
 const foot=screenPoint(shelfHome.x,0,shelfHome.z);
 return foot.x<78?pointAtHeight(78,foot.y,0):{...shelfHome};
}
function shelfPoint(x,y,z){
 const q=rotateVector({x:x*shelfScale,y:y*shelfScale,z:z*shelfScale},0,shelfYaw,0);
 return screenPoint(shelfAt.x+q.x,shelfAt.y+q.y,shelfAt.z+q.z);
}
function shelfInspectLayout(){
 return {at:pointAtHeight(innerWidth*.26,innerHeight*.79,0),scale:Math.min(1.8,innerWidth/250)};
}
function layoutShelfSearch(){
 if(chapter==='shelf-find'){shelfAt=pointAtHeight(innerWidth*.84,innerHeight*.66,0);shelfScale=1;}
 else if(['shelf-cleaning','shelf-ready'].includes(chapter)){
   const p=shelfInspectLayout();shelfAt=p.at;shelfScale=p.scale;
 }
}
window.addEventListener('resize',layoutShelfSearch);
async function prepareShelf(){
 try{
   const find=async name=>{const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing '+name);return o;};
   cozyShelf=await find('Cozy Shelf');shelfDustRoot=await find('Cozy Shelf Dust');shelfBook=await find('Cozy Shelf Book');
   await update(cozyShelf.id,{visible:false});await update(shelfDustRoot.id,{visible:false});
   const frame=['Top','Middle','Bottom','Front Left','Front Right','Back Left','Back Right','Back Rail'];
   const colors={},textured=[];
   for(const name of frame){const o=await find('Cozy Shelf '+name);shelfMeshes.push(o);colors[o.name]=['#936945'];textured.push(o.name);}
   for(const x of [-46,46])for(const y of [65,116]){const o=await find('Cozy Shelf Dowel '+x+' '+y);shelfMeshes.push(o);colors[o.name]=['#735237'];}
   for(const name of ['Lower Cover','Upper Cover','Pages','Spine','Page Seam 0','Page Seam 1','Page Seam 2']){
     const o=await find('Cozy Book '+name);shelfMeshes.push(o);colors[o.name]=[name==='Pages'?'#d5c6a4':name.startsWith('Page Seam')?'#b5a783':'#74836a'];
   }
   for(let i=0;i<shelfDustLayout.length;i++)shelfDust.push({object:await find('Shelf Dust '+i),point:shelfDustLayout[i],clean:0});
   await prepareSearchLight(cozyShelf,shelfMeshes,{colors,textured});shelfReady=true;
 }catch(error){console.error('Shelf assets:',error);}
}
const shelfBoot=prepareShelf();
function offerShelf(){if(chapter==='collection-end')choice('Look a little further',startShelf);}
async function startShelf(){
 if(chapter!=='collection-end')return;await shelfBoot;
 if(!shelfReady){speak('There’s something over there.',()=>choice('Try again',startShelf));return;}
 enter('shelf-find');reaction='';$('pet').hidden=true;$('five').hidden=true;$('collect-cap').hidden=true;$('choice').hidden=true;
 $('spark').hidden=false;$('shelf-find').hidden=false;layoutShelfSearch();
 objective('Find what '+chosenName+' sees');speak('Something bigger, this time.');
 revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));
}
$('shelf-find').onfocus=()=>{if(chapter==='shelf-find'){revealFocus='shelf';revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));}};
$('shelf-find').onclick=()=>{
 if(chapter!=='shelf-find')return;
 restoreFoundObject(cozyShelf,shelfMeshes);enter('shelf-arrive');shelfFrom={...shelfAt};shelfFromScale=shelfScale;shelfGoal=shelfInspectLayout();
 $('shelf-find').hidden=true;$('spark').hidden=true;objective('');
 update(shelfDustRoot.id,{visible:true});
 speak('A little shelf.',()=>speak('It’s a bit dusty.'));
 after(2,()=>{if(chapter==='shelf-arrive'){enter('shelf-cleaning');$('shelf-clean').hidden=false;$('shelf-clean').setAttribute('aria-label','Clean the dusty shelf');objective('Clean the shelf');}});
};
function distanceToStroke(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1));
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
function wipeShelf(a,b){
 if(chapter!=='shelf-cleaning'||Math.hypot(b.x-a.x,b.y-a.y)<2)return;
 let changed=false;
 const brush=bounded(innerHeight/720*23,18,28);
 for(const dust of shelfDust){
   if(dust.clean>=1)continue;
   const p=shelfPoint(dust.point.x,dust.point.y,dust.point.z),near=distanceToStroke(p,a,b);
   if(near>=brush)continue;
   dust.clean=clamp(dust.clean+(1-near/brush)*Math.min(1,Math.hypot(b.x-a.x,b.y-a.y)/18));changed=true;
   update(dust.object.id,{visible:dust.clean<.98,material:{layers:[{type:'texture',alpha:85*(1-dust.clean)}]}});
 }
 if(changed&&!shelfFirstWipe){shelfFirstWipe=true;speak('Oh. That’s the wood underneath.');}
 if(shelfDust.every(d=>d.clean>=.9))finishShelfCleaning();
}
function finishShelfCleaning(){
 if(chapter!=='shelf-cleaning')return;
 shelfWipe=null;document.body.dataset.shelfWiping='false';
 for(const d of shelfDust){d.clean=1;update(d.object.id,{visible:false});}
 update(shelfDustRoot.id,{visible:false});enter('shelf-ready');objective('Make a place for the shelf');
 $('shelf-clean').setAttribute('aria-label','Bring the clean shelf beside us');
 speak('There’s a book already.',()=>speak('And room for more.',()=>{if(chapter==='shelf-ready')choice('Put it beside us',placeShelf);}));
}
$('shelf-clean').onpointerdown=e=>{
 if(e.button>0||!['shelf-cleaning','shelf-ready','shelf-carry'].includes(chapter))return;
 e.currentTarget.setPointerCapture?.(e.pointerId);
 if(chapter==='shelf-cleaning'){
   shelfWipe={id:e.pointerId,x:e.clientX,y:e.clientY,el:e.currentTarget};document.body.dataset.shelfWiping='true';
 }else{
   const foot=shelfPoint(0,0,0);shelfDrag={id:e.pointerId,x:e.clientX,y:e.clientY,offsetX:foot.x-e.clientX,offsetY:foot.y-e.clientY,moved:false,el:e.currentTarget};
 }
};
$('shelf-clean').onclick=()=>{if(chapter==='shelf-ready'&&chapterTime>shelfClickAfter)choice('Put it beside us',placeShelf);};
$('shelf-clean').onkeydown=e=>{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(e.key))return;
 e.preventDefault();
 if(chapter==='shelf-cleaning'){
   // Target an actual dusty region at any viewport size, using the same
   // projected surface brush as a pointer stroke.
   const remaining=shelfDust.filter(d=>d.clean<.9),dust=remaining[shelfKeyboardRow++%remaining.length];
   if(dust){const p=shelfPoint(dust.point.x,dust.point.y,dust.point.z);wipeShelf({x:p.x-24,y:p.y},{x:p.x+24,y:p.y});}
 }else if(['shelf-ready','shelf-carry'].includes(chapter)&&['Enter',' '].includes(e.key))placeShelf();
};
window.addEventListener('pointermove',e=>{
 if(shelfWipe&&e.pointerId===shelfWipe.id){
   const a={x:shelfWipe.x,y:shelfWipe.y},b={x:e.clientX,y:e.clientY};wipeShelf(a,b);
   if(shelfWipe){shelfWipe.x=b.x;shelfWipe.y=b.y;}
 }
 if(shelfDrag&&e.pointerId===shelfDrag.id){
   const d=shelfDrag;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<5)return;
   if(!d.moved){d.moved=true;enter('shelf-carry');$('choice').hidden=true;$('shelf-place').hidden=false;}
   shelfAt=pointAtHeight(bounded(e.clientX+d.offsetX,45,innerWidth-45),bounded(e.clientY+d.offsetY,innerHeight*.53,innerHeight*.9),0);
   shelfClickAfter=chapterTime+.4;
 }
});
function releaseShelf(e,cancelled=false){
 if(shelfWipe&&(e.pointerId===undefined||e.pointerId===shelfWipe.id)){
   try{shelfWipe.el.releasePointerCapture?.(shelfWipe.id);}catch{}shelfWipe=null;document.body.dataset.shelfWiping='false';
 }
 const d=shelfDrag;if(!d||(e.pointerId!==undefined&&e.pointerId!==d.id))return;
 try{d.el.releasePointerCapture?.(d.id);}catch{}shelfDrag=null;
 if(!d.moved)return;
 const home=shelfHomePosition(),target=screenPoint(home.x,home.y+35,home.z);
 if(!cancelled&&Math.hypot((e.clientX??-999)-target.x,(e.clientY??-999)-target.y)<110)placeShelf();
 else{
   enter('shelf-ready');layoutShelfSearch();$('shelf-place').hidden=true;choice('Put it beside us',placeShelf);
 }
}
window.addEventListener('pointerup',e=>releaseShelf(e));
window.addEventListener('pointercancel',e=>releaseShelf(e,true));
window.addEventListener('blur',()=>releaseShelf({},true));
function placeShelf(){
 if(!['shelf-ready','shelf-carry'].includes(chapter))return;
 shelfDrag=null;enter('shelf-settle');shelfFrom={...shelfAt};shelfFromScale=shelfScale;
 $('shelf-clean').hidden=true;$('shelf-place').hidden=true;$('choice').hidden=true;objective('');
 after(2.2,()=>{
   if(chapter!=='shelf-settle')return;
   enter('shelf-home');$('shelf-book').hidden=false;$('collect-cap').hidden=false;
   speak('Our little corner.',()=>speak('We can put the next thing here.',()=>{$('pet').hidden=false;after(4,()=>{$('dialogue').hidden=true;});}));
 });
}
$('shelf-place').onclick=placeShelf;
$('shelf-book').onclick=()=>{if(chapter==='shelf-home')speak('Maybe we can read it together.');};
function shelfPose(p){
 if(!shelfStates())return p;
 p.headX=8;p.headY=-12;
 if(chapter==='shelf-arrive'){const g=pulse(chapterTime-chapterAt,0,.5,1.3,2);p.leftZ-=25*g;p.headZ-=3*g;}
 return p;
}
function shelfTick(dt){
 if(!shelfReady||!shelfStates())return;
 const elapsed=chapterTime-chapterAt;
 if(chapter==='shelf-find')revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));
 else if(chapter==='shelf-arrive'){
   const g=ease(elapsed/1.8),goal=shelfGoal.at;
   shelfAt={x:shelfFrom.x+(goal.x-shelfFrom.x)*g,y:0,z:shelfFrom.z+(goal.z-shelfFrom.z)*g};shelfScale=shelfFromScale+(shelfGoal.scale-shelfFromScale)*g;
 }else if(chapter==='shelf-settle'){
   const g=ease(elapsed/2),home=shelfHomePosition();shelfAt={x:shelfFrom.x+(home.x-shelfFrom.x)*g,y:0,z:shelfFrom.z+(home.z-shelfFrom.z)*g};shelfScale=shelfFromScale+(1-shelfFromScale)*g;
 }else if(chapter==='shelf-home'){shelfAt=shelfHomePosition();place($('collect-cap'),screenPoint(capAt.x,capAt.y,capAt.z));}
 update(cozyShelf.id,{position:shelfAt,rotation:{y:shelfYaw},scale:{x:shelfScale,y:shelfScale,z:shelfScale}});
 const top=shelfPoint(0,100,0),bottom=shelfPoint(0,0,0),left=shelfPoint(-58,48,0),right=shelfPoint(58,48,0);
 place($('shelf-find'),shelfPoint(0,48,0));
 place($('shelf-clean'),{x:(left.x+right.x)/2,y:(top.y+bottom.y)/2});
 $('shelf-clean').style.width=Math.max(85,Math.abs(right.x-left.x)+28)+'px';$('shelf-clean').style.height=Math.max(110,Math.abs(bottom.y-top.y)+36)+'px';
 const home=shelfHomePosition();place($('shelf-place'),screenPoint(home.x,home.y+35,home.z));
 place($('shelf-book'),shelfPoint(-10,22,1));
}
