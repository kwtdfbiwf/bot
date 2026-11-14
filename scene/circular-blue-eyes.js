// Applied in the connected Spline editor; published with opening.html.
select(o => o.name === 'Head Eye Left' || o.name === 'Head Eye Right');
geometry({ width: 24, height: 24, depth: 5 });
updateMaterial('Eye Light', {
  name: 'Dark Blue Eyes',
  layers: [
    { type: 'light', category: 'phong', roughness: 0.6, metalness: 0.2, reflectivity: 0.2, alpha: 0.35, occlusion: true, specular: '#333333', shininess: 5, emissive: '#000000' },
    { type: 'color', alpha: 1, color: '#153a68' }
  ]
});
