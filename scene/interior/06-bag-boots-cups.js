interiorParent=add('Empty');rename('Interior Satchel');position({x:0,y:0,z:0});moveInto('Interior Home');
ibox('Interior Bag Main Pouch',-318,67,393,90,119,58,'Interior Leather');geometry({cornerRadius:20,cornerSegments:8});
ibox('Interior Bag Folded Flap',-318,106,425,91,55,13,'Interior Oak',{x:-6});geometry({cornerRadius:13});
ibox('Interior Bag Front Pocket',-318,45,427,65,43,13,'Interior Cedar');geometry({cornerRadius:10});
ibox('Interior Bag Buckle',-318,91,436,17,23,5,'Interior Brass');
ibox('Interior Buckle Inset',-318,92,440,9,13,2,'Interior Leather');
itube('Interior Bag Handle',[[-340,121,392],[-339,140,388],[-315,145,387],[-293,130,392]],5,'Interior Leather');
itube('Interior Bag Shoulder Strap',[[-350,110,369],[-380,111,355],[-391,58,370],[-373,12,413],[-342,8,429],[-311,38,422]],4,'Interior Leather');
interiorParent=add('Empty');rename('Interior Boots');position({x:0,y:0,z:0});moveInto('Interior Home');
for(const x of [356,442]){
 ibox('Interior Boot Sole '+x,x,11,193,69,19,121,'Interior Charcoal');geometry({cornerRadius:12});
 ibox('Interior Boot Toe '+x,x,34,222,68,41,69,'Interior Leather');geometry({cornerRadius:17});
 ibox('Interior Boot Ankle '+x,x,70,169,62,95,67,'Interior Leather');geometry({cornerRadius:13});
 icyl('Interior Boot Opening '+x,x,120,169,51,4,'Interior Charcoal');
 for(let i=0;i<4;i++)itube('Interior Boot Lace '+x+' '+i,[[x-15,58+i*13,205],[x+15,67+i*13,205]],1.6,'Interior Cord');
}
interiorParent=add('Empty');rename('Interior Ceramics');position({x:0,y:0,z:0});moveInto('Interior Home');
icyl('Interior Small Earthen Bowl',404,21,-97,90,42,'Interior Rust',{hollow:.72,cornerRadius:7});
icyl('Interior Bowl Inside',404,7,-97,62,3,'Interior Leather');
// The little tipped cup at the right-front edge of the rug.
const cup=add('Empty');rename('Interior Tipped Cup');position({x:366,y:26,z:464});moveInto('Interior Home');interiorParent=cup;
icyl('Interior Cup Pottery',366,26,464,52,58,'Interior Rust',{hollow:.72,cornerRadius:3});
const handle=[];for(let i=0;i<=24;i++){const a=i*Math.PI*2/24;handle.push([398+Math.cos(a)*19,29+Math.sin(a)*22,464]);}
itube('Interior Cup Loop',handle,5,'Interior Rust');
select(cup);rotation({z:-72,y:12});
