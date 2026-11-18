// Hidden author preview. Reset the existing runtime: Spline play frames
// need their parent scene configuration and cannot reload themselves.
const previewStops=['play','seed','name','water','moth','cap','shelf','dust','home'];
let previewReturnFocus=null;
function closePreview(){
 $('preview-menu').hidden=true;previewReturnFocus?.focus?.({preventScroll:true});
}
function openPreview(){
 previewReturnFocus=document.activeElement;$('preview-menu').hidden=false;$('preview-play').focus({preventScroll:true});
}
window.addEventListener('keydown',e=>{
 const editing=['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)||e.target?.isContentEditable;
 if(e.key==='Escape'&&!$('preview-menu').hidden){e.preventDefault();closePreview();}
 else if(e.shiftKey&&e.key?.toLowerCase()==='p'&&!editing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
   e.preventDefault();if($('preview-menu').hidden)openPreview();else closePreview();
 }
});
$('preview-close').onclick=closePreview;
let previewBusy=false;
async function resetPreview(){
 await Promise.all([plantBoot,twoBoot,waterBoot,collectionBoot,shelfBoot]);
 if(!plantReady||!twoReady||!waterReady||!collectionReady||!shelfReady)throw new Error('Preview assets are not ready');
 clearTimeout(typing);tasks.length=0;speechTyping=false;speechUntil=0;
 releaseArm({});releaseTurn({});releaseCan({type:'pointercancel'});releaseCollectionDrag({},true);releaseShelf({},true);
 // Release handlers may schedule a return gesture; discard those too.
 tasks.length=0;enter('waiting');setPhase('boot');armDrag=null;turnDrag=null;canDrag=null;collectionDrag=null;shelfDrag=null;shelfWipe=null;
 reaction='';reactionAt=-100;happyAt=-100;collectionHappyAt=-100;armDialogueAt=-100;
 growth=0;lightPinned=false;pointerNearPlant=false;petCount=0;playCount=0;
 yaw=frontYaw;yawTarget=frontYaw;standAt=-100;nameConfirmed=false;
 for(const side of ['left','right']){arms[side].angle=0;arms[side].releaseAt=-100;arms[side].releaseFrom=0;}
 canCarry=false;canHeld=false;waterAngle=40;waterTarget=40;waterFill=0;waterGuided=false;waterPouring=false;waterAligned=false;bloomAt=-100;
 waterFacing=frontYaw;suppressCanClickUntil=-1;suppressArmClickUntil=-1;
 mothOffered=false;mothWarmth=0;mothPinned=false;mothFlightFrom=null;
 capHeld=false;capInBox=false;collectionSettled=false;collectionClickAfter=-100;
 capAt={x:-235,y:5,z:100};boxAt={x:-230,y:0,z:70};
 shelfFirstWipe=false;shelfKeyboardRow=0;shelfClickAfter=-100;shelfScale=1;shelfAt={...shelfHome};revealFocus='';
 for(const id of ['wake','name-form','nickname-form','objective','dialogue','choice','answers','spark','seed','soil','growth','pet','five','arm-left','arm-right','turn-milo','back-name','water-can','water-hand','moth-guide','collect-cap','collect-hand','collect-box','collect-place','shelf-find','shelf-clean','shelf-place','shelf-book'])$(id).hidden=true;
 document.body.dataset.carrying='false';document.body.dataset.armDragging='false';document.body.dataset.shelfWiping='false';
 $('hanging-light').hidden=true;$('switch').disabled=false;$('switch').setAttribute('aria-pressed','false');
 $('seed').tabIndex=0;$('seed').setAttribute('aria-label','Pick up the seed');$('seed').style.opacity='0';
 $('soil').disabled=false;$('soil').classList.remove('grown','warming');$('soil').setAttribute('aria-pressed','false');
 $('moth-guide').setAttribute('aria-pressed','false');$('collect-cap').setAttribute('aria-label','Pick up the blue bottle cap');
 $('collect-place').setAttribute('aria-label','Place the keepsake box beside Milo');
 for(const root of [seedModel,plant,wateringCan,waterDrops,gardenFlower,moth,blueCap,keepsakeBox,collectionHatch,cozyShelf,shelfDustRoot]){
   releaseSearchLight(root);await update(root.id,{visible:false});
 }
 await update(plant.id,{rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
 await update(wateringCan.id,{rotation:{x:0,y:0,z:0}});
 await update(blueCap.id,{rotation:{x:0,y:0,z:0}});
 await update(collectionLid.id,{rotation:{x:0,y:0,z:0}});
 for(const d of shelfDust){d.clean=0;await update(d.object.id,{visible:true,material:{layers:[{type:'texture',alpha:85}]}});}
 for(const side of [-1,1])write('Robot Leg Pivot '+side,{position:{y:100},rotation:{x:0,y:0,z:0}});
 enter('waiting');setPhase('boot');
}
async function requestPreview(stop){
 if(previewBusy)return;previewBusy=true;
 try{
   await resetPreview();
   if(stop)await startPreview(stop);else{visitor='';wakeButton();}
   $('preview-menu').hidden=true;
 }catch(error){console.error('Chapter preview:',error);$('preview-status').textContent='The scene could not jump. Try again once it has loaded.';}
 finally{previewBusy=false;}
}
for(const stop of previewStops)$('preview-'+stop).onclick=()=>requestPreview(stop);
$('preview-restart').onclick=()=>requestPreview('');
async function startPreview(stop){
 await Promise.all([plantBoot,twoBoot,waterBoot,collectionBoot,shelfBoot]);
 if(!plantReady||!twoReady||!waterReady||!collectionReady||!shelfReady)throw new Error('Preview assets are not ready');
 setPhase('lit');began=performance.now()-45000;visitor='friend';
 hideWake();$('name-form').hidden=true;$('switch').disabled=true;$('switch').setAttribute('aria-pressed','true');
 $('hanging-light').hidden=false;$('hanging-light').style.maskImage='none';
 standAt=-100;yaw=frontYaw;yawTarget=frontYaw;reaction='';
 if(stop==='play'){
   enter('play');$('pet').hidden=false;$('five').hidden=false;$('spark').hidden=false;
   choice('Look around together',lookAround);return;
 }
 if(stop==='seed'){
   enter('finding');$('seed').hidden=false;$('spark').hidden=false;placeSeed();revealSeed();
   objective('Use the light to find the object');return;
 }
 growth=1;await update(plant.id,{visible:true,scale:{x:1,y:1,z:1}});
 if(stop==='name'){
   enter('name-search');$('turn-milo').hidden=false;objective('Find his name');return;
 }
 nameConfirmed=true;
 if(stop==='water'){
   enter('water-find');layoutCanHome();canAt={...canHome};waterFacing=frontYaw;
   $('water-can').hidden=false;$('spark').hidden=false;revealWateringCan();
   objective('Give the watering can to '+chosenName);return;
 }
 await update(gardenFlower.id,{visible:true,rotation:{y:frontYaw},scale:{x:1,y:1,z:1}});
 for(let i=0;i<flowerPetals.length;i++)await update(flowerPetals[i].id,{rotation:{x:0,y:0,z:i*72},scale:{x:1,y:1,z:1}});
 await update(moth.id,{visible:true,position:{x:145,y:68,z:86},rotation:{y:25},scale:{x:1,y:1,z:1}});
 if(stop==='moth'){
   enter('moth-coax');mothOffered=true;mothOfferAt=chapterTime-2;$('moth-guide').hidden=false;$('spark').hidden=false;
   objective('Bring the moth to '+chosenName);return;
 }
 if(stop==='cap'){enter('garden-end');await beginCollection();return;}
 boxAt={x:-135,y:0,z:80};capAt={x:-135,y:7,z:80};capInBox=true;collectionSettled=true;
 restoreFoundObject(keepsakeBox,boxMeshes);restoreFoundObject(blueCap,[capEnamel]);
 await update(keepsakeBox.id,{position:boxAt});await update(blueCap.id,{position:capAt});
 enter('collection-end');await startShelf();
 if(stop==='dust'){$('shelf-find').onclick();return;}
 if(stop==='home'){
   clearTimeout(typing);speechTyping=false;speechUntil=0;$('dialogue').hidden=true;tasks.length=0;
   restoreFoundObject(cozyShelf,shelfMeshes);shelfAt=shelfHomePosition();shelfScale=1;
   for(const d of shelfDust){d.clean=1;await update(d.object.id,{visible:false});}
   await update(shelfDustRoot.id,{visible:false});enter('shelf-home');
   $('shelf-find').hidden=true;$('spark').hidden=true;$('shelf-book').hidden=false;$('collect-cap').hidden=false;$('pet').hidden=false;
   objective('');
 }
}
