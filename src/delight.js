// Small, real 3D surprises: flowers, butterflies, keepsakes and celebration trails.
import { THREE, projectToScreen } from './render3d.js';
import * as M from './models.js';
import { adventure, STICKERS, collectSticker } from './adventure.js';
import { sfx } from './audio.js';
import { toast } from './state.js';

const COLORS = ['#ff91bd', '#ffc969', '#fff1a1', '#91debf', '#9cbdfa', '#c7a3ef'];
function starGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = i * Math.PI / 5 + Math.PI / 2, radius = i % 2 ? 5.5 : 12;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    if (!i) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {depth: 4, bevelEnabled: true, bevelSize: 1, bevelThickness: 1, bevelSegments: 1, steps: 1});
}
export function flower(x, z, color, size = 1) {
  const g = new THREE.Group();
  g.userData.flower = true;
  g.add(M.cyl(0.8, 10, '#589971'));
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const petal = new THREE.Mesh(new THREE.IcosahedronGeometry(3.5, 0), M.MAT(color));
    petal.position.set(Math.cos(a) * 3.5, 11, Math.sin(a) * 3.5);
    petal.scale.y = 0.5; g.add(petal);
  }
  g.add(M.cyl(2.2, 2, '#ffe29b', 0, 11));
  g.position.set(x, 0, z); g.scale.setScalar(size);
  return g;
}
// Hundreds of petals share a handful of draw calls, including on a tablet.
export function batchFlowers(root) {
  const beds = root.children.filter(g => g.userData.flower), batches = new Map();
  for (const bed of beds) {
    bed.updateMatrixWorld(true);
    bed.traverse(m => {
      if (!m.isMesh) return;
      const key = m.geometry.type + JSON.stringify(m.geometry.parameters) + m.material.uuid;
      if (!batches.has(key)) batches.set(key, {geometry:m.geometry,material:m.material,matrices:[]});
      const batch = batches.get(key); batch.matrices.push(m.matrixWorld.clone());
      if (m.geometry !== batch.geometry) m.geometry.dispose();
    });
    root.remove(bed);
  }
  for (const b of batches.values()) {
    const mesh = new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);
    b.matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix)); mesh.receiveShadow=true; root.add(mesh);
  }
}
export function rainbow(root, x, z, radius = 155) {
  const g = new THREE.Group();
  COLORS.forEach((color, i) => {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(radius - i * 9, 4.8, 5, 48, Math.PI), M.MAT(color));
    arc.castShadow = false; g.add(arc);
  });
  g.position.set(x, 5, z); g.rotation.y = Math.PI / 4;
  root.add(g);
  for (const side of [-1, 1]) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(19 + (j % 2) * 8, 1), M.MAT('#fff8f1'));
      p.position.set(j * 18 - 27, (j % 2) * 6, 0); cloud.add(p);
    }
    cloud.position.set(x + side * radius * 0.707, 10, z - side * radius * 0.707);
    root.add(cloud);
  }
}

