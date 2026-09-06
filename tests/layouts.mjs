const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
try {
for(const [name,width,height,url] of [['desktop',1440,900,''],['small-phone',320,568,''],['small-end',320,568,'?scene=end'],['mobile',390,844,''],['mobile-play',390,844,'?scene=park'],['tablet',820,1180,''],['landscape',844,390,''],['landscape-end',844,390,'?scene=end'],['small-landscape',667,375,''],['small-landscape-end',667,375,'?scene=end'],['park',1440,900,'?scene=park']]){
  const errors=[];
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<900});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8000/'+(url==='?scene=end'?'':url));
  await page.waitForFunction(()=>window.__dbg?.frames>60);
  if(url==='?scene=end') {
    // Layout fixture: include the largest possible collection on the end screen.
    await page.evaluate(async()=>{
      const {STICKERS,collectSticker}=await import('/src/adventure.js');
      STICKERS.forEach(s=>collectSticker(s.id));
      (await import('/src/router.js')).go('end');
    });
    await page.waitForFunction(()=>window.__dbg.scene==='end');
    await page.waitForTimeout(700);
  }
  await page.screenshot({path:`/tmp/emmie-${name}.png`});
  const layout=await page.evaluate(()=>({scene:window.__dbg.scene,bodyOverflow:document.body.scrollWidth>innerWidth}));
  assert.deepEqual(errors,[],name); assert.equal(layout.bodyOverflow,false,name);
  const button=page.locator(layout.scene==='end'?'#btn-replay':layout.scene==='title'?'#btn-play':'#btn-guide');
  const box=await button.boundingBox();
  assert.ok(box && box.x>=0 && box.y>=0 && box.x+box.width<=width && box.y+box.height<=height,`${name}: primary button must fit`);
  if(layout.scene==='title') {
    for(const choice of await page.locator('.pack-choice').all()) {
      const pack=await choice.boundingBox();
      assert.ok(pack.x+pack.width<=box.x || pack.x>=box.x+box.width || pack.y+pack.height<=box.y || pack.y>=box.y+box.height,`${name}: backpack and Play must not overlap`);
    }
  }
  console.log('PASS layout',name);await page.close();
}
} finally { await browser.close(); }
