// Writing table, books, drawers, bedside cabinet and ceramic-shaded lamp.
interiorParent=add('Empty');rename('Interior Writing Desk');position({x:0,y:0,z:0});moveInto('Interior Home');
for(const x of [-420,-192])for(const z of [-565,-415])ibox('Interior Desk Leg '+x+' '+z,x,83,z,22,166,22,'Interior Walnut');
ibox('Interior Desk Top',-306,172,-490,277,19,200,'Interior Walnut');
ibox('Interior Desk Drawer',-306,140,-432,235,40,41,'Interior Cedar');
for(const x of [-367,-244]){icyl('Interior Desk Drawer Knob '+x,x,140,-408,10,8,'Interior Brass');rotation({x:90});}
// Real volumes for book covers, exposed paper and raised spine.
for(let i=0;i<3;i++){
 const y=188+i*17,x=-300+i*5,z=-500+i*3;
 ibox('Interior Desk Book Pages '+i,x,y,z,109,11,76,'Interior Paper',{y:i*7-5});
 for(const side of [-1,1])ibox('Interior Desk Book Cover '+i+' '+side,x,y+side*7,z,114,3,81,i%2?'Interior Book Olive':'Interior Book Red',{y:i*7-5});
 ibox('Interior Desk Book Spine '+i,x-56,y,z,4,16,81,'Interior Leather',{y:i*7-5});
}
ibox('Interior Open Notebook Left',-371,185,-430,58,3,74,'Interior Paper',{y:-13});
ibox('Interior Open Notebook Right',-313,185,-444,58,3,74,'Interior Paper',{y:-13});
itube('Interior Desk Pen',[[-338,190,-418],[-293,190,-447]],2.3,'Interior Charcoal');
interiorParent=add('Empty');rename('Interior Bedside Cabinet');position({x:0,y:0,z:0});moveInto('Interior Home');
ibox('Interior Cabinet Body',-77,91,-560,170,164,160,'Interior Walnut');
ibox('Interior Cabinet Cap',-77,180,-560,186,16,175,'Interior Walnut');
for(let i=0;i<3;i++){
 ibox('Interior Cabinet Drawer '+i,-77,42+i*51,-474,156,43,8,'Interior Cedar');
 iball('Interior Cabinet Brass Handle '+i,-77,42+i*51,-465,12,9,9,'Interior Brass');
}
for(const x of [-139,-15])for(const z of [-620,-500])ibox('Interior Cabinet Foot '+x+' '+z,x,8,z,20,16,20,'Interior Walnut');
interiorParent=add('Empty');rename('Interior Table Lamp');position({x:0,y:0,z:0});moveInto('Interior Home');
icyl('Interior Lamp Foot',-77,198,-560,82,16,'Interior Cream');
iball('Interior Lamp Ceramic Body',-77,237,-560,80,64,80,'Interior Cream');
icyl('Interior Lamp Stem',-77,282,-560,16,44,'Interior Brass');
icyl('Interior Lamp Shade',-77,345,-560,124,104,'Interior Amber',{radiusTop:.82,radiusBottom:1,openEnded:true,cornerRadius:1});
shading({category:'phong',emissive:'#9d5c16',shininess:5});
for(const y of [294,396])icyl('Interior Shade Binding '+y,-77,y,-560,125,4,'Interior Brass');
icyl('Interior Shade Top',-77,397,-560,100,4,'Interior Amber');
iball('Interior Lamp Bulb',-77,311,-560,23,28,23,'Interior Amber');shading({category:'phong',emissive:'#ffcf69'});
// A cloth-bound book and loose letter on the nightstand.
ibox('Interior Bedside Book',-126,193,-490,73,9,49,'Interior Book Red',{y:11});
ibox('Interior Bedside Letter',-28,192,-492,45,1.4,52,'Interior Paper',{y:-9});
