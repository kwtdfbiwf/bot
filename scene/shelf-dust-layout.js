// Local patches on the shelf's top, middle board, book and front uprights.
// Shared by the one-time Spline builder and the runtime wiping interaction.
const shelfDustLayout=[];
for(const y of [96.3,58.8])for(const x of [-31,-10,11,32])for(const z of [-15,7])shelfDustLayout.push({x,y,z,w:23,h:.3,d:20});
for(const x of [-29,-10,9])for(const z of [-8,9])shelfDustLayout.push({x,y:29.3,z,w:18,h:.3,d:13});
for(const x of [-44,44])for(const y of [30,74])shelfDustLayout.push({x,y,z:28.7,w:9,h:22,d:.3});
