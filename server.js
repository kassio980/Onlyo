require('dotenv').config();
const express=require('express'),app=express(),http=require('http').createServer(app),{Server}=require('socket.io'),io=new Server(http),helmet=require('helmet'),fs=require('fs'),path=require('path');
const S=require('./modules/seguranca'),hosp=require('./modules/hospedagemAuto'),manut=require('./modules/cacheManutencao');
const DONO=process.env.DONO_ID;

app.use(helmet({contentSecurityPolicy:false,hsts:true}));
app.get("/",(q,r)=>{if(q.headers.host?.includes("onlyo"))return r.redirect(301,"https://only-500v.onrender.com"+q.url);r.sendFile("public/index.html",{root:__dirname})});
app.use(require('cors')());
app.use(express.json());
app.use((q,r,n)=>{r.locals.user_id=q.headers['x-user-id']||null;n()});

app.get('/login.html',(q,r)=>r.sendFile('public/login.html',{root:__dirname}));
app.get('/',(q,r)=>r.sendFile('public/index.html',{root:__dirname}));
app.use(express.static('public'));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/dados',S.verifica,(q,r)=>{
 const d=JSON.parse(fs.readFileSync('./data/bots.json'));
 const p=JSON.parse(fs.readFileSync('./data/paineis.json'));
 const eu=r.locals.user_id;
 const podeTudo=eu===DONO;
 r.json({
  eu,dono:DONO,admin:podeTudo,
  oficiais:d.oficiais.map(b=>({...b,on:!!global.PID?.[b.arq]})),
  criados:podeTudo?d.criados.map(b=>({...b,on:!!global.PID?.[b.arq]})):d.criados.filter(b=>b.usuario===eu).map(b=>({...b,on:!!global.PID?.[b.arq]})),
  paineis:podeTudo?p.criados:p.criados.filter(x=>x.usuario===eu),
  render:process.env.RENDER_URL
 })
});
app.use('/api/bots',S.verifica,require('./routes/bots'));

// 🟢 ROTA PAINEL — SÓ DONO ACESSA TUDO / OUTROS SÓ O SEU
app.get('/painel/:id',(q,r)=>{
 const f=path.resolve(__dirname,'paineis/criados',q.params.id,'index.html');
 if(!fs.existsSync(f))return r.status(404).send('<h1 style="color:#39ff14;background:#050806;height:100vh;margin:0;display:grid;place-items:center">404</h1>');
 const db=JSON.parse(fs.readFileSync('./data/paineis.json'));
 const p=db.criados.find(x=>x.id===q.params.id);
 const eu=q.headers['x-user-id']||q.query.uid||null;
 if(!p)return r.status(404).end();
 if(p.usuario!==eu && eu!==DONO)return r.status(403).send('<h1 style="color:#ff4d4d;background:#050806;height:100vh;margin:0;display:grid;place-items:center">🔒 ACESSO EXCLUSIVO DO DONO</h1>');
 r.sendFile(f);
});

app.get('/bot/:id',(q,r)=>{
 const b=global.HOSP?.bots?.[q.params.id];
 if(!b)return r.json({ok:0});
 const eu=q.headers['x-user-id']||null;
 if(b.usuario!==eu && eu!==DONO)return r.status(403).json({ok:0,msg:'🔒 só dono'});
 r.json({ok:1,...b,render:process.env.RENDER_URL})
});

app.get('/api/hospedagem',S.verifica,(q,r)=>{
 if(r.locals.user_id!==DONO)return r.status(403).json({ok:0});
 r.json({render:process.env.RENDER_URL,bots:Object.values(global.HOSP?.bots||{}),paineis:Object.values(global.HOSP?.paineis||{}),uptime:Math.floor(process.uptime()),pid:process.pid})
});
app.get('/health',(q,r)=>r.json({status:'ONLINE',bots_oficiais:10,render:process.env.RENDER_URL}));
app.use((e,q,r,n)=>{S.log('ERRO',e.message);r.status(500).json({ok:0})});

http.listen(process.env.PORT||10000,async()=>{
 await hosp.ligarTodosDoBanco();
 manut.iniciarAgenda();
 console.log('🟢 RENDER VIVO ·',process.env.RENDER_URL)
});

setInterval(()=>{try{const d=JSON.parse(fs.readFileSync('./data/bots.json'));io.emit('atualiza',{lista_bots:[...d.oficiais,...d.criados].map(b=>({...b,on:!!global.PID?.[b.arq]}))})}catch(e){}},3500);
