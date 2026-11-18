// One-time native Spline model. The room is a real set, hidden until its
// pieces are earned. Its open front follows the A-frame room reference.
// Existing Milo and collected props retain their original scene roots.
const room=add('Empty');rename('Home Room');position({x:0,y:0,z:0});
const floor=add('Empty');rename('Home Floor');position({x:0,y:0,z:0});
for(let i=0;i<9;i++){
 mesh('Cube',{width:82,height:16,depth:500,cornerRadius:3,cornerSegments:5});rename('Home Floor Board '+i);
 applyMaterial('Cozy Walnut');position({x:-336+i*84,y:-8,z:-70});moveInto(floor);
}
for(const z of [-326,186]){
 mesh('Cube',{width:756,height:24,depth:20,cornerRadius:4,cornerSegments:5});rename('Home Floor Edge '+z);
 applyMaterial('Cozy Walnut');position({x:0,y:-14.5,z});moveInto(floor);
}
select(floor);moveInto(room);
const frame=add('Empty');rename('Home Frame');position({x:0,y:0,z:0});
const rise=620,run=350,length=Math.hypot(rise,run),angle=Math.atan2(run,rise)*180/Math.PI;
for(const z of [-300,120])for(const side of [-1,1]){
 mesh('Cube',{width:25,height:length+14,depth:30,cornerRadius:4,cornerSegments:6});rename('Home A Frame '+z+' '+side);
 applyMaterial('Cozy Walnut Upright');position({x:side*175,y:rise/2,z});rotation({z:side*angle});moveInto(frame);
}
mesh('Cube',{width:28,height:24,depth:452,cornerRadius:3,cornerSegments:5});rename('Home Ridge Beam');
applyMaterial('Cozy Walnut');position({x:0,y:rise,z:-90});moveInto(frame);
select(frame);moveInto(room);
const roof=add('Empty');rename('Home Roof');position({x:0,y:0,z:0});
for(const side of [-1,1])for(let i=0;i<7;i++){
 const t=(i+.5)/7;
 mesh('Cube',{width:length/7-1.5,height:12,depth:444,cornerRadius:2,cornerSegments:4});rename('Home Roof Board '+side+' '+i);
 applyMaterial('Cozy Walnut');position({x:side*(350-350*t),y:rise*t+9,z:-90});rotation({z:-side*(90-angle)});moveInto(roof);
}
select(roof);moveInto(room);select(room);hide(room);unselect();
