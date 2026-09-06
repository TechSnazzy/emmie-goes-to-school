import { resetRun } from '../state.js';
import { newRoot, snapTo, lookAtWorld, setViewSpan, setShadowSpan, setSky, setLightLevel, THREE } from '../render3d.js';
import * as M from '../models.js';
import { decorate, rainbow } from '../delight.js';

let t = 0, cast, delight;
export const title = {
  id:'title', screen:true,
  enter() {
    t = 0; resetRun(); const root = newRoot();
    setShadowSpan(400); setSky('#eee5f1','#90ab8b'); setLightLevel(1,'#fff0e6');
    const island = new THREE.Mesh(new THREE.CylinderGeometry(265,250,35,64), M.MAT('#b1c69b'));
    island.scale.z = 0.76; island.position.y = -18; island.receiveShadow = true; root.add(island);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(250,225,30,64), M.MAT('#d7bb98'));
    rim.scale.z = 0.76; rim.position.y = -47; root.add(rim);
    const path = new THREE.Mesh(new THREE.RingGeometry(104,129,64), M.MAT('#f2ddbb',{side:THREE.DoubleSide}));
    path.rotation.x = -Math.PI/2; path.position.y = 1; path.scale.y = 0.75; root.add(path);
    rainbow(root, -55,-70,155);
    const school = M.makeSchool(145,70,75); school.position.set(95,0,-115); root.add(school);
    for (const [x,z,scale] of [[-180,-60,1.4],[175,30,1.5],[-170,100,1]]) {
      const tr = new THREE.Group(); tr.add(M.cyl(5,40,'#a78873'));
      for(let i=0;i<3;i++) { const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(27,1),M.MAT(['#d6a4c8','#ebbacd','#bbabd1'][i])); crown.position.set((i-1)*16,52+(i%2)*15,0); crown.castShadow=true; tr.add(crown); }
      tr.position.set(x,0,z);tr.scale.setScalar(scale);root.add(tr);
    }
    const mom=M.makePerson(M.PAL.mom), emmie=M.makeEmmie(), dad=M.makePerson(M.PAL.dad), cat=M.makeCat();
    mom.position.set(-62,0,50); emmie.position.set(0,0,95); dad.position.set(65,0,35); cat.position.set(90,0,115);
    for (const person of [mom,emmie,dad]) { person.rotation.y=Math.PI/4; person.scale.setScalar(1.3); }
    cat.scale.setScalar(1.4);cat.rotation.y=0.6;root.add(mom,emmie,dad,cat);cast={mom,emmie,dad,cat};
    delight=decorate(root,'title');
    frameCamera(true);
  },
  update(dt) {
    t+=dt; M.refreshBackpack(cast.emmie);
    for(const k of ['mom','emmie','dad']) { M.stepPerson(cast[k],t*2.1,false);cast[k].position.y=Math.sin(t*2+(k==='mom'?1:0))*0.7; }
    cast.emmie.userData.armR.rotation.x=-2.3+Math.sin(t*4)*0.25;
    cast.cat.position.y=Math.abs(Math.sin(t*1.8))*1.5;
    delight.update(dt,t);frameCamera(false,dt);
  },
};
function frameCamera(snap,dt=0.016) {
  const mobile=matchMedia('(max-width:720px), (max-width:1100px) and (orientation:portrait)').matches && !matchMedia('(max-height:450px) and (min-width:560px)').matches;
  const host=document.getElementById('view');
  setViewSpan(mobile ? 620*host.clientHeight/host.clientWidth : 540);
  const offset=host.clientWidth<350 ? -255 : -165;
  const x=mobile?offset:-145, z=mobile?offset:145;
  if(snap) snapTo(x,z); else lookAtWorld(x+Math.sin(t*0.25)*5,z,Math.min(1,dt*2));
}
