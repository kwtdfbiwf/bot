// Local patches on the shelf's top, middle board, book and front uprights.
// Shared by the one-time Spline builder and the runtime wiping interaction.
const shelfDustLayout=[];
for(const y of [96.3,58.8])for(const x of [-31,-10,11,32])for(const z of [-15,7])shelfDustLayout.push({x,y,z,w:23,h:.3,d:24});
for(const x of [-29,-10,9])for(const z of [-8,9])shelfDustLayout.push({x,y:29.3,z,w:20,h:.3,d:19});
for(const x of [-44,44])for(const y of [30,74])shelfDustLayout.push({x,y,z:28.7,w:11,h:46,d:.3});
// Dust also catches on the front lips, visible from the play camera.
for(const [y,z,h] of [[90,30.4,8],[54,26.4,6],[12,26.4,5]])for(const x of [-36,-18,0,18,36])shelfDustLayout.push({x,y,z,w:19,h,d:.3});
