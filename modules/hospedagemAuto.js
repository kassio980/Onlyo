const {spawn}=require('child_process'),fs=require('fs'),path=require('path'),L=require('./seguranca').log,deploy=require('./deployRender');
global.PID=global.PID||{}; // { arquivo: pid }
global.HOSP=global.HOSP||{bots:{},paineis:{},iniciado:Date.now()};

// ✅ Inicia um bot e mantém vivo PARA SEMPRE dentro do Render
async function ligarBot(id,arq,nome,usuario){
 try{
  const caminho=path.resolve(__dirname,'../',arq);
  if(!fs.existsSync(caminho))return L('HOSPEDAGEM',`❌ ${arq} não existe`);
  if(global.PID[arq])try{process.kill(global.PID[arq],'SIGKILL')}catch(e){}
  const p=spawn('node',[caminho],{detached:true,stdio:'ignore',env:{...process.env,BOT_ID:id,BOT_CRIADOR:usuario,HOSPEDADO:'RENDER'}});
  p.unref();global.PID[arq]=p.pid;
  global.HOSP.bots[id]={id,arq,nome,usuario,pid:p.pid,iniciado:Date.now(),reinicios:0,status:'ONLINE',link:`${process.env.RENDER_URL}/bot/${id}`};
  p.on('exit',async(cod)=>{
   L('HOSPEDAGEM',`⚠️ ${nome} caiu (${cod}) → REINICIANDO AUTOMÁTICO`);
   const b=global.HOSP.bots[id];if(!b)return;
   if(b.reinicios<50){b.reinicios++;setTimeout(()=>ligarBot(id,arq,nome,usuario),2200);}
  });
  L('HOSPEDAGEM',`✅ HOSPEDADO NO RENDER · ${nome} → ${process.env.RENDER_URL}/bot/${id}`);
  return global.HOSP.bots[id];
 }catch(e){L('HOSPEDAGEM','❌ erro: '+e.message);return null}
}

// ✅ Registra painel 100% DENTRO do seu Render, rota nativa
async function registrarPainel(id,usuario){
 const caminho=path.resolve(__dirname,'../paineis/criados',id);
 if(!fs.existsSync(caminho+'/index.html'))return null;
 global.HOSP.paineis[id]={id,usuario,criado:Date.now(),link:`${process.env.RENDER_URL}/painel/${id}`,hospedado:'RENDER'};
 L('HOSPEDAGEM',`✅ PAINEL INTEGRADO → ${process.env.RENDER_URL}/painel/${id}`);
 return global.HOSP.paineis[id];
}

// ✅ Sobe TODOS os bots criados novamente ao REINICIAR o Render
async function ligarTodosDoBanco(){
 const db=JSON.parse(fs.readFileSync('./data/bots.json'));
 for(const b of db.criados.filter(x=>x.on!==false))await ligarBot(b.id,b.arq,b.nome,b.usuario||'auto');
 L('HOSPEDAGEM',`🚀 ${Object.keys(global.HOSP.bots).length} bots já estão ONLINE no seu Render`);
}

// ✅ Para definitivamente
function pararBot(arq){
 try{if(global.PID[arq])process.kill(global.PID[arq],'SIGKILL')}catch(e){}
 delete global.PID[arq];
 for(const k in global.HOSP.bots)if(global.HOSP.bots[k].arq===arq)global.HOSP.bots[k].status='PARADO';
}

module.exports={ligarBot,registrarPainel,ligarTodosDoBanco,pararBot};
