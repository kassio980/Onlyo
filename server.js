require('dotenv').config();
process.env.RENDER_URL="https://only-500v.onrender.com";
const express=require('express'),app=express(),http=require('http').createServer(app),{Server}=require('socket.io'),io=new Server(http),helmet=require('helmet'),fs=require('fs'),path=require('path');
const S=require('./modules/seguranca'),hosp=require('./modules/hospedagemAuto'),manut=require('./modules/cacheManutencao');
const DONO=process.env.DONO_ID;

app.use(helmet({contentSecurityPolicy:false,hsts:true,crossOriginResourcePolicy:{policy:"cross-origin"}}));
app.use(require('cors')({origin:"*"}));
app.use(express.json());
app.use((q,r,n)=>{r.locals.render=process.env.RENDER_URL;r.set("x-powered-by","ONLY TECH GOLD");n()});

// 🔴 1º — ARQUIVOS VISUAIS E TELA PRINCIPAL (ISSO RESOLVE O JSON NA TELA)
app.use(express.static('public',{maxAge:"1h",extensions:['html']}));
app.get('/',(q,r)=>r.sendFile(path.join(__dirname,'public','index.html')));
app.get('/login',(q,r)=>r.redirect('/login.html'));
app.get('/login.html',(q,r)=>r.sendFile(path.join(__dirname,'public','login.html')));

// 🟡 2º — ROTAS DADOS E API
app.use('/api/auth',require('./routes/auth'));
app.use('/api/dados',S.verifica,(q,r)=>{
 const d=JSON.parse(fs.readFileSync('./data/bots.json')),p=JSON.parse(fs.readFileSync('./data/paineis.json'));
 const eu=r.locals.user_id,tudo=eu===DONO;
 r.json({render:process.env.RENDER_URL,eu,dono:DONO,admin:tudo,oficiais:d.oficiais.map(b=>({...b,on:!!global.PID?.[b.arq]})),criados:tudo?d.criados:d.criados.filter(b=>b.usuario===eu),paineis:tudo?p.criados:p.criados.filter(x=>x.usuario===eu)})
});
app.use('/api/bots',S.verifica,require('./routes/bots'));
app.get('/api/hospedagem',S.verifica,(q,r)=>r.locals.user_id===DONO?r.json({render:process.env.RENDER_URL,bots:Object.values(global.HOSP?.bots||{}),paineis:Object.values(global.HOSP?.paineis||{}),uptime:Math.floor(process.uptime()),pid:process.pid}):r.status(403).json({ok:0}));

// 🟢 3º — ROTAS LEVES SAÚDE / KEEP‑ALIVE
app.get('/health',(q,r)=>r.json({status:"ONLINE",sistema:"ONLY TECH GOLD v3.1 DAORA",bots:"10/10",paineis_ativos:Object.keys(global.HOSP?.paineis||{}).length,ram_mb:Math.round(process.memoryUsage().rss/1048576),uptime:Math.floor(process.uptime()),ip_visitante:(q.headers['x-forwarded-for']||q.socket.remoteAddress||'').split(',')[0].trim()}));
app.get('/ping',(q,r)=>r.json({ok:1,pong:Date.now(),render:process.env.RENDER_URL}));

// 🟠 4º — PAINÉIS DINÂMICOS CRIADOS AUTOMÁTICO /painel/ID‑IP
app.get('/painel/:id',(q,r)=>{
 const id=q.params.id,f=path.resolve(__dirname,'paineis/criados',id.split('-')[0],'index.html');
 if(!fs.existsSync(f))return r.status(404).send('<body style="margin:0;background:#050806;color:#39ff14;display:grid;place-items:center;height:100vh;font-family:system-ui"><h1>404 · PAINEL NÃO EXISTE</h1></body>');
 const db=JSON.parse(fs.readFileSync('./data/paineis.json')),p=db.criados.find(x=>x.id===id.split('-')[0]);
 const eu=q.headers['x-user-id']||q.query.uid||null;
 if(!p)return r.status(404).end();
 if(p.usuario!==eu && eu!==DONO)return r.status(403).send('<body style="margin:0;background:#050806;color:#ff4d4d;display:grid;place-items:center;height:100vh"><h1>🔒 ACESSO EXCLUSIVO DO DONO</h1></body>');
 r.sendFile(f);
});
app.get('/bot/:id',(q,r)=>{
 const b=global.HOSP?.bots?.[q.params.id];
 if(!b)return r.json({ok:0});
 const eu=q.headers['x-user-id']||null;
 r.json(b.usuario===eu||eu===DONO?{ok:1,...b,render:process.env.RENDER_URL}:{ok:0,msg:"🔒 só dono"})
});

app.use((e,q,r,n)=>{S.log('ERRO',e.message);r.status(500).json({ok:0})});

http.listen(process.env.PORT||10000,async()=>{
 await hosp.ligarTodosDoBanco();
 manut.iniciarAgenda();
 console.log("\n🟢 ONLY TECH GOLD VIVO 100%");
 console.log("🌐",process.env.RENDER_URL);
 console.log("🩺 :"+(process.env.PORT||10000));
});

setInterval(()=>{try{const d=JSON.parse(fs.readFileSync('./data/bots.json'));io.emit('atualiza',{lista_bots:[...d.oficiais,...d.criados].map(b=>({...b,on:!!global.PID?.[b.arq]}))})}catch(e){}},3500);
