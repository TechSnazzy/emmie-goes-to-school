const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
for(const [name,width,height,url] of [['mobile',390,844,''],['mobile-play',390,844,'?scene=park'],['tablet',820,1180,''],['landscape',844,390,''],['park',1440,900,'?scene=park']]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<900});page.on('pageerror',e=>console.log('ERROR',name,e.message));
  await page.goto('http://127.0.0.1:8000/'+url);await page.waitForFunction(()=>window.__dbg?.frames>60);await page.screenshot({path:`/tmp/emmie-${name}.png`});
  console.log(name,await page.evaluate(()=>({scene:window.__dbg.scene,bodyOverflow:document.body.scrollWidth>innerWidth,button:document.querySelector('#btn-play').getBoundingClientRect().toJSON()})));await page.close();
}
await browser.close();
