const fs=require('fs'),path=require('path'),os=require('os'),{execSync}=require('child_process'),L=require('./seguranca').log,hosp=require('./hospedagemAuto');
const MAX_LOG=1024*500; // 500KB por log
const DIAS_LOG=7;

// 🧹 LIMPA TUDO DE UMA VEZ
function limparTudo(motivo='manual'){
 const antes=process.memoryUsage().rss;
 // 1) Cache de módulos Node
 for(const k in require.cache)if(!k.includes('node_modules')&&!k.includes('server.js'))delete require.cache[k];
 // 2) Arquivos temporários /tmp
 try{fs.readdirSync('/tmp').filter(f=>f.startsWith('_tb')||f.startsWith('_tp')||f.startsWith('npm-')).forEach(f=>{try{fs.rmSync('/tmp/'+f,{recursive:true,force:true})}catch(e){}})}catch(e){}
 // 3) Arquivos .log grandes → trunca
 fs.readdirSync('./logs').forEach(f=>{
  const p='./logs/'+f;try{if(fs.statSync(p).size>MAX_LOG){fs.writeFileSync(p,'[LIMPEZA AUTOMÁTICA] '+new Date().toISOString()+'\n')}}catch(e){}
 });
 // 4) Remove logs +7 dias
 const agora=Date.now();
 const logs=JSON.parse(fs.readFileSync('./data/logs.json'));
 fs.writeFileSync('./data/logs.json',JSON.stringify(logs.filter(x=>agora - new Date(x.txt.split(']')[0].replace('[','')).getTime() < DIAS_LOG*86400000).slice(0,150)));
 // 5) Processos zumbis / node soltos sem PID
 try{execSync("ps aux | grep 'node bots/criados' | grep -v grep | awk '{print $2}'").toString().trim().split('\n').filter(Boolean).forEach(pid=>{
  if(!Object.values(global.PID||{}).includes(+pid))try{process.kill(+pid,'SIGKILL')}catch(e){}
 })}catch(e){}
 // 6) Força GC se disponível
 try{if(global.gc)global.gc()}catch(e){}
 const depois=process.memoryUsage().rss;
 const info=`🧹 CACHE LIMPO · motivo:${motivo} · RAM ${((antes-depois)/1048576).toFixed(1)}MB liberado · ${Object.keys(global.PID||{}).length} processos ativos`;
 L('LIMPEZA',info);return info;
}

// ⚙️ MANUTENÇÃO COMPLETA
function manutencaoGeral(){
 L('MANUTENÇÃO','⚙️ Iniciando rotina completa');
 limparTudo('manutencao');
 // Reinicia bots que travou / sem resposta
 for(const id in global.HOSP.bots){
  const b=global.HOSP.bots[id];
  try{process.kill(b.pid,0)}catch(e){
   L('MANUTENÇÃO',`🔄 ${b.nome} morto → subindo novamente`);
   hosp.ligarBot(id,b.arq,b.nome,b.usuario);
  }
 }
 // Reseta diário meia‑noite
 const h=new Date();if(h.getHours()===0&&h.getMinutes()<6){
  const s=JSON.parse(fs.readFileSync('./data/stats.json'));
  s.grafico={};fs.writeFileSync('./data/stats.json',JSON.stringify(s));
  L('MANUTENÇÃO','📅 Contadores diários zerados');
 }
 L('MANUTENÇÃO','✅ Finalizada');
}

// ⏰ Agenda: cache a cada 1H, manutenção completa a cada 6H
function iniciarAgenda(){
 setInterval(()=>limparTudo('agendado 1h'),3600_000);
 setInterval(manutencaoGeral,21600_000);
 L('AGENDA','⏰ Cache=1h · Manutenção=6h · RODANDO');
}

module.exports={limparTudo,manutencaoGeral,iniciarAgenda};
