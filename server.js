require('dotenv').config();
process.env.RENDER_URL="https://only-500v.onrender.com";
const express=require('express'),app=express(),http=require('http').createServer(app),{Server}=require('socket.io'),io=new Server(http),helmet=require('helmet'),fs=require('fs'),path=require('path');
const S=require('./modules/seguranca'),hosp=require('./modules/hospedagemAuto'),manut=require('./modules/cacheManutencao'),migra=require('./modules/migraLinks');
const DONO=process.env.DONO_ID,RAIZ=process.env.RENDER_URL;

// 1. SEGURANÇA E CABEÇALHOS
app.use(helmet({contentSecurityPolicy:false,hsts:true,crossOriginResourcePolicy:{policy:"cross-origin"}}));
app.use(require('cors')({origin:"*"}));
app.use(express.json());

// 🔴 MATAR O CACHE DEFINITIVAMENTE NAS ROTAS VISUAIS — ISSO ERA O MAIOR PROBLEMA
app.use((q,r,n)=>{
 r.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
 r.set("Pragma","no-cache");r.set("Expires","0");r.set("Surrogate-Control","no-store");
 r.locals.render=RAIZ;
 n();
});

// 2. 🖥️ ROTAS 100% VISUAIS — PRIMEIRO NA ORDEM, NUNCA MAIS JSON AQUI
app.use(express.static('public',{etag:false,lastModified:false,cacheControl:false,extensions:['html']}));
app.get('/',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.get(['/login','/entrar'],(q,r)=>r.redirect('/login.html'));
app.get('/login.html',(q,r)=>r.sendFile(path.join(__dirname,'public','login.html')));
app.get('/painel',(q,r)=>r.redirect('/'));

// 3. 🩺 ROTAS LEVES SAÚDE
app.get('/health',(q,r)=>r.json({status:"ONLINE",sistema:"ONLY TECH GOLD v3.1 DAORA",bots:"10/10",paineis_ativos:Object.keys(global.HOSP?.paineis||{}).length,ram_mb:Math.round(process.memoryUsage().rss/1048576),uptime:Math.floor(process.uptime()),ip_visitante:(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim(),render:RAIZ}));
app.get('/ping',(q,r)=>r.json({ok:1,pong:Date.now(),render:RAIZ}));

// 4. ⚙️ API SOMENTE A PARTIR DAQUI /api/*
app.use('/api/auth',require('./routes/auth'));
app.use('/api/dados',S.verifica,(q,r)=>{
 const d=JSON.parse(fs.readFileSync('./data/bots.json')),p=JSON.parse(fs.readFileSync('./data/paineis.json'));
 const eu=r.locals.user_id,tudo=eu===DONO;
 r.json({render:RAIZ,eu,dono:DONO,admin:tudo,oficiais:d.oficiais.map(b=>({...b,on:!!global.PID?.[b.arq]})),criados:tudo?d.criados:d.criados.filter(b=>b.usuario===eu),paineis:tudo?p.criados:p.criados.filter(x=>x.usuario===eu)})
});
app.use('/api/bots',S.verifica,require('./routes/bots'));
app.get('/api/migrar',S.verifica,(q,r)=>r.locals.user_id===DONO?r.json({ok:1,alterados:migra()}):r.status(403).json({ok:0}));

// 5. 🖥️ PAINÉIS DINÂMICOS CRIADOS PELO BOT — AGORA VALIDA E TESTA ANTES
app.get('/painel/:id',(q,r)=>{
 const id=q.params.id.split('-')[0],f=path.resolve(__dirname,'paineis/criados',id,'index.html');
 if(!fs.existsSync(f))return r.status(404).send('<body style="margin:0;background:#050806;color:#39ff14;display:grid;place-items:center;height:100vh"><h1>404 · PAINEL NÃO EXISTE</h1><p><a href="/" style="color:#39ff14">← voltar</a></p></body>');
 const db=JSON.parse(fs.readFileSync('./data/paineis.json')),p=db.criados.find(x=>x.id===id);
 const eu=q.headers['x-user-id']||q.query.uid||null;
 if(p&&p.usuario!==eu&&eu!==DONO)return r.status(403).send('<body style="margin:0;background:#050806;color:#ff4d4d;display:grid;place-items:center;height:100vh"><h1>🔒 ACESSO EXCLUSIVO DO DONO</h1></body>');
 r.sendFile(f);
});

app.get('/bot/:id',(q,r)=>{
 const b=global.HOSP?.bots?.[q.params.id];
 if(!b)return r.json({ok:0});
 const eu=q.headers['x-user-id']||null;
 r.json(b.usuario===eu||eu===DONO?{ok:1,...b,render:RAIZ}:{ok:0});
});

app.use((e,q,r,n)=>{S.log('ERRO',e.message);r.status(500).json({ok:0})});

// ✅ NA INICIALIZAÇÃO: 1) MIGRA TUDO QUE ESTAVA ERRADO → 2) LIGA TODOS → 3) AGENDA
http.listen(process.env.PORT||10000,async()=>{
 migra();
 await hosp.ligarTodosDoBanco();
 manut.iniciarAgenda();
 console.log("\n🟢 ONLY TECH GOLD 100% VIVO");
 console.log("🌐",RAIZ);
});

setInterval(()=>{try{const d=JSON.parse(fs.readFileSync('./data/bots.json'));io.emit('atualiza',{lista_bots:[...d.oficiais,...d.criados].map(b=>({...b,on:!!global.PID?.[b.arq]}))})}catch(e){}},3500);