export function decorate(root, id, {w = 600, h = 360, actors = null} = {}) {
  const outdoors = ['title','park','fence','line','end'].includes(id);
  const butterflies = [];
  if (outdoors) {
    for (let i = 0; i < (id === 'park' ? 70 : 30); i++) {
      const x = id === 'title' || id === 'end' ? Math.sin(i*12.31)*200 : 40 + ((i * 113) % (w - 80));
      const z = id === 'title' || id === 'end' ? Math.cos(i*7.73)*135 : (i % 2 ? h - 52 : 125) + (i % 4) * 9;
      root.add(flower(x, z, COLORS[i % COLORS.length], 0.7 + (i % 3) * 0.2));
    }
    for (let i = 0; i < (id === 'park' ? 9 : 4); i++) {
      const g = new THREE.Group(), wings = [];
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.SphereGeometry(5, 5, 4), M.MAT(COLORS[(i + 1) % 6], {side: THREE.DoubleSide}));
        wing.scale.set(1, 0.14, 0.7); wing.position.x = side * 4;
        g.add(wing); wings.push(wing);
      }
      g.add(M.box(1.3, 2, 7, '#796288'));
      const x = id === 'title' || id === 'end' ? i * 100 - 170 : 150 + i * (w - 250) / 9;
      const z = id === 'title' || id === 'end' ? 100 : h * 0.65;
      root.add(g); butterflies.push({g, wings, x, z, phase: i * 2});
    }
  }
  if (id === 'bedroom') {
    // A tiny storybook reading corner and a constellation above the bed.
    for (let i = 0; i < 7; i++) {
      const st = new THREE.Mesh(starGeometry(), M.MAT(COLORS[i % 6]));
      st.scale.setScalar(0.35); st.position.set(230 + i * 24, 58 + Math.sin(i * 1.4) * 12, 19); root.add(st);
    }
    for (let i = 0; i < 3; i++) root.add(M.box(26, 4, 18, COLORS[i], 430 + i * 2, i * 4, 320));
    const toy = new THREE.Group();
    toy.add(M.box(12,13,10,'#c99b76',0,0,0),M.box(15,12,11,'#d7b18e',0,11,1));
    toy.add(M.box(5,5,4,'#c99b76',-6,21,1),M.box(5,5,4,'#c99b76',6,21,1));
    toy.add(M.box(2,2,1,'#574553',-3,17,7),M.box(2,2,1,'#574553',3,17,7),M.box(3,2,2,'#574553',0,14,7));
    toy.position.set(455,0,310);root.add(toy);
  }
  if (id === 'racks' || id === 'hallway') {
    for (let i = 0; i < 6; i++) {
      const s = M.makeSlab(20, 12, COLORS[i], 0.8); s.position.set(160 + i * 46, 1, 285 + Math.sin(i) * 12); s.rotation.y = i * 0.3; root.add(s);
    }
  }
  batchFlowers(root);
  const ducks = [];
  if (id === 'park') {
    for(let i=0;i<3;i++) {
      const duck = new THREE.Group(), color=i?'#ffe299':'#fff5dd';
      duck.add(M.box(12,7,19,color,0,0,0),M.box(8,9,8,color,0,5,8),M.box(6,2,5,'#eba355',0,7,14));
      duck.add(M.box(1.5,1.5,1,'#514352',-2,10,12.3),M.box(1.5,1.5,1,'#514352',2,10,12.3));
      duck.scale.setScalar(i?0.55:0.85);root.add(duck);
      const ripple=new THREE.Mesh(new THREE.RingGeometry(10,11,28),M.MAT('#c8eeeb',{transparent:true,opacity:0.65,side:THREE.DoubleSide}));
      ripple.rotation.x=-Math.PI/2;root.add(ripple);ducks.push({duck,ripple,phase:i*.65});
    }
  }
  if (['fence','line','racks'].includes(id)) {
    const by=id==='racks'?26:120, bx=id==='racks'?100:140;
    for(let i=0;i<9;i++) {
      const flag=new THREE.Mesh(new THREE.ConeGeometry(7,16,3),M.MAT(COLORS[i%6]));
      flag.rotation.z=Math.PI;flag.position.set(bx+i*33,85+Math.sin(i/8*Math.PI)*-16,by);root.add(flag);
    }
  }
  const heartShape=new THREE.Shape();
  heartShape.moveTo(0,-6);heartShape.bezierCurveTo(-18,5,-8,16,0,8);heartShape.bezierCurveTo(8,16,18,5,0,-6);
  const heart=new THREE.Mesh(new THREE.ShapeGeometry(heartShape),M.MAT('#f395bd',{side:THREE.DoubleSide}));
  heart.rotation.y=Math.PI/4;heart.visible=false;root.add(heart);
  let heartTime=0, friend=null;
  const getFriend=()=>id==='bedroom'?actors?.milo?.mesh:id==='park'?actors?.dog?.mesh:id==='fence'?actors?.puppyMesh:null;
  const sticker = STICKERS.find(s => s.scene === id && s.x !== undefined);
  let token = null;
  if (sticker) {
    token = new THREE.Group();
    const star = new THREE.Mesh(starGeometry(), new THREE.MeshStandardMaterial({color:'#ffdc79',emissive:'#efab42',emissiveIntensity:0.35,roughness:0.35,metalness:0.15}));
    star.castShadow = true; token.add(star);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(21, 0.8, 4, 36), M.MAT('#fff2c8'));
    token.add(halo); token.position.set(sticker.x, 35, sticker.y); root.add(token);
    const base = new THREE.Mesh(new THREE.RingGeometry(17, 21, 32), new THREE.MeshBasicMaterial({color:'#ffdf8c',transparent:true,opacity:0.65,side:THREE.DoubleSide}));
    base.rotation.x = -Math.PI / 2; base.position.set(sticker.x, 4, sticker.y); root.add(base);
    token.userData.base = base;
  }
  // Reuse a small particle pool; no geometry allocations per frame.
  const particles = [];
  const geometry = new THREE.IcosahedronGeometry(2, 0);
  for (let i = 0; i < 32; i++) {
    const m = new THREE.Mesh(geometry, M.MAT(COLORS[i % 6])); m.visible = false; root.add(m);
    particles.push({m, life:0, vx:0, vy:0, vz:0});
  }
  let cursor = 0, trail = 0;
  function particle(x, y, z, burst = false) {
    const p = particles[cursor++ % particles.length];
    p.m.position.set(x, y, z); p.life = burst ? 1.2 : 0.65;
    p.vx = burst ? (Math.random() - 0.5) * 90 : 0;
    p.vy = burst ? 40 + Math.random() * 55 : 15;
    p.vz = burst ? (Math.random() - 0.5) * 90 : 0;
  }
  function burst(x, z) { for (let i = 0; i < 24; i++) particle(x, 30, z, true); }
  function collect() {
    if (!sticker || !collectSticker(sticker.id)) return false;
    burst(sticker.x, sticker.y); return true;
  }
  return {
    burst,
    hit(click) {
      if (token && !adventure.found.has(sticker.id)) {
        const p = projectToScreen(sticker.x, sticker.y, token.position.y);
        if (Math.hypot(click.screenX-p.x,click.screenY-p.y)<38) return collect();
      }
      const animal=getFriend();
      if(animal) {
        const p=projectToScreen(animal.position.x,animal.position.z,15);
        if(Math.hypot(click.screenX-p.x,click.screenY-p.y)<34) {
          if(heartTime<0.4) { friend=animal;heartTime=1.8;burst(animal.position.x,animal.position.z);sfx.purr();toast(id==='bedroom'?'♡ Prrrr… Milo loves you!':'♡ A happy puppy wiggle, just for you!'); }
          return true;
        }
      }
      return false;
    },
    update(dt, t, em) {
      heartTime=Math.max(0,heartTime-dt);heart.visible=heartTime>0;
      if(friend && heartTime>0) { heart.position.set(friend.position.x,35+(1.8-heartTime)*18,friend.position.z);heart.scale.setScalar(Math.min(1,heartTime*2)); }
      const animal=getFriend();
      if(animal?.userData.tail) animal.userData.tail.rotation.z=Math.sin(t*(heartTime?16:4))*(heartTime?0.7:0.12);
      if(window.__dbg) window.__dbg.friend=animal?projectToScreen(animal.position.x,animal.position.z,15):null;
      for(const {duck,ripple,phase} of ducks) {
        const a=t*.35-phase;duck.position.set(375+Math.cos(a)*47,5+Math.sin(t*2+phase)*0.7,168+Math.sin(a)*20);
        duck.rotation.y=Math.atan2(-Math.sin(a)*47,Math.cos(a)*20);ripple.position.set(duck.position.x,5,duck.position.z);ripple.scale.setScalar(1+(t+phase)%2*.35);
      }
      for (const b of butterflies) {
        b.g.position.set(b.x + Math.sin(t * 0.7 + b.phase) * 45, 28 + Math.sin(t * 1.5 + b.phase) * 12, b.z + Math.cos(t * 0.6 + b.phase) * 28);
        b.g.rotation.y = t * 0.3 + b.phase;
        b.wings.forEach((wing, i) => { wing.rotation.z = Math.sin(t * 13) * (i ? -1 : 1); });
      }
      if (token) {
        token.visible = token.userData.base.visible = !adventure.found.has(sticker.id);
        token.position.y = 35 + Math.sin(t * 2.4) * 5;
        token.rotation.y = t * 1.2;
        if (em && Math.hypot(em.x - sticker.x, em.y - sticker.y) < 32) collect();
        if (window.__dbg) window.__dbg.sticker = token.visible ? {...projectToScreen(sticker.x, sticker.y, token.position.y), id:sticker.id} : null;
      } else if (window.__dbg) window.__dbg.sticker = null;
      if (em?.moving) { trail += dt; if (trail > 0.11) { trail = 0; particle(em.x, 5, em.y); } }
      for (const p of particles) {
        p.life -= dt; p.m.visible = p.life > 0;
        if (!p.m.visible) continue;
        p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
        p.vy -= dt * 35; p.m.rotation.y += dt * 3; p.m.scale.setScalar(Math.min(1.6, p.life * 2));
      }
    },
  };
}
