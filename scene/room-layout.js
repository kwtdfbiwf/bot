// A fixed 3D set, rather than finds being brought to an inspection stage.
// The room shell is deliberately absent from normal searches: only the
// active find receives cursor lighting. Completed objects remain at home.
const homeLayout={shelf:{position:{x:-235,y:0,z:-30},scale:1.35,yaw:15}};
let homeRoom=null,roomCamera=null,roomPreview=false;
async function prepareRoom(){
 homeRoom=await spline.findObjectByName('Home Room');
 roomCamera=await spline.findObjectByName('Robot Portrait Camera');
 if(!homeRoom||!roomCamera)throw new Error('Missing Home Room');
 await update(homeRoom.id,{visible:false});
}
const roomBoot=prepareRoom();
async function showRoomModel(visible){
 await roomBoot;roomPreview=visible;document.body.dataset.roomPreview=String(visible);await update(homeRoom.id,{visible});
 // The author-only overview pulls back the camera, never the room objects.
 // Every story task restores the camera used by cursor-light projection.
 await update(roomCamera.id,{position:visible?{x:520,y:430,z:1110}:{x:370,y:360,z:790}});
}
