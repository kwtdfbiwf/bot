interiorParent=add('Empty');rename('Interior Bulb Garlands');position({x:0,y:0,z:0});moveInto('Interior Home');
const spans=[
 [[-565,290,-520],[-200,740,-585],105,9],
 [[-200,740,-585],[240,665,-585],170,11],
 [[240,665,-585],[575,285,-450],85,9],
 [[-520,310,80],[-165,730,20],75,7],
 [[-165,730,20],[500,350,35],135,12]
];
let bulbIndex=0;
for(let span=0;span<spans.length;span++){
 const [a,b,sag,count]=spans[span],path=[];
 for(let i=0;i<=40;i++){const t=i/40;path.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-4*sag*t*(1-t),a[2]+(b[2]-a[2])*t]);}
 itube('Interior Draped Cable '+span,path,3,'Interior Cord');
 for(let i=0;i<count;i++){
  const t=(i+.5)/count,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t-4*sag*t*(1-t),z=a[2]+(b[2]-a[2])*t;
  icyl('Interior Bulb Socket '+bulbIndex,x,y-9,z,12,19,'Interior Cord');
  iball('Interior Golden Bulb '+bulbIndex,x,y-29,z,23,30,23,'Interior Amber');
  if(bulbIndex===0){createMaterial('Interior Bulb Glow');color('#ffdd83');shading({category:'phong',emissive:'#ffbc42',shininess:25});}
  else applyMaterial('Interior Bulb Glow');
  bulbIndex++;
 }
}
// The cloth shade glows more softly than the exposed bulbs.
select('Interior Lamp Shade');createMaterial('Interior Shade Glow');color('#e6b56c');shading({category:'phong',emissive:'#7f4510',shininess:5});
select('Interior Shade Top');applyMaterial('Interior Shade Glow');
select('Interior Lamp Bulb');applyMaterial('Interior Bulb Glow');
select('Interior Cup Pottery');applyMaterial('Interior Rust');
interiorParent=add('Empty');rename('Interior Desk Lantern');position({x:0,y:0,z:0});moveInto('Interior Home');
icyl('Interior Lantern Foot',-391,190,-526,52,16,'Interior Brass');
iball('Interior Lantern Glass',-391,224,-526,40,64,40,'Interior Amber');createMaterial('Interior Lantern Glass Glow');color('#ffc25b');shading({category:'phong',emissive:'#de861e',shininess:60});
for(const x of [-410,-372])for(const z of [-545,-507])itube('Interior Lantern Cage '+x+' '+z,[[x,194,z],[x,245,z],[-391,270,-526]],2.6,'Interior Walnut');
icyl('Interior Lantern Cap',-391,256,-526,52,10,'Interior Brass');
const handle=[];for(let i=0;i<=20;i++){const a=i*Math.PI/20;handle.push([-391+Math.cos(a)*23,267+Math.sin(a)*28,-526]);}
itube('Interior Lantern Carry Loop',handle,3,'Interior Walnut');
// A book and bookmark left on the cream daybed.
interiorParent='Interior Daybed';
ibox('Interior Daybed Book',-444,117,144,101,17,74,'Interior Leather',{y:14});
ibox('Interior Daybed Book Pages',-443,116,147,91,10,67,'Interior Paper',{y:14});
ibox('Interior Daybed Bookmark',-438,128,179,10,1.5,32,'Interior Book Red',{y:14});
// Local practicals: the lights belong to this room and vanish with it.
for(const p of [['Rear',-150,560,-460,3.6,1450],['Near',80,500,180,2.4,1300],['Lamp',-77,330,-520,2.2,850]]){
 const l=light('Point',{intensity:p[4],color:'#ffbe69',distance:p[5],decay:1,shadows:false});rename('Interior Practical '+p[0]);position({x:p[1],y:p[2],z:p[3]});moveInto('Interior Home');
}
show('Interior Home');hide('Home Room');hide('Studio Ground');
select('Robot');rotation({y:25.1});
select('Robot Portrait Camera');activateCamera('Robot Portrait Camera');
unselect();
