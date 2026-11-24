// The shelf is already part of the room. Discover and clean it in place.
let cozyShelf=null,shelfDustRoot=null,shelfBook=null,shelfReady=false;
let shelfMeshes=[],shelfDust=[],shelfAt={x:-235,y:0,z:-30},shelfScale=homeLayout.shelf.scale;
let shelfWipe=null,shelfFirstWipe=false,shelfKeyboardRow=0;
const shelfHome={...homeLayout.shelf.position},shelfYaw=homeLayout.shelf.yaw;
const shelfStates=()=>chapter.startsWith('shelf-');
function shelfHomePosition(){
 const foot=screenPoint(shelfHome.x,0,shelfHome.z);
 return foot.x<90?pointAtHeight(90,foot.y,0):{...shelfHome};
}
function shelfPoint(x,y,z){
 const q=rotateVector({x:x*shelfScale,y:y*shelfScale,z:z*shelfScale},0,shelfYaw,0);
 return screenPoint(shelfAt.x+q.x,shelfAt.y+q.y,shelfAt.z+q.z);
}
function layoutShelfSearch(){
 if(!shelfStates())return;
 shelfAt=shelfHomePosition();shelfScale=homeLayout.shelf.scale;
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
 if(chapter!=='collection-end')return;await Promise.all([shelfBoot,showRoomModel(false)]);
 if(!shelfReady){speak('There’s something over there.',()=>choice('Try again',startShelf));return;}
 enter('shelf-find');reaction='';$('pet').hidden=true;$('five').hidden=true;$('collect-cap').hidden=true;$('choice').hidden=true;
 $('spark').hidden=false;$('shelf-find').hidden=false;layoutShelfSearch();
 objective('Find what '+chosenName+' sees');speak('Something bigger, this time.');
 revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));
}
$('shelf-find').onfocus=()=>{if(chapter==='shelf-find'){revealFocus='shelf';revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));}};
$('shelf-find').onclick=()=>{
 if(chapter!=='shelf-find')return;
 restoreFoundObject(cozyShelf,shelfMeshes);enter('shelf-arrive');
 $('shelf-find').hidden=true;$('spark').hidden=true;objective('');
 update(shelfDustRoot.id,{visible:true});
 speak('A little shelf.',()=>speak('It’s a bit dusty.'));
 after(2,()=>{if(chapter==='shelf-arrive'){enter('shelf-cleaning');$('shelf-clean').hidden=false;$('shelf-clean').setAttribute('aria-label','Clean the dusty shelf');objective('Clean the shelf');}});
};
function distanceToStroke(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1));
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
let shelfDustPuffs=[],shelfPuffIndex=0,shelfPuffAt=-1000;
function showShelfCloth(x,y){
 const cloth=$('shelf-cloth');cloth.hidden=false;place(cloth,{x,y});
}
function clearShelfFeedback(){
 $('shelf-cloth').hidden=true;
 for(const puff of shelfDustPuffs)puff.animation?.cancel?.();
}
function puffShelfDust(x,y){
 if(performance.now()-shelfPuffAt<55)return;shelfPuffAt=performance.now();
 if(!shelfDustPuffs.length)for(let i=0;i<12;i++){
   const element=document.createElement('i');$('shelf-dust-puffs').append(element);shelfDustPuffs.push({element});
 }
 for(let i=0;i<3;i++){
   const puff=shelfDustPuffs[shelfPuffIndex++%shelfDustPuffs.length],sign=i%2?1:-1;
   puff.animation?.cancel?.();puff.element.style.left=x+sign*(5+i*3)+'px';puff.element.style.top=y-3+'px';
   puff.animation=puff.element.animate?.([
     {opacity:.8,transform:'translate(0,0) scale(.7)'},
     {opacity:0,transform:`translate(${reduced?0:sign*(14+i*7)}px,${reduced?0:-20-i*6}px) scale(1.5)`}
   ],{duration:reduced?180:650,easing:'ease-out'});
 }
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
   update(dust.object.id,{visible:dust.clean<.98,material:{layers:[{type:'texture',alpha:100*(1-dust.clean)}]}});
 }
 if(changed)puffShelfDust(b.x,b.y);
 if(changed&&!shelfFirstWipe){shelfFirstWipe=true;speak('Oh. That’s the wood underneath.');}
 if(shelfDust.every(d=>d.clean>=.9))finishShelfCleaning();
}
function finishShelfCleaning(){
 if(chapter!=='shelf-cleaning')return;
 shelfWipe=null;document.body.dataset.shelfWiping='false';clearShelfFeedback();
 for(const d of shelfDust){d.clean=1;update(d.object.id,{visible:false});}
 update(shelfDustRoot.id,{visible:false});enter('shelf-ready');objective('');$('shelf-clean').hidden=true;
 speak('There’s a book already.',()=>speak('And room for more.',()=>{if(chapter==='shelf-ready')placeShelf();}));
}
$('shelf-clean').onpointerdown=e=>{
 if(e.button>0||chapter!=='shelf-cleaning')return;
 e.currentTarget.setPointerCapture?.(e.pointerId);showShelfCloth(e.clientX,e.clientY);
 shelfWipe={id:e.pointerId,x:e.clientX,y:e.clientY,el:e.currentTarget};document.body.dataset.shelfWiping='true';
};
$('shelf-clean').onkeydown=e=>{
 if(chapter!=='shelf-cleaning'||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(e.key))return;
 e.preventDefault();
 const remaining=shelfDust.filter(d=>d.clean<.9),dust=remaining[shelfKeyboardRow++%remaining.length];
 if(dust){const p=shelfPoint(dust.point.x,dust.point.y,dust.point.z);showShelfCloth(p.x,p.y);after(.5,()=>{if(!shelfWipe)$('shelf-cloth').hidden=true;});wipeShelf({x:p.x-24,y:p.y},{x:p.x+24,y:p.y});}
};
window.addEventListener('pointermove',e=>{
 if(chapter==='shelf-cleaning'){
   const top=shelfPoint(0,104,0),bottom=shelfPoint(0,0,0),left=shelfPoint(-60,48,0),right=shelfPoint(60,48,0);
   const over=e.clientX>left.x-12&&e.clientX<right.x+12&&e.clientY>top.y-12&&e.clientY<bottom.y+12;
   if(over||shelfWipe)showShelfCloth(e.clientX,e.clientY);else $('shelf-cloth').hidden=true;
 }
 if(shelfWipe&&e.pointerId===shelfWipe.id){
   const a={x:shelfWipe.x,y:shelfWipe.y},b={x:e.clientX,y:e.clientY};wipeShelf(a,b);
   if(shelfWipe){shelfWipe.x=b.x;shelfWipe.y=b.y;}
 }
});
function releaseShelf(e){
 if(shelfWipe&&(e.pointerId===undefined||e.pointerId===shelfWipe.id)){
   try{shelfWipe.el.releasePointerCapture?.(shelfWipe.id);}catch{}shelfWipe=null;document.body.dataset.shelfWiping='false';clearShelfFeedback();
 }
}
window.addEventListener('pointerup',releaseShelf);
window.addEventListener('pointercancel',releaseShelf);
window.addEventListener('blur',()=>releaseShelf({}));
function placeShelf(){
 if(chapter!=='shelf-ready')return;
 enter('shelf-home');$('shelf-book').hidden=false;$('collect-cap').hidden=false;$('choice').hidden=true;
 speak('Our little corner.',()=>speak('We can put the next thing here.',()=>{$('pet').hidden=false;after(4,()=>{$('dialogue').hidden=true;});}));
}
$('shelf-book').onclick=()=>{if(chapter==='shelf-home')speak('Maybe we can read it together.');};
function shelfPose(p){
 if(!shelfStates())return p;
 p.headX=8;p.headY=-12;
 if(chapter==='shelf-arrive'){const g=pulse(chapterTime-chapterAt,0,.5,1.3,2);p.leftZ-=25*g;p.headZ-=3*g;}
 return p;
}
function shelfTick(dt){
 if(!shelfReady||!shelfStates())return;
 layoutShelfSearch();
 if(chapter==='shelf-find')revealFoundObject('shelf',cozyShelf,shelfMeshes,shelfPoint(0,48,0));
 if(chapter==='shelf-home')place($('collect-cap'),screenPoint(capAt.x,capAt.y,capAt.z));
 update(cozyShelf.id,{position:shelfAt,rotation:{y:shelfYaw},scale:{x:shelfScale,y:shelfScale,z:shelfScale}});
 const top=shelfPoint(0,100,0),bottom=shelfPoint(0,0,0),left=shelfPoint(-58,48,0),right=shelfPoint(58,48,0);
 place($('shelf-find'),shelfPoint(0,48,0));
 place($('shelf-clean'),{x:(left.x+right.x)/2,y:(top.y+bottom.y)/2});
 $('shelf-clean').style.width=Math.max(85,Math.abs(right.x-left.x)+28)+'px';$('shelf-clean').style.height=Math.max(110,Math.abs(bottom.y-top.y)+36)+'px';
 place($('shelf-book'),shelfPoint(-10,22,1));
}
