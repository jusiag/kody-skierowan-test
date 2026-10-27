// Executes the actual production search functions in Node, without rewriting them.
// Browser behavior is covered separately by browser.spec.cjs.
const fs = require('node:fs');
const vm = require('node:vm');
const zlib = require('node:zlib');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const output = path.join(__dirname, 'search-baseline.json.gz');
const queries = ['usg tarczycy','rtg klatki','kolano','rehabilitacja','93.11','88','1308','4308','4309','fizjoterapia kardiologiczna','a','tarczyca kolano','zzzzzzzz','usg','mr','mri','rm','tk','ct','ekg','eeg','emg','ktg','pet','88.7'];
function run(dir) {
  const data = JSON.parse(fs.readFileSync(path.join(dir,'data/icd9.json')));
  const elements = new Map();
  const element = () => ({textContent:'{}',value:'',hidden:false,innerHTML:'',getAttribute:()=> 'false',addEventListener(){}});
  const context = {window:{},document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},addEventListener(){}},localStorage:{getItem(){return null}},location:{href:'https://example.test/kody-skierowan/'},URL,setTimeout,clearTimeout,console,DATA_INPUT:data};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(dir,'resort.js'),'utf8'),context);
  let source=fs.readFileSync(path.join(dir,'app.js'),'utf8');
  // Strip UI side effects inside load, but retain index construction verbatim.
  const begin=source.indexOf('    $("verChip").textContent');
  const end=source.indexOf('\n  const JOINTS',begin);
  source=source.slice(0,begin)+'  }\n'+source.slice(end);
  source=source.replace('  boot();','  load(DATA_INPUT); window.testAPI = {search, resSearch, highlight};');
  vm.runInContext(source,context);
  return Object.fromEntries(queries.map(q=>{
    const result=q.trim().length===1?{short:true}:context.window.testAPI.search(q);
    return [q,JSON.parse(JSON.stringify({result,resort:context.window.testAPI.resSearch(q)}))];
  }));
}
const actual=run(root);
if(process.argv.includes('--record')){
  assert(!fs.existsSync(output),'Baseline already exists; do not overwrite reference.');
  fs.writeFileSync(output,zlib.gzipSync(JSON.stringify(actual))); 
  console.log('Recorded',queries.length,'queries from',root);
}else{
  assert.deepEqual(actual,JSON.parse(zlib.gunzipSync(fs.readFileSync(output))), 'Search results/order/context differ from baseline');
  console.log('PASS:',queries.length,'queries: complete results, order, hierarchy, resort codes');
}
