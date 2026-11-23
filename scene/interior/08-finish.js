// Final in-room camera, amber practicals and the reference's softer palette.
select('Studio Key');updateLight({intensity:.6,color:'#ead7c7',shadowRadius:4});
environment({ambient:{color:'#b7a5ab',intensity:.32}});
for(const p of [['Rear',.85],['Near',.4],['Lamp',1.05]]){
 select('Interior Practical '+p[0]);updateLight({intensity:p[1],color:'#ffd099',shadows:p[0]==='Lamp',shadowRadius:4});
}
select('Interior Floor Plank 0 0');createMaterial('Interior Floor Timber');color('#b6a08d');layer('texture',{alpha:.22});
select(o=>o.name.startsWith('Interior Floor Plank'));applyMaterial('Interior Floor Timber');
select('Interior Back Wall Plank 0');color('#946b48');
for(let i=0;i<48;i++){
 select('Interior Golden Bulb '+i);geometry({width:18,height:24,depth:18});
 if(i%2){hide();hide('Interior Bulb Socket '+i);}
}
select('Interior Golden Bulb 0');color('#fff0a6');layer('light',{alpha:0});
select('Interior Lamp Shade');color('#e7be7b');layer('light',{alpha:.2});
select('Interior Lantern Glass');color('#ffda77');layer('light',{alpha:0});
select('Interior Mirror Amber Reflection');layer('light',{alpha:0});
fx('bloom',{intensity:.45,luminanceThreshold:.76,luminanceSmoothing:.18,blurScale:.8});
select(o=>o.name.startsWith('Interior Golden Bulb')||o.name.startsWith('Interior Bulb Socket')||o.name.startsWith('Interior Draped Cable'));shadows({cast:false,receive:false});
select('Robot Portrait Camera');position({x:200,y:420,z:1100});rotation({x:-11,y:11,z:2.12409883794});activateCamera('Robot Portrait Camera');
select('Interior Window');scale({x:.8,y:.8,z:1});position({x:-170,y:-50,z:0});
select('Robot');rotation({y:11});
show('Interior Home');hide('Home Room');hide('Studio Ground');unselect();
