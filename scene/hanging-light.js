// A deliberate downward tug turns on the hanging lamp. Enter/Space retain
// the button's native accessible activation; a mouse click alone is not a tug.
let lampPull=null;
function turnOnLamp(){
 if(phase!=='search')return;
 lampPull=null;$('hanging-light').dataset.pulling='false';$('hanging-light').style.setProperty('--pull','0px');
 setPhase('lit');$('switch').setAttribute('aria-pressed','true');$('switch').setAttribute('aria-label','Hanging light is on');$('switch').disabled=true;
 $('spark').hidden=true;$('objective').hidden=true;
 speak('That’s better.',()=>{if(chapter==='intro')speak('...');});startChapter();
}
$('switch').onclick=e=>{if(!e||e.detail===0)turnOnLamp();};
$('switch').onpointerdown=e=>{
 if(phase!=='search'||e.button>0)return;
 lampPull={id:e.pointerId,y:e.clientY,distance:0,el:e.currentTarget};
 $('hanging-light').dataset.pulling='true';e.currentTarget.setPointerCapture?.(e.pointerId);
};
window.addEventListener('pointermove',e=>{
 if(!lampPull||lampPull.id!==e.pointerId)return;
 lampPull.distance=Math.max(0,Math.min(70,e.clientY-lampPull.y));
 $('hanging-light').style.setProperty('--pull',lampPull.distance+'px');
});
function releaseLamp(e,cancelled=false){
 if(!lampPull||(e.pointerId!==undefined&&e.pointerId!==lampPull.id))return;
 const pull=lampPull;lampPull=null;
 try{pull.el.releasePointerCapture?.(pull.id);}catch{}
 $('hanging-light').dataset.pulling='false';$('hanging-light').style.setProperty('--pull','0px');
 if(!cancelled&&pull.distance>=28)turnOnLamp();
}
window.addEventListener('pointerup',e=>releaseLamp(e));
window.addEventListener('pointercancel',e=>releaseLamp(e,true));
window.addEventListener('blur',()=>releaseLamp({},true));
