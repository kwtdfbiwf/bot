const help = document.querySelector('#help');
document.querySelector('#help-open').addEventListener('click', () => help.showModal());
document.querySelector('#help-close').addEventListener('click', () => help.close());
document.querySelector('#help-start').addEventListener('click', () => help.close());
help.addEventListener('click', event => { if (event.target === help) { const b = help.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) help.close(); } });
const robot = document.querySelector('#robot');
const loading = document.querySelector('#loading');
robot.addEventListener('load', () => { loading.classList.add('gone'); });
document.querySelector('#expand').addEventListener('click', () => window.open(robot.src, '_blank', 'noopener,noreferrer'));
document.querySelectorAll('a[href="#playground"]').forEach(link => link.addEventListener('click', () => { document.querySelector('#playground').focus({ preventScroll: true }); }));
// Keep an escape route available if a browser blocks the third-party 3D scene.
window.setTimeout(() => { if (!loading.classList.contains('gone')) { loading.querySelector('p').textContent = 'Milo is taking a little longer.'; loading.querySelector('span').textContent = 'Try “Open playground” below to visit the scene directly.'; } }, 20000);
