/* Optional real Chromium checks. Install Playwright outside production.
 * Run: node tests/browser.cjs
 * Test server reproduces Pages metadata injection under /kody-skierowan/.
 */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),shots=path.join(root,'review/screenshots');
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
let browser;
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  let relative=decodeURIComponent(url.pathname).replace(/^\/kody-skierowan\//,'');
  if(!relative)relative='index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
  let content=fs.readFileSync(file);
  if(relative==='index.html')content=content.toString().replace('<script id="nfzmeta" type="application/json">{}</script>','<script id="nfzmeta" type="application/json">'+fs.readFileSync(path.join(root,'data/meta.json'),'utf8').replace(/<\//g,'<\\/')+'</script>');
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content);
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}/kody-skierowan/`;
  browser=await chromium.launch({headless:true});
  fs.mkdirSync(shots,{recursive:true});
  const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(new URL(r.url()).origin!==new URL(base).origin)external.push(r.url())});
  await page.goto(base);await page.locator('#catWrap').waitFor({state:'visible'});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  async function query(q){await page.locator('#q').fill(q);await page.waitForTimeout(180)}
  for(const theme of ['light','dark'])for(const width of [320,375,390,430,768,1024,1440]){
    await page.setViewportSize({width,height:900});await page.emulateMedia({colorScheme:theme,reducedMotion:'reduce'});
    for(const q of ['', 'usg tarczycy','88','4309','tarczyca kolano']){
      await query(q);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Horizontal overflow ${width} ${theme} ${q}`);
    }
    await query('usg tarczycy');
    await page.screenshot({path:path.join(shots,`${theme}-${width}.png`),fullPage:true});
    for(const selector of ['#clear','#results .code','#results .star']){
      const box=await page.locator(selector).first().boundingBox();assert(box.width>=44&&box.height>=44,`Small touch target ${selector}`);
    }
  }
  await page.locator('#results [data-copy="88.713"]').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'88.713');
  await page.locator('#results [data-fav="88.713"]').click();
  await page.reload();await page.locator('#favWrap').waitFor({state:'visible'});
  assert.equal(await page.locator('#favList [data-fav="88.713"]').getAttribute('aria-pressed'),'true');
  const notes=JSON.parse(fs.readFileSync(path.join(root,'data/icd9.json'))).notes;
  await query(Object.keys(notes)[0]);
  const noteButton=page.locator('[data-notes]').first();
  for(let i=0;i<2;i++){
    await noteButton.click();assert.equal(await noteButton.getAttribute('aria-expanded'),'true');
    await noteButton.click();assert.equal(await noteButton.getAttribute('aria-expanded'),'false');
  }
  await query('88');assert.equal(await page.locator('#results > .row').count(),60);
  await page.locator('[data-more]').click();assert.equal(await page.locator('#results > .row').count(),120);
  await query('');await page.locator('#catToggle').click();
  for(let i=0;i<3;i++){
    const next=page.locator('#catList [data-toggle][aria-expanded="false"]:visible').first();
    await next.click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await context.setOffline(true);await page.reload();await page.locator('#catWrap').waitFor({state:'visible'});
  await query('usg tarczycy');assert.equal(await page.locator('#results [data-copy="88.713"]').count(),1);
  assert(await page.locator('#networkStatus').isVisible());
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(external.length,0,external.join('\n'));
  await context.close();
  const failure=await browser.newContext({serviceWorkers:'block'}),bad=await failure.newPage();
  await bad.route('**/data/icd9.json',route=>route.abort());await bad.goto(base);
  await bad.locator('#loadMsg.error').waitFor();await failure.close();
  console.log('PASS: 7 widths × 2 themes; overflow, targets, clipboard, favorites reload, notes, pagination, hierarchy, offline, load error, JS/network.');
  console.log('MANUAL/SEPARATE: iOS Safari, Android, keyboard viewport, screen reader, zoom, old→new interrupted update, install PWA.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close();server.close()});
