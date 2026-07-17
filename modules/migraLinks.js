const fs=require('fs'),path=require('path');
const CORRETO=process.env.RENDER_URL||"https://only-500v.onrender.com";
const ERRADOS=["onlyo.onrender.com","only.onrender.com","localhost:10000","127.0.0.1:10000"];
function trocaEm(arquivo){
 if(!fs.existsSync(arquivo))return;
 let t=fs.readFileSync(arquivo,'utf8'),m=0;
 ERRADOS.forEach(e=>{const r=new RegExp(e,'gi');m+=(t.match(r)||[]).length;t=t.replace(r,CORRETO.replace("https://",""));t=t.replace(new RegExp("https?://"+e.replace(/\./g,"\\."),"gi"),CORRETO)});
 fs.writeFileSync(arquivo,t);return m;
}
module.exports=function migraTudo(){
 let total=0;
 total+=trocaEm('./data/bots.json');
 total+=trocaEm('./data/paineis.json');
 total+=trocaEm('./data/usuarios.json');
 // Também percorre painéis físicos já criados
 if(fs.existsSync('./paineis/criados'))fs.readdirSync('./paineis/criados').forEach(id=>{
  const f=path.join('./paineis/criados',id,'index.html');
  total+=trocaEm(f);
 });
 if(total>0)console.log(`🔄 MIGRAÇÃO: ${total} ocorrências antigas corrigidas → ${CORRETO}`);
 else console.log("✅ Links já 100% corretos em todo sistema");
 return total;
}
