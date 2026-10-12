const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');const {characters:c}=JSON.parse(fs.readFileSync(path.join(root,'data/characters.json')));
assert.equal(c.length,124);for(const field of ['id','name_ja','reading_ja','name_romaji'])assert.equal(new Set(c.map(x=>x[field])).size,124);
assert.equal(c.filter(x=>x.question_kind==='portrait').length,123);const h=c.find(x=>x.id==='haitani');assert.equal(h.portrait,null);assert.equal(h.question_kind,'record');
assert.deepEqual(c.filter(x=>x.status!=='core').map(x=>x.id),Array.from({length:113},(_,i)=>'r'+String(i+1).padStart(3,'0')));
for(const x of c){assert.match(x.reading_ja,/^[ぁ-ゖー]+ [ぁ-ゖー]+$/);assert.match(x.name_romaji,/^[A-Z][a-z]+ [A-Z][a-z]+$/);if(x.portrait)assert.ok(fs.existsSync(path.join(root,'public',x.portrait.src)));}
const {assets}=JSON.parse(fs.readFileSync(path.join(root,'data/asset-manifest.json')));for(const a of assets){assert.ok(/^assets\/[a-z0-9./-]+$/.test(a.file));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public',a.file))).digest('hex'),a.sha256);}
console.log(JSON.stringify({characters:124,portraits:123,record:1,assetHashes:assets.length,pass:true}));
