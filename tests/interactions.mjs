const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const errors=[];
async function open(path='', options={}) {
  const page=await browser.newPage({viewport:{width:1200,height:850},...options});
  page.on('pageerror',e=>errors.push(e.message));
  return page;
}
async function navigate(page,path='') {
  await page.goto('http://127.0.0.1:8000/'+path);
  await page.waitForFunction(()=>window.__dbg?.frames>40);
}
try {
  const page=await open();
  await navigate(page);
  await page.locator('#btn-album').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#album-dialog').evaluate(d=>d.open),true,'Space opens native button');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#album-dialog').open);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'btn-album');
  await page.keyboard.press('KeyM');
  assert.equal(await page.locator('#btn-music').getAttribute('aria-pressed'),'false');
  await page.locator('#btn-play').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.__dbg.scene==='bedroom');
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('#pause-dialog').open);
  const before=await page.evaluate(async()=>(await import('/src/state.js')).state.elapsed);
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(async()=>(await import('/src/state.js')).state.elapsed),before);
  await page.keyboard.press('Escape');
  await page.waitForFunction(async()=>!(await import('/src/adventure.js')).adventure.paused);
  // A real canvas click on Milo triggers the pet interaction.
  const miloStar=await page.evaluate(()=>window.__dbg.sticker);
  await page.mouse.click(miloStar.x,miloStar.y);
  await page.waitForFunction(()=>document.querySelector('#album-count').textContent==='1/8');
  let friend=await page.evaluate(()=>window.__dbg.friend);
  await page.mouse.click(friend.x,friend.y);
  await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('Milo loves'));
  console.log('PASS keyboard buttons, audio shortcuts, Escape pause, Milo interaction');
  await page.close();

  const touch=await open('',{viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await navigate(touch,'?scene=fence');
  // The star and puppy may overlap: collect the star, then pet the puppy.
  let target=await touch.evaluate(()=>window.__dbg.sticker);
  await touch.touchscreen.tap(target.x,target.y);
  await touch.waitForFunction(()=>document.querySelector('#album-count').textContent==='1/8');
  friend=await touch.evaluate(()=>window.__dbg.friend);
  await touch.touchscreen.tap(friend.x,friend.y);
  await touch.waitForFunction(()=>document.querySelector('#toast').textContent.includes('happy puppy'));
  await touch.waitForFunction(()=>!document.querySelector('#btn-guide').disabled);
  const start=await touch.evaluate(()=>window.__dbg.em);
  target=await touch.evaluate(async()=>(await import('/src/render3d.js')).projectToScreen(300,300));
  await touch.touchscreen.tap(target.x,target.y);
  await touch.waitForFunction(pos=>Math.hypot(window.__dbg.em.x-pos.x,window.__dbg.em.y-pos.y)>12,start,{timeout:8000});
  await touch.setViewportSize({width:844,height:390});
  await touch.waitForTimeout(300);
  assert.ok(await touch.evaluate(()=>document.querySelector('#view3d').width>0));
  console.log('PASS touch star, puppy, ground movement, rotation');
  await touch.close();

  const replay=await open();
  await replay.addInitScript(()=>localStorage.setItem('emmie_adventure_v1',JSON.stringify({pack:1,album:['milo'],visits:2})));
  await navigate(replay,'?scene=end');
  assert.match(await replay.locator('#end-message').textContent(),/You helped/);
  assert.equal(await replay.locator('.medals>div').count(),3);
  await replay.locator('#btn-replay').click();
  await replay.waitForFunction(()=>window.__dbg.scene==='title');
  const saved=await replay.evaluate(async()=>{const {adventure:a}=await import('/src/adventure.js');return {found:a.found.size,album:[...a.album],visits:a.visits,pack:a.pack};});
  assert.deepEqual(saved,{found:0,album:['milo'],visits:3,pack:1});
  await replay.locator('#btn-play').click();await replay.waitForFunction(()=>window.__dbg.scene==='bedroom');
  await replay.evaluate(()=>{
    window.testSpeech=[];
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(words){window.testSpeech.push(words.text);}}});
  });
  await replay.locator('#btn-read').click();
  assert.ok(await replay.evaluate(()=>window.testSpeech.length>0));
  console.log('PASS no-sticker celebration, replay resets run and keeps album, speech request');
  await replay.close();

  for(const mode of ['malformed','blocked']) {
    const p=await open();
    await p.addInitScript(mode=>{
      if(mode==='malformed') localStorage.setItem('emmie_adventure_v1','{broken json');
      else Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError');}});
    },mode);
    await navigate(p);await p.getByRole('button',{name:'Ocean mint'}).click();
    await p.locator('#btn-play').click();await p.waitForFunction(()=>window.__dbg.scene==='bedroom');
    console.log('PASS storage',mode);await p.close();
  }
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
