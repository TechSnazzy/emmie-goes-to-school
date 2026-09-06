const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors=[]; page.on('pageerror',e=>{ errors.push(e.message); console.log('ERROR',e.message); });
try {
  await page.goto('http://127.0.0.1:8000/');
  await page.getByRole('button',{name:'Ocean mint'}).click();
  await page.getByRole('button',{name:'Let’s go, Emmie!'}).click();
  await page.waitForFunction(()=>window.__dbg.scene==='bedroom');
  await page.waitForTimeout(1500);
  await page.screenshot({path:'/tmp/emmie-bedroom.png'});
  // Opening the album freezes the actual game state, then resumes it.
  await page.locator('#btn-album').click();
  const frozen=await page.evaluate(async()=> (await import('/src/state.js')).state.elapsed);
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(async()=> (await import('/src/state.js')).state.elapsed),frozen);
  await page.getByRole('button',{name:'Close sticker book'}).click();
  let last='', lastLog=0, sceneStart=Date.now(); const visited=new Set();
  const deadline=Date.now()+600000;
  while(Date.now()<deadline) {
    const info=await page.evaluate(()=>({ ...window.__dbg, objective:document.getElementById('obj').textContent,guide:!document.getElementById('btn-guide').disabled,rect:document.getElementById('view').getBoundingClientRect().toJSON() }));
    if(!visited.has(info.scene)) { visited.add(info.scene);sceneStart=Date.now(); console.log('SCENE',info.scene); await page.screenshot({path:`/tmp/emmie-run-${info.scene}.png`}); }
    if(info.scene==='end') break;
    if(Date.now()-sceneStart>160000) throw new Error('Scene stuck: '+JSON.stringify(info));
    const st=info.sticker, r=info.rect;
    if(st && st.x>r.left+35 && st.x<r.right-35 && st.y>r.top+35 && st.y<r.bottom-35) await page.mouse.click(st.x,st.y);
    if(info.scene!=='drive' && info.guide && info.objective!==last) { await page.locator('#btn-guide').click(); last=info.objective; }
    if(Date.now()-lastLog>15000) { console.log('PROGRESS',info.scene,info.objective,info.em);lastLog=Date.now(); if(info.scene!=='drive'&&info.guide) await page.locator('#btn-guide').click(); }
    // Advance real scene logic (including pathfinding/collisions) between renders.
    // No teleportation or objective manipulation is used.
    await page.evaluate(async()=>{
      const st=await import('/src/state.js'), a=await import('/src/adventure.js'), ui=await import('/src/presentation.js');
      const id=st.currentScene()?.id;
      for(let i=0;i<30 && !a.adventure.paused;i++) {
        st.updateSceneManager(1/30);const s=st.currentScene();s?.update?.(1/30);st.updateToasts(1/30);st.syncHUD();st.setScreenMode(!!s?.screen);ui.syncPresentation(s?.id||'');
        if(s?.id!==id) break;
      }
    });
    await page.waitForTimeout(100);
  }
  assert.equal(await page.evaluate(()=>window.__dbg.scene),'end');
  await page.waitForTimeout(2000);await page.screenshot({path:'/tmp/emmie-end.png'});
  const result=await page.evaluate(async()=>{const {adventure:a}=await import('/src/adventure.js');return {found:[...a.found],album:[...a.album],pack:a.pack,visits:a.visits};});
  assert.equal(result.pack,2);assert.equal(result.found.length,8);assert.equal(result.visits,1);
  assert.deepEqual(errors,[]);
  await page.locator('#btn-end-album').click();await page.screenshot({path:'/tmp/emmie-album.png'});
  await page.reload();await page.waitForFunction(()=>window.__dbg.scene==='title');
  assert.equal(await page.locator('#album-count').textContent(),'8/8');
  assert.equal(await page.getByRole('button',{name:'Ocean mint'}).getAttribute('aria-pressed'),'true');
  console.log('PASS full journey, eight stickers, pause, saved album and backpack',result, [...visited]);
} finally { await browser.close(); }
