const {spawn,execSync}=require('child_process'),fs=require('fs'),http=require('http'),L=require('./seguranca').log;
module.exports={
 async bot(cod,arq){
  try{
   L('TESTE','🤖 iniciando validação 3 etapas');
   fs.writeFileSync(arq,cod);execSync(`node --check "${arq}"`,{timeout:6000});L('TESTE','✅ sintaxe OK');
   const s=spawn('node',[arq],{stdio:'pipe'});
   const ok=await new Promise(r=>{let t=setTimeout(()=>{s.kill();r(false)},7000);s.stdout.on('data',d=>{if(String(d).includes('ONLINE')||String(d).includes('✅')){clearTimeout(t);s.kill();r(true)}})});
   L('TESTE',ok?'✅ conexão OK':'❌ falhou');fs.unlinkSync(arq);return ok;
  }catch(e){L('TESTE','❌ '+e.message);return false}
 },
 async painel(html,dir){
  try{
   L('TESTE','🖥️ teste HTTP');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/index.html',html);
   const srv=http.createServer((q,r)=>r.end(fs.readFileSync(dir+'/index.html'))).listen(10001);
   const st=await new Promise(r=>http.get('http://127.0.0.1:10001/',res=>{res.resume();res.on('end',()=>{srv.close();r(res.statusCode)})}).on('error',()=>r(0)));
   fs.rmSync(dir,{recursive:true});L('TESTE',st===200?`✅ HTTP ${st}`:`❌ ${st}`);return st===200;
  }catch(e){return false}
 },
 token(t){return /^[MN][a-zA-Z0-9_\-\.]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+$/.test(t)}
}
