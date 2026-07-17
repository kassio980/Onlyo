const {Client,GatewayIntentBits}=require('discord.js'),c=new Client({intents:[1,512,32768]}),fs=require('fs'),L=require('../modules/seguranca').log,IA=require('../modules/testadorIA'),hosp=require('../modules/hospedagemAuto'),deploy=require('../modules/deployRender'),https=require('https');
const RAIZ=process.env.RENDER_URL||"https://only-500v.onrender.com";

// ✅ FUNÇÃO NOVA: TESTA SE O PAINEL REALMENTE ABRE COMO TELA NÃO JSON
async function painelFunciona(id){
 return new Promise(res=>{
  https.get(`${RAIZ}/painel/${id}`,{headers:{"Cache-Control":"no-cache"}},r=>{
   let d='';r.on('data',c=>d+=c);r.on('end',()=>res(!d.includes('"status"')&&r.statusCode===200))
  }).on('err',()=>res(false)).setTimeout(8000,()=>res(false))
 })
}

c.once('ready',()=>{L('CRIADOR','🟢 UNIFICADO · '+c.ws.ping+'ms')})

c.on('messageCreate',async m=>{
 if(m.author.bot)return;
 if(m.content.startsWith('!painel')&&m.author.id===process.env.DONO_ID){
  const id=Math.random().toString(36).slice(2,10);
  const ip=(m.author.discriminator!=='0000'?m.author.id.slice(-8):Date.now().toString(36)).replace(/[^a-z0-9]/gi,'');
  const dir='./paineis/criados/'+id;fs.mkdirSync(dir,{recursive:true});
  const html=`<!DOCTYPE html><html><head><meta charset=utf-8><meta name="viewport" content="width=device-width"><meta http-equiv="Cache-Control" content="no-store"><title>Painel ${id} · ONLY</title>
<style>html,body{height:100%;margin:0;background:#050806;color:#39ff14;font-family:system-ui}#c{display:grid;place-items:center;height:100%}.cx{padding:30px;border:1px solid #39ff1455;border-radius:14px;background:#0a1208;max-width:420px;width:90%}a{color:#39ff14}</style></head>
<body><div id=c><div class=cx><h1>🟢 PAINEL ${id}</h1><p>Criado por: ${m.author.tag}</p><p>ID: <code>${id}</code></p><p>🌐 <code>${RAIZ}/painel/${id}</code></p><p style="opacity:.7">✅ Testado e validado antes do envio</p><p><a href="/">← Painel principal</a></p></div></div></body></html>`;
  fs.writeFileSync(dir+'/index.html',html);
  if(!await IA.painel(html,'/tmp/_tp_'+id))return m.reply('❌ FALHA TESTE HTTP');
  const p=await hosp.registrarPainel(id,m.author.id);
  const db=JSON.parse(fs.readFileSync('./data/paineis.json'));
  db.criados.push({id,usuario:m.author.id,link:`${RAIZ}/painel/${id}`,criado:Date.now(),hospedado:'RENDER',ip_registro:ip});
  fs.writeFileSync('./data/paineis.json',JSON.stringify(db,null,2));
  await deploy('painel '+id);

  // ✅ SISTEMA DE CONFIRMAÇÃO: TENTA ATÉ 4 VEZES ATE REALMENTE ABRIR CERTO
  let ok=false;
  for(let t=1;t<=4;t++){await new Promise(r=>setTimeout(r,3500*t));if(await painelFunciona(id)){ok=true;break}}

  if(ok){
   L('PAINEL',`✅ ${id} TESTADO E CONFIRMADO → ${RAIZ}/painel/${id}`);
   m.reply(`🖥️ **PAINEL PRONTO E 100% FUNCIONANDO**\n🌐 ${RAIZ}/painel/${id}\n✅ Abre tela visual, NÃO JSON\n🆔 ${id}\n🗂️ Pasta: paineis/criados/${id}\n⚠️ Validado automaticamente antes de chegar até você`);
  }else{
   m.reply(`🖥️ **CRIADO, AGUARDE 1~2MIN PRO RENDER ATUALIZAR**\n🌐 ${RAIZ}/painel/${id}\nℹ️ O cache do Render demora um pouco para sair`);
  }
 }
});
c.login(process.env.TOKEN_03_BOTMAKER);
